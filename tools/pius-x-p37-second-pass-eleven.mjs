/* P1.37 second-pass translation/claim evidence audit over 11 P36 proposals.
 * The reviewer is the assistant, NOT independent canonical, linguistic, or
 * doctrinal certification. Every source span is checked against original
 * Italian attached to P36. No original owner is edited.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const root='artifacts/pius-x-study-expanded/';
const p36=JSON.parse(readFileSync(root+'SPX_P36_Bilingual_11_Revisions_35_Source_Cases.json','utf8'));
const notes=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p37-eleven-second-pass-translation-review-20261024.v1.json','utf8'));
assert.equal(p36.schema,'AO_SPX_P36_BILINGUAL_11_REVISIONS_IN_35_SOURCE_REVIEW_V1');
assert.equal(p36.records.length,35);
assert.equal(p36.counts.proposedBilingualRewritePairs,11);
assert.equal(notes.schema,'AO_SPX_P37_INDEPENDENT_TRANSLATION_REVIEW_PREP_11_V1');
assert.equal(notes.records.length,11);
assert.equal(notes.counts.italianPropositionAnchors,25);
assert.equal(notes.counts.secondDraftRevisionCases,3);
assert.equal(notes.counts.humanReviewsSigned,0);
const source=new Map(p36.records.map(x=>[x.sourceQid,x]));
const norm=text=>String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
 .replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const ids=new Set();let anchors=0,redrafts=0,pastoral=0;
const records=notes.records.map(note=>{
 assert(!ids.has(note.sourceQid));ids.add(note.sourceQid);
 const prior=source.get(note.sourceQid);
 assert(prior&&prior.correctedCandidate,'P37 must never invent a P36 candidate');
 assert.equal(prior.publicationApproved,false);
 assert.equal(note.humanIndependentSourceReview,false);
 assert.equal(note.professionalTranslationApproval,false);
 assert.equal(note.doctrinalSignoff,false);
 assert.equal(note.papalStyleSignoff,false);
 assert.equal(note.publicationApproved,false);
 assert(note.editorialAnalysis.length>=85);
 assert(note.specialistNeeded.length>=8);
 for(const span of note.sourcePropositionChecks){
  const witness=prior.italianSourceWitnesses.find(w=>w.qid===span.sourceQid);
  assert(witness,'Original Italian source not found '+span.sourceQid);
  assert(norm(witness.italianAnswer).includes(norm(span.exactItalianSpan)),
   'Italian evidence text not reproduced in source: '+note.sourceQid+' '+span.exactItalianSpan);
  assert(span.meaningTracked.length>=20,'Empty or uninformative source-to-claim explanation');
  anchors++;
 }
 if(note.alternativeCandidate){
  redrafts++;
  assert(note.action===undefined); // revision action stored in nextAction
  assert.equal(note.nextAction,'REVISE_SECOND_BILINGUAL_DRAFT');
  assert(note.alternativeCandidate.proposedEN.length>90);
  assert(note.alternativeCandidate.proposedFR.length>90);
  assert.notEqual(note.alternativeCandidate.proposedEN,prior.correctedCandidate.proposedEN);
  assert.notEqual(note.alternativeCandidate.proposedFR,prior.correctedCandidate.proposedFR);
  assert.equal(note.alternativeCandidate.translatorApproved,false);
  assert.equal(note.alternativeCandidate.doctrinalApproved,false);
 }
 pastoral+=+(prior.triageLane==='HISTORICAL_PASTORAL_HOLD');
 return {...prior,secondPassAudit:note};
});
assert.equal(anchors,25);
assert.equal(redrafts,3);
assert.equal(records.length,11);
const counts={
 secondPassCases:11,sourceClaimsCheckedAsEditorialProposals:25,
 proposedThirdVersionPairs:3,originalP36PairsPreserved:11,
 retainedWithoutAdditionalRedraft:8,
 historicallySensitiveCasesInCohort:pastoral,
 certifiedEnglishFrenchClaimPairs:0,independentHumanSignoffs:0,
 sourceExpertApprovals:0,doctrinalApprovals:0,publications:0
};
const report={
 schema:'AO_SPX_P37_SECOND_PASS_11_ITALIAN_BILINGUAL_REVIEW_V1',
 date:'2026-10-24',
 status:'ASSISTANT_SECOND_PASS_SOURCE_FIDELITY_ASSESSMENT_NOT_INDEPENDENT_CERTIFICATION',
 sourceOwner:'P36 reviewed original/source owners unchanged',
 counts,records,
 approvals:{humanSignedOff:0,sourceClaimsCertified:0,translationCertified:0,
  doctrinalCertified:0,periodVoiceCertified:0,publicationApproved:0},
 warnings:[
 'This analysis is by an assistant, not an independent human expert or Church approver.',
 'Original 1905 Italian witness is from a museum digital transcription, not print facsimile certification.',
 'Some cases explicitly remain held for moral-theology, liturgical translation and historical canon-law review.',
 'The three additional English/French revisions do not replace the previous versions or constitute accepted avatar replies.'
 ]
};
const dest=process.env.AO_SPX_P37_OUTPUT||root+'SPX_P37_Eleven_Italian_Bilingual_Second_Pass.json';
mkdirSync(dirname(resolve(dest)),{recursive:true});
writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
let html=readFileSync(root+'SPX_P36_Bilingual_11_Proposed_Corrections.html','utf8');
function changeOnce(from,to){
 const bits=html.split(from);
 assert.equal(bits.length,2,'P36 prototype changed: '+from.slice(0,65));
 html=bits.join(to);
}
changeOnce('Eleven proposed bilingual corrections · thirty-five original-source reviews',
 'Eleven source-checked bilingual drafts · three additional correction proposals');
changeOnce('data.schema!=="AO_SPX_P36_BILINGUAL_11_REVISIONS_IN_35_SOURCE_REVIEW_V1"',
 'data.schema!=="AO_SPX_P37_SECOND_PASS_11_ITALIAN_BILINGUAL_REVIEW_V1"');
changeOnce('data.counts.priorityCases!==35','data.counts.secondPassCases!==11');
changeOnce('matches.length+" of 35 cases shown"','matches.length+" of 11 cases shown"');
changeOnce('a.download="SPX_P36_Provisional_Annotations.json"',
 'a.download="SPX_P37_Provisional_Annotations.json"');
changeOnce('const revision=r.correctedCandidate;'," const audit=r.secondPassAudit;\n const stage=element(\"section\",null,root,\"notice\");\n element(\"h3\",\"P1.37 — second-pass Italian / EN / FR analysis (unapproved)\",stage);\n element(\"p\",audit.verdict.replaceAll(\"_\",\" \")+\" · \"+audit.nextAction,stage);\n element(\"p\",audit.editorialAnalysis,stage);\n element(\"p\",\"Independent specialist still required: \"+audit.specialistNeeded.replaceAll(\"_\",\" \"),stage);\n for(const clause of audit.sourcePropositionChecks){\n  const p=element(\"p\",\"Italian (\"+clause.sourceQid+\"): “\"+clause.exactItalianSpan+\"” — \"+clause.meaningTracked,stage);\n  p.className=\"dim\";\n }\n if(audit.alternativeCandidate){\n  const panel=element(\"section\",null,root,\"notice\");\n  element(\"h3\",\"SECOND bilingual correction proposal — not certified\",panel);\n  const pair=element(\"div\",null,panel,\"columns\");\n  const en=element(\"div\",null,pair,\"box\");\n  element(\"label\",\"English · second draft\",en);\n  element(\"p\",audit.alternativeCandidate.proposedEN,en);\n  const fr=element(\"div\",null,pair,\"box\");\n  element(\"label\",\"Français · deuxième proposition\",fr);\n  element(\"p\",audit.alternativeCandidate.proposedFR,fr);\n }"+'\n const revision=r.correctedCandidate;');
const embedded=/<script type="application\/json" id="evidence">[\s\S]*?<\/script>/;
assert(embedded.test(html));
html=html.replace(embedded,'<script type="application/json" id="evidence">'+
 JSON.stringify(report).replace(/</g,'\\u003c')+'</script>');
const htmlOut=root+'SPX_P37_Eleven_Bilingual_Second_Pass.html';
writeFileSync(htmlOut,html);
console.log('PASS SPX_P37_SECOND_PASS '+JSON.stringify({json:dest,html:htmlOut,counts,
 sourceCertified:0,independentHumanSignoffs:0}));
