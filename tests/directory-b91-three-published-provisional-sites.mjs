import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {
  PRELIMINARY_R49_URL,PRELIMINARY_R49_TOTAL,
  PUBLISHED_PROVISIONAL_MASS_SITES_EXPECTED,
  projectPreliminaryR49,projectPublishedProvisionalMassSites,
  filterPreliminaryR49,loadPreliminaryR49,
} from "../src/find/preliminary-directory-r49.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {CL2_PHYSICAL_SITE_INDEX_URL} from "../src/find/cl2-physical-directory.js";
import {CL27_PUBLIC_CELEBRATION_URL} from "../src/find/tlm-celebration-evidence.js";
import {CL27_SITE_CONTACT_URL} from "../src/find/tlm-site-contact-evidence.js";
import {CL27_WEEKLY_SOURCE_PROGRAMME_URL} from "../src/find/tlm-source-weekly-mass-programme.js";
import {CL27_WEEKLY_SUPPLEMENT_URL} from "../src/find/tlm-weekly-source-supplement.js";
import {CL27_POLAND_SOURCE_URL} from "../src/find/tlm-weekly-source-poland.js";
import {CL27_DATED_MASS_PROGRAMME_URL,CL27_TARARE_DATED_MASS_PROGRAMME_URL} from "../src/find/tlm-dated-mass-programme.js";
const base=JSON.parse(readFileSync(fileURLToPath(PRELIMINARY_R49_URL),"utf8"));
const release=JSON.parse(readFileSync("data/directory/published-provisional-mass-sites-20261026.v1.json","utf8"));
const worldwide=JSON.parse(readFileSync("data/directory/generated/cl2-physical-site-index.v1.json","utf8"));
const publishedWitnesses=JSON.parse(readFileSync(fileURLToPath(CL27_PUBLIC_CELEBRATION_URL),"utf8"));
const publishedContacts=JSON.parse(readFileSync(fileURLToPath(CL27_SITE_CONTACT_URL),"utf8"));
const publishedWeekly=JSON.parse(readFileSync(fileURLToPath(CL27_WEEKLY_SOURCE_PROGRAMME_URL),"utf8"));
const publishedWeeklySupplement=JSON.parse(readFileSync(fileURLToPath(CL27_WEEKLY_SUPPLEMENT_URL),"utf8"));
const publishedPoland=JSON.parse(readFileSync(fileURLToPath(CL27_POLAND_SOURCE_URL),"utf8"));
const datedProgramme=JSON.parse(readFileSync(fileURLToPath(CL27_DATED_MASS_PROGRAMME_URL),"utf8"));
const tarareProgramme=JSON.parse(readFileSync(fileURLToPath(CL27_TARARE_DATED_MASS_PROGRAMME_URL),"utf8"));
const old=projectPreliminaryR49(base);
assert.equal(old.length,1879);
assert.equal(release.record_count,PUBLISHED_PROVISIONAL_MASS_SITES_EXPECTED);
const combined=projectPublishedProvisionalMassSites(old,release);
assert.equal(combined.length,1882);
assert.deepEqual(combined.slice(0,old.length),old,"Frozen R49 records/order mutated");
assert.equal(new Set(combined.map(r=>r.source_id)).size,combined.length);
assert.equal(filterPreliminaryR49(combined,{directoryGroup:"ROME"}).length,1025);
assert.equal(filterPreliminaryR49(combined,{directoryGroup:"SSPX"}).length,732);
assert.equal(filterPreliminaryR49(combined,{directoryGroup:"UNKNOWN"}).length,125);
assert.equal(filterPreliminaryR49(combined,{directoryGroup:"ALL"}).length,1882);
assert.equal(exploreMapFeatures(combined).length,1882);
const added=combined.slice(PRELIMINARY_R49_TOTAL);
assert.deepEqual(added.map(x=>x.source_id),[
  "RG-B85-4DA44A2F403B","RG-B89-4FFBC6AB3EC5","RG-B89-F7BFDAA8E4BB",
]);
for(const item of added){
 assert.equal(item.map_publishable,true);
 assert.equal(item.map_state,"PROVISIONAL");
 assert.equal(item.geo.approximate,true);
 assert.equal(item.preliminary_group,"ROME");
 assert.equal(item.actions.length,0);
 assert.equal(item.sections.length,0);
 assert.ok(item.source_links.length>=3);
 assert.ok(item.source_links.every(s=>s.url.startsWith("https://")));
 assert.match(item.summary,/not independently certified/i);
 assert.match(item.note,/not imported into the recurring Mass calendar/i);
 assert.ok(item.geo.lat&&item.geo.lng);
}
for(const needle of ["Bormes","Albenga","Rivarolo"]){
 assert.equal(filterPreliminaryR49(combined,{directoryGroup:"ALL",query:needle})
   .filter(x=>x.item_id.startsWith("tlm:published-provisional:")).length,1);
}
const invalid=structuredClone(release);
invalid.records[0].geo.lat=999;
assert.throws(()=>projectPublishedProvisionalMassSites(old,invalid),/Invalid\/unreleased/);
const badId=structuredClone(release);
badId.records[1].research_group_id=badId.records[0].research_group_id;
assert.throws(()=>projectPublishedProvisionalMassSites(old,badId),/Invalid\/unreleased/);
let calls=[];
const api=async url=>{
 calls.push(String(url));
 return {ok:true,status:200,json:async()=>String(url)===CL2_PHYSICAL_SITE_INDEX_URL?worldwide:
   String(url)===CL27_PUBLIC_CELEBRATION_URL?publishedWitnesses:
   String(url)===CL27_SITE_CONTACT_URL?publishedContacts:
   String(url)===CL27_WEEKLY_SOURCE_PROGRAMME_URL?publishedWeekly:
   String(url)===CL27_WEEKLY_SUPPLEMENT_URL?publishedWeeklySupplement:
   String(url)===CL27_POLAND_SOURCE_URL?publishedPoland:
   String(url)===CL27_DATED_MASS_PROGRAMME_URL?datedProgramme:
   String(url)===CL27_TARARE_DATED_MASS_PROGRAMME_URL?tarareProgramme:
   String(url).includes("published-provisional")?release:base};
};
const live=await loadPreliminaryR49({fetchImpl:api});
assert.equal(live.length,2583,"Complete CL2 worldwide index must load without dropping the three B91 published additions");
assert.equal(live.filter(x=>x.map_publishable).length,2569);
assert.equal(live.filter(x=>x.map_state==="ADDRESS_ONLY").length,14);
assert.ok(added.every(x=>live.some(v=>v.item_id===x.item_id)));
assert.equal(live.filter(x=>x.celebration_evidence).length,2,
 "The source-owned CL27 witness overlay must not alter the B91 physical-site census");
