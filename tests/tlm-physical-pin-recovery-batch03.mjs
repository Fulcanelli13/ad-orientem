// Canonical source-first place recovery: 10 physical church/abbey sites
// across GB, FR, IT and US. Independent site geometry, never programme proof.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts}
 from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory}
 from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const cl2=validateCL2PhysicalIndex(load("data/directory/generated/cl2-physical-site-index.v1.json"));
const base=projectPublishedProvisionalMassSites(
 projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json")),
 load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(base,cl2);
const sourceText=readFileSync(new URL("../src/find/cl2-physical-directory.js",import.meta.url),"utf8");
const sourceRegistry=sourceText.split("const REVIEWED_NEW_SITE_PINS=Object.freeze({")[1]?.split("\n});")[0]??"";
const ids=[...sourceRegistry.matchAll(/"(RG-[A-Z0-9-]+)"\s*:\s*Object\.freeze\(\{/g)].map(x=>x[1]);
assert.equal(new Set(ids).size,ids.length,"A second site adjudication must not overwrite a prior church entry");
const newSites=[
 ["RG-FAC20FA70D51","AO-B36-L-GB-DEDA53FBF2A4",55.952898,-3.226376,"independent:historic-scotland-lb50186","Edinburgh","RAVELSTON_ST_ANDREW_CHURCH_BUILDING_NOT_CATHEDRAL_HOUSE_ON_YORK_PLACE"],
 ["RG-966121990E29","AO-B36-L-GB-7F0BF55868F8",57.08685,-7.30679,"osm:way:208110102","Eriskay","ERISKAY_ST_MICHAEL_CHURCH_FOOTPRINT_NOT_ADJOINING_PRESBYTERY"],
 ["RG-76E004302185","AO-B36-L-GB-38AA0B628267",55.84649,-4.03811,"osm:way:293964480","Woodhall Avenue","COATBRIDGE_ST_JAMES_CATHOLIC_CHURCH_NOT_PARISH_HALL_OR_NEIGHBORING_BUILDINGS"],
 ["RG-66F1670E4623","AO-B36-L-GB-AA569700281C",57.2494,-2.4667,"independent:historic-scotland-lb2834-church","Fetternear","FETTERNEAR_GARIOCH_CATHOLIC_CHURCH_BUILDING_NOT_PRESBYTERY_LISTED_SEPARATELY"],
 ["RG-ACE21207D458","AO-B42-FSSP-GB-216",51.68984733,-0.61346733,"independent:buckinghamshire-heritage-mbc34021","Chesham Bois","CHESHAM_BOIS_HERITAGE_GRID_SU9594_9992_CHURCH_NOT_NEIGHBORING_CATHOLIC_PRIMARY_SCHOOL"],
 ["RG-48ADDCE5B66F","AO-B52-FR-629DBA7EA0BE",46.15988,2.70388,"osm:way:143600998","Virlet","BELLAIGUE_EXACT_ABBEY_CHURCH_NOT_MONASTERY_DORMITORY_OR_NEIGHBORING_NUNNERY"],
 ["RG-18D90713A799","AO-B40-LOC-FR-9DDBC8EC9884",44.35648,2.57783,"osm:way:45425385","Tarayre","RODEZ_SACRE_COEUR_PARISH_CHURCH_FOOTPRINT_NOT_PARKING_OR_NEARBY_CATHEDRAL"],
 ["RG-5982F41E1BEF","LMD:blessed-sacrament-church-birmingham-united-states",33.48892,-86.85563,"osm:way:1337597428","Birmingham","BIRMINGHAM_AL_BLESSED_SACRAMENT_CATHOLIC_CHURCH_FOOTPRINT_NOT_OTHER_CHURCHES"],
 ["RG-2323CFCF49FD","AO-B39-LOC-IT-981400079976",41.89593,12.48773,"independent:commons-santi-domenico-object-location","Angelicum","ROME_SANTI_DOMENICO_SISTO_EXACT_PHOTOGRAPHED_CHURCH_SITE_NOT_ANGELICUM_CLASSROOMS"],
 ["RG-5971A223ED2C","AO-B33-L-FR-6AB07860E97F",47.51056,4.53102,"geonames:11962645","Flavigny","FLAVIGNY_NAMED_CLAIRVAL_ABBEY_SITE_NOT_EGLISE_SAINT_GENEST_NEARBY_OR_OLD_FLAVIGNY_ABBEY"],
];
for(const [group,sourceId,lat,lng,ref,addressNeedle,reviewScope] of newSites){
 const row=cl2.records.find(r=>r[0]===group);
 assert.ok(row&&row[1].includes(sourceId),"Only canonical source IDs can acquire locations: "+group);
 assert.ok(!base.some(x=>row[1].includes(x.source_id)),"Cannot remap a previously pinned R49 church: "+group);
 const item=all.find(x=>x.physical_group_id===group);
 assert.ok(item&&item.source_id===sourceId&&item.source_ids.includes(sourceId),"Identity changed: "+group);
 assert.equal(item.map_publishable,true);assert.equal(item.map_state,"PROVISIONAL");
 assert.equal(item.geo.lat,lat);assert.equal(item.geo.lng,lng);
 assert.equal(item.geo.source_ref,ref);assert.equal(item.geo.review_scope,reviewScope);
 assert.equal(item.geo.approximate,true);assert.equal(item.geo.precision,"site");
 assert.ok(item.geo.source_url?.startsWith("https://"));
 assert.ok(item.source_links.some(x=>x.url===item.geo.source_url),"Coordinate provenance link missing: "+group);
 assert.ok(item.source_links.some(x=>row[6].includes(x.url)),"Original listing lost: "+group);
 assert.ok(item.address.formatted.includes(addressNeedle),"Corrected building address missing: "+group);
 assert.equal(item.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(item.celebration_evidence,undefined);
 assert.ok(!item.cover_media,"Geographical admission is not a photographic permission");
 assert.equal(item.sections.length,0);assert.equal(item.actions.length,0);
 for(const lang of ["en","fr"]){
  const card=renderDirectoryVenueCard(item,lang),profile=renderTlmChurchProfile(item,lang);
  assert.ok(card.includes('data-explore-item="'+item.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+sourceId+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/,
    "No Mass or Missal facts can be inferred from precise building coordinates");
 }
}
// Batch 8 has independently corroborated St William of York's actual church way;
// earlier locality-only evidence must never have been sufficient on its own.
const readingSite=all.find(x=>x.physical_group_id==="RG-BF0D731A3654");
assert.ok(readingSite?.map_publishable&&readingSite.map_state==="PROVISIONAL");
assert.equal(readingSite.geo.source_ref,"osm:way:87312317");
assert.equal(readingSite.geo.lat,51.44606);
assert.equal(readingSite.geo.lng,-0.94651);
assert.ok(readingSite.source_links.some(x=>x.url==="https://mapcarta.com/W87312317"));
assert.equal(readingSite.status,"RESEARCH-LISTED · MASS UNVERIFIED");
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:700,SOURCE_PIN:1806,ADDRESS_ONLY:76});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,76);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,700);
console.log("PASS TLM pin recovery batch 3: 10 sites across GB FR IT US, 2506 map markers, 76 still card-only, no invented Mass or photograph");
