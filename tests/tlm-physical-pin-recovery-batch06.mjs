// Batch 6: 12 source-locked Catholic building and monastery-site locations.
// No Mass programme, interior chapel entrance, canonical affiliation, photographic
// publishing rights or liturgical books are inferred from site coordinates.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts}
 from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory}
 from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const cl2=validateCL2PhysicalIndex(load("data/directory/generated/cl2-physical-site-index.v1.json"));
const sourceItems=projectPublishedProvisionalMassSites(
 projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json")),
 load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(sourceItems,cl2);
const sourceCode=readFileSync(new URL("../src/find/cl2-physical-directory.js",import.meta.url),"utf8");
const section=sourceCode.split("const REVIEWED_NEW_SITE_PINS=Object.freeze({")[1]?.split("\n});")[0]??"";
const keys=[...section.matchAll(/"(RG-[A-Z0-9-]+)"\s*:\s*Object\.freeze\(\{/g)].map(m=>m[1]);
assert.equal(new Set(keys).size,keys.length,"Duplicate physical-site keys must never silently overwrite reviewed pins");
const sites=[
 [
  "RG-9FB229163D37",
  "AO-B33-L-FR-8DB5848E80B5",
  46.67668,
  0.97902,
  "osm:way:133427430",
  "FONTGOMBAULT_ABBATIAL_CHURCH_WAY_NOT_RELIGIOUS_GROUNDS_OR_SAINT_JULIEN_CHAPEL",
  "Fontgombault"
 ],
 [
  "RG-9DD24AA24D17",
  "AO-B51-FR-50AFC12D1FB1",
  45.75464,
  1.27581,
  "independent:meconnu-solignac-saint-pierre-abbatiale",
  "SOLIGNAC_ABBATIAL_SAINT_PIERRE_NOT_DISTINCT_17TH_CENTURY_ABBEY_ANNEX",
  "parvis des Bénédictins"
 ],
 [
  "RG-B603CD336FDA",
  "AO-B56-DE-CAAEF98CAB71",
  52.54531,
  13.39767,
  "independent:berlin-denkmal-st-afra-stift",
  "BERLIN_ST_AFRA_STIFT_CATHOLIC_COURTYARD_CHURCH_NOT_STREET_RESIDENTIAL_FRONTAGE_ENTRANCE",
  "Graunstraße 31"
 ],
 [
  "RG-8928D3C3F3FC",
  "AO-B33-L-DE-7348A60E1CA7",
  47.64288,
  9.83291,
  "osm:way:816209341",
  "WIGRATZBAD_GNADENKAPELLE_PRECISE_CHAPEL_WAY_NOT_SUHNEKIRCHE_OR_SEMINARKAPELLE",
  "Kapellenweg 7"
 ],
 [
  "RG-988736831D7B",
  "AO-B33-L-BE-AD3B9517CED1",
  50.66653,
  5.61111,
  "osm:way:250546644",
  "HERSTAL_LA_PREALLE_IMMACULEE_CONCEPTION_CHURCH_NOT_LOCAL_COMMUNITY_CENTRE",
  "Place Jacques Brel"
 ],
 [
  "RG-8F4ADA95D1DE",
  "AO-B33-L-DE-9774CF2FB2E5",
  49.279112,
  7.117129,
  "independent:saarpfalz-tourism-st-engelbert",
  "ST_INGBERT_ST_ENGELBERT_KATHOLISCHE_ALTE_KIRCHE_NOT_MARTIN_LUTHER_CHURCH",
  "Kaiserstraße 67"
 ],
 [
  "RG-AE3A6D3F3471",
  "AO-B51-FR-31F693B76A9B",
  42.69578,
  2.12391,
  "osm:way:947461215",
  "DONEZAN_NAMED_CATHOLIC_BENEDICTINE_ABBEY_SITE_NOT_BAINS_CARCANIERES_CHAPEL_OR_UNCONFIRMED_INTERIOR_DOOR",
  "Col des Hares"
 ],
 [
  "RG-98624B5C317F",
  "AO-B41-LOC-IT-7FC72821368E",
  42.85525,
  13.57894,
  "osm:way:460324675",
  "ASCOLI_PICENO_SAN_CRISTOFORO_CHURCH_NOT_SAN_FRANCESCO_NEAR_PIAZZA_DEL_POPOLO",
  "Argillano"
 ],
 [
  "RG-7259E7C371CA",
  "AO-B38-LOC-BE-FA826560ECF",
  50.551583,
  5.782861,
  "independent:tancremont-chapel-wikidata-location",
  "TANCREMONT_EXACT_SANCTUARY_CHAPEL_NORTH_OF_CASTLE_NOT_THEUX_CASTLE_OR_NEARBY_CHEMIN_DE_CROIX",
  "Tancrémont 77"
 ],
 [
  "RG-98773C8FF48C",
  "AO-B33-L-DE-C58707083AB4",
  49.23436,
  11.66307,
  "osm:way:185270888",
  "VELBURG_HERZ_JESU_PILGRIMAGE_CHURCH_FOOTPRINT_NOT_ADJACENT_VELBURG_TOWN_PARISH",
  "Herz-Jesu-Berg 3"
 ],
 [
  "RG-419045B46987",
  "AO-B53-US-6A6DBEF1BDA1",
  42.48602,
  -71.62166,
  "osm:way:213422933",
  "STILL_RIVER_SISTERS_SAINT_BENEDICT_CENTER_CHURCH_NOT_SEPARATE_BENEDICT_ABBEY_OR_IHM_SCHOOL",
  "254 Still River Road"
 ],
 [
  "RG-AA554521A4A3",
  "AO-B56-US-2E7AD3F2AB26",
  42.68944,
  -71.15889,
  "nrhp:11000853",
  "LAWRENCE_MA_SACRED_HEART_CHURCH_COMPLEX_NRHP_SITE_NOT_RECTORY_DOOR_GEOMETRY",
  "321 South Broadway"
 ]
];
assert.equal(sites.length,12);
for(const [group,sourceId,lat,lng,sourceRef,reviewScope,formattedAddressFragment] of sites){
 const canonical=cl2.records.find(x=>x[0]===group);
 assert.ok(canonical&&canonical[1].includes(sourceId),"Exact frozen CL2 source identity required: "+group);
 assert.ok(!sourceItems.some(x=>canonical[1].includes(x.source_id)),
  "A previously pinned R49 item cannot be remapped as a new source site: "+group);
 const venue=all.find(x=>x.physical_group_id===group);
 assert.ok(venue&&venue.source_id===sourceId&&venue.source_ids.includes(sourceId));
 assert.equal(venue.map_publishable,true);
 assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,lat);assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,sourceRef);
 assert.equal(venue.geo.review_scope,reviewScope);
 assert.equal(venue.geo.precision,"site");assert.equal(venue.geo.approximate,true);
 assert.ok(venue.geo.source_url.startsWith("https://"));
 assert.ok(venue.source_links.some(x=>canonical[6].includes(x.url)),
  "Must preserve original directory listing evidence: "+group);
 assert.ok(venue.source_links.some(x=>x.url===venue.geo.source_url),
  "Must publish reviewed geometry citation: "+group);
 assert.ok(venue.address.formatted.includes(formattedAddressFragment),
  "Must keep corroborated named building/site address: "+group);
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.ok(!venue.cover_media,"A mapped location does not permit third-party photo publication");
 assert.equal(venue.sections.length,0);assert.equal(venue.actions.length,0);
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language),profile=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+sourceId+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/,
   "Physical site geometry may not automatically certify an individual Mass");
 }
}
// Still River has distinct convent and school/chapel properties.
// The unnamed chapel at 282 Still River Road must not inherit the nuns' 254 marker.
const convent=all.find(x=>x.physical_group_id==="RG-419045B46987");
const separateCenter=all.find(x=>x.physical_group_id==="RG-A3601E6DECF8");
assert.ok(convent?.map_publishable&&separateCenter&&!separateCenter.map_publishable,
 "Do not alias distinct Still River worship sites by street name or community");
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:277,SOURCE_PIN:1806,ADDRESS_ONLY:499});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,499);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,277);
console.log("PASS TLM pin recovery batch 6: 12 source-confirmed church/monastic site pins, 2083 mapped, 499 address-only, no inferred liturgical claims");
