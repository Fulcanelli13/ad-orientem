import assert from "node:assert/strict";
import {
  candidateQueries,selectCachedGeo,reconcileGeoCollisions,
  planWorldwideCacheReuse,
} from "../tools/directory/build-worldwide-geocode-overlays.mjs";
import {isMapPublishableGeo} from "../src/find/geo-provenance.js";
const venue={venue_id:"ao-research-test",name:{official:"Église Saint-Joseph"},
  address:{formatted:"12 rue Saint-Joseph, 75002 Paris",city:"Paris",country_code:"FR"}};
const osm={lat:"48.867",lon:"2.343",
  display_name:"Église Saint-Joseph, Rue Saint-Joseph, Paris, 75002, France",
  name:"Église Saint-Joseph",type:"place_of_worship",category:"amenity",
  osm_type:"way",osm_id:123,
  address:{house_number:"12",road:"Rue Saint-Joseph",postcode:"75002",
    city:"Paris",country_code:"fr"}};
const key=candidateQueries(venue)[0].key;
const cache={[key]:{results:[osm],fetched_at:"2026-10-07T12:00:00Z"}};
const selected=selectCachedGeo(venue,cache);
assert.ok(selected);
assert.equal(isMapPublishableGeo(selected.geo,"FR"),true);
assert.equal(selected.geo.source_ref,"osm:way:123");
assert.ok(!selectCachedGeo(venue,{[key]:{results:[{
  ...osm,address:{...osm.address,country_code:"be"}
}]}}));
const first={venue_id:"church-a",provider:"A",country_code:"FR",
  address:"12 rue Saint-Joseph, 75002 Paris",geo:selected.geo};
const equivalent={...first,venue_id:"church-b",provider:"B"};
const other={...first,venue_id:"church-c",address:"87 rue Marie, Lyon"};
const result=reconcileGeoCollisions([equivalent,other],[first]);
assert.equal(result.accepted.length,1);
assert.equal(result.holds.length,1);
assert.equal(result.holds[0].reason,"OSM_OBJECT_REUSED_FOR_DIFFERENT_SOURCE_ADDRESSES");
assert.ok(candidateQueries(venue).length>=2);
const report=(await planWorldwideCacheReuse()).summary;
assert.equal(report.schema,"AO_DIRECTORY_WORLDWIDE_GEO_CACHE_REUSE_V1");
assert.equal(report.mode,"OFFLINE_CACHED_EVIDENCE_ONLY");
assert.equal(report.network_requests,0);
assert.equal(report.source_snapshot_count,23);
assert.equal(report.records_examined,1001);
assert.ok(report.already_mappable>=90);
assert.equal(report.total_map_eligible,report.already_mappable+report.accepted_from_cache);
assert.ok(report.providers.every(p=>p.source_records>=1));
assert.equal(report.unresolved,report.unresolved_records.length);
console.log("Worldwide geocode cache reuse: PASS — "+
  report.records_examined+" research venues, "+
  report.already_mappable+" existing mapped, "+
  report.accepted_from_cache+" newly reusable OSM matches, "+
  report.collision_holds+" collision holds, zero web requests");
