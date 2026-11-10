import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 attachInstitutionalMinistryLiturgy,validateInstitutionalMinistryNormManifest,
 institutionalRiteMissal,CL27_INSTITUTIONAL_LITURGY_URL
} from "../src/find/tlm-institutional-rite-missal.js";
import {publicCL27FacetCounts,publicCL27Value,matchesPublicCL27Facets} from "../src/find/cl27-public-facets.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const source=read("data/directory/cl27-institutional-ministry-liturgy-20261110.v1.json");
assert.equal(new URL(CL27_INSTITUTIONAL_LITURGY_URL).pathname.split("/").at(-1),
 "cl27-institutional-ministry-liturgy-20261110.v1.json");
const groups=validateInstitutionalMinistryNormManifest(source);
assert.equal(groups.size,1300);
assert.equal(source.records.length,1383);
assert.equal(source.holds.length,3);
assert.equal(master.records.length,2580);
const before=master.records.map(([physical_group_id,source_ids,title,country_code,source_location_description,affiliation_as_listed,urls])=>
 Object.freeze({
  kind:"TLM_VENUE",item_id:"tlm:cl2:"+physical_group_id,
  physical_site_source:"CL2_MASTER",physical_group_id,source_ids,source_id:source_ids[0],
  title,subtitle:source_location_description,country_code,
  community_id:["FSSP","ICKSP","IBP","SSPX"].includes(affiliation_as_listed)?affiliation_as_listed:"DIOCESAN",
  eyebrow:affiliation_as_listed,source_location_description,
  source_links:urls.map(url=>({url,title:"Original source"})),
  status:"RESEARCH-LISTED · MASS UNVERIFIED",
  raw:{venue:{publication_state:"OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED"}},map_state:"ADDRESS_ONLY",
  map_publishable:false,geo:null,sections:[]
 }));
const extras=[{kind:"TLM_VENUE",source_id:"OTHER-APPROVED",title:"Other approved site"}];
const after=attachInstitutionalMinistryLiturgy([...before,...extras],source);
assert.equal(after.length,2581);
assert.equal(after.at(-1),extras[0]);
assert.ok(before.every(x=>!x.institutional_liturgy),"Never mutate original CL2 site records");
const assigned=after.filter(item=>item.institutional_liturgy);
assert.equal(assigned.length,1300);
assert.ok(assigned.every(x=>x.institutional_liturgy.scope==="SOURCE_MINISTRY"));
const sids=assigned.flatMap(x=>x.institutional_liturgy.ministries.flatMap(m=>m.source_ids));
assert.equal(sids.length,1383);
assert.equal(new Set(sids).size,sids.length);
const by=new Map(assigned.map(x=>[x.physical_group_id,x]));
for(const [anchor,sourceId,inst] of source.records){
 const item=by.get(anchor);
 assert.ok(item,"No source ministry is lost");
 assert.ok(item.source_ids.includes(sourceId));
 assert.ok(item.institutional_liturgy.ministries.some(m=>m.institute_id===inst&&m.source_ids.includes(sourceId)));
}
for(const hold of source.holds){
 assert.ok(!assigned.some(x=>x.institutional_liturgy.ministries.some(m=>m.source_ids.includes(hold.source_id))),
   "Held alias should never be used as certification");
}
const counts=publicCL27FacetCounts(after);
assert.equal(counts.liturgical_use.ROMAN,1300);
assert.equal(counts.missal_edition["1962"],1300);
assert.equal(counts.missal_edition.UNKNOWN,1281);
assert.equal(after.filter(x=>matchesPublicCL27Facets(x,{liturgical_use:"ROMAN",missal_edition:"1962"})).length,1300);
for(const key of ["una_cum","canonical_status","ecclesial_position","rubrical_basis",
 "organizer_role","venue_owner_type","celebrant_relationship","mass_type"]){
 assert.equal(counts[key].UNKNOWN,2581,key+" must not be inferred from institutional norm");
}
const sample=assigned.find(x=>institutionalRiteMissal(x)?.[0]?.institute_id==="FSSP");
assert.ok(sample);
for(const lang of ["en","fr"]){
 const small=renderDirectoryVenueCard(sample,lang);
 const large=renderTlmChurchProfile(sample,lang);
 assert.ok(small.includes("data-tlm-rite-missal"));
 assert.ok(small.includes(lang==="fr"?"Missel de 1962":"1962 Missal"));
 assert.ok(small.includes(lang==="fr"?"Rite romain":"Roman rite"));
 assert.ok(!small.includes("CL2-INST-")&&!small.includes("decree-of-pope-francis"),
  "Evidence metadata must be internal, not on the compact card");
 assert.ok(!small.includes("Source-backed listing")&&!small.includes("Fiche sourcée"));
 assert.ok(large.includes("aoTlmProfileEssentials"));
 assert.ok(large.includes(lang==="fr"?"Romain":"Roman"));
 assert.ok(large.includes("1962"));
 assert.ok(!large.includes("CL2-INST-"));
}
const unknown=after.find(x=>!x.institutional_liturgy&&x.kind==="TLM_VENUE");
assert.equal(publicCL27Value(unknown,"missal_edition"),"UNKNOWN");
assert.ok(!renderDirectoryVenueCard(unknown,"en").includes("data-tlm-rite-missal"));
assert.equal(publicCL27Value({...sample,community_id:"CMRI",una_cum:"YES"},"una_cum"),"UNKNOWN");
const deny=record=>assert.throws(()=>validateInstitutionalMinistryNormManifest(record));
for(const [path,value] of [
 [["rules",0,"assertions",0,"value"],"AMBROSIAN"],
 [["rules",0,"assertions",1,"evidence_url"],"https://invalid.org"],
 [["records",0,1],"fake-source-id"],
 [["records",0,2],"CMRI"],
 [["records",0,0],"RG-000000000000"],
 [["records",0,3],"FREQ=WEEKLY"],
 [["counts","source_ministry_joins"],1382],
 [["rules",1,"assertions",0,"una_cum"],"YES"],
]){
 const bad=structuredClone(source);let p=bad;
 for(const k of path.slice(0,-1))p=p[k];
 p[path.at(-1)]=value;deny(bad);
}
const wrong=[...before];const first=wrong.findIndex(x=>x.physical_group_id===sample.physical_group_id);
wrong[first]={...wrong[first],source_ids:["fake-ID"]};
assert.throws(()=>attachInstitutionalMinistryLiturgy(wrong,source));
assert.throws(()=>attachInstitutionalMinistryLiturgy([...before,before[first]],source));
console.log("PASS CL27 institute classification: 1383 frozen source ministries / 1300 distinct physical churches, Roman/1962 English/French cards, filtered scoped inheritance, three identity holds, 0 Una Cum/canonical/ownership inferences");
