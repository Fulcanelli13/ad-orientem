#!/usr/bin/env node
// Evidence audit only; a positive subject match NEVER authorizes an app image.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ledger = JSON.parse(readFileSync(join(here, 'p91-all-385-canonical-evidence.json'), 'utf8'));
const expected = { REJECTED_WRONG_BUILDING: 90, EXACT_BUILDING_CORROBORATED_RESEARCH_ONLY: 83, HELD_UNVERIFIED: 212 };
const actual = Object.fromEntries(Object.keys(expected).map(key => [key, 0]));
const heldSites = new Set(), photoIds = new Set();
const p94VisualIds = new Set(), p94OutcomeCounts = {};
const p95VisualIds = new Set(), p95OutcomeCounts = {};
const fail = msg => { throw new Error('P91/P92 gate: ' + msg); };

if (ledger.records.length !== 385 || ledger.total_original_assignments !== 385) fail('385 original records must be preserved');
for (const row of ledger.records) {
  if (photoIds.has(row.contact_index)) fail('duplicate photo index ' + row.contact_index);
  photoIds.add(row.contact_index);
  const derived =
    row.p93_research_outcome === 'EXACT_CHURCH_BUILDING_CORROBORATED_SOURCE_CATEGORY_AND_INDEPENDENT_SITE' ||
    row.p92_research_outcome === 'EXACT_CHURCH_CATEGORY_AND_INDEPENDENT_BUILDING_RECORD_CORROBORATED' ||
    row.p91_research_outcome === 'SUBJECT_CORROBORATED_NOT_EDITORIALLY_APPROVED' ||
    row.p90_previous_status === 'SUBJECT_P90_CORROBORATED_PENDING_ARTISTIC_AND_RIGHTS_REVIEW'
      ? 'EXACT_BUILDING_CORROBORATED_RESEARCH_ONLY'
      : String(row.p90_previous_status).startsWith('REJECT')
        ? 'REJECTED_WRONG_BUILDING'
        : 'HELD_UNVERIFIED';
  if (row.effective_image_site_disposition !== derived) fail('stale effective disposition for ' + row.contact_index);
  if (row.effective_subject_corrob_research_only !== (derived === 'EXACT_BUILDING_CORROBORATED_RESEARCH_ONLY')) fail('stale research identity flag for ' + row.contact_index);
  if (row.image_approved || row.published || row.rights_approved || row.p91_publication_approved || row.original_image_bytes_verified) fail('premature publication or file-rights claim on ' + row.contact_index);
  if (row.p92_research_outcome === 'EXACT_CHURCH_CATEGORY_AND_INDEPENDENT_BUILDING_RECORD_CORROBORATED') {
    if (!row.p92_additional_evidence || row.p92_additional_evidence.original_file_url !== row.source_url || row.p92_additional_evidence.refs.length < 2 || !row.p92_additional_evidence.independent_site_address) fail('missing P92 per-file provenance for ' + row.contact_index);
  }
  if (row.p93_research_outcome === 'EXACT_CHURCH_BUILDING_CORROBORATED_SOURCE_CATEGORY_AND_INDEPENDENT_SITE') {
    if (!row.p93_evidence || row.p93_evidence.source_file_url !== row.source_url || row.p93_evidence.independent_evidence_urls?.length < 2 || !row.p93_evidence.verified_site_address) fail('missing P93 exact-site per-file evidence for ' + row.contact_index);
  }
  if ([371,372,373].includes(row.contact_index) && (derived !== 'HELD_UNVERIFIED' || row.p93_venue_ambiguity?.status !== 'HOLD_UNTIL_CANONICAL_VENUE_CONFIRMED')) fail('Park City venue conflict prematurely resolved for '+row.contact_index);
  if (row.p94_actual_preview_visual_review) {
    const v = row.p94_actual_preview_visual_review;
    if (derived !== 'EXACT_BUILDING_CORROBORATED_RESEARCH_ONLY' || v.exact_source_page !== row.source_url || !v.photo_preview_visually_inspected || v.review_scope !== 'ACTUAL_COMMONS_WEB_RENDERED_PHOTO_PREVIEW_NOT_DOWNLOADED_ORIGINAL') fail('P94 visual proof must be source-specific and research-only: ' + row.contact_index);
    if (v.rights_or_attribution_clearance_completed || v.original_file_bytes_downloaded_or_hashed || v.publication_approved || !v.license_claim_observed_only) fail('P94 cannot claim rights, original bytes or publication: ' + row.contact_index);
    p94VisualIds.add(row.contact_index);
    p94OutcomeCounts[v.editorial_screen_decision] = (p94OutcomeCounts[v.editorial_screen_decision] || 0) + 1;
  }
  if (row.p95_actual_preview_visual_review) {
    const v = row.p95_actual_preview_visual_review;
    if (derived !== 'EXACT_BUILDING_CORROBORATED_RESEARCH_ONLY' ||
        v.exact_commons_source_url !== row.source_url ||
        v.inspection_level !== 'ACTUAL_RENDERED_COMMONS_THUMBNAIL' ||
        v.directly_viewed_preview !== true ||
        !v.composition_observation || !v.role || !v.editorial_screen_outcome ||
        row.p94_actual_preview_visual_review) fail('P95 must have non-overlapping source-specific visual assessments: ' + row.contact_index);
    if (v.file_original_bytes_verified || v.original_sha1_recomputed ||
        v.full_resolution_aesthetics_approved || v.licensing_and_attribution_verified_for_publication ||
        v.rights_cleared || v.app_publication_approved) fail('P95 cannot claim original, full-size, rights or publication approval: ' + row.contact_index);
    p95VisualIds.add(row.contact_index);
    p95OutcomeCounts[v.editorial_screen_outcome] = (p95OutcomeCounts[v.editorial_screen_outcome] || 0) + 1;
  }
  if (derived === 'HELD_UNVERIFIED') heldSites.add(row.physical_anchor_id);
  actual[derived]++;
}
for (const key of Object.keys(expected)) {
  if (actual[key] !== expected[key] || ledger.effective_image_site_disposition_counts[key] !== expected[key]) fail('unexpected ' + key + ' count');
}
if (heldSites.size !== 124 || ledger.unresolved_distinct_physical_site_ids !== 124) fail('expected 124 held physical sites');
if (photoIds.size !== 385) fail('must preserve 385 distinct indices');
if (ledger.total_subject_corrob !== 83 || ledger.still_unverified !== 212 || ledger.distinct_subject_site_ids !== 26 || ledger.previous_subject_corrob !== 57 || ledger.new_subject_corrob !== 26) fail('current P93 summary must be self-consistent');
if (!ledger.p92_historical_summary || ledger.p92_historical_summary.total_subject_corrob !== 57 || ledger.p92_historical_summary.still_unverified !== 238 || ledger.p92_historical_summary.distinct_subject_site_ids !== 19) fail('P92 historical snapshot missing or altered');
if (!ledger.p91_historical_summary || ledger.p91_historical_summary.total_subject_corrob !== 17 || ledger.p91_historical_summary.still_unverified !== 278 || ledger.p91_historical_summary.distinct_subject_site_ids !== 9) fail('P91 historical snapshot missing or altered');
const newlyCorrob = ledger.records.filter(row => row.p92_research_outcome === 'EXACT_CHURCH_CATEGORY_AND_INDEPENDENT_BUILDING_RECORD_CORROBORATED');
if (newlyCorrob.length !== 40 || new Set(newlyCorrob.map(row => row.physical_anchor_id)).size !== 10 || ledger.p92_new_subject_corrob !== 40 || ledger.p92_new_subject_sites !== 10) fail('P92 must include 40 specific exact-site research matches at 10 physical sites');
const p93 = ledger.records.filter(row => row.p93_research_outcome === 'EXACT_CHURCH_BUILDING_CORROBORATED_SOURCE_CATEGORY_AND_INDEPENDENT_SITE');
if (p93.length !== 26 || new Set(p93.map(row => row.physical_anchor_id)).size !== 7 || ledger.p93_evidence_batches.length !== 7) fail('P93 requires 26 per-file proofs across seven buildings');
const expectedP94 = { VIABLE_INTERIOR_CANDIDATE:1, REJECT_CHURCH_WIDE_HERO_ROLE:3, PREFERRED_INTERIOR_CANDIDATE:2, SECONDARY_EXTERIOR_ONLY:3, VIABLE_EXTERIOR_CANDIDATE:3, PREFERRED_ALTAR_DETAIL_CANDIDATE:1 };
if (p94VisualIds.size !== 13 || ledger.p94_web_preview_visual_inspected !== 13 || Object.keys(expectedP94).some(k => expectedP94[k] !== p94OutcomeCounts[k] || expectedP94[k] !== ledger.p94_editorial_screen_outcomes?.[k])) fail('P94 must reflect exactly 13 genuinely viewed source previews and their editorial decisions');
const expectedP95 = {
  VIABLE_EXTERIOR:6, SECONDARY_EXTERIOR:4, REJECT_PRIMARY_HERO_ROLE:1,
  PREFERRED_EXTERIOR_CANDIDATE:4, REJECT_CHURCH_HERO_ROLE:1, VIABLE_ALTAR_DETAIL:1
};
if (p95VisualIds.size !== 17 || ledger.p95_new_direct_preview_reviews !== 17 ||
    ledger.p95_total_direct_preview_reviews !== 30 ||
    ledger.p95_remaining_identity_corrob_uninspected !== 53 ||
    Object.keys(expectedP95).some(k => expectedP95[k] !== p95OutcomeCounts[k] ||
      expectedP95[k] !== ledger.p95_visual_outcomes?.[k]))
  fail('P95 must reflect 17 new exact source previews and 53 remaining identity matches');
if (p94VisualIds.size + p95VisualIds.size + ledger.p95_remaining_identity_corrob_uninspected !== 83)
  fail('all corroborated images must be accounted for by actual preview review state');
console.log('PASS: 385 rows; 90 image-to-site rejections; 83 research-only identities; 212 held; 30 source-specific image previews screened; 53 not yet previewed; 0 full-original, rights or production approvals.');
