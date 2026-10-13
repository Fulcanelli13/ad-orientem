import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  validateCanonRubricReview,createCanonRubricReviewController,projectCanonParagraphReviews,
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
assert.equal(observed.priestActions[0].priestCueObserved,true);
assert.equal(observed.priestActions[0].isObservedNow,false,
  "Priest observed at a cue is not proof that any micro-action has occurred");
const observedAction=controller.project("AO.SM.C0150",{
  editorialPreview:true,form:"SOLEMN",
  priestObservedCueId:"AO.SM.C0150",
  observedPriestActionIds:["AO.CANON.R62.001"],
});
assert.equal(observedAction.priestActions[0].isObservedNow,true,
  "An independently observed EXACT priest micro-action may be marked individually");
assert.equal(observed.priestActions[0].publishable,false);
assert.equal(observed.postureCandidate?.value,"KNEEL");
assert.equal(observed.faithfulPosture,null,
  "Even a selected sourced candidate does not automatically authorise pew posture");
const elevation=controller.project("AO.SM.C0174",{editorialPreview:true});
assert.equal(elevation.priestActions.length,4);
assert.equal(elevation.ministerActions.length,1);
assert.equal(elevation.ministerActions[0].isObservedNow,false);
// Host genuflections and elevation share C0174, but happen sequentially.
const onlyElevation=controller.project("AO.SM.C0174",{
  editorialPreview:true,priestObservedCueId:"AO.SM.C0174",
  observedPriestActionIds:["AO.CANON.R62.024"],
});
assert.deepEqual(onlyElevation.priestActions.filter(x=>x.isObservedNow).map(x=>x.id),
  ["AO.CANON.R62.024"],"A single witnessed elevation cannot trigger all 4 priest actions");
assert.equal(onlyElevation.priestActions.filter(x=>x.priestCueObserved).length,4,
  "Whole-cue observation remains distinct from individual action evidence");
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
const paragraphReviews=projectCanonParagraphReviews([
  {id:"CANON.FOCUS.1",sourceCueIds:["AO.SM.C0150"]},
  {id:"CANON.SYNTHETIC.OREMUS",sourceCueIds:[],sourceAnchorCueId:"AO.SM.C0150"},
  {id:"CANON.FOCUS.2",sourceCueIds:["AO.SM.C0174","AO.SM.C0181"]},
  {id:"CANON.FOCUS.3",sourceCueIds:["AO.SM.C0150","AO.SM.C0150"]},
  {id:"CANON.NONRITUAL",sourceCueIds:["OTHER.002"]},
],controller,{editorialPreview:true,form:"LOW"});
assert.deepEqual(paragraphReviews.map(x=>x.cueReviews.length),[1,0,2,1,0],
  "Paragraphs must link independently to canonical source cues only");
assert.deepEqual(paragraphReviews[2].cueReviews.map(x=>x.cueId),
  ["AO.SM.C0174","AO.SM.C0181"],"Composite paragraph lost one actual cue");
assert.equal(paragraphReviews[1].canPublish,false);
assert.equal(paragraphReviews[1].cueReviews.length,0,
  "Derived Oremus sourceAnchorCueId must not masquerade as priest action");
assert.equal(paragraphReviews[0].cueReviews[0].priestActions[0].isObservedNow,false);
assert.throws(()=>projectCanonParagraphReviews(null,controller),/Reader paragraphs required/);


const promotion=load("../data/research/mass-canon-42-rubric-promotion-review-20261013.json");
const frenchDrafts=load("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json");
const latinAnchors=load("../data/research/mass-canon-62-source-trigger-audit-20261013.json");
const gaps=source.rows.filter(x=>x.gapPending===true);
const frenchByAction=new Map(frenchDrafts.rows.map(x=>[x.id,x]));
const anchorsByAction=new Map(latinAnchors.rows.map(x=>[x.id,x]));
assert.equal(promotion.schema,"ao-mass-canon-42-rubric-promotion-review-v1");
assert.equal(promotion.status,"EDITORIAL_TRIAGE_REQUIRES_INDEPENDENT_SOURCE_AND_COPY_APPROVAL");
assert.deepEqual(promotion.decisions.map(x=>x.cueId),gaps.map(x=>x.cueId),
  "42-gap promotion ledger must be source-ordered and exhaustive, not an arbitrary subsection");
