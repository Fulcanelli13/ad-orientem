import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {publishedPlaceIntro,existingSaintBiographyPreview,existingPlaceEditorialConnections}
  from "../src/find/place-editorial-reuse.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const guides=[
  "france","france-r67","ireland","world-marian-r1","global-saints-r1","global-marian-b2"
].map(x=>read("data/shrines/illustrated-place-guides-"+x+".v1.json"));
const data={
  geography:read("data/geography/seed-registry.v1.json"),
  guideCorpora:guides,
  saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
  customs:read("data/customs/customs-atlas-seed.v1.json"),
  phenomena:read("data/explore/sacred-phenomena-seed.v1.json"),
};
assert.ok(guides.flatMap(x=>x.guides).filter(x=>x.publication==="PUBLISHED").length>=33,
  "existing 33 illustrated guides must be reused, not rewritten");
const chartres=existingPlaceEditorialConnections("place:FR:chartres-notre-dame",data);
assert.ok(chartres.introduction?.introduction.en.length>50);
assert.ok(chartres.introduction?.introduction.fr.length>50);
assert.equal(chartres.introduction?.ownership,"EXISTING_PUBLISHED_ILLUSTRATED_GUIDE");
assert.equal(chartres.introduction?.full_guide_available,true);
assert.ok(chartres.introduction?.source_url.startsWith("https://"));
assert.ok(publishedPlaceIntro("place:FR:chartres-notre-dame",[] )===null);
const duplicates=[...guides,{guides:[...guides.flatMap(x=>x.guides)
  .filter(x=>x.place_id==="place:FR:chartres-notre-dame")]}];
assert.equal(publishedPlaceIntro("place:FR:chartres-notre-dame",duplicates),null,
  "ambiguous duplicate guides must not silently compete");

const paray=existingPlaceEditorialConnections("place:FR:sanctuaire-sacre-coeur-paray",data);
assert.ok(paray.introduction);
assert.ok(paray.customs.some(x=>x.id==="DOM-006"));
assert.ok(paray.sacred_objects.some(x=>x.id==="relic:FR:margaret-mary-paray"));
assert.ok(paray.editorial_saints.some(x=>x.saint_id==="saint:margaret-mary-alacoque"));
assert.ok(paray.editorial_saints.every(x=>x.publication==="EDITORIAL_REVIEW_ONLY"));
const margaret=existingSaintBiographyPreview("saint:margaret-mary-alacoque",data.saints);
assert.ok(margaret?.source_urls.length>0);
assert.equal(margaret?.calendar1962,null);
assert.equal(existingSaintBiographyPreview("saint:anne",data.saints),null,
  "name-only matching must not create saint identity");
const anne=existingPlaceEditorialConnections("place:FR:sainte-anne-d-auray",data);
assert.ok(!anne.customs.some(x=>x.id==="DEV-007"),
  "context-only regional custom must not be silently published");
const paris=existingPlaceEditorialConnections("place:FR:notre-dame-paris",data);
assert.equal(paris.introduction,null,"never pretend unpublished guide prose exists");
for(const id of ["relic:FR:crown-of-thorns-paris","relic:FR:cross-paris","relic:FR:holy-nail-paris"]){
 const x=paris.sacred_objects.find(x=>x.id===id);
 assert.ok(x,"existing actual relic must be connected: "+id);
 assert.equal(x.authenticity,"NOT_INDEPENDENTLY_CERTIFIED");
 assert.equal(x.access,"NOT_ASSERTED");
}
assert.equal(existingPlaceEditorialConnections("place:ZZ:nonexistent",data).introduction,null);
assert.deepEqual(existingPlaceEditorialConnections("place:ZZ:nonexistent",data).sacred_objects,[]);

const executable=new URL("../tools/export-sacred-editorial-claude-packet.mjs",import.meta.url);
const text=execFileSync(process.execPath,[executable.pathname,"--places",
 "place:FR:chartres-notre-dame,place:FR:notre-dame-paris,place:FR:sanctuaire-sacre-coeur-paray,place:MU:pere-laval-sainte-croix"
],{encoding:"utf8"});
const packet=text.trim().split("\n").map(JSON.parse);
assert.equal(packet.length,4);
assert.ok(packet.every(x=>x.schema==="ao.sacred-editorial-claude-packet.v1"));
assert.deepEqual(packet.map(x=>x.place_id),[
 "place:FR:chartres-notre-dame","place:FR:notre-dame-paris",
 "place:FR:sanctuaire-sacre-coeur-paray","place:MU:pere-laval-sainte-croix"
]);
assert.equal(packet[0].current_content.needs_new_place_biography,false);
assert.equal(packet[0].output_constraints.site_bio_word_limit,0);
assert.equal(packet[1].current_content.needs_new_place_biography,true);
assert.ok(packet[1].existing_sacred_objects.some(x=>x.id==="relic:FR:crown-of-thorns-paris"));
assert.ok(packet[2].exact_linked_saints.some(x=>x.saint_id==="saint:margaret-mary-alacoque"));
assert.ok(packet[3].exact_linked_saints.some(x=>x.saint_id==="blessed:jacques-desire-laval"));
assert.ok(packet.every(x=>x.starting_source_urls.every(u=>u.startsWith("https://"))));
assert.ok(packet.every(x=>JSON.stringify(x).length<14000),
  "packet must remain bounded for token economy");
assert.throws(()=>execFileSync(process.execPath,[executable.pathname,"--places",
  Array(13).fill("place:FR:chartres-notre-dame").join(",")
],{stdio:"pipe"}),"unbounded research request must be refused");
console.log("P65 existing 33 guides, reusable Saints biographies, sacred objects, Customs holds and bounded Claude packets PASS");
