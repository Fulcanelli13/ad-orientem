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
    displayedDate:document.querySelector(".homeScreen .dateTitle b")?.textContent?.trim()??"",
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
  assert.match(homeParity.displayedDate,/^\d{2}\/\d{2}\/\d{4}$/,"Home date is not DD/MM/YYYY");
  const designBaseline=await page.evaluate(()=>({
    version:document.documentElement.dataset.aoDesignSystem??null,
    stylePresent:Boolean(document.getElementById("ao-app-design-system")),
    displayFont:getComputedStyle(document.querySelector(".homeScreen .celebrationBlock > h1")).fontFamily,
    bodyFont:getComputedStyle(document.querySelector(".homeScreen")).fontFamily,
    cardRadius:getComputedStyle(document.querySelector(".homeScreen .contentCard")).borderRadius,
    gutter:getComputedStyle(document.documentElement).getPropertyValue("--ao-page-gutter").trim(),
    controlHeight:getComputedStyle(document.documentElement).getPropertyValue("--ao-control-h").trim(),
  }));
  assert.equal(designBaseline.version,"ao-design-system-v2","shared app design system is not installed");
  assert.equal(designBaseline.stylePresent,true,"shared app design-system stylesheet is missing");
  assert.ok(designBaseline.displayFont.length>0,"Home display font did not resolve");
  assert.ok(designBaseline.bodyFont.length>0,"Home body font did not resolve");
  assert.equal(designBaseline.cardRadius,"15px","Home content cards diverged from the canonical card radius");
  assert.equal(designBaseline.gutter,"12px","390px phone did not resolve the canonical phone gutter");
  assert.equal(designBaseline.controlHeight,"44px","canonical touch-control height drifted");
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
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-input]").count(),0,"Day view should not expose the date-picker input");
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-native]").count(),0);
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalYearWheel").count(),0,"obsolete decorative year wheel leaked into the Day view");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Tabs").count(),1,"Calendar v2 three-surface navigation is missing");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Tabs [data-cal-view]").count(),3,"Calendar top navigation must be Day · Month · Liturgical Year");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Tabs [data-cal-view='index']").count(),0,"redundant Year Index returned to top-level Calendar navigation");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Hero").count(),1,"Calendar Day lost its single selected-feast hero");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Saint [data-cal-saint-date]").count(),1,"Calendar Day did not surface the principal saint/feast reference");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Week [data-cal-date]").count(),7,"Calendar Day lost its seven-day context strip");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Week [aria-current='date']").count(),1,"Calendar selected date is not uniquely identified");
  const calendarDay=await page.evaluate(()=>({
    version:globalThis.AO_CALENDAR_APP_V1?.status?.().version??null,
    identity:document.querySelector("#ao-calendar-modular-root .aoCalV2Hero h2")?.textContent?.trim()??"",
    season:document.querySelector("#ao-calendar-modular-root .aoCalV2Context h3")?.textContent?.trim()??"",
    progress:document.querySelector("#ao-calendar-modular-root .aoCalV2Progress i")?.style?.width??"",
    weekScrollable:(()=>{const x=document.querySelector("#ao-calendar-modular-root .aoCalV2Week");return x?x.scrollWidth>=x.clientWidth:false})(),
    rootScrollTop:document.getElementById("ao-calendar-modular-root")?.scrollTop??Infinity,
    displayedDate:document.querySelector("#ao-calendar-modular-root .aoCalV2DayNav strong")?.textContent?.trim()??"",
  }));
  assert.equal(calendarDay.version,"modular-calendar-v2-liturgical-year","Calendar did not activate the v2 owner");
  assert.ok(calendarDay.identity.length>0,"Calendar selected feast identity is blank");
  assert.ok(calendarDay.season.length>0,"Calendar selected liturgical period is blank");
  assert.match(calendarDay.progress,/\d+(?:\.\d+)?%/,"Calendar period progress is missing");
  assert.equal(calendarDay.weekScrollable,true,"Calendar week context does not remain touch-scrollable on phone");
  assert.match(calendarDay.displayedDate,/^\d{2}\/\d{2}\/\d{4}$/,"Calendar Day date is not DD/MM/YYYY");
  const calendarDesign=await page.evaluate(()=>({
    displayFont:getComputedStyle(document.querySelector("#ao-calendar-modular-root .aoCalV2Hero h2")).fontFamily,
    bodyFont:getComputedStyle(document.getElementById("ao-calendar-modular-root")).fontFamily,
    gutter:getComputedStyle(document.querySelector("#ao-calendar-modular-root .aoCalModBody")).paddingLeft,
    cardRadius:getComputedStyle(document.querySelector("#ao-calendar-modular-root .aoCalV2NextMajor")).borderRadius,
    topControl:(()=>{const x=document.querySelector("#ao-calendar-modular-root .aoCalModTop button");const s=getComputedStyle(x);return {w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height,r:s.borderRadius}})(),
  }));
  assert.equal(calendarDesign.displayFont,designBaseline.displayFont,"Calendar display typography diverged from Home");
  assert.equal(calendarDesign.bodyFont,designBaseline.bodyFont,"Calendar body typography diverged from Home");
  assert.equal(calendarDesign.gutter,designBaseline.gutter,"Calendar phone gutter diverged from the app grid");
  assert.equal(calendarDesign.cardRadius,designBaseline.cardRadius,"Calendar card geometry diverged from the app system");
  assert.equal(Math.round(calendarDesign.topControl.w),44,"Calendar top control width diverged");
  assert.equal(Math.round(calendarDesign.topControl.h),44,"Calendar top control height diverged");
  assert.equal(calendarDesign.topControl.r,"999px","Calendar top control lost canonical circular geometry");
  assert.ok(calendarDay.rootScrollTop<=2,"Calendar Day auto-scrolled vertically while centering the selected date");
  const calendarFx=await page.evaluate(()=>({
    hero:document.querySelector("#ao-calendar-modular-root .aoCalV2Hero")?.dataset?.aoPresentationFxHero??null,
    rootScan:document.getElementById("ao-calendar-modular-root")?.dataset?.aoPresentationFxArtScan??null,
  }));
  assert.match(calendarFx.hero,/modular-presentation-fx-v3/,"Calendar v2 Day hero did not receive recovered entry choreography");
  assert.equal(calendarFx.rootScan,"legacy-v4312","Calendar modular root bypassed the approved v43.12 art loader");
  await shot("02-calendar-day");

  await page.locator("#ao-calendar-modular-root .aoCalV2Saint [data-cal-saint-date]").click();
  await page.waitForFunction(()=>globalThis.AO_NAV_V25?.getState?.()?.panel==="saint",null,{timeout:5000});
  assert.equal(await page.locator("#ao-v25-panel").count(),1,"Calendar Day saint/feast reference did not open the shared detail panel");
  await page.evaluate(()=>globalThis.AO_NAV_V25?.closePanel?.());
  await page.waitForFunction(()=>globalThis.AO_NAV_V25?.getState?.()?.panel!=="saint",null,{timeout:5000});

  await page.locator("#ao-calendar-modular-root .aoCalV2Tabs [data-cal-view='year']").click();
  await page.waitForSelector("#ao-calendar-modular-root .aoCalV2Ring",{state:"visible",timeout:3000});
  const calendarYear=await page.evaluate(()=>({
    ringWidth:document.querySelector("#ao-calendar-modular-root .aoCalV2Ring")?.getBoundingClientRect?.().width??0,
    ringValue:document.querySelector("#ao-calendar-modular-root .aoCalV2RingCore strong")?.textContent?.trim()??"",
    periods:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2Timeline [data-cal-date]").length,
    journeyCards:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2JourneyRail [data-cal-date]").length,
    currentJourney:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2JourneyRail .current").length,
    comingCards:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2ComingGrid [data-cal-date]").length,
    rootScrollTop:document.getElementById("ao-calendar-modular-root")?.scrollTop??Infinity,
    headingTop:document.querySelector("#ao-calendar-modular-root .aoCalV2YearHeading")?.getBoundingClientRect?.().top??-1,
    tabsBottom:document.querySelector("#ao-calendar-modular-root .aoCalV2Tabs")?.getBoundingClientRect?.().bottom??Infinity,
  }));
  assert.ok(calendarYear.ringWidth>=220,"Calendar liturgical-year ring collapsed below phone-readable size");
  assert.match(calendarYear.ringValue,/\d+(?:\.\d+)?%/,"Calendar year ring lost its computed percentage");
  assert.equal(calendarYear.periods,9,"Calendar proportional year timeline lost one or more liturgical periods");
  assert.equal(calendarYear.journeyCards,9,"Calendar year journey lost one or more liturgical periods");
  assert.equal(calendarYear.currentJourney,1,"Calendar year journey does not uniquely identify the current period");
  assert.ok(calendarYear.comingCards>=1,"Calendar year lost its Coming Next intelligence");
  assert.ok(calendarYear.rootScrollTop<=2,"Calendar view switch retained the previous surface scroll position");
  assert.ok(calendarYear.headingTop>=calendarYear.tabsBottom-1,"Calendar Liturgical Year heading is hidden beneath sticky navigation");
  await shot("02b-calendar-year");

  await page.locator("#ao-calendar-modular-root .aoCalV2Tabs [data-cal-view='picker']").click();
  await page.waitForSelector("#ao-calendar-modular-root .aoCalV2MonthGrid",{state:"visible",timeout:3000});
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-input]").count(),1,"Calendar Liturgical Month lost direct date entry");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2MonthGrid [data-cal-pick-date]").count(),42,"Calendar Liturgical Month lost its six-week grid");
  await page.waitForFunction(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().monthReady===true,null,{timeout:30000});
  const calendarMonth=await page.evaluate(()=>{
    const root=document.getElementById("ao-calendar-modular-root"),grid=document.querySelector(".aoCalV2MonthGrid"),last=grid?.querySelector?.("[data-cal-pick-date]:nth-child(7)");
    return {
      rootOverflow:(root?.scrollWidth??Infinity)-(root?.clientWidth??0),
      gridOverflow:(grid?.scrollWidth??Infinity)-(grid?.clientWidth??0),
      lastRight:last?.getBoundingClientRect?.().right??Infinity,
      rootRight:root?.getBoundingClientRect?.().right??0,
      rootScrollTop:root?.scrollTop??Infinity,
      cells:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid [data-cal-pick-date]").length,
      markers:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid [data-cal-liturgical-marker]").length,
      cached:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid [data-ready='1']").length,
      sundays:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid .sunday").length,
      named:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid .major").length,
      selected:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid .selected").length,
      ranked:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid [data-rank-tier='1'],#ao-calendar-modular-root .aoCalV2MonthGrid [data-rank-tier='2'],#ao-calendar-modular-root .aoCalV2MonthGrid [data-rank-tier='3']").length,
      readyState:grid?.dataset?.monthReady??null,
      apiCached:globalThis.AO_CALENDAR_APP_V1?.status?.().monthCachedDays??0,
    };
  });
  assert.equal(calendarMonth.cells,42,"Calendar Liturgical Month changed its 42-cell geometry");
  assert.equal(calendarMonth.markers,42,"Calendar Liturgical Month lost semantic colour/rank markers");
  assert.equal(calendarMonth.cached,42,"Calendar Liturgical Month did not finish its bounded 42-day preload");
  assert.equal(calendarMonth.apiCached,42,"Calendar month cache status does not match the visible grid");
  assert.equal(calendarMonth.readyState,"true","Calendar Liturgical Month did not expose a ready state after preload");
  assert.ok(calendarMonth.sundays>=6,"Calendar Liturgical Month lost Sunday distinction");
  assert.ok(calendarMonth.named>=6,"Calendar Liturgical Month is not surfacing major observances selectively");
  assert.ok(calendarMonth.ranked>=6,"Calendar Liturgical Month lost rank salience");
  assert.equal(calendarMonth.selected,1,"Calendar Liturgical Month does not uniquely identify the selected date");
  assert.ok(calendarMonth.rootOverflow<=1,"Calendar Liturgical Month causes horizontal root overflow");
  assert.ok(calendarMonth.gridOverflow<=1,"Calendar Liturgical Month grid overflows horizontally");
  assert.ok(calendarMonth.lastRight<=calendarMonth.rootRight+1,"Calendar Liturgical Month Saturday column is clipped off-screen");
  assert.ok(calendarMonth.rootScrollTop<=2,"Calendar Liturgical Month opened below the top of its surface");
  await shot("02d-calendar-month");

  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalMonthTabs [data-cal-month-view]").count(),5,"Month lost Calendar · Major · Temporale · Sanctorale · Practices navigation");

  await page.locator("#ao-calendar-modular-root .aoCalMonthTabs [data-cal-month-view='major']").click();
  await page.waitForSelector("#ao-calendar-modular-root [data-cal-month-index='major']",{state:"visible",timeout:3000});
  const majorMonthCount=await page.locator("#ao-calendar-modular-root [data-cal-month-index='major'] [data-cal-month-index-date]").count();
  assert.ok(majorMonthCount>=4,"Month Major index is unexpectedly sparse");
  assert.ok(await page.locator("#ao-calendar-modular-root [data-cal-month-index='major']").getByText(/Christ the King|Christ-Roi/).count()>=1,"Month Major index lost Christ the King");
  await shot("02e-calendar-month-major");

  await page.locator("#ao-calendar-modular-root .aoCalMonthTabs [data-cal-month-view='temporale']").click();
  await page.waitForSelector("#ao-calendar-modular-root [data-cal-month-index='temporale']",{state:"visible",timeout:3000});
  const temporaleCount=await page.locator("#ao-calendar-modular-root [data-cal-month-index='temporale'] [data-cal-month-index-date]").count();
  assert.ok(temporaleCount>=4,"Month Temporale index is missing resolved temporal observances");
  assert.ok(await page.locator("#ao-calendar-modular-root [data-cal-month-index='temporale']").getByText(/Christ the King|Christ-Roi/).count()>=1,"Month Temporale classification lost Christ the King");
  await shot("02f-calendar-month-temporale");

  await page.locator("#ao-calendar-modular-root .aoCalMonthTabs [data-cal-month-view='sanctorale']").click();
  await page.waitForSelector("#ao-calendar-modular-root [data-cal-month-index='sanctorale']",{state:"visible",timeout:3000});
  const sanctoraleCount=await page.locator("#ao-calendar-modular-root [data-cal-month-index='sanctorale'] [data-cal-month-index-date]").count();
  assert.ok(sanctoraleCount>=4,"Month Sanctorale index is missing resolved sanctoral observances");
  assert.ok(await page.locator("#ao-calendar-modular-root [data-cal-month-index='sanctorale']").getByText(/Rosary|Rosaire/).count()>=1,"Month Sanctorale classification lost Our Lady of the Rosary");
  assert.ok(await page.locator("#ao-calendar-modular-root [data-cal-month-index='sanctorale'] [data-cal-saint-date]").count()>=4,"Month Sanctorale is not wired to the shared saint-detail entry point");
  await shot("02g-calendar-month-sanctorale");

  await page.locator("#ao-calendar-modular-root .aoCalMonthTabs [data-cal-month-view='practices']").click();
  await page.waitForSelector("#ao-calendar-modular-root [data-cal-month-index='practices']",{state:"visible",timeout:3000});
  const practicesText=await page.locator("#ao-calendar-modular-root [data-cal-month-index='practices']").innerText();
  assert.match(practicesText,/First Friday|Premier vendredi/,"Month Practices lost First Friday");
  assert.match(practicesText,/Month of the Holy Rosary|Mois du Saint Rosaire/,"Month Practices lost October Rosary");
  assert.match(practicesText,/Kingship of Christ|Royauté du Christ/,"Month Practices lost Christ the King");
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-month-index='practices'] [data-cal-month-index-date]").count()>=3,true,"Month Practices exposes too few date-bound rows");
  await shot("02g2-calendar-month-practices");

  const legacyIndexRedirect=await page.evaluate(()=>{globalThis.AO_CALENDAR_APP_V1?.setView?.("index");return globalThis.AO_CALENDAR_APP_V1?.status?.()});
  assert.equal(legacyIndexRedirect.view,"picker","legacy Calendar index route did not redirect to Month");
  assert.equal(legacyIndexRedirect.monthView,"major","legacy Calendar index route did not redirect specifically to Month/Major");

  // Calendar Intelligence: concurrent practices belong to Day, not to a second year dashboard.
  const calendarPracticeDate=await page.evaluate(async()=>{
    await globalThis.AO_CALENDAR_APP_V1?.select?.("2026-10-25");
    globalThis.AO_CALENDAR_APP_V1?.setView?.("day");
    return globalThis.AO_CALENDAR_APP_V1?.status?.();
  });
  assert.equal(calendarPracticeDate.selectedDate,"2026-10-25","Calendar could not select Christ the King for practice context");
  await page.waitForSelector("#ao-calendar-modular-root .aoCalPracticeContext",{state:"visible",timeout:5000});
  const earlyPracticeText=await page.locator("#ao-calendar-modular-root .aoCalPracticeContext").innerText();
  assert.match(earlyPracticeText,/Kingship of Christ/,"Calendar Day practice context lost Christ the King");
  assert.match(earlyPracticeText,/Month of the Holy Rosary/,"Calendar Day practice context lost the concurrent October Rosary observance");
  assert.ok(await page.locator("#ao-calendar-modular-root .aoCalPracticeCard").count()>=2,"Christ the King date lost concurrent date-bound practice cards");
  assert.match(earlyPracticeText,/Novena for the Holy Souls|Neuvaine pour les Saintes Âmes/,"Calendar Day did not project the active Holy Souls novena alongside the feast and October devotion");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV384Companion").count(),0,"retired duplicate Traditional Liturgical Year companion returned");
  await shot("02h-calendar-day-practices");

  await page.evaluate(async()=>{await globalThis.AO_CALENDAR_APP_V1?.select?.("2026-10-09");globalThis.AO_CALENDAR_APP_V1?.setView?.("day")});
  await page.waitForSelector("#ao-calendar-modular-root .aoCalPracticeDiscipline",{state:"visible",timeout:5000});
  await page.locator("#ao-calendar-modular-root .aoCalPracticeDiscipline > summary").click();
  const earlyDisciplineText=await page.locator("#ao-calendar-modular-root .aoCalPracticeDiscipline").innerText();
  assert.match(earlyDisciplineText,/At least one hour before Holy Communion/);
  assert.match(earlyDisciplineText,/three hours from solid food and alcoholic drink/);
  assert.match(earlyDisciplineText,/SOURCE-SENSITIVE/);
  assert.equal(await page.locator("#ao-calendar-modular-root [data-ao-cal-v384-era]").count(),0,"retired duplicate discipline-era dashboard returned");
  await shot("02i-calendar-day-discipline");

  await page.evaluate(async()=>{await globalThis.AO_CALENDAR_APP_V1?.select?.("2026-10-07");globalThis.AO_CALENDAR_APP_V1?.setView?.("day")});
  await page.waitForFunction(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().selectedDate==="2026-10-07",null,{timeout:10000});

  await page.locator("[data-ao-app-surface='pray']").click();
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
  await waitForFxSettled();
  await assertHomeHidden("PRAY");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-back]").count(),1,"PRAY root lost its Home return control");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-close]").count(),1,"PRAY root lost the donor Close exit");
  const prayHub=await page.evaluate(()=>({
    owner:document.getElementById("aoPray435930")?.dataset?.aoPrayOwner??null,
    cards:document.querySelectorAll("#aoPray435930 .aoP435930ModuleCard").length,
    legacyOpen:document.getElementById("aoPrayerBookRoot")?.classList?.contains("open")??false,
  }));
  assert.equal(prayHub.owner,"modular-pray-v1");
  assert.ok(prayHub.cards>=10,"PRAY hub lost its locked devotional module hierarchy");
  assert.equal(prayHub.legacyOpen,false,"legacy Prayer Book is visible beneath modular PRAY");
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930HomeIntro")?.dataset?.aoPresentationFxHero,null,{timeout:3000});
  const prayFx=await page.evaluate(()=>({
    hero:document.querySelector("#aoPray435930 .aoP435930HomeIntro")?.dataset?.aoPresentationFxHero??null,
    rootScan:document.getElementById("aoPray435930")?.dataset?.aoPresentationFxArtScan??null,
  }));
  assert.match(prayFx.hero,/modular-presentation-fx-v3/,"PRAY home hero did not receive recovered entry choreography");
  assert.equal(prayFx.rootScan,"legacy-v4312","PRAY modular root bypassed the approved v43.12 art loader");
  const prayDesign=await page.evaluate(()=>({
    displayFont:getComputedStyle(document.querySelector("#aoPray435930 .aoP435930HomeIntro h2")).fontFamily,
    gutter:getComputedStyle(document.querySelector("#aoPray435930 .aoP435930Body")).paddingLeft,
    cardRadius:getComputedStyle(document.querySelector("#aoPray435930 .aoP435930ModuleCard")).borderRadius,
    topControl:(()=>{const x=document.querySelector("#aoPray435930 .aoP435930Head button");const s=getComputedStyle(x);return {w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height,r:s.borderRadius}})(),
  }));
  assert.equal(prayDesign.displayFont,designBaseline.displayFont,"PRAY display typography diverged from the app system");
  assert.equal(prayDesign.gutter,designBaseline.gutter,"PRAY phone gutter diverged from the app grid");
  assert.equal(prayDesign.cardRadius,designBaseline.cardRadius,"PRAY module cards diverged from canonical geometry");
  assert.equal(Math.round(prayDesign.topControl.w),44,"PRAY top control width diverged");
  assert.equal(Math.round(prayDesign.topControl.h),44,"PRAY top control height diverged");
  assert.equal(prayDesign.topControl.r,"999px","PRAY top control lost canonical circular geometry");
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
      postureAsset:icon?.dataset?.aoAssetId??null,
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
  const adorationLanding=await page.evaluate(()=>({
    modes:[...document.querySelectorAll("#aoPray435930 [data-p435930-ador-mode]")].map(x=>x.getAttribute("data-p435930-ador-mode")),
    titles:[...document.querySelectorAll("#aoPray435930 [data-p435930-ador-mode] b")].map(x=>x.textContent?.trim()??""),
    benedictionCard:document.querySelectorAll("#aoPray435930 [data-p435930-go-ben]").length,
  }));
  assert.deepEqual(adorationLanding.modes,["visit","open","holy","four","treasury"],"Adoration landing no longer matches the final five-entry donor composition");
  assert.deepEqual(adorationLanding.titles,["Visit to the Blessed Sacrament","Adoration","Holy Hour","Four Ends","Eucharistic Treasury"],"Adoration landing titles regressed");
  assert.equal(adorationLanding.benedictionCard,0,"Benediction incorrectly replaced a private Adoration entry on the landing page");
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
  // Measure the stable rail geometry after the transient cue-enter scale animation.
  await page.waitForTimeout(500);
  const benBlessing=await page.evaluate(async()=>{
    const icon=document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset='ao-live-blessing'] .aoP435930SemanticRailIcon");
    const cs=icon?getComputedStyle(icon):null;
    const mask=cs?.webkitMaskImage||cs?.maskImage||"";
    const match=mask.match(/url\(["']?([^"')]+)["']?\)/);
    const url=match?.[1]??"";
    let status=0,bytes=0;
    if(url){try{const response=await fetch(url);status=response.status;bytes=(await response.arrayBuffer()).byteLength}catch{}}
    const rect=icon?.getBoundingClientRect?.();
    return {mask,url,status,bytes,width:rect?.width??0,height:rect?.height??0};
  });
  assert.match(benBlessing.mask,/assets\/recovered\/ao-live-blessing\.svg/,"Benediction blessing did not resolve through the recovered frozen-V4 silhouette");
  assert.equal(benBlessing.status,200,"Benediction blessing runtime asset does not load");
  assert.ok(benBlessing.bytes>1000,"Benediction blessing runtime asset is unexpectedly empty");
  assert.ok(benBlessing.width>=30&&benBlessing.height>=30,"Benediction blessing icon collapsed below visible rail geometry");
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

  // Rosary opens directly into the preserved canonical engine: no intermediate
  // configuration page, no second launcher, and no ritual-grid width collapse.
  await page.locator("#aoPray435930 [data-p435930-own='pray.rosary']").click();
  await page.waitForFunction(()=>!document.getElementById("aoPray435930")?.classList?.contains("open"),null,{timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot.open",{state:"visible",timeout:10000});
  await page.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-today]",{state:"visible",timeout:10000});
  const standard=page.locator("#aoPrayerBookRoot [data-v38-rosary-form='standard']");
  if(await standard.count())await standard.click();
  await page.locator("#aoPrayerBookRoot [data-lab-rosary-today]").click();
  await page.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-next]",{state:"visible",timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot .lab-decade-bar",{state:"visible",timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot .r29-head-recitation[data-ao-exact-donor-recitation='v3.4.14']",{state:"visible",timeout:5000});
  const rosaryOpening=await page.evaluate(()=>{
    const roots=[...document.querySelectorAll("#aoPrayerBookRoot")],active=roots.find(root=>root.dataset.aoRosaryActiveRoot==="true")||roots.find(root=>root.classList.contains("open"));
    const shell=active?.querySelector(".pbShell"),head=shell?.querySelector(".lab-view-head"),recitation=shell?.querySelector(".r29-head-recitation");
    const visible=node=>{
      if(!node)return false;
      const style=getComputedStyle(node),rect=node.getBoundingClientRect();
      return !node.hidden&&style.display!=="none"&&style.visibility!=="hidden"&&Number(style.opacity)!==0&&rect.width>0&&rect.height>0;
    };
    const legacyRecitation=[...(shell?.querySelectorAll(".lab-recitation-mode,[data-ao-recitation]")??[])].filter(visible).length;
    const redundantButtons=[...(shell?.querySelectorAll("button")??[])].filter(node=>visible(node)&&/^(guide|preferences|préférences|overview|aperçu)$/i.test((node.textContent||"").replace(/\s+/g," ").trim())).length;
    const headRect=head?.getBoundingClientRect?.(),recRect=recitation?.getBoundingClientRect?.();
    const recitationButtonWidths=[...(recitation?.querySelectorAll("button")??[])].map(button=>button.getBoundingClientRect().width);
    return {
      donor:shell?.dataset?.aoRosaryExactDonor??null,
      layout:shell?.dataset?.aoRosaryLayout??null,
      progressSegments:shell?.querySelectorAll(".lab-decade-bar i").length??0,
      currentSegments:shell?.querySelectorAll(".lab-decade-bar i.current").length??0,
      injectedProgress:shell?.querySelectorAll(".rosary-decade-bar-v15[data-ao-exact-donor-progress]").length??0,
      recitationButtons:shell?.querySelectorAll(".r29-head-recitation[data-ao-exact-donor-recitation] button").length??0,
      activeRecitation:shell?.querySelectorAll(".r29-head-recitation[data-ao-exact-donor-recitation] button.active").length??0,
      depthBars:shell?.querySelectorAll(".aoP435930RosaryBar").length??0,
      depthButtons:shell?.querySelectorAll(".aoP435930RosaryBar [data-p435930-rosary-depth]").length??0,
      ritualGrid:shell?.classList.contains("aoRosaryRitualGrid")?1:0,
      nestedRitualGrid:shell?.querySelectorAll(":scope > section.aoRosaryRitualGrid").length??0,
      activeRoots:roots.filter(root=>root.dataset.aoRosaryActiveRoot==="true"&&root.classList.contains("open")).length,
      legacyRecitation,
      redundantButtons,
      overview:shell?.querySelectorAll("[data-r23-overview-open],#r23-overview-sheet").length??0,
      visibleHome:[...(shell?.querySelectorAll(".lab-view-head .aoModuleHome")??[])].filter(visible).length,
      visibleLanguageBadge:[...(shell?.querySelectorAll(".lab-view-head .lab-lang")??[])].filter(visible).length,
      shellWidth:shell?.getBoundingClientRect?.().width??0,
      headOverflow:(head?.scrollWidth??0)-(head?.clientWidth??0),
      recitationButtonWidths,
      recitationRight:recRect?.right??0,
      headRight:headRect?.right??0,
    };
  });
  assert.equal(rosaryOpening.donor,"v3.4.14","Rosary player is not stamped with the exact donor presentation owner");
  assert.equal(rosaryOpening.layout,"single-column","Rosary prayer shell is not explicitly single-column");
  assert.equal(rosaryOpening.progressSegments,5,"Rosary lost the donor five-segment mystery progress bar");
  assert.equal(rosaryOpening.currentSegments,0,"Rosary opening incorrectly marks a mystery current");
  assert.equal(rosaryOpening.injectedProgress,0,"Rosary exposes a second injected five-segment mystery-progress bar");
  assert.equal(rosaryOpening.recitationButtons,2,"Rosary lost its single Individual/Group head control");
  assert.equal(rosaryOpening.activeRecitation,1,"Rosary recitation control has no single active owner");
  assert.equal(rosaryOpening.depthBars,1,"Rosary exposes more than one Simple/Guided surface");
  assert.equal(rosaryOpening.depthButtons,2,"Rosary depth control does not contain exactly Simple and Guided");
  assert.equal(rosaryOpening.ritualGrid,0,"Rosary shell regressed to the two-column ritual grid that collapses prayer text");
  assert.equal(rosaryOpening.nestedRitualGrid,0,"Rosary reintroduced the DOM-reparenting ritual wrapper");
  assert.equal(rosaryOpening.activeRoots,1,"More than one PrayerBook root owns visible Rosary input");
  assert.equal(rosaryOpening.legacyRecitation,0,"Rosary exposes a second legacy Individual/Group selector");
  assert.equal(rosaryOpening.redundantButtons,0,"Rosary exposes redundant Guide / Preferences / Overview controls");
  assert.equal(rosaryOpening.overview,0,"Rosary Overview was reintroduced as permanent reader chrome");
  assert.equal(rosaryOpening.visibleHome,0,"Rosary header exposes a redundant Home control beside Back");
  assert.equal(rosaryOpening.visibleLanguageBadge,0,"Rosary header exposes a redundant app-language badge");
  assert.ok(rosaryOpening.shellWidth>=360,"Rosary exact donor presentation collapsed phone reading width");
  assert.ok(rosaryOpening.headOverflow<=1,"Rosary phone header still overflows horizontally");
  assert.ok(rosaryOpening.recitationButtonWidths.length===2&&rosaryOpening.recitationButtonWidths.every(width=>width>=52),"Rosary Individual / Group controls are visibly truncated");
  assert.ok(rosaryOpening.recitationRight<=rosaryOpening.headRight+1,"Rosary recitation control clips outside the phone header");

  // Reproduce the user-visible failure mode explicitly: Group recitation. The late
  // preserved donor had to collapse common-prayer leader/response grids to full-width
  // blocks or the anonymous prayer text falls into the 1.55rem role column.
  await page.locator("#aoPrayerBookRoot .r29-head-recitation [data-p435930-recitation='group']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot .r29-head-recitation [data-p435930-recitation='group']")?.getAttribute("aria-pressed")==="true",null,{timeout:2000});

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
    const flip=card?.querySelector?.(".lab-prayer-flip[data-pb-flip]"),latin=flip?.querySelector?.("[data-pb-latin]"),vern=flip?.querySelector?.("[data-pb-vern]");
    return {
      width:rect?.width??0,height:rect?.height??0,
      scrollWidth:card?.scrollWidth??0,clientWidth:card?.clientWidth??0,
      text:(card?.innerText??"").replace(/\s+/g," ").trim(),
      latinHidden:latin?.hidden??null,
      vernHidden:vern?.hidden??null,
      latinVisible:Boolean(latin&&getComputedStyle(latin).display!=="none"&&getComputedStyle(latin).visibility!=="hidden"&&latin.getClientRects().length),
      vernVisible:Boolean(vern&&getComputedStyle(vern).display!=="none"&&getComputedStyle(vern).visibility!=="hidden"&&vern.getClientRects().length),
      face:flip?.dataset?.face??null,
      groupRoot:(active?.classList?.contains("aoRecitationGroup")||document.documentElement.classList.contains("aoRecitationGroup"))??false,
      innerBlocks:[...(flip?.querySelectorAll(".aoPrayerProse,.aoCustomarySplit,.aoCustomaryLeader,.aoCustomaryResponse,.aoPrayerDialogueLine,.aoPrayerDialogueBody,.aoPrayerWords")??[])]
        .filter(node=>node.getClientRects().length&&getComputedStyle(node).display!=="none")
        .map(node=>{
          const css=getComputedStyle(node),rect=node.getBoundingClientRect(),lineHeight=parseFloat(css.lineHeight)||0;
          const text=(node.textContent||"").replace(/\s+/g," ").trim();
          return {className:node.className||"",textLength:text.length,wordCount:text?text.split(/\s+/).length:0,width:rect.width,height:rect.height,lineCount:lineHeight?Math.ceil(rect.height/lineHeight):0,display:css.display,grid:css.gridTemplateColumns,writingMode:css.writingMode};
        }),
    };
  });
  assert.ok(rosaryPrayerGeometry.width>=330,"Rosary prayer column collapsed horizontally");
  assert.ok(rosaryPrayerGeometry.height>0&&rosaryPrayerGeometry.height<720,"Rosary Our Father card exploded vertically from word-by-word wrapping");
  assert.ok(rosaryPrayerGeometry.scrollWidth-rosaryPrayerGeometry.clientWidth<=1,"Rosary prayer card has horizontal overflow");
  assert.match(rosaryPrayerGeometry.text,/Our Father/i,"Visible Rosary Next did not advance to the Our Father");
  assert.equal(rosaryPrayerGeometry.face,"vernacular","Rosary prayer text does not default to vernacular");
  assert.equal(rosaryPrayerGeometry.latinHidden,true,"Rosary Latin face is not marked hidden");
  assert.equal(rosaryPrayerGeometry.vernHidden,false,"Rosary vernacular face is marked hidden by default");
  assert.equal(rosaryPrayerGeometry.latinVisible,false,"Rosary visually renders Latin simultaneously with the vernacular");
  assert.equal(rosaryPrayerGeometry.vernVisible,true,"Rosary vernacular face is not actually visible");
  assert.equal(rosaryPrayerGeometry.groupRoot,true,"Rosary visual acceptance did not reproduce Group recitation");
  assert.ok(rosaryPrayerGeometry.innerBlocks.length>0,"Rosary Our Father exposes no semantic prayer-text blocks");
  for(const block of rosaryPrayerGeometry.innerBlocks){
    assert.match(block.writingMode,/horizontal/i,"Rosary inner prayer block is not horizontal: "+JSON.stringify(block));
    if(block.textLength>=40){
      assert.ok(block.width>=rosaryPrayerGeometry.width*.62,"Rosary Group long prayer text collapsed into a narrow semantic column: "+JSON.stringify(block));
      assert.ok(!block.lineCount||block.lineCount<=18,"Rosary Group long prayer text reverted to word-by-word vertical stacking: "+JSON.stringify(block));
    }
  }
  for(const block of rosaryPrayerGeometry.innerBlocks.filter(x=>/aoCustomaryLeader|aoCustomaryResponse/.test(x.className))){
    assert.equal(block.display,"block","Rosary Group common-prayer owner regressed to grid: "+JSON.stringify(block));
  }
  for(const block of rosaryPrayerGeometry.innerBlocks.filter(x=>/aoPrayerDialogueLine/.test(x.className))){
    assert.ok(block.width>=rosaryPrayerGeometry.width*.72,"Rosary Group dialogue owner collapsed before its prose: "+JSON.stringify(block));
  }

  // Translation is a real tap-to-replace interaction in the preserved Rosary engine,
  // not merely a hidden second face. Tap once for Latin, then tap again to return.
  const rosaryFlip=page.locator("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-sheet:visible .lab-prayer-flip[data-pb-flip]").first();
  assert.equal(await rosaryFlip.count(),1,"Visible Rosary Our Father exposes no translation surface");
  await rosaryFlip.tap();
  await page.waitForFunction(()=>{
    const flip=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-sheet .lab-prayer-flip[data-pb-flip]");
    return flip?.dataset?.face==="latin"&&!flip.querySelector("[data-pb-latin]")?.hidden&&flip.querySelector("[data-pb-vern]")?.hidden;
  },null,{timeout:2000});
  const rosaryLatin=await page.evaluate(()=>{
    const root=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true']");
    const card=[...(root?.querySelectorAll(".lab-prayer-sheet,.pbFlowCard")??[])].find(node=>node.offsetParent!==null&&/Pater noster|Our Father/i.test(node.innerText??""))||null;
    const flip=card?.querySelector(".lab-prayer-flip[data-pb-flip]"),latin=flip?.querySelector("[data-pb-latin]"),vern=flip?.querySelector("[data-pb-vern]");
    const cardRect=card?.getBoundingClientRect?.(),flipRect=flip?.getBoundingClientRect?.(),css=flip?getComputedStyle(flip):null;
    return {
      face:flip?.dataset?.face??null,
      latinHidden:latin?.hidden??null,
      vernHidden:vern?.hidden??null,
      latinVisible:Boolean(latin&&getComputedStyle(latin).display!=="none"&&latin.getClientRects().length),
      vernVisible:Boolean(vern&&getComputedStyle(vern).display!=="none"&&vern.getClientRects().length),
      text:(card?.innerText??"").replace(/\s+/g," ").trim(),
      cardWidth:cardRect?.width??0,
      flipWidth:flipRect?.width??0,
      cardHeight:cardRect?.height??0,
      writingMode:css?.writingMode??"",
      innerBlocks:[...(flip?.querySelectorAll(".aoPrayerProse,.aoCustomarySplit,.aoCustomaryLeader,.aoCustomaryResponse,.aoPrayerDialogueLine,.aoPrayerDialogueBody,.aoPrayerWords")??[])]
        .filter(node=>node.getClientRects().length&&getComputedStyle(node).display!=="none")
        .map(node=>{
          const cs=getComputedStyle(node),r=node.getBoundingClientRect(),lineHeight=parseFloat(cs.lineHeight)||0;
          const text=(node.textContent||"").replace(/\s+/g," ").trim();
          return {className:node.className||"",textLength:text.length,width:r.width,height:r.height,lineCount:lineHeight?Math.ceil(r.height/lineHeight):0,writingMode:cs.writingMode};
        }),
    };
  });
  assert.equal(rosaryLatin.face,"latin","Rosary tap did not switch the active face to Latin");
  assert.equal(rosaryLatin.latinHidden,false,"Rosary Latin face remains hidden after tap");
  assert.equal(rosaryLatin.vernHidden,true,"Rosary vernacular face remains visible after Latin tap");
  assert.equal(rosaryLatin.latinVisible,true,"Rosary Latin face is not actually visible after tap");
  assert.equal(rosaryLatin.vernVisible,false,"Rosary renders both language faces after tap");
  assert.match(rosaryLatin.text,/Pater noster/i,"Rosary Latin replacement did not render the Our Father");
  assert.ok(rosaryLatin.cardWidth>=330&&rosaryLatin.flipWidth>=300,"Rosary translation tap collapsed the prayer column horizontally");
  assert.ok(rosaryLatin.cardHeight>0&&rosaryLatin.cardHeight<720,"Rosary Latin face reproduced the vertical word-stack regression");
  assert.match(rosaryLatin.writingMode,/horizontal/i,"Rosary prayer flip is not horizontally written after translation");
  for(const block of rosaryLatin.innerBlocks){
    assert.match(block.writingMode,/horizontal/i,"Rosary Latin inner prayer block is not horizontal: "+JSON.stringify(block));
    if(block.textLength>=40){
      assert.ok(block.width>=rosaryLatin.flipWidth*.62,"Rosary Latin long prayer text collapsed into a narrow semantic column: "+JSON.stringify(block));
      assert.ok(!block.lineCount||block.lineCount<=18,"Rosary Latin long prayer text reverted to word-by-word vertical stacking: "+JSON.stringify(block));
    }
  }
  await shot("03d3-pray-rosary-latin-toggle");

  await rosaryFlip.tap();
  await page.waitForFunction(()=>{
    const flip=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-sheet .lab-prayer-flip[data-pb-flip]");
    return flip?.dataset?.face==="vernacular"&&flip.querySelector("[data-pb-latin]")?.hidden&&!flip.querySelector("[data-pb-vern]")?.hidden;
  },null,{timeout:2000});
  const rosaryReturned=await page.evaluate(()=>{
    const flip=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-sheet .lab-prayer-flip[data-pb-flip]");
    return {face:flip?.dataset?.face??null,text:(flip?.innerText??"").replace(/\s+/g," ").trim()};
  });
  assert.equal(rosaryReturned.face,"vernacular","Second Rosary tap did not return to the vernacular");
  assert.match(rosaryReturned.text,/Our Father/i,"Second Rosary tap did not restore the vernacular prayer");

  // Exercise a second common prayer with different donor markup. This catches the
  // Hail Mary path that previously remained narrow even when the Our Father looked fixed.
  // Do not infer prayer identity from AO_ROSARY_V381.steps() serialization: the
  // preserved donor may represent common prayers by opaque IDs. Exercise the
  // user-visible Next path and stop only when the rendered prayer is Hail Mary.
  let hailMaryReached=false;
  for(let guard=0;guard<12&&!hailMaryReached;guard+=1){
    hailMaryReached=await page.evaluate(()=>{
      const root=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true']");
      const card=[...(root?.querySelectorAll(".lab-prayer-sheet,.pbFlowCard")??[])]
        .find(node=>node.offsetParent!==null)||null;
      return /Hail Mary|Ave Maria/i.test(card?.innerText??"");
    });
    if(hailMaryReached)break;
    const before=currentRosaryStep;
    await page.locator("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] [data-lab-rosary-next]").click();
    await page.waitForFunction(previous=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1)>previous,before,{timeout:2000});
    currentRosaryStep=await page.evaluate(()=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1));
  }
  assert.equal(hailMaryReached,true,"Visible Rosary Next did not reach a rendered Hail Mary");
  const hailGeometry=await page.evaluate(()=>{
    const root=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true']");
    const card=[...(root?.querySelectorAll(".lab-prayer-sheet,.pbFlowCard")??[])].find(node=>node.offsetParent!==null&&/Hail Mary|Ave Maria/i.test(node.innerText??""))||null;
    const flip=card?.querySelector(".lab-prayer-flip[data-pb-flip]"),rect=card?.getBoundingClientRect?.();
    const blocks=[...(flip?.querySelectorAll(".aoPrayerProse,.aoCustomarySplit,.aoCustomaryLeader,.aoCustomaryResponse,.aoPrayerDialogueLine,.aoPrayerDialogueBody,.aoPrayerWords")??[])]
      .filter(node=>node.getClientRects().length&&getComputedStyle(node).display!=="none")
      .map(node=>{const css=getComputedStyle(node),r=node.getBoundingClientRect(),lh=parseFloat(css.lineHeight)||0,text=(node.textContent||"").replace(/\s+/g," ").trim();return{className:node.className||"",textLength:text.length,width:r.width,lineCount:lh?Math.ceil(r.height/lh):0,writingMode:css.writingMode}});
    return {width:rect?.width??0,height:rect?.height??0,face:flip?.dataset?.face??null,text:(card?.innerText??"").replace(/\s+/g," ").trim(),blocks};
  });
  assert.equal(hailGeometry.face,"vernacular","Hail Mary did not inherit the vernacular default");
  assert.match(hailGeometry.text,/Hail Mary/i,"Hail Mary vernacular face is not visible");
  assert.ok(hailGeometry.width>=330&&hailGeometry.height>0&&hailGeometry.height<720,"Hail Mary card reproduced the narrow vertical regression");
  for(const block of hailGeometry.blocks){
    assert.match(block.writingMode,/horizontal/i,"Hail Mary inner block is not horizontal: "+JSON.stringify(block));
    if(block.textLength>=40){
      assert.ok(block.width>=hailGeometry.width*.62,"Hail Mary long prayer text collapsed into a narrow semantic column: "+JSON.stringify(block));
      assert.ok(!block.lineCount||block.lineCount<=18,"Hail Mary long prayer text reverted to word-by-word vertical stacking: "+JSON.stringify(block));
    }
  }
  const hailFlip=page.locator("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-sheet:visible .lab-prayer-flip[data-pb-flip]").first();
  await hailFlip.tap();
  await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-sheet .lab-prayer-flip[data-pb-flip]")?.dataset?.face==="latin",null,{timeout:2000});
  const hailLatin=await page.evaluate(()=>{
    const flip=document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-sheet .lab-prayer-flip[data-pb-flip]");
    const r=flip?.getBoundingClientRect?.();
    const blocks=[...(flip?.querySelectorAll(".aoPrayerProse,.aoCustomarySplit,.aoCustomaryLeader,.aoCustomaryResponse,.aoPrayerDialogueLine,.aoPrayerDialogueBody,.aoPrayerWords")??[])]
      .filter(node=>node.getClientRects().length&&getComputedStyle(node).display!=="none")
      .map(node=>{const css=getComputedStyle(node),b=node.getBoundingClientRect(),lh=parseFloat(css.lineHeight)||0,text=(node.textContent||"").replace(/\s+/g," ").trim();return{className:node.className||"",textLength:text.length,width:b.width,lineCount:lh?Math.ceil(b.height/lh):0,writingMode:css.writingMode}});
    return {width:r?.width??0,text:(flip?.innerText??"").replace(/\s+/g," ").trim(),blocks};
  });
  assert.match(hailLatin.text,/Ave Maria/i,"Hail Mary Latin replacement did not render");
  for(const block of hailLatin.blocks){
    assert.match(block.writingMode,/horizontal/i,"Hail Mary Latin inner block is not horizontal: "+JSON.stringify(block));
    if(block.textLength>=40){
      assert.ok(block.width>=hailLatin.width*.62,"Hail Mary Latin long prayer text collapsed into a narrow semantic column: "+JSON.stringify(block));
      assert.ok(!block.lineCount||block.lineCount<=18,"Hail Mary Latin text reverted to word-by-word vertical stacking: "+JSON.stringify(block));
    }
  }
  await hailFlip.tap();
  await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-sheet .lab-prayer-flip[data-pb-flip]")?.dataset?.face==="vernacular",null,{timeout:2000});

  // Advance through the actual prayer sequence to Mystery I. The permanent
  // Overview control was removed because it duplicated navigation and crowded the header.
  let mysteryReached=await page.evaluate(()=>{
    const api=globalThis.AO_ROSARY_V381,state=api?.state?.(),steps=api?.steps?.()||[];
    return steps[state?.step]?.kind==="mystery"&&Number(steps[state?.step]?.mi)===0;
  });
  for(let guard=0;!mysteryReached&&guard<32;guard+=1){
    const before=await page.evaluate(()=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1));
    await page.locator("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] [data-lab-rosary-next]").click();
    await page.waitForFunction(previous=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1)>previous,before,{timeout:2000});
    mysteryReached=await page.evaluate(()=>{
      const api=globalThis.AO_ROSARY_V381,state=api?.state?.(),steps=api?.steps?.()||[];
      return steps[state?.step]?.kind==="mystery"&&Number(steps[state?.step]?.mi)===0;
    });
  }
  assert.equal(mysteryReached,true,"Visible Rosary Next did not reach Mystery I");
  await page.waitForFunction(()=>{
    const bar=document.querySelector("#aoPrayerBookRoot .lab-decade-bar"),cur=bar?.querySelector("i.current");
    return cur&&Array.from(bar.children).indexOf(cur)===0;
  },null,{timeout:5000});
  await page.waitForSelector("#ao-cinema-transition.aoCinemaTransitionOn",{state:"visible",timeout:2000});
  const rosaryMysteryFx=await page.evaluate(()=>({
    currentMystery:(()=>{
      const bar=document.querySelector("#aoPrayerBookRoot .lab-decade-bar"),cur=bar?.querySelector("i.current");
      return cur?String(Array.from(bar.children).indexOf(cur)+1):null;
    })(),
    artBackdrop:document.querySelector("#aoPrayerBookRoot .aoRosaryRitualCenter")?.classList?.contains("r24-has-mystery-art")??false,
    artValue:document.querySelector("#aoPrayerBookRoot .aoRosaryRitualCenter")?.style?.getPropertyValue("--r24-mystery-art")??"",
    contemplation:document.querySelectorAll("#aoPrayerBookRoot .lab-contemplation,#aoPrayerBookRoot .r23-contemplation").length,
    headerTitle:document.querySelector("#aoPrayerBookRoot .lab-view-head h1")?.textContent?.trim()??"",
    contemplationTitle:document.querySelector("#aoPrayerBookRoot .lab-contemplation h2,#aoPrayerBookRoot .r23-contemplation h2")?.textContent?.trim()??"",
    artTitleVisible:(()=>{
      const x=document.querySelector("#aoPrayerBookRoot .aoV401RosaryHero figcaption span:first-child,#aoPrayerBookRoot .aoRosaryArtHero figcaption span:first-child");
      return Boolean(x&&getComputedStyle(x).display!=="none"&&x.getClientRects().length);
    })(),
    mysteryKickerVisible:(()=>{
      const x=document.querySelector("#aoPrayerBookRoot .lab-contemplation .kicker,#aoPrayerBookRoot .r23-contemplation .kicker");
      return Boolean(x&&getComputedStyle(x).display!=="none"&&x.getClientRects().length);
    })(),
    mysteryBeadsVisible:(()=>{
      const x=document.querySelector("#aoPrayerBookRoot .lab-bead-stage");
      return Boolean(x&&getComputedStyle(x).display!=="none"&&x.getClientRects().length);
    })(),
    helperTextVisible:[...document.querySelectorAll("#aoPrayerBookRoot .lab-option-bar .lab-step-count")].some(x=>getComputedStyle(x).display!=="none"&&x.getClientRects().length>0),
    cinematicTitle:document.querySelector("#ao-cinema-transition [data-ao-cinema-transition-title]")?.textContent?.trim()??"",
    cinematicKicker:document.querySelector("#ao-cinema-transition [data-ao-cinema-transition-kicker]")?.textContent?.trim()??"",
    reduced:globalThis.AO_CINEMATIC_V4312?.isReducedMotion?.()??null,
  }));
  assert.equal(rosaryMysteryFx.currentMystery,"1","Rosary donor progress did not advance to Mystery I");
  assert.equal(rosaryMysteryFx.artBackdrop,true,"Rosary Mystery I lost the donor sacred-art backdrop");
  assert.ok(rosaryMysteryFx.artValue.includes("url("),"Rosary mystery backdrop has no resolved artwork");
  assert.ok(rosaryMysteryFx.contemplation>=1,"Rosary Mystery I lost the donor contemplation sheet");
  assert.match(rosaryMysteryFx.headerTitle,/Glorious Mysteries|Mystères glorieux/i,"Rosary header repeats the active mystery instead of identifying the mystery set");
  assert.match(rosaryMysteryFx.contemplationTitle,/Resurrection|Résurrection/i,"Rosary contemplation lost the active mystery title");
  assert.equal(rosaryMysteryFx.artTitleVisible,false,"Rosary sacred-art caption repeats the active mystery title");
  assert.equal(rosaryMysteryFx.mysteryKickerVisible,false,"Rosary repeats mystery progress as text beneath the five-segment progress owner");
  assert.equal(rosaryMysteryFx.mysteryBeadsVisible,false,"Rosary displays an empty decade-bead row before decade prayer begins");
  assert.equal(rosaryMysteryFx.helperTextVisible,false,"Rosary keeps obsolete explanatory helper text in the live reader");
  assert.ok(rosaryMysteryFx.cinematicTitle.length>0,"Rosary mystery cinematic has no title");
  assert.match(rosaryMysteryFx.cinematicKicker,/HOLY ROSARY|SAINT ROSAIRE/,"Rosary mystery cinematic lost devotional identity");
  assert.equal(rosaryMysteryFx.reduced,false,"visual acceptance unexpectedly entered reduced-motion mode");
  await shot("03c-pray-rosary-mystery-cinematic");
  await waitForFxSettled();
  await shot("03d-pray-rosary-live-rail");

  let firstAveReached=await page.evaluate(()=>{
    const api=globalThis.AO_ROSARY_V381,state=api?.state?.(),steps=api?.steps?.()||[],step=steps[state?.step];
    return step?.kind==="prayer"&&step?.key==="ave"&&Number(step?.bead)===1;
  });
  for(let guard=0;!firstAveReached&&guard<8;guard+=1){
    const before=await page.evaluate(()=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1));
    await page.locator("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] [data-lab-rosary-next]").click();
    await page.waitForFunction(previous=>Number(globalThis.AO_ROSARY_V381?.state?.()?.step??-1)>previous,before,{timeout:2000});
    firstAveReached=await page.evaluate(()=>{
      const api=globalThis.AO_ROSARY_V381,state=api?.state?.(),steps=api?.steps?.()||[],step=steps[state?.step];
      return step?.kind==="prayer"&&step?.key==="ave"&&Number(step?.bead)===1;
    });
  }
  assert.equal(firstAveReached,true,"Rosary visible Next did not reach the first Hail Mary of the decade");
  const hailMaryPresentation=await page.evaluate(()=>{
    const visible=x=>Boolean(x&&getComputedStyle(x).display!=="none"&&getComputedStyle(x).visibility!=="hidden"&&x.getClientRects().length);
    const count=document.querySelector("#aoPrayerBookRoot .lab-prayer-count");
    const beads=[...document.querySelectorAll("#aoPrayerBookRoot .lab-bead-stage .lab-bead")];
    const flip=document.querySelector("#aoPrayerBookRoot .lab-prayer-flip[data-pb-flip]");
    const latin=flip?.querySelector("[data-pb-latin]"),vern=flip?.querySelector("[data-pb-vern]");
    return {
      title:document.querySelector("#aoPrayerBookRoot .lab-prayer-sheet h2")?.textContent?.trim()??"",
      visibleCount:visible(count),
      visibleBeads:beads.filter(visible).length,
      currentBeads:beads.filter(x=>x.classList.contains("current")&&visible(x)).length,
      latinVisible:visible(latin),
      vernVisible:visible(vern),
    };
  });
  assert.match(hailMaryPresentation.title,/Hail Mary|Je vous salue Marie/i,"Rosary first decade prayer is not the Hail Mary");
  assert.equal(hailMaryPresentation.visibleCount,false,"Rosary repeats Hail Mary 1/10 text beside the ten-bead progress owner");
  assert.equal(hailMaryPresentation.visibleBeads,10,"Rosary first Hail Mary does not expose the ten-bead progress row");
  assert.equal(hailMaryPresentation.currentBeads,1,"Rosary ten-bead progress has more than one current owner");
  assert.equal(hailMaryPresentation.latinVisible,false,"Rosary Hail Mary renders Latin simultaneously with the vernacular");
  assert.equal(hailMaryPresentation.vernVisible,true,"Rosary Hail Mary vernacular face is not visible");
  await shot("03d2-pray-rosary-hail-mary");

  const rosaryStepBeforeBack=await page.evaluate(()=>globalThis.AOTraditionalPrayerBook?.getState?.()?.rosaryStep??null);
  await page.locator("#aoPrayerBookRoot.open .lab-back,#aoPrayerBookRoot .lab-back").first().click();
  await page.waitForFunction(()=>[...document.querySelectorAll("#aoPrayerBookRoot")].every(root=>!root.classList.contains("open")),null,{timeout:5000});
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:5000});
  const rosaryReturn=await page.evaluate(()=>({
    rosaryStep:globalThis.AOTraditionalPrayerBook?.getState?.()?.rosaryStep??null,
    modularView:document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView??null,
  }));
  assert.equal(rosaryReturn.rosaryStep,rosaryStepBeforeBack,"Rosary visible Back advanced the preserved engine instead of returning");
  assert.equal(rosaryReturn.modularView,"home","Rosary visible Back did not return directly to PRAY");

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

  // Later approved donor surfaces: completed bilingual V4 Novenas plus the v38.1 traditional PRAY modules.
  await page.evaluate(()=>globalThis.AO_PRAY_V435930?.open?.("pray.novenas",{returnContext:null}));
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="novenas",null,{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-n1-close]").count(),1,"Novenas lost the donor Close control");
  assert.equal(await page.locator("#aoPray435930 .aoN1Card").count(),16,"Novenas overview must expose the frozen 16-target bilingual corpus");
  await shot("03f-pray-novenas");
  await page.locator("#aoPray435930 [data-n1-select='st_michael']").click();
  await page.waitForSelector("#aoPray435930 .aoN1Calendar",{state:"visible",timeout:3000});
  const stMichaelCalendarText=await page.locator("#aoPray435930 .aoN1Calendar").innerText();
  assert.match(stMichaelCalendarText,/Suggested start|Début suggéré/,"St Michael feast-aligned novena window is being misrepresented as a historical start rule");
  await shot("03f2-pray-novena-st-michael-suggested-start");

  for(const [route,name] of [
    ["pray.morning_evening","03g-pray-morning-evening"],
    ["pray.sacred_hymns","03h-pray-sacred-hymns"],
    ["pray.holy_name_litany","03i-pray-holy-name"],
  ]){
    await page.evaluate(route=>globalThis.AO_PRAY_V435930?.open?.(route,{returnContext:null}),route);
    await page.waitForFunction(route=>{
      const m=document.querySelector("#aoPray435930 .aoP435930Mount");
      return m?.dataset?.aoPrayView==="traditional-pray"&&m?.dataset?.aoTraditionalPrayRoute===route;
    },route,{timeout:5000});
    assert.equal(await page.locator("#aoPray435930 [data-tp381-close]").count(),1,route+" lost the donor Close control");
    assert.equal(await page.locator("#aoPray435930 .aoTP381Hero").count(),0,route+" regained a non-donor hero card");
    assert.equal(await page.locator("#aoPray435930 .aoTP381Intro").count(),1,route+" lost its v38.1 donor introduction");
    if(route==="pray.morning_evening"){
      const rowGeometry=await page.evaluate(()=>{
        const row=document.querySelector("#aoPray435930 .aoTP381PrayerList button");
        const title=row?.querySelector("b")?.getBoundingClientRect();
        const note=row?.querySelector("small")?.getBoundingClientRect();
        return title&&note?{titleBottom:title.bottom,noteTop:note.top,titleRight:title.right,noteLeft:note.left}:null;
      });
      assert.ok(rowGeometry&&rowGeometry.noteTop>=rowGeometry.titleBottom+2,
        "Morning/Evening prayer-row subtitle overlaps the title instead of occupying its donor second line");
    }
    await shot(name);
  }

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
  assert.equal(learnParity.heroTitle,"Formation","Formation hero no longer preserves the locked A2 title");
  assert.ok(learnParity.intro.length>20,"Learn formation introduction is blank or collapsed");
  assert.ok(learnParity.context.length>0,"Learn lost its selected-day context line");
  assert.deepEqual(learnParity.sectionTitles,["Daily formation","Courses & study","Traditional Catholic life","Today in context"],"Learn section hierarchy diverged from v43.59.30 plus v38.4 Holy Orders formation");
  assert.deepEqual(learnParity.modules,["learn.catechism.daily","learn.latin","learn.mass","learn.spiritual_life","learn.catechism","learn.glossary","learn.sexual_ethics","learn.rites.sick","learn.rites.baptism","learn.rites.first_communion","learn.rites.confirmation","learn.rites.holy_orders","learn.rites.matrimony","learn.serve_mass.responses","learn.scapular","today.gospel"],"Formation visible launcher order diverged from the canonical layout");
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-module='today.saint']").count(),0,"Saint of the Day remained duplicated in Learn");
  assert.deepEqual(learnParity.featured,["learn.catechism.daily","learn.mass"],"Learn featured-card hierarchy diverged from the canonical Formation layout");
  assert.equal(learnParity.donorNav,0,"historical V37 navigation leaked into modular Learn");
  assert.equal(learnParity.sourcesUtility,0,"Sources incorrectly resurfaced as a Learn launcher");
  assert.equal(learnParity.calendarDashboard,0,"Calendar dashboard duplicated inside Learn");
  assert.ok(learnParity.overflow<=1,"Learn has horizontal overflow on 390px phone geometry");
  assert.equal(learnParity.cards.length,15,"Formation launcher count should include Spiritual Life, Latin, Catholic Sexual Ethics and the sacramental modules while Saint of the Day remains owned by Calendar");
  for(const card of learnParity.cards){assert.ok(card.w>300,"Learn card collapsed below phone-readable width");assert.ok(card.h>=90,"Learn card collapsed below approved touch/readability height");}
  const spiritualIcon=page.locator("#ao-learn-modular-root [data-ao-learn-card='learn.spiritual_life'] .aoLearnModIcon[data-ao-asset-id='ao-refined-spiritual-life']");
  assert.equal(await spiritualIcon.count(),1,"Spiritual Life is missing its canonical formation icon");
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
  const learnDesign=await page.evaluate(()=>({
    displayFont:getComputedStyle(document.querySelector("#ao-learn-modular-root .aoLearnModHero h1")).fontFamily,
    bodyFont:getComputedStyle(document.getElementById("ao-learn-modular-root")).fontFamily,
    gutter:getComputedStyle(document.querySelector("#ao-learn-modular-root .aoLearnModWrap")).paddingLeft,
    cardRadius:getComputedStyle(document.querySelector("#ao-learn-modular-root .aoLearnModCard")).borderRadius,
    topControl:(()=>{const x=document.querySelector("#ao-learn-modular-root .aoLearnModTop button");const s=getComputedStyle(x);return {w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height,r:s.borderRadius}})(),
  }));
  assert.equal(learnDesign.displayFont,designBaseline.displayFont,"Learn display typography diverged from the app system");
  assert.equal(learnDesign.bodyFont,designBaseline.bodyFont,"Learn body typography diverged from Home");
  assert.equal(learnDesign.gutter,designBaseline.gutter,"Learn phone gutter diverged from the app grid");
  assert.equal(learnDesign.cardRadius,designBaseline.cardRadius,"Learn cards diverged from canonical geometry");
  assert.equal(Math.round(learnDesign.topControl.w),44,"Learn top control width diverged");
  assert.equal(Math.round(learnDesign.topControl.h),44,"Learn top control height diverged");
  assert.equal(learnDesign.topControl.r,"999px","Learn top control lost canonical circular geometry");
  await shot("04-learn");

  const hiddenSaintAlias=await page.evaluate(()=>globalThis.AO_LEARN_APP_V1?.openModule?.("today.saint"));
  assert.equal(hiddenSaintAlias,true,"Hidden today.saint compatibility route could not be opened from Learn owner");
  await page.waitForFunction(()=>globalThis.AO_NAV_V25?.getState?.()?.panel==="saint",null,{timeout:5000});
  assert.equal(await page.locator("#ao-v25-panel").count(),1,"Saint detail engine did not open through the preserved compatibility route");
  await page.evaluate(()=>globalThis.AO_NAV_V25?.closePanel?.());
  await page.waitForFunction(()=>globalThis.AO_NAV_V25?.getState?.()?.panel!=="saint",null,{timeout:5000});

  for(const [route,name] of [
    ["learn.rites.sick","04a-learn-serious-illness"],
    ["learn.rites.baptism","04b-learn-baptism"],
    ["learn.rites.matrimony","04c-learn-matrimony"],
    ["learn.serve_mass.responses","04d-learn-low-mass-responses"],
    ["learn.scapular","04e-learn-scapular"],
  ]){
    const opened=await page.evaluate(route=>globalThis.AO_LEARN_APP_V1?.openModule?.(route),route);
    assert.equal(opened,true,route+" could not be opened from modular Learn");
    await page.waitForFunction(route=>globalThis.AO_TRADITIONAL_LEARN_V381?.status?.().open===true&&globalThis.AO_TRADITIONAL_LEARN_V381?.status?.().route===route,route,{timeout:5000});
    assert.equal(await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-back]").count(),1,route+" lost donor Back");
    assert.equal(await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-close]").count(),1,route+" lost donor Close");
    assert.equal((await page.locator("#ao-learn-traditional-root .aoLearnTradTop small").textContent())?.trim(),"Lay Companion",route+" lost the v38.1 donor shell identity");
    await shot(name);
    await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-close]").click();
    await page.waitForFunction(()=>!document.getElementById("ao-learn-traditional-root")&&globalThis.AO_LEARN_APP_V1?.status?.().child===null,null,{timeout:5000});
    await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:5000});
  }

  // Seasonal Catholic Practice remains only a compatibility route into the single Liturgical Year surface.
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-module='learn.seasonal_rites']").count(),0,"duplicate Seasonal Catholic Practice launcher returned");
  const seasonalAlias=await page.evaluate(()=>globalThis.AO_MODULES?.open?.("learn.seasonal_rites",{returnContext:{surface:"learn"}}));
  assert.equal(seasonalAlias?.ok,true,"Seasonal compatibility route failed");
  await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:5000});
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Ring").count(),1,"Seasonal compatibility route did not reach the Liturgical Year surface");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV384Companion").count(),0,"retired duplicate Traditional Liturgical Year companion returned");
  assert.equal(await page.locator("#ao-calendar-modular-root .v384SectionLabel").count(),0,"retired v38.4 full-year index leaked into the active Calendar");
  await shot("04f-seasonal-year-alias");
  await page.locator("[data-ao-app-surface='learn']").click();
  await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:5000});

  await page.locator("[data-ao-app-surface='settings']").click();
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  await waitForFxSettled();
  await assertHomeHidden("Settings");
  assert.equal(await page.locator("#ao-settings-modular-root [data-settings-close]").count(),1,"Settings main has duplicate exit controls");
  const settingsParity=await page.evaluate(()=>({
    owner:document.getElementById("ao-settings-modular-root")?.dataset?.aoSettingsOwner??null,
    presentation:document.getElementById("ao-settings-modular-root")?.dataset?.aoSettingsPresentationOwner??null,
    headings:[...document.querySelectorAll("#ao-settings-modular-root .aoSetSection > h2")].map(x=>x.textContent?.trim()??""),
    routes:[...document.querySelectorAll("#ao-settings-modular-root [data-settings-route]")].map(x=>x.getAttribute("data-settings-route")),
    sourcesLaunchers:document.querySelectorAll("#ao-settings-modular-root [data-settings-sources]").length,
    historicalVisible:globalThis.AO_SETTINGS_APP_V1?.status?.().historicalSettingsVisible??null,
    embeddedHomeSettings:globalThis.AO_SETTINGS_APP_V1?.status?.().embeddedHomeSettingsVisible??null,
    overflow:(()=>{const x=document.getElementById("ao-settings-modular-root");return x?x.scrollWidth-x.clientWidth:Infinity})(),
    topLevelSources:document.querySelectorAll("[data-ao-app-surface='sources']").length,
  }));
  assert.equal(settingsParity.owner,"AO_SETTINGS_APP_V1");
  assert.equal(settingsParity.presentation,"modular-settings-presentation-v4359.6");
  assert.deepEqual(settingsParity.headings,["APP","MASS & PRAYER","DATA","ABOUT"],"Settings donor hierarchy regressed");
  for(const route of ["/settings/general","/settings/accessibility","/settings/language-reading","/settings/mass","/settings/local-customs","/settings/prayer","/settings/privacy-data","/settings/about-sources"]){
    assert.ok(settingsParity.routes.includes(route),route+" missing from restored Settings landing");
  }
  assert.equal(settingsParity.sourcesLaunchers,1,"Settings must expose exactly one Sources & About destination");
  assert.equal(settingsParity.historicalVisible,false,"historical Settings donor is visible beneath modular Settings");
  assert.equal(settingsParity.embeddedHomeSettings,false,"retired Home Settings surface is visible beneath modular Settings");
  assert.ok(settingsParity.overflow<=1,"Settings has horizontal overflow on 390px phone geometry");
  assert.equal(settingsParity.topLevelSources,0,"Sources resurfaced as a seventh top-level destination");
  const settingsDesign=await page.evaluate(()=>({
    displayFont:getComputedStyle(document.querySelector("#ao-settings-modular-root .aoSetTitle strong")).fontFamily,
    bodyFont:getComputedStyle(document.getElementById("ao-settings-modular-root")).fontFamily,
    gutter:getComputedStyle(document.querySelector("#ao-settings-modular-root .aoSetWrap")).paddingLeft,
    cardRadius:getComputedStyle(document.querySelector("#ao-settings-modular-root .aoSetGroup")).borderRadius,
    topControl:(()=>{const x=document.querySelector("#ao-settings-modular-root .aoSetTop button");const s=getComputedStyle(x);return {w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height,r:s.borderRadius}})(),
  }));
  assert.equal(settingsDesign.displayFont,designBaseline.displayFont,"Settings display typography diverged from the app system");
  assert.equal(settingsDesign.bodyFont,designBaseline.bodyFont,"Settings body typography diverged from Home");
  assert.equal(settingsDesign.gutter,designBaseline.gutter,"Settings phone gutter diverged from the app grid");
  assert.equal(settingsDesign.cardRadius,designBaseline.cardRadius,"Settings cards diverged from canonical geometry");
  assert.equal(Math.round(settingsDesign.topControl.w),44,"Settings top control width diverged");
  assert.equal(Math.round(settingsDesign.topControl.h),44,"Settings top control height diverged");
  assert.equal(settingsDesign.topControl.r,"999px","Settings top control lost canonical circular geometry");
  await shot("05-settings");

  await page.locator("#ao-settings-modular-root [data-settings-sources]").click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="about-sources",null,{timeout:5000});
  const settingsAbout=await page.evaluate(()=>({
    sourceGroups:document.querySelectorAll("#ao-settings-modular-root .aoSetSource").length,
    provenanceRows:document.querySelectorAll("#ao-settings-modular-root .aoSetSourceKey").length,
    aboutRows:document.querySelectorAll("#ao-settings-modular-root .aoSetSection:last-child .aoSetRow").length,
    version:document.querySelector("#ao-settings-modular-root [data-settings-app-version]")?.textContent?.trim()??"",
    canonical:globalThis.AO_RELEASE_AUTHORITY_V4359?.version||document.documentElement.dataset.aoRelease||"",
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
  }));
  assert.equal(settingsAbout.sourceGroups,8,"Sources & About lost a source family");
  assert.equal(settingsAbout.provenanceRows,6,"Sources & About lost provenance labels");
  assert.ok(settingsAbout.aboutRows>=7,"Settings About section is incomplete");
  assert.equal(settingsAbout.version,String(settingsAbout.canonical),"Settings About does not show canonical application version");
  assert.equal(settingsAbout.active,"settings","Sources & About escaped Settings into another top-level surface");
  await page.screenshot({path:resolve(out,"05b-settings-sources.png"),fullPage:false});

  const report=await page.evaluate(()=>({
    shell:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
    release:document.documentElement.dataset.aoRelease??null,
    releaseAuthority:document.documentElement.dataset.aoReleaseAuthority??null,
    appOwner:document.documentElement.dataset.aoAppShellOwner??null,
  }));
  // Wide-browser regression: preserve the integrated v3.4.10 composition — 820px PRAY shell, 760px content measure, two-column hub.
  const wideContext=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1,hasTouch:false,locale:"en-GB"});
  const wide=await wideContext.newPage();
  await wide.goto("http://127.0.0.1:4186/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await wide.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true&&globalThis.AO_PRAY_APP_V1?.status?.().installed===true,null,{timeout:30000});
  await wide.locator("[data-ao-app-surface='pray']").click();
  await wide.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
  const wideHub=await wide.evaluate(()=>{
    const sheet=document.querySelector("#aoPray435930 .aoP435930Sheet"),body=document.querySelector("#aoPray435930 .aoP435930Body"),grid=document.querySelector("#aoPray435930 .aoP435930ModuleGrid");
    const first=document.querySelector("#aoPray435930 .aoP435930ModuleCard"),title=first?.querySelector("b"),description=first?.querySelector(".aoP435930ModuleDescription"),icon=first?.querySelector(".aoP435930ModuleIcon");
    const tr=title?.getBoundingClientRect?.(),dr=description?.getBoundingClientRect?.(),ir=icon?.getBoundingClientRect?.();
    const columns=grid?getComputedStyle(grid).gridTemplateColumns:"";
    return {
      sheet:sheet?.getBoundingClientRect().width??0,
      body:body?.getBoundingClientRect().width??0,
      columns,
      columnCount:columns.trim()?columns.trim().split(/\s+/).length:0,
      titleWidth:tr?.width??0,
      descriptionWidth:dr?.width??0,
      iconRight:ir?.right??0,
      titleLeft:tr?.left??0,
    };
  });
  assert.ok(wideHub.sheet>=818&&wideHub.sheet<=822,"PRAY wide shell diverged from the v3.4.10 820px composition");
  assert.ok(wideHub.body>=750&&wideHub.body<=762,"PRAY wide reading measure diverged from the v3.4.10 760px composition");
  assert.equal(wideHub.columnCount,2,"PRAY wide hub no longer uses the donor two-column module grid");
  assert.ok(wideHub.titleWidth>=210&&wideHub.descriptionWidth>=210,"PRAY wide module text collapsed inside its canonical icon column: "+JSON.stringify(wideHub));
  assert.ok(wideHub.titleLeft>=wideHub.iconRight+6,"PRAY wide module text overlaps its canonical icon column: "+JSON.stringify(wideHub));

  await wide.locator("#aoPray435930 [data-p435930-own='pray.rosary']").click();
  await wide.waitForFunction(()=>!document.getElementById("aoPray435930")?.classList?.contains("open"),null,{timeout:5000});
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
    const card=candidates.find(node=>node.offsetParent!==null&&/Our Father|Pater noster/i.test(node.innerText??""))||candidates.find(node=>node.offsetParent!==null)||null,r=card?.getBoundingClientRect(),sr=shell?.getBoundingClientRect(),rr=root?.getBoundingClientRect();
    const legacyNodes=[...(shell?.querySelectorAll(".lab-recitation-mode,[data-ao-recitation]")??[])];
    const legacyDetails=legacyNodes.map(node=>{
      const cs=getComputedStyle(node),rect=node.getBoundingClientRect();
      return {
        tag:node.tagName,className:node.className||"",aoRecitation:node.dataset?.aoRecitation??null,
        text:(node.textContent||"").replace(/\s+/g," ").trim().slice(0,80),
        display:cs.display,visibility:cs.visibility,opacity:cs.opacity,
        rects:node.getClientRects().length,x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.width),h:Math.round(rect.height),
        parent:node.parentElement?.className||node.parentElement?.tagName||"",
      };
    });
    const visibleLegacy=legacyDetails.filter(x=>x.rects>0&&x.visibility!=="hidden"&&Number(x.opacity)!==0).length;
    const css=shell?getComputedStyle(shell):null;
    return {
      shell:sr?.width??0,cardWidth:r?.width??0,cardHeight:r?.height??0,visibleLegacy,legacyDetails,
      layout:shell?.dataset?.aoRosaryLayout??null,
      ritualGrid:shell?.classList.contains("aoRosaryRitualGrid")??false,
      nested:shell?.querySelectorAll(":scope > section.aoRosaryRitualGrid").length??0,
      overview:shell?.querySelectorAll("[data-r23-overview-open],#r23-overview-sheet").length??0,
      rootWidth:rr?.width??0,cssWidth:css?.width??"",maxWidth:css?.maxWidth??"",boxSizing:css?.boxSizing??"",
      transform:css?.transform??"",paddingLeft:css?.paddingLeft??"",paddingRight:css?.paddingRight??"",
      offsetWidth:shell?.offsetWidth??0,scrollWidth:shell?.scrollWidth??0,
    };
  });
  await wide.screenshot({path:resolve(out,"03e-pray-wide-regression.png"),fullPage:false});
  assert.ok(wideRosary.shell>=748&&wideRosary.shell<=762,"Rosary wide shell diverged from the v3.4.10 760px preserved donor measure: "+JSON.stringify(wideRosary));
  assert.ok(wideRosary.cardWidth>=680,"Rosary wide viewport collapsed the actual prayer column");
  assert.ok(wideRosary.cardHeight>0&&wideRosary.cardHeight<720,"Rosary wide Our Father reproduced the vertical word-stack regression");
  assert.equal(wideRosary.layout,"single-column","Rosary wide shell lost single-column ownership");
  assert.equal(wideRosary.ritualGrid,false,"Rosary wide shell regressed to the narrow ritual grid");
  assert.equal(wideRosary.visibleLegacy,0,"Rosary wide viewport exposes duplicate recitation controls: "+JSON.stringify(wideRosary.legacyDetails));
  assert.equal(wideRosary.nested,0,"Rosary wide viewport reparents donor DOM into a nested ritual grid");
  assert.equal(wideRosary.overview,0,"Rosary wide viewport restored redundant Overview chrome");
  await wideContext.close();

  await writeFile(resolve(out,"report.json"),JSON.stringify({report,errors},null,2));
  assert.deepEqual(errors,[],"page errors during visual acceptance: "+JSON.stringify(errors));
  console.log("visual acceptance capture: PASS",JSON.stringify({errors,report},null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
