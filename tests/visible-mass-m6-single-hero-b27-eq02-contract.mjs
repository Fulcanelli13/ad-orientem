import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const dir=resolve(fileURLToPath(new URL("../previews/visible-mass-3d/", import.meta.url)));
const load=async n=>JSON.parse(await readFile(resolve(dir,n),"utf8"));
const [prev,next,qa,atlas]=await Promise.all([
 load("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v6.json"),
 load("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v7.json"),
 load("M6_B27_EQ02_ORIGINAL_PIXEL_QA_20261019.v1.json"),
 load("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json")
]);
assert.equal(atlas.objects.length,170);
assert.equal(atlas.images.length,112);
assert.equal(prev.provisional_hero_count,14);
assert.equal(next.provisional_hero_count,15);
assert.equal(next.needed_count,15);
assert.equal(next.selections.length,30);
assert.deepEqual(next.selections.filter(x=>x.hero_asset_id&&!prev.selections.find(p=>p.object_id===x.object_id)?.hero_asset_id).map(x=>x.object_id),["EQ02"]);
for(const p of prev.selections.filter(p=>p.object_id!=="EQ02"))
 assert.deepEqual(next.selections.find(x=>x.object_id===p.object_id),p,"Unintended hero change "+p.object_id);
const eq02=next.selections.find(x=>x.object_id==="EQ02");
assert.equal(eq02.isolation,"ONE_OBJECT");
assert.equal(eq02.rights_record.licence,"CC0 1.0");
assert.equal(eq02.rights_record.original_sha256,"4a81e964c56cf918a561c40c2635367f75dbb09e2d9659dd5e1f8875b7aa9e16");
assert.equal(eq02.rights_record.original_height,2448);
assert.match(eq02.qa_outstanding,/NOT an ordinary 1962/);
assert.equal(qa.can_be_used_as_typical_1962_illustration,false);
assert.equal(qa.source_image_binary_read,true);
assert.ok(next.selections.every(x=>x.user_approved===false&&x.publication_approved===false));
for(const id of ["AL17","AL18"])assert.equal(next.selections.find(x=>x.object_id===id).selection_mode,"ANNOTATION_EXCEPTION");
console.log("PASS M6 B27 EQ02 historic water cruet QA, 15/30 assistant-provisional, no publication approval");
