// Browser-facing audit: a resolver match alone does not prove a painting appears.
// Two existing reader destinations are exercised, the unimplemented Seven Sorrows
// chaplet stage is explicitly held rather than substituted into the Holy Rosary.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {confessionExaminationCards,confessionExtendedSections,confessionRiteCards} from "../src/pray/confession-paths.js";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {NIGHTLY_EXAMEN_CARDS} from "../src/pray/guided-daily-cards.js";
import {resolvePrayerEditorialArtwork} from "../src/pray/art-slot-map.v1.js";
import {supportedDirectPrayerRoute} from "../src/pray/internal-route-owner.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/prayer-three-destinations-20261103");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".jpg":"image/jpeg",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
  const raw=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(raw);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
let browser;
const results={schema:"AO_PRAYER_THREE_DESTINATION_LIVE_AUDIT_V1",scope:"REAL_BROWSER_2_DESTINATIONS_1_MISSING_READER_HOLD",
  cases:[],held:[],releaseClaims:{full267Visible:false,sevenSorrowsReaderImplemented:false}};
function exact(slot,expected){
 const a=resolvePrayerEditorialArtwork(slot);
 assert.equal(a.state,"PUBLISHED_EXACT_PHOTO",slot);
 assert.equal(a.artId,expected,slot);
 assert.ok(a.photo?.source?.startsWith("https://www.metmuseum.org/art/collection/search/"));
 return a;
}
exact("STG-pray.confession-02","latour");
exact("COV-daily.nightly_examen","latour");
exact("STG-prayer.seven_sorrows_chaplet-02","giordano-flight");
assert.equal(supportedDirectPrayerRoute("prayer.seven_sorrows_chaplet"),false,
  "If Seven Sorrows becomes a real reader, add its actual route browser acceptance; never claim it remains unimplemented");
assert.equal(supportedDirectPrayerRoute("pray.seven_sorrows_chaplet"),false);
results.held.push({slot:"STG-prayer.seven_sorrows_chaplet-02",photo:"giordano-flight",
  resolved:true,activeReader:false,reason:"NO_REGISTERED_CANONICAL_SEVEN_SORROWS_CHAPLET_ROUTE",
  instruction:"Preserve existing Rosary, source-prayer sequence, and protected chaplet cover. Add artwork only after its real stage owner is installed."});
try{
 browser=await chromium.launch({headless:true});
 const url="http://127.0.0.1:"+server.address().port+"/index.html";
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},locale:ui==="fr"?"fr-FR":"en-GB",
    hasTouch:true,isMobile:true,deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const outer="#aoPray435930.open";
  const imageCheck=async (selector,slot,path,end)=>{
   const img=page.locator(selector+' [data-ao-editorial-slot="'+slot+'"] img');
   await img.waitFor({state:"attached",timeout:12000});
   assert.equal(await img.count(),1,"Exactly one approved photo in reader "+slot);
   const state=await img.evaluate(async im=>{
    im.loading="eager";await im.decode();
    const r=im.getBoundingClientRect(),parent=im.closest(".aoEditorialArtworkSlot");
    return {src:im.getAttribute("src"),naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,
     fit:getComputedStyle(im).objectFit,rect:{x:r.x,y:r.y,w:r.width,h:r.height},insideReader:!!parent,
     horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
   });
   assert.ok(state.src.endsWith(end),path+": wrong source");
   assert.equal(state.fit,"contain",path+": painting must not be cropped");
   assert.ok(state.naturalWidth>2500&&state.naturalHeight>3500,path+": photo decoding failed");
   assert.equal(state.insideReader,true,path+": only resolver binding, not in-reader presentation");
   assert.ok(state.rect.w>70&&state.rect.w<=width+1,path+": image width wrong");
   assert.ok(state.horizontalOverflow<=2,path+": horizontal overflow");
   await page.screenshot({path:resolve(out,path+"-"+width+"-"+ui+".png"),animations:"disabled"});
   return {path,ui,width,slot,...state};
  };
  try{
   await page.goto(url,{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null})),true);
   const conf=outer+" .aoP435930ConfessionReader",rail=conf+" .aoDevoSequenceTimeline";
   await page.locator(conf+' [data-p435930-conf-path="regular"]').click();
   await page.locator(conf+" [data-p435930-conf-next]").click();
   const ex=confessionExaminationCards("regular",confessionExtendedSections(
     DATA[ui==="fr"?"examFr":"exam"].sections,{path:"regular",french:ui==="fr"}));
   await page.locator(rail+' [data-ao-devo-chapter="'+(ex.length-1)+'"]').click();
   await page.locator(conf+" [data-p435930-conf-next]").click();
   await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930ConfessionReader")?.dataset.aoConfessionSection==="2",null,{timeout:12000});
   const rite=confessionRiteCards("regular"),ix=rite.findIndex(x=>x.id==="contrition-penance");
   assert.ok(ix>=0);
   await page.locator(rail+' [data-ao-devo-chapter="'+ix+'"]').click();
   await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930ConfessionReader .aoDevoCard")?.dataset.aoDevoCard==="contrition-penance",null,{timeout:12000});
   const art=await imageCheck(conf,"STG-pray.confession-02","confession-contrition","latour-penitent-magdalen-frameless.jpg");
   assert.ok(await page.locator(conf+" .aoDevoCardScroll").count(),"Confession ritual must keep its source card and text");
   assert.equal(await page.locator(conf+" input[type=text],"+conf+" textarea").count(),0,"No sins recorded");
   results.cases.push(art);

   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.nightly_examen",{returnContext:null})),true);
   const night=outer+' [data-ao-hours-owner="nightly"]';
   await page.locator(night).waitFor({timeout:15000});
   await page.waitForFunction(()=>globalThis.AO_TRADITIONAL_PRAY_V381?.state?.()?.examenStep===0);
   const nightArt=await imageCheck(night,"COV-daily.nightly_examen","nightly-examen-cover","latour-penitent-magdalen-frameless.jpg");
   assert.ok(await page.locator(night+" .aoDevoCardScroll").count(),"Original nightly source card must remain");
   await page.locator(night+' [data-tp381-examen-step="1"]').click();
   await page.waitForFunction(()=>globalThis.AO_TRADITIONAL_PRAY_V381?.state?.()?.examenStep===1);
   assert.equal(await page.locator(night+' [data-ao-editorial-slot="COV-daily.nightly_examen"]').count(),0,
    "The cover belongs to entry, not an added sixth nightly stage");
   assert.equal(NIGHTLY_EXAMEN_CARDS.filter(x=>x.id==="resolve").length,1);
   results.cases.push(nightArt);
   assert.deepEqual(errors,[],"Unhandled browser errors: "+errors.join("; "));
  }finally{await context.close();}
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
assert.equal(results.cases.length,8);
await writeFile(resolve(out,"report.json"),JSON.stringify(results,null,2)+"\n");
console.log("PASS 320/390 EN/FR real Confession Contrition and standalone Nightly Examination artworks (8 screens); Seven Sorrows chaplet still unimplemented and explicitly held");
