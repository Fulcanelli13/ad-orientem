import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  validateMassKnowledgeResearchBridge,
  massKnowledgeResearchContext,
  MASS_KNOWLEDGE_BRIDGE_SCHEMA,
  MASS_KNOWLEDGE_BRIDGE_STATUS,
  MASS_CANONICAL_RECONCILIATION_SCHEMA,
  reconcileMassResearchToCanonical,
  massP1ApprovedLinkIds
} from "../src/learn/mass-knowledge-research-bridge.js";

const bridge={
  schema:MASS_KNOWLEDGE_BRIDGE_SCHEMA,status:MASS_KNOWLEDGE_BRIDGE_STATUS,
  governance:{
    autoReleaseAllowed:false,massReaderMutationAllowed:false,
    runtimeMutationAllowed:false,manuscriptCopyAllowed:false
  },
  units:[
    {id:"AO.V3.0001.U001",cueId:"AO.SM.C0001",guideIds:["AO.CARD.001"],
      verifiedClaimIds:["VER-001"],releaseGate:"RESEARCH ONLY — NO AUTOMATIC PUBLISH",
      bibleWitness:"Matthew 28:19",bibleRelation:"B · ADAPTED"},
    {id:"AO.V3.0001.U002",cueId:"AO.SM.C0001",guideIds:["AO.CARD.001"],
      verifiedClaimIds:[],releaseGate:"RESEARCH ONLY — NO AUTOMATIC PUBLISH",bibleWitness:""}
  ],
  cues:[{id:"AO.SM.C0001"}],
  wordAnchors:[{id:"AO.V3.0001.C01",unitId:"AO.V3.0001.U001",cueId:"AO.SM.C0001"}],
  authorClaims:[{id:"VER-001",unitId:"AO.V3.0001.U001"}],
  mysteryOwners:[{guideId:"AO.CARD.001",editorialState:"NOT_APPROVED"}]
};
assert.deepEqual(validateMassKnowledgeResearchBridge(bridge,{enforceCensus:false}),{
  status:MASS_KNOWLEDGE_BRIDGE_STATUS,units:2,cues:1,wordAnchors:1,
  authorClaims:1,mysteryOwners:1,editoriallyCertified:false
});
const unit=massKnowledgeResearchContext(bridge,{unitId:"AO.V3.0001.U001"});
assert.equal(unit.visibility,"EDITORIAL_RESEARCH_ONLY");
assert.equal(unit.publicationAllowed,false);
assert.deepEqual(unit.cueIds,["AO.SM.C0001"]);
assert.deepEqual(unit.authorClaimIds,["VER-001"]);
assert.deepEqual(unit.wordAnchorIds,["AO.V3.0001.C01"]);
assert.deepEqual(unit.mysteryOwnerIds,["AO.CARD.001"]);
assert.equal(unit.scriptureCandidates[0].status,"EDITORIAL_REVIEW_REQUIRED");
assert.equal(unit.scriptureCandidates[0].relation,"B · ADAPTED");
assert.ok(!JSON.stringify(unit).includes("In nómine"));
assert.deepEqual(massKnowledgeResearchContext(bridge,{cueId:"AO.SM.C0001"}).unitIds,
  ["AO.V3.0001.U001","AO.V3.0001.U002"]);
