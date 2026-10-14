import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCanonConditionalDecisionReview,createCanonConditionalDecisionController}
 from "../src/mass/reader-canon-conditional-decisions.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const sources={
 decisions:read("../data/research/mass-canon-5-form-decisions-20261013.json"),
 frenchReview:read("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json"),
 ministerData:read("../data/research/mass-canon-minister-form-branches-20261013.json"),
};
const audit=validateCanonConditionalDecisionReview(sources);
assert.deepEqual([audit.reviewedSourceCases,audit.copySignedOff,audit.livePublishable],[5,0,0]);
assert.deepEqual(audit.sourceActionIds,[
 "AO.CANON.R62.004","AO.CANON.R62.011","AO.CANON.R62.055",
 "AO.CANON.R62.059","AO.CANON.R62.061"]);
const controller=createCanonConditionalDecisionController(sources);
for(const cue of sources.decisions.cases.map(x=>x.cueId)){
 assert.equal(controller.project(cue).decision,null,"Not even source variants in live defaults");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
   const x=controller.project(cue,{form,editorialPreview:true});
   assert.equal(x.canPublish,false);assert.equal(x.isObservedNow,false);
   assert.equal(x.copyReview,"INDEPENDENT_EDITORIAL_SIGNOFF_REQUIRED");
   assert.ok(x.draftFrenchRubric.length>30);
   assert.ok(x.sourceUrls.every(s=>s.startsWith("https://")));
 }
 assert.equal(controller.project(cue,{form:"UNKNOWN",editorialPreview:true}).decision,null);
}
const r=(cue,form,context={})=>controller.project(cue,{form,context,editorialPreview:true});
const absent=r("AO.SM.C0153","LOW");
assert.equal(absent.branch,"CONDITIONS_NOT_VERIFIED");
assert.equal(absent.formulaText,null);
const normal={apostolicSeeStatus:"OCCUPIED",localSeeStatus:"OCCUPIED",
 location:"OUTSIDE_ROME",celebrantRank:"PRESBYTER",liturgicalJurisdictionVerified:true};
assert.equal(r("AO.SM.C0153","LOW",normal).branch,"ORDINARY_FORM");
assert.equal(r("AO.SM.C0153","LOW",{...normal,apostolicSeeStatus:"VACANT"}).branch,
 "APOSTOLIC_SEE_VACANT");
assert.equal(r("AO.SM.C0153","LOW",{...normal,localSeeStatus:"VACANT",
 localVacancyReason:"ORDINARY_DECEASED"}).branch,"LOCAL_SEE_VACANT");
assert.equal(r("AO.SM.C0153","LOW",{...normal,location:"ROME"}).branch,
 "ROMAN_LOCATION");
assert.equal(r("AO.SM.C0153","SOLEMN",{...normal,celebrantRank:"BISHOP"}).branch,
 "CELEBRANT_BISHOP_OR_PATRIARCH");
assert.equal(r("AO.SM.C0153","SOLEMN",{...normal,celebrantRank:"POPE"}).branch,
 "CELEBRANT_POPE");
assert.equal(r("AO.SM.C0153","LOW",{...normal,liturgicalJurisdictionVerified:false}).branch,
 "CONDITIONS_NOT_VERIFIED");
const ordinaryParts=r("AO.SM.C0153","LOW",normal);
assert.deepEqual(ordinaryParts.formulaComponents,{
 papalCommemoration:"VERIFIED_PONTIFF_NAME_REQUIRED",
 ordinaryCommemoration:"VERIFIED_LOCAL_ORDINARY_NAME_REQUIRED",
 celebrantSubstitution:null,
});
const romanParts=r("AO.SM.C0153","LOW",{...normal,location:"ROME"});
assert.equal(romanParts.formulaComponents.papalCommemoration,
 "VERIFIED_PONTIFF_NAME_REQUIRED");
assert.equal(romanParts.formulaComponents.ordinaryCommemoration,
 "OMITTED_ROMAN_CELEBRATION",
 "Celebrating in Rome does not delete the Pope's commemoration");
const deceased=r("AO.SM.C0153","LOW",{...normal,localSeeStatus:"VACANT",
 localVacancyReason:"ORDINARY_DECEASED"});
