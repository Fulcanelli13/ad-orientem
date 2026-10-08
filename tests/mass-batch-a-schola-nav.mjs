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
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4190,"127.0.0.1",ok)});

let browser,page;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB"});
  page=await context.newPage();
  page.setDefaultTimeout(9000); // fail fast with actionable diagnostics instead of repeated 30-second locator hangs
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  await page.goto("http://127.0.0.1:4190/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true,null,{timeout:30000});

  const setup=await page.evaluate(async()=>{
    const t=(lat,en)=>({lat,en});
    const proper={
      sourcePath:"Sancti/10-07",
      name:"Our Lady of the Rosary",
      color:"white",
      introit:t("Gaudeámus omnes in Dómino","Let us all rejoice in the Lord"),
      collects:[t("Deus, cuius Unigénitus","O God, whose only-begotten Son")],
      epistle:t("Ab inítio et ante sǽcula","From the beginning and before the world"),
      gradual:t("Propter veritátem","Because of truth"),
      sequence:{lat:"",en:""},
      gospel:t("In illo témpore: Missus est Angelus","At that time the Angel was sent"),
      offertory:t("In me grátia omnis viæ","In me is all grace of the way"),
      secrets:[t("Fac nos, quǽsumus, Dómine","Grant us, we beseech Thee, O Lord")],
      preface:t("Vere dignum et iustum est","It is truly meet and just"),
      communion:t("Floréte, flores","Send forth flowers"),
      postcommunions:[t("Sacratíssimæ Genetrícis tuæ","May the prayers of Thy most holy Mother")],
    };
    let route="live";
    globalThis.__AO_MASS_VISUAL_LEGACY_STARTS=0;
    globalThis.AO_SEQUENCE_BRIDGE_V23={
      startLive(){globalThis.__AO_MASS_VISUAL_LEGACY_STARTS+=1;},
      getActive(){return null;},
      getAssemblyStatus(){return null;},
    };
    globalThis.AO_SEQUENCE_BRIDGE_V22=null;
    globalThis.AO_RUNTIME_V8={
      store:{
        getState:()=>({
          route,selectedDate:"2026-10-04",language:"en",
          settings:{
            massForm:"mc-incense",followMode:"vox",massPostureProfile:"TRADITIONAL_WALSH",
            massGestureProfile:"TRADITIONAL",faithfulCommunion:true,textMode:"oriented",
          },
        }),
        subscribe:()=>()=>{},
        dispatch:(action)=>{route=action?.route??route;return action;},
      },
    };
    globalThis.AO_CELEBRATION_ARCH_V1={
      date:"2026-10-04",celebrationForm:"mc-incense",followMode:"vox",
      actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Our Lady of the Rosary"},
    };
    globalThis.AO_CELEBRATION_API={
      getResolvedMass:()=>({
        canStart:true,date:"2026-10-04",
        calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
        requestedCelebrationId:"holy_rosary",celebrationId:"holy_rosary",celebrationType:"VOTIVE",
        actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Our Lady of the Rosary"},
        proper,properSource:"Sancti/10-07",insertedRites:[],conditions:["GLORIA_APPOINTED","CREDO_APPOINTED","AGNUS_DEI_PUBLIC","LAST_GOSPEL_PRESENT"],rubricSources:["RG60"],
      }),
    };
    const mod=await import("/src/mass/browser-entry.js?mass-visual-audit=1");
    const controller=mod.createBrowserMassController();
    const prepared=await controller.enter();
    return {schema:prepared.schema,form:prepared.session.resolvedMass.form,mode:prepared.readerPreferences.mode};
  });

  assert.equal(setup.form,"MISSA_CANTATA_INCENSE");
  assert.equal(setup.mode,"LIVE");
  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"visible",timeout:30000});
  // Diagnostic ownership: distinguish a detached Mass overlay from a slow locator.
  await page.evaluate(()=>{
    const id="ao-r17-native-reader-preview";
    const root=document.getElementById(id);
    globalThis.__AO_MASS_VISUAL_REMOVAL_TRACE=[];
    if(root){
      const remove=root.remove.bind(root);
      root.remove=function(){globalThis.__AO_MASS_VISUAL_REMOVAL_TRACE.push({reason:"explicit remove",stack:new Error().stack,at:Date.now()});return remove()};
      new MutationObserver(()=>{
        if(!document.getElementById(id)){
          globalThis.__AO_MASS_VISUAL_REMOVAL_TRACE.push({reason:"root detached",stack:"MutationObserver",at:Date.now()});
        }
      }).observe(document.body,{childList:true,subtree:true});
    }
  });

  const opening=await page.evaluate(()=>({
    uiOwner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
    liturgicalColour:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.dataset?.liturgicalColour??null,
    liturgicalSource:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.dataset?.liturgicalSource??null,
    liturgicalBackground:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.style?.getPropertyValue("--ao-mass-bg")??null,
    legacyStarts:globalThis.__AO_MASS_VISUAL_LEGACY_STARTS??0,
    modeButtons:document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-mode]").length,
    livePressed:document.querySelector("#ao-r17-native-reader-preview [data-reader-mode='LIVE']")?.getAttribute("aria-pressed")??null,
    modeSwitchLocked:[...document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-mode]")].every(x=>x.disabled),
    stateRibbon:Boolean(document.querySelector("#ao-r17-native-reader-preview .ao-state-ribbon")),
    leftRail:Boolean(document.querySelector("#ao-r17-native-reader-preview .ao-rail-left")),
    rightRail:Boolean(document.querySelector("#ao-r17-native-reader-preview .ao-rail-right")),
    title:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.textContent?.trim()??"",
    titleHidden:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.hidden??false,
    body:document.querySelector("#ao-r17-native-reader-preview [data-role='paragraphs']")?.textContent?.trim()??"",
    scholaDock:document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock")?.dataset?.active??null,
    scholaInRightRail:Boolean(document.querySelector("#ao-r17-native-reader-preview .ao-rail-right [data-channel='schola']")),
    stageLeft:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.leftRail??null,
    stageRight:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.rightRail??null,
    focusedParagraphs:document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-active='true']").length,
    homeButton:Boolean(document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")),
    preferencesButton:Boolean(document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences]")),
    appSettingsButton:Boolean(document.querySelector("#ao-r17-native-reader-preview [data-reader-parameters]")),
    homeControlText:document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")?.textContent?.trim()??"",
    preferencesControlText:document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences]")?.textContent?.trim()??"",
    homeControlDonorIcon:document.querySelector("#ao-r17-native-reader-preview [data-reader-home] [data-ao-donor-icon='home']")?.dataset?.aoDonorIcon??null,
    preferencesControlDonorIcon:document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences] [data-ao-donor-icon='preferences']")?.dataset?.aoDonorIcon??null,
    homeControlPath:document.querySelector("#ao-r17-native-reader-preview [data-reader-home] svg path")?.getAttribute("d")??"",
    preferencesCircleCount:document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-preferences] svg circle").length,
    preferencesPath:document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences] svg path")?.getAttribute("d")??"",
    homeControlRect:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")?.getBoundingClientRect();return x?{width:x.width,height:x.height}:null})(),
    preferencesControlRect:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences]")?.getBoundingClientRect();return x?{width:x.width,height:x.height}:null})(),
    stateLabels:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-state-kicker")].map(x=>x.textContent?.trim()??""),
    openingPosture:document.querySelector("#ao-r17-native-reader-preview [data-role='posture']")?.textContent?.trim()??"",
    openingPostureIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='posture-top']")?.hidden??null,
    guideLabel:document.querySelector("#ao-r17-native-reader-preview [data-role='guide-short']")?.textContent?.trim()??"",
    preferencesOpen:document.querySelector("#ao-r17-native-reader-preview [data-role='mass-preferences']")?.dataset?.open??null,
    floatingClose:Boolean(document.querySelector("#ao-r17-native-reader-preview [aria-label='Close Mass reader']")),
    sectionJumpDisabled:document.querySelector("#ao-r17-native-reader-preview [data-role='section-jump']")?.disabled??null,
    sectionButtonCount:document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-section]").length,
    totalCards:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.totalCards??null,
    sourceTotalCards:globalThis.AO_R17_NATIVE_READER_PREVIEW?.sourceModel?.totalCards??null,
    structureOwner:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.structureOwner??null,
    sourceStructureOwner:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.sourceStructureOwner??null,
    historicalIdentityClaim:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.historicalV183IdentityClaim??null,
    shellRect:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview .ao-reader-shell")?.getBoundingClientRect();return x?{width:x.width,height:x.height}:null})(),
  }));
  assert.equal(opening.uiOwner,"R17_NATIVE_PRODUCTION");
  assert.equal(opening.legacyStarts,0);
  assert.equal(opening.modeButtons,3);
  assert.equal(opening.livePressed,"true");
  assert.equal(opening.stateRibbon,true);
  assert.equal(opening.leftRail,true);
  assert.equal(opening.rightRail,true);
  assert.ok(opening.title.length>0);
  assert.equal(opening.titleHidden,true,"duplicate card title remained visible under the state ribbon");
  assert.ok(opening.body.length>0);
  assert.equal(opening.scholaInRightRail,false,"Schola remained trapped in the narrow right rail");
  assert.equal(opening.scholaDock,"true","active Schola did not move to the readable dedicated dock");
  assert.equal(opening.liturgicalColour,"WHITE","selected Rosary votive Proper failed to supply the Mass liturgical background");
  assert.equal(opening.liturgicalSource,"SELECTED_PROPER","Mass colour came from the day fallback instead of selected Proper");
  assert.equal(opening.liturgicalBackground,"#191815","Mass reader ignored the white-themed dark palette");
  assert.equal(opening.homeButton,true,"LIVE first ribbon lost Home control");
  assert.equal(opening.preferencesButton,true,"v1.80 first ribbon lost Mass preferences control");
  assert.equal(opening.appSettingsButton,true,"Mass preferences lost its app-settings handoff");
  assert.equal(opening.homeControlText,"","Home control retained obsolete text after canonical icon externalization");
  assert.equal(opening.preferencesControlText,"","Mass preferences control retained obsolete text after canonical icon externalization");
  assert.equal(opening.homeControlDonorIcon,"home","Mass Home control is not the exact v1.80 donor icon owner");
  assert.equal(opening.preferencesControlDonorIcon,"preferences","Mass preferences control is not the exact v1.80 donor icon owner");
  assert.equal(opening.homeControlPath,"M3.5 10.7 12 3.8l8.5 6.9v9.1h-5.4v-5.7H8.9v5.7H3.5z",
    "Mass Home icon drifted from the v1.80 house glyph");
  assert.equal(opening.preferencesCircleCount,3,"Mass preferences icon lost one of the three v1.80 slider knobs");
  assert.equal(opening.preferencesPath,"M4 7h10M18 7h2M4 17h2M10 17h10M4 12h5M13 12h7",
    "Mass preferences icon drifted from the v1.80 sliders glyph");
  assert.ok(opening.homeControlRect?.width>=44&&opening.homeControlRect?.height>=44,"Home control lost a usable phone touch target");
  assert.ok(opening.preferencesControlRect?.width>=44&&opening.preferencesControlRect?.height>=44,"Mass preferences control lost a usable phone touch target");
  assert.deepEqual(opening.stateLabels,["YOU","PRIEST"],"persistent state ribbon is no longer YOU / GUIDE / PRIEST");
  assert.equal(opening.openingPosture,"STAND","opening YOU state regressed to an empty or incorrect posture");
  assert.equal(opening.openingPostureIconHidden,false,"opening YOU state lost its exact posture icon");
  assert.ok(["OPEN","RUBRICS"].includes(opening.guideLabel),"Guide centre cell lost v1.79/v1.80 semantics");
  assert.equal(opening.preferencesOpen,"false","Mass preferences sheet should be closed at reader entry");
  assert.equal(opening.floatingClose,false,"obsolete floating close button still overlays the LIVE ribbon");
  assert.equal(opening.sectionJumpDisabled,false,"source-first section jump is disabled");
  assert.equal(opening.sectionButtonCount,opening.totalCards,"section jump does not expose the complete current display model");
  assert.equal(opening.totalCards,48,"visible Sung LIVE presentation no longer preserves the approved 48-step concept");
  assert.equal(opening.sourceTotalCards,39,"48-step presentation mutated or replaced the certified 39-step source model");
  assert.equal(opening.structureOwner,"SOURCE_FIRST_LIVE_PRODUCT_48");
  assert.equal(opening.sourceStructureOwner,"SOURCE_FIRST_LIVE");
  assert.equal(opening.historicalIdentityClaim,false,"source-first product 48 must not masquerade as recovered historical C01-C48 identity");
  assert.ok(opening.shellRect?.width<=390.5&&opening.shellRect?.height<=844.5,"native LIVE shell overflows phone viewport");

  // v1.79 Guide: structured sheet, curated sections and source links.
  const guideButton=page.locator("#ao-r17-native-reader-preview [data-role='guide-button']");
  assert.equal(await guideButton.isDisabled(),false,"opening v1.79 Guide is disabled");
  // Content/Guide rendering is tested via direct activation; real hit-target taps
  // are independently certified by mass-batch-a-touch.mjs.
  await guideButton.evaluate(button=>button.click());
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='guide-popover']")?.hidden===false);
  const guideAudit=await page.evaluate(()=>({
    kicker:document.querySelector("#ao-r17-native-reader-preview .ao-guide-kicker")?.textContent?.trim()??"",
    title:document.querySelector("#ao-r17-native-reader-preview .ao-guide-title")?.textContent?.trim()??"",
    summary:document.querySelector("#ao-r17-native-reader-preview .ao-guide-summary")?.textContent?.trim()??"",
    headings:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-guide-section h3,#ao-r17-native-reader-preview .ao-guide-section h4")].map(x=>x.textContent?.trim()??""),
    sectionCount:document.querySelectorAll("#ao-r17-native-reader-preview .ao-guide-section").length,
    sources:document.querySelector("#ao-r17-native-reader-preview .ao-guide-sources p")?.textContent?.trim()??"",
    sourceLinks:document.querySelectorAll("#ao-r17-native-reader-preview .ao-guide-links a").length,
  }));
  assert.equal(guideAudit.kicker,"Guide · 1962 Sung Mass","Guide lost v1.79 identity");
  assert.ok(guideAudit.title.length>0&&guideAudit.summary.length>0,"Guide header is not curated");
  assert.ok(guideAudit.sectionCount>=5,"Guide collapsed back into an unstructured long-text dump");
  for(const heading of ["What is happening","What should I do?","For prayer"]){
    assert.ok(guideAudit.headings.includes(heading),"Guide is missing curated section: "+heading);
  }
  assert.ok(guideAudit.sources.length>0,"Guide lost its source line");
  assert.ok(guideAudit.sourceLinks>=1,"Guide lost source links");
  await page.locator("#ao-r17-native-reader-preview [data-guide-close]").evaluate(button=>button.click());
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='guide-popover']")?.hidden===true);

  const scholaDock=page.locator("#ao-r17-native-reader-preview .ao-schola-dock");
  const scholaToggle=scholaDock.locator("[data-schola-toggle]");
  // Select a real sourced Schola track, not an artificial data-active DOM flag.
  // Repeated source-state reconciliation is allowed to overwrite presentation
  // attributes; therefore all controls must be tested in an actual Schola context.
  const realSchola=await page.evaluate(()=>{
    const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    preview.selectScholaTrack("INTROIT");
    return preview.getScholaState();
  });
  assert.equal(realSchola.schola?.trackId,"INTROIT","canonical Introit Schola track missing");
  assert.ok(realSchola.schola?.latin && realSchola.schola?.english,
    "Schola test cannot interact with an unsourced or translation-less track");
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock")?.dataset.active==="true",null,{timeout:5000});
  await scholaToggle.evaluate(button=>button.click());
  assert.equal(await scholaDock.getAttribute("data-collapsed"),"true","Schola hide control did not collapse the dock");
  const scholaHitGeometry=await page.evaluate(()=>{
    const toggle=document.querySelector("#ao-r17-native-reader-preview [data-schola-toggle]")?.getBoundingClientRect();
    const next=document.querySelector("#ao-r17-native-reader-preview [data-reader-nav='next']")?.getBoundingClientRect();
    const overlap=toggle&&next ? !(next.right<=toggle.left||next.left>=toggle.right||next.bottom<=toggle.top||next.top>=toggle.bottom) : null;
    return {toggle:toggle?{left:toggle.left,right:toggle.right,top:toggle.top,bottom:toggle.bottom}:null,
      next:next?{left:next.left,right:next.right,top:next.top,bottom:next.bottom}:null,overlap};
  });
  assert.equal(scholaHitGeometry.overlap,false,
    "collapsed Schola SHOW control overlaps the Next edge target: "+JSON.stringify(scholaHitGeometry));
  const afterHide=await page.evaluate(()=>({
    readerRoot:!!document.getElementById("ao-r17-native-reader-preview"),
    scholaToggle:!!document.querySelector("#ao-r17-native-reader-preview [data-schola-toggle]"),
    scholaDock:!!document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock"),
    sectionJump:!!document.querySelector("#ao-r17-native-reader-preview [data-role='section-jump']"),
    trace:globalThis.__AO_MASS_VISUAL_REMOVAL_TRACE??[],
    location:location.href,
    route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
    overlayNodes:document.querySelectorAll("#ao-r17-native-reader-preview").length,
  }));
  console.log("Batch A after Schola hide:",JSON.stringify(afterHide));
  assert.equal(afterHide.readerRoot,true,"Mass overlay detached by Schola hide: "+JSON.stringify(afterHide));
  assert.equal(afterHide.scholaToggle,true,"Schola toggle removed by hide: "+JSON.stringify(afterHide));
  await scholaToggle.evaluate(button=>button.click());
  assert.equal(await scholaDock.getAttribute("data-collapsed"),"false","Schola show control did not restore the dock");
  const scholaBefore=await scholaDock.evaluate(el=>el.getBoundingClientRect().height);
  const handle=scholaDock.locator("[data-schola-resize]");
  const handleBox=await handle.boundingBox();
  if(handleBox){
    await page.mouse.move(handleBox.x+handleBox.width/2,handleBox.y+handleBox.height/2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x+handleBox.width/2,Math.max(1,handleBox.y-34),{steps:4});
    await page.mouse.up();
    const scholaAfter=await scholaDock.evaluate(el=>el.getBoundingClientRect().height);
    assert.ok(scholaAfter>scholaBefore+10,"Schola drag handle did not resize the dock");
  }

  // v1.76-v1.80 Schola interaction contract: page/progress, persisted speed,
  // explicit pause/resume, and translation which temporarily pauses motion.
  const scholaState=await page.evaluate(()=>({
    page:document.querySelector("#ao-r17-native-reader-preview [data-role='schola-page']")?.textContent?.trim()??"",
    progress:document.querySelector("#ao-r17-native-reader-preview [data-role='schola-progress']")?.style?.width??"",
    speed:document.querySelector("#ao-r17-native-reader-preview [data-role='schola-speed']")?.textContent?.trim()??"",
    latin:document.querySelector("#ao-r17-native-reader-preview [data-role='schola']")?.textContent?.trim()??"",
  }));
  assert.match(scholaState.page,/\d+\s*\/\s*\d+/,"Schola lost page state");
  assert.match(scholaState.progress,/^\d+(?:\.\d+)?%$/,"Schola lost progress state");
  assert.equal(scholaState.speed,"0.45×","Schola no longer starts on donor default speed");
  assert.ok(scholaState.latin.length>0,"Schola stream is empty");

  await scholaDock.locator("[data-schola-faster]").evaluate(button=>button.click());
  assert.equal(await scholaDock.locator("[data-role='schola-speed']").textContent(),"0.60×","Schola faster control did not advance donor speed ladder");
  assert.equal(await page.evaluate(()=>localStorage.getItem("ao-schola-speed")),"0.6","Schola speed did not persist");

  const scholaPause=scholaDock.locator("[data-schola-pause]");
  await scholaPause.evaluate(button=>button.click());
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"true","Schola pause control did not pause");
  assert.equal((await scholaPause.textContent())?.trim(),"RESUME","paused Schola does not expose resume");
  await scholaPause.evaluate(button=>button.click());
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"false","Schola resume control did not resume");

  await scholaDock.locator("[data-schola-translate]").evaluate(button=>button.click());
  assert.equal(await scholaDock.getAttribute("data-show-translation"),"true","Schola translation did not open");
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"true","Schola translation did not pause moving text");
  assert.ok(((await scholaDock.locator("[data-role='schola-translation']").textContent())??"").trim().length>0,"Schola translation is empty");
  await scholaDock.locator("[data-schola-translate]").evaluate(button=>button.click());
  assert.equal(await scholaDock.getAttribute("data-show-translation"),"false","Schola translation did not close");
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"false","Schola did not resume after translation closed");

  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
  await page.screenshot({path:resolve(out,"06-mass-live-opening.png"),fullPage:false});

  const navPreflight=await page.evaluate(()=>({
    present:Boolean(document.getElementById("ao-r17-native-reader-preview")),
    route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
    trace:globalThis.__AO_MASS_VISUAL_REMOVAL_TRACE??[],
    previewOwned:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW),
    shell:Boolean(document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")),
  }));
  console.log("Mass visual Schola-to-navigation preflight:",JSON.stringify(navPreflight));
  assert.equal(navPreflight.present,true,"Mass overlay vanished during Schola chrome checks: "+JSON.stringify(navPreflight));
  await page.locator("#ao-r17-native-reader-preview [data-role='section-jump']").evaluate(button=>button.click());
  const menu=page.locator("#ao-r17-native-reader-preview [data-role='section-menu']");
  assert.equal(await menu.isVisible(),true,"section jump menu did not open");
  const sectionCount=await page.locator("#ao-r17-native-reader-preview [data-reader-section]").count();
  assert.equal(sectionCount,48,"section menu lost 48 source-first display cards");
  console.log("Batch A Schola navigation: section menu open",JSON.stringify({navPreflight,sectionCount}));
  const hostSection=page.locator("#ao-r17-native-reader-preview [data-reader-section]").filter({hasText:/Consecration.*Host/i}).first();
  assert.equal(await hostSection.count(),1,"Host Consecration section not present in 48-card menu");
  console.log("Batch A Host section: before click");
  await hostSection.evaluate(button=>button.click());
  console.log("Batch A Host section: click returned");
  await page.waitForFunction(()=>/Consecration/i.test(document.querySelector("#ao-r17-native-reader-preview [data-role='section-title']")?.textContent??""),null,{timeout:5000});
  const hostNow=await page.evaluate(()=>({
    section:document.querySelector("#ao-r17-native-reader-preview [data-role='section-title']")?.textContent?.trim()??"",
    livePreview:!!globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected,
    card:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId??null,
  }));
  assert.equal(hostNow.livePreview,true,"Host jump detached the native reader");
  console.log("Batch A Schola-to-Host navigation: PASS",JSON.stringify({hostNow,sectionCount}));
  await context.close();
}catch(error){
  const snapshot=await page?.evaluate(()=>({
    route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
    trace:globalThis.__AO_MASS_VISUAL_REMOVAL_TRACE??[],
    mounted:!!document.getElementById("ao-r17-native-reader-preview"),
    previewOwned:!!globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected,
    massRuntime:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
    appShell:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    engine:document.documentElement.dataset.aoMassEngine??null,
    schola:document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock")?.outerHTML?.slice(0,400)??null,
  })).catch(e=>({diagnosticError:String(e)}));
  console.error("Batch A real-shell failure snapshot:",JSON.stringify(snapshot));
  throw error;
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
