import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
const service=readFileSync(new URL("../src/find/explore-data-service.js",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/find/bible-atlas.js",import.meta.url),"utf8");
const json=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
assert.equal(json?.entries?.length>0,true);
assert.match(source,/renderBibleAtlasToString/);
assert.match(source,/data-bible-atlas-open/);
assert.doesNotMatch(source,/renderLineageReview|renderCinematicStudies|loadBiblicalLineageReview|loadBibleCinematicStudies|bibleReview/);
assert.doesNotMatch(service,/biblicalLineageReview|bibleCinematicStudies|loadBiblicalLineageReview|loadBibleCinematicStudies/);
assert.doesNotMatch(atlas,/data-bible-review-surface/);
for(const path of ["../data/explore/biblical-cinematic-studies-review.v1.json","../data/explore/biblical-lineage-curated-review.v1.json"]){
 assert.throws(()=>readFileSync(new URL(path,import.meta.url)),"research dataset must stay out of this release slice: "+path);
}
assert.match(atlas,/ATLAS_WITNESS_EXCEPTIONS/);
assert.match(atlas,/data-bible-unlocated/);
console.log("PASS chronology scope: existing Atlas owner, 151-event engine, zero published genealogy/theatre research payloads");