assert.equal(massKnowledgeResearchContext(bridge,{guideId:"AO.CARD.001"}).unitIds.length,2);
assert.equal(massKnowledgeResearchContext(bridge,{unitId:"missing"}).unitIds.length,0);
assert.throws(()=>massKnowledgeResearchContext(bridge,{}),/exactly one/);
assert.throws(()=>massKnowledgeResearchContext(bridge,{unitId:"a",cueId:"b"}),/exactly one/);
assert.throws(()=>validateMassKnowledgeResearchBridge(bridge),/census/);
const clone=()=>JSON.parse(JSON.stringify(bridge));
{
  const bad=clone();bad.governance.autoReleaseAllowed=true;
  assert.throws(()=>validateMassKnowledgeResearchBridge(bad,{enforceCensus:false}),/auto-release/);
}
{
  const bad=clone();bad.units[0].cueId="AO.SM.UNKNOWN";
  assert.throws(()=>validateMassKnowledgeResearchBridge(bad,{enforceCensus:false}),/unresolved cue/);
}
{
  const bad=clone();bad.wordAnchors[0].cueId="AO.SM.UNKNOWN";
  assert.throws(()=>validateMassKnowledgeResearchBridge(bad,{enforceCensus:false}),/without cue/);
}
{
  const bad=clone();bad.units[0].verifiedClaimIds=["VER-404"];
  assert.throws(()=>validateMassKnowledgeResearchBridge(bad,{enforceCensus:false}),/unresolved claim/);
}
{
  const bad=clone();bad.units[0].releaseGate="PUBLISHED";
  assert.throws(()=>validateMassKnowledgeResearchBridge(bad,{enforceCensus:false}),/unsafe unit/);
}
{
  const bad=clone();bad.units.push({...bad.units[0]});
  assert.throws(()=>validateMassKnowledgeResearchBridge(bad,{enforceCensus:false}),/duplicate/);
}
console.log("Mass Knowledge Research Bridge: PASS — research-only links, cross-references, and fail-closed guards.");


// Canonical P0 source reverse mapping: no reader import and no auto-approval.
const sung={
  schema:"ao-reader-text-corpus-v1",form:"SUNG",
  source:{rawSha256:"fixture-sung-donor"},
  blocks:[{
    Block_ID:"AO.SM.B001",Branch_Status:"NORMATIVE_1962",
    units:[
      {cue_id:"AO.SM.C0001",latin:"In nómine Patris, ✠ et Fílii, et Spíritus Sancti. Amen.",proper_slot:null},
      {cue_id:"AO.SM.B096.SYN",latin:null,proper_slot:null}
    ]
  }]
};
const guides={
  schema:"ao-r17-guide-registry-v1",status:"RECOVERED_CONTINUITY_CERTIFIED",
  entries:{"AO.CARD.001":{key:"AO.CARD.001"}}
};
const p0=reconcileMassResearchToCanonical(bridge,{
  sungCorpus:sung,guideRegistry:guides,enforceCensus:false,
  researchLatinByUnitId:{
    "AO.V3.0001.U001":"In nómine Patris, ✠ et Fílii, et Spíritus Sancti.",
    "AO.V3.0001.U002":"Incorrect wording"
  }
});
assert.equal(p0.schema,MASS_CANONICAL_RECONCILIATION_SCHEMA);
assert.equal(p0.counts.researchUnits,2);
assert.equal(p0.counts.canonicalSourceCues,2);
assert.equal(p0.counts.canonicalCuesWithResearch,1);
assert.equal(p0.counts.canonicalSourceOnly,1);
assert.deepEqual(p0.canonicalReverse.find(x=>x.cueId==="AO.SM.B096.SYN").unitIds,[]);
assert.equal(p0.canonicalReverse.find(x=>x.cueId==="AO.SM.B096.SYN").disposition,"APP_ONLY");
assert.equal(p0.units[0].disposition,"EDITORIAL_HOLD");
assert.equal(p0.units[0].evidence,"EXACT_SUBSPAN_BUT_BOUNDARY_UNCERTIFIED");
assert.equal(p0.units[1].disposition,"CONTENT_DIFFERENCE");
assert.deepEqual(p0.units[0].publishedGuideIds,["AO.CARD.001"]);
assert.equal(p0.units[0].publicationAllowed,false);
assert.ok(!JSON.stringify(p0).includes("In nómine"));
const exact=reconcileMassResearchToCanonical(bridge,{
  sungCorpus:sung,guideRegistry:guides,enforceCensus:false,
  researchLatinByUnitId:{"AO.V3.0001.U001":sung.blocks[0].units[0].latin}
});
assert.equal(exact.units[0].disposition,"EXACT_MATCH");
assert.equal(exact.units[0].publicationAllowed,false);
const approval={
  unitId:"AO.V3.0001.U001",targetOwner:"learn.mass",
  targetId:"MF01",evidenceLocator:"1982/edition/page test fixture",
  relationshipType:"OWNER_APPROVED_LINK",editorialDecision:"APPROVED_FOR_PUBLICATION",
  ownerAccepted:true,publicationAllowed:true,sourceTextCertified:true,ritualApplicabilityCertified:true,sourceRevision:"fixture-sung-donor"
};
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.C0001"}),[]);
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.C0001",approvals:[{...approval,ownerAccepted:false}]}),[]);
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.C0001",approvals:[{...approval,sourceRevision:"stale"}]}),[]);
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.C0001",approvals:[approval]}),[]);
assert.deepEqual(massP1ApprovedLinkIds(exact,{cueId:"AO.SM.C0001",approvals:[{...approval,ritualApplicabilityCertified:false}]}),[]);
assert.deepEqual(massP1ApprovedLinkIds(exact,{cueId:"AO.SM.C0001",approvals:[approval]}),[
  {unitId:"AO.V3.0001.U001",targetOwner:"learn.mass",targetId:"MF01",
    relationshipType:"OWNER_APPROVED_LINK"}
]);
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.B096.SYN",approvals:[approval]}),[]);
console.log("Mass P0 Canonical Reconciliation: PASS — reverse mapping, text holds, release guard.");


