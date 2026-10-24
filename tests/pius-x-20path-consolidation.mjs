import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = p => JSON.parse(readFileSync(p,'utf8'));
const base='data/learn/research/';
const paths=read(base+'pius-x-100questions-20-conversation-paths-20261020.v1.json');
const ledger=read(base+'pius-x-sacraments-100family-200turn-source-screen-20261020.v1.json');
const reviewed=read(base+'pius-x-31family-62turn-italian-review-20261020.v1.json');

assert.equal(paths.schema,'AO_SPX_100_QUESTIONS_20_PATH_CONSOLIDATION_PROPOSAL_V1');
assert.equal(paths.themePaths.length,20);
assert.equal(paths.questionNodes.length,100);
assert.equal(paths.preservedPrintedOrderFollowupEdges.length,99);
assert.equal(paths.counts.samePathFollowupReuse,80);
assert.equal(paths.counts.crossPathFollowupReuse,19);
assert.equal(paths.counts.newApprovedMerges,0);
assert.equal(paths.counts.publishedAnswerTurns,0);
assert.equal(paths.state,'RESEARCH_ONLY_PRESERVES_ALL_ORIGINAL_QUESTION_AND_ANSWER_DRAFTS');

const familyIndex=new Map(ledger.records.map(r=>[r.familyId,r]));
const ownership=new Map();
for(const arc of paths.themePaths){
  assert.equal(arc.independentlyApproved,false);
  assert.equal(arc.published,false);
  assert.equal(arc.chanoine.requiresConsent,true);
  assert.equal(arc.chanoine.existingAnswerVerified,false);
  assert.equal(arc.denzinger.applicability,'REVIEW_REQUIRED');
  assert.ok(arc.accessibleEntryPrompts.length>=2);
  const block=arc.sourceQIDs;
  assert.equal(block.length,arc.lastIndex-arc.firstIndex+1);
  for(let i=0;i<block.length;i++){
    const q='PX1905-Q'+(arc.firstIndex+i);
    assert.equal(block[i],q);
    assert.ok(!ownership.has(q),'Duplicate original source QID: '+q);
    ownership.set(q,arc.id);
  }
  for(const entry of arc.accessibleEntryPrompts){
    assert.ok(block.includes(entry.sourceQID));
    assert.ok(entry.questionEN&&entry.questionFR);
  }
  for(const d of arc.denzinger.sourcePassageCandidates){
    assert.equal(d.verifiedOriginalPage,false);
    assert.equal(d.relationshipCertified,false);
    assert.ok(Number.isInteger(d.oldDz));
  }
}
assert.equal(ownership.size,100);
for(const node of paths.questionNodes){
 const source=familyIndex.get(node.id);
 assert.ok(source,node.id);
 assert.equal(node.sourceQID,source.openingQuestionId);
 assert.equal(node.originalDraftPath,source.originPath);
 assert.equal(node.openingQuestionEN,source.turns[0].questionEN);
 assert.equal(node.openingQuestionFR,source.turns[0].questionFR);
 assert.equal(ownership.get(node.sourceQID),node.arcId);
 assert.equal(node.autoAppendOriginalFollowup,false);
 assert.equal(node.originalSecondTurnPreservedAtSource,true);
 assert.equal(node.publication,false);
}
for(const edge of paths.preservedPrintedOrderFollowupEdges){
 const src=familyIndex.get(edge.from);
 const dst=familyIndex.get(edge.to);
 assert.ok(src&&dst);
 assert.ok(src.turns[1].declaredSourceQuestionIds.includes(edge.sourceQuestion));
 assert.equal(dst.openingQuestionId,edge.sourceQuestion);
 assert.equal(edge.notAutomaticDisplay,true);
 const expected=ownership.get(src.openingQuestionId)===ownership.get(dst.openingQuestionId)
 ? 'WITHIN_PATH_SOURCE_CONTINUATION' : 'CROSS_PATH_EDITORIALLY_MEDIATED_TRANSITION';
 assert.equal(edge.relation,expected);
}
assert.equal(reviewed.schema,'AO_SPX_DIGITAL_ITALIAN_31FAMILY_62TURN_INITIAL_READ_V1');
assert.equal(reviewed.records.length,31);
assert.equal(reviewed.counts.turnsReadAgainstItalianDigitalWitness,62);
assert.equal(reviewed.counts.multiQuestionSupportCorrections,5);
assert.equal(reviewed.counts.flaggedFamilies,19);
assert.equal(reviewed.counts.published,0);
for(const rec of reviewed.records){
 const indexed=familyIndex.get(rec.draftFamilyId);
 assert.ok(indexed,rec.draftFamilyId);
 assert.equal(rec.turns.length,2);
 assert.equal(rec.independentTheologyReview,false);
 assert.equal(rec.original1905PrintFacsimileChecked,false);
 for(let i=0;i<2;i++){
  const turn=rec.turns[i],original=indexed.turns[i];
  assert.equal(turn.originalQuestionEN,original.questionEN);
  assert.equal(turn.originalQuestionFR,original.questionFR);
  assert.deepEqual(turn.declaredSupportQIDs,original.declaredSourceQuestionIds);
  assert.ok(turn.inspectedSupportQIDs.length>0);
  assert.ok(turn.inspectedSupportQIDs.every(q=>/^PX1905-Q[0-9]+$/.test(q)));
  assert.equal(turn.sourcePrintVerified,false);
  assert.equal(turn.denzingerEntryApproved,false);
  assert.equal(turn.chanoineReplyApproved,false);
  assert.equal(turn.publicationApproved,false);
 }
}
const q607=reviewed.records.find(r=>r.openingQID==='PX1905-Q607');
assert.deepEqual(q607.turns[0].inspectedSupportQIDs,['PX1905-Q596','PX1905-Q607','PX1905-Q609','PX1905-Q610']);
const q633=reviewed.records.find(r=>r.openingQID==='PX1905-Q633');
assert.deepEqual(q633.turns[0].inspectedSupportQIDs,['PX1905-Q628','PX1905-Q633']);
console.log('SPX structural consolidation PASS: 20 paths, 100 source questions, 99 preserved links, 31/62 preliminary Italian reviews, 0 certifications');
