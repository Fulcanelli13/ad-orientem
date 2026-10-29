#!/usr/bin/env node
/**
 * Bulk ORIGINAL-PAGE review for the 62 remaining high-PDF-overlap Novena days.
 *
 * This scans the 4 previously checksum-pinned source PDFs, builds an
 * image-backed per-day original page review package, and compares 62 current
 * English day texts against printed-book PDF text layers.
 *
 * Screens do NOT equal print certification. All visual checks default false.
 * No prayer text or historical source files are automatically modified.
 */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,statSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {NOVENA_CORPUS_V4} from '../../src/pray/novena-corpus-v4.js';

const q=process.argv;
const root=resolve(q.includes('--out')?q[q.indexOf('--out')+1]:'/tmp/pray-original-62');
const prior=JSON.parse(readFileSync(new URL('../../data/pray/original-pdf-72-day-text-layer-screen-20261029.v1.json',import.meta.url),'utf8'));
const target=prior.records.filter(x=>x.match==='HIGH_TEXT_LAYER_OVERLAP');
const failed=prior.records.filter(x=>x.match!=='HIGH_TEXT_LAYER_OVERLAP');
const SHA=b=>createHash('sha256').update(b).digest('hex');
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const books=new Map(prior.books.map(b=>[b.id,b]));
const ALLOWED=['commons.wikimedia.org','archive.org','www.catholickingdom.com'];

