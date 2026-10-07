import assert from "node:assert/strict";
import { auditDirectoryGeo, isMapPublishableGeo } from "../src/find/geo-provenance.js";
import { buildFsspDataset } from "../tools/directory/import-fssp.mjs";
import { parseIckspUsDetail } from "../tools/directory/import-icksp.mjs";
import { parseIbpDetail } from "../tools/directory/import-ibp.mjs";
import {
  extractOfficialGeoCandidates,
  selectOfficialGeoFromHtml,
} from "../tools/directory/lib/official-geo-utils.mjs";

const jsonLdHtml=`
<html><head>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Church","name":"St Test","geo":{"@type":"GeoCoordinates","latitude":48.85661,"longitude":2.35221}}
</script>
</head></html>`;
const jsonLd=selectOfficialGeoFromHtml(jsonLdHtml,{pageUrl:"https://official.example/location"});
assert.ok(jsonLd.geo);
assert.equal(jsonLd.geo.geocoding_source,"OFFICIAL_SOURCE");
assert.equal(jsonLd.geo.precision,"address");
assert.equal(jsonLd.geo.upstream_carrier,"JSON_LD");
assert.equal(isMapPublishableGeo(jsonLd.geo,"FR"),true);
assert.deepEqual(auditDirectoryGeo(jsonLd.geo,{countryCode:"FR"}),[]);

const mapUrlHtml=`
<a href="https://www.openstreetmap.org/?mlat=40.7128&mlon=-74.0060#map=18/40.7128/-74.0060">Map</a>
<iframe src="https://www.google.com/maps/embed/v1/place?key=redacted&q=40.7128,-74.0060"></iframe>`;
const mapSelection=selectOfficialGeoFromHtml(mapUrlHtml,{pageUrl:"https://official.example/ny"});
assert.ok(mapSelection.geo);
assert.equal(mapSelection.ambiguous,false);
assert.ok(Math.abs(mapSelection.geo.lat-40.7128)<1e-8);
assert.ok(Math.abs(mapSelection.geo.lng+74.0060)<1e-8);
assert.equal(mapSelection.geo.upstream_carrier,"MAP_URL");

const metaHtml=`
<meta itemprop="latitude" content="45.5017">
<meta itemprop="longitude" content="-73.5673">`;
const meta=selectOfficialGeoFromHtml(metaHtml,{pageUrl:"https://official.example/montreal"});
assert.ok(meta.geo);
assert.equal(meta.geo.upstream_carrier,"META_GEO");

const dataHtml=`<div class="map" data-latitude="-20.1609" data-longitude="57.5012"></div>`;
const data=selectOfficialGeoFromHtml(dataHtml,{pageUrl:"https://official.example/mauritius"});
assert.ok(data.geo);
assert.equal(data.geo.upstream_carrier,"DATA_ATTRIBUTES");

const conflictingOfficialMap=`
<a href="https://www.google.com/maps/place/Via+del+Banco+di+Santo+Spirito,+5,+00186+Roma+RM,+Italy/@41.9008642,12.4644233,813m/data=!3m2!1e3!4b1">Map & Directions</a>`;
const conflict=selectOfficialGeoFromHtml(conflictingOfficialMap,{
  pageUrl:"https://institute-christ-king.org/international-home",
  expectedText:"Chiesa di San Sebastiano Piazza Ilio Barontini Livorno",
});
assert.equal(conflict.geo,null,"conflicting official map link was accepted");
assert.equal(conflict.ambiguous,false);
assert.equal(conflict.rejectedCandidates.length,1);
assert.equal(conflict.rejectedCandidates[0].rejection,"MAP_PLACE_TEXT_CONFLICT");

const ambiguousHtml=`
<a href="https://www.openstreetmap.org/?mlat=48.8566&mlon=2.3522">First map</a>
<a href="https://www.openstreetmap.org/?mlat=43.2965&mlon=5.3698">Second map</a>`;
const ambiguous=selectOfficialGeoFromHtml(ambiguousHtml,{pageUrl:"https://official.example/multi"});
assert.equal(ambiguous.geo,null);
assert.equal(ambiguous.ambiguous,true);
assert.equal(extractOfficialGeoCandidates(ambiguousHtml,{pageUrl:"https://official.example/multi"}).length,2);

const badInternational=`
<h2>Livorno, Italy</h2>
<h4>Chiesa di San Sebastiano</h4>
<p>Piazza Ilio Barontini</p><p>Livorno</p>
<a href="https://www.google.com/maps/place/Via+del+Banco+di+Santo+Spirito,+5,+00186+Roma+RM,+Italy/@41.9008642,12.4644233,813m/data=!3m2!1e3!4b1">Map & Directions</a>`;
const parsedBadInternational=(await import("../tools/directory/import-icksp.mjs")).parseIckspInternationalHtml(badInternational);
assert.equal(parsedBadInternational.length,1);
assert.equal(parsedBadInternational[0].officialGeo,null,"ICKSP international parser accepted wrong-city map link");
assert.equal(parsedBadInternational[0].officialGeoRejected,true);

const ickspHtml=`
<h6>St. Josaphat Oratory</h6>
<div>Sunday</div><div>9:30 am Holy Mass</div>
<div>Address:</div><div>| 34-32 210th Street</div><div>Bayside, New York 11361</div>
<a href="https://www.openstreetmap.org/?mlat=40.77221&mlon=-73.77498#map=18/40.77221/-73.77498">Map</a>`;
const icksp=parseIckspUsDetail(ickspHtml,{label:"New York - St. Josaphat Oratory",url:"https://www.institute-christ-king.org/queens-home",countryCode:"US"});
assert.ok(icksp.officialGeo);
assert.equal(icksp.officialGeo.geocoding_source,"OFFICIAL_SOURCE");
assert.match(icksp.address,/Bayside/);

const ibpHtml=`
<h1>Paris – Centre Saint-Paul</h1>
<div>Adresse : Centre Saint-Paul, 12 rue saint Joseph, 75002 Paris</div>
<script type="application/ld+json">{"@type":"Place","geo":{"latitude":48.86831,"longitude":2.34601}}</script>`;
const ibp=parseIbpDetail(ibpHtml,{label:"Paris – Centre Saint-Paul",url:"https://www.institutdubonpasteur.org/example",countryCode:"FR",city:"Paris",diocese:"Archidiocèse de Paris"});
assert.ok(ibp.officialGeo);
assert.equal(ibp.officialGeo.source_url,"https://www.institutdubonpasteur.org/example");

const fsspDataset=buildFsspDataset([{
  index:1,title:"Official-coordinate Church",address:"1 Example Street - 75002 Paris - France",
  countryCode:"FR",detailUrl:"https://www.fssp.org/en/example/",diocese:"Paris",massRaw:null,
  emails:[],phones:[],externalLinks:[],officialGeo:jsonLd.geo,
}],{retrievedAt:"2026-10-07T11:00:00Z"});
assert.equal(fsspDataset.venues.length,1);
assert.equal(fsspDataset.venues[0].geo.geocoding_source,"OFFICIAL_SOURCE");
assert.equal(fsspDataset.venues[0].geo.lat,48.85661);

console.log("directory official coordinate extraction: PASS");
