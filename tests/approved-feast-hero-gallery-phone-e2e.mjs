import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const ROOT=path.resolve(import.meta.dirname,"..");
const INDEX=path.join(ROOT,"docs/research/APPROVED-FEAST-HERO-PHOTO-REVIEW-20261021.html");
const MANIFEST=path.join(ROOT,"data/calendar/approved-feast-hero-packaged-candidates-20261021.v1.json");
const report=JSON.parse(fs.readFileSync(MANIFEST,"utf8"));
assert.equal(report.photographs.length,10);
const holy=report.photographs.find(x=>x.date==="2026-04-02");
const ember=report.photographs.find(x=>x.date==="2026-05-27");
assert.equal(holy.artist,"Philippe de Champaigne");
assert.equal(holy.title,"La Petite Cène");
assert.equal(holy.candidateFile.path,ember.candidateFile.path);
const reviewHtml=fs.readFileSync(INDEX,"utf8");
assert.ok(!reviewHtml.includes("Ugolino da Siena"),"Old withdrawn Holy Thursday painting must not appear in active gallery");
assert.ok(reviewHtml.includes("2026-04-02 · Holy Thursday"),"Revised Holy Thursday artwork must be represented");
assert.equal(report.humanAcceptedImagePhotos,0);
assert.equal(report.explicitAppRightsReleaseApprovals,0);
assert.equal(report.liveReleaseManifest,null);
const dest=path.join(ROOT,"artifacts/sacred-art-approved-feast-hero-phone-qa");
fs.mkdirSync(dest,{recursive:true});
const browser=await chromium.launch({headless:true});
const summary=[];
try{
  for(const viewportWidth of [320,390]){
    const context=await browser.newContext({viewport:{width:viewportWidth,height:740},deviceScaleFactor:1});
    const page=await context.newPage();
    const failed=[];
    page.on("pageerror",e=>failed.push(e.message));
    await page.goto(pathToFileURL(INDEX).href,{waitUntil:"domcontentloaded"});
    await page.locator(".painting").first().waitFor();
    assert.equal(await page.locator(".painting").count(),10);
    let checks=[];
    for(const [index,item] of report.photographs.entries()){
      const card=page.locator(".painting").nth(index);
      const img=card.locator("img");
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(async el=>{
        if(!el.complete)await new Promise((resolve,reject)=>{
          el.addEventListener("load",resolve,{once:true});
          el.addEventListener("error",()=>reject(new Error("Source photograph failed to load")),{once:true});
        });
      });
      const d=await img.evaluate(img=>{
        const b=img.getBoundingClientRect();
        const frame=img.closest("figure").getBoundingClientRect();
        const css=getComputedStyle(img);
        return {
          alt:img.alt,
          natural:[img.naturalWidth,img.naturalHeight],
          rect:{left:b.left,right:b.right,top:b.top,bottom:b.bottom},
          frame:{left:frame.left,right:frame.right,top:frame.top,bottom:frame.bottom},
          fit:css.objectFit,visible:b.width>0&&b.height>0
        };
      });
      assert.ok(d.natural[0]>=400&&d.natural[1]>=400,item.date+" candidate natural resolution");
      assert.equal(d.fit,"contain",item.date+" full painting must be contained");
      assert.ok(d.visible,item.date+" visible image");
      assert.ok(d.rect.left>=d.frame.left-2&&d.rect.right<=d.frame.right+2,item.date+" horizontally contained");
      assert.ok(d.rect.top>=d.frame.top-2&&d.rect.bottom<=d.frame.bottom+2,item.date+" vertically contained");
      assert.ok(d.alt.includes(item.title),item.date+" accurate alt");
      checks.push({date:item.date,painting:item.title,originallySelected:true,wholePhotoFitted:true,sourceRes:d.natural});
    }
    await page.evaluate(()=>window.scrollTo(0,0));
    const scrollWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
    assert.ok(scrollWidth<=viewportWidth+2,"horizontal overflow "+scrollWidth+" at "+viewportWidth);
    assert.deepEqual(failed,[]);
    await page.screenshot({path:path.join(dest,"approved-feast-hero-gallery-"+viewportWidth+".png"),fullPage:true});
    summary.push({viewportWidth,photographsLoaded:checks.length,
      imagesContained:checks.every(x=>x.wholePhotoFitted),scrollWidth,checks,
      screenshot:"approved-feast-hero-gallery-"+viewportWidth+".png",
      photoHumanAccepted:false,releaseCertified:false});
    await context.close();
  }
}finally{
  await browser.close();
}
fs.writeFileSync(path.join(dest,"approved-feast-hero-browser-mobile-qa.json"),
  JSON.stringify({scope:"AUTOMATED_BROWSER_FIT_NOT_CURATOR_VISUAL_APPROVAL",passed:true,
    viewports:summary,liveReleases:0},null,2)+"\n");
console.log("HERO_PHONE_GALLERY_QA PASS: 10 candidates x 320/390px, source loads, object-fit contain, no clipping or horizontal overflow. Human photo approval remains pending.");
