// Batch 4: 12 independently corroborated physical Catholic worship sites.
// Never infer an individual TLM, entrance, Missal, clergy or photographic rights.
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
const old=projectPublishedProvisionalMassSites(
 projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json")),
 load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(old,cl2);
const sourceText=readFileSync(new URL("../src/find/cl2-physical-directory.js",import.meta.url),"utf8");
const section=sourceText.split("const REVIEWED_NEW_SITE_PINS=Object.freeze({")[1]?.split("\n});")[0]??"";
const keys=[...section.matchAll(/"(RG-[A-Z0-9-]+)"\s*:\s*Object\.freeze\(\{/g)].map(x=>x[1]);
assert.equal(new Set(keys).size,keys.length,"No duplicate reviewed CL2 physical group keys");
const release=[
 ["RG-528AB7046C4C","AO-B37-L-AT-10514C7E9020",48.30428,14.28567,"osm:way:88454087","Klosterstraße","LINZ_MINORITENKIRCHE_CHURCH_FOOTPRINT_NOT_NEARBY_ALTER_DOM"],
 ["RG-72DF6B4BE3ED","AO-B37-L-AT-960FC36DA592",48.19607,16.36744,"osm:way:29490756","Wiedner Hauptstraße","VIENNA_PAULANERKIRCHE_ACTUAL_CHURCH_NOT_NEARBY_PROTESTANT_OR_ST_ELISABETH"],
 ["RG-0D6D16EEC8DA","AO-B37-L-CH-9D490E3D76A3",47.48797,9.29882,"osm:way:435800580","St. Pelagibergstrasse","ST_PELAGIBERG_EXACT_CATHOLIC_PILGRIMAGE_CHURCH_FOOTPRINT_NOT_HAMLET_OR_BUS_STOP"],
 ["RG-2618E5D29428","AO-B42-FSSP-FR-176",45.82735,6.20255,"osm:way:70557072","Duingt","DUINGT_SAINT_GERMAIN_ROMAN_CATHOLIC_CHURCH_NOT_PARKING_OR_WAYSIDE_SHRINES"],
 ["RG-7FF3FB47A74A","AO-B51-FR-5779188C321D",45.09447,5.11324,"osm:way:61073576","205 chemin des Carnets","TRIORS_NAMED_BENEDICTINE_ABBEY_CHURCH_NOT_NEARBY_EGLISE_SAINT_SEBASTIEN"],
 ["RG-74A4FF39E697","AO-B40-LOC-FR-28B51432B416",48.74111,2.84098,"osm:way:177044978","Place de l'Église","LES_CHAPELLES_BOURBON_SAINT_VINCENT_CHURCH_NOT_NEARBY_SAINT_NICOLAS"],
 ["RG-728E287267C4","AO-B33-L-FR-BBD003615B0F",50.727438,2.186389,"independent:france-heritage-pa62000145","50 rue de l'École","WISQUES_SAINT_PAUL_MENS_ABBEY_HERITAGE_BUILDINGS_NOT_NOTRE_DAME_WOMENS_ABBEY"],
 ["RG-7974C6D19288","AO-B40-LOC-BE-AE1E5D3A7D63",50.54146,3.54689,"osm:way:515666086","Place de Brasménil","BRASMENIL_SAINT_GERY_CHURCH_FOOTPRINT_HOUSE_NUMBER_CONFLICT_1_VS_22_HELD"],
 ["RG-3F4A95E75DE4","AO-B42-FSSP-BE-023",49.55459,5.53137,"osm:way:90215068","Saint-Mard","SAINT_MARD_SAINT_MEDARD_ROMAN_CATHOLIC_CHURCH_NOT_PROTESTANT_CHURCH_NEARBY"],
 ["RG-62828B925646","AO-B42-FSSP-US-320",38.91808,-78.19528,"osm:way:399533140","120 West Main Street","FRONT_ROYAL_ST_JOHN_CATHOLIC_HISTORIC_CHURCH_FOOTPRINT_NOT_CHAPLAINCY_SITE_ELSEWHERE"],
 ["RG-7736D193DB0F","AO-B50-CMRI-US-AE55AE75ADC",36.142060,-95.988855,"independent:4states-fatima-official-property-gps","20730 E Hwy 28A","CHELSEA_OK_OUR_LADY_FATIMA_OWNER_PUBLISHED_RURAL_CHAPEL_PROPERTY_COORDINATE_NOT_ENTRANCE"],
 ["RG-24DE8FCA3A1E","AO-B41-LOC-PL-2F5EBDF4C2EB",53.76637,20.42309,"osm:way:144447258","Żniwna 7","OLSZTYN_DAJTKI_OUR_LADY_OF_ROSARY_CATHOLIC_CHURCH_NOT_NEARBY_SAINT_JOHN_NEPOMUCENE_CHAPEL"],
];
for(const [group,id,lat,lng,ref,addressNeedle,scope] of release){
 const src=cl2.records.find(x=>x[0]===group);
 assert.ok(src&&src[1].includes(id),"Frozen physical identity does not include this exact source ID: "+group);
 assert.ok(!old.some(x=>src[1].includes(x.source_id)),"Cannot duplicate a pre-existing map point: "+group);
 const place=all.find(x=>x.physical_group_id===group);
 assert.ok(place&&place.source_id===id&&place.source_ids.includes(id));
 assert.equal(place.map_publishable,true);
 assert.equal(place.map_state,"PROVISIONAL");
 assert.equal(place.geo.lat,lat);assert.equal(place.geo.lng,lng);
 assert.equal(place.geo.source_ref,ref);
 const expectedUrl=ref.startsWith("osm:way:")?
  "https://www.openstreetmap.org/way/"+ref.split(":")[2]:
  ref==="independent:france-heritage-pa62000145"?
  "https://pop.culture.gouv.fr/notice/merimee/PA62000145":
  "https://4statesfatimachapel.org/home/";
 assert.equal(place.geo.source_url,expectedUrl);
 assert.equal(place.geo.precision,"site");
 assert.equal(place.geo.approximate,true);
 assert.equal(place.geo.review_scope,scope);
 assert.ok(place.address?.formatted?.includes(addressNeedle),"Church-site formatted address missing");
 assert.ok(place.source_links.some(x=>src[6].includes(x.url)),"Original source evidence missing");
 assert.ok(place.source_links.some(x=>x.url===expectedUrl),"Verified independent location citation missing");
 assert.equal(place.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(place.celebration_evidence,undefined);
 assert.ok(!place.cover_media,"No automatic image authorization from pin");
 assert.equal(place.sections.length,0);assert.equal(place.actions.length,0);
 for(const lang of ["en","fr"]){
  const card=renderDirectoryVenueCard(place,lang);
  const profile=renderTlmChurchProfile(place,lang);
  assert.ok(card.includes('data-explore-item="'+place.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+id+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/);
 }
}
// Saint-Géry's conflicting house number is not silently asserted on display.
const brasmenil=all.find(x=>x.physical_group_id==="RG-7974C6D19288");
assert.ok(brasmenil&&!/Brasménil (?:1|22),/.test(brasmenil.address.formatted));
// The site is the Benedictine Saint-Paul monastery, not the distinct women's abbey.
const wisques=all.find(x=>x.physical_group_id==="RG-728E287267C4");
assert.ok(wisques.geo.review_scope.includes("NOT_NOTRE_DAME_WOMENS_ABBEY"));
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:726,SOURCE_PIN:1806,ADDRESS_ONLY:50});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,50);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,726);
console.log("PASS TLM batch 4: 12 independently matched physical worship sites in AT BE CH FR PL US, 2532 mapped, 50 unpinned, no inferred Mass or media");
