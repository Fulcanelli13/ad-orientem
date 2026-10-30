import assert from "node:assert/strict";
import {createHash} from "node:crypto";
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
const newSaintGuides=json("data/shrines/illustrated-place-guides-global-saints-r1.v1.json");
const globalMarianB2=json("data/shrines/illustrated-place-guides-global-marian-b2.v1.json");
const oldGuideFiles=[
 "data/shrines/illustrated-place-guides-france.v1.json",
 "data/shrines/illustrated-place-guides-france-r67.v1.json",
 "data/shrines/illustrated-place-guides-ireland.v1.json",
];
const knownPlaces=new Set(places.places.map(x=>x.place_id));
const shrineIds=new Set(canonical.shrines.map(x=>x.shrine_id));
const placeById=new Map(places.places.map(x=>[x.place_id,x]));
const imageByPlace=new Map(images.items.map(x=>[x.place_id,x]));
const allGuides=[...oldGuideFiles.flatMap(path=>json(path).guides),...newGuides.guides,...newSaintGuides.guides,...globalMarianB2.guides];
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
assert.equal(ledger.summary.shrineGuides,33);
assert.equal(ledger.summary.shrineApprovedHero,31);
assert.equal(images.items.length,ledger.summary.shrineApprovedHero+json("data/geography/research/directory-p95-first-two-photo-covers.v1.json").photos.length+json("data/geography/research/directory-p102-three-approved-covers.v1.json").photos.length+json("data/geography/research/directory-p106-four-approved-covers.v1.json").photos.length,"Historical Marian shrine count must remain intact while separately vetted Directory images are added");
for(const item of images.items){
 assert.ok(item.status==="APPROVED"&&item.rights_verified&&item.subject_verified&&item.crop_reviewed);
 assert.ok(/^https:\/\//.test(item.source_url)&&/^https:\/\//.test(item.license_url));
 assert.ok(item.credit&&item.alt_en&&item.alt_fr&&item.source_sha1&&item.derivative_sha256);
 const path=resolve(root,item.asset_path);
 assert.ok(existsSync(path),"Approved photo blob missing: "+item.asset_path);
 const actual=createHash("sha256").update(readFileSync(path)).digest("hex");
 assert.equal(actual,item.derivative_sha256,"Approved photo derivative was changed: "+item.place_id);
}

assert.equal(ledger.summary.shrineGuideAndHero,31);
assert.equal(ledger.summary.marianGuides,22);
assert.equal(allGuides.length,33);
assert.equal(new Set(allGuides.map(x=>x.place_id)).size,33,"No duplicate Place guide ownership");
assert.equal(newGuides.guides.length,7);
assert.equal(newSaintGuides.guides.length,4);
assert.equal(globalMarianB2.guides.length,8);
const pontmain=imageByPlace.get("place:FR:pontmain");
assert.equal(pontmain?.asset_path,"assets/approved/place-media/FR-pontmain-basilica-east.webp");
const gallery=JSON.parse(readFileSync(new URL("../data/geography/approved-place-gallery.v1.json",import.meta.url),"utf8"));
const original=gallery.items.find(x=>x.media_id==="pontmain-east-facade-2016");
assert.equal(pontmain?.derivative_sha256,original?.derivative_sha256,
 "Pontmain hero must reuse the exact approved gallery photograph, no new rights inference");

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
for(const g of [...newGuides.guides,...newSaintGuides.guides]){
 assert.ok(knownPlaces.has(g.place_id)&&g.publication==="PUBLISHED");
 assert.equal(g.image_policy,"USE_APPROVED_PLACE_MEDIA_ONLY");
 assert.ok(validSource(g.official_url));
 assert.ok(g.sections.length>=3&&g.stops.length>=2);
 const shr=canonical.shrines.filter(x=>x.place_id===g.place_id);
 assert.equal(shr.length,1,g.place_id+" must join one existing shrine record");
 assert.equal(shr[0].shrine_kind,newGuides.guides.some(x=>x.place_id===g.place_id)?"MARIAN":"SAINT");
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
for(const g of globalMarianB2.guides){
 assert.ok(knownPlaces.has(g.place_id)&&g.publication==="PUBLISHED");
 assert.equal(g.image_policy,"USE_APPROVED_PLACE_MEDIA_ONLY");
 assert.equal(imageByPlace.has(g.place_id),g.place_id!=="place:BE:banneux",
   "Seven photographed sanctuaries and one genuine Banneux photo hold expected");
 const shr=canonical.shrines.filter(x=>x.place_id===g.place_id);
 assert.equal(shr.length,1,"Marian guide must join exactly one existing shrine");
 assert.equal(shr[0].shrine_kind,"MARIAN");
 assert.ok(g.sections.length>=3&&g.stops.length>=2&&g.chronology.length>=2);
 for(const section of g.sections){
  assert.ok(section.title_en&&section.title_fr);
  for(const p of section.paragraphs){
   assert.ok(p.en.length>=250&&p.fr.length>=250&&validSource(p.source_url));
   assert.notEqual(p.en,p.fr);
  }
 }
 for(const stop of g.stops)assert.ok(stop.name_en&&stop.name_fr&&
   stop.description_en&&stop.description_fr&&validSource(stop.source_url));
 for(const chronology of g.chronology)assert.ok(chronology.when&&
   chronology.title_en&&chronology.title_fr&&validSource(chronology.source_url));
 assert.ok(g.visit.en&&g.visit.fr&&validSource(g.visit.source_url));
}
const loader=readFileSync(new URL("../src/find/explore-data-service.js",import.meta.url),"utf8");
assert.match(loader,/illustratedWorldMarianR1:moduleUrl/);
assert.match(loader,/illustratedGlobalSaintsR1:moduleUrl/);
assert.match(loader,/illustratedGlobalMarianB2:moduleUrl/);
assert.match(loader,/safeArray\(illustratedGlobalMarianB2\?\.guides\)/);
assert.match(loader,/fetchJson\(EXPLORE_DATA_URLS\.illustratedWorldMarianR1/);
assert.match(loader,/safeArray\(illustratedWorldMarianR1\?\.guides\)/);
assert.match(loader,/safeArray\(illustratedGlobalSaintsR1\?\.guides\)/);
assert.ok(ledger.shrines.every(s=>s.place_verified&&s.geo_available&&s.source_count>0));
assert.ok(ledger.pilgrimages.every(p=>p.source_count>0&&
 (!p.destination_shrine_id||shrineIds.has(p.destination_shrine_id))));
console.log("PASS: 257 shrines, 118 Marian, 240 pilgrimages, 20 routes, 33 apparition records, 33 detailed guides; all 31 approved local site photographs have complete bilingual guides (7 Marian and 4 Saints guides newly added).");
