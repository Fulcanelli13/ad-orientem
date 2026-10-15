import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolveFormationReference,resolveCanonicalWork,inspectReferenceInventory,inspectCurrentFormationRevision,prepareReferencePresentation} from "../src/source-text/reference-crosswalk.js";
import {normalizeWitnessLocator,validateExternalLocatorBinding,
 editionQualifiedCitation,extractReviewedWitnessDocument} from "../src/source-text/witness-locators.js";
const json=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const canonical=json("data/reference/canonical-works-pilot.v1.json");
const formation=json("data/reference/formation-canonical-source-crosswalk.v1.json");
const profiles=json("data/source-text/witness-profiles.v1.json");
const audit=inspectReferenceInventory({canonical,formation,profiles});
const handoff=json("data/source-text/reference-owner-handoff.v1.json");
assert.equal(handoff.schema,"AO_REFERENCE_SOURCE_OWNER_HANDOFF_V1");
assert.equal(handoff.baseline.formationBindings,408);
assert.equal(handoff.baseline.urlWitnesses,304);
assert.equal(handoff.current.formationBindings,527);
assert.equal(handoff.current.urlWitnesses,332);
assert.equal(handoff.current.addedByExistingOwner,119);
assert.equal(handoff.current.existingBindingsRemoved,0);
assert.equal(handoff.current.currentClaimCertificationsNew,0);
assert.equal(handoff.mass.historicalNormativeComparisonRows,15);
assert.equal(handoff.mass.addedReferenceClaims,0);
assert.equal(handoff.assessment.missingHistoricalFormationSourceBindings,0);
assert.equal(handoff.assessment.historicalUncitedRegistryLeads,12);
assert.equal(handoff.assessment.formationRefsWithoutInspectedProfileAreNotAutomaticallyGaps,true);
assert.equal(handoff.exactUrlMatches.length,4);
const matchedKeys=new Set(handoff.exactUrlMatches.map(x=>x.bindingKey));
assert.equal(matchedKeys.size,4);
for(const match of handoff.exactUrlMatches){
 const ref=resolveFormationReference({formation,key:match.bindingKey});
 const meta=prepareReferencePresentation({formation,key:match.bindingKey,profiles});
 assert.equal(ref.contextApproved,false);
 assert.equal(meta.publicDisplayApproved,false);
 assert.ok(meta.potentialWitnessProfiles.includes(match.profileId));
 assert.equal(meta.witnessMatchStatus,"EXACT_URL_ONLY_NOT_VERIFIED_PASSAGE");
}
assert.equal(handoff.displayPolicy.defaultSurface,"NONE_UNTIL_OWNER_APPROVED");
assert.equal(handoff.assessment.newBookImports,0);
assert.equal(handoff.assessment.newMassCardChanges,0);
assert.equal(audit.canonicalWorks,13);
assert.equal(audit.formationScopedBindings,408);
assert.equal(audit.formationUrlWitnesses,304);
assert.equal(audit.formationContextApproved,0);
assert.equal(audit.witnessProfiles,9);
assert.equal(audit.importedBookTexts,0);
assert.equal(audit.newClaimLinksApproved,0);
const example=resolveFormationReference({formation,key:"FORM-SYN-01::AQUINAS"});
assert.equal(example.title,"St Thomas Aquinas, Summa Theologiae II–II q33 a4");
assert.ok(example.url.startsWith("https://"));
assert.equal(example.contextApproved,false);
assert.equal(example.claimCitationApproved,false);
assert.equal(example.quotationApproved,false);
assert.equal(example.presentation,"READ_FURTHER_EXTERNAL_LINK");
assert.throws(()=>resolveFormationReference({formation,key:"UNKNOWN::MISSING"}),/NOT_FOUND/);
const missal=resolveCanonicalWork({canonical,workId:"WORK-MISSALE-ROMANUM-1962"});
assert.equal(missal.textImported,false);
assert.equal(missal.productionCitationApproved,false);
assert.equal(missal.canonicalOwner,"data/reference/canonical-works-pilot.v1.json");
const vatican=profiles.profiles.find(x=>x.id==="WIT-MEDIATOR-DEI-EN-VATICAN");
assert.equal(normalizeWitnessLocator(vatican,"§23").sourceAnchor,"md-en-p023");
assert.throws(()=>normalizeWitnessLocator(vatican,"footnote 23"),/PARAGRAPH_INVALID/);
const tan=profiles.profiles.find(x=>x.id==="WIT-TANQUEREY-EN-EWTN");
assert.equal(validateExternalLocatorBinding({profile:tan,locator:"#643",
 hostUrl:"https://www.ewtn.com/catholicism/library/spiritual-life-12636"}).sourceLocator,"§643");
