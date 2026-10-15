import {sourceReferenceSafeUrl,sourceReferencePanelHtml} from "../src/learn/source-reference-panel.js";
import {prepareScopedReferenceDisplay} from "../src/source-text/reference-presentation.js";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolveFormationReference,resolveCanonicalWork,inspectReferenceInventory,inspectCurrentFormationRevision,prepareReferencePresentation,prepareScopedSourceLink} from "../src/source-text/reference-crosswalk.js";
const json=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const canonical=json("data/reference/canonical-works-pilot.v1.json");
const formation=json("data/reference/formation-canonical-source-crosswalk.v1.json");
const profiles=json("data/source-text/witness-profiles.v1.json");
const audit=inspectReferenceInventory({canonical,formation,profiles});
const handoff=json("data/source-text/reference-owner-handoff.v1.json");
const historicalEvidence=json("data/reference/formation-evidence-relationship-ledger.v1.json");
assert.equal(handoff.scopedEdgeReview.counts.historicalEdges,21);
assert.equal(handoff.scopedEdgeReview.counts.distinctHistoricalSections,21);
assert.equal(handoff.scopedEdgeReview.counts.withClaimLocator,3);
assert.equal(handoff.scopedEdgeReview.counts.noHistoricalClaimLocator,18);
assert.equal(handoff.scopedEdgeReview.counts.supersededEdges,1);
assert.equal(handoff.scopedEdgeReview.counts.ownerCurrentClaimCertifications,0);
assert.equal(handoff.scopedEdgeReview.ownerChangedPreviouslyScreenedSections,22);
assert.equal(handoff.scopedEdgeReview.linkTargets.mediatorDei.deepFragmentStatus,
 "UNVERIFIED__KEEP_ORIGINAL_DOCUMENT_URL");
assert.equal(handoff.scopedEdgeReview.linkTargets.hume.deepFragmentStatus,
 "UNVERIFIED__KEEP_SECTION_X_DOCUMENT_URL");
assert.ok(handoff.scopedEdgeReview.linkTargets.mediatorDei.caveat.includes("superseded"));
assert.equal(handoff.scopedEdgeReview.oneEditorialException.mustNotRestoreOldBinding,true);
assert.deepEqual(handoff.scopedEdgeReview.oneEditorialException.replacementSourceIds,
 ["AO26_CRLIT07_ANSWE_1","AO26_CRLIT07_ANSWE_2","AO26_CRLIT07_ANSWE_3"]);
assert.equal(handoff.scopedEdgeReview.immutableLimits.publicCitationApprovals,0);
const staged=handoff.scopedEdgeReview.historicalSectionSourceEdges.map(record=>
 prepareScopedSourceLink({formation,evidenceLedger:historicalEvidence,handoff,edgeKey:record.edgeKey}));
assert.equal(staged.length,21);
assert.equal(staged.filter(x=>x.status==="DRAFT_OWNER_REVIEW_ONLY").length,20);
assert.equal(staged.filter(x=>x.status==="SUPPRESSED_SUPERSEDED_OWNER_CITATION").length,1);
assert.equal(staged.filter(x=>x.originalClaimLocator!==null).length,3);
assert.ok(staged.every(x=>x.publicDisplayApproved===false&&x.inlineCitation===null&&x.exactPassageQuote===null));
assert.ok(staged.every(x=>x.historicalEdgeIsCurrentClaim===false));
// Phase 18: reuse the shipped source-panel contract, but never put
// unapproved section associations in its user-facing evidence input.
const display=staged.map(scopedLink=>prepareScopedReferenceDisplay({scopedLink}));
assert.equal(display.length,21);
assert.equal(display.filter(x=>x.reviewState==="SUPERSEDED_BLOCKED").length,1);
assert.equal(display.filter(x=>x.reviewState==="OWNER_REVIEW_REQUIRED").length,20);
assert.ok(display.every(x=>x.editorialPreviewOnly===true&&x.publicDisplayApproved===false));
assert.ok(display.every(x=>x.publicEvidenceRow===null&&x.publicSourceRegistryEntry===null&&
 x.publicInlineCitation===null&&x.publicFurtherReadingId===null));
