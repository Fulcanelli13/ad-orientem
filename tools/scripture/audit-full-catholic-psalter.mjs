#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";

/** Mechanical passage-number alignment ONLY. Never a translation or theological approval. */
const STOP=new Set("the and for but was were which whose will have had not unto thee thou thine thy ye your you they them their her him his she has from with when who this that these those shall may such did does into upon under after before all its are our out where there here then nor let can one two three thus also by in of to an on is it he we i at a be as or do no so if".split(" "));
const significant=s=>new Set((String(s).toLowerCase().match(/[a-z]{2,}/g)||[]).filter(w=>!STOP.has(w)));
export function overlapRatio(x,y){
 const a=significant(x),b=significant(y);
 return a.size+b.size?2*[...a].filter(w=>b.has(w)).length/(a.size+b.size):0;
}
function getDouay(input){
 const book=input?.books?.find(x=>x.id==="Psalms");
 if(!book||book.chapters.length!==150)throw Error("Expected complete Catholic Douay 150-Psalm witness");
 const chapters=new Map();
 for(const chapter of book.chapters){
  if(chapters.has(chapter.number))throw Error("Duplicate Douay Psalm chapter");
  chapters.set(chapter.number,new Map(chapter.verses.map(x=>[x.number,x.text||""])));
 }
 return chapters;
}
function getCpdv(input){
 if(input?.editionId!=="cpdv-2009"||input.book!=="Psalms"||!Array.isArray(input.verses))
  throw Error("Expected maintained-author CPDV Catholic Psalter");
 const chapters=new Map();
 for(const verse of input.verses){
  if(!chapters.has(verse.chapter))chapters.set(verse.chapter,new Map());
  const map=chapters.get(verse.chapter);
  if(map.has(verse.verse))throw Error("Duplicate CPDV Psalm coordinate");
  map.set(verse.verse,verse.text);
 }
 if(chapters.size!==150)throw Error("Expected 150 Catholic CPDV Psalms");
 return chapters;
}
const KNOWN_EXCEPTIONS=new Set([13,42,92,150]);
const MIN_PAIR_OVERLAP=0.16;
const MIN_MEAN_OVERLAP=0.28;
/**
 * Returns a *candidate* for same-number identity only if all verse slots and
 * lexical context stay well aligned against BOTH pinned Catholic witnesses.
 * Adjacent-verse dominance is flagged, not silently approved.
 */
export function inspectPsalmChapter(chapter,cp,douay) {
 const cpIds=[...cp.keys()].filter(v=>cp.get(v)?.trim()).sort((a,b)=>a-b);
 const drIds=[...douay.keys()].filter(v=>douay.get(v)?.trim()).sort((a,b)=>a-b);
 const sameNumbers=cpIds.length===drIds.length&&cpIds.every((v,i)=>v===drIds[i]);
 const slots=[],anomalies=[];
 if(!sameNumbers)anomalies.push("numbered-verse-set-diverges");
 if(KNOWN_EXCEPTIONS.has(chapter))anomalies.push("requires-existing-exception-crosswalk");
 for(const n of new Set([...cpIds,...drIds])){
  const a=cp.get(n),b=douay.get(n);
  if(!a?.trim()||!b?.trim()){anomalies.push("missing-or-blank-"+n);continue;}
  const aligned=overlapRatio(a,b),earlier=douay.get(n-1)?overlapRatio(a,douay.get(n-1)):0;
  const later=douay.get(n+1)?overlapRatio(a,douay.get(n+1)):0;
  const neighborDominates=Math.max(earlier,later)>aligned+0.20;
  slots.push({verse:n,overlap:Number(aligned.toFixed(3)),neighborDominates});
  if(aligned<MIN_PAIR_OVERLAP)anomalies.push("weak-parallel-"+n);
  if(neighborDominates)anomalies.push("neighbor-parallel-stronger-"+n);
 }
 const mean=slots.reduce((n,x)=>n+x.overlap,0)/(slots.length||1);
 if(mean<MIN_MEAN_OVERLAP)anomalies.push("weak-chapter-alignment");
 const candidate=anomalies.length===0;
 return {chapter,cpdvNonblank:cpIds.length,douayNonblank:drIds.length,
  meanLexicalOverlap:Number(mean.toFixed(3)),sameNumbers,
  candidateForIdentityCrosswalk:candidate,anomalies,verseEvidence:slots};
}
export function auditFullPsalter(cpdvSource,douaySource){
 const a=getCpdv(cpdvSource),b=getDouay(douaySource),chapters=[];
 for(let chapter=1;chapter<=150;chapter++){
  if(!a.has(chapter)||!b.has(chapter))throw Error("Missing Catholic Psalm "+chapter);
  chapters.push(inspectPsalmChapter(chapter,a.get(chapter),b.get(chapter)));
 }
 const candidates=chapters.filter(x=>x.candidateForIdentityCrosswalk).map(x=>x.chapter);
 return {
  schemaVersion:1,cpdvAuthorSource:cpdvSource.sourceUrl,
  cpdvSourceSha256:cpdvSource.sourceSha256,
  douaySource:"pinned Douay–Rheims Challoner digital transcription",
  psalmsExamined:150,mechanicallyAlignedPsalms:candidates.length,
  candidateChapterNumbers:candidates,
  exceptionChapterNumbers:[...KNOWN_EXCEPTIONS],
  passagesNeedingEditorialReconciliation:chapters.filter(x=>!x.candidateForIdentityCrosswalk).map(x=>x.chapter),
  approvedForAutomaticSwitch:false,doctrinallyCertified:false,
  status:"SOURCE-TRIAGE-ONLY-REQUIRES-CANONICAL-RELEASE-WHITELIST",
  chapters
 };
}
if(process.argv[2]){
 const root=resolve(process.argv[2]);
 const [dr,cp]=await Promise.all([
  readFile(join(root,"DRC-canonical-candidate.json"),"utf8").then(JSON.parse),
  readFile(join(root,"cpdv-author-master-books/Psalms.json"),"utf8").then(JSON.parse)
 ]);
 const report=auditFullPsalter(cp,dr);
 await writeFile(join(root,"Psalms-150-complete-parallel-reconciliation.json"),JSON.stringify(report,null,2)+"\n");
 console.log("CATHOLIC_PSALTER_SOURCE_TRIAGE "+JSON.stringify({
  examined:report.psalmsExamined,candidateChapters:report.mechanicallyAlignedPsalms,
  chaptersForReview:report.passagesNeedingEditorialReconciliation.length,
  candidateChapterNumbers:report.candidateChapterNumbers,
  candidateVerseCounts:report.chapters.filter(x=>x.candidateForIdentityCrosswalk).map(x=>[x.chapter,x.cpdvNonblank]),
  reviewedForTheology:false,enabledForApp:false
 }));
}