// Committed P0 baseline crosswalk integrity against the *actual* donor files.
const readJson=rel=>JSON.parse(readFileSync(new URL(rel,import.meta.url),"utf8"));
const p0Baseline=readJson("../docs/research/MASS-P0-CANONICAL-CUE-CROSSWALK-20261016.v1.json");
const guideCrosswalk=readJson("../docs/research/MASS-P0-GUIDE-CONTENT-CROSSWALK-20261016.v1.json");
const canonicalSung=readJson("../data/presentation/reader-text-sung.v1.json");
const canonicalGuides=readJson("../data/presentation/guide-registry.v1.json");
const realCueIds=new Set(canonicalSung.blocks.flatMap(b=>(b.units||[]).map(u=>u.cue_id)));
assert.equal(p0Baseline.status,"TEXT_IDENTITY_STRUCTURALLY_COMPARED_WITH_EDITORIAL_HOLDS");
assert.equal(p0Baseline.units.length,435);
assert.equal(p0Baseline.canonicalReverse.length,realCueIds.size);
assert.equal(p0Baseline.canonicalReverse.length,280);
assert.equal(p0Baseline.summary.researchCueIds,279);
assert.equal(p0Baseline.summary.cuesLinked,246);
assert.equal(p0Baseline.summary.fixedTextUnitsNotTextVerified,430);
assert.equal(p0Baseline.summary.variableTextUnits,5);
assert.ok(p0Baseline.units.every(u=>realCueIds.has(u.canonicalCueId)));
assert.ok(p0Baseline.units.every(u=>u.latinSpanVerified===false));
assert.ok(p0Baseline.units.every(u=>u.releaseDecision==="RESEARCH_ONLY_NO_AUTO_PUBLICATION"));
const unitIds=new Set(p0Baseline.units.map(u=>u.unitId));
assert.equal(unitIds.size,435);
for(const reverse of p0Baseline.canonicalReverse){
  assert.ok(realCueIds.has(reverse.cueId));
  assert.deepEqual(reverse.unitIds,
    p0Baseline.units.filter(u=>u.canonicalCueId===reverse.cueId).map(u=>u.unitId));
  assert.equal(reverse.disposition,reverse.unitIds.length?"RESEARCH_LINK_ONLY":"APP_ONLY");
}
assert.equal(p0Baseline.canonicalReverse.filter(x=>x.disposition==="APP_ONLY").length,34);
assert.ok(p0Baseline.canonicalReverse.some(x=>x.cueId==="AO.SM.B096.SYN"&&
  x.disposition==="APP_ONLY"));
