import assert from "node:assert/strict";
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
  ownerAccepted:true,publicationAllowed:true,sourceRevision:"fixture-sung-donor"
};
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.C0001"}),[]);
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.C0001",approvals:[{...approval,ownerAccepted:false}]}),[]);
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.C0001",approvals:[{...approval,sourceRevision:"stale"}]}),[]);
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.C0001",approvals:[approval]}),[
  {unitId:"AO.V3.0001.U001",targetOwner:"learn.mass",targetId:"MF01",
    relationshipType:"OWNER_APPROVED_LINK"}
]);
assert.deepEqual(massP1ApprovedLinkIds(p0,{cueId:"AO.SM.B096.SYN",approvals:[approval]}),[]);
console.log("Mass P0 Canonical Reconciliation: PASS — reverse mapping, text holds, release guard.");
