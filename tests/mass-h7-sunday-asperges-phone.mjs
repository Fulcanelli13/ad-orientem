// Emergency integration: actual H7 Home → Change → conditional Sunday Asperges → R17.
// No synthetic Proper, no publication of scores and no changes to approved H7 art.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dir=resolve(root,"artifacts/mass-h7-sunday-asperges");
await mkdir(dir,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
    res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream",
      "cache-control":"no-store"});
    res.end(await readFile(path));
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const test of [
    {form:"MISSA_CANTATA_SIMPLE",language:"en",width:390},
    {form:"SOLEMN",language:"fr",width:320}
  ]){
    const ctx=await browser.newContext({viewport:{width:test.width,height:844},
      isMobile:true,hasTouch:true,locale:test.language==="fr"?"fr-FR":"en-GB",
      deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce"});
    try{
      const page=await ctx.newPage(),errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      await page.goto("http://127.0.0.1:"+server.address().port+
        "/index.html?aoTodayH4=0&aoR17Reader=native",
        {waitUntil:"domcontentloaded",timeout:90000});
      await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.revealDate &&
        globalThis.AO_R17_BROWSER_ENTRY?.selectTodayOption),null,{timeout:90000});
      const selected=await page.evaluate(()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345
        .revealDate("2026-11-01",{forceLoader:false,prefetch:false}));
      assert.equal(selected,true);
      await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date===
        "2026-11-01"&&globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.proper?.status==="ready",
        null,{timeout:60000});
      const enter=page.locator(".aoH7HomeView [data-home-h7-enter]");
      await enter.waitFor({state:"visible",timeout:35000});await enter.click();
      const door=page.locator(".aoH7DoorView:not([hidden])");
      await door.waitFor({state:"visible",timeout:18000});
      await door.locator("[data-home-h4-change]").first().click();
      const choices=page.locator(".aoH4ChoiceDialog[open]");
      await choices.waitFor({state:"visible",timeout:18000});
      await choices.locator('[data-h4-option="form"]').selectOption(test.form);
      const asp=choices.locator('[data-h4-option="aspersion"]');
      assert.equal(await asp.isEnabled(),true,"1962 Sung Sunday Asperges unavailable in H7");
      assert.equal(await asp.inputValue(),"no","Asperges must not be invented from the date");
      await asp.selectOption("yes");
      await choices.locator('[data-h4-option="beforeMass"]').selectOption("none");
      await choices.locator('[data-h4-option="readerMode"]').selectOption("LIVE");
      await choices.locator('[data-h4-option="readerLanguage"]').selectOption(test.language);
      assert.equal(await page.evaluate(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()
        ?.fullMassPreflight?.optionalRiteOverrides?.ASPERGES),true);
      await choices.locator("[data-h4-sheet-close]").last().click();
      await door.locator("[data-home-h4-begin]").click();
      await page.waitForFunction(()=>window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id==="ASP-R01",
        null,{timeout:65000});
      await page.screenshot({path:dir+"/"+test.width+"-"+test.language+"-asperges-entry.png",
        animations:"disabled"});
      const nav=page.locator('#ao-r17-native-reader-preview [data-reader-nav="next"]');
      for(let n=0;n<5;n++){
        await nav.click();
        await page.waitForTimeout(100);
      }
      await page.waitForFunction(()=>window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId===
        "AO.CARD.001",null,{timeout:20000});
      const after=await page.evaluate(()=>{
        const c=window.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard();
        return {id:c.sectionId,firstBlock:c.blocks?.[0]?.blockId,
          count:window.AO_R17_NATIVE_READER_PREVIEW.model?.totalCards};
      });
      assert.equal(after.firstBlock,"AO.SM.B001");
      assert.equal(after.count,65);
      assert.deepEqual(errors,[]);
      console.log("PASS H7 Sunday Asperges → Foot "+test.form+"/"+test.language);
    }finally{await ctx.close()}
  }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
