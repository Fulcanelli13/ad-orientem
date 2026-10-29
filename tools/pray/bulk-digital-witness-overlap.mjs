#!/usr/bin/env node
/**
 * One-shot, READ-ONLY live digital witness overlap audit.
 * This is NOT an original-print facsimile collation or editorial certification.
 * No witness words, protected original pages, or translations are copied to the report.
 *
 * Usage:
 *   node tools/pray/bulk-digital-witness-overlap.mjs --self-test
 *   node tools/pray/bulk-digital-witness-overlap.mjs --out /tmp/pray-novena-witness-scan.json
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {NOVENA_CORPUS_V4} from '../../src/pray/novena-corpus-v4.js';

const readJson = p => JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const review=readJson('../../data/pray/novena-source-review.v3.json');
const q=process.argv;
const output=q.includes('--out')?q[q.indexOf('--out')+1]:null;
const sha=s=>createHash('sha256').update(s).digest('hex');
const allowed=new Set([
 'en.wikisource.org','www.gutenberg.org','www.ecatholic2000.com',
 'www.ewtn.com','www.pamphlets.info','laportelatine.org',
 'www.liberius.net'
]);
const namedEntities={amp:'&',quot:'"',apos:"'",nbsp:' ',ldquo:'"',rdquo:'"',lsquo:"'",rsquo:"'",ndash:'-',mdash:'-',hellip:'...',eacute:'é',agrave:'à',uuml:'ü',oelig:'œ',aelig:'æ',lt:'<',gt:'>'};
function decodeEntities(s){
 return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi,(_m,k)=>{
  const v=k.toLowerCase();
  if(v[0]==='#'){
   const n=v[1]==='x'?parseInt(v.slice(2),16):parseInt(v.slice(1),10);
   return Number.isFinite(n)&&n>0&&n<=0x10ffff?String.fromCodePoint(n):' ';
  }
  return namedEntities[v]??' ';
 });
}
function htmlText(s){
 const noNoise=s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
  .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,' ')
  .replace(/<!--[\s\S]*?-->/g,' ');
 return decodeEntities(noNoise.replace(/<[^>]*>/g,' '));
}
function tokens(s){
 const n=String(s||'').normalize('NFKD').toLowerCase()
  .replace(/[\u0300-\u036f\u00ad\u200b]/g,'')
  .replace(/[æœ]/g,m=>m==='æ'?'ae':'oe')
  .replace(/[‘’´]/g,"'")
  .replace(/[\u00a0]/g,' ');
 return n.match(/[a-z0-9]+/g)||[];
}
function shingles(t,n=7){
 const out=new Set();
 for(let i=0;i<=t.length-n;i++)out.add(t.slice(i,i+n).join(' '));
 return out;
}
function overlap(body,sourceTokens,sourceShingles){
 const target=tokens(body);
 if(target.length<8)return {wordCount:target.length,share:null,label:'INSUFFICIENT_LENGTH'};
 const n=7,s=sourceShingles||shingles(sourceTokens,n);
 let matched=0;
 for(let i=0;i<=target.length-n;i++){
  if(s.has(target.slice(i,i+n).join(' ')))matched++;
 }
 const share=Number((matched/(target.length-n+1)).toFixed(4));
 return {wordCount:target.length,share,label:share>=0.9?'HIGH_DIGITAL_OVERLAP':share>=0.6?'PARTIAL_DIGITAL_OVERLAP':'LOW_DIGITAL_OVERLAP'};
}
function english(x){
 if(typeof x==='string')return x;
 return x&&typeof x.en==='string'?x.en:'';
}
function rows(){
 const out=[];
 for(const entry of review.records){
  const p=NOVENA_CORPUS_V4[entry.id];
  assert.ok(p,'Missing canonical novena: '+entry.id);
  assert.equal(p.form,entry.form,'Source form changed: '+entry.id);
  const page=entry.url;
  if(entry.form==='DAY_SPECIFIC'){
   assert.equal(p.days.length,9,'Unexpected day count '+entry.id);
   for(let i=0;i<9;i++){
    const d=english(p.days[i].text);
    assert.ok(d.length>30,'Missing English historical day body '+entry.id+' '+(i+1));
    const dayWitness=entry.dayBodySourceReview?.[i];
    const sourceUrl=dayWitness?.url||dayWitness?.sourceUrl||page;
    out.push({id:entry.id,segment:'day_'+(i+1),sourceUrl,body:d});
   }
  }else{
   const repeat=english(p.repeatText);
   assert.ok(repeat.length>30,'Missing repeat prayer '+entry.id);
   out.push({id:entry.id,segment:'repeat_prayer',sourceUrl:page,body:repeat});
  }
  for(const k of ['opening','churchPrayer','ejaculation','sharedClosingText']){
   const body=english(p[k]);
   if(body.length>30)out.push({id:entry.id,segment:k,sourceUrl:page,body});
  }
 }
 return out;
}
async function obtain(url){
 const u=new URL(url);
 if(u.protocol!=='https:'||!allowed.has(u.hostname))return {status:'DOMAIN_NOT_ALLOWED'};
 if(/\.pdf(?:$|\?)/i.test(u.pathname))return {status:'PDF_REQUIRES_FACSIMILE_REVIEW'};
 try{
  const signal=AbortSignal.timeout(17000);
  const res=await fetch(url,{headers:{'User-Agent':'AdOrientemSourceResearch/1.0 (non-commercial historical liturgical collation)','Accept':'text/html,text/plain'},signal,redirect:'follow'});
  if(!res.ok)return {status:'HTTP_'+res.status};
  if(!['text/html','text/plain','application/xhtml+xml'].some(t=>(res.headers.get('content-type')||'').includes(t)))return {status:'NON_TEXT_CONTENT'};
  const buf=Buffer.from(await res.arrayBuffer());
  if(buf.length>2500000)return {status:'SOURCE_TOO_LARGE'};
  const html=buf.toString('utf8');
  const text=htmlText(html);
  const ts=tokens(text);
  if(ts.length<100)return {status:'INSUFFICIENT_SOURCE_TEXT',textSha256:sha(html),sourceWords:ts.length};
  return {status:'FETCHED',textSha256:sha(html),sourceWords:ts.length,shingleSet:shingles(ts),sourceTokens:ts};
 }catch(error){return {status:'FETCH_FAILED',errorClass:error?.name||'Error'};}
}
async function run(){
 const all=rows();
 assert.equal(all.filter(x=>x.segment.startsWith('day_')).length,72);
 assert.equal(all.filter(x=>x.segment==='repeat_prayer').length,8);
 const urls=[...new Set(all.map(x=>x.sourceUrl))];
 const found=new Map();
 // Low-volume bounded external requests: no paid search, API token, or scraping of PDFs.
 for(let i=0;i<urls.length;i+=3){
  const results=await Promise.all(urls.slice(i,i+3).map(obtain));
  results.forEach((v,j)=>found.set(urls[i+j],v));
 }
 const records=all.map(r=>{
  const f=found.get(r.sourceUrl);
  const base={
   id:r.id,segment:r.segment,url:r.sourceUrl,
   bodySha256:sha(r.body),bodyCharacters:r.body.length,
   sourceFetchStatus:f.status,
   sourceHtmlSha256:f.textSha256||null
  };
  if(f.status!=='FETCHED')return {...base,wordCount:tokens(r.body).length,overlap:null,decision:'NO_DIGITAL_COMPARISON'};
  const result=overlap(r.body,f.sourceTokens,f.shingleSet);
  const englishOnFrenchPage=['christ_the_king','st_michael'].includes(r.id);
  return {...base,wordCount:result.wordCount,overlap:result.share,
   decision:englishOnFrenchPage?'CROSS_LANGUAGE_NOT_EVALUABLE':result.label};
 });
 const tally={};
 for(const r of records)tally[r.decision]=(tally[r.decision]||0)+1;
 const sourceTally={};
 for(const u of urls){const k=found.get(u).status;sourceTally[k]=(sourceTally[k]||0)+1}
 const report={
  schema:'ao.pray.digital-witness-overlap.v1',
  generatedAt:new Date().toISOString(),
  method:'seven-word contiguous token shingles against digital HTML witness; overlap is a research screen, not a verbatim printed-page proof',
  canonicalSource:'src/pray/novena-corpus-v4.js',
  baseline:'data/pray/novena-source-review.v3.json',
  uniquePrograms:review.records.length,
  dayBodies:72,repeatFormBodies:8,
  sourceUrls:urls.length,
  summary:{byDecision:tally,bySourceFetch:sourceTally},
  sourceDetails:urls.map(url=>({url,status:found.get(url).status,htmlSha256:found.get(url).textSha256||null,words:found.get(url).sourceWords||null})),
  records,
  certification:{printedEditionFullCollationsAdded:0,frenchOriginalCertificationsAdded:0,indulgenceGrantsCertified:0}
 };
 if(output)writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 process.stdout.write('PRAYER DIGITAL WITNESS SCAN '+JSON.stringify({programs:report.uniquePrograms,day:report.dayBodies,repeat:report.repeatFormBodies,urlCount:report.sourceUrls,summary:report.summary,reportPath:output})+'\n');
 return report;
}
function selfTest(){
 const p='O Mary, pray for us today with faith and hope. Mother of grace pray for us forever.';
 const q='Foreword. O Mary, pray for us today with faith and hope. Mother of grace pray for us forever. Conclusion.';
 const score=overlap(p,tokens(q));
 assert.equal(score.label,'HIGH_DIGITAL_OVERLAP');
 assert.equal(score.share,1);
 const bad=overlap('The horses and rivers ran beneath the distant mountain at sunrise',tokens(q));
 assert.equal(bad.label,'LOW_DIGITAL_OVERLAP');
 assert.equal(rows().filter(x=>x.segment.startsWith('day_')).length,72);
 assert.equal(rows().filter(x=>x.segment==='repeat_prayer').length,8);
 process.stdout.write('PASS 16 novenas, 72 day texts, eight repeat forms and overlap controls\n');
}
if(q.includes('--self-test'))selfTest();
else await run();
