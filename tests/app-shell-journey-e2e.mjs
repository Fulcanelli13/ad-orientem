import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { R17_FROZEN_ACTIVE_ICON_KEYS, R17_FROZEN_EXCLUDED_ICON_KEYS } from "../src/mass/reader-icons.js";

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

const iconKeys=[...R17_FROZEN_ACTIVE_ICON_KEYS];
const excludedIconKeys=[...R17_FROZEN_EXCLUDED_ICON_KEYS];

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
  await page.waitForSelector("[data-ao-home-enricher-owner='modular-home-enrichers-v1']",{state:"visible",timeout:10000});

  const cold=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    status:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    owner:document.documentElement.dataset.aoAppShellOwner??null,
    massMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
    enrichersOwner:globalThis.AO_HOME_APP_V1?.status?.().enrichersOwner??null,
    modularEnrichers:document.querySelectorAll("[data-ao-home-enricher-owner='modular-home-enrichers-v1']").length,
    homeEmbeddedCanonicalIcons:document.querySelectorAll(".aoHomeCuIcon use").length,
    homeFallbackIcons:document.querySelectorAll(".aoHomeCuIconFallback").length,
    release:document.documentElement.dataset.aoRelease??null,
    releaseAuthority:document.documentElement.dataset.aoReleaseAuthority??null,
    homeSuppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    donorHomeEnricherVisible:[...document.querySelectorAll(".aoComingUpV4323,.aoDailyCateHome")].some(node=>{
      const style=getComputedStyle(node);
      return node.isConnected&&!node.hidden&&style.display!=="none"&&style.visibility!=="hidden";
    }),
  }));
  assert.equal(cold.active,"home","cold launch did not begin on Home");
  assert.equal(cold.status?.passive,false,"modular shell is still passive on cold launch");
  assert.equal(cold.status?.visibleOwner,true,"modular shell does not own visible ribbon");
  assert.equal(cold.owner,"AO_APP_SHELL_V1","modular shell ownership marker missing");
  assert.equal(cold.massMounted,false,"cold launch unexpectedly restored a Mass surface");
  assert.equal(cold.enrichersOwner,"modular-home-enrichers-v1","cold Home did not use modular enrichers");
  assert.equal(cold.modularEnrichers,2,"cold Home did not render both modular enricher cards");
  assert.equal(cold.homeEmbeddedCanonicalIcons,3,"cold Home did not render all three Coming Up icons from canonical embedded artwork");
  assert.equal(cold.homeFallbackIcons,0,"cold Home fell back to Unicode placeholder artwork");
  assert.equal(cold.release,"43.59.30","production DOM exposes a stale pre-convergence release label");
  assert.equal(cold.releaseAuthority,"AO_APP_SHELL_V1");
  assert.equal(cold.homeSuppressed,"false","Home was suppressed while Home owned the surface");
  assert.equal(cold.donorHomeEnricherVisible,false,"donor Coming Up/Daily Catechism remained visible under modular Home");

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
    homeSuppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    homeDisplay:getComputedStyle(document.querySelector(".homeScreen")).display,
  }));
  assert.equal(calendarOwnership.owner,"modular-calendar-v2-liturgical-year","Calendar did not mount the modular presentation owner");
  assert.notEqual(calendarOwnership.donorPanel,"calendar","Calendar still opened the donor v25 panel");
  assert.equal(calendarOwnership.shell,true,"app shell did not report the modular Calendar owner");
  assert.equal(calendarOwnership.homeSuppressed,"true","Calendar did not isolate Home");
  assert.equal(calendarOwnership.homeDisplay,"none","Home remained visually exposed beneath Calendar");

  await page.locator("[data-ao-app-surface='mass']").click();
  await page.waitForFunction(()=>!document.getElementById("ao-calendar-modular-root"),null,{timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="mass",null,{timeout:10000});

  const setup=await page.evaluate(async({iconKeys,excludedIconKeys})=>{
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
    try{delete globalThis.AO_R17_ICON_ASSETS}catch{}
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
      iconKeys:Object.keys(mod.resolveHostIconAssets(globalThis)??{}),
      explicitIconBank:Boolean(globalThis.AO_R17_ICON_ASSETS),
      excludedPresent:excludedIconKeys.filter(key=>Object.hasOwn(mod.resolveHostIconAssets(globalThis)??{},key)),
    };
  },{iconKeys,excludedIconKeys});

  assert.equal(setup.schema,"ao-mass-entry-bootstrap-v1");
  assert.equal(setup.form,"MISSA_CANTATA_INCENSE");
  assert.equal(setup.mode,"LIVE");
  assert.equal(setup.explicitIconBank,false,"journey test accidentally injected a modular icon bank");
  assert.ok(setup.iconKeys.length>=iconKeys.length,
    "actual production page did not resolve the frozen CSS icon bank");
  for(const key of iconKeys)assert.ok(setup.iconKeys.includes(key),"production frozen-active icon bank missing "+key);
  assert.deepEqual(setup.excludedPresent,[],"frozen-excluded icon semantics leaked back into the production bank");
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

  const homeResume=page.locator(".homeScreen [data-resume-mass]");
  assert.equal(await homeResume.count(),1,"interrupted reload exposed no visible Home Resume card");
  await homeResume.click();
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
  assert.equal(resumed.active,"mass","visible Home Resume did not activate Mass");
  assert.equal(resumed.section,interrupted.section,"Home Resume did not restore saved reader section");
  assert.equal(resumed.restoredSection,interrupted.section);
  assert.equal(resumed.form,"MISSA_CANTATA_INCENSE");
  assert.equal(resumed.prefs?.mode,"LIVE");
  assert.equal(resumed.prefs?.postureProfile,"TRADITIONAL_WALSH");
  assert.equal(resumed.prefs?.gestureProfile,"GUIDED_1962");
  assert.equal(resumed.prefs?.language,"en");
  assert.equal(resumed.resumed,true);
  assert.equal(resumed.uiOwner,"R17_NATIVE_PRODUCTION");
  assert.equal(resumed.probe,"calendar-state-ok");

  // Settings is the one top-level non-Mass surface allowed to overlay an
  // active reader. Prove that it does not suspend/restart R17, that structural
  // changes are rejected by the single modular live-session guard, and that
  // permitted display state still updates while LIVE is retained.
  const settingsOverLiveBefore=await page.evaluate(()=>{
    const reader=document.getElementById("ao-r17-native-reader-preview");
    if(reader)reader.dataset.aoSettingsContinuity="same-reader";
    globalThis.__AO_SETTINGS_LIVE_ALERTS=0;
    globalThis.alert=()=>{globalThis.__AO_SETTINGS_LIVE_ALERTS+=1;};
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.()?.settings??{};
    return {
      section:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null,
      form:s.massForm??null,
      textScale:s.textScale??"normal",
      persisted:JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"{}"),
      legacyStarts:globalThis.__AO_FINAL_LEGACY_STARTS??0,
    };
  });
  const openedSettingsOverLive=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
  assert.notEqual(openedSettingsOverLive?.ok,false,"Settings could not open over active native Mass");
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings",null,{timeout:10000});

  const settingsOverLiveOpen=await page.evaluate(()=>({
    readerConnected:Boolean(document.querySelector("#ao-r17-native-reader-preview[data-ao-settings-continuity='same-reader']")?.isConnected),
    section:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null,
    runtime:Boolean(globalThis.AO_R17_MASS_RUNTIME),
    guard:globalThis.AO_APP_LIVE_SESSION_GUARDS_V1?.status?.()??null,
    settings:globalThis.AO_SETTINGS_APP_V1?.status?.()??null,
    haptics:localStorage.getItem("ao-haptics-enabled"),
    legacyVisible:[
      document.getElementById("ao-settings-v4359"),
      document.getElementById("ao-settings-v4358"),
      document.getElementById("ao-settings-v4356"),
    ].some(node=>Boolean(node?.isConnected&&!node.hidden&&getComputedStyle(node).display!=="none"&&getComputedStyle(node).visibility!=="hidden")),
  }));
  assert.equal(settingsOverLiveOpen.readerConnected,true,"opening Settings replaced or destroyed the active R17 reader");
  assert.equal(settingsOverLiveOpen.section,settingsOverLiveBefore.section,"opening Settings moved the LIVE reader section");
  assert.equal(settingsOverLiveOpen.runtime,true,"opening Settings destroyed native Mass runtime");
  assert.equal(settingsOverLiveOpen.guard?.live,true,"Settings overlay lost the modular live-session guard");
  assert.equal(settingsOverLiveOpen.settings?.structuralLocked,true,"Settings did not report structural lock during LIVE");
  assert.equal(settingsOverLiveOpen.haptics,"0","Settings overlay re-enabled haptics during LIVE");
  assert.equal(settingsOverLiveOpen.legacyVisible,false,"historical Settings donor became visible over LIVE");

  const structuralTarget=settingsOverLiveBefore.form==="low"?"sung":"low";
  await page.locator('#ao-settings-modular-root [data-settings-route="/settings/mass"]').click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="/settings/mass",null,{timeout:5000});
  await page.locator(`#ao-settings-modular-root [data-pref-path="mass.defaultForm"][data-pref-value="${structuralTarget}"]`).click();
  await page.waitForTimeout(0);
  const afterStructuralAttempt=await page.evaluate(()=>({
    form:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.settings?.massForm??null,
    resolvedForm:globalThis.AO_R17_MASS_RUNTIME?.prepared?.session?.resolvedMass?.form??null,
    alerts:globalThis.__AO_SETTINGS_LIVE_ALERTS??0,
  }));
  assert.equal(afterStructuralAttempt.form,settingsOverLiveBefore.form,"structural Mass setting changed during LIVE");
  assert.equal(afterStructuralAttempt.resolvedForm,"MISSA_CANTATA_INCENSE","Settings mutated the active resolved Mass");
  assert.ok(afterStructuralAttempt.alerts>=1,"live-session guard did not reject structural Settings input");

  await page.locator("#ao-settings-modular-root [data-settings-back]").click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="/settings",null,{timeout:5000});
  await page.locator('#ao-settings-modular-root [data-settings-route="/settings/accessibility"]').click();
  const displayTarget=settingsOverLiveBefore.textScale==="large"?"standard":"large";
  await page.locator('#ao-settings-modular-root [data-pref-select="accessibility.textScale"]').selectOption(displayTarget);
  await page.waitForFunction(expected=>document.documentElement.dataset.aoTextScaleV1===expected,displayTarget,{timeout:5000});

  await page.locator("#ao-settings-modular-root [data-settings-close]").first().click();
  await page.waitForFunction(()=>!document.getElementById("ao-settings-modular-root"),null,{timeout:5000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="mass",null,{timeout:5000});
  const settingsOverLiveAfter=await page.evaluate(()=>({
    readerConnected:Boolean(document.querySelector("#ao-r17-native-reader-preview[data-ao-settings-continuity='same-reader']")?.isConnected),
    section:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null,
    resolvedForm:globalThis.AO_R17_MASS_RUNTIME?.prepared?.session?.resolvedMass?.form??null,
    persisted:JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"{}"),
    textScale:document.documentElement.dataset.aoTextScaleV1??null,
    legacyStarts:globalThis.__AO_FINAL_LEGACY_STARTS??0,
    focusHidden:Boolean(document.activeElement?.closest?.("[aria-hidden='true'],[hidden]")),
  }));
  assert.equal(settingsOverLiveAfter.readerConnected,true,"closing Settings did not restore the same R17 reader");
  assert.equal(settingsOverLiveAfter.section,settingsOverLiveBefore.section,"closing Settings did not restore the same LIVE position");
  assert.equal(settingsOverLiveAfter.resolvedForm,"MISSA_CANTATA_INCENSE","closing Settings altered the active Mass form");
  assert.equal(settingsOverLiveAfter.persisted?.state,settingsOverLiveBefore.persisted?.state,"Settings overlay changed active-Mass lifecycle state");
  assert.equal(settingsOverLiveAfter.persisted?.readerPosition?.sectionId,settingsOverLiveBefore.persisted?.readerPosition?.sectionId,"Settings overlay changed persisted LIVE position");
  assert.equal(settingsOverLiveAfter.persisted?.session?.resolvedMass?.form,settingsOverLiveBefore.persisted?.session?.resolvedMass?.form,"Settings overlay changed persisted Mass form");
  assert.equal(settingsOverLiveAfter.persisted?.readerPreferences?.mode,settingsOverLiveBefore.persisted?.readerPreferences?.mode,"Settings overlay changed persisted reader mode");
  assert.equal(settingsOverLiveAfter.textScale,displayTarget,"permitted display preference did not survive Settings close");
  assert.equal(settingsOverLiveAfter.legacyStarts,settingsOverLiveBefore.legacyStarts,"Settings overlay triggered a legacy Mass start");
  assert.equal(settingsOverLiveAfter.focusHidden,false,"focus remained inside a hidden Settings surface");

  await page.evaluate(()=>{
    globalThis.__AO_APP_JOURNEY_CONFIRMS=0;
    globalThis.confirm=()=>{globalThis.__AO_APP_JOURNEY_CONFIRMS+=1;return false;};
  });

  const readerHome=page.locator("#ao-r17-native-reader-preview [data-reader-home]");
  assert.equal(await readerHome.count(),1,"LIVE first ribbon lost its Home control");
  await readerHome.click();
  await page.waitForFunction(()=>globalThis.__AO_APP_JOURNEY_CONFIRMS===1,null,{timeout:5000});
  const retained=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    mounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
    route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
  }));
  assert.equal(retained.active,"mass","cancelled Home did not retain Mass");
  assert.equal(retained.mounted,true,"cancelled Home destroyed the native Mass surface");
  assert.ok(["home","live"].includes(retained.route),"cancelled Home entered an unexpected historical route");

  await page.evaluate(()=>{
    globalThis.confirm=()=>{globalThis.__AO_APP_JOURNEY_CONFIRMS+=1;return true;};
  });
  await readerHome.click();
  await page.waitForFunction(()=>!document.getElementById("ao-r17-native-reader-preview")?.isConnected,null,{timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:10000});
  const exited=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
  }));
  assert.equal(exited.active,"home","confirmed reader Home did not return to Home");
  assert.equal(exited.route,"home","confirmed reader Home left runtime route in LIVE");

  await page.locator("[data-ao-app-surface='pray']").click();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray" &&
    document.documentElement.dataset.aoPrayRouteOwner==="modular-pray-v1" &&
    globalThis.AO_PRAY_V435930?.version==="43.59.30-pray-acceptance" &&
    document.getElementById("aoPray435930")?.classList?.contains("open"),
    null,{timeout:10000});
  const prayOwnership=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    routeOwner:document.documentElement.dataset.aoPrayRouteOwner??null,
    rootOwner:document.getElementById("aoPray435930")?.dataset?.aoPrayOwner??null,
    installed:globalThis.AO_PRAY_APP_V1?.status?.().installed??false,
    presentationOwner:globalThis.AO_PRAY_APP_V1?.status?.().presentationOwner??null,
    donorAvailable:globalThis.AO_PRAY_APP_V1?.status?.().donorAvailable??false,
    presentationVersion:globalThis.AO_PRAY_V435930?.version??null,
    prayerRecords:globalThis.AO_PRAY_V435930?.qa?.()?.prayerRecords??null,
    prayOpen:document.getElementById("aoPray435930")?.classList?.contains("open")??false,
    legacyPrayerBookOpen:document.getElementById("aoPrayerBookRoot")?.classList?.contains("open")??false,
    homeSuppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    homeDisplay:getComputedStyle(document.querySelector(".homeScreen")).display,
  }));
  assert.equal(prayOwnership.active,"pray");
  assert.equal(prayOwnership.routeOwner,"modular-pray-v1","production PRAY click bypassed modular route owner");
  assert.equal(prayOwnership.rootOwner,"modular-pray-v1");
  assert.equal(prayOwnership.installed,true);
  assert.equal(prayOwnership.presentationOwner,"AO_PRAY_V435930");
  assert.equal(prayOwnership.donorAvailable,true);
  assert.equal(prayOwnership.presentationVersion,"43.59.30-pray-acceptance");
  assert.equal(prayOwnership.prayerRecords,48);
  assert.equal(prayOwnership.prayOpen,true);
  assert.equal(prayOwnership.legacyPrayerBookOpen,false,"obsolete PrayerBook surface reopened underneath final PRAY");
  assert.equal(prayOwnership.homeSuppressed,"true","PRAY did not isolate Home");
  assert.equal(prayOwnership.homeDisplay,"none","Home remained visually exposed beneath PRAY");

  await page.locator("[data-ao-app-surface='home']").click();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="home" &&
    document.querySelector(".homeScreen")?.dataset?.aoHomeOwner==="modular-home-v2" &&
    document.querySelector(".homeScreen")?.dataset?.aoHomePresentationOwner==="modular-home-presentation-v1" &&
    !document.getElementById("aoPray435930")?.classList?.contains("open"),
    null,{timeout:10000});
  const homeOwnership=await page.evaluate(()=>({
    owner:document.querySelector(".homeScreen")?.dataset?.aoHomeOwner??null,
    presentationOwner:document.querySelector(".homeScreen")?.dataset?.aoHomePresentationOwner??null,
    installed:globalThis.AO_HOME_APP_V1?.status?.().installed??false,
    presentationAttached:globalThis.AO_HOME_APP_V1?.status?.().presentationAttached??false,
    donorAvailable:globalThis.AO_HOME_APP_V1?.status?.().donorHomeAvailable??false,
    enrichersOwner:globalThis.AO_HOME_APP_V1?.status?.().enrichersOwner??null,
    modularEnrichers:document.querySelectorAll("[data-ao-home-enricher-owner='modular-home-enrichers-v1']").length,
    donorHomeEnricherVisible:[...document.querySelectorAll(".aoComingUpV4323,.aoDailyCateHome")].some(node=>{
      const style=getComputedStyle(node);
      return node.isConnected&&!node.hidden&&style.display!=="none"&&style.visibility!=="hidden";
    }),
    prayStillOpen:document.getElementById("aoPray435930")?.classList?.contains("open")??false,
    homeSuppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    homeDisplay:getComputedStyle(document.querySelector(".homeScreen")).display,
  }));
  assert.equal(homeOwnership.owner,"modular-home-v2","production Home click did not use modular Home owner");
  assert.equal(homeOwnership.presentationOwner,"modular-home-presentation-v1","production Home did not use modular base presentation");
  assert.equal(homeOwnership.installed,true);
  assert.equal(homeOwnership.presentationAttached,true,"modular Home presentation is not subscribed to runtime state");
  assert.equal(homeOwnership.enrichersOwner,"modular-home-enrichers-v1","Home transition did not restore modular enrichers");
  assert.equal(homeOwnership.modularEnrichers,2,"Home transition did not restore both modular enricher cards");
  assert.equal(homeOwnership.donorHomeEnricherVisible,false,"donor Home enrichers resurfaced after PRAY -> Home");
  assert.equal(homeOwnership.prayStillOpen,false,"Home transition left modular PRAY presentation open");
  assert.equal(homeOwnership.homeSuppressed,"false","Home suppression survived return to Home");
  assert.notEqual(homeOwnership.homeDisplay,"none","Home did not become visible after returning Home");

  // Settings is a contextual overlay, not a permanent ribbon slot.
  await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings",null,{timeout:10000});

  const end=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    confirms:globalThis.__AO_APP_JOURNEY_CONFIRMS,
    owner:document.documentElement.dataset.aoAppShellOwner??null,
    homeSuppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    homeDisplay:getComputedStyle(document.querySelector(".homeScreen")).display,
  }));
  assert.equal(end.active,"settings");
  assert.equal(end.confirms,2,"LIVE leave/resume guard did not run exactly twice");
  assert.equal(end.owner,"AO_APP_SHELL_V1");
  assert.equal(end.homeSuppressed,"true","Settings did not isolate Home");
  assert.equal(end.homeDisplay,"none","Home remained visually exposed beneath Settings");

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
