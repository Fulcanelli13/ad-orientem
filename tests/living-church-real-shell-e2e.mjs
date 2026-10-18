import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
/** Real production app shell and actual native module owners, no mocked AO_* APIs. */
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",
 ".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{const location=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+location);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise(resolveReady=>server.listen(0,"127.0.0.1",resolveReady));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const ctx=await browser.newContext({viewport:{width,height:width===390?844:900},
    isMobile:width===390,hasTouch:width===390,serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];page.on("pageerror",e=>errors.push(String(e.message||e)));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoVisibleMassReview=1",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:40000});
  const opened=await page.evaluate(async()=>{
   const owner=window.AO_LEARN_APP_V1;
   if(!owner?.open?.())return {ok:false,at:"learn-open",status:owner?.status?.()};
   const result=await owner.openModule("learn.visible_mass",{});
   return {ok:result===true||result?.ok===true,at:"visible-mass",status:owner.status()};
  });
  assert.equal(opened.ok,true,"real Learn owner could not open Visible Mass: "+JSON.stringify(opened));
  const frame=page.frameLocator("#ao-visible-mass-review-root iframe");
  await frame.locator("#lc-stage-open").waitFor({state:"visible",timeout:35000});
  const initial=await frame.locator("#photo-viewport").evaluate(el=>({x:el.scrollLeft,y:el.scrollTop}));
  await frame.locator("#lc-stage-open").click();
  await frame.locator("#lc-stage .lc-guides [data-guide='pius-x']").click();
  await frame.locator("#lc-stage .lc-actions").getByRole("button",{name:"Holy Eucharist"}).click();
  const before=await frame.locator("#lc-stage").evaluate(el=>el.ownerDocument.defaultView.AO_LIVING_CHURCH_P2.status());
  assert.equal(before.node,"real-presence");
  await frame.locator("#lc-stage .lc-actions").getByRole("button",{name:"Open Catechism"}).click();
  await page.waitForFunction(()=>{
    const root=document.getElementById("ao-cate-root");
    const child=document.querySelector("#ao-visible-mass-review-root iframe")?.contentWindow;
    const returnButton=document.getElementById("ao-living-church-native-return");
    const state=child?.AO_LIVING_CHURCH_P2?.status?.();
    return (root&&!root.hidden&&returnButton&&!returnButton.hidden&&
      state?.nativeReturnAvailable===true)||state?.nativeFailure;
  },null,{timeout:12000});
  const diagnostic=await page.evaluate(()=>{
    const child=document.querySelector("#ao-visible-mass-review-root iframe")?.contentWindow;
    return {scene:child?.AO_LIVING_CHURCH_P2?.status?.(),
      context:child?.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status?.(),
      delegated:child?.AO_LIVING_CHURCH_CATECHISM_NATIVE_V1?.status?.(),
      learn:window.AO_LEARN_APP_V1?.status?.(),
      cate:window.AO_TRADITIONAL_CATECHISM?.status?.(),
      cateRoot:!!document.getElementById("ao-cate-root"),
      cateHidden:document.getElementById("ao-cate-root")?.hidden,
      ribbon:document.getElementById("ao-global-ribbon")?.getBoundingClientRect()?.bottom};
  });
  console.log("REAL_SHELL_HANDOFF_STATE",width,JSON.stringify(diagnostic));
  assert.equal(diagnostic.scene.nativeFailure,null,"Real-shell native handoff rejected");
  const current=await page.evaluate(()=>({
   catechism:!!document.getElementById("ao-cate-root")&&!document.getElementById("ao-cate-root").hidden,
   original:AO_LEARN_APP_V1.status(),host:AO_VISIBLE_MASS_REVIEW_V1.status(),
   returnVisible:!document.querySelector("#ao-living-church-native-return")?.hidden
  }));
  assert.equal(current.catechism,true);
  assert.equal(current.returnVisible,true);
  assert.equal(current.original.child,"learn.visible_mass","native Catechism must not replace the original Learn visitor");
  const screenshotDir=resolve(root,"artifacts/living-church-real-shell");
  await mkdir(screenshotDir,{recursive:true});
  await page.screenshot({path:resolve(screenshotDir,"catechism-real-shell-"+width+".png")});
  await page.locator("#ao-living-church-native-return").click();
  await frame.locator("#lc-stage").waitFor({state:"visible",timeout:25000});
  const restored=await frame.locator("#lc-stage").evaluate(el=>({
    s:el.ownerDocument.defaultView.AO_LIVING_CHURCH_P2.status(),
    p:{x:el.ownerDocument.querySelector("#photo-viewport").scrollLeft,
       y:el.ownerDocument.querySelector("#photo-viewport").scrollTop}
  }));
  assert.equal(restored.s.guide,"pius-x");
  assert.equal(restored.s.node,"real-presence");
  assert.equal(restored.s.nativeReturnAvailable,false);
  assert.deepEqual(restored.p,initial);
  assert.equal(await page.locator("#ao-cate-root").isVisible(),false);
  assert.equal(await page.evaluate(()=>AO_LEARN_APP_V1.status().child),"learn.visible_mass");
  // The Canon must use the SAME source-owned native/return flow.
  await frame.locator("#lc-stage .lc-guides [data-guide='canon']").click();
  await frame.locator("#lc-stage .lc-actions").getByRole("button",{name:"Eucharistic sacrifice"}).click();
  const canonBefore=await frame.locator("#lc-stage").evaluate(el=>el.ownerDocument.defaultView.AO_LIVING_CHURCH_P2.status());
  assert.equal(canonBefore.node,"sacrifice");
  await frame.locator("#lc-stage .lc-actions").getByRole("button",{name:"Mass Explorer"}).click();
  await page.waitForFunction(()=>{
    const visible=window.AO_MASS_EXPLORER_V1?.status?.()?.open===true;
    const returned=document.getElementById("ao-living-church-native-return");
    const child=document.querySelector("#ao-visible-mass-review-root iframe")?.contentWindow;
    return (visible&&returned&&!returned.hidden&&
       child?.AO_LIVING_CHURCH_P2?.status?.()?.nativeReturnAvailable===true)||
       child?.AO_LIVING_CHURCH_P2?.status?.()?.nativeFailure;
  },null,{timeout:30000});
  const massFailure=await frame.locator("#lc-stage").evaluate(el=>
    el.ownerDocument.defaultView.AO_LIVING_CHURCH_P2.status().nativeFailure);
  assert.equal(massFailure,null,"Canon native Mass Explorer opening rejected");
  const currentMass=await page.evaluate(()=>({
    source:AO_LEARN_APP_V1.status().child,
    active:AO_MASS_EXPLORER_V1.status(),
    returnButton:document.getElementById("ao-living-church-native-return")?.textContent,
    hostVisibility:document.getElementById("ao-visible-mass-review-root")?.style.visibility
  }));
  assert.equal(currentMass.source,"learn.visible_mass");
  assert.equal(currentMass.active.open,true);
  assert.match(currentMass.returnButton,/Chanoine/);
  assert.equal(currentMass.hostVisibility,"hidden");
  await page.screenshot({path:resolve(screenshotDir,"mass-explorer-real-shell-"+width+".png")});
  await page.locator("#ao-living-church-native-return").click();
  await frame.locator("#lc-stage").waitFor({state:"visible",timeout:25000});
  const canonAfter=await frame.locator("#lc-stage").evaluate(el=>({
   s:el.ownerDocument.defaultView.AO_LIVING_CHURCH_P2.status(),
   p:{x:el.ownerDocument.querySelector("#photo-viewport").scrollLeft,
      y:el.ownerDocument.querySelector("#photo-viewport").scrollTop}
  }));
  assert.equal(canonAfter.s.guide,"canon");
  assert.equal(canonAfter.s.node,"sacrifice");
  assert.deepEqual(canonAfter.p,initial);
  assert.equal(await page.evaluate(()=>window.AO_MASS_EXPLORER_V1?.status?.()?.open),false);
  assert.equal(await page.evaluate(()=>AO_LEARN_APP_V1.status().child),"learn.visible_mass");
  await page.screenshot({path:resolve(screenshotDir,"canon-restored-real-shell-"+width+".png")});
  await page.screenshot({path:resolve(screenshotDir,"restored-real-shell-"+width+".png")});
  assert.deepEqual(errors,[],"unexpected real-shell browser errors "+width);
  console.log("PASS genuine app-shell St Pius X -> canonical Catechism Q322 -> exact-return "+width);
  await ctx.close();
 }
}finally{
 await browser?.close();
 await new Promise(r=>server.close(r));
}
