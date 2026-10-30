// Focused production-browser acceptance for non-Mass phone readability.
// No localization, liturgical source or content edits.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/nonmass-phone-readability");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
  ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://127.0.0.1");
  const file=resolve(root,"."+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error.code==="ENOENT"?404:500);res.end(String(error.message));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes);});
const base="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430,768]){
  const height=width===768?1000:width===320?700:width===390?844:932;
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,
    isMobile:width<600,deviceScaleFactor:1,locale:"en-GB",reducedMotion:"reduce"});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error.message||error)));
  try{
   await page.goto(base+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
     null,{timeout:35000});
   await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),
     null,{timeout:18000});
   await page.locator('[data-ao-app-surface="learn"]').click();
   await page.locator("#ao-learn-modular-root .aoLearnFamilyGrid").waitFor({state:"visible",timeout:18000});
   const formation=await page.evaluate(()=>{
    const root=document.querySelector("#ao-learn-modular-root");
    const cards=[...root.querySelectorAll(".aoLearnFamilyGrid .aoLearnFamilyCard")];
    const buttons=cards.map(card=>card.querySelector(".aoLearnFamilyDoor"));
    const boxes=cards.map(card=>{const r=card.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};});
    const desc=buttons.map(b=>b.querySelector("p")).filter(Boolean).map(el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return {display:s.display,font:parseFloat(s.fontSize),height:r.height,text:el.textContent.trim()};
    });
    return {cards:cards.length,boxes,desc,
      scrollWidth:document.documentElement.scrollWidth,innerWidth,
      clickTargets:buttons.map(b=>b.getBoundingClientRect().height)};
   });
   assert.ok(formation.cards>=8,"Formation subjects missing at "+width+"px");
   if(width<=430){
     const duplicate=await page.evaluate(()=>{
       const root=document.querySelector("#ao-learn-modular-root");
       return {
         shell:getComputedStyle(root.querySelector(".aoLearnModTopTitle strong")).display,
         kicker:getComputedStyle(root.querySelector(".aoLearnModHero .kicker")).display,
         h1:root.querySelector(".aoLearnModHero h1")?.getBoundingClientRect().height||0
       };
     });
     assert.equal(duplicate.shell,"none","Formation home must not repeat its hero title in sticky chrome");
     assert.equal(duplicate.kicker,"none","Formation home must not repeat the page label");
     assert.ok(duplicate.h1>25,"The actual Formation heading must remain visible");
   }
   if(width<=430){
    assert.ok(formation.boxes.every(x=>x.w>=width-45),
      "Phone Formation family rows remain cramped: "+JSON.stringify(formation.boxes.slice(0,2)));
    assert.ok(formation.boxes.slice(1).every((b,i)=>b.y>formation.boxes[i].y+8),
      "Phone Formation still uses two horizontal columns");
    assert.ok(formation.desc.every(x=>x.display!=="none"&&x.height>0&&x.font>=13),
      "Phone Formation descriptions hidden or unreadable: "+JSON.stringify(formation.desc));
    assert.ok(formation.clickTargets.every(h=>h>=44),
      "Phone Formation has an undersized subject target");
   }else{
    assert.ok(formation.boxes[1].y<formation.boxes[0].y+10,
      "Tablet Formation lost its two-column scannability");
   }
   assert.ok(formation.scrollWidth<=formation.innerWidth+1,"Formation overflow at "+width+"px");
   await page.screenshot({path:resolve(out,"formation-"+width+".png"),fullPage:false,animations:"disabled"});
   await page.locator('[data-ao-app-surface="pray"]').click();
   // Current Prayer uses the source-owned nine-door mosaic by default.
   // The classic organised family screen is an explicit ?aoPrayerPilot=0 mode.
   // Both must remain readable, but they do not share DOM card names.
   const opened=await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true&&
     !!document.querySelector(
       "#aoPray435930.open :is(.aoPrayPilotHome,.aoP435930RootOrganised)"),
     null,{timeout:18000}).then(()=>true,()=>false);
   if(!opened){
     const state=await page.evaluate(()=>({
       route:globalThis.AO_APP_SHELL_V1?.getActive?.(),
       owner:globalThis.AO_PRAY_APP_V1?.status?.(),
       donorView:globalThis.AO_PRAY_V435930?.state?.()?.view,
       mount:document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset.aoPrayView,
       classes:document.getElementById("aoPray435930")?.className,
     }));
     throw Error("Formation -> Pray navigation failed: "+JSON.stringify({...state,errors}));
   }
   const prayer=await page.evaluate(()=>{
     const root=document.querySelector("#aoPray435930.open :is(.aoPrayPilotHome,.aoP435930RootOrganised)");
     const pilot=root?.classList.contains("aoPrayPilotHome")??false;
     const visible=selector=>[...root.querySelectorAll(selector)].filter(el=>{
       const s=getComputedStyle(el),r=el.getBoundingClientRect();
       return s.display!=="none"&&s.visibility!=="hidden"&&r.height>0&&r.width>0;
     });
     const font=el=>parseFloat(getComputedStyle(el).fontSize);
     const tiles=visible(pilot?".aoPrayPilotTile":".aoP435930ModuleCard");
     const kind=visible(".aoP435930ModuleKind");
     const descriptions=visible(".aoP435930ModuleDescription");
     const labels=visible(".aoPrayPilotTileCaption");
     const intro=visible(".aoPrayPilotIntro");
     const search=visible(".aoPrayPilotSearch");
     return {pilot,root:!!root,tiles:tiles.length,
       tileHeights:tiles.map(el=>el.getBoundingClientRect().height),
       labels:labels.map(font),intro:intro.map(font),
       searchHeight:search[0]?.getBoundingClientRect().height??null,
       kind:kind.map(font),descriptions:descriptions.map(font),
       scrollWidth:document.documentElement.scrollWidth,innerWidth};
   });
   if(prayer.pilot){
     assert.equal(prayer.tiles,9,"Current Prayer mosaic must expose nine source-owned category doors");
     assert.ok(prayer.tileHeights.every(h=>h>=44),"Nine-door Prayer mosaic has small touch targets");
     assert.ok(prayer.labels.every(px=>px>=11),"Mosaic labels unreadable: "+JSON.stringify(prayer));
     assert.ok(prayer.intro.length&&prayer.intro.every(px=>px>=13),
       "Current Pray discovery introduction is too small");
     assert.ok(prayer.searchHeight>=40,"Prayer search target too small");
   }else{
     assert.ok(prayer.kind.length>=4&&prayer.descriptions.length>=4,
       "Classic Prayer family list unavailable at "+width+"px");
     assert.ok(prayer.kind.every(px=>px>=11),"Classic Prayer category type too small");
     assert.ok(prayer.descriptions.every(px=>px>=13),
       "Classic Prayer descriptions below 13px: "+JSON.stringify(prayer));
   }
   assert.ok(prayer.scrollWidth<=prayer.innerWidth+1,"Prayer overflow at "+width+"px");
   await page.screenshot({path:resolve(out,"pray-"+width+".png"),fullPage:false,animations:"disabled"});
   assert.equal(errors.length,0,"Browser errors at "+width+"px: "+errors.slice(0,3).join("; "));
   console.log("PASS "+width+"px: "+formation.cards+" formation subjects, "+
     (prayer.pilot?prayer.tiles:prayer.kind.length)+" Prayer doors, no viewport overflow");
  }finally{await context.close();}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
