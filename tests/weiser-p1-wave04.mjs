import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const inventory=read("../data/customs/research/weiser-handbook-inventory.v0.json");
const wave2=read("../data/customs/research/weiser-p1-wave02-full-reconciliation.v1.json");
const wave3=read("../data/customs/research/weiser-p1-wave03-source-corroboration.v1.json");
const wave4=read("../data/customs/research/weiser-p1-wave04-source-corroboration.v1.json");
const cards=read("../data/customs/research/weiser-p1-wave04-bilingual-editorial-cards.v1.json");
const original=new Map(inventory.records.map(x=>[x.id,x]));
const p1=new Map(wave2.crosswalk.map(x=>[x.weiser_id,x]));
const prev=new Set([...wave2.source_witnesses.flatMap(x=>x.observation_ids),...wave3.witnesses.flatMap(x=>x.observation_ids)]);
assert.equal(prev.size,31);
assert.equal(p1.size,144);
assert.equal(original.size,568);
assert.equal(wave4.totals.previously_screened_p1,31);
assert.equal(wave4.totals.newly_screened_p1,26);
assert.equal(wave4.totals.new_bounded_observations,15);
assert.equal(wave4.totals.new_partial_observations,11);
assert.equal(wave4.totals.bounded_topics,11);
assert.equal(wave4.totals.partial_topics,10);
assert.equal(wave4.totals.cumulative_p1_screened,57);
assert.equal(wave4.totals.remaining_without_any_source_topic,87);
assert.equal(wave4.totals.app_publications,0);
assert.equal(wave4.witnesses.length,21);
const mapped=new Set(),witnesses=new Map();
for(const witness of wave4.witnesses){
 assert.ok(!witnesses.has(witness.witness_id));
 witnesses.set(witness.witness_id,witness);
 assert.ok(/^https:\/\//.test(witness.independent_source.url));
 assert.ok(witness.independent_source.issuer?.length>15);
 assert.ok(witness.claim_supported_and_limitations?.length>80);
 assert.ok(witness.classification==="BOUNDED_INDEPENDENT"||witness.classification.startsWith("PARTIAL_"));
 assert.equal(witness.release,"RESEARCH_ONLY_NOT_PUBLISHED");
 for(const id of witness.observation_ids){
   assert.ok(p1.has(id),"outside P1: "+id);
   assert.ok(original.has(id),"missing Weiser locator: "+id);
   assert.equal(original.get(id).triage==="EXCLUDE",false);
   assert.equal(prev.has(id),false,"previously screened: "+id);
   assert.equal(mapped.has(id),false,"multiple Wave04 statuses: "+id);
   mapped.add(id);
 }
}
assert.equal(mapped.size,26);
const bounded=wave4.witnesses.filter(x=>x.classification==="BOUNDED_INDEPENDENT");
const partial=wave4.witnesses.filter(x=>x.classification.startsWith("PARTIAL_"));
assert.equal(bounded.length,11);
assert.equal(partial.length,10);
assert.equal(bounded.flatMap(x=>x.observation_ids).length,15);
assert.equal(partial.flatMap(x=>x.observation_ids).length,11);
assert.equal(cards.cards.length,10);
assert.equal(cards.totals.bilingual_summaries,10);
assert.equal(cards.totals.independently_bounded_observations,15);
assert.equal(cards.totals.partial_claim_observations_held,11);
assert.equal(cards.totals.app_publications,0);
assert.equal(cards.partial_evidence_holds.length,10);
const used=new Set();
const cardIds=new Set();
for(const card of cards.cards){
 assert.equal(cardIds.has(card.card_id),false);
 cardIds.add(card.card_id);
 assert.equal(card.publication_state,"EDITORIAL_DRAFT_REVIEW_REQUIRED_NOT_PUBLISHED");
 assert.ok(card.publication_caution?.length>40);
 assert.ok(card.geographic_scope?.length>20);
 for(const field of ["title_en","title_fr","description_en","description_fr","meaning_en","meaning_fr","suggested_observance_en","suggested_observance_fr"]){
  assert.ok(card[field]?.length>(field.startsWith("title_")?10:55),"missing bilingual copy: "+card.card_id+" "+field);
 }
 const sourceIds=new Set(card.weiser_sources.map(x=>x.observation_id));
 assert.equal(sourceIds.size,card.weiser_sources.length);
 for(const x of card.weiser_sources){
   assert.ok(original.has(x.observation_id));
   assert.equal(x.chapter,original.get(x.observation_id).chapter);
   assert.equal(x.printed_page,original.get(x.observation_id).page);
   assert.equal(used.has(x.observation_id),false,"one observation cannot have two published card drafts");
   used.add(x.observation_id);
 }
 for(const w of card.independent_witnesses){
  const src=witnesses.get(w.witness_id);
  assert.ok(src && src.classification==="BOUNDED_INDEPENDENT", "partial witness promoted: "+w.witness_id);
  assert.equal(src.independent_source.url,w.url);
  for(const id of src.observation_ids)assert.ok(sourceIds.has(id),"missing multi-id witness claim "+id);
 }
}
assert.equal(used.size,15);
for(const w of bounded)for(const id of w.observation_ids)assert.ok(used.has(id),"bounded ID without card "+id);
for(const w of partial){
 const hold=cards.partial_evidence_holds.find(x=>x.witness_id===w.witness_id);
 assert.ok(hold && hold.required_action==="KEEP_RESEARCH_ONLY_DO_NOT_PUBLISH_AS_VERIFIED_CUSTOM");
 for(const id of w.observation_ids)assert.equal(used.has(id),false);
}
assert.equal(inventory.records.filter(x=>x.triage==="EXCLUDE").length,34);
assert.equal(144-new Set([...prev,...mapped]).size,87);
console.log("PASS Weiser P1 Wave04: 26 new screened; 15 source-bounded -> 10 bilingual review drafts; 11 partial protected; 57/144 cumulative screened; 87 unscreened; 0 app publications.");
