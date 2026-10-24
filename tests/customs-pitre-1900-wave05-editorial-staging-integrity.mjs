import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root='data/customs/master/';
const s=JSON.parse(readFileSync(root+'pitre-1900-wave05-editorial-staging-and-holds.v1.json','utf8'));
assert.equal(s.summary.source_leads_reviewed,195);
assert.equal(s.summary.source_observations_staged,132);
assert.equal(s.summary.retained_exception_leads,63);
assert.equal(s.summary.chapter_groups_with_staged_observations,29);
assert.equal(s.summary.all_pdf_text_excerpts_rematched,195);
assert.equal(s.summary.image_level_certifications_this_pass,0);
assert.equal(s.summary.source_rows_in_previous_unified_catalogue,3512);
const accepted=s.accepted_source_observation_stage;
const deferred=s.held_source_leads;
assert.equal(accepted.length,132);assert.equal(deferred.length,63);
const all=[...accepted,...deferred];
assert.equal(new Set(all.map(r=>r.source_lead_id)).size,195);
assert.deepEqual(new Set(all.map(r=>r.source_lead_id)),new Set(Array.from({length:195},(_,i)=>`PIT1900-SCREEN-${String(i+1).padStart(3,'0')}`)));
const chapters=new Set(accepted.map(r=>r.source_chapter));
assert.equal(chapters.size,29);
const allowedChapters=new Set('II IV V VI XXIII XXIV XXVIII XXIX XXX XXXV XXXVII XXXVIII XXXIX XL XLI XLII XLIII XLIV XLV XLVII XLVIII XLIX L LIV LV LVI LVII LVIII LIX'.split(' '));
assert.deepEqual(chapters,allowedChapters);
for(const r of all){
 assert.ok(typeof r.original_italian_text_anchor==='string'&&r.original_italian_text_anchor.length>=12);
 assert.ok(typeof r.original_italian_ocr_context==='string'&&r.original_italian_ocr_context.length>=40);
 assert.ok(Number.isInteger(r.original_printed_page)&&r.original_printed_page>=1);
 assert.ok(Number.isInteger(r.original_scan_pdf_page_1_based));
 assert.equal(r.ocr_excerpt_directly_rematched,true);
 assert.equal(r.individual_page_image_visually_certified,false);
 for(const k of ['source_author_independence_verified','ritual_authority_verified','modern_continuity_verified','unique_custom_identity_certified','app_published'])assert.equal(r[k],false);
 assert.equal(r.source_sha256,s.source.sha256);
}
for(const r of accepted){
 assert.ok(r.id.startsWith('PIT1900-W05-OBS-'));
 assert.ok(r.action_or_detail?.length>=25);
 assert.equal(r.status,'SOURCE_OBSERVATION_STAGED_NOT_CANONICAL');
 assert.equal(r.working_master_owner,null);
 assert.equal(r.publication_state,'RESEARCH_ONLY');
}
for(const r of deferred)assert.equal(r.disposition,'DEFER_NOT_AN_ACCEPTED_SOURCE_OBSERVATION');
// Crucially, do not assume 132 staged entries were merged into the canonical 3,512-row workbench.
console.log(`Wave05 research-only stage validated: ${accepted.length} staged, ${deferred.length} deferred, ${chapters.size}/29 missing chapters represented, 0 new unique customs, 0 publications.`);