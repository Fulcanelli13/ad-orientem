import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";
import {canonStudyDigest,reconcileCanonReviewDecisions} from "../scripts/mass-explorer-canon-decision-core.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const path=resolve(root,"previews/mass-canon-eight-review-20261017.html");
const html=readFileSync(path,"utf8");
const embedded=html.match(/<script type="application\/json" id="canon-payload">([\s\S]*?)<\/script>/);
assert.ok(embedded,"Standalone preview must contain its eight review studies");
const doc=JSON.parse(embedded[1]);
const fromFile=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const candidates=[
 ...fromFile("data/learn/research/mass-explorer-first-two-release-candidates-20261016.v1.json").studies,
 ...fromFile("data/learn/research/mass-explorer-remaining-six-release-candidates-20261016.v1.json").studies
].sort((a,b)=>a.id.localeCompare(b.id));
const manifest=fromFile("data/learn/mass-explorer-approved-studies.v1.json");
const formation=fromFile("data/learn/mass-formation-campion.v1.json");
assert.equal(manifest.status,"NO_APPROVED_STUDIES");
assert.equal(manifest.entries.length,0);
assert.equal(doc.status,"EDITORIAL_PREVIEW_ONLY_UNPUBLISHED");
assert.deepEqual(doc.studies,candidates,"Preview must represent exact current branch draft, not stale copy");
assert.equal(doc.studies.reduce((n,s)=>n+s.sections.length,0),34);
assert.deepEqual(Object.keys(doc.blocks).sort(),
 Array.from({length:15},(_,i)=>"AO.SM.B"+String(i+47).padStart(3,"0")));
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:880},acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(pathToFileURL(path).href,{waitUntil:"load"});
  await page.locator(".study-button").first().waitFor();
  assert.equal(await page.locator(".study-button").count(),8);
  assert.equal(await page.locator(".chapter").count(),4);
  await page.locator('.study-button[data-index="1"]').click();
  assert.equal(await page.locator(".chapter").count(),5);
  await page.locator('[data-language="both"]').click();
  assert.equal(await page.locator(".chapter p.second").count(),5);
  assert.ok((await page.locator(".source .cue").count())>=1);
  await page.locator('[data-language="fr"]').click();
  assert.match(await page.locator("h1.title").textContent(),/Quam oblationem/i);
  assert.equal(await page.locator('.top [data-language="fr"]').getAttribute("aria-pressed"),"true");
  const dimensions=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   count:document.querySelectorAll('.study-button').length
  }));
  assert.ok(dimensions.overflow<=1,"Horizontal page overflow at "+width+"px: "+dimensions.overflow);
  assert.deepEqual(errors,[],"Browser errors at "+width+"px");
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:860},acceptDownloads:true});
 const page=await context.newPage();
 await page.goto(pathToFileURL(path).href);
 await page.locator(".study-button").first().waitFor();
 await page.locator('[data-decision="revise"]').click();
 await page.locator("#note").fill("Review: tighten biblical source attribution.");
 await page.locator("#reviewer").fill("Editorial Reviewer");
 const downloadEvent=page.waitForEvent("download");
 await page.locator("[data-export]").click();
 const download=await downloadEvent;
 const exportPath=await download.path();
 const exportData=JSON.parse(readFileSync(exportPath,"utf8"));
 assert.equal(exportData.decisions.length,8);
 assert.equal(exportData.reviewer,"Editorial Reviewer");
 assert.equal(exportData.decisions[0].decision,"revise");
 assert.equal(exportData.decisions[0].note,"Review: tighten biblical source attribution.");
 for(const s of candidates){
  const row=exportData.decisions.find(x=>x.study_id===s.id);
  assert.deepEqual(row.block_ids,s.block_ids);
  assert.equal(row.content_sha256,canonStudyDigest(s),"SHA-256 must match existing Node importer");
 }
 const proposed=reconcileCanonReviewDecisions({decisions:exportData,candidates,formation,publicManifest:manifest});
 assert.equal(proposed.public_release_permitted,false);
 assert.equal(proposed.totals.public_studies,0);
 assert.equal(proposed.totals.needs_revision,1);
 assert.equal(proposed.totals.unreviewed,7);
 await page.reload();
 assert.equal(await page.locator('[data-decision="revise"]').getAttribute("aria-pressed"),"true");
 const fileChooser=page.locator("#import-input");
 await fileChooser.setInputFiles({name:"review-decisions.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(exportData))});
 await page.locator("#status").waitFor();
 assert.match(await page.locator("#status").textContent(),/successfully restored/i);
 const tampered=JSON.parse(JSON.stringify(exportData));
 tampered.decisions[0].content_sha256="0".repeat(64);
 await fileChooser.setInputFiles({name:"tampered-review.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(tampered))});
 assert.match(await page.locator("#status").textContent(),/Import refused: Stale or invalid/i);
 await context.close();
 console.log("PASS direct standalone Roman Canon review at 320/390/768/1280px: 8 exact drafts, 15 canonical blocks, 34 bilingual sections, valid Node-importable SHA-locked decisions, zero published studies, tamper rejection.");
}finally{await browser.close()}
