import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".mjs":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const data=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForSelector(".homeScreen.aoTodayH4",{state:"visible",timeout:45000});
 await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.select &&
   globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_R17_BROWSER_ENTRY?.installed),
   null,{timeout:45000});
 // Reproduce any time of year; do not depend on the machine's civil clock.
 await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
 await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",{state:"visible",timeout:45000});
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.select("2026-11-06",{closeAfter:false})),true);
 await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
 await page.waitForFunction(()=>{
  const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
  return st?.route==="home" && st.selectedDate==="2026-11-06" && !st.resolving &&
   document.querySelector(".homeScreen .aoH7HomeView [data-home-icrsp-ordo='2026-11-06']");
 },null,{timeout:45000});
 const official=page.locator(".homeScreen .aoH7HomeView [data-home-icrsp-ordo='2026-11-06']");
 await official.waitFor({state:"visible"});
 const snapshot=await official.innerText();
 for(const expected of ["ICRSP France","Sacred Heart","Cogitationes","Class 4","Class 3",
   "No Credo","Ephesians 3:8–19","John 19:31–37","Friday abstinence"])
  assert.ok(snapshot.includes(expected),expected+" missing from actual Home: "+snapshot);
 assert.match(await official.locator("a").getAttribute("href"),/icrspfrance\.fr\/ordo\.php\?d=2026-11-06/);
 await page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]").click();
 const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
 await door.waitFor({state:"visible"});
 assert.equal(await door.locator("[data-home-icrsp-ordo='2026-11-06']").count(),1);
 assert.match(await door.innerText(),/Begin general-calendar Mass/);
 assert.match(await door.innerText(),/Use Sacred Heart votive/);
 await door.locator("[data-home-icrsp-votive='VOTIVE']").click();
 await page.waitForFunction(()=>{
   const a=globalThis.AO_CELEBRATION_ARCH_V1;
   return a?.actualCelebration?.id==="sacred_heart"&&
     a?.votiveBasis==="first_friday"&&
     a?.rubric?.gloria===true&&a?.rubric?.credo===false;
 },null,{timeout:30000});
 const selected=await page.evaluate(()=>{
   const a=globalThis.AO_CELEBRATION_ARCH_V1;
   const pre=globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight??null;
   return {actualId:a?.actualCelebration?.id,properPath:globalThis.AO_CELEBRATION_CATALOGUE?.sacred_heart?.path,
     basis:a?.votiveBasis,rubric:a?.rubric,form:pre?.chosenForm??pre?.form,
     selectedDate:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate};
 });
 assert.deepEqual([selected.actualId,selected.properPath,selected.basis,selected.selectedDate],
   ["sacred_heart","Votive/Pent02-5","first_friday","2026-11-06"]);
 assert.equal(selected.rubric?.votiveClass,3,"First-Friday votive must be III class");
 assert.equal(selected.rubric?.gloria,true,"First-Friday Sacred Heart must HAVE Gloria");
 assert.equal(selected.rubric?.credo,false,"First-Friday Sacred Heart must omit Credo");
 assert.equal(selected.form,"LOW","ICRSP one-tap action must automatically select LOW");
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-chosen-mass-form"),"LOW",
   "Mass preflight must reflect Low form without a manual change");
 await page.waitForFunction(()=>globalThis.AO_CELEBRATION_ARCH_V1?.readiness?.loading===false,
  null,{timeout:40000});
 const source=await page.evaluate(()=>{
   const a=globalThis.AO_CELEBRATION_ARCH_V1;
   return {path:a.resolvedProper?.sourcePath??a.resolvedProper?.data?.sourcePath??null,
     ready:a.readiness,hasProper:!!a.resolvedProper};
 });
 console.log("ICRSP_2026_11_06_SACRED_HEART_PROPER "+JSON.stringify(source));
 assert.ok(source.hasProper,"Exact Sacred Heart Proper failed to resolve: "+JSON.stringify(source));
 assert.equal(source.path,"Votive/Pent02-5","Unexpected actual Mass Proper");
 // The previous phone gate checked only identity, Gloria and Credo, and
 // erroneously passed with one Collect, Secret and Postcommunion. Verify
 // the PREPARED REAL READER payload in both translation languages.
 const actual=await page.evaluate(async()=>{
   const prepared=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
   const proper=prepared?.session?.resolvedMass?.proper?.data ??
     prepared?.session?.resolvedMass?.proper;
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const en=properToReaderSlots(proper,{language:"en"});
   const fr=properToReaderSlots(proper,{language:"fr"});
   return {date:prepared?.session?.resolvedMass?.date,
     form:prepared?.session?.resolvedMass?.form,sourcePath:proper?.sourcePath,
     proPapa:proper?.proPapaOrationDecision?.additionalPrayer??null,
     counts:Object.fromEntries(["collects","secrets","postcommunions"].map(
       k=>[k,proper?.[k]?.length??0])),
     sourceEnd:proper?.postcommunions?.[1]?.lat??"",
     slots:Object.fromEntries([["en",en],["fr",fr]].map(([lang,x])=>[
       lang,Object.fromEntries(["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]
        .map(slot=>[slot,x.slots?.[slot]?.data?.paragraphs?.length??0]))]))
   };
 });
 assert.deepEqual([actual.sourcePath,actual.form,actual.proPapa],
  ["Votive/Pent02-5","LOW","PRO_PAPA"],"Actual reader lacks dated ICRSP Pro Papa source: "+JSON.stringify(actual));
 assert.deepEqual(actual.counts,{collects:2,secrets:2,postcommunions:2},
  "Exactly two of each oration required for 6 Nov ICRSP Low Mass");
 for(const slots of Object.values(actual.slots))
  assert.deepEqual(slots,{COLLECT_SET:2,SECRET_SET:2,POSTCOMMUNION_SET:2});
 assert.match(actual.sourceEnd,/Hæc nos|H[aæ]c nos/i,
  "The second Postcommunion must be the actual Pro Papa text");
 console.log("ICRSP_NOV06_PRO_PAPA_PREPARED_PHONE_PASS "+JSON.stringify(actual));
 assert.equal(errors.length,0,"Runtime errors: "+JSON.stringify(errors));
 await page.close();
 console.log("PASS: actual 390px ICRSP 6 Nov Home → Sacred Heart III-class Low Mass with Gloria, no Credo, and two source-owned Collects, Secrets and Postcommunions.");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
