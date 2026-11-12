// Actual native 65-card LIVE reader with unchanged 3D sanctuary, not demo text.
// Never treats animated state as an observation of priest, ministers or Schola.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const shots=resolve(root,"artifacts/sanctuary-live");
await mkdir(shots,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){
   res.writeHead(403);res.end("Forbidden");return;
  }
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);
  res.end(String(error?.message??error));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
// This exercise goes THROUGH the real 1962 LIVE source focus tracker,
// unlike direct bridge test probes. The native reader scroll alone sends
// the exact source cue and controls which original M3 scene may animate.
async function focusNativeSourceCue(page,cueId){
 return page.evaluate(async cue=>{
  const api=window.__AO_PHONE_PREVIEW;
  const hits=api.model.cards.filter(c=>(c.paragraphs??[])
    .some(p=>(p.sourceCueIds??[]).includes(cue)));
  if(hits.length!==1)return {found:false,reason:"CANONICAL_CUE_CARD_NOT_UNIQUE",
    cue,cards:hits.map(x=>x.sectionId)};
  const card=hits[0];
  if(api.getCurrentCard()?.sectionId!==card.sectionId)
    api.showSequence(card.sequence);
  const frame=()=>new Promise(done=>requestAnimationFrame(
    ()=>requestAnimationFrame(done)));
  await frame();
  const scroller=document.querySelector(
    "#ao-r17-native-reader-preview .ao-prayer-card");
  const node=[...(scroller?.querySelectorAll?.(
    ".ao-reader-paragraph[data-cue-id]")??[])].find(el=>
    el.dataset.cueId===cue ||
    el.dataset.sourceCueIds?.split(" ").includes(cue));
  if(!node)return {found:false,reason:"SOURCE_CUE_NOT_IN_NATIVE_DOM",
    cue,card:card.sectionId};
  const rect=node.getBoundingClientRect(),outer=scroller.getBoundingClientRect();
  const center=rect.top-outer.top+scroller.scrollTop+rect.height/2;
  const limit=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
  const ideal=center-scroller.clientHeight*.39;
  const offsets=[0,12,-12,24,-24,36,-36,72,-72,120,-120,160,-160];
  const positions=[limit,...offsets.map(delta=>Math.max(0,
    Math.min(limit,Math.round(ideal+delta)))),0];
  for(const y of [...new Set(positions)]){
    scroller.scrollTop=y;
    scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
    await frame();
    if(api.getActiveCue()===cue)
      return {found:true,cue,card:card.sectionId,
        sourceSectionId:card.sourceSectionId,scrollTop:scroller.scrollTop};
  }
  return {found:false,reason:"SOURCE_FOCUS_NOT_REACHED",
    cue,card:card.sectionId,active:api.getActiveCue(),limit,ideal};
 },cueId);
}
const browser=await chromium.launch({headless:true});
try{
 for(const {form,width,height} of [
  {form:"LOW",width:320,height:780},
  {form:"MISSA_CANTATA_SIMPLE",width:390,height:844},
  {form:"SOLEMN",width:390,height:844},
  {form:"SOLEMN",width:844,height:390},
  {form:"LOW",width:1280,height:850}
 ]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  const url="http://127.0.0.1:"+server.address().port+
   "/tests/fixtures/reader-phone-harness.html?production=1&aoLiveCards=65"+
   "&gloria=1&credo=1&aoSanctuaryPreview=1&form="+form;
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
   null,{timeout:40000});
  await page.waitForFunction(()=>Boolean(document.querySelector(
   ".ao-sanctuary-window iframe")),null,{timeout:10000});
  const iframe=page.locator(".ao-sanctuary-window iframe");
  const src=await iframe.getAttribute("src");
  assert.match(src,/assets\/mass\/live-sanctuary\/index\.html\?aoSanctuary=1$/);
  await page.waitForFunction(()=>{
   const win=document.querySelector(".ao-sanctuary-window iframe")?.contentWindow;
   return Boolean(win?.AO_SANCTUARY_EMBED_TEST);
  },null,{timeout:30000});
  const frame=page.frames().find(x=>x.url().includes(
   "/assets/mass/live-sanctuary/index.html"));
  assert.ok(frame,"Original Claude scene iframe was not loaded");
  // Source-checked Solemn Requiem exceptions: visual only, not a new
  // Mass resolver or an inferred celebrant/Schola clock.
  if(form==="SOLEMN"&&width===390){
    const conditional=await frame.evaluate(()=>{
      const api=window.AO_SANCTUARY_EMBED_TEST;
      const send=(title,section,cue,requiem)=>api.present({
        type:"AO_SANCTUARY_CUE_V1",version:1,
        form:"SOLEMN",cardTitle:title,sourceSectionId:section,
        sourceCueId:cue,certifiedSourceFocus:true,requiem,
        scholaOnly:false
      });
      // Ritus VI.4: the native card owns the Epistle scene even though
      // its curated text has NO focusable C0075 donor paragraph. Book
      // assignment is static for this whole source card, never a clock.
      const epistle="Epistle / Lesson";
      const epiBefore=send(epistle,"AO.CARD.005","AO.SM.C0074",false);
      const epiStart=send(epistle,"AO.CARD.005","AO.SM.C0075",false);
      const epiHolding=(()=>{
        const a=M3.actors()?.S;
        return {visible:a?.vis===true,prop:a?.prop??null,
          x:a?.x,pose:a?.pose,path:a?.path??null,
          played:window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.playedCue};
      })();
      const epiDuring=send(epistle,"AO.CARD.005","AO.SM.C0076",true);
      const epiEnding=send("Gradual · Alleluia / Tract / Sequence",
        "AO.CARD.006","AO.SM.C0077",true);
      const epiAfter=M3.actors()?.S?.prop??null;
      // Ritus VI.5: the SUBDEACON transfers the Missal, while the
      // deacon prepares the distinct Gospel book. C0081 shows only the
      // static completed-transfer stage, never an unsourced server walk.
      const prep="Preparation for the Gospel";
      const prepareBefore=send(prep,"AO.CARD.007","AO.SM.C0080",false);
      const transfer=send(prep,"AO.CARD.007","AO.SM.C0081",false);
      const nearMissal=(()=>{
        const a=M3.actors()?.S;
        return {x:a?.x,z:a?.z,face:a?.face,prop:a?.prop,
          pose:a?.pose,path:a?.path??null,
          played:window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.playedCue};
      })();
      const leaveTransfer=send(prep,"AO.CARD.007","AO.SM.C0082",false);
      const returned=(()=>{
        const a=M3.actors()?.S;
        return {x:a?.x,z:a?.z,prop:a?.prop,path:a?.path??null};
      })();
      const requiemTransfer=send(prep,"AO.CARD.007","AO.SM.C0081",true);
      const gospel="Proclamation of the Holy Gospel";
      send(gospel,"AO.CARD.007","AO.SM.C0084",false);
      const ministers=()=>Object.fromEntries(
        ["D","S","T","A1","A2"].map(id=>{
          const a=M3.actors()?.[id];
          return [id,{visible:a?.vis===true,prop:a?.prop??null}];
        })
      );
      const ordinary=ministers();
      send(gospel,"AO.CARD.007","AO.SM.C0084",true);
      const requiem=ministers();
      send(gospel,"AO.CARD.007","AO.SM.C0084",false);
      const restored=ministers();
      const offertory="Offertory · Incensation";
      const held=send(offertory,"AO.CARD.010","AO.SM.C0121",true);
      const normal=send(offertory,"AO.CARD.010","AO.SM.C0121",false);
      // Native C0174/C0181 only: the ordinary thurifer, rather than the
      // Requiem subdeacon, must bear the source-focused thurible.
      const elevation=(id)=>({
        visible:M3.actors()?.[id]?.vis===true,
        prop:M3.actors()?.[id]?.prop??null,
        pose:M3.actors()?.[id]?.pose??null,
        x:M3.actors()?.[id]?.x??null,
        z:M3.actors()?.[id]?.z??null,
        swings:Boolean(M3.actors()?.[id]?.b?.el?.classList?.contains(
          "ao-source-elevation-incense"))
      });
      const host="Words of Consecration and Elevation · Host";
      const chalice="Words of Consecration and Elevation · Chalice";
      const hOrd=send(host,"AO.CARD.015","AO.SM.C0174",false);
      const ordinaryElevation={thurifer:elevation("T"),subdeacon:elevation("S"),
        actor:hOrd.elevationIncenseActor};
      send(host,"AO.CARD.015","AO.SM.C0175",false);
      const ordinaryExit={thurifer:elevation("T"),subdeacon:elevation("S")};
      const hReq=send(host,"AO.CARD.015","AO.SM.C0174",true);
      const requiemHost={thurifer:elevation("T"),subdeacon:elevation("S"),
        actor:hReq.elevationIncenseActor};
      const cReq=send(chalice,"AO.CARD.016","AO.SM.C0181",true);
      const requiemChalice={thurifer:elevation("T"),subdeacon:elevation("S"),
        actor:cReq.elevationIncenseActor};
      send(chalice,"AO.CARD.016","AO.SM.C0182",true);
      const requiemExit={thurifer:elevation("T"),subdeacon:elevation("S")};
      const cOrd=send(chalice,"AO.CARD.016","AO.SM.C0181",false);
      const ordinaryChalice={thurifer:elevation("T"),subdeacon:elevation("S"),
        actor:cOrd.elevationIncenseActor};
      return {ordinary,requiem,restored,
        epistleSource:{before:epiBefore.solemnEpistle,
          start:epiStart.solemnEpistle,holding:epiHolding,
          during:epiDuring.solemnEpistle,end:epiEnding.solemnEpistle,
          after:epiAfter},
        missalTransfer:{prepareBefore:prepareBefore.solemnMissalTransfer,
          transfer:transfer.solemnMissalTransfer,nearMissal,
          leaveTransfer:leaveTransfer.solemnMissalTransfer,
          returned,requiemTransfer:requiemTransfer.solemnMissalTransfer},
        requiemIncense:held.choreography,
        ordinaryIncense:normal.choreography,
        ordinaryElevation,ordinaryExit,requiemHost,
        requiemChalice,requiemExit,ordinaryChalice};
    });
    const ordinaryMinisters={
      D:{visible:true,prop:null},S:{visible:true,prop:"book"},
      T:{visible:true,prop:"thurible"},
      A1:{visible:true,prop:"torch"},A2:{visible:true,prop:"torch"}
    };
    const {ordinaryElevation,ordinaryExit,requiemHost,requiemChalice,
      requiemExit,ordinaryChalice,epistleSource,missalTransfer,
      ...gospelAndOffertory}=conditional;
    assert.equal(epistleSource.before,"SUBDEACON_EPISTOLARIUM_STATIC",
      "The Epistle picture uses the source-owned card, not a missing C0075 clock");
    assert.equal(epistleSource.start,"SUBDEACON_EPISTOLARIUM_STATIC");
    assert.equal(epistleSource.holding.visible,true);
    assert.equal(epistleSource.holding.prop,"book");
    assert.ok(epistleSource.holding.x>0,
      "Source-owned subdeacon Epistle must stay at the Epistle side");
    assert.equal(epistleSource.holding.pose,"stand");
    assert.equal(epistleSource.holding.path,null);
    assert.equal(epistleSource.holding.played,null,
      "The source cue must not trigger a timed Epistle procession");
    assert.equal(epistleSource.during,"SUBDEACON_EPISTOLARIUM_STATIC",
      "Book remains with the subdeacon for the Requiem Epistle");
    assert.equal(epistleSource.end,null,
      "Leaving the Epistle source CARD must release the original prop");
    assert.equal(epistleSource.after,null);
    assert.equal(missalTransfer.prepareBefore,null,
      "A preparatory text before C0081 must not simulate the transfer");
    assert.equal(missalTransfer.transfer,"COMPLETED_TRANSFER_STATIC",
      "Only C0081 may show the subdeacon beside the transferred Missal");
    assert.equal(missalTransfer.nearMissal.x,-1.45);
    assert.equal(missalTransfer.nearMissal.z,.95);
    assert.equal(missalTransfer.nearMissal.pose,"stand");
    assert.equal(missalTransfer.nearMissal.prop,null,
      "Do not draw a second Gospel-side Missal in the subdeacon's hands");
    assert.equal(missalTransfer.nearMissal.path,null,
      "A source focus is not a filmed priest/deacon/subdeacon journey");
    assert.equal(missalTransfer.nearMissal.played,null,
      "C13 does not start Claude's unsourced Missal-transfer animation");
    assert.equal(missalTransfer.leaveTransfer,null);
    assert.ok(missalTransfer.returned.x>=-.1,
      "Leaving C0081 must reset the subdeacon's static position");
    assert.equal(missalTransfer.returned.path,null);
    assert.equal(missalTransfer.requiemTransfer,"COMPLETED_TRANSFER_STATIC",
      "Requiem omits certain rites but not the subdeacon's Missal transfer");
    assert.deepEqual(gospelAndOffertory,{
      ordinary:ordinaryMinisters,
      requiem:{
        D:{visible:true,prop:null},S:{visible:true,prop:null},
        T:{visible:false,prop:null},
        A1:{visible:true,prop:"book"},A2:{visible:true,prop:null}
      },
      restored:ordinaryMinisters,
      requiemIncense:"STATIC_STAGE",
      ordinaryIncense:"SOURCE_TRIGGERED"
    },"The subdeacon holds the ordinary Gospel book; in a Solemn Requiem "+
      "the two unlit acolytes remain to support the book without thurifer "+
      "or the inaccurate ordinary Offertory incense choreography");
    for(const [name,snap] of [
      ["Host ordinary",ordinaryElevation],["Chalice ordinary",ordinaryChalice]
    ]){
      assert.equal(snap.actor,"T",name+" must assign incense to thurifer");
      assert.equal(snap.thurifer.visible,true);
      assert.equal(snap.thurifer.prop,"thurible");
      assert.equal(snap.thurifer.pose,"kneel");
      assert.equal(snap.thurifer.swings,true);
      assert.equal(snap.subdeacon.swings,false,
        name+" cannot animate the subdeacon as the thurifer");
    }
    for(const [name,snap] of [
      ["Host Requiem",requiemHost],["Chalice Requiem",requiemChalice]
    ]){
      assert.equal(snap.actor,"S",
        name+" must assign elevation incense to subdeacon");
      assert.equal(snap.subdeacon.visible,true);
      assert.equal(snap.subdeacon.pose,"kneel");
      assert.equal(snap.subdeacon.prop,"thurible");
      assert.ok(snap.subdeacon.x>0&&snap.subdeacon.z<2.1,
        name+" subdeacon should be on illustrative Epistle side");
      assert.equal(snap.subdeacon.swings,true);
      assert.equal(snap.thurifer.swings,false);
      assert.equal(snap.thurifer.visible,false,
        name+" must not show ordinary thurifer");
    }
    for(const [name,snap] of [
      ["Ordinary Host exit",ordinaryExit],
      ["Requiem Chalice exit",requiemExit]
    ]){
      assert.equal(snap.thurifer.swings,false,
        name+" leaked the source-focused thurible effect");
      assert.equal(snap.subdeacon.swings,false,
        name+" leaked the source-focused thurible effect");
    }
    // Verify the actual sprite, not only its JS prop. Claude's dalmatic
    // rear sprite omits held objects; the adapter uses its existing oblique
    // side sprite so the thurible and three-cycle swing are visibly drawn.
    await frame.evaluate(()=>window.AO_SANCTUARY_EMBED_TEST.present({
      type:"AO_SANCTUARY_CUE_V1",version:1,form:"SOLEMN",
      cardTitle:"Words of Consecration and Elevation · Host",
      sourceSectionId:"AO.CARD.015",sourceCueId:"AO.SM.C0174",
      certifiedSourceFocus:true,requiem:true,scholaOnly:false
    }));
    await frame.waitForFunction(()=>Boolean(M3.actors()?.S?.b?.el
      ?.querySelector(".thur")),null,{timeout:12000});
    const sprite=await frame.evaluate(()=>{
      const thurible=M3.actors().S.b.el.querySelector(".thur");
      return {exists:Boolean(thurible),
        animation:getComputedStyle(thurible).animationName,
        delay:getComputedStyle(thurible).animationDelay,
        actorClass:M3.actors().S.b.el.classList.contains(
          "ao-source-elevation-incense")};
    });
    assert.equal(sprite.exists,true,"Requiem subdeacon thurible was not rendered");
    assert.equal(sprite.animation,"swing2",
      "Requiem must use Claude's original thurible swing artwork");
    assert.equal(sprite.delay,"2.5s",
      "Only the original prototype's elevation reveal owns swing delay");
    assert.equal(sprite.actorClass,true);
    await frame.evaluate(()=>window.AO_SANCTUARY_EMBED_TEST.clear());
    const exited=await frame.evaluate(()=>M3.actors().S.b.el.classList
      .contains("ao-source-elevation-incense"));
    assert.equal(exited,false,"MISSAL clear must remove Requiem incense swing");
  }
  // C57 is a static distribution station. The owner animation also
  // contains a 12-second priest approach: source C0246 DOES NOT own that
  // earlier route. Test the existing M3 priest at the rail and (solemn)
  // deacon's preview-only Communion paten without a moving actor path.
  const communion=await frame.evaluate(form=>{
    const api=window.AO_SANCTUARY_EMBED_TEST;
    const send=(title,section,cue="AO.SM.C0246",requiem=false)=>api.present({
      type:"AO_SANCTUARY_CUE_V1",version:1,
      form,cardTitle:title,sourceSectionId:section,sourceCueId:cue,
      certifiedSourceFocus:true,requiem,scholaOnly:false
    });
    const count=()=>M3.actors()?.D?.b?.el?.querySelectorAll(
      ".ao-sanctuary-communion-paten")?.length??0;
    const before=send("Ecce Agnus Dei · Preparation of the Faithful",
      "AO.CARD.024","AO.SM.C0245");
    const beforeCount=count();
    const distribution=send("Communion of the Faithful","AO.CARD.025");
    const priest=M3.actors().P;
    const deacon=M3.actors()?.D;
    const shown={x:priest.x,z:priest.z,path:priest.path,
      deaconVisible:deacon?.vis===true,
      deaconPath:deacon?.path??null,count:count(),
      card:api.getState()?.card,playedCue:api.getState()?.playedCue};
    const repeat=send("Communion of the Faithful","AO.CARD.025");
    const repeatCount=count();
    const otherCue=send("Communion of the Faithful",
      "AO.CARD.025","AO.SM.C0245");
    const otherCueCount=count();
    const wrongSource=send("Communion of the Faithful","AO.CARD.024");
    const wrongCount=count();
    const requiem=send("Communion of the Faithful",
      "AO.CARD.025","AO.SM.C0246",true);
    const requiemCount=count();
    const after=send("Ablutions","AO.CARD.026","AO.SM.C0247");
    const afterCount=count();
    const clear=api.clear();
    return {form,before:before.communionStation,beforeCount,
      station:distribution.communionStation,
      choreography:distribution.choreography,shown,
      repeat:repeat.communionStation,repeatCount,
      otherCue:otherCue.communionStation,otherCueCount,
      wrongSource:wrongSource.communionStation,wrongCount,
      requiem:requiem.communionStation,requiemCount,
      after:after.communionStation,afterCount,
      clear:clear.code};
  },form);
  assert.equal(communion.before,null);
  assert.equal(communion.beforeCount,0);
  assert.equal(communion.station,"AT_RAIL_STATIC");
  assert.equal(communion.choreography,"STATIC_STAGE",
    "C0246 is distribution, never an earlier priest route trigger");
  assert.equal(communion.shown.card,"C57");
  assert.equal(communion.shown.z,4.36);
  assert.equal(communion.shown.path,null,
    "C57 must not create an unsourced priest approach path");
  assert.equal(communion.shown.deaconPath,null);
  assert.equal(communion.shown.playedCue,null);
  assert.equal(communion.repeat,"AT_RAIL_STATIC");
  assert.equal(communion.otherCue,"AT_RAIL_STATIC",
    "Static C57 scene depends on the source card, not false timed cues");
  assert.equal(communion.wrongSource,null);
  assert.equal(communion.wrongCount,0,
    "Wrong source macro must not retain deacon paten");
  assert.equal(communion.requiem,"AT_RAIL_STATIC");
  assert.equal(communion.after,null);
  assert.equal(communion.afterCount,0);
  assert.equal(communion.clear,"SOURCE_VISUAL_CLEARED");
  const solemnPaten=form==="SOLEMN"?1:0;
  assert.equal(communion.shown.count,solemnPaten);
  assert.equal(communion.repeatCount,solemnPaten,
    "Repeated C57 focus must not add multiple patens");
  assert.equal(communion.otherCueCount,solemnPaten);
  assert.equal(communion.requiemCount,solemnPaten,
    "Requiem still has the Solemn deacon assisting at Communion");
  // The canonical MC-COM-320 is a non-text E64 source event:
  // its "distribution concludes / priest returns" label may move
  // the original priest actor toward the altar. Neither C0246 text,
  // MC-COM-305 SCHOLA nor MC-COM-300/310 distribution starts a route.
  const returnAudit=await frame.evaluate(form=>{
    const api=window.AO_SANCTUARY_EMBED_TEST;
    const message=(eventId=null,section="AO.CARD.025",requiem=false)=>({
      type:"AO_SANCTUARY_CUE_V1",version:1,
      form,cardTitle:"Communion of the Faithful",sourceSectionId:section,
      sourceCueId:"AO.SM.C0246",certifiedSourceFocus:true,
      canonicalCommunionEventId:eventId,requiem,scholaOnly:false
    });
    const send=(...args)=>api.present(message(...args));
    const path=()=>M3.actors()?.P?.path?.pts?.map(p=>[...p])??null;
    const count=()=>M3.actors()?.D?.b?.el?.querySelectorAll(
      ".ao-sanctuary-communion-paten")?.length??0;
    const begin=send("MC-COM-300"),beginPath=path();
    const during=send("MC-COM-310"),duringPath=path();
    const antiphon=send("MC-COM-305"),antiphonPath=path();
    const lacking=send(null),lackingPath=path();
    const back=send("MC-COM-320"),backPath=path(),backPaten=count();
    const repeats=send("MC-COM-320"),repeatPath=path();
    const unknownAfterReturn=send(null),heldPath=path();
    const rewound=send("MC-COM-310"),rewoundPath=path();
    const sourceWrong=send("MC-COM-320","AO.CARD.024");
    const wrongPath=path();
    const validAgain=send("MC-COM-320"),againPath=path();
    const requiemAgain=send("MC-COM-320","AO.CARD.025",true);
    const reqPath=path();
    const clear=api.clear();
    return {form,
      begin:begin.communionStation,beginPath,
      during:during.communionStation,duringPath,
      antiphon:antiphon.canonicalCommunionEventId,antiphonPath,
      lacking:lacking.communionReturnTriggered,lackingPath,
      back:back.communionStation,triggered:back.communionReturnTriggered,
      backPaten,backPath,
      repeats:repeats.communionReturnTriggered,repeatPath,
      unknownAfterReturn:unknownAfterReturn.communionReturnTriggered,heldPath,
      rewound:rewound.communionStation,rewoundPath,
      sourceWrong:sourceWrong.communionStation,wrongPath,
      validAgain:validAgain.communionReturnTriggered,againPath,
      requiemAgain:requiemAgain.communionReturnTriggered,reqPath,
      afterClear:api.getState().card,
      clear:clear.code};
  },form);
  assert.equal(returnAudit.begin,"AT_RAIL_STATIC");
  assert.equal(returnAudit.during,"AT_RAIL_STATIC");
  assert.equal(returnAudit.antiphon,null,
    "Independent Communion Schola event cannot stage priest movement");
  assert.equal(returnAudit.lacking,false,
    "C0246 text with no native event is never a movement start");
  assert.equal(returnAudit.beginPath,null);
  assert.equal(returnAudit.duringPath,null);
  assert.equal(returnAudit.antiphonPath,null);
  assert.equal(returnAudit.lackingPath,null);
  assert.equal(returnAudit.rewoundPath,null,
    "Back to distribution event must cancel priest's return path");
  assert.equal(returnAudit.wrongPath,null,
    "Wrong source macro must not animate a return");
  assert.equal(returnAudit.sourceWrong,null);
  assert.equal(returnAudit.clear,"SOURCE_VISUAL_CLEARED");
  assert.equal(returnAudit.afterClear,undefined);
  if(["SOLEMN","LOW"].includes(form)){
    assert.equal(returnAudit.back,"PRIEST_RETURN_SOURCE_EVENT");
    assert.equal(returnAudit.triggered,true);
    assert.deepEqual(returnAudit.backPath,
      [[0,4.36],[0,2.05],[0,.4]],
      "The source return must follow original sanctuary rail-foot-altar stations");
    assert.equal(returnAudit.backPaten,0,
      "Solemn paten must be removed when distribution concludes");
    assert.equal(returnAudit.repeats,false,
      "A repeated source event must not restart the journey");
    assert.deepEqual(returnAudit.repeatPath,returnAudit.backPath);
    assert.equal(returnAudit.unknownAfterReturn,false,
      "Lack of event refresh must not trigger another return");
    assert.deepEqual(returnAudit.heldPath,returnAudit.backPath,
      "Transient event loss must not abort the begun priest return");
    assert.equal(returnAudit.rewound,"AT_RAIL_STATIC");
    assert.equal(returnAudit.validAgain,true,
      "Rewinding into distribution must re-arm explicit source return");
    assert.deepEqual(returnAudit.againPath,returnAudit.backPath);
    assert.equal(returnAudit.requiemAgain,true,
      "Requiem form transition must re-arm the return source event");
    assert.deepEqual(returnAudit.reqPath,returnAudit.backPath);
  }else{
    assert.equal(returnAudit.back,"AT_RAIL_STATIC");
    assert.equal(returnAudit.triggered,false,
      "Uncertified Sung-source variant must not borrow Solemn event");
    assert.equal(returnAudit.backPath,null);
    assert.equal(returnAudit.repeats,false);
    assert.equal(returnAudit.repeatPath,null);
    assert.equal(returnAudit.heldPath,null);
    assert.equal(returnAudit.validAgain,false);
    assert.equal(returnAudit.againPath,null);
    assert.equal(returnAudit.requiemAgain,false);
  }
  // Check the original owner's M3 actor tick actually animates
  // the canonically triggered RETURN, not merely stores a route array.
  // This is a preview illustration, not a clock or observed priest event.
  if(form==="SOLEMN"&&width===390){
    const started=await frame.evaluate(()=>{
      const api=window.AO_SANCTUARY_EMBED_TEST;
      const result=api.present({
        type:"AO_SANCTUARY_CUE_V1",version:1,
        form:"SOLEMN",cardTitle:"Communion of the Faithful",
        sourceSectionId:"AO.CARD.025",sourceCueId:"AO.SM.C0246",
        certifiedSourceFocus:true,
        canonicalCommunionEventId:"MC-COM-320",scholaOnly:false
      });
      const p=M3.actors().P;
      return {triggered:result.communionReturnTriggered,x:p.x,z:p.z,
        path:Boolean(p.path)};
    });
    assert.equal(started.triggered,true);
    assert.equal(started.path,true);
    await page.waitForTimeout(450);
    const moving=await frame.evaluate(()=>{
      const p=M3.actors().P;
      return {x:p.x,z:p.z,path:Boolean(p.path),
        walking:p.b.el.classList.contains("walking")};
    });
    // The owner's C57 station is at x=-2.3, z=4.36, the last
    // communicant's side of the rail. The source-triggered return
    // first moves laterally to the centre at x=0, then down the aisle
    // towards the altar. Assert actual movement on the FIRST leg,
    // not premature depth movement while still at the rail.
    assert.ok(moving.x>started.x+.1 &&
      Math.abs(moving.z-started.z)<.1,
      "Original M3 must begin returning along the centre-rail first leg: "+
      JSON.stringify({started,moving}));
    assert.equal(moving.path,true);
    assert.equal(moving.walking,true,
      "Returning priest must use original M3 walking sprite");
    await frame.evaluate(()=>window.AO_SANCTUARY_EMBED_TEST.clear());
    assert.equal(await frame.evaluate(()=>M3.actors().P.path),null,
      "LIVE→MISSAL clear must halt the physically advancing actor");
  }
  const model=await page.evaluate(()=>{
   const api=window.__AO_PHONE_PREVIEW;
   if(api?.model?.totalCards!==65)throw Error("Canonical 65 LIVE cards missing");
   api.showSequence(5);
   return api.model.totalCards;
  });
  assert.equal(model,65);
  await frame.waitForFunction(()=>window.AO_SANCTUARY_EMBED_TEST
    ?.getState()?.card==="C05",null,{timeout:12000});
  const before=await page.evaluate(()=>{
   const reader=document.querySelector(".ao-prayer-card");
   return {
    latinLength:reader?.textContent?.length??0,
    readHeight:reader?.clientHeight??0,
    visualHeight:document.querySelector(".ao-sanctuary-window")?.getBoundingClientRect().height??0,
    visualWidth:document.querySelector(".ao-sanctuary-window")?.getBoundingClientRect().width??0,
    readWidth:reader?.clientWidth??0,
    left:document.querySelectorAll(".ao-rail-left .ao-rail-item").length,
    right:document.querySelectorAll(".ao-rail-right .ao-rail-item").length
   };
  });
  assert.ok(before.latinLength>100&&before.readHeight>90,
   "Sanctuary displaced the canonical Mass text: "+JSON.stringify({form,width,height,before}));
  if(width>height&&height<=540)
   assert.ok(before.readWidth>360&&before.visualWidth>=150,
    "Landscape sanctuary must share width, not consume the reader's vertical space");
  assert.ok(before.left>=3&&before.right>=3,"Dynamic icon rails disappeared");
  const grip=page.locator(".ao-sanctuary-resize"),rect=await grip.boundingBox();
  assert.ok(rect&&rect.height>0,"Resizable original sanctuary absent");
  const x=rect.x+rect.width/2,y=rect.y+rect.height/2;
  const sideways=width>height&&height<=540;
  const hit=await page.evaluate(({x,y})=>{
    const grip=document.querySelector(".ao-sanctuary-resize");
    const at=document.elementFromPoint(x,y);
    return {onGrip:Boolean(grip&&(grip===at||grip.contains(at))),
      target:at?.className??at?.tagName,
      orientation:grip?.getAttribute("aria-orientation")};
  },{x,y});
  assert.equal(hit.onGrip,true,
    "The Schola dock or iframe obscures the actual sanctuary resize handle: "+
     JSON.stringify({form,width,height,rect,hit}));
  assert.equal(hit.orientation,sideways?"vertical":"horizontal",
    "Resize grip must expose correct portrait/landscape orientation");
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+(sideways?-35:0),y+(sideways?0:-35),{steps:5});await page.mouse.up();
  const after=await page.evaluate(()=>({
   height:document.querySelector(".ao-sanctuary-window")?.getBoundingClientRect().height??0,
   width:document.querySelector(".ao-sanctuary-window")?.getBoundingClientRect().width??0,
   prayer:document.querySelector(".ao-prayer-card")?.clientHeight??0,
   left:document.querySelectorAll(".ao-rail-left .ao-rail-item").length,
   right:document.querySelectorAll(".ao-rail-right .ao-rail-item").length
  }));
  assert.ok(sideways
    ? Math.abs(after.width-before.visualWidth)>8
    : Math.abs(after.height-before.visualHeight)>8,
   "Resizing must change picture size instead of covering the prayer pane: "+
      JSON.stringify({form,width,height,before,after}));
  assert.ok(after.prayer>90&&after.left===before.left&&after.right===before.right);
  const original=await frame.evaluate(()=>window.AO_SANCTUARY_EMBED_TEST.getState());
  const improper=await frame.evaluate(()=>window.AO_SANCTUARY_EMBED_TEST.present({
   type:"AO_SANCTUARY_CUE_V1",version:1,form:"SOLEMN",
   cardTitle:"Offertory · Incensation",sourceSectionId:"AO.CARD.010",
   scholaOnly:true
  }));
  assert.equal(improper.ok,false,"Proper Schola gesture triggered sanctuary movement");
  assert.deepEqual(await frame.evaluate(()=>
    window.AO_SANCTUARY_EMBED_TEST.getState()),original,
    "Schola-only cue must not even select a different sanctuary scene");
  if((form==="LOW"&&width===320)||
     (form==="MISSA_CANTATA_SIMPLE"&&width===390)){
    // Both LOW and simple SUNG have a source-certified C24 state-only
    // no-incense placeholder. It is not a priest action. Stage only
    // the original adjacent altar still and keep the native card ID.
    const lowCard=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const hits=api.model.cards.filter(c=>
        /incensation omitted|offertory.*incens/i.test(c.title??"")&&
        c.sourceSectionId==="AO.CARD.010");
      if(hits.length!==1)return {matches:hits.map(c=>c.title)};
      api.showSequence(hits[0].sequence);
      return {matches:1,sequence:hits[0].sequence,title:hits[0].title,
        stateOnly:hits[0].stateOnly,sectionId:hits[0].sectionId,
        sourceSectionId:hits[0].sourceSectionId,
        selected:api.getCurrentCard()?.title};
    });
    assert.equal(lowCard.matches,1,
      "No-incense C24 omission must map to one native source card");
    assert.equal(lowCard.stateOnly,true,
      "The canonical omitted block has no prayer, never an observed action");
    assert.equal(lowCard.title,"Incensation omitted for this Mass");
    assert.equal(lowCard.sectionId,"AO.LIVECURATED.AO.CARD.010.5");
    await frame.waitForFunction(()=>{
      const a=window.AO_SANCTUARY_EMBED_TEST?.getState?.();
      return a?.card==="C24"&&a?.noIncenseOmitted===true;
    },null,{timeout:12000});
    const actualState=await frame.evaluate(()=>
      window.AO_SANCTUARY_EMBED_TEST?.getState?.());
    const parentState=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const region=document.querySelector(".ao-sanctuary-window");
      return {card:api.getCurrentCard()?.title,
        source:api.getCurrentCard()?.sourceSectionId,
        stateOnly:api.getCurrentCard()?.stateOnly,
        previewHidden:region?.hidden,
        activeCue:api.getActiveCue?.()};
    });
    assert.equal(parentState.previewHidden,false,
      "Exactly certified omitted-incense state-only card may show a still stage");
    assert.ok(actualState?.card==="C24"&&actualState?.noIncenseOmitted===true,
      "No-incense C24 source-to-visual handoff failed: "+
      JSON.stringify({lowCard,parentState,actualState}));
    assert.equal(actualState.lowIncenseOmitted,form==="LOW",
      "Low-only classification must not spill into Sung");
    const stage=await frame.evaluate(()=>{
      const a=window.AO_SANCTUARY_EMBED_TEST.getState(),p=M3.actors().P;
      return {card:a.card,visual:a.visualCardId,pose:p.pose,x:p.x,z:p.z,
        path:p.path,shot:M3.shot(),playedCue:a.playedCue};
    });
    assert.equal(stage.card,"C24");
    assert.equal(stage.visual,"C23");
    assert.equal(stage.path,null);
    assert.equal(stage.playedCue,null);
    assert.equal(stage.z,.4,
      "No-incense priest must remain at the ALTAR, not foot");
    assert.equal(stage.shot,"server",
      "No-incense C24 uses original preceding altar-side Offertory shot");
    await page.evaluate(sequence=>
      window.__AO_PHONE_PREVIEW.showSequence(sequence+1),lowCard.sequence);
    await frame.waitForFunction(()=>{
      const a=window.AO_SANCTUARY_EMBED_TEST?.getState?.();
      return a?.card==="C25"&&a?.noIncenseOmitted===false;
    },null,{timeout:12000});
  }
  if(form==="MISSA_CANTATA_SIMPLE"&&width===390){
    await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(x=>
        x.title==="Gloria · Praise and Supplication");
      if(!card)throw Error("Canonical Gloria sedilia card missing");
      api.showSequence(card.sequence);
    });
    await frame.waitForFunction(()=>window.AO_SANCTUARY_EMBED_TEST
      ?.getState()?.card==="C08",null,{timeout:12000});
    const acolyte=await frame.evaluate(()=>{
      const a=M3.actors().M,p=M3.actors().P;
      return {visible:a?.vis,pose:a?.pose,x:a?.x,z:a?.z,
        priestPose:p?.pose,priestX:p?.x,priestZ:p?.z,
        priestSeatHeight:p?.b?.h,
        stage:window.AO_SANCTUARY_EMBED_TEST.getState()?.sediliaStage};
    });
    assert.equal(acolyte.visible,true);
    assert.equal(acolyte.pose,"stand",
      "Sung Mass acolyte must not kneel while the celebrant sits");
    assert.ok(acolyte.x>2.1&&acolyte.x<2.7&&acolyte.z>1.5,
      "Existing server must STAND away from the celebrant's seated silhouette");
    assert.equal(acolyte.priestPose,"sit");
    assert.equal(acolyte.priestX,4.04,
      "The original seated celebrant sprite must align with the actual bench");
    assert.ok(acolyte.priestSeatHeight>.4);
    assert.equal(acolyte.stage,"ORIGINAL_SEDILIA_SEATED");
    await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSequence(5));
    await frame.waitForFunction(()=>window.AO_SANCTUARY_EMBED_TEST
      ?.getState()?.card==="C05",null,{timeout:12000});
  }
  if(form==="MISSA_CANTATA_SIMPLE"&&width===390){
    for(const {enter,exit,scene,owner} of [
      {enter:"AO.SM.C0174",exit:"AO.SM.C0173",scene:"C36",owner:"AO.CARD.015"},
      {enter:"AO.SM.C0181",exit:"AO.SM.C0179",scene:"C38",owner:"AO.CARD.016"}
    ]){
      const incoming=await focusNativeSourceCue(page,enter);
      assert.equal(incoming.found,true,
        "Real source focus failed for elevation: "+JSON.stringify(incoming));
      assert.equal(incoming.sourceSectionId,owner,
        "Native source parent changed for "+enter);
      await frame.waitForFunction(({cue,card,section})=>{
        const state=window.AO_SANCTUARY_EMBED_TEST?.getState?.();
        return state?.card===card&&state?.playedCue===cue&&
          state?.sourceSectionId===section;
      },{cue:enter,card:scene,section:owner},{timeout:12000});
      const leaving=await focusNativeSourceCue(page,exit);
      assert.equal(leaving.found,true,
        "Real source focus failed on exit: "+JSON.stringify(leaving));
      await frame.waitForFunction(()=>{
        const api=window.AO_SANCTUARY_EMBED_TEST;
        const fx=api?.getVisualFx?.();
        return api?.getState?.()?.playedCue===null&&
          fx?.elevationStage===false&&fx?.elevationGlowVisible===false;
      },null,{timeout:12000});
      const returning=await focusNativeSourceCue(page,enter);
      assert.equal(returning.found,true,
        "Real reader cannot re-enter elevation cue: "+JSON.stringify(returning));
      await frame.waitForFunction(cue=>
        window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.playedCue===cue,
        enter,{timeout:12000});
    }
    await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSequence(5));
    await frame.waitForFunction(()=>window.AO_SANCTUARY_EMBED_TEST
      ?.getState()?.card==="C05",null,{timeout:12000});
  }
  // C11 has no native C0075 paragraph focus in the curated 65-card
  // model: verify real card navigation and source macro instead. This
  // MUST NOT forge a new cue, passage, movement or Schola timing.
  if(form==="SOLEMN"&&width===390){
    const epistle=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(c=>
        c.sourceSectionId==="AO.CARD.005" && /Epistle/.test(c.title));
      if(!card)return null;
      api.showSequence(card.sequence);
      return {sequence:card.sequence,source:card.sourceSectionId};
    });
    assert.ok(epistle&&epistle.source==="AO.CARD.005",
      "C11 must exist as the actual curated native Epistle card");
    await frame.waitForFunction(()=>
      window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.solemnEpistle===true,
      null,{timeout:12000});
    const atEpistle=await frame.evaluate(()=>{
      const a=M3.actors().S;
      return {id:window.AO_SANCTUARY_EMBED_TEST.getState().card,
        x:a.x,pose:a.pose,prop:a.prop,path:a.path};
    });
    assert.equal(atEpistle.id,"C11");
    assert.ok(atEpistle.x>0);
    assert.equal(atEpistle.pose,"stand");
    assert.equal(atEpistle.prop,"book");
    assert.equal(atEpistle.path,null);
    await page.evaluate(sequence=>
      window.__AO_PHONE_PREVIEW.showSequence(sequence+1),epistle.sequence);
    await frame.waitForFunction(()=>
      window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.solemnEpistle!==true,
      null,{timeout:12000});
    assert.equal(await frame.evaluate(()=>M3.actors().S?.prop??null),null,
      "Leaving native C11 must release the Epistolarium prop");
  }
  // The regular source focus owner, not a test-only direct bridge call,
  // must project C0081 to the static subdeacon-at-Gospel-side scene.
  if(form==="SOLEMN"&&width===390){
    const transfer=await focusNativeSourceCue(page,"AO.SM.C0081");
    assert.equal(transfer.found,true,
      "C13 lacks source-focus authority for Solemn subdeacon Missal arrival: "+
      JSON.stringify(transfer));
    await frame.waitForFunction(()=>
      window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.solemnMissalTransfer===true,
      null,{timeout:12000});
    const atMissal=await frame.evaluate(()=>{
      const a=M3.actors().S;
      return {id:window.AO_SANCTUARY_EMBED_TEST.getState().card,
        x:a.x,pose:a.pose,path:a.path,prop:a.prop};
    });
    assert.deepEqual(atMissal,{id:"C13",x:-1.45,pose:"stand",path:null,prop:null});
    const leaving=await focusNativeSourceCue(page,"AO.SM.C0082");
    assert.equal(leaving.found,true,
      "C13 Missal stage did not hand off to the Gospel source cue: "+
      JSON.stringify(leaving));
    await frame.waitForFunction(()=>
      window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.solemnMissalTransfer!==true,
      null,{timeout:12000});
  }
  // Actual native C57 card handoff: priest is already at the rail,
  // Solemn deacon holds the static paten, the next card removes it.
  // This is not permission to run Claude's timed Communion approach.
  if(form==="SOLEMN"&&width===390){
    const railCard=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const matches=api.model.cards.filter(c=>
        c.title==="Communion of the Faithful"&&
        c.sourceSectionId==="AO.CARD.025");
      if(matches.length!==1)return {matches:matches.length};
      api.showSequence(matches[0].sequence);
      return {matches:1,sequence:matches[0].sequence};
    });
    assert.equal(railCard.matches,1,
      "Actual C57 source card missing from native 65-card model");
    await frame.waitForFunction(()=>{
      const api=window.AO_SANCTUARY_EMBED_TEST;
      return api?.getState?.()?.card==="C57"&&
        api.getState().communionStation==="AT_RAIL_STATIC";
    },null,{timeout:12000});
    const actual=await frame.evaluate(()=>{
      const priest=M3.actors().P,deacon=M3.actors().D;
      return {priestX:priest.x,priestZ:priest.z,
        priestPath:priest.path,playedCue:window
          .AO_SANCTUARY_EMBED_TEST.getState().playedCue,
        deaconVisible:deacon.vis,
        patenCount:deacon.b.el.querySelectorAll(
          ".ao-sanctuary-communion-paten").length};
    });
    assert.equal(actual.priestZ,4.36);
    assert.equal(actual.priestPath,null);
    assert.equal(actual.playedCue,null,
      "Real Communion distribution may not trigger the earlier approach");
    assert.equal(actual.deaconVisible,true);
    assert.equal(actual.patenCount,1);
    // End-to-end: the ACTUAL native 65-card LIVE reader (not a direct
    // iframe message) owns the explicit MC-COM-320 human observation.
    // A source card, Schola turn or incomplete witness must never infer it.
    const observedInput={eventId:"MC-COM-320",actor:"PRIEST",
      action:"RETURN_TO_ALTAR",observed:true};
    const beforeWitness=await page.evaluate(input=>{
      const api=window.__AO_PHONE_PREVIEW;
      return {partial:api.observeCommunionReturn({...input,observed:false}),
        choir:api.observeCommunionReturn({...input,eventId:"MC-COM-305"}),
        wrongActor:api.observeCommunionReturn({...input,actor:"SCHOLA"}),
        state:api.getObservedCommunionReturn()};
    },observedInput);
    for(const key of ["partial","choir","wrongActor"])
      assert.equal(beforeWitness[key].accepted,false,
        key+" must not create a priest-return observation");
    assert.equal(beforeWitness.state,null);
    assert.equal(await frame.evaluate(()=>M3.actors().P.path),null);
    const observed=await page.evaluate(input=>
      window.__AO_PHONE_PREVIEW.observeCommunionReturn(input),observedInput);
    assert.equal(observed.accepted,true,
      "Observed Tier-A E64 priest return must be accepted on actual C57");
    assert.equal(observed.duplicate,false);
    await frame.waitForFunction(()=>{
      const state=window.AO_SANCTUARY_EMBED_TEST?.getState?.();
      return state?.card==="C57"&&state?.communionReturnActive===true&&
        M3.actors()?.P?.path!=null;
    },null,{timeout:12000});
    const repeat=await page.evaluate(input=>
      window.__AO_PHONE_PREVIEW.observeCommunionReturn(input),observedInput);
    assert.equal(repeat.duplicate,true,
      "Repeated human observation must not restart priest return");
    const cancelled=await page.evaluate(()=>
      window.__AO_PHONE_PREVIEW.clearObservedCommunionReturn());
    assert.equal(cancelled.cleared,true);
    await frame.waitForFunction(()=>{
      const state=window.AO_SANCTUARY_EMBED_TEST?.getState?.();
      return state?.card==="C57"&&state?.communionReturnActive===false&&
        M3.actors()?.P?.path==null;
    },null,{timeout:12000});
    assert.equal(await frame.evaluate(()=>M3.actors().P.z),4.36,
      "Explicit cancellation must restore the original rail still frame");
    const observedAgain=await page.evaluate(input=>
      window.__AO_PHONE_PREVIEW.observeCommunionReturn(input),observedInput);
    assert.equal(observedAgain.accepted,true);
    assert.equal(observedAgain.duplicate,false);
    await frame.waitForFunction(()=>Boolean(M3.actors()?.P?.path),
      null,{timeout:12000});
    await page.evaluate(()=>
      window.__AO_PHONE_PREVIEW.setPresentationMode("MISSAL"));
    assert.equal(await page.evaluate(()=>
      window.__AO_PHONE_PREVIEW.getObservedCommunionReturn()),null,
      "LIVE→MISSAL must invalidate a previously witnessed return");
    await page.evaluate(()=>
      window.__AO_PHONE_PREVIEW.setPresentationMode("LIVE"));
    await frame.waitForFunction(()=>{
      const state=window.AO_SANCTUARY_EMBED_TEST?.getState?.();
      return state?.card==="C57"&&state?.communionReturnActive!==true;
    },null,{timeout:12000});
    assert.equal(await frame.evaluate(()=>M3.actors().P.path),null,
      "MISSAL→LIVE must not replay a previous observed return");
    await page.evaluate(sequence=>
      window.__AO_PHONE_PREVIEW.showSequence(sequence+1),railCard.sequence);
    await frame.waitForFunction(()=>
      window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.card==="C58",
      null,{timeout:12000});
    assert.equal(await frame.evaluate(()=>M3.actors().D?.b?.el
      ?.querySelectorAll(".ao-sanctuary-communion-paten")?.length??0),0,
      "Native C57→C58 exit must remove the Communion paten");
    const outside=await page.evaluate(input=>
      window.__AO_PHONE_PREVIEW.observeCommunionReturn(input),observedInput);
    assert.equal(outside.accepted,false,
      "Changing to C58 must forbid a stale priest return observation");
  }
  // Real native reader scroll, not a direct test-only present() call:
  // the original Offertory incense sequence spans four 1962 priest cues.
  // Scrolling through C0122-C0124 must not truncate the original C24
  // actor/smoke keyframes or re-start the motion at each prayer.
  if(form==="SOLEMN"&&width===390){
    const entering=await focusNativeSourceCue(page,"AO.SM.C0121");
    assert.equal(entering.found,true,"No native incense start focus: "+
      JSON.stringify(entering));
    assert.equal(entering.sourceSectionId,"AO.CARD.010");
    await frame.waitForFunction(()=>
      window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.playedCue==="AO.SM.C0121",
      null,{timeout:12000});
    for(const continuation of ["AO.SM.C0122","AO.SM.C0123","AO.SM.C0124"]){
      const state=await focusNativeSourceCue(page,continuation);
      assert.equal(state.found,true,
        "Cannot focus continuing incense prayer "+continuation+": "+
        JSON.stringify(state));
      await frame.waitForFunction(cue=>{
        const s=window.AO_SANCTUARY_EMBED_TEST?.getState?.();
        return s?.card==="C24"&&s?.cue===cue&&
          s?.playedCue==="AO.SM.C0121";
      },continuation,{timeout:12000});
    }
    const leaving=await focusNativeSourceCue(page,"AO.SM.C0125");
    assert.equal(leaving.found,true,"No source-owned exit into Lavabo: "+
      JSON.stringify(leaving));
    await frame.waitForFunction(()=>{
      const state=window.AO_SANCTUARY_EMBED_TEST?.getState?.();
      return state?.card==="C25"&&!state.playedCue;
    },null,{timeout:12000});
    const returning=await focusNativeSourceCue(page,"AO.SM.C0121");
    assert.equal(returning.found,true,
      "Cannot return to initial incense source cue: "+JSON.stringify(returning));
    await frame.waitForFunction(()=>
      window.AO_SANCTUARY_EMBED_TEST?.getState?.()?.playedCue==="AO.SM.C0121",
      null,{timeout:12000});
  }
  // The original animated scene must re-arm its exact action when a
  // source-focused rubric exits and the reader later scrolls back into it.
  // These are isolated bridge probes, not invented priest observations.
  await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    // Find by the real 1962 certified cue, not display-title punctuation:
    // the 65-card reader's source identity is the only acceptable owner.
    const cue="AO.SM.C0174";
    const candidates=api.model.cards.filter(x=>
      (x.paragraphs??[]).some(p=>(p.sourceCueIds??[]).includes(cue)));
    if(candidates.length!==1)throw Error(
      "Canonical Host elevation cue must identify exactly one reader card: "+
      JSON.stringify(candidates.map(x=>({title:x.title,sectionId:x.sectionId,
        sourceSectionId:x.sourceSectionId}))));
    const c=candidates[0];
    if((c.sourceSectionId??c.sectionId)!=="AO.CARD.015")
      throw Error("Host elevation source section drifted: "+
        JSON.stringify({title:c.title,sectionId:c.sectionId,
          sourceSectionId:c.sourceSectionId}));
    api.showSequence(c.sequence);
    const chalice=api.model.cards.filter(x=>
      (x.paragraphs??[]).some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0181")));
    if(chalice.length!==1)throw Error("Chalice source cue card count="+chalice.length);
    if((chalice[0].sourceSectionId??chalice[0].sectionId)!=="AO.CARD.016")
      throw Error("Chalice elevation canonical macro unexpected: "+
        JSON.stringify({title:chalice[0].title,
          sectionId:chalice[0].sectionId,
          sourceSectionId:chalice[0].sourceSectionId}));
  });
  await frame.waitForFunction(()=>window.AO_SANCTUARY_EMBED_TEST
    ?.getState()?.card==="C36",null,{timeout:12000});
  const rearm=await frame.evaluate(()=>{
    const api=window.AO_SANCTUARY_EMBED_TEST;
    const event=(cue,certified=true)=>api.present({
      type:"AO_SANCTUARY_CUE_V1",version:1,form:"SOLEMN",
      sourceSectionId:"AO.CARD.015",
      cardTitle:"Words of Consecration and Elevation · Host",
      sourceCueId:cue,certifiedSourceFocus:certified,scholaOnly:false
    });
    const enter=event("AO.SM.C0174");
    const held=event("AO.SM.C0174");
    const exit=event("AO.SM.C0175");
    const fx=api.getVisualFx();
    const dormant=!fx.elevationGlowVisible;
    const classOff=!fx.elevationStage;
    const again=event("AO.SM.C0174");
    return {enter:enter.choreography,held:held.choreography,
      exit:exit.choreography,again:again.choreography,
      dormant,classOff};
  });
  assert.deepEqual(rearm,{
    enter:"SOURCE_TRIGGERED",held:"STATIC_STAGE",
    exit:"STATIC_STAGE",again:"SOURCE_TRIGGERED",
    dormant:true,classOff:true
  },"Returning to source-owned rubric must re-arm original 3D animation");
  const next=await frame.evaluate(()=>window.AO_SANCTUARY_EMBED_TEST.getState());
  assert.equal(next.card,"C36");
  await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    const cards=api.model.cards.filter(c=>
      (c.paragraphs??[]).some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0181")));
    if(cards.length!==1||cards[0].sourceSectionId!=="AO.CARD.016")
      throw Error("Chalice elevation has no unique certified Canon source");
    api.showSequence(cards[0].sequence);
  });
  await frame.waitForFunction(()=>window.AO_SANCTUARY_EMBED_TEST
    ?.getState()?.card==="C38",null,{timeout:12000});
  const chaliceRearm=await frame.evaluate(()=>{
    const api=window.AO_SANCTUARY_EMBED_TEST;
    const move=cue=>api.present({
      type:"AO_SANCTUARY_CUE_V1",version:1,
      form:"SOLEMN",
      cardTitle:"Words of Consecration and Elevation · Chalice",
      sourceSectionId:"AO.CARD.016",sourceCueId:cue,
      certifiedSourceFocus:true,scholaOnly:false
    });
    const enter=move("AO.SM.C0181");
    const exit=move("AO.SM.C0182");
    const dormant=api.getVisualFx();
    const replay=move("AO.SM.C0181");
    return {enter:enter.choreography,exit:exit.choreography,
      replay:replay.choreography,dormant};
  });
  assert.deepEqual(chaliceRearm,{
    enter:"SOURCE_TRIGGERED",exit:"STATIC_STAGE",replay:"SOURCE_TRIGGERED",
    dormant:{elevationStage:false,elevationGlowVisible:false}
  },"Chalice elevation enter/exit/replay must remain source-owned");
  const switched=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    api.setPresentationMode("MISSAL");
    const region=document.querySelector(".ao-sanctuary-window");
    const shell=document.querySelector(".ao-reader-shell");
    return {mode:api.model.presentationMode,hidden:region?.hidden,
      active:shell?.classList.contains("ao-sanctuary-preview")};
  });
  assert.equal(switched.mode,"MISSAL");
  assert.equal(switched.hidden,true,"Missal must hide animated sanctuary");
  assert.equal(switched.active,false,"Missal must restore original reader geometry");
  // The old iframe remains mounted. Hiding it without a source CLEAR
  // would leave the previous Host/Chalice/Incense keyframes running.
  await frame.waitForFunction(()=>{
    const api=window.AO_SANCTUARY_EMBED_TEST;
    const fx=api?.getVisualFx?.();
    return api?.getState?.()?.card===undefined&&
      fx?.elevationStage===false&&fx?.elevationGlowVisible===false;
  },null,{timeout:12000});
  const restored=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    api.setPresentationMode("LIVE");
    const region=document.querySelector(".ao-sanctuary-window");
    return {mode:api.model.presentationMode,hidden:region?.hidden};
  });
  assert.equal(restored.mode,"LIVE");
  assert.equal(restored.hidden,false,"LIVE must restore source-linked sanctuary");
  if(width===390)await page.screenshot({path:resolve(shots,form+"-390.png"),
   animations:"disabled"});
  assert.deepEqual(errors,[],"Native LIVE browser errors "+form+" "+width);
  console.log("SANCTUARY_NATIVE_LIVE_PASS="+JSON.stringify({
   form,width,height,scene:next.card,
   intactText:true,iconRails:true,scrollSeparation:true}));
  await page.close();
 }
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
