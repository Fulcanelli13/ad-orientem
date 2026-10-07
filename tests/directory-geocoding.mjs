import assert from "node:assert/strict";
import { auditVenue } from "../src/find/contracts.js";
import {
  auditDirectoryGeo,
  directoryGeoLabel,
  isApproximateDirectoryGeo,
  isMapPublishableGeo,
} from "../src/find/geo-provenance.js";
import { directoryMapFeatures } from "../src/find/map-runtime.js";
import {
  addressLooksLocalityOnly,
  buildDirectoryAddressOnlyQuery,
  buildDirectoryGeocodeQuery,
  cleanDirectoryAddress,
  classifyNominatimPrecision,
  geocodeCacheKey,
  nominatimGeoFromSelection,
  scoreNominatimCandidate,
  selectNominatimCandidate,
} from "../tools/directory/lib/geocode-utils.mjs";

const validGeo={
  lat:48.8566,lng:2.3522,precision:"building",geocoding_source:"OSM_NOMINATIM",
  source_url:"https://nominatim.openstreetmap.org/",source_ref:"osm:way:123",
  matched_country_code:"FR",geocoded_at:"2026-10-07T10:00:00Z",
  attribution:"© OpenStreetMap contributors, ODbL 1.0",match_score:0.91,query_fingerprint:"abc",
};
assert.deepEqual(auditDirectoryGeo(validGeo,{countryCode:"FR"}),[]);
assert.equal(isMapPublishableGeo(validGeo,"FR"),true);
assert.equal(isApproximateDirectoryGeo(validGeo),false);
assert.equal(directoryGeoLabel(validGeo,{language:"fr"}),"Bâtiment cartographié");

const mismatch={...validGeo,matched_country_code:"BE"};
assert.ok(auditDirectoryGeo(mismatch,{countryCode:"FR"}).some(x=>x.code==="GEO_COUNTRY_MISMATCH"));
assert.equal(isMapPublishableGeo(mismatch,"FR"),false);
assert.ok(auditDirectoryGeo({...validGeo,precision:"unknown"},{countryCode:"FR"}).some(x=>x.code==="UNKNOWN_GEO_PRECISION"));

const venue={
  venue_id:"ao-test",
  name:{official:"Église Saint-Joseph",alternate:[]},
  address:{formatted:"12 rue Saint-Joseph, 75002 Paris, Contact: example",city:"Paris",country_code:"FR"},
  geo:validGeo,
};
assert.equal(auditVenue(venue).length,0);
assert.equal(cleanDirectoryAddress(venue.address.formatted),"12 rue Saint-Joseph, 75002 Paris");
assert.match(buildDirectoryGeocodeQuery(venue),/Église Saint-Joseph/);
assert.match(buildDirectoryGeocodeQuery(venue),/75002 Paris/);
assert.equal(buildDirectoryAddressOnlyQuery(venue),"12 rue Saint-Joseph, 75002 Paris");
assert.equal(cleanDirectoryAddress("Rue des Minimes 62 - B-1000 Bruxelles - Belgique"),"Rue des Minimes 62, 1000 Bruxelles, Belgique");
assert.equal(cleanDirectoryAddress("St. Mary's Oratory, 325 Grand Avenue, Wausau, Wisconsin 54403, Mailing Address: P.O. Box 1"),"St. Mary's Oratory, 325 Grand Avenue, Wausau, Wisconsin 54403");
assert.equal(cleanDirectoryAddress("PO Box 917 - Petersham NSW 2049 - Australia"),"Petersham NSW 2049, Australia");
assert.equal(addressLooksLocalityOnly({address:{formatted:"Rome"}}),true);
assert.equal(addressLooksLocalityOnly({address:{formatted:"1 Via Roma, Rome"}}),false);
assert.equal(geocodeCacheKey({query:"Rome",countryCode:"IT"}),geocodeCacheKey({query:"Rome",countryCode:"IT"}));

const buildingCandidate={
  lat:"48.867",lon:"2.343",display_name:"Église Saint-Joseph, Rue Saint-Joseph, Paris, 75002, France",
  name:"Église Saint-Joseph",addresstype:"place_of_worship",type:"place_of_worship",category:"amenity",
  osm_type:"way",osm_id:123,address:{road:"Rue Saint-Joseph",postcode:"75002",city:"Paris",country_code:"fr"},
};
assert.equal(classifyNominatimPrecision(buildingCandidate),"building");
assert.ok(scoreNominatimCandidate(venue,buildingCandidate)>0.42);
const selected=selectNominatimCandidate(venue,[buildingCandidate]);
assert.ok(selected);
assert.equal(selected.precision,"building");
const selectedGeo=nominatimGeoFromSelection(selected,{geocodedAt:"2026-10-07T10:00:00Z",cacheKey:"key"});
assert.equal(isMapPublishableGeo(selectedGeo,"FR"),true);

const wrongCountry={...buildingCandidate,address:{...buildingCandidate.address,country_code:"be"}};
assert.equal(scoreNominatimCandidate(venue,wrongCountry),0);
assert.equal(selectNominatimCandidate(venue,[wrongCountry]),null);

const localityVenue={
  venue_id:"ao-rome",name:{official:"Rome",alternate:[]},
  address:{formatted:"Rome",city:"Rome",country_code:"IT"},geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
};
const localityCandidate={
  lat:"41.893",lon:"12.483",display_name:"Roma, Roma Capitale, Lazio, Italia",
  name:"Roma",namedetails:{"name:en":"Rome","name":"Roma"},addresstype:"city",type:"city",category:"place",osm_type:"relation",osm_id:1,
  address:{city:"Roma",country_code:"it"},
};
const loc=selectNominatimCandidate(localityVenue,[localityCandidate]);
assert.ok(loc);
assert.equal(loc.precision,"locality");
const locGeo=nominatimGeoFromSelection(loc,{cacheKey:"rome"});
assert.equal(isApproximateDirectoryGeo(locGeo),true);
assert.equal(isMapPublishableGeo(locGeo,"IT"),true);

const features=directoryMapFeatures([
  {venue:{...venue,geo:validGeo}},
  {venue:{...localityVenue,geo:locGeo}},
  {venue:{venue_id:"bad",name:{official:"Bad"},address:{country_code:"FR"},geo:mismatch}},
]);
assert.equal(features.length,2);
assert.equal(features[0].properties.approximate,false);
assert.equal(features[1].properties.approximate,true);
assert.equal(features[1].properties.precision,"locality");

console.log("directory geocoding and map provenance: PASS");