assert.equal(deceased.sourceContextResolved,true);
assert.equal(deceased.formulaComponents.ordinaryCommemoration,"OMITTED_ORDINARY_DECEASED");
const vagueVacancy=r("AO.SM.C0153","LOW",{...normal,localSeeStatus:"VACANT"});
assert.equal(vagueVacancy.sourceContextResolved,false,
 "Ritus VIII.2 specifies a deceased Ordinary: generic vacancy cannot become source-certified");
assert.deepEqual(vagueVacancy.formulaComponents,{
 papalCommemoration:null,ordinaryCommemoration:null,celebrantSubstitution:null});
const bothVacant=r("AO.SM.C0153","LOW",{...normal,apostolicSeeStatus:"VACANT",
 localSeeStatus:"VACANT",localVacancyReason:"ORDINARY_DECEASED"});
assert.equal(bothVacant.sourceContextResolved,true);
assert.equal(bothVacant.formulaComponents.papalCommemoration,
 "OMITTED_APOSTOLIC_SEE_VACANT");
assert.equal(bothVacant.formulaComponents.ordinaryCommemoration,
 "OMITTED_ORDINARY_DECEASED");
const bishop=r("AO.SM.C0153","SOLEMN",{...normal,celebrantRank:"BISHOP",
 apostolicSeeStatus:"VACANT",localSeeStatus:"VACANT"});
assert.equal(bishop.sourceContextResolved,true);
assert.equal(bishop.formulaComponents.papalCommemoration,
 "OMITTED_APOSTOLIC_SEE_VACANT");
assert.equal(bishop.formulaComponents.ordinaryCommemoration,
 "REPLACED_BY_EPISCOPAL_CELEBRANT_FORMULA");
assert.equal(bishop.formulaComponents.celebrantSubstitution,"EPISCOPAL_SELF_FORMULA");
const pope=r("AO.SM.C0153","SOLEMN",{...normal,celebrantRank:"POPE"});
assert.equal(pope.formulaComponents.papalCommemoration,
 "REPLACED_BY_PAPAL_CELEBRANT_FORMULA");
assert.equal(pope.formulaComponents.ordinaryCommemoration,
 "REPLACED_BY_PAPAL_CELEBRANT_FORMULA");
assert.equal(pope.formulaText,null);
assert.equal(r("AO.SM.C0153","SOLEMN",{...normal,celebrantRank:"POPE",
 apostolicSeeStatus:"VACANT"}).sourceContextResolved,false,
 "Pope celebrant and vacant Apostolic See are mutually inconsistent");
assert.equal(r("AO.SM.C0161","LOW").sourceContextResolved,false);
assert.equal(r("AO.SM.C0161","LOW",{hancSourceVariant:"ORDINARY",sourceSelectionVerified:true}).branch,
 "NORMAL_HANC_IGITUR");
assert.equal(r("AO.SM.C0161","SOLEMN",{hancSourceVariant:"VERIFIED_SPECIAL",sourceSelectionVerified:true}).branch,
 "SOURCE_SELECTED_SPECIAL_HANC_IGITUR");
assert.equal(r("AO.SM.C0161","LOW",{hancSourceVariant:"VERIFIED_SPECIAL"}).branch,
 "CONDITIONS_NOT_VERIFIED");
