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
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
const ICONS=["stand","sit","kneel","genuflect","bow","cross","gospel_crosses","breast_strike",
"head_bow","profound_bow","hands_joined","response","schola","priest_audible","priest_silent",
"priest_foot","priest_steps","priest_centre","priest_epistle","priest_gospel","priest_sedilia",
"priest_rail","priest_people"];
try{
 browser=await chromium.launch({headless:true});
 for(const [date,language,service,votiveExpected] of [
  ["2026-04-25","en","PUBLIC_PROCESSION",true],
  ["2027-04-25","fr","PUBLIC_PROCESSION",true],
  ["2038-04-27","fr","ORDINARY_AUTHORIZED_SUPPLICATIONS",false]
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:"block"});
  const page=await context.newPage();
  await page.addInitScript(()=>{globalThis.AO_R17_BROWSER_ENTRY=Object.freeze({installed:true})});
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+
     "/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
    null,{timeout:20000});
   const actualDay=await page.evaluate(async date=>{
    const day=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
    if(day?.status!=="ready"||day?.proper?.status!=="ready"||
      !day?.proper?.data?.sourcePath||!Number.isInteger(Number(day?.day?.main?.rank)))
      throw new Error("Actual DayResolver did not source the Major Litany calendar day");
    globalThis.__majorLitanyDay=day;
    return {date,rank:Number(day.day.main.rank),source:day.proper.data.sourcePath,
      title:day.day.main.title};
   },date);
   assert.ok(actualDay.source);
   await page.evaluate(async({date,language,icons})=>{
    const t=(lat,en)=>({lat,en,fr:en});
    const day=globalThis.__majorLitanyDay;
    const proper={
      sourcePath:day.proper.data.sourcePath,
      introit:t("Introitus de die","Day Introit"),
      collects:[t("Oratio de die","Day Collect")],
      epistle:t("Lectio de die","Day Epistle"),
      gradual:t("Graduale de die","Day Gradual"),
      gospel:t("Evangelium de die","Day Gospel"),
      offertory:t("Offertorium de die","Day Offertory"),
      secrets:[t("Secreta de die","Day Secret")],
      preface:t("Praefatio de die","Day Preface"),
      communion:t("Communio de die","Day Communion"),
      postcommunions:[t("Postcommunio de die","Day Postcommunion")]
    };
    globalThis.__majorLegacyStart=0;
    globalThis.AO_SEQUENCE_BRIDGE_V23={
      startLive(){globalThis.__majorLegacyStart++},
      getActive(){return null},getAssemblyStatus(){return null}
    };
    globalThis.AO_SEQUENCE_BRIDGE_V22=null;
    globalThis.AO_R17_ICON_ASSETS=Object.fromEntries(icons.map(k=>[k,"data:image/svg+xml;base64,PHN2Zy8+"]));
    globalThis.AO_RUNTIME_V8={store:{getState:()=>({
      selectedDate:date,language,
      settings:{massForm:"mc-incense",followMode:"vox",
       massPostureProfile:"TRADITIONAL_WALSH",
       massGestureProfile:"GUIDED_1962",faithfulCommunion:true}
    })},resolver:{resolveDay:async()=>day}};
    globalThis.AO_CELEBRATION_ARCH_V1={date,celebrationForm:"mc-incense",
      followMode:"vox",actualCelebration:{id:"appointed-calendar-day",type:"CALENDAR"}};
    globalThis.AO_CELEBRATION_API={getResolvedMass:()=>({
      canStart:true,date,calendarRank:Number(day.day.main.rank),
      calendarDay:{id:"appointed-calendar-day",title:day.day.main.title,rank:Number(day.day.main.rank)},
      requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",celebrationType:"CALENDAR",
      properSource:day.proper.data.sourcePath,proper,
      insertedRites:[],conditions:[],rubricSources:["MR1962"]
    })};
    let flow=document.getElementById("ao-mass-flow-v1");
    if(!flow){flow=document.createElement("section");flow.id="ao-mass-flow-v1";document.body.appendChild(flow)}
    if(!flow.querySelector(".aoFlowActions")){
      const actions=document.createElement("div");actions.className="aoFlowActions";
      actions.innerHTML='<button data-ao-start-live type="button">Start Mass</button>';
      flow.appendChild(actions);
    }
    const {mountRogationPreflight}=await import("/src/mass/rogation-preflight.js");
    globalThis.__majorPreflight=mountRogationPreflight({
      doc:document,getResolvedMass:()=>globalThis.AO_CELEBRATION_API.getResolvedMass(),
      resolveDay:()=>day,language:()=>language
    });
   },{date,language,icons:ICONS});
   await page.waitForSelector("[data-ao-rogation-preflight]",{timeout:12000});
   assert.equal(await page.locator("[data-ao-rogation-preflight]").count(),1);
   await page.locator("[data-ao-rogation-preflight] summary").click();
   await page.waitForFunction(()=>globalThis.__majorPreflight?.status?.().sourceLoading===false,
    null,{timeout:10000});
   const option=page.locator('[data-rogation-choice] option[value="ROGATION_MASS"]');
   const eligibility=await page.evaluate(async()=>{
    const m=await import("/src/mass/rogation-preflight.js");
    const legacy=globalThis.AO_CELEBRATION_API.getResolvedMass();
    const resolved=globalThis.__majorLitanyDay;
    const opt=document.querySelector('[data-rogation-choice] option[value="ROGATION_MASS"]');
    return {
      candidate:m.resolvedRogationCandidate(legacy,resolved,{requireResolver:true}),
      domOptionDisabled:opt?.disabled,disabledAttr:opt?.getAttribute("disabled"),
      selectorValue:document.querySelector("[data-rogation-choice]")?.value,
      preflight:globalThis.__majorPreflight?.status?.(),
      rootCount:document.querySelectorAll("[data-ao-rogation-preflight]").length,
      date:legacy?.date,originalDaySource:resolved?.proper?.data?.sourcePath
    };
   });
   console.log("MAJOR_VOTIVE_BROWSER_ELIGIBILITY",JSON.stringify(eligibility));
   assert.equal(eligibility.candidate.observance,"MAJOR");
   assert.equal(eligibility.candidate.votiveAllowed,votiveExpected,
    "First-class Easter octave impediment must be distinct from certified Eastertide votive");
   assert.equal(eligibility.domOptionDisabled,!votiveExpected,"Votive option eligibility differs from real day");
   assert.equal(await option.getAttribute("disabled"),votiveExpected?null:"",
    "Votive DOM state must reflect real independent Major certificate and first-class impediment");
   const status=await page.locator("[data-rogation-status]").textContent();
   assert.match(status,votiveExpected?
    (language==="fr"?/exige des litanies publiques/i:/requires explicitly selected public litanies/i):
    (language==="fr"?/Ire classe/i:/first-class celebration/i));
   const before=await page.evaluate(()=>globalThis.__majorPreflight.selectionFor(
    globalThis.AO_CELEBRATION_API.getResolvedMass()));
   assert.equal(before,null,"Date must never automatically insert public Litanies");
   await page.selectOption("[data-rogation-service]",service);
   if(votiveExpected)await page.selectOption("[data-rogation-choice]","ROGATION_MASS");
   const selection=await page.evaluate(()=>globalThis.__majorPreflight.selectionFor(
    globalThis.AO_CELEBRATION_API.getResolvedMass()));
   assert.equal(selection.observance,"MAJOR");
   assert.equal(selection.choice,votiveExpected?"ROGATION_MASS":"DAY_MASS");
   if(votiveExpected){
    assert.equal(selection.majorGate.publicationAllowed,true);
    assert.equal(selection.sourcePreface.published,true);
   }
   assert.equal(selection.service,service);
   const state=await page.evaluate(async()=>{
    const mod=await import("/src/mass/browser-entry.js?major-litanies-day-mass-e2e");
    const controller=mod.createBrowserMassController({rogationPreflight:globalThis.__majorPreflight});
    const prepared=await controller.enter();
    return {
      entry:prepared.session.plan.massEntry,
      preceding:[...prepared.session.plan.precedingGraphs],
      properSource:prepared.session.resolvedMass.proper?.data?.sourcePath,
      owner:prepared.session.resolvedMass.actualCelebration?.id,
      observance:prepared.session.resolvedMass.provenance?.rogationSelection?.observance,
      starts:globalThis.__majorLegacyStart,
      gloria:prepared.session.resolvedMass.provenance.gloria,
      credo:prepared.session.resolvedMass.provenance.credo,
      preface:prepared.session.resolvedMass.proper?.data?.preface,
      introit:prepared.session.resolvedMass.proper?.data?.introit
    };
   });
   assert.equal(state.entry,"INTROIT");
   assert.deepEqual(state.preceding,["ROGATIONS"]);
   if(votiveExpected){
    assert.equal(state.properSource,"Rogationes/1962/Exaudivit");
    assert.equal(state.owner,"rogation-mass-1962");
    assert.equal(state.gloria,false);
    assert.equal(state.credo,new Date(date+"T00:00:00Z").getUTCDay()===0,
     "Sunday Rogation votive must preserve the Creed under 1960 §343(a)");
    assert.match(state.preface.lat,/in hoc potissimum/);
    assert.match(state.introit.lat,/Exaudivit de templo sancto/);
    assert.ok(state.preface[language].length>100);
   }else{
    assert.equal(state.properSource,actualDay.source,"I-class Mass of the day must not be overwritten");
    assert.notEqual(state.owner,"rogation-mass-1962");
   }
   assert.equal(state.observance,"MAJOR");
   assert.equal(state.starts,0);
   await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id==="ROG-R01",
    null,{timeout:10000});
   const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
   const back=page.locator("#ao-r17-native-reader-preview [data-reader-nav='previous']");
   for(let i=1;i<6;i++){
    const box=await next.boundingBox();assert.ok(box&&box.height>=44);
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
    await page.waitForFunction(id=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id===id,
      "ROG-R0"+(i+1),{timeout:5000});
    if(i===2){
      const title=(await page.locator("#ao-r17-native-reader-preview [data-role='card-title']").textContent())?.trim();
      if(service==="ORDINARY_AUTHORIZED_SUPPLICATIONS")
        assert.match(title,/Public Supplications/);
      else assert.match(title,/Greater Litanies/);
    }
   }
   const handoff=await next.boundingBox();assert.ok(handoff&&handoff.height>=44);
   await page.touchscreen.tap(handoff.x+handoff.width/2,handoff.y+handoff.height/2);
   await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId==="AO.CARD.001",
    null,{timeout:7000});
   assert.equal((await page.locator("#ao-r17-native-reader-preview [data-role='card-title']").textContent())?.trim(),"Introit");
   const bb=await back.boundingBox();assert.ok(bb&&bb.height>=44);
   await page.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);
   await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id==="ROG-R06",
    null,{timeout:5000});
   if(votiveExpected){
    // Walk the source-owned R17 Ordinary and prove the Sunday Creed exception.
    const expected=[
      "AO.CARD.001","AO.CARD.002","AO.CARD.004",
      "AO.CARD.005","AO.CARD.006","AO.CARD.007","AO.CARD.008",
      ...(state.credo?["AO.CARD.009"]:[]),"AO.CARD.010"
    ];
    const visited=[];
    for(const sectionId of expected){
      const box=await next.boundingBox();assert.ok(box&&box.height>=44);
      // Locator tap waits for the dynamically rendered phone control to
      // become stable after each card-arrival transition.
      await next.tap({timeout:5000});
      // Match the previously certified Minor Rogation phone journey:
      // let the 120ms post-touch card repaint settle before sampling R17.
      await page.waitForTimeout(120);
      try{
        await page.waitForFunction(expectedId=>{
          const card=globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.();
          return (card?.sourceSectionId??card?.sectionId)===expectedId;
        },sectionId,{timeout:5000});
      }catch(error){
        const card=await page.evaluate(()=>{
          const c=globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.();
          return {id:c?.id,sectionId:c?.sectionId,sourceSectionId:c?.sourceSectionId,title:c?.title};
        });
        const navDetails=await page.evaluate(()=>{
          const api=globalThis.AO_R17_NATIVE_READER_PREVIEW,root=api?.root;
          const b=root?.querySelector('[data-reader-nav="next"]');
          const rect=b?.getBoundingClientRect?.();
          const center=rect?{x:rect.x+rect.width/2,y:rect.y+rect.height/2}:null;
          const hit=center?document.elementFromPoint(center.x,center.y):null;
          return {
            rootNavInput:root?.dataset?.aoLastNavInput,
            rootNavResult:root?.dataset?.aoLastNavResult,
            buttonOuter:b?.outerHTML?.slice(0,520),buttonDisabled:b?.disabled,
            center,hitTag:hit?.tagName,hitClass:hit?.className,
            hitMarkup:hit?.outerHTML?.slice(0,450),
            pointerEvents:b?getComputedStyle(b).pointerEvents:null,
            effectiveNav:api?.reader?.getState?.()?.id,
            lifecycleState:root?.dataset?.r17StateOwner
          };
        });
        const clickResponse=await page.evaluate(()=>{
          const api=globalThis.AO_R17_NATIVE_READER_PREVIEW;
          const button=api?.root?.querySelector('[data-reader-nav="next"]');
          button?.click();
          const c=api?.getCurrentCard?.();
          return {card:c?.sectionId??c?.id,navInput:api?.root?.dataset?.aoLastNavInput,
            navResult:api?.root?.dataset?.aoLastNavResult};
        });
        throw new Error("ROGATION_NAV_EXPECTED_"+sectionId+" got "+
          JSON.stringify(card)+" after "+JSON.stringify(visited)+
          " browserErrors="+JSON.stringify(errors)+
          " navDetails="+JSON.stringify(navDetails)+
          " syntheticClick="+JSON.stringify(clickResponse)+"; "+
          String(error?.message??error));
      }
      visited.push(sectionId);
    }
   }
   assert.deepEqual(errors,[],"Browser errors on "+date);
   console.log("ACTUAL_MAJOR_LITANY_MASS",JSON.stringify({
     ...actualDay,language,service,entry:state.entry,correctOwner:state.owner,
     publicLitany:true,noAutomaticDateAction:true,
     majorVotivePublished:votiveExpected,sundayCredo:state.credo??null
   }));
  }finally{await context.close()}
 }
 console.log("Greater Litanies EN/FR real-calendar public Litany → II-class votive after octave or I-class day Mass: PASS");
}finally{await browser?.close();await new Promise(ok=>server.close(()=>ok()))}