assert.equal(guideCrosswalk.guides.length,154);
assert.equal(guideCrosswalk.guides.filter(x=>x.canonicalRegistryIdFound).length,32);
assert.equal(guideCrosswalk.guides.filter(x=>!x.canonicalRegistryIdFound).length,122);
assert.deepEqual(
  guideCrosswalk.guides.filter(x=>x.canonicalRegistryIdFound).map(x=>x.guideId).sort(),
  Object.keys(canonicalGuides.entries).sort()
);
assert.ok(guideCrosswalk.guides.every(x=>x.approvedNewPublication===false));
console.log("Mass P0 Real Source Inventory: PASS — 435↔280, 154 guides, no auto-publication.");


// P0 typed source-candidate safety checks: source descriptions are never 1962 norms.
const sourceCandidates=readJson("../docs/research/MASS-P0-SCRIPTURE-AUTHOR-RELATIONSHIPS-20261016.v1.json");
assert.equal(sourceCandidates.scriptureCandidates.length,48);
assert.equal(sourceCandidates.historicalAuthorClaims.length,139);
assert.ok(sourceCandidates.scriptureCandidates.every(x=>
  x.publicationAllowed===false && x.certification==="EDITORIAL_HOLD" &&
  x.originalVersificationAndEdition==="NOT_VERIFIED_WITH_CANONICAL_SCRIPTURE_MODULE"));
assert.ok(sourceCandidates.historicalAuthorClaims.every(x=>
  x.publicationAllowed===false && x.normativeRubric===false &&
  x.exactQuotationCertified===false));
assert.equal(sourceCandidates.summary.scriptureCandidatesApproved,0);
assert.equal(sourceCandidates.summary.historicalClaimsApproved,0);
assert.equal(sourceCandidates.summary.byScriptureCandidateType["BIBLICAL_PARALLEL_NOT_DERIVATION"],8);
console.log("Mass P0 Typed Source Candidates: PASS — no direct-link or rubric promotion.");


// P0 original Latin comparison sample is evidence, not an editorial release.
const sourceLatin=readJson("../docs/research/MASS-P0-PARTIAL-LATIN-WITNESS-COMPARISON-20261016.v1.json");
const discrepancyRegister=readJson("../docs/research/MASS-P0-DISCREPANCY-REGISTER-20261016.v1.json");
const baseline=readJson("../docs/research/MASS-P0-BASELINE-MANIFEST-20261016.v1.json");
assert.equal(sourceLatin.units.length,288);
assert.equal(sourceLatin.summary.remainingNotCompared,147);
assert.equal(sourceLatin.summary.tally.NFC_FULL_CUE_MATCH,112);
assert.equal(sourceLatin.summary.tally.NFC_LITERAL_SUBSPAN_MATCH,170);
assert.equal(sourceLatin.summary.tally.LATIN_CONTENT_DIFFERENCE,2);
assert.equal(sourceLatin.summary.tally.VARIABLE_CANONICAL_SLOT,4);
assert.equal(sourceLatin.summary.wordTriggersCertified,0);
assert.equal(sourceLatin.summary.sourceTextApprovedForPublication,0);
assert.ok(sourceLatin.units.every(x=>x.publicationApproved===false));
assert.ok(sourceLatin.units.every(x=>unitIds.has(x.unitId)&&realCueIds.has(x.canonicalCueId)));
assert.equal(new Set(sourceLatin.units.map(x=>x.unitId)).size,288);
assert.equal(discrepancyRegister.summary.totalRegisterEntries,50);
assert.ok(discrepancyRegister.cases.some(x=>x.issueId==="P0-LATIN-AO.V3.0023.U002"));
assert.ok(discrepancyRegister.cases.some(x=>x.issueId==="P0-LATIN-AO.V3.0084.U001"));
assert.equal(baseline.sourceCoverage.originalWorkbookLatinComparedNFC,435);
assert.equal(baseline.sourceCoverage.originalWorkbookLatinNotCompared,0);
assert.equal(baseline.sourceCoverage.sourceUnitsTextVerifiedAgainstOriginalWorkbook,0);
console.log("Mass P0 Latin Witness Sample: PASS — 288 literal comparisons, holds preserved.");


