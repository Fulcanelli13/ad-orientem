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
      deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce",
      timezoneId:"Indian/Mauritius"});
    try{
      const page=await ctx.newPage(),errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      // Simulate the actual 1 November 2026 morning in Mauritius; the
      // release gate must remain deterministic on later CI calendar dates.
      await page.clock.setFixedTime(new Date("2026-11-01T08:30:00+04:00"));
      await page.goto("http://127.0.0.1:"+server.address().port+
        "/index.html?aoR17Reader=native&qa=mass-reader-phone",
        {waitUntil:"domcontentloaded",timeout:90000});
      await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.revealDate &&
        globalThis.AO_R17_BROWSER_ENTRY?.selectTodayOption),null,{timeout:90000});
      if(test.language==="en"){
        // Reproduce the reported failure: Oct 31 remained selected although
        // the real local day was Nov 1. A single Begin may NOT enter it.
        assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345
          .revealDate("2026-10-31",{forceLoader:false,prefetch:false})),true);
        await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()
          ?.resolution?.date==="2026-10-31");
        await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
        await page.locator(".aoH7HomeView [data-home-h7-enter]").click();
        const oldDoor=page.locator(".aoH7DoorView:not([hidden])");
        await oldDoor.locator("[data-home-h4-begin]").click();
        const alert=oldDoor.locator("[data-home-mass-date-warning]");
        await alert.waitFor({state:"visible"});
        assert.match(await alert.innerText(),/2026-10-31/);
        assert.match(await alert.innerText(),/2026-11-01/);
        assert.equal(await page.evaluate(()=>Boolean(window.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)),false);
        await alert.locator("[data-home-mass-use-today]").click();
        await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()
          ?.resolution?.date==="2026-11-01",null,{timeout:60000});
      }
      const selected=await page.evaluate(()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345
        .revealDate("2026-11-01",{forceLoader:false,prefetch:false}));
      assert.equal(selected,true);
      await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date===
        "2026-11-01"&&globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.proper?.status==="ready",
        null,{timeout:60000});
      await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
      await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
        null,{timeout:35000});
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
      assert.equal(await page.evaluate(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()
        ?.fullMassPreflight?.aspersionDecisionRequired),true);
      // Closing an untouched selector must not silently omit the Sunday rite.
      await choices.locator("[data-h4-sheet-close]").last().click();
      await door.locator("[data-home-h4-begin]").click();
      await choices.waitFor({state:"visible"});
      await choices.locator('[data-h4-option="aspersion"]').selectOption("yes");
      await choices.locator('[data-h4-option="beforeMass"]').selectOption("none");
      await choices.locator('[data-h4-option="readerMode"]').selectOption("LIVE");
      await choices.locator('[data-h4-option="readerLanguage"]').selectOption(test.language);
      assert.equal(await page.evaluate(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()
        ?.fullMassPreflight?.optionalRiteOverrides?.ASPERGES),true);
      await choices.locator("[data-h4-sheet-close]").last().click();
      await door.locator("[data-home-h4-begin]").click();
      await page.waitForFunction(()=>window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id==="ASP-R01",
        null,{timeout:65000});
      const expected=await page.evaluate(()=>{
        const s=globalThis.AO_RUNTIME_V8.store.getState(),
          m=globalThis.AO_R17_NATIVE_READER_PREVIEW.model;
        return {date:s.selectedDate,principal:s.resolution?.day?.main?.id,
          proper:s.resolution?.proper?.data?.sourcePath,
          gloria:m.cards.filter(c=>/Gloria/i.test(c.title??"")).length,
          credo:m.cards.filter(c=>/Credo/i.test(c.title??"")).length};
      });
      assert.equal(expected.date,"2026-11-01");
      assert.equal(expected.principal,"sancti:11-01:1:w");
      assert.equal(expected.proper,"Sancti/11-01");
      assert.ok(expected.gloria>=3,"All Saints: native LIVE Gloria cards absent: "+JSON.stringify(expected));
      assert.ok(expected.credo>=4,"All Saints: native LIVE Credo cards absent: "+JSON.stringify(expected));
      await page.screenshot({path:dir+"/"+test.width+"-"+test.language+"-asperges-entry.png",
        animations:"disabled"});
      const nav=page.locator('#ao-r17-native-reader-preview [data-reader-nav="next"]');
      for(let n=0;n<5;n++){
        await nav.click();
        await page.waitForTimeout(100);
      }
      await page.waitForFunction(()=>{const c=window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.();
        return (c?.sourceSectionId??c?.sectionId)==="AO.CARD.001";},null,{timeout:20000});
      const after=await page.evaluate(()=>{
        const c=window.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard();
        return {id:c.sourceSectionId??c.sectionId,firstBlock:c.blocks?.[0]?.blockId,
          count:window.AO_R17_NATIVE_READER_PREVIEW.model?.totalCards};
      });
      assert.equal(after.firstBlock,"AO.SM.B001");
      assert.ok([65,66,67].includes(after.count),"Native curated Mass allows source-owned optional cards: "+after.count);
      // A source card existing in the 65-card corpus is NOT enough: the
      // actual selected Mass must allow navigation to Gloria and Credo.
      const visible=await page.evaluate(()=>{
        const api=window.AO_R17_NATIVE_READER_PREVIEW;
        // LIVE has multiple distinct presentation sectionIds per source macro.
        // showSection requires the real presentation section ID, never
        // AO.CARD.00x (which is only a sourceSectionId on 65-card LIVE).
        const go=sourceId=>{
          const card=api.model.cards.find(c=>c.sourceSectionId===sourceId);
          if(!card)return false;
          const result=api.showSection(card.sectionId);
          return Boolean(result)&&api.getCurrentCard()?.sectionId===card.sectionId;
        };
        const gloria=go("AO.CARD.003"),credo=go("AO.CARD.009"),
          returned=go("AO.CARD.001");
        return {gloria,credo,returned};
      });
      assert.deepEqual(visible,{gloria:true,credo:true,returned:true},
        "All Saints selected reader omitted a required Ordinary section");
      assert.deepEqual(errors,[]);
      console.log("PASS H7 Sunday Asperges → Foot "+test.form+"/"+test.language);
    }finally{await ctx.close()}
  }
  // 2 November: cover the actual H7 Home → Mass door handoff. The existing
  // source-led November gate already audits the six modes and all three
  // formularies; this tests only the previously uncovered user entry route.
  for(const test of [
    {index:0,form:"LOW",language:"en",width:390},
    {index:1,form:"SOLEMN",language:"fr",width:320},
    {index:2,form:"MISSA_CANTATA_INCENSE",language:"en",width:390},
  ]){
    const expected="Sancti/11-02m"+(test.index+1);
    const ctx=await browser.newContext({viewport:{width:test.width,height:844},
      isMobile:true,hasTouch:true,locale:test.language==="fr"?"fr-FR":"en-GB",
      deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce",
      timezoneId:"Indian/Mauritius"});
    try{
      const page=await ctx.newPage(),errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      // Nov 2 real-day entry must be tested with a Nov 2 local clock,
      // not as an unconfirmed alternative selected on Nov 1.
      await page.clock.setFixedTime(new Date("2026-11-02T08:30:00+04:00"));
      await page.goto("http://127.0.0.1:"+server.address().port+
        "/index.html?aoR17Reader=native&qa=mass-reader-phone",
        {waitUntil:"domcontentloaded",timeout:90000});
      await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.revealDate &&
        globalThis.AO_R17_BROWSER_ENTRY?.selectTodayOption),null,{timeout:90000});
      assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345
        .revealDate("2026-11-02",{forceLoader:false,prefetch:false})),true);
      await page.waitForFunction(()=>{const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
        return s?.selectedDate==="2026-11-02"&&s?.resolution?.date==="2026-11-02"&&
          s?.resolution?.proper?.status==="ready"&&!s.resolving;},null,{timeout:60000});
      await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
      await page.locator(".aoH7HomeView [data-home-h7-enter]").waitFor({state:"visible",timeout:35000});
      await page.locator(".aoH7HomeView [data-home-h7-enter]").click();
      let door=page.locator(".aoH7DoorView:not([hidden])");
      await door.waitFor({state:"visible",timeout:18000});
      if(test.index!==0){
        // Use the actual visible button; never mutate resolver internals
        // or substitute a fictitious Proper in this entry acceptance.
        const choice=door.locator('[data-formulary="'+test.index+'"]');
        await choice.waitFor({state:"visible",timeout:18000});
        await choice.click();
        await page.waitForFunction(path=>{
          const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
          return s?.selectedDate==="2026-11-02"&&s.resolution?.date==="2026-11-02"&&
            s.resolution?.proper?.status==="ready"&&s.resolution?.proper?.data?.sourcePath===path;
        },expected,{timeout:60000});
        door=page.locator(".aoH7DoorView:not([hidden])");
        if(!await door.isVisible()){
          await page.locator(".aoH7HomeView [data-home-h7-enter]").click();
          await door.waitFor({state:"visible",timeout:15000});
        }
      }
      const calendar=await page.evaluate(()=>{
        const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
        return {selectedDate:s?.selectedDate,resolvedDate:s?.resolution?.date,
          source:s?.resolution?.proper?.data?.sourcePath};
      });
      assert.deepEqual(calendar,{selectedDate:"2026-11-02",
        resolvedDate:"2026-11-02",source:expected},
        "H7 selected the wrong All Souls Proper before Mass entry");
      await door.locator("[data-home-h4-change]").first().click();
      const choices=page.locator(".aoH4ChoiceDialog[open]");
      await choices.waitFor({state:"visible",timeout:18000});
      await choices.locator('[data-h4-option="form"]').selectOption(test.form);
      const asp=choices.locator('[data-h4-option="aspersion"]');
      assert.equal(await asp.isDisabled(),true,"Weekday Requiem must not suggest Sunday Asperges");
      await choices.locator('[data-h4-option="beforeMass"]').selectOption("none");
      await choices.locator('[data-h4-option="readerMode"]').selectOption("LIVE");
      await choices.locator('[data-h4-option="readerLanguage"]').selectOption(test.language);
      await choices.locator("[data-h4-sheet-close]").last().click();
      const prepared=await page.evaluate(async()=>{
        const p=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
        const m=p?.session?.resolvedMass;
        return {date:m?.date,source:m?.proper?.data?.sourcePath??m?.proper?.sourcePath,
          overlays:m?.overlays??[],readerMode:p?.readerPreferences?.mode};
      });
      assert.equal(prepared.date,"2026-11-02","Mass handoff silently reverted to yesterday");
      assert.equal(prepared.source,expected,"Mass handoff replaced All Souls selected formulary");
      assert.ok(prepared.overlays.includes("REQUIEM"),"All Souls lost Requiem overlay in H7");
      assert.equal(prepared.readerMode,"LIVE","H7 did not retain the selected reader mode");
      await door.locator("[data-home-h4-begin]").click();
      await page.waitForFunction(()=>Boolean(window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()),
        null,{timeout:65000});
      const first=await page.evaluate(()=>{
        const c=window.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard();
        return {id:c?.id,sourceSection:c?.sourceSectionId??c?.sectionId,
          total:window.AO_R17_NATIVE_READER_PREVIEW.model?.totalCards};
      });
      assert.equal(first.sourceSection,"AO.CARD.001",
        "2 November should start the normal Requiem entry, not Sunday Asperges");
      assert.deepEqual(errors,[]);
      await page.screenshot({path:dir+"/all-souls-m"+(test.index+1)+"-"+test.width+
        "-"+test.language+"-h7-entry.png",animations:"disabled"});
      console.log("PASS H7 All Souls "+expected+" → LIVE Requiem "+test.form+"/"+test.language);
    }finally{await ctx.close()}
  }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
