// Independent printed-Missal incipit probe.  All samples and PDF page pointers
// come from a 1962 typica facsimile transcription, NOT the app's data owners.
// No OCR-only result is described as a visually certified facsimile match.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const source=JSON.parse(await readFile(resolve(root,"data/mass/printed-1962-july-facsimile-b01.v1.json"),"utf8"));
const strict=process.argv.includes("--strict");
assert.equal(source.cases.length,9,"printed 1962 sample lost a registered observance");
assert.equal(source.cases.reduce((n,row)=>n+row.assertions.length,0),30,"printed 1962 sample lost a page-cited assertion");
const dates=new Set(),sourcePages=new Set();
for(const item of source.cases){
  assert.ok(!dates.has(item.date),"duplicate sample day: "+item.date);
  dates.add(item.date);
  assert.match(item.date,/^20\d\d-07-\d\d$/);
  assert.ok(Number.isInteger(item.rank)&&item.rank>=1&&item.rank<=4);
  for(const proof of item.assertions){
    assert.ok(proof.page>=1&&proof.page<=11,"page pointer outside actual sample");
    assert.equal(proof.pdfUrl,source.witness.url+"#page="+proof.page);
    assert.ok(item.pdfPages.includes(proof.page),"proof points outside the feast's PDF page range");
    assert.ok(proof.latinIncipit.length>=13,"insufficiently distinctive independent Latin incipit");
    sourcePages.add(proof.page);
  }
}
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const loc=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+loc);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
const report={schema:"AO_PRINTED_1962_JULY_B01_PROBE_V1",witness:source.witness,comparisonType:"printed-transcription-versus-assembled-runtime-Latin",visualFacsimileInspected:false,strict,sourceCases:9,sourceProbes:30,pdfPages:[...sourcePages].sort((a,b)=>a-b),results:[],summary:{}};
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:45000});
  for(const item of source.cases){
    const actual=await page.evaluate(async date=>{
      const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
      const p=r?.proper?.data;
      return {status:r?.status,error:r?.error||null,rank:r?.day?.main?.rank??null,
        title:r?.day?.main?.title||null,sourcePath:p?.sourcePath||null,
        commemorations:p?.calendarCommemorations?.map(v=>({sourcePath:v.prayerSourcePath||v.path,name:v.name}))||[],
        fields:{collect:(p?.collects||[]).map(z=>z.lat||""),
          epistle:p?.epistle?.lat||"",gospel:p?.gospel?.lat||"",communion:p?.communion?.lat||""}};
    },item.date);
    const fold=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
      .replace(/æ/g,"ae").replace(/Æ/g,"Ae").replace(/œ/g,"oe").replace(/Œ/g,"Oe")
      .toLowerCase().replace(/j/g,"i").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
    const checks=item.assertions.map(proof=>{
      const value=proof.field==="collect"
        ? actual.fields.collect[proof.index]||"" : actual.fields[proof.field]||"";
      const normalized=fold(value),expected=fold(proof.latinIncipit);
      const matched=normalized.includes(expected);
      return {field:proof.field,index:proof.index,printedPage:proof.page,
        expectedLatinIncipit:proof.latinIncipit,matched,actualExcerpt:value.slice(0,155),
        result:!value?"missing-runtime-text":matched?"transcription-incipit-agrees":"potential-text-discrepancy"};
    });
    const rankAgree=actual.rank===item.rank;
    const sourceAgree=!item.proper||actual.sourcePath===item.proper;
    const commemorationAgree=!item.commemorationSource
      ||actual.commemorations.some(x=>x.sourcePath===item.commemorationSource);
    const result={date:item.date,printedObservance:item.observance,
      pdfPages:item.pdfPages,expectedRank:item.rank,expectedSourcePath:item.proper,
      runtime:{status:actual.status,error:actual.error,rank:actual.rank,title:actual.title,
        sourcePath:actual.sourcePath,commemorations:actual.commemorations},
      rankAgree,sourceAgree,commemorationAgree,checks,
      outcome:actual.status!=="ready"?"runtime-unresolved":
        !rankAgree||!sourceAgree||!commemorationAgree||checks.some(z=>!z.matched)?"review-discrepancy":
        "transcription-level-agreement-visual-unchecked"};
    report.results.push(result);
    console.log("PRINTED_1962_JULY_SAMPLE "+JSON.stringify({date:item.date,
      owner:actual.sourcePath,rank:actual.rank,outcome:result.outcome,
      missed:checks.filter(z=>!z.matched).map(z=>z.field+" "+z.index)}));
  }
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
const counts=report.results.reduce((a,v)=>(a[v.outcome]=(a[v.outcome]||0)+1,a),{});
report.summary={...counts,agreeingChecks:report.results.flatMap(z=>z.checks).filter(z=>z.matched).length,
  allProbes:30,unverifiedVisualSource:true,
  notCertified:"An OCR/extracted-text agreement cannot be treated as a printed 1962 facsimile image verification."};
const path=resolve(root,"artifacts/mass-printed-1962-july-facsimile-b01.json");
await mkdir(resolve(root,"artifacts"),{recursive:true});
await writeFile(path,JSON.stringify(report,null,2)+"\n");
console.log("PRINTED_1962_JULY_SUMMARY "+JSON.stringify(report.summary));
console.log("Saved independent witness/proper comparisons: "+path);
if(strict&&report.results.some(r=>r.outcome!=="transcription-level-agreement-visual-unchecked"))process.exitCode=2;
