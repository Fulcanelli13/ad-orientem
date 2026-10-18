import assert from "node:assert/strict";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const file=pathToFileURL(resolve(root,"previews/visible-mass-3d/M6_Photo_Review_112_Sources_20261018.html")).href;
const browser=await chromium.launch({headless:true});
try{
 for(const cfg of [{name:"desktop",width:1280,height:820},{name:"phone",width:390,height:844}]){
  const ctx=await browser.newContext({viewport:{width:cfg.width,height:cfg.height},acceptDownloads:true,isMobile:cfg.name==="phone",hasTouch:cfg.name==="phone"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  await page.route(/^https?:\/\//,r=>r.abort("internetdisconnected"));
  await page.goto(file,{waitUntil:"load"});
  await page.waitForFunction(()=>window.AO_M6_COMPARATIVE?.status()?.objects===170);
  const status=await page.evaluate(()=>window.AO_M6_COMPARATIVE.status());
  assert.equal(status.images,112);
  assert.equal(status.pilot,30);
  assert.equal(status.showing,30);
  assert.equal(await page.locator("#m6-source-archive").isVisible(),false,"Research archive starts hidden");
  assert.ok(status.ready_four<30,"Do not misrepresent existing sparse acquisitions as curated alternatives");

  assert.equal(await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("EQ06")),true);
  assert.match(await page.locator("#m6-object-head").innerText(),/Altar bell/);
  assert.equal(await page.locator("#m6-best .m6-card").count(),2,"Both actual altar-bell photographs belong together");
  assert.match(await page.locator("#m6-shortfall").innerText(),/2 \/ 4 potentially comparable/);
  const cards=page.locator("#m6-best .m6-card");
  await cards.nth(0).locator('[data-field="rating"]').selectOption("4");
  await cards.nth(0).locator('[data-field="rank"]').selectOption("1");
  await cards.nth(0).locator('[data-field="placement"]').selectOption("primary");
  let review=await page.evaluate(()=>window.AO_M6_COMPARATIVE.exportReview());
  assert.equal(review.schema,"AO_VISIBLE_MASS_M6_COMPARISON_REVIEW_V1");
  assert.equal(review.release_approval,false);
  assert.equal(review.decisions.length,1);
  assert.deepEqual(review.decisions[0].object_id,"EQ06");
  assert.equal(review.decisions[0].rating,"4");
  assert.equal(review.decisions[0].rank,"1");
  assert.ok(review.acquisition_queue.some(x=>x.object_id==="AL17"&&x.shortfall>0));

  // Rankings are unique within an object and do not apply to images of another object.
  await cards.nth(1).locator('[data-field="rank"]').selectOption("1");
  review=await page.evaluate(()=>window.AO_M6_COMPARATIVE.exportReview());
  assert.equal(review.decisions.filter(x=>x.object_id==="EQ06"&&x.rank==="1").length,1);
  assert.equal(review.decisions.length,2);

  await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("VE15"));
  assert.match(await page.locator("#m6-shortfall").innerText(),/0 \/ 4 potentially comparable/,"Vestment colour variants are not interchangeable photographs");
  assert.equal(await page.locator("#m6-best .m6-card").count(),0);
  assert.equal(await page.locator("#m6-other .m6-card").count(),5);

  await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("AL17"));
  assert.match(await page.locator("#m6-shortfall").innerText(),/original altar viewpoint/i);
  assert.equal(await page.locator("#m6-best .m6-card").count(),0);
  await page.locator("#m6-toggle-queue").click();
  assert.equal(await page.locator("#m6-queue").isVisible(),true);
  assert.match(await page.locator("#m6-queue").innerText(),/Acquisition gaps/);
  await page.locator("#m6-toggle-queue").click();

  await page.locator("#m6-show-archive").click();
  assert.equal(await page.locator("#m6-source-archive").isVisible(),true);
  await page.locator("#mode-images").click();
  await page.locator("#only-new").uncheck(); // the source archive defaults to newly acquired M6 only
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_M6_ATLAS.status())).visible,112);
  await page.locator("#m6-show-comparison").click();
  assert.equal(await page.locator("#m6-comparison").isVisible(),true);

  // Export format round trips without mutating canonical source data.
  const before=await page.evaluate(()=>window.AO_M6_COMPARATIVE.exportReview());
  const count=await page.evaluate(d=>window.AO_M6_COMPARATIVE.importReview(JSON.stringify(d)),before);
  assert.equal(count,2);
  const after=await page.evaluate(()=>window.AO_M6_COMPARATIVE.exportReview());
  assert.deepEqual(after.decisions,before.decisions);
  assert.deepEqual(errors,[],cfg.name+" comparison file must run offline without JS errors");
  console.log("PASS M6 comparison",cfg.name,JSON.stringify(status),review.decisions.length+" decisions");
  await ctx.close();
 }
} finally {await browser.close()}
