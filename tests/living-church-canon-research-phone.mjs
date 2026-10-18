import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
const img='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="859"><rect width="1280" height="859" fill="#39332b"/></svg>';
const output=resolve(root,"dist/living-church/p3-review");
await mkdir(output,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},
    isMobile:width===390,hasTouch:width===390,serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,route=>route.fulfill({
   status:200,contentType:"image/svg+xml",body:img}));
  await page.goto(origin+"/index.html?aoVisibleMassReview=1&aoLivingChurchReview=1&aoLivingChurchCharacters=1&aoCanonResearchReview=1",
   {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:30000});
  await page.evaluate(async()=>{
   const {createVisibleMassReviewRuntime}=await import("/src/learn/visible-mass-review.js");
   window.__LC_REVIEW=createVisibleMassReviewRuntime(window);
   if(!window.__LC_REVIEW.open())throw Error("Original photographic reviewer unavailable");
  });
  const host=page.locator("#ao-visible-mass-review-root");
  const photo=page.frameLocator("#ao-visible-mass-review-root iframe");
  await photo.locator('.marker[data-object="AL01"]').waitFor({timeout:30000});
  await photo.locator('.marker[data-object="AL01"]').click();
  await page.waitForFunction(()=>{
   const c=document.querySelector("#ao-visible-mass-review-root iframe")?.contentWindow;
   return c?.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status?.().context?.objectId==="AL01";
  },null,{timeout:30000});
  const original=await page.evaluate(()=>{
   const c=document.querySelector("#ao-visible-mass-review-root iframe").contentWindow;
   return c.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context;
  });
  await host.getByRole("button",{name:"Talk with the three guides"}).click();
  const stage=page.locator("#aoLivingChurchCharacterFolio");
  await stage.waitFor({state:"visible",timeout:30000});
  await stage.locator('[data-persona="canon"]').click();
  assert.equal(await stage.getAttribute("data-guide"),"canon");
  await stage.getByRole("button",{name:"Apologetics questions · source review"}).click();
  const folio=stage.locator("#aoCanonResearchReview");
  await folio.waitFor({state:"visible",timeout:30000});
  await page.waitForFunction(()=>{
   const n=document.querySelector("#aoCanonResearchReview");
   return n?.dataset.mode==="index"&&n.textContent.includes("534 original question IDs");
  },null,{timeout:25000});
  const search=folio.locator('input[name="canonQuestionSearch"]');
  await search.fill("Catholic and Lutheran justification");
  await search.press("Enter");
  await page.waitForFunction(()=>document.querySelector("#aoCanonResearchReview")?.dataset.mode==="results");
  await folio.locator('[data-question-id="LUT-005"]').click();
  await page.waitForFunction(()=>{
   const n=document.querySelector("#aoCanonResearchReview");
   return n?.dataset.mode==="reading"&&n.textContent.includes("1999");
  },null,{timeout:25000});
  assert.match(await folio.innerText(),/LUT-005/);
  assert.match(await folio.innerText(),/original Formation/i);
  await folio.getByRole("button",{name:"Next source paragraph"}).click();
  assert.match(await folio.innerText(),/1998|1999/);
  assert.ok(await folio.locator("a.crLink").count()>0);
  await page.screenshot({path:output+"/"+width+"-canon-original-question.png"});
  await folio.getByRole("button",{name:"Return to Canon"}).click();
  assert.equal(await folio.isVisible(),false);
  assert.equal(await stage.getAttribute("data-guide"),"canon");
  const after=await page.evaluate(()=>{
   const c=document.querySelector("#ao-visible-mass-review-root iframe").contentWindow;
   return c.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context;
  });
  assert.deepEqual(after,original===null?null:{...original,guide:"canon"});
  const publicState=await page.evaluate(()=>{
   const s=document.querySelector("#aoLivingChurchCharacterFolio");
   return s?.querySelector("#aoCanonResearchReview")?.textContent||"";
  });
  assert.equal(/published and approved/i.test(publicState),false);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,"overflow "+width+": "+overflow);
  assert.deepEqual(errors,[],"browser exceptions "+width);
  await context.close();
  console.log("PASS Canon source review real-shell "+width+"px: 534 source IDs, authentic Lutheran draft, next paragraph, photo return");
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
