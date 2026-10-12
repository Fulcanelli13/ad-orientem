import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-traditional-daily");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4286,"127.0.0.1",yes)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:"fr-FR",serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4286/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"));
 await page.waitForSelector("#ao-settings-modular-root [data-settings-route='/settings/language-reading']",{timeout:20000});
 await page.locator('[data-settings-route="/settings/language-reading"]').click();
 await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
 await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:10000});
 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 const open=async id=>{
  const result=await page.evaluate(route=>globalThis.AO_MODULES.open(route),id);
  assert.equal(result?.ok,true,"Module did not open: "+id+" "+JSON.stringify(result));
  await page.waitForSelector("#aoPray435930 .aoDevoSequenceTimeline",{timeout:12000});
 };
 const snapshot=async()=>page.evaluate(()=>{
  const m=document.querySelector("#aoPray435930 .aoP435930Mount");
  const card=m?.querySelector(".aoDevoCard");
  const local=card?.querySelector(".aoDevoCardScroll");
  const timeline=m?.querySelector(".aoDevoSequenceTimeline");
  return {route:m?.dataset.aoTraditionalPrayRoute,kind:m?.dataset.aoTraditionalDualAxis,
   index:Number(card?.dataset.aoDevoIndex),id:card?.dataset.aoDevoCard,
   stops:timeline?.querySelectorAll(".aoDevoStop").length||0,
   active:timeline?.querySelectorAll('[aria-current="step"]').length||0,
   paragraphCount:local?.querySelectorAll(".aoDevoParagraph").length||0,
   overflow:local?getComputedStyle(local).overflowY:null,
   legacyNavVisible:Boolean(m?.querySelector(".aoTP381GuideNav")&&getComputedStyle(m.querySelector(".aoTP381GuideNav")).display!=="none")
  };
 });
 const swipe=async(dx,dy)=>page.locator("#aoPray435930 .aoDevoCardScroll").evaluate((node,{dx,dy})=>{
  const t=(x,y)=>new Touch({identifier:17,target:node,clientX:x,clientY:y});
  node.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(230,390)],changedTouches:[t(230,390)]}));
  node.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(230+dx,390+dy)]}));
 },{dx,dy});
 await open("pray.morning_evening");
 await page.screenshot({path:resolve(captures,"morning-390-fr.png"),animations:"disabled"});
 const first=await snapshot();
 assert.equal(first.route,"pray.morning_evening");
 assert.equal(await page.locator("#aoPray435930 [data-ao-daily-options]").evaluate(x=>x.open),false,
   "Reading options should not crowd the opening prayer");
 const opening=await page.evaluate(()=>{
   const card=document.querySelector("#aoPray435930 .aoDevoCard");
   const options=document.querySelector("#aoPray435930 [data-ao-daily-options]");
   const glossary=document.querySelector("#aoPray435930 [data-tp381-glossary]");
   return {cardTop:card?.getBoundingClientRect().top,optionsAfter:!!(card.compareDocumentPosition(options)&Node.DOCUMENT_POSITION_FOLLOWING),
     glossaryAfter:!!(card.compareDocumentPosition(glossary)&Node.DOCUMENT_POSITION_FOLLOWING)};
 });
 assert.ok(opening.cardTop<390&&opening.optionsAfter&&opening.glossaryAfter,
   "Prayer must precede secondary descriptions and controls: "+JSON.stringify(opening));
 assert.match(await page.locator("#aoPray435930 .aoTP381DaypartStrip").innerText(),/Matin\s+Soir/);
 assert.equal(first.kind,"daily");
 assert.ok(first.stops>=4,"No titled daily prayer card timeline");
 assert.equal(first.index,0);assert.equal(first.active,1);assert.equal(first.overflow,"auto");
 assert.ok(first.paragraphCount>0,"Canonical daily prayer has no paragraph focus targets");
 assert.equal(first.legacyNavVisible,false,"Redundant legacy navigation remains");
 await swipe(5,-135);
 assert.equal((await snapshot()).index,0,"Vertical prayer scroll changed card");
 await swipe(-170,5);
 assert.equal((await snapshot()).index,1,"Horizontal swipe did not move exactly one daily prayer card");
 await page.locator("#aoPray435930 .aoDevoStop").nth(2).evaluate(b=>b.click());
 assert.equal((await snapshot()).index,2,"Daily prayer timeline failed to navigate");
 // Switching dayparts preserves the source sequence and resets the card cursor.
 await page.locator("#aoPray435930 [data-tp381-daypart='evening']").evaluate(b=>b.click());
 await page.screenshot({path:resolve(captures,"evening-390-fr.png"),animations:"disabled"});
 const evening=await snapshot();
 assert.equal(evening.index,0);assert.equal(evening.kind,"daily");
 await open("pray.nightly_examen");
 await page.screenshot({path:resolve(captures,"examen-390-fr.png"),animations:"disabled"});
 const exam=await snapshot();
 assert.equal(exam.route,"pray.nightly_examen");
 assert.equal(await page.locator("#aoPray435930 [data-ao-examen-options]").evaluate(x=>x.open),false,
   "Nightly examen context must not overshadow prayer text");
 assert.equal(exam.kind,"examen");assert.ok(exam.stops>=4);assert.equal(exam.active,1);
 await swipe(-175,5);
 assert.equal((await snapshot()).index,1,"Nightly Examen did not move one card");
 await swipe(5,-125);
 assert.equal((await snapshot()).index,1,"Nightly Examen vertical gesture leaked into horizontal navigation");
 await page.setViewportSize({width:320,height:720});
 assert.equal((await snapshot()).overflow,"auto","Narrow phone cannot scroll within the prayer card");
 await page.screenshot({path:resolve(captures,"examen-320-fr.png"),animations:"disabled"});
 assert.deepEqual(errors,[],"Browser errors "+JSON.stringify(errors));
 console.log("PASS French 390/320px Morning Evening and Examen share named-card timeline, local focus and swipe contract");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done))}
