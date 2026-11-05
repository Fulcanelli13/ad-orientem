// Batch 8: 17 exact source-owned site coordinates for unpinned CL2 venues.
// Physical geometry only: no inferred traditional Mass, liturgical classification,
// venue operator, verified visitor entrance, photograph rights, or celebration times.
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
assert.equal(new Set(keys).size,keys.length,"Duplicate reviewed pin keys are forbidden");
const sites=[
  [
    "RG-BF0D731A3654",
    "AO-B35-L-GB-FBB82A488A6D",
    51.44606,
    -0.94651,
    "osm:way:87312317"
  ],
  [
    "RG-1734263E7298",
    "AO-B36-L-GB-B19A915751C9",
    52.43305,
    -1.11148,
    "osm:way:923580856"
  ],
  [
    "RG-2D933ABCB370",
    "AO-B36-L-GB-252819E5F579",
    52.40974,
    -1.16521,
    "osm:way:819616664"
  ],
  [
    "RG-BC9744E226D8",
    "AO-B36-L-GB-8C0C10BC3A62",
    51.43718,
    -1.07497,
    "osm:way:222728126"
  ],
  [
    "RG-C6A6C9CEBAEA",
    "AO-B36-L-GB-37250C1F50A0",
    56.467859,
    -2.996101,
    "independent:historic-scotland-lawside-convent"
  ],
  [
    "RG-678DD599CA5A",
    "AO-B42-FSSP-FR-138",
    43.65342,
    -0.91749,
    "osm:way:384761737"
  ],
  [
    "RG-B72-77E1820587D7",
    "AO-RSCH-B72-77E1820587D7",
    49.4495,
    1.10408,
    "osm:way:64716385"
  ],
  [
    "RG-B77-0AE5D57F50DB",
    "SSPX-B77:SSPX-LPL2-BROUT-VERNET",
    46.20355,
    3.26537,
    "osm:way:391270787"
  ],
  [
    "RG-BFD2A3A629FA",
    "AO-B42-FSSP-FR-182",
    49.49742,
    0.12171,
    "osm:way:71024322"
  ],
  [
    "RG-B77-F46376B81282",
    "SSPX-B77:SSPX-LPL2-ETCHARRY",
    43.32059,
    -0.92314,
    "osm:way:1443685457"
  ],
  [
    "RG-B65-343783FEF6FD",
    "AO-RSCH-B65-343783FEF6FD",
    49.62509,
    20.69336,
    "osm:way:74665637"
  ],
  [
    "RG-B69-13CAC6B52179",
    "AO-RSCH-B69-13CAC6B52179",
    52.39342,
    16.92082,
    "osm:way:36980045"
  ],
  [
    "RG-B66-A15CAA119C4E",
    "AO-RSCH-B66-A15CAA119C4E",
    51.59951,
    18.93325,
    "osm:way:279499887"
  ],
  [
    "RG-B66-BFB487D25492",
    "AO-RSCH-B66-BFB487D25492",
    54.58188,
    18.37798,
    "osm:way:517560526"
  ],
  [
    "RG-B65-0C5040F6E1D5",
    "AO-RSCH-B65-0C5040F6E1D5",
    47.05627,
    8.53454,
    "osm:way:144397467"
  ],
  [
    "RG-C663479AE624",
    "AO-B45-SSPX-DE-94B2BB5D899E",
    48.83727,
    12.2112,
    "osm:way:136901782"
  ],
  [
    "RG-316E65557831",
    "AO-B50-CMRI-US-95E63E8CA69",
    33.54182,
    -112.1143,
    "osm:way:914974008"
  ]
];
assert.equal(sites.length,17);
assert.equal(new Set(sites.map(s=>s[0])).size,17);
for(const [anchor,sourceId,lat,lng,sourceRef] of sites){
 const source=cl2.records.find(x=>x[0]===anchor);
 assert.ok(source&&source[1].includes(sourceId),"Exact frozen source identity required: "+anchor);
 assert.ok(!sourceItems.some(x=>source[1].includes(x.source_id)),
  "A previously mapped R49 venue must not be added as a new marker: "+anchor);
 const venue=all.find(x=>x.physical_group_id===anchor);
 assert.ok(venue&&venue.source_id===sourceId&&venue.source_ids.includes(sourceId));
 assert.equal(venue.title,source[2],"Do not rewrite original venue identity");
 assert.equal(venue.country_code,source[3]);
 assert.equal(venue.map_publishable,true);
 assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,lat);
 assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,sourceRef);
 assert.ok(venue.geo.source_url.startsWith("https://"));
 assert.equal(venue.geo.precision,"site");
 assert.equal(venue.geo.approximate,true);
 assert.ok(venue.geo.review_scope);
 assert.ok(venue.source_links.some(s=>s.url===venue.geo.source_url),
  "Geometry evidence link must remain navigable");
 assert.ok(venue.source_links.some(s=>source[6].includes(s.url)),
  "Original CL2 source link must be preserved");
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.equal(venue.sections.length,0);
 assert.equal(venue.actions.length,0);
 assert.ok(!venue.cover_media,"Coordinates are not a third-party image license");
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language);
  const detail=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(detail.includes('data-tlm-church-profile="'+sourceId+'"'));
  assert.ok(detail.includes("aoTlmProfileSources"));
  assert.doesNotMatch(detail,/data-tlm-celebration-evidence=/);
 }
}
for(const anchor of ["RG-B65-77C86C7B3EC4","RG-B66-ACD5E3A16E10","RG-5E751D3AAEFA"]){
 const held=all.find(x=>x.physical_group_id===anchor);
 assert.ok(held&&!held.map_publishable,"Ambiguous or duplicate site should remain held: "+anchor);
}
assert.equal(all.length,2582);
assert.equal(all.filter(x=>x.map_publishable).length,2510);
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:704,SOURCE_PIN:1806,ADDRESS_ONLY:72});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,72);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,704);
console.log("PASS TLM site recovery batch 8: 17 precise sites, 2510 mapped, 72 list-only, source and bilingual profiles preserved");
