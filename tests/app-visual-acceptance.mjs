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
  await page.waitForSelector("#ao-cinema-transition.aoCinemaTransitionOn",{state:"visible",timeout:2000});
  await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>document.getElementById("ao-calendar-modular-root")?.dataset?.aoPresentationFx==="entered",null,{timeout:3000});
  await waitForFxSettled();
  await assertHomeHidden("Calendar");
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
  await shot("02-calendar");

  await page.locator("[data-ao-app-surface='pray']").click();
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
  await waitForFxSettled();
  await assertHomeHidden("PRAY");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-back]").count(),1,"PRAY root lost its Home return control");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-close]").count(),0,"PRAY root exposes duplicate Back + Close exits");
  const prayHub=await page.evaluate(()=>({
    owner:document.getElementById("aoPray435930")?.dataset?.aoPrayOwner??null,
    cards:document.querySelectorAll("#aoPray435930 .aoP435930ModuleCard").length,
    legacyOpen:document.getElementById("aoPrayerBookRoot")?.classList?.contains("open")??false,
  }));
  assert.equal(prayHub.owner,"modular-pray-v1");
  assert.ok(prayHub.cards>=10,"PRAY hub lost its locked devotional module hierarchy");
  assert.equal(prayHub.legacyOpen,false,"legacy Prayer Book is visible beneath modular PRAY");
  await shot("03-pray");

  // Prototype-era semantic rails are presentation-only: they must expose
  // resolved posture/context without reserving prayer-column width or stealing touch.
  await page.locator("#aoPray435930 [data-p435930-own='pray.angelus_regina']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="angelus",null,{timeout:5000});
  const angelusRails=await page.evaluate(()=>({
    left:document.querySelectorAll("#aoPray435930 .aoP435930SemanticRail.left").length,
    right:document.querySelectorAll("#aoPray435930 .aoP435930SemanticRail.right").length,
    posture:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    context:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    iconWidth:document.querySelector("#aoPray435930 .aoP435930SemanticRailIcon")?.getBoundingClientRect?.().width??0,
    bodyWidth:document.querySelector("#aoPray435930 .aoP435930Body")?.getBoundingClientRect?.().width??0,
    pointer:getComputedStyle(document.querySelector("#aoPray435930 .aoP435930SemanticRails")).pointerEvents,
    contextMask:(()=>{const x=document.querySelector("#aoPray435930 .aoP435930SemanticRail.right .aoP435930SemanticRailIcon");return x?(getComputedStyle(x).webkitMaskImage||getComputedStyle(x).maskImage||""):""})(),
  }));
  assert.equal(angelusRails.left,1,"Angelus lost the faithful-posture semantic rail");
  assert.equal(angelusRails.right,1,"Angelus lost the devotional-context semantic rail");
  assert.ok(["ao-live-stand","ao-live-kneel"].includes(angelusRails.posture),"Angelus posture rail is not sourced from the canonical posture bank");
  assert.equal(angelusRails.context,"ao-rich-angelus","Angelus context rail is not using the canonical devotional identity");
  assert.ok(angelusRails.iconWidth>=26,"Angelus rail icon is not salient at phone size");
  assert.ok(angelusRails.bodyWidth>=360,"semantic rails reserved horizontal reading width");
  assert.equal(angelusRails.pointer,"none","semantic rails intercept touch interaction");
  assert.match(angelusRails.contextMask,/ao-rich-angelus\.png/,"Angelus semantic rail did not load the canonical frozen mask");
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
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Preserved Rosary player: live context rail follows existing Rosary state and
  // the global cinematic owner fires only when a new mystery is entered.
  await page.locator("#aoPray435930 [data-p435930-own='pray.rosary']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="rosary",null,{timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-launch-rosary]").click();
  await page.waitForSelector("#aoPrayerBookRoot.open",{state:"visible",timeout:10000});
  await page.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-today]",{state:"visible",timeout:10000});
  const standard=page.locator("#aoPrayerBookRoot [data-v38-rosary-form='standard']");
  if(await standard.count())await standard.click();
  await page.locator("#aoPrayerBookRoot [data-lab-rosary-today]").click();
  await page.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-next]",{state:"visible",timeout:5000});
  await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot .aoP435930RosarySemanticRail.right"),null,{timeout:5000});
  const rosaryOpeningRail=await page.evaluate(()=>({
    right:document.querySelectorAll("#aoPrayerBookRoot .aoP435930RosarySemanticRail.right").length,
    left:document.querySelectorAll("#aoPrayerBookRoot .aoP435930RosarySemanticRail.left").length,
    icon:document.querySelector("#aoPrayerBookRoot .aoP435930RosarySemanticRailIcon")?.dataset?.aoAssetId??null,
    context:document.querySelector("#aoPrayerBookRoot .aoP435930RosarySemanticRailChip small")?.textContent?.trim()??"",
    pointer:getComputedStyle(document.querySelector("#aoPrayerBookRoot .aoP435930RosarySemanticRails")).pointerEvents,
    shellWidth:document.querySelector("#aoPrayerBookRoot .pbShell")?.getBoundingClientRect?.().width??0,
  }));
  assert.equal(rosaryOpeningRail.right,1,"Rosary player lost its live context rail");
  assert.equal(rosaryOpeningRail.left,0,"Rosary player invented a universal posture rail");
  assert.equal(rosaryOpeningRail.icon,"ao-rich-rosary","Rosary live rail lost canonical Rosary identity");
  assert.match(rosaryOpeningRail.context,/Opening|Ouverture/,"Rosary opening context is not reflected in the live rail");
  assert.equal(rosaryOpeningRail.pointer,"none","Rosary live rail intercepts touch");
  assert.ok(rosaryOpeningRail.shellWidth>=360,"Rosary live rail reserved prayer-column width");

  // Standard Rosary has seven opening prayer steps before Mystery I.
  for(let i=0;i<7;i++)await page.locator("#aoPrayerBookRoot [data-lab-rosary-next]").click();
  await page.waitForFunction(()=>{
    const api=globalThis.AO_ROSARY_V381,state=api?.state?.(),steps=api?.steps?.()||[];
    return steps[state?.step]?.kind==="mystery";
  },null,{timeout:5000});
  await page.waitForSelector("#ao-cinema-transition.aoCinemaTransitionOn",{state:"visible",timeout:2000});
  const rosaryMysteryFx=await page.evaluate(()=>({
    context:document.querySelector("#aoPrayerBookRoot .aoP435930RosarySemanticRailChip small")?.textContent?.trim()??"",
    cinematicTitle:document.querySelector("#ao-cinema-transition [data-ao-cinema-transition-title]")?.textContent?.trim()??"",
    cinematicKicker:document.querySelector("#ao-cinema-transition [data-ao-cinema-transition-kicker]")?.textContent?.trim()??"",
    reduced:globalThis.AO_CINEMATIC_V4312?.isReducedMotion?.()??null,
  }));
  assert.match(rosaryMysteryFx.context,/Mystery 1 \/ 5|Mystère 1 \/ 5/,"Rosary live rail did not advance to Mystery I");
  assert.ok(rosaryMysteryFx.cinematicTitle.length>0,"Rosary mystery cinematic has no title");
  assert.match(rosaryMysteryFx.cinematicKicker,/HOLY ROSARY|SAINT ROSAIRE/,"Rosary mystery cinematic lost devotional identity");
  assert.equal(rosaryMysteryFx.reduced,false,"visual acceptance unexpectedly entered reduced-motion mode");
  await shot("03c-pray-rosary-mystery-cinematic");
  await waitForFxSettled();
  await shot("03d-pray-rosary-live-rail");

  await page.locator("#aoPrayerBookRoot .lab-back").first().click();
  await page.waitForFunction(()=>!document.getElementById("aoPrayerBookRoot")?.classList?.contains("open"),null,{timeout:5000});
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:5000});

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
  await writeFile(resolve(out,"report.json"),JSON.stringify({report,errors},null,2));
  assert.deepEqual(errors,[],"page errors during visual acceptance: "+JSON.stringify(errors));
  console.log("visual acceptance capture: PASS",JSON.stringify({errors,report},null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
