import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const data=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4198,"127.0.0.1",ok)});
const routes=[
 ["pray.hub","home"],["pray.angelus_regina","angelus"],["pray.confession","confession"],
 ["pray.benediction","benediction"],["pray.adoration","adoration"],["pray.stations","stations"],
 ["pray.visit_blessed_sacrament","adoration"],["pray.library","library"],
 ["pray.penitential_psalms","penitential"],["pray.litany_saints","litany"],
 ["pray.seven_words","sevenWords"],["pray.forty_hours","fortyHours"],
 ["programme.first_friday","firstFriday"],["programme.first_saturday","firstSaturday"],
 ["pray.de_profundis","prayerOnly"],["pray.eternal_rest","prayerOnly"]
];
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e?.message||e)));
 await page.goto("http://127.0.0.1:4198/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(async()=>globalThis.AO_PRAY_APP_V1.open()),true,
   "The lightweight Prayer host must lazy-load the real prayer reader");
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
 // Confession paths must remain under one sacramental owner, with no sins entered.
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null}));
 const conf="#aoPray435930.open";
 assert.equal(await page.locator(conf+" [data-p435930-conf-path]").count(),3);
 assert.equal(await page.locator(conf+" [data-p435930-conf-next]").isDisabled(),true);
 const press=async selector=>{
   const pressed=await page.evaluate(s=>{const el=document.querySelector(s);if(!el)return false;el.click();return true},selector);
   assert.equal(pressed,true,"Missing Confession step button: "+selector);
 };
 await page.locator(conf+" [data-p435930-conf-path='regular']").tap();
 assert.equal(await page.locator(conf+" [data-p435930-conf-path='regular']").getAttribute("aria-pressed"),"true");
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"quick-commandments-1");
 assert.equal(await page.locator(conf+" [data-conf-exam-step]").getAttribute("data-conf-exam-step"),"0");
 for(let n=1;n<5;n++){
   await press(conf+" [data-p435930-conf-next]");
   assert.equal(await page.locator(conf+" [data-conf-exam-step]").getAttribute("data-conf-exam-step"),String(n));
 }
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"ready");
 assert.equal(await page.locator(conf+" [data-ao-confession-card] input").count(),0);
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"at-priest");
 assert.match(await page.locator(conf+" [data-ao-confession-card]").innerText(),/phone away/i);
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"say-sins");
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"contrition-penance");
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"thanksgiving");
 for(const id of ["satisfaction","amendment"]){
   await press(conf+" [data-p435930-conf-next]");
   assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),id);
 }
 assert.match(await page.locator(conf+" [data-p435930-conf-next]").innerText(),/Finish/);
 await press(conf+" [data-p435930-conf-step='0']");
 await press(conf+" [data-p435930-conf-path='returning']");
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"return-priest");
 for(let n=1;n<13;n++){
   await press(conf+" [data-p435930-conf-next]");
   assert.equal(await page.locator(conf+" [data-conf-exam-step]").getAttribute("data-conf-exam-step"),String(n));
 }
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"ready");
 await press(conf+" [data-p435930-conf-next]");
 assert.match(await page.locator(conf+" [data-ao-confession-card]").innerText(),/a long time since/i);
 await press(conf+" [data-p435930-conf-step='0']");
 await press(conf+" [data-p435930-conf-path='general']");
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"general-scope");
 assert.match(await page.locator(conf+" [data-ao-confession-card]").innerText(),/general absolution/i);
 for(let n=1;n<14;n++){
   await press(conf+" [data-p435930-conf-next]");
   assert.equal(await page.locator(conf+" [data-conf-exam-step]").getAttribute("data-conf-exam-step"),String(n));
 }
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"ready");
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"at-priest");
 assert.match(await page.locator(conf+" [data-ao-confession-card]").innerText(),/general Confession/);
 await press(conf+" [data-p435930-conf-next]");
 await press(conf+" [data-p435930-conf-next]");
 await press(conf+" [data-p435930-conf-next]");
 assert.equal(await page.locator(conf+" [data-ao-confession-card]").getAttribute("data-ao-confession-card"),"thanksgiving");
 assert.equal(await page.locator(conf+" [data-p435930-since]").count(),0,"Time estimate must only appear on preparation card");
 assert.equal(await page.locator(conf+" [data-ao-confession-card] input").count(),0,"Do not record sins");
 assert.equal(await page.locator(conf+" .aoP435930ConfSources a[href^='https://www.vatican.va']").count(),2);
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.close());
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null}));
 assert.equal(await page.locator(conf+" [data-p435930-conf-path][aria-pressed='true']").count(),0,
   "Confession path must clear on close and never become a persisted preference");
  // Real card-by-card traditional prayers: preserve each canonical prayer once.
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.morning_evening",{returnContext:null}));
 const daily="#aoPray435930.open [data-ao-pray-guide-card]";
 await page.waitForSelector(daily);
 assert.equal(await page.locator(daily).count(),1,"Morning guidance must show one card, not 11 stacked");
 assert.equal(await page.locator(daily).getAttribute("data-guide-step"),"0");
 assert.equal(await page.locator(daily+" .aoTP381PrayerCard").count(),1,"Guidance must display complete canonical prayer");
 assert.equal(await page.locator(daily+" .aoTP381GuideCount").innerText(),"Step 1 of 11");
 assert.equal(await page.locator(daily+" [data-tp381-daily-step='-1']").isDisabled(),true);
 async function tapStep(control,expected){
  try{await page.locator(control).tap({timeout:6500})}
  catch(error){
    const current=await page.locator(daily).getAttribute("data-guide-step").catch(()=>null);
    if(current===String(expected))return;
    await page.locator(control).scrollIntoViewIfNeeded();
    await page.locator(control).tap({timeout:9000});
  }
 }
 for(let step=1;step<=11;step++){
   await tapStep("#aoPray435930.open [data-tp381-daily-step='"+step+"']",step);
   assert.equal(await page.locator(daily).getAttribute("data-guide-step"),String(step));
   assert.equal(await page.locator(daily).count(),1);
 }
 assert.match(await page.locator(daily).innerText(),/Prayer completed/);
 await tapStep("#aoPray435930.open [data-tp381-daily-step='0']",0);
 await page.locator("#aoPray435930.open [data-tp381-daypart='evening']").tap();
 assert.equal(await page.locator(daily+" .aoTP381GuideCount").innerText(),"Step 1 of 13");
 for(let step=1;step<=8;step++)await tapStep("#aoPray435930.open [data-tp381-daily-step='"+step+"']",step);
 assert.equal(await page.locator(daily).getAttribute("data-ao-pray-guide-card"),"pray.nightly_examen");
 await page.locator("#aoPray435930.open [data-tp381-daily-examen]").tap();
 assert.equal(await page.locator(daily).getAttribute("data-ao-pray-guide-card"),"recollect");
 assert.equal(await page.locator(daily+" .aoTP381GuideCount").innerText(),"Step 1 of 5");
 for(let step=1;step<=5;step++){
   await tapStep("#aoPray435930.open [data-tp381-examen-step='"+step+"']",step);
   assert.equal(await page.locator(daily).getAttribute("data-guide-step"),String(step));
 }
 assert.match(await page.locator(daily).innerText(),/Prayer completed/);
 await page.locator("#aoPray435930.open [data-tp381-examen-return]").tap();
 assert.equal(await page.locator(daily).getAttribute("data-guide-step"),"9","Examen must resume Evening Prayer at contrition");
 assert.equal(await page.locator(daily).getAttribute("data-ao-pray-guide-card"),"sacrament_act_of_contrition");
 await page.locator("#aoPray435930.open [data-tp381-daily-mode='list']").tap();
 assert.equal(await page.locator("#aoPray435930.open .aoTP381PrayerList button").count(),13,"Traditional unabridged overview must survive guided mode");
 await page.locator("#aoPray435930.open [data-tp381-daily-mode='guided']").tap();
 assert.equal(await page.locator(daily).getAttribute("data-guide-step"),"9");
 const phoneOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(phoneOverflow<=1,"Prayer card UI overflows mobile viewport");
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.nightly_examen",{returnContext:null}));
 assert.equal(await page.locator(daily).getAttribute("data-ao-pray-guide-card"),"recollect");
 for(let step=1;step<=4;step++)await tapStep("#aoPray435930.open [data-tp381-examen-step='"+step+"']",step);
 assert.equal(await page.locator(daily).getAttribute("data-ao-pray-guide-card"),"resolve");
 assert.equal(await page.locator(daily+" .aoTP381PrayerCard").count(),1,"Standalone examen must show sourced Act of Contrition");
 // Traditional Prayer citations must never create false, unsafe or
 // unattributed links; pending witnesses show an honest provenance notice.
 const citeAudit=await page.evaluate(()=>[...document.querySelectorAll("#aoPray435930.open .aoTP381Source")].map(node=>({
   links:[...node.querySelectorAll("a[href]")].map(a=>({href:a.href,rel:a.rel})),
   hold:node.querySelectorAll(".aoTP381SourceHold").length,
 })));
 assert.ok(citeAudit.length>=1,"Traditional Prayer card lost its source/provenance drawer");
 for(const entry of citeAudit){
   assert.equal(entry.links.length+entry.hold,1,"Source drawer must show one verified link or one explicit hold");
   for(const link of entry.links){
     assert.match(link.href,/^https:\/\//,"Traditional Prayer source has an invalid URL");
     assert.match(link.rel,/noreferrer/,"Traditional Prayer external source lacks noreferrer");
   }
 }

 const snapshots=[];
 for(const [id,view] of routes){
  const opened=await page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),id);
  assert.equal(opened,true,id+" cannot open");
  await page.waitForFunction(expected=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset?.aoPrayView===expected,view,{timeout:12000});
  const result=await page.evaluate(()=>{
   const shell=document.querySelector("#aoPray435930.open");
   const mount=shell?.querySelector(".aoP435930Mount");
   const bodyText=mount?.innerText?.trim()||"";
   const r=shell?.getBoundingClientRect();
   return {bodyLength:bodyText.length,buttons:mount?.querySelectorAll("button").length||0,
     viewport:innerWidth,shellWidth:r?.width||0,overflow:document.documentElement.scrollWidth-innerWidth,
     ariaHidden:shell?.getAttribute("aria-hidden"),view:mount?.dataset?.aoPrayView};
  });
  assert.ok(result.bodyLength>=30,id+" produced blank or unusably short text: "+JSON.stringify(result));
  assert.ok(result.buttons>=1,id+" lacks navigation/actions");
  assert.ok(result.shellWidth<=result.viewport+1,id+" exceeds phone viewport");
  assert.ok(result.overflow<=1,id+" causes document horizontal overflow: "+result.overflow);
  assert.equal(result.ariaHidden,"false",id+" is inaccessible despite opening");
  snapshots.push({id,view,bodyLength:result.bodyLength});
 }
 // Real mobile disclosure: original historical witnesses must be clickable,
 // not just bibliographic titles or an unrelated Bible-edition source.
 for(const [route,witness] of [
   ["pray.stations","The_Stations_of_the_Cross"],
   ["pray.penitential_psalms","The_Seven_Penitential_Psalms"],
   ["pray.seven_words","The_Devotion_of_the_Seven_Words"],
   ["pray.forty_hours","The_Devotion_of_the_Forty_Hours"]
 ]){
   await page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),route);
   const box="#aoPray435930.open";
   const sources=await page.locator(box+" details.aoP435930Source a.aoP435930SourceLink").evaluateAll(nodes=>nodes.map(node=>({href:node.href,rel:node.rel})));
   assert.ok(sources.some(x=>x.href.includes(witness)),"Missing direct historical witness from "+route+": "+JSON.stringify(sources));
   assert.ok(sources.every(x=>x.href.startsWith("https://")&&x.rel.includes("noreferrer")),"Unsafe historical witness link in "+route);
   const disclosure=page.locator(box+" details.aoP435930Source").last();
   await disclosure.locator("summary").tap();
   assert.equal(await disclosure.getAttribute("open"),"","Historical witness drawer cannot be opened on touch: "+route);
 }

 // Reach the lazy canonical Novena reader through the public module registry.
 // Every one of the sixteen original-source links must be accessible by touch.
 const novenaOpen=await page.evaluate(async()=>await globalThis.AO_MODULES.open("pray.novenas",{returnContext:null}));
 assert.notEqual(novenaOpen?.ok,false,"Canonical lazy Novenas entry did not open: "+JSON.stringify(novenaOpen));
 await page.waitForSelector("#aoPray435930.open [data-n1-select='st_anthony_nine_tuesdays']",{timeout:15000});
 const novenaIds=await page.locator("#aoPray435930.open [data-n1-select]").evaluateAll(nodes=>nodes.map(x=>x.dataset.n1Select));
 assert.equal(novenaIds.length,16,"Novenas home no longer lists all sixteen source-backed targets");
 for(const id of novenaIds){
   await page.locator("#aoPray435930.open [data-n1-select='"+id+"']").tap({timeout:9000});
   const detail=page.locator("#aoPray435930.open");
   const source=detail.locator("details.aoN1SourceDetails");
   assert.equal(await source.count(),1,"Missing original-source disclosure for Novena "+id);
   await source.locator("summary").tap({timeout:9000});
   const primary=source.locator("a.aoN1SourcePrimary");
   assert.equal(await primary.count(),1,"Original witness citation is not clickable for "+id);
   const href=await primary.getAttribute("href");
   assert.match(href,/^https:\/\//,"Non-HTTPS Novena source for "+id);
   assert.equal(await primary.getAttribute("rel"),"noopener noreferrer");
   if(id==="holy_ghost")assert.match(await source.textContent(),/NOVENA FOR PENTECOST/,"Source points to Christmas page without Pentecost section identity");
   if(id==="perpetual_help")assert.match(await source.textContent(),/not proofread/i,"Unproofread source transcription is represented as certified");
   if(["annunciation","seven_sorrows","assumption"].includes(id)){
     const evidence=await source.textContent();
     assert.match(evidence,/MEDITATION and PRACTICE/,"The source drawer does not disclose omitted historical daily meditations: "+id);
     assert.match(evidence,/short.*guide|short editorial/i,"An editorial summary must not masquerade as original 1909 text: "+id);
   }
   if(id==="st_anthony_nine_tuesdays"){
     await detail.locator("[data-n1-mode='simple']").tap();
     await detail.locator("[data-n1-begin]").tap();
     const prayerBody=await detail.innerText();
     assert.match(prayerBody,/Our Father/);
     assert.match(prayerBody,/Hail Mary/);
     assert.match(prayerBody,/Glory Be/);
     assert.match(prayerBody,/Si quæris miracula|If, then, thou seekest miracles/i,"Traditional responsory not reused from Prayer corpus");
     await detail.locator("[data-n1-back]").tap();
   }
   await detail.locator("[data-n1-back]").tap({timeout:9000});
 }
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null}));
 await page.waitForSelector("#aoPray435930 [data-p435930-lib-open]",{timeout:10000});
 const ids=await page.locator("#aoPray435930 [data-p435930-lib-open]").evaluateAll(nodes=>nodes.map(x=>x.dataset.p435930LibOpen));
 assert.equal(ids.length,48,"Prayer Library list lost one or more of its 48 canonical prayers");
 assert.equal(new Set(ids).size,48,"Duplicate library identity");
 for(const id of ids){
   await page.locator("#aoPray435930.open [data-p435930-lib-open='"+id+"']").tap({timeout:9000});
   await page.waitForFunction(()=>{
     const card=document.querySelector("#aoPray435930.open .aoP435930Prayer");
     const text=card?.querySelector(".aoP435930Text,.aoP435930Flip")?.textContent?.trim()||"";
     return text.length>=25;
   },null,{timeout:7000}).catch(async failure=>{
     const diag=await page.evaluate(()=>{
       const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
       return {view:mount?.dataset?.aoPrayView,
         cards:document.querySelectorAll("#aoPray435930.open .aoP435930Prayer").length,
         prayerHTML:document.querySelector("#aoPray435930.open .aoP435930Prayer")?.outerHTML?.slice(0,1900),
         currentTitle:document.querySelector("#aoPray435930.open .aoP435930PrayerHead h3")?.textContent,
         errors:globalThis.AO_PRAY_V435930?.qa?.()};
     });
     throw new Error("Prayer reading did not render for "+id+": "+JSON.stringify(diag)+"; "+String(failure));
   });
   const prayer=await page.evaluate(()=>{
     const root=document.querySelector("#aoPray435930.open"),card=root?.querySelector(".aoP435930Prayer");
     return {text:card?.textContent?.trim()||"",body:card?.querySelector(".aoP435930Text,.aoP435930Flip")?.textContent?.trim()||"",
       source:card?.querySelector(".aoP435930Source")?.textContent?.trim()||""};
   });
   assert.ok(prayer.body.length>=25,"Blank or unrendered canonical prayer: "+id);
   const flip=page.locator("#aoPray435930.open .aoP435930Prayer [data-p435930-flip]");
   if(await flip.count()){
     const faces=await flip.evaluate(x=>({vernHidden:x.querySelector("[data-face-v]")?.hidden,
       latinHidden:x.querySelector("[data-face-la]")?.hidden}));
     assert.deepEqual(faces,{vernHidden:false,latinHidden:true},
       "Library prayer should open in the reader's vernacular; Latin appears on tap: "+id);
     if(id==="foundations_our_father"){
       await flip.tap({timeout:9000});
       assert.equal(await flip.locator("[data-face-la]").evaluate(x=>x.hidden),false,
         "Latin replacement unavailable after tapping the language control");
       assert.equal(await flip.locator("[data-face-v]").evaluate(x=>x.hidden),true);
     }
   }
   assert.ok(prayer.source.length>=5,"Prayer source/witness presentation lost: "+id);
   if(["foundations_our_father","foundations_apostles_creed","foundations_grace_after_meals","marian_hail_holy_queen","marian_memorare","adoration_anima_christi","foundations_eternal_rest"].includes(id)){
     const notice=page.locator("#aoPray435930.open .aoP435930SourceEditionVariant");
     assert.equal(await notice.count(),1,"Material EN/FR historical edition discrepancy not disclosed: "+id);
     assert.ok((await notice.textContent()).trim().length>=50,"Empty edition classification: "+id);
   }
   if(id==="marian_memorare"){
     const witnesses=await page.locator("#aoPray435930.open .aoP435930Source a").evaluateAll(nodes=>nodes.map(x=>x.href));
     assert.ok(witnesses.some(x=>x.includes("fssp.org/fr/consecration")),"FSSP French Memorare witness missing");
   }
   if(id==="foundations_our_father"){
     const witnesses=await page.locator("#aoPray435930.open .aoP435930Source a").evaluateAll(nodes=>nodes.map(x=>x.href));
     assert.ok(witnesses.some(x=>x.includes("wikisource.org/wiki/Page:")),"historical French Our Father witness missing");
   }
   if(id==="foundations_act_of_hope"){
     assert.match(prayer.source,/Dans cette foi/,"published French textual anomaly must be explicitly recorded");
     const links=await page.locator("#aoPray435930.open .aoP435930SourceWitnessNote a").evaluateAll(nodes=>nodes.map(n=>n.href));
     assert.ok(links.some(x=>x.includes("compendium-ccc_fr.html")),"French Compendium witness not linked");
   }
   if(["mass_confiteor","adoration_lord_i_am_not_worthy","litany_loreto_1962","litany_loreto_current","devotion_litany_st_joseph"].includes(id)){
     const sourceLinks=await page.locator("#aoPray435930.open .aoP435930Prayer .aoP435930Source a").evaluateAll(nodes=>nodes.map(n=>n.href));
     assert.ok(sourceLinks.length>=2,"Missing primary/secondary edition references for "+id);
     assert.ok(sourceLinks.every(x=>x.startsWith("https://")),"Non-secure edition link: "+id);
     assert.match(prayer.source,/1962|2020|2021|traditional|traditionnelles|augmentée|expanded/i,
       "Version of prayer not distinguished in source disclosure: "+id);
   }
   await page.locator("#aoPray435930.open [data-p435930-lib-back]").tap({timeout:9000});
 }
 assert.deepEqual(errors.filter(x=>/presentation-runtime|rosary-scripture|TypeError|ReferenceError/i.test(x)),[],
   "PRAY threw runtime errors: "+errors.join(" | "));
 console.log("PASS PRAY full mobile routes "+routes.length+"/16 and Prayer Library 48/48 readable/source-labelled");
 await context.close();
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
