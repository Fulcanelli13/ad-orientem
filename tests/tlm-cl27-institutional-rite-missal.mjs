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
assert.equal(groups.size,1331);
assert.equal(source.records.length,1414);
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
assert.equal(assigned.length,1331);
assert.ok(assigned.every(x=>x.institutional_liturgy.scope==="SOURCE_MINISTRY"));
const sids=assigned.flatMap(x=>x.institutional_liturgy.ministries.flatMap(m=>m.source_ids));
assert.equal(sids.length,1414);
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
assert.equal(counts.liturgical_use.ROMAN,1331);
assert.equal(counts.missal_edition["1962"],1331);
assert.equal(counts.missal_edition.UNKNOWN,1250);
assert.equal(after.filter(x=>matchesPublicCL27Facets(x,{liturgical_use:"ROMAN",missal_edition:"1962"})).length,1331);
for(const key of ["una_cum","canonical_status","ecclesial_position","rubrical_basis",
 "organizer_role","venue_owner_type","celebrant_relationship","mass_type"]){
 assert.equal(counts[key].UNKNOWN,2581,key+" must not be inferred from institutional norm");
}
// Five historical "Campos" labels were in fact diocesan São José dos Campos or
// other diocesan venues. Never inherit AASJMV liturgical books from geography.
const camposExact=[
 ["RG-B88-B1EB74BB63BD","AASJMV-EXT-001"],
 ["RG-A28165FAF54C","AASJMV-EXT-002"],
 ["RG-9723082006BB","AASJMV-EXT-003"],
 ["RG-BC468A8AF86A","AASJMV-EXT-004"],
 ["RG-456C824082EF","AASJMV-EXT-005"],
 ["RG-730D6582F2F6","AASJMV-EXT-006"]
];
assert.equal(assigned.filter(x=>institutionalRiteMissal(x)?.some(m=>m.institute_id==="AASJMV")).length,6);
for(const [anchor,sourceId] of camposExact){
 const i=by.get(anchor);
 assert.ok(i,"Lost exact AASJMV source-ministry site "+anchor);
 const m=institutionalRiteMissal(i)?.find(m=>m.institute_id==="AASJMV");
 assert.ok(m&&m.source_ids.includes(sourceId)&&m.subject_scope==="SOURCE_MINISTRY_NOT_WHOLE_VENUE");
 assert.ok(renderDirectoryVenueCard(i,"en").includes("AASJMV tradition"));
 assert.ok(!renderDirectoryVenueCard(i,"en").includes("oratoriosaojosebh.org/legislacao"));
}
for(const id of ["RG-B65-596F949E3A13","RG-B65-66C068E4A1B4",
 "RG-B88-F691777F8D8D","RG-B88-E491FACD85B9","RG-B88-D6480F7F32B7"]){
 const i=after.find(x=>x.physical_group_id===id);
 assert.ok(i,"Missing original diocesan site "+id);
 assert.ok(!institutionalRiteMissal(i)?.some(m=>m.institute_id==="AASJMV"),"Diocesan geography falsely became Campos");
 assert.equal(publicCL27Value(i,"missal_edition"),"UNKNOWN");
}
// At Nossa Senhora do Líbano, the source expressly describes Maronite,
// Ordinary Form and AASJMV celebrations at the same physical church.
const maroniteHost=by.get("RG-A28165FAF54C");
assert.equal(institutionalRiteMissal(maroniteHost)?.[0]?.subject_scope,
 "SOURCE_MINISTRY_NOT_WHOLE_VENUE");
assert.equal(publicCL27Value(maroniteHost,"una_cum"),"UNKNOWN");
// CL2 B36/B37 official institute-directory source links, not venue-wide facts.
// Fifteen exact inherited ministry entries only: no new sites or Mass times.
const b36b37=[
 ["RG-0BFDF89D4DD9","AO-B37-L-AT-70A941F8C8A0","FSSP"],
 ["RG-C880EFE88048","AO-B37-L-AT-A9DA4FFE2DA9","FSSP"],
 ["RG-FEB07D1FAD61","AO-B37-L-CH-712E0F89EED0","FSSP"],
 ["RG-0D6D16EEC8DA","AO-B37-L-CH-9D490E3D76A3","FSSP"],
 ["RG-2ED9EF0BE3AB","AO-B37-L-DE-A2672DD83BA3","FSSP"],
 ["RG-ED75D87C6DF7","AO-B37-L-FR-CD0EBBCF9300","SSPX"],
 ["RG-3E26F1928075","AO-B36-L-GB-7FBD70FF3B8C","ICKSP"],
 ["RG-A241FA73E6F2","AO-B36-L-GB-532533B79CCC","SSPX"],
 ["RG-856AF5566AD2","AO-B36-L-GB-655853236019","SSPX"],
 ["RG-C14F352FA2E8","AO-B37-L-IT-96E63E5A906D","ICKSP"],
 ["RG-FCF30927E2BA","AO-B37-L-IT-3CD93C1D2463","ICKSP"],
 ["RG-B0F32F6743EC","AO-B37-L-IT-2BF8D495BDDE","SSPX"],
 ["RG-4956AD7B8EBA","AO-B37-L-IT-48B76D4B2E08","SSPX"],
 ["RG-0FF5C3333BCC","AO-B37-L-IT-15BF55C23133","FSSP"],
 ["RG-DB32F642B767","AO-B37-L-IT-FB134CD2C7F0","ICKSP"]
];
assert.equal(source.b36_b37_ministry_backfill.count,15);
assert.equal(Object.keys(source.b36_b37_ministry_backfill.source_identity_records).length,15);
assert.equal(new Set(b36b37.map(r=>r[0])).size,15);
const sourceIdentifiers=new Set(source.records.map(r=>r.join("|")));
for(const [anchor,sourceId,inst] of b36b37){
 assert.ok(sourceIdentifiers.has([anchor,sourceId,inst].join("|")),"B36/B37 provider missing from exact census");
 const i=by.get(anchor);
 const m=institutionalRiteMissal(i)?.find(m=>m.institute_id===inst);
 assert.ok(m&&m.source_ids.includes(sourceId),"Missing source-specific institute "+anchor);
 assert.equal(m.subject_scope,"SOURCE_MINISTRY_NOT_WHOLE_VENUE");
 assert.equal(publicCL27Value(i,"una_cum"),"UNKNOWN");
 assert.ok(i.sections.length===0,"No Mass schedule can be synthesized by B36/B37 inheritance");
 const meta=source.b36_b37_ministry_backfill.source_identity_records[anchor];
 assert.equal(meta.source_id,sourceId);
 assert.equal(meta.institute_id,inst);
 assert.ok(meta.source_urls.length>0);
}
const residualHolds=read("data/directory/research/cl27-10-residual-ministry-role-holds-20261110.v1.json");
assert.equal(residualHolds.records.length,10);
for(const {physical_anchor:anchor} of residualHolds.records){
 const i=after.find(x=>x.physical_group_id===anchor);
 assert.ok(i,"Existing historical hold identity missing "+anchor);
 assert.ok(!institutionalRiteMissal(i),"Non-ministry or alias hold wrongly inherited");
}

