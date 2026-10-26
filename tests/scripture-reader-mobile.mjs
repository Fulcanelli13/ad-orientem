import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const filename=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+filename);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4199,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-US"});
 const page=await context.newPage(),pageErrors=[];
 page.on("pageerror",e=>pageErrors.push(String(e?.message??e)));
 await page.goto("http://127.0.0.1:4199/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true &&
   globalThis.AO_SCRIPTURE_APP_V1?.status?.()?.installed===true,null,{timeout:30000});
 const entry=page.locator("[data-home-scripture]");
 await entry.waitFor({state:"visible",timeout:20000});
 await entry.click();
 const dialog=page.locator("#ao-scripture-overlay");
 const openTools=async()=>{
   const shelf=dialog.locator(".aoScriptureTools");
   if(!(await shelf.evaluate(el=>el.open)))await shelf.locator("summary").first().click();
 };
 await dialog.waitFor({state:"visible",timeout:15000});
 assert.equal(await dialog.getAttribute("role"),"dialog");
 assert.equal(await dialog.locator(".aoScriptureBrowse").count(),1);
 assert.equal(await dialog.locator(".aoScriptureBrowse").evaluate(el=>el.open),false,
   "Standalone Bible must open with Scripture visible, not a large navigation form");
 assert.equal(await dialog.getAttribute("aria-modal"),"true");
 assert.equal(await page.evaluate(()=>document.activeElement?.hasAttribute("data-scripture-close")),true);
 assert.equal(await dialog.locator(".aoScriptureNav select").nth(1).locator("option").count(),2);
 assert.equal(await dialog.locator(".aoScriptureNav select").nth(2).locator("option").count(),73);
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:28");
 await dialog.locator(".aoScriptureVerse").first().waitFor({state:"visible",timeout:12000});
 assert.match(await dialog.locator(".aoScriptureVerse").first().innerText(),/Forasmuch as many have taken in hand/i,
   "Fresh reading preserves Douay–Rheims, with an immediate CPDV option");
 // Existing source-owner objects referencing Luke 1:28 must be discoverable
 // without changing the current verse, Mass state or Rosary session.
 await openTools();
 await dialog.locator(".aoScriptureRelated summary").click();
 await dialog.locator('[data-scripture-linked-object="rosary:joy1"]').waitFor({state:"visible",timeout:15000});
 assert.equal(await dialog.locator('[data-scripture-linked-object="novena:annunciation"]').count(),1);
 assert.equal(await dialog.locator('[data-scripture-linked-object="novena:immaculate_conception"]').count(),1);
 assert.equal(await dialog.locator('[data-scripture-linked-object="prayer:foundations_hail_mary"]').count(),1);
 assert.equal(await dialog.locator('[data-scripture-linked-object="rosary:joy2"]').count(),0);
 // Jump into the source passage cited by one Novena object, and back to the
 // precise original verse without losing the originating app route.
 await dialog.locator('[data-scripture-read-linked-object="novena:annunciation"]').click();
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:26–38");
 await dialog.locator("[data-scripture-context-depth='chapter']").click();
 assert.equal(await dialog.locator("[data-scripture-related-back]").count(),1);
 await dialog.locator("[data-scripture-related-back]").click();
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:28");
 assert.equal(await dialog.locator(".aoScriptureRelated").evaluate(el=>el.open),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.status().open),true);
 // Object-level visit: exact Annunciation Novena detail, followed by its Back.
 // The existing Scripture DOM, focused object, verse and Home surface survive.
 await dialog.locator('[data-scripture-open-related-object="novena:annunciation"]').tap();
 await page.waitForFunction(()=>globalThis.AO_NOVENAS_V3?.state?.()?.id==="annunciation" &&
   globalThis.AO_NOVENAS_V3?.state?.()?.screen==="detail",null,{timeout:25000});
 assert.equal(await dialog.isHidden(),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.status().suspended),true);
 await page.locator('#aoPray435930.open [data-n1-back]').tap();
 await dialog.waitFor({state:"visible",timeout:25000});
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:28");
 assert.equal(await dialog.locator(".aoScriptureRelated").evaluate(el=>el.open),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.getActive()),"home");
 try{
   await page.waitForFunction(()=>document.activeElement?.dataset?.scriptureOpenRelatedObject==="novena:annunciation",
     null,{timeout:7000});
 }catch(error){
   console.error("Scripture return-focus diagnostics",await page.evaluate(()=>({
     focused:document.activeElement?.outerHTML?.slice(0,300),
     buttons:[...document.querySelectorAll("#ao-scripture-overlay [data-scripture-open-related-object]")].map(x=>x.dataset.scriptureOpenRelatedObject),
     relatedOpen:document.querySelector("#ao-scripture-overlay .aoScriptureRelated")?.open,
     surface:globalThis.AO_APP_SHELL_V1?.getActive?.(),
     pray:globalThis.AO_PRAY_APP_V1?.status?.()?.open,
     reader:globalThis.AO_SCRIPTURE_APP_V1?.status?.()
   })));
   throw error;
 }
 // Bead-specific Scripture → actual canonical Rosary step → exact original
 // Bible reading. The original donor, not an invented bead player, owns state.
 const beadLink=dialog.locator('[data-scripture-open-related-object="rosaryBead:joy1:2"]');
 await beadLink.waitFor({state:"visible",timeout:9000});
 await beadLink.tap();
 const rosary=page.locator("#aoPrayerBookRoot.open");
 await rosary.waitFor({state:"visible",timeout:25000});
 await page.waitForFunction(()=>{
   const donor=window.AO_ROSARY_V381,st=donor?.state?.(),step=donor?.steps?.()?.[st?.step];
   return st?.set==="joyful"&&step?.mi===0&&Number(step?.bead)===2&&
     Boolean(step?.cue)&&document.querySelectorAll("#aoPrayerBookRoot.open").length===1;
 },null,{timeout:15000});
 assert.equal(await dialog.isHidden(),true);
 assert.equal(await page.evaluate(()=>window.AO_SCRIPTURE_APP_V1.status().suspended),true);
 await rosary.locator(".lab-back[data-pb-back],.lab-back").first().tap();
 await dialog.waitFor({state:"visible",timeout:25000});
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:28");
 assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.getActive()),"home");
 await page.waitForFunction(()=>document.activeElement?.dataset?.scriptureOpenRelatedObject==="rosaryBead:joy1:2",
   null,{timeout:9000});
 // A mystery jump is distinct from a bead jump; it must open the existing
 // contemplation step before its first Hail Mary.
 const mysteryLink=dialog.locator('[data-scripture-open-related-object="rosary:joy1"]');
 await mysteryLink.tap();
 await rosary.waitFor({state:"visible",timeout:25000});
 await page.waitForFunction(()=>{
   const d=window.AO_ROSARY_V381,st=d?.state?.(),step=d?.steps?.()?.[st?.step];
   return st?.set==="joyful"&&step?.mi===0&&step?.kind==="mystery";
 },null,{timeout:15000});
 await rosary.locator(".lab-back[data-pb-back],.lab-back").first().tap();
 await dialog.waitFor({state:"visible",timeout:25000});
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:28");
 // The exact Biblical Atlas scene opens through the original Explore owner.
 // Its stable source key, rather than its 151-item screen index, is authoritative.
 const atlasLink=dialog.locator('[data-scripture-open-related-object^="atlas:biblical:"]').first();
 await atlasLink.waitFor({state:"visible",timeout:20000});
 const atlasId=await atlasLink.getAttribute("data-scripture-open-related-object");
 const expectedAtlasEvent=atlasId.slice("atlas:".length);
 await atlasLink.tap();
 await page.waitForFunction(eventKey=>{
   const selected=document.querySelector("#ao-find-root [data-bible-event-key][aria-pressed='true']")||
     document.querySelector("[data-bible-event-key][aria-pressed='true']");
   return globalThis.AO_FIND_APP_V1?.status?.()?.bibleAtlas===true&&
     selected?.dataset?.bibleEventKey===eventKey;
 },expectedAtlasEvent,{timeout:30000});
 assert.equal(await dialog.isHidden(),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.status().suspended),true);
 await page.locator("[data-bible-atlas-close]").tap();
 await dialog.waitFor({state:"visible",timeout:25000});
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:28");
 assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.getActive()),"home");
 await page.waitForFunction(id=>document.activeElement?.dataset?.scriptureOpenRelatedObject===id,
   atlasId,{timeout:9000});
 // A second reciprocal journey opens precisely the source-owned Mass lesson,
 // not the Mass reader or a generic Learn landing.
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_CONTEXT_V1.open("Luke 2:14")),true);
 await openTools();
 await dialog.locator(".aoScriptureRelated summary").tap();
 const massLink=dialog.locator('[data-scripture-open-related-object="massFormation:MFS01"]');
 await massLink.waitFor({state:"visible",timeout:9000});
 await massLink.tap();
 const study=page.locator("#ao-mass-formation-root");
 await study.waitFor({state:"visible",timeout:20000});
 assert.equal(await page.evaluate(()=>globalThis.AO_MASS_FORMATION_V1?.status?.()?.stageId),"MF01");
 assert.equal(await dialog.isHidden(),true);
 await study.locator("[data-ao-mf-back]").tap();
 await dialog.waitFor({state:"visible",timeout:18000});
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 2:14");
 assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.getActive()),"home");
 await page.waitForFunction(()=>document.activeElement?.dataset?.scriptureOpenRelatedObject==="massFormation:MFS01",
   null,{timeout:9000});
 // Restore standalone reading before testing the existing edition/book UI.
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.open()),true);
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:28");
 assert.equal(await dialog.locator(".aoScriptureBrowse").evaluate(el=>el.open),false);
 await openTools();
 await dialog.locator(".aoScriptureBrowse summary").click();
 assert.equal(await dialog.locator("[data-scripture-witness-unreviewed='dr-challoner']").count(),1,
   "Fresh reader should retain Douay–Rheims");
 assert.equal(await dialog.locator("[data-scripture-english-edition]").count(),1,
   "The visible edition switch should be one unobtrusive touch target");
 assert.equal(await dialog.locator(".aoScriptureNav select").nth(1).locator("option[value='ncb-2019']").count(),0);
 await page.evaluate(()=>{window.__scriptureOpened=null;window.open=(url)=>{window.__scriptureOpened=String(url);return null;};});
 await dialog.getByRole("button",{name:"Read at source"}).click();
 assert.match(await page.evaluate(()=>window.__scriptureOpened),/biblegateway\.com.*version=DRA/);
 await dialog.locator('[data-scripture-english-edition="cpdv-2009"]').click();
 await dialog.locator("[data-scripture-witness-unreviewed='cpdv-2009']").waitFor({state:"visible",timeout:12000});
 assert.equal(await dialog.locator('[data-scripture-active-edition="cpdv-2009"]').count(),1);
 await dialog.getByRole("button",{name:"Read at source"}).click();
 assert.match(await page.evaluate(()=>window.__scriptureOpened),/sacredbible\.org\/catholic\/NT-03_Luke\.htm/);
 await dialog.locator('[data-scripture-english-edition="dr-challoner"]').click();
 await dialog.locator("[data-scripture-witness-unreviewed='dr-challoner']").waitFor({state:"visible",timeout:12000});
 assert.equal(await dialog.locator('[data-scripture-active-edition="dr-challoner"]').count(),1);
 await dialog.locator('[data-scripture-english-edition="cpdv-2009"]').click();
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Luke 1:28");
 await dialog.locator("[data-scripture-witness-unreviewed='cpdv-2009']").waitFor({state:"visible",timeout:12000});
 assert.ok(await dialog.locator(".aoScriptureVerse").count()>0,"CPDV source witness should display locally");
 await dialog.getByRole("button",{name:"Read at source"}).click();
 assert.match(await page.evaluate(()=>window.__scriptureOpened),/sacredbible\.org\/catholic\/NT-03_Luke\.htm/);
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.()?.reader?.editionId),"cpdv-2009");
  await dialog.locator(".aoScriptureNav input").nth(1).fill("43");
  await dialog.locator(".aoScriptureNav input").nth(1).dispatchEvent("change");
  assert.equal(await dialog.locator("[data-scripture-source-note='Luke 1:43']").count(),1);
  await dialog.locator(".aoScriptureSourceNote summary").click();
  assert.match(await dialog.locator(".aoScriptureSourceNote").innerText(),/Mother of her Lord/);
  assert.equal(await dialog.locator(".aoScriptureSourceNote a").count(),2);
  assert.equal(await dialog.locator("[data-scripture-witness-unreviewed='cpdv-2009']").count(),1,"The critical note must retain source witness status");
  await dialog.locator(".aoScriptureNav input").nth(1).fill("28");
  await dialog.locator(".aoScriptureNav input").nth(1).dispatchEvent("change");
  assert.equal(await dialog.locator(".aoScriptureSourceNote").count(),0);
 await dialog.locator(".aoScriptureNav select").nth(1).selectOption("dr-challoner");
 const mark=dialog.getByRole("button",{name:"Bookmark",exact:true});
 await mark.click();
 assert.equal(await dialog.getByRole("button",{name:"Bookmarked"}).getAttribute("aria-pressed"),"true");
 await dialog.locator(".aoScriptureBookmarks summary").click();
 assert.equal(await dialog.locator(".aoScriptureBookmarks button").count(),1);
 await dialog.locator(".aoScriptureSearch summary").click();
 await dialog.locator(".aoScriptureSearch input").fill("Tob");
 await dialog.locator(".aoScriptureResults button").first().click();
 assert.match(await dialog.locator(".aoScriptureReading h3").innerText(),/Tobit 1:1/);
 // Test terminal chapter, numeric input clamping and live chapter count on phone.
 await dialog.locator(".aoScriptureNav select").nth(2).selectOption("Tobit");
 assert.equal(await dialog.locator(".aoScriptureNav input").first().getAttribute("max"),"14");
 await dialog.locator(".aoScriptureNav input").first().fill("14");
 await dialog.locator(".aoScriptureNav input").first().dispatchEvent("change");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Tobit 14:1");
 assert.equal(await dialog.getByRole("button",{name:"Next chapter"}).isDisabled(),true);
 await dialog.locator(".aoScriptureNav input").first().fill("15");
 await dialog.locator(".aoScriptureNav input").first().dispatchEvent("change");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Tobit 14:1");
 await dialog.locator(".aoScriptureNav select").nth(2).selectOption("Luke");
 assert.equal(await dialog.locator(".aoScriptureNav input").first().getAttribute("max"),"24");
 await dialog.locator(".aoScriptureNav input").first().fill("24");
 await dialog.locator(".aoScriptureNav input").first().dispatchEvent("change");
 assert.equal(await dialog.getByRole("button",{name:"Next chapter"}).isDisabled(),true);
 await dialog.locator(".aoScriptureNav select").nth(2).selectOption("Esther");
 assert.equal(await dialog.locator("[data-crosswalk-unverified=Esther]").count(),1);
 assert.match(await dialog.locator("[data-crosswalk-unverified=Esther]").innerText(),/Verse numbering varies/i);
 await dialog.locator(".aoScriptureReferenceWarning summary").click();
 assert.match(await dialog.locator(".aoScriptureReferenceWarning").innerText(),/different chapter order/i);
 // Same Catholic Esther event lives at Douay 11:2 but CPDV 1:1.
 await dialog.locator(".aoScriptureNav input").nth(0).fill("11");
 await dialog.locator(".aoScriptureNav input").nth(0).dispatchEvent("change");
 await dialog.locator(".aoScriptureNav input").nth(1).fill("2");
 await dialog.locator(".aoScriptureNav input").nth(1).dispatchEvent("change");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Esther 11:2");
 await dialog.locator(".aoScriptureNav select").nth(1).selectOption("cpdv-2009");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Esther 1:1");
 await dialog.locator(".aoScriptureNav select").nth(1).selectOption("dr-challoner");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Esther 11:2");
 await dialog.locator(".aoScriptureNav select").nth(2).selectOption("SongOfSongs");
 await dialog.locator(".aoScriptureNav select").nth(1).selectOption("cpdv-2009");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"SongOfSongs 1:1–2");
 await dialog.locator(".aoScriptureNav select").nth(1).selectOption("dr-challoner");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"SongOfSongs 1:1");
 await dialog.locator(".aoScriptureNav select").nth(2).selectOption("Psalms");
 assert.equal(await dialog.locator("[data-crosswalk-unverified=Psalms]").count(),1);
 await dialog.locator(".aoScriptureNav input").nth(0).fill("22");
 await dialog.locator(".aoScriptureNav input").nth(0).dispatchEvent("change");
 await dialog.locator(".aoScriptureNav input").nth(1).fill("1");
 await dialog.locator(".aoScriptureNav input").nth(1).dispatchEvent("change");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Psalms 22:1",
   "Manual chapter navigation must survive asynchronous source witness loading");
 await dialog.locator(".aoScriptureNav select").nth(1).selectOption("cpdv-2009");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Psalms 22:1");
 await dialog.locator(".aoScriptureNav select").nth(1).selectOption("dr-challoner");
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Psalms 22:1");
 await dialog.locator(".aoScriptureNav select").nth(2).selectOption("John");
 assert.equal(await dialog.locator("[data-crosswalk-unverified]").count(),0);
 await dialog.locator(".aoScriptureNav select").first().selectOption("fr");
 assert.match(await dialog.locator(".aoScriptureHeader h2").innerText(),/Sainte Écriture/i);
 assert.equal(await dialog.locator(".aoScriptureNav select").nth(1).locator("option").count(),1);
 assert.equal(await dialog.locator(".aoScriptureNav select").nth(1).locator("option").first().evaluate(el=>el.disabled),false);
 await dialog.getByRole("button",{name:"Consulter la source"}).click();
 assert.match(await page.evaluate(()=>window.__scriptureOpened),/fr\.wikisource\.org\/wiki\/Bible_Crampon_1923/);
 // Recovery must allow opening previously absent full traditional books on mobile.
 await dialog.locator(".aoScriptureNav select").nth(2).selectOption("Genesis");
 await dialog.locator("[data-scripture-witness-unreviewed='crampon-1923']").waitFor({state:"visible",timeout:15000});
 assert.match(await dialog.locator(".aoScriptureVerse").first().innerText(),/Au commencement Dieu créa/);
 assert.ok(await dialog.locator(".aoScriptureVerse").count()>=30);
 await dialog.locator(".aoScriptureNav select").nth(2).selectOption("Matthew");
 await dialog.locator(".aoScriptureNav input").first().fill("17");
 await dialog.locator(".aoScriptureNav input").first().dispatchEvent("change");
 await dialog.locator("[data-scripture-source-gaps='27']").waitFor({state:"visible",timeout:12000});
 assert.equal(await dialog.locator(".aoScriptureVerse[data-verse='27']").count(),0,
   "Blank printed-witness slot cannot be filled with invented verse text");
 await dialog.locator(".aoScriptureRosary summary").click();
 assert.equal(await dialog.locator(".aoScriptureMystery").count(),20);
 assert.match(await dialog.locator(".aoScriptureMystery").first().innerText(),/Luc|Gabriel|Marie|Annonciation/i);
 const dimensions=await dialog.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
 assert.ok(dimensions.scroll<=dimensions.client+2,"Mobile Scripture dialog overflows: "+JSON.stringify(dimensions));
 assert.equal(await page.evaluate(()=>document.body.style.overflow),"hidden");
 await page.keyboard.press("Escape");
 assert.equal(await dialog.isHidden(),true);
 assert.equal(await page.evaluate(()=>document.body.style.overflow),"");
 assert.equal(await page.evaluate(()=>document.activeElement?.hasAttribute("data-home-scripture")),true,"Focus was not restored to Home Scripture entry");
 await entry.click();
 assert.match(await dialog.locator(".aoScriptureHeader h2").innerText(),/Sainte Écriture/i,"French preference did not persist");
 await dialog.locator("[data-scripture-close]").click();
 assert.equal(await dialog.isHidden(),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()),"home","Scripture overlay changed app route");
 // Historic commentary must be clearly attributed and use the documented
 // complete-work locator, not pretend to be verse-specific patristic exegesis.
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_CONTEXT_V1.open("Psalms 129:1")),true);
 await dialog.waitFor({state:"visible",timeout:12000});
 assert.equal(await dialog.locator(".aoScriptureBrowse").evaluate(el=>el.open),false,
   "Contextual Scripture reading must put the passage first");
 await dialog.locator("[data-scripture-context-depth='commentary']").click();
 assert.match(await dialog.locator(".aoScriptureContextCommentary").innerText(),/texte n’est pas encore intégré|not yet transcribed/i,
   "Untranscribed Psalm commentary must not masquerade as verbatim source content");
 const bellarmine=dialog.locator("[data-scripture-commentary-source='verified']");
 await bellarmine.waitFor({state:"visible",timeout:12000});
 assert.match(await bellarmine.getAttribute("href"),/ecatholic2000\.com\/bellarmine\/commentary-on-psalms/);
 assert.match(await dialog.locator(".aoScriptureContextCommentary").innerText(),/Psalm 129/);
 await dialog.locator("[data-scripture-close]").click();
 // The shared reader must render the original Catena text, not just a link.
 await page.route("https://raw.githubusercontent.com/**",route=>route.abort());
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_CONTEXT_V1.open("Luke 1:28",{language:"en"})),true);
 await dialog.locator(".aoScriptureVerse").first().waitFor({state:"visible",timeout:12000});
 assert.equal(await dialog.locator(".aoScriptureVerse").count(),1,"Reopened contextual reader restores the selected verse from memory");
 assert.equal(await dialog.locator("[data-scripture-witness-unreviewed='dr-challoner']").count(),1);
 await dialog.locator("[data-scripture-context-depth='commentary']").click();
 await dialog.locator(".aoScriptureFatherText").first().waitFor({state:"visible",timeout:15000});
 assert.ok((await dialog.locator(".aoScriptureFatherText").first().innerText()).length>80,
   "Original full-length Father-attributed text should load from the bundled Gospel");
 assert.ok(await dialog.locator(".aoScriptureFather").count()>=2,
   "Source-matched Catena pericope includes separately attributed Fathers");
 assert.match(await dialog.locator(".aoScriptureCatenaHeading").first().innerText(),/Catena Aurea, Luke 1:/);
 await dialog.locator("[data-scripture-close]").click();
 // Source-witnessed divided reading opens in the same overlay. The two
 // chapters are separate; omitted verses are never silently restored.
 const segments=[
  {book:"Matthew",chapter:26,verseStart:36,verseEnd:75},
  {book:"Matthew",chapter:27,verseStart:1,verseEnd:60}
 ];
 assert.equal(await page.evaluate(segments=>
   globalThis.AO_SCRIPTURE_CONTEXT_V1.openSegments(segments,{
    reference:"Matthew 26:36–75; 27:1–60",language:"en"
   }),segments),true);
 await dialog.waitFor({state:"visible"});
 assert.equal(await dialog.locator(".aoScriptureSegments button").count(),2);
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Matthew 26:36–75");
 assert.equal(await dialog.locator("[data-scripture-segment-index='0']").getAttribute("aria-pressed"),"true");
 await dialog.locator("[data-scripture-segment-index='1']").click();
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Matthew 27:1–60");
 assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader.activeSegmentIndex),1);
 await openTools();
 await dialog.locator(".aoScriptureBrowse summary").click();
 await dialog.locator(".aoScriptureNav select").first().selectOption("en");
 assert.equal(await dialog.locator(".aoScriptureBrowse").evaluate(el=>el.open),true,
   "Expanded navigation must survive a language change");
 await dialog.locator(".aoScriptureNav select").nth(1).selectOption("dr-challoner");
 await dialog.getByRole("button",{name:"Read at source"}).click();
 assert.match(await page.evaluate(()=>window.__scriptureOpened),/Matthew%2027%3A1-60/i);
 await dialog.locator("[data-scripture-witness-unreviewed='dr-challoner']").waitFor({state:"visible",timeout:12000});
 await dialog.locator("[data-scripture-context-depth='chapter']").click();
 assert.ok(await dialog.locator(".aoScriptureVerse").count()>=50,"The entire source-witnessed Matthew chapter should render inside the app");
 assert.equal(await dialog.locator(".aoScriptureSegments button").count(),2,"Context depth must preserve source segments");
 await dialog.locator("[data-scripture-segment-index='0']").click();
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Matthew 26:36–75");
 await dialog.locator(".aoScriptureNav input").nth(0).fill("28");
 await dialog.locator(".aoScriptureNav input").nth(0).dispatchEvent("change");
 assert.equal(await dialog.locator(".aoScriptureSegments button").count(),0,"Manual Bible navigation must leave citation-specific segment mode");
 await dialog.locator("[data-scripture-close]").click();
 // The 1962 Ember-Saturday Daniel reading begins at Vulgate 3:49,
 // returns to 3:47–48 and resumes 3:50–51. Scripture is still read in
 // canonical Bible order, with a non-dismissable bilingual clarification.
 const daniel=[{book:"Daniel",chapter:3,verseStart:47,verseEnd:51}];
 const arrangement={
  schema:"ao-liturgical-bible-verse-order-v1",
  canonicalReference:"Daniel 3:47–51",
  liturgicalVerseOrder:["Daniel 3:49","Daniel 3:47–48","Daniel 3:50–51"],
  noteEn:"The Missal presents these verses in liturgical order: Daniel 3:49, then 3:47–48, then 3:50–51. The Bible below presents the canonical order 3:47–51. The following hymn is a separate liturgical text.",
  noteFr:"Le missel présente ces versets dans l’ordre liturgique : Daniel 3,49, puis 3,47–48, puis 3,50–51. La Bible ci-dessous suit l’ordre canonique 3,47–51. Le cantique qui suit est un texte liturgique distinct.",
  separateHymn:"Daniel 3:52–59"
 };
 // Read the same canonical verses without a liturgical order note first.
 // Source-witness availability must be identical with and without the note.
 assert.equal(await page.evaluate(daniel=>
  globalThis.AO_SCRIPTURE_CONTEXT_V1.openSegments(daniel,{
   reference:"Daniel 3:47–51",language:"en"
  }),daniel),true);
 await dialog.locator("[data-scripture-witness-unreviewed='dr-challoner']").waitFor({state:"visible",timeout:12000});
 const baselineDanielVerses=await dialog.locator(".aoScriptureVerse").count();
 assert.equal(baselineDanielVerses,5,"The uncollated Daniel witness must expose all five source verses");
 await dialog.locator("[data-scripture-close]").click();
 assert.equal(await page.evaluate(({daniel,arrangement})=>
  globalThis.AO_SCRIPTURE_CONTEXT_V1.openSegments(daniel,{
   reference:"Daniel 3:47–51",language:"en",liturgicalArrangement:arrangement
  }),{daniel,arrangement}),true);
 await dialog.waitFor({state:"visible"});
 assert.equal(await dialog.locator(".aoScriptureReading h3").innerText(),"Daniel 3:47–51");
 const notice=dialog.locator("[data-scripture-liturgical-order='Daniel 3:47–51']");
 await notice.waitFor({state:"visible",timeout:8000});
 assert.match(await notice.innerText(),/Missal presents these verses in liturgical order/);
 assert.match(await notice.innerText(),/then 3:47–48, then 3:50–51/);
 assert.equal(await dialog.locator(".aoScriptureVerse").count(),baselineDanielVerses,
   "A liturgical arrangement may explain source order but never unlock additional Bible text");
 assert.equal(await dialog.locator("[data-scripture-witness-unreviewed='dr-challoner']").count(),1,
   "The five uncollated source verses must remain explicitly unreviewed");
 await openTools();
 await dialog.locator(".aoScriptureBrowse summary").click();
 await dialog.locator(".aoScriptureNav select").first().selectOption("fr");
 assert.match(await notice.innerText(),/ordre liturgique/);
 assert.match(await notice.innerText(),/Bible ci-dessous suit l’ordre canonique/);
 await dialog.locator("[data-scripture-close]").click();
 assert.equal(await page.evaluate(({daniel,arrangement})=>
  globalThis.AO_SCRIPTURE_CONTEXT_V1.openSegments(daniel,{
   reference:"Daniel 3:47–51",liturgicalArrangement:{...arrangement,noteFr:""}
  }),{daniel,arrangement}),false,
  "Missing bilingual transposition explanation must fail closed");
 assert.equal(await page.evaluate(({daniel,arrangement})=>
  globalThis.AO_SCRIPTURE_CONTEXT_V1.openSegments(daniel,{
   reference:"Daniel 3:47–51",liturgicalArrangement:{...arrangement,liturgicalVerseOrder:["Daniel 3:47–51"]}
  }),{daniel,arrangement}),false,
  "Unproven liturgical verse order must never open a misleading Context");
  // Explicit module return callbacks must not be shadowed by the reader's
  // option parameter. Closing restores the invoking control exactly once.
  assert.equal(await page.evaluate(()=>{
    const origin=document.createElement("button");
    origin.type="button";origin.id="ao-scripture-return-fixture";
    origin.textContent="Return fixture";document.body.append(origin);origin.focus();
    window.__scriptureReturnCount=0;
    return globalThis.AO_SCRIPTURE_CONTEXT_V1.open("Luke 1:28",{
      onCloseReturn:()=>{window.__scriptureReturnCount++;}
    });
  }),true);
  await dialog.waitFor({state:"visible"});
  await dialog.locator("[data-scripture-close]").click();
  assert.deepEqual(await page.evaluate(()=>({
    count:window.__scriptureReturnCount,
    focus:document.activeElement?.id,
    stillOpen:globalThis.AO_SCRIPTURE_APP_V1.status().open
  })),{count:1,focus:"ao-scripture-return-fixture",stillOpen:false},
  "A context return must invoke its callback once and restore the original control");
  assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.close()),false,
    "Closing twice must not replay the return callback");
  await page.evaluate(()=>document.getElementById("ao-scripture-return-fixture")?.remove());
  assert.deepEqual(pageErrors,[],"Unexpected browser runtime errors");
  // Editorial mining uses the very same Scripture and Catena source packs.
  await page.goto("http://127.0.0.1:4199/previews/scripture-mining-workbench-20261017.html",{
    waitUntil:"domcontentloaded",timeout:25000});
  await page.locator("#results .reading").first().waitFor({state:"visible",timeout:20000});
  assert.match(await page.locator("#resultHeading").innerText(),/Luke 1:26-27/);
  assert.match(await page.locator("#results .reading").first().innerText(),
    /Catholic Public Domain Version/);
  await page.locator("#bead").selectOption("2");
  await page.waitForFunction(()=>document.querySelector("#resultHeading")?.textContent==="Luke 1:28",
    null,{timeout:20000});
  await page.locator("#results details").first().locator("summary").click();
  assert.match(await page.locator("#results details").first().innerText(),/Douay/);
  await page.locator("#rating").selectOption("5");
  await page.locator("#disposition").selectOption("SUITABLE_ELSEWHERE");
  await page.locator("#destination").selectOption("joy2");
  await page.locator("#destinationBead").selectOption("7");
  await page.locator("#duplicate").check();
  await page.locator("#saveReview").click();
  assert.equal(await page.locator("#reviewCount").innerText(),"1");
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-scripture-mining-review-v1")));
  assert.equal(saved[0].reference,"Luke 1:28");
  assert.equal(saved[0].destinationId,"joy2");
  assert.equal(saved[0].destinationBead,7);
  assert.equal(saved[0].duplicate,true);
  assert.equal(saved[0].rating,5);
  assert.equal("text" in saved[0],false);
  for(const [module,id,reference] of [
    ["novena","annunciation","Luke 1:26–38"],
    ["mass","MFS01","Luke 2:14"],
    ["stations","5","Luke 23:26"],
    ["prayer","foundations_our_father","Matthew 6:9–13"]]){
    await page.locator("#module").selectOption(module);
    await page.locator('#linkedObject option[value="'+id+'"]').waitFor({state:"attached",timeout:16000});
    await page.locator("#linkedObject").selectOption(id);
    await page.waitForFunction(value=>document.querySelector("#resultHeading")?.textContent===value,
      reference,{timeout:15000});
  }
  await page.locator("#module").selectOption("historia");
  await page.waitForFunction(()=>document.querySelector("#linkedObject")?.options?.length===151,null,{timeout:18000});
  assert.equal(await page.locator("#linkedObject option").count(),151,"Reuse all 151 Atlas event IDs");
  await page.locator("#historiaAuditUnit option[value='H42-02']").waitFor({state:"attached",timeout:12000});
  await page.locator("#historiaAuditUnit").selectOption("H42-02");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent?.includes("8 source fragments loaded"),
    null,{timeout:20000});
  assert.equal(await page.locator("#historiaSequence .auditSegment").count(),8);
  assert.ok(await page.locator("#historiaSequence .gapNote").count()>=2,
    "Shortened Daniel must label omitted Scripture");
  assert.match(await page.locator("#historiaSequence").innerText(),/3:92/);
  await page.locator("#historiaAuditUnit").selectOption("H42-07");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent?.includes("13 source fragments loaded"),
    null,{timeout:24000});
  assert.equal(await page.locator("#historiaSequence .auditSegment").count(),13);
  await page.locator("#historiaReadingDepth").selectOption("expanded");
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent?.includes("19 source fragments loaded"),
    null,{timeout:24000});
  assert.equal(await page.locator("#historiaSequence .auditSegment").count(),19,
    "Earlier expanded research selection is preserved independently");
  await page.locator("#historiaReadingDepth").selectOption("principal");
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent?.includes("13 source fragments loaded"),
    null,{timeout:24000});

  assert.match(await page.locator("#historiaSequence").innerText(),/Esther 11:2–10/);
  const estherAudit=page.locator("#historiaSequence .auditSegment").first();
  assert.match(await estherAudit.innerText(),/CPDV|Mordecai|Esther/i);
  await estherAudit.getByRole("button",{name:"Rate / inspect this extract"}).click();
  await page.waitForFunction(()=>document.querySelector("#resultHeading")?.textContent==="Esther 4:5–7",
    null,{timeout:12000});
  await page.locator("#rating").selectOption("4");
  await page.locator("#saveReview").click();
  const auditSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-scripture-mining-review-v1")));
  assert.ok(auditSaved.some(r=>r.originModule==="historia"&&r.originId==="H42-07"&&
    r.reference==="Esther 4:5–7"&&r.referenceEdition==="cpdv-2009"));
  assert.deepEqual(pageErrors,[],"Historia corrected verse-reading audit must not produce browser errors");

  // H76 uses the same source-owned editor, not a competing apocalypse reader.
  await page.locator("#historiaAuditUnit").selectOption("H76-04");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("4 source fragments loaded (principal abridgment)"),
    null,{timeout:24000});
  assert.equal(await page.locator("#historiaSequence .auditSegment").count(),4);
  assert.match(await page.locator("#historiaSequence").innerText(),/Revelation 13:10–12/);
  assert.match(await page.locator("#historiaSequence").innerText(),/Revelation 13:15–18/);
  assert.ok(await page.locator("#historiaSequence .gapNote").count()>=2);
  await page.locator("#historiaReadingDepth").selectOption("expanded");
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("1 source fragments loaded (expanded selection)"),
    null,{timeout:24000});
  assert.equal(await page.locator("#historiaSequence .auditSegment").count(),1);
  await page.locator("#historiaReadingDepth").selectOption("principal");
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("4 source fragments loaded (principal abridgment)"),
    null,{timeout:24000});
  await page.locator("#historiaAuditUnit").selectOption("H76-05");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("5 source fragments loaded (principal abridgment)"),
    null,{timeout:24000});
  assert.equal(await page.locator("#historiaSequence .auditSegment").count(),5);
  assert.match(await page.locator("#historiaSequence").innerText(),/Revelation 18:24/);
  assert.match(await page.locator("#historiaSequence details").last().textContent(),
    /LAMB_AND_THE_REDEEMED/);
  assert.deepEqual(pageErrors,[],"H76 source-owned principal/companion editor must not create browser errors");

  // Six additional v18 chapters reuse the same existing Scripture mining UI.
  assert.equal(await page.locator("#historiaAuditUnit option").count(),40,
    "Only one unified eight-chapter, 40-unit research overlay is loaded");
  await page.locator("#historiaAuditUnit").selectOption("H21-03");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("6 source fragments loaded (principal abridgment)"),
    null,{timeout:25000});
  assert.match(await page.locator("#historiaSequence").innerText(),/Exodus 14:5–10/);
  assert.match(await page.locator("#historiaSequence").innerText(),/Exodus 15:20–21/);
  await page.locator("#historiaAuditUnit").selectOption("H45-02");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("1 source fragments loaded (principal abridgment)"),
    null,{timeout:25000});
  assert.match(await page.locator("#historiaSequence").innerText(),/Luke 3:23–38/);
  await page.locator("#historiaAuditUnit").selectOption("H54-05");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("6 source fragments loaded (principal abridgment)"),
    null,{timeout:25000});
  assert.match(await page.locator("#historiaSequence").innerText(),/John 9:35–38/);
  assert.ok(await page.locator("#historiaSequence .gapNote").count()>=2);
  await page.locator("#historiaAuditUnit").selectOption("H73-02");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("4 source fragments loaded (principal abridgment)"),
    null,{timeout:25000});
  assert.match(await page.locator("#historiaSequence").innerText(),/Acts 16:16–21/);
  assert.match(await page.locator("#historiaSequence").innerText(),/Acts 16:27–34/);
  assert.deepEqual(pageErrors,[],"Eight-chapter original-source editorial workbench cannot raise browser errors");

  await page.locator("#historiaAuditUnit").selectOption("H54-02");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("1 source fragments loaded (principal abridgment)"),null,{timeout:20000});
  const publisherDisclosure=page.locator("#historiaSequence details.historiaResearch");
  await publisherDisclosure.locator("summary").click();
  assert.match(await publisherDisclosure.innerText(),/Mark 2:1-12/);
  assert.match(await publisherDisclosure.innerText(),/Publisher research/);
  assert.match(await publisherDisclosure.innerText(),/not verse-level popularity votes/);
  await page.locator("#historiaAuditUnit").selectOption("H45-01");
  await page.locator("#showHistoriaUnit").click();
  await page.waitForFunction(()=>document.querySelector("#historiaAuditStatus")?.textContent
    ?.includes("1 source fragments loaded (principal abridgment)"),null,{timeout:24000});
  assert.match(await page.locator("#historiaSequence details.historiaResearch").textContent(),
    /No overlapping qualified source record/);
  assert.deepEqual(pageErrors,[],"Publisher provenance and research-gap disclosures remain readable on mobile");





  // The proposed end-to-end reading remains an in-workbench source proof,
  // not a separate extended Bible mode or a new user-facing app.
  await page.locator("#historiaProofToggle").click();
  await page.locator("#historiaProof").waitFor({state:"visible",timeout:20000});
  await page.waitForFunction(()=>
    document.querySelectorAll("#historiaProofMovement option").length===37,
    null,{timeout:20000});
  assert.equal(await page.locator("#historiaProofMovement option").count(),37);
  await page.locator("#historiaProofMovement").selectOption("HS-M24");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("source verses displayed"),null,{timeout:30000});
  assert.match(await page.locator("#historiaProofText").innerText(),/I am the Resurrection and the Life/);
  assert.match(await page.locator("#historiaProofText").innerText(),/John 11:45–53/);
  assert.ok(await page.locator("#historiaProofText .proofGap").count()>=1,
    "Discontinuous source ranges must display omission cues");
  assert.equal(await page.locator("#historiaProofText .proofSourceBridge").count(),1,
    "The plot after Lazarus remains a visibly held source proposal, not silently stitched into Scripture");
  await page.locator("#historiaProofBridges").uncheck();
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("0 held source bridge(s)/trial(s) visible"),null,{timeout:25000});
  assert.equal(await page.locator("#historiaProofText .proofSourceBridge").count(),0);
  await page.locator("#historiaProofBridges").check();
  await page.locator("#historiaProofEdition").selectOption("dr-challoner");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("Douay–Rheims"),null,{timeout:25000});
  assert.match(await page.locator("#historiaProofText").innerText(),/I am the resurrection and the life/i);
  await page.locator("#historiaProofMovement").selectOption("HS-M34");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("source verses displayed"),null,{timeout:25000});
  assert.match(await page.locator("#historiaProofText").innerText(),/Acts 28:16/);
  assert.match(await page.locator("#historiaProofText").innerText(),/Acts 28:23–31/);
  assert.doesNotMatch(await page.locator("#historiaProofText").innerText(),/Acts 16:22–40|the jailer baptized/i,
    "Omitted Philippi cannot reappear as a compulsory Scripture reading; editorial notes may mention why it was excluded");
  assert.match(await page.locator("#historiaProofText").innerText(),/Acts 28:17–22/);
  assert.equal(await page.locator("#historiaProofText .proofSourceBridge").count(),3);
  // The P0 filter is worklist-backed, never inferred from incomplete legacy priority labels.
  await page.locator("#historiaProofBridgeFilter").selectOption("p0");
  await page.waitForFunction(()=>document.querySelector("#historiaProofDecisionReview")
    ?.textContent?.includes("HS-W-SRC-HS-P3-CF-13"),null,{timeout:20000});
  assert.equal(await page.locator("#historiaProofDecisionReview .proofDecision").count(),2);
  assert.equal(await page.locator("#historiaProofText .proofSourceBridge").count(),2,
    "P0 Rome should include the paired arrival and audience but not the non-P0 Acts 19 hold");
  assert.equal(await page.locator("#historiaProofP0Jump option").count(),7);
  await page.locator("#historiaProofP0Jump").selectOption("HS-M03");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("source verses displayed"),null,{timeout:25000});
  assert.equal(await page.locator("#historiaProofText .proofSourceBridge .proofVerse").count(),12,
    "The P0 Ark trial is the already-held 12-verse version, never full 14 verses");
  assert.match(await page.locator("#historiaProofText").innerText(),/Genesis 6:9–14/);
  assert.match(await page.locator("#historiaProofText").innerText(),/Genesis 6:17–22/);
  assert.equal(await page.locator("#historiaProofDecisionReview .proofDecision").count(),1);
  await page.locator("#historiaProofP0Jump").selectOption("HS-M28");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("source verses displayed"),null,{timeout:25000});
  assert.equal(await page.locator("#historiaProofDecisionReview .proofDecision").count(),2);
  assert.match(await page.locator("#historiaProofText").innerText(),/John 19:31–37/);
  assert.match(await page.locator("#historiaProofText").innerText(),/John 19:38–42/);
  await page.locator("#historiaProofP0Jump").selectOption("HS-M37");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("source verses displayed"),null,{timeout:25000});
  assert.match(await page.locator("#historiaProofText").innerText(),/Revelation 21:9–11/);
  assert.doesNotMatch(await page.locator("#historiaProofText").innerText(),/Revelation 22:20–21/,
    "Lower-priority book epilogue remains held, even when P0 angel source is shown");
  assert.equal(await page.locator("#historiaProofDecisionReview .proofDecision").count(),1);
  assert.equal(await page.locator("#historiaProofOtherJump option").count(),13,
    "The lower-priority navigator must have one entry for each of twelve source movements");
  await page.locator("#historiaProofOtherJump").selectOption("HS-M06");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("source verses displayed"),null,{timeout:25000});
  assert.equal(await page.locator("#historiaProofBridgeFilter").inputValue(),"all");
  assert.equal(await page.locator("#historiaProofDecisionReview .proofDecision").count(),1);
  assert.match(await page.locator("#historiaProofDecisionReview").innerText(),/JOSEPH_PRISON|PRISON_CAUSE/);
  assert.match(await page.locator("#historiaProofText").innerText(),/Genesis 39:19–21/);
  assert.equal(await page.locator("#historiaProofText .proofSourceBridge .proofVerse").count(),3,
    "Joseph's 3-verse proposed native reading is never truncated to the older 2-verse hold");
  await page.locator("#historiaProofOtherJump").selectOption("HS-M27");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("source verses displayed"),null,{timeout:25000});
  assert.match(await page.locator("#historiaProofDecisionReview").innerText(),/PREFER_KEEP_HELD_DISTINCT_JUDAS_EPISODE/);
  assert.match(await page.locator("#historiaProofText").innerText(),/Matthew 27:3–10/);
  assert.match(await page.locator("#historiaProofText").innerText(),/Source omission remains in the main manuscript/);
  await page.locator("#historiaProofOtherJump").selectOption("HS-M37");
  await page.waitForFunction(()=>document.querySelector("#historiaProofStatus")
    ?.textContent?.includes("source verses displayed"),null,{timeout:25000});
  assert.equal(await page.locator("#historiaProofDecisionReview .proofDecision").count(),2,
    "One P0 angel and one P2 canonical-end recommendation must remain separate");
  assert.match(await page.locator("#historiaProofText").innerText(),/Revelation 22:20–21/);
  assert.match(await page.locator("#historiaProofText").innerText(),/Revelation 22:6–19/,
    "Jump to canonical epilogue must explicitly disclose omitted original Scripture");
    assert.deepEqual(pageErrors,[],"P0 comparisons must not disrupt mobile Scripture workbench");
  await page.locator("#historiaProofToggle").click();
  assert.equal(await page.locator("#historiaProof").isVisible(),false);
  assert.equal(await page.locator("#historiaUnitControls").isVisible(),true);

  await page.locator("#module").selectOption("novena");
  await page.locator("#linkedObject option[value='annunciation']").waitFor({state:"attached",timeout:12000});
  await page.locator("#linkedObject").selectOption("annunciation");
  await page.locator("#rating").selectOption("4");
  await page.locator("#saveReview").click();
  const crossModule=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-scripture-mining-review-v1")));
  assert.ok(crossModule.some(row=>row.originModule==="novena"&&row.originId==="annunciation"));
  assert.equal(crossModule[0].originBead,2,"Saved Rosary record retains original exact bead");
  assert.deepEqual(pageErrors,[],"Unexpected cross-module workbench runtime errors");
  await page.goto("http://127.0.0.1:4199/index.html?ao_scripture_research=1",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true &&
    globalThis.AO_SCRIPTURE_APP_V1?.status?.()?.installed===true,null,{timeout:30000});
  await page.locator("[data-home-scripture]").click();
  const miningLink=page.locator("[data-scripture-editorial-mine]");
  await miningLink.waitFor({state:"visible",timeout:12000});
  assert.match(await miningLink.getAttribute("href"),/module=other/);
  assert.equal(new URL(await miningLink.getAttribute("href")).searchParams.get("reference"),"Luke 1:28");
  assert.deepEqual(pageErrors,[],"Unexpected research link browser errors");
 console.log("PASS Scripture mobile entry, 73 books, bilingual sources, bookmarks, search, Rosary cross-links, accessibility, close and isolation");
}finally{
 await browser?.close?.();
 await new Promise(ok=>server.close(ok));
}
