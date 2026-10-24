import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=async relative=>JSON.parse(await readFile(resolve(root,relative),"utf8"));
const research="data/learn/research/";
const out=resolve(root,"artifacts/pius-x-complete-corpus");
await mkdir(out,{recursive:true});
const manifestPaths=[
 ...Array.from({length:14},(_,i)=>i+3).map(n=>research+"pius-x-batch"+n+"-1905-production-manifest-202610"+(n<=6?"19":"20")+".v1.json"),
 research+"pius-x-batch2-production-index-20261019.v1.json",
 research+"pius-x-batch50-production-manifest-20261019.v1.json"
];
const packs=await Promise.all(manifestPaths.map(read));
const pilot=await read(research+"pius-x-ten-conversation-content-pilot-20261019.v1.json");
const selectionGroups={
 PERSONAL_HISTORY:16,
 PAPAL_TEACHING_AND_PASTORAL:22,
 PRAYER_AND_SPIRITUAL_LIFE:20,
 FAITH_AND_CREED:18,
 MORAL_LIFE_AND_VIRTUES:18,
 SACRAMENTS_AND_MASS:18,
 FEASTS_AND_LITURGY:12,
 DEATH_AND_LAST_THINGS:6
};
const planned=Object.values(selectionGroups).reduce((a,b)=>a+b,0);
if(planned!==130)throw Error("Quota policy corrupted");
const batch2=new Map(packs[14].entries.map(x=>[x.id,x]));
const sourceFiles=[],all=[],issues=[];
for(let i=0;i<packs.length;i++){
 const group=i<14?i+3:i===14?2:50;
 const sources=packs[i].files;
 if(!Array.isArray(sources)||sources.length<3)throw Error("No source-owner files for batch "+group);
 const shardRecords=await Promise.all(sources.map(async path=>{
  const s=await read(path);
  if(!Array.isArray(s.records))throw Error("Missing records "+path);
  sourceFiles.push({group,path,count:s.records.length});
  return {path,records:s.records};
 }));
 for(const s of shardRecords)for(const rec of s.records){
  const entry=group===2?batch2.get(rec.id):null;
  if(group===2&&!entry)throw Error("Missing batch2 source index for "+rec.id);
  const q=group===2?rec.opening?.question:rec.question||rec.turns?.[0]?.question;
  const a=group===2?rec.opening?.response:rec.turns?.[0]?.response;
  const b=group===2?rec.followup?.response:rec.turns?.[1]?.response;
  const src=group===2?entry.source:rec.source;
  if(!q?.en||!q?.fr||!a?.en||!a?.fr||!b?.en||!b?.fr)
   throw Error("Incomplete bilingual source-owner family "+rec.id+" in "+s.path);
  const sourceUrl=src?.url||src?.sourceUrl||null;
  const item={
   id:rec.id,batch:group,ownerFile:s.path,sourceOwnerManifest:manifestPaths[i],
   topic:{en:q.en,fr:q.fr},draftPreview:{en:a.en,fr:a.fr},
   source:{edition:src?.edition||src?.witness||null,section:src?.section||null,
    locator:src?.questionId||src?.qId||src?.qNumber||entry?.source?.locus||null,
    url:sourceUrl,primaryWitnessClass:src?.textWitness||src?.witness||null,
    provenance:entry?.sourceTier||rec.sourceEvidenceState||src?.screen||null},
   domainHint:rec.domain||src?.section||"UNSPECIFIED",
   approval:{independentlySourceCertified:false,theologyApproved:false,
    englishApproved:false,frenchApproved:false,historicalVoiceApproved:false,published:false},
   draftConversationTurns:2,
   category:null,screeningFlags:[]
  };
  if(!sourceUrl)issues.push({id:rec.id,type:"SOURCE_URL_MISSING"});
  all.push(item);
 }
}
for(const ep of pilot.episodes){
 const t=ep.turns?.[0],q=t?.language;
 if(!q?.en?.visitor||!q?.fr?.visitor||!q?.en?.response||!q?.fr?.response)
  throw Error("Pilot lacks first bilingual question "+ep.id);
 all.push({
  id:ep.id,batch:1,ownerFile:research+"pius-x-ten-conversation-content-pilot-20261019.v1.json",
  sourceOwnerManifest:research+"pius-x-ten-conversation-content-pilot-20261019.v1.json",
  topic:{en:q.en.visitor,fr:q.fr.visitor},draftPreview:{en:q.en.response,fr:q.fr.response},
  source:{edition:ep.sourceAttribution||null,section:ep.sourceScope||null,
   locator:ep.sourceScope,url:ep.sourceUrl,primaryWitnessClass:ep.sourceAttribution,
   provenance:ep.sourceLevelReview||null},
  domainHint:ep.domain,draftConversationTurns:ep.turns.length,
  approval:{independentlySourceCertified:false,theologyApproved:false,
   englishApproved:false,frenchApproved:false,historicalVoiceApproved:false,published:false},
  category:null,screeningFlags:[]
 });
}
if(all.length!==810)throw Error("Expected 810 source-owned family records, found "+all.length);
const familyTurnTotal=all.reduce((sum,x)=>sum+x.draftConversationTurns,0);
if(familyTurnTotal!==1630)throw Error("Expected 1,630 recorded turns; got "+familyTurnTotal);
const byId=new Map(),duplicateIds=[];
for(const item of all){if(byId.has(item.id))duplicateIds.push({id:item.id,first:byId.get(item.id).ownerFile,other:item.ownerFile});
 else byId.set(item.id,item);}