assert.throws(()=>validateExternalLocatorBinding({profile:tan,locator:"#643",
 hostUrl:"https://wrong.invalid"}),/URL_NOT_REGISTERED/);
const den31=profiles.profiles.find(x=>x.id==="WIT-DENZINGER-31-1960-CATALOGUE");
const den32=profiles.profiles.find(x=>x.id==="WIT-DENZINGER-32-1963-CATALOGUE");
assert.notEqual(den31.referencePrefix,den32.referencePrefix);
assert.throws(()=>normalizeWitnessLocator(den31,"DS 1234"),/CONTENT_NOT_INSPECTED/);
// Project-authored synthetic excerpt only, not a historical passage or app text.
const p={...vatican,id:"WIT-AO-SYNTHETIC",sourceWorkId:"WORK-AO-SYNTHETIC",
 witnessUrl:"https://example.invalid/review"};
const work={id:p.sourceWorkId,title:"Synthetic source",editionId:"ED-AO-TEST",
 witnessId:p.id,language:"en",demoOnly:true,
 rights:{status:"PROJECT_AUTHORED_DEMO",reviewId:"TEST-ONLY"}};
const review={workId:work.id,editionId:work.editionId,witnessId:work.witnessId,
 sourceDocumentId:"SYNTHETIC",collationReviewId:"SYNTHETIC",
 reproductionReviewId:work.rights.reviewId};
const passage=extractReviewedWitnessDocument({profile:p,work,review,
 heading:"Synthetic section",hostUrl:p.witnessUrl,
 records:[{locator:"23",text:"This is a project-authored test sentence."}]});
assert.equal(passage.passages.length,1);
assert.equal(passage.passages[0].sourceAnchor,undefined);
assert.equal(passage.passages[0].editionQualifiedCitation,
 editionQualifiedCitation({work,passageId:passage.passages[0].id,
 sourceAnchor:"md-en-p023"}));
assert.throws(()=>extractReviewedWitnessDocument({profile:p,work:{...work,rights:{status:"UNREVIEWED"}},review,
 heading:"Synthetic",hostUrl:p.witnessUrl,records:[{locator:"23",text:"Synthetic sentence."}]}),
 /REPRODUCTION_NOT_CLEARED/);

