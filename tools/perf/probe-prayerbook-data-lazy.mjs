// Experimental only. No production code or legacy parser-order bundle is changed.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile, mkdir, writeFile} from "node:fs/promises";
import {resolve, sep, extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const oldFile="ao-inline-a45824678e308933fad5.js";
const packedFile="ao-packed-89ab7c75073937f51430.js";
const corpusSource=await readFile(resolve(root,oldFile),"utf8");
const packedSource=await readFile(resolve(root,packedFile),"utf8");

// Parse exactly the original const D object. No inferred or regenerated prayers.
const key='const D={"prayers":';
const marker=corpusSource.indexOf(key);
assert.ok(marker>=0,"Original PrayerBook data binding missing");
const start=marker+"const D=".length;
let cursor=start,depth=0,inString=false,escaped=false;
for(;cursor<corpusSource.length;cursor++){
 const ch=corpusSource[cursor];
 if(inString){
  if(escaped){escaped=false;continue;}
  if(ch==="\\"){escaped=true;continue;}
  if(ch==='"')inString=false;
  continue;
 }
 if(ch==='"'){inString=true;continue;}
 if(ch==="{")depth++;
 else if(ch==="}"&&--depth===0){cursor++;break;}
}
assert.ok(cursor>start&&!inString&&depth===0,"Prayer data object did not close");
const raw=corpusSource.slice(start,cursor);
const corpus=JSON.parse(raw);
assert.equal(Object.keys(corpus.prayers).length,48,"Unexpected canonical legacy prayer count");
assert.equal(Object.keys(corpus.categories).length,9);
assert.ok(!raw.includes(String.fromCharCode(96))&&!raw.includes("$"+"{"),
 "Raw corpus contains template-literal syntax; an escaped transport is required");
// String.raw preserves all original JSON backslashes until the first consumer
// asks for a property. The Proxy preserves own-key enumeration and descriptors.
const tick=String.fromCharCode(96);
const replacement="const D=(()=>{let data;"+
 "const raw=String.raw"+tick+raw+tick+";"+
 "const get=()=>{if(!data){data=JSON.parse(raw);"+
 "window.__AO_PRAYER_CORPUS_PARSE_COUNT=(window.__AO_PRAYER_CORPUS_PARSE_COUNT||0)+1;}return data;};"+
 "window.__AO_PRAYER_CORPUS_LAZY={get parsed(){return Boolean(data);},get parseCount(){return window.__AO_PRAYER_CORPUS_PARSE_COUNT||0;}};"+
 "return new Proxy({}, {get(_target,k){return Reflect.get(get(),k);},"+
 "has(_target,k){return k in get();},"+
 "ownKeys(){return Reflect.ownKeys(get());},"+
 "getOwnPropertyDescriptor(_target,k){return Reflect.getOwnPropertyDescriptor(get(),k);},"+
 "set(_target,k,value){return Reflect.set(get(),k,value);}});"+
 "})()";
const exact="const D="+raw;
assert.equal(packedSource.split(exact).length,2,
 "Original bundled PrayerBook source was not found exactly once; stop without rewriting it");
const experimentalPack=packedSource.replace(exact,replacement);
assert.ok(experimentalPack.length<packedSource.length+1500);
assert.ok(experimentalPack.includes("String.raw"+tick+raw.slice(0,40)));
assert.ok(!experimentalPack.includes(exact));

// The experiment serves a substituted bundle on one isolated Chromium
// context. There is no repository asset change and no deployed HTML change.
const contentTypes={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".css":"text/css;charset=utf-8",".json":"application/json;charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",
 ".webp":"image/webp",".woff":"font/woff",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const content=await readFile(file);
  res.writeHead(200,{"content-type":contentTypes[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(content);
 }catch(error){res.writeHead(error.code==="ENOENT"?404:500);res.end(String(error));}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",done);});
let browser;
const report={schema:"ao-prayerbook-corpus-lazy-probe-v1",
 originalSourceBytes:Buffer.byteLength(corpusSource),corpusBytes:Buffer.byteLength(raw),
 prayerCount:Object.keys(corpus.prayers).length,categoryCount:Object.keys(corpus.categories).length,
 originalPackedBytes:Buffer.byteLength(packedSource),
 experimentalPackedBytes:Buffer.byteLength(experimentalPack),profiles:[]};
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 async function capture(mode,width){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,
   reducedMotion:"reduce",serviceWorkers:"block"});
  const page=await context.newPage(),errors=[],requests=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  page.on("request",r=>requests.push(r.url()));
  if(mode==="lazy"){
   await page.route("**/"+packedFile,route=>route.fulfill({
    status:200,contentType:"text/javascript;charset=utf-8",body:experimentalPack
   }));
  }
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.installed===true&&
    typeof globalThis.AOTraditionalPrayerBook?.openPrayer==="function"&&
    document.getElementById("aoPrayerBookRoot"),null,{timeout:90000});
   const afterHome=await page.evaluate(()=>({
    millis:Math.round(performance.now()),
    parsed:globalThis.__AO_PRAYER_CORPUS_LAZY?.parsed??null,
    parseCount:globalThis.__AO_PRAYER_CORPUS_LAZY?.parseCount??null,
    globals:Boolean(globalThis.AO_ROSARY_V381&&globalThis.AOTraditionalPrayerBook)
   }));
   assert.equal(afterHome.globals,true,"Original Prayer and Rosary globals missing");
   const prayer=await page.evaluate(()=>{
    const ok=globalThis.AOTraditionalPrayerBook.openPrayer("foundations_our_father");
    const node=document.getElementById("aoPrayerBookRoot");
    return {ok,open:node.classList.contains("open"),
     view:globalThis.AOTraditionalPrayerBook.getState().view,
     text:node.textContent.replace(/\s+/g," ").trim().slice(0,500),
     parsed:globalThis.__AO_PRAYER_CORPUS_LAZY?.parsed??null,
     parseCount:globalThis.__AO_PRAYER_CORPUS_LAZY?.parseCount??null};
   });
   assert.equal(prayer.ok,true,"Our Father owner failed");
   assert.equal(prayer.open,true);
   assert.equal(prayer.view,"prayer");
   assert.match(prayer.text,/Our Father|Pater noster/i);
   const rosary=await page.evaluate(()=>{
    const book=globalThis.AOTraditionalPrayerBook;
    book.close({silent:true});
    const ok=book.openModule("rosary");
    const root=document.getElementById("aoPrayerBookRoot");
    return {ok,open:root.classList.contains("open"),
     view:book.getState().view,
     bridge:globalThis.AO_ROSARY_V381?.version,
     state:globalThis.AO_ROSARY_V381?.state?.()?.form,
     text:root.textContent.replace(/\s+/g," ").trim().slice(0,500)};
   });
   assert.equal(rosary.ok,true);
   assert.equal(rosary.open,true);
   assert.equal(rosary.view,"rosary");
   assert.equal(rosary.bridge,"41-bridge");
   assert.ok(rosary.text.length>25);
   if(mode==="lazy"){
    assert.equal(afterHome.parsed,false,
     "Prayer corpus was parsed during cold startup: deferral did not occur");
    assert.equal(prayer.parsed,true);
    assert.equal(prayer.parseCount,1);
   }
   assert.deepEqual(errors,[],"Browser uncaught errors: "+JSON.stringify(errors));
   return {mode,width,afterHome,prayer,rosary,
    requestCount:requests.length,scriptRequests:requests.filter(x=>/\.m?js(?:\?|$)/.test(x)).length};
  }finally{await context.close();}
 }
 for(const width of [390,320]){
  const original=await capture("original",width);
  const lazy=await capture("lazy",width);
  assert.equal(original.prayer.text,lazy.prayer.text,"Prayer text changed by lazy corpus");
  assert.equal(original.rosary.text,lazy.rosary.text,"Rosary screen changed by lazy corpus");
  assert.equal(original.rosary.bridge,lazy.rosary.bridge,"Rosary API identity changed");
  report.profiles.push(original,lazy);
 }
 const output=resolve(root,"artifacts/h7-prayer-corpus-probe/summary.json");
 await mkdir(resolve(root,"artifacts/h7-prayer-corpus-probe"),{recursive:true});
 await writeFile(output,JSON.stringify(report,null,2)+"\n");
 console.log("H7_PRAYER_CORPUS_PROBE="+JSON.stringify(report));
}finally{await browser?.close();await new Promise(done=>server.close(done));}
