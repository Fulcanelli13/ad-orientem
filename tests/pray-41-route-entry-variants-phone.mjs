import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAYER_DOOR_ORDER_V1} from "../src/pray/prayer-design-pilot.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";

/**
 * Entry-level evidence only. This tests real nine-door taps at 320/390px in
 * English and French; it does not certify all stages, all Latin flips, offline
 * installation, independent print editions, or completion of a devotion.
 * The canonical Lab Ora Rosary is delegated; this suite must not replace it.
 */
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-41-route-entry");
const matrix=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-language-route-matrix.v1.json"),"utf8"));
const ledger=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-release-coverage-evidence.v1.json"),"utf8"));
const routes=matrix.routes;
assert.equal(routes.length,41,"Reconcile the route census before widening the browser gate");
assert.deepEqual(routes.map(x=>x.id).sort(),ledger.routes.map(x=>x.id).sort());
const shelved=Object.values(PRAYER_DOOR_ORDER_V1).flat();
assert.equal(new Set(shelved).size,39,"Nine-door entries changed");
assert.deepEqual(routes.filter(x=>!shelved.includes(x.id)).map(x=>x.id).sort(),
 ["pray.library","pray.sacred_hymns"]);
assert.equal(ledger.counts.fullRouteVariantCertificates,0,
 "Entry smoke checks must not be represented as all-stage route certification");

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const report={schema:"ao.pray.41-route-entry-browser-evidence.v1",scope:"ENTRY_ONLY_NOT_ALL_STAGES_OR_OFFLINE",
 devices:[320,390],languages:["en","fr"],routeInventory:routes.map(x=>x.id),
 cases:[],errors:[],certifiesFullRouteVariants:false,certifiesPrintEditions:false};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const context=await browser.newContext({
   viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,
   deviceScaleFactor:1,locale:language==="fr"?"fr-FR":"en-GB",
   serviceWorkers:"block",reducedMotion:"reduce"
  });
  const page=await context.newPage(),exceptions=[];
  page.on("pageerror",error=>exceptions.push(error.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&
    typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   const settings=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"));
   assert.equal(settings?.ok,true,"Settings unreachable");
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(language=>document.documentElement.lang===language,language,{timeout:10000});
   const navigate=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"));
   assert.equal(navigate?.ok,true,"Prayer entry unavailable");
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const hub=async()=>{
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null})),true);
    await page.locator("#aoPray435930.open [data-ao-pray-pilot-mosaic]").waitFor({timeout:15000});
   };
   // Place the Rosary last: it correctly closes the Prayer sheet and transfers
   // control to the ORIGINAL Lab Ora player, not another Prayer card engine.
   for(const row of routes.filter(x=>x.id!=="pray.rosary").concat(routes.filter(x=>x.id==="pray.rosary"))){
    const id=row.id,door=row.doors[0]||null;
    if(id==="pray.sacred_hymns"){
     const launch=await page.evaluate(id=>globalThis.AO_MODULES.open(id,{returnContext:null}),id);
     assert.equal(launch?.ok,true,id+" search-only registry handoff unavailable");
    }else{
     await hub();
     if(id==="pray.library"){
      await page.locator('#aoPray435930.open [data-p435930-own="pray.library"]').first().click();
     }else{
      assert.ok(door,id+" has no nine-door parent");
      await page.locator('#aoPray435930.open [data-p435930-family="'+door+'"]').first().click();
      await page.locator('#aoPray435930.open [data-ao-prayer-shelf="'+door+'"]').waitFor({timeout:12000});
      const attr=row.sourceFamily==="canonical-prayer"?"data-p435930-door-prayer":
       "data-p435930-own";
      const own='#aoPray435930.open [data-ao-prayer-shelf="'+door+'"] ['+attr+'="'+id+'"]';
      const external='#aoPray435930.open [data-ao-prayer-shelf="'+door+'"] [data-p435930-external="'+id+'"]';
      const target=page.locator(own+","+external).first();
      assert.equal(await target.count(),1,id+" missing from its declared discovery shelf");
      await target.click({timeout:15000});
     }
    }
    // Opening the Rosary first enters the original PrayerBook landing.
    // The canonical exact-donor bead player mounts after its real Today tap.
    if(id==="pray.rosary"){
     const today=page.locator("#aoPrayerBookRoot.open [data-lab-rosary-today]");
     await today.waitFor({state:"visible",timeout:12000});
     await today.click();
    }
    const expected=id==="pray.rosary"?"rosary":row.sourceFamily==="canonical-prayer"?
     "library":row.sourceFamily==="novena-programmes"?"novenas":
     row.sourceFamily==="traditional-pray"?"traditional-pray":internalPrayerView(id);
    assert.ok(expected,id+" has no known runtime owner");
    console.log("PRAY_ENTRY_CHECK "+width+"px "+language+" "+id+" -> "+expected);
    await page.waitForFunction(({expected,id})=>{
     if(expected==="rosary")return !!document.querySelector("#aoPrayerBookRoot.open .pbShell[data-ao-rosary-exact-donor='v3.4.14']")&&globalThis.AO_ROSARY_V381?.steps?.()?.length>60;
     const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
     return m?.dataset.aoPrayView===expected &&
      (expected!=="traditional-pray"||m.dataset.aoTraditionalPrayRoute===id);
    },{expected,id},{timeout:18000}).catch(async error=>{
     const detail=await page.evaluate(()=>{
      const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
      const r=document.querySelector("#aoPrayerBookRoot.open .pbShell");
      return {view:m?.dataset.aoPrayView,traditionalRoute:m?.dataset.aoTraditionalPrayRoute,
       text:(m?.innerText||"").slice(0,300),rosaryVisible:!!r,
       rosarySteps:globalThis.AO_ROSARY_V381?.steps?.()?.length,
       mounted:!!document.querySelector("#aoPray435930.open"),
       routeError:document.querySelector("[data-p435930-internal-route-error],[data-p435930-family-open-error]")?.textContent||null,
       currentLang:document.documentElement.lang};
     });
     throw new Error("PRAY_ENTRY_TIMEOUT "+width+"px "+language+" route="+id+
      " expected="+expected+" observed="+JSON.stringify(detail)+" "+String(error));
    });
    const observed=await page.evaluate(({expected,id})=>{
     const rosary=expected==="rosary",shell=rosary?
      document.querySelector("#aoPrayerBookRoot.open .pbShell"):
      document.querySelector("#aoPray435930.open .aoP435930Mount");
     const main=shell?.querySelector("main.aoP435930Body")||shell;
     const source=main?.innerText?.trim()||"";
     const prayer=main?.querySelector(".aoP435930Prayer .aoEssentialFlowTextToggle,.aoP435930Prayer .aoEssentialFlowPlain,.aoP435930Prayer .aoP435930Text,.aoP435930Prayer .aoP435930Flip");
     const libraryList=main?.querySelectorAll("[data-p435930-lib-open]").length||0;
     const reader=main?.querySelector(".aoDevoCardScroll,.aoRosaryPrayerScroll");
     const active=main?.querySelectorAll('.aoDevoParagraph[data-ao-devo-active="true"]').length||0;
     return {id,owner:rosary?"rosary":shell?.dataset.aoPrayView,
      sourceChars:source.length,prayerChars:prayer?.textContent?.trim().length||0,
      libraryList,documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      shellOverflow:shell?Math.max(0,shell.scrollWidth-shell.clientWidth):null,
      verticalScrollbar:shell?Math.max(0,shell.offsetWidth-shell.clientWidth-
        parseFloat(getComputedStyle(shell).borderLeftWidth||0)-
        parseFloat(getComputedStyle(shell).borderRightWidth||0)):null,
      contentOverflow:shell?Math.max(0,shell.scrollWidth-shell.clientWidth-
        Math.max(0,shell.offsetWidth-shell.clientWidth-
          parseFloat(getComputedStyle(shell).borderLeftWidth||0)-
          parseFloat(getComputedStyle(shell).borderRightWidth||0))):null,
      readerVertical:reader?getComputedStyle(reader).overflowY:null,active,
      errorCount:document.querySelectorAll("[data-p435930-internal-route-error],[data-p435930-family-open-error],[data-p435930-home-error]").length,
      rosaryOriginal:rosary?Boolean(document.querySelector("#aoPrayerBookRoot.open .pbShell[data-ao-rosary-exact-donor]")):null,
      uiLanguage:document.documentElement.lang,
      overflowNodes:shell&&shell.scrollWidth-shell.clientWidth>2?[...shell.querySelectorAll("*")]
        .map(el=>{const r=el.getBoundingClientRect(),p=shell.getBoundingClientRect();
          return {node:el.tagName.toLowerCase()+"."+String(el.className||"").slice(0,85),
            right:Math.round(r.right-p.left),width:Math.round(r.width),ownOverflow:el.scrollWidth-el.clientWidth};})
        .filter(el=>el.right>shell.clientWidth+2||el.ownOverflow>2)
        .sort((a,b)=>b.right-a.right).slice(0,12):[]};
    },{expected,id});
    // The original Rosary player can remount asynchronously after its Today handoff.
    // Reconfirm the same exact donor in one atomic browser observation rather than
    // treating a transitional empty frame as replacement. This never accepts a
    // substitute player: the canonical donor marker and bead API are both required.
    if(id==="pray.rosary"&&!observed.rosaryOriginal){
      const donorProof=await page.waitForFunction(()=>{
        const root=document.querySelector("#aoPrayerBookRoot.open");
        const donor=root?.querySelector('.pbShell[data-ao-rosary-exact-donor="v3.4.14"]');
        const steps=globalThis.AO_ROSARY_V381?.steps?.();
        return donor&&Array.isArray(steps)&&steps.length>60
          ?{original:true,steps:steps.length}:false;
      },null,{timeout:12000});
      observed.rosaryOriginal=(await donorProof.jsonValue())?.original===true;
    }
    report.cases.push({width,language,door:door||"search-or-library",...observed});
    assert.equal(observed.owner,expected,id+" opened the wrong reader at "+width+" "+language);
    assert.equal(observed.uiLanguage,language,id+" changed global language without consent");
    assert.ok(observed.sourceChars>=10,id+" has no visible entry at "+width+" "+language);
    assert.ok(observed.documentOverflow<=2&&observed.contentOverflow<=2,
     id+" clips "+width+"px "+language+" phone: "+JSON.stringify(observed));
    assert.equal(observed.errorCount,0,id+" showed a route error");
    if(row.sourceFamily==="canonical-prayer")
     assert.ok(observed.prayerChars>=10,id+" canonical source card did not render");
    if(id==="pray.library"){
      assert.equal(observed.libraryList,32,"Essential Prayers discovery entry must show the 32-card case");
      assert.equal(await page.locator('#aoPray435930.open [data-ao-pray-essential-landing]').count(),1);
      await page.locator('#aoPray435930.open [data-p435930-lib-all]').click();
      assert.ok(await page.locator('#aoPray435930.open [data-p435930-lib-open]').count()>=48,
       "The full Prayer Library must remain available via an explicit link");
    }
    if(id==="pray.rosary")assert.equal(observed.rosaryOriginal,true,"Rosary donor was replaced");
    if(row.sourceFamily==="canonical-prayer"){
     await page.locator("#aoPray435930.open [data-p435930-lib-back]").click();
     assert.equal(await page.locator('#aoPray435930.open [data-ao-prayer-shelf="'+door+'"]').count(),1,
      "Canonical prayer Back did not return to "+door);
    }
   }
   assert.deepEqual(exceptions,[],width+"px "+language+" browser exceptions");
   console.log("PASS Prayer entry "+width+"px "+language+": 41/41 source-owned routes");
  }catch(error){
   report.errors.push({width,language,message:String(error?.stack||error)});
   throw error;
  }finally{await context.close()}
 }
 assert.equal(report.cases.length,164,"41 routes x 2 widths x 2 UI languages required");
 assert.equal(new Set(report.cases.map(x=>x.id)).size,41,"Route not exercised by browser");
 console.log("PASS 164/164 Prayer entry variants. ENTRY ONLY; all-stage/offline/print claims remain held.");
}finally{
 await mkdir(output,{recursive:true});
 await writeFile(resolve(output,"browser-entry-variants.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
