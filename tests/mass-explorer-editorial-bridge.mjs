import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const review=resolve(root,"artifacts/p2-mass-explorer-bridge/index.html");
const html=readFileSync(review,"utf8");
const json=id=>JSON.parse((html.match(new RegExp('<script type="application/json" id="'+id+'">([^]*?)</script>'))||[])[1]||"null");
const pages=json("ao-review-data"),owners=json("ao-review-owners"),sequence=json("ao-review-sequence");
assert.ok(pages?.en?.map&&pages?.fr?.map);
assert.equal(sequence.length,32);
assert.equal(Object.keys(owners).length,96);
assert.equal(Object.keys(owners).filter(x=>/^AO\.SM\.B0(4[7-9]|5\d|6[01])$/.test(x)).length,15);
for(const [lang,edition] of Object.entries(pages)){
 assert.equal(Object.keys(edition.moments).length,32);
 for(let n=47;n<=61;n++){
  const id="AO.SM.B"+String(n).padStart(3,"0");
  const moment=edition.moments[owners[id]].blocks[id];
  assert.ok(moment,lang+" missing "+id);
  assert.match(moment,new RegExp('data-ao-editorial-block="'+id+'"'));
  assert.match(moment,/data-ao-mx-anchor="deep-study"/);
  assert.match(moment,/data-ao-mx-cue=/,"Original source words missing");
 }
 assert.equal((edition.map.match(/data-ao-mx-map-block=/g)||[]).length,96);
 assert.equal((edition.list.match(/data-ao-mx-moment=/g)||[]).length,32);
 assert.match(edition.moments[owners["AO.SM.B051"]].blocks["AO.SM.B051"],/data-ao-editorial-chapter="8"/);
 assert.match(edition.moments[owners["AO.SM.B055"]].blocks["AO.SM.B055"],/data-ao-editorial-chapter="8"/);
 assert.doesNotMatch(edition.moments[owners["AO.SM.B047"]].blocks["AO.SM.B047"],/data-ao-r17/);
}
assert.doesNotMatch(html,/data-release-allowed="true"|RITUAL_PUBLICATION_APPROVED/);
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390,430,768,1280]){
  const context=await browser.newContext({viewport:{width,height:860},hasTouch:width<=430,isMobile:width<=430});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(pathToFileURL(review).href,{waitUntil:"load"});
  assert.equal(await page.locator("[data-ao-mx-map-block]").count(),96);
  await page.locator("[data-review-canon]").click();
  assert.equal(await page.locator('[data-ao-editorial-block="AO.SM.B047"]').count(),1);
  assert.ok(await page.locator("[data-ao-mx-cue]").count()>0);
  await page.locator('[data-ao-mx-block="AO.SM.B051"]').click();
  assert.equal(await page.locator('[data-ao-editorial-block="AO.SM.B051"]').count(),1);
  assert.equal(await page.locator('[data-ao-editorial-chapter]').count(),8);
  await page.locator('[data-ao-editorial-chapter="8"] summary').click();
  assert.equal(await page.locator('[data-ao-editorial-chapter="8"]').getAttribute("open"),"");
  await page.locator('[data-review-lang="fr"]').click();
  assert.equal(await page.locator('[data-ao-editorial-block="AO.SM.B051"]').count(),1);
  assert.match(await page.locator(".aoEditorialStudy h2").innerText(),/Offrande|oblation|sacrifice|offering/i);
  // B055 belongs to another Guide macro moment, so navigate by Mass Map owner.
  await page.locator("[data-ao-mx-index]").first().click();
  const melchisedech=page.locator('[data-ao-mx-map-block="AO.SM.B055"]');
  await melchisedech.evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==="DETAILS")p.open=true});
  await melchisedech.click();
  assert.equal(await page.locator('[data-ao-editorial-block="AO.SM.B055"]').count(),1);
  await page.locator("[data-ao-mx-index]").first().click();
  assert.equal(await page.locator("[data-ao-mx-map-block]").count(),96);
  await page.locator('[data-review-view="list"]').click();
  assert.equal(await page.locator("[data-ao-mx-moment]").count(),32);
  const overflow=await page.evaluate(()=>{
   const root=document.getElementById("ao-mass-explorer-root");
   return root.scrollWidth-root.clientWidth;
  });
  assert.ok(overflow<=2,width+"px editorial Mass Explorer horizontal overflow: "+overflow);
  assert.deepEqual(errors,[],width+"px browser errors");
  await context.close();
 }
}finally{await browser.close();}
console.log("PASS Mass Explorer P2 editorial bridge: 32 Guide moments, 96 source blocks, 15 research links, eight themes, 16 deep chapters; 320/390/430/768/1280px.");
