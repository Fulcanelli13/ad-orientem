import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {NIGHT_HOME_B29_STAGES,nightHomeAsGuided} from "../src/pray/night-home-adoration-b29.js";
import {ADORATION_FOUR_OPTIONAL_SOURCE_IDS} from "../src/pray/adoration-four-purpose-options.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-adoration-full-stage");
const ledger=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-release-coverage-evidence.v1.json"),"utf8"));
assert.equal(ledger.routes.find(x=>x.id==="pray.adoration")?.kind,"MULTI_TEXT");
assert.equal(ledger.counts.fullRouteVariantCertificates,0,"All-41-route certification not authorized");
const sources=DATA.prayers,plain=x=>String(x??"").normalize("NFC").replace(/\s/g,"");
const sourceFace=id=>value=>{
 const t=plain(value);
 // The Our Father has two approved ℣/℟ live-reading speaker cues. They
 // are UI semantics, not extra original words: require the complete pair
 // when present and compare every canonical word unchanged.
 if(id!=="foundations_our_father")return t;
 const nV=(t.match(/℣\./g)||[]).length,nR=(t.match(/℟\./g)||[]).length;
 assert.equal(nV,nR,"Our Father lost one half of its approved speaker cue pair");
 assert.ok(nV<=1,"Our Father duplicated the leader/response cue");
 return t.replace("℣.","").replace("℟.","");
};
const guided={
 visit:[
  ["foundations_sign_of_cross"],
  ["foundations_act_of_faith","foundations_prayer_of_adoration"],
  ["foundations_glory_be"],
  ["sacrament_act_of_contrition"],
  ["foundations_our_father"],
  [],
  ["foundations_act_of_love","adoration_spiritual_communion","foundations_sign_of_cross"]
 ],
 holy:[
  ["foundations_act_of_faith"],
  ["foundations_prayer_of_adoration","foundations_glory_be"],
  [],
  ["sacrament_act_of_contrition"],
  ["foundations_our_father"],
  ["foundations_act_of_hope"],
  [],
  ["foundations_act_of_love"]
 ],
 four:[
  ["foundations_prayer_of_adoration"],
  ["foundations_glory_be"],
  ["sacrament_act_of_contrition"],
  ["foundations_our_father"],
  []
 ],
 night:NIGHT_HOME_B29_STAGES.map(s=>[...s.canonicalIds])
};
assert.deepEqual(Object.fromEntries(Object.entries(guided).map(([k,v])=>[k,v.length])),
 {visit:7,holy:8,four:5,night:6});
