import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css",
 ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const ICONS=["stand","sit","kneel","genuflect","bow","cross","gospel_crosses","breast_strike",
"head_bow","profound_bow","hands_joined","response","schola","priest_audible","priest_silent",
"priest_foot","priest_steps","priest_centre","priest_epistle","priest_gospel","priest_sedilia",
"priest_rail","priest_people"];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const [date,language] of [["2024-05-06","en"],["2027-05-03","fr"]]){
  const context=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:"block"});
  const page=await context.newPage();
  // Avoid a second, automatically installed preflight owning the same surface:
  // this test wires one explicit synthetic-certified preflight to the actual
  // production R17 controller. Normal auto-install is covered by shell tests.
  await page.addInitScript(()=>{
   globalThis.AO_R17_BROWSER_ENTRY=Object.freeze({installed:true});
  });
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+
     "/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForTimeout(1200);
   await page.evaluate(async({date,language,icons})=>{
    const t=(latin,vernacular)=>({lat:latin,en:vernacular,fr:vernacular});
    const ordinary={
     sourcePath:"Tempora/Pasc5-0",introit:t("Introitus ordinarius","Ordinary Introit"),
     collects:[t("Collecta ordinaria","Ordinary Collect")],
     epistle:t("Epistola ordinaria","Ordinary Epistle"),
     gradual:t("Alleluia ordinaria","Ordinary Alleluia"),
     gospel:t("Evangelium ordinarium","Ordinary Gospel"),
     offertory:t("Offertorium ordinarium","Ordinary Offertory"),
     secrets:[t("Secreta ordinaria","Ordinary Secret")],
     preface:t("Praefatio paschalis","Easter Preface"),
     communion:t("Communio ordinaria","Ordinary Communion"),
     postcommunions:[t("Postcommunio ordinaria","Ordinary Postcommunion")]
    };
    globalThis.__AO_ROGATION_LEGACY_STARTS=0;
    globalThis.AO_SEQUENCE_BRIDGE_V23={
     startLive(){globalThis.__AO_ROGATION_LEGACY_STARTS++},
     getActive(){return null},getAssemblyStatus(){return null}
    };
    globalThis.AO_SEQUENCE_BRIDGE_V22=null;
    globalThis.AO_R17_ICON_ASSETS=Object.fromEntries(icons.map(k=>[k,"data:image/svg+xml;base64,PHN2Zy8+"]));
    globalThis.AO_RUNTIME_V8={store:{getState:()=>({
     selectedDate:date,language,
     settings:{massForm:"mc-incense",followMode:"vox",
      massPostureProfile:"TRADITIONAL_WALSH",
      massGestureProfile:"GUIDED_1962",faithfulCommunion:true}
    })},resolver:{resolveDay:async()=>({
     status:"ready",day:{main:{rank:4}},
     proper:{status:"ready",data:{sourcePath:"Tempora/Pasc5-0"}}
    })}};
    globalThis.AO_CELEBRATION_ARCH_V1={date,celebrationForm:"mc-incense",
     followMode:"vox",actualCelebration:{id:"feria_rogationum",type:"CALENDAR"}};
    globalThis.AO_CELEBRATION_API={getResolvedMass:()=>({
     canStart:true,date,calendarRank:4,
     calendarDay:{id:"feria_rogationum",title:"Rogations weekday",rank:4},
     requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",
     celebrationType:"CALENDAR",properSource:"Tempora/Pasc5-0",
     proper:ordinary,insertedRites:[],conditions:[],rubricSources:["MR1962"]
    })};
    let flow=document.getElementById("ao-mass-flow-v1");
    if(!flow){
     flow=document.createElement("section");flow.id="ao-mass-flow-v1";
     document.body.appendChild(flow);
    }
    if(!flow.querySelector(".aoFlowActions")){
     const actions=document.createElement("div");actions.className="aoFlowActions";
     actions.innerHTML='<button data-ao-start-live type="button">Start Mass</button>';
     flow.appendChild(actions);
    }
    const {mountRogationPreflight}=await import("/src/mass/rogation-preflight.js");
    globalThis.__rogationFetches=[];globalThis.__rogationFetchedLibrary={};
    const fetchApproved=async url=>{
     const response=await fetch(url);
     globalThis.__rogationFetches.push({url:String(url),status:response.status});
     const d=await response.json();
     if(d.schema==="AO_1962_ROGATION_MASS_SOURCE_GATE_V1"){
      d.status="PUBLISHED_1962_ROGATION_PROPER";d.publicationAllowed=true;
     }else if(d.schema==="AO_1962_ROGATION_PROPER_V1"){
      d.status="PUBLISHED_1962_ROGATION_PROPER";d.publicationAllowed=true;
     }else if(d.schema==="AO_1962_ROGATION_EASTER_PREFACE_V1"){
      d.status="PUBLISHED_1962_EASTER_PREFACE";d.published=true;d.publicationAllowed=true;
     }
     globalThis.__rogationFetches.at(-1).schema=d.schema;
     globalThis.__rogationFetches.at(-1).finalStatus=d.status;
     globalThis.__rogationFetchedLibrary[d.schema]=d;
     return {ok:true,json:async()=>d};
    };
    globalThis.__rogationPreflight=mountRogationPreflight({
     doc:document,getResolvedMass:()=>globalThis.AO_CELEBRATION_API.getResolvedMass(),
     resolveDay:date=>globalThis.AO_RUNTIME_V8.resolver.resolveDay(date),
     fetchImpl:fetchApproved,language:()=>language
    });
   },{date,language,icons:ICONS});
   try{
    await page.waitForFunction(()=>document.querySelector(
      '[data-rogation-choice] option[value="ROGATION_MASS"]')?.disabled===false,
      null,{timeout:12000});
   }catch(error){
    const diagnostic=await page.evaluate(async()=>{
     const mod=await import("/src/mass/rogation-preflight.js");
     const host=globalThis.AO_CELEBRATION_API?.getResolvedMass?.();
     const fetched=globalThis.__rogationFetchedLibrary??{};
     return {
      status:globalThis.__rogationPreflight?.status?.(),
      fetchedSourceReady:mod.rogationPublicChoiceReady({
        sourceGate:fetched["AO_1962_ROGATION_MASS_SOURCE_GATE_V1"],
        sourceProper:fetched["AO_1962_ROGATION_PROPER_V1"],
        preface:fetched["AO_1962_ROGATION_EASTER_PREFACE_V1"]
      }),
      date:host?.date,canStart:host?.canStart,rank:host?.calendarRank,
      properSource:host?.properSource,
      candidate:mod.resolvedRogationCandidate(host),
      dom:document.querySelector("[data-ao-rogation-preflight]")?.outerHTML?.slice(0,1700)??null,
      fetches:globalThis.__rogationFetches??[],
      selection:globalThis.__rogationPreflight?.selectionFor?.(host)??null
     };
    });
    console.error("ROGATION_SELECTED_PREFLIGHT_DIAGNOSTIC",date,language,JSON.stringify(diagnostic));
    throw error;
   }
   assert.equal(await page.locator('[data-ao-rogation-preflight]').count(),1,
     "Duplicated Mass preflight would create conflicting rite choices");
   const area=page.locator('[data-ao-rogation-preflight]');
   await area.locator("summary").click();
   await page.selectOption("[data-rogation-service]","PUBLIC_PROCESSION");
   await page.selectOption("[data-rogation-choice]","ROGATION_MASS");
   const selection=await page.evaluate(()=>globalThis.__rogationPreflight.selectionFor(
     globalThis.AO_CELEBRATION_API.getResolvedMass()));
   assert.equal(selection.choice,"ROGATION_MASS");
   assert.equal(selection.service,"PUBLIC_PROCESSION");
   assert.match(selection.preface.lat,/in hoc potissimum/);
   const result=await page.evaluate(async()=>{
    const mod=await import("/src/mass/browser-entry.js?rogation-full-selected-e2e");
    const controller=mod.createBrowserMassController({
      rogationPreflight:globalThis.__rogationPreflight
    });
    const prepared=await controller.enter();
    return {
     entry:prepared.session.plan.massEntry,
     preceding:[...prepared.session.plan.precedingGraphs],
     colour:prepared.session.resolvedMass.provenance.colour,
     gloria:prepared.session.resolvedMass.provenance.gloria,
     credo:prepared.session.resolvedMass.provenance.credo,
     sourcePath:prepared.session.resolvedMass.proper?.data?.sourcePath,
     preface:prepared.session.resolvedMass.proper?.data?.preface,
     introit:prepared.session.resolvedMass.proper?.data?.introit,
     starts:globalThis.__AO_ROGATION_LEGACY_STARTS,
    };
   });
   assert.equal(result.entry,"INTROIT");
   assert.deepEqual(result.preceding,["ROGATIONS"]);
   assert.equal(result.colour,"violet");
   assert.equal(result.gloria,false);assert.equal(result.credo,false);
   assert.equal(result.sourcePath,"Rogationes/1962/Exaudivit");
   assert.match(result.introit.lat,/Exaudivit de templo/);
   assert.match(result.preface.lat,/in hoc potissimum/);
   assert.ok(result.preface[language].length>150);
   assert.equal(result.starts,0,"Legacy reader was incorrectly started");
   await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id==="ROG-R01",
    null,{timeout:10000});
   const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
   const back=page.locator("#ao-r17-native-reader-preview [data-reader-nav='previous']");
   for(let i=1;i<6;i++){
    const box=await next.boundingBox();assert.ok(box&&box.height>=44);
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
    await page.waitForFunction(id=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id===id,
      "ROG-R0"+(i+1),{timeout:5000});
   }
   const handoffBox=await next.boundingBox();assert.ok(handoffBox&&handoffBox.height>=44);
   await page.touchscreen.tap(handoffBox.x+handoffBox.width/2,handoffBox.y+handoffBox.height/2);
   await page.waitForFunction(()=>
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId==="AO.CARD.001",
    null,{timeout:7000});
   const title=(await page.locator("#ao-r17-native-reader-preview [data-role='card-title']").textContent())?.trim();
   assert.equal(title,"Introit","Rogations must hand off directly to Introit, not foot prayers");
   const backBox=await back.boundingBox();assert.ok(backBox&&backBox.height>=44);
   await page.touchscreen.tap(backBox.x+backBox.width/2,backBox.y+backBox.height/2);
   await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id==="ROG-R06",
    null,{timeout:5000});
   // Release gate: this violet II-class Mass must never display Gloria/Credo.
   const takeNext=async expectedSource=>{
    const box=await next.boundingBox();assert.ok(box&&box.height>=44);
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
    await page.waitForFunction(expected=>
     (globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sourceSectionId ??
      globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId)===expected,
     expectedSource,{timeout:5000});
   };
   await takeNext("AO.CARD.001");
   await takeNext("AO.CARD.002");
   await takeNext("AO.CARD.004"); // Kyrie -> Collect: no Gloria
   for(const id of ["AO.CARD.005","AO.CARD.006","AO.CARD.007","AO.CARD.008","AO.CARD.010"]){
    await takeNext(id);
   }
   const card=await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.());
   assert.match(card.title,/Offertory/i);
   assert.deepEqual(errors,[],language+" produced a browser exception");
  }finally{await context.close()}
 }
 console.log("Synthetic-certified Rogation II-class E2E PASS: EN/FR pre-Mass choice, R17 procession, Introit, Back; production source remains unpublished.");
}finally{await browser?.close();await new Promise(ok=>server.close(()=>ok()))}
