// TLM physical-pin recovery batch 5, 13 physical churches and monastic sites.
// Site-level evidence only. Never infer liturgy, book, status, personnel or media rights.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts} from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const cl2=validateCL2PhysicalIndex(load("data/directory/generated/cl2-physical-site-index.v1.json"));
const base=projectPublishedProvisionalMassSites(projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json")),
  load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(base,cl2);
const adapter=readFileSync(new URL("../src/find/cl2-physical-directory.js",import.meta.url),"utf8");
const registry=adapter.split("const REVIEWED_NEW_SITE_PINS=Object.freeze({")[1]?.split("\n});")[0]??"";
const ids=[...registry.matchAll(/"(RG-[A-Z0-9-]+)"\s*:\s*Object\.freeze\(\{/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,"Duplicate physical-group keys must never overwrite reviewed coordinates");
const sites=[
 [
  "RG-2ED9EF0BE3AB",
  "AO-B37-L-DE-A2672DD83BA3",
  48.003687,
  10.594695,
  "independent:outdooractive-bad-woerishofen-klosterkirche",
  "BAD_WOERISHOFEN_NAMED_MONASTERY_CHURCH_KLOSTERHOF_NOT_NEARBY_HAUPTSTRASSE_CHURCH",
  "Klosterhof 1"
 ],
 [
  "RG-480FA8AC1FF9",
  "AO-B37-L-AT-5391593B2CFE",
  47.76921,
  16.27334,
  "independent:commons-katzelsdorf-radegundiskirche-object",
  "KATZELSDORF_KATHOLISCHE_RADEGUNDISKIRCHE_PHOTOGRAPHED_OBJECT_NOT_REDDEMPTORISTENKLOSTER_OR_ANNAKAPELLE",
  "Eichbüchler Straße 97"
 ],
 [
  "RG-5B9D15810FF7",
  "AO-B33-L-FR-6CE8D8950597",
  45.643333,
  3.073056,
  "independent:commons-randol-abbey-object",
  "COURNOLS_RANDOL_NAMED_BENEDICTINE_ABBEY_CAMPUS_NOT_VILLAGE_CENTER_OR_UNVERIFIED_DOOR",
  "285 route de Randol"
 ],
 [
  "RG-3A09AD57156D",
  "AO-B51-FR-F2BCE7B9D444",
  42.9761,
  1.53628,
  "independent:foix-tourisme-abbaye-pesquie",
  "SERRES_SUR_ARGet_NAMED_BENEDICTINE_ABBEY_SITE_NOT_ARIEGE_TOWN_CENTER_OR_ENTRANCE",
  "Pesquié"
 ],
 [
  "RG-1E9390D57492",
  "AO-B51-FR-A37A06B3C2B2",
  44.392858,
  5.471053,
  "independent:hautes-alpes-abbaye-rosans-object",
  "ROSANS_BAUDON_NAMED_BENEDICTINE_ABBEY_NOT_PARISH_SAINT_JACQUES_OR_TOWN_CENTROID",
  "1388 chemin de Baudon"
 ],
 [
  "RG-5E659B85328D",
  "AO-B52-FR-4D883BA8C7B5",
  47.48976,
  -0.59764,
  "osm:way:800361611",
  "AVRILLE_HAYE_AUX_BONSHOMMES_NAMED_DOMINICAN_MONASTERY_CAMPUS_NOT_ADJACENT_SAINT_JOSEPH",
  "6 allée Saint-Dominique"
 ],
 [
  "RG-61EFC50EC7F8",
  "AO-B51-FR-E576152D5DEE",
  47.97612,
  -0.44119,
  "osm:way:320706860",
  "CHEMERE_LE_ROI_COuVENT_SAINT_THOMAS_NAMED_MONASTERY_NOT_SAINT_VINCENT_FERRIER_POSTAL_CENTER",
  "2 route de Ballée"
 ],
 [
  "RG-035CA16C89AF",
  "AO-B39-LOC-IT-63FB0E8563C4",
  46.58318073226,
  13.00372357097,
  "independent:hike-uno-chiesa-cristo-re-timau",
  "TIMAU_CHIESA_CRISTO_RE_NOT_SANTISSIMO_CROCIFISSO_OSSARIO_OR_SANTA_GERTRUDE",
  "Timau"
 ],
 [
  "RG-2D593D4D9BB5",
  "AO-B39-LOC-IT-363FD3500B82",
  46.584925,
  12.991861,
  "independent:italian-encyclopedia-tempio-ossario-timau",
  "TIMAU_DISTINCT_SANTISSIMO_CROCIFISSO_OSSARIO_NOT_CRISTO_RE_NEW_CHURCH",
  "Timau"
 ],
 [
  "RG-4409970DC6EA",
  "AO-B39-LOC-IT-0A843181A7C2",
  46.530722,
  13.017875,
  "independent:italian-encyclopedia-chiesa-santa-maria-paluzza",
  "PALUZZA_DUOMO_SANTA_MARIA_ANNUNZIATA_NOT_UDINE_CATHEDRAL_OR_SAN_DANIELE",
  "Paluzza"
 ],
 [
  "RG-15277DF09583",
  "AO-B39-LOC-IT-781F1BB12042",
  46.4182889,
  12.5815778,
  "independent:commons-san-floriano-cella-object",
  "CELLA_FORNI_DI_SOPRA_SAN_FLORIANO_CHURCH_NOT_CELLA_IN_PALUZZA",
  "Cella"
 ],
 [
  "RG-6EB2E73F3DCD",
  "AO-B39-LOC-IT-33D0E1BE9B14",
  46.4220917,
  12.5819056,
  "independent:commons-madonna-salute-vico-object",
  "VICO_FORNI_DI_SOPRA_MADONNA_DELLA_SALUTE_SHRINE_NOT_SAN_FLORIANO_CELLA",
  "Vico"
 ],
 [
  "RG-F349033BCAB4",
  "AO-B39-LOC-IT-35CBFA669B98",
  46.4111972,
  12.5886056,
  "independent:commons-san-vito-andrazza-object",
  "ANDRAZZA_SAN_VITO_MODESTO_CRESCENZIA_CHURCH_NOT_FORNI_DI_SOPRA_MAIN_PARISH",
  "Andrazza"
 ]
];
assert.equal(sites.length,13);
for(const [group,sourceId,lat,lng,sourceRef,reviewScope,addressNeedle] of sites){
 const canonical=cl2.records.find(x=>x[0]===group);
 assert.ok(canonical&&canonical[1].includes(sourceId),"Site must match frozen physical identity: "+group);
 assert.ok(!base.some(x=>canonical[1].includes(x.source_id)),"Previously pinned R49 identity must not be silently duplicated");
 const venue=all.find(x=>x.physical_group_id===group);
 assert.ok(venue&&venue.source_id===sourceId&&venue.source_ids.includes(sourceId));
 assert.equal(venue.map_publishable,true);
 assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,lat);assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,sourceRef);assert.equal(venue.geo.review_scope,reviewScope);
 assert.ok(venue.geo.source_url.startsWith("https://"));
 assert.equal(venue.geo.precision,"site");assert.equal(venue.geo.approximate,true);
 assert.ok(venue.source_links.some(x=>x.url===venue.geo.source_url),"Independent coordinate provenance missing");
 assert.ok(venue.source_links.some(x=>canonical[6].includes(x.url)),"Original directory provenance missing");
 assert.ok(venue.address?.formatted?.includes(addressNeedle),"Correction may not lose source-address context");
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.ok(!venue.cover_media,"A coordinate never grants publication rights to an image");
 assert.equal(venue.sections.length,0);assert.equal(venue.actions.length,0);
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language),profile=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+sourceId+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/);
 }
}
// Timau's ossuary and modern Cristo Re are different buildings, not one church.
const timau=sites.filter(x=>x[0]==="RG-035CA16C89AF"||x[0]==="RG-2D593D4D9BB5");
assert.equal(timau.length,2);assert.notDeepEqual(timau[0].slice(2,4),timau[1].slice(2,4));
// Batch 10 upgrades Rivo San Lorenzo only after verifying the exact Catholic
// church footprint, not the street centre formerly rejected.
const rivo=all.find(x=>x.physical_group_id==="RG-44F34EFE1E3E");
assert.ok(rivo?.map_publishable&&rivo.map_state==="PROVISIONAL");
assert.equal(rivo.geo.source_ref,"osm:way:36687834");
assert.equal(rivo.geo.lat,46.51971);
assert.equal(rivo.geo.lng,13.01013);
assert.equal(rivo.status,"RESEARCH-LISTED · MASS UNVERIFIED");
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:264,SOURCE_PIN:1806,ADDRESS_ONLY:512});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,512);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,264);
console.log("PASS TLM recovery batch 5: 13 church/monastery site pins, 2070 mapped, 512 list-only, no inferred liturgical or media facts");
