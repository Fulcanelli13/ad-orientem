import assert from "node:assert/strict";
import {readFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";
import {chromium} from "@playwright/test";

const html=readFileSync(new URL("../reviews/biblical-atlas-cinematic-expanded-181-20261011.html",import.meta.url),"utf8");
assert.equal((html.match(/<script>/g)||[]).length,1,"standalone one-file script");
assert.ok(!/<script[^>]+src=/.test(html),"no external script required");
assert.ok(html.includes("The crossing of the sea")&&html.includes("The road to Damascus"));
const shots=fileURLToPath(new URL("../artifacts/biblical-atlas-expanded/",import.meta.url));
mkdirSync(shots,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 for(const [width,height] of [[320,720],[390,844],[768,1024]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<=390,hasTouch:true});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.setContent(html,{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".milestone").count(),181,"181 scenes");
  assert.equal(await page.locator(".journey-tab").count(),4,"four journeys");
  assert.equal(await page.locator("#sheetTitle").innerText(),"The call of Abram");
  assert.equal(await page.locator("#cinema").isVisible(),false,"no forced opening cinema");
  assert.ok(await page.locator("#mapSvg").isVisible());
  assert.ok(await page.locator("#mapStage").evaluate(el=>el.getBoundingClientRect().height)>=230);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,"no horizontal viewport overflow");
  const metrics=await page.evaluate(()=>({
    count:STEPS.length,
    chapters:Object.keys(CHAPTERS).length,
    groups:Object.fromEntries(ids.map(id=>[id,STEPS.filter(e=>e.group===id).length])),
    unknown:STEPS.filter(e=>e.certainty==="N").length,
    hasCertainty:STEPS.every(e=>["P","T","R","N"].includes(e.certainty)),
    invalid:STEPS.filter(e=>!e.descEn||!e.descFr||!e.ref).length,
    exodusCrossing:STEPS.find(e=>e.en==="The crossing of the sea")
  }));
  assert.deepEqual(metrics.groups,{ABRAHAM:25,MOSES:32,CHRIST:81,PAUL:43});
  assert.equal(metrics.chapters,14);
  assert.equal(metrics.invalid,0);
  assert.equal(metrics.hasCertainty,true);
  assert.ok(metrics.unknown>=5);
  assert.equal(metrics.exodusCrossing.certainty,"N");
  assert.equal(metrics.exodusCrossing.lng,null,"no invented crossing GPS");
  if(width===390){
    await page.locator('[data-g="MOSES"]').click();
    assert.equal(await page.evaluate(()=>active),25);
    assert.ok(await page.locator("#cinema").isVisible(),"Moses chapter intro");
    await page.locator("#skipCine").click();
    await page.locator("#chaptersBtn").click();
    assert.ok(await page.locator("#chapterNavigator").isVisible());
    assert.equal(await page.locator(".chapter-jump").count(),14,"14 quick chapter links");
    await page.locator('[data-chapter="COVENANT"]').click();
    assert.equal(await page.evaluate(()=>STEPS[active].chapter),"COVENANT");
    assert.ok(await page.locator("#cinema").isVisible(),"deliberate chapter jump always animates");
    await page.locator("#skipCine").click();
    await page.locator('[data-g="CHRIST"]').click();
    assert.equal(await page.evaluate(()=>STEPS[active].en),"The Annunciation");
    await page.locator("#skipCine").click();
    await page.locator("#next").click();
    assert.equal(await page.locator("#sheetTitle").innerText(),"Joseph receives the angelic message");
    await page.locator("#read").click();
    assert.ok(await page.locator("#reader").isVisible(),"reader preview");
    assert.match(await page.locator("#readerReference").innerText(),/Matthew 1/);
    await page.locator("#closeReader").click();
    await page.locator('[data-g="PAUL"]').click();
    assert.equal(await page.evaluate(()=>STEPS[active].en),"The road to Damascus");
    await page.locator("#skipCine").click();
    await page.locator("#chaptersBtn").click();
    await page.locator('[data-chapter="SECOND_MISSION"]').click();
    assert.equal(await page.evaluate(()=>STEPS[active].chapter),"SECOND_MISSION");
    await page.locator("#skipCine").click();
    assert.ok(await page.locator(".pin.active").count()>=1);
    await page.locator("#lang").click();
    assert.equal(await page.locator("#atlasTitle").innerText(),"Atlas biblique");
    assert.match(await page.locator("#chaptersBtn").innerText(),/CHAPITRES/);
    await page.locator("#lang").click();
    await page.locator('[data-g="ABRAHAM"]').click();
    await page.locator("#skipCine").click();
    await page.waitForTimeout(650);
    await page.locator("#timeline").evaluate(el=>{el.scrollLeft=680;el.dispatchEvent(new Event("scroll"))});
    await page.waitForTimeout(650);
    assert.ok(await page.evaluate(()=>active)>0,"finger scroll selects milestone");
  }
  assert.deepEqual(errors,[],"no browser JS errors");
  await page.screenshot({path:join(shots,"expanded-"+width+".png"),fullPage:true});
  console.log("PASS expanded biblical atlas",width+"x"+height,metrics.groups);
  await context.close();
 }
}finally{await browser.close();}
