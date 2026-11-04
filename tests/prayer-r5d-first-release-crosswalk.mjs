#!/usr/bin/env node
/** Validate the FIRST R5D publication cohort without authorising publication.
 * 21 preserved exact museum/Commons source files -> 53 non-Rosary Prayer placements.
 * This must run before any production registry mutation.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {prayerEditorialSlot} from '../src/pray/editorial-artwork-assignments.v1.js';
import {RELEASED_MODULE_PAINTINGS} from '../src/art/released-module-paintings.v1.js';

const load = path => JSON.parse(readFileSync(path,'utf8'));
const base='assets/prayer/research/';
const first=load('data/pray/artwork-r5d-museum-source-verification-20261104.v1.json').records;
const bulk=load(base+'r5d-bulk-museum-originals/manifest.json').artworks;
const commons=load(base+'r5d-commons-originals/manifest.json').records.filter(r=>r.status==='ACQUIRED_FOR_QA');
const rescued=load(base+'r5d-commons-recovered-originals/manifest.json').records;
const works=[
 ...first.map(r=>({title:r.title,source:r.sourcePage,slots:r.slots,
  sha:r.imageSourceRetrieval.sha256,bytes:r.imageSourceRetrieval.bytes,
  file:base+'r5d-museum-originals/'+(r.sourcePage.includes('cleveland')?'cleveland-1916.786.jpg':'met-437542.jpg')})),
 ...bulk.map(r=>({title:r.curatorial_title,source:r.source_page,slots:r.approved_slots,
  sha:r.sha256,bytes:r.bytes,file:base+'r5d-bulk-museum-originals/'+r.museum+'-'+r.object_id+'.'+
  (r.format==='TIFF'?'tif':r.format==='PNG'?'png':'jpg')})),
 ...commons.map(r=>({title:r.master_title,source:r.source_page,slots:r.approved_slots,
  sha:r.sha256,bytes:r.bytes,file:base+'r5d-commons-originals/'+r.research_image_file})),
 ...rescued.map(r=>({title:r.master_title,source:r.source_page,slots:r.approved_slots,
  sha:r.sha256,bytes:r.bytes,file:base+'r5d-commons-recovered-originals/'+r.research_image_file}))
];
assert.equal(works.length,21,'Expected exactly 21 preserved photographs');
const canonical=s=>{const u=new URL(s);return u.hostname.replace(/^www\./,'')+decodeURIComponent(u.pathname).replace(/\/$/,'')};
let slots=new Set();
for(const work of works){
 const data=readFileSync(work.file);
 assert.equal(data.byteLength,work.bytes,'Size mismatch '+work.file);
 assert.equal(createHash('sha256').update(data).digest('hex'),work.sha,'Hash mismatch '+work.file);
 assert.ok(work.slots.length,'Missing approved editorial placements: '+work.title);
 for(const id of work.slots){
   assert.ok(!slots.has(id),'Duplicate artwork stage '+id);slots.add(id);
   assert.ok(!id.includes('rosary-'),'Signature Rosary is explicitly deferred: '+id);
   const editorial=prayerEditorialSlot(id);
   assert.ok(editorial,'Missing editorial slot '+id);
   assert.equal(editorial.approvedOrInherited,true,'Editorial approval not established for '+id);
   assert.equal(editorial.hold,false,'Editorial hold applies to '+id);
   assert.equal(editorial.protectedCover,false,'Protected cover may not change: '+id);
   assert.equal(editorial.sourceIdentityVerified,true,'Unverified source identity: '+id);
   assert.equal(canonical(editorial.selected.sourcePage),canonical(work.source),'Wrong artwork mapped for '+id);
 }
}
assert.equal(slots.size,53,'Expected 53 distinct non-Rosary slots');
const released=Object.values(RELEASED_MODULE_PAINTINGS);
for(const work of works)
 assert.ok(!released.some(a=>canonical(a.source)===canonical(work.source)),
  'Unexpectedly live source in released photo catalogue: '+work.title);
const report={
 schema:'AO_PRAYER_R5D_21_WORK_53_SLOT_STAGING_V1',
 works:works.length,nonRosarySlots:slots.size,hashIntegrityPassed:true,
 editorialCrosswalkPassed:true,publicationAuthorized:false,
 visualInspection:'PENDING_FINAL_MANUAL_APPROVAL',
 responsiveReaderQA:'NOT_RUN',
 releaseRegistryMutated:false,
 candidates:works.map(({title,source,file,slots,sha,bytes})=>({title,source,file,slots,sha256:sha,bytes,
   visualReview:'REVIEW_REQUIRED',published:false}))
};
mkdirSync('r5d-first-release-qa',{recursive:true});
writeFileSync('r5d-first-release-qa/staging-manifest.json',JSON.stringify(report,null,2)+'\n');
console.log('21 original hashes and 53 approved slots verified; 0 released, Rosary unchanged.');
