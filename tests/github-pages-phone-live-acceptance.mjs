// Post-deployment phone acceptance. Runs against the PUBLIC GitHub Pages
// origin and the EXACT postdeploy source/run proof, never localhost or a PR.
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {chromium} from "@playwright/test";
import {RELEASE_PROOF_FILENAME,verifyReleaseProof}
  from "../tools/github-pages-release-proof.mjs";

const expectedSha=process.env.GITHUB_SHA;
const expectedRunId=process.env.GITHUB_RUN_ID;
const raw=process.env.AO_PAGES_URL;
if(!raw||!expectedSha||!expectedRunId)throw Error("PAGES_PHONE_MISSING_DEPLOYMENT_INPUT");
const base=new URL(raw.endsWith("/")?raw:raw+"/");
assert.equal(base.href,"https://fulcanelli13.github.io/ad-orientem/",
 "Phone acceptance must only exercise the published GitHub Pages project");
const out=resolve("artifacts/github-pages-phone");
await mkdir(out,{recursive:true});
const report={schema:"ao-pages-live-phone-390-enfr-v1",source_sha:expectedSha,
 run_id:expectedRunId,url:base.href,cases:[],serviceWorker:null};
const addFailure=(label,error)=>{throw new Error("PAGES_PHONE_"+label+": "+String(error?.stack??error));};
const browser=await chromium.launch({headless:true});
const rootSelector="#ao-r17-native-reader-preview";

