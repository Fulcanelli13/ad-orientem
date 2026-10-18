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
assert.equal(atlas.objects.filter(qualifyingPhoto).length,89);
assert.equal(atlas.objects.filter(o=>o.needs_photo).length,81);
assert.equal(atlas.statistics.post_second_batch_photo_candidate_or_hotspot,30);
assert.equal(atlas.statistics.post_second_batch_needs_photo,140);
assert.deepEqual(atlas.objects.filter(o=>o.pilot_30&&o.needs_photo).map(o=>o.object_id).sort(),["AL17","AL18"]);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);


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
assert.equal(atlas.objects.filter(o=>!o.needs_photo).length,89);
assert.equal(atlas.objects.filter(o=>o.needs_photo).length,81);
assert.equal(atlas.statistics.post_third_batch_photo_candidate_or_hotspot,38);
assert.equal(atlas.statistics.post_third_batch_needs_photo,132);
assert.deepEqual(atlas.objects.filter(o=>o.pilot_30&&o.needs_photo).map(o=>o.object_id).sort(),["AL17","AL18"]);
assert.equal(atlas.objects.filter(o=>o.zone_id==="VE"&&!o.needs_photo).length,20);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);


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
assert.ok(!ve20.needs_photo);
assert.deepEqual(ve20.required_missing_components,[]);
assert.equal(ve20.composite_photo_requirements.photographic_completeness,"THREE_COMPONENT_REFERENCES_PRESENT_NOT_EDITORIALLY_APPROVED");
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
assert.equal(atlas.objects.filter(o=>o.zone_id==="VE"&&!o.needs_photo).length,20);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);


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
assert.equal(v15.needs_photo,false);
const v10=atlas.objects.find(o=>o.object_id==="VE10");
assert.ok(!v10.needs_photo&&v10.difference_from_dalmatic_note.includes("subdeacon"));
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
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);


const batch6=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH6");
assert.equal(batch6.length,9);
assert.deepEqual([...new Set(batch6.map(x=>x.object_id))].sort(),["BK08","BK10","SA01","SC01","SE13","SP02","VE10","VE20"]);
for(const image of batch6){
 assert.ok(image.creator&&image.licence&&image.license_url&&image.venue,"Mandatory provenance for "+image.asset_id);
 assert.ok(image.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"),"Missing original source "+image.asset_id);
 assert.equal(image.medium,"photograph");
 assert.equal(image.review_status,"SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL");
}
const photoIds = new Set(atlas.images.map(x=>x.asset_id));
const requiredComponents=ve20.composite_photo_requirements.components;
assert.deepEqual(Object.keys(requiredComponents).sort(),["buskins","gloves","sandals"]);
for(const [key,asset] of Object.entries(requiredComponents)){
 assert.ok(photoIds.has(asset),"Missing composite VE20 component "+key);
 assert.ok(ve20.candidate_assets.some(r=>r.asset_id===asset),"Missing source link for composite VE20 component "+key);
}
assert.equal(batch6.filter(x=>x.object_id==="VE20").length,2,"Do not duplicate original pontifical gloves");
assert.equal(atlas.objects.filter(o=>o.zone_id==="VE"&&!o.needs_photo).length,20);
assert.equal(atlas.objects.find(o=>o.object_id==="VE15").needs_photo,false,"All five photographed colours now present");
const orientationIDs=atlas.objects.filter(o=>["AL17","AL18"].includes(o.object_id));
assert.ok(orientationIDs.every(o=>o.needs_photo),"Directional notes must not count as photo assets");
assert.equal(atlas.statistics.post_sixth_batch_photo_candidate_or_hotspot,53);
assert.equal(atlas.statistics.post_sixth_batch_needs_photo,117);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);


const batch7=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH7");
assert.equal(batch7.length,2);
assert.deepEqual(batch7.map(x=>x.object_id).sort(),["DV06","EN05"]);
assert.equal(batch7.find(x=>x.object_id==="EN05").creator,"Sailko");
assert.equal(batch7.find(x=>x.object_id==="DV06").creator,"AndyScott");
assert.ok(batch7.every(x=>x.venue&&x.licence&&x.review_status==="SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL"));
for(const zone of atlas.zones){
 assert.ok(atlas.objects.some(o=>o.zone_id===zone.id&&!o.needs_photo),"Photographic reference absent for entire zone "+zone.id);
}
assert.equal(atlas.statistics.all_zones_have_initial_photographic_reference,true);
assert.equal(atlas.statistics.post_seventh_batch_photo_candidate_or_hotspot,55);
assert.equal(atlas.statistics.post_seventh_batch_needs_photo,115);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);
assert.deepEqual(atlas.objects.filter(o=>o.pilot_30&&o.needs_photo).map(o=>o.object_id).sort(),["AL17","AL18"]);
for(const id of ["AL17","AL18"]){
 const o=atlas.objects.find(x=>x.object_id===id),r=o.orientation_annotation.source_frame_review;
 assert.equal(r.source_url,"https://commons.wikimedia.org/wiki/File:The_High_Altar_-_geograph.org.uk_-_6213275.jpg");
 assert.equal(r.creator,"Anthony O'Neil");
 assert.equal(r.exif_orientation,"Normal");
 assert.equal(r.viewer_position,"NAVE_FACING_HIGH_ALTAR");
 assert.equal(r.directional_label_supported,true);
 assert.equal(r.independent_object_photo,false);
 assert.equal(r.no_pixel_coordinates_proposed,true);
 assert.equal(r.approval,"RESEARCH_ONLY_NOT_RELEASE_SIGNOFF");
 assert.equal(o.needs_photo,true);
}
assert.equal(atlas.statistics.sanctuary_original_source_directional_notes_verified,2);


