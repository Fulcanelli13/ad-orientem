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
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.installed===true &&
    globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true &&
    globalThis.AO_APP_SHELL_V1?.status?.().legacyRibbonButtons===0,
    null,{timeout:30000});
  await page.waitForSelector("[data-ao-app-surface='home']",{state:"visible",timeout:30000});

  const cold=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    status:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    owner:document.documentElement.dataset.aoAppShellOwner??null,
    massMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
  }));
  assert.equal(cold.active,"home","cold launch did not begin on Home");
  assert.equal(cold.status?.passive,false,"modular shell is still passive on cold launch");
  assert.equal(cold.status?.visibleOwner,true,"modular shell does not own visible ribbon");
  assert.equal(cold.owner,"AO_APP_SHELL_V1","modular shell ownership marker missing");
  assert.equal(cold.massMounted,false,"cold launch unexpectedly restored a Mass surface");

  await page.locator("[data-ao-app-surface='calendar']").click();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="calendar" &&
    globalThis.AO_CALENDAR_APP_V1?.status?.().open===true &&
    document.getElementById("ao-calendar-modular-root")?.isConnected,
    null,{timeout:10000});
  const calendarOwnership=await page.evaluate(()=>({
    owner:document.getElementById("ao-calendar-modular-root")?.dataset?.aoCalendarOwner??null,
    donorPanel:globalThis.AO_NAV_V25?.getState?.()?.panel??null,
    shell:globalThis.AO_APP_SHELL_V1?.status?.().calendarOwner??false,
  }));
  assert.equal(calendarOwnership.owner,"modular-calendar-v1","Calendar did not mount the modular presentation owner");
  assert.notEqual(calendarOwnership.donorPanel,"calendar","Calendar still opened the donor v25 panel");
  assert.equal(calendarOwnership.shell,true,"app shell did not report the modular Calendar owner");

  await page.locator("[data-ao-app-surface='mass']").click();
  await page.waitForFunction(()=>!document.getElementById("ao-calendar-modular-root"),null,{timeout:10000});
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
        dispatch:(action)=>{ route="home"; return action; },
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
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.status?.().liveSessionGuards?.live===true &&
    document.getElementById("ao-global-ribbon")?.hidden===true,
    null,{timeout:5000});

  const live=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    legacyStarts:globalThis.__AO_FINAL_LEGACY_STARTS,
    uiOwner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
    readerUiMode:globalThis.AO_R17_MASS_RUNTIME?.readerUiMode??null,
    persisted:Boolean(localStorage.getItem("ao-r17-active-mass-v1")),
    liveGuard:globalThis.AO_APP_SHELL_V1?.status?.().liveSessionGuards??null,
    ribbonHidden:document.getElementById("ao-global-ribbon")?.hidden??null,
    haptics:localStorage.getItem("ao-haptics-enabled"),
  }));
  assert.equal(live.active,"mass");
  assert.equal(live.legacyStarts,0,"cross-domain journey booted legacy Mass");
  assert.equal(live.uiOwner,"R17_NATIVE_PRODUCTION");
  assert.equal(live.readerUiMode,"NATIVE");
  assert.equal(live.persisted,true,"active native Mass was not persisted");
  assert.equal(live.liveGuard?.live,true,"modular live-session guard did not recognize native LIVE");
  assert.equal(live.ribbonHidden,true,"global app ribbon remained visible over active Mass");
  assert.equal(live.haptics,"0","active Mass did not force haptics off");

  await page.evaluate(()=>localStorage.setItem("ao-app-cross-module-probe","calendar-state-ok"));
  const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
  const sectionBeforeInterrupt=await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null);
  await next.click();
  await page.waitForFunction(previous=>{
    const current=globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null;
    return Boolean(current&&current!==previous);
  },sectionBeforeInterrupt,{timeout:5000});
  await page.waitForFunction(()=>{
    const current=globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null;
    const saved=JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"{}");
    return Boolean(current&&saved?.readerPosition?.sectionId===current);
  },null,{timeout:5000});

  const interrupted=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"{}");
    return {
      section:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null,
      savedSection:saved?.readerPosition?.sectionId??null,
      state:saved?.state??null,
      form:saved?.session?.resolvedMass?.form??null,
      prefs:saved?.readerPreferences??null,
    };
  });
  assert.equal(interrupted.state,"active","active Mass persistence record did not carry active state");
  assert.equal(interrupted.savedSection,interrupted.section,"active Mass checkpoint did not save reader section");
  assert.equal(interrupted.form,"MISSA_CANTATA_INCENSE");
  assert.equal(interrupted.prefs?.mode,"LIVE");
  assert.equal(interrupted.prefs?.postureProfile,"TRADITIONAL_WALSH");
  assert.equal(interrupted.prefs?.gestureProfile,"GUIDED_1962");
  assert.equal(interrupted.prefs?.language,"en");

  await page.reload({waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.installed===true &&
    globalThis.AO_R17_BROWSER_ENTRY?.installed===true,
    null,{timeout:30000});
  await page.waitForSelector("[data-ao-app-surface='home']",{state:"visible",timeout:30000});
  await page.evaluate((iconKeys)=>{
    globalThis.AO_R17_ICON_ASSETS=Object.fromEntries(
      iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"])
    );
  },iconKeys);
  const interruptedReload=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"{}");
    return {
      active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      resumable:globalThis.AO_R17_BROWSER_ENTRY?.hasResumable?.()??false,
      mounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
      state:saved?.state??null,
      savedSection:saved?.readerPosition?.sectionId??null,
      probe:localStorage.getItem("ao-app-cross-module-probe"),
    };
  });
  assert.equal(interruptedReload.active,"home","interrupted reload contaminated the core route");
  assert.equal(interruptedReload.resumable,true,"interrupted reload did not expose resumable Mass");
  assert.equal(interruptedReload.mounted,false,"interrupted reload auto-reactivated the reader");
  assert.equal(interruptedReload.state,"active");
  assert.equal(interruptedReload.savedSection,interrupted.section);
  assert.equal(interruptedReload.probe,"calendar-state-ok","unrelated local state changed during interrupted reload");

  await page.locator("[data-ao-app-surface='mass']").click();
  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"attached",timeout:30000});
  await page.waitForFunction(expected=>
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId===expected,
    interrupted.section,{timeout:10000});
  const resumed=await page.evaluate(()=>{
    const runtime=globalThis.AO_R17_MASS_RUNTIME;
    return {
      active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      section:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null,
      form:runtime?.prepared?.session?.resolvedMass?.form??null,
      prefs:runtime?.prepared?.readerPreferences??null,
      resumed:runtime?.resumed??false,
      restoredSection:runtime?.restoredSection??null,
      uiOwner:runtime?.uiOwner??null,
      probe:localStorage.getItem("ao-app-cross-module-probe"),
    };
  });
  assert.equal(resumed.active,"mass","return through top-level Mass did not activate Mass");
  assert.equal(resumed.section,interrupted.section,"resumed Mass did not restore saved reader section");
  assert.equal(resumed.restoredSection,interrupted.section);
  assert.equal(resumed.form,"MISSA_CANTATA_INCENSE");
  assert.equal(resumed.prefs?.mode,"LIVE");
  assert.equal(resumed.prefs?.postureProfile,"TRADITIONAL_WALSH");
  assert.equal(resumed.prefs?.gestureProfile,"GUIDED_1962");
  assert.equal(resumed.prefs?.language,"en");
  assert.equal(resumed.resumed,true);
  assert.equal(resumed.uiOwner,"R17_NATIVE_PRODUCTION");
  assert.equal(resumed.probe,"calendar-state-ok");

  await page.evaluate(()=>{
    globalThis.__AO_APP_JOURNEY_CONFIRMS=0;
    globalThis.confirm=()=>{globalThis.__AO_APP_JOURNEY_CONFIRMS+=1;return false;};
  });

  const closeReader=page.locator("#ao-r17-native-reader-preview [aria-label='Close Mass reader']");
  await closeReader.click();
  await page.waitForFunction(()=>globalThis.__AO_APP_JOURNEY_CONFIRMS===1,null,{timeout:5000});
  const retained=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    mounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
    route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
  }));
  assert.equal(retained.active,"mass","cancelled close did not retain Mass");
  assert.equal(retained.mounted,true,"cancelled close destroyed the native Mass surface");
  assert.ok(["home","live"].includes(retained.route),"cancelled close entered an unexpected historical route");

  await page.evaluate(()=>{
    globalThis.confirm=()=>{globalThis.__AO_APP_JOURNEY_CONFIRMS+=1;return true;};
  });
  await closeReader.click();
  await page.waitForFunction(()=>!document.getElementById("ao-r17-native-reader-preview")?.isConnected,null,{timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:10000});
  const exited=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
  }));
  assert.equal(exited.active,"home","confirmed reader close did not return to Home");
  assert.equal(exited.route,"home","confirmed reader close left runtime route in LIVE");

  await page.locator("[data-ao-app-surface='pray']").click();
  await page.waitForTimeout(1500);
  const prayOwnership=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    routeOwner:document.documentElement.dataset.aoPrayRouteOwner??null,
    rootOwner:document.getElementById("aoPray435930")?.dataset?.aoPrayOwner??null,
    prayAppInstalled:Boolean(globalThis.AO_PRAY_APP_V1),
    prayAppStatus:globalThis.AO_PRAY_APP_V1?.status?.()??null,
    donor435930:Boolean(globalThis.AO_PRAY_V435930),
    donor435930Open:typeof globalThis.AO_PRAY_V435930?.open,
    domainShell:Boolean(globalThis.AO_V37_SHELL),
    domainOpen:typeof globalThis.AO_V37_SHELL?.openDomain,
    prayerBookRoot:Boolean(document.getElementById("aoPrayerBookRoot")),
    prayRoot:Boolean(document.getElementById("aoPray435930")),
  }));
  const prayerGlobals=await page.evaluate(()=>Object.keys(globalThis)
    .filter(key=>/pray|prayer|rosary|confess|ador|bened|devot/i.test(key))
    .sort()
    .slice(0,160));
  assert.equal(prayOwnership.active,"pray","PRAY navigation did not activate the app surface; diagnostic="+JSON.stringify({...prayOwnership,prayerGlobals}));
  assert.equal(prayOwnership.routeOwner,"modular-pray-v1","production PRAY click did not use modular PRAY route owner; diagnostic="+JSON.stringify(prayOwnership));
  assert.equal(prayOwnership.prayAppInstalled,true,"AO_PRAY_APP_V1 was not installed; diagnostic="+JSON.stringify(prayOwnership));
  assert.equal(prayOwnership.prayAppStatus?.presentationOwner,"AO_PRAY_V435930","unexpected PRAY presentation authority; diagnostic="+JSON.stringify(prayOwnership));
  assert.equal(prayOwnership.routeOwner,"modular-pray-v1","production PRAY click did not use modular PRAY route owner");
  assert.equal(prayOwnership.installed,true);
  assert.equal(prayOwnership.presentationOwner,"AO_PRAY_V435930");

  await page.locator("[data-ao-app-surface='home']").click();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="home" &&
    document.querySelector(".homeScreen")?.dataset?.aoHomeOwner==="modular-home-v1",
    null,{timeout:10000});
  const homeOwnership=await page.evaluate(()=>({
    owner:document.querySelector(".homeScreen")?.dataset?.aoHomeOwner??null,
    installed:globalThis.AO_HOME_APP_V1?.status?.().installed??false,
    donorAvailable:globalThis.AO_HOME_APP_V1?.status?.().donorHomeAvailable??false,
  }));
  assert.equal(homeOwnership.owner,"modular-home-v1","production Home click did not use modular Home owner");
  assert.equal(homeOwnership.installed,true);

  await page.locator("[data-ao-app-surface='settings']").click();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings",null,{timeout:10000});

  const end=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    confirms:globalThis.__AO_APP_JOURNEY_CONFIRMS,
    owner:document.documentElement.dataset.aoAppShellOwner??null,
  }));
  assert.equal(end.active,"settings");
  assert.equal(end.confirms,2,"LIVE leave/resume guard did not run exactly twice");
  assert.equal(end.owner,"AO_APP_SHELL_V1");

  const storedBeforeReload=await page.evaluate(()=>localStorage.getItem("ao-r17-active-mass-v1"));
  assert.ok(storedBeforeReload,"native Mass persistence record disappeared before reload");
  await page.reload({waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true,null,{timeout:30000});
  await page.waitForSelector("[data-ao-app-surface='home']",{state:"visible",timeout:30000});
  const reloaded=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"{}");
    return {
      active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      persisted:Boolean(localStorage.getItem("ao-r17-active-mass-v1")),
      persistedState:saved?.state??null,
      nativeMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
      nativeRuntime:Boolean(globalThis.AO_R17_MASS_RUNTIME),
      resumable:globalThis.AO_R17_BROWSER_ENTRY?.hasResumable?.()??false,
      owner:document.documentElement.dataset.aoAppShellOwner??null,
      probe:localStorage.getItem("ao-app-cross-module-probe"),
    };
  });
  assert.equal(reloaded.persisted,true,"reload unexpectedly discarded persisted Mass record");
  assert.equal(reloaded.active,"home","stale Mass persistence contaminated the reload route");
  assert.equal(reloaded.nativeMounted,false,"stale persisted Mass auto-reactivated the native reader");
  assert.equal(reloaded.nativeRuntime,false,"stale persisted Mass recreated runtime state on reload");
  assert.equal(reloaded.persistedState,"suspended","intentional leave did not mark the persisted Mass suspended");
  assert.equal(reloaded.resumable,true,"suspended Mass is no longer available for an explicit return");
  assert.equal(reloaded.owner,"AO_APP_SHELL_V1","reload lost modular app-shell ownership");
  assert.equal(reloaded.probe,"calendar-state-ok","cross-module local state was contaminated");

  assert.deepEqual(pageErrors,[],"uncaught errors in cross-domain app journey: "+JSON.stringify(pageErrors));

  await context.close();
  console.log("PASS app shell journey: cold Home -> Calendar -> native LIVE -> interrupted reload/resume -> leave -> Pray -> Home -> Settings -> clean suspended reload");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
