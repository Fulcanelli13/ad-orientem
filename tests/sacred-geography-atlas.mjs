import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {isMapPublishablePlaceGeo,assertExploreGeographyRegistry} from "../src/find/geography-contracts.js";
import {EXPLORE_LENSES,projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const geo=read("data/geography/seed-registry.v1.json"),sacred=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(geo.places.length,84);
assert.equal(sacred.apparitions.length,19);
assert.equal(sacred.relics.length,13);
assert.equal(sacred.scope,"PARTIAL_VERIFIED_SEED_NOT_COMPLETE_WORLD_CENSUS");
assert.equal(assertExploreGeographyRegistry(geo).counts.places,84);
const places=new Map(geo.places.map(p=>[p.place_id,p]));
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
assert.ok(sacred.relics.some(x=>x.relic_kind==="REPUTED_PASSION_RELIC"));
assert.ok(sacred.relics.every(x=>x.authentication==="NOT_INDEPENDENTLY_CERTIFIED_BY_APP"));
const projection=projectExploreDataset({geography:geo,sacredPhenomena:sacred});
assert.deepEqual(EXPLORE_LENSES,["tlm","shrines","apparitions","relics","traditions","pilgrimages"]);
for(const lens of ["apparitions","relics"]){
  const items=projection.byLens[lens],records=sacred[lens];
  assert.equal(items.length,records.length);
  assert.equal(exploreMapFeatures(items).length,records.length);
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
  selectedId:selected.item_id
}));
assert.match(detail,/Sainte Couronne d’épines/);
assert.match(detail,/notredamedeparis.fr/);
assert.match(detail,/sans authentification/);
const profiles=buildExplorePlaceProfiles({geography:geo},projection,{today:"2026-10-09"});
assert.equal(profiles.length,84);
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
console.log("PASS 19 historically distinct apparition traditions, 13 relic records, 10 new GPS Places, 6-map Explore, bilingual source/status, and no TLM/calendar inference");
