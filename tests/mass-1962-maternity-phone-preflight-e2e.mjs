import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/mass-commemoration-phone-20261011");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",
 ".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden");}
  const content=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(content);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:"fr-FR",serviceWorkers:"block"});
  const pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoTodayH4=0&aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:80000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.revealDate&&globalThis.AO_CELEBRATION_API?.openPreflight),null,{timeout:70000});
  const switched=await page.evaluate(async()=>await globalThis.AO_CALENDAR_WEEK_CACHE_V4345.revealDate("2026-10-11",{forceLoader:false,prefetch:false}));
  assert.equal(switched,true,"Calendar navigation failed for Oct 11");
  await page.waitForFunction(()=>{const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate==="2026-10-11"&&s.resolution?.date==="2026-10-11"&&!s.resolving;},null,{timeout:45000});
  const resolved=await page.evaluate(()=>{const c=globalThis.AO_CELEBRATION_API?.getResolvedMass?.();
   const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
   return {massDate:c?.date,selectedDate:s?.selectedDate,main:s?.resolution?.day?.main?.title};});
  // We must verify the genuine host Mass date, not an injected preflight.
  assert.equal(resolved.massDate,"2026-10-11","Host Mass date did not follow selected 1962 Calendar day "+JSON.stringify(resolved));
  // This scenario intentionally audits the original source-owned M1 preflight
  // on the supported H3 rollback; production H4 Begin starts R17 directly.
  // The actual H4 Mass handoff remains independently phone-tested.
  const open=page.locator(".homeScreen [data-home-mass-entry]");
  await open.waitFor({state:"visible",timeout:35000});
  await open.click();
  const preflight=page.locator("[data-ao-full-mass-preflight]");
  await preflight.waitFor({state:"visible",timeout:35000});
  const block=page.locator("[data-ao-full-mass-preflight] [data-mass-calendar-commemoration]");
  await page.waitForFunction(()=>{
    const node=document.querySelector("[data-ao-full-mass-preflight] [data-mass-calendar-commemoration]");
    return node&&!node.hidden&&
      /^(COMPLETE|PENDING|INCOMPLETE|FORM_RULES_UNVERIFIED|NOT_APPLIED_TO_FORM)$/.test(node.dataset.massCommemorationReadiness||"") &&
      /Maternity of the Blessed Virgin Mary|Maternit/i.test(node.querySelector("[data-mass-calendar-commemoration-name]")?.textContent||"");
  },null,{timeout:12000}).catch(async error=>{
    const diagnostic=await page.evaluate(()=>{
      const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
      const legacy=globalThis.AO_CELEBRATION_API?.getResolvedMass?.();
      const block=document.querySelector("[data-ao-full-mass-preflight] [data-mass-calendar-commemoration]");
      const root=document.querySelector("[data-ao-full-mass-preflight]");
      return {
        selected:state?.selectedDate,calendarDate:state?.resolution?.date,calendarMain:state?.resolution?.day?.main,
        calendarCommem:state?.resolution?.day?.commemorations,
        legacyDate:legacy?.date,legacyType:legacy?.celebrationType,legacyId:legacy?.celebrationId,
        legacyTitle:legacy?.celebrationTitle,legacyActual:legacy?.actualCelebration,
        legacyProperStatus:legacy?.proper?.status,legacyProperSource:legacy?.proper?.data?.sourcePath,
        legacyPrayers:Object.fromEntries(["collects","secrets","postcommunions"].map(k=>[k,legacy?.proper?.data?.[k]?.length??0])),
        panelVisible:!!root,blockExists:!!block,blockHidden:block?.hidden,blockReadiness:block?.dataset.massCommemorationReadiness,
        blockName:block?.querySelector("[data-mass-calendar-commemoration-name]")?.textContent,
        rootCalendarSource:root?.querySelector("[data-mass-calendar-context]")?.dataset?.massCalendarSource,
        rootSnippet:root?.querySelector("[data-mass-calendar-context]")?.textContent?.slice(0,800)
      };
    });
    console.log("OCT11_PHONE_PREFLIGHT_BLOCKER_"+width,JSON.stringify(diagnostic));
    await page.screenshot({path:resolve(out,"preflight-error-oct11-"+width+".png"),fullPage:true});
    throw error;
  });
  const sourceDiagnostic=await page.evaluate(async()=>{
    const calendar=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    const legacy=globalThis.AO_CELEBRATION_API?.getResolvedMass?.();
    const source=legacy?.proper?.data??legacy?.proper??null;
    const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
    const form=document.querySelector('input[name="ao-native-mass-form"]:checked')?.value??"MISSA_CANTATA_INCENSE";
    const probe=select1962CommemorationsForMassForm({proper:source,calendarResolution:calendar?.resolution,form});
    return {form,reason:probe.reason,status:probe.status,
      legacyMassType:legacy?.celebrationType,legacyId:legacy?.celebrationId,
      properSource:source?.sourcePath??null,prayerCounts:["collects","secrets","postcommunions"].map(k=>source?.[k]?.length??null),
      sourceCommem:source?.calendarCommemorations?.map(x=>({path:x.path,name:x.name})),
      calendarStatus:calendar?.resolution?.status,calendarCount:calendar?.resolution?.day?.commemorations?.length,
      sourceDayProperPath:calendar?.resolution?.proper?.data?.sourcePath,
      sourceDayCommemCount:calendar?.resolution?.proper?.data?.calendarCommemorations?.length};
  });
  console.log("OCT11_PHONE_SOURCE_"+width,JSON.stringify(sourceDiagnostic));
  assert.match(await block.locator("[data-mass-calendar-commemoration-name]").innerText(),/Maternity of the Blessed Virgin Mary|Maternit/i);
  assert.match(await block.locator("[data-mass-calendar-commemoration-prayers]").innerText(),/prayers|prières|orations|oraisons|Collect|collecte|secrète|postcommunion/i);
  assert.equal(await block.isVisible(),true,"Commemoration visually hidden on phone");
  await block.scrollIntoViewIfNeeded();
  const data=await block.evaluate(el=>{
   const r=el.getBoundingClientRect(),css=getComputedStyle(el),w=window.innerWidth;
   return{rect:{left:r.left,right:r.right,width:r.width,top:r.top,bottom:r.bottom},
     viewportWidth:w,overflowX:document.documentElement.scrollWidth>w+2,
     display:css.display,color:css.color,readiness:el.dataset.massCommemorationReadiness,
     name:el.querySelector("[data-mass-calendar-commemoration-name]")?.textContent};
  });
  assert.equal(data.overflowX,false,"Horizontal overflow in Mass preflight at "+width+": "+JSON.stringify(data));
  assert.ok(data.rect.left>=-2&&data.rect.right<=width+2,"Commemoration clipped at "+width+": "+JSON.stringify(data));
  assert.equal(data.readiness,"NOT_APPLIED_TO_FORM",
    "The sourced II-class Sunday ordinary commemoration is omitted at non-conventual Sung Mass");
  assert.match(await block.locator("[data-mass-calendar-commemoration-prayers]").innerText(),
    /does not include|ne sont pas retenues/i,
    "Phone preflight must distinguish the Calendar feast from prayers said at the selected Mass");
  if(data.readiness==="FORM_RULES_UNVERIFIED"){
    assert.match(await block.locator("[data-mass-calendar-commemoration-prayers]").innerText(),
      /not yet verified|pas encore vérifiée/i,
      "An uncertified form must not claim all extra prayers are prescribed");
  }
  if(data.readiness==="PENDING"){
    assert.match(await block.locator("[data-mass-calendar-commemoration-prayers]").innerText(),/still being resolved|en cours de résolution/i,
      "Unresolved host Mass must show an honest pending Proper notice");
  }
  await page.screenshot({path:resolve(out,"preflight-oct11-"+width+".png"),fullPage:true});
  console.log("PASS_OCT11_PHONE_"+width,JSON.stringify({resolved,data,pageErrors:pageErrors.slice(0,3)}));
  await page.close();
 }
}finally{await browser?.close();await new Promise(done=>server.close(done));}
