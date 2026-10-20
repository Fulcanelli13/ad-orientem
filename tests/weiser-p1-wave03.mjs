import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const inv=read("../data/customs/research/weiser-handbook-inventory.v0.json");
const prior=read("../data/customs/research/weiser-p1-wave02-full-reconciliation.v1.json");
const wave=read("../data/customs/research/weiser-p1-wave03-source-corroboration.v1.json");
const drafts=read("../data/customs/research/weiser-p1-wave03-bilingual-editorial-cards.v1.json");
const original=new Map(inv.records.map(x=>[x.id,x]));
const p1=new Map(prior.crosswalk.map(x=>[x.weiser_id,x]));
const old=new Set(prior.crosswalk.filter(x=>x.independent_evidence_id).map(x=>x.weiser_id));
assert.equal(inv.records.length,568);
assert.equal(p1.size,144);
assert.equal(old.size,14);
assert.equal(wave.totals.previously_bounded_p1_observations,14); // previously evidence-reviewed, including partial
assert.equal(wave.totals.new_bounded_p1_observations,12);
assert.equal(wave.totals.new_partial_p1_observations,5);
assert.equal(wave.totals.new_bounded_topics,11);
assert.equal(wave.totals.new_partial_topics,5);
assert.equal(wave.totals.cumulative_p1_evidence_reviewed,31);
assert.equal(wave.totals.remaining_p1_without_independent_topic,113);
assert.equal(wave.totals.publication_releases,0);
const allSeen=new Set();
const witnesses=new Map();
for(const w of wave.witnesses){
 assert.ok(w.witness_id && !witnesses.has(w.witness_id));
 witnesses.set(w.witness_id,w);
 assert.ok(/^https:\/\//.test(w.url),"bad source URL "+w.witness_id);
 assert.ok(w.verified_scope?.length>50);
 assert.ok(w.source_status==="BOUNDED_INDEPENDENT"||w.source_status.startsWith("PARTIAL_"));
 assert.equal(w.publication_state,"RESEARCH_ONLY_NO_AUTO_PUBLISH");
 for(const id of w.observation_ids){
   assert.ok(p1.has(id),"wave source outside P1: "+id);
   assert.ok(!old.has(id),"reused already screened observation "+id);
   assert.ok(!allSeen.has(id),"duplicate wave03 source link "+id);
   allSeen.add(id);
   assert.notEqual(original.get(id).triage,"EXCLUDE");
 }
}
assert.equal(witnesses.size,16);
assert.equal(allSeen.size,17);
const bounded=wave.witnesses.filter(x=>x.source_status==="BOUNDED_INDEPENDENT");
const partial=wave.witnesses.filter(x=>x.source_status.startsWith("PARTIAL_"));
assert.equal(bounded.length,11);
assert.equal(partial.length,5);
assert.equal(bounded.flatMap(x=>x.observation_ids).length,12);
assert.equal(partial.flatMap(x=>x.observation_ids).length,5);
assert.equal(drafts.totals.bilingual_summary_cards,10);
assert.equal(drafts.cards.length,10);
assert.equal(drafts.totals.independently_bounded_source_observations,12);
assert.equal(drafts.totals.partial_source_observations_held,5);
assert.equal(drafts.totals.app_publications,0);
const used=new Set(),seenCards=new Set();
for(const card of drafts.cards){
 assert.ok(!seenCards.has(card.card_id));seenCards.add(card.card_id);
 assert.equal(card.publication_state,"SOURCE_CORROBORATED_EDITORIAL_DRAFT_NOT_RELEASED");
 for(const field of ["title_en","title_fr","description_en","description_fr","spiritual_meaning_en","spiritual_meaning_fr","optional_observance_en","optional_observance_fr"]){
  assert.ok(card[field]?.length>(field.startsWith("title_")?10:25),"missing bilingual field "+field+" "+card.card_id);
 }
 assert.ok(card.publication_guard?.length>25);
 assert.equal(card.weiser_locators.length,new Set(card.weiser_locators.map(x=>x.id)).size);
 const localIds=new Set(card.weiser_locators.map(x=>x.id));
 for(const loc of card.weiser_locators){
  assert.equal(loc.printed_page,original.get(loc.id).page);
  assert.ok(allSeen.has(loc.id));
  assert.ok(!used.has(loc.id),"wave 03 source observation in multiple summary cards "+loc.id);
  used.add(loc.id);
 }
 for(const w of card.independent_witnesses){
  const src=witnesses.get(w.witness_id);
  assert.ok(src && src.source_status==="BOUNDED_INDEPENDENT");
  assert.equal(w.url,src.url);
  for(const id of src.observation_ids)assert.ok(localIds.has(id),"incomplete multi-id source card "+id);
 }
}
assert.equal(used.size,12);
assert.equal(drafts.held_partial_claims.length,5);
for(const partialWitness of partial)assert.ok(drafts.held_partial_claims.some(x=>x.witness_id===partialWitness.witness_id&&x.release_state==="HOLD"));
for(const id of ["WEI58-06-001","WEI58-16-020","WEI58-17-011"]){
 assert.equal(used.has(id),false,"unverified migration/running/1962 rite cannot be published as complete summary");
}
console.log("PASS Weiser P1 Wave03: 17 new evidence-screened, 12 bounded, 5 partial holds, 10 complete bilingual summaries, 31/144 cumulative screened, 113 unscreened, zero app publication.");
