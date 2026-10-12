import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/rosary-canonical-phone-controls");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
 const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
 if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
 res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
 res.end(await readFile(p));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block"});
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:45000});
   const nav=await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"));
   assert.equal(nav.ok,true,"Cannot open Prayer");
   const launch=await page.evaluate(()=>window.AO_PRAY_V435930?.open?.("pray.rosary_methods"));
   assert.equal(launch,true,"Cannot open preserved Methods owner");
   await page.locator('#aoPray435930 [data-p435930-rosary-begin]').click();
   // The historical donor has two distinct states: initial Rosary selection
   // and the active bead. Both must be accessible without inventing a reader.
   const player=page.locator('#aoPrayerBookRoot.open');
   await player.waitFor({state:"visible",timeout:20000});
   await player.locator('.aoP435930RosaryBar').waitFor({state:"attached",timeout:20000});
   const metric=await page.evaluate(()=>{
    const root=document.querySelector('#aoPrayerBookRoot.open');
    const get=(selector)=>[...root.querySelectorAll(selector)].filter(x=>x.getClientRects().length>0).map(x=>{
      const box=x.getBoundingClientRect(),style=getComputedStyle(x);
      return {text:x.textContent.trim().slice(0,60),height:box.height,width:box.width,font:parseFloat(style.fontSize),
       pressed:x.getAttribute("aria-pressed"),tag:x.tagName,visible:style.visibility};
    });
    return {
      depth:get('.aoP435930RosaryBar button'),
      recitation:get('.r29-head-recitation button,.lab-recitation-mode button,[data-ao-recitation]'),
      guide:get('.aoRosaryGuide>summary'),
      sources:get('.aoRosaryScriptureOpening a,.aoRosaryGuidedBeadMeditation a[data-ao-rosary-meditation-source]'),
      overflow:document.documentElement.scrollWidth-innerWidth,
      playerCount:document.querySelectorAll('#aoPrayerBookRoot.open').length,
      state:window.AO_ROSARY_V381?.state?.()?.step,
      method:window.AO_ROSARY_V381?.getMethod?.()
    };
   });
   console.log("OPENING DOM "+width+"px "+JSON.stringify(metric));
   // Temporary acceptance instrumentation: report the original donor DOM
   // hierarchy before reordering any controls or replacing any donor node.
   if(width===320)console.log("DONOR ENTRY TOPOLOGY "+JSON.stringify(await page.evaluate(()=>{
    const root=document.querySelector("#aoPrayerBookRoot.open");
    const shell=root?.querySelector(".pbShell");
    const today=[...root.querySelectorAll("button")].find(x=>/Pray today.s mysteries/i.test(x.textContent||""));
    const ancestors=[];let node=today;while(node&&node!==root&&ancestors.length<9){
      ancestors.push({tag:node.tagName,cls:node.className,txt:(node.textContent||"").trim().slice(0,130)});
      node=node.parentElement;
    }
    const children=[...shell?.children||[]].map(x=>({tag:x.tagName,cls:x.className,text:(x.textContent||"").trim().slice(0,100),html:x.outerHTML.slice(0,280)}));
    const buttons=[...root.querySelectorAll("button")].slice(0,24).map(x=>({text:(x.textContent||"").trim().slice(0,60),
      attrs:[...x.attributes].filter(a=>a.name.startsWith("data-")).map(a=>[a.name,a.value]),
      parent:x.parentElement?.className}));
    return {today:today?.outerHTML.slice(0,480),ancestors,children,buttons};
   })));
   assert.equal(metric.playerCount,1,"Duplicate canonical Rosary active root");
   assert.equal(metric.depth.length,2,"Missing simple/guided options");
   assert.ok(metric.recitation.length>=2,"Missing individual/group options");
   assert.equal(metric.guide.length,1,"Historical guide lost");
   assert.ok(metric.depth.every(x=>x.height>=44&&x.font>=12),
     "Simple/Guided touch/label size below accessibility floor: "+JSON.stringify(metric.depth));
   assert.ok(metric.recitation.every(x=>x.height>=44&&x.font>=12),
     "Recitation touch/label size below accessibility floor: "+JSON.stringify(metric.recitation));
   assert.ok(metric.guide.every(x=>x.height>=44),"Guide summary not reachable");
   assert.ok(metric.sources.every(x=>x.height>=44),"Source action too small");
   assert.ok(metric.overflow<=1,"Canonical Rosary caused horizontal document overflow");
   await page.screenshot({path:resolve(captures,"rosary-phone-controls-"+width+".png"),
    fullPage:false,animations:"disabled"});

   // Changing the native reader's presentation controls must not advance a bead
   // or change its canonical Rosary method. No alternative engine is mounted.
   await player.locator('[data-p435930-rosary-depth="simple"]').click();
   await page.waitForFunction(()=>document.querySelector('#aoPrayerBookRoot [data-p435930-rosary-depth="simple"]')?.getAttribute("aria-pressed")==="true",
      null,{timeout:10000});
   const group=player.locator('[data-p435930-recitation="group"],[data-ao-recitation="group"]').first();
   await group.click();
   await page.waitForFunction(()=>[
     ...document.querySelectorAll('#aoPrayerBookRoot [data-p435930-recitation="group"],#aoPrayerBookRoot [data-ao-recitation="group"]')
    ].some(x=>x.getAttribute("aria-pressed")==="true"),null,{timeout:10000});
   const after=await page.evaluate(()=>({step:window.AO_ROSARY_V381?.state?.()?.step,
    method:window.AO_ROSARY_V381?.getMethod?.(),visible:document.querySelectorAll('#aoPrayerBookRoot.open').length}));
   assert.equal(after.step,metric.state,"Changing recitation depth advanced Rosary bead");
   assert.equal(after.method,metric.method,"Changing view mode changed historical method");
   assert.equal(after.visible,1,"Canonical Rosary donor replaced by competing reader");
   assert.deepEqual(errors,[],"Uncaught reader errors: "+errors.slice(0,5).join("; "));
   console.log("PASS "+width+"px canonical Rosary: 44px controls, source, guide, no overflow/state mutation");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