const normalize=s=>s.toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g," ").trim();
const questions=new Map();
for(const item of all){const key=normalize(item.topic.en);if(!questions.has(key))questions.set(key,[]);questions.get(key).push(item.id);}
const exactQuestionCollisions=[...questions.values()].filter(v=>v.length>1);
function category(item){
 const n=item.batch,d=String(item.domainHint).toUpperCase();
 const t=item.topic.en.toLowerCase(),p=String(item.source.provenance||"").toUpperCase();
 if(n===1){
  if(/PERSONAL_HISTORY/.test(d))return "PERSONAL_HISTORY";
  if(/MODERNISM|PASTORAL_METHOD|PRIESTLY_SPIRITUALITY/.test(d))return "PAPAL_TEACHING_AND_PASTORAL";
  if(/LITURG/.test(d))return "FEASTS_AND_LITURGY";
  if(/CONFESSION|EUCHARISTIC|SACRAMENT/.test(d))return "SACRAMENTS_AND_MASS";
  return "FAITH_AND_CREED";
 }
 if(n===2){
  if(p==="BIOGRAPHY_FACTS_ONLY")return "PERSONAL_HISTORY";
  if(/EXP-0(?:14|15|22|25|34|39|42|44)/.test(item.id))return "PAPAL_TEACHING_AND_PASTORAL";
  if(/heaven|purgatory|resurrection|hell/.test(t))return "DEATH_AND_LAST_THINGS";
  if(/mass|rosary|chant|sunday|liturg/.test(t))return "FEASTS_AND_LITURGY";
  if(/pray|spiritual|meditat|conscience/.test(t))return "PRAYER_AND_SPIRITUAL_LIFE";
  if(/communion|eucharist|baptism|confess|orders|unction|marriage|consecration/.test(t))return "SACRAMENTS_AND_MASS";
  if(/sin|theft|obedien|repentance|hatred|parents/.test(t))return "MORAL_LIFE_AND_VIRTUES";
  return "FAITH_AND_CREED";
 }
 if(n===50){
  if(/PERSONAL_LIFE/.test(d))return "PERSONAL_HISTORY";
  if(/MODERNISM|CHURCH_CRISIS|APOLOGETICS|PASTORAL_METHOD/.test(d))return "PAPAL_TEACHING_AND_PASTORAL";
  if(/SACRED_LITURGY/.test(d))return "FEASTS_AND_LITURGY";
  if(/HISTORICAL_CATECHESIS/.test(d)){
   if(/chant|mass|gregorian|church music/.test(t))return "FEASTS_AND_LITURGY";
   if(/communion|viaticum|baptism/.test(t))return "SACRAMENTS_AND_MASS";
   if(/sin|charity|repentance/.test(t))return "MORAL_LIFE_AND_VIRTUES";
   if(/scripture|meditat|spiritual|prayer|conscience/.test(t))return "PRAYER_AND_SPIRITUAL_LIFE";
   if(/death|deceased/.test(t))return "DEATH_AND_LAST_THINGS";
   return "PAPAL_TEACHING_AND_PASTORAL";
  }
  return "PAPAL_TEACHING_AND_PASTORAL";
 }
 if(n===3||n===6)return "PRAYER_AND_SPIRITUAL_LIFE";
 if(n===4||n===5)return "MORAL_LIFE_AND_VIRTUES";
 if(n===7)return /PX1905-F-|FEAST|ADVENT|CHRISTMAS|EASTER|LITURG|SOLEMN|SAINT/.test(item.id+" "+d)?
   "FEASTS_AND_LITURGY":"DEATH_AND_LAST_THINGS";
 if(n>=8&&n<=14)return "SACRAMENTS_AND_MASS";
 if(n===15||n===16)return "FAITH_AND_CREED";
 throw Error("Unknown batch "+n);
}
const byCategory={},byBatch={},bySourceClass={};
for(const item of all){
 item.category=category(item);
 const flags=[];
 const text=(item.topic.en+" "+item.draftPreview.en).toLowerCase();
 if(item.category==="PERSONAL_HISTORY"){
  flags.push("PERSONAL_LIFE_REQUIRES_BIOGRAPHY_PRIMARY_CORROBORATION");
  if(String(item.source.provenance)==="BIOGRAPHY_FACTS_ONLY")flags.push("BIOGRAPHY_FACTS_NOT_PAPAL_TESTIMONY");
 }
 if(/1905|1912|formerly|historical|midnight|current law|confessor/.test(text))
  flags.push("HISTORICAL_DISCIPLINE_CONTEXT_SCREEN");
 if(/did you|your childhood|your parents|your father|your mother|do you remember/.test(item.topic.en.toLowerCase()))
  flags.push("FIRST_PERSON_MEMORY_NOT_AUTOMATICALLY_AUTHENTICATED");
 if(!item.source.url)flags.push("SOURCE_LOCATION_UNRESOLVED");
 flags.push("EN_FR_TRANSLATION_AND_SOURCE_CLAIMS_UNCERTIFIED");
 item.screeningFlags=flags;
 byCategory[item.category]=(byCategory[item.category]||0)+1;
 byBatch[item.batch]=(byBatch[item.batch]||0)+1;
 const kind=item.batch>=3&&item.batch<=16?"1905_CATECHISM_OR_FEAST_INSTRUCTION":
  item.batch===1?"TEN_SOURCE_BOUNDED_PILOT":item.batch===50?"PAPAL_DOCUMENT_AND_CATECHISM_EXPANSION":"MIXED_BIOGRAPHY_PAPAL_AND_CATECHISM";
 bySourceClass[kind]=(bySourceClass[kind]||0)+1;
}
function score(item){
 let result=0;
 const p=String(item.source.provenance||"").toUpperCase();
 if(item.batch===1)result+=14;
 if(item.batch===50)result+=10;
 if(item.batch===2)result+=8;
 if(p.includes("PRIMARY_DIRECT")||p==="DIRECT_PASSAGE_ANCHOR")result+=12;
 if(p.includes("PRIMARY_PARTIAL")||p.includes("PARTIAL_PASSAGE"))result+=6;
 if(p==="BIOGRAPHY_FACTS_ONLY")result-=4;
 if(item.source.url?.includes("vatican.va"))result+=8;
 if(item.source.url?.includes("museosanpiox.it"))result+=2;
 if(item.screeningFlags.includes("SOURCE_LOCATION_UNRESOLVED"))result-=9;
 if(item.screeningFlags.includes("FIRST_PERSON_MEMORY_NOT_AUTOMATICALLY_AUTHENTICATED"))result-=5;
 if(item.screeningFlags.includes("HISTORICAL_DISCIPLINE_CONTEXT_SCREEN"))result-=2;
 const len=item.topic.en.length; if(len>32&&len<125)result+=2;
 return result;
}
const pools=Object.keys(selectionGroups).map(name=>({name,desired:selectionGroups[name],
 candidates:all.filter(x=>x.category===name).sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id))}));
