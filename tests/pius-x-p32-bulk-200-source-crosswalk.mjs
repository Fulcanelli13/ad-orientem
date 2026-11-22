import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root='artifacts/pius-x-study-expanded/';
const research='data/learn/research/';
const report=JSON.parse(readFileSync(root+'SPX_P32_Bulk200_Source_Question_Crosswalk.json','utf8'));
const baseline=JSON.parse(readFileSync(root+'SPX_P31_Readonly_Question_Reconciliation.json','utf8'));
const cross=JSON.parse(readFileSync(research+'pius-x-sacraments-339-topical-overlap-crosswalk-20261020.v2.json','utf8'));
const upstream=JSON.parse(readFileSync(research+'pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json','utf8'));
const triage=JSON.parse(readFileSync(research+'pius-x-100answer-editorial-release-triage-20261020.v1.json','utf8'));
assert.equal(report.schema,'AO_SPX_P32_P1_BULK200_ORIGINAL_SOURCE_TURN_RECONCILIATION_V1');
assert.equal(report.status,'PRIVATE_RESEARCH_ONLY_NO_GENERATED_ANSWERS');
assert.equal(report.counts.turns,200);
assert.equal(report.counts.families,100);
assert.equal(report.counts.distinctOriginal1905EditorialQuestionAnchors,101);
assert.equal(report.counts.originalOwnerFiles,10);
assert.equal(report.counts.historicalSensitivityHolds,74);
assert.equal(report.counts.magisteriumCandidateTurns,48);
assert.equal(report.counts.magisteriumApplicabilityNotAssessed,152);
assert.equal(report.counts.openingTurnsWithUpstreamReleaseTriage,100);
assert.equal(report.counts.originalTextClaimCertifications,0);
assert.equal(report.counts.bilingualTranslationsApproved,0);
assert.equal(report.counts.answersApproved,0);
assert.equal(report.counts.automaticSemanticMerges,0);
assert.equal(report.counts.publishedTurns,0);
assert.equal(report.safeguards.directP6AnswerTextCopied,0);
assert.equal(report.safeguards.upstream200AnswerTextCopied,0);
assert.equal(report.safeguards.original1905EditorNumbersNeverRepresentedAsPrinted,true);
assert.equal(report.safeguards.noMagisteriumCrossReferenceTreatedAsApproved,true);
assert.equal(report.crosswalkOwners.ownerPR,1458);
assert.equal(report.crosswalkOwners.ownerHeadSHA,'188f563288d381056df23e19ae30619f53efd088');
assert.equal(report.originalP6.sourceOwnerPreserved,true);
assert.equal(report.originalP6.questions,423);
assert.equal(report.turns.length,200);
assert.equal(upstream.answerEvidence.length,200);
assert.equal(cross.sourceQuestionCrosswalk.length,339);
assert.equal(triage.records.length,100);
const owned=new Map(baseline.rows.map(x=>[x.nodeId,x]));
const upstreamRows=new Map(upstream.answerEvidence.map(x=>[x.answerTurnId,x]));
const knownCross=new Set(cross.sourceQuestionCrosswalk.map(x=>x.questionId));
const triageRows=new Map(triage.records.map(x=>[x.turnId,x]));
const seen=new Set(),families=new Set(),qids=new Set();
let overlap=0,prior=0,lexicalOnly=0,noExisting=0,sensitivity=0;
for(const row of report.turns){
 assert(!seen.has(row.turnId));seen.add(row.turnId);families.add(row.familyId);
 const original=upstreamRows.get(row.turnId);
 assert(original,'Every row must resolve to one exact upstream turn');
 assert.equal(row.familyId,original.familyId);
 assert.equal(row.turnIndex,original.turnIndex);
 assert.deepEqual(row.question,{en:original.questionEN,fr:original.questionFR});
 assert.deepEqual(row.source1905QuestionIds,[...new Set(original.originalSource.originalQuestionIds)]);
 assert.equal(row.originalOwnerPath,original.originalAnswerOwner.path);
 assert.equal(row.sourceWitnessUrl,original.originalSource.sourceWitnessUrl);
 assert.equal(row.legacyAnswerTextIncluded,false);
 assert.equal(row.release.originalAnswerApproved,false);
 assert.equal(row.release.originalItalianFacsimileCollated,false);
 assert.equal(row.release.bilingualApproved,false);
 assert.equal(row.release.doctrinalApproved,false);
 assert.equal(row.release.periodVoiceApproved,false);
 assert.equal(row.release.mergedIntoP6,false);
 assert.equal(row.release.published,false);
 assert.equal(row.historicallySensitive,!!original.historicallySensitive);
 sensitivity+=+row.historicallySensitive;
 if(row.turnIndex===1){
  const release=triageRows.get(row.turnId);assert(release);
  assert.equal(row.triageLane,release.lane);
  assert.deepEqual(row.triageReasons,release.reviewReasons);
 }else assert.equal(row.triageLane,'FOLLOWUP_UNASSESED_BY_100_OPENING_TRIAGE');
 for(const q of row.source1905QuestionIds){assert(knownCross.has(q));qids.add(q);}
 for(const lead of row.originalP6SourceLocatorLeads){
  const node=owned.get(lead.nodeId);assert(node);
  assert.equal(node.chapterId,lead.chapterId);
  assert.equal(lead.relation,'SAME_EDITORIAL_SOURCE_LOCATOR_NOT_SAME_VISITOR_INTENT');
  assert.equal(lead.claimApproved,false);assert.equal(lead.mergeApproved,false);
  for(const q of lead.cited1905QuestionIds){
   assert(row.source1905QuestionIds.includes(q));
   assert(node.original1905EditorialLocusQids.includes('1905-EDITORIAL-Q'+q.split('-Q')[1]));
  }
 }
 for(const lead of row.upstreamEarlierPilotLinks){
  assert.equal(lead.registeredAs,'UPSTREAM_PRIOR_TOPICAL_SEED_NOT_EQUIVALENT_QA');
  assert.equal(lead.mergeApproved,false);
 }
 for(const lead of row.originalP6LexicalReviewLeads){
  assert(owned.has(lead.nodeId));
  assert.equal(lead.status,'LEXICAL_REVIEW_LEAD_ONLY_NOT_SEMANTIC_DUPLICATE');
  assert.equal(lead.mergeApproved,false);
  assert(lead.sharedTokens.length>=2);
 }
 if(row.originalP6SourceLocatorLeads.length)overlap++;
 if(row.upstreamEarlierPilotLinks.length)prior++;
 if(!row.originalP6SourceLocatorLeads.length&&!row.upstreamEarlierPilotLinks.length&&row.originalP6LexicalReviewLeads.length)lexicalOnly++;
 if(!row.originalP6SourceLocatorLeads.length&&!row.upstreamEarlierPilotLinks.length&&!row.originalP6LexicalReviewLeads.length)noExisting++;
 assert(!('answer' in row)&&!('reply' in row)&&!('originalDraftEN' in row)&&!('originalDraftFR' in row));
}
assert.equal(seen.size,200);
assert.equal(families.size,100);
assert.equal(qids.size,101);
assert.equal(sensitivity,74);
assert.equal(overlap,report.counts.turnsWithExactSourceLocatorIntersection);
assert.equal(prior,report.counts.turnsWithUpstreamPriorPilotLink);
assert.equal(lexicalOnly,report.counts.turnsWithLexicalSuggestionsOnly);
assert.equal(noExisting,report.counts.turnsWithoutP6Candidate);
assert.equal(report.sourceQuestionReuse.filter(x=>x.mergeApproved!==false).length,0);
assert.equal(report.sourceQuestionReuse.length,report.counts.reusedSourceQuestionLocators);
console.log('PASS SPX_P32_BULK200_INTEGRITY '+JSON.stringify({turns:200,sourceQids:101,families:100,
 exactLocatorOverlap:overlap,upstreamPriorPilotLinks:prior,
 lexicalOnly,noExisting,historicallySensitive:74,approvedMerges:0,
 copiedAnswers:0,published:0}));
