import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const file=async x=>readFile(resolve(root,x),"utf8");
const [atlas,matrix,original,pilot,views]=await Promise.all([
 file("previews/visible-mass-3d/M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json").then(JSON.parse),
 file("previews/visible-mass-3d/PHASE1_OBJECT_QUESTION_RECONCILIATION_20261017.md"),
 file("previews/visible-mass-3d/sanctuary-inspection-sources-20261017.v1.json").then(JSON.parse),
 file("previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json").then(JSON.parse),
 file("previews/visible-mass-3d/visible-mass-m5-photographs.mjs")
]);
assert.equal(atlas.status,"RESEARCH_ONLY_NOT_PUBLICATION_APPROVED");
assert.equal(atlas.statistics.object_count,170);
assert.equal(atlas.objects.length,170);
const official=[...matrix.matchAll(/^\| ([A-Z]{2}\d{2}) \| ([^|]+)\|/gm)].map(m=>[m[1],m[2].trim()]);
assert.equal(official.length,170);
assert.deepEqual(atlas.objects.map(v=>[v.object_id,v.label]),official,"Atlas must be an exact projection of 170 canonical research object rows");
assert.equal(new Set(atlas.objects.map(x=>x.object_id)).size,170);
assert.equal(new Set(atlas.objects.map(x=>x.zone_id)).size,13);
assert.deepEqual(atlas.objects.filter(x=>x.pilot_30).map(x=>x.object_id).sort(),
 pilot.objects.map(x=>x.object_id).sort(),"All 30 original sanctuary subjects must remain");
assert.equal(atlas.images.filter(x=>x.asset_id.startsWith("EXISTING-")).length,original.assets.length);
for(const item of original.assets){
 const image=atlas.images.find(x=>x.asset_id==="EXISTING-"+item.object_id);
 assert.ok(image);assert.equal(image.source_url,item.source_url);
 assert.equal(image.creator,item.creator);assert.equal(image.licence,item.licence);
 assert.equal(image.object_id,item.object_id);
}
const sourceIds=new Set(atlas.images.map(x=>x.asset_id));
assert.equal(sourceIds.size,atlas.images.length,"No duplicate image identity");
assert.equal(atlas.images.filter(x=>x.role==="360_environment").length,2);
const m5=[...views.matchAll(/^\s*([A-Z][A-Z0-9_]+):Object\.freeze\(\{/gm)].map(m=>m[1]);
assert.equal(m5.length,9);
for(const key of m5)assert.ok(sourceIds.has(key),"Missing an M5 close photographic viewpoint: "+key);
const six=["AL01","AL06","AL07","AL19","SN02","SN04"];
for(const id of six){
 const subject=atlas.objects.find(x=>x.object_id===id);
 assert.equal(subject.evidence_status,"PROVISIONAL_ORIGINAL_STILL_HOTSPOT");
 assert.equal(subject.candidate_assets[0].asset_id,"BROMPTON_ALTAR_2019_GEOGRAPH");
 assert.equal(subject.candidate_assets[0].role,"context_hotspot");
}
const originalRefs=new Set(original.assets.map(x=>x.object_id));
assert.equal(atlas.objects.filter(x=>!originalRefs.has(x.object_id)&&!six.includes(x.object_id)).length,147);
const newCandidates=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_WEB");
assert.equal(newCandidates.length,6);
for(const image of newCandidates){
 assert.ok(atlas.objects.some(o=>o.object_id===image.object_id),"Research lead must attach to existing physical object");
 assert.ok(image.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.ok(image.review_status!=="PUBLISHED"&&image.review_status!=="APPROVED");
 if(image.review_status==="SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL")
  assert.ok(image.creator&&image.licence&&image.license_url,"New licensed candidate must include provenance");
 if(image.review_status==="DISCOVERY_ONLY_UNVERIFIED_SOURCE_RIGHTS"){
  assert.equal(image.creator,null);assert.equal(image.licence,null);
 }
}
const zonal=atlas.zones.reduce((sum,x)=>sum+x.total,0);assert.equal(zonal,170);
const glCounts=atlas.objects.reduce((a,x)=>(a[x.glossary_match]=(a[x.glossary_match]||0)+1,a),{});
assert.deepEqual(glCounts,{R:86,M:21,D:63},"Do not upgrade related or missing glossary matches");
for(const image of atlas.images){
 assert.ok(/^https:\/\/(?:commons\.wikimedia\.org)/.test(image.source_url),"All photo records must expose a verified Commons *source page* (not merely raw image): "+image.asset_id);
 if(image.asset_id.startsWith("EXISTING-")) assert.equal(image.review_status,"LEGACY_RESEARCH_NOT_PUBLISHABLE");
}
console.log("PASS M6 integrity",JSON.stringify({objects:170,zones:13,pilot:30,legacyImages:original.assets.length,m5Photos:m5.length+3,
 markers:6,newResearchCandidates:6,unservedExisting:147,glossaryMatches:glCounts}));
