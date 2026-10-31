// Browser-local editorial utility smoke test. Commons requests are MOCKED:
// this proves the subject-bound query and export workflow, NOT live API uptime.
import assert from "node:assert/strict";
import {readFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/explore-sacred-subject-finder");
await mkdir(output,{recursive:true});
const viewports=[{width:320,height:720},{width:390,height:844}];
let browser;let tests=0;
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of viewports){
  const page=await browser.newPage({viewport,deviceScaleFactor:1,reducedMotion:"reduce",acceptDownloads:true});
  const queries=[];
  await page.route("**/w/api.php?**",route=>{
   const url=new URL(route.request().url());
   queries.push(url.searchParams.get("gsrsearch"));
   assert.equal(url.searchParams.get("gsrnamespace"),"6");
   assert.equal(url.searchParams.get("origin"),"*");
   const data={query:{pages:{
    11:{pageid:11,title:"File:Knock Apparition Gable Photo.jpg",
      imageinfo:[{mime:"image/jpeg",width:1200,height:850,
       thumburl:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/v40AAAAASUVORK5CYII=",
       url:"https://upload.wikimedia.org/wikipedia/commons/0/00/Knock_Apparition_Gable.jpg",
       extmetadata:{LicenseShortName:{value:"CC BY-SA 4.0"},Artist:{value:"Test Commons Artist"}}}]},
    12:{pageid:12,title:"File:Wrong Knock souvenir.jpg",
      imageinfo:[{mime:"image/jpeg",width:700,height:700,
       thumburl:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/v40AAAAASUVORK5CYII=",
       url:"https://upload.wikimedia.org/wikipedia/commons/0/00/Knock_Souvenir.jpg",
       extmetadata:{LicenseShortName:{value:"CC BY-SA 4.0"},Artist:{value:"Test Artist"}}}]}
   }}};
   return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(data),
     headers:{"Access-Control-Allow-Origin":"*"}});
  });
  await page.goto("file://"+root+"/tools/precise-sacred-subject-photo-finder.html",
   {waitUntil:"load",timeout:30000});
  await page.waitForSelector("#subjectButtons button.active");
  assert.match(await page.locator("#subjectTitle").textContent(),/Original apparition gable/i);
  await page.getByRole("button",{name:"Search Wikimedia Commons for this subject"}).click();
  await page.locator(".candidate").first().waitFor();
  assert.equal(queries.length,1);
  assert.match(queries[0],/Knock Shrine original apparition gable wall/i);
  assert(!/Knock Shrine photo$/i.test(queries[0]),"Generic Place-only search prohibited");
  await page.locator(".candidate").first().getByRole("button",{name:"Keep as proposal"}).click();
  assert.equal(await page.locator("#chosen .entry").count(),1);
  const exported=await Promise.all([
   page.waitForEvent("download"),
   page.getByRole("button",{name:"Export decisions JSON"}).click()
  ]);
  const path=await exported[0].path();
  const payload=JSON.parse(await readFile(path,"utf8"));
  const selected=payload.decisions["subject:focus:knock-original-gable"];
  assert.equal(selected.length,1);
  assert.equal(selected[0].identity_verified,false);
  assert.equal(selected[0].rights_verified,false);
  assert.equal(selected[0].editorial_approved,false);
  assert.equal(selected[0].published,false);
  tests+=5;
  await page.locator("#siteSearch").fill("");
  await page.locator("#siteFilter").selectOption("marianMissing");
  await page.waitForSelector("#siteSelect option");
  const missing=await page.locator("#siteSelect option").count();
  assert.equal(missing,110);
  assert.equal(await page.locator("#searchArea .searchButton").count(),0,
   "Marian site lacking a precise subject must not run a generic search");
  tests+=2;
  await page.screenshot({path:resolve(output,"subject-finder-"+viewport.width+".png"),fullPage:false,
   animations:"disabled"});
  await page.close();
 }
}finally{await browser?.close();}
console.log("Sacred exact subject Finder: "+tests+" browser workflow checks PASS, 320px/390px snapshots captured. Live Commons not asserted.");
