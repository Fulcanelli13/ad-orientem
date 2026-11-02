import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
let browser;
try{
 await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
 browser=await chromium.launch({headless:true,executablePath:process.env.AO_BROWSER_BIN||undefined});
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const page=await ctx.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/sacred-music.html?work=faure-requiem-op48",
    {waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForSelector(".aoMusicMovement",{state:"attached",timeout:10000});
  assert.equal(await page.locator(".aoMusicMovement").count(),7);
  assert.match(await page.locator(".aoMusicScope").innerText(),/not a Mass/i);
  assert.equal(await page.locator("audio,video,iframe").count(),0);
  assert.ok(await page.locator(".aoMusicMovement").first().locator("summary").isVisible());
  await page.locator(".aoMusicMovement").nth(3).locator("summary").click();
  assert.match(await page.locator(".aoMusicMovement").nth(3).innerText(),/not a substitute/i);
  await page.locator('[data-ao-music-mode="MASS"]').click();
  assert.match(await page.locator(".aoMusicScope").innerText(),/1962/);
  assert.equal(await page.locator(".aoMusicMovement").count(),7,"Mass view must not modify music movements");
  await page.locator(".aoMusicLanguage").click();
  assert.match(await page.locator(".aoMusicScope").innerText(),/1962/);
  assert.match(await page.locator(".aoMusicLanguage").innerText(),/EN/);
  await page.locator(".aoMusicField select").selectOption("durufle-requiem-op9");
  assert.equal(await page.locator(".aoMusicMovement").count(),9);
  assert.match(await page.locator(".aoMusicWorkHeading").innerText(),/Duruflé/);
  await page.locator(".aoMusicField select").selectOption("mozart-requiem-k626");
  assert.equal(await page.locator(".aoMusicMovement").count(),14);
  await page.locator(".aoMusicField select").selectOption("palestrina-missa-pro-defunctis");
  assert.equal(await page.locator(".aoMusicMovement").count(),4);
  const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2);
  assert.ok(noOverflow,"Guide overflows "+width+"px");
  assert.deepEqual(errors,[],"Page errors at "+width+"px: "+JSON.stringify(errors));
  console.log("PASS sacred music guide "+width+"px; EN/FR, Mass/concert, 4 work families");
  await ctx.close();
 }
}finally{await browser?.close();if(server.listening)await new Promise(ok=>server.close(ok))}
