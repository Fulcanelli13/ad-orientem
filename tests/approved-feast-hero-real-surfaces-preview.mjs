// Production UI surfaces, TEST ONLY: browser-simulated release registry.
// The stored candidate and editorial manifests remain on hold. Do not use this
// harness as evidence of human photo or global commercial rights acceptance.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {APPROVED_FEAST_HERO_DATES} from "../src/calendar/approved-feast-heroes.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const packaged=JSON.parse(await readFile(resolve(root,
  "data/calendar/approved-feast-hero-packaged-candidates-20261021.v1.json"),"utf8"));
assert.equal(packaged.liveReleaseManifest,null);
assert.equal(packaged.explicitAppRightsReleaseApprovals,0);
const candidates=packaged.photographs;
assert.equal(candidates.length,10);
const out=resolve(root,"artifacts/sacred-art-approved-hero-real-surface-preview");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".json":"application/json",".webp":"image/webp",".css":"text/css",".png":"image/png",
  ".jpg":"image/jpeg",".woff2":"font/woff2",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+pathname);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
      "cache-control":"no-store"});res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
const port=server.address().port;
let browser;
const evidence=[];
try{
  browser=await chromium.launch({headless:true});
  for(const width of [320,390]){
    const ctx=await browser.newContext({viewport:{width,height:780},
      deviceScaleFactor:1,serviceWorkers:"block"});
    const page=await ctx.newPage();
    await page.goto("http://127.0.0.1:"+port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>typeof window.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
    const setup=await page.evaluate(async ({choices,photos})=>{
      const candidateByDate=new Map(photos.map(x=>[x.date,x]));
      const works=choices.map(choice=>{
        const x=candidateByDate.get(choice.date);
        if(!x || x.artist!==choice.artist || x.title!==choice.title)
          throw Error("Selected painting/photos mismatch");
        return {
          key:choice.key,artist:choice.artist,title:choice.title,artworkId:choice.artworkId,
          source:{
            objectUrl:x.sourcePhotoPage, // TEST-ONLY: exact file page; object page source can be a museum homepage

            photoUrl:x.sourcePhotoPage,
            exactOriginalVerified:true, // MOCK ONLY: source labels not yet human audited
          },
          photo:{
            path:x.candidateFile.path,sha256:x.candidateFile.sha256,
            width:x.candidateFile.width,height:x.candidateFile.height,
            fullPaintedSurface:true,noGlare:true,
            phone320Pass:true,phone390Pass:true, // MOCK ONLY: technical preview check
          },
          rights:{
            license:"CC0",exactPhotoRightsVerified:true,appDistributionPermitted:true,
            evidenceUrl:"https://example.org/test-fixture-does-not-authorize-reuse"
            // TEST-ONLY simulated grants, never persist or publish.
          },
          release:{
            status:"APPROVED_FOR_RELEASE",home:true,calendar:true,
            humanVisualApproval:true,observedPrincipalId:choice.observedPrincipalId
            // This is intentionally NOT an actual approval.
          }
        };
      });
      window.__AO_ART_SIMULATED_PREVIEW_ONLY=true;
      window.AO_APPROVED_FEAST_ART_RELEASE_V1={artworks:works};
      const mod=await import("/src/home/presentation.js");
      const calmod=await import("/src/calendar/calendar-runtime.js");
      return {renderHome:typeof mod.renderHome==="function",
        calendarOwner:typeof calmod.installCalendarBrowserOwner==="function"};
    },{choices:APPROVED_FEAST_HERO_DATES,photos:candidates});
    assert.equal(setup.renderHome,true);
    assert.equal(setup.calendarOwner,true);
    for(const decision of APPROVED_FEAST_HERO_DATES){
      const date=decision.date;
      const prepared=await page.evaluate(async({date})=>{
        const r=await window.AO_RUNTIME_V8.resolver.resolveDay(date);
        window.AO_RUNTIME_V8.store.dispatch({type:"set-date",date});
        window.AO_RUNTIME_V8.store.dispatch({type:"resolve-complete",resolution:r});
        const {renderHome}=await import("/src/home/presentation.js");
        document.querySelector("#aoFeastHeroQARoot")?.remove();
        const holder=document.createElement("section");
        holder.id="aoFeastHeroQARoot";
        holder.style.cssText="position:fixed;inset:0;background:#080c12;color:#eae2d6;z-index:2147483000;overflow:auto";
        document.body.append(holder);
        const state={...window.AO_RUNTIME_V8.store.getState(),
          route:"home",selectedDate:date,resolution:r,resolving:false};
        renderHome(holder,state,window);
        const watermark=document.createElement("strong");
        watermark.textContent="TEST-ONLY IMAGE PREVIEW — NOT RIGHTS CLEARED";
        watermark.style.cssText="position:absolute;top:4px;right:4px;z-index:10;background:#18151a;color:#f2c583;padding:4px;font:700 9px system-ui";
        holder.append(watermark);
        return {resolved:r?.status==="ready",observed:r?.day?.main?.id};
      },{date});
      assert.equal(prepared.resolved,true,date+" not source resolved");
      assert.equal(prepared.observed,decision.observedPrincipalId,date+" principal drift");
      const home=page.locator("#aoFeastHeroQARoot .aoTodayV2Art");
      const homeImg=home.locator(".aoApprovedFeastHero img");
      await homeImg.waitFor({state:"attached",timeout:12000});
      await homeImg.evaluate(img=>img.decode());
      const actual=await homeImg.evaluate(img=>{
        const style=getComputedStyle(img),container=img.closest(".aoTodayV2Art");
        const rect=img.getBoundingClientRect(),parent=container.getBoundingClientRect();
        return {alt:img.alt,fit:style.objectFit,natural:[img.naturalWidth,img.naturalHeight],
          paintingVisible:rect.width>0&&rect.height>0,parentWidth:parent.width,
          pageWidth:document.documentElement.scrollWidth};
      });
      assert.ok(actual.alt.includes(decision.artist)&&actual.alt.includes(decision.title));
      assert.equal(actual.fit,"contain",date+" approved painting must be uncropped");
      assert.ok(actual.natural[0]>0&&actual.natural[1]>0,date+" file must load");
      assert.ok(actual.paintingVisible,date+" image must be visible");
      assert.ok(actual.parentWidth<=width+2,date+" Home hero must fit viewport");
      await home.screenshot({path:resolve(out,"home-hero-"+date+"-"+width+".png")});
      // Real Calendar surface, but ephemeral simulated rights approval only.
      const calReady=await page.evaluate(async({date})=>{
        document.querySelector("#aoFeastHeroQARoot")?.remove();
        const mod=await import("/src/calendar/calendar-runtime.js");
        const api=mod.installCalendarBrowserOwner(window);
        api.setView("day");
        if(!api.status().open)api.open();
        await api.select(date);
        api.setView("day");
        api.paint();
        return {open:api.status().open,selected:api.status().selectedDate,
          principal:window.AO_RUNTIME_V8.store.getState().resolution?.day?.main?.id};
      },{date});
      assert.equal(calReady.open,true,date+" Calendar UI absent");
      assert.equal(calReady.selected,date,date+" Calendar date drift");
      const calImg=page.locator("#ao-calendar-modular-root .aoCalV2Hero .aoApprovedFeastHero img");
      await calImg.waitFor({state:"attached",timeout:30000});
      await calImg.evaluate(img=>img.decode());
      const calActual=await calImg.evaluate(img=>({
        alt:img.alt,natural:[img.naturalWidth,img.naturalHeight],
        fit:getComputedStyle(img).objectFit,
        pageWidth:document.documentElement.scrollWidth
      }));
      assert.ok(calActual.alt.includes(decision.artist)&&calActual.alt.includes(decision.title));
      assert.deepEqual(calActual.natural,actual.natural);
      assert.equal(calActual.fit,"contain");
      // Calendar can independently repaint while resolving next-week context.
      // Screenshot the viewport instead of an ephemeral calendar DOM node.
      await page.evaluate(()=>{
        document.querySelector("#ao-calendar-modular-root")?.scrollTo({top:0,left:0,behavior:"instant"});
      });
      await page.screenshot({path:resolve(out,"calendar-hero-"+date+"-"+width+".png")});
      evidence.push({date,width,artist:decision.artist,title:decision.title,
        actualPrincipal:prepared.observed,homeImageLoaded:true,calendarImageLoaded:true,
        homeImageNatural:actual.natural,calendarImageNatural:calActual.natural,
        uncropped:true,rightsSimulation:"TEST_ONLY_FAKE_NEVER_PRODUCT_AUTHORIZED",
        realPublicationApproved:false});
      console.log("HERO_SURFACES_PREVIEW_PASS",date,width,decision.artist,decision.title);
      await page.evaluate(()=>{
        window.AO_CALENDAR_APP_V1?.close?.();
        document.querySelector("#aoFeastHeroQARoot")?.remove();
      });
    }
    await ctx.close();
  }
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
const result={schema:"AO_TEN_FEAST_HERO_HOME_CALENDAR_SIMULATED_RELEASE_PREVIEW_V1",
  policy:"TEST_FIXTURE_ONLY; no rights/photo/user visual approvals granted",
  expectedSurfaceChecks:40,pairsCompleted:evidence.length,photos:evidence,
  actualPublishedImages:0};
await writeFile(resolve(out,"home-calendar-preview-evidence.json"),
  JSON.stringify(result,null,2)+"\n");
assert.equal(evidence.length,20);
console.log("HERO_SURFACES_PREVIEW_COMPLETE 10 DATES x 2 WIDTHS x 2 ACTUAL UI SURFACES: 40/40");
