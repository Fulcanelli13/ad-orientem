import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveCanonLatinWordAnchors} from "../src/mass/reader-canon-latin-anchors.js";
import {buildCanon42ApprovalQueue} from "../tools/mass-canon-42-approval-queue.mjs";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const evidence=read("../data/research/mass-canon-c0190-critical-cross-offset-20261109.v1.json");
const low=read("../data/presentation/reader-text-low.v1.json");
const sung=read("../data/presentation/reader-text-sung.v1.json");
const crosswalk=read("../data/research/mass-canon-29-external-ritus-witness-20261014.json");
const printed=read("../data/research/mass-canon-29-printed-page-witness-crosswalk-20261014.json");
const triggerAudit=read("../data/research/mass-canon-62-source-trigger-audit-20261013.json");
const promotion=read("../data/research/mass-canon-42-rubric-promotion-review-20261013.json");
const complex=read("../data/research/mass-canon-23-latin-page-image-evidence-20261109.v1.json");
const queueOwners={
 promotion,
 firstPass:read("../data/research/mass-canon-first-pass-19-ritus-source-review-20261013.json"),
 complex:read("../data/research/mass-canon-complex-23-ritus-source-review-20261013.json"),
 printed,
};
const cue="AO.SM.C0190",action="AO.CANON.R62.044";
const SOURCE="omni benedictióne coelésti et grátia repleámur.";
const TOKEN="coelésti";
const P=18;
const fragment="omni benedictióne ";
const RITUS="SOURCE_GESTURE_OFFSET_UNVERIFIED";
const sourceWord=corpus=>corpus.blocks.flatMap(b=>b.units??[]).filter(u=>u.cue_id===cue);

