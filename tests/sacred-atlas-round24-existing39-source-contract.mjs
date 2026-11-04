import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('data/geography/research/sacred-atlas-undecided66-bulk-photo-review-20261104.html','utf8');
const a=html.indexOf('const places=')+'const places='.length;
const b=html.indexOf(']; const auditStatuses=',a)+1;
assert.ok(a>12&&b>a,'canonical master array is available');
const places=JSON.parse(html.slice(a,b));
const remaining=places.filter(p=>!p.candidates.some(c=>c.originalVerified));
const selected=remaining.flatMap(p=>p.candidates.filter(c=>c.audit?.status==='METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL').map(c=>({place_id:p.id, ...c})));
assert.equal(selected.length,39,'bounded bulk cohort should remain 39');
assert.equal(new Set(selected.map(c=>c.place_id)).size,12,'12 exact existing Places');
assert.equal(new Set(selected.map(c=>c.title)).size,39,'file IDs must be unique');
for(const c of selected){
 assert.match(c.audit.sha1,/^[a-f0-9]{40}$/);
 assert.ok(c.audit.author&&c.audit.license,'metadata claim recorded, but not rights approval');
 assert.equal(c.originalVerified,undefined);
}
const script=readFileSync('tools/atlas/audit-sacred-atlas-r24-existing39.py','utf8');
assert.ok(script.includes('MAX_CANDIDATES=39'));
assert.ok(script.includes('MAX_API_PER_BATCH=8'));
assert.ok(script.includes('MIN_DELAY=10.0'));
assert.ok(script.includes('"published":False'));
assert.ok(script.includes('"user_editorial_approved":False'));
assert.ok(!script.includes('data/geography/sacred-place-media')&& !script.includes('git push'));
console.log('Round 24 research queue: 39 unverified photo leads / 12 canonical Places; publication blocked.');
