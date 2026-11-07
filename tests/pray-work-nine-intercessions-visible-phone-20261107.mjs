/**
 * Stage 6: visible body / source-language parity for the nine supplemental
 * priestly and occasional intentions. Existing readers only; no text copies,
 * no source-status promotion, and no private confession inputs.
 *
 * node tests/pray-work-nine-intercessions-visible-phone-20261107.mjs
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRIESTLY_INTERCESSIONS_B19,PRIESTLY_INTERCESSION_PURPOSES_B19,priestlyIntercessionFor} from "../src/pray/priestly-intercessions-b19.js";
import {OCCASIONAL_PURPOSES_B20,occasionalIntercessionFor} from "../src/pray/occasional-intercessions-b20.js";
import {OCCASIONAL_PURPOSES_ALL_B21,occasionalIntercessionB21For, OCCASIONAL_INTERCESSIONS_B21} from "../src/pray/occasional-intercessions-b21.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-work-nine-intercessions");
await mkdir(output,{recursive:true});
const registry=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-work-identity-registry-20261106.v1.json"),"utf8"));
const ids=new Set(registry.works.map(w=>w.id));
const nine=[
 ...PRIESTLY_INTERCESSIONS_B19.map(w=>w.id),
 ...registry.works.filter(w=>w.legacyRows[0]>=65&&w.legacyRows[0]<=69).map(w=>w.id)
];
assert.equal(PRIESTLY_INTERCESSIONS_B19.length,3);
assert.equal(OCCASIONAL_PURPOSES_ALL_B21.length,6);
assert.equal(nine.length,8,"Five imported occasional prayers plus three priestly; the sixth occasional reuses canonical St Joseph");
assert.ok(nine.every(id=>ids.has(id)),"All eight supplemental source prayer identities must appear in registry");
const canonicalJoseph=PRAY_CANONICAL_DATA_V435930.prayers.devotion_ad_te_beate_ioseph;
assert.ok(canonicalJoseph&&ids.has("devotion_ad_te_beate_ioseph"));
const sourceIds=new Set([...nine,"devotion_ad_te_beate_ioseph"]);
const plain=s=>String(s??"").normalize("NFC").replace(/\s+/g,"");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const report={schema:"ao.pray.stage6-nine-intercessions-visible-phone.v1",
 scope:"Exact source-text bodies displayed in existing priestly/occasional readers. Does not certify first-edition print witnesses, all 84 work bodies or full-language translation coverage.",
 cases:[],errors:[],sourceWorkIds:[...sourceIds],counts:{selection:0,alternates:0,sourceNotices:0},widths:[320,390],uiLanguages:["en","fr"]};
let browser;
async function readVisible(page,selector){
 return await page.locator(selector).evaluate(el=>({lang:el.getAttribute("lang"),text:el.textContent||""}));
}
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:"block",reducedMotion:"reduce",locale:ui==="fr"?"fr-FR":"en-GB"});
  const page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(String(e.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true && typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(ui=>document.documentElement.lang===ui,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const open=async route=>{
    assert.equal(await page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),route),true,route+" open failed");
   };
   // All three priestly prayers; the 1914 witness has no invented FR or LA.
   await open("pray.for_priests");
   const priestSel="#aoPray435930.open [data-ao-priests-intercession]";
   await page.locator(priestSel).waitFor();
   for(const purpose of PRIESTLY_INTERCESSION_PURPOSES_B19){
    await page.locator(priestSel+' [data-p435930-priests-purpose="'+purpose+'"]').click();
    const selector=priestSel+" .aoPriestsText";
    const actual=await readVisible(page,selector);
    const expected=[priestlyIntercessionFor(purpose,ui,false),priestlyIntercessionFor(purpose,ui,true)].find(p=>p?.language===actual.lang&&plain(p.text)===plain(actual.text));
    assert.ok(expected,"Pray for Priests "+purpose+" "+ui+" "+width+" lost exact historical source text: "+JSON.stringify({actual,source:priestlyIntercessionFor(purpose,ui,false)?.language}));
    assert.ok(plain(actual.text).length>70,"Truncated priestly prayer "+purpose);
    if(ui==="fr"&&expected.labelOriginal){
     const note=await page.locator(priestSel+" .aoPriestsLanguage").innerText();
     assert.match(note,/anglais|historique/i,"French UI must disclose original English without inventing translation");
     report.counts.sourceNotices++;
    }
    const source=page.locator(priestSel+" .aoPriestsSource");
    assert.equal(await source.count(),1,"Source/attribution disclosure absent");
    report.cases.push({width,ui,route:"pray.for_priests",sourceId:PRIESTLY_INTERCESSIONS_B19.find(w=>w.purpose===purpose)?.id,purpose,language:actual.lang,bodyMatch:true,sourceNote:true});
    report.counts.selection++;
    const toggle=page.locator(priestSel+" [data-p435930-priests-latin]");
    if(await toggle.count()){
      await toggle.click();
      const changed=await readVisible(page,selector);
      const alternate=[priestlyIntercessionFor(purpose,ui,false),priestlyIntercessionFor(purpose,ui,true)].find(p=>p?.language===changed.lang&&plain(p.text)===plain(changed.text));
      assert.ok(alternate&&alternate.language!==actual.lang,"Priestly EN/LA language toggle must change actual source witness");
      report.counts.alternates++;
    }
   }
   await open("pray.occasional_intercessions");
   const occSel="#aoPray435930.open [data-ao-occasional-intercession]";
   await page.locator(occSel).waitFor();
   const resolveOcc=(purpose,toggle)=>OCCASIONAL_PURPOSES_B20.includes(purpose)
    ?occasionalIntercessionFor(purpose,ui,toggle,canonicalJoseph)
    :occasionalIntercessionB21For(purpose,ui,toggle,canonicalJoseph);
   for(const purpose of OCCASIONAL_PURPOSES_ALL_B21){
    await page.locator(occSel+' [data-p435930-occasional-purpose="'+purpose+'"]').click();
    const selector=occSel+" .aoOccasionalText";
    const actual=await readVisible(page,selector);
    const candidates=[resolveOcc(purpose,false),resolveOcc(purpose,true)];
    const expected=candidates.find(p=>p?.language===actual.lang&&plain(p.text)===plain(actual.text));
    assert.ok(expected,"Occasional "+purpose+" "+ui+" "+width+" visible body doesn't match source: "+JSON.stringify({actual:actual.lang,candidates:candidates.map(p=>p?.language)}));
    assert.ok(plain(actual.text).length>70,"Truncated occasional prayer "+purpose);
    const id=purpose==="difficulties"?"devotion_ad_te_beate_ioseph":registry.works.find(w=>w.legacyRows[0]>=65&&w.legacyRows[0]<=69&&w.sourceOwnerEvidence&&w.id.includes(purpose))?.id;
    if(purpose==="difficulties")assert.equal(expected.text,canonicalJoseph[actual.lang],"Existing canonical St Joseph text must be reused without copy");
    if(ui==="fr"&&expected.labelOriginal){
      const notice=await page.locator(occSel+" .aoOccasionalLanguage").innerText();
      assert.match(notice,/anglais|historique/i,"Missing French disclosure for unattested translation: "+purpose);
      report.counts.sourceNotices++;
    }
    assert.equal(await page.locator(occSel+" .aoOccasionalSource").count(),1);
    report.cases.push({width,ui,route:"pray.occasional_intercessions",purpose,sourceId:id||null,language:actual.lang,bodyMatch:true,sourceNote:true});
    report.counts.selection++;
    const toggle=page.locator(occSel+" [data-p435930-occasional-latin]");
    if(await toggle.count()){
      await toggle.click();
      const changed=await readVisible(page,selector);
      const other=candidates.find(p=>p?.language===changed.lang&&plain(p.text)===plain(changed.text));
      assert.ok(other&&other.language!==actual.lang,"Occasional source witness toggle failed: "+purpose);
      report.counts.alternates++;
    }
   }
   assert.deepEqual(errors,[],"Uncaught browser errors: "+JSON.stringify(errors));
   console.log("PASS intercession visible-source parity "+width+" "+ui+": 3 priest + 6 occasional, disclosed language witnesses");
  }catch(e){report.errors.push({width,ui,message:String(e.stack||e)});throw e}
  finally{await context.close()}
 }
 assert.equal(report.cases.length,36,"Nine source roles x 2 sizes x 2 UI languages");
 assert.equal(report.counts.selection,36);
 assert.equal(report.errors.length,0);
 console.log("PASS 36/36 actual reader-body selections across 8 supplemental + 1 canonical reused works; edition certification held.");
}finally{
 await writeFile(resolve(output,"nine-intercessions-visible-source.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
