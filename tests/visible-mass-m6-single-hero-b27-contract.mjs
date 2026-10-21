import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const dir=resolve(fileURLToPath(new URL("../previews/visible-mass-3d/", import.meta.url)));
const load=async name=>JSON.parse(await readFile(resolve(dir,name),"utf8"));
const [old,current,qa,baseline]=await Promise.all([
 load("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v5.json"),
 load("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v6.json"),
 load("M6_B27_ORIGINAL_PIXEL_EDITORIAL_QA_20261019.v1.json"),
 load("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json")
]);
assert.equal(baseline.objects.length,170);
assert.equal(baseline.images.length,112);
assert.equal(old.provisional_hero_count,13);
assert.equal(current.provisional_hero_count,14);
assert.equal(current.needed_count,16);
assert.equal(current.selections.length,30);
assert.equal(qa.acquired,3);
assert.deepEqual(qa.decisions.new_provisional_heroes,["SN05"]);
assert.deepEqual(current.selections.filter(x=>x.hero_asset_id&&!old.selections.find(y=>x.object_id===y.object_id)?.hero_asset_id).map(x=>x.object_id),["SN05"]);
for (const selection of old.selections.filter(x=>x.object_id!=="SN05"))
 assert.deepEqual(current.selections.find(x=>x.object_id===selection.object_id),selection);
const lamp=current.selections.find(x=>x.object_id==="SN05");
assert.equal(lamp.hero_asset_id,"M6B27-SN05-AUCKLAND-RED-CATHOLIC-LAMP");
assert.match(lamp.qa_outstanding,/wall-mounted|glass/i);
assert.equal(lamp.rights_record.licence,"CC BY 4.0");
assert.equal(lamp.rights_record.original_sha256,"1370944b3f6b80b6b4766d9379506aef284dde45b880165b9fb18cbd591b52bc");
assert.ok(current.selections.every(x=>!x.user_approved&&!x.publication_approved));
for(const id of ["AL17","AL18"])assert.equal(current.selections.find(x=>x.object_id===id).selection_mode,"ANNOTATION_EXCEPTION");
console.log("PASS B27 one-object provisional lamp and rights gate",JSON.stringify({pilot:30,provisional:14,remaining:16,original_images:3,publication:false}));
