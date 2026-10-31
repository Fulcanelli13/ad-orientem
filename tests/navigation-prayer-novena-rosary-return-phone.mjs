import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const folder=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(folder,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(!path.startsWith(folder+sep)){res.writeHead(403);return res.end()}
  const data=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
async function nav(page,route,options={}){
 const answer=await page.evaluate(({route,options})=>globalThis.AO_APP_SHELL_V1.navigate(route,options),{route,options});
 assert.equal(answer?.ok,true,"Navigate "+route+" failed: "+JSON.stringify(answer));
}
async function back(page){
 await nav(page,"learn");
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.status().returnAvailable),true,
  "Prayer return receipt missing");
 assert.equal(await page.locator("#aoPrayerBookRoot.open").count(),0,
  "Rosary donor remained open over Formation");
 assert.equal(await page.locator("#aoPray435930.open").count(),0,
  "Prayer sheet remained open over Formation");
 await page.evaluate(()=>history.back());
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray"&&
  globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:22000});
}
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?640:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true&&
    globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:45000});
   await nav(page,"settings");
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.locator('#ao-settings-modular-root [data-settings-close]').click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language);
   await nav(page,"pray");

   // Novena: the selected source record, exact day, guide chapter and
   // language are owned by AO_NOVENAS_V3, not by a replacement Prayer router.
   assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.open()),true);
   const nv=page.locator("#aoPray435930.open");
   await nv.locator('[data-n1-select="st_michael"]').click();
   const begin=nv.locator("[data-n1-begin]").first();
   await begin.click();
   await nv.locator('[data-n1-mode="guided"]').evaluate(x=>x.click());
   await nv.locator("[data-n1-stage-next]").click();
   const initial=await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state());
   assert.equal(initial.id,"st_michael");assert.equal(initial.screen,"day");
   assert.equal(initial.stage,1);
   const chapterId=await nv.locator(".aoN1Reader .aoDevoCard").getAttribute("data-ao-devo-card");
   const preScroll=await page.evaluate(()=>{
    const x=document.querySelector("#aoPray435930 .aoN1Reader .aoDevoCardScroll");
    x.scrollTop=100;x.dispatchEvent(new Event("scroll",{bubbles:true}));return x.scrollTop;
   });
   await back(page);
   const restored=await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state());
   for(const key of ["screen","id","day","mode","stage","showEnglish"])
    assert.equal(restored[key],initial[key],"Novena "+key+" changed after Back");
   assert.equal(await nv.locator(".aoP435930Mount").getAttribute("data-ao-pray-view"),"novenas");
   assert.equal(await nv.locator(".aoN1Reader .aoDevoCard").getAttribute("data-ao-devo-card"),chapterId);
   await page.waitForTimeout(160);
   const postScroll=await page.evaluate(()=>document.querySelector("#aoPray435930 .aoN1Reader .aoDevoCardScroll")?.scrollTop);
   assert.ok(Math.abs(postScroll-preScroll)<=4,"Novena scroll lost "+preScroll+" -> "+postScroll);
   await page.waitForFunction(()=>document.querySelector(
    "#aoPray435930 .aoN1Reader .aoDevoCardScroll")?.querySelectorAll(".aoDevoParagraph").length>0,
    null,{timeout:12000});

   // Rosary: the Prayer view legitimately closes when the historical
   // canonical bead donor opens. It must be captured separately.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary_methods"));
   await nv.locator("[data-p435930-rosary-begin]").click();
   const rosary=page.locator("#aoPrayerBookRoot.open");
   await rosary.locator("[data-lab-rosary-today]").click();
   await page.waitForFunction(()=>globalThis.AO_ROSARY_V381?.steps?.()?.length>60&&
    document.querySelector("#aoPrayerBookRoot.open .pbShell[data-ao-rosary-exact-donor='v3.4.14']"),
    null,{timeout:20000});
   for(let i=0;i<7;i++)await rosary.locator("[data-lab-rosary-next]").click();
   await page.waitForFunction(()=>globalThis.AO_ROSARY_V381?.state?.()?.step===7,null,{timeout:12000});
   // Contemplation cards correctly do not have prayer paragraph scroll.
   // Advance through the donor's own steps to the next real prayer card,
   // and only then verify prayer focus and exact scroll restoration.
   let foundPrayer=false;
   for(let i=0;i<30;i++){
    const source=await page.evaluate(()=>{
     const state=window.AO_ROSARY_V381?.state?.(),card=document.querySelector(
      "#aoPrayerBookRoot.open .aoRosaryActiveCard");
     return {step:state?.step,visual:Number(card?.dataset.aoRosaryCanonicalStep),
      prayer:!!card?.querySelector(".aoRosaryPrayerScroll")};
    });
    if(source.step===source.visual&&source.prayer){foundPrayer=true;break}
    assert.ok(Number.isInteger(source.step)&&source.step>=0,"Rosary source step unavailable");
    await rosary.locator("[data-lab-rosary-next]").click();
    await page.waitForFunction(prev=>window.AO_ROSARY_V381?.state?.()?.step===prev+1,
     source.step,{timeout:10000});
   }
   assert.equal(foundPrayer,true,"No canonical prayer bead reached after the Rosary contemplation card");
   // A PrayerBook Latin flip is a reading-face choice, not a new bead.
   // Preserve it exactly when the canonical current card exposes both faces.
   const flip=rosary.locator(".aoRosaryActiveCard .lab-prayer-flip[data-pb-flip]");
   const hasFlip=await flip.count()>0;
   if(hasFlip){
    await flip.click();
    await page.waitForFunction(()=>document.querySelector(
      "#aoPrayerBookRoot.open .aoRosaryActiveCard .lab-prayer-flip[data-pb-flip]")?.dataset.face==="latin",
      null,{timeout:10000});
   }
   const before=await page.evaluate(()=>({
    method:globalThis.AO_ROSARY_V381.getMethod(),state:globalThis.AO_ROSARY_V381.state(),
    card:document.querySelector("#aoPrayerBookRoot.open .aoRosaryActiveCard")?.dataset.aoRosaryCanonicalStep,
    count:document.querySelectorAll("#aoPrayerBookRoot.open").length
   }));
   assert.equal(before.count,1);
   assert.equal(Number(before.card),before.state.step);
   const beforeScroll=await page.evaluate(()=>{
    const x=document.querySelector("#aoPrayerBookRoot.open .aoRosaryActiveCard .aoRosaryPrayerScroll");
    if(!x)throw Error("Source Rosary active scroll missing");
    x.scrollTop=65;x.dispatchEvent(new Event("scroll",{bubbles:true}));return x.scrollTop;
   });
   await back(page);
   const after=await page.evaluate(()=>({
    method:globalThis.AO_ROSARY_V381.getMethod(),state:globalThis.AO_ROSARY_V381.state(),
    card:document.querySelector("#aoPrayerBookRoot.open .aoRosaryActiveCard")?.dataset.aoRosaryCanonicalStep,
    count:document.querySelectorAll("#aoPrayerBookRoot.open").length,
    rootVisible:!!document.querySelector("#aoPrayerBookRoot.open"),
    prayerVisible:!!document.querySelector("#aoPray435930.open"),
   }));
   if(hasFlip)assert.equal(await rosary.locator(
    ".aoRosaryActiveCard .lab-prayer-flip[data-pb-flip]").getAttribute("data-face"),"latin",
    "Rosary Latin face reset after Back");
   assert.equal(after.method,before.method,"Rosary method changed");
   assert.equal(after.state.set,before.state.set,"Mystery set changed");
   assert.equal(after.state.step,before.state.step,"Exact Rosary bead reset");
   assert.equal(Number(after.card),before.state.step,"Visible Rosary card lost canonical bead");
   assert.equal(after.count,1,"Second Rosary donor mounted");
   assert.equal(after.prayerVisible,false,"Competing Prayer sheet mounted over Rosary");
   await page.waitForTimeout(175);
   const afterScroll=await page.evaluate(()=>document.querySelector(
    "#aoPrayerBookRoot.open .aoRosaryActiveCard .aoRosaryPrayerScroll")?.scrollTop);
   assert.ok(Math.abs(afterScroll-beforeScroll)<=4,
    "Rosary paragraph focus scroll lost "+beforeScroll+" -> "+afterScroll);
   await page.waitForFunction(()=>document.querySelectorAll(
    "#aoPrayerBookRoot.open .aoRosaryActiveCard .aoDevoParagraph[data-ao-devo-active='true']").length===1,
    null,{timeout:10000});
   // Fresh navigation is not implicit continuation or a second reader.
   await nav(page,"learn");await nav(page,"pray");
   assert.equal(await page.locator("#aoPrayerBookRoot.open").count(),0,"Old Rosary over fresh Prayer");
   assert.equal(await page.locator("#aoPray435930.open .aoP435930Mount").getAttribute("data-ao-pray-view"),"home");
   assert.deepEqual(errors,[],"Browser errors: "+errors.join("; "));
   console.log("PASS P5 "+width+"px "+language+
    ": Novena day/stage/lang/scroll; Rosary method/mystery/bead/focus; no ghost overlays; fresh Prayer");
  }finally{await context.close()}
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}