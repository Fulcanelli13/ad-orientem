// Eight rendered, production-mounted 1962 Mass scenarios; source-first QA.
// This is NOT a historical 39/48-card projection, an authentic Requiem Proper,
// evidence of a physical bell, or a certification of an observed gesture.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/r17-four-form-family-matrix");
const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
const families=["VOTIVE","REQUIEM"];
const cues=["AO.SM.C0112","AO.SM.C0174","AO.SM.C0181","AO.SM.C0212"];
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
    "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await mkdir(out,{recursive:true});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4187,"127.0.0.1",ok)});
let browser;
const result=[];
try{
 browser=await chromium.launch({headless:true});
 for(const form of forms){
  for(const family of families){
   const viewport=form==="LOW"?{width:320,height:700}:{width:390,height:844};
   const context=await browser.newContext({viewport,deviceScaleFactor:1,
     isMobile:true,hasTouch:true});
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   const query=new URLSearchParams({production:"1",matrix:"1",form,
     requiem:family==="REQUIEM"?"1":"0"});
   const url="http://127.0.0.1:4187/tests/fixtures/reader-phone-harness.html?"+query;
   try{
    await page.goto(url,{waitUntil:"networkidle"});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady!=="",
      null,{timeout:25000});
    const ready=await page.evaluate(()=>({
     status:document.documentElement.dataset.harnessReady,
     error:window.__AO_PHONE_HARNESS_ERROR??null,
    }));
    assert.equal(ready.status,"true",form+"/"+family+" mount: "+ready.error);
    await page.waitForFunction(()=>Boolean(window.__AO_PHONE_PREVIEW?.getCurrentCard?.()),
      null,{timeout:10000});
    const initial=await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const root=document.querySelector("[data-ao-reader-shell]");
     const box=root?.getBoundingClientRect();
     const fixture=window.__AO_FOUR_FORM_SCENARIO;
     return {fixture,mode:api.getPresentationMode(),
       form:api.getPriestEntranceState()?.form??null,
       cards:api.model.cards.length,
       cardCountApi:api.model.totalCards??null,
       sourceOwner:api.model.structureOwner??null,
       width:box?.width??0,viewport:innerWidth,
       horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
       observedEntrance:api.getPriestEntranceState()?.observed??null};
    });
    assert.equal(initial.fixture?.form,form,"Wrong fixture form");
    assert.equal(initial.fixture?.family,family,"Wrong fixture family");
    assert.equal(initial.fixture?.planKind,"MASS","Must use canonical plan compiler");
    assert.equal(initial.fixture?.syntheticProper,true);
    assert.equal(initial.mode,"LIVE","Fixture did not mount LIVE");
    assert.equal(initial.form,form,"R17 form selection failed");
    assert(initial.cards>25,"Missing source-owned reader cards");
    assert(initial.width>200&&initial.width<=initial.viewport+1,"Reader clipped horizontally");
    assert(!initial.horizontalOverflow,"Page overflow at "+viewport.width+"px");
    assert.equal(initial.observedEntrance,false,"Fixture fabricated priest entrance observation");
    // No fixed 39/48-card assumption: the current source projection owns
    // variants and optional second Confiteor. Preserve measured count only.
    const samples=[];
    for(const cue of cues){
     const before=await page.evaluate(id=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(c=>(c.paragraphs??[]).some(p=>
        (p.sourceCueIds??[]).includes(id)));
      if(!card)return {error:"MISSING_CUE",cue:id};
      api.showSequence(card.sequence);
      return {sectionId:card.sectionId,cardTitle:card.title,
        sourceSectionId:card.sourceSectionId??null};
     },cue);
     assert(!before.error,form+"/"+family+" missing canonical "+cue);
     await page.waitForFunction(section=>
       window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId===section,
       before.sectionId,{timeout:10000});
     await page.waitForFunction(id=>{
       const row=[...document.querySelectorAll(".ao-reader-paragraph")].find(el=>
         (el.dataset.sourceCueIds??"").split(/\s+/).includes(id));
       return Boolean(row&&row.getBoundingClientRect().width>0);
     },cue,{timeout:10000});
     const sampled=await page.evaluate(id=>{
      const api=window.__AO_PHONE_PREVIEW;
      const row=[...document.querySelectorAll(".ao-reader-paragraph")].find(el=>
        (el.dataset.sourceCueIds??"").split(/\s+/).includes(id));
      const scroller=row?.closest(".ao-prayer-card");
      if(row&&scroller){
       const b=row.getBoundingClientRect(),frame=scroller.getBoundingClientRect();
       scroller.scrollTop=Math.max(0,scroller.scrollTop+b.top-frame.top-25);
       scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
      }
      const shell=document.querySelector("[data-ao-reader-shell]");
      return {id,rendered:Boolean(row),sourceIds:(row?.dataset.sourceCueIds??"").split(/\s+/).filter(Boolean),
        text:(row?.querySelector(".ao-line-primary")?.textContent??row?.textContent??"").trim().slice(0,110),
        active:api.getActiveCue(),nativeCue:api.getNativeEventState()?.nativeCueId??null,
        minister:api.getNativeEventState()?.sacredMinister?.actor??null,
        bell:api.getNativeEventState()?.bell?.label??null,
        shellWidth:shell?.getBoundingClientRect().width??0};
     },cue);
     assert(sampled.rendered&&sampled.sourceIds.includes(cue)&&sampled.text.length>0,
       form+"/"+family+" failed to render source-owned "+cue);
     assert(sampled.shellWidth<=viewport.width+1,"Cue rendered horizontal overflow "+cue);
     // This is a captured scroll state; never claim a minister or bell was
     // actually observed merely because the reader's source cue exists.
     if(sampled.active===cue && sampled.nativeCue===cue &&
        ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"].includes(form)){
      assert.equal(sampled.minister,null,"Invented sacred minister at "+form+"/"+cue);
     }
     samples.push({...before,...sampled,sourceCueActivated:
       sampled.active===cue&&sampled.nativeCue===cue});
     if(cue==="AO.SM.C0174"){
      const file=resolve(out,form.toLowerCase()+"-"+family.toLowerCase()+
        "-host-source-"+viewport.width+"px.png");
      const png=await page.screenshot({path:file,animations:"disabled"});
      assert(png.length>4000,"Rendered Host-source screenshot suspiciously empty");
     }
    }
    const epistle=await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const card=api.model.cards.find(c=>(c.blocks??[]).some(b=>
       b.properSlot==="EPISTLE_OR_LESSON"));
     if(!card)return {found:false};
     api.showSequence(card.sequence);
     return {found:true,sourceSectionId:card.sourceSectionId??null,
       hasProper:card.blocks.some(b=>b.properSlot==="EPISTLE_OR_LESSON"),
       sourceCueOnProper:card.paragraphs.some(p=>(p.sourceCueIds??[])
         .includes("AO.SM.C0075"))};
    });
    assert(epistle.found&&epistle.hasProper,form+"/"+family+" lost resolved Epistle source");
    // C0075 is a priest event, not a fabricated Proper text clock.
    assert(!epistle.sourceCueOnProper,"Epistle inherited unrelated C0075 priest event");
    assert.deepEqual(errors,[],form+"/"+family+" uncaught browser errors");
    result.push({form,family,viewport,initial,samples,epistle,errors,
      fixtureScope:"SYNTHETIC_PROPER_NOT_AUTHENTIC_REQUIEM_MASS_TEXT",
      physicalDeviceCertified:false,localCeremonialPatternCertified:false});
    console.log("PASS R17 form-family "+form+"/"+family+
      " rendered="+samples.length+" cards="+initial.cards+
      " activated="+samples.filter(x=>x.sourceCueActivated).length);
   }finally{await context.close();}
  }
 }
 assert.equal(result.length,8,"Expected all four forms times two families");
 await writeFile(resolve(out,"acceptance-matrix.json"),
   JSON.stringify({schema:"ao-r17-four-form-family-phone-v2",
    scenarios:result.length,forms,families,
    cardCounts:"RUNTIME_SOURCE_OWNED_NOT_FROZEN_HISTORICAL",
    syntheticProperNotLiturgicalCertification:true,
    realPhysicalPhoneCertified:false,results:result},null,2)+"\n");
 console.log("PASS 8 main-based LIVE source-owner Mass scenarios; no 48-card contract, synthetic Proper clearly qualified.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
