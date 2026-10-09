import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname, resolve, sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
  try {
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const path=resolve(root,"."+p);
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4194,"127.0.0.1",ok);});
let browser;
try {
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  await page.goto("http://127.0.0.1:4194/index.html?aoCatechismGuidedPreview=1",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.().installed && typeof globalThis.AO_TRADITIONAL_CATECHISM?.openQuestion==="function",null,{timeout:30000});
  await page.locator('[data-ao-app-surface="learn"]').tap();
  await page.locator('[data-ao-learn-family="foundations"]').tap();
  await page.locator('[data-ao-learn-module="learn.catechism"]').tap();
  await page.locator("#ao-cate-root").waitFor({state:"visible",timeout:30000});
  const toggle=page.locator('[data-ao-catechism-guided-mode="toggle"]');
  await toggle.waitFor({state:"visible",timeout:30000});
  await toggle.tap();
  const panel=page.locator("#ao-catechism-guided-panel");
  await panel.waitFor({state:"visible"});
  assert.equal(await panel.locator("select[data-guided-select] option").count(),55);
  assert.equal(await panel.locator(".aoCatechismGuidedDraft").count(),1);
  assert.ok(await panel.locator('a[aria-label*="French printed 1913"]').count()>0,"A question must link to the French 1913 historical scan");
  await panel.locator('select[data-guided-select]').selectOption("LTF-046");
  await panel.locator('[data-guided-question="213"]').tap();
  await page.waitForFunction(()=>globalThis.AO_TRADITIONAL_CATECHISM?.getState?.().detail===213,null,{timeout:30000});
  await panel.waitFor({state:"hidden",timeout:10000});
  assert.equal(await page.locator("#ao-cate-root").isVisible(),true);
  // Original renderer recreates its DOM; the Guided Study control must survive.
  await toggle.waitFor({state:"visible"});
  await toggle.tap();
  await panel.waitFor({state:"visible"});
  assert.equal(await panel.locator("select[data-guided-select]").inputValue(),"LTF-046");
  await panel.locator('button[aria-label="Close guided study preview"],button[aria-label="Close guided study"]').first().tap();
  await panel.waitFor({state:"hidden"});
  const metrics=await page.evaluate(()=>({
    originalVisible:!document.getElementById("ao-cate-root")?.hidden,
    question:globalThis.AO_TRADITIONAL_CATECHISM?.getState?.().detail,
    preview:globalThis.AO_CATECHISM_GUIDED_MODE_V1?.status?.().preview,
    count:globalThis.AO_TRADITIONAL_CATECHISM?.count?.()
  }));
  assert.equal(metrics.originalVisible,true);
  assert.equal(metrics.question,213);
  assert.equal(metrics.preview,true);
  assert.ok(!errors.length,errors.join("\n"));
  console.log(JSON.stringify({status:"PASS",phone:"390x844",lessons:55,nativeQuestion:metrics.question,catechismCount:metrics.count}));
} finally {await browser?.close();await new Promise(ok=>server.close(ok));}
