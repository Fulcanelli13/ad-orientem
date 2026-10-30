/* Real Chromium acceptance for one private First Vespers, no Compline or public routes. */
import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
const ROOT=resolve(fileURLToPath(new URL("..",import.meta.url)));
const OUT=resolve(ROOT,"artifacts/office-advent-i-vespers-focused");
await mkdir(OUT,{recursive:true});
const fixtures={};
for(const lang of ["la","en","fr"]){
 fixtures[lang]=JSON.parse(readFileSync(new URL(
  "../tests/fixtures/office/advent-i-preview-"+lang+".json",import.meta.url),"utf8"));
 assert.equal(fixtures[lang].revision,PIN);
}
const ordinary=readFileSync(new URL("../tests/fixtures/office/advent-i-preview-ordinary.txt",
 import.meta.url),"utf8");
const witness=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-universal-commemoration.json",
 import.meta.url),"utf8"));
assert.equal(witness.calendarScope,"UNIVERSAL_ONLY");
const sourceRoot="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/";
const locale={Latin:"la",English:"en",Francais:"fr"};
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".txt":"text/plain; charset=utf-8"};
function sourceFixture(url){
 assert.ok(url.startsWith(sourceRoot),"pinned revision only");
 const path=decodeURIComponent(url.slice(sourceRoot.length));
 if(path==="Ordinarium/Vespera.txt")return ordinary;
 const m=/^(Latin|English|Francais)\/(.+)\.txt$/u.exec(path);
 if(!m)throw Error("UNKNOWN_LANG_OR_PATH:"+path);
 const f=fixtures[locale[m[1]]],id=m[2];
 if(Object.hasOwn(f.leaves,id))return f.leaves[id];
 if(!Object.hasOwn(f.sections,id))throw Error("UNKNOWN_SOURCE:"+id);
 return Object.entries(f.sections[id]).map(([name,rows])=>
  "["+name+"]\n"+rows.join("\n")).join("\n\n")+"\n";
}
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(ROOT,"."+pathname);
  if(file!==ROOT&&!file.startsWith(ROOT+sep)){
   res.writeHead(403);res.end("forbidden");return;
  }
  const raw=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});
  res.end(raw);
 }catch(error){
  res.writeHead(error?.code==="ENOENT"?404:500);
  res.end(String(error?.message??error));
 }
});
await new Promise((ok,reject)=>{
 server.once("error",reject);server.listen(0,"127.0.0.1",ok);
});
const previewURL="http://127.0.0.1:"+server.address().port+
 "/previews/advent-i-first-vespers-2026-research.html";
const receipt={schema:"ao.office.first-vespers-focused-chromium.v1",
 sourceRevision:PIN,publicRouteEnabled:false,published:false,
 screenshots:[],scenarios:[],success:false};
const save=async(page,name)=>{
 await page.screenshot({path:resolve(OUT,name+".png"),fullPage:false,
  animations:"disabled"});
 receipt.screenshots.push(name+".png");
};
async function mock(page,{dropFrenchCollect=false}={}){
 const hits=new Set();
 await page.route("https://raw.githubusercontent.com/**",async route=>{
  const url=route.request().url();hits.add(url);
  try{
   let body=sourceFixture(url);
   if(dropFrenchCollect&&url.includes("/Francais/Tempora/Adv1-0.txt"))
    body=body.replace(/\[Oratio\][\s\S]*?(?=\n\[|$)/u,"");
   await route.fulfill({status:200,
    headers:{"access-control-allow-origin":"*"},
    body,contentType:"text/plain"});
  }catch(error){
   await route.fulfill({status:404,
    headers:{"access-control-allow-origin":"*"},
    body:String(error?.message??error)});
  }
 });
 return hits;
}
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const viewport of [{width:390,height:844},{width:320,height:700},
  {width:1440,height:900}]){
  const context=await browser.newContext({viewport,
   isMobile:viewport.width<500,hasTouch:viewport.width<500,
   deviceScaleFactor:viewport.width<500?2:1});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const hits=await mock(page);
  await page.goto(previewURL,{waitUntil:"domcontentloaded",timeout:45000});
  await page.locator("#reader").waitFor({state:"visible",timeout:45000});
  assert.match(await page.locator("#status").innerText(),
   /Source-first research preview/);
  assert.equal(await page.locator("#office-date").inputValue(),"2026-11-28");
  assert.equal(await page.locator("#office-hour").inputValue(),"VESPERS");
  assert.equal(await page.locator("#bar").getAttribute("aria-valuemax"),"87");
  assert.equal(hits.size,22,"one original bounded source session");
  const overflow=await page.evaluate(()=>
   document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=1,"overflow "+overflow+" at "+viewport.width);
  await save(page,String(viewport.width)+"-vespers-opening");
  await page.locator('[data-mode="en"]').click();
  assert.match(await page.locator("#card").innerText(),/English/);
  await page.locator('[data-mode="la"]').click();
  assert.doesNotMatch(await page.locator("#card").innerText(),/Français|English/);
  await page.locator('[data-mode="fr"]').click();
  await page.locator('[data-view="whole"]').click();
  assert.equal(await page.locator("#bar").getAttribute("aria-valuemax"),"38");
  if(viewport.width===1440){
   const names=new Set();
   for(let i=0;i<38;i++){
    names.add(await page.locator("#card h2").innerText());
    if(i<37)await page.locator("#next").click();
   }
   assert.equal(await page.locator("#next").isDisabled(),true);
   assert.ok([...names].some(x=>/Magnificat/.test(x)));
   assert.ok([...names].some(x=>/collect/i.test(x)));
   assert.ok([...names].some(x=>/Benedicamus/i.test(x)));
   assert.ok([...names].some(x=>/Dismissal/i.test(x)));
   await save(page,"1440-vespers-conclusion");
  }
  await page.locator("#office-hour").selectOption("COMPLINE");
  assert.equal(await page.locator("#reader").isHidden(),true);
  assert.match(await page.locator("#status").innerText(),/Not yet implemented/);
  await page.locator("#office-hour").selectOption("VESPERS");
  await page.locator("#reader").waitFor({state:"visible",timeout:5000});
  await page.locator("#office-date").fill("2026-11-29");
  await page.locator("#office-date").dispatchEvent("change");
  assert.equal(await page.locator("#reader").isHidden(),true);
  await page.locator("#office-date").fill("2026-11-28");
  await page.locator("#office-date").dispatchEvent("change");
  await page.locator("#reader").waitFor({state:"visible",timeout:5000});
  assert.equal(hits.size,22,"date control must reuse cached pinned sources");
  assert.deepEqual(errors,[]);
  receipt.scenarios.push({width:viewport.width,passed:true,
   sourceEvents:38,focusSteps:87,sourceFiles:22,
   unsupportedDatesFailClosed:true});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 await mock(page,{dropFrenchCollect:true});
 await page.goto(previewURL,{waitUntil:"domcontentloaded",timeout:45000});
 await page.locator("#status.error").waitFor({state:"visible",timeout:45000});
 assert.equal(await page.locator("#reader").isHidden(),true);
 assert.match(await page.locator("#status").innerText(),/Source preview withheld/);
 receipt.scenarios.push({case:"missing-French-collect",passed:true,
  allPrayerCardsWithheld:true});
 await context.close();
 receipt.success=true;
}finally{
 await writeFile(resolve(OUT,"acceptance-receipt.json"),
  JSON.stringify(receipt,null,2)+"\n");
 await browser.close();server.close();
}
assert.equal(receipt.success,true);
process.stdout.write(JSON.stringify(receipt,null,2)+"\n");
