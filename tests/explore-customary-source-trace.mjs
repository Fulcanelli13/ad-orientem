import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const S=read("data/customary/catholic-life-salvage.v1.json");
const R=read("data/customary/catholic-life-source-trace.review.v1.json");
assert.equal(R.schema,"AO_CATHOLIC_LIFE_21_SOURCE_TRACE_REVIEW_V1");
assert.equal(R.status,"EDITORIAL_SOURCE_TRACE_NOT_PRODUCTION_CITATION");
const sourceFree=Object.entries(S.domains).flatMap(([domain,items])=>
 items.filter(x=>!x.source_ids.length).map(x=>({id:x.claim_id,domain}))).sort((a,b)=>a.id.localeCompare(b.id));
assert.equal(sourceFree.length,21,"historical annex count changed; do not mask new missing sources");
assert.equal(new Set(R.reviews.map(x=>x.claim_id)).size,R.reviews.length);
assert.deepEqual(R.reviews.map(x=>({id:x.claim_id,domain:x.existing_owner})).sort((a,b)=>a.id.localeCompare(b.id)),sourceFree);
const sources=new Map(R.sources.map(x=>[x.source_id,x.url]));
for(const row of R.reviews){
 assert.equal(row.original_source_id_count,0);
 assert.equal(row.publication_gate,"REQUIRES_OWNER_EDITORIAL_VALIDATION_BEFORE_CLAIM_CITATION");
 assert.equal(row.map_pin_eligible,false);
 assert.ok(row.review_verdict&&row.review_verdict.length>10);
 for(const p of row.proposed_source_traces){
  assert.equal(p.source_url,sources.get(p.source_id),"citation URL mismatched the verified editorial source ledger");
  assert.match(p.source_url,/^https:\/\//);
  assert.ok(p.source_locator.length>=20);
 }
}
assert.equal(R.stats.claims,21);
assert.equal(R.stats.with_traces,20);
assert.equal(R.stats.without_traces,1);
assert.equal(R.stats.direct_or_historical,9);
assert.equal(R.reviews.filter(x=>!x.proposed_source_traces.length)[0].claim_id,"CL02-S06-Q003");
assert.ok(R.reviews.find(x=>x.claim_id==="CL08-S05-Q002").proposed_source_traces.some(x=>x.source_url.includes("istruzione-reliquie")));
assert.ok(R.authority_boundaries.some(x=>x.includes("secondary Catholic Answers")));
console.log("PASS 21 inherited Customary source gaps triaged: 20 contextual trace candidates, 1 pastoral hold, zero new pins");
