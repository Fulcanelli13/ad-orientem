import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+pathname);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4191,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
    locale:"en-GB",
  });
  const page=await context.newPage();
  const pageErrors=[];
  const ariaWarnings=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  page.on("console",message=>{
    const text=message.text();
    if(/blocked aria-hidden|aria-hidden.*focus|retained focus/i.test(text))ariaWarnings.push(text);
  });

  await page.goto("http://127.0.0.1:4191/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true &&
    globalThis.AO_PRAY_APP_V1?.status?.().installed===true &&
    globalThis.AO_LEARN_APP_V1?.status?.().installed===true,
    null,{timeout:30000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="home" &&
    document.documentElement.dataset.aoHomeSuppressed!=="true" &&
    document.querySelector(".homeScreen")?.dataset?.aoHomeOwner==="modular-home-v2" &&
    !document.getElementById("ao-cinema-boot"),
    null,{timeout:15000});
  await page.waitForTimeout(100);

  // HOME: exercise the visible actions that remain intentionally backed by the
  // canonical Home controller after modular presentation extraction.
  const initialDate=await page.evaluate(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate??null);
  await page.locator(".homeScreen [data-nav='next']").tap();
  await page.waitForFunction(before=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate!==before,initialDate,{timeout:10000});
  const shiftedDate=await page.evaluate(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate??null);
  assert.notEqual(shiftedDate,initialDate,"Home next-day control did not change the selected date");
  await page.locator(".homeScreen [data-nav='previous']").tap();
  await page.waitForFunction(expected=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate===expected,initialDate,{timeout:10000});

  await page.locator(".homeScreen [data-action='prepare']").tap();
  await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route==="prepare",null,{timeout:5000});
  await page.locator("[data-ao-app-surface='home']").tap();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home"&&globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route==="home",null,{timeout:5000});

  await page.locator(".homeScreen [data-action='thanks']").tap();
  await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route==="thanksgiving",null,{timeout:5000});
  await page.locator("[data-ao-app-surface='home']").tap();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home"&&globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route==="home",null,{timeout:5000});

  await page.locator(".homeScreen [data-action='gospel']").tap();
  await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route==="scripture",null,{timeout:10000});
  const scriptureClose=page.locator("[data-scripture-close]").first();
  assert.equal(await scriptureClose.count(),1,"Home Gospel action opened no visible Scripture return control");
  await scriptureClose.tap();
  await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route==="home",null,{timeout:5000});

  await page.locator(".homeScreen .massCard [data-action='today-mass']").tap();
  await page.waitForSelector("#ao-mass-flow-v1 .aoMassFlowBackdrop",{state:"visible",timeout:10000});
  const massDetailClose=page.locator("#ao-mass-flow-v1 [data-ao-close]").last();
  assert.equal(await massDetailClose.count(),1,"Today’s Mass card opened no visible close control");
  await massDetailClose.tap();
  await page.waitForFunction(()=>!document.getElementById("ao-mass-flow-v1"),null,{timeout:5000});
  await page.locator("[data-ao-app-surface='home']").tap();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:5000});

  await page.locator(".homeScreen [data-action='more']").tap();
  await page.waitForSelector(".homeSheet",{state:"visible",timeout:5000});
  const moreSettings=page.locator(".homeSheet [data-ao-settings-open]");
  assert.equal(await moreSettings.count(),1,"Home More sheet lost its Settings launcher");
  await moreSettings.tap();
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  await page.locator("#ao-settings-modular-root [data-settings-close]").first().tap();
  await page.waitForFunction(()=>!document.getElementById("ao-settings-modular-root"),null,{timeout:5000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:5000});

  // PRAY: prove every visible owned hub card actually opens its child view by touch,
  // then returns through the visible Back control. No direct module API calls.
  await page.locator("[data-ao-app-surface='pray']").tap();
  await page.waitForSelector("#aoPray435930.open",{state:"visible",timeout:15000});
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset.aoPrayView==="home",null,{timeout:5000});

  const prayRoutes=[
    ["pray.angelus_regina","angelus"],
    ["pray.rosary","rosary"],
    ["pray.adoration","adoration"],
    ["pray.benediction","benediction"],
    ["pray.forty_hours","fortyHours"],
    ["pray.confession","confession"],
    ["pray.stations","stations"],
    ["pray.penitential_psalms","penitential"],
    ["pray.seven_words","sevenWords"],
    ["pray.litany_saints","litany"],
    ["programme.first_friday","firstFriday"],
    ["programme.first_saturday","firstSaturday"],
    ["pray.library","library"],
  ];

  for(const [route,view] of prayRoutes){
    const card=page.locator(`#aoPray435930 [data-p435930-own="${route}"]`).first();
    assert.equal(await card.count(),1,`PRAY hub lost visible card for ${route}`);
    await card.scrollIntoViewIfNeeded();
    await card.tap();
    await page.waitForFunction(expected=>
      document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset.aoPrayView===expected,
      view,{timeout:5000});
    const hiddenFocus=await page.evaluate(()=>Boolean(document.activeElement?.closest?.("[aria-hidden='true'],[hidden]")));
    assert.equal(hiddenFocus,false,`PRAY ${route} left focus in a hidden surface`);
    const back=page.locator("#aoPray435930 [data-p435930-back]").first();
    assert.equal(await back.count(),1,`PRAY ${route} lost visible Back control`);
    await back.tap();
    await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset.aoPrayView==="home",null,{timeout:5000});
  }

  // Move to Learn through the permanent app ribbon. This must close PRAY.
  await page.locator("[data-ao-app-surface='learn']").tap();
  await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="learn",null,{timeout:5000});
  assert.equal(await page.locator("#aoPray435930.open").count(),0,"PRAY remained open underneath Learn");

  async function exerciseLearn(id,opened,close){
    const card=page.locator(`#ao-learn-modular-root [data-ao-learn-module="${id}"]`);
    assert.equal(await card.count(),1,`Learn hub lost visible card for ${id}`);
    await card.scrollIntoViewIfNeeded();
    await card.tap();
    await page.waitForFunction(({id,opened})=>{
      const hub=document.getElementById("ao-learn-modular-root");
      if(!hub?.hidden)return false;
      if(opened==="daily")return Boolean(document.getElementById("ao-daily-cate-root"));
      if(opened==="mass")return Boolean(document.getElementById("ao-learn-root")&&!document.getElementById("ao-learn-root").hidden);
      if(opened==="cate")return Boolean(document.getElementById("ao-cate-root")&&!document.getElementById("ao-cate-root").hidden);
      if(opened==="gospel")return globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route==="scripture";
      if(opened==="saint")return globalThis.AO_NAV_V25?.getState?.()?.panel==="saint";
      return false;
    },{id,opened},{timeout:12000});
    const closer=page.locator(close).first();
    assert.equal(await closer.count(),1,`Learn child ${id} has no visible return control`);
    await closer.tap();
    await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
    await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.().open===true&&globalThis.AO_LEARN_APP_V1?.status?.().child===null,null,{timeout:10000});
    const state=await page.evaluate(()=>({
      active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      donorVisible:Boolean(document.getElementById("ao-v37-root")&&!document.getElementById("ao-v37-root").hidden&&document.body.classList.contains("aoV37ShellOpen")),
      hiddenFocus:Boolean(document.activeElement?.closest?.("[aria-hidden='true'],[hidden]")),
      massMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
    }));
    assert.equal(state.active,"learn",`Learn child ${id} did not return to Learn`);
    assert.equal(state.donorVisible,false,`Learn child ${id} resurfaced historical V37 donor`);
    assert.equal(state.hiddenFocus,false,`Learn child ${id} returned focus into a hidden surface`);
    assert.equal(state.massMounted,false,`Learn child ${id} unexpectedly mounted Mass`);
  }

  await exerciseLearn("learn.catechism.daily","daily","#ao-daily-cate-root [data-dc-close]");
  await exerciseLearn("learn.mass","mass","#ao-learn-root [data-learn-close]");
  await exerciseLearn("learn.catechism","cate","#ao-cate-root [data-cate-close]");
  await exerciseLearn("today.gospel","gospel","[data-scripture-close]");
  await exerciseLearn("today.saint","saint","#ao-v25-panel [data-v25-panel-close]");

  // CALENDAR: prove the dashboard is not presentation-only. Touch an adjacent
  // observance, wait for canonical selectedDate/resolution ownership, then
  // return through the visible Calendar Home control.
  await page.locator("[data-ao-app-surface='calendar']").tap();
  await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:10000});
  const calendarBefore=await page.evaluate(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate??null);
  const alternate=page.locator("#ao-calendar-modular-root [data-cal-date]:not([aria-current='date'])").first();
  assert.ok(await alternate.count(),"Calendar exposed no adjacent observance to select");
  const alternateDate=await alternate.getAttribute("data-cal-date");
  await alternate.scrollIntoViewIfNeeded();
  await alternate.tap();
  await page.waitForFunction(expected=>
    globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate===expected &&
    globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolution?.date===expected &&
    globalThis.AO_RUNTIME_V8?.store?.getState?.()?.resolving!==true,
    alternateDate,{timeout:15000});
  assert.notEqual(alternateDate,calendarBefore,"Calendar adjacent observance did not change date");
  assert.equal(await page.locator(`#ao-calendar-modular-root [data-cal-date="${alternateDate}"][aria-current="date"]`).count(),1,
    "Calendar did not move selected-date identity to the tapped observance");
  const calClose=page.locator("#ao-calendar-modular-root [data-cal-close]");
  assert.equal(await calClose.count(),1,"Calendar lost visible Home return control");
  await calClose.tap();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:5000});

  assert.deepEqual(ariaWarnings,[],"visible child journeys produced focus/aria warnings: "+JSON.stringify(ariaWarnings));
  assert.deepEqual(pageErrors,[],"visible child journeys produced page errors: "+JSON.stringify(pageErrors));

  await context.close();
  console.log("PASS visible module user journeys: PRAY hub children and all five Learn cards open and return through touch UI.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
