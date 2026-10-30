import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-chaplet-f07");await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoChapletF07Pilot=1",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null})),true);
   const base="#aoPray435930.open ";
   const crown=page.locator(base+"[data-ao-f07-crown]");
   assert.equal(await crown.count(),1,"Opt-in F07 crown must be present in the actual Divine Mercy reader");
   assert.equal(await crown.locator(".aoF07Bead").count(),55);
   assert.equal(await crown.getAttribute("data-total"),"62","The canonical five decades have 62 events by default");
   assert.equal(await page.locator(base+"[data-ao-mercy-bead-navigation]").count(),1,"The existing bead/decade navigator remains the owner");
   assert.ok((await page.locator(base+".aoMercyLine.aoMercyPrayer").innerText()).length>15,"Full source prayer remains visible");
   const firstPrayer=await page.locator(base+".aoMercyLine.aoMercyPrayer").evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {top:r.top,pixels:Math.max(0,Math.min(r.bottom,innerHeight-70)-Math.max(0,r.top)),height:innerHeight};
   });
   assert.ok(firstPrayer.pixels>=28,
    "F07 first canonical prayer must show at least one readable line above the app dock at "+width+"px: "+JSON.stringify(firstPrayer));
   await page.screenshot({path:resolve(output,"mercy-crown-opening-"+width+".png"),animations:"disabled"});
   const large=page.locator(base+'[data-p435930-mercy-chapter="4"]');
   await large.click();
   assert.equal(await crown.getAttribute("data-position"),"4");
   const pilot=page.locator(base+'.aoMercyReader[data-ao-f07-chaplet="crown-v1"]');
   assert.equal(await pilot.locator('.aoMercyStrand .aoMercyBeadButton').count(),11,
    "The original large bead and ten smaller beads must remain directly selectable");
   assert.equal(await pilot.locator('.aoF07MercyChapterChips button').count(),7,
    "Opening, five decades and Closing are one compact chapter rail");
   assert.equal(await pilot.locator('.aoF07MercyDock').count(),1,
    "Reviewed F07 m2 has one compact Previous / position / Next dock");
   assert.equal(await pilot.locator('[data-p435930-mercy-next]').count(),1);
   assert.equal(await pilot.locator('[data-p435930-mercy-prev]').count(),1);
   assert.equal(await pilot.locator('.aoF07MercyRubric').innerText(),'Pray once on the large bead.');
   assert.equal(await pilot.locator('.aoF07MercyRoleLabel').count(),2);
   assert.equal(await pilot.locator('.aoMercyLine.aoMercyPrayer .aoF07MercyRole').count(),2,
    "Both source-owned parts must display ℣ / ℟ on large bead");
   assert.match(await pilot.locator('.aoMercyLine.aoMercyPrayer .aoF07MercyRole-Response').innerText(),/ALL/);
   const aa=page.locator(base+'.aoP435930Head > .aoPrayerBookMenu');
   assert.equal(await aa.count(),1,"Mercy must have one discreet Aa menu");
   assert.equal(await pilot.locator('.aoMercyOptional').count(),0,
    "Optional devotions and settings must not interrupt the prayer body");
   await aa.locator(':scope > summary').click();
   assert.equal(await aa.locator('[data-p435930-mercy-recite="group"]').count(),1);
   await aa.locator('[data-p435930-mercy-recite="group"]').click();
   assert.equal(await pilot.locator('.aoMercyLine.aoMercyPrayer .aoF07MercyRoles').getAttribute('data-f07-group'),'with-others');
   const responseWeight=await pilot.locator('.aoMercyLine.aoMercyPrayer .aoF07MercyRole-Response p').evaluate(el=>Number.parseInt(getComputedStyle(el).fontWeight));
   assert.ok(responseWeight>=600,'With others must make ALL response typographically prominent');
   await pilot.locator('[data-p435930-mercy-next]').click();
   assert.equal(await crown.getAttribute('data-position'),'5',"Next must advance exactly one canonical event");
   assert.match(await pilot.locator('.aoF07MercyRubric').innerText(),/ten small beads/);
   await pilot.locator('[data-p435930-mercy-prev]').click();
   assert.equal(await crown.getAttribute('data-position'),'4',"Previous must restore the large bead");
   await pilot.locator('.aoMercyStrand [data-p435930-mercy-jump="5"]').click();
   assert.equal(await crown.getAttribute('data-position'),'5');
   await pilot.locator('.aoMercyStrand [data-p435930-mercy-jump="4"]').click();
   assert.equal(await crown.getAttribute('data-position'),'4');
   assert.equal(await crown.locator(".aoF07Bead-active").count(),1);
   assert.match(await crown.locator(".aoF07CrownText").innerText(),/Decade|Dizaine/);
   // Scroll to the *next source paragraph*, rather than adding an
   // arbitrary 200px which may still lie inside the long first offering.
   const scrollResult=await page.locator(base+".aoDevoCardScroll").evaluate(el=>{
     const second=el.querySelector('[data-ao-mercy-step="5"]');
     if(!second)throw new Error("Missing canonical second decade prayer");
     el.scrollTop=Math.max(0,second.offsetTop-el.offsetTop-el.clientHeight*.35);
     return {top:el.scrollTop,max:el.scrollHeight-el.clientHeight,
       second:second.offsetTop,visible:el.clientHeight};
   });
   assert.ok(scrollResult.top>0&&scrollResult.max>=scrollResult.top,
    "Mercy canonical prayer text must actually scroll: "+JSON.stringify(scrollResult));
   await page.waitForFunction(()=>{
    const root=document.querySelector("#aoPray435930.open");
    const cursor=Number(root?.querySelector("[data-ao-f07-crown]")?.dataset.position);
    return Number.isInteger(cursor)&&cursor>4;
   },null,{timeout:8000});
   const actual=await page.locator(base+".aoMercyLine.aoMercyPrayer").getAttribute("data-ao-mercy-step");
   assert.equal(await crown.getAttribute("data-position"),actual,
    "Crown must follow the canonical paragraph scroll cursor without a second state engine");
   await page.screenshot({path:resolve(output,"mercy-crown-decade-"+width+".png"),animations:"disabled"});
   const overflow=await page.evaluate(()=>{
    const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
    return {document:document.documentElement.scrollWidth-innerWidth,mount:(mount?.scrollWidth||0)-(mount?.clientWidth||0)};
   });
   assert.ok(overflow.document<=1&&overflow.mount<=1,"No 320/390 horizontal overflow: "+JSON.stringify(overflow));
   // Complete all source prayers without inventing additional text.
   await pilot.locator('[data-p435930-mercy-chapter="59"]').click();
   assert.equal(await crown.getAttribute('data-position'),'59');
   assert.equal(await pilot.locator('.aoMercyLine.aoMercyPrayer .aoF07MercyRole-Response').count(),1);
   await pilot.locator('.aoDevoCardScroll [data-ao-mercy-step="61"]').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>
     document.querySelector('#aoPray435930.open [data-ao-f07-crown]')?.dataset.position==='61',
     null,{timeout:8000});
   assert.equal(await crown.getAttribute('data-position'),'61');
   assert.equal(await pilot.locator('[data-p435930-mercy-finish]').count(),1);
   await pilot.locator('[data-p435930-mercy-finish]').click();
   assert.equal(await page.locator(base+'[data-f07-mercy-completion]').count(),1,
    "Claude F07 m3 is a completion screen after the third Holy God");
   assert.match(await page.locator(base+'[data-f07-mercy-completion]').innerText(),/Jesus, I trust in You/);
   await page.screenshot({path:resolve(output,"mercy-f07-completion-"+width+".png"),animations:"disabled"});
   await page.locator(base+'[data-p435930-mercy-again]').click();
   assert.equal(await crown.getAttribute('data-position'),'0');
   assert.equal(await page.locator(base+'[data-f07-mercy-completion]').count(),0);
   // Optional closing is a 63rd source event, not a default prayer.
   await aa.locator(':scope > summary').click();
   await aa.locator('details[data-ao-mercy-options] > summary').click();
   await aa.locator('[data-p435930-mercy-closing]').click();
   assert.equal(await crown.getAttribute('data-total'),'63');
   assert.equal(await pilot.locator('.aoF07MercyChapterChips button').count(),8,
     "Optional source conclusion must have its own eighth chapter");
   await pilot.locator('[data-p435930-mercy-chapter="62"]').click();
   assert.equal(await crown.getAttribute('data-position'),'62');
   assert.equal(await pilot.locator('[data-p435930-mercy-finish]').count(),1);
   assert.match(await pilot.locator('.aoMercyLine.aoMercyPrayer').innerText(),/Eternal God, in whom mercy is endless/);
   await pilot.locator('[data-p435930-mercy-finish]').click();
   assert.equal(await page.locator(base+'[data-f07-mercy-completion]').count(),1);
   await page.locator(base+'[data-p435930-mercy-again]').click();
   assert.equal(await crown.getAttribute('data-total'),'63');
   assert.equal(await crown.getAttribute('data-position'),'0');
   assert.deepEqual(errors,[],"No uncaught F07 pilot errors");
   console.log("PASS F07 "+width+"px: source 62 events, 55-bead crown, decade jump, full prayer, no overflow");
  }finally{await page.close()}
 }
 const legacy=await browser.newPage({viewport:{width:320,height:568},isMobile:true});
 try{
  await legacy.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await legacy.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
  await legacy.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
  await legacy.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  await legacy.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null}));
  assert.equal(await legacy.locator("#aoPray435930.open [data-ao-f07-crown]").count(),0,"Default Divine Mercy stays unchanged");
  assert.equal(await legacy.locator("#aoPray435930.open [data-ao-mercy-bead-navigation]").count(),1);
 }finally{await legacy.close()}
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
