import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const base=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const path=resolve(base,"."+name);
  if(path!==base&&!path.startsWith(base+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:"+server.address().port+"/tests/fixtures/rogation-premass.html");
 await page.evaluate(async()=>{
  const {mountFullMassPreflight}=await import("/src/mass/full-mass-preflight.js");
  await import("/src/mass/full-mass-preflight-styles.js");
  globalThis.__formDate="2026-10-04";globalThis.__lang="en";
  globalThis.__kind="CALENDAR";globalThis.__formDefault="sung";globalThis.__ready=true;
  globalThis.__legacyMass=()=>({canStart:__ready,date:__formDate,
    calendarDay:{id:"TEMP.XIX",title:"Nineteenth Sunday after Pentecost"},
    celebrationId:__kind==="CALENDAR"?"mass_of_day":__kind.toLowerCase(),
    requestedCelebrationId:__kind==="CALENDAR"?"mass_of_day":__kind.toLowerCase(),
    celebrationType:__kind});
  globalThis.__full=mountFullMassPreflight({doc:document,
    getResolvedMass:__legacyMass,getDefaultForm:()=>__formDefault,language:()=>__lang});
 });
 await page.waitForSelector("[data-ao-full-mass-preflight]");
 assert.equal(await page.locator("[data-full-mass-form]").count(),4);
 assert.equal(await page.locator('[data-full-mass-form][value="MISSA_CANTATA_INCENSE"]').isChecked(),true);
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-celebration-kind"),"CALENDAR");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","SOLEMN","MISSA_CANTATA_INCENSE"]){
  await page.locator('[data-full-mass-form][value="'+form+'"]').check();
  const selected=await page.evaluate(()=>__full.selectionFor(__legacyMass()));
  assert.equal(selected.form,form);
  assert.equal(selected.explicitlyChosenForm,true);
  assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-chosen-mass-form"),form);
 }
 await page.evaluate(()=>{__kind="REQUIEM";__lang="fr";__full.refresh()});
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/Requiem/);
 assert.match(await page.locator("[data-full-mass-form-title]").innerText(),/Comment/);
 await page.evaluate(()=>{__kind="VOTIVE";__full.refresh()});
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/votive/i);
 await page.evaluate(()=>{__kind="NUPTIAL";__full.refresh()});
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/nuptiale/i);
 await page.evaluate(()=>{__kind="CALENDAR";__formDate="2026-10-11";__full.refresh()});
 assert.equal(await page.locator('[data-full-mass-form][value="MISSA_CANTATA_INCENSE"]').isChecked(),true,
  "Selection leaked across a different Mass date");
 assert.equal((await page.evaluate(()=>__full.status())).explicitlyChosenForm,false);
 await page.evaluate(()=>{__kind="CALENDAR";__formDate="2026-10-12";__ready=false;__full.refresh()});
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-proper-ready"),"false");
 await page.evaluate(()=>{
  __ready=true;__kind="CALENDAR";__formDate="2026-10-13";
  __legacyMass=()=>({canStart:true,date:__formDate,
    calendarDay:{id:"Quad6-5"},exceptionalProfile:"good-friday-1962"});
  __full.dispose();
});
 // A new mount can be reinitialized for distinct non-Mass rites.
 await page.evaluate(async()=>{
  const {mountFullMassPreflight}=await import("/src/mass/full-mass-preflight.js");
  __full=mountFullMassPreflight({doc:document,getResolvedMass:__legacyMass,
    getDefaultForm:()=>__formDefault,language:()=>__lang});
 });
 assert.equal(await page.locator("[data-full-mass-form-fieldset]").isDisabled(),true);
 assert.match(await page.locator("[data-full-mass-note]").innerText(),/ce n’est pas une messe/i);
 const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(horizontal<=1,"390px phone overflow: "+horizontal);
 assert.deepEqual(errors,[]);
 console.log("Full Mass 390px phone: PASS — low/MC/Solemn choices, source-owned Mass classes, date reset and Good Friday firewall.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
