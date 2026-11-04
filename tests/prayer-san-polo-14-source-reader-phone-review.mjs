// Ephemeral visual QA of all fourteen source-verified San Polo photographs
// in the CURRENT source-owned Stations reader at 320/390 EN/FR.
// No production artwork registry, reader source, or published asset is modified.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,join,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(process.env.RUNNER_TEMP||"/tmp","san-polo-phone-review");
const art=JSON.parse(await readFile(join(root,"data/prayer/stations/san-polo-tiepolo-oils-1747/cc-by-sa-complete-series-release-candidate.v1.json"),"utf8"));
assert.equal(art.entries.length,14);
assert.equal(art.runtimeImageCount,0);
assert.equal(art.mobileQA,"UNVERIFIED");
assert.ok(art.entries.every(x=>x.productionEnabled===false));
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4298,"127.0.0.1",resolve)});
const report={schema:"AO_SAN_POLO_14_STAGE_PHONE_QA_V1",productionPublication:false,
 previewNature:"TEST_ONLY_IMAGE_INJECTION_IN_REAL_STATIONS_READER",
 languageCoverage:["en","fr"],widthCoverage:[320,390],stationCount:14,
 imagesChecked:0,viewportScreenshots:0,sourceTextChanged:false,results:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 for(const width of [320,390]){
  const height=width===320?720:844;
  const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB",reducedMotion:"reduce"});
  const page=await ctx.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message||e)));
  await page.goto("http://127.0.0.1:4298/index.html?aoPrayerPilot=0",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true,"Prayer host unavailable");
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations",{returnContext:null}));
  await page.locator("#aoPray435930.open .aoP435930Stations").waitFor({timeout:20000});
  assert.equal(await page.locator("#aoPray435930.open .aoP435930StationArtwork").count(),0,
    "Release-hold images must be absent from the REAL default reader");
  for(const lang of ["en","fr"]){
   const langButton=page.locator("#aoPray435930.open [data-p435930-session-language]");
   if(lang==="fr"){
    await langButton.click({timeout:10000});
    assert.equal(await langButton.getAttribute("lang"),"fr","Native session switch must select French");
   }else{
    assert.equal(await langButton.getAttribute("lang"),"en","Reader unexpectedly started in French");
   }
   const navBefore=await page.locator("#aoPray435930.open .aoP435930Stations").innerText();
   assert.ok(navBefore.includes(lang==="fr"?"Chemin de Croix":"Stations of the Cross")||
             await page.locator("#aoPray435930.open .aoP435930StationRail button").count()===14);
   for(let n=1;n<=14;n++){
    const row=art.entries[n-1],zero=n-1;
    const selector="#aoPray435930.open [data-p435930-station-step='"+zero+"']";
    const btn=page.locator(selector);
    // Use an actual hit-tested click, not a fake mutation of STATIONS.step.
    await btn.click({timeout:12000});
    const stage=page.locator("#aoPray435930.open [data-ao-devo-card='station-"+n+"']");
    await stage.waitFor({timeout:12000});
    const card=stage.locator(".aoDevoCardScroll");
    assert.equal(await card.count(),1,"Reader stage missing source-owned content");
    assert.ok((await card.innerText()).length>100,"Source-backed prayer text missing for Station "+n);
    assert.equal(await page.locator("#aoPray435930.open .aoP435930StationArtwork").count(),0,
     "Canonical runtime unexpectedly published source-only artwork");
    await page.evaluate(({n,row,lang})=>{
     const scroll=document.querySelector("#aoPray435930.open [data-ao-devo-card='station-"+n+"'] .aoDevoCardScroll");
     if(!scroll)throw Error("Cannot reach actual Stations reader");
     const figure=document.createElement("figure");
     figure.className="aoP435930StationArtwork";
     figure.setAttribute("data-ao-test-only-image","not-published");
     const img=document.createElement("img");
     img.src=row.localPublicAsset;
     img.alt=lang==="fr"?"Reproduction en cours de vérification, station "+n:"Unpublished review image, Station "+n;
     img.loading="eager";img.decoding="sync";
     const caption=document.createElement("figcaption");
     const title=document.createElement("span");
     title.textContent="Giandomenico Tiepolo · "+row.subject;
     caption.append(title,document.createTextNode(" · Photograph: "+row.photographer+" · "));
     const link=document.createElement("a");link.href=row.sourceFilePage;link.target="_blank";link.rel="noopener noreferrer";link.textContent=lang==="fr"?"Fichier source":"Source file";
     const license=document.createElement("a");license.href=row.photoLicenseURL;license.target="_blank";license.rel="noopener noreferrer";license.textContent="CC BY-SA 4.0";
     caption.append(link,document.createTextNode(" · "),license,document.createTextNode(" · Resized JPEG to WebP"));
     figure.append(img,caption);
     scroll.prepend(figure);
     scroll.scrollTop=0;
    },{n,row,lang});
    const injected=stage.locator("[data-ao-test-only-image='not-published']");
    const image=injected.locator("img");
    await page.waitForFunction(({n,w,h})=>{
      const img=document.querySelector("#aoPray435930.open [data-ao-devo-card='station-"+n+"'] [data-ao-test-only-image] img");
      return !!img?.complete&&img.naturalWidth===w&&img.naturalHeight===h;
    },{n,w:row.nativePixelDimensions[0],h:row.nativePixelDimensions[1]},{timeout:20000});
    await injected.scrollIntoViewIfNeeded();
    const geom=await injected.evaluate(el=>{
      const img=el.querySelector("img"),scroll=el.closest(".aoDevoCardScroll");
      const rect=img.getBoundingClientRect(),owner=scroll.getBoundingClientRect();
      return {natural:[img.naturalWidth,img.naturalHeight],rendered:[rect.width,rect.height],
        card:[owner.width,owner.height],viewport:innerWidth,
        bodyWidth:document.documentElement.scrollWidth,
        caption:el.querySelector("figcaption")?.textContent?.length,
        photoFitsCard:rect.left>=owner.left-3&&rect.right<=owner.right+3,
        anchorCount:el.querySelectorAll("figcaption a[href^='https://']").length};
    });
    assert.equal(geom.natural[0],row.nativePixelDimensions[0]);
    assert.equal(geom.natural[1],row.nativePixelDimensions[1]);
    assert.ok(geom.rendered[0]>40&&geom.rendered[1]>40,"Preview image invisible or clipped: "+n);
    assert.ok(geom.photoFitsCard,"Photo overflows reader card: "+JSON.stringify(geom));
    assert.ok(geom.bodyWidth<=width+3,"Horizontal phone overflow: "+JSON.stringify(geom));
    assert.ok(geom.anchorCount===2&&geom.caption>85,"Source and licensed photograph credits missing");
    const name=lang+"-"+width+"-station-"+String(n).padStart(2,"0")+".png";
    await page.screenshot({path:join(out,name),animations:"disabled"});
    const detail=lang+"-"+width+"-station-"+String(n).padStart(2,"0")+"-figure.png";
    await injected.screenshot({path:join(out,detail),animations:"disabled"});
    report.imagesChecked++;
    report.viewportScreenshots++;
    report.results.push({station:n,language:lang,width,viewportScreenshot:name,figureScreenshot:detail,
      imageDimensions:row.nativePixelDimensions,geometry:geom,
      manualVisualApproval:false,productionEnabled:false});
   }
  }
  await ctx.close();
  // Non-application injected figures cannot be retained across browser sessions.
 }
 assert.equal(report.imagesChecked,56);
 assert.ok(report.results.every(x=>x.productionEnabled===false&&!x.manualVisualApproval));
 console.log("SAN_POLO_PHONE_PREVIEW_PASS: 14 stages x 2 languages x 2 widths = 56 test-only previews, zero live images");
}catch(error){
 report.errors.push(String(error?.stack||error));
 throw error;
}finally{
 try{if(browser)await browser.close()}catch{}
 await new Promise(resolve=>server.close(resolve));
 await writeFile(join(out,"phone-qa-evidence.json"),JSON.stringify(report,null,2)+"\n");
}
