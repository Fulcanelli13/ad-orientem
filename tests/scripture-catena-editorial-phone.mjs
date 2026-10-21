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
 await page.goto(url+"?passage=11:28",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
 await page.getByRole("button",{name:"Browse research questions"}).click();
 await page.locator('[data-catena-research-question="catena.matthew.11.28:1"]').waitFor({state:"visible",timeout:20000});
 await page.locator('[data-catena-research-question="catena.matthew.11.28:1"]').click();
 await page.locator(".aoCatenaMFeed .aoCatenaMNotice").last().waitFor({state:"visible",timeout:25000});
 assert.match(await page.locator(".aoCatenaMFeed").innerText(),/not a standalone answer/i);
 assert.match(await page.locator(".aoCatenaMFeed").innerText(),/HUMAN APPROVAL PENDING/);
 await page.goto(url+"?passage=27:45",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator('[data-catena-fragment-id="catena.matthew.27.45:1"]').waitFor({state:"visible",timeout:20000});
 const split=page.locator('[data-catena-fragment-id="catena.matthew.27.45:1"]');
 assert.equal(await split.locator(".aoCatenaMResearchOwner").count(),2);
 assert.match(await split.innerText(),/Pseudo-Dionysius/);
 assert.match(await split.innerText(),/Origen/);
 assert.equal(await split.locator(".aoCatenaMName").first().innerText(),"MULTIPLE PRINTED ATTRIBUTIONS");
 assert.deepEqual(errors,[],"Messenger integration browser runtime errors");
 console.log("PASS: opt-in research question Messenger phone flow, source labels, author boundary and no overflow");
}finally{
 await browser?.close?.();
 await new Promise(resolve=>server.close(resolve));
}
