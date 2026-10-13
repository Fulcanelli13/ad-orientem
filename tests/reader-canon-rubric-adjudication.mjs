import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  validateCanonRubricAdjudication,createCanonRubricAdjudicationController,
} from "../src/mass/reader-canon-rubric-adjudication.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const canonData=load("../data/presentation/reader-canon-rubric-review.v1.json");
const triggerAudit=load("../data/research/mass-canon-62-source-trigger-audit-20261013.json");
const frenchReview=load("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json");
const original=load("../data/research/mass-canon-14-ritus1962-french-microactions-20261013.json");
const corpus=load("../data/presentation/reader-text-sung.v1.json");
const sourceCues=new Map(corpus.blocks.flatMap(x=>x.units??[]).map(y=>[y.cue_id,y.latin]));
assert.equal(canonData.status,"EDITORIAL_PREVIEW_ONLY_NOT_APPROVED_FOR_LIVE_PRIEST_RAIL");
const audit=validateCanonRubricAdjudication({canonData,triggerAudit,frenchReview});
assert.equal(audit.reviewActions,62);
assert.equal(audit.cueCount,58);
assert.equal(audit.editorialState,"ALL_62_FRENCH_DRAFTS_NEED_PUBLICATION_APPROVAL");
assert.deepEqual(audit.anchorKinds,{
  SOURCE_LATIN_WORDS:50,ORDERED_NON_TEXT_CEREMONY:10,
  PERSISTENT_SOURCE_STATE:1,OBSERVED_ANTICIPATORY_EVENT:1,
});
assert.equal(audit.publicationReady,0);
assert.ok(audit.frenchRedrafts>30,"French source-check must be substantive, not recycled boilerplate");
assert.deepEqual(triggerAudit.rows.map(x=>x.id),original.microActions.map(x=>x.id));
assert.deepEqual(frenchReview.rows.map(x=>x.id),original.microActions.map(x=>x.id));
for(const row of triggerAudit.rows){
  assert.equal(row.sourceLatin,sourceCues.get(row.cueId),
    row.id+": researched anchor must preserve exact frozen source Latin");
  if(row.sourceAnchorType==="SOURCE_LATIN_WORDS"){
    assert.equal(row.triggerVerifiedInCue,true);
    assert.ok(row.verifiedSourceWordAnchor);
  }else assert.equal(row.verifiedSourceWordAnchor,null);
}
const reader=createCanonRubricAdjudicationController({canonData,triggerAudit,frenchReview});
assert.equal(reader.supported,true);
const none=reader.project("AO.SM.C0174");
assert.equal(none.previewEnabled,false);
assert.equal(none.priestActions.length,0);
assert.equal(none.canPublish,false);
for(const row of canonData.rows){
  const review=reader.project(row.cueId,{editorialPreview:true,form:"LOW"});
  assert.equal(review.previewEnabled,true);
  assert.equal(review.canPublish,false);
  assert.equal(review.publicationState,"FRENCH_EDITORIAL_SIGNOFF_REQUIRED");
  assert.equal(review.faithfulPosture,null);
  assert.equal(review.priestStationObservedNow,false);
  assert.deepEqual(
    [...review.priestActions,...review.ministerActions].map(x=>x.id).sort(),
    row.candidateActions.map(x=>x.id).sort()
  );
  for(const action of [...review.priestActions,...review.ministerActions]){
    const fr=frenchReview.rows.find(x=>x.id===action.id);
    assert.equal(action.frenchDraft,fr.revisedFrenchRubric);
    assert.equal(action.publishable,false);
    assert.equal(action.canPublish,false);
    assert.equal(action.sourceRitusLocator,fr.ritusLocator);
    assert.equal(action.isObservedNow,false);
  }
}
const host=reader.project("AO.SM.C0174",{
  form:"SOLEMN",editorialPreview:true,priestObservedCueId:"AO.SM.C0174",
  observedPriestActionIds:["AO.CANON.R62.024"],
  observedMinisterActionIds:["AO.CANON.R62.027"],
});
assert.equal(host.priestActions.length,4);
assert.equal(host.ministerActions.length,1);
assert.deepEqual(host.priestActions.filter(x=>x.isObservedNow).map(x=>x.id),["AO.CANON.R62.024"],
  "Host genuflection, elevation, replacement and lasting finger discipline may not run simultaneously");
assert.equal(host.ministerActions[0].isObservedNow,true);
assert.equal(host.priestActions.find(x=>x.id==="AO.CANON.R62.026").anchorKind,"PERSISTENT_SOURCE_STATE");
const chalice=reader.project("AO.SM.C0181",{editorialPreview:true});
assert.equal(chalice.priestActions[0].anchorKind,"ORDERED_NON_TEXT_CEREMONY");
assert.deepEqual(chalice.priestActions[0].stages.map(x=>x.action),[
  "PRIEST_RISES_AFTER_FIRST_GENUFLECTION",
  "PRIEST_ELEVATES_CHALICE",
  "PRIEST_REPLACES_CHALICE",
  "CHALICE_IS_COVERED_BY_AUTHORIZED_ROLE",
  "PRIEST_GENUFLECTS_SECOND_TIME",
]);
assert.equal(chalice.ministerActions[0].actor,"SERVER");
const bell=reader.project("AO.SM.C0161",{editorialPreview:true});
assert.equal(bell.ministerActions.find(x=>x.id==="AO.CANON.R62.062").anchorKind,
  "OBSERVED_ANTICIPATORY_EVENT");
assert.equal(bell.ministerActions[0].checkedLatinWords,null);
const post=reader.project("AO.SM.C0206",{editorialPreview:true});
assert.equal(post.priestActions[0].anchorKind,"SOURCE_LATIN_WORDS");
assert.equal(post.priestActions[0].checkedLatinWords,"Per ómnia");
const signed=reader.project("AO.SM.C0196",{editorialPreview:true});
assert.match(signed.priestActions[0].frenchDraft,/se frappe une fois la poitrine/);
const voices=reader.project("AO.SM.C0197",{editorialPreview:true});
assert.match(voices.priestActions[0].frenchDraft,/voix secrète/);
const noForm=reader.project("AO.SM.C0201",{editorialPreview:true,form:"REQUIEM"});
assert.equal(noForm.previewEnabled,false);
assert.equal(noForm.priestActions.length,0);
assert.equal(createCanonRubricAdjudicationController({canonData}).supported,false,
  "Incomplete source triad must fail closed");
const bad=structuredClone(frenchReview);
bad.rows[0].actor="FAITHFUL";
assert.throws(()=>validateCanonRubricAdjudication({canonData,triggerAudit,frenchReview:bad}),
 /event identity diverges/);
const fake=structuredClone(triggerAudit);
fake.rows.find(x=>x.id==="AO.CANON.R62.062").sourceAnchorType="SOURCE_LATIN_WORDS";
assert.throws(()=>validateCanonRubricAdjudication({canonData,triggerAudit:fake,frenchReview}),
 /identity diverges/);
const prematurelyPublished=structuredClone(frenchReview);
prematurelyPublished.status="APPROVED";
assert.throws(()=>validateCanonRubricAdjudication({
 canonData,triggerAudit,frenchReview:prematurelyPublished,
}),/published\/user-facing/);
console.log("PASS: 62 bilingual source-checked Canon redrafts; 50 exact word, 10 non-text, 1 persistent, 1 anticipatory; independent actor clocks and no publication.");
