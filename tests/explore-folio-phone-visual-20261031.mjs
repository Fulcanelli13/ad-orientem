// Sacred Atlas actual-app visual acceptance. Captures a mounted Home -> Explore
// Place preview -> full folio. A screenshot is evidence, not editorial signoff.
// No remote image is treated as licensed merely because a thumbnail loaded.
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/explore-folio-phone-20261031");
const layouts=[{width:320,height:700},{width:390,height:844},{width:430,height:932}];
const places=[
 {id:"place:FR:sanctuaire-notre-dame-de-lourdes",slug:"lourdes",reason:"Marian site"},
 {id:"place:FR:notre-dame-paris",slug:"notre-dame",reason:"multiple relics, no cover"},
 {id:"place:FR:espace-bernadette-nevers",slug:"nevers",reason:"Saint's resting place"},
 {id:"place:IT:basilica-sant-antonio-padova",slug:"padua",reason:"reliquary"},
 {id:"place:FR:pontmain",slug:"pontmain",reason:"gallery"},
 {id:"place:FR:basilique-saint-denis",slug:"saint-denis",reason:"source-only cathedral"}
];
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",
 ".png":"image/png",".jpg":"image/jpeg"};
await mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const f=resolve(root,"."+name);
  if(f!==root&&!f.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(f);
  res.writeHead(200,{"content-type":mime[extname(f)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes);});
const origin="http://127.0.0.1:"+server.address().port;
const records=[];let browser;
const safe=id=>id.replace(/[^a-z0-9-]/gi,"-");
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 browser=await chromium.launch({headless:true});
 for(const size of layouts)for(const lang of ["en","fr"]){
  const context=await browser.newContext({viewport:size,deviceScaleFactor:1,
   isMobile:true,hasTouch:true,locale:lang==="fr"?"fr-FR":"en-GB",reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true
     &&!!document.querySelector(".homeScreen"),null,{timeout:35000});
   await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:15000}).catch(()=>{});
   if(lang==="fr"){
    await page.evaluate(()=>window.AO_SETTINGS_APP_V1.open("/settings/language-reading"));
    await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
    await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",
     null,{timeout:12000});
    await page.locator("#ao-settings-modular-root [data-settings-close]").click();
   }
   for(const item of places){
    const caseId=lang+"-"+size.width+"-"+item.slug;
    const row={caseId,language:lang,width:size.width,place_id:item.id,
      reason:item.reason,preview:"pending",folio:"pending"};
    try{
     const opened=await page.evaluate(async id=>
       window.AO_FIND_APP_V1?.open?.({lens:"heritage",placeId:id}),item.id);
     if(opened!==true)throw Error("Explore did not open Place "+item.id);
     await page.locator('.aoHeritagePreview[data-explore-place-owner="'+item.id+'"]')
       .waitFor({state:"visible",timeout:16000});
     const preview=page.locator('.aoHeritagePreview[data-explore-place-owner="'+item.id+'"]');
     const pic=await preview.getAttribute("data-approved-place-photo");
     row.photoState=pic;
     const pfile=caseId+"-preview.png";
     await preview.screenshot({path:resolve(out,pfile),animations:"disabled"});
     row.preview="captured";row.previewFile=pfile;
     await preview.locator("[data-explore-expand-place]").click();
     await page.locator('.aoExplorePlaceSheet[data-explore-place-owner="'+item.id+'"]')
       .waitFor({state:"visible",timeout:15000});
     await delay(160);
     const ffile=caseId+"-folio.png";
     await page.screenshot({path:resolve(out,ffile),fullPage:false,animations:"disabled"});
     row.folio="captured";row.folioFile=ffile;
     row.metrics=await page.evaluate(()=>{
       const el=document.querySelector(".aoExplorePlaceSheet");
       const doc=document.documentElement;
       const chapterButtons=[...(el?.querySelectorAll("[data-explore-place-jump]")??[])];
       const destinations=[...(el?.querySelectorAll("[data-explore-place-chapter]")??[])];
       const missing=chapterButtons.map(b=>b.dataset.explorePlaceJump)
        .filter(n=>!destinations.some(d=>d.dataset.explorePlaceChapter===n));
       const imageInfo=[...(el?.querySelectorAll("img")??[])].map(i=>({
        src:i.getAttribute("src"),naturalWidth:i.naturalWidth,loaded:i.complete,
        fit:getComputedStyle(i).objectFit
       }));
       return {
        lang:window.AO_RUNTIME_V8?.store?.getState?.()?.language,
        pageOverflowPx:Math.max(0,doc.scrollWidth-innerWidth),
        sheetOverflowPx:el?Math.max(0,el.scrollWidth-el.clientWidth):null,
        chapterButtons:chapterButtons.length,missingChapterTargets:missing,
        storyAnchors:destinations.filter(d=>d.dataset.explorePlaceChapter==="story").length,
        images:imageInfo
       };
     });
     row.pageErrors=errors.slice(-8);
    }catch(e){row.error=String(e.message||e).slice(0,350);}
    records.push(row);
    console.log(caseId+": "+row.preview+" / "+row.folio+(row.error?" "+row.error:""));
   }
  }catch(e){
   records.push({language:lang,width:size.width,setupError:String(e.message||e).slice(0,450)});
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
const summary={schema:"AO_EXPLORE_REAL_PHONE_FOLIO_QA_20261031_V1",
 source:"real mounted app, not HTML mock-up",created:new Date().toISOString(),
 matrix:"6 canonical Place IDs × EN/FR × 320/390/430 × preview/full",
 expected:72,captured:records.reduce((n,r)=>n+(r.preview==="captured")+(r.folio==="captured"),0),
 failures:records.filter(r=>r.error||r.setupError||r.metrics?.pageOverflowPx>1
  ||r.metrics?.sheetOverflowPx>1||r.metrics?.missingChapterTargets?.length
  ||r.metrics?.storyAnchors>1||r.pageErrors?.length),
 records};
await writeFile(resolve(out,"matrix.json"),JSON.stringify(summary,null,2));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pages=records.map(r=>'<article><h2>'+esc(r.caseId||r.language+"-"+r.width)+"</h2>"+
 (r.previewFile?'<a href="'+r.previewFile+'"><img src="'+r.previewFile+'" alt="preview"></a>':"")+
 (r.folioFile?'<a href="'+r.folioFile+'"><img src="'+r.folioFile+'" alt="folio"></a>':"")+
 '<p>'+esc(r.error||r.setupError||JSON.stringify(r.metrics||{}))+'</p></article>').join("");
await writeFile(resolve(out,"index.html"),'<!doctype html><meta charset="utf-8"><title>Sacred Atlas folio QA</title>'+
 '<style>body{background:#101720;color:#f5eedf;font:13px system-ui;margin:18px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}article{border:1px solid #626055;padding:12px;border-radius:9px;overflow-wrap:anywhere}img{display:block;width:100%;max-width:430px;margin:10px 0}p{font-size:11px;color:#aab3bc}</style>'+
 '<h1>Actual Sacred Atlas phone folios · not yet visually approved</h1><p>72 targeted previews and full-sheet views; inspect matrix.json for overflow, navigation targets, image decoding and runtime errors.</p><main>'+
 pages+'</main>');
console.log("Sacred Atlas actual-app screenshots "+summary.captured+"/"+summary.expected+
 " frames; "+summary.failures.length+" cases require review");
if(summary.captured!==summary.expected||summary.failures.length)process.exitCode=1;
