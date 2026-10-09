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
