import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";
const root=fileURLToPath(new URL("..",import.meta.url));
const path=resolve(root,"artifacts/p2-formation-prayer-review/index.html");
const html=await readFile(path,"utf8");
assert.equal((html.match(/class="entry" id=/g)||[]).length,84);
assert.equal((html.match(/<em class="optional"/g)||[]).length,3);
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:860},
   hasTouch:width<=390,isMobile:width<=390});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  await page.goto(pathToFileURL(path).href,{waitUntil:"load"});
  // Review TOC includes 84 collapsed chapters. Suppress long-distance smooth
  // scroll animation, which otherwise makes automated click-stability waits
  // grow with the distance and number of repeated checks.
  await page.addStyleTag({content:"html{scroll-behavior:auto!important}"});
  assert.equal(await page.locator("details.entry").count(),84);
  assert.equal(await page.locator('details.entry summary .optional').count(),3);
  assert.equal(await page.locator(".held li").count(),11);
  assert.equal(await page.locator("[data-conclusion-condition]").count(),6);
  assert.equal(await page.locator("[data-opening-condition]").count(),5);
  assert.equal(await page.locator('details.entry[open]').count(),1);
  await page.locator('a[href="#AO.SM.B003"]').click();
  assert.match(await page.locator('#AO\\.SM\\.B003 summary').innerText(),/PSALM MAY BE OMITTED/);
  await page.locator('a[href="#AO.SM.B013"]').click();
  assert.match(await page.locator('#AO\\.SM\\.B013 summary').innerText(),/INCENSE CONDITION/);
  await page.locator('a[href="#AO.SM.B016"]').click();
  assert.match(await page.locator('#AO\\.SM\\.B016 summary').innerText(),/GLORIA DEPENDS ON MASS/);
  await page.locator('a[href="#AO.SM.B025"]').click();
  assert.match(await page.locator('#AO\\.SM\\.B025 summary').innerText(),/GOSPEL HEADING VARIES/);
  await page.locator('a[href="#AO.SM.B027"]').click();
  assert.match(await page.locator('#AO\\.SM\\.B027 summary').innerText(),/CREDO DEPENDS ON MASS/);
  await page.locator('a[href="#AO.SM.B063"]').click();
  const pater=page.locator('#AO\\.SM\\.B063');
  assert.equal(await pater.getAttribute("open"),"",
   "Table of contents must open the source paragraph");
  assert.deepEqual(await pater.locator("[data-source-voice]").evaluateAll(elements=>
    elements.map(node=>node.dataset.sourceVoice)),
    ["PUBLIC_TEXT","USER_RESPONSE","PRIEST_PRIVATE"],
    "Do not fuse the Pater noster priest/public response/private Amen");
  await page.locator('a[href="#AO.SM.B073"]').click();
  assert.equal(await page.locator('#AO\\.SM\\.B073 [data-source-voice="PRIEST_PRIVATE"]').count(),3);
  await page.locator('a[href="#AO.SM.B081"]').click();
  assert.equal(await page.locator('#AO\\.SM\\.B081 [data-source-voice="PUBLIC_TEXT"]').count(),3);
  await page.locator('a[href="#AO.SM.B077"]').click();
  assert.match(await page.locator('#AO\\.SM\\.B077 summary').innerText(),/OPTIONAL LOCAL CUSTOM/);
  await page.locator('[data-select-lang="fr"]').click();
  assert.equal(await page.locator('[data-select-lang="fr"]').getAttribute("aria-pressed"),"true");
  assert.equal(await page.locator('[data-select-lang="en"]').getAttribute("aria-pressed"),"false");
  assert.equal(await page.locator('#AO\\.SM\\.B077 [data-lang="fr"]').isVisible(),true);
  assert.equal(await page.locator('#AO\\.SM\\.B077 [data-lang="en"]').isVisible(),false);
  const latin=await page.locator('#AO\\.SM\\.B077 .sourceLine p[lang="la"]').first().innerText();
  assert.match(latin,/Confíteor/);
  await page.locator('a[href="#AO.SM.B084"]').click();
  const last=page.locator('#AO\\.SM\\.B084');
  assert.equal(await last.getAttribute("open"),"");
  assert.match(await last.locator('[data-lang="fr"] h3').innerText(),/prière après la communion/i);
  await page.locator('a[href="#AO.SM.B090"]').click();
  assert.match(await page.locator('#AO\\.SM\\.B090 summary').innerText(),/DISMISSAL VARIES/);
  await page.locator('a[href="#AO.SM.B092"]').click();
  assert.match(await page.locator('#AO\\.SM\\.B092 summary').innerText(),/BLESSING MAY BE OMITTED/);
  await page.locator('a[href="#AO.SM.B095"]').click();
  const gospel=page.locator('#AO\\.SM\\.B095');
  assert.equal(await gospel.getAttribute("open"),"");
  assert.match(await gospel.locator("summary").innerText(),/LAST GOSPEL MAY BE OMITTED/);
  assert.equal(await gospel.locator('[data-source-voice="PUBLIC_TEXT"]').count(),4);
  assert.equal(await gospel.locator('[data-source-voice="USER_RESPONSE"]').count(),1);
  assert.match(await gospel.locator('p[lang="la"]').nth(2).innerText(),/ET VERBUM CARO FACTUM EST/);
  assert.match(await gospel.locator('[data-lang="fr"] h3').innerText(),/Verbe s’est fait chair/);
  assert.deepEqual(errors,[],width+"px script runtime exceptions");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=2,width+"px horizontal overflow: "+overflow);
  console.log("PASS P2 editorial HTML browser: "+width+"px; 84 text blocks, 3 optional customs, 11 held Propers, 5 opening conditions and conditional finales, bilingual toggle, exact speaking roles");
  await context.close();
 }
}finally{await browser.close()}
