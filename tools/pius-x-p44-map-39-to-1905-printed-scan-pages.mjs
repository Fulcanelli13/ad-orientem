/**
 * P1.44 printed-edition page-location evidence for all 39 opening Q&A proposals.
 * Automated case-to-page matching only, with a separate bounded editorial
 * visual-inspection log of 18 selected priority passages. NEVER treat either
 * as independent human approval, print-facsimile certification of all 39,
 * bilingual quality assurance or permission to edit original source owners.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {chromium} from '@playwright/test';
const root='artifacts/pius-x-study-expanded/';
const p41=JSON.parse(readFileSync(root+'SPX_P41_39_Italian_English_French_Specialist_Dossier.json','utf8'));
const p43=JSON.parse(readFileSync(root+'SPX_P43_39_Museum_vs_1905_Wikisource_Italian_Parallel.json','utf8'));
assert.equal(p41.records.length,39);assert.equal(p43.records.length,39);
const scans=[...Array(27)].map((_,i)=>i+204);
const base='https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/';
const normalize=t=>String(t||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'')
 .replace(/\u00ad/g,'').replace(/[’‘\u2019]/g,"'").replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const checked={
 'PX1905-Q568':{pages:[208],finding:'Printed p.196 explicitly obliges the baptized always to profess the faith and observe the law of Christ and the Church.'},
 'PX1905-Q569':{pages:[208],finding:'Printed p.196 says per sempre in the baptismal renunciation.'},
 'PX1905-Q577':{pages:[210],finding:'Printed p.198 says that Confirmation imparts the Holy Ghost, imprints the soldier-of-Christ character and makes perfect Christians.'},
 'PX1905-Q582':{pages:[211],finding:'Printed p.199 explicitly includes fragrant Christian virtues and preservation from corruption of vice.'},
 'PX1905-Q586':{pages:[212],finding:'Printed p.200 explicitly includes not fearing the enemies of the faith.'},
 'PX1905-Q588':{pages:[212],finding:'Printed p.200 uses tutti devono procurare rather than a merely permissive encouragement.'},
 'PX1905-Q592':{pages:[213],finding:'Printed p.201 uses deve often to pray, perform good works and live according to the law of Jesus Christ.'},
 'PX1905-Q599':{pages:[214,215],finding:'Printed pp.202–203 visibly split the word Eucaristia at the scan-page boundary, confirming a page-break transcription artifact.'},
 'PX1905-Q606':{pages:[215,216],finding:'Printed pp.203–204 show rinnovazione and that the answer continues across the page boundary without a printed Wikisource page marker.'},
 'PX1905-Q611':{pages:[216],finding:'Printed p.204 explicitly states that the species remain without their substance through divine omnipotence.'},
 'PX1905-Q613':{pages:[217],finding:'Printed p.205 explains the presence of Christ whole in both Eucharistic species in both Body-to-Blood and Blood-to-Body directions.'},
 'PX1905-Q625':{pages:[219],finding:'Printed p.207 gives grace as the life of the soul and explicitly compares it with material nourishment.'},
 'PX1905-Q626':{pages:[219],finding:'Printed p.207 displays 1º, 2º, 3º numbered effects, omitted from the flattened Museo source wording.'},
 'PX1905-Q638':{pages:[222],finding:'Printed p.210 explicitly names contrizione in the pre-Communion acts.'},
 'PX1905-Q657':{pages:[226,227],finding:'Printed pp.214–215 differentiate presence by consecratory words from natural concomitance and hypostatic union; the text crosses a page boundary.'},
 'PX1905-Q659':{pages:[227],finding:'Printed p.215 lists four purposes and explicitly references souls in purgatory.'},
 'PX1905-Q664':{pages:[228],finding:'Printed p.216 retains 1º and 2º categories and the clause about attendees considered united to the priest.'},
 'PX1905-Q665':{pages:[229],finding:'Printed p.217 lists the two requirements as 1º modesty of person and 2º devotion of heart.'}
};
assert.equal(Object.keys(checked).length,18);
const browser=await chromium.launch({headless:true});
const pages=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 await page.route('**/*',r=>{
  if(['image','font','media'].includes(r.request().resourceType()))return r.abort();
  return r.continue();
 });
 for(const scan of scans){
  const uri=base+scan;
  let ok=false,answer=null;
  for(let attempt=0;attempt<3&&!ok;attempt++){
   try{
    answer=await page.goto(uri,{waitUntil:'domcontentloaded',timeout:35000});
    ok=!!answer?.ok();
   }catch(e){if(attempt===2)throw e;}
  }
  assert(ok,'Wikisource page was not accessible: '+scan+' '+answer?.status());
  const info=await page.evaluate(()=>{
   const root=document.querySelector('#mw-content-text');
   if(!root)throw Error('No original page text root');
   const links=[...root.querySelectorAll('a[href]')].map(a=>a.href);
   const directImage=links.find(x=>x.includes('1905.djvu')&&/page\d+-\d+px-.+\.jpg/.test(x))||null;
   return {body:root.innerText, directImage};
  });
  assert(info.body.includes(String(scan-12)),'Expected printed pagination '+scan);
  pages.push({djvuPage:scan,printedPage:scan-12,pageUri:uri,imageHref:info.directImage,
   sourceText:info.body,sourceTextNorm:normalize(info.body)});
 }
 await page.close();
}finally{await browser.close();}
assert.equal(pages.length,27);
const start=new Map(p41.records.map(x=>[x.sourceQid,x]));
const second=new Map(p43.records.map(x=>[x.sourceQid,x]));
const rows=[];
for(const item of p41.records){
 const qid=item.sourceQid,w=second.get(qid);assert(w);
 const q=normalize(w.wikisourceItalianQuestion);
 const startFragment=q.split(' ').slice(0,Math.min(9,q.split(' ').length)).join(' ');
 const matches=pages.map(x=>({
   page:x,
   whole:x.sourceTextNorm.includes(q),
   prefix:x.sourceTextNorm.includes(startFragment),
   tokenCount:startFragment.split(' ').length
 })).filter(x=>x.whole||x.prefix);
 // Never invent a page locator. If a page wraps a question over two scans,
 // record an unresolved locator rather than using guessed correspondence.
 const exact=matches.filter(x=>x.whole).sort((a,b)=>a.page.djvuPage-b.page.djvuPage);
 const strongest=(exact.length?exact:matches).sort((a,b)=>a.page.djvuPage-b.page.djvuPage);
 const best=strongest[0]||null;
 const prior=checked[qid]||null;
 if(prior&&best)assert(prior.pages.includes(best.page.djvuPage),'Editorial scan page mismatch '+qid+' '+best.page.djvuPage);
 const allScans=prior?prior.pages:(best?[best.page.djvuPage]:[]);
 rows.push({
  sourceQid:qid,originalOwnerPath:item.originalOwnerPath,
  wikisourcePrintedEditionQuestion:w.wikisourceItalianQuestion,
  printDjvuQuestionStartPage:best?.page.djvuPage??null,
  printedQuestionStartPage:best?.page.printedPage??null,
  questionLocatorMethod:best?(best.whole?'FULL_NORMALIZED_QUESTION_IN_PAGE_TRANSCRIPTION':'QUESTION_PREFIX_IN_PAGE_TRANSCRIPTION'):'UNRESOLVED_DO_NOT_GUESS',
  relevantScanPages:allScans,
  scanPageLinks:allScans.map(n=>pages.find(p=>p.djvuPage===n).pageUri),
  printedPageNumbers:allScans.map(n=>n-12),
  priorityVisualPassageInspectedByAssistant:!!prior,
  boundedVisualFinding:prior?.finding||null,
  claimWholeItalianAnswerPrintImageFullyCollated:false,
  otherItalianWordsAutomaticallyInferredFromPageImage:false,
  independentlyItalianCertified:false,
  independentEnglishApproved:false,independentFrenchApproved:false,
  theologicalReviewApproved:false,sourceOwnerEdited:false,published:false
 });
}
assert.equal(rows.length,39);
assert.equal(rows.filter(r=>r.priorityVisualPassageInspectedByAssistant).length,18);
const mapped=rows.filter(r=>r.printDjvuQuestionStartPage!==null).length;
const unresolved=rows.filter(r=>r.printDjvuQuestionStartPage===null).map(r=>r.sourceQid);
const summary={
 originalOpeningCorrections:39,sourcePrintedPagesVisited:27,distinctPagesWithImageViewedByAssistant:27,
 caseQuestionPageLocatorsMapped:mapped,caseQuestionPageLocatorsUnresolved:39-mapped,
 priorityLociWithBoundedVisualInspections:18,caseWholeAnswersCertifiedViaPrintImage:0,
 externalHumanPrintCollationSignoffs:0,approvedItalian:0,approvedEnglish:0,approvedFrench:0,
 approvedTheology:0,sourceOwnerRecordsChanged:0,published:0
};
const report={
 schema:'AO_SPX_P44_39_EXACT_PRINT_PAGE_LOCATORS_18_BOUNDED_VISUAL_Loci_V1',
 asOf:'2026-10-24',status:'PAGE_LOCATORS_AND_ASSISTANT_VISUAL_NOTES_ONLY_NO_INDEPENDENT_CERTIFICATION',
 provenance:{
  edition:'Roma, Tipografia Vaticana, Compendio della dottrina cristiana 1905',
  djvu:'https://commons.wikimedia.org/wiki/File:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu',
  printPageOffset:12,segment:'Printed 192–218 corresponds to DjVu image pages 204–230',
  scanImageUrlInPage:'Every Wikisource Pagina URL includes a linked image of its printed page',
  relatedReview:'P43 first two-digital-transcription 39-case comparison',
  semanticSourceOwner:'P41 existing 39-case Italian/English/French specialist dossier'
 },
 counts:summary,
 scanPages:pages.map(({djvuPage,printedPage,pageUri,imageHref})=>({
  djvuPage,printedPage,pageUri,imageHref,imageViewedByAssistant:true,
  automationDidNotVisuallyReadTheImage:true
 })),
 records:rows,
 unresolvedLocators:unresolved,
 releaseGates:{
  noFull39VisualTextCertification:true,
  humanItalianSourceApproval:false,humanEnglishReview:false,humanFrenchReview:false,
  humanTheologicalReview:false,personalPapalQuoteApproval:false,
  existing423AvatarNodesUnchanged:true,sourceOwnerEdits:false,publication:false
 }
};
mkdirSync(root,{recursive:true});
const output=root+'SPX_P44_39_1905_Print_Page_Locator_and_18_Visual_Findings.json';
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
const esc=t=>String(t??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const detail=rows.map(r=>'<section id="'+esc(r.sourceQid)+'"><h2>'+esc(r.sourceQid)+'</h2>'+
 '<p>'+esc(r.wikisourcePrintedEditionQuestion)+'</p><p><b>Page locator:</b> '+(r.printDjvuQuestionStartPage?('printed '+r.printedQuestionStartPage+' / image '+r.printDjvuQuestionStartPage):'unresolved')+'</p>'+
 '<p>'+r.scanPageLinks.map((u,i)=>'<a href="'+esc(u)+'" target="_blank" rel="noopener">Printed page '+r.printedPageNumbers[i]+' and image</a>').join(' · ')+'</p>'+
 '<p><b>Editorial visual status:</b> '+(r.priorityVisualPassageInspectedByAssistant?'Passage inspected, no expert approval':'Page reference only, not fully collated')+'</p>'+
 (r.boundedVisualFinding?'<p>'+esc(r.boundedVisualFinding)+'</p>':'')+'</section>').join('\n');
const html='<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P1.44 1905 printed page review</title><style>body{margin:auto;max-width:1000px;padding:24px;background:#0b1119;color:#e4dfd5;font-family:Georgia,serif;line-height:1.5}h2{color:#e6c991}a{color:#aed6e6}section{padding:16px 0;border-bottom:1px solid #40505a}strong{color:#fff}</style></head><body><h1>Pius X · 1905 Printed Page Locator Desk</h1><p>39 candidate answers, '+mapped+' page locators, 18 priority passages reviewed from original page images. No expert or translation approval; no case is published. Each link opens the original printed-page image viewer.</p>'+detail+'</body></html>';
writeFileSync(root+'SPX_P44_39_1905_Print_Page_Review.html',html);
console.log('PASS P44_PAGE_LOCATOR_DESK '+JSON.stringify({...summary,unresolved}));
