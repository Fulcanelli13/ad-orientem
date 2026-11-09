import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCanon42ApprovalQueue} from "../tools/mass-canon-42-approval-queue.mjs";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const current=load("../data/research/mass-canon-19-english-booklet-page-evidence-20261109.v1.json");
const source=load("../data/research/mass-canon-first-pass-19-ritus-source-review-20261013.json");
const french=load("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json");
const original={
  promotion:load("../data/research/mass-canon-42-rubric-promotion-review-20261013.json"),
  firstPass:source,
  complex:load("../data/research/mass-canon-complex-23-ritus-source-review-20261013.json"),
  printed:load("../data/research/mass-canon-29-printed-page-witness-crosswalk-20261014.json"),
};
const SCHEMA="ao-canon-19-english-ritus-booklet-page-evidence-v1";
const URL="https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
const pages=Object.freeze({
 "002":13,"005":13,"007":14,"010":14,"012":14,"014":14,"015":14,"020":15,
 "030":15,"031":15,"036":16,"037":16,"041":16,"042":16,"045":16,
 "046":16,"048":16,"049":17,"052":17,
});
function check(evidence){
 assert.equal(evidence.schema,SCHEMA);
 assert.equal(evidence.status,"ENGLISH_TRANSLATION_PAGES_LOCATED_PRIMARY_LATIN_FACSIMILE_AND_SIGNOFF_OPEN");
 assert.equal(evidence.sourceOwner,"data/research/mass-canon-first-pass-19-ritus-source-review-20261013.json");
 assert.deepEqual(evidence.counts,{
  cases:19,englishTranslationPagesLocated:19,
  sourceAlignedFrenchDrafts:18,precisionCopyHold:1,
  primaryLatinPrintedFacsimileSignoffs:0,bilingualCopySignoffs:0,
  actorClockSignoffs:0,livePublished:0,
 });
 assert.equal(evidence.invariants.noAutomaticFrenchPublication,true);
 assert.equal(evidence.invariants.noOriginalLatinFacsimileApproval,true);
 assert.equal(evidence.invariants.originalFrenchDraftNotOverwritten,true);
 assert.deepEqual(evidence.evidencePages.map(p=>p.pdfPageNumber),[13,14,15,16,17]);
 assert.equal(evidence.records?.length,19);
 const sourceById=new Map(source.rows.map(x=>[x.actionId,x]));
 const frenchById=new Map(french.rows.map(x=>[x.id,x]));
 const cueIds=new Set(),actionIds=new Set();
 let first=0,hold=0;
 for(const record of evidence.records){
  const original=sourceById.get(record.actionId);
  assert.ok(original,record.actionId+": unsupported 1962 source action");
  assert.equal(record.cueId,original.cueId);
  assert.equal(record.sourceRitus,original.sourceSection);
  assert.equal(record.latinTrigger,original.latinWordAnchor);
  assert.equal(record.englishEvidenceNote,original.sourceFinding);
  assert.ok(!cueIds.has(record.cueId)&&!actionIds.has(record.actionId),
   "Original Canon cue/action duplication");
  cueIds.add(record.cueId);actionIds.add(record.actionId);
  const page=pages[record.actionId.split(".").at(-1)];
  const w=record.printedEnglishTranslationWitness;
  assert.equal(w.pdfPageNumber,page);
  assert.equal(w.zeroBasedPageIndex,page-1);
  assert.equal(w.deepLink,URL+"#page="+page);
  assert.equal(w.url,URL);
  assert.equal(w.editionLabel,"ENGLISH_TRANSLATION_OF_1962_RITUS_SERVANDUS");
  assert.equal(w.passageLocation,"PRINTED_PAGE_VISUALLY_LOCATED_EN_TRANSLATION_ONLY");
  assert.equal(w.primary1962LatinPrintedFacsimileVerified,false,
   "English translation must not masquerade as original Latin 1962 facsimile");
  assert.equal(record.parallelLatinTextWitness.section,record.sourceRitus);
  assert.equal(record.independentLatinFacsimileApproval,"NOT_GRANTED");
  assert.equal(record.independentBilingualCopyApproval,"NOT_GRANTED");
  assert.equal(record.readerActualActorClockApproval,"NOT_GRANTED");
  assert.equal(record.livePublication,"BLOCKED_SOURCE_EVIDENCE_ONLY");
  assert.equal(record.publicationReady,false);
  const fr=frenchById.get(record.actionId);
  assert.ok(fr&&fr.cueId===record.cueId);
  assert.equal(fr.reviewState,"ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
  if(record.cueId==="AO.SM.C0187"){
   hold++;
   assert.equal(record.frenchReviewStatus,"PRECISE_SOURCE_WORDING_HOLD");
   assert.match(fr.draftFrenchOriginal,/profondément/);
   assert.doesNotMatch(fr.revisedFrenchRubric,/profondément/);
   assert.match(fr.revisedFrenchRubric,/s’incline au milieu de l’autel/);
   assert.match(record.editorialQualification,/inclinat se/);
  } else {
   first++;assert.equal(record.frenchReviewStatus,"SOURCE_ALIGNED_DRAFT_EDITOR_SIGNOFF_PENDING");
  }
 }
 assert.equal(first,18);
 assert.equal(hold,1);
 assert.equal(cueIds.size,19);
 const heldPages=evidence.records.filter(r=>r.printedEnglishTranslationWitness.pdfPageNumber===16);
 assert.ok(heldPages.some(r=>r.cueId==="AO.SM.C0187"),
  "C0187 original neutral bow source is printed translation p.16 / IX.1");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const queue=buildCanon42ApprovalQueue({...original,form,editorialPreview:true});
  assert.equal(queue.counts.total,42);
  assert.equal(queue.counts.livePublished,0);
  assert.equal(queue.publicationReady,0);
  const rows=queue.rows.filter(x=>actionIds.has(x.actionId));
  assert.equal(rows.length,19);
  assert.ok(rows.every(x=>x.independentSourceApproval==="NOT_GRANTED"&&
    x.bilingualCopyApproval==="NOT_GRANTED"&&
    x.readerAcceptance==="NOT_GRANTED"&&x.liveText===null&&
    x.priestActionNow===null&&x.canPublish===false));
 }
 return Object.freeze({pages:[13,14,15,16,17],sources:19,
  copyPrecisionHold:"AO.SM.C0187",publishable:0});
}
const stats=check(current);
const negative=mutate=>{
 const bad=structuredClone(current);mutate(bad);
 assert.throws(()=>check(bad));
};
negative(x=>x.records[0].printedEnglishTranslationWitness.pdfPageNumber=14);
negative(x=>x.records[0].printedEnglishTranslationWitness.primary1962LatinPrintedFacsimileVerified=true);
negative(x=>x.records[0].independentBilingualCopyApproval="GRANTED");
negative(x=>x.records[0].livePublication="LIVE");
negative(x=>x.records[0].readerActualActorClockApproval="SCROLL_INFERRED");
negative(x=>x.records.find(z=>z.cueId==="AO.SM.C0187").frenchReviewStatus="APPROVED");
negative(x=>x.records[1].cueId=x.records[0].cueId);
negative(x=>x.records.pop());
console.log("MASS_CANON_19_ENGLISH_WITNESS_GATE="+JSON.stringify(stats));
console.log("PASS Canon 19: original 1962-labelled English Ritus pages 13-17 checked; original Latin facsimile and independent signoffs not claimed; 42 LIVE holds preserved.");
