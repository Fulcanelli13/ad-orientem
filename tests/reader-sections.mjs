import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReaderSectionResolver } from "../src/mass/reader-sections.js";

const map=JSON.parse(readFileSync(
  new URL("../data/presentation/reader-section-map.v0.13.1.json", import.meta.url),
  "utf8"
));
const resolver=createReaderSectionResolver(map);

assert.equal(resolver.authority,"DISPLAY_GROUPING_ONLY");
assert.equal(resolver.total,30);
assert.equal(resolver.sections.length,30);
assert.ok(resolver.sections.every(s=>s.canonicalAuthority===false));

const cases=[
  ["MC-SAN-010","AO.CARD.013","Sanctus · Benedictus"],
  ["MC-CNS-010","AO.CARD.015","Consecration of the Sacred Host"],
  ["MC-CNS-080","AO.CARD.016","Consecration of the Chalice"],
  ["MC-COM-130","AO.CARD.021","Agnus Dei"],
  ["MC-END-160","AO.CARD.030","Last Gospel"],
];
for(const [eventId,sectionId,name] of cases){
  const hit=resolver.sectionForEvent(eventId);
  assert.ok(hit,eventId+" did not resolve");
  assert.equal(hit.canonicalEventId,eventId,"canonical event identity changed");
  assert.equal(hit.section.sectionId,sectionId);
  assert.equal(hit.section.name,name);
  assert.equal(hit.progress.total,30);
}

assert.equal(resolver.sectionForEvent("MC-NOT-A-REAL-EVENT"),null,"unknown event fabricated a card");
assert.equal(resolver.sectionById("AO.CARD.015").entryEventId,"MC-CNS-010");
assert.equal(resolver.sectionById("AO.CARD.016").entryEventId,"MC-CNS-080");

const eventIds=resolver.sections.flatMap(s=>s.eventIds);
assert.equal(new Set(eventIds).size,eventIds.length,"duplicate event ownership across cards");

const corrupt=structuredClone(map);
corrupt.ordinarySungSections[1].eventIds.push(corrupt.ordinarySungSections[0].eventIds[0]);
assert.throws(()=>createReaderSectionResolver(corrupt),/more than one reader section/);

const authoritative=structuredClone(map);
authoritative.ordinarySungSections[0].canonicalAuthority=true;
assert.throws(()=>createReaderSectionResolver(authoritative),/may not claim canonical authority/);

console.log("reader section resolver: PASS — 30 display-only cards, canonical MC identity untouched.");
