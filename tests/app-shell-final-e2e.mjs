import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
};

const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const candidate=resolve(repoRoot,"."+pathname);
    if(candidate!==repoRoot && !candidate.startsWith(repoRoot+sep)){
      res.writeHead(403);res.end("forbidden");return;
    }
    const data=await readFile(candidate);
    res.writeHead(200,{"content-type":mime[extname(candidate)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4174,"127.0.0.1",ok)});

const iconKeys=[
  "stand","sit","kneel","genuflect","bow","cross","gospel_crosses","breast_strike","head_bow","profound_bow","hands_joined",
  "response","schola","priest_audible","priest_silent","priest_foot","priest_steps","priest_centre","priest_epistle","priest_gospel","priest_sedilia","priest_rail","priest_people",
];

async function exerciseRealShellSpecialRite(browser,spec){
  const context=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
  });
  const page=await context.newPage();
  const pageErrors=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));

  try{
    await page.goto("http://127.0.0.1:4174/index.html?aoR17Reader=native",{
      waitUntil:"domcontentloaded",
      timeout:90000,
    });
    await page.waitForTimeout(1200);

    const setup=await page.evaluate(async({iconKeys,spec})=>{
      const t=(lat,en)=>({lat,en});
      const proper={
        sourcePath:spec.properSource,
        introit:t("Introitus "+spec.kind,"Introit of "+spec.kind),
        collects:[t("Collecta "+spec.kind,"Collect of "+spec.kind)],
        epistle:t("Epistola "+spec.kind,"Epistle of "+spec.kind),
        gradual:t("Graduale "+spec.kind,"Gradual of "+spec.kind),
        sequence:{lat:"",en:""},
        gospel:t("Evangelium "+spec.kind,"Gospel of "+spec.kind),
        offertory:t("Offertorium "+spec.kind,"Offertory of "+spec.kind),
        secrets:[t("Secreta "+spec.kind,"Secret of "+spec.kind)],
        preface:t("Praefatio","Preface"),
        communion:t("Communio "+spec.kind,"Communion of "+spec.kind),
        postcommunions:[t("Postcommunio "+spec.kind,"Postcommunion of "+spec.kind)],
      };

      globalThis.__AO_FINAL_LEGACY_STARTS=0;
      globalThis.AO_SEQUENCE_BRIDGE_V23={
        startLive(){globalThis.__AO_FINAL_LEGACY_STARTS+=1;},
        getActive(){return null;},
        getAssemblyStatus(){return null;},
      };
      globalThis.AO_SEQUENCE_BRIDGE_V22=null;
      globalThis.AO_R17_ICON_ASSETS=Object.fromEntries(
        iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"])
      );
      globalThis.AO_RUNTIME_V8={
        store:{
          getState:()=>({
            selectedDate:spec.date,
            language:"en",
            settings:{
              massForm:"mc-incense",
              followMode:"vox",
              massPostureProfile:"TRADITIONAL_WALSH",
              massGestureProfile:"GUIDED_1962",
              faithfulCommunion:true,
            },
          }),
        },
      };
      globalThis.AO_CELEBRATION_ARCH_V1={
        date:spec.date,
        celebrationForm:"mc-incense",
        followMode:"vox",
        actualCelebration:{id:spec.celebrationId,type:"CALENDAR"},
      };
      globalThis.AO_CELEBRATION_API={
        getResolvedMass:()=>({
          canStart:true,
          date:spec.date,
          calendarDay:{id:spec.celebrationId,title:spec.kind},
          celebrationId:spec.celebrationId,
          celebrationType:"CALENDAR",
          proper,
          properSource:spec.properSource,
          insertedRites:[spec.insertedRite],
          conditions:[],
          rubricSources:["MR1962"],
        }),
      };

      const mod=await import("/src/mass/browser-entry.js?final-shell-special="+spec.kind.toLowerCase());
      const controller=mod.createBrowserMassController();
      const prepared=await controller.enter();
      return {
        schema:prepared.schema,
        form:prepared.session.resolvedMass.form,
        precedingGraphs:[...(prepared.session.plan.precedingGraphs??[])],
      };
    },{iconKeys,spec});

    assert.equal(setup.schema,"ao-mass-entry-bootstrap-v1");
    assert.equal(setup.form,"MISSA_CANTATA_INCENSE");
    assert.deepEqual(setup.precedingGraphs,[spec.kind],
      spec.kind+" did not reach the compiled production Mass plan");

    await page.waitForSelector("#ao-r17-native-reader-preview",{state:"attached",timeout:30000});
    await page.waitForFunction(expected=>
      globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id===expected,
      spec.firstId,{timeout:10000});

    const ownership=await page.evaluate(()=>({
      starts:globalThis.__AO_FINAL_LEGACY_STARTS,
      readerUiMode:globalThis.AO_R17_MASS_RUNTIME?.readerUiMode??null,
      uiOwner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
      marker:document.documentElement.dataset.aoMassReaderUi??null,
    }));
    assert.equal(ownership.starts,0,spec.kind+" real-shell path started legacy renderer");
    assert.equal(ownership.readerUiMode,"NATIVE");
    assert.equal(ownership.uiOwner,"R17_NATIVE_PRODUCTION");
    assert.equal(ownership.marker,"R17_NATIVE_PRODUCTION",
      spec.kind+" lost data-ao-mass-reader-ui ownership marker");

    const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
    const back=page.locator("#ao-r17-native-reader-preview [data-reader-nav='previous']");

    async function tapNext(){
      const b=await next.boundingBox();
      assert.ok(b && b.height>=44,spec.kind+" Next target is too small");
      await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
      await page.waitForTimeout(90);
    }
    async function advanceToId(target,max=16){
      for(let i=0;i<max;i++){
        const current=await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id??null);
        if(current===target)return;
        await tapNext();
      }
      const current=await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id??null);
      assert.equal(current,target,spec.kind+" could not reach "+target);
    }

    const stateCardId=spec.stateCardId??spec.recipientCardId??null;
    if(stateCardId)await advanceToId(stateCardId);
    const stateValue=await page.evaluate(({kind,stateAction,stateSetter,stateValue})=>{
      const api=globalThis.AO_R17_NATIVE_READER_PREVIEW;
      if(stateAction==="RECIPIENT" && stateSetter && typeof api?.[stateSetter]==="function"){
        api[stateSetter](stateValue);
      }else if(stateAction==="SPRINKLED"){
        api?.markActuallySprinkled?.();
      }
      if(kind==="PALM")return api?.getPalmState?.()?.recipientPosture??null;
      if(kind==="ASH")return api?.getAshState?.()?.recipientPosture??null;
      if(kind==="CANDLEMAS")return api?.getCandlemasState?.()?.recipientPosture??null;
      if(kind==="ROGATIONS")return api?.getRogationsState?.()?.card?.posture??null;
      if(kind==="ASPERGES")return api?.getAspergesState?.()?.faithfulGesture??null;
      return null;
    },{
      kind:spec.kind,
      stateAction:spec.stateAction??(spec.receiveState?"RECIPIENT":null),
      stateSetter:spec.stateSetter??(
        spec.kind==="PALM"?"setPalmRecipientState":
        spec.kind==="ASH"?"setAshRecipientState":null
      ),
      stateValue:spec.stateValue??spec.receiveState??null,
    });
    if(spec.expectedState!==undefined)assert.equal(
      stateValue,spec.expectedState,spec.kind+" real-shell personal/rite state did not project correctly"
    );

    await advanceToId(spec.handoffId);
    await tapNext();
    await page.waitForFunction(()=>
      globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId==="AO.CARD.001",
      null,{timeout:5000});
    const handoffTitle=(await page.locator("#ao-r17-native-reader-preview [data-role='card-title']").textContent())?.trim()??"";
    assert.notEqual(handoffTitle,"",spec.kind+" real-shell handoff mounted a blank Mass card");
    if(spec.massTitle)assert.equal(
      handoffTitle,spec.massTitle,
      spec.kind+" real-shell handoff entered the wrong Mass surface"
    );

    const bb=await back.boundingBox();
    assert.ok(bb && bb.height>=44,spec.kind+" Back target is too small");
    await page.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);
    await page.waitForFunction(expected=>
      globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.id===expected,
      spec.handoffId,{timeout:5000});

    assert.deepEqual(pageErrors,[],spec.kind+" uncaught page errors: "+JSON.stringify(pageErrors));
  }finally{
    await context.close();
  }
}

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
  });
  const page=await context.newPage();
  const pageErrors=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));

  await page.goto("http://127.0.0.1:4174/index.html?aoR17Reader=native",{
    waitUntil:"domcontentloaded",
    timeout:90000,
  });
  await page.waitForTimeout(1200);

  const setup=await page.evaluate(async(iconKeys)=>{
    const t=(lat,en)=>({lat,en});
    const proper={
      sourcePath:"Sancti/10-07",
      introit:t("Introitus Rosarii","Introit of the Rosary"),
      collects:[t("Collecta Rosarii","Collect of the Rosary")],
      epistle:t("Epistola Rosarii","Epistle of the Rosary"),
      gradual:t("Graduale et Alleluia Rosarii","Gradual and Alleluia of the Rosary"),
      sequence:{lat:"",en:""},
      gospel:t("Evangelium Rosarii","Gospel of the Rosary"),
      offertory:t("Offertorium Rosarii","Offertory of the Rosary"),
      secrets:[t("Secreta Rosarii","Secret of the Rosary")],
      preface:t("Praefatio","Preface"),
      communion:t("Communio Rosarii","Communion of the Rosary"),
      postcommunions:[t("Postcommunio Rosarii","Postcommunion of the Rosary")],
    };

    globalThis.__AO_FINAL_LEGACY_STARTS=0;
    globalThis.AO_SEQUENCE_BRIDGE_V23={
      startLive(){globalThis.__AO_FINAL_LEGACY_STARTS+=1;},
      getActive(){return null;},
      getAssemblyStatus(){return null;},
    };
    globalThis.AO_SEQUENCE_BRIDGE_V22=null;
    globalThis.AO_R17_ICON_ASSETS=Object.fromEntries(
      iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"])
    );
    globalThis.AO_RUNTIME_V8={
      store:{
        getState:()=>({
          selectedDate:"2026-10-04",
          language:"en",
          settings:{
            massForm:"mc-incense",
            followMode:"vox",
            massPostureProfile:"TRADITIONAL_WALSH",
            massGestureProfile:"GUIDED_1962",
            faithfulCommunion:true,
          },
        }),
      },
    };
    globalThis.AO_CELEBRATION_ARCH_V1={
      date:"2026-10-04",
      celebrationForm:"mc-incense",
      followMode:"vox",
      actualCelebration:{id:"holy_rosary",type:"VOTIVE"},
    };
    globalThis.AO_CELEBRATION_API={
      getResolvedMass:()=>({
        canStart:true,
        date:"2026-10-04",
        calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
        requestedCelebrationId:"holy_rosary",
        celebrationId:"holy_rosary",
        celebrationType:"VOTIVE",
        proper,
        properSource:"Sancti/10-07",
        insertedRites:[],
        conditions:[],
        rubricSources:["RG60"],
      }),
    };

    const mod=await import("/src/mass/browser-entry.js?final-shell-e2e=1");
    const controller=mod.createBrowserMassController();
    const prepared=await controller.enter();
    return {
      schema:prepared.schema,
      form:prepared.session.resolvedMass.form,
      mode:prepared.readerPreferences.mode,
      postureProfile:prepared.readerPreferences.postureProfile,
    };
  },iconKeys);

  assert.equal(setup.schema,"ao-mass-entry-bootstrap-v1");
  assert.equal(setup.form,"MISSA_CANTATA_INCENSE");
  assert.equal(setup.mode,"LIVE");
  assert.equal(setup.postureProfile,"TRADITIONAL_WALSH");

  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"attached",timeout:30000});
  await page.waitForSelector("#ao-r17-native-reader-preview [data-role=\"card-title\"]",{timeout:30000});

  const ownership=await page.evaluate(()=>({
    starts:globalThis.__AO_FINAL_LEGACY_STARTS,
    runtime:globalThis.AO_R17_MASS_RUNTIME??null,
    massEngine:document.documentElement.dataset.aoMassEngine??null,
    massReaderUi:document.documentElement.dataset.aoMassReaderUi??null,
    bridge:document.documentElement.dataset.aoR17MassBridge??null,
    rootConnected:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
    title:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.textContent?.trim()??"",
    paragraphs:document.querySelectorAll("#ao-r17-native-reader-preview [data-role='paragraphs'] .ao-reader-paragraph").length,
  }));
  assert.equal(ownership.starts,0,"final native entry booted the legacy live renderer");
  assert.equal(ownership.runtime?.readerUiMode,"NATIVE");
  assert.equal(ownership.runtime?.uiOwner,"R17_NATIVE_PRODUCTION");
  assert.equal(ownership.runtime?.legacyActive,null);
  assert.equal(ownership.massEngine,"r17-native-production");
  assert.equal(ownership.massReaderUi,"R17_NATIVE_PRODUCTION");
  assert.equal(ownership.rootConnected,true);
  assert.notEqual(ownership.title,"","real app shell mounted a blank native card title");
  assert.ok(ownership.paragraphs>0,"real app shell mounted an empty native prayer card");

  const root=page.locator("#ao-r17-native-reader-preview");
  const rootBox=await root.boundingBox();
  assert.ok(rootBox,"native reader root missing from real shell");
  assert.ok(rootBox.x>=-0.5 && rootBox.y>=-0.5);
  assert.ok(rootBox.x+rootBox.width<=390.5,"real-shell reader overflows phone width");
  assert.ok(rootBox.y+rootBox.height<=844.5,"real-shell reader overflows phone height");

  const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
  const before=await page.locator("#ao-r17-native-reader-preview [data-role='progress']").textContent();
  const box=await next.boundingBox();
  assert.ok(box && box.height>=44,"real-shell Next target is too small");
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForFunction(previous=>{
    const text=document.querySelector("#ao-r17-native-reader-preview [data-role='progress']")?.textContent;
    return text && text!==previous;
  },before,{timeout:5000});

  assert.deepEqual(pageErrors,[],"uncaught page errors in real app shell: "+JSON.stringify(pageErrors));
  await context.close();

  await exerciseRealShellSpecialRite(browser,{
    kind:"PALM",
    insertedRite:"palm",
    date:"2027-03-21",
    celebrationId:"palm-sunday",
    properSource:"Tempora/Quad6-0",
    firstId:"PALM-R01",
    stateCardId:"PALM-R02",
    stateAction:"RECIPIENT",
    stateSetter:"setPalmRecipientState",
    stateValue:"RECEIVE_PALM",
    expectedState:"KNEEL",
    handoffId:"PALM-R07",
    massTitle:"Introit",
  });
  await exerciseRealShellSpecialRite(browser,{
    kind:"ASH",
    insertedRite:"ash",
    date:"2027-02-10",
    celebrationId:"ash-wednesday",
    properSource:"Tempora/Quadp3-3",
    firstId:"ASH-R01",
    stateCardId:"ASH-R03",
    stateAction:"RECIPIENT",
    stateSetter:"setAshRecipientState",
    stateValue:"RECEIVE_ASHES",
    expectedState:"KNEEL",
    handoffId:"ASH-R05",
    massTitle:"Introit",
  });

  await exerciseRealShellSpecialRite(browser,{
    kind:"ASPERGES",
    insertedRite:"asperges",
    date:"2026-10-04",
    celebrationId:"dominica-xix",
    properSource:"Tempora/Pent18-0",
    firstId:"ASP-R01",
    stateCardId:"ASP-R03",
    stateAction:"SPRINKLED",
    expectedState:"MAKE_FULL_SIGN_OF_CROSS",
    handoffId:"ASP-R05",
  });
  await exerciseRealShellSpecialRite(browser,{
    kind:"CANDLEMAS",
    insertedRite:"candlemas",
    date:"2027-02-02",
    celebrationId:"purificatio-bmv",
    properSource:"Sancti/02-02",
    firstId:"CND-R01",
    stateCardId:"CND-R03",
    stateAction:"RECIPIENT",
    stateSetter:"setCandlemasRecipientState",
    stateValue:"RECEIVE_CANDLE",
    expectedState:"KNEEL",
    handoffId:"CND-R07",
    massTitle:"Introit",
  });
  await exerciseRealShellSpecialRite(browser,{
    kind:"ROGATIONS",
    insertedRite:"rogations",
    date:"2027-05-10",
    celebrationId:"feria-rogationum",
    properSource:"Tempora/Rogation",
    firstId:"ROG-R01",
    stateCardId:"ROG-R02",
    expectedState:"KNEEL",
    handoffId:"ROG-R06",
    massTitle:"Introit",
  });

  console.log("final real-shell acceptance: PASS — actual index.html mounts native ordinary, Asperges, Palm, Ash, Candlemas and Rogations paths on phone Chromium without booting legacy.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
