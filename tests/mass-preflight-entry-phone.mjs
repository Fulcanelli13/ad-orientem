import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const body=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_CELEBRATION_API?.openPreflight),null,{timeout:30000});
  const entry=page.locator(".homeScreen [data-home-mass-entry]");
  assert.equal(await entry.count(),1,"Home Follow Mass CTA missing");
  await entry.click();
  await page.waitForFunction(()=>{
   const back=document.querySelector("#ao-mass-flow-v1 .aoMassFlowBackdrop");
   return back&&back.isConnected&&!back.hidden&&
     getComputedStyle(back).display!=="none"&&getComputedStyle(back).visibility!=="hidden";
  },null,{timeout:18000});
  const prep=page.locator("[data-ao-full-mass-preflight]");
  await prep.waitFor({state:"visible",timeout:15000});
  const hierarchy=await page.evaluate(()=>{
   const flow=document.querySelector("#ao-mass-flow-v1"),pre=flow?.querySelector("[data-ao-full-mass-preflight]");
   const parent=pre?.parentElement;
   const describe=e=>({tag:e.tagName,cls:String(e.className||"").slice(0,150),
      id:e.id,ds:Object.keys(e.dataset||{}).slice(0,16),
      text:(e.textContent||"").trim().replace(/\\s+/g," ").slice(0,120),
      visible:!!e.getClientRects().length,display:getComputedStyle(e).display});
   return {flow:flow?describe(flow):null,
      direct:parent?[...parent.children].map(describe):[],
      nodes:flow?[...flow.querySelectorAll("*")].filter(e=>e.children.length<5 && /VOX|MASS OF THE DAY|CONTENT READINESS|HOW DO YOU WANT TO FOLLOW/i.test((e.textContent||"").trim().slice(0,90)))
        .slice(0,30).map(describe):[]};
  });
  for(const donor of hierarchy.direct.filter(x=>/aoPreflightHero|aoReadiness|aoRubricStatus ok/.test(x.cls) ||
    (x.cls==="aoChoiceGrid"&&/VOX.*Missal/.test(x.text)))){
    assert.equal(donor.visible,false,"Obsolete host card appears above Guided Folio: "+JSON.stringify(donor));
  }
  assert.equal(hierarchy.direct.filter(x=>x.cls==="aoFullMassPreflight").length,1,
    "Exactly one Guided Folio must own the preparation form");
  const data=await page.evaluate(()=>{
   const root=document.querySelector("[data-ao-full-mass-preflight]");
   const backing=document.querySelector("#ao-mass-flow-v1 .aoMassFlowBackdrop");
   const cs=getComputedStyle(root),rect=root.getBoundingClientRect();
   return {title:root.querySelector("[data-full-mass-title]")?.textContent,
      categories:root.querySelectorAll("[data-full-mass-category]").length,
      forms:root.querySelectorAll("[data-full-mass-form]").length,
      modes:[...root.querySelectorAll("[data-full-mass-reader-mode]")].map(x=>x.value),
      startButtons:document.querySelectorAll("[data-ao-start-live]").length,
      readerPresent:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
      visible:cs.visibility!=="hidden"&&cs.display!=="none"&&rect.width>80&&rect.height>80,
      backdrop:backing?.className};
  });
  assert.equal(data.visible,true,"Mass preparation layout not visible: "+JSON.stringify(data));
  assert.ok(data.categories>=5,"Mass category selection missing: "+JSON.stringify(data));
  assert.ok(data.forms>=3,"Low/Sung/Solemn choices missing: "+JSON.stringify(data));
  assert.deepEqual(data.modes,["MISSAL","SIMPLE","LIVE"]);
  assert.equal(data.readerPresent,false,"Follow Mass started LIVE without preparation");
  assert.ok(data.startButtons>0,"No explicit Start Mass control");

  // Real mobile handoff: a chosen full preparation must open the canonical
  // Prayer reader and leave the Mass source selection untouched on Back.
  assert.equal(await page.locator("[data-folio-before]").count(),3,
    "Before Mass must have none, brief and full choices");
  assert.equal(await page.locator("[data-folio-after]").count(),3,
    "After Mass must have none, thanksgiving and full choices");
  await page.locator("[data-folio-before][value='full']").check();
  await page.locator("[data-folio-after][value='full']").check();
  assert.deepEqual(await page.evaluate(()=>{
    const x=globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.experience;
    return {before:x?.before,after:x?.after};
  }),{before:"full",after:"full"},"Mass Folio choices did not reach the session");
  await page.locator("[data-folio-open-prayer='before']").click();
  await page.waitForSelector("#aoPray435930.open [data-tp381-mass-continue]",{state:"visible",timeout:15000});
  assert.equal(await page.locator("#aoPray435930 .aoMassFolioPrayerNav").count(),1,
    "Preparation rendered outside the existing canonical Prayer reader");
  await page.locator("#aoPray435930 [data-tp381-mass-cancel]").click();
  await page.waitForFunction(()=>!document.getElementById("aoPray435930")?.classList.contains("open"),null,{timeout:10000});
  await prep.waitFor({state:"visible",timeout:10000});
  assert.equal(await page.locator("[data-folio-before][value='full']").isChecked(),true,
    "Prayer Back discarded the chosen Mass preparation");
  assert.equal(await page.locator("[data-folio-after][value='full']").isChecked(),true,
    "Prayer Back discarded post-Mass preference");

  console.log("PASS real phone "+width+"px Follow Mass opens Mass preparation, not LIVE",JSON.stringify(data));
  if(errors.length)console.log("Other page warnings",errors.slice(0,3));

  await page.close();
 }
 // Sunday 25 October 2026: exercise REAL Home -> folio -> Start Mass ->
 // native reader in each mode. The generic preflight test above only opens
 // the setup, while the 65-card fixture test bypasses actual Home/Start.
 for(const mode of ["LIVE","SIMPLE","MISSAL"]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:"en-GB"});
  try{
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e?.message??e)));
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
    {waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&
    globalThis.AO_CELEBRATION_API?.openPreflight&&globalThis.AO_RUNTIME_V8?.resolver?.resolveDay),null,{timeout:45000});
   // Source date is selected through the REAL 1962 Calendar owner, not a
   // mocked Proper or a clock-dependent "tomorrow" inference in CI.
   const selected=await page.evaluate(async()=>{
    if(!globalThis.AO_CALENDAR_APP_V1?.select)
     await import("/src/calendar/calendar-runtime.js");
    return globalThis.AO_CALENDAR_APP_V1.select("2026-10-25");
   });
   assert.equal(selected,true,mode+" Calendar could not select Christ the King");
   await page.waitForFunction(()=>{
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate==="2026-10-25"&&!s.resolving&&
      s.resolution?.date==="2026-10-25"&&s.resolution?.day?.main;
   },null,{timeout:40000});
   const calendar=await page.evaluate(()=>{
    const s=globalThis.AO_RUNTIME_V8.store.getState();
    return {date:s.selectedDate,title:String(s.resolution.day.main.title??""),
      source:s.resolution.proper?.data?.sourcePath,
      commemorations:(s.resolution.day.commemorations??[]).length};
   });
   assert.match(calendar.title,/Christ.*King/i,mode+" picked wrong Sunday: "+JSON.stringify(calendar));
   assert.equal(calendar.source,"Sancti/10-DU",mode+" Proper source wrong");
   assert.equal(calendar.commemorations,0,mode+" invented an impeded-Sunday commemoration");
   const home=page.locator(".homeScreen [data-home-mass-entry]");
   await home.waitFor({state:"visible",timeout:20000});
   await home.click();
   const prep=page.locator("[data-ao-full-mass-preflight]");
   await prep.waitFor({state:"visible",timeout:20000});
   await page.waitForFunction(()=>document.querySelector("[data-ao-full-mass-preflight]")?.dataset.aoProperSource==="Sancti/10-DU",null,{timeout:20000});
   // No devotional interlude obscuring this critical entry proof.
   await prep.locator('[data-folio-before][value="none"]').check();
   await prep.locator('[data-folio-goto="reader"]').first().click();
   await prep.locator('[data-full-mass-reader-mode][value="'+mode+'"]').check();
   await page.waitForFunction(expected=>{
    const p=document.querySelector("[data-ao-full-mass-preflight]");
    return p?.dataset.aoChosenReaderMode===expected&&p.dataset.aoProperReady==="true";
   },mode,{timeout:30000});
   const launch=page.locator("#ao-mass-flow-v1 [data-ao-start-live]").first();
   assert.equal(await launch.count(),1,mode+" missing authoritative Start Mass action");
   await launch.click();
   await page.waitForFunction(expected=>{
    const preview=document.querySelector("#ao-r17-native-reader-preview");
    return !!preview?.isConnected&&
      preview.querySelector("[data-ao-reader-shell]")?.dataset.mode===expected&&
      Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW);
   },mode,{timeout:45000});
   const opened=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const shell=root.querySelector("[data-ao-reader-shell]");
    const paragraph=root.querySelector('[data-role="paragraphs"]');
    return {mode:shell?.dataset.mode,owner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner,
      title:root.querySelector('[data-role="section-title"]')?.textContent?.trim()??"",
      progress:root.querySelector('[data-role="progress"]')?.textContent?.trim()??"",
      paragraphCount:paragraph?.querySelectorAll(".ao-reader-paragraph").length??0,
      visible:getComputedStyle(root).display!=="none"&&root.getBoundingClientRect().width>250,
      globalRibbonHidden:document.querySelector("#ao-global-ribbon")?.hidden===true,
      activeMassDate:globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass?.date??null,
      activeMassSource:globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass?.proper?.sourcePath??null};
   });
   assert.equal(opened.owner,"R17_NATIVE_PRODUCTION",mode+" launched an obsolete reader");
   assert.equal(opened.mode,mode);
   assert.ok(opened.visible&&opened.paragraphCount>0,
    mode+" opened blank or hidden Mass: "+JSON.stringify(opened));
   assert.equal(opened.globalRibbonHidden,true,mode+" bottom app ribbon obscures Mass");
   const previous=opened.progress;
   const next=page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']");
   await next.click();
   await page.waitForFunction(old=>{
    const progress=document.querySelector("#ao-r17-native-reader-preview [data-role='progress']");
    return !!progress&&progress.textContent.trim()!==old;
   },previous,{timeout:12000});
   assert.equal(await page.locator("#ao-r17-native-reader-preview [data-ao-reader-shell]").getAttribute("data-mode"),mode,
     "Reader mode silently changed on next Mass section");

   // In-church continuity: after starting this EXACT source-owned Sunday Mass,
   // turning off the network must not prevent movement through its cached
   // native reader. Then verify the production Home Resume entry restores
   // the same feast and advanced card after a fresh page reload.
   if(mode==="LIVE"){
    const beforeOffline=await page.locator("#ao-r17-native-reader-preview [data-role='progress']").textContent();
    await context.setOffline(true);
    await next.click();
    await page.waitForFunction(previous=>{
      const text=document.querySelector("#ao-r17-native-reader-preview [data-role='progress']")?.textContent?.trim();
      return Boolean(text&&text!==previous);
    },beforeOffline.trim(),{timeout:12000});
    const offlineState=await page.evaluate(()=>({
      date:globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass?.date,
      mode:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.dataset.mode,
      text:document.querySelector("#ao-r17-native-reader-preview [data-role='paragraphs']")?.textContent?.trim(),
      progress:document.querySelector("#ao-r17-native-reader-preview [data-role='progress']")?.textContent?.trim()
    }));
    assert.equal(offlineState.date,"2026-10-25","Offline Mass lost selected feast");
    assert.equal(offlineState.mode,"LIVE","Offline Mass changed mode");
    assert.ok(offlineState.text?.length>30,"Offline next card is blank");
    await context.setOffline(false);
    await page.reload({waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForSelector(".homeScreen",{state:"visible",timeout:35000});
    const resume=page.locator(".homeScreen [data-resume-mass]");
    await resume.waitFor({state:"visible",timeout:30000});
    assert.equal(await page.locator(".homeScreen [data-home-mass-entry]").count(),0,
      "Resume and Start-as-new appeared as ambiguous duplicate actions");
    await resume.click();
    await page.waitForFunction(()=>Boolean(document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")),null,{timeout:45000});
    const resumed=await page.evaluate(()=>({
      date:globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass?.date,
      source:globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass?.proper?.sourcePath,
      mode:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.dataset.mode,
      progress:document.querySelector("#ao-r17-native-reader-preview [data-role='progress']")?.textContent?.trim(),
      visible:!!document.querySelector("#ao-r17-native-reader-preview [data-role='paragraphs']")?.textContent?.trim()
    }));
    assert.equal(resumed.date,"2026-10-25","Resume changed the active source date");
    assert.equal(resumed.source,"Sancti/10-DU","Resume changed the feast Proper");
    assert.equal(resumed.mode,"LIVE","Resume changed the reader mode");
    assert.equal(resumed.visible,true,"Resume rendered empty prayer text");
    assert.equal(resumed.progress,offlineState.progress,
      "Resume restarted at the beginning instead of preserving card position");
    console.log("PASS Christ King LIVE offline card navigation and on-reload resume",JSON.stringify({offline:offlineState.progress,resumed}));
   }

   assert.deepEqual(errors.filter(x=>!/ResizeObserver loop/.test(x)),[],
    mode+" actual Sunday Mass produced JS page errors");
   console.log("PASS 25 Oct Home -> Christ King Proper -> folio -> "+mode+" -> native reader next",JSON.stringify(opened));
  }finally{await context.close()}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}

