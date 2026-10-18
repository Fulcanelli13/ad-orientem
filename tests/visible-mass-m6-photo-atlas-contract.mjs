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
 assert.ok(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(image.source_url)||image.asset_id==="M6B4-BK02-CASON-1962-MISSAL-STAND"&&image.source_url==="https://sdcason.com/1962-roman-missal-at-latin-mass-2022-virginia-usa-catholic-stock-photo/","Every record must have an authorised original source PAGE: "+image.asset_id);
 if(image.asset_id.startsWith("EXISTING-")) assert.equal(image.review_status,"LEGACY_RESEARCH_NOT_PUBLISHABLE");
}

const batch2=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH2");
assert.equal(batch2.length,7,"Second M6 acquisition batch must remain accounted for");
assert.deepEqual(batch2.map(x=>x.object_id).sort(),["AL13","VE02","VE05","VE06","VE07","VE08","VE09"]);
for(const x of batch2){
 assert.equal(x.medium,"photograph");
 assert.ok(x.creator&&x.licence&&x.license_url&&x.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.equal(x.review_status,"SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL");
 assert.ok(x.width>1000&&x.height>1000,"Candidate needs useful full-resolution source");
}
const photographSourceById=new Map(atlas.images.map(x=>[x.asset_id,x]));
const qualifyingPhoto=(o)=>o.candidate_assets.some(({asset_id})=>{
 const asset=photographSourceById.get(asset_id);
 return Boolean(asset&&asset.medium==="photograph"&&asset.licence&&!["DISCOVERY_ONLY_UNVERIFIED_SOURCE_RIGHTS","PARTIAL_COMPONENT_ONLY"].includes(asset.review_status));
});
assert.ok(atlas.objects.every(o=>o.needs_photo===!qualifyingPhoto(o)),"Historical illustrations and unverified leads must not count as qualifying photographs");
assert.equal(atlas.objects.filter(qualifyingPhoto).length,45);
assert.equal(atlas.objects.filter(o=>o.needs_photo).length,125);
assert.equal(atlas.statistics.post_second_batch_photo_candidate_or_hotspot,30);
assert.equal(atlas.statistics.post_second_batch_needs_photo,140);
assert.deepEqual(atlas.objects.filter(o=>o.pilot_30&&o.needs_photo).map(o=>o.object_id).sort(),["AL17","AL18"]);
assert.equal(atlas.images.length,56);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,53);


const batch3=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH3");
assert.equal(batch3.length,6,"Third M6 acquisition batch must remain accounted for");
assert.deepEqual(batch3.map(x=>x.object_id).sort(),["LN04","LN05","VE12","VE13","VE16","VE17"]);
for(const x of batch3){
 assert.equal(x.medium,"photograph");
 assert.ok(x.creator&&x.licence&&x.license_url&&x.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.equal(x.review_status,"SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL");
}
const gam=atlas.images.find(x=>x.asset_id==="M6B3-VE16-18-19-GAMMARELLI-INSIGNIA-CONTEXT");
for(const id of ["VE16","VE18","VE19"]){
 const o=atlas.objects.find(x=>x.object_id===id);
 assert.ok(o.candidate_assets.some(x=>x.asset_id===gam.asset_id),"Shared Gammarelli original must be linked, not copied, for "+id);
}
assert.ok(gam.width<1000&&gam.role==="context_detail","Low-resolution Gammarelli must not claim high-res object detail");
assert.equal(atlas.objects.filter(o=>!o.needs_photo).length,45);
assert.equal(atlas.objects.filter(o=>o.needs_photo).length,125);
assert.equal(atlas.statistics.post_third_batch_photo_candidate_or_hotspot,38);
assert.equal(atlas.statistics.post_third_batch_needs_photo,132);
assert.deepEqual(atlas.objects.filter(o=>o.pilot_30&&o.needs_photo).map(o=>o.object_id).sort(),["AL17","AL18"]);
assert.equal(atlas.objects.filter(o=>o.zone_id==="VE"&&!o.needs_photo).length,17);
assert.equal(atlas.images.length,56);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,53);


