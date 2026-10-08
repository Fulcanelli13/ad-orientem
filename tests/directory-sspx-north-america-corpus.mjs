import assert from "node:assert/strict";
import fs from "node:fs";
const load=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const snapshot=load("data/directory/generated/v19/sspx-north-america-20261008.v1.json");
const review=load("data/directory/research/sspx-north-america-source-review-20261008.v1.json");
const rows=snapshot.records;
assert.equal(snapshot.provider,"SSPX_NA_DISTRICTS_20261008");
assert.equal(rows.length,120);
assert.equal(rows.filter(x=>x.cc==="US").length,97);
assert.equal(rows.filter(x=>x.cc==="CA").length,23);
assert.equal(rows.filter(x=>x.ps==="CONDITIONAL_MASS").length,18);
assert.equal(review.source_entries,167);
assert.equal(review.candidate_rows_before_existing_dedupe,135);
assert.equal(review.existing_venue_collisions,15);
assert.equal(review.new_physical_venue_records,120);
assert.equal(review.held_source_entries,47);
assert.equal(review.duplicate_matches.length,11);
assert.equal(review.exclusions_by_reason.MATCHES_EXISTING_PROVIDER_VENUE,15);
const ids=new Set(),places=new Set();
for(const row of rows){
  assert.ok(/^SSPX-NA-(US|CA)-/.test(row.u));
  assert.equal(row.review_flag,"EXPLICIT_OFFICIAL_SUNDAY_MASS_DIRECTORY_TAG");
  assert.ok(row.sr.includes("Sunday Mass"));
  assert.ok(["CURRENT_PUBLIC_MASS","CONDITIONAL_MASS"].includes(row.ps));
  assert.ok(row.a.length>16);
  assert.ok(["https://sspx.org/en/list-sspx-chapels",
    "https://fsspx.ca/en/list-sspx-chapels-4"].includes(row.su));
  assert.ok(!ids.has(row.u),"Duplicate newly published North American SSPX ID");
  ids.add(row.u);
  const key=row.cc+"|"+row.a.toLowerCase().replace(/[^a-z0-9]/g,"");
  assert.ok(!places.has(key),"Two source records refer to exactly the same physical address");
  places.add(key);
}
const rejected=new Set(review.duplicate_matches.map(x=>x.new_source_id));
assert.ok(rows.every(x=>!rejected.has(x.u)),
  "Previously catalogued SSPX church duplicated in bulk census");
const canada=new Set(rows.filter(x=>x.cc==="CA").map(x=>x.l));
assert.ok(canada.has("Warminster")&&canada.has("Saskatoon")&&canada.has("Regina"));
assert.ok(rows.some(x=>x.cc==="US"&&x.l==="Post Falls"));
assert.ok(!rows.some(x=>x.cc==="US"&&x.l==="Fort Collins"),
  "Original Fort Collins SSPX seed must retain its canonical identity");
assert.ok(!rows.some(x=>x.cc==="CA"&&x.l==="Markham"),
  "Original Markham SSPX seed must not be duplicated");
assert.ok(!rows.some(x=>x.n.includes("Convent")||x.n.includes("Academy")),
  "Institutional listings without independent chapel review must not be auto-published");
console.log("SSPX US+Canada 167-place source review: PASS — 120 new, 47 held/deduped");