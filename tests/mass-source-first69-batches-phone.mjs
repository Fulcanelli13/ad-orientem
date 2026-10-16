import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const b=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(b);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
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
   assert.equal(await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.openModule("learn.mass",{view:"moments"})),true);
   const area=page.locator("#ao-mass-formation-root");
   const batch=area.locator("[data-ao-source-batch-review]");
   await batch.waitFor({state:"visible",timeout:12000});
   assert.equal((await page.evaluate(()=>globalThis.AO_MASS_FORMATION_V1.status())).sourceBatches,37);
   await batch.locator("summary").first().tap();
   const works=batch.locator("[data-ao-source-work]");
   assert.equal(await works.count(),5);
   await works.first().locator("summary").first().tap();
   const loci=batch.locator("[data-ao-source-batch-locus]");
   assert.equal(await loci.count(),37);
   const first=works.first().locator("[data-ao-source-batch-locus]").first();
   const id=await first.getAttribute("data-ao-source-batch-locus");
   await first.locator("select").selectOption("PRIORITIZE_COLLATION");
   const status=await page.evaluate(()=>globalThis.AO_MASS_FORMATION_V1.status());
   assert.ok(status.evidenceTriageCount>=1);
   const downloadPromise=page.waitForEvent("download");
   await batch.locator("[data-ao-mf-evidence-export]").click();
   const download=await downloadPromise;
   const bytes=await readFile(await download.path(),"utf8");
   const results=JSON.parse(bytes);
   assert.equal(results.publicationApproved,false);
   assert.equal(results.approvedQuotations,0);
   assert.equal(results.records.length,status.evidenceTriageCount);
   assert.ok(results.records.every(r=>r.choice==="PRIORITIZE_COLLATION"));
   const choice=await first.locator("select").inputValue();
   assert.equal(choice,"PRIORITIZE_COLLATION");
   const safeWidth=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(safeWidth<=2,"batch review overflow "+safeWidth+" at "+width);
   assert.deepEqual(errors.filter(e=>/SyntaxError|ReferenceError|TypeError/.test(e)),[]);
   console.log("PASS "+width+"px 69-source grouped review: "+id+" selected and decisions exported, no source text published");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(done=>server.close(done))}
