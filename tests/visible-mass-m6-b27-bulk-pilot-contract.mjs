import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const base=resolve(fileURLToPath(new URL("../previews/visible-mass-3d/", import.meta.url)));
const file=async name=>JSON.parse(await readFile(resolve(base,name),"utf8"));
const [atlas,v5,b27]=await Promise.all([
  file("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json"),
  file("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v5.json"),
  file("M6_B27_PILOT_15_BULK_RECONCILIATION_20261019.v1.json")
]);
const target=new Set(v5.selections.filter(x=>!x.hero_asset_id&&x.selection_mode!=="ANNOTATION_EXCEPTION").map(x=>x.object_id));
assert.equal(atlas.objects.length,170);
assert.equal(atlas.images.length,112);
assert.equal(v5.provisional_hero_count,13);
assert.equal(b27.counts.physical_targets,15);
assert.equal(target.size,15);
assert.deepEqual(new Set(b27.objects.map(x=>x.object_id)),target);
assert.equal(new Set(b27.objects.map(x=>x.object_id)).size,15);
assert.equal(b27.counts.listed_source_records,b27.objects.reduce((x,o)=>x+o.sources.length,0));
assert.equal(b27.original_pixel_acquisition_queue.length,7);
assert.ok(b27.original_pixel_acquisition_queue.every(q=>b27.objects.find(o=>o.object_id===q.object_id)?.sources.some(s=>s.source_url===q.source_url)));
assert.ok(b27.objects.every(x=>x.hero_asset_id===null&&!x.user_approved&&!x.publication_approved));
assert.deepEqual(b27.annotations.map(x=>x.object_id),["AL17","AL18"]);
assert.equal(b27.release_flags.photograph_published,false);
console.log("PASS M6 B27 source identification lock; 15 physical targets and 7 pixel-queue sources");
