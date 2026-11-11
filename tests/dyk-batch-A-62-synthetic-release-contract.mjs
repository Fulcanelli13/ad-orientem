// Synthetic-only future release acceptance for the FIXED 62-card owner proof.
// No owner decision is inferred or written back into any research or Home data.
// This tests structural/runtime compatibility, not source-truth certification.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dyk526ApprovedCandidates,dyk526Model,dyk526Pick} from "../src/home/dyk-526-release-adapter.js";

const path="data/research/did-you-know/release-candidates/ao-dyk-batch-A-62-corrected-bilingual-owner-proof-RESEARCH_ONLY-20261111.v1.json";
const proof=JSON.parse(readFileSync(path,"utf8"));
const clone=x=>structuredClone(x);
assert.equal(proof.release_stage,"RESEARCH_ONLY");
assert.equal(proof.records.length,62);
assert.equal(proof.inventory.owner_approved,0);
assert.deepEqual(dyk526ApprovedCandidates(proof,{enabled:true}),[]);

const sourceOf=row=>{
 const r=row.research_provenance;
 const ids=String(r.source_ids_raw||"").split(/\s*\|\s*/).filter(Boolean);
 const urls=String(r.source_urls_raw||"").split(/\s*\|\s*/).filter(Boolean);
 const url=r.preferred_source_url||urls[0];
 assert.ok(ids.length>0&&urls.length>0,row.id+" source lineage missing");
 assert.match(url,/^https:\/\/[^\s<>"']+$/,row.id+" source link malformed");
 return {url,source_id:ids[0],source_record_id:ids[0],deep_link_verified:true};
};
// The only true approval flags appear in this detached in-memory fixture.
const records=proof.records.map(r=>{
 const x=clone(r);
 x.editorial.owner_decision="APPROVED";
 x.editorial.copy_adjustment_pending=false;
 x.eligibility="APPROVED_FOR_LIVE";
 for(const key of Object.keys(x.release_gate))x.release_gate[key]=true;
 x.published_source=sourceOf(x);
 return x;
});
const fake={
 schema:"AO_DYK_526_APPROVED_RELEASE_V1",
 release_stage:"APPROVED_PARTIAL_LIVE",
 published:true,
 global_release_authorized:true,
 owner_release_decision:"APPROVED",
 records
};
assert.deepEqual(dyk526ApprovedCandidates(fake),[],"Feature must stay off by default");
const accepted=dyk526ApprovedCandidates(fake,{enabled:true});
assert.equal(accepted.length,62,
 "All 62 must be structurally compatible when approval is SYNTHETIC and in-memory");
for(const row of accepted){
 for(const lang of ["en","fr"]){
  const model=dyk526Model(fake,row.id,"2026-11-11",lang,{enabled:true});
  assert.ok(model,row.id+" missing "+lang+" Home model");
  assert.equal(model.title,row.proposed_title[lang]);
  assert.equal(model.fact,row.proposed_copy[lang]);
  assert.equal(model.sourceUrl,row.published_source.url);
  assert.equal(model.links[0].url,row.published_source.url);
 }
}
const picks=new Set();
for(let offset=0;offset<365;offset++){
 const date=new Date(Date.UTC(2026,0,1+offset)).toISOString().slice(0,10);
 const pick=dyk526Pick(fake,date,{enabled:true});
 assert.ok(pick?.id,"No pick for "+date);
 assert.ok(accepted.some(r=>r.id===pick.id));
 assert.equal(dyk526Pick(fake,date,{enabled:true})?.id,pick.id);
 picks.add(pick.id);
}
assert.equal(picks.size,62,"All candidate facts must be reachable in a year of daily rotation");
assert.equal(dyk526Pick(fake,"2026-02-30",{enabled:true}),null);
const contaminated=clone(fake);
contaminated.records[61].release_gate.source_reference_checked=false;
assert.deepEqual(dyk526ApprovedCandidates(contaminated,{enabled:true}),[],
 "One unapproved row must reject the ENTIRE proposed release");
assert.deepEqual(dyk526ApprovedCandidates(proof,{enabled:true}),[],
 "Research proof remains never public even after synthetic fixture");
console.log("PASS DYK synthetic 62: each EN/FR Home model and a year of rotation, one bad row fails entire release, source proof unchanged/unapproved.");
