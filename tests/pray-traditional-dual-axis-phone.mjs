import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {SACRED_HYMNS_V381} from "../src/pray/traditional-pray-data.js";

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
 // Current production default is Design B. This branch must integrate with it,
 // not accidentally revive the pre-#1789 Daily reading presentation.
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
 await page.locator("#aoPray435930 .aoDevoStop").first().evaluate(el=>el.click());
 const first=await snapshot();
 assert.equal(first.route,"pray.morning_evening");
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
 assert.ok(openingRule.summaryVisible&&openingRule.settingsTop<openingRule.horizonTop&&!openingRule.open,
   "Daily customization must be visible and collapsed before the cinematic stage: "+JSON.stringify(openingRule));
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
 assert.equal(await page.locator("#aoPray435930 [data-tp381-personal-action='edition'][data-tp381-personal-value='1905']").evaluate(el=>el.click()),undefined);
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"8","1905 printed evening order must be distinct");
 await page.locator("#aoPray435930 [data-tp381-personal-action='reset']").evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-quiet-daily-horizon]").getAttribute("data-ao-horizon-total"),"10","Reset restores the 1913 evening order");
 const saved=await page.evaluate(()=>localStorage.getItem("ao.pray.personal-rule.v1"));
 assert.ok(saved&&saved.includes('"edition":"1913"')&&!saved.includes("De profundis"));
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
 assert.equal(heart.kind,"sacredHeart");assert.equal(heart.stops,3);assert.equal(heart.active,1);
 assert.equal(heart.id,"heart-litany");assert.equal(heart.overflow,"auto");
 assert.ok(heart.paragraphCount>=20,"Sacred Heart litany lost line-by-line reading focus");
 assert.equal(await page.locator("#aoPray435930 [data-ao-heart-options]").evaluate(el=>el.open),false);
 await page.screenshot({path:resolve(captures,"sacred-heart-litany-390-fr.png"),animations:"disabled"});
 await swipe(0,-146);
 assert.equal((await snapshot()).id,"heart-litany","Vertical Sacred Heart reading advanced a card");
 await swipe(-165,5);
 assert.equal((await snapshot()).id,"heart-reparation","Sacred Heart horizontal swipe skipped a stage");
 await page.locator("#aoPray435930 .aoDevoStop").nth(2).evaluate(el=>el.click());
 assert.equal((await snapshot()).id,"heart-consecration");
 assert.equal(await page.locator("#aoPray435930 .aoDevoSequenceTimeline [aria-current='step']").count(),1);
 assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>150,"Consecration text missing");
 await page.locator("#aoPray435930 [data-tp381-flip]").first().evaluate(el=>el.click());
 assert.equal(await page.locator("#aoPray435930 [data-face-la]").isVisible(),true);
 await page.screenshot({path:resolve(captures,"sacred-heart-consecration-la-390.png"),animations:"disabled"});
 await open("pray.communion_treasury");
 const before=await snapshot();
 assert.equal(before.route,"pray.communion_treasury");
 assert.equal(before.kind,"communion");assert.equal(before.stops,7);
 assert.equal(before.id,"communion-before-sacrament_come_holy_spirit");
 assert.equal(before.overflow,"auto");assert.equal(before.active,1);
 assert.equal(await page.locator("#aoPray435930 [data-ao-communion-options]").evaluate(el=>el.open),false);
 await page.screenshot({path:resolve(captures,"communion-before-390-fr.png"),animations:"disabled"});
 const beforeIds=["sacrament_come_holy_spirit","foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love","sacrament_act_of_contrition","beforeThomas","beforeAmbrose"];
 for(let i=0;i<beforeIds.length;i++){
  await page.locator("#aoPray435930 .aoDevoStop").nth(i).evaluate(el=>el.click());
  const stage=await snapshot();
  assert.equal(stage.id,"communion-before-"+beforeIds[i],"Wrong Communion preparation prayer on step "+i);
  assert.equal(stage.active,1);
  assert.ok((await page.locator("#aoPray435930 .aoTP381PrayerCard").innerText()).length>30,"Empty canonical preparation text "+beforeIds[i]);
 }
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
 assert.equal(hymn.stops,3);assert.equal(hymn.active,1);
 assert.equal(hymn.id,"hymn-te_deum");assert.equal(hymn.overflow,"auto");
 assert.ok(hymn.paragraphCount>20,"Te Deum has no line-level focus");
 assert.equal(await page.locator("#aoPray435930 [data-ao-hymn-options]").evaluate(x=>x.open),false,
  "Hymn introduction and three language controls crowd the prayer card");
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
