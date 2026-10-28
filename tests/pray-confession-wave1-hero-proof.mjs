import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile,mkdir} from "node:fs/promises";
import http from "node:http";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {
 CONFESSION_WAVE1_HERO_SOURCE_SHA256,CONFESSION_WAVE1_HERO_MUSEUM,
 CONFESSION_HERO_PROOF_ASSETS,confessionHeroProofMarkup,confessionHeroProofEnabled
} from "../src/pray/confession-wave1-hero-proof.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const checks=[
 ["confession-whole-800-preview.webp","032856e2d0aece10be8d77868248ba35061302576ead5a740b2daa484a2503d1"],
 ["confession-whole-1600-preview.webp","0726d1a7c17c6ebdd6f63da93a54c4ecbddc1491458139d8569c73d4fb459d3d"]
];
assert.equal(CONFESSION_WAVE1_HERO_SOURCE_SHA256,
 "b1e3d47e65f4367fd11fc23d9a63fb25ff3d8c934c3147606f1a3eba703beaa7");
assert.ok(CONFESSION_WAVE1_HERO_MUSEUM.includes("34956-return-prodigal-son"));
assert.equal(confessionHeroProofMarkup({}),"");
assert.equal(confessionHeroProofMarkup({search:"?aoPrayerArt=confession-review",stage:1}),"");
assert.equal(confessionHeroProofEnabled("?aoPrayerArt=confession-review",0),true);
assert.equal(confessionHeroProofEnabled("?aoPrayerArt=confession-review",1),false);
assert.equal(confessionHeroProofEnabled("",0),false);
assert.match(confessionHeroProofMarkup({search:"?aoPrayerArt=confession-review",french:true}),/non publié/);
for(const [name,digest] of checks){
 const b=await readFile(resolve(root,"assets/pray/hero-proof",name));
 assert.equal(createHash("sha256").update(b).digest("hex"),digest,name+" SHA drift");
}
const runtime=await readFile(resolve(root,"src/pray/presentation-runtime.js"),"utf8");
assert.match(runtime,/confessionHeroProofMarkup/);
assert.match(runtime,/stage:CONF\.stage,french:isFr\(\)/);
assert.equal((runtime.match(/confessionHeroProofMarkup\(\{/g)||[]).length,1);
const styles=await readFile(resolve(root,"src/pray/confession-wave1-hero-proof.js"),"utf8");
assert.match(styles,/object-fit:contain/);
assert.doesNotMatch(styles,/object-fit:cover/);

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".png":"image/png",".webp":"image/webp",
 ".jpg":"image/jpeg",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err.message||err))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
const base="http://127.0.0.1:"+server.address().port;
await mkdir(resolve(root,"artifacts/prayer-wave1-confession-proof"),{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1440]){
  const mobile=width<600;
  const page=await browser.newPage({viewport:{width,height:mobile?844:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base+"/index.html?aoPrayerArt=confession-review",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null})),true);
  const conf="#aoPray435930.open .aoP435930ConfessionReader";
  const art="#aoPray435930.open [data-ao-confession-hero-preview=true]";
  await page.locator(art+" img").waitFor({timeout:20000});
  await page.locator(art+" img").evaluate(async e=>{if(!e.complete)await new Promise((ok,no)=>{e.onload=ok;e.onerror=no})});
  const state=await page.locator(art+" img").evaluate(el=>{
   const r=el.getBoundingClientRect();
   return {loaded:el.complete&&el.naturalWidth>0,width:el.naturalWidth,height:el.naturalHeight,
    viewport:document.documentElement.clientWidth,boxLeft:r.left,boxRight:r.right,
    drawnHeight:r.height,objectFit:getComputedStyle(el).objectFit,
    src:el.currentSrc};
  });
  assert.equal(state.loaded,true,"image must load "+width);
  assert.ok(state.width>0 && state.height>0,"decoded image dimensions "+width);
  assert.ok(Math.abs(state.width/state.height-4096/3712)<.025,"painting aspect preserved "+width);
  assert.match(state.src,/confession-whole-(800|1600)-preview\.webp/,"verified reviewed file was loaded "+width);
  assert.equal(state.objectFit,"contain","no crop "+width);
  assert.ok(state.boxLeft>=-1&&state.boxRight<=state.viewport+1,"horizontal overflow "+width);
  assert.ok(!mobile||state.drawnHeight<=221,"hero must not monopolize mobile screen "+width);
  assert.equal(await page.locator(conf+" [data-p435930-conf-path]").count(),3);
  assert.equal(await page.locator(conf+" [data-p435930-since]").count(),1);
  await page.screenshot({path:resolve(root,"artifacts/prayer-wave1-confession-proof/flagged-"+width+".png"),animations:"disabled"});
  await page.locator(conf+" [data-p435930-conf-path=regular]").click();
  await page.locator(conf+" [data-p435930-conf-next]").click();
  assert.equal(await page.locator(art).count(),0,"hero must disappear after introduction");
  assert.equal(await page.locator(conf+" .aoDevoCard").count(),1,"confession remains source-owned");
  assert.deepEqual(errors,[],"unhandled page exceptions");
  await page.close();
 }
 const normal=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await normal.goto(base+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await normal.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await normal.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 assert.equal(await normal.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null})),true);
 assert.equal(await normal.locator("[data-ao-confession-hero-preview]").count(),0,
  "Image proof must remain disabled on default production route");
 await normal.close();
 console.log(JSON.stringify({result:"PASS_OPT_IN_CONFESSION_HERO_PROOF",nativeImageSha:true,
   widths:[320,390,1440],defaultRouteUnchanged:true,
   stageTransitionsPreserved:true,fullCompositionContain:true,photoReleased:false}));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