// Second non-publishing corpus comparison completes the research-text census.
const fingerprintLatin=readJson("../docs/research/MASS-P0-REMAINING-LATIN-FINGERPRINT-COMPARISON-20261016.v1.json");
assert.equal(fingerprintLatin.units.length,147);
assert.equal(fingerprintLatin.summary.results.NFC_DUAL_FINGERPRINT_FULL_CUE_MATCH,41);
assert.equal(fingerprintLatin.summary.results.NFC_DUAL_FINGERPRINT_SUBSPAN_MATCH,104);
assert.equal(fingerprintLatin.summary.results.LATIN_CONTENT_DIFFERENCE_OR_UNRESOLVED,1);
assert.equal(fingerprintLatin.summary.results.VARIABLE_CANONICAL_SLOT,1);
assert.ok(fingerprintLatin.units.every(x=>x.sourceWitnessStored===false && x.publicationApproved===false));
const directIDs=new Set(sourceLatin.units.map(u=>u.unitId));
const remainingIDs=new Set(fingerprintLatin.units.map(u=>u.unitId));
assert.ok([...remainingIDs].every(x=>!directIDs.has(x)));
assert.equal(new Set([...directIDs,...remainingIDs]).size,435);
assert.equal(p0Baseline.summary.workbookResearchUnitsComparedToFrozenCanonical,435);
assert.equal(p0Baseline.summary.literalOrFingerprintMatchingStrings,427);
assert.equal(p0Baseline.summary.fullCueMatches,153);
assert.equal(p0Baseline.summary.subspanMatches,274);
assert.equal(p0Baseline.summary.differingLatinWitnesses,3);
assert.equal(p0Baseline.summary.variableProperOrConditionalSourceSlots,5);
assert.equal(p0Baseline.summary.exactPrinted1962Certificates,0);
assert.equal(p0Baseline.summary.wordTriggerCertificates,0);
assert.ok(p0Baseline.units.every(u=>u.latinSpanVerified===false &&
  u.exactPrinted1962Certification===false && u.releaseDecision==="RESEARCH_ONLY_NO_AUTO_PUBLICATION" &&
  typeof u.researchWitnessComparison==="string"));
assert.ok(discrepancyRegister.cases.some(x=>x.issueId==="P0-LATIN-AO.V3.0237.U002"));
console.log("Mass P0 Full Research Witness Census: PASS — all 435 checked; 0 new liturgical certifications.");


// P0 original 66 canonical word-span locations — cue-relative UTF-16 indices.
// This verifies text span identity only, not normative rubrics or faithful posture.
const wordLocations=readJson("../docs/research/MASS-P0-CANONICAL-WORD-ANCHOR-VERIFICATION-20261016.v1.json");
const canonicalCues=new Map(canonicalSung.blocks.flatMap(block=>
  (block.units||[]).map(cue=>[cue.cue_id,{latin:cue.latin,blockId:block.Block_ID}])));
assert.equal(wordLocations.anchors.length,66);
assert.equal(wordLocations.summary.canonicalCueOffsetsValid,66);
assert.equal(wordLocations.summary.actorAndGestureApproved,0);
assert.equal(wordLocations.summary.ritualApplicabilityApproved,0);
assert.equal(wordLocations.policy.coordinateSystem,
  "Canonical cue Latin UTF-16 code-unit offset, not research micro-unit offset");
for(const a of wordLocations.anchors){
  assert.ok(unitIds.has(a.researchUnitId),"unknown research unit "+a.researchUnitId);
  const cue=canonicalCues.get(a.canonicalCueId);
  assert.ok(cue,"unknown canonical cue "+a.canonicalCueId);
  assert.equal(cue.blockId,a.canonicalBlockId);
  assert.ok(Number.isInteger(a.start)&&Number.isInteger(a.end)&&
    a.start>=0&&a.start<a.end&&a.end<=cue.latin.length);
  assert.equal(cue.latin.slice(a.start,a.end),a.verifiedExactSourceSpan);
  assert.equal(a.textLocationStatus,"CANONICAL_SOURCE_SPAN_LOCATED");
  assert.equal(a.actorAndGestureStatus,"EDITORIAL_REVIEW_REQUIRED");
  assert.equal(a.ritualApplicabilityStatus,"EDITORIAL_REVIEW_REQUIRED");
  assert.equal(a.editoriallyApproved,false);
  assert.equal(a.published,false);
}
console.log("Mass P0 Word Anchor Verification: PASS — 66 exact source spans, no ceremony approval.");


