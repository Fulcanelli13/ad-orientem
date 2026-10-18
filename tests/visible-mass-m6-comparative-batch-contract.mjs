import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const base="previews/visible-mass-3d/";
const file=p=>readFile(resolve(root,base+p),"utf8");
const [master,batch,batch16,...htmls]=await Promise.all([
 file("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json").then(JSON.parse),
 file("M6_COMPARATIVE_P0_BATCH15_UNAPPROVED_20261018.v1.json").then(JSON.parse),
 file("M6_COMPARATIVE_P0_BATCH16_UNAPPROVED_20261019.v1.json").then(JSON.parse),
 file("M6_Photo_Review_112_Sources_20261018.html"),
 file("Ad_Orientem_M6_Acquired_Photo_Review_112.html")
]);
assert.equal(master.objects.length,170);
assert.equal(master.images.length,112,"The canonical 112-source register must remain unaltered by staging");
assert.equal(batch.status,"UNAPPROVED_RESEARCH_ONLY_NOT_ADDED_TO_CANONICAL_ATLAS");
assert.equal(batch.records.length,8);
assert.equal(batch.base_registry_image_count,112);
assert.equal(new Set(batch.records.map(x=>x.asset_id)).size,batch.records.length);
assert.ok(batch.records.every(x=>!master.images.some(y=>y.asset_id===x.asset_id||y.source_url===x.source_url)));
assert.ok(batch.records.every(x=>x.medium==="photograph"&&x.creator&&x.licence&&x.license_url&&x.width>=1200&&x.height>=1200&&x.source_url.startsWith("https://commons.wikimedia.org/wiki/File:")));
assert.ok(batch.records.every(x=>x.review_status!=="PUBLISHED"&&x.review_status!=="APPROVED"));
assert.deepEqual(batch.records.filter(x=>x.object_ids.includes("SV01")).map(x=>x.role),["object_detail","object_detail","object_detail","object_detail"]);
assert.equal(batch.records.filter(x=>x.object_ids.includes("EQ06")).length,1);
assert.equal(batch.records.filter(x=>x.object_ids.includes("SV03")).every(x=>x.role==="historical_reference"),true);
const cloth=batch.records.find(x=>x.asset_id==="M6B15-LN04-LN05-PRENDERGAST-ENSEMBLE");
assert.deepEqual(cloth.object_ids,["LN04","LN05"]);
assert.equal(cloth.role,"context_detail");
assert.equal(batch.screening_overrides.length,1);
for(const override of batch.screening_overrides)assert.ok(master.images.some(x=>x.asset_id===override.asset_id));
assert.equal(batch16.status,"UNAPPROVED_RESEARCH_ONLY_NOT_ADDED_TO_CANONICAL_ATLAS");
assert.equal(batch16.records.length,9);
assert.equal(batch16.base_registry_image_count,112);
assert.ok(batch16.records.every(x=>!master.images.some(y=>y.asset_id===x.asset_id||y.source_url===x.source_url)));
assert.ok(batch16.records.every(x=>!batch.records.some(y=>y.asset_id===x.asset_id||y.source_url===x.source_url)));
assert.equal(new Set(batch16.records.map(x=>x.asset_id)).size,batch16.records.length);
assert.ok(batch16.records.every(x=>x.medium==="photograph"&&x.creator&&x.licence&&x.license_url&&x.width>=1200&&x.height>=1200&&x.source_url.startsWith("https://commons.wikimedia.org/wiki/File:")));
assert.ok(batch16.records.every(x=>x.publication_approved===false&&x.review_status!=="APPROVED"));
assert.equal(batch16.records.filter(x=>x.object_ids.includes("LN04")&&x.role==="object_detail").length,4);
assert.equal(batch16.records.filter(x=>x.object_ids.includes("LN05")&&x.role==="object_detail").length,3);
assert.equal(batch16.records.filter(x=>x.object_ids.includes("LN05")&&x.role==="historical_reference").length,1);
assert.equal(batch16.records.find(x=>x.object_ids.includes("SV02")).role,"historical_reference");
assert.ok(batch16.excluded.some(x=>x.reason==="VIATICUM_BURSE_NOT_CORPORAL_BURSE"));
assert.ok(batch16.excluded.some(x=>x.reason==="SAME_SPECIMEN_ALTERNATE_VIEW"));
assert.ok(batch16.excluded.some(x=>x.reason==="BYZANTINE_RITE_DIFFERENT_SHAPE"));
assert.ok(batch16.screening_overrides.every(x=>master.images.some(y=>y.asset_id===x.asset_id)));
assert.equal(htmls[0],htmls[1],"Portable and legacy review HTML must remain identical");
for(const html of htmls){
 const inline=html.match(/<script>window\.AO_M6_COMPARISON_BATCH=([\s\S]*?);<\/script>/);
 assert.ok(inline,"Missing inline staged source review dataset");
 assert.deepEqual(JSON.parse(inline[1]),batch,"Embedded batch must exactly match canonical staging file; no divergent metadata");
 const inline16=html.match(/<script>window\\.AO_M6_COMPARISON_BATCH16=([\\s\\S]*?);<\\/script>/);
 assert.ok(inline16,"Missing independent B16 inline photo data");
 assert.deepEqual(JSON.parse(inline16[1]),batch16,"Second source-owned batch differs between JSON and offline gallery");
 assert.ok(html.includes("AO_M6_COMPARATIVE"));
 assert.ok(html.includes("UNAPPROVED STAGED LEAD"));
}
console.log("PASS M6 B15 + B16 photographic integrity",JSON.stringify({canonical:112,staged:17,objects:170,comparativeChalices:4,corporalBurses:4,chaliceVeils:4,published:false}));