assert.equal(sourceReferencePanelHtml({rows:display.map(x=>x.publicEvidenceRow).filter(Boolean)}),"");
assert.equal(display.filter(x=>x.historicalClaimLocator!==null).length,3);
assert.equal(display.find(x=>x.reviewState==="SUPERSEDED_BLOCKED").editorialSourceUrl,null);
assert.ok(display.filter(x=>x.sourcePerspective==="OPPOSING_PHILOSOPHICAL_SOURCE").length===2);
assert.ok(display.filter(x=>x.sourcePerspective==="OPPOSING_PHILOSOPHICAL_SOURCE")
 .every(x=>x.editorialSourceUrl==="https://davidhume.org/texts/e/10"));
assert.equal(prepareScopedReferenceDisplay({scopedLink:staged[0],french:true}).perspectiveLabel,
 "Position philosophique opposée");
assert.equal(sourceReferenceSafeUrl("javascript:alert(1)"),"");
assert.throws(()=>prepareScopedReferenceDisplay({scopedLink:
 {...staged[0],publicDisplayApproved:true}}),/HELD_SCOPED_EDGE/);
assert.throws(()=>prepareScopedReferenceDisplay({scopedLink:
 {...staged[0],externalLink:{label:"Read further",url:"http://example.test/"}}}),/INVALID_EDITORIAL_LINK/);
assert.throws(()=>prepareScopedReferenceDisplay({scopedLink:
 {...staged[0],inlineCitation:"Invented endorsement"}}),/HELD_SCOPED_EDGE/);

const blocked=staged.find(x=>x.status==="SUPPRESSED_SUPERSEDED_OWNER_CITATION");
assert.equal(blocked.oldEvidenceEdgeKey,"FORM-SYN-02::CR-LIT-07::00::MD47");
assert.equal(blocked.externalLink,null);
assert.equal(blocked.sectionKey,"FORM-SYN-02::CR-LIT-07::00");
const opponent=staged.filter(x=>x.sourceBindingKey==="FORM-SYN-02::HUME-MIRACLE-X");
assert.equal(opponent.length,2);
assert.ok(opponent.every(x=>x.originalSourceRole.includes("original philosophical opponent")));
assert.ok(opponent.every(x=>x.externalLink?.url==="https://davidhume.org/texts/e/10"));
const held=structuredClone(handoff);
held.scopedEdgeReview.historicalSectionSourceEdges[0].publicDisplayApproved=true;
assert.throws(()=>prepareScopedSourceLink({formation,evidenceLedger:historicalEvidence,handoff:held,
 edgeKey:held.scopedEdgeReview.historicalSectionSourceEdges[0].edgeKey}),/REVIEW_MISMATCH/);
assert.throws(()=>prepareScopedSourceLink({formation,evidenceLedger:historicalEvidence,handoff,
 edgeKey:"FORM-SYN-02::MADEUP::00::MD47"}),/REVIEW_MISMATCH/);

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
// Locator shape validation is owned by src/reference/witness-locators.js
// and its tests on main, not duplicated in this reconciliation PR.
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
 const target=v2.changed_previous_screened_sections.find(x=>x.section_key===handoff.scopedEdgeReview.oneEditorialException.sectionKey);
 assert.ok(target);
 assert.equal(target.role,"answer");
 assert.ok(target.old_source_ids.includes("MD47"));
 assert.ok(!target.new_source_ids.includes("MD47"));
 assert.deepEqual(target.new_source_ids,handoff.scopedEdgeReview.oneEditorialException.replacementSourceIds);
 assert.equal(v2.changed_previous_screened_sections.filter(x=>
    handoff.scopedEdgeReview.historicalSectionSourceEdges.some(e=>e.sectionKey===x.section_key)).length,1);
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
console.log("PASS Phase 18 source-panel bridge: 21 editorial-only projections, zero public evidence rows, 1 blocked supersession");
console.log("PASS owner-specific section links: 21 historical section edges, 20 held, 1 superseded and blocked, zero public citations");
console.log("PASS reference-only scope: 13 canonical works, 408 existing Formation links, 304 URLs, 9 profiles; no books imported or fabricated citations");
