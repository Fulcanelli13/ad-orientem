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
            massGestureProfile:"GUIDED_1962",faithfulCommunion:true,textMode:"oriented",
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
        proper,properSource:"Sancti/10-07",insertedRites:[],conditions:[],rubricSources:["RG60"],
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
    parametersButton:Boolean(document.querySelector("#ao-r17-native-reader-preview [data-reader-parameters]")),
    homeControlText:document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")?.textContent?.trim()??"",
    parametersControlText:document.querySelector("#ao-r17-native-reader-preview [data-reader-parameters]")?.textContent?.trim()??"",
    homeControlRenderer:document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")?.dataset?.aoAssetRenderer??null,
    parametersControlRenderer:document.querySelector("#ao-r17-native-reader-preview [data-reader-parameters]")?.dataset?.aoAssetRenderer??null,
    homeControlMask:getComputedStyle(document.querySelector("#ao-r17-native-reader-preview [data-reader-home] .ao-reader-top-icon"))?.webkitMaskImage||"",
    parametersControlMask:getComputedStyle(document.querySelector("#ao-r17-native-reader-preview [data-reader-parameters] .ao-reader-top-icon"))?.webkitMaskImage||"",
    homeControlRect:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")?.getBoundingClientRect();return x?{width:x.width,height:x.height}:null})(),
    parametersControlRect:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-reader-parameters]")?.getBoundingClientRect();return x?{width:x.width,height:x.height}:null})(),
    floatingClose:Boolean(document.querySelector("#ao-r17-native-reader-preview [aria-label='Close Mass reader']")),
    sectionJumpDisabled:document.querySelector("#ao-r17-native-reader-preview [data-role='section-jump']")?.disabled??null,
    sectionButtonCount:document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-section]").length,
    totalCards:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.totalCards??null,
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
  assert.equal(opening.parametersButton,true,"LIVE first ribbon lost Settings/parameters control");
  assert.equal(opening.homeControlText,"","Home control retained obsolete text after canonical icon externalization");
  assert.equal(opening.parametersControlText,"","Parameters control retained obsolete text after canonical icon externalization");
  assert.equal(opening.homeControlRenderer,"mask","Home control is not owned by the canonical mask renderer");
  assert.equal(opening.parametersControlRenderer,"mask","Parameters control is not owned by the canonical mask renderer");
  assert.match(opening.homeControlMask,/ao-nav-home\.png/,"Home control does not render the frozen navigation asset");
  assert.match(opening.parametersControlMask,/ao-nav-settings\.png/,"Parameters control does not render the frozen navigation asset");
  assert.ok(opening.homeControlRect?.width>=44&&opening.homeControlRect?.height>=44,"Home control lost a usable phone touch target");
  assert.ok(opening.parametersControlRect?.width>=44&&opening.parametersControlRect?.height>=44,"Parameters control lost a usable phone touch target");
  assert.equal(opening.floatingClose,false,"obsolete floating close button still overlays the LIVE ribbon");
  assert.equal(opening.sectionJumpDisabled,false,"source-first section jump is disabled");
  assert.equal(opening.sectionButtonCount,opening.totalCards,"section jump does not expose the complete current display model");
  assert.ok(opening.shellRect?.width<=390.5&&opening.shellRect?.height<=844.5,"native LIVE shell overflows phone viewport");

  const scholaDock=page.locator("#ao-r17-native-reader-preview .ao-schola-dock");
  const scholaToggle=scholaDock.locator("[data-schola-toggle]");
  await scholaToggle.click();
  assert.equal(await scholaDock.getAttribute("data-collapsed"),"true","Schola hide control did not collapse the dock");
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
  assert.equal(consecration.stageLeft,"false","empty faithful cue rail still consumes phone width at the Consecration");
  assert.notEqual(consecration.guideShort,"","short Guide rubric is not visible in the state ribbon");
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
  await page.screenshot({path:resolve(out,"07-mass-live-consecration.png"),fullPage:false});

  await writeFile(resolve(out,"mass-audit.json"),JSON.stringify({setup,opening,consecration,errors},null,2));
  assert.deepEqual(errors,[],"page errors during native Mass visual audit: "+JSON.stringify(errors));
  console.log("mass visual acceptance capture: PASS",JSON.stringify({opening,consecration},null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
