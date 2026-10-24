import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base='data/customs/master/';
const load=n=>JSON.parse(readFileSync(base+n,'utf8'));
const review=load('pitre-1900-wave06-237-image-preview-review-and-3-anchor-corrections.v1.json');
const old=load('pitre-1900-wave04-105-source-image-review-queue.v1.json');
const stage=load('pitre-1900-wave05-editorial-staging-and-holds.v1.json');
assert.equal(review.records.length,237);
assert.equal(review.source.pdf_sha256,old.source_pdf_sha256);
assert.equal(review.source.pdf_sha256,stage.source.sha256);
assert.equal(review.summary.canonical_workbench_observations_unchanged,3512);
assert.equal(review.summary.new_canonical_observations,0);
assert.equal(review.summary.full_original_folio_image_certifications,0);
assert.equal(review.summary.app_publications,0);
assert.equal(review.summary.wave04_image_regions_rendered_and_preview_inspected,105);
assert.equal(review.summary.wave05_image_regions_rendered_and_preview_inspected,132);
assert.equal(review.summary.wave05_original_anchor_exact_matches+review.summary.wave05_original_anchor_prefix_only_matches+review.summary.wave05_original_anchor_not_found,132);
assert.equal(review.summary.wave05_corrected_anchor_matches,3);
const oldMap=new Map(old.records.map(r=>[r.id,r]));
const stageMap=new Map(stage.accepted_source_observation_stage.map(r=>[r.id,r]));
assert.equal(new Set(review.records.map(r=>r.id)).size,237);
const corrections=[];
for(const r of review.records){
  assert.equal(r.page_image_crop_generated,true);
  assert.equal(r.rendered_image_crop_visually_inspected_in_contact_sheet,true);
  assert.equal(r.pdf_word_stream_normalized_exact_anchor_match,true);
  assert.equal(r.individual_full_folio_image_certified,false);
  assert.equal(r.authority_or_historical_claim_certified,false);
  assert.equal(r.publicly_published,false);
  assert.ok(Number.isInteger(r.original_pdf_page_1_based)&&r.original_pdf_page_1_based>0);
  if(r.batch==='WAVE04'){
    const source=oldMap.get(r.id);assert.ok(source,'unknown Wave04 id '+r.id);
    assert.equal(r.original_pdf_page_1_based,source.pdf_page_1_based);
    assert.equal(r.original_printed_page,source.printed_page);
    assert.equal(r.original_anchor,source.italian_anchor);
  }else{
    const source=stageMap.get(r.id);assert.ok(source,'unknown Wave05 id '+r.id);
    assert.equal(r.original_pdf_page_1_based,source.original_scan_pdf_page_1_based);
    assert.equal(r.original_printed_page,source.original_printed_page);
    assert.equal(r.original_anchor,source.original_italian_text_anchor);
    if(r.corrected_anchor){
      assert.equal(r.original_anchor_match_state,'REANCHOR_REQUIRED');
      assert.equal(r.corrected_anchor_match_state,'EXACT_PDF_WORD_STREAM_MATCH');
      corrections.push(r.id);
    }else assert.equal(r.original_anchor_match_state,'EXACT_PDF_WORD_STREAM_MATCH');
  }
}
assert.deepEqual(corrections.sort(),['PIT1900-W05-OBS-007','PIT1900-W05-OBS-072','PIT1900-W05-OBS-093']);
assert.equal(review.records.filter(r=>r.batch==='WAVE04').length,105);
assert.equal(review.records.filter(r=>r.batch==='WAVE05').length,132);
assert.equal(old.records.every(r=>r.individual_page_image_confirmed===false),true,'Original intake queue stays a dated snapshot');
assert.equal(stage.accepted_source_observation_stage.every(r=>r.app_published===false),true);
console.log('PASS Pitrè Wave06: 237 reproducible crop-inspection metadata, three anchor corrections, zero promotion or full-folio certification.');
