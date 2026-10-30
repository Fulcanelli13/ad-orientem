import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {extractLitanyProper,paginateLitanyProper} from "../src/pray/litany-source.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const artifact=resolve(root,"artifacts/pray-source-lifecycle");
await mkdir(artifact,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),full=resolve(root,"."+name);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(4299,"127.0.0.1",done)});

const enFixture=[
 "The Litany of the Saints.","Lord, have mercy on us.","Christ, hear us.",
 "Holy Mary, pray for us.","Holy Mother of God, pray for us.",
 "St. Peter, pray for us.","St. Paul, pray for us.",
 ...Array.from({length:32},(_,i)=>"Named historical test invocation "+(i+1)+", pray for us (TEST FIXTURE — NOT SOURCE TEXT)."),
 "Lamb of God, who takest away the sins of the world, have mercy on us.",
 "Our Father, in secret.","Psalm LXIX. This appended psalm MUST NOT be displayed as a litany invocation."
].join("\n");
const frFixture=[
 "Les litanies des saints.","Seigneur, ayez pitié de nous.",
 "Sainte Marie, priez pour nous.","Saint Pierre, priez pour nous.",
 ...Array.from({length:32},(_,i)=>"Ligne d'essai "+(i+1)+" ; ceci n'est pas le texte historique."),
 "Agneau de Dieu, qui effacez les péchés du monde, exaucez-nous.",
 "Notre Père, qui êtes aux cieux.","Psaume LXIX. Annexé ; hors des litanies."
].join("\n");
for(const [language,fixture] of [["en",enFixture],["fr",frFixture]]){
 const proper=extractLitanyProper(fixture,language),cards=paginateLitanyProper(proper,language);
 assert.ok(proper.length>500&&cards.length>=2,"Synthetic "+language+" witness cannot exercise real section pagination");
 assert.doesNotMatch(proper,/Psalm LXIX|Psaume LXIX|Notre Père|Our Father/);
 assert.throws(()=>extractLitanyProper(fixture.replace(/Our Father, in secret\.|Notre Père, qui êtes aux cieux\./,""),language),
  /ending not found/i,"Historical witness truncated: the parser must fail closed");
}
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4299/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:15000});
 const baseline=await page.evaluate(()=>({
  runtime:typeof globalThis.AO_RUNTIME_V8,
  service:typeof globalThis.AO_RUNTIME_V8?.scriptureService?.load
 }));
 console.log("UNMOCKED_PRODUCTION_SCRIPTURE_SERVICE "+JSON.stringify(baseline));
 const originalProbe=await page.evaluate(async()=>{
  const svc=globalThis.AO_RUNTIME_V8?.scriptureService;
  if(typeof svc?.load!=="function")return {state:"no-service"};
  try{
   const document=await Promise.race([
    svc.load("psalm",{en:"Psalms 6:1",fr:"Psalms 6:1",lat:"Psalms 6:1"}),
    new Promise((_,reject)=>setTimeout(()=>reject(Error("SRC_PROBE_TIMEOUT")),9000))
   ]);
   return {state:"resolved",reference:document?.reference||null,
    en:Array.isArray(document?.englishChapter)?document.englishChapter.length:0,
    fr:Array.isArray(document?.frenchChapter)?document.frenchChapter.length:0,
    la:Array.isArray(document?.latinChapter)?document.latinChapter.length:0};
  }catch(e){return {state:"error",reason:String(e?.message||e).slice(0,220)}}
 });
 console.log("UNMOCKED_CANONICAL_SCRIPTURE_TEXT "+JSON.stringify(originalProbe));
 // A test fixture is installed ONLY after the unmocked production owner is
 // inspected, so this regression can exercise fail-closed UI even when the
 // unrelated upstream Scripture service is not yet provided on first launch.
 await page.evaluate(()=>{
  if(!globalThis.AO_RUNTIME_V8)globalThis.AO_RUNTIME_V8={
   store:{getState:()=>({language:"en"})}
  };
  if(!globalThis.AO_RUNTIME_V8.scriptureService)
   globalThis.AO_RUNTIME_V8.scriptureService={
    load:async()=>{throw Error("TEST_UNMOCKED_SERVICE_MISSING")}
   };
 });
 // Never place this deliberately SYNTHETIC test witness in a shipping data file.
 // It exercises source bounding, 18-line pagination and actual touch focus,
 // NOT the accuracy or completeness of the external historical edition.
 await page.evaluate(text=>localStorage.setItem("ao2:v435930:ws:en:litany-saints-1883-en-v2",text),enFixture);
 const open=id=>page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),id);
 const mount="#aoPray435930.open";
 const reader=mount+" .aoP435930DevotionalGuidedReader";
 const settle=reader+" [data-ao-scripture-content]";
 await page.evaluate(()=>{
  const svc=globalThis.AO_RUNTIME_V8.scriptureService;
  globalThis.__TEST_originalScriptureLoad=svc.load;
  // Deliberately invalid response: no chapter text. The app must refuse to
  // label it as a real loaded Catholic Bible reading.
  svc.load=async()=>({reference:"Psalms 6:1",englishChapter:[],frenchChapter:[],latinChapter:[]});
 });
 assert.equal(await open("pray.penitential_psalms"),true);
 await page.waitForSelector(reader+" [data-ao-scripture-content='unavailable']",{timeout:15000});
 assert.match(await page.locator(settle).innerText(),/not be loaded|n’a pas pu être chargé/);
 assert.equal(await page.locator(reader+" [data-p435930-scripture-retry='psalm']").count(),1);
 assert.equal(await page.locator(reader+" .aoP435930ScriptureVerse").count(),0);
 await page.screenshot({path:resolve(artifact,"psalm-source-unavailable-390.png"),animations:"disabled"});
 await page.evaluate(()=>{
  const svc=globalThis.AO_RUNTIME_V8.scriptureService;
  svc.load=async()=>({
   reference:"Psalms 6:1",
   englishChapter:[{verse:1,text:"VERIFIED_FORMAT_TEST_ONLY — not a biblical quotation"}],
   frenchChapter:[{verse:1,text:"FORMAT_FR_TEST — ceci n'est pas une citation biblique"}],
   latinChapter:[{verse:1,text:"TEST LATIN WITNESS, not source"}]
  });
 });
 await page.locator(reader+" [data-p435930-scripture-retry='psalm']").tap();
 await page.waitForSelector(reader+" [data-ao-scripture-content='ready']",{timeout:10000});
 assert.equal(await page.locator(reader+" .aoP435930ScriptureVerse").count(),2);
 await page.waitForFunction(()=>{
   const verse=document.querySelector(
    "#aoPray435930.open .aoP435930DevotionalGuidedReader .aoP435930ScriptureVerse.aoDevoParagraph"
   );
   const active=document.querySelector(
    "#aoPray435930.open .aoP435930DevotionalGuidedReader .aoDevoParagraph[data-ao-devo-active='true']"
   );
   return Boolean(verse&&active);
 },null,{timeout:8000});
 assert.ok(await page.locator(reader+" .aoP435930ScriptureVerse.aoDevoParagraph").count()>0,
  "Newly inserted original-text verse was not enrolled in vertical focus");
 await page.screenshot({path:resolve(artifact,"psalm-settled-fixture-390.png"),animations:"disabled"});
 await page.evaluate(()=>{globalThis.AO_RUNTIME_V8.scriptureService.load=async()=>{throw Error("TEST_FORCED_NETWORK_FAILURE")};});
 assert.equal(await open("pray.seven_words"),true);
 await page.waitForSelector(reader+" [data-ao-scripture-content='unavailable']",{timeout:12000});
 assert.equal(await page.locator(reader+" [data-p435930-scripture-retry='gospel']").count(),1);
 await page.evaluate(()=>{globalThis.AO_RUNTIME_V8.scriptureService.load=async()=>({
  reference:{start:34,end:34},englishChapter:[{verse:34,text:"TEST GOSPEL SOURCE FORMAT ONLY"}],
  frenchChapter:[{verse:34,text:"TEST FORMAT FR"}],latinChapter:[]});});
 // Seven Words concurrently loads its original historical meditation.
 // That legitimate source-owning render can detach the Retry button while
 // Playwright is preparing a touch. Re-acquire the *live* button or accept a
 // verified already-resolved original passage, never fake a click.
 for(let attempt=0;attempt<4;attempt++){
  if(await page.locator(reader+" [data-ao-scripture-content='ready']").count())break;
  try{
   await page.locator(reader+" [data-p435930-scripture-retry='gospel']").tap({timeout:5500});
  }catch(e){
   if(await page.locator(reader+" [data-ao-scripture-content='ready']").count())break;
   if(attempt===3)throw e;
  }
 }
 await page.waitForSelector(reader+" [data-ao-scripture-content='ready']",{timeout:10000});
 assert.equal(await page.locator(reader+" .aoP435930ScriptureVerse").count(),1);
 await page.screenshot({path:resolve(artifact,"gospel-settled-fixture-390.png"),animations:"disabled"});
 // A permanently stalled upstream call cannot hold "Loading" forever.
 // The first-party reader must change to an honest unavailable state and
 // allow a fresh request of the same original Psalm.
 await page.evaluate(()=>{
  globalThis.AO_RUNTIME_V8.scriptureService.load=()=>new Promise(()=>{});
 });
 assert.equal(await open("pray.penitential_psalms"),true);
 await page.waitForSelector(reader+" [data-ao-scripture-content='unavailable']",{timeout:16000});
 assert.equal(await page.locator(reader+" [data-p435930-scripture-retry='psalm']").count(),1);
 assert.match(await page.locator(reader+" [data-ao-scripture-content='unavailable']").innerText(),
  /could not be loaded|n’a pas pu être chargé/i);
 await page.screenshot({path:resolve(artifact,"psalm-timeout-320.png"),animations:"disabled"});
 assert.equal(await open("pray.litany_saints"),true);
 await page.waitForSelector(reader+" .aoDevoSequenceTimeline",{timeout:12000});
 assert.ok(await page.locator(reader+" .aoDevoStop").count()>=2);
 const first=await page.locator(reader+" .aoP435930LitanyLine").allTextContents();
 assert.ok(first.some(x=>x.includes("TEST FIXTURE")),"Test-only Litany fixture was not source-bounded and paginated");
 assert.ok(!first.some(x=>x.includes("Psalm LXIX")));
 await page.locator(reader+" [data-ao-devo-chapter='1']").tap();
 assert.match(await page.locator(reader+" .aoDevoCardHead").innerText(),/Part 2/);
 await page.screenshot({path:resolve(artifact,"litany-paginated-synthetic-390.png"),animations:"disabled"});
 await page.evaluate(()=>{
  globalThis.AO_RUNTIME_V8.scriptureService.load=globalThis.__TEST_originalScriptureLoad;
  localStorage.removeItem("ao2:v435930:ws:en:litany-saints-1883-en-v2");
 });
 // A truncated saved historical transcript must not strand users in a
 // permanent error loop: source bounding rejects it and clears the cache key.
 const invalid=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 await invalid.goto("http://127.0.0.1:4299/index.html",{waitUntil:"domcontentloaded"});
 await invalid.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function");
 assert.equal(await invalid.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 await invalid.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function");
 await invalid.evaluate(()=>{
  localStorage.setItem("ao2:v435930:ws:en:litany-saints-1883-en-v2",
   "The Litany of the Saints.\\nLord, have mercy on us.\\nHoly Mary, pray for us.\\nSt. Peter, pray for us.");
  globalThis.AO_PRAY_V435930.open("pray.litany_saints",{returnContext:null});
 });
 await invalid.waitForSelector("#aoPray435930.open [data-p435930-lit-retry]",{timeout:12000});
 assert.equal(await invalid.evaluate(()=>localStorage.getItem("ao2:v435930:ws:en:litany-saints-1883-en-v2")),null,
  "Truncated historical Litany cache poisons every subsequent Retry");
 assert.equal(await invalid.locator(".aoDevoCard[data-ao-devo-card^='litany-']").count(),0,
  "Truncated historical witness incorrectly rendered as a prayer");
 await invalid.close();
 assert.deepEqual(errors,[],"Browser exceptions: "+errors.join(" | "));
 console.log("PASS strict source statuses, same-source recovery, dynamic focus, Litany pagination and malformed-cache eviction with EXPLICIT TEST FIXTURES");
 console.log("NOT_CERTIFIED genuine Litany witness, Scripture original edition, offline fresh-install availability");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
