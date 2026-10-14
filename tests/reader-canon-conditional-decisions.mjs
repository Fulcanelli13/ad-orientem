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
assert.equal(sources.frenchReview.rows.filter(x=>x.formReview==="FORM_OR_PASTORAL_REVIEW_PENDING").length,5,
 "Five source decisions do not constitute final pastoral/form approval");
console.log("PASS: five Canon form-conditioned sources, exact 1962 actor constraints, two corrected French drafts, 0 published.");
