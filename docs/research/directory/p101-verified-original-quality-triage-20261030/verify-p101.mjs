#!/usr/bin/env node
// P101: evidence-backed technical shortlist; explicitly NOT a publication whitelist.
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const p101=JSON.parse(readFileSync(join(here,'p101-quality-triage.json'),'utf8'));
const p100=JSON.parse(readFileSync(join(here,'../p100-original-photo-probe-20261030/p100-original-integrity-evidence.json'),'utf8'));
const p98=JSON.parse(readFileSync(join(here,'../p98-originals-release-gate-20261029/p98-original-verification-queue.json'),'utf8'));
const fail=(s)=>{throw Error('P101 quality gate: '+s)};
const originals=new Map(p98.original_verification_candidate_queue.map(x=>[x.contact_index,x]));
const verified=new Map(p100.batch.entries.filter(x=>x.technical_result==='PASS_ORIGINAL_INTEGRITY').map(x=>[x.contact_index,x]));
const entries=p101.batch_entries;
const sorted=entries.map(x=>x.contact_index).sort((a,b)=>a-b);
if(JSON.stringify(sorted)!==JSON.stringify([12,15,20,52,58,61,62,71,75,96,195]))fail('exact 11 hashed IDs not accounted');
if(p101.pending_originals.length!==20||new Set([...sorted,...p101.pending_originals.map(x=>x.contact_index)]).size!==31||originals.size!==31)fail('31 source candidates lost or duplicated');
if(p101.reconciliation.p100_hash_verified!==11||p101.reconciliation.p100_full_decode_verified!==10||
   p101.reconciliation.p100_hash_only!==1||p101.reconciliation.pending_orig_bytes!==20||
   p101.reconciliation.published!==0)fail('totals drift');
for(const x of entries){
 const old=originals.get(x.contact_index);
 if(!old||old.exact_commons_source_url!==x.exact_commons_source_page||
    old.physical_anchor_id!==x.physical_anchor_id||old.place_name!==x.site)fail('source/site mutation '+x.contact_index);
 if(x.exact_original_visually_critically_inspected||x.frame_absence_confirmed||x.actual_app_crop_tested||
    x.release_license_and_attribution_cleared||x.editorial_acceptance||x.production_published)
    fail('technical assessment must never claim release clearance '+x.contact_index);
 const v=verified.get(x.contact_index);
 if(v){
  if(v.sha1_recomputed!==x.original_sha1_recomputed||v.sha256_recomputed!==x.original_sha256_recomputed)fail('digest drift '+x.contact_index);
  const rawW=v.pixel_diagnostics.decoded_original_pixels.width,rawH=v.pixel_diagnostics.decoded_original_pixels.height;
  if(rawW!==x.decoded_original_dimensions.width||rawH!==x.decoded_original_dimensions.height)fail('raw image geometry drift '+x.contact_index);
  const orientation=v.pixel_diagnostics.exif_orientation??1;
  const swapped=[5,6,7,8].includes(orientation);
  const w=swapped?rawH:rawW,h=swapped?rawW:rawH;
  if(x.exif_orientation_for_display!==orientation||x.display_oriented_dimensions?.width!==w||x.display_oriented_dimensions?.height!==h)
    fail('EXIF-aware visual geometry drift '+x.contact_index);
  const cw=Math.min(w,Math.floor(h*16/9)), ch=Math.min(h,Math.floor(w*9/16));
  const a=x.hypothetical_16_9_crop;
  if(a.crop_width_px!==cw||a.crop_height_px!==ch||!a.assumed_center_crop||!a.review_only_not_app_geometry)fail('hypothetical crop correctness '+x.contact_index);
  if(Math.abs(a.retained_original_area_percent-100*cw*ch/(w*h))>0.05)fail('crop area ratio drift '+x.contact_index);
  if((cw<1920||ch<1080)!==x.review_flags.includes('WIDE_1920x1080_EXPORT_NOT_SUPPORTED_WITHOUT_UPSCALING'))fail('resolution warning drift '+x.contact_index);
  if((a.retained_original_area_percent<50)!==x.review_flags.includes('16_9_CENTER_CROP_RETENTION_UNDER_50_PERCENT'))fail('crop warning drift '+x.contact_index);
 }else if(x.contact_index===195){
  const b=p100.earlier_blandford_probe;
  if(!b.sha1_matches_ledger||!b.sha1_matches_api||x.original_sha1_recomputed!==b.sha1_recomputed||
    x.original_sha256_recomputed!==b.sha256_recomputed||x.decoded_original_dimensions!==null||
    x.editorial_workflow_status!=='FULL_ORIGINAL_PIXEL_DECODE_REQUIRED')
     fail('Blandford probe not represented correctly');
 }else fail('unverified ID entered quality queue '+x.contact_index);
}
if(entries.filter(x=>x.editorial_workflow_status==='FIRST_EDITORIAL_VISUAL_QUEUE').map(x=>x.contact_index).sort((a,b)=>a-b).join(',')!=='58,61,71')
  fail('priority image IDs changed');
for(const row of p101.pending_originals){
 const old=originals.get(row.contact_index);
 if(!old||!row.verification_status.includes('UNVERIFIED')||row.publication)fail('pending gate not enforced '+row.contact_index);
}
if(JSON.stringify(p101.orientation_correction?.affected_photo_ids)!==JSON.stringify([62])||
   verified.get(62)?.pixel_diagnostics?.exif_orientation!==6||
   entries.find(x=>x.contact_index===62)?.display_oriented_dimensions?.height!==4000)
   fail('Hannover crypt EXIF orientation correction missing');
console.log('PASS P101 (EXIF-aware): 11 hashed originals, 10 decoded, 3 low-flag first editorial candidates (58/61/71), 7 targeted review, 1 hash-only; 20 pending and 0 published.');
