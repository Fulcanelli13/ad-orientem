import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {SAN_POLO_OPTIONAL_CYCLE,SAN_POLO_OPTIONAL_CYCLE_META} from "../src/pray/stations-san-polo-optional-cycle.v1.js";
import {SAN_POLO_PUBLISHED_STATIONS} from "../src/pray/stations-verified-artwork-release.v1.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-san-polo-optional-release");
const candidates=JSON.parse(readFileSync(resolve(root,"data/prayer/stations/san-polo-tiepolo-oils-1747/cc-by-sa-complete-series-release-candidate.v1.json"),"utf8"));
assert.equal(Object.keys(SAN_POLO_PUBLISHED_STATIONS).length,0);
assert.equal(SAN_POLO_OPTIONAL_CYCLE_META.defaultEnabled,false);
assert.equal(Object.keys(SAN_POLO_OPTIONAL_CYCLE).length,14);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error.message||error))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
await mkdir(output,{recursive:true});
const report={schema:"ao.pray.san-polo-optional-real-reader.v1",mode:"ACTUAL_OPT_IN_NOT_INJECTION",
 states:[],screenshots:[],defaultUnchanged:0,publishedProofRequired:true};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:width===320?720:844},isMobile:true,hasTouch:true,
   deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block",locale:"en-GB"});
  const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations",{returnContext:null})),true);
   const rootSel="#aoPray435930.open";
   assert.equal(await page.locator(rootSel+" [data-ao-station-artwork]").count(),0,
    "Existing approved artwork default must not change");
   report.defaultUnchanged++;
   for(const language of ["en","fr"]){
    if(language==="fr"){
     const lang=page.locator(rootSel+" .aoP435930SessionLanguage");
     await lang.click();
     assert.equal((await lang.innerText()).trim(),"FR");
    }
    const options=page.locator(rootSel+" [data-ao-stations-options]");
    if(!(await options.evaluate(node=>node.open)))await options.locator(":scope > summary").click();
    const toggle=page.locator(rootSel+" [data-p435930-station-san-polo]");
    assert.equal(await toggle.isChecked(),false,"Opt-in cycle is off by default");
    await toggle.check();
    const selected=page.locator(rootSel+" [data-p435930-station-san-polo]");
    assert.equal(await selected.isChecked(),true,"Explicit selection must survive reader rerender");
    for(const row of candidates.entries){
     const number=row.station;
     await page.locator(rootSel+" [data-p435930-station-step='"+(number-1)+"']").click();
     const section=page.locator(rootSel+" [data-ao-devo-card='station-"+number+"']");
     await section.waitFor({state:"visible"});
     const figure=section.locator("[data-ao-station-artwork='"+number+"']");
     assert.equal(await figure.count(),1,"Selected photo must match stage");
     const picture=figure.locator("img");
     const evidence=await picture.evaluate(async(img)=>{
      await img.decode();
      const f=img.closest("figure"),c=f.querySelector("figcaption"),r=img.getBoundingClientRect();
      return {src:img.getAttribute("src"),width:img.naturalWidth,height:img.naturalHeight,
       onScreen:r.width>75&&r.height>75,alt:img.alt,caption:c.innerText,
       links:Array.from(c.querySelectorAll("a[href]")).map(a=>a.href),
       fit:getComputedStyle(img).objectFit,
       documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
       figureOverflow:Math.max(0,f.scrollWidth-f.clientWidth)};
     });
     assert.equal(evidence.src,"./assets/stations/san-polo/station-"+String(number).padStart(2,"0")+".webp");
     assert.deepEqual([evidence.width,evidence.height],row.nativePixelDimensions);
     assert.equal(evidence.onScreen,true);
     assert.equal(evidence.fit,"contain");
     assert.ok(evidence.documentOverflow<=2&&evidence.figureOverflow<=2);
     assert.deepEqual(evidence.links,[row.sourceFilePage,row.photoLicenseURL]);
     assert.match(evidence.caption,/Didier Descouens/);
     assert.match(evidence.caption,/CC BY-SA 4\.0/);
     assert.match(evidence.alt,language==="fr"?/^Chemin de Croix, station/:/^Stations of the Cross, Station/);
     assert.ok((await section.locator(".aoDevoCardScroll").innerText()).length>100,
      "Original Stations prayer text must remain available");
     report.states.push({station:number,width,language,src:evidence.src,
      natural:[evidence.width,evidence.height],originalPrayerIntact:true,photographerAndLicenseVisible:true});
     if(language==="en"&&(number===1||number===14)){
      const screenshot="san-polo-optional-"+number+"-"+width+"-"+language+".png";
      await section.screenshot({path:resolve(output,screenshot),animations:"disabled"});
      report.screenshots.push(screenshot);
     }
    }
    const optionsAgain=page.locator(rootSel+" [data-ao-stations-options]");
    if(!(await optionsAgain.evaluate(node=>node.open)))await optionsAgain.locator(":scope > summary").click();
    await page.locator(rootSel+" [data-p435930-station-san-polo]").uncheck();
    assert.equal(await page.locator(rootSel+" [data-ao-station-artwork]").count(),0,
     "Disabling cycle must restore original card on the same station");
    report.defaultUnchanged++;
   }
   assert.deepEqual(errors,[]);
  }finally{await context.close()}
 }
 assert.equal(report.states.length,56);
 console.log("PASS San Polo OPTIONAL cycle: 56 real 320/390 EN/FR reader states, 0 default photo displacement");
}finally{
 await writeFile(resolve(output,"san-polo-optional-real-reader.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
}
