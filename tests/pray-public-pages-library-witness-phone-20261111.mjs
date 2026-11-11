/**
 * Post-publication Prayer Library witness acceptance on the REAL GitHub Pages
 * project. Supplements (never replaces) exhaustive localhost 48/19/41 suites.
 * No claim of original printed-edition certification or all-stage coverage.
 */
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {chromium} from "@playwright/test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {COMMUNION_TREASURY_V383} from "../src/pray/traditional-pray-data.js";
import {RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1} from "../src/pray/red-booklet-communion-library-links.v1.js";
import {libraryVariantFamily} from "../src/pray/library-variant-groups.js";
import {RELEASE_PROOF_FILENAME,verifyReleaseProof} from "../tools/github-pages-release-proof.mjs";

const base=new URL(process.env.AO_PAGES_URL||"");
assert.equal(base.href,"https://fulcanelli13.github.io/ad-orientem/",
 "Public Prayer audit must target only canonical GitHub Pages, not localhost or Vercel");
const expectedSha=process.env.GITHUB_SHA,expectedRunId=process.env.GITHUB_RUN_ID;
assert.match(expectedSha||"",/^[a-f0-9]{40}$/i);
assert.match(expectedRunId||"",/^\d+$/);
const proofResponse=await fetch(new URL(RELEASE_PROOF_FILENAME,base),{
 cache:"no-store",headers:{"cache-control":"no-cache"},
 signal:AbortSignal.timeout(30000)
});
assert.ok(proofResponse.ok,"Deployed Pages release proof unavailable");
const proof=await proofResponse.json();
verifyReleaseProof(proof,{expectedSha,expectedRunId});

const canonical=PRAY_CANONICAL_DATA_V435930.prayers;
const heldId="marian_consecration_immaculate_heart";
assert.ok(canonical.foundations_our_father?.en&&canonical.foundations_our_father?.fr);
assert.ok(canonical[heldId]?.en&&!canonical[heldId]?.fr&&!canonical[heldId]?.la,
 "This specific original English-only recension is intentionally held in French/Latin");
const communion=RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1.find(x=>x.sourceId==="thanksgivingMyGoodJesus");
assert.ok(communion&&communion.phase==="after");
const communionSource=COMMUNION_TREASURY_V383[communion.sourceId];
assert.ok(communionSource?.en&&!communionSource?.fr&&communionSource.sourceUrl);
const output=resolve("artifacts/github-pages-phone/pray-library-live");
await mkdir(output,{recursive:true});
const report={schema:"ao.pray.public-pages-reader-witness.v1",sourceSha:expectedSha,
 runId:expectedRunId,origin:base.href,scope:"12 actual public reader paths, not entire Prayer or print certificate",
 cases:[],errors:[]};
