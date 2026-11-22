/**
 * P1.43 structural verification of second 1905 digital text comparison,
 * without claiming an actual printed-page collation or expert approval.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const root='artifacts/pius-x-study-expanded/';
const dossier=load(root+'SPX_P41_39_Italian_English_French_Specialist_Dossier.json');
const p43=load(root+'SPX_P43_39_Museum_vs_1905_Wikisource_Italian_Parallel.json');
assert.equal(p43.schema,'AO_SPX_P43_1905_PRINT_LINKED_PROOFREAD_TEXT_CROSSWALK_39_V1');
assert.equal(p43.status,'SECOND_DIGITAL_TEXT_CROSSWALK_NOT_PAGE_IMAGE_VISUAL_COLLATION_OR_CERTIFIED_SOURCE');
assert.equal(p43.records.length,39);
assert.equal(p43.counts.originalCorrectionCandidates,39);
assert.equal(p43.counts.chapters,4);
assert.equal(p43.fetches.length,4);
assert.deepEqual(p43.fetches.map(x=>x.chapter),['Capo_II','Capo_III','Capo_IV','Capo_V']);
assert(p43.fetches.every(x=>x.httpStatus===200&&x.proofreadQuestionsParsed>=12));
assert.equal(p43.counts.questionNearExact+p43.counts.questionVariant+p43.counts.questionUnresolved,39);
assert.equal(p43.counts.answerNearExact+p43.counts.answerVariant+p43.counts.answerDiscrepancyHold,39);
for(const name of ['imagePagesVisuallyCollated','certifiedItalianSourceClaims','certifiedEnglishTranslations','certifiedFrenchTranslations','humanApprovals','sourceOwnerEdits','published'])assert.equal(p43.counts[name],0);
assert(Object.values(p43.approval).every(v=>v===false));
const original=new Map(dossier.records.map(r=>[r.sourceQid,r]));
const seen=new Set();
for(const r of p43.records){
 assert(!seen.has(r.sourceQid));seen.add(r.sourceQid);
 const o=original.get(r.sourceQid);
 assert(o&&r.originalOwnerPath===o.originalOwnerPath);
 assert.equal(r.museumItalianQuestion,o.italianWitnesses[0].italianQuestionVerbatim);
 assert.equal(r.museumItalianAnswer,o.italianWitnesses[0].safeItalianAnswerForDisplay);
 assert.equal(r.museumDigitalUrl,o.sourceUrl);
 assert(r.wikisourceItalianQuestion.length>12);
 assert(r.wikisourceItalianAnswer.length>12);
 assert(r.questionSimilarity>=0&&r.questionSimilarity<=1);
 assert(r.answerSimilarity>=0&&r.answerSimilarity<=1);
 assert(!r.printPageImageInspected&&!r.verifiedSamePhysicalPage);
 assert.equal(r.printedPageNumber,null);
 for(const k of ['independentExpertApproved','englishTranslationApproved','frenchTranslationApproved','theologyApproved','publicationApproved'])assert.equal(r[k],false);
}
assert.equal(seen.size,39);
console.log('PASS P43_SECOND_DIGITAL_WITNESS_ONLY '+JSON.stringify(p43.counts));
