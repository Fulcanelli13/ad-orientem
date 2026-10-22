import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){if(!res.headersSent)res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4201,"127.0.0.1",resolve)});
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message||e)));
 const url="http://127.0.0.1:4201/previews/living-catena-messenger-editorial-integration-20261021.html";
 await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator(".aoCatenaMResearch").count(),0,
  "Normal Scripture reader must not show experimental editorial routes");
 await page.locator("[data-catena-source-question]").first().waitFor({state:"visible",timeout:15000});
 const sourceQuestion=page.locator("[data-catena-source-question]").first();
 assert.match(await sourceQuestion.getAttribute("data-catena-source-pointer"),/^catena\.matthew\./);
 const questionText=await sourceQuestion.innerText();
 const prior=await page.locator(".aoCatenaMUser").count();
 await sourceQuestion.click();
 assert.equal(await page.locator(".aoCatenaMUser").count(),prior+1);
 assert.ok((await page.locator(".aoCatenaMUser").last().innerText()).includes(questionText));
 assert.ok(await page.locator(".aoCatenaMMeta a[href^='https://www.ecatholic2000.com/']").count()>=1);
 assert.equal(await page.locator(".aoCatenaMResearchBadge").count(),0);
 for(const book of ["Mark","Luke","John"]){
  await page.goto(url+"?book="+book+"&passage=1:1",{waitUntil:"domcontentloaded",timeout:60000});
  await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
  assert.match(await page.locator(".aoCatenaMHead").innerText(),new RegExp(book+" 1:1"));
  assert.equal(await page.locator(".aoCatenaMResearch").count(),0);
  await page.locator("[data-catena-source-question]").first().waitFor({state:"visible",timeout:15000});
  const readerQuestion=page.locator("[data-catena-source-question]").first();
  await readerQuestion.click();
  assert.equal(await page.locator(".aoCatenaMUser").count(),1,
   "A source-attested question must work in the normal "+book+" Scripture Messenger");
  assert.ok(await page.locator(".aoCatenaMMeta a[href^='https://www.ecatholic2000.com/']").count()>0);
 }
 await page.goto(url+"?research=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
 const panel=page.locator(".aoCatenaMResearch");
 assert.equal(await panel.isHidden(),true,"Research question panel must be opt-in");
 await page.getByRole("button",{name:"Browse research questions"}).click();
 await page.locator('[data-catena-research-question="b3-10"]').waitFor({state:"visible",timeout:20000});
 assert.match(await panel.innerText(),/all unapproved/i);
 await page.locator('[data-catena-research-question="b3-10"]').click();
 await page.locator(".aoCatenaMResearchBadge").first().waitFor({state:"visible",timeout:30000});
 assert.match(await page.locator(".aoCatenaMResearchBadge").first().innerText(),/NOT A VERIFIED ANSWER/);
 const feed=await page.locator(".aoCatenaMFeed").innerText();
 assert.ok(feed.includes("Cyprian")&&feed.includes("Augustine"),
  "A comparison must keep the separate inherited author attributions");
 assert.ok(await page.locator(".aoCatenaMMeta a[href^='https://www.ecatholic2000.com/']").count()>=2);
 const overflow=await page.locator(".aoCatenaMessenger").evaluate(e=>e.scrollWidth-e.clientWidth);
 assert.ok(overflow<=2,"Messenger phone panel overflows horizontally by "+overflow);
 await page.goto(url+"?passage=11:28&research=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
 await page.getByRole("button",{name:"Browse research questions"}).click();
 await page.locator('[data-catena-research-question="catena.matthew.11.28:1"]').waitFor({state:"visible",timeout:20000});
 await page.locator('[data-catena-research-question="catena.matthew.11.28:1"]').click();
 await page.locator(".aoCatenaMFeed .aoCatenaMNotice").last().waitFor({state:"visible",timeout:25000});
 assert.match(await page.locator(".aoCatenaMFeed").innerText(),/not a standalone answer/i);
 assert.match(await page.locator(".aoCatenaMFeed").innerText(),/HUMAN APPROVAL PENDING/);
 await page.goto(url+"?passage=27:45&research=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator('[data-catena-fragment-id="catena.matthew.27.45:1"]').waitFor({state:"visible",timeout:20000});
 const split=page.locator('[data-catena-fragment-id="catena.matthew.27.45:1"]');
 assert.equal(await split.locator(".aoCatenaMResearchOwner").count(),2);
 assert.match(await split.innerText(),/Pseudo-Dionysius/);
 assert.match(await split.innerText(),/Origen/);
 assert.equal(await split.locator(".aoCatenaMName").first().innerText(),"MULTIPLE PRINTED ATTRIBUTIONS");
 // Editor-facing workbench: the 22/8 review queue remains outside the public app.
 const editorUrl="http://127.0.0.1:4201/previews/living-catena-editorial-workbench-20261021.html";
 await page.goto(editorUrl,{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator("#candidateList .candidate").first().waitFor({state:"visible",timeout:16000}).catch(async error=>{
  const workspace=await page.locator("#workspace").innerText().catch(()=>"<missing>");
  const counts=await page.locator("#countText").innerText().catch(()=>"<missing>");
  const responses=await page.locator("body").innerText().catch(()=>"<missing>");
  throw Error("Workbench startup failed: "+String(error)+"; count="+counts+
    "; workspace="+workspace+"; errors="+JSON.stringify(errors)+"; page="+responses.slice(0,1000));
 });
 assert.equal(await page.locator("#candidateList .candidate").count(),9);
 await page.locator('[data-focused-source="english-parallel-checked"]').waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator('[data-focused-source="english-parallel-checked"]').count(),1);
 assert.match(await page.locator('[data-focused-source="english-parallel-checked"]').innerText(),/FOCUSED EDITORIAL CHECK/);
 await page.locator('[data-filter="ready"]').click();
 assert.equal(await page.locator("#candidateList .candidate").count(),22);
 await page.locator(".source .body").first().waitFor({state:"visible",timeout:20000});
 assert.ok((await page.locator(".source .body").first().innerText()).length>50);
 assert.equal(await page.locator('[data-original-work-evidence="translated-parallel-found"]').count(),1);
 assert.match(await page.locator('[data-original-work-evidence="translated-parallel-found"]').innerText(),
  /english translation/i);
 assert.match(await page.locator('[data-original-work-evidence="translated-parallel-found"] a').getAttribute("href"),
  /^https:\/\/www\.newadvent\.org\/fathers\//);
 assert.equal(await page.locator('#reviewForm input[type="checkbox"]:checked').count(),0,
  "External translated work links must not pre-certify any source attestation");
 await page.locator('[data-filter="escalated"]').click();
 assert.equal(await page.locator("#candidateList .candidate").count(),8);
 await page.locator('[data-original-work-evidence="not-located"]').waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator('[data-original-work-evidence="not-located"]').count(),1,
  "At least one escalated source must display missing original-work status");
 assert.equal(await page.locator("#review-disposition option[value='approve']").count(),0,
  "An escalated source cannot receive an approval proposal");
 await page.locator('[data-filter="ready"]').click();
 await page.locator(".source .body").first().waitFor({state:"visible",timeout:25000});
 assert.equal(await page.locator("#candidateList .candidate").count(),22);
 await page.locator("#review-reviewer").fill("Source editor");
 await page.locator("#review-editorialReason").fill("The original source still requires contextual verification by an independent editor.");
 await page.locator("#review-disposition").selectOption("hold");
 await page.locator('#reviewForm button[type="submit"]').click();
 assert.match(await page.locator("#decisionStatus").innerText(),/stored locally/i);
 const sourceDraft=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-catena-matthew-human-review-local-draft-v1")));
 assert.ok(Object.values(sourceDraft.decisions).some(x=>x.disposition==="hold"));
 const downloadPromise=page.waitForEvent("download");
 await page.locator("#download").click();
 const download=await downloadPromise;
 assert.equal(download.suggestedFilename(),"catena-matthew-editorial-review-export.json");
 assert.deepEqual(errors,[],"Messenger and editorial workbench browser runtime errors");
 console.log("PASS: opt-in research question Messenger phone flow, source labels, author boundary and no overflow");
}finally{
 await browser?.close?.();
 await new Promise(resolve=>server.close(resolve));
}
