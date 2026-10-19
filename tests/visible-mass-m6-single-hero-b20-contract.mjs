import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const src=name=>readFile(resolve(root,"previews/visible-mass-3d/",name),"utf8").then(JSON.parse);
const [master,prev,next,bk02]=await Promise.all([
 src("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json"),
 src("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v3.json"),
 src("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v4.json"),
 src("M6_B20_MISSAL_STAND_PHOTO_RIGHTS_HOLD_20261019.v1.json")
]);
assert.equal(master.objects.length,170);
assert.equal(master.images.length,112);
assert.equal(prev.provisional_hero_count,11);
assert.equal(next.provisional_hero_count,12);
assert.equal(next.needed_count,18);
assert.equal(next.selections.length,30);
assert.equal(next.provisional_hero_count+next.needed_count,30);
assert.equal(new Set(next.selections.map(x=>x.object_id)).size,30);
assert.ok(next.selections.every(x=>x.user_approved===false&&x.publication_approved===false));
assert.deepEqual(
 next.selections.filter(x=>x.hero_asset_id&&!prev.selections.find(y=>y.object_id===x.object_id).hero_asset_id).map(x=>x.object_id),
 ["AL06"]
);
const crucifix=next.selections.find(x=>x.object_id==="AL06");
assert.equal(crucifix.hero_asset_id,"M6B20-AL06-MET-ALTAR-CRUCIFIX");
assert.equal(crucifix.isolation,"ONE_OBJECT");
assert.match(crucifix.selection_rationale,/no Missal|No other|no church/i);
assert.match(crucifix.rights_record.licence,/CC0/);
assert.match(crucifix.rights_record.photograph_creator_or_source,/Metropolitan Museum/);
assert.match(crucifix.rights_record.object_artist,/NOT the photographer/);
for(const id of ["SN05","BK02","EQ01","EQ02"])assert.equal(next.selections.find(x=>x.object_id===id).hero_asset_id,null);
assert.equal(bk02.status,"NO_PUBLICATION_ELIGIBLE_HERO_SELECTED");
assert.equal(bk02.lead.source_image_rights,"UNRESOLVED_CONFLICT");
assert.match(bk02.lead.rights_evidence.join(" "),/Museum Associates/);
assert.equal(next.selections.find(x=>x.object_id==="SV02").hero_asset_id,"M6B17-SV02-CLERMONT-STSAMSON-19C20C");
assert.equal(next.selections.find(x=>x.object_id==="AL16").isolation,"ONE_DEFINED_THREE_CARD_ENSEMBLE");
console.log("PASS M6 B20 object-only hero policy",JSON.stringify({pilot:30,provisional:12,unfilled:18,added:"AL06",missal_stand_rights:"held",published:false}));
