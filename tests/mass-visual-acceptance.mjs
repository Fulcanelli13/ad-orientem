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

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB"});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  await page.goto("http://127.0.0.1:4190/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true,null,{timeout:30000});

  const setup=await page.evaluate(async()=>{
    const t=(lat,en)=>({lat,en});
    const proper={
      sourcePath:"Sancti/10-07",
      name:"Our Lady of the Rosary",
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

  const opening=await page.evaluate(()=>({
    uiOwner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
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

  // LIVE visual hierarchy: one instance for persistent posture and priest
  // action, while surrounding prose remains readable at rest.
  await page.waitForTimeout(400);
  const hierarchy=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const postureTop=root?.querySelector('[data-icon-slot="posture-top"]');
    const postureRail=root?.querySelector('.ao-rail-left [data-channel="posture"]');
    const badge=root?.querySelector(".ao-priest-action-badge");
    const active=root?.querySelector('.ao-reader-paragraph[data-active="true"]');
    const inactive=[...root?.querySelectorAll?.('.ao-reader-paragraph[data-kind="TEXT"]:not([data-active="true"])')??[]];
    const next=root?.querySelector('[data-reader-nav="next"]');
    const previous=root?.querySelector('[data-reader-nav="previous"]');
    return {
      postureTopVisible:postureTop && !postureTop.hidden,
      postureRailDisplay:postureRail?getComputedStyle(postureRail).display:null,
      badgeDisplay:badge?getComputedStyle(badge).display:null,
      activeOpacity:active?Number.parseFloat(getComputedStyle(active).opacity):null,
      inactiveOpacity:inactive.length?Number.parseFloat(getComputedStyle(inactive[inactive.length-1]).opacity):null,
      nextOpacity:next?Number.parseFloat(getComputedStyle(next).opacity):null,
      nextHeight:next?.getBoundingClientRect().height,
      previousHeight:previous?.getBoundingClientRect().height,
    };
  });
  assert.equal(hierarchy.postureTopVisible,true,"top posture owner became unavailable");
  assert.equal(hierarchy.postureRailDisplay,"none","persistent posture is duplicated in LIVE rail and top state ribbon");
  assert.equal(hierarchy.badgeDisplay,"none","priest action appears in both top badge and right action rail");
  assert.ok(hierarchy.activeOpacity>=.95,"active prayer lost primary visual focus: "+JSON.stringify(hierarchy));
  assert.ok(hierarchy.inactiveOpacity>=.59&&hierarchy.inactiveOpacity<=.7,
    "surrounding prayer text is unreadably dim or overwhelms active text: "+JSON.stringify(hierarchy));
  assert.ok(hierarchy.nextOpacity>=.2&&hierarchy.nextOpacity<=.35,
    "resting card arrow distracts from prayer focus: "+JSON.stringify(hierarchy));
  assert.ok(hierarchy.nextHeight>=44&&hierarchy.previousHeight>=44,
    "reducing arrow chrome accidentally reduced touch targets: "+JSON.stringify(hierarchy));

  // Phone ergonomics acceptance at standard and narrow widths. Test computed
  // hitboxes, not a CSS string or desktop hover state.
  const phoneAudit=[];
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});
    // The section menu is display:none while closed, so its clickable geometry
    // must be measured with the menu actually open.
    await page.locator("#ao-r17-native-reader-preview [data-role='section-jump']").click();
    const audit=await page.evaluate(()=>{
      const root=document.querySelector("#ao-r17-native-reader-preview");
      const rect=selector=>{
        const el=root?.querySelector(selector),box=el?.getBoundingClientRect();
        const cs=el?getComputedStyle(el):null;
        return box?{width:box.width,height:box.height,left:box.left,right:box.right,
          fontSize:Number.parseFloat(cs?.fontSize??"0"),display:cs?.display}:null;
      };
      const row={
        viewport:document.documentElement.clientWidth,
        prefsClose:rect(".ao-mass-prefs-close"),
        modeButton:rect(".ao-mode-ribbon button"),
        preferencesAction:rect(".ao-mass-prefs-more"),
        sectionItem:rect('[data-reader-section]'),
        guideKicker:rect(".ao-guide-copy small"),
        scholaSlower:rect("[data-schola-slower]"),
        scholaFaster:rect("[data-schola-faster]"),
        scholaPause:rect("[data-schola-pause]"),
        scholaToggle:rect("[data-schola-toggle]"),
        scholaDock:rect(".ao-schola-dock"),
        prayerBody:rect(".ao-prayer-body"),
        prayerCard:rect(".ao-prayer-card"),
        leftRail:rect(".ao-rail-left"),
        rightRail:rect(".ao-rail-right"),
        stateLabels:[...root.querySelectorAll(".ao-state-label")].map(el=>({
          text:el.textContent.trim(),
          width:el.getBoundingClientRect().width,
          whiteSpace:getComputedStyle(el).whiteSpace,
          clamp:getComputedStyle(el).webkitLineClamp,
          fontSize:Number.parseFloat(getComputedStyle(el).fontSize)
        })),
        focusLine:(()=>{
          const card=root.querySelector(".ao-prayer-card");
          const dock=root.querySelector(".ao-schola-dock");
          return {line:card?.getBoundingClientRect().top+(card?.clientHeight??0)*.39,
            dockTop:dock?.getBoundingClientRect().top,
            active:dock?.dataset.active}
        })(),
      };
      return row;
    });
    assert.ok(audit.prefsClose?.width>=44&&audit.prefsClose?.height>=44,
      "preferences close has an undersized phone target: "+JSON.stringify(audit));
    assert.ok(audit.modeButton?.height>=44&&audit.modeButton?.fontSize>=10,
      "mode labels are still microscopic: "+JSON.stringify(audit));
    assert.ok(audit.preferencesAction?.height>=44&&audit.preferencesAction?.fontSize>=10,
      "preferences actions are too small to tap/read: "+JSON.stringify(audit));
    assert.ok(audit.sectionItem?.height>=44&&audit.sectionItem?.fontSize>=12,
      "section picker targets are too small: "+JSON.stringify(audit));
    assert.ok(audit.guideKicker?.fontSize>=9,
      "Guide label is microscopic: "+JSON.stringify(audit));
    for(const name of ["scholaSlower","scholaFaster","scholaPause"]){
      assert.ok(audit[name]?.height>=44,
        "Schola "+name+" has an undersized target: "+JSON.stringify(audit));
    }
    assert.ok(audit.scholaToggle?.height>=40,
      "Schola hide/show target too small: "+JSON.stringify(audit));
    assert.ok(audit.scholaDock?.left>=0&&audit.scholaDock?.right<=width+1,
      "Schola dock extends beyond the phone screen: "+JSON.stringify(audit));
    assert.ok(audit.stateLabels.every(x=>x.whiteSpace==="normal"&&Number(x.clamp)>=2),
      "YOU/PRIEST ribbon still clips state text to a single line: "+JSON.stringify(audit));
    if(width===320){
      assert.ok(audit.prayerBody?.width>=205,
        "320px mobile prayer reading measure remains constricted: "+JSON.stringify(audit));
      assert.ok(audit.prayerBody.left>=audit.leftRail.right,
        "prayer text overlaps faithful gesture rail: "+JSON.stringify(audit));
      assert.ok(audit.prayerBody.right<=audit.rightRail.left,
        "prayer text overlaps priest gesture rail: "+JSON.stringify(audit));
      assert.ok(audit.stateLabels.every(x=>Number(x.clamp)===3),
        "narrow-phone state labels did not gain a third readable line: "+JSON.stringify(audit));
    }
    assert.ok(audit.focusLine?.line<audit.focusLine?.dockTop-20,
      "Schola dock obscures the certified 39% active-cue reading line: "+JSON.stringify(audit));
    phoneAudit.push({width,audit});
    await page.locator("#ao-r17-native-reader-preview [data-role='section-jump']").click();
  }
  await page.setViewportSize({width:390,height:844});

  // v1.79 Guide: structured sheet, curated sections and source links.
  const guideButton=page.locator("#ao-r17-native-reader-preview [data-role='guide-button']");
  assert.equal(await guideButton.isDisabled(),false,"opening v1.79 Guide is disabled");
  await guideButton.click();
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
  await page.locator("#ao-r17-native-reader-preview [data-guide-close]").click();
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='guide-popover']")?.hidden===true);

  const scholaDock=page.locator("#ao-r17-native-reader-preview .ao-schola-dock");
  const scholaToggle=scholaDock.locator("[data-schola-toggle]");
  await scholaToggle.click();
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
  await scholaToggle.click();
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
  const scholaBacking=await scholaDock.evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.equal(scholaBacking,"rgb(17, 25, 20)",
    "Schola dock is translucent and shows competing Latin prayer text behind the controls");

  await scholaDock.locator("[data-schola-faster]").click();
  assert.equal(await scholaDock.locator("[data-role='schola-speed']").textContent(),"0.60×","Schola faster control did not advance donor speed ladder");
  assert.equal(await page.evaluate(()=>localStorage.getItem("ao-schola-speed")),"0.6","Schola speed did not persist");

  const scholaPause=scholaDock.locator("[data-schola-pause]");
  await scholaPause.click();
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"true","Schola pause control did not pause");
  assert.equal((await scholaPause.textContent())?.trim(),"RESUME","paused Schola does not expose resume");
  await scholaPause.click();
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"false","Schola resume control did not resume");

  await scholaDock.locator("[data-schola-translate]").click();
  assert.equal(await scholaDock.getAttribute("data-show-translation"),"true","Schola translation did not open");
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"true","Schola translation did not pause moving text");
  assert.ok(((await scholaDock.locator("[data-role='schola-translation']").textContent())??"").trim().length>0,"Schola translation is empty");
  await scholaDock.locator("[data-schola-translate]").click();
  assert.equal(await scholaDock.getAttribute("data-show-translation"),"false","Schola translation did not close");
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"false","Schola did not resume after translation closed");

  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
  await page.screenshot({path:resolve(out,"06-mass-live-opening.png"),fullPage:false});

  await page.locator("#ao-r17-native-reader-preview [data-role='section-jump']").click();
  const hostSection=page.locator("#ao-r17-native-reader-preview [data-reader-section]").filter({hasText:/Consecration.*Host/i}).first();
  assert.equal(await hostSection.count(),1,"source-first section menu exposes no Host Consecration");
  await hostSection.click();
  await page.waitForFunction(()=>/Consecration/i.test(document.querySelector("#ao-r17-native-reader-preview [data-role='section-title']")?.textContent??""),null,{timeout:5000});

  const consecration=await page.evaluate(()=>{
    const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    const cards=preview?.model?.cards??[];
    const card=preview?.getCurrentCard?.()??null;
    return {
      sectionId:card?.sectionId??null,
      sourceSequence:card?.sourceSequence??card?.sequence??null,
      title:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.textContent?.trim()??"",
      paragraphs:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph")].map(x=>x.textContent?.trim()??""),
      primaryTexts:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph .ao-line-primary")].map(x=>x.textContent?.trim()??""),
      secondaryTexts:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph .ao-line-secondary")].map(x=>x.textContent?.trim()??""),
      rubricCount:document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-kind='RUBRIC']").length,
      consecrationWordsCount:document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-kind='CONSECRATION_WORDS']").length,
      cardTitleHidden:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.hidden??false,
      guideShort:document.querySelector("#ao-r17-native-reader-preview [data-role='guide-short']")?.textContent?.trim()??"",
      stageLeft:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.leftRail??null,
      stageRight:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.rightRail??null,
      scholaDock:document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock")?.dataset?.active??null,
      leftActive:document.querySelectorAll("#ao-r17-native-reader-preview .ao-rail-left [data-active='true']").length,
      rightActive:document.querySelectorAll("#ao-r17-native-reader-preview .ao-rail-right [data-active='true']").length,
      guideDisabled:document.querySelector("#ao-r17-native-reader-preview [data-role='guide-button']")?.disabled??null,
      progress:document.querySelector("#ao-r17-native-reader-preview [data-role='progress']")?.textContent?.trim()??"",
      totalCards:preview?.model?.totalCards??cards.length,
      cardIds:cards.map(x=>x.sectionId),
    };
  });
  assert.ok(consecration.sectionId,"source-first reader exposed no Host Consecration section");
  assert.match(consecration.title,/Consecration/i);
  assert.equal(consecration.cardTitleHidden,true,"Consecration duplicated its title inside the prayer card");
  assert.ok(consecration.paragraphs.length>0,"Consecration rendered no prayer text");
  assert.ok(consecration.primaryTexts.some(x=>/Hoc est enim Corpus meum/i.test(x)),"Host Consecration is not Latin-prominent");
  assert.ok(consecration.secondaryTexts.some(x=>/THIS IS MY BODY/i.test(x)),"Host Consecration lost vernacular support beneath Latin");
  assert.ok(consecration.rubricCount>=1,"elevation action still renders as ordinary prayer prose");
  assert.ok(consecration.consecrationWordsCount>=1,"Words of Consecration lost dedicated salience");
  assert.equal(consecration.stageLeft,"true","donor LIVE faithful rail disappeared when no transient cue was active");
  assert.equal(consecration.stageRight,"true","donor LIVE audio rail disappeared at the Consecration");
  const rubricPresentation=await page.evaluate(()=>{
    const rubric=[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-kind='RUBRIC']")]
      .find(el=>getComputedStyle(el).display!=="none");
    if(!rubric)return null;
    const cs=getComputedStyle(rubric);
    return {headingDisplay:getComputedStyle(rubric,"::before").display,fontSize:Number.parseFloat(cs.fontSize),text:rubric.textContent.trim()};
  });
  assert.ok(rubricPresentation?.text.length>0,"LIVE rubric source text disappeared");
  assert.equal(rubricPresentation.headingDisplay,"none","LIVE rubric regained repeated micro-sized RUBRIC headings");
  assert.ok(rubricPresentation.fontSize>=12,"LIVE rubrics remain too small to read");

  assert.notEqual(consecration.guideShort,"","short Guide rubric is not visible in the state ribbon");
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
  await page.screenshot({path:resolve(out,"07-mass-live-consecration.png"),fullPage:false});

  const wordsCue=page.locator("#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='AO.SM.C0173']");
  const elevationCue=page.locator("#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='AO.SM.C0174']");
  assert.equal(await wordsCue.count(),1,"Host Consecration words cue AO.SM.C0173 is not exposed in the source-first reader");
  assert.equal(await elevationCue.count(),1,"Host elevation action cue AO.SM.C0174 is not exposed in the source-first reader");

  await wordsCue.evaluate(el=>{
    const card=el.closest(".ao-prayer-card");
    const cr=card.getBoundingClientRect(),er=el.getBoundingClientRect();
    const top=er.top-cr.top+card.scrollTop;
    const bottom=er.bottom-cr.top+card.scrollTop;
    card.scrollTop=Math.max(0,(top+bottom)/2-card.clientHeight*.39);
    card.dispatchEvent(new Event("scroll"));
  });
  await page.waitForFunction(()=>document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue==="AO.SM.C0173",null,{timeout:5000});
  const wordsState=await page.evaluate(()=>({
    cue:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue??null,
    bellActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='bell']")?.dataset?.active??null,
    cinematicHidden:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden??null,
    bellOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerBell??null,
    cinematicOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerCinematic??null,
  }));
  assert.equal(wordsState.cue,"AO.SM.C0173");
  assert.equal(wordsState.bellActive,"false","Host words cue fired the elevation bell before the action cue");
  assert.equal(wordsState.cinematicHidden,true,"Host words cue fired the elevation cinematic before the action cue");

  await elevationCue.evaluate(el=>{
    const card=el.closest(".ao-prayer-card");
    const cr=card.getBoundingClientRect(),er=el.getBoundingClientRect();
    const top=er.top-cr.top+card.scrollTop;
    const bottom=er.bottom-cr.top+card.scrollTop;
    card.scrollTop=Math.max(0,(top+bottom)/2-card.clientHeight*.39);
    card.dispatchEvent(new Event("scroll"));
  });
  await page.waitForFunction(()=>
    document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue==="AO.SM.C0174" &&
    document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===false,
    null,{timeout:5000});
  const elevationState=await page.evaluate(()=>({
    cue:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue??null,
    bellActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='bell']")?.dataset?.active??null,
    bellText:document.querySelector("#ao-r17-native-reader-preview [data-role='bell']")?.textContent?.trim()??"",
    bellIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='bell']")?.hidden??null,
    bellIconMask:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='bell']");return x?.style?.maskImage||x?.style?.webkitMaskImage||""})(),
    cueStateSupported:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCueState?.()?.supported??null,
    cueStateReason:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCueState?.()?.reason??null,
    cueStateAction:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCueState?.()?.priestAction?.label??null,
    cueStateActionOwner:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCueState?.()?.ownership?.priestAction??null,
    projectedAction:globalThis.AO_R17_NATIVE_READER_STATE?.priestAction?.label??null,
    projectedActionIconKey:globalThis.AO_R17_NATIVE_READER_STATE?.priestActionIconKey??null,
    cinematicKind:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.dataset?.kind??null,
    cinematicTitle:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic-title']")?.textContent?.trim()??"",
    cinematicSub:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic-sub']")?.textContent?.trim()??"",
    cinematicIcon:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='cinematic']");return {
      hidden:x?.hidden??null,
      direct:x?.classList?.contains("ao-icon-direct")??false,
      background:x?.style?.backgroundImage??"",
      mask:x?.style?.maskImage||x?.style?.webkitMaskImage||"",
    }})(),
    bellOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerBell??null,
    cinematicOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerCinematic??null,
  }));
  assert.equal(elevationState.cue,"AO.SM.C0174");
  assert.equal(elevationState.bellActive,"true","Host elevation action cue did not activate the bell channel");
  assert.match(elevationState.bellText,/ELEVATION BELL/i);
  assert.equal(elevationState.bellIconHidden,false,"Host elevation bell rail is active but its icon is hidden");
  assert.match(elevationState.bellIconMask,/mass-v46\/bells\.svg/,
    "Host elevation bell rail is active but is not using the exact v4.6 donor bell art");
  assert.equal(elevationState.cueStateSupported,true,
    "Sung cue-state controller is not active at the Host elevation: "+JSON.stringify(elevationState));
  assert.equal(elevationState.cueStateAction,"ELEVATES HOST",
    "loaded v1.80 priest-action registry does not expose the Host elevation action at AO.SM.C0174: "+JSON.stringify(elevationState));
  assert.equal(elevationState.projectedAction,"ELEVATES HOST",
    "native state projection dropped the Host elevation action after cue resolution");
  assert.equal(elevationState.projectedActionIconKey,"priest_elevate_host_rich","Host elevation cue lost its exact v4.6 action key");
  assert.equal(elevationState.cinematicKind,"ELEVATION");
  const elevationBackdrop=await page.locator("#ao-r17-native-reader-preview [data-role='cinematic']").evaluate(el=>({
    backgroundColor:getComputedStyle(el).backgroundColor,
    backgroundImage:getComputedStyle(el).backgroundImage,
  }));
  assert.equal(elevationBackdrop.backgroundColor,"rgb(7, 11, 8)",
    "Host Elevation illustration is competing with the underlying RUBRIC through a transparent backdrop");
  assert.match(elevationBackdrop.backgroundImage,/radial-gradient/,
    "Host Elevation lost its restrained radial sacred-light treatment");
  assert.equal(elevationState.cinematicTitle,"ELEVATION");
  assert.equal(elevationState.cinematicSub,"SACRED HOST");
  assert.equal(elevationState.cinematicIcon.hidden,false,"Host elevation master is hidden");
  assert.equal(elevationState.cinematicIcon.direct,true,"rich Host elevation master fell back to wrapper masking");
  assert.match(elevationState.cinematicIcon.background,/mass-v46\/priest_elevate_host_rich\.svg/,
    "Host elevation cinematic is not using the exact v4.6 rich master");
  assert.equal(elevationState.cinematicIcon.mask,"none","rich Host elevation master is still being rasterized as an SVG mask viewport");
  assert.match(elevationState.bellOwner,/R17_RECOVERED_CUE_CANONICAL_SOUND_EVENT/);
  assert.match(elevationState.cinematicOwner,/R17_EXACT_ELEVATION_CINEMATIC/);
  await page.screenshot({path:resolve(out,"08-mass-host-elevation.png"),fullPage:false});

  async function focusCanonicalCue(cueId){
    const section=await page.evaluate((id)=>{
      const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
      const target=(preview?.model?.cards??[]).find(card=>(card?.paragraphs??[]).some(p=>(p?.sourceCueIds??[]).includes(id)));
      if(!target)return null;
      preview.showSection?.(target.sectionId);
      return {sectionId:target.sectionId,title:target.title};
    },cueId);
    assert.ok(section?.sectionId,"source-first display model has no section for "+cueId);
    // Section changes legitimately show the donor part-transition cinema. Wait
    // for it to finish so salience screenshots certify the ritual cue itself.
    await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
    const cue=page.locator(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${cueId}']`);
    assert.equal(await cue.count(),1,cueId+" is not exposed exactly once in the current source-first section");
    for(let attempt=0;attempt<30;attempt++){
      await cue.evaluate((el,attempt)=>{
        const card=el.closest(".ao-prayer-card");
        const cr=card.getBoundingClientRect(),er=el.getBoundingClientRect();
        const top=er.top-cr.top+card.scrollTop;
        const bottom=er.bottom-cr.top+card.scrollTop;
        const max=Math.max(0,card.scrollHeight-card.clientHeight);
        const target=Math.min(max,Math.max(0,(top+bottom)/2-card.clientHeight*.39));
        // An early cue may have no possible fixed-39% position. Scroll a
        // little further on retries to exercise its adaptive opening zone.
        card.scrollTop=Math.min(max,Math.max(target,attempt*12));
        card.dispatchEvent(new Event("scroll"));
      },attempt);
      await page.waitForTimeout(100);
      const active=await page.evaluate(()=>document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue??null);
      if(active===cueId)break;
    }
    const focusDebug=await page.evaluate((id)=>{
      const root=document.getElementById("ao-r17-native-reader-preview");
      const el=document.querySelector(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}']`);
      const card=el?.closest(".ao-prayer-card");
      const cr=card?.getBoundingClientRect(),er=el?.getBoundingClientRect();
      return {
        expected:id,
        active:root?.dataset?.r17NativeCue??null,
        scrollTop:card?.scrollTop??null,
        maxScroll:card?Math.max(0,card.scrollHeight-card.clientHeight):null,
        clientHeight:card?.clientHeight??null,
        targetTop:cr&&er?er.top-cr.top+(card?.scrollTop??0):null,
        targetBottom:cr&&er?er.bottom-cr.top+(card?.scrollTop??0):null,
        targetActive:el?.dataset?.active??null,
      };
    },cueId);
    assert.equal(focusDebug.active,cueId,"exact cue did not acquire 39% focus territory: "+JSON.stringify(focusDebug));
    return page.evaluate((id)=>({
      cue:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue??null,
      section:document.querySelector("#ao-r17-native-reader-preview [data-role='section-title']")?.textContent?.trim()??"",
      gesture:document.querySelector("#ao-r17-native-reader-preview [data-role='gesture']")?.textContent?.trim()??"",
      response:document.querySelector("#ao-r17-native-reader-preview [data-role='response']")?.textContent?.trim()??"",
      responseActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='response']")?.dataset?.active??null,
      posture:document.querySelector("#ao-r17-native-reader-preview [data-role='posture']")?.textContent?.trim()??"",
      leftRail:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.leftRail??null,
      gestureActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='gesture']")?.dataset?.active??null,
      postureActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='posture']")?.dataset?.active??null,
      gestureIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='gesture']")?.hidden??null,
      postureIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='posture']")?.hidden??null,
      scholaSharedActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='schola-shared']")?.dataset?.active??null,
      scholaSharedIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='schola-shared']")?.hidden??null,
      scholaDockActive:document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock")?.dataset?.active??null,
      activeParagraphs:document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-active='true']").length,
      targetActive:document.querySelector(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}']`)?.dataset?.active??null,
      gestureOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerGesture??null,
      anchorWords:[...document.querySelectorAll(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}'] .ao-ritual-trigger-live`)].map(el=>el.textContent.trim()),
      anchorFlag:document.querySelector(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}']`)?.dataset.ritualCueActive??null,
      // Verify that triggering a transient action does not rebuild the
      // source paragraph or steal focus/translation state on cue updates.
      anchoredParagraphSource:document.querySelector(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}'] .ao-line-primary`)?.textContent?.trim()??"",

      postureOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerPosture??null,
    }),cueId);
  }

  // Multi-fragment and single-word anchors are resolved at exactly their
  // canonical cue, not merely at the section or card level.
  const gloriaAdoramus=await focusCanonicalCue("AO.SM.C0056");
  assert.ok(gloriaAdoramus.anchorWords.some(word=>/Ador[aá]mus te|We adore thee|Nous vous adorons/i.test(word)),
    "Adoramus te gesture rail activates without highlighting the sourced phrase in the displayed language: "+JSON.stringify(gloriaAdoramus));
  assert.equal(gloriaAdoramus.anchorFlag,"true");

  const gloriaBow=await focusCanonicalCue("AO.SM.C0061");
  assert.match(gloriaBow.gesture,/BOW HEAD/i,"Traditional Gloria Holy Name cue is not visibly salient");
  assert.equal(gloriaBow.posture,"STAND","Gloria posture did not remain visible in the faithful state ribbon");
  assert.equal(gloriaBow.leftRail,"true","active Gloria gesture did not reveal the faithful cue rail");
  assert.equal(gloriaBow.gestureActive,"true");
  assert.equal(gloriaBow.postureActive,"true");
  assert.equal(gloriaBow.gestureIconHidden,false,"Gloria bow lost its canonical gesture icon");
  assert.equal(gloriaBow.scholaSharedActive,"true","shared Gloria text lost the v1.76 right-rail Schola indicator");
  assert.equal(gloriaBow.scholaSharedIconHidden,false,"shared Gloria text has no visible Schola pictogram");
  assert.equal(gloriaBow.scholaDockActive,"false","shared Gloria text duplicated itself in the Schola dock");
  assert.equal(gloriaBow.targetActive,"true","Gloria bow cue is not the active focus paragraph");
  assert.equal(gloriaBow.anchorFlag,"true","Gloria bow rail/Latin anchor state diverged");
  assert.ok(gloriaBow.anchorWords.some(word=>/Iesu Christe|Jesu Christe|Jesus Christ|Jésus-Christ/i.test(word)),
    "Gloria Holy Name bow cue lacks its source-aligned phrase highlight: "+JSON.stringify(gloriaBow));
  assert.ok(!gloriaBow.anchorWords.some(word=>/Ador[aá]mus te|We adore thee|Nous vous adorons/i.test(word)),
    "Gloria previous-word ritual highlight leaked into the next cue");
  await page.screenshot({path:resolve(out,"09-mass-gloria-bow.png"),fullPage:false});

  const incarnatus=await focusCanonicalCue("AO.SM.C0096");
  assert.match(incarnatus.gesture,/GENUFLECT/i,"Incarnatus genuflection is not visibly salient");
  assert.equal(incarnatus.posture,"STAND","Incarnatus transient genuflection incorrectly replaced the persistent standing posture");
  assert.equal(incarnatus.leftRail,"true");
  assert.equal(incarnatus.gestureIconHidden,false,"Incarnatus lost its canonical genuflect icon");
  assert.equal(incarnatus.targetActive,"true");
  assert.equal(incarnatus.anchorFlag,"true","Incarnatus genuflect rail did not activate its Latin words");
  assert.ok(incarnatus.anchorWords.some(word=>/Et incarn[aá]tus est|And was incarnate|Il a pris chair/i.test(word)) &&
    incarnatus.anchorWords.some(word=>/et homo factus est|and was made man|s.est fait homme/i.test(word)),
    "Credo Incarnatus sourced opening and closing words are not highlighted as its gesture engages: "+JSON.stringify(incarnatus));
  await page.screenshot({path:resolve(out,"10-mass-incarnatus.png"),fullPage:false});

  // Check unrelated phases, not just Gloria/Credo. These anchors belong to
  // their exact canonical cues, in the language the reader already displays.
  const confiteorStrike=await focusCanonicalCue("AO.SM.C0022");
  assert.match(confiteorStrike.gesture,/STRIKE BREAST/i);
  assert.equal(confiteorStrike.anchorFlag,"true");
  assert.ok(confiteorStrike.anchorWords.some(word=>/mea culpa|through my fault|C.est ma faute/i.test(word)),
    "Confiteor triple breast-strike lacks its source-owned word highlight: "+JSON.stringify(confiteorStrike));

  const nobisStrike=await focusCanonicalCue("AO.SM.C0196");
  assert.match(nobisStrike.gesture,/STRIKE BREAST/i);
  assert.equal(nobisStrike.anchorFlag,"true");
  assert.ok(nobisStrike.anchorWords.some(word=>/Nobis quoque peccat[oó]ribus|To us also|À nous aussi/i.test(word)),
    "Nobis quoque breast-strike and its words are not synchronized: "+JSON.stringify(nobisStrike));

  const nextNobis=await focusCanonicalCue("AO.SM.C0197");
  assert.equal(nextNobis.gestureActive,"false","Nobis breast strike is incorrectly repeated on the following Canon sentence");
  assert.notEqual(nextNobis.anchorFlag,"true","Nobis words remained highlighted after the strike cue");

  const agnus=await focusCanonicalCue("AO.SM.C0222");
  assert.match(agnus.gesture,/STRIKE BREAST/i,"Agnus Dei breast-strike cue is not visibly salient");
  assert.equal(agnus.posture,"STAND","Agnus Dei source posture is not visible in the faithful state ribbon");
  assert.equal(agnus.leftRail,"true");
  assert.equal(agnus.gestureIconHidden,false,"Agnus Dei breast strike lost its canonical icon");
  assert.equal(agnus.targetActive,"true");
  assert.equal(agnus.anchorFlag,"true");
  assert.ok(agnus.anchorWords.some(word=>/Agnus Dei|Lamb of God|Agneau de Dieu/i.test(word)),
    "Agnus Dei breast-strike failed to highlight the invocation");
  for(const cueId of ["AO.SM.C0223","AO.SM.C0224"]){
    const repeat=await focusCanonicalCue(cueId);
    assert.match(repeat.gesture,/STRIKE BREAST/i,"each Agnus Dei invocation must own one distinct strike");
    assert.equal(repeat.anchorFlag,"true");
    assert.ok(repeat.anchorWords.some(word=>/Agnus Dei|Lamb of God|Agneau de Dieu/i.test(word)),
      "repeated Agnus Dei cue lacks its own highlight: "+JSON.stringify(repeat));
  }
  await page.screenshot({path:resolve(out,"11-mass-agnus-dei.png"),fullPage:false});

  const lastGospelGenuflect=await focusCanonicalCue("AO.SM.C0273");
  assert.match(lastGospelGenuflect.gesture,/GENUFLECT/i,"Last Gospel ET VERBUM CARO cue is not visibly salient");
  assert.equal(lastGospelGenuflect.posture,"STAND","Last Gospel persistent posture should remain standing around the transient genuflection");
  assert.equal(lastGospelGenuflect.leftRail,"true");
  assert.equal(lastGospelGenuflect.gestureIconHidden,false,"Last Gospel genuflect lost its canonical icon");
  assert.equal(lastGospelGenuflect.targetActive,"true");
  assert.equal(lastGospelGenuflect.anchorFlag,"true");
  assert.ok(lastGospelGenuflect.anchorWords.some(word=>/ET VERBUM CARO FACTUM EST|AND THE WORD WAS MADE FLESH|ET LE VERBE S.EST FAIT CHAIR/i.test(word)),
    "Last Gospel genuflection words not synchronized with the gesture icon");
  await page.screenshot({path:resolve(out,"12-mass-last-gospel-genuflect.png"),fullPage:false});

  const lastGospelRise=await focusCanonicalCue("AO.SM.C0274");
  assert.match(lastGospelRise.gesture,/RISE/i,"Last Gospel return-to-standing cue is not visibly salient");
  assert.equal(lastGospelRise.posture,"STAND");
  assert.equal(lastGospelRise.leftRail,"true");
  assert.equal(lastGospelRise.targetActive,"true");
  assert.equal(lastGospelRise.anchorFlag,"true");
  assert.ok(lastGospelRise.anchorWords.some(word=>/Et habit[aá]vit in nobis|And dwelt among us|et il a habit[eé] parmi nous/i.test(word)),
    "Last Gospel return to standing does not identify its exact source words");

  const dismissalResponse=await focusCanonicalCue("AO.SM.C0260");
  assert.equal(dismissalResponse.responseActive,"true","Deo gratias source response not present at dismissal");
  assert.match(dismissalResponse.response,/Deo gr[aá]tias/i);
  const afterDismissal=await focusCanonicalCue("AO.SM.C0261");
  assert.equal(afterDismissal.responseActive,"false","Deo gratias response persists after its actual source cue");

  // Donor-parity guard for the regression visible on wide browsers: the reader
  // must remain a centred ritual surface, not expand into a dashboard-width card.
  await page.setViewportSize({width:1440,height:900});
  await page.waitForTimeout(80);
  const wide=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const mode=root?.querySelector(".ao-mode-ribbon");
    const viewport=root?.querySelector(".ao-card-viewport");
    const card=root?.querySelector(".ao-prayer-card");
    const body=root?.querySelector(".ao-prayer-body");
    const left=root?.querySelector(".ao-rail-left");
    const right=root?.querySelector(".ao-rail-right");
    const nonActive=[...root?.querySelectorAll?.(".ao-reader-paragraph:not([data-active='true'])")??[]]
      .map(node=>Number.parseFloat(getComputedStyle(node).opacity))
      .filter(Number.isFinite);
    const rect=x=>x?(()=>{const r=x.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}})():null;
    const cs=card?getComputedStyle(card):null;
    return {
      shell:rect(root),
      modeRibbon:rect(mode),
      cardViewport:rect(viewport),
      prayerBody:rect(body),
      cardBorderTop:cs?.borderTopWidth??null,
      cardBackgroundImage:cs?.backgroundImage??null,
      cardBoxShadow:cs?.boxShadow??null,
      leftRailDisplay:left?getComputedStyle(left).display:null,
      rightRailDisplay:right?getComputedStyle(right).display:null,
      nonActiveOpacityMin:nonActive.length?Math.min(...nonActive):null,
    };
  });
  assert.ok(wide.modeRibbon?.width<340,"mode selector regressed into browser-width tabs: "+JSON.stringify(wide));
  assert.ok(wide.cardViewport?.width>=wide.prayerBody?.width,"transparent reader viewport no longer contains the centred prayer measure");
  assert.ok(wide.prayerBody?.width<=800,"prayer measure lost donor 790px maximum: "+JSON.stringify(wide));
  assert.equal(wide.cardBorderTop,"0px","giant bordered prayer card chrome returned");
  assert.equal(wide.cardBackgroundImage,"none","giant panel background returned behind prayer text");
  assert.equal(wide.cardBoxShadow,"none","giant card shadow returned");
  assert.equal(wide.leftRailDisplay,"flex","left ritual rail is not persistent in LIVE");
  assert.equal(wide.rightRailDisplay,"flex","right ritual rail is not persistent in LIVE");
  if(wide.nonActiveOpacityMin!=null)assert.ok(wide.nonActiveOpacityMin>=0.39,
    "surrounding prayer text became unreadably dark again: "+JSON.stringify(wide));
  await page.screenshot({path:resolve(out,"13-mass-wide-donor-shell.png"),fullPage:false});

  await writeFile(resolve(out,"mass-audit.json"),JSON.stringify({
    setup,opening,hierarchy,consecration,wordsState,elevationState,
    salience:{gloriaAdoramus,gloriaBow,incarnatus,agnus,lastGospelGenuflect,lastGospelRise},
    wide,phoneAudit,
    errors
  },null,2));
  assert.deepEqual(errors,[],"page errors during native Mass visual audit: "+JSON.stringify(errors));
  console.log("mass visual acceptance capture: PASS",JSON.stringify({opening,consecration},null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
