import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
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
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const candidate=resolve(repoRoot,"."+pathname);
    if(candidate!==repoRoot && !candidate.startsWith(repoRoot+sep)){
      res.writeHead(403);res.end("forbidden");return;
    }
    const data=await readFile(candidate);
    res.writeHead(200,{"content-type":mime[extname(candidate)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});

await new Promise((ok,fail)=>{
  server.once("error",fail);
  server.listen(4177,"127.0.0.1",ok);
});

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
  const consoleErrors=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  page.on("console",msg=>{
    if(msg.type()==="error")consoleErrors.push(msg.text());
  });

  await page.goto("http://127.0.0.1:4177/index.html?aoR17Reader=native",{
    waitUntil:"domcontentloaded",
    timeout:90000,
  });
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
    null,{timeout:30000}
  );

  const instrumented=await page.evaluate((iconKeys)=>{
    globalThis.__AO_JOURNEY_CALLS=[];
    globalThis.__AO_JOURNEY_CONFIRM_MODE="cancel";

    const originalNav=globalThis.AO_NAV_V362;
    const originalShell=globalThis.AO_V37_SHELL;
    if(!originalNav?.home || !originalShell?.openDomain || !originalShell?.openModule){
      return {ok:false,reason:"DONOR_APIS_UNAVAILABLE"};
    }

    globalThis.AO_NAV_V362=new Proxy(originalNav,{
      get(target,prop,receiver){
        if(prop==="home"){
          return (...args)=>{
            globalThis.__AO_JOURNEY_CALLS.push("home");
            return Reflect.apply(target.home,target,args);
          };
        }
        return Reflect.get(target,prop,receiver);
      },
    });

    globalThis.AO_V37_SHELL=new Proxy(originalShell,{
      get(target,prop,receiver){
        if(prop==="openDomain"){
          return (...args)=>{
            globalThis.__AO_JOURNEY_CALLS.push("domain:"+String(args[0]));
            return Reflect.apply(target.openDomain,target,args);
          };
        }
        if(prop==="openModule"){
          return (...args)=>{
            globalThis.__AO_JOURNEY_CALLS.push("module:"+String(args[0]));
            return Reflect.apply(target.openModule,target,args);
          };
        }
        return Reflect.get(target,prop,receiver);
      },
    });

    for(const key of ["AO_SETTINGS_V4359","AO_SETTINGS_V4358","AO_SETTINGS_V4356"]){
      const api=globalThis[key];
      if(!api?.open)continue;
      globalThis[key]=new Proxy(api,{
        get(target,prop,receiver){
          if(prop==="open"){
            return (...args)=>{
              globalThis.__AO_JOURNEY_CALLS.push("settings:open");
              return Reflect.apply(target.open,target,args);
            };
          }
          return Reflect.get(target,prop,receiver);
        },
      });
      break;
    }

    const baseRuntime=globalThis.AO_RUNTIME_V8;
    const baseStore=baseRuntime?.store;
    const baseGetState=typeof baseStore?.getState==="function"
      ? ()=>baseStore.getState()
      : ()=>({});
    let routeOverride=null;

    globalThis.AO_RUNTIME_V8={
      ...(baseRuntime??{}),
      store:{
        ...(baseStore??{}),
        getState:()=>({
          ...baseGetState(),
          route:routeOverride??baseGetState()?.route??"home",
          selectedDate:"2026-10-04",
          language:"en",
          settings:{
            ...(baseGetState()?.settings??{}),
            massForm:"mc-incense",
            followMode:"vox",
            massPostureProfile:"TRADITIONAL_WALSH",
            massGestureProfile:"GUIDED_1962",
            faithfulCommunion:true,
          },
        }),
      },
    };
    globalThis.__AO_JOURNEY_SET_ROUTE=(value)=>{routeOverride=value;};

    globalThis.confirm=()=>{
      const mode=globalThis.__AO_JOURNEY_CONFIRM_MODE;
      globalThis.__AO_JOURNEY_CALLS.push("confirm:"+mode);
      if(mode==="leave"){
        routeOverride="home";
        return true;
      }
      return false;
    };

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

    return {
      ok:true,
      active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      surfaces:[...document.querySelectorAll("#ao-global-ribbon [data-ao-app-surface]")]
        .map(button=>button.dataset.aoAppSurface),
    };
  },iconKeys);

  assert.equal(instrumented.ok,true,instrumented.reason??"journey instrumentation failed");
  assert.deepEqual(
    instrumented.surfaces,
    ["home","mass","pray","learn","calendar","settings"],
    "visible modular ribbon does not expose the locked six-destination order"
  );

  async function tapSurface(surface){
    const locator=page.locator(`#ao-global-ribbon [data-ao-app-surface="${surface}"]`);
    await locator.waitFor({state:"visible",timeout:10000});
    const box=await locator.boundingBox();
    assert.ok(box && box.width>=20 && box.height>=20,`visible ${surface} ribbon target is not tappable`);
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
    await page.waitForFunction(expected=>
      globalThis.AO_APP_SHELL_V1?.getActive?.()===expected,
      surface,{timeout:10000}
    );
  }

  // Cold launch -> Home.
  await tapSurface("home");
  assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()),"home");

  // Home -> Calendar through the visible modular ribbon and donor-backed module.
  await tapSurface("calendar");
  assert.equal(
    await page.evaluate(()=>globalThis.__AO_JOURNEY_CALLS.includes("module:today.calendar")),
    true,
    "Calendar ribbon did not reach the canonical today.calendar module"
  );

  // Calendar -> Mass destination, then the resolved celebration enters native LIVE.
  await tapSurface("mass");
  assert.equal(
    await page.evaluate(()=>globalThis.__AO_JOURNEY_CALLS.includes("domain:mass")),
    true,
    "Mass ribbon did not reach the Mass domain"
  );

  const entered=await page.evaluate(async()=>{
    const mod=await import("/src/mass/browser-entry.js?cross-domain-journey=1");
    const controller=mod.createBrowserMassController();
    const prepared=await controller.enter();
    globalThis.__AO_JOURNEY_SET_ROUTE?.("live");
    return {
      schema:prepared.schema,
      form:prepared.session.resolvedMass.form,
      mode:prepared.readerPreferences.mode,
      celebrationId:prepared.session.resolvedMass.actualCelebration?.id??null,
    };
  });
  assert.equal(entered.schema,"ao-mass-entry-bootstrap-v1");
  assert.equal(entered.form,"MISSA_CANTATA_INCENSE");
  assert.equal(entered.mode,"LIVE");
  assert.equal(entered.celebrationId,"holy_rosary");

  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"attached",timeout:30000});
  assert.equal(
    await page.evaluate(()=>document.documentElement.dataset.aoMassReaderUi),
    "R17_NATIVE_PRODUCTION"
  );
  assert.equal(await page.evaluate(()=>globalThis.__AO_FINAL_LEGACY_STARTS),0);

  // Tapping Mass while LIVE retains the live reader rather than restarting it.
  await tapSurface("mass");
  assert.equal(
    await page.locator("#ao-r17-native-reader-preview").count(),
    1,
    "Mass ribbon did not retain the active native LIVE session"
  );

  // First attempt to leave LIVE is cancelled and must stay on Mass.
  await page.evaluate(()=>{globalThis.__AO_JOURNEY_CONFIRM_MODE="cancel";});
  const prayButton=page.locator('#ao-global-ribbon [data-ao-app-surface="pray"]');
  {
    const box=await prayButton.boundingBox();
    assert.ok(box,"Pray ribbon target missing during LIVE");
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  }
  await page.waitForTimeout(150);
  assert.equal(
    await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()),
    "mass",
    "cancelled LIVE leave escaped the Mass surface"
  );
  assert.equal(
    await page.evaluate(()=>globalThis.__AO_JOURNEY_CALLS.includes("confirm:cancel")),
    true,
    "LIVE leave guard was not invoked on cross-domain navigation"
  );

  // Confirm leave, then move to PRAY.
  await page.evaluate(()=>{globalThis.__AO_JOURNEY_CONFIRM_MODE="leave";});
  await tapSurface("pray");
  assert.equal(
    await page.evaluate(()=>globalThis.__AO_JOURNEY_CALLS.includes("confirm:leave")),
    true,
    "confirmed LIVE leave was not recorded"
  );
  assert.equal(
    await page.evaluate(()=>globalThis.__AO_JOURNEY_CALLS.includes("domain:pray")),
    true,
    "confirmed LIVE leave did not open PRAY"
  );

  // PRAY -> Home -> Settings completes the required cross-domain journey.
  await tapSurface("home");
  await tapSurface("settings");

  const finalState=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    owner:document.documentElement.dataset.aoAppShellOwner??null,
    visibleOwner:globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner??false,
    calls:[...(globalThis.__AO_JOURNEY_CALLS??[])],
  }));
  assert.equal(finalState.active,"settings");
  assert.equal(finalState.owner,"AO_APP_SHELL_V1");
  assert.equal(finalState.visibleOwner,true);
  assert.ok(
    finalState.calls.includes("settings:open") || finalState.calls.includes("module:utility.settings"),
    "Settings ribbon did not reach a Settings owner"
  );

  assert.deepEqual(pageErrors,[],"uncaught errors in cross-domain phone journey: "+JSON.stringify(pageErrors));
  assert.deepEqual(consoleErrors,[],"console errors in cross-domain phone journey: "+JSON.stringify(consoleErrors));

  await context.close();
  console.log("PASS cross-domain phone journey: Home -> Calendar -> Mass -> native LIVE -> guarded leave -> PRAY -> Home -> Settings.");
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
