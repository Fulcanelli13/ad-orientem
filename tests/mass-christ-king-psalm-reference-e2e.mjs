import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {correct1962ProperEditorialReferences} from "../src/mass/1962-proper-editorial-corrections.js";

const fixture={sourcePath:"Sancti/10-DU",gradual:{
 lat:"Ps 71:8; 78:11\nDominábitur a mari usque ad mare.\nEt adorábunt eum omnes reges terræ.",
 en:"Original English",fr:"Original French"
}};
const fixed=correct1962ProperEditorialReferences(fixture);
assert.ok(fixed!==fixture);
assert.ok(fixed.gradual!==fixture.gradual);
assert.equal(fixed.gradual.lat.replace("Ps 71:8; 71:11","Ps 71:8; 78:11"),fixture.gradual.lat);
assert.equal(fixed.gradual.en,fixture.gradual.en);
assert.equal(fixed.gradual.fr,fixture.gradual.fr);
const frenchSample={...fixture,gradual:{...fixture.gradual,
 fr:"Ps 71:8; 78:11\nIl dominera de la mer à la mer.\nEt tous les rois de la terre l’adoreront."}};
const frenchFixed=correct1962ProperEditorialReferences(frenchSample);
assert.equal(frenchFixed.gradual.fr.replace("Ps 71:8; 71:11","Ps 71:8; 78:11"),frenchSample.gradual.fr);
assert.equal(frenchFixed.gradual.fr.startsWith("Ps 71:8; 71:11"),true);
assert.equal(fixed.gradual.lat.startsWith("Ps 71:8; 71:11"),true);
assert.equal(correct1962ProperEditorialReferences(fixed),fixed,"correction must be idempotent");
assert.equal(correct1962ProperEditorialReferences({...fixture,sourcePath:"Tempora/Pent21-0"}).gradual.lat,
 fixture.gradual.lat,"must not touch other Propers");
assert.equal(correct1962ProperEditorialReferences({...fixture,gradual:{...fixture.gradual,
 lat:"Ps 71:8; 78:11\nA different Gradual"}}).gradual.lat,
 "Ps 71:8; 78:11\nA different Gradual","must not change a different psalm with same reference");

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".json":"application/json",".css":"text/css;charset=utf-8",".svg":"image/svg+xml",
 ".woff2":"font/woff2"};
const srv=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":types[extname(path)]??"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(ok=>srv.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+srv.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:80000});
 const result=await page.evaluate(async()=>{
  const day=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-10-25");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {assessPrintableProper,renderPrintableProperHtml}=await import("/src/calendar/print-proper.js");
  const original=day.proper?.data?.gradual??{};
  const diagnostics={requestedFiles:[],cacheHits:[],referencesResolved:[],
    languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],
    warnings:[],errors:[]};
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const recovered=await recoverReaderProperOmissions(day.proper,{
    hostResolver:globalThis.AO_RUNTIME_V8.resolver.properResolver,
    principalCelebrationId:day.day.main.id,diagnostic:diagnostics
  });
  const revised=recovered.data??recovered;
  const reader=properToReaderSlots(revised,{language:"en"});
  const printed=assessPrintableProper(day,{language:"en",massForm:"MISSA_CANTATA_SIMPLE"});
  const html=renderPrintableProperHtml(day,{language:"en",massForm:"MISSA_CANTATA_SIMPLE"});
  const text=reader.slots.GRADUAL?.data?.paragraphs?.map(x=>x.latin).join("\n")??"";
  return {
   day:day.day?.main?.title,
   commemorations:(day.day?.commemorations??[]).map(x=>({id:x.id,path:x.path,title:x.title})),
   orationCounts:Object.fromEntries(["collects","secrets","postcommunions"].map(k=>[k,(revised[k]??[]).length])),
   prefaceLatin:String(revised.preface?.lat??revised.preface?.la??""),
   path:day.proper?.data?.sourcePath,
   raw:original.lat,
   reader:text,
   printedLatin:printed.proper?.gradual?.lat??null,
   printedReason:printed.reason,printedOk:printed.ok,
   htmlOriginalPresent:html.includes("Ps 71:8; 78:11"),
   htmlCorrectedPresent:html.includes("Ps 71:8; 71:11"),
   enPreserved:printed.proper?.gradual?.en===original.en,
   frCorrected:printed.proper?.gradual?.fr?.startsWith("Ps 71:8; 71:11"),
   frVersePreserved:printed.proper?.gradual?.fr?.slice(14)===original.fr?.slice(14),
   sourceCorrection:printed.proper?.editorialReferenceCorrections?.[0]?.id,
   liveRecoveryStatus:revised.readerChantSourceProof?.status??null,
   selectedChants:reader.slots.ALLELUIA_TRACT_SEQUENCE.status,
   selectedKind:reader.slots.ALLELUIA_TRACT_SEQUENCE.data?.paragraphs?.[0]?.liturgicalGroup??null,
   gradualOnly:reader.slots.GRADUAL.data?.paragraphs?.[0]?.latin??null,
   recoveryWarnings:diagnostics.warnings.slice(0,3),
  };
 });
 console.log("CHRIST_KING_REFERENCE_PARITY="+JSON.stringify(result));
 assert.equal(result.path,"Sancti/10-DU");
 // 1960 General Rubrics §17(d): Christ the King replaces its occurring Sunday.
 // Do not import the displaced Sunday as a commemoration (or its three orations).
 assert.deepEqual(result.commemorations,[],"Christ the King must not commemorate the replaced Sunday (RG §17d)");
 for(const group of ["collects","secrets","postcommunions"])
  assert.equal(result.orationCounts[group],1,"Unexpected extra "+group+" in Christ the King Mass");
 assert.match(result.prefaceLatin,/Qui unigénitum Fílium tuum/,"Christ the King requires its own 1962 Preface");
 assert.match(result.raw,/^Ps 71:8; 78:11/m,"audit must retain the wrong upstream source label");
 assert.match(result.reader,/^Ps 71:8; 71:11/m);
 assert.equal(result.printedOk,true,result.printedReason??"print unavailable");
 assert.match(result.printedLatin,/^Ps 71:8; 71:11/m);
 assert.equal(result.htmlOriginalPresent,false);
 assert.equal(result.htmlCorrectedPresent,true);
 assert.equal(result.enPreserved,true);
 assert.equal(result.frCorrected,true);
 assert.equal(result.frVersePreserved,true);
 assert.equal(result.sourceCorrection,"MR62_CHRIST_KING_GRADUAL_PSALM_71_8_11");
 assert.equal(result.liveRecoveryStatus,"SOURCE_VERIFIED_EXACT",
  "Actual LIVE entry could not separate the named Christ King Alleluia");
 assert.equal(result.selectedChants,"READY");
 assert.equal(result.selectedKind,"AO.CHANT.ALLELUIA");
 assert.ok(!result.gradualOnly.includes("Dan 7:14"),
  "Gradual wrongly swallowed the distinct Alleluia/ Daniel verse");
 console.log("PASS Christ the King 1962 Gradual citation: reader, print, source untouched, trilingual translations retained");
}finally{await browser?.close();await new Promise(ok=>srv.close(ok))}
