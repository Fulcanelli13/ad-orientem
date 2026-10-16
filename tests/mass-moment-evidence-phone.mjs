import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const dir=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(dir,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==dir&&!file.startsWith(dir+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block",acceptDownloads:true});
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message??e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?massEvidenceReview=1",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"))).ok,true);
   assert.equal(await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.openModule("learn.mass",{momentKey:"AO.CARD.014"})),true);
   const root=page.locator("#ao-mass-formation-root");
   const panel=root.locator('[data-ao-mf-evidence-review="AO.CARD.014"]');
   await panel.waitFor({state:"visible",timeout:15000});
   assert.equal((await page.evaluate(()=>globalThis.AO_MASS_FORMATION_V1?.status?.())).evidenceReview,true);
   await panel.locator("summary").first().tap();
   assert.equal(await panel.locator("[data-ao-mf-evidence-claim]").count(),51);
   assert.equal(await root.locator(".aoReferencePanel").count(),0,
    "Candidate metadata must not appear as certified Sources drawer");
   const claim=panel.locator("[data-ao-mf-evidence-claim]").first();
   await claim.locator("select").selectOption("PRIORITIZE_COLLATION");
   assert.equal((await page.evaluate(()=>globalThis.AO_MASS_FORMATION_V1?.status?.())).evidenceTriageCount,1);
   const [download]=await Promise.all([page.waitForEvent("download"),panel.locator("[data-ao-mf-evidence-export]").click()]);
   assert.equal(download.suggestedFilename(),"Ad_Orientem_Mass_Source_Triage_2026-10-16.json");
   const path=await download.path();assert.ok(path);
   const bytes=await readFile(path,"utf8");
   const exported=JSON.parse(bytes);
   assert.equal(exported.publicationApproved,false);
   assert.equal(exported.approvedQuotations,0);
   assert.equal(exported.records.length,1);
   assert.equal(exported.records[0].choice,"PRIORITIZE_COLLATION");
   const id=exported.records[0].claimId;
   await root.locator("[data-ao-mf-moments-list]").tap();
   await root.locator('[data-ao-mf-moment="AO.CARD.014"]').tap();
   const reopened=root.locator('[data-ao-mf-evidence-review="AO.CARD.014"]');
   await reopened.locator("summary").first().tap();
   assert.equal(await reopened.locator('[data-ao-mf-evidence-claim="'+id+'"] select').inputValue(),"PRIORITIZE_COLLATION");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=2,"Source triage horizontal overflow: "+overflow+" at "+width);
   assert.deepEqual(errors.filter(e=>/TypeError|SyntaxError|ReferenceError/.test(e)),[]);
   console.log("PASS "+width+"px gated Mass evidence research: 51 Canon candidate locators, triage persistence, JSON export, no public citation");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(resolveClose=>server.close(resolveClose));}
