import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const src=async name=>JSON.parse(await readFile(resolve(root,"previews/visible-mass-3d",name),"utf8"));
const [canonical,previous,current,qa]=await Promise.all([
  src("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json"),
  src("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v4.json"),
  src("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v5.json"),
  src("M6_B26_ORIGINAL_PIXEL_EDITORIAL_QA_20261019.v1.json")
]);
assert.equal(canonical.objects.length,170);
assert.equal(canonical.images.length,112);
assert.equal(previous.provisional_hero_count,12);
assert.equal(current.provisional_hero_count,13);
assert.equal(current.needed_count,17);
assert.equal(current.selections.length,30);
assert.equal(current.provisional_hero_count+current.needed_count,30);
assert.equal(new Set(current.selections.map(x=>x.object_id)).size,30);
assert.ok(current.selections.every(x=>x.user_approved===false&&x.publication_approved===false));
assert.deepEqual(current.selections.filter(x=>x.hero_asset_id&&!previous.selections.find(y=>y.object_id===x.object_id).hero_asset_id).map(x=>x.object_id),["EQ06"]);
const bell=current.selections.find(x=>x.object_id==="EQ06");
assert.equal(bell.hero_asset_id,"M6B26-EQ06-CARCASSONNE-SINGLE-BELL");
assert.equal(bell.isolation,"ONE_OBJECT");
assert.match(bell.status,/PROVISIONAL/);
assert.match(bell.qa_outstanding,/museum|glass|background|reflect/i);
assert.equal(bell.rights_record.licence,"CC BY-SA 4.0");
assert.equal(bell.rights_record.original_sha256,"118dcfa18a750c6c2f3245dfa4013d138a9f45cb73625f3acaa59f8fac798cc7");
assert.equal(qa.originals_downloaded_and_visually_reviewed,4);
assert.equal(qa.originals_not_downloaded,2);
assert.deepEqual(qa.selected_provisional_object_ids,["EQ06"]);
assert.equal(qa.publication_approved,false);
for(const id of ["SN05","BK02","EQ01","EQ02","AL03","SN02"])assert.equal(current.selections.find(x=>x.object_id===id).hero_asset_id,null);
for(const id of ["AL17","AL18"])assert.equal(current.selections.find(x=>x.object_id===id).selection_mode,"ANNOTATION_EXCEPTION");
for(const old of previous.selections.filter(x=>x.object_id!=="EQ06")){
 const now=current.selections.find(x=>x.object_id===old.object_id);
 assert.deepEqual(now,old,"Existing selection changed unexpectedly: "+old.object_id);
}
console.log("PASS M6 B26 original-pixel provisional bell lock",JSON.stringify({pilot:30,provisional:13,unfilled:17,originals:4,release_approved:false}));
