import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCanon42ApprovalQueue} from "../tools/mass-canon-42-approval-queue.mjs";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const witnesses={
  promotion:load("../data/research/mass-canon-42-rubric-promotion-review-20261013.json"),
  firstPass:load("../data/research/mass-canon-first-pass-19-ritus-source-review-20261013.json"),
  complex:load("../data/research/mass-canon-complex-23-ritus-source-review-20261013.json"),
  printed:load("../data/research/mass-canon-29-printed-page-witness-crosswalk-20261014.json"),
};
const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
const disabled=buildCanon42ApprovalQueue(witnesses);
assert.equal(disabled.status,"EDITORIAL_REVIEW_DISABLED");
assert.equal(disabled.rows.length,0);
assert.equal(disabled.canPublish,false);
for(const form of forms){
  const queue=buildCanon42ApprovalQueue({...witnesses,form,editorialPreview:true});
  assert.equal(queue.status,"42_CANON_CUES_SOURCE_TRIAGED_NOT_APPROVED");
  assert.equal(queue.canPublish,false);
  assert.equal(queue.publicationReady,0);
  assert.deepEqual(queue.counts,{
    total:42,sourceAlignedCopy:18,copyPrecisionHold:1,
    complexCeremonial:23,flaggedPrintedWitnessHolds:18,
    originalPrintedCases:29,independentlyApproved:0,livePublished:0,
  });
  assert.equal(queue.rows.length,42);
  assert.equal(new Set(queue.rows.map(x=>x.cueId)).size,42);
  assert.equal(new Set(queue.rows.map(x=>x.actionId)).size,42);
  assert.equal(queue.rows.filter(x=>x.queue==="FIRST_PASS_FRENCH_COPY").length,19);
  assert.equal(queue.rows.filter(x=>x.queue==="SECOND_PASS_CEREMONIAL").length,23);
  assert.deepEqual(queue.rows.slice(0,18).map(x=>x.reviewIssue),
    Array(18).fill("EDITORIAL_SIGNOFF_PENDING"));
  const hold=queue.rows[18];
  assert.equal(hold.cueId,"AO.SM.C0187");
  assert.equal(hold.actionId,"AO.CANON.R62.041");
  assert.equal(hold.reviewIssue,"COPY_PRECISION_HOLD");
  assert.match(hold.copyCorrectionCandidate,/Súpplices te rogámus/);
  assert.match(hold.copyCorrectionQualification,/degree of inclination/);
  assert.ok(queue.rows.slice(19).every(x=>x.queue==="SECOND_PASS_CEREMONIAL"));
  assert.equal(queue.rows.filter(x=>x.printedWitnessIndependentlyApproved).length,0);
  assert.equal(queue.rows.filter(x=>x.printedWitnessStatus==="PAGE_LOCATED_NOT_FACSIMILE_APPROVED").length,18);
  for(const row of queue.rows){
    assert.equal(row.form,form);
    assert.ok(row.sourceLinks.length>=1&&row.sourceLinks.every(u=>u.startsWith("https://")));
    assert.equal(row.independentSourceApproval,"NOT_GRANTED");
    assert.equal(row.bilingualCopyApproval,"NOT_GRANTED");
    assert.equal(row.actorAndClockApproval,"INDEPENDENT_OBSERVATION_REQUIRED");
    assert.equal(row.readerAcceptance,"NOT_GRANTED");
    assert.equal(row.liveText,null);
    assert.equal(row.priestActionNow,null);
    assert.equal(row.faithfulPosture,null);
    assert.equal(row.canPublish,false);
    assert.equal(row.publication,"EDITORIAL_ONLY_NOT_VISIBLE");
    assert.ok(Object.isFrozen(row));
  }
  console.log("CANON_42_APPROVAL_QUEUE_GATE="+JSON.stringify({
    form,counts:queue.counts,publicationReady:queue.publicationReady,
    precisionHold:hold.cueId,
  }));
}
assert.equal(buildCanon42ApprovalQueue({...witnesses,form:"REQUIEM",editorialPreview:true}).rows.length,0);
const mutated=change=>{const copy=structuredClone(witnesses);change(copy);return copy;};
const refuse=(description,change)=>{
  assert.throws(()=>buildCanon42ApprovalQueue({
    ...mutated(change),form:"SOLEMN",editorialPreview:true,
  }),/Canon approval queue:/,description);
};
refuse("Missing one of the original 42 cues",x=>x.promotion.decisions.pop());
refuse("Invented live promotion",x=>x.promotion.decisions[0].publication="PUBLISHED");
refuse("Missing first-pass original",x=>x.firstPass.rows.shift());
refuse("Unapproved change of source cue identity",x=>x.firstPass.rows[0].cueId="AO.SM.C0999");
refuse("False source signoff",x=>x.firstPass.rows[0].publication="PUBLISHED");
refuse("Unverified French copy precision",x=>{
 x.firstPass.rows.find(y=>y.cueId==="AO.SM.C0187").qualificationNote=null;
});
refuse("Complex source made live",x=>x.complex.rows[0].displayInLive="PUBLISHED");
refuse("Complex source made automatically clocked",x=>x.complex.rows[0].sourceClock="SCROLL_POSITION");
refuse("29-case printed-facsimile false signoff",x=>x.printed.records[0].witness.primary1962PrintedFacsimileVerified=true);
refuse("29-case French false signoff",x=>x.printed.records[0].independentCopySignoff="GRANTED");
refuse("29-case live action clock false signoff",x=>x.printed.records[0].exactLiveClockObserved=true);
refuse("Printed witness swapped to another Canon cue",x=>{
  const x42=new Set(x.promotion.decisions.map(y=>y.candidateActionId));
  const p=x.printed.records.find(y=>x42.has(y.actionId));
  p.cueId="AO.SM.C0999";
});
refuse("False first-pass versus second-pass promotion gate",x=>{
  x.promotion.decisions[0].reviewGate="FIRST_PASS_REVIEW_READY_FOR_EDITORIAL_SIGNOFF";
});
console.log("PASS Canon 42: 18 source-aligned, 1 qualified French edit, 23 complex; 29 original witnesses still unsigned; zero publication.");