const md=prepareReferencePresentation({formation,key:"FORM-SYN-02::MD47",profiles});
assert.equal(md.publicDisplayApproved,false);
assert.equal(md.inlineCitation,null);
assert.equal(md.quote,null);
assert.equal(md.link.label,"Read further");
assert.ok(md.link.url.includes("vatican.va"));
assert.ok(md.compactTitle.includes("Mediator Dei"));
assert.equal(md.deeperLocator,"Pius XII, Mediator Dei §§46–49, liturgy and faith");
assert.deepEqual(md.potentialWitnessProfiles,["WIT-MEDIATOR-DEI-EN-VATICAN"]);
assert.equal(md.witnessMatchStatus,"EXACT_URL_ONLY_NOT_VERIFIED_PASSAGE");
const hume=prepareReferencePresentation({formation,key:"FORM-SYN-02::HUME-MIRACLE-X",profiles});
assert.deepEqual(hume.potentialWitnessProfiles,["WIT-HUME-E10-ONLINE"]);
assert.ok(hume.originalRole.includes("original philosophical opponent"));
assert.equal(hume.publicDisplayApproved,false);
const noProfile=prepareReferencePresentation({formation,key:"FORM-SYN-01::AQUINAS",profiles});
assert.equal(noProfile.witnessMatchStatus,"NO_EDITION_PROFILE_MATCH");
assert.equal(noProfile.publicDisplayApproved,false);
// The old 408/304 registry is a HISTORICAL BASELINE. The current owner v2
// was added to main after the branch fork. Test the real owner file whenever
// it exists in checkout (e.g. PR merge CI), but do not copy it into this PR.
const currentOwnerPath=new URL("../data/reference/formation-current-source-reconciliation.v2.json",import.meta.url);
let currentTested=false;
if(existsSync(currentOwnerPath)){
 const v2=JSON.parse(readFileSync(currentOwnerPath,"utf8"));
 const current=inspectCurrentFormationRevision({formation,revision:v2,profiles});
 assert.equal(current.currentSourceBindings,527);
 assert.equal(current.currentSourceBindings,handoff.current.formationBindings);
 assert.equal(current.currentUrlWitnesses,handoff.current.urlWitnesses);
 assert.deepEqual(
  current.existingProfileUrlMatches.map(x=>x.bindingKey).sort(),
  [...matchedKeys].sort());
 assert.equal(current.currentUrlWitnesses,332);
 assert.equal(current.newlyAddedByOwner,119);
 assert.equal(current.originalHistoricalBindingsRemoved,0);
 assert.equal(current.newClaimCertifications,0);
 assert.equal(current.productionDisplayApproved,false);
 assert.equal(current.existingProfileUrlMatches.length,4);
 assert.deepEqual(current.existingProfileUrlMatches.map(x=>x.bindingKey).sort(),
 ["FORM-SYN-02::HUME-MIRACLE-X","FORM-SYN-02::MD47",
  "FORM-SYN-03::MD47","FORM-SYN-06::MD47"].sort());
 assert.ok(current.existingProfileUrlMatches.every(x=>x.publicDisplayApproved===false));
 currentTested=true;
}
// Exercise revised-dataset consistency without manufacturing 119 owner records.
const mock={
 schema:"AO_FORMATION_CURRENT_SOURCE_RECONCILIATION_V2",
 baseline:{historical_source_bindings:408},
 added_source_bindings:[{key:"FORM-TEST::NO-MODULE-CLAIM",url:"https://example.invalid/draft-test",original_context_approved:false}],
 old_identity_changes:[],missing_historical_bindings:[],
 metrics:{source_bindings:409,url_witnesses:305,
  scoped_source_bindings_added:1,scoped_source_bindings_removed:0,
  currently_independently_certified_new_claims:0}
};
const future=inspectCurrentFormationRevision({formation,revision:mock,profiles});
assert.equal(future.currentSourceBindings,409);
assert.equal(future.currentUrlWitnesses,305);
assert.equal(future.existingProfileUrlMatches.length,4);
assert.throws(()=>inspectCurrentFormationRevision({formation,revision:
 {...mock,metrics:{...mock.metrics,source_bindings:410}},profiles}),/COUNTS_OR_APPROVAL_CONTRADICTORY/);
assert.throws(()=>inspectCurrentFormationRevision({formation,revision:
 {...mock,old_identity_changes:[{bindingKey:"FORM-SYN-01::AQUINAS"}]},profiles}),/HISTORICAL_BINDINGS_CHANGED/);
assert.throws(()=>inspectCurrentFormationRevision({formation,revision:
 {...mock,added_source_bindings:[{...mock.added_source_bindings[0],original_context_approved:true}]},profiles}),/REVISION_ADDITION_INVALID/);
console.log("PASS existing Formation citations: 4 exact URL-to-witness matches only, no invented editions or approved quotes; latest owner v2 checked="+currentTested);
console.log("PASS reference-only scope: 13 canonical works, 408 existing Formation links, 304 URLs, 9 profiles; no books imported or fabricated citations");
