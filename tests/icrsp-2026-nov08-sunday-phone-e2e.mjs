// Real ICRSP France 8 Nov 2026: a general Sunday with an institute-specific
// additional Pro Papa collect, secret and Postcommunion. Never globalize them.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  await page.goto("http://127.0.0.1:"+server.address().port+
   "/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForSelector(".homeScreen .aoH7HomeView [data-home-h7-enter]",
   {state:"visible",timeout:60000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.select&&
   globalThis.AO_R17_BROWSER_ENTRY?.installed),null,{timeout:60000});
  await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
  await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",
   {state:"visible",timeout:45000});
  assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.select(
   "2026-11-08",{closeAfter:false})),true);
  await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
  await page.waitForFunction(()=>{
   const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
   return s?.selectedDate==="2026-11-08"&&!s.resolving&&
    s?.resolution?.proper?.data?.sourcePath==="Tempora/Epi5-0"&&
    document.querySelector(".homeScreen .aoH7HomeView [data-home-icrsp-ordo='2026-11-08']");
  },null,{timeout:60000});
  const card=page.locator(".homeScreen .aoH7HomeView [data-home-icrsp-ordo='2026-11-08']");
  const rendered=await card.innerText();
  for(const expected of ["ICRSP France","Dicit Dominus","Class 2","Gloria","Credo",
    "Prayer for the Pope","Holy Trinity"])
   assert.ok(rendered.includes(expected),"ICRSP official Sunday Ordo lacks "+expected+": "+rendered);
  const general=await page.evaluate(async()=>{
   const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-11-08");
   const p=r?.proper?.data;
   const {projectIcrspNov08SundayProPapaOrations}=await import("/src/mass/icrsp-nov08-sunday-pro-papa.js");
   const notSelected=projectIcrspNov08SundayProPapaOrations({proper:r.proper,date:"2026-11-08",
    form:"LOW",actualCelebrationId:"mass_of_day",votiveBasis:null});
   return {id:r?.day?.main?.id,source:p?.sourcePath,
    counts:["collects","secrets","postcommunions"].map(k=>p?.[k]?.length),
    untouched:notSelected.proper===r.proper,status:notSelected.status};
  });
  assert.equal(general.id,"tempora:Epi5-0:2:g");
  assert.equal(general.source,"Tempora/Epi5-0");
  assert.deepEqual(general.counts,[1,1,1],
   "The universal Roman 1962 Sunday is never given institute-specific prayers");
  assert.equal(general.status,"NOT_APPLICABLE");
  assert.equal(general.untouched,true);
  await card.locator('[data-home-icrsp-sunday="SUNDAY"]').click();
  const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
  await door.waitFor({state:"visible",timeout:45000});
  await page.waitForFunction(()=>Boolean(
    globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.chosenForm==="LOW"
  ),null,{timeout:45000});
  const prepared=await page.evaluate(async()=>{
   const {isExplicitIcrspNov08SundaySelection,projectIcrspNov08SundayProPapaOrations}
    =await import("/src/mass/icrsp-nov08-sunday-pro-papa.js");
   const explicit=isExplicitIcrspNov08SundaySelection({win:globalThis,dateIso:"2026-11-08"});
   const result=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
   const mass=result?.session?.resolvedMass;
   const p=mass?.proper?.data??mass?.proper;
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const resultLang=language=>{
    const o=properToReaderSlots(p,{language});
    return {ready:o.ready,missing:o.missing,counts:Object.fromEntries(
     ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].map(k=>
      [k,o.slots?.[k]?.data?.paragraphs?.length??0]))};
   };
   const refusal=projectIcrspNov08SundayProPapaOrations({
    proper:mass?.proper,date:"2026-11-08",form:"MISSA_CANTATA_SIMPLE",
    actualCelebrationId:"mass_of_day",votiveBasis:null,explicitInstituteSelection:true
   });
   return {explicit,date:mass?.date,form:mass?.form,source:p?.sourcePath,
    decision:p?.proPapaOrationDecision?.status,contract:p?.sourceOrdoExpectation?.id,
    groups:["collects","secrets","postcommunions"].map(k=>
     (p?.[k]??[]).map(x=>({source:x.sourcePath??null,purpose:x.liturgicalPurpose??null,
      latin:x.lat?.slice(0,70)}))),
    en:resultLang("en"),fr:resultLang("fr"),sungRefusal:refusal.status};
  });
  console.log("ICRSP_NOV08_PREPARED="+JSON.stringify(prepared));
  assert.equal(prepared.explicit,true,"ICRSP Sunday choice did not survive real Door navigation");
  assert.deepEqual([prepared.date,prepared.form,prepared.source],
   ["2026-11-08","LOW","Tempora/Epi5-0"]);
  assert.equal(prepared.decision,"SOURCE_ATTESTED");
  assert.equal(prepared.contract,"ICRSP_FRANCE_2026-11-08_SUNDAY_PRO_PAPA");
  assert.equal(prepared.sungRefusal,"UNVERIFIED","Unreviewed sung variant must fail closed");
  for(const group of prepared.groups){
   assert.equal(group.length,2,"Missing principal or papal prayer: "+JSON.stringify(group));
   assert.equal(group[1].purpose,"ORATIO_PRO_PAPA");
   assert.equal(group[1].source,"1962_MISSALE_TABULA_ORATIONUM_PRO_PAPA");
  }
  for(const language of ["en","fr"]){
   assert.equal(prepared[language].ready,true,JSON.stringify(prepared[language]));
   assert.deepEqual(prepared[language].counts,
    {COLLECT_SET:2,SECRET_SET:2,POSTCOMMUNION_SET:2});
  }
  const physical=await page.evaluate(async()=>{
   const entered=await globalThis.AO_R17_BROWSER_ENTRY.enter();
   const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
   if(!preview?.showSection)throw Error("NATIVE_READER_NOT_MOUNTED");
   const root=document.querySelector("#ao-r17-native-reader-preview");
   const sections=[...root.querySelectorAll("[data-reader-section-all] [data-reader-section]")];
   const details={visible:sections.length,total:preview.model?.totalCards,
    cards:[],sourceText:null};
   const selected=(await globalThis.AO_R17_BROWSER_ENTRY.prepare())?.session?.resolvedMass?.proper;
   const data=selected?.data??selected;
   details.sourceText=data?.postcommunions?.map(x=>({en:x.en,fr:x.fr,lat:x.lat}));
   for(const node of sections){
    const id=node.getAttribute("data-reader-section");
    const selectedCard=preview.showSection(id);
    if(selectedCard?.sourceSectionId!=="AO.CARD.027")continue;
    const body=root.querySelector(".ao-prayer-card");
    details.cards.push({id,rows:(selectedCard.paragraphs??[]).map(p=>({
      role:p.prayerRole,group:p.orationGroupIndex,primary:p.primary,source:p.sourcePath
     })),text:body?.innerText??"",count:root.querySelector(
     ".ao-verified-oration-count")?.innerText??"",labels:[...root.querySelectorAll(
     ".ao-reader-paragraph[data-oration-group-index]")].map(p=>p.dataset.orationGroupIndex)});
   }
   return details;
  });
  console.log("ICRSP_NOV08_READER="+JSON.stringify({
   count:physical.cards.length,total:physical.total,visible:physical.visible,
   cards:physical.cards.map(x=>({id:x.id,groups:x.labels,roles:x.rows.map(y=>y.role),
     count:x.count,text:x.text.slice(0,460)}))}));
  assert.equal(physical.total,65);
  assert.equal(physical.cards.length,1,
   "Exactly one Postcommunion CARD must contain two source-owned prayers");
  const shown=physical.cards[0];
  assert.deepEqual([...new Set(shown.rows.map(x=>x.group).filter(Number.isInteger))],[1,2]);
  for(const prayer of physical.sourceText)
   assert.ok(shown.text.includes(prayer.en.slice(0,45)),
    "Physical Postcommunion card omits prayer: "+prayer.en.slice(0,50));
  assert.match(shown.text,/Second Postcommunion.*Prayer for the Pope/i);
  assert.match(shown.count,/Two Postcommunions.*Prayer for the Pope/i);
  const before=await page.evaluate(()=>{
   const root=document.querySelector("#ao-r17-native-reader-preview");
   const body=root.querySelector(".ao-prayer-card");
   const second=body?.querySelector('[data-oration-group-index="2"]');
   const a=body?.getBoundingClientRect(),b=second?.getBoundingClientRect();
   return {id:globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId,
    top:b?.top,viewportTop:a?.top,viewportHeight:a?.height,scrollTop:body?.scrollTop};
  });
  assert.ok(before.top>before.viewportTop+Math.min(before.viewportHeight*.5,280),
   "Second Postcommunion must initially be below the phone reading zone");
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
  const after=await page.evaluate(()=>{
   const root=document.querySelector("#ao-r17-native-reader-preview");
   const body=root.querySelector(".ao-prayer-card"),second=body?.querySelector(
    '[data-oration-group-index="2"]');
   return {id:globalThis.AO_R17_NATIVE_READER_PREVIEW.getCurrentCard()?.sectionId,
    scrollTop:body?.scrollTop,secondTop:second?.getBoundingClientRect()?.top,
    viewportTop:body?.getBoundingClientRect()?.top,route:root.dataset.aoNextOration};
  });
  assert.equal(after.id,before.id,"NEXT skipped the second papal Postcommunion");
  assert.ok(after.scrollTop>before.scrollTop+8,"NEXT did not reveal second prayer");
  assert.equal(after.route,"SECOND_PRAYER_REVEALED");
  assert.deepEqual(errors,[]);
  console.log("ICRSP_NOV08_SECOND_POSTCOMMUNION_PHONE_PASS="+JSON.stringify({
   date:"2026-11-08",source:prepared.source,principalAndPapalGroups:[2,2,2],
   generalRomanGroups:[1,1,1],cardCount:physical.total,visible:physical.visible,
   nextRevealedPapalPrayer:true}));
 }finally{await page.close();}
}finally{await browser?.close().catch(()=>{});await new Promise(done=>server.close(done));}
