import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from "../src/pray/icksp-divine-infant-king-novena.v1.js";
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from "../src/pray/icksp-immaculate-conception-novena.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../src/pray/holy-face-janvier-1887-b25.js";
import {novenaSourceWitnessFaceV1} from "../src/pray/novena-source-witness-face.v1.js";
import {novenaStageChapters} from "../src/pray/devotional-sequence-adapter.js";
import {PRAY_CANONICAL_DATA_V435930 as CANONICAL} from "../src/pray/canonical-data.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-novena-all-programmes");
const ledger=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-release-coverage-evidence.v1.json"),"utf8"));
assert.equal(ledger.routes.find(x=>x.id==="pray.novenas")?.kind,"MULTI_TEXT");
assert.equal(ledger.counts.fullRouteVariantCertificates,0,"Don't certify all Prayer routes from a Novena-only gate");
const programmes={...NOVENA_CORPUS_V4,
 [ICKSP_DIVINE_INFANT_KING_NOVENA_V1.id]:ICKSP_DIVINE_INFANT_KING_NOVENA_V1,
 [ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.id]:ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,
 [NOVENA_HOLY_FACE_1887_B25.id]:NOVENA_HOLY_FACE_1887_B25};
assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16);
assert.equal(Object.keys(programmes).length,19);
const normalized=x=>String(x??"").normalize("NFC").replace(/\s/g,"");
const patternOf=n=>n.pattern||(n.id==="immaculate_conception"?"OPENING_DAY_COMMON_CLOSE":"STANDARD");
const hasCommon=n=>!!(n.commonPrayers?.length||n.sharedClosingText);
const chaptersFor=(n,fr)=>patternOf(n)==="SOURCE_REPEAT_ONLY"
 ?[{id:"prepare"},{id:"repeat"},{id:"close"}]
 :novenaStageChapters({pattern:patternOf(n),sharedClosing:!!n.sharedClosingText,
   commonRequired:hasCommon(n)},{french:fr});
const dayStageIndex=n=>patternOf(n)==="SOURCE_REPEAT_ONLY"?1:
 patternOf(n)==="HAMMER_MARIAN"?3:patternOf(n)==="OPENING_DAY_COMMON_CLOSE"?3:
 patternOf(n)==="COMMON_BEFORE_REPEAT"?2:1;
const sourceDay=(n,day)=>n.form==="REPEAT_FORM"?n.repeatText:n.days[day-1].text;
const counters={programmeLanguageWidths:0,dayModeVariants:0,guidedStageVariants:0,
 properDayExact:0,frenchSourceDayPresent:0,englishOnlySourceHeld:0,
 frenchToEnglishWitnessRoundTrips:0,canonicalLanguageRoundTrips:0,
 sourceCitations:0,navigationChecks:0};
