/* Native Prayer > Divine Office door, route and safe return on two phone widths.
 * No external Office sources may be invoked by the public-facing placeholder.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const latinFixture=JSON.parse(await readFile(resolve(root,"tests/fixtures/office/advent-i-saturday-compline-la.json"),"utf8"));
const sundayFixture=JSON.parse(await readFile(resolve(root,"tests/fixtures/office/advent-i-week-compline-la.json"),"utf8"));
const tuesdayFixture=JSON.parse(await readFile(resolve(root,"tests/fixtures/office/advent-i-feria-iii-compline-la.json"),"utf8"));
const latinSourceBase="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+PIN+"/web/www/horas/Latin/";
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
 scenarios:[],screenshots:[],publicTextReleased:true,success:false};
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
  assert.match(await office.locator(".aoOfStatus").innerText(),/Latin Compline · available/i);
  assert.equal(await office.getByRole("button",{name:"Read Latin Compline"}).count(),1);
  assert.match(await office.locator(".aoOfStatus").innerText(),/Office date: 2026-11-28/);
  assert.match(await office.locator(".aoOfStatus").innerText(),/Reading enabled: yes/);
  await office.locator('[data-office-hour="VESPERS"]').click();
  assert.match(await office.locator(".aoOfStatus").innerText(),/Office date: 2026-11-29/);
  assert.equal(officeSourceRequests.length,sourceBaseline,
   "Status-only Office caused new pinned source requests: "+
    officeSourceRequests.slice(sourceBaseline).join(" | "));
  // Positive PUBLIC reader: fetch exactly the pinned Latin leaves, never
  // a fallback translation, and verify that the real reading renders at
  // both 320px and 390px.
  const observedLatin=[];
  await page.route("https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/**",async route=>{
   const url=route.request().url();
   if(!url.startsWith(latinSourceBase))return route.continue();
   observedLatin.push(url);
   const relative=decodeURIComponent(url.slice(latinSourceBase.length));
   const match=/^Psalterium\/Psalmorum\/Psalm(4|11|12|15|33|60|69|70|76|85|87|90|102|133|233)\.txt$/u.exec(relative);
   let body;
   if(match){
    const number=Number(match[1]);
    body=[11,12,15].includes(number)?
     tuesdayFixture.psalms[number]?.text:
     [4,33,60,69,70,76,85,90,133].includes(number)?
     sundayFixture.psalms[number]?.text:latinFixture.psalms[number];
   }
   else if(relative.endsWith(".txt")){
    const path=relative.slice(0,-4);
    const items=latinFixture.sections[path];
    if(items)body=Object.entries(items).map(([name,rows])=>
     "["+name+"]\n"+rows.join("\n")).join("\n\n")+"\n";
   }
   await route.fulfill({status:body?200:404,contentType:"text/plain",
    headers:{"access-control-allow-origin":"*"},
    body:body??"UNAPPROVED_LATIN_LEAF"});
  });
  await office.locator('[data-office-hour="COMPLINE"]').click();
  await office.getByRole("button",{name:"Read Latin Compline"}).click();
  const reading=office.locator(".aoOfPublicLatin");
  await page.waitForFunction(()=>document.querySelector(".aoOfPublishedStatus")?.textContent?.includes("40 reading moments"),null,{timeout:35000});
  assert.match(await reading.locator(".aoOfFrameControls").innerText(),/1 \/ /);
  assert.ok(observedLatin.length>=7,"Public Latin text did not fetch pinned original");
  await reading.getByRole("button",{name:"Next"}).click();
  assert.match(await reading.locator(".aoOfFrameControls").innerText(),/2 \/ /);
  const minister=reading.getByRole("combobox",{name:/Presiding minister/});
  await minister.selectOption("PRIEST");
  await page.waitForFunction(()=>document.querySelector(".aoOfPublishedStatus")?.textContent?.includes("40 reading moments"),null,{timeout:35000});
  const overflowReading=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflowReading<=2,"Public Latin Compline overflow "+width+": "+overflowReading);
  await office.getByRole("button",{name:"Close Latin Compline"}).click();
  assert.equal(await office.locator(".aoOfPublishedLatin").count(),0);
  // The second Advent Saturday has the same 1960 Saturday Compline
  // appointment and source-backed Psalm 87/102 as the first.
  await office.getByRole("button",{name:"Advent II · 5 Dec 2026"}).click();
  assert.match(await office.locator(".aoOfStatus").innerText(),
   /Latin Compline · available/u);
  assert.match(await office.locator(".aoOfStatus").innerText(),
   /Office date: 2026-12-05/u);
  await office.getByRole("button",{name:"Read Latin Compline"}).click();
  await page.waitForFunction(()=>
   document.querySelector(".aoOfPublishedStatus")?.textContent?.includes(
    "2026-12-05 · 40 reading moments"),null,{timeout:35000});
  assert.match(await office.locator(".aoOfPublishedLatin").innerText(),
   /Saturday, 5 December 2026/u);
  assert.match(await office.locator(".aoOfFrameControls").innerText(),/1 \/ /u);
  const secondOverflow=await page.evaluate(()=>
   document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(secondOverflow<=2,"Second Advent Saturday overflows "+width);
  await office.getByRole("button",{name:"Close Latin Compline"}).click();
  assert.equal(await office.locator(".aoOfPublishedLatin").count(),0);
  // Sunday 29 Nov and St Andrew (II class) 30 Nov each use the
  // independently printed 329-word Sunday Psalter, not Saturday.
  for(const [caption,date,title] of [
   ["Advent I Sunday · 29 Nov","2026-11-29","Sunday, 29 November 2026"],
   ["St Andrew · 30 Nov","2026-11-30","St Andrew the Apostle, 30 November 2026"]
  ]){
   await office.getByRole("button",{name:caption}).click();
   assert.match(await office.locator(".aoOfStatus").innerText(),
    /Latin Compline · available/u);
   assert.match(await office.locator(".aoOfStatus").innerText(),
    new RegExp("Office date: "+date,"u"));
   await office.getByRole("button",{name:"Read Latin Compline"}).click();
   await page.waitForFunction(expected=>
    document.querySelector(".aoOfPublishedStatus")?.textContent?.includes(
     expected+" · 40 reading moments"),date,{timeout:35000});
   const latin=office.locator(".aoOfPublishedLatin");
   assert.ok((await latin.innerText()).includes(title));
   assert.match(await latin.locator(".aoOfFrameControls").innerText(),/1 \/ /u);
   const narrow=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(narrow<=2,"Sunday-Psalter "+date+" overflow "+width+": "+narrow);
   await office.getByRole("button",{name:"Close Latin Compline"}).click();
   assert.equal(await office.locator(".aoOfPublishedLatin").count(),0);
  }
  assert.ok(observedLatin.some(url=>/Psalm4\.txt/u.test(url)));
  assert.ok(observedLatin.some(url=>/Psalm90\.txt/u.test(url)));
  assert.ok(observedLatin.some(url=>/Psalm133\.txt/u.test(url)));
  // Four different ferial Compline psalm sets from fully collated Latin.
  for(const [caption,date,title,psalms] of [
   ["Advent Tuesday · 1 Dec","2026-12-01",
    "Tuesday, 1 December 2026", [11,12,15]],
   ["St Bibiana · 2 Dec","2026-12-02",
    "St Bibiana, 2 December 2026",[33,60]],
   ["St Francis Xavier · 3 Dec","2026-12-03",
    "St Francis Xavier, 3 December 2026",[69,70]],
   ["St Peter Chrysologus · 4 Dec","2026-12-04",
    "St Peter Chrysologus, 4 December 2026",[76,85]]
  ]){
   await office.getByRole("button",{name:caption}).click();
   assert.match(await office.locator(".aoOfStatus").innerText(),
    /Latin Compline · available/u);
   assert.match(await office.locator(".aoOfStatus").innerText(),
    new RegExp("Office date: "+date,"u"));
   await office.getByRole("button",{name:"Read Latin Compline"}).click();
   await page.waitForFunction(expected=>
    document.querySelector(".aoOfPublishedStatus")?.textContent?.includes(
     expected+" · 40 reading moments"),date,{timeout:35000});
   const latin=office.locator(".aoOfPublishedLatin");
   assert.ok((await latin.innerText()).includes(title));
   assert.match(await latin.locator(".aoOfFrameControls").innerText(),/1 \/ /u);
   for(const number of psalms)assert.ok(observedLatin.some(
    url=>url.endsWith("/Psalm"+number+".txt")),
    "Missing independent Latin source for "+date+" Psalm "+number);
   const overflowDay=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflowDay<=2,"Ferial "+date+" overflows "+width+": "+overflowDay);
   await office.getByRole("button",{name:"Close Latin Compline"}).click();
   assert.equal(await office.locator(".aoOfPublishedLatin").count(),0);
  }
  // Eight real Advent II Latin reader journeys on 320px and 390px.
  // Compact date selection, not eight extra mobile shortcut buttons.
  const weekII=office.getByRole("combobox",{name:"Advent II Compline date"});
  assert.equal(await weekII.count(),1);
  for(const [date,officeDate,title,psalms] of [
   ["2026-12-06","2026-12-06","Second Sunday of Advent, 6 December 2026",[4,90,133]],
   ["2026-12-07","2026-12-08","First Compline of the Immaculate Conception",[4,90,133]],
   ["2026-12-08","2026-12-08","Immaculate Conception, 8 December 2026",[4,90,133]],
   ["2026-12-09","2026-12-09","Advent II · Wednesday, 9 December 2026",[33,60]],
   ["2026-12-10","2026-12-10","Advent II · Thursday, 10 December 2026",[69,70]],
   ["2026-12-11","2026-12-11","St Damasus I, 11 December 2026",[76,85]],
   ["2026-12-12","2026-12-13","Eve of Gaudete · Saturday, 12 December 2026",[87,102]],
   ["2026-12-13","2026-12-13","Gaudete Sunday, 13 December 2026",[4,90,133]]
  ]){
   await weekII.selectOption(date);
   assert.match(await office.locator(".aoOfStatus").innerText(),
    /Latin Compline · available/u);
   assert.match(await office.locator(".aoOfStatus").innerText(),
    new RegExp("Office date: "+officeDate,"u"));
   await office.getByRole("button",{name:"Read Latin Compline"}).click();
   await page.waitForFunction(expected=>
    document.querySelector(".aoOfPublishedStatus")?.textContent?.includes(
     expected+" · 40 reading moments"),date,{timeout:35000});
   const latin=office.locator(".aoOfPublishedLatin");
   assert.ok((await latin.innerText()).includes(title),date+" incorrect Office heading");
   for(const number of psalms)assert.ok(observedLatin.some(
    url=>url.endsWith("/Psalm"+number+".txt")),
    "Missing Latin psalm "+number+" in "+date);
   const overflow=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflow<=2,"Advent II "+date+" overflows "+width+": "+overflow);
   await office.getByRole("button",{name:"Close Latin Compline"}).click();
   assert.equal(await office.locator(".aoOfPublishedLatin").count(),0);
  }
  await office.locator('[data-office-hour="VESPERS"]').click();
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
  // The public reader scrolls a long sequence; restore the Back target
  // to the viewport before performing the hit-test at its centre.
  await office.getByRole("button",{name:"Return to Prayer"}).scrollIntoViewIfNeeded();
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
  receipt.scenarios.push({width,validHours:8,latinComplineReady:true,
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
