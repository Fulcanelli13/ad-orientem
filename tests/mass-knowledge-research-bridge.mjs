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
assert.equal(p0Baseline.status,"DRAFT_RESEARCH_ONLY_NOT_SOURCE_TEXT_CERTIFIED");
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
assert.equal(discrepancyRegister.summary.totalRegisterEntries,49);
assert.ok(discrepancyRegister.cases.some(x=>x.issueId==="P0-LATIN-AO.V3.0023.U002"));
assert.ok(discrepancyRegister.cases.some(x=>x.issueId==="P0-LATIN-AO.V3.0084.U001"));
assert.equal(baseline.sourceCoverage.originalWorkbookLatinComparedNFC,288);
assert.equal(baseline.sourceCoverage.originalWorkbookLatinNotCompared,147);
assert.equal(baseline.sourceCoverage.sourceUnitsTextVerifiedAgainstOriginalWorkbook,0);
console.log("Mass P0 Latin Witness Sample: PASS — 288 literal comparisons, holds preserved.");