assert.equal(live.filter(x=>x.site_contact_evidence).length,publishedContacts.records.length,
 "Contact overlay count must match its validated source manifest after concurrent CL27 releases");
assert.ok(live.filter(x=>x.site_contact_evidence).every(x=>!x.site_contact_evidence.mass_times&&!x.site_contact_evidence.una_cum));
const weekly=live.filter(x=>x.weekly_source_programme);
assert.equal(weekly.length,30,"Ten initial, fourteen supplemental and six Polish source-weekly venues; no generated events");
assert.deepEqual(weekly.map(x=>x.physical_group_id).sort(),
 [...publishedWeekly.sites,...publishedWeeklySupplement.sites,...publishedPoland.sites].map(x=>x.cl2_anchor).sort());
assert.ok(weekly.every(x=>!x.weekly_source_programme.rrule&&!x.weekly_source_programme.una_cum));
const dated=live.filter(x=>x.dated_mass_programme);
assert.equal(dated.length,2,"Two separate exact CL2 chapels have source-listed dated programmes");
const paita=dated.find(x=>x.physical_group_id==="RG-51BC2B17C91F");
assert.ok(paita);
assert.deepEqual(paita.dated_mass_programme.events.map(e=>e.local_date),["2026-11-22","2026-12-20"]);
assert.equal(paita.dated_mass_programme.events.length,2);
assert.equal(paita.dated_mass_programme.timezone,"Pacific/Noumea");
const tarare=dated.find(x=>x.physical_group_id==="RG-874DCE028C98");
assert.ok(tarare);
assert.equal(tarare.dated_mass_programme.events.length,9);
assert.equal(tarare.dated_mass_programme.timezone,"Europe/Paris");
assert.ok(tarare.dated_mass_programme.events.every(e=>e.local_time==="10:30"&&e.mass_type==="UNKNOWN"));
assert.equal(live.length,2583,"Printed dates must not mint extra recurring Mass entities");
assert.deepEqual(calls,[PRELIMINARY_R49_URL,
  new URL("../data/directory/published-provisional-mass-sites-20261026.v1.json",import.meta.url).href,
  CL2_PHYSICAL_SITE_INDEX_URL,
  CL27_PUBLIC_CELEBRATION_URL,
  CL27_SITE_CONTACT_URL,
  CL27_DATED_MASS_PROGRAMME_URL,
  CL27_TARARE_DATED_MASS_PROGRAMME_URL,
  CL27_WEEKLY_SOURCE_PROGRAMME_URL,
  CL27_WEEKLY_SUPPLEMENT_URL,
  CL27_POLAND_SOURCE_URL]);
console.log("PASS B91 worldwide directory 2583 unchanged; 2569 mapped, 14 list-only; 30 source-weekly sites (92 times), 2 dated programmes (11 printed dates); zero generated recurring events");
