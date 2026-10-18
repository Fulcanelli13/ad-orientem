import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {correct1962Pent21AlleluiaEnglish} from "../src/mass/1962-ps113-alleluia-editorial.js";

const path="Tempora/Pent21-0";
const la="Allelúja, allelúja. In éxitu Israël de Ægýpto, domus Jacob de pópulo bárbaro. Allelúja.";
const en="Alleluia, alleluia. When Israel went out of Egypt, the house of Jacob from a barbarous people. Alleluia.";
const fr="Alléluia, alléluia. Quand Israël sortit d’Égypte, la maison de Jacob d’un peuple barbare. Alléluia.";
const fluent="When Israel went out of Egypt, the house of Jacob left a people of foreign speech.";
const fixture={sourcePath:path,gradual:{lat:"Gradual\n"+la,en:"Gradual\n"+en,fr:"Gradual\n"+fr},
 preGospelChants:[{kind:"gradual",text:{lat:"Gradual",en:"Gradual",fr:"Gradual"}},
 {kind:"alleluia",text:{lat:la,en,fr}}],
 readerChantSourceProof:{status:"SOURCE_VERIFIED_EXACT",sourcePath:path,parts:[
 {kind:"GRADUAL",lat:"Gradual",en:"Gradual",fr:"Gradual"},
 {kind:"ALLELUIA",lat:la,en,fr}]}};
const fixed=correct1962Pent21AlleluiaEnglish(fixture);
assert.notEqual(fixed,fixture);
assert.ok(fixed.gradual.en.includes(fluent));
assert.ok(fixed.preGospelChants[1].text.en.includes(fluent));
assert.ok(fixed.readerChantSourceProof.parts[1].en.includes(fluent));
assert.equal(fixed.gradual.lat,fixture.gradual.lat);
assert.equal(fixed.gradual.fr,fixture.gradual.fr);
assert.equal(fixed.preGospelChants[0],fixture.preGospelChants[0]);
assert.equal(fixed.readerChantSourceProof.parts[0],fixture.readerChantSourceProof.parts[0]);
assert.equal(correct1962Pent21AlleluiaEnglish(fixed),fixed);
for(const altered of [
 {...fixture,sourcePath:"Tempora/Pent20-0"},
 {...fixture,gradual:{...fixture.gradual,lat:"Unrelated Latin Alleluia"}},
 {...fixture,gradual:{...fixture.gradual,en:"Other English edition"}}
])assert.equal(correct1962Pent21AlleluiaEnglish(altered),altered,
 "Must not modify a different source, text or translation");

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
 const v=await page.evaluate(async()=>{
  const day=await AO_RUNTIME_V8.resolver.resolveDay("2026-10-18");
  const {correct1962Pent21AlleluiaEnglish}=await import("/src/mass/1962-ps113-alleluia-editorial.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {assessPrintableProper,renderPrintableProperHtml}=await import("/src/calendar/print-proper.js");
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const orig=day.proper.data,corrected=correct1962Pent21AlleluiaEnglish(orig);
  const recovered=await recoverReaderProperOmissions(day.proper,{
   hostResolver:AO_RUNTIME_V8.resolver.properResolver,principalCelebrationId:day.day.main.id});
  const raw=recovered.data??recovered,slots=properToReaderSlots(raw,{language:"en"});
  const toText=id=>(slots.slots[id]?.data?.paragraphs??[]).map(p=>p.vernacular).join(" ");
  const printed=assessPrintableProper(day,{language:"en",massForm:"MISSA_CANTATA_SIMPLE"});
  const french=assessPrintableProper(day,{language:"fr",massForm:"MISSA_CANTATA_SIMPLE"});
  return {
    source:orig.sourcePath,rawEnglish:orig.gradual?.en,correctedEnglish:corrected.gradual?.en,
    decision:corrected.editorialTranslationCorrections?.[0]?.id??null,
    liveProof:raw.readerChantSourceProof?.status??null,
    readerEnglish:toText("GRADUAL")+" "+toText("ALLELUIA_TRACT_SEQUENCE"),
    readerStatus:slots.slots.ALLELUIA_TRACT_SEQUENCE.status,
    printReady:printed.ok,frReady:french.ok,
    printedText:printed.proper?.gradual?.en,
    html:renderPrintableProperHtml(day,{language:"en",massForm:"MISSA_CANTATA_SIMPLE"})
      .includes("left a people of foreign speech"),
    latinUnchanged:corrected.gradual?.lat===orig.gradual?.lat,
    frenchUnchanged:corrected.gradual?.fr===orig.gradual?.fr,
    unchangedRaw:orig.gradual?.en===day.proper.data.gradual.en
  };
 });
 console.log("PS113_OCT18_READER_PRINT="+JSON.stringify(v));
 assert.equal(v.source,path);
 assert.equal(v.decision,"MR62_PENT21_PS113_1_ALLELUIA_EN_GRAMMAR",
  "Unmatched 18 Oct English source: do not guess");
 assert.ok(v.rawEnglish.includes("a barbarous people."));
 assert.ok(v.correctedEnglish.includes(fluent));
 assert.ok(v.readerEnglish.includes(fluent));
 assert.ok(v.printedText.includes(fluent));
 assert.equal(v.printReady,true);assert.equal(v.frReady,true);
 assert.equal(v.html,true);assert.equal(v.latinUnchanged,true);
 assert.equal(v.frenchUnchanged,true);assert.equal(v.unchangedRaw,true);
 assert.deepEqual(errors,[]);
 console.log("PASS: 18 October Psalm 113 Alleluia English presentation, source and language integrity");
}finally{await browser?.close();await new Promise(ok=>srv.close(ok))}