assert.equal(new Set(promotion.decisions.map(x=>x.cueId)).size,42);
assert.equal(new Set(promotion.decisions.map(x=>x.candidateActionId)).size,42);
const pendingPhase={PRE_CONSECRATION:0,HOST_CONSECRATION:0,
  CHALICE_CONSECRATION:0,POST_CONSECRATION:0};
let firstPass=0,secondPass=0;
for(const [i,decision] of promotion.decisions.entries()){
  const sourceRow=gaps[i],action=sourceRow.candidateActions[0];
  assert.equal(sourceRow.candidateActions.length,1,decision.cueId+": ambiguous gap action count");
  assert.equal(decision.candidateActionId,action.id,decision.cueId+": canonical micro-action changed");
  assert.equal(frenchByAction.get(action.id)?.cueId,decision.cueId);
  assert.equal(anchorsByAction.get(action.id)?.cueId,decision.cueId);
  assert.equal(decision.publication,"NOT_APPROVED_NOT_VISIBLE",
    decision.cueId+": triage is not authorization to release French copy");
  assert.ok(Object.hasOwn(pendingPhase,decision.phase),"Unknown Canon phase");
  const number=Number(decision.cueId.slice(-4));
  const expectedPhase=number<=165?"PRE_CONSECRATION":number<=174?"HOST_CONSECRATION":
    number<=181?"CHALICE_CONSECRATION":"POST_CONSECRATION";
  assert.equal(decision.phase,expectedPhase,decision.cueId+": incorrect source cue phase");
  pendingPhase[decision.phase]++;
  const simple=decision.reviewGate==="FIRST_PASS_REVIEW_READY_FOR_EDITORIAL_SIGNOFF";
  const hold=decision.reviewGate==="SECOND_PASS_REQUIRED_BEFORE_EDITORIAL_SIGNOFF";
  assert.ok(simple||hold,decision.cueId+": unknown editorial stage");
  if(simple){
    firstPass++;
    assert.equal(decision.reviewTrack,"STRAIGHT_SOURCE_RUBRIC");
    assert.deepEqual(frenchByAction.get(action.id).editorialFlags,[],
      decision.cueId+": a qualified source cannot silently gain first-pass release readiness");
  }else secondPass++;
}
assert.deepEqual([firstPass,secondPass],[19,23],"Canon rubric review denominator changed");
assert.deepEqual(pendingPhase,promotion.counts.byPhase);
assert.deepEqual([promotion.counts.gapCandidates,promotion.counts.firstPassCopyReview,
  promotion.counts.requiresFurtherCeremonialOrTextReview],[42,19,23]);
for(const cue of ["AO.SM.C0159","AO.SM.C0163","AO.SM.C0207"]){
  assert.ok(!promotion.decisions.some(x=>x.cueId===cue),
    cue+": a continuation/deacon/source response cannot be invented as a missing priest rubric");
}
for(const [cue,track,placement] of [
  ["AO.SM.C0172","EXPLANATORY_NO_ACTION","GUIDE_NOTE_NOT_GESTURE"],
  ["AO.SM.C0186","CONTINUING_STATE_NO_NEW_GESTURE","PRIEST_STATE_CONTINUATION_NO_TRANSIENT"],
  ["AO.SM.C0199","CONTINUING_STATE_NO_NEW_GESTURE","PRIEST_STATE_CONTINUATION_NO_TRANSIENT"],
  ["AO.SM.C0196","VOICE_AND_GESTURE_BOUNDARY","VOICE_RIBBON_NOT_DUPLICATED_INLINE"],
  ["AO.SM.C0206","VOICE_AND_GESTURE_BOUNDARY","VOICE_RIBBON_NOT_DUPLICATED_INLINE"],
  ["AO.SM.C0201","FORM_OR_MINISTER_DEPENDENT","CANDIDATE_INLINE_RUBRIC_AFTER_COPY_APPROVAL"],
]){
 const d=promotion.decisions.find(x=>x.cueId===cue);
 assert.deepEqual([d?.reviewTrack,d?.placement],[track,placement],
   cue+": high-risk Canon reader ownership gate lost");
}

console.log("PASS Canon 58/62 source-anchored preview: 42 rubric gaps preserved; form, actor and observational clocks fail closed.");
