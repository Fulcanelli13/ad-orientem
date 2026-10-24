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
 for(const width of [320,390,430,768,1280]){
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
   // Artwork can resolve after shell boot. Distinguish approved painting,
   // a legitimate no-art day, and the remote resolver's transient placeholder.
   if(width===390||width===768||width===1280){
     // Resolve optional asynchronous saint art where the external provider
     // permits it. A source-approved no-art state is allowed to finish first.
     await page.waitForFunction(()=>{
       const card=document.querySelector(".homeScreen .aoSaintArtCard");
       const placeholder=card?.querySelector(".aoSaintArtPlaceholder");
       return !placeholder||!/Resolving artwork|Résolution de l’œuvre/i.test(placeholder.textContent||"");
     },null,{timeout:15000}).catch(()=>{});
     const artwork=await page.evaluate(()=>{
       const hero=document.querySelector(".homeScreen .aoTodayV2Frontispiece");
       const slot=hero?.querySelector("[data-ao-home-art-slot]");
       const image=slot?.querySelector("img");
       const text=(slot?.innerText||"").trim().slice(0,180);
       return {missing:hero?.classList.contains("aoTodayV2ArtMissing"),
         text,imageSrc:image?.getAttribute("src")||null,
         imageLoaded:Boolean(image?.complete&&image?.naturalWidth>0),
         media:slot?.querySelectorAll("img,picture source,video[poster],canvas").length||0,
         markup:(slot?.innerHTML||"").slice(0,500)};
     });
     console.log("QUIET_TODAY_ART "+width+"px "+JSON.stringify(artwork));
     await page.screenshot({path:resolve(out,"today-"+width+".png"),fullPage:false,animations:"disabled"});
   }
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
   const landingIndex=await page.evaluate(()=>{
     const root=document.querySelector("#ao-learn-modular-root");
     const navigator=root.querySelector(":scope > .aoFNav");
     return {isLanding:root.dataset.aoLearnFamily==="",visible:Boolean(navigator&&getComputedStyle(navigator).display!=="none")};
   });
   if(landingIndex.isLanding)assert.equal(landingIndex.visible,false,
     "Reader-only section navigator is crowding the Formation landing screen");
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
   await page.locator("#aoPray435930.open .aoP435930RootOrganised").waitFor({state:"visible",timeout:18000});
   // Quiet-frame acceptance: the first fold has six canonical entries and
   // the entire original catalogue remains reachable after disclosure.
   const featured=await page.locator("#aoPray435930 .aoP435930QuietTiles>.aoP435930QuietTile").count();
   assert.equal(featured,6,"Pray should show six featured routes at "+width+"px");
   const libraryRows=await page.locator("#aoPray435930 .aoP435930QuietLibraryRow").count();
   assert.equal(libraryRows,4,"Pray library shortcuts or My Customs entry missing at "+width+"px");
   await page.screenshot({path:resolve(out,"pray-"+width+".png"),fullPage:false,animations:"disabled"});
   await page.locator("#aoPray435930 .aoP435930QuietMore>summary").click();
   const prayer=await page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open .aoP435930RootOrganised");
    const old=root?.querySelector(".aoP435930QuietMore");
    const visible=selector=>[...root.querySelectorAll(selector)].filter(el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=="none"&&s.visibility!=="hidden"&&r.height>0&&r.width>0;
    });
    const tiles=visible(".aoP435930QuietTile");
    const descriptions=visible(".aoP435930QuietMoreContent .aoP435930ModuleDescription");
    const familyDoors=visible(".aoP435930QuietMoreContent [data-p435930-family]");
    const font=el=>parseFloat(getComputedStyle(el).fontSize);
    return {root:!!root,expanded:!!old?.open,tiles:tiles.length,
      tileText:tiles.map(b=>font(b.querySelector("b"))),
      descriptionFonts:descriptions.map(font),familyDoors:familyDoors.length,
      scrollWidth:document.documentElement.scrollWidth,innerWidth};
   });
   assert.equal(prayer.expanded,true,"Full prayer catalogue disclosure did not open");
   assert.equal(prayer.tiles,6,"Six canonical Prayer entries not visible");
   assert.ok(prayer.tileText.every(px=>px>=16),"Featured prayer labels too small: "+JSON.stringify(prayer));
   assert.ok(prayer.familyDoors>=5&&prayer.descriptionFonts.length>=5,
     "Original Prayer families unavailable after disclosure at "+width+"px: "+JSON.stringify(prayer));
   assert.ok(prayer.descriptionFonts.every(px=>px>=13),
     "Prayer family descriptions below 13px: "+JSON.stringify(prayer));
   assert.ok(prayer.scrollWidth<=prayer.innerWidth+1,"Prayer overflow at "+width+"px");
   console.log("PASS "+width+"px: "+formation.cards+" formation subjects, "+
     prayer.tiles+" Prayer features, "+prayer.familyDoors+" retained families, no viewport overflow");
   // Cross-surface quiet-frame QA. Real browser snapshots and computed style
   // values, with navigation still owned by AO_APP_SHELL_V1. Skip duplicate
   // captures at narrow widths (Formation and Pray are covered at all sizes).
   if(width===390||width===768||width===1280){
     const openedSettings=await page.evaluate(async()=>await window.AO_APP_SHELL_V1.navigate("settings"));
     assert.equal(openedSettings?.ok,true,"Settings utility overlay not routable");
     await page.locator("#ao-settings-modular-root .aoSetRow").first().waitFor({state:"visible",timeout:15000});
     const settings=await page.evaluate(()=>{
       const r=document.querySelector("#ao-settings-modular-root");
       const row=r.querySelector(".aoSetRow"),header=r.querySelector(".aoSetTop");
       return {bg:getComputedStyle(r).backgroundColor,header:getComputedStyle(header).backgroundColor,
         rowHeight:row.getBoundingClientRect().height,
         rowFont:parseFloat(getComputedStyle(row.querySelector(".aoSetRowText b")).fontSize),
         scroll:document.documentElement.scrollWidth,viewport:innerWidth};
     });
     assert.equal(settings.bg,"rgb(11, 15, 19)","Settings missing shared quiet-frame background");
     assert.equal(settings.header,settings.bg,"Settings header drifted from quiet-frame palette");
     assert.ok(settings.rowHeight>=64&&settings.rowFont>=16,"Settings touch rows or labels are undersized: "+JSON.stringify(settings));
     assert.ok(settings.scroll<=settings.viewport+1,"Settings horizontal overflow: "+JSON.stringify(settings));
     const closeLayers=await page.evaluate(()=>{
       const near=[];
       for(const el of document.querySelectorAll("button,[role=button]")){
         const rect=el.getBoundingClientRect();
         if(rect.width<=0||rect.height<=0||rect.top>86||rect.right<innerWidth-67)continue;
         const a=(el.getAttribute("aria-label")||"").toLowerCase();
         if(!/close|fermer|dismiss|exit/.test(a)&&!el.hasAttribute("data-settings-close"))continue;
         near.push({selector:el.outerHTML.slice(0,450),root:el.closest("#ao-settings-modular-root")?"settings":"external",
           box:{x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.width),h:Math.round(rect.height)},
           display:getComputedStyle(el).display,visibility:getComputedStyle(el).visibility,
           z:getComputedStyle(el).zIndex});
       }
       return near;
     });
     console.log("QUIET_SETTINGS_CLOSE_LAYERS "+width+"px "+JSON.stringify(closeLayers));
     const headerGlyphs=await page.evaluate(()=>[...document.querySelectorAll("#ao-settings-modular-root .aoSetTop button")].map(btn=>({
       action:btn.getAttribute("aria-label"),
       visibleIcons:[...btn.querySelectorAll(".aoUiIcon,.aoSetTopIcon")].filter(icon=>{
         const css=getComputedStyle(icon),r=icon.getBoundingClientRect();
         return css.display!=="none"&&css.visibility!=="hidden"&&r.width>0&&r.height>0;
       }).length
     })));
     assert.ok(headerGlyphs.length>=1&&headerGlyphs.every(x=>x.visibleIcons===1),
       "Settings header must render one canonical icon per action: "+JSON.stringify(headerGlyphs));

     await page.screenshot({path:resolve(out,"settings-"+width+".png"),fullPage:false,animations:"disabled"});

     const openedExplore=await page.evaluate(async()=>await window.AO_APP_SHELL_V1.navigate("find"));
     assert.equal(openedExplore?.ok,true,"Explore destination not routable");
     await page.locator("#ao-find-modular-root .aoHeritageSurface>.aoFindHeader").waitFor({state:"visible",timeout:60000});
     const explore=await page.evaluate(()=>{
       const header=document.querySelector("#ao-find-modular-root .aoHeritageSurface>.aoFindHeader");
       const r=header.getBoundingClientRect();
       return {bg:getComputedStyle(header).backgroundColor,height:r.height,width:r.width,
         scroll:document.documentElement.scrollWidth,viewport:innerWidth};
     });
     assert.equal(explore.bg,"rgb(11, 15, 19)","Explore default map header missing quiet-frame palette");
     assert.ok(explore.height>=44&&explore.width>=width-4,"Explore map header clipped: "+JSON.stringify(explore));
     assert.ok(explore.scroll<=explore.viewport+1,"Explore horizontal overflow: "+JSON.stringify(explore));
     // The third-party MapLibre module/style are independent of directory
     // data and may fail in CI. Capture the *settled* map, not a blank loader.
     // Do not capture a premature blank MapLibre canvas at tablet/desktop
     // sizes. Ready, stalled, and unavailable are meaningful settled states.
     await page.waitForFunction(()=>{
       const node=document.querySelector("#ao-find-modular-root .aoHeritageSurface [data-find-map]");
       return ["ready","stalled","unavailable","empty"].includes(node?.dataset.aoMapState);
     },null,{timeout:18000}).catch(()=>{});
     const mapState=await page.evaluate(()=>{
       const el=document.querySelector("#ao-find-modular-root .aoHeritageSurface [data-find-map]");
       const canvas=el?.querySelector("canvas.maplibregl-canvas");
       const fallback=el?.querySelector(".aoExploreMapLoading,.aoFindMapFallback");
       return {state:el?.dataset.aoMapState||null,
         canvas:canvas?{width:canvas.width,height:canvas.height}:null,
         fallback:(fallback?.innerText||"").trim().slice(0,240),
         feedbackVisible:Boolean(fallback&&getComputedStyle(fallback).display!=="none"),
         html:(el?.innerHTML||"").slice(0,280)};
     });
     console.log("QUIET_EXPLORE_MAP "+width+"px "+JSON.stringify(mapState));
     assert.notEqual(mapState.state,"loading","Explore map still silently loading after watchdog interval at "+width+"px");
     await page.screenshot({path:resolve(out,"explore-"+width+".png"),fullPage:false,animations:"disabled"});
     if(width===390){
       // The actual French setting, rather than browser-locale emulation.
       assert.equal((await page.evaluate(async()=>await window.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
       await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
       await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
       await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:12000});
       const french=await page.evaluate(()=>{
         const root=document.querySelector("#ao-settings-modular-root");
         const nodes=[...root.querySelectorAll(".aoSetRowText,.aoSetTitle,.aoSetSection>h2")];
         return {language:document.documentElement.lang,scroll:root.scrollWidth,viewport:root.clientWidth,
           maxOverflow:nodes.reduce((v,el)=>Math.max(v,el.scrollWidth-el.clientWidth),0)};
       });
       assert.ok(french.scroll<=french.viewport+1&&french.maxOverflow<=2,
         "French Settings text overflow at 390px: "+JSON.stringify(french));
       await page.screenshot({path:resolve(out,"settings-fr-390.png"),fullPage:false,animations:"disabled"});
     }
     console.log("PASS "+width+"px quiet frame Settings/Explore chrome and screenshots");
   }
   assert.equal(errors.length,0,"Browser errors at "+width+"px: "+errors.slice(0,3).join("; "));
  }finally{await context.close();}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
