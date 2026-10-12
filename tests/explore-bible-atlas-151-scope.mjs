import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
const service=readFileSync(new URL("../src/find/explore-data-service.js",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../src/find/bible-atlas.js",import.meta.url),"utf8");
const json=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
assert.equal(json?.entries?.length>0,true);
assert.match(source,/renderBibleAtlasToString/);
assert.match(source,/data-bible-atlas-open/);
assert.match(source,/bibleResearchPreview=new URLSearchParams/,"research requires explicit preview URL");
assert.match(source,/researchPreview:bibleResearchPreview/,"runtime gates research tabs");
assert.match(service,/loadBiblicalLineageReview|loadBibleCinematicStudies/,"research loaders are lazy");
assert.match(atlas,/vm\.researchPreview/,"public timeline must exclude research tabs by default");
for(const path of ["../data/explore/biblical-cinematic-studies-review.v1.json","../data/explore/biblical-lineage-curated-review.v1.json"]){
 const research=JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
 assert.ok(research?.status&&/REVIEW|RESEARCH/.test(research.status),"research remains unpublished: "+path);
}
assert.match(atlas,/ATLAS_WITNESS_EXCEPTIONS/);
assert.match(atlas,/data-bible-unlocated/);
console.log("PASS public 151 chronology default; gated unpublished research loads on explicit opt-in");
