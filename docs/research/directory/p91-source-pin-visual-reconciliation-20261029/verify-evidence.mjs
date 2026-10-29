#!/usr/bin/env node
// Evidence audit only; a positive subject match NEVER authorizes an app image.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ledger = JSON.parse(readFileSync(join(here, 'p91-all-385-canonical-evidence.json'), 'utf8'));
const expected = { REJECTED_WRONG_BUILDING: 90, EXACT_BUILDING_CORROBORATED_RESEARCH_ONLY: 57, HELD_UNVERIFIED: 238 };
const actual = Object.fromEntries(Object.keys(expected).map(key => [key, 0]));
const heldSites = new Set(), photoIds = new Set();
const fail = msg => { throw new Error('P91/P92 gate: ' + msg); };

if (ledger.records.length !== 385 || ledger.total_original_assignments !== 385) fail('385 original records must be preserved');
for (const row of ledger.records) {
  if (photoIds.has(row.contact_index)) fail('duplicate photo index ' + row.contact_index);
  photoIds.add(row.contact_index);
  const derived =
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
  if (derived === 'HELD_UNVERIFIED') heldSites.add(row.physical_anchor_id);
  actual[derived]++;
}
for (const key of Object.keys(expected)) {
  if (actual[key] !== expected[key] || ledger.effective_image_site_disposition_counts[key] !== expected[key]) fail('unexpected ' + key + ' count');
}
if (heldSites.size !== 131 || ledger.unresolved_distinct_physical_site_ids !== 131) fail('expected 141 held physical sites');
if (photoIds.size !== 385) fail('must preserve 385 distinct indices');
const newlyCorrob = ledger.records.filter(row => row.p92_research_outcome === 'EXACT_CHURCH_CATEGORY_AND_INDEPENDENT_BUILDING_RECORD_CORROBORATED');
if (newlyCorrob.length !== 40 || new Set(newlyCorrob.map(row => row.physical_anchor_id)).size !== 10 || ledger.p92_new_subject_corrob !== 40 || ledger.p92_new_subject_sites !== 10) fail('P92 must include 40 specific exact-site research matches at 10 physical sites');
console.log('PASS: 385 rows; 90 wrong buildings; 57 research-only subject matches (40 new P92); 238 holds at 131 sites; zero image rights/publications.');
