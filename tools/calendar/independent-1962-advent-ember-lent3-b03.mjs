// B03: independent Advent/Lent III booklet incipits, plus Advent Ember
// readings and 1960-rubric ordinal checks. This is NOT typica-facsimile signoff.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const corpus=JSON.parse(await readFile(resolve(root,"data/mass/independent-1962-advent-ember-lent3-b03.v1.json"),"utf8"));
const strict=process.argv.includes("--strict");
assert.equal(corpus.sundayFormularies.length,5);
assert.equal(corpus.adventEmber.length,3);
const normalize=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").toLowerCase().replace(/j/g,"i")
 .replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const served={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
 const part=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
 const file=resolve(root,"."+part);
 if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
 const data=await readFile(file);
 res.writeHead(200,{"content-type":served[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
const report={schema:"AO_INDEPENDENT_1962_ADVENT_EMBER_LENT3_B03_REPORT",
 timestamp:"2026-10-10",sourceTypes:corpus.witnessType,visualSourceStatus:corpus.visualStatus,
 primaryPrintedFacsimileCertified:false,
 scope:"Five Sunday formularies × two dates; Advent Ember W/F/S × two dates; excludes Holy Week extended text",
 sunday:[],ember:[],summary:{}};
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:45000});
 async function resolveDay(date){
  return page.evaluate(async date=>{
   const o=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
   const p=o?.proper?.data||{};
   return {status:o?.status,error:o?.error||null,rank:o?.day?.main?.rank??null,
    owner:p.sourcePath||null,title:o?.day?.main?.title||null,
    sections:{introit:p.introit?.lat||"",collect:p.collects?.[0]?.lat||"",
     epistle:p.epistle?.lat||"",gospel:p.gospel?.lat||"",
     postcommunion:p.postcommunions?.[0]?.lat||""},
    preparatoryLessons:p.preparatoryLessons||[],preparatoryLatin:p.preparatoryLessons?.map(l=>JSON.stringify(l))||[]
   };
  },date);
 }
 for(const form of corpus.sundayFormularies)for(const date of form.dates){
  const act=await resolveDay(date);
  const probes=form.proofs.map(p=>{
   const actual=act.sections[p.field]||"";
   return {field:p.field,expected:p.incipit,witness:p.url,excerpt:actual.slice(0,200),
    matched:normalize(actual).includes(normalize(p.incipit)),
    state:!actual?"section-absent":normalize(actual).includes(normalize(p.incipit))?"matches":"review-discrepancy"};
  });
  const ownerAgree=act.owner===form.owner,rankAgree=act.rank===form.grade;
  const row={date,form:form.id,ownerExpected:form.owner,ownerActual:act.owner,rank:act.rank,
   ownerAgree,rankAgree,probes,
   outcome:act.status==="ready"&&ownerAgree&&rankAgree&&probes.every(x=>x.matched)?"independent-incipit-parity":"requires-editorial-review"};
  report.sunday.push(row);
  console.log("B03_SUNDAY "+JSON.stringify({date,form:form.id,owner:act.owner,rank:act.rank,outcome:row.outcome,
   missed:probes.filter(p=>!p.matched).map(p=>p.field)}));
 }
 for(const form of corpus.adventEmber)for(const date of form.dates){
  const act=await resolveDay(date);
  const prel=act.preparatoryLessons;
  const rankAgree=act.rank===form.grade,ownerAgree=act.owner===form.owner;
  const extraEnough=prel.length>=form.preparatoryMin;
  const gospel=normalize(act.sections.gospel);
  // Independent lectionary witness verifies WHO was appointed (citation)
  // but runtime may not preserve a machine-readable Scripture reference
  // in every nested lesson: do not turn that uncertainty into a "match".
  const gospelFragment=form.id.endsWith("wed")?"Missus est Angelus Gabriel":
    form.id.endsWith("fri")?"Exsurgens Maria abiit":"Anno quintodecimo imperii Tiberii Caesaris";
  const gospelAgree=gospel.includes(normalize(gospelFragment));
  const meta={date,form:form.id,witness:form.witness,ownerExpected:form.owner,ownerActual:act.owner,
   rank:act.rank,rankAgree,ownerAgree,preparatoryCount:prel.length,preparatoryMinimum:form.preparatoryMin,
   extraEnough,appointedLectionary:form.lectionary,appointedGospel:form.gospel,
   gospelExpectedStart:gospelFragment,gospelAgree,
   preparedLatinExcerpts:act.preparatoryLatin.map(x=>x.slice(0,200)),epistleExcerpt:act.sections.epistle.slice(0,150),
   state:act.status!=="ready"?"runtime-unresolved":
     !rankAgree||!ownerAgree||!extraEnough||!gospelAgree?"requires-editorial-review":"rubric-and-gospel-incpit-agree",
   lessonSequenceVerification:"recorded, not yet independent verse-by-verse compared"};
  report.ember.push(meta);
  console.log("B03_EMBER "+JSON.stringify({date,form:form.id,owner:act.owner,rank:act.rank,
   prep:prel.length,outcome:meta.state,gospelAgree}));
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
const probes=report.sunday.flatMap(x=>x.probes);
report.summary={sundayDates:report.sunday.length,sundayProofs:probes.length,
 matchedSundayProofs:probes.filter(x=>x.matched).length,sundayReview:report.sunday.filter(x=>x.outcome!=="independent-incipit-parity").map(x=>x.date),
 emberDates:report.ember.length,emberRubricMatches:report.ember.filter(x=>x.state==="rubric-and-gospel-incpit-agree").length,
 emberReview:report.ember.filter(x=>x.state!=="rubric-and-gospel-incpit-agree").map(x=>x.date),
 emberFullReadingCollationCertified:false};
await mkdir(resolve(root,"artifacts"),{recursive:true});
const dest=resolve(root,"artifacts/independent-1962-advent-ember-lent3-b03.json");
await writeFile(dest,JSON.stringify(report,null,2)+"\n");
console.log("B03_SUMMARY "+JSON.stringify(report.summary));
if(strict&&(report.summary.sundayReview.length||report.summary.emberReview.length))process.exitCode=2;
