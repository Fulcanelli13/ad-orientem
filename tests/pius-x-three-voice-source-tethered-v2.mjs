import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const parse=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='previews/';
const v2=parse(dir+'pius-x-three-voice-source-tethered-v2-20261021.json');
const v1=parse(dir+'pius-x-three-voice-pacing-review-candidates-20261021.json');
const fixture=parse(dir+'pius-x-depth12-source-owned-review-fixture-20261021.json');
const owner=parse('data/learn/research/pius-x-batch50-part-c-20261019.v1.json');
const html=readFileSync(dir+'pius-x-12scene-visual-novel-editorial-review-20261021.html','utf8');
const report=readFileSync('docs/research/PIUS-X-FIRST3-SOURCE-TETHERED-VOICE-20261021.md','utf8');
const embedded=html.match(/<script id="voiceSamples" type="application\/json">([\s\S]*?)<\/script>/);
assert(embedded);
assert.deepEqual(JSON.parse(embedded[1]),v2,'review stage must embed exact v2 review candidate');
assert.equal(v2.schema,'AO_SPX_THREE_SOURCE_TETHERED_BILINGUAL_VOICE_REVIEW_V2');
assert.equal(v2.publication,'NOT_APPROVED_NOT_PUBLISHED');
assert.equal(v2.reviewState.runtimeImportAllowed,false);
assert.equal(v2.reviewState.independentHistoricalReviewerApproved,false);
assert.equal(v2.reviewState.independentTheologicalReviewerApproved,false);
assert.equal(v2.reviewState.englishStyleApproved,false);
assert.equal(v2.reviewState.frenchStyleApproved,false);
assert.equal(v2.counts.scenes,3);assert.equal(v2.counts.segments,9);assert.equal(v2.counts.localizedSegments,18);
assert.equal(v2.counts.originalRecordsReplaced,0);
assert.equal(v1.candidates.length,3,'v1 remains for independent before/after');
const original=new Map(owner.records.map(x=>[x.id,x]));
const all=new Set();
const claimIDs=new Set();
for(const c of v2.candidates){
 assert(!all.has(c.chapterId));all.add(c.chapterId);
 assert.equal(c.historicalQuote,false);
 const source=original.get(c.chapterId),scene=fixture.scenes.find(x=>x.id===c.chapterId);
 assert(source && scene,'existing source-owned document and scene');
 assert.equal(c.source.url,source.source.url);
 assert.equal(c.source.url,scene.source.url);
 assert.equal(c.source.numberingIsEditorial,c.chapterId!=='SPX-032');
 assert.equal(c.source.sourceVerifiedToDisplayedText,true);
 assert(c.routeIndex>=0&&c.routeIndex<3);
 assert.deepEqual(c.evidence.map(x=>x.segment),['opening','follow','deep']);
 assert.deepEqual(c.pose.map(x=>x===null?'none':x).every(x=>['explaining','thoughtful','welcoming','grave','neutral','none'].includes(x)),true);
 for(const seg of ['opening','follow','deep']){
  const turn=c[seg],e=c.evidence.find(x=>x.segment===seg);
  assert(e.claimIds.length,'no orphaned content claims');
  assert(!e.claimIds.some(x=>claimIDs.has(c.chapterId+':'+seg+':'+x)));
  for(const id of e.claimIds)claimIDs.add(c.chapterId+':'+seg+':'+id);
  for(const lang of ['en','fr']){
   assert(turn.q[lang].length>15 && turn.a[lang].length>25);
   assert(!/\b(?:thou|thee)\b/i.test(turn.a[lang]),'no stagey archaic English');
   if(lang==='fr')assert(!/\bNous\b/.test(turn.a[lang]),'no invented papal plural');
  }
  assert(['SOURCE_BOUNDED_CHARACTER_STYLE_HYPOTHESIS','OUT_OF_CHARACTER_EDITORIAL_BOUNDARY_NOT_PIUS_SPEECH'].includes(c.speakerPolicy[seg]));
  if(!(c.chapterId==='SPX-023'&&seg==='deep'))assert(e.sourceLocators.length,'every source-bounded claim has a passage locus');
 }
}
assert.deepEqual([...all].sort(),['SPX-010','SPX-023','SPX-032']);
const peter=v2.candidates.find(x=>x.chapterId==='SPX-010');
assert(!/Peter.s betrayal|trahison de Pierre/i.test(JSON.stringify([peter.opening,peter.follow,peter.deep])));
assert(/denied/.test(peter.opening.a.en));
assert(/returned the money/.test(peter.follow.a.en));
assert(peter.evidence[0].sourceLocators.includes('Q198'));
assert(peter.evidence[1].sourceLocators.includes('Q199'));
assert(peter.evidence[2].sourceLocators.includes('Q200'));
const communion=v2.candidates.find(x=>x.chapterId==='SPX-023');
assert(/receive grace/.test(communion.follow.a.en));
assert(communion.evidence[1].sourceLocators.includes('Q479'));
assert.equal(communion.speakerPolicy.deep,'OUT_OF_CHARACTER_EDITORIAL_BOUNDARY_NOT_PIUS_SPEECH');
assert.equal(communion.pose[2],null);
assert.equal(communion.evidence[2].sourceLocators.length,0);
const correction=v2.candidates.find(x=>x.chapterId==='SPX-032');
assert(/patience/.test(correction.opening.a.en));
assert(/patient and kind/.test(correction.deep.a.en));
assert(correction.evidence.every(x=>x.sourceLocators.includes('§13')));
assert(report.includes('Nine-segment claim matrix'));
assert(report.includes('Original Latin *E supremi* collation'));
assert(report.includes('APPROVAL STILL PENDING'));
console.log('PASS Pius X source-tethered v2: original 3 owners intact; 9 EN/FR claim-mapped source statements; Peter denial corrected, spiritual Communion grace Q479, E supremi §13 patience; historical-character restrictions upheld.');
