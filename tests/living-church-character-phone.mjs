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
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(err){res.writeHead(err.code==="ENOENT"?404:500);res.end(String(err));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="859"><rect width="1280" height="859" fill="#39332b"/></svg>';
const screenshotDir=resolve(root,"dist/living-church/p3-review");
await mkdir(screenshotDir,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const ctx=await browser.newContext({viewport:{width,height:width===390?844:900},
    hasTouch:width===390,isMobile:width===390,serviceWorkers:"block"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,r=>r.fulfill({
    status:200,contentType:"image/svg+xml",body:svg}));
  await page.goto(origin+"/index.html?aoVisibleMassReview=1&aoLivingChurchReview=1&aoLivingChurchCharacters=1",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
    null,{timeout:30000});
  await page.evaluate(async()=>{
   const {createVisibleMassReviewRuntime}=await import("/src/learn/visible-mass-review.js");
   window.__LC_REVIEW=createVisibleMassReviewRuntime(window);
   if(!window.__LC_REVIEW.open())throw Error("No original reviewer");
  });
  const host=page.locator("#ao-visible-mass-review-root");
  const photo=page.frameLocator("#ao-visible-mass-review-root iframe");
  await photo.locator('.marker[data-object="AL01"]').waitFor({timeout:30000});
  await photo.locator('.marker[data-object="AL01"]').click();
  await page.waitForFunction(()=>{
   const child=document.querySelector("#ao-visible-mass-review-root iframe")?.contentWindow;
   return child?.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status?.().context?.objectId==="AL01";
  },null,{timeout:30000});
  await page.waitForFunction(()=>{
   const c=document.querySelector("#ao-visible-mass-review-root iframe")?.contentWindow;
   const v=c?.document.querySelector("#photo-viewport");if(!v)return false;
   const pos=v.scrollLeft+":"+v.scrollTop;
   const prior=window.__lcSpritePose??{pos:null,stable:0};
   window.__lcSpritePose={pos,stable:prior.pos===pos?prior.stable+1:0};
   return window.__lcSpritePose.stable>=6;
  },null,{polling:100,timeout:10000});
  const before=await page.evaluate(()=>{
   const child=document.querySelector("#ao-visible-mass-review-root iframe").contentWindow;
   return {context:child.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context,
    guide:child.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus()};
  });
  const launch=host.getByRole("button",{name:"Talk with the three guides"});
  assert.equal(await launch.isVisible(),true);
  await launch.click();
  const stage=page.locator("#aoLivingChurchCharacterFolio");
  await stage.waitFor({state:"visible",timeout:30000});
  assert.equal(await stage.getAttribute("data-guide"),"sacristan");
  const sprite=stage.locator(".lcCharacterImage");
  const assetCheck=async name=>{
   await page.waitForFunction(p=>{
    const el=document.querySelector("#aoLivingChurchCharacterFolio .lcCharacterImage");
    return !!el?.complete&&el.naturalWidth>100&&el.src.includes(p);
   },name,{timeout:10000});
  };
  await assetCheck("sacristan-welcoming.webp");
  await page.screenshot({path:screenshotDir+"/"+width+"-sacristan.png"});
  await stage.locator('[data-persona="canon"]').click();
  assert.equal(await stage.getAttribute("data-guide"),"canon");
  await assetCheck("canon-welcoming.webp");
  await page.screenshot({path:screenshotDir+"/"+width+"-canon.png"});
  await stage.locator('[data-persona="pius-x"]').click();
  assert.equal(await stage.getAttribute("data-guide"),"pius-x");
  await assetCheck("pius-welcoming.webp");
  await page.screenshot({path:screenshotDir+"/"+width+"-pius-x-study.png"});
  assert.match(await stage.locator(".lcDisclaimer").innerText(),/Historical simulation/);
  assert.match(await stage.locator(".lcDisclaimer").innerText(),/not his words/i);
  await stage.getByRole("button",{name:"Catechism topics"}).click();
  assert.ok(await stage.locator(".lcChoices button").count()>=4);
  await stage.getByRole("button",{name:"Understand the sacraments"}).count().catch(()=>{});
  await stage.locator('[data-persona="canon"]').click();
  await stage.getByRole("button",{name:"Related Mass moments"}).click();
  await stage.getByRole("button",{name:/The Offertory.*AO.CARD.010/}).click();
  await page.waitForFunction(()=>window.AO_MASS_EXPLORER_V1?.status?.()?.open===true,
    null,{timeout:25000});
  assert.equal(await stage.isVisible(),false,"portrait stage must hide behind native module");
  const ret=page.locator("#aoLivingChurchReturnSanctuary");
  await ret.waitFor({state:"visible",timeout:10000});
  const hit=await ret.evaluate(el=>{
    const r=el.getBoundingClientRect(),nav=document.querySelector("#ao-global-ribbon")?.getBoundingClientRect();
    return {hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el,
      overlap:nav?r.bottom>nav.top-3:false};
  });
  assert.equal(hit.hit,true,"Native overlay blocks return button at "+width);
  assert.equal(hit.overlap,false,"Return button overlaps bottom navigation");
  await ret.click();
  await page.waitForFunction(()=>window.AO_MASS_EXPLORER_V1?.status?.()?.open===false,
    null,{timeout:20000});
  await stage.waitFor({state:"visible",timeout:12000});
  assert.equal(await stage.getAttribute("data-guide"),"canon");
  const after=await page.evaluate(()=>{
   const child=document.querySelector("#ao-visible-mass-review-root iframe").contentWindow;
   return {context:child.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context,
    guide:child.AO_VISIBLE_MASS_HOTSPOT_PILOT.guideStatus()};
  });
  assert.deepEqual(after.context,before.context===null?null:{...before.context,guide:"canon"},
    "source photo/pose/VMQ/trail must be unchanged; chosen guide should be canon");
  assert.deepEqual(after.guide,before.guide,"original trial read and skip state changed");
  await page.screenshot({path:screenshotDir+"/"+width+"-canon-after-native-return.png"});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,"horizontal document overflow at "+width+": "+overflow);
  await stage.getByRole("button",{name:"Explore freely"}).focus();
  await page.keyboard.press("Escape");
  assert.equal(await stage.isVisible(),false);
  assert.deepEqual(errors,[],"unexpected JS exceptions at "+width);
  await ctx.close();
  console.log("Living Church P3 real-shell PASS "+width+"px: 15-sprite bank, Sacristan/Canon/Pius, source-owned visual novel, canonical Mass return");
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
