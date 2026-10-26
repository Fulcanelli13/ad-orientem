import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const ROOT=path.resolve(import.meta.dirname,"..");
const base=path.join(ROOT,"assets/staged/champaigne-petite-cene-research");
const html=path.join(base,"mobile-desktop-visual-qa.html");
const output=path.join(base,"responsive-test-screenshots");
fs.mkdirSync(output,{recursive:true});
const summary=[];
const browser=await chromium.launch({headless:true});
try {
 for(const width of [320,390,768,1440]) {
  const context=await browser.newContext({viewport:{width,height:880},deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(pathToFileURL(html).href,{waitUntil:"load"});
  const hero=page.locator("#hero img");
  assert.equal(await hero.count(),1);
  const metrics=await hero.evaluate(img=>{
    const a=img.getBoundingClientRect();
    const styles=getComputedStyle(img);
    return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
      actualWidth:a.width,actualHeight:a.height,
      objectFit:styles.objectFit,
      visible:a.width>0 && a.height>0,
      horizontalScroll:document.documentElement.scrollWidth,
      fullImageRatio:a.width/a.height, sourceRatio:img.naturalWidth/img.naturalHeight};
  });
  assert.deepEqual([metrics.naturalWidth,metrics.naturalHeight],[2250,1208]);
  assert.equal(metrics.objectFit,"contain");
  assert.ok(metrics.visible);
  assert.ok(metrics.actualWidth<=width+2);
  assert.ok(metrics.horizontalScroll<=width+2);
  assert.ok(Math.abs(metrics.fullImageRatio-metrics.sourceRatio)<0.005);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(output,"champaigne-painting-"+width+"-hero.png"),fullPage:false});
  await page.locator("#openfull").click();
  const dialog=page.locator("#fullview");
  assert.equal(await dialog.evaluate(x=>x.classList.contains("active")),true);
  const full=dialog.locator("img");
  const fullSizes=await full.evaluate(x=>{
    const r=x.getBoundingClientRect();
    return {natural:[x.naturalWidth,x.naturalHeight],displayed:[r.width,r.height],
      objectFit:getComputedStyle(x).objectFit,
      bodyScroll:document.documentElement.scrollWidth};
  });
  assert.deepEqual(fullSizes.natural,[2250,1208]);
  assert.ok(fullSizes.displayed[0]<=width+2);
  assert.equal(fullSizes.objectFit,"contain");
  await page.screenshot({path:path.join(output,"champaigne-painting-"+width+"-fullview.png")});
  await page.keyboard.press("Escape");
  assert.equal(await dialog.evaluate(x=>x.classList.contains("active")),false);
  summary.push({width,metrics,fullview:fullSizes,source_photo_passed_native_fidelity:false,
     original_painted_bounds_certified:false,
     true_color_approved:false,approved_for_app:false});
  await context.close();
 }
} finally {await browser.close()}
fs.writeFileSync(path.join(output,"test-results.json"),JSON.stringify({
 result:"BROWSER LAYOUT FIT ONLY, NEVER PAINTING QUALITY OR RIGHTS APPROVAL",
 viewports:summary,published:false,fullImageRetained:true
},null,2)+"\n");
console.log("PASS: 4 responsive widths, painting fully contained, open/close full-view, no browser overflow; actual artwork release still blocked");
