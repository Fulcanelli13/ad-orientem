import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../previews/visible-mass-3d/",import.meta.url)));
const read=async name=>JSON.parse(await readFile(resolve(root,name),"utf8"));
const [prior,current,qa,atlas]=await Promise.all([
 read("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v7.json"),
 read("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v8.json"),
 read("M6_B28_ORIGINAL_PIXEL_VISUAL_QA_20261019.v1.json"),
 read("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json")
]);
assert.equal(atlas.objects.length,170);assert.equal(atlas.images.length,112);
assert.equal(prior.provisional_hero_count,15);
assert.equal(current.provisional_hero_count,17);
assert.equal(current.needed_count,13);
assert.equal(current.selections.length,30);
const added=current.selections.filter(x=>x.hero_asset_id&&!prior.selections.find(p=>p.object_id===x.object_id)?.hero_asset_id).map(x=>x.object_id).sort();
assert.deepEqual(added,["AL01","AL03"]);
for(const p of prior.selections.filter(p=>!added.includes(p.object_id)))assert.deepEqual(current.selections.find(x=>x.object_id===p.object_id),p,"Changed unrelated item "+p.object_id);
const altar=current.selections.find(x=>x.object_id==="AL01");
assert.equal(altar.selection_mode,"ONE_COMPLETE_ARCHITECTURAL_SUBJECT_EXCEPTION");
assert.match(altar.qa_outstanding,/architectural exception/i);
assert.equal(altar.rights_record.original_sha256,qa.reused_previous_original.sha256);
const tab=current.selections.find(x=>x.object_id==="AL03");
const evidence=qa.original_images.find(x=>x.object_id==="AL03");
assert.equal(tab.rights_record.original_sha256,evidence.sha256);
assert.equal(tab.rights_record.licence,"CC BY 4.0");
assert.equal(tab.isolation,"ONE_OBJECT_DOMINANT_IN_SITU_WITH_NON_OBJECT_BACKGROUND_CROP");
assert.equal(qa.original_files_downloaded,3);
assert.equal(qa.others_not_downloaded_due_to_429,5);
for(const id of ["SN02","AL19","SN07","BK01","BK02","AL10"])assert.equal(current.selections.find(x=>x.object_id===id).hero_asset_id,null);
assert.deepEqual(current.selections.filter(x=>x.selection_mode==="ANNOTATION_EXCEPTION").map(x=>x.object_id),["AL17","AL18"]);
assert.equal(qa.canonical_source_catalogue_changed,false);
assert.ok(current.selections.every(x=>x.user_approved===false&&x.publication_approved===false));
console.log("PASS M6 B28: 17/30 provisional, 11 physical photo gaps, 2 annotations; zero published.");