const norm=v=>String(v??"").normalize("NFC").replace(/\s/g,"");
const scope="#aoPray435930.open ";
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const context=await browser.newContext({
   viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,
   deviceScaleFactor:1,locale:ui==="fr"?"fr-FR":"en-GB",
   reducedMotion:"reduce",serviceWorkers:"block"
  });
  const page=await context.newPage(),pageErrors=[];
  page.on("pageerror",e=>pageErrors.push(String(e.message||e)));
  try{
   await page.goto(new URL("index.html",base).href,{
    waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&
    typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:60000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]')
    .click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]')
    .click();
   await page.waitForFunction(value=>document.documentElement.lang===value,ui,{timeout:12000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function"&&
    typeof globalThis.AO_TRADITIONAL_PRAY_V381?.open==="function",
    null,{timeout:40000});

   for(const id of ["foundations_our_father",heldId]){
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open(
     "pray.library",{returnContext:null})),true);
    const family=libraryVariantFamily(id);
    if(family){
     const details=page.locator(scope+'[data-ao-prayer-family="'+family+'"]');
     if(!await details.evaluate(el=>el.open))await details.locator("summary").first().click();
    }
    const entry=page.locator(scope+'[data-p435930-lib-open="'+id+'"]');
    assert.equal(await entry.count(),1,"Missing public Library source identity: "+id);
    await entry.click();
    const reader=page.locator(scope+".aoP435930LibraryReader");
    await reader.locator('[data-ao-devo-card="'+id+'"]').waitFor({state:"attached",timeout:15000});
    const state=await reader.evaluate(el=>({
     owner:el.closest(".aoP435930Mount")?.dataset.aoPrayView,
     source:document.querySelectorAll("#aoPray435930.open .aoP435930Source").length,
     charCount:el.querySelector('[data-ao-devo-card]')?.textContent?.trim().length||0,
     overflow:Math.max(0,el.scrollWidth-el.clientWidth)
    }));
    assert.equal(state.owner,"library","Canonical reader source owner changed: "+id);
    assert.ok(state.charCount>50&&state.source>=1,
     "Empty prayer body or source disclosure: "+id+" "+JSON.stringify(state));
    assert.ok(state.overflow<=2,"Reader clipped at "+width+"px: "+id);
    const displayed=await reader.innerText();
    if(id===heldId){
     assert.equal(displayed.includes(ui==="fr"?
      "Aucune traduction vernaculaire":"No vernacular translation"),ui==="fr",
      "English-only Marian source must disclose missing French only to FR readers");
     assert.equal(await reader.locator('[data-p435930-essential-language="fr"]').count(),0,
      "Unattested French translation surfaced for Immaculate Heart");
    }
    assert.equal(await reader.locator("[data-p435930-lib-back]").count(),0,
     "Canonical reader duplicated header Back");
    await page.locator(scope+"[data-p435930-back]").click();
    assert.equal(await page.locator(scope+".aoP435930LibraryReader").count(),0,
     "Canonical Back failed to return to Library");
    report.cases.push({width,ui,route:"canonical",id,languageHold:id===heldId&&ui==="fr",
     printedEditionCertified:false});
   }

   // Open the existing Communion witness through the public Library pointer:
   // neither a new prayer nor a claimed word-for-word 2013 booklet edition.
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open(
    "pray.library",{returnContext:null})),true);
   const subject=page.locator(scope+"[data-ao-prayer-subject-browser]");
   if(!await subject.evaluate(el=>el.open))await subject.locator("summary").click();
   await page.locator(scope+'[data-p435930-lib-subject="III"]').click();
   const link=page.locator(scope+'[data-p435930-red-communion="'+communion.id+'"]');
   assert.equal(await link.count(),1,"Published Communion pointer not discoverable");
   await link.click();
   await page.waitForFunction(phase=>{
    const s=globalThis.AO_TRADITIONAL_PRAY_V381?.state?.();
    return s?.route==="pray.communion_treasury"&&s?.communion===phase;
   },communion.phase,{timeout:18000});
   const sourceCard=page.locator(scope+'[data-ao-devo-card="communion-'+
    communion.phase+"-"+communion.sourceId+'"]');
   await sourceCard.waitFor({state:"attached",timeout:18000});
   const face=sourceCard.locator("[data-face-v],.aoTP381Reader").first();
   assert.equal(norm(await face.innerText()),norm(communionSource.en),
    "Public Communion body differs from existing original English source");
   assert.equal(await face.getAttribute("lang"),"en",
    "English source is mislabelled as a French translation");
   assert.equal(await sourceCard.locator("[data-tp381-source-language-fallback]").count(),
    ui==="fr"?1:0,"Original English source fallback warning wrong");
   assert.equal(await sourceCard.locator("details.aoTP381Source a").getAttribute("href"),
    communionSource.sourceUrl,"Published source URL absent from Communion card");
   assert.ok((await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth)))<=2,
    "Published Prayer page has horizontal overflow");
   assert.deepEqual(pageErrors,[],"Public browser exceptions: "+width+"/"+ui);
   if(ui==="fr")await page.screenshot({path:resolve(output,"pray-fr-"+width+".png"),
    animations:"disabled",fullPage:false});
   report.cases.push({width,ui,route:"communion",id:communion.sourceId,
    originalLanguage:"en",fallbackVisible:ui==="fr",wordingCollatedAgainst2013:false});
   console.log("PAGES_PRAYER_READER_PASS "+width+"px "+ui+" 3/3 source-owned readers");
  }catch(e){
   report.errors.push({width,ui,message:String(e?.stack||e)});
   throw e;
  }finally{await context.close();}
 }
 assert.equal(report.cases.length,12);
 console.log("PAGES_PRAYER_12_READER_WITNESS_PASS "+JSON.stringify({
  sha:expectedSha,caseCount:report.cases.length,printedEditionCertified:false}));
}finally{
 await writeFile(resolve(output,"public-reader-witness.json"),
  JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
}
