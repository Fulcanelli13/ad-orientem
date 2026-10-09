#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {inspectPsalmChapter,overlapRatio} from "./audit-full-catholic-psalter.mjs";
import {PSALTER_IDENTITY_VERSE_COUNTS} from "../../src/scripture/psalter-identity-crosswalk.js";
import {PSALTER_EXCEPTION_STATUS} from "../../src/scripture/psalter-exception-crosswalk.js";
export const OUTSTANDING_PSALMS=Object.freeze([16,64,73,75,76,77,88,101,108,111,115,120,137]);
const MIN_OVERLAP=.46;
const MIN_CONTEXT_OVERLAP=.35;
const MIN_MARGIN=.12;
const WATCH=new Set(OUTSTANDING_PSALMS);
function readCatholicPsalms(drc,cpdv){
 const b=drc?.books?.find(x=>x.id==="Psalms");
 if(!b||b.chapters.length!==150||cpdv?.editionId!=="cpdv-2009"||cpdv?.book!=="Psalms")
   throw Error("Complete Catholic Psalter witnesses required");
 const dr=new Map(b.chapters.map(c=>[c.number,new Map(c.verses.map(v=>[v.number,v.text||""]))]));
 const cp=new Map();
 for(const v of cpdv.verses){
  if(!cp.has(v.chapter))cp.set(v.chapter,new Map());
  const m=cp.get(v.chapter);
  if(m.has(v.verse))throw Error("Repeated author Psalm verse "+v.chapter+":"+v.verse);
  m.set(v.verse,v.text);
 }
 return {dr,cp};
}
export function inspectRemainingPsalmChapter(chapter,cp,dr){
 if(!WATCH.has(chapter))throw Error("Not one of the 13 outstanding Psalms");
 if(!cp||!dr)throw Error("Missing source chapter");
 const base=inspectPsalmChapter(chapter,cp,dr);
 const cpIds=[...cp.keys()].filter(x=>cp.get(x)?.trim()).sort((a,b)=>a-b);
 const drIds=[...dr.keys()].filter(x=>dr.get(x)?.trim()).sort((a,b)=>a-b);
 const complete=cpIds.length===drIds.length&&cpIds.every((v,i)=>v===drIds[i]);
 const passed=[],blocked=[];
 for(const verse of cpIds){
  const actual=cp.get(verse),other=dr.get(verse);
  const direct=other?.trim()?overlapRatio(actual,other):0;
  const past=dr.get(verse-1)?overlapRatio(actual,dr.get(verse-1)):0;
  const future=dr.get(verse+1)?overlapRatio(actual,dr.get(verse+1)):0;
  const contextSource=[cp.get(verse-1),actual,cp.get(verse+1)].filter(Boolean).join(" ");
  const contextTarget=[dr.get(verse-1),other,dr.get(verse+1)].filter(Boolean).join(" ");
  const context=overlapRatio(contextSource,contextTarget);
  const adjacent=[verse-1,verse+1].filter(x=>cp.has(x)&&dr.has(x))
    .filter(x=>overlapRatio(cp.get(x),dr.get(x))>=.20).length;
  const reasons=[];
  if(!complete)reasons.push("chapter-numbering-diverges");
  if(!other?.trim())reasons.push("missing-target-verse");
  if(direct<MIN_OVERLAP)reasons.push("insufficient-direct-match");
  if(context<MIN_CONTEXT_OVERLAP)reasons.push("insufficient-neighbor-context");
  if(Math.max(past,future)>direct-MIN_MARGIN)reasons.push("shifted-verse-risk");
  if(adjacent===0)reasons.push("no-independent-neighbor-confirmation");
  const row={chapter,verse,direct:Number(direct.toFixed(3)),context:Number(context.toFixed(3)),
   nearestOther:Number(Math.max(past,future).toFixed(3)),adjacentStrong:adjacent,
   eligible:reasons.length===0,reasons};
  (row.eligible?passed:blocked).push(row);
 }
 return {
  chapter,sourceVerses:cpIds.length,targetVerses:drIds.length,
  allCoordinatesIdentical:complete,wholeChapterAudit:base.anomalies,
  eligibleVerses:passed.map(x=>x.verse),eligibleCount:passed.length,
  blockedCount:blocked.length,passed,blocked,
  status:"MECHANICAL-REFERENCE-CANDIDATES-NOT-THEOLOGICAL-CERTIFICATION"
 };
}
export function auditRemainingPsalms(drc,cpdv){
 const {dr,cp}=readCatholicPsalms(drc,cpdv);
 const reports=OUTSTANDING_PSALMS.map(ch=>inspectRemainingPsalmChapter(ch,cp.get(ch),dr.get(ch)));
 const map=reports.map(x=>({chapter:x.chapter,verifiedVerses:x.eligibleVerses}));
 if(map.some(x=>PSALTER_IDENTITY_VERSE_COUNTS[x.chapter]!==undefined||
   PSALTER_EXCEPTION_STATUS.chapters.includes(x.chapter)))throw Error("Overlapping Psalter release owners");
 return {
  schemaVersion:1,editionPair:["dr-challoner","cpdv-2009"],
  authorMasterUrl:cpdv.sourceUrl,authorMasterSha256:cpdv.sourceSha256,
  chapters:reports.length,completeChapterCandidates:reports.filter(x=>!x.blockedCount).length,
  totalCandidateVerses:reports.reduce((s,x)=>s+x.eligibleCount,0),
  totalUnresolvedVerses:reports.reduce((s,x)=>s+x.blockedCount,0),
  proposedReferenceWhitelist:map,individualFindings:reports,
  doctinallyCertified:false,textApprovedForPublication:false,
  status:"REVIEW-REQUIRED-BEFORE-INCORPORATING-ANY-VERSE"
 };
}
if(process.argv[2]){
 const dir=resolve(process.argv[2]);
 const [dr,cp]=await Promise.all([
  readFile(join(dir,"DRC-canonical-candidate.json"),"utf8").then(JSON.parse),
  readFile(join(dir,"cpdv-author-master-books/Psalms.json"),"utf8").then(JSON.parse)
 ]);
 const audit=auditRemainingPsalms(dr,cp);
 await writeFile(join(dir,"Psalms-13-unresolved-verse-by-verse-review.json"),JSON.stringify(audit,null,2)+"\n");
 console.log("REMAINING_PSALTER_REVIEW "+JSON.stringify({
  chapters:audit.chapters,candidateVerses:audit.totalCandidateVerses,
  unresolvedVerses:audit.totalUnresolvedVerses,
  perChapter:audit.individualFindings.map(x=>({chapter:x.chapter,eligible:x.eligibleCount,
   blocked:x.blockedCount,complete:x.allCoordinatesIdentical,
   eligibleVerses:x.eligibleVerses,exceptions:x.blocked.slice(0,7).map(v=>({v:v.verse,why:v.reasons}))})),
  publicationApproved:false
 }));
}
