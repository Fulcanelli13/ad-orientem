import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCanon42ApprovalQueue} from "../tools/mass-canon-42-approval-queue.mjs";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const evidence=load("../data/research/mass-canon-23-latin-page-image-evidence-20261109.v1.json");
const original={
  complex:load("../data/research/mass-canon-complex-23-ritus-source-review-20261013.json"),
  firstPass:load("../data/research/mass-canon-first-pass-19-ritus-source-review-20261013.json"),
  promotion:load("../data/research/mass-canon-42-rubric-promotion-review-20261013.json"),
  printed:load("../data/research/mass-canon-29-printed-page-witness-crosswalk-20261014.json"),
};
const expectedScanIndices=Object.freeze({
 "001":[64],"003":[64],"004":[64],"008":[64],"013":[64],
 "017":[64],"021":[64],"022":[64],"028":[64,65],
 "032":[65],"033":[65],"038":[65],"039":[65],"040":[65],
 "043":[65],"044":[65],"050":[65],"051":[65],"053":[65],
 "055":[65],"058":[65],"059":[65],"060":[65]
});
const image=n=>"https://www.ourladyisgod.com/images/eBooks/Missale-Romanum-1962-color/Missale-Romanum-1962-Roman-Missal-color-"+String(n).padStart(4,"0")+".jpg";
const PAGE_STATUS="RITUS_SECTION_LOCATED_CANDIDATE_LEAF_NOT_GLYPH_BY_GLYPH_CERTIFIED";
const requiredHold="NOT_GRANTED";
function assertWitness(data){
 assert.equal(data.schema,"ao-mass-canon-23-latin-visual-leaf-crosswalk-v1");
 assert.equal(data.status,"VISUAL_LATIN_LEAVES_LOCATED_EDITION_PROVENANCE_GLYPH_AND_EDITORIAL_APPROVAL_OPEN");
 assert.equal(data.sourceOwner,"data/research/mass-canon-complex-23-ritus-source-review-20261013.json");
 assert.deepEqual(data.counts,{
  complexCases:23,sourceSectionLeafCandidatesLocated:23,
  photographedLatinLeaves:2,locatorsRequiringCriticalActionGlyphVerification:23,
  printedEditionAuthenticationApprovals:0,independentBilingualCopySignoffs:0,
  stageClockApprovals:0,livePublished:0,
  issueClasses:original.complex.totals.issueClasses
 });
 assert.equal(data.invariants.photographIsNotEditionProof,true);
 assert.equal(data.invariants.preserveC0190CanonicalTextVariantHold,true);
 assert.equal(data.invariants.stageOrderNotInferredFromReaderScroll,true);
 assert.equal(data.invariants.noPublishedFrenchCopy,true);
 assert.deepEqual(data.visualLeaves.map(l=>l.scanNumber),[64,65]);
 assert.equal(data.records.length,23);
 const owned=new Map(original.complex.rows.map(r=>[r.actionId,r]));
 const ids=new Set(), cues=new Set(),sections={};
 for(const r of data.records){
  const prior=owned.get(r.actionId);
  assert.ok(prior,"Source-owner mismatch at "+r.actionId);
  assert.equal(prior.cueId,r.cueId);
  assert.equal(prior.issueClass,r.issueClass);
  assert.equal(prior.sourceSection,r.sourceRitus);
  assert.equal(prior.sourceAdjudication,r.originalSourceIssue);
  assert.equal(prior.requiredPresentationGate,r.requiredPresentationGate);
  assert.ok(!ids.has(r.actionId)&&!cues.has(r.cueId),
   "Repeated or invented Canon candidate");
  ids.add(r.actionId);cues.add(r.cueId);
  const pages=expectedScanIndices[r.actionId.split(".").at(-1)];
  assert.deepEqual(r.visualLatinLeafCandidates.map(p=>p.scanNumber),pages);
  for(const p of r.visualLatinLeafCandidates){
   assert.equal(p.printedRomanPage,p.scanNumber===64?"lv":"lvi");
   assert.equal(p.imageUrl,image(p.scanNumber));
   assert.equal(p.sourceType,"PHOTOGRAPHIC_LATIN_MISSAL_LEAF_NONINSTITUTIONAL_HOST");
   assert.equal(p.latinEditionProvenanceIndependentlyAuthenticated,false);
   assert.equal(p.readingStatus,"PAGE_LOCATED_NOT_ORIGINAL_EDITION_CERTIFIED");
  }
  assert.equal(r.visualSourcePageMatch,PAGE_STATUS);
  assert.equal(r.direct1962LatinTranscription,"https://www.clerus.org/bibliaclerusonline/EN/gmb.htm");
  for(const key of [
   "originalEditionAuthentication","independentCriticalTextCollation",
   "independentBilingualCopyApproval","independentCeremonialApproval",
   "readerAcceptance"
  ])assert.equal(r[key],requiredHold,r.cueId+" "+key);
  assert.equal(r.priestAndMinisterActualClock,"INDEPENDENT_ROLE_AND_STAGE_OBSERVATION_REQUIRED");
  assert.equal(r.publicationReview,"NOT_APPROVED_NOT_VISIBLE");
  assert.equal(r.canPublish,false);
  assert.equal(r.readerDisplayText,null);
  assert.equal(r.actorNow,null);
  assert.equal(r.faithfulPosture,null);
  sections[r.sourceRitus]=(sections[r.sourceRitus]??0)+1;
 }
 assert.deepEqual([...ids].sort(),original.complex.rows.map(r=>r.actionId).sort());
 const c0190=data.records.find(r=>r.cueId==="AO.SM.C0190");
 assert.equal(c0190.issueClass,"CANONICAL_TEXT_VARIANT");
 assert.equal(c0190.requiredPresentationGate,"EXACT_RENDERED_SOURCE_TEXT_ANCHOR");
 assert.equal(c0190.independentCriticalTextCollation,requiredHold);
 const deacon=data.records.filter(r=>r.issueClass==="CONDITIONAL_MINISTER");
 assert.equal(deacon.length,3);
 assert.ok(deacon.every(r=>r.priestAndMinisterActualClock==="INDEPENDENT_ROLE_AND_STAGE_OBSERVATION_REQUIRED"));
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const queue=buildCanon42ApprovalQueue({...original,form,editorialPreview:true});
  assert.equal(queue.counts.total,42);
  assert.equal(queue.counts.complexCeremonial,23);
  assert.equal(queue.publicationReady,0);
  assert.ok(queue.rows.every(x=>x.liveText===null&&x.priestActionNow===null&&x.canPublish===false));
 }
 return {cases:ids.size,sourceLeaves:[64,65],sourceSections:sections,
  typedIndependentApprovals:0,livePublished:0};
}
const result=assertWitness(evidence);
const reject=modify=>{
 const d=structuredClone(evidence);modify(d);
 assert.throws(()=>assertWitness(d));
};
reject(d=>d.records.pop());
reject(d=>d.records[0].actionId="AO.CANON.R62.999");
reject(d=>d.records[1].cueId=d.records[0].cueId);
reject(d=>d.records[0].visualLatinLeafCandidates[0].scanNumber=66);
reject(d=>d.records[0].visualLatinLeafCandidates[0].latinEditionProvenanceIndependentlyAuthenticated=true);
reject(d=>d.records[0].independentCriticalTextCollation="SIGNED");
reject(d=>d.records[0].priestAndMinisterActualClock="READER_SCROLL");
reject(d=>d.records[0].readerDisplayText="Early published rubric");
reject(d=>d.records.find(x=>x.cueId==="AO.SM.C0190").independentCriticalTextCollation="SIGNED");
reject(d=>d.records.find(x=>x.cueId==="AO.SM.C0205").independentCeremonialApproval="SIGNED");
console.log("MASS_CANON_23_LATIN_VISUAL_LEAF_GATE="+JSON.stringify(result));
console.log("PASS 23 complex Canon source-section leaf candidates; no original edition or glyph approval; all 42 LIVE publication holds intact.");
