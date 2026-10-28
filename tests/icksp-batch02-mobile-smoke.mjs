import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-icksp-batch02");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4299,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4299/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 const open=async id=>{
  assert.equal(await page.evaluate(x=>globalThis.AO_PRAY_V435930.open(x,{returnContext:null}),id),true,"Cannot open "+id);
  await page.waitForSelector("#aoPray435930.open .aoP435930Body");
 };
 await open("pray.forty_hours");
 assert.equal(await page.locator("[data-ao-forty-mode='choose']").count(),1);
 assert.equal(await page.locator("[data-p435930-forty-mode='visitor']").count(),1);
 assert.equal(await page.locator("[data-p435930-forty-mode='solemn']").count(),1);
 await page.locator("[data-p435930-forty-mode='solemn']").tap();
 const solemn="#aoPray435930.open [data-ao-forty-mode='solemn']";
 assert.equal(await page.locator(solemn).count(),1);
 assert.equal(await page.locator(solemn+" [data-p435930-forty-solemn-jump]").count(),3);
 assert.equal(await page.locator(solemn).getAttribute("data-ao-forty-day"),"1");
 await page.locator(solemn+" [data-p435930-forty-solemn-jump='4']").tap();
 assert.equal(await page.locator(solemn).getAttribute("data-ao-forty-day"),"2");
 assert.match(await page.locator(solemn+" .aoDevoCardScroll").innerText(),/Mass for Peace/i);
 await page.locator(solemn+" [data-p435930-forty-solemn-jump='6']").tap();
 assert.equal(await page.locator(solemn).getAttribute("data-ao-forty-day"),"3");
 await page.locator(solemn+" [data-p435930-forty-solemn-next]").tap();
 await page.locator(solemn+" [data-p435930-forty-solemn-next]").tap();
 assert.equal(await page.locator(solemn).getAttribute("data-ao-forty-stage"),"day3-benediction");
 await page.screenshot({path:resolve(captures,"forty-solemn-390.png"),animations:"disabled"});
 await page.locator(solemn+" [data-p435930-forty-ben]").tap();
 assert.equal(await page.locator("#aoPray435930.open .aoP435930BenedictionReader").count(),1,"Must reuse the existing Benediction reader");
 await open("pray.forty_hours");
 await page.locator("[data-p435930-forty-mode='visitor']").tap();
 assert.equal(await page.locator("[data-ao-devotional-owner='fortyHours'] [data-ao-devo-card='forty-0']").count(),1,
  "Original six-stage visitor path must be retained");

 await open("pray.adoration");
 await page.locator(".aoAdorationMethodsDisclosure > summary").tap();
 await page.locator("[data-p435930-ador-mode='treasury']").tap();
 assert.equal(await page.locator("[data-ao-eucharistic-witness]").count(),3);
 const first=page.locator("[data-ao-eucharistic-witness='eucharistic_pange_lingua_full']");
 await first.locator("summary").tap();
 assert.match(await first.locator("[lang='la']").innerText(),/Pange, lingua, gloriosi/);
 assert.match(await first.locator("[lang='la']").innerText(),/Tantum ergo/);
 assert.equal(await page.locator(".aoBatch02OptionalSources a").first().isVisible(),false,"Modern linked alternatives must remain collapsed by default");
 await page.locator(".aoBatch02OptionalSources > summary").tap();
 assert.equal(await page.locator(".aoBatch02OptionalSources a").count(),4);
 await page.screenshot({path:resolve(captures,"adoration-treasury-390.png"),animations:"disabled"});
 // B10: the Four Ends always keep their canonical core prayer and silence.
 // Reopening Adoration retains the last-used Treasury mode; explicitly
 // return to the chooser before beginning a different devotional method.
 await open("pray.adoration");
 if(await page.locator("[data-p435930-ador-home]").count())
  await page.locator("[data-p435930-ador-home]").evaluate(el=>el.click());
 await page.locator(".aoAdorationMethodsDisclosure > summary").evaluate(el=>el.click());
 await page.locator("[data-p435930-ador-mode='four']").evaluate(el=>el.click());
 const four="#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode='four']";
 assert.equal(await page.locator(four).getAttribute("data-ao-adoration-step"),"0");
 assert.equal(await page.locator(four+" [data-ao-four-purpose='adoration']").count(),1);
 assert.equal(await page.locator(four+" [data-p435930-four-choice='adoration:adoration_litany_blessed_sacrament']").count(),1);
 const core=await page.locator(four+" .aoP435930GuidePrayers").first().innerText();
 const silence=await page.locator(four+" .aoP435930GuideCue").first().innerText();
 const reader=page.locator(four+" .aoDevoCardScroll");
 await reader.evaluate(el=>{el.dataset.preservedB10Reader="same"});
 await page.locator(four+" [data-p435930-four-choice='adoration:adoration_litany_blessed_sacrament']").evaluate(el=>el.click());
 assert.equal(await page.locator(four+" [data-ao-four-source='adoration_litany_blessed_sacrament']").count(),1);
 assert.match(await page.locator(four+" [data-ao-four-source]").innerText(),/Lord, have mercy|Seigneur, ayez pitié/);
 assert.equal(await page.locator(four+" .aoP435930GuidePrayers").first().innerText(),core);
 assert.equal(await page.locator(four+" .aoP435930GuideCue").first().innerText(),silence);
 assert.equal(await reader.getAttribute("data-preserved-b10-reader"),"same");
 assert.equal(await page.locator(four).getAttribute("data-ao-adoration-step"),"0","Prayer choice is not devotional progress");
 await page.screenshot({path:resolve(captures,"adoration-four-adoration-litany-390.png"),animations:"disabled"});
 await page.locator(four+" [data-p435930-four-choice='adoration:none']").evaluate(el=>el.click());
 assert.equal(await page.locator(four+" [data-ao-four-source]").count(),0);
 assert.equal(await page.locator(four+" .aoP435930GuidePrayers").first().innerText(),core);
 await page.locator(four+" .aoDevoSequenceTimeline .aoDevoStop").nth(2).evaluate(el=>el.click());
 assert.equal(await page.locator(four).getAttribute("data-ao-adoration-step"),"2");
 assert.equal(await page.locator(four+" [data-p435930-four-choice='reparation:sacred_heart_short_prayer']").count(),1);
 await page.locator(four+" [data-p435930-four-choice='reparation:sacred_heart_short_prayer']").evaluate(el=>el.click());
 assert.equal(await page.locator(four+" [data-ao-four-source='sacred_heart_short_prayer']").count(),1);
 assert.equal(await page.locator(four+" .aoP435930GuidePrayers .aoP435930Prayer").count(),1,"Existing Act of Contrition must remain intact");
 await page.screenshot({path:resolve(captures,"adoration-four-reparation-390.png"),animations:"disabled"});
 await page.locator(four+" .aoDevoSequenceTimeline .aoDevoStop").nth(3).evaluate(el=>el.click());
 await page.locator(four+" [data-p435930-four-choice='petition:church_prayer_for_pope']").evaluate(el=>el.click());
 assert.equal(await page.locator(four+" [data-ao-four-source='church_prayer_for_pope']").count(),1);
 await page.locator(four+" .aoDevoSequenceTimeline .aoDevoStop").nth(1).evaluate(el=>el.click());
 assert.equal(await page.locator(four+" [data-ao-four-purpose]").count(),0,"Thanksgiving must not use a misclassified meal/Communion prayer");
 assert.equal(await page.locator(four+" .aoP435930GuidePrayers .aoP435930Prayer").count(),1,"Original Glory Be remains");
 await page.locator(four+" .aoDevoSequenceTimeline .aoDevoStop").nth(4).evaluate(el=>el.click());
 assert.equal(await page.locator(four+" [data-ao-four-purpose]").count(),0,"Final silence must be free from prayer chooser");
 assert.equal(await page.locator(four+" [data-p435930-ador-quiet-enter]").count(),1);


 await open("pray.divine_mercy");
 const mercy="#aoPray435930.open [data-ao-mercy-bead-reader]";
 assert.equal(await page.locator(mercy).count(),1);
 assert.equal(await page.locator("[data-ao-mercy-opening-options]").count(),1);
 await page.locator("[data-ao-mercy-opening-options] > summary").tap();
 assert.equal(await page.locator("[data-ao-mercy-opening-options] a").count(),2);
 assert.match(await page.locator("[data-ao-mercy-opening-options]").innerText(),/Diary 1319/);
 assert.match(await page.locator("[data-ao-mercy-opening-options]").innerText(),/Diary 84/);
 await page.setViewportSize({width:320,height:720});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,
  "The Batch 2 prayer UI must not overflow the 320px phone viewport");
 await page.screenshot({path:resolve(captures,"mercy-optional-320.png"),animations:"disabled"});

 await open("pray.rosary_methods");
 const chooser=page.locator("[data-ao-rosary-chooser]");
 assert.equal(await chooser.count(),1);
 await page.locator("[data-p435930-rosary-customize]").tap();
 await page.locator("[data-p435930-rosary-choose='scriptural']").tap();
 assert.match(await chooser.innerText(),/Crampon 1923/);
 assert.ok(errors.length===0,"Browser errors: "+errors.join("; "));
 console.log("PASS Batch 2 phone: Forty Hours visitor/solemn, Benediction handoff, Eucharistic treasury, optional Mercy intros, Rosary provenance, 320px layout");
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
