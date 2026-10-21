import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const base="previews/visible-mass-3d/";
const file=async name=>JSON.parse(await readFile(resolve(root,base+name),"utf8"));
const [master,prev,next,b19]=await Promise.all([
file("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json"),
file("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v2.json"),
file("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v3.json"),
file("M6_B19_ONE_OBJECT_CANDIDATES_20261019.v1.json")
]);
assert.equal(master.objects.length,170,"The canonical object registry is not replaced");
assert.equal(master.images.length,112,"The original photo registry is not replaced");
assert.equal(prev.provisional_hero_count,8);
assert.equal(next.selections.length,30);
assert.equal(next.provisional_hero_count,11);
assert.equal(next.needed_count,19);
assert.equal(next.provisional_hero_count+next.needed_count,30);
assert.equal(next.selection_target,"ONE_HIGH_QUALITY_ISOLATED_PHOTOGRAPH_PER_CANONICAL_OBJECT");
assert.equal(b19.assessed_photo_previews,8);
assert.equal(b19.selected_count,3);
assert.equal(b19.selected.length,3);
assert.deepEqual(new Set(b19.selected.map(x=>x.object_id)),new Set(["LN01","LN02","AL16"]));
for(const candidate of b19.selected){
 assert.ok(candidate.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.ok(candidate.creator&&candidate.licence&&candidate.size[0]>=1200&&candidate.size[1]>=1200);
 assert.equal(candidate.user_approved,false);
 assert.equal(candidate.publication_approved,false);
 const record=next.selections.find(x=>x.object_id===candidate.object_id);
 assert.ok(record);
 assert.equal(record.hero_asset_id,candidate.asset_id);
 assert.equal(record.user_approved,false);
 assert.equal(record.publication_approved,false);
 assert.ok(record.selection_rationale.length>45);
}
assert.ok(next.selections.every(x=>x.user_approved===false&&x.publication_approved===false));
assert.equal(new Set(next.selections.map(x=>x.object_id)).size,30);
assert.ok(next.selections.find(x=>x.object_id==="SV02").hero_asset_id!=="EXISTING-SV02",
 "Paten hero must never show the chalice-and-paten archive photo");
assert.equal(next.selections.find(x=>x.object_id==="AL16").isolation,"ONE_DEFINED_THREE_CARD_ENSEMBLE");
for(const id of ["BK02","EQ01","EQ02"])assert.equal(next.selections.find(x=>x.object_id===id).hero_asset_id,null);
assert.equal(next.selections.find(x=>x.object_id==="AL17").selection_mode,"ANNOTATION_EXCEPTION");
assert.equal(next.selections.find(x=>x.object_id==="AL18").selection_mode,"ANNOTATION_EXCEPTION");
assert.deepEqual(new Set(next.selections.filter(x=>x.hero_asset_id&&!prev.selections.find(p=>p.object_id===x.object_id)?.hero_asset_id).map(x=>x.object_id)),new Set(["LN01","LN02","AL16"]));
console.log("PASS M6 one-object B19 source policy",JSON.stringify({canonical_photos:112, pilot:30,provisional:11,needs_new_photo:19,new_sources:3,release_approved:false}));
