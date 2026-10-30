import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {m1AccessPreviewRequested} from "../src/mass/m1-access-overview.js";
import {m1RootPreviewRequested} from "../src/mass/m1-root-surface.js";

const flag=(search)=>({location:{search}});
assert.equal(m1AccessPreviewRequested(flag("")),true);
assert.equal(m1RootPreviewRequested(flag("")),true);
assert.equal(m1RootPreviewRequested(flag("?aoMassAccessM1=1&aoMassRootM1=1")),true);
assert.equal(m1AccessPreviewRequested(flag("?aoMassAccessM1=0")),false);
assert.equal(m1RootPreviewRequested(flag("?aoMassAccessM1=0")),false);
assert.equal(m1RootPreviewRequested(flag("?aoMassRootM1=0")),false);
assert.equal(m1AccessPreviewRequested(flag("?aoMassRootM1=0")),true);

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const art=resolve(root,"artifacts/m1-mass-default-resume");
await mkdir(art,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const origin="http://127.0.0.1:"+server.address().port;
let browser;
async function boot(page,url){
 await page.goto(origin+url,{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_R17_BROWSER_ENTRY?.installed),
   null,{timeout:45000});
 await page.waitForSelector('#ao-global-ribbon [data-ao-app-surface="mass"]',{state:"visible",timeout:20000});
}
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,
    serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  await boot(page,"/index.html?aoR17Reader=native");
  await page.locator('#ao-global-ribbon [data-ao-app-surface="mass"]').click();
  await page.waitForSelector('html[data-ao-m1-mass-root="true"] [data-m1-choice="mass"]',{state:"visible",timeout:15000});
  assert.equal(await page.locator('[data-ao-start-live]').count(),1,"Default Mass must reuse exactly one native Start action");
  assert.equal(await page.locator("[data-ao-m1-resume-mass]").count(),0,"Fresh device must not offer a fictional resume");
  assert.equal(await page.evaluate(()=>Boolean(window.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)),false,
    "Mass tab must open preflight, not resume a reader automatically");
  await page.screenshot({path:resolve(art,width+"-fresh-default.png"),animations:"disabled"});
  // Explicitly select direct preparation and LIVE in the original source-owned controls.
  await page.locator('[data-m1-choice="before"]').click();
  await page.locator('[data-folio-before][value="none"]').check();
  await page.locator("[data-folio-overview-button]").click();
  await page.locator('[data-m1-choice="reader"]').click();
  await page.locator('[data-full-mass-reader-mode][value="LIVE"]').check();
  await page.waitForSelector('[data-m1-choice="reader"]',{state:"visible",timeout:12000});
  await page.waitForFunction(()=>{const button=document.querySelector("[data-ao-start-live]");
    return button&&!button.disabled;},null,{timeout:25000});
  await page.locator("[data-ao-start-live]").click();
  await page.waitForFunction(()=>Boolean(window.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
    null,{timeout:30000});
  const saved=await page.evaluate(()=>{
    const api=window.AO_R17_NATIVE_READER_PREVIEW;
    const all=api?.model?.cards??[];
    const card=all.find(c=>c?.sectionId&&c?.sequence>=9&&c?.sequence<=20)??all.find(c=>c?.sectionId);
    if(!card)throw Error("R17_SOURCE_CARDS_NOT_AVAILABLE");
    api.showSection(card.sectionId);
    const actual=api.getCurrentCard()?.sectionId;
    if(actual!==card.sectionId)throw Error("R17_SECTION_SELECTION_FAILED");
    const suspended=window.AO_R17_BROWSER_ENTRY.suspend();
    const record=JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"null");
    return {suspended,section:card.sectionId,position:record?.readerPosition?.sectionId,
      state:record?.state,checkpoint:record?.readerPosition};
  });
  assert.equal(saved.suspended,true,"Suspending an actual reader must succeed");
  assert.equal(saved.position,saved.section,"R17 must checkpoint the exact selected card");
  assert.equal(saved.state,"suspended");
  assert.equal(await page.evaluate(()=>Boolean(window.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)),false);
  await page.close();
  // Reload the actual app as a new page, preserving its localStorage checkpoint.
  const resumedPage=await ctx.newPage(),resumeErrors=[];
  resumedPage.on("pageerror",e=>resumeErrors.push(String(e.message)));
  await boot(resumedPage,"/index.html?aoR17Reader=native");
  await resumedPage.locator('#ao-global-ribbon [data-ao-app-surface="mass"]').click();
  await resumedPage.waitForSelector('html[data-ao-m1-mass-root="true"] [data-m1-choice="mass"]',{state:"visible",timeout:15000});
  await resumedPage.waitForSelector("[data-ao-m1-resume-mass]",{state:"visible",timeout:8000});
  assert.equal(await resumedPage.locator("[data-ao-start-live]").count(),1,
    "Saved session must never replace the fresh Mass Start action");
  assert.equal(await resumedPage.evaluate(()=>Boolean(window.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)),false,
    "Normal Mass entry must not silently resume");
  const untouched=await resumedPage.evaluate(()=>JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"null"));
  assert.equal(untouched.readerPosition.sectionId,saved.section,"Simply opening Mass must preserve checkpoint");
  await resumedPage.screenshot({path:resolve(art,width+"-with-resume.png"),animations:"disabled"});
  await resumedPage.locator("[data-ao-m1-resume-mass]").click();
  await resumedPage.waitForFunction(()=>Boolean(window.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
    null,{timeout:30000});
  const restored=await resumedPage.evaluate(()=>({
    section:window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId,
    restored:window.AO_R17_MASS_RUNTIME?.restoredSection,
    resumed:window.AO_R17_MASS_RUNTIME?.resumed,
    state:JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"null")?.state,
    massRoot:document.documentElement.dataset.aoM1MassRoot??null,
    sessionOwner:window.AO_R17_MASS_RUNTIME?.canonicalOwner
  }));
  assert.equal(restored.resumed,true,"Explicit Resume must be a genuine R17 resume");
  assert.equal(restored.restored,saved.section,"R17 restore target should be exact saved card");
  assert.equal(restored.section,saved.section,"R17 reader must reopen on exact saved card");
  assert.equal(restored.sessionOwner,"R17_SESSION_ENGINE");
  assert.equal(restored.state,"active");
  assert.notEqual(restored.massRoot,"true","M1 root must yield to R17 reader");
  assert.deepEqual(resumeErrors,[],"Resume errors");
  await resumedPage.close();
  // Rollback must be possible without deleting the saved checkpoint.
  const rollback=await ctx.newPage();
  await boot(rollback,"/index.html?aoR17Reader=native&aoMassAccessM1=0&aoMassRootM1=0");
  await rollback.locator('#ao-global-ribbon [data-ao-app-surface="mass"]').click();
  await rollback.waitForSelector("[data-ao-full-mass-preflight]",{state:"visible",timeout:15000});
  assert.notEqual(await rollback.locator("html").getAttribute("data-ao-m1-mass-root"),"true");
  assert.equal(await rollback.locator('[data-ao-full-mass-preflight]').getAttribute("data-ao-mass-access-m1"),null);
  assert.equal(await rollback.locator("[data-ao-start-live]").count(),1);
  assert.equal(await rollback.evaluate(()=>JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"null")?.readerPosition?.sectionId),
    saved.section,"Legacy rollback must not delete the existing R17 checkpoint");
  assert.deepEqual(errors,[],"Fresh Mass browser errors");
  console.log("PASS M1 DEFAULT "+width+"px: fresh preflight; authentic saved R17 card "+
    saved.section+"; explicit Resume exact card; one Start; legacy rollback");
  await rollback.close();await ctx.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