// P0 reverse source coverage dispositions: research microtext is not required
// for priest-action states, Proper placeholders or synthetic sermon headers.
const reverseDisposition=readJson("../docs/research/MASS-P0-REVERSE-COVERAGE-DISPOSITIONS-20261016.v1.json");
const reverseSourceCueIds=new Set(p0Baseline.canonicalReverse
  .filter(x=>x.disposition==="APP_ONLY").map(x=>x.cueId));
assert.equal(reverseDisposition.canonicalSourceOnlyRows.length,34);
assert.equal(reverseDisposition.summary.sourceKinds.SOURCE_ACTION_NOT_PRAYER_TEXT,15);
assert.equal(reverseDisposition.summary.sourceKinds.VARIABLE_PROPER_OR_RITUAL_PLACEHOLDER,18);
assert.equal(reverseDisposition.summary.sourceKinds.OPTIONAL_SERMON_SYNTHETIC_SOURCE,1);
assert.deepEqual(
  reverseDisposition.canonicalSourceOnlyRows.map(x=>x.cueId).sort(),
  [...reverseSourceCueIds].sort()
);
for(const x of reverseDisposition.canonicalSourceOnlyRows){
  assert.equal(x.identityDisposition,"CANONICAL_SOURCE_ONLY_EXPECTED_TYPE");
  assert.equal(x.publicationApproval,false);
}
assert.equal(reverseDisposition.publishedGuideSectionBindings.length,4);
assert.deepEqual(
  reverseDisposition.publishedGuideSectionBindings.map(x=>x.guideId).sort(),
  ["AO.CARD.006","AO.CARD.008","POST.MASS","PRE.ASPERGES"]
);
assert.ok(reverseDisposition.publishedGuideSectionBindings.every(x=>
  x.disposition==="PUBLISHED_GUIDE_SECTION_LEVEL_NOT_MICROTEXT" &&
  x.copyOrMoveGuideText===false &&
  x.linkReadyForP1==="OWNER_AND_RITUAL_CONDITION_REVIEW"));
console.log("Mass P0 Reverse Source Coverage: PASS — 34 source-only cues and 4 Guide sections.");


// P0 279 event-owner identity check: structural mapping, not 1962 rubrical certification.
const eventOwners=readJson("../docs/research/MASS-P0-PRIEST-EVENT-IDENTITIES-20261016.v1.json");
assert.equal(eventOwners.pairs.length,279);
assert.equal(eventOwners.summary.uniqueCanonicalSourceCueIds,279);
assert.equal(eventOwners.summary.actionActorAndRitualFullyCertified,0);
const eventIds=new Set();
const eventCueIds=new Set();
const canonicalCueMetadata=new Map(canonicalSung.blocks.flatMap(b=>
  (b.units||[]).map(c=>[c.cue_id,{blockId:b.Block_ID,clock:c.clock}])));
for(const event of eventOwners.pairs){
  assert.ok(/^AO\.SM\.P\d{4}$/.test(event.eventId));
  assert.ok(!eventIds.has(event.eventId));
  eventIds.add(event.eventId);
  assert.ok(!eventCueIds.has(event.canonicalCueId));
  eventCueIds.add(event.canonicalCueId);
  assert.equal(canonicalCueMetadata.get(event.canonicalCueId)?.blockId,event.canonicalBlockId);
  assert.equal(canonicalCueMetadata.get(event.canonicalCueId)?.clock,event.clockFromCanonicalText);
  assert.equal(event.eventActionActorRitualVerified,false);
  assert.equal(event.publicationPermission,false);
}
assert.equal(eventIds.size,279);
assert.equal(eventCueIds.size,279);
console.log("Mass P0 Research Priest-Event Identity: PASS — 279/279 donor cue IDs, no ritual promotion.");


