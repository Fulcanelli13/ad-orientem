import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const shots=resolve(root,"artifacts/devotions-prayer-first-phone");
await mkdir(shots,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(file));
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce",locale:"en-US"});
  const errors=[];page.on("pageerror",e=>errors.push(String(e?.message||e)));
  const open=async route=>{
   const result=await page.evaluate(route=>window.AO_PRAY_V435930.open(route,{returnContext:null}),route);
   assert.equal(result,true,"Could not open "+route);
   await page.locator("#aoPray435930.open").waitFor({timeout:15000});
  };
  const expanded=async selector=>page.waitForFunction(selector=>document.querySelector(selector)?.open===true,selector,{timeout:10000});
  const checkDoc=async label=>{
   const state=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
    root:document.querySelector("#aoPray435930.open")?.dataset.aoPrayView}));
   assert.ok(state.scroll-state.width<=1,label+" horizontal overflow: "+JSON.stringify(state));
  };
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof window.AO_APP_SHELL_V1?.navigate==="function",
    null,{timeout:45000});
   const nav=await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"));
   assert.equal(nav?.ok,true,"Unable to activate the lazy Prayer destination");
   await page.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function",
    null,{timeout:45000});

   await open("pray.stations");
   const stations="#aoPray435930.open [data-ao-stations-options]";
   const st=page.locator(stations);
   const stDetails=await page.evaluate(()=>{
    const r=document.querySelector("#aoPray435930.open .aoP435930Stations"),
      prefs=r?.querySelector(":scope > [data-ao-stations-options]"),
      card=r?.querySelector(":scope > .aoDevoCard"),
      reader=card?.querySelector(":scope > .aoDevoCardScroll"),
      now=reader?.querySelector(":scope > .aoP435930GuideNow");
    return {first:r?.firstElementChild===prefs,
      prayerAfter:prefs?.nextElementSibling===card&&!!now,
      closed:!prefs?.open,count:r?.querySelectorAll("[data-ao-stations-options]").length,
      summaryHeight:prefs?.querySelector("summary")?.getBoundingClientRect().height,
      prayerText:now?.innerText?.slice(0,200),
      cardTitle:card?.querySelector(".aoDevoCardTitle")?.textContent?.trim(),
      cardScroll:reader?getComputedStyle(reader).overflowY:null,
      originalNav:r?.querySelectorAll("[data-p435930-station-next]").length,
      source:r?.querySelectorAll(".aoP435930Source a[href^='https://']").length||0,
      step:r?.querySelector(".aoP435930GuideNow small")?.textContent||""};
   });
   assert.ok(stDetails.first&&stDetails.prayerAfter&&stDetails.closed,
    "Stations should begin with one collapsed choice and the original prayer: "+JSON.stringify(stDetails));
   assert.equal(stDetails.count,1);
   assert.ok(stDetails.summaryHeight>=44&&stDetails.prayerText?.length>20&&
     stDetails.cardTitle?.length>5&&stDetails.cardScroll==="auto"&&stDetails.originalNav===1,
    "Station named card, local scroll, prayer or previous/next unavailable");
   assert.equal(await page.locator("#aoPray435930.open .aoP435930Stations [data-ao-recitation-control]").count(),0,
     "Global coherence is duplicating the canonical Stations recitation choice");
   await checkDoc("Stations opening");
   assert.equal(await st.locator('[data-p435930-seg="simple"]').isVisible(),false,
     "Stations controls are visible through a closed preferences drawer");
   await page.screenshot({path:resolve(shots,"stations-first-"+width+".png"),animations:"disabled"});
   await st.locator(":scope > summary").click();
   await expanded(stations);
   assert.ok(await st.locator(".aoP435930ModeRow [data-p435930-seg]").count()>=4,
    "Guided/Simple or Individual/Group control lost");
   assert.equal(await st.locator("[data-p435930-station-stabat]").count(),1);
   assert.ok(await st.locator(".aoP435930GuideInfo").count()>=1,"Stations Guide lost");
   const firstBefore=await page.locator("#aoPray435930.open .aoP435930GuideNow").innerText();
   await st.locator('[data-p435930-seg="simple"]').click();
   await expanded(stations);
   assert.equal(await st.locator('[data-p435930-seg="simple"]').getAttribute("aria-pressed"),"true");
   await st.locator('[data-p435930-seg="group"]').click();
   await expanded(stations);
   assert.equal(await st.locator('[data-p435930-seg="group"]').getAttribute("aria-pressed"),"true");
   await st.locator("[data-p435930-station-stabat]").check();
   await expanded(stations);
   assert.equal(await st.locator("[data-p435930-station-stabat]").isChecked(),true);
   assert.match(await st.locator(":scope > summary").innerText(),/Simple.*Group.*Stabat Mater/s);
   assert.equal(await page.locator("#aoPray435930.open .aoP435930GuideNow").innerText(),firstBefore,
    "Preferences unexpectedly advanced Station or replaced prayer");
   await st.locator(":scope > summary").click();
   await page.locator("#aoPray435930.open [data-p435930-station-next]").click();
   assert.match(await page.locator("#aoPray435930.open .aoP435930GuideNow").innerText(),/Station 2 of 14/i);
   assert.equal(await st.locator("[data-p435930-seg='group']").getAttribute("aria-pressed"),"true",
    "Preferences lost when moving between Stations");
   assert.equal(await st.getAttribute("open"),null,"Collapsed disclosure state lost at next Station");
   await page.screenshot({path:resolve(shots,"stations-second-"+width+".png"),animations:"disabled"});
   await checkDoc("Stations second station");

   await open("pray.angelus");
   const angelus="#aoPray435930.open [data-ao-angelus-options]";
   const ag=page.locator(angelus);
   const settings=page.locator("#aoPray435930.open [data-p435930-angelus-settings]");
   const angelusDom=await page.evaluate(()=>{
    const r=document.querySelector("#aoPray435930.open .aoP435930AngelusReader"),
      p=r?.querySelector(":scope > [data-ao-angelus-options]"),
      reader=r?.querySelector(":scope > .aoAngelusRitualGrid"),
      warning=r?.querySelector(":scope > .aoP435930Callout.warn"),
       settings=r?.closest(".aoP435930Mount")?.querySelector("[data-p435930-angelus-settings]");
    return {one:r?.querySelectorAll("[data-ao-angelus-options]").length,closed:!p?.open,
      abovePrayer:!!p&&!!reader&&!!(p.compareDocumentPosition(reader)&Node.DOCUMENT_POSITION_FOLLOWING),
       settings:!!settings,
      guideSources:p?.querySelectorAll(".aoAngelusGuideSection a[href^='https://']").length,
      paragraphs:reader?.querySelectorAll("[data-ao-angelus-unit]").length,
      hasVR:!!reader?.querySelector("[data-ao-angelus-voice=leader]")&&
        !!reader?.querySelector("[data-ao-angelus-voice=response]"),
      warningsVisible:!warning||warning.getClientRects().length>0,
      labelHeight:settings?.getBoundingClientRect().height};
   });
   assert.ok(angelusDom.one===1&&angelusDom.closed&&angelusDom.settings&&angelusDom.abovePrayer&&angelusDom.hasVR&&
      angelusDom.paragraphs>=3&&angelusDom.labelHeight>=44&&angelusDom.warningsVisible,
    "Angelus canonical prayer hierarchy damaged: "+JSON.stringify(angelusDom));
   assert.ok([4,5].includes(angelusDom.guideSources),
    "Angelus/Regina source-linked Guide was removed");
   assert.equal(await ag.locator('[data-p435930-seg="group"]').isVisible(),false,
     "Angelus recitation controls leak through the closed preferences drawer");
   assert.equal(await ag.locator('[data-p435930-seg="regina"]').isVisible(),false,
     "Angelus form controls leak through the closed preferences drawer");
   assert.equal(await page.locator("#aoPray435930.open .aoP435930AngelusReader [data-ao-recitation-control]").count(),0,
     "Global coherence is duplicating the canonical Angelus Individual/Group choice");
   assert.equal(await ag.locator('[data-p435930-seg="group"]').isVisible(),false,
     "Angelus recitation choice is visible outside its closed disclosure");
   await page.screenshot({path:resolve(shots,"angelus-first-"+width+".png"),animations:"disabled"});
   await settings.click();
   await expanded(angelus);
   await ag.locator('[data-p435930-seg="angelus"]').click();
   assert.equal(await ag.getAttribute("open"),null,
     "Choosing the Angelus form should dismiss the Folio popover before prayer");
   assert.equal(await page.locator("#aoPray435930.open [data-ao-angelus-form]").getAttribute("data-ao-angelus-form"),"angelus");
   await settings.click();
   await expanded(angelus);
   await ag.locator('[data-p435930-seg="group"]').click();
   await expanded(angelus);
   assert.equal(await page.locator("#aoPray435930.open [data-ao-angelus-recitation]").getAttribute("data-ao-angelus-recitation"),"group");
   assert.ok(await ag.locator(".aoAngelusGuideSection a[href^='https://']").count()===5);
   const guide=ag.locator(".aoAngelusGuide");
   await guide.locator(":scope > summary").click();
   assert.equal(await guide.evaluate(x=>x.open),true);
   await guide.locator(":scope > summary").click();
   await ag.locator('[data-p435930-seg="regina"]').click();
   assert.equal(await ag.getAttribute("open"),null,
     "Choosing Regina Cæli should dismiss the Folio popover before prayer");
   assert.equal(await page.locator("#aoPray435930.open [data-ao-angelus-form]").getAttribute("data-ao-angelus-form"),"regina");
   await settings.click();
   await expanded(angelus);
   assert.equal(await ag.locator(".aoAngelusGuideSection a[href^='https://']").count(),4);
   await settings.click();
   assert.equal(await ag.getAttribute("open"),null);
   assert.equal(await ag.locator('[data-p435930-seg="group"]').isVisible(),false,
     "Collapsed Regina settings still occupy prayer reading space");
   assert.ok(await page.locator("#aoPray435930.open [data-ao-angelus-voice=response]").count()>0);
   await page.screenshot({path:resolve(shots,"regina-first-"+width+".png"),animations:"disabled"});
   await checkDoc("Regina Cæli prayer");

   await open("pray.divine_mercy");
   const mercy=page.locator("#aoPray435930.open .aoMercyReader");
   assert.ok(await mercy.locator(".aoMercyPrayer").innerText().then(x=>x.length>15),
    "Divine Mercy prayer lost");
   assert.equal(await mercy.locator(".aoMercyControls button").count(),2);
   assert.equal(await mercy.locator(".aoMercyOptions button").count(),2);
   assert.equal(await mercy.locator(".aoMercySource a[href^='https://']").count(),1);
   const order=await mercy.evaluate(r=>{
    const text=r.querySelector(".aoMercyPrayer"),nav=r.querySelector(".aoMercyControls"),
      options=r.querySelector(".aoMercyOptions");
    return !!text&&!!nav&&!!options&&!!(text.compareDocumentPosition(nav)&Node.DOCUMENT_POSITION_FOLLOWING)
      &&!!(nav.compareDocumentPosition(options)&Node.DOCUMENT_POSITION_FOLLOWING);
   });
   assert.ok(order,"Divine Mercy settings should remain below the actual prayer and navigation");
   await mercy.locator("[data-p435930-mercy-next]").click();
   assert.match(await mercy.locator(".aoMercyControls").innerText(),/2\s*\/\s*62/);
   await page.screenshot({path:resolve(shots,"mercy-second-"+width+".png"),animations:"disabled"});
   await checkDoc("Divine Mercy");
   assert.deepEqual(errors,[],"Uncaught errors in devotional readers: "+errors.join("; "));
   console.log("PASS "+width+"px Stations/Angelus/Divine Mercy prayer-first controls, source links, state and navigation");
  }finally{await page.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
