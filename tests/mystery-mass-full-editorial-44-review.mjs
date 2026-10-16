// A standalone, unapproved editorial HTML. Prevent research or preview regressions.
// No use of localStorage, document or network in this test; source is parsed as data.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const reg=JSON.parse(read('data/learn/research/mystery-mass-editorial-source-register-20261015.v1.json'));
const manuscript=JSON.parse(read('data/learn/research/mystery-mass-source-led-narrative-drafts-20261014.v1.json'));
const html=read('docs/review/mystery-mass-editorial-batch-review-44-20261015.html');
assert.equal(reg.countingRules.chapters,8);
assert.equal(reg.countingRules.canonicalExplanationOwners,39);
assert.equal(reg.countingRules.distinctBilingualStudyDrafts,44);
assert.equal(reg.countingRules.sourceReviewApprovalsGranted,0);
assert.equal(reg.countingRules.initialGapFlagsClassified,325);
assert.equal(reg.owners.length,39);
assert.equal(reg.chapters.length,8);
assert.equal(reg.draftPublicationApproved,false);
assert.equal(manuscript.liturgicalStudySelections.length,39);
assert.equal(manuscript.liturgicalStudySelections.flatMap(o=>o.studyOfMassExistingDrafts).length,44);
assert(!/<script[^>]+src=/.test(html),'offline HTML cannot depend on remotely served JS');
assert(html.includes('meta name="robots" content="noindex,nofollow"'),'never index unpublished manuscript');
const match=html.match(/<script>([\s\S]*?)<\/script><\/body><\/html>$/);
assert(match,'single inline review runtime');
new Script(match[1],{filename:'mystery-mass-editorial-batch-review-44-20261015.inline.js'});
const json=match[1].match(/const MODEL=(\{[^\n]+\});\nconst batches=/)?.[1];
assert(json,'stable inline manuscript JSON');
const page=JSON.parse(json);
assert.equal(page.studies.length,39);
assert.equal(page.chapters.length,8);
const liveStudies=page.studies.flatMap(o=>o.items.map(s=>({owner:o.id,stage:o.stage,...s})));
assert.equal(liveStudies.length,44);
assert.equal(new Set(liveStudies.map(s=>s.id)).size,44,'duplicate study IDs would overwrite approvals');
assert.equal(new Set(page.chapters.map(x=>x.id)).size,8);
const index=new Map(reg.owners.map(x=>[x.ownerId,x]));
const source=new Map(manuscript.liturgicalStudySelections.map(x=>[x.owner,x]));
for(const owner of page.studies){
 const idx=index.get(owner.id),orig=source.get(owner.id);
 assert(idx&&orig,'source owner missing in durable registry');
 assert.equal(owner.stage,idx.stageId);
 assert.deepEqual(owner.items.map(x=>x.id),idx.draftIds);
 assert.equal(owner.items.length,orig.studyOfMassExistingDrafts.length);
 for(const s of owner.items){
  const t=orig.studyOfMassExistingDrafts.find(x=>x.id===s.id);
  assert(t,'source study not found');
  assert.equal(s.en[0],t.originalEnglishShort);
  assert.equal(s.en[1],t.originalEnglishDeep);
  assert.equal(s.fr[0],t.originalFrenchShort);
  assert.equal(s.fr[1],t.originalFrenchDeep);
  assert.deepEqual(s.sources,t.originalSourceHierarchy);
 }
}
assert.equal(page.chapters.find(x=>x.id==='MF02')?.crossCutting,true);
assert.equal(page.studies.filter(o=>o.stage==='MF02').length,0);
const batchLabels=match[1].match(/id:"[1-4]",title:/g)||[];
assert.equal(batchLabels.length,4,'large review batches must be available');
const group=[['MF01','MF02'],['MF03','MF04'],['MF05','MF06'],['MF07','MF08']];
for(const g of group)assert(match[1].includes('stages:["'+g.join('","')+'"]'));
for(const func of ['sourceLinks','studyCard','render','exportReviews','importReview','persist'])assert(match[1].includes('function '+func));
for(const field of ['data-choice','data-note','"replace"','"revise"','"exclude"','"keep"','"shorten"','"deep"'])assert(html.includes(field),field);
assert(match[1].includes('sourceVersion:MODEL.version'),'export must version-match its source records');
assert(match[1].includes('sourceVersion!==MODEL.version'),'imports must reject wrong source');
assert(match[1].includes('localStorage'),'local offline decision preservation required');
assert(!html.includes('new Mass reader'),'preview not a new live reader');
console.log('Mystery editorial 44 review: verified eight chapters, 39 owners, 44 unapproved EN/FR draft identities, 4 batches, offline JS syntax, source parity, import/export controls and no publication.');
