import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {attachPublishedPolandWave2SourcePatterns} from "../src/find/tlm-weekly-source-poland-wave2.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const wave2=read("data/directory/cl27-weekly-mass-poland-wave2-20261110.v1.json");
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const earlier=[
 read("data/directory/cl27-weekly-mass-source-20261109.v1.json"),
 read("data/directory/cl27-weekly-mass-supplement-20261110.v1.json"),
 read("data/directory/cl27-weekly-mass-poland-20261110.v1.json")
];
const old=new Set(earlier.flatMap(p=>p.sites.map(s=>s.cl2_anchor)));
const idx=new Map(master.records.map(r=>[r[0],r]));
assert.equal(wave2.sites.length,5);
assert.equal(wave2.sites.reduce((n,s)=>n+s.entries.length,0),20);
assert.equal(old.size,26);
assert.equal(new Set(wave2.sites.map(s=>s.cl2_anchor)).size,5);
const fixtures=wave2.sites.map(s=>{
 const r=idx.get(s.cl2_anchor);
 assert.ok(r,"No new research anchor");
 assert.ok(!old.has(s.cl2_anchor),"No duplicate Mass pattern for already published CL2 site");
 assert.deepEqual(r[1],s.source_ids);
 assert.equal(r[2],s.canonical_name);
 assert.equal(r[3],"PL");
 assert.equal(r[4],s.physical_description);
 assert.ok(r[6].includes(s.existing_source_url));
 assert.ok(s.source_page_url.startsWith("https://www.piusx.org.pl/kaplice/"));
 return Object.freeze({kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",
  physical_group_id:s.cl2_anchor,source_id:r[1][0],source_ids:r[1],
  item_id:"tlm:cl2:"+s.cl2_anchor,country_code:"PL",title:r[2],
  source_location_description:r[4],subtitle:r[4],
  source_links:r[6].map(url=>({url,title:"Original source"})),
  community_id:"SSPX",status:"OFFICIAL · TIMES UNCONFIRMED",
  raw:{venue:{publication_state:"OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED"}},
  map_state:"ADDRESS_ONLY",map_publishable:false,geo:null});
});
const unrelated=Object.freeze({physical_group_id:"RG-UNRELATED"});
const joined=attachPublishedPolandWave2SourcePatterns([...fixtures,unrelated],wave2);
assert.equal(joined.length,6);
assert.equal(joined[5],unrelated);
assert.equal(joined.filter(x=>x.weekly_source_programme).length,5);
assert.ok(fixtures.every(x=>!x.weekly_source_programme));
const esc=v=>v.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
for(const item of joined.slice(0,5)){
 const s=item.weekly_source_programme;
 assert.equal(s.checked_on,"2026-11-10");
 assert.ok(!Object.hasOwn(s,"rrule")&&!Object.hasOwn(s,"recurrence"));
 for(const lang of ["en","fr"]){
  const html=renderTlmChurchProfile(item,lang);
  assert.ok(html.includes('data-cl27-weekly-source="'+s.cl2_anchor+'"'));
  assert.ok(html.includes(s.source_page_url));
  assert.ok(html.includes("2026-11-10"));
  assert.ok(html.includes(lang==="en"?"verify changes":"vérifier les changements"));
  assert.ok(!html.includes("FREQ=WEEKLY"));
  for(const line of s.entries){
   assert.ok(html.includes(esc(lang==="en"?line.label_en:line.label_fr)));
   assert.ok(html.includes(line.time));
   if(line.exception_en)assert.ok(html.includes(esc(lang==="en"?line.exception_en:line.exception_fr)));
  }
 }
}
const find=id=>joined.find(x=>x.physical_group_id===id).weekly_source_programme;
const gn=find("RG-718C93E329B6");
assert.deepEqual(gn.entries.map(x=>x.time),["13:30","07:00","09:00","18:00"]);
assert.equal(gn.entries.filter(x=>x.scope==="THURSDAY_SPECIAL").length,1,
 "Overlapping first-Thursday and pre-first-Friday-Thursday scopes are one source time, not two occurrences");
const ka=find("RG-08B30B0916B1");
assert.equal(ka.entries.find(x=>x.scope==="OTHER_SATURDAYS").time,"18:00");
assert.equal(ka.entries.find(x=>x.time==="08:30").mass_type,"UNKNOWN",
 "Polish suma is not automatically an assertion of Sung Mass");
const kr=find("RG-5C04CA9B3BD4");
assert.ok(!kr.entries.some(x=>x.scope==="FIRST_FRIDAY"),
 "Late first-Friday Communion/adoration must not become a fabricated Mass");
const lu=find("RG-7F6111F5DA58");
assert.equal(lu.entries.find(x=>x.scope==="FIRST_SATURDAY").mass_type,"SUNG");
const lodz=find("RG-00E777838530");
assert.equal(lodz.source_notice_url,"https://www.piusx.org.pl/komunikaty/2026/244");
assert.equal(lodz.entries.find(x=>x.scope==="FIRST_SATURDAY").time,"10:00");
assert.equal(lodz.entries.filter(x=>x.mass_type==="LOW").length,2);
const forbiddenIds=["RG-3BD77BE4BBF9","RG-3D9BC0A99E10","RG-858EA6AA6D6A","RG-513593EF876C","RG-9EB82C28CE65","RG-080F9C3AE250","RG-5C085A238111"];
assert.ok(wave2.sites.every(s=>!forbiddenIds.includes(s.cl2_anchor)));
const reject=x=>assert.throws(()=>attachPublishedPolandWave2SourcePatterns(fixtures,x));
for(const [path,value] of [
 [["sites",0,"entries",0,"rrule"],"FREQ=WEEKLY"],
 [["sites",0,"una_cum"],"YES"],
 [["sites",1,"source_ids"],["FAKE"]],
 [["sites",2,"entries",0,"time"],"29:00"],
 [["sites",3,"entries",2,"exception_fr"],""],
 [["sites",4,"source_notice_url"],"https://example.com/fake"],
 [["sites",0,"entries",3,"scope"],"THURSDAY"],
 [["sites",4,"entries",3,"time"],"09:00"],
]){
 const c=structuredClone(wave2);
 let obj=c;
 for(const key of path.slice(0,-1))obj=obj[key];
 obj[path.at(-1)]=value;
 reject(c);
}
const wrong=[...fixtures];wrong[0]={...wrong[0],source_location_description:"Different site"};
assert.throws(()=>attachPublishedPolandWave2SourcePatterns(wrong,wave2));
assert.throws(()=>attachPublishedPolandWave2SourcePatterns([...fixtures,fixtures[0]],wave2));
const conflict=[...fixtures];conflict[0]={...conflict[0],weekly_source_programme:{}};
assert.throws(()=>attachPublishedPolandWave2SourcePatterns(conflict,wave2));
assert.ok(!renderTlmChurchProfile(unrelated,"en").includes("data-cl27-weekly-source"));
console.log("PASS Poland Wave2: five exact CL2 sites, 20 sourced patterns, bilingual conditional schedules and seven source conflicts held");
