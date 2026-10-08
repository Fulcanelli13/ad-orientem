import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const corpus=read("data/directory/research/staging/sspx-france-lpl/sspx-france-source-staging.v1.json");
const first=read("data/directory/generated/v19/sspx-france-first-party.v1.json");
const second=read("data/directory/generated/v19/sspx-france-second-pass.v1.json");
const matrix=read("data/directory/research/staging/sspx-france-lpl/sspx-france-review-matrix.v1.json");
const firstSlugs=new Set(first.records.map(x=>x.source_profile_slug));
const secondSlugs=new Set(second.records.map(x=>x.source_profile_slug));
const sourceSlugs=new Set(corpus.records.map(x=>x.slug));
const states=new Map();
assert.equal(corpus.records.length,254);
assert.equal(sourceSlugs.size,254);
assert.equal(first.records.length,89);
assert.equal(second.records.length,29);
assert.equal(matrix.remaining_source_entries_before_review,165);
assert.equal(matrix.new_public_mass_venues,29);
assert.equal(matrix.entries.length,165);
for(const p of matrix.entries){
  assert.ok(sourceSlugs.has(p.slug),"review matrix invents a source row");
  assert.ok(!firstSlugs.has(p.slug),"published first-pass row leaked into remaining ledger");
  assert.ok(!states.has(p.slug),"duplicate review ownership");
  states.set(p.slug,p.state);
  if(p.state==="DUPLICATE_SOURCE_ROW"){
    assert.ok(firstSlugs.has(p.canonical_slug)||secondSlugs.has(p.canonical_slug),
      "duplicate adjudication must identify a known published physical venue");
  }
}
for(const p of second.records){
  assert.ok(sourceSlugs.has(p.source_profile_slug),"new Mass row has no source identity");
  assert.ok(!firstSlugs.has(p.source_profile_slug),"published twice");
  assert.ok(["CURRENT_PUBLIC_MASS","CONDITIONAL_MASS"].includes(p.ps));
  assert.equal(p.cc,"FR");
  assert.ok(p.su.startsWith("https://laportelatine.org/lieux/"));
  assert.ok(p.sr.trim().length>15);
  assert.equal(states.get(p.source_profile_slug),p.ps);
  assert.ok(/\b\d{5}\b/.test(p.a));
}
assert.equal(new Set(second.records.map(p=>p.u)).size,29);
assert.equal(firstSlugs.size+states.size,sourceSlugs.size);
const tally={};
for(const p of matrix.entries)tally[p.state]=(tally[p.state]||0)+1;
assert.deepEqual(tally,matrix.states);
assert.equal(tally.CURRENT_PUBLIC_MASS,25);
assert.equal(tally.CONDITIONAL_MASS,4);
assert.equal(tally.DUPLICATE_SOURCE_ROW,8);
assert.equal(tally.INSTITUTION_ONLY,53);
assert.equal(tally.PENDING_CURRENT_EVIDENCE,71);
assert.equal(tally.PROVIDER_HOUSE_ONLY,4);
assert.equal(second.records.some(p=>p.source_profile_slug==="fort-de-france/guyane"),false);
assert.equal(second.records.some(p=>p.n.startsWith("École")),false);
console.log("SSPX France 165-case adjudication ledger: PASS (29 promoted; 136 held)");
