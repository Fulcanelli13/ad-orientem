#!/usr/bin/env node
import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
const root="data/research/";
const audit=JSON.parse(fs.readFileSync(root+"sacred-art-b56-53-hero-selection-verified-summary.json","utf8"));
const seed=JSON.parse(fs.readFileSync(root+"sacred-art-b56-53-classi-curated-source-seed.json","utf8"));
const html=fs.readFileSync("previews/sacred-art-b56-classi-53-hero-selection-offline.html","utf8");
const manifest=JSON.parse(fs.readFileSync(root+"sacred-art-b56-53-hero-candidate-list.json","utf8"));
assert.equal(seed.schema,"AO_B56_CLASS_I_53_HERO_REVIEW_SEED_V1");
assert.equal(audit.schema,"AO_B56_CLASS_I_53_HERO_SELECTOR_SOURCE_PROOF_V1");
assert.equal(audit.class_i_dates_2026,53);
assert.equal(audit.historical_user_date_approved,10);
assert.equal(audit.historical_user_dates_reselected_automatically,0);
assert.equal(audit.each_feast_3_to_4_options,true);
assert.equal(audit.zero_app_publication_rights_approved,true);
assert.equal(audit.user_approval_export_controls_not_mutating_app,true);
assert.equal(audit.source_B54_gallery_sha_verified,true);
assert.equal(audit.product_cost_eur,0);
assert.equal(audit.output_html_bytes,Buffer.byteLength(html));
assert.equal(crypto.createHash("sha256").update(html).digest("hex"),audit.output_html_sha256);
assert.equal(audit.per_date.length,53);
assert.equal(manifest.dates.length,53);
assert.equal(new Set(manifest.dates.map(x=>x.date)).size,53);
assert.ok(audit.candidate_slots_with_actual_picture>=100);
assert.equal(audit.candidate_slots_with_actual_picture+audit.candidate_slots_without_actual_picture,audit.total_picture_options);
assert.ok(audit.total_picture_options>=159 && audit.total_picture_options<=212);
assert.match(html,/Select among the feast painting candidates/);
assert.match(html,/None suitable — research further/);
assert.match(html,/Your remarks or a painting you want me to find/);
assert.match(html,/data-nav-filter="protected"/);
assert.match(html,/Export my selections/);
assert.match(html,/Import saved review/);
assert.match(html,/AO_CLASS_I_2026_HERO_USER_CHOICES_V1/);
assert.match(html,/Desktop · wide hero crop/);
assert.match(html,/Mobile · portrait crop/);
assert.doesNotMatch(html,/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|<script[^>]+src=/i);
const dm=html.match(/const DAYS=(\[[^\n]*\]);\s*const IMAGE_BANK=/);
const bm=html.match(/const IMAGE_BANK=(\{[^\n]*\});\s*const CACHE=/);
assert.ok(dm&&bm,"Inline 53-day data or image bank absent");
const days=JSON.parse(dm[1]),bank=JSON.parse(bm[1]);
assert.equal(days.length,53);
assert.deepEqual(days.map(x=>x.date),seed.dates.map(x=>x.date));
assert.equal(audit.research_exact_source_outside_383_count,7);
assert.deepEqual(audit.class_i_review_lanes,{LOCKED_10:10,GAP_9:9,EXACT_6:6,SUBJECT_28:28});
const lanes=Object.fromEntries(["LOCKED_10","GAP_9","EXACT_6","SUBJECT_28"].map(k=>[k,days.filter(d=>d.review_lane===k).length]));
assert.deepEqual(lanes,audit.class_i_review_lanes);
assert.match(html,/data-nav-filter="gaps"/);
assert.match(html,/data-nav-filter="exact"/);
assert.match(html,/data-nav-filter="subject"/);
const gap9=["2026-02-18","2026-03-08","2026-03-22","2026-03-30","2026-07-01","2026-12-06","2026-12-13","2026-12-20","2026-12-24"];
const exact6=["2026-02-22","2026-03-01","2026-03-15","2026-03-31","2026-04-01","2026-09-29"];
for (const date of gap9) {
 const x=days.find(d=>d.date===date);
 assert.equal(x.review_lane,"GAP_9");
 assert.ok(x.appointed_reading && x.appointed_scene,date+" appointed Gospel missing");
}
for (const date of exact6) {
 const x=days.find(d=>d.date===date);
 assert.equal(x.review_lane,"EXACT_6");
 assert.ok(x.appointed_reading,date+" exact research reading missing");
}
const b54ids=new Set(fs.readFileSync(root+"sacred-art-b54-383-aesthetic-biblical-review-ledger.csv","utf8")
 .split(/\r?\n/).slice(1).map(x=>x.split(",")[1]));
