import assert from "node:assert/strict";
import {readFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";
import {chromium} from "@playwright/test";
const source=readFileSync(new URL("../reviews/biblical-genealogy-research-prototype-20261011.html",import.meta.url),"utf8");
const payload=source.match(/<script id="atlasData" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(payload,"embedded offline research index");
const D=JSON.parse(payload[1]);
assert.equal(D.P.length,3231);
assert.equal(D.G.length,1342);
assert.equal(D.M.length,1596);
assert.equal(D.L.length,9802);
assert.ok(D.P.some(x=>x[0]==="Mary_Mat.1.16"));
assert.ok(D.P.some(x=>x[0]==="Jesus_Mat.1.1"));
const js=source.match(/<script>([\s\S]*?)<\/script><\/body>/)?.[1];
assert.ok(js);
new Function(js); // syntax check
const dir=fileURLToPath(new URL("../artifacts/biblical-genealogy/",import.meta.url));
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [width,height] of [[320,720],[390,844],[768,1024]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:true});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.setContent(source,{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>document.querySelector("#personName")?.textContent?.length>0);
  assert.match(await page.locator("#headCounts").innerText(),/3,231/);
  assert.equal(await page.locator("#personName").innerText(),"Abraham");
  assert.ok(await page.locator(".person").count()>=3,"initial family graph");
  assert.equal(await page.locator('#treeScroll [data-person="Isaac_Gen.17.19"]').count(),1,"Abraham -> Isaac source record shown");
  await page.locator('#treeScroll [data-person="Isaac_Gen.17.19"]').first().click();
  assert.ok((await page.locator(".person").count())>=3,"Isaac branch expands");
  await page.locator("#search").fill("Mary");
  await page.locator('#searchResults [data-person-search]').first().waitFor();
  await page.locator('[data-pick="Mary_Mat.1.16"]').click();
  assert.equal(await page.locator("#personName").innerText(),"Mary");
  assert.ok((await page.locator("#personChildren").innerText()).includes("Jesus"));
  assert.ok(!(await page.locator("#personChildren").innerText()).includes("James"),"Mary other offspring blocked");
  await page.locator('[data-pick="Jesus_Mat.1.1"]').click();
  assert.ok((await page.locator("#personNotes").innerText()).includes("Catholic safeguard"));
  assert.ok(!(await page.locator("#personChildren").innerText()).includes("James"));
  assert.ok((await page.locator("#personParents").innerText()).includes("Joseph"),"legal father rendered");
  await page.locator("#navPlaces").click();
  assert.equal(await page.locator("#placeView").isVisible(),true);
  assert.ok(await page.locator("#coMap").isVisible());
  await page.locator("#language").click();
  assert.ok((await page.locator("#headCounts").innerText()).includes("personnes"));
  await page.locator("#navFamily").click();
  assert.equal(await page.locator("#familyView").isVisible(),true);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<2,"no page horizontal overflow");
  assert.deepEqual(errors,[],"browser errors");
  await page.screenshot({path:join(dir,"family-"+width+".png"),fullPage:true});
  console.log("PASS genealogy research",width,height);
  await ctx.close();
 }
}finally{await browser.close()}
