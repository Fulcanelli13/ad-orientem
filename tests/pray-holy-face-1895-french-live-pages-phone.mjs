/**
 * Public GitHub Pages read-only acceptance, not a local server simulation.
 * Runs after deployment and verifies exact source SHA and all nine original
 * Janvier 1895 French day texts in 320/390 native Simple reader, plus the
 * separately preserved English original witness.
 */
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {HOLY_FACE_1895_FR_READER_DAYS as originalFrench,HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED} from "../src/pray/holy-face-janvier-1895-fr-reader-candidate.v1.js";
import {NOVENA_HOLY_FACE_1887_B25 as originalEnglish} from "../src/pray/holy-face-janvier-1887-b25.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/github-pages-phone/holy-face-fr");
const base=new URL(process.env.AO_PAGES_URL||"https://fulcanelli13.github.io/ad-orientem/");
const sha=process.env.GITHUB_SHA||"";
assert.equal(base.href,"https://fulcanelli13.github.io/ad-orientem/");
assert.match(sha,/^[0-9a-f]{40}$/);
assert.equal(HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED,true);
assert.equal(originalFrench.length,9);
const proofResponse=await fetch(new URL("release-proof.json",base),{headers:{"cache-control":"no-cache"}});
assert.ok(proofResponse.ok,"No deployed source proof");
const proof=await proofResponse.json();
assert.equal(proof.source_sha,sha,"Public GitHub Pages release is not exact commit under test");
for(const file of ["src/pray/novena-runtime.js","src/pray/holy-face-janvier-1895-fr-reader-candidate.v1.js","src/pray/holy-face-janvier-1887-b25.js"]){
 assert.ok(Object.hasOwn(proof.critical_sha256,file),"Critical deployed Holy Face release asset not hash-certified: "+file);
}
await mkdir(out,{recursive:true});
const normalize=s=>String(s||"").normalize("NFC").replace(/\s/g,"");
const report={schema:"ao.pray.holy-face.1895-fr-github-pages-live.v1",
 sourceSha:sha,workflowRun:proof.workflow_run_id,sourceLanguage:"French 1895 normalized printed original",
 independentHumanEditorialProof:false,states:[],screenshots:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["fr","en"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:"block",
   reducedMotion:"reduce",locale:language==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage();
  try{
   await page.addInitScript(lang=>{
    try{const key="ao2:settings:v1",old=JSON.parse(localStorage.getItem(key)||"{}");
     localStorage.setItem(key,JSON.stringify({...old,language:lang}));}catch{}
   },language);
   await page.goto(base.href,{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:90000});
   await page.evaluate(lang=>{
    globalThis.AO_SETTINGS_DONOR_V4359?.setPath("general.uiLanguage",lang);
    localStorage.setItem("ao:novenas:n1:mode","simple");
   },language);
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:45000});
   await page.waitForFunction(lang=>globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.()?.preferences?.general?.uiLanguage===lang,language,{timeout:15000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.novenas",
    {novenaId:"holy_face_1887",returnContext:null})),true);
   const shell="#aoPray435930.open";
   await page.locator(shell+" [data-n1-mode='simple']").click();
   await page.locator(shell+" [data-n1-begin]").click();
   const face=page.locator(shell+" .aoN1Reader .aoN1SourceText");
   for(let day=1;day<=9;day++){
    await face.waitFor({state:"attached",timeout:20000});
    const actual=await face.getAttribute("data-n1-source-language");
    assert.equal(actual,language,"Actual source language differs from UI choice");
    const visible=await face.locator(".aoN1PrayerParagraph").allTextContents();
    assert.equal(normalize(visible.join("\n\n")),normalize(language==="fr"?originalFrench[day-1].text:originalEnglish.days[day-1].text.en),
     "Deployed printed-source paragraph mismatch: "+language+" Day "+day);
    const notice=await face.locator("[data-n1-holy-face-1895-source-notice]").count();
    assert.equal(notice,language==="fr"?1:0,"Original French source and outstanding proofreading notice must match language");
    const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));
    assert.ok(overflow<=2,"Phone horizontal overflow: "+language+" Day "+day+" at "+width);
    if(language==="fr"&&day===1){
     const src=await page.locator(shell+" .aoN1SourceDetails .aoN1SourcePrimary").getAttribute("href");
     assert.match(src||"",/bibliotheque-catholique.com/);
     const file="holy-face-1895-live-fr-"+width+".png";
     await page.screenshot({path:resolve(out,file),animations:"disabled"});
     report.screenshots.push(file);
     await face.locator("[data-n1-show-en]").click();
     assert.equal(await face.getAttribute("data-n1-source-language"),"en","English 1887 witness toggle not effective");
     assert.equal(normalize((await face.locator(".aoN1PrayerParagraph").allTextContents()).join("\n\n")),normalize(originalEnglish.days[0].text.en));
     await face.locator("[data-n1-show-en]").click();
     assert.equal(await face.getAttribute("data-n1-source-language"),"fr","Original French not restored after English switch");
     assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().day),1);
    }
    report.states.push({width,language,day,paragraphs:visible.length,exactDeployedSource:true,independentlyCertified:false});
    if(day<9)await page.locator(shell+" [data-n1-day-next]").click();
   }
  }finally{await ctx.close();}
 }
 assert.equal(report.states.length,36);
 console.log("GITHUB_PAGES_HOLY_FACE_FR_1895_36_STATE_PASS "+JSON.stringify({sha:report.sourceSha,states:report.states.length,proofreviewed:false}));
}finally{
 await writeFile(resolve(out,"holy-face-1895-public-live.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
}
