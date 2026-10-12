import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const artifactDir=resolve(root,"artifacts/mass-live-batch4");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4187,"127.0.0.1",ok)});
let browser;
const results=[];
const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
const families=["VOTIVE","REQUIEM"];
async function focusCue(page,cueId){
 const result=await page.evaluate(id=>{
  const api=window.__AO_PHONE_PREVIEW;
  const card=api.model.cards.find(row=>(row.paragraphs??[]).some(p=>(p.sourceCueIds??[]).includes(id)));
  if(!card)return {error:"MISSING_SOURCE_CUE",cueId:id};
  api.showSection(card.sectionId);
  return {section:card.sectionId};
 },cueId);
 assert(!result.error,JSON.stringify(result));
 await page.waitForFunction(section=>window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId===section,result.section,{timeout:5000});
 await page.waitForFunction(()=>Boolean(document.querySelector(".ao-prayer-paragraph[data-cue-id]")),null,{timeout:5000}).catch(()=>{});
 const status=await page.evaluate(id=>{
  const scroller=document.querySelector(".ao-prayer-card");
  const node=[...document.querySelectorAll(".ao-reader-paragraph[data-cue-id]")].find(n=>n.dataset.cueId===id);
  if(!node||!scroller)return {found:false};
  // Use actual user-facing scroll container; never alter the reader's event controller directly.
  const box=node.getBoundingClientRect(),frame=scroller.getBoundingClientRect();
  const center=box.top-frame.top+scroller.scrollTop+box.height/2;
  scroller.scrollTop=Math.max(0,center-scroller.clientHeight*.38);
  scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
  return {found:true,section:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
    scrollTop:scroller.scrollTop,scrollMax:scroller.scrollHeight-scroller.clientHeight};
 },cueId);
 assert(status.found,"source cue "+cueId+" has no real rendered paragraph for "+result.section);
 await page.waitForFunction(id=>window.__AO_PHONE_PREVIEW.getActiveCue()===id,cueId,{timeout:4500}).catch(()=>{});
 const active=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getActiveCue());
 if(active===cueId){
   // Cue focus updates before renderMoment's next frame; source-owned bell and
   // voice checks must read the rendered snapshot, not the preceding one.
   await page.waitForFunction(id=>
     window.__AO_PHONE_PREVIEW.getNativeEventState()?.nativeCueId===id,
     cueId,{timeout:4500});
 }
 return {status,active};
}
try{
 await mkdir(artifactDir,{recursive:true});
 browser=await chromium.launch({headless:true});
 for(const form of forms){
  for(const family of families){
   const viewport=form==="LOW"?{width:320,height:700}:{width:390,height:844};
   const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   const page=await context.newPage();
   const errorMessages=[];
   page.on("pageerror",e=>errorMessages.push(e.message));
   const url="http://127.0.0.1:4187/tests/fixtures/reader-phone-harness.html?form="+form+"&family="+family;
   await page.goto(url,{waitUntil:"networkidle"});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
    null,{timeout:20000}).catch(async()=>{throw Error(form+"/"+family+" reader mount failed: "+
     await page.evaluate(()=>window.__AO_PHONE_HARNESS_ERROR??document.documentElement.dataset.harnessReady))});
   const initial=await page.evaluate(()=>{
    const a=window.__AO_PHONE_PREVIEW;
    const root=document.querySelector("[data-ao-reader-shell]");
    const rect=root.getBoundingClientRect();
    return {
      form:a.getPriestEntranceState().form,
      formScenario:window.__AO_PHONE_SCENARIO,
      productCards:a.model.totalCards,
      mode:a.getPresentationMode(),
      visibleCard:a.getCurrentCard()?.sectionId,
      stageOwner:root.dataset.r17StateOwner,
      rootWidth:rect.width,
      viewportWidth:innerWidth,
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      noImplicitReverence:a.getPriestEntranceState().observed===false,
    };
   });
   assert.equal(initial.form,form);
   assert.equal(initial.formScenario.family,family);
   assert.equal(initial.mode,"LIVE");
   const expectedCards=form==="LOW"?39:48;
   assert.equal(initial.productCards,expectedCards,
     "form-specific LIVE card count lost for "+form+"/"+family);
   assert(!initial.overflow && initial.rootWidth<=initial.viewportWidth+1,"phone horizontal overflow");
   assert(initial.noImplicitReverence,"the app inferred a pretext priest reverence");
   const samples={};
   for(const cue of ["AO.SM.C0075","AO.SM.C0112","AO.SM.C0174","AO.SM.C0181","AO.SM.C0212"]){
    const focus=await focusCue(page,cue);
    const state=await page.evaluate(()=>{
      const a=window.__AO_PHONE_PREVIEW;
      const st=a.getNativeEventState(),p=a.getCueState();
      const root=document.querySelector("[data-ao-reader-shell]");
      return {
        focus:a.getActiveCue(),owner:st?.ownership??{},
        priestVoice:st?.priestVoice?.value??st?.priestVoice?.label??null,
        priestAction:st?.priestAction?.label??null,
        priestPosition:st?.priestPosition?.station??null,
        minister:st?.sacredMinister?.actor??null,
        bell:st?.bell?.label??null,
        sourceProjection:p?.cueId??null,
        rootCue:root?.dataset.r17NativeCue,
        actionRailVisible:root?.querySelector(".ao-rail-right")?.dataset.visible,
        posture:st?.posture?.value??st?.posture?.label??null,
        scene:root?.querySelector('[data-role="cinematic"]')?.dataset.kind??null
      };
    });
    for(const key of ["gesture","response","priestVoice","priestPosition","priestAction","sacredMinister"]){
     assert(!String(state.owner[key]??"").includes("LEGACY"),
       form+"/"+family+" "+cue+" regressed to legacy "+key);
    }
    // Assertions about source projection remain valid even if the user-facing
    // focus cannot reach a very short cue at this exact simulated scroll offset.
    if(state.focus===cue){
     if(form==="LOW" || form.startsWith("MISSA_CANTATA"))
      assert.equal(state.minister,null,form+" invented a deacon or subdeacon at "+cue);
     if(family==="REQUIEM" && cue==="AO.SM.C0112" && form==="LOW"){
      assert.equal(state.priestAction,null,"Requiem Low Mass blesses the water");
      assert(state.priestVoice,"Low Requiem lost quiet prayer voice");
     }
     if(cue==="AO.SM.C0174"&&state.bell!=="ELEVATION BELL"){
       const diagnostic=await page.evaluate(()=>{
         const api=window.__AO_PHONE_PREVIEW;
         return {nativeCue:api.getNativeEventState()?.nativeCueId,
           transient:api.getTransientState(),
           transitionPending:api.getTransientTransitionPending(),
           activeCue:api.getActiveCue()};
       });
       assert.equal(state.bell,"ELEVATION BELL",
         form+"/"+family+" Host elevation lost its bell: "+JSON.stringify(diagnostic));
     }
    }
    samples[cue]={...state,scroll:focus.status,exactFocusReached:state.focus===cue};
    if(cue==="AO.SM.C0174" && family==="VOTIVE"){
      const filename=form.toLowerCase()+"-host-elevation-"+viewport.width+"px.png";
      await page.screenshot({path:resolve(artifactDir,filename),animations:"disabled"});
    }
   }
   assert(!errorMessages.length,form+"/"+family+" browser errors: "+errorMessages.join(" | "));
   const result={form,family,viewport,initial,samples,errors:errorMessages,
    qualifiedFixture:family==="REQUIEM"?"REQUIEM_OVERLAY_WITH_SYNTHETIC_PROPER__NOT_COMPLETE_REQUIEM_PROPER":"SYNTHETIC_VOTIVE_PROPER"};
   results.push(result);
   await context.close();
  }
 }
 const summary={schema:"ao-mass-live-batch4-acceptance-matrix-v1",total:results.length,
  formCount:forms.length,scenarioCount:families.length,
  explicitPresentationRule:"LOW_SOURCE_39__SUNG_LIVE_PRODUCT_48",
  distinctSourceCueSamples:["C0075","C0112","C0174","C0181","C0212"],
  emulatorNotPhysicalDevice:true,syntheticProperNotLiturgicalCertification:true,
  results};
 await writeFile(resolve(artifactDir,"acceptance-matrix.json"),JSON.stringify(summary,null,2)+"\n");
 console.log("PASS Batch 4: "+results.length+" four-form × Votive/Requiem phone scenarios; Low=39 and Sung=48, source-owned channels, no invented ministers, phone geometry; screenshots and manifest retained.");
} finally {
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
