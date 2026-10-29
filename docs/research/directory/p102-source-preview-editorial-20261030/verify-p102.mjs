#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)), read=p=>JSON.parse(readFileSync(join(here,p),'utf8'));
const v=read('p102-actual-preview-editorial.json');
const p98=read('../p98-originals-release-gate-20261029/p98-original-verification-queue.json');
const p100=read('../p100-original-photo-probe-20261030/p100-original-integrity-evidence.json');
const p101=read('../p101-verified-original-quality-triage-20261030/p101-quality-triage.json');
const fail=s=>{throw new Error('P102 evidence gate: '+s)};
const ix=new Map(p98.original_verification_candidate_queue.map(x=>[x.contact_index,x]));
const ten=new Map(p100.batch.entries.filter(x=>x.technical_result==='PASS_ORIGINAL_INTEGRITY').map(x=>[x.contact_index,x]));
const elev=new Set([...ten.keys(),195]), present=new Set();
if(ix.size!==31||ten.size!==10||v.entries.length!==11||v.count!==11||p101.batch_entries.length!==11)fail('baseline count drift');
for(const row of v.entries){
 if(present.has(row.photo_id)||!elev.has(row.photo_id))fail('not among 11 original-verified IDs');
 present.add(row.photo_id);
 const prior=ix.get(row.photo_id);
 if(prior?.physical_anchor_id!==row.physical_anchor_id||prior?.exact_commons_source_url!==row.exact_source_file_page)fail('site/source identity mismatch '+row.photo_id);
 if(!row.preview_actually_seen||row.inspection_scope!=='EXACT_RENDERED_COMMONS_THUMBNAIL_NOT_FULL_ORIGINAL'||!row.visual_observation||!row.crop_advice||!row.rendered_exact_preview_url.startsWith('https://thumb.wikimedia.org/'))fail('preview evidence missing '+row.photo_id);
 if(row.manual_full_original_pixel_visual_QA||row.actual_app_mobile_desktop_crop_tested||row.license_attribution_finally_cleared||row.final_editorial_approved||row.published)fail('false release approval '+row.photo_id);
 if(row.photo_id===195){
   if(row.original_full_jpeg_decoded||row.decoded_original_raw_dimensions!==null||row.independent_sha1!==p100.earlier_blandford_probe.sha1_recomputed)fail('Blandford probe overstated');
 } else {
   const t=ten.get(row.photo_id);
   if(!t||!row.original_full_jpeg_decoded||row.independent_sha1!==t.sha1_recomputed||row.independent_sha256!==t.sha256_recomputed)fail('hash-backed source mismatch '+row.photo_id);
 }
}
const expected={PREFERRED_EXTERIOR_PREVIEW:3,SECONDARY_EXTERIOR_PREVIEW:4,PORTRAIT_GALLERY_ONLY:3,SECONDARY_CRYPT_PORTRAIT:1};
for(const [k,n] of Object.entries(expected))if(v.visual_roles[k]!==n||v.entries.filter(e=>e.editorial_preview_role===k).length!==n)fail('role count drift '+k);
if(JSON.stringify([...present].sort((a,b)=>a-b))!==JSON.stringify([12,15,20,52,58,61,62,71,75,96,195]))fail('preview IDs drift');
if(JSON.stringify(v.baseline.p97_unseen_exact_previews)!==JSON.stringify([77,110,204,261]))fail('false preview completion');
const crypt=p101.batch_entries.find(x=>x.contact_index===62), c=v.entries.find(x=>x.photo_id===62);
if(crypt?.exif_orientation_for_display!==6||crypt?.decoded_original_dimensions?.width!==4000||crypt?.decoded_original_dimensions?.height!==2252||
 crypt?.display_oriented_dimensions?.width!==2252||crypt?.display_oriented_dimensions?.height!==4000||
 crypt?.hypothetical_16_9_crop?.retained_original_area_percent!==31.7||
 !crypt.review_flags.includes('16_9_CENTER_CROP_RETENTION_UNDER_50_PERCENT')||
 c.exif_orientation!==6||c.display_oriented_dimensions?.height!==4000||c.editorial_preview_role!=='SECONDARY_CRYPT_PORTRAIT')
 fail('crypt orientation correction missing');
if(v.entries.find(x=>x.photo_id===58)?.editorial_preview_role!=='SECONDARY_EXTERIOR_PREVIEW')fail('Adelhauser downgrade missing');
if(v.publication_count!==0||v.final_editorial_approval_count!==0||v.baseline.published!==0||v.baseline.pending_originals!==20||
 v.baseline.original_assignments!==385||v.baseline.wrong_site_rejected!==90||
 v.baseline.corroborated_subjects_research_only!==83||v.baseline.unverified_site_assignments!==212)fail('release or identity gate failed');
console.log('PASS P102: 11 exact Commons previews inspected; 3 preferred, 4 secondary, 3 portrait gallery, 1 portrait crypt; EXIF=6 corrected; 0 approvals or publication.');
