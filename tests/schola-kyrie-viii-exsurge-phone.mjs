// Real-browser, OFFLINE-ONLY research proof. These nine GABC excerpts are
// NOT PUBLIC, not musically certified, and not published to the LIVE reader.
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {chromium} from "@playwright/test";
import {buildKyrieVIIIReviewManifest}
 from "../scripts/schola/prepare-kyrie-viii-review-manifest.mjs";

const root=new URL("../",import.meta.url);
const sources=new Map([
 ["/src/mass/reader-chant-engraver.js","src/mass/reader-chant-engraver.js"],
 ["/src/mass/reader-schola-notation-follow.js","src/mass/reader-schola-notation-follow.js"],
 ["/assets/vendor/exsurge/exsurge.min.js","assets/vendor/exsurge/exsurge.min.js"]
]);
const files=new Map([...sources].map(([url,path])=>[
 url,readFileSync(new URL(path,root))
]));
const server=createServer((req,res)=>{
 const buffer=files.get(req.url??"");
 if(buffer)res.writeHead(200,{"Content-Type":"text/javascript; charset=utf-8",
  "Cache-Control":"no-store"}).end(buffer);
 else if(req.url==="/")res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}).end(
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<style>body{margin:0;background:#13171a;color:#eee} #staff{width:calc(100% - 24px);height:96px;overflow:auto;margin:12px} #strip{height:32px;overflow:hidden}</style></head>'+
  '<body><div id="staff" role="img"></div><div id="strip" hidden></div></body></html>');
 else res.writeHead(404).end("No network fallbacks");
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const all=buildKyrieVIIIReviewManifest();
assert.equal(all.candidates.length,9);
assert.equal(all.publishedScores,0);
const report=[];
const reviewDir=process.env.AO_KYRIE_VIII_REVIEW_DIR??"";
const screenshots=[];
if(reviewDir)mkdirSync(reviewDir,{recursive:true});
try{
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:740},deviceScaleFactor:1});
  const foreign=[];
  page.on("request",r=>{if(!r.url().startsWith("http://127.0.0.1:"+port+"/"))foreign.push(r.url());});
  await page.goto("http://127.0.0.1:"+port+"/");
  for(const score of all.candidates){
   const result=await page.evaluate(async ({gabc,cueId})=>{
     const {createOfflineChantEngraver}=await import("/src/mass/reader-chant-engraver.js");
     const {createScholaNotationFollower,scholaGabcSyllables}=await import("/src/mass/reader-schola-notation-follow.js");
     const staff=document.querySelector("#staff"),strip=document.querySelector("#strip");
     staff.replaceChildren();strip.replaceChildren();
     const engraving=createOfflineChantEngraver({viewport:staff,document});
     const success=await engraving.engrave(gabc);
     const svg=staff.querySelector("svg");
     const svgBox=svg?.getBoundingClientRect();
     let follow={started:false,syllables:0,mapped:false};
     if(success&&svg){
       const follower=createScholaNotationFollower({staff,strip,document,window,stepMs:9000});
       follow={started:follower.start(gabc),...follower.getState()};
       follower.destroy();
     }
     const box=staff.getBoundingClientRect();
     engraving.destroy();
     return {cueId,success,svg:!!svg,
       staffWidth:box.width,svgWidth:svgBox?.width??0,
       svgRight:svgBox?.right??0,
       svgTextNodes:svg?.querySelectorAll("text")?.length??0,
       svgTexts:[...(svg?.querySelectorAll("text")??[])].map(x=>({text:x.textContent,inner:x.innerHTML.slice(0,90)})),
       sourceSyllables:scholaGabcSyllables(gabc).map(x=>x.label),follow};
   },{gabc:score.gabc,cueId:score.sourceCueId});
   assert.equal(result.success,true,"Exsurge rejected GABC on "+width+"px "+score.sourceCueId);
   assert.equal(result.svg,true,"Missing notation SVG on "+width+"px "+score.sourceCueId);
   assert.ok(result.svgRight<=width+1,"Score overflow "+width+"px "+JSON.stringify(result));
   assert.equal(result.follow.started,true,"Syllable parsing failed "+score.sourceCueId);
   assert.ok(result.follow.syllables>0,"Source must carry lyric units");
   assert.equal(result.follow.mapped,true,"Source syllables did not map one-to-one onto Exsurge SVG for "+score.sourceCueId+" at "+width+"px: "+JSON.stringify(result));
   report.push({width,...result});
   if(reviewDir){
     const filename=score.sourceCueId.replace("AO.SM.","")+"-"+width+".png";
     const png=await page.locator("#staff").screenshot({animations:"disabled"});
     assert.ok(png.length>1000,"Empty visual proof "+filename);
     writeFileSync(join(reviewDir,filename),png);
     screenshots.push({
       cueId:score.sourceCueId,latin:score.sourceLatin,
       sourceLine:score.sourceLine,folios:score.facsimileFolios,
       gabcSha256:score.gabcSha256,width,filename,
       syllables:result.follow.syllables,mapped:result.follow.mapped
     });
   }
  }
  assert.deepEqual(foreign,[],"Offline review must never request external images, fonts or scripts");
  await page.close();
 }
 if(reviewDir){
   assert.equal(screenshots.length,18,"Exactly 18 phone screenshots required");
   writeFileSync(join(reviewDir,"proof.json"),JSON.stringify({
     status:"RESEARCH_NOT_APPROVED",publicScores:0,
     sourceId:all.source.scoreId,
     sourceGabcSha256:all.verifiedResearchGabcSha256,
     captures:screenshots
   },null,2));
   console.log("SCHOLA_KYRIE_VIII_VISUAL_PROOF_PASS 18 images, no public scoring");
 }
 console.log("SCHOLA_KYRIE_VIII_EXSURGE_OFFLINE_PHONE_PASS "+JSON.stringify({
   previews:report.length,cues:9,widths:[320,390],
   lyricMappings:report.filter(x=>x.follow.mapped).length,
   details:report.map(x=>({w:x.width,cue:x.cueId,syllables:x.follow.syllables,
    mapped:x.follow.mapped,textNodes:x.svgTextNodes}))
 }));
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
