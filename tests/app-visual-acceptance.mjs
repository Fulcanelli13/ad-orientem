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

  // Historical Today and Prayer are explicitly rollback-only. The default H4\n  // Home and its Year Clock are certified by home-h11-appearance-acceptance.\n  // This historical, full-app visual acceptance suite asserts the 9-card
  // grouped Prayer hub and the direct Angelus Folio path. Those remain the
  // supported rollback layout. The new DEFAULT 9-tile Prayer discovery and
  // optional Angelus entry are certified separately by
  // tests/pray-design-pilot-phone.mjs at 320px and 390px.
  await page.goto("http://127.0.0.1:4186/index.html?aoTodayH4=0&aoR17Reader=native&aoPrayerPilot=0",
    {waitUntil:"domcontentloaded",timeout:90000});

  // Original v43.43 loader ownership: same boot/async DOM, exact Marian and
  // Four Evangelists masks, no additional spinner or second overlay.
  const roses=await page.evaluate(()=>{
    const boot=document.querySelector("#ao-cinema-boot");
    const loader=document.querySelector("#ao-cinema-loader");
    const first=boot?.querySelector(".aoCinemaBootCross.aoBrandEmblem")??null;
    const second=loader?.querySelector(".aoCinemaLoaderMark.aoBrandEmblem")??null;
    const detail=el=>{
      if(!el)return null;
      const mark=getComputedStyle(el,"::before"),rect=el.getBoundingClientRect();
      return {mask:mark.maskImage||mark.webkitMaskImage,animation:mark.animationName,
        width:rect.width,height:rect.height,pseudoWidth:mark.width,pseudoHeight:mark.height,
        background:mark.backgroundColor};
    };
    return {boot:detail(first),loader:detail(second),
      bootCount:document.querySelectorAll("#ao-cinema-boot").length,
      loaderCount:document.querySelectorAll("#ao-cinema-loader").length,
      linked:Boolean(document.getElementById("ao-v4343-rose-windows-css"))};
  });
  assert.equal(roses.bootCount,1,"loading repair duplicated the boot overlay");
  assert.equal(roses.loaderCount,1,"loading repair duplicated the async overlay");
  assert.equal(roses.linked,true,"v43.43 loader art not loaded before the Home paint");
  assert.match(roses.boot?.mask??"",/rose-marian-v4343\.png/,
    "original Our Lady rose missing from application boot");
  assert.match(roses.loader?.mask??"",/rose-evangelists-v4343\.png/,
    "original Four Evangelists rose missing from asynchronous loader");
  // The archived ::before remains as the no-JS fallback; the director can
  // suppress that pulse to crossfade three exact masks as separate layers.
  const enhancedBoot=await page.evaluate(()=>{
    const mark=document.querySelector(".aoCinemaBootCross.aoBrandEmblem");
    return {enhanced:mark?.dataset?.aoLoadingEnhanced,
      count:mark?.querySelectorAll(".aoLoadingArtLayer")?.length??0,
      first:mark?.querySelector('.aoLoadingArtLayer[data-visible="true"]')?.dataset?.art??null};
  });
  assert.equal(enhancedBoot.enhanced,"true","boot has not installed three-art loading owner");
  assert.equal(enhancedBoot.count,3);
  assert.equal(enhancedBoot.first,"marian");
  assert.equal(roses.boot?.animation,"none","double-animated donor ::before obscures artwork crossfade");
  assert.equal(roses.loader?.animation,"aoRoseIllumine","unchanged legacy loader must preserve its fallback artwork");
  assert.ok(roses.boot?.width>=130&&roses.boot?.height>=130,"boot rose lost donor scale");
  assert.ok(roses.loader?.width>=56&&roses.loader?.height>=56,"content rose lost donor scale");
  await page.screenshot({path:resolve(out,"01a-v4343-marian-boot-390.png"),fullPage:false});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:30000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForSelector("[data-ao-home-enricher-owner='modular-home-enrichers-v1']",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:8000});

  // Capture the secondary loading artwork independently of calendar/scripture
  // availability. This changes only the visual state of the existing loader.
  const asyncLoader=page.locator("#ao-cinema-loader");
  await asyncLoader.evaluate(el=>{el.classList.add("aoCinemaLoaderOn");el.setAttribute("aria-hidden","false");});
  await page.screenshot({path:resolve(out,"01b-v4343-evangelists-async-390.png"),fullPage:false});
  await asyncLoader.evaluate(el=>{el.classList.remove("aoCinemaLoaderOn");el.setAttribute("aria-hidden","true");});

  // Real asynchronous work produces the director's first artwork only after
  // its debounce, and its second artwork only if the task remains pending.
  await page.evaluate(()=>{window.__aoLoadingVisualTicket=window.AO_LOADING_DIRECTOR_V1.begin("learn");});
  await page.waitForFunction(()=>document.querySelector("#ao-cinema-loader")?.dataset?.aoLoadingDirector==="active",
    null,{timeout:2500});
  const artwork=await page.evaluate(()=>{
    const root=document.querySelector("#ao-cinema-loader");
    const mark=root.querySelector(".aoCinemaLoaderMark");
    const first=mark.querySelector('.aoLoadingArtLayer[data-visible="true"]');
    const layers=[...mark.querySelectorAll(".aoLoadingArtLayer")];
    return {count:layers.length,selected:root.dataset.aoLoadingArt,
      mask:getComputedStyle(first.querySelector(".aoLoadingArtSymbol")).maskImage,
      logoMask:getComputedStyle(layers.find(x=>x.dataset.art==="logo").querySelector(".aoLoadingArtSymbol")).maskImage};
  });
  assert.equal(artwork.count,3);
  assert.equal(artwork.selected,"evangelists");
  assert.match(artwork.mask,/rose-evangelists-v4343.png/);
  assert.match(artwork.logoMask,/ao-brand-emblem.png/);
  await page.screenshot({path:resolve(out,"01c-loading-director-first-390.png"),fullPage:false});
  await page.waitForFunction(()=>document.querySelector("#ao-cinema-loader")?.dataset?.aoLoadingArt==="logo",
    null,{timeout:3500});
  await page.screenshot({path:resolve(out,"01d-loading-director-second-390.png"),fullPage:false});
  await page.evaluate(()=>{window.__aoLoadingVisualTicket.end();delete window.__aoLoadingVisualTicket});
  assert.notEqual(await asyncLoader.getAttribute("data-ao-loading-director"),"active");
  assert.equal(await asyncLoader.getAttribute("aria-hidden"),"true","completed workload left blocking loader");

  await page.emulateMedia({reducedMotion:"reduce"});
  const reducedRose=await page.evaluate(()=>
    getComputedStyle(document.querySelector(".aoCinemaLoaderMark.aoBrandEmblem"),"::before").animationName);
  assert.equal(reducedRose,"none","system reduced-motion preference did not disable rose breathing");
  await page.emulateMedia({reducedMotion:"no-preference"});
  const settingRose=await page.evaluate(()=>{
    document.documentElement.dataset.reducedMotion="true";
    const animation=getComputedStyle(document.querySelector(".aoCinemaLoaderMark.aoBrandEmblem"),"::before").animationName;
    delete document.documentElement.dataset.reducedMotion;
    return animation;
  });
  assert.equal(settingRose,"none","app reduced-motion preference did not disable rose breathing");
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.status?.().presentationFx?.legacyCinematicAvailable===true,
    null,{timeout:8000}
  );

  const expectedRibbonAssets={
    home:"ao-nav-home",
    pray:"ao-nav-pray",
    learn:"ao-nav-learn",
    // Calendar is nested under Today; Settings remains a contextual overlay.
    find:"ao-ui-search",
  };
  const ribbonGeometry=await page.evaluate(()=>{
    const nav=document.querySelector("#ao-global-ribbon .aoGlobalRibbonInner");
    const buttons=[...document.querySelectorAll("#ao-global-ribbon [data-ao-app-surface]")];
    return {tabs:buttons.map(b=>b.dataset.aoAppSurface),
      columns:getComputedStyle(nav).gridTemplateColumns.split(" ").filter(Boolean).length,
      massTab:document.querySelectorAll("#ao-global-ribbon [data-ao-app-surface='mass']").length,
      massDonorVisible:[...document.querySelectorAll("#ao-global-ribbon [data-ao-app-secondary='mass']")]
        .some(b=>getComputedStyle(b).display!=="none")};
  });
  assert.deepEqual(ribbonGeometry.tabs,["home","pray","learn","find"],"Visible ribbon must have four destinations");
  assert.equal(ribbonGeometry.columns,4,"Ribbon still reserves space for retired Mass");
  assert.equal(ribbonGeometry.massTab,0,"Duplicate Mass ribbon destination is still interactive");
  assert.equal(ribbonGeometry.massDonorVisible,false,"Historical Mass slot is still visible");
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
    const extension=surface==="find"?"svg":"png";
    assert.match(actual.mask,new RegExp(assetId+"\\."+extension),surface+" ribbon mask does not resolve to its canonical artwork");
  }

  const homeAudit=await page.evaluate(()=>({
    release:document.documentElement.dataset.aoRelease??null,
    releaseAuthority:document.documentElement.dataset.aoReleaseAuthority??null,
    suppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    canonicalIcons:document.querySelectorAll(".aoHomeCuIcon use").length,
    fallbackIcons:document.querySelectorAll(".aoHomeCuIconFallback").length,
    todayV2:document.querySelectorAll(".aoTodayV2Below[data-ao-home-enricher-owner]").length,
    todayV2Sections:document.querySelectorAll(".aoTodayV2PrayerThroughDay .aoTodayV2Zone,.aoTodayV2Below .aoTodayV2Zone").length,
    todayV2Glance:document.querySelectorAll(".aoTodayV2CalendarGlance").length,
    prayerBeforeCalendar:(()=>{const pray=document.querySelector(".aoTodayV2PrayerThroughDay");const calendar=document.querySelector(".aoTodayV2CalendarGlance");return Boolean(pray&&calendar&&(pray.compareDocumentPosition(calendar)&Node.DOCUMENT_POSITION_FOLLOWING));})(),
    todayV2CalendarLinks:document.querySelectorAll(".aoTodayV2CalendarGlance [data-home-calendar]").length,
    presentationFx:globalThis.AO_APP_SHELL_V1?.status?.().presentationFx??null,
  }));
  assert.equal(homeAudit.release,"43.59.30");
  assert.equal(homeAudit.releaseAuthority,"AO_APP_SHELL_V1");
  assert.equal(homeAudit.suppressed,"false");
  assert.ok(homeAudit.todayV2===1 && homeAudit.todayV2Sections===2 &&
    homeAudit.todayV2Glance===1 && homeAudit.todayV2CalendarLinks>=1,
    "H1.1 must render Prayer and Read/Reflect, one Calendar summary and working Calendar links: "+JSON.stringify(homeAudit));
  assert.equal(homeAudit.prayerBeforeCalendar,true,"H1.1 requires the prayer entry before Calendar context");
  assert.equal(homeAudit.canonicalIcons,0,"obsolete Coming Up icons should not be injected into Today v2");
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

  // Today v2 is the production Home owner. The old v43 celebration/Coming Up
  // classes were retired; certify the rendered editorial sections and entry points.
  const homeParity=await page.evaluate(()=>({
    context:document.querySelectorAll(".homeScreen .aoTodayV2SeasonMicro").length,
    sections:document.querySelectorAll(".homeScreen .aoTodayV2PrayerThroughDay .aoTodayV2Zone,.homeScreen .aoTodayV2Below .aoTodayV2Zone").length,
    prayerFeature:document.querySelectorAll(".homeScreen .aoTodayV2PrayerFeature [data-home-cu-route]").length,
    prayerShortcuts:document.querySelectorAll(".homeScreen .aoTodayV2PrayerShortcuts [data-home-cu-route]").length,
    gospel:document.querySelectorAll(".homeScreen .aoTodayV2ReadReflect [data-action='gospel']").length,
    scripture:document.querySelectorAll(".homeScreen .aoTodayV2ReadReflect [data-home-scripture]").length,
    catechism:document.querySelectorAll(".homeScreen .aoTodayV2ReadReflect [data-home-daily-catechism]").length,
    calendar:document.querySelectorAll(".homeScreen .aoTodayV2CalendarGlance [data-home-calendar-date]").length,
    year:document.querySelectorAll('.homeScreen .aoTodayV2SeasonMicro[data-home-calendar-view="year"]').length,
    upcoming:document.querySelectorAll('.homeScreen .aoTodayV2Tabs [data-home-calendar-view="picker"]').length,
    upcomingDates:document.querySelectorAll('.homeScreen .aoTodayV2CalendarGlance [data-home-calendar-date]').length,
    contextHeight:document.querySelector(".homeScreen .aoTodayV2SeasonMicro")?.getBoundingClientRect().height??0,
    seasonControlStyle:(()=>{
      const el=document.querySelector(".homeScreen .aoTodayV2SeasonMicro");
      if(!el)return null;
      const st=getComputedStyle(el),parent=getComputedStyle(el.parentElement);
      return {height:st.height,minHeight:st.minHeight,display:st.display,visibility:st.visibility,
        transform:st.transform,zoom:st.zoom,parentDisplay:parent.display,parentTransform:parent.transform,
        rect:el.getBoundingClientRect().toJSON(),clientRects:el.getClientRects().length};
    })(),
    horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
    massEntry:document.querySelectorAll(".homeScreen [data-home-mass-entry]").length,
    obsoleteYearWheel:document.querySelectorAll(".homeScreen .aoCalYearWheel").length,
    unresolvedArt:document.querySelectorAll(".homeScreen .aoSaintArtCard .aoSaintArtPlaceholder").length,
  }));
  assert.equal(homeParity.context,1,"Today v2 lost its hero liturgical-season link");
  assert.equal(homeParity.sections,2,"H1.1 retains Prayer and Read/Reflect across the homepage hierarchy");
  assert.equal(homeParity.prayerFeature,1,"Today v2 lost its featured prayer entry");
  assert.equal(homeParity.prayerShortcuts,3,"Today v2 lost the three prayer shortcuts");
  assert.equal(homeParity.gospel,1,"Today v2 lost appointed-Gospel navigation");
  assert.equal(homeParity.scripture,1,"Today v2 lost Scripture navigation");
  assert.equal(homeParity.catechism,1,"Today v2 lost the Daily Catechism entry");
  assert.ok(homeParity.calendar>=1,"Calendar at a glance must retain source-qualified upcoming date links");
  assert.equal(homeParity.year,1,"The season link must still open the canonical Liturgical Year");
  assert.equal(homeParity.upcoming,1,"The header Month tab replaces redundant Coming next CTA");
  assert.ok(homeParity.upcomingDates>=1,"Upcoming dates must preserve Calendar Day entry");
  assert.ok(homeParity.contextHeight>=44,"The compact season control must meet the 44px touch target: "+JSON.stringify(homeParity.seasonControlStyle));
  assert.ok(homeParity.horizontalOverflow<=1,"Home decluttering introduced horizontal overflow");
  assert.equal(homeParity.massEntry,1,"Home does not expose a canonical Follow Mass entry");
  assert.equal(homeParity.obsoleteYearWheel,0,"Calendar dashboard leaked onto Home");
  assert.equal(homeParity.unresolvedArt,0,"Home displayed an unapproved artwork placeholder");
  const designBaseline=await page.evaluate(()=>({
    version:document.documentElement.dataset.aoDesignSystem??null,
    stylePresent:Boolean(document.getElementById("ao-app-design-system")),
    bodyFont:getComputedStyle(document.querySelector(".homeScreen")).fontFamily,
    displayFont:getComputedStyle(document.querySelector(".homeScreen .aoTodayV2Frontispiece h1")).fontFamily,
    cardRadius:getComputedStyle(document.documentElement).getPropertyValue("--ao-card-radius").trim(),
    gutter:getComputedStyle(document.documentElement).getPropertyValue("--ao-page-gutter").trim(),
    controlHeight:getComputedStyle(document.documentElement).getPropertyValue("--ao-control-h").trim(),
  }));
  assert.equal(designBaseline.version,"ao-design-system-v2","shared app design system is not installed");
  assert.equal(designBaseline.stylePresent,true,"shared app design-system stylesheet is missing");
  assert.ok(designBaseline.bodyFont.length>0,"Home font did not resolve");
  assert.equal(designBaseline.gutter,"12px","390px phone does not resolve canonical gutter");
  assert.equal(designBaseline.controlHeight,"44px","canonical touch-control height drifted");
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
  const preflightDonor=await page.evaluate(()=>{
    const flow=document.querySelector("#ao-mass-flow-v1 .aoMassFlow");
    const folio=flow?.querySelector("[data-ao-full-mass-preflight]");
    const outline=e=>({tag:e.tagName,id:e.id,cls:String(e.className||"").slice(0,180),
      data:Object.entries(e.dataset||{}).filter(([a])=>a.startsWith("ao")||a==="role").slice(0,9),
      text:(e.textContent||"").trim().replace(/\\s+/g," ").slice(0,100),
      display:getComputedStyle(e).display,visible:!!e.getClientRects().length,
      parent:e.parentElement?.className||""});
    return {flow:flow?outline(flow):null,
      parents:folio?[folio.parentElement,folio.parentElement?.parentElement].filter(Boolean).map(outline):[],
      siblings:folio?[...folio.parentElement.children].map(outline):[],
      candidate:[...flow?.querySelectorAll?.("section,div,header,article,fieldset,h2,h3,button")||[]]
        .filter(e=>e!==folio&&!folio?.contains(e)&&e.children.length<=5 &&
         /MASS OF THE DAY|CONTENT READINESS|HOW DO YOU WANT TO FOLLOW|VOX|AD ORIENTEM MASS PREFLIGHT/.test((e.textContent||"").trim().replace(/\\s+/g," ").slice(0,110)))
        .slice(0,35).map(outline)};
  });
  console.log("GUIDED_FOLIO_HOST_DOM",JSON.stringify(preflightDonor));
  await shot("01b-mass-preflight");
  // M1 is a permanent Mass root, not a dismissible dialog. Leaving via the
  // shell's Today tab is the supported action. The old close/hidden-backdrop
  // assertion would erroneously fail a correct M1 implementation.
  const permanentMassRoot=await page.evaluate(()=>
    document.documentElement.dataset.aoM1MassRoot==="true");
  if(permanentMassRoot){
    await page.locator("[data-ao-app-surface='home']").click();
    await page.waitForFunction(()=>
      document.documentElement.dataset.aoM1MassRoot!=="true",null,{timeout:5000});
  }else{
    const massFlowClose=page.locator("#ao-mass-flow-v1 .aoMassFlowBackdrop [data-ao-close]").last();
    if(await massFlowClose.isVisible())await massFlowClose.click();
    await page.waitForFunction(()=>{
      const backdrop=document.querySelector("#ao-mass-flow-v1 .aoMassFlowBackdrop");
      return !backdrop||!backdrop.getClientRects().length||getComputedStyle(backdrop).visibility==="hidden";
    },null,{timeout:5000});
    await page.locator("[data-ao-app-surface='home']").click();
  }
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:5000});

  // A previously selected Month/Year lens may be retained across tabs.
  // Select Today through its public control before opening Day & sources.
  // Never force-click a hidden Read/Reflect row.
  const dayLink=page.locator(".homeScreen .aoTodayV2ReadReflect [data-home-calendar-view='day']");
  if(!await dayLink.isVisible()){
    const todayLens=page.locator(".homeScreen .aoTodayV2Tabs [data-home-calendar-today]");
    await todayLens.waitFor({state:"visible",timeout:10000});
    await todayLens.click();
    await dayLink.waitFor({state:"visible",timeout:10000});
  }
  await dayLink.click();
  await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:10000});
  const genericCalendarTransition=await page.evaluate(()=>{
    const el=document.getElementById("ao-cinema-transition");
    const title=el?.querySelector?.("[data-ao-cinema-transition-title]")?.textContent?.trim()??"";
    return {on:Boolean(el?.classList?.contains("aoCinemaTransitionOn")),title};
  });
  assert.notEqual(genericCalendarTransition.title,"Calendar","Calendar ribbon navigation regressed to the fabricated generic destination cinematic");
  await page.waitForFunction(()=>document.querySelectorAll("#ao-calendar-modular-root .aoCalV2Tabs [data-cal-view]").length===3,null,{timeout:5000});
  await waitForFxSettled();
  const embeddedCalendar=await page.evaluate(()=>{
    const home=document.querySelector(".homeScreen.aoTodayV2");
    const slot=home?.querySelector("[data-home-calendar-inline]");
    const child=slot?.querySelector("#ao-calendar-modular-root");
    return {route:globalThis.AO_APP_SHELL_V1?.getActive?.(),
      view:home?.dataset?.aoHomeCalendarView??null,slotVisible:slot?.hidden===false,
      childEmbedded:Boolean(child&&home.contains(child)),
      homeSuppressed:document.documentElement.dataset.aoHomeSuppressed??null};
  });
  assert.deepEqual(embeddedCalendar,{route:"home",view:"day",slotVisible:true,childEmbedded:true,homeSuppressed:"false"},
    "Calendar v2 must occupy the in-page Today tab rather than a separate hidden-Home route");
  await page.waitForFunction(()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.version==="43.45-modular-exact",null,{timeout:5000});
  await page.evaluate(()=>{
    const id=globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate;
    globalThis.__AO_EXACT_WEEK_RETRY=globalThis.AO_CALENDAR_WEEK_CACHE_V4345.retryWeek(id);
  });
  // Inline Calendar v2 can resolve a cached week without displaying the archived
  // v43.45 week-progress loader; acceptance is the seven-day source cache below.
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
  const saintLinkCount=await page.locator("#ao-calendar-modular-root .aoCalV2Saint [data-cal-saint-date]").count();
  assert.ok(saintLinkCount<=1,"Calendar Day duplicated the principal saint reference");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Week [data-cal-date]").count(),7,"Calendar Day lost its seven-day context strip");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Week [aria-current='date']").count(),1,"Calendar selected date is not uniquely identified");
  const calendarDay=await page.evaluate(()=>({
    version:globalThis.AO_CALENDAR_APP_V1?.status?.().version??null,
    identity:document.querySelector("#ao-calendar-modular-root .aoCalV2Hero h2")?.textContent?.trim()??"",
    season:document.querySelector("#ao-calendar-modular-root .aoCalV2Context h3")?.textContent?.trim()??"",
    progressElements:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2Progress").length,
    saintBoilerplate:document.querySelector("#ao-calendar-modular-root .aoCalV2Saint p")?.textContent?.trim()??"",
    heroTopPadding:parseFloat(getComputedStyle(document.querySelector("#ao-calendar-modular-root .aoCalV2Hero")).paddingTop),
    weekScrollable:(()=>{const x=document.querySelector("#ao-calendar-modular-root .aoCalV2Week");return x?x.scrollWidth>=x.clientWidth:false})(),
    rootScrollTop:document.getElementById("ao-calendar-modular-root")?.scrollTop??Infinity,
    displayedDate:document.querySelector("#ao-calendar-modular-root .aoCalV2DayNav strong")?.textContent?.trim()??"",
  }));
  assert.equal(calendarDay.version,"modular-calendar-v2-liturgical-year","Calendar did not activate the v2 owner");
  assert.ok(calendarDay.identity.length>0,"Calendar selected feast identity is blank");
  assert.ok(calendarDay.season.length>0,"Calendar selected liturgical period is blank");
  assert.equal(calendarDay.progressElements,0,"Calendar Day still displays pseudo-achievement progress");
  assert.equal(calendarDay.saintBoilerplate,"","Calendar saint action regained repetitive filler text");
  assert.ok(calendarDay.heroTopPadding<=20,"Calendar Day phone hero has excessive top padding");
  assert.equal(calendarDay.weekScrollable,true,"Calendar week context does not remain touch-scrollable on phone");
  assert.match(calendarDay.displayedDate,/^\d{2}\/\d{2}\/\d{4}$/,"Calendar Day date is not DD/MM/YYYY");
  // Current production ownership: Calendar is embedded in Today, not a
  // separate global destination. Exercise Day, Liturgical Year, Month and
  // the return to Today using the actual phone navigation controls.
  const inPageCalendar=await page.evaluate(()=>{
    const home=document.querySelector(".homeScreen.aoTodayV2");
    const root=home?.querySelector("#ao-calendar-modular-root");
    const slot=home?.querySelector("[data-home-calendar-inline]");
    return {nested:Boolean(root),open:slot?.hidden===false,
      route:globalThis.AO_APP_SHELL_V1?.getActive?.(),
      inset:root?parseFloat(getComputedStyle(root.querySelector(".aoCalModBody")).paddingLeft):0,
      overflow:root?root.scrollWidth-root.clientWidth:Infinity,
      offenders:root?[...root.querySelectorAll("*")].map(el=>({el,r:el.getBoundingClientRect()})).filter(x=>x.r.right>root.getBoundingClientRect().right+2||x.r.left<root.getBoundingClientRect().left-2).slice(0,9).map(x=>({tag:x.el.tagName,cls:String(x.el.className).slice(0,90),right:Math.round(x.r.right),left:Math.round(x.r.left)})):[]};
  });
  assert.equal(inPageCalendar.nested,true,"Calendar must remain embedded in Today");
  assert.equal(inPageCalendar.open,true,"Calendar in-page slot is hidden");
  assert.equal(inPageCalendar.route,"home","Calendar wrongly replaces global Today destination");
  assert.ok(inPageCalendar.inset>=4&&inPageCalendar.inset<=12,
    "embedded Calendar lost bounded inner padding");
  assert.ok(inPageCalendar.overflow<=1,"Calendar Day overflows phone width: "+JSON.stringify(inPageCalendar));
  await shot("02-calendar-day");

  const todayTabs=".homeScreen.aoTodayV2 .aoTodayV2Tabs";
  await page.locator(todayTabs+" [data-home-calendar-view='year']").click();
  await page.waitForSelector("#ao-calendar-modular-root .aoClockDial",{state:"visible",timeout:10000});
  const inlineYear=await page.evaluate(()=>({
    segments:document.querySelectorAll("#ao-calendar-modular-root [data-cal-year-segment]").length,
    periods:document.querySelectorAll("#ao-calendar-modular-root [data-cal-year-period]").length,
    track:document.querySelectorAll("#ao-calendar-modular-root .aoCalYearTrack").length,
    context:document.querySelectorAll("#ao-calendar-modular-root .aoClockContext").length,
    anchors:[...document.querySelectorAll("#ao-calendar-modular-root .aoClockFeastMenu [data-cal-clock-feast]")].map(n=>n.dataset.calClockFeast),
    colourSectors:[...document.querySelectorAll("#ao-calendar-modular-root .aoClockSector")].filter(n=>n.getAttribute("style")?.includes("--ao-clock-glow:")).length,
    clockWidth:document.querySelector("#ao-calendar-modular-root .aoClockDial")?.getBoundingClientRect().width??0,
    seasons:document.querySelectorAll("#ao-calendar-modular-root [data-cal-clock-season]").length,
    obsoleteRings:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2Ring").length,
    overflow:document.querySelector("#ao-calendar-modular-root").scrollWidth-document.querySelector("#ao-calendar-modular-root").clientWidth,
    selected:document.querySelector(".homeScreen.aoTodayV2 .aoTodayV2Tabs [data-home-calendar-view='year']")?.getAttribute("aria-current")??null
  }));
  assert.equal(inlineYear.segments,0,"Home Year must not duplicate Clock as a separate season bar");
  assert.equal(inlineYear.periods,0,"Home Year must not stack eleven duplicate cards");
  assert.equal(inlineYear.track,0,"Home Year must not repeat daily colours in another timeline");
  assert.equal(inlineYear.context,1,"One contextual season panel must replace duplicate journeys");
  for(const date of ["2026-10-25","2026-11-01","2026-11-02"])
    assert.ok(inlineYear.anchors.includes(date),"Major feast missing from source-owned Clock index: "+date);
  assert.equal(inlineYear.colourSectors,8,"Every Clock season needs a translucent liturgical colour");
  assert.ok(inlineYear.clockWidth>=250&&inlineYear.clockWidth<=390,"Interactive Clock is not phone-legible: "+JSON.stringify(inlineYear));
  assert.ok(inlineYear.seasons>=8,"Year Clock did not expose interactive seasonal controls");
  assert.equal(inlineYear.obsoleteRings,0,"The old mini-wheel still hides the interactive year");
  assert.ok(inlineYear.overflow<=1,"Liturgical Year overflows the phone: "+JSON.stringify(inlineYear));
  assert.equal(inlineYear.selected,"page","Today did not identify the active Year tab");
  await shot("02b-calendar-year");

  await page.locator(todayTabs+" [data-home-calendar-view='picker']").click();
  await page.waitForSelector("#ao-calendar-modular-root .aoCalV2MonthGrid",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_CALENDAR_APP_V1?.status?.().monthReady===true,null,{timeout:30000});
  const inlineMonth=await page.evaluate(()=>({
    cells:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid [data-cal-pick-date]").length,
    markers:document.querySelectorAll("#ao-calendar-modular-root .aoCalV2MonthGrid [data-cal-liturgical-marker]").length,
    views:[...document.querySelectorAll("#ao-calendar-modular-root .aoCalMonthTabs [data-cal-month-view]")].map(x=>x.dataset.calMonthView),
    overflow:document.querySelector("#ao-calendar-modular-root").scrollWidth-document.querySelector("#ao-calendar-modular-root").clientWidth,
    active:document.querySelector(".homeScreen.aoTodayV2 .aoTodayV2Tabs [data-home-calendar-view='picker']")?.getAttribute("aria-current")??null
  }));
  assert.equal(inlineMonth.cells,42,"Month lost its 42-day six-week grid");
  assert.equal(inlineMonth.markers,42,"Month lost its liturgical rank/colour markers");
  assert.deepEqual(inlineMonth.views,["calendar","temporale","sanctorale"],
    "Month must expose only All, Temporale and Sanctorale filters");
  assert.ok(inlineMonth.overflow<=1,"Month clips its grid on a 390px phone");
  assert.equal(inlineMonth.active,"page","Today did not identify the Month tab");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalHybridMajorSection").count(),1,
    "Major celebrations must appear beneath the grid");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalHybridPracticesSection").count(),1,
    "Practices and customs must appear beneath the grid");
  await shot("02d-calendar-month");
  for(const category of ["temporale","sanctorale"]){
    await page.locator("#ao-calendar-modular-root [data-cal-month-view='"+category+"']").click();
    assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2MonthGrid").getAttribute("data-cal-month-filter"),category);
    assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2MonthGrid [data-cal-pick-date]").count(),42,
      "Cycle filter must preserve the same 42 clickable date squares");
  }
  await shot("02g-calendar-month-filters");

  await page.locator(todayTabs+" [data-home-calendar-today]").click();
  await page.waitForFunction(()=>document.querySelector(".homeScreen.aoTodayV2 [data-home-calendar-inline]")?.hidden===true,
    null,{timeout:10000});
  assert.equal(await page.locator(".homeScreen .aoTodayV2ReadReflect").count(),1,
    "Returning from Calendar must restore Today's Read & Reflect");
  assert.equal(await page.locator("#ao-calendar-modular-root").count(),0,
    "Today return retained a duplicate embedded Calendar");
  await shot("02i-today-return");

  await page.locator("[data-ao-app-surface='pray']").click();
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
  await waitForFxSettled();
  await assertHomeHidden("PRAY");
  // An open modular shell can precede its asynchronous Home catalogue render.
  // Test the completed 9-door Home, not an intermediate empty mount.
  const prayHubReady=await page.waitForFunction(()=>
    document.querySelectorAll("#aoPray435930 .aoP435930ModuleCard").length===9,
    null,{timeout:12000}).then(()=>true,()=>false);
  if(!prayHubReady){
    const trace=await page.evaluate(()=>({
      route:globalThis.AO_APP_SHELL_V1?.getActive?.(),
      owner:globalThis.AO_PRAY_APP_V1?.status?.(),
      state:globalThis.AO_PRAY_V435930?.state?.()?.view,
      mount:document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset.aoPrayView,
      classes:document.getElementById("aoPray435930")?.className,
      open:document.getElementById("aoPray435930")?.classList.contains("open"),
      html:document.querySelector("#aoPray435930 .aoP435930Mount")?.innerHTML?.slice(0,1000),
      errors,
    }));
    throw new Error("PRAY hub failed to render nine doors: "+JSON.stringify(trace));
  }
  assert.equal(await page.locator("#aoPray435930 [data-p435930-back]").count(),1,"PRAY root lost hierarchical Back");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-home]").count(),1,"PRAY root lost explicit global Home");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-close]").count(),0,"PRAY root regressed to ambiguous Close instead of Home");
  const prayHub=await page.evaluate(()=>({
    owner:document.getElementById("aoPray435930")?.dataset?.aoPrayOwner??null,
    cards:document.querySelectorAll("#aoPray435930 .aoP435930ModuleCard").length,
    legacyOpen:document.getElementById("aoPrayerBookRoot")?.classList?.contains("open")??false,
  }));
  assert.equal(prayHub.owner,"modular-pray-v1");
  assert.equal(prayHub.cards,9,"PRAY landing retains all original doors, Chaplets and Divine Mercy, plus the new private My Customs module");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-my-customs]").count(),1,
    "private My Customs & Prayers must appear exactly once in canonical Pray Home");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-family='chaplets']").count(),1,"Rosary & Chaplets family missing");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-own='pray.divine_mercy']").count(),1,"Direct Divine Mercy shortcut missing");
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
  await page.locator("#aoPray435930 [data-p435930-family='daily']").click();
  await page.locator("#aoPray435930 [data-p435930-own='pray.angelus_regina']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="angelus",null,{timeout:5000});
  // Folio is the user-facing Angelus owner. The old donor ritual rail stays
  // hidden deliberately, avoiding duplicated persistent posture guidance.
  // Assert the visible source-owned Folio posture note, current prayer card,
  // and navigable timeline instead of measuring a hidden legacy rail.
  const angelusFolio=await page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930 .aoP435930AngelusReader.aoFolioReader");
    const grid=root?.querySelector(".aoAngelusRitualGrid")??null;
    const oldRail=grid?.querySelector('[data-ao-ritual-module="angelus"]')??null;
    const posture=root?.querySelector(".aoFolioPostureNote")??null;
    const summary=posture?.querySelector("summary")??null;
    const icon=summary?.querySelector(".aoFolioPostureIcon")??null;
    const timeline=root?.querySelector(".aoDevoTimeline")??null;
    const viewport=root?.querySelector(".aoDevoCardViewport")??null;
    const cards=[...(viewport?.querySelectorAll("[data-ao-devo-card]")??[])];
    const visible=el=>Boolean(el&&el.getClientRects().length&&el.getBoundingClientRect().height>0);
    return {
      folioVisible:visible(root),
      oldOverlay:root?.querySelectorAll(".aoP435930SemanticRails").length??0,
      oldRailHidden:Boolean(oldRail&&!visible(oldRail)),
      channels:oldRail?.dataset?.aoRitualChannels??null,
      postureVisible:visible(posture),
      postureSummaryVisible:visible(summary),
      postureSummaryHeight:summary?.getBoundingClientRect().height??0,
      postureText:summary?.textContent?.trim()??"",
      postureIcon:icon?.dataset?.aoAssetId??null,
      timelineVisible:visible(timeline),
      timelineControlCount:timeline?.querySelectorAll("button").length??0,
      viewportVisible:visible(viewport),
      visibleCards:cards.filter(visible).length,
      incarnationUnits:root?.querySelectorAll('[data-ao-incarnation="true"]').length??0,
      genericAngelusContext:root?.querySelectorAll('[data-ao-asset-id="ao-rich-angelus"]').length??0,
    };
  });
  assert.equal(angelusFolio.folioVisible,true,"Angelus Folio reader is not visible");
  assert.equal(angelusFolio.oldOverlay,0,"Angelus regained a duplicate semantic-overlay rail");
  assert.equal(angelusFolio.oldRailHidden,true,"Folio exposed its obsolete duplicate ritual rail");
  assert.equal(angelusFolio.channels,"posture,gesture","Source ritual rail lost its posture/gesture identities");
  assert.equal(angelusFolio.postureVisible,true,"Folio's source-owned posture note is hidden");
  assert.equal(angelusFolio.postureSummaryVisible,true,"Folio posture disclosure is inaccessible");
  assert.ok(angelusFolio.postureSummaryHeight>=32,"Folio posture disclosure collapsed");
  assert.match(angelusFolio.postureText,/Stand|Kneel|Debout|genoux/i,
    "Folio no longer explains the current prayer posture");
  assert.ok(["ao-live-stand","ao-live-kneel"].includes(angelusFolio.postureIcon),
    "Folio posture is not using the canonical bank icon");
  assert.equal(angelusFolio.timelineVisible,true,"Folio prayer timeline is not visible");
  assert.ok(angelusFolio.timelineControlCount>=3,"Folio timeline lost section navigation");
  assert.equal(angelusFolio.viewportVisible,true,"Folio prayer card viewport is hidden");
  assert.equal(angelusFolio.visibleCards,1,"Folio must expose exactly one active prayer card");
  assert.equal(angelusFolio.incarnationUnits,1,"Angelus lost the unique Incarnation source marker");
  assert.equal(angelusFolio.genericAngelusContext,0,"Angelus regained a generic devotional context card");
  await shot("03a-pray-angelus-rails");
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="family",null,{timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  await page.locator("#aoPray435930 [data-p435930-family='passion']").click();
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

  await page.locator("#aoPray435930 [data-p435930-station-step='1']").click();
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
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="family",null,{timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Exact-donor devotional rails: Adoration arrival is transient genuflection,
  // then yields to persistent silence without changing reader geometry.
  await page.locator("#aoPray435930 [data-p435930-family='eucharistic']").click();
  await page.locator("#aoPray435930 [data-p435930-own='pray.adoration']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="adoration",null,{timeout:5000});
  const adorationLanding=await page.evaluate(()=>({
    modes:[...document.querySelectorAll("#aoPray435930 [data-p435930-ador-mode]")].map(x=>x.getAttribute("data-p435930-ador-mode")),
    titles:[...document.querySelectorAll("#aoPray435930 [data-p435930-ador-mode] b")].map(x=>x.textContent?.trim()??""),
    publicRiteLink:document.querySelectorAll("#aoPray435930 .aoAdorationChooser [data-p435930-go-ben]").length,
    mountedBenediction:document.querySelectorAll("#aoPray435930 .aoP435930BenedictionReader").length,
    nightIsOptional:!!document.querySelector("#aoPray435930 .aoAdorationMethodsDisclosure [data-p435930-ador-mode='night']"),
    nightIsPrimary:!!document.querySelector("#aoPray435930 .aoAdorationPrimaryGrid [data-p435930-ador-mode='night']"),
    nightContext:document.querySelector("#aoPray435930 .aoAdorationMethodsDisclosure [data-p435930-ador-mode='night'] span")?.textContent?.trim()??"",
  }));
  // B29 added a separately source-owned home vigil under optional guided forms.
  // Preserve the original two primary presence choices and three optional
  // Eucharistic methods; never relabel private home prayer as public Benediction.
  assert.deepEqual(adorationLanding.modes,["visit","open","holy","four","treasury","night"],
    "Adoration landing must retain the five pre-B29 modes plus Fr Mateo's optional home vigil");
  assert.deepEqual(adorationLanding.titles,["Visit to the Blessed Sacrament","Silent Adoration","Guided Holy Hour","The Four Ends","Eucharistic Treasury","Night Adoration at Home · Fr Mateo"],
    "Adoration landing lost or renamed the B29 source-owned home vigil");
  assert.equal(adorationLanding.nightIsOptional,true,"Night vigil must remain in the optional methods disclosure");
  assert.equal(adorationLanding.nightIsPrimary,false,"Home vigil cannot displace Visit or Silent Adoration as the primary Eucharistic choices");
  assert.match(adorationLanding.nightContext,/at home.*without treating the image as the Blessed Sacrament/i,
    "Home vigil description must explicitly distinguish a Sacred Heart image from the Blessed Sacrament");
  // Fresh private Adoration must not invent a return to Benediction.
  // The explicit rite-to-prayer return and exposed-mode handoff are covered
  // by nonmass-d3-d6-e2e.mjs; retain those behavioral regressions.
  assert.equal(adorationLanding.publicRiteLink,0,"Fresh private Adoration incorrectly shows a public-rite return");
  assert.equal(adorationLanding.mountedBenediction,0,"Public Benediction ritual mounted inside private Adoration");
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
  // The new solemn Visit cue is intentionally modal. A human must first
  // acknowledge the reverence before touching the underlying seven-stage
  // timeline. Do not force-click through the modal or disable pointer capture.
  const arrivalCinema=page.locator("body > .aoDevotionalActionCinematic[data-ao-action-scene='VISIT.ARRIVAL']");
  await arrivalCinema.waitFor({state:"visible",timeout:5000});
  assert.equal(await arrivalCinema.getAttribute("aria-modal"),"true");
  await arrivalCinema.locator(".aoDevotionalActionContinue").click();
  assert.equal(await arrivalCinema.count(),0,"Visit acknowledgement did not return to the canonical timeline");
  await shot("03e2-pray-adoration-reader-after-reverence");

  // The guided Visit now uses a seven-stage source-owned timeline; the old
  // Continue button is intentionally hidden except on the final Finish card.
  const visitTimeline="#aoPray435930.open .aoP435930AdorationReader .aoDevoSequenceTimeline";
  await page.waitForSelector(visitTimeline,{state:"visible",timeout:12000});
  assert.equal(await page.locator(visitTimeline+" [data-ao-devo-chapter]").count(),7,
    "Visit to the Blessed Sacrament lost its seven named source-owned stages");
  await page.locator(visitTimeline+" [data-ao-devo-chapter='1']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930AdorationReader")?.dataset?.aoAdorationStep==="1",null,{timeout:5000});
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset==="ao-refined-silence",null,{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-channel='persistent']").count(),1,"Adoration did not settle into the persistent silence rail");
  await shot("03f-pray-adoration-silence");
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForSelector("#aoPray435930 [data-p435930-ador-mode='visit']",{state:"visible",timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="family",null,{timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Benediction rail follows the public rite rather than presenting one generic card.
  await page.locator("#aoPray435930 [data-p435930-family='eucharistic']").click();
  await page.locator("#aoPray435930 [data-p435930-own='pray.benediction']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="benediction",null,{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset='ao-rich-adoration']").count(),1,"Benediction Exposition rail lost its Eucharistic owner");
  // The seven-card dual-axis reader supersedes the hidden legacy Continue controls.
  // Test the actual visible timeline; do not bypass the user gesture contract.
  const benReader="#aoPray435930 .aoP435930BenedictionReader";
  const benTimeline=benReader+" .aoDevoSequenceTimeline";
  await page.waitForSelector(benTimeline,{state:"visible",timeout:5000});
  assert.equal(await page.locator(benTimeline+" .aoDevoStop").count(),7,
    "Benediction must expose seven source-owned public-rite cards");
  assert.equal(await page.locator(benReader+" .aoP435930GuideNav").isVisible(),false,
    "Competing legacy Continue controls must remain hidden");
  await page.locator(benTimeline+" [data-ao-devo-chapter='3']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930BenedictionReader")?.dataset?.aoBenedictionStep==="3",null,{timeout:5000});
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset==="ao-live-response",null,{timeout:3000});
  const benPrayer=await page.evaluate(()=>({
    left:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    right:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    activeStage:document.querySelector("#aoPray435930 .aoP435930BenedictionReader .aoDevoSequenceTimeline .aoDevoStop[aria-current='step']")?.textContent?.trim()??"",
    activeCount:document.querySelectorAll("#aoPray435930 .aoP435930BenedictionReader .aoDevoStop[aria-current='step']").length,
  }));
  assert.equal(benPrayer.left,"ao-live-response","Benediction versicle/collect lost its congregational response cue");
  assert.equal(benPrayer.right,"ao-live-response","Benediction stage rail no longer follows the response moment");
  assert.equal(benPrayer.activeCount,1,"Canonical Benediction timeline must expose exactly one current stage");
  assert.match(benPrayer.activeStage,/Versicle|collect|Verset|oraison/i,
    "Benediction timeline failed to label its actual versicle and collect stage");
  await page.locator(benTimeline+" [data-ao-devo-chapter='4']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930BenedictionReader")?.dataset?.aoBenedictionStep==="4",null,{timeout:5000});
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
  // A solemn blessing is a genuinely blocking, acknowledged prayer moment.
  // Continue in the cinematic before using the Prayer Back control.
  const benedictionCinema=page.locator("body > .aoDevotionalActionCinematic[data-ao-action-scene='BENEDICTION.BLESSING']");
  await benedictionCinema.waitFor({state:"visible",timeout:5000});
  assert.equal(await benedictionCinema.getAttribute("aria-modal"),"true");
  await benedictionCinema.locator(".aoDevotionalActionContinue").click();
  assert.equal(await benedictionCinema.count(),0,"Benediction cinematic failed to yield to the source reader");
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="family",null,{timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Confession remains private/read-only; only the exact in-confessional moment
  // owns the transient Sign-of-Cross rail cue.
  await page.locator("#aoPray435930 [data-p435930-family='penance']").click();
  await page.locator("#aoPray435930 [data-p435930-own='pray.confession']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="confession",null,{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-next]").isDisabled(),true,
    "Confession must require a preparation-path choice before continuing");
  await page.locator("#aoPray435930 [data-p435930-conf-path='regular']").click();
  // Consent to the regular preparation path is the one visible Continue.
  // Thereafter the canonical source cards own navigation, not hidden Next.
  await page.locator("#aoPray435930 [data-p435930-conf-next]").click();
  const confessionTimeline="#aoPray435930.open .aoP435930ConfessionReader .aoDevoSequenceTimeline";
  await page.waitForSelector(confessionTimeline,{state:"visible",timeout:12000});
  assert.equal(await page.locator(confessionTimeline+" [data-ao-devo-chapter]").count(),5,
    "Regular examination must retain five source-owned stages");
  await page.locator(confessionTimeline+" [data-ao-devo-chapter='4']").click();
  await page.waitForSelector("#aoPray435930 .aoP435930ConfessionReader[data-ao-confession-final='true']",{timeout:5000});
  // Only the final examination card reveals the real Continue to the rite.
  await page.locator("#aoPray435930 .aoP435930ConfessionReader [data-p435930-conf-next]").click();
  await page.waitForSelector("#aoPray435930 .aoP435930ConfessionReader[data-ao-confession-section='2'] "+".aoDevoSequenceTimeline",{timeout:5000});
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset==="ao-live-sign-cross",null,{timeout:3000});
  const confessionRail=await page.evaluate(()=>({
    left:document.querySelector("#aoPray435930 .aoP435930SemanticRail.left [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    right:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right [data-ao-pray-rail-asset]")?.dataset?.aoPrayRailAsset??null,
    stage:document.querySelector("#aoPray435930 .aoP435930SemanticRail.right small")?.textContent?.trim()??"",
  }));
  assert.equal(confessionRail.left,"ao-live-sign-cross","Confession in-confessional stage lost the donor Sign-of-Cross cue");
  assert.equal(confessionRail.right,"ao-rich-confession","Confession lost its persistent sacramental identity rail");
  assert.match(confessionRail.stage,/Before entering|Avant d.enter/,"Confession rail must describe preparation, not a simulated in-confessional experience");
  // Preserve the historical visual-acceptance artifact name used by donor comparison.
  await shot("03h-pray-confession-in-confessional");
  // Once the first rehearsal card is past, the transient cross cue disappears.
  await page.locator(confessionTimeline+" [data-ao-devo-chapter='1']").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930ConfessionReader .aoDevoCard")?.dataset?.aoDevoCard==="say-sins",null,{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 .aoP435930SemanticRail.left").count(),0,"Sign-of-Cross cue must not persist throughout rehearsal");
  assert.equal(await page.locator("#aoPray435930 [data-ao-confession-card='say-sins']").count(),1);
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="family",null,{timeout:5000});
  await page.locator("#aoPray435930 [data-p435930-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="home",null,{timeout:5000});

  // Rosary opens directly into the preserved canonical engine: no intermediate
  // configuration page, no second launcher, and no ritual-grid width collapse.
  await page.locator("#aoPray435930 [data-p435930-family='daily']").click();
  await page.locator("#aoPray435930 [data-p435930-own='pray.rosary']").click();
  await page.waitForFunction(()=>!document.getElementById("aoPray435930")?.classList?.contains("open"),null,{timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot.open",{state:"visible",timeout:10000});
  await page.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-today]",{state:"visible",timeout:10000});
  const standard=page.locator("#aoPrayerBookRoot [data-v38-rosary-form='standard']");
  if(await standard.count()){
    if(await standard.isVisible())await standard.click();
    else assert.equal(await standard.evaluate(el=>el.classList.contains("active")),true,
      "collapsed Rosary options must already select standard form");
  }
  await page.locator("#aoPrayerBookRoot [data-lab-rosary-today]").click();
  await page.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-next]",{state:"visible",timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot .lab-decade-bar",{state:"visible",timeout:5000});
  // Production Rosary starts prayer-first: recitation controls live in one collapsed disclosure.
  const activeRosaryOptions=page.locator("#aoPrayerBookRoot.open .aoRosaryActiveOptions");
  await activeRosaryOptions.waitFor({state:"visible",timeout:5000});
  assert.equal(await activeRosaryOptions.evaluate(el=>el.open),false,
    "Rosary options obstruct the opening prayer");
  assert.equal(await page.locator("#aoPrayerBookRoot .r29-head-recitation").isVisible(),false,
    "legacy recitation row competes with prayer while options are collapsed");
  await activeRosaryOptions.locator(":scope > summary").click();
  await page.waitForSelector("#aoPrayerBookRoot .r29-head-recitation[data-ao-exact-donor-recitation='v3.4.14']",
    {state:"visible",timeout:5000});
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
      recitationLeft:recRect?.left??0,
      phoneViewportWidth:window.innerWidth,
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
  // Recitation controls now live beneath the header in the expanded Prayer options.
  assert.ok(rosaryOpening.recitationLeft>=-1&&rosaryOpening.recitationRight<=rosaryOpening.phoneViewportWidth+1,
    "Rosary options controls exceed the phone viewport: "+JSON.stringify(rosaryOpening));

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
  // The Rosary "Today" entry chooses the mystery set by date (Thursday is
  // traditionally Joyful), not by an old hard-coded feast-day screenshot.
  assert.match(rosaryMysteryFx.headerTitle,/(Joyful|Sorrowful|Glorious) Mysteries|Mystères (joyeux|douloureux|glorieux)/i,
    "Rosary heading must identify the selected mystery set, not a single mystery");
  assert.notEqual(rosaryMysteryFx.headerTitle,rosaryMysteryFx.contemplationTitle,
    "Rosary header repeats the active contemplation mystery");
  const firstMysteries=[
    [/Joyful|joyeux/i,/Annunciation|Annonciation/i],
    [/Sorrowful|douloureux/i,/Agony|Agonie/i],
    [/Glorious|glorieux/i,/Resurrection|Résurrection/i],
  ];
  const first=firstMysteries.find(([set])=>set.test(rosaryMysteryFx.headerTitle));
  assert.ok(first,"Rosary mystery set has no canonical first mystery");
  assert.match(rosaryMysteryFx.contemplationTitle,first[1],"Rosary contemplation does not match the selected set's first mystery");
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
  assert.equal(rosaryReturn.modularView,"family","Rosary visible Back did not restore its immediate Daily Prayer parent");

  await page.evaluate(()=>globalThis.AO_PRAY_V435930?.open?.("pray.library",{returnContext:null}));
  await page.waitForSelector("#aoPray435930.open [data-p435930-lib-open='sacrament_act_of_contrition']",{timeout:10000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-lib-open]").count(),48,"PRAY Library no longer exposes the locked 48-prayer corpus");
  await page.locator("#aoPray435930 [data-p435930-lib-open='sacrament_act_of_contrition']").click();
  await page.waitForSelector("#aoPray435930 .aoP435930Prayer",{timeout:5000});
  await page.waitForFunction(()=>globalThis.AO_PRAY_COHERENCE_V435930?.audit?.().readerContract==="fluid-v1",null,{timeout:5000});
  await page.waitForFunction(()=>document.querySelectorAll("#aoPray435930 .aoP435930LibraryReader .aoLibraryLine[data-ao-devo-active='true']").length===1,null,{timeout:5000});
  const prayReader=await page.evaluate(()=>{
    const audit=globalThis.AO_PRAY_COHERENCE_V435930?.audit?.()??{};
    const flip=document.querySelector("#aoPray435930 .aoP435930Flip");
    const vern=flip?.querySelector("[data-face-v]");
    const latin=flip?.querySelector("[data-face-la]");
    return {
      ...audit,
      recitationButtons:document.querySelectorAll("#aoPray435930 [data-p435930-global-recitation]").length,
      prayerTitle:document.querySelector("#aoPray435930 .aoP435930Head h1")?.textContent?.trim()??"",
      duplicateHeadings:document.querySelectorAll("#aoPray435930 .aoP435930LibraryReader .aoDevoCardHead,.aoP435930LibraryReader .aoDevoCardTitle").length,
      libraryCards:document.querySelectorAll("#aoPray435930 .aoP435930LibraryReader .aoDevoCard").length,
      titleStops:document.querySelectorAll("#aoPray435930 .aoP435930LibraryReader .aoDevoStop").length,
      latinHidden:latin?.hidden??null,
      vernHidden:vern?.hidden??null,
      activeFocus:document.querySelectorAll("#aoPray435930 .aoP435930LibraryReader .aoLibraryLine[data-ao-devo-active='true']").length,
      legacyOpen:document.getElementById("aoPrayerBookRoot")?.classList?.contains("open")??false,
    };
  });
  assert.equal(prayReader.recitationControls,1,"PRAY reader lost its single recitation-mode control");
  assert.equal(prayReader.recitationButtons,2,"PRAY reader lost Individual/Group recitation choices");
  assert.equal(prayReader.translationPairs,1,"PRAY library prayer lost its Latin/vernacular pair");
  assert.equal(prayReader.stackedTranslationPairs,0,"PRAY stacked Latin and vernacular instead of one-language-at-a-time presentation");
  assert.ok(prayReader.fluidUnits>0,"PRAY reader lost fluid focus units");
  assert.equal(prayReader.readerContract,"fluid-v1");
  assert.equal(prayReader.libraryCards,1,"Prayer Library no longer presents a single named prayer card");
  assert.equal(prayReader.titleStops,0,"A single prayer must not render an empty one-of-one chapter timeline");
  assert.equal(prayReader.duplicateHeadings,0,"A single prayer must use the existing page H1, not a repeated card title");
  assert.equal(prayReader.activeFocus,1,"PRAY card reader does not expose exactly one active paragraph");
  assert.ok(prayReader.prayerTitle.length>0,"PRAY single page H1 title is blank");
  assert.notEqual(prayReader.latinHidden,prayReader.vernHidden,"PRAY translation pair does not expose exactly one visible language");
  assert.equal(prayReader.legacyOpen,false,"legacy Prayer Book reopened inside prayer reading");
  await shot("03b-pray-library-prayer");

  // Later approved donor surfaces: completed bilingual V4 Novenas plus the v38.1 traditional PRAY modules.
  await page.evaluate(()=>globalThis.AO_PRAY_V435930?.open?.("pray.novenas",{returnContext:null}));
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="novenas",null,{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-n1-home]").count(),1,"Novenas lost explicit global Home");
  assert.equal(await page.locator("#aoPray435930 [data-n1-close]").count(),0,"Novenas regressed to ambiguous Close");
  assert.equal(await page.locator("#aoPray435930 [data-n1-select]").count(),16,"Novenas overview must preserve all sixteen canonical bilingual novenas");
  // Only the active Institute overview section owns its two nine-day forms;
  // dormant donor surfaces elsewhere in the prayer host are not additional novenas.
  const instituteNineDayIds=await page.locator("#aoPray435930 [data-n1-institute-supplement] [data-n1-supplement]")
    .evaluateAll(nodes=>nodes.map(node=>node.dataset.n1Supplement).sort());
  assert.deepEqual(instituteNineDayIds,["divine_infant_king","icksp_immaculate_conception"],
    "Novenas overview must separately expose exactly the two Institute repeat-form nine-day novenas");
  assert.equal(await page.locator("#aoPray435930 [data-n1-therese-weekly]").count(),1,"Novenas overview must separately expose the perpetual Tuesday St Therese devotion");
  await shot("03f-pray-novenas");
  await page.locator("#aoPray435930 [data-n1-select='st_michael']").click();
  // The current quiet novena detail folio presents its start authority in
  // aoN1ContextLine, not in the old conditional overview/calendar banner.
  // Verify the source's "suggested" status even after the feast has passed.
  await page.waitForSelector("#aoPray435930 .aoN1DetailFolio .aoN1ContextLine",
    {state:"visible",timeout:5000});
  const stMichaelCalendarText=await page.locator(
    "#aoPray435930 .aoN1DetailFolio .aoN1ContextLine").innerText();
  assert.match(stMichaelCalendarText,/Suggested start|Début suggéré/,
    "St Michael feast-aligned novena start misrepresented as a historical rule");
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
    assert.equal(await page.locator("#aoPray435930 [data-tp381-home]").count(),1,route+" lost explicit global Home");
    assert.equal(await page.locator("#aoPray435930 [data-tp381-close]").count(),0,route+" regressed to ambiguous Close");
    assert.equal(await page.locator("#aoPray435930 .aoTP381Hero").count(),0,route+" regained a non-donor hero card");
    if(route==="pray.morning_evening"){
      // The old introduction is retained as optional guidance after the prayer,
      // never restored as a first-screen text block.
      const details=page.locator("#aoPray435930 [data-ao-daily-options]");
      assert.equal(await details.count(),1,"Morning guidance disclosure missing");
      assert.equal(await details.evaluate(el=>el.open),false,"Morning guide must not obscure opening prayer");
      assert.match(await details.textContent(),/traditional daily rule|règle quotidienne traditionnelle/i,
        "Original prayer-context guidance was discarded rather than relocated");
    }else if(route==="pray.sacred_hymns"){
      const guide=page.locator("#aoPray435930 [data-ao-hymn-options]");
      assert.equal(await guide.count(),1,"Hymn provenance and language guidance disappeared");
      assert.equal(await guide.evaluate(el=>el.open),false,"Hymn options obscure the opening prayer");
      assert.match(await guide.textContent(),/Historical hymn texts with identified sources|Hymnes historiques avec sources identifiées/i,
        "Historic hymn source introduction was discarded rather than relocated");
      assert.equal(await page.locator("#aoPray435930 .aoDevoSequenceTimeline .aoDevoStop").count(),11,
        "Three original hymns plus eight historically sourced ICRSP hymns must retain named navigation");
      assert.equal(await page.locator("#aoPray435930 .aoDevoCardScroll .aoTP381TextParagraph").count()>0,true,
        "Hymn reader has no verse-level focus text");
    }else if(["pray.meal_prayers","pray.holy_name_litany"].includes(route)){
      // These readers preserve the sourced donor context as an unobtrusive
      // disclosure beneath the active prayer, not as an opening-page block.
      const selector=route==="pray.meal_prayers"?"[data-ao-meal-options]":"[data-ao-holy-name-options]";
      const guide=page.locator("#aoPray435930 "+selector);
      assert.equal(await guide.count(),1,route+" lost its source-context guide");
      assert.equal(await guide.evaluate(el=>el.open),false,route+" guide obscures the opening prayer");
      const context=(await guide.textContent()).trim();
      assert.match(context,route==="pray.meal_prayers"?/ordinary table prayers|prières ordinaires des repas/i
        :/Historical approved Roman form|Forme romaine historique/i,
        route+" original prayer-context guidance was lost");
      assert.equal(await page.locator("#aoPray435930 .aoDevoSequenceTimeline .aoDevoStop").count(),
        route==="pray.meal_prayers"?2:7,route+" lost canonical named-card navigation");
    }else{
      assert.equal(await page.locator("#aoPray435930 .aoTP381Intro").count(),1,
        route+" lost its v38.1 donor introduction");
    }
    if(route==="pray.morning_evening"){
       assert.equal(await page.locator("#aoPray435930 [data-ao-pray-guide-card]").count(),1,
         "Morning/Evening must open as a single guided prayer card");
       const bookFirst=await page.locator("#aoPray435930 .aoDailyBookSelector").count()===1;
       if(bookFirst){
         assert.equal(await page.locator("#aoPray435930 .aoDailyBookEditions [data-tp381-personal-action='edition']").count(),2,
           "F05 must expose source-owned St Pius X 1905/1913 editions above the prayer");
         assert.equal(await page.locator("#aoPray435930 .aoDailyBookPillPending").count(),3,
           "Lasance, Moran and Blessed Be God remain partial, never selectable complete editions");
         await shot("03g-pray-morning-guided");
         const details=page.locator("#aoPray435930 [data-ao-daily-options]");
         await details.locator("summary").click();
         assert.equal(await details.evaluate(el=>el.open),true,
           "Secondary contextual options must remain accessible");
         const layout=page.locator("#aoPray435930 .aoDailyReadingOptions");
         assert.equal(await layout.count(),1,"F05 must preserve secondary Reading layout");
         await layout.locator("summary").click();
         await page.locator("#aoPray435930 [data-tp381-daily-presentation='list']").click();
       }else{
         assert.equal(await page.locator("#aoPray435930 [data-tp381-daily-mode='list']").count(),1,
           "Legacy Morning/Evening must offer a direct named-prayer chooser");
         assert.match(await page.locator("#aoPray435930 [data-tp381-daily-mode='list']").innerText(),
           /Choose a prayer|Choisir une prière/);
         await shot("03g-pray-morning-guided");
         const details=page.locator("#aoPray435930 [data-ao-daily-options]");
         await details.locator("summary").click();
         assert.equal(await details.evaluate(el=>el.open),true,
           "Secondary options cannot be opened from the finished prayer card");
         await page.locator("#aoPray435930 [data-tp381-daily-mode='list']").click();
       }
      const rowGeometry=await page.evaluate(()=>{
        const rows=[...document.querySelectorAll("#aoPray435930 .aoDailyPrayerCatalog .aoDailyCatalogRows button")];
        const visible=rows.filter(row=>row.getClientRects().length>0);
        const titlesPresent=visible.length>0&&visible.every(row=>Boolean(row.querySelector("b")?.textContent?.trim()));
        const subtitlesSeparate=visible.every(row=>{
          const title=row.querySelector("b"),note=row.querySelector("small");
          // Named prayers do not require a subtitle. When supplied, keep it below the title.
          return !note||!title||note.getBoundingClientRect().top>=title.getBoundingClientRect().bottom+2;
        });
        return {count:visible.length,titlesPresent,subtitlesSeparate};
      });
      assert.ok(rowGeometry.count>0&&rowGeometry.titlesPresent&&rowGeometry.subtitlesSeparate,
        "Morning/Evening named prayer catalog lost readable titles or overlaps source subtitles");
    }
    await shot(name);
  }

  // Good Death is ordinary private prayer, not the urgent bedside Sacraments
  // companion. Preserve one original prayer at a time AND visible priest-first
  // access for someone who may be dying now.
  await page.evaluate(()=>globalThis.AO_PRAY_V435930?.open?.("pray.good_death",{returnContext:null}));
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")
    ?.dataset?.aoTraditionalPrayRoute==="pray.good_death",null,{timeout:7000});
  assert.equal(await page.locator("#aoPray435930 .aoDevoSequenceTimeline .aoDevoStop").count(),9,
    "Good Death lost its nine canonical prayer choices");
  assert.equal(await page.locator("#aoPray435930 .aoDevoCard").getAttribute("data-ao-devo-card"),
    "good-death-devotion_litany_st_joseph","Good Death must open in the St Joseph prayer");
  assert.equal(await page.locator("#aoPray435930 [data-ao-good-death-options]").evaluate(el=>el.open),false,
    "Good Death source context should not obscure actual prayer text");
  assert.equal(await page.locator("#aoPray435930 [data-tp381-route='pray.dying_companion']").isVisible(),true,
    "The urgent priest-first bedside exit must remain visible above optional private prayers");
  await shot("03i2-pray-good-death");
  await page.locator("#aoPray435930 [data-tp381-route='pray.dying_companion']").evaluate(el=>el.click());
  await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")
    ?.dataset?.aoTraditionalPrayRoute==="pray.dying_companion",null,{timeout:7000});
  assert.equal(await page.locator("#aoPray435930 .aoDevoSequenceTimeline .aoDevoStop").count(),3,
    "Dying Companion must have one timeline for three canonical pastoral stages");
  assert.equal(await page.locator("#aoPray435930 .aoDevoCard").getAttribute("data-ao-devo-card"),
    "dying-now","Urgent bedside guide must start by calling a priest");
  assert.match(await page.locator("#aoPray435930 .aoDevoCardScroll").innerText(),
    /Call a priest now|Appelez un prêtre maintenant/,
    "Bedside guide has buried priest-first pastoral action");
  assert.equal(await page.locator("#aoPray435930 [data-ao-dying-companion-options]").evaluate(el=>el.open),false,
    "Pastoral explanations must not displace urgent priest-first guidance");
  await shot("03i3-pray-dying-companion-priest-first");
  // Leaving the full-screen Prayer owner must use its native Home control.
  // Attempting to click the app dock through an open modal is not a supported
  // navigation path and is correctly blocked by the backdrop.
  await page.locator("#aoPray435930 [data-tp381-home]").click();
  await page.waitForFunction(()=>!document.querySelector("#aoPray435930")?.classList?.contains("open"),null,{timeout:7000});


  await page.locator("[data-ao-app-surface='learn']").click();
  await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
  await waitForFxSettled();
  await assertHomeHidden("Learn");
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-back]").count(),1,"Formation root lost hierarchical Back");
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-home]").count(),1,"Formation root lost explicit global Home");
  const learnParity=await page.evaluate(()=>({
    heroTitles:document.querySelectorAll("#ao-learn-modular-root .aoLearnModHero h1").length,
    heroTitle:document.querySelector("#ao-learn-modular-root .aoLearnModHero h1")?.textContent?.trim()??"",
    intro:document.querySelector("#ao-learn-modular-root .aoLearnModHero p")?.textContent?.trim()??"",
    context:document.querySelector("#ao-learn-modular-root .aoLearnModContext")?.textContent?.trim()??"",
    families:[...document.querySelectorAll("#ao-learn-modular-root [data-ao-learn-family]")].map(x=>x.dataset.aoLearnFamily),
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
  assert.deepEqual(learnParity.families,["foundations","spiritual-moral","liturgy-tradition","sacraments-life","questions","apologetics","church-crisis","latin","reference"],"Formation learning-intent doors diverged");
  assert.deepEqual(learnParity.modules,[],"Formation landing regressed to exposing all module launchers at once");
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-module='today.saint']").count(),0,"Saint of the Day remained duplicated in Learn");
  assert.deepEqual(learnParity.featured,[],"Featured module cards should only appear inside a selected Formation family");
  assert.equal(learnParity.donorNav,0,"historical V37 navigation leaked into modular Learn");
  assert.equal(learnParity.sourcesUtility,0,"Sources incorrectly resurfaced as a Learn launcher");
  assert.equal(learnParity.calendarDashboard,0,"Calendar dashboard duplicated inside Learn");
  assert.ok(learnParity.overflow<=1,"Learn has horizontal overflow on 390px phone geometry");
  assert.equal(learnParity.cards.length,9,"Formation landing should show nine subject doors");
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-dossier-review]").count(),0,
    "Preliminary study collections belong in their respective subject areas, not the root");
  await page.locator("#ao-learn-modular-root [data-ao-learn-questions]").click();
  await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.().family==="questions",null,{timeout:5000});
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-module='learn.sexual_ethics']").count(),1,
    "Moral Questions lost its canonical published Sexual Ethics owner");
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-dossier-review]").count(),0,
    "Moral Questions must not contain unrelated Apologetics or Church Crisis.");
  await page.locator("#ao-learn-modular-root [data-ao-learn-back]").click();
  await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.().family,null,{timeout:5000});
  for(const [family,corpus] of [["apologetics","apologetics"],["church-crisis","crisis"]]){
    await page.locator('#ao-learn-modular-root [data-ao-learn-family="'+family+'"]').click();
    await page.waitForFunction(expected=>globalThis.AO_LEARN_APP_V1?.status?.().family===expected,
      family,{timeout:5000});
    const previews=page.locator("#ao-learn-modular-root [data-ao-learn-dossier-review]");
    assert.equal(await previews.count(),1,family+": must have exactly its own preview");
    assert.equal(await previews.first().getAttribute("data-ao-learn-dossier-review"),corpus);
    assert.match(await page.locator("#ao-learn-modular-root .aoLearnDossierReviewNote").textContent(),/not certified teaching/,
      "Drafts must be clearly labelled");
    await page.locator("#ao-learn-modular-root [data-ao-learn-back]").click();
    await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.().family,null,{timeout:5000});
  }
  // Nine family cards are now single-column, source-preserving phone rows:
  // confirm width and readable tap territory instead of enforcing obsolete tiles.
  for(const card of learnParity.cards){
    assert.ok(card.w>=340,"Formation subject row lost phone reading width: "+JSON.stringify(learnParity.cards));
    assert.ok(card.h>=100,"Formation subject row collapsed below full-width readability threshold: "+JSON.stringify(learnParity.cards));
  }
  await page.locator("#ao-learn-modular-root [data-ao-learn-family='spiritual-moral']").click();
  await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.().family==="spiritual-moral",null,{timeout:5000});
  const spiritualIcon=page.locator("#ao-learn-modular-root [data-ao-learn-card='learn.spiritual_life'] .aoLearnModIcon[data-ao-asset-id='ao-refined-spiritual-life']");
  assert.equal(await spiritualIcon.count(),1,"Spiritual Life is missing its canonical formation icon");
  await page.locator("#ao-learn-modular-root [data-ao-learn-back]").click();
  await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.().family,null,{timeout:5000});
  await page.locator("#ao-learn-modular-root [data-ao-learn-family='foundations']").click();
  await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.().family==="foundations",null,{timeout:5000});
  const catechismIcon=page.locator("#ao-learn-modular-root [data-ao-learn-card='learn.catechism'] .aoLearnModIcon[data-ao-asset-id='ao-module-catechism']");
  assert.equal(await catechismIcon.count(),1,"Traditional Catechism is missing its canonical icon");
  assert.equal(await catechismIcon.getAttribute("data-ao-asset-renderer"),"mask","Traditional Catechism did not use the canonical file-backed mask renderer");
  const catechismMask=await catechismIcon.evaluate(el=>getComputedStyle(el).webkitMaskImage||getComputedStyle(el).maskImage||"");
  assert.match(catechismMask,/ao-module-catechism\.png/,"Traditional Catechism canonical mask did not resolve to the frozen PNG");
  await page.locator("#ao-learn-modular-root [data-ao-learn-back]").click();
  await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.().family,null,{timeout:5000});
  // Formation repaints its hero when returning from a family. Presentation FX
  // decorates that newly-created node on the next scheduled frame/scan.
  await page.waitForFunction(()=>document.querySelector("#ao-learn-modular-root .aoLearnModHero")?.dataset?.aoPresentationFxHero==="modular-presentation-fx-v3",null,{timeout:5000});
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
  const openLearnFamily=async id=>{
    const current=await page.evaluate(()=>globalThis.AO_LEARN_APP_V1?.status?.().family??null);
    if(current===id)return;
    if(current){
      await page.locator("#ao-learn-modular-root [data-ao-learn-back]").click();
      await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.().family,null,{timeout:5000});
    }
    await page.locator(`#ao-learn-modular-root [data-ao-learn-family="${id}"]`).click();
    await page.waitForFunction(expected=>globalThis.AO_LEARN_APP_V1?.status?.().family===expected,id,{timeout:5000});
  };

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
    const family=route==="learn.scapular"?"spiritual-moral":route==="learn.serve_mass.responses"?"liturgy-tradition":"sacraments-life";
    await openLearnFamily(family);
    const opened=await page.evaluate(route=>globalThis.AO_LEARN_APP_V1?.openModule?.(route),route);
    assert.equal(opened,true,route+" could not be opened from modular Learn");
    await page.waitForFunction(route=>globalThis.AO_TRADITIONAL_LEARN_V381?.status?.().open===true&&globalThis.AO_TRADITIONAL_LEARN_V381?.status?.().route===route,route,{timeout:5000});
    assert.equal(await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-back]").count(),1,route+" lost donor Back");
    assert.equal(await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-home]").count(),1,route+" lost explicit global Home");
    assert.equal(await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-close]").count(),0,route+" regressed to ambiguous Close");
    assert.equal((await page.locator("#ao-learn-traditional-root .aoLearnTradTop small").textContent())?.trim(),"Formation",route+" lost the shared Formation shell identity");
    const guideDisclosure=await page.evaluate(()=>{
      const cards=[...document.querySelectorAll("#ao-learn-traditional-root details.aoLearnTradCard")];
      return {cards:cards.length,open:cards.filter(x=>x.open).length};
    });
    if(guideDisclosure.cards>0)assert.equal(guideDisclosure.open,1,route+" should expose exactly one guide section by default");

    await shot(name);
    await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-back]").click();
    await page.waitForFunction(()=>!document.getElementById("ao-learn-traditional-root")&&globalThis.AO_LEARN_APP_V1?.status?.().child===null,null,{timeout:5000});
    await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:5000});
  }

  // Seasonal Catholic Practice remains only a compatibility route into the single Liturgical Year surface.
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-module='learn.seasonal_rites']").count(),0,"duplicate Seasonal Catholic Practice launcher returned");
  const seasonalAlias=await page.evaluate(()=>globalThis.AO_MODULES?.open?.("learn.seasonal_rites",{returnContext:{surface:"learn"}}));
  assert.equal(seasonalAlias?.ok,true,"Seasonal compatibility route failed");
  await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:5000});
  // Standalone Calendar Year now owns the interactive clock; the older
  // circular progress ring survives only in its distinct embedded context.
  await page.waitForSelector("#ao-calendar-modular-root .aoClockDial",{state:"visible",timeout:10000});
  assert.equal(await page.locator("#ao-calendar-modular-root .aoClockDial").count(),1,
    "Seasonal compatibility route did not reach the canonical Liturgical Clock");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV2Ring").count(),0,
    "Standalone Year regressed to the retired progress ring");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalV384Companion").count(),0,"retired duplicate Traditional Liturgical Year companion returned");
  assert.equal(await page.locator("#ao-calendar-modular-root .v384SectionLabel").count(),0,"retired v38.4 full-year index leaked into the active Calendar");
  await shot("04f-seasonal-year-alias");
  await page.locator("[data-ao-app-surface='learn']").click();
  await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:5000});

  // Settings is a contextual destination, not the sixth permanent ribbon slot.
  // Enter it through the same shell navigation method used by actual Settings launchers.
  await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
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
  assert.deepEqual(settingsParity.headings,["APP & UPDATES","APP","MASS & PRAYER","DATA"],"Settings must expose installed-version controls before general preferences");
  for(const route of ["/settings/general","/settings/accessibility","/settings/language-reading","/settings/mass","/settings/local-customs","/settings/prayer","/settings/privacy-data","/settings/about-sources"]){
    assert.ok(settingsParity.routes.includes(route),route+" missing from restored Settings landing");
  }
  assert.equal(settingsParity.sourcesLaunchers,1,"Settings must expose exactly one Sources & About destination");
  assert.equal(settingsParity.routes.filter(x=>x==="/settings/about-sources").length,1,
    "Installed-version action must remain a single source/settings route");
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
    provenanceLabels:(document.querySelector("#ao-settings-modular-root .aoSetSource:last-of-type p")?.textContent?.trim()||"").split(/\s*·\s*/).filter(Boolean),
    aboutRows:document.querySelectorAll("#ao-settings-modular-root .aoSetSection:last-child .aoSetRow").length,
    version:document.querySelector("#ao-settings-modular-root [data-settings-app-version]")?.textContent?.trim()??"",
    canonical:globalThis.AO_RELEASE_AUTHORITY_V4359?.version||document.documentElement.dataset.aoRelease||"",
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
  }));
  assert.ok(settingsAbout.sourceGroups>=9,"Sources & About lost one of the nine retained source families, including programme authorities");
  assert.equal(settingsAbout.provenanceLabels.length,6,"Sources & About lost the six source-methodology labels");
  assert.ok(settingsAbout.provenanceLabels.some(x=>/1962/.test(x)),"1962 normative source distinction lost");
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
  // The wide two-column Prayer regression also targets the supported grouped
  // rollback. Default nine-tile mosaic desktop/phone acceptance is separate.
  await wide.goto("http://127.0.0.1:4186/index.html?aoPrayerPilot=0",
    {waitUntil:"domcontentloaded",timeout:90000});
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

  await wide.locator("#aoPray435930 [data-p435930-family='daily']").click();
  await wide.locator("#aoPray435930 [data-p435930-own='pray.rosary']").click();
  await wide.waitForFunction(()=>!document.getElementById("aoPray435930")?.classList?.contains("open"),null,{timeout:5000});
  await wide.waitForSelector("#aoPrayerBookRoot.open",{state:"visible",timeout:10000});
  await wide.waitForSelector("#aoPrayerBookRoot [data-lab-rosary-today]",{state:"visible",timeout:10000});
  const wideStandard=wide.locator("#aoPrayerBookRoot [data-v38-rosary-form='standard']");
  if(await wideStandard.count()){
    if(await wideStandard.isVisible())await wideStandard.click();
    else assert.equal(await wideStandard.evaluate(el=>el.classList.contains("active")),true,
      "wide Rosary options must retain the standard default while collapsed");
  }
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