function tokens(s){
 return String(s||'').normalize('NFKD').toLowerCase()
  .replace(/[\u0300-\u036f\u00ad\u200b]/g,'')
  .replace(/[‐‑‒–—]/g,'-')
  .replace(/([a-z])-\s+([a-z])/g,'$1$2')
  .replace(/œ/g,'oe').replace(/æ/g,'ae').match(/[a-z0-9]+/g)||[];
}
function gramMap(list,n){
 const m=new Map();
 for(let j=0;j+n<=list.length;j++){
  const k=list.slice(j,j+n).join(' ');
  let a=m.get(k);if(!a)m.set(k,a=[]);
  a.push(j);
 }
 return m;
}
function compare(body,printText){
 const a=tokens(body),b=tokens(printText),n=4,map=gramMap(b,n);
 let hit=0;const gapWords=new Set();
 for(let i=0;i+n<=a.length;i++){
  if(map.has(a.slice(i,i+n).join(' ')))hit++;
  else for(let j=i;j<i+n;j++)gapWords.add(j);
 }
 const shingleTotal=Math.max(0,a.length-n+1);
 const coverage=shingleTotal?Math.round(hit/shingleTotal*10000):null;
 const first=Array.from({length:Math.min(20,a.length-3)},(_,i)=>i)
  .map(i=>({i,positions:map.get(a.slice(i,i+n).join(' '))||[]}))
  .find(x=>x.positions.length);
 const last=Array.from({length:Math.min(20,a.length-3)},(_,i)=>a.length-n-i)
  .map(i=>({i,positions:map.get(a.slice(i,i+n).join(' '))||[]}))
  .find(x=>x.positions.length);
 const passages=[];
 if(gapWords.size){
  const indices=[...gapWords].sort((x,y)=>x-y);
  let from=indices[0],end=from;
  for(let i=1;i<=indices.length;i++){
   if(i<indices.length && indices[i]<=end+1){end=indices[i];continue;}
   const start=clamp(from-5,0,a.length),finish=clamp(end+6,0,a.length);
   passages.push({from,to:end,appContext:a.slice(start,finish).join(' '),
      spanWords:end-from+1});
   if(i<indices.length){from=indices[i];end=from;}
  }
 }
 return {
  appWordCount:a.length,sourceWindowWords:b.length,
  fourWordOverlapBasisPoints:coverage,
  sourceFirstAnchorToken:first?.positions?.[0]??null,
  sourceLastAnchorToken:last?.positions?.[0]??null,
  beginsNearSourceStart:!!first&&first.i<=12,
  endsNearSourceEnd:!!last&&last.i>=a.length-24,
  suspectGapRuns:passages.length,
  suspectContexts:passages.slice(0,15),
  gapWords:gapWords.size,
  status:coverage>=9500?'VERY_HIGH_OVERLAP_WITH_PDF_LAYER':
    coverage>=8000?'HIGH_OVERLAP_WITH_PDF_LAYER':'RECHECK_WINDOW_OR_EDITION'
 };
}
function call(cmd,args,max=150000){
 return execFileSync(cmd,args,{stdio:['ignore','pipe','pipe'],timeout:max,encoding:'utf8'});
}
function getPdf(book){
 const u=new URL(book.url);
 assert.equal(u.protocol,'https:');
 assert.ok(ALLOWED.includes(u.hostname),'Untrusted source '+u.hostname);
 const dest=join(root,book.id+'.pdf');
 call('curl',['-fL','-sS','--retry','1','--connect-timeout','20','--max-time','145','--max-filesize','85000000','-o',dest,book.url]);
 const bytes=readFileSync(dest);
 assert.ok(bytes.subarray(0,5).toString('ascii')==='%PDF-');
 assert.equal(SHA(bytes),book.sha256,'Original book scan changed; stop rather than silently rebase '+book.id);
 return dest;
}
function pdfPages(pdf,id){
 const f=join(root,id+'.txt');
 call('pdftotext',['-layout','-enc','UTF-8',pdf,f]);
 const full=readFileSync(f,'utf8').split('\f');
 return full.at(-1).trim()?full:full.slice(0,-1);
}
function draw(pdf,index,out){
 call('pdftoppm',['-f',String(index+1),'-l',String(index+1),'-scale-to','1550','-png','-singlefile',pdf,out]);
 assert.ok(existsSync(out+'.png'));
 return out+'.png';
}
function h(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function html(items){
 const cards=items.map(v=>{
  const text=NOVENA_CORPUS_V4[v.id].days[v.day-1].text.en;
  const images=v.imageFiles.map(i=>'<img loading="lazy" src="'+encodeURIComponent(i)+'" alt="Source page" />').join('');
  const gaps=v.suspectContexts.map(p=>'<li>'+h(p.appContext)+'</li>').join('');
  return '<article><header><h2>'+h(v.id)+' · Day '+v.day+'</h2><span>'+v.fourWordOverlapBasisPoints/100+'% text-layer</span><span>'+v.status+'</span></header>'
  +'<p class="source">'+h(v.cohort)+' · PDF indices '+v.pdfPageStart+'–'+v.pdfPageEnd+'</p>'
  +'<div class="reading"><div class="images">'+images+'</div><section><h3>Current English prayer</h3><p class="prayer">'+h(text)+'</p>'
  +'<h3>Automated gaps (OCR or editorial difference; not yet verified)</h3><ol>'+gaps+'</ol></section></div></article>';
 }).join('');
 return '<!DOCTYPE html><html lang="en"><meta charset="utf-8"><title>Ad Orientem · 62 Novena original-page audit</title>'
 +'<style>body{margin:0;font:15px system-ui;background:#f4f3ed;color:#17222b}main{max-width:1400px;margin:auto;padding:24px}h1{font:34px Georgia}article{background:#fff;border:1px solid #b7bec4;border-radius:10px;margin:24px 0;padding:16px;break-inside:avoid}header{display:flex;gap:20px;align-items:baseline;flex-wrap:wrap}h2{font:24px Georgia;margin:4px 0}.source{font-size:12px;color:#52616a}.reading{display:grid;grid-template-columns:minmax(0,55%) minmax(0,45%);gap:16px}.images img{max-width:100%;width:100%;height:auto;margin-bottom:10px}.prayer{white-space:pre-wrap;font:18px/1.55 Georgia}ol{font-size:13px;color:#81483a}@media(max-width:760px){.reading{grid-template-columns:1fr}main{padding:8px}}</style>'
 +'<main><h1>Novena: 62 remaining printed-page witnesses</h1><p>Page images are actual historical scans. Reported gaps originate from the existing PDF text layer; visually verify before correcting. ZERO automatic printed-facsimile certifications.</p>'+cards+'</main></html>';
}
function selfTest(){
 assert.equal(target.length,62,'Prior high-overlap population drift');
 assert.equal(failed.length,10,'Previously reviewed ten exceptions drift');
 assert.equal(books.size,4);
 const r=compare('O Holy Mother help us in the hour of death','Dear child. O Holy Mother help us in the hour of death. Amen.');
 assert.equal(r.fourWordOverlapBasisPoints,10000);
 const s=compare('O Holy Mother help us in the hour of death','O Holy Mother help us in the hour of eternity');
 assert.ok(s.fourWordOverlapBasisPoints<10000);
 console.log('PASS 62 original-PDF high-match days, ten separately reviewed outliers, gap detection and four SHA-pinned book sources');
}
async function execute(){
 mkdirSync(root,{recursive:true});
 const records=[],sourceInfo=[],uniquePages=new Set();
 for(const [id,book] of books){
  const pdf=getPdf(book),pages=pdfPages(pdf,id);
  assert.equal(pages.length,book.pageCount,'PDF pagination changed '+id);
  const cohort=target.filter(x=>x.cohort===id);
  for(const t of cohort){
   const body=NOVENA_CORPUS_V4[t.id].days[t.day-1].text.en;
   assert.ok(body.length>25);
   const window=pages.slice(t.pdfPageStart,t.pdfPageEnd+1).join(' ');
   const diff=compare(body,window);
   const images=[];
   for(let idx=t.pdfPageStart;idx<=t.pdfPageEnd;idx++){
    const key=id+'/'+idx,out=join(root,id+'-p'+(idx+1));
    if(!uniquePages.has(key)){draw(pdf,idx,out);uniquePages.add(key);}
    images.push(id+'-p'+(idx+1)+'.png');
   }
   records.push({id:t.id,day:t.day,cohort:id,pdfSha256:book.sha256,pdfPageStart:t.pdfPageStart,
    pdfPageEnd:t.pdfPageEnd,appSha256:SHA(body),imageFiles:images,...diff,
    visualLineByLineCertified:false,printEditionCertified:false});
  }
  sourceInfo.push({id,sha256:book.sha256,pages:pages.length,days:cohort.length,sourceUrl:book.url});
 }
 assert.equal(records.length,62);
 const summary={originalBookCount:sourceInfo.length,prayerBodies:records.length,
  uniquePrintedPageImages:uniquePages.size,veryHigh:records.filter(x=>x.status==='VERY_HIGH_OVERLAP_WITH_PDF_LAYER').length,
  high:records.filter(x=>x.status==='HIGH_OVERLAP_WITH_PDF_LAYER').length,
  recheck:records.filter(x=>x.status==='RECHECK_WINDOW_OR_EDITION').length,
  visualCertifications:0,fullPrintCertificates:0};
 const result={schema:'ao.pray.original-print-62-bulk-visual-review.v1',
  generatedAt:new Date().toISOString(),sourceManifest:'data/pray/original-pdf-72-day-text-layer-screen-20261029.v1.json',
  method:'Four original hash-pinned PDFs, actual rendered source page images for all 62; four-word comparisons across selected PDF text-layer windows; zero automatic visual or print certification.',
  books:sourceInfo,summary,records};
 writeFileSync(join(root,'bulk-62-review.json'),JSON.stringify(result,null,2)+'\n');
 writeFileSync(join(root,'bulk-62-printed-page-review.html'),html(records));
 console.log('PRAY 62 PRINT PAGE BATCH '+JSON.stringify(summary));
 console.log('GAPS '+JSON.stringify(records.filter(x=>x.suspectGapRuns>0).map(x=>({id:x.id,day:x.day,score:x.fourWordOverlapBasisPoints,gaps:x.suspectGapRuns,first:x.suspectContexts?.[0]?.appContext}))));
}
if(q.includes('--self-test'))selfTest();else await execute();
