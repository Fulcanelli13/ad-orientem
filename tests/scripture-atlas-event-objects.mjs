import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {scriptureAtlasEventObjects} from "../src/scripture/atlas-related-events.js";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {parseScriptureContext} from "../src/scripture/context.js";

const data=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const source=buildBibleAtlas(data.entries);
const projected=scriptureAtlasEventObjects(data.entries);
assert.equal(source.length,151);
assert.equal(projected.length,151);
assert.equal(new Set(projected.map(x=>x.id)).size,151);
assert.deepEqual(projected.map(x=>x.objectId),source.map(x=>x.eventKey),
 "Atlas navigation must retain its canonical, position-independent eventKeys");
for(let i=0;i<151;i++){
 const stop=source[i],linked=projected[i];
 assert.equal(linked.id,"atlas:"+stop.eventKey);
 assert.equal(linked.target.type,"atlas");
 assert.equal(linked.target.eventKey,stop.eventKey);
 assert.equal(linked.title.en,"Biblical Atlas · "+stop.title_en);
 assert.equal(linked.title.fr,"Atlas biblique · "+stop.title_fr);
 assert.deepEqual(linked.passage,parseScriptureContext(stop.reference).passage);
 assert.equal(linked.relation,"BIBLICAL_NARRATIVE_OR_VISION_EVENT");
}
const annunciation=source.find(stop=>stop.reference==="Luke 1:26–38"||stop.reference==="Luke 1:26-38");
assert.ok(annunciation,"A sourced Annunciation Atlas event must exist");
assert.equal(projected.find(x=>x.objectId===annunciation.eventKey).target.eventKey,annunciation.eventKey);
assert.throws(()=>scriptureAtlasEventObjects([]),/Atlas missing place|151-event/);
console.log("PASS 151 source-owned Atlas event deep links, exact IDs and Bible source coordinates");
