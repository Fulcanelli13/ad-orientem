/* Native Prayer > Divine Office door, route and safe return on two phone widths.
 * No external Office sources may be invoked by the public-facing placeholder.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/divine-office-native-phone");
await mkdir(out,{recursive:true});
const mime={
 ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",
 ".woff2":"font/woff2"
};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){
   res.writeHead(403);res.end("Forbidden");return;
  }
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const origin="http://127.0.0.1:"+server.address().port;
const receipt={schema:"ao.office.native-prayer-door-phone.v1",
 scenarios:[],screenshots:[],publicTextReleased:false,success:false};
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  const page=await ctx.newPage(),errors=[],officeSourceRequests=[];
  page.on("pageerror",error=>errors.push(error.message));
  page.on("request",req=>{
   // Shared Mass/Prayer startup legitimately fetches Commune leaves.
   // This Office status shell may NOT fetch the actual piloted Psalter,
   // Office Ordinary or Advent First Vespers sources.
   if(/\/web\/www\/horas\/(?:Latin|English|Francais)\/(?:Psalterium\/|Ordinarium\/Vespera\.txt|Tempora\/Adv1-0\.txt)/u.test(req.url()))
    officeSourceRequests.push(req.url());
  });
  const res=await page.goto(origin+"/index.html",{
   waitUntil:"domcontentloaded",timeout:90000
  });
  assert.equal(res?.status(),200);
  await page.waitForFunction(()=>typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",
   null,{timeout:50000});
  const nav=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"));
  assert.equal(nav.ok,true,"Prayer destination did not open");
  const door=page.locator("#aoPray435930.open [data-ao-office-door]");
  await door.waitFor({state:"visible",timeout:30000});
  assert.match(await door.innerText(),/Divine Office/i);
  assert.equal(await door.count(),1,"Duplicate Office door");
  // Other installed Prayer/Calendar modules may fetch canonical horas leaves
  // on startup. Only *additional* Office reads during this reader are forbidden.
  const sourceBaseline=officeSourceRequests.length;
  await door.click();
  const office=page.locator("#aoPray435930.open .aoOfficeReader");
  await office.waitFor({state:"visible",timeout:20000});
  assert.equal(await office.locator("[data-office-hour]").count(),8);
  assert.match(await office.locator(".aoOfStatus").innerText(),/not yet available/i);
  await office.locator('input[type="date"]').fill("2026-11-28");
  await office.locator('input[type="date"]').dispatchEvent("change");
  await office.locator('[data-office-hour="COMPLINE"]').click();
  assert.match(await office.locator(".aoOfStatus").innerText(),/Source pilot prepared/i);
  assert.match(await office.locator(".aoOfStatus").innerText(),/Office date: 2026-11-28/);
  assert.match(await office.locator(".aoOfStatus").innerText(),/Reading enabled: no/);
  await office.locator('[data-office-hour="VESPERS"]').click();
  assert.match(await office.locator(".aoOfStatus").innerText(),/Office date: 2026-11-29/);
  assert.equal(officeSourceRequests.length,sourceBaseline,
   "Status-only Office caused new pinned source requests: "+
    officeSourceRequests.slice(sourceBaseline).join(" | "));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-
   document.documentElement.clientWidth);
  assert.ok(overflow<=2,"Office horizontally overflows "+width+": "+overflow);
  await page.screenshot({path:resolve(out,width+"-office-door.png"),
   animations:"disabled",fullPage:false});
  receipt.screenshots.push(width+"-office-door.png");
  // The donor's invisible header must never be a hit target over Office Back.
  const header=page.locator("#aoPray435930 .aoP435930Head");
  assert.equal(await header.getAttribute("inert")!==null,true,
   "Legacy Prayer header must be inert while Office is open");
  const target=await office.getByRole("button",{name:"Return to Prayer"}).evaluate(el=>{
   const rect=el.getBoundingClientRect();
   const top=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
   return Boolean(top===el||el.contains(top));
  });
  assert.equal(target,true,"Legacy Prayer header still overlays the native Office Back button");
  await office.getByRole("button",{name:"Return to Prayer"}).click();
  assert.equal(await office.count(),0,"Office overlay survives local Back");
  assert.equal(await header.getAttribute("inert"),null,
   "Legacy Prayer header inert state not restored on Back");
  await door.waitFor({state:"visible",timeout:12000});
  await door.click();
  await office.waitFor({state:"visible",timeout:12000});
  const home=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
  assert.equal(home.ok,true,"App hard-Home return failed");
  await page.locator(".homeScreen").waitFor({state:"visible",timeout:20000});
  const returned=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"));
  assert.equal(returned.ok,true,"Prayer reopen failed");
  await door.waitFor({state:"visible",timeout:20000});
  assert.equal(await page.locator(".aoOfficeReader").count(),0,
   "Office leaked into fresh Prayer entry");

  assert.deepEqual(errors.filter(x=>/TypeError|SyntaxError|ReferenceError/.test(x)),[],
   "App exception after Office reader journey");
  receipt.scenarios.push({width,validHours:8,compliantSourceHold:true,
   backToPrayer:true,backToHome:true,noUnapprovedSourceFetch:true,passed:true});
  await ctx.close();
 }
 receipt.success=true;
}finally{
 await writeFile(resolve(out,"acceptance-receipt.json"),
  JSON.stringify(receipt,null,2)+"\n");
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
assert.equal(receipt.success,true);
process.stdout.write(JSON.stringify(receipt,null,2)+"\n");
