import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const registry=read("../data/explore/biblical-atlas-editorial-holds.v1.json");
const study=read("../data/explore/biblical-cinematic-studies-review.v1.json");
const atlas=buildBibleAtlas(read("../data/explore/bible-places-compact.v1.json").entries);
assert.equal(registry.schema,"AO_BIBLICAL_ATLAS_EDITORIAL_HOLDS_V1");
assert.equal(registry.status,"REVIEW_NOT_PUBLISHED");
assert.equal(registry.policy?.releaseRequiresHumanSourceReview,true);
assert.equal(atlas.length,151);
assert.equal(study.scenes.length,181);
assert.equal(registry.holds.length,5,"all five source-critical blockers must remain tracked until reviewed");
assert.equal(new Set(registry.holds.map(x=>x.id)).size,5);

for(const issue of registry.holds){
 assert.match(issue.id,/^[A-Z][A-Z0-9_]+$/);
 assert.ok(["P0","P1"].includes(issue.priority));
 assert.equal(issue.resolution,"HOLD","no silent editorial approval in the research branch");
 assert.match(issue.source,/^https:\/\//);
 assert.ok(issue.issue.length>30&&issue.requiredAction.length>30);
 assert.ok(study.scenes[issue.sceneIndex]?.reference);
 assert.ok(issue.atlasIndices.length>0&&issue.atlasIndices.every(i=>atlas[i]?.reference));
 assert.ok(issue.passages.every(p=>typeof p==="string"&&p.length>5));
}
const by=id=>registry.holds.find(x=>x.id===id);
assert.equal(atlas[110].reference,"John 2:13–22");
assert.equal(atlas[110].era,"PASSION","the known Johannine chronology error must not be silently hidden");
assert.equal(study.scenes[74].reference,atlas[110].reference);
assert.deepEqual(by("JOHN2_PASSION_PLACEMENT").atlasIndices,[110]);
assert.equal(atlas[120].reference,"John 20:1–18");
assert.match(study.scenes[131].title_en,/Resurrection/);
assert.match(atlas[120].title_en,/empty tomb/);
assert.deepEqual(study.scenes[68].candidates.map(x=>x.atlasIndex),[76,77]);
assert.deepEqual(by("LUKE2_TEMPLE_EXACT_AND_OVERLAP").atlasIndices,[76,77]);
assert.equal(study.scenes[63].candidates[0].atlasIndex,72);
assert.equal(study.scenes[64].candidates[0].atlasIndex,71);
assert.deepEqual(by("MAGI_PRESENTATION_GOSPEL_HARMONY").atlasIndices,[72,71]);
console.log("PASS Atlas editorial hold registry: 5 source-bound release blockers; no false release sign-off");
