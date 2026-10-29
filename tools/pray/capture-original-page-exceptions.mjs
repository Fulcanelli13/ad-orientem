#!/usr/bin/env node
/**
 * Bounded two-book original-page exception review.
 * Pulls only Hammer and Holy Souls historical PDFs, checks exact known SHA256,
 * renders each of ten partial-match prayer page windows for editorial review,
 * and saves the source PDF text layer + current app body in a TEMPORARY CI artifact.
 * DOES NOT auto-promote or change any prayer and DOES NOT claim print certification.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {NOVENA_CORPUS_V4} from '../../src/pray/novena-corpus-v4.js';

const dir=resolve(process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:'/tmp/pray-print-exceptions');
const manifest=JSON.parse(readFileSync(new URL('../../data/pray/original-pdf-72-day-text-layer-screen-20261029.v1.json',import.meta.url)));
const bookIds=['hammer_1909','purgatorian_manual_1894_1907'];
const exceptions=manifest.partialExceptionDays;
const urls={
 hammer_1909:'https://www.catholickingdom.com/s_Library/Books/M/Mary_Help_of_Christians_HAMMER_OCR_CK.pdf',
 purgatorian_manual_1894_1907:'https://www.catholickingdom.com/s_Library/Books/M/Manual_of_the_Purgatorian_Society_OCR_CK.pdf'
};
function run(cmd,args,timeout=160000){return execFileSync(cmd,args,{stdio:['ignore','pipe','pipe'],timeout,encoding:'utf8'});}
function sha256(buffer){return createHash('sha256').update(buffer).digest('hex');}
function normalize(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]+/g)||[];}
function overlap(a,b,n=4){const text=normalize(a),pdf=normalize(b),base=new Set();for(let i=0;i<=pdf.length-n;i++)base.add(pdf.slice(i,i+n).join(' '));let yes=0;for(let i=0;i<=text.length-n;i++)if(base.has(text.slice(i,i+n).join(' ')))yes++;return yes/(text.length-n+1);}
function selfTest(){
 assert.equal(manifest.partialExceptionDays.length,10);
 assert.equal(exceptions.filter(x=>x.cohort==='hammer_1909').length,5);
 assert.equal(exceptions.filter(x=>x.cohort==='purgatorian_manual_1894_1907').length,5);
 assert.ok(overlap('Our Lord and Savior Jesus Christ hear our humble prayer','Lord and Savior Jesus Christ hear our humble prayer forever')>0.6);
 console.log('PASS 10 historical partial-match prayer windows; precisely two original-source cohorts');
}
function collect(){
 mkdirSync(dir,{recursive:true});
 const bookDetails=[],all=[];
 for(const id of bookIds){
  const item=manifest.books.find(x=>x.id===id),pdf=join(dir,id+'.pdf'),txt=join(dir,id+'.txt');
  assert.ok(item&&item.url===urls[id]);
  run('curl',['-fLsS','--retry','2','--connect-timeout','20','--max-time','130','--max-filesize','85000000','-o',pdf,item.url]);
  const bytes=readFileSync(pdf);
  assert.equal(bytes.subarray(0,5).toString('ascii'),'%PDF-');
  assert.equal(sha256(bytes),item.sha256,'Source PDF changed! Never silently compare a revised scan');
  run('pdftotext',['-layout','-enc','UTF-8',pdf,txt]);
  const ps=readFileSync(txt,'utf8').split('\f');
  const pageCount=ps[ps.length-1].trim()===''?ps.length-1:ps.length;
  assert.equal(pageCount,item.pageCount,'Unexpected PDF pagination / edition');
  const selected=manifest.records.filter(x=>x.cohort===id&&x.match==='PARTIAL_TEXT_LAYER_OVERLAP');
  assert.equal(selected.length,5);
  bookDetails.push({id,url:item.url,sha256:item.sha256,pdfPages:pageCount});
  for(const r of selected){
   const key=r.id+'-day'+r.day;
   const body=NOVENA_CORPUS_V4[r.id].days[r.day-1].text?.en;
   assert.ok(body?.length>100,key+' no canonical English body');
   const pages=[];
   for(let p=r.pdfPageStart;p<=r.pdfPageEnd;p++){
    const base=join(dir,key+'-page'+(p+1));
    run('pdftoppm',['-f',String(p+1),'-l',String(p+1),'-scale-to','1800','-png','-singlefile',pdf,base]);
    assert.ok(existsSync(base+'.png'));
    pages.push({pdfPageZeroBased:p,printedPageCitation:null,previewFile:key+'-page'+(p+1)+'.png',text:ps[p]||''});
   }
   const sourceText=pages.map(x=>x.text).join(' ');
   const ratio=overlap(body,sourceText);
   all.push({id:r.id,day:r.day,cohort:id,listedOverlapBasisPoints:r.overlapBasisPoints,recomputedOverlapBasisPoints:Math.round(ratio*10000),canonicalText:body,sourcePages:pages,sourcePdfHash:item.sha256});
  }
 }
 assert.equal(all.length,10);
 const result={schema:'ao.pray.original-page-exception-visual-capture.v1',createdAt:new Date().toISOString(),scope:'10_PARTIAL_MATCH_DAYS',books:bookDetails,exceptions:all,
  certification:{newFullFacsimileCertificates:0,autoCorrections:0},
  instructions:'Inspect the PNG source images against entire canonical English prayer; OCR text is a convenience only, not an independent proof. Keep original images temporary. Record verified differences and page status in Git; never import OCR as source of truth.'};
 writeFileSync(join(dir,'exception-review.json'),JSON.stringify(result,null,2)+'\n');
 console.log('PASS rendered '+all.reduce((n,x)=>n+x.sourcePages.length,0)+' original scanned page images for 10 exception prayer bodies; '+JSON.stringify(all.map(x=>({id:x.id,day:x.day,pdfPageStart:x.sourcePages[0].pdfPageZeroBased,ratio:x.recomputedOverlapBasisPoints}))));
}
if(process.argv.includes('--self-test'))selfTest();else collect();
