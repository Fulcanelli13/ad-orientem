/*
 * Living Catena editorial discovery (research-only).
 * Uses pre-existing, AI-reviewed editorial reader questions as navigation;
 * EVERY visible patristic word must be loaded from the pinned canonical Catena.
 * This module never generates Father speech, translates text or certifies works.
 */
import {loadCatenaForPassage} from "./catena-inline.js";
const WORDS=new Set("a an and are as at be but by can did do does for from how i in is it its me my of on or our say says should that the their them these this to was were what when where which who why will with would you your verse verses passage about meaning mean does into after before".split(" "));
const SPELL=Object.freeze({jesus:"christ",jesu:"christ",apostles:"apostle",disciples:"disciple",fathers:"father",gospels:"gospel",genealogies:"genealogy"});
function normalize(input){
 return String(input||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim();
}
function tokens(str){
 return [...new Set(normalize(str).split(/\s+/).filter(x=>x.length>=4&&!WORDS.has(x))
   .map(x=>SPELL[x]||((x.endsWith("ies")&&x.length>6)?x.slice(0,-3)+"y":((x.endsWith("s")&&x.length>5&&!x.endsWith("ss"))?x.slice(0,-1):x))))];
}
export function parseMatthewReference(input){
 const text=String(input||"");
 if(/\b(?:mark|luke|john)\s+\d{1,2}:\d{1,3}/i.test(text))
  return {unsupportedBook:true,reference:null,remainder:text};
 const pattern=/\b(?:(matthew|matt|mt)\.?\s+)?(\d{1,2}):(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\b/i;
 const m=pattern.exec(text);
 if(!m)return {unsupportedBook:false,reference:null,remainder:text};
 // An unqualified chapter:verse is accepted only if it is the entire input.
 if(!m[1]&&text.replace(m[0],"").trim())
  return {unsupportedBook:false,reference:null,remainder:text};
 const chapter=Number(m[2]),start=Number(m[3]),end=Number(m[4]||m[3]);
 if(chapter<1||chapter>28||start<1||end>200||end<start||end-start>30)
  return {unsupportedBook:true,reference:null,remainder:text};
 return {unsupportedBook:false,reference:{chapter,verseStart:start,verseEnd:end},
  remainder:text.slice(0,m.index)+" "+text.slice(m.index+m[0].length)};
}
function verseKeys(parsed){
 if(!parsed)return null;
 const keys=new Set();
 for(let v=parsed.verseStart;v<=parsed.verseEnd;v++)keys.add("matthew/"+parsed.chapter+"/"+v);
 return keys;
}
function supportForQuestion(query,editorial){
 const asked=tokens(query),target=new Set(tokens(editorial));
 if(!asked.length)return null;
 const matched=asked.filter(t=>target.has(t));
 if(matched.length<2&&(asked.length!==1||!matched.length||asked[0].length<5))return null;
 // Explicit unsupported extra concepts should cause abstention, not a
 // plausible-looking but spurious patristic answer.
 const coverage=matched.length/asked.length;
 if(asked.length>=3&&coverage<0.5)return null;
 return {score:Math.round(100*coverage)+matched.length*6,matched};
}
function safeSource(url){try{const u=new URL(url);return u.protocol==="https:"&&u.hostname==="www.ecatholic2000.com"?u.href:null}catch{return null}}
export function createCatenaResearchRegistry(catalogue,comparisons,sourceIndex){
 if(catalogue?.schema!=="ao.catena.matthew-reader-catalogue.v1"||
 comparisons?.schema!=="ao.catena.matthew-reader-comparison-routes.v1"||
 sourceIndex?.schema!=="ao.catena.first-pass-book.v1"||
 catalogue.records?.length!==192||comparisons.records?.length!==31||
 sourceIndex.rows?.length!==4825||sourceIndex.pericopeGroups?.length!==278)
   throw new Error("CATENA_RESEARCH_METADATA_NOT_VERIFIED");
 const rows=new Map(sourceIndex.rows.map(r=>[r[0]+":"+r[1],r]));
 const pericopes=new Map(sourceIndex.pericopeGroups.map(p=>[p[0],p[1]]));
 const registered=new Map();
 for(const r of catalogue.records){
  const row=rows.get(r.sourcePointer);
  if(!row||registered.has(r.sourcePointer)||row[2]!==r.inheritedFatherLabel||
   row[5]!==r.originalCharacterCount||r.publicationEligibility!=="blocked_research_only"||
   r.humanApproved!==false||r.sourceText!=="canonical_pointer_only"||
   !Array.isArray(r.editorialQuestions)||!r.editorialQuestions.length||
   !r.editorialQuestions.every(q=>q.endsWith("?"))||
   !pericopes.has(r.pericopeId)||r.sourcePointer.split(":")[0]!==r.pericopeId)
    throw new Error("CATENA_RESEARCH_ENTRY_INVALID");
  registered.set(r.sourcePointer,r);
 }
 const groups=comparisons.records.map(g=>{
  if(g.publicationEligibility!=="blocked_research_only"||g.humanApproved!==false||
   !g.neverSynthesizeOrMergeAuthorSpeech||!g.modernEditorialReaderQuestion?.endsWith("?")||
   g.sourcePointers?.length<2||
   g.sourcePointers.some((p,i)=>!registered.has(p)||
    registered.get(p).inheritedFatherLabel!==g.separateInheritedAuthorLabels[i]))
   throw new Error("CATENA_RESEARCH_COMPARISON_INVALID");
  return g;
 });
 return Object.freeze({entries:registered,groups,pericopes});
}
export function searchCatenaResearch(registry,input,{limit=12,author=""}={}){
 if(!registry?.entries||!registry?.pericopes)return [];
 const parsed=parseMatthewReference(input);
 if(parsed.unsupportedBook)return [];
 const keys=verseKeys(parsed.reference),query=parsed.remainder.trim(),authorFilter=normalize(author);
 if(!keys&&!tokens(query).length)return [];
 const eligible=p=>{
  const r=registry.entries.get(p);
  return Boolean(r&&(!authorFilter||normalize(r.inheritedFatherLabel)===authorFilter)&&
   (!keys||registry.pericopes.get(r.pericopeId)?.some(k=>keys.has(k))));
 };
 const matches=[];
 for(const group of registry.groups){
  const pointers=group.sourcePointers.filter(eligible);
  if(!pointers.length)continue;
  const score=query?supportForQuestion(query,group.modernEditorialReaderQuestion):{score:0,matched:[]};
  if(!score)continue;
  matches.push({kind:"comparison",id:group.routeId,question:group.modernEditorialReaderQuestion,
   pointers,score:score.score+12,relation:group.sourceRelation,
   caution:group.interpretativeCaution,editorialResearchOnly:true});
 }
 for(const r of registry.entries.values()){
  if(!eligible(r.sourcePointer))continue;
  const ranked=query?r.editorialQuestions.map(q=>({q,score:supportForQuestion(query,q)}))
     .filter(x=>x.score).sort((a,b)=>b.score.score-a.score.score)[0]:
     {q:r.editorialQuestions[0],score:{score:0}};
  if(!ranked)continue;
  matches.push({kind:"single",id:r.sourcePointer,question:ranked.q,
   pointers:[r.sourcePointer],score:ranked.score.score,
   caution:r.AIReviews.map(x=>x.caveat).filter(Boolean).join(" "),
   editorialResearchOnly:true});
 }
 matches.sort((a,b)=>b.score-a.score||(a.kind==="comparison"?-1:1)||
  a.question.localeCompare(b.question));
 return matches.slice(0,Math.max(1,Math.min(30,limit)));
}
export function deriveCatenaHumanReviewQueue(registry,{limit=30}={}){
 const direct=new Set(["argument_in_excerpt","supported_in_same_excerpt","supported_within_excerpt","direct","direct_brief","direct_with_qualifications"]);
 const disqualifying=new Set(["partial_context_required","incomplete_fragment_context","needs_adjacent_context","attribution_uncertain","attribution_mixed_inside_fragment","mixed_author_blocked","multi_argument_requires_partition","multi_stage_alternatives","competing_interpretations_in_excerpt","multiple_explanations_in_excerpt","direct_alternatives"]);
 const records=[...registry.entries.values()].filter(r=>
  !r.AIReviewerDisagreement&&!r.confirmedIntraFragmentAuthorSplit&&
  !/pseudo|gloss/i.test(r.inheritedFatherLabel)&&
  r.AIReviews.length&&r.AIReviews.some(x=>direct.has(x.contextualScope))&&
  !r.AIReviews.some(x=>disqualifying.has(x.contextualScope))
 ).map(r=>({sourcePointer:r.sourcePointer,inheritedFatherLabel:r.inheritedFatherLabel,
   proposedReaderQuestion:r.editorialQuestions[0],humanReviewStatus:"unreviewed",
   needs:["exact_original_excerpt","speaker_and_context","original_work_attribution",
    "translation_and_edition_rights","independent_second_editor"],
   priority:r.AIReviews.length*100+Math.min(999,r.originalCharacterCount)/20}));
 records.sort((a,b)=>b.priority-a.priority||a.sourcePointer.localeCompare(b.sourcePointer));
 return records.slice(0,Math.max(0,Math.min(100,limit)));
}
export async function loadCatenaResearchExcerpt(registry,pointer,{
 loader=loadCatenaForPassage,anomalies=[],options={}
}={}){
 const r=registry?.entries?.get(pointer);
 if(!r)throw new Error("CATENA_UNKNOWN_RESEARCH_POINTER");
 const keys=registry.pericopes.get(r.pericopeId);
 if(!keys?.length)throw new Error("CATENA_MISSING_VERSE_CONTEXT");
 const m=/^matthew\/(\d+)\/(\d+)$/.exec(keys[0]);
 if(!m)throw new Error("CATENA_BAD_VERSE_CONTEXT");
 const source=await loader({book:"Matthew",chapter:Number(m[1]),verseStart:Number(m[2]),verseEnd:Number(m[2])},options);
 const section=source.find(p=>p.id===r.pericopeId);
 const ordinal=Number(pointer.slice(pointer.lastIndexOf(":")+1));
 const fragment=section?.segments?.[ordinal];
 if(!Number.isInteger(ordinal)||!fragment||fragment.father!==r.inheritedFatherLabel||
    fragment.text.length!==r.originalCharacterCount||!safeSource(section?.source?.url))
  throw new Error("CATENA_CANONICAL_EXCERPT_MISMATCH");
 const anomaly=anomalies.find(x=>x.sourcePointer===pointer);
 let units;
 if(r.confirmedIntraFragmentAuthorSplit){
  if(!anomaly||anomaly.units?.length!==2||anomaly.fullFragmentCharacterLength!==fragment.text.length)
   throw new Error("CATENA_MIXED_OWNER_BOUNDARIES_REQUIRED");
  const u=anomaly.units;
  if(u[0].range.start!==0||u[0].range.endExclusive!==u[1].range.start||
    u[1].range.endExclusive!==fragment.text.length||
    u[0].printedAttribution!==r.inheritedFatherLabel||
    u[1].printedAttribution!=="Pseudo-Dionysius"||
    fragment.text.indexOf("PSEUDO-DIONYSIUS.")!==u[1].range.start)
    throw new Error("CATENA_MIXED_OWNER_BOUNDARIES_INVALID");
  units=u.map(x=>({printedAttribution:x.printedAttribution,
    originalWords:fragment.text.slice(x.range.start,x.range.endExclusive)}));
 }else{
  if(anomaly)throw new Error("CATENA_UNEXPECTED_OWNERSHIP_OVERRIDE");
  units=[{printedAttribution:r.inheritedFatherLabel,originalWords:fragment.text}];
 }
 if(units.map(u=>u.originalWords).join("")!==fragment.text)
   throw new Error("CATENA_NONVERBATIM_SOURCE_UNIT");
 return Object.freeze({pointer,citation:section.citation,sourceUrl:section.source.url,
  edition:"Catena Aurea, Oxford/Newman English edition (1841–45)",
  inheritedFatherLabel:r.inheritedFatherLabel,units,
  historicalAuthorship:"unverified_inherited_Catena_label",
  publicationEligibility:"blocked_research_only"});
}
