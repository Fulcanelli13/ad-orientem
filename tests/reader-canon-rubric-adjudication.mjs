import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  validateCanonRubricAdjudication,createCanonRubricAdjudicationController,
} from "../src/mass/reader-canon-rubric-adjudication.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const canonData=load("../data/presentation/reader-canon-rubric-review.v1.json");
const triggerAudit=load("../data/research/mass-canon-62-source-trigger-audit-20261013.json");
const frenchReview=load("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json");
const ministerData=load("../data/research/mass-canon-minister-form-branches-20261013.json");
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
    if(action.anchorKind==="SOURCE_LATIN_WORDS"){
      assert.equal(action.anchorResolution,"WORD_MATCH_EXACT",action.id);
      assert.ok(action.exactLatinSpans.length>0,action.id);
    }else{
      assert.equal(action.anchorResolution,"NON_TEXT_SOURCE_EVENT",action.id);
      assert.equal(action.exactLatinSpans.length,0,action.id);
    }
  }
}
const hancFrench=frenchReview.rows.find(x=>x.id==="AO.CANON.R62.011");
assert.match(hancFrench.revisedFrenchRubric,/étend les deux mains ensemble/);
assert.match(hancFrench.revisedFrenchRubric,/paumes ouvertes/);
assert.doesNotMatch(hancFrench.revisedFrenchRubric,/mains réunies/,
 "Ritus VIII.4 specifies both hands extended over the oblata, not folded or joined");
const roles=createCanonRubricAdjudicationController({canonData,triggerAudit,frenchReview,ministerData});
const solemnHost=roles.project("AO.SM.C0174",{editorialPreview:true,form:"SOLEMN"});
const sungIncenseHost=roles.project("AO.SM.C0174",{editorialPreview:true,form:"MISSA_CANTATA_INCENSE"});
const noIncenseHost=roles.project("AO.SM.C0174",{editorialPreview:true,form:"MISSA_CANTATA_SIMPLE"});
assert.equal(solemnHost.priestActions.length,4);
assert.equal(solemnHost.ministerActions.length,1,
  "Original server bell must not be replaced or counted twice");
assert.equal(solemnHost.conditionalMinisterActions.length,2,
  "Solemn deacon and thurifer are distinct from the priest and the server bell");
assert.deepEqual(solemnHost.conditionalMinisterActions.map(x=>x.actor),
  ["DEACON","THURIFER"]);
assert.equal(sungIncenseHost.conditionalMinisterActions.length,1);
assert.equal(sungIncenseHost.conditionalMinisterActions[0].actor,"THURIFER");
assert.equal(noIncenseHost.conditionalMinisterActions.length,0);
assert.equal(roles.project("AO.SM.C0174",{form:"SOLEMN"}).priestActions.length,0);
const chalicelid=roles.project("AO.SM.C0205",{editorialPreview:true,form:"SOLEMN"});
assert.equal(chalicelid.conditionalMinisterActions.length,2);
assert.equal(chalicelid.conditionalMinisterActions[0].actor,"DEACON");
assert.equal(chalicelid.conditionalMinisterActions[0].conditionVerified,false);
// A Solemn deacon may cover the chalice, so the source chronology's
// covering milestones must not inherit the surrounding PRIEST action actor.
const solemnMajor=roles.project("AO.SM.C0181",{
 editorialPreview:true,form:"SOLEMN",
 observedStageIds:["AO.CANON.R62.034.04"],
});
assert.equal(solemnMajor.formDependentChaliceEvents.length,1);
assert.equal(solemnMajor.formDependentChaliceEvents[0].id,"AO.CANON.R62.034.04");
assert.equal(solemnMajor.formDependentChaliceEvents[0].actor,"UNRESOLVED_PRIEST_OR_DEACON");
assert.equal(solemnMajor.formDependentChaliceEvents[0].conditionalDeaconActionId,"AO.CANON.MIN.010");
assert.equal(solemnMajor.formDependentChaliceEvents[0].isObservedNow,false);
assert.ok(solemnMajor.priestActions.every(x=>x.stages.every(
 stage=>stage.id!=="AO.CANON.R62.034.04")),
 "Solemn chalice covering must never be presented within the priest gesture stages");
const solemnMinor=roles.project("AO.SM.C0205",{
 editorialPreview:true,form:"SOLEMN",
 observedStageIds:["AO.CANON.R62.059.02"],
});
assert.equal(solemnMinor.formDependentChaliceEvents.length,1);
assert.equal(solemnMinor.formDependentChaliceEvents[0].conditionalDeaconActionId,"AO.CANON.MIN.008");
assert.equal(solemnMinor.formDependentChaliceEvents[0].isObservedNow,false);
assert.ok(solemnMinor.priestActions.every(x=>x.stages.every(
 stage=>stage.id!=="AO.CANON.R62.059.02")));
const cantataChalice=roles.project("AO.SM.C0181",{
 editorialPreview:true,form:"MISSA_CANTATA_INCENSE",
});
assert.equal(cantataChalice.formDependentChaliceEvents.length,0);
assert.equal(cantataChalice.priestActions[0].stages.find(
 stage=>stage.id==="AO.CANON.R62.034.04").actor,"PRIEST");
const lowMinor=roles.project("AO.SM.C0205",{editorialPreview:true,form:"LOW"});
assert.equal(lowMinor.formDependentChaliceEvents.length,0);
assert.equal(lowMinor.priestActions[0].stages.find(
 stage=>stage.id==="AO.CANON.R62.059.02").actor,"PRIEST");
