import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {attachPolishFirstPartyWeeklyPatterns} from "../src/find/tlm-polish-weekly-patterns.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const manifest=read("data/directory/cl27-weekly-mass-poland-six-20261110.v1.json");
const cl2=read("data/directory/generated/cl2-physical-site-index.v1.json");
const by=new Map(cl2.records.map(row=>[row[0],row]));
assert.equal(manifest.sites.length,6);
assert.equal(manifest.sites.reduce((n,x)=>n+x.entries.length,0),20);
assert.equal(new Set(manifest.sites.map(x=>x.cl2_anchor)).size,6);
const fixtures=manifest.sites.map(p=>{
 const r=by.get(p.cl2_anchor);
 assert.ok(r,"Unknown CL2 physical site "+p.cl2_anchor);
 assert.deepEqual(p.source_ids,r[1]);
 assert.equal(p.source_id,r[1][0]);
 assert.equal(p.canonical_name,r[2]);
 assert.equal(p.country,r[3]);
 assert.equal(p.physical_description,r[4]);
 assert.ok(r[6].includes(p.existing_source_url));
 assert.equal(p.checked_on,"2026-11-10");
 return Object.freeze({
  kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",
  item_id:"tlm:cl2:"+p.cl2_anchor,source_id:p.source_id,source_ids:r[1],
  physical_group_id:p.cl2_anchor,country_code:p.country,title:p.canonical_name,
  subtitle:p.physical_description,source_location_description:p.physical_description,
  source_links:r[6].map(url=>({url,title:"Original source"})),
  community_id:"SSPX",status:"RESEARCH-LISTED · MASS UNVERIFIED",
  raw:{venue:{publication_state:"OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED"}},
  map_state:"ADDRESS_ONLY",map_publishable:false,geo:null
 });
});
// Some published R49 venues retain the second frozen source ID and a source-owned
// display variant. The *physical CL2* group and full immutable alias set are the join.
const aliasCase=[...fixtures];
const aliasIdx=aliasCase.findIndex(x=>x.physical_group_id==="RG-513593EF876C");
assert.ok(aliasIdx>=0);
aliasCase[aliasIdx]={...aliasCase[aliasIdx],
 source_id:manifest.sites.find(x=>x.cl2_anchor==="RG-513593EF876C").source_ids[1],
 title:"Source-owned Bydgoszcz chapel label"};
assert.equal(attachPolishFirstPartyWeeklyPatterns(aliasCase,manifest)
 .filter(x=>x.weekly_source_programme).length,6);
const other=Object.freeze({source_id:"OTHER",physical_group_id:"RG-OTHER"});
const joined=attachPolishFirstPartyWeeklyPatterns([...fixtures,other],manifest);
assert.equal(joined.length,7);
assert.equal(joined.filter(x=>x.weekly_source_programme).length,6);
assert.equal(joined[6],other);
assert.ok(fixtures.every(x=>!x.weekly_source_programme),"Do not mutate source fixtures");
const first=(anchor)=>joined.find(x=>x.physical_group_id===anchor).weekly_source_programme;
const bajerze=first("RG-A080BDE87FC4");
assert.deepEqual(bajerze.entries.filter(x=>x.scope==="SUNDAY").map(x=>x.time),["07:00","09:00"]);
assert.ok(bajerze.entries.some(x=>x.scope==="SATURDAY"&&x.exception_en.includes("09:00")));
const bydgoszcz=first("RG-513593EF876C");
assert.ok(bydgoszcz.entries.some(x=>x.time==="08:30"&&x.mass_type==="SUNG"));
const krosno=first("RG-5C04CA9B3BD4");
assert.deepEqual(krosno.entries.map(x=>x.time),["13:30","08:00"]);
const szczecin=first("RG-A0DBF5D61B7D");
assert.ok(szczecin.entries.some(x=>x.scope==="SUNDAY"&&x.time==="08:00"&&x.mass_type==="LOW"));
assert.ok(szczecin.entries.some(x=>x.scope==="SUNDAY"&&x.time==="10:00"&&x.mass_type==="SUNG"));
assert.ok(!manifest.sites.some(x=>x.cl2_anchor==="RG-31CFE79EFCD5"),
 "Olsztyn's 11 Nov location move must stay out of this release");
assert.ok(!manifest.sites.some(x=>x.cl2_anchor==="RG-00E777838530"),
 "Łódź source-alias and November first-Saturday change remain separately gated");
for(const item of joined.slice(0,6)){
 for(const lang of ["en","fr"]){
  const html=renderTlmChurchProfile(item,lang);
  assert.ok(html.includes('data-cl27-weekly-source="'+item.physical_group_id+'"'));
  assert.ok(html.includes(item.weekly_source_programme.source_page_url));
  assert.ok(html.includes("2026-11-10"));
  for(const line of item.weekly_source_programme.entries){
   assert.ok(html.includes(line.time));
   assert.ok(html.includes(lang==="en"?line.label_en:line.label_fr));
  }
  assert.ok(!html.includes("una cum: Yes"));
 }
}
const mustReject=data=>assert.throws(()=>attachPolishFirstPartyWeeklyPatterns(fixtures,data));
let broken=structuredClone(manifest);
broken.sites[0].source_page_url="https://example.com/fake";mustReject(broken);
broken=structuredClone(manifest);broken.sites[0].entries[0].time="06:00";mustReject(broken);
broken=structuredClone(manifest);broken.sites[0].entries[0].rrule="FREQ=WEEKLY";mustReject(broken);
broken=structuredClone(manifest);broken.sites[0].una_cum="YES";mustReject(broken);
broken=structuredClone(manifest);broken.sites[0].source_ids.push("DUPLICATE");mustReject(broken);
const wrong=[...fixtures];wrong[0]={...wrong[0],source_location_description:"Wrong parish"};
assert.throws(()=>attachPolishFirstPartyWeeklyPatterns(wrong,manifest));
const wrongSource=[...fixtures];wrongSource[0]={...wrongSource[0],source_id:"UNLISTED_PROVIDER"};
assert.throws(()=>attachPolishFirstPartyWeeklyPatterns(wrongSource,manifest));
console.log("PASS Polish CL27: 6/6 exact CL2 churches, 20 published source patterns, EN/FR, no synthesized future events");
