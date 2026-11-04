import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const base='data/geography/research/';
const manifest=JSON.parse(readFileSync(base+'sacred-atlas-round25-23place-64-original-review-20261104.json','utf8'));
const review=readFileSync(base+'sacred-atlas-round25-23place-64-original-editorial-review-20261104.html','utf8');
const r22=JSON.parse(readFileSync(base+'sacred-atlas-round22-11place-verified-sources-20261104.json','utf8'));
const master=readFileSync(base+'sacred-atlas-undecided66-bulk-photo-review-20261104.html','utf8');
const start=master.indexOf('const places=')+'const places='.length;
const end=master.indexOf(']; const auditStatuses=',start)+1;
assert.ok(end>start,'read canonical master');
const sources=JSON.parse(master.slice(start,end));
assert.equal(manifest.schema,'AO_SACRED_ATLAS_ROUND25_ALL64_VERIFIED_REVIEW_V1');
assert.equal(manifest.counts.places,23);
assert.equal(manifest.counts.images,64);
assert.equal(manifest.counts.originals_verified,64);
assert.equal(manifest.counts.editorially_approved,0);
assert.equal(manifest.counts.published_from_this_review,0);
assert.equal(manifest.production.published,379);
assert.equal(manifest.places.length,23);
assert.equal(new Set(manifest.places.map(p=>p.place_id)).size,23);
const images=manifest.places.flatMap(p=>p.images);
assert.equal(images.length,64);
assert.equal(new Set(images.map(x=>x.file)).size,64);
const round22=manifest.places.filter(p=>p.cohort==='ROUND22'),round24=manifest.places.filter(p=>p.cohort==='ROUND24');
assert.equal(round22.length,11);
assert.equal(round22.reduce((a,p)=>a+p.images.length,0),25);
assert.equal(round24.length,12);
assert.equal(round24.reduce((a,p)=>a+p.images.length,0),39);
assert.equal(manifest.sources.round24_audit.run_id,41823506824);
assert.equal(manifest.sources.round24_audit.artifact_id,13318214603);
assert.equal(manifest.sources.round24_audit.original_bytes_verified,39);
assert.equal(manifest.sources.round24_audit.total_original_bytes,198880443);
assert.equal(manifest.sources.round24_audit.audit_json_sha256,'a7f862a6050b6efd52d0a0eec29fb38b191be00b6cf9e635c5820053a5b83543');
const sourceOrder=round24.flatMap(p=>p.images.map(i=>i.file)).join('\n');
assert.equal(createHash('sha256').update(sourceOrder).digest('hex'),'466a5488301c5a109875075f93d61a1ba0ffd3a58a58641767c4bd1e3cb9c0ca');
assert.equal(round24.flatMap(p=>p.images).reduce((a,x)=>a+x.bytes,0),198880443);
for(const p of round22) {
 const old=r22.places.find(x=>x.place_id===p.place_id);
 assert.ok(old);
 assert.deepEqual(p.images.map(x=>x.file),old.photo_candidates.map(x=>x.file));
 for(let i=0;i<p.images.length;i++) {
  const a=p.images[i],b=old.photo_candidates[i];
  assert.equal(a.sha1,b.sha1);
  assert.equal(a.bytes,b.bytes);
  assert.equal(a.author,b.author);
  assert.equal(a.license,b.license);
 }
}
for(const p of round24) {
 const old=sources.find(x=>x.id===p.place_id);
 assert.ok(old);
 assert.ok(!old.candidates.some(x=>x.originalVerified),'Round24 new cohort is separate');
 for(const image of p.images) {
  const c=old.candidates.find(x=>x.title===image.file);
  assert.equal(c?.audit?.status,'METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL');
  assert.equal(image.sha1,c.audit.sha1);
  assert.ok(image.bytes>0&&image.bytes<=24000000,'audited original size persisted');
  assert.equal(image.author,c.audit.author);
  assert.equal(image.license,c.audit.license);
  assert.equal(image.width,c.audit.width);
  assert.equal(image.height,c.audit.height);
  assert.equal(image.role==='GALLERY_REVIEW_PENDING_RIGHTS',p.place_id==='place:CL:sanctuary-of-our-lady-of-la-tirana-chile');
 }
}
assert.equal(manifest.places.find(x=>x.place_id==='place:DE:friedhofskirche-st-michael-altoetting').images.find(x=>x.file==='File:Friedhofskirche Altötting 1.jpg').role,'GALLERY_ONLY');
for(const x of images) {assert.match(x.sha1,/^[a-f0-9]{40}$/);assert.equal(x.byte_verified,true);assert.ok(x.author&&x.license&&x.url);}
const marker='<script type="application/json" id="review-data">';
const a=review.indexOf(marker),b=review.indexOf('</script>',a);
assert.ok(a!==-1&&b>a);
assert.deepEqual(JSON.parse(review.slice(a+marker.length,b)),manifest);
const js=review.slice(b+'</script>'.length);
const jsStart=js.indexOf('<script>'),jsEnd=js.indexOf('</script>',jsStart);
assert.ok(jsStart!==-1&&jsEnd>jsStart);
new vm.Script(js.slice(jsStart+'<script>'.length,jsEnd),{filename:'round25-review-embedded.js'});
assert.ok(review.includes('AO_SACRED_ATLAS_UNDECIDED66_USER_EDITORIAL_REVIEW_EXPORT_V1'),'compatible editorial export');
assert.ok(review.includes('if(!c||!allowed(c))return'),'do not accept gallery-only cover');
assert.ok(review.includes('None selected or approved.'),'no default approvals');
console.log('Round 25 PASS: 23 Places, 64 byte-verified source claims, import/export safe and no cover preapproval.');
