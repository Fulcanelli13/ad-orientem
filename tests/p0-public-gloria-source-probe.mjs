// Read-only public GitHub Pages P0 diagnosis, not a release acceptance substitute.
// Preserve real Home -> Mass choices, original service worker and 20s assertions.
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";

const url="https://fulcanelli13.github.io/ad-orientem/";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,
 isMobile:true,hasTouch:true,locale:"en-GB",serviceWorkers:"allow"});
const page=await context.newPage();
const selector="#ao-r17-native-reader-preview";
const errors=[];
page.on("pageerror",e=>errors.push(String(e?.message??e)));
const capture=label=>page.evaluate(label=>{
 const a=globalThis.AO_R17_ACTIVE_MASS??{},p=globalThis.AO_R17_NATIVE_READER_PREVIEW??{};
 const resolved=a?.session?.resolvedMass??{},prepared=a?.session??{};
 const preflight=globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight??null;
 const arch=globalThis.AO_CELEBRATION_ARCH_V1??{};
 const calendar=globalThis.AO_RUNTIME_V8?.store?.getState?.()??{};
 const nodes=[...document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-section-all] [data-reader-section]")];
 const relevant=p?.model?.cards?.filter(c=>String(c.sourceSectionId??c.sectionId)==="AO.CARD.003")??[];
 const menu=document.querySelector("#ao-r17-native-reader-preview [data-role='section-menu']");
 const jump=document.querySelector("#ao-r17-native-reader-preview [data-role='section-jump']");
 return {label,clock:new Date().toISOString(),selectedDate:calendar.selectedDate??null,
  calendarMain:calendar.resolution?.day?.main??null,
  archCelebration:arch.actualCelebration?.id??null,
  archRubric:arch.rubric??null,
  preflight:{kind:preflight?.chosenKind??preflight?.kind,form:preflight?.chosenForm??preflight?.form,
   source:preflight?.source??null},
  mass:{date:resolved.date,celebrationId:resolved.celebrationId,
   form:resolved.form,properSource:resolved.properSource,
   actualCelebration:resolved.actualCelebration??null,
   isRequiem:resolved.isRequiem,overlays:resolved.overlays??null,
   provenance:resolved.provenance??null,
   proper:{sourcePath:resolved.proper?.data?.sourcePath??resolved.proper?.sourcePath??null,
    hasGloria:resolved.proper?.data?.hasGloria??resolved.proper?.hasGloria??null}},
  model:{total:p?.model?.totalCards??null,gloriaCards:relevant.map(c=>({id:c.sectionId,
    name:c.title,sourceSectionId:c.sourceSectionId}))},
  ui:{menuHidden:menu?.hidden??null,menuSize:nodes.length,
   menuGloria:nodes.filter(n=>/Gloria/i.test(n.textContent??"")).map(n=>({label:n.textContent,hidden:n.hidden})),
   menuItems:nodes.map(n=>n.textContent).filter(Boolean).slice(0,75),
   jumpExpanded:jump?.getAttribute("aria-expanded")??null},
  pageErrors:[]};
},label);

try{
 const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:90000});
 assert.equal(response?.status(),200);
 await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner&&
  globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.installed),null,{timeout:65000});
 await page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]").waitFor({state:"visible",timeout:45000});
 await page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]").click();
 await page.locator(".aoH7DoorView").waitFor({state:"visible",timeout:20000});
 await page.waitForFunction(()=>Boolean(document.querySelector(
  ".homeScreen [data-home-h4-begin]:not([disabled])")),null,{timeout:40000});
 const choices=await page.evaluate(()=>{
  const entry=globalThis.AO_R17_BROWSER_ENTRY;
  return {language:entry.selectTodayOption("readerLanguage","en"),
   mode:entry.selectTodayOption("readerMode","LIVE"),
   form:entry.selectTodayOption("form","MISSA_CANTATA_INCENSE"),
   preflight:entry.status()?.fullMassPreflight??null};
 });
 assert.ok(choices.language&&choices.mode&&choices.form,"Real preflight selection failed");
 if(choices.preflight?.aspersionDecisionRequired===true)
  assert.equal(await page.evaluate(()=>
   globalThis.AO_R17_BROWSER_ENTRY.selectTodayOption("aspersion","no")),true);
 await page.locator(".homeScreen [data-home-h4-begin]").click();
 await page.locator(selector).waitFor({state:"visible",timeout:90000});
 await page.waitForFunction(()=>Boolean(
  globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected&&
  globalThis.AO_R17_ACTIVE_MASS?.readerPreferences),null,{timeout:45000});
 const jump=page.locator(selector+' [data-role="section-jump"]');
 await jump.click();
 console.log("P0_GLORIA_PUBLIC_BEFORE "+JSON.stringify(await capture("before-kyrie")));
 const kyrie=page.locator(selector+' [data-reader-section-all] [data-reader-section]')
  .filter({hasText:/Kyrie/i}).first();
 await kyrie.waitFor({state:"visible",timeout:20000});
 await kyrie.click();
 const chooser=page.locator(selector+' [data-ordinary-reference-chooser="KYRIE"] select');
 await chooser.waitFor({state:"visible",timeout:20000});
 await chooser.selectOption("MASS_08");
 const suite=page.locator(selector+' [data-ordinary-mass-suite="MASS_08"]');
 await suite.waitFor({state:"visible",timeout:20000});
 await suite.click();
 await jump.click();
 const after=await capture("after-mass-viii");
 console.log("P0_GLORIA_PUBLIC_AFTER "+JSON.stringify(after));
 assert.equal(errors.length,0,"Browser runtime exceptions: "+errors.join("|"));
 assert.ok(after.model.gloriaCards.length>0,"The canonical source model lost Gloria");
 console.log("P0_GLORIA_PROBE_COMPLETE: diagnosis captured; this probe is NOT Pages phone acceptance");
}finally{
 await context.close();
 await browser.close();
}
