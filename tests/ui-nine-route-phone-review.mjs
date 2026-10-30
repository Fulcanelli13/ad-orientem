// Ported from historical PR #1050; no production UI changes.
// All old observations are triage evidence, not automatic current defects.
// Read-only, release-gated visual evidence for UI/UX review.
// Captures actual production routes. Never changes liturgical data or UI code.
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/ui-nine-route-phone-review");
const widths=[{width:320,height:700},{width:390,height:844},{width:430,height:932}];
const languages=["en","fr"];
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
await mkdir(output,{recursive:true});
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
  const content=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(content);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
const origin="http://127.0.0.1:"+server.address().port;
const rows=[];
let browser;
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
try {
 browser=await chromium.launch({headless:true});
 for(const view of widths)for(const language of languages){
  const context=await browser.newContext({
   viewport:view,deviceScaleFactor:1,isMobile:true,hasTouch:true,
   locale:language==="fr"?"fr-FR":"en-GB",reducedMotion:"reduce"
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  const label=language+"-"+view.width;
  async function measure(selector){
   return await page.evaluate(sel=>{
    const element=document.querySelector(sel)||document.body;
    const visible=el=>{
     if(!el?.isConnected)return false;
     const c=getComputedStyle(el),r=el.getBoundingClientRect();
     return c.display!=="none"&&c.visibility!=="hidden"&&r.width>0&&r.height>0;
    };
    const rect=element.getBoundingClientRect();
    const micro=[...element.querySelectorAll("small,span,p,button,strong,label,summary")]
     .filter(el=>visible(el)&&el.children.length===0&&(el.textContent||"").trim().length>1)
     .map(el=>({el,px:parseFloat(getComputedStyle(el).fontSize)}))
     .filter(x=>x.px<11)
     .slice(0,12).map(x=>({px:x.px,text:x.el.textContent.trim().slice(0,60),
       className:typeof x.el.className==="string"?x.el.className.slice(0,90):""}));
    const smallTargets=[...element.querySelectorAll("button,select,input,summary,a[href]")]
     .filter(el=>visible(el)).map(el=>({el,rect:el.getBoundingClientRect()}))
     .filter(x=>x.rect.width<40||x.rect.height<40).slice(0,12)
     .map(x=>({text:(x.el.getAttribute("aria-label")||x.el.textContent||"").trim().slice(0,60),
      width:Math.round(x.rect.width),height:Math.round(x.rect.height)}));
    const style=getComputedStyle(element);
    return {
     root:sel,rootFound:!!document.querySelector(sel),
     rootRect:{x:Math.round(rect.x),y:Math.round(rect.y),width:Math.round(rect.width),height:Math.round(rect.height)},
     background:style.backgroundColor,viewport:{width:innerWidth,height:innerHeight},
     horizontalOverflowPx:Math.max(0,document.documentElement.scrollWidth-innerWidth),
     microTextSamples:micro,smallTargetSamples:smallTargets,
     navigationButtons:document.querySelectorAll("#ao-global-ribbon [data-ao-app-surface]").length,
     activeSurface:window.AO_APP_SHELL_V1?.getActive?.()||null,
     language:window.AO_RUNTIME_V8?.store?.getState?.()?.language||null
    };
   },selector);
  }
  async function capture(name,selector,open){
   const record={width:view.width,height:view.height,language,name,selector,status:"pending"};
   try{
    if(open)await open();
    await page.locator(selector).first().waitFor({state:"visible",timeout:22000});
    // Remote image bytes can follow the already-mounted Home artwork node.
    // Wait for complete/decode state so a screenshot isn't falsely classified
    // as an empty or rejected painting. Capture failures remain review-only.
    if(name==="today"){
      await page.waitForFunction(()=>{
        const images=[...(document.querySelector("[data-ao-home-art-slot]")
          ?.querySelectorAll("img")??[])];
        return !images.length || images.every(x=>x.complete);
      },null,{timeout:8000}).catch(()=>{});
      record.artVisual=await page.evaluate(()=>{
        const images=[...(document.querySelector("[data-ao-home-art-slot]")
          ?.querySelectorAll("img")??[])];
        return {imageCount:images.length,
          decoded:images.filter(x=>x.complete&&x.naturalWidth>0).length,
          pending:images.filter(x=>!x.complete).length,
          broken:images.filter(x=>x.complete&&x.naturalWidth===0).length,
          noArtFallback:!!document.querySelector(".aoTodayV2ArtMissing")};
      });
      record.artAcceptance=record.artVisual.noArtFallback
        ?"NO_ART_FALLBACK_NEEDS_EDITORIAL_CHECK"
        :record.artVisual.imageCount&&record.artVisual.decoded===record.artVisual.imageCount
          ?"IMAGE_LOADED_NEEDS_VISUAL_REVIEW":"ART_UNVERIFIED";
    }
    // MapLibre's map 'load' can precede asynchronously painted GeoJSON
    // clusters. Give only Explore time to paint before screenshot comparison.
    await sleep(name==="explore"?1100:180);
    const filename=label+"-"+name+".png";
    await page.screenshot({path:resolve(output,filename),fullPage:false,animations:"disabled"});
    Object.assign(record,{status:"captured",filename,metrics:await measure(selector)});
    // A captured Explore route is NOT proof that remote tiles have painted.
    // Keep the physical map acceptance state separate from screenshot existence.
    if(name==="explore"){
      record.mapVisual=await page.evaluate(()=>{
        const map=document.querySelector("#ao-find-modular-root .aoFindMap");
        const canvas=map?.querySelector(".maplibregl-canvas, canvas");
        const box=canvas?.getBoundingClientRect();
        const css=canvas?getComputedStyle(canvas):null;
        const canvasVisible=Boolean(box?.width>10&&box?.height>10&&css?.display!=="none"&&css?.visibility!=="hidden");
        const mapState=map?.dataset.aoMapState||"unmarked";
        return {mapState,localDataState:window.AO_FIND_APP_V1?.status?.().loadState||"unknown",
          canvasPresent:Boolean(canvas),canvasVisible,
          renderedCandidate:mapState==="ready"&&canvasVisible,
          notice:map?.querySelector(".aoExploreMapLoading,.aoFindMapFallback")?.textContent?.trim()?.slice(0,200)||null};
      });
      record.mapAcceptance=record.mapVisual.renderedCandidate
        ?"RENDERED_CANDIDATE_NEEDS_HUMAN_REVIEW":"MAP_UNVERIFIED";
    }
   }catch(e){record.status="missing";record.error=String(e.message||e).slice(0,350);}
   record.pageErrors=[...errors].slice(-12);
   rows.push(record);
   console.log(label+" "+name+" "+record.status+(record.error?" "+record.error:""));
  }
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>
    window.AO_APP_SHELL_V1?.status?.().visibleOwner===true &&
    !!document.querySelector(".homeScreen"),null,{timeout:35000});
   await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:15000});
   if(language==="fr"){
    await page.evaluate(()=>window.AO_SETTINGS_APP_V1.open("/settings/language-reading"));
    await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
    await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",
      null,{timeout:12000});
    await page.locator("#ao-settings-modular-root [data-settings-close]").click();
   }
   await capture("today",".homeScreen");
   await capture("calendar-month",".aoTodayV2CalendarInline #ao-calendar-modular-root",
    async()=>{
     await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
     await page.waitForFunction(()=>document.querySelector(
      '.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="picker"]'),
      null,{timeout:20000});
     // Do not confuse a half-populated month (e.g. 4/42) with the final grid.
     // Captures still proceed with partial data when transport is unavailable.
     await page.waitForFunction(()=>/42\s*\/\s*42/.test(
      document.querySelector(".aoTodayV2CalendarInline #ao-calendar-modular-root")?.textContent||""
     ),null,{timeout:20000}).catch(()=>{});
    });
   await capture("mass-entry","#ao-mass-flow-v1 .aoMassFlowBackdrop",
    async()=>{
     // Production's Mass entry is a Home action. Opening the ribbon alone
     // does not guarantee that the preflight backdrop has been requested.
     await page.locator('.aoTodayV2Tabs [data-home-calendar-today]').click();
     await page.waitForSelector('.homeScreen [data-home-mass-entry]',{state:"visible",timeout:15000});
     await page.locator('.homeScreen [data-home-mass-entry]').click();
     await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.getActive?.()==="mass",null,{timeout:12000});
    });
   await capture("pray-hub","#aoPray435930.open",
    async()=>{await page.locator('[data-ao-app-surface="pray"]').click()});
   await capture("rosary","#aoPrayerBookRoot.open .pbShell",
    async()=>{
     const result=await page.evaluate(()=>window.AO_PRAY_V435930?.open?.("pray.rosary",{returnContext:null}));
     if(result===false)throw Error("Canonical Rosary route rejected");
     await page.waitForFunction(()=>!!document.querySelector(
      "#aoPrayerBookRoot.open .pbShell"),null,{timeout:18000});
    });
   await capture("formation","#ao-learn-modular-root",
    async()=>{
     const back=page.locator("#aoPrayerBookRoot.open .lab-back").first();
     if(await back.count())await back.click();
     await page.waitForFunction(()=>!document.querySelector("#aoPrayerBookRoot.open"),null,{timeout:10000});
     await page.locator('[data-ao-app-surface="learn"]').click();
    });
   await capture("scripture","#ao-scripture-overlay:not([hidden])",
    async()=>{
     const opened=await page.evaluate(()=>window.AO_SCRIPTURE_CONTEXT_V1?.open?.("Luke 1:28"));
     if(!opened)throw Error("Scripture citation route rejected");
    });
   // Close the Scripture overlay before opening Explore.
   await page.evaluate(()=>window.AO_SCRIPTURE_APP_V1?.close?.());
   await capture("explore","#ao-find-modular-root",
    async()=>{
     await page.locator('[data-ao-app-surface="find"]').click();
     await page.waitForFunction(()=>window.AO_FIND_APP_V1?.status?.().loadState==="ready",
      null,{timeout:30000});
     // The dataset can be ready before an independently fetched MapLibre style.
     // Stop at actual map load or an explicit recoverable/unavailable state;
     // otherwise preserve the unresolved status rather than inventing readiness.
     await page.waitForFunction(()=>{
       const state=document.querySelector("#ao-find-modular-root .aoFindMap")?.dataset.aoMapState;
       return ["ready","stalled","unavailable","empty"].includes(state);
     },null,{timeout:17000}).catch(()=>{});
    });
   await capture("settings","#ao-settings-modular-root",
    async()=>{const ok=await page.evaluate(()=>window.AO_SETTINGS_APP_V1?.open?.());if(!ok)throw Error("Settings unavailable")});
  }catch(error){
   const known=new Set(rows.filter(r=>r.width===view.width&&r.language===language).map(r=>r.name));
   for(const name of ["today","calendar-month","mass-entry","pray-hub","rosary","formation","scripture","explore","settings"]){
    if(!known.has(name))rows.push({width:view.width,height:view.height,language,name,status:"missing",error:"Setup failure: "+String(error.message||error).slice(0,320)});
   }
   console.error(label+" setup: "+String(error.stack||error).slice(0,600));
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}

