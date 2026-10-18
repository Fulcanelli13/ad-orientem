import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const base=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(base,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403);return res.end()}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
  serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:80000});
 const initial=await page.evaluate(async()=>{
  const day=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-10-18");
  const {mountObservedLocalOrationsPreflight}=await import("/src/mass/observed-local-orations-preflight.js");
  await import("/src/mass/observed-local-orations-styles.js");
  const anchor=document.createElement("div");anchor.dataset.testLocalAnchor="";document.body.append(anchor);
  globalThis.__testMass={date:"2026-10-18",canStart:true,celebrationId:"mass_of_day",
   requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR"};
  globalThis.__testForm="MISSA_CANTATA_SIMPLE";
  globalThis.__testLanguage="en";
  globalThis.__testDay=day;
  globalThis.__local=mountObservedLocalOrationsPreflight({
   getResolvedMass:()=>globalThis.__testMass,
   getSelectedForm:()=>globalThis.__testForm,
   getCalendarResolution:()=>globalThis.__testDay,
   language:()=>globalThis.__testLanguage,
   mountTarget:()=>anchor,
  });
  return {main:day.day?.main?.id,commemoration:day.day?.commemorations?.[0]?.id,
   state:__local.status()};
 });
 assert.match(initial.main,/Pent21/);
 assert.ok(initial.commemoration);
 assert.equal(initial.state.visible,true,"Source-certified local option should appear on 18 October");
 assert.equal(initial.state.groups.length,0,"Local orations must be opt-in");
 const root=page.locator("[data-ao-observed-local-orations]").last();
 assert.equal(await root.locator("[data-local-oration-group]").count(),3);
 assert.equal((await page.evaluate(()=>__local.selectionFor(__testMass))),null);
 await root.locator("summary").click();
 await root.locator('[data-local-oration-group="collects"]').check();
 await root.locator('[data-local-oration-group="postcommunions"]').check();
 assert.equal(await root.locator('[data-local-oration-group="secrets"]').isChecked(),false);
 assert.equal(await page.evaluate(()=>{
  try{__local.selectionFor(__testMass);return "ERR_NOT_THROWN"}
  catch(e){return e.message}
 }),"LOCAL_ADDITIONAL_ORATIONS_NEED_EXPLICIT_CONFIRMATION");
 await root.locator("[data-local-oration-confirm]").check();
 const projected=await page.evaluate(async()=>{
  const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
  const {projectObservedLocalOrations}=await import("/src/mass/1962-observed-local-orations.js");
  const request=__local.selectionFor(__testMass);
  const standard=select1962CommemorationsForMassForm({
   proper:__testDay.proper,calendarResolution:__testDay,form:__testForm
  });
  const output=projectObservedLocalOrations({
   originalProper:__testDay.proper,selectedProper:standard.proper,
   calendarResolution:__testDay,...request
  });
  const normal=standard.proper.data??standard.proper,local=output.proper.data??output.proper;
  return {request,status:output.status,
   counts:["collects","secrets","postcommunions"].map(k=>local[k].length),
   oldCounts:["collects","secrets","postcommunions"].map(k=>normal[k].length),
   source:local.observedLocalOrationDecision.confirmationKind,
   unchanged:local.collects[0].lat===normal.collects[0].lat,
   mission:local.missionSundayCollectDecision?.status};
 });
 assert.deepEqual(projected.request.observedGroups,["collects","postcommunions"]);
 assert.equal(projected.status,"OBSERVED_LOCAL_NOT_1962_NORMATIVE");
 assert.deepEqual(projected.counts,[2,1,2]);
 assert.deepEqual(projected.oldCounts,[1,1,1]);
 assert.equal(projected.mission,"CERTIFIED");
 assert.equal(projected.unchanged,true);
 assert.equal(projected.source,"EXPLICIT_PREMASS_LOCAL_REPORT");
 await root.locator('[data-local-oration-group="secrets"]').check();
 assert.equal(await root.locator("[data-local-oration-confirm]").isChecked(),false,
  "Changing which prayers are selected must invalidate the earlier affirmation");
 await page.evaluate(()=>{__testForm="LOW";__local.refresh()});
 assert.equal((await page.evaluate(()=>__local.status())).visible,false,
  "Low Mass already includes the certified commemoration; no local overlay");
 await page.evaluate(()=>{__testForm="MISSA_CANTATA_SIMPLE";__local.refresh()});
 assert.equal((await page.evaluate(()=>__local.status())).groups.length,0);
 await root.locator('[data-local-oration-group="collects"]').check();
 await root.locator("[data-local-oration-confirm]").check();
 await page.evaluate(()=>{__testLanguage="fr";__local.refresh()});
 assert.deepEqual(await page.evaluate(()=>__local.status().groups),[],
  "English confirmation must not carry silently to French");
 assert.match(await root.locator("summary").textContent(),/supplémentaires/);
 await page.evaluate(()=>{__testMass={...__testMass,date:"2026-10-19"};__local.refresh()});
 assert.equal((await page.evaluate(()=>__local.status())).visible,false);
 await page.evaluate(()=>{__testMass={...__testMass,date:"2026-10-18",
  celebrationId:"votive",celebrationType:"VOTIVE"};__local.refresh()});
 assert.equal((await page.evaluate(()=>__local.status())).visible,false);
 assert.deepEqual(errors,[],"Uncaught JavaScript errors");
 await page.evaluate(()=>__local.dispose());
 console.log("PASS: Phone pre-Mass local prayer selector respects source, explicit attestation, partial oration groups, and date/form/language resets");
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