const canonAmen=roles.project("AO.SM.C0207",{editorialPreview:true,form:"LOW"});
assert.equal(canonAmen.respondentRole.speakerRole,"MINISTERS");
assert.equal(canonAmen.canPublish,false);
const host=reader.project("AO.SM.C0174",{
  form:"SOLEMN",editorialPreview:true,priestObservedCueId:"AO.SM.C0174",
  observedPriestActionIds:["AO.CANON.R62.024"],
  observedMinisterActionIds:["AO.CANON.R62.027"],
});
assert.equal(host.priestActions.length,4);
assert.equal(host.ministerActions.length,1);
assert.deepEqual(host.priestActions.filter(x=>x.actionGroupObserved).map(x=>x.id),["AO.CANON.R62.024"],
  "Only explicitly observed priest action group can be marked as observed");
assert.ok(host.priestActions.every(x=>x.isObservedNow===false),
  "Observed action group cannot imply an actual genuflection or elevation micro-stage");
const preciseHost=reader.project("AO.SM.C0174",{
  form:"SOLEMN",editorialPreview:true,
  observedStageIds:["AO.CANON.R62.024.02"],
});
const hostElevation=preciseHost.priestActions.find(x=>x.id==="AO.CANON.R62.024");
assert.deepEqual(hostElevation.stages.filter(x=>x.isObservedNow).map(x=>x.id),
  ["AO.CANON.R62.024.02"],"Only actual witnessed Host elevation stage may be active");
assert.equal(hostElevation.stages[0].isObservedNow,false);
assert.equal(hostElevation.isObservedNow,false);
assert.equal(host.ministerActions[0].actionGroupObserved,true);
assert.equal(host.ministerActions[0].isObservedNow,false,
  "An observed bell group does not assert its precise micro-stage fired");
const exactBell=reader.project("AO.SM.C0174",{
  editorialPreview:true,observedStageIds:["AO.CANON.R62.027.01"],
});
assert.deepEqual(exactBell.ministerActions[0].stages.filter(x=>x.isObservedNow).map(x=>x.id),
  ["AO.CANON.R62.027.01"]);
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
const chaliceStage=reader.project("AO.SM.C0181",{
  editorialPreview:true,
  observedPriestActionIds:["AO.CANON.R62.034"],
  observedStageIds:["AO.CANON.R62.034.02"],
});
const observedChalice=chaliceStage.priestActions[0];
assert.equal(observedChalice.actionGroupObserved,true);
assert.equal(observedChalice.isObservedNow,false);
assert.deepEqual(observedChalice.stages.filter(x=>x.isObservedNow).map(x=>x.action),
  ["PRIEST_ELEVATES_CHALICE"],
  "Chalice elevation, covering and second genuflection may never fire together");

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
// Reconciled source-precision copy batch from #1168: six improvements not
// already merged in #1169. The sole owner is R62 and all are unpublished.
const exactDrafts=new Map(frenchReview.rows.map(x=>[x.id,x]));
const sourceByAction=new Map(triggerAudit.rows.map(x=>[x.id,x]));
const copyRequirements=[
 ["017","AO.SM.C0168",/à « accépit panem »/,/découvre d’abord ce récipient/],
 ["027","AO.SM.C0174",/le servant sonne trois fois ou continûment/,/repose l’Hostie sur le corporal/],
 ["035","AO.SM.C0181",/le servant sonne trois fois ou continûment/,/calice soit reposé sur le corporal/],
 ["040","AO.SM.C0186",/mains toujours étendues devant la poitrine/,/Il poursuit « Supra quæ »/],
 ["055","AO.SM.C0201",/le diacre intervient lorsque cela est nécessaire/,/le pouce et l’index de la main droite/],
 ["059","AO.SM.C0205",/après la petite élévation|Après la petite élévation/,/par le diacre à la messe solennelle lorsque cela est nécessaire/],
];
for(const [n,cue,a,b] of copyRequirements){
 const id="AO.CANON.R62."+n,fr=exactDrafts.get(id),source=sourceByAction.get(id);
 assert.equal(fr?.cueId,cue,id+": canonical cue must not move");
 assert.equal(source?.cueId,cue,id+": Latin research must own cue");
 assert.match(fr.revisedFrenchRubric,a);
 assert.match(fr.revisedFrenchRubric,b);
 assert.equal(fr.reviewState,"ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 assert.equal(fr.faithfulRubricInferred,false);
 assert.ok(fr.sourceURLs.length>=2&&fr.sourceURLs.every(u=>u.startsWith("https://")));
}
for(const n of ["027","035"])assert.equal(exactDrafts.get("AO.CANON.R62."+n).actor,"SERVER");
assert.doesNotMatch(exactDrafts.get("AO.CANON.R62.040").revisedFrenchRubric,/aucun geste supplémentaire/,
 "User rubric should describe the continuous state, not the editor's implementation notes");
assert.deepEqual(
 ["001","028","058"].map(n=>exactDrafts.get("AO.CANON.R62."+n).revisedFrenchRubric.includes("prêtre")),
 [true,true,true],
 "Already-merged source corrections must remain owned by current main");
assert.equal(frenchReview.rows.length,62);
assert.equal(frenchReview.rows.filter(x=>x.editorialFlags.length).length,29);
assert.equal(frenchReview.status,"SOURCE_RECHECKED_ORIGINAL_FRENCH_DRAFT_NOT_PUBLISHED");
console.log("PASS: 62 bilingual source-checked Canon redrafts; 50 exact word, 10 non-text, 1 persistent, 1 anticipatory; independent actor clocks and no publication.");
