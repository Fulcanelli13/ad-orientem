import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});
  res.end(data);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",err=>errors.push(err.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForSelector(".homeScreen.aoTodayH4",{state:"visible",timeout:50000});
 await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&
  globalThis.AO_R17_BROWSER_ENTRY?.installed&&
  globalThis.AO_CELEBRATION_API?.openChangeMass),null,{timeout:50000});
 const home=page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]");
 await home.click();
 const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
 await door.waitFor({state:"visible",timeout:15000});
 assert.equal(await door.locator('[data-home-h7-mass-kind="VOTIVE"]').count(),1);
 await door.locator('[data-home-h7-mass-kind="VOTIVE"]').click();
 await page.waitForFunction(()=>{
  const arch=globalThis.AO_CELEBRATION_ARCH_V1;
  return String(arch?.stage??"").toLowerCase()==="votive"&&
   Boolean(document.querySelector('[data-ao-mass-catalogue] [data-ao-mass-catalogue-choice]'));
 },null,{timeout:25000});
 const cards=page.locator('[data-ao-mass-catalogue] [data-ao-mass-catalogue-choice]');
 const ids=await cards.evaluateAll(nodes=>nodes.map(x=>x.dataset.aoMassCatalogueChoice));
 assert.ok(ids.length>=2,"Votive catalogue failed to expose a real choice");
 assert.equal(new Set(ids).size,ids.length,"Votive catalogue must not duplicate host-owned choices");
 const host=await page.locator("#ao-mass-flow-v1 .aoMassFlowBody [data-ao-celebration]").evaluateAll(
  nodes=>nodes.map(x=>x.getAttribute("data-ao-celebration")));
 for(const id of ids)assert.ok(host.includes(id),"Visible votive selection has no host-owned source button: "+id);
 assert.ok(await cards.first().isVisible(),"Actual votive choices must be visible, not only present in DOM");
 assert.equal(errors.length,0,"Browser error while opening exact votive catalogue: "+JSON.stringify(errors));
 await page.close();
 console.log("PASS: real 390px Home H7 → Votive → source-owned detailed Mass catalogue");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}
