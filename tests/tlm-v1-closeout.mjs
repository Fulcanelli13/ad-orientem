// One authoritative, fail-closed TLM Atlas V1 release gate.
// A "complete" directory means every existing entry is accessible and
// accurately labelled. It DOES NOT mean all Mass times or church operators are
// independently verified, nor that any institution endorsed the application.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {attachInstitutionalMinistryLiturgy} from "../src/find/tlm-institutional-rite-missal.js";
import {attachCL2SiteCategories} from "../src/find/tlm-site-category-associations.js";
import {attachCL2ExactVenueCategoryWitnesses} from "../src/find/tlm-exact-venue-categories.js";
import {directoryVenueVisualPolicy} from "../src/find/tlm-venue-visual-policy.js";
import {eligibleRenderedDirectoryImage,eligibleVenueImage,renderDirectoryVenueCard,
 renderDirectoryIdentityFallback} from "../src/find/directory-card.js";
import {MASS_EMBLEM_GROUPS,MASS_INSTITUTION_EMBLEMS} from "../src/find/institution-emblems.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites}
 from "../src/find/preliminary-directory-r49.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const close=read("data/directory/tlm-v1-release-closeout.v1.json");
const sources=close.source_of_truth;
assert.equal(close.schema,"AO_TLM_V1_RELEASE_CLOSEOUT_V1");
assert.equal(close.publication_standard,
 "ALL_EXISTING_VENUES_FINDABLE_VISUALIZED_AND_TRUTHFULLY_SOURCE_CLASSIFIED_NOT_ALL_TIMETABLES_INDEPENDENTLY_VERIFIED");
assert.equal(close.state,"FINAL_ACCEPTANCE_CANDIDATE");

const index=validateCL2PhysicalIndex(read(sources.physical_index));
const matrix=read(sources.source_category);
const witnesses=read(sources.exact_category_witnesses);
const heldCategories=read(sources.category_holds);
const ministry=read(sources.ministry);
const heldMinistry=read(sources.ministry_holds);
const media=read(sources.photo_registry);
const photoRelease=read(sources.photo_holds);
const emblems=read(sources.emblem_crosswalk);
const C=close.census;

assert.equal(index.records.length,C.canonical_physical_sites);
const base=index.records.map(r=>({
 kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",
 physical_group_id:r[0],source_ids:r[1],source_id:r[1][0],
 title:r[2],community_id:"OTHER",item_id:"tlm:cl2:"+r[0],
 status:"RESEARCH-LISTED · MASS UNVERIFIED",sections:[],source_links:[],
}));
const classified=attachCL2ExactVenueCategoryWitnesses(
 attachCL2SiteCategories(attachInstitutionalMinistryLiturgy(base,ministry),index,matrix),
 index,witnesses);
assert.equal(classified.length,2580);
const byAnchor=new Map(classified.map(x=>[x.physical_group_id,x]));
const bySource=new Map();
for(const row of index.records)for(const sourceId of row[1]){
 assert.ok(!bySource.has(sourceId),"Duplicate canonical source ID "+sourceId);
 bySource.set(sourceId,row);
}
const visualCount={DIOCESAN_PHOTO:0,EMBLEM_OR_NEUTRAL:0,NEUTRAL:0};
for(const site of classified){
 const p=directoryVenueVisualPolicy(site);
 assert.ok(Object.hasOwn(visualCount,p.lane),"No visual lane "+site.physical_group_id);
 visualCount[p.lane]++;
 // No cover or network request is needed to render a complete bilingual
 // visual fallback, including on an offline 320px device.
 for(const lang of ["en","fr"]){
  const html=renderDirectoryIdentityFallback(site,lang);
  assert.match(html,/aoTlmVenueIdentity/);
  assert.match(html,/data-visual-kind="(?:emblem|named|neutral)"/);
 }
}
assert.deepEqual(visualCount,C.visual_lane_counts);

