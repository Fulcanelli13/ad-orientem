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
 assert.equal(state.nav,null,"Routine Benediction navigation must not render beside the source-owned timeline");
 const cardText=await page.locator(rootSel+" .aoDevoCardScroll").innerText();
 assert.match(cardText,/Exposition|O Salutaris/i,"Source-owned exposition prayer is missing");
 const guide=page.locator(rootSel+" [data-ao-benediction-guide]");
 assert.equal(await guide.evaluate(el=>el.open),false,"Historical guidance must be optional and below the prayer");
 await page.screenshot({path:resolve(captures,"benediction-390-exposition.png"),animations:"disabled"});
 // Actual phone locale and visual-salience acceptance, not only static selectors.
 const locale=page.locator("#aoPray435930 .aoP435930SessionLanguage");
 assert.equal(await locale.count(),1,"In-rite language control is missing");
 assert.equal((await locale.innerText()).trim(),"EN");
 const prayerFace=page.locator(rootSel+" .aoP435930Flip").first();
 const faceFont=await prayerFace.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 const cueFont=await page.locator(rootSel+" .aoP435930GuideNow p").first()
  .evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 assert.ok(faceFont>=cueFont+4,"Prayer text must dominate small instructions: "+JSON.stringify({faceFont,cueFont}));
 await locale.click();
 assert.equal((await locale.innerText()).trim(),"FR");
 assert.equal((await snapshot()).index,0,"Changing French altered the public rite stage");
 assert.match(await page.locator(rootSel+" .aoP435930Flip [data-face-v]").first().innerText(),/Victime sainte/);
 await page.screenshot({path:resolve(captures,"benediction-390-exposition-fr.png"),animations:"disabled"});
 await locale.click();
 assert.equal((await locale.innerText()).trim(),"EN");
 const latinFlip=page.locator(rootSel+" .aoP435930Flip").first();
 await latinFlip.evaluate(el=>el.click());
 assert.equal(await latinFlip.locator("[data-face-la]").evaluate(el=>el.hidden),false,
  "Tap on prayer must reveal original Latin");
 await latinFlip.evaluate(el=>el.click());
 assert.equal(await latinFlip.locator("[data-face-v]").evaluate(el=>el.hidden),false);
 // A horizontal swipe beginning on the same prayer-face button MUST navigate.
 await latinFlip.evaluate(el=>{
  const t=(x,y)=>new Touch({identifier:18,target:el,clientX:x,clientY:y});
  el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(215,335)],changedTouches:[t(215,335)]}));
  el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(60,338)]}));
 });
 assert.equal((await snapshot()).card,"adoration","Swiping the prayer text did not advance a card");
 await page.locator(timeline+" [data-ao-devo-chapter='0']").evaluate(el=>el.click());
 assert.equal((await snapshot()).card,"exposition");
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
 const blessing=page.locator("body > .aoDevotionalActionCinematic");
 await blessing.waitFor({state:"visible",timeout:4500});
 const presentation=await blessing.evaluate(el=>({
  id:el.dataset.aoActionScene,kind:el.dataset.aoActionKind,
  icon:el.querySelector(".aoDevotionalActionIcon")?.hidden===false,
  width:el.getBoundingClientRect().width,screen:window.innerWidth,
  overlayOpacity:getComputedStyle(el).opacity,overlayAnimation:getComputedStyle(el).animationName,
  innerAnimation:getComputedStyle(el.querySelector(".aoDevotionalActionInner")).animationName,
  message:el.querySelector(".aoDevotionalActionTitle")?.textContent,
 }));
 assert.equal(presentation.id,"BENEDICTION.BLESSING");
 assert.equal(presentation.kind,"SOLEMN_ACTION");
 assert.equal(presentation.icon,true,"Blessing cinematic lost its approved icon");
 assert.equal(presentation.overlayOpacity,"1","An entering cinematic lets the old reader bleed through");
 assert.equal(presentation.overlayAnimation,"none","Fade only the contents, never the full-screen background");
 assert.notEqual(presentation.innerAnimation,"none","The sacred action should still have a restrained content entrance");
 assert.ok(presentation.width>=presentation.screen-60,"Benediction cinematic is a tiny badge, not a prominent action");
 assert.match(presentation.message,/blessing|Bénédiction/i);
 const auditory=await blessing.evaluate(el=>{
  const n=el.querySelector(".aoDevotionalActionBellCue");
  const icon=n?.querySelector(".aoDevotionalActionBellIcon");
  return {status:n?.dataset.aoBellStatus,rite:n?.dataset.aoBellRite,
    text:n?.innerText??"",iconVisible:Boolean(icon&&!icon.hidden),
    assetMask:icon?.style.maskImage??""};
 });
 assert.equal(auditory.status,"EXPECTED_NOT_OBSERVED",
   "Navigating to blessing is not an observation of a ringing bell");
 assert.equal(auditory.rite,"BENEDICTION");
 assert.match(auditory.text,/bell|Clochette/i);
 assert.equal(auditory.iconVisible,true,"Approved Mass bell SVG not reused in Benediction");
 assert.match(auditory.assetMask,/bells\.svg/,
   "Benediction uses an unapproved substitute icon");
 // The global ribbon and independent semantic rails must be covered by the
 // modal at the top and bottom of the actual viewport, not merely the sheet.
 const modal=await blessing.evaluate(el=>{
  const r=el.getBoundingClientRect();
  const covers=(x,y)=>{const h=document.elementFromPoint(x,y);return h===el||el.contains(h)};
  return {parent:el.parentElement===document.body,role:el.getAttribute("role"),
   ariaModal:el.getAttribute("aria-modal"),position:getComputedStyle(el).position,
   top:r.top,bottom:r.bottom,height:innerHeight,
   coversTop:covers(innerWidth/2,5),coversBottom:covers(innerWidth/2,innerHeight-5)};
 });
 assert.equal(modal.parent,true,"Cinematic remains imprisoned in the Prayer sheet");
 assert.deepEqual([modal.role,modal.ariaModal,modal.position],["dialog","true","fixed"],
  "Cinematic must be an accessible viewport-fixed dialog");
 assert.ok(modal.top<=1&&modal.bottom>=modal.height-1,
  "Cinematic does not cover the complete physical viewport");
 assert.ok(modal.coversTop&&modal.coversBottom,
  "Global ribbon or semantic rails can still appear above the cinematic");
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
 assert.ok(state.nav&&state.nav!=="none","Finish action is missing after Reposition");
 assert.equal(await page.locator(rootSel+" [data-p435930-ben-finish]").count(),1,"Reposition has one explicit finish action");
 assert.equal(await page.locator(rootSel+" [data-p435930-ben-prev],[data-p435930-ben-next]").count(),0,
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

 // Feast-day supplements are opt-in. The ordinary 7-stage rite above remains
 // unchanged for every other day and every other Institute/apostolate.
 await page.setViewportSize({width:390,height:844});
 const special=page.locator(rootSel+" [data-ao-ben-special-options]");
 assert.equal(await special.count(),1,"Optional Christ the King settings are missing");
 assert.equal(await special.evaluate(x=>x.open),false);
 assert.equal(await page.locator(rootSel+" [data-p435930-ben-special='enabled']").isChecked(),false);
 await special.locator(":scope > summary").click();
 await page.locator(rootSel+" [data-p435930-ben-special='enabled']").check();
 assert.equal(await special.evaluate(x=>x.open),false,"Choosing the solemn sequence should restore the prayer-first reading area");
 state=await snapshot();
 assert.equal(state.stops,10,"Default Christ the King programme should add the three attested stations");
 assert.equal(state.card,"reposition","Enabling special feast must preserve the active public rite station");
 assert.equal(state.index,9);
 assert.deepEqual(await page.locator(timeline+" .aoDevoStop").evaluateAll(
  es=>es.map(x=>x.getAttribute("data-ao-devo-chapter"))),
  ["0","1","2","3","4","5","6","7","8","9"]);
 assert.equal(await page.locator(rootSel+" [data-p435930-ben-special='litany']").count(),0,
  "An unsupported full Sacred Heart litany must not be advertised as loaded");
 await page.locator(timeline+" [data-ao-devo-chapter='2']").tap();
 assert.equal((await snapshot()).card,"procession");
 await page.locator(timeline+" [data-ao-devo-chapter='3']").tap();
 assert.equal((await snapshot()).card,"royal");
 assert.match(await page.locator(rootSel+" [data-ao-christ-king-acclamations]").innerText(),/Christus vincit!/);
 await page.locator(timeline+" [data-ao-devo-chapter='4']").tap();
 assert.equal((await snapshot()).card,"consecration");
 assert.match(await page.locator(rootSel+" .aoP435930Flip [data-face-v]").first().innerText(),/Most sweet Jesus/);
 await locale.click();
 assert.equal((await snapshot()).card,"consecration");
 assert.match(await page.locator(rootSel+" .aoP435930Flip [data-face-v]").first().innerText(),/Très doux Jésus/);
 const humanRaceLatin=page.locator(rootSel+" .aoP435930Flip").first();
 await humanRaceLatin.click();
 assert.match(await humanRaceLatin.locator("[data-face-la]").innerText(),/Iesu dulcissime, Redemptor humani generis/);
 assert.equal(await humanRaceLatin.locator("[data-face-la]").evaluate(x=>x.hidden),false);
 await page.screenshot({path:resolve(captures,"benediction-christ-king-consecration-fr-390.png"),animations:"disabled"});
 await locale.click();
 await page.locator(timeline+" [data-ao-devo-chapter='5']").tap();
 assert.equal((await snapshot()).card,"hymn","Tantum ergo must immediately follow the last selected feast prayer");
 // Disable only Royal Praises; other parts and the currently active hymn survive.
 await special.locator(":scope > summary").click();
 await page.locator(rootSel+" [data-p435930-ben-special='royal']").uncheck();
 assert.equal((await snapshot()).stops,9);
 assert.equal((await snapshot()).card,"hymn");
 await page.locator(rootSel+" [data-p435930-ben-special='enabled']").uncheck();
 assert.equal((await snapshot()).stops,7);
 assert.equal((await snapshot()).card,"hymn");
 assert.equal(await page.locator(rootSel+" [data-ao-christ-king-acclamations]").count(),0);
 // A fresh launch is ordinary, not an automatic feast or an inherited local rubric.
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.benediction",{returnContext:null}));
 assert.equal((await snapshot()).stops,7);
 assert.equal(await page.locator(rootSel+" [data-p435930-ben-special='enabled']").isChecked(),false);

 assert.deepEqual(errors,[],"Browser exceptions: "+errors.join(" | "));
 console.log("PASS canonical seven-stage Benediction: timeline, vertical focus, horizontal swipe, conditional Praises and manual ritual pace");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
