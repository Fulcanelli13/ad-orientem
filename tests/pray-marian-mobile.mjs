import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-marian-mobile");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const filename=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+filename);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message??err))}
});
await new Promise((resolve,fail)=>{server.once("error",fail);server.listen(4196,"127.0.0.1",resolve)});
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"fr-FR"});
 const page=await context.newPage();
 // Historical mystery buttons now live under one explicit disclosure.
 // Tests must exercise the same accessible user path instead of clicking
 // hidden DOM buttons or assuming the old crowded opening.
 const expandMysteryChoices=async()=>{
  const disclosure=page.locator("#aoPrayerBookRoot.open .aoRosaryOtherMysteries");
  if(await disclosure.count())await disclosure.evaluate(node=>{
   if(!node.open)node.querySelector("summary")?.click();
  });
 };
 const pageErrors=[];page.on("pageerror",e=>pageErrors.push(String(e?.message??e)));
 await page.goto("http://127.0.0.1:4196/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(async()=>globalThis.AO_PRAY_APP_V1.open()),true,"Lazy Prayer owner did not load");
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
 // Native Divine Mercy: actual Prayer reader, not merely a model contract.
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null})),true);
 await page.waitForSelector("#aoPray435930.open .aoMercyReader",{timeout:9000});
 await page.screenshot({path:resolve(captures,"01-divine-mercy-390.png"),fullPage:false,animations:"disabled"});
 // A single chapter displays many canonical bead prayers; vertical movement
 // retains the chapter, horizontal movement advances exactly one named card.
 await page.waitForSelector("#aoPray435930 .aoMercyReader [data-ao-mercy-bead-navigation]",{timeout:9000});
 assert.equal(await page.locator("#aoPray435930 .aoMercyReader .aoDevoSequenceTimeline").evaluate(el=>getComputedStyle(el).display),"none","Retired numbered chapter strip must not be visible");
 assert.equal(await page.locator("#aoPray435930 .aoMercyReader .aoDevoStop").count(),7);
 assert.equal(await page.locator("#aoPray435930 .aoMercyReader .aoMercyLine").count(),4);
 assert.equal(await page.locator("#aoPray435930 .aoMercyReader .aoDevoParagraph[data-ao-devo-active='true']").count(),1);
 await page.emulateMedia({reducedMotion:"reduce"});
 const gesture=async(dx,dy)=>{
  await page.locator("#aoPray435930 .aoDevoCardScroll").evaluate((node,{dx,dy})=>{
   const t=(x,y)=>new Touch({identifier:9,target:node,clientX:x,clientY:y});
   node.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(240,350)],changedTouches:[t(240,350)]}));
   node.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(240+dx,350+dy)]}));
  },{dx,dy});
 };
 await gesture(6,-145);
 assert.equal(await page.locator("#aoPray435930 .aoMercyReader .aoDevoCard").getAttribute("data-ao-devo-card"),"opening");
 await gesture(-170,5);
 await page.waitForSelector("#aoPray435930 .aoMercyReader .aoDevoCard[data-ao-devo-card='decade-1']");
 assert.equal(await page.locator("#aoPray435930 .aoMercyReader .aoMercyLine").count(),11);
 await gesture(170,5);
 await page.waitForSelector("#aoPray435930 .aoMercyReader .aoDevoCard[data-ao-devo-card='opening']");
 await page.emulateMedia({reducedMotion:"no-preference"});

 assert.equal(await page.locator("#aoPray435930 .aoMercyControls,[data-p435930-mercy-prev],[data-p435930-mercy-next]").count(),0);
 const mercyProgress=page.locator("#aoPray435930 [data-ao-mercy-bead-navigation] > .aoDevoProgress");
 assert.equal(await mercyProgress.getAttribute("aria-valuemax"),"62");
 assert.equal(await mercyProgress.getAttribute("aria-valuenow"),"1");
 assert.match(await page.locator("#aoPray435930 .aoMercyPrayer").innerText(),/Au nom du Père|In the name of the Father/);
 assert.equal(await page.locator("#aoPray435930 [data-ao-mercy-bead-navigation]").getAttribute("data-mercy-phase"),"opening");
 assert.match(await page.locator("#aoPray435930 .aoMercyBeadPosition").innerText(),/Sign of (?:the )?Cross|Signe de croix/i);
 assert.equal(await page.locator("#aoPray435930 .aoMercyKicker").count(),0,"No redundant numbered chapter kicker");
 assert.match(await page.locator("#aoPray435930 [data-ao-mercy-step='1']").innerText(),/Our Father|Notre Père/,
  "The next opening prayer must be reachable by vertical reading");
 const mercyOptions=page.locator("#aoPray435930.open [data-ao-mercy-options]");
 assert.equal(await mercyOptions.count(),1,"Canonical Divine Mercy options disclosure missing");
 assert.equal(await mercyOptions.evaluate(x=>x.open),false,"Optional settings should start collapsed");
 assert.ok(await mercyOptions.locator(":scope > summary").evaluate(x=>x.getBoundingClientRect().height)>=44);
 await mercyOptions.locator(":scope > summary").click();
 assert.equal(await mercyOptions.evaluate(x=>x.open),true,"Mercy options did not respond to touch");
 await page.locator("#aoPray435930 [data-p435930-mercy-closing]").evaluate(x=>x.click());
 assert.equal(await mercyProgress.getAttribute("aria-valuemax"),"63",
  "Optional conclusion adds one published prayer without inventing beads");
 assert.equal(await page.locator("#aoPray435930 .aoMercyOptions button").count(),2);
 assert.equal(await mercyOptions.evaluate(x=>x.open),true,"Optional controls collapsed after repaint");
 assert.equal(await mercyOptions.locator("[data-p435930-mercy-closing]").getAttribute("aria-pressed"),"true");
 await mercyOptions.locator(":scope > summary").click();
 assert.equal(await mercyOptions.evaluate(x=>x.open),false);
 assert.ok((await page.locator("#aoPray435930 .aoMercyPrayer").innerText()).trim().length>15,
   "Canonical Mercy prayer disappeared behind optional settings");
 await mercyOptions.locator(":scope > summary").click();
 await page.locator("#aoPray435930 [data-p435930-mercy-guide]").evaluate(x=>x.click());
 assert.equal(await page.locator("#aoPray435930 .aoMercyHelp").count(),0);
 assert.ok(["https://www.vaticannews.va/fr/priere/chapelet-de-la-divine-misericorde.html",
  "https://www.vaticannews.va/en/prayers/divine-mercy-chaplet.html"].includes(
  await page.locator("#aoPray435930 .aoMercySource a").getAttribute("href")));
  // The same title/paragraph navigation contract now applies to Stations.
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations",{returnContext:null})),true);
 await page.waitForSelector("#aoPray435930 .aoP435930Stations .aoDevoCardScroll",{timeout:9000});
 await page.waitForSelector("#aoPray435930 .aoP435930StationRail.aoDevoSequenceTimeline",{timeout:9000});
 assert.equal(await page.locator("#aoPray435930 .aoP435930StationRail .aoDevoStop").count(),14);
 assert.equal(await page.locator("#aoPray435930 .aoP435930StationRail [aria-current='step']").count(),1);
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard").getAttribute("data-ao-devo-card"),"station-1");

 const stationsLocale=page.locator("#aoPray435930 .aoP435930SessionLanguage");
 assert.equal(await stationsLocale.count(),1,"Stations must share in-session EN/FR control");
 const englishStation=await page.locator("#aoPray435930 .aoDevoCardTitle").innerText();
 const englishMeditation=await page.locator("#aoPray435930 .aoP435930StationConsider p").innerText();
 await stationsLocale.click();
 assert.equal((await stationsLocale.innerText()).trim(),"FR");
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard").getAttribute("data-ao-devo-card"),"station-1");
 assert.notEqual(await page.locator("#aoPray435930 .aoDevoCardTitle").innerText(),englishStation,
  "French language switch did not select the canonical French Station title");
 assert.notEqual(await page.locator("#aoPray435930 .aoP435930StationConsider p").innerText(),englishMeditation,
  "French language switch did not render the existing French meditation");
 const stationPrayerSize=await page.locator("#aoPray435930 .aoP435930StationPrayer .aoP435930Flip")
  .first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 const stationInstructionSize=await page.locator("#aoPray435930 .aoP435930GuideNow p")
  .first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 assert.ok(stationPrayerSize>stationInstructionSize+3,
  "Stations prayer must visually dominate instructions");
 assert.equal(await page.locator("#aoPray435930 .aoP435930Stations .aoDevoCardHead")
  .evaluate(x=>getComputedStyle(x).display),"none",
  "The station is already named in the chapter rail; do not duplicate its title");
 const responseOpacity=await page.locator("#aoPray435930 .aoP435930Stations .aoP435930VRLine")
  .evaluateAll(es=>es.map(x=>Number(getComputedStyle(x).opacity)));
 assert.ok(responseOpacity.length>=2&&responseOpacity.every(x=>x>=.94),
  "Both parts of the Stations versicle/response must be legible: "+JSON.stringify(responseOpacity));

 await page.screenshot({path:resolve(captures,"02-stations-fr-language-390.png"),fullPage:false,animations:"disabled"});
 await stationsLocale.click();
 assert.equal((await stationsLocale.innerText()).trim(),"EN");

 await page.screenshot({path:resolve(captures,"02-stations-dual-axis-390.png"),fullPage:false,animations:"disabled"});
 await page.emulateMedia({reducedMotion:"reduce"});
 await gesture(7,-155);
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard").getAttribute("data-ao-devo-card"),"station-1");
 await gesture(-170,4);
 const stationTouchState=await page.evaluate(()=>({
  card:document.querySelector("#aoPray435930 .aoDevoCard")?.dataset.aoDevoCard,
  title:document.querySelector("#aoPray435930 .aoDevoCardTitle")?.textContent,
  currentStop:document.querySelector("#aoPray435930 .aoP435930StationRail [aria-current='step']")?.getAttribute("data-p435930-station-step"),
  mounted:document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset.aoPrayView,
  errors:globalThis.__AO_DEVOTIONAL_NAV_ERROR||null
 }));
 console.log("STATIONS_SWIPE_DIAGNOSTIC "+JSON.stringify(stationTouchState)+" page-errors="+JSON.stringify(pageErrors.slice(-5)));
 await page.waitForSelector("#aoPray435930 .aoDevoCard[data-ao-devo-card='station-2']",{timeout:4000});
 assert.equal(await page.locator("#aoPray435930 .aoP435930StationRail [aria-current='step']").count(),1);
 await page.locator("#aoPray435930 [data-p435930-station-step='0']").evaluate(x=>x.click());
 await page.waitForSelector("#aoPray435930 .aoDevoCard[data-ao-devo-card='station-1']");
 await page.emulateMedia({reducedMotion:"no-preference"});
 // Source-certified traditional public Stations is optional, not a global
 // instruction for private users. Its cue is owned by the focused versicle.
 await page.locator("#aoPray435930 details[data-ao-stations-options] > summary").evaluate(x=>x.click());
 await page.locator("#aoPray435930 [data-p435930-station-public-posture]").evaluate(x=>{
   x.checked=true;x.dispatchEvent(new Event("change",{bubbles:true}));
 });
 await page.waitForSelector("#aoPray435930 [data-p435930-station-public-posture]:checked");
 assert.match(await page.locator("#aoPray435930 details[data-ao-stations-options] > summary small").innerText(),
   /Guided.*Group|Guidé.*Groupe/,
   "The explicitly selected public Stations method must display Guided and Group even with individual global preferences");
 const focusStationPhase=async(selector)=>{
   await page.locator("#aoPray435930 .aoP435930Stations .aoDevoCardScroll").evaluate((body,selector)=>{
     const el=body.querySelector(selector);
     if(!el)throw Error("Station source paragraph missing: "+selector);
     const bounds=body.getBoundingClientRect(),target=el.getBoundingClientRect();
     const max=Math.max(0,body.scrollHeight-body.clientHeight);
     body.scrollTop=Math.min(max,Math.max(0,body.scrollTop+target.top-bounds.top-body.clientHeight*.4));
     body.dispatchEvent(new Event("scroll",{bubbles:true}));
   },selector);
   await page.waitForTimeout(180);
   console.log("STATION_PHASE_DIAGNOSTIC "+JSON.stringify(await page.locator("#aoPray435930 .aoP435930Stations .aoDevoCardScroll").evaluate((body,selector)=>({
     requested:selector,top:body.scrollTop,max:body.scrollHeight-body.clientHeight,
     active:[...body.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']")].map(p=>({className:p.className,text:p.textContent.slice(0,35)})),
     scene:document.querySelector("body > .aoDevotionalActionCinematic")?.dataset.aoActionScene??null
   }),selector)));
 };
 await focusStationPhase(".aoP435930VRLine.leader");
 const stationCinema=page.locator("body > .aoDevotionalActionCinematic");
 await stationCinema.waitFor({state:"visible",timeout:6000});
 assert.equal(await stationCinema.getAttribute("data-ao-action-scene"),"STATIONS.0.GENUFLECT");
 await page.screenshot({path:resolve(captures,"02b-stations-public-genuflect-390.png"),animations:"disabled"});
 await stationCinema.locator(".aoDevotionalActionContinue").click();
 await focusStationPhase(".aoP435930StationConsider p");
 await stationCinema.waitFor({state:"visible",timeout:6000});
 assert.equal(await stationCinema.getAttribute("data-ao-action-scene"),"STATIONS.0.STAND");
 await stationCinema.locator(".aoDevotionalActionContinue").click();
 await focusStationPhase(".aoP435930StationPrayer .aoP435930Flip");
 await stationCinema.waitFor({state:"visible",timeout:6000});
 assert.equal(await stationCinema.getAttribute("data-ao-action-scene"),"STATIONS.0.KNEEL");
 await stationCinema.locator(".aoDevotionalActionContinue").click();

  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus",{returnContext:null})),true);
 await page.waitForSelector("#aoPray435930.open [data-ao-devotional-guide='angelus']",{state:"attached",timeout:12000});
 // Two navigation axes: timeline moves named cards, card-local scroll focuses
 // V/R paragraphs; native Prayer texts and translation controls stay intact.
 await page.waitForSelector("#aoPray435930.open [data-ao-devotional-deck='v1']",{timeout:12000});
 assert.equal(await page.locator("body > .aoDevoCinematicOpening").count(),0,
   "The first card must not show a blank cinematic or a rating-4 painting");
 // The prayer begins directly when no final-approved reproduction exists.
 // Incarnation still receives its source-owned full posture cinematic.
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard").count(),5);
 assert.equal(await page.locator("#aoPray435930 .aoDevoStop").count(),5);
 // Actual mobile presentation evidence: same current card at three widths.
 for(const [width,height] of [[320,700],[390,844],[430,932]]){
   await page.setViewportSize({width,height});
   await page.screenshot({path:resolve(captures,"09-angelus-dual-axis-"+width+".png"),
    fullPage:false,animations:"disabled"});
   const x=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-innerWidth,
    timeline:!!document.querySelector("#aoPray435930.open .aoDevoTimeline"),
    cards:document.querySelectorAll("#aoPray435930.open .aoDevoCard").length
   }));
   assert.ok(x.overflow<=1,"Dual-axis Angelus document overflow at "+width+"px: "+JSON.stringify(x));
   const density=await page.evaluate(()=>{
     const root=document.querySelector("#aoPray435930.open");
     const height=selector=>root.querySelector(selector)?.getBoundingClientRect().height||0;
     return {
       options:height("[data-ao-angelus-options]>summary"),
       timeline:height(".aoP435930AngelusReader .aoDevoTimeline"),
       stop:height(".aoP435930AngelusReader .aoDevoStop"),
       counter:getComputedStyle(root.querySelector(".aoP435930AngelusReader .aoDevoCardNumber")).display,
       ritual:height("[data-ao-ritual-module='angelus'] [data-channel='posture']"),
       postureText:/\b(kneel|stand|à genoux|debout)\b/i.test(root.innerText)
     };
   });
   assert.ok(density.options===0||(density.options>=44&&density.options<=56),
     "If shown inline, Angelus preferences must be accessible and compact: "+JSON.stringify(density));
   assert.ok(density.timeline<=55&&density.stop>=44,
     "Angelus chapter controls should fit one compact row: "+JSON.stringify(density));
   assert.equal(density.counter,"none","Avoid repeating chapter count above the named prayer");
   assert.ok(density.postureText,"The traditional posture instruction must remain visible");
   assert.ok(density.ritual===0||density.ritual>=44,"A rendered posture control must remain readable");
 }
 await page.setViewportSize({width:390,height:844});
 assert.match(await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) h2").innerText(),/Announcement|Annonce/);
 await page.waitForFunction(()=>[...document.querySelectorAll("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoParagraph")]
  .filter(x=>x.getClientRects().length).some(x=>x.dataset.aoDevoActive==="true"),null,{timeout:9000});
 const paragraphEnergy=await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoParagraph").evaluateAll(nodes=>
  nodes.filter(x=>x.getClientRects().length).map(x=>({active:x.dataset.aoDevoActive,opacity:Number(getComputedStyle(x).opacity)})));
 assert.equal(paragraphEnergy.length,2,"Individual Angelus presents one V/R unit and one continuous Hail Mary");
 assert.ok(paragraphEnergy[0].opacity>paragraphEnergy[1].opacity,
  "Active V. must be brighter than its muted R.: "+JSON.stringify(paragraphEnergy));
 assert.ok(paragraphEnergy[1].opacity<1,"Upcoming Hail Mary must be muted: "+JSON.stringify(paragraphEnergy));
 // The retired Latin-cross overlay must not obscure or compete with prayer.
 assert.equal(await page.locator("#aoPray435930 .aoCrossPad").count(),0,
  "Angelus must use the shared navigation, not crosses");
 const progress=page.locator("#aoPray435930 .aoFolioReader .aoDevoProgress");
 assert.equal(await progress.count(),1,"Angelus has exactly one positional progress bar");
 assert.equal(await progress.getAttribute("aria-valuenow"),"1");
 assert.equal(await progress.getAttribute("aria-valuemax"),"5");
 await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoCardScroll").focus();
 await page.keyboard.press("ArrowRight");
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden])").getAttribute("data-ao-devo-card"),
  "fiat","Keyboard Right must advance the canonical Angelus deck");
 assert.equal(await progress.getAttribute("aria-valuenow"),"2",
  "Progress must follow the canonical card");
 await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoCardScroll").focus();
 await page.keyboard.press("ArrowLeft");
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden])").getAttribute("data-ao-devo-card"),
  "announcement","Keyboard Left must return to the previous card");
 assert.equal(await progress.getAttribute("aria-valuenow"),"1");
 // Do not disturb the already-owned speaking roles, text translations or
 // existing card swipes which are tested immediately below.
 // Distinct axes: diagonal/vertical motion must not advance cards;
 // deliberate horizontal touch swipe must advance exactly one named card.
 const swipe=async(dx,dy)=>{
   await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoCardScroll").evaluate((el,{dx,dy})=>{
     const touch=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});
     el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[touch(250,340)],changedTouches:[touch(250,340)]}));
     el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[touch(250+dx,340+dy)]}));
   },{dx,dy});
 };
 await swipe(10,-170);
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden])").getAttribute("data-ao-devo-card"),"announcement",
  "Vertical scroll must not change the prayer card");
 await swipe(-160,9);
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden])").getAttribute("data-ao-devo-card"),"fiat",
  "Horizontal swipe failed to advance exactly one card");
 assert.equal(await page.locator("#aoPray435930 .aoDevoStop[aria-current='step']").getAttribute("data-ao-devo-jump"),"1",
  "Timeline did not follow the one-card forward swipe");
 await swipe(160,4);
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden])").getAttribute("data-ao-devo-card"),"announcement",
  "Reverse swipe failed to restore previous card");
 assert.equal(await page.locator("#aoPray435930 .aoDevoStop[aria-current='step']").getAttribute("data-ao-devo-jump"),"0",
  "Timeline did not return to the original prayer card");
 await page.locator("#aoPray435930 [data-ao-devo-jump='2']").evaluate(x=>x.click());
 const shot=page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoFolioIncarnationCue");
  await shot.waitFor({state:"visible",timeout:3000});
  assert.equal(await page.locator("body > .aoDevoPostureCinematic").count(),0,
   "Angelus Incarnation must not block prayer with a full-screen modal");
  const shotStatus=await shot.evaluate(el=>({
   action:el.textContent.trim(),
   iconSize:el.querySelector(".aoFolioIncarnationIcon")?.getBoundingClientRect().width,
   active:el.classList.contains("is-active"),
  }));
  assert.ok(shotStatus.active&&shotStatus.iconSize>=44,
   "Incarnation gesture should be salient but non-blocking: "+JSON.stringify(shotStatus));
  await page.screenshot({path:resolve(captures,"11-angelus-incarnation-inline-390.png"),
    fullPage:false,animations:"disabled"});
  await page.emulateMedia({reducedMotion:"reduce"});
 await page.locator("#aoPray435930 [data-ao-devo-jump='3']").evaluate(x=>x.click());
 assert.equal(await page.locator("body > .aoDevoCinematicOpening").count(),0,
  "No opening art may recur on chapter change, even in reduced motion");
 await page.locator("#aoPray435930 [data-ao-devo-jump='2']").evaluate(x=>x.click());
 await page.emulateMedia({reducedMotion:"no-preference"});
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden])").getAttribute("data-ao-devo-card"),"incarnation");
 assert.equal(await page.locator("#aoPray435930 .aoDevoStop[aria-current='step']").count(),1);
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoParagraph").evaluateAll(nodes=>nodes.filter(x=>x.getClientRects().length).length),2);
 const devotionalScroll=page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoCardScroll");
 assert.equal(await devotionalScroll.evaluate(x=>getComputedStyle(x).overflowY),"auto");
 await devotionalScroll.evaluate(x=>{x.scrollTop=80;x.dispatchEvent(new Event("scroll"))});
 await page.waitForFunction(()=>!!document.querySelector("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoParagraph[data-ao-devo-active='true']"),null,{timeout:9000});
 await page.locator("#aoPray435930 [data-ao-devo-jump='1']").evaluate(x=>x.click());
 assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden])").getAttribute("data-ao-devo-card"),"fiat");
 await page.locator("#aoPray435930 [data-ao-devo-jump='0']").evaluate(x=>x.click());
 const historicalConclusion=page.locator("#aoPray435930 [data-p435930-angelus-appendix]");
  await historicalConclusion.evaluate(x=>{if(!x.checked)x.click()});
  await page.waitForFunction(()=>document.querySelectorAll("#aoPray435930.open .aoDevoCard").length===5,null,{timeout:10000});
  assert.equal(await page.locator("#aoPray435930 .aoDevoCard[data-ao-devo-card='collect'] .aoFolioConclusionPart").count(),3);

  assert.equal(await page.locator("#aoPray435930 .aoDevoCard[data-ao-devo-card='collect'] [data-face-v] .aoFolioGloria").count(),3,
   "Three Gloria Patri repetitions must appear inside the Collect");
  await page.locator("#aoPray435930 [data-ao-devo-jump='4']").evaluate(x=>x.click());
  assert.equal(await page.locator("#aoPray435930 .aoDevoCard:not([hidden])").getAttribute("data-ao-devo-card"),"collect");
  assert.ok(await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoParagraph").count()>=4,
   "Collect and optional concluding prayers must remain within the same card");
  await page.screenshot({path:resolve(captures,"10-angelus-collect-and-closing-390.png"),
   fullPage:false,animations:"disabled"});
  await historicalConclusion.evaluate(x=>x.click());
  assert.equal(await page.locator("#aoPray435930 .aoDevoCard").count(),5);
  assert.equal(await page.locator("#aoPray435930 .aoFolioConclusionPart").count(),0);
  assert.equal(await page.locator("#aoPray435930 .aoAngelusGuideSection").count(),6);
 assert.equal(await page.locator("#aoPray435930 .aoAngelusGuideSection a[href^='https://']").count(),6);
 await page.locator("#aoPray435930 .aoAngelusGuide>summary").evaluate(x=>x.click());
 assert.equal(await page.locator("#aoPray435930 .aoAngelusGuide").evaluate(x=>x.open),true);
 await page.locator("#aoPray435930 [data-p435930-seg='group']").first().evaluate(x=>x.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-angelus-recitation]").getAttribute("data-ao-angelus-recitation"),"group");
 // Opening/recitation presentation may settle after the state selector changes.
 // Require both actual role spans, never just a "group" preference flag.
 await page.waitForFunction(()=>{
   const root=document.querySelector("#aoPray435930");
   return !!root?.querySelector("[data-ao-angelus-voice=leader]") &&
     !!root?.querySelector("[data-ao-angelus-voice=response]");
 },null,{timeout:8000}).catch(async error=>{
   const diagnostics=await page.evaluate(()=>({
     owner:globalThis.AO_PRAY_V435930?.qa?.(),
     canonicalEnglishLength:globalThis.AO_PRAY_CANONICAL_DATA_V435930?.angelus?.en?.length??null,
     form:document.querySelector("#aoPray435930 [data-ao-angelus-form]")?.dataset?.aoAngelusForm,
     recitation:document.querySelector("#aoPray435930 [data-ao-angelus-recitation]")?.dataset?.aoAngelusRecitation,
     kinds:[...document.querySelectorAll("#aoPray435930 [data-ao-angelus-unit]")].map(x=>x.dataset.aoAngelusUnit),
     firstVR:document.querySelector("#aoPray435930 [data-ao-angelus-unit=vr]")?.outerHTML?.slice(0,2200),
     firstButton:document.querySelector("#aoPray435930 [data-ao-angelus-unit=vr] button")?.innerHTML?.slice(0,1700)
   }));
   throw new Error("Angelus leader/response DOM was not rendered: "+JSON.stringify(diagnostics)+"; "+String(error));
 });
 const dialogue=await page.evaluate(()=>{
  const host=document.getElementById("aoPray435930");
  return {leader:host?.querySelectorAll("[data-ao-angelus-voice=leader]").length??0,
    response:host?.querySelectorAll("[data-ao-angelus-voice=response]").length??0};
 });
 assert.ok(dialogue.leader>0&&dialogue.response>0,"Group V/R pairing absent in mobile DOM: "+JSON.stringify(dialogue));
 await page.locator("#aoPray435930 [data-ao-devo-jump='0']").evaluate(x=>x.click());
 const speakerGeometry=await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoAngelusDialogueLine").first().evaluate(line=>{
   const speaker=line.querySelector(".ao-liturgical-speaker"),words=line.querySelector("span:not(.ao-liturgical-speaker)");
   const a=speaker?.getBoundingClientRect(),b=words?.getBoundingClientRect();
   return {speakerRight:a?.right,textLeft:b?.left,textWidth:b?.width,speakerTop:a?.top,textTop:b?.top};
 });
 assert.ok(speakerGeometry.textWidth>90 &&
   speakerGeometry.speakerRight+2<=speakerGeometry.textLeft &&
   Math.abs(speakerGeometry.speakerTop-speakerGeometry.textTop)<20,
   "Angelus speaker symbols must not collide with text: "+JSON.stringify(speakerGeometry));
 await page.screenshot({path:resolve(captures,"12-angelus-group-dialogue-390.png"),
   fullPage:false,animations:"disabled"});

 const flip=page.locator("#aoPray435930 .aoP435930PrayerUnit [data-p435930-card-flip]").first();
 await flip.evaluate(x=>x.click());
 assert.equal(await flip.locator("[data-face-la]").evaluate(x=>x.hidden),false,"Latin replacement did not open");
 await page.locator("#aoPray435930 [data-p435930-seg='regina']").first().evaluate(x=>x.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-angelus-form]").getAttribute("data-ao-angelus-form"),"regina");
 assert.equal(await page.locator("#aoPray435930 .aoAngelusGuideSection").count(),5);
 assert.equal(await page.locator("#aoPray435930 [data-p435930-angelus-appendix]").count(),0,"Angelus-only appendix leaked into Regina Caeli");
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary",{returnContext:null}));
 await page.waitForFunction(()=>!!document.querySelector("#aoPrayerBookRoot.open .aoRosaryGuide"),null,{timeout:18000});
 // The canonical opening now intentionally hides optional explanation.
 // Expand the native preparation disclosure before requesting the Guide.
 const prep=page.locator("#aoPrayerBookRoot.open .aoRosaryPreparation");
 if(await prep.count())await prep.locator("summary").first().click();
 const guide=page.locator("#aoPrayerBookRoot.open .aoRosaryGuide");
 assert.equal(await guide.locator(".aoRosaryGuideSection").count(),6);
 assert.equal(await guide.locator(".aoRosaryGuideSection a[href^='https://']").count(),6);
 const before=await page.evaluate(()=>globalThis.AO_ROSARY_V381?.state?.()?.step??null);
 await guide.locator("summary").evaluate(x=>x.click());
 assert.equal(await guide.evaluate(x=>x.open),true);
 const guideViewport=await guide.locator(".aoRosaryGuideBody").evaluate(el=>{
   const style=getComputedStyle(el),rect=el.getBoundingClientRect();
   return {visible:rect.height,scrollHeight:el.scrollHeight,overflowY:style.overflowY,viewport:innerHeight};
 });
 assert.equal(guideViewport.overflowY,"auto","expanded mobile Guide must scroll internally");
 assert.ok(guideViewport.visible<=Math.min(guideViewport.viewport*.34,290)+2,
  "expanded Guide displaced the mobile prayer: "+JSON.stringify(guideViewport));
 assert.ok(guideViewport.scrollHeight>guideViewport.visible,
  "all six historical sections should remain in a scrollable guide");
 const after=await page.evaluate(()=>globalThis.AO_ROSARY_V381?.state?.()?.step??null);
 assert.equal(after,before,"opening Rosary Guide must not advance beads");
 await page.evaluate(()=>globalThis.AO_PRAY_V435930?.open?.("pray.rosary",{returnContext:null}));
 await page.waitForFunction(()=>!!document.querySelector("#aoPrayerBookRoot.open .aoRosaryGuide"),null,{timeout:15000});
 assert.equal(await page.locator("#aoPrayerBookRoot.open .aoRosaryGuide").evaluate(x=>x.open),true,"reopened Rosary player lost Guide state");
 // The 200 inherited English cue extracts are archived for verification, not
 // rendered as authoritative Scripture in the actively selected decade.
 await expandMysteryChoices();
 const setButton=page.locator("#aoPrayerBookRoot.open [data-pb-rosary-set='joyful']").first();
 if(await setButton.count())await setButton.evaluate(x=>x.click());
 await page.waitForFunction(()=>globalThis.AO_ROSARY_V381?.state?.()?.set==="joyful",null,{timeout:12000});
 // Guided depth must provide a readable bilingual edition-linked context
 // at the mystery opening, without restoring arbitrary ten-bead quotations.
 const guided=page.locator("#aoPrayerBookRoot.open [data-p435930-rosary-depth='guided']").first();
 assert.ok(await guided.count(),"Rosary guided-depth control is absent");
 await guided.evaluate(el=>el.click());
 const firstMystery=await page.evaluate(()=>{
   const api=globalThis.AO_ROSARY_V381,idx=api.steps().findIndex(x=>x.kind==="mystery");
   if(idx<1)return -1;
   api.setStep(idx-1); // Place donor immediately before the mystery
   return idx;
 });
 assert.ok(firstMystery>=0,"Joyful mystery is not reachable");
 // Real button dispatch activates the canonical modular presentation owner.
 // Direct API.setStep only redraws the archived donor and is not a UI journey.
 await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").evaluate(x=>x.click());
 await page.waitForSelector("#aoPrayerBookRoot.open [data-ao-rosary-scripture-opening='joy1']",{timeout:8000});
 assert.match(await page.locator("#aoPrayerBookRoot.open .aoRosaryScriptureOpening").innerText(),/Luke 1:26-38/);
 const rosaryMeditation=page.locator("#aoPrayerBookRoot.open .aoRosaryScriptureOpening");
 await page.waitForSelector("#aoPrayerBookRoot.open [data-ao-rosary-context='editorial-summary']",{timeout:9000});
 assert.match(await rosaryMeditation.innerText(),/Gabriel announces that Mary|Gabriel annonce à Marie/);
 assert.match(await rosaryMeditation.innerText(),/NOT A SCRIPTURE QUOTATION|PAS UNE CITATION BIBLIQUE/);
 const original=rosaryMeditation.locator("a[data-ao-rosary-scripture-edition]");
 assert.equal(await original.count(),1,"Guided mystery has no Catholic original reading");
 assert.match(await original.getAttribute("href"),/^https:\/\/(?:www\.biblegateway\.com\/passage|fr\.wikisource\.org\/wiki\/Bible_Crampon_1923\/)/);
 const firstCue=await page.evaluate(()=>{
   const api=globalThis.AO_ROSARY_V381,idx=api.steps().findIndex(x=>x.cue);
   if(idx<1)return -1;api.setStep(idx-1);return idx;
 });
 assert.ok(firstCue>=0,"Rosary cue-bearing Hail Mary is not reachable");
 await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").evaluate(x=>x.click());
 const guidedCue=page.locator("#aoPrayerBookRoot.open [data-ao-rosary-guided-bead]");
 assert.equal(await guidedCue.count(),1,"Guided Hail Mary lacks its original coherent bilingual meditation");
 assert.match(await guidedCue.innerText(),/God sends Gabriel|Dieu envoie Gabriel/);
 assert.equal(await guidedCue.getAttribute("data-ao-rosary-context"),"editorial-meditation");
 const beadSource=page.locator("#aoPrayerBookRoot.open .aoRosaryBeadScripture a[data-ao-rosary-meditation-source]");
 assert.equal(await beadSource.count(),1,"Guided bead lacks contextual primary witness");
 assert.match(await beadSource.getAttribute("data-ao-scripture-context"),/Luke 1:26-27/);
 assert.match(await beadSource.getAttribute("href"),/^https:\/\/(?:www\.biblegateway\.com\/passage|fr\.wikisource\.org\/wiki\/Bible_Crampon_1923\/)/);
 const beadSourceHref=await beadSource.getAttribute("href");
 if(beadSourceHref.includes("fr.wikisource.org/wiki/Bible_Crampon_1923/")){
   assert.match(beadSourceHref,/#1$/,"French Guided source must navigate directly to the cited chapter");
   assert.match(await beadSource.getAttribute("title"),/chapitre cité/);
 }else{
   assert.match(beadSourceHref,/version=DRA/,"English Guided source must use Douay–Rheims Challoner");
 }
 assert.equal(await beadSource.getAttribute("target"),"_blank");
 assert.equal(await beadSource.getAttribute("rel"),"noopener noreferrer");
 assert.equal(await guidedCue.getAttribute("data-ao-rosary-source-type"),"SCRIPTURAL_PARAPHRASE");
 assert.equal(await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet .lab-scripture-cue").count(),0,
   "Unreviewed bead Scripture still presented as certified English/French quotation");
 assert.equal(await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet .lab-scripture-actions").count(),0,
   "Unreviewed bead-specific commentary still attached to potentially truncated Scripture");

 // Method-specific liturgical source sequences must run in the real phone reader,
 // rather than existing only as metadata in the catalogue.
 for(const method of ["dominican","montfort"]){
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true);
  // Advanced method choices are now intentionally collapsed by default.
  // Open their explicit, accessible controller before method-specific tests.
  await page.locator("#aoPray435930.open [data-p435930-rosary-customize]").evaluate(el=>{
    if(el.getAttribute("aria-expanded")==="false")el.click();
  });
  const button=page.locator("#aoPray435930.open [data-p435930-rosary-choose='"+method+"']");
  await button.waitFor({timeout:12000});
  await button.evaluate(x=>x.click());
  assert.equal(await page.locator("#aoPray435930.open [data-p435930-rosary-decades='15']").isDisabled(),true,"Alternative methods must not advertise unverified 15 decades");
  await page.locator("#aoPray435930.open [data-p435930-rosary-begin]").evaluate(x=>x.click());
  await page.waitForFunction(m=>globalThis.AO_ROSARY_V381?.getMethod?.()===m &&
    !!document.querySelector("#aoPrayerBookRoot.open"),method,{timeout:14000});
  if(method==="montfort")await page.waitForFunction(()=>{
   const el=document.querySelector("#aoPrayerBookRoot.open [data-pb-rosary-set='luminous']");
   return !!el&&el.disabled&&el.hidden;
  },null,{timeout:10000});
 await expandMysteryChoices();
  const select=page.locator("#aoPrayerBookRoot.open [data-pb-rosary-set='joyful']").first();
  await select.waitFor({timeout:12000});
  await select.evaluate(x=>x.click());
  await page.waitForFunction(()=>globalThis.AO_ROSARY_V381?.state?.()?.set==="joyful",null,{timeout:12000});
  const inventory=await page.evaluate(()=>{
   const steps=globalThis.AO_ROSARY_V381.steps();
   return {opening:steps.slice(0,4).map(x=>x.kind),last:steps.at(-1)?.kind,
    offerings:steps.filter(x=>x.kind==="montfort-offering").length,
    fruits:steps.filter(x=>x.kind==="montfort-fruit").length,
    aves:steps.filter(x=>x.key==="ave"&&x.bead).length};
  });
  assert.equal(inventory.aves,50,"Canonical decade prayers were changed");
  assert.equal(inventory.opening[0],"prayer");
  if(method==="dominican"){
   assert.equal(inventory.opening[1],"dominican-opening");
   assert.equal(inventory.last,"dominican-conclusion");
   await page.evaluate(()=>globalThis.AO_ROSARY_V381.setStep(1));
   assert.match(await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet").innerText(),/Domine, labia mea aperies|Seigneur, ouvrez mes lèvres/);
  }else{
   assert.equal(inventory.opening[1],"montfort-opening");
   assert.equal(inventory.offerings,5);
   assert.equal(inventory.fruits,5);
   const offeringIndex=await page.evaluate(()=>globalThis.AO_ROSARY_V381.steps().findIndex(x=>x.kind==="montfort-offering"));
   assert.ok(offeringIndex>0);
   await page.evaluate(n=>globalThis.AO_ROSARY_V381.setStep(n),offeringIndex);
   assert.match(await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet").innerText(),/Seigneur Jésus|Lord Jesus/);
   assert.match(await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet a").first().getAttribute("href"),/^https:\/\/www\.montfort\.org\//);
  }
 }

 // Newly exposed source-bound Rosary methods, exercised through real phone controls.
 for(const method of ["montfort_short","scriptural"]){
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true);
  // Advanced method choices are now intentionally collapsed by default.
  // Open their explicit, accessible controller before method-specific tests.
  await page.locator("#aoPray435930.open [data-p435930-rosary-customize]").evaluate(el=>{
    if(el.getAttribute("aria-expanded")==="false")el.click();
  });
  const button=page.locator("#aoPray435930.open [data-p435930-rosary-choose='"+method+"']");
  await button.waitFor({timeout:12000});
  await button.evaluate(el=>el.click());
  assert.equal(await page.locator("#aoPray435930.open [data-p435930-rosary-decades='15']").isDisabled(),true);
  await page.locator("#aoPray435930.open [data-p435930-rosary-begin]").evaluate(el=>el.click());
  await page.waitForFunction(m=>globalThis.AO_ROSARY_V381?.getMethod?.()===m &&
   !!document.querySelector("#aoPrayerBookRoot.open"),method,{timeout:14000});
  if(method==="montfort_short")await page.waitForFunction(()=>{
   const el=document.querySelector("#aoPrayerBookRoot.open [data-pb-rosary-set='luminous']");
   return !!el&&el.disabled&&el.hidden;
  },null,{timeout:10000});
 await expandMysteryChoices();
  const choose=page.locator("#aoPrayerBookRoot.open [data-pb-rosary-set='joyful']").first();
  await choose.waitFor({timeout:12000});
  await choose.evaluate(el=>el.click());
  await page.waitForFunction(()=>globalThis.AO_ROSARY_V381?.state?.()?.set==="joyful",null,{timeout:10000});
  if(method==="montfort_short"){
   const first=await page.evaluate(()=>{
    const api=globalThis.AO_ROSARY_V381,steps=api.steps(),idx=steps.findIndex(x=>x.key==="ave"&&x.bead===1);
    api.setStep(idx);return idx;
   });
   assert.ok(first>0);
    // Allow the intentional mystery-introduction cinematic to clear before capture.
    await page.waitForTimeout(4000);
    await page.screenshot({path:resolve(captures,"02-montfort-clausule-390.png"),fullPage:false,animations:"disabled"});
   const latin=await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet [data-pb-latin]").first().innerText();
   const vern=await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet [data-pb-vern]").first().textContent();
   assert.match(latin,/Iesus incarnatus/,"Latin clause absent after Jesus");
   assert.match(vern,/Jésus incarné,|Jesus incarnate\./,"Vernacular Montfort clause absent");
   const graceIndex=await page.evaluate(()=>globalThis.AO_ROSARY_V381.steps().findIndex(x=>x.kind==="montfort-short-grace"));
   assert.ok(graceIndex>first);
   await page.evaluate(n=>globalThis.AO_ROSARY_V381.setStep(n),graceIndex);
   assert.match(await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet").innerText(),
    /Grâce des mystères joyeux|Grace of the Joyful Mysteries/);
   assert.match(await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet a").first().getAttribute("href"),/montfort\.org.*#page=3/);
  }else{
   const result=await page.evaluate(()=>{
    const api=globalThis.AO_ROSARY_V381,steps=api.steps(),idx=steps.findIndex(x=>x.cue);
    api.setStep(idx-1);return {index:idx,count:steps.filter(x=>x.key==="ave"&&x.bead).length}
   });
   assert.equal(result.count,50,"Scriptural method changed ordinary decade prayer counts");
   assert.ok(result.index>0);
   await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").evaluate(el=>el.click());
   await page.waitForSelector("#aoPrayerBookRoot.open [data-ao-rosary-guided-bead]",{timeout:9000});
   const note=page.locator("#aoPrayerBookRoot.open [data-ao-rosary-guided-bead]");
   assert.equal(await note.getAttribute("data-ao-rosary-source-type"),"SCRIPTURAL_PARAPHRASE");
   assert.match(await page.locator("#aoPrayerBookRoot.open .aoRosaryBeadScripture a[data-ao-rosary-meditation-source]").getAttribute("href"),
    /^https:\/\/(?:www\.biblegateway\.com\/passage|fr\.wikisource\.org\/wiki\/Bible_Crampon_1923\/)/);
   assert.equal(await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet .lab-scripture-cue").count(),0);
  }
 }

 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary",{returnContext:null})),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_ROSARY_V381.getMethod()),"ordinary","Method preference leaked into standard Rosary");
 await expandMysteryChoices();
 const normalSet=page.locator("#aoPrayerBookRoot.open [data-pb-rosary-set='joyful']").first();
 await normalSet.waitFor({timeout:10000});
 await normalSet.evaluate(x=>x.click());
 assert.equal(await page.evaluate(()=>globalThis.AO_ROSARY_V381.steps().filter(x=>/^(dominican|montfort)-/.test(x.kind)).length),
  0,"Alternative method cards leaked into the ordinary Rosary");


 // One, genuinely continuous journey through the canonical phone reader.
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true);
 const chooser=page.locator("#aoPray435930.open [data-ao-rosary-chooser]");
 await chooser.waitFor({timeout:12000});
 await chooser.locator("[data-p435930-rosary-customize]").evaluate(el=>{
   if(el.getAttribute("aria-expanded")==="false")el.click();
 });
 assert.equal(await chooser.locator("[data-p435930-rosary-choose]").count(),5,"One coherent method chooser is required");
 assert.equal(await chooser.locator("[data-p435930-rosary-begin]").count(),1,"Only one start action");
 await chooser.locator("[data-p435930-rosary-choose='ordinary']").evaluate(x=>x.click());
 await chooser.locator("[data-p435930-rosary-decades='15']").evaluate(x=>x.click());
 assert.equal(await chooser.locator("[data-p435930-rosary-decades='15']").getAttribute("aria-pressed"),"true");
  await page.screenshot({path:resolve(captures,"03-rosary-chooser-390.png"),fullPage:false,animations:"disabled"});
  await page.setViewportSize({width:320,height:720});
  await page.screenshot({path:resolve(captures,"04-rosary-chooser-320.png"),fullPage:false,animations:"disabled"});
  await page.setViewportSize({width:390,height:844});
  // Exercise an actual touch gesture on the primary Begin button.
  await chooser.locator("[data-p435930-rosary-begin]").tap();
 await page.waitForFunction(()=>globalThis.AO_ROSARY_V381?.state?.()?.set==="joyful" &&
   document.querySelector("#aoPrayerBookRoot.open")?.dataset?.aoRosaryActiveRoot==="true" &&
   document.querySelector("#aoPrayerBookRoot.open .pbShell")?.dataset?.aoRosaryExactDonor==="v3.4.14" &&
   !!document.querySelector("#aoPrayerBookRoot.open [data-lab-rosary-next]"),null,{timeout:14000});
  await page.waitForTimeout(1500);
  await page.screenshot({path:resolve(captures,"05-fifteen-decade-guide-390.png"),fullPage:false,animations:"disabled"});
  const rosaryGuide=page.locator("#aoPrayerBookRoot.open .aoRosaryGuide");
  if(await rosaryGuide.count()&&await rosaryGuide.evaluate(el=>el.open))await rosaryGuide.locator("summary").first().evaluate(el=>el.click());
  await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet").first().scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(captures,"05b-fifteen-decade-opening-390.png"),fullPage:false,animations:"disabled"});
 const wholeRosary=await page.evaluate(()=>{
  const api=globalThis.AO_ROSARY_V381;
  const expected=['joyful','sorrowful','glorious'],seen=[],crossings=[];
  let opening=0,conclusions=0,turns=0,reversePasses=0;
  const button=which=>document.querySelector("#aoPrayerBookRoot.open [data-lab-rosary-"+which+"]");
  while(turns<270){
   const st=api.state(),steps=api.steps(),step=steps[st.step];
   if(!step)throw new Error("Rosary lost current step at turn "+turns);
   if(step.phase==="opening")opening++;
   if(step.kind==="mystery"){
    seen.push(step.id);
    if(step.id==="sor1"||step.id==="glo1"){
     const back=button("prev");
     if(!back)throw new Error("Previous control missing at "+step.id);
     back.click();
     const prior=api.state(),priorStep=api.steps()[prior.step];
     if(prior.set!==expected[expected.indexOf(st.set)-1]||priorStep.id!==(step.id==="sor1"?"joy5":"sor5"))
      throw new Error("Backward mystery group handoff broken at "+step.id);
     reversePasses++;
     const forward=button("next");
     if(!forward)throw new Error("Forward control missing during boundary round trip");
     forward.click();
     if(api.state().set!==st.set||api.steps()[api.state().step].id!==step.id)
      throw new Error("Forward return from prior mystery group broken at "+step.id);
    }
   }
   if(step.phase==="conclusion"){
    conclusions++;
    if(st.set!=="glorious")throw new Error("Premature conclusion in "+st.set);
    break;
   }
   const forward=button("next");
   if(!forward)throw new Error("Rosary next control disappeared");
   forward.click();
   const after=api.state();
   if(after.set!==st.set)crossings.push(st.set+"→"+after.set);
   turns++;
  }
  return {turns,opening,conclusions,seen,crossings,reversePasses,
   endSet:api.state().set,endKind:api.steps()[api.state().step]?.kind};
 });
 assert.equal(wholeRosary.opening,7,"Opening prayers must run exactly once");
 assert.equal(wholeRosary.conclusions,1,"A single final conclusion must follow the fifteenth decade");
 assert.deepEqual(wholeRosary.crossings,["joyful→sorrowful","sorrowful→glorious"]);
 assert.deepEqual(wholeRosary.seen,["joy1","joy2","joy3","joy4","joy5",
  "sor1","sor2","sor3","sor4","sor5","glo1","glo2","glo3","glo4","glo5"]);
 assert.equal(wholeRosary.reversePasses,2);
 assert.equal(wholeRosary.endSet,"glorious");
 assert.equal(wholeRosary.endKind,"conclusion");
  await page.waitForTimeout(4000);
  await page.locator("#aoPrayerBookRoot.open .lab-prayer-sheet").first().scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(captures,"06-fifteen-decade-conclusion-390.png"),fullPage:false,animations:"disabled"});

  // The browser locale is not the application language: explicitly switch the runtime.
  await page.evaluate(()=>globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"}));
  assert.equal(await page.evaluate(()=>globalThis.AO_RUNTIME_V8.store.getState().language),"fr");
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null})),true);
  await page.locator("#aoPray435930.open .aoMercyPrayer").waitFor({timeout:12000});
  assert.match(await page.locator("#aoPray435930.open .aoMercyPrayer").innerText(),/Au nom du Père/);
 assert.equal(await page.locator("#aoPray435930.open .aoMercyKicker").count(),0);
 assert.match(await page.locator("#aoPray435930.open .aoMercyBeadPosition").innerText(),/Prières initiales|Signe de croix/);
  await page.screenshot({path:resolve(captures,"07-divine-mercy-french-390.png"),fullPage:false,animations:"disabled"});
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true);
  await page.locator("#aoPray435930.open [data-ao-rosary-chooser]").waitFor({timeout:12000});
  assert.match(await page.locator("#aoPray435930.open [data-ao-rosary-chooser]").innerText(),/Traditionnel/);
  await page.screenshot({path:resolve(captures,"08-rosary-methods-french-390.png"),fullPage:false,animations:"disabled"});

 assert.equal(pageErrors.filter(x=>/angelus-guide|rosary-guide|presentation-runtime|undefined/i.test(x)).length,0,"Marian reader threw a runtime error: "+pageErrors.join(" | "));
 console.log("PASS Marian Angelus/Regina Caeli and Rosary mobile Guide acceptance");
 await context.close();
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}
