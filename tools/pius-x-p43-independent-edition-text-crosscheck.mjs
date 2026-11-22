/**
 * P1.43: compare all 39 museum 1905 Italian source witnesses to a SECOND,
 * independently proofread digital transcription transcluded from the scanned
 * 1905 Vatican Printing Office edition at Italian Wikisource.
 *
 * This is not *visual inspection of printed facsimile pages*, nor evidence
 * of certified theological interpretation, bilingual translation or papal
 * personal authorship.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {chromium} from '@playwright/test';
const root='artifacts/pius-x-study-expanded/';
const dossier=JSON.parse(readFileSync(root+'SPX_P41_39_Italian_English_French_Specialist_Dossier.json','utf8'));
assert.equal(dossier.records.length,39);
const base='https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Catechismo_maggiore/Parte_quarta/';
const section=n=>n<=576?'Capo_II':n<=595?'Capo_III':n<=651?'Capo_IV':'Capo_V';
const chapters=[...new Set(dossier.records.map(r=>section(Number(r.sourceQid.split('Q')[1]))))];
assert.deepEqual(chapters,['Capo_II','Capo_III','Capo_IV','Capo_V']);
const normal=t=>String(t||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'')
 .replace(/\u00ad/g,'').replace(/[\u2018\u2019’]/g,"'").replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
function similarity(left,right){
 const a=normal(left),b=normal(right);
 if(a===b)return 1;
 const prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  let last=prev[0];
  prev[0]=i;
  for(let j=1;j<=b.length;j++){
   const temp=prev[j];
   prev[j]=Math.min(prev[j]+1,prev[j-1]+1,last+(a[i-1]===b[j-1]?0:1));
   last=temp;
  }
 }
 return Math.round((1-prev[b.length]/Math.max(a.length,b.length))*10000)/10000;
}
const parseLines=raw=>{
 const text=String(raw||'').replace(/\r/g,'').replace(/\u00a0/g,' ');
 const lines=text.split('\n').map(t=>t.trim()).filter(Boolean);
 const pairs=[];let current=null;let mode=null;
 for(const line of lines){
  const q=/^D\.\s*(.*)/.exec(line),a=/^R\.\s*(.*)/.exec(line);
  if(q){
   if(current?.question && current?.answer)pairs.push(current);
   current={question:q[1],answer:''};mode='question';
  }else if(a){
   if(current){current.answer=a[1];mode='answer';}
  }else if(current&&mode==='answer'&&!/^(?:§|Capo\s+[IVX]|[◄►]|[0-9]+\s*)/i.test(line)){
   // A long multi-paragraph reply (such as Mass devotional instructions)
   // may wrap. Stop only at the next question or an obvious heading.
   current.answer+=' '+line;
  }else if(current&&mode==='question'&&!/^(?:§|Capo\s+[IVX])/i.test(line)){
   current.question+=' '+line;
  }
 }
 if(current?.question&&current?.answer)pairs.push(current);
 return pairs;
};
const browser=await chromium.launch({headless:true});
const pairsByChapter=new Map(),fetches=[];
try{
 for(const ch of chapters){
  const page=await browser.newPage();
  const url=base+ch;
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  assert(response?.ok(),'External proofread Wikisource page unavailable: '+url+' / '+response?.status());
  const txt=await page.evaluate(()=>{
    const root=document.querySelector('#mw-content-text')||document.querySelector('main');
    if(!root)throw Error('Wikisource main text root not found');
    return root.innerText;
  });
  const pairs=parseLines(txt);
  assert(pairs.length>=12,'Wikisource parsed too few distinct Q&As: '+ch+' '+pairs.length);
  pairsByChapter.set(ch,pairs);
  fetches.push({chapter:ch,uri:url,httpStatus:response.status(),proofreadQuestionsParsed:pairs.length,
   textOrigin:'WIKISOURCE_TRANSCRIPTION_LINKED_TO_1905_PRINT_SCAN_NOT_VISUAL_FACSIMILE'});
  await page.close();
 }
}finally{await browser.close();}
const rows=dossier.records.map(r=>{
 const chapter=section(Number(r.sourceQid.split('Q')[1])),pool=pairsByChapter.get(chapter);
 const w=r.italianWitnesses[0];
 const scored=pool.map((p,i)=>({index:i,questionSimilarity:similarity(w.italianQuestionVerbatim,p.question),p}));
 scored.sort((a,b)=>b.questionSimilarity-a.questionSimilarity);
 const best=scored[0];
 assert(best,'No counterpart '+r.sourceQid);
 const answerSimilarity=similarity(w.safeItalianAnswerForDisplay,best.p.answer);
 const questionStatus=best.questionSimilarity>=.94?'NEAR_EXACT_NORMALIZED_QUESTION':
  best.questionSimilarity>=.73?'QUESTION_VARIANT_REVIEW':'QUESTION_IDENTITY_UNRESOLVED';
 const answerStatus=answerSimilarity>=.94?'NEAR_EXACT_NORMALIZED_ANSWER':
  answerSimilarity>=.72?'ANSWER_VARIANT_REVIEW':'ANSWER_DISCREPANCY_HOLD';
 return {
  sourceQid:r.sourceQid,chapter,originalOwnerPath:r.originalOwnerPath,
  museumDigitalUrl:r.sourceUrl,
  printedEditionScanFile:'https://commons.wikimedia.org/wiki/File:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu',
  transcribed1905WikisourceUrl:base+chapter,
  museumItalianQuestion:w.italianQuestionVerbatim,
  museumItalianAnswer:w.safeItalianAnswerForDisplay,
  wikisourceItalianQuestion:best.p.question,
  wikisourceItalianAnswer:best.p.answer,
  questionSimilarity:best.questionSimilarity,answerSimilarity,
  questionStatus,answerStatus,
  verifiedSamePhysicalPage:false,printedPageNumber:null,printPageImageInspected:false,
  independentExpertApproved:false,englishTranslationApproved:false,
  frenchTranslationApproved:false,theologyApproved:false,publicationApproved:false
 };
});
assert.equal(rows.length,39);
assert.equal(new Set(rows.map(r=>r.sourceQid)).size,39);
const counts={originalCorrectionCandidates:39,
 chapters:chapters.length,
 questionNearExact:rows.filter(r=>r.questionStatus==='NEAR_EXACT_NORMALIZED_QUESTION').length,
 questionVariant:rows.filter(r=>r.questionStatus==='QUESTION_VARIANT_REVIEW').length,
 questionUnresolved:rows.filter(r=>r.questionStatus==='QUESTION_IDENTITY_UNRESOLVED').length,
 answerNearExact:rows.filter(r=>r.answerStatus==='NEAR_EXACT_NORMALIZED_ANSWER').length,
 answerVariant:rows.filter(r=>r.answerStatus==='ANSWER_VARIANT_REVIEW').length,
 answerDiscrepancyHold:rows.filter(r=>r.answerStatus==='ANSWER_DISCREPANCY_HOLD').length,
 imagePagesVisuallyCollated:0,
 certifiedItalianSourceClaims:0,certifiedEnglishTranslations:0,certifiedFrenchTranslations:0,
 humanApprovals:0,sourceOwnerEdits:0,published:0};
const report={
 schema:'AO_SPX_P43_1905_PRINT_LINKED_PROOFREAD_TEXT_CROSSWALK_39_V1',
 asOf:'2026-10-24',
 status:'SECOND_DIGITAL_TEXT_CROSSWALK_NOT_PAGE_IMAGE_VISUAL_COLLATION_OR_CERTIFIED_SOURCE',
 primaryEdition:{title:'Compendio della dottrina cristiana',year:1905,
 printing:'Roma, Tipografia Vaticana',sourceScanDocument:'https://commons.wikimedia.org/wiki/File:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu',
 provenance:'Google Books digitization hosted by Wikimedia Commons, 434 scanned page images'},
 independentSecondText:{repository:'Italian Wikisource 1905 edition proofread transcription',
 state:'Wikisource site reports proofread and checked; not independent human reviewer for this project',
 chapterURLs:fetches.map(x=>x.uri)},
 counts,fetches,records:rows,
 sourceEditionCaveats:[
  'The Italian Wikisource transcription derives from the scanned 1905 Vatican Printing Office edition; it is a second digital textual witness, not independent historical edition authorship.',
  'Similarity matching is an automated lexical comparison, not semantic source verification or printed-page image checking.',
  'Original Museo research QIDs are editorial locators; do not claim the 1905 printed questions are numbered.',
  'Only specialist human assessment of contested readings can close a textual discrepancy.',
  'No record is publication-approved or permitted as a personal quote of St Pius X.'
 ],
 approval:{originalPageImages:false,humanItalian:false,english:false,french:false,theological:false,papalVoice:false,publication:false}
};
mkdirSync(root,{recursive:true});
const out=root+'SPX_P43_39_Museum_vs_1905_Wikisource_Italian_Parallel.json';
writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('PASS P43_WIKISOURCE_DIGITAL_CROSSWALK '+JSON.stringify({output:out,counts,fetches}));
