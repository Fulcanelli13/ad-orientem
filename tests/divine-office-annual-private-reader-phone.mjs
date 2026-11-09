/**
 * Source-only 1960 Latin Office reader: 730 dates × eight canonical Hours.
 * Real Chromium at 320px and 390px, against the assembled private archive.
 * This is intentionally never a public Prayer page or GitHub Pages release.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,stat} from "node:fs/promises";
import {resolve,join,extname,relative,sep} from "node:path";
import {chromium} from "@playwright/test";

const ROOT=resolve(process.env.OFFICE_RESEARCH_READER_ROOT||"private-reader");
const OUT=resolve("artifacts/office-annual-private-reader-phone");
await mkdir(OUT,{recursive:true});
const mime={
 ".html":"text/html; charset=utf-8",
 ".json":"application/json; charset=utf-8",
 ".js":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",
};
const server=http.createServer(async(req,res)=>{
 try{
  const raw=decodeURIComponent(new URL(req.url||"/","http://localhost").pathname);
  const path=resolve(ROOT,"."+raw);
  const relativePath=relative(ROOT,path);
  if(relativePath===".."||relativePath.startsWith(".."+sep))
   throw Error("TRAVERSAL");
  const file=(await stat(path)).isDirectory()?join(path,"index.html"):path;
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(data);
 }catch(error){
  res.writeHead(404,{"content-type":"text/plain"});
  res.end("Not found");
 }
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port,base="http://127.0.0.1:"+port;
const BROWSERS=[320,390],HOURS=[
 ["Matins","Matutinum"],["Lauds","Laudes"],["Prime","Prima"],
 ["Terce","Tertia"],["Sext","Sexta"],["None","Nona"],
 ["Vespers","Vespera"],["Compline","Completorium"]
];
const receipt={schema:"ao.office.1960.private-reader-phone.v1",
 status:"PRIVATE_SOURCE_PREVIEW_NOT_PUBLIC",publicReaderAuthorized:false,
 scenarios:[],screenshots:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of BROWSERS){
  const page=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1});
  page.setDefaultTimeout(35000);
  await page.goto(base+"/index.html?date=2026-01-01",{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>document.querySelector("#status")?.textContent?.includes(
   "SOURCE EXTRACTED"));
  assert.equal(await page.locator("#date").inputValue(),"2026-01-01");
  assert.equal(await page.locator("nav[aria-label='Canonical Hours'] button").count(),8);
  assert.match(await page.locator("#witness").innerText(),/01-01-2026-8-Completorium\.html/u);
  assert.match(await page.locator("#daytitle").innerText(),/Octav[æa]/u);
  assert.ok(await page.locator(".section").count()>=10);
  assert.match(await page.locator("#sections").innerText(),/Te lucis ante términum/u);
  assert.match(await page.locator("#sections").innerText(),/Post partum/u);
  assert.ok(await page.locator(".sourceLine[data-role='psalm_heading']").count()>=3);
  assert.equal(await page.locator("#sections").getAttribute("data-public-reader-authorized"),null);
  for(const [label,hour] of HOURS){
   await page.getByRole("button",{name:label,exact:true}).click();
   assert.equal(await page.getByRole("button",{name:label,exact:true})
    .getAttribute("aria-pressed"),"true");
   assert.match(await page.locator("#witness").innerText(),
    new RegExp("01-01-2026-[1-8]-"+hour+"\\.html","u"));
   assert.ok(await page.locator(".section").count()>=3,label+" source sections");
   assert.ok(await page.locator(".sourceLine[data-role='psalm_heading']").count()>=1,
    "Missing source Psalm heading for "+hour);
   const overflow=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflow<=2,"Overflow "+width+" "+hour+" "+overflow);
   receipt.scenarios.push({case:"2026-Jan1-all-hours",width,hour,passed:true});
  }
  // Cross-year navigation uses the same private reader, not a different app.
  await page.locator("#date").fill("2026-12-31");
  await page.locator("#date").dispatchEvent("change");
  await page.waitForFunction(()=>document.querySelector("#witness")
   ?.textContent?.includes("12-31-2026-1-Matutinum.html")||
   document.querySelector("#status")?.textContent?.includes("SOURCE EXTRACTED"));
  await page.getByRole("button",{name:"Next day"}).click();
  await page.waitForFunction(()=>
   document.querySelector("#date")?.value==="2027-01-01"&&
   document.querySelector("#status")?.textContent?.includes("SOURCE EXTRACTED"));
  assert.equal(await page.locator("#date").inputValue(),"2027-01-01");
  await page.getByRole("button",{name:"Compline",exact:true}).click();
  assert.match(await page.locator("#witness").innerText(),
   /01-01-2027-8-Completorium\.html/u);
  assert.ok(await page.locator(".sourceLine[data-role='psalm_heading']").count()>=3);
  receipt.scenarios.push({case:"2026-to-2027-civil-rollover",width,passed:true});
  // 2027 exceptional Baptism and ordinary Sunday after First Vespers
  // are displayed as *source*, never silently promoted to public status.
  for(const date of ["2027-01-13","2027-01-16","2027-12-31"]){
   await page.locator("#date").fill(date);
   await page.locator("#date").dispatchEvent("change");
   await page.waitForFunction(d=>
    document.querySelector("#date")?.value===d&&
    document.querySelector("#witness")?.textContent?.includes(
     d.slice(5,7)+"-"+d.slice(8,10)+"-"+d.slice(0,4)+"-8-Completorium.html"),
    date);
   assert.match(await page.locator("#status").innerText(),
    /NOT LITURGICALLY CERTIFIED · NOT PUBLIC/u);
   assert.ok(await page.locator(".section").count()>=6);
   assert.ok(await page.locator(".sourceLine[data-role='psalm_heading']").count()>=2);
   receipt.scenarios.push({case:"2027-private-Office-date",width,date,passed:true});
  }
  const png=width+"-annual-latin-all-hours.png";
  await page.screenshot({path:resolve(OUT,png),fullPage:false,animations:"disabled"});
  receipt.screenshots.push(png);
  await page.close();
 }
 await mkdir(OUT,{recursive:true});
 const {writeFile}=await import("node:fs/promises");
 await writeFile(resolve(OUT,"receipt.json"),JSON.stringify(receipt,null,2)+"\n");
 console.log("AO_OFFICE_PRIVATE_READER_PHONE_PASS widths=320,390 "+
  "source_years=2026,2027 eight_hours=8 days=730 scenarios="+
  receipt.scenarios.length+" public=false");
}finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
