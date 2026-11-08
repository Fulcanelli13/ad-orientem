import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {attachPublishedDatedMassProgramme,upcomingPrintedMasses} from "../src/find/tlm-dated-mass-programme.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";

const manifest=JSON.parse(readFileSync(new URL(
 "../data/directory/cl27-dated-mass-programme-paita-20261108.v1.json",import.meta.url),"utf8"));
const index=JSON.parse(readFileSync(new URL(
 "../data/directory/generated/cl2-physical-site-index.v1.json",import.meta.url),"utf8"));
assert.equal(manifest.schema,"AO_CL27_EXACT_DATED_MASS_PROGRAMME_V1");
assert.equal(manifest.sites.length,1);
const source=manifest.sites[0],r=index.records.find(x=>x[0]===source.cl2_anchor);
assert.ok(r,"No new church minted from event");
assert.equal(r[2],source.canonical_name);
assert.equal(r[3],source.country);
assert.equal(r[4],source.physical_description);
assert.deepEqual(r[1],source.canonical_source_ids);
assert.equal(source.timezone,"Pacific/Noumea");
assert.deepEqual(source.events.map(x=>x.local_date),["2026-11-22","2026-12-20"]);
assert.ok(source.events.every(x=>x.local_time==="09:00"&&x.mass_type==="SUNG"));
assert.equal(new Set(source.events.map(x=>x.local_date+"|"+x.local_time)).size,2);
const item=Object.freeze({
 kind:"TLM_VENUE",item_id:"tlm:cl2:"+r[0],source_id:r[1][0],
 source_ids:[...r[1]],physical_group_id:r[0],country_code:r[3],
 source_location_description:r[4],physical_site_source:"CL2_MASTER",
 title:r[2],subtitle:r[4],community_id:"SSPX",source_links:[],
 status:"RESEARCH-LISTED · MASS UNVERIFIED",raw:null,geo:null,
 map_publishable:false,
});
const other=Object.freeze({
 kind:"TLM_VENUE",source_id:"OTHER:00001",source_ids:["OTHER:00001"],
 physical_group_id:"RG-000000000000",title:"Another chapel",
 source_links:[],country_code:"NC"
});
const updated=attachPublishedDatedMassProgramme([other,item],manifest);
assert.equal(updated.length,2);
assert.equal(updated[0],other);
assert.equal(item.dated_mass_programme,undefined);
assert.equal(updated[1].dated_mass_programme.events.length,2);
assert.equal(updated[1].raw,item.raw);
assert.equal(updated[1].source_links,item.source_links);
assert.equal(updated[1].physical_group_id,r[0]);
const c=updated[1].dated_mass_programme;
assert.deepEqual(upcomingPrintedMasses(c,{asOf:"2026-11-08"}).map(x=>x.local_date),
 ["2026-11-22","2026-12-20"]);
assert.deepEqual(upcomingPrintedMasses(c,{asOf:"2026-11-23"}).map(x=>x.local_date),["2026-12-20"]);
assert.deepEqual(upcomingPrintedMasses(c,{asOf:"2026-12-21"}),[]);
assert.deepEqual(upcomingPrintedMasses(c,{asOf:new Date("2026-11-22T12:59:59Z")}).map(x=>x.local_date),["2026-11-22","2026-12-20"]);
assert.deepEqual(upcomingPrintedMasses(c,{asOf:new Date("2026-11-22T13:00:00Z")}).map(x=>x.local_date),["2026-12-20"]);
for(const lang of ["en","fr"]){
 const html=renderTlmChurchProfile(updated[1],lang,{asOf:"2026-11-08"});
 assert.ok(html.includes('data-cl27-dated-programme="'+r[0]+'"'));
 assert.ok(html.includes('data-cl27-dated-mass="2026-11-22"'));
 assert.ok(html.includes('data-cl27-dated-mass="2026-12-20"'));
 assert.ok(html.includes("09:00"));
 assert.ok(html.includes("Pacific/Noumea"));
 assert.ok(html.includes(source.dated_bulletin_url));
 assert.ok(html.includes(source.first_party_site_url));
 assert.ok(html.includes(lang==="en"?"Sung Mass":"Messe chantée"));
 assert.ok(html.includes(lang==="en"?"No verified weekly timetable":"Aucun horaire hebdomadaire vérifié"));
 assert.ok(html.includes(lang==="en"?"No Mass on intervening Sundays":"Aucune messe n’est sous-entendue"));
 assert.ok(!html.includes('data-cl27-dated-mass="2026-11-15"'));
 assert.ok(!html.includes('data-cl27-dated-mass="2026-11-29"'));
 assert.ok(!html.includes("08:00"),"Confession was not converted into another Mass");
 const later=renderTlmChurchProfile(updated[1],lang,{asOf:"2026-11-23"});
 assert.ok(!later.includes('data-cl27-dated-mass="2026-11-22"'));
 assert.ok(later.includes('data-cl27-dated-mass="2026-12-20"'));
 const expired=renderTlmChurchProfile(updated[1],lang,{asOf:"2027-01-01"});
 assert.ok(!expired.includes('data-cl27-dated-mass="2026-12-20"'));
 assert.ok(expired.includes(lang==="en"?"no future Mass is established":"aucune messe future n’est établie"));
}
assert.ok(!renderTlmChurchProfile(other,"en",{asOf:"2026-11-08"}).includes("data-cl27-dated-programme"));
function reject(items,m){assert.throws(()=>attachPublishedDatedMassProgramme(items,m));}
reject([other],manifest);
reject([item,item],manifest);
let wrong=[...r[1]].reverse();
reject([{...item,source_ids:wrong}],manifest);
reject([{...item,source_location_description:"wrong chapel"}],manifest);
for(const [label,mutate] of [
 ["wrong site",m=>{m.sites[0].cl2_anchor="RG-000000000000"}],
 ["duplicate date",m=>{m.sites[0].events[1]={...m.sites[0].events[0]}}],
 ["fabricated Sunday",m=>{m.sites[0].events[1].local_date="2026-11-29"}],
 ["confession as Mass",m=>{m.sites[0].events[1].local_time="08:00"}],
 ["fake weekly recurrence",m=>{m.sites[0].events[0].rrule="FREQ=WEEKLY"}],
 ["asserted una cum",m=>{m.sites[0].events[0].una_cum="YES"}],
 ["unapproved books",m=>{m.sites[0].missal_edition="1962"}],
 ["changed dated bulletin",m=>{m.sites[0].dated_bulletin_url="https://invalid.example/other.pdf"}],
 ["wrong timezone",m=>{m.sites[0].timezone="Europe/Paris"}],
 ["extra dated site",m=>{m.sites.push({...m.sites[0]})}],
 ["missing event",m=>{m.sites[0].events.pop()}],
]){
 const invalid=structuredClone(manifest);mutate(invalid);reject([item],invalid);
}
console.log("PASS CL27 Païta source-printed 2026 dates: two 09:00 Sung Masses, source-identity gate, no invented Sundays, confessions excluded, local-time expiry, EN/FR, 0 global calendar events");
