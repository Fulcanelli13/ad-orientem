import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".mjs":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const data=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForSelector(".homeScreen.aoTodayH4",{state:"visible",timeout:45000});
 await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.select &&
   globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_R17_BROWSER_ENTRY?.installed),
   null,{timeout:45000});
 // Reproduce any time of year; do not depend on the machine's civil clock.
 await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
 await page.waitForSelector(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root",{state:"visible",timeout:45000});
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.select("2026-11-06",{closeAfter:false})),true);
 await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
 await page.waitForFunction(()=>{
  const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
  return st?.route==="home" && st.selectedDate==="2026-11-06" && !st.resolving &&
   document.querySelector(".homeScreen .aoH7HomeView [data-home-icrsp-ordo='2026-11-06']");
 },null,{timeout:45000});
 const official=page.locator(".homeScreen .aoH7HomeView [data-home-icrsp-ordo='2026-11-06']");
 await official.waitFor({state:"visible"});
 const snapshot=await official.innerText();
 for(const expected of ["ICRSP France","Sacred Heart","Cogitationes","Class 4","Class 3",
   "No Credo","Ephesians 3:8–19","John 19:31–37","Friday abstinence"])
  assert.ok(snapshot.includes(expected),expected+" missing from actual Home: "+snapshot);
 assert.match(await official.locator("a").getAttribute("href"),/icrspfrance\.fr\/ordo\.php\?d=2026-11-06/);
 await page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]").click();
 const door=page.locator(".homeScreen .aoH7DoorView:not([hidden])");
 await door.waitFor({state:"visible"});
 assert.equal(await door.locator("[data-home-icrsp-ordo='2026-11-06']").count(),1);
 assert.match(await door.innerText(),/Begin general-calendar Mass/);
 await door.locator("[data-home-icrsp-votive='VOTIVE']").click();
 await page.waitForFunction(()=>String(globalThis.AO_CELEBRATION_ARCH_V1?.stage??"").toLowerCase()==="votive",
  null,{timeout:30000});
 assert.equal(errors.length,0,"Runtime errors: "+JSON.stringify(errors));
 await page.close();
 console.log("PASS: actual phone Home and H7 6 Nov 2026: green feria distinct from ICRSP white Cogitationes, source and votive chooser.");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
