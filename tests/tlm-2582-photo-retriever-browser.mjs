import assert from "node:assert/strict";
import {readFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const artifacts=resolve(root,"artifacts/tlm-worldwide-retriever");
await mkdir(artifacts,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
  const page=await browser.newPage({viewport,acceptDownloads:true});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  await page.route("https://cdnjs.cloudflare.com/**",route=>route.fulfill({status:200,contentType:"application/javascript",body:""}));
  await page.goto("file://"+root+"/tools/directory/tlm-worldwide-photo-retriever.html",{waitUntil:"load"});
  assert.equal(await page.locator("#total").textContent(),"2,582");
  await page.locator("#scope").selectOption("diocesan");
  assert.equal(await page.locator("#total").textContent(),"587");
  await page.locator("#scope").selectOption("ready");
  assert.equal(await page.locator("#total").textContent(),"69");
  await page.locator("#batch").selectOption("50");
  let first=await page.evaluate(()=>{
   const all=pool().slice(0,50);
   for(const item of all.slice(1))saved[item.id]={searched:true,status:"NO_COMMONS_MATCH",candidates:[],packaged:false};
   save();refresh();
   return {id:all[0].id,name:all[0].name,loc:locality(all[0])}
  });
  let queries=0;
  await page.route("https://commons.wikimedia.org/w/api.php**",route=>{
   queries++;
   const title="File:"+first.name+" "+first.loc+" church.jpg";
   const data={query:{pages:[{title,imageinfo:[{url:"https://upload.wikimedia.org/wikipedia/commons/a/aa/test.jpg",
    thumburl:"https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/test.jpg/1600px-test.jpg",
    width:2200,height:1700,mime:"image/jpeg",sha1:"a".repeat(40),
    extmetadata:{LicenseShortName:{value:"CC BY 4.0"},LicenseUrl:{value:"https://creativecommons.org/licenses/by/4.0"},
    Artist:{value:"Test Photographer"}}}]}]}};
   return route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Api-User-Agent"},body:JSON.stringify(data)});
  });
  let photoFetches=0;
  await page.route("https://thumb.wikimedia.org/**",route=>{photoFetches++;return route.fulfill({status:200,contentType:"image/jpeg",headers:{"Access-Control-Allow-Origin":"*"},body:Buffer.from("fakedownloadedimage")})});
  await page.evaluate(()=>{window.JSZip=class{constructor(){this.files={}}file(name,data){this.files[name]=data;return this}async generateAsync(){return new Blob([JSON.stringify(Object.keys(this.files))],{type:"application/zip"})}};});
  await page.locator("#next").click();
  assert.match(await page.locator("#status").textContent(),/Enter your email/);
  await page.locator("#email").fill("testing@example.com");
  const [dl]=await Promise.all([page.waitForEvent("download",{timeout:40000}),page.locator("#next").click()]);
  const files=JSON.parse(await readFile(await dl.path(),"utf8"));
  assert(files.includes("source_attribution_and_sha256.csv"));assert(files.includes("all_research_records.json"));
  assert(files.includes("unresolved_sources.json"));assert(files.some(x=>x.startsWith("research_photos/")));
  assert.equal(photoFetches,1);assert(queries>=1);
  assert.equal(await page.locator("#processed").textContent(),"50");
  const [exported]=await Promise.all([page.waitForEvent("download"),page.locator("#export").click()]);
  const json=JSON.parse(await readFile(await exported.path(),"utf8"));
  assert.equal(json.records.length,2582);
  assert(!JSON.stringify(json).includes("testing@example.com"));
  assert.equal(json.records.find(x=>x.id===first.id).acquisition.packaged,true);
  assert.equal(errors.length,0,errors.join("\n"));
  if(viewport.width===390)await page.screenshot({path:resolve(artifacts,"tlm-retriever-phone.png")});
  await page.close();
 }
 console.log("PASS: browser phone/desktop 2582 corpus, diocesan gate, email validation, mocked Wikimedia retrieval, thumb ZIP, 50-site resume checkpoint, email-free JSON.");
}finally{await browser?.close()}