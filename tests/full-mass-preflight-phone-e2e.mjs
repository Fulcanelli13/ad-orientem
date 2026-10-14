import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const base=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const path=resolve(base,"."+name);
  if(path!==base&&!path.startsWith(base+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:"+server.address().port+"/tests/fixtures/rogation-premass.html");
 await page.evaluate(async()=>{
  const {mountFullMassPreflight}=await import("/src/mass/full-mass-preflight.js");
  await import("/src/mass/full-mass-preflight-styles.js");
  await import("/src/mass/mass-entry-harmony-styles.js");
  const historical=document.querySelector("#ao-mass-flow-v1");
  const section=document.createElement("div");
  section.className="aoFlowSection";section.textContent="How to follow";
  const grid=document.createElement("div");grid.className="aoChoiceGrid";
  grid.dataset.testHistoricalFollow="";
  grid.innerHTML='<button type="button" data-ao-follow="vox">VOX</button>'+
    '<button type="button" data-ao-follow="missal">Missal</button>';
  const hero=document.createElement("div");
  hero.className="aoPreflightHero";
  hero.dataset.testHistoricalHero="";
  hero.textContent="Old MASS OF THE DAY hero";
  const readiness=document.createElement("div");
  readiness.className="aoReadiness";readiness.dataset.testHistoricalReadiness="";
  readiness.textContent="Old LA EN FR technical status";
  historical.append(hero,section,grid,readiness);
  globalThis.__formDate="2026-10-04";globalThis.__lang="en";
  globalThis.__kind="CALENDAR";globalThis.__formDefault="sung";globalThis.__ready=true;
  globalThis.__prayerState={prepare:{mode:"standard"},thanksgiving:{mode:"standard"}};
  globalThis.__legacyMass=()=>({canStart:__ready,date:__formDate,
    calendarDay:{id:"TEMP.XIX",title:"Nineteenth Sunday after Pentecost"},
    celebrationId:__kind==="CALENDAR"?"mass_of_day":__kind.toLowerCase(),
    requestedCelebrationId:__kind==="CALENDAR"?"mass_of_day":__kind.toLowerCase(),
    celebrationType:__kind});
  globalThis.__full=mountFullMassPreflight({doc:document,
    getResolvedMass:()=>globalThis.__observed?.effectiveResolvedMass(__legacyMass())??__legacyMass(),
    onOpenSourceProper:()=>globalThis.__observed?.open?.(),
    getSourceGate:()=>globalThis.__observed?.preparationGate?.()??{ready:true,reason:null},
    getDefaultForm:()=>__formDefault,language:()=>__lang,
    getPrayerState:()=>__prayerState,
    onPrayerModeChange:(phase,mode)=>{__prayerState[phase].mode=mode;return true;},
    onOpenPreparation:()=>{__prepOpened=__full.selectionFor(__legacyMass());return true;},
    onOpenAdjacentService:(id,trigger)=>{__serviceTrigger=trigger;__serviceOpened={id,triggered:trigger?.dataset?.massJourneyOpenAdjacent,form:__full.selectionFor(__legacyMass()).form};__full.refresh();return true;}});
 });

 // Independent Mass source date: this must be available on *any* host Mass date
 // without moving the liturgical Calendar, changing the rank, or fabricating text.
 await page.evaluate(async()=>{
  const {mountObservedMassSourceSelector}=await import("/src/mass/observed-mass-selector.js");
  await import("/src/mass/observed-mass-styles.js");
  const p=label=>({lat:label+" Latin",en:label+" English",fr:label+" Français"});
  const source=(day,path,title)=>({status:"ready",date:day,
   day:{main:{title,rank:2}},proper:{status:"ready",sourcePath:path,data:{
    sourcePath:path,introit:p("Introit"),collects:[p("Collect")],epistle:p("Epistle"),
    gradual:p("Gradual"),gospel:p("Gospel"),offertory:p("Offertory"),
    secrets:[p("Secret")],preface:p("Preface"),communion:p("Communion"),
    postcommunions:[p("Postcommunion")],
   }}});
  globalThis.__sources={
   "2026-10-04":source("2026-10-04","Tempora/Pent19-0","19th Sunday"),
   "2026-10-07":source("2026-10-07","Sancti/10-07","Most Holy Rosary")
  };
  __observed=mountObservedMassSourceSelector({
   doc:document,getResolvedMass:__legacyMass,
   mountTarget:()=>document.querySelector("[data-full-mass-source-slot]"),
   resolveDay:async date=>__sources[date]??{status:"unavailable"},
   language:()=>__lang,onSelectionChange:()=>__full.refresh(),
  });
 });
 const picker=page.locator("[data-ao-observed-mass-picker]");
 assert.equal(await page.locator("[data-full-mass-source-slot] [data-ao-observed-mass-picker]").count(),1,
   "Different Proper picker is outside the unified Mass form/celebration module");
 await page.locator("[data-mass-journey-change] > summary").click();
 await page.locator('[data-full-mass-category="SOURCE_DATE"]').click();
 assert.equal(await picker.locator("details").evaluate(el=>el.open),true,
   "Other Proper category failed to open the source-day selector");
 await picker.locator("[data-observed-date]").fill("2026-10-07");
 await page.evaluate(()=>__full.refresh());
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-proper-ready"),"false",
   "Unconfirmed Proper lookup must block entry instead of silently starting Mass of the day");
 assert.equal((await page.evaluate(()=>__observed.preparationGate())).ready,false);

 await picker.locator("[data-observed-lookup]").click();
 await page.waitForSelector("[data-observed-candidate]:not([hidden])");
 assert.match(await picker.locator("[data-observed-candidate]").innerText(),/Most Holy Rosary/);
 assert.equal(await picker.locator("[data-observed-select]").isDisabled(),true,
   "Sunday alternate Proper must not skip commemoration question");
 await picker.locator("[data-observed-sunday-choice]").selectOption("COMMEMORATE_SUNDAY");
 await picker.locator("[data-observed-select]").click();
 await page.waitForFunction(()=>globalThis.__observed?.status?.().selected==="Sancti/10-07");
 assert.equal((await page.evaluate(()=>__observed.preparationGate())).ready,true);

 const actual=await page.evaluate(()=>{
   const s=__observed.effectiveResolvedMass(__legacyMass());
   return {massDate:s.date,source:s.properSource,kind:s.celebrationType,
     calendar:s.calendarDay.title,sourceDate:s.sourceDiagnostics.actualMassSourceDate,
     permission:s.sourceDiagnostics.independentRubricPermission,
     commem:s.commemorations.length};
 });
 assert.deepEqual(actual,{
  massDate:"2026-10-04",source:"Sancti/10-07",kind:"VOTIVE",
  calendar:"Nineteenth Sunday after Pentecost",sourceDate:"2026-10-07",
  permission:"NOT_VERIFIED",commem:1,
 });
 assert.equal(await picker.locator("[data-observed-sunday-choice]").inputValue(),"COMMEMORATE_SUNDAY");
 await page.evaluate(()=>__full.refresh());
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-proper-source"),"Sancti/10-07",
   "Mass preparation review continued to display the old Sunday Proper");
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/Most Holy Rosary/);
 assert.equal(await page.locator("[data-full-mass-review]").evaluate(el=>el.open),true,
  "Alternative Proper review must open immediately on selection");
 assert.match(await page.locator("[data-full-mass-review-body]").innerText(),/Sancti\/10-07/);
 assert.match(await page.locator("[data-full-mass-review-body]").innerText(),/2026-10-04/);
 assert.match(await page.locator("[data-full-mass-review-body]").innerText(),/2 \/ 2 \/ 2/);
 assert.equal(await page.locator('[data-full-mass-category="SOURCE_DATE"]').getAttribute("aria-current"),"true");
 await page.evaluate(()=>{__formDate="2026-10-11";__observed.update()});
 assert.equal((await page.evaluate(()=>__observed.status())).selected,null,
   "Observed source leaked into another actual Mass date");
 await page.evaluate(()=>{__formDate="2026-10-04";__observed.update();});
 await page.evaluate(()=>__observed.dispose());
 await page.waitForSelector("[data-ao-full-mass-preflight]");

 const editorial=await page.locator("[data-ao-full-mass-preflight]").evaluate(root=>{
   const style=getComputedStyle(root),identity=root.querySelector("[data-mass-journey-identity]"),
    before=root.querySelector("[data-mass-journey-before]"),
    kicker=root.querySelector("[data-mass-journey-kind]");
   const stage=getComputedStyle(before);
   return {border:style.borderTopWidth,kicker:!!kicker&&!!kicker.textContent.trim(),
    background:style.backgroundColor,accent:root.style.getPropertyValue("--ao-entry-accent"),
    stageBorderLeft:stage.borderLeftWidth,stageBorderBottom:stage.borderBottomWidth,
    identityTextAlign:getComputedStyle(root.querySelector("[data-full-mass-celebration]")).textAlign};
 });
 assert.equal(editorial.border,"0px","Mass entry uses AO editorial sections, not an outer legacy card");
 assert.equal(editorial.kicker,true,"Mass kind sits in separate AO typography");
 assert.equal(editorial.identityTextAlign,"center");
 assert.equal(editorial.stageBorderLeft,"0px","No foreign dotted timeline rail");
 assert.notEqual(editorial.stageBorderBottom,"0px","AO editorial section dividers must remain");
 assert.ok(editorial.accent.trim(),"Actual selected Proper must drive Mass entry accent");
 assert.equal(await page.locator("[data-mass-journey-identity]").count(),1,
  "Mass must have one primary identity surface");
 assert.equal(await page.locator("[data-mass-journey-order]").count(),1,
  "Ceremonial details remain inspectable without crowding the entry");
 assert.equal(await page.locator("[data-mass-journey-order]").evaluate(el=>el.open),false,
  "Ordinary Mass must not open a five-stage checklist by default");
 assert.equal(await page.locator("[data-mass-journey-essential]").isVisible(),false,
  "Ordinary Sunday must not invent special ceremonies");
 assert.equal(await page.locator("[data-mass-journey-before]").isVisible(),true,
  "Personal preparation must remain optional and accessible");
 assert.equal(await page.locator("[data-mass-journey-after]").isVisible(),false,
  "A user beginning Mass must not first configure thanksgiving");
 assert.equal(await page.locator("[data-mass-journey-before]").count(),1);
 assert.equal(await page.locator("[data-mass-journey-mass]").count(),1);
 assert.equal(await page.locator("[data-mass-journey-after]").count(),1);
 await page.locator("[data-mass-journey-change] > summary").click();
 assert.equal(await page.locator("[data-mass-journey-change]").evaluate(el=>el.open),false,
  "Rare celebration changes should not crowd the initial view");
 assert.equal(await page.locator("[data-mass-journey-sources]").evaluate(el=>el.open),false,
  "Detailed provenance must not precede the celebration order");
 assert.equal(await page.locator("[data-full-mass-rites]").evaluate(el=>el.open),true,
  "The Mass and any actual preceding/following ceremonies must never be hidden");
 assert.deepEqual(await page.locator("[data-full-mass-rite-list]").locator(
  "[data-mass-journey-mass],[data-mass-journey-after]").evaluateAll(nodes=>nodes.map(x=>
   x.hasAttribute("data-mass-journey-mass")?"MASS":"THANKSGIVING")),
  ["MASS","THANKSGIVING"]);
 assert.equal(await page.locator("[data-test-historical-hero]").isVisible(),false,
  "Duplicated legacy Mass hero must disappear when native journey is mounted");
 assert.equal(await page.locator("[data-test-historical-readiness]").isVisible(),false,
  "Source readiness belongs in the native context, not the legacy technical chips");
 assert.equal(await page.locator("[data-mass-journey-commemoration-details]").count(),1);
 assert.equal(await page.locator("[data-mass-journey-commemoration-details]").evaluate(el=>el.open),false);
 assert.equal(await page.locator("[data-test-historical-follow]").isVisible(),false,
  "Old VOX/Missal controls must not compete with the native reader modes");
 assert.equal(await page.locator("[data-test-historical-follow]").getAttribute("data-ao-legacy-choice-retired"),"true");
 assert.equal(await page.locator('[data-mass-journey-prayer-open="prepare"]').evaluate(el=>el.open),false,
  "Depth controls must not dominate the first view");
 await page.locator('[data-mass-journey-prayer-open="prepare"] summary').click();
 await page.locator('[data-mass-journey-prayer-modes="prepare"] input[value="full"]').check();
 await page.locator("[data-mass-journey-order] > summary").click();
 assert.equal(await page.locator("[data-mass-journey-order]").evaluate(el=>el.open),true,
  "Expanded details must still contain the complete ceremonial sources and choices");
 assert.equal(await page.locator('[data-mass-journey-prayer-open="thanksgiving"]').evaluate(el=>el.open),false,
  "Thanksgiving settings are planned but not forced before Mass");
 await page.locator('[data-mass-journey-prayer-open="thanksgiving"] summary').click();
 await page.locator('[data-mass-journey-prayer-modes="thanksgiving"] input[value="quick"]').check();
 assert.deepEqual(await page.evaluate(()=>__prayerState),{
  prepare:{mode:"full"},thanksgiving:{mode:"quick"}
 });
 await page.locator("[data-mass-journey-open-preparation]").click();
 const preparedChoice=await page.evaluate(()=>({
  kind:__prepOpened?.kind,reader:__prepOpened?.readerMode,form:__prepOpened?.form
 }));
 assert.equal(preparedChoice.kind,"CALENDAR");
 assert.equal(preparedChoice.reader,"LIVE");
 assert.equal(preparedChoice.form,"MISSA_CANTATA_INCENSE");
 assert.equal(await page.locator("[data-mass-journey-form-detail]").evaluate(el=>el.open),false,
  "Mass forms should be compact until explicitly changed");
 assert.match(await page.locator("[data-mass-journey-form-summary]").innerText(),/Missa Cantata/);
 assert.equal(await page.locator("[data-mass-journey-start]").isEnabled(),true,
  "Start must be available when the canonical Proper and host action are ready");
 const beginRect=await page.locator("[data-mass-journey-start]").evaluate(el=>{
   const r=el.getBoundingClientRect();
   return {top:r.top,bottom:r.bottom,viewport:innerHeight};
 });
 assert.equal(beginRect.top>=0&&beginRect.bottom<=beginRect.viewport,true,
  "The single Begin button must be visible on the first phone screen, not buried below the long timeline");
 const modeAndBegin=await page.locator("[data-mass-journey-begin]").evaluate(el=>{
   const selector=el.querySelector("[data-mass-journey-reader-choice]");
   const summary=el.querySelector("[data-mass-journey-reader-summary]");
   const start=el.querySelector("[data-mass-journey-start]");
   if(!selector||!summary||!start||selector.open)return false;
   const r=summary.getBoundingClientRect(),b=start.getBoundingClientRect();
   return r.top>=0&&r.bottom<b.top&&b.bottom<=innerHeight&&
     summary.textContent.includes("LIVE")&&
     selector.querySelectorAll("[data-full-mass-reader-mode]").length===3;
 });
 assert.equal(modeAndBegin,true,
  "Show the selected reader before Begin without imposing three permanent mode buttons");
 assert.equal(await page.locator("[data-ao-start-live]").isVisible(),false,
  "Old host Start action must not compete with native Begin");
 await page.evaluate(()=>{
  globalThis.__hostStartCount=0;
  document.querySelector("[data-ao-start-live]").addEventListener("click",
    ()=>{globalThis.__hostStartCount++});
 });
 await page.locator("[data-mass-journey-start]").click();
 assert.equal(await page.evaluate(()=>__hostStartCount),1,
  "Native Begin must delegate to exactly one canonical host Start click");
 await page.evaluate(()=>document.querySelector("[data-ao-start-live]").disabled=true);
 await page.waitForFunction(()=>document.querySelector("[data-mass-journey-start]").disabled);
 assert.equal(await page.locator("[data-mass-journey-start]").isEnabled(),false,
  "Disabling the real host Start must also disable native Begin");
 await page.evaluate(()=>document.querySelector("[data-ao-start-live]").disabled=false);
 await page.waitForFunction(()=>!document.querySelector("[data-mass-journey-start]").disabled);
 await page.locator("[data-mass-journey-form-detail] summary").click();
 await page.locator("[data-mass-journey-reader-choice] summary").click();
 assert.equal(await page.locator("[data-full-mass-form]").count(),4);
 assert.equal(await page.locator("[data-full-mass-reader-mode]").count(),3);
 assert.equal(await page.locator('[data-full-mass-reader-mode][value="LIVE"]').isChecked(),true);
 for(const mode of ["MISSAL","SIMPLE","LIVE"]){
  await page.locator('[data-full-mass-reader-mode][value="'+mode+'"]').check();
  assert.equal((await page.evaluate(()=>__full.selectionFor(__legacyMass()))).readerMode,mode);
  assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-chosen-reader-mode"),mode);
 }

 assert.equal(await page.locator('[data-full-mass-form][value="MISSA_CANTATA_INCENSE"]').isChecked(),true);
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-celebration-kind"),"CALENDAR");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","SOLEMN","MISSA_CANTATA_INCENSE"]){
  await page.locator('[data-full-mass-form][value="'+form+'"]').check();
  const selected=await page.evaluate(()=>__full.selectionFor(__legacyMass()));
  assert.equal(selected.form,form);
  assert.equal(selected.explicitlyChosenForm,true);
  assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-chosen-mass-form"),form);
 }

 await page.locator("[data-mass-journey-adjacent-choices] summary").click();
 await page.locator('[data-mass-journey-adjacent-choice="ADORATION_BEFORE"]').check();
 await page.locator('[data-mass-journey-adjacent-choice="BENEDICTION_AFTER"]').check();
 assert.equal(await page.locator('[data-mass-journey-adjacent-before] [data-mass-journey-adjacent-active="ADORATION_BEFORE"]').count(),1);
 assert.equal(await page.locator('[data-mass-journey-adjacent-after] [data-mass-journey-adjacent-active="BENEDICTION_AFTER"]').count(),1);
 const serviceOrder=await page.locator("[data-mass-journey-order]").evaluate(order=>{
  const before=order.querySelector('[data-mass-journey-adjacent-active="ADORATION_BEFORE"]'),
   mass=order.querySelector("[data-mass-journey-mass]"),
   after=order.querySelector('[data-mass-journey-adjacent-active="BENEDICTION_AFTER"]');
  return Boolean(before&&mass&&after&&(before.compareDocumentPosition(mass)&Node.DOCUMENT_POSITION_FOLLOWING)
   &&(mass.compareDocumentPosition(after)&Node.DOCUMENT_POSITION_FOLLOWING));
 });
 assert.equal(serviceOrder,true,"Separate Adoration/Benediction must surround Mass, not enter its Ordinary");
 const withoutServices=await page.evaluate(()=>__full.composeRitesFor(__legacyMass(),{
  precedingRites:[],followingActions:[],
 }));
 assert.equal(withoutServices.precedingRites.includes("ADORATION"),false);
 assert.equal(withoutServices.followingActions.includes("BENEDICTION"),false);
 await page.locator('[data-mass-journey-open-adjacent="ADORATION_BEFORE"]').click();
 await page.waitForFunction(()=>Boolean(globalThis.__serviceOpened));
 assert.deepEqual(await page.evaluate(()=>__serviceOpened),{
  id:"ADORATION_BEFORE",triggered:"ADORATION_BEFORE",form:"MISSA_CANTATA_INCENSE"
 });
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").isVisible(),true,
  "Service launch must leave Mass preparation mounted");
 assert.equal(await page.evaluate(()=>__serviceTrigger===document.querySelector(
   '[data-mass-journey-open-adjacent="ADORATION_BEFORE"]')&&__serviceTrigger.isConnected),true,
  "Return focus needs a still-connected, original service launch button");

 assert.equal((await page.evaluate(()=>__full.selectionFor(__legacyMass()))).readerMode,"LIVE");

 assert.equal(await page.locator("[data-full-mass-rites] > summary").isVisible(),false,
  "The duplicate technical sequence heading must not appear");

 assert.equal(await page.locator("[data-full-mass-rites]").evaluate(el=>el.open),true,
  "The Mass timeline cannot be hidden by toggling the legacy details summary");
 assert.equal(await page.locator('[data-full-mass-rite="ASPERGES"]').count(),1,
  "Sunday sung Mass must offer actual aspersion without imposing it");
 assert.equal(await page.locator('[data-full-mass-rite="ASPERGES"]').isChecked(),false);
 await page.locator('[data-full-mass-rite="ASPERGES"]').check();
 assert.equal(await page.locator("[data-full-mass-rite-list]").evaluate(list=>{
  const input=list.querySelector('[data-full-mass-rite="ASPERGES"]');
  const form=list.querySelector("[data-mass-journey-mass]");
  return Boolean(input&&form&&(input.compareDocumentPosition(form)&Node.DOCUMENT_POSITION_FOLLOWING));
 }),true,"Preceding rites must appear before the Mass");

 const observed=await page.evaluate(()=>__full.composeRitesFor(__legacyMass(),{
  precedingRites:[],followingActions:[],
 }));
 assert.deepEqual(observed.precedingRites,["ASPERGES"]);
 await page.evaluate(()=>{__kind="REQUIEM";__full.refresh()});
 assert.equal(await page.locator('[data-ao-special-phase="req"]').count(),1);
 assert.equal(await page.locator('[data-ao-special-phase="absolution"]').count(),0,
  "Requiem UI must not invent an Absolution before it is selected");
 assert.equal(await page.locator('[data-full-mass-rite="REQUIEM_ABSOLUTION"]').count(),1);
 assert.equal(await page.locator('[data-full-mass-rite="REQUIEM_ABSOLUTION"]').isChecked(),false);
 await page.locator('[data-full-mass-rite="REQUIEM_ABSOLUTION"]').check();
 const funeral=await page.evaluate(()=>__full.composeRitesFor(__legacyMass(),{
  precedingRites:[],followingActions:[],
 }));
 assert.ok(funeral.followingActions.includes("REQUIEM_ABSOLUTION"));
 assert.equal(await page.locator('[data-ao-special-phase="absolution"]').count(),1,
  "Requiem UI must reflect the explicitly selected Absolution");
 await page.evaluate(()=>{__kind="CALENDAR";__full.refresh()});
 assert.equal(await page.locator('[data-full-mass-rite="REQUIEM_ABSOLUTION"]').count(),0,
  "Requiem branch must not survive a new actual celebration");
 assert.equal(await page.locator('[data-full-mass-rite="ASPERGES"]').isChecked(),false,
  "An old actual-ceremony choice must not leak to a new celebration");
 assert.equal(await page.locator("[data-full-mass-category]").count(),6);
 await page.evaluate(()=>{
  globalThis.__categoryClicks=[];
  globalThis.AO_CELEBRATION_API={
   openChangeMass(){
    const flow=document.querySelector("#ao-mass-flow-v1");
    const panel=document.createElement("section");panel.dataset.testOldMassChooser="";
    panel.innerHTML='<button data-ao-select-day>Day</button>'+
      '<button data-ao-open="votive">Votive</button>'+
      '<button data-ao-open="nuptial">Nuptial</button>'+
      '<button data-ao-open="requiem">Requiem</button>'+
      '<button data-ao-open="other">Other</button>';
    panel.addEventListener("click",e=>{
     const v=e.target.dataset.aoOpen??(e.target.hasAttribute("data-ao-select-day")?"day":null);
     if(v)globalThis.__categoryClicks.push(v);
    });
    flow.querySelector("[data-test-old-mass-chooser]")?.remove();
    flow.append(panel);
   }
  };
 });
 for(const [kind,expected] of [["VOTIVE","votive"],["NUPTIAL","nuptial"],["REQUIEM","requiem"],["OTHER","other"],["CALENDAR","day"]]){
  if(!(await page.locator("[data-mass-journey-change]").evaluate(el=>el.open)))
   await page.locator("[data-mass-journey-change] > summary").click();
  await page.locator('[data-full-mass-category="'+kind+'"]').click();
  const clicked=await page.evaluate(()=>__categoryClicks.at(-1));
  assert.equal(clicked,expected,"Existing Mass selector not reached: "+kind);
  assert.equal((await page.evaluate(()=>__full.selectionFor(__legacyMass()))).kind,"CALENDAR",
    "Category click must not silently invent or substitute a Proper");
 }
 await page.evaluate(()=>{__kind="REQUIEM";__lang="fr";__full.refresh()});
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/Requiem/);
 assert.match(await page.locator("[data-full-mass-form-title]").innerText(),/Comment/);
 await page.evaluate(()=>{__kind="VOTIVE";__full.refresh()});
 assert.equal(await page.locator('[data-ao-special-phase="votive-proper"]').count(),1);
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/votive/i);
 await page.evaluate(()=>{__kind="NUPTIAL";__full.refresh()});
 assert.deepEqual(await page.locator("[data-full-mass-special] [data-ao-special-phase]").evaluateAll(
   nodes=>nodes.map(node=>node.dataset.aoSpecialPhase)),
   ["nuptial-mass","nuptial-pater","nuptial-final"]);
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/nuptiale/i);
 await page.evaluate(()=>{__kind="CALENDAR";__formDate="2026-10-11";__full.refresh()});
 assert.equal(await page.locator('[data-full-mass-form][value="MISSA_CANTATA_INCENSE"]').isChecked(),true,
  "Selection leaked across a different Mass date");
 assert.equal((await page.evaluate(()=>__full.status())).explicitlyChosenForm,false);
 assert.equal((await page.evaluate(()=>__full.status())).explicitlyChosenReaderMode,false,
  "Reader mode leaked across a new actual Mass date");
 await page.evaluate(()=>{__kind="CALENDAR";__formDate="2026-10-12";__ready=false;__full.refresh()});
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-proper-ready"),"false");
 await page.evaluate(()=>{
  __ready=true;__kind="CALENDAR";__formDate="2026-10-13";
  __legacyMass=()=>({canStart:true,date:__formDate,
    calendarDay:{id:"Quad6-5"},exceptionalProfile:"good-friday-1962"});
  __full.dispose();
});
 // A new mount can be reinitialized for distinct non-Mass rites.
 await page.evaluate(async()=>{
  const {mountFullMassPreflight}=await import("/src/mass/full-mass-preflight.js");
  __full=mountFullMassPreflight({doc:document,getResolvedMass:__legacyMass,
    getDefaultForm:()=>__formDefault,language:()=>__lang});
 });
 const gf=await page.evaluate(()=>({
   kind:document.querySelector("[data-ao-full-mass-preflight]")?.dataset.aoCelebrationKind,
   fieldsetDisabled:document.querySelector("[data-full-mass-form-fieldset]")?.disabled,
   inputsDisabled:[...document.querySelectorAll("[data-full-mass-form]")].every(x=>x.disabled),
 }));
 assert.equal(gf.kind,"GOOD_FRIDAY","Non-Mass rite not classified: "+JSON.stringify(gf));
 assert.equal(await page.locator("[data-full-mass-special] [data-ao-special-phase=mass]").count(),0);
 assert.equal(await page.locator("[data-full-mass-special] [data-ao-special-phase=gf-cross]").count(),1);
 assert.equal(await page.locator("[data-mass-journey-mass]").isVisible(),false,
  "Good Friday is not a Mass: a generic Mass step must never appear");
 assert.equal(await page.locator("[data-mass-journey-adjacent-choices]").isVisible(),false,
  "Independent before/after Mass choices should not appear on Good Friday");

 assert.equal(await page.locator("[data-mass-journey-essential]").isVisible(),true,
  "Good Friday must show its actual solemn liturgy before the details are opened");
 assert.match(await page.locator("[data-mass-journey-essential]").innerText(),/Cross|Croix/i);
 assert.equal(await page.locator('[data-mass-journey-special-before] [data-mass-journey-phase="gf-cross"]').count(),1,
  "Good Friday Cross veneration belongs to its own solemn liturgy");
 assert.equal(await page.locator("[data-mass-journey-after] [data-rc2-flow-prefs]").isVisible(),false,
  "Good Friday must not offer Mass-thanksgiving preferences");
 assert.equal(await page.locator('[data-mass-journey-prayer-open="thanksgiving"]').isVisible(),false,
  "Good Friday must not offer a post-Mass thanksgiving depth chooser");
 assert.equal(gf.fieldsetDisabled,true,"Non-Mass form selector still active: "+JSON.stringify(gf));
 assert.equal(gf.inputsDisabled,true,"Non-Mass radios still active: "+JSON.stringify(gf));
 assert.match(await page.locator("[data-full-mass-note]").innerText(),/ce n’est pas une messe/i);
 // Easter Vigil is a composite ceremony: Lauds follows the Vigil Mass.
 await page.evaluate(()=>{
   __legacyMass=()=>({canStart:true,date:"2027-03-27",
     calendarDay:{id:"TEMP.EASTER.VIGIL",title:"Easter Vigil"},
     exceptionalProfile:"easter-vigil-1962"});
   __full.refresh();
 });
 assert.equal(await page.locator('[data-mass-journey-special-before] [data-mass-journey-phase="ev-light"]').count(),1);
 assert.equal(await page.locator('[data-mass-journey-special-after] [data-mass-journey-phase="ev-lauds"]').count(),1);
 assert.equal(await page.locator("[data-mass-journey-mass]").isVisible(),true);
 const ordered=await page.locator("[data-full-mass-rite-list]").evaluate(list=>{
  const mass=list.querySelector("[data-mass-journey-mass]"),
   lauds=list.querySelector("[data-mass-journey-special-after]");
  return Boolean(mass&&lauds&&(mass.compareDocumentPosition(lauds)&Node.DOCUMENT_POSITION_FOLLOWING));
 });
 assert.equal(ordered,true,"Easter Vigil Lauds must appear after the Vigil Mass");
 // Source resolution must precede selection on days with distinct Mass
 // formularies; never render a dead card as though it changes the Proper.
 await page.evaluate(()=>{
  __legacyMass=()=>({canStart:true,date:"2026-12-25",
   calendarDay:{id:"TEMP.CHRISTMAS",title:"Nativity of the Lord"},
   celebrationId:"mass_of_day",celebrationType:"CALENDAR"});
  __full.refresh();
 });
 assert.equal(await page.locator("[data-mass-journey-formulary-detail]").evaluate(el=>el.open),false,
  "A rare three-Mass comparison must not fill the initial mobile viewport");
 await page.locator("[data-mass-journey-formulary-detail] summary").click();
 assert.deepEqual(await page.locator("[data-mass-journey-formulary]").evaluateAll(
  nodes=>nodes.map(node=>node.dataset.massJourneyFormulary)),["NIGHT","DAWN","DAY"]);
 assert.equal(await page.locator("[data-mass-journey-choose-variant]").count(),0,
  "No same-day source variant owner exists: do not promise a fake selector");
 assert.match(await page.locator("[data-mass-journey-variant-limit]").innerText(),/do not select/);
 await page.evaluate(()=>{
  __legacyMass=()=>({canStart:true,date:"2026-11-02",
   calendarDay:{id:"TEMP.ALL_SOULS",title:"All Souls"},
   celebrationId:"requiem_day",celebrationType:"REQUIEM"});
  __full.refresh();
 });
 assert.deepEqual(await page.locator("[data-mass-journey-formulary]").evaluateAll(
  nodes=>nodes.map(node=>node.dataset.massJourneyFormulary)),["FIRST","SECOND","THIRD"]);
 assert.match(await page.locator("[data-mass-journey-formulary-caveat]").innerText(),/first formulary is prescribed/);
 // Source-owned catalogue: mobile projection uses the actual historical
 // source buttons and delegates selection without manufacturing a Proper.
 await page.evaluate(async()=>{
  __full.dispose();
  const {mountSourceOwnedMassCatalogue}=await import("/src/mass/full-mass-catalogue.js");
  __catStage="votive";__catLanguage="en";__selectedSource=null;
  const flow=document.getElementById("ao-mass-flow-v1");
  flow.innerHTML='<section class="aoMassFlowBody"><p>Choose the source Proper</p>'+
   '<button data-ao-celebration="sacred_heart"><b>Sacred Heart</b><span>Votive/Pent02-5</span></button>'+
   '<button data-ao-celebration="holy_cross"><b>Holy Cross</b><span>Votive/Cross</span></button></section>';
  flow.addEventListener("click",e=>{
   const b=e.target.closest?.("[data-ao-celebration],[data-ao-requiem]");
   if(b){__selectedSource=b.dataset.aoCelebration??b.dataset.aoRequiem;__catStage="preflight";}
  });
  __catalogue=mountSourceOwnedMassCatalogue({doc:document,stage:()=>__catStage,
    language:()=>__catLanguage});
 });
 await page.waitForSelector('[data-ao-mass-catalogue-choice="sacred_heart"]');
 assert.equal(await page.locator('[data-ao-mass-catalogue-choice]').count(),2);
 assert.equal(await page.locator("[data-ao-mass-catalogue-search]").count(),0);
 // The native search exists only for larger source-owned lists.
 assert.equal((await page.locator("[data-ao-mass-catalogue]").innerText()).includes("Votive/Pent02-5"),true);
 await page.locator('[data-ao-mass-catalogue-choice="sacred_heart"]').click();
 assert.equal(await page.evaluate(()=>__selectedSource),"sacred_heart");
 await page.evaluate(()=>{
   __catStage="requiem";
   document.querySelector("#ao-mass-flow-v1").innerHTML='<section class="aoMassFlowBody"><p>Occasion</p>'+
    '<button data-ao-requiem="funeral"><b>Funeral Mass</b><span>I class</span></button>'+
    '<button data-ao-requiem="anniversary"><b>Anniversary</b><span>II class</span></button></section>';
   __catalogue.refresh();
 });
 await page.waitForSelector('[data-ao-mass-catalogue-choice="anniversary"]');
 assert.equal(await page.locator('[data-ao-mass-catalogue-choice]').count(),2);
 await page.locator('[data-ao-mass-catalogue-choice="anniversary"]').click();
 assert.equal(await page.evaluate(()=>__selectedSource),"anniversary");
 await page.evaluate(()=>__catalogue.dispose());
 // Source-owned in-reader ritual stage at 390px: overlay is not a second
 // prayer card, action cue, posture instruction or blocked tap target.
 await page.evaluate(async()=>{
  const {mountSpecialMassStage}=await import("/src/mass/reader-special-stage.js");
  await import("/src/mass/reader-special-stage-styles.js");
  const root=document.createElement("section");
  root.id="special-stage-phone-fixture";
  root.style.cssText="position:relative;width:390px;max-width:100%;height:180px";
  root.innerHTML='<div class="ao-reader-stage" style="height:180px;width:100%"></div>'+
    '<span data-role="section-title">Introit</span>';
  document.body.append(root);
  __stageCard={sectionId:"AO.CARD.001",title:"Prayers at the Foot"};
  __stageRoot=root;
  __stage=mountSpecialMassStage({
   preview:{root,getCurrentCard:()=>__stageCard},
   prepared:{session:{resolvedMass:{overlays:["REQUIEM"]},plan:{kind:"MASS"}},
     readerPreferences:{language:"fr"}},doc:document
  });
 });
 assert.equal(await page.locator("[data-ao-special-reader-stage]").isVisible(),true);
 assert.equal(await page.locator(".ao-reader-ceremony-name").textContent(),"Requiem");
 await page.evaluate(()=>{
   __stageCard={id:"ABS-R03",title:"Libera me"};
   __stageRoot.dataset.r17StateOwner="R26_REQUIEM_ABSOLUTION_NATIVE";
   __stageRoot.dataset.r17NativeRiteRecord="ABS:ABS-R03";
   globalThis.AO_R17_NATIVE_READER_STATE={specialRite:"REQUIEM_ABSOLUTION"};
 });
 await page.waitForFunction(()=>document.querySelector(".ao-reader-ceremony-name")?.textContent==="Absoute");
 assert.equal(await page.locator(".ao-reader-ceremony-detail").innerText(),"Libera me");
 const blockedTap=await page.locator("[data-ao-special-reader-stage]").evaluate(node=>
   getComputedStyle(node).pointerEvents);
 assert.equal(blockedTap,"none");
 const stageOverflow=await page.evaluate(()=>{
   const r=__stageRoot.getBoundingClientRect();
   const stage=__stageRoot.querySelector("[data-ao-special-reader-stage]").getBoundingClientRect();
   return stage.left>=r.left-1 && stage.right<=r.right+1;
 });
 assert.equal(stageOverflow,true,"The ceremony stage overflows 390px phone");
 await page.evaluate(()=>{__stage.dispose();__stageRoot.remove()});
 const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(horizontal<=1,"390px phone overflow: "+horizontal);
 assert.deepEqual(errors,[]);
 console.log("Full Mass 390px phone: PASS — low/MC/Solemn choices, source-owned Mass classes, date reset and Good Friday firewall.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
