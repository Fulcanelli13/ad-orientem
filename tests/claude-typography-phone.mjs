import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Real integrated application, not a free-standing typographic mock-up.
// Block remote font CDNs: the five approved V9 WOFF files must suffice.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/claude-typography-acceptance");
await mkdir(output,{recursive:true});
const mime={
 ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
 ".json":"application/json; charset=utf-8",".svg":"image/svg+xml",
 ".woff":"font/woff",".woff2":"font/woff2",
 ".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",
 ".jpeg":"image/jpeg",".webmanifest":"application/manifest+json"
};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){
   res.writeHead(403);res.end("forbidden");return;
  }
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(bytes);
 }catch(error){
  res.writeHead(error?.code==="ENOENT"?404:500);
  res.end(String(error?.message??error));
 }
});
await new Promise((ok,fail)=>{
 server.once("error",fail);server.listen(0,"127.0.0.1",ok);
});
const base="http://127.0.0.1:"+server.address().port;
const fontPaths=[
 "cinzel-variable.woff","cormorant-variable.woff",
 "cormorant-italic-variable.woff","eb-garamond-variable.woff",
 "eb-garamond-italic-variable.woff"
];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:640},
   deviceScaleFactor:1,isMobile:true,hasTouch:true,colorScheme:"dark"});
  const loadedFonts=new Set(),failedFonts=[];
  try{
   await page.route(/^https:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com)\//,
    route=>route.abort());
   page.on("response",response=>{
    const url=response.url();
    const name=fontPaths.find(f=>url.endsWith("/assets/fonts/claude-v9/"+f));
    if(name){
     if(response.ok())loadedFonts.add(name);
     else failedFonts.push({name,status:response.status()});
    }
   });
   await page.goto(base+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForSelector("#ao-app-design-system",{state:"attached",timeout:45000});
   const result=await page.evaluate(async()=>{
    const samples=[
     ['600 18px "Cinzel"',"SALVE REGINA"],
     ['500 22px "Cormorant Garamond"',"Cœlum et æternum 2026"],
     ['italic 500 22px "Cormorant Garamond"',"Grátia plena"],
     ['400 20px "EB Garamond"',"℣. Dóminus vobíscum ℟. Et cum spíritu tuo"],
     ['italic 400 20px "EB Garamond"',"O Maria, gratia plena"],
     ['500 22px "AO Home V9 Cormorant"',"DOMINUS 123"]
    ];
    const observed=[];
    for(const [font,sample] of samples){
     const matches=await document.fonts.load(font,sample);
     observed.push({font,count:matches.length,allLoaded:matches.every(face=>face.status==="loaded"),
      check:document.fonts.check(font,sample)});
    }
    const style=getComputedStyle(document.documentElement);
    const home=document.querySelector(".homeScreen");
    const heading=home?.querySelector("h1");
    const ribbon=document.querySelector("#ao-global-ribbon");
    const family=el=>el?getComputedStyle(el).fontFamily:null;
    return {fonts:observed,roles:{
      display:style.getPropertyValue("--ao-font-display").trim(),
      ceremonial:style.getPropertyValue("--ao-font-ceremonial").trim(),
      reading:style.getPropertyValue("--ao-font-body").trim(),
      home:family(home),heading:family(heading),ribbon:family(ribbon)
     },geometry:{viewport:innerWidth,document:document.documentElement.scrollWidth,
      homeFound:Boolean(home),headingFound:Boolean(heading)},sheets:{
       designSystem:Boolean(document.getElementById("ao-app-design-system"))
     }};
   });
   assert.ok(result.fonts.every(x=>x.count>=1&&x.allLoaded&&x.check),
    "Offline local WOFF font failed: "+JSON.stringify(result.fonts));
   for(const name of fontPaths)assert.ok(loadedFonts.has(name),
    "Approved WOFF not served from app origin at "+width+"px: "+name);
   assert.equal(failedFonts.length,0,JSON.stringify(failedFonts));
   assert.ok(result.roles.ceremonial.includes("Cinzel"),JSON.stringify(result.roles));
   assert.ok(result.roles.display.includes("Cormorant Garamond"),JSON.stringify(result.roles));
   assert.ok(result.roles.reading.includes("EB Garamond"),JSON.stringify(result.roles));
   assert.ok(result.geometry.homeFound,"Integrated Home did not render at "+width+"px");
   assert.ok(result.geometry.viewport===width,"Incorrect phone viewport: "+JSON.stringify(result.geometry));
   await page.screenshot({path:output+"/integrated-home-"+width+".png",fullPage:false});
   await mkdir(output,{recursive:true});
   const {writeFile}=await import("node:fs/promises");
   await writeFile(output+"/font-matrix-"+width+".json",
    JSON.stringify({width,result,fontResponses:[...loadedFonts],failedFonts},null,2)+"\n");
   console.log("PASS exact Claude local font faces and integrated Home at "+width+"px");
  }finally{await page.close();}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