function audit(e){
 assert.equal(e.schema,"ao-mass-canon-c0190-critical-cross-offset-v1");
 assert.equal(e.status,"MULTI_WITNESS_RITUS_TEXT_COLLATED_EDITORIAL_OFFSET_CANDIDATE_ONLY");
 assert.deepEqual([e.owner.cueId,e.owner.actionId,e.owner.ritus],[cue,action,"IX.1"]);
 assert.equal(e.owner.actualActor,"PRIEST");
 assert.equal(e.owner.action,"SELF_SIGN_CROSS");
 assert.equal(e.owner.sourceTrigger,"omni benedictione caelesti");
 assert.deepEqual(sourceWord(low).map(u=>u.latin),[SOURCE]);
 assert.deepEqual(sourceWord(sung).map(u=>u.latin),[SOURCE]);
 assert.equal(e.frozenDonor.low.latin,SOURCE);
 assert.equal(e.frozenDonor.sung.latin,SOURCE);
 assert.equal(e.frozenDonor.low.blobSha,"afabbd1679f88a45a19f6a24a7795692803d594a");
 assert.equal(e.frozenDonor.sung.blobSha,"29dd8a6da521cf1c16b2c3d13005bd1e3bb76f25");
 assert.equal(e.frozenDonor.printedCrossPresent,false);
 assert.equal(e.frozenDonor.uniformAcrossFourForms,true);
 assert.equal(SOURCE.includes("✠")||SOURCE.includes("†")||SOURCE.includes("+"),false);
 assert.equal(SOURCE.indexOf(TOKEN),P);
 assert.equal(e.proposedOnly.utf16Boundary,P);
 assert.equal(e.proposedOnly.exactTextBeforeBoundary,SOURCE.slice(0,P));
 assert.equal(e.proposedOnly.exactTextBeforeBoundary,fragment);
 assert.equal(e.proposedOnly.exactTextAfterBoundary,SOURCE.slice(P));
 assert.equal(e.proposedOnly.insertionBeforeOriginalWord,TOKEN);
 assert.equal(e.proposedOnly.sourceMarkRelativeToWords,"AFTER_BENEDICTIONE_BEFORE_CAELESTI");
 assert.equal(e.proposedOnly.signType,"SELF_SIGN_ONE_CROSS");
 assert.equal(e.proposedOnly.isEditorialCandidateNotARenderedGlyph,true);
 assert.equal(e.proposedOnly.mayMoveToLive,false);
 assert.equal(e.proposedOnly.mayChangeFrozenLatin,false);
 assert.equal(e.proposedOnly.mayInferRealGestureFromScroll,false);
 assert.deepEqual([e.orthography.donorForm,e.orthography.printedAndTranscriptionForm],
  ["coelésti","cælesti / caelesti"]);
 assert.equal(e.orthography.automaticSpellingRewriteForbidden,true);
 assert.notEqual(e.orthography.foldedDonorWithoutAccent,e.orthography.foldedWitnessWithoutAccent);
 assert.deepEqual([e.orthography.foldedDonorWithoutAccent,e.orthography.foldedWitnessWithoutAccent],
  ["coelesti","caelesti"]);
 assert.equal(e.witnesses?.length,4);
 const seen=new Set();
 for(const witness of e.witnesses){
  assert.ok(!seen.has(witness.id));seen.add(witness.id);
  assert.ok(witness.url.startsWith("https://")&&witness.sourcePhrase.length>12);
  assert.equal(witness.witnessIsOriginal1962VaticanPhotograph,false);
  assert.equal(witness.independentlyAuthenticatedPrintedEdition,false);
 }
 const w=new Map(e.witnesses.map(v=>[v.id,v]));
 assert.equal(w.get("INTRATEXT_RITUS_IX1").sourcePhrase,"omni benedictione + caelesti");
 assert.equal(w.get("DOCUMENTA_2006_HTML_DERIVED_PDF").sourcePhrase,"omni benedictióne ✠ cælésti");
 assert.equal(w.get("REPRINT_2004_PRE1962_TYPOGRAPHICAL_TRADITION").sourcePhrase,"omni benedictione † cælesti");
 assert.equal(w.get("BENZIGER_PERIOD_EDITIO_IUXTA_TYPICAM").sourcePhrase,"omni benedictione cælesti, seipsum signat");
 assert.equal(w.get("BENZIGER_PERIOD_EDITIO_IUXTA_TYPICAM").corroborates,
  "GESTURE_ON_THIS_PHRASE_BUT_OCR_DOES_NOT_CERTIFY_GLYPH");
 assert.equal(e.criticalAssessment.latinInstructionReading,"RITUS_IX1_SELF_SIGN_CONFIRMED_AT_PHRASE");
 assert.equal(e.criticalAssessment.exactSourceDonorGlyphMatch,"NOT_ESTABLISHED_ORTHOGRAPHY_DIFFERS");
 assert.equal(e.criticalAssessment.independentTypicaPrintedGlyphCollation,"NOT_COMPLETED");
 assert.equal(e.criticalAssessment.candidateWordBoundary,"EXACT_IN_FROZEN_DONOR_ONLY");
 assert.equal(e.criticalAssessment.C0190EditorialStatus,RITUS);
 for(const key of ["independent1962FacsimileSignoff","independentLatinAndBilingualCopySignoff",
   "independentCeremonialSignoff","independentActorClockAcceptance",
   "finalGesturePublicationApproval"]){
  assert.equal(e.criticalAssessment[key],"NOT_GRANTED",key);
 }
 assert.equal(e.releaseInvariant.preserveFrozenDonorText,true);
 assert.equal(e.releaseInvariant.noUserFacingCrossInserted,true);
 assert.equal(e.releaseInvariant.noAutomaticRepositioning,true);
 assert.equal(e.releaseInvariant.noImpliedPriestClockFromReaderFocus,true);
 const auditRow=triggerAudit.rows.find(x=>x.id===action);
 assert.equal(auditRow.cueId,cue);
 assert.equal(auditRow.sourceLatin,SOURCE);
 assert.equal(auditRow.rubricSource,"IX.1");
 assert.equal(auditRow.preciseActorTiming,"ACTUAL_PRIEST_OBSERVATION_REQUIRED");
 const promotionRow=promotion.decisions.find(x=>x.cueId===cue);
 assert.equal(promotionRow.candidateActionId,action);
 assert.equal(promotionRow.publication,"NOT_APPROVED_NOT_VISIBLE");
 assert.equal(promotionRow.placement,"GUIDE_ONLY_PENDING_CROSS_SIGN_OFFSET");
 assert.equal(promotionRow.sourceGestureOffsetReview,
  "DONOR_COELESTI_VS_1962_CAELESTI_SOURCE_CROSS_OFFSET_PENDING");
 const ext=crosswalk.rows.find(x=>x.actionId===action);
 assert.equal(ext.canonicalDonorOrthography,TOKEN);
 assert.equal(ext.attestedCrossMarkLocation,"BETWEEN_OMNI_BENEDICTIONE_AND_CAELESTI");
 assert.equal(ext.sourceExactInlineOffsetVerified,false);
 const oldPrinted=printed.records.find(x=>x.actionId===action);
 assert.equal(oldPrinted.witness.primary1962PrintedFacsimileVerified,false);
 assert.equal(oldPrinted.independentCeremonialSignoff,"NOT_GRANTED");
 const complexRow=complex.records.find(x=>x.actionId===action);
 assert.equal(complexRow.originalEditionAuthentication,"NOT_GRANTED");
 assert.equal(complexRow.independentCriticalTextCollation,"NOT_GRANTED");
 assert.equal(complexRow.canPublish,false);
 const earlyAnchor=resolveCanonLatinWordAnchors({sourceLatin:SOURCE,
   anchorKind:"SOURCE_LATIN_WORDS",anchorLatin:"omni benedictióne"});
 assert.equal(earlyAnchor.status,"WORD_MATCH_EXACT");
 assert.equal(earlyAnchor.spans[0].start,0);
 assert.equal(earlyAnchor.spans[0].end,P-1);
 // "Matched source words" is not evidence of the sign's exact actor-clock event.
 assert.equal(earlyAnchor.spans[0].sourceText,"omni benedictióne");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const q=buildCanon42ApprovalQueue({...queueOwners,form,editorialPreview:true});
  const row=q.rows.find(x=>x.cueId===cue);
  assert.equal(row.canPublish,false);
  assert.equal(row.liveText,null);
  assert.equal(row.priestActionNow,null);
  assert.equal(q.publicationReady,0);
 }
 return {cue,action,donorOffsetBeforeCoelesti:P,witnesses:e.witnesses.length,
   verifiedOriginalVatican1962Facsimile:false,liveApproved:false};
}
const result=audit(evidence);
function reject(mutator){
 const data=structuredClone(evidence);mutator(data);
 assert.throws(()=>audit(data));
}
reject(x=>x.owner.cueId="AO.SM.C0999");
reject(x=>x.proposedOnly.utf16Boundary=0);
reject(x=>x.proposedOnly.exactTextAfterBoundary="cælesti et grátia repleámur.");
reject(x=>x.frozenDonor.low.latin=x.frozenDonor.low.latin.replace("coelésti","cælesti"));
reject(x=>x.orthography.automaticSpellingRewriteForbidden=false);
reject(x=>x.witnesses[0].witnessIsOriginal1962VaticanPhotograph=true);
reject(x=>x.witnesses[3].corroborates="EXACT_GLYPH_PROVEN");
reject(x=>x.criticalAssessment.independentTypicaPrintedGlyphCollation="COMPLETED");
reject(x=>x.criticalAssessment.finalGesturePublicationApproval="GRANTED");
reject(x=>x.proposedOnly.mayMoveToLive=true);
reject(x=>x.proposedOnly.mayInferRealGestureFromScroll=true);
console.log("MASS_CANON_C0190_CRITICAL_COLLATION="+JSON.stringify(result));
console.log("PASS C0190 cross-word boundary localized editorially; donor untouched, source spelling mismatch preserved, independent 1962 printed glyph and LIVE stage signoffs withheld.");
