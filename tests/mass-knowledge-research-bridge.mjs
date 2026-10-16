import assert from "node:assert/strict";
import {
  validateMassKnowledgeResearchBridge,
  massKnowledgeResearchContext,
  MASS_KNOWLEDGE_BRIDGE_SCHEMA,
  MASS_KNOWLEDGE_BRIDGE_STATUS
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
