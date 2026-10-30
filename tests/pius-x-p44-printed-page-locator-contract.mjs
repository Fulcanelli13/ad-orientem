/**
 * P1.44 source-page mapping and fail-closed documentary review contract.
 * Verifies link metadata, exact upstream QIDs, stated visual-note scope,
 * immutable source owners and absent human approvals. No scan OCR.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const root='artifacts/pius-x-study-expanded/';
const p41=read(root+'SPX_P41_39_Italian_English_French_Specialist_Dossier.json');
const p43=read(root+'SPX_P43_39_Museum_vs_1905_Wikisource_Italian_Parallel.json');
const p44=read(root+'SPX_P44_39_1905_Print_Page_Locator_and_18_Visual_Findings.json');
const permanent=read('previews/pius-x-study/evidence/pius-x-p44-39-print-scan-page-index-20261024.v1.json');
const html=readFileSync(root+'SPX_P44_39_1905_Print_Page_Review.html','utf8');
assert.equal(p44.schema,'AO_SPX_P44_39_EXACT_PRINT_PAGE_LOCATORS_18_BOUNDED_VISUAL_Loci_V1');
assert.equal(p44.status,'PAGE_LOCATORS_AND_ASSISTANT_VISUAL_NOTES_ONLY_NO_INDEPENDENT_CERTIFICATION');
assert.equal(p44.records.length,39);
assert.equal(permanent.schema,'AO_SPX_P44_PERMANENT_COMPACT_1905_SCAN_LOCATORS_39_V1');
assert.equal(permanent.records.length,39);
assert.equal(permanent.counts.priorityPassagesInspected,18);
assert.equal(permanent.counts.questionPageLocators,39);
assert.equal(p44.scanPages.length,27);
const c=p44.counts;
assert.equal(c.originalOpeningCorrections,39);
assert.equal(c.sourcePrintedPagesVisited,27);
assert.equal(c.distinctPagesWithImageViewedByAssistant,27);
assert.equal(c.priorityLociWithBoundedVisualInspections,18);
assert.equal(c.caseQuestionPageLocatorsMapped+c.caseQuestionPageLocatorsUnresolved,39);
for(const key of ['caseWholeAnswersCertifiedViaPrintImage','externalHumanPrintCollationSignoffs','approvedItalian','approvedEnglish','approvedFrench','approvedTheology','sourceOwnerRecordsChanged','published'])assert.equal(c[key],0);
assert.equal(p44.scanPages[0].djvuPage,204);
assert.equal(p44.scanPages.at(-1).djvuPage,230);
for(const p of p44.scanPages){
 assert.equal(p.printedPage,p.djvuPage-12);
 assert.equal(p.pageUri,'https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/'+p.djvuPage);
 assert.equal(p.imageViewedByAssistant,true);
 assert.equal(p.automationDidNotVisuallyReadTheImage,true);
}
const original=new Map(p41.records.map(r=>[r.sourceQid,r]));
const second=new Map(p43.records.map(r=>[r.sourceQid,r]));
const seen=new Set();let scanned=0;
for(const r of p44.records){
 assert(!seen.has(r.sourceQid));seen.add(r.sourceQid);
 const source=original.get(r.sourceQid),cross=second.get(r.sourceQid);
 assert(source&&cross);
 assert.equal(r.originalOwnerPath,source.originalOwnerPath);
 assert.equal(r.wikisourcePrintedEditionQuestion,cross.wikisourceItalianQuestion);
 assert.equal(r.claimWholeItalianAnswerPrintImageFullyCollated,false);
 assert.equal(r.otherItalianWordsAutomaticallyInferredFromPageImage,false);
 for(const k of ['independentlyItalianCertified','independentEnglishApproved','independentFrenchApproved','theologicalReviewApproved','sourceOwnerEdited','published'])assert.equal(r[k],false);
 if(r.printDjvuQuestionStartPage!==null){
  assert(Number.isInteger(r.printDjvuQuestionStartPage));
  assert(r.printDjvuQuestionStartPage>=204&&r.printDjvuQuestionStartPage<=230);
  assert.equal(r.printedQuestionStartPage,r.printDjvuQuestionStartPage-12);
  assert(['FULL_NORMALIZED_QUESTION_IN_PAGE_TRANSCRIPTION','QUESTION_PREFIX_IN_PAGE_TRANSCRIPTION'].includes(r.questionLocatorMethod));
 }else {
  assert.equal(r.questionLocatorMethod,'UNRESOLVED_DO_NOT_GUESS');
  assert.equal(r.printedQuestionStartPage,null);
 }
 assert.equal(r.relevantScanPages.length,r.scanPageLinks.length);
 assert.equal(r.relevantScanPages.length,r.printedPageNumbers.length);
 for(let i=0;i<r.relevantScanPages.length;i++){
  const n=r.relevantScanPages[i];
  assert.equal(r.printedPageNumbers[i],n-12);
  assert.equal(r.scanPageLinks[i],'https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/'+n);
 }
 if(r.priorityVisualPassageInspectedByAssistant){
  scanned++;
  assert(r.boundedVisualFinding.length>35);
  assert(r.relevantScanPages.length>=1);
  assert(r.relevantScanPages.includes(r.printDjvuQuestionStartPage));
 }else assert.equal(r.boundedVisualFinding,null);
 assert(html.includes(r.sourceQid));
}
assert.equal(seen.size,39);
assert.equal(scanned,18);
assert.deepEqual(p44.unresolvedLocators,p44.records.filter(r=>r.printDjvuQuestionStartPage===null).map(r=>r.sourceQid));
assert.equal(p44.releaseGates.noFull39VisualTextCertification,true);
assert.equal(p44.releaseGates.existing423AvatarNodesUnchanged,true);
for(const k of ['humanItalianSourceApproval','humanEnglishReview','humanFrenchReview','humanTheologicalReview','personalPapalQuoteApproval','sourceOwnerEdits','publication'])assert.equal(p44.releaseGates[k],false);
assert(html.includes('No expert or translation approval'));
const permanentById=new Map(permanent.records.map(x=>[x.sourceQid,x]));
assert.equal(permanentById.size,39);
for(const r of p44.records){
 const compact=permanentById.get(r.sourceQid);
 assert(compact,'Missing permanent evidence '+r.sourceQid);
 assert.equal(compact.djvuQuestionStartPage,r.printDjvuQuestionStartPage);
 assert.equal(compact.printedQuestionStartPage,r.printedQuestionStartPage);
 assert.deepEqual(compact.pageImageIndices,r.relevantScanPages);
 assert.deepEqual(compact.printedPages,r.printedPageNumbers);
 assert.deepEqual(compact.pageLinks,r.scanPageLinks);
 assert.equal(compact.priorityVisualInspection,r.priorityVisualPassageInspectedByAssistant);
 assert.equal(Boolean(compact.visualFinding),Boolean(r.boundedVisualFinding));
 assert.equal(compact.verifiedVerbatimPrintedItalian,false);
 for(const key of ['englishApproved','frenchApproved','theologicalApproved','papalPersonalQuoteApproved','publicationApproved'])assert.equal(compact[key],false);
}
console.log('PASS P44_39_1905_PRINT_LOCATORS '+JSON.stringify({...c,unresolved:p44.unresolvedLocators}));
