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
const candidates = readJson("../data/geography/directory-place-candidates.v1.json");

assert.equal(contract.schema, EXPLORE_GEOGRAPHY_SCHEMA);
assert.equal(contract.version, "1.0.0");
assert.ok(contract.invariants.some(value => /proximity/i.test(value)));
assert.ok(contract.invariants.some(value => /Directory venue/i.test(value)));

for (const area of seed.geoAreas) {
  assert.equal(auditGeoArea(area).length, 0, area.geo_area_id);
}
assert.deepEqual(
  seed.geoAreas.filter(area => area.area_type === "country").map(area => area.codes.iso_alpha2),
  ["FR", "IE", "MU", "DE", "AT", "CH", "US", "CA", "IT", "PL", "GB", "AU", "NZ", "NG", "UG", "MX", "BR", "CO", "BE", "CZ", "NL", "PT", "RW", "IN", "LT", "NI", "VE", "AR", "EG"],
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
    "place:FR:bermont-greux",
    "place:FR:notre-dame-des-marins-arcachon",
    "place:FR:pontmain",
    "place:FR:pellevoisin",
    "place:FR:montligeon",
    "place:FR:rue-du-bac",
    "place:FR:saint-joseph-bessillon",
    "place:FR:notre-dame-graces-cotignac",
    "place:FR:notre-dame-la-salette-fallavaux",
    "place:FR:abbaye-mont-saint-michel",
    "place:IT:san-michele-gargano",
    "place:FR:carmel-lisieux",
    "place:FR:espace-bernadette-nevers",
    "place:FR:basilique-ars",
    "place:FR:chapelle-saint-vincent-paris",
    "place:FR:notre-dame-paris",
    "place:FR:notre-dame-du-laus",
    "place:PL:divine-mercy-plock",
    "place:IT:basilica-sant-antonio-padova",
    "place:IT:basilica-san-francesco-assisi",
    "place:IT:basilica-santa-rita-cascia",
    "place:IT:basilica-san-nicola-bari",
    "place:IT:santuario-san-pio-rotondo",
    "place:IN:basilica-bom-jesus-old-goa",
    "place:RW:sanctuaire-kibeho",
    "place:IE:knock-shrine",
    "place:IE:lough-derg-station-island",
    "place:MU:pere-laval-sainte-croix",
    "place:DE:altoetting-gnadenkapelle",
    "place:DE:kevelaer-gnadenkapelle",
    "place:DE:kevelaer-kerzenkapelle",
    "place:DE:wigratzbad-maria-vom-sieg",
    "place:DE:mariahilf-amberg",
    "place:DE:st-leonhard-nussdorf",
    "place:DE:st-apollinaris-frielingsdorf",
    "place:DE:bettbrunn-st-salvator",
    "place:DE:maria-vesperbild",
    "place:AT:mariazell-basilica",
    "place:AT:maria-taferl-basilica",
    "place:CH:einsiedeln-monastery",
    "place:CH:kloster-mariastein",
    "place:US:champion-shrine",
    "place:US:guadalupe-shrine-la-crosse",
    "place:US:holy-hill",
    "place:US:st-alphonsus-baltimore",
    "place:US:st-john-neumann-philadelphia",
    "place:US:miraculous-medal-philadelphia",
    "place:US:czestochowa-doylestown",
    "place:US:seton-emmitsburg",
    "place:US:lourdes-grotto-emmitsburg",
    "place:US:st-mary-assumption-oswego",
    "place:US:auriesville-martyrs",
    "place:US:divine-mercy-stockbridge",
    "place:US:la-salette-attleboro",
    "place:US:lourdes-litchfield",
    "place:US:st-anne-fiskdale",
    "place:CA:sainte-anne-de-beaupre",
    "place:CA:notre-dame-du-cap",
    "place:CA:martyrs-shrine-midland",
    "place:IT:loreto-santa-casa",
    "place:IT:pompei-rosary-shrine",
    "place:PL:jasna-gora",
    "place:PL:kalwaria-zebrzydowska",
    "place:GB:walsingham-catholic-shrine",
    "place:GB:holywell-st-winefride",
    "place:GB:holywell-st-winefride-church",
    "place:AU:penrose-park",
    "place:AU:marian-valley",
    "place:NZ:st-peter-chanel-russell",
    "place:NZ:pukekaraka-otaki",
    "place:NG:ugwogo-nike-national-marian-shrine",
    "place:NG:nne-enyemaka-umuaka",
    "place:UG:namugongo-martyrs",
    "place:UG:munyonyo-martyrs",
    "place:MX:basilica-guadalupe-mexico-city",
    "place:MX:basilica-zapopan",
    "place:BR:aparecida-national-shrine",
    "place:BR:nazare-belem",
    "place:CO:las-lajas-ipiales",
    "place:CO:chiquinquira-basilica",
    "place:BE:banneux",
    "place:BE:beauraing",
    "place:CZ:svata-hora-pribram",
    "place:CZ:stara-boleslav-st-wenceslas",
    "place:NL:heiloo-olv-ter-nood",
    "place:NL:maastricht-sterre-der-zee",
    "place:PT:fatima-sanctuary",
    "place:PT:sameiro-braga",
  "place:FR:basilique-sainte-therese-lisieux",
  "place:BE:sanctuaire-sainte-julienne-cornillon",
  "place:FR:cathedrale-notre-dame-le-puy",
  "place:FR:basilique-notre-dame-victoires-paris",
  "place:FR:basilique-notre-dame-perpetuel-secours-paris",
  "place:FR:grottes-saint-antoine-brive",
  "place:FR:basilique-saint-martin-tours",
  "place:FR:basilique-montfort-saint-laurent",
  "place:FR:basilique-sainte-marie-madeleine-saint-maximin",
  "place:FR:abbaye-fleury-saint-benoit-loire",
    "place:PL:gietrzwald-basilica",
    "place:LT:siluva-apparition-chapel",
    "place:NI:cuapa-national-shrine",
    "place:VE:finca-betania",
    "place:AR:san-nicolas-virgen-rosario",
    "place:EG:zeitoun-coptic-saint-mary",
    "place:IT:santa-croce-gerusalemme-rome",
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
  geoAreas: 31,
  places: 111,
  directoryPlaceLinks: 1,
});

