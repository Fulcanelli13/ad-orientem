import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const base=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
  ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,"http://127.0.0.1");
    const path=decodeURIComponent(url.pathname);
    const file=resolve(base,"."+path);
    if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4251,"127.0.0.1",ok);});
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
    deviceScaleFactor:2,serviceWorkers:"block"});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message||e)));
  await page.goto("http://127.0.0.1:4251/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
    null,{timeout:30000});
  const navigated=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"));
  assert.equal(navigated?.ok,true,"Formation hub did not open");
  await page.locator("#ao-learn-modular-root").waitFor({state:"visible",timeout:12000});
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-dossier-review]").count(),0,
    "Research previews must not crowd the Formation root");
  const hub=page.locator("#ao-learn-modular-root");
  await hub.locator('[data-ao-learn-family="questions"]').tap();
  await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.().family==="questions",null,{timeout:10000});
  assert.equal(await hub.locator('[data-ao-learn-module="learn.sexual_ethics"]').count(),1,
    "Moral Questions lost the canonical Sexual Ethics owner");
  assert.equal(await hub.locator("[data-ao-learn-dossier-review]").count(),0,
    "Neither Apologetics nor Church Crisis belongs under moral questions");
  await hub.locator("[data-ao-learn-back]").tap();
  await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.().family,null,{timeout:10000});
  const selector="#ao-learn-modular-root [data-ao-learn-dossier-review]";
  async function enterSubject(family,corpus){
    if((await page.evaluate(()=>globalThis.AO_LEARN_APP_V1?.status?.().family))!==null){
      await hub.locator("[data-ao-learn-back]").tap();
      await page.waitForFunction(()=>!globalThis.AO_LEARN_APP_V1?.status?.().family,null,{timeout:10000});
    }
    await hub.locator('[data-ao-learn-family="'+family+'"]').tap();
    await page.waitForFunction(id=>globalThis.AO_LEARN_APP_V1?.status?.().family===id,family,{timeout:10000});
    assert.equal(await page.locator(selector).count(),1,"Each subject has only its own dossier collection");
    assert.equal(await page.locator(selector).first().getAttribute("data-ao-learn-dossier-review"),corpus);
  }
  await enterSubject("apologetics","apologetics");

  async function openReview(corpus,firstId,otherId){
    const button=page.locator(selector+'[data-ao-learn-dossier-review="'+corpus+'"]');
    await button.tap();
    const root=page.locator("#ao-formation-recovery-review");
    await root.waitFor({state:"visible",timeout:20000});
    await page.waitForFunction(()=>globalThis.AO_FORMATION_RECOVERY_REVIEW_V1?.status?.().canonicalDossiers===141 &&
      !globalThis.AO_FORMATION_RECOVERY_REVIEW_V1?.status?.().loading,null,{timeout:30000});
    const status=await page.evaluate(()=>globalThis.AO_FORMATION_RECOVERY_REVIEW_V1.status());
    assert.equal(status.error,"","research source files unavailable");
    assert.equal(status.public,false,"draft was marked independently published");
    assert.equal(status.studyPreview,true,"user-facing study preview unexpectedly exposes raw editorial archive");
    assert.equal(await root.locator('[data-rr-dossier="'+firstId+'"]').count(),1,"canonical dossier missing");
    assert.equal(await root.locator('[data-rr-dossier="'+otherId+'"]').count(),0,"opposite corpus leaked");
    assert.equal(await root.locator("[data-rr-family]").count(),1,"topic-family selector missing");
    assert.equal(await root.locator("[data-rr-mode]").isVisible().catch(()=>false),false,"internal research-bank tabs leaked to readers");
    assert.ok(await root.locator(".rrWarning").first().textContent(),"draft caution missing");
    return root;
  }

  let root=await openReview("apologetics","APOL-001","CR-LIT-05");
  await root.locator("[data-rr-family]").selectOption("christ");
  assert.equal(await root.locator('[data-rr-dossier="APOL-001"]').count(),0,
    "family selection failed to filter unrelated questions");
  assert.equal(await root.locator('[data-rr-dossier="APOL-007"]').count(),1,
    "Christ category did not expose its canonical questions");
  await root.locator("[data-rr-family]").selectOption("all");
  await root.locator('[data-rr-dossier="APOL-001"]').tap();
  await root.locator('[data-rr-canonical-synthesis="APOL-001"]').waitFor({state:"visible"});
  assert.ok(await root.locator('[data-rr-canonical-synthesis="APOL-001"] a[href^="https://"]').count()>0,
    "canonical answer has no source links");
  await root.locator("[data-rr-back]").tap();
  await root.locator("[data-rr-back]").tap();
  assert.equal(await page.locator("#ao-formation-recovery-review").count(),0,"reader Back failed to close");
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.aoLearnDossierReview),
    "apologetics","Formation launcher focus not restored");

  await enterSubject("church-crisis","crisis");
  root=await openReview("crisis","CR-LIT-05","APOL-001");
  await root.locator('[data-rr-dossier="CR-LIT-05"]').tap();
  await root.locator('[data-rr-canonical-synthesis="CR-LIT-05"]').waitFor({state:"visible"});
  assert.ok(await root.locator('[data-rr-canonical-synthesis="CR-LIT-05"] a[href^="https://"]').count()>0,
    "Church Crisis answer lost original-source links");
  for(const width of [320,390,430]){
    await page.setViewportSize({width,height:844});
    const metrics=await root.evaluate(el=>({
      overflow:el.scrollWidth-el.clientWidth,
      headerHeight:el.querySelector(".rrTop")?.getBoundingClientRect().height,
      screenWidth:el.getBoundingClientRect().width
    }));
    assert.ok(metrics.overflow<=3,"review reader overflows at "+width+"px: "+JSON.stringify(metrics));
    assert.ok(metrics.headerHeight>=44,"review header controls too small for phone");
  }
  assert.equal(errors.filter(e=>/formation.recovery|formation.research|research files unavailable/i.test(e)).length,0,
    "Formation review raised a browser runtime exception: "+errors.join("; "));
  console.log("PASS: distinct Formation subjects expose preliminary previews, source status, isolated APOL/CR, themed search, links and phone Back/focus");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
