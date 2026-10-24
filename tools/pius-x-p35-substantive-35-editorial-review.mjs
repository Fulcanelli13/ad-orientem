/* P1.35: explicit, source-anchored editorial findings on all 35 priority
 * opening Q&As. Proposals are authored by a research assistant and remain
 * entirely distinct from human/doctrinal signoffs or validated translations.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const root='artifacts/pius-x-study-expanded/';
const packet=JSON.parse(readFileSync(root+'SPX_P34_Italian_EN_FR_100_Claim_Review.json','utf8'));
const annotations=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p35-35-high-priority-editorial-findings-20261024.v1.json','utf8'));
assert.equal(packet.schema,'AO_SPX_P34_ITALIAN_EN_FR_CLAIM_REVIEW_PACKET_V1');
assert.equal(packet.counts.openingCases,100);
assert.equal(packet.counts.casesWithMultipleSourceQas,7);
assert.equal(packet.counts.historicalPastoralCases,30);
assert.equal(annotations.findings.length,35);
assert.equal(annotations.policy.humanSignoffs,0);
const required=packet.records.filter(x=>x.reviewPriority==='P0_HISTORICAL_OR_COMPOSITE');
assert.equal(required.length,35);
const ids=new Set(required.map(x=>x.sourceQid));
const authored=new Map(annotations.findings.map(x=>[x.sourceQid,x]));
assert.equal(authored.size,35);
assert.deepEqual(new Set(authored.keys()),ids);
const normalized=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const mandatory=new Set([
 'MODALITY_CORRECTION','PERIOD_TEXT_AND_EXACT_FORMULA','TRANSLATION_PRECISION',
 'OVERBROAD_COMPANION_SOURCE','SIGNIFICANT_OMISSION',
 'SEVERE_HISTORICAL_LANGUAGE_OMITTED','UNSUPPORTED_EDITORIAL_CONTRAST',
 'TERM_TRANSLATION_REVIEW','MINOR_OMISSION_AND_PERIOD_CAVEAT',
 'CULPABILITY_QUALIFICATION','SOURCE_CLAIM_OVERREACH'
]);
const contamination=/\bCAPO\s+(?:I|V|X|\d+)|§\s*\d|Della\s+(?:Cresima|maniera\s+di\s+comunicarsi)/i;
const counts={cases:35,pastoralHolds:0,compositeCases:0,transcriptionVariantCases:0,
 exactItalianAnchors:0,mandatoryWordingRevisionProposals:0,
 chapterHeadingContaminationCases:0,italianSourcePassages:0,
 substantiveEditorialProposals:35,humanApprovedClaims:0,englishFrenchCertified:0,
 papalSpeechAuthenticated:0,published:0};
const rows=required.map(r=>{
 const a=authored.get(r.sourceQid);
 assert(a&&a.reviewStatus==='SOURCE_REFERENCED_EDITORIAL_PROPOSAL_NOT_CERTIFIED');
 assert.equal(a.personallyAuthoredPapalSpeech,false);
 assert(a.analysis.length>=55&&a.requestedRevisionOrDisposition.length>=60);
 assert(a.italianEvidenceAnchor.length>=8);
 const match=r.italianSourceWitnesses.find(w=>normalized(w.italianAnswer).includes(normalized(a.italianEvidenceAnchor)));
 assert(match,'Ungrounded Italian phrase: '+r.sourceQid+' '+a.italianEvidenceAnchor);
 assert(match.qid&&r.italianSourceWitnesses.some(x=>x.qid===match.qid));
 const primary=r.italianSourceWitnesses[0],all=r.italianSourceWitnesses;
 const affected=all.filter(w=>contamination.test(w.italianAnswer)).map(w=>w.qid);
 const needsRevision=mandatory.has(a.editorialFindingType);
 counts.pastoralHolds+=+(r.triageLane==='HISTORICAL_PASTORAL_HOLD');
 counts.compositeCases+=+(all.length>1);
 counts.transcriptionVariantCases+=+(r.originalSourceQuestionStatus!=='QUESTION_TRANSCRIPTION_NORMALIZED_EXACT');
 counts.exactItalianAnchors++;
 counts.italianSourcePassages+=all.length;
 counts.mandatoryWordingRevisionProposals+=+needsRevision;
 counts.chapterHeadingContaminationCases+=+(affected.length>0);
 return {...r,
  sourceComparison:{
   sourceEvidenceAnchor:a.italianEvidenceAnchor,sourceAnchorQid:match.qid,
   provisionalEditorialFinding:a.editorialFindingType,
   reasonedItalianToENFRAnalysis:a.analysis,
   requestedRevisionOrDisposition:a.requestedRevisionOrDisposition,
   suggestedAction:needsRevision?'REVISE_BEFORE_ANY_APPROVAL':'KEEP_HISTORICAL_CORE_AND_REVIEW_SCOPE',
   sourceBoundaryContaminationQids:affected,
   originalRawWitnessRetained:true,
   editorialAssessmentIsNotTranslationCertification:true,
   approval:{independentSourceExpert:false,theologicalReviewer:false,
    bilingualTranslator:false,periodVoice:false,publication:false}
  }
 };
});
assert.equal(counts.exactItalianAnchors,35);
assert.equal(counts.pastoralHolds,30);
assert.equal(counts.compositeCases,7);
assert.equal(counts.transcriptionVariantCases,3);
assert.equal(counts.italianSourcePassages,44);
const report={
 schema:'AO_SPX_P35_35_PROVISIONAL_SUBSTANTIVE_EDITORIAL_FINDINGS_V1',
 asOf:'2026-10-24',
 status:'35_SOURCE_ANCHORED_RESEARCH_EDITORIAL_PROPOSALS_NOT_CLAIM_CERTIFICATIONS',
 sourceOwner:'PR1458 original catechism material; PR1570 P34 parallel bilingual comparison',
 protections:{sourceOwnerIntact:true,original423DialogueIntact:true,
  sourceWitnessTextPreserved:true,noAutomaticAnswerUpdate:true,
  noPresentLawClaimsCertified:true,noHumanApprovals:true},
 counts,records:rows,
 release:{humanSignedOff:0,sourceClaimCertified:0,englishCertified:0,
  frenchCertified:0,doctrinalCertified:0,personallyAuthoredPapalSpeechCertified:0,
  publicRuntimeUpdates:0}
};
const jsonPath=process.env.AO_SPX_P35_JSON||root+'SPX_P35_35_Provisional_Source_Findings.json';
mkdirSync(dirname(resolve(jsonPath)),{recursive:true});
writeFileSync(jsonPath,JSON.stringify(report,null,2)+'\n');
let template=readFileSync('previews/pius-x-study/spx-p34-claim-review-template.html','utf8');
const requireOnce=(find,replace)=>{
 const pieces=template.split(find);
 assert.equal(pieces.length,2,'Template anchor changed: '+find.slice(0,80));
 template=pieces.join(replace);
};
requireOnce('One hundred openings — Italian sources and bilingual editorial drafts',
 'Thirty-five priority openings — Italian evidence and editorial corrections');
requireOnce('No presumed quotations, theological approval or generated papal replies.',
 '35 source-anchored editorial analyses; none is a certified theological or translation verdict.');
requireOnce('data.counts.openingCases!==100','data.counts.cases!==35');
requireOnce('matches.length+" of 100 cases shown"','matches.length+" of 35 cases shown"');
requireOnce(' for(const flag of r.reviewFlags)element("span",flag.replaceAll("_"," "),tags);',
 ' for(const flag of r.reviewFlags)element("span",flag.replaceAll("_"," "),tags);'+
 ' const finding=r.sourceComparison;'+
 ' const review=element("section",null,root,"notice");'+
 ' element("h3","Provisional source-to-draft editorial finding",review);'+
 ' element("p",finding.provisionalEditorialFinding.replaceAll("_"," ")+" · "+finding.suggestedAction,review);'+
 ' element("p","Italian evidence ("+finding.sourceAnchorQid+"): “"+finding.sourceEvidenceAnchor+"”",review);'+
 ' element("p",finding.reasonedItalianToENFRAnalysis,review);'+
 ' element("p","Recommended action: "+finding.requestedRevisionOrDisposition,review);'+
 ' if(finding.sourceBoundaryContaminationQids.length)element("p","Warning: the raw digitization includes a following-section heading near "+finding.sourceBoundaryContaminationQids.join(", ")+"; do not mistake it for the answer.",review);'
);
requireOnce('sourcePacketSchema:data.schema,exportedAt:new Date().toISOString()',
 'sourcePacketSchema:data.schema,exportedAt:new Date().toISOString()');
const baked=JSON.stringify(report).replace(/</g,'\\u003c');
requireOnce('__DOCUMENTARY_REVIEW_DATA__',baked);
const htmlPath=root+'SPX_P35_35_Editorial_Italian_Review.html';
writeFileSync(htmlPath,template);
console.log('PASS SPX_P35_SUBSTANTIVE_35 '+JSON.stringify({
 json:jsonPath,html:htmlPath,counts,sourceCertified:0,published:0
}));