try{
 const proofResponse=await fetch(new URL(RELEASE_PROOF_FILENAME,base),{
  signal:AbortSignal.timeout(30000),cache:"no-store",
  headers:{"cache-control":"no-cache"}
 });
 assert.ok(proofResponse.ok,"Public exact-release proof is unavailable");
 const proof=await proofResponse.json();
 verifyReleaseProof(proof,{expectedSha,expectedRunId});

 for(const lang of ["en","fr"])for(const mode of ["LIVE","MISSAL"]){
  const label=lang+"-"+mode.toLowerCase();
  let context,page=null,phase="context";
  const startedAt=Date.now(),startupEvents=[];
  const note=(kind,detail)=>{
   startupEvents.push({t_ms:Date.now()-startedAt,kind,detail});
   if(startupEvents.length>120)startupEvents.shift();
  };
  try{
   context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,
    isMobile:true,hasTouch:true,locale:lang==="fr"?"fr-FR":"en-GB",
    serviceWorkers:"allow"});
   page=await context.newPage();
   page.setDefaultTimeout(25000);
   const pageErrors=[];
   page.on("pageerror",e=>{
    const message=String(e?.message??e);
    pageErrors.push(message);
    note("pageerror",message.slice(0,1200));
   });
   page.on("console",message=>{
    if(["error","warning"].includes(message.type()))
     note("console-"+message.type(),message.text().slice(0,1200));
   });
   page.on("requestfailed",request=>note("requestfailed",{
    url:request.url(),type:request.resourceType(),error:request.failure()?.errorText??null
   }));
   page.on("response",response=>{
    const status=response.status(),url=response.url();
    if(status>=400||(url.startsWith(base.href)&&
      [".js",".css"].some(ext=>url.includes(ext))))
     note("response",{status,url});
   });
   page.on("domcontentloaded",()=>note("domcontentloaded",page.url()));
   page.on("load",()=>note("load",page.url()));
   page.on("framenavigated",frame=>{
    if(frame===page.mainFrame())note("navigated",frame.url());
   });
   const url=new URL(base);
   url.searchParams.set("aoR17Reader","native");
   url.searchParams.set("aoPrayerPilot","0");
   url.searchParams.set("ao_page_phone",label+"-"+expectedRunId);
   phase="navigation";
   const response=await page.goto(url.href,{waitUntil:"domcontentloaded",timeout:90000});
   note("main-response",{status:response?.status(),url:response?.url()});
   assert.equal(response?.status(),200,"Public phone entry returned non-200");
   phase="native-owners";
   // Never relax the 65s readiness contract. On a first-attempt failure,
   // preserve the real browser's console, network, SW and owner state.
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner&&
    globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.installed
   ),null,{timeout:65000});
   phase="home-navigation";
   await page.waitForSelector(".homeScreen",{state:"visible",timeout:45000});
   await page.waitForSelector(".aoH7HomeView [data-home-h7-enter]",{state:"visible",timeout:20000});
   await page.locator(".aoH7HomeView [data-home-h7-enter]").click();
   await page.waitForSelector(".aoH7DoorView",{state:"visible",timeout:20000});
   await page.waitForFunction(()=>Boolean(document.querySelector(
    ".homeScreen [data-home-h4-begin]:not([disabled])"
   )),null,{timeout:40000});

   // Use the same public source-owning choices as the visible Change sheet.
   // Never patch DOM attributes, mock a resolved Mass or replace the model.
   const choices=await page.evaluate(({lang,mode})=>{
    const entry=globalThis.AO_R17_BROWSER_ENTRY;
    return {
     language:entry.selectTodayOption("readerLanguage",lang),
     mode:entry.selectTodayOption("readerMode",mode),
     form:entry.selectTodayOption("form","MISSA_CANTATA_INCENSE"),
     preflight:entry.status()?.fullMassPreflight??null
    };
   },{lang,mode});
   assert.equal(choices.language,true,label+" French/English selection refused");
   assert.equal(choices.mode,true,label+" mode choice refused");
   assert.equal(choices.form,true,label+" sung form choice refused");
   if(choices.preflight?.aspersionDecisionRequired===true){
    const accepted=await page.evaluate(()=>
     globalThis.AO_R17_BROWSER_ENTRY.selectTodayOption("aspersion","no"));
    assert.equal(accepted,true,"Sunday aspersion decision must be explicit");
   }
   await page.locator(".homeScreen [data-home-h4-begin]").click();
   await page.waitForSelector(rootSelector,{state:"visible",timeout:90000});
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected&&
    globalThis.AO_R17_ACTIVE_MASS?.readerPreferences
   ),null,{timeout:45000});
   const state=await page.evaluate(()=>{
    const a=globalThis.AO_R17_ACTIVE_MASS;
    const p=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    const root=p?.root;
    const rect=root?.getBoundingClientRect();
    const schola=typeof p?.getScholaState==="function"?p.getScholaState():null;
    const programme=typeof p?.getScholaPerformance==="function"?p.getScholaPerformance():null;
    const current=p?.getCurrentCard?.()??null;
    return {owner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
     mode:a?.readerPreferences?.mode??null,language:a?.readerPreferences?.language??null,
     totalCards:p?.model?.totalCards??null,
     sourceCards:p?.sourceModel?.totalCards??null,
     structureOwner:p?.model?.structureOwner??null,
     presentationMode:p?.model?.presentationMode??null,
     preGospelCards:(p?.model?.cards??[]).filter(c=>c.sourceSectionId==="AO.CARD.006")
       .map(c=>({sectionId:c.sectionId,sourceSectionId:c.sourceSectionId,
        title:c.title,blockIds:(c.blocks??[]).map(b=>b.blockId),
        paragraphCount:c.paragraphs?.length??0})),
     specialInsertions:(p?.model?.cards??[]).filter(c=>
       c.nuptialInsertion===true||c.emberInsertion===true)
       .map(c=>({sectionId:c.sectionId,sourceSectionId:c.sourceSectionId})),
     holyThursday:Boolean(p?.model?.holyThursday&&p?.model?.credoOmitted),
     mandatumPresent:p?.model?.mandatumPresent===true,
     rootVisible:Boolean(rect&&rect.width>280&&rect.height>300),
     width:document.documentElement.scrollWidth,
     viewport:window.innerWidth,
     currentTitle:String(current?.title??current?.name??""),
     rootText:String(root?.innerText??"").slice(0,1300),
     scholaPresent:schola!==null,
     scholaType:typeof schola,
     scholaPerformancePresent:programme!==null,
     hasHorizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2,
    };
   });
   // Preserve source-level evidence and screenshot before cardinality assertions.
   await page.screenshot({path:resolve(out,label+"-mass-390.png"),fullPage:false});
   report.cases.push({label,...state,pageErrors});
   await writeFile(resolve(out,"evidence.json"),JSON.stringify(report,null,2)+"\n");
   console.log("PAGES_PHONE_SOURCE_MODEL "+JSON.stringify({label,
    presentationMode:state.presentationMode,modelTotal:state.totalCards,
    macroTotal:state.sourceCards,structureOwner:state.structureOwner,
    preGospelCards:state.preGospelCards,specialInsertions:state.specialInsertions,
    holyThursday:state.holyThursday,mandatumPresent:state.mandatumPresent}));
   assert.equal(state.owner,"R17_NATIVE_PRODUCTION",label+" not native reader");
   assert.equal(state.mode,mode,label+" wrong prepared mode");
   assert.equal(state.language,lang,label+" wrong prepared language");
   assert.equal(state.sourceCards,30,label+" resurrected 39-card intermediary");
   if(mode==="LIVE"){
    assert.equal(state.structureOwner,"SOURCE_FIRST_LIVE_CURATED_65_REVIEW",
     label+" lost the direct 65-family source-owned presentation");
    assert.equal(state.presentationMode,"LIVE");
    assert.ok(state.preGospelCards.length>=1&&state.preGospelCards.length<=3,
     label+" unsupported source-owned pre-Gospel chant count");
    // 65 ordinary card families, plus only justified, source-backed
    // pre-Gospel verse positions and distinct-rite/Ember additions.
    const expected=65+(state.preGospelCards.length-1)-
      (state.holyThursday?4:0)+(state.holyThursday&&state.mandatumPresent?1:0)+
      state.specialInsertions.length;
    assert.equal(state.totalCards,expected,
     label+" source-owned LIVE families or special insertions were lost");
    assert.ok(state.preGospelCards.every(c=>c.paragraphCount>0&&
       c.sectionId&&c.sourceSectionId==="AO.CARD.006"),
      label+" additional pre-Gospel card lacks verified source identity");
   }else{
    assert.equal(state.presentationMode,"MISSAL",
     label+" silently entered LIVE instead of requested Missal");
    assert.ok(state.totalCards>=30&&state.totalCards!==39,
     label+" Missal fell back to a 39-card macro intermediary");
   }
   assert.equal(state.rootVisible,true,label+" reader root hidden");
   assert.equal(state.hasHorizontalOverflow,false,label+" horizontal page clipping");
   assert.ok(state.rootText.length>130,label+" empty native prayer/chant surface");
   if(mode==="LIVE"){
    assert.equal(state.scholaPresent,true,label+" independent Schola missing");
    assert.equal(state.scholaPerformancePresent,true,label+" Schola programme missing");
   }
   assert.equal(pageErrors.filter(x=>/Uncaught|SyntaxError|ReferenceError|TypeError/.test(x)).length,0,
    label+" runtime JS errors "+pageErrors.join(" | "));

   // Actual public homepage → Sung Mass → visible prayer navigation → Kyrie.
   // Previous M45 checks skipped this user path by calling showSequence()
   // on a test fixture, so green CI did not establish discoverability.
   const sectionJump=page.locator(rootSelector+' [data-role="section-jump"]');
   await sectionJump.click();
   const kyrieSection=page.locator(
    rootSelector+' [data-reader-section-all] [data-reader-section]'
   ).filter({hasText:/Kyrie/i}).first();
   await kyrieSection.waitFor({state:"visible",timeout:20000});
   await kyrieSection.click();
   const kyrieChooser=page.locator(
    rootSelector+' [data-ordinary-reference-chooser="KYRIE"] select'
   );
   await kyrieChooser.waitFor({state:"visible",timeout:20000});
   const placement=await kyrieChooser.evaluate(el=>{
    const chooser=el.closest("[data-ordinary-reference-chooser]");
    const paragraph=chooser?.closest(".ao-reader-paragraph");
    const latin=paragraph?.querySelector(":scope > .ao-line-primary");
    const card=paragraph?.closest(".ao-prayer-card");
    const control=chooser?.getBoundingClientRect(),viewport=card?.getBoundingClientRect();
    return {
     sourceCue:paragraph?.dataset.cueId??null,
     beforeLatin:!!(latin&&chooser&&
       (chooser.compareDocumentPosition(latin)&Node.DOCUMENT_POSITION_FOLLOWING)),
     inOpeningViewport:!!(control&&viewport&&
       control.top>=viewport.top-2&&control.bottom<=viewport.bottom+2),
     initiallyUnselected:el.value===""
    };
   });
   assert.equal(placement.beforeLatin,true,label+" Kyrie setting below Latin");
   assert.equal(placement.inOpeningViewport,true,label+" Kyrie setting off first prayer viewport");
   assert.equal(placement.initiallyUnselected,true,label+" setting automatically assigned");
   await kyrieChooser.selectOption("MASS_16");
   const kyrieScore=page.locator(
    rootSelector+' [data-reference-score="GREGOBASE-545"]'
   );
   await page.waitForSelector(
    rootSelector+' [data-reference-score="GREGOBASE-545"][data-reference-ready="true"] svg',
    {state:"visible",timeout:45000}
   );
   assert.match(await kyrieScore.locator("[data-ordinary-printed-source]")
    .getAttribute("href"),/kyriale-solesmes\\.pdf#page=56$/);
   await kyrieScore.locator(".ao-proper-reference-expand").click();
   const zoom=page.locator("dialog.ao-proper-reference-zoom");
   await zoom.waitFor({state:"visible",timeout:20000});
   assert.equal(await zoom.getAttribute("data-reference-zoom-mode"),"fit");
   await page.screenshot({path:resolve(out,label+"-kyrie-score-390.png"),fullPage:false});
   await zoom.locator('button[aria-label="Close enlarged Gregorian notation"]').click();
   report.cases[report.cases.length-1].kyrieNotation={
    ...placement,sourceScore:"GREGOBASE-545",originalSourceLinked:true,zoomOpened:true
   };
   await writeFile(resolve(out,"evidence.json"),JSON.stringify(report,null,2)+"\n");

   await context.close();context=null;
   console.log("PAGES_PHONE_MASS_PASS "+JSON.stringify({label,mode,lang,
    totalCards:state.totalCards,preGospelCards:state.preGospelCards.length,sourceCards:state.sourceCards,
    schola:state.scholaPresent,overflow:state.hasHorizontalOverflow}));
  }catch(e){
   // #2733: an isolated rerun can pass after a 65s first-attempt failure.
   // Keep original failure fatal, but retain what actually loaded instead of
   // changing timeouts, making a fresh context, or fabricating owner state.
   let browserState=null,captureError=null;
   if(page&&!page.isClosed()){
    try{
     browserState=await Promise.race([
      page.evaluate(()=>{
       const safe=fn=>{try{return fn()}catch(e){return "ERROR: "+String(e)}};
       const shell=safe(()=>globalThis.AO_APP_SHELL_V1?.status?.()??null);
       const reader=safe(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()??null);
       const nav=performance.getEntriesByType("navigation")[0];
       return {
        href:location.href,readyState:document.readyState,
        title:document.title,visibility:document.visibilityState,
        shellGlobal:typeof globalThis.AO_APP_SHELL_V1,
        shellVisibleOwner:typeof shell==="object"&&shell!==null?shell.visibleOwner??null:null,
        readerGlobal:typeof globalThis.AO_R17_BROWSER_ENTRY,
        readerInstalled:typeof reader==="object"&&reader!==null?reader.installed??null:null,
        bootExists:Boolean(document.querySelector("#ao-cinema-boot")),
        bootVisible:Boolean(document.querySelector("#ao-cinema-boot")?.getClientRects().length),
        homeVisible:Boolean(document.querySelector(".homeScreen")?.getClientRects().length),
        swController:navigator.serviceWorker?.controller?.scriptURL??null,
        navTiming:nav?{domContentLoaded:nav.domContentLoadedEventEnd,
          loadEnd:nav.loadEventEnd,transferSize:nav.transferSize}:null,
        scripts:[...document.scripts].map(x=>x.src).filter(Boolean).slice(-24),
        criticalResources:performance.getEntriesByType("resource")
         .filter(x=>[".js",".css","release-proof.json"].some(ext=>x.name.includes(ext)))
         .slice(-35).map(x=>({url:x.name,duration:Math.round(x.duration),
          transferSize:x.transferSize,responseStatus:x.responseStatus??null})),
        readerStatus:reader&&typeof reader==="object"?
         {installed:reader.installed??null,uiOwner:reader.uiOwner??null}:null,
       };
      }),
      new Promise((_,reject)=>setTimeout(()=>reject(Error("diagnostic evaluation exceeded 8s")),8000))
     ]);
    }catch(error){captureError="state: "+String(error)}
    try{
     await page.screenshot({path:resolve(out,label+"-startup-failure-390.png"),
      fullPage:false,timeout:8000});
    }catch(error){captureError=(captureError??"")+" screenshot: "+String(error)}
   }
   const failure={case:label,phase,elapsedMs:Date.now()-startedAt,
    source_sha:expectedSha,run_id:expectedRunId,
    error:String(e?.stack??e),pageErrors:startupEvents.filter(x=>x.kind==="pageerror").map(x=>x.detail),
    browserState,captureError,startupEvents};
   report.failedCase=label;
   report.startupFailure=failure;
   await writeFile(resolve(out,label+"-startup-diagnostics.json"),
    JSON.stringify(failure,null,2)+"\n");
   await writeFile(resolve(out,"evidence.json"),JSON.stringify(report,null,2)+"\n");
   console.error("PAGES_PHONE_BOOT_DIAGNOSTICS "+JSON.stringify(failure));
   if(context)await context.close();
   addFailure(label,e);
  }
 }

 // PWA returning-user acceptance. The app installs the worker ~1.8s after
 // window.load, and only stages updates until the user explicitly consents.
 // Keep the test read-only; do not call app.check()/apply()/USE_SNAPSHOT.
 const context=await browser.newContext({viewport:{width:390,height:844},
  deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB",serviceWorkers:"allow"});
 const events=[];
 const track=(type,detail)=>events.push({type,detail,time:Date.now()});
 context.on("serviceworker",worker=>{
  track("serviceworker-open",worker.url());
  worker.on("close",()=>track("serviceworker-close",worker.url()));
 });
 const pwaEvidence={before:null,after:null,samples:[],events,
  automaticSnapshotPromotionNotRequested:true};
 let page;
 const capture=async phase=>{
  const snapshot=await page.evaluate(async()=>{
   const nav=globalThis.navigator;
   const supported=Boolean(nav&&"serviceWorker" in nav);
   const registration=supported?await nav.serviceWorker.getRegistration():null;
   const registrations=supported?await nav.serviceWorker.getRegistrations():[];
   const app=globalThis.AO_OFFLINE_APP_V1?.status??null;
   return {time:new Date().toISOString(),href:location.href,
    readyState:document.readyState,
    shellReady:Boolean(globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner),
    bootVisible:Boolean(document.getElementById("ao-cinema-boot")?.getClientRects().length),
    bootPresent:Boolean(document.getElementById("ao-cinema-boot")),
    supported,
    offlineStatus:app?{supported:app.supported,registered:app.registered,
     ready:app.ready,version:app.version,error:app.error,
     pendingVersion:app.pendingVersion}:null,
    registered:Boolean(registration),scope:registration?.scope??null,
    active:registration?.active?.state??null,
    controller:Boolean(nav.serviceWorker?.controller),
    controllerScript:nav.serviceWorker?.controller?.scriptURL??null,
    registrationCount:registrations.length,
    registrations:registrations.map(r=>({scope:r.scope,
      active:r.active?.state??null,installing:r.installing?.state??null,
      waiting:r.waiting?.state??null})),
    activeMass:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
    activeSurface:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    overflow:document.documentElement.scrollWidth>innerWidth+2};
  });
  pwaEvidence.samples.push({phase,...snapshot});
  console.log("PAGES_PHONE_SW_PHASE "+JSON.stringify({phase,...snapshot}));
  return snapshot;
 };
 const stable=record=>record.supported===true&&record.registered===true&&
  record.active==="activated"&&record.scope===base.href;
 try{
  page=await context.newPage();
  page.on("pageerror",error=>track("pageerror",String(error?.message??error)));
  page.on("console",message=>{
   if(["error","warning"].includes(message.type()))track("console-"+message.type(),message.text().slice(0,500));
  });
  page.on("framenavigated",frame=>{
   if(frame===page.mainFrame())track("navigate",frame.url());
  });
  const url=new URL(base);
  url.searchParams.set("ao_page_phone","returning-"+expectedRunId);
  await page.goto(url.href,{waitUntil:"load",timeout:90000});
  await page.waitForFunction(()=>
   globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
   null,{timeout:60000});
  await page.waitForSelector("#ao-cinema-boot",{state:"detached",timeout:45000});
  await page.waitForFunction(async()=>{
   if(!globalThis.AO_OFFLINE_APP_V1?.status?.supported)return false;
   const registration=await navigator.serviceWorker.getRegistration();
   return globalThis.AO_OFFLINE_APP_V1.status.registered===true&&
    Boolean(registration?.active)&&registration.scope===new URL("./",location.href).href;
  },null,{timeout:45000,polling:300});
  // A single transient registration is not a usable returning-user cache.
  // Record four stable reads before reload to expose lifecycle races.
  // A transient worker activation/return-navigation race is not evidence of
  // a lost installation. Require four consecutive stable reads, while keeping
  // a hard deadline and complete trace for a genuinely missing worker.
  let consecutive=0,lastSample=null;
  const stabilityDeadline=Date.now()+20000;
  for(let attempt=0;consecutive<4&&Date.now()<stabilityDeadline;attempt++){
   const sample=await capture("before-reload-"+attempt);
   lastSample=sample;
   consecutive=stable(sample)?consecutive+1:0;
   if(consecutive<4)await page.waitForTimeout(350);
  }
  assert.equal(consecutive,4,"Service worker never reached four stable reads before reload: "+
   JSON.stringify({lastSample,events}));
  pwaEvidence.before=pwaEvidence.samples.at(-1);
  await page.reload({waitUntil:"load",timeout:90000});
  await page.waitForFunction(()=>
   globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
   null,{timeout:65000});
  await page.waitForSelector("#ao-cinema-boot",{state:"detached",timeout:45000});
  await page.waitForFunction(async()=>{
   const r=await navigator.serviceWorker?.getRegistration();
   return Boolean(r?.active&&navigator.serviceWorker?.controller);
  },null,{timeout:35000,polling:300});
  pwaEvidence.after=await capture("after-stable-reload");
  assert.ok(stable(pwaEvidence.after),"Returning user worker lost on reload: "+
   JSON.stringify(pwaEvidence.after));
  assert.equal(pwaEvidence.after.controller,true,
   "Returning-user page is not controlled by active service worker");
  assert.equal(pwaEvidence.after.bootPresent,false,
   "Returning-user page still shows full-screen Mass bootstrap");
  assert.equal(pwaEvidence.after.activeSurface,"home",
   "Returning user did not return to usable Home");
  assert.equal(pwaEvidence.after.overflow,false,
   "Returning user 390px viewport clips horizontally");
  report.serviceWorker={before:pwaEvidence.before,after:pwaEvidence.after,
   automaticSnapshotPromotionNotRequested:true};
  console.log("PAGES_PHONE_RETURNING_USER_PASS "+JSON.stringify(report.serviceWorker));
 }catch(error){
  track("failure",String(error?.stack??error));
  throw error;
 }finally{
  // Always keep a real screenshot, final state and navigation/worker events
  // even when registration disappears. This is diagnostic evidence, not PASS.
  try{
   if(page&&!page.isClosed()){
    await capture("final");
    await page.screenshot({path:resolve(out,"returning-user-390.png"),fullPage:false});
   }
  }catch(error){track("capture-error",String(error?.message??error))}
  if(!report.serviceWorker)report.serviceWorker={
   ...pwaEvidence,passed:false};
  await writeFile(resolve(out,"evidence.json"),JSON.stringify(report,null,2)+"\n");
  await context.close();
 }
 await writeFile(resolve(out,"evidence.json"),JSON.stringify(report,null,2)+"\n");
 console.log("GITHUB_PAGES_PHONE_ENFR_PASS "+JSON.stringify({source_sha:expectedSha,
  run_id:expectedRunId,cases:report.cases.map(x=>x.label),serviceWorker:report.serviceWorker.after}));
}finally{await browser.close()}
