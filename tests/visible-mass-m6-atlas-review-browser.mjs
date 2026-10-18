import assert from "node:assert/strict";
import {access,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const html=resolve(root,"dist/visible-mass/The_Visible_Mass_M6_Photographic_Atlas_Review.html");
await access(html);
const out=resolve(root,"dist/visible-mass/m6-review-qa");await mkdir(out,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const spec of [{id:"desktop",width:1280,height:820},{id:"phone",width:390,height:844}]){
  const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},hasTouch:spec.id==="phone",isMobile:spec.id==="phone"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route(/^https?:\/\//,route=>route.abort("internetdisconnected"));
  await page.goto(pathToFileURL(html).href,{waitUntil:"load"});
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_M6_ATLAS?.status()?.objects===170);
  let status=await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.status());
  assert.equal(status.zones,13);assert.equal(status.images,35);assert.equal(status.visible,170);
  await page.screenshot({path:out+"/"+spec.id+"-object-atlas.png",fullPage:false});
  await page.locator("#zone").selectOption("AL");status=await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.status());assert.equal(status.visible,20);
  await page.locator("#zone").selectOption("");
  await page.locator("#pilot").check();status=await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.status());assert.equal(status.visible,30);
  await page.locator("#pilot").uncheck();
  await page.locator("#coverage").selectOption("PROVISIONAL_ORIGINAL_STILL_HOTSPOT");
  status=await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.status());assert.equal(status.visible,6);
  await page.locator("#coverage").selectOption("NEW_SOURCE_PHOTO_CANDIDATE");
  status=await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.status());assert.equal(status.visible,2);
  assert.match(await page.locator("#results").innerText(),/Altar bell/);
  assert.match(await page.locator("#results").innerText(),/Individual altar candle/);
  await page.locator("#coverage").selectOption("");
  await page.locator("#mode-images").click();
  status=await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.status());assert.equal(status.visible,35);
  await page.locator("#search").fill("M6-EQ06-ALTAR-BELLS-PHOTO");
  status=await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.status());assert.equal(status.visible,1);
  await page.locator('[data-rank="M6-EQ06-ALTAR-BELLS-PHOTO"]').selectOption("4");
  await page.locator('[data-placement="M6-EQ06-ALTAR-BELLS-PHOTO"]').selectOption("secondary");
  const saved=await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.exportReview());
  assert.equal(saved.decisions.length,1);
  assert.deepEqual(saved.decisions[0],{asset_id:"M6-EQ06-ALTAR-BELLS-PHOTO",rating:"4",placement:"secondary"});
  await page.locator("#search").fill("");
  await page.screenshot({path:out+"/"+spec.id+"-image-atlas.png",fullPage:false});
  assert.deepEqual(errors,[],"Static original-source photographic atlas should open offline without JS exceptions");
  console.log("PASS M6 Atlas offline gallery",spec.id,JSON.stringify(status),"portable curation export");
  await context.close();
 }
}finally{await browser?.close();}
