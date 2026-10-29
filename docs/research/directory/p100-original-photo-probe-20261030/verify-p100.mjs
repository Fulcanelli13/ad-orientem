#!/usr/bin/env node
// Research audit: source-image integrity must never be mistaken for permission to publish.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const p98=JSON.parse(readFileSync(join(here,'../p98-originals-release-gate-20261029/p98-original-verification-queue.json'),'utf8'));
const d=JSON.parse(readFileSync(join(here,'p100-original-integrity-evidence.json'),'utf8'));
const fail=s=>{throw Error('P100 gate: '+s)};
const rs=p98.original_verification_candidate_queue;
const entries=d.batch.entries;
if(rs.length!==31||entries.length!==31||d.batch.candidate_count!==31)fail('expected 31 P98 candidates');
const expected=new Map(rs.map(x=>[x.contact_index,x]));
if(expected.size!==31||new Set(entries.map(x=>x.contact_index)).size!==31)fail('duplicate or lost candidates');
const passed=entries.filter(x=>x.technical_result==='PASS_ORIGINAL_INTEGRITY');
const blocked=entries.filter(x=>x.technical_result==='HOLD_FETCH_OR_SOURCE_EXCEPTION');
if(passed.length!==10||blocked.length!==21||entries.some(x=>x.technical_result==='HOLD_INTEGRITY_OR_DECODING_EXCEPTION'))fail('evidence totals drift');
for(const x of entries){
 const prior=expected.get(x.contact_index);
 if(!prior||prior.physical_anchor_id!==x.physical_anchor_id||prior.exact_commons_source_url!==x.exact_commons_file_page||prior.original_sha1_from_prior_ledger_UNVERIFIED!==x.prior_ledger_sha1)
   fail('source/ID drift '+x.contact_index);
 if(x.copyright_clearance_completed||x.editorial_approved||x.production_published)fail('premature release '+x.contact_index);
 if(x.technical_result==='PASS_ORIGINAL_INTEGRITY'){
  if(!x.original_downloaded||!x.sha1_recomputed||!x.sha256_recomputed||!x.matches_ledger_sha1||!x.matches_current_commons_sha1||!x.matches_commons_byte_count||!x.full_resolution_decoded||!x.pixel_diagnostics?.decoded_full_original)fail('incomplete original verification '+x.contact_index);
  if(x.pixel_diagnostics.decoded_original_pixels.width!==x.source_imageinfo.width||x.pixel_diagnostics.decoded_original_pixels.height!==x.source_imageinfo.height)fail('pixel metadata drift '+x.contact_index);
 }else if(!x.error_message?.includes('HTTP Error 429')||x.sha1_recomputed||x.original_downloaded||x.full_resolution_decoded){
  fail('rate-limited row must not claim verified original '+x.contact_index);
 }
}
const earlier=d.earlier_blandford_probe;
if(earlier.contact_index!==195||passed.some(x=>x.contact_index===195)||!earlier.sha1_matches_ledger||!earlier.sha1_matches_api||!earlier.sha256_recomputed||earlier.full_resolution_jpeg_decoded||earlier.published)
  fail('earlier probe status invalid or double counted');
const t=d.totals;
if(t.p98_candidate_count!==31||t.batch_hash_and_full_jpeg_decode_success!==10||t.earlier_probed_original_sha1_sha256_success_not_full_decoded!==1||t.unique_originals_independently_sha1_sha256_verified!==11||t.unique_originals_full_resolution_decoded!==10||t.unique_originals_without_successful_original_byte_verification!==20||t.Wikimedia_rate_limited_rows_in_batch!==21||t.original_files_committed_to_repo||t.artistic_quality_approved||t.rights_approved||t.published)
  fail('totals, identity or publication safeguards drift');
console.log('PASS P100: 31 candidates; 10 full-original hashes+decode, one independent original hash-only probe, 20 pending; 429 respected; 0 app publications.');
