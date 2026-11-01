import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const w2=read("../data/prayer/artwork-editorial-20261031/approved-existing-art-reassignments-wave2.v1.json");
const w3=read("../data/prayer/artwork-editorial-20261031/approved-existing-art-reassignments-wave3.v1.json");
const research=read("../data/prayer/artwork-editorial-20261031/new-art-gap-source-shortlist-20261031.v1.json");
test("third pass is exclusive reuse of user-approved paintings, with no new approvals",()=>{
 assert.equal(w3.policy.allNewArtResearchRequiresExplicitUserApproval,true);
 assert.equal(w3.policy.noNewCandidateApproved,true);
 assert.equal(w3.summary.priorCovered,w2.statistics.editorialCoveredAfterWave);
 assert.equal(w3.summary.previouslyUncoveredReused,10);
 assert.equal(w3.summary.nowCovered,244);
 assert.equal(w3.summary.remaining,23);
 assert.equal(w3.summary.remainingPrayer,12);
 assert.equal(w3.summary.remainingSeasonal,11);
 assert.equal(w3.summary.nowCovered+w3.summary.remaining,267);
 assert.equal(new Set(w3.reassignments.map(x=>x.targetSlot)).size,10);
 for(const x of w3.reassignments) {
  assert.equal(x.editorialStatus,"EXISTING_USER_APPROVED_WORK_REUSED_NO_NEW_RESEARCH");
  assert.equal(x.assetPublicationAllowedByThisRecord,false);
  assert.ok(x.sourceApprovalId && x.sourceLink && x.sourceApprovalContext);
  assert.ok(w2.remaining.some(r=>r.slot===x.targetSlot));
  assert.ok(!w3.remaining.some(r=>r.slot===x.targetSlot));
  assert.ok(!/ugolino da siena|lybaert/i.test(x.painting.artist));
 }
});
test("none of the five independently researched works is approved or activated",()=>{
 assert.equal(research.records.length,5);
 assert.equal(research.newResearchEditorialGate.approvedIds.length,0);
 assert.equal(research.newResearchEditorialGate.noCandidateMayBeAutoApproved,true);
 for(const r of research.records){
  assert.equal(r.status,"RESEARCH_ONLY_AWAIT_EXPLICIT_USER_APPROVAL");
  assert.equal(r.userApprovalReceived,false);
  assert.equal(r.productionUseAllowed,false);
 }
});
test("different Guercino paintings and photographs are not conflated",()=>{
 const g=research.records.find(x=>x.artist==="Guercino");
 assert.match(g.museum,/NOT Scottish National Gallery/);
 assert.match(g.note,/The two original objects differ/);
 assert.match(g.claimedRights,/Sotheby's 2009/);
 assert.ok(!w3.reassignments.some(x=>x.painting.artist==="Guercino"));
});
test("approved Communion paintings remain original and nonliteral at After Communion",()=>{
 const v=w3.reassignments.find(x=>x.targetSlot==="STG-prayer.communion-02");
 assert.equal(v.painting.artist,"Sebastiano Ricci");
 assert.equal(v.sourceApprovalId,"w4-ricci");
 assert.equal(v.improvementStillNeededForExactScene,true);
 assert.match(v.relationship,/NOT_AFTER_COMMUNION/);
});
