import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+name);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4297,"127.0.0.1",resolve);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e.message??e)));
   await page.goto("http://127.0.0.1:4297/tests/fixtures/reader-phone-harness.html?production=1&aoLiveCards=65",
     {waitUntil:"networkidle",timeout:55000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",{},{timeout:25000});
   // The Introit can be expected at the Mass entrance well before the
   // priest's printed B014 card. A later B014 read is not choir progress.
   const opening=await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const foot=api.model.cards.find(card=>card.title.startsWith("At the Foot of the Altar"));
     const introit=api.model.cards.find(card=>card.title==="Introit");
     if(!foot||!introit)throw new Error("MASS_ENTRANCE_CARDS_MISSING");
     api.showSequence(foot.sequence);
     const beginning=api.getScholaState();
     api.showSequence(introit.sequence);
     return {beginning,afterProper:api.getScholaState()};
   });
   assert.equal(opening.beginning.trackId,"INTROIT",
     "the first Mass card was not connected to the entrance chant");
   assert.equal(opening.beginning.schola.musicStatus,"EXPECTED_NOT_OBSERVED");
   assert.equal(opening.afterProper.trackId,"INTROIT");
   assert.equal(opening.afterProper.schola.segmentId,opening.beginning.schola.segmentId,
     "the B014 printed Introit reset the singing track");

   // The Communion antiphon normally accompanies actual Communion, not
   // the celebrant's later printed B085 reading after his ablutions.
   const communion=await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const host=api.model.cards.find(card=>card.title==="The Priest receives the Sacred Host");
     const blood=api.model.cards.find(card=>card.title==="The Priest receives the Precious Blood");
     const faithful=api.model.cards.find(card=>card.title==="Ecce Agnus Dei · Preparation of the Faithful");
     const ablutions=api.model.cards.find(card=>card.title==="Ablutions");
     const printed=api.model.cards.find(card=>card.title==="Communion Antiphon");
     if([host,blood,faithful,ablutions,printed].some(card=>!card))
       throw new Error("COMMUNION_CARD_ANCHORS_MISSING");
     api.showSequence(host.sequence);
     const opened=api.getScholaState();
     for(const card of [blood,faithful,ablutions,printed])
       api.showSequence(card.sequence);
     return {opened,printed:api.getScholaState()};
   });
   assert.equal(communion.opened.trackId,"COMMUNION",
     "the Schola Communion scene did not open at the priest's reception");
   assert.equal(communion.printed.trackId,"COMMUNION",
     "Communion song did not persist through faithful distribution and ablutions");
   assert.equal(communion.printed.schola.segmentId,communion.opened.schola.segmentId,
     "reading B085 falsely restarted choir music");
   await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const greeting=api.model.cards.find(card=>card.title.includes("Postcommunion"));
     if(!greeting)throw new Error("POSTCOMMUNION_GREETING_CARD_MISSING");
     api.showSequence(greeting.sequence);
   });
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.trackId),
     null,"Communion music leaked into Postcommunion");

   // A card displaying the same sung words must keep the Schola's manual
   // controls available in a compact dock, without duplicating its lyrics.
   await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const kyrie=api.model.cards.find(card=>card.title==="Kyrie");
     if(!kyrie)throw new Error("KYRIE_SOURCE_CARD_MISSING");
     api.showSequence(kyrie.sequence);
   });
   await page.waitForFunction(()=>
     document.querySelector(".ao-schola-dock")?.dataset.shared==="true");
   assert.equal(await page.locator(".ao-schola-dock").isVisible(),true,
     "Shared central chant hid the Schola correction controls");
   assert.equal(await page.locator(".ao-schola-main").isVisible(),true,
     "Shared chant lost its accessible translation control");
   const hiddenSharedLatin=await page.locator(".ao-schola-main [data-role='schola']").evaluate(
     el=>getComputedStyle(el).visibility);
   assert.equal(hiddenSharedLatin,"hidden",
     "Central Kyrie text was unnecessarily duplicated in the Schola dock");
   assert.equal(await page.locator('[data-role="schola-status"]').textContent(),"EXPECTED",
     "Unobserved Schola text was presented as confirmed singing");
   await page.locator("[data-schola-next]").click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.index===1);
   const atLastPhrase=await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     let state=api.getScholaState();
     while(state.index<state.total-1){
       api.nextSchola();state=api.getScholaState();
     }
     return {index:state.index,total:state.total,complete:state.complete,
       card:api.getCurrentCard().sectionId,cue:api.getActiveCue()};
   });
   assert.ok(atLastPhrase.total>1,"Kyrie needs multiple witnessed segments for the finish test");
   assert.equal(atLastPhrase.complete,false,"Reaching last phrase is not observed chant completion");
   await page.waitForFunction(()=>
     document.querySelector("[data-schola-next]")?.textContent==="FINISH");
   const finishFit=await page.locator("[data-schola-next]").evaluate(button=>{
     const p=document.querySelector("[data-schola-pause]");
     const a=button.getBoundingClientRect(),b=p?.getBoundingClientRect();
     return {flag:button.dataset.scholaFinish,fontPx:parseFloat(getComputedStyle(button).fontSize),
       scrollWidth:button.scrollWidth,clientWidth:button.clientWidth,
       nextRight:a.right,pauseLeft:b?.left??0};
   });
   assert.equal(finishFit.flag,"true","FINISH button must own its compact phone typography");
   assert.ok(finishFit.fontPx<=10,"FINISH word inherits the oversized Schola arrow font");
   assert.ok(finishFit.scrollWidth<=finishFit.clientWidth+1,
     "FINISH glyph overflows its own button at "+width+"px: "+JSON.stringify(finishFit));
   assert.ok(finishFit.nextRight<=finishFit.pauseLeft+1,
     "FINISH and PAUSE controls physically overlap at "+width+"px");
   console.log("SCHOLA_FINISH_PHONE_FIT="+JSON.stringify({width,...finishFit}));
   await page.screenshot({path:resolve(out,"schola-finish-fit-"+width+".png"),animations:"disabled"});
   assert.equal(await page.locator("[data-schola-next]").isDisabled(),false,
     "Last Schola phrase cannot be finished from the actual reader");
   await page.locator("[data-schola-next]").click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.complete===true);
   await page.waitForFunction(()=>document.querySelector("[data-schola-next]")?.disabled===true);
   assert.equal(await page.locator("[data-schola-next]").isDisabled(),true);
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId),
     atLastPhrase.card,"Finishing choir track moved the priest reader");
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getActiveCue()),
     atLastPhrase.cue,"Finishing choir track advanced priest cue");
   const sharedAdvance=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().title);
   assert.equal(sharedAdvance,"Kyrie","Shared Schola manual correction moved the main Mass card");
   const chosen=await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const sanctus=api.model.cards.find(card=>card.title==="Sanctus");
     const canon=api.model.cards.find(card=>card.title==="Te igitur");
     if(!sanctus||!canon)return {error:"SANCTUS_OR_CANON_CARD_MISSING"};
     // The Schola continues independently into the priest's silent Canon,
     // where its dock is rightly visible rather than duplicated in the text.
     api.showSequence(sanctus.sequence);
     api.showSequence(canon.sequence);
     return {card:canon.title,sequence:canon.sequence};
   });
   assert.equal(chosen.error,undefined,JSON.stringify(chosen));
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.trackId==="SANCTUS_BENEDICTUS");
   const dock=page.locator(".ao-schola-dock");
   await dock.waitFor({state:"visible"});
   assert.equal((await dock.locator(".ao-schola-kicker").textContent())?.trim(),"SANCTUS",
     "The independent Schola track must be displayed simply as Sanctus");
   const prev=page.locator("[data-schola-previous]");
   const next=page.locator("[data-schola-next]");
   assert.equal(await prev.count(),1);
   assert.equal(await next.count(),1);
   assert.equal(await prev.isDisabled(),true,"Previous must not wrap before the first phrase");
   assert.equal(await next.isEnabled(),true,"Next phrase correction unavailable");
   const before=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
     state:window.__AO_PHONE_PREVIEW.getScholaState()
   }));
   await next.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.index===1);
   await page.waitForFunction(()=>document.querySelector("[data-schola-previous]")?.disabled===false);
   const advanced=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
     segment:window.__AO_PHONE_PREVIEW.getScholaState()?.schola?.segmentId,
     number:document.querySelector('[data-role="schola-page"]')?.textContent
   }));
   assert.equal(advanced.card,before.card,"Schola step moved LIVE prayer card");
   assert.equal(advanced.cue,before.cue,"Schola step moved priest/faithful focus");
   assert.equal(advanced.number.trim().startsWith("2 /"),true,"Schola counter did not follow manual correction");
   await prev.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.index===0);
   // The source controller updates synchronously; the disabled control
   // follows at the next requestAnimationFrame reader projection.
   await page.waitForFunction(()=>document.querySelector("[data-schola-previous]")?.disabled===true);
   assert.equal(await prev.isDisabled(),true);
   await page.locator("[data-schola-pause]").click();
   assert.equal(await page.locator("[data-schola-pause]").getAttribute("aria-pressed"),"true");
   await next.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.index===1);
   assert.equal(await page.locator("[data-schola-pause]").getAttribute("aria-pressed"),"true",
     "Manual Schola correction should not override user's pause");
   // Neither a timer nor the priest's separate Benedictus cue can assert
   // that the choir has begun its delayed sung Benedictus.
   const selected=await page.evaluate(()=>{
     const node=document.querySelector('[data-reader-customary="sanctusPerformance"]');
     node.value="POLYPHONIC";
     node.dispatchEvent(new Event("change",{bubbles:true}));
     return {value:node.value,mode:window.__AO_PHONE_PREVIEW.getScholaState().sanctusPerformance};
   });
   assert.equal(selected.mode,"POLYPHONIC",JSON.stringify(selected));
   await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const preface=api.model.cards.find(c=>c.title==="Preface");
     const sanctus=api.model.cards.find(c=>c.title==="Sanctus");
     const canon=api.model.cards.find(c=>c.title==="Te igitur");
     api.showSequence(preface.sequence);
     api.showSequence(sanctus.sequence);
     api.showSequence(canon.sequence);
   });
   await page.evaluate(()=>{
     window.__AO_PHONE_PREVIEW.nextSchola();
     window.__AO_PHONE_PREVIEW.nextSchola();
   });
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState().benedictusHold===true);
   assert.equal((await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola.cueId)),
     "AO.SM.C0147","Delayed Benedictus barrier was not placed after Hosanna");
   const release=page.locator("[data-schola-release]");
   // The priest's printed Benedictus and the Schola's post-Chalice singing
   // are NOT the same event. No release before either Consecration.
   await page.waitForFunction(()=>document.querySelector("[data-schola-release]")?.hidden===true);
   assert.equal(await release.isVisible(),false,
     "A printed priest's Benedictus falsely released the polyphonic Schola");
   await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const afterChalice=api.model.cards.find(card=>card.title==="Unde et memores");
     if(!afterChalice)throw new Error("POST_CHALICE_SOURCE_CARD_MISSING");
     api.showSequence(afterChalice.sequence);
   });
   await page.waitForFunction(()=>document.querySelector("[data-schola-release]")?.hidden===false,
     null,{timeout:7000});
   assert.equal(await page.locator("[data-schola-next]").isDisabled(),true);
   assert.equal(await release.isVisible(),true,
     "The choir's delayed Benedictus needs an actual manually observed release");
   // A direct Canon card jump may finish settling its source cue on the
   // next animation frame. Establish the priest's cue before comparing it
   // across an independent Schola release, avoiding a null→C0182 race.
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getActiveCue()==="AO.SM.C0182",
     null,{timeout:7000});
   const beforeRelease=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
   }));
   await release.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola?.cueId==="AO.SM.C0148");
   const afterRelease=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
     holding:window.__AO_PHONE_PREVIEW.getScholaState().benedictusHold,
   }));
   assert.deepEqual({card:afterRelease.card,cue:afterRelease.cue},beforeRelease,
     "Releasing Schola Benedictus wrongly moved the priest's Mass clock");
   assert.equal(afterRelease.holding,false);
   await page.waitForFunction(()=>document.querySelector("[data-schola-release]")?.hidden===true,
     null,{timeout:7000});
   assert.equal(await release.isVisible(),false);
   // Navigate the source-owned Schola itinerary independently of priest
   // catch-up. No chant/organ/silence event implies that music was heard.
   const priestBeforeMusicPick=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
   }));
   const musicButton=page.locator("[data-schola-events-open]");
   assert.equal(await musicButton.isVisible(),true,
     "Sung LIVE must expose a music-event navigator independent of priest cards");
   await musicButton.click();
   const musicMenu=page.locator('[data-role="schola-events-menu"]');
   assert.equal(await musicMenu.isVisible(),true);
   assert.ok(await musicMenu.locator("[data-schola-event-select]").count()>=25,
     "Schola source itinerary did not populate navigable events");

   // Real phone actions must create ONLY the user's observed music states,
   // without moving the priest, the chant syllable clock or a quiet interval.
   const originalPerformance=await page.evaluate(()=>{
     const l=window.__AO_PHONE_PREVIEW.getScholaPerformance();
     return {schema:l.performanceSchema,
       kyrie:l.events.find(x=>x.id==="KYRIE")?.performance.status,
       quiet:l.events.find(x=>x.id==="CANON")?.performance.eligible,
       organ:l.events.find(x=>x.id==="ENTRANCE_ORGAN_OPTION")?.performance.eligible,
       started:l.counts.started};
   });
   assert.equal(originalPerformance.schema,"ao-schola-performance-session-v1");
   assert.equal(originalPerformance.kyrie,"EXPECTED_NOT_OBSERVED");
   assert.equal(originalPerformance.quiet,false);
   assert.equal(await musicMenu.locator('[data-schola-performance-row="CANON"]').count(),0,
     "Canon silence must not be recordable as musical performance");
   const performanceStart=musicMenu.locator(
     '[data-schola-performance-event="KYRIE"][data-schola-performance-action="START"]');
   await performanceStart.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaPerformance()
     .events.find(x=>x.id==="KYRIE")?.performance.status==="STARTED_OBSERVED");
   assert.match(await musicMenu.locator("[data-schola-performance-summary]").textContent(),
     /1 started/);
   assert.equal(await musicMenu.locator('[data-schola-performance-status="KYRIE"]').textContent(),
     "You marked: started");
   const selectedAfterStart=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue()
   }));
   assert.deepEqual(selectedAfterStart,priestBeforeMusicPick);
   await musicMenu.locator(
     '[data-schola-performance-event="KYRIE"][data-schola-performance-action="FINISH"]').click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaPerformance()
     .events.find(x=>x.id==="KYRIE")?.performance.status==="FINISHED_OBSERVED");
   assert.match(await musicMenu.locator("[data-schola-performance-summary]").textContent(),
     /1 finished/);
   await page.screenshot({path:resolve(out,"schola-observed-performance-"+width+".png"),
     animations:"disabled"});
   await musicMenu.locator(
     '[data-schola-performance-event="KYRIE"][data-schola-performance-action="RESET"]').click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaPerformance()
     .events.find(x=>x.id==="KYRIE")?.performance.status==="EXPECTED_NOT_OBSERVED");
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState().trackId),
     "SANCTUS_BENEDICTUS","Recording music must not change the independent choir track");
   assert.deepEqual(await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue()
   })),priestBeforeMusicPick);

   const unselectedMotet=musicMenu.locator('[data-schola-event-select="OFFERTORY_LOCAL_MOTET"]');
   assert.equal(await unselectedMotet.isDisabled(),true,
     "Unplanned local motet must not be presented as a selectable performance");
   // Verify actual 320/390px production-harness cards, not just the
   // synthetic source-itinerary fixture. An optional title cannot silently
   // hide a missing exact source cue in the currently selected reader.
   const optionalWindows=await page.evaluate(()=>{
     const cards=window.__AO_PHONE_PREVIEW.model.cards;
     const hasBlock=id=>cards.some(c=>(c.blocks??[]).some(b=>b.blockId===id));
     const hasCue=id=>cards.some(c=>(c.paragraphs??[]).some(p=>
       (p.sourceCueIds??[]).includes(id)));
     const descriptions=Object.fromEntries(
       ["ENTRANCE_ORGAN_OPTION","OFFERTORY_LOCAL_MOTET",
        "OFFERTORY_ORGAN_OPTION","COMMUNION_LOCAL_MOTET",
        "RECESSIONAL_ORGAN_OPTION"].map(id=>{
         const node=document.querySelector('[data-schola-event-select="'+id+'"]');
         return [id,{exists:Boolean(node),description:node?.querySelector("small")?.textContent??""}];
       }));
     return {source:{
       offertory:hasBlock("AO.SM.B030"),
       communion:hasBlock("AO.SM.B074"),
       secret:hasCue("AO.SM.C0135"),
       postcommunion:hasCue("AO.SM.C0251")},descriptions};
   });
   for(const [source,exists] of Object.entries(optionalWindows.source))
     assert.equal(exists,true,
       width+"px actual curated source lost optional Schola anchor "+source);
   for(const [id,item] of Object.entries(optionalWindows.descriptions)){
     assert.equal(item.exists,true,width+"px missing existing optional event "+id);
     assert.ok(item.description.length>25,
       width+"px optional music lacks editorial boundary "+id);
     assert.doesNotMatch(item.description,/Exact source anchor unavailable/,
       width+"px exact cue exists but option was held "+id);
   }
   assert.match(optionalWindows.descriptions.ENTRANCE_ORGAN_OPTION.description,
     /arrival require observation/i);
   assert.match(optionalWindows.descriptions.OFFERTORY_ORGAN_OPTION.description,
     /stop by the Secret/i);
   assert.match(optionalWindows.descriptions.COMMUNION_LOCAL_MOTET.description,
     /distribution continues/i);
   assert.match(optionalWindows.descriptions.RECESSIONAL_ORGAN_OPTION.description,
     /Last Gospel card does not prove/i);
   console.log("SCHOLA_OPTIONAL_WINDOWS_PHONE="+JSON.stringify({width,...optionalWindows}));
   await page.screenshot({path:resolve(out,"schola-optional-windows-"+width+".png"),
     animations:"disabled"});
   // This event exists only with a source-resolved polyphonic setting.
   // Unknown or Gregorian settings must not invent a second Benedictus.
   const delayedBenedictus=musicMenu.locator('[data-schola-event-select="BENEDICTUS_AFTER_CHALICE"]');
   if(await delayedBenedictus.count()){
     assert.equal(await delayedBenedictus.isDisabled(),true,
       "Manually released Benedictus must never be skipped by the event picker");
   }
   await musicMenu.locator('[data-schola-event-select="KYRIE"]').click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.trackId==="KYRIE");
   assert.equal(await musicMenu.isVisible(),false);
   const afterChantPick=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
   }));
   assert.deepEqual(afterChantPick,priestBeforeMusicPick,
     "Selecting a source-backed chant moved the priest reader");
   await musicButton.click();
   // Not every source-resolved Mass includes every editorial interval;
   // select a genuinely present quiet event without inventing a Canon slot.
   const quietId=await musicMenu.locator("[data-schola-event-select]").evaluateAll(buttons=>{
     const options=["CANON","HOMILY","LESSON","PRIEST_COMMUNION_PREPARATION",
       "HOST_CONSECRATION_SILENCE","CHALICE_CONSECRATION_SILENCE"];
     return options.find(id=>buttons.some(b=>b.dataset.scholaEventSelect===id &&
       !b.disabled))??null;
   });
   assert.ok(quietId,"No source-backed quiet interval in the current Schola event itinerary");
   await musicMenu.locator('[data-schola-event-select="'+quietId+'"]').click();
   await page.waitForFunction(id=>
     window.__AO_PHONE_PREVIEW.getSelectedScholaEvent()?.id===id,quietId);
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState().trackId),
     null,"Selecting a quiet-interval reference left an invented choir chant active");
   const eventReference=await page.evaluate(()=>
     window.__AO_PHONE_PREVIEW.getSelectedScholaEvent());
   assert.equal(eventReference.kind,"QUIET_INTERVAL");
   await page.waitForFunction(label=>
     document.querySelector('[data-role="schola"]')?.textContent?.includes(label),
     eventReference.label);
   const referenceLabel=await page.locator('[data-role="schola"]').textContent();
   assert.match(referenceLabel,new RegExp(eventReference.label.split(" · ")[0],"i"),
     "Quiet event reference is not visible");
   assert.equal((await page.locator('[data-role="schola-status"]').textContent()).trim(),
     "NOT OBSERVED","Quiet interval reference should not claim observed music");
   const priestAfterMusicPick=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
   }));
   assert.deepEqual(priestAfterMusicPick,priestBeforeMusicPick,
     "Selecting a source-owned quiet interval moved the priest's focus");
   await musicButton.click();
   const rejoinButton=musicMenu.locator("[data-schola-events-rejoin]");
   assert.equal(await rejoinButton.isVisible(),true,
     "Quiet or optional reference must have an explicit exit to expected Mass music");
   await rejoinButton.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getSelectedScholaEvent()===null);
   assert.deepEqual(await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
   })),priestBeforeMusicPick,"Rejoining expected music moved priest focus");

   // Named profiles are part of the shipped MUSIC PLAN panel and must be
   // usable at 320/390px. No profile operation can move the priest's card.
   const profileBefore=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue()
   }));
   const panel=page.locator("[data-schola-local-panel]");
   await panel.locator("summary").click();
   await panel.locator("[data-schola-profile-new]").fill("Sung Sunday");
   await panel.locator("[data-schola-profile-create]").click();
   await page.waitForFunction(()=>
     document.querySelector("[data-schola-profile-select]")?.options.length===2);
   const profilePicker=panel.locator("[data-schola-profile-select]");
   const createdProfile=await profilePicker.inputValue();
   assert.notEqual(createdProfile,"p1","New profile did not become active");
   await panel.locator('[data-schola-ordinary-setting="KYRIE"]').fill("Mass VIII");
   await panel.locator('[data-schola-ordinary-setting="CREDO"]').fill("Credo III");
   // Ordinary inputs persist on change/blur (not per keystroke); explicit
   // commit avoids reading a still-focused uncommitted text field.
   await panel.locator('[data-schola-ordinary-setting="CREDO"]').blur();
   await panel.locator("[data-schola-local-sanctus]").selectOption("POLYPHONIC");
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()
     ?.sanctusPerformance==="POLYPHONIC");
   const savedProfile=await page.evaluate(()=>{
     const key="ao-schola-profile-library-v2";
     const library=JSON.parse(localStorage.getItem(key)||"{}");
     const active=(library.profiles??[]).find(p=>p.id===library.activeProfileId);
     return {id:library.activeProfileId,name:active?.name,
       kyrie:active?.ordinarySettings?.KYRIE,
       credo:active?.ordinarySettings?.CREDO,
       sanctus:active?.sanctusPerformance,
       v1StillReadable:Boolean(localStorage.getItem("ao-schola-local-programme-v1"))};
   });
   assert.equal(savedProfile.name,"Sung Sunday");
   assert.equal(savedProfile.kyrie,"Mass VIII");
   assert.equal(savedProfile.credo,"Credo III");
   assert.equal(savedProfile.sanctus,"POLYPHONIC");
   assert.equal(savedProfile.v1StillReadable,true);
   await profilePicker.selectOption("p1");
   await page.waitForFunction(()=>
     document.querySelector('[data-schola-ordinary-setting="KYRIE"]')?.value==="");
   await profilePicker.selectOption(createdProfile);
   await page.waitForFunction(()=>
     document.querySelector('[data-schola-ordinary-setting="KYRIE"]')?.value==="Mass VIII");
   assert.equal(await panel.locator("[data-schola-local-sanctus]").inputValue(),
     "POLYPHONIC","Profile switch lost the independently saved Sanctus performance");
   assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState()
     ?.sanctusPerformance),"POLYPHONIC","Controller and profile preference drifted");
   // Space-containing Ordinary titles must remain typeable; do not trim the
   // field during each keyboard input.
   const gloriaField=panel.locator('[data-schola-ordinary-setting="GLORIA"]');
   await gloriaField.fill("");
   await gloriaField.pressSequentially("Mass VIII", {delay:5});
   assert.equal(await gloriaField.inputValue(),"Mass VIII",
     "Editor erased spaces during ordinary music typing");
   await gloriaField.blur();
   await page.waitForFunction(()=>JSON.parse(
     localStorage.getItem("ao-schola-profile-library-v2")||"{}")
       .profiles?.find(p=>p.id===JSON.parse(
         localStorage.getItem("ao-schola-profile-library-v2")||"{}").activeProfileId)
       ?.ordinarySettings?.GLORIA==="Mass VIII");
   // Source-indexed Kyriale catalogue is movement-specific, preserves the
   // local custom fallback and never changes the priest/Schola clock.
   const kyrieMenu=panel.locator('[data-schola-kyriale-choice="KYRIE"]');
   const gloriaMenu=panel.locator('[data-schola-kyriale-choice="GLORIA"]');
   const credoMenu=panel.locator('[data-schola-kyriale-choice="CREDO"]');
   assert.equal(await kyrieMenu.locator("option").count(),20,
     "Expected 18 source-indexed Mass Kyries plus custom/none");
   assert.equal(await credoMenu.locator("option").count(),8,
     "Expected six source-indexed Credos plus custom/none");
   assert.equal(await gloriaMenu.locator('option[value="MASS_17"]').count(),0,
     "Kyriale Mass XVII does not supply a Gloria");
   assert.equal(await panel.locator('a[href="https://media.churchmusicassociation.org/pdf/kyriale.pdf"]').count(),1);
   await kyrieMenu.selectOption("MASS_08");
   await credoMenu.selectOption("CREDO_03");
   await page.waitForFunction(()=>{
     const v=JSON.parse(localStorage.getItem("ao-schola-profile-library-v2")||"{}");
     const p=v.profiles?.find(x=>x.id===v.activeProfileId);
     return p?.ordinarySelections?.KYRIE==="MASS_08" &&
       p?.ordinarySelections?.CREDO==="CREDO_03";
   });
   // The local plan writes storage before the queued DOM update. Assert the
   // settled selection rather than racing the old custom field render.
   await page.waitForFunction(()=>{
     const field=document.querySelector('[data-schola-ordinary-setting="KYRIE"]');
     const picker=document.querySelector('[data-schola-kyriale-choice="CREDO"]');
     return field?.value==="Mass VIII · De Angelis" &&
       field.hidden===true && picker?.value==="CREDO_03";
   });
   assert.equal(await panel.locator('[data-schola-ordinary-setting="KYRIE"]').inputValue(),
     "Mass VIII · De Angelis");
   assert.equal(await panel.locator('[data-schola-ordinary-setting="KYRIE"]').isDisabled(),true,
     "A source-indexed label must not be editable until custom is chosen");
   assert.equal(await panel.locator('[data-schola-ordinary-setting="KYRIE"]').isHidden(),true,
     "Indexed option must not duplicate its title in a disabled mobile text field");
   const selectedSource=await page.evaluate(()=>{
     const v=JSON.parse(localStorage.getItem("ao-schola-profile-library-v2")||"{}");
     const p=v.profiles?.find(x=>x.id===v.activeProfileId);
     return {kyrie:p?.ordinarySelections?.KYRIE,credo:p?.ordinarySelections?.CREDO,
       kyrieLabel:p?.ordinarySettings?.KYRIE,credoLabel:p?.ordinarySettings?.CREDO};
   });
   assert.deepEqual(selectedSource,{
     kyrie:"MASS_08",credo:"CREDO_03",
     kyrieLabel:"Mass VIII · De Angelis",credoLabel:"Credo III"});
   console.log("SCHOLA_KYRIALE_PHONE="+JSON.stringify({width,...selectedSource}));
   await page.screenshot({path:resolve(out,"schola-kyriale-source-"+width+".png"),
     animations:"disabled"});
   await kyrieMenu.selectOption("CUSTOM");
   // The UI queues one render after a local profile change; do not race
   // the render cycle while asserting that Custom restores the editor.
   await page.waitForFunction(()=>document.querySelector(
     '[data-schola-ordinary-setting="KYRIE"]')?.hidden===false);
   assert.equal(await panel.locator('[data-schola-ordinary-setting="KYRIE"]').isVisible(),true,
     "Custom selection must restore the editable text field");
   await panel.locator('[data-schola-ordinary-setting="KYRIE"]').fill("Local polyphonic Kyrie");
   await panel.locator('[data-schola-ordinary-setting="KYRIE"]').blur();
   await page.waitForFunction(()=>{
     const v=JSON.parse(localStorage.getItem("ao-schola-profile-library-v2")||"{}");
     const p=v.profiles?.find(x=>x.id===v.activeProfileId);
     return p?.ordinarySelections?.KYRIE==="" &&
       p?.ordinarySettings?.KYRIE==="Local polyphonic Kyrie";
   });
   await profilePicker.selectOption("p1");
   await profilePicker.selectOption(createdProfile);
   await page.waitForFunction(()=>document.querySelector(
     '[data-schola-kyriale-choice="CREDO"]')?.value==="CREDO_03");
   assert.equal(await kyrieMenu.inputValue(),"CUSTOM",
     "Custom Kyrie lost its distinction from verified source on profile switch");
   const panelBounds=await panel.locator(".ao-schola-programme-fields").evaluate(el=>{
     const r=el.getBoundingClientRect();
     return {left:r.left,right:r.right,viewport:innerWidth,scroll:el.scrollHeight,
       client:el.clientHeight};
   });
   assert.ok(panelBounds.left>=-1&&panelBounds.right<=width+1,
     "Parish programme editor exceeds phone width: "+JSON.stringify(panelBounds));
   await page.screenshot({path:resolve(out,"schola-parish-profile-"+width+".png"),
     animations:"disabled"});
   await panel.locator("summary").click();
   assert.deepEqual(await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue()
   })),profileBefore,"Switching parish profiles moved the priest reader");

   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,"Schola controls overflow narrow phone");
   assert.deepEqual(errors,[],"Runtime page errors");
   await page.screenshot({path:resolve(out,"live-schola-correction-"+width+".png"),animations:"disabled"});
  }finally{await ctx.close();}
 }
 console.log("PASS LIVE Schola: manual phrase clock, no early Benedictus release, 320/390 phone layout, no Mass focus movement");
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