assert.equal(r("AO.SM.C0161","LOW").handPosition,"EXTENDED_OPEN_OVER_OBLATA_NOT_JOINED");
for(const cue of ["AO.SM.C0201","AO.SM.C0205"]){
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]){
  const obj=r(cue,form,{chaliceHandlingNeeded:true,deaconActionIndependentlyObserved:true});
  assert.equal(obj.actor,"PRIEST");
  assert.equal(obj.deaconCoveringAssigned,false);
 }
 const withheld=r(cue,"SOLEMN",{chaliceHandlingNeeded:true});
 assert.equal(withheld.deaconCoveringAssigned,false);
 assert.equal(withheld.actor,"UNRESOLVED");
 assert.equal(withheld.isObservedNow,false);
 const notNeeded=r(cue,"SOLEMN",{chaliceHandlingNeeded:false,
   deaconActionIndependentlyObserved:true});
 assert.equal(notNeeded.deaconCoveringAssigned,false);
 const explicit=r(cue,"SOLEMN",{chaliceHandlingNeeded:true,
   deaconActionIndependentlyObserved:true});
 assert.equal(explicit.deaconCoveringAssigned,true);
 assert.equal(explicit.actor,"DEACON");
 assert.equal(explicit.canPublish,false);
}
assert.equal(r("AO.SM.C0205","SOLEMN").independentDeaconGenuflection,"AO.CANON.MIN.011");
assert.equal(r("AO.SM.C0201","SOLEMN").independentDeaconGenuflection,null);
assert.equal(r("AO.SM.C0207","LOW").sourceClock,"MINISTER_RESPONSE");
for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const c=r("AO.SM.C0207",form);
 assert.equal(c.sourceClock,"USER_RESPONSE");
 assert.equal(c.actor,"RESPONDERS");
 assert.equal(c.personalSpeakerResolved,false);
}
assert.equal(r("AO.SM.C0207","LOW").actor,"MINISTERS");
const french=sources.frenchReview.rows;
const formula=french.find(x=>x.id==="AO.CANON.R62.004");
assert.match(formula.revisedFrenchRubric,/évêque ordinaire du lieu est décédé/);
// 1962 source-precision audit: preserve actual gesture ordering, distinct
// pontifical/diocesan exceptions, small vs major elevations, and hand/voice
// ownership at the end of the Canon. These remain draft-only.
const getCopy=n=>french.find(x=>x.id==="AO.CANON.R62."+n).revisedFrenchRubric;
const sourceAudit=read("../data/research/mass-canon-62-source-trigger-audit-20261013.json");
for(const [number,cue,ritus] of [
 ["001","AO.SM.C0150","VIII.1"],["004","AO.SM.C0153","VIII.1–2"],
 ["028","AO.SM.C0175","VIII.7"],["058","AO.SM.C0204","IX.3"],
 ["060","AO.SM.C0206","X.1"],
]){
 const action=sourceAudit.rows.find(x=>x.id==="AO.CANON.R62."+number);
 assert.equal(action.cueId,cue);
 assert.equal(action.rubricSource,ritus);
 assert.ok(action.directSourceUrls.length>0);
 assert.equal(french.find(x=>x.id===action.id).reviewState,
  "ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
}
assert.match(getCopy("001"),/étend les mains et les élève légèrement/);
assert.match(getCopy("001"),/puis les baisse aussitôt/);
assert.match(getCopy("001"),/Il joint alors les mains, les pose sur l’autel/);
assert.match(getCopy("004"),/pape, sauf si le Siège apostolique est vacant/);
assert.match(getCopy("004"),/mention de l’ordinaire est omise/);
assert.match(getCopy("004"),/si la messe est célébrée à Rome/);
assert.match(getCopy("004"),/évêque, archevêque ou patriarche/);
assert.match(getCopy("004"),/si le pape célèbre, il remplace les deux mentions/);
assert.match(getCopy("028"),/le diacre le découvre lorsque cela est nécessaire/);
assert.match(getCopy("028"),/accipiens et hunc præclarum Calicem/);
assert.match(getCopy("028"),/l’élève légèrement et le repose aussitôt/);
assert.match(getCopy("028"),/ce n’est pas encore la grande élévation/);
assert.match(getCopy("058"),/À « omnis honor et gloria »/);
assert.match(getCopy("058"),/le calice avec l’Hostie tenue au-dessus/);
assert.match(getCopy("058"),/Il s’agit de la petite élévation/);
assert.match(getCopy("060"),/les pose de part et d’autre sur l’autel, à l’intérieur du corporal/);
assert.match(getCopy("060"),/d’une voix intelligible/);
assert.equal(french.filter(row=>row.editorialFlags.length>0).length,29);
assert.equal(sources.frenchReview.displayPolicy.inTextApprovalRequired,true);
const supplices=french.find(x=>x.id==="AO.CANON.R62.041");
assert.match(supplices.revisedFrenchRubric,/il s’incline au milieu/);
assert.doesNotMatch(supplices.revisedFrenchRubric,/s’incline profondément/);
const mutant=structuredClone(sources);
mutant.decisions.cases[0].sourceActionId="AO.CANON.R62.055";
assert.throws(()=>validateCanonConditionalDecisionReview(mutant),/drift/);
const publishes=structuredClone(sources);
publishes.decisions.scope.livePublished=5;
assert.throws(()=>validateCanonConditionalDecisionReview(publishes),/source-only/);
const wrongDeacon=structuredClone(sources);
wrongDeacon.ministerData.branches.find(x=>x.id==="AO.CANON.MIN.011").condition="WHEN_REQUIRED";
assert.throws(()=>validateCanonConditionalDecisionReview(wrongDeacon),/genuflection conditional/);
const flagged=read("../data/research/mass-canon-flagged-french-copy-triage-20261013.json");
const trigger=read("../data/research/mass-canon-62-source-trigger-audit-20261013.json");
const first=read("../data/research/mass-canon-first-pass-19-ritus-source-review-20261013.json");
const complex=read("../data/research/mass-canon-complex-23-ritus-source-review-20261013.json");
const flaggedInCanon=sources.frenchReview.rows.filter(row=>row.editorialFlags.length);
assert.equal(flagged.status,"COMPLETE_FLAG_TRIAGE_ONLY_NO_COPY_SIGNOFF");
assert.deepEqual(flagged.counts,{
 frenchDrafts:62,flaggedDrafts:29,highPriority:21,standardPriority:8,
 flaggedWithFirstPassResearch:0,flaggedWithComplexResearch:18,
 flaggedWithR62SourceOnly:11,editoriallyApproved:0,published:0
});
assert.deepEqual(flagged.rows.map(x=>x.actionId),flaggedInCanon.map(x=>x.id));
const tmap=new Map(trigger.rows.map(x=>[x.id,x]));
const fmap=new Set(first.rows.map(x=>x.actionId));
const cmap=new Set(complex.rows.map(x=>x.actionId));
for(const row of flagged.rows){
 const french=sources.frenchReview.rows.find(x=>x.id===row.actionId);
 const original=tmap.get(row.actionId);
 assert.equal(row.cueId,french.cueId);
 assert.equal(row.ritusLocator,original.rubricSource);
 assert.deepEqual(row.issues,french.editorialFlags);
 assert.deepEqual(row.sourceUrls,original.directSourceUrls);
 assert.equal(row.publishable,false);
 assert.equal(row.copyReviewState,"INDEPENDENT_FRENCH_EDITORIAL_SIGNOFF_REQUIRED");
 assert.equal(row.evidenceTracks.includes("PR1161_FIRST_PASS_19"),fmap.has(row.actionId));
 assert.equal(row.evidenceTracks.includes("PR1161_COMPLEX_23"),cmap.has(row.actionId));
 assert.ok(row.reviewInstruction.length>20,"Each issue requires meaningful editorial review");
}
const conciseRubricDrafts=sources.frenchReview.rows.filter(x=>x.editorialFlags.length>0);
const allShortRubrics=sources.frenchReview.rows;
assert.equal(allShortRubrics.length,62,"Complete original Canon action inventory required");
assert.equal(allShortRubrics.filter(x=>x.actor==="PRIEST").length,58);
assert.equal(allShortRubrics.filter(x=>x.actor==="SERVER").length,4);
assert.equal(allShortRubrics.filter(x=>x.shortFrenchRubricDraft).length,62,
 "Every existing Canon source action now needs source-specific concise French draft copy");
assert.equal(allShortRubrics.filter(x=>x.editorialFlags.length===0).length,33,
 "The 33 previously unflagged Canon source actions must be covered once");
const uniqueShortActions=new Set();
for(const row of allShortRubrics){
 assert.ok(!uniqueShortActions.has(row.id),row.id+": duplicated French text owner");
 uniqueShortActions.add(row.id);
 assert.equal(row.shortRubricReviewState,
  "ORIGINAL_FRENCH_SHORT_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 assert.equal(row.reviewState,
  "ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 assert.equal(row.faithfulRubricInferred,false);
 assert.ok(row.shortFrenchRubricDraft.length>=24,row.id+": content too thin");
 assert.ok(row.shortFrenchRubricDraft.length<=row.revisedFrenchRubric.length+24,
  row.id+": short rubric must remain genuinely concise");
 assert.ok(row.sourceURLs.every(url=>url.startsWith("https://")));
 const canonical=trigger.rows.find(x=>x.id===row.id);
 assert.equal(canonical?.cueId,row.cueId,row.id+": source cue owner changed");
 assert.equal(canonical?.actor,row.actor,row.id+": priest/minister attribution changed");
 assert.doesNotMatch(row.shortFrenchRubricDraft,
  /(?:ce module|cette application|d’après la source|selon le dossier|l’éditeur|rubrique à revoir)/iu,
  row.id+": editorial metacommentary leaked into short guide");
}
for(const [id,pattern] of [
 ["013",/« benedíctam ».*« adscríptam ».*« ratam ».*trois croix/],
 ["014",/« Corpus ».*Hostie seule/],
 ["015",/« Sanguis ».*calice seul/],
 ["041",/« Súpplices te rogámus ».*au milieu de l’autel/],
 ["043",/« Corpus ».*« Sanguinem »/],
 ["047",/mémoire des fidèles défunts/],
 ["053",/garde les mains jointes/],
 ["056",/« Per ipsum ».*« cum ipso ».*« in ipso ».*trois croix/],
 ["057",/« Patri ».*« Sancti ».*deux croix/],
]){
 const row=allShortRubrics.find(x=>x.id==="AO.CANON.R62."+id);
 assert.match(row.shortFrenchRubricDraft,pattern,id+": source-dependent short copy lost");
}
assert.equal(allShortRubrics.find(x=>x.id==="AO.CANON.R62.047")
 .shortRubricPlacement,"PRIEST_SILENT_PAUSE");
assert.equal(allShortRubrics.find(x=>x.id==="AO.CANON.R62.053")
 .shortRubricPlacement,"PRIEST_PERSISTENT_STATE");
assert.doesNotMatch(allShortRubrics.find(x=>x.id==="AO.CANON.R62.041")
 .shortFrenchRubricDraft,/profondément/);
assert.equal(conciseRubricDrafts.length,29,"29 flagged Canon rubrics need original French short copy");
assert.deepEqual(conciseRubricDrafts.map(x=>x.id),flagged.rows.map(x=>x.actionId),
 "Short draft must use the same 29 source-owned risk actions without duplicates");
const allowedSurfaces=new Set([
 "PRIEST_SEQUENCE","PRIEST_STATE","PRIEST_SILENT_PAUSE","PRIEST_ACTION",
 "GUIDE_NOTE_NOT_GESTURE","PRIEST_VOICE","PRIEST_OBSERVED_STAGE",
 "PRIEST_PERSISTENT_STATE","MINISTER_OBSERVED_EVENT",
 "PRIEST_WITH_CONDITIONAL_MINISTER","PRIEST_WORD_ANCHORED_SEQUENCE",
 "PRIEST_VOICE_AND_GESTURE","FORM_DEPENDENT_RESPONSE",
 "MINISTER_ANTICIPATORY_EVENT",
]);
for(const row of conciseRubricDrafts){
 assert.equal(row.shortRubricReviewState,
  "ORIGINAL_FRENCH_SHORT_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 assert.equal(row.reviewState,
  "ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 assert.equal(row.faithfulRubricInferred,false);
 assert.ok(allowedSurfaces.has(row.shortRubricPlacement));
 assert.ok(row.shortFrenchRubricDraft.length>=24);
 assert.ok(row.shortFrenchRubricDraft.length < row.revisedFrenchRubric.length+12);
 assert.ok(row.sourceURLs.every(url=>url.startsWith("https://")));
 assert.doesNotMatch(row.shortFrenchRubricDraft,
  /(?:ce module|cette application|d’après la source|selon le dossier|l’éditeur|rubrique à revoir)/iu,
  row.id+": editorial meta language leaked into short prayer guidance");
 if(row.shortRubricPlacement.startsWith("MINISTER_")||
    row.shortRubricPlacement==="FORM_DEPENDENT_RESPONSE")
  assert.equal(row.actor,"SERVER",row.id+": minister rubric misattributed to priest");
 if(row.shortRubricPlacement==="GUIDE_NOTE_NOT_GESTURE")
  assert.equal(row.id,"AO.CANON.R62.021","Narrative fregit cannot become an actual Host fraction");
 if(row.shortRubricPlacement==="PRIEST_PERSISTENT_STATE")
  assert.ok(["AO.CANON.R62.026","AO.CANON.R62.040"].includes(row.id));
}
for(const [id,part] of [
 ["AO.CANON.R62.027","MINISTER_OBSERVED_EVENT"],
 ["AO.CANON.R62.035","MINISTER_OBSERVED_EVENT"],
 ["AO.CANON.R62.062","MINISTER_ANTICIPATORY_EVENT"],
 ["AO.CANON.R62.061","FORM_DEPENDENT_RESPONSE"],
 ["AO.CANON.R62.055","PRIEST_WITH_CONDITIONAL_MINISTER"],
 ["AO.CANON.R62.059","PRIEST_WITH_CONDITIONAL_MINISTER"],
 ["AO.CANON.R62.050","PRIEST_VOICE_AND_GESTURE"],
]){
 assert.equal(conciseRubricDrafts.find(x=>x.id===id)?.shortRubricPlacement,part,
  id+": priest, respondent or minister time ownership drifted");
}
// 1962 Ritus VIII–X short-rubric precision: these remain wholly draft-only.
const preciseShortCopy=new Map([
 ["004",/conditions et formules prescrites/],
 ["008",/texte propre prévu pour certains jours/],
 ["011",/jusqu’à « Per Christum »/],
 ["017",/d’autres hosties doivent être consacrées, il découvre d’abord leur vase/],
 ["026",/sauf pour toucher une Hostie consacrée/],
 ["027",/sonne trois fois ou continûment pendant l’élévation de l’Hostie/],
 ["028",/au besoin par le diacre/],
 ["033",/première génuflexion/],
 ["034",/Après la première génuflexion.*puis génuflecte de nouveau/],
 ["035",/sonne trois fois ou continûment pendant l’élévation du calice/],
 ["039",/« Panem sanctum ».*« Calicem salútis »/],
 ["055",/au besoin par le diacre.*le prêtre génuflecte/],
 ["058",/« omnis honor et glória ».*l’Hostie tenue au-dessus/],
 ["059",/repose le calice et l’Hostie.*au besoin par le diacre/],
 ["061",/ministre à la messe basse.*répondants dans les formes chantées/],
 ["062",/Peu avant la consécration, le servant avertit les fidèles/],
]);
assert.equal(preciseShortCopy.size,16);
for(const [number,pattern] of preciseShortCopy){
 const row=conciseRubricDrafts.find(x=>x.id==="AO.CANON.R62."+number);
 assert.ok(row,number+": canonical R62 rubric missing");
 assert.match(row.shortFrenchRubricDraft,pattern,number+": 1962 short-copy qualifier lost");
 assert.equal(row.shortRubricReviewState,
  "ORIGINAL_FRENCH_SHORT_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 const source=trigger.rows.find(x=>x.id===row.id);
 assert.equal(source.cueId,row.cueId,number+": source cue ownership mismatch");
 assert.equal(source.actor,row.actor,number+": minister/priest actor mismatch");
}
assert.match(conciseRubricDrafts.find(x=>x.id==="AO.CANON.R62.026")
 .shortFrenchRubricDraft,/jusqu’à l’ablution des doigts/);
for(const id of ["028","055","059"]){
 const short=conciseRubricDrafts.find(x=>x.id==="AO.CANON.R62."+id).shortFrenchRubricDraft;
 assert.match(short,/diacre à la messe solennelle/,
  id+": short rubric must not attribute a Solemn deacon to Low Mass or Cantata");
}
assert.match(conciseRubricDrafts.find(x=>x.id==="AO.CANON.R62.034")
 .shortFrenchRubricDraft,/le fait couvrir/);
assert.doesNotMatch(conciseRubricDrafts.find(x=>x.id==="AO.CANON.R62.062")
 .shortFrenchRubricDraft,/(?:Hanc|ígitur)/u,
 "Anticipatory minister bell must never be text-synchronised to Hanc igitur");
assert.equal(controller.project("AO.SM.C0153").canPublish,false,
 "No short French draft may enable public Canon text");
assert.equal(sources.frenchReview.rows.filter(x=>x.formReview==="FORM_OR_PASTORAL_REVIEW_PENDING").length,5,
 "Five source decisions do not constitute final pastoral/form approval");

const iconPlan=read("../data/research/mass-canon-62-icon-ownership-review-20261014.json");
const {R17_FROZEN_ACTIVE_ICON_ASSETS}=await import("../src/mass/reader-icon-bank.js");
assert.equal(iconPlan.schema,"ao-canon-62-editorial-icon-ownership-v1");
assert.equal(iconPlan.status,"EDITORIAL_ICON_PREVIEW_NOT_ACTIVATED");
assert.deepEqual(iconPlan.counts,{
 sourceActions:62,priest:58,server:4,sourceWordAnchors:50,
 nonTextOrStates:12,withFrozenAsset:50,noIconByDesign:3,requiresDistinctOrStageArtwork:9,
 livePublishedByThisBatch:0,faithfulPosturesInferred:0
});
assert.deepEqual(iconPlan.rows.map(x=>x.actionId),trigger.rows.map(x=>x.id));
const iconGaps=[],iconSeen=new Set();
for(const item of iconPlan.rows){
 const audit=trigger.rows.find(x=>x.id===item.actionId);
 const copy=sources.frenchReview.rows.find(x=>x.id===item.actionId);
 assert.ok(audit&&copy,item.actionId+": canonical Ritus action missing");
 assert.ok(!iconSeen.has(item.actionId),item.actionId+": duplicate icon decision");
 iconSeen.add(item.actionId);
 assert.equal(item.cueId,audit.cueId);
 assert.equal(item.actor,audit.actor);
 assert.equal(item.sourceActionKey,audit.actionKey);
 assert.equal(item.sourceAnchorType,audit.sourceAnchorType);
 assert.equal(item.sourceVerifiedWords,audit.verifiedSourceWordAnchor);
 assert.equal(item.ritusLocator,audit.rubricSource);
 assert.deepEqual(item.stageIds,audit.stageSequence.map(s=>s.id));
 assert.equal(item.shortFrenchDraftRef,copy.id);
 assert.equal(item.requiresIndependentActorObservation,true);
 assert.equal(item.readerDisplayApproval,"NOT_APPROVED");
 assert.equal(item.observedNow,false);
 assert.equal(item.faithfulPosture,null);
 if(item.iconKey===null)iconGaps.push(item.actionId);
 else assert.ok(Object.hasOwn(R17_FROZEN_ACTIVE_ICON_ASSETS,item.iconKey),
   item.actionId+": icon is not in frozen v4.6 active assets");
 assert.equal(item.sceneType,audit.sourceAnchorType==="SOURCE_LATIN_WORDS"
   ?"SOURCE_WORD_REFERENCE_ONLY":"NOT_A_WORD_SYNCHRONISED_ACTION");
}
assert.equal(iconSeen.size,62);
assert.deepEqual(iconGaps,[
 "AO.CANON.R62.006","AO.CANON.R62.017","AO.CANON.R62.021",
 "AO.CANON.R62.025","AO.CANON.R62.026","AO.CANON.R62.028",
 "AO.CANON.R62.031","AO.CANON.R62.033","AO.CANON.R62.047",
 "AO.CANON.R62.055","AO.CANON.R62.058","AO.CANON.R62.059",
]);
assert.deepEqual(iconPlan.knownGaps.map(x=>x.actionId),iconGaps);
const byIconId=id=>iconPlan.rows.find(x=>x.actionId==="AO.CANON.R62."+id);
assert.equal(byIconId("021").iconKey,null,
 "Narrative fregit may never be displayed as actual Host fraction");
assert.equal(byIconId("058").iconKey,null,
 "Minor Per ipsum elevation must not borrow major Host/Chalice elevation");
assert.equal(byIconId("024").iconKey,"priest_elevation");
assert.equal(byIconId("034").iconKey,"priest_elevate_chalice_rich");
assert.equal(byIconId("041").iconKey,"bow",
 "Ritus IX.1 incline se does not certify a profound bow at Supplices");
for(const id of ["027","035","062"]){
 assert.equal(byIconId(id).iconKey,"bells");
 assert.equal(byIconId(id).actor,"SERVER");
 assert.notEqual(byIconId(id).sceneType,"SOURCE_WORD_REFERENCE_ONLY");
}
assert.equal(byIconId("061").iconKey,"response");
assert.equal(byIconId("061").actor,"SERVER");
assert.equal(byIconId("062").sourceVerifiedWords,null,
 "The pre-consecration bell cannot be attached to Hanc igitur words");
for(const id of ["055","059"]){
 assert.equal(byIconId(id).iconKey,null,
  "Conditional Solemn deacon and priest ceremonies need separate stage art");
}
assert.equal(byIconId("026").iconKey,null,
 "Thumb/index discipline is a continuing state, not a fired gesture");
console.log("PASS: 62 source-owned Canon icons; 50 matched frozen art, 12 intentional no-icon/stage review cases, 0 live publication or inferred pew postures.");

console.log("PASS: five Canon form-conditioned sources, exact 1962 actor constraints, two corrected French drafts, 0 published.");
