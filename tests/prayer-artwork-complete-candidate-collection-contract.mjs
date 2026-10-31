import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const root="../data/prayer/artwork-editorial-20261031/";
const index=read(root+"all-267-source-linked-artwork-candidate-collection.v1.json");
const curated=read(root+"curated-research-proposal-matches-for-last-23.v1.json");
test("every historical prayer artwork position has accessible grouped candidates",()=>{
 assert.equal(index.shards.length,11);
 const slots=new Set();let edges=0,candidates=0,excluded=0;
 for(const f of index.shards){
  const x=read(root+"collection-family-"+f.family+".v1.json");
  assert.equal(x.stats.slots,f.slots);
  assert.equal(x.slots.length,f.slots);
  edges+=x.stats.originalSourceEdges;
  candidates+=x.stats.deduplicatedReviewOptions;
  excluded+=x.stats.excludedDoNotSuggest;
  for(const s of x.slots){
   assert.ok(!slots.has(s.slot),"double mapped "+s.slot);
   slots.add(s.slot);
   assert.ok(s.reviewCollection.length>0,"zero art candidates "+s.slot);
   assert.equal(s.imagePublicationAllowed===true,false);
   for(const w of s.reviewCollection){
    assert.ok(w.title&&w.artist,"missing original artist/title "+s.slot);
    assert.ok(w.productionEnabled===false||w.notForLive===true,"candidate must remain unpublished");
   }
  }
 }
 assert.equal(slots.size,267);
 assert.equal(edges,1651);
 assert.equal(candidates,1506);
 assert.equal(excluded,100);
 assert.equal(index.counts.artworkPhotosNewlyReleased,0);
 assert.equal(index.counts.newResearchApproved,0);
});
test("all 23 old gaps have curated source options for a later single user review",()=>{
 const entries=Object.entries(curated.proposalsBySlot);
 assert.equal(entries.length,23);
 assert.equal(entries.reduce((n,[,v])=>n+v.length,0),39);
 for(const [slot,proposals]of entries){
  assert.ok(proposals.length>0,slot);
  for(const p of proposals){
   assert.equal(p.userHasApprovedNewArtwork,false);
   assert.equal(p.productionEnabled,false);
   assert.ok(p.artist&&p.title);
   if(p.existingDecision.includes("NEW_RESEARCH")||p.existingDecision.includes("UNAPPROVED"))assert.equal(p.artworkAcceptedPreviously,false);
  }
 }
});
test("rejected artworks are excluded from active review while old source IDs remain auditable",()=>{
 for(const f of index.shards){
  const shard=read(root+"collection-family-"+f.family+".v1.json");
  for(const slot of shard.slots){
   for(const w of slot.reviewCollection){
    assert.ok(!/lybaert|ugolino da siena|fra angelico|el greco/i.test(w.artist),w.artist);
    assert.ok(!/prado/i.test((w.title||"")+" "+(w.sourcePage||"")));
    assert.ok(w.productionEnabled===false||w.notForLive===true,"candidate must remain unpublished");
   }
  }
 }
});