const batch8=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH8");
assert.equal(batch8.length,5);
assert.ok(batch8.every(x=>x.object_id==="VE15"&&x.medium==="photograph"&&x.creator&&x.licence&&x.review_status==="SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL"));
const colors=["white","red","green","violet","black"];
assert.deepEqual(batch8.map(x=>x.liturgical_color),colors);
const colorSet=atlas.objects.find(o=>o.object_id==="VE15");
assert.deepEqual(Object.keys(colorSet.color_set_photo_requirements.colors),colors);
assert.equal(colorSet.color_set_photo_requirements.nature,"INDEPENDENT_PHOTOGRAPHS_NOT_MATCHING_SET");
assert.match(colorSet.color_set_photo_requirements.limitations,/violet lacks independently established Roman Catholic venue/);
for(const x of colors){
 const aid=colorSet.color_set_photo_requirements.colors[x];
 assert.ok(batch8.some(v=>v.asset_id===aid&&v.liturgical_color===x));
 assert.ok(colorSet.candidate_assets.some(v=>v.asset_id===aid));
}
assert.equal(atlas.statistics.post_eighth_batch_photo_candidate_or_hotspot,56);
assert.equal(atlas.statistics.post_eighth_batch_needs_photo,114);
assert.equal(atlas.statistics.post_eighth_batch_vestment_photo_candidates,20);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);


const batch9=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH9");
assert.equal(batch9.length,3,"Exactly three new original source photographs");
assert.deepEqual(batch9.map(x=>x.object_id).sort(),["EQ07","SA05","SE01"]);
for(const im of batch9)assert.ok(im.creator&&im.licence&&im.license_url&&im.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
const double=atlas.images.find(x=>x.asset_id==="M6B9-EQ07-EQ08-TUSCAN-THURIBLE-BOAT");
assert.deepEqual(double.linked_object_ids,["EQ07","EQ08"]);
for(const id of double.linked_object_ids){
 const obj=atlas.objects.find(x=>x.object_id===id);
 assert.ok(!obj.needs_photo);
 assert.ok(obj.candidate_assets.some(c=>c.asset_id===double.asset_id),"Shared photo linkage "+id);
}
assert.equal(atlas.statistics.post_ninth_batch_photo_candidate_or_hotspot,60);
assert.equal(atlas.statistics.post_ninth_batch_needs_photo,110);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);


const batch10=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH10");
assert.equal(batch10.length,7,"Seven independently sourced new photos, no duplicate M5 images");
assert.deepEqual(batch10.map(x=>x.object_id).sort(),["BK07","DV07","EN01","EN06","EN06","EN10","SE10"]);
for(const image of batch10){
 assert.ok(image.creator&&image.licence&&image.license_url&&image.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"),
  "Batch ten candidate must retain original photographer and rights: "+image.asset_id);
 assert.equal(image.review_status,"SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL");
 assert.equal(image.medium,"photograph");
}
const sharedBrompton=batch10.find(x=>x.asset_id==="M6B10-EN06-07-09-BROMPTON-NAVE-DILIFF");
assert.deepEqual(sharedBrompton.linked_object_ids,["EN06","EN07","EN09"]);
for(const id of sharedBrompton.linked_object_ids){
 assert.ok(atlas.objects.find(o=>o.object_id===id)?.candidate_assets.some(c=>c.asset_id===sharedBrompton.asset_id),
  "Single photographic asset must be linked to "+id);
}
assert.ok(atlas.objects.find(o=>o.object_id==="EN09").image_evidence_limit.includes("no click area authorised"));
assert.equal(batch10.find(x=>x.object_id==="EN01").width,640,"Do not overstate low-resolution entrance");
assert.ok(batch10.find(x=>x.object_id==="BK07").source_description.includes("1962-specific liturgical use not established"));
assert.ok(batch10.find(x=>x.object_id==="SE10").source_description.includes("do not represent as a photograph of a 1962-procession rite"));
const reused=[["DV01","BROMPTON_LADY_ALTAR"],["BK12","NEWMAN_PULPIT"]];
for(const [id,aid] of reused){
 const subject=atlas.objects.find(o=>o.object_id===id);
 assert.equal(subject.evidence_status,"EXISTING_M5_PHOTO_REUSED");
 assert.ok(subject.candidate_assets.some(x=>x.asset_id===aid),"Existing M5 source not linked: "+id);
 assert.equal(atlas.images.filter(i=>i.asset_id===aid).length,1,"No image identity duplication");
}
assert.equal(atlas.statistics.tenth_batch_new_original_photo_records,7);
assert.equal(atlas.statistics.tenth_batch_m5_records_reused_without_duplication,2);
assert.equal(atlas.statistics.tenth_batch_new_photo_covered_objects,10);
assert.equal(atlas.statistics.post_tenth_batch_photo_candidate_or_hotspot,70);
assert.equal(atlas.statistics.post_tenth_batch_needs_photo,100);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);


