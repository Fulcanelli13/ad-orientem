import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".svg":"image/svg+xml",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json"};
const requests=[];
const server=http.createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const path=resolve(root,"."+p);
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
    requests.push(p);
    const buffer=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store","access-control-allow-origin":"*"});res.end(buffer);
  }catch(e){res.writeHead(404);res.end(String(e?.message))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4189,"127.0.0.1",yes)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:460,height:200},deviceScaleFactor:1});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:4189/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  const symbols=["ao-refined-study","ao-refined-journal","ao-refined-church"];
  for(const name of symbols)assert.equal(await page.locator('[id="'+name+'"]').count(),1,name+" did not retain local symbol ID");
  await page.evaluate((symbols)=>{
    const host=document.createElement("div");
    host.id="svg-proxy-parity-qa";
    host.style.cssText="position:fixed;z-index:2147483647;left:0;top:0;display:flex;gap:8px;padding:8px;background:#fff";
    for(const name of [...symbols,"blank"]){
      const el=document.createElementNS("http://www.w3.org/2000/svg","svg");
      el.setAttribute("viewBox","0 0 128 128");
      el.setAttribute("width","128");
      el.setAttribute("height","128");
      el.setAttribute("data-probe",name);
      el.style.color="#13283c";
      if(name!=="blank"){
        const use=document.createElementNS("http://www.w3.org/2000/svg","use");
        use.setAttribute("href","#"+name);el.append(use);
      }
      host.append(el);
    }
    document.body.append(host);
  },symbols);
  await page.waitForTimeout(1500);
  const blank=await page.locator('[data-probe="blank"]').screenshot();
  for(const name of symbols){
    const shot=await page.locator('[data-probe="'+name+'"]').screenshot();
    assert.notDeepEqual(shot,blank,name+" external SVG proxy rendered blank");
  }
  assert.ok(requests.some(x=>x.includes("assets/generated-sprites/")),"No separate SVG assets requested");
  assert.deepEqual(errors.filter(x=>/SVG|sprite|symbol|Failed to fetch/i.test(x)),[],"SVG paint errors");
  console.log("PASS external SVG symbol paint: 3 groups rendered through legacy local IDs and separate SVG resources");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
