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
};
const server=http.createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+p);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4182,"127.0.0.1",ok)});

const iconKeys=[
  "stand","sit","kneel","genuflect","bow","cross","gospel_crosses","breast_strike","head_bow","profound_bow","hands_joined",
  "response","schola","priest_audible","priest_silent","priest_foot","priest_steps","priest_centre","priest_epistle","priest_gospel","priest_sedilia","priest_rail","priest_people",
];

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
  });
  const page=await context.newPage();
  const pageErrors=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));

  await page.goto("http://127.0.0.1:4182/index.html?aoR17Reader=native",{
    waitUntil:"domcontentloaded",
    timeout:90000,
  });
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true,null,{timeout:30000});
  await page.waitForSelector("[data-ao-ribbon='home']",{state:"visible",timeout:30000});

  const cold=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    status:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    owner:document.documentElement.dataset.aoAppShellOwner??null,
    massMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
  }));
  assert.equal(cold.active,"home","cold launch did not begin on Home");
  assert.equal(cold.status?.passive,false,"modular shell is still passive on cold launch");
  assert.equal(cold.status?.visibleRibbonOwner,"AO_APP_SHELL_V1","modular shell does not own visible ribbon");
  assert.equal(cold.owner,"modular","modular shell ownership marker missing");
  assert.equal(cold.massMounted,false,"cold launch unexpectedly restored a Mass surface");

  await page.locator("[data-ao-ribbon='calendar']").click();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="calendar",null,{timeout:10000});

  await page.locator("[data-ao-ribbon='mass']").click();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="mass",null,{timeout:10000});

  const setup=await page.evaluate(async(iconKeys)=>{
    const t=(lat,en)=>({lat,en});
    const proper={
      sourcePath:"Sancti/10-07",
      introit:t("Introitus Rosarii","Introit of the Rosary"),
      collects:[t("Collecta Rosarii","Collect of the Rosary")],
      epistle:t("Epistola Rosarii","Epistle of the Rosary"),
      gradual:t("Graduale et Alleluia Rosarii","Gradual and Alleluia of the Rosary"),
      sequence:{lat:"",en:""},
      gospel:t("Evangelium Rosarii","Gospel of the Rosary"),
      offertory:t("Offertorium Rosarii","Offertory of the Rosary"),
      secrets:[t("Secreta Rosarii","Secret of the Rosary")],
      preface:t("Praefatio","Preface"),
      communion:t("Communio Rosarii","Communion of the Rosary"),
      postcommunions:[t("Postcommunio Rosarii","Postcommunion of the Rosary")],
    };

    let route="live";
    globalThis.__AO_APP_JOURNEY_ROUTE={
      get value(){return route;},
      set value(next){route=next;},
    };
    globalThis.__AO_APP_JOURNEY_CONFIRMS=0;
    globalThis.__AO_FINAL_LEGACY_STARTS=0;
    globalThis.AO_SEQUENCE_BRIDGE_V23={
      startLive(){globalThis.__AO_FINAL_LEGACY_STARTS+=1;},
      getActive(){return null;},
      getAssemblyStatus(){return null;},
    };
    globalThis.AO_SEQUENCE_BRIDGE_V22=null;
    globalThis.AO_R17_ICON_ASSETS=Object.fromEntries(
      iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"])
    );
    globalThis.AO_RUNTIME_V8={
      store:{
        getState:()=>({
          route,
          selectedDate:"2026-10-04",
          language:"en",
          settings:{
            massForm:"mc-incense",
            followMode:"vox",
            massPostureProfile:"TRADITIONAL_WALSH",
            massGestureProfile:"GUIDED_1962",
            faithfulCommunion:true,
          },
        }),
        subscribe:()=>()=>{},
      },
    };
    globalThis.AO_CELEBRATION_ARCH_V1={
      date:"2026-10-04",
      celebrationForm:"mc-incense",
      followMode:"vox",
      actualCelebration:{id:"holy_rosary",type:"VOTIVE"},
    };
    globalThis.AO_CELEBRATION_API={
      getResolvedMass:()=>({
        canStart:true,
        date:"2026-10-04",
        calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
        requestedCelebrationId:"holy_rosary",
        celebrationId:"holy_rosary",
        celebrationType:"VOTIVE",
        proper,
        properSource:"Sancti/10-07",
        insertedRites:[],
        conditions:[],
        rubricSources:["RG60"],
      }),
    };
    globalThis.confirm=()=>{globalThis.__AO_APP_JOURNEY_CONFIRMS+=1;return false;};

    const mod=await import("/src/mass/browser-entry.js?app-shell-journey=1");
    const controller=mod.createBrowserMassController();
    const prepared=await controller.enter();
    return {
      schema:prepared.schema,
      form:prepared.session.resolvedMass.form,
      mode:prepared.readerPreferences.mode,
    };
  },iconKeys);

  assert.equal(setup.schema,"ao-mass-entry-bootstrap-v1");
  assert.equal(setup.form,"MISSA_CANTATA_INCENSE");
  assert.equal(setup.mode,"LIVE");
  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"attached",timeout:30000});

  const live=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    legacyStarts:globalThis.__AO_FINAL_LEGACY_STARTS,
    uiOwner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
    readerUiMode:globalThis.AO_R17_MASS_RUNTIME?.readerUiMode??null,
    persisted:Boolean(localStorage.getItem("ao-r17-active-mass-v1")),
  }));
  assert.equal(live.active,"mass");
  assert.equal(live.legacyStarts,0,"cross-domain journey booted legacy Mass");
  assert.equal(live.uiOwner,"R17_NATIVE_PRODUCTION");
  assert.equal(live.readerUiMode,"NATIVE");
  assert.equal(live.persisted,true,"active native Mass was not persisted");

  const cancelled=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"));
  assert.equal(cancelled?.reason,"LIVE_MASS_LEAVE_CANCELLED");
  await page.waitForFunction(()=>globalThis.__AO_APP_JOURNEY_CONFIRMS===1,null,{timeout:5000});
  const retained=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    mounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
  }));
  assert.equal(retained.active,"mass","cancelled leave did not retain Mass");
  assert.equal(retained.mounted,true,"cancelled leave destroyed the native Mass surface");

  const left=await page.evaluate(async()=>{
    globalThis.confirm=()=>{globalThis.__AO_APP_JOURNEY_CONFIRMS+=1;return true;};
    return globalThis.AO_APP_SHELL_V1.navigate("pray");
  });
  assert.equal(left?.ok,true,"confirmed LIVE leave did not open Pray");
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray",null,{timeout:10000});
  await page.evaluate(()=>{globalThis.__AO_APP_JOURNEY_ROUTE.value="home";});
  await page.waitForFunction(()=>!document.getElementById("ao-r17-native-reader-preview")?.isConnected,null,{timeout:10000});

  await page.locator("[data-ao-ribbon='home']").click();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:10000});

  await page.locator("[data-ao-ribbon='settings']").click();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings",null,{timeout:10000});

  const end=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    confirms:globalThis.__AO_APP_JOURNEY_CONFIRMS,
    legacyStarts:globalThis.__AO_FINAL_LEGACY_STARTS,
    owner:document.documentElement.dataset.aoAppShellOwner??null,
  }));
  assert.equal(end.active,"settings");
  assert.equal(end.confirms,2,"LIVE leave/resume guard did not run exactly twice");
  assert.equal(end.legacyStarts,0,"legacy Mass started during cross-domain journey");
  assert.equal(end.owner,"modular");

  const storedBeforeReload=await page.evaluate(()=>localStorage.getItem("ao-r17-active-mass-v1"));
  assert.ok(storedBeforeReload,"native Mass persistence record disappeared before reload");
  await page.reload({waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true,null,{timeout:30000});
  await page.waitForSelector("[data-ao-ribbon='home']",{state:"visible",timeout:30000});
  const reloaded=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    persisted:Boolean(localStorage.getItem("ao-r17-active-mass-v1")),
    nativeMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
    nativeRuntime:Boolean(globalThis.AO_R17_MASS_RUNTIME),
    owner:document.documentElement.dataset.aoAppShellOwner??null,
  }));
  assert.equal(reloaded.persisted,true,"reload unexpectedly discarded persisted Mass record");
  assert.equal(reloaded.active,"home","stale Mass persistence contaminated the reload route");
  assert.equal(reloaded.nativeMounted,false,"stale persisted Mass auto-reactivated the native reader");
  assert.equal(reloaded.nativeRuntime,false,"stale persisted Mass recreated runtime state on reload");
  assert.equal(reloaded.owner,"modular","reload lost modular app-shell ownership");

  assert.deepEqual(pageErrors,[],"uncaught errors in cross-domain app journey: "+JSON.stringify(pageErrors));

  await context.close();
  console.log("PASS app shell journey: cold Home -> Calendar -> Mass -> native LIVE -> retain/leave -> Pray -> Home -> Settings -> clean reload");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
