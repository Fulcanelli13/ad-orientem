// The 181-scene donor remains frozen under A12 append-only extension.
// The SHA-1 is the Git blob object ID for the exact original source record
// projection from branch commit 71f4f6c9a75e09abf02ea5086311d21183d8b10a.
// An editorial correction to an existing original scene is possible, but must
// explicitly update this evidence lock after reconciling its source change.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {validateCinematicStudies} from "../src/find/bible-cinematic-studies.js";

const source=JSON.parse(readFileSync(new URL("../data/explore/biblical-cinematic-studies-review.v1.json",import.meta.url),"utf8"));
const SOURCE_BASELINE="71f4f6c9a75e09abf02ea5086311d21183d8b10a";
const SOURCE_BLOB_SHA1="8f9bd59019e8a0fcd1765fe1609fc41c64b348d8";
const original=source.scenes.slice(0,181);
const chapters=source.chapters.map(c=>({
 id:c.id,group:c.group,sceneIndices:c.sceneIndices.filter(i=>i<181)
}));
const serialized=JSON.stringify({scenes:original,chapters});
const sha=createHash("sha1")
 .update("blob "+Buffer.byteLength(serialized)+"\0")
 .update(serialized).digest("hex");
assert.equal(sha,SOURCE_BLOB_SHA1,
 "The original 181 source scene records or 14 original chapter memberships changed. Reconcile with donor commit "+SOURCE_BASELINE+" before updating this lock.");
assert.equal(original.length,181);
assert.equal(source.scenes.length,183);
assert.equal(source.chapters.length,14);
assert.deepEqual(source.extension.additionalSceneIndices,[181,182]);
assert.deepEqual(source.scenes.slice(181).map(s=>s.sceneKey),[
 "biblical:scene:christ:181","biblical:scene:paul:182"
]);
const everyMembership=source.chapters.flatMap(c=>c.sceneIndices);
assert.equal(everyMembership.length,183);
assert.equal(new Set(everyMembership).size,183);
for(let i=0;i<183;i++)assert.ok(everyMembership.includes(i),"Missing scene in chapter navigation: "+i);
const chapter=id=>source.chapters.find(c=>c.id===id);
assert.ok(chapter("INCARNATION").sceneIndices.includes(181));
assert.equal(chapter("APOSTLES").sceneIndices[0],182);
assert.ok(validateCinematicStudies(source));
console.log("PASS original 181-scene full-content Git SHA-1 lock and 14 chapter baselines, plus two appended sources (183 total), unchanged 151-event authority");
