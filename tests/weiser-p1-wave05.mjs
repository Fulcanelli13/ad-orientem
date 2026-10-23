import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const inv = read("../data/customs/research/weiser-handbook-inventory.v0.json");
const wave02 = read("../data/customs/research/weiser-p1-wave02-full-reconciliation.v1.json");
const wave03 = read("../data/customs/research/weiser-p1-wave03-source-corroboration.v1.json");
const wave04 = read("../data/customs/research/weiser-p1-wave04-source-corroboration.v1.json");
const wave05 = read("../data/customs/research/weiser-p1-wave05-source-corroboration.v1.json");
const cards = read("../data/customs/research/weiser-p1-wave05-bilingual-editorial-cards.v1.json");

const original = new Map(inv.records.map(x => [x.id, x]));
const selected = new Set(wave02.crosswalk.map(x => x.weiser_id));
const previous = new Set([
  ...wave02.source_witnesses.flatMap(x => x.observation_ids),
  ...wave03.witnesses.flatMap(x => x.observation_ids),
  ...wave04.witnesses.flatMap(x => x.observation_ids)
]);
assert.equal(original.size, 568);
assert.equal(selected.size, 144);
assert.equal(previous.size, 57);
assert.equal(wave05.witnesses.length, 24);
const sources = new Map(), allNew = new Set();
for(const w of wave05.witnesses) {
  assert.ok(!sources.has(w.witness_id), "duplicate evidence ID");
  sources.set(w.witness_id,w);
  assert.ok(w.source.issuer.length > 5 && w.source.url.startsWith("https://"),"missing source");
  assert.ok(w.verified_claim_limit.length > 50);
  assert.equal(w.release_state,"NOT_PUBLISHED");
  for(const id of w.observation_ids) {
    assert.ok(selected.has(id),"source item not in P1 "+id);
    assert.ok(!previous.has(id),"previously reviewed "+id);
    assert.ok(!allNew.has(id),"duplicate mapping "+id);
    allNew.add(id);
    assert.notEqual(original.get(id).triage,"EXCLUDE");
  }
}
assert.equal(allNew.size,25);
const bounded=wave05.witnesses.filter(w=>w.status.startsWith("BOUNDED_"));
const held=wave05.witnesses.filter(w=>!w.status.startsWith("BOUNDED_"));
assert.equal(bounded.length,13);
assert.equal(held.length,11);
assert.equal(bounded.flatMap(w=>w.observation_ids).length,14);
assert.equal(held.flatMap(w=>w.observation_ids).length,11);
assert.equal(wave05.audit.cumulative_reviewed_p1,82);
assert.equal(wave05.audit.remaining_p1_without_source_review,62);
assert.equal(144-new Set([...previous,...allNew]).size,62);
assert.equal(wave05.audit.app_publications,0);

assert.equal(cards.cards.length,10);
assert.equal(cards.stats.independently_supported_observations_in_cards,12);
assert.equal(cards.stats.bounded_context_only_observations,2);
assert.equal(cards.stats.partially_supported_held_observations,11);
assert.equal(cards.stats.published,0);
const covered = new Set(), cardKeys=new Set();
for(const card of cards.cards) {
  assert.ok(!cardKeys.has(card.card_id));
  cardKeys.add(card.card_id);
  assert.equal(card.editorial_status,"BILINGUAL_DRAFT_SOURCE_BOUNDED_NOT_APP_PUBLISHED");
  for(const key of ["title_en","title_fr","description_en","description_fr","meaning_en","meaning_fr","optional_observance_en","optional_observance_fr"]) {
    const min=key.startsWith("title_")?12:40;
    assert.ok(card[key]?.length > min,"missing copy "+key+" "+card.card_id);
  }
  assert.ok(card.caution.length > 70,"missing meaningful publication caution");
  assert.ok(card.scope.length > 45,"missing geographic/historical scope");
  assert.ok(card.existing_owner?.length > 20,"missing existing app owner");
  assert.ok(/^(Calendar|Customs Atlas|Learn|Saints|Existing blessing)/.test(card.existing_owner),"owner must identify an existing app surface");
  assert.ok(!/^(Calendar|Customs Atlas|Learn|Saints|Existing blessing)/.test(card.caution),"owner label appears in caution field");
  assert.ok(card.description_en.length > 150 && card.description_fr.length > 150,"descriptions swapped or missing");
  assert.ok(card.optional_observance_en.length > 75 && card.optional_observance_fr.length > 75,"optional observance missing");
  const locIds=new Set(card.weiser_locators.map(x=>x.id));
  assert.equal(locIds.size,card.weiser_locators.length);
  for(const loc of card.weiser_locators) {
    assert.equal(loc.chapter,original.get(loc.id).chapter);
    assert.equal(loc.printed_page,original.get(loc.id).page);
    assert.ok(!covered.has(loc.id),"duplicate card identity "+loc.id);
    covered.add(loc.id);
  }
  for(const witness of card.independent_evidence) {
    const src=sources.get(witness.witness_id);
    assert.ok(src && src.status.startsWith("BOUNDED_"));
    assert.notEqual(src.status,"BOUNDED_HISTORICAL_PLACE");
    assert.equal(witness.url,src.source.url);
    for(const id of src.observation_ids)assert.ok(locIds.has(id));
  }
}
assert.equal(covered.size,12);
const context=new Set(cards.existing_context_enrichments.flatMap(x=>x.observation_ids));
assert.equal(context.size,2);
for(const id of context)assert.ok(!covered.has(id));
assert.ok(covered.size+context.size===14);
const heldFromCards=new Set(cards.held.flatMap(x=>x.observation_ids));
assert.equal(heldFromCards.size,11);
for(const w of held)for(const id of w.observation_ids)assert.ok(heldFromCards.has(id));
for(const id of heldFromCards)assert.ok(!covered.has(id)&&!context.has(id));
const sameAuthor=new Set(wave05.witnesses.filter(w=>w.status==="NONINDEPENDENT_SAME_AUTHOR").flatMap(w=>w.observation_ids));
assert.deepEqual([...sameAuthor].sort(),["WEI58-14-022","WEI58-14-023"]);
for(const id of sameAuthor)assert.ok(!covered.has(id),"Weiser derivative evidence was published as independent");
assert.equal(inv.records.filter(x=>x.triage==="EXCLUDE").length,34);

console.log("PASS Weiser P1 Wave05: 25 new screened; 14 independently bounded; 12 observational facts in 10 EN/FR drafts; 2 context-only; 11 held including same-author circular citation; 82/144 reviewed; 62 remaining; 0 published.");
