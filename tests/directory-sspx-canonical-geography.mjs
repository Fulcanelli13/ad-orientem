import assert from "node:assert/strict";
import fs from "node:fs";
import {expandResearchProviderSnapshot} from "../src/find/data-service.js";
import {auditDirectoryGeo,isMapPublishableGeo} from "../src/find/geo-provenance.js";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const root="data/directory/generated/v19/";
const names=[
 "sspx-district-seed","sspx-france-first-party","sspx-france-second-pass",
 "sspx-four-district-bulk","sspx-oct26-europe","sspx-oct26-americas",
 "sspx-oct26-poland","sspx-asia-central-americas","sspx-north-america-20261008",
 "sspx-priority-europe-pacific-20261009","sspx-mexico-completion-20261009",
 "sspx-oct26-followup-65","sspx-global-completion-20261009",
 "sspx-official-route-oct26-20261009"
];
const sources=names.map(stem=>({stem,source:read(root+stem+".v1.json"),geo:read(root+stem+".geo.v1.json")}));
const allRows=sources.flatMap(x=>x.source.records);
const allPins=sources.flatMap(x=>x.geo.records);
const audit=read("data/directory/research/sspx-oct26-canonical-le-laus-and-ten-pins.v1.json");
const v6=read("data/directory/research/sspx-worldwide-210-case-disposition-20261009.v6.json");
const v7=read("data/directory/research/sspx-worldwide-210-case-disposition-20261009.v7.json");
assert.equal(allRows.length,613);
assert.equal(new Set(allRows.map(r=>r.u)).size,613);
assert.equal(allPins.length,401);
assert.equal(new Set(allPins.map(x=>x.venue_id)).size,401);
assert.equal(new Set(allPins.map(x=>x.geo.source_ref)).size,401);
assert.equal(allPins.filter(x=>x.geo.source_ref.startsWith("SSPX:OPE-")).length,336);
assert.ok(allPins.every(x=>isMapPublishableGeo(x.geo,x.geo.matched_country_code)));
assert.ok(allPins.every(x=>auditDirectoryGeo(x.geo,{countryCode:x.geo.matched_country_code}).length===0));
assert.equal(audit.cases.length,10);
assert.equal(audit.new_pins_for_existing_venues,10);
assert.equal(audit.physical_duplicate_venues_removed,1);
assert.equal(audit.new_unpinned,212);
assert.ok(audit.cases.every(x=>x.disposition==="EXISTING_REGISTERED_PHYSICAL_VENUE_GEO_ADDED"&&!x.new_venue_added));
assert.deepEqual(Object.fromEntries(["DE","GB","AU"].map(cc=>[cc,audit.cases.filter(x=>x.country_code===cc).length])),{DE:8,GB:1,AU:1});
for(const item of audit.cases){
 const found=allPins.find(x=>x.geo.source_ref==="SSPX:MAP:"+item.official_map_slug);
 assert.ok(found,"official place slug missing: "+item.official_map_slug);
 assert.equal(found.geo.precision,"address");
 assert.equal(found.geo.geocoding_source,"OFFICIAL_SOURCE");
 assert.equal(found.geo.source_url,item.official_map_page);
 assert.equal(found.geo.lat,item.official_directions_destination.lat);
 assert.equal(found.geo.lng,item.official_directions_destination.lng);
 assert.equal(found.geo.matched_country_code,item.country_code);
 assert.ok(allRows.some(x=>x.u===item.canonical_upstream_id),"not an existing SSPX source row");
}
const canonical=allRows.filter(x=>x.u==="SSPX-LPL-MONTGARDIN-LE-LAUS");
assert.equal(canonical.length,1);
assert.equal(allRows.filter(x=>x.u==="SSPX-SSPXMAP-20261009-FR-LE-LAUS-ND-ROSAIRE").length,0);
const mapped=allPins.filter(x=>x.geo.source_ref==="SSPX:MAP:chapelle-notre-dame-du-rosaire");
assert.equal(mapped.length,1);
assert.equal(mapped[0].venue_id,"ao-research-sspx-france-first-party-sspx-lpl-montgardin-le-laus");
assert.deepEqual([mapped[0].geo.lat,mapped[0].geo.lng],[44.521546,6.1537492]);
const fr=sources.find(x=>x.stem==="sspx-france-first-party");
const projected=expandResearchProviderSnapshot(fr.source,{geoRecords:fr.geo.records});
assert.equal(projected.venues.length,89);
assert.equal(projected.venues.find(x=>x.upstream.upstream_id==="SSPX-LPL-MONTGARDIN-LE-LAUS")?.geo.lat,44.521546);
assert.equal(sources.find(x=>x.stem==="sspx-official-route-oct26-20261009").source.records.length,2);
assert.equal(sources.find(x=>x.stem==="sspx-official-route-oct26-20261009").geo.records.length,2);
assert.equal(v6.fully_adjudicated,163);
assert.equal(v7.cases.length,210);
assert.deepEqual(v7.disposition_counts,{
 PENDING_PLACE_DETAIL_ADJUDICATION:41,
 EXISTING_PHYSICAL_ALIAS:96,
 NEW_VERIFIED_MASS_VENUE:37,
 ADDRESS_CONFLICT_HOLD:6,
 EXISTING_OFFICIAL_CRM_LINK:30
});
assert.equal(v7.fully_adjudicated,163);
assert.equal(v7.pending_total,47);
assert.equal(v7.current_sspx_mass_evidenced_records,613);
assert.equal(v7.current_all_mass_evidenced_records,1211);
assert.equal(v7.current_all_source_records,1448);
assert.equal(v7.official_sspx_map_pins_after_overlay,401);
assert.equal(v7.sspx_source_records_still_without_verified_coordinates,212);
assert.equal(v7.cases.find(x=>x.source_place_id==="chapelle-notre-dame-du-rosaire").status,"EXISTING_PHYSICAL_ALIAS");
assert.equal(v7.cases.reduce((n,x)=>n+x.new_mass_record_count,0),37);
console.log("SSPX canonical venue + pins: PASS — 613 actual source Mass venues, 401 unique official pins, 212 still unpinned, Le Laus deduplicated, 163/210 cases settled");
