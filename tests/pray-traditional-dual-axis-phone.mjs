import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {SACRED_HYMNS_V381} from "../src/pray/traditional-pray-data.js";
import {GOLDEN_ARROW_REPARATION_V1} from "../src/pray/icksp-golden-arrow-reparation.v1.js";

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
 await page.goto("http://127.0.0.1:4286/index.html?aoDailyUxPilot=0",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"));
 await page.waitForSelector("#ao-settings-modular-root [data-settings-route='/settings/language-reading']",{timeout:20000});
 await page.locator('[data-settings-route="/settings/language-reading"]').click();
 await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
 await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:10000});
 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
 const launched=await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
 if(launched!==true){
  const diagnostic=await page.evaluate(()=>({
   prayerStatus:globalThis.AO_PRAY_APP_V1?.status?.(),
   prayerRuntime:typeof globalThis.AO_PRAY_V435930?.open,
   loadedScripts:[...document.scripts].slice(-12).map(s=>s.src||s.id),
   resources:performance.getEntriesByType("resource").filter(x=>/pray|p435930|traditional/.test(x.name)).slice(-20).map(x=>({url:x.name,status:x.responseStatus})),
   shell:typeof globalThis.AO_APP_SHELL_V1?.navigate,
   module:typeof globalThis.AO_MODULES?.open
  }));
  console.error("DAILY_PRAYER_BOOT_DIAGNOSTIC",JSON.stringify({diagnostic,errors}));
 }
 assert.equal(launched,true,"Prayer host failed before guided reader: check boot diagnostic");
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
 // Design B remains the reversible legacy presentation. This suite protects
 // that fallback; the daily UX phone suite independently tests the book-first default.
 await page.waitForSelector('#aoPray435930[data-ao-contemplative-daily="guided"]',{timeout:12000});
 assert.equal(await page.locator('#aoPray435930[data-ao-contemplative-daily="guided"]').count(),1);
 await page.screenshot({path:resolve(captures,"morning-390-fr.png"),animations:"disabled"});
 // Optional session timer stays subordinate to the existing prayer card.
 // No release-approved historical witnesses exist yet: source tabs stay hidden.
 assert.equal(await page.locator("#aoPray435930 .aoDailyFormulationChoices").count(),0);
 assert.equal(await page.locator("#aoPray435930 .aoDailyLengthChoices").count(),0,
  "An unapproved Short/Complete profile must not appear on the real phone reader");
 assert.equal(await page.locator("#aoPray435930 [data-ao-daily-formulation]").count(),0,
  "No unapproved historical prayer should render in the existing reader");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-timer-toggle]").count(),1);
 assert.equal(await page.locator("#aoPray435930 .aoDailyClockPanel").count(),0);
 const beforeTimerCard=await page.locator("#aoPray435930 .aoDevoCard").evaluate(el=>{
   const outer=document.querySelector("#aoPray435930 .aoDailyClockShell");
   const reader=el.querySelector(".aoDevoCardScroll");
   reader.scrollTop=45;
   return {index:el.dataset.aoDevoIndex,scroll:reader.scrollTop,
     before:!!(el.compareDocumentPosition(outer)&Node.DOCUMENT_POSITION_FOLLOWING)};
 });
 assert.equal(beforeTimerCard.before,true,"Prayer must appear before the optional timer");
 await page.locator("#aoPray435930 [data-tp381-timer-toggle]").tap();
 assert.equal(await page.locator("#aoPray435930 .aoDailyClockPanel").count(),1);
 const timerGeometry=await page.locator("#aoPray435930 .aoDailyClockPanel").evaluate(panel=>{
   const r=panel.getBoundingClientRect(),toggle=document.querySelector("#aoPray435930 [data-tp381-timer-toggle]").getBoundingClientRect();
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,triggerTop:toggle.top,width:innerWidth,height:innerHeight};
 });
 assert.ok(timerGeometry.top>=0&&timerGeometry.bottom<timerGeometry.triggerTop-2&&
  timerGeometry.left>=0&&timerGeometry.right<=timerGeometry.width,
  "Expanded timer must be fully visible ABOVE its toggle: "+JSON.stringify(timerGeometry));
 await page.screenshot({path:resolve(captures,"contemplative-morning-timer-open-390-fr.png"),animations:"disabled"});
 assert.equal(await page.locator("#aoPray435930 .aoDailyFormulationChoices").count(),0,
  "Historical witnesses must remain hidden while the timer is open");
 const afterTimerCard=await page.locator("#aoPray435930 .aoDevoCard").evaluate(el=>({
   index:el.dataset.aoDevoIndex,scroll:el.querySelector(".aoDevoCardScroll").scrollTop
 }));
 assert.deepEqual(afterTimerCard,{index:beforeTimerCard.index,scroll:beforeTimerCard.scroll},
  "Expanding optional timer must not replace or scroll the prayer card");
 assert.equal(await page.locator("#aoPray435930 [data-ao-daily-clock-readout]").innerText(),"00:00");
 await page.locator("#aoPray435930 [data-tp381-timer-target='5']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-tp381-timer-target='5']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-tp381-timer-control='toggle']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-tp381-timer-control='toggle']").getAttribute("aria-pressed"),"true");
 assert.equal((await snapshot()).index,0,"Starting timer must not advance the prayer");
 await page.waitForTimeout(1250);
 await page.locator("#aoPray435930 [data-tp381-timer-control='toggle']").evaluate(el=>el.click());
 const pausedClock=await page.locator("#aoPray435930 [data-ao-daily-clock-readout]").innerText();
 assert.match(pausedClock,/^00:0[1-9]$/,"Elapsed timer failed to advance");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-timer-control='toggle']").getAttribute("aria-pressed"),"false");
 await page.locator("#aoPray435930 .aoDevoStop").nth(1).evaluate(el=>el.click());
 assert.equal((await snapshot()).index,1);
 assert.equal(await page.locator("#aoPray435930 [data-ao-daily-clock-readout]").innerText(),pausedClock,
  "Paused elapsed session must survive manual navigation");
 await page.locator("#aoPray435930 [data-tp381-timer-control='reset']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-daily-clock-readout]").innerText(),"00:00");
 // One tap substitutes an attested historical prayer in the SAME stage.
 // The full-screen atmospheric DOM, running/paused clock and card reader survive.
 await page.locator("#aoPray435930 .aoDevoStop").nth(6).evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-personal-prayer='faith']").count(),1);
 const alternativeButtons=page.locator("#aoPray435930 [data-ao-personal-prayer='faith'] [data-tp381-personal-variant]");
 assert.ok(await alternativeButtons.count()>=2,"Faith must offer an in-card source switch without opening any settings");
 assert.equal(await page.locator("#aoPray435930 [data-ao-personal-prayer='faith'] .aoDailyPersonalAlternatives").count(),0);
 const beforeAlternative=await page.evaluate(()=>{
  const sky=document.querySelector("#aoPray435930 .aoQuietHorizonCanvas");
  const scroll=document.querySelector("#aoPray435930 .aoDevoCardScroll");
  sky.dataset.preservedAtmosphere="original";
  scroll.dataset.preservedReader="original";
  return {stage:document.querySelector("#aoPray435930 .aoDevoCard")?.dataset.aoDevoIndex,
    source:document.querySelector("#aoPray435930 [data-ao-personal-prayer='faith']")?.dataset.aoPersonalSource,
    sky:document.querySelector("#aoPray435930 [data-ao-quiet-daily-horizon]")?.dataset.aoHorizonPhase,
    stopwatch:document.querySelector("#aoPray435930 [data-ao-daily-clock-readout]")?.textContent,
    hostScroll:document.querySelector("#aoPray435930 .aoP435930Mount")?.scrollTop};
 });
 await alternativeButtons.nth(1).evaluate(el=>el.click());
 const afterAlternative=await page.evaluate(()=>{
  const sky=document.querySelector("#aoPray435930 .aoQuietHorizonCanvas");
  const scroll=document.querySelector("#aoPray435930 .aoDevoCardScroll");
  return {stage:document.querySelector("#aoPray435930 .aoDevoCard")?.dataset.aoDevoIndex,
    source:document.querySelector("#aoPray435930 [data-ao-personal-prayer='faith']")?.dataset.aoPersonalSource,
    sky:document.querySelector("#aoPray435930 [data-ao-quiet-daily-horizon]")?.dataset.aoHorizonPhase,
    stopwatch:document.querySelector("#aoPray435930 [data-ao-daily-clock-readout]")?.textContent,
    hostScroll:document.querySelector("#aoPray435930 .aoP435930Mount")?.scrollTop,
    preservedSky:sky?.dataset.preservedAtmosphere,
    preservedReader:scroll?.dataset.preservedReader,
    activeChoices:[...document.querySelectorAll("#aoPray435930 .aoDailyFormulationPicker button[aria-pressed='true']")].length};
 });
 assert.notEqual(afterAlternative.source,beforeAlternative.source,"One tap must change the source prayer");
 assert.equal(afterAlternative.stage,beforeAlternative.stage,"Source change must not advance to another prayer stage");
 assert.equal(afterAlternative.sky,beforeAlternative.sky,"Source choice must not advance the sunrise");
 assert.equal(afterAlternative.preservedSky,"original","Switching text must keep the immersive atmosphere mounted");
 assert.equal(afterAlternative.preservedReader,"original","Switching text must not remount the scrollable reader");
 assert.equal(afterAlternative.stopwatch,beforeAlternative.stopwatch,"Source choice must not reset the stopwatch");
 assert.equal(afterAlternative.hostScroll,beforeAlternative.hostScroll,"Source choice must not jump the page scroll");
 assert.equal(afterAlternative.activeChoices,1,"Exactly one formulation must be active");
 await page.screenshot({path:resolve(captures,"morning-faith-formulation-switched-390-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 [data-tp381-personal-variant='default:faith']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-personal-prayer='faith']").getAttribute("data-ao-personal-source"),"faith");
 assert.equal(await page.locator("#aoPray435930 .aoQuietHorizonCanvas").getAttribute("data-preserved-atmosphere"),"original");
 await page.locator("#aoPray435930 .aoDevoStop").first().evaluate(el=>el.click());
 const first=await snapshot();
 assert.equal(first.route,"pray.morning_evening");
 // The French 1905 thanksgiving-and-offering witness is sourced and selectable
 // with one tap within the 1913 Morning opening. No second stage or sky reset.
 await page.locator("#aoPray435930 .aoDevoStop").nth(1).evaluate(el=>el.click());
 const morningOpening=page.locator("#aoPray435930 [data-ao-personal-prayer='daily-prayer']");
 assert.equal(await morningOpening.count(),1);
 assert.equal(await morningOpening.locator("[data-tp381-personal-variant='fr-1905-morning-thanks-offering']").count(),0,"Offering is no longer a replacement for the printed complete opening");
 assert.equal(await morningOpening.locator("[data-tp381-personal-purpose='offering:fr-1905-morning-thanks-offering']").count(),1);
 const printedOpeningText=await morningOpening.locator("[data-face-v],.aoTP381Reader").first().innerText();
 assert.equal(await morningOpening.getAttribute("data-ao-personal-source"),"daily-prayer");
 const ambientBefore=await page.evaluate(()=>{
  const sky=document.querySelector("#aoPray435930 .aoQuietHorizonCanvas");
  const card=document.querySelector("#aoPray435930 .aoDevoCardScroll");
  sky.dataset.b07Ambient="same";card.dataset.b07Reader="same";
  return {step:document.querySelector("#aoPray435930 .aoDevoCard")?.dataset.aoDevoIndex,
   horizon:document.querySelector("#aoPray435930 [data-ao-quiet-daily-horizon]")?.dataset.aoHorizonPhase,
   stopwatch:document.querySelector("#aoPray435930 [data-ao-daily-clock-readout]")?.textContent};
 });
 await morningOpening.locator("[data-tp381-personal-purpose='offering:fr-1905-morning-thanks-offering']").evaluate(el=>el.click());
 const ambientAfter=await page.evaluate(()=>({
  step:document.querySelector("#aoPray435930 .aoDevoCard")?.dataset.aoDevoIndex,
  horizon:document.querySelector("#aoPray435930 [data-ao-quiet-daily-horizon]")?.dataset.aoHorizonPhase,
  stopwatch:document.querySelector("#aoPray435930 [data-ao-daily-clock-readout]")?.textContent,
  preservedSky:document.querySelector("#aoPray435930 .aoQuietHorizonCanvas")?.dataset.b07Ambient,
  preservedReader:document.querySelector("#aoPray435930 .aoDevoCardScroll")?.dataset.b07Reader
 }));
 assert.deepEqual([ambientAfter.step,ambientAfter.horizon,ambientAfter.stopwatch],
  [ambientBefore.step,ambientBefore.horizon,ambientBefore.stopwatch],
  "One-tap opening option must keep stage/atmosphere/stopwatch");
 assert.equal(ambientAfter.preservedSky,"same");
 assert.equal(ambientAfter.preservedReader,"same");
 assert.equal(await morningOpening.getAttribute("data-ao-personal-source"),"daily-prayer","The original source ID must be untouched");
 assert.equal(await morningOpening.locator("[data-face-v],.aoTP381Reader").first().innerText(),printedOpeningText,"The printed complete opening must stay verbatim");
 assert.equal(await morningOpening.locator("[data-ao-purpose-source='fr-1905-morning-thanks-offering']").count(),1);
 assert.match(await morningOpening.innerText(),/prière distincte facultative/i,"The second devotion is visibly identified as optional and separate");
 await page.screenshot({path:resolve(captures,"morning-opening-offering-choice-390-fr.png"),animations:"disabled"});
 await morningOpening.locator("[data-tp381-personal-purpose='offering:none']").evaluate(el=>el.click());
 assert.equal(await morningOpening.locator("[data-ao-purpose-source]").count(),0,"The additional purpose prayer must disappear when None is tapped");
 assert.equal(await morningOpening.getAttribute("data-ao-personal-source"),"daily-prayer");
 assert.equal(await morningOpening.locator("[data-face-v],.aoTP381Reader").first().innerText(),printedOpeningText);
 await page.locator("#aoPray435930 .aoDevoStop").first().evaluate(el=>el.click());
 const openingSky=await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").evaluate(el=>({
  mode:el.dataset.aoQuietDailyHorizon,phase:el.dataset.aoHorizonPhase,
  total:el.dataset.aoHorizonTotal,height:el.querySelector(".aoQuietHorizonCanvas")?.getBoundingClientRect().height
 }));
 assert.deepEqual([openingSky.mode,openingSky.phase,openingSky.total],["morning","0","11"]);
 const openingRule=await page.locator("#aoPray435930 [data-ao-personal-settings]").evaluate(el=>{
   const summary=el.querySelector("summary");
   const horizon=document.querySelector("#aoPray435930 [data-ao-quiet-daily-horizon]");
   return {settingsTop:el.getBoundingClientRect().top,horizonTop:horizon.getBoundingClientRect().top,
     summaryVisible:summary.getBoundingClientRect().height>=40,
     label:summary.innerText,open:el.open};
 });
 assert.ok(openingRule.summaryVisible&&openingRule.settingsTop>openingRule.horizonTop&&!openingRule.open,
   "Routine editing belongs below the prayer, not in the main reading path: "+JSON.stringify(openingRule));
 assert.match(openingRule.label,/1913.*FR.*Standard/,"Saved rule identity should be readable at entry");
 assert.ok(openingSky.height>=85&&openingSky.height<=135,
  "Quiet sky must be a minor editorial accent, not the dominant screen: "+JSON.stringify(openingSky));

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
 // Users can read any complete prayer without assembling or editing a rule.
 assert.equal(await page.locator("#aoPray435930 [data-tp381-daily-mode='list']").count(),1,"Direct prayer index must be visible at the top");
 const preferencesBeforeBrowsing=await page.evaluate(()=>localStorage.getItem("ao.pray.personal-rule.v1"));
 await page.locator("#aoPray435930 [data-tp381-daily-mode='list']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-daily-prayer-catalog]").count(),1);
 assert.equal(await page.locator("#aoPray435930 [data-ao-daily-prayer-catalog] [data-tp381-direct-prayer]").count()>10,true,"All original complete St Pius X prayers must be directly accessible");
 assert.equal(await page.locator("#aoPray435930 [data-ao-daily-prayer-catalog] [data-tp381-direct-prayer='daily-prayer']").count(),1);
 const otherPrayers=page.locator("#aoPray435930 .aoDailyCatalogAdditional");
 assert.equal(await otherPrayers.count(),1,"Historical prayers must be in the direct index");
 await otherPrayers.locator("summary").evaluate(el=>el.click());
 assert.equal(await otherPrayers.evaluate(el=>el.open),true);
 const scrollCheck=await page.locator("#aoPray435930 .aoP435930Mount").evaluate(el=>{
  const extent=el.scrollHeight-el.clientHeight;
  el.scrollTop=Math.min(extent,600);
  return {extent,moved:el.scrollTop,overflow:getComputedStyle(el).overflowY};
 });
 assert.ok(scrollCheck.extent>500&&scrollCheck.moved>100&&scrollCheck.overflow==="auto",
  "Expanded prayer index must scroll naturally on the main Prayer surface: "+JSON.stringify(scrollCheck));
 const optionalPrayer=await otherPrayers.locator("[data-tp381-direct-prayer]").first().getAttribute("data-tp381-direct-prayer");
 await otherPrayers.locator("[data-tp381-direct-prayer]").first().evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-personal-prayer='"+optionalPrayer+"']").count(),1,
  "Direct optional prayer must render complete source text without being added to routine");
 assert.equal(await page.locator("#aoPray435930 .aoDevoStop").count(),2,"Individual prayer must use a single complete card and finish step");
 assert.equal(await page.evaluate(()=>localStorage.getItem("ao.pray.personal-rule.v1")),preferencesBeforeBrowsing,
  "Opening a historical prayer cannot silently edit saved rules");
 await page.locator("#aoPray435930 [data-tp381-daily-mode='list']").evaluate(el=>el.click());
 await page.locator("#aoPray435930 [data-tp381-direct-prayer='daily-prayer']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-personal-prayer='daily-prayer']").count(),1);
 const individualScroll=await page.locator("#aoPray435930 .aoDevoCardScroll").evaluate(el=>{
  const extent=el.scrollHeight-el.clientHeight;
  el.scrollTop=Math.min(extent,160);
  return {extent,moved:el.scrollTop,overflow:getComputedStyle(el).overflowY,touchAction:getComputedStyle(el).touchAction};
 });
 assert.equal(individualScroll.overflow,"auto","Individual prayer text needs its own scrollable region");
 assert.match(individualScroll.touchAction,/pan-y/,"Vertical touch reading must be enabled");
 if(individualScroll.extent>5)assert.ok(individualScroll.moved>0,"Long individual prayer did not scroll: "+JSON.stringify(individualScroll));
 await page.locator("#aoPray435930 [data-tp381-daily-mode='list']").evaluate(el=>el.click());
 await page.locator("#aoPray435930 [data-tp381-daily-mode='guided']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"11","Return to full guided prayer without source changes");
 // Curated Personal Brief has full sourced cards but a shorter horizon.
 await page.locator("#aoPray435930 [data-ao-personal-settings] summary").evaluate(el=>el.click());
 await page.locator("#aoPray435930 [data-tp381-personal-action='length'][data-tp381-personal-value='brief']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"6","1913 Morning Brief has six whole prayers");
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-phase"),"0","Brief sunrise starts at predawn");
 assert.match(await page.locator("#aoPray435930 [data-ao-personal-settings] summary").innerText(),/Brève personnelle/);
 assert.match(await page.locator("#aoPray435930 .aoDailyPersonalSettingsBody > .aoDailyPersonalNote").innerText(),/non une édition courte historique/);
 const morningHail=page.locator("#aoPray435930 [data-tp381-personal-action='brief-toggle'][data-tp381-personal-value='hail-mary']");
 assert.equal(await morningHail.getAttribute("aria-pressed"),"true");
 await morningHail.evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"5","Removing an entire Morning prayer changes the sky horizon denominator");
 assert.equal(await morningHail.getAttribute("aria-pressed"),"false");
 const morningCreed=page.locator("#aoPray435930 [data-tp381-personal-action='brief-toggle'][data-tp381-personal-value='creed']");
 await morningCreed.evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"6","Adding a different complete source prayer restores six cards");
 assert.equal(await morningCreed.getAttribute("aria-pressed"),"true");
 assert.ok(await page.locator("#aoPray435930 [data-tp381-personal-action='brief-reset']").count()===1,"Customized Brief requires restore-suggestion button");
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844});
  const geometry=await page.locator("#aoPray435930 .aoDailyPersonalBriefList").evaluate(el=>{
   const r=el.getBoundingClientRect(),p=el.closest(".aoDailyPersonalSettingsBody").getBoundingClientRect();
   return {left:r.left,right:r.right,panelLeft:p.left,panelRight:p.right,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};
  });
  assert.ok(geometry.right<=width+2&&geometry.left>=-2&&geometry.scrollWidth<=geometry.clientWidth+2,
   "Brief editor cannot overflow "+width+"px: "+JSON.stringify(geometry));
  if(width===320||width===1440)await page.screenshot({path:resolve(captures,"brief-editor-"+width+"-fr.png"),animations:"disabled"});
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator("#aoPray435930 [data-tp381-personal-action='brief-reset']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-tp381-personal-action='brief-toggle'][data-tp381-personal-value='hail-mary']").getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"6","Restoring suggestions uses complete historical prayers");

 await page.locator("#aoPray435930 .aoDevoStop").nth(6).evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-phase"),"4","Brief Morning must reach daylight at final stage");
 await page.locator("#aoPray435930 [data-tp381-personal-action='length'][data-tp381-personal-value='full']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"11","Full Morning St Pius X must be restored without text loss");
 assert.equal((await snapshot()).index,0,"Switching from Brief restarts from the first original prayer");
 await page.locator("#aoPray435930 [data-ao-personal-settings] summary").evaluate(el=>el.click());
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
 await page.locator("#aoPray435930 .aoDevoStop").nth(6).evaluate(b=>b.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-phase"),"2",
  "Morning atmosphere must evolve with the actual prayer cursor");
 await page.locator("#aoPray435930 .aoDevoStop").nth(11).evaluate(b=>b.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-phase"),"4");
 await page.screenshot({path:resolve(captures,"morning-daylight-390-fr.png"),animations:"disabled"});

 // Switching dayparts preserves the source sequence and resets the card cursor.
 await page.locator("#aoPray435930 [data-tp381-daypart='evening']").evaluate(b=>b.click());
 await page.screenshot({path:resolve(captures,"evening-390-fr.png"),animations:"disabled"});
 const evening=await snapshot();
 assert.equal(evening.index,0);assert.equal(evening.kind,"daily");
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-quiet-daily-horizon"),"evening");
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"10");
 await page.locator("#aoPray435930 .aoDevoStop").nth(7).evaluate(b=>b.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-phase"),"3",
  "Evening atmosphere must pass from blue hour to nightfall");
 await page.locator("#aoPray435930 .aoDevoStop").nth(10).evaluate(b=>b.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-phase"),"4");
 await page.screenshot({path:resolve(captures,"evening-night-390-fr.png"),animations:"disabled"});


 // Personal rule: full St Pius X order and source-owned flexibility are
 // integrated into this same live dual-axis reader, not a second app.
 await page.locator("#aoPray435930 [data-ao-personal-settings] summary").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-tp381-personal-action='edition'][data-tp381-personal-value='1913']").getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-personal-action='language'][data-tp381-personal-value='fr']").getAttribute("aria-pressed"),"true");
 const extras=page.locator("#aoPray435930 [data-tp381-personal-action='extra']");
 assert.ok(await extras.count()>=10,"French evening must have sourced optional complete prayers");
 const firstExtra=await extras.first().getAttribute("data-tp381-personal-value");
 await extras.first().evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-personal-settings]").evaluate(el=>el.open),true,"Customizer should stay open across saved choices");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-personal-action='mode'][data-tp381-personal-value='expanded']").getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"11","Selected complete extra appended once");
 assert.equal((await snapshot()).index,11,"Adding an evening prayer must preserve completion, not restart the sequence");
 await page.locator("#aoPray435930 [data-tp381-personal-action='language'][data-tp381-personal-value='la']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"10","French-only extra must never appear as a Latin translation");
 const latinOffice=page.locator("#aoPray435930 [data-tp381-personal-action='extra'][data-tp381-personal-value^='roman-compline-latin-']");
 assert.equal(await latinOffice.count(),3,"Latin Evening Prayer must offer three source-backed night texts without foreign-language fallbacks");
 const inManus=page.locator("#aoPray435930 [data-tp381-personal-action='extra'][data-tp381-personal-value='roman-compline-latin-in-manus']");
 await inManus.evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"11","Latin optional Compline responsory must add exactly one card");
 await inManus.evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"10","Deselecting the Compline excerpt restores the printed core count");
 await page.locator("#aoPray435930 [data-tp381-personal-action='language'][data-tp381-personal-value='en']").evaluate(el=>el.click());
 const englishInManus=page.locator("#aoPray435930 [data-tp381-personal-action='extra'][data-tp381-personal-value='baltimore-1889-evening-in-manus']");
 assert.equal(await englishInManus.count(),1,"Historically attested English responsory must appear once and only in English");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-personal-action='extra'][data-tp381-personal-value='roman-compline-latin-in-manus']").count(),0,"Latin Office text cannot be silently labelled English");
 await englishInManus.evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"11","English historical responsory must be a complete optional card");
 await page.locator("#aoPray435930 .aoDevoStop").nth(10).evaluate(el=>el.click());
 assert.match(await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText(),/Thou hast redeemed us, O Lord, God of truth/);
 assert.match(await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText(),/non l’office entier|not the complete Office/);
 await englishInManus.evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"10","Removing English responsory restores baseline without residual stage");

 assert.equal(await page.locator("#aoPray435930 [data-tp381-personal-action='edition'][data-tp381-personal-value='1905']").evaluate(el=>el.click()),undefined);
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"8","1905 printed evening order must be distinct");
 await page.locator("#aoPray435930 [data-tp381-personal-action='length'][data-tp381-personal-value='brief']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"4","1905 Evening Brief cannot invent a 1905 examen stage");
 await page.locator("#aoPray435930 [data-tp381-personal-action='length'][data-tp381-personal-value='full']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"8","1905 source sequence must be restored");
 await page.locator("#aoPray435930 [data-tp381-personal-action='reset']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"10","Reset restores the 1913 evening order");
 await page.locator("#aoPray435930 [data-tp381-personal-action='length'][data-tp381-personal-value='brief']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"5","1913 Evening Brief retains the guided examen");
 await page.locator("#aoPray435930 [data-tp381-personal-action='brief-toggle'][data-tp381-personal-value='hail-mary']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"4","Evening Brief selection independent of Morning");
 await page.locator("#aoPray435930 [data-tp381-personal-action='language'][data-tp381-personal-value='fr']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-tp381-personal-action='brief-toggle'][data-tp381-personal-value='hail-mary']").getAttribute("aria-pressed"),"false","Brief selection persists across source language changes");
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"4");
 await page.locator("#aoPray435930 [data-tp381-personal-action='brief-reset']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"5");

 await page.locator("#aoPray435930 .aoDevoStop").nth(3).evaluate(el=>el.click());
 assert.match(await page.locator("#aoPray435930 .aoTP381GuideCard").innerText(),/Examen|examination|conscience/i);
 await page.locator("#aoPray435930 [data-tp381-personal-action='length'][data-tp381-personal-value='full']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"10","1913 printed Evening must remain intact after Brief");
 const saved=await page.evaluate(()=>localStorage.getItem("ao.pray.personal-rule.v1"));
 assert.ok(saved&&saved.includes('"edition":"1913"')&&!saved.includes("De profundis"));
 // Confession is a separate, existing source-owned four-phase reader.
 // The optional Act changes the written preparatory prayer, never the priest's rite.
 const confessionOpen=await page.evaluate(()=>globalThis.AO_MODULES.open("pray.confession"));
 assert.equal(confessionOpen?.ok,true,"Native sacramental Confession route unavailable");
 await page.waitForSelector("#aoPray435930 .aoP435930ConfPathCards",{timeout:10000});
 assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-path]").count(),3,
   "Keep all three different Confession preparation paths");
 await page.locator("#aoPray435930 [data-p435930-conf-path='regular']").evaluate(el=>el.click());
 await page.locator("#aoPray435930 [data-p435930-conf-step='2']").evaluate(el=>el.click());
 await page.waitForSelector("#aoPray435930 .aoDevoStop",{timeout:10000});
 assert.equal(await page.locator("#aoPray435930 .aoDevoStop").count(),3);
 await page.locator("#aoPray435930 .aoDevoStop").nth(2).evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-conf-contrition-picker] button").count(),2);
 assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-contrition='standard']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-p435930-conf-contrition='piusx']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-contrition='piusx']").getAttribute("aria-pressed"),"true");
 assert.match(await page.locator("#aoPray435930 [data-ao-confession-act]").innerText(),/bonté souveraine|bonté.*souveraine/i,
  "Confession must display pre-existing Pius X editorial French prayer");
 assert.match(await page.locator("#aoPray435930 [data-ao-conf-contrition-source-status]").innerText(),/éditoriale|éditorial/i);
 const confState=await page.evaluate(()=>globalThis.AO_PRAY_V435930.state());
 assert.equal(confState.confessionStage,2);
 assert.equal(confState.confessionPath,"regular");
 await page.setViewportSize({width:320,height:720});
 const confChoiceWidth=await page.locator("#aoPray435930 [data-ao-conf-contrition-picker]").evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));
 assert.ok(confChoiceWidth.scroll<=confChoiceWidth.client+2,"320px Confession contrition choices overflow");
 await page.screenshot({path:resolve(captures,"confession-contrition-piusx-320-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 [data-p435930-conf-contrition='standard']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-contrition='standard']").getAttribute("aria-pressed"),"true");
 await page.setViewportSize({width:390,height:844});
 await page.locator("#aoPray435930 [data-p435930-conf-step='1']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-conf-contrition-picker]").count(),0,"Confession source chooser must not interrupt commandment examination");
 await open("pray.nightly_examen");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-examen-contrition-open]").count(),1,
  "Standalone nightly reader must expose its closing Act directly");
 await page.locator("#aoPray435930 [data-tp381-examen-contrition-open]").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"resolve","Nightly closing prayer shortcut changed the examination structure");
 assert.equal(await page.locator("#aoPray435930 [data-ao-examen-contrition-choices] button").count(),2);
 await page.locator("#aoPray435930 .aoDevoStop").nth(4).evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-contrition='standard']").count(),1,"Ordinary contrition choice missing");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-contrition='piusx']").count(),1,"1905 Pius X source choice missing");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-contrition='standard']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-tp381-b01-contrition='piusx']").evaluate(el=>el.click());
 assert.match(await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText(),/souveraine.*aime|bonté souveraine/i,"Pius X French editorial act missing");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-contrition='piusx']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-tp381-b01-contrition='standard']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-contrition='standard']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 .aoDevoStop").nth(0).evaluate(el=>el.click());
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
 // Holy Name and Meal Prayers reuse precisely the same in-card gesture model.
 await page.setViewportSize({width:390,height:844});
 await open("pray.holy_name_litany");
 await page.waitForSelector("#aoPray435930 .aoDevoParagraph[data-ao-devo-active='true']",{timeout:12000});
 const holy=await snapshot();
 assert.equal(holy.kind,"holyName");assert.equal(holy.index,0);assert.equal(holy.stops,7);
 assert.equal(holy.active,1);assert.equal(holy.overflow,"auto");
 assert.ok(holy.paragraphCount>=2,"Litany still lacks individual active prayer lines");
 assert.match(await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText(),/Jésus|Seigneur/);
 assert.equal(await page.locator("#aoPray435930 [data-ao-holy-name-options]").evaluate(el=>el.open),false);
 await page.screenshot({path:resolve(captures,"holy-name-390-fr.png"),animations:"disabled"});
 await swipe(5,-145);assert.equal((await snapshot()).index,0);
 await swipe(-160,5);assert.equal((await snapshot()).index,1);
 await page.locator("#aoPray435930 [data-tp381-flip]").evaluate(b=>b.click());
 assert.equal(await page.locator("#aoPray435930 [data-face-la]").isVisible(),true);
 assert.equal(await page.locator("#aoPray435930 [data-face-v]").isVisible(),false);
 await open("pray.meal_prayers");
 const beforeMeal=await snapshot();
 assert.equal(beforeMeal.kind,"meals");assert.equal(beforeMeal.stops,2);
 assert.equal(beforeMeal.id,"meal-before");assert.equal(beforeMeal.active,1);
 await page.screenshot({path:resolve(captures,"meal-before-390-fr.png"),animations:"disabled"});
 await swipe(-155,3);
 const afterMeal=await snapshot();assert.equal(afterMeal.index,1);assert.equal(afterMeal.id,"meal-after");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-meal='short']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-tp381-b01-meal='full']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"meal-after","Historical Grace must not change the two-card timeline identity");
 assert.match(await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText(),/Daignez, Seigneur, récompenser.*vie éternelle/s,"Complete 1888 editorial French grace unavailable");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-meal='full']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-tp381-b01-meal='catechism']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"meal-after");
 assert.match(await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText(),/Nous vous rendons grâce pour tous vos bienfaits/,"Historical short Baltimore Catechism alternative missing");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-meal='catechism']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-tp381-b01-meal='short']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"meal-after");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-b01-meal='short']").getAttribute("aria-pressed"),"true");
 await page.screenshot({path:resolve(captures,"meal-after-390-fr.png"),animations:"disabled"});
 await page.setViewportSize({width:320,height:720});
 assert.equal((await snapshot()).overflow,"auto","Meals do not fit narrow local card");
 const mealLabels=await page.locator("#aoPray435930 .aoDevoSequenceTimeline .aoDevoStop")
   .evaluateAll(nodes=>{
     const track=nodes[0]?.parentElement?.getBoundingClientRect();
     return nodes.map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,
       trackLeft:track?.left,trackRight:track?.right}));
   });
 assert.equal(mealLabels.length,2,"Both meal prayer timeline stops must remain present");
 assert.ok(mealLabels.every(x=>x.left>=x.trackLeft-1&&x.right<=x.trackRight+1),
   "A 320px phone clipped one of two meal prayer stop titles: "+JSON.stringify(mealLabels));
 await page.screenshot({path:resolve(captures,"meal-after-320-fr.png"),animations:"disabled"});
 // Sacred Heart and Communion must render the same named-card reader, not a catalogue of duplicate texts.
 await page.setViewportSize({width:390,height:844});
 await open("pray.sacred_heart");
 const heart=await snapshot();
 assert.equal(heart.route,"pray.sacred_heart");
 assert.equal(heart.kind,"sacredHeart");assert.equal(heart.stops,4);assert.equal(heart.active,1);
 assert.equal(heart.id,"heart-litany");assert.equal(heart.overflow,"auto");
 assert.ok(heart.paragraphCount>=20,"Sacred Heart litany lost line-by-line reading focus");
 assert.equal(await page.locator("#aoPray435930 [data-ao-heart-options]").evaluate(el=>el.open),false);
 assert.equal(await page.locator("#aoPray435930 [data-ao-heart-direct-choices]").count(),1);
 assert.equal(await page.locator("#aoPray435930 .aoHeartChoiceGrid [data-tp381-heart]").count(),4,
   "The original four devotional purposes must remain direct and visible");
 assert.equal(await page.locator("#aoPray435930 .aoHeartChoiceGrid [aria-pressed='true']").count(),1);
 assert.match(await page.locator("#aoPray435930 [data-ao-heart-selected-context]").innerText(),/invocations|invocation/i);
 assert.equal(await page.locator("#aoPray435930 [data-ao-heart-related-direct] [data-tp381-prayer='devotion_consecration_christ_king']").count(),1,
   "Distinct Christ-the-King dedication must be reachable without opening source settings");
 await page.locator("#aoPray435930 [data-tp381-heart='golden_arrow']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"heart-golden_arrow","Visible Golden Arrow selection chose a different Sacred Heart devotion");
 assert.match(await page.locator("#aoPray435930 [data-ao-heart-selected-context]").innerText(),/1884/);
 await page.locator("#aoPray435930 [data-tp381-heart='litany']").evaluate(el=>el.click());
 await page.screenshot({path:resolve(captures,"sacred-heart-litany-390-fr.png"),animations:"disabled"});
 await swipe(0,-146);
 assert.equal((await snapshot()).id,"heart-litany","Vertical Sacred Heart reading advanced a card");
 await swipe(-165,5);
 assert.equal((await snapshot()).id,"heart-reparation","Sacred Heart horizontal swipe skipped a stage");
 await page.locator("#aoPray435930 .aoDevoStop").nth(2).evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"heart-golden_arrow");
 assert.ok((await page.locator("#aoPray435930 .aoTP381Reader").innerText()).includes(GOLDEN_ARROW_REPARATION_V1.fr.slice(0,55)),"Historical French Golden Arrow unavailable");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-flip]").count(),0,"No invented Latin Golden Arrow");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-heart='golden_arrow']").count(),1);
 await page.locator("#aoPray435930 .aoDevoStop").nth(3).evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"heart-consecration");
 assert.equal(await page.locator("#aoPray435930 .aoDevoSequenceTimeline [aria-current='step']").count(),1);
 assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>150,"Consecration text missing");
 await page.locator("#aoPray435930 [data-tp381-flip]").first().evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-face-la]").isVisible(),true);
 await page.screenshot({path:resolve(captures,"sacred-heart-consecration-la-390.png"),animations:"disabled"});
 await page.locator("#aoPray435930 [data-ao-heart-related-direct] [data-tp381-prayer='devotion_consecration_christ_king']").evaluate(el=>el.click());
 assert.match(await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText(),/Christ|Roi/i,
   "Separate canonical dedication was not opened directly");
 await page.locator("#aoPray435930 [data-tp381-back]").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"heart-consecration","Related dedication did not return to its original Heart devotion");
 await page.setViewportSize({width:320,height:720});
 await page.screenshot({path:resolve(captures,"sacred-heart-direct-320-fr.png"),animations:"disabled"});
 const heartGridBounds=await page.locator("#aoPray435930 .aoHeartChoiceGrid").evaluate(el=>({
  client:el.clientWidth,scroll:el.scrollWidth,buttons:[...el.querySelectorAll('button')].map(b=>b.getBoundingClientRect().width)
 }));
 assert.ok(heartGridBounds.scroll<=heartGridBounds.client+2,"320px Sacred Heart direct choices overflowed the reader");
 assert.ok(heartGridBounds.buttons.every(w=>w>80),"320px heart choices collapsed");
 await page.setViewportSize({width:390,height:844});
 await open("pray.holy_name_litany");
 await page.locator("#aoPray435930 [data-tp381-golden-arrow]").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"heart-golden_arrow","Holy Name shortcut must directly open the Golden Arrow, not the Litany");
 assert.equal((await snapshot()).stops,4,"Golden Arrow deep link changed the four named Heart reader stages");
 await open("pray.communion_treasury");
 const before=await snapshot();
 assert.equal(before.route,"pray.communion_treasury");
 assert.equal(before.kind,"communion");assert.equal(before.stops,7);
 assert.equal(before.id,"communion-before-sacrament_come_holy_spirit");
 assert.equal(before.overflow,"auto");assert.equal(before.active,1);
 assert.equal(await page.locator("#aoPray435930 [data-ao-communion-options]").evaluate(el=>el.open),false);
 assert.equal(await page.locator("#aoPray435930 [data-ao-communion-direct-picker]").count(),0,"A direct Communion prayer choice must not be hidden under a catalogue");
 const beforePicker=page.locator("#aoPray435930 [data-ao-communion-purpose-picker='before']");
 assert.equal(await beforePicker.count(),1);
 assert.equal(await beforePicker.locator("[data-tp381-communion-purpose]").count(),3);
 assert.equal(await beforePicker.locator("[data-tp381-communion-source='sacrament_come_holy_spirit']").count(),1);
 await page.screenshot({path:resolve(captures,"communion-before-390-fr.png"),animations:"disabled"});
 const beforeIds=["sacrament_come_holy_spirit","foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love","sacrament_act_of_contrition","beforeThomas","beforeAmbrose"];
 for(let i=0;i<beforeIds.length;i++){
  await page.locator("#aoPray435930 .aoDevoStop").nth(i).evaluate(el=>el.click());
  const stage=await snapshot();
  assert.equal(stage.id,"communion-before-"+beforeIds[i],"Wrong Communion preparation prayer on step "+i);
  assert.equal(stage.active,1);
  assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>30,"Empty canonical preparation text "+beforeIds[i]);
 }
 // B09: one-tap source choices, with distinct Acts kept distinct.
 await page.locator("#aoPray435930 [data-tp381-communion-purpose='disposition']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-before-foundations_act_of_faith");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-communion-source]").count(),4);
 await page.locator("#aoPray435930 [data-tp381-communion-source='foundations_act_of_hope']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-before-foundations_act_of_hope");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-communion-source='foundations_act_of_hope']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-tp381-communion-purpose='approach']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-before-beforeThomas");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-communion-source]").count(),2);
 await page.locator("#aoPray435930 [data-tp381-communion-source='beforeAmbrose']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-before-beforeAmbrose");
 assert.equal(await page.locator("#aoPray435930 [data-ao-communion-purpose-picker='before']").getAttribute("data-ao-active-purpose"),"approach");
 assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>300,"Complete St Ambrose prayer retained");
 await page.screenshot({path:resolve(captures,"communion-before-purpose-ambrose-390-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 [data-tp381-communion-purpose='disposition']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-before-foundations_act_of_hope","Returning to a purpose must recall the user's selected complete prayer");
 const selectedSource=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao.pray.communion-purpose.v1")||"{}"));
 assert.equal(selectedSource.before.approach,"beforeAmbrose");
 assert.equal(selectedSource.before.disposition,"foundations_act_of_hope");
 await page.locator("#aoPray435930 [data-tp381-communion='after']").evaluate(el=>el.click());
 const after=await snapshot();
 assert.equal(after.stops,4);assert.equal(after.index,0);
 assert.equal(after.id,"communion-after-adoration_anima_christi");
 await page.screenshot({path:resolve(captures,"communion-after-390-fr.png"),animations:"disabled"});
 const afterIds=["adoration_anima_christi","afterThomas","afterBonaventure","enEgo"];
 for(let i=0;i<afterIds.length;i++){
  await page.locator("#aoPray435930 .aoDevoStop").nth(i).evaluate(el=>el.click());
  const stage=await snapshot();
  assert.equal(stage.id,"communion-after-"+afterIds[i]);
  assert.equal(stage.active,1);
  assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>30,"Missing canonical thanksgiving "+afterIds[i]);
 }
 // Separate the thanksgiving act, Christ-centred prayers and En ego.
 const afterPicker=page.locator("#aoPray435930 [data-ao-communion-purpose-picker='after']");
 assert.equal(await afterPicker.locator("[data-tp381-communion-purpose]").count(),3);
 await page.locator("#aoPray435930 [data-tp381-communion-purpose='union']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-after-adoration_anima_christi");
 await page.locator("#aoPray435930 [data-tp381-communion-source='afterBonaventure']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-after-afterBonaventure");
 assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>250);
 await page.screenshot({path:resolve(captures,"communion-after-purpose-bonaventure-390-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 [data-tp381-communion-purpose='thanksgiving']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-after-afterThomas","Real thanksgiving text cannot be conflated with En ego");
 await page.locator("#aoPray435930 [data-tp381-communion-purpose='crucifix']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"communion-after-enEgo");
 await swipe(5,-135);
 assert.equal((await snapshot()).id,"communion-after-enEgo","Vertical scroll changed Communion prayer");
 await page.setViewportSize({width:320,height:720});
 assert.equal((await snapshot()).overflow,"auto");
 await page.screenshot({path:resolve(captures,"communion-after-320-fr.png"),animations:"disabled"});
 // Hymns: original French source lines are unchanged and one named hymn is
 // active, with vertical lines and single-step horizontal navigation.
 await page.setViewportSize({width:390,height:844});
 await open("pray.sacred_hymns");
 let hymn=await snapshot();
 assert.equal(hymn.kind,"hymns");assert.equal(hymn.route,"pray.sacred_hymns");
 assert.equal(hymn.stops,11);assert.equal(hymn.active,1);
 assert.equal(hymn.id,"hymn-te_deum");assert.equal(hymn.overflow,"auto");
 assert.ok(hymn.paragraphCount>20,"Te Deum has no line-level focus");
 assert.equal(await page.locator("#aoPray435930 [data-ao-hymn-options]").evaluate(x=>x.open),false,
  "Hymn introduction and three language controls crowd the prayer card");
 // B16: three principal sources are visible immediately, while all eight
 // seasonal Office recensions remain secondary and independently sourced.
 const coreHymns=page.locator("#aoPray435930 [data-ao-hymns-direct] [data-tp381-hymn]");
 assert.equal(await coreHymns.count(),3,"Exactly three principal hymns should be visible before source text");
 assert.equal(await coreHymns.first().getAttribute("aria-pressed"),"true");
 await coreHymns.nth(1).evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"hymn-veni_creator","Direct hymn did not open its canonical prayer card");
 assert.equal(await coreHymns.nth(1).getAttribute("aria-pressed"),"true");
 const seasonalHymns=page.locator("#aoPray435930 [data-ao-hymn-catalogue] [data-tp381-hymn]");
 assert.equal(await seasonalHymns.count(),8,"Historical seasonal Office hymns were dropped from the catalogue");
 await page.locator("#aoPray435930 [data-ao-hymn-catalogue] > summary").evaluate(el=>el.click());
 await seasonalHymns.first().evaluate(el=>el.click());
 assert.match((await snapshot()).id,/^hymn-/,"Seasonal choice lost the original hymn reader");
 await coreHymns.first().evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"hymn-te_deum","Principal hymn return was not exact");
 await page.screenshot({path:resolve(captures,"hymns-te-deum-390-fr.png"),animations:"disabled"});
 const sourceLineation=x=>String(x).split("\n").map(y=>y.trim()).filter(Boolean).join("\n");
 const renderedLines=async selector=>page.locator(selector+" .aoTP381TextParagraph").evaluateAll(nodes=>nodes.map(x=>x.textContent.trim()).filter(Boolean).join("\n"));
 const frame="#aoPray435930 .aoDevoCardScroll";
 const keys=["te_deum","veni_creator","ave_maris_stella"];
 for(let i=0;i<keys.length;i++){
  await page.locator("#aoPray435930 .aoDevoStop").nth(i).evaluate(b=>b.click());
  hymn=await snapshot();
  assert.equal(hymn.id,"hymn-"+keys[i]);
  assert.equal(hymn.active,1);
  assert.equal(await renderedLines(frame+" [data-face-v]"),sourceLineation(SACRED_HYMNS_V381[keys[i]].fr),
    "Original French hymn verse wording/line order changed: "+keys[i]);
  await page.locator("#aoPray435930 [data-tp381-flip]").evaluate(b=>b.click());
  assert.equal(await page.locator(frame+" [data-face-la]").isVisible(),true);
  assert.equal(await renderedLines(frame+" [data-face-la]"),sourceLineation(SACRED_HYMNS_V381[keys[i]].la),
    "Original Latin hymn witness changed: "+keys[i]);
 }
 await page.screenshot({path:resolve(captures,"hymns-ave-maris-stella-la-390.png"),animations:"disabled"});
 await page.locator("#aoPray435930 .aoDevoStop").first().evaluate(x=>x.click());
 await swipe(6,-135);
 assert.equal((await snapshot()).id,"hymn-te_deum","Vertical hymn scroll changed the card");
 await swipe(-175,4);
 assert.equal((await snapshot()).id,"hymn-veni_creator","Hymn horizontal swipe skipped a source chapter");
 await page.locator("#aoPray435930 [data-ao-hymn-options] > summary").evaluate(b=>b.click());
 await page.locator("#aoPray435930 [data-tp381-hymn-lang='en']").evaluate(b=>b.click());
 assert.equal(await renderedLines(frame+" [data-face-v]"),sourceLineation(SACRED_HYMNS_V381.veni_creator.en),
  "English hymn witness was changed or language selector failed");
 await page.locator("#aoPray435930 [data-ao-hymn-options] > summary").evaluate(b=>b.click());
 await page.locator("#aoPray435930 [data-tp381-hymn-lang='la']").evaluate(b=>b.click());
 assert.equal(await renderedLines(frame+" .aoTP381Reader"),sourceLineation(SACRED_HYMNS_V381.veni_creator.la),
  "Explicit Latin reading is not using the original hymn witness");
 await page.setViewportSize({width:320,height:720});
 assert.equal((await snapshot()).overflow,"auto","320px hymn card lost local reading scroll");
 await page.screenshot({path:resolve(captures,"hymns-veni-creator-la-320.png"),animations:"disabled"});
 // Good Death is a choice of private prayers, NOT a bedside sacramental
 // checklist; a direct urgent route to a priest-first companion stays visible.
 await page.setViewportSize({width:390,height:844});
 await open("pray.good_death");
 const death=await snapshot();
 assert.equal(death.route,"pray.good_death");assert.equal(death.kind,"goodDeath");
 assert.equal(death.stops,9);assert.equal(death.id,"good-death-devotion_litany_st_joseph");
 assert.equal(death.active,1);assert.equal(death.overflow,"auto");
 assert.ok(death.paragraphCount>0,"Good Death source prayer has no paragraph focus");
 assert.equal(await page.locator("#aoPray435930 [data-ao-good-death-options]").evaluate(el=>el.open),false,
   "Pastoral notes obscured the actual Good Death prayer");
 assert.equal(await page.locator("#aoPray435930 [data-tp381-route='pray.dying_companion']").isVisible(),true,
   "Someone dying now has no visible entry to the priest-first bedside guide");
 await page.screenshot({path:resolve(captures,"good-death-joseph-390-fr.png"),animations:"disabled"});
 // B11: one-tap source selection by devotional purpose with original 9-card
 // reader unchanged. Distinct acts stay distinct, and choices are remembered.
 const goodDeathPicker=page.locator("#aoPray435930 [data-ao-good-death-purpose-picker]");
 assert.equal(await goodDeathPicker.count(),1);
 assert.equal(await goodDeathPicker.locator("[data-tp381-good-death-purpose]").count(),5);
 assert.equal(await goodDeathPicker.locator("[data-tp381-good-death-source]").count(),3);
 assert.equal(await page.locator("#aoPray435930 [data-tp381-joseph-edition='1909']").getAttribute("aria-pressed"),"true");
 await page.locator("#aoPray435930 [data-tp381-good-death-source='devotion_memorare_st_joseph']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"good-death-devotion_memorare_st_joseph");
 assert.equal((await snapshot()).stops,9,"Direct selection invented an extra Good Death stage");
 await page.locator("#aoPray435930 [data-tp381-good-death-purpose='virtues']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"good-death-foundations_act_of_faith");
 await page.locator("#aoPray435930 [data-tp381-good-death-source='foundations_act_of_hope']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"good-death-foundations_act_of_hope");
 await page.locator("#aoPray435930 [data-tp381-good-death-purpose='joseph']").evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"good-death-devotion_memorare_st_joseph",
   "Returning to St Joseph did not recall the previously selected canonical prayer");
 await page.locator("#aoPray435930 [data-tp381-good-death-source='devotion_litany_st_joseph']").evaluate(el=>el.click());
 assert.equal((await snapshot()).index,0);
 assert.equal(await page.locator("#aoPray435930 [data-tp381-joseph-edition='1909']").getAttribute("aria-pressed"),"true",
   "Source choice must not silently change the historical St Joseph litany edition");
 await page.screenshot({path:resolve(captures,"good-death-direct-purposes-390-fr.png"),animations:"disabled"});
 await swipe(6,-150);
 assert.equal((await snapshot()).index,0,"Good Death vertical reading leaked into card navigation");
 await swipe(-175,4);
 assert.equal((await snapshot()).index,1,"Good Death horizontal swipe skipped an original prayer");
 const deathIds=["devotion_litany_st_joseph","devotion_ad_te_beate_ioseph","devotion_memorare_st_joseph",
   "foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love",
   "sacrament_act_of_contrition","foundations_hail_mary","aspirations"];
 for(let i=0;i<deathIds.length;i++){
   await page.locator("#aoPray435930 .aoDevoStop").nth(i).evaluate(el=>el.click());
   const st=await snapshot();
   assert.equal(st.id,"good-death-"+deathIds[i],"Wrong original prayer at Good Death chapter "+i);
   assert.equal(st.active,1,"Good Death timeline has competing active stages");
   assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>24,
     "Good Death stage has missing source text: "+deathIds[i]);
 }
 await page.setViewportSize({width:320,height:720});
 assert.equal((await snapshot()).overflow,"auto","Narrow Good Death card no longer scrolls locally");
 await page.screenshot({path:resolve(captures,"good-death-aspirations-320-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 [data-tp381-route='pray.dying_companion']").evaluate(el=>el.click());
 await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")
   ?.dataset.aoTraditionalPrayRoute==="pray.dying_companion",null,{timeout:8000});
 assert.match(await page.locator("#aoPray435930 .aoTP381Section").first().innerText(),
   /Appelez un prêtre maintenant|Call a priest now/,
   "Bedside destination no longer puts obtaining a priest first");
 // Urgent bedside companion is separate from ordinary Good Death devotion.
 // The first card MUST display priest-first action before any guided prayer.
 const dying=await snapshot();
 assert.equal(dying.route,"pray.dying_companion");
 assert.equal(dying.kind,"dyingCompanion");assert.equal(dying.stops,3);
 assert.equal(dying.active,1);assert.equal(dying.index,0);assert.equal(dying.id,"dying-now");
 assert.equal(dying.overflow,"auto");
 assert.equal(await page.locator("#aoPray435930 [data-ao-dying-companion-options]").evaluate(x=>x.open),false);
 const bedside=page.locator("#aoPray435930 [data-ao-bedside-direct] [data-tp381-dying]");
 assert.equal(await bedside.count(),3,"A bedside visitor should not open secondary settings to reach prayer");
 assert.equal(await bedside.first().getAttribute("aria-pressed"),"true","Obtain priest must remain the default action");
 await bedside.nth(1).evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"dying-pray","Direct quiet prayer action failed");
 await bedside.nth(2).evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"dying-commend","Direct Commendation action failed");
 await bedside.first().evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"dying-now","Urgent pastoral first action cannot be restored");
 const bedsideWidth=await page.locator("#aoPray435930 [data-ao-bedside-direct]").evaluate(el=>({w:el.clientWidth,sw:el.scrollWidth}));
 assert.ok(bedsideWidth.sw<=bedsideWidth.w+2,"320px immediate bedside action controls overflow");
 assert.match(await page.locator("#aoPray435930 .aoDevoCardScroll").innerText(),
   /Appelez un prêtre maintenant|Call a priest now/,
   "Dying Companion must put obtaining a priest in its reading card");
 assert.match(await page.locator("#aoPray435930 .aoDevoCardScroll").innerText(),
   /Viatique|Viaticum/,
   "Urgent bedside card lost sacramental request guidance");
 const headerBounds=await page.evaluate(()=>{
   const title=document.querySelector("#aoPray435930 .aoP435930Head h1")?.getBoundingClientRect();
   const home=document.querySelector("#aoPray435930 [data-tp381-home]")?.getBoundingClientRect();
   const h=document.querySelector("#aoPray435930 .aoP435930Head h1");
   return {titleRight:title?.right,homeLeft:home?.left,titleBottom:title?.bottom,homeTop:home?.top,
     titleScroll:h?.scrollWidth,titleWidth:h?.clientWidth,font:getComputedStyle(h).fontSize};
 });
 assert.ok(headerBounds.titleRight<=headerBounds.homeLeft+2||
   headerBounds.titleBottom<headerBounds.homeTop,
   "Narrow French bedside title overlaps the Home control: "+JSON.stringify(headerBounds));
 assert.ok(headerBounds.titleScroll<=headerBounds.titleWidth+1,
   "The Accompagnement heading is clipped inside its own box: "+JSON.stringify(headerBounds));
 await page.screenshot({path:resolve(captures,"dying-call-priest-320-fr.png"),animations:"disabled"});
 await swipe(5,-142);assert.equal((await snapshot()).index,0,
   "Scrolling urgent bedside instructions accidentally advanced a card");
 await swipe(-180,5);
 const prayerStage=await snapshot();
 assert.equal(prayerStage.id,"dying-pray");assert.equal(prayerStage.index,1);
 assert.equal(await page.locator("#aoPray435930 .aoDevoSequenceTimeline [aria-current='step']").count(),1);
 assert.equal(await page.locator("#aoPray435930 [data-tp381-prayer='foundations_act_of_faith']").count(),1);
 assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>80,
   "Dying Companion has lost traditional aspirations");
 await page.screenshot({path:resolve(captures,"dying-quiet-prayers-320-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 .aoDevoStop").nth(2).evaluate(el=>el.click());
 const commend=await snapshot();
 assert.equal(commend.id,"dying-commend");assert.equal(commend.index,2);
 assert.ok(commend.paragraphCount>0,"Commendation lacks paragraph-level focus");
 assert.equal(await page.locator("#aoPray435930 .aoDevoCardScroll").evaluate(card=>{
   const prayer=card.querySelector(".aoTP381PrayerCard"),notes=card.querySelector(".aoTP381Intro");
   return !!(prayer&&notes&&(prayer.compareDocumentPosition(notes)&Node.DOCUMENT_POSITION_FOLLOWING));
 }),true,"Proficiscere must precede explanatory context on the prayer card");
 assert.match(await page.locator("#aoPray435930 .aoDevoCardScroll").innerText(),
   /recommandation de l’âme|Commendation of the Soul/i);
 assert.equal(await page.locator("#aoPray435930 [data-tp381-prayer='dead_de_profundis']").count(),1,
   "Transition to prayer for a deceased person was removed");
 await page.screenshot({path:resolve(captures,"dying-commendation-320-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 .aoDevoStop").first().evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"dying-now");
 // PR #1143 retained 390px French stage acceptance, reconciled to
 // the priest-first owner and its secondary guidance disclosure.
 await page.setViewportSize({width:390,height:844});
 const wideDying=await snapshot();
 assert.equal(wideDying.route,"pray.dying_companion");
 assert.equal(wideDying.kind,"dyingCompanion");
 assert.equal(wideDying.stops,3);assert.equal(wideDying.id,"dying-now");
 assert.equal(wideDying.overflow,"auto");
 assert.equal(await page.locator("#aoPray435930 [data-ao-dying-companion-options]").evaluate(x=>x.open),false);
 assert.match(await page.locator("#aoPray435930 .aoDevoCardScroll").innerText(),/prêtre/i);
 await page.screenshot({path:resolve(captures,"dying-call-priest-390-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 .aoDevoStop").nth(1).evaluate(x=>x.click());
 assert.equal((await snapshot()).id,"dying-pray");
 assert.match(await page.locator("#aoPray435930 .aoDevoCardScroll").innerText(),/prière|priez|contrition/i);
 await page.screenshot({path:resolve(captures,"dying-pray-390-fr.png"),animations:"disabled"});
 await page.locator("#aoPray435930 .aoDevoStop").nth(2).evaluate(x=>x.click());
 assert.equal((await snapshot()).id,"dying-commend");
 assert.match(await page.locator("#aoPray435930 .aoDevoCardScroll").innerText(),/âme|mourant/i);
 await page.screenshot({path:resolve(captures,"dying-commend-390-fr.png"),animations:"disabled"});
 await swipe(0,-130);
 assert.equal((await snapshot()).id,"dying-commend","390px bedside vertical reading changed stage");
 await page.locator("#aoPray435930 .aoDevoStop").first().evaluate(x=>x.click());
 assert.equal((await snapshot()).id,"dying-now");
 await page.setViewportSize({width:320,height:720});
 // Explicit Home must win over any stored deep-link return context.
 // The normal close() path may queue a return-to-Prayer callback.
 await page.locator("#aoPray435930 [data-tp381-home]").evaluate(el=>el.click());
 await page.waitForFunction(()=>!document.querySelector("#aoPray435930")?.classList?.contains("open"),null,{timeout:8000});
 assert.equal(await page.locator("#aoPray435930.open").count(),0,
   "Traditional Prayer Home reopened its donor sheet instead of reaching Home");
 assert.deepEqual(errors,[],"Browser errors "+JSON.stringify(errors));
 console.log("PASS Good Death nine source-owned prayers and distinct priest-first Dying Companion three-stage reader on French phones");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done))}
