import assert from "node:assert/strict";
import {readFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const artifacts=resolve(root,"artifacts/atlas-object-retriever");
await mkdir(artifacts,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
  const page=await browser.newPage({viewport,acceptDownloads:true});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route("https://cdnjs.cloudflare.com/**",route=>route.fulfill({status:200,contentType:"text/javascript",body:""}));
  await page.goto("file://"+root+"/tools/sacred-atlas-objects-bulk-retriever.html",{waitUntil:"load"});
  assert.equal(await page.locator("#countTotal").textContent(),"247");
  assert.equal(await page.locator("#countPinned").textContent(),"68");
  assert.equal(await page.locator(".card").count(),55);
  await page.locator("#filter").selectOption("keep");
  assert.match(await page.locator("#shown").textContent(),/20 matching targets/);
  await page.locator("#filter").selectOption("all");
  await page.locator("#start").click();
  assert.match(await page.locator("#status").textContent(),/Enter a valid contact email/);
  const [dl]=await Promise.all([page.waitForEvent("download"),page.locator("#report").click()]);
  const payload=JSON.parse(await readFile(await dl.path(),"utf8"));
  assert.equal(payload.records.length,247);
  assert.equal(payload.records.filter(x=>x.keep).length,20);
  assert.equal(payload.apparition_contexts.length,33);
  assert(payload.records.every(x=>!x.published&&!x.rights));
  assert(!JSON.stringify(payload).includes("testing@example.com"));
  // Regression: the earlier customer report had 59 Commons thumbnail-domain
  // candidates plus 4 upload-domain candidates. Both approved Wikimedia
  // serving hosts must enter the archive. Importing the report must not search.
  const prior=JSON.parse(JSON.stringify(payload));
  const pinned=prior.records.filter(x=>x.pinned).slice(0,2);
  pinned.forEach((x,k)=>{
    x.acquisition={
      stage:"PINNED_CHECKED",
      candidate:{
        title:x.pinned.title,page:x.pinned.page,
        thumb:k===0
          ?"https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/thumbnail-mock.jpg/1600px-thumbnail-mock.jpg"
          :"https://upload.wikimedia.org/wikipedia/commons/8/8a/direct-mock.jpg",
        original:x.pinned.original,sha1:x.pinned.sha1,
        author:x.pinned.author,lic:x.pinned.lic,licurl:x.pinned.licurl,
        width:x.pinned.width,height:x.pinned.height,eligible:true,
        source_identity_verified:false,underlying_rights_cleared:false,publication_approved:false
      }
    };
  });
  await page.locator("#restore").setInputFiles({
    name:"AO_Sacred_Atlas_Object_Research_247.json",mimeType:"application/json",
    buffer:Buffer.from(JSON.stringify(prior))
  });
  assert.match(await page.locator("#status").textContent(),/Imported 2 of 247 saved source records/);
  const result=await page.evaluate(()=>({
    titles:MASTER.items.filter(x=>chosen(x)?.eligible).map(x=>chosen(x).title),
    keep:MASTER.items.filter(x=>x.keep).length
  }));
  assert.equal(result.titles.length,2);
  assert.equal(result.keep,20);
  await page.evaluate(()=>{
    window.JSZip=class{
      constructor(){this.items={}}
      file(name,value){this.items[name]=value;return this}
      async generateAsync(){
        return new Blob([JSON.stringify(Object.keys(this.items))],{type:"application/zip"});
      }
    };
    render();
  });
  let imagesFetched=0;
  const serve=route=>{
    imagesFetched++;
    return route.fulfill({
      status:200,contentType:"image/png",
      headers:{"Access-Control-Allow-Origin":"*"},
      body:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC0lEQVR42mP8/x8AAwMCAO+/v40AAAAASUVORK5CYII=","base64")
    });
  };
  await page.route("https://upload.wikimedia.org/**",serve);
  await page.route("https://thumb.wikimedia.org/**",serve);
  await page.locator("#contact").fill("testing@example.com");
  const [zip]=await Promise.all([page.waitForEvent("download"),page.locator("#zip").click()]);
  const files=JSON.parse(await readFile(await zip.path(),"utf8"));
  assert(files.includes("source_attribution_and_sha256.csv"));
  assert(files.includes("unresolved_sources.csv"));
  assert(files.includes("research_status.json"));
  assert(files.some(x=>x.startsWith("research_photos/")));
  assert.match(await page.locator("#status").textContent(),/ZIP generated: 2\/2 eligible candidate photos/);
  assert.equal(imagesFetched,2,"Both Wikimedia image hosts must be downloaded");
  assert.equal(files.filter(x=>x.startsWith("research_photos/")).length,2);
  assert.equal(errors.length,0,"Browser JS console errors");
  if(viewport.width===390)await page.screenshot({path:resolve(artifacts,"atlas-object-retriever-phone.png"),fullPage:false});
  await page.close();
 }
 console.log("PASS: 247-source UI, KEEP filter, offline report, mock one-click retrieval and attribution ZIP, responsive phone/desktop");
}finally{await browser?.close()}