const batch11=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH11");
assert.equal(batch11.length,9);
const expected11=["BK09","BK11","DV05","DV08","SE02","SE03","SE05","SE06","SE14"];
assert.deepEqual(batch11.map(x=>x.object_id).sort(),expected11);
for(const photo of batch11){
 assert.ok(photo.creator&&photo.licence&&photo.license_url&&photo.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.equal(photo.medium,"photograph");
 assert.equal(photo.review_status,"SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL");
 assert.ok(photo.width>0&&photo.height>0);
 assert.ok(photo.source_description.length>90,"Protect medium/period and venue distinctions");
}
assert.ok(batch11.find(x=>x.object_id==="BK11").source_description.includes("1961 Pontificale Romanum"));
assert.equal(batch11.find(x=>x.object_id==="BK11").creator,"Darth Stabro");
assert.ok(batch11.find(x=>x.object_id==="BK09").width===600,"Do not represent historic 1748 antiphonary as high-res or 1962");
assert.ok(batch11.find(x=>x.object_id==="SE02").venue_verification_url==="https://www.stpancraschurch.org.uk/");
assert.ok(batch11.find(x=>x.object_id==="SE03").review_visibility_requirement.includes("MUST_BE_DIRECTLY_VISIBLE"));
assert.ok(batch11.find(x=>x.object_id==="SE06").source_description.includes("NOT proof of the 1962"));
assert.equal(batch11.find(x=>x.object_id==="SE14").creator,"Bhuck");
assert.equal(atlas.statistics.eleventh_batch_new_licensed_photos,9);
assert.equal(atlas.statistics.post_eleventh_batch_photo_candidate_or_hotspot,79);
assert.equal(atlas.statistics.post_eleventh_batch_needs_photo,91);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);
assert.equal(atlas.objects.filter(o=>o.zone_id==="SE"&&!o.needs_photo).length,8);
assert.equal(atlas.objects.filter(o=>o.zone_id==="BK"&&!o.needs_photo).length,8);


const batch12=atlas.images.filter(x=>x.source_index==="M6_RESEARCH_20261018_BATCH12");
assert.equal(batch12.length,10);
assert.deepEqual(batch12.map(x=>x.object_id).sort(),["BK06","BK13","BK14","DV02","DV03","DV04","DV09","DV12","SE11","SE12"]);
for(const p of batch12){
 assert.ok(p.creator&&p.licence&&p.license_url&&p.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"),
 "Complete original author, source and rights "+p.asset_id);
 assert.equal(p.medium,"photograph");
 assert.equal(p.review_status,"SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL");
 assert.ok(p.width>=2000&&p.height>=2000);
 assert.ok(p.source_description.length>85);
}
assert.equal(batch12.find(x=>x.object_id==="DV03").venue,"St Mary's Pro-Cathedral, Dublin, Ireland");
assert.ok(batch12.find(x=>x.object_id==="BK06").source_description.includes("NOT a typical Epistolary in a 1962"));
assert.ok(batch12.find(x=>x.object_id==="SE12").source_description.includes("Tridentine/Requiem Mass"));
assert.ok(batch12.find(x=>x.object_id==="DV12").source_description.includes("Catholic"));
assert.equal(atlas.statistics.twelfth_batch_new_licensed_photos,10);
assert.equal(atlas.statistics.post_twelfth_batch_photo_candidate_or_hotspot,89);
assert.equal(atlas.statistics.post_twelfth_batch_needs_photo,81);
assert.equal(atlas.images.length,101);
assert.equal(new Set(atlas.images.map(x=>x.source_url)).size,98);
assert.equal(atlas.objects.filter(o=>o.zone_id==="DV"&&o.needs_photo).length,2);
assert.equal(atlas.objects.filter(o=>o.zone_id==="BK"&&o.needs_photo).length,4);
assert.equal(atlas.objects.filter(o=>o.zone_id==="SE"&&o.needs_photo).length,4);

console.log("PASS M6 integrity",JSON.stringify({objects:170,zones:13,pilot:30,legacyImages:original.assets.length,m5Photos:m5.length+3,
 markers:6,newResearchCandidates:6,unservedExisting:147,glossaryMatches:glCounts}));
