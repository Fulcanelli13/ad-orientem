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
