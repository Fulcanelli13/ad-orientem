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
assert.equal(r("AO.SM.C0153","LOW",{...normal,localSeeStatus:"VACANT"}).branch,
 "LOCAL_SEE_VACANT");
assert.equal(r("AO.SM.C0153","LOW",{...normal,location:"ROME"}).branch,
 "ROMAN_LOCATION");
assert.equal(r("AO.SM.C0153","SOLEMN",{...normal,celebrantRank:"BISHOP"}).branch,
 "CELEBRANT_BISHOP_OR_PATRIARCH");
assert.equal(r("AO.SM.C0153","SOLEMN",{...normal,celebrantRank:"POPE"}).branch,
 "CELEBRANT_POPE");
assert.equal(r("AO.SM.C0153","LOW",{...normal,liturgicalJurisdictionVerified:false}).branch,
 "CONDITIONS_NOT_VERIFIED");
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
assert.match(formula.revisedFrenchRubric,/siège local est vacant/);
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
console.log("PASS: five Canon form-conditioned sources, exact 1962 actor constraints, two corrected French drafts, 0 published.");
