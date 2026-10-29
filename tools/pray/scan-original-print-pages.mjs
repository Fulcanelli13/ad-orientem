#!/usr/bin/env node
/**
 * One-run, bounded original-PDF text-layer comparison.
 * No OCR, no paid services, and NO inference of complete printed-page certification.
 * PDFs stay in the ephemeral CI workspace. The output contains only scores,
 * source metadata, page numbers and SHA-256 (never copied complete book text).
 *
 * To repeat:
 * node tools/pray/scan-original-print-pages.mjs --self-test
 * node tools/pray/scan-original-print-pages.mjs --out /tmp/pray-print
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {NOVENA_CORPUS_V4} from '../../src/pray/novena-corpus-v4.js';
const register=JSON.parse(readFileSync(new URL('../../data/pray/original-print-witness-locators-20261029.v1.json',import.meta.url),'utf8'));
const outArg=process.argv.indexOf('--out');
const root=outArg>=0?resolve(process.argv[outArg+1]):'/tmp/pray-print';
const cohortUrls={
 callan_1925_copyright_later_scan:[
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/Blessedbegodcomp00call.pdf',
  'https://archive.org/download/blessedbegodcomp00call/blessedbegodcomp00call.pdf'
 ],
 moran_1883:[
  'https://archive.org/download/TheCatholicPrayerBook1883/TheCatholicPrayerBook1883.pdf',
  'https://archive.org/download/TheCatholicPrayerBookAndManual/TheCatholicPrayerBookAndManual.pdf',
  'https://fisheaters.com/srpdf/TheCatholicPrayerBook1883.pdf'
 ],
 hammer_1909:[
  'https://www.catholickingdom.com/s_Library/Books/M/Mary_Help_of_Christians_HAMMER_OCR_CK.pdf',
  'https://archive.org/download/MaryHelpOfChristians/MaryHelpOfChristians.pdf',
  'https://archive.org/download/maryhelpofchristi00hamm/maryhelpofchristi00hamm.pdf'
 ],
 purgatorian_manual_1894_1907:[
  'https://www.catholickingdom.com/s_Library/Books/M/Manual_of_the_Purgatorian_Society_OCR_CK.pdf'
 ]
};
const allowed=new Set(['commons.wikimedia.org','archive.org','fisheaters.com','www.catholickingdom.com']);
function sum(s){return createHash('sha256').update(s).digest('hex');}
function words(s){return String(s||'').normalize('NFKD').toLowerCase()
 .replace(/[\u0300-\u036f\u00ad\u200b]/g,'')
 .replace(/œ/g,'oe').replace(/æ/g,'ae')
 .match(/[a-z0-9]+/g)||[]}
function grams(t,n=4){const out=new Set();for(let i=0;i<=t.length-n;i++)out.add(t.slice(i,i+n).join(' '));return out;}
function score(a,b,n=4){
 const target=words(a),source=grams(words(b),n);
 if(target.length<n)return null;
 let match=0;
 for(let i=0;i<=target.length-n;i++)if(source.has(target.slice(i,i+n).join(' ')))match++;
 return Math.round(match/(target.length-n+1)*10000)/10000;
}
const lines=readFileSync(new URL('../../src/pray/novena-corpus-v4.js',import.meta.url),'utf8');
function eligibleUrl(url){const u=new URL(url);return u.protocol==='https:'&&allowed.has(u.hostname)&&u.pathname.endsWith('.pdf');}
function capture(cmd,args){try{return execFileSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:170000}).trim();}
 catch(e){return null;}}
function fetchOriginal(id,dir){
 const urls=cohortUrls[id]||[];
 for(const url of urls){
  if(!eligibleUrl(url))throw Error('Unexpected URL '+url);
  const file=join(dir,id+'.pdf');
  const ok=capture('curl',['-fL','-sS','--retry','1','--connect-timeout','18','--max-time','145','--max-filesize','85000000','-A','AdOrientem-NonCommercial-Historical-Collation/1.0','-o',file,url]);
  if(ok===null)continue;
  try{
   const st=statSync(file);
   if(st.size<10000||st.size>85000000)continue;
   const head=readFileSync(file).subarray(0,5).toString('utf8');
   if(head!=='%PDF-')continue;
   return {file,url,bytes:st.size,sha256:sum(readFileSync(file))};
  }catch{continue;}
 }
 return null;
}
function pagesFromPdf(file,id,dir){
 const out=join(dir,id+'.txt');
 if(capture('pdftotext',['-layout','-enc','UTF-8',file,out])===null)return null;
 return readFileSync(out,'utf8').split('\f').map(s=>s.trim()).filter((_,i,a)=>i<a.length-1||a[a.length-1].trim());
}
function bestPages(body,bookPages){
 const b=words(body);
 if(b.length<6)return {status:'TOO_SHORT',score:null,pdfPageStart:null,pdfPageEnd:null};
 let best={score:-1,pdfPageStart:null,pdfPageEnd:null};
 // Whole-PDF fixed windows, 1 or 2 adjacent pages only. Four-word
 // overlap is an OCR/digital screening metric, not an edition certificate.
 for(let p=0;p<bookPages.length;p++){
  const text=bookPages[p]+' '+(bookPages[p+1]||'');
  const val=score(body,text,4);
  if(val>best.score){best={score:val,pdfPageStart:p,pdfPageEnd:Math.min(p+1,bookPages.length-1)};}
 }
 if(best.score<0.08)return {status:'NO_DETECTABLE_TEXT_LAYER_MATCH',score:best.score,pdfPageStart:null,pdfPageEnd:null};
 return {...best,status:best.score>=0.8?'HIGH_PDF_TEXT_LAYER_OVERLAP':best.score>=0.5?'PARTIAL_PDF_TEXT_LAYER_OVERLAP':'LOW_PDF_TEXT_LAYER_OVERLAP'};
}
function sample(id,p,dir){
 const dest=join(dir,id+'-pdf-page-'+(p+1));
 const result=capture('pdftoppm',['-f',String(p+1),'-l',String(p+1),'-scale-to','1200','-png','-singlefile',join(dir,id+'.pdf'),dest]);
 return result===null?null:dest+'.png';
}
function selfTest(){
 assert.equal(score('O Holy Mother help us in the hour of death','Behold O Holy Mother help us in the hour of death Amen'),1);
 assert.ok(score('O Holy Mother help us in the hour of death','A different sentence regarding oceans and forests and seasons')<0.1);
 assert.equal(register.days.length,72);
 assert.deepEqual(Object.keys(cohortUrls).sort(),Object.keys(register.cohorts).sort());
 console.log('PASS original-PDF research matcher tests / 72 registered day bodies / 4 cohorts');
}
async function run(){
 mkdirSync(root,{recursive:true});
 const records=[],books=[];
 for(const [id,meta] of Object.entries(register.cohorts)){
  const original=fetchOriginal(id,root);
  if(!original){
   books.push({id,status:'NOT_RETRIEVED',urlsAttempted:cohortUrls[id],pageCount:null});
   for(const d of register.days.filter(x=>x.sourceCohort===id))records.push({id:d.id,day:d.day,cohort:id,status:'NOT_RETRIEVED',pdfPageStart:null,pdfPageEnd:null,score:null});
   continue;
  }
  const pages=pagesFromPdf(original.file,id,root);
  if(!pages||pages.length<10){
   books.push({id,status:'NO_EXTRACTABLE_PDF_PAGE_LAYER',url:original.url,sha256:original.sha256,bytes:original.bytes,pageCount:pages?.length||null});
   for(const d of register.days.filter(x=>x.sourceCohort===id))records.push({id:d.id,day:d.day,cohort:id,status:'NO_EXTRACTABLE_PDF_PAGE_LAYER',pdfPageStart:null,pdfPageEnd:null,score:null});
   continue;
  }
  books.push({id,status:'PDF_AND_TEXT_LAYER_LOADED',url:original.url,sha256:original.sha256,bytes:original.bytes,pageCount:pages.length,textNonemptyPages:pages.filter(x=>words(x).length>20).length});
  const days=register.days.filter(x=>x.sourceCohort===id);
  for(const d of days){
   const originalText=NOVENA_CORPUS_V4[d.id].days[d.day-1].text;
   const body=typeof originalText==='string'?originalText:originalText?.en;
   assert.ok(body?.length>30,d.id+' day '+d.day+' missing source text');
   records.push({id:d.id,day:d.day,cohort:id,...bestPages(body,pages)});
  }
  const samplePage=records.find(x=>x.cohort===id&&x.pdfPageStart!==null)?.pdfPageStart;
  if(Number.isInteger(samplePage))sample(id,samplePage,root);
 }
 assert.equal(records.length,72);
 const status={};for(const r of records)status[r.status]=(status[r.status]||0)+1;
 const result={
  schema:'ao.pray.original-print-pdf-text-layer-research.v1',
  createdAt:new Date().toISOString(),
  method:'Pdf files fetched free from original archive; pdftotext extraction only, four-word shingle overlap against current English prayers over two adjacent PDF pages. Not image verified or full printed text certification. Scores are not proof of same print edition.',
  books,records,counts:{programmes:8,bodyTexts:72,byStatus:status},
  certification:{originalPrintedPageImagesFullyCompared:0,printEditionWordForWordCertified:0,frenchHistoricalOriginalsCertified:0,newCurrentIndulgenceGrantsCertified:0},
  missingMoranWikisourcePages:{printedPages:[566,567],source:'https://en.wikisource.org/wiki/Index:The_Catholic_prayer_book.djvu'}
 };
 writeFileSync(join(root,'original-print-pdf-page-research.json'),JSON.stringify(result,null,2)+'\n');
 console.log('PRAYER PRINT PDF PAGE RESEARCH '+JSON.stringify({books:books.map(x=>({id:x.id,status:x.status,pages:x.pageCount,nonempty:x.textNonemptyPages})),count:result.counts,report:join(root,'original-print-pdf-page-research.json')}));
}
if(process.argv.includes('--self-test'))selfTest();else await run();
