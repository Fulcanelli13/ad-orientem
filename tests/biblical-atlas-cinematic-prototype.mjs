import assert from "node:assert/strict";
import {readFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";
import {chromium} from "@playwright/test";
const html=readFileSync(new URL("../reviews/biblical-atlas-cinematic-prototype-20261011.html",import.meta.url),"utf8");
assert.ok(html.includes("The call of Abram")&&html.includes("The road to Damascus"));
assert.equal((html.match(/<script>/g)||[]).length,1,"single-file inline runtime");
assert.ok(!/<script[^>]+src=/.test(html),"no external JavaScript dependency");
const artifactDir=fileURLToPath(new URL("../artifacts/biblical-atlas-prototype/",import.meta.url));
mkdirSync(artifactDir,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [width,height] of [[320,720],[390,844],[768,1024]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<=390,hasTouch:true});
  const page=await ctx.newPage(),errs=[];
  page.on("pageerror",e=>errs.push(String(e)));
  await page.setContent(html,{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".milestone").count(),48,"three curated journeys");
  assert.equal(await page.locator("#sheetTitle").innerText(),"The call of Abram");
  assert.equal(await page.locator("#cinema").isVisible(),false,"initial entry is map first");
  assert.equal(await page.locator("#mapSvg").isVisible(),true);
  assert.ok(await page.locator("#mapStage").evaluate(el=>el.getBoundingClientRect().height)>=230);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,"no horizontal viewport overflow");
  if(width===390){
    await page.locator('[data-g="CHRIST"]').click();
    assert.equal(await page.evaluate(()=>active),12,"Christ chapter entry");
    assert.ok(await page.locator("#cinema").isVisible(),"art-directed chapter transition");
    await page.locator("#skipCine").click();
    await page.locator("#next").click();
    assert.equal(await page.locator("#sheetTitle").innerText(),"The Visitation");
    await page.locator("#read").click();
    assert.ok(await page.locator("#reader").isVisible(),"inline scripture context");
    assert.match(await page.locator("#readerReference").innerText(),/Luke 1:39/);
    await page.locator('[data-tab="geography"]').click();
    assert.ok((await page.locator("#readerBody").innerText()).length>10);
    await page.locator("#closeReader").click();
    assert.equal(await page.evaluate(()=>active),13,"read/return preserves place");
    await page.locator('[data-g="PAUL"]').click();
    assert.equal(await page.evaluate(()=>active),33);
    assert.ok(await page.locator("#cinema").isVisible());
    await page.locator("#skipCine").click();
    assert.ok(await page.locator(".pin.active").count()>0);
    await page.locator(".pin.active").first().evaluate(el=>el.click());
    assert.match(await page.locator("#sheet").getAttribute("class"),/expanded/);
    await page.locator("#expand").click();
    const box=await page.locator("#mapSvg").boundingBox(),x=box.x+box.width*.34,y=box.y+box.height*.2;
    await page.mouse.move(x,y);await page.mouse.down();
    await page.mouse.move(x+55,y+28,{steps:8});await page.mouse.up();
    assert.equal(await page.evaluate(()=>following),false,"manual map pan disengages follow");
    await page.locator("#follow").click();
    assert.equal(await page.evaluate(()=>following),true,"follow resumes");
    await page.locator("#lang").click();
    assert.equal(await page.locator("#atlasTitle").innerText(),"Atlas biblique");
    await page.locator("#lang").click();
    await page.locator('[data-g="ABRAHAM"]').click();
    await page.locator("#skipCine").click();
    await page.waitForTimeout(700);
    await page.locator("#timeline").evaluate(el=>{el.scrollLeft=640;el.dispatchEvent(new Event("scroll"))});
    await page.waitForTimeout(600);
    assert.ok(await page.evaluate(()=>active)>0,"horizontal scroll updates milestone");
  }
  assert.deepEqual(errs,[],"no script exceptions");
  await page.screenshot({path:join(artifactDir,"atlas-"+width+".png"),fullPage:true});
  console.log("PASS Biblical Atlas prototype",width,"×",height);
  await ctx.close();
 }
}finally{await browser.close();}
