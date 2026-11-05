import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const qa=read("data/geography/research/sacred-atlas-r28-owner-approved19-release-qa-20261104.v1.json");
const owner=read("data/geography/research/sacred-atlas-r28-owner-approved19-source-lock-20261104.v1.json");
const gates=read("data/geography/research/sacred-atlas-r29-selected19-final-rights-checklist-20261104.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
assert.equal(qa.schema,"AO_SACRED_ATLAS_R28_SELECTED19_RELEASE_QA_QUEUE_V1");
assert.equal(qa.updated_on,"2026-11-05");
assert.equal(qa.rows.length,19);
assert.equal(owner.decisions.length,19);
assert.equal(gates.rows.length,19);
assert.equal(media.items.length,379);
assert.equal(gallery.items.length,42);
assert.equal(qa.counts.source_pages_checked_initial_2026_11_04,5);
assert.equal(qa.counts.source_pages_checked_followup_2026_11_05,14);
assert.equal(qa.counts.source_pages_checked_total,19);
assert.equal(qa.counts.source_pages_outstanding,0);
assert.equal(qa.counts.original_binaries_reacquired_this_pass,0);
assert.equal(qa.counts.derivatives_generated,0);
assert.equal(qa.counts.newly_published,0);
assert.equal(qa.source_page_review_rollup.all_19_owner_chosen_source_pages_screened,19);
assert.equal(qa.source_page_review_rollup.description_page_snapshot_revision_ids_recorded,14);
assert.equal(qa.source_page_review_rollup.source_file_revision_id_current_reverified,0);
assert.equal(qa.source_page_review_rollup.full_original_bytes_reacquired,0);
assert.equal(qa.source_page_review_rollup.final_release_approvals,0);
const selected=new Map(owner.decisions.map(x=>[x.place_id,x]));
const gated=new Map(gates.rows.map(x=>[x.place_id,x]));
let older=0,newer=0;
for(const x of qa.rows){
 const l=selected.get(x.place_id),g=gated.get(x.place_id);
 assert.ok(l&&g,"No unknown owner source");
 assert.equal(x.source_sha1,l.original_sha1);
 assert.equal(x.selected_title,l.exact_original_file);
 assert.equal(x.source_page,l.original_commons_page);
 assert.equal(x.original_bytes_previously_verified,true);
 assert.equal(x.original_bytes_reacquired_for_publication,false);
 assert.equal(x.rights_cleared_for_publication,false);
 assert.equal(x.derivative_present,false);
 assert.equal(x.final_photo_release_authorized,false);
 assert.equal(x.metadata_source_rechecked_in_current_pass,true);
 assert.ok(x.current_page_observation,"Each source must have independent source-page evidence");
 const p=x.current_page_observation;
 assert.ok(p.source_url?.startsWith("https://commons.wikimedia.org/wiki/File:") || x.source_page.startsWith("https://commons.wikimedia.org/wiki/File:"));
 if(p.description_page_snapshot_revision_id){
  newer++;
  assert.equal(p.checked_on,"2026-11-05");
  assert.match(p.description_page_snapshot_revision_id,/^[0-9]+$/);
  assert.equal(p.source_file_revision_id_revalidated,false);
  assert.equal(p.original_current_binary_revalidated,false);
  assert.equal(p.architectural_and_artwork_rights_cleared,false);
  assert.equal(p.final_release_authorized,false);
  assert.equal(p.licence_claim_agrees_with_frozen_record,true);
  assert.equal(p.page_claimed_license,l.license_claim);
  assert.equal(p.page_claimed_source_author,l.source_author);
  assert.equal(p.user_editorial_choice_preserved,true);
  assert.equal(p.source_file_title_agrees_with_frozen_record,true);
  assert.ok(p.source_page_summary?.length>55);
  assert.ok(p.review_gate?.length>7);
  assert.equal(g.publication_authorized,false);
 } else older++;
}
assert.equal(older,5);
assert.equal(newer,14);
for(const [id,issue] of [
 ["place:DE:bettbrunn-st-salvator","AUTHOR_CREDIT_AND_COMMONS_LICENSE_LINK_NEAR_IMAGE"],
 ["place:DE:basilika-st-clemens-hannover","ORIGINAL_PHOTOGRAPHER_AND_EDITING_CREDIT"]
]){
 const gate=gated.get(id);
 assert.equal(gate.special_issue,issue);
 assert.equal(gate.special_issue_accepted,false);
 assert.equal(gate.publication_authorized,false);
}
assert.equal(gated.get("place:DE:bettbrunn-st-salvator").near_image_attribution_verified,false);
assert.equal(gated.get("place:DE:basilika-st-clemens-hannover").original_photographer_and_editor_credit_verified,false);
const bav=qa.rows.find(x=>x.place_id==="place:DE:friedhofskirche-st-michael-altoetting");
assert.equal(bav.current_page_observation.description_page_snapshot_revision_id,"1261770612");
assert.equal(bav.source_sha1,"2950c29a57538bb91cfdf42b1c949a3135d98481");
assert.ok(qa.rows.find(x=>x.place_id==="place:BE:banneux").current_page_observation.site_description_classification.includes("SANCTUARY_VIEW"));
console.log("R30 PASS: all 19 exact user-selected source description pages reviewed, 14 page snapshot IDs, two further photo-credit exceptions, no new image rights claims or publication.");


const r34Ids=["place:PL:lichen-marian-basilica","place:LB:monastery-saint-maron-annaya","place:US:la-salette-attleboro","place:BE:banneux","place:KR:haemi-martyrs-shrine-main-church","place:MX:guadalupe-zacatecas-historic-sanctuary"];
for(const id of r34Ids){
  const row=qa.rows.find(x=>x.place_id===id),locked=selected.get(id),gate=gated.get(id);
  assert.ok(row?.r34_visual_scene_observation,"R34 preview-scene finding missing: "+id);
  const x=row.r34_visual_scene_observation;
  assert.equal(x.method,"BROWSER_RENDERED_COMMONS_IMAGE_PREVIEW_NOT_ORIGINAL_BYTES");
  assert.equal(x.user_original_choice_preserved,true);
  assert.equal(x.original_jpeg_bytes_acquired,false);
  assert.equal(x.original_revision_sha1_reverified,false);
  assert.equal(x.rights_cleared,false);
  assert.equal(x.mobile_crop_approved,false);
  assert.equal(x.publication_authorized,false);
  assert.ok(x.scene_description.length>65&&x.mobile_display_status.length>35);
  assert.ok(x.evidence_urls.includes(locked.original_commons_page));
  assert.equal(row.original_bytes_reacquired_for_publication,false);
  assert.equal(row.final_photo_release_authorized,false);
  assert.equal(gate.publication_authorized,false);
}
assert.match(qa.rows.find(x=>x.place_id==="place:US:la-salette-attleboro").r34_visual_scene_observation.scene_description,/WELCOME CENTER/);
assert.match(qa.rows.find(x=>x.place_id==="place:KR:haemi-martyrs-shrine-main-church").r34_visual_scene_observation.scene_description,/circular church/);
assert.equal(qa.counts.newly_published,0);
console.log("R34 PASS: six exact original browser previews inspected; La Salette welcome-centre and Haemi circular church documented; rights, native JPEG and publication still held.");
