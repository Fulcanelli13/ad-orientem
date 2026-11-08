// 9 Nov 2026: official ICRSP France Ordo lists both Theodore and pro Papa,
// but the 1960 II-class weekday norm §434(c) permits only one ordinary extra.
// Confirm actual 390px Home and Mass door show the conflict and never silently
// present a three-oration institute Mass as verified. Do not alter the Proper.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const DAY="2026-11-09";
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".woff2":"font/woff2",".webp":"image/webp"};
const srv=http.createServer(async(req,res)=>{
 try{
  const name=resolve(root,"."+decodeURIComponent(
   new URL(req.url,"http://127.0.0.1").pathname));
  if(name!==root&&!name.startsWith(root+sep)){
   res.writeHead(403);return res.end("Forbidden");
  }
  const bytes=await readFile(name);
  res.writeHead(200,{"content-type":mime[extname(name)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message))}
});
await new Promise(done=>srv.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const lang of ["en","fr"]){
  const page=await browser.newPage({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,serviceWorkers:"block",
   locale:lang==="fr"?"fr-FR":"en-GB"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+srv.address().port+
    "/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForSelector(".homeScreen .aoH7HomeView [data-home-h7-enter]",
    {state:"visible",timeout:60000});
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_CALENDAR_APP_V1?.select&&globalThis.AO_R17_BROWSER_ENTRY?.installed),
    null,{timeout:60000});
   await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
   await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",
    {state:"visible",timeout:45000});
   assert.equal(await page.evaluate(d=>
    globalThis.AO_CALENDAR_APP_V1.select(d,{closeAfter:false}),DAY),true);
   await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
   await page.waitForFunction(d=>{
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate===d&&!s?.resolving&&s?.resolution?.date===d&&
     document.querySelector(".aoH7HomeView [data-home-icrsp-intake-hold='2026-11-09']");
   },DAY,{timeout:60000});
   const home=page.locator(".homeScreen .aoH7HomeView");
   const uiLanguage=await page.locator(".homeScreen").getAttribute("data-home-language");
   const uiFr=uiLanguage==="fr";
   if(lang==="fr"){
    // Browser locale alone must not be mistaken for the actual Home
    // language setting. Verify the real French renderer independently.
    const french=await page.evaluate(async()=>{
     const {renderIcrspFranceHomeOrdo}=await import(
      "/src/calendar/icrsp-france-ordo-evidence.js");
     return renderIcrspFranceHomeOrdo("2026-11-09","fr");
    });
    assert.match(french,/data-mass-1962-rubric-conflict="RGMR_434_C"/);
    assert.match(french,/une seule oraison supplémentaire distincte/);
   }

   const warning=home.locator('[data-home-icrsp-intake-hold="2026-11-09"]');
   assert.equal(await warning.count(),1);
   assert.equal(await warning.getAttribute("data-mass-source-status"),"UNVERIFIED");
   assert.equal(await warning.locator('[data-mass-1962-rubric-conflict="RGMR_434_C"]').count(),1);
   const words=await warning.innerText();
   assert.match(words,uiFr?/saint Théodore/i:/St Theodore|saint Theodore/i);
   assert.match(words,uiFr?/oraison pour le Pape/i:/Prayer for the Pope/);
   assert.match(words,uiFr?/une seule oraison supplémentaire distincte/:/only one separate additional oration/);
   assert.match(words,uiFr?/non encore vérifiée/:/not yet verified/);
   assert.equal(await home.locator('[data-home-icrsp-sunday],[data-home-icrsp-votive]').count(),0);
   const source=await page.evaluate(async()=>{
    const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-11-09");
    const {review1962OrationLimits}=await import("/src/mass/1962-oration-limit-review.js");
    const {icrspFranceOrdoIntakeStatus}=await import("/src/calendar/icrsp-france-ordo-intake-status.js");
    const status=icrspFranceOrdoIntakeStatus("2026-11-09");
    return {date:r.date,status:r.status,properStatus:r.proper?.status,
     source:r.proper?.data?.sourcePath,main:r.day?.main?.id,
     calendarClass:r.day?.main?.rank,
     protectedStatus:status.status,
     reviewed:review1962OrationLimits({expectation:{
      date:"2026-11-09",ordoLiturgicalDayClass:2,
      sourceClaim:{sourceOrder:["PRINCIPAL","COMMEMORATION:SAINT_THEODORE_MARTYR","ORATIO_PRO_PAPA"]}
     },form:"LOW"})};
   });
   assert.equal(source.date,DAY);
   assert.equal(source.status,"ready");
   assert.equal(source.properStatus,"ready");
   assert.equal(source.calendarClass,2);
   assert.equal(source.reviewed.reason,
    "SECOND_CLASS_DAY_MORE_THAN_ONE_ADDITIONAL_ORATION");
   assert.equal(source.reviewed.permittedSeparateGroups,2);
   assert.equal(source.reviewed.sourceClaimedGroups,3);
   await home.locator("[data-home-h7-enter]").click();
   const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
   await door.waitFor({state:"visible",timeout:30000});
   const doorWarning=door.locator('[data-home-icrsp-intake-hold="2026-11-09"]');
   assert.equal(await doorWarning.count(),1);
   assert.equal(await doorWarning.locator('[data-mass-1962-rubric-conflict="RGMR_434_C"]').count(),1);
   assert.equal(await door.locator('[data-home-icrsp-sunday],[data-home-icrsp-votive]').count(),0);
   assert.match(await door.innerText(),uiFr?/Commencer la messe du calendrier général/:/Begin general-calendar Mass/);
   // The original Home default may be Sung. St Theodore's *ordinary*
   // nonprivileged commemoration must be restored in a 1962 LOW Mass only.
   // Select the exact form and reader language through the real H7 sheet.
   await door.locator("[data-home-h4-change]").first().click();
   const choice=page.locator(".aoH4ChoiceDialog[open]");
   await choice.waitFor({state:"visible",timeout:20000});
   await choice.locator('[data-h4-option="form"]').selectOption("LOW");
   await choice.locator('[data-h4-option="readerMode"]').selectOption("LIVE");
   await choice.locator('[data-h4-option="readerLanguage"]').selectOption(lang);
   await choice.locator('[data-h4-option="beforeMass"]').selectOption("none");
   await choice.locator("[data-h4-sheet-close]").last().click();
   await choice.waitFor({state:"detached",timeout:20000});
   const originalSelection=await page.evaluate(async()=>{
    const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-11-09");
    const mod=await import("/src/mass/1962-commemoration-form-source.js");
    const original=r.proper?.data??r.proper;
    const chosen=mod.select1962CommemorationsForMassForm({
     proper:r.proper,calendarResolution:r,form:"LOW",
     celebrationId:"mass_of_day",isConventual:false,observedSource:false
    });
    const data=chosen.proper?.data??chosen.proper;
    return {principal:r.day?.main,commemorations:r.day?.commemorations,
     initialCounts:["collects","secrets","postcommunions"].map(k=>original?.[k]?.length),
     selectorStatus:chosen.status,selectorReason:chosen.reason,
     selectorDecision:data?.commemorationFormDecision,
     selectedRows:["collects","secrets","postcommunions"].map(k=>
      (data?.[k]??[]).map(x=>({
       sourcePath:x.sourcePath??null,prayerSourcePath:x.prayerSourcePath??null,
       purpose:x.liturgicalPurpose??null,latin:String(x.lat??"").slice(0,130)
      })))
    };
   });
   console.log("NOV09_INDEPENDENT_EXISTING_LOWMASS_SOURCE_DIAGNOSTIC "+
    JSON.stringify(originalSelection));
   const assembled=await page.evaluate(async()=>{
    const r=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
    const mass=r?.session?.resolvedMass,p=mass?.proper?.data??mass?.proper;
    return {date:mass?.date,form:mass?.form,sourcePath:p?.sourcePath,
     sourceOrdoExpectation:p?.sourceOrdoExpectation?.id??null,
     prayerRoles:["collects","secrets","postcommunions"].map(k=>
      (p?.[k]??[]).map(x=>x.liturgicalPurpose??"PRINCIPAL"))};
   });
   assert.equal(assembled.date,DAY);
   assert.equal(assembled.form,"LOW","St Theodore is only admitted in nonconventual LOW Mass");
   assert.equal(assembled.sourcePath,"Sancti/11-09",
    "Canonical Lateran Dedication source changed");
   console.log("NOV09_UNIVERSAL_1962_PRAYER_COUNTS "+JSON.stringify({
    language:lang,form:assembled.form,counts:assembled.prayerRoles.map(x=>x.length),
    roles:assembled.prayerRoles,sourcePath:assembled.sourcePath
   }));
   assert.deepEqual(assembled.prayerRoles.map(x=>x.length),[2,2,2],
    "General 1962 Lateran Dedication must retain St Theodore's commemoration in each oration set");
   assert.equal(assembled.sourceOrdoExpectation,null,
    "Source-unverified ICRSP Mass may not acquire a local certification contract");
   for(const roles of assembled.prayerRoles)
    assert.ok(!roles.includes("ORATIO_PRO_PAPA"),
     "Papal oration cannot silently appear in a general Roman Mass");
   // Await native entry exactly as the passing November 8 phone journey
   // does; failures must surface directly, not as a 65-second mount timeout.
   const entered=await page.evaluate(async()=>{
    await globalThis.AO_R17_BROWSER_ENTRY.enter();
    const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    return {mounted:Boolean(preview?.root?.isConnected),
     cards:preview?.model?.totalCards??null};
   });
   console.log("NOV09_NATIVE_ENTRY_RESULT "+JSON.stringify(entered));
   assert.equal(entered.mounted,true,"R17 entry resolved without mounting native reader");
   assert.equal(entered.cards,65,"Unexpected native Mass card count after R17 entry");
   await page.waitForFunction(()=>Boolean(
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.totalCards===65&&
    typeof globalThis.AO_R17_NATIVE_READER_PREVIEW?.showSection==="function"&&
    globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId&&
    document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")
   ),null,{timeout:65000});
   const reader=await page.evaluate(async(language)=>{
    const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    if(!preview?.showSection||preview?.model?.totalCards!==65)
     throw Error("CANONICAL_NATIVE_READER_NOT_OPEN");
    const cards=preview.model.cards??[],roles={};
    for(const [source,group] of [
     ["AO.CARD.004","collects"],["AO.CARD.011","secrets"],
     ["AO.CARD.027","postcommunions"]
    ]){
     const related=cards.filter(c=>c.sourceSectionId===source);
     const groups=[...new Set(related.flatMap(c=>(c.paragraphs??[])
      .filter(x=>["PRINCIPAL_ORATION","ADDITIONAL_ORATION"].includes(x.prayerRole))
      .map(x=>x.orationGroupIndex)))];
     roles[group]={groups,cards:related.length};
    }
    const post=cards.find(c=>c.sourceSectionId==="AO.CARD.027");
    if(!post)throw Error("POSTCOMMUNION_SOURCE_CARD_MISSING");
    preview.showSection(post.sectionId);
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const body=root?.querySelector(".ao-prayer-card");
    const second=body?.querySelector('[data-oration-group-index="2"]');
    const p=(await globalThis.AO_R17_BROWSER_ENTRY.prepare())?.session?.resolvedMass?.proper;
    const data=p?.data??p;
    return {roles,postId:post.sectionId,
     renderedText:body?.innerText??"",
     secondRendered:Boolean(second),
     textSource:(data?.postcommunions??[]).map(x=>x[language]),
     scrollTop:body?.scrollTop??null,
     secondTop:second?.getBoundingClientRect()?.top??null,
     viewportTop:body?.getBoundingClientRect()?.top??null,
     viewportHeight:body?.getBoundingClientRect()?.height??null
    };
   },lang);
   for(const key of ["collects","secrets","postcommunions"])
    assert.deepEqual(reader.roles[key].groups,[1,2],
     "Reader must render principal and Theodore as distinct groups: "+key);
   assert.equal(reader.secondRendered,true,"Theodore Postcommunion missing in DOM");
   assert.equal(reader.textSource.length,2);
   for(const prayer of reader.textSource)
    assert.ok(reader.renderedText.includes(prayer.slice(0,45)),
     "Source-owned Postcommunion text omitted in live reader");
   assert.match(reader.renderedText,/Second Postcommunion|Deuxième postcommunion|Seconde postcommunion/i);
   assert.match(reader.renderedText,/Theodore|Théodore|Præsta nobis/i);
   assert.ok(reader.secondTop>reader.viewportTop+Math.min(reader.viewportHeight*.5,280),
    "Additional Postcommunion must begin below the initial reading zone");
   await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
   const after=await page.evaluate(()=>{
    const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    const root=document.querySelector("#ao-r17-native-reader-preview");
    return {sectionId:preview.getCurrentCard()?.sectionId,
     scrollTop:root.querySelector(".ao-prayer-card")?.scrollTop,
     nextOutcome:root.dataset.aoNextOration};
   });
   assert.equal(after.sectionId,reader.postId,
    "NEXT skipped Theodore's additional Postcommunion");
   assert.ok(after.scrollTop>reader.scrollTop+8,
    "NEXT failed to reveal Theodore's second Postcommunion");
   assert.equal(after.nextOutcome,"SECOND_PRAYER_REVEALED");
   console.log("NOV09_THEODORE_POSTCOMMUNION_REAL_NEXT_PASS "+JSON.stringify({
    language:lang,groups:reader.roles,sourceTextCounts:reader.textSource.length,
    beforeScroll:reader.scrollTop,afterScroll:after.scrollTop
   }));
   assert.deepEqual(errors,[]);
   console.log("ICRSP_NOV09_1962_RUBRIC_HOLD_PHONE_PASS "+JSON.stringify({
    requestedLocale:lang,visibleHomeLanguage:uiLanguage,date:DAY,sourcePath:source.source,prepared:assembled.sourcePath,
    generalMassReady:true,phoneWarnsBothPlaces:true,
    listedGroups:3,ordinary1962Limit:2,papalNotInvented:true}));
  }finally{await page.close();}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(done=>srv.close(done));
}
