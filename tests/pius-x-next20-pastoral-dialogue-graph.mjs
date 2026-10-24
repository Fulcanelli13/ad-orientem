import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root='data/learn/research/';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const a=load(root+'pius-x-dialogue-next20-pastoral-a-20261021.v1.json');
const b=load(root+'pius-x-dialogue-next20-pastoral-b-20261021.v1.json');
const graph=load(root+'pius-x-82chapter-dialogue-authoring-index-20261021.v1.json');
const prev=load(root+'pius-x-62chapter-dialogue-graph-20261021.v1.json');
const existing=[
'pius-x-batch50-part-a-20261019.v1.json',
'pius-x-batch50-part-b-20261019.v1.json',
'pius-x-batch50-part-c-20261019.v1.json',
'pius-x-batch2-b3-20261019.v1.json'
].map(x=>({file:root+x,...load(root+x)}));
const originals=new Map(existing.flatMap(y=>y.records.map(x=>[x.id,{...x,filepath:y.file,isB3:y.file.includes('batch2-b3')}])));

assert.equal(a.counts.chapters,10);assert.equal(b.counts.chapters,10);
const rows=[...a.records,...b.records];
assert.equal(rows.length,20);assert.equal(graph.newChapters.length,20);
assert.equal(prev.counts.totalGraphChapterCount,62);
assert.equal(graph.counts.totalChapters,82);
assert.equal(graph.counts.totalQATurnNodes,291);
assert.equal(graph.counts.oldReusedTurns,40);
assert.equal(graph.counts.newWrittenTurns,40);
assert.equal(graph.counts.partialEvidenceNewChapters,4);
assert.equal(graph.counts.finalEditorialApprovals,0);
assert.equal(graph.counts.published,0);

const prior=new Set([...prev.priorChapterIds,...prev.chapters.map(x=>x.id)]);
assert.equal(prior.size,62);
assert.deepEqual(new Set(graph.priorChapters),prior);
const newIDs=new Set();const nodeIDs=new Set();
let bounded=0;
for(const row of rows){
const source=originals.get(row.id);
assert(source,'original Q&A must be retained');
assert(!prior.has(row.id),'no root collisions');
assert(!newIDs.has(row.id),'no duplicate new ID');
newIDs.add(row.id);
assert.equal(row.originalOwner.path,source.filepath);
const expSource=source.isB3?load(root+'pius-x-batch2-production-index-20261019.v1.json').entries.find(x=>x.id===row.id).source:source.source;
assert.equal(row.source.url,expSource.url);
assert.equal(row.source.locus,expSource.locus);
const originalQuestion=source.isB3?source.opening.question:source.question;
assert.deepEqual(row.originalQuestion,originalQuestion,'preserve original question');
assert.equal(row.newChoices.length,2);
const entry=graph.newChapters.find(x=>x.id===row.id);
assert(entry,'all records routed');
assert.equal(entry.nodes.length,4);
assert.equal(entry.afterOpeningOptions.length,3);
assert(entry.afterOpeningOptions.every(x=>entry.nodes.some(n=>n.id===x)));
assert.equal(entry.chanoine.optIn,true);
assert.equal(entry.chanoine.eligibleOnlyOnSourceOwnerApproval,true);
assert.equal(entry.denzinger.display,false);
assert.equal(entry.review.publish,false);
assert.equal(entry.review.periodVoice,false);
assert.equal(entry.sourceOwner,row.originalOwner.path);
const expectedSpeaker=source.isB3?'EDITORIAL_SOURCE_SCOPE_NOTE_NOT_PAPAL_CHARACTER_SPEECH':'SOURCE_BOUNDED_EDUCATIONAL_RECONSTRUCTION_NOT_QUOTE';
assert.equal(row.speaker,expectedSpeaker);
assert.equal(entry.speakerMode,row.speaker);
if(source.isB3){bounded++;assert.equal(entry.pose,null);}
else assert(['explaining','thoughtful'].includes(entry.pose));
for(const n of entry.nodes){assert(!nodeIDs.has(n.id));nodeIDs.add(n.id);}
for(let k=0;k<2;k++){
const choice=row.newChoices[k],n=entry.nodes[k+2];
assert.equal(n.question.en,choice.q.en);assert.equal(n.question.fr,choice.q.fr);
assert.equal(n.answer.en,choice.a.en);assert.equal(n.answer.fr,choice.a.fr);
assert(choice.q.en.length>=15&&choice.q.fr.length>=15);
assert(choice.a.en.length>=60&&choice.a.fr.length>=60);
assert.equal(choice.approved,false);
}
for(const edge of entry.related){
assert.equal(edge.scope,'WITHIN_AUTHORED_82_CHAPTERS');
assert(prior.has(edge.target)||rows.some(x=>x.id===edge.target),'every link in authored graph');
}
}
assert.equal(bounded,4);
assert.equal(newIDs.size,20);assert.equal(nodeIDs.size,80);
assert.equal(graph.proposedAliasesNotMerged.length,6);
assert(graph.proposedAliasesNotMerged.every(x=>x.approved===false&&x.decision==='CANDIDATE_REUSE_KEEP_OLD_DATA'&&originals.has(x.sourceId)));
assert.equal(graph.publicationContract.notNewSourceMining,true);
const doc=readFileSync('docs/research/PIUS-X-NEXT-20-PASTORAL-BILINGUAL-CONVERSATIONS-20261021.md','utf8');
assert(doc.includes('### 20. '));
assert(doc.includes('Four limited cases')||doc.includes('four limited cases'));
console.log('PASS SPX 20 pastoral conversations: 20 new chapter IDs, 40 inherited + 40 new Q&A, 80 new EN/FR answer versions, 4 source scope holds, 82/291 cumulative.');
