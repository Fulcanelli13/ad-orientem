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
  let context;
  try{
   context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,
    isMobile:true,hasTouch:true,locale:lang==="fr"?"fr-FR":"en-GB",
    serviceWorkers:"allow"});
   const page=await context.newPage();
   page.setDefaultTimeout(25000);
   const pageErrors=[];
   page.on("pageerror",e=>pageErrors.push(String(e?.message??e)));
   const url=new URL(base);
   url.searchParams.set("aoR17Reader","native");
   url.searchParams.set("aoPrayerPilot","0");
   url.searchParams.set("ao_page_phone",label+"-"+expectedRunId);
   const response=await page.goto(url.href,{waitUntil:"domcontentloaded",timeout:90000});
   assert.equal(response?.status(),200,"Public phone entry returned non-200");
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner&&
    globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.installed
   ),null,{timeout:65000});
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
   assert.equal(state.owner,"R17_NATIVE_PRODUCTION",label+" not native reader");
   assert.equal(state.mode,mode,label+" wrong prepared mode");
   assert.equal(state.language,lang,label+" wrong prepared language");
   assert.equal(state.totalCards,65,label+" lost 65-card canonical reader");
   assert.equal(state.sourceCards,30,label+" resurrected 39-card intermediary");
   assert.equal(state.rootVisible,true,label+" reader root hidden");
   assert.equal(state.hasHorizontalOverflow,false,label+" horizontal page clipping");
   assert.ok(state.rootText.length>130,label+" empty native prayer/chant surface");
   if(mode==="LIVE"){
    assert.equal(state.scholaPresent,true,label+" independent Schola missing");
    assert.equal(state.scholaPerformancePresent,true,label+" Schola programme missing");
   }
   assert.equal(pageErrors.filter(x=>/Uncaught|SyntaxError|ReferenceError|TypeError/.test(x)).length,0,
    label+" runtime JS errors "+pageErrors.join(" | "));
   await page.screenshot({path:resolve(out,label+"-mass-390.png"),fullPage:false});
   report.cases.push({label,...state,pageErrors});
   await context.close();context=null;
   console.log("PAGES_PHONE_MASS_PASS "+JSON.stringify({label,mode,lang,
    totalCards:state.totalCards,sourceCards:state.sourceCards,
    schola:state.scholaPresent,overflow:state.hasHorizontalOverflow}));
  }catch(e){
   if(context)await context.close();
   addFailure(label,e);
  }
 }

 // Returning-user verification is intentionally read-only. A successful
 // service-worker claim and stable LIVE return do not authorize automatic
 // update/snapshot activation, which could invalidate a real Mass session.
 const context=await browser.newContext({viewport:{width:390,height:844},
  deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB",serviceWorkers:"allow"});
 try{
  const page=await context.newPage();
  const url=new URL(base);
  url.searchParams.set("ao_page_phone","returning-"+expectedRunId);
  await page.goto(url.href,{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
   null,{timeout:60000});
  const before=await page.evaluate(async()=>{
   if(!("serviceWorker" in navigator))return {supported:false,registered:false};
   const registration=await navigator.serviceWorker.getRegistration();
   return {supported:true,registered:Boolean(registration),
    scope:registration?.scope??null,controller:Boolean(navigator.serviceWorker.controller)};
  });
  await page.reload({waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>Boolean(
   globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner||
   globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.nativeMounted
  ),null,{timeout:65000});
  const after=await page.evaluate(async()=>{
   const registration=await navigator.serviceWorker?.getRegistration();
   return {registered:Boolean(registration),scope:registration?.scope??null,
    controller:Boolean(navigator.serviceWorker?.controller),
    activeMass:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
    activeSurface:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    overflow:document.documentElement.scrollWidth>innerWidth+2};
  });
  assert.equal(before.supported,true,"Published site lacks browser SW support");
  assert.equal(after.registered,true,"Returning user has no service-worker registration");
  assert.equal(after.scope,base.href,"Service worker escaped GitHub Pages project scope");
  assert.equal(after.overflow,false,"Returning user 390px viewport clips horizontally");
  await page.screenshot({path:resolve(out,"returning-user-390.png"),fullPage:false});
  report.serviceWorker={before,after,automaticSnapshotPromotionNotRequested:true};
  console.log("PAGES_PHONE_RETURNING_USER_PASS "+JSON.stringify(report.serviceWorker));
 }finally{await context.close()}
 await writeFile(resolve(out,"evidence.json"),JSON.stringify(report,null,2)+"\n");
 console.log("GITHUB_PAGES_PHONE_ENFR_PASS "+JSON.stringify({source_sha:expectedSha,
  run_id:expectedRunId,cases:report.cases.map(x=>x.label),serviceWorker:report.serviceWorker.after}));
}finally{await browser.close()}
