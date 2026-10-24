/**
 * P1.38 deterministic consolidation: 89 existing opening Q&As excluded
 * from the P1.37 11-case rewrite and second-pass cohorts.
 * Preserve 24 previously authored P1.35 findings and add 65 NEW
 * case-specific source-to-draft judgments. No independent certification,
 * translation approval, original source rewrite, or product publication.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const root='artifacts/pius-x-study-expanded/';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const original=read(root+'SPX_P34_Italian_EN_FR_100_Claim_Review.json');
const earlier=read(root+'SPX_P35_35_Provisional_Source_Findings.json');
const revised=read(root+'SPX_P37_Eleven_Italian_Bilingual_Second_Pass.json');
const new65=read('previews/pius-x-study/evidence/pius-x-p38-sixtyfive-new-italian-source-assessments-20261024.v1.json');
assert.equal(original.records.length,100);
assert.equal(earlier.records.length,35);
assert.equal(revised.records.length,11);
assert.equal(new65.assessments.length,65);
assert.equal(new65.status,'ASSISTANT_FIRST_PASS_ON_65_NOT_INDEPENDENT_REVIEW');
const exclude=new Set(revised.records.map(r=>r.sourceQid));
const alreadyReviewed=new Map(earlier.records.map(r=>[r.sourceQid,r]));
const assessments=new Map(new65.assessments.map(r=>[r.sourceQid,r]));
assert.equal(exclude.size,11);
assert.equal(alreadyReviewed.size,35);
assert.equal(assessments.size,65);
for(const qid of exclude)assert(alreadyReviewed.has(qid));
for(const qid of assessments.keys()){
 assert(!exclude.has(qid),'Previously rewritten question must not be reprocessed');
 assert(!alreadyReviewed.has(qid),'Do not overwrite P35 24 prior findings');
}
const pending=original.records.filter(r=>!exclude.has(r.sourceQid));
assert.equal(pending.length,89);
const norm=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const followingHeading=/§\s*\d|CAPO\s+[IVX]+|Della\s+(?:natura|maniera|istituzione|Cresima|essenza|disposizioni)/i;
let carried=0,firstPass=0,exceptions=0,primaFacie=0,headingCases=0,italianPassages=0;
const classification={};
const records=pending.map(r=>{
 const prior=alreadyReviewed.get(r.sourceQid);
 const next=assessments.get(r.sourceQid);
 assert(Boolean(prior)!==Boolean(next),'Each remaining source question must have exactly one assessment');
 const witnesses=r.italianSourceWitnesses;
 assert(witnesses.length>=1);
 assert.equal(r.papalAutographSpeechCertified,false);
 assert.equal(r.allHumanApprovals,false);
 assert.equal(r.publicationApproved,false);
 const core=witnesses[0].italianAnswer;
 assert(core.length>20);
 const words=core.split(/\s+/).slice(0,Math.min(8,core.split(/\s+/).length)).join(' ');
 assert(norm(core).includes(norm(words)));
 const sourceBoundaryHeading=witnesses.some(w=>followingHeading.test(w.italianAnswer));
 headingCases+=+sourceBoundaryHeading;
 italianPassages+=witnesses.length;
 const detail=prior?{
   classification:'PREVIOUS_P35_EDITORIAL_HOLD_UNCHANGED',
   reviewOrigin:'P35_PRIOR_EDITORIAL_FINDING_CARRIED',
   finding:prior.sourceComparison.reasonedItalianToENFRAnalysis,
   action:prior.sourceComparison.requestedRevisionOrDisposition,
   originalItalianAnchor:prior.sourceComparison.sourceEvidenceAnchor,
   anchorQid:prior.sourceComparison.sourceAnchorQid,
   sourceBoundaryHeading,
   sourceFirstPassOnly:true,sourceCertified:false,translationCertified:false,
   humanReviewSigned:false
 }:{
   classification:next.classification,
   reviewOrigin:'P38_NEW_65_EDITORIAL_SOURCE_SCREEN',
   finding:next.sourceToDraftFinding,
   action:next.nextEvidenceOrCorrectionAction,
   originalItalianAnchor:words,
   anchorQid:witnesses[0].qid,
   sourceBoundaryHeading,
   sourceFirstPassOnly:true,sourceCertified:false,translationCertified:false,
   humanReviewSigned:false
 };
 assert(witnesses.some(w=>w.qid===detail.anchorQid&&
  norm(w.italianAnswer).includes(norm(detail.originalItalianAnchor))),
  'Original Italian witness anchor cannot be located '+r.sourceQid);
 if(prior)carried++;else{
  firstPass++;
  if(next.classification==='SOURCE_CORE_PLAUSIBLE')primaFacie++;
  else exceptions++;
 }
 classification[detail.classification]=(classification[detail.classification]||0)+1;
 return {...r,sourceAssessment:detail,
   originalSourceAndEnglishFrenchDraftsUnchanged:true,
   semanticSupportIndependentlyVerified:false,
   expertTranslationApproved:false,
   humanDoctrinalCertified:false,
   papalAutographSpeechCertified:false,
   publicationApproved:false};
});
assert.equal(carried,24);
assert.equal(firstPass,65);
assert.equal(exceptions,29);
assert.equal(primaFacie,36);
assert.equal(italianPassages>=89,true);
const report={
 schema:'AO_SPX_P38_BULK89_REMAINING_ORIGINAL_ITALIAN_EDITORIAL_REVIEW_V1',
 asOf:'2026-10-24',status:'89_RESEARCH_SCREENINGS_NOT_CERTIFIED_BILINGUAL_ANSWERS',
 provenance:{
  primarySourceWitnessOwner:'P33 MUSEO DIGITAL 1905 ANSWER EXTRACTS',
  englishFrenchDraftOwner:'PR1458 SOURCE-OWNED ORIGINAL 100',
  originalQuestionEvidenceOwner:'P34 100 source-bound comparisons',
  preservedEarlierJudgments:'P35 24 existing high-priority case findings',
  excludedFromThisWave:'P37 11 source-limited rewritten candidates',
  italianContinuousQuestionNumber:'EDITORIAL_LOCATOR_NOT_PRINTED_IN_1905'
 },
 counts:{
  originalOpeningQuestions:100,excludedPreviouslyRevisedCases:11,
  inspectedRemainingCases:89,carriedExistingP35Cases:carried,
  newlyScreenedOpeningQuestions:firstPass,
  newCasesWithSpecificScopeOrTranslationConcerns:exceptions,
  newCasesWithoutMaterialIssueIdentifiedOnFirstRead:primaFacie,
  originalItalianQAWitnessesIn89Cases:italianPassages,
  extractedItalianAnswerContainingFollowingHeading:headingCases,
  translationClaimsIndependentlyCertified:0,humanExpertApprovals:0,
  approvedSameIntentMerges:0,publishedAnswers:0
 },classificationCounts:classification,records,
 protections:{
  originalP6_423Unchanged:true,originalPR1458DraftsUnchanged:true,
  inheritedP35EditorialFindingsUnchanged:true,
  originalItalianDigitalWitnessesUnchanged:true,
  prior11P37CandidatesUnchanged:true,
  noGeneratedPersonalPapalSpeech:true,
  noIndependentHumanReviewerImpersonation:true
 }
};
const output=process.env.AO_SPX_P38_OUTPUT||root+'SPX_P38_89_Remaining_Italian_English_French_Audit.json';
mkdirSync(dirname(resolve(output)),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
let html=readFileSync('previews/pius-x-study/spx-p34-claim-review-template.html','utf8');
const change=(a,b)=>{
 const pieces=html.split(a);
 assert.equal(pieces.length,2,'Review HTML template anchor changed: '+a.slice(0,100));
 html=pieces.join(b);
};
change('One hundred openings — Italian sources and bilingual editorial drafts',
 'Eighty-nine opening answers — bulk source comparison');
change('100 source-owned opening questions','89 source-owned opening questions');
change('data.schema!=="AO_SPX_P34_ITALIAN_EN_FR_CLAIM_REVIEW_PACKET_V1"',
 'data.schema!=="AO_SPX_P38_BULK89_REMAINING_ORIGINAL_ITALIAN_EDITORIAL_REVIEW_V1"');
change('data.counts.openingCases!==100','data.counts.inspectedRemainingCases!==89');
change('data.approvals.humanApprovals!==0','data.counts.humanExpertApprovals!==0');
change('matches.length+" of 100 cases shown"','matches.length+" of 89 cases shown"');
change('a.download="SPX_P34_Provisional_Annotations.json"',
 'a.download="SPX_P38_Provisional_Annotations.json"');
change('element("h3","Original Italian question and answer",root);',
 "const assessment=r.sourceAssessment;\nconst review=element(\"section\",null,root,\"notice\");\nelement(\"h3\",\"P1.38 · substantive source-to-draft assessment (not certified)\",review);\nelement(\"p\",assessment.classification.replaceAll(\"_\",\" \")+\" · \"+assessment.reviewOrigin.replaceAll(\"_\",\" \"),review);\nelement(\"p\",assessment.finding,review);\nelement(\"p\",\"Action: \"+assessment.action,review);\nelement(\"p\",\"Original Italian evidence anchor: “\"+assessment.originalItalianAnchor+\"”\",review);\nif(assessment.sourceBoundaryHeading)element(\"p\",\"Transcription contains section-heading material after the answer; do not include it as original answer.\",review);"+"\n element(\"h3\",\"Original Italian question and answer\",root);");
const token='__DOCUMENTARY_REVIEW_DATA__';
change(token,JSON.stringify(report).replace(/</g,'\\u003c'));
const htmlOut=root+'SPX_P38_89_Original_Italian_Review.html';
writeFileSync(htmlOut,html);
console.log('PASS SPX_P38_BULK_89 '+JSON.stringify({json:output,html:htmlOut,
 counts:report.counts,classifications:Object.keys(classification).length}));
