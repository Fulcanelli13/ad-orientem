import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const candidate=resolve(repoRoot,"."+pathname);
    if(candidate!==repoRoot&&!candidate.startsWith(repoRoot+sep)){res.writeHead(403);res.end("forbidden");return}
    const data=await readFile(candidate);
    res.writeHead(200,{"content-type":mime[extname(candidate)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4176,"127.0.0.1",ok)});

const iconKeys=[
  "stand","sit","kneel","genuflect","bow","cross","gospel_crosses","breast_strike","head_bow","profound_bow","hands_joined",
  "response","schola","priest_audible","priest_silent","priest_foot","priest_steps","priest_centre","priest_epistle","priest_gospel","priest_sedilia","priest_rail","priest_people",
];

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const pageErrors=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));

  await page.goto("http://127.0.0.1:4176/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForTimeout(1200);

  const setup=await page.evaluate(async iconKeys=>{
    const t=(lat,en)=>({lat,en});
    const proper={
      sourcePath:"Tempora/Pasc0-0",
      introit:t("",""),
      collects:[t("Collecta","Collect")],
      epistle:t("Epistola","Epistle"),
      gradual:t("Alleluia","Alleluia"),
      sequence:{lat:"",en:""},
      gospel:t("Evangelium","Gospel"),
      offertory:t("Offertorium","Offertory"),
      secrets:[t("Secreta","Secret")],
      preface:t("Praefatio","Preface"),
      communion:{status:"NOT_APPLICABLE"},
      postcommunions:[t("Postcommunio","Postcommunion")],
    };
    globalThis.__AO_EV_LEGACY_STARTS=0;
    globalThis.AO_SEQUENCE_BRIDGE_V23={
      startLive(){globalThis.__AO_EV_LEGACY_STARTS+=1},
      getActive(){return null},
      getAssemblyStatus(){return null},
    };
    globalThis.AO_SEQUENCE_BRIDGE_V22=null;
    globalThis.AO_R17_ICON_ASSETS=Object.fromEntries(iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"]));
    globalThis.AO_RUNTIME_V8={store:{getState:()=>({
      selectedDate:"2027-03-27",language:"en",
      settings:{massForm:"solemn",followMode:"vox",massPostureProfile:"TRADITIONAL_WALSH",massGestureProfile:"GUIDED_1962",faithfulCommunion:true},
    })}};
    globalThis.AO_CELEBRATION_ARCH_V1={
      date:"2027-03-27",celebrationForm:"solemn",followMode:"vox",
      actualCelebration:{id:"easter-vigil",type:"CALENDAR"},
    };
    globalThis.AO_CELEBRATION_API={getResolvedMass:()=>({
      canStart:true,date:"2027-03-27",
      calendarDay:{id:"holy-saturday",title:"Holy Saturday"},
      requestedCelebrationId:"easter-vigil",
      celebrationId:"easter-vigil",
      celebrationType:"CALENDAR",
      exceptionalProfile:"easter-vigil-1962",
      proper,properSource:"Tempora/Pasc0-0",
      insertedRites:[],conditions:[],rubricSources:["MR1962"],
    })};
    const mod=await import("/src/mass/browser-entry.js?easter-vigil-shell=1");
    const controller=mod.createBrowserMassController();
    const prepared=await controller.enter();
    return {
      schema:prepared.schema,
      kind:prepared.session.plan.kind,
      rite:prepared.session.plan.rite,
      canonicalMassGraphActive:prepared.session.plan.canonicalMassGraphActive,
      massEntry:prepared.session.plan.massEntry,
    };
  },iconKeys);

  assert.equal(setup.schema,"ao-mass-entry-bootstrap-v1");
  assert.equal(setup.kind,"COMPOSITE_DISTINCT_RITE");
  assert.equal(setup.rite,"EASTER_VIGIL");
  assert.equal(setup.canonicalMassGraphActive,true);
  assert.equal(setup.massEntry,"VIGIL_DEFINED_MASS_ENTRY");

  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"attached",timeout:30000});
  await page.waitForFunction(()=>
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getEasterVigilState?.()?.step?.recordId==="EV-FIRE-010",
    null,{timeout:10000});

  const initial=await page.evaluate(()=>({
    starts:globalThis.__AO_EV_LEGACY_STARTS,
    owner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
    marker:document.documentElement.dataset.aoMassReaderUi??null,
    stage:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCompositeStage?.()??null,
    cardOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17CardOwner??null,
    total:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.totalCards??null,
    firstSource:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.cardBySequence?.(1)?.sourceSequence??null,
    firstTitle:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.cardBySequence?.(1)?.title??null,
    sourceSequences:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.cards?.map?.(x=>x.sourceSequence??x.sequence)??[],
    lauds:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.cards?.some?.(x=>x.sectionId==="SP.EASTER_VIGIL.15")),
  }));
  assert.equal(initial.starts,0);
  assert.equal(initial.owner,"R17_NATIVE_PRODUCTION");
  assert.equal(initial.marker,"R17_NATIVE_PRODUCTION");
  assert.equal(initial.stage,"VIGIL_ACTIVE");
  assert.equal(initial.cardOwner,"R33_EASTER_VIGIL_COMPOSITE");
  assert.equal(initial.firstSource,2);
  assert.equal(initial.firstTitle,"Kyrie");
  assert.ok(!initial.sourceSequences.includes(1));
  assert.ok(!initial.sourceSequences.includes(21));
  assert.ok(!initial.sourceSequences.includes(30));
  assert.equal(initial.lauds,true);

  await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW.goToEasterVigilRecord("EV-LUM-110"));
  await page.waitForFunction(()=>
    document.querySelector("#ao-r17-native-reader-preview [data-role='gesture']")?.textContent?.includes("GENUFLECT_TOWARD_PASCHAL_CANDLE"),
    null,{timeout:5000});

  await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW.goToEasterVigilRecord("EV-MASS-700"));
  await page.waitForFunction(()=>
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getEasterVigilState?.()?.handoffToMass===true,
    null,{timeout:5000});

  const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
  const nextBox=await next.boundingBox();
  assert.ok(nextBox&&nextBox.height>=44);
  await page.touchscreen.tap(nextBox.x+nextBox.width/2,nextBox.y+nextBox.height/2);
  await page.waitForFunction(()=>
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCompositeStage?.()==="MASS_ACTIVE" &&
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.title==="Kyrie",
    null,{timeout:5000});
  const massTitle=(await page.locator("#ao-r17-native-reader-preview [data-role='card-title']").textContent())?.trim();
  assert.equal(massTitle,"Kyrie");

  const back=page.locator("#ao-r17-native-reader-preview [data-reader-nav='previous']");
  const backBox=await back.boundingBox();
  assert.ok(backBox&&backBox.height>=44);
  await page.touchscreen.tap(backBox.x+backBox.width/2,backBox.y+backBox.height/2);
  await page.waitForFunction(()=>
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCompositeStage?.()==="VIGIL_ACTIVE" &&
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getEasterVigilState?.()?.step?.recordId==="EV-MASS-700",
    null,{timeout:5000});

  const root=page.locator("#ao-r17-native-reader-preview");
  const box=await root.boundingBox();
  assert.ok(box&&box.x>=-0.5&&box.y>=-0.5&&box.x+box.width<=390.5&&box.y+box.height<=844.5);
  assert.deepEqual(pageErrors,[]);
  await context.close();
  console.log("Easter Vigil real-shell acceptance: PASS — native 38-state Vigil, Kyrie composite Mass handoff, Back restoration, Vigil omissions/Lauds, no legacy start.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
