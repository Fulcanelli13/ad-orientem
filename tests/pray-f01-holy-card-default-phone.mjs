import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {ESSENTIAL_HOLY_CARD_IDS_V1} from "../src/pray/essential-holy-card-parts.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-f01-holy-card-default");
await mkdir(output,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg",".woff":"font/woff",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   const origin="http://127.0.0.1:"+server.address().port;
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const base="#aoPray435930.open";
   for(const [index,id] of ESSENTIAL_HOLY_CARD_IDS_V1.entries()){
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    const option=page.locator(base+' [data-p435930-lib-open="'+id+'"]');
    assert.equal(await option.count(),1,"Canonical Essential Prayer absent from library: "+id);
    await option.click({timeout:12000});
    // The article itself is the original Holy Card, not a substitute inner reader.
    const present=page.locator(base+' .aoClaudeHolyCard[data-ao-essential-card="'+id+'"]');
    await present.waitFor({state:"attached",timeout:12000});
    assert.equal(await present.count(),1,"Original Claude reversible card must own "+id);
    assert.equal(await page.locator(base+' [data-ao-essential-flow="true"]').count(),0,
      "Unapproved continuous-flow reader replaced Holy Card for "+id);
    assert.equal(await present.locator(".aoClaudeHolyFront").count(),1,id+" is missing artwork face");
    assert.equal(await present.locator(".aoClaudeHolyBack").count(),1,id+" is missing prayer face");
    assert.equal(await present.locator("[data-p435930-essential-card-turn]").count(),1,id+" has no flip control");
    assert.ok(await present.locator(".aoP435930EssentialBeat").count()>0,id+" has no attested prayer paragraphs");
    if(index===0||id==="foundations_hail_mary"){
     const turn=present.locator("[data-p435930-essential-card-turn]");
     assert.equal(await present.locator(".aoClaudeHolyFront").getAttribute("aria-hidden"),"false");
     await turn.click({timeout:12000});
     assert.equal(await present.locator(".aoClaudeHolyBack").getAttribute("aria-hidden"),"false",
      "Tap must show source prayer on original card");
     assert.equal(await present.locator(".aoClaudeHolyFront").getAttribute("aria-hidden"),"true");
     await page.locator(base+" [data-p435930-essential-aa]").click();
     const language=page.locator(base+' [data-p435930-essential-language="en"]');
     assert.equal(await language.count(),1,"Approved Aa menu must expose available source English");
     await language.click();
     assert.equal(await present.locator(".aoClaudeHolyBackScroll .aoP435930EssentialBeat[lang=en]").count()>0,true);
     assert.equal(await present.locator(".aoClaudeHolyBack").getAttribute("aria-hidden"),"false",
      "Changing language must not reset the reading side of the Holy Card");
     await page.screenshot({path:resolve(output,id+"-prayer-"+width+".png"),animations:"disabled"});
     // Keyboard activation targets the reversible card itself rather than
     // a prayer paragraph, which intentionally captures its own clicks.
     await turn.press("Enter");
     assert.equal(await present.locator(".aoClaudeHolyFront").getAttribute("aria-hidden"),"false",
      "Card must flip back without losing the original source owner");
     await page.screenshot({path:resolve(output,id+"-"+width+".png"),animations:"disabled"});
    }
   }
   const overflow=await page.evaluate(()=>({
    document:Math.max(0,document.documentElement.scrollWidth-innerWidth),
    sheet:(()=>{const e=document.querySelector("#aoPray435930.open .aoP435930Mount");return e?Math.max(0,e.scrollWidth-e.clientWidth):999;})()
   }));
   assert.ok(overflow.document<=2&&overflow.sheet<=2,"F01 Holy Card clips at "+width+"px "+JSON.stringify(overflow));
   assert.deepEqual(errors,[],"F01 browser errors: "+JSON.stringify(errors));
   console.log("PASS F01 default "+width+"px: 32 Holy Card source owners, front/back, flip, EN options and original artwork gates");
  }finally{await page.close();}
 }
 // The newer continuous reader remains an explicit, separate alternative.
 const alt=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  await alt.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoEssentialFlow=1",{waitUntil:"domcontentloaded",timeout:90000});
  await alt.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
  await alt.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
  await alt.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  assert.equal(await alt.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
  await alt.locator('#aoPray435930.open [data-p435930-lib-open="foundations_hail_mary"]').click();
  assert.equal(await alt.locator('#aoPray435930.open .aoEssentialFlow[data-ao-essential-card="foundations_hail_mary"]').count(),1,
   "Explicit continuous-reading alternative must survive F01 restoration");
  assert.equal(await alt.locator("#aoPray435930.open .aoClaudeHolyCard").count(),0);
  console.log("PASS F01 explicit continuous-reading alternative");
 }finally{await alt.close();}
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
