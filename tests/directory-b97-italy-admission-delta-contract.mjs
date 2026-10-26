import fs from "node:fs";
import assert from "node:assert/strict";

const m=JSON.parse(fs.readFileSync(
  new URL("../data/directory/research/b97-italy-three-append-only-physical-research-sites-and-ambrosian-relocation.v1.json",import.meta.url),
  "utf8"
));
assert.equal(m.schema,"AO_TLM_B97_ITALY_3_ADMITTED_PROVISIONAL_RESEARCH_SITES_AND_AMBROSIAN_MOVE_V1");
assert.equal(m.delta.admission_count,3);
assert.equal(m.accepted.length,3);
assert.equal(m.appended_exact_b91_table_schema_rows.length,3);
assert.equal(m.baseline.provisional_distinct_sites,2576);
assert.equal(m.delta.expected_provisional_distinct_sites_after_researched_overlay,2579);
assert.equal(m.baseline.existing_timetable_rows,4681);
assert.equal(m.baseline.previously_verified_timetable_rows,3347);
assert.equal(m.delta.new_timings,0);
assert.equal(m.delta.new_public_map_pins,0);

const gids=new Set(),sids=new Set();
for (const entry of m.appended_exact_b91_table_schema_rows) {
  assert(!gids.has(entry.group_id));gids.add(entry.group_id);
  assert(!sids.has(entry.source_id));sids.add(entry.source_id);
  const c=entry["CANONICAL SITES"],p=entry["PHYSICAL SITES"],v=entry["UNIFIED VENUES"];
  assert.equal(c.length,10);assert.equal(p.length,15);assert.equal(v.length,37);
  assert.equal(c[0],p[0]);assert.equal(c[0],v[34]);assert.equal(c[0],entry.group_id);
  assert.equal(p[1],v[0]);assert.equal(v[0],v[36]);assert.equal(v[0],entry.source_id);
  assert.equal(c[1],"IT");assert.equal(p[3],"IT");assert.equal(v[5],"IT");
  assert.equal(c[7],"RESEARCH_ONLY_NOT_PUBLIC");
  assert.match(p[13],/^HOLD_NOT_PUBLIC/);assert.match(v[32],/^HOLD_NOT_PUBLIC/);
  assert.equal(p[12],"");assert.equal(v[19],"");
  assert.equal(v[16],"");assert.equal(v[17],"");assert.equal(v[18],"");
  assert.equal(v[22],"0");assert.equal(v[23],"0");
  assert.equal(v[3],"");
  assert(c[9].startsWith("https://"));assert(v[25].startsWith("https://"));
}
assert.deepEqual([...sids].sort(),[
  "AO-B96-IT-031","AO-B96-IT-088","AO-B96-IT-113"
]);
assert.equal(m.hold.source_id,"B95-IT-102");
assert.equal(m.hold.decision,"NOT_ADMITTED_UNTIL_CURRENT_ROMAN_1962_ORGANIZER_PROOF");
assert(!gids.has(m.hold.group_id_proposal));
assert.equal(m.ambrosian_transfer.liturgical_book,"MISSAL_AMBROSIAN_1954");
assert.equal(m.ambrosian_transfer.effective_date,"2026-10-25");
assert.match(m.ambrosian_transfer.governance,/NOT_IN_ROMAN_1962/);
assert(!m.accepted.some(s=>s.locality.startsWith("Legnano")));
assert(m.accepted.some(s=>s.church==="Chiesa di San Donato"&&s.source_note.includes("2025")));
console.log("B97 append-only research delta PASS: 3 distinct records, 1 hold, separate Ambrosian transfer, 0 new public site/schedule rows");
