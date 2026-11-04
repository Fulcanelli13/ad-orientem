import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root='data/geography/research/';
const manifest=JSON.parse(readFileSync(root+'sacred-atlas-round22-11place-verified-sources-20261104.json','utf8'));
const review=readFileSync(root+'sacred-atlas-round22-11place-editorial-review-20261104.html','utf8');
const master=readFileSync(root+'sacred-atlas-undecided66-bulk-photo-review-20261104.html','utf8');
const start=master.indexOf('const places=')+'const places='.length;
const end=master.indexOf(']; const auditStatuses=',start);
assert.ok(end>start,'master place array is available');
const places=JSON.parse(master.slice(start,end+1));
const expected=places.filter(p=>p.candidates.some(c=>c.originalVerified));
const all=manifest.places.flatMap(p=>p.photo_candidates.map(c=>({place_id:p.place_id,...c})));
assert.equal(manifest.schema,'AO_SACRED_ATLAS_ROUND22_11PLACE_REVIEW_V1');
assert.equal(manifest.publication,'RESEARCH_ONLY_NO_COVERS_APPROVED');
assert.equal(manifest.places.length,11);
assert.equal(all.length,25);
assert.equal(new Set(manifest.places.map(p=>p.place_id)).size,11);
assert.equal(new Set(all.map(c=>c.file)).size,25);
assert.equal(manifest.baseline.published,379);
assert.equal(manifest.baseline.total,530);
for(const place of manifest.places){
 const orig=expected.find(p=>p.id===place.place_id);
 assert.ok(orig,'place exists in source master: '+place.place_id);
 for(const image of place.photo_candidates){
  const candidate=orig.candidates.find(c=>c.title===image.file);
  assert.ok(candidate?.originalVerified,'unverified original: '+image.file);
  assert.equal(image.sha1,candidate.originalSHA1||candidate.audit?.sha1);
  assert.equal(image.bytes,candidate.originalSize);
  assert.equal(image.author,candidate.audit?.author);
  assert.equal(image.license,candidate.audit?.license);
  assert.equal(image.source_url,candidate.url);
  assert.match(image.sha1,/^[0-9a-f]{40}$/);
  assert.ok(image.bytes>0&&image.author&&image.license);
  assert.equal(image.status,'ORIGINAL_VERIFIED_EDITORIAL_AND_RIGHTS_PENDING');
  if(image.file==='File:Friedhofskirche Altötting 1.jpg')assert.equal(image.role,'gallery_only');
 }
}
const marker='<script type="application/json" id="manifest">';
const a=review.indexOf(marker),b=review.indexOf('</script>',a);
assert.ok(a>=0&&b>a,'review embeds verifiable evidence');
assert.deepEqual(JSON.parse(review.slice(a+marker.length,b)),manifest);
assert.ok(review.includes('AO_SACRED_ATLAS_UNDECIDED66_USER_EDITORIAL_REVIEW_EXPORT_V1'));
assert.ok(review.includes('PREFER_AS_COVER_SUBJECT_TO_VERIFICATION'));
assert.ok(!review.includes('publication approved'));
console.log('Round 22 OK: 11 Places; 25 verified originals; zero editorial preapprovals.');
