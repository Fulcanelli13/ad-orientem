import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const path='data/learn/research/';
const menu=read(path+'pius-x-20path-bilingual-choice-navigation-20261020.v1.json');
const ledger=read(path+'pius-x-sacraments-100family-200turn-source-screen-20261020.v1.json');
const older=read(path+'pius-x-31family-62turn-italian-review-20261020.v1.json');
const latest=read(path+'pius-x-23more-46turn-italian-review-20261020.v1.json');
assert.equal(menu.schema,'AO_SPX_20_BRANCHING_BILINGUAL_DIALOGUE_MENUS_V1');
assert.equal(menu.chapters.length,20);
assert.equal(menu.questionNavigation.length,100);
assert.equal(menu.counts.topicTracks,50);
assert.equal(menu.counts.crossChapterResearchOptions,33);
assert.equal(menu.counts.originalDraftTurnRetentions,200);
assert.equal(menu.counts.certifiedPublication,0);
const questionIndex=new Map(ledger.records.map(r=>[r.openingQuestionId,r]));
const paths=new Map(menu.chapters.map(p=>[p.id,p]));
const visitedQ=new Set();
for(const p of menu.chapters){
 assert.equal(p.published,false);
 assert.equal(p.independentlyEditoriallyApproved,false);
 assert.equal(p.denzingerVisibility,'HIDE_UNTIL_CLAIM_AND_EDITION_VERIFIED');
 assert.equal(p.screenKind,'TOPIC_CHOICE_NOT_FIXED_QA_SEQUENCE');
 assert.ok(p.entryChoices.length>=2);
 const included=new Set(p.topicTracks.flatMap(t=>t.includedSourceQIDs));
 assert.deepEqual([...included].sort(),[...p.allSourceQuestionIds].sort(),p.id);
 for(const t of p.topicTracks){
  assert.ok(t.includedSourceQIDs.includes(t.rootQID));
  assert.equal(t.labelEN,questionIndex.get(t.rootQID)?.turns[0].questionEN);
  assert.equal(t.labelFR,questionIndex.get(t.rootQID)?.turns[0].questionFR);
 }
 for(const e of p.crossChapterOptions){
  assert.ok(paths.has(e.arcId));
  assert.ok(paths.get(e.arcId).allSourceQuestionIds.includes(e.sourceQuestionId));
  assert.equal(e.labelEN,questionIndex.get(e.sourceQuestionId)?.turns[0].questionEN);
  assert.equal(e.labelFR,questionIndex.get(e.sourceQuestionId)?.turns[0].questionFR);
 }
 for(const d of p.denzingerOriginalDocumentCandidates){
  assert.equal(d.verifiedOriginalPage,false);
  assert.equal(d.relationshipCertified,false);
 }
}
for(const node of menu.questionNavigation){
 assert.ok(!visitedQ.has(node.questionId));
 visitedQ.add(node.questionId);
 const expected=questionIndex.get(node.questionId);
 assert.ok(expected);
 assert.equal(node.questionEN,expected.turns[0].questionEN);
 assert.equal(node.questionFR,expected.turns[0].questionFR);
 assert.equal(node.answerSource.originalDraftFile,expected.originPath);
 assert.equal(node.answerSource.turnIndex,1);
 assert.ok(paths.get(node.owningArcId).allSourceQuestionIds.includes(node.questionId));
 assert.equal(node.neverAppendNextPrintedQuestionAutomatically,true);
 assert.equal(node.previouslyVisitedFilteringRequired,true);
 assert.equal(node.optionalChanoineTransfer.requiresExplicitConsent,true);
 assert.equal(node.optionalChanoineTransfer.sourceVerifiedReplyRequired,true);
 assert.equal(node.publicationApproved,false);
 const ids=node.menu.map(x=>x.sourceQuestionId);
 assert.equal(new Set(ids).size,ids.length);
 assert.ok(!ids.includes(node.questionId));
 for(const choice of node.menu){
  const destination=questionIndex.get(choice.sourceQuestionId);
  assert.ok(destination);
  assert.equal(choice.labelEN,destination.turns[0].questionEN);
  assert.equal(choice.labelFR,destination.turns[0].questionFR);
 }
}
assert.equal(visitedQ.size,100);
assert.equal(older.records.length,31);
assert.equal(latest.records.length,23);
const already=new Set(older.records.map(r=>r.openingQID));
for(const r of latest.records){
 assert.ok(!already.has(r.questionId));
 assert.equal(r.turns.length,2);
 const indexed=questionIndex.get(r.questionId);
 assert.ok(indexed);
 assert.equal(r.historicalSourceAttribution,'1905_PAPALLY_PRESCRIBED_CATECHISM_NOT_PERSONAL_PAPAL_WRITING');
 const source=read(r.originalDraftPath).records.find(x=>x.id===r.familyId);
 assert.ok(source);
 for(let i=0;i<2;i++){
  const t=r.turns[i],o=source.turns[i];
  assert.equal(t.draftAnswerEN,o.response.en);
  assert.equal(t.draftAnswerFR,o.response.fr);
  assert.deepEqual(t.declaredSourceQuestionIds,o.supports);
  assert.equal(t.originalPrintedEditionCollated,false);
  assert.equal(t.independentlySourceCertified,false);
  assert.equal(t.publicationAllowed,false);
 }
}
assert.equal(latest.totals.combinedDistinctFamilies,54);
assert.equal(latest.totals.combinedDraftTurnsInitiallyScreened,108);
assert.equal(latest.totals.newTurnSupportCorrections,1);
const flagged=latest.records.find(r=>r.questionId==='PX1905-Q632');
assert.deepEqual(flagged.turns[1].screenedSourceQuestionIds,['PX1905-Q628','PX1905-Q633']);
const last=read(path+'pius-x-46final-92turn-italian-review-20261020.v1.json');
assert.equal(last.schema,'AO_SPX_46_LAST_FAMILIES_92_TURNS_DIGITAL_ITALIAN_SCREEN_V1');
assert.equal(last.records.length,46);
assert.equal(last.counts.newTurns,92);
assert.equal(last.counts.newQIDSupportCorrections,3);
assert.equal(last.counts.combinedDistinctSourceQuestionsPreliminarilyScreened,100);
assert.equal(last.counts.combinedDraftTurnsPreliminarilyScreened,200);
assert.equal(last.counts.independentFullSentenceSourceCertifications,0);
assert.equal(last.counts.published,0);
const screenedQids = new Set([...older.records.map(x=>x.openingQID),...latest.records.map(x=>x.questionId)]);
for(const rec of last.records){
 assert.ok(!screenedQids.has(rec.questionId),rec.questionId);
 screenedQids.add(rec.questionId);
 assert.equal(rec.turns.length,2);
 assert.equal(rec.independentExpertApproval,false);
 const owner=read(rec.originalSourceFile).records.find(x=>x.id===rec.familyId);
 assert.ok(owner);
 for(let i=0;i<2;i++){
  const t=rec.turns[i],o=owner.turns[i];
  assert.deepEqual([t.questionEN,t.questionFR,t.draftAnswerEN,t.draftAnswerFR],[o.question.en,o.question.fr,o.response.en,o.response.fr]);
  assert.deepEqual(t.declaredSourceQuestionIds,o.supports);
  assert.ok(t.screenedSourceQuestionIds.length);
  assert.equal(t.sourceSentenceCertified,false);
  assert.equal(t.periodHistoricalVoiceApproved,false);
  assert.equal(t.denzingerClaimApproved,false);
  assert.equal(t.chanoineFollowupApproved,false);
  assert.equal(t.published,false);
 }
}
assert.equal(screenedQids.size,100);
const q652=last.records.find(r=>r.questionId==='PX1905-Q652');
assert.ok(q652.historicalOrEditorialFlags.some(s=>s.includes('CHANGE_OR_DESTRUCTION')));
console.log('SPX bilingual pathways and source-screen contract PASS: 20 chapters, 50 tracks, 100 nodes, 33 links; all 100 source-question families/200 turns preliminarily screened; 0 certified');
