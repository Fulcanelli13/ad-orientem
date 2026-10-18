import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const base="previews/visible-mass-3d/";
const file=p=>readFile(resolve(root,base+p),"utf8");
const [master,batch,batch16,batch17,...htmls]=await Promise.all([
 file("M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json").then(JSON.parse),
 file("M6_COMPARATIVE_P0_BATCH15_UNAPPROVED_20261018.v1.json").then(JSON.parse),
 file("M6_COMPARATIVE_P0_BATCH16_UNAPPROVED_20261019.v1.json").then(JSON.parse),
 file("M6_COMPARATIVE_P0_BATCH17_UNAPPROVED_20261019.v1.json").then(JSON.parse),
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
assert.equal(batch17.status,"UNAPPROVED_RESEARCH_ONLY_NOT_ADDED_TO_CANONICAL_ATLAS");
assert.equal(batch17.records.length,9);
assert.equal(batch17.base_registry_image_count,112);
const allStaged=[...batch.records,...batch16.records,...batch17.records];
assert.equal(allStaged.length,26,"No stage 15–17 records may disappear or be duplicated");
assert.equal(new Set(allStaged.map(x=>x.asset_id)).size,26);
assert.equal(new Set(allStaged.map(x=>x.source_url)).size,26,"Separate source pages required; review repeated specimens independently");
assert.ok(allStaged.every(x=>!master.images.some(y=>y.asset_id===x.asset_id||y.source_url===x.source_url)),"No duplication into master 112");
assert.ok(batch17.records.every(x=>x.medium==="photograph"&&x.creator&&x.licence&&x.license_url&&x.width>=1200&&x.height>=1200));
assert.ok(batch17.records.every(x=>x.review_status!=="APPROVED"&&x.publication_approved===false));
assert.ok(batch17.records.every(x=>x.object_ids.length===1&&["SV02","SV03"].includes(x.object_ids[0])));
assert.equal(batch17.records.filter(x=>x.object_ids[0]==="SV02"&&x.role==="object_detail").length,4);
assert.equal(batch17.records.filter(x=>x.object_ids[0]==="SV02"&&x.role==="context_detail").length,1);
assert.equal(batch17.records.filter(x=>x.object_ids[0]==="SV03"&&x.role==="object_detail").length,4);
assert.equal(new Set(batch17.records.filter(x=>x.object_ids[0]==="SV02"&&x.role==="object_detail").map(x=>x.asset_id)).size,4);
assert.ok(batch17.excluded.some(x=>x.reason==="FILE_NAME_MISIDENTIFIED_ACTUAL_CRUETS"),"Do not repeat Notre-Dame altar-cruets false positive");
assert.ok(batch17.excluded.some(x=>x.reason==="SAME_CIBORIUM_DIFFERENT_VIEW"));
assert.ok(batch17.excluded.some(x=>x.reason==="VIATICUM_VESSEL_NOT_TYPICAL_CIBORIUM"));
assert.ok(batch17.excluded.some(x=>x.reason==="EVANGELICAL_CHURCH_NOT_ROMAN_CATHOLIC"));
assert.equal(batch17.publication_approved,false);

assert.equal(htmls[0],htmls[1],"Portable and legacy review HTML must remain identical");
for(const html of htmls){
 const inline=html.match(/<script>window\.AO_M6_COMPARISON_BATCH=([\s\S]*?);<\/script>/);
 assert.ok(inline,"Missing inline staged source review dataset");
 assert.deepEqual(JSON.parse(inline[1]),batch,"Embedded batch must exactly match canonical staging file; no divergent metadata");
 const inline16=html.match(/<script>window\.AO_M6_COMPARISON_BATCH16=([\s\S]*?);<\/script>/);
 assert.ok(inline16,"Missing independent B16 inline photo data");
 assert.deepEqual(JSON.parse(inline16[1]),batch16,"Second source-owned batch differs between JSON and offline gallery");
 const inline17=html.match(/<script>window\.AO_M6_COMPARISON_BATCH17=([\s\S]*?);<\/script>/);
 assert.ok(inline17,"Missing independent B17 inline photo data");
 assert.deepEqual(JSON.parse(inline17[1]),batch17,"Third source-owned batch differs between JSON and offline gallery");
 assert.ok(html.includes("AO_M6_COMPARATIVE"));
 assert.ok(html.includes("UNAPPROVED STAGED LEAD"));
}
console.log("PASS M6 B15+B16+B17 source integrity",JSON.stringify({canonical:112,staged:26,objects:170,metadataComparableGroups:5,patens:4,ciboria:4,published:false}));
