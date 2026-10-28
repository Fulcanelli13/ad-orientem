import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile,mkdir} from "node:fs/promises";
import http from "node:http";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {
 WAVE1_REVIEW_PHOTOS,wave1ArtworkFlag,angelusWave1PhotoMarkup,syncRosaryWave1Photo
} from "../src/pray/wave1-angelus-rosary-art-proof.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const folder=resolve(root,"artifacts/prayer-wave1-angelus-rosary-proof");
await mkdir(folder,{recursive:true});
const works=Object.entries(WAVE1_REVIEW_PHOTOS);
for(const [which,x] of works){
 assert.ok(x.masterSha256?.length===64,"missing pinned master "+which);
 for(const [name,expected] of [[x.small,x.smallSha256],[x.large,x.largeSha256]]){
  const file=await readFile(resolve(root,name));
  assert.equal(createHash("sha256").update(file).digest("hex"),expected,name+" drift");
 }
}
assert.equal(wave1ArtworkFlag("?aoPrayerArt=rosary-review","rosary"),true);
assert.equal(wave1ArtworkFlag("?aoPrayerArt=angelus-review","angelus"),true);
assert.equal(wave1ArtworkFlag("?aoPrayerArt=angelus-review","rosary"),false);
assert.equal(angelusWave1PhotoMarkup({}),"");
assert.equal(angelusWave1PhotoMarkup({search:"?aoPrayerArt=angelus-review",form:"regina"}),"");
assert.equal(angelusWave1PhotoMarkup({search:"?aoPrayerArt=angelus-review",step:1}),"");
assert.match(angelusWave1PhotoMarkup({search:"?aoPrayerArt=angelus-review",form:"angelus"}),/Champaigne/);
const source=await readFile(resolve(root,"src/pray/presentation-runtime.js"),"utf8");
assert.equal((source.match(/angelusWave1PhotoMarkup\(\{/g)||[]).length,1);
assert.equal((source.match(/syncRosaryWave1Photo\(r,\{/g)||[]).length,1);
assert.match(source,/if\(index!==0\)m\.querySelector/);
const style=await readFile(resolve(root,"src/pray/wave1-angelus-rosary-art-proof.js"),"utf8");
assert.match(style,/object-fit:contain/);
assert.doesNotMatch(style,/object-fit:cover/);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".svg":"image/svg+xml",
 ".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const buf=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(buf);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
const base="http://127.0.0.1:"+server.address().port+"/index.html";
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1440]){
  const mobile=width<600,height=width===320?720:mobile?844:900;
  for(const which of ["angelus","rosary"]){
   const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,
    deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block"});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(base+"?aoPrayerArt="+which+"-review",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>window.AO_PRAY_APP_V1.open()),true);
   let art,owner,sourceCount;
   if(which==="angelus"){
    assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null})),true);
    art=page.locator("#aoPray435930 [data-ao-wave1-photo=angelus]");
    await art.waitFor({timeout:20000});
    assert.equal(await page.locator("#aoPray435930 .aoP435930AngelusReader[data-ao-angelus-form=angelus]").count(),1,
      "test must be on the real Angelus prayer");
    assert.ok(await page.locator("#aoPray435930 .aoP435930AngelusSequence .aoP435930PrayerUnit").count()>=6,
      "Angelus prayer units were replaced");
    owner="#aoPray435930";
   }else{
    assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true);
    await page.locator("#aoPray435930 [data-p435930-rosary-begin]").click();
    const donor=page.locator("#aoPrayerBookRoot.open");
    await donor.waitFor({state:"visible",timeout:20000});
    await donor.locator(".aoRosaryPreparation").waitFor({state:"attached",timeout:16000});
    art=donor.locator("[data-ao-wave1-photo=rosary]");
    await art.waitFor({timeout:20000});
    assert.equal(await donor.locator(".pbShell>.lab-rosary-hero").count(),1,"Rosary chooser start was changed");
    assert.equal(await donor.locator(".aoRosaryPreparation").count(),1,"Rosary preferences were changed");
    const hierarchy=await donor.evaluate(r=>{
      const shell=r.querySelector(".pbShell");
      const nodes=[...shell.children];
      return [nodes.indexOf(shell.querySelector(".lab-rosary-hero")),
       nodes.indexOf(shell.querySelector(".aoRosaryPreparation")),
       nodes.indexOf(shell.querySelector("[data-ao-wave1-photo=rosary]"))];
    });
    assert.ok(hierarchy[0]>=0&&hierarchy[0]<hierarchy[1]&&hierarchy[1]<hierarchy[2],
      "Optional art may not precede original Rosary start "+JSON.stringify(hierarchy));
    owner="#aoPrayerBookRoot.open";
   }
   // The Prayer root can render behind the loading director; DOM-based assertions
   // alone would falsely pass while the app is still covered by a startup curtain.
   await page.waitForFunction(()=>{
     const boot=document.querySelector("#ao-cinema-boot");
     const loader=document.querySelector("#ao-cinema-loader");
     return (!boot || boot.classList.contains("aoCinemaBootDone")) &&
       (!loader || !loader.classList.contains("aoCinemaLoaderOn"));
   },null,{timeout:45000});
   if(which==="rosary"){
     await page.waitForFunction(()=>{
       const button=document.querySelector('#aoPrayerBookRoot.open .lab-rosary-hero [data-lab-rosary-today]');
       if(!button)return false;
       const b=button.getBoundingClientRect();
       if(b.width<40||b.height<40||b.top<0||b.top>=innerHeight)return false;
       const center=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
       return Boolean(center?.closest?.("#aoPrayerBookRoot.open"));
     },null,{timeout:45000});
   }
   assert.equal(await art.evaluate(el=>el.open),false,"image must stay collapsed on opening");
   const initial=await art.evaluate(el=>({
    top:el.getBoundingClientRect().top,height:el.getBoundingClientRect().height,
    overflow:document.documentElement.scrollWidth-innerWidth,
    summaryHeight:el.querySelector("summary").getBoundingClientRect().height
   }));
   assert.ok(initial.summaryHeight>=43&&initial.summaryHeight<=72,"preview trigger must be reachable, compact");
   assert.ok(initial.overflow<=2,"page overflow");
   await page.screenshot({path:resolve(folder,which+"-collapsed-"+width+".png"),animations:"disabled"});
   await art.locator("summary").click();
   assert.equal(await art.evaluate(el=>el.open),true);
   const img=art.locator("figure img");
   await img.evaluate(async el=>{
    if(!el.complete)await new Promise((ok,no)=>{el.onload=ok;el.onerror=no});
   });
   const imageState=await img.evaluate(el=>{
    const box=el.getBoundingClientRect();
    return {fit:getComputedStyle(el).objectFit,loaded:el.complete&&el.naturalWidth>0,
     width:box.width,height:box.height,
     overflow:document.documentElement.scrollWidth-innerWidth,
     currentSrc:el.currentSrc};
   });
   assert.equal(imageState.fit,"contain","photo crop is forbidden");
   assert.equal(imageState.loaded,true,"source-verified preview image failed to load");
   assert.ok(imageState.height<=470,"expanded image should fit typical device "+width);
   assert.ok(imageState.overflow<=2,"expanded proof page overflow");
   assert.match(imageState.currentSrc,new RegExp(which==="rosary"?"rosary-yorck-complete":"angelus-v3-paint-only"));
   await page.screenshot({path:resolve(folder,which+"-expanded-"+width+".png"),animations:"disabled"});
   if(which==="angelus"){
    const pageText=await page.locator("#aoPray435930 .aoP435930AngelusSequence").innerText();
    assert.ok(pageText.length>100,"Angelus actual prayers lost to artwork");
    await art.locator("summary").click();
    // Any later prayer card must not hold the opening artwork open.
    const next=page.locator("#aoPray435930 .aoDevoStop[data-ao-devo-chapter='1']");
    if(await next.count())await next.click();
   }else{
    await art.locator("summary").click();
    await page.locator(owner+" [data-lab-rosary-today]").first().click();
    await page.waitForFunction(()=>!document.querySelector("#aoPrayerBookRoot.open .lab-rosary-hero"),null,{timeout:15000});
    assert.equal(await page.locator("[data-ao-wave1-photo=rosary]").count(),0,
      "Rosary image must not follow user to active-bead prayer");
    assert.ok(await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").count()>=1,
      "Canonical Rosary bead player did not open");
   }
   assert.deepEqual(errors,[],"browser exceptions "+which+" "+width);
   await page.close();
  }
 }
 for(const which of ["angelus","rosary"]){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.goto(base,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function");
  assert.equal(await page.evaluate(()=>window.AO_PRAY_APP_V1.open()),true);
  if(which==="angelus")assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null})),true);
  else{
   assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.rosary_methods",{returnContext:null})),true);
   await page.locator("#aoPray435930 [data-p435930-rosary-begin]").click();
  }
  assert.equal(await page.locator("[data-ao-wave1-photo]").count(),0,
   "Normal production URL must show no Wave 1 image proof");
  await page.close();
 }
 console.log(JSON.stringify({result:"PASS_WAVE1_ANGELUS_ROSARY_OPT_IN_BROWSER_PROOF",
  widths:[320,390,1440],originalPrayersPreserved:true,defaultRouteUnchanged:true,
  researchImagesSHA256Verified:4,productionActivated:false}));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
