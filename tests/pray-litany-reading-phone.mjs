import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {LITANY_SOURCE_WITNESSES} from "../src/pray/litany-source.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/pray-b38-litany");
await mkdir(out,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
// Explicitly synthetic UI test witnesses: never published as real editions.
// Source fidelity, print collation and publication holds are tested separately.
const english=[
 "Lord, have mercy on us.","Christ, have mercy on us.",
 "Holy Mary, pray for us.","St. Peter, pray for us.",
 ...Array.from({length:29},(_,i)=>i%2?"St. Joseph, pray for us.":"St. Peter, pray for us."),
 "Lamb of God, who takest away the sins of the world, have mercy on us.",
 "Our Father, in secret, after the Litany proper."
].join("\n");
const french=[
 "Les litanies des saints.","Seigneur, ayez pitié de nous.",
 "Sainte Marie, priez pour nous.","Saint Pierre, priez pour nous.",
 ...Array.from({length:29},(_,i)=>i%2?"Saint Joseph, priez pour nous.":"Sainte Marie, priez pour nous."),
 "Agneau de Dieu, qui effacez les péchés du monde, ayez pitié de nous.",
 "Notre Père, qui êtes aux cieux, après les litanies."
].join("\n");
assert.ok(english.length>500&&french.length>500);
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.addInitScript(({en,fr,cacheEn,cacheFr})=>{
    localStorage.setItem("ao2:v435930:ws:en:"+cacheEn,en);
    localStorage.setItem("ao2:v435930:ws:fr:"+cacheFr,fr);
   },{en:english,fr:french,cacheEn:LITANY_SOURCE_WITNESSES.en.cacheKey,cacheFr:LITANY_SOURCE_WITNESSES.fr.cacheKey});
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:20000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.litany_saints",{returnContext:null})),true);
   const rootSel="#aoPray435930.open";
   const owner=rootSel+' [data-ao-devotional-owner="litany"]';
   await page.locator(owner+' .aoP435930LitanyLine').first().waitFor({timeout:10000});
   const inspect=()=>page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open"),m=root.querySelector(".aoP435930Mount"),
      reader=m.querySelector('[data-ao-devotional-owner="litany"]'),
      first=reader.querySelector(".aoP435930LitanyLine"),last=reader.querySelectorAll(".aoP435930LitanyLine"),
      guide=reader.querySelector(".aoLitanySectionGuide"),
      source=reader.querySelector("details.aoP435930Source"),
      caption=reader.querySelector(".aoLitanyWitnessCaption"),
      edition=reader.querySelector(".aoBatch03LitanyUses"),
      port=m.getBoundingClientRect(),r=first.getBoundingClientRect(),style=getComputedStyle(first);
    return {
     language:first.closest("[lang]")?.getAttribute("lang"),font:parseFloat(style.fontSize),
     lineHeight:parseFloat(style.lineHeight),opacity:parseFloat(style.opacity),
     minimumOpacity:Math.min(...[...last].map(el=>parseFloat(getComputedStyle(el).opacity))),
     firstTop:r.top,viewportBottom:port.bottom,
     sourceLine:first.textContent,caption:caption?.textContent,guideOpen:guide?.open,
     sourceOpen:source?.open,guideSummaryHeight:guide?.querySelector("summary")?.getBoundingClientRect().height,
     editionHeight:edition?.getBoundingClientRect().height,editionScroll:edition?.scrollWidth-edition?.clientWidth,
     lineCount:last.length,readerPresent:!!reader,overflow:document.documentElement.scrollWidth-innerWidth
    };
   });
   let en=await inspect();
   assert.equal(en.language,"en");
   assert.match(en.caption,/1883/);
   assert.ok(en.font>=18&&en.lineHeight/en.font>=1.6,"Private Litany source text should use generous 18px+ type");
   assert.ok(en.minimumOpacity>=.99,"No historical invocations should be muted behind focus");
   assert.ok(en.firstTop<en.viewportBottom-18,"The invocation text must enter the first phone viewport");
   assert.equal(en.guideOpen,false,"Guidance should be available but closed by default");
   assert.equal(en.sourceOpen,false,"Historical source notes must stay collapsed by default");
   assert.ok(en.guideSummaryHeight>=44);
   assert.equal(en.overflow<=1,true,"English 320/390 overflow");
   await page.screenshot({path:resolve(out,"litany-en-"+width+"-opening.png"),animations:"disabled"});
   const chapter=page.locator(owner+' [data-ao-devo-chapter="1"]');
   await chapter.click();
   assert.equal(await page.locator(owner+" .aoDevoCard").getAttribute("data-ao-devo-index"),"1",
    "Original historical section navigation must work");
   const detail=page.locator(owner+" .aoLitanySectionGuide");
   await detail.locator("summary").click();
   assert.equal(await detail.evaluate(e=>e.open),true);
   await page.screenshot({path:resolve(out,"litany-en-"+width+"-guide.png"),animations:"disabled"});
   const session=page.locator(rootSel+' [data-p435930-session-language]');
   assert.equal(await session.count(),1,"Historical private Litany needs an explicit EN/FR witness control");
   await session.click();
   await page.waitForFunction(()=>document.querySelector('[data-ao-devotional-owner="litany"] .aoLitanyWitnessCaption')?.textContent?.includes("1862"),null,{timeout:10000});
   await page.locator(owner+' .aoP435930LitanyLine').first().waitFor();
   let fr=await inspect();
   assert.equal(fr.language,"fr","Private French witness is distinct, never an English translation");
   assert.match(fr.sourceLine,/Seigneur/);
   assert.match(fr.caption,/1862/);
   assert.ok(fr.font>=18&&fr.minimumOpacity>=.99&&fr.overflow<=1);
   assert.equal(await page.locator(owner+" .aoDevoCard").getAttribute("data-ao-devo-index"),"0",
    "Changing to a different historical edition must reset section to the beginning");
   await page.screenshot({path:resolve(out,"litany-fr-"+width+"-opening.png"),animations:"disabled"});
   await page.locator(owner+' [data-p435930-lit-use="major"]').click();
   await page.locator(rootSel+' [data-ao-litany-use="major"]').waitFor();
   assert.equal(await page.locator(rootSel+" .aoP435930LitanyLine").count(),0,
    "Uncollated public 1962 rite must not be filled with the private French prayer text");
   assert.match(await page.locator(rootSel+' [data-ao-litany-use="major"]').innerText(),/1962|1960/);
   await page.screenshot({path:resolve(out,"litany-public-held-"+width+".png"),animations:"disabled"});
   assert.deepEqual(errors,[],"Unexpected browser errors: "+JSON.stringify(errors));
   console.log("PASS "+width+"px private Litany: EN1883/FR1862, 18px full-opacity text, guide disclosure, chapter rail, public 1962 fail-closed");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
