import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {collectiveMartyrCards} from "../src/calendar/living-sanctoral.js";
const corpus=JSON.parse(readFileSync(new URL("../data/calendar/post1960-canonizations.official-batch1.v1.json",import.meta.url),"utf8"));
const {groups,events,persons}=corpus;
const all=collectiveMartyrCards(groups,events);
assert.equal(all.length,13,"One card for each cohort, regardless of member count");
assert.equal(new Set(all.map(c=>c.id)).size,13);
assert.equal(corpus.scopePolicy.completeMemberNameResearch,"OUT_OF_SCOPE");
assert.equal(corpus.coverage.openMartyrMembershipBacklog,0);
assert.equal(corpus.coverage.collectiveEntriesReadyForEditorialReview,13);
const personIds=new Set(persons.map(p=>p.id));
for(const group of groups){
  const p=group.presentation;
  assert.equal(group.individualMemberExpansionRequirement,"NONE_FOR_APP");
  assert.equal(p.entryType,"COLLECTIVE_MARTYR_PROFILE");
  assert.equal(p.editorialStatus,"SHORT_CARD_REVIEW_REQUIRED");
  assert.ok(p.title.en && p.title.fr && p.context.en && p.context.fr && p.whyHonoured.en && p.whyHonoured.fr);
  assert.ok(p.context.en.length<250 && p.whyHonoured.en.length<200,"Concise cards only");
  assert.equal(p.artwork.canonicalArtworkId,null,"No invented sacred art identity");
  assert.equal(p.geography.canonicalPlaceId,null,"No invented map place identity");
  assert.ok(p.featuredCanonicalPersonIds.every(id=>personIds.has(id)));
  assert.ok(p.featuredCanonicalPersonIds.length<=2,"Only historical spotlight saints");
  for(const source of p.dates){
    assert.equal(source.calendar,"CURRENT_USCCB_WITNESS");
    assert.equal(source.universalRomanStatus,"NOT_SEPARATELY_CERTIFIED");
    assert.equal(source.appliesTo1962Mass,false);
    assert.ok(source.sourceUrl.startsWith("https://"));
  }
}
for(const card of all){
  assert.equal(card.massSelectionAuthority,"NONE");
  assert.equal(card.changes1962Principal,false);
  assert.equal(card.individualMemberEnumerationRequired,false);
  assert.equal(card.artworkId,null);
  assert.equal(card.placeId,null);
  assert.ok(card.whyHonoured);
  assert.ok(card.furtherReadingUrl.startsWith("https://"));
  assert.equal("selectedFormularyId" in card,false);
  assert.equal("memberIds" in card,false);
}
const find=(date)=>collectiveMartyrCards(groups,events,{date}).map(c=>c.id);
assert.deepEqual(find("2026-06-03"),["canon-group.uganda-martyrs-22"]);
assert.deepEqual(find("2026-07-09"),["canon-group.martyrs-china-1648-1930"]);
assert.deepEqual(find("2026-09-20"),["canon-group.korean-martyrs-103"]);
assert.deepEqual(find("2026-09-28"),["canon-group.japan-martyrs-16-1987"]);
assert.deepEqual(find("2026-11-24"),["canon-group.vietnamese-martyrs-117"]);
assert.equal(find("2026-08-14").length,0,"Do not infer Otranto liturgical date from its historical anniversary");
assert.equal(find("2025-09-20").length,0,"The date witness has not been historically traced for 2025");
assert.equal(find("1980-09-20").length,0,"Prevent anachronistic canonization");
const group=collectiveMartyrCards(groups,events,{language:"fr"}).find(c=>c.id==="canon-group.martyrs-otranto-1480");
assert.ok(group.title.includes("Otrante"));
assert.ok(group.context.includes("800"));
assert.deepEqual(group.featuredPersonIds,[],"Do not invent prominent individual martyrs");
assert.equal(collectiveMartyrCards([...groups,groups[0]],events).length,13,"No duplicate cohort card");
assert.throws(()=>collectiveMartyrCards(groups,events,{date:"not-date"}),TypeError);
console.log("Collective martyr cards: PASS (13 concise bilingual groups, 5 contemporary date witnesses, zero mandatory name expansions)");
