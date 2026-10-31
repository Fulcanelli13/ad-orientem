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
  // Offline controlled run: all but the first source have prior checkpoints.
  // No Commons requests and no actual image bytes are needed in this mocked test.
  await page.evaluate(()=>{
   const x=MASTER.items[0];
   for(const item of MASTER.items){
    cached[item.id]={
     stage:item.id===x.id?"PINNED_CHECKED":item.pinned?"PINNED_CHECKED":"NO_SAFE_LEAD",
     candidate:item.id===x.id?{
      title:"File:Apparition Chapel with Stained Window.jpg",
      page:"https://commons.wikimedia.org/wiki/File:Apparition_Chapel_with_Stained_Window.jpg",
      thumb:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/mock.png",
      sha1:item.pinned.sha1,author:"KnockShrine",lic:"CC BY-SA 4.0",
      licurl:"https://creativecommons.org/licenses/by-sa/4.0/",width:4035,height:3163,
      eligible:true,source_identity_verified:false,underlying_rights_cleared:false,publication_approved:false
     }:null
    };
   }
   window.JSZip=class{
    constructor(){this.items={}}
    file(name,value){this.items[name]=value;return this}
    async generateAsync(){return new Blob([JSON.stringify(Object.keys(this.items))],{type:"application/zip"})}
   };
   save();render();
  });
  await page.route("https://upload.wikimedia.org/**",route=>route.fulfill({
    status:200,contentType:"image/png",
    body:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/v40AAAAASUVORK5CYII=","base64")
  }));
  await page.locator("#contact").fill("testing@example.com");
  const [zip]=await Promise.all([page.waitForEvent("download"),page.locator("#start").click()]);
  const files=JSON.parse(await readFile(await zip.path(),"utf8"));
  assert(files.includes("source_attribution_and_sha256.csv"));
  assert(files.includes("unresolved_sources.csv"));
  assert(files.includes("research_status.json"));
  assert(files.some(x=>x.startsWith("research_photos/")));
  assert.match(await page.locator("#status").textContent(),/ZIP generated: 1 candidate/);
  assert.equal(errors.length,0,"Browser JS console errors");
  if(viewport.width===390)await page.screenshot({path:resolve(artifacts,"atlas-object-retriever-phone.png"),fullPage:false});
  await page.close();
 }
 console.log("PASS: 247-source UI, KEEP filter, offline report, mock one-click retrieval and attribution ZIP, responsive phone/desktop");
}finally{await browser?.close()}
