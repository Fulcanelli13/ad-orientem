import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {probeTextFocus} from "./support/text-focus-probe.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/live-mass-visual-focus");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(path));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const findings={schema:"ao-real-entry-live-visual-opacity-v1",cases:[],errors:[]};
let browser;
const frame=()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
try{
 browser=await chromium.launch({headless:true});
 const viewports=[{width:320,height:720,isMobile:true,lang:"en"},
  {width:390,height:844,isMobile:true,lang:"en"},
  {width:390,height:844,isMobile:true,lang:"fr"},
  {width:1280,height:800,isMobile:false,lang:"en"}];
 for(const spec of viewports){
  const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},
    isMobile:spec.isMobile,hasTouch:spec.isMobile,deviceScaleFactor:1,
    locale:spec.lang==="fr"?"fr-FR":"en-GB",serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  const samples=[];
  const params=new URLSearchParams({production:"1",mode:"LIVE",lang:spec.lang,secondConfiteor:"1"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/tests/fixtures/reader-phone-harness.html?"+params,
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
    null,{timeout:60000});
  const initial=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const shell=root?.querySelector(".ao-reader-shell");
    return {error:window.__AO_PHONE_HARNESS_ERROR||null,
      owner:api?.ownership?.cards,curated:root?.dataset.r17CuratedReview,
      mode:shell?.dataset.mode,modelCards:api?.model?.totalCards,
      named:(api?.model?.cards||[]).map(x=>({seq:x.sequence,title:x.title}))};
  });
  assert.ok(!initial.error,spec.lang+" launch error: "+initial.error);
  assert.equal(initial.mode,"LIVE");
  assert.equal(initial.curated,"true","Real production mount bypassed curated CSS override");
  assert.ok(initial.modelCards>=65,"Production did not select the curated LIVE reader");
  const cards=initial.named.filter(x=>/^Kyrie|Gloria · Praise and Supplication|Credo · Holy Spirit/.test(x.title));
  assert.ok(cards.length>=2,"Missing source-rich LIVE sections");
  const sample=async(card,at)=>{
   await page.evaluate(async ({seq,at})=>{
     const api=window.__AO_PHONE_PREVIEW;
     api.showSequence(seq);
     await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
     const scroll=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
     scroll.scrollTop=(scroll.scrollHeight-scroll.clientHeight)*at;
     scroll.dispatchEvent(new Event("scroll",{bubbles:true}));
     await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
   },{seq:card.seq,at});
   // The app animates opacity for 280ms: compare computed values at rest.
   await page.waitForTimeout(370);
   const data=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const scroll=root.querySelector(".ao-prayer-card");
    const rows=[...scroll.querySelectorAll(".ao-prayer-body .ao-reader-paragraph")]
      .filter(x=>x.getClientRects().length&&x.dataset.kind!=="RUBRIC");
    // Visual reading focus is independent from the source ceremonial cue.
    // A source cue may remain active while a Proper paragraph is lit.
    const active=rows.filter(x=>x.dataset.readingActive==="true");
    const a=active[0],aIndex=rows.indexOf(a);
    return {cardId:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId,
      maxScroll:scroll.scrollHeight-scroll.clientHeight,
      scrollTop:scroll.scrollTop,eligible:rows.length,active:active.length,
      activeIndex:aIndex,activeCue:a?.dataset.cueId||null,
      activeOpacity:a?Number(getComputedStyle(a).opacity):null,
      farOpacities:rows.filter(x=>x.dataset.readingPosition==="distant")
        .map(x=>Number(getComputedStyle(x).opacity)),
      nextOpacities:rows.filter(x=>x.dataset.readingPosition==="next")
        .map(x=>Number(getComputedStyle(x).opacity)),
      previousOpacities:rows.filter(x=>x.dataset.readingPosition==="previous")
        .map(x=>Number(getComputedStyle(x).opacity)),
      unclassified:rows.filter(x=>!["current","next","previous","distant"].includes(x.dataset.readingPosition)).length,
      ceremonialButUnlit:rows.filter(x=>x.dataset.active==="true"&&x.dataset.readingActive!=="true")
        .map(x=>({id:x.dataset.cueId,opacity:Number(getComputedStyle(x).opacity)})),
      positionTransforms:rows.map(x=>getComputedStyle(x).transform).filter(x=>x!=="none"),
      focusMarker:root.dataset.r17NativeCue,
      visualFocus:scroll.querySelector("[data-role='paragraphs']")?.dataset.aoVisualFocus||null,
      physicalOverflow:document.documentElement.scrollWidth-innerWidth};
   });
   samples.push({title:card.title,at,...data});
   assert.ok(data.eligible>=4,spec.lang+"/"+card.title+" insufficient visible text");
   assert.ok(data.maxScroll>80,spec.lang+"/"+card.title+" cannot scroll between passages");
   assert.equal(data.active,1,spec.lang+"/"+card.title+" no unique focused paragraph");
   assert.ok(data.activeOpacity>=.94,spec.lang+"/"+card.title+" active paragraph not illuminated: "+JSON.stringify(data));
   assert.equal(data.unclassified,0,
      spec.lang+"/"+card.title+" visible text missing its shared reading focus classification");
   assert.ok(data.farOpacities.length>=1&&
      Math.min(...data.farOpacities)>=.29&&Math.max(...data.farOpacities)<=.41,
      spec.lang+"/"+card.title+" distant text outside gentle muted floor: "+JSON.stringify(data));
   assert.ok(data.nextOpacities.every(x=>x>=.58&&x<=.72),
      spec.lang+"/"+card.title+" next paragraph not softly anticipated: "+JSON.stringify(data));
   assert.ok(data.previousOpacities.every(x=>x>=.48&&x<=.62),
      spec.lang+"/"+card.title+" prior paragraph not softly muted: "+JSON.stringify(data));
   assert.ok(data.nextOpacities.length+data.previousOpacities.length>=1,
      spec.lang+"/"+card.title+" missing adjacent reading paragraph");
   assert.ok(data.physicalOverflow<=2,spec.lang+"/"+card.title+" document horizontal overflow");
   assert.deepEqual(data.positionTransforms,[],
     spec.lang+"/"+card.title+" reading highlight must not physically move the prayer rows");
   assert.ok(data.ceremonialButUnlit.every(x=>x.opacity<=.72),
     spec.lang+"/"+card.title+" source-ceremonial cue overrode visual reading opacity");
   return data;
  };
  for(const card of cards.slice(0,3)){
    const opening=await sample(card,0);
    const later=await sample(card,.70);
    assert.notEqual(later.activeIndex,opening.activeIndex,
      spec.lang+"/"+card.title+" scroll did not transfer visual reading focus");
  }
  // The older cue-only focus coverage passed while users still reported
  // skipped Proper and short-response paragraphs. Audit *all* rendered
  // reading rows across the actual 65-card production LIVE presentation.
  // Source cue/ribbon state is explicitly not the oracle for visual focus.
  const readingAudit=[];
  const structuralAudit={sectionBreaks:0,invitationRows:0,invitationCueIds:[]};
  if(spec.isMobile&&spec.lang==="en"&&spec.width===390){
    for(const item of initial.named){
      const present=await page.evaluate(async sequence=>{
        const card=window.__AO_PHONE_PREVIEW?.showSequence(sequence);
        await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
        return !!card;
      },item.seq);
      if(!present)continue; // source-owned omitted/state-only steps
      const probe=await page.evaluate(probeTextFocus,{
        rootSelector:"#ao-r17-native-reader-preview",
        scrollSelector:".ao-prayer-card",
        paragraphSelector:".ao-reader-paragraph",
        owner:"mass-reading",
        label:item.title
      });
      if(!probe.registered)continue;
      const structure=await page.evaluate(()=>{
        const root=document.querySelector("#ao-r17-native-reader-preview");
        const rows=[...root.querySelectorAll(".ao-prayer-body .ao-reader-paragraph")]
          .filter(el=>el.getClientRects().length&&el.dataset.kind!=="RUBRIC");
        const breaks=rows.filter(el=>el.dataset.sectionBoundary);
        const invitations=rows.filter(el=>el.dataset.liveInvitation==="true");
        const invalid=breaks.filter(el=>{
          const mt=Number.parseFloat(getComputedStyle(el).marginTop)||0;
          return mt<17||!el.dataset.sourceBlockId;
        }).map(el=>({id:el.dataset.paragraphId,source:el.dataset.sourceBlockId,
          margin:getComputedStyle(el).marginTop}));
        const invalidInvitations=invitations.filter(el=>{
          const latin=el.querySelector(".ao-line-primary")?.textContent?.trim()||"";
          const vern=el.querySelector(".ao-line-secondary")?.textContent?.trim()||"";
          const style=el.querySelector(".ao-line-secondary");
          return !latin||!vern||!style||getComputedStyle(style).display==="none"||
            el.dataset.translateToggle==="true";
        }).map(el=>el.dataset.paragraphId);
        return {breakCount:breaks.length,invitationIds:invitations.map(el=>el.dataset.cueId),
          invalid,invalidInvitations};
      });
      assert.deepEqual(structure.invalid,[],
        item.title+" section whitespace not aligned to a source-bound prayer");
      assert.deepEqual(structure.invalidInvitations,[],
        item.title+" public Latin invocation lost visible vernacular underneath");
      structuralAudit.sectionBreaks+=structure.breakCount;
      structuralAudit.invitationRows+=structure.invitationIds.length;
      structuralAudit.invitationCueIds.push(...structure.invitationIds);
      readingAudit.push({
        title:item.title,registered:probe.registered,reached:probe.reached,
        skipped:probe.unreachableTotal,duplicates:probe.duplicates
      });
      assert.equal(probe.duplicates,0,
        "More than one visual paragraph simultaneously active: "+item.title);
      assert.equal(probe.unreachableTotal,0,
        "Visually skipped LIVE paragraphs in "+item.title+": "+
          JSON.stringify(probe.unreachable));
    }
    assert.ok(readingAudit.length>=55,
      "Production LIVE paragraph audit did not cover the expected cards");
    assert.ok(structuralAudit.sectionBreaks>=5,
      "No genuine source-block prayer gaps rendered in production LIVE");
    for(const cue of ["AO.SM.C0072","AO.SM.C0108","AO.SM.C0208","AO.SM.C0253"]){
      assert.ok(structuralAudit.invitationCueIds.includes(cue),
        "Public Oremus not visibly bilingual in actual LIVE DOM: "+cue);
    }
  }
  assert.deepEqual(errors,[],spec.lang+" browser errors");
  findings.cases.push({...spec,curated:initial.curated,total:initial.modelCards,samples,readingAudit,structuralAudit});
  console.log("LIVE_VISUAL_FOCUS="+JSON.stringify({viewport:spec.width,lang:spec.lang,
    curated:initial.curated,cards:cards.length,checks:samples.length,
    minInactive:Math.min(...samples.flatMap(x=>x.farOpacities)),
    maxInactive:Math.max(...samples.flatMap(x=>x.farOpacities)),
    allTransferred:true}));
  await context.close();
 }
} catch(error){findings.errors.push(String(error?.stack||error));throw error}
finally{
 await writeFile(resolve(output,"live-visual-focus.json"),JSON.stringify(findings,null,2));
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
