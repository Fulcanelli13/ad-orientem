// Mobile acceptance for the separate, user-owned household customs module.
// No new liturgical observances, Calendar skins, Mass switches or external services.
import assert from "node:assert/strict";
import http from "node:http";
import { readFile,mkdir } from "node:fs/promises";
import { resolve,sep,extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const shots=resolve(root,"artifacts/my-customs-phone");
await mkdir(shots,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:"en-GB",reducedMotion:"reduce"});
  const address="http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native";
  try{
   await page.goto(address,{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner),null,{timeout:45000});
   await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("pray"));
   const opener=page.locator('[data-p435930-my-customs]');
   await opener.waitFor({state:"visible",timeout:45000});
   await opener.click();
   const dialog=page.locator("dialog#ao-my-customs-prayers");
   await dialog.waitFor({state:"visible",timeout:15000});
   assert.match(await dialog.locator("h1").innerText(),/My Customs & Prayers/);
   await dialog.locator('[name="title"]').fill("Household St Barbara prayer");
   await dialog.locator('[name="body"]').fill("A prayer written for our own household.");
   await dialog.locator('[name="recurrence"]').selectOption("annual");
   await dialog.locator('[name="mmdd"]').fill("12-04");
   await dialog.locator('button[type="submit"]').click();
   assert.equal(await dialog.locator(".myc-entry").count(),1);
   assert.match(await dialog.locator(".myc-entry h3").first().innerText(),/Household St Barbara prayer/);
   await dialog.locator('[name="entryType"]').selectOption("canonical");
   await dialog.locator('[name="customId"]').selectOption("ADVT-001");
   await dialog.locator('[name="note"]').fill("Adopted for our family, voluntary.");
   await dialog.locator('button[type="submit"]').click();
   assert.equal(await dialog.locator(".myc-entry").count(),2);
   const now=await page.evaluate(async()=>{
    const mod=await import("/src/customs/personal-store.js");
    const registry=await import("/src/calendar/customs-read-model.js");
    const store=mod.createMyCustomsStore({storage:localStorage,canonicalIds:registry.calendarCustomArticleIds()});
    return {count:store.list().length,dec4:store.onDate("2026-12-04").map(x=>x.title||x.customId),
      dec5:store.onDate("2026-12-05").map(x=>x.title||x.customId),
      raw:localStorage.getItem(mod.MY_CUSTOMS_STORAGE_KEY)};
   });
   assert.equal(now.count,2);
   assert.ok(now.dec4.includes("Household St Barbara prayer"));
   assert.equal(now.dec5.length,0,"No invented next-day repetition");
   assert.ok(now.raw.includes("AO_PERSONAL_CUSTOMS_PRAYERS_V1"));
   assert.ok(!now.dec4.includes("ADVT-001"),"Simply adopting must not invent a recurring date");
   const box=await dialog.evaluate(d=>({scroll:d.scrollWidth,client:d.clientWidth}));
   assert.ok(box.scroll<=box.client+2,"Personal module horizontal mobile overflow");
   await page.screenshot({path:resolve(shots,"personal-"+width+".png"),fullPage:false});
   await dialog.locator("header button").click();
   await page.evaluate(async()=>{
     const m=await import("/src/customs/personal-ui.js");
     m.openMyCustoms({language:"fr"});
   });
   await page.locator("dialog#ao-my-customs-prayers h1").waitFor({state:"visible"});
   assert.match(await page.locator("dialog#ao-my-customs-prayers h1").innerText(),/Mes coutumes et prières/);
   assert.equal(await page.locator("dialog#ao-my-customs-prayers .myc-entry").count(),2);
   await page.locator("dialog#ao-my-customs-prayers header button").click();
   console.log("PASS "+width+"px: Pray entry, personal date, canonical adoption, persistence, French labels, no overflow");
  }finally{await page.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
