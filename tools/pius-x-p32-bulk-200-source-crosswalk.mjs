/**
 * P1 bulk wave: reconcile the *existing* 200 historical 1905 research turns
 * from formation PR #1458 with the P6 original question nodes and the
 * upstream 339-question source crosswalk.
 *
 * READ ONLY. The research owners retain full answer text, Magisterium
 * candidates, translation drafts and edition evidence. This report retains
 * source IDs, original question strings and relationship *proposals* only.
 * A match of editorial question numbers or words is NEVER a verified answer.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';

const researchRoot='data/learn/research/';
const outputRoot='artifacts/pius-x-study-expanded/';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const original=read(outputRoot+'SPX_P31_Readonly_Question_Reconciliation.json');
const upstream=read(researchRoot+
 'pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json');
const cross=read(researchRoot+
 'pius-x-sacraments-339-topical-overlap-crosswalk-20261020.v2.json');
const triage=read(researchRoot+
 'pius-x-100answer-editorial-release-triage-20261020.v1.json');

assert.equal(original.schema,'AO_SPX_P31_P0_READONLY_CROSS_SOURCE_RECONCILIATION_V1');
assert.equal(original.rows.length,423);
assert.equal(original.counts.approvedCrossEditionMerges,0);
assert.equal(upstream.count.draftAnswerTurns,200);
assert.equal(upstream.count.families,100);
assert.equal(upstream.answerEvidence.length,200);
assert.equal(upstream.count.approvedEnglishFrenchReplies,0);
assert.equal(upstream.count.fullOriginalPrintCertifications,0);
assert.equal(upstream.count.publishedAnswers,0);
assert.equal(cross.summary.historicalSourceQuestionTotal,339);
assert.equal(cross.sourceQuestionCrosswalk.length,339);
assert.equal(cross.summary.approvedMerges,0);
assert.equal(cross.summary.certifiedUniqueVisitorIntents,0);
assert.equal(triage.records.length,100);
assert.equal(triage.counts.indexedOpeningTurnCandidates,100);
assert.equal(triage.counts.published,0);

const existing=new Map(original.rows.map(r=>[r.nodeId,r]));
assert.equal(existing.size,423);
const byChapter=new Map();
for(const node of original.rows){
 if(!byChapter.has(node.chapterId))byChapter.set(node.chapterId,[]);
 byChapter.get(node.chapterId).push(node);
}
const upstreamCross=new Map(cross.sourceQuestionCrosswalk.map(r=>[r.questionId,r]));
assert.equal(upstreamCross.size,339);
const triageByTurn=new Map(triage.records.map(r=>[r.turnId,r]));
assert.equal(triageByTurn.size,100);

const QID=id=>{
 const m=/^PX1905-Q([1-9]\d{0,3})$/.exec(id);
 assert(m&&Number(m[1])<=993,'Invalid 1905 editorial question locator: '+id);
 return Number(m[1]);
};
const SOURCE_PIN={
  ownerPR:1458,ownerHeadSHA:'188f563288d381056df23e19ae30619f53efd088',
  evidenceRegistry:'data/learn/research/pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json',
  crosswalkRegistry:'data/learn/research/pius-x-sacraments-339-topical-overlap-crosswalk-20261020.v2.json',
  releaseTriageRegistry:'data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json',
  sourceOwnerConstraint:'DO_NOT_COPY_OR_REWRITE_ORIGINAL_EDITORIAL_ANSWERS',
  sourcePrintedQuestionNumbers:false
};
const stop=new Set('a an and as are at be been but by can could did do does for from have how if in is it its may must of on or our shall should that the their them there these this those to was were what when where which who whom why will with would you your church christ christian god jesus jesus christ lord pope catechism explain please tell know mean means'.split(' '));
const terms=q=>new Set(String(q).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]+/g,' ').split(/\s+/)
 .filter(t=>t.length>=4&&!stop.has(t)));
const existingTerms=[...existing.values()].map(r=>({r,t:terms(r.visitorQuestion.en)}));
const proposals=(q,exclude)=>{
 const t=terms(q);
 if(t.size<2)return [];
 const list=[];
 for(const x of existingTerms){
  if(exclude.has(x.r.nodeId)||x.t.size<2)continue;
  const shared=[...t].filter(w=>x.t.has(w));
  if(shared.length<2)continue;
  const score=shared.length/Math.sqrt(t.size*x.t.size);
  const coverage=shared.length/Math.min(t.size,x.t.size);
  if(coverage<0.64||score<0.44)continue;
  list.push({nodeId:x.r.nodeId,chapterId:x.r.chapterId,
    sharedTokens:shared,score:Number(score.toFixed(3)),
    status:'LEXICAL_REVIEW_LEAD_ONLY_NOT_SEMANTIC_DUPLICATE',
    mergeApproved:false});
 }
 return list.sort((a,b)=>b.score-a.score||
  b.sharedTokens.length-a.sharedTokens.length||a.nodeId.localeCompare(b.nodeId))
  .slice(0,5);
};

const turns=[],families=new Set(),turnIds=new Set(),allQids=new Set();
let locatorTurns=0,ownerSeedTurns=0,lexicalOnly=0,noExistingCandidate=0;
let historicalSensitive=0,magisteriumCandidate=0,magisteriumUnassessed=0;
let openingTriage=0,sourceNumberOverlapEdges=0,crossOwnerPriorSeedEdges=0;
const sourceUse=new Map(),sourceFamilies=new Map(),documents=new Set(),lanes={};
for(const r of upstream.answerEvidence){
 assert(!turnIds.has(r.answerTurnId),'Duplicated 1905 turn ID');turnIds.add(r.answerTurnId);
 assert([1,2].includes(r.turnIndex));
 assert.equal(r.answerTurnId,r.familyId+'-T'+r.turnIndex);
 assert(r.questionEN&&r.questionFR&&r.questionEN.length>10&&r.questionFR.length>10);
 assert(r.originalAnswerOwner.path.startsWith(researchRoot+'pius-x-batch'));
 assert.equal(r.originalAnswerOwner.originalDraftUnaltered,true);
 assert.equal(r.originalSource.sourceClass,
  '1905_PAPALLY_PRESCRIBED_CATECHISM_NOT_PERSONAL_AUTOGRAPH');
 assert.equal(r.originalSource.original1905FacsimileCollated,false);
 assert.equal(r.originalSource.claimByClaimApproved,false);
 assert.equal(r.originalSource.numberingProvenance.originallyPrintedQuestionNumber,false);
 assert.equal(r.originalSource.numberingProvenance.editorialQIDShouldShowAsLocatorOnly,true);
 assert.equal(r.originalSource.numberingProvenance.showOriginalPrintedQNumberInCitation,false);
 assert(r.originalSource.sourceWitnessUrl.startsWith('https://www.museosanpiox.it/'));
 assert.equal(r.approvedAnswer,false);
 assert.equal(r.chanoine.approvedTopicSpecificResponse,false);
 assert.equal(r.bilingualRevision.releaseEligible,false);
 assert.equal(r.magisterium.approval,false);
 assert(['UNASSESSED_NOT_NOT_APPLICABLE',
  'DOCUMENTARY_UNIT_CANDIDATE_NOT_CLAIM_APPROVED'].includes(r.magisterium.applicabilityStatus));
 if(r.historicallySensitive)historicalSensitive++;
 if(r.magisterium.applicabilityStatus==='UNASSESSED_NOT_NOT_APPLICABLE')magisteriumUnassessed++;
 else magisteriumCandidate++;
 documents.add(r.originalAnswerOwner.path);
 families.add(r.familyId);
 const qids=[...new Set(r.originalSource.originalQuestionIds)];
 assert(qids.length>0);
 for(const id of qids){
  QID(id);assert(upstreamCross.has(id),'Missing source crosswalk: '+id);
  const record=upstreamCross.get(id);
  assert.equal(record.sourceSentenceCertified,false);
  assert.equal(record.translationCertified,false);
  assert.equal(record.runtimePublished,false);
  allQids.add(id);
  sourceUse.set(id,(sourceUse.get(id)||0)+1);
  if(!sourceFamilies.has(id))sourceFamilies.set(id,new Set);
  sourceFamilies.get(id).add(r.familyId);
 }
 const sameSourceNumber=[],seedTargets=new Set();
 for(const node of existing.values()){
  if(!node.original1905EditorialLocusQids?.length)continue;
  const shared=qids.filter(id=>
   node.original1905EditorialLocusQids.includes('1905-EDITORIAL-Q'+QID(id)));
  if(shared.length){
   sameSourceNumber.push({nodeId:node.nodeId,chapterId:node.chapterId,
    cited1905QuestionIds:shared,
    relation:'SAME_EDITORIAL_SOURCE_LOCATOR_NOT_SAME_VISITOR_INTENT',
    claimApproved:false,mergeApproved:false});
  }
 }
 for(const id of qids)for(const seed of upstreamCross.get(id).linkedEarlierTopicalSeeds||[]){
  assert(typeof seed==='string');
  seedTargets.add(seed);
 }
 const seedLinks=[...seedTargets].sort().map(seed=>({
  chapterId:seed,registeredAs:'UPSTREAM_PRIOR_TOPICAL_SEED_NOT_EQUIVALENT_QA',
  presentInOriginal423:byChapter.has(seed),mergeApproved:false
 }));
 sourceNumberOverlapEdges+=sameSourceNumber.length;
 crossOwnerPriorSeedEdges+=seedLinks.length;
 if(sameSourceNumber.length)locatorTurns++;
 if(seedLinks.length)ownerSeedTurns++;
 const excluded=new Set(sameSourceNumber.map(x=>x.nodeId));
 const lexical=proposals(r.questionEN,excluded);
 if(!sameSourceNumber.length&&!seedLinks.length&&lexical.length)lexicalOnly++;
 if(!sameSourceNumber.length&&!seedLinks.length&&!lexical.length)noExistingCandidate++;
 const release=r.turnIndex===1?triageByTurn.get(r.answerTurnId):null;
 if(r.turnIndex===1){
  assert(release,'Each original 1905 opening turn must match the original editorial triage');
  assert.equal(release.published,false);
  assert(release.approval&&Object.values(release.approval).every(x=>x==='NOT_SIGNED_OFF'));
  openingTriage++;
 }else assert(!triageByTurn.has(r.answerTurnId));
 const lane=release?.lane||'FOLLOWUP_UNASSESED_BY_100_OPENING_TRIAGE';
 lanes[lane]=(lanes[lane]||0)+1;
 turns.push({
  turnId:r.answerTurnId,familyId:r.familyId,turnIndex:r.turnIndex,
  question:{en:r.questionEN,fr:r.questionFR},
  originalOwnerPath:r.originalAnswerOwner.path,
  sourceWitnessUrl:r.originalSource.sourceWitnessUrl,
  source1905QuestionIds:qids,source1905QuestionNumberIsEditorial:true,
  crosswalk1905Status:'339_SOURCE_QUESTIONS_INDEXED_BUT_ANSWER_NOT_CERTIFIED',
  upstreamEarlierPilotLinks:seedLinks,
  originalP6SourceLocatorLeads:sameSourceNumber,
  originalP6LexicalReviewLeads:lexical,
  triageLane:lane,
  triageReasons:release?.reviewReasons||[],
  historicallySensitive:!!r.historicallySensitive,
  magisteriumStage:r.magisterium.applicabilityStatus,
  legacyAnswerTextIncluded:false,
  release:{originalAnswerApproved:false,originalItalianFacsimileCollated:false,
   bilingualApproved:false,doctrinalApproved:false,periodVoiceApproved:false,
   mergedIntoP6:false,published:false},
  recommendation:sameSourceNumber.length?'PRIORITIZE_EXACT_SOURCE_PASSAGE_AND_CLAIM_COMPARISON':
    seedLinks.length?'PRIORITIZE_PRIOR_PILOT_CLAIM_SCOPE_REVIEW':
    lexical.length?'REVIEW_QUESTION_SEMANTICS_WITH_FULL_ORIGINAL_TEXT':
    'NEW_HISTORICAL_QUESTION_NEEDS_SOURCE_ANSWER_VERIFICATION'
 });
}
assert.equal(turns.length,200);
assert.equal(families.size,100);
assert.equal(turnIds.size,200);
assert.equal(openingTriage,100);
assert.equal(magisteriumCandidate,48);
assert.equal(magisteriumUnassessed,152);
assert.equal(historicalSensitive,74);
assert.equal(documents.size,10);
assert.equal(allQids.size,101);
assert(allQids.has('PX1905-Q567')&&allQids.has('PX1905-Q667'));
for(const item of triage.records)assert(turnIds.has(item.turnId));
const reused=[...sourceUse.entries()].filter(([,uses])=>uses>1);
const report={
 schema:'AO_SPX_P32_P1_BULK200_ORIGINAL_SOURCE_TURN_RECONCILIATION_V1',
 date:'2026-10-24',status:'PRIVATE_RESEARCH_ONLY_NO_GENERATED_ANSWERS',
 crosswalkOwners:SOURCE_PIN,
 originalP6:{questions:423,chapters:106,sourceOwnerPreserved:true},
 original1905Research:{turns:200,families:100,distinctEditorialQidAnchors:101},
 counts:{
  turns:turns.length,families:families.size,
  distinctOriginal1905EditorialQuestionAnchors:allQids.size,
  originalOwnerFiles:documents.size,sourceReferenceEdges:[...sourceUse.values()].reduce((a,b)=>a+b,0),
  reusedSourceQuestionLocators:reused.length,
  questionsUsedByMultipleFamilies:[...sourceFamilies.values()].filter(set=>set.size>1).length,
  historicalSensitivityHolds:historicalSensitive,
  magisteriumCandidateTurns:magisteriumCandidate,
  magisteriumApplicabilityNotAssessed:magisteriumUnassessed,
  openingTurnsWithUpstreamReleaseTriage:openingTriage,
  turnsWithExactSourceLocatorIntersection:locatorTurns,
  turnsWithUpstreamPriorPilotLink:ownerSeedTurns,
  sourceLocatorEdges:sourceNumberOverlapEdges,priorPilotLinkEdges:crossOwnerPriorSeedEdges,
  turnsWithLexicalSuggestionsOnly:lexicalOnly,
  turnsWithoutP6Candidate:noExistingCandidate,
  originalTextClaimCertifications:0,answersApproved:0,
  bilingualTranslationsApproved:0,automaticSemanticMerges:0,
  publishedTurns:0
 },
 reviewLanes:lanes,
 sourceQuestionReuse:[
  ...reused.map(([id,uses])=>({
   questionId:id,turnCount:uses,
   familyCount:sourceFamilies.get(id).size,
   interpretation:'SOURCE_WITNESS_REUSE_IS_NOT_DUPLICATE_VISITOR_INTENT',
   mergeApproved:false
  }))
 ].sort((a,b)=>b.turnCount-a.turnCount||a.questionId.localeCompare(b.questionId)),
 safeguards:{
  directP6AnswerTextCopied:0,upstream200AnswerTextCopied:0,
  editedUpstreamResearchRecords:0,productionChanges:0,
  paragraphOrFullAnswerOriginalPrintCollationsPerformed:0,
  original1905EditorNumbersNeverRepresentedAsPrinted:true,
  noMagisteriumCrossReferenceTreatedAsApproved:true
 },
 turns
};
const dest=process.env.AO_SPX_P32_OUTPUT||
 outputRoot+'SPX_P32_Bulk200_Source_Question_Crosswalk.json';
mkdirSync(dirname(resolve(dest)),{recursive:true});
writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log('PASS SPX_P32_BULK200 '+JSON.stringify({path:dest,
 counts:report.counts,upstreamSha:SOURCE_PIN.ownerHeadSHA,protected:true}));
