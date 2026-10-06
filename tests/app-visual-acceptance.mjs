import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance");
await mkdir(out,{recursive:true});

const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
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
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4186,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB",
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));

  await page.goto("http://127.0.0.1:4186/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:30000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForSelector("[data-ao-home-enricher-owner='modular-home-enrichers-v1']",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:8000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.status?.().presentationFx?.legacyCinematicAvailable===true,
    null,{timeout:8000}
  );

  const expectedRibbonAssets={
    home:"ao-nav-home",
    mass:"ao-brand-emblem",
    pray:"ao-nav-pray",
    learn:"ao-nav-learn",
    calendar:"ao-nav-calendar",
    settings:"ao-nav-settings",
  };
  const ribbonAssets=await page.evaluate(expected=>Object.fromEntries(
    Object.entries(expected).map(([surface,assetId])=>{
      const button=document.querySelector(`#ao-global-ribbon [data-ao-app-surface="${surface}"]`);
      const icon=button?.querySelector?.(".aoCanonicalRibbonIcon")??null;
      const mask=icon?(getComputedStyle(icon).webkitMaskImage||getComputedStyle(icon).maskImage||""):"";
      return [surface,{
        buttonAsset:button?.dataset?.aoAssetId??null,
        iconAsset:icon?.dataset?.aoAssetId??null,
        renderer:icon?.dataset?.aoAssetRenderer??null,
        mask,
        legacySvg:icon?.querySelectorAll?.("svg,use")?.length??0,
      }];
    })
  ),expectedRibbonAssets);
  for(const [surface,assetId] of Object.entries(expectedRibbonAssets)){
    const actual=ribbonAssets[surface];
    assert.equal(actual.buttonAsset,assetId,surface+" ribbon button lost canonical semantic ownership");
    assert.equal(actual.iconAsset,assetId,surface+" ribbon icon is not the canonical asset");
    assert.equal(actual.renderer,"mask",surface+" ribbon icon did not use the canonical mask renderer");
    assert.equal(actual.legacySvg,0,surface+" ribbon icon still contains inherited legacy SVG artwork");
    assert.match(actual.mask,new RegExp(assetId+"\\.png"),surface+" ribbon mask does not resolve to the frozen navigation PNG");
  }

  const homeAudit=await page.evaluate(()=>({
    release:document.documentElement.dataset.aoRelease??null,
    releaseAuthority:document.documentElement.dataset.aoReleaseAuthority??null,
    suppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    canonicalIcons:document.querySelectorAll(".aoHomeCuIcon use").length,
    fallbackIcons:document.querySelectorAll(".aoHomeCuIconFallback").length,
    presentationFx:globalThis.AO_APP_SHELL_V1?.status?.().presentationFx??null,
  }));
  assert.equal(homeAudit.release,"43.59.30");
  assert.equal(homeAudit.releaseAuthority,"AO_APP_SHELL_V1");
  assert.equal(homeAudit.suppressed,"false");
  assert.equal(homeAudit.canonicalIcons,3,"Home Coming Up did not render all canonical embedded symbols");
  assert.equal(homeAudit.fallbackIcons,0,"Home Coming Up fell back to placeholder artwork");
  assert.equal(homeAudit.presentationFx?.installed,true,"modular presentation FX bridge is not installed");
  assert.equal(homeAudit.presentationFx?.legacyCinematicAvailable,true,"v43.12 cinematic owner is not bridged into the modular shell");
  assert.equal(homeAudit.presentationFx?.transitionPresent,true,"route-transition cinematic surface is missing");
  assert.equal(homeAudit.presentationFx?.loaderPresent,true,"async cinematic loader surface is missing");

  const consumedMaskPaths={
    "ao-rich-adoration":"assets/active/devotional-module/ao-rich-adoration.png",
    "ao-rich-angelus":"assets/active/devotional-module/ao-rich-angelus.png",
    "ao-rich-confession":"assets/active/devotional-module/ao-rich-confession.png",
    "ao-rich-rosary":"assets/active/devotional-module/ao-rich-rosary.png",
    "ao-rich-sacred-heart":"assets/active/devotional-module/ao-rich-sacred-heart.png",
    "ao-rich-stations":"assets/active/devotional-module/ao-rich-stations.png",
  };
  const consumedMaskFetch=await page.evaluate(async paths=>Object.fromEntries(await Promise.all(
    Object.entries(paths).map(async([assetId,path])=>{
      const response=await fetch(path,{cache:"no-store"});
      return [assetId,{ok:response.ok,status:response.status,type:response.headers.get("content-type")||"",bytes:(await response.arrayBuffer()).byteLength}];
    })
  )),consumedMaskPaths);
  for(const [assetId,result] of Object.entries(consumedMaskFetch)){
    assert.equal(result.ok,true,assetId+" canonical mask is not physically available");
    assert.match(result.type,/image\/png/i,assetId+" canonical mask is not served as PNG");
    assert.ok(result.bytes>0,assetId+" canonical mask is empty");
  }

  const expectedEmbeddedSymbols=[
    "ao-refined-calendar-upcoming",
    "ao-refined-church",
    "ao-refined-pray-now",
    "ao-rich-examination-of-conscience",
    "ao-rich-morning-offering",
    "ao-rich-night-prayer",
    "ao-rich-our-lady-marian-devotions",
    "ao-refined-study",
    "ao-rich-guides",
    "ao-refined-scripture",
    "ao-refined-saint-of-day",
  ];
  const embeddedPresence=await page.evaluate(ids=>Object.fromEntries(ids.map(id=>[id,Boolean(document.getElementById(id))])),expectedEmbeddedSymbols);
  for(const id of expectedEmbeddedSymbols)assert.equal(embeddedPresence[id],true,id+" is consumed but neither physically externalized nor embedded");

  const shot=async(name)=>page.screenshot({path:resolve(out,name+".png"),fullPage:true});
  const waitForFxSettled=async()=>page.waitForFunction(()=>{
    const el=document.getElementById("ao-cinema-transition");
    return !el||el.getAttribute("aria-hidden")==="true";
  },null,{timeout:3500});
  const assertHomeHidden=async(surface)=>{
    const s=await page.evaluate(()=>({
      suppressed:document.documentElement.dataset.aoHomeSuppressed??null,
      display:getComputedStyle(document.querySelector(".homeScreen")).display,
    }));
    assert.equal(s.suppressed,"true",surface+" did not mark Home suppressed");
    assert.equal(s.display,"none",surface+" exposed Home beneath the active surface");
  };

  assert.equal(await page.locator(".aoSaintArtCard .aoSaintArtPlaceholder").filter({hasText:/No reusable artwork|No artwork is assigned|not approved for production/i}).count(),0,"Home exposed a terminal saint-art placeholder instead of suppressing the unresolved card");
  const homeParity=await page.evaluate(()=>({
    celebrationTitles:document.querySelectorAll(".homeScreen .celebrationBlock > h1").length,
    aroundMassActions:document.querySelectorAll(".homeScreen .aroundMass .phaseButton").length,
    followMass:document.querySelectorAll(".homeScreen [data-home-mass-entry]").length,
    gospelCards:document.querySelectorAll(".homeScreen .gospelCard").length,
    comingUp:document.querySelectorAll(".homeScreen .aoHomeComingUp").length,
    dailyCatechism:document.querySelectorAll(".homeScreen .aoHomeDailyCatechism").length,
    calendarDashboard:document.querySelectorAll(".homeScreen .aoCalYearWheel").length,
    brand:document.querySelector(".homeScreen .brandName")?.textContent?.trim()??"",
    celebration:document.querySelector(".homeScreen .celebrationBlock > h1")?.textContent?.trim()??"",
    gospel:document.querySelector(".homeScreen .gospelCard p")?.textContent?.trim()??"",
  }));
  assert.equal(homeParity.celebrationTitles,1,"Home lost its single liturgical-day identity");
  assert.equal(homeParity.aroundMassActions,3,"Home lost the Prepare / Follow Mass / Give thanks triad");
  assert.equal(homeParity.followMass,1,"Home does not expose exactly one canonical Follow Mass action");
  assert.equal(homeParity.gospelCards,1,"Home lost its single Gospel-in-context surface");
  assert.equal(homeParity.comingUp,1,"Home lost modular Coming Up");
  assert.equal(homeParity.dailyCatechism,1,"Home lost modular Daily Catechism");
  assert.equal(homeParity.calendarDashboard,0,"Calendar dashboard leaked back onto Home");
  assert.equal(homeParity.brand,"AD ORIENTEM");
  assert.ok(homeParity.celebration.length>0,"Home liturgical-day identity is blank");
  assert.ok(homeParity.gospel.length>0,"Home Gospel context is blank");
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().presentationFx?.version==="modular-presentation-fx-v3",null,{timeout:5000});
  await page.waitForFunction(()=>document.querySelector(".homeScreen .celebrationBlock")?.dataset?.aoPresentationFxHero,null,{timeout:5000});
  const homeFx=await page.evaluate(()=>({
    hero:document.querySelector(".homeScreen .celebrationBlock")?.dataset?.aoPresentationFxHero??null,
    rootScan:document.querySelector(".homeScreen")?.dataset?.aoPresentationFxArtScan??null,
    width:document.querySelector(".homeScreen .celebrationBlock")?.getBoundingClientRect?.().width??0,
  }));
  assert.match(homeFx.hero,/modular-presentation-fx-v3/,"Home celebration hero did not receive recovered entry choreography");
  assert.equal(homeFx.rootScan,"legacy-v4312","Home modular root bypassed the approved v43.12 art loader");
  assert.ok(homeFx.width>=350,"Home hero choreography changed phone geometry");
  await shot("01-home");

  await page.waitForFunction(()=>typeof globalThis.AO_CELEBRATION_API?.openPreflight==="function",null,{timeout:10000});
  await page.locator("[data-home-mass-entry]").click();
  await page.waitForSelector("#ao-mass-flow-v1 .aoMassFlowBackdrop",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="mass",null,{timeout:10000});
  const massEntry=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    preflightVisible:Boolean(document.querySelector("#ao-mass-flow-v1 .aoMassFlowBackdrop .aoMassFlow")),
    nativeMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
    donorLearnVisible:Boolean(document.getElementById("ao-v37-root")?.classList?.contains("aoV37ShellOpen")),
  }));
  assert.equal(massEntry.active,"mass","Home Follow Mass did not activate the Mass destination");
  assert.equal(massEntry.preflightVisible,true,"Home Follow Mass did not open the celebration preflight");
  assert.equal(massEntry.nativeMounted,false,"fresh Mass entry bypassed preflight and mounted R17 immediately");
  await shot("01b-mass-preflight");
  await page.locator("#ao-mass-flow-v1 [data-ao-close]").last().click();
  await page.waitForFunction(()=>!document.getElementById("ao-mass-flow-v1"),null,{timeout:5000});
  await page.locator("[data-ao-app-surface='home']").click();
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:5000});

  await page.locator("[data-ao-app-surface='calendar']").click();
  await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:10000});
  const genericCalendarTransition=await page.evaluate(()=>{
    const el=document.getElementById("ao-cinema-transition");
    const title=el?.querySelector?.("[data-ao-cinema-transition-title]")?.textContent?.trim()??"";
    return {on:Boolean(el?.classList?.contains("aoCinemaTransitionOn")),title};
  });
  assert.notEqual(genericCalendarTransition.title,"Calendar","Calendar ribbon navigation regressed to the fabricated generic destination cinematic");
  await page.waitForFunction(()=>document.getElementById("ao-calendar-modular-root")?.dataset?.aoPresentationFx==="entered",null,{timeout:3000});
  await waitForFxSettled();
  await assertHomeHidden("Calendar");
  await page.waitForFunction(()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.version==="43.45-modular-exact",null,{timeout:5000});
  await page.evaluate(()=>{
    const id=globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate;
    globalThis.__AO_EXACT_WEEK_RETRY=globalThis.AO_CALENDAR_WEEK_CACHE_V4345.retryWeek(id);
  });
  await page.waitForFunction(()=>{
    const el=document.getElementById("ao-cinema-loader");
    return el?.dataset?.kind==="calendar-week"&&el.classList.contains("aoCinemaLoaderOn");
  },null,{timeout:5000});
  const donorWeekLoader=await page.evaluate(()=>{
    const el=document.getElementById("ao-cinema-loader");
    return {
      kind:el?.dataset?.kind??null,
      title:el?.querySelector?.("[data-ao-cinema-loader-title]")?.textContent?.trim()??"",
      sub:el?.querySelector?.("[data-ao-cinema-loader-sub]")?.textContent?.trim()??"",
      progress:el?.dataset?.weekProgress??null,
    };
  });
  assert.equal(donorWeekLoader.kind,"calendar-week","Calendar did not use the donor week-progress workload");
  assert.equal(donorWeekLoader.title,"Preparing the liturgical week","Calendar week loader copy diverged from the approved donor");
  assert.match(donorWeekLoader.sub,/\d+ of 7 days prepared/,"Calendar week loader lost seven-day progress");
  assert.equal(donorWeekLoader.progress,"1962 calendar · complete week","Calendar week loader lost its donor progress identity");
  await page.evaluate(()=>globalThis.__AO_EXACT_WEEK_RETRY);
  await page.waitForFunction(()=>{
    const api=globalThis.AO_CALENDAR_WEEK_CACHE_V4345,state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return api?.weekReady?.(state?.selectedDate)===true;
  },null,{timeout:20000});
  const donorWeek=await page.evaluate(()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345.inspect());
  assert.equal(donorWeek.weekReady,true,"Calendar did not resolve the complete visible week");
  assert.equal(donorWeek.visibleWeek.length,7,"Calendar donor week cache does not contain seven dates");
  assert.equal(donorWeek.visibleWeek.every(x=>x.cached),true,"Calendar rail still contains unresolved placeholder dates after donor preload");
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-input]").count(),1);
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-native]").count(),0);
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalYearWheel").count(),1,"Calendar lost its sacred-time annual overview");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalIdentity").count(),1,"Calendar lost its single selected-feast identity");
  assert.ok(await page.locator("#ao-calendar-modular-root .aoCalObservance").count()>=7,"Calendar lost the touch observance rail");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalObservance[aria-current='date']").count(),1,"Calendar selected date is not uniquely identified");
  const calendarDashboard=await page.evaluate(()=>({
    wheel:document.querySelector("#ao-calendar-modular-root .aoCalYearWheel")?.getBoundingClientRect()?.width??0,
    identity:document.querySelector("#ao-calendar-modular-root .aoCalIdentity h2")?.textContent?.trim()??"",
    railScrollable:(()=>{const x=document.querySelector("#ao-calendar-modular-root .aoCalModRail");return x?x.scrollWidth>=x.clientWidth:false})(),
  }));
  assert.ok(calendarDashboard.wheel>=120,"Calendar annual overview collapsed below phone-readable size");
  assert.ok(calendarDashboard.identity.length>0,"Calendar selected feast identity is blank");
  assert.equal(calendarDashboard.railScrollable,true,"Calendar observance rail is not touch-scrollable/snapping");
  const calendarFx=await page.evaluate(()=>({
    hero:document.querySelector("#ao-calendar-modular-root .aoCalSacredTime")?.dataset?.aoPresentationFxHero??null,
    rootScan:document.getElementById("ao-calendar-modular-root")?.dataset?.aoPresentationFxArtScan??null,
  }));
  assert.match(calendarFx.hero,/modular-presentation-fx-v3/,"Calendar Sacred Time hero did not receive recovered entry choreography");
  assert.equal(calendarFx.rootScan,"legacy-v4312","Calendar modular root bypassed the approved v43.12 art loader");
  await shot("02-calendar");

  await page.locator("[data-ao-app-surface='pray']").click();
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
  await waitForFxSettled();
  await assertHomeHidden("PRAY");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-back]").count(),1,"PRAY root lost its Home return control");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-close]").count(),0,"PRAY root exposes duplicate Back + Close exits");
  const prayHub=await page.evaluate(()=>{
    const sheet=document.querySelector("#aoPray435930 .aoP435930Sheet"),grid=document.querySelector("#aoPray435930 .aoP435930ModuleGrid");
    const first=document.querySelector("#aoPray435930 .aoP435930ModuleCard"),title=first?.querySelector("b"),description=first?.querySelector(".aoP435930ModuleDescription"),icon=first?.querySelector(".aoP435930ModuleIcon");
    const tr=title?.getBoundingClientRect?.(),dr=description?.getBoundingClientRect?.(),ir=icon?.getBoundingClientRect?.();
    return {
      owner:document.getElementById("aoPray435930")?.dataset?.aoPrayOwner??null,
      cards:document.querySelectorAll("#aoPray435930 .aoP435930ModuleCard").length,
      legacyOpen:[...document.querySelectorAll("#aoPrayerBookRoot")].some(root=>root.classList.contains("open")),
      sheetWidth:sheet?.getBoundingClientRect?.().width??0,
      gridColumns:grid?getComputedStyle(grid).gridTemplateColumns:"",
      overflow:(sheet?.scrollWidth??0)-(sheet?.clientWidth??0),
      titleWidth:tr?.width??0,
      descriptionWidth:dr?.width??0,
      iconRight:ir?.right??0,
      titleLeft:tr?.left??0,
    };
  });
  assert.equal(prayHub.owner,"modular-pray-v1");
  assert.ok(prayHub.cards>=10,"PRAY hub lost its locked devotional module hierarchy");
  assert.equal(prayHub.legacyOpen,false,"legacy Prayer Book is visible beneath modular PRAY");
  assert.ok(prayHub.sheetWidth>=360&&prayHub.sheetWidth<=390,"PRAY phone shell is not bounded to the viewport");
  assert.ok(!/\s/.test(prayHub.gridColumns.trim()),"PRAY hub regressed to multiple module columns on phone");
  assert.ok(prayHub.overflow<=1,"PRAY hub has horizontal overflow");
  assert.ok(prayHub.titleWidth>=220&&prayHub.descriptionWidth>=220,"PRAY module text collapsed into the icon column");
  assert.ok(prayHub.titleLeft>=prayHub.iconRight+6,"PRAY module text overlaps its canonical icon column");
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930HomeIntro")?.dataset?.aoPresentationFxHero,null,{timeout:3000});
  const prayFx=await page.evaluate(()=>({
    hero:document.querySelector("#aoPray435930 .aoP435930HomeIntro")?.dataset?.aoPresentationFxHero??null,
    rootScan:document.getElementById("aoPray435930")?.dataset?.aoPresentationFxArtScan??null,
  }));
  assert.match(prayFx.hero,/modular-presentation-fx-v3/,"PRAY home hero did not receive recovered entry choreography");
  assert.equal(prayFx.rootScan,"legacy-v4312","PRAY modular root bypassed the approved v43.12 art loader");
  await shot("03-pray");

  // Exact v3.14 Angelus ritual rail: the rail belongs to the reading grid.
  // On phone it reflows above the prayer cards as a horizontal cue row.
  await page.locator("#aoPray435930 [data-p435930-own='pray.angelus_regina']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="angelus",null,{timeout:5000});
  const angelusRails=await page.evaluate(()=>{
    const grid=document.querySelector("#aoPray435930 .aoAngelusRitualGrid");
    const rail=grid?.querySelector('[data-ao-ritual-module="angelus"]')??null;
    const posture=rail?.querySelector('[data-channel="posture"]')??null;
    const icon=posture?.querySelector(".aoRitualIcon")??null;
    const gs=grid?getComputedStyle(grid):null,rs=rail?getComputedStyle(rail):null;
    return {
      oldOverlay:document.querySelectorAll("#aoPray435930 .aoP435930SemanticRails").length,
      gridColumns:gs?.gridTemplateColumns??"",
      channels:rail?.dataset?.aoRitualChannels??null,
      railDirection:rs?.flexDirection??null,
      railPosition:rs?.position??null,
      postureChannel:posture?.dataset?.channel??null,
      postureAsset:icon?.dataset?.aoAssetId||icon?.dataset?.aoInlineAssetId||null,
      slotHeight:posture?.getBoundingClientRect?.().height??0,
      incarnationUnits:grid?.querySelectorAll?.('[data-ao-incarnation="true"]')?.length??0,
      genericAngelusContext:grid?.querySelectorAll?.('[data-ao-asset-id="ao-rich-angelus"]')?.length??0,
    };
  });
  assert.equal(angelusRails.oldOverlay,0,"Angelus exact donor view still exposes the later fixed semantic-overlay rail");
  assert.equal(angelusRails.channels,"posture,gesture","Angelus ritual rail lost the donor posture/gesture channel contract");
  assert.equal(angelusRails.railDirection,"row","Angelus phone rail did not reflow into the donor horizontal cue row");
  assert.equal(angelusRails.railPosition,"sticky","Angelus exact donor rail is no longer sticky with the reader");
  assert.equal(angelusRails.postureChannel,"posture","Angelus rail no longer identifies the persistent posture channel");
  assert.ok(["ao-live-stand","ao-live-kneel"].includes(angelusRails.postureAsset),"Angelus posture slot is not using the canonical posture bank");
  assert.ok(angelusRails.slotHeight>=54,"Angelus phone ritual slot collapsed below donor-readable geometry");
  assert.equal(angelusRails.incarnationUnits,1,"Angelus lost the unique Incarnation focus marker");
  assert.equal(angelusRails.genericAngelusContext,0,"Angelus regained the later generic devotional context card");
  assert.ok(angelusRails.gridColumns.length>0&&!angelusRails.gridColumns.includes("80px"),"Angelus phone ritual grid did not collapse to the donor one-column layout");
  const angelusHeader=await page.evaluate(()=>{
    const button=document.querySelector("#aoPray435930 [data-p435930-close]");
    return {
      closeButtons:document.querySelectorAll("#aoPray435930 [data-p435930-close]").length,
      closeSvgs:document.querySelectorAll("#aoPray435930 [data-p435930-close] svg[data-ao-inline-asset-id='ao-ui-close']").length,
      closePaths:document.querySelectorAll("#aoPray435930 [data-p435930-close] svg[data-ao-inline-asset-id='ao-ui-close'] path").length,
      visibleChildren:[...(button?.children??[])].filter(node=>getComputedStyle(node).display!=="none").length,
      before:button?getComputedStyle(button,"::before").content:null,
      after:button?getComputedStyle(button,"::after").content:null,
    };
  });
  assert.deepEqual(angelusHeader,{closeButtons:1,closeSvgs:1,closePaths:1,visibleChildren:1,before:"none",after:"none"},"Angelus close control still has duplicate visible decoration");
  await shot("03a-pray-angelus-rails");
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  await page.locator("#aoPray435930 [data-p435930-own='pray.stations']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="stations",null,{timeout:5000});
  await waitForFxSettled();
  const stationRails=await page.evaluate(()=>({
    left:document.querySelectorAll("#aoPray435930 .aoP435930SemanticRail.left").length,
    right:document.querySelectorAll("#aoPray435930 .aoP435930SemanticRail.right").length,
    cue:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    cueMask:(()=>{const x=document.querySelector("#aoPray435930 .aoP435930SemanticRail.left .aoP435930SemanticRailIcon");return x?(getComputedStyle(x).webkitMaskImage||getComputedStyle(x).maskImage||""):""})(),
    context:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    contextMask:(()=>{const x=document.querySelector("#aoPray435930 .aoP435930SemanticRail.right .aoP435930SemanticRailIcon");return x?(getComputedStyle(x).webkitMaskImage||getComputedStyle(x).maskImage||""):""})(),
    step:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right small")?.textContent?.trim()??"",
    bodyWidth:document.querySelector("#aoPray435930 .aoP435930Body")?.getBoundingClientRect?.().width??0,
  }));
  assert.equal(stationRails.left,1,"Stations lost its sourced face-the-Station semantic cue");
  assert.equal(stationRails.right,1,"Stations lost its devotional-context rail");
  assert.equal(stationRails.cue,"ao-live-look","Stations movement cue is not using the canonical look/attention asset");
  assert.match(stationRails.cueMask,/ao-live-look\.png/,"Stations attention rail did not load the canonical frozen look cue");
  assert.equal(stationRails.context,"ao-rich-stations","Stations context rail is not using the canonical devotional identity");
  assert.match(stationRails.contextMask,/ao-rich-stations\.png/,"Stations semantic rail did not load the canonical frozen mask");
  assert.match(stationRails.step,/I\s*\/\s*XIV/,"Stations rail does not expose the current station identity");
  assert.ok(stationRails.bodyWidth>=360,"Stations semantic rails reserved horizontal reading width");
  await shot("03b-pray-stations-rail");

  await page.locator("#aoPray435930 [data-p435930-station-next]").click();
  await page.waitForSelector("#ao-cinema-transition.aoCinemaTransitionOn",{state:"visible",timeout:2000});
  await page.waitForFunction(()=>/II\s*\/\s*XIV/.test(document.querySelector("#aoPray435930 .aoP435930SemanticRail.right small")?.textContent??""),null,{timeout:3000});
  const stationFx=await page.evaluate(()=>({
    title:document.querySelector("#ao-cinema-transition [data-ao-cinema-transition-title]")?.textContent?.trim()??document.querySelector("#ao-cinema-transition .aoCinemaTransitionTitle")?.textContent?.trim()??"",
    kicker:document.querySelector("#ao-cinema-transition [data-ao-cinema-transition-kicker]")?.textContent?.trim()??document.querySelector("#ao-cinema-transition .aoCinemaTransitionKicker")?.textContent?.trim()??"",
    active:document.querySelector("#aoPray435930 .aoP435930StationRail [aria-current='step'] span")?.textContent?.trim()??"",
  }));
  assert.equal(stationFx.active,"II","Stations horizontal navigator did not advance with the cinematic");
  assert.match((stationFx.kicker+" "+stationFx.title).toUpperCase(),/STATIONS|CHEMIN|II/,"Stations change cinematic lost devotional identity");
  await shot("03c-pray-stations-transition");
  await waitForFxSettled();

  await page.locator("#aoPray435930 [data-p435930-station-step='13']").click();
  await page.waitForFunction(()=>/XIV\s*\/\s*XIV/.test(document.querySelector("#aoPray435930 .aoP435930SemanticRail.right small")?.textContent??""),null,{timeout:3000});
  const stationXiv=await page.evaluate(()=>({
    cue:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    context:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    step:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right small")?.textContent?.trim()??"",
    forbidden:[...document.querySelectorAll("#aoPray435930 [data-ao-pray-rail-asset]")].some(x=>/ao-live-(?:stand|kneel)/.test(x.dataset.aoPrayRailAsset||"")),
  }));
  assert.equal(stationXiv.cue,"ao-refined-silence","Station XIV did not change from attention to the donor silence cue");
  assert.equal(stationXiv.context,"ao-rich-stations","Station XIV lost its Stations identity rail");
  assert.match(stationXiv.step,/XIV\s*\/\s*XIV/,"Station XIV rail lost exact current-station identity");
  assert.equal(stationXiv.forbidden,false,"Stations invented a universal stand/kneel cue");
  await shot("03d-pray-stations-xiv-silence");

  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Exact-donor devotional rails: Adoration arrival is transient genuflection,
  // then yields to persistent silence without changing reader geometry.
  await page.locator("#aoPray435930 [data-p435930-own='pray.adoration']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="adoration",null,{timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-ador-mode='visit']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset==="ao-live-genuflect",null,{timeout:3000});
  const adorationArrival=await page.evaluate(()=>({
    left:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    right:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    channel:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-channel]")?.dataset?.aoPrayRailChannel??null,
    bodyWidth:document.querySelector("#aoPray435930 .aoP435930Body")?.getBoundingClientRect?.().width??0,
    pointer:getComputedStyle(document.querySelector("#aoPray435930 .aoP435930SemanticRails")).pointerEvents,
  }));
  assert.equal(adorationArrival.left,"ao-live-genuflect","Adoration Visit arrival lost the donor genuflection cue");
  assert.equal(adorationArrival.right,"ao-rich-adoration","Adoration lost its Eucharistic identity rail");
  assert.equal(adorationArrival.channel,"transient","Adoration arrival cue is no longer transient");
  assert.ok(adorationArrival.bodyWidth>=360,"Adoration rails reserved horizontal reader width");
  assert.equal(adorationArrival.pointer,"none","Adoration rails intercept touch");
  await shot("03e-pray-adoration-arrival");

  await page.locator("#aoPray435930 [data-p435930-visit-next]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset==="ao-refined-silence",null,{timeout:3000});
  assert.equal(await page.locator("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-channel='persistent']").count(),1,"Adoration did not settle into the persistent silence rail");
  await shot("03f-pray-adoration-silence");
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForSelector("#aoPray435930 [data-p435930-ador-mode='visit']",{state:"visible",timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Benediction rail follows the public rite rather than presenting one generic card.
  await page.locator("#aoPray435930 [data-p435930-own='pray.benediction']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="benediction",null,{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset='ao-rich-adoration']").count(),1,"Benediction Exposition rail lost its Eucharistic owner");
  for(let i=0;i<3;i++)await page.locator("#aoPray435930 [data-p435930-ben-next]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset==="ao-live-response",null,{timeout:3000});
  const benPrayer=await page.evaluate(()=>({
    left:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    right:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    macro:document.querySelector("#aoPray435930 .aoP435930BenMacroRail [aria-current='step']")?.textContent?.trim()??"",
  }));
  assert.equal(benPrayer.left,"ao-live-response","Benediction versicle/collect lost its congregational response cue");
  assert.equal(benPrayer.right,"ao-live-response","Benediction stage rail no longer follows the response moment");
  assert.match(benPrayer.macro,/Benediction|Bénédiction/,"Benediction public-rite macro did not track the visible Continue path");
  await page.locator("#aoPray435930 [data-p435930-ben-next]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset==="ao-live-blessing",null,{timeout:3000});
  assert.equal(await page.locator("#aoPray435930 .aoP435930SemanticRail.left").count(),0,"Benediction blessing retained an unrelated left cue");
  await shot("03g-pray-benediction-blessing");
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Confession remains private/read-only; only the exact in-confessional moment
  // owns the transient Sign-of-Cross rail cue.
  await page.locator("#aoPray435930 [data-p435930-own='pray.confession']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="confession",null,{timeout:5000});
  for(let i=0;i<3;i++)await page.locator("#aoPray435930 [data-p435930-conf-next]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset==="ao-live-sign-cross",null,{timeout:3000});
  const confessionRail=await page.evaluate(()=>({
    left:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    right:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    stage:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right small")?.textContent?.trim()??"",
  }));
  assert.equal(confessionRail.left,"ao-live-sign-cross","Confession in-confessional stage lost the donor Sign-of-Cross cue");
  assert.equal(confessionRail.right,"ao-rich-confession","Confession lost its persistent sacramental identity rail");
  assert.match(confessionRail.stage,/In Confessional|Au confessionnal/,"Confession rail lost the active stage");
  await shot("03h-pray-confession-in-confessional");
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Exact v3.4.14 Rosary donor presentation over the preserved canonical engine.
  await page.locator("#aoPray435930 [data-p435930-own='pray.rosary']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="rosary",null,{timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-launch-rosary]").click();
  await page.waitForSelector("#aoPrayerBookRoot.open",{state:"visible",timeout:10000});
  await page.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-today]",{state:"visible",timeout:10000});
  const standard=page.locator("#aoPrayerBookRoot [data-v38-rosary-form='standard']");
  if(await standard.count())await standard.click();
  await page.locator("#aoPrayerBookRoot [data-lab-rosary-today]").click();
  await page.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-next]",{state:"visible",timeout:5000});
  await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot .aoRosaryRitualGrid"),null,{timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot .rosary-decade-bar-v15[data-ao-exact-donor-progress='v3.4.14']",{state:"visible",timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot .r29-head-recitation[data-ao-exact-donor-recitation='v3.4.14']",{state:"visible",timeout:5000});
  const rosaryOpening=await page.evaluate(()=>{
    const roots=[...document.querySelectorAll("#aoPrayerBookRoot")],active=roots.find(root=>root.dataset.aoRosaryActiveRoot==="true")||roots.find(root=>root.classList.contains("open"));
    const shell=active?.querySelector(".pbShell"),head=shell?.querySelector(".lab-view-head"),recitation=shell?.querySelector(".r29-head-recitation"),overview=shell?.querySelector("[data-r23-overview-open]");
    const legacyRecitation=[...(shell?.querySelectorAll(".lab-recitation-mode,[data-ao-recitation]")??[])].filter(node=>getComputedStyle(node).display!=="none").length;
    const headRect=head?.getBoundingClientRect?.(),recRect=recitation?.getBoundingClientRect?.(),overviewRect=overview?.getBoundingClientRect?.();
    const recitationButtonWidths=[...(recitation?.querySelectorAll("button")??[])].map(button=>button.getBoundingClientRect().width);
    return {
      donor:shell?.dataset?.aoRosaryExactDonor??null,
      progressSegments:shell?.querySelectorAll(".rosary-decade-bar-v15[data-ao-exact-donor-progress] i").length??0,
      currentSegments:shell?.querySelectorAll(".rosary-decade-bar-v15[data-ao-exact-donor-progress] i.current").length??0,
      recitationButtons:shell?.querySelectorAll(".r29-head-recitation[data-ao-exact-donor-recitation] button").length??0,
      activeRecitation:shell?.querySelectorAll(".r29-head-recitation[data-ao-exact-donor-recitation] button.active").length??0,
      ritualGrid:shell?.classList.contains("aoRosaryRitualGrid")?1:0,
      nestedRitualGrid:shell?.querySelectorAll(":scope > section.aoRosaryRitualGrid").length??0,
      activeRoots:roots.filter(root=>root.dataset.aoRosaryActiveRoot==="true"&&root.classList.contains("open")).length,
      legacyRecitation,
      shellWidth:shell?.getBoundingClientRect?.().width??0,
      headOverflow:(head?.scrollWidth??0)-(head?.clientWidth??0),
      recitationButtonWidths,
      recitationRight:recRect?.right??0,
      overviewRight:overviewRect?.right??0,
      headRight:headRect?.right??0,
    };
  });
  assert.equal(rosaryOpening.donor,"v3.4.14","Rosary player is not stamped with the exact donor presentation owner");
  assert.equal(rosaryOpening.progressSegments,5,"Rosary lost the donor five-segment mystery progress bar");
  assert.equal(rosaryOpening.currentSegments,0,"Rosary opening incorrectly marks a mystery current");
  assert.equal(rosaryOpening.recitationButtons,2,"Rosary lost donor Individual/Group head controls");
  assert.equal(rosaryOpening.activeRecitation,1,"Rosary donor recitation control has no single active owner");
  assert.equal(rosaryOpening.ritualGrid,1,"Rosary lost the donor ritual reader ownership marker");
  assert.equal(rosaryOpening.nestedRitualGrid,0,"Rosary reintroduced the DOM-reparenting ritual wrapper");
  assert.equal(rosaryOpening.activeRoots,1,"More than one PrayerBook root owns visible Rosary input");
  assert.equal(rosaryOpening.legacyRecitation,0,"Rosary exposes a second legacy Individual/Group selector");
  assert.ok(rosaryOpening.shellWidth>=360,"Rosary exact donor presentation collapsed phone reading width");
  assert.ok(rosaryOpening.headOverflow<=1,"Rosary phone header still overflows horizontally");
  assert.ok(rosaryOpening.recitationButtonWidths.length===2&&rosaryOpening.recitationButtonWidths.every(width=>width>=52),"Rosary Individual / Group controls are visibly truncated");
  assert.ok(rosaryOpening.recitationRight<=rosaryOpening.headRight+1,"Rosary recitation control clips outside the phone header");
  assert.ok(rosaryOpening.overviewRight<=rosaryOpening.headRight+1,"Rosary Overview control clips outside the phone header");

  // Prove the real Next button and the actual prayer column, not just selector presence.
  const ourFatherTarget=await page.evaluate(()=>{
    const xs=globalThis.AO_ROSARY_V381?.steps?.()||[];
    return xs.findIndex(step=>/pater|our father|lord.?s prayer/i.test(JSON.stringify(step)));
  });
  assert.ok(ourFatherTarget>=0,"Canonical Rosary steps expose no Our Father target");
  let currentRosaryStep=await page.evaluate(()=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1));
  for(let guard=0;currentRosaryStep<ourFatherTarget&&guard<32;guard+=1){
    const before=currentRosaryStep;
    await page.locator("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] [data-lab-rosary-next]").click();
    await page.waitForFunction(previous=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1)>previous,before,{timeout:2000});
    currentRosaryStep=await page.evaluate(()=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1));
    assert.equal(currentRosaryStep,before+1,"Visible Rosary Next skipped or failed to advance exactly one canonical step");
  }
  assert.equal(currentRosaryStep,ourFatherTarget,"Visible Rosary Next did not reach the canonical Our Father step");
  const rosaryPrayerGeometry=await page.evaluate(()=>{
    const active=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true']");
    const candidates=[...(active?.querySelectorAll(".lab-prayer-sheet,.pbFlowCard")??[])];
    const card=candidates.find(node=>node.offsetParent!==null&&/Our Father|Pater noster/i.test(node.innerText??""))||candidates.find(node=>node.offsetParent!==null)||null;
    const rect=card?.getBoundingClientRect?.();
    return {
      width:rect?.width??0,height:rect?.height??0,
      scrollWidth:card?.scrollWidth??0,clientWidth:card?.clientWidth??0,
      text:(card?.innerText??"").replace(/\s+/g," ").trim(),
    };
  });
  assert.ok(rosaryPrayerGeometry.width>=330,"Rosary prayer column collapsed horizontally");
  assert.ok(rosaryPrayerGeometry.height>0&&rosaryPrayerGeometry.height<720,"Rosary Our Father card exploded vertically from word-by-word wrapping");
  assert.ok(rosaryPrayerGeometry.scrollWidth-rosaryPrayerGeometry.clientWidth<=1,"Rosary prayer card has horizontal overflow");
  assert.match(rosaryPrayerGeometry.text,/Our Father/i,"Visible Rosary Next did not advance to the Our Father");

  // Use the exact donor's visible Overview → Mystery I jump rather than forcing
  // the preserved engine through intermediate opening states.
  await page.locator("#aoPrayerBookRoot [data-r23-overview-open]").click();
  await page.waitForSelector("#aoPrayerBookRoot #r23-overview-sheet.open",{state:"visible",timeout:2000});
  const overview=await page.evaluate(()=>({
    rows:document.querySelectorAll("#aoPrayerBookRoot #r23-overview-sheet .r23-overview-row").length,
    opening:document.querySelectorAll("#aoPrayerBookRoot #r23-overview-sheet .r23-overview-section[data-r23-overview-jump='0']").length,
    close:document.querySelectorAll("#aoPrayerBookRoot #r23-overview-sheet [data-r23-overview-close]").length,
  }));
  assert.equal(overview.rows,5,"Rosary donor overview lost its five mystery rows");
  assert.equal(overview.opening,1,"Rosary donor overview lost Opening prayers");
  assert.equal(overview.close,1,"Rosary donor overview lost its close control");
  await page.locator("#aoPrayerBookRoot #r23-overview-sheet .r23-overview-row[data-r23-overview-mystery='1']").click();
  await page.waitForFunction(()=>{
    const api=globalThis.AO_ROSARY_V381,state=api?.state?.(),steps=api?.steps?.()||[];
    return steps[state?.step]?.kind==="mystery"&&Number(steps[state?.step]?.mi)===0;
  },null,{timeout:5000});
  await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot .rosary-decade-bar-v15 i.current")?.dataset?.mystery==="1",null,{timeout:5000});
  await page.waitForSelector("#ao-cinema-transition.aoCinemaTransitionOn",{state:"visible",timeout:2000});
  const rosaryMysteryFx=await page.evaluate(()=>({
    currentMystery:document.querySelector("#aoPrayerBookRoot .rosary-decade-bar-v15 i.current")?.dataset?.mystery??null,
    artBackdrop:document.querySelector("#aoPrayerBookRoot .aoRosaryRitualCenter")?.classList?.contains("r24-has-mystery-art")??false,
    artValue:document.querySelector("#aoPrayerBookRoot .aoRosaryRitualCenter")?.style?.getPropertyValue("--r24-mystery-art")??"",
    contemplation:document.querySelectorAll("#aoPrayerBookRoot .lab-contemplation,#aoPrayerBookRoot .r23-contemplation").length,
    cinematicTitle:document.querySelector("#ao-cinema-transition [data-ao-cinema-transition-title]")?.textContent?.trim()??"",
    cinematicKicker:document.querySelector("#ao-cinema-transition [data-ao-cinema-transition-kicker]")?.textContent?.trim()??"",
    reduced:globalThis.AO_CINEMATIC_V4312?.isReducedMotion?.()??null,
  }));
  assert.equal(rosaryMysteryFx.currentMystery,"1","Rosary donor progress did not advance to Mystery I");
  assert.equal(rosaryMysteryFx.artBackdrop,true,"Rosary Mystery I lost the donor sacred-art backdrop");
  assert.ok(rosaryMysteryFx.artValue.includes("url("),"Rosary mystery backdrop has no resolved artwork");
  assert.ok(rosaryMysteryFx.contemplation>=1,"Rosary Mystery I lost the donor contemplation sheet");
  assert.ok(rosaryMysteryFx.cinematicTitle.length>0,"Rosary mystery cinematic has no title");
  assert.match(rosaryMysteryFx.cinematicKicker,/HOLY ROSARY|SAINT ROSAIRE/,"Rosary mystery cinematic lost devotional identity");
  assert.equal(rosaryMysteryFx.reduced,false,"visual acceptance unexpectedly entered reduced-motion mode");
  await shot("03c-pray-rosary-mystery-cinematic");
  await waitForFxSettled();
  await shot("03d-pray-rosary-live-rail");

  const rosaryStepBeforeBack=await page.evaluate(()=>globalThis.AOTraditionalPrayerBook?.getState?.()?.rosaryStep??null);
  await page.locator("#aoPrayerBookRoot.open .lab-back,#aoPrayerBookRoot .lab-back").first().click();
  await page.waitForFunction(()=>[...document.querySelectorAll("#aoPrayerBookRoot")].every(root=>!root.classList.contains("open")),null,{timeout:5000});
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:5000});
  const rosaryReturn=await page.evaluate(()=>({
    rosaryStep:globalThis.AOTraditionalPrayerBook?.getState?.()?.rosaryStep??null,
    modularView:document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView??null,
  }));
  assert.equal(rosaryReturn.rosaryStep,rosaryStepBeforeBack,"Rosary visible Back advanced the preserved engine instead of returning");
  assert.equal(rosaryReturn.modularView,"rosary","Rosary visible Back did not restore the modular Rosary chooser");

  await page.evaluate(()=>globalThis.AO_PRAY_V435930?.open?.("pray.library",{returnContext:null}));
  await page.waitForSelector("#aoPray435930.open [data-p435930-lib-open='sacrament_act_of_contrition']",{timeout:10000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-lib-open]").count(),48,"PRAY Library no longer exposes the locked 48-prayer corpus");
  await page.locator("#aoPray435930 [data-p435930-lib-open='sacrament_act_of_contrition']").click();
  await page.waitForSelector("#aoPray435930 .aoP435930Prayer",{timeout:5000});
  await page.waitForFunction(()=>globalThis.AO_PRAY_COHERENCE_V435930?.audit?.().readerContract==="fluid-v1",null,{timeout:5000});
  await page.waitForFunction(()=>document.querySelectorAll("#aoPray435930 [data-ao-pray-focus='active']").length===1,null,{timeout:5000});
  const prayReader=await page.evaluate(()=>{
    const audit=globalThis.AO_PRAY_COHERENCE_V435930?.audit?.()??{};
    const flip=document.querySelector("#aoPray435930 .aoP435930Flip");
    const vern=flip?.querySelector("[data-face-v]");
    const latin=flip?.querySelector("[data-face-la]");
    return {
      ...audit,
      recitationButtons:document.querySelectorAll("#aoPray435930 [data-p435930-global-recitation]").length,
      prayerTitle:document.querySelector("#aoPray435930 .aoP435930Prayer h3")?.textContent?.trim()??"",
      latinHidden:latin?.hidden??null,
      vernHidden:vern?.hidden??null,
      activeFocus:document.querySelectorAll("#aoPray435930 [data-ao-pray-focus='active']").length,
      legacyOpen:document.getElementById("aoPrayerBookRoot")?.classList?.contains("open")??false,
    };
  });
  assert.equal(prayReader.recitationControls,1,"PRAY reader lost its single recitation-mode control");
  assert.equal(prayReader.recitationButtons,2,"PRAY reader lost Individual/Group recitation choices");
  assert.equal(prayReader.translationPairs,1,"PRAY library prayer lost its Latin/vernacular pair");
  assert.equal(prayReader.stackedTranslationPairs,0,"PRAY stacked Latin and vernacular instead of one-language-at-a-time presentation");
  assert.ok(prayReader.fluidUnits>0,"PRAY reader lost fluid focus units");
  assert.equal(prayReader.readerContract,"fluid-v1");
  assert.equal(prayReader.activeFocus,1,"PRAY fluid reader does not expose exactly one active focus unit");
  assert.ok(prayReader.prayerTitle.length>0,"PRAY prayer title is blank");
  assert.notEqual(prayReader.latinHidden,prayReader.vernHidden,"PRAY translation pair does not expose exactly one visible language");
  assert.equal(prayReader.legacyOpen,false,"legacy Prayer Book reopened inside prayer reading");
  await shot("03b-pray-library-prayer");

  await page.locator("[data-ao-app-surface='learn']").click();
  await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
  await waitForFxSettled();
  await assertHomeHidden("Learn");
  const learnParity=await page.evaluate(()=>({
    heroTitles:document.querySelectorAll("#ao-learn-modular-root .aoLearnModHero h1").length,
    heroTitle:document.querySelector("#ao-learn-modular-root .aoLearnModHero h1")?.textContent?.trim()??"",
    intro:document.querySelector("#ao-learn-modular-root .aoLearnModHero p")?.textContent?.trim()??"",
    context:document.querySelector("#ao-learn-modular-root .aoLearnModContext")?.textContent?.trim()??"",
    sectionTitles:[...document.querySelectorAll("#ao-learn-modular-root .aoLearnModSectionHead h2")].map(x=>x.textContent?.trim()??""),
    modules:[...document.querySelectorAll("#ao-learn-modular-root [data-ao-learn-module]")].map(x=>x.dataset.aoLearnModule),
    featured:[...document.querySelectorAll("#ao-learn-modular-root .aoLearnModCard.featured [data-ao-learn-module]")].map(x=>x.dataset.aoLearnModule),
    donorNav:document.querySelectorAll("#ao-learn-modular-root [data-v37-domain],#ao-learn-modular-root [data-v37-open],#ao-learn-modular-root .aoV37DomainDock").length,
    sourcesUtility:document.querySelectorAll("#ao-learn-modular-root [data-ao-learn-module='utility.sources']").length,
    calendarDashboard:document.querySelectorAll("#ao-learn-modular-root .aoCalYearWheel").length,
    overflow:(()=>{const x=document.getElementById("ao-learn-modular-root");return x?x.scrollWidth-x.clientWidth:Infinity})(),
    cards:[...document.querySelectorAll("#ao-learn-modular-root .aoLearnModCard")].map(x=>{const r=x.getBoundingClientRect();return {w:r.width,h:r.height}}),
  }));
  assert.equal(learnParity.heroTitles,1,"Learn lost its single formation identity");
  assert.equal(learnParity.heroTitle,"Learn","Learn hero no longer preserves the locked donor title");
  assert.ok(learnParity.intro.length>20,"Learn formation introduction is blank or collapsed");
  assert.ok(learnParity.context.length>0,"Learn lost its selected-day context line");
  assert.deepEqual(learnParity.sectionTitles,["Daily formation","Courses & study","Today in context"],"Learn section hierarchy diverged from locked v43.59.30");
  assert.deepEqual(learnParity.modules,["learn.catechism.daily","learn.mass","learn.catechism","today.gospel","today.saint"],"Learn launcher order diverged from locked v43.59.30");
  assert.deepEqual(learnParity.featured,["learn.catechism.daily","learn.mass"],"Learn featured-card hierarchy diverged from locked v43.59.30");
  assert.equal(learnParity.donorNav,0,"historical V37 navigation leaked into modular Learn");
  assert.equal(learnParity.sourcesUtility,0,"Sources incorrectly resurfaced as a Learn launcher");
  assert.equal(learnParity.calendarDashboard,0,"Calendar dashboard duplicated inside Learn");
  assert.ok(learnParity.overflow<=1,"Learn has horizontal overflow on 390px phone geometry");
  assert.equal(learnParity.cards.length,5,"Learn lost one of its five locked launchers");
  for(const card of learnParity.cards){assert.ok(card.w>300,"Learn card collapsed below phone-readable width");assert.ok(card.h>=90,"Learn card collapsed below approved touch/readability height");}
  const catechismIcon=page.locator("#ao-learn-modular-root [data-ao-learn-card='learn.catechism'] .aoLearnModIcon[data-ao-asset-id='ao-module-catechism']");
  assert.equal(await catechismIcon.count(),1,"Traditional Catechism is missing its canonical icon");
  assert.equal(await catechismIcon.getAttribute("data-ao-asset-renderer"),"mask","Traditional Catechism did not use the canonical file-backed mask renderer");
  const catechismMask=await catechismIcon.evaluate(el=>getComputedStyle(el).webkitMaskImage||getComputedStyle(el).maskImage||"");
  assert.match(catechismMask,/ao-module-catechism\.png/,"Traditional Catechism canonical mask did not resolve to the frozen PNG");
  const learnFx=await page.evaluate(()=>({
    hero:document.querySelector("#ao-learn-modular-root .aoLearnModHero")?.dataset?.aoPresentationFxHero??null,
    rootScan:document.getElementById("ao-learn-modular-root")?.dataset?.aoPresentationFxArtScan??null,
  }));
  assert.match(learnFx.hero,/modular-presentation-fx-v3/,"Learn formation hero did not receive recovered entry choreography");
  assert.equal(learnFx.rootScan,"legacy-v4312","Learn modular root bypassed the approved v43.12 art loader");
  await shot("04-learn");

  await page.locator("[data-ao-app-surface='settings']").click();
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  await waitForFxSettled();
  await assertHomeHidden("Settings");
  assert.equal(await page.locator("#ao-settings-modular-root [data-settings-close]").count(),1,"Settings main has duplicate exit controls");
  const settingsParity=await page.evaluate(()=>({
    owner:document.getElementById("ao-settings-modular-root")?.dataset?.aoSettingsOwner??null,
    presentation:document.getElementById("ao-settings-modular-root")?.dataset?.aoSettingsPresentationOwner??null,
    headings:[...document.querySelectorAll("#ao-settings-modular-root .aoSetModSection > h2")].map(x=>x.textContent?.trim()??""),
    sourcesLaunchers:document.querySelectorAll("#ao-settings-modular-root [data-settings-sources]").length,
    structuralControls:document.querySelectorAll("#ao-settings-modular-root [data-setting-structural='true']").length,
    historicalVisible:globalThis.AO_SETTINGS_APP_V1?.status?.().historicalSettingsVisible??null,
    embeddedHomeSettings:globalThis.AO_SETTINGS_APP_V1?.status?.().embeddedHomeSettingsVisible??null,
    overflow:(()=>{const x=document.getElementById("ao-settings-modular-root");return x?x.scrollWidth-x.clientWidth:Infinity})(),
    topLevelSources:document.querySelectorAll("[data-ao-app-surface='sources']").length,
  }));
  assert.equal(settingsParity.owner,"AO_SETTINGS_APP_V1");
  assert.equal(settingsParity.presentation,"modular-settings-presentation-v1");
  assert.deepEqual(settingsParity.headings,["Language","Mass","Display & accessibility","Local practice","Advanced"],"Settings preference hierarchy diverged from approved modular Settings");
  assert.equal(settingsParity.sourcesLaunchers,1,"Settings must expose exactly one Sources & About destination");
  assert.ok(settingsParity.structuralControls>=6,"Settings lost structural Mass controls");
  assert.equal(settingsParity.historicalVisible,false,"historical Settings donor is visible beneath modular Settings");
  assert.equal(settingsParity.embeddedHomeSettings,false,"retired Home Settings surface is visible beneath modular Settings");
  assert.ok(settingsParity.overflow<=1,"Settings has horizontal overflow on 390px phone geometry");
  assert.equal(settingsParity.topLevelSources,0,"Sources resurfaced as a seventh top-level destination");
  await shot("05-settings");

  await page.locator("#ao-settings-modular-root [data-settings-sources]").click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="about-sources",null,{timeout:5000});
  const settingsAbout=await page.evaluate(()=>({
    sourceGroups:document.querySelectorAll("#ao-settings-modular-root .aoSetModSource").length,
    provenanceRows:document.querySelectorAll("#ao-settings-modular-root .aoSetModKey p").length,
    aboutRows:document.querySelectorAll("#ao-settings-modular-root .aoSetModAbout > div").length,
    version:document.querySelector("#ao-settings-modular-root [data-settings-app-version]")?.textContent?.trim()??"",
    canonical:globalThis.AO_RELEASE_AUTHORITY_V4359?.version||document.documentElement.dataset.aoRelease||"",
    privacy:/sins are not recorded/i.test(document.getElementById("ao-settings-modular-root")?.innerText??""),
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
  }));
  assert.equal(settingsAbout.sourceGroups,8,"Sources & About lost a source family");
  assert.equal(settingsAbout.provenanceRows,6,"Sources & About lost provenance labels");
  assert.ok(settingsAbout.aboutRows>=3,"Settings About section is incomplete");
  assert.equal(settingsAbout.version,String(settingsAbout.canonical),"Settings About does not show canonical application version");
  assert.equal(settingsAbout.privacy,true,"Settings privacy statement no longer states that sins are not recorded");
  assert.equal(settingsAbout.active,"settings","Sources & About escaped Settings into another top-level surface");
  await page.screenshot({path:resolve(out,"05b-settings-sources.png"),fullPage:false});

  const report=await page.evaluate(()=>({
    shell:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
    release:document.documentElement.dataset.aoRelease??null,
    releaseAuthority:document.documentElement.dataset.aoReleaseAuthority??null,
    appOwner:document.documentElement.dataset.aoAppShellOwner??null,
  }));
  // Wide-browser regression: the product remains an app-width reader rather than a desktop web page.
  const wideContext=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1,hasTouch:false,locale:"en-GB"});
  const wide=await wideContext.newPage();
  await wide.goto("http://127.0.0.1:4186/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await wide.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true&&globalThis.AO_PRAY_APP_V1?.status?.().installed===true,null,{timeout:30000});
  await wide.locator("[data-ao-app-surface='pray']").click();
  await wide.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
  const wideHub=await wide.evaluate(()=>{
    const sheet=document.querySelector("#aoPray435930 .aoP435930Sheet"),body=document.querySelector("#aoPray435930 .aoP435930Body"),grid=document.querySelector("#aoPray435930 .aoP435930ModuleGrid");
    return {sheet:sheet?.getBoundingClientRect().width??0,body:body?.getBoundingClientRect().width??0,columns:grid?getComputedStyle(grid).gridTemplateColumns:""};
  });
  assert.ok(wideHub.sheet<=522,"PRAY expanded into a desktop-width web page");
  assert.ok(wideHub.body<=482,"PRAY reading column exceeded the app-native measure");
  assert.ok(!/\s/.test(wideHub.columns.trim()),"PRAY wide viewport restored the two-column dashboard hub");

  await wide.locator("#aoPray435930 [data-p435930-own='pray.rosary']").click();
  await wide.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="rosary",null,{timeout:5000});
  await wide.locator("#aoPray435930 [data-p435930-launch-rosary]").click();
  await wide.waitForSelector("#aoPrayerBookRoot.open",{state:"visible",timeout:10000});
  await wide.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-today]",{state:"visible",timeout:10000});
  const wideStandard=wide.locator("#aoPrayerBookRoot [data-v38-rosary-form='standard']");
  if(await wideStandard.count())await wideStandard.click();
  await wide.locator("#aoPrayerBookRoot [data-lab-rosary-today]").click();
  await wide.waitForSelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] [data-lab-rosary-next]",{state:"visible",timeout:5000});
  const wideOurFatherTarget=await wide.evaluate(()=>{
    const xs=globalThis.AO_ROSARY_V381?.steps?.()||[];
    return xs.findIndex(step=>/pater|our father|lord.?s prayer/i.test(JSON.stringify(step)));
  });
  assert.ok(wideOurFatherTarget>=0,"Wide canonical Rosary exposes no Our Father target");
  let wideStep=await wide.evaluate(()=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1));
  for(let guard=0;wideStep<wideOurFatherTarget&&guard<32;guard+=1){
    const before=wideStep;
    await wide.locator("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] [data-lab-rosary-next]").click();
    await wide.waitForFunction(previous=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1)>previous,before,{timeout:2000});
    wideStep=await wide.evaluate(()=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1));
    assert.equal(wideStep,before+1,"Wide Rosary Next skipped or failed to advance exactly one canonical step");
  }
  assert.equal(wideStep,wideOurFatherTarget,"Wide Rosary Next did not reach the canonical Our Father");
  const wideRosary=await wide.evaluate(()=>{
    const root=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true']"),shell=root?.querySelector(".pbShell");
    const candidates=[...(root?.querySelectorAll(".lab-prayer-sheet,.pbFlowCard")??[])];
    const card=candidates.find(node=>node.offsetParent!==null&&/Our Father|Pater noster/i.test(node.innerText??""))||candidates.find(node=>node.offsetParent!==null)||null,r=card?.getBoundingClientRect();
    const visibleLegacy=[...(shell?.querySelectorAll(".lab-recitation-mode,[data-ao-recitation]")??[])].filter(node=>getComputedStyle(node).display!=="none").length;
    return {shell:shell?.getBoundingClientRect().width??0,cardWidth:r?.width??0,cardHeight:r?.height??0,visibleLegacy,nested:shell?.querySelectorAll(":scope > section.aoRosaryRitualGrid").length??0};
  });
  assert.ok(wideRosary.shell<=522,"Rosary expanded beyond the bounded app reader on wide viewport");
  assert.ok(wideRosary.cardWidth>=360,"Rosary wide viewport collapsed the actual prayer column");
  assert.ok(wideRosary.cardHeight>0&&wideRosary.cardHeight<720,"Rosary wide Our Father reproduced the vertical word-stack regression");
  assert.equal(wideRosary.visibleLegacy,0,"Rosary wide viewport exposes duplicate recitation controls");
  assert.equal(wideRosary.nested,0,"Rosary wide viewport reparents donor DOM into a nested ritual grid");
  await wide.screenshot({path:resolve(out,"03e-pray-wide-regression.png"),fullPage:false});
  await wideContext.close();

  await writeFile(resolve(out,"report.json"),JSON.stringify({report,errors},null,2));
  assert.deepEqual(errors,[],"page errors during visual acceptance: "+JSON.stringify(errors));
  console.log("visual acceptance capture: PASS",JSON.stringify({errors,report},null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
