import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{const f=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(f!==root&&!f.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(f);res.writeHead(200,{"content-type":mime[extname(f)]??"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4422,"127.0.0.1",yes);});
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:4422/index.html?aoTodayH4=1",{waitUntil:"domcontentloaded",timeout:90000});
   const deck=page.locator(".homeScreen.aoH7Screens [data-home-c3-prayer-deck]");
   await deck.waitFor({state:"visible",timeout:45000});
   const pager=deck.locator("[data-home-c3-prayer-step]");
   assert.equal(await pager.count(),4);
   const slides=deck.locator("[data-home-c3-slide]");
   assert.equal(await slides.count(),4);
   await pager.nth(2).click();
   const current=await slides.evaluateAll(arr=>arr.map(x=>({hidden:x.hidden,attr:x.getAttribute("aria-hidden")})));
   assert.deepEqual(current.map(x=>x.hidden),[true,true,false,true],"Pager must show selected slide only");
   assert.equal(current[2].attr,"false");
   assert.deepEqual(errors,[],"Home pager caused JS exception");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,"Home pager overflow at "+width);
   console.log("PASS C3 delegated Prayer pager real Home at",width,"px");
  }finally{await ctx.close();}
 }
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
