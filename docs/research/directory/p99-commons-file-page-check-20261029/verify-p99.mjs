#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const d=JSON.parse(readFileSync(join(here,'p99-source-page-triage.json'),'utf8'));
const base=JSON.parse(readFileSync(join(here,'../p98-originals-release-gate-20261029/p98-original-verification-queue.json'),'utf8'));
const fail=x=>{throw new Error('P99 research-only validation: '+x)};
if(d.entries.length!==31||base.original_verification_candidate_queue.length!==31)fail('expected 31 original candidates');
const parent=new Map(base.original_verification_candidate_queue.map(x=>[x.contact_index,x]));
if(parent.size!==31||new Set(d.entries.map(x=>x.contact_index)).size!==31)fail('duplicate or lost index');
for(const x of d.entries){
 const old=parent.get(x.contact_index);if(!old||old.exact_commons_source_url!==x.exact_file_url||old.original_sha1_from_prior_ledger_UNVERIFIED!==x.prior_hash_claim_not_recomputed||old.physical_anchor_id!==x.physical_anchor_id)fail('source or frozen identity mutation '+x.contact_index);
 if(x.independently_recomputed_hash||x.full_resolution_original_downloaded||x.full_resolution_quality_reviewed||x.reuse_rights_finally_cleared||x.editorial_release_approved||x.published)fail('premature release claim '+x.contact_index);
 if(x.source_page_verification_level==='EXACT_FILE_PAGE_OPENED_METADATA_OBSERVED_ONLY'){
  if(!x.commons_page_creator_claim||!x.commons_page_license_claim||!x.commons_page_original_dimensions_pixels?.width||!x.commons_page_original_dimensions_pixels?.height||!x.exact_file_url)fail('exact-page evidence missing '+x.contact_index);
 }else if(x.commons_page_license_claim||x.commons_page_creator_claim)fail('category/blocked file assigned exact rights '+x.contact_index);
}
const level=k=>d.entries.filter(x=>x.source_page_verification_level===k).length;
if(level('EXACT_FILE_PAGE_OPENED_METADATA_OBSERVED_ONLY')!==23||level('CATEGORY_LISTING_ONLY_NO_EXACT_FILE_PAGE_REVIEW')!==3||level('EXACT_FILE_PAGE_NOT_RETRIEVABLE_IN_P99')!==5)fail('source page access counts');
if(d.entries.filter(x=>x.commons_page_license_claim==='CC0 1.0').length!==2)fail('CC0 observations');
console.log('PASS P99: 31 candidate rows; 23 exact Commons pages, 3 category-only, 5 page-blocked; 0 hashes, rights release, publication.');
