import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
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
 const pageErrors=[];page.on("pageerror",e=>pageErrors.push(String(e?.message??e)));
 await page.goto("http://127.0.0.1:4196/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(async()=>globalThis.AO_PRAY_APP_V1.open()),true,"Lazy Prayer owner did not load");
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus",{returnContext:null})),true);
 await page.waitForSelector("#aoPray435930.open [data-ao-devotional-guide='angelus']",{timeout:12000});
 assert.equal(await page.locator("#aoPray435930 .aoAngelusGuideSection").count(),5);
 assert.equal(await page.locator("#aoPray435930 .aoAngelusGuideSection a[href^='https://']").count(),5);
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
 const flip=page.locator("#aoPray435930 .aoP435930PrayerUnit [data-p435930-card-flip]").first();
 await flip.evaluate(x=>x.click());
 assert.equal(await flip.locator("[data-face-la]").evaluate(x=>x.hidden),false,"Latin replacement did not open");
 await page.locator("#aoPray435930 [data-p435930-seg='regina']").first().evaluate(x=>x.click());
 assert.equal(await page.locator("#aoPray435930 [data-ao-angelus-form]").getAttribute("data-ao-angelus-form"),"regina");
 assert.equal(await page.locator("#aoPray435930 .aoAngelusGuideSection").count(),4);
 assert.equal(await page.locator("#aoPray435930 [data-p435930-angelus-appendix]").count(),0,"Angelus-only appendix leaked into Regina Caeli");
 await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.rosary",{returnContext:null}));
 await page.waitForFunction(()=>!!document.querySelector("#aoPrayerBookRoot.open .aoRosaryGuide"),null,{timeout:18000});
 const guide=page.locator("#aoPrayerBookRoot.open .aoRosaryGuide");
 assert.equal(await guide.locator(".aoRosaryGuideSection").count(),6);
 assert.equal(await guide.locator(".aoRosaryGuideSection a[href^='https://']").count(),6);
 const before=await page.evaluate(()=>globalThis.AO_ROSARY_V381?.state?.()?.step??null);
 await guide.locator("summary").evaluate(x=>x.click());
 assert.equal(await guide.evaluate(x=>x.open),true);
 const after=await page.evaluate(()=>globalThis.AO_ROSARY_V381?.state?.()?.step??null);
 assert.equal(after,before,"opening Rosary Guide must not advance beads");
 await page.evaluate(()=>globalThis.AO_PRAY_V435930?.open?.("pray.rosary",{returnContext:null}));
 await page.waitForFunction(()=>!!document.querySelector("#aoPrayerBookRoot.open .aoRosaryGuide"),null,{timeout:15000});
 assert.equal(await page.locator("#aoPrayerBookRoot.open .aoRosaryGuide").evaluate(x=>x.open),true,"reopened Rosary player lost Guide state");
 // The 200 inherited English cue extracts are archived for verification, not
 // rendered as authoritative Scripture in the actively selected decade.
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
 const beadSource=guidedCue.locator("a[data-ao-rosary-meditation-source]");
 assert.equal(await beadSource.count(),1,"Guided bead lacks contextual primary witness");
 assert.match(await beadSource.innerText(),/Luke 1:26-27/);
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
 assert.equal(pageErrors.filter(x=>/angelus-guide|rosary-guide|presentation-runtime|undefined/i.test(x)).length,0,"Marian reader threw a runtime error: "+pageErrors.join(" | "));
 console.log("PASS Marian Angelus/Regina Caeli and Rosary mobile Guide acceptance");
 await context.close();
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}