const selected=[],used=new Set(),usedQuestion=new Set(),sectionCount=new Map();
function pick(pool,count){
 let n=0;
 while(n<count){
  const available=pool.candidates.filter(x=>!used.has(x.id)&&!usedQuestion.has(normalize(x.topic.en)));
  if(!available.length)break;
  available.sort((a,b)=>{
   const penalize=x=>score(x)+(pool.name==="BACKFILL"&&x.category==="PAPAL_TEACHING_AND_PASTORAL"?100:0)-(sectionCount.get(x.category+"|"+x.source.section)||0)*2-
    selected.filter(z=>z.category===x.category&&z.batch===x.batch).length;
   return penalize(b)-penalize(a)||a.id.localeCompare(b.id);
  });
  const chosen=available[0];used.add(chosen.id);usedQuestion.add(normalize(chosen.topic.en));
  const section=chosen.category+"|"+chosen.source.section;
  sectionCount.set(section,(sectionCount.get(section)||0)+1);
  selected.push({...chosen,candidateReason:"EDITORIAL_FIRST_RELEASE_SHORTLIST_NOT_SOURCE_OR_VOICE_APPROVAL",screenScore:score(chosen)});
  n++;
 }
 return n;
}
const quotaResults={};
for(const pool of pools){
 const count=pick(pool,pool.desired);
 quotaResults[pool.name]={target:pool.desired,available:pool.candidates.length,selectedBeforeBackfill:count,shortfall:pool.desired-count};
}
if(selected.length<planned){
 const deficit=planned-selected.length;
 const extras={name:"BACKFILL",candidates:all.filter(x=>!used.has(x.id)).sort((a,b)=>
  Number(b.category==="PAPAL_TEACHING_AND_PASTORAL")-Number(a.category==="PAPAL_TEACHING_AND_PASTORAL")||
  score(b)-score(a)||a.id.localeCompare(b.id))};
 pick(extras,deficit);
}
const finalCategory={};for(const s of selected)finalCategory[s.category]=(finalCategory[s.category]||0)+1;
const uniqueFamilyCount=new Set(all.map(x=>x.id)).size;
const quality={
 schema:"AO_SPX_COMPLETE_810_CORPUS_COVERAGE_V1",asOf:"2026-10-20",
 status:"DRAFT_CATALOGUE_NOT_CERTIFIED_DISTINCT_INTENTS_OR_SOURCE_SENTENCES",
 inventory:{recordFamilies:all.length,originalDraftTurns:familyTurnTotal,uniqueRecordIds:uniqueFamilyCount,
  duplicateRecordIdCount:duplicateIds.length,identicalOpeningEnglishQuestionClusters:exactQuestionCollisions.length,
  recordedSourceOwnerFiles:sourceFiles.length,batchManifests:manifestPaths.length+1,
  independentlySourceAndTheologyApproved:0,publishedFromThisProgramme:0},
 sourceFamiliesByBatch:byBatch,subjectCoverage:byCategory,sourceGenres:bySourceClass,
 overlapCaution:"Same ID is different from same visitor intent. Normalized duplicate openings are mechanical warnings; related thematic overlaps across batches still require human adjudication.",
 sourceOwnerFiles:sourceFiles,duplicateRecordIds:duplicateIds,
 identicalOpeningQuestionFamilies:exactQuestionCollisions,
 records:all
};
const packageOut={
 schema:"AO_SPX_BALANCED_130_FIRST_RELEASE_CANDIDATE_SELECTION_V1",asOf:"2026-10-20",
 state:"RESEARCH_SELECTION_NOT_SOURCE_CERTIFICATION_OR_APP_PUBLICATION",
 method:"Select from 810 original, unchanged source-owner families by a category quota, source provenance and source-linked topic diversity. No Denzinger. No generated new factual dialogue.",
 target:planned,actual:selected.length,selectedByCategory:finalCategory,
 quotas:quotaResults,biographicalShortfallToBeFilledByDocumentedResearch:quotaResults.PERSONAL_HISTORY.shortfall,
 candidateMeaning:"Priority for concentrated source, historical, doctrinal and EN/FR voice review, NOT permission to render as authentic St Pius X speech.",
 releaseGates:["Original passage-level witness matched to the proposed reply","Doctrinal and dated-practice review by an independent qualified reviewer","English and French translation precision","Historical style signoff: no invented papal autobiographical speech","Owner-approved explicit inclusion in P2 scene, not autonomous file promotion"],
 mandatoryDenzinger:false,
 noRuntimeChange:true,noPublishedAnswers:true,
 candidates:selected
};
const summary=[
 "# St Pius X — complete corpus reconciliation and balanced first-release selection",
 "",
 "**Research-only · 20 October 2026 · zero independently approved answers.**",
 "",
 "## Source-owned inventory",
 "",
 "- Original distinct *record IDs*: "+uniqueFamilyCount+" out of "+all.length+" declared families; duplicate record IDs: "+duplicateIds.length,
 "- Original draft conversation turns: "+familyTurnTotal,
 "- Exact normalized English opening-question overlap clusters: "+exactQuestionCollisions.length+" (not a comprehensive semantic-intent deduplication)",
 "- Every original source file remains the source of truth. No new historical quotations or doctrinal replies generated.",
 "",
 "## Full subject coverage by category",
 "",
 "| Category | Source-owned draft families | Initial selected candidates | Desired |",
 "|---|---:|---:|---:|",
 ...Object.keys(selectionGroups).map(k=>"| "+k+" | "+byCategory[k]+" | "+(finalCategory[k]||0)+" | "+selectionGroups[k]+" |"),
 "",
 "The explicit biography candidate pool contains "+byCategory.PERSONAL_HISTORY+
 " families, including biographical facts that must NOT be presented as verified personal memories.",
 "The initial biography target is "+selectionGroups.PERSONAL_HISTORY+
 " and the unfilled initial quota is "+quotaResults.PERSONAL_HISTORY.shortfall+
 ". Other categories are backfilled to maintain the proposed total of "+selected.length+" without fabricating biographical conversations.",
 "",
 "## Limitations and release strategy",
 "",
 "1. This is a prioritised review list, not an approved release. All selected original wording must be checked against its exact original-language witness and doctrinal claims.",
 "2. Papally prescribed Catechism material is NOT an autograph personal statement by St Pius X.",
 "3. Private childhood memories cannot be improvised from bare secondary biography fact sheets.",
 "4. Preserve user-selected follow-ups, EN/FR and the approved portrait style, but hold publication until the canonical source and style owners sign off.",
 "5. Denzinger is OPTIONAL and not a bottleneck.",
 "",
 "The full JSON lists source-owner path, topic EN/FR, provenance, potential review risks, batch and initial priority score for every family."
].join("\n")+"\n";
const outputs=[
 ["SPX_810_Source_Owner_Coverage.json",quality],
 ["SPX_Balanced_130_Release_Candidates.json",packageOut]
];
for(const [name,obj] of outputs)await writeFile(resolve(out,name),JSON.stringify(obj,null,2)+"\n","utf8");
await writeFile(resolve(out,"SPX_Corpus_Progress_and_Release_Selection.md"),summary);
console.log(JSON.stringify({families:all.length,turns:familyTurnTotal,
 uniqueRecordIds:uniqueFamilyCount,duplicates:duplicateIds.length,exactQuestionOverlapClusters:exactQuestionCollisions.length,
 byCategory,byBatch,selection:selected.length,selectedByCategory:finalCategory,
 quota:quotaResults,files:outputs.map(x=>x[0])}));
