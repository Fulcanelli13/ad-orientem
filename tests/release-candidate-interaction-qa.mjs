import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
  ".woff":"font/woff",
  ".woff2":"font/woff2",
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
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4194,"127.0.0.1",ok)});

function visibleState(node){
  if(!node)return false;
  const style=getComputedStyle(node);
  const r=node.getBoundingClientRect();
  return !node.hidden && style.display!=="none" && style.visibility!=="hidden" &&
    style.opacity!=="0" && r.width>0 && r.height>0;
}

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
  const consoleErrors=[];
  const missingResponses=[];

  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  page.on("response",response=>{
    if(response.status()===404)missingResponses.push(response.url());
  });
  page.on("console",message=>{
    const value=message.text();
    if(/Blocked aria-hidden|aria-hidden.*focus|retained focus/i.test(value))ariaWarnings.push(value);
    if(message.type()==="error" && !/favicon\.ico/i.test(value))consoleErrors.push(value);
  });

  await page.goto("http://127.0.0.1:4194/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true &&
    globalThis.AO_PRAY_APP_V1?.status?.().installed===true &&
    typeof globalThis.AO_PRAY_V435930?.open==="function",
    null,{timeout:30000}
  );

  // A ready app must never be obstructed indefinitely by the cinematic boot.
  await page.waitForFunction(()=>{
    const curtain=document.getElementById("ao-cinema-boot");
    return !curtain || curtain.classList.contains("aoCinemaBootDone") &&
      getComputedStyle(curtain).pointerEvents==="none";
  },null,{timeout:15000});
  // Wait for the real loading curtain to release input; never hide or force-click it.
  await page.waitForFunction(()=>{
    const curtain=document.getElementById("ao-cinema-boot");
    return !curtain || curtain.classList.contains("aoCinemaBootDone") &&
      getComputedStyle(curtain).pointerEvents==="none";
  },null,{timeout:15000});
  await page.locator("[data-ao-app-surface='pray']").tap({timeout:15000});
  await page.waitForSelector("#aoPray435930.open",{state:"visible",timeout:15000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray",null,{timeout:10000});

  async function directOpen(id,view){
    await page.evaluate(({id})=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),{id});
    await page.waitForFunction(expected=>{
      const root=document.querySelector("#aoPray435930 .aoP435930Mount");
      return document.getElementById("aoPray435930")?.classList?.contains("open") &&
        root?.dataset?.aoPrayView===expected;
    },view,{timeout:10000});
  }

  async function assertSinglePrayerLayer(label){
    const state=await page.evaluate(()=>{
      const modular=document.getElementById("aoPray435930");
      const legacy=document.getElementById("aoPrayerBookRoot");
      const visible=node=>{
        if(!node)return false;
        const style=getComputedStyle(node),r=node.getBoundingClientRect();
        return !node.hidden && style.display!=="none" && style.visibility!=="hidden" &&
          style.opacity!=="0" && r.width>0 && r.height>0;
      };
      return {
        modular:visible(modular)&&modular.classList.contains("open"),
        legacy:visible(legacy)&&(legacy.classList.contains("open")||legacy.getAttribute("aria-hidden")==="false"),
      };
    });
    assert.ok(!(state.modular&&state.legacy),label+": modular and legacy prayer layers are visible together");
  }

  async function assertPrayFit(label){
    const fit=await page.evaluate(()=>{
      const root=document.getElementById("aoPray435930");
      const sheet=root?.querySelector(".aoP435930Sheet");
      const r=sheet?.getBoundingClientRect?.();
      return {
        overflow:document.documentElement.scrollWidth-window.innerWidth,
        sheet:r?{left:r.left,right:r.right,width:r.width,viewport:window.innerWidth}:null,
      };
    });
    assert.ok(fit.overflow<=1,label+": document horizontal overflow");
    assert.ok(fit.sheet&&fit.sheet.left>=-1&&fit.sheet.right<=fit.sheet.viewport+1,label+": PRAY sheet exceeds phone width");
  }

  // Angelus / Regina Caeli: real form switch + per-unit language flip.
  await directOpen("pray.angelus_regina","angelus");
  await assertSinglePrayerLayer("Angelus");
  await assertPrayFit("Angelus");
  assert.ok(await page.locator("#aoPray435930 [data-ao-angelus-unit]").count()>=4,"Angelus sequence lost prayer units");

  await page.locator("#aoPray435930 [data-p435930-seg='regina']").click();
  await page.waitForFunction(()=>document.querySelector("#aoP435930Title")?.textContent?.includes("Regina C"),null,{timeout:5000});
  const angelusFlip=page.locator("#aoPray435930 [data-p435930-card-flip]").first();
  assert.ok(await angelusFlip.count(),"Regina Caeli lost prayer-language toggle");
  const beforeFlip=await angelusFlip.evaluate(el=>({
    vern:el.querySelector("[data-face-v]")?.hidden??null,
    latin:el.querySelector("[data-face-la]")?.hidden??null,
    text:el.textContent,
  }));
  await angelusFlip.click();
  const afterFlip=await angelusFlip.evaluate(el=>({
    vern:el.querySelector("[data-face-v]")?.hidden??null,
    latin:el.querySelector("[data-face-la]")?.hidden??null,
    text:el.textContent,
  }));
  assert.notEqual(beforeFlip.vern,afterFlip.vern,"Regina Caeli language toggle did not change visible face");
  assert.notEqual(beforeFlip.latin,afterFlip.latin,"Regina Caeli Latin face did not toggle");
  assert.notEqual(beforeFlip.vern,beforeFlip.latin,"Regina Caeli initially exposed both or neither language");
  assert.notEqual(afterFlip.vern,afterFlip.latin,"Regina Caeli toggle exposed both or neither language");

  // Stations: complete rail, guided/simple distinction, progression.
  await directOpen("pray.stations","stations");
  await assertSinglePrayerLayer("Stations");
  await assertPrayFit("Stations");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-station-step]").count(),14,"Stations lost XIV-step rail");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-station-step][aria-current='step']").count(),1);
  assert.ok(await page.locator("#aoPray435930 .aoP435930StationConsider").count()>=1,"Guided Stations lost consideration");
  await page.locator("#aoPray435930 [data-p435930-seg='simple']").click();
  assert.equal(await page.locator("#aoPray435930 .aoP435930StationConsider").count(),0,"Simple Stations still show guided consideration");
  await page.locator("#aoPray435930 [data-p435930-station-next]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 [data-p435930-station-step='1']")?.getAttribute("aria-current")==="step",null,{timeout:5000});
  const stationTwo=await page.locator("#aoP435930Title").textContent();
  assert.ok(stationTwo&&stationTwo.trim().length>5,"Second Station title is blank");
  await page.locator("#aoPray435930 [data-p435930-seg='guided']").click();
  assert.ok(await page.locator("#aoPray435930 .aoP435930StationConsider").count()>=1,"Guided Stations did not restore consideration");

  // First Friday: preserve exact programme stage across Around-Mass handoff/return.
  await directOpen("programme.first_friday","firstFriday");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ff-stage]").count(),5,"First Friday lost five-stage programme");
  await page.locator("#aoPray435930 [data-p435930-ff-stage='1']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 [data-p435930-ff-stage='1']")?.getAttribute("aria-current")==="step");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-handoff='mass.prepare']").count(),1,"First Friday Prepare stage lost Before Mass handoff");

  const massPrepareAvailable=await page.evaluate(()=>
    typeof globalThis.AO_MODULES?.open==="function" &&
    Boolean(globalThis.AO_MODULES?.canonicalForElement||globalThis.AO_MODULES?.get||globalThis.AO_MODULES?.COLLECTION)
  );
  assert.equal(massPrepareAvailable,true,"shared module registry unavailable for Around-Mass handoff");

  await page.locator("#aoPray435930 [data-p435930-handoff='mass.prepare']").click();
  await page.waitForFunction(()=>!document.getElementById("aoPray435930")?.classList?.contains("open"),null,{timeout:5000});
  const handoffState=await page.evaluate(()=>({
    route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
    nativeReader:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
    nativeRuntime:Boolean(globalThis.AO_R17_MASS_RUNTIME),
  }));
  assert.notEqual(handoffState.route,"live","Before Mass handoff incorrectly started a Mass");
  assert.equal(handoffState.nativeReader,false,"Before Mass handoff mounted R17");
  assert.equal(handoffState.nativeRuntime,false,"Before Mass handoff started native Mass runtime");

  await page.evaluate(()=>globalThis.AO_V37_SHELL?.openDomain?.("pray"));
  await page.waitForFunction(()=>
    document.getElementById("aoPray435930")?.classList?.contains("open") &&
    document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="firstFriday" &&
    document.querySelector("#aoPray435930 [data-p435930-ff-stage='1']")?.getAttribute("aria-current")==="step",
    null,{timeout:10000}
  );
  assert.equal(await page.locator("#aoPray435930 [data-p435930-handoff='mass.prepare']").count(),1,
    "Around-Mass return lost exact First Friday Prepare stage");

  // First Saturday -> Rosary -> reused Rosary engine -> canonical return -> exact First Saturday stage.
  await directOpen("programme.first_saturday","firstSaturday");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-fs-stage]").count(),6,"First Saturday lost six-stage programme");
  await page.locator("#aoPray435930 [data-p435930-fs-stage='3']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 [data-p435930-fs-stage='3']")?.getAttribute("aria-current")==="step");
  // Rosary opens directly: there is no second configuration/launcher screen.
  await page.evaluate(()=>globalThis.AO_PRAY_V435930?.setRecitationMode?.("group"));
  await page.locator("#aoPray435930 [data-p435930-own='pray.rosary']").click();
  await page.waitForFunction(()=>!document.getElementById("aoPray435930")?.classList?.contains("open"),null,{timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot.open",{state:"visible",timeout:10000});
  await page.waitForSelector(".aoP435930RosaryBar",{state:"visible",timeout:10000});
  await page.locator(".aoP435930RosaryBar [data-p435930-rosary-depth='guided']").click();
  await page.waitForTimeout(220);
  const settledRosary=await page.evaluate(()=>({
    donorState:globalThis.AOTraditionalPrayerBook?.getState?.()??null,
    stored:localStorage.getItem("ao-prayer-recitation-mode"),
    modular:globalThis.AO_PRAY_V435930?.state?.()?.rosary?.recitation??null,
    coherence:globalThis.AO_PRAY_COHERENCE_V435930?.mode?.()??null,
    htmlGroup:document.documentElement.classList.contains("aoRecitationGroup"),
    htmlIndividual:document.documentElement.classList.contains("aoRecitationIndividual"),
    rootClass:document.getElementById("aoPrayerBookRoot")?.className??null,
    nativeGroup:[...document.querySelectorAll("#aoPrayerBookRoot [data-ao-recitation='group']")].map(x=>({
      active:x.classList.contains("active"),pressed:x.getAttribute("aria-pressed"),text:x.textContent?.trim()
    })),
    nativeIndividual:[...document.querySelectorAll("#aoPrayerBookRoot [data-ao-recitation='individual']")].map(x=>({
      active:x.classList.contains("active"),pressed:x.getAttribute("aria-pressed"),text:x.textContent?.trim()
    })),
    exactPlayerHeadCount:document.querySelectorAll(".r29-head-recitation[data-ao-exact-donor-recitation='v3.4.14']").length,
  }));
  assert.equal(settledRosary?.donorState?.recitationMode,"group",
    "Rosary donor internal owner did not preserve Group recitation");
  assert.equal(settledRosary?.stored,"group",
    "Rosary donor did not preserve Group recitation in canonical storage");
  assert.equal(settledRosary?.modular,"group",
    "Rosary donor overwrote modular PRAY recitation ownership");
  assert.equal(settledRosary?.coherence,"group",
    "Rosary donor/coherence layer disagreed with Group recitation");
  assert.equal(settledRosary?.htmlGroup,true,
    "Rosary donor did not apply the canonical Group document state");
  assert.equal(settledRosary?.htmlIndividual,false,
    "Rosary donor left the canonical Individual document state active");
  assert.ok((settledRosary?.nativeGroup??[]).some(x=>x.active===true||x.pressed==="true"),
    "Rosary donor native Group control did not become active");
  assert.ok((settledRosary?.nativeIndividual??[]).every(x=>x.active!==true&&x.pressed!=="true"),
    "Rosary donor native Individual control remained active after Group handoff");
  assert.equal(settledRosary?.exactPlayerHeadCount,0,
    "Rosary live-player recitation strip appeared before a live Rosary session began");
  await assertSinglePrayerLayer("Rosary donor launch");

  const rosarySurface=await page.evaluate(()=>{
    const visible=node=>{
      if(!node)return false;
      const style=getComputedStyle(node),r=node.getBoundingClientRect();
      return !node.hidden && style.display!=="none" && style.visibility!=="hidden" &&
        style.opacity!=="0" && r.width>0 && r.height>0;
    };
    return {
      bars:document.querySelectorAll(".aoP435930RosaryBar").length,
      simple:document.querySelectorAll(".aoP435930RosaryBar [data-p435930-rosary-depth='simple']").length,
      guided:document.querySelectorAll(".aoP435930RosaryBar [data-p435930-rosary-depth='guided']").length,
      guidedActive:document.querySelector(".aoP435930RosaryBar [data-p435930-rosary-depth='guided']")?.classList?.contains("active")??false,
      hintsVisible:[...document.querySelectorAll(".flipHint,.translationNote,.pbFlipHint,.lab-flip-hint,[data-pb-flip-hint]")]
        .filter(visible).length,
    };
  });
  assert.deepEqual(
    {bars:rosarySurface.bars,simple:rosarySurface.simple,guided:rosarySurface.guided},
    {bars:1,simple:1,guided:1},
    "Rosary donor did not receive the final PRAY depth control bar"
  );
  assert.equal(rosarySurface.guidedActive,true,"Rosary donor lost guided-depth state");
  assert.equal(rosarySurface.hintsVisible,0,"obsolete Rosary flip/translation hints remained visible");

  await page.locator("#aoPrayerBookRoot [data-lab-rosary-today]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot .pbShell")?.dataset?.aoRosaryExactDonor==="v3.4.14",null,{timeout:5000});
  await page.locator("#aoPrayerBookRoot .lab-back").first().click();
  await page.waitForFunction(()=>!document.getElementById("aoPrayerBookRoot")?.classList?.contains("open"),null,{timeout:5000});
  await page.waitForFunction(()=>
    document.getElementById("aoPray435930")?.classList?.contains("open") &&
    document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="firstSaturday" &&
    document.querySelector("#aoPray435930 [data-p435930-fs-stage='3']")?.getAttribute("aria-current")==="step",
    null,{timeout:10000}
  );
  const restoredRosary=await page.evaluate(()=>({
    recitation:globalThis.AO_PRAY_V435930?.state?.()?.rosary?.recitation??null,
    depth:document.querySelector("#aoPrayerBookRoot .aoP435930RosaryBar [data-p435930-rosary-depth='guided']")?.classList?.contains("active")??null,
  }));
  assert.equal(restoredRosary.recitation,"group","Rosary return lost Group preference");
  assert.match(await page.locator("#aoP435930Title").textContent(),/First Saturdays/i,
    "Rosary return/back did not restore First Saturday programme");

  const finalFocus=await page.evaluate(()=>{
    const active=document.activeElement;
    if(!active||active===document.body||active===document.documentElement)return null;
    const hidden=active.closest?.('[aria-hidden="true"],[hidden]');
    return hidden?{tag:active.tagName,hidden:hidden.id||hidden.className||hidden.tagName}:null;
  });
  assert.equal(finalFocus,null,"focus remained inside a hidden surface after interaction round trips");

  assert.deepEqual(ariaWarnings,[],"aria/focus warnings: "+JSON.stringify(ariaWarnings));
  assert.deepEqual(pageErrors,[],"uncaught RC interaction errors: "+JSON.stringify(pageErrors));
  assert.deepEqual(consoleErrors,[],"RC interaction console errors: "+JSON.stringify(consoleErrors)+"; 404 URLs: "+JSON.stringify(missingResponses));

  await context.close();
  console.log("RC interaction QA PASS — Angelus/Regina language/form, Stations progression, First Friday Around-Mass resume, and First Saturday Rosary donor/return context.");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
