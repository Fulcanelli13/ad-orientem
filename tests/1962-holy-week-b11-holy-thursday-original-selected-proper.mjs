/** B11: inspect the ACTUAL 1962 source-resolved Holy Thursday Proper, with independent Vatican p.154 witness. */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,readFile as read} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledger=load("data/mass/independent-1962-holy-week-b09-original-image-witness.v1.json");
const original=ledger.witnesses.find(x=>x.id==="HOLY_THURSDAY_INTROIT");
assert.ok(original);
assert.equal(original.printedPage,154);
assert.equal(original.scanId,236);
assert.equal(original.runtimePath,"resolvedProper.introit.lat");
const b04=load("data/mass/independent-1962-holy-week-b04.v1.json");
assert.equal(b04.rites.find(x=>x.id==="HOLY_THURSDAY_1962").appRootSourcePath,"Tempora/Quad6-4r");
const fold=x=>String(x??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .replace(/[^a-zA-Z]+/g," ").replace(/\s+/g," ").toLowerCase().trim();
const has=(hay,needle)=>(" "+fold(hay)+" ").includes(" "+fold(needle)+" ");

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json",".css":"text/css;charset=utf-8",
 ".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;const records=[];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 for(const date of ["2026-04-02","2027-03-25"]){
  const record=await page.evaluate(async date=>{
    const source=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
    const proper=source?.proper?.data;
    const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
    const en=proper?properToReaderSlots(proper,{language:"en"}).slots.INTROIT:null;
    const fr=proper?properToReaderSlots(proper,{language:"fr"}).slots.INTROIT:null;
    return {
      date,dayStatus:source?.status,properStatus:source?.proper?.status,
      principalId:source?.day?.main?.id??null,
      sourcePath:proper?.sourcePath??null,
      latin:proper?.introit?.lat??proper?.introit?.la??"",
      english:proper?.introit?.en??"",french:proper?.introit?.fr??"",
      enSlotStatus:en?.status??null,frSlotStatus:fr?.status??null,
      enReader:en?.data?.paragraphs?.map(x=>x.latin).join("\n")??"",
      frReader:fr?.data?.paragraphs?.map(x=>x.latin).join("\n")??""
    };
  },date);
  records.push(record);
  console.log("HOLY_THURSDAY_B11_REAL_SOURCE_OBSERVATION="+JSON.stringify(record));
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
assert.equal(records.length,2);
for(const row of records){
 assert.equal(row.dayStatus,"ready",row.date+" unresolved 1962 principal");
 assert.equal(row.properStatus,"ready",row.date+" source proper unavailable");
 assert.equal(row.sourcePath,"Tempora/Quad6-4r",row.date+" not the 1962 Holy Thursday Mass source");
 assert.match(row.principalId||"",/^tempora:Quad6-4r:1:/,row.date+" wrong principal");
 assert.ok(has(row.latin,original.reading),row.date+" Latin differs from Vatican 1962 p.154");
 assert.ok(has(row.enReader,original.reading),row.date+" English-mode R17 lost original Latin");
 assert.ok(has(row.frReader,original.reading),row.date+" French-mode R17 lost original Latin");
 assert.equal(row.enSlotStatus,"READY",row.date+" English Reader Introit missing");
 assert.equal(row.frSlotStatus,"READY",row.date+" French Reader Introit missing");
 assert.ok(row.english.length>45&&row.french.length>45,row.date+" source translation missing");
 assert.doesNotMatch(row.principalId,/chrism/i,row.date+" improperly selected Chrism Mass");
}
assert.ok(!has("Nos autem gloriari",original.reading),
  "Poison: truncated antiphon must never satisfy exact scanned Latin");
console.log("PASS B11 HOLY THURSDAY SOURCE="+JSON.stringify({
 cases:records.length,selectedProper:"Tempora/Quad6-4r",
 scannedLatinIncipit:true,englishFrenchReady:true,
 printedPage:154,scanId:236,chrismMassSeparatelyCertified:false
}));
