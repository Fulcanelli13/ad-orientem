// Batch 7: source-locked geographical recovery of 15 Catholic building/campus markers.
// Coordinate evidence cannot establish Mass use, liturgical books, ecclesial position,
// schedules, verified visitor doors or photo publication rights.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts}
 from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory}
 from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const cl2=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const sourceItems=projectPublishedProvisionalMassSites(
 projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),
 read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(sourceItems,cl2);
const code=readFileSync(new URL("../src/find/cl2-physical-directory.js",import.meta.url),"utf8");
const section=code.split("const REVIEWED_NEW_SITE_PINS=Object.freeze({")[1]?.split("\n});")[0]??"";
const keys=[...section.matchAll(/"(RG-[A-Z0-9-]+)"\s*:\s*Object\.freeze\(\{/g)].map(m=>m[1]);
assert.equal(new Set(keys).size,keys.length,"Duplicate physical-site keys");
const sites=[
 [
  "RG-B65-0124AC8C5AAD",
  "AO-RSCH-B65-0124AC8C5AAD",
  48.20436,
  15.62225,
  "osm:way:29301818"
 ],
 [
  "RG-B65-AC2DB0D24D98",
  "AO-RSCH-B65-AC2DB0D24D98",
  47.49966,
  9.74673,
  "osm:way:489891762"
 ],
 [
  "RG-E1EDD3D1B3B9",
  "AO-B37-L-AT-E257A2688E22",
  47.80398,
  13.04745,
  "osm:way:55227935"
 ],
 [
  "RG-F36F38329CF7",
  "AO-B37-L-AT-7FA59AF677AF",
  47.80497,
  13.0461,
  "osm:way:54773256"
 ],
 [
  "RG-B65-25B188213260",
  "AO-RSCH-B65-25B188213260",
  46.84763,
  9.53544,
  "osm:way:401918643"
 ],
 [
  "RG-B65-499F45F82748",
  "AO-RSCH-B65-499F45F82748",
  46.9451469,
  7.4393203,
  "independent:bern-dreifaltigkeitskirche"
 ],
 [
  "RG-B68-E6745E012907",
  "AO-RSCH-B68-E6745E012907",
  47.3522,
  8.34035,
  "geonames:11703874"
 ],
 [
  "RG-B65-7553C1671534",
  "AO-RSCH-B65-7553C1671534",
  47.02972,
  8.6308,
  "osm:way:423207348"
 ],
 [
  "RG-B96-6B639D8118FF",
  "AO-B96-IT-031",
  43.32196,
  11.33159,
  "osm:way:53271879"
 ],
 [
  "RG-B69-564B8CBD664A",
  "AO-RSCH-B69-564B8CBD664A",
  49.98389,
  9.14664,
  "osm:way:97984924"
 ],
 [
  "RG-B96-8D5C0E774FAB",
  "AO-B96-IT-113",
  44.05539,
  8.21299,
  "osm:way:225242224"
 ],
 [
  "RG-C14F352FA2E8",
  "AO-B37-L-IT-96E63E5A906D",
  41.90749,
  12.45447,
  "osm:way:1415875156"
 ],
 [
  "RG-B69-CAE2B812289E",
  "AO-RSCH-B69-CAE2B812289E",
  50.38745,
  8.06252,
  "osm:way:543898771"
 ],
 [
  "RG-B66-078F88133F6C",
  "AO-RSCH-B66-078F88133F6C",
  47.15185,
  -0.93833,
  "geonames:10943617"
 ],
 [
  "RG-D4627761ED6D",
  "AO-B40-LOC-FR-4CF8DB74616A",
  44.92426,
  1.55542,
  "osm:way:493511563"
 ]
];
assert.equal(sites.length,15);
for(const [group,sourceId,lat,lng,sourceRef] of sites){
 const source=cl2.records.find(x=>x[0]===group);
 assert.ok(source&&source[1].includes(sourceId),"Exact frozen source identity required: "+group);
 assert.ok(!sourceItems.some(x=>source[1].includes(x.source_id)),
  "Cannot treat already mapped R49 church as a new site: "+group);
 const venue=all.find(x=>x.physical_group_id===group);
 assert.ok(venue&&venue.source_id===sourceId&&venue.source_ids.includes(sourceId));
 assert.equal(venue.title,source[2],"Do not overwrite church name");
 assert.equal(venue.map_publishable,true);assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,lat);assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,sourceRef);
 assert.equal(venue.geo.precision,"site");assert.equal(venue.geo.approximate,true);
 assert.ok(venue.geo.review_scope&&venue.geo.source_url.startsWith("https://"));
 assert.ok(venue.source_links.some(x=>x.url===venue.geo.source_url),"Coordinate citation retained");
 assert.ok(venue.source_links.some(x=>source[6].includes(x.url)),"Original source retained");
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.ok(!venue.cover_media,"Site marker must not authorize third-party image");
 assert.equal(venue.sections.length,0);assert.equal(venue.actions.length,0);
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language);
  const profile=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+sourceId+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/);
 }
}
assert.equal(all.length,2582);
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:219,SOURCE_PIN:1806,ADDRESS_ONLY:557});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,557);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,219);
const cagliariResearch=all.find(x=>x.physical_group_id==="RG-B65-77C86C7B3EC4");
const cagliariOriginal=all.find(x=>x.physical_group_id==="RG-A75D8A0E1C53");
assert.ok(cagliariOriginal?.map_publishable&&cagliariResearch&&!cagliariResearch.map_publishable,
 "Do not reintroduce duplicate research marker for an already mapped Cagliari basilica");
console.log("PASS TLM pin recovery batch 7: 15 evidence-locked site pins, 2,025 mapped, 557 unpinned, no inferred Mass or image rights");
