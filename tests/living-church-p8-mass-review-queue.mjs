import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),"utf8"));
const review=await read("../data/learn/living-church-p8-mass-chat-witness-review.v1.json");
const formation=await read("../data/learn/mass-formation-campion.v1.json");
assert.equal(review.publication,"RESEARCH_REVIEW_ONLY");
assert.equal(review.newChatSynthesisAuthorized,false);
assert.equal(review.sourceOfTruth,"data/learn/mass-formation-campion.v1.json");
assert.equal(review.stages.length,8);
assert.equal(review.existingFormationP1ClaimCount,24);
let approved=0;
for(let i=0;i<formation.stages.length;i++){
 const source=formation.stages[i],item=review.stages[i];
 assert.equal(item.id,source.id);
 assert.deepEqual(item.claimIds,source.claims.map(c=>c.id));
 assert.equal(item.publicationOfExistingClaim,"FORMATION_P1_SOURCE_BACKED");
 assert.equal(item.sourceWitnessLevel,"DOCUMENT_REFERENCES_ONLY");
 assert.equal(item.conversationalParaphraseApproved,false);
 assert.equal(item.exactPassageWitnessesApproved,0);
 assert.equal(item.reviewer,null);
 approved+=item.exactPassageWitnessesApproved;
}
assert.equal(approved,0,"Document links are not exact textual-witness certification");
console.log("PASS P8 24-claim editorial queue mirrors canonical Formation P1 without approving new generated answers");
