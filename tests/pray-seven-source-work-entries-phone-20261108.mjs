import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAYER_SEVEN_SOURCE_WORK_LINKS_V1 as WORKS} from "../src/pray/prayer-seven-source-work-links.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../src/pray/holy-face-janvier-1887-b25.js";
import {HOLY_FACE_1895_FR_READER_DAYS,HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED} from "../src/pray/holy-face-janvier-1895-fr-reader-candidate.v1.js";
import {GOLDEN_ARROW_REPARATION_V1} from "../src/pray/icksp-golden-arrow-reparation.v1.js";
import {MONTFORT_B26_CONSECRATION_ACT_EN} from "../src/pray/montfort-consecration-b26.js";
import {montfortHistoricalPrayerRows} from "../src/pray/montfort-original-prayers-b27.js";
import {GOOD_DEATH_DYING_V384} from "../src/pray/good-death-data.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const normalize=s=>String(s||"").normalize("NFC").replace(/\s+/g,"");
const containsSource=(rendered,expected,label)=>{
 const norm=normalize(rendered),value=normalize(expected);
 assert.ok(value.length>4,label+" source fixture empty");
 assert.ok(norm.includes(value.slice(0,Math.min(75,value.length))),label+" source opening absent");
 assert.ok(norm.includes(value.slice(-Math.min(75,value.length))),label+" source ending absent");
};
const shell="#aoPray435930.open ";
let browser,checks=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errs=[];page.on("pageerror",e=>errs.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   for(const work of WORKS){
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    const browse=page.locator(shell+'[data-ao-prayer-subject-browser]');
    if(!await browse.evaluate(el=>el.open))await browse.locator("summary").evaluate(el=>el.click());
    await page.locator(shell+'[data-p435930-lib-subject="'+work.subject+'"]').evaluate(el=>el.click());
    const link=page.locator(shell+'[data-p435930-source-work="'+work.id+'"]');
    assert.equal(await link.count(),1,"Missing work card "+work.id);
    assert.ok((await link.innerText()).includes(ui==="fr"?work.fr:work.en),"Language title mismatch "+work.id+"/"+ui);
    await link.evaluate(el=>el.click());
    if(work.route==="pray.montfort_consecration"){
     await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView==="montfort",null,{timeout:15000});
     assert.equal(await page.locator(shell+"[data-ao-montfort-day]").getAttribute("data-ao-montfort-day"),String(work.options.day),"Wrong consecration preparation day "+work.id);
     if(work.options.historicalPrayer){
      const detail=page.locator(shell+'[data-ao-montfort-b27-original="'+work.options.historicalPrayer+'"]');
      assert.equal(await detail.count(),1);
      assert.equal(await detail.evaluate(el=>el.open),true,"Deep-linked historical prayer must be expanded");
      const rows=montfortHistoricalPrayerRows(work.options.historicalPrayer);
      const text=await detail.innerText();
      containsSource(text,rows[0].leader,work.id+" opening");
      if(work.options.historicalPrayer==="holySpirit"){
       const originalRows=await detail.locator('[data-ao-montfort-original-row]').count();
       assert.equal(originalRows,rows.filter(x=>x.kind!=="collect").length,"No litany invocation omitted");
       containsSource(text,rows[rows.length-1].leader,work.id+" closing collect");
      }else{
       const source=rows.filter(x=>x.kind==="original").map(x=>x.leader);
       assert.equal(await detail.locator('div[lang="en"] .aoMontfortB26Original').count(),source.length);
       assert.equal(await detail.locator('div[lang="la"] .aoMontfortB26Original').count(),rows.filter(x=>x.kind==="originalLatin").length);
      }
     }else{
      const original=page.locator(shell+'.aoMontfortB26Original[lang="en"]');
      assert.equal(await original.count(),MONTFORT_B26_CONSECRATION_ACT_EN.length,"Faber 1863 act missing paragraphs");
      containsSource(await original.allInnerTexts().then(v=>v.join(" ")),MONTFORT_B26_CONSECRATION_ACT_EN[0],work.id+" original act");
     }
    }else if(work.route==="pray.novenas"){
     await page.waitForFunction(()=>globalThis.AO_NOVENAS_V3?.state?.().id==="holy_face_1887"&&globalThis.AO_NOVENAS_V3.state().screen==="day"&&globalThis.AO_NOVENAS_V3.state().day===1,null,{timeout:15000});
     const current=page.locator(shell+"[data-ao-novena-deck]");
     assert.equal(await current.count(),1);
     await page.locator(shell+'[data-n1-mode="simple"]').evaluate(el=>el.click());
     const lang=ui==="fr"?"fr":"en";
     const visible=await page.locator(shell+'[data-n1-source-language="'+lang+'"]').allInnerTexts().then(x=>x.join(" "));
     const expected=lang==="fr"?HOLY_FACE_1895_FR_READER_DAYS[0].text:NOVENA_HOLY_FACE_1887_B25.days[0].text.en;
     containsSource(visible,expected,work.id+" original day one "+lang);
     if(lang==="fr"){
      assert.equal(HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED,true);
      assert.ok(await page.locator(shell+"[data-n1-holy-face-1895-source-notice]").count()>0);
      await page.locator(shell+"[data-n1-show-en]").click();
      const english=await page.locator(shell+'[data-n1-source-language="en"]').innerText();
      containsSource(english,NOVENA_HOLY_FACE_1887_B25.days[0].text.en,work.id+" distinct 1887 English witness");
     }
     assert.equal(NOVENA_HOLY_FACE_1887_B25.days.length,9);
    }else{
     await page.waitForFunction(route=>globalThis.AO_TRADITIONAL_PRAY_V381?.state?.().route===route,work.route,{timeout:15000});
     const state=await page.evaluate(()=>globalThis.AO_TRADITIONAL_PRAY_V381.state());
     if(work.id==="holy_face_golden_arrow"){
      assert.equal(state.sacredHeart,"golden_arrow");
      assert.equal(await page.locator(shell+'[data-ao-devo-card="heart-golden_arrow"]').count(),1);
      const card=page.locator(shell+'[data-ao-devo-card="heart-golden_arrow"] .aoTP381PrayerCard');
      const face=card.locator('[data-face-v],.aoTP381Reader');
      containsSource(await face.first().innerText(),ui==="fr"?GOLDEN_ARROW_REPARATION_V1.fr:GOLDEN_ARROW_REPARATION_V1.en,"Golden Arrow");
     }else{
      assert.equal(state.dying,work.options.dyingStep);
      assert.ok(await page.locator(shell+'[data-ao-dying-step="'+work.options.dyingStep+'"]').count()>=1,"Wrong bedside stage");
      const card=page.locator(shell+'[data-ao-devo-card="dying-'+work.options.dyingStep+'"] .aoTP381PrayerCard').last();
      assert.equal(await card.count(),1);
      const face=card.locator('[data-face-v],.aoTP381Reader');
      const original=work.id==="good_death_proficiscere"?GOOD_DEATH_DYING_V384.proficiscere:GOOD_DEATH_DYING_V384.aspirations;
      containsSource(await face.first().innerText(),ui==="fr"?original.fr:original.en,work.id);
      if(work.id==="good_death_proficiscere")assert.equal(await page.locator(shell+'[data-ao-proficiscere-witness-status]').count(),1);
     }
    }
    checks++;
   }
   assert.deepEqual(errs,[],"JS page error "+width+"/"+ui);
   console.log("PASS "+width+"px "+ui+": seven source-owned work entry points, exact day/step and source text");
  }finally{await ctx.close()}
 }
 assert.equal(checks,28);
 console.log("PASS 28/28 work-specific entry handoffs, 320/390px EN/FR, with no duplicated or invented prayer bodies");
}finally{await browser?.close().catch(()=>{});await new Promise(done=>server.close(done))}
