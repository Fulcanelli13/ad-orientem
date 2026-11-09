import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {attachPublishedWeeklySourceProgrammes} from "../src/find/tlm-source-weekly-mass-programme.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const data=read("data/directory/cl27-weekly-mass-source-20261109.v1.json");
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const by=new Map(master.records.map(row=>[row[0],row]));
assert.equal(data.sites.length,4);
const fixtures=data.sites.map(c=>{
 const r=by.get(c.cl2_anchor);
 assert.ok(r,"Cannot mint a new CL2 church");
 assert.deepEqual(r[1],[c.source_id]);
 assert.equal(r[2],c.canonical_name);
 assert.equal(r[3],c.country);
 assert.equal(r[4],c.physical_description);
 assert.equal(r[6][0],c.existing_source_url);
 assert.ok(r[6].includes(c.source_page_url));
 return Object.freeze({
  kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",
  item_id:"tlm:cl2:"+c.cl2_anchor,source_id:c.source_id,source_ids:[c.source_id],
  physical_group_id:c.cl2_anchor,country_code:c.country,title:c.canonical_name,
  subtitle:c.physical_description,source_location_description:c.physical_description,
  source_links:r[6].map(url=>({url,title:"Original source"})),community_id:"SSPX",
  status:"RESEARCH-LISTED · MASS UNVERIFIED",
  raw:{venue:{publication_state:"OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED"}},
  map_state:"ADDRESS_ONLY",map_publishable:false,geo:null
 });
});
const unmodified=Object.freeze({source_id:"OTHER",physical_group_id:"RG-NO-MATCH"});
const result=attachPublishedWeeklySourceProgrammes([...fixtures,unmodified],data);
assert.equal(result.length,5);
assert.equal(result.filter(x=>x.weekly_source_programme).length,4);
assert.equal(result[4],unmodified);
assert.ok(fixtures.every(x=>!x.weekly_source_programme));
assert.deepEqual(data.sites.map(x=>x.entries.length),[1,5,3,3]);
const toulon=result.find(x=>x.physical_group_id==="RG-0A4EC539F260");
assert.ok(toulon.weekly_source_programme.entries.some(e=>e.mass_type==="SUNG"&&e.time==="09:30"));
assert.ok(toulon.weekly_source_programme.entries.some(e=>e.mass_type==="LOW"&&
 e.exception_en.includes("July")&&e.exception_fr.includes("juillet")));
const lille=result.find(x=>x.physical_group_id==="RG-96C9520D0C32");
assert.ok(lille.weekly_source_programme.entries.some(e=>e.time==="18:30"&&
 e.exception_en.includes("July")));
for(const item of result.slice(0,4)){
 for(const lang of ["en","fr"]){
  const html=renderTlmChurchProfile(item,lang);
  assert.ok(html.includes('data-cl27-weekly-source="'+item.physical_group_id+'"'));
  assert.ok(html.includes(item.weekly_source_programme.source_page_url));
  assert.ok(html.includes("2026-11-09"));
  assert.ok(html.includes(lang==="fr"?"vérifier les changements":"verify changes"));
  assert.ok(!html.includes("2026-11-15")&&!html.includes("una cum: Yes"));
  for(const entry of item.weekly_source_programme.entries){
   assert.ok(html.includes(entry.time));
   assert.ok(html.includes(lang==="fr"?entry.label_fr:entry.label_en));
   if(entry.exception_en){
    const escaped=(lang==="fr"?entry.exception_fr:entry.exception_en).replace(/[&<>"']/g,ch=>({
     "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[ch]);
    assert.ok(html.includes(escaped),"Rendered source exception must be HTML-escaped");
   }
  }
 }
}
const reject=manifest=>assert.throws(()=>attachPublishedWeeklySourceProgrammes(fixtures,manifest));
const bad=structuredClone(data);bad.sites[0].entries[0].rrule="FREQ=WEEKLY";reject(bad);
const bad2=structuredClone(data);bad2.sites[0].una_cum="YES";reject(bad2);
const bad3=structuredClone(data);bad3.sites[0].source_id="SSPXMAP:OPE-999999";reject(bad3);
const bad4=structuredClone(data);bad4.sites[2].entries[1].exception_en="";reject(bad4);
const bad5=structuredClone(data);bad5.sites[1].entries[3].scope="MONDAY_TO_FRIDAY";reject(bad5);
const wrongSite=[...fixtures];wrongSite[0]={...wrongSite[0],physical_group_id:"RG-OTHER"};
assert.throws(()=>attachPublishedWeeklySourceProgrammes(wrongSite,data));
assert.ok(!renderTlmChurchProfile(unmodified,"en").includes("data-cl27-weekly-source"));
console.log("PASS CL27 weekly first-party pattern: 4/4 exact sites; EN/FR exceptions; 0 derived Mass occurrences, Una Cum or canonical claims");
