import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
const html=await readFile(resolve(".tmp/schola-1962-selected-annual/2026-all-1961-mass-source-gabc-study.html"),"utf8");
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setContent(html,{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.dataset.aoSourceScoreReviewReady==="true");
 assert.equal(await page.locator("#render").isDisabled(),true);
 assert.equal(await page.locator("#sequences a").count(),5);
 for(const [family,id,min] of [["GLORIA","GREGOBASE-961",200],["CREDO","GREGOBASE-749",300],["INTROIT","GREGOBASE-1278",70]]){
  await page.locator("#family").selectOption(family);
  await page.locator("#scoreList").selectOption(id);
  await page.locator("#render").click();
  await page.waitForFunction(()=>document.querySelector("#engraveStatus")?.textContent?.startsWith("Rendered directly from"));
  assert.ok(await page.locator("#engrave svg use").count()>=min,id);
  assert.ok(await page.locator("#engrave svg text").count()>10,id);
  assert.ok((await page.locator("#scoreInfo").textContent()).includes("Musical approval: NO"),id);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),id);
 }
 await page.locator("#family").selectOption("");
 await page.locator("#matched").selectOption("matched");
 assert.equal(await page.locator("#scoreList option").count(),335);
 assert.deepEqual(errors,[]);
 console.log("ORIGINAL_1961_EXSURGE_BROWSER_PASS: Gloria VIII, Credo III, Introit, 335 selected-source scores, 0 JS errors");
}finally{await browser.close()}
