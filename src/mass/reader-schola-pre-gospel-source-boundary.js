// Research-only, pinned Latin 1962 Missal source -> named pre-Gospel roles.
// Never mutates the Calendar Proper, reader paragraphs, or live Schola. No
// automatic musical or editorial approval; excludes ambiguous seasonal forms.
import {matchSelected1962ProperToGraduale} from "./reader-proper-gabc-bulk-join.js";
export const SCHOLA_PREGOSPEL_BULK_SCHEMA="ao-schola-pregospel-pinned-selected-source-v1";
const validPath=p=>/^(Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(p);
const norm=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z]+/g," ").replace(/\bcoel/g,"cael").trim().replace(/\s+/g," ");
const words=s=>norm(s).split(" ").filter(Boolean);
const inSelected=(selected,source)=>{
 const w=words(source).slice(0,4);
 return w.length>=4&&(" "+norm(selected)+" ").includes(" "+w.join(" ")+" ");
};
const clean=s=>String(s??"").replace(/^[℣℟VR]\.\s*/u,"").trim()
 .replace(/\s+(?:allel[uú]j?a|alleluia)\.?\s*$/iu,"").trim();
function sourceLines(raw){
 return String(raw??"").split(/\r?\n/).map(v=>v.trim()).filter(v=>
  v&&!/^[!$&#]/.test(v)&&!/^_+$/.test(v));
}
const doubleAlleluia=/\b(?:Allel[uú]j?a|Allel[uú]ia),?\s+(?:Allel[uú]j?a|Allel[uú]ia)\b[.,]?\s*/iu;
function sectionsOf(raw){
 const sections=new Map();let current=null;
 for(const line of String(raw??"").split(/\r?\n/)){
  const heading=/^\[([A-Za-z][A-Za-z0-9]*)\](?:\s.*)?$/.exec(line.trim());
  if(heading){current=heading[1];sections.set(current,[]);continue}
  if(current)sections.get(current).push(line);
 }
 return sections;
}
const pointer=/^@((?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+)(?::([A-Za-z0-9]+))?$/;
async function readSection(path,section,fetchSource,stack=[]){
 const key=path+":"+section;
 if(stack.includes(key)||stack.length>=8)return {status:"INHERITANCE_CYCLE_OR_DEPTH",chain:[...stack,key]};
 const src=await fetchSource(path);
 if(!src?.text||!src.sha)return {status:"PINNED_SOURCE_UNAVAILABLE",chain:[...stack,key]};
 const blocks=sectionsOf(src.text);
 const lines=blocks.get(section)?.map(x=>x.trim()).filter(Boolean);
 if(!lines?.length)return {status:"SECTION_ABSENT",chain:[...stack,key]};
 const link=pointer.exec(lines[0]);
 if(link){
  if(lines.length!==1)return {status:"MIXED_SOURCE_INHERITANCE_HOLD",chain:[...stack,key]};
  return readSection(link[1],link[2]||section,fetchSource,[...stack,key]);
 }
 if(lines.some(s=>/^@/.test(s)))return {status:"INLINE_SOURCE_REFERENCE_HOLD",chain:[...stack,key]};
 return {status:"AUTHENTICATED_SOURCE_SECTION",chain:[...stack,key],
  owner:path,sourceSha:src.sha,section,lines:sourceLines(lines.join("\n"))};
}
function matchOne(role,text,archive,sourcePath){
 const nil={status:"NOT_APPLICABLE"};
 const slot={status:"READY",data:{paragraphs:[{latin:text,
  liturgicalGroup:"AO.CHANT."+(role==="gr"?"GRADUAL":role==="al"?"ALLELUIA":"TRACT")}]}}
 const slots={INTROIT:nil,GRADUAL:role==="gr"?slot:nil,
  ALLELUIA_TRACT_SEQUENCE:role!=="gr"?slot:nil,OFFERTORY:nil,COMMUNION:nil};
 const outcome=matchSelected1962ProperToGraduale({
  properSlots:{schema:"ao-reader-proper-slots-v1",ready:true,sourcePath,slots},archive});
 const t=outcome.tracks.find(x=>x.part===role);
 return {status:t?.status??"MATCHER_HOLD",
  candidateScoreIds:(t?.scoreCandidates??[]).map(x=>x.scoreId),
  candidateHashes:(t?.scoreCandidates??[]).map(x=>x.sourceGabcSha256),
  topWords:t?.topMatchingOpeningWords??0};
}
const part=(role,text,source)=>({
 role,opening:clean(text).slice(0,140),sourceOwner:source.owner,
 sourceSection:source.section,sourceSha:source.sourceSha,sourceChain:source.chain,
});
/**
 * Require a canonical actual-Mass sourcePath and its selected Latin Graduale.
 * The original source section, NOT the date/incipit, supplies role boundaries.
 * Matching source Latin in the actual selected Proper proves textual lineage
 * only; the Gregorian setting and seasonal edition remain unapproved.
 */
export async function analyzeSelectedPreGospelSource({
 sourcePath,selectedLatin,selectedSequenceLatin="",fetchSource,archive
}={}){
 const base={schema:SCHOLA_PREGOSPEL_BULK_SCHEMA,sourcePath,
  status:"SOURCE_TEXT_RESEARCH_ONLY",approval:{publicScores:0,editorial:false,
   noteParity:false,audio:false,readerChanged:false},pieces:[],holds:[]};
 if(!validPath(sourcePath)||!String(selectedLatin??"").trim()||
  typeof fetchSource!=="function"||archive?.count!==1195)
  return {...base,status:"INVALID_SELECTED_SOURCE",holds:["CANONICAL_INPUT_UNAVAILABLE"]};
 const [ordinary,paschal,tract]=await Promise.all([
  readSection(sourcePath,"Graduale",fetchSource),
  readSection(sourcePath,"GradualeP",fetchSource),
  readSection(sourcePath,"Tractus",fetchSource)]);
 const selected=String(selectedLatin);
 const sourceMatches=s=>s.status==="AUTHENTICATED_SOURCE_SECTION"&&
    s.lines.some(line=>inSelected(selected,clean(line)));
 const normal=sourceMatches(ordinary);
 const alternate=sourceMatches(paschal);
 if(!normal&&!alternate){
   base.holds.push({code:"SELECTED_GRADUAL_NOT_ANCHORED_IN_PINNED_SOURCE",
     primary:ordinary.status,paschal:paschal.status});
   return base;
 }
 if(normal&&alternate){base.holds.push({code:"NORMAL_AND_PASCHAL_SOURCE_AMBIGUOUS"});return base;}
 const chosen=normal?ordinary:paschal;
 const lines=chosen.lines;
 const pieces=[];
 const add=(role,latin,origin=chosen)=>{
   const v=clean(latin);
   if(words(v).length<4){base.holds.push({code:"TOO_SHORT",role});return}
   if(!inSelected(selected,v)){
      base.holds.push({code:"NOT_IN_SELECTED_PROPER",role,sourceSection:origin.section});return;
   }
   pieces.push({...part(role,v,origin),...matchOne(role,v,archive,sourcePath)});
 };
 const markerIndex=lines.findIndex(x=>doubleAlleluia.test(x));
 if(markerIndex===0){
   // Eastertide: no Gradual; two independent Alleluia verses in the selected section.
   for(const line of lines.slice(1)){
     if(!/^[℣VR]\./u.test(line)){base.holds.push({code:"PASCHAL_UNMARKED_VERSE"});continue;}
     add("al",line);
   }
 }else{
   if(lines.length)add("gr",lines[0]);
   if(markerIndex>0){
     const inline=lines[markerIndex].split(doubleAlleluia)[1]?.trim();
     if(inline&&words(inline).length>=4)add("al",inline);
     else{
       const after=lines.slice(markerIndex+1).filter(x=>/^[℣VR]\./u.test(x));
       if(after.length===1)add("al",after[0]);
       else base.holds.push({code:"MULTIPLE_OR_MISSING_ALLELUIA_VERSES",count:after.length});
     }
   }else base.holds.push({code:"NO_CERTIFIED_ALLELUIA_BOUNDARY"});
 }
 // Tracts may be seasonal alternatives even when a [Tractus] section is present.
 // Only selected Latin containing the EXACT source incipit is admissible.
 if(tract.status==="AUTHENTICATED_SOURCE_SECTION"&&tract.lines.length){
   if(inSelected(selected,clean(tract.lines[0]))){
     if(markerIndex>=0)base.holds.push({code:"ALLELUIA_AND_TRACT_CONFLICT"});
     else add("tr",tract.lines[0],tract);
   }else base.holds.push({code:"TRACT_EXISTS_BUT_NOT_SELECTED"});
 }
 if(selectedSequenceLatin.trim())base.holds.push({
   code:"SELECTED_SEQUENCE_OUTSIDE_1195_PROPER_SCORE_CORPUS"});
 base.pieces=pieces;
 base.status=pieces.length?"SELECTED_SOURCE_ROLE_CANDIDATES":"SELECTED_ROLE_UNRESOLVED";
 return base;
}
