import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const root=fileURLToPath(new URL("../",import.meta.url));
const json=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const canonical=json("data/shrines/shrines-pilgrimages-seed.v1.json");
const places=json("data/geography/seed-registry.v1.json");
const images=json("data/geography/approved-place-media.v1.json");
const phenomena=json("data/explore/sacred-phenomena-seed.v1.json");
const ledger=json("data/shrines/editorial-master-inventory-20261021.v1.json");
const newGuides=json("data/shrines/illustrated-place-guides-world-marian-r1.v1.json");
const oldGuideFiles=[
 "data/shrines/illustrated-place-guides-france.v1.json",
 "data/shrines/illustrated-place-guides-france-r67.v1.json",
 "data/shrines/illustrated-place-guides-ireland.v1.json",
];
const knownPlaces=new Set(places.places.map(x=>x.place_id));
const shrineIds=new Set(canonical.shrines.map(x=>x.shrine_id));
const placeById=new Map(places.places.map(x=>[x.place_id,x]));
const imageByPlace=new Map(images.items.map(x=>[x.place_id,x]));
const allGuides=[...oldGuideFiles.flatMap(path=>json(path).guides),...newGuides.guides];
assert.equal(canonical.shrines.length,257);
assert.equal(canonical.pilgrimages.length,240);
assert.equal(canonical.routes.length,20);
assert.equal(phenomena.apparitions.length,33);
assert.deepEqual([...new Set(ledger.shrines.map(x=>x.shrine_id))].sort(),[...shrineIds].sort());
assert.deepEqual([...new Set(ledger.pilgrimages.map(x=>x.pilgrimage_id))].sort(),
 canonical.pilgrimages.map(x=>x.pilgrimage_id).sort());
assert.deepEqual([...new Set(ledger.routes.map(x=>x.route_id))].sort(),
 canonical.routes.map(x=>x.route_id).sort());
assert.deepEqual([...new Set(ledger.apparitionSites.map(x=>x.apparition_id))].sort(),
 phenomena.apparitions.map(x=>x.id).sort());
assert.equal(ledger.summary.marianShrines,118);
assert.equal(ledger.summary.shrineGuides,21);
assert.equal(ledger.summary.shrineApprovedHero,18);
assert.equal(ledger.summary.shrineGuideAndHero,14);
assert.equal(ledger.summary.marianGuides,14);
assert.equal(allGuides.length,21);
assert.equal(new Set(allGuides.map(x=>x.place_id)).size,21,"No duplicate Place guide ownership");
assert.equal(newGuides.guides.length,7);
const expected=["place:PT:fatima-sanctuary","place:IT:loreto-santa-casa",
 "place:DE:altoetting-gnadenkapelle","place:PL:jasna-gora",
 "place:IT:pompei-rosary-shrine","place:MX:basilica-guadalupe-mexico-city",
 "place:BR:aparecida-national-shrine"];
assert.deepEqual(newGuides.guides.map(x=>x.place_id).sort(),expected.sort());
const validSource=x=>typeof x==="string"&&/^https:\/\//.test(x);
for(const entry of ledger.shrines){
 assert.ok(shrineIds.has(entry.shrine_id)&&knownPlaces.has(entry.place_id),entry.shrine_id);
 const g=allGuides.some(x=>x.place_id===entry.place_id);
 assert.equal(entry.detailed_guide==="PUBLISHED",g,entry.shrine_id+" guide coverage drift");
 assert.equal(entry.hero_media==="APPROVED_LOCAL",imageByPlace.get(entry.place_id)?.status==="APPROVED",
  entry.shrine_id+" photo coverage drift");
}
for(const g of newGuides.guides){
 assert.ok(knownPlaces.has(g.place_id)&&g.publication==="PUBLISHED");
 assert.equal(g.image_policy,"USE_APPROVED_PLACE_MEDIA_ONLY");
 assert.ok(validSource(g.official_url));
 assert.ok(g.sections.length>=3&&g.stops.length>=2);
 const shr=canonical.shrines.filter(x=>x.place_id===g.place_id&&x.shrine_kind==="MARIAN");
 assert.equal(shr.length,1,g.place_id+" must join one existing Marian record");
 const media=imageByPlace.get(g.place_id);
 assert.ok(media&&media.status==="APPROVED"&&media.subject_verified&&media.rights_verified&&
   media.crop_reviewed,g.place_id+" approved exact photograph required");
 assert.ok(existsSync(resolve(root,media.asset_path)),media.asset_path+" packaged asset absent");
 assert.ok(media.alt_en&&media.alt_fr&&validSource(media.source_url));
 for(const section of g.sections){
  assert.ok(section.title_en&&section.title_fr);
  for(const p of section.paragraphs){
   assert.ok(p.en&&p.fr&&validSource(p.source_url),g.place_id+" unsourced text");
  }
 }
 for(const stop of g.stops)assert.ok(stop.name_en&&stop.name_fr&&
   stop.description_en&&stop.description_fr&&validSource(stop.source_url));
 for(const item of g.chronology)assert.ok(item.when&&item.title_en&&
   item.title_fr&&validSource(item.source_url));
 for(const item of g.programmes)assert.ok(
   ["ANNUAL_SHRINE_OBSERVANCE_NOT_LIVE_SCHEDULE","HISTORICAL_ANNIVERSARY_NOT_LIVE_SCHEDULE"].includes(item.date_kind)
   &&validSource(item.source_url)&&item.details_en&&item.details_fr);
 assert.ok(g.visit.en&&g.visit.fr&&validSource(g.visit.source_url));
}
const loader=readFileSync(new URL("../src/find/explore-data-service.js",import.meta.url),"utf8");
assert.match(loader,/illustratedWorldMarianR1:moduleUrl/);
assert.match(loader,/fetchJson\(EXPLORE_DATA_URLS\.illustratedWorldMarianR1/);
assert.match(loader,/safeArray\(illustratedWorldMarianR1\?\.guides\)/);
assert.ok(ledger.shrines.every(s=>s.place_verified&&s.geo_available&&s.source_count>0));
assert.ok(ledger.pilgrimages.every(p=>p.source_count>0&&
 (!p.destination_shrine_id||shrineIds.has(p.destination_shrine_id))));
console.log("PASS: 257 shrines, 118 Marian, 240 pilgrimages, 20 routes, 33 apparition records, 21 illustrated guides, 18 approved site photos; seven new bilingual media-safe Marian guides.");
