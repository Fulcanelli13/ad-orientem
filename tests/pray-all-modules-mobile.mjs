import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
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
 // Reachability acceptance: open every *external* Prayer-family card
 // from its visible button and return to the same family. The native readers,
 // 48 prayer texts and Rosary have independent mobile acceptance below.
 const historicalFamilyIds=JSON.parse(readFileSync("data/app/content-reachability-audit.v1.json","utf8"))
   .routes.filter(x=>x.kind==="PRAY_FAMILY_ITEM").map(x=>x.id).concat("pray.tenebrae").sort();
 const instituteIds=["pray.marian_protection","pray.prayers_for_priests","pray.st_therese_devotions"];
 const expectedFamilyIds=[...historicalFamilyIds,...instituteIds].sort();
 const visibleFamilyIds=[],externalRoutes=[];
 for(const family of ["daily","eucharistic","penance","passion","devotions"]){
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   const door=page.locator('#aoPray435930.open [data-p435930-family="'+family+'"]');
   assert.equal(await door.count(),1,"Missing Prayer-family door "+family);
   await door.tap({timeout:10000});
   await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset?.aoPrayView==="family",null,{timeout:10000});
   const cards=await page.locator('#aoPray435930.open .aoP435930ModuleGrid [data-p435930-own],#aoPray435930.open .aoP435930ModuleGrid [data-p435930-external]')
     .evaluateAll(nodes=>nodes.map(n=>({
       id:n.dataset.p435930Own||n.dataset.p435930External,
       external:!!n.dataset.p435930External,height:n.getBoundingClientRect().height
     })));
   assert.ok(cards.length>=2,"Empty Prayer family "+family);
   for(const card of cards){
     visibleFamilyIds.push(card.id);
     assert.ok(card.height>=44,"Undersized Prayer launcher "+card.id);
     if(!card.external)continue; // Existing native reader suites certify owned modules.
     externalRoutes.push(card.id);
     await page.locator('#aoPray435930.open [data-p435930-external="'+card.id+'"]').tap({timeout:10000});
     const view=card.id==="pray.novenas"?"novenas":"traditional-pray";
     await page.waitForFunction(({view,id})=>{
       const el=document.querySelector("#aoPray435930.open .aoP435930Mount");
       return el?.dataset?.aoPrayView===view
         &&(view==="novenas"||el?.dataset?.aoTraditionalPrayRoute===id);
     },{view,id:card.id},{timeout:15000});
     const body=await page.locator("#aoPray435930.open .aoP435930Mount").innerText();
     assert.ok(body.trim().length>=35,"Blank destination after Prayer tap "+card.id);
     assert.equal(await page.locator("[data-p435930-family-open-error]").count(),0,"Prayer launch reported failure: "+card.id);
     const back=card.id==="pray.novenas"?"[data-n1-back]":"[data-tp381-back]";
     await page.locator("#aoPray435930.open "+back).first().tap({timeout:10000});
     if(card.id==="pray.morning_evening"){
       // Guided Morning Prayer's first Back switches to its list overview.
       const inFamily=await page.evaluate(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset?.aoPrayView==="family");
       if(!inFamily)await page.locator("#aoPray435930.open [data-tp381-back]").first().tap({timeout:10000});
     }
     await page.waitForFunction(id=>
       document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset?.aoPrayView==="family"
       &&!!document.querySelector('#aoPray435930.open [data-p435930-external="'+id+'"]'),
       card.id,{timeout:12000});
   }
 }
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
 assert.equal(await page.locator('#aoPray435930.open [data-p435930-own="pray.library"]').count(),1,"Missing Prayer Library direct door");
 visibleFamilyIds.push("pray.library");
 assert.equal(visibleFamilyIds.length,27,"Historical 24 Prayer entries plus three new Institute readers");
 assert.equal(new Set(visibleFamilyIds).size,27,"Duplicate Prayer family entry");
 assert.deepEqual(visibleFamilyIds.filter(id=>!instituteIds.includes(id)).sort(),historicalFamilyIds,"Original 24 Prayer entries must remain unchanged");
 assert.deepEqual(visibleFamilyIds.sort(),expectedFamilyIds,"Production Prayer family cards are not the declared routes");
 assert.equal(externalRoutes.length,13,"Ten historical external cards plus three new Institute readers");
 console.log("PASS Prayer family reachability: 24 original + 3 Institute routes; 13 external tap-and-return checks");
 // Exercise the real Holy Name Guide on a touch-sized screen. The complete
 // source text remains available; guided reading only separates seven
 // original paragraphs and must preserve Latin replacement in each stage.
 const litanyOpen=await page.evaluate(async()=>await globalThis.AO_MODULES.open("pray.holy_name_litany",{returnContext:null}));
 assert.notEqual(litanyOpen?.ok,false,"Holy Name litany is not reachable through the canonical module registry");
 await page.waitForSelector("#aoPray435930.open .aoDevoSequenceTimeline",{state:"visible",timeout:12000});
 const litany="#aoPray435930.open";
 assert.equal(await page.locator(litany+" [data-ao-holy-name-options]").evaluate(el=>el.open),false,
   "Holy Name options must not displace the litany at opening");
 assert.equal(await page.locator(litany+" [data-tp381-litany-mode='guided']").getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator(litany+" .aoDevoStop").count(),7,"Litany lost seven named source sections");
 assert.equal(await page.locator(litany+" .aoDevoCard").getAttribute("data-ao-devo-card"),"holy-name-1");
 assert.equal(await page.locator(litany+" .aoDevoParagraph[data-ao-devo-active='true']").count(),1,
   "Litany is not illuminating exactly one visible source line");
 await page.locator(litany+" [data-tp381-flip]").tap();
 assert.equal(await page.locator(litany+" [data-face-la]").isVisible(),true,"Guided Litany Latin replacement is not visible");
 assert.equal(await page.locator(litany+" [data-face-v]").isVisible(),false,"Litany shows Latin and vernacular simultaneously");
 for(let step=2;step<=7;step++){
   await page.locator(litany+" .aoDevoStop").nth(step-1).evaluate(x=>x.click());
   assert.equal(await page.locator(litany+" .aoDevoCard").getAttribute("data-ao-devo-card"),"holy-name-"+step);
   assert.equal(await page.locator(litany+" .aoDevoSequenceTimeline [aria-current='step']").count(),1);
 }
 await page.locator(litany+" [data-ao-holy-name-options] > summary").click();
 await page.locator(litany+" [data-tp381-litany-mode='full']").click();
 assert.equal(await page.locator(litany+" .aoDevoSequenceTimeline").count(),0,"Full Holy Name must preserve its alternate complete text reader");
 assert.match(await page.locator(litany+" .aoTP381PrayerCard").innerText(),/Jesus|Lord/i,"Full Holy Name text is incomplete");
 const mealOpen=await page.evaluate(async()=>await globalThis.AO_MODULES.open("pray.meal_prayers",{returnContext:null}));
 assert.notEqual(mealOpen?.ok,false,"Meal Prayers did not open");
 await page.waitForSelector(litany+" .aoDevoSequenceTimeline",{state:"visible",timeout:12000});
 assert.equal(await page.locator(litany+" .aoDevoStop").count(),2);
 assert.equal(await page.locator(litany+" .aoDevoCard").getAttribute("data-ao-devo-card"),"meal-before");
 await page.locator(litany+" .aoDevoStop").nth(1).evaluate(x=>x.click());
 assert.equal(await page.locator(litany+" .aoDevoCard").getAttribute("data-ao-devo-card"),"meal-after");
 assert.equal(await page.locator(litany+" .aoDevoSequenceTimeline [aria-current='step']").count(),1);
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
 console.log("PASS Holy Name seven-source-card and Meal two-card reader: single active timeline, Latin replacement and alternate full text");


 // Confession paths must remain under one sacramental owner, with no sins entered.
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null}));
 const conf="#aoPray435930.open";
 assert.equal(await page.locator(conf+" [data-p435930-conf-path]").count(),3);
 assert.equal(await page.locator(conf+" [data-p435930-conf-next]").isDisabled(),true);
 const press=async selector=>{
   const pressed=await page.evaluate(s=>{
     // The canonical shared timeline replaces hidden legacy Previous/Next for
     // the interior examination cards. Test the button a visitor can touch.
     if(s.includes("[data-p435930-conf-next]")){
       const reader=document.querySelector("#aoPray435930.open .aoP435930ConfessionReader");
       const timeline=reader?.querySelector(".aoDevoSequenceTimeline");
       const card=reader?.querySelector(".aoDevoCard");
       const index=Number(card?.dataset.aoDevoIndex);
       const count=timeline?.querySelectorAll(".aoDevoStop").length||0;
       if(count>1&&index<count-1){
         const next=timeline.querySelectorAll(".aoDevoStop")[index+1];
         if(!next||next.disabled)return false;
         next.click();return true;
       }
     }
     const el=document.querySelector(s);if(!el)return false;
     if(el.getClientRects().length===0)return false;
     el.click();return true;
   },selector);
   assert.equal(pressed,true,"Missing visible Confession navigation: "+selector);
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
 // Exercise the visible canonical card timeline. The previous/next buttons
 // remain in the source frame only as a fallback and are hidden when the
 // shared dual-axis reader is installed; tapping those hidden controls
 // would certify a path the user cannot reach.
 async function tapStep(control,expected){
   assert.match(control,/data-tp381-(daily|examen)-step/,
     "Unexpected traditional prayer owner");
   const target=page.locator("#aoPray435930.open .aoDevoSequenceTimeline [data-ao-devo-chapter='"+expected+"']");
   assert.equal(await target.count(),1,"Missing visible source-owned timeline stage "+expected);
   const current=await page.locator(daily).getAttribute("data-guide-step");
   if(current!==String(expected))await target.tap({timeout:12000});
   await page.waitForFunction(step=>{
     const shell=document.querySelector("#aoPray435930.open");
     const guide=shell?.querySelector("[data-ao-pray-guide-card]");
     const card=shell?.querySelector(".aoDevoCard");
     return guide?.dataset.guideStep===String(step)&&
       card?.dataset.aoDevoIndex===String(step)&&
       shell.querySelectorAll(".aoDevoSequenceTimeline [aria-current='step']").length===1;
   },expected,{timeout:9000});
 }
 for(let step=1;step<=11;step++){
   await tapStep("#aoPray435930.open [data-tp381-daily-step='"+step+"']",step);
   assert.equal(await page.locator(daily).getAttribute("data-guide-step"),String(step));
   assert.equal(await page.locator(daily).count(),1);
 }
 assert.match(await page.locator(daily).innerText(),/Prayer completed/);
 await tapStep("#aoPray435930.open [data-tp381-daily-step='0']",0);
 await page.locator("#aoPray435930.open [data-tp381-daypart='evening']").tap();
 assert.equal(await page.locator(daily+" .aoTP381GuideCount").innerText(),"Step 1 of 10");
 for(let step=1;step<=8;step++)await tapStep("#aoPray435930.open [data-tp381-daily-step='"+step+"']",step);
 assert.equal(await page.locator(daily).getAttribute("data-ao-pray-guide-card"),"piusx-1913-evening-examen");
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
 assert.equal(await page.locator(daily).getAttribute("data-ao-pray-guide-card"),"piusx-1913-evening-contrition");
 const dailyOptions=page.locator("#aoPray435930.open [data-ao-daily-options]");
 await dailyOptions.locator("summary").tap();
 assert.equal(await dailyOptions.evaluate(node=>node.open),true,
   "Real phone cannot expand secondary daily prayer options");
 await page.locator("#aoPray435930.open [data-tp381-daily-mode='list']").tap();
 assert.equal(await page.locator("#aoPray435930.open .aoTP381PrayerList button").count(),10,"Revised St Pius X evening overview must contain its ten core stages");
 const reopenedOptions=page.locator("#aoPray435930.open [data-ao-daily-options]");
 await reopenedOptions.locator("summary").tap();
 assert.equal(await reopenedOptions.evaluate(node=>node.open),true);
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
   // A pending async source load may replace the disclosure between render
   // and touch. Use a live locator, let Playwright perform the real tap and
   // verify that the replacement disclosure is actually open.
   await page.waitForTimeout(350);
   try{
     await disclosure.locator("summary").tap({timeout:12000});
   }catch(error){
     const opened=await disclosure.getAttribute("open").catch(()=>null);
     if(opened!=="")throw error; // Do not bypass an unperformed touch.
   }
   await page.waitForFunction(()=>document.querySelectorAll("#aoPray435930.open details.aoP435930Source").length>0 &&
     [...document.querySelectorAll("#aoPray435930.open details.aoP435930Source")].at(-1).open===true,
     null,{timeout:4500}).catch(()=>{});
   assert.equal(await disclosure.getAttribute("open"),"","Historical witness drawer cannot be opened on touch: "+route);
 }

 // Swipe-first finite guides must not reintroduce button-controlled page travel.
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations",{returnContext:null}));
 const stationProgress=page.locator("#aoPray435930.open .aoP435930StationRail.aoDevoSequenceTimeline .aoDevoProgress");
 assert.equal(await stationProgress.count(),1,"Stations require one shared progress track");
 assert.equal(await stationProgress.getAttribute("aria-valuenow"),"1");
 assert.equal(await stationProgress.getAttribute("aria-valuemax"),"14");
 assert.equal(await page.locator("#aoPray435930.open [data-p435930-station-prev],[data-p435930-station-next]").count(),0);
 const stationBody=page.locator("#aoPray435930.open .aoP435930Stations .aoDevoCardScroll");
 const stationSwipe=async(dx,dy)=>stationBody.evaluate((el,{dx,dy})=>{
  const touch=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});
  el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[touch(255,340)],changedTouches:[touch(255,340)]}));
  el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[touch(255+dx,340+dy)]}));
 },{dx,dy});
 await stationSwipe(-5,-165);
 assert.equal(await stationProgress.getAttribute("aria-valuenow"),"1","Vertical scroll must not advance stations");
 await stationSwipe(-145,3);
 assert.equal(await stationProgress.getAttribute("aria-valuenow"),"2","Horizontal swipe must advance one station");
 assert.equal(await page.locator("#aoPray435930.open [data-ao-devo-card]").getAttribute("data-ao-devo-card"),"station-2");
 await stationBody.focus();
 await page.keyboard.press("ArrowLeft");
 assert.equal(await stationProgress.getAttribute("aria-valuenow"),"1","Keyboard previous station failed");

 for(const [route,owner,nextTitle] of [
  ["pray.penitential_psalms","penitential","penitential-1"],
  ["pray.forty_hours","fortyHours","forty-1"]
 ]){
  await page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),route);
  if(route==="pray.forty_hours"){
   assert.equal(await page.locator("#aoPray435930.open [data-ao-forty-mode=choose]").count(),1,
    "Forty Hours must preserve the existing visitor companion alongside the new solemn reference");
   await page.locator("#aoPray435930.open [data-p435930-forty-mode=visitor]").tap();
  }
  const reader="#aoPray435930.open [data-ao-devotional-owner='"+owner+"']";
  const progress=page.locator(reader+" .aoDevoSequenceTimeline .aoDevoProgress");
  await progress.waitFor({state:"visible",timeout:10000});
  assert.equal(await progress.getAttribute("aria-valuenow"),"1",route+" must begin at stage one");
  const buttons=owner==="penitential"?"[data-p435930-pen-prev],[data-p435930-pen-next]":
   "[data-p435930-forty-prev],[data-p435930-forty-next]";
  assert.equal(await page.locator(reader+" "+buttons).count(),0,route+" has redundant Previous/Next");
  await page.locator(reader+" .aoDevoSequenceTimeline [data-ao-devo-chapter='1']").click();
  assert.equal(await progress.getAttribute("aria-valuenow"),"2",route+" progress not bound to its canonical step");
  assert.equal(await page.locator(reader+" [data-ao-devo-card]").getAttribute("data-ao-devo-card"),nextTitle);
 }

 // Reach the lazy canonical Novena reader through the public module registry.
 // Every one of the sixteen original-source links must be accessible by touch.
 const novenaOpen=await page.evaluate(async()=>await globalThis.AO_MODULES.open("pray.novenas",{returnContext:null}));
 assert.notEqual(novenaOpen?.ok,false,"Canonical lazy Novenas entry did not open: "+JSON.stringify(novenaOpen));
 await page.waitForSelector("#aoPray435930.open [data-n1-select='st_anthony_nine_tuesdays']",{timeout:15000});
 const novenaIds=await page.locator("#aoPray435930.open [data-n1-select]").evaluateAll(nodes=>nodes.map(x=>x.dataset.n1Select));
 assert.equal(novenaIds.length,16,"Novenas home no longer lists all sixteen source-backed targets");
 for(const id of novenaIds){
   // Require actual overview restoration before each independent touch test.
   await page.waitForFunction(()=>globalThis.AO_NOVENAS_V3?.state?.()?.screen==='overview',null,{timeout:10000});
   await page.locator("#aoPray435930.open [data-n1-select='"+id+"']").waitFor({state:'visible',timeout:10000});
   // A successful touch navigation replaces the selection card immediately;
   // Playwright may observe the card detached after the action has succeeded.
   // Require the real canonical Novena detail state or rethrow the tap error.
   try{
     await page.locator("#aoPray435930.open [data-n1-select='"+id+"']").tap({timeout:9000});
   }catch(error){
     let selected=await page.evaluate(id=>{
       const state=globalThis.AO_NOVENAS_V3?.state?.();
       return state?.id===id&&state?.screen==="detail";
     },id);
     // The canonical overview can be re-rendered during asynchronous
     // calendar/module updates; retry the genuine phone tap on its new node.
     // Never manufacture a click or accept the test without detail navigation.
     for(let retry=0;!selected&&retry<2;retry++){
       await page.locator("#aoPray435930.open [data-n1-select='"+id+"']").waitFor({state:"visible",timeout:6000});
       try{
         await page.locator("#aoPray435930.open [data-n1-select='"+id+"']").tap({timeout:6000});
       }catch(retryError){
         // Only a verified canonical detail transition counts as success.
       }
       selected=await page.evaluate(id=>{
         const state=globalThis.AO_NOVENAS_V3?.state?.();
         return state?.id===id&&state?.screen==="detail";
       },id);
     }
     if(!selected){
       const hit=await page.evaluate(id=>{
         const target=document.querySelector("#aoPray435930.open [data-n1-select='"+id+"']");
         const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
         const rect=target?.getBoundingClientRect();
         const x=rect?Math.max(0,Math.min(innerWidth-1,rect.left+rect.width/2)):null;
         const y=rect?Math.max(0,Math.min(innerHeight-1,rect.top+rect.height/2)):null;
         const top=x===null?null:document.elementFromPoint(x,y);
         return {id,screen:globalThis.AO_NOVENAS_V3?.state?.()?.screen,
           rect:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null,
           viewport:{width:innerWidth,height:innerHeight},scrollTop:mount?.scrollTop,
           hit:top?{tag:top.tagName,className:String(top.className).slice(0,120),
             selector:top.getAttribute('data-n1-select'),closest:top.closest('[data-ao-pray-view]')?.getAttribute('data-ao-pray-view')}:null,
           targetConnected:target?.isConnected??false};
       },id);
       console.error("NOVENA_TOUCH_HIT_DIAGNOSTIC "+JSON.stringify(hit));
       throw error;
     }
   }
   assert.equal(await page.evaluate(id=>{
     const state=globalThis.AO_NOVENAS_V3?.state?.();
     return state?.id===id&&state?.screen==="detail";
   },id),true,"Touch did not open Novena detail: "+id);
   const detail=page.locator("#aoPray435930.open");
   const background=detail.locator("details.aoN1AboutDisclosure");
   assert.equal(await background.count(),1,"Novena context remains available in its drawer");
   assert.equal(await background.evaluate(x=>x.open),false,"Novena context should not displace day selection");
   await background.locator(":scope > summary").evaluate(el=>el.click());
   assert.equal(await background.evaluate(el=>el.open),true,"Novena background did not open");
   const source=detail.locator("details.aoN1SourceDetails");
   assert.equal(await source.count(),1,"Missing original-source disclosure for Novena "+id);
   await source.locator("summary").tap({timeout:9000});
   const primary=source.locator("a.aoN1SourcePrimary");
   assert.equal(await primary.count(),1,"Original witness citation is not clickable for "+id);
   const href=await primary.getAttribute("href");
   assert.match(href,/^https:\/\//,"Non-HTTPS Novena source for "+id);
   assert.equal(await primary.getAttribute("rel"),"noopener noreferrer");
   if(id==="st_therese"){
     assert.equal(await detail.locator("[data-n1-icksp-therese]").count(),1,
       "Existing 24 Glory Bes novena must cross-link the distinct ICKSP forms");
   }
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
   await page.waitForFunction(()=>globalThis.AO_NOVENAS_V3?.state?.()?.screen==="overview",null,{timeout:10000});
   assert.equal(await page.locator("#aoPray435930.open [data-n1-select]").count(),16,
     "A detail Back tap must restore the source-backed Novena overview: "+id);
 }
 // ICKSP source is supplementary: keep 16 historical donor targets intact while
 // proving the added bilingual nine-day devotion is actually tappable on mobile.
 await page.waitForSelector("#aoPray435930.open [data-n1-supplement='divine_infant_king']",{timeout:10000});
 assert.equal(await page.locator("#aoPray435930.open [data-n1-select]").count(),16);
 await page.locator("#aoPray435930.open [data-n1-supplement='divine_infant_king']").tap();
 await page.waitForFunction(()=>globalThis.AO_NOVENAS_V3?.state?.()?.id==="divine_infant_king"
   &&globalThis.AO_NOVENAS_V3?.state?.()?.screen==="detail",null,{timeout:10000});
 assert.equal(await page.locator("#aoPray435930.open [data-n1-day]").count(),9,
   "The Institute's monthly novena must display exactly nine daily leaves");
 await page.locator("#aoPray435930.open [data-n1-mode='simple']").tap();
 await page.locator("#aoPray435930.open [data-n1-begin]").tap();
 const infantText=await page.locator("#aoPray435930.open [data-ao-novena-deck='simple']").innerText();
 assert.match(infantText,/O CHILD Jesus|O Enfant Jésus/,"Original bilingual Infant Jesus prayer absent");
 // The day list is collapsed once the prayer reader opens. Use
 // the visible Next day control to verify all nine recitations.
 for(let day=2;day<=9;day++){
   await page.locator("#aoPray435930.open [data-n1-day-next]").tap({timeout:9000});
   assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3?.state?.()?.day),day,
     "The supplemental prayer cannot advance to day "+day);
 }
 await page.locator("#aoPray435930.open [data-n1-back]").tap();
 await page.locator("#aoPray435930.open [data-n1-back]").tap();
 await page.waitForFunction(()=>globalThis.AO_NOVENAS_V3?.state?.()?.screen==="overview",null,{timeout:10000});
 assert.equal(await page.locator("#aoPray435930.open [data-n1-select]").count(),16,
   "The ICKSP additional entry displaced an original novena");
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
   await page.waitForFunction(()=>{
     const reader=document.querySelector("#aoPray435930.open .aoP435930LibraryReader");
     return Boolean(reader?.querySelector(".aoDevoCardScroll .aoLibraryLine[data-ao-devo-active='true']")&&
       !reader?.querySelector(".aoDevoSequenceTimeline"));
   },null,{timeout:4500}).catch(async error=>{
     const diag=await page.evaluate(()=>{
       const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
       const reader=m?.querySelector(".aoP435930LibraryReader");
       return {view:m?.dataset.aoPrayView,library:!!reader,
         card:reader?.querySelector(".aoDevoCard")?.outerHTML?.slice(0,1800),
         timeline:reader?.querySelectorAll(".aoDevoSequenceTimeline").length,
         lines:reader?.querySelectorAll(".aoLibraryLine").length,
         active:reader?.querySelectorAll(".aoLibraryLine[data-ao-devo-active='true']").length,
         sourceNode:reader?.querySelector(".aoP435930Text,[data-face-v]")?.outerHTML?.slice(0,900)};
     });
     throw new Error("Library dual-axis card missing for "+id+": "+JSON.stringify(diag)+"; "+error);
   });
   const libraryDeck=await page.evaluate(()=>{
     const reader=document.querySelector("#aoPray435930.open .aoP435930LibraryReader");
     const scroll=reader?.querySelector(".aoDevoCardScroll");
     const root=reader?.closest("#aoPray435930");
     return {card:reader?.querySelectorAll(".aoDevoCard").length,
       stops:reader?.querySelectorAll(".aoDevoStop").length,
       timelines:reader?.querySelectorAll(".aoDevoSequenceTimeline").length,
       duplicateTitle:reader?.querySelectorAll(".aoDevoCardHead,.aoDevoCardTitle").length,
       active:reader?.querySelectorAll(".aoLibraryLine[data-ao-devo-active='true']").length,
       title:root?.querySelector(".aoP435930Head h1")?.textContent?.trim(),
       scroll:getComputedStyle(scroll).overflowY};
   });
   assert.ok(libraryDeck.card===1&&libraryDeck.stops===0&&libraryDeck.timelines===0&&
     libraryDeck.duplicateTitle===0&&libraryDeck.active===1&&
     libraryDeck.title?.length>2&&libraryDeck.scroll==="auto",
     "Single prayer must have one title and a locally scrolling focus card without one-of-one chrome: "+id+" "+JSON.stringify(libraryDeck));
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
 // Divine Mercy has two nested cursors: swipe changes one of seven/eight
 // prayer chapters; the visible beads and paragraph focus select individual
 // canonical prayer events. No separate Previous/Next control may compete.
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null})),true);
 const mercy="#aoPray435930.open .aoMercyReader";
 const beadNav=page.locator(mercy+" [data-ao-mercy-bead-navigation]");
 const progress=page.locator(mercy+" .aoMercyBeadNavigation > .aoDevoProgress");
 await beadNav.waitFor({state:"visible"});
 assert.equal(await progress.count(),1,"Divine Mercy needs exactly one visible prayer-position progress");
 assert.equal(await progress.getAttribute("aria-valuemin"),"0");
 assert.equal(await progress.getAttribute("aria-valuemax"),"62");
 assert.equal(await progress.getAttribute("aria-valuenow"),"1");
 assert.equal(await page.locator(mercy+" [data-p435930-mercy-prev],[data-p435930-mercy-next],"+mercy+" .aoMercyControls").count(),0,
   "Divine Mercy retains duplicated bead Previous/Next chrome");
 const phase=page.locator(mercy+" [data-p435930-mercy-jump='4']");
 await phase.tap(); // Source index 4: first decade's large bead.
 assert.equal(await progress.getAttribute("aria-valuenow"),"5");
 assert.equal(await beadNav.getAttribute("data-mercy-decade"),"1");
 assert.equal(await beadNav.getAttribute("data-mercy-bead"),"0");
 assert.equal(await page.locator(mercy+" .aoMercyBeadButton").count(),11);
 await page.locator(mercy+" [data-p435930-mercy-jump='10']").tap();
 assert.equal(await progress.getAttribute("aria-valuenow"),"11");
 assert.equal(await beadNav.getAttribute("data-mercy-bead"),"6",
   "Direct bead choice must retain canonical index, not invent a new cursor");
 const mercyScroll=page.locator(mercy+" .aoDevoCardScroll");
 await mercyScroll.evaluate(el=>{
  const t=(x,y)=>new Touch({identifier:48,target:el,clientX:x,clientY:y});
  el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(246,350)],changedTouches:[t(246,350)]}));
  el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(240,198)]}));
 });
 assert.equal(await progress.getAttribute("aria-valuenow"),"11",
   "Vertical gesture must not advance a bead or decade by itself");
 await mercyScroll.evaluate(el=>{
  const t=(x,y)=>new Touch({identifier:49,target:el,clientX:x,clientY:y});
  el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(246,350)],changedTouches:[t(246,350)]}));
  el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(90,354)]}));
 });
 assert.equal(await page.locator(mercy+" [data-ao-devo-card]").getAttribute("data-ao-devo-card"),"decade-2",
  "Horizontal gesture must move one chapter, not one bead");
 assert.equal(await progress.getAttribute("aria-valuenow"),"16",
  "Chapter swipe must restore the source-owned start bead and its progress");
 await page.locator(mercy+" [data-ao-mercy-options] summary").tap();
 await page.locator(mercy+" [data-p435930-mercy-closing]").tap();
 assert.equal(await progress.getAttribute("aria-valuemax"),"63",
  "Optional published closing prayer must adjust canonical denominator");
 assert.equal(await progress.getAttribute("aria-valuenow"),"16",
  "Optional ending must not reset user's position");

 assert.deepEqual(errors.filter(x=>/presentation-runtime|rosary-scripture|TypeError|ReferenceError/i.test(x)),[],
   "PRAY threw runtime errors: "+errors.join(" | "));
 console.log("PASS PRAY full mobile routes "+routes.length+"/16 and Prayer Library 48/48 readable/source-labelled");
 await context.close();
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
