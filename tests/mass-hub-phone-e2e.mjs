import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const base=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2",".jpg":"image/jpeg",".webp":"image/webp"};
const requests=[];
const server=http.createServer(async(req,res)=>{
 try{const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const f=resolve(base,"."+p);if(f!==base&&!f.startsWith(base+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(f);requests.push(p);
  res.writeHead(200,{"content-type":mime[extname(f)]||"application/octet-stream","cache-control":"no-store"});res.end(data)
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4229,"127.0.0.1",yes)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:"block"});
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e?.message??e)));
 await page.goto("http://127.0.0.1:4229/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true,null,{timeout:30000});
 const opened=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("mass"));
 assert.equal(opened.ok,true,"Mass did not open as an independent app destination");
 await page.waitForSelector("#ao-mass-modular-root",{state:"visible",timeout:15000});
 assert.equal(await page.locator("[data-mass-hub-category]").count(),6);
 assert.equal(await page.locator("[data-mass-hub-form]").count(),4);
 assert.equal(await page.locator("[data-mass-hub-mode]").count(),3);
 assert.equal(await page.locator("#ao-mass-modular-root .aoMassHubStateRibbon").count(),1);
 assert.equal(await page.locator("#ao-r17-native-reader-preview").count(),0,
   "Opening Mass hub silently started the Mass reader");
 assert.ok(!await page.locator("#ao-mass-flow-v1 .aoMassFlowBackdrop:visible").count(),
   "Opening Mass hub still launched historical preflight");
 await page.locator('[data-mass-hub-form="LOW"]').click();
 await page.locator('[data-mass-hub-mode="MISSAL"]').click();
 const state=await page.evaluate(()=>AO_MASS_HUB_V1.status());
 assert.equal(state.selectedForm,"LOW");
 assert.equal(state.selectedMode,"MISSAL");
 await page.locator("[data-mass-hub-tenebrae]").click();
 await page.waitForSelector("#ao-mass-modular-root [data-ao-mass-tenebrae=live]",{state:"attached",timeout:10000});
 await page.waitForFunction(()=>AO_MASS_HUB_V1?.status?.()?.tenebrae?.ready===true,null,{timeout:30000});
 assert.equal(await page.locator(".aoTenebraeMove span").textContent(),"1 / 32");
 assert.equal(await page.locator(".aoTenebraeCard").getAttribute("data-tenebrae-cue"),"M.N1.P1");
 assert.equal(await page.locator(".aoTenebraeReading").getAttribute("lang"),"la",
   "Sung Office psalm must begin Latin");
 await page.locator("[data-tenebrae-toggle]").click();
 assert.equal(await page.locator(".aoTenebraeReading").getAttribute("lang"),"en");
 await page.locator('[data-tenebrae-mode="MISSAL"]').click();
 assert.equal(await page.locator(".aoTenebraeLatin").count(),1);
 assert.equal(await page.locator(".aoTenebraeTranslation").count(),1);
 await page.locator('[data-tenebrae-hour="LAUDS"]').click();
 await page.waitForFunction(()=>AO_MASS_HUB_V1.status().tenebrae?.ready&&AO_MASS_HUB_V1.status().tenebrae?.hour==="LAUDS",null,{timeout:25000});
 assert.equal(await page.locator(".aoTenebraeMove span").textContent(),"1 / 10");
 await page.locator('[data-tenebrae-day="2"]').click();
 await page.waitForFunction(()=>AO_MASS_HUB_V1.status().tenebrae?.ready&&AO_MASS_HUB_V1.status().tenebrae?.day===2,null,{timeout:25000});
 assert.equal(await page.locator(".aoTenebraeMove span").textContent(),"1 / 10");
 await page.locator("[data-tenebrae-back]").first().click();
 await page.waitForSelector('[data-mass-hub-category="CALENDAR"]',{state:"visible",timeout:10000});
 assert.equal(await page.locator('[data-mass-hub-form="LOW"]').getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator('[data-mass-hub-mode="MISSAL"]').getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator(".aoMassHubError").count(),0);
 const over=await page.evaluate(()=>{
  const el=document.querySelector("#ao-mass-modular-root");
  return (el?.scrollWidth??0)-(el?.clientWidth??0);
 });
 assert.ok(over<4,"Mass hub has horizontal overflow at 390px: "+over);
 assert.ok(requests.some(path=>path.endsWith("/psalms-01.json")),"Tenebrae did not use local Psalter");
 assert.equal(errors.length,0,errors.join(" | "));
 // A category is actionable, not a decorative hub tile. It must open the
 // canonical Proper/rubrics preflight with the previously selected form/mode.
 await page.locator('[data-mass-hub-category="CALENDAR"]').click();
 await page.waitForFunction(()=>document.documentElement.dataset.aoMassHubOpen==="preflight",null,{timeout:15000});
 const configured=await page.evaluate(()=>AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight);
 assert.equal(configured?.chosenForm,"LOW","Mass hub Low form was not handed to the real preflight");
 assert.equal(configured?.readerMode,"MISSAL","Mass hub Missal mode was not handed to the real preflight");
 assert.equal(await page.locator("#ao-mass-modular-root").isHidden(),true,
   "Mass hub obstructed the authoritative Proper selector");
 const home=await page.evaluate(()=>AO_APP_SHELL_V1.navigate("home"));
 assert.equal(home.ok,true);
 assert.equal(await page.locator("#ao-mass-modular-root").count(),0,"Mass hub survived Home route");
 console.log("Mass Hub 390px: PASS — true domain navigation, six actual Mass choices, Low/reader modes, LIVE/Missal Tenebrae with 32/10 original local source texts, mobile and Home close.");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
