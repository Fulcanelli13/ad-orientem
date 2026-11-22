import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';

const dir='previews/pius-x-study/evidence/';
const data=JSON.parse(readFileSync(dir+'pius-x-outside12-wave5-bulk-inventory-228-20261024.v1.json','utf8'));
const discovery=JSON.parse(readFileSync(dir+'pius-x-next12-primary-document-discovery-20261023.v1.json','utf8'));
const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const owner=readCorpus(html);
assert.equal(data.schema,'AO_SPX_OUTSIDE12_WAVE5_BULK_SOURCE_ROUTING_V1');
assert.equal(data.status,'PRIVATE_NODE_ROUTING_ONLY_NO_NEW_EVIDENCE_GATE_ADMISSIONS');
assert.equal(owner.data.counts.chapters,106);
assert.equal(owner.data.counts.allNodes,423);
assert.equal(owner.data.approvals.publishing,false);
assert.equal(data.summary.outsideTwelveNodeIds,228);
assert.equal(data.summary.outsideTwelveDistinctSubjects,53);
assert.equal(data.summary.outsideTwelveSourceGroups,12);
assert.equal(data.summary.alreadyTriagedTwelveDocumentNodes,195);
assert.equal(data.summary.alreadyMappedOriginalLanguageResearchNodes,144);
assert.equal(data.summary.twelveDocumentHeldNodes,51);
for(const k of ['newVerifiedOriginalExcerpts','newModelEvidenceAdmissions','newAuthenticatedAnswers','newApprovedTranslations','newPublicationApprovals'])
 assert.equal(data.summary[k],0,k);
const originalIds=new Set(discovery.documents.flatMap(d=>d.chapters.flatMap(c=>c.nodeIds)));
assert.equal(originalIds.size,195);
const records=data.records;
assert.equal(records.length,228);
const unseen=new Set(records.map(r=>r.nodeId));
assert.equal(unseen.size,228);
assert([...unseen].every(id=>!originalIds.has(id)));
const actual=new Set(owner.data.chapters.flatMap(c=>c.nodes.map(n=>n.id)));
assert.equal(actual.size,423);
const all=new Set([...originalIds,...unseen]);
assert.equal(all.size,423);
assert.deepEqual([...all].sort(),[...actual].sort());
const familyExpected={
 PAPAL_DOCUMENTS:18,
 SALZANO_MANUSCRIPT:120,
 CATECHISMO_MAGGIORE_1905:59,
 BIOGRAPHICAL_SECONDARY:27,
 CONGREGATIONAL_DECREE:4
};
for(const [family,num] of Object.entries(familyExpected)){
 assert.equal(records.filter(r=>r.sourceFamily===family).length,num,family);
 assert.equal(data.familyRoutes[family].nodeCount,num,family);
 assert(data.familyRoutes[family].speakerPolicy.length>15);
}
for(const r of records){
 const c=owner.chapters.get(r.chapterId),n=c?.nodes.find(n=>n.id===r.nodeId);
 assert(n,'missing original P6 node: '+r.nodeId);
 assert.equal(n.q.en,r.questionEn,r.nodeId);
 assert.equal(n.q.fr,r.questionFr,r.nodeId);
 assert.equal(c.title.en,r.chapterTitleEn,r.nodeId);
 assert.equal(c.category,r.chapterCategory,r.nodeId);
 assert.equal(c.partial===true,r.ownerPartial,r.nodeId);
 assert.equal(n.source?.url||c.source.url,r.sourceUrl,r.nodeId);
 assert.equal(n.source?.locus||c.source.locus,r.sourceLocus,r.nodeId);
 assert.equal(c.source.url,r.originalChapterUrl,r.nodeId);
 assert.equal(r.evidenceStatus,'SOURCE_POINTER_CLASSIFIED_EXCERPT_NOT_COLLATED',r.nodeId);
 for(const k of ['originalLanguageSourceChecked','authorshipSpeakerApproved','completeAnswerApproved','translationApproved','modelGateEligible','publishingApproved'])
  assert.equal(r[k],false,r.nodeId+'/'+k);
 assert(!owner.sourceOnlyGate.get(r.chapterId)?.has(r.nodeId),'Uncollated node crossed source-only model gate: '+r.nodeId);
 assert(!('answer' in r)&&!('answerEn' in r)&&!('answerFr' in r),'Invented parallel answer: '+r.nodeId);
}
assert.equal(new Set(records.map(r=>r.chapterId)).size,53);
assert.equal(data.sourceGroups.length,12);
assert.equal(data.sourceGroups.reduce((n,g)=>n+g.nodeCount,0),228);
assert.equal(new Set(data.sourceGroups.flatMap(g=>g.chapterIds)).size,53);
assert.equal([...owner.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
console.log('PASS SPX_WAVE5_BULK_INVENTORY: 228 previously unresearched source-owner nodes classified across 12 source groups/5 authorship families; 144 existing bounded nodes unchanged; no new evidence admission or publication');
