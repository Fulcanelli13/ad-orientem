import assert from "node:assert/strict";
import { auditDirectoryGeo, isMapPublishableGeo } from "../src/find/geo-provenance.js";
import {
  buildFsspDataset,
  linkedOfficialGeoPageCandidates,
  recoverLinkedOfficialGeo,
} from "../tools/directory/import-fssp.mjs";
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

const googlePlaceHtml=`
<a href="https://www.google.com/maps/place/Test/@32.3850625,-95.4185124,17z/data=!3m1!4b1!4m4!3m3!8m2!3d32.3850625!4d-95.4159375">Map</a>`;
const googlePlace=selectOfficialGeoFromHtml(googlePlaceHtml,{pageUrl:"https://official.example/tyler",expectedText:"Test Tyler"});
assert.ok(googlePlace.geo);
assert.equal(googlePlace.geo.lat,32.3850625);
assert.equal(googlePlace.geo.lng,-95.4159375,"Google viewport center was used instead of actual place longitude");

const googleDirectionsHtml=`
<a href="https://www.google.com/maps/dir//St.+Anton,+Kannenfeldstrasse+35,+Basel/@47.563512,7.5699551,16z/data=!4m8!4m7!1m0!1m5!2m2!1d7.5729949!2d47.5637084">Directions</a>`;
const googleDirections=selectOfficialGeoFromHtml(googleDirectionsHtml,{pageUrl:"https://official.example/basel",expectedText:"St Anton Kannenfeldstrasse 35 Basel"});
assert.ok(googleDirections.geo);
assert.equal(googleDirections.geo.lat,47.5637084);
assert.equal(googleDirections.geo.lng,7.5729949);

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

const linkedAnchors=[
  {text:"Contact us",url:"https://parish.example/contact-us/"},
  {text:"Mass schedule",url:"https://parish.example/mass-schedule/"},
  {text:"Facebook",url:"https://facebook.com/example"},
  {text:"Contact mirror",url:"http://www.parish.example/contact-us/"},
];
const linkedPages=linkedOfficialGeoPageCandidates(linkedAnchors,"https://parish.example/",{maxPages:2});
assert.deepEqual(linkedPages,["https://parish.example/contact-us/","https://parish.example/mass-schedule/"]);
const linkedHtml={
  "https://parish.example/contact-us/":'<script type="application/ld+json">{"@type":"Place","geo":{"latitude":51.501,"longitude":-0.141}}</script>',
  "https://parish.example/mass-schedule/":'<a href="https://www.openstreetmap.org/?mlat=51.501&mlon=-0.141#map=18/51.501/-0.141">Map</a>',
};
const fakeFetch=async url=>({ok:true,status:200,text:async()=>linkedHtml[url]??""});
const linkedRecovered=await recoverLinkedOfficialGeo({
  title:"Example Parish",address:"1 Example Street, London",detailUrl:"https://parish.example/"
},linkedAnchors,{fetchImpl:fakeFetch});
assert.ok(linkedRecovered.geo);
assert.equal(linkedRecovered.attempted,2);
assert.equal(linkedRecovered.ambiguous,false);
assert.equal(linkedRecovered.geo.geocoding_source,"OFFICIAL_SOURCE");

const conflictingFetch=async url=>({ok:true,status:200,text:async()=>url.includes("contact-us")
  ?'<meta itemprop="latitude" content="51.501"><meta itemprop="longitude" content="-0.141">'
  :'<meta itemprop="latitude" content="53.4808"><meta itemprop="longitude" content="-2.2426">'
});
const linkedConflict=await recoverLinkedOfficialGeo({
  title:"Example Parish",address:"1 Example Street, London",detailUrl:"https://parish.example/"
},linkedAnchors,{fetchImpl:conflictingFetch});
assert.equal(linkedConflict.geo,null);
assert.equal(linkedConflict.ambiguous,true);

const fsspDataset=buildFsspDataset([{
  index:1,title:"Official-coordinate Church",address:"1 Example Street - 75002 Paris - France",
  countryCode:"FR",detailUrl:"https://www.fssp.org/en/example/",diocese:"Paris",massRaw:null,
  emails:[],phones:[],externalLinks:[],officialGeo:jsonLd.geo,
}],{retrievedAt:"2026-10-07T11:00:00Z"});
assert.equal(fsspDataset.venues.length,1);
assert.equal(fsspDataset.venues[0].geo.geocoding_source,"OFFICIAL_SOURCE");
assert.equal(fsspDataset.venues[0].geo.lat,48.85661);

console.log("directory official coordinate extraction: PASS");
