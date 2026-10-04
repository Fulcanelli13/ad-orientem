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

    await advanceToId(spec.recipientCardId);
    await page.evaluate(({kind,receiveState})=>{
      const api=globalThis.AO_R17_NATIVE_READER_PREVIEW;
      if(kind==="PALM")api.setPalmRecipientState(receiveState);
      else api.setAshRecipientState(receiveState);
    },{kind:spec.kind,receiveState:spec.receiveState});
    await page.waitForFunction(()=>
      document.querySelector("#ao-r17-native-reader-preview [data-role='posture']")?.textContent?.includes("KNEEL"),
      null,{timeout:5000});

    await advanceToId(spec.handoffId);
    await tapNext();
    await page.waitForFunction(()=>
      globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId==="AO.CARD.001",
      null,{timeout:5000});
    assert.equal(
      (await page.locator("#ao-r17-native-reader-preview [data-role='card-title']").textContent())?.trim(),
      "Introit",
      spec.kind+" real-shell handoff did not enter Mass at the Introit"
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
  const ariaHiddenWarnings=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  page.on("console",msg=>{
    const text=msg.text();
    if(/Blocked aria-hidden/i.test(text))ariaHiddenWarnings.push(text);
  });

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
    shellFocusGuard:globalThis.AO_R17_BROWSER_ENTRY?.status?.().shellFocusGuard??false,
  }));
  assert.equal(ownership.starts,0,"final native entry booted the legacy live renderer");
  assert.equal(ownership.runtime?.readerUiMode,"NATIVE");
  assert.equal(ownership.runtime?.uiOwner,"R17_NATIVE_PRODUCTION");
  assert.equal(ownership.runtime?.legacyActive,null);
  assert.equal(ownership.massEngine,"r17-native-production");
  assert.equal(ownership.massReaderUi,"R17_NATIVE_PRODUCTION");
  assert.equal(ownership.rootConnected,true);
  assert.equal(ownership.shellFocusGuard,true,"production shell focus guard was not installed");
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

  const focusProbe=await page.evaluate(async()=>{
    const surface=document.createElement("section");
    surface.id="aoPrayerBookRoot";
    surface.setAttribute("aria-hidden","false");
    surface.style.setProperty("display","block","important");
    surface.style.setProperty("visibility","visible","important");
    surface.style.setProperty("pointer-events","auto","important");
    surface.style.setProperty("position","fixed","important");
    surface.style.setProperty("inset","0","important");
    surface.style.setProperty("z-index","2147483647","important");
    const back=document.createElement("button");
    back.type="button";
    back.className="lab-back";
    back.textContent="Back";
    back.style.setProperty("display","block","important");
    back.style.setProperty("visibility","visible","important");
    back.style.setProperty("pointer-events","auto","important");
    back.style.setProperty("position","fixed","important");
    back.style.setProperty("top","8px","important");
    back.style.setProperty("left","8px","important");
    surface.append(back);
    document.body.append(surface);
    surface.addEventListener("click",()=>surface.setAttribute("aria-hidden","true"));
    back.focus();
    const focusedBefore=document.activeElement===back;
    back.click();
    await new Promise(resolve=>requestAnimationFrame(()=>resolve()));
    const result={
      focusedBefore,
      hidden:surface.getAttribute("aria-hidden"),
      activeInside:surface.contains(document.activeElement),
      activeTag:document.activeElement?.tagName??null,
    };
    surface.remove();
    return result;
  });
  assert.equal(focusProbe.focusedBefore,true,"focus regression probe could not focus .lab-back");
  assert.equal(focusProbe.hidden,"true","focus regression probe did not hide Prayer Book surface");
  assert.equal(focusProbe.activeInside,false,"aria-hidden Prayer Book retained focus");
  assert.deepEqual(ariaHiddenWarnings,[],
    "Chromium emitted blocked aria-hidden warning: "+JSON.stringify(ariaHiddenWarnings));

  assert.deepEqual(pageErrors,[],"uncaught page errors in real app shell: "+JSON.stringify(pageErrors));
  await context.close();

  await exerciseRealShellSpecialRite(browser,{
    kind:"PALM",
    insertedRite:"palm",
    date:"2027-03-21",
    celebrationId:"palm-sunday",
    properSource:"Tempora/Quad6-0",
    firstId:"PALM-R01",
    recipientCardId:"PALM-R02",
    receiveState:"RECEIVE_PALM",
    handoffId:"PALM-R07",
  });
  await exerciseRealShellSpecialRite(browser,{
    kind:"ASH",
    insertedRite:"ash",
    date:"2027-02-10",
    celebrationId:"ash-wednesday",
    properSource:"Tempora/Quadp3-3",
    firstId:"ASH-R01",
    recipientCardId:"ASH-R03",
    receiveState:"RECEIVE_ASHES",
    handoffId:"ASH-R05",
  });

  console.log("final real-shell acceptance: PASS — actual index.html mounts native ordinary, Palm and Ash paths on phone Chromium without booting legacy.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
