import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {renderVerifiedStationArtwork,SAN_POLO_PUBLISHED_STATIONS} from "../src/pray/stations-verified-artwork-release.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/pray-san-polo-14-native-phone");
const manifest=JSON.parse(readFileSync(resolve(root,
 "data/prayer/stations/san-polo-tiepolo-oils-1747/cc-by-sa-complete-series-release-candidate.v1.json"),"utf8"));
const attribution=readFileSync(resolve(root,"assets/stations/san-polo/LICENSE-ATTRIBUTION.md"),"utf8");
const report={
 schema:"ao.pray.san-polo-14.actual-reader-mechanical-qa.v1",
 scope:"NON_PUBLISHING_PREVIEW_IN_REAL_STATIONS_READER__NOT_OWNER_ART_CROP_SIGNOFF",
 sourceHead:"GITHUB_CHECKOUT",
 mechanical:{fileHashes:0,uniqueImages:0,decodedSizes:0,phoneStates:0,screenshots:0},
 flags:{nativeVisualManualReview:"PENDING",cropColourEditorial:"PENDING",productionActivation:"FORBIDDEN_IN_THIS_PR"},
 cases:[],errors:[]
};
assert.equal(manifest.assetCount,14);
assert.equal(manifest.entries.length,14);
assert.equal(manifest.licensing.scopedExceptionAuthorized,true);
assert.equal(manifest.licensing.exceptionNotGeneralized,true);
assert.equal(manifest.runtimeImageCount,0);
assert.equal(Object.keys(SAN_POLO_PUBLISHED_STATIONS).length,0,"Production stations must remain unaltered");
assert.match(attribution,/Didier Descouens/);
assert.match(attribution,/CC BY-SA 4\.0/);
const seen=new Set();
for(const [i,row] of manifest.entries.entries()){
 const n=i+1,stem="station-"+String(n).padStart(2,"0")+".webp";
 assert.equal(row.station,n);
 assert.equal(row.localPublicAsset,"/assets/stations/san-polo/"+stem);
 assert.match(row.sourceFilePage,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.equal(row.sourcePhotographLicense,"CC BY-SA 4.0");
 assert.equal(row.productionEnabled,false);
 assert.equal(row.productionPolicyExceptionAuthorized,true);
 assert.equal(row.previouslyApprovedArtworkPreserved,true);
 assert.equal(row.originalFilePixelLevelReview,"NOT_YET_CERTIFIED");
 assert.equal(row.mobileRun,"PENDING");
 const original=readFileSync(resolve(root,row.repositoryOriginal));
 const publicBytes=readFileSync(resolve(root,"assets/stations/san-polo",stem));
 assert.equal(Buffer.compare(original,publicBytes),0,"Archive/production byte parity station "+n);
 assert.equal(createHash("sha256").update(publicBytes).digest("hex"),row.sha256);
 assert.ok(!seen.has(row.sha256),"Repeated photograph station "+n);seen.add(row.sha256);
 assert.equal(renderVerifiedStationArtwork(i,false),"","Unapproved default image must not become public");
 report.mechanical.fileHashes++;
}
report.mechanical.uniqueImages=seen.size;

// This registry exists ONLY in this local browser test. It is never written into
// the source-owned production registry or exposed by a query-parameter feature flag.
function qaPreviewRecord(row){
 return {
  station:row.station,editorialStatus:"USER_APPROVED",exactPaintingIdentityVerified:true,
  artworkUserPlacementVerified:true,nativePhotoVerified:true,photoArchiveHashVerified:true,
  visualFrameCropColourVerified:true,mobileReaderQACompleted:true,
  productionReleaseApproved:true,rightsClass:"CC_BY_SA_4_0",
  exactPhotoLicenseVerified:true,explicitScopedPolicyException:true,
  shareAlikeNoticeIncluded:true,productionAssetURL:row.localPublicAsset,
  sourceFilePage:row.sourceFilePage,photoLicenseURL:row.photoLicenseURL,
  photoLicenseLabel:"CC BY-SA 4.0",workArtist:"Giandomenico Tiepolo",
  workTitle:row.subject,photographer:row.photographer,
  modifications:"JPEG resized/recompressed and converted to WebP"
 };
}
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const full=resolve(root,"."+name);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",
   reducedMotion:"reduce",locale:"en-GB"});
  const page=await ctx.newPage();
  const exceptions=[];
  page.on("pageerror",e=>exceptions.push(String(e?.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",
    null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",
    null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations",
    {returnContext:null})),true);
   const rootSel="#aoPray435930.open";
   const langButton=page.locator(rootSel+" .aoP435930SessionLanguage");
   for(const ui of ["en","fr"]){
    if(ui==="fr"){
     await langButton.click();
     await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930SessionLanguage")?.textContent?.trim()==="FR",null,{timeout:10000});
     assert.match(await page.locator(rootSel).innerText(),/Chemin de Croix/i,
      "The actual Stations reader must display French, not only a switched control");
    }
    for(const row of manifest.entries){
     const number=row.station;
     await page.locator(rootSel+" [data-p435930-station-step='"+(number-1)+"']").click({timeout:15000});
     const cardSel=rootSel+" .aoDevoCard[data-ao-devo-card='station-"+number+"']";
     await page.locator(cardSel).waitFor({state:"visible",timeout:15000});
     const scroll=page.locator(cardSel+" .aoDevoCardScroll");
     const before=await scroll.innerText();
     assert.ok(before.trim().length>30,"Original prayer body is missing before photo preview");
     assert.equal(await page.locator(cardSel+" [data-ao-station-artwork]").count(),0,
      "No unapproved live art should be visible before QA injection");
     const record=qaPreviewRecord(row);
     const evidence=await page.evaluate(async({index,french,record})=>{
      const module=await import("/src/pray/stations-verified-artwork-release.v1.js");
      const scroll=document.querySelector("#aoPray435930.open .aoDevoCardScroll");
      const html=module.renderVerifiedStationArtwork(index,french,{[index+1]:record});
      if(!html||!scroll)throw Error("QA render seam unavailable");
      scroll.insertAdjacentHTML("afterbegin",html);
      const fig=scroll.querySelector("[data-ao-station-artwork]");
      const img=fig.querySelector("img");
      await img.decode();
      const c=document.createElement("canvas");c.width=64;c.height=64;
      const cx=c.getContext("2d",{willReadFrequently:true});
      cx.drawImage(img,0,0,64,64);
      const pixels=cx.getImageData(0,0,64,64).data;
      let min=255,max=0,sum=0,sumSq=0;
      const palette=new Set();
      for(let k=0;k<pixels.length;k+=4){
       const R=pixels[k],G=pixels[k+1],B=pixels[k+2];
       const v=.2126*R+.7152*G+.0722*B;
       min=Math.min(min,v);max=Math.max(max,v);sum+=v;sumSq+=v*v;
       palette.add(((R>>5)<<6)|((G>>5)<<3)|(B>>5));
      }
      const pixelsCount=pixels.length/4,average=sum/pixelsCount;
      const imgRect=img.getBoundingClientRect(),figRect=fig.getBoundingClientRect();
      return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
       decoded:img.complete&&img.naturalWidth>0,displayWidth:imgRect.width,
       displayHeight:imgRect.height,figureWidth:figRect.width,
       sourceLinks:Array.from(fig.querySelectorAll("a[href]")).map(x=>x.href),
       caption:fig.querySelector("figcaption")?.innerText||"",
       alt:img.alt,
       objectFit:getComputedStyle(img).objectFit,
       documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
       figureOverflow:Math.max(0,fig.scrollWidth-fig.clientWidth),
       minLuminance:min,maxLuminance:max,luminanceSD:Math.sqrt(Math.max(0,sumSq/pixelsCount-average*average)),
       distinctQuantizedColors:palette.size,
       readerTextBeforePhoto:scroll.innerText.slice(0,140)};
     },{index:number-1,french:ui==="fr",record});
     assert.equal(evidence.decoded,true,"WebP decode failure Station "+number);
     assert.deepEqual([evidence.naturalWidth,evidence.naturalHeight],row.nativePixelDimensions,
      "Image dimensions differ from manifest Station "+number);
     assert.ok(evidence.displayWidth>80&&evidence.displayHeight>80,
      "Station photo is visually collapsed");
     assert.ok(evidence.documentOverflow<=2&&evidence.figureOverflow<=2,
      "Photo overflows actual reader "+width+"/"+ui+"/Station "+number);
     assert.equal(evidence.objectFit,"contain","Must show full artwork, not automatically crop");
     assert.match(evidence.alt,ui==="fr"?/^Chemin de Croix, station /:/^Stations of the Cross, Station /,
      "The artwork alt label must follow the reader language");
     assert.deepEqual(evidence.sourceLinks,[row.sourceFilePage,row.photoLicenseURL]);
     assert.match(evidence.caption,/Didier Descouens/);
     assert.match(evidence.caption,/CC BY-SA 4\.0/);
     assert.ok(evidence.distinctQuantizedColors>=15&&
       evidence.maxLuminance-evidence.minLuminance>=10,
       "Image may be blank or corrupt: Station "+number);
     if(ui==="en"){
      await page.locator(cardSel+" [data-ao-station-artwork]").scrollIntoViewIfNeeded();
      await page.screenshot({path:resolve(out,"station-"+String(number).padStart(2,"0")+"-"+width+"-en.png"),
       animations:"disabled"});
      report.mechanical.screenshots++;
     }
     await page.locator(cardSel+" [data-ao-station-artwork]").evaluate(node=>node.remove());
     assert.equal(await scroll.innerText(),before,"Photo QA changed canonical prayer text");
     assert.equal(await page.locator(cardSel+" [data-ao-station-artwork]").count(),0,
      "QA-only picture survived removal");
     report.mechanical.decodedSizes++;
     report.mechanical.phoneStates++;
     report.cases.push({station:number,width,ui,sha256:row.sha256,
      dimensions:[evidence.naturalWidth,evidence.naturalHeight],
      measured:{luminanceSD:+evidence.luminanceSD.toFixed(2),
       distinctQuantizedColors:evidence.distinctQuantizedColors,
       canvasRange:+(evidence.maxLuminance-evidence.minLuminance).toFixed(2)},
      actualReader:true,photoInsertion:"EPHEMERAL_QA_ONLY",
      originalPrayerBytesPreserved:true,productionImageActivated:false});
    }
   }
   assert.deepEqual(exceptions,[],"Unhandled runtime exceptions in Stations phone test");
  }catch(e){report.errors.push({width,details:String(e?.stack||e)});throw e;}
  finally{await ctx.close();}
 }
 assert.equal(report.mechanical.fileHashes,14);
 assert.equal(report.mechanical.phoneStates,56,"14 Stations × 2 widths × 2 UI languages");
 assert.equal(report.mechanical.screenshots,28);
 console.log("PASS 14/14 source photos, 56 real Stations reader preview states, 28 screenshots; no public activation");
}finally{
 await mkdir(out,{recursive:true});
 await writeFile(resolve(out,"san-polo-14-source-and-phone-qa.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
