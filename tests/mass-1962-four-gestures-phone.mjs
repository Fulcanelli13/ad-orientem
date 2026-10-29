import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Real-source/native-reader 1962 acceptance; never synthesize prayer rows.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/mass-1962-four-gestures-phone");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4481,"127.0.0.1",ok)});
const scenarios=[
 {mode:"MISSAL",lang:"en",width:320,form:"LOW"},
 {mode:"MISSAL",lang:"fr",width:390,form:"SOLEMN"},
 {mode:"LIVE",lang:"en",width:320,form:"MISSA_CANTATA_SIMPLE"},
 {mode:"LIVE",lang:"fr",width:390,form:"SOLEMN"}
];
const cues=["AO.SM.C0117","AO.SM.C0161","AO.SM.C0169","AO.SM.C0263"];
const expected={
 "AO.SM.C0117":{
  en:/stands erect.*raises his eyes and hands.*joins his hands/i,
  fr:/se redresse.*élève les yeux et les mains.*joint les mains/i
 },
 "AO.SM.C0161":{
  en:/open palms facing the Host and chalice.*Per Christum Dominum nostrum.*joins his hands/i,
  fr:/paumes ouvertes tournées vers l’Hostie et le calice.*Per Christum Dominum nostrum.*joint alors les mains/i
 },
 "AO.SM.C0169":{
  en:/raises his eyes to heaven and immediately lowers them/i,
  fr:/élève les yeux au ciel et les abaisse aussitôt/i
 },
 "AO.SM.C0263":{
  en:/raises his eyes and hands.*joins his hands.*bows his head towards the Cross/i,
  fr:/élève les yeux et les mains.*joint les mains.*incline la tête vers la Croix/i
 }
};
const report=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const spec of scenarios){
  const context=await browser.newContext({viewport:{width:spec.width,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:2,
   locale:spec.lang==="fr"?"fr-FR":"en-GB"});
  try{
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e.message??e)));
   const query=new URLSearchParams({...spec,aoLiveCards:"65"});
   await page.goto("http://127.0.0.1:4481/tests/fixtures/reader-phone-harness.html?"+query,
    {waitUntil:"networkidle",timeout:45000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
    null,{timeout:30000});
   for(const cue of cues){
    const snapshot=await page.evaluate(async cueId=>{
     const api=window.__AO_PHONE_PREVIEW;
     const card=api.model.cards.find(c=>c.paragraphs?.some(p=>p.sourceCueIds?.includes(cueId)));
     if(!card||!api.showSequence(card.sequence))
      return {error:"Canonical card missing",cueId};
     const frame=()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
     await frame();
     const shell=document.querySelector("[data-ao-reader-shell]");
     const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
     const row=[...scroller.querySelectorAll(".ao-reader-paragraph")].find(el=>
      (el.dataset.sourceCueIds??"").split(/\s+/).includes(cueId));
     if(!row)return {error:"Canonical source paragraph missing",cueId};
     row.scrollIntoView({block:"center",inline:"nearest"});
     await frame();
     const p=row.querySelector(".ao-line-primary");
     const id="AO.RUB."+cueId.slice(-5)+".01";
     const note=row.querySelector('[data-rubric-id="'+id+'"]');
     const noteBox=note?.closest(".ao-missal-inline-rubrics,.ao-live-inline-rubrics");
     const pStyle=p?getComputedStyle(p):null;
     const noteStyle=noteBox?getComputedStyle(noteBox):null;
     const box=row.getBoundingClientRect();
     const noteRect=note?.getBoundingClientRect();
     return {
      cueId,card:card.title,mode:shell?.dataset.mode,kind:row.dataset.kind,
      sourceCueIds:row.dataset.sourceCueIds,primary:p?.textContent?.trim()??"",
      sourceRubric:note?.textContent?.trim()??"",sourceRubricId:note?.dataset.rubricId??null,
      primaryColor:pStyle?.color??"",rubricColor:noteStyle?.color??"",
      rubricBeforePrayer:Boolean(noteBox&&p&&
       (noteBox.compareDocumentPosition(p)&Node.DOCUMENT_POSITION_FOLLOWING)),
      rubricPhysicallyAbove:Boolean(noteBox&&p&&
       noteBox.getBoundingClientRect().bottom<=p.getBoundingClientRect().top+1),
      sourceGridBefore:row.dataset.missalRubricBefore??null,
      rubricHidden:noteBox?.hidden??null,visibleRubric:Boolean(note&&noteRect?.width>=18&&
       noteRect?.height>=12&&noteStyle?.display!=="none"&&noteStyle?.visibility!=="hidden"),
      art:note?.querySelector(".ao-approved-priest-gesture-rubric-art,.ao-approved-finger-rubric-art,.ao-approved-priest-head-bow-rubric-art")?.dataset.approvedAsset??null,
      duplicateRubricCount:row.querySelectorAll(".ao-live-inline-rubrics").length,
      width:innerWidth,documentWidth:document.documentElement.scrollWidth,
      left:box.left,right:box.right
     };
    },cue);
    const screenshot=spec.mode.toLowerCase()+"-"+spec.lang+"-"+spec.width+"-"+cue.slice(-5)+".png";
    await page.screenshot({path:resolve(output,screenshot)});
    report.push({...spec,...snapshot,screenshot,errors:[...errors]});
    assert.equal(snapshot.error,undefined,JSON.stringify(snapshot));
    assert.equal(snapshot.mode,spec.mode);
    assert.equal(errors.length,0,"Browser errors: "+errors.join(" | "));
    assert.ok(snapshot.documentWidth<=spec.width+1,"Phone horizontal overflow "+cue);
    assert.ok(snapshot.left>=-1&&snapshot.right<=spec.width+1,
      "Source paragraph clipped at "+cue);
    const isSourceBracket=cue==="AO.SM.C0117"||cue==="AO.SM.C0263";
    const visibleText=isSourceBracket?snapshot.primary:snapshot.sourceRubric;
    assert.match(visibleText,expected[cue][spec.lang],
      spec.mode+" "+spec.lang+" "+cue+" lost 1962 priest direction");
    if(isSourceBracket){
     assert.equal(snapshot.kind,"RUBRIC","Source-bracket rubric owner changed");
     assert.equal(snapshot.duplicateRubricCount,0,"Original source rubric duplicated");
     if(spec.mode==="MISSAL")
      assert.equal(snapshot.primaryColor,"rgb(223, 126, 128)",
       "Missal source bracket direction not red");
    }else{
     assert.equal(snapshot.sourceRubricId,"AO.RUB."+cue.slice(-5)+".01",
      "Rubric left its exact published 1962 identity");
     assert.equal(snapshot.art,null,"Approximate artwork added to iconless priest gesture");
     assert.equal(snapshot.visibleRubric,true,"Source inline rubric hidden or clipped");
     if(spec.mode==="MISSAL"){
      assert.equal(snapshot.rubricColor,"rgb(223, 126, 128)",
       "Missal inline rubric not red");
      assert.equal(snapshot.rubricBeforePrayer,true,
       "Missal rubric must precede the original prayer in DOM order");
      assert.equal(snapshot.sourceGridBefore,"true",
       "Missal must explicitly reserve an earlier visual grid row");
      assert.equal(snapshot.rubricPhysicallyAbove,true,
       "Red rubric is physically BELOW its Latin/vernacular text despite DOM order");
     }
    }
   }
  }finally{await context.close();}
 }
 await writeFile(resolve(output,"report.json"),JSON.stringify({scenarios:report},null,2));
 console.log("PASS "+report.length+" exact 1962 priest gesture phone scenes: 4 cues, MISSAL/LIVE, EN/FR, Low/Sung/Solemn, 320/390px.");
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
