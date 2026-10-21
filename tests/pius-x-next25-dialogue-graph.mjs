import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const base='data/learn/research/';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const partA=read(base+'pius-x-dialogue-authoring-next25-part-a-20261021.v1.json');
const partB=read(base+'pius-x-dialogue-authoring-next25-part-b-20261021.v1.json');
const graph=read(base+'pius-x-62chapter-dialogue-graph-20261021.v1.json');
const old=read(base+'pius-x-37chapter-dialogue-navigation-index-20261021.v1.json');
const originalIndex=read(base+'pius-x-batch2-production-index-20261019.v1.json');
const sourceParts=[
'pius-x-batch2-a1-20261019.v1.json','pius-x-batch2-a2-20261019.v1.json',
'pius-x-batch2-a3-20261019.v1.json'
].map(x=>read(base+x));
const original=new Map(sourceParts.flatMap(p=>p.records).map(x=>[x.id,x]));
const originalEvidence=new Map(originalIndex.entries.map(x=>[x.id,x]));
const next=[...partA.records,...partB.records];
assert.equal(partA.counts.chapters,13);
assert.equal(partB.counts.chapters,12);
assert.equal(next.length,25);
assert.equal(graph.chapters.length,25);
assert.equal(old.counts.combinedChapters,37);
assert.equal(graph.counts.totalGraphChapterCount,62);
assert.equal(graph.counts.previousQATurns,111);
assert.equal(graph.counts.newReferencesToExistingQATurns,50);
assert.equal(graph.counts.newAuthoredQATurns,50);
assert.equal(graph.counts.newQATurns,100);
assert.equal(graph.counts.totalGraphQATurns,211);
assert.equal(graph.counts.newBilingualAnswerVersions,100);
assert.equal(graph.counts.fullyIndependentlyApproved,0);
assert.equal(graph.counts.published,0);
assert.equal(graph.nonCurrentUI,true);
const priorIDs=new Set([...old.priorChapterIds,...old.newChapters.map(x=>x.id)]);
assert.equal(priorIDs.size,37);
assert.deepEqual(new Set(graph.priorChapterIds),priorIDs);
const sourceOwners=new Set([
base+'pius-x-batch2-a1-20261019.v1.json',
base+'pius-x-batch2-a2-20261019.v1.json',
base+'pius-x-batch2-a3-20261019.v1.json'
]);
const allIDs=new Set([...priorIDs]);
const dialogueTurnIDs=new Set();
for(const row of next){
assert(!priorIDs.has(row.id),'duplicate root across old and new');
assert(!allIDs.has(row.id),'duplicate new root');
allIDs.add(row.id);
const prev=original.get(row.id),src=originalEvidence.get(row.id);
assert(prev && src,'original content & evidence retained');
assert.equal(row.originalDraftId,row.id);
assert(sourceOwners.has(row.originalDraftPath));
assert.equal(row.source.url,src.source.url);
assert.equal(row.source.locus,src.source.locus);
assert.equal(row.source.evidenceTier,'DIRECT_PASSAGE_ANCHOR');
assert.equal(row.originalOpeningQuestion.en,prev.opening.question.en);
assert.equal(row.originalOpeningQuestion.fr,prev.opening.question.fr);
assert.equal(row.originalFirstFollowupQuestion.en,prev.followup.question.en);
assert.equal(row.originalFirstFollowupQuestion.fr,prev.followup.question.fr);
assert.equal(row.openingAndFirstFollowup.count,2);
assert.equal(row.openingAndFirstFollowup.mode,'RESOLVE_FROM_EXISTING_BATCH2_CONTENT_OWNER');
assert.equal(row.newFollowupChoices.length,2);
const chapter=graph.chapters.find(x=>x.id===row.id);
assert(chapter,'chapter indexed');
assert.equal(chapter.nodeRefs.length,4);
assert.equal(chapter.onOpeningChoiceIds.length,3);
assert.equal(chapter.nodeRefs[0].lookup.field,'opening');
assert.equal(chapter.nodeRefs[1].lookup.field,'followup');
assert.equal(chapter.nodeRefs[0].lookup.file,row.originalDraftPath);
assert.equal(chapter.nodeRefs[1].lookup.file,row.originalDraftPath);
assert.equal(chapter.researchSource.url,src.source.url);
assert.equal(chapter.researchSource.locus,src.source.locus);
assert.equal(chapter.handoff.optInOnly,true);
assert.equal(chapter.handoff.noCoverage,'DO_NOT_FABRICATE_HISTORICAL_REPLY');
assert.equal(chapter.denzinger.display,false);
assert.equal(chapter.denzinger.verifiedCitationAvailable,false);
assert.equal(chapter.denzinger.allowOnlyAfterClaimAndEditionVerification,true);
assert.equal(chapter.speakerClass,'PAPALLY_APPROVED_CATECHISM_EDUCATIONAL_RECONSTRUCTION');
assert.equal(chapter.visibility.production,false);
assert.equal(chapter.visibility.sourcePanel,'AVAILABLE_ON_EVERY_TURN');
const nodeIDs=new Set(chapter.nodeRefs.map(x=>x.id));
assert.equal(nodeIDs.size,4);
for(const node of chapter.nodeRefs){
assert(!dialogueTurnIDs.has(node.id),'turn id collision');
dialogueTurnIDs.add(node.id);
}
assert(chapter.onOpeningChoiceIds.every(x=>nodeIDs.has(x)));
for(let i=0;i<row.newFollowupChoices.length;i++){
const choice=row.newFollowupChoices[i],g=chapter.nodeRefs[i+2];
assert.equal(g.id,choice.id);
assert.equal(g.queryEn,choice.q.en);
assert.equal(g.queryFr,choice.q.fr);
assert.equal(g.lookup.followupIndex,i);
assert.equal(g.lookup.recordId,row.id);
for(const locale of ['en','fr']){
assert(choice.q[locale].length>14);
assert(choice.a[locale].length>60,'substantive localized answer');
}
assert.equal(choice.state,'UNAPPROVED_HISTORICALLY_BOUNDED_EDITORIAL_RECONSTRUCTION');
}
for(const linked of chapter.relatedChapters){
if(linked.status==='IN_62_AUTHORING_LIBRARY')assert(allIDs.has(linked.id)||priorIDs.has(linked.id)||next.some(r=>r.id===linked.id),'linked known chapter');
else assert.equal(linked.status,'EXTERNAL_OR_CROSS_OWNER_REQUIRE_ROUTER_ELIGIBILITY');
}
}
assert.equal(allIDs.size,62);
assert.equal(dialogueTurnIDs.size,100);
assert.equal(graph.overlapCandidatesNotMerged.length,4);
assert.deepEqual(graph.overlapCandidatesNotMerged.map(x=>x.id).sort(),['SPX-002','SPX-003','SPX-044','SPX-052']);
assert(graph.overlapCandidatesNotMerged.every(x=>x.originalStillPreserved && x.approved===false && original.has(x.id)));
assert.equal(graph.chapters.every(x=>x.denzinger.display===false && x.visibility.production===false),true);
const readme=readFileSync('docs/research/PIUS-X-25-FURTHER-BILINGUAL-DIALOGUES-20261021.md','utf8');
assert(readme.includes('### 25. '));
assert(readme.includes('## Four questions retained'));
console.log('St Pius X 25-chapter dialogues PASS: 25 chapter IDs, 100 Q&A nodes, 50 inherited turns, 50 new follow-ups, 100 EN/FR new answer drafts, no release approvals.');
