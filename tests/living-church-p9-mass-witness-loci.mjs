import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url),"utf8"));
const evidence=await read("../data/learn/living-church-p9-mass-witness-loci.v1.json");
const owner=await read("../data/learn/mass-formation-campion.v1.json");
const release=await read("../data/learn/living-church-p8-mass-chat-witness-review.v1.json");
assert.equal(evidence.schema,"AO_LIVING_CHURCH_P9_MASS_SOURCE_LOCUS_RESEARCH_V1");
assert.equal(evidence.recordCount,24);
assert.equal(evidence.records.length,24);
assert.equal(evidence.sourceOfTruth,"data/learn/mass-formation-campion.v1.json");
assert.equal(evidence.massReaderTouched,false);
const claims=owner.stages.flatMap(s=>s.claims.map(c=>({...c,stageId:s.id})));
assert.deepEqual(evidence.records.map(r=>r.claimId),claims.map(c=>c.id));
const sources=new Map(owner.sources.map(s=>[s.id,s]));
for(const [i,record] of evidence.records.entries()){
 const claim=claims[i];
 assert.equal(record.stageId,claim.stageId);
 assert.deepEqual(record.ownerClaimSources,claim.sources);
 assert.ok(record.witnessLeads.length>=1);
 assert.equal(record.completeClaimVerified,false);
 assert.equal(record.editionPaginationVerified,false);
 assert.equal(record.englishClaimChecked,false);
 assert.equal(record.frenchClaimChecked,false);
 assert.equal(record.independentEditorialApproval,false);
 assert.equal(record.conversationParaphraseReleased,false);
 for(const lead of record.witnessLeads){
  const canonical=sources.get(lead.sourceId);
  assert.ok(canonical,"Witness URL must belong to known source registry");
  assert.equal(typeof lead.locator,"string");
  assert.ok(lead.locator.length>=3);
  assert.match(lead.url,/^https:\/\//);
  if(lead.status==="ORIGINAL_PRIMARY_PARAGRAPH_LOCATED"){
   assert.equal(lead.sourceId,"SRC-MEDIATOR-DEI");
   assert.match(lead.locator,/§/);
   assert.match(lead.url,/vatican\.va\/content\/pius-xii/);
   assert.ok(lead.anchor?.length>8);
  }else{
   assert.ok(["MISSAL_SECTION_CANDIDATE_EDITION_PAGE_UNCHECKED",
    "CHAPTER_DISCOVERY_ONLY_NOT_PAGE_ATTESTATION",
    "OCR_EXCERPT_OR_SECTION_CANDIDATE_PAGE_UNCHECKED"].includes(lead.status));
  }
 }
}
const count={originalPrimaryCandidates:evidence.records.filter(r=>r.primaryParagraphCandidates>0).length,
 missalSectionCandidates:evidence.records.filter(r=>r.witnessLeads.some(w=>w.sourceId==="SRC-MR62")).length,
 campionChapterLeads:evidence.records.filter(r=>r.witnessLeads.some(w=>w.sourceId==="SRC-CAMPION-1954")).length,
 oconnellUnverifiedLeads:evidence.records.filter(r=>r.witnessLeads.some(w=>w.sourceId==="SRC-OCONNELL-1962")).length,
 fullyVerifiedClaims:0,approvedGeneratedAnswers:0};
assert.deepEqual(evidence.coverage,count);
assert.equal(release.newChatSynthesisAuthorized,false);
assert.ok(release.stages.every(s=>s.exactPassageWitnessesApproved===0&&s.conversationalParaphraseApproved===false));
assert.equal(evidence.reviewPolicy.generatedAnswer,"DENIED_UNTIL_EXPLICIT_NEW_PUBLICATION_GATES");
console.log("PASS P9 evidence-research mapping: 24 canonical claims, 15 located Pius XII primary paragraph candidates, 11 unresolved missal locators, 7 Campion chapter leads, 3 O'Connell leads; zero approvals");
