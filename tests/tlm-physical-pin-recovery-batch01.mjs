// Source-first CL2 pin recovery. Only independent church-building geometry
// enters MapLibre. LMS/FSSP research labels never imply an individual Mass.
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
const newlyMapped=[
 ["RG-01F176BB1074","AO-B35-L-GB-91CDCC69A421",51.49582,-0.13952,"osm:way:10810446","WESTMINSTER_CATHEDRAL_CHURCH_BUILDING_NOT_CLERGY_HOUSE_OR_CATHEDRAL_HALL"],
 ["RG-2680C1DA8953","AO-B34-L-GB-D81DD5E3D3A4",50.76611,0.27773,"osm:way:487068951","EASTBOURNE_OUR_LADY_OF_RANSOM_CHURCH_NOT_PRESBYTERY_OR_OTHER_PARISH_CHURCHES"],
 ["RG-223CDB93F8BD","AO-B34-L-GB-2C828CAB9C43",50.73777,-2.82292,"osm:way:258582025","CHIDEOCK_CATHOLIC_MARTYRS_CHURCH_NOT_ANGLICAN_ST_GILES_OR_CHIDEOCK_MANOR"],
 ["RG-02AEBA830666","AO-B34-L-GB-D2A6AB6CE828",51.2557,-2.49561,"osm:way:208920439","DOWNSIDE_ABBEY_CHURCH_NOT_DOWNSIDE_SCHOOL_OR_NEARBY_ANGLICAN_CHURCH"],
 ["RG-3315DA94EE1D","AO-B34-L-GB-29141826F311",52.19876,0.12739,"osm:way:33167535","CAMBRIDGE_OUR_LADY_ENGLISH_MARTYRS_CHURCH_NOT_RECTORY_OR_PARKING"],
 ["RG-142C68DBCDC0","AO-B34-L-GB-A216E1128479",53.04729,-2.99858,"osm:way:399333482","WREXHAM_CATHEDRAL_CHURCH_NOT_GATEWAY_OR_PRESBYTERY"],
];
const refinements=[
 ["RG-02499F036F1D","ao-fssp-herz-jesu-kirche-schwamendingenstr-55-ch-8050-zurich-oerlikon-suisse",47.4068,8.55191,"osm:way:60796258","ZURICH_OERLIKON_HERZ_JESU_CHURCH_NOT_ADJACENT_CHAPEL_OR_CEMETERY"],
 ["RG-00D589BAB16C","ao-fssp-church-of-st-mary-538-broadway-providence-ri-02909-usa",41.81761,-71.4367,"osm:way:314290719","PROVIDENCE_ST_MARY_BROADWAY_CHURCH_BUILDING_NOT_ADJACENT_SCHOOL_OR_PARKING"],
];
for(const [group,id,lat,lng,ref,scope] of [...newlyMapped,...refinements]){
 const row=physical.records.find(r=>r[0]===group);
 assert.ok(row&&row[1].includes(id),"Pin must belong to the exact canonical CL2 physical site: "+group);
 const venue=all.find(x=>x.physical_group_id===group);
 assert.ok(venue&&venue.source_id===id&&venue.source_ids.includes(id),"Source identity was rewritten");
 assert.ok(venue.map_publishable&&venue.map_state==="PROVISIONAL","Reviewed church should be physically mapped");
 assert.equal(venue.geo.lat,lat);assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,ref);assert.equal(venue.geo.source_url,
   "https://www.openstreetmap.org/way/"+ref.split(":")[2]);
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
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:75,SOURCE_PIN:1845,ADDRESS_ONLY:662});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,662);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,73);
// These records appear to describe one Cagliari basilica and require a
// physical-identity reconciliation before either gets a new coordinate.
for(const hold of ["RG-A75D8A0E1C53","RG-B65-77C86C7B3EC4"]){
 const row=all.find(x=>x.physical_group_id===hold);
 assert.ok(row&&!row.map_publishable,"Do not publish competing Santa Croce pins before deduplication");
}
console.log("PASS TLM pin recovery batch 1: six newly mapped churches plus two source-site refinements, 1,920 mapped, 662 list-only, Cagliari duplicate held");
