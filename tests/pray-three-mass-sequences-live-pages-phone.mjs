// PUBLIC GitHub Pages acceptance for PRAY's three source-owned 1962 Sequentiae.
// This runs only after a successful Pages deployment; never tests localhost.
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {MASS_SEQUENCE_PRAYER_WORKS,projectMassSequencePrayer}
 from "../src/pray/mass-sequences-from-proper.v1.js";
import {RELEASE_PROOF_FILENAME,verifyReleaseProof}
 from "../tools/github-pages-release-proof.mjs";

const baseRaw=process.env.AO_PAGES_URL;
const sourceSha=process.env.GITHUB_SHA,runId=process.env.GITHUB_RUN_ID;
if(!baseRaw||!sourceSha||!runId)throw Error("PAGES_SEQUENCES_MISSING_RELEASE_IDENTITY");
const base=new URL(baseRaw.endsWith("/")?baseRaw:baseRaw+"/");
assert.equal(base.href,"https://fulcanelli13.github.io/ad-orientem/",
 "Live acceptance must use the real public GitHub Pages project");
const proofResponse=await fetch(new URL(RELEASE_PROOF_FILENAME,base),{
 signal:AbortSignal.timeout(30000),cache:"no-store",headers:{"cache-control":"no-cache"}
});
assert.equal(proofResponse.status,200,"Public release proof missing");
const proof=await proofResponse.json();
verifyReleaseProof(proof,{expectedSha:sourceSha,expectedRunId:runId});
for(const key of ["src/pray/mass-sequences-from-proper.v1.js",
 "src/pray/presentation-runtime.js","src/mass/1962-all-souls-sequence-english.js"])
 assert.match(proof.critical_sha256[key]??"",/^[a-f0-9]{64}$/,
  "Public source proof is missing Mass-sequence component "+key);

const normalized=text=>String(text??"").replace(/\s+/gu," ").trim();
let cases=0,browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const context=await browser.newContext({
   viewport:{width,height:width===320?700:844},hasTouch:true,isMobile:true,
   locale:language==="fr"?"fr-FR":"en-GB",serviceWorkers:"block"
  });
  const page=await context.newPage(),errors=[];
  page.setDefaultTimeout(25000);
  page.on("pageerror",error=>errors.push(error.message));
  try{
   const response=await page.goto(base.href,{waitUntil:"domcontentloaded",timeout:90000});
   assert.equal(response?.status(),200,"GitHub Pages did not serve the public entrypoint");
   await page.waitForFunction(()=>typeof globalThis.AO_APP_SHELL_V1?.navigate==="function"&&
    globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:65000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,language,{timeout:15000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
   const root="#aoPray435930.open ";
   await page.locator(root+"[data-ao-mass-sequence-library]").waitFor({timeout:20000});
   assert.equal(await page.locator(root+"[data-p435930-mass-sequence-open]").count(),3,
    "Public Prayer Library must expose all three Mass sequences");
   for(const work of MASS_SEQUENCE_PRAYER_WORKS){
    await page.locator(root+'[data-p435930-mass-sequence-open="'+work.id+'"]').tap();
    const owner=root+'[data-ao-pray-mass-sequence="'+work.id+'"]';
    await page.locator(owner+" [data-ao-mass-sequence-complete='true']")
     .waitFor({state:"attached",timeout:60000});
    assert.equal(await page.locator(owner+" [data-ao-mass-sequence-source]")
     .getAttribute("data-ao-mass-sequence-source"),work.sourcePath);
    const liveLatin=await page.locator(owner+' [data-ao-mass-sequence-language="la"]').innerText();
    const liveOther=await page.locator(owner+' [data-ao-mass-sequence-language="'+language+'"]').innerText();
    assert.ok(liveLatin.length>=work.minLatin,"Public Latin text unexpectedly short: "+work.id);
    assert.ok(liveOther.length>=work.minLatin*.6,"Public "+language+" text unexpectedly short: "+work.id);
    const actualProper=await page.evaluate(async date=>{
     const mass=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
     return {status:mass?.status,date:mass?.date,proper:{
      status:mass?.proper?.status,data:{
       id:mass?.proper?.data?.id,sourcePath:mass?.proper?.data?.sourcePath,
       sequence:mass?.proper?.data?.sequence
      }
     }};
    },work.date);
    const expected=projectMassSequencePrayer(work.id,actualProper);
    assert.equal(normalized(liveLatin),normalized(expected.latin),
     "Public Latin must exactly project the real Mass Proper: "+work.id);
    assert.equal(normalized(liveOther),normalized(language==="fr"?expected.french:expected.english),
     "Public "+language+" must exactly project the real Mass Proper: "+work.id);
    if(expected.sourceEditorialNote){
     assert.ok((await page.locator(owner+" [data-ao-mass-sequence-editorial-note]")
      .innerText()).includes(expected.sourceEditorialNote));
     assert.ok(!liveLatin.includes(expected.sourceEditorialNote),
      "An editorial attribution must not be recited as a liturgical verse");
    }
    assert.equal(await page.locator(owner+' a[href*="gregobase"]').count(),0,
     "Unapproved notation cannot be inserted into Prayer");
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,
     "Public mobile horizontal overflow: "+work.id+" "+language+" "+width);
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    await page.locator(root+"[data-ao-mass-sequence-library]").waitFor({timeout:15000});
    cases++;
    console.log("PASS PUBLIC PRAY 1962 MASS SEQUENCE "+work.id+" "+language+" "+width+
     "px source="+work.sourcePath+" latin="+liveLatin.length+" other="+liveOther.length);
   }
   assert.deepEqual(errors,[],"Public Prayer page threw browser exceptions");
  }finally{await context.close()}
 }
}finally{await browser?.close().catch(()=>{})}
assert.equal(cases,12,"All three sequences must pass in four live viewport/language contexts");
console.log("PASS "+cases+" public GitHub Pages Mass Sequentia cases on exact release "+
 sourceSha+" / run "+runId);
