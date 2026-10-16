import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
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
 const screenshotFolder=resolve(root,"test-output/biblical-atlas-151");
 async function captureView(name){
   await mkdir(screenshotFolder,{recursive:true});
   for(const size of [320,390,768,1280]){
     await page.setViewportSize({width:size,height:844});
     await page.waitForTimeout(120);
     const geometry=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,rootWidth:document.querySelector("#ao-find-modular-root")?.getBoundingClientRect().width}));
     assert.ok(geometry.documentWidth<=geometry.width+1,name+" page overflow at "+size+"px: "+JSON.stringify(geometry));
     if(name==="cinematic-incarnation"||name==="genesis-branch-tree"){
       const visibility=await page.evaluate(()=>{
         const selectors=[".aoBibleStudyTabs [aria-pressed=true]",".aoBibleReviewTabs [aria-pressed=true]"];
         return selectors.map(selector=>document.querySelector("#ao-find-modular-root "+selector)).filter(Boolean).map(button=>{
           const outer=button.parentElement.getBoundingClientRect(),inner=button.getBoundingClientRect();
           return {label:button.textContent,visible:inner.left>=outer.left-2&&inner.right<=outer.right+2};
         });
       });
       assert.ok(visibility.length>=1&&visibility.every(x=>x.visible),name+" active tab not visible at "+size+": "+JSON.stringify(visibility));
       if(name==="cinematic-incarnation"&&size<=390){
         const chapterPicker=page.locator("#ao-find-modular-root [data-bible-study-chapter-select]");
         assert.equal(await chapterPicker.isVisible(),true,"selected chapter must be visible on a phone");
         assert.equal(await chapterPicker.inputValue(),"INCARNATION");
       }
     }
     await page.screenshot({path:resolve(screenshotFolder,name+"-"+size+".png"),fullPage:false,animations:"disabled"});
   }
   await page.setViewportSize({width:390,height:844});
 }

 page.on("pageerror",error=>errors.push(String(error?.message??error)));
 await page.goto("http://127.0.0.1:4275/index.html?atlasCinema=0",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForSelector('[data-ao-app-surface="find"]',{state:"visible",timeout:30000});
 await page.locator('[data-ao-app-surface="find"]').tap();
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:60000});
 await page.locator("#ao-find-modular-root details.aoHeritageMore > summary").tap({timeout:15000});
 await page.locator("#ao-find-modular-root .aoHeritageMore[open] [data-bible-atlas-open]").waitFor({state:"visible",timeout:15000});
 // Wait past the swipe guard's 280ms suppression window after the Browse reveal.
 await page.waitForTimeout(360);
 await page.locator("#ao-find-modular-root [data-bible-atlas-open]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===true&&
  document.querySelector("[data-ao-bible-atlas]"),null,{timeout:15000}).catch(async error=>{
  const detail=await page.evaluate(()=>({status:globalThis.AO_FIND_APP_V1?.status?.(),load:document.querySelector("#ao-find-modular-root")?.dataset?.aoFindLoadState,error:document.querySelector("[data-find-action-error]")?.textContent,scriptErrors:document.querySelector("[data-ao-bible-atlas]")?.outerHTML?.slice(0,200)}));
  console.error("ATLAS_ENTRY_DIAGNOSTIC",JSON.stringify(detail));
  throw error;
});
 const stops=page.locator("#ao-find-modular-root [data-bible-step]");
 assert.equal(await stops.count(),151,"all milestones are one continuous ribbon");
 const track=page.locator("#ao-find-modular-root [data-bible-track]");
 const width=await track.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
 assert.ok(width.scroll>width.client*3,"timeline is not horizontally scrollable");
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-map]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-era-overlay]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-unlocated=true]").count(),1,
  "Creation has no geographic pin and must not display a large map-loading panel");
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-unlocated-note]").isVisible(),true);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-detail] [data-ao-scripture-context]").count(),1,
  "Creation remains Scripture-readable without an invented GPS point");
 await captureView("canonical-chronology");
 // Tapping a remote milestone should move the selected event, geography, and ribbon.
 await page.locator('#ao-find-modular-root [data-bible-step="71"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===71,null,{timeout:15000});
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-unlocated=false]").count(),1,
  "Infancy source anchors must restore the normal geographic map");
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-step="71"]').getAttribute("aria-pressed"),"true");
 const nearby=await track.evaluate(el=>{const middle=el.getBoundingClientRect().left+el.clientWidth/2;const card=el.querySelector('[data-bible-step="71"]').getBoundingClientRect();return Math.abs(card.left+card.width/2-middle)});
 assert.ok(nearby<125,"selected milestone should remain close to timeline centre");
 await page.waitForTimeout(650);
 await captureView("sourced-infancy"); // Four widths: the qualified geographic map must actually display.
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
 assert.equal(await page.locator("#ao-find-modular-root [data-ao-bible-atlas]").count(),1);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflow<=1,"Biblical Atlas causes horizontal page overflow at 390px");
 // The release slice has no genealogy, apostolic research or theatre view.
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-review-surface]").count(),0);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-cinematic-review]").count(),0);
 assert.equal(await page.locator("#ao-find-modular-root [data-ao-bible-review]").count(),0);
 await page.locator("#ao-find-modular-root [data-bible-atlas-close]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===false,null,{timeout:15000});
 assert.equal(errors.length,0,"Uncaught runtime errors: "+errors.join(" | "));
 console.log("PASS protected 151-event Atlas 390px phone: Scripture roundtrip, 320/390/768/1280 captures, qualified pins, no research modules");
 await context.close();
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