for(const [mode,steps] of Object.entries(guided))for(const [index,ids] of steps.entries())for(const id of ids){
 const p=sources[id];
 assert.ok(p?.en&&p?.fr&&p?.la,mode+"/"+index+" has an unattested canonical source "+id);
}
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
const report={schema:"ao.pray.adoration-guided-stage-browser.v1",
 scope:"ALL_GUIDED_METHOD_STAGES_ON_2_PHONE_WIDTHS_2_UI_LANGUAGES_NOT_INDEPENDENT_PRINT_EDITION_OR_OFFLINE_CERTIFICATE",
 guidedStages:[],optionalSources:[],quietReturns:[],nonGuidedModes:[],errors:[],
 counts:{guidedStageObservations:0,canonicalPrayerFaceComparisons:0,optionalSourceRoundTrips:0,quietModeRoundTrips:0,treasuryHandoffs:0,openSilentMode:0},
 claims:{all41RoutesCertified:0,independentOriginalPrintCertificates:0}};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",
   reducedMotion:"reduce",locale:ui==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&
    typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(language=>document.documentElement.lang===language,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const sel="#aoPray435930.open .aoP435930AdorationReader";
   const timeline=sel+" .aoDevoSequenceTimeline";
   const dismissAction=async()=>{
    const cue=page.locator("body > .aoDevotionalActionCinematic[role='dialog']");
    if(await cue.isVisible().catch(()=>false)){
     await cue.locator(".aoDevotionalActionContinue").click({timeout:10000});
     await cue.waitFor({state:"detached",timeout:10000});
    }
   };
   const chooser=async()=>{
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null})),true);
    await page.locator("#aoPray435930.open .aoAdorationChooser").waitFor({state:"visible",timeout:15000});
   };
   await chooser();
   for(const [mode,expectedStages] of Object.entries(guided)){
    await page.locator('#aoPray435930.open [data-p435930-ador-mode="'+mode+'"]').click();
    await page.waitForFunction(mode=>document.querySelector("#aoPray435930.open .aoP435930AdorationReader")?.dataset.aoAdorationMode===mode,mode,{timeout:10000});
    if(mode==="visit"){
     const cue=page.locator("body > .aoDevotionalActionCinematic[data-ao-action-scene='VISIT.ARRIVAL']");
     await cue.waitFor({state:"visible",timeout:12000});
     assert.equal(await cue.getAttribute("aria-modal"),"true","Visit arrival cinematic must remain a real modal");
     await dismissAction();
    }
    assert.equal(await page.locator(timeline+" [data-ao-devo-chapter]").count(),expectedStages.length,
     mode+" chapter rail count changed");
    for(let index=0;index<expectedStages.length;index++){
     await dismissAction();
     await page.locator(timeline+' [data-ao-devo-chapter="'+index+'"]').click({timeout:15000});
     await page.waitForFunction(({mode,index})=>{
      const r=document.querySelector("#aoPray435930.open .aoP435930AdorationReader");
      return r?.dataset.aoAdorationMode===mode&&+r.dataset.aoAdorationStep===index&&
       r.querySelector(".aoDevoCard")?.dataset.aoDevoCard===mode+"-"+index;
     },{mode,index},{timeout:10000});
     await dismissAction();
     const observed=await page.locator(sel).evaluate(el=>{
      const card=el.querySelector(".aoDevoCard"),scroll=card?.querySelector(".aoDevoCardScroll");
      return {mode:el.dataset.aoAdorationMode,index:+el.dataset.aoAdorationStep,
       card:card?.dataset.aoDevoCard,sourceText:(scroll?.innerText||"").length,
       current:el.querySelectorAll('.aoDevoStop[aria-current="step"]').length,
       visiblePrayers:scroll?.querySelectorAll(".aoP435930GuidePrayers > .aoP435930Prayer").length||0,
       documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
       readerOverflow:Math.max(0,el.scrollWidth-el.clientWidth),
       scrollOverflow:scroll?Math.max(0,scroll.scrollWidth-scroll.clientWidth):null,
       scrollAxis:scroll?getComputedStyle(scroll).overflowY:null,
       language:document.documentElement.lang,
       quietAction:scroll?.querySelectorAll("[data-p435930-ador-quiet-enter]").length||0,
       finish:el.querySelectorAll("[data-p435930-"+el.dataset.aoAdorationMode+"-finish]").length,
       timerControls:el.querySelectorAll("[data-p435930-timer]").length,
       error:el.querySelectorAll("[data-p435930-internal-route-error]").length};
     });
     assert.equal(observed.language,ui,mode+"/"+index+" lost UI language");
     assert.ok(observed.sourceText>=20,mode+"/"+index+" lost complete guiding text");
     assert.equal(observed.current,1,mode+"/"+index+" has ambiguous current chapter");
     assert.equal(observed.scrollAxis,"auto",mode+"/"+index+" must scroll vertically");
     assert.equal(observed.quietAction,1,mode+"/"+index+" lost access to stillness");
     assert.equal(observed.error,0,mode+"/"+index+" source route error");
     assert.ok(observed.documentOverflow<=2&&observed.readerOverflow<=2&&observed.scrollOverflow<=2,
      mode+"/"+index+"/"+width+"/"+ui+" clipped content: "+JSON.stringify(observed));
     assert.equal(observed.finish,index===expectedStages.length-1?1:0,
      mode+"/"+index+" changes explicit finish availability");
     const expectedIds=expectedStages[index];
     assert.equal(observed.visiblePrayers,expectedIds.length,mode+"/"+index+" dropped or duplicated canonical prayers");
     if(expectedIds.length){
      const rendered=await page.locator(sel+" .aoDevoCardScroll .aoP435930GuidePrayers > .aoP435930Prayer").evaluateAll(cards=>cards.map(card=>{
       const flip=card.querySelector("[data-p435930-flip]");
       const vern=flip?.querySelector("[data-face-v]");
       const latin=flip?.querySelector("[data-face-la]");
       const solo=card.querySelector(".aoP435930Text");
       return {vernText:vern?.textContent||solo?.textContent||"",
        language:vern?.getAttribute("lang")||solo?.getAttribute("lang")||null,
        latinText:latin?.textContent||null,latinLanguage:latin?.getAttribute("lang")||null,
        latinHidden:latin?.hidden??null};
      }));
      for(let n=0;n<expectedIds.length;n++){
       const id=expectedIds[n],prayer=sources[id],actual=rendered[n];
       assert.equal(actual.language,ui,mode+"/"+index+"/"+id+" falsely labels the source language");
       assert.equal(sourceFace(id)(actual.vernText),plain(prayer[ui]),
        mode+"/"+index+"/"+id+" canonical "+ui+" prayer altered");
       assert.equal(actual.latinLanguage,"la",mode+"/"+index+"/"+id+" lost attested Latin face");
       assert.equal(sourceFace(id)(actual.latinText),plain(prayer.la),
        mode+"/"+index+"/"+id+" canonical Latin prayer altered");
       assert.equal(actual.latinHidden,true,mode+"/"+index+"/"+id+" starts on the wrong language face");
       report.counts.canonicalPrayerFaceComparisons++;
      }
     }
     if(mode==="night"){
      const model=nightHomeAsGuided(ui)[index];
      assert.ok((await page.locator(sel+" .aoDevoCardScroll").innerText()).includes(model.now),
       "Night home editorial guidance missing at "+index);
      assert.equal(await page.locator(sel+" [data-ao-home-night='fr-mateo']").count(),1);
     }
     if(mode==="four"&&index<4){
      const phase=["adoration","thanksgiving","reparation","petition"][index];
      const section=page.locator(sel+' [data-ao-four-purpose="'+phase+'"]');
      const optional=ADORATION_FOUR_OPTIONAL_SOURCE_IDS[phase]||[];
      assert.equal(await section.count(),optional.length?1:0,
       "No invented Thanksgiving devotional source may be added");
      if(optional.length){
       const id=optional[0];
       assert.equal(await section.locator("[data-ao-four-source]").count(),0,
        phase+" must be absent until explicitly chosen");
       await section.locator('[data-p435930-four-choice="'+phase+":"+id+'"]').click();
       const added=page.locator(sel+' [data-ao-four-source="'+id+'"]');
       await added.waitFor({state:"attached",timeout:10000});
       const face=await added.evaluate(el=>{
        const b=el.querySelector("[data-p435930-flip]");
        return {en:b?.querySelector("[data-face-v]")?.textContent,
         latin:b?.querySelector("[data-face-la]")?.textContent};
       });
       assert.equal(plain(face.en),plain(sources[id][ui]),phase+" opted-in source changed");
       assert.equal(plain(face.latin),plain(sources[id].la),phase+" opted-in Latin changed");
       assert.equal(await page.locator(sel).getAttribute("data-ao-adoration-step"),String(index),
        phase+" optional selection jumped to another stage");
       await section.locator('[data-p435930-four-choice="'+phase+':none"]').click();
       assert.equal(await page.locator(sel+" [data-ao-four-source]").count(),0,
        phase+" deselect did not remove whole optional prayer");
       report.optionalSources.push({width,ui,phase,id,selectedAndCleared:true});
       report.counts.optionalSourceRoundTrips++;
      }
     }
     if(index===Math.min(1,expectedStages.length-1)){
      // True quiet is a focus-managed viewport-wide mode. No tapping through
      // a hidden overlay and no forced duration, stage score, or completion.
      const scroll=page.locator(sel+" .aoDevoCardScroll");
      await scroll.evaluate(el=>{el.scrollTop=40});
      // Playwright's real click first scrolls the link into view. The
      // authentic user-position contract is the scroll AT THE TAP, not
      // an earlier programmatic position before button discovery.
      const pause=page.locator(sel+" [data-p435930-ador-quiet-enter]");
      await pause.scrollIntoViewIfNeeded();
      const before=await scroll.evaluate(el=>el.scrollTop);
      await pause.click();
      const quiet=page.locator(sel+'.aoAdorationQuietScreen[data-ao-adoration-quiet="true"]');
      await quiet.waitFor({state:"visible",timeout:10000});
      const details=await quiet.evaluate(el=>{
       const r=el.getBoundingClientRect();return {role:el.getAttribute("role"),
        modal:el.getAttribute("aria-modal"),position:getComputedStyle(el).position,
        width:r.width,height:r.height,left:r.left,top:r.top,
        focus:document.activeElement?.matches("[data-p435930-ador-quiet-exit]")===true,
        timer:el.querySelectorAll("[data-p435930-timer]").length,
        timeText:el.innerText.slice(0,400)};
      });
      assert.deepEqual([details.role,details.modal,details.position],["dialog","true","fixed"],
       mode+"/"+index+" is not true silent fullscreen");
      assert.ok(details.width>=width-1&&details.left===0&&details.top===0,
       mode+"/"+index+" allows global chrome over silence");
      assert.equal(details.focus,true,mode+"/"+index+" quiet exit loses keyboard focus");
      assert.equal(details.timer,0,mode+"/"+index+" silently starts a timer");
      await quiet.locator("[data-p435930-ador-quiet-exit]").click();
      await page.waitForFunction(({mode,index})=>{
       const el=document.querySelector("#aoPray435930.open .aoP435930AdorationReader");
       return el?.dataset.aoAdorationMode===mode&&+el.dataset.aoAdorationStep===index&&
        el.dataset.aoAdorationQuiet!=="true";
      },{mode,index},{timeout:10000});
      // Quiet exit restores the focus runway in a microtask and then a
      // requestAnimationFrame; test the settled paint, not an intermediate
      // scroll produced during DOM remount and focus reconciliation.
      await page.waitForFunction(({before})=>{
       const el=document.querySelector("#aoPray435930.open .aoP435930AdorationReader .aoDevoCardScroll");
       return el&&Math.abs(el.scrollTop-before)<=3;
      },{before},{timeout:3000,polling:"raf"}).catch(async error=>{
       const observed=await page.locator(sel+" .aoDevoCardScroll").evaluate(el=>({
        top:el.scrollTop,max:el.scrollHeight-el.clientHeight,
        current:document.activeElement?.outerHTML?.slice(0,350),
        runway:el.dataset.aoFocusRunway,mode:el.closest("[data-ao-adoration-mode]")?.dataset.aoAdorationMode
       }));
       throw new Error(mode+"/"+index+" quiet return failed after settled paint: saved="+before+
        " observed="+JSON.stringify(observed)+" "+String(error));
      });
      const resumed=await page.locator(sel+" .aoDevoCardScroll").evaluate(el=>el.scrollTop);
      assert.ok(Math.abs(resumed-before)<=3,mode+"/"+index+" lost position on quiet return "+before+" => "+resumed);
      report.quietReturns.push({width,ui,mode,atStage:index,restoredScroll:true});
      report.counts.quietModeRoundTrips++;
     }
     report.guidedStages.push({width,ui,mode,index,id:observed.card,
      canonicalIds:expectedIds,sourceExact:true,overflow:observed.documentOverflow});
     report.counts.guidedStageObservations++;
    }
    const last=expectedStages.length-1;
    await page.locator(sel+" [data-p435930-"+mode+"-finish]").click();
    if(mode==="four"){
     assert.equal(await page.locator(sel+'[data-ao-adoration-mode="open"]').count(),1,
      "Four Ends must return to untimed open Adoration");
     await page.locator(sel+" [data-p435930-ador-home]").click();
    }else{
     await page.locator("#aoPray435930.open .aoAdorationChooser").waitFor({state:"visible",timeout:10000});
    }
    assert.equal(await page.locator("#aoPray435930.open .aoAdorationMethodsDisclosure").count(),1,
     mode+" finish does not restore chooser");
    console.log("PASS Adoration "+width+" "+ui+" "+mode+" "+expectedStages.length+" exact guided stages");
   }

   // Open adoration is not a seven-card checklist. Silence and guidance remain
   // opt-in, its real quiet screen must restore open mode without starting time.
   await page.locator('#aoPray435930.open [data-p435930-ador-mode="open"]').click();
   assert.equal(await page.locator(timeline).count(),0,"Open silence acquired an unwanted stage rail");
   assert.equal(await page.locator(sel+" .aoAdorationOptionDisclosure").count(),3);
   assert.equal(await page.locator(sel+" .aoAdorationOptionDisclosure[open]").count(),0);
   assert.equal(await page.locator(sel+" [data-ao-adoration-timer]").evaluate(el=>el.open),false,
    "Untimed open Adoration must keep the optional clock disclosure closed");
   assert.equal(await page.locator(sel+" [data-p435930-timer]:visible").count(),0,
    "Untimed open Adoration must not expose running or prompted timers");
   await page.locator(sel+" [data-p435930-ador-quiet-enter]").click();
   const quietOpen=page.locator(sel+'.aoAdorationQuietScreen[aria-modal="true"]');
   await quietOpen.waitFor({state:"visible",timeout:10000});
   assert.equal(await quietOpen.locator("[data-p435930-quiet-time]").count(),1,
    "Optional timer button must remain explicit, not automatic");
   assert.match(await quietOpen.innerText(),ui==="fr"?/sans|longtemps|souhaitez/i:/as long as|wish/i);
   await quietOpen.locator("[data-p435930-ador-quiet-exit]").click();
   assert.equal(await page.locator(sel+" .aoAdorationOpenPrayer").count(),1);
   report.nonGuidedModes.push({width,ui,mode:"open",untimed:true,quietReturn:true});
   report.counts.openSilentMode++;
   await page.locator(sel+" [data-p435930-ador-home]").click();

   // Treasury is a library of seven source-owned prayers, not an alternative
   // abbreviated prayer corpus. Test each real open -> return handoff.
   await page.locator('#aoPray435930.open [data-p435930-ador-mode="treasury"]').click();
   const treasury=["foundations_prayer_of_adoration","adoration_anima_christi",
    "adoration_spiritual_communion","adoration_lord_i_am_not_worthy",
    "benediction_o_salutaris","benediction_tantum_ergo","adoration_litany_blessed_sacrament"];
   for(const id of treasury){
    const target=page.locator(sel+' [data-p435930-open-prayer="'+id+'"]').first();
    await target.click();
    const prayer=page.locator("#aoPray435930.open .aoP435930LibraryReader");
    await prayer.waitFor({state:"visible",timeout:12000});
    assert.equal(await prayer.locator('[data-ao-devo-card="'+id+'"]').count(),1,
     id+" switched to the wrong canonical prayer");
    await prayer.locator("[data-p435930-prayer-return]").click();
    assert.equal(await page.locator(sel+'[data-ao-adoration-mode="treasury"]').count(),1,
     id+" failed to return to Eucharistic Treasury");
    report.counts.treasuryHandoffs++;
   }
   report.nonGuidedModes.push({width,ui,mode:"treasury",sevenCanonicalReturnPaths:true});
   await page.locator(sel+" [data-p435930-ador-home]").click();
   assert.equal(await page.locator("#aoPray435930.open .aoAdorationChooser").count(),1);
   assert.deepEqual(errors,[],width+"/"+ui+" browser exception");
  }catch(error){report.errors.push({width,ui,reason:String(error?.stack||error)});throw error;}
  finally{await ctx.close();}
 }
 assert.equal(report.counts.guidedStageObservations,104,"26 source-owned guided stages x four variants");
 assert.equal(report.counts.optionalSourceRoundTrips,12,"Three correct optional Four Ends prayers x four variants");
 assert.equal(report.counts.quietModeRoundTrips,16,"Four guided methods x four variants");
 assert.equal(report.counts.openSilentMode,4);
 assert.equal(report.counts.treasuryHandoffs,28);
 console.log("PASS Adoration 104 guided stage variants, 12 optional source round trips, 16 stage-preserving silent returns, four untimed modes and 28 treasury source handoffs");
}finally{
 await mkdir(output,{recursive:true});
 await writeFile(resolve(output,"complete-adoration-phone-evidence.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