const kevelaerCandidate=candidates.candidates.find(item=>item.candidate_id==="candidate:directory-place:DE:kevelaer-kerzenkapelle-1962");
assert.ok(kevelaerCandidate,"Kevelaer 1962-Mass identity-resolution candidate missing");
assert.equal(kevelaerCandidate.status,"IDENTITY_RESOLUTION_REQUIRED");
assert.equal(kevelaerCandidate.place_id,"place:DE:kevelaer-kerzenkapelle");
assert.deepEqual(kevelaerCandidate.generated_provider_scan.exact_or_text_matches,[]);
assert.equal(seed.directoryPlaceLinks.some(link=>link.place_id==="place:DE:kevelaer-kerzenkapelle"),false,"unresolved Kevelaer candidate leaked into canonical Directory→Place links");
assert.equal(seed.directoryPlaceLinks.some(link=>link.place_id==="place:DE:kevelaer-gnadenkapelle"),false,"1962 Kerzenkapelle evidence was incorrectly attached to the Gnadenkapelle");

const guadalupeCandidate=candidates.candidates.find(item=>item.candidate_id==="candidate:directory-place:US:guadalupe-la-crosse-tlm");
assert.ok(guadalupeCandidate,"Guadalupe Shrine TLM identity-resolution candidate missing");
assert.equal(guadalupeCandidate.status,"IDENTITY_RESOLUTION_REQUIRED");
assert.equal(guadalupeCandidate.place_id,"place:US:guadalupe-shrine-la-crosse");
assert.deepEqual(guadalupeCandidate.generated_provider_scan.exact_or_text_matches,[]);
assert.equal(seed.directoryPlaceLinks.some(link=>link.place_id==="place:US:guadalupe-shrine-la-crosse"),false,"unresolved Guadalupe TLM candidate leaked into canonical Directory→Place links");

const walsinghamCandidate=candidates.candidates.find(item=>item.candidate_id==="candidate:directory-place:GB:walsingham-lms-tlm");
assert.ok(walsinghamCandidate,"Walsingham TLM identity-resolution candidate missing");
assert.equal(walsinghamCandidate.status,"IDENTITY_RESOLUTION_REQUIRED");
assert.equal(walsinghamCandidate.place_id,"place:GB:walsingham-catholic-shrine");
assert.deepEqual(walsinghamCandidate.generated_provider_scan.exact_or_text_matches,[]);
assert.equal(seed.directoryPlaceLinks.some(link=>link.place_id==="place:GB:walsingham-catholic-shrine"),false,"annual Walsingham pilgrimage evidence leaked into canonical Directory→Place links");

const holywellCandidate=candidates.candidates.find(item=>item.candidate_id==="candidate:directory-place:GB:holywell-st-winefride-church-tlm");
assert.ok(holywellCandidate,"Holywell parish TLM identity-resolution candidate missing");
assert.equal(holywellCandidate.place_id,"place:GB:holywell-st-winefride-church");
assert.deepEqual(holywellCandidate.generated_provider_scan.exact_or_text_matches,[]);
assert.equal(seed.directoryPlaceLinks.some(link=>link.place_id==="place:GB:holywell-st-winefride-church"),false,"unresolved Holywell parish candidate leaked into canonical Directory→Place links");
assert.equal(seed.directoryPlaceLinks.some(link=>link.place_id==="place:GB:holywell-st-winefride"),false,"parish-church TLM evidence was incorrectly attached to the Well shrine");

