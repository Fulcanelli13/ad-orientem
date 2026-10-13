import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  validateCanonRubricReview,createCanonRubricReviewController,
  CANON_RUBRIC_REVIEW_SCHEMA,
} from "../src/mass/reader-canon-rubric-review.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const source=load("../data/presentation/reader-canon-rubric-review.v1.json");
const witness=load("../data/research/mass-canon-14-ritus1962-french-microactions-20261013.json");
const gap=load("../data/research/mass-canon-14-rubric-registry-gap-audit-20261013.json");
const faithful=load("../data/research/mass-canon-faithful-postures-and-gestures-58-cues-20261013.json");
const canonical=load("../data/presentation/reader-text-sung.v1.json");
const known=new Map(canonical.blocks.flatMap(block=>(block.units??[]).map(x=>[x.cue_id,block.Block_ID])));

assert.equal(source.schema,CANON_RUBRIC_REVIEW_SCHEMA);
const audit=validateCanonRubricReview(source);
assert.deepEqual([
  audit.cueCount,audit.candidateActionCount,
  audit.priestActionCount,audit.ministerActionCount,
  audit.pendingDetailedRubricCues,audit.existingDetailedRubricCues,
],[58,62,58,4,42,13],"Canon full batch denominators changed");
assert.deepEqual(source.rows.map(row=>row.cueId),witness.cueIndex.map(x=>x.cueId),
  "Generated preview must remain source-order faithful to Latin audit");
assert.deepEqual(source.rows.map(row=>row.cueId),faithful.items.map(x=>x.cueId),
  "Faithful observation candidates must match exact Canon cues");
for(const row of source.rows){
  assert.equal(known.get(row.cueId),row.blockId,
    "Unknown or moved source cue in editorial projection "+row.cueId);
  const actions=witness.microActions.filter(x=>x.cueId===row.cueId);
  assert.deepEqual(row.candidateActions.map(a=>a.id),actions.map(a=>a.id),
    row.cueId+" candidate action count/order changed");
  for(const action of row.candidateActions){
    const original=actions.find(a=>a.id===action.id);
    assert.equal(action.frenchParaphraseDraft,original.inTextPriestRubricFrDraft,
      "Review French paraphrase diverged from source research");
    assert.equal(action.ritusLocator,original.ritusLocator);
    assert.equal(action.formQualification,original.formQualification);
  }
  const ownGap=gap.rows.find(x=>x.cueId===row.cueId);
  assert.equal(row.gapPending,ownGap.isPriestRubricCoverageGap,
    "Source gap cannot be declared closed by research-only overlay");
  assert.deepEqual(row.existingDetailedRubricIds,ownGap.existingDetailedRubricIds,
    "Existing certified R17 rubrics cannot be silently replaced");
}
const controller=createCanonRubricReviewController({data:source});
assert.equal(controller.supported,true);
for(const row of source.rows){
  const inert=controller.project(row.cueId);
  assert.equal(inert.canPublish,false);
  assert.equal(inert.previewEnabled,false);
  assert.equal(inert.priestActions.length,0,
    "French rubric drafts must NEVER leak to the default reader");
  assert.equal(inert.ministerActions.length,0);
  assert.equal(inert.faithfulPosture,null);
  const review=controller.project(row.cueId,{form:"LOW",editorialPreview:true});
  assert.equal(review.canPublish,false);
  assert.equal(review.previewEnabled,true);
  assert.equal(review.faithfulPosture,null,
    "Priest ritual cannot create a universal congregation posture");
  assert.equal(review.gapPending,row.gapPending);
  assert.equal(review.publishedRubricIds.length,row.existingDetailedRubricIds.length);
  assert.equal(review.priestActions.length,
    row.candidateActions.filter(x=>x.actor==="PRIEST").length);
  assert.equal(review.ministerActions.length,
    row.candidateActions.filter(x=>x.actor!=="PRIEST").length);
  assert.ok(review.priestActions.every(x=>x.isObservedNow===false),
    "Read-focus may not claim a priest is currently executing the shown Canon cue");
}
const teIgitur=controller.project("AO.SM.C0150",{editorialPreview:true,form:"SOLEMN"});
assert.equal(teIgitur.priestActions[0].actionKey,"BOW_PROFOUND");
assert.equal(teIgitur.priestActions[0].ritusLocator,"VIII.1");
assert.equal(teIgitur.priestStationObservedNow,false);
assert.equal(teIgitur.postureCandidate?.value,"OBSERVE_LOCAL");
const observed=controller.project("AO.SM.C0150",{
  editorialPreview:true,form:"SOLEMN",priestObservedCueId:"AO.SM.C0150",
  communityProfile:"AO_DEFAULT_1962_SUNG",
});
assert.equal(observed.priestActions[0].isObservedNow,true,
  "Exact independent priest observation should remain distinguished from the reader cue");
assert.equal(observed.priestActions[0].publishable,false);
assert.equal(observed.postureCandidate?.value,"KNEEL");
assert.equal(observed.faithfulPosture,null,
  "Even a selected sourced candidate does not automatically authorise pew posture");
const elevation=controller.project("AO.SM.C0174",{editorialPreview:true});
assert.equal(elevation.priestActions.length,4);
assert.equal(elevation.ministerActions.length,1);
assert.equal(elevation.ministerActions[0].isObservedNow,false);
const observedBell=controller.project("AO.SM.C0174",{
  editorialPreview:true,observedMinisterActionIds:["AO.CANON.R62.027"],
});
assert.equal(observedBell.ministerActions[0].isObservedNow,true);
assert.equal(observedBell.ministerActions[0].publishable,false);
const anteConsecration=controller.project("AO.SM.C0161",{editorialPreview:true});
assert.ok(anteConsecration.ministerActions.some(x=>x.id==="AO.CANON.R62.062"));
assert.ok(anteConsecration.ministerActions.every(x=>x.isObservedNow===false),
  "Hanc igitur must not falsely trigger the server's anticipatory bell");
assert.equal(controller.project("AO.SM.C0150",{editorialPreview:true,form:"REQUIEM"}).previewEnabled,false,
  "Exceptional rite cannot inherit unreviewed ordinary Canon text");
assert.equal(controller.project("AO.SM.C9999",{editorialPreview:true}).supported,false);
assert.equal(createCanonRubricReviewController().supported,false);
const edited=structuredClone(source);
edited.rows[0].faithful.defaultProfile="UNIVERSAL_KNEEL";
assert.throws(()=>validateCanonRubricReview(edited),/universal pew posture/);
const wrongActor=structuredClone(source);
wrongActor.rows[0].candidateActions[0].actor="FAITHFUL";
assert.throws(()=>validateCanonRubricReview(wrongActor),/invalid or unsupported/);
const published=structuredClone(source);published.defaultPublication=true;
assert.throws(()=>validateCanonRubricReview(published),/draft cannot claim/);
console.log("PASS Canon 58/62 source-anchored preview: 42 rubric gaps preserved; form, actor and observational clocks fail closed.");
