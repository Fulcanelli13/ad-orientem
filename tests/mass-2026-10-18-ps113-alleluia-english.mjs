import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {project1962Pent21AlleluiaDisplayRows,PS113_PENT21_ENGLISH_EDITORIAL} from "../src/mass/1962-ps113-alleluia-editorial.js";

const path="Tempora/Pent21-0";
const latin="Allelúja, allelúja. In éxitu Israël de Ægýpto, domus Jacob de pópulo bárbaro. Allelúja.";
const original="When Israel went out of Egypt, the house of Jacob from a barbarous people.";
const fluent="When Israel went out of Egypt, the house of Jacob left a people of foreign speech.";
const rawProper=Object.freeze({sourcePath:path,gradual:Object.freeze({
 lat:"Gradual\n"+latin,en:"Gradual\n"+original,fr:"French preserved"})});
const rows=Object.freeze([
 Object.freeze({kind:"TEXT",latin:"Unrelated Gradual",vernacular:"Original unrelated"}),
 Object.freeze({kind:"TEXT",latin,vernacular:"Alleluia. "+original+" Alleluia."})
]);
const projected=project1962Pent21AlleluiaDisplayRows(rawProper,rows,{language:"en"});
assert.notEqual(projected,rows);
assert.equal(projected[0],rows[0]);
assert.ok(projected[1].vernacular.includes(fluent));
assert.equal(projected[1].latin,latin);
assert.equal(rawProper.gradual.en.includes(original),true,"Original source was mutated");
assert.equal(PS113_PENT21_ENGLISH_EDITORIAL.vulgateReference,"Ps 113:1");
assert.equal(project1962Pent21AlleluiaDisplayRows(rawProper,projected,{language:"en"}),projected);
assert.equal(project1962Pent21AlleluiaDisplayRows(rawProper,rows,{language:"fr"}),rows);
for(const altered of [
 {...rawProper,sourcePath:"Tempora/Pent20-0"},
 {...rawProper,gradual:{...rawProper.gradual,lat:"Different Latin verse"}},
 {...rawProper,gradual:{...rawProper.gradual,en:"Another edition"}}
])assert.equal(project1962Pent21AlleluiaDisplayRows(altered,rows,{language:"en"}),rows,
 "Source-unsafe automatic paraphrase");

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".json":"application/json",".css":"text/css;charset=utf-8",".svg":"image/svg+xml"};
const srv=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const b=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]??"application/octet-stream"});
  res.end(b);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(ok=>srv.listen(0,"127.0.0.1",ok));let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
  serviceWorkers:"block"}),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:"+srv.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:80000});
 const result=await page.evaluate(async()=>{
  const day=await AO_RUNTIME_V8.resolver.resolveDay("2026-10-18");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {assessPrintableProper,renderPrintableProperHtml}=await import("/src/calendar/print-proper.js");
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const proper=day.proper.data;
  const recovered=await recoverReaderProperOmissions(day.proper,{
   hostResolver:AO_RUNTIME_V8.resolver.properResolver,principalCelebrationId:day.day.main.id});
  const mapped=properToReaderSlots(recovered.data??recovered,{language:"en"});
  const trans=id=>(mapped.slots[id]?.data?.paragraphs??[]).map(x=>x.vernacular).join(" ");
  const print=assessPrintableProper(day,{language:"en",massForm:"MISSA_CANTATA_SIMPLE"});
  const french=assessPrintableProper(day,{language:"fr",massForm:"MISSA_CANTATA_SIMPLE"});
  return {
   sourcePath:proper.sourcePath,originalEnglish:proper.gradual?.en,
   originalLatin:proper.gradual?.lat,
   sourceProof:(recovered.data??recovered).readerChantSourceProof?.status??null,
   readerEnglish:trans("GRADUAL")+" "+trans("ALLELUIA_TRACT_SEQUENCE"),
   readerCorrection:mapped.displayTranslationCorrections?.[0]?.id??null,
   readerSourceUnchanged:(recovered.data??recovered).gradual?.en?.includes("a barbarous people.")??false,
   printReady:print.ok,frReady:french.ok,
   printEnglish:print.sections?.filter(x=>x.kind==="alleluia"||x.kind==="gradual").map(x=>x.vernacular).join(" "),
   printCorrection:print.displayTranslationCorrections?.[0]?.id??null,
   printedHtml:renderPrintableProperHtml(day,{language:"en",massForm:"MISSA_CANTATA_SIMPLE"})
     .includes("left a people of foreign speech"),
   printSourceUnchanged:print.proper?.gradual?.en===proper.gradual?.en,
   frenchUnchanged:french.proper?.gradual?.fr===proper.gradual?.fr
  };
 });
 console.log("PS113_OCT18="+JSON.stringify(result));
 assert.equal(result.sourcePath,path);
 assert.ok(result.originalEnglish.includes(original));
 assert.equal(result.readerCorrection,PS113_PENT21_ENGLISH_EDITORIAL.id);
 assert.equal(result.printCorrection,PS113_PENT21_ENGLISH_EDITORIAL.id);
 assert.ok(result.readerEnglish.includes(fluent));
 assert.ok(result.printEnglish.includes(fluent));
 assert.equal(result.printReady,true);assert.equal(result.frReady,true);
 assert.equal(result.printedHtml,true);assert.equal(result.printSourceUnchanged,true);
 assert.equal(result.readerSourceUnchanged,true);assert.equal(result.frenchUnchanged,true);
 assert.deepEqual(errors,[]);
 console.log("PASS real 18 Oct 1962 Alleluia: readable English, untouched chant and source proofs");
}finally{await browser?.close();await new Promise(ok=>srv.close(ok))}
