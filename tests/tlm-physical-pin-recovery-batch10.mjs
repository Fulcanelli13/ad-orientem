// TLM batch 10 — 14 corroborated physical site markers, not Mass programmes.
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
assert.equal(new Set(keys).size,keys.length,"Duplicate reviewed marker keys");
const sites=[
 [
  "RG-A9FC85F5AFE7",
  "AO-B33-L-CH-6924B16C8BE6",
  47.48098,
  8.31259,
  "osm:way:154937681"
 ],
 [
  "RG-B68-B461DA8A23EC",
  "AO-RSCH-B68-B461DA8A23EC",
  47.57348,
  8.10542,
  "osm:way:164330493"
 ],
 [
  "RG-B65-4DE78F363E3E",
  "AO-RSCH-B65-4DE78F363E3E",
  46.00271,
  8.94966,
  "osm:way:304791938"
 ],
 [
  "RG-999DDED0A28D",
  "AO-B37-L-AT-379E6A711F10",
  47.27328,
  11.39912,
  "osm:way:89757910"
 ],
 [
  "RG-B65-FD7F372A2CA8",
  "AO-RSCH-B65-FD7F372A2CA8",
  46.62231,
  14.31141,
  "osm:way:151150309"
 ],
 [
  "RG-5A44BBC2F82F",
  "AO-B42-FSSP-FR-185",
  48.41259,
  2.70692,
  "osm:way:289357554"
 ],
 [
  "RG-385CB296C95B",
  "AO-B38-LOC-IT-5A292BFDE06",
  40.79925,
  14.76065,
  "osm:way:1423948566"
 ],
 [
  "RG-8F7FF743FCA8",
  "AO-B39-LOC-IT-E537562E8F1E",
  46.4244,
  12.57996,
  "osm:way:36688040"
 ],
 [
  "RG-44F34EFE1E3E",
  "AO-B39-LOC-IT-FBC47F367CEE",
  46.51971,
  13.01013,
  "osm:way:36687834"
 ],
 [
  "RG-1F29E61E4E9C",
  "AO-B50-SSPV-US-41E99D578F9",
  40.85257,
  -73.51771,
  "osm:way:769496257"
 ],
 [
  "RG-3B1969F98EB8",
  "AO-B34-L-GB-3AE96B78FD59",
  51.79916,
  -0.07491,
  "osm:way:1425479567"
 ],
 [
  "RG-4ED31AAC0227",
  "AO-B35-L-GB-35F043A405D6",
  51.90151,
  -2.08031,
  "osm:way:165987776"
 ],
 [
  "RG-44539D308ED2",
  "AO-B34-L-GB-501792192CF3",
  51.6899,
  -0.61314,
  "osm:node:3350422254"
 ],
 [
  "RG-DF381F232A61",
  "AO-B40-SSPX-PL-LIBERTOW",
  49.97933,
  19.89391,
  "osm:way:337593216"
 ]
];
assert.equal(sites.length,14);
assert.equal(new Set(sites.map(x=>x[0])).size,14);
for(const [anchor,sourceId,lat,lng,sourceRef] of sites){
 const source=index.records.find(x=>x[0]===anchor);
 assert.ok(source?.[1].includes(sourceId),"Source ID must belong to frozen group: "+anchor);
 assert.ok(!baseline.some(x=>source[1].includes(x.source_id)),
  "An already mapped R49 venue cannot receive a duplicate marker: "+anchor);
 const venue=all.find(x=>x.physical_group_id===anchor);
 assert.ok(venue&&venue.source_id===sourceId&&venue.source_ids.includes(sourceId));
 assert.equal(venue.title,source[2]);
 assert.equal(venue.country_code,source[3]);
 assert.equal(venue.map_publishable,true);
 assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,lat);assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,sourceRef);
 assert.ok(venue.geo.source_url.startsWith("https://www.openstreetmap.org/"));
 assert.equal(venue.geo.precision,"site");
 assert.equal(venue.geo.approximate,true);
 assert.ok(venue.geo.review_scope);
 assert.ok(venue.source_links.some(x=>x.url===venue.geo.source_url),
  "Reviewed geometry provenance lost: "+anchor);
 assert.ok(venue.source_links.some(x=>source[6].includes(x.url)),
  "Original directory source link lost: "+anchor);
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.equal(venue.sections.length,0);
 assert.equal(venue.actions.length,0);
 assert.ok(!venue.cover_media,"Location metadata must not license a painting/photo");
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language);
  const profile=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+sourceId+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/);
 }
}
const chesham=all.find(x=>x.physical_group_id==="RG-44539D308ED2");
assert.equal(chesham.geo.source_ref,"osm:node:3350422254",
 "Chesham Bois is a named church POI, not a building outline or door");
assert.match(chesham.geo.review_scope,/OSM_POI_NOT_BUILDING_FOOTPRINT/);
const baden=all.find(x=>x.physical_group_id==="RG-A9FC85F5AFE7");
assert.match(baden.geo.review_scope,/HOUSE_NUMBER_DISPUTED/,
 "Historic Baden listing and current geodata have different street numbers");
const acigliano=all.find(x=>x.physical_group_id==="RG-385CB296C95B");
assert.match(acigliano.geo.review_scope,/MARIA_ASSUNTA_TITLE_UNVERIFIED/,
 "Do not infer the full canonical dedication from a San Magno building match");
for(const anchor of ["RG-B65-77C86C7B3EC4","RG-B66-ACD5E3A16E10","RG-5E751D3AAEFA"]){
 const venue=all.find(x=>x.physical_group_id===anchor);
 assert.ok(venue&&!venue.map_publishable,"Held duplicate/ambiguous venue must remain unpinned: "+anchor);
}
assert.equal(all.length,2582);
assert.equal(all.filter(x=>x.map_publishable).length,2039);
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:233,SOURCE_PIN:1806,ADDRESS_ONLY:543});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,543);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,233);
console.log("PASS TLM batch 10: 14 exact sites, 2039 pins, 543 bilingual unpinned, no inferred rites or media");
