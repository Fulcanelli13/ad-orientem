import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance/reference-app-lifecycle");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try {
  const relative=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const filepath=resolve(root,"."+relative);
  if(filepath!==root&&!filepath.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const data=await readFile(filepath);
  res.writeHead(200,{"content-type":mime[extname(filepath)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((resolveReady,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolveReady);});
const origin="http://127.0.0.1:"+server.address().port;
let browser;
const cases=[];
try {
 browser=await chromium.launch({headless:true});
 for(const device of [
  {name:"phone",width:390,height:844,isMobile:true,hasTouch:true},
  {name:"desktop",width:1280,height:900,isMobile:false,hasTouch:false}
 ]){
  const context=await browser.newContext({viewport:{width:device.width,height:device.height},
   isMobile:device.isMobile,hasTouch:device.hasTouch,deviceScaleFactor:device.isMobile?2:1});
  const page=await context.newPage();
  try {
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner),
    null,{timeout:35000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_LEARN_APP_V1?.open&&globalThis.AO_MODULES?.open),
    null,{timeout:35000});
   for(const [route,rootId,sourceSelector,unitSelector] of [
    ["learn.mass","#ao-mass-formation-root",".aoReferencePanel","[data-ao-evidence-row]"],
    ["learn.spiritual_life","#ao-spiritual-life-root",".aoSLSources","[data-ao-sl-evidence-block]"]
   ]) {
    const launched=await page.evaluate(async target=>{
      const learn=globalThis.AO_LEARN_APP_V1;
      if(learn.status().open)learn.close();
      const opened=learn.open();
      const result=opened&&await learn.openModule(target,
       target==="learn.mass"?{stageId:"MF01"}:{lessonId:"SL01"});
      return {opened,result,hub:learn.status()};
    },route);
    assert.equal(launched.opened,true,device.name+" Learn hub cannot open");
    assert.equal(launched.result,true,device.name+" "+route+" not reachable through the canonical Learn owner");
    const surface=page.locator(rootId);
    await surface.waitFor({state:"visible",timeout:25000});
    const drawer=surface.locator(sourceSelector).first();
    await drawer.waitFor({state:"attached",timeout:10000});
    assert.equal(await drawer.getAttribute("open"),null,"Sources are not folded on entry: "+route);
    const first=await surface.evaluate(el=>({width:el.getBoundingClientRect().width,
      overflow:el.scrollWidth-el.clientWidth}));
    assert.ok(first.width<=device.width+2,route+" width exceeds viewport");
    assert.ok(first.overflow<=3,route+" has reader overflow");
    const name=device.name+"-"+route.replace(/\W+/g,"-");
    await page.screenshot({path:resolve(out,name+"-reading.png"),fullPage:false});
    await drawer.locator("summary").first().click();
    assert.notEqual(await drawer.getAttribute("open"),null,route+" disclosure did not open");
    const nested=surface.locator(route==="learn.mass"?".aoRefEvidence":".aoSLEvidence").first();
    await nested.locator("summary").first().click();
    const count=await nested.locator(unitSelector).count();
    assert.ok(count>0,route+" has no claim-scoped evidence");
    const bad=await drawer.evaluate(el=>[...el.querySelectorAll('a[href]')].filter(a=>
      a.protocol!=="https:"||a.target!=="_blank"||!a.rel.includes("noopener")).length);
    assert.equal(bad,0,route+" has unsafe external source link");
    const overflow=await surface.evaluate(el=>el.scrollWidth-el.clientWidth);
    assert.ok(overflow<=3,route+" sources overflow screen");
    await drawer.scrollIntoViewIfNeeded();
    await page.screenshot({path:resolve(out,name+"-expanded.png"),fullPage:false});
    cases.push({device:device.name,route,claimEvidenceSections:count,overflowPx:overflow});
    // Closing Learn must not leave orphaned source readers covering Home.
    await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.close());
    await page.waitForFunction(sel=>!document.querySelector(sel),rootId,{timeout:8000});
   }
  }finally{await page.close();await context.close();}
 }
 assert.equal(cases.length,4);
 console.log(JSON.stringify({result:"PASS_REFERENCE_APP_LIFECYCLE",cases,
  screenshots:cases.length*2,formationUnpublished:"NOT_OPENED_OR_PUBLISHED"},null,2));
} finally {await browser?.close();await new Promise(resolveDone=>server.close(resolveDone));}
