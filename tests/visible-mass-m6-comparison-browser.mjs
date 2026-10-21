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
  assert.equal(status.staged,26,"Three staged acquisition batches must not inflate the 112-record canonical register");
  assert.equal(status.ready_four,4,"Two visually held chalice photos no longer count as clean four-photo options; 4 groups remain metadata-filled");
  assert.equal(status.pilot,30);
  assert.equal(status.showing,4,"Only fully metadata-qualified object groups appear on initial ready-only filter");
  assert.equal(status.original_qa_inspected,3);
  assert.equal(status.original_qa_screening_holds,2);
  assert.match(await page.locator("#m6-comparison").innerText(),/3\/20 inspected/);
  assert.equal(status.selected,"SV02","Prioritize new paten comparison on initial open");
  assert.equal(await page.locator("#m6-source-archive").isVisible(),false,"Research archive starts hidden");
  assert.ok(status.ready_four<30,"Do not misrepresent existing sparse acquisitions as curated alternatives");

  assert.equal(await page.locator("#m6-best .m6-card").count(),4,"SV02 patens: four distinct isolated Roman Catholic paten specimens");
  assert.match(await page.locator("#m6-best").innerText(),/POUSSIELGUE-1900/);
  assert.match(await page.locator("#m6-best").innerText(),/CLERMONT-STSAMSON/);
  assert.match(await page.locator("#m6-best").innerText(),/DOL-STSAMSON-VERMEIL/);
  assert.match(await page.locator("#m6-other").innerText(),/BERGER-NESME-CONTEXT/,"Partially visible paten must be contextual rather than a full isolated object candidate");
  assert.equal(await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("SV03")),true);
  assert.equal(await page.locator("#m6-best .m6-card").count(),4,"SV03 ciboria: four distinct covered Latin Catholic host vessels");
  assert.match(await page.locator("#m6-best").innerText(),/ARRAS-FAVIER-1871/);
  assert.match(await page.locator("#m6-best").innerText(),/EVELLIN-1962/);
  assert.doesNotMatch(await page.locator("#m6-best").innerText(),/MORLOT/,"Mislabeled Notre-Dame source actually depicts altar cruets");
  assert.equal(await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("SV01")),true);
  assert.match(await page.locator("#m6-object-head").innerText(),/Chalice/);
  assert.equal(await page.locator("#m6-best .m6-card").count(),2,"Two visually unsuitable chalice photos are no longer presented as clean interchangeable shortlist");
  assert.match(await page.locator("#m6-shortfall").innerText(),/2 \/ 4 potentially comparable/);
  assert.match(await page.locator("#m6-other").innerText(),/GENOA-PRE1777/);
  assert.match(await page.locator("#m6-other").innerText(),/SEVILLE-ISABELII/);
  assert.match(await page.locator("#m6-other").innerText(),/Original pixels examined/);
  assert.match(await page.locator("#m6-best").innerText(),/GENOA-1780/);
  assert.match(await page.locator("#m6-best").innerText(),/BARI-1760/);
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
  assert.equal(review.original_pixels_inspected,3);
  assert.equal(review.source_fetch_rate_limited,true);
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

  await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("LN04"));
  assert.equal(await page.locator("#m6-best .m6-card").count(),4,"Four actual liturgical corporal burses, not viaticum carrying pouches");
  assert.match(await page.locator("#m6-best").innerText(),/RENNES-CORPORAL-1900/);
  assert.match(await page.locator("#m6-best").innerText(),/STGALLEN-BURSE/);
  assert.match(await page.locator("#m6-other").innerText(),/MAASTRICHT-BURSE/,"Old multi-object photo demoted to context");
  assert.match(await page.locator("#m6-other").innerText(),/PRENDERGAST-ENSEMBLE/,"Burse/veil ensemble staged as non-comparable contextual source");
  await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("LN05"));
  assert.equal(await page.locator("#m6-best .m6-card").count(),4,"Four different Catholic chalice veils, including original Spanish specimen");
  assert.match(await page.locator("#m6-best").innerText(),/POLAND-CHRIST-COLUMN/);
  assert.match(await page.locator("#m6-other").innerText(),/ITALY-MET-LACE/,"Lace example remains historical rather than ordinary opaque 1962 veil");
  await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("SV02"));
  assert.match(await page.locator("#m6-other").innerText(),/SPAIN-MET-17190366/,"Historic Spanish paten must not count as modern primary candidate");
  await page.evaluate(()=>window.AO_M6_COMPARATIVE.jump("SV03"));
  assert.match(await page.locator("#m6-other").innerText(),/COLOGNE-HOST-CIBORIUM/,"Medieval ciborium stays historical reference");
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
