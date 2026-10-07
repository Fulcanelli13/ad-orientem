import fs from "node:fs";
import assert from "node:assert/strict";
import {
  EXPLORE_GEOGRAPHY_SCHEMA,
  auditDirectoryPlaceLink,
  auditGeoArea,
  auditPlace,
  auditPlaceGeo,
  isMapPublishablePlaceGeo,
  assertExploreGeographyRegistry,
} from "../src/find/geography-contracts.js";

function readJson(relative) {
  return JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), "utf8"));
}

const contract = readJson("../data/geography/geography-contract.v1.json");
const seed = readJson("../data/geography/seed-registry.v1.json");

assert.equal(contract.schema, EXPLORE_GEOGRAPHY_SCHEMA);
assert.equal(contract.version, "1.0.0");
assert.ok(contract.invariants.some(value => /proximity/i.test(value)));
assert.ok(contract.invariants.some(value => /Directory venue/i.test(value)));

for (const area of seed.geoAreas) {
  assert.equal(auditGeoArea(area).length, 0, area.geo_area_id);
}
assert.deepEqual(
  seed.geoAreas.filter(area => area.area_type === "country").map(area => area.codes.iso_alpha2),
  ["FR", "IE", "MU"],
);

const culturalScope = seed.geoAreas.find(area => area.geo_area_id === "geo:culture:french-catholic-world");
assert.ok(culturalScope);
assert.equal(auditGeoArea(culturalScope).length, 0);

for (const place of seed.places) {
  assert.equal(auditPlace(place).length, 0, place.place_id);
  const publishable=isMapPublishablePlaceGeo(place.geo, place.address?.country_code);
  if(place.geo?.lat!==null&&place.geo?.lat!==undefined){
    assert.equal(publishable,true,place.place_id+" geo is not publishable");
  }else{
    assert.equal(publishable,false,place.place_id+" unexpectedly published address-only geo");
    assert.ok(place.address?.city||place.address?.formatted,place.place_id+" address-only Place lost usable address");
  }
}
assert.deepEqual(
  seed.places.map(place => place.place_id).sort(),
  [
    "place:FR:sanctuaire-notre-dame-de-laghet",
    "place:FR:sanctuaire-notre-dame-de-lourdes",
    "place:FR:sanctuaire-sacre-coeur-paray",
    "place:FR:chartres-notre-dame",
    "place:FR:sainte-anne-d-auray",
    "place:IE:knock-shrine",
    "place:IE:lough-derg-station-island",
    "place:MU:pere-laval-sainte-croix",
  ].sort(),
);

const chartres = {
  place_id: "place:FR:test-chartres",
  name: { official: "Cathédrale Notre-Dame de Chartres", aliases: ["Chartres Cathedral"] },
  place_type: "cathedral",
  geo_area_ids: ["geo:country:FR"],
  mappable: true,
  geo: {
    lat: 48.4479, lng: 1.4878, precision: "site", geocoding_source: "OFFICIAL_SOURCE",
    source_url: "https://example.org/chartres", source_ref: "SRC_TEST:geo",
    matched_country_code: "FR", verified_at: "2026-10-07"
  },
  address: { city: "Chartres", country_code: "FR" },
};
assert.equal(auditPlace(chartres).length, 0);

const unprovenanced = structuredClone(chartres);
unprovenanced.place_id = "place:FR:unprovenanced";
unprovenanced.geo = { lat: 48.4479, lng: 1.4878 };
assert.ok(auditPlaceGeo(unprovenanced.geo,{countryCode:"FR"}).some(item => item.code === "INVALID_PLACE_GEO_PRECISION"));
assert.ok(auditPlace(unprovenanced).some(item => item.code === "MISSING_PLACE_GEO_PROVENANCE"));

const wrongCountry = structuredClone(chartres);
wrongCountry.place_id = "place:FR:wrong-country";
wrongCountry.geo.matched_country_code = "BE";
assert.ok(auditPlace(wrongCountry).some(item => item.code === "PLACE_GEO_COUNTRY_MISMATCH"));

const unlocated = structuredClone(chartres);
unlocated.place_id = "place:FR:unlocated";
unlocated.geo = { lat: null, lng: null };
unlocated.address = {};
assert.ok(auditPlace(unlocated).some(item => item.code === "MISSING_PLACE_LOCATION"));

const confirmedLink = {
  link_id: "link:directory-place:test-chartres",
  venue_id: "ao-test-chartres-venue",
  place_id: chartres.place_id,
  relationship: "LOCATED_AT",
  confidence: "CONFIRMED",
  source_ids: ["SRC_TEST"],
};
assert.equal(auditDirectoryPlaceLink(confirmedLink).length, 0);

const identityCollapse = { ...confirmedLink, identity_equivalent: true };
assert.ok(auditDirectoryPlaceLink(identityCollapse).some(item => item.code === "VENUE_PLACE_IDENTITY_COLLAPSE"));

const noSourceLink = { ...confirmedLink, source_ids: [] };
assert.ok(auditDirectoryPlaceLink(noSourceLink).some(item => item.code === "MISSING_LINK_PROVENANCE"));

const registry = {
  geoAreas: seed.geoAreas,
  places: [...seed.places, chartres],
  directoryPlaceLinks: [confirmedLink],
};
assert.deepEqual(assertExploreGeographyRegistry(registry).counts, {
  geoAreas: 5,
  places: 9,
  directoryPlaceLinks: 1,
});

const badParent = structuredClone(registry);
badParent.geoAreas.push({
  geo_area_id: "geo:civil:test-region",
  name: { official: "Test Region", aliases: [] },
  area_system: "CIVIL",
  area_type: "admin1",
  parent_geo_area_ids: ["geo:country:ZZ"],
  mappable: true,
  codes: {},
});
assert.throws(
  () => assertExploreGeographyRegistry(badParent),
  error => error?.issues?.some(item => item.code === "UNKNOWN_PARENT_GEO_AREA"),
);

console.log("explore geography/place source-of-truth: PASS");
