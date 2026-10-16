import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const screenshotDir=resolve(root,"artifacts/mass-explorer-p1");
await mkdir(screenshotDir,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4211,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430,768,1280]){
  const mobile=width<=430;
  const context=await browser.newContext({viewport:{width,height:mobile?844:950},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("http://127.0.0.1:4211/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.locator('[data-ao-app-surface="learn"]').waitFor({state:"visible",timeout:30000});
  await page.locator('[data-ao-app-surface="learn"]').click();
  await page.locator('[data-ao-learn-family="liturgy-tradition"]').first().click();
  await page.locator('[data-ao-learn-module="learn.mass_explorer"]').click();
  await page.locator("#ao-mass-explorer-root").waitFor({state:"visible",timeout:30000});
  const baseline=await page.evaluate(()=>{
    const root=document.getElementById("ao-mass-explorer-root");
    return {count:root?.querySelectorAll("[data-ao-mx-moment]").length,
      shell:globalThis.AO_LEARN_APP_V1?.status?.()?.child,
      explorer:globalThis.AO_MASS_EXPLORER_V1?.status?.(),
      overflow:root?.scrollWidth-root?.clientWidth,
      ribbonTop:document.querySelector("#ao-global-ribbon")?.getBoundingClientRect()?.top,
      rootBottom:root?.getBoundingClientRect()?.bottom};
  });
  assert.equal(baseline.count,32,width+" cannot navigate all 32 original Guide moments");
  assert.equal(baseline.shell,"learn.mass_explorer");
  assert.equal(baseline.explorer?.sourceBlocks,96);
  assert.ok(baseline.overflow<=1,width+" px Explorer has unwanted horizontal overflow");
  assert.ok(baseline.rootBottom<=baseline.ribbonTop+2,width+" px Explorer overlays global ribbon");
  await page.locator('#ao-mass-explorer-root [data-ao-mx-moment="AO.CARD.010"]').click();
  await page.locator('#ao-mass-explorer-root [data-ao-mx-block="AO.SM.B031"]').click();
  const selectedTab=await page.locator('#ao-mass-explorer-root [data-ao-mx-block="AO.SM.B031"]').evaluate(node=>{
    const tab=node.getBoundingClientRect(),rail=node.parentElement.getBoundingClientRect();
    return {left:tab.left,right:tab.right,railLeft:rail.left,railRight:rail.right,
      focused:document.activeElement===node};
  });
  assert.ok(selectedTab.left>=selectedTab.railLeft-2&&selectedTab.right<=selectedTab.railRight+2,
    width+" selected prayer must remain visible in its scrollable index: "+JSON.stringify(selectedTab));
  assert.equal(selectedTab.focused,true,width+" keyboard focus lost when selecting a prayer");
  const prayer=page.locator("#ao-mass-explorer-root .aoMXText");
  assert.match(await prayer.innerText(),/Suscipe, sancte Pater/);
  assert.ok((await prayer.locator(".aoMXLatin").count())>=1,width+" lost original Latin");
  assert.ok((await prayer.locator(".aoMXTranslation").count())>=1,width+" lost published English");
  const action=prayer.locator('[data-ao-mx-cue="AO.SM.C0111"]');
  assert.equal(await action.locator("[lang=la]").count(),0,"Priset action must not falsely claim a Latin original");
  assert.match(await action.innerText(),/Priest.s action|Makes the cross/i);
  await page.screenshot({path:resolve(screenshotDir,"explorer-"+width+"-en.png")});
  // Suscipe's approved biblical comparison is in the existing Formation MF03
  // lesson, NOT an unverified direct prayer-to-verse attribution.
  if(width===390||width===768){
    await page.locator('#ao-mass-explorer-root [data-ao-mx-study="MF03"]').click();
    await page.waitForFunction(()=>globalThis.AO_MASS_FORMATION_V1?.status?.()?.stageId==="MF03",null,{timeout:15000});
    const indirect=page.locator('#ao-mass-formation-root [data-ao-mass-formation-anchor="MFS05"]');
    await indirect.waitFor({state:"visible",timeout:10000});
    await indirect.click();
    const scripture=page.locator("#ao-scripture-overlay");
    await scripture.waitFor({state:"visible",timeout:12000});
    assert.match(await scripture.locator(".aoScriptureContextTitle").innerText(),/Romans 12:1/);
    await scripture.locator('[data-scripture-context-depth="chapter"]').click();
    assert.ok(await scripture.locator(".aoScriptureVerse").count()>10,"MF03 biblical chapter unavailable");
    await scripture.locator("[data-scripture-close]").click();
    assert.equal(await indirect.evaluate(el=>el===document.activeElement),true,"Scripture must restore exact MF03 passage focus");
    await page.locator('#ao-mass-formation-root [data-ao-mf-close]').click();
    await page.waitForFunction(()=>globalThis.AO_MASS_EXPLORER_V1?.status?.()?.blockId==="AO.SM.B031"&&
      globalThis.AO_MASS_EXPLORER_V1?.status?.()?.momentKey==="AO.CARD.010",null,{timeout:12000});
    assert.match(await page.locator("#ao-mass-explorer-root .aoMXText").innerText(),/Suscipe, sancte Pater/);
  }
  await page.locator('#ao-mass-explorer-root [data-ao-mx-index]').click();
  await page.locator('#ao-mass-explorer-root [data-ao-mx-moment="AO.CARD.013"]').click();
  assert.ok(await page.locator("#ao-mass-explorer-root [data-ao-scripture-context]").count()>0,
    width+" lost approved Scripture context links");
  if(width===390){
    const origin=page.locator('#ao-mass-explorer-root [data-ao-mass-formation-anchor="MFS02"]');
    await origin.click();
    const bible=page.locator("#ao-scripture-overlay");
    await bible.waitFor({state:"visible",timeout:12000});
    assert.match(await bible.locator(".aoScriptureContextTitle").innerText(),/Isaiah 6:3/);
    await bible.locator("[data-scripture-close]").click();
    assert.equal(await origin.evaluate(el=>el===document.activeElement),true,"Scripture source-owner must restore exact Explorer focus");
    assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-current="AO.CARD.013"]').count(),1,
      "Scripture return lost original Mass moment");
  }
  await page.locator('#ao-mass-explorer-root [data-ao-mx-back]').click();
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-moment]").count(),32);
  // Test the already supported French UI fallback without synthesising any
  // missing French prayer or English-only Guide commentary.
  await page.evaluate(()=>{document.documentElement.lang="fr"});
  await page.locator('#ao-mass-explorer-root [data-ao-mx-moment="AO.CARD.010"]').click();
  await page.locator('#ao-mass-explorer-root [data-ao-mx-block="AO.SM.B031"]').click();
  assert.match(await page.locator("#ao-mass-explorer-root .aoMXText").innerText(),/Suscipe, sancte Pater/);
  assert.ok(await page.locator("#ao-mass-explorer-root .aoMXTextRow [lang=fr]").count()>0,
    width+" missing source-owned French by-cue witness");
  await page.screenshot({path:resolve(screenshotDir,"explorer-"+width+"-fr.png")});
  await page.locator("#ao-mass-explorer-root [data-ao-mx-close]").click();
  await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.()?.child===null&&
     document.getElementById("ao-learn-modular-root")?.hidden===false,null,{timeout:12000});
  assert.equal(errors.length,0,width+" px JavaScript errors: "+errors.join(" | "));
  await context.close();
 }
 console.log("PASS Mass Explorer canonical app: 320/390/430/768/1280px, 32 moments, B031 Latin/EN/FR, Scripture links, original family return");
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
