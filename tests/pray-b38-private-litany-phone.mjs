import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {LITANY_SOURCE_WITNESSES} from "../src/pray/litany-source.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dest=resolve(root,"artifacts/pray-b38");
await mkdir(dest,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});

// A deliberately SYNTHETIC, test-only witness: not a transcription or
// publication candidate. Validates the actual historical extraction, source
// boundary, paginated section reader and layout without a Wikisource network.
const fixture=(locale)=>{
 const intro=locale==="fr"
  ?["Les litanies des saints.","Seigneur, ayez pitié de nous.","Sainte Marie, priez pour nous.","Saint Pierre, priez pour nous.","Agneau de Dieu, exaucez-nous."]
  :["Lord, have mercy on us.","Christ, have mercy on us.","Holy Mary, pray for us.","St. Peter, pray for us.","Lamb of God, hear us."];
 const lines=Array.from({length:38},(_,i)=>locale==="fr"
  ?"Témoin d’essai "+(i+1)+" : priez pour nous, dans la charité et dans la paix."
  :"TEST WITNESS "+(i+1)+": pray for us in charity, patience, and peace.");
 const end=locale==="fr"?"Notre Père, qui êtes aux cieux":"Our Father, in secret";
 return [...intro,...lines,end,"This content is an excluded test fixture, not a source."].join("\n");
};

let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  for(const language of ["en","fr"]){
   const page=await browser.newPage({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
   const errs=[];page.on("pageerror",e=>errs.push(e.message));
   try{
    await page.addInitScript(({language,text,enKey,frKey})=>{
     const k="ao2:settings:v1",v=JSON.parse(localStorage.getItem(k)||"{}");
     localStorage.setItem(k,JSON.stringify({...v,language}));
     localStorage.setItem("ao2:v435930:ws:"+language+":"+(language==="fr"?frKey:enKey),text);
    },{language,text:fixture(language),enKey:LITANY_SOURCE_WITNESSES.en.cacheKey,frKey:LITANY_SOURCE_WITNESSES.fr.cacheKey});
    await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:50000});
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
    await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
    const actual=await page.evaluate(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language);
    assert.equal(actual,language,"Runtime must load the requested test language before source selection");
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.litany_saints",{returnContext:null})),true);
    const owner="#aoPray435930.open [data-ao-devotional-owner='litany']";
    await page.waitForSelector(owner+" .aoP435930LitanyLine",{timeout:20000});
    await page.waitForSelector(owner+" .aoDevoSequenceTimeline",{timeout:12000});
    const measured=()=>page.evaluate(()=>{
     const root=document.querySelector("#aoPray435930.open [data-ao-devotional-owner='litany']");
     const mount=root.closest(".aoP435930Mount"),scroll=root.querySelector(".aoDevoCardScroll");
     const line=root.querySelector(".aoP435930LitanyLine"),prayer=root.querySelector(".aoP435930LitanyVerses");
     const lines=[...root.querySelectorAll(".aoP435930LitanyLine")];
     const styles=line?getComputedStyle(line):null;
     const p=line?.getBoundingClientRect(),v=mount.getBoundingClientRect();
     const edition=root.querySelector("details.aoP435930Source");
     const rail=root.querySelector(".aoDevoSequenceTimeline");
     return {font:parseFloat(styles?.fontSize||"0"),leading:parseFloat(styles?.lineHeight||"0"),
      opacity:lines.map(x=>Number(getComputedStyle(x).opacity)),lineCount:lines.length,
      gutter:getComputedStyle(scroll).paddingRight,visibleFirstLine:!!p&&p.top<v.bottom-18,
      readableMeasure:prayer?.getBoundingClientRect().width||0,
      editionClosed:!!edition&&!edition.open,rail:!!rail,
      overflow:document.documentElement.scrollWidth-innerWidth};
    });
    const m=await measured();
    assert.ok(m.font>=18&&m.leading/m.font>=1.5,"Litany historical lines need 18px+ and 1.5+ leading: "+JSON.stringify(m));
    assert.ok(m.readableMeasure>=235,"Phone Litany width must not be consumed by the prior 52px right gutter: "+JSON.stringify(m));
    assert.ok(m.lineCount>=12&&m.opacity.every(x=>x>=.75),"Litany invocation focus cannot hide source lines: "+JSON.stringify(m));
    assert.ok(m.editionClosed&&m.rail,"Historical edition stays discoverable and closed; existing chapter rail remains");
    assert.ok(m.overflow<=1,"No horizontal overflow at "+width+" in "+language);
    await page.screenshot({path:resolve(dest,"litany-"+language+"-"+width+"-opening.png"),animations:"disabled"});
    // Use the source-owned chapter navigator, not another footer.
    await page.locator(owner+' .aoDevoStops [data-ao-devo-chapter="1"]').click();
    await page.waitForSelector(owner+' [data-ao-devo-card="litany-1"]',{timeout:8000});
    const n=await measured();
    assert.ok(n.font>=18&&n.opacity.every(x=>x>=.75)&&n.overflow<=1,"Source pagination must preserve reading comfort");
    await page.screenshot({path:resolve(dest,"litany-"+language+"-"+width+"-section2.png"),animations:"disabled"});
    // Public Major Litanies must be a distinct reference-only screen.
    await page.locator(owner+' [data-p435930-lit-use="major"]').click();
    assert.equal(await page.locator(owner).count(),0,"Historical private reader must not masquerade as the public rite");
    const publicRoot="#aoPray435930.open [data-ao-litany-use='major']";
    await page.locator(publicRoot).waitFor();
    assert.match(await page.locator(publicRoot).innerText(),language==="fr"?/collation|certifiée/i:/collation|not yet/i);
    assert.equal(await page.locator(publicRoot+" .aoP435930LitanyLine").count(),0,"Uncollated public edition must not invent prayers");
    assert.deepEqual(errs,[],"Unexpected browser errors: "+JSON.stringify(errs));
    console.log("PASS "+language+" "+width+"px private Litany: readable original-section UI, unmodified source gates, no overflow");
   }finally{await page.close()}
  }
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
