// Source-cue geometry QA in actual 320px/390px Chromium with approved icon bank.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/mass-source-rail-geometry");
await mkdir(out,{recursive:true});
const port=4409;
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(port,"127.0.0.1",yes)});
const targets=["AO.SM.C0174","AO.SM.C0181","AO.SM.C0221","AO.SM.C0232","AO.SM.C0234","AO.SM.C0262"];
const report={schema:"AO_MASS_EXACT_SOURCE_ICON_GEOMETRY_V1",cases:[],physicalDeviceVerified:false};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+port+"/tests/fixtures/reader-phone-harness.html?production=1&aoLiveCards=65&mode=LIVE&form=MISSA_CANTATA_INCENSE",
    {waitUntil:"networkidle",timeout:70000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:40000});
   for(const cue of targets){
    const evidence={width,cue};
    try{
     const shown=await page.evaluate(id=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(c=>c.paragraphs?.some(p=>p.sourceCueIds?.includes(id)));
      return card?Boolean(api.showSequence(card.sequence)):false;
     },cue);
     assert.ok(shown,"Canonical card missing "+cue);
     const found=await page.locator(".ao-prayer-card").evaluate(async (scroll,id)=>{
      const row=[...scroll.querySelectorAll(".ao-reader-paragraph")].find(el=>el.dataset.cueId===id||
       String(el.dataset.sourceCueIds??"").split(/\s+/).includes(id));
      if(!row)return {ok:false,reason:"source paragraph not rendered"};
      const step=()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
      await step();
      const bounds=scroll.getBoundingClientRect(),r=row.getBoundingClientRect();
      const max=Math.max(0,scroll.scrollHeight-scroll.clientHeight);
      const focus=Math.max(0,Math.min(max,scroll.scrollTop+r.top-bounds.top+r.height/2-scroll.clientHeight*.39));
      const positions=[focus,...Array.from({length:25},(_,i)=>Math.max(0,Math.min(max,focus+(i-12)*14))),0,max];
      for(const position of [...new Set(positions)]){
       scroll.scrollTop=position;await step();
       if(window.__AO_PHONE_PREVIEW.getActiveCue()===id)return {ok:true,scrollTop:scroll.scrollTop};
      }
      return {ok:false,reason:"cue cannot be focused",active:window.__AO_PHONE_PREVIEW.getActiveCue(),max};
     },cue);
     assert.ok(found.ok,JSON.stringify(found));
     await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
     const measured=await page.evaluate(id=>{
      const root=document.querySelector("#ao-r17-native-reader-preview");
      const stage=root.querySelector(".ao-reader-stage");
      const scroller=stage.querySelector(".ao-prayer-card");
      const sr=stage.getBoundingClientRect(),cr=scroller.getBoundingClientRect();
      const rows=[...scroller.querySelectorAll(".ao-reader-paragraph")];
      const findRow=x=>rows.find(r=>r.dataset.cueId===x) ??
       rows.find(r=>String(r.dataset.sourceCueIds??"").split(/\s+/).includes(x));
      const tiles=[...stage.querySelectorAll(".ao-rail .ao-rail-item")].map(tile=>{
       const rail=tile.closest(".ao-rail");
       const tr=tile.getBoundingClientRect();
       const shown=Boolean(rail&&getComputedStyle(rail).display!=="none"&&
        getComputedStyle(tile).display!=="none"&&tr.width>0&&tr.height>0&&
        tile.dataset.active==="true"&&tile.dataset.iconVisible==="true");
       const id=tile.dataset.sourceRailCueId,row=findRow(id);
       const reference=row?.querySelector(".ao-line-primary")??row;
       const rr=reference?.getBoundingClientRect();
       const line=reference?parseFloat(getComputedStyle(reference).lineHeight)||28:28;
       const baseline=rr?rr.top+Math.min(23,Math.max(9,line/2)):null;
       return {channel:tile.dataset.channel,shown,id,anchor:tile.dataset.sourceRailAnchor,
        offset:tile.dataset.sourceRailOffset,hasRow:Boolean(row),rowCue:row?.dataset.cueId??null,
        baseline,iconCenter:tr.top+tr.height/2,
        sourceInScroller:baseline!=null&&baseline>=Math.max(sr.top,cr.top)&&baseline<=Math.min(sr.bottom,cr.bottom),
        artHidden:tile.querySelector(".ao-icon-mask")?.hidden??true};
      });
      return {cue:id,active:window.__AO_PHONE_PREVIEW.getActiveCue(),
       native:window.__AO_PHONE_PREVIEW.getNativeEventState()?.nativeCueId,
       documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,tiles};
     },cue);
     evidence.measurement=measured;
     assert.equal(measured.active,cue,"Focus no longer belongs to exact paragraph");
     assert.equal(measured.native,cue,"Native source event and prayer focus diverge");
     assert.ok(measured.documentWidth<=measured.viewport+1,"Phone overflow");
     for(const t of measured.tiles.filter(t=>t.shown)){
      assert.equal(t.anchor,"exact","Visible "+t.channel+" icon lacks source anchor");
      assert.ok(/^AO\.SM\.C\d{4}$/.test(t.id),"Icon attached to invented/empty cue");
      assert.ok(t.hasRow&&t.sourceInScroller,"Icon belongs to offscreen/missing source text");
      assert.ok(Math.abs(t.iconCenter-t.baseline)<=65.5,
       t.channel+" icon detached "+Math.round(t.iconCenter-t.baseline)+"px from "+t.id);
      assert.equal(t.artHidden,false,"Visible rail icon lacks approved artwork");
     }
     const priest=measured.tiles.find(t=>t.channel==="priest-action");
     if(priest?.shown)assert.equal(priest.id,cue,"Priest artwork belongs to another paragraph");
     evidence.pass=true;
     if(["AO.SM.C0174","AO.SM.C0232"].includes(cue))
      await page.screenshot({path:resolve(out,width+"-"+cue.slice(-5)+".png"),animations:"disabled"});
     console.log("PASS ICON SOURCE "+width+"px "+cue+" "+measured.tiles.filter(t=>t.shown).map(t=>t.channel+":"+t.id).join(","));
    }catch(e){
     evidence.pass=false;evidence.error=String(e?.stack??e).slice(0,2200);
     console.error("FAIL ICON SOURCE "+width+"px "+cue+" "+evidence.error);
     await page.screenshot({path:resolve(out,width+"-"+cue.slice(-5)+"-failed.png"),animations:"disabled"}).catch(()=>{});
    }
    report.cases.push(evidence);
   }
   assert.deepEqual(errors,[],"Reader page errors");
  }finally{await context.close()}
 }
}finally{
 report.passed=report.cases.length===12&&report.cases.every(x=>x.pass);
 await writeFile(resolve(out,"report.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close();await new Promise(done=>server.close(done));
}
assert.equal(report.passed,true,"Exact-source icon geometry regression: see report");
