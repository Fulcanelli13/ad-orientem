import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",
 ".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="859"><rect width="1280" height="859" fill="#29303a"/></svg>';
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:800},
   hasTouch:width===390,isMobile:width===390,serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,r=>r.fulfill({
   status:200,contentType:"image/svg+xml",body:svg}));
  await page.goto(origin+"/index.html?aoVisibleMassReview=1&aoLivingChurchReview=1",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,{timeout:30000});
  await page.evaluate(async()=>{
   const {createVisibleMassReviewRuntime}=await import("/src/learn/visible-mass-review.js");
   window.__LC_REVIEW=createVisibleMassReviewRuntime(window);
   if(!window.__LC_REVIEW.open())throw Error("Native Visible Mass reviewer did not open");
  });
  const parent=page.locator("#ao-visible-mass-review-root");
  const photo=page.frameLocator("#ao-visible-mass-review-root iframe");
  await photo.locator('.marker[data-object="AL01"]').waitFor({timeout:30000});
  await photo.locator('.marker[data-object="AL01"]').click();
  await page.waitForFunction(()=>{
   const child=document.querySelector("#ao-visible-mass-review-root iframe")?.contentWindow;
   return child?.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status?.().context?.objectId==="AL01";
  },null,{timeout:30000});
  const before=await page.evaluate(()=>{
   const child=document.querySelector("#ao-visible-mass-review-root iframe").contentWindow;
   return {ctx:child.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context,
    status:child.AO_VISIBLE_MASS_HOTSPOT_PILOT.status(),
    count:child.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus().readCount};
  });
  assert.equal(await parent.getByRole("button",{name:"Ask the Church from the selected sanctuary object"}).isVisible(),true);
  await parent.getByRole("button",{name:"Ask the Church from the selected sanctuary object"}).click();
  const guide=page.locator("#aoAskChurchGuideV5");
  await guide.waitFor({state:"visible",timeout:25000});
  const input=guide.locator('input[aria-label="Your objective or question"]');
  await input.fill("I want to understand the Latin Mass");
  await guide.locator('button[type="submit"]').click();
  const card=guide.locator(".ac-card").filter({hasText:"Understand the Mass"}).first();
  await card.waitFor({timeout:15000});
  await card.getByRole("button",{name:"Open in Ad Orientem"}).click();
  await page.waitForFunction(()=>window.AO_MASS_EXPLORER_V1?.status?.()?.open===true,null,{timeout:25000});
  const returnButton=page.locator("#aoLivingChurchReturnSanctuary");
  await returnButton.waitFor({state:"visible",timeout:15000});
  const geometry=await returnButton.evaluate(el=>{
    const r=el.getBoundingClientRect();
    const ribbon=document.querySelector("#ao-global-ribbon")?.getBoundingClientRect();
    return {overlap:ribbon? r.bottom>ribbon.top-3:false,
      hit:el===document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)};
  });
  assert.equal(geometry.overlap,false,"Return overlaps native ribbon at "+width);
  assert.equal(geometry.hit,true,"Return is obstructed by a native surface at "+width);
  await returnButton.click();
  await page.waitForFunction(()=>window.AO_MASS_EXPLORER_V1?.status?.()?.open===false,null,{timeout:20000});
  assert.equal(await returnButton.isVisible(),false);
  const after=await page.evaluate(()=>{
   const child=document.querySelector("#ao-visible-mass-review-root iframe").contentWindow;
   return {ctx:child.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context,
    status:child.AO_VISIBLE_MASS_HOTSPOT_PILOT.status(),
    count:child.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus().readCount};
  });
  assert.deepEqual(after.ctx,before.ctx,"photo/VMQ/pose source changed after native return");
  assert.equal(after.status.selected,before.status.selected);
  assert.equal(after.status.question,before.status.question);
  assert.equal(after.count,before.count,"original guide read history altered");
  assert.equal(await guide.isVisible(),false);
  await parent.getByRole("button",{name:"Ask the Church from the selected sanctuary object"}).click();
  await guide.waitFor({state:"visible"});
  assert.ok(await guide.locator(".ac-card").count()>=1,"original Ask objective session reset");
  assert.deepEqual(errors,[],"browser errors at "+width);
  await context.close();
  console.log("Living Church P2 real-shell PASS "+width+"px native Mass Explorer and original sanctuary return");
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
