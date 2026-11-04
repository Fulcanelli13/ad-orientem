// TLM Atlas: final geographic backlog, batch 2. All six location upgrades
// refer to named church/monastery buildings, never nearby schools,
// presbyteries, town centres, generic Catholic names or assumed TLM use.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts}
  from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const cl2=validateCL2PhysicalIndex(load("data/directory/generated/cl2-physical-site-index.v1.json"));
const r49=projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json"));
const before=projectPublishedProvisionalMassSites(r49,load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(before,cl2);
const sites=[
 ["RG-02BA9EEBB29C","AO-B34-L-GB-2C52DE470558",51.7448,-1.2554,"historicengland:1466650",
   "OXFORD_HOLY_ROOD_CATHOLIC_CHURCH_NOT_WOODEATON_HOLY_ROOD_OR_GRANDPONT_HOUSE","Abingdon Road"],
 ["RG-07524D929C5D","AO-B35-L-GB-BF9A4860B481",51.2018,-2.17244,"osm:way:979429131",
   "WARMINSTER_ST_GEORGES_CATHOLIC_CHURCH_NOT_ANGLICAN_ST_JOHNS","31 Boreham Road"],
 ["RG-0940B7AED4FC","AO-B34-L-GB-780A2E117C3F",53.38846,-3.04912,"osm:way:233136009",
   "BIRKENHEAD_CARMELITE_MONASTERY_COMPOUND_NOT_NEARBY_ST_ANSELMS_COLLEGE_CHAPEL_ENTRANCE_UNCONFIRMED","12 Grosvenor Place"],
 ["RG-10BAB9521232","AO-B34-L-GB-D7DA8CC0BE16",51.40088,0.49943,"osm:way:118090379",
   "STROOD_ENGLISH_MARTYRS_CHURCH_NOT_ADJACENT_CATHOLIC_PRIMARY_SCHOOL","37 Frindsbury Road"],
 ["RG-10C584FEFB23","AO-B35-L-GB-B7094F409C01",54.7746,-1.56948,"osm:way:221993813",
   "DURHAM_CATHOLIC_ST_CUTHBERT_OLD_ELVET_NOT_ANGLICAN_ST_CUTHBERT_WESTERN_HILL_OR_PRESBYTERY","Old Elvet"],
 ["RG-136CD7964432","AO-B34-L-GB-06C183FA5381",51.98404,-0.18345,"osm:way:148606792",
   "BALDOCK_HOLY_TRINITY_ST_AUGUSTINE_CATHOLIC_CHURCH_NOT_ADJACENT_SCHOOL","London Road"],
];
for(const [group,id,lat,lng,sourceRef,scope,addressNeedle] of sites){
 const source=cl2.records.find(x=>x[0]===group);
 assert.ok(source&&source[1].length===1&&source[1][0]===id,
  "Site must belong to the unique frozen canonical source ID: "+group);
 assert.ok(!before.some(x=>x.source_id===id),"Site must not already have a separate R49 pin");
 const venue=all.find(x=>x.physical_group_id===group);
 assert.ok(venue&&venue.source_id===id&&venue.source_ids.includes(id));
 assert.equal(venue.map_publishable,true);
 assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,lat);assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,sourceRef);
 const geoUrl=sourceRef.startsWith("osm:way:")?
  "https://www.openstreetmap.org/way/"+sourceRef.split(":")[2]:
  "https://historicengland.org.uk/listing/the-list/list-entry/1466650";
 assert.equal(venue.geo.source_url,geoUrl);
 assert.equal(venue.geo.review_scope,scope);
 assert.equal(venue.geo.approximate,true);
 assert.equal(venue.geo.precision,"site");
 assert.ok(venue.address.formatted.includes(addressNeedle),"Exact building address lost: "+group);
 assert.ok(venue.source_links.some(x=>x.url===source[6][0]),"Original frozen directory provenance lost");
 assert.ok(venue.source_links.some(x=>x.url===geoUrl),"Reviewed geometry provenance lost");
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.ok(!venue.cover_media,"A building pin must not automatically authorize an image");
 assert.equal(venue.sections.length,0);assert.equal(venue.actions.length,0);
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language);
  const profile=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+id+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/);
 }
}
// Batch 9 independently matched Fisher House to a named chaplaincy building,
// rather than using Cambridge locality alone. Tyburn is a reviewed convent/shrine
// campus, NOT an authenticated interior chapel entrance.
const fisher=all.find(x=>x.physical_group_id==="RG-1406AE6DA1E7");
assert.ok(fisher?.map_publishable&&fisher.map_state==="PROVISIONAL");
assert.equal(fisher.geo.source_ref,"osm:way:137152224");
assert.equal(fisher.geo.lat,52.2046);assert.equal(fisher.geo.lng,0.12022);
assert.ok(fisher.source_links.some(x=>x.url==="https://fisherhouse.org.uk/contact"));
assert.equal(fisher.status,"RESEARCH-LISTED · MASS UNVERIFIED");
const tyburn=all.find(x=>x.physical_group_id==="RG-16B82EFF8821");
assert.ok(tyburn?.map_publishable&&tyburn.map_state==="PROVISIONAL");
assert.equal(tyburn.geo.source_ref,"independent:geograph-tyburn-convent");
assert.equal(tyburn.geo.lat,51.51307);assert.equal(tyburn.geo.lng,-0.16243);
assert.ok(tyburn.facts.some(x=>x.label==="Map position"&&x.value.includes("religious campus")));
assert.equal(tyburn.status,"RESEARCH-LISTED · MASS UNVERIFIED");
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:602,SOURCE_PIN:1806,ADDRESS_ONLY:174});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,174);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,602);
console.log("PASS TLM site recovery batch 2: 6 exact identity-locked GB pins, 2408 mapped, 174 address-only, no inferred liturgy or media");
