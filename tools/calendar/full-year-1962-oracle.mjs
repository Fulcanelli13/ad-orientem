import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const output=resolve(root,'artifacts/calendar-1962-full-year-audit.json');
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const years=[2024,2027],strict=process.argv.includes('--strict');
const disputedEvidence=JSON.parse(await readFile(new URL('../../data/calendar/1962-ordo-corrections.v1.json',import.meta.url),'utf8')).disputes;
const disputesByDate=new Map(disputedEvidence.map(x=>[x.date,x]));
const numberOfDays=y=>(new Date(Date.UTC(y+1,0,1))-new Date(Date.UTC(y,0,1)))/86400000;
const normalColour=v=>String(v||'').trim().toLowerCase().replace('purple','violet');
const simpleName=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
 .replace(/\bferia\s+(ii|iii|iv|v|vi)\b/g,(_,r)=>({ii:'monday',iii:'tuesday',iv:'wednesday',v:'thursday',vi:'friday'}[r]))
 .replace(/\bsts?\.?\b/g,'saint').replace(/\b(holy|most|blessed|the|of|our|lord|jesus|christ|saint|and|in|a|after|within|octave|day|week|commemoration|confessor|bishop|pope|virgin|martyr)\b/g,' ')
 .replace(/\b(\d+)(st|nd|rd|th)\b/g,'$1').replace(/[^a-z0-9]+/g,' ').trim();