const recovered=source.resolved_nine_ministry_exception_sources;
assert.equal(recovered.count,9);
assert.equal(Object.keys(recovered.source_identity_records).length,9);
assert.equal(recovered.original_35_recovered_total,25);
assert.equal(recovered.residual_role_holds,10);
const recoveredExpected=[
 ["RG-02F7101BEBA4","AO-B33-L-CZ-839A8EC1C061","FSSP"],
 ["RG-1319CD21788A","AO-B33-L-CZ-EB74F5E5F778","FSSP"],
 ["RG-3D31819B8E6B","AO-B33-L-CZ-FC78D4CAB27E","FSSP"],
 ["RG-54B61A039DD9","AO-B33-L-CZ-D8A852C64412","FSSP"],
 ["RG-B7AB371DDFF3","AO-B33-L-CZ-098389C3827A","FSSP"],
 ["RG-B65-1792675F4E43","AO-RSCH-B65-1792675F4E43","FSSP"],
 ["RG-B65-C4264A1A8340","AO-RSCH-B65-C4264A1A8340","FSSP"],
 ["RG-3EFF2C4A33C0","LMD:mission-saint-irenee-de-lyon-saint-irenaeus-of-lyon-church-montreal-canada","FSSP"],
 ["RG-B77-E2A7387A85DB","SSPX-B77:SSPX-OCT26-BEN-BE-BURG-REULAND-EGLISE-DU-SACRE-C-UR","SSPX"]
];
for(const [anchor,sourceId,inst] of recoveredExpected){
 const item=by.get(anchor);
 const ministry=institutionalRiteMissal(item)?.find(m=>m.institute_id===inst);
 assert.ok(ministry?.source_ids.includes(sourceId),"Missing exact first-party ministry "+anchor);
 assert.equal(ministry.subject_scope,"SOURCE_MINISTRY_NOT_WHOLE_VENUE");
 const meta=recovered.source_identity_records[anchor];
 assert.equal(meta.cl2_source_id,sourceId);
 assert.equal(meta.institute_id,inst);
 assert.ok(meta.ministry_source_url.startsWith("https://"));
 assert.equal(meta.no_schedule_inference,true);
 assert.equal(publicCL27Value(item,"una_cum"),"UNKNOWN");
 assert.equal(item.sections.length,0,"Ministry norm may not fabricate a timetable");
 for(const lang of ["en","fr"]){
  const html=renderDirectoryVenueCard(item,lang);
  assert.ok(html.includes(lang==="fr"?"Missel de 1962":"1962 Missal"));
  assert.ok(!html.includes(meta.ministry_source_url),"Internal evidence must not become public card footer");
 }
}
assert.equal(recovered.source_identity_records["RG-1319CD21788A"].evidence_kind,"FSSP_SOME_MASSES_ONLY");
assert.equal(recovered.source_identity_records["RG-3EFF2C4A33C0"].evidence_kind,"FSSP_NAMED_CLERGY_PRIMARY_ONLY");
assert.equal(source.holds.filter(h=>h.live_anchor==="RG-3EFF2C4A33C0").length,2);
// Direct first-party IBP source attests the actual Florianópolis ministry.
const flor=by.get("RG-B65-F58D1C8B0693");
const florNorm=institutionalRiteMissal(flor)?.find(m=>m.institute_id==="IBP");
assert.ok(florNorm&&florNorm.source_ids.includes("AO-RSCH-B65-F58D1C8B0693"));
assert.equal(florNorm.subject_scope,"SOURCE_MINISTRY_NOT_WHOLE_VENUE");
assert.equal(source.ibp_florianopolis_ministry_recovery.source_url,
 "https://ibpamericalatina.org/casa/florianopolis/");
assert.equal(publicCL27Value(flor,"una_cum"),"UNKNOWN");
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
console.log("PASS CL27 institute classification: 1414 frozen source ministries / 1331 distinct physical churches, Roman/1962 English/French cards, filtered scoped inheritance, three identity holds, 0 Una Cum/canonical/ownership inferences");
