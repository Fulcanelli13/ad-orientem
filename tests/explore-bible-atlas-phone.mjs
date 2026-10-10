import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4275,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",error=>errors.push(String(error?.message??error)));
 await page.goto("http://127.0.0.1:4275/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForSelector('[data-ao-app-surface="find"]',{state:"visible",timeout:30000});
 await page.locator('[data-ao-app-surface="find"]').tap();
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:60000});
 await page.locator("#ao-find-modular-root .aoHeritageMore summary").tap({timeout:15000});
 await page.locator("#ao-find-modular-root [data-bible-atlas-open]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===true&&
  document.querySelector("[data-bible-atlas]"),null,{timeout:15000});
 const stops=page.locator("#ao-find-modular-root [data-bible-step]");
 assert.equal(await stops.count(),151,"all milestones are one continuous ribbon");
 const track=page.locator("#ao-find-modular-root [data-bible-track]");
 const width=await track.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
 assert.ok(width.scroll>width.client*3,"timeline is not horizontally scrollable");
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-map]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-era-overlay]").count(),1);
 // Tapping a remote milestone should move the selected event, geography, and ribbon.
 await page.locator('#ao-find-modular-root [data-bible-step="71"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===71,null,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-step="71"]').getAttribute("aria-pressed"),"true");
 const nearby=await track.evaluate(el=>{const middle=el.getBoundingClientRect().left+el.clientWidth/2;const card=el.querySelector('[data-bible-step="71"]').getBoundingClientRect();return Math.abs(card.left+card.width/2-middle)});
 assert.ok(nearby<125,"selected milestone should remain close to timeline centre");
 await page.locator('#ao-find-modular-root [data-bible-step="150"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===150,null,{timeout:15000});
 const last=await page.locator("#ao-find-modular-root [data-bible-detail]").innerText();
 assert.match(last,/new Jerusalem|Jérusalem nouvelle/i);
 assert.ok(await page.locator('#ao-find-modular-root [data-bible-step="150"]').getAttribute("aria-pressed")==="true");
 // Non-geographic apocalyptic visions remain on the timeline, with no fabricated pin.
 assert.match(last,/No earthly location|Aucun lieu terrestre/);
 // Native Scripture opens from an atlas milestone and leaves the atlas ready on return.
 await page.locator('#ao-find-modular-root [data-bible-step="3"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===3,null,{timeout:15000});
 await page.locator("#ao-find-modular-root [data-bible-detail] [data-ao-scripture-context]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===true,null,{timeout:15000});
 await page.locator('#ao-scripture-overlay [data-scripture-close]').first().tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===false,null,{timeout:15000});
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-atlas]").count(),1);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflow<=1,"Biblical Atlas causes horizontal page overflow at 390px");
 await page.locator("#ao-find-modular-root [data-bible-atlas-close]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===false&&
  document.querySelector('[data-find-view="map"][data-explore-lens="heritage"]'),null,{timeout:15000});
 assert.equal(errors.length,0,"Uncaught runtime errors: "+errors.join(" | "));
 console.log("PASS Biblical Atlas 390px phone: continuous scroll, milestone-to-event, no invented vision pin, Scripture roundtrip and Explore return");
 await context.close();
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