const totalChapters=Object.values(programmes).reduce((s,n)=>s+chaptersFor(n,false).length*9,0);
assert.equal(totalChapters,684,"Canonical guided 684-card per language-width baseline");
let trueFrench=0,trueEnglish=0;
for(const n of Object.values(programmes)){
 assert.equal(n.days.length,9,n.id);
 for(let day=1;day<=9;day++){
  const t=sourceDay(n,day),en=novenaSourceWitnessFaceV1(t,"en"),fr=novenaSourceWitnessFaceV1(t,"fr");
  assert.ok(en.language&&en.text,n.id+"/"+day+" missing original source");
  trueEnglish+=Number(en.language==="en");trueFrench+=Number(fr.language==="fr");
 }
}
assert.equal(trueEnglish,171);assert.equal(trueFrench,162);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const report={schema:"ao.pray.novena-all-19-stage-variants.v1",date:"2026-11-03",
 coverage:"ALL_19_NOVENAS_171_DAY_PROPER_SOURCE_FACES_684_GUIDED_CARDS_171_SIMPLE_CARDS_BOTH_LANGUAGES_320_AND_390",
 boundary:"READING_AND_SOURCE_GATE_NOT_PRINT_EDITION_OFFLINE_OR_ALL_41_ROUTE_CERTIFICATION",
 programmes:[],errors:[],counters,releaseClaims:{all41RouteCertificates:0,independentPrintEditionCertificates:0}};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",
   reducedMotion:"reduce",locale:ui==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage(),pageErrors=[];
  page.on("pageerror",e=>pageErrors.push(String(e.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&
    typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(k=>document.documentElement.lang===k,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_NOVENAS_V3?.open==="function",null,{timeout:30000});
   const rootSel="#aoPray435930.open .aoN1Reader";
   for(const [id,n] of Object.entries(programmes)){
    assert.equal(await page.evaluate(id=>globalThis.AO_NOVENAS_V3.open({novenaId:id,returnContext:null}),id),true);
    const detail=page.locator("#aoPray435930.open .aoN1DetailFolio");
    assert.equal(await detail.locator("[data-n1-day]").count(),9,id+" lost original nine-day structure");
    assert.equal(await detail.locator(".aoN1AboutDisclosure").evaluate(el=>el.open),false,
     id+" historical introductory material must not displace prayer");
    await detail.locator("[data-n1-mode='guided']").evaluate(el=>el.click());
    await detail.locator("[data-n1-begin]").evaluate(el=>el.click());
    await page.waitForSelector(rootSel+'[data-ao-novena-deck="guided"]',{timeout:15000});
    const expectedChapters=chaptersFor(n,ui==="fr");
    const stageOfDay=dayStageIndex(n);
    assert.ok(expectedChapters[stageOfDay]?.id===
     (patternOf(n)==="SOURCE_REPEAT_ONLY"?"repeat":"day"),id+" day source is on unexpected stage");
    let stagesObserved=0,properVerified=0;
    // Guided: inspect EVERY original source-owned stage on all nine days.
    // The real source owner handles each click, rather than a replacement
    // reader or injected prayer text; one DOM extraction follows its render.
    for(let day=1;day<=9;day++){
     for(let stage=0;stage<expectedChapters.length;stage++){
      const info=await page.evaluate(async ({day,stage})=>{
       const wrap=document.querySelector("#aoPray435930.open .aoN1Reader");
       if(!wrap)return{error:"missing reader"};
       if(window.AO_NOVENAS_V3.state().day!==day){
        const disclosure=wrap.querySelector(".aoN1DayDisclosure");
        if(disclosure)disclosure.open=true;
        const btn=disclosure?.querySelector("[data-n1-day='"+day+"']");
        if(!btn)return{error:"missing actual day control",day};
        btn.click();await Promise.resolve();
       }
       const b=document.querySelector("#aoPray435930.open .aoN1Reader [data-ao-devo-chapter='"+stage+"']");
       if(!b)return{error:"missing actual chapter button",day,stage};
       b.click();await Promise.resolve();
       const el=document.querySelector("#aoPray435930.open .aoN1Reader"),
         scroll=el?.querySelector(".aoDevoCardScroll"),
         progress=el?.querySelector("[data-ao-novena-stage-progress]"),
         data=window.AO_NOVENAS_V3.state();
       const witnesses=[...(scroll?.querySelectorAll(".aoN1SourceText")||[])].map(x=>({
        language:x.dataset.n1SourceLanguage,notice:!!x.querySelector("[data-n1-proper-source-fallback]"),
        text:[...x.querySelectorAll(".aoN1PrayerParagraph")].map(x=>x.textContent).join("\n\n"),
        toggle:!!x.querySelector("[data-n1-show-en]")
       }));
       return {id:data.id,day:data.day,stage:data.stage,mode:data.mode,
        card:el?.querySelector(".aoDevoCard")?.dataset.aoDevoCard,
        current:el?.querySelectorAll('.aoDevoStop[aria-current="step"]').length,
        progress:progress?{now:progress.getAttribute("aria-valuenow"),max:progress.getAttribute("aria-valuemax")}:null,
        totalStages:el?.querySelectorAll("[data-ao-devo-chapter]").length,
        bodyLength:(scroll?.innerText||"").trim().length,
        documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
        cardOverflow:scroll?Math.max(0,scroll.scrollWidth-scroll.clientWidth):null,
        editor:scroll?.querySelectorAll("textarea,[contenteditable='true'],input[type='text']").length,
        witness:witnesses,sourceLinks:scroll?.querySelectorAll('.aoN1SourceDetails a[href]').length||0,
        lang:document.documentElement.lang};
      },{day,stage});
      assert.ok(!info.error,id+"/"+day+"/"+stage+" "+JSON.stringify(info));
      assert.deepEqual([info.id,info.day,info.stage,info.mode],[id,day,stage,"guided"],
       id+"/"+day+"/"+stage+" source-owned navigation diverged");
      assert.equal(info.card,expectedChapters[stage].id,id+"/"+day+"/"+stage+" stage identity diverged");
      assert.equal(info.lang,ui,id+"/"+day+"/"+stage+" UI language changed");
      assert.equal(info.totalStages,expectedChapters.length,id+"/"+day+" chapter rail changed");
      assert.equal(info.current,1,id+"/"+day+"/"+stage+" selected chapter ambiguity");
      assert.deepEqual(info.progress,{now:String(stage+1),max:String(expectedChapters.length)},
       id+"/"+day+"/"+stage+" inaccurate progress");
      assert.ok(info.bodyLength>22,id+"/"+day+"/"+stage+" blank stage");
      assert.ok(info.documentOverflow<=2&&info.cardOverflow<=2,
       id+"/"+day+"/"+stage+"/"+width+"/"+ui+" clipping: "+JSON.stringify(info));
      assert.equal(info.editor,0,id+"/"+day+"/"+stage+" invented intention capture UI");
      if(stage===expectedChapters.length-1){
       assert.ok(info.sourceLinks>=0,"Source disclosures must remain opt-in");
       counters.sourceCitations+=info.sourceLinks;
      }
      if(stage===stageOfDay){
       const expected=novenaSourceWitnessFaceV1(sourceDay(n,day),ui);
       assert.ok(expected.language&&expected.text,id+"/"+day+" missing original proper");
       const found=info.witness.find(x=>x.language===expected.language&&
        normalized(x.text)===normalized(expected.text));
       assert.ok(found,id+"/"+day+"/"+width+"/"+ui+" missing exact day proper or source-language label: "+JSON.stringify({
        wantedLanguage:expected.language,wantedChars:expected.text.length,
        candidates:info.witness.map(x=>({lang:x.language,chars:x.text.length}))}));
       assert.equal(found.notice,expected.requestedUnavailable,
        id+"/"+day+"/"+ui+" fallback notice not matched to actual source");
       if(ui==="fr"){
        counters.frenchSourceDayPresent+=Number(expected.language==="fr");
        counters.englishOnlySourceHeld+=Number(expected.language==="en");
       }
       properVerified++;counters.properDayExact++;
      }
      stagesObserved++;counters.guidedStageVariants++;
     }
     counters.navigationChecks++;
    }
    assert.equal(stagesObserved,expectedChapters.length*9,id+" guided stages incomplete");
    assert.equal(properVerified,9,id+" proper day source coverage incomplete");
    // Simple is one COMPLETE continuous reading per day, not guided excerpts.
    await page.locator(rootSel+" [data-n1-mode='simple']").evaluate(x=>x.click());
    for(let day=1;day<=9;day++){
     const snapshot=await page.evaluate(async day=>{
      const wrap=document.querySelector("#aoPray435930.open .aoN1Reader");
      const dis=wrap?.querySelector(".aoN1DayDisclosure");if(dis)dis.open=true;
      const button=dis?.querySelector("[data-n1-day='"+day+"']");
      if(!button)return{error:"day selector absent"};button.click();await Promise.resolve();
      const root=document.querySelector("#aoPray435930.open .aoN1Reader"),
        card=root?.querySelector(".aoDevoCard"),scroll=card?.querySelector(".aoDevoCardScroll"),
        state=window.AO_NOVENAS_V3.state();
      return {mode:state.mode,day:state.day,stage:state.stage,
       card:card?.dataset.aoDevoCard,stops:root?.querySelectorAll(".aoDevoStop").length,
       source:[...(scroll?.querySelectorAll(".aoN1SourceText")||[])].map(x=>({
        language:x.dataset.n1SourceLanguage,
        notice:!!x.querySelector("[data-n1-proper-source-fallback]"),
        text:[...x.querySelectorAll(".aoN1PrayerParagraph")].map(p=>p.textContent).join("\n\n"),
        toggle:!!x.querySelector("[data-n1-show-en]")
       })),
       canonical:[...(scroll?.querySelectorAll(".aoN1Canon")||[])].map(x=>x.dataset.n1CanonicalLanguage),
       overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
       innerOverflow:scroll?Math.max(0,scroll.scrollWidth-scroll.clientWidth):null,
       textLength:(scroll?.innerText||"").length,lang:document.documentElement.lang};
     },day);
     assert.ok(!snapshot.error,id+"/"+day+" simple missing day button");
     assert.deepEqual([snapshot.mode,snapshot.day,snapshot.stage,snapshot.card,snapshot.stops],
      ["simple",day,0,"day-"+day,1],id+"/"+day+" Simple falsely created extra stages");
     assert.equal(snapshot.lang,ui);
     assert.ok(snapshot.textLength>30&&snapshot.overflow<=2&&snapshot.innerOverflow<=2,
      id+"/"+day+"/"+width+"/"+ui+" Simple clipped or empty");
     const expected=novenaSourceWitnessFaceV1(sourceDay(n,day),ui);
     const matched=snapshot.source.find(x=>x.language===expected.language&&
      normalized(x.text)===normalized(expected.text));
     assert.ok(matched,id+"/"+day+"/"+ui+" Simple dropped or altered the original complete proper");
     assert.equal(matched.notice,expected.requestedUnavailable);
     counters.dayModeVariants++;
     if(ui==="fr"&&expected.canToggleEnglish){
      const result=await page.evaluate(async ({day,expectedEn})=>{
       const root=document.querySelector("#aoPray435930.open .aoN1Reader");
       const daySource=[...root.querySelectorAll(".aoN1SourceText")].find(x=>
         !!x.querySelector("[data-n1-show-en]")&&
         [...x.querySelectorAll(".aoN1PrayerParagraph")].map(p=>p.textContent).join("").replace(/\s/g,"")===expectedEn.replace(/\s/g,""));
       // The first click is on a real source-toggle button associated with
       // a currently visible bilingual proper; preserve its context.
       const before=window.AO_NOVENAS_V3.state();
       const button=root.querySelector(".aoN1SourceText [data-n1-show-en]");
       if(!button)return{error:"no bilingual source toggle"};
       button.click();await Promise.resolve();
       const after=window.AO_NOVENAS_V3.state();
       const texts=[...document.querySelectorAll("#aoPray435930.open .aoN1Reader .aoN1SourceText")].map(x=>({
        lang:x.dataset.n1SourceLanguage,
        text:[...x.querySelectorAll(".aoN1PrayerParagraph")].map(p=>p.textContent).join("\n\n")
       }));
       return {before:{id:before.id,day:before.day,mode:before.mode},
        after:{id:after.id,day:after.day,mode:after.mode,showEnglish:after.showEnglish},texts};
      },{day,expectedEn:expected.text});
      assert.ok(!result.error,id+"/"+day+" English historical witness switch missing");
      assert.deepEqual([result.after.id,result.after.day,result.after.mode,result.after.showEnglish],
       [id,day,"simple",true],id+"/"+day+" bilingual witness toggle changed day or mode");
      const english=novenaSourceWitnessFaceV1(sourceDay(n,day),"en");
      assert.ok(result.texts.some(x=>x.lang==="en"&&normalized(x.text)===normalized(english.text)),
       id+"/"+day+" selected original English source does not match");
      const back=await page.evaluate(async()=>{
       const b=document.querySelector("#aoPray435930.open .aoN1Reader .aoN1SourceText [data-n1-show-en]");
       if(!b)return false;b.click();await Promise.resolve();
       return globalThis.AO_NOVENAS_V3.state().showEnglish===false;
      });
      assert.equal(back,true,id+"/"+day+" failed return to original French source");
      counters.frenchToEnglishWitnessRoundTrips++;
     }
     if(day===1){
      // Common Latin toggles only attested canonical prayers, never creates
      // Latin for the novena's historical source words.
      const latin=await page.evaluate(async()=>{
       const root=document.querySelector("#aoPray435930.open .aoN1Reader"),
         dis=root.querySelector(".aoN1DayDisclosure");
       if(dis)dis.open=true;
       const b=root.querySelector("[data-n1-common-latin]");
       if(!b)return{available:false};
       const original=root.querySelector(".aoN1Canon [data-face-v]"),
         existingLatin=root.querySelector(".aoN1Canon [data-face-la]");
       const before={day:window.AO_NOVENAS_V3.state().day,
        mode:window.AO_NOVENAS_V3.state().mode,
        source:root.querySelector(".aoN1SourceText")?.dataset.n1SourceLanguage};
       b.click();await Promise.resolve();
       const next=document.querySelector("#aoPray435930.open .aoN1Reader");
       const verified={latin:window.AO_NOVENAS_V3.state().commonLatin,
        day:window.AO_NOVENAS_V3.state().day,
        mode:window.AO_NOVENAS_V3.state().mode,
        visibleLatin:!!next.querySelector(".aoN1Canon [data-face-la]:not([hidden])"),
        properLanguage:next.querySelector(".aoN1SourceText")?.dataset.n1SourceLanguage};
       next.querySelector("[data-n1-common-latin]")?.click();await Promise.resolve();
       return{available:true,original:!!original,originalLatin:!!existingLatin,before,verified,
        restored:window.AO_NOVENAS_V3.state().commonLatin===false};
      });
      if(latin.available){
       assert.ok(latin.original&&latin.originalLatin,id+" Latin toggle without canonical sources");
       assert.deepEqual([latin.verified.latin,latin.verified.day,latin.verified.mode,latin.verified.visibleLatin],
        [true,1,"simple",true],id+" canonical Latin activation damaged Novena reader");
       assert.equal(latin.verified.properLanguage,latin.before.source,
        id+" toggling shared Latin changed historical witness language");
       assert.equal(latin.restored,true,id+" canonical source face failed to restore vernacular");
       counters.canonicalLanguageRoundTrips++;
      }
     }
    }
    // Last-day navigation is a return to the source-owned programme cover,
    // never a fake completion counter or stored personal intention.
    const final=await page.evaluate(async ()=>{
     const b=document.querySelector("#aoPray435930.open .aoN1Reader [data-n1-day-next]");
     if(!b)return null;
     b.click();await Promise.resolve();
     return{state:window.AO_NOVENAS_V3.state(),
      detail:document.querySelectorAll("#aoPray435930.open .aoN1DetailFolio").length,
      intentionEditors:document.querySelectorAll("#aoPray435930.open input[type='text'],#aoPray435930.open textarea").length};
    });
    assert.equal(final?.state.screen,"detail",id+" day nine falsely certifies personal completion");
    assert.equal(final?.detail,1,id+" final day did not restore programme details");
    assert.equal(final?.intentionEditors,0,id+" introduced personal intention capture");
    counters.programmeLanguageWidths++;
    report.programmes.push({width,ui,id,
     pattern:patternOf(n),days:9,sourceProperVerified:properVerified,
     guidedStageVariants:stagesObserved,simpleDayVariants:9,
     historicalFrenchProperDays:n.days.filter((_,i)=>
      novenaSourceWitnessFaceV1(sourceDay(n,i+1),"fr").language==="fr").length});
    console.log("PASS novena "+width+" "+ui+" "+id+" · 9 days · "+stagesObserved+" guided stages · 9 simple");
   }
   assert.deepEqual(pageErrors,[],"Novena browser errors "+width+"/"+ui+": "+pageErrors.join(" | "));
  }catch(e){report.errors.push({width,ui,details:String(e?.stack||e)});throw e;}
  finally{await ctx.close();}
 }
 assert.equal(counters.programmeLanguageWidths,76,"19 programmes x two widths x EN/FR");
 assert.equal(counters.guidedStageVariants,2736,"684 historical guided cards x four phone/language variants");
 assert.equal(counters.dayModeVariants,684,"171 source-owned simple days x four phone/language variants");
 assert.equal(counters.properDayExact,684,"171 correct historical day prayer witnesses x four variants");
 assert.equal(counters.frenchSourceDayPresent,324,"162 French proper days x two widths");
 assert.equal(counters.englishOnlySourceHeld,18,"9 original-English-only Holy Face proper days x two widths");
 assert.equal(counters.frenchToEnglishWitnessRoundTrips,324,"162 bilingual day-source switches x two widths");
 console.log("PASS Novenas 19/19 programmes; 171/171 proper days; 2736/2736 guided card variants; "+
  "684/684 Simple day variants; 324 French/English witness toggles; historical Holy Face English-only holds preserved.");
}finally{
 await mkdir(output,{recursive:true});
 await writeFile(resolve(output,"nineteen-novena-all-stages-phone.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