// P0 source word-to-ceremonial registry concordance: a found Latin word
// never implies approval of a new ritual action or congregational mandate.
const ritualOwners=readJson("../docs/research/MASS-P0-WORD-ANCHOR-RUBRIC-OWNER-CONCORDANCE-20261016.v1.json");
const canonicalRubricOwners=readJson("../data/presentation/reader-rubric-events.v1.json");
const canonicalPriestActions=readJson("../data/presentation/reader-priest-actions.v1.json");
const ownersByCue=(items)=>new Map(items.reduce((rows,x)=>{
  const group=rows.find(entry=>entry[0]===x.cueId);
  if(group)group[1].push(x); else rows.push([x.cueId,[x]]);
  return rows;
},[]));
const ownerRubricByCue=ownersByCue(canonicalRubricOwners.items);
const ownerActionsByCue=ownersByCue(canonicalPriestActions.items);
assert.equal(ritualOwners.anchors.length,66);
assert.equal(ritualOwners.summary.withEitherExistingOwner,53);
assert.equal(ritualOwners.summary.withNoCueLevelGestureOwner,13);
assert.equal(ritualOwners.summary.wordAnchorCeremonialApprovals,0);
assert.equal(ritualOwners.governance.noUnconditionalCredoKneel,true);
for(const entry of ritualOwners.anchors){
  const current=(ownerRubricByCue.get(entry.canonicalCueId)||[]).map(x=>x.id);
  const actions=(ownerActionsByCue.get(entry.canonicalCueId)||[]).map(x=>x.label);
  assert.deepEqual(entry.currentOwnerRelationships.rubricEventIds,current);
  assert.deepEqual(entry.currentOwnerRelationships.priestActionLabels,actions);
  assert.equal(entry.permissiblePublicActionWithoutFurtherEditorialApproval,false);
  assert.equal(entry.ceremonialActorAndTimingCertified,false);
}
for(const id of ["AO.V3.0096.C01","AO.V3.0096.C02"]){
  assert.equal(ritualOwners.anchors.find(x=>x.anchorId===id)?.conditionRequiringExplicitReview,
    "CODE_518B_CREDO_ACTOR_POSITION_AND_CALENDAR_CONDITIONS");
}
console.log("Mass P0 Word Anchor/Ritual Owner: PASS — 66 anchors, 53 owner overlaps, 13 review-only; no new rubric.");


// P0 two display variants and live Gospel selection owner check.
// A fixed donor heading must NOT be approved for use in all selected Masses.
const discrepancyDecisions=readJson("../docs/research/MASS-P0-THREE-LATIN-DISCREPANCY-DECISIONS-20261016.v1.json");
assert.equal(discrepancyDecisions.counts.rawDifferences,3);
assert.equal(discrepancyDecisions.counts.displayAccentuationsExplained,2);
assert.equal(discrepancyDecisions.counts.remainingConditionalGospelOwnerRisk,1);
assert.equal(discrepancyDecisions.counts.publicationAuthorizations,0);
const donorByCue=new Map(canonicalSung.blocks.flatMap(b=>(b.units||[]).map(x=>[x.cue_id,x])));
for(const id of ["AO.SM.C0023","AO.SM.C0237"]){
  const donor=donorByCue.get(id)?.latin;
  assert.ok(donor?.includes("oráre pro me"),"frozen Confiteor witness shifted "+id);
}
const gospelCue=donorByCue.get("AO.SM.C0084")?.latin;
assert.ok(gospelCue?.includes("secúndum Matthǽum"));
assert.equal(discrepancyDecisions.decisions.find(x=>
  x.family==="GOSPEL_HEADING_VARIABLE_EVANGELIST")?.P0Decision,
  "CONFIRMED_SOURCE_FIRST_MODEL_ANNOUNCEMENT_PROPER_MISMATCH_REQUIRES_OWNER_FIX");
assert.equal(discrepancyDecisions.release,
  "FAIL_CLOSED_UNTIL_FORM_CORRECT_GOSPEL_HEADING_RUNTIME_CHECK");
console.log("Mass P0 Latin Adjudication: PASS — two accent variants, one unresolved Proper header risk.");


