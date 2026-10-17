import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const screenshotDir=resolve(root,"artifacts/mass-explorer-p1");
await mkdir(screenshotDir,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4211,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430,768,1280]){
  const mobile=width<=430;
  const context=await browser.newContext({viewport:{width,height:mobile?844:950},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("http://127.0.0.1:4211/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.locator('[data-ao-app-surface="learn"]').waitFor({state:"visible",timeout:30000});
  await page.locator('[data-ao-app-surface="learn"]').click();
  await page.locator('[data-ao-learn-family="liturgy-tradition"]').first().click();
  await page.locator('[data-ao-learn-module="learn.mass_explorer"]').click();
  await page.locator("#ao-mass-explorer-root").waitFor({state:"visible",timeout:30000});
  const baseline=await page.evaluate(()=>{
    const root=document.getElementById("ao-mass-explorer-root");
    return {count:root?.querySelectorAll("[data-ao-mx-moment]").length,
      shell:globalThis.AO_LEARN_APP_V1?.status?.()?.child,
      explorer:globalThis.AO_MASS_EXPLORER_V1?.status?.(),
      overflow:root?.scrollWidth-root?.clientWidth,
      ribbonTop:document.querySelector("#ao-global-ribbon")?.getBoundingClientRect()?.top,
      rootBottom:root?.getBoundingClientRect()?.bottom};
  });
  assert.equal(baseline.count,32,width+" cannot navigate all 32 original Guide moments");
  assert.equal(baseline.explorer?.indexView,"map",width+" must open the visual Map by default");
  assert.equal(baseline.explorer?.explanatoryPrayerBlocks,84,width+" missing complete prayer explanations");
  assert.equal(baseline.explorer?.approvedDeepStudyBlocks,0,
    width+" must not expose unapproved Roman Canon studies");
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-phase]").count(),5,
    width+" missing one of five phase navigation controls");
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-study-owner]").count(),0,
    "Unapproved draft commentary must not appear in the public map");
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-map-block]").count(),96,
    width+" lost a canonical text in expanded map ownership");
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-stage]").count(),0,
    width+" thematic study should not be buried after 32 Map moments");
  assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-path]').count(),2,
    width+" missing the two deliberate study paths");
  await page.locator('#ao-mass-explorer-root [data-ao-mx-path="themes"]').click();
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-stage]").count(),8,
    width+" missing eight original thematic lessons in dedicated view");
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-moment]").count(),0,
    width+" thematic view should not duplicate the entire Mass Map");
  await page.screenshot({path:resolve(screenshotDir,"mass-themes-"+width+"-en.png")});
  if(width===390){
    // Formation-only alternate route. The lesson is the canonical owner for
    // Romans 12:1 (MF03), not a new unverified attribution to B031 itself.
    await page.locator('#ao-mass-explorer-root [data-ao-mx-stage="MF03"]').click();
    await page.waitForFunction(()=>globalThis.AO_MASS_FORMATION_V1?.status?.()?.stageId==="MF03",null,{timeout:15000});
    assert.match(await page.locator("#ao-mass-formation-root h1").innerText(),/The Offertory and your offering/);
    const topicScripture=page.locator('#ao-mass-formation-root [data-ao-mass-formation-anchor="MFS05"]');
    await topicScripture.click();
    await page.locator("#ao-scripture-overlay").waitFor({state:"visible",timeout:12000});
    assert.match(await page.locator("#ao-scripture-overlay .aoScriptureReading h3").innerText(),/Romans 12:1/);
    await page.locator('#ao-scripture-overlay [data-scripture-close]').click();
    await page.locator('#ao-mass-formation-root [data-ao-mf-close]').click();
    await page.waitForFunction(()=>globalThis.AO_MASS_EXPLORER_V1?.status?.()?.indexView==="themes"&&
       globalThis.AO_MASS_EXPLORER_V1?.status?.()?.momentKey===null,null,{timeout:12000});
    assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-stage="MF03"]').evaluate(el=>document.activeElement===el),true,
      "Thematic source roundtrip must restore focus to the actual visited lesson");
    assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-path="themes"]').getAttribute("aria-current"),"page",
      "Formation roundtrip must return to thematic study, not the default Map");
  }
  await page.locator('#ao-mass-explorer-root [data-ao-mx-path="order"]').click();
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-map-block]").count(),96,
      "Switching back to chronological learning must restore 96 published source blocks");
  if(width===390){
    await page.locator('#ao-mass-explorer-root [data-ao-mx-phase="2"]').click();
    const phase=page.locator('#ao-mx-phase-canon h2');
    assert.equal(await phase.evaluate(el=>el===document.activeElement),true,
      "Five-phase jump must put keyboard focus in the chosen phase");
    await page.locator('#ao-mass-explorer-root [data-ao-mx-view="list"]').click();
    assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-map]").count(),0);
    assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-moment]").count(),32);
    await page.locator('#ao-mass-explorer-root [data-ao-mx-view="map"]').click();
    assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-map]").count(),1);
    const offertory=page.locator('#ao-mass-explorer-root [data-ao-mx-stop="AO.CARD.010"]');
    await offertory.locator("summary").click();
    await offertory.locator('[data-ao-mx-map-block="AO.SM.B031"]').click();
    const savedMapScroll=await page.evaluate(()=>globalThis.AO_MASS_EXPLORER_V1?.status?.()?.indexScrollTop);
    assert.ok(savedMapScroll>300,"Map should retain the actual deeply scrolled Offertory origin");
    assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-current="AO.CARD.010"]').count(),1);
    assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-block="AO.SM.B031"][aria-current="true"]').count(),1);
    await page.locator('#ao-mass-explorer-root [data-ao-mx-index]').click();
    assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-map="sung"]').count(),1);
    const mapReturn=await page.locator("#ao-mass-explorer-root").evaluate(node=>({
      scrollTop:node.scrollTop,
      selected:document.activeElement?.getAttribute("data-ao-mx-map-block"),
      open:document.activeElement?.closest("details")?.open
    }));
    assert.ok(Math.abs(mapReturn.scrollTop-savedMapScroll)<=3,
      "Map Back lost previous study position: "+JSON.stringify({savedMapScroll,mapReturn}));
    assert.equal(mapReturn.selected,"AO.SM.B031","Map Back lost exact originating prayer link");
    assert.equal(mapReturn.open,true,"Map Back must restore the original expanded source drawer");
    // Switching between the two study approaches should not discard the
    // reader's original chronological place or opened prayer drawer.
    await page.locator('#ao-mass-explorer-root [data-ao-mx-path="themes"]').click();
    assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-stage]').count(),8);
    await page.locator('#ao-mass-explorer-root [data-ao-mx-path="order"]').click();
    const returnedAgain=await page.locator("#ao-mass-explorer-root").evaluate(node=>({
      scrollTop:node.scrollTop,
      open:node.querySelector('[data-ao-mx-map-block="AO.SM.B031"]')?.closest("details")?.open
    }));
    assert.ok(Math.abs(returnedAgain.scrollTop-savedMapScroll)<=4,
      "Switching study paths discarded the Mass Map scroll "+JSON.stringify(returnedAgain));
    assert.equal(returnedAgain.open,true,"Switching study paths must retain originating prayer drawer");
  }
  assert.equal(baseline.shell,"learn.mass_explorer");
  assert.equal(baseline.explorer?.sourceBlocks,96);
  assert.ok(baseline.overflow<=1,width+" px Explorer has unwanted horizontal overflow");
  assert.ok(baseline.rootBottom<=baseline.ribbonTop+2,width+" px Explorer overlays global ribbon");
  await page.screenshot({path:resolve(screenshotDir,"mass-map-"+width+"-en.png")});
  await page.locator('#ao-mass-explorer-root [data-ao-mx-moment="AO.CARD.010"]').click();
  await page.locator('#ao-mass-explorer-root [data-ao-mx-block="AO.SM.B031"]').click();
  const selectedTab=await page.locator('#ao-mass-explorer-root [data-ao-mx-block="AO.SM.B031"]').evaluate(node=>{
    const tab=node.getBoundingClientRect(),rail=node.parentElement.getBoundingClientRect();
    return {left:tab.left,right:tab.right,railLeft:rail.left,railRight:rail.right,
      focused:document.activeElement===node};
  });
  assert.ok(selectedTab.left>=selectedTab.railLeft-2&&selectedTab.right<=selectedTab.railRight+2,
    width+" selected prayer must remain visible in its scrollable index: "+JSON.stringify(selectedTab));
  assert.equal(selectedTab.focused,true,width+" keyboard focus lost when selecting a prayer");
  const prayer=page.locator("#ao-mass-explorer-root .aoMXText");
  assert.match(await prayer.innerText(),/Suscipe, sancte Pater/);
  assert.ok((await prayer.locator(".aoMXLatin").count())>=1,width+" lost original Latin");
  assert.ok((await prayer.locator(".aoMXTranslation").count())>=1,width+" lost published English");
  const action=prayer.locator('[data-ao-mx-cue="AO.SM.C0111"]');
  assert.equal(await action.locator("[lang=la]").count(),0,"Priset action must not falsely claim a Latin original");
  assert.match(await action.innerText(),/Priest.s action|Makes the cross/i);
  const meaning=page.locator('#ao-mass-explorer-root [data-ao-mx-anchor="meaning"]');
  assert.equal(await meaning.count(),1,width+" should display existing published Formation context for Suscipe");
  assert.equal(await meaning.locator('[data-ao-mx-published-claim="MF03-C03"]').count(),1);
  assert.equal(await meaning.locator('[data-ao-mx-text-reading="AO.SM.B031"]').count(),1,
    width+" source-anchored explanatory paragraph missing from in-app panel");
  assert.match(await meaning.innerText(),/faithful to offer their work/);
  await page.locator('#ao-mass-explorer-root [data-ao-mx-jump="meaning"]').click();
  assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-current="AO.CARD.010"]').count(),1,
    "In-place teaching must retain Guide ownership and the original Mass passage");
  await page.screenshot({path:resolve(screenshotDir,"explorer-"+width+"-en.png")});
  // Suscipe's approved biblical comparison is in the existing Formation MF03
  // lesson, NOT an unverified direct prayer-to-verse attribution.
  if(width===390||width===768){
    await page.locator('#ao-mass-explorer-root [data-ao-mx-study="MF03"]').scrollIntoViewIfNeeded();
    const studyScrollBefore=await page.locator("#ao-mass-explorer-root").evaluate(node=>node.scrollTop);
    await page.locator('#ao-mass-explorer-root [data-ao-mx-study="MF03"]').click();
    await page.waitForFunction(()=>globalThis.AO_MASS_FORMATION_V1?.status?.()?.stageId==="MF03",null,{timeout:15000});
    const indirect=page.locator('#ao-mass-formation-root [data-ao-mass-formation-anchor="MFS05"]');
    await indirect.waitFor({state:"visible",timeout:10000});
    await indirect.click();
    const scripture=page.locator("#ao-scripture-overlay");
    await scripture.waitFor({state:"visible",timeout:12000});
    assert.match(await scripture.locator(".aoScriptureContextTitle").innerText(),/Romans 12:1/);
    await scripture.locator('[data-scripture-context-depth="chapter"]').click();
    assert.ok(await scripture.locator(".aoScriptureVerse").count()>10,"MF03 biblical chapter unavailable");
    await scripture.locator("[data-scripture-close]").click();
    assert.equal(await indirect.evaluate(el=>el===document.activeElement),true,"Scripture must restore exact MF03 passage focus");
    // Study the already cited primary source without claiming any passage has
    // been licensed, verified or transcribed as an original document.
    const formation=page.locator("#ao-mass-formation-root");
    const sources=formation.locator(".aoReferencePanel");
    await sources.locator("summary").first().click();
    const contextButton=sources.locator('[data-ao-reference-study-source="SRC-MEDIATOR-DEI"]');
    assert.equal(await contextButton.count(),1,"Original cited Pius XII source missing its contextual reader");
    await contextButton.scrollIntoViewIfNeeded();
    const lessonScroll=await formation.evaluate(node=>node.scrollTop);
    await contextButton.click();
    const context=page.locator('[data-ao-mf-source-reader="SRC-MEDIATOR-DEI"]');
    await context.waitFor({state:"visible",timeout:10000});
    assert.equal(await context.locator('[data-ao-mf-source-claim]').count(),2,
      "The contextual document view must retain both and only the cited MF03 claims");
    assert.equal(await context.locator('[data-ao-mf-source-original="SRC-MEDIATOR-DEI"]').count(),1);
    assert.equal(await formation.evaluate(node=>node.inert),true,
      "Reading documentary context must temporarily exclude the underlying lesson");
    assert.match(await context.innerText(),/not quotations or verified passages/,
      "Lesson text cannot be misrepresented as original historical document excerpts");
    await page.screenshot({path:resolve(screenshotDir,"source-context-"+width+"-en.png")});
    await context.locator(".aoMFSourceReturn").click();
    assert.equal(await page.locator('[data-ao-mf-source-reader]').count(),0,
      "Closing documentary context should dispose of its separate study overlay");
    assert.equal(await formation.evaluate(node=>node.inert),false,
      "Closing source context must restore the original lesson interactivity");
    assert.equal(await contextButton.evaluate(el=>document.activeElement===el),true,
      "Source study must return exact keyboard focus to the original source link");
    assert.ok(Math.abs((await formation.evaluate(node=>node.scrollTop))-lessonScroll)<=3,
      "Source study cannot reset the original lesson reading position");
    await page.locator('#ao-mass-formation-root [data-ao-mf-close]').click();
    await page.waitForFunction(()=>globalThis.AO_MASS_EXPLORER_V1?.status?.()?.blockId==="AO.SM.B031"&&
      globalThis.AO_MASS_EXPLORER_V1?.status?.()?.momentKey==="AO.CARD.010",null,{timeout:12000});
    assert.match(await page.locator("#ao-mass-explorer-root .aoMXText").innerText(),/Suscipe, sancte Pater/);
    const studyReturn=await page.locator("#ao-mass-explorer-root").evaluate(node=>({
      scrollTop:node.scrollTop, focused:document.activeElement?.getAttribute("data-ao-mx-study")
    }));
    assert.ok(Math.abs(studyReturn.scrollTop-studyScrollBefore)<=4,
      "Formation Back lost precise Explorer article reading position: "+JSON.stringify({studyScrollBefore,studyReturn}));
    assert.equal(studyReturn.focused,"MF03","Formation Back lost the originating study link");
  }
  await page.locator('#ao-mass-explorer-root [data-ao-mx-index]').click();
  await page.locator('#ao-mass-explorer-root [data-ao-mx-moment="AO.CARD.013"]').click();
  assert.ok(await page.locator("#ao-mass-explorer-root [data-ao-scripture-context]").count()>0,
    width+" lost approved Scripture context links");
  if(width===390){
    const origin=page.locator('#ao-mass-explorer-root [data-ao-mass-formation-anchor="MFS02"]');
    await origin.click();
    const bible=page.locator("#ao-scripture-overlay");
    await bible.waitFor({state:"visible",timeout:12000});
    assert.match(await bible.locator(".aoScriptureContextTitle").innerText(),/Isaiah 6:3/);
    await bible.locator("[data-scripture-close]").click();
    assert.equal(await origin.evaluate(el=>el===document.activeElement),true,"Scripture source-owner must restore exact Explorer focus");
    assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-current="AO.CARD.013"]').count(),1,
      "Scripture return lost original Mass moment");
  }
  await page.locator('#ao-mass-explorer-root [data-ao-mx-back]').click();
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-moment]").count(),32);
  assert.equal(await page.locator("#ao-mass-explorer-root [data-ao-mx-map]").count(),1,
    "Back must restore the original Map rather than invent a new Mass route");
  // Test the already supported French UI fallback without synthesising any
  // missing French prayer or English-only Guide commentary.
  await page.evaluate(()=>{document.documentElement.lang="fr"});
  await page.locator('#ao-mass-explorer-root [data-ao-mx-moment="AO.CARD.010"]').click();
  await page.locator('#ao-mass-explorer-root [data-ao-mx-block="AO.SM.B031"]').click();
  assert.match(await page.locator("#ao-mass-explorer-root .aoMXText").innerText(),/Suscipe, sancte Pater/);
  assert.ok(await page.locator("#ao-mass-explorer-root .aoMXTextRow [lang=fr]").count()>0,
    width+" missing source-owned French by-cue witness");
  const meaningFr=page.locator('#ao-mass-explorer-root [data-ao-mx-anchor="meaning"]');
  assert.equal(await meaningFr.count(),1);
  assert.equal(await meaningFr.locator('[data-ao-mx-published-claim="MF03-C03"]').count(),1);
  assert.equal(await meaningFr.locator('[data-ao-mx-text-reading="AO.SM.B031"]').count(),1,
    width+" French source-anchored explanatory paragraph missing");
  assert.match(await meaningFr.innerText(),/Offertoire|fidèles/i);
  await page.screenshot({path:resolve(screenshotDir,"explorer-"+width+"-fr.png")});
  await page.locator('#ao-mass-explorer-root [data-ao-mx-index]').click();
  await page.screenshot({path:resolve(screenshotDir,"mass-map-"+width+"-fr.png")});
  await page.locator('#ao-mass-explorer-root [data-ao-mx-path="themes"]').click();
  assert.equal(await page.locator('#ao-mass-explorer-root [data-ao-mx-stage]').count(),8);
  assert.match(await page.locator('#ao-mass-explorer-root [data-ao-mx-stage="MF03"]').innerText(),/Offertoire/);
  await page.screenshot({path:resolve(screenshotDir,"mass-themes-"+width+"-fr.png")});
  await page.locator("#ao-mass-explorer-root [data-ao-mx-close]").click();
  await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.()?.child===null&&
     document.getElementById("ao-learn-modular-root")?.hidden===false,null,{timeout:12000});
  assert.equal(errors.length,0,width+" px JavaScript errors: "+errors.join(" | "));
  await context.close();
 }
 // A separate browser journey confirms Map → real Mass preparation.
 // It must not launch or reposition an active ritual card.
 const handoff=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await handoff.goto("http://127.0.0.1:4211/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await handoff.locator('[data-ao-app-surface="learn"]').click();
 await handoff.locator('[data-ao-learn-family="liturgy-tradition"]').first().click();
 await handoff.locator('[data-ao-learn-module="learn.mass_explorer"]').click();
 await handoff.locator('#ao-mass-explorer-root [data-ao-mx-open-mass]').click();
 await handoff.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="mass",null,{timeout:15000});
 assert.equal(await handoff.locator("#ao-mass-explorer-root").count(),0,
    "Mass shell handoff left an orphan Explorer overlay");
 assert.notEqual(await handoff.evaluate(()=>globalThis.AO_R17_ACTIVE_MASS?.readerPosition?.sectionId||null),
    "AO.CARD.010","Map must never invent an exact reader jump");
 await handoff.close();
 console.log("PASS Mass Map + Explorer: canonical Map/List scroll+focus restoration, Formation→Bible→exact Explorer return, 32 moments, 96 source blocks, 320/390/430/768/1280px, Mass-preparation handoff");
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
