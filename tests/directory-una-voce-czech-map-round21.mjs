import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords,RESEARCH_PROVIDERS} from "../src/find/data-service.js";
import {isMapPublishableGeo,isApproximateDirectoryGeo} from "../src/find/geo-provenance.js";

const base="data/directory/generated/v19/una-voce-czech-round20-20261010";
const snapshot=JSON.parse(readFileSync(base+".v1.json","utf8"));
const overlay=JSON.parse(readFileSync(base+".geo.v1.json","utf8"));
assert.equal(overlay.schema,"AO_DIRECTORY_RESEARCH_GEO_OVERLAY_V1");
assert.equal(overlay.provider,snapshot.provider);
assert.equal(snapshot.records.length,16);
assert.equal(overlay.records.length,16);
const loader=RESEARCH_PROVIDERS.find(x=>x.file==="una-voce-czech-round20-20261010.v1.json");
assert.ok(loader,"The Czech source provider is absent from the Find loader");
assert.equal(loader.geoFile,"una-voce-czech-round20-20261010.geo.v1.json");
const unique=new Set();
for(const row of overlay.records){
 assert.ok(!unique.has(row.venue_id),"Duplicate venue in geo overlay");
 unique.add(row.venue_id);
 const g=row.geo;
 assert.ok(g.source_ref.startsWith("uvcz-source-map:UVCZ-R20-"));
 assert.equal(g.source_method,"EXPLICIT_VENUE_PAGE_OPENSTREETMAP_EMBED_MARKER");
 assert.equal(g.geocoding_source,"OTHER","Association markers must not masquerade as Nominatim geocoding");
 assert.equal(g.precision,"street","Association markers must not be described as surveyed building entrances");
 assert.equal(g.matched_country_code,"CZ");
 assert.equal(g.approximate,true);
 assert.ok(g.source_url.startsWith("https://www.unavoce.cz/kostely/"));
 assert.ok(g.attribution.includes("OpenStreetMap"));
 assert.ok(isMapPublishableGeo(g,"CZ"),"An explicit source point failed map-release gate");
 assert.ok(isApproximateDirectoryGeo(g),"Map users must see approximate precision");
}
assert.ok(snapshot.records.every(r=>r.b==="UNKNOWN"),
 "Geocoding must not accidentally upgrade the liturgical book year");
const expanded=expandResearchProviderSnapshot(snapshot,{geoRecords:overlay.records});
assert.equal(expanded.venues.length,16);
assert.equal(expanded.venues.filter(v=>isMapPublishableGeo(v.geo,v.address.country_code)).length,16);
const visible=publishableDirectoryRecords(joinDirectoryRecords(expanded));
assert.equal(visible.length,16);
assert.equal(visible.filter(r=>isMapPublishableGeo(r.venue.geo,r.venue.address.country_code)).length,16);
assert.ok(visible.every(r=>r.ministries[0].schedules[0].payload.rules.timezone==="Europe/Prague"),
 "Geocoding displaced source schedule exceptions");
const byUpstream=new Map(visible.map(r=>[r.venue.upstream.upstream_id,r.venue.geo]));
assert.deepEqual([byUpstream.get("UVCZ-R20-PRAHA-EMAUZY").lat,byUpstream.get("UVCZ-R20-PRAHA-EMAUZY").lng],
 [50.072148,14.4172742]);
assert.deepEqual([byUpstream.get("UVCZ-R20-SLEZSKA-OSTRAVA-ST-JOSEPH").lat,byUpstream.get("UVCZ-R20-SLEZSKA-OSTRAVA-ST-JOSEPH").lng],
 [49.8319019,18.3041021]);
console.log("Czech venue-map overlay: PASS — 16 explicit Una Voce OSM markers, approximate precision, traceable sources and untouched Mass schedules");
