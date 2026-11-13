import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
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
   // The boot splash fades for 620ms after becoming non-interactive.
   // A pointer-events:none gate captures both screens at mid-fade, falsely
   // making Home's date, heading, branding and CTA appear to overlap.
   await page.waitForFunction(()=>{
    const home=document.querySelector(".homeScreen");
    const inactive=id=>{
      const el=document.getElementById(id);
      if(!el||el.hidden)return true;
      const css=getComputedStyle(el);
      return css.display==="none"||
        (css.visibility==="hidden"&&Number(css.opacity)<=.01);
    };
    return Boolean(home?.getClientRects().length)&&
      inactive("ao-cinema-boot")&&
      inactive("ao-cinema-transition")&&
      inactive("ao-cinema-loader");
   },null,{timeout:45000});
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
   assert.ok(result.roles.heading?.includes("EB Garamond"),
    "H7 saint heading must retain Claude's original EB Garamond face: "+JSON.stringify(result.roles));
   assert.ok(result.geometry.homeFound,"Integrated Home did not render at "+width+"px");
   assert.ok(result.geometry.viewport===width,"Incorrect phone viewport: "+JSON.stringify(result.geometry));
   const geometry=await page.evaluate(()=>{
    const root=document.querySelector(".aoH7HomeView .hero");
    if(!root)return {error:"H7 hero absent"};
    const selectors=[
     [".top",".top"],[".wm",".top .wm"],["date",".date"],
     ["rank",".rb"],["saint","h1"],["formulary",".aoH4Formulary"],
     ["markers",".mks"],["mass",".aoTodayV2Mass"],["massAction",".aoH7Enter"]
    ];
    const boxes=selectors.map(([name,selector])=>{
     const element=root.querySelector(selector);
     if(!element)return {name,missing:true};
     const b=element.getBoundingClientRect(),s=getComputedStyle(element);
     return {name,tag:element.tagName,text:element.innerText?.trim().slice(0,160),
      rect:{x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom},
      css:{font:s.font,fontFamily:s.fontFamily,lineHeight:s.lineHeight,position:s.position,
       overflow:s.overflow,transform:s.transform,opacity:s.opacity,visibility:s.visibility}};
    });
    const pairs=[];
    const independent=["date","rank","saint","formulary","markers","mass"];
    for(let i=0;i<independent.length;i++)for(let j=i+1;j<independent.length;j++){
     const x=boxes.find(b=>b.name===independent[i])?.rect;
     const y=boxes.find(b=>b.name===independent[j])?.rect;
     if(x&&y){
      const overlap=Math.min(x.right,y.right)-Math.max(x.x,y.x);
      const vertical=Math.min(x.bottom,y.bottom)-Math.max(x.y,y.y);
      if(overlap>3&&vertical>3)pairs.push({a:independent[i],b:independent[j],overlap,vertical});
     }
    }
    const markups=[...root.querySelectorAll("*")].filter(el=>
      el.childElementCount===0&&/AD ORIENTEM|St\. Didacus/i.test(el.textContent||"")).map(el=>{
       const r=el.getBoundingClientRect();
       return {text:el.textContent.trim().slice(0,80),tag:el.tagName,
        className:el.className?.baseVal||el.className,
        y:r.y,bottom:r.bottom,position:getComputedStyle(el).position};
      });
    return {boxes,overlapPairs:pairs,markups,heroHeight:root.getBoundingClientRect().height};
   });

   await page.screenshot({path:output+"/integrated-home-"+width+".png",fullPage:false});

   await writeFile(output+"/font-matrix-"+width+".json",
    JSON.stringify({width,result,geometry,bootFullyHidden:true,fontResponses:[...loadedFonts],failedFonts},null,2)+"\n");
   // Source-owned Angelus / Regina reader parity with the newer Claude reference.
   // Do not claim this checks the not-yet-integrated full cinematic/veil UI.
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",
    null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",
    null,{timeout:25000});
   assert.equal(await page.evaluate(()=>
    globalThis.AO_PRAY_V435930.open("pray.angelus",{returnContext:null})),true);
   await page.locator("#aoPray435930.open [data-ao-angelus-form]")
    .waitFor({state:"attached",timeout:15000});
   const begin=page.locator("#aoPray435930 [data-p435930-angelus-begin]");
   if(await begin.count())await begin.click();
   await page.locator("#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoCardScroll")
    .waitFor({state:"visible",timeout:15000});
   const settings=page.locator("#aoPray435930 [data-p435930-angelus-settings]");
   if(await settings.count())await settings.click();
   const group=page.locator("#aoPray435930 [data-p435930-seg='group']").first();
   await group.evaluate(el=>el.click());
   await page.waitForFunction(()=>document.querySelector("#aoPray435930 [data-ao-angelus-recitation]")?.dataset.aoAngelusRecitation==="group",
    null,{timeout:15000});
   const readAngelusMetrics=async()=>page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open");
    const current=root?.querySelector(".aoDevoCard:not([hidden])");
    const style=el=>{
     if(!el)return null;
     const s=getComputedStyle(el),r=el.getBoundingClientRect();
     return {family:s.fontFamily,size:parseFloat(s.fontSize),
      weight:Number(s.fontWeight),lineHeight:parseFloat(s.lineHeight),
      visible:r.width>0&&r.height>0,rect:{x:r.x,y:r.y,w:r.width,h:r.height}};
    };
    const get=(type)=>{
     const card=current?.querySelector('[data-ao-angelus-unit="'+type+'"]');
     const face=card?.querySelector('[data-face-v]:not([hidden])');
     const line=face?.querySelector(".aoAngelusDialogueLine");
     return {words:style(line?.querySelector(":scope > span:not(.ao-liturgical-speaker)")),
      speaker:style(line?.querySelector(":scope > .ao-liturgical-speaker")),
      whole:style(card?.querySelector("button")),hasFace:Boolean(face)};
    };
    return {form:root?.querySelector("[data-ao-angelus-form]")?.dataset.aoAngelusForm,
     recitation:root?.querySelector("[data-ao-angelus-recitation]")?.dataset.aoAngelusRecitation,
     heading:style(current?.querySelector(".aoDevoCardTitle")),
     versicle:get("vr"),hail:get("hail"),collect:get("collect"),
     overflow:document.documentElement.scrollWidth-innerWidth};
   });
   const angelus=await readAngelusMetrics();
   const verseExpected=width===390?21:19;
   const hailExpected=width===390?18.5:17;
   assert.equal(angelus.form,"angelus");
   assert.equal(angelus.recitation,"group");
   assert.ok(angelus.versicle.words?.family.includes("Cormorant Garamond"),
    "Angelus source V/R should use Cormorant: "+JSON.stringify(angelus));
   assert.ok(Math.abs(angelus.versicle.words.size-verseExpected)<.3,
    "Angelus V/R prototype size mismatch: "+JSON.stringify(angelus));
   assert.ok(angelus.versicle.speaker?.family.includes("EB Garamond")&&
    Math.abs(angelus.versicle.speaker.size-17)<.3&&
    angelus.versicle.speaker.weight===500,
    "Angelus source glyphs must be EB Garamond 500 at 17px: "+JSON.stringify(angelus));
   assert.ok(angelus.hail.words?.family.includes("EB Garamond")&&
    Math.abs(angelus.hail.words.size-hailExpected)<.3,
    "Complete Hail Mary must not inherit the V/R display face: "+JSON.stringify(angelus));
   assert.ok(angelus.heading?.family.includes("Cinzel"),
    "Angelus ceremonial movement title must use Cinzel: "+JSON.stringify(angelus));
   assert.ok(angelus.overflow<=2,"Angelus phone horizontal overflow: "+JSON.stringify(angelus));
   await page.screenshot({path:output+"/angelus-group-"+width+".png",
    fullPage:false,animations:"disabled"});
   await page.locator("#aoPray435930 [data-p435930-seg='regina']").first()
    .evaluate(el=>el.click());
   await page.waitForFunction(()=>document.querySelector("#aoPray435930 [data-ao-angelus-form]")?.dataset.aoAngelusForm==="regina",
    null,{timeout:15000});
   const regina=await readAngelusMetrics();
   assert.equal(regina.form,"regina");
   assert.ok(regina.versicle.words?.family.includes("Cormorant Garamond"),
    "Regina Cæli source V/R must use Cormorant: "+JSON.stringify(regina));
   assert.ok(regina.overflow<=2,"Regina Cæli horizontal overflow: "+JSON.stringify(regina));
   await page.screenshot({path:output+"/regina-group-"+width+".png",
    fullPage:false,animations:"disabled"});
   await writeFile(output+"/prayer-font-matrix-"+width+".json",
    JSON.stringify({width,angelus,regina,prototypeReference:{
      versicle:{family:"Cormorant Garamond",size390:21,weight:500,lineHeight:1.36},
      completePrayer:{family:"EB Garamond",size390:18.5,weight:400,lineHeight:1.52},
      speaker:{family:"EB Garamond",size:17,lineHeight:1.6},
      heading:{family:"Cinzel",size390:29,weight:600},
      unimplementedVisualModes:["Cinematic","Veil","Verse by Verse"]
    }},null,2)+"\n");
   console.log("PASS Angelus/Regina V/R, Hail, glyph and title font roles at "+width+"px");

   console.log("PASS exact Claude local font faces and integrated Home at "+width+"px");
  }finally{await page.close();}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
