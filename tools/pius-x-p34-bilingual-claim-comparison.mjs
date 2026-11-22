/** P1.34 source-first bilingual claim comparison packet. Source-candidates are NOT verified entailments. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const dir='artifacts/pius-x-study-expanded/';
const upstream=JSON.parse(readFileSync('data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json','utf8'));
const italian=JSON.parse(readFileSync(dir+'SPX_P33_OriginalItalian_100_Opening_Audit.json','utf8'));
const cross=JSON.parse(readFileSync(dir+'SPX_P32_Bulk200_Source_Question_Crosswalk.json','utf8'));
assert.equal(italian.schema,'AO_SPX_P33_ORIGINAL_ITALIAN_100_OPENING_WITNESS_AUDIT_V1');
assert.equal(italian.records.length,100);assert.equal(upstream.records.length,100);
assert.equal(cross.turns.length,200);
const drafts=new Map(upstream.records.map(x=>[x.turnId,x]));
assert.equal(drafts.size,100);
const clauses=text=>text.trim().split(/(?<=[.!?])\s+(?=[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŒ])/u).filter(Boolean);
const flags=[
 ['CURRENT_DISCIPLINE',/\b(today|current(?:ly)?|contemporary|modern|in force|subsequently changed)\b/i],
 ['EDITORIAL_HISTORICAL_CONTEXT',/\b(historical|then required|period-specific|1905|under its historical discipline|at the time|old matrimonial)\b/i],
 ['INDIVIDUAL_PASTORAL_JUDGMENT',/\b(individual|actual case|particular person|confessor|personal|pastoral guidance|pastoral judgment|conscience|culpabilit|guilt)\b/i],
 ['UNIVERSAL_CLAIM_SCOPE',/\b(always|never|every|universal|universally|must|ought|necessary|necessarily)\b/i]
];
const flagSentence=text=>flags.filter(x=>x[1].test(text)).map(x=>x[0]);
const rows=[],countsByLane={},priorities={};
let unitCount=0,englishFrenchCountMismatch=0,sourceExtraCount=0,
 currentDisciplineCaseCount=0,editorialHistoricalCaseCount=0;
for(const source of italian.records){
 const d=drafts.get(source.turnId);
 assert(d&&d.id===source.sourceQid,'Editorial owner must match source QID');
 assert.equal(d.published,false);
 assert(d.approval&&Object.values(d.approval).every(x=>x==='NOT_SIGNED_OFF'));
 assert.equal(d.lane,source.triageLane);
 assert.deepEqual(d.reviewReasons,source.triageReasons);
 assert(d.originalDraftEN&&d.originalDraftFR);
 const supporting=[{
  qid:source.sourceQid,italianQuestion:source.italianQuestionFromWitness,
  italianAnswer:source.italianAnswerFromWitness,originalAnswerSha256:source.witnessAnswerFingerprintSha256
 },...source.supplementarySourceWitnesses.map(s=>({
  qid:s.sourceQid,italianQuestion:s.italianQuestion,italianAnswer:s.italianAnswer,
  originalAnswerSha256:s.answerFingerprintSha256
 }))];
 assert.deepEqual(supporting.map(x=>x.qid),[
  source.sourceQid,...source.allOriginalSourceQuestionIds.filter(x=>x!==source.sourceQid)
 ]);
 sourceExtraCount+=supporting.length-1;
 const en=clauses(d.originalDraftEN),fr=clauses(d.originalDraftFR);
 assert(en.length&&fr.length);
 if(en.length!==fr.length)englishFrenchCountMismatch++;
 const pairs=Array.from({length:Math.max(en.length,fr.length)},(_,i)=>{
  const wordingEN=en[i]||null,wordingFR=fr[i]||null;
  const warnings=[...new Set(flagSentence(wordingEN||'').concat(flagSentence(wordingFR||'')))];
  return {unitId:source.turnId+'-S'+String(i+1).padStart(2,'0'),ordinal:i+1,
   englishEditorialText:wordingEN,frenchEditorialText:wordingFR,
   possibleOriginalQuestionIds:supporting.map(s=>s.qid),
   machineFlags:warnings,
   sentenceAlignment:'POSITION_ONLY_NOT_VERIFIED_TRANSLATION_EQUIVALENCE',
   sourceClaimAssessment:'NOT_REVIEWED_ITALIAN_PASSAGES_ARE_CANDIDATE_EVIDENCE',
   humanSourceApproval:false,translationApproval:false,doctrinalApproval:false,
   papalVoiceApproval:false};
 });
 unitCount+=pairs.length;
 const discipline=pairs.some(p=>p.machineFlags.includes('CURRENT_DISCIPLINE'));
 const historical=pairs.some(p=>p.machineFlags.includes('EDITORIAL_HISTORICAL_CONTEXT'));
 if(discipline)currentDisciplineCaseCount++;
 if(historical)editorialHistoricalCaseCount++;
 const holds=[
  ...(source.historicalPastoralHold?['HISTORICAL_PASTORAL_HOLD']:[]),
  ...(source.multiSourceEditorialAnswerHold?['COMPOSITE_SOURCE_ARGUMENT']:[]),
  ...(source.ownerQuestionIdentityStatus!=='QUESTION_TRANSCRIPTION_NORMALIZED_EXACT'?['ITALIAN_QUESTION_TRANSCRIPTION_VARIANT']:[]),
  ...(discipline?['CURRENT_LAW_CAVEAT_MAY_BE_OUT_OF_CHARACTER']:[]),
  ...(historical?['EDITORIAL_PERIOD_CONTEXT_MAY_BE_OUT_OF_CHARACTER']:[]),
  ...(en.length!==fr.length?['EN_FR_SENTENCE_COUNT_DIFFERS']:[])
 ];
 const priority=source.historicalPastoralHold||source.multiSourceEditorialAnswerHold?
  'P0_HISTORICAL_OR_COMPOSITE':holds.length?'P1_SCOPE_OR_TEXT_VARIANT':'P2_STANDARD_REVIEW';
 priorities[priority]=(priorities[priority]||0)+1;
 countsByLane[d.lane]=(countsByLane[d.lane]||0)+1;
 rows.push({
  turnId:source.turnId,sourceQid:source.sourceQid,sourceOwner:source.sourceOwner,
  question:{en:d.questionEN,fr:d.questionFR,italian:source.italianQuestionFromWitness,
    italianTranscriptionVariant:source.italianQuestionFromOwner!==source.italianQuestionFromWitness},
  italianSourceWitnesses:supporting,sourceUrl:source.sourceUrl,
  enDraft:d.originalDraftEN,frDraft:d.originalDraftFR,
  clauses:pairs,reviewPriority:priority,reviewFlags:holds,
  originalSourceQuestionStatus:source.ownerQuestionIdentityStatus,
  triageLane:d.lane,triageReasons:d.reviewReasons,
  original1905PrintedQuestionNumber:false,
  originalTextDoesNotVerifyTranslatedClaim:true,
  papalAutographSpeechCertified:false,
  allHumanApprovals:false,
  publicationApproved:false
 });
}
assert.equal(rows.length,100);
assert.equal(sourceExtraCount,9);
assert.equal(italian.counts.multipleSourceReferenceOpeningHolds,7);
assert.equal(italian.counts.questionIdentityMismatchesOrHolds,5);
assert.equal(countsByLane.HISTORICAL_PASTORAL_HOLD,30);
assert.equal(countsByLane.SOURCE_TRANSLATION_REVIEW,57);
assert.equal(countsByLane.PRECISION_REWRITE_REVIEW,13);
const report={
 schema:'AO_SPX_P34_ITALIAN_EN_FR_CLAIM_REVIEW_PACKET_V1',date:'2026-10-24',
 status:'SOURCE_CLAIM_COMPARISON_PREPARED_BUT_NO_HUMAN_CLAIM_CERTIFICATION',
 sourceLineage:{italian:'P33_100_DIGITAL_ITALIAN_QA',
  editorial:'PR1458_100_OPENING_BILINGUAL_DRAFT_TRIAGE',crosswalk:'P32_BULK200',
  museumDigitalNot1905PrintFacsimile:true,originalNumbersAreEditorial:true},
 warnings:[
  'Italian original snippets have been retrieved but English/French claims are not independently checked.',
  'Machine flags are lexical review signals, not doctrinal or translation judgments.',
  'English/French sentence alignment is merely positional.',
  'Historical discipline and editorial safety warnings must not be attributed as original Pius X words.',
  'The 1905 Catechism was papally prescribed; personal authorship is not established.'
 ],
 counts:{
  openingCases:100,originalItalianPrimaryAnswers:100,additionalItalianSourceAnswers:sourceExtraCount,
  casesWithMultipleSourceQas:7,italianTranscriptionVariantCases:5,
  historicalPastoralCases:30,sourceTranslationLaneCases:57,precisionRewriteLaneCases:13,
  bilingualReviewUnits:unitCount,enFrSentenceCountDifferenceCases:englishFrenchCountMismatch,
  casesWithCurrentDisciplineWording:currentDisciplineCaseCount,
  casesWithPeriodEditorialWording:editorialHistoricalCaseCount,
  independentlySourceCertifiedClaims:0,certifiedEnglishFrenchTranslations:0,
  acceptedPapalVoiceTurns:0,publishedTurns:0
 },reviewPriorityCounts:priorities,reviewLaneCounts:countsByLane,records:rows,
 approvals:{machineCertifiedSourceClaims:0,humanApprovals:0,doctrinalApprovals:0,publicationApprovals:0}
};
const out=process.env.AO_SPX_P34_OUTPUT||dir+'SPX_P34_Italian_EN_FR_100_Claim_Review.json';
mkdirSync(dirname(resolve(out)),{recursive:true});
writeFileSync(out,JSON.stringify(report,null,2)+'\n');
const htmlTemplate=readFileSync('previews/pius-x-study/spx-p34-claim-review-template.html','utf8');
assert(htmlTemplate.includes('__DOCUMENTARY_REVIEW_DATA__'));
const safeData=JSON.stringify(report).replace(/</g,'\\u003c');
const html=htmlTemplate.replace('__DOCUMENTARY_REVIEW_DATA__',safeData);
const htmlOut=dir+'SPX_P34_Bilingual_Original_Text_Review.html';
writeFileSync(htmlOut,html);
console.log('PASS SPX_P34_CLAIM_COMPARISON '+JSON.stringify({json:out,html:htmlOut,counts:report.counts,
 reviewed:0,approved:0}));
