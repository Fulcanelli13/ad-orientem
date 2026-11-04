// Nine new, independently reviewed physical-site pins. 23 other PR #2394 records were already present on main.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts} from "../src/find/preliminary-directory-r49.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS} from "../src/find/cl2-illustrative-locality-pins.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const index=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const baseline=projectPublishedProvisionalMassSites(projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(baseline,index);
const sites=[
  {
    "anchor": "RG-A164E7D0C229",
    "sourceId": "AO-B34-L-GB-949D1186DE89",
    "country": "GB",
    "lat": 52.13603,
    "lng": -0.47364,
    "sourceRef": "osm:way:46491193",
    "sourceUrl": "https://www.openstreetmap.org/way/46491193",
    "reviewScope": "REVIEWED_CATHOLIC_CHURCH_SITE_NOT_VISITOR_ENTRANCE",
    "evidence": [
      "https://mapcarta.com/W46491193",
      "https://www.stjosephsbedford.org/a-brief-history-of-your-churches/"
    ]
  },
  {
    "anchor": "RG-ABBC659D0388",
    "sourceId": "AO-B34-L-GB-FDC98808D553",
    "country": "GB",
    "lat": 51.92858,
    "lng": -1.72174,
    "sourceRef": "osm:way:637157133",
    "sourceUrl": "https://www.openstreetmap.org/way/637157133",
    "reviewScope": "REVIEWED_CATHOLIC_CHURCH_SITE_NOT_VISITOR_ENTRANCE",
    "evidence": [
      "https://mapcarta.com/W637157133",
      "https://www.stow-bourtoncatholic.net/"
    ]
  },
  {
    "anchor": "RG-D7C8B7693CEC",
    "sourceId": "AO-B34-L-GB-DA44176FA42F",
    "country": "GB",
    "lat": 54.6395,
    "lng": -3.543,
    "sourceRef": "historicengland:1257412",
    "sourceUrl": "https://gb.britishlistedbuildings.co.uk/101257412-the-church-of-our-lady-and-st-michael-attached-steps-walls-gates-and-gatepiers-workington/maps",
    "reviewScope": "REVIEWED_CATHOLIC_CHURCH_SITE_NOT_VISITOR_ENTRANCE",
    "evidence": [
      "https://gb.britishlistedbuildings.co.uk/101257412-the-church-of-our-lady-and-st-michael-attached-steps-walls-gates-and-gatepiers-workington/maps",
      "https://casework.jcnas.org.uk/case/64743"
    ]
  },
  {
    "anchor": "RG-605CC195A1EF",
    "sourceId": "AO-B34-L-GB-D03817F48CAA",
    "country": "GB",
    "lat": 51.49219,
    "lng": -0.26112,
    "sourceRef": "osm:way:840980021",
    "sourceUrl": "https://www.openstreetmap.org/way/840980021",
    "reviewScope": "REVIEWED_CATHOLIC_CHURCH_SITE_NOT_VISITOR_ENTRANCE",
    "evidence": [
      "https://mapcarta.com/W840980021",
      "https://gb.britishlistedbuildings.co.uk/101096073-our-lady-of-grace-and-st-edward-roman-catholic-church-turnham-green-ward/maps"
    ]
  },
  {
    "anchor": "RG-B10417F7A69D",
    "sourceId": "AO-B34-L-GB-89ABBD85057C",
    "country": "GB",
    "lat": 51.77404,
    "lng": -0.99397,
    "sourceRef": "osm:node:1591394617",
    "sourceUrl": "https://www.openstreetmap.org/node/1591394617",
    "reviewScope": "REVIEWED_NAMED_OSM_POI_NOT_BUILDING_FOOTPRINT_ENTRANCE_UNVERIFIED",
    "evidence": [
      "https://mapcarta.com/N1591394617",
      "https://taking-stock.org.uk/building/long-crendon-our-lady-of-light/"
    ]
  },
  {
    "anchor": "RG-5B65864A842D",
    "sourceId": "AO-B34-L-GB-5B089A6D5EE8",
    "country": "GB",
    "lat": 51.71597,
    "lng": 0.47555,
    "sourceRef": "osm:way:264465868",
    "sourceUrl": "https://www.openstreetmap.org/way/264465868",
    "reviewScope": "REVIEWED_CATHOLIC_CHURCH_SITE_NOT_VISITOR_ENTRANCE",
    "evidence": [
      "https://mapcarta.com/W264465868",
      "https://www.chelmsfordcatholic.co.uk/our-parish/holy-name-church"
    ]
  },
  {
    "anchor": "RG-A504818C84DC",
    "sourceId": "AO-B34-L-GB-CDF21516456F",
    "country": "GB",
    "lat": 51.4679,
    "lng": -0.9669,
    "sourceRef": "independent:pilgrimmap-reading-our-lady-anne",
    "sourceUrl": "https://www.pilgrimmap.com/site/our-lady-and-st-annes-church-6ee1840d",
    "reviewScope": "REVIEWED_NAMED_OSM_POI_NOT_BUILDING_FOOTPRINT_ENTRANCE_UNVERIFIED",
    "evidence": [
      "https://www.pilgrimmap.com/site/our-lady-and-st-annes-church-6ee1840d",
      "https://www.ourladyandstanne.org.uk/key-contacts/google-maps-link/"
    ]
  },
  {
    "anchor": "RG-50BE1A7B5F18",
    "sourceId": "AO-B50-SSPV-US-869D6AA28FC",
    "country": "US",
    "lat": 46.58577,
    "lng": -112.02583,
    "sourceRef": "usgs:gnis:1789126",
    "sourceUrl": "https://topoquest.com/map/usgs-24k/montana/helena/20019",
    "reviewScope": "HELENA_GNIS_CHURCH_POINT_NOT_BUILDING_FOOTPRINT_ENTRANCE_UNVERIFIED",
    "evidence": [
      "https://topoquest.com/map/usgs-24k/montana/helena/20019",
      "https://www.ihm-church.org/mass-locations/holy-cross-church.html"
    ]
  },
  {
    "anchor": "RG-8EC1B37099D3",
    "sourceId": "AO-B35-L-GB-F2E7F260D293",
    "country": "GB",
    "lat": 51.45707,
    "lng": -0.96526,
    "sourceRef": "osm:way:96173957",
    "sourceUrl": "https://www.openstreetmap.org/way/96173957",
    "reviewScope": "REVIEWED_CATHOLIC_CHURCH_SITE_NOT_VISITOR_ENTRANCE",
    "evidence": [
      "https://mapcarta.com/W96173957",
      "https://www.ordinariate.org.uk/missions/reading"
    ]
  }
];
assert.equal(sites.length,9);
assert.equal(new Set(sites.map(x=>x.anchor)).size,9);
assert.equal(new Set(sites.map(x=>x.sourceRef)).size,9);
for(const s of sites){
 const frozen=index.records.find(x=>x[0]===s.anchor);
 assert.ok(frozen?.[1].includes(s.sourceId),"Frozen CL2 source identity: "+s.anchor);
 assert.equal(frozen[3],s.country);
 assert.ok(!baseline.some(x=>frozen[1].includes(x.source_id)),"Do not duplicate baseline R49 site: "+s.anchor);
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[s.anchor],"Precise site must not collide with illustrative locality: "+s.anchor);
 const venue=all.find(x=>x.physical_group_id===s.anchor);
 assert.ok(venue&&venue.source_id===s.sourceId&&venue.source_ids.includes(s.sourceId));
 assert.equal(venue.title,frozen[2]);
 assert.equal(venue.country_code,s.country);
 assert.equal(venue.map_publishable,true);
 assert.equal(venue.map_state,"PROVISIONAL");
 assert.equal(venue.geo.lat,s.lat);
 assert.equal(venue.geo.lng,s.lng);
 assert.equal(venue.geo.source_ref,s.sourceRef);
 assert.equal(venue.geo.source_url,s.sourceUrl);
 assert.equal(venue.geo.precision,"site");
 assert.equal(venue.geo.approximate,true);
 assert.equal(venue.geo.review_scope,s.reviewScope);
 assert.ok(venue.source_links.some(x=>x.url===s.sourceUrl));
 for(const url of s.evidence)assert.ok(venue.source_links.some(x=>x.url===url),"Independent geo evidence: "+url);
 assert.ok(venue.source_links.some(x=>frozen[6].includes(x.url)),"Original directory source kept: "+s.anchor);
 assert.equal(venue.status,"RESEARCH-LISTED · MASS UNVERIFIED");
 assert.equal(venue.celebration_evidence,undefined);
 assert.equal(venue.sections.length,0);
 assert.equal(venue.actions.length,0);
 assert.ok(!venue.cover_media,"No image licence inferred");
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language);
  const profile=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(profile.includes('data-tlm-church-profile="'+s.sourceId+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.doesNotMatch(profile,/data-tlm-celebration-evidence=/);
 }
}
for(const anchor of ["RG-72909EA31C02","RG-B70-6CCD0C36B97D","RG-50082C65DA56","RG-8DE39E8E9415","RG-B66-ACD5E3A16E10","RG-18E53EDD9E9C"]){
 const held=all.find(x=>x.physical_group_id===anchor);
 assert.ok(held&&!held.map_publishable,"Historical identity/duplicate hold must remain unpinned: "+anchor);
}
assert.equal(all.length,2582);
assert.equal(all.filter(x=>x.map_publishable).length,2314);
assert.deepEqual(tlmSiteEvidenceCounts(all),{ALL:2582,REVIEWED_PIN:508,SOURCE_PIN:1806,ADDRESS_ONLY:268});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,268);
assert.equal(filterPreliminaryR49(all,{siteEvidence:"REVIEWED_PIN"}).length,508);
console.log("PASS TLM nine site-pin reconciliation: 9 newly mapped, 23 already canonical, 2314 mapped, 268 address-only, 6 holds preserved");
