// D2 authentic CC0 museum photo in the *current real Prayer discovery masonry*
// This never changes release registries. All images are injected in test DOM.
// Covers current no-crop 'contain' and two human-comparison crop variants.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {resolvePrayerEditorialArtwork} from "../src/pray/art-slot-map.v1.js";

assert.equal(resolvePrayerEditorialArtwork("DOOR-D2").state,"APPROVED_EXACT_PHOTO_PENDING");
assert.equal(resolvePrayerEditorialArtwork("DOOR-D5").state,"PUBLISHED_EXACT_PHOTO");
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const tmp=process.env.RUNNER_TEMP||"/tmp";
const original=resolve(tmp,"prayer-d2-native-private/d2-museum-original.jpg");
const out=resolve(tmp,"prayer-d2-gallery-phone-review");
const proof=JSON.parse(await readFile(resolve(out,"d2-native-source-evidence.json"),"utf8"));
assert.equal(proof.status,"NATIVE_MUSEUM_SOURCE_VERIFIED_NO_ART_APPROVAL");
await mkdir(out,{recursive:true});
const originalBytes=await readFile(original);
assert.equal(originalBytes.length,4353315);
const mime={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  if(pathname==="/__qa_cma_d2_original.jpg"){
   res.writeHead(200,{"content-type":"image/jpeg","cache-control":"no-store","x-ao-qa-only":"never-published"});
   return res.end(originalBytes);
  }
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const base="http://127.0.0.1:"+server.address().port;
const formats=[
 {id:"current-contain",fit:"contain",position:"50% 50%",nativeBehavior:true},
 {id:"compare-cover-center",fit:"cover",position:"50% 50%",nativeBehavior:false},
 {id:"compare-cover-upper",fit:"cover",position:"50% 28%",nativeBehavior:false}
];
const report={schema:"AO_PRAYER_D2_REAL_GALLERY_12_VARIANT_QA_V1",originalSourceSha256:proof.actualSha256,
 sourceBytes:proof.actualBytes,sourcePixels:proof.nativePixels,
 allProductionPhotosHeld:true,sourcePhotoApprovedForRelease:false,
 coverCandidates:formats.map(({id,fit,position,nativeBehavior})=>({id,fit,position,nativeBehavior})),
 widths:[320,390],languages:["en","fr"],captures:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block",locale:ui==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage();
  const pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
  try{
   await page.goto(base+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(language=>document.documentElement.lang===language,ui,{timeout:20000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   const baseSel="#aoPray435930.open",tile=page.locator(baseSel+' [data-ao-pray-pilot-tile="library"][data-ao-art-slot-id="DOOR-D2"]');
   await tile.waitFor({timeout:25000});
   assert.equal(await tile.getAttribute("data-ao-art-binding"),"editorial-pending","D2 would already be released; QA not applicable");
   assert.equal(await page.locator(baseSel+' [data-ao-art-binding="released"]').count(),1,"Never change the other eight publication states");
   // One actual tap reveals the title but does not navigate into the prayers.
   await tile.scrollIntoViewIfNeeded();
   await tile.click();
   assert.equal(await tile.getAttribute("aria-expanded"),"true");
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"home");
   await tile.evaluate(el=>{
    const symbol=el.querySelector(".aoPrayPilotTileSymbol");
    if(!symbol)throw Error("No native gallery image socket");
    symbol.replaceChildren();
    symbol.style.setProperty("display","grid","important"); // pending-card CSS uses !important; unlock only this test DOM
    symbol.style.width="100%";symbol.style.height="100%";symbol.style.inset="0";
    const img=document.createElement("img");
    img.className="aoPrayPilotReleasedTilePhoto";
    img.setAttribute("data-ao-private-qa-image","never-published");
    img.alt="";
    img.decoding="sync";img.loading="eager";
    // Explicit image box is essential: otherwise intrinsic JPEG dimensions make
    // contain/cover visually identical and deceptively hide cropping behind overflow.
    img.style.position="absolute";img.style.inset="0";
    img.style.width="100%";img.style.height="100%";img.style.maxHeight="none";
    img.src="/__qa_cma_d2_original.jpg";
    symbol.append(img);
   });
   await page.waitForFunction(()=>{
    const i=document.querySelector('#aoPray435930.open [data-ao-art-slot-id="DOOR-D2"] img[data-ao-private-qa-image]');
    return i?.complete&&i.naturalWidth===2720&&i.naturalHeight===3400;
   },null,{timeout:20000});
   for(const mode of formats){
    await tile.evaluate((el,m)=>{
     const img=el.querySelector("[data-ao-private-qa-image]");
     img.style.objectFit=m.fit;
     img.style.objectPosition=m.position;
     img.style.transform="none";
    },mode);
    await page.evaluate(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.scrollTo(0,0));
    await tile.scrollIntoViewIfNeeded();
    const geometry=await tile.evaluate(el=>{
     const photo=el.querySelector("img[data-ao-private-qa-image]");
     const tile=el.getBoundingClientRect(),img=photo.getBoundingClientRect();
     const caption=el.querySelector(".aoPrayPilotTileCaption");
     const captionStyle=getComputedStyle(caption),photoStyle=getComputedStyle(photo),symbolStyle=getComputedStyle(photo.parentElement);
     const iw=photo.naturalWidth,ih=photo.naturalHeight,tw=img.width,th=img.height;
     const scale=photoStyle.objectFit==="cover"?Math.max(tw/iw,th/ih):Math.min(tw/iw,th/ih);
     const visibleFraction=photoStyle.objectFit==="cover"?Math.min(1,(tw/scale)/iw)*Math.min(1,(th/scale)/ih):1;
     return {tile:[tile.width,tile.height],source:[iw,ih],fit:photoStyle.objectFit,position:photoStyle.objectPosition,
      imageRendered:[img.width,img.height],symbolDisplay:symbolStyle.display,visibleImageFraction:Math.round(visibleFraction*10000)/10000,
      title:caption?.querySelector("strong")?.textContent?.trim(),
      captionOpacity:Number(captionStyle.opacity),captionVisible:captionStyle.visibility,
      horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      routeOwner:el.dataset.p435930Family,publicationBinding:el.dataset.aoArtBinding};
    });
    assert.deepEqual(geometry.source,[2720,3400]);
    assert.ok(geometry.imageRendered[0]>=100&&geometry.imageRendered[1]>=100,"QA image is hidden; do not count blank cards as photo evidence: "+JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.imageRendered[0]-geometry.tile[0])<=2&&
      Math.abs(geometry.imageRendered[1]-geometry.tile[1])<=2,
      "QA image must occupy exactly the actual masonry tile before object-fit comparisons: "+JSON.stringify(geometry));
    assert.notEqual(geometry.symbolDisplay,"none","Painting container is hidden by editorial-pending CSS");
    assert.ok(geometry.visibleImageFraction>0&&geometry.visibleImageFraction<=1,"Visible painting fraction must be finite and positive");
    assert.equal(geometry.title,ui==="fr"?"Prières essentielles":"Essential Prayers");
    assert.equal(geometry.publicationBinding,"editorial-pending");
    assert.equal(geometry.captionVisible,"visible");
    assert.ok(geometry.captionOpacity>.95);
    assert.ok(geometry.horizontalOverflow<=2);
    if(mode.nativeBehavior){
     assert.equal(geometry.fit,"contain");
     assert.equal(geometry.visibleImageFraction,1,"No-crop option must retain complete original");
    }else{
     assert.equal(geometry.fit,"cover");
     assert.ok(geometry.visibleImageFraction<0.999,"Comparison crop must actually discard pixels; otherwise review cannot distinguish options");
    }
    const key="D2-"+ui+"-"+width+"-"+mode.id;
    const full=key+"-whole-gallery.png",detail=key+"-tile.png";
    await page.screenshot({path:resolve(out,full),animations:"disabled"});
    const tileBytes=await tile.screenshot({path:resolve(out,detail),animations:"disabled"});
    const tileHash=createHash("sha256").update(tileBytes).digest("hex");
    report.captures.push({key,language:ui,width,mode:mode.id,full,detail,tileScreenshotSha256:tileHash,geometry,
      artisticApproval:"PENDING",productionEnabled:false});
   }
   assert.deepEqual(pageErrors,[],"Browser error in "+width+"/"+ui);
  }finally{await ctx.close()}
 }
 assert.equal(report.captures.length,12);
 for(const width of [320,390])for(const language of ["en","fr"]){
  const candidates=report.captures.filter(x=>x.width===width&&x.language===language);
  assert.equal(candidates.length,3);
  assert.equal(new Set(candidates.map(x=>x.tileScreenshotSha256)).size,3,
   "Contain/cover-center/cover-upper tiles must show three VISUALLY DISTINCT treatments");
 }
 assert.ok(report.captures.every(x=>x.productionEnabled===false));
 console.log("D2_REAL_GALLERY_PHONE_QA_PASS",report.captures.length,"screens; contain/cover-center/cover-upper; 320/390 EN/FR; ZERO RELEASED");
}catch(e){report.errors.push(String(e?.stack||e));throw e}
finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
 await writeFile(resolve(out,"d2-gallery-phone-evidence.json"),JSON.stringify(report,null,2)+"\n");
}
