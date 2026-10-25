import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/mass-iconless-visual");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
  try{
    const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4396,"127.0.0.1",ok)});
await mkdir(output,{recursive:true});

const scenarios=[
  {width:320,form:"MISSA_CANTATA_SIMPLE",cue:"AO.SM.C0204",kind:"minor-elevation"},
  {width:390,form:"MISSA_CANTATA_SIMPLE",cue:"AO.SM.C0204",kind:"minor-elevation"},
  {width:320,form:"MISSA_CANTATA_SIMPLE",cue:"AO.SM.C0242",kind:"ecce-agnus"},
  {width:390,form:"MISSA_CANTATA_SIMPLE",cue:"AO.SM.C0242",kind:"ecce-agnus"},
  {width:390,form:"MISSA_CANTATA_SIMPLE",cue:"AO.SM.C0174",kind:"approved-high-elevation"},
  {width:390,form:"MISSA_CANTATA_SIMPLE",cue:"AO.SM.C0221",kind:"approved-commingling"},
  {width:390,form:"SOLEMN",cue:"AO.SM.C0082",kind:"certified-deacon"},
  {width:390,form:"SOLEMN",cue:"AO.SM.C0081",kind:"requiem-minister",requiem:true},
];
const report=[];
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const spec of scenarios){
    const context=await browser.newContext({viewport:{width:spec.width,height:844},
      deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const page=await context.newPage(),exceptions=[];
    page.on("pageerror",e=>exceptions.push(String(e?.message??e)));
    const params=new URLSearchParams({mode:"LIVE",form:spec.form});
    if(spec.requiem)params.set("requiem","1");
    const url="http://127.0.0.1:4396/tests/fixtures/reader-phone-harness.html?"+params;
    await page.goto(url,{waitUntil:"networkidle"});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:25000});
    const opened=await page.evaluate(cue=>{
      const api=window.__AO_PHONE_PREVIEW;
      const found=api.model.cards.find(card=>
        card.paragraphs?.some(p=>(p.sourceCueIds??[]).includes(cue)));
      return found?Boolean(api.showSequence(found.sequence)):false;
    },spec.cue);
    assert.ok(opened,"No canonical card for "+spec.kind+" "+spec.cue);
    await page.locator(".ao-prayer-card").evaluate(async(scroller,cue)=>{
      const hit=[...scroller.querySelectorAll(".ao-reader-paragraph")].find(el=>
        el.dataset.cueId===cue || String(el.dataset.sourceCueIds??"").split(/\s+/).includes(cue));
      if(!hit)throw new Error("Source paragraph missing for "+cue);
      const a=scroller.getBoundingClientRect(),b=hit.getBoundingClientRect();
      const base=b.top-a.top+scroller.scrollTop+b.height/2-scroller.clientHeight*.39;
      const max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
      // The reader's physical 35-40% focus zone is not equivalent to the
      // paragraph midpoint. Cross the actual source boundary in small,
      // real scrolling steps instead of assuming one scrollTop is enough.
      for(const delta of [0,25,50,75,100,125,150,175,200,225,-25,-50]){
        scroller.scrollTop=Math.max(0,Math.min(max,base+delta));
        await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
        if(window.__AO_PHONE_PREVIEW.getActiveCue()===cue)break;
      }
    },spec.cue);
    try{
      await page.waitForFunction(cue=>window.__AO_PHONE_PREVIEW.getActiveCue()===cue,
        spec.cue,{timeout:4500});
      await page.waitForFunction(cue=>
        window.__AO_PHONE_PREVIEW.getNativeEventState()?.nativeCueId===cue,
        spec.cue,{timeout:4500});
    }catch(error){
      const trace=await page.evaluate(cue=>{
        const card=document.querySelector(".ao-prayer-card");
        return {requested:cue,active:window.__AO_PHONE_PREVIEW.getActiveCue(),
          native:window.__AO_PHONE_PREVIEW.getNativeEventState()?.nativeCueId,
          currentCard:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId,
          top:card?.scrollTop,height:card?.clientHeight,scrollHeight:card?.scrollHeight,
          rows:[...card.querySelectorAll(".ao-reader-paragraph")].map(e=>({
            id:e.dataset.cueId,source:e.dataset.sourceCueIds,
            top:e.getBoundingClientRect().top,
            text:e.querySelector(".ao-line-primary")?.textContent?.slice(0,90)
          }))};
      },spec.cue);
      await page.screenshot({path:resolve(output,spec.width+"-"+spec.kind+"-focus-diagnostic.png")});
      report.push({...spec,focusError:String(error.message),trace});
      console.error("SOURCE FOCUS DIAGNOSTIC "+JSON.stringify(trace));
      throw new Error("Cannot focus source cue "+spec.cue+": "+JSON.stringify(trace));
    }
    await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
    const snapshot=await page.evaluate(cue=>{
      const shell=document.querySelector("[data-ao-reader-shell]");
      const native=window.__AO_PHONE_PREVIEW.getNativeEventState();
      const stage=document.querySelector(".ao-reader-stage");
      const rows=[...document.querySelectorAll(".ao-reader-paragraph")];
      const owner=rows.find(el=>el.dataset.cueId===cue) ??
        rows.find(el=>String(el.dataset.sourceCueIds??"").split(/\s+/).includes(cue));
      const display=el=>el?getComputedStyle(el).display:"none";
      const rails=[...shell.querySelectorAll(".ao-rail")].map(rail=>({
        side:rail.classList.contains("ao-rail-left")?"left":"right",
        stageVisible:rail.classList.contains("ao-rail-left")
          ?stage?.dataset.leftRail:stage?.dataset.rightRail,
        display:display(rail),
        tiles:[...rail.querySelectorAll(".ao-rail-item")].map(tile=>{
          const icon=tile.querySelector(".ao-icon-mask");
          const copy=tile.querySelector(".ao-rail-copy");
          const style=icon?getComputedStyle(icon):null;
          const painted=Boolean(icon&&!icon.hidden&&
            [style?.maskImage,style?.webkitMaskImage,style?.backgroundImage]
              .some(x=>x&&x!=="none"));
          return {channel:tile.dataset.channel,active:tile.dataset.active,
            iconVisible:tile.dataset.iconVisible,display:display(tile),
            iconHidden:icon?.hidden??true,painted,
            label:tile.getAttribute("aria-label"),role:tile.getAttribute("role"),
            ariaHidden:tile.getAttribute("aria-hidden"),
            copyDisplay:display(copy),copy:copy?.textContent?.trim()??""};
        })
      }));
      const rubrics=owner?[...owner.querySelectorAll(
        ".ao-iconless-source-rubric,.ao-live-rubric-action,.ao-line-primary"
      )].map(el=>({type:el.className,sourceCueId:el.dataset.sourceCueId??null,
        text:el.textContent?.trim()??"",display:display(el),
        bounds:(()=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right,width:b.width}})()})):[];
      return {cue,form:native?.form??null,mode:shell?.dataset.mode,
        currentCue:native?.nativeCueId,action:native?.priestAction??null,
        actionIconKey:native?.priestActionIconKey??null,
        sourceParagraphKind:owner?.dataset.kind??null,
        sourceCueIds:owner?.dataset.sourceCueIds??null,
        rails,rubrics,stage:{left:stage?.dataset.leftRail,right:stage?.dataset.rightRail},
        width:innerWidth,documentWidth:document.documentElement.scrollWidth};
    },spec.cue);
    const name=spec.width+"-"+spec.kind+".png";
    await page.screenshot({path:resolve(output,name)});
    report.push({...spec,...snapshot,screenshot:name,exceptions});
    try{
      assert.equal(snapshot.mode,"LIVE");
      assert.equal(snapshot.currentCue,spec.cue,"Cue timing drifted");
      assert.equal(exceptions.length,0,"Browser runtime errors");
      assert.ok(snapshot.documentWidth<=snapshot.width+1,"Horizontal phone overflow");
      assert.ok(snapshot.rubrics.length>0,"Source text disappeared");
      for(const rail of snapshot.rails)for(const tile of rail.tiles){
        if(tile.display==="none")continue;
        assert.equal(tile.iconVisible,"true","A text-only tile is visually painted: "+tile.channel);
        assert.equal(tile.iconHidden,false,"Visible tile lacks image element: "+tile.channel);
        assert.ok(tile.painted,"Visible tile has no rendered SVG/PNG mask: "+tile.channel);
        assert.equal(tile.copyDisplay,"none","Rubric text is inside an icon box: "+tile.channel);
      }
      // The deacon and Requiem minister texts must still be accessible at
      // their original paragraph even though the previous rail is now hidden.
      if(spec.kind==="certified-deacon"||spec.kind==="requiem-minister"){
        assert.ok(snapshot.rubrics.some(x=>/deacon|Gospel|incense|candle/i.test(x.text)),
          "Certified minister source text disappeared at "+spec.cue);
        const minister=snapshot.rails.flatMap(x=>x.tiles).find(x=>x.channel==="sacred-minister");
        assert.equal(minister?.display,"none","Text-only minister box is still visible");
      }
      const iconless=spec.kind==="minor-elevation"||spec.kind==="ecce-agnus";
      if(iconless){
        const actionTile=snapshot.rails.flatMap(x=>x.tiles).find(x=>x.channel==="priest-action");
        if(actionTile?.iconVisible==="false"){
          assert.equal(actionTile.display,"none","No-artwork priest action leaves an empty square");
          assert.ok(snapshot.rubrics.some(x=>
            x.type==="ao-iconless-source-rubric" ||
            x.type==="ao-live-rubric-action" ||
            (snapshot.sourceParagraphKind==="RUBRIC" && x.type==="ao-line-primary")),
            "Iconless action has neither printed nor inline source rubric");
        }
      }
      for(const r of snapshot.rubrics){
        if(r.display==="none")continue;
        assert.ok(r.bounds.left>=-1&&r.bounds.right<=snapshot.width+1,
          "Rubric clips out of phone viewport: "+r.type);
      }
    }finally{
      await context.close();
    }
  }
  await writeFile(resolve(output,"source-cue-visual-report.json"),
    JSON.stringify({source:"R17 native phone harness",scenarios:report},null,2));
  console.log("PASS: "+report.length+" source-cue phone visual captures, icon-only rails, source rubrics and no overflow.");
}finally{
  if(report.length)await writeFile(resolve(output,"source-cue-visual-report.json"),
    JSON.stringify({source:"R17 native phone harness",scenarios:report},null,2));
  await browser?.close();
  await new Promise(done=>server.close(done));
}
