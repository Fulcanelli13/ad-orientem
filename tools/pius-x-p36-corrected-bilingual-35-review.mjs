/* P1.36 research-only bilingual proposals with original 35 claims preserved. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const root='artifacts/pius-x-study-expanded/';
const p35=JSON.parse(readFileSync(root+'SPX_P35_35_Provisional_Source_Findings.json','utf8'));
const proposed=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p36-eleven-bilingual-rewrite-proposals-20261024.v1.json','utf8'));
assert.equal(p35.schema,'AO_SPX_P35_35_PROVISIONAL_SUBSTANTIVE_EDITORIAL_FINDINGS_V1');
assert.equal(p35.records.length,35);
assert.equal(proposed.schema,'AO_SPX_P36_ELEVEN_SOURCE_LIMITED_BILINGUAL_REWRITE_PROPOSALS_V1');
assert.equal(proposed.candidates.length,11);
const mandatory=new Set(p35.records.filter(x=>x.sourceComparison.suggestedAction==='REVISE_BEFORE_ANY_APPROVAL').map(x=>x.sourceQid));
assert.equal(mandatory.size,11);
const original=new Map(p35.records.map(x=>[x.sourceQid,x]));
const accepted=new Set();
for(const revision of proposed.candidates){
 assert(mandatory.has(revision.sourceQid));
 assert(!accepted.has(revision.sourceQid));accepted.add(revision.sourceQid);
 assert(revision.proposedEN.length>60&&revision.proposedFR.length>60);
 assert(revision.narratorNoteEN.length>45&&revision.narratorNoteFR.length>45);
 assert.equal(revision.independentApproval,false);
 assert.equal(revision.translationApproval,false);
 assert.equal(revision.doctrinalApproval,false);
 assert.equal(revision.publicationApproval,false);
 assert.equal(revision.originalItalianTextSuppliedSeparatelyByP35,true);
 const earlier=original.get(revision.sourceQid);
 assert(revision.proposedEN!==earlier.enDraft&&revision.proposedFR!==earlier.frDraft);
}
assert.deepEqual(accepted,mandatory);
const revisions=new Map(proposed.candidates.map(x=>[x.sourceQid,x]));
const cases=p35.records.map(row=>{
 const u=revisions.get(row.sourceQid);
 return {...row,
  correctedCandidate:u?{
   proposedEN:u.proposedEN,proposedFR:u.proposedFR,
   separateNarratorNoteEN:u.narratorNoteEN,
   separateNarratorNoteFR:u.narratorNoteFR,
   sourceWitnessQids:row.italianSourceWitnesses.map(x=>x.qid),
   proposalStatus:'SOURCE_LIMITED_BILINGUAL_REWRITE_NOT_REVIEWED',
   personallySpokenByPiusX:false,
   originalDraftPreserved:true,sourceExpertSigned:false,
   translatorSigned:false,doctrinalReviewerSigned:false,
   periodVoiceSigned:false,published:false
  }:null,
  proposedRewriteDisposition:u?
   'REVIEW_ITALIAN_SOURCE_AND_FR_EN_PARITY_BEFORE_RELEASE':
   'RETAIN_ORIGINAL_AND_HOLD_FOR_EXPERT_DECISION'
 };
});
const counts={
 priorityCases:35,proposedBilingualRewritePairs:11,
 noRewriteStillHeld:24,historicalPastoralHolds:30,
 multiSourceCases:7,originalItalianWordingVariantCases:3,
 originalItalianWitnesses:44,originalDraftsChanged:0,
 humanSignoffs:0,translationsCertified:0,
 sourceClaimsCertified:0,publishedAnswers:0
};
const report={
 schema:'AO_SPX_P36_BILINGUAL_11_REVISIONS_IN_35_SOURCE_REVIEW_V1',
 asOf:'2026-10-24',
 status:'UNAPPROVED_SOURCE_CONSTRAINED_EDITORIAL_CANDIDATES',
 policy:{
  originalItalianWitnessTextUnchanged:true,
  originalEnglishFrenchP6AndResearchOwnersUnchanged:true,
  editorialNotesDistinctFromHistoricalSourceText:true,
  noNewPersonallyAttributedPapalSpeech:true,
  noAutoPromotion:true
 },
 counts,records:cases,
 release:{humanSignedOff:0,sourceClaimsCertified:0,
  englishCertified:0,frenchCertified:0,doctrinalCertified:0,
  papalVoiceCertified:0,published:0}
};
const file=process.env.AO_SPX_P36_OUTPUT||root+'SPX_P36_Bilingual_11_Revisions_35_Source_Cases.json';
mkdirSync(dirname(resolve(file)),{recursive:true});
writeFileSync(file,JSON.stringify(report,null,2)+'\n');
let html=readFileSync(root+'SPX_P35_35_Editorial_Italian_Review.html','utf8');
const replaceOnce=(before,after)=>{
 const chunks=html.split(before);
 assert.equal(chunks.length,2,'P35 HTML contract changed: '+before.slice(0,65));
 html=chunks.join(after);
};
replaceOnce('Thirty-five priority openings — Italian evidence and editorial corrections',
 'Eleven proposed bilingual corrections · thirty-five original-source reviews');
replaceOnce('data.schema!=="AO_SPX_P35_35_PROVISIONAL_SUBSTANTIVE_EDITORIAL_FINDINGS_V1"',
 'data.schema!=="AO_SPX_P36_BILINGUAL_11_REVISIONS_IN_35_SOURCE_REVIEW_V1"');
replaceOnce('data.counts.cases!==35','data.counts.priorityCases!==35');
replaceOnce('a.download="SPX_P35_Provisional_Annotations.json"',
 'a.download="SPX_P36_Provisional_Annotations.json"');
replaceOnce('element("p","Recommended action: "+finding.requestedRevisionOrDisposition,review);',
 "element(\"p\",\"Recommended action: \"+finding.requestedRevisionOrDisposition,review);\n const revision=r.correctedCandidate;\n if(revision){\n  const panel=element(\"section\",null,root,\"notice\");\n  element(\"h3\",\"Bilingual correction PROPOSED — not approved\",panel);\n  const pair=element(\"div\",null,panel,\"columns\");\n  const en=element(\"div\",null,pair,\"box\");\n  element(\"label\",\"English proposal · not certified\",en);\n  element(\"p\",revision.proposedEN,en);\n  const fr=element(\"div\",null,pair,\"box\");\n  element(\"label\",\"Proposition française · non certifiée\",fr);\n  element(\"p\",revision.proposedFR,fr);\n  element(\"h3\",\"Separate editorial commentary — not original Pius X words\",panel);\n  element(\"p\",\"EN: \"+revision.separateNarratorNoteEN,panel);\n  element(\"p\",\"FR: \"+revision.separateNarratorNoteFR,panel);\n }else element(\"p\",\"Original draft retained without rewrite pending independent review.\",review);");
const embedded=/<script type="application\/json" id="evidence">[\s\S]*?<\/script>/;
assert(embedded.test(html));
html=html.replace(embedded,'<script type="application/json" id="evidence">'+
 JSON.stringify(report).replace(/</g,'\\u003c')+'</script>');
const htmlOut=root+'SPX_P36_Bilingual_11_Proposed_Corrections.html';
writeFileSync(htmlOut,html);
console.log('PASS SPX_P36_CANDIDATE_BILINGUAL_CORRECTIONS '+JSON.stringify({
 json:file,html:htmlOut,counts,approved:0
}));