const umuakaLink=seed.directoryPlaceLinks.find(link=>link.link_id==="link:directory-place:NG:nne-enyemaka-umuaka");
assert.ok(umuakaLink,"production Umuaka Directory→Place link missing");
assert.equal(umuakaLink.relationship,"LOCATED_AT");
assert.equal(umuakaLink.confidence,"CONFIRMED");
assert.equal(umuakaLink.venue_id,"ao-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-umuaka-imo-state-nigeria");
assert.equal(seed.directoryPlaceLinks.some(link=>link.venue_id==="ao-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-474123-umuaka-imo-state-nigeria"),false,"duplicate upstream Umuaka row was linked as a second exact-place venue");

const alphonsusLink=seed.directoryPlaceLinks.find(link=>link.link_id==="link:directory-place:US:st-alphonsus-baltimore");
assert.ok(alphonsusLink,"production St Alphonsus Directory→Place link missing");
assert.equal(alphonsusLink.relationship,"LOCATED_AT");
assert.equal(alphonsusLink.confidence,"CONFIRMED");
assert.equal(alphonsusLink.venue_id,"ao-fssp-national-shrine-of-st-alphonsus-liguori-114-w-saratoga-st-baltimore-md-21201-usa");
assert.equal(alphonsusLink.place_id,"place:US:st-alphonsus-baltimore");

const oswegoLink=seed.directoryPlaceLinks.find(link=>link.link_id==="link:directory-place:US:oswego-st-mary-assumption");
assert.ok(oswegoLink,"production Oswego ICKSP Directory→Place link missing");
assert.equal(oswegoLink.relationship,"LOCATED_AT");
assert.equal(oswegoLink.confidence,"CONFIRMED");
assert.equal(oswegoLink.venue_id,"ao-icksp-st-mary-of-the-assumption-parish-and-shrine-103-west-7th-street-oswego-ny-13126-14");
assert.equal(oswegoLink.place_id,"place:US:st-mary-assumption-oswego");


const arcachonLink=seed.directoryPlaceLinks.find(link=>link.link_id==="link:directory-place:FR:arcachon-notre-dame");
assert.ok(arcachonLink,"production Arcachon Directory→Place link missing");
assert.equal(arcachonLink.relationship,"LOCATED_AT");
assert.equal(arcachonLink.confidence,"CONFIRMED");
assert.equal(arcachonLink.venue_id,"ao-fssp-basilique-notre-dame-f-33120-arcachon-france");
assert.equal(arcachonLink.place_id,"place:FR:notre-dame-des-marins-arcachon");

const bermontLink=seed.directoryPlaceLinks.find(link=>link.link_id==="link:directory-place:FR:bermont-greux");
assert.ok(bermontLink,"production Bermont Directory→Place link missing");
assert.equal(bermontLink.relationship,"LOCATED_AT");
assert.equal(bermontLink.confidence,"CONFIRMED");
assert.equal(bermontLink.venue_id,"ao-fssp-ermitage-notre-dame-de-bermont-chapelle-notre-dame-de-bermont-f-88630-greux-france");
assert.equal(bermontLink.place_id,"place:FR:bermont-greux");

for(const [linkId,venueId,placeId] of [
  ["link:directory-place:DE:wigratzbad-suehnekirche","ao-fssp-suhnekirche-kirchstrasse-d-88145-opfenbach-wigratzbad-deutschland","place:DE:wigratzbad-maria-vom-sieg"],
  ["link:directory-place:DE:mariahilf-amberg","ao-fssp-wallfahrtskirche-maria-hilf-mariahilfberg-3-d-92224-amberg-deutschland","place:DE:mariahilf-amberg"],
  ["link:directory-place:DE:st-leonhard-nussdorf","ao-fssp-kirche-st-leonhard-leonhardiweg-d-83131-nu-dorf-am-inn-deutschland","place:DE:st-leonhard-nussdorf"],
  ["link:directory-place:DE:st-apollinaris-frielingsdorf","ao-fssp-st-apollinaris-jan-wellem-strasse-12-d-51789-lindlar-deutschland","place:DE:st-apollinaris-frielingsdorf"],
]){
  const link=seed.directoryPlaceLinks.find(item=>item.link_id===linkId);
  assert.ok(link,linkId+" missing");
  assert.equal(link.relationship,"LOCATED_AT");
  assert.equal(link.confidence,"CONFIRMED");
  assert.equal(link.venue_id,venueId);
  assert.equal(link.place_id,placeId);
}


assert.equal(seed.directoryPlaceLinks.some(link=>link.place_id==="place:PT:fatima-sanctuary"),false,"FSSP presence in Fátima city was incorrectly collapsed into the sanctuary");
assert.equal(candidates.candidates.some(item=>item.place_id==="place:PT:fatima-sanctuary"),false,"city-level FSSP presence created an unresolved sanctuary candidate without identity evidence");

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
