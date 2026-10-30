import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/mass-texts-sheet");await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const [width,height] of [[390,844],[320,568]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
   {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForSelector('#ao-global-ribbon [data-ao-app-surface="mass"]',{state:"visible",timeout:25000});
  await page.locator('#ao-global-ribbon [data-ao-app-surface="mass"]').click();
  await page.waitForSelector('[data-m1-choice="mass"]',{state:"visible",timeout:25000});
  const open=page.locator("[data-mass-texts-open]");
  assert.equal(await open.count(),1,"One source-owned Mass texts entry, no duplicate");
  const inspect=async(expected)=>{
   const ui=await page.evaluate(()=>{
    const sheet=document.querySelector(".aoMassTextsSheet");
    const header=sheet.querySelector(".aoMassTextsHeader");
    const back=header.querySelector("button");
    const title=header.querySelector("h2");
    const rect=back.getBoundingClientRect(),h=header.getBoundingClientRect(),t=title.getBoundingClientRect();
    return {header:title.textContent,backWidth:rect.width,backHeight:rect.height,
      backLabel:back.getAttribute("aria-label"),headerHeight:h.height,titleWidth:t.width,
      overflow:document.documentElement.scrollWidth-innerWidth,
      modal:sheet.getAttribute("aria-modal"),
      preflightCount:document.querySelectorAll("[data-ao-full-mass-preflight]").length,
      startCount:document.querySelectorAll("[data-ao-start-live]").length,
      readerMounted:!!globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected};
   });
   assert.equal(ui.header,expected);
   assert.equal(ui.modal,"true");
   assert.ok(ui.backWidth>=43.5&&ui.backWidth<=44.5,"Fixed back width: "+JSON.stringify(ui));
   assert.ok(ui.backHeight>=43.5&&ui.backHeight<=44.5,"Fixed back height: "+JSON.stringify(ui));
   assert.ok(ui.headerHeight>=52&&ui.titleWidth>50,"Header title must have its own flexible column");
   assert.ok(ui.overflow<=1,"320/390px Mass texts horizontal overflow: "+JSON.stringify(ui));
   assert.equal(ui.preflightCount,1);
   assert.equal(ui.startCount,1);
   assert.equal(ui.readerMounted,false,"Reading Mass texts must not begin or resume R17");
   return ui;
  };
  await open.click();
  await page.waitForSelector('.aoMassTextsSheet',{state:"visible",timeout:10000});
  const en=await inspect("Mass texts");
  await page.screenshot({path:resolve(out,width+"-dark-en.png")});
  // The pushed header's own back control is the stable release path
  // while the separate root-level Escape lifecycle fix remains in #2061.
  // Test keyboard Escape across nested UI after that PR has landed.
  await page.locator("[data-mass-texts-close]").click();
  await page.waitForSelector('.aoMassTextsOverlay',{state:"detached",timeout:10000});
  assert.equal(await page.locator('html[data-ao-m1-mass-root="true"]').count(),1,
   "Closing Mass texts must return to the Mass root, not blank the tab");
  await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359.setPath("appearance.mode","light"));
  await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceV1==="light");
  await open.click();
  await inspect("Mass texts");
  await page.screenshot({path:resolve(out,width+"-light-en.png")});
  await page.locator("[data-mass-texts-close]").click();
  await page.waitForSelector(".aoMassTextsOverlay",{state:"detached"});
  await page.locator('[data-m1-choice="language"]').click();
  await page.locator("[data-folio-language]").selectOption("fr");
  await page.locator("[data-folio-overview-button]").click();
  await open.click();
  const fr=await inspect("Textes de la messe");
  await page.screenshot({path:resolve(out,width+"-light-fr.png")});
  await page.locator("[data-mass-texts-close]").click();
  await page.waitForSelector(".aoMassTextsOverlay",{state:"detached"});
  await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359.setPath("appearance.mode","dark"));
  await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceV1==="dark");
  await open.click();
  await inspect("Textes de la messe");
  await page.screenshot({path:resolve(out,width+"-dark-fr.png")});
  await page.locator("[data-mass-texts-close]").click();
  await page.waitForSelector(".aoMassTextsOverlay",{state:"detached"});
  assert.equal(errors.length,0,"Mass texts browser errors: "+JSON.stringify(errors));
  console.log("PASS B3 Mass texts pushed header EN/FR, dark/light, "+width+"x"+height,JSON.stringify({en,fr}));
  await page.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
