import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
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
  const prayer=page.locator("#ao-mass-explorer-root .aoMXText");
  assert.match(await prayer.innerText(),/Suscipe, sancte Pater/);
  assert.ok((await prayer.locator(".aoMXLatin").count())>=1,width+" lost original Latin");
  assert.ok((await prayer.locator(".aoMXTranslation").count())>=1,width+" lost published English");
  await page.locator('#ao-mass-explorer-root [data-ao-mx-index]').click();
  await page.locator('#ao-mass-explorer-root [data-ao-mx-moment="AO.CARD.013"]').click();
  assert.ok(await page.locator("#ao-mass-explorer-root [data-ao-scripture-context]").count()>0,
    width+" lost approved Scripture context links");
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
