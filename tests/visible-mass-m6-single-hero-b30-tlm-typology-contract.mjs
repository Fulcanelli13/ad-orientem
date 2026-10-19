import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../previews/visible-mass-3d/",import.meta.url)));
const load=async n=>JSON.parse(await readFile(resolve(root,n),"utf8"));
const [prior,now,qa,registry]=await Promise.all([
load("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v8.json"),
load("M6_ONE_OBJECT_ONE_IMAGE_P0_20261019.v9.json"),
load("M6_B30_ORIGINAL_TLM_FIRST_PIXEL_REVIEW_20261019.v1.json"),
load("M6_B30_TLM_FIRST_SEVEN_REPLACEMENT_SOURCES_20261019.v1.json")
]);
assert.equal(prior.provisional_hero_count,17);
assert.equal(now.provisional_hero_count,18);
assert.equal(now.needed_count,12);
assert.equal(now.selections.length,30);
assert.equal(new Set(now.selections.map(x=>x.object_id)).size,30);
assert.ok(now.selections.every(x=>!x.user_approved&&!x.publication_approved));
assert.deepEqual(now.selections.filter(x=>x.hero_asset_id&&!prior.selections.find(p=>p.object_id===x.object_id)?.hero_asset_id).map(x=>x.object_id),["EQ01"]);
for (const p of prior.selections.filter(p=>!["EQ01","EQ02"].includes(p.object_id)))
 assert.deepEqual(now.selections.find(x=>x.object_id===p.object_id),p,"Other pilot entry changed: "+p.object_id);
const water=now.selections.find(x=>x.object_id==="EQ02");
const wine=now.selections.find(x=>x.object_id==="EQ01");
assert.equal(water.historical_secondary_alternative.hero_asset_id,"M6B27-EQ02-KRAKOW-GOTHIC-WATER-CRUET");
assert.equal(wine.hero_asset_id,"M6B30-EQ01-CC0-GLASS-WINE-CRUET-CROP");
assert.equal(water.hero_asset_id,"M6B30-EQ02-CC0-GLASS-WATER-CRUET-CROP");
assert.equal(wine.rights_record.source_url,water.rights_record.source_url);
assert.equal(wine.rights_record.original_sha256,water.rights_record.original_sha256);
assert.deepEqual(wine.rights_record.one_original_photo_shared_with,["EQ01","EQ02"]);
assert.deepEqual(water.rights_record.one_original_photo_shared_with,["EQ01","EQ02"]);
assert.equal(wine.rights_record.source_license,"CC0 1.0");
assert.equal(qa.acquired,3);
assert.equal(qa.rate_limit_stop,true);
assert.equal(registry.counts.source_rows,27);
assert.ok(now.selections.find(x=>x.object_id==="AL06").hero_asset_id==="M6B20-AL06-MET-ALTAR-CRUCIFIX");
assert.deepEqual(now.selections.filter(x=>x.selection_mode==="ANNOTATION_EXCEPTION").map(x=>x.object_id),["AL17","AL18"]);
console.log("PASS M6 B30 TLM typology: 18 provisional, 12 unresolved, one source for two honest crops, original historic photo retained.");
