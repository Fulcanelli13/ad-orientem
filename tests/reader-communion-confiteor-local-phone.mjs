import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {readMassCustomaryPreferences,updateMassCustomaryPreferences}
 from "../src/mass/reader-customary-preferences.js";
import {resolveReaderPreferences} from "../src/mass/reader-state.js";

const pure=resolveReaderPreferences({mode:"LIVE",secondConfiteor:true});
assert.equal(pure.secondConfiteor,true,"Source preference discarded optional local custom");
const memory=new Map();
const storage={
 getItem:key=>memory.get(key)??null,
 setItem:(key,val)=>memory.set(key,val)
};
let saved=readMassCustomaryPreferences({mode:"LIVE"},storage);
assert.equal(saved.secondConfiteor,false,"Normative 1962 default must omit Communion Confiteor");
saved=updateMassCustomaryPreferences(saved,{kind:"secondConfiteor",value:"true"},storage);
assert.equal(saved.secondConfiteor,true);
assert.equal(readMassCustomaryPreferences({mode:"LIVE"},storage).secondConfiteor,true,
 "Observed Communion custom did not persist");
saved=updateMassCustomaryPreferences(saved,{kind:"secondConfiteor",value:"false"},storage);
assert.equal(saved.secondConfiteor,false);
assert.equal(readMassCustomaryPreferences({mode:"LIVE"},storage).secondConfiteor,false);

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const srv=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+p);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,no)=>{srv.once("error",no);srv.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},
  hasTouch:true,isMobile:true,deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 const url="http://127.0.0.1:"+srv.address().port+
   "/tests/fixtures/reader-phone-harness.html?aoLiveCards=65";
 await page.goto(url,{waitUntil:"networkidle",timeout:60000});
 await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
  null,{timeout:30000});
 const locate=()=>page.evaluate(()=>{
  const a=window.__AO_PHONE_PREVIEW,card=a.model.cards.find(c=>
   c.title==="Second Confiteor · Optional Local Custom");
  return {cardSequence:card?.sequence??null,
   named:a.model.cards.some(c=>c.title==="Ecce Agnus Dei · Preparation of the Faithful"),
   confiteor:card?.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0235")),
   misereatur:card?.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0238")),
   indulgentiam:card?.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0240"))};
 });
 const source=await locate();
 assert.ok(source.cardSequence&&source.confiteor&&source.misereatur&&source.indulgentiam,
  "Source Confiteor, Misereatur and Indulgentiam must remain unaltered");
 assert.equal(source.named,true);
 assert.equal(await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq)!==null,
  source.cardSequence),false,"1962 ordinary reader must omit local Confiteor by default");
 await page.locator("[data-reader-preferences]").first().click();
 const select=page.locator('[data-reader-customary="secondConfiteor"]');
 await select.waitFor({state:"visible"});
 assert.equal(await select.inputValue(),"false");
 await select.selectOption("true");
 assert.equal(await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq)!==null,
  source.cardSequence),true,"Observed local Confiteor remains hidden after preference toggle");
 assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard()?.title),
  "Second Confiteor · Optional Local Custom");
 const visibleName=await page.locator('[data-role="section-title"]').first().evaluate(el=>({
  text:el.textContent.trim(),whiteSpace:getComputedStyle(el).whiteSpace,
  display:getComputedStyle(el).display
 }));
 assert.equal(visibleName.text,"Second Confiteor · Optional Local Custom");
 assert.equal(visibleName.whiteSpace,"normal",
  "Named LIVE prayer must wrap rather than truncate in the top ribbon");
 assert.equal(await page.locator(".ao-prayer-title").first().isVisible(),false,
  "LIVE must not duplicate the top ribbon prayer heading inside the card");
 const rendered=await page.locator(".ao-prayer-body").first().innerText();
 assert.match(rendered,/I confess to Almighty God/);
 assert.match(rendered,/May Almighty God have mercy upon you/);
 assert.match(rendered,/grant us pardon/);
 const afterChoice=await page.evaluate(()=>({
  custom:JSON.parse(localStorage.getItem("ao-mass-customary-v1")||"{}"),
  visible:document.querySelector('[data-reader-customary="secondConfiteor"]')?.value
 }));
 assert.equal(afterChoice.custom.secondConfiteor,true);
 assert.equal(afterChoice.visible,"true");
 await page.reload({waitUntil:"networkidle",timeout:60000});
 await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
  null,{timeout:30000});
 assert.equal(await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq)!==null,
  source.cardSequence),true,"Persisted local Communion Confiteor lost after reload");
 await page.locator("[data-reader-preferences]").first().click();
 await page.locator('[data-reader-customary="secondConfiteor"]').selectOption("false");
 assert.equal(await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq)!==null,
  source.cardSequence),false,"Turning local Confiteor off did not restore 1962 default");
 assert.deepEqual(errors,[],"JS errors during local Confiteor preference on phone");
 await context.close();
 console.log("PASS real mobile LIVE local Confiteor on/off/persisted, all three canonical texts, 1962 default preserved");
}finally{
 await browser?.close();
 await new Promise(ok=>srv.close(ok));
}