const summary={
 generatedAt:new Date().toISOString(),matrix:"3 viewport widths x 2 languages x 9 surfaces",
 total:rows.length,captured:rows.filter(x=>x.status==="captured").length,
 missing:rows.filter(x=>x.status!=="captured").length,
 exploreMap:{
  total:rows.filter(x=>x.name==="explore").length,
  renderedCandidates:rows.filter(x=>x.name==="explore"&&x.mapVisual?.renderedCandidate).length,
  unverified:rows.filter(x=>x.name==="explore"&&!x.mapVisual?.renderedCandidate)
   .map(x=>({language:x.language,width:x.width,mapState:x.mapVisual?.mapState||"missing",notice:x.mapVisual?.notice||null}))
 },
 todayArt:{
  loaded:rows.filter(x=>x.name==="today"&&x.artAcceptance==="IMAGE_LOADED_NEEDS_VISUAL_REVIEW").length,
  fallback:rows.filter(x=>x.name==="today"&&x.artAcceptance==="NO_ART_FALLBACK_NEEDS_EDITORIAL_CHECK").length,
  unverified:rows.filter(x=>x.name==="today"&&x.artAcceptance==="ART_UNVERIFIED")
    .map(x=>({language:x.language,width:x.width,detail:x.artVisual??null}))
 },
 horizontalOverflow:rows.filter(x=>x.metrics?.horizontalOverflowPx>1).map(x=>({
  case:x.language+"-"+x.width+"-"+x.name,pixels:x.metrics.horizontalOverflowPx
 })),
 rows
};
await writeFile(resolve(output,"matrix.json"),JSON.stringify(summary,null,2));
const htmlEscape=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const panels=rows.map(r=>{
 const label=htmlEscape(r.name+" · "+r.width+"px · "+r.language.toUpperCase());
 const image=r.filename?'<a href="'+r.filename+'"><img src="'+r.filename+'" loading="lazy" alt="'+label+'"></a>':'<p>Capture missing: '+htmlEscape(r.error||"unknown")+'</p>';
 const mapLabel=r.name==="explore"
  ?'<p><strong>Map visual: '+htmlEscape(r.mapAcceptance||"MAP_UNVERIFIED")
   +'</strong> · local data '+htmlEscape(r.mapVisual?.localDataState||"unknown")
   +' · map state '+htmlEscape(r.mapVisual?.mapState||"unknown")
   +' · canvas '+(r.mapVisual?.canvasVisible?"visible":"not confirmed")
   +(r.mapVisual?.notice?' · '+htmlEscape(r.mapVisual.notice):"")+'</p>'
  :"";
 return '<article><h2>'+label+'</h2>'+image+mapLabel+'<p>Status: '+r.status+' · overflow: '+(r.metrics?.horizontalOverflowPx??"?")+'px · microtype: '+(r.metrics?.microTextSamples?.length??"?")+' sampled · small targets: '+(r.metrics?.smallTargetSamples?.length??"?")+' sampled</p></article>';
}).join("\n");
await writeFile(resolve(output,"index.html"),
 '<!doctype html><html lang="en"><meta charset="utf-8"><title>Ad Orientem · UI critical review</title>'+
 '<style>body{background:#0c1118;color:#eee7da;font:14px system-ui;margin:20px}h1{font:32px Georgia}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:15px}article{border:1px solid #46413b;padding:12px;border-radius:8px}article img{width:100%;max-width:430px;display:block}article p{font-size:12px;color:#b7b4ac}</style>'+
 '<h1>Current UI/UX review — nine-route phone matrix</h1><p>Read-only captures of actual GitHub production routes, not mocked designs. Open matrix.json for measurements, route failures and language states. Automated detection is triage, not human visual approval.</p><main>'+panels+'</main></html>');
console.log("Current nine-route UI matrix captured "+summary.captured+"/"+summary.total+" views; "+summary.horizontalOverflow.length+" overflow cases; "+summary.exploreMap.renderedCandidates+"/"+summary.exploreMap.total+" Explore map-render candidates (not handset certified).");
if(summary.missing)process.exitCode=1;