let recoveredExternalLinks=0;
for (const d of seed.dates) {
 for (const link of d.exact_research_links||[]) {
   if(b54ids.has(link.artworkId)) continue;
   recoveredExternalLinks++;
   const day=days.find(x=>x.date===d.date);
   const original=day.options.find(x=>x.choice_id===link.artworkId);
   if (!day.original_approval) {
      assert.ok(original,d.date+" missing exact museum source "+link.artworkId);
      assert.equal(original.grade,"EXACT_SUBJECT_RESEARCH");
      assert.equal(original.production_image_rights_approved,false);
      assert.equal(original.source_url,link.museumObjectUrl);
   }
 }
}
assert.equal(recoveredExternalLinks,7,"all seven outside-383 exact sources must stay traceable");
let picture_slots=0, protected_count=0,total=0;
const ids=new Set();
for(let i=0;i<53;i++){
 const day=days[i],from=seed.dates[i];
 assert.equal(day.observed_principal,from.principal_id);
 assert.equal(day.title,from.title);
 assert.equal(day.selection,null);
 assert.equal(day.need_more_research,false);
 assert.equal(day.release_ready,false);
 assert.ok(day.options.length>=3&&day.options.length<=4,day.date);
 if(day.original_approval){protected_count++;assert.equal(day.options.filter(x=>x.historically_approved_for_date).length,1);
  assert.equal(day.options[0].grade,"PRIOR_USER_APPROVED");
  assert.equal(day.options[0].artist,day.original_approval.artist);
  assert.equal(day.options[0].title,day.original_approval.title);
 }
 const choices=new Set();
 for(const c of day.options){
  total++;
  assert.ok(!choices.has(c.choice_id));choices.add(c.choice_id);ids.add(c.choice_id);
  assert.equal(c.production_image_rights_approved,false);
  assert.equal(c.physical_museum_frame_absent_verified,false);
  assert.equal(c.gallery_surround_absent_verified,false);
  assert.equal(c.complete_painted_surface_verified,false);
  assert.equal(c.unmodified_source_preserved,true);
  assert.equal(c.no_synthetic_frame_removal,true);
  assert.equal(c.editorial_placement_confirmed_by_user_this_session,false);
  if(c.image_available){picture_slots++;assert.ok(bank[c.image_key]);}
  else assert.equal(c.image_key,null);
 }
}
assert.equal(protected_count,10);
assert.equal(total,audit.total_picture_options);
assert.equal(picture_slots,audit.candidate_slots_with_actual_picture);
assert.equal(Object.keys(bank).length,audit.unique_reused_picture_previews);
for(const [k,value] of Object.entries(bank)){
 assert.ok(value.startsWith("data:image/webp;base64,"),k);
 const bytes=Buffer.from(value.slice("data:image/webp;base64,".length),"base64");
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.ok(bytes.length>600);
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),manifest.image_bank_sha256[k]);
}
const king=days.find(x=>x.date==="2026-10-25");
assert.equal(king.original_approval.title,"Salvator Mundi");
assert.equal(king.original_approval.artist,"Ambrosius Benson");
assert.equal(king.options[0].choice_id,"protected:2026-10-25");
// Latest explicit 2026-10-26 user decision takes precedence over historical B55 records.
const holyThursday=days.find(x=>x.date==="2026-04-02");
const emberWed=days.find(x=>x.date==="2026-05-27");
assert.equal(holyThursday.options[0].choice_id,"ART-hilippe-de-hampaigne-a-etite-ne");
assert.equal(holyThursday.original_approval.artist,"Philippe de Champaigne");
assert.equal(holyThursday.original_approval.title,"La Petite Cène");
assert.equal(emberWed.original_approval.artist,"Philippe de Champaigne");
assert.ok(!holyThursday.options.some(x=>x.choice_id==="met-459131"),"Withdrawn Ugolino must not reappear in active Holy Thursday shortlist");
assert.equal(days.find(x=>x.date==="2026-05-24").options[0].choice_id,"ART-ean-estout-entecost");
assert.equal(days.find(x=>x.date==="2026-06-12").options[0].choice_id,"commons-morlete-sacred-heart-1759");
console.log("B56_53_HERO_SELECTOR_PASS 53 Class I dates; "+total+" original artwork candidate slots; "+picture_slots+" actual photos; "+Object.keys(bank).length+" unique SHA-tested images; 10 prior date approvals preserved; zero rights clearance or app changes.");