const batch4=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH4");
assert.equal(batch4.length,4);
assert.deepEqual(batch4.map(x=>x.object_id).sort(),["BK02","VE04","VE14","VE20"]);
const cason=batch4.find(x=>x.object_id==="BK02");
assert.equal(cason.licence.startsWith("CC BY 4.0"),true);
assert.equal(cason.rights_evidence_url,"https://sdcason.com/copyright/");
assert.equal(cason.review_status,"SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL");
assert.ok(cason.source_description.includes("public domain")&&cason.source_description.includes("CC BY 4.0"),
  "Preserve the photographer-site rights conflict; use more restrictive attribution");
const ve20=atlas.objects.find(x=>x.object_id==="VE20");
assert.ok(ve20.needs_photo);
assert.ok(ve20.required_missing_components.includes("pontifical buskins"));
assert.ok(ve20.required_missing_components.includes("pontifical sandals"));
assert.equal(batch4.find(x=>x.object_id==="VE20").review_status,"PARTIAL_COMPONENT_ONLY");
const gradine=atlas.objects.find(x=>x.object_id==="AL10");
assert.ok(!gradine.needs_photo&&gradine.context_scene_lead?.source_asset_id==="BROMPTON_ALTAR_1");
for(const [id,viewerSide] of [["AL17","RIGHT"],["AL18","LEFT"]]){
 const o=atlas.objects.find(x=>x.object_id===id);
 assert.ok(o.needs_photo&&o.orientation_annotation.source_asset_id==="BROMPTON_ALTAR_2019_GEOGRAPH");
 assert.equal(o.orientation_annotation.viewer_side,viewerSide);
 assert.equal(o.orientation_annotation.state,"RESEARCH_ONLY_DIRECTIONAL_RULE_NOT_AUTHORISED_AS_HOTSPOT");
}
assert.equal(atlas.statistics.post_fourth_batch_photo_candidate_or_hotspot,41);
assert.equal(atlas.statistics.post_fourth_batch_needs_photo,129);
assert.equal(atlas.statistics.post_fourth_batch_pilot_needs_photo,3);
assert.equal(atlas.objects.filter(o=>o.zone_id==="VE"&&!o.needs_photo).length,17);
assert.equal(atlas.images.length,56);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,53);


const batch5=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH5");
assert.equal(batch5.length,4);
assert.deepEqual(batch5.map(x=>x.object_id).sort(),["AL10","VE01","VE03","VE11"]);
for(const x of batch5){
 assert.equal(x.medium,"photograph");
 assert.equal(x.review_status,"SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL");
 assert.ok(x.creator&&x.licence&&x.license_url&&x.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.ok(x.width>2500&&x.height>2000);
}
assert.equal(batch5.find(x=>x.object_id==="VE11").role,"context_detail");
assert.ok(batch5.find(x=>x.object_id==="VE11").source_description.includes("not a Traditional Latin Mass"));
const v15=atlas.objects.find(o=>o.object_id==="VE15");
assert.equal(v15.coverage_scope,"COMPOSITE_FIVE_COLOR_REQUIREMENT");
assert.deepEqual(v15.required_colors_1962,["white","red","green","violet","black"]);
assert.equal(v15.needs_photo,true);
const v10=atlas.objects.find(o=>o.object_id==="VE10");
assert.ok(v10.needs_photo&&v10.difference_from_dalmatic_note.includes("subdeacon"));
const gradineSources=atlas.objects.find(o=>o.object_id==="AL10").context_scene_lead;
assert.ok(gradineSources.additional_rights_unknown_research_url.startsWith("https://www.friendsofflorence.org/"));
const ars=batch5.find(x=>x.object_id==="AL10");
assert.equal(ars.external_object_record_url,"https://pop.culture.gouv.fr/notice/palissy/PM01002646");
assert.match(ars.source_description,/Pixel-level gradine boundaries remain unreviewed/);
assert.equal(ars.role,"context_detail");
assert.ok(!atlas.objects.find(o=>o.object_id==="AL10").needs_photo);

assert.equal(atlas.statistics.post_fifth_batch_photo_candidate_or_hotspot,45);
assert.equal(atlas.statistics.post_fifth_batch_needs_photo,125);
assert.equal(atlas.statistics.post_fifth_batch_pilot_needs_photo,2);
assert.equal(atlas.statistics.post_fifth_batch_vestment_photo_candidates,17);
assert.equal(atlas.images.length,56);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,53);

console.log("PASS M6 integrity",JSON.stringify({objects:170,zones:13,pilot:30,legacyImages:original.assets.length,m5Photos:m5.length+3,
 markers:6,newResearchCandidates:6,unservedExisting:147,glossaryMatches:glCounts}));
