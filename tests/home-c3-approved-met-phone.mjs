// Two exact previously approved Met paintings — real modular Home phone visual proof.
// Visual/technical QA only. NEVER editorial permission or automatic publication.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),dir=resolve(root,"artifacts/approved-met-two-home-qa");
await mkdir(dir,{recursive:true});
const types={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg"};
const server=http.createServer(async(request,response)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){response.writeHead(403);return response.end("Denied");}
  const file=await readFile(path);
  response.writeHead(200,{"Content-Type":types[extname(path)]??"application/octet-stream"});
  response.end(file);
 }catch(e){response.writeHead(e?.code==="ENOENT"?404:500);response.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4399,"127.0.0.1",ok);});
const cases=[],browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block",locale:"en-GB",colorScheme:"dark",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message??e).slice(0,230)));
  try{
   await page.clock.setFixedTime(new Date("2026-11-02T17:45:00+04:00"));
   const res=await page.goto("http://127.0.0.1:4399/index.html?aoTodayH4=1",{waitUntil:"domcontentloaded",timeout:90000});
   assert.equal(res?.status(),200);
   await page.locator(".homeScreen.aoH7Screens .aoC3PrayerFrame").waitFor({state:"visible",timeout:40000});
   await page.waitForTimeout(1000);
   const facts=await page.evaluate(async()=>{
    const section=document.querySelector(".homeScreen.aoH7Screens .aoC3PrayerFrame");
    const rows=[...section.querySelectorAll(".aoC3PrayerArt img[data-stage-review-only]")];
    for(const img of rows)img.loading="eager";
    await Promise.all(rows.map(img=>img.decode().catch(()=>{})));
    return {rows:rows.map(img=>({id:img.parentElement?.dataset.c3PrayerArt,src:img.getAttribute("src"),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,visible:Boolean(img.getClientRects().length)})),
      viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,slideCount:section.querySelectorAll(".aoC3PrayerSlide").length,
      homePresent:!!document.querySelector(".homeScreen.aoH7Screens")};
   });
   assert.equal(facts.homePresent,true);
   assert.equal(facts.slideCount,4,"Do not replace approved C3 Prayer carousel");
   const adoration=facts.rows.find(x=>x.id==="adoration");
   assert.ok(adoration,"The Adoration approved photograph is missing from the actual Home carousel");
   assert.match(adoration.src,/^assets\/staged\/sacred-art-met-approved\/adoration-frameless-candidate\.webp$/);
   assert.ok(adoration.naturalWidth>1500&&adoration.naturalHeight>1500,"Adoration candidate failed to decode");
   const angelus=facts.rows.filter(x=>String(x.id||"").startsWith("angelus."));
   for(const photo of angelus)assert.ok(photo.naturalWidth>1500&&photo.naturalHeight>1500&&/angelus-frameless-candidate\.webp$/.test(photo.src),"Angelus photo missing/invalid");
   assert.ok(facts.documentWidth-facts.viewport<=1,"Home overflows "+width+"px viewport");
   await page.screenshot({path:resolve(dir,"home-met-c3-"+width+".png"),animations:"disabled",fullPage:true});
   const adorationSlide=await page.locator(".homeScreen.aoH7Screens .aoC3PrayerSlide").evaluateAll(
     slides=>slides.findIndex(slide=>!!slide.querySelector('img[src*="adoration-frameless-candidate.webp"]')));
   assert.ok(adorationSlide>=0,"Adoration slide missing in Home Prayer carousel");
   await page.locator(".homeScreen.aoH7Screens [data-home-c3-prayer-step='"+adorationSlide+"']").click();
   const presented=await page.locator(".homeScreen.aoH7Screens .aoC3PrayerSlide").nth(adorationSlide).evaluate(slide=>{
     const img=slide.querySelector("img"),r=img.getBoundingClientRect();
     return {visible:!slide.hidden&&r.width>0&&r.height>0,objectFit:getComputedStyle(img).objectFit,
             width:img.naturalWidth,height:img.naturalHeight};
   });
   assert.ok(presented.visible&&presented.objectFit==="contain","Adoration must show complete original painting composition");
   await page.screenshot({path:resolve(dir,"home-met-c3-adoration-"+width+".png"),animations:"disabled",fullPage:true});
   cases.push({width,status:"TECHNICAL_PASS",facts,scriptErrors:errors,sourceImageOrCropUserApproved:false});
   console.log("PASS C3 Home",width,"Adoration decoded; Angelus slides=",angelus.length);
  }catch(e){
   cases.push({width,status:"FAIL",error:String(e?.stack??e).slice(0,1600),scriptErrors:errors});
   console.error("FAIL C3 Home "+width+":",String(e).slice(0,400));
  }finally{await ctx.close();}
 }
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
const result={schema:"AO_TWO_APPROVED_MET_HOME_PHONE_TECHNICAL_V1",cases,
 summary:{technicalPasses:cases.filter(x=>x.status==="TECHNICAL_PASS").length,photoReleaseCertified:0,ownerCropApprovalRecorded:false}};
await writeFile(resolve(dir,"report.json"),JSON.stringify(result,null,2)+"\n");
assert.equal(result.summary.technicalPasses,2,"C3 Home draft artwork failed phone QA");
