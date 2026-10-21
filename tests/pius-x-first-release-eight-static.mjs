import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const base='data/learn/research/';
const bundle=read(base+'pius-x-first-release-source-locked-eight-20261021.v1.json');
const existing=read(base+'pius-x-82chapter-dialogue-authoring-index-20261021.v1.json');
const shortlist=read('artifacts/pius-x-complete-corpus/SPX_Balanced_130_Release_Candidates.json');
const queue=read('artifacts/pius-x-complete-corpus/SPX_130_vs_82_Editorial_Review_Queue.json');
const sourceFiles=[
 base+'pius-x-batch2-a1-20261019.v1.json',
 base+'pius-x-batch50-part-c-20261019.v1.json'
];
const owners=new Map(sourceFiles.flatMap(p=>read(p).records.map(r=>[r.id,{path:p,record:r}])));
const authored=new Set([...existing.priorChapters,...existing.newChapters.map(r=>r.id)]);
const selected=new Map(shortlist.candidates.map((r,i)=>[r.id,{rank:i+1,record:r}]));
assert.equal(bundle.schema,'AO_SPX_FIRST_RELEASE_SOURCE_LOCKED_EIGHT_SCENES_V1');
assert.equal(bundle.counts.firstReleaseSubset,8);
assert.equal(bundle.counts.unapprovedBilingualTurnPairs,24);
assert.equal(bundle.counts.localizedDraftAnswerCount,48);
assert.equal(bundle.counts.newCanonicalTopics,0);
assert.equal(bundle.counts.originalSourceOwnerAnswersModified,0);
assert.equal(shortlist.actual,130);
assert.equal(queue.counts.firstReleaseCandidatesAlreadyAuthored,61);
assert.equal(queue.counts.firstReleaseCandidatesAwaitingAuthoring,69);
assert.deepEqual(bundle.records.map(r=>r.id),['SPX-016','SPX-015','SPX-035','SPX-034','SPX-027','SPX-036','SPX-005','SPX-021']);
const ids=new Set(),turnIds=new Set();
for(const row of bundle.records){
 assert(!ids.has(row.id));ids.add(row.id);
 assert(authored.has(row.id),'not newly invented canonical chapter');
 const candidate=selected.get(row.id),owner=owners.get(row.id);
 assert(candidate&&owner,'source and shortlist owner must be retained');
 assert.equal(row.selection.firstReleaseRank,candidate.rank);
 assert.equal(row.selection.sourceOwner,owner.path);
 assert.equal(row.selection.category,candidate.record.category);
 assert.equal(row.source.url,candidate.record.source.url);
 assert.equal(row.source.originalLanguage,'it');
 assert(row.source.passageEvidenceState.includes('NOT_INDEPENDENT_APPROVAL'));
 assert.deepEqual(Object.values(row.approvals),[false,false,false,false,false,false]);
 assert.equal(row.turns.length,3);
 assert.equal(row.scene.anyPersonalSacramentalVerdictPermitted,false);
 assert.equal(row.scene.allThreeSiblingBranchesUnaffected,true);
 assert(candidate.record.topic.en.length>15&&candidate.record.topic.fr.length>15);
 assert(owner.record.opening?.question?.en||owner.record.turns?.[0]?.question?.en,'original opening question remains in its unchanged owner');
 assert(row.turns[0].visitor.en.length>15&&row.turns[0].visitor.fr.length>15);
 for(let i=0;i<3;i++){
  const t=row.turns[i];
  assert(!turnIds.has(t.id));turnIds.add(t.id);
  assert(t.loci.length>=1,'every displayed claim tied to a source passage');
  assert(t.loci.every(s=>/^(?:Q[0-9]+|§[0-9]+)$/.test(s)),'question/section locator format');
  for(const lang of ['en','fr']){
   assert(t.visitor[lang].length>12);
   assert(t.reply[lang].length>45);
  }
  assert.equal(t.quote,false);
  assert.equal(t.translationApproved,false);
  assert.equal(t.periodVoiceApproved,false);
 }
 assert(row.selection.firstReleaseRank>=1&&row.selection.firstReleaseRank<=130);
}
assert.equal(ids.size,8);assert.equal(turnIds.size,24);
const html=readFileSync('previews/pius-x-eight-first-release-source-locked-20261021.html','utf8');
const blocks=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(blocks.length,2);
assert.deepEqual(JSON.parse(blocks[0]).records,bundle.records);
new Function(blocks[1]);
assert(html.includes('id="sourceFull"'));
assert(html.includes('id="export"'));
assert(html.includes('prefers-reduced-motion'));
assert(html.includes('pius_'));
assert(!html.includes('fetch('),'all Q&A are embedded for offline reading');
const report=readFileSync('docs/research/PIUS-X-FIRST-RELEASE-EIGHT-SOURCE-LOCKED-TRANSCRIPTS-20261021.md','utf8');
assert(report.includes('## 8. SPX-021'));
console.log('PASS SPX first-release source-locked eight: all 8 are canonical 130 selections already authored, 24 source-locus turns/48 localized answer drafts, source owners and zero approvals preserved; HTML syntax and embedded source verified.');
