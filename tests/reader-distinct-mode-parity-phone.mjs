import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {distinctRiteSelectedVernacular} from "../src/mass/reader-native-preview.js";

const sample={latin:"Latine",english:"English edition",vernacular:"English edition",french:"Version française"};
assert.equal(distinctRiteSelectedVernacular(sample,{language:"en"}),"English edition");
assert.equal(distinctRiteSelectedVernacular(sample,{language:"fr"}),"Version française");
assert.equal(distinctRiteSelectedVernacular({latin:"Latine",english:"English edition"},{language:"fr"}),null,
  "French mode must never silently borrow an English translation");
assert.equal(distinctRiteSelectedVernacular({latin:"Latine"},{language:"en"}),null);

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
  ".woff2":"font/woff2",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(4363,"127.0.0.1",ok)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"fr-FR"});
  async function checkRite(rite,lang){
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(String(e?.message??e)));
    await page.goto("http://127.0.0.1:4363/tests/fixtures/reader-phone-harness.html?"+
      new URLSearchParams({mode:"LIVE",lang,rite}),{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
      null,{timeout:90000});
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.harnessReady),"true",
      rite+" fixture failed: "+await page.evaluate(()=>window.__AO_PHONE_HARNESS_ERROR||"unknown"));
    const label=rite==="good-friday"?"GOOD_FRIDAY":"EASTER_VIGIL";
    const snapshot=()=>page.evaluate(rite=>{
      const a=window.__AO_PHONE_PREVIEW,distinct=rite==="good-friday";
      const stage=distinct?a.getGoodFridayState().step?.recordId:a.getEasterVigilState().step?.recordId;
      return {mode:a.reader.getMode(),stage,composite:distinct?null:a.getCompositeStage(),
        owner:document.querySelector("#ao-r17-native-reader-preview")?.dataset?.r17CardOwner,
        text:document.querySelector(".ao-reader-paragraph")?.textContent?.slice(0,55),
        progression:document.querySelector('[data-role="progress"]')?.textContent,
        source:document.querySelector("#ao-r17-native-reader-preview")?.dataset?.r17NativeRiteRecord,
      };
    },rite);
    if(rite==="good-friday"){
      await page.evaluate(()=>window.__AO_PHONE_PREVIEW.goToGoodFridayRecord("GF-PASS-320"));
    }
    const before=await snapshot();
    assert.ok(before.stage,rite+" must have an exact rite record");
    assert.equal(before.mode,"LIVE");
    assert.equal(await page.locator("[data-ao-reader-shell]").getAttribute("data-mode"),"LIVE");
    async function chooseMode(mode){
      // The Mass mode ribbon lives inside the shared parameters panel.
      await page.locator("[data-reader-preferences]").click();
      await page.waitForFunction(()=>
        document.querySelector('[data-role="mass-preferences"]')?.dataset?.open==="true");
      const button=page.locator('[data-reader-mode="'+mode+'"]');
      assert.equal(await button.count(),1,rite+" missing shared "+mode+" mode selector");
      assert.equal(await button.isDisabled(),false,rite+" mode selector is locked");
      await button.click();
      await page.locator("[data-reader-preferences-close]").click();
    }
    for(const mode of ["MISSAL","SIMPLE","LIVE"]){
      await chooseMode(mode);
      const after=await snapshot();
      assert.equal(after.mode,mode);
      assert.equal(await page.locator("[data-ao-reader-shell]").getAttribute("data-mode"),mode);
      assert.equal(after.stage,before.stage,rite+" moved the original ceremony state during a display-only mode change");
      assert.equal(after.source,before.source,rite+" changed the source/rite ownership record");
      assert.equal(after.composite,before.composite,rite+" crossed Vigil→Mass boundary through mode toggle");
      assert.equal(after.progression,before.progression,rite+" lost the source stage progression");
      assert.ok(await page.locator(".ao-reader-paragraph").count()>0);
      if(mode==="MISSAL"){
        assert.equal(await page.locator("#ao-r17-native-reader-preview").getAttribute("data-ao-distinct-reading-focus"),null,
          "Missal should not retain LIVE focus opacity after changing mode");
      }else{
        assert.equal(await page.locator("#ao-r17-native-reader-preview").getAttribute("data-ao-distinct-reading-focus"),"1",
          "Simple/LIVE focus should be installed for the new display geometry");
      }
    }
    if(rite==="easter-vigil"){
      await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showVigilMassSequence(2));
      const atMass=await snapshot();
      assert.equal(atMass.composite,"MASS_ACTIVE");
      for(const mode of ["MISSAL","SIMPLE","LIVE"]){
        await chooseMode(mode);
        const after=await snapshot();
        assert.equal(after.mode,mode);
        assert.equal(after.composite,"MASS_ACTIVE","Mode switch cannot re-enter Vigil before Mass");
        assert.equal(after.source,atMass.source);
        assert.equal(after.progression,atMass.progression);
      }
    }
    assert.deepEqual(errors,[],rite+" emitted page errors");
    await page.close();
  }
  for(const rite of ["good-friday","easter-vigil"]){
    await checkRite(rite,"fr");
    await checkRite(rite,"en");
  }
  await context.close();
  console.log("PASS: Good Friday / Easter Vigil real 390px reader switches MISSAL↔SIMPLE↔LIVE without advancing source events; FR fails closed on missing translation.");
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
