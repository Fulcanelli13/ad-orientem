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
  browser=await chromium.launch({headless:true,channel:"chromium"});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB"});
  const page=await context.newPage();
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
  // The dedicated real-touch Guide gate proves Close works. Dismiss the
  // inspected sheet as test cleanup, without repeating a touch/control contract
  // inside the long screenshot journey.
  await page.evaluate(()=>{
    const pop=document.querySelector("#ao-r17-native-reader-preview [data-role='guide-popover']");
    if(pop){pop.hidden=true;pop.replaceChildren();}
  });

  // Schola hide/show, genuine pointer resizing, speed, pause, translation and
  // navigation are covered in the independent real-shell Schola gate. Preserve
  // a read-only sourced Schola check and opening screenshot here so the visual
  // journey remains focused on the 48-card Mass, cues and cinematics.
  const openingSchola=await page.evaluate(()=>{
    const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    return {
      trackId:preview?.getScholaState?.()?.schola?.trackId??null,
      text:document.querySelector("#ao-r17-native-reader-preview [data-role='schola']")?.textContent?.trim()??"",
      toggle:!!document.querySelector("#ao-r17-native-reader-preview [data-schola-toggle]"),
      resize:!!document.querySelector("#ao-r17-native-reader-preview [data-schola-resize]"),
      sourceText:preview?.getScholaState?.()?.schola?.latin??null,
    };
  });
  assert.ok(openingSchola.toggle&&openingSchola.resize,"Schola chrome is absent from the LIVE visual shell");
  assert.ok(openingSchola.sourceText,"opening LIVE card has no sourced Schola text");
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
  console.log("Full visual: BEFORE section-menu tap");
  await page.locator("#ao-r17-native-reader-preview [data-role='section-jump']").evaluate(button=>button.click());
  console.log("Full visual: AFTER section-menu tap");
  const hostSection=page.locator("#ao-r17-native-reader-preview [data-reader-section]").filter({hasText:/Consecration.*Host/i}).first();
  assert.equal(await hostSection.count(),1,"source-first section menu exposes no Host Consecration");
  console.log("Full visual: BEFORE Host Consecration tap");
  await hostSection.evaluate(button=>button.click());
  console.log("Full visual: AFTER Host Consecration tap");
  await page.waitForFunction(()=>/Consecration/i.test(document.querySelector("#ao-r17-native-reader-preview [data-role='section-title']")?.textContent??""),null,{timeout:5000});
  console.log("Full visual: Host Consecration rendered");

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
  assert.notEqual(consecration.guideShort,"","short Guide rubric is not visible in the state ribbon");
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
  console.log("Full visual: BEFORE Consecration screenshot");
  await page.screenshot({path:resolve(out,"07-mass-live-consecration.png"),fullPage:false});
  console.log("Full visual: AFTER Consecration screenshot");

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
    for(let attempt=0;attempt<5;attempt++){
      await cue.evaluate(el=>{
        const card=el.closest(".ao-prayer-card");
        const cr=card.getBoundingClientRect(),er=el.getBoundingClientRect();
        const top=er.top-cr.top+card.scrollTop;
        const bottom=er.bottom-cr.top+card.scrollTop;
        const max=Math.max(0,card.scrollHeight-card.clientHeight);
        card.scrollTop=Math.min(max,Math.max(0,(top+bottom)/2-card.clientHeight*.39));
        card.dispatchEvent(new Event("scroll"));
      });
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
      postureOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerPosture??null,
    }),cueId);
  }

  console.log("Full visual: elevation complete; beginning ritual cue salience");
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
  await page.screenshot({path:resolve(out,"09-mass-gloria-bow.png"),fullPage:false});

  const incarnatus=await focusCanonicalCue("AO.SM.C0096");
  assert.match(incarnatus.gesture,/GENUFLECT/i,"Incarnatus genuflection is not visibly salient");
  assert.equal(incarnatus.posture,"STAND","Incarnatus transient genuflection incorrectly replaced the persistent standing posture");
  assert.equal(incarnatus.leftRail,"true");
  assert.equal(incarnatus.gestureIconHidden,false,"Incarnatus lost its canonical genuflect icon");
  assert.equal(incarnatus.targetActive,"true");
  await page.screenshot({path:resolve(out,"10-mass-incarnatus.png"),fullPage:false});

  const agnus=await focusCanonicalCue("AO.SM.C0222");
  assert.match(agnus.gesture,/STRIKE BREAST/i,"Agnus Dei breast-strike cue is not visibly salient");
  assert.equal(agnus.posture,"STAND","Agnus Dei source posture is not visible in the faithful state ribbon");
  assert.equal(agnus.leftRail,"true");
  assert.equal(agnus.gestureIconHidden,false,"Agnus Dei breast strike lost its canonical icon");
  assert.equal(agnus.targetActive,"true");
  await page.screenshot({path:resolve(out,"11-mass-agnus-dei.png"),fullPage:false});

  const lastGospelGenuflect=await focusCanonicalCue("AO.SM.C0273");
  assert.match(lastGospelGenuflect.gesture,/GENUFLECT/i,"Last Gospel ET VERBUM CARO cue is not visibly salient");
  assert.equal(lastGospelGenuflect.posture,"STAND","Last Gospel persistent posture should remain standing around the transient genuflection");
  assert.equal(lastGospelGenuflect.leftRail,"true");
  assert.equal(lastGospelGenuflect.gestureIconHidden,false,"Last Gospel genuflect lost its canonical icon");
  assert.equal(lastGospelGenuflect.targetActive,"true");
  await page.screenshot({path:resolve(out,"12-mass-last-gospel-genuflect.png"),fullPage:false});

  const lastGospelRise=await focusCanonicalCue("AO.SM.C0274");
  assert.match(lastGospelRise.gesture,/RISE/i,"Last Gospel return-to-standing cue is not visibly salient");
  assert.equal(lastGospelRise.posture,"STAND");
  assert.equal(lastGospelRise.leftRail,"true");
  assert.equal(lastGospelRise.targetActive,"true");

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
  console.log("Full visual: beginning wide-layout screenshot");
  await page.screenshot({path:resolve(out,"13-mass-wide-donor-shell.png"),fullPage:false});
  console.log("Full visual: wide-layout screenshot complete");

  await writeFile(resolve(out,"mass-audit.json"),JSON.stringify({
    setup,opening,consecration,wordsState,elevationState,
    salience:{gloriaBow,incarnatus,agnus,lastGospelGenuflect,lastGospelRise},
    wide,
    errors
  },null,2));
  assert.deepEqual(errors,[],"page errors during native Mass visual audit: "+JSON.stringify(errors));
  console.log("mass visual acceptance capture: PASS",JSON.stringify({opening,consecration},null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
