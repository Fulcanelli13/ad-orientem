// Batch B02: independent 1962 Latin/English Sunday booklet crosswalk.
// This does not claim image-level collation with the Vatican typica facsimile.
// Each incipit was transcribed from the independently published PDF listed in
// data/mass/independent-1962-lent-sundays-b02.v1.json, not from app code.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const data=JSON.parse(await readFile(resolve(root,"data/mass/independent-1962-lent-sundays-b02.v1.json"),"utf8"));
const strict=process.argv.includes("--strict");
const expected={forms:5,dates:10,proofs:29,observations:58};
assert.equal(data.cases.length,expected.forms);
const byDate=new Set();
let proofCount=0,obsCount=0;
for(const c of data.cases){
  assert.match(c.owner,/^Tempora\/Quad[12456]-0r?$/);
  assert.equal(c.rank,1);
  assert.equal(c.dates.length,2);
  assert.ok(c.proofs.length>=5);
  for(const date of c.dates){
    assert.match(date,/^202[47]-0[23]-\d\d$/);
    assert.ok(!byDate.has(date),"same date assigned twice: "+date);
    byDate.add(date);
  }
  for(const proof of c.proofs){
    assert.ok(["introit","collect","epistle","gospel","communion","postcommunion"].includes(proof.field));
    assert.ok(proof.latinIncipit.length>=20,"non-distinct independent Latin witness");
    assert.ok(Number.isInteger(proof.page)&&proof.page>=1&&proof.page<=c.pdf.pages);
    assert.equal(proof.url,c.pdf.url+"#page="+proof.page);
  }
  proofCount+=c.proofs.length;
  obsCount+=c.proofs.length*c.dates.length;
}
assert.equal(byDate.size,expected.dates);
assert.equal(proofCount,expected.proofs);
assert.equal(obsCount,expected.observations);

function fold(input){
  return String(input||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[æÆ]/g,"ae").replace(/[œŒ]/g,"oe").toLowerCase()
    .replace(/j/g,"i").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
}
const contentTypes={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",
 ".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const rel=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+rel);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":contentTypes[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
  }catch(error){res.writeHead(error.code==="ENOENT"?404:500);res.end(String(error.message||error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
const report={
 schema:"AO_1962_INDEPENDENT_SUNDAY_BOOKLET_B02_REPORT",
 editorialDate:"2026-10-10",independentSourceIndex:data.sourceEdition.indexUrl,
 witnessType:data.sourceEdition.witnessType,
 claimLimit:"Edited 1962 Sunday-booklet text parity; neither Vatican-typica facsimile certification nor complete Palm Passion/procession",
 forms:expected.forms,uniqueLatinProofs:expected.proofs,dateObservations:expected.observations,
 visualSourceStatus:data.sourceEdition.sunday2VisualInspection,strict,rows:[],summary:{}
};
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:45000});
  for(const source of data.cases)for(const date of source.dates){
    const actual=await page.evaluate(async date=>{
      const out=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
      const p=out?.proper?.data||{};
      return {status:out?.status,error:out?.error||null,
        rank:out?.day?.main?.rank??null,owner:p.sourcePath||null,title:p.name||null,
        sections:{
          introit:p.introit?.lat||"",collect:p.collects?.[0]?.lat||"",
          epistle:p.epistle?.lat||"",gospel:p.gospel?.lat||"",
          communion:p.communion?.lat||"",postcommunion:p.postcommunions?.[0]?.lat||""
        }};
    },date);
    const checks=source.proofs.map(proof=>{
      const got=actual.sections[proof.field]||"";
      const ok=fold(got).includes(fold(proof.latinIncipit));
      return {field:proof.field,url:proof.url,page:proof.page,expectedIncipit:proof.latinIncipit,
        actualExcerpt:got.slice(0,200),matched:ok,
        state:!got?"runtime-section-empty":ok?"independent-incipit-agrees":"incipit-discrepancy"};
    });
    const ownerMatches=actual.owner===source.owner,rankMatches=actual.rank===source.rank;
    const state=actual.status!=="ready"?"runtime-unavailable":
      !ownerMatches||!rankMatches||checks.some(x=>!x.matched)?"requires-adjudication":
      "booklet-transcription-parity";
    const row={date,form:source.id,booklet:source.pdf.url,ownerExpected:source.owner,
      ownerActual:actual.owner,rankExpected:source.rank,rankActual:actual.rank,
      ownerMatches,rankMatches,runtimeStatus:actual.status,runtimeError:actual.error,
      outcome:state,checks};
    report.rows.push(row);
    console.log("INDEPENDENT_1962_LENT_B02 "+JSON.stringify({date,form:source.id,
      rank:actual.rank,owner:actual.owner,state,
      missing:checks.filter(x=>!x.matched).map(x=>x.field)}));
  }
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
const checks=report.rows.flatMap(r=>r.checks);
report.summary={
  datedForms:report.rows.length,passedDatedForms:report.rows.filter(r=>r.outcome==="booklet-transcription-parity").length,
  totalTextObservations:checks.length,matchingTextObservations:checks.filter(c=>c.matched).length,
  rankMismatch:report.rows.filter(r=>!r.rankMatches).map(r=>r.date),
  ownerMismatch:report.rows.filter(r=>!r.ownerMatches).map(r=>r.date),
  reviewNeeded:report.rows.filter(r=>r.outcome!=="booklet-transcription-parity").map(r=>r.date),
  notPrintedTypicaCertified:true,
  palmPassionCoverage:"NOT COVERED: Matthew Passion segmentation, blessing and procession remain separate owner and audit"
};
await mkdir(resolve(root,"artifacts"),{recursive:true});
const dest=resolve(root,"artifacts/independent-1962-lent-sundays-b02.json");
await writeFile(dest,JSON.stringify(report,null,2)+"\n");
console.log("INDEPENDENT_1962_LENT_B02_SUMMARY "+JSON.stringify(report.summary));
console.log("Audit saved "+dest);
if(strict&&report.summary.reviewNeeded.length)process.exitCode=2;
