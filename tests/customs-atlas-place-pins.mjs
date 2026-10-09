import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isMapPublishablePlaceGeo } from "../src/find/geography-contracts.js";
import { projectTraditionItems } from "../src/find/explore-projection.js";
import { exploreMapFeatures } from "../src/find/map-runtime.js";

const read=path=>JSON.parse(readFileSync(path,"utf8"));
const geography=read("data/geography/seed-registry.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const customSources=read("data/customs/source-registry.v1.json");
const bridge=read("data/customs/novena-context-links.v1.json");
const novenas=read("data/pray/novena-sot.v1.json");
const evidence=read("data/geography/customs-atlas-place-geo-evidence.2026-10-09.json");
const places=new Map(geography.places.map(place=>[place.place_id,place]));
const published=geography.places.filter(place=>isMapPublishablePlaceGeo(place.geo,place.address?.country_code));
assert.equal(published.length,113,"84 shared places must have publishable geo, including indicative Russell");
assert.equal(evidence.records.length,58,"58 source-attributed coordinate promotions required");
assert.equal(new Set(evidence.records.map(e=>e.place_id)).size,evidence.records.length,"duplicate GPS provenance");
for(const record of evidence.records){
  const place=places.get(record.place_id);
  assert.ok(place,"evidence points to unknown canonical Place: "+record.place_id);
  assert.ok(isMapPublishablePlaceGeo(place.geo,place.address?.country_code),place.place_id+" has unpublishable GPS");
  assert.equal(place.geo.lat,record.lat,place.place_id+" latitude deviated from evidence");
  assert.equal(place.geo.lng,record.lng,place.place_id+" longitude deviated from evidence");
  assert.equal(place.geo.source_url,record.source_url,place.place_id+" lost coordinate source link");
  assert.equal(place.geo.source_ref,record.source_ref,place.place_id+" lost coordinate provenance ref");
  assert.ok(/^https:\/\//.test(record.source_url),record.place_id+" requires direct URL");
  if(place.geo.geocoding_source==="OSM")assert.match(place.geo.attribution,/OpenStreetMap/);
}
const traditions=projectTraditionItems({
  customs:customs.customs,attestations:customs.attestations,
  places:geography.places,geoAreas:geography.geoAreas,sources:customSources.sources,
  novenaLinks:bridge.links,novenas:novenas.novenas,
});
const exact=traditions.filter(x=>x.raw.attestation.map_policy==="PLACE");
const mapped=exact.filter(item=>item.map_publishable);
assert.equal(exact.length,58,"exact geographical custom attestations changed");
assert.equal(mapped.length,58,"Customs Atlas must map all 58 site-specific attestations");
assert.equal(exploreMapFeatures(mapped).length,58,"MapLibre feature projection lost an attestation pin");
assert.ok(traditions.filter(item=>item.raw.attestation.map_policy==="AREA_CONTEXT").every(item=>!item.map_publishable),
  "regional/cultural custom was falsely pinned to a random central point");
assert.deepEqual(exact.filter(item=>!item.map_publishable).map(item=>item.place_id).sort(),[],"every exact-site custom must now have an indicative or site-specific map point");
const chanel=places.get("place:NZ:st-peter-chanel-russell");
assert.equal(chanel.geo.indicative_only,true,"Russell must not be shown as exact-site geocoding");
assert.equal(chanel.geo.precision,"locality");
assert.equal(chanel.geo.source_ref,"NEARBY_RUSSELL_SCHOOL_BAKER_ST_NOT_SHRINE");
assert.equal(chanel.geo.lat,-35.262172);
assert.equal(chanel.geo.lng,174.123766);
const chanelItem=exact.find(item=>item.place_id===chanel.place_id);
assert.equal(chanelItem.geo.indicative_only,true);
const chanelFeature=exploreMapFeatures([chanelItem])[0];
assert.equal(chanelFeature.properties.approximate,true);
assert.equal(chanelFeature.properties.indicative_only,true);
assert.equal(traditions.filter(item=>item.raw.attestation.map_policy==="AREA_CONTEXT"&&item.map_publishable).length,0);
// Independently decode the full Open Location Code recovered from the shrine-affiliated
// Ugwogo Nike contact address; never silently substitute the conflicting WorldPlaces pin.
const charset="23456789CFGHJMPQRVWX", digits="6FR9JH95+W9J".replace("+","");
let derivedLat=-90,derivedLng=-180;
for(let i=0;i<8;i+=2){
  const resolution=[20,1,0.05,0.0025][i/2];
  derivedLat+=charset.indexOf(digits[i])*resolution;
  derivedLng+=charset.indexOf(digits[i+1])*resolution;
}
let cellLat=0.0025,cellLng=0.0025;
for(let i=8;i<digits.length;i++){
  const n=charset.indexOf(digits[i]);
  cellLat/=5;cellLng/=4;
  derivedLat+=Math.floor(n/4)*cellLat;
  derivedLng+=(n%4)*cellLng;
}
const shrine=places.get("place:NG:ugwogo-nike-national-marian-shrine");
assert.equal(shrine.geo.lat,Math.round((derivedLat+cellLat/2)*1e8)/1e8);
assert.equal(shrine.geo.lng,Math.round((derivedLng+cellLng/2)*1e8)/1e8);
assert.equal(shrine.geo.source_ref,"OLC:6FR9JH95+W9J");
assert.equal(shrine.geo.precision,"complex_anchor");
console.log("PASS 112 geocoded shared Places, 58/58 customs site markers, Russell indicative locality label, Plus Code proof");
