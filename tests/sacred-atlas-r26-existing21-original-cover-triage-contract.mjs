import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const m=read("data/geography/research/sacred-atlas-round26-existing21-cover-triage-20261104.v1.json");
const prior=read("data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json");
const geo=read("data/geography/seed-registry.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const directFive=read("data/geography/research/sacred-atlas-direct-open-photo-five-release-report-20261105.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const prev151=read("data/geography/research/sacred-atlas-existing-first-151-photo-reconciliation-20261104.v1.json");
assert.equal(m.schema,"AO_SACRED_ATLAS_21_PLACE_61_EXACT_ORIGINAL_COVER_TRIAGE_V1");
assert.equal(m.publication,"RESEARCH_ONLY_SECOND_EDITOR_PENDING");
assert.equal(m.production_baseline.places,530);
assert.equal(m.production_baseline.approved_covers,379);
assert.equal(m.production_baseline.approved_gallery,42);
assert.equal(m.production_baseline.without_approved_covers,151);
assert.equal(geo.places.length,530);
// R26 is a frozen November 4 research cohort. The approved-cover registry
// is *live* and may grow independently; do not mistake legitimate later
// approvals for an R26 editorial promotion. Validate five admitted photos
// against the separately sourced November 5 release evidence instead.
assert.equal(directFive.schema,"AO_SACRED_ATLAS_DIRECT_OPEN_PHOTO_FIVE_REPORT_V1");
assert.equal(directFive.admitted_on_branch,5);
assert.equal(directFive.no_existing_covers_replaced,true);
assert.equal(directFive.accepted.length,5);
assert.ok(covers.items.length>=m.production_baseline.approved_covers+directFive.accepted.length,
  "A later release removed existing vetted covers or one of the five new admissions");
assert.ok(gallery.items.length>=m.production_baseline.approved_gallery,
  "A later release removed previously approved gallery art");
const currentCoverById=new Map(covers.items.map(c=>[c.place_id,c]));
assert.equal(currentCoverById.size,covers.items.length,
  "Approved cover registry contains duplicate canonical Place IDs");
for(const proof of directFive.accepted){
 const cover=currentCoverById.get(proof.place_id);
 assert.ok(cover,"Independently released cover missing: "+proof.place_id);
 assert.equal(cover.asset_path,proof.asset);
 assert.equal(cover.derivative_sha256,proof.derivative_sha256);
 assert.equal(cover.source_sha1,proof.original_sha1);
 assert.equal(cover.rights_verified,true);
 assert.equal(cover.subject_verified,true);
 assert.equal(cover.crop_reviewed,true);
 assert.ok(!m.rows.some(r=>r.place_id===proof.place_id),
   "Independently released cover collides with still-undecided R26 triage");
}
assert.equal(m.rows.length,23);
assert.equal(new Set(m.rows.map(x=>x.place_id)).size,23);
const priorById=new Map(prior.places.map(x=>[x.place_id,x]));
const crossById=new Map(prev151.rows.map(x=>[x.place_id,x]));
const canonicalById=new Map(geo.places.map(x=>[x.place_id,x]));
const approvedIds=new Set(covers.items.map(x=>x.place_id));
let singleton=0,multi=0,excluded=0,coverImages=0,otherImages=0,firstLooks=0,multiLooks=0,qaPages=0;
for(const row of m.rows){
 const old=priorById.get(row.place_id);
 const cross=crossById.get(row.place_id);
 const place=canonicalById.get(row.place_id);
 assert.ok(old&&cross&&place,"Unknown site in recovered source batch");
 assert.equal(row.canonical_name,place.name.official);
 assert.equal(row.place_name,old.name);
 assert.ok(!approvedIds.has(row.place_id));
 assert.ok(row.cohort===old.cohort);
 assert.equal(row.publication_authorized,false);
 assert.equal(row.exact_site_subject_verified_for_publication,false);
 assert.equal(row.original_rights_verified_for_publication,false);
 assert.equal(row.visual_mobile_crop_approved,false);
 assert.equal(row.original_sha1_has_previously_verified_byte_evidence,true);
 assert.equal(row.sourceList.length,old.images.length);
 let cn=0,gn=0;
 for(let i=0;i<row.sourceList.length;i++){
  const a=row.sourceList[i],b=old.images[i];
  assert.equal(a.source_order,i+1);
  assert.equal(a.source_title,b.file);
  assert.equal(a.source_page,b.url);
  assert.equal(a.original_sha1,b.sha1);
  assert.equal(a.original_bytes,b.bytes);
  assert.equal(a.pixel_width,b.width);
  assert.equal(a.pixel_height,b.height);
  assert.equal(a.photographer,b.author);
  assert.equal(a.license,b.license);
  assert.equal(a.license_url,b.license_url);
  assert.equal(a.role,b.role);
  assert.equal(a.byte_verified_in_previous_round,true);
  assert.equal(a.visually_approved_this_round,false);
  assert.equal(a.rights_cleared_for_publication,false);
  assert.equal(a.selection_made_by_owner,false);
  if(a.role==="COVER_CANDIDATE")cn++;else gn++;
 }
 assert.equal(row.candidate_count,cn);
 assert.equal(row.excluded_context_count,gn);
 coverImages+=cn;otherImages+=gn;
 if(cn===0){
  excluded++;
  assert.equal(row.first_look_source_title,null);
  assert.equal(row.eligibility,"GALLERY_OR_CONTEXT_ONLY_DO_NOT_PROMOTE");
  assert.equal(cross.recovery_state,"UNREVIEWED_ORIGINAL_VERIFIED_GALLERY_ONLY");
 } else if(cn===1){
  singleton++;
  assert.equal(row.eligibility,"SINGLE_ORIGINAL_COVER_CANDIDATE_REVIEW");
  assert.equal(row.first_look_source_title,old.images.find(x=>x.role==="COVER_CANDIDATE").file);
  assert.equal(cross.recovery_state,"UNREVIEWED_ORIGINAL_VERIFIED_COVER_CANDIDATE");
 } else {
  multi++;
  assert.equal(row.eligibility,"MULTI_ORIGINAL_COVER_COMPARISON");
  assert.equal(cross.recovery_state,"UNREVIEWED_ORIGINAL_VERIFIED_COVER_CANDIDATE");
 }
 if(row.first_look_source_title){
  firstLooks++;
  assert.ok(row.sourceList.some(x=>x.source_title===row.first_look_source_title && x.role==="COVER_CANDIDATE"),"First look points to cover source");
  if(cn>1)multiLooks++;
 }
 if(row.independent_source_page_qa){
  qaPages++;
  assert.ok(row.independent_source_page_qa.source_page?.startsWith("https://commons.wikimedia.org/wiki/File:"));
  assert.equal(row.independent_source_page_qa.approval_from_page_review,false);
  assert.equal(row.independent_source_page_qa.original_bytes_redownloaded,false);
  assert.equal(cn,1);
 }
}
assert.equal(singleton,13);
assert.equal(multi,8);
assert.equal(excluded,2);
assert.equal(coverImages,61);
assert.equal(otherImages,3);
assert.equal(firstLooks,19);
assert.equal(multiLooks,6);
assert.equal(qaPages,12);
assert.equal(m.summary.independent_single_candidate_source_pages_rechecked,12);
assert.equal(m.summary.single_candidate_source_pages_not_rechecked,1);
assert.equal(m.summary.approved_by_this_triage,0);
assert.equal(m.summary.published_by_this_triage,0);
assert.equal(m.summary.no_new_photographs_downloaded,0);
for(const id of ["place:NZ:pukekaraka-otaki","place:CL:sanctuary-of-our-lady-of-la-tirana-chile"]){
 const p=m.rows.find(x=>x.place_id===id);
 assert.equal(p.candidate_count,0);
 assert.equal(p.first_look_source_title,null);
}
for(const id of ["place:UY:montevideo-gruta-lourdes-national-shrine","place:KR:haemi-martyrs-shrine-main-church"]){
 const p=m.rows.find(x=>x.place_id===id);
 assert.ok(p.candidate_count>1 && !p.first_look_source_title);
}
assert.ok(m.rows.find(x=>x.place_id==="place:DE:aachener-dom-four-textiles")
 .independent_source_page_qa.status.includes("TEXTILES_NOT_DEPICTED"));
assert.ok(m.rows.find(x=>x.place_id==="place:US:la-salette-attleboro")
 .independent_source_page_qa.status.includes("SEASONAL_NIGHT_SCENE"));
console.log("R26 SACRED ATLAS RESEARCH-ONLY PASS: 13 singleton + 8 multi candidate sites; 61 exact cover originals, 3 context exclusions, 12 source pages rechecked, 0 covers approved or published.");
