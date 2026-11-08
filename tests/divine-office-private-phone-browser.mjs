/**
 * Actual private-reader browser acceptance; no public Office route/deploy.
 * All external source requests are served from preserved pinned witnesses.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";

const ROOT=resolve(fileURLToPath(new URL("..",import.meta.url)));
const OUT=resolve(ROOT,"artifacts/divine-office-private-phone");
await mkdir(OUT,{recursive:true});
const languages={Latin:"la",English:"en",Francais:"fr"};
const fixture={};
for(const lang of ["la","en","fr"]){
 const load=name=>JSON.parse(readFileSync(
  new URL("../tests/fixtures/office/"+name+"-"+lang+".json",import.meta.url),"utf8"));
 fixture[lang]={
  saturday:load("advent-i-saturday-compline"),
  tuesday:load("advent-i-feria-iii-compline"),
  week:load("advent-i-week-compline"),
  vespers:load("advent-i-preview")
 };
}
const ordinary=readFileSync(new URL(
 "../tests/fixtures/office/advent-i-preview-ordinary.txt",import.meta.url),"utf8");
const sourceBase="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/";
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".txt":"text/plain; charset=utf-8"};
function sourceFixture(url,{dropFrenchPsalm=false}={}){
 assert.ok(url.startsWith(sourceBase),"source pin cannot drift");
 const original=decodeURIComponent(url.slice(sourceBase.length));
 if(original==="Ordinarium/Vespera.txt")return ordinary;
 const m=/^(Latin|English|Francais)\/(.+)\.txt$/u.exec(original);
 if(!m)throw Error("UNKNOWN_SOURCE_LOCALE_OR_PATH:"+original);
 const lang=languages[m[1]],path=m[2],f=fixture[lang];
 if(path.startsWith("Psalterium/Psalmorum/Psalm")){
  const id=Number(path.slice("Psalterium/Psalmorum/Psalm".length));
  let body;
  if(id===143||id===144||id===232)
   body=f.vespers.leaves[path]||
    (f.vespers.sections[path]&&Object.entries(f.vespers.sections[path])
     .map(([key,lines])=>"["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n");
  else if([87,102,233].includes(id))body=f.saturday.psalms[id];
  else if([11,12,15].includes(id))body=f.tuesday.psalms[id]?.text;
  else body=f.week.psalms[id]?.text;
  if(typeof body!=="string")throw Error("UNSUPPORTED_PSALM:"+id);
  if(dropFrenchPsalm&&lang==="fr"&&id===70)return body.slice(0,12);
  return body;
 }
 const v=f.vespers;
 if(Object.hasOwn(v.leaves,path))return v.leaves[path];
 if(Object.hasOwn(v.sections,path))
  return Object.entries(v.sections[path])
   .map(([key,lines])=>"["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n";
 const sections=f.saturday.sections[path];
 if(!sections)throw Error("UNSUPPORTED_SOURCE:"+path);
 return Object.entries(sections)
  .map(([key,lines])=>"["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n";
}
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(ROOT,"."+pathname);
  if(file!==ROOT&&!file.startsWith(ROOT+sep)){
   res.writeHead(403);res.end("forbidden");return;
  }
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,err)=>{server.once("error",err);server.listen(0,"127.0.0.1",ok)});
const url="http://127.0.0.1:"+server.address().port+"/previews/private-divine-office.html";
const receipt={schema:"ao.office.private-reader-browser-acceptance.v1",
 revision:PIN,published:false,scenarios:[],screenshots:[],success:false};
async function stubSources(page,opts={}){
 const seen=new Set();
 await page.route("https://raw.githubusercontent.com/**",async route=>{
  const requestUrl=route.request().url();seen.add(requestUrl);
  try{
   const body=sourceFixture(requestUrl,opts);
   await route.fulfill({status:200,contentType:"text/plain",
    headers:{"access-control-allow-origin":"*"},body});
  }catch(e){
   await route.fulfill({status:404,contentType:"text/plain",
    headers:{"access-control-allow-origin":"*"},body:String(e?.message??e)});
  }
 });
 return seen;
}
async function waitReady(page){
 await page.waitForFunction(()=>document.querySelector(".aoOfReadiness")?.textContent
   .includes("NOT certified"),null,{timeout:30000});
}
async function waitWithheld(page){
 await page.waitForFunction(()=>document.querySelector(".aoOfReadiness")?.textContent
  .startsWith("Source preview withheld:"),null,{timeout:30000});
}
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  const seen=await stubSources(page);
  const r=await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(r?.status(),200);
  await page.locator("#reader .aoOfOptions select").first().selectOption("COMPLINE");
  await page.getByRole("button",{name:"Read source preview"}).click();
  await waitReady(page);
  assert.match(await page.locator(".aoOfReadiness").innerText(),/42 source events/);
  assert.match(await page.locator(".aoOfReadiness").innerText(),/2026-11-28/);
  assert.match(await page.locator(".aoOfFrameControls").innerText(),/Reading step 1 of/);
  await page.getByRole("button",{name:"Next"}).click();
  assert.match(await page.locator(".aoOfFrameControls").innerText(),/Reading step 2 of/);
  await page.getByRole("button",{name:"Previous"}).click();
  assert.equal(await page.getByRole("button",{name:"Previous"}).isDisabled(),true);
  await page.locator("#reader .aoOfOptions select").nth(1).selectOption("lafr");
  assert.equal(await page.locator(".aoOfLanguage").count(),2);
  assert.match(await page.locator(".aoOfLanguage h3").last().innerText(),/Français/);
  await page.locator("#reader .aoOfOptions select").nth(1).selectOption("la");
  assert.equal(await page.locator(".aoOfLanguage").count(),1);
  await page.screenshot({path:resolve(OUT,width+"-compline-la.png"),
   animations:"disabled",fullPage:false});
  receipt.screenshots.push(width+"-compline-la.png");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-
   document.documentElement.clientWidth);
  assert.ok(overflow<=2,"horizontal overflow "+overflow+" at "+width);
  // Exact 28 November civil date is not 29 November Office on First Vespers.
  await page.locator("#reader .aoOfOptions select").first().selectOption("VESPERS");
  await page.getByRole("button",{name:"Read source preview"}).click();
  await waitReady(page);
  assert.match(await page.locator(".aoOfReadiness").innerText(),
   /civil 2026-11-28 · Office 2026-11-29 · 38 source events/);
  await page.locator("#reader .aoOfOptions select").nth(1).selectOption("laen");
  assert.equal(await page.locator(".aoOfLanguage").count(),2);
  await page.screenshot({path:resolve(OUT,width+"-vespers-laen.png"),
   animations:"disabled",fullPage:false});
  receipt.screenshots.push(width+"-vespers-laen.png");
  const otherOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-
   document.documentElement.clientWidth);
  assert.ok(otherOverflow<=2,"Vespers overflow "+otherOverflow+" at "+width);
  assert.equal(errors.length,0,"uncaught page errors: "+errors.join(" | "));
  assert.ok(seen.size>=22,"real bounded source fixture requests did not occur");
  receipt.scenarios.push({width,complineEvents:42,vespersEvents:38,
   civilOfficeDateSeparation:true,modes:["la","laen","lafr"],
   sourceReads:seen.size,passed:true});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(),hits=await stubSources(page,{dropFrenchPsalm:true});
 await page.goto(url,{waitUntil:"domcontentloaded"});
 await page.locator('input[type="date"]').fill("2026-12-03");
 await page.getByRole("button",{name:"Read source preview"}).click();
 await waitWithheld(page);
 assert.equal(await page.locator(".aoOfLanguage").count(),0);
 receipt.scenarios.push({case:"truncated-French-source",noTextRendered:true,
  requests:hits.size,passed:true});
 await context.close();
 receipt.success=true;
}finally{
 await writeFile(resolve(OUT,"acceptance-receipt.json"),
  JSON.stringify(receipt,null,2)+"\n");
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
assert.equal(receipt.success,true);
process.stdout.write(JSON.stringify(receipt,null,2)+"\n");
