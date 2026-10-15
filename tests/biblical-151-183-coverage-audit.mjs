import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {validateCinematicStudies,validateCinematicCrosswalk} from "../src/find/bible-cinematic-studies.js";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const atlas=buildBibleAtlas(read("../data/explore/bible-places-compact.v1.json").entries);
const theatre=read("../data/explore/biblical-cinematic-studies-review.v1.json");
assert.equal(atlas.length,151);
assert.equal(theatre.scenes.length,183);
assert.ok(validateCinematicStudies(theatre));
assert.ok(validateCinematicCrosswalk(theatre,atlas));
const byKey=new Map(atlas.map(e=>[e.eventKey,{event:e,exact:0,overlap:0}]));
assert.equal(byKey.size,151,"source identities must be unique, not index-based");
let links=0;
for(const scene of theatre.scenes)for(const c of scene.candidates){
 const row=byKey.get(c.atlasEventKey);
 assert.ok(row,"Every scene points only to the actual 151-event source");
 assert.equal(row.event.index,c.atlasIndex);
 assert.equal(row.event.reference,c.reference);
 row[c.relation==="EXACT_REFERENCE"?"exact":"overlap"]++;
 links++;
}
assert.equal(links,99);
const eraCounts={};
let exact=0,overlap=0,missing=0;
for(const {event:e,exact:x,overlap:o} of byKey.values()){
 const count=eraCounts[e.era]??={all:0,exact:0,overlap:0,missing:0};
 count.all++;
 if(x){exact++;count.exact++;}
 else if(o){overlap++;count.overlap++;}
 else{missing++;count.missing++;}
}
assert.deepEqual([exact,overlap,missing],[67,17,67],
 "Update the generated 151-to-183 research gap register before changing the coverage baseline");
assert.deepEqual(eraCounts,{
 ORIGINS:{all:6,exact:0,overlap:0,missing:6},
 PATRIARCHS:{all:12,exact:2,overlap:4,missing:6},
 EXODUS:{all:14,exact:11,overlap:1,missing:2},
 ISRAEL:{all:13,exact:0,overlap:0,missing:13},
 EXILE:{all:21,exact:0,overlap:0,missing:21},
 INFANCY:{all:12,exact:10,overlap:2,missing:0},
 PUBLIC:{all:31,exact:23,overlap:3,missing:5},
 PASSION:{all:11,exact:6,overlap:3,missing:2},
 RESURRECTION:{all:6,exact:3,overlap:1,missing:2},
 APOSTLES:{all:20,exact:12,overlap:3,missing:5},
 REVELATION:{all:5,exact:0,overlap:0,missing:5}
});
for(const [key,sceneKey] of [
 ["biblical:event:bethlehem-additional-003","biblical:scene:christ:181"],
 ["biblical:passage:acts-2-1-41","biblical:scene:paul:182"]
]){
 const scene=theatre.scenes.find(x=>x.sceneKey===sceneKey);
 assert.ok(scene&&scene.candidates.some(c=>c.atlasEventKey===key&&c.relation==="EXACT_REFERENCE"));
 assert.ok(byKey.get(key).exact===1);
}
// Missing cinematic representation is not absence from Scripture and not art clearance.
assert.equal(theatre.policy.noArtworkImported,true);
assert.ok(theatre.scenes.every(s=>!Object.hasOwn(s,"art")&&!Object.hasOwn(s,"imageUrl")));
console.log("PASS selected Bible chronology gap audit: 151 events, 183 Theatre scenes, 67 exact cited, 17 passage-overlap only, 67 no scene, 99 links; no publication assumptions");