const categoryHolds=new Set(heldCategories.records.map(r=>r.cl2_anchor));
assert.equal(categoryHolds.size,C.explicit_category_holds);
assert.equal(2580-categoryHolds.size,C.categorized_with_positive_source_or_first_party_witness);
for(const record of heldCategories.records){
 const site=byAnchor.get(record.cl2_anchor);
 assert.ok(site&&site.site_category.visual_lane==="NEUTRAL",
  "Unverified category gained an institution crest: "+record.cl2_anchor);
 assert.ok(["UNRESOLVED","DIRECTORY_GROUP_ONLY"].includes(site.site_category.category));
 assert.ok(!site.site_category.reported_group_hint);
 assert.equal(site.site_category.source_scope,"CL2_SOURCE_REPORTED_NOT_VENUE_OWNERSHIP");
}

assert.equal(ministry.records.length,C.source_scoped_institute_ministry_links);
assert.equal(classified.filter(x=>x.institutional_liturgy).length,C.sites_with_source_scoped_ministry_links);
assert.equal(heldMinistry.records.length,C.unresolved_ministry_role_holds);
assert.equal(ministry.holds.length,C.crosswalk_anchor_disagreements);
const allowedMinistrySourceIds=new Set(ministry.records.map(r=>r[1]));
for(const r of heldMinistry.records){
 assert.ok(byAnchor.has(r.physical_anchor));
 assert.ok(!allowedMinistrySourceIds.has(r.original_source_id),
  "Held ministry was promoted without a new source witness: "+r.original_source_id);
 assert.ok(!byAnchor.get(r.physical_anchor).institutional_liturgy,
  "A held source inherited venue-wide liturgical books");
}
for(const hold of ministry.holds){
 assert.equal(hold.reason,"RESEARCH_TO_LIVE_CL2_ANCHOR_DISAGREES_HOLD");
 assert.notEqual(hold.research_anchor,hold.live_anchor);
 assert.ok(!allowedMinistrySourceIds.has(hold.source_id));
}

