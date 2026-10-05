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
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4175,"127.0.0.1",ok)});

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

  await page.goto("http://127.0.0.1:4175/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForTimeout(1200);

  const setup=await page.evaluate(async iconKeys=>{
    const t=(lat,en)=>({lat,en});
    const proper={
      sourcePath:"Commune/C10a",
      introit:t("Introitus Nuptialis","Nuptial Introit"),
      collects:[t("Collecta Nuptialis","Nuptial Collect")],
      epistle:t("Epistola Nuptialis","Nuptial Epistle"),
      gradual:t("Graduale Nuptiale","Nuptial Gradual"),
      sequence:{lat:"",en:""},
      gospel:t("Evangelium Nuptiale","Nuptial Gospel"),
      offertory:t("Offertorium Nuptiale","Nuptial Offertory"),
      secrets:[t("Secreta Nuptialis","Nuptial Secret")],
      preface:t("Praefatio","Preface"),
      communion:t("Communio Nuptialis","Nuptial Communion"),
      postcommunions:[t("Postcommunio Nuptialis","Nuptial Postcommunion")],
    };
    globalThis.__AO_NUPTIAL_LEGACY_STARTS=0;
    globalThis.AO_SEQUENCE_BRIDGE_V23={
      startLive(){globalThis.__AO_NUPTIAL_LEGACY_STARTS+=1},
      getActive(){return null},
      getAssemblyStatus(){return null},
    };
    globalThis.AO_SEQUENCE_BRIDGE_V22=null;
    globalThis.AO_R17_ICON_ASSETS=Object.fromEntries(iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"]));
    globalThis.AO_RUNTIME_V8={store:{getState:()=>({
      selectedDate:"2027-06-12",language:"en",
      settings:{massForm:"mc-incense",followMode:"vox",massPostureProfile:"TRADITIONAL_WALSH",massGestureProfile:"GUIDED_1962",faithfulCommunion:true},
    })}};
    globalThis.AO_CELEBRATION_ARCH_V1={
      date:"2027-06-12",celebrationForm:"mc-incense",followMode:"vox",
      actualCelebration:{id:"nuptial",type:"NUPTIAL"},
    };
    globalThis.AO_CELEBRATION_API={getResolvedMass:()=>({
      canStart:true,date:"2027-06-12",
      calendarDay:{id:"feria",title:"Feria"},
      requestedCelebrationId:"nuptial",celebrationId:"nuptial",celebrationType:"NUPTIAL",
      proper,properSource:"Commune/C10a",insertedRites:[],conditions:[],rubricSources:["MR1962"],
    })};
    const mod=await import("/src/mass/browser-entry.js?nuptial-shell=1");
    const controller=mod.createBrowserMassController();
    const prepared=await controller.enter();
    return {
      schema:prepared.schema,
      overlays:[...(prepared.session.resolvedMass.overlays??[])],
      insertions:[...(prepared.session.plan.insertions??[])],
    };
  },iconKeys);

  assert.equal(setup.schema,"ao-mass-entry-bootstrap-v1");
  assert.ok(setup.overlays.includes("NUPTIAL"));
  assert.deepEqual(setup.insertions,[
    "FIRST_NUPTIAL_BLESSING_AFTER_PATER",
    "DEUS_QUI_POTESTATE_NUPTIAL_BLESSING",
    "FINAL_BLESSING_OVER_SPOUSES",
  ]);

  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"attached",timeout:30000});
  const model=await page.evaluate(()=>({
    starts:globalThis.__AO_NUPTIAL_LEGACY_STARTS,
    owner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
    marker:document.documentElement.dataset.aoMassReaderUi??null,
    total:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.totalCards??null,
    sourceTotal:globalThis.AO_R17_NATIVE_READER_PREVIEW?.sourceModel?.totalCards??null,
    productOwner:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.structureOwner??null,
    sourceOwner:globalThis.AO_R17_NATIVE_READER_PREVIEW?.sourceModel?.structureOwner??null,
    count:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.nuptialInsertionCount??null,
    cards:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.cards?.map?.(x=>({
      id:x.sectionId,sourceSectionId:x.sourceSectionId??null,
      nuptialInsertion:Boolean(x.nuptialInsertion),
      faithfulPosture:x.faithfulPosture??null,faithfulGesture:x.faithfulGesture??null,
    }))??[],
  }));
  assert.equal(model.starts,0);
  assert.equal(model.owner,"R17_NATIVE_PRODUCTION");
  assert.equal(model.marker,"R17_NATIVE_PRODUCTION");
  assert.equal(model.total,51,"Nuptial product reader must be 48 LIVE presentation steps plus three source-pinned insertions");
  assert.equal(model.sourceTotal,42,"Nuptial 48-step presentation replaced the certified 39+3 source model");
  assert.equal(model.productOwner,"SOURCE_FIRST_LIVE_PRODUCT_48");
  assert.match(model.sourceOwner,/SOURCE_FIRST_LIVE\+NUPTIAL_INSERTIONS/);
  assert.equal(model.count,3);

  const insertionCards=model.cards.filter(x=>x.nuptialInsertion);
  assert.deepEqual(insertionCards.map(x=>x.id),["AO.NUPTIAL.01","AO.NUPTIAL.02","AO.NUPTIAL.03"]);
  assert.ok(insertionCards.every(x=>x.faithfulPosture===null&&x.faithfulGesture===null));

  const ids=model.cards.map(x=>x.id);
  const pater=model.cards.findIndex(x=>x.sourceSectionId==="AO.CARD.019"||x.id==="AO.CARD.019");
  const dismissal=model.cards.findIndex(x=>x.sourceSectionId==="AO.CARD.028"||x.id==="AO.CARD.028");
  assert.deepEqual(ids.slice(pater+1,pater+3),["AO.NUPTIAL.01","AO.NUPTIAL.02"]);
  assert.equal(ids[dismissal+1],"AO.NUPTIAL.03");

  await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW.showSection("AO.NUPTIAL.01"));
  await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId==="AO.NUPTIAL.01");
  const firstTitle=(await page.locator("#ao-r17-native-reader-preview [data-role='card-title']").textContent())?.trim();
  assert.ok(firstTitle&&firstTitle.length>0);

  const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
  const box=await next.boundingBox();
  assert.ok(box&&box.height>=44);
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId==="AO.NUPTIAL.02");

  await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW.showSection("AO.NUPTIAL.03"));
  await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId==="AO.NUPTIAL.03");

  assert.deepEqual(pageErrors,[]);
  await context.close();
  console.log("Nuptial real-shell acceptance: PASS — 51-step product presentation over the certified 42-step source model, with three source-pinned insertions, touch navigation, no faithful-state leakage, no legacy start.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