// P0 Gospel heading risk in a real source-first model.
// A synthetic, clearly Gospel-of-John Proper probes whether the donor's
// static Matthew heading is resolved with the actual selected reading.
// No production source or reader view is modified by this diagnostic.
const {createMassReaderModel:p0CreateModel}=await import("../src/mass/reader-model.js");
const p0SectionMap=readJson("../data/presentation/reader-section-map.v0.13.1.json");
const p0TextLow=readJson("../data/presentation/reader-text-low.v1.json");
const p0TextSung=readJson("../data/presentation/reader-text-sung.v1.json");
const p0T=(lat,en)=>({lat,en});
const p0JohnProper={
  sourcePath:"TEST_ONLY/BIBLICAL_JOHN",
  introit:p0T("Intróitus probationis","Test Introit"),
  collects:[p0T("Orátio probationis","Test Collect")],
  epistle:p0T("Léctio probationis","Test Epistle"),
  gradual:p0T("Graduále probationis","Test Gradual"),
  sequence:p0T("",""),
  gospel:p0T("In princípio erat Verbum, et Verbum erat apud Deum, et Deus erat Verbum.",
    "In the beginning was the Word, and the Word was with God, and the Word was God."),
  offertory:p0T("Offertórium probationis","Test Offertory"),
  secrets:[p0T("Secréta probationis","Test Secret")],
  preface:p0T("Præfátio probationis","Test Preface"),
  communion:p0T("Commúnio probationis","Test Communion"),
  postcommunions:[p0T("Postcommúnio probationis","Test Postcommunion")],
};
const p0JohnMass={
  schema:"ao-resolved-mass-v2",date:"2026-10-04",
  form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
  actualCelebration:{id:"P0_JOHN_DIAGNOSTIC",type:"VOTIVE",title:"P0 Gospel heading test"},
  calendarCelebration:{id:"P0_CALENDAR_FIXTURE",type:"CALENDAR"},
  explicitlySelectedCelebration:true,
  proper:{status:"READY",data:p0JohnProper,sourcePath:p0JohnProper.sourcePath},
  overlays:[],precedingRites:[],followingActions:[],distinctRite:null,
};
const p0TestModel=p0CreateModel({
  resolvedMass:p0JohnMass,
  sectionMap:p0SectionMap,
  lowCorpus:p0TextLow,
  sungCorpus:p0TextSung,
  canonSourceMap:readJson("../data/presentation/reader-canon-source-map.v1.json"),
});
const p0ModelCue=(id)=>p0TestModel.cards.flatMap(c=>c.paragraphs)
  .find(p=>p.sourceCueIds?.includes(id));
const p0GospelTitle=p0ModelCue("AO.SM.C0084");
const p0GospelReading=p0TestModel.cards.flatMap(c=>c.paragraphs)
  .filter(p=>p.sourceCueIds?.includes("AO.SM.C0086") || p.id?.startsWith("GOSPEL.") || p.id?.startsWith("AO.SM.B026"));
assert.ok(p0GospelTitle,"resolved reader lacks Gospel proclamation heading");
assert.ok(p0GospelReading.length,"resolved reader lacks Gospel Proper reading");
assert.ok(p0GospelReading.some(p=>
  [p.primary,p.alternate].some(s=>String(s??"").includes("In princípio erat Verbum"))),
  "John Proper fixture was not rendered");
const p0HeadingText=[p0GospelTitle.primary,p0GospelTitle.alternate].join(" ");
const p0StaticMatthew=p0HeadingText.includes("Matthǽum");
if(p0StaticMatthew){
  assert.equal(discrepancyDecisions.decisions.find(x=>
    x.family==="GOSPEL_HEADING_VARIABLE_EVANGELIST")?.P0Decision,
    "CONFIRMED_SOURCE_FIRST_MODEL_ANNOUNCEMENT_PROPER_MISMATCH_REQUIRES_OWNER_FIX");
}
console.log("Mass P0 John Gospel heading source-first diagnostic: "+
  (p0StaticMatthew?"CONFIRMED_STATIC_MATTHEW_HEADING_OWNER_RISK":"NO_STATIC_MATTHEW_HEADING_DETECTED")+" (no runtime mutation).");