const r49=projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json"));
const provisional=projectPublishedProvisionalMassSites(r49,
 read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const publicDirectory=projectCL2PhysicalDirectory(provisional,index);
assert.equal(publicDirectory.length,C.public_directory_cards);
assert.equal(publicDirectory.filter(x=>x.map_publishable).length,C.mapped_public_records);
assert.equal(publicDirectory.filter(x=>!x.map_publishable).length,C.list_only_public_records);

assert.equal(media.schema,"AO_APPROVED_TLM_VENUE_MEDIA_V1");
assert.equal(media.items.length,C.approved_exact_venue_photos);
const uniqueMedia=new Set(),uniquePaths=new Set();
const coveredLanes={DIOCESAN_PHOTO:0,EMBLEM_OR_NEUTRAL:0,NEUTRAL:0};
for(const photo of media.items){
 assert.ok(!uniqueMedia.has(photo.venue_id),"Duplicate exact venue photograph");
 assert.ok(!uniquePaths.has(photo.asset_path),"Duplicate approved binary path");
 uniqueMedia.add(photo.venue_id);uniquePaths.add(photo.asset_path);
 const indexRow=bySource.get(photo.venue_id);
 assert.ok(indexRow,"Orphan approved exact-venue photo: "+photo.venue_id);
 const site=byAnchor.get(indexRow[0]);
 assert.ok(site);
 const exactItem={...site,source_id:photo.venue_id,cover_media:photo};
 assert.ok(eligibleVenueImage(photo,photo.venue_id));
 assert.equal(eligibleRenderedDirectoryImage(photo,exactItem),true,
  "An independently source-verified photograph must not be suppressed by a site category");
 coveredLanes[directoryVenueVisualPolicy(exactItem).lane]++;
 const bytes=readFileSync(new URL("../"+photo.asset_path,import.meta.url));
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(bytes).digest("hex"),photo.derivative_sha256);
 for(const lang of ["en","fr"]){
  const html=renderDirectoryVenueCard(exactItem,lang);
  assert.ok(html.includes('data-visual-kind="photo"'));
  assert.ok(html.includes('src="'+photo.asset_path+'"'));
  const alt=String(lang==="fr"?photo.alt_fr:photo.alt_en).replace(/[&<>"']/g,
   ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  assert.ok(html.includes('alt="'+alt+'"'));
 }
 assert.equal(eligibleRenderedDirectoryImage(photo,{...exactItem,source_id:"unrelated-venue"}),false);
}
assert.deepEqual(coveredLanes,{DIOCESAN_PHOTO:26,EMBLEM_OR_NEUTRAL:1,NEUTRAL:1});
assert.equal(uniqueMedia.size,28);

const heldPhotoAnchors=new Set(photoRelease.held.map(x=>x.cl2_anchor));
assert.equal(photoRelease.held.length,C.exact_photo_held);
assert.deepEqual(heldPhotoAnchors,new Set(close.held_photo_venues.map(x=>x.cl2_anchor)));
for(const held of photoRelease.held){
 assert.ok(byAnchor.has(held.cl2_anchor));
 assert.ok(bySource.has(held.venue_id));
 assert.ok(!uniqueMedia.has(held.venue_id),
  "Unresolved exact site or unsuitable image was wrongly published");
}

assert.equal(emblems.records.length,C.institution_group_dispositions);
const groups=new Set(),dispositionCount={
 RESEARCH_LICENSED_EMBLEM_RENDERED:0,
 EXACT_SOURCE_LABEL_PLAIN_TEXT_MARK:0,
 NO_SINGLE_GROUP_EMBLEM_BY_DESIGN:0,
 NAMED_SOURCE_OR_NEUTRAL_FALLBACK:0,
};
const registryGroups=new Set(MASS_EMBLEM_GROUPS);
for(const group of emblems.records){
 assert.ok(!groups.has(group.group_code),"Duplicate source group disposition");
 groups.add(group.group_code);
 assert.ok(Object.hasOwn(dispositionCount,group.visual_release),
  "Uncategorised institution identity "+group.group_code);
 dispositionCount[group.visual_release]++;
 assert.equal(group.image_reuse_final_approved,false,
  "Research licenses do not automatically clear commercial insignia rights");
 if(group.visual_release==="RESEARCH_LICENSED_EMBLEM_RENDERED"){
  assert.ok(registryGroups.has(group.group_code),
   "Research image mapping missing in current map/card renderer");
  const image=MASS_INSTITUTION_EMBLEMS[group.group_code];
  assert.ok(image.image.startsWith("https://")&&image.source.startsWith("https://"));
  assert.equal(image.reviewBeforeCommercialRelease,true);
 }else{
  assert.ok(!registryGroups.has(group.group_code),
   "An unresolved/text-only organisation received an emblem");
 }
}
assert.equal(registryGroups.size,C.institution_image_mappings_research_licensed);
assert.equal(dispositionCount.RESEARCH_LICENSED_EMBLEM_RENDERED,C.institution_image_mappings_research_licensed);
assert.equal(dispositionCount.EXACT_SOURCE_LABEL_PLAIN_TEXT_MARK,C.institution_text_fallbacks);
assert.equal(dispositionCount.NO_SINGLE_GROUP_EMBLEM_BY_DESIGN,C.institution_neutral_family_fallbacks);
assert.equal(dispositionCount.NAMED_SOURCE_OR_NEUTRAL_FALLBACK,C.institution_named_or_neutral_fallbacks);
assert.equal(emblems.summary.rows_final_user_publication_approved,
 C.institution_final_user_image_approvals);

console.log("TLM_V1_CLOSEOUT_PASS "+JSON.stringify({
 public_cards:publicDirectory.length,mapped:C.mapped_public_records,list_only:C.list_only_public_records,
 physical_sites:classified.length,categorized:C.categorized_with_positive_source_or_first_party_witness,
 exact_category_holds:C.explicit_category_holds,ministry_source_links:ministry.records.length,
 ministry_holds:C.unresolved_ministry_role_holds,identity_conflicts:C.crosswalk_anchor_disagreements,
 visual_lanes:visualCount,approved_exact_photos:uniqueMedia.size,
 shown_exact_photo_lanes:coveredLanes,held_photos:heldPhotoAnchors.size,
 institution_group_dispositions:groups.size,emblem_rights_status:"RESEARCH_ONLY_NOT_COMMERCIAL_SIGNOFF"
}));
