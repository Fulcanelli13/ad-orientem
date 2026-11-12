import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".jpg":"image/jpeg",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname),file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const content=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(content);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoPrayerPilot=1",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:40000});
  await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
  await page.waitForFunction(()=>typeof globalThis.AO_NOVENAS_V3?.open==="function",null,{timeout:40000});
  assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.open({novenaId:"holy_ghost",returnContext:null})),true);
  const sel="#aoPray435930.open .aoN1DetailFolio",rose=page.locator(sel+" [data-n1-rose-window]");
  assert.equal(await rose.count(),1);
  assert.equal(await rose.locator("[data-n1-rose-day]").count(),9);
  assert.equal(await page.locator(sel+" [data-n1-day]").count(),9);
  const before=Number(await rose.getAttribute("data-n1-rose-selected")),target=before===3?4:3;
  await rose.locator('[data-n1-rose-day="'+target+'"]').click();
  assert.equal(await rose.getAttribute("data-n1-rose-selected"),String(target));
  assert.equal(await page.locator(sel+" [data-n1-begin]").getAttribute("data-n1-begin"),String(target));
  assert.equal(await page.locator("#aoPray435930.open .aoN1Reader").count(),0);
  await rose.locator('[data-n1-rose-day="'+target+'"]').click();
  assert.equal(await page.locator("#aoPray435930.open .aoN1Reader").count(),1);
  const x=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(x<=1,"Rose window overflow at "+width+": "+x);
  assert.deepEqual(errors,[],"Phone errors at "+width);
  await page.close();
 }
 console.log("PASS: Holy Ghost rose first/second tap on 320/390px");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
