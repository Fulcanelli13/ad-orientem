import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {attachPublishedWeeklySupplement} from "../src/find/tlm-weekly-source-supplement.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const manifest=read("data/directory/cl27-weekly-mass-supplement-20261110.v1.json");
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const existing=read("data/directory/cl27-weekly-mass-source-20261109.v1.json");
const registry=new Map(master.records.map(r=>[r[0],r]));
assert.equal(manifest.sites.length,14);
assert.equal(manifest.sites.reduce((n,s)=>n+s.entries.length,0),43);
const oldIds=new Set(existing.sites.map(x=>x.cl2_anchor));
const fixtures=manifest.sites.map(s=>{
 const row=registry.get(s.cl2_anchor);
 assert.ok(row,"Supplement may not create a new CL2 site");
 assert.deepEqual(row[1],[s.source_id]);
 assert.equal(row[2],s.canonical_name);
 assert.equal(row[3],"FR");
 assert.equal(row[4],s.physical_description);
 assert.equal(row[6][0],s.existing_source_url);
 assert.ok(row[6].includes(s.source_page_url));
 assert.ok(!oldIds.has(s.cl2_anchor),"Supplement cannot overwrite the ten first-party patterns");
 return Object.freeze({
  kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",
  source_id:s.source_id,source_ids:[s.source_id],physical_group_id:s.cl2_anchor,
  item_id:"tlm:cl2:"+s.cl2_anchor,country_code:s.country,
  title:s.canonical_name,subtitle:s.physical_description,
  source_location_description:s.physical_description,
  source_links:row[6].map(url=>({url,title:"Official source"})),
  community_id:"SSPX",status:"OFFICIAL · TIMES UNCONFIRMED",
  raw:{venue:{publication_state:"OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED"}},
  map_state:"ADDRESS_ONLY",map_publishable:false,geo:null
 });
});
const other=Object.freeze({physical_group_id:"RG-NOT-IN-SUPPLEMENT",source_id:"OTHER"});
const enriched=attachPublishedWeeklySupplement([...fixtures,other],manifest);
assert.equal(enriched.length,15);
assert.equal(enriched[14],other);
assert.equal(enriched.filter(x=>x.weekly_source_programme).length,14);
assert.ok(fixtures.every(x=>!x.weekly_source_programme));
for(const item of enriched.slice(0,14)){
 const s=item.weekly_source_programme;
 assert.ok(s.source_page_url.startsWith("https://laportelatine.org/lieux/"));
 assert.equal(s.checked_on,"2026-11-10");
 assert.ok(!Object.hasOwn(s,"rrule")&&!Object.hasOwn(s,"recurrence")&&!Object.hasOwn(s,"missal_edition"));
 for(const language of ["en","fr"]){
  const html=renderTlmChurchProfile(item,language);
  assert.ok(html.includes('data-cl27-weekly-source="'+s.cl2_anchor+'"'));
  assert.ok(html.includes(s.source_page_url));
  assert.ok(html.includes("2026-11-10"));
  assert.ok(html.includes(language==="fr"?"vérifier les changements":"verify changes"));
  for(const e of s.entries){
   assert.ok(html.includes(e.time));
   assert.ok(html.includes(language==="fr"?e.label_fr:e.label_en));
   if(e.exception_en){
    const escaped=(language==="fr"?e.exception_fr:e.exception_en).replace(/[&<>"']/g,ch=>({
     "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[ch]);
    assert.ok(html.includes(escaped),"Bilingual exception must render with HTML escaping");
   }
  }
 }
}
const rouen=enriched.find(x=>x.physical_group_id==="RG-1A2D13837643");
assert.equal(rouen.weekly_source_programme.entries.length,14);
assert.ok(rouen.weekly_source_programme.entries.some(x=>x.scope==="SATURDAY"&&x.time==="07:15"&&x.exception_en.includes("first Saturdays")));
const vannes=enriched.find(x=>x.physical_group_id==="RG-1E9599A96067");
assert.ok(vannes.weekly_source_programme.entries.some(x=>x.scope==="THURSDAY_SCHOOL_YEAR"&&x.time==="11:15"&&x.exception_fr.includes("Remplace")));
const avignon=enriched.find(x=>x.physical_group_id==="RG-5EAC1BF12A8D");
assert.ok(avignon.weekly_source_programme.entries.some(x=>x.scope==="FIRST_FRIDAY"&&x.time==="18:30"));
assert.ok(avignon.weekly_source_programme.entries.some(x=>x.time==="11:30"&&x.exception_en.includes("15 August")));
const stEtienne=enriched.find(x=>x.physical_group_id==="RG-39EDF6C1F5EA");
assert.ok(stEtienne.weekly_source_programme.entries.some(x=>x.scope==="FIRST_SATURDAY"&&x.time==="18:30"));
const dijon=enriched.find(x=>x.physical_group_id==="RG-14211B3603D5");
assert.equal(dijon.weekly_source_programme.entries.length,2,"Uncertain and/or weekdays must NOT become invented daily Masses");
const noTime=enriched.find(x=>x.physical_group_id==="RG-34F1D4F47941");
assert.equal(noTime.weekly_source_programme.entries.length,1,"Saintes unspecified weekdays must not generate daily Mass");
const reject=c=>assert.throws(()=>attachPublishedWeeklySupplement(fixtures,c));
for(const [path,value] of [
 [["sites",0,"entries",0,"rrule"],"FREQ=WEEKLY"],
 [["sites",0,"una_cum"],"YES"],
 [["sites",1,"source_id"],"SSPXMAP:OPE-999999"],
 [["sites",1,"entries",0,"time"],"31:30"],
 [["sites",0,"entries",2,"exception_en"],""],
 [["sites",5,"entries",3,"exception_fr"],""],
 [["sites",9,"entries",1,"exception_en"],""],
]){
 const copy=structuredClone(manifest);let node=copy;
 for(const key of path.slice(0,-1))node=node[key];
 node[path.at(-1)]=value;
 reject(copy);
}
const wrong=[...fixtures];wrong[0]={...wrong[0],source_location_description:"fake"};
assert.throws(()=>attachPublishedWeeklySupplement(wrong,manifest));
const overlapping=[...fixtures];overlapping[0]={...overlapping[0],weekly_source_programme:{}};
assert.throws(()=>attachPublishedWeeklySupplement(overlapping,manifest));
assert.ok(!renderTlmChurchProfile(other,"en").includes("data-cl27-weekly-source"));
console.log("PASS CL27 supplemental weekly source: 14 exact CL2 sites, 43 source entries, 2 languages, held ambiguities, no fabricated recurrence");
