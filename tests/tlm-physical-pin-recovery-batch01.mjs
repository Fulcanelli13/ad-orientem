// Source-first CL2 pin recovery. Independent church-building geometry is preserved; additionally approved
// illustrative locality markers are separate and never imply a church door.
// LMS/FSSP research labels never imply an individual Mass.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts}
  from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory}
  from "../src/find/cl2-physical-directory.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const physical=validateCL2PhysicalIndex(load("data/directory/generated/cl2-physical-site-index.v1.json"));
const published=projectPublishedProvisionalMassSites(
  projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json")),
  load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(published,physical);
const adapterSource=readFileSync(new URL("../src/find/cl2-physical-directory.js",import.meta.url),"utf8");
const pinRegistry=adapterSource.split("const REVIEWED_NEW_SITE_PINS=Object.freeze({")[1]?.split("\n});")[0]??"";
const pinKeys=[...pinRegistry.matchAll(/"(RG-[A-Z0-9-]+)"\s*:\s*Object\.freeze\(\{/g)].map(x=>x[1]);
assert.ok(pinKeys.length>=70,"New-site geography source contract unexpectedly disappeared");
assert.equal(new Set(pinKeys).size,pinKeys.length,
  "A second adjudication of the same physical site must not silently overwrite the existing pin");

const newlyMapped=[
 ["RG-0A7D6FB130D8","AO-B34-L-GB-5FF0510590CE",51.5311,0.03808,"osm:way:351087849","UPTON_PARK_OUR_LADY_OF_COMPASSION_CATHOLIC_CHURCH_BUILDING_NOT_PRIMARY_SCHOOL"],
 ["RG-09724CA01972","AO-B35-L-GB-9311BCBCBE20",51.403138,-0.356546,"independent:elmbridge-st-barnabas-church","MOLESEY_ST_BARNABAS_1931_CATHOLIC_CHURCH_NOT_NEIGHBORING_HOUSES_OR_OTHER_PARISHES"],
 ["RG-2680C1DA8953","AO-B34-L-GB-D81DD5E3D3A4",50.76611,0.27773,"osm:way:487068951","EASTBOURNE_OUR_LADY_OF_RANSOM_CHURCH_NOT_PRESBYTERY_OR_OTHER_PARISH_CHURCHES"],
 ["RG-223CDB93F8BD","AO-B34-L-GB-2C828CAB9C43",50.73777,-2.82292,"osm:way:258582025","CHIDEOCK_CATHOLIC_MARTYRS_CHURCH_NOT_ANGLICAN_ST_GILES_OR_CHIDEOCK_MANOR"],
 ["RG-3315DA94EE1D","AO-B34-L-GB-29141826F311",52.19876,0.12739,"osm:way:33167535","CAMBRIDGE_OUR_LADY_ENGLISH_MARTYRS_CHURCH_NOT_RECTORY_OR_PARKING"],
 ["RG-142C68DBCDC0","AO-B34-L-GB-A216E1128479",53.04729,-2.99858,"osm:way:399333482","WREXHAM_CATHEDRAL_CHURCH_NOT_GATEWAY_OR_PRESBYTERY"],
];
const refinements=[
 ["RG-02499F036F1D","ao-fssp-herz-jesu-kirche-schwamendingenstr-55-ch-8050-zurich-oerlikon-suisse",47.4068,8.55191,"osm:way:60796258","ZURICH_OERLIKON_HERZ_JESU_CHURCH_NOT_ADJACENT_CHAPEL_OR_CEMETERY"],
];
for(const [group,id,lat,lng,ref,scope] of [...newlyMapped,...refinements]){
 const row=physical.records.find(r=>r[0]===group);
 assert.ok(row&&row[1].includes(id),"Pin must belong to the exact canonical CL2 physical site: "+group);
 const venue=all.find(x=>x.physical_group_id===group);
 assert.ok(venue&&venue.source_id===id&&venue.source_ids.includes(id),"Source identity was rewritten");
 assert.ok(venue.map_publishable&&venue.map_state==="PROVISIONAL","Reviewed church should be physically mapped");
 assert.equal(venue.geo.lat,lat);assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,ref);assert.equal(venue.geo.source_url,
   ref.startsWith("osm:way:")?"https://www.openstreetmap.org/way/"+ref.split(":")[2]:
   "https://en.wikipedia.org/wiki/List_of_places_of_worship_in_Elmbridge");
 assert.equal(venue.geo.review_scope,scope);
 assert.equal(venue.geo.approximate,true,"Building coordinate is not a verified worship entrance");
 assert.equal(venue.geo.precision,"site");
 assert.ok(venue.source_links.length>=3&&venue.source_links.every(s=>s.url.startsWith("https://")));
 assert.ok(venue.address?.formatted,"Corrected church site address must render on card and detail");
 if(newlyMapped.some(r=>r[0]===group)){
  assert.equal(venue.sections.length,0);assert.equal(venue.actions.length,0);
  assert.match(venue.status,/MASS UNVERIFIED/);
 }else assert.ok(venue.preliminary_group,"Refinement must retain existing R49 source identity");
 assert.doesNotMatch(renderTlmChurchProfile(venue),/data-tlm-celebration-evidence=/,
   "Physical coordinates cannot create a claim about any Mass or its Missal");
}
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:510,SOURCE_PIN:1806,ADDRESS_ONLY:275});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,275);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,510);
// These records appear to describe one Cagliari basilica and require a
// physical-identity reconciliation before either gets a new coordinate.
const cagliariOriginal=all.find(x=>x.physical_group_id==="RG-A75D8A0E1C53");
const cagliariResearch=all.find(x=>x.physical_group_id==="RG-B65-77C86C7B3EC4");
assert.ok(cagliariOriginal?.map_publishable&&cagliariResearch&&!cagliariResearch.map_publishable,
  "Do not add a duplicate research pin to the already mapped Cagliari basilica");
console.log("PASS TLM pin recovery batch 1: six newly mapped churches plus one source-site refinement, 2,307 mapped (including 160 Excel-approved illustrative locality markers), 275 list-only, Cagliari duplicate held");