function titleSimilarity(a,b){
 const aa=new Set(simpleName(a).split(' ').filter(Boolean)),bb=new Set(simpleName(b).split(' ').filter(Boolean));
 if(!aa.size||!bb.size)return null;
 return [...aa].filter(x=>bb.has(x)).length/Math.max(aa.size,bb.size);
}
function compare(actual,reference){
 if(!reference)return {status:'source_missing'};
 if(reference.unrecorded)return {status:'oracle_unrecorded'};
 if(!actual)return {status:'app_missing'};
 const conflicts=[],warnings=[];
 if(reference.rank&&actual.rank!=null&&reference.rank!==actual.rank)conflicts.push('class');
 if(reference.colour&&actual.colour&&!String(actual.colour).split('/').map(normalColour).includes(normalColour(reference.colour))){
  if([normalColour(reference.colour),...String(actual.colour).split('/').map(normalColour)].every(x=>['violet','rose'].includes(x)))warnings.push('optional_rose');
  else conflicts.push('colour');
 }
 const similarity=titleSimilarity(actual.title,reference.title);
 if(similarity!==null&&similarity<0.44)warnings.push('title_review');
 if(reference.commemorations!==null&&reference.commemorations!==actual.commemorations.length)warnings.push('commemoration_count_review');
 return {status:conflicts.length?'potential_liturgical_conflict':warnings.length?'needs_editorial_review':'compatible',conflicts,warnings,similarity};
}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname),file=resolve(root,'.'+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(data);
 }catch(e){res.writeHead(e?.code==='ENOENT'?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',ok);});
let browser;
const report={schema:'AO_CALENDAR_1962_FULL_YEAR_AUDIT_V1',createdAt:new Date().toISOString(),years,
 scope:'Universal 1962 Roman calendar; local propers and votive Masses excluded',
 appSource:'Pinned Missale Meum calendar engine via production DayResolver',
 independentSource:'Missale Online annual print calendar; missing records are not proof of agreement',
 secondaryReference:'https://gcatholic.org/calendar/2027/Extraordinary-en',
 method:'Compare all civil dates; rank/colour divergences flagged; title and commemoration-count differences require human review. Optional rose is a warning.',
 summaries:[],reviews:[],dayRows:[],failures:[]};
try{
 browser=await chromium.launch({headless:true});
 const app=await browser.newPage({serviceWorkers:'block'});
 await app.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded',timeout:90000});
 await app.waitForFunction(()=>Boolean(globalThis.AO_RUNTIME_V8?.resolver?.calendarEngine),null,{timeout:30000});
 const external=await browser.newPage({serviceWorkers:'block'});
 for(const year of years){
  const sourceUrl='https://missale.online/festkalender/en/'+year+'/druck';let independent=[];
  try{
   await external.goto(sourceUrl,{waitUntil:'domcontentloaded',timeout:65000});
   independent=await external.evaluate(({year,months})=>{
    const t=e=>String(e?.innerText||e?.textContent||'').replace(/\s+/g,' ').trim();
    let month=0;const rows=[];
    for(const node of document.querySelectorAll('h2,table')){
     if(node.tagName==='H2'){
      const m=months.findIndex(label=>new RegExp('^'+label+'\\s+'+year+'$','i').test(t(node)));
      if(m>=0)month=m+1;
     }else if(node.tagName==='TABLE'&&month>0){
      for(const row of node.querySelectorAll('tr')){
       const cells=[...row.querySelectorAll('td')];if(cells.length<3)continue;
       const day=Number(t(cells[0]).match(/^(\d{1,2})\b/)?.[1]);if(!day||day>31)continue;
       const label=t(cells[1]),attribute=t(cells[2]);
       const roman=attribute.match(/\b(IV|III|II|I)\.\s*(?:Kl|class)\b/i)?.[1]?.toUpperCase()||null;
       const colour=attribute.match(/\b(white|red|green|violet|rose|black|gold)\b/i)?.[1]||null;
       rows.push({date:year+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0'),
        title:label.split(/\s+Comm:\s*/i)[0].trim(),rank:roman?({I:1,II:2,III:3,IV:4})[roman]:null,
        colour,commemorations:(label.match(/\bComm:\s*/gi)||[]).length,
        unrecorded:/^No celebration recorded\b/i.test(label)});
      }
     }
    }
    return rows;
   },{year,months});
   assert.equal(independent.length,numberOfDays(year),'Calendar print page failed to yield every date');
   assert.equal(new Set(independent.map(x=>x.date)).size,numberOfDays(year),'Calendar print page contained duplicate dates');
  }catch(e){
   report.failures.push({year,stage:'independentSource',url:sourceUrl,error:String(e?.message||e)});
   report.summaries.push({year,status:'SOURCE_UNAVAILABLE',expectedDays:numberOfDays(year),sourceDays:independent.length});continue;
  }
  let resolved=[];
  try{
   resolved=await app.evaluate(async year=>{
    await globalThis.AO_RUNTIME_V8.resolver.resolveDay(String(year)+'-01-01');
    const built=await globalThis.AO_RUNTIME_V8.resolver.calendarEngine.getCalendar(year);
    return [...built.cal.entries()].map(([date,raw])=>{
     const obs=raw.celebration?.[0]||null;
     return {date,id:obs?.id||null,title:obs?.title||null,rank:obs?.rank??null,
      colour:obs?.color||null,commemorations:(raw.commemoration||[]).map(x=>x.id),
      temporale:(raw.tempora||[]).map(x=>({id:x.id,rank:x.rank,colour:x.color,title:x.title})),
      sanctorale:(raw.sancti||[]).map(x=>({id:x.id,rank:x.rank,colour:x.color,title:x.title})),
      displaced:(raw.displaced||[]).map(x=>({id:x.id,rank:x.rank,colour:x.color,title:x.title}))};
    });
   },year);
   assert.equal(resolved.length,numberOfDays(year),'App returned incomplete calendar year');
  }catch(e){
   report.failures.push({year,stage:'productionResolver',error:String(e?.message||e)});
   report.summaries.push({year,status:'APP_UNAVAILABLE',expectedDays:numberOfDays(year),sourceDays:independent.length});continue;
  }
  const oracle=new Map(independent.map(r=>[r.date,r])),appDays=new Map(resolved.map(r=>[r.date,r]));
  const tally={compatible:0,needs_editorial_review:0,potential_liturgical_conflict:0,source_disputed:0,source_adjudicated_rubrical:0,oracle_unrecorded:0,source_missing:0,app_missing:0};
  const anomalies=[];
  for(let i=0;i<numberOfDays(year);i++){
   const date=new Date(Date.UTC(year,0,i+1)).toISOString().slice(0,10),a=appDays.get(date),o=oracle.get(date);
   report.dayRows.push({date,app:a?{id:a.id,title:a.title,rank:a.rank,colour:a.colour,commemorations:a.commemorations,temporale:a.temporale,sanctorale:a.sanctorale,displaced:a.displaced}:null,
    independent:o?{title:o.title,rank:o.rank,colour:o.colour,commemorations:o.commemorations,unrecorded:o.unrecorded}:null});
   let finding=compare(a,o);
   const dispute=disputesByDate.get(date);
   if(finding.status==='potential_liturgical_conflict'&&dispute&&finding.conflicts.length===1&&
      finding.conflicts[0]===dispute.field&&normalColour(a?.colour)===normalColour(dispute.app)&&
      normalColour(o?.colour)===normalColour(dispute.firstSource)){
     finding={...finding,status:dispute.status==='ADJUDICATED_FROM_1960_RUBRICS'?'source_adjudicated_rubrical':'source_disputed',note:dispute.note,authority:dispute.authority||null};
   }
   tally[finding.status]=(tally[finding.status]||0)+1;
   if(finding.status!=='compatible')anomalies.push({date,status:finding.status,disputeNote:finding.note||null,rubricalAuthority:finding.authority||null,conflicts:finding.conflicts||[],warnings:finding.warnings||[],similarity:finding.similarity,
    app:a&&{id:a.id,title:a.title,rank:a.rank,colour:a.colour,commemorationCount:a.commemorations.length},
    independent:o&&{title:o.title,rank:o.rank,colour:o.colour,commemorationCount:o.commemorations},source:sourceUrl});
  }
  report.reviews.push(...anomalies);
  report.summaries.push({year,status:'AUDITED_NOT_CERTIFIED',expectedDays:numberOfDays(year),sourceDays:independent.length,
   classComparable:independent.filter(x=>x.rank!==null).length,colourComparable:independent.filter(x=>Boolean(x.colour)).length,
   tally,source:sourceUrl});
  console.log('1962_FULL_YEAR '+year+' '+JSON.stringify(report.summaries.at(-1)));
  console.log('POTENTIAL_CONFLICTS '+year+' '+JSON.stringify(anomalies.filter(x=>x.status==='potential_liturgical_conflict').slice(0,25)));
 }
}finally{
 await mkdir(resolve(root,'artifacts'),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
 await browser?.close();await new Promise(ok=>server.close(ok));
}
console.log('Audit JSON: '+output);
if(report.failures.length)process.exitCode=2;
if(strict&&report.reviews.some(x=>x.status==='potential_liturgical_conflict'))process.exitCode=3;
