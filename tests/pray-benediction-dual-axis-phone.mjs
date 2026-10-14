import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-benediction-dual-axis");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const filename=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const full=resolve(root,"."+filename);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4291,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:4291/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.benediction",{returnContext:null})),true);
 const rootSel="#aoPray435930.open .aoP435930BenedictionReader";
 const timeline=rootSel+" .aoDevoSequenceTimeline";
 await page.waitForSelector(timeline,{timeout:12000});
 const snapshot=()=>page.evaluate(()=>{
  const reader=document.querySelector("#aoPray435930.open .aoP435930BenedictionReader");
  const card=reader?.querySelector(".aoDevoCard"),scroll=card?.querySelector(".aoDevoCardScroll");
  return {step:Number(reader?.dataset.aoBenedictionStep),card:card?.dataset.aoDevoCard,
   index:Number(card?.dataset.aoDevoIndex),stops:reader?.querySelectorAll(".aoDevoStop").length,
   current:reader?.querySelectorAll(".aoDevoStop[aria-current='step']").length,
   active:scroll?.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']").length,
   overflow:scroll?getComputedStyle(scroll).overflowY:null,
   nav:reader?.querySelector(".aoP435930GuideNav")?getComputedStyle(reader.querySelector(".aoP435930GuideNav")).display:null};
 });
 let state=await snapshot();
 assert.deepEqual({step:state.step,card:state.card,index:state.index,stops:state.stops,current:state.current,overflow:state.overflow},
 {step:0,card:"exposition",index:0,stops:7,current:1,overflow:"auto"});
 assert.equal(state.nav,"none","Competing legacy Next navigation is still displayed");
 const cardText=await page.locator(rootSel+" .aoDevoCardScroll").innerText();
 assert.match(cardText,/Exposition|O Salutaris/i,"Source-owned exposition prayer is missing");
 const guide=page.locator(rootSel+" [data-ao-benediction-guide]");
 assert.equal(await guide.evaluate(el=>el.open),false,"Historical guidance must be optional and below the prayer");
 await page.screenshot({path:resolve(captures,"benediction-390-exposition.png"),animations:"disabled"});
 const swipe=async(dx,dy)=>page.locator(rootSel+" .aoDevoCardScroll").evaluate((el,{dx,dy})=>{
  const t=(x,y)=>new Touch({identifier:14,target:el,clientX:x,clientY:y});
  el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(230,340)],changedTouches:[t(230,340)]}));
  el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(230+dx,340+dy)]}));
 },{dx,dy});
 await swipe(8,-144);
 assert.equal((await snapshot()).index,0,"Vertical prayer scrolling incorrectly changed ritual stage");
 await swipe(-154,5);
 assert.equal((await snapshot()).card,"adoration","Horizontal swipe must change exactly one stage");
 assert.equal((await snapshot()).current,1);
 await page.waitForTimeout(900);
 assert.equal((await snapshot()).index,1,"Rite advanced automatically instead of waiting for user");
 // The existing response is retained, never replaced by a generated substitute.
 await page.locator(timeline+" [data-ao-devo-chapter='3']").tap();
 state=await snapshot();
 assert.equal(state.card,"prayer");
 assert.match(await page.locator(rootSel+" .aoDevoCardScroll").innerText(),/Panem de caelo|Versicle|collect/i);
 await page.locator(timeline+" [data-ao-devo-chapter='4']").tap();
 assert.equal((await snapshot()).card,"blessing");
 assert.match(await page.locator(rootSel+" .aoDevoCardScroll").innerText(),/Stop interacting|Receive the Eucharistic blessing/i);
 const blessing=page.locator("#aoPray435930 .aoDevotionalActionCinematic");
 await blessing.waitFor({state:"visible",timeout:4500});
 const presentation=await blessing.evaluate(el=>({
  id:el.dataset.aoActionScene,kind:el.dataset.aoActionKind,
  icon:el.querySelector(".aoDevotionalActionIcon")?.hidden===false,
  width:el.getBoundingClientRect().width,screen:window.innerWidth,
  message:el.querySelector(".aoDevotionalActionTitle")?.textContent,
 }));
 assert.equal(presentation.id,"BENEDICTION.BLESSING");
 assert.equal(presentation.kind,"SOLEMN_ACTION");
 assert.equal(presentation.icon,true,"Blessing cinematic lost its approved icon");
 assert.ok(presentation.width>=presentation.screen-60,"Benediction cinematic is a tiny badge, not a prominent action");
 assert.match(presentation.message,/blessing|Bénédiction/i);
 await page.screenshot({path:resolve(captures,"benediction-390-full-cinematic.png"),animations:"disabled"});
 await blessing.locator(".aoDevotionalActionContinue").click();
 assert.equal(await blessing.count(),0,"Benediction cinematic did not yield to the unchanged prayer reader");
 await page.locator(timeline+" [data-ao-devo-chapter='5']").tap();
 assert.equal((await snapshot()).card,"praises");
 const praiseControl=page.locator(rootSel+" [data-p435930-ben-praises]");
 assert.equal(await praiseControl.count(),1,"Conditional Divine Praises selector missing");
 const before=await page.locator(rootSel+" .aoDevoCardScroll").innerText();
 await praiseControl.check();
 assert.equal((await snapshot()).index,5,"Enabling Divine Praises changed the ceremony card");
 const after=await page.locator(rootSel+" .aoDevoCardScroll").innerText();
 assert.ok(after.length>before.length,"Canonical Divine Praises prayer did not appear on explicit selection");
 await page.locator(timeline+" [data-ao-devo-chapter='6']").tap();
 state=await snapshot();assert.equal(state.card,"reposition");
 assert.notEqual(state.nav,"none","Finish action is missing after Reposition");
 assert.equal(await page.locator(rootSel+" [data-p435930-ben-prev]").isVisible(),false,
  "Duplicated legacy Previous reappeared alongside canonical timeline");
 await page.setViewportSize({width:320,height:720});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,
  "Narrow phone has horizontal document overflow");
 assert.equal((await snapshot()).overflow,"auto");
 const safeLine=await page.locator(rootSel+" .aoDevoCardScroll .aoP435930GuideNow p").evaluate(el=>({
  right:el.getBoundingClientRect().right,viewport:innerWidth
 }));
 assert.ok(safeLine.right<=safeLine.viewport-46,
  "Ritual gesture icon overlaps the 320px prayer text: "+JSON.stringify(safeLine));
 await page.screenshot({path:resolve(captures,"benediction-320-reposition.png"),animations:"disabled"});
 assert.deepEqual(errors,[],"Browser exceptions: "+errors.join(" | "));
 console.log("PASS canonical seven-stage Benediction: timeline, vertical focus, horizontal swipe, conditional Praises and manual ritual pace");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
