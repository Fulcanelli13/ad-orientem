import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const legacy=read("data/directory/preliminary-map-r49.v1.json");
const triage=read("data/directory/research/cl2-23-legacy-source-links-20261111.v1.json");
assert.equal(triage.schema,"AO_TLM_CL2_23_SOURCE_LINK_TRIAGE_V1");
assert.equal(triage.status,"RESEARCH_ONLY_NOT_APPROVED_NOT_PUBLIC");
assert.equal(master.records.length,2580);
const source=Array.from(master.records,values=>Object.fromEntries(master.columns.map((key,i)=>[key,values[i]])));
const r49=new Map(legacy.records.map(record=>[record[0],record]));
const gap=source.filter(site=>site.source_urls.length===0);
assert.equal(gap.length,196);
const eligible=gap.map(site=>{
 const urls=site.source_ids.flatMap(id=>{
  const r=r49.get(id);
  return r?[r[8],...String(r[9]??"").split(/\\s*;\\s*/)].filter(Boolean):[];
 });
 return {site,urls};
}).filter(({urls})=>!urls.some(url=>/^https:\/\//i.test(url)&&
 !/^https:\/\/(?:www\\.)?adorientem\\.church\/find/i.test(url)));
assert.equal(eligible.length,23);
const expected=new Map(eligible.map(({site,urls})=>[site.effective_anchor_id,{site,urls}]));
const seen=new Set();
assert.deepEqual(triage.counts,{
 source_less_cl2_index:196,target_weak_link_records:23,
 historical_http_only:17,self_reference_only:6,candidate_first_party:16,held:7
});
for(const c of triage.records){
 assert.ok(!seen.has(c.cl2_anchor),"Repeated physical anchor");
 seen.add(c.cl2_anchor);
 const entry=expected.get(c.cl2_anchor);
 assert.ok(entry,"Not one of the 23 original weak-link site anchors: "+c.cl2_anchor);
 assert.deepEqual(c.source_ids,entry.site.source_ids);
 assert.deepEqual(c.legacy_source_urls,entry.urls);
 assert.equal(c.name,entry.site.name);
 assert.equal(c.country,entry.site.country);
 assert.equal(c.physical_description,entry.site.physical_description);
 assert.equal(c.public_release_approved,false);
 assert.equal(c.reviewed_on,"2026-11-11");
 const http=c.legacy_source_urls.some(url=>url.startsWith("http://"));
 assert.equal(c.gap_type,http?"LEGACY_HTTP_ONLY":"SELF_REFERENTIAL_DIRECTORY_ONLY");
 const approved=Boolean(c.candidate_https_url);
 assert.equal(c.disposition,approved?"FIRST_PARTY_REPLACEMENT_CANDIDATE_FOR_EXCEL_REVIEW":"HOLD_REQUIRE_EXACT_SOURCE");
 if(approved){
  const url=new URL(c.candidate_https_url);
  assert.equal(url.protocol,"https:");
  assert.ok(!url.hostname.endsWith("adorientem.church"));
  assert.match(c.evidence_scope,/^(?:EXACT_|APOSTOLATE_)/);
  assert.match(c.next_gate,/Excel/);
 }else{
  assert.equal(c.evidence_scope,"NO_DIRECT_CURRENT_FIRST_PARTY_MATCH_RECORDED");
 }
 for(const forbidden of ["mass_times","schedule","una_cum","celebrant","gps","lat","lng","owned_by","missal"])
  assert.equal(Object.hasOwn(c,forbidden),false,forbidden+" must not be published");
}
assert.deepEqual(seen,new Set(expected.keys()));
console.log("TLM CL2 23 weak-link research triage: 16 staged candidates, 7 protected holds, 0 public promotions");
