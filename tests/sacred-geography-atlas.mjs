import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {isMapPublishablePlaceGeo,assertExploreGeographyRegistry} from "../src/find/geography-contracts.js";
import {EXPLORE_LENSES,projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const geo=read("data/geography/seed-registry.v1.json"),sacred=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(geo.places.length,353);
assert.equal(sacred.apparitions.length,33);
assert.equal(sacred.relics.length,122);
assert.equal(sacred.scope,"PARTIAL_VERIFIED_SEED_NOT_COMPLETE_WORLD_CENSUS");
assert.equal(assertExploreGeographyRegistry(geo).counts.places,353);
const places=new Map(geo.places.map(p=>[p.place_id,p]));
const p12=read("data/geography/research/sacred-places-p12-six-georef-and-23-source-exceptions.v1.json");
assert.equal(p12.schema,"AO_SACRED_PLACES_P12_RESEARCH_DISPOSITIONS_V1");
assert.equal(p12.source_exceptions.length,23,"P12 must preserve every original exception or unresolved slot");
assert.equal(new Set(p12.source_exceptions.map(x=>x.candidate_id)).size,23);
assert.equal(p12.georeferencing_holds.length,6,"All weak-geo review records must remain visible");
assert.equal(new Set(p12.georeferencing_holds.map(x=>x.place_id)).size,6);
for(const review of p12.georeferencing_holds){
  const place=places.get(review.place_id);
  assert.ok(place&&isMapPublishablePlaceGeo(place.geo,place.address?.country_code),
    "Research georeference hold must link an actual mapped Place: "+review.place_id);
  assert.match(review.authority_url,/^https:\/\//);
}
assert.equal(p12.canonical_address_upgrades.length,3);
for(const upgrade of p12.canonical_address_upgrades){
  const place=places.get(upgrade.place_id);
  assert.ok(place,"Missing upgraded canonical address: "+upgrade.place_id);
  assert.equal(place.address.line1,upgrade.line1,upgrade.place_id);
  assert.equal(place.address.postal_code,upgrade.postal_code,upgrade.place_id);
  assert.equal(place.address.formatted,upgrade.formatted,upgrade.place_id);
  assert.match(upgrade.custodian,/^https:\/\//);
  assert.equal(place.geo.precision,"site","Official address does not prove mapped entrance");
}
for(const record of p12.source_exceptions){
  assert.equal(record.publication_gate,"HOLD_NO_NEW_PLACE_NO_PIN");
  assert.equal(record.canonical_place_id,null);
  if(record.research_update_20261024){
    assert.match(record.research_update_20261024.url,/^https:\/\//);
    assert.ok(record.research_update_20261024.finding);
    assert.ok(record.research_update_20261024.next);
  }
}


const p13=read("data/geography/research/sacred-places-p13-identity-adjudication.v1.json");
assert.equal(p13.schema,"AO_SACRED_PLACES_P13_IDENTITY_ADJUDICATION_V1");
assert.equal(p13.summary.original_exception_slots,23);
assert.equal(p13.summary.source_identity_resolved_this_pass,3);
assert.equal(p13.summary.source_identity_still_open,20);
assert.equal(p13.summary.new_source_bounded_reviews,13);
assert.equal(p13.summary.canonical_places_changed,0);
assert.equal(p13.summary.canonical_pins_added,0);
assert.equal(p13.summary.new_publication_approvals,0);
assert.equal(p13.decisions.length,23);
assert.deepEqual(
  p13.decisions.map(x=>x.candidate_id).sort(),
  p12.source_exceptions.map(x=>x.candidate_id).sort(),
  "P13 cannot drop or invent source-exception stable IDs"
);
const resolvedP13=p13.decisions.filter(row=>row.source_identity_gate==="RESOLVED");
assert.deepEqual(resolvedP13.map(x=>x.candidate_id).sort(),[
  "candidate:SG-INV-0093",
  "candidate:SG-INV-0654",
  "candidate:SG-INV-0696"
]);
assert.equal(p13.decisions.filter(x=>x.source_review_20261024).length,13);
for(const row of p13.decisions){
  assert.equal(row.publication_status,"HOLD_NO_NEW_PLACE_NO_PIN");
  assert.equal(row.canonical_match,"NO_EXACT_PLACE_ID_CONFIRMED");
  if(!row.source_review_20261024)continue;
  assert.ok(row.source_review_20261024.urls.length>0);
  assert.ok(row.source_review_20261024.urls.every(url=>/^https:\/\//.test(url)),
    "Site-specific adjudication must carry direct URLs: "+row.candidate_id);
  assert.ok(row.source_review_20261024.basis,"Missing evidence boundary: "+row.candidate_id);
  assert.ok(row.source_review_20261024.next,"Missing publication hold: "+row.candidate_id);
}
assert.equal(p13.map_or_publication_proposals.length,3);
assert.equal(geo.places.length,353,"P13 is evidence-only; no canonical Place addition");

const p11ExactChurchFootprints=[
  ["place:FR:basilique-saint-sernin-toulouse","osm:way:260584755",43.60838,1.44188],
  ["place:IT:santa-maria-maggiore-rome","osm:way:131564482",41.89761,12.49846],
  ["place:IT:chiesa-gesu-rome","osm:way:25610962",41.89592,12.47981],
  ["place:IT:pompei-rosary-shrine","osm:way:28778029",40.75003,14.50055],
];
for(const [id,osmId,lat,lng] of p11ExactChurchFootprints){
  const place=places.get(id);
  assert.ok(place?.mappable,"P11 existing Place must remain map-enabled: "+id);
  assert.equal(place.geo?.precision,"site","Church footprint is not a visitor entrance: "+id);
  assert.equal(place.geo?.geocoding_source,"OSM",id);
  assert.equal(place.geo?.source_ref,osmId,id);
  assert.equal(place.geo?.source_url,"https://www.openstreetmap.org/"+osmId.replace("osm:","").replace(":","/"),id);
  assert.equal(place.geo?.lat,lat,id);
  assert.equal(place.geo?.lng,lng,id);
  assert.ok(isMapPublishablePlaceGeo(place.geo,place.address?.country_code),id);
}
// Historic shared-custody and multi-building Places retain their complex-wide anchor.
for(const id of [
  "place:ES:santa-maria-de-montserrat-abbey",
  "place:GB:walsingham-catholic-shrine",
  "place:PS:holy-sepulchre-jerusalem",
  "place:PS:nativity-bethlehem"
]){
  assert.equal(places.get(id)?.geo?.precision,"complex_anchor",id);
}

const ids=new Set();
for(const record of [...sacred.apparitions,...sacred.relics]){
  assert.ok(!ids.has(record.id),"duplicate sacred historical identity");
  ids.add(record.id);
  const place=places.get(record.place_id);
  assert.ok(place,"missing shared geographic Place: "+record.id);
  assert.ok(isMapPublishablePlaceGeo(place.geo,place.address?.country_code),"missing source-backed map location "+record.id);
  assert.match(record.source_url,/^https:\/\//,"no document link "+record.id);
  assert.ok(record.title_fr&&record.title_en,"bilingual content missing");
  assert.ok(!Object.keys(record).some(k=>/date_of_feast|month|day_of_feast|liturgical_rule/.test(k)),
    "Sacred geography may not manufacture Calendar recurrence");
}
assert.ok(sacred.apparitions.some(x=>x.phenomenon_family==="OUR_LORD"));
assert.ok(sacred.apparitions.some(x=>x.phenomenon_family==="SAINT_JOSEPH"));
assert.ok(sacred.apparitions.some(x=>x.phenomenon_family==="SAINT_MICHAEL"));
assert.ok(sacred.apparitions.some(x=>x.phenomenon_family==="MARY"));
assert.ok(sacred.apparitions.some(x=>x.recognition_record==="MEDIEVAL_LEGEND"));
const zeitoun=sacred.apparitions.find(x=>x.id==="apparition:EG:zeitoun");
assert.equal(zeitoun.recognition_record,"COPTIC_ORTHODOX_RECOGNITION");
assert.match(zeitoun.summary_en,/not a Catholic diocesan approval/);
const sanNicolas=sacred.apparitions.find(x=>x.id==="apparition:AR:san-nicolas");
assert.equal(sanNicolas.calendar_semantic_key,"observance.san_nicolas_september25");
const croce=sacred.relics.filter(x=>x.place_id==="place:IT:santa-croce-gerusalemme-rome");
assert.equal(croce.length,8);
assert.ok(croce.every(x=>x.access_notice_en?.includes("temporarily closed")&&x.access_notice_fr?.includes("fermée")));
assert.ok(croce.every(x=>x.authentication==="NOT_INDEPENDENTLY_CERTIFIED_BY_APP"));
const romeItem=projectExploreDataset({geography:geo,sacredPhenomena:sacred}).byLens.relics.find(x=>x.source_id==="relic:IT:santa-croce-true-cross");
assert.ok(romeItem.sections.some(x=>x.label==="Visitor access"&&x.body_fr?.includes("fermée")));
const romeUi=renderExploreToString(buildExploreViewModel({language:"fr",lens:"relics",view:"list",
items:[romeItem],counts:{relics:1},selectedId:romeItem.item_id,expandDetail:true}));
assert.match(romeUi,/Chapelle des reliques temporairement fermée/);

assert.ok(sacred.relics.some(x=>x.relic_kind==="REPUTED_PASSION_RELIC"));

for(const [id,status] of [
  ["apparition:ES:pilar-zaragoza","HISTORICAL_TRADITION"],
  ["apparition:IT:liberian-snow-dream","HISTORICAL_TRADITION"],
  ["apparition:JP:akita","HISTORICALLY_APPROVED"],
]){
  const apparition=sacred.apparitions.find(x=>x.id===id);
  assert.equal(apparition?.recognition_record,status,"recognition status incorrectly collapsed for "+id);
  assert.ok(projectionDoesNotAssertDogma(apparition),"historical phenomena may not assert required dogma");
}
function projectionDoesNotAssertDogma(record){
  return !/is infallibly proven|must believe this apparition|is universally approved/.test(record.summary_en??"");
}
for(const [placeId,count] of [
  ["place:PT:fatima-sanctuary",3],
  ["place:ES:carmel-alba-tormes",3],
  ["place:IT:santa-maria-maggiore-rome",3],
  ["place:IT:scala-santa-rome",2],
]){
  assert.equal(sacred.relics.filter(r=>r.place_id===placeId).length,count);
}
assert.ok(!sacred.relics.some(r=>["place:PS:holy-sepulchre-jerusalem","place:PS:nativity-bethlehem"].includes(r.place_id)),
  "empty tomb and Nativity grotto are pilgrimage holy places, not bodily relics");

assert.ok(sacred.relics.every(x=>x.authentication==="NOT_INDEPENDENTLY_CERTIFIED_BY_APP"));
const projection=projectExploreDataset({geography:geo,sacredPhenomena:sacred});
assert.deepEqual(EXPLORE_LENSES,["tlm","shrines","apparitions","relics","traditions","pilgrimages","saints"]);
for(const lens of ["apparitions","relics"]){
  const items=projection.byLens[lens],records=sacred[lens];
  assert.equal(items.length,records.length);
  assert.equal(exploreMapFeatures(items).length,lens==="relics"?new Set(items.map(x=>x.place_id)).size:records.length,"Relic map has one physical Place marker while retaining all source records");
  assert.ok(items.every(x=>x.map_publishable===true&&x.source_links.length===1));
  assert.ok(items.every(x=>!x.actions.some(a=>a.novena_id)),"unsourced novena associations must not be inferred");
}
const gargano=projection.byLens.apparitions.find(x=>x.source_id==="apparition:IT:monte-gargano");
assert.equal(gargano.raw.record.recognition_record,"MEDIEVAL_LEGEND");
assert.match(gargano.status,/Medieval/);
const french=renderExploreToString(buildExploreViewModel({
  lens:"apparitions",language:"fr",view:"map",items:projection.byLens.apparitions,counts:projection.counts
}));
assert.match(french,/Apparitions/);
assert.match(french,/récits d.apparition/);
assert.match(french,/origine surnaturelle/);
const selected=projection.byLens.relics.find(x=>x.source_id==="relic:FR:crown-of-thorns-paris");
const detail=renderExploreToString(buildExploreViewModel({
  lens:"relics",language:"fr",view:"list",items:projection.byLens.relics,counts:projection.counts,
  selectedId:selected.item_id,expandDetail:true
}));
assert.match(detail,/Sainte Couronne d’épines/);
assert.match(detail,/notredamedeparis.fr/);
assert.match(detail,/aucune authentification canonique indépendante/);
const profiles=buildExplorePlaceProfiles({geography:geo},projection,{today:"2026-10-09"});
assert.equal(profiles.length,353);
const cotignac=profiles.find(p=>p.place_id==="place:FR:saint-joseph-bessillon");
assert.equal(cotignac.counts.apparitions,1);
assert.equal(cotignac.counts.relics,0);
const paray=profiles.find(p=>p.place_id==="place:FR:sanctuaire-sacre-coeur-paray");
assert.equal(paray.counts.apparitions,1);
assert.equal(paray.counts.relics,1);
const rue=profiles.find(p=>p.place_id==="place:FR:rue-du-bac");
assert.equal(rue.counts.apparitions,3);
assert.equal(rue.counts.relics,3);
const notreDame=profiles.find(p=>p.place_id==="place:FR:notre-dame-paris");
assert.equal(notreDame.counts.apparitions,0);
assert.equal(notreDame.counts.relics,3);
assert.equal(geo.directoryPlaceLinks.some(link=>link.place_id==="place:FR:abbaye-mont-saint-michel"),false,
  "historical shrine is not automatically a TLM directory venue");
console.log(`PASS 33 qualified apparition traditions, 122 relic holdings, ${geo.places.length} source-anchored physical Places, four P11 OSM footprints, bilingual status and no TLM/calendar inference`);
