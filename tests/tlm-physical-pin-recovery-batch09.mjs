// TLM batch 9 — 20 exact physical-site pins; no inferred liturgical claims.
// Recover only source-locked church, abbey and shrine locations, preserving
// source identity, bilingual profiles, unverifiable Mass times, and photo rights.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts}
 from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory}
 from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const index=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const baseline=projectPublishedProvisionalMassSites(
 projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),
 read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(baseline,index);
const code=readFileSync(new URL("../src/find/cl2-physical-directory.js",import.meta.url),"utf8");
const section=code.split("const REVIEWED_NEW_SITE_PINS=Object.freeze({")[1]?.split("\n});")[0]??"";
const keys=[...section.matchAll(/"(RG-[A-Z0-9-]+)"\s*:\s*Object\.freeze\(\{/g)].map(m=>m[1]);
assert.equal(new Set(keys).size,keys.length,"Duplicate reviewed pin declarations");
const sites=[
 [
  "RG-1406AE6DA1E7",
  "AO-B34-L-GB-CF08BF947AD7",
  52.2046,
  0.12022,
  "osm:way:137152224"
 ],
 [
  "RG-16B82EFF8821",
  "AO-B35-L-GB-C8AA38C4A1FD",
  51.51307,
  -0.16243,
  "independent:geograph-tyburn-convent"
 ],
 [
  "RG-293E1CE7BC2A",
  "AO-B35-L-GB-B5D8BDB69BAF",
  51.64126,
  -1.16469,
  "osm:way:1095728564"
 ],
 [
  "RG-30C0A48AB608",
  "AO-B35-L-GB-FB0B88F02056",
  53.23055,
  -0.53573,
  "osm:way:782353109"
 ],
 [
  "RG-2BAFA5D799B1",
  "AO-B34-L-GB-374F2382750E",
  53.76847,
  -0.36193,
  "osm:way:303071612"
 ],
 [
  "RG-3A39B88E33E3",
  "AO-B35-L-GB-F80107EFF550",
  51.83337,
  0.69622,
  "osm:way:889256280"
 ],
 [
  "RG-3207CC6364C3",
  "AO-B35-L-GB-D032BBC21885",
  52.03779,
  -0.3357,
  "osm:way:860588637"
 ],
 [
  "RG-3054BE48C751",
  "AO-B35-L-GB-AD6ADC1139A8",
  50.77387,
  0.10733,
  "osm:way:763156138"
 ],
 [
  "RG-3D6721887FF1",
  "AO-B34-L-GB-4D7977829142",
  51.82597,
  -3.02169,
  "osm:way:291321156"
 ],
 [
  "RG-15198DD7A6FE",
  "AO-B35-L-GB-D1A88E153706",
  51.27769,
  0.52216,
  "osm:way:252154357"
 ],
 [
  "RG-4FD73DACD53C",
  "AO-B35-L-GB-1EE0F3769582",
  54.5239,
  -1.5598,
  "independent:historicengland-darlington-st-augustine"
 ],
 [
  "RG-42F74B12B792",
  "AO-B35-L-GB-95FA80A72DCB",
  52.06665,
  -2.33564,
  "independent:historicengland-little-malvern-st-wulstan"
 ],
 [
  "RG-EB1D5FDB48A1",
  "AO-B56-FR-C27FE0B6ECD6",
  43.11979,
  5.93349,
  "osm:way:145362333"
 ],
 [
  "RG-FF29CEEF2C8D",
  "AO-B33-L-FR-71A15A92C1BA",
  47.79485,
  3.57488,
  "osm:way:62624035"
 ],
 [
  "RG-ED75D87C6DF7",
  "AO-B37-L-FR-CD0EBBCF9300",
  45.0896,
  6.06873,
  "osm:way:105319412"
 ],
 [
  "RG-EBF6D38C26EF",
  "AO-B33-L-FR-D71637DD22E0",
  44.19815,
  0.74048,
  "osm:way:181121182"
 ],
 [
  "RG-C11191C53318",
  "AO-B39-LOC-IT-BB077956E6B0",
  41.89946,
  12.46477,
  "osm:way:127942183"
 ],
 [
  "RG-B69-7D6B180DC7DF",
  "AO-RSCH-B69-7D6B180DC7DF",
  49.62306,
  9.26521,
  "osm:way:241366016"
 ],
 [
  "RG-8CB7A2FF4E95",
  "AO-B33-L-PL-7BD9D404AE7A",
  52.1772718,
  21.1931411,
  "independent:nearplace-warsaw-garncarska-32"
 ],
 [
  "RG-86A7E1914773",
  "AO-B45-SSPX-US-BDE0089C017E",
  33.37867,
  -112.06188,
  "osm:way:959945369"
 ]
];
assert.equal(sites.length,20);
assert.equal(new Set(sites.map(x=>x[0])).size,20);
for(const [anchor,sourceId,lat,lng,sourceRef] of sites){
 const source=index.records.find(x=>x[0]===anchor);
 assert.ok(source?.[1].includes(sourceId),"Exact CL2 physical-site identity required: "+anchor);
 assert.ok(!baseline.some(x=>source[1].includes(x.source_id)),
  "Already pinned R49 venue may not be duplicated: "+anchor);
 const venue=all.find(x=>x.physical_group_id===anchor);
 assert.ok(venue&&venue.source_id===sourceId&&venue.source_ids.includes(sourceId));
 assert.equal(venue.title,source[2],"Original venue title cannot be rewritten");
 assert.equal(venue.country_code,source[3]);
 assert.equal(venue.map_publishable,true);
 assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,lat);assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,sourceRef);
 assert.ok(venue.geo.source_url.startsWith("https://"));
 assert.ok(venue.geo.review_scope);
 assert.equal(venue.geo.precision,"site");
 assert.equal(venue.geo.approximate,true);
 assert.ok(venue.source_links.some(s=>s.url===venue.geo.source_url),"Geometry citation required");
 assert.ok(venue.source_links.some(s=>source[6].includes(s.url)),"Original source link required");
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.equal(venue.sections.length,0);assert.equal(venue.actions.length,0);
 assert.ok(!venue.cover_media,"Site location is not an image-publication license");
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language);
  const profile=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+sourceId+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/);
 }
}
// Site level: a convent and two religious campuses may not pretend that their
// precise visitor entrance, chapel doorway or current Mass schedule was proven.
for(const anchor of ["RG-16B82EFF8821","RG-EBF6D38C26EF","RG-86A7E1914773"]){
 const venue=all.find(x=>x.physical_group_id===anchor);
 assert.ok(venue?.facts.some(x=>x.label==="Map position"&&x.value.includes("religious campus")));
 assert.ok(venue.geo.approximate);
}
// Existing duplicate/conflicting venues remain held after batch 9.
for(const anchor of ["RG-B65-77C86C7B3EC4","RG-B66-ACD5E3A16E10","RG-5E751D3AAEFA"]){
 const venue=all.find(x=>x.physical_group_id===anchor);
 assert.ok(venue&&!venue.map_publishable,"Held duplicate or ambiguous site must remain unpinned: "+anchor);
}
assert.equal(all.length,2582);
assert.equal(all.filter(x=>x.map_publishable).length,2056);
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:250,SOURCE_PIN:1806,ADDRESS_ONLY:526});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,526);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,250);
console.log("PASS TLM batch 9: 20 exact site pins, 2056 mapped, 526 card-only, source and bilingual profiles protected");
