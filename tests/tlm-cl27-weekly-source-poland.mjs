import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {attachPublishedPolandSourcePatterns} from "../src/find/tlm-weekly-source-poland.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const data=read("data/directory/cl27-weekly-mass-poland-20261110.v1.json");
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const existing=read("data/directory/cl27-weekly-mass-source-20261109.v1.json");
const supplement=read("data/directory/cl27-weekly-mass-supplement-20261110.v1.json");
const by=new Map(master.records.map(r=>[r[0],r]));
const prior=new Set([...existing.sites,...supplement.sites].map(s=>s.cl2_anchor));
assert.equal(data.sites.length,2);
assert.equal(data.sites.reduce((sum,s)=>sum+s.entries.length,0),11);
assert.deepEqual(data.sites.map(s=>s.cl2_anchor),["RG-A080BDE87FC4","RG-F38DEA178149"]);
const fixtures=data.sites.map(s=>{
 const r=by.get(s.cl2_anchor);
 assert.ok(r,"No new CL2 site may be minted");
 assert.ok(!prior.has(s.cl2_anchor),"Polish lines must not duplicate earlier 24 French sites");
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
  source_links:r[6].map(url=>({url,title:"Original operator source"})),
  community_id:"SSPX",status:"OFFICIAL · TIMES UNCONFIRMED",
  raw:{venue:{publication_state:"OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED"}},
  map_state:"ADDRESS_ONLY",map_publishable:false,geo:null});
});
const unrelated=Object.freeze({physical_group_id:"RG-UNRELATED"});
const items=attachPublishedPolandSourcePatterns([...fixtures,unrelated],data);
assert.equal(items.length,3);
assert.equal(items[2],unrelated);
assert.equal(items.filter(x=>x.weekly_source_programme).length,2);
assert.ok(fixtures.every(x=>!x.weekly_source_programme));
for(const item of items.slice(0,2)){
 const s=item.weekly_source_programme;
 assert.equal(s.checked_on,"2026-11-10");
 assert.ok(!Object.hasOwn(s,"rrule")&&!Object.hasOwn(s,"recurrence"));
 for(const language of ["en","fr"]){
  const html=renderTlmChurchProfile(item,language);
  assert.ok(html.includes('data-cl27-weekly-source="'+s.cl2_anchor+'"'));
  assert.ok(html.includes(s.source_page_url));
  assert.ok(html.includes("2026-11-10"));
  assert.ok(html.includes(language==="fr"?"vérifier les changements":"verify changes"));
  assert.ok(!html.includes("una cum: Yes")&&!html.includes("FREQ=WEEKLY"));
  const esc=v=>v.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  for(const e of s.entries){
   assert.ok(html.includes(e.time));
   assert.ok(html.includes(esc(language==="fr"?e.label_fr:e.label_en)));
   if(e.exception_en)assert.ok(html.includes(esc(language==="fr"?e.exception_fr:e.exception_en)));
  }
 }
}
const bajerze=items.find(x=>x.physical_group_id==="RG-A080BDE87FC4").weekly_source_programme;
assert.equal(bajerze.entries.length,6);
assert.deepEqual(bajerze.entries.filter(x=>x.scope==="SUNDAYS").map(x=>x.time),["07:00","09:00"]);
assert.ok(bajerze.entries.find(x=>x.scope==="FIRST_SATURDAY").exception_en.includes("ordinary"));
const bukowiec=items.find(x=>x.physical_group_id==="RG-F38DEA178149").weekly_source_programme;
assert.equal(bukowiec.entries.length,5);
assert.ok(bukowiec.entries.some(x=>x.scope==="THURSDAY_BEFORE_FIRST_FRIDAY"&&x.time==="18:00"));
assert.ok(bukowiec.entries.some(x=>x.scope==="FIRST_SATURDAY"&&x.time==="09:00"));
const reject=x=>assert.throws(()=>attachPublishedPolandSourcePatterns(fixtures,x));
for(const [path,value] of [
 [["sites",0,"entries",0,"rrule"],"FREQ=WEEKLY"],
 [["sites",0,"una_cum"],"YES"],
 [["sites",1,"source_ids"],["FAKE"]],
 [["sites",1,"entries",0,"time"],"31:30"],
 [["sites",1,"entries",4,"exception_en"],""],
 [["sites",1,"source_page_url"],"https://example.org/unsupported"],
]){
 const c=structuredClone(data);let obj=c;
 for(const k of path.slice(0,-1))obj=obj[k];
 obj[path.at(-1)]=value;
 reject(c);
}
const wrong=[...fixtures];wrong[0]={...wrong[0],source_location_description:"Wrong physical building"};
assert.throws(()=>attachPublishedPolandSourcePatterns(wrong,data));
const duplicate=[...fixtures,fixtures[0]];
assert.throws(()=>attachPublishedPolandSourcePatterns(duplicate,data));
assert.ok(!renderTlmChurchProfile(unrelated,"en").includes("data-cl27-weekly-source"));
console.log("PASS Poland source pattern: two corroborated original CL2 sites, 11 source entries, EN/FR, first-week scopes, four excluded source conflicts");
