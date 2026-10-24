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
  assert.equal(day.options[0].title.replace(/^The /,""),day.original_approval.title);
 }
 const choices=new Set();
 for(const c of day.options){
  total++;
  assert.ok(!choices.has(c.choice_id));choices.add(c.choice_id);ids.add(c.choice_id);
  assert.equal(c.production_image_rights_approved,false);
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
assert.equal(days.find(x=>x.date==="2026-04-02").options[0].choice_id,"met-459131");
assert.equal(days.find(x=>x.date==="2026-05-24").options[0].choice_id,"ART-ean-estout-entecost");
assert.equal(days.find(x=>x.date==="2026-06-12").options[0].choice_id,"commons-morlete-sacred-heart-1759");
console.log("B56_53_HERO_SELECTOR_PASS 53 Class I dates; "+total+" original artwork candidate slots; "+picture_slots+" actual photos; "+Object.keys(bank).length+" unique SHA-tested images; 10 prior date approvals preserved; zero rights clearance or app changes.");
