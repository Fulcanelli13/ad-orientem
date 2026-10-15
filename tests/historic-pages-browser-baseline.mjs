import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/historic-pages-visual");
const origin="https://fulcanelli13.github.io/ad-orientem/";
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const report=[];
let screenshotCount=0;
try{
 for(const width of [320,390,768,1280]){
  const phone=width<768;
  const context=await browser.newContext({
   viewport:{width,height:phone?844:900},
   isMobile:phone,hasTouch:phone,deviceScaleFactor:1,locale:"en-GB",
  });
  const page=await context.newPage();
  const jsErrors=[];
  page.on("pageerror",error=>jsErrors.push(String(error?.message??error).slice(0,350)));
  let pageStatus=null,bootStatus=null;
  try{
   const res=await page.goto(origin+"?ao_pages_visual_baseline="+width,{waitUntil:"domcontentloaded",timeout:45000});
   pageStatus=res?.status()??null;
   try{
    await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner),
      null,{timeout:25000});
    bootStatus="app-shell-visible";
   }catch{
    bootStatus="app-shell-not-confirmed-before-timeout";
   }
   await page.screenshot({
    path:resolve(out,"pages-home-"+width+".png"),
    fullPage:true,animations:"disabled",timeout:20000,
   });
   screenshotCount++;
   const info=await page.evaluate(()=>({
    title:document.title,
    href:location.href,
    lang:document.documentElement.lang,
    app:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    offline:globalThis.AO_OFFLINE_APP_V1?.status??null,
    bodyVisible:document.body?.getBoundingClientRect?.().height??0,
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
    renderVersion:document.documentElement?.dataset?.aoCanonicalHead??null,
    readerMounted:Boolean(document.getElementById("ao-r17-native-reader-preview")),
    updatePrompt:Boolean(document.getElementById("ao-offline-update-ready")),
   }));
   report.push({width,httpStatus:pageStatus,bootStatus,info,jsErrors});
  }catch(error){
   report.push({width,httpStatus:pageStatus,bootStatus,error:String(error?.message??error),jsErrors});
  }finally{
   await context.close();
  }
 }
}finally{
 await browser.close();
}
await writeFile(resolve(out,"results.json"),JSON.stringify({
 origin,source:"fresh Chromium context, actual public GitHub Pages, no existing user CacheStorage",
 collectedAt:new Date().toISOString(),report
},null,2));
for(const row of report)console.log("LIVE_PAGES_VISUAL",JSON.stringify({
 width:row.width,status:row.httpStatus,boot:row.bootStatus,
 hasHome:row.info?.app?.visibleOwner??null,
 overflow:row.info?.horizontalOverflow??null,
 offlineActive:row.info?.offline?.version??null,
 error:row.error??null,jsErrors:row.jsErrors?.slice(0,3)
}));
if(screenshotCount!==4 || report.some(x=>x.httpStatus!==200)){
 throw Error("Actual GitHub Pages screenshot baseline incomplete — review artifacts and browser diagnostics");
}
console.log("PASS actual Pages network Home captured in four fresh Chromium profiles; inspect screenshots for visual approval");
