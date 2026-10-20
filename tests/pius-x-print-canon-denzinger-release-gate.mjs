import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const pre='data/learn/research/';
const read=p=>JSON.parse(readFileSync(pre+p,'utf8'));
const original=read('pius-x-original-1905-print-page-ten-corrections-20261020.v1.json');
const source=read('pius-x-source-bounded-bilingual-corrections-20261020.v1.json');
const evidence=read('pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json');
const canon=read('pius-x-chanoine-22-answer-aq04-aq05-eligibility-20261020.v1.json');
const dz=read('pius-x-eight-old-dz-number-print-facsimile-queue-20261020.v1.json');
assert.equal(original.records.length,10);
assert.equal(original.counts.photographicPrintPagesVisuallyRead,6);
assert.equal(original.counts.sourceQNumberOriginallyPrinted,false);
assert.equal(original.sourceEdition.originalPrintQuestionStyle,'UNNUMBERED_D_R_QUESTION_AND_ANSWER');
const photographPages=new Set([204,206,213,214,215,216]);
const revisionIndex=new Map(source.records.map(r=>[r.turnId,r]));
const sourceIndex=new Map(evidence.answerEvidence.map(r=>[r.answerTurnId,r]));
for(const r of original.records){
 assert.equal(r.notOriginalQuestionNumber,true);
 const orig=revisionIndex.get(r.turnId);
 assert.ok(orig,r.turnId);
 assert.equal(orig.published,false);
 assert.deepEqual(r.originalEditionEvidence.map(x=>x.editorialQuestionLocator),orig.sourceQuestionIds);
 for(const q of r.originalEditionEvidence){
  assert.equal(q.originalEditionPrintedQuestionNumber,null);
  for(const p of q.printedPageRefs){
   assert.equal(p.pageImageIndex,p.printedPage+12);
   assert.equal(p.humanVisualPageInspection,photographPages.has(p.printedPage));
   assert.equal(p.originalPrintedQuestionNumber,undefined);
   assert.equal(p.sourcePageUrl,
    'https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/'+p.pageImageIndex);
  }
 }
}
assert.equal(evidence.answerEvidence.length,200);
assert.equal(evidence.editionEvidenceCorrection.status,'ADDED_2026_10_20_ORIGINAL_PRINT_1905_UNNUMBERED');
for(const answer of evidence.answerEvidence){
 assert.equal(answer.originalSource.numberingProvenance.originallyPrintedQuestionNumber,false);
 assert.equal(answer.originalSource.numberingProvenance.showOriginalPrintedQNumberInCitation,false);
 assert.equal(answer.originalSource.numberingProvenance.editorialQIDShouldShowAsLocatorOnly,true);
 assert.equal(answer.approvedAnswer,false);
}
assert.equal(canon.records.length,22);
assert.equal(canon.counts.byStatus.MATCHED_NARROW_CONTENT_SUBJECT,10);
assert.equal(canon.counts.byStatus.PARTIAL_RELEVANT_BUT_NOT_EXACT,5);
assert.equal(canon.counts.byStatus.BLOCK_DOES_NOT_ANSWER_THE_SPECIFIC_QUESTION,6);
assert.equal(canon.counts.byStatus.BLOCK_UNRELATED_TRANSITION,1);
assert.equal(canon.counts.routerHandoffApproved,0);
assert.equal(canon.counts.canonAvatarResponseApproved,0);
const keys=new Set();
for(const ref of canon.records){
 assert.ok(!keys.has(ref.answerTurnId)); keys.add(ref.answerTurnId);
 const answer=sourceIndex.get(ref.answerTurnId);
 assert.ok(answer,ref.answerTurnId);
 assert.equal(answer.chanoine.sourceExtractivePilotOwnerCandidate,ref.availableOwnerAnswerId);
 assert.equal(answer.chanoine.sharedRouterTopicCandidate,ref.topicInSharedRouter);
 assert.equal(ref.routerCoverage,'SOURCE_GAP');
 assert.equal(ref.routerApprovedReply,false);
 assert.equal(ref.handoffTransport.currentRuntimeWired,false);
 assert.equal(ref.releaseApproved,false);
}
assert.equal(dz.records.length,8);
assert.equal(dz.count.distinctNamedOldDzEntries,8);
assert.equal(dz.count.individualLinkOccurrences,45);
assert.equal(dz.count.answerTurnsWithOldDzLeads,42);
assert.equal(dz.count.facsimileCertifiedEntries,0);
assert.equal(dz.count.modernDSDHCertifiedEntries,0);
for(const item of dz.records){
 assert.equal(item.photographedPageInspected,false);
 assert.equal(item.publicCitationAllowed,false);
 assert.equal(item.oldDzNumberCertifiedFromPhoto,false);
 assert.ok(item.citedByTurnIds.every(id=>sourceIndex.has(id)));
}
// The *real* separate Apostolate source-owner code is pinned and staged by the CI,
// rather than recreating fictional Chanoine response bodies in this research PR.
const base='../research-out/pr1402-spx-owner/src/';
const {APOSTOLATE_AQ_SCENARIOS}=await import(base+'apostolate/corpus.js');
const {readAskChurchDigest}=await import(base+'learn/ask-church-source-digest.js');
for(const id of ['AQ04','AQ05']){
 const owned=APOSTOLATE_AQ_SCENARIOS.find(x=>x.id===id);
 assert.ok(owned,'missing upstream '+id);
 assert.equal(owned.publication,'READY');
 assert.ok(owned.text.en&&owned.text.fr);
 assert.ok(owned.sourceIds.some(x=>x.startsWith('TRENT-')));
 for(const lang of ['en','fr']){
  const out=await readAskChurchDigest({id:'apostolate:'+id},{lang});
  assert.equal(out.sourceStatus,'READY_IN_RUNTIME_SOT');
  assert.equal(out.owner,'Apostolate');
  assert.ok(out.text);
  assert.ok(out.sources.some(x=>/Trent/.test(x.label)));
 }
}
console.log('PASS: SPX 1905 source IDs are editorial, 10 print-page corrections, 22 Canon cases source-matched, 8 uncertified old Dz entries; AQ04/AQ05 source-owner digest verified, 0 character handoffs published');
