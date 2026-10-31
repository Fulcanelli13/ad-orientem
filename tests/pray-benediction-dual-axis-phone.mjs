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
 const togglePrayerLanguage=async()=>{
  const aa=page.locator("#aoPray435930 .aoP435930Head.aoPrayerBookHead > .aoPrayerBookMenu");
  assert.equal(await aa.count(),1,"Benediction language belongs in the shared Aa menu");
  if(!await aa.evaluate(el=>el.open))await aa.locator(":scope > summary").click();
  assert.ok(await locale.isVisible(),"Language choice must remain accessible inside Aa");
  await locale.click();
 };
 assert.equal(await locale.count(),1,"In-rite language control is missing");
 assert.equal((await locale.innerText()).trim(),"EN");
 const prayerFace=page.locator(rootSel+" .aoP435930Flip").first();
 const faceFont=await prayerFace.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 const cueFont=await page.locator(rootSel+" .aoP435930GuideNow p").first()
  .evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 assert.ok(faceFont>=cueFont+4,"Prayer text must dominate small instructions: "+JSON.stringify({faceFont,cueFont}));
 await togglePrayerLanguage();
 assert.equal((await locale.innerText()).trim(),"FR");
 assert.equal((await snapshot()).index,0,"Changing French altered the public rite stage");
 assert.match(await page.locator(rootSel+" .aoP435930Flip [data-face-v]").first().innerText(),/Victime sainte/);
 await page.screenshot({path:resolve(captures,"benediction-390-exposition-fr.png"),animations:"disabled"});
 await togglePrayerLanguage();
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

 // Opt-in Christ the King celebration: procession before optional Royal Praises,
 // consecration of the human race before Tantum Ergo. Ordinary route above stays seven.
 await page.setViewportSize({width:390,height:844});
 const feastDetails=page.locator(rootSel+" [data-ao-ben-feast-options]");
 assert.equal(await feastDetails.count(),1);
 assert.equal(await page.locator(rootSel+" [data-p435930-ben-feast]").isChecked(),false,
   "Feast material was silently forced into ordinary Benediction");
 await feastDetails.locator("summary").tap();
 await page.locator(rootSel+" [data-p435930-ben-feast]").check();
 assert.equal(await feastDetails.evaluate(el=>el.open),true,"Feast options close during configuration");
 assert.equal((await snapshot()).stops,7,"Selecting the feast must not assume optional local ceremonies");
 for(const key of ["procession","royalPraises","consecration"]){
  await page.locator(rootSel+" [data-p435930-ben-feast-option='"+key+"']").check();
 }
 assert.equal((await snapshot()).stops,10,"Only three explicitly selected local ceremonies must be added");
 const sequence=await page.locator(timeline+" [data-ao-devo-chapter]").evaluateAll(els=>els.map(el=>el.getAttribute("data-ao-devo-chapter")));
 assert.equal(sequence.length,10);
 assert.equal(await page.locator(rootSel+" [data-p435930-ben-feast-option='sacredHeartLitany']").isChecked(),false,
   "Unconfirmed Sacred Heart Litany must be opt-in");
 await page.locator(timeline+" [data-ao-devo-chapter='2']").tap();
 assert.equal((await snapshot()).card,"king-procession");
 await page.locator(timeline+" [data-ao-devo-chapter='3']").tap();
 assert.equal((await snapshot()).card,"king-royal-praises");
 assert.match(await page.locator(rootSel+" .aoP435930FeastPrayer [data-face-la]").innerText(),/Christus vincit/);
 const royalTextEn=await page.locator(rootSel+" .aoP435930FeastPrayer [data-face-v]").innerText();
 assert.match(royalTextEn,/I · For the Church/);
 assert.match(royalTextEn,/II · For the Supreme Pontiff/);
 assert.match(royalTextEn,/III · For the bishops and faithful/);
 assert.match(royalTextEn,/IV · For the people/);
 assert.match(royalTextEn,/May the peace of Christ come/);
 assert.ok(royalTextEn.length>2900,
  "Vatican four-part Laudes has collapsed to an excerpt");
 assert.equal((royalTextEn.match(/℟\./g)||[]).length>=58,true,
  "All saint invocations and closing responses must be present");
 const royalScroll=await page.locator(rootSel+" .aoDevoCardScroll").evaluate(el=>({
  height:el.scrollHeight,viewport:el.clientHeight,overflow:getComputedStyle(el).overflowY
 }));
 assert.ok(royalScroll.height>royalScroll.viewport&&royalScroll.overflow==="auto",
  "Full Laudes must scroll vertically within its existing card");
 await page.screenshot({path:resolve(captures,"benediction-390-christus-vincit-en.png"),animations:"disabled"});
 await togglePrayerLanguage();
 assert.equal((await snapshot()).card,"king-royal-praises",
  "French switch changed the current Laudes stage");
 const royalFrench=await page.locator(rootSel+" .aoP435930FeastPrayer [data-face-v]").innerText();
 assert.match(royalFrench,/I · Pour l'Église/);
 assert.match(royalFrench,/IV · Pour les peuples/);
 assert.match(royalFrench,/Que vienne la paix du Christ/);
 await page.screenshot({path:resolve(captures,"benediction-390-christus-vincit-fr.png"),animations:"disabled"});
 const royalLatin=page.locator(rootSel+" .aoP435930FeastPrayer [data-p435930-flip]");
 await royalLatin.tap();
 assert.equal(await royalLatin.locator("[data-face-la]").evaluate(el=>el.hidden),false);
 const royalLatinText=await royalLatin.locator("[data-face-la]").innerText();
 assert.match(royalLatinText,/I · Pro Ecclesia/);
 assert.match(royalLatinText,/N\. Summo Pontifici/);
 assert.match(royalLatinText,/Pax Christi veniat/);
 await page.screenshot({path:resolve(captures,"benediction-390-christus-vincit-latin.png"),animations:"disabled"});
 await togglePrayerLanguage();
 assert.equal((await snapshot()).card,"king-royal-praises");

 await page.locator(timeline+" [data-ao-devo-chapter='4']").tap();
 assert.equal((await snapshot()).card,"king-consecration");
 assert.match(await page.locator(rootSel+" .aoP435930FeastPrayer [data-face-v]").innerText(),/Most sweet Jesus/);
 await togglePrayerLanguage();
 assert.equal((await snapshot()).card,"king-consecration","Local French toggle lost Feast card");
 assert.match(await page.locator(rootSel+" .aoP435930FeastPrayer [data-face-v]").innerText(),/Très doux Jésus/);
 await page.screenshot({path:resolve(captures,"benediction-390-christ-king-consecration-fr.png"),animations:"disabled"});
 const feastFlip=page.locator(rootSel+" .aoP435930FeastPrayer [data-p435930-flip]");
 await feastFlip.tap();
 assert.equal(await feastFlip.locator("[data-face-la]").evaluate(x=>x.hidden),false,
   "Latin consecration does not replace the French text");
 await page.locator(timeline+" [data-ao-devo-chapter='5']").tap();
 assert.equal((await snapshot()).card,"hymn","Consecration must lead to canonical Tantum Ergo");
 await feastDetails.locator("summary").tap();
 await page.locator(rootSel+" [data-p435930-ben-feast-option='sacredHeartLitany']").check();
 assert.equal((await snapshot()).stops,11,"Explicit litany inclusion must add one optional card");
 assert.equal((await snapshot()).card,"hymn","Changing optional elements may not discard the current canonical stage");
 assert.equal(await feastDetails.evaluate(el=>el.open),true,"Optional cards configuration collapsed");
 await feastDetails.locator("summary").tap();
 await page.locator(timeline+" [data-ao-devo-chapter='4']").tap();
 assert.equal((await snapshot()).card,"king-sacred-heart-litany");
 const litanyVern=page.locator(rootSel+" .aoP435930FeastPrayer [data-face-v]");
 const fullLitany=await litanyVern.innerText();
 assert.equal((fullLitany.match(/Cœur de Jésus,/g)||[]).length,33,
  "The Christ the King litany must display all 33 existing French invocations, not only one response");
 assert.match(fullLitany,/Ainsi soit-il\./,
  "The entire Sacred Heart litany including its concluding collect must be readable");
 const litanyScroll=await page.locator(rootSel+" .aoDevoCardScroll").evaluate(el=>({
  height:el.scrollHeight,viewport:el.clientHeight,overflow:getComputedStyle(el).overflowY
 }));
 assert.ok(litanyScroll.height>litanyScroll.viewport&&litanyScroll.overflow==="auto",
  "The full litany must be scrollable within its card on a 390px phone");
 await page.screenshot({path:resolve(captures,"benediction-390-christ-king-litany-fr.png"),animations:"disabled"});
 const litanyLatin=page.locator(rootSel+" .aoP435930FeastPrayer [data-p435930-flip]");
 await litanyLatin.tap();
 assert.equal(await litanyLatin.locator("[data-face-la]").evaluate(el=>el.hidden),false);
 assert.equal(((await litanyLatin.locator("[data-face-la]").innerText()).match(/Cor Iesu,/g)||[]).length,33,
  "Latin face must contain every invocation, not a fragment");
 await page.screenshot({path:resolve(captures,"benediction-390-christ-king-litany-latin.png"),animations:"disabled"});
 await page.locator(timeline+" [data-ao-devo-chapter='6']").tap();
 assert.equal((await snapshot()).card,"hymn","The complete optional litany must precede Consecration and Tantum Ergo");
 await feastDetails.locator("summary").tap();
 await page.locator(rootSel+" [data-p435930-ben-feast-option='sacredHeartLitany']").uncheck();
 assert.equal((await snapshot()).stops,10);
 await page.locator(timeline+" [data-ao-devo-chapter='9']").tap();
 assert.equal((await snapshot()).card,"reposition");
 assert.equal(await page.locator(rootSel).getAttribute("data-ao-benediction-final"),"true");
 assert.ok(await page.locator(rootSel+" .aoP435930GuideNav").evaluate(x=>getComputedStyle(x).display)!=="none",
   "The optional celebration must not hide the final Reposition exit");
 await feastDetails.locator("summary").tap();
 await page.locator(rootSel+" [data-p435930-ben-feast]").uncheck();
 assert.equal((await snapshot()).stops,7,"Ordinary Benediction was not restored on disabling feast");
 await page.locator(timeline+" [data-ao-devo-chapter='2']").tap();
 assert.equal((await snapshot()).card,"hymn");
 await page.setViewportSize({width:320,height:720});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,
  "Optional Christ King celebration introduced phone overflow");

 // Entering Adoration must offer an actual doorway to public Benediction,
 // including its opt-in Christ the King sequence, without a second ritual owner.
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null}));
 const adorationChooser="#aoPray435930.open .aoAdorationChooser";
 assert.equal(await page.locator(adorationChooser+" [data-p435930-go-ben]").count(),1,
  "The public Benediction route is undiscoverable from the Adoration chooser");
 await page.locator(adorationChooser+" [data-p435930-go-ben]").click();
 assert.equal((await snapshot()).card,"exposition",
  "Adoration handoff must preserve the original public-rite entry");
 assert.equal(await page.locator(rootSel+" [data-ao-ben-feast-options]").count(),1,
  "The linked Benediction must expose optional Christ the King additions");
 await page.locator("#aoPray435930.open .aoP435930Back").click();
 assert.equal(await page.locator(adorationChooser).count(),1,
  "Back from public Benediction must restore the Adoration chooser");
 assert.deepEqual(errors,[],"Browser exceptions: "+errors.join(" | "));
 console.log("PASS canonical seven-stage Benediction: timeline, vertical focus, horizontal swipe, conditional Praises and manual ritual pace");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
