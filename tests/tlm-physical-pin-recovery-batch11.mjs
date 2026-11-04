// TLM batch 11 — sixteen GB churches and one source-matched US GNIS church point.
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
const source=readFileSync(new URL("../src/find/cl2-physical-directory.js",import.meta.url),"utf8");
const section=source.split("const REVIEWED_NEW_SITE_PINS=Object.freeze({")[1]?.split("\n});")[0]??"";
const registryKeys=[...section.matchAll(/"(RG-[A-Z0-9-]+)"\s*:\s*Object\.freeze\(\{/g)].map(m=>m[1]);
assert.equal(new Set(registryKeys).size,registryKeys.length,"Duplicate physical-site reviewed keys");
const sites=[
 [
  "RG-B120BF4FF522",
  "AO-B35-L-GB-005F96A13A8C",
  51.51864,
  -0.1074,
  "osm:way:98820374"
 ],
 [
  "RG-F31C337444C6",
  "AO-B35-L-GB-ECEFA40D046D",
  51.51885,
  -0.08566,
  "osm:way:160163212"
 ],
 [
  "RG-9904A71E2034",
  "AO-B35-L-GB-A44F84EAE83F",
  51.49782,
  -0.10793,
  "osm:way:89825007"
 ],
 [
  "RG-EAB24D312157",
  "AO-B34-L-GB-C4BF123A6845",
  52.70534,
  -2.75403,
  "osm:way:114782497"
 ],
 [
  "RG-CD0E66DB0BBA",
  "AO-B35-L-GB-E9CC06D2B227",
  53.9617,
  -1.0847,
  "independent:historicengland-york-st-wilfrid-1257869"
 ],
 [
  "RG-524E16F096DE",
  "AO-B34-L-GB-08FA5E68232A",
  50.9778,
  -0.3247,
  "independent:historicengland-west-grinstead-1391890"
 ],
 [
  "RG-56B7040002F7",
  "AO-B34-L-GB-EEA9C15AEB08",
  50.8023,
  -1.0922,
  "independent:historicengland-st-agatha-landport-1245260"
 ],
 [
  "RG-93691FBCC8E6",
  "AO-B35-L-GB-E4B83FC0EAF5",
  50.82551,
  -0.14957,
  "osm:way:204393292"
 ],
 [
  "RG-CB86A73EAB0B",
  "AO-B35-L-GB-A71DCF593DE0",
  53.74678,
  -0.33896,
  "osm:way:1360985926"
 ],
 [
  "RG-54C91CA99611",
  "AO-B35-L-GB-CD804802B06F",
  50.8725,
  0.00231,
  "osm:way:445806523"
 ],
 [
  "RG-FC9838B6CCBC",
  "AO-B35-L-GB-95140E5F2A5A",
  53.80061,
  -1.54683,
  "osm:way:177863486"
 ],
 [
  "RG-F511E5C3526F",
  "AO-B35-L-GB-A063AAEB339B",
  54.96919,
  -1.61952,
  "independent:visit-a-church-st-mary-newcastle"
 ],
 [
  "RG-C50C8D2FDDF5",
  "AO-B35-L-GB-6E956BBF9E44",
  51.46831,
  -0.26183,
  "osm:way:809938851"
 ],
 [
  "RG-B60E6E637BF3",
  "AO-B35-L-GB-A8F54C957DD2",
  52.05512,
  -2.71693,
  "osm:way:442098032"
 ],
 [
  "RG-B3A6A800FCBF",
  "AO-B35-L-GB-D2CE7FE38082",
  50.76249,
  -1.29918,
  "osm:way:372169221"
 ],
 [
  "RG-7D1A7C253CC7",
  "AO-B34-L-GB-BBF9009D18D0",
  52.30539,
  -1.9316,
  "osm:way:464402914"
 ],
 [
  "RG-B70-42938F917EAE",
  "AO-RSCH-B70-42938F917EAE",
  33.580484,
  -112.329414,
  "independent:topoquest-gnis-our-lady-of-the-sun-el-mirage"
 ]
];
assert.equal(sites.length,17);
assert.equal(new Set(sites.map(x=>x[0])).size,17);
for(const [anchor,id,lat,lng,ref] of sites){
 const frozen=index.records.find(x=>x[0]===anchor);
 assert.ok(frozen?.[1].includes(id),"Immutable physical-site source key required: "+anchor);
 assert.ok(!baseline.some(x=>frozen[1].includes(x.source_id)),
   "R49 source location already mapped; do not duplicate: "+anchor);
 const venue=all.find(x=>x.physical_group_id===anchor);
 assert.ok(venue&&venue.source_id===id&&venue.source_ids.includes(id));
 assert.equal(venue.title,frozen[2]);
 assert.equal(venue.country_code,frozen[3]);
 assert.equal(venue.map_publishable,true);
 assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,lat);
 assert.equal(venue.geo.lng,lng);
 assert.equal(venue.geo.source_ref,ref);
 assert.equal(venue.geo.precision,"site");
 assert.equal(venue.geo.approximate,true);
 assert.ok(venue.geo.source_url.startsWith("https://"));
 assert.ok(venue.geo.review_scope);
 assert.ok(venue.source_links.some(x=>x.url===venue.geo.source_url),"Site source link required: "+anchor);
 assert.ok(venue.source_links.some(x=>frozen[6].includes(x.url)),"Original directory provenance required: "+anchor);
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.equal(venue.sections.length,0);
 assert.equal(venue.actions.length,0);
 assert.ok(!venue.cover_media,"A site position is not a third-party image-rights release");
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language);
  const detail=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(detail.includes('data-tlm-church-profile="'+id+'"'));
  assert.ok(detail.includes("aoTlmProfileSources"));
  assert.doesNotMatch(detail,/data-tlm-celebration-evidence=/);
 }
}
const elMirage=all.find(x=>x.physical_group_id==="RG-B70-42938F917EAE");
assert.equal(elMirage.geo.source_ref,"independent:topoquest-gnis-our-lady-of-the-sun-el-mirage");
assert.match(elMirage.geo.review_scope,/GNIS_CHURCH_POINT_NOT_BUILDING_FOOTPRINT_OR_DOOR_ADDRESS_DISCREPANCY/);
assert.ok(elMirage.facts.some(x=>x.label==="Map position"&&x.value.includes("building outline")));
assert.ok(elMirage.geo.approximate);
const stEtheldreda=all.find(x=>x.physical_group_id==="RG-B120BF4FF522");
assert.equal(stEtheldreda.geo.source_ref,"osm:way:98820374");
assert.ok(stEtheldreda.address.formatted.includes("14 Ely Place"));
const york=all.find(x=>x.physical_group_id==="RG-CD0E66DB0BBA");
assert.match(york.geo.review_scope,/YORK_ST_WILFRID_ORATORY_GRADE_II_CHURCH_SITE_NOT_CONFIRMED_DOORWAY/);
const historicHolds=["RG-B65-77C86C7B3EC4","RG-B66-ACD5E3A16E10","RG-5E751D3AAEFA"];
for(const anchor of historicHolds){
 const held=all.find(x=>x.physical_group_id===anchor);
 assert.ok(held&&!held.map_publishable,"Previously excluded ambiguous/duplicate site must remain unpinned: "+anchor);
}
assert.equal(all.length,2582);
assert.equal(all.filter(x=>x.map_publishable).length,2078);
const counts=tlmSiteEvidenceCounts(all);
assert.deepEqual(counts,{ALL:2582,REVIEWED_PIN:272,SOURCE_PIN:1806,ADDRESS_ONLY:504});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,504);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,272);
console.log("PASS TLM batch 11: 17 exact church identities, 2078 mapped, 504 bilingual holds; no inferred liturgy or image rights");
