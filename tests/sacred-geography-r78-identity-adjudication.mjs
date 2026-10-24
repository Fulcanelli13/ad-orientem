import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const m=load("data/geography/research/sacred-geography-r78-identity-adjudication.v1.json");
const r=load("data/geography/research/sacred-geography-coverage-first-r70.v1.json");
const q=load("data/geography/research/sacred-geography-r70-worldwide-coverage-queue.v1.json");
const g=load("data/geography/seed-registry.v1.json");
const by=new Map(g.places.map(x=>[x.place_id,x]));
assert.equal(m.reviewed,70);
assert.equal(m.confirmed_existing.length+m.rejected_false_links.length+m.held_records.length,m.reviewed);
assert.equal(m.confirmed_existing.length,m.decisions.confirmed_same_physical_place);
assert.equal(m.rejected_false_links.length,m.decisions.rejected_false_link);
assert.equal(m.held_records.length,m.decisions.held_scope_or_geometry);
const audited=[...m.confirmed_existing,...m.rejected_false_links,...m.held_records].map(x=>x.candidate_id);
assert.equal(new Set(audited).size,70);
for(const x of m.confirmed_existing){const row=r.candidates.find(y=>y.candidate_id===x.candidate_id);const qrow=q.rows.find(y=>y.candidate_id===x.candidate_id);assert.equal(row.confirmed_place_id,x.place_id);assert.equal(row.possible_existing_place_id,null);assert.equal(qrow.canonical_place_id,x.place_id);assert.equal(qrow.status,"EXPLICIT_PROMOTED");assert.equal(by.get(x.place_id)?.address.country_code,x.country);assert.match(x.identity_source_url,/^https:\/\//);}
const r79=load("data/geography/research/sacred-geography-r79-major-church-sites.v1.json");
for(const x of m.rejected_false_links){const row=r.candidates.find(y=>y.candidate_id===x.candidate_id);const qrow=q.rows.find(y=>y.candidate_id===x.candidate_id);const later=r79.new_sites.find(y=>y.candidate_id===x.candidate_id);assert.equal(row.possible_existing_place_id,null);if(later){assert.equal(row.confirmed_place_id,later.place_id);assert.equal(qrow.canonical_place_id,later.place_id);assert.equal(qrow.status,"EXPLICIT_PROMOTED");assert.notEqual(later.place_id,x.rejected_place_id,"Wrong historic alias must never be reused");}else{assert.equal(row.confirmed_place_id,null);assert.equal(qrow.status,"UNMATCHED");assert.equal(qrow.canonical_place_id,null);}assert.ok(by.has(x.rejected_place_id));assert.ok(x.reason.length>35);}
for(const x of m.held_records){const row=r.candidates.find(y=>y.candidate_id===x.candidate_id);assert.equal(row.reconciliation_status,"POTENTIAL_EXISTING_ID_REVIEW");assert.ok(x.review_reason.length>35);}
assert.deepEqual([r.summary.candidate_status.CONFIRMED_EXISTING_PROMOTION,r.summary.candidate_status.POTENTIAL_EXISTING_ID_REVIEW,r.summary.candidate_status.PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW],[166,6,578]);
assert.equal(g.places.length,356,"R78 IDs must remain canonical after R79 physical-site publications");
console.log("PASS R78: 70 high-priority ID reviews with original source links, explicit false-match rejection and no new pins");
