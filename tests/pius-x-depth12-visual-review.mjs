import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const base='previews/';
const fixture=readJson(base+'pius-x-depth12-source-owned-review-fixture-20261021.json');
const voice=readJson(base+'pius-x-three-voice-source-tethered-v2-20261021.json');
const html=readFileSync(base+'pius-x-12scene-visual-novel-editorial-review-20261021.html','utf8');
const flow=readJson('data/learn/research/pius-x-12chapter-dependent-dialogue-flow-20261021.v1.json');
assert.equal(fixture.meta.reviewOnly,true);
assert.equal(fixture.meta.scenes,12);
assert.equal(fixture.meta.paths,36);
assert.equal(fixture.scenes.length,12);
assert.equal(voice.publication,'NOT_APPROVED_NOT_PUBLISHED');
assert.equal(voice.reviewState.runtimeImportAllowed,false);
assert.equal(voice.reviewState.independentTheologicalReviewerApproved,false);
assert.equal(voice.counts.segments,9);
assert.equal(voice.counts.localizedSegments,18);
assert.equal(voice.sourceEvidenceScope.exactQuotationCount,0);
assert.equal(voice.candidates.length,3);
const known=new Set();
for(const s of fixture.scenes){
 assert(!known.has(s.id),'unique scene');
 known.add(s.id);
 const source=flow.chapters.find(x=>x.chapterId===s.id);
 assert(source,'source owner scene');
 assert.deepEqual(s.opening.q.fr.length>8 && s.opening.q.en.length>8,true);
 assert(s.source.url.startsWith('https://'));
 assert.equal(s.paths.length,3);
 assert(['neutral','welcoming','explaining','thoughtful','grave'].includes(s.pose));
 for(let k=0;k<3;k++){
  const p=s.paths[k],original=source.parents[k];
  assert.equal(p.routeId,original.newNode.id);
  assert.equal(p.parentId,original.afterTurn);
  assert.deepEqual(p.deepQ,original.newNode.visitor);
  assert.deepEqual(p.deepA,original.newNode.reply);
  assert.equal(p.suggested,original.newNode.afterAnswer.find(x=>x.type==='OPEN_RELATED_CHAPTER').chapterId);
  for(const loc of ['en','fr'])for(const label of ['q','a','deepQ','deepA'])assert(p[label][loc].length>15);
 }
}
for(const c of voice.candidates){
 assert(known.has(c.chapterId));
 const corresponding=fixture.scenes.find(x=>x.id===c.chapterId);
 assert(c.routeIndex>=0 && c.routeIndex<corresponding.paths.length);
 assert.equal(c.source.sourceVerifiedToDisplayedText,true);
 assert.equal(c.historicalQuote,false);
 assert.equal(c.evidence.length,3);
 for(const evidence of c.evidence){
  assert(evidence.claimIds.length>0);
  if(evidence.segment!=='deep'||c.chapterId!=='SPX-023')assert(evidence.sourceLocators.length>0);
 }
 assert.equal(c.source.url,corresponding.source.url);
 for(const segment of ['opening','follow','deep']){
  for(const loc of ['en','fr']){
   assert(c[segment].q[loc].length>10);
   assert(c[segment].a[loc].length>40);
  }
  assert(['SOURCE_BOUNDED_CHARACTER_STYLE_HYPOTHESIS','OUT_OF_CHARACTER_EDITORIAL_BOUNDARY_NOT_PIUS_SPEECH'].includes(c.speakerPolicy[segment]));
 }
}
assert.equal(voice.candidates.filter(x=>x.speakerPolicy.deep==='OUT_OF_CHARACTER_EDITORIAL_BOUNDARY_NOT_PIUS_SPEECH').length,1);
assert.equal(voice.candidates.find(x=>x.chapterId==='SPX-023').speakerPolicy.deep,'OUT_OF_CHARACTER_EDITORIAL_BOUNDARY_NOT_PIUS_SPEECH');
assert(html.startsWith('<!doctype html>'));
assert(html.includes('max-width:770px'));
assert(html.includes('prefers-reduced-motion'));
assert(html.includes('id="sceneSelect"'));
assert(html.includes('id="ratePace"'));
assert(html.includes('id="rateVoice"'));
assert(html.includes('id="rateClarity"'));
assert(html.includes('id="exportRating"'));
assert(html.includes('id="voiceButton"'));
assert(html.includes('id="voiceSamples" type="application/json"'));
assert(html.includes('EDITORIAL SOURCE READING · NOT PAPAL SPEECH'));
assert(html.includes('OUT_OF_CHARACTER_EDITORIAL_BOUNDARY_NOT_PIUS_SPEECH'));
assert(html.includes('https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/2245d762237ef36fc778200ab2b3d536c342d2d4/previews/visible-mass-3d/assets/living-church/'));
assert(!html.includes('fetch('),'standalone scene must not dynamically fetch research data');
const blocks=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(blocks.length,3);
assert.equal(JSON.parse(blocks[0]).meta.schema,fixture.meta.schema);
assert.equal(JSON.parse(blocks[1]).schema,voice.schema);
new Function(blocks[2]); // syntax-only: no browser automation or proof of visual acceptance
const doc=readFileSync('docs/research/PIUS-X-SCENE-PACING-VOICE-ACCEPTANCE-20261021.md','utf8');
assert(doc.includes('54 of 84'));
assert(doc.includes('not browser-tested'));
console.log('PASS editorial preview structural/syntax check: 12 scene origins, 36 dependent branches, 3 voice tests, exact sprite source pin, no publication.');
