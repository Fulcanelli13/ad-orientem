import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPiusX20PathReview} from '../previews/visible-mass-3d/pius-x-20path-editorial-review.mjs';
const read=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const policy=await read('data/learn/research/pius-x-denzinger-optional-release-policy-20261020.v1.json');
assert.equal(policy.rules.denzingerRequirement,'OPTIONAL_NON_BLOCKING');
assert.equal(policy.counts.denzingerNumberRequirementsForSPX,0);
assert.ok(policy.rules.releaseRequired.includes('Verifiable original primary-source passage locator'));
assert.ok(!policy.rules.releaseRequired.some(s=>/denzinger|DS\/DH/i.test(s)));
const review=await createPiusX20PathReview(read);
assert.equal(review.version,'AO_SPX_20PATH_SOURCE_OWNER_REVIEW_V1');
assert.equal(review.reviewOnly,true);
assert.equal(review.published,false);
assert.equal(review.stats.denzingerRequired,false);
assert.equal(review.stats.approved,0);
assert.equal(review.chapters.length,20);
const seen=new Set();
let revisions=0,canonMatches=0;
for(const chapter of review.chapters){
 assert.ok(chapter.en&&chapter.fr);
 assert.ok(chapter.entries.length>=2);
 assert.ok(chapter.all.length>=2);
 for(const id of chapter.all){
  assert.ok(!seen.has(id),'duplicate editorial QID '+id);seen.add(id);
  const item=await review.inspect(id);
  assert.equal(item.reviewOnly,true);
  assert.equal(item.approved,false);
  assert.equal(item.originalNumberPrinted,false);
  assert.match(item.id,/^PX1905-Q\d+$/);
  assert.ok(item.answer.en&&item.answer.fr);
  assert.ok(item.question.en&&item.question.fr);
  assert.ok(item.sourceUrl.startsWith('https://'));
  assert.ok(item.printIndex.includes('1905'));
  assert.equal(item.sourceLabel.includes(id),true);
  assert.ok(item.choices.every(c=>c.id!==id&&c.en&&c.fr));
  assert.ok(item.cross.every(c=>c.id!==id&&c.en&&c.fr));
  if(item.proposedRevision){
   revisions++;
   assert.equal(item.proposedRevision.approved,false);
   assert.ok(item.proposedRevision.en&&item.proposedRevision.fr);
  }
  if(item.canon?.status==='MATCHED_NARROW_CONTENT_SUBJECT')canonMatches++;
 }
}
assert.equal(seen.size,100);
assert.equal(revisions,6); // Four other optional revisions are on legacy T2, not automatic next turns.
assert.equal(canonMatches,5);
assert.equal((await review.inspect('PX1905-Q667')),null);
const html=await readFile(new URL('../previews/visible-mass-3d/pius-x-conversation-paths-review.html',import.meta.url),'utf8');
assert.ok(html.includes('pius-x-20path-editorial-review.mjs'));
assert.ok(html.includes('Original draft')&&html.includes('Proposed correction'));
assert.ok(html.includes('Check a Chanoine follow-up'));
assert.ok(html.includes('No verified answer'));
assert.ok(html.includes('Denzinger references are optional'));
assert.ok(!html.includes('script src="https://'));
console.log('SPX reviewer PASS: 20 chapters/100 source-owned questions, 6 visible opening-turn corrections, 4 narrow Canon probes, no Denzinger required, zero published.');
