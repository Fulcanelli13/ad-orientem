import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {confessionExaminationCards,confessionExtendedSections,confessionRiteCards,confessionAfterCards} from "../src/pray/confession-paths.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/pray-stage-matrix");
const ledger=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-release-coverage-evidence.v1.json"),"utf8"));
for(const id of ["pray.confession","pray.benediction"]){
 assert.equal(ledger.routes.find(r=>r.id===id)?.kind,"MULTI_TEXT",id+" not in source-owned route ledger");
}
assert.equal(ledger.counts.fullRouteVariantCertificates,0,"Stage browser coverage is not blanket release certification");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const report={schema:"ao.pray.confession-benediction-stage-browser.v1",scope:"SELECTED_STAGE_VARIANTS_NOT_ALL_ROUTE_OR_PRINT_CERTIFICATES",
 cases:[],errors:[],counts:{confessionExamination:0,confessionRite:0,confessionAfter:0,benedictionOrdinary:0,benedictionExtended:0},
 releaseClaims:{all41Routes:0,independentOriginalPrintEditions:0}};
let browser;
const expectedBen=["exposition","adoration","hymn","prayer","blessing","praises","reposition"];
const expectedExtended=["exposition","adoration","king-procession","king-royal-praises","king-sacred-heart-litany","king-consecration","hymn","prayer","blessing","praises","reposition"];
const plain=s=>String(s??"").normalize("NFC").replace(/\s/g,"");
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce",locale:ui==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage(),exceptions=[];
  page.on("pageerror",err=>exceptions.push(err.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(ui=>document.documentElement.lang===ui,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});

   const confession="#aoPray435930.open .aoP435930ConfessionReader";
   const confessionTimeline=confession+" .aoDevoSequenceTimeline";
   const expectedExamSource=DATA[ui==="fr"?"examFr":"exam"];
   for(const path of ["regular","returning","general"]){
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null})),true);
    const chooser=page.locator(confession+" [data-p435930-conf-path='"+path+"']");
    await chooser.waitFor({state:"visible",timeout:15000});
    assert.equal(await page.locator(confession+" input, "+confession+" textarea").count(),0,
     path+" path chooser must not solicit sins or personal answers");
    assert.equal(await page.locator("#aoPray435930.open .aoP435930ConfNavShell .aoP435930GuideRail button").count(),4);
    await chooser.click();
    await page.locator(confession+" [data-p435930-conf-next]").click();
    await page.locator(confessionTimeline+" [data-ao-devo-chapter='0']").waitFor({state:"attached",timeout:12000});
    if(path==="regular"){
     const ws=page.locator(confession+" .aoPrayerRitualWorkspace[data-ao-prayer-workspace='confession']");
     assert.equal(await ws.count(),1,"Confession split must be mounted without replacing canonical cards");
     assert.equal(await ws.locator("[data-ao-ritual-view]").count(),3,"Exactly three horizontal presentation views");
     const readRatio=async()=>Number.parseFloat(await ws.evaluate(el=>
      getComputedStyle(el).getPropertyValue("--ao-ritual-scene-share")));
     await ws.locator("[data-ao-ritual-view='scene']").click();
     assert.ok((await readRatio())>60,"Scene view allocates most of the height to animation");
     await ws.locator("[data-ao-ritual-view='text']").click();
     assert.ok((await readRatio())<20,"Text view allocates most of the height to prayer text");
     await ws.locator("[data-ao-ritual-view='both']").click();
     const before=await readRatio();
     const grip=ws.locator("[data-ao-ritual-divider]");
     await grip.scrollIntoViewIfNeeded();
     const rect=await grip.boundingBox();
     assert.ok(rect?.height>0,"Resizable divider missing");
     await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
     await page.mouse.down();
     await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2-27,{steps:5});
     await page.mouse.up();
     assert.ok((await readRatio())<before-2,
      "Dragging prayer text upward should continuously shrink the animation");
     assert.equal(await ws.locator("input[type=text],textarea").count(),0,
      "Workspace must never collect examination answers");
    }
    const exam=confessionExaminationCards(path,confessionExtendedSections(expectedExamSource.sections,{path,french:ui==="fr"}));
    const rite=confessionRiteCards(path),after=confessionAfterCards();
    for(const [stage,cards,part] of [[1,exam,"confessionExamination"],[2,rite,"confessionRite"],[3,after,"confessionAfter"]]){
     for(let index=0;index<cards.length;index++){
      const id=cards[index].id;
      await page.locator(confessionTimeline+" [data-ao-devo-chapter='"+index+"']").click({timeout:15000});
      await page.waitForFunction(({stage,id,index})=>{
       const root=document.querySelector("#aoPray435930.open .aoP435930ConfessionReader");
       const card=root?.querySelector(".aoDevoCard");
       return Number(root?.dataset.aoConfessionSection)===stage&&
        card?.dataset.aoDevoCard===id&&Number(card?.dataset.aoDevoIndex)===index;
      },{stage,id,index},{timeout:12000});
      const observed=await page.locator(confession).evaluate(el=>{
       const card=el.querySelector(".aoDevoCard"),scroll=card?.querySelector(".aoDevoCardScroll");
       return {id:card?.dataset.aoDevoCard,stage:+el.dataset.aoConfessionSection,
        hasText:(scroll?.innerText||"").trim().length>=25,
        documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
        shellOverflow:Math.max(0,el.scrollWidth-el.clientWidth),
        contentOverflow:scroll?Math.max(0,scroll.scrollWidth-scroll.clientWidth):null,
        sensitiveInputs:el.querySelectorAll("input[type=text],input[type=search],textarea,[contenteditable=true]").length,
        priestOnly:el.querySelectorAll('[data-ao-confession-latin-excerpt="priest-only"]').length,
        sourceLinks:el.querySelectorAll(".aoP435930ConfSources a[href]").length,
        localized:document.documentElement.lang};
      });
      assert.ok(observed.hasText,path+"/"+id+" missing visible card");
      assert.equal(observed.localized,ui,path+"/"+id+" unexpectedly changed UI language");
      assert.ok(observed.documentOverflow<=2&&observed.shellOverflow<=2&&observed.contentOverflow<=2,
       path+"/"+id+"/"+width+"/"+ui+" horizontal clipping: "+JSON.stringify(observed));
      assert.equal(observed.sensitiveInputs,0,path+"/"+id+" attempted to record private preparation answers");
      assert.equal(observed.priestOnly,id==="priest-absolution"?1:0,
       path+"/"+id+" exposes a priest-only formula at the wrong point");
      assert.ok(observed.sourceLinks>=4,path+"/"+id+" removed original source hyperlinks");
      if(stage===1&&cards[index].kind==="questions"){
       const actual=await page.locator(confession+" .aoP435930ConfQuestions li").allTextContents();
       assert.deepEqual(actual.map(plain),cards[index].questions.map(plain),
        path+"/"+id+"/"+ui+" original examination questions changed");
      }
      report.cases.push({route:"pray.confession",width,ui,path,section:stage,index,id,sourceOwned:true,
       overflow:observed.documentOverflow,privacyNoInput:true});
      report.counts[part]++;
     }
     if(stage<3){
      assert.equal(await page.locator(confession+" [data-p435930-conf-next]").count(),1,
       path+" stage "+stage+" lost explicit boundary action");
      await page.locator(confession+" [data-p435930-conf-next]").click();
      await page.waitForFunction(n=>document.querySelector("#aoPray435930.open .aoP435930ConfessionReader")?.dataset.aoConfessionSection===String(n),stage+1,{timeout:12000});
     }
    }
    assert.equal(await page.locator(confession+' [data-p435930-conf-clear]').count(),1,
     path+" lacks explicit final session-clear action");
    console.log("PASS Confession "+width+"px "+ui+" "+path+": "+exam.length+" examination, 9 rite, 3 aftercare cards");
   }

   const ben="#aoPray435930.open .aoP435930BenedictionReader";
   const benTimeline=ben+" .aoDevoSequenceTimeline";
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.benediction",{returnContext:null})),true);
   const checkBenediction=async(ids,kind)=>{
    for(let index=0;index<ids.length;index++){
     // The Solemn Blessing is an intentional, viewport-fixed rite cinematic.
     // A person must acknowledge its real Continue action before changing
     // cards; never bypass the overlay with synthetic DOM taps.
     const cinematic=page.locator(".aoDevotionalActionCinematic[role='dialog']");
     if(await cinematic.count()>0){
      const action=cinematic.locator(".aoDevotionalActionContinue");
      await action.click({timeout:12000});
      await cinematic.waitFor({state:"detached",timeout:12000});
     }
     const extended=ids.length>7;
     const selector=extended
      ?benTimeline+" [data-ao-devo-chapter='"+index+"']"
      :ben+" .aoClaudeRiteRail [data-p435930-ben-step='"+index+"']";
     // Closing the real Aa panel before interacting with the altar rail.
     const aa=page.locator("#aoPray435930 .aoClaudeBenAa");
     if(await aa.getAttribute("aria-expanded")==="true")await aa.click();
     await page.locator(selector).click({timeout:15000});
     await page.waitForFunction(({index,id})=>{
      const el=document.querySelector("#aoPray435930.open .aoP435930BenedictionReader");
      return +el?.dataset.aoBenedictionStep===index&&
       el?.querySelector(".aoDevoCard")?.dataset.aoDevoCard===id;
     },{index,id:ids[index]},{timeout:12000});
     const observed=await page.locator(ben).evaluate(el=>{
      const sc=el.querySelector(".aoDevoCardScroll");
      return {id:el.querySelector(".aoDevoCard")?.dataset.aoDevoCard,
       text:(sc?.innerText||"").trim().length,
       documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
       readerOverflow:Math.max(0,el.scrollWidth-el.clientWidth),
       scrollOverflow:sc?Math.max(0,sc.scrollWidth-sc.clientWidth):null,
       language:document.documentElement.lang,
       sourceFallbacks:el.querySelectorAll("[data-ao-ben-source-language-fallback]").length};
     });
     assert.ok(observed.text>=25,kind+"/"+ids[index]+" empty ritual card");
     assert.equal(observed.language,ui,kind+" lost selected UI language");
     assert.ok(observed.documentOverflow<=2&&observed.readerOverflow<=2&&observed.scrollOverflow<=2,
      kind+"/"+ids[index]+"/"+width+"/"+ui+" horizontal clipping: "+JSON.stringify(observed));
     if(ids[index]==="hymn"||ids[index]==="exposition"){
      assert.equal(await page.locator(ben+" [data-ao-rite-chant-stanza]").count(),4,
       kind+"/"+ids[index]+" source hymn must contain two bilingual and two Latin-only stanzas");
     }
     report.cases.push({route:"pray.benediction",width,ui,kind,index,id:ids[index],
      sourceOwned:true,overflow:observed.documentOverflow});
     report.counts[kind]++;
    }
   };
   await checkBenediction(expectedBen,"benedictionOrdinary");
   const settings=page.locator("#aoPray435930 .aoClaudeBenAa");
   await settings.click();
   const option=page.locator(ben+" [data-ao-ben-feast-options]");
   if(!(await option.evaluate(el=>el.open)))await option.locator("summary").click();
   await page.locator(ben+" [data-p435930-ben-feast]").check();
   for(const name of ["procession","royalPraises","sacredHeartLitany","consecration"])
    await page.locator(ben+" [data-p435930-ben-feast-option='"+name+"']").check();
   assert.equal(await page.locator(ben).getAttribute("data-ao-ben-extended"),"true");
   assert.equal(await page.locator(benTimeline+" [data-ao-devo-chapter]").count(),expectedExtended.length);
   await checkBenediction(expectedExtended,"benedictionExtended");
   assert.equal(await page.locator(ben+" [data-p435930-ben-finish]").count(),1,
    "Extended public rite must preserve explicit finish after Reposition");
   console.log("PASS Benediction "+width+"px "+ui+": 7 ordinary and 11 opt-in Christ the King stages");

   assert.deepEqual(exceptions,[],width+" "+ui+" unhandled exceptions");
  }catch(e){report.errors.push({width,ui,details:String(e?.stack||e)});throw e;}
  finally{await ctx.close();}
 }
 assert.equal(report.counts.confessionExamination,128,"All 5/13/14 examinations across four locale/width variants");
 assert.equal(report.counts.confessionRite,108,"Nine historical role-guides x three paths x four variants");
 assert.equal(report.counts.confessionAfter,36,"Three aftercare cards x three paths x four variants");
 assert.equal(report.counts.benedictionOrdinary,28);
 assert.equal(report.counts.benedictionExtended,44);
 console.log("PASS Prayer stage matrix: 272 Confession cards plus 72 Benediction stages; no all-41-route or print certification");
}finally{
 await mkdir(out,{recursive:true});
 await writeFile(resolve(out,"confession-benediction-stage-matrix.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
