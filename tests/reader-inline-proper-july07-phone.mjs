import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  const mime={".js":"text/javascript; charset=utf-8",
   ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
   ".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",
   ".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png",
   ".webp":"image/webp"};
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((resolve,reject)=>{
 server.once("error",reject);server.listen(0,"127.0.0.1",resolve)
});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded"});
  if(width===390){
   await page.waitForFunction(()=>
    typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
   const real=await page.evaluate(async()=>{
    const resolver=globalThis.AO_RUNTIME_V8.resolver;
    const outcome=await resolver.resolveDay("2026-11-01");
    const proper=outcome?.proper?.data;
    const sourcePath=proper?.sourcePath??null;
    const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
    const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
    const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
    const {referenceScoresForParagraph}=await import("/src/mass/reader-inline-proper-reference.js");
    const principalId=outcome?.day?.main?.id;
    const recovered=await recoverReaderProperOmissions(proper,{
     hostResolver:resolver.properResolver,principalCelebrationId:principalId,
     calendarDate:"2026-11-01"
    });
    const request={canStart:true,date:"2026-11-01",
     calendarDay:{id:principalId,title:outcome?.day?.main?.title??null},
     celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
     celebrationType:"CALENDAR",properSource:sourcePath};
    const adapted=adaptV346ResolvedMass(request,{form:"solemn",proper:recovered});
    const realProper=adapted?.proper?.data??null;
    const projected=properToReaderSlots(realProper,{language:"en"});
    const resolvedMass={date:"2026-11-01",form:"SOLEMN",
     proper:{data:realProper},overlays:[]};
    const movements=["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE",
     "OFFERTORY","COMMUNION"];
    const parts=movements.map(slot=>{
     const entry=projected.slots[slot];
     return {slot,status:entry.status,rows:(entry.data?.paragraphs??[]).map(row=>{
      const paragraph={id:row.id,kind:row.kind,
       primary:row.latin,alternate:row.vernacular};
      return {paragraphId:row.id,latin:String(row.latin??"").slice(0,105),
       scores:referenceScoresForParagraph({
        paragraph,resolvedMass,form:"SOLEMN"}).map(s=>s.id)};
     })};
    });
    return {dayStatus:outcome?.status,sourcePath,
     readerSourcePath:realProper?.sourcePath,readerReady:projected.ready,
     parts,ids:[...new Set(parts.flatMap(p=>p.rows.flatMap(r=>r.scores)))]};
   });
   assert.equal(real.dayStatus,"ready");
   assert.equal(real.sourcePath,"Sancti/11-01");
   assert.equal(real.readerSourcePath,"Sancti/11-01");
   assert.equal(real.readerReady,true,"Actual selected 1962 All Saints reader Proper must resolve");
   assert.deepEqual(real.ids.sort(),[
    "GREGOBASE-345","GREGOBASE-371","GREGOBASE-752",
    "GREGOBASE-835","GREGOBASE-1237"].sort(),
    "Real source-owned paragraphs must map to five archived neume scores: "+JSON.stringify(real.parts));
   console.log("INLINE_1961_ALL_SAINTS_REAL_RESOLVER_PASS "+JSON.stringify({
    sourcePath:real.sourcePath,ids:real.ids,parts:real.parts.map(p=>({
     slot:p.slot,status:p.status,scores:p.rows.flatMap(r=>r.scores)
    }))
   }));
  }
  const result=await page.evaluate(async()=>{
   const {JULY07_REFERENCE_GABC,referenceScoresForParagraph,createDatedProperNotationPreview,
     JULY07_REFERENCE_CSS}=await import("/src/mass/reader-inline-proper-reference.js");
   const {createOfflineChantEngraver}=await import("/src/mass/reader-chant-engraver.js");
   const mass={date:"2026-07-07",proper:{data:{sourcePath:"Sancti/07-07"}},
     form:"MISSA_CANTATA_SIMPLE",overlays:[]};
   const texts={
    INTROIT:"Ps 131:9-10\nSacerdótes tui, Dómine, índuant justítiam, et sancti tui exsúltent: propter David servum tuum.",
    GRADUAL:"Ps 131:16-17\nSacerdótes ejus índuam salutári: et sancti ejus exsultatióne exsultábunt.\nV. Illuc prodúcam cornu David: parávi lucérnam Christo meo.",
    ALLELUIA:"Allelúja, allelúja.\nPs 109:4\nJurávit Dóminus, et non pœnitébit eum: Tu es sacérdos in ætérnum, secúndum órdinem Melchísedech."
   };
   const paragraphs=[
    {id:"INTROIT.1",kind:"TEXT",alternate:texts.INTROIT,primary:"The priests shall be clothed with justice"},
    {id:"GRADUAL.1",kind:"TEXT",alternate:texts.GRADUAL,primary:"I shall clothe his priests"},
    {id:"ALLELUIA_TRACT_SEQUENCE.1",kind:"TEXT",alternate:texts.ALLELUIA,primary:"The Lord hath sworn"}
   ];
   const julyIntroit=JULY07_REFERENCE_GABC.find(x=>x.key==="INTROIT");
   const correctSeasonalRendering=Boolean(julyIntroit &&
     !julyIntroit.gabc.includes("<i>T. P.</i>") &&
     !julyIntroit.gabc.includes("Al(e)le(f)lú") &&
     julyIntroit.gabc.includes("<i>Ps.</i>") &&
     julyIntroit.gabc.includes("Gló(g)ri(hj)a") &&
     JULY07_REFERENCE_GABC.every(x=>x.publicScoreApproved===false));
   const synthetic={
    schema:mass.proper.data.sourcePath,
    archiveIDs:JULY07_REFERENCE_GABC.map(x=>x.id),
    ids:paragraphs.map(p=>referenceScoresForParagraph({paragraph:p,resolvedMass:mass,form:mass.form}).map(x=>x.id))
   };
   const blocked=[
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,date:"2026-07-08"},form:mass.form}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:mass,form:"LOW"}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,proper:{data:{sourcePath:"Sancti/07-08"}}},form:mass.form}),
    referenceScoresForParagraph({paragraph:{...paragraphs[0],alternate:"Nothing relevant"},resolvedMass:mass,form:mass.form}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,overlays:["REQUIEM"]},form:mass.form})
   ].every(x=>x.length===0);
   const host=document.createElement("section");host.className="ao-reader-shell";host.dataset.aoReaderShell="";
   host.dataset.mode="LIVE";host.style.cssText="width:100%;box-sizing:border-box;display:block;--ao-text:#eeeae7;--ao-muted:#a5a5a5";
   const style=document.createElement("style");style.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.className="ao-prayer-body";
   body.style.cssText="width:100%;box-sizing:border-box;padding:0 52px;min-width:0";
   host.append(style,body);document.body.replaceChildren(host);document.body.style.margin="0";
   for(const p of paragraphs){
    const node=document.createElement("p");node.className="ao-reader-paragraph";
    node.dataset.paragraphId=p.id;node.style.cssText="box-sizing:border-box;min-width:0";
    const primary=document.createElement("span");primary.className="ao-line-primary";
    primary.textContent=p.primary;const trans=document.createElement("span");
    trans.className="ao-line-secondary";trans.textContent=p.alternate;
    node.append(primary,trans);body.append(node);
   }
   const ctrl=createDatedProperNotationPreview({root:host,enabled:true});
   const mounted=ctrl.render({mode:"LIVE",form:mass.form,resolvedMass:mass,paragraphs});
   for(let i=0;i<100 && ctrl.state().rendered<3;i++)
    await new Promise(r=>setTimeout(r,120));
   const rendered=ctrl.state().rendered;
   const staff=[...body.querySelectorAll(".ao-proper-reference-staff")];
   const actualSvg=staff.filter(x=>x.querySelector("svg")).length;
   const cardDimensions=[...body.querySelectorAll(".ao-reader-paragraph")].map(n=>({
    w:n.getBoundingClientRect().width,
    scoreW:n.querySelector(".ao-proper-reference-staff")?.getBoundingClientRect().width??0
   }));
   const sourceTextIntact=paragraphs.every(p=>{
    const node=body.querySelector('[data-paragraph-id="'+p.id+'"]');
    return node.querySelector(".ao-line-primary").textContent===p.primary &&
      node.querySelector(".ao-line-secondary").textContent===p.alternate;
   });
   const labels=[...body.querySelectorAll(".ao-proper-reference-label")].map(x=>x.textContent);
   const noApproval=[...body.querySelectorAll("[data-reference-score]")].every(
    x=>x.dataset.approved==="false");
   const combined={...paragraphs[1],alternate:texts.GRADUAL+"\n"+texts.ALLELUIA};
   const combinedIds=referenceScoresForParagraph({paragraph:combined,resolvedMass:mass,form:mass.form}).map(x=>x.id);
   ctrl.render({mode:"LIVE",form:"LOW",resolvedMass:mass,paragraphs});
   const lowNoScores=body.querySelectorAll("[data-reference-score]").length===0;
   // Restore full notation for screenshot evidence, after LOW fallback proof.
   ctrl.render({mode:"LIVE",form:mass.form,resolvedMass:mass,paragraphs});
   for(let k=0;k<80&&ctrl.state().rendered<3;k++)
    await new Promise(resolve=>setTimeout(resolve,100));
   const screenshotReady=ctrl.state().rendered===3;
   return {synthetic,blocked,mounted,rendered,actualSvg,cardDimensions,screenshotReady,correctSeasonalRendering,
    sourceTextIntact,labels,noApproval,combinedIds,lowNoScores,width:window.innerWidth};
  });
  assert.deepEqual(result.synthetic.archiveIDs,["GREGOBASE-48","GREGOBASE-415","GREGOBASE-1187"]);
  assert.deepEqual(result.synthetic.ids,[["GREGOBASE-48"],["GREGOBASE-415"],["GREGOBASE-1187"]]);
  assert.deepEqual(result.combinedIds,["GREGOBASE-415","GREGOBASE-1187"]);
  assert.equal(result.blocked,true);
  assert.equal(result.mounted,3);
  assert.equal(result.rendered,3,"Bundled Exsurge must engrave all three original 1961 GABC transcriptions");
  assert.equal(result.actualSvg,3);
  assert.equal(result.screenshotReady,true);
  assert.equal(result.correctSeasonalRendering,true,
   "July Mass must suppress only the unappointed T. P. Alleluia in the printed Introit GABC");
  assert.equal(result.sourceTextIntact,true);
  assert.equal(result.noApproval,true);
  assert.equal(result.lowNoScores,true);
  assert.equal(result.labels.length,3);
  assert.ok(result.labels.every(x=>x.includes("review pending")));
  assert.ok(result.cardDimensions.every(x=>x.w<=width+1 && x.scoreW>120),
   "No clipped notes on "+width+" px: "+JSON.stringify(result.cardDimensions));
  await mkdir(resolve(root,".tmp/mass-inline-proper-july07"),{recursive:true});
  await page.locator(".ao-proper-reference-expand").first().click();
  await page.waitForSelector("dialog.ao-proper-reference-zoom[open] .ao-proper-reference-wide svg",{timeout:12000});
  const zoomSize=await page.locator("dialog.ao-proper-reference-zoom .ao-proper-reference-wide")
   .evaluate(node=>node.getBoundingClientRect().width);
  assert.ok(zoomSize>=840,"Enlarged neumes must preserve readable staff width: "+zoomSize);
  await page.screenshot({path:resolve(root,".tmp/mass-inline-proper-july07/enlarged-"+width+".png"),fullPage:false});
  await page.locator("dialog.ao-proper-reference-zoom header button").click();
  assert.equal(await page.locator("dialog.ao-proper-reference-zoom").count(),0);
  await page.screenshot({path:resolve(root,".tmp/mass-inline-proper-july07/notation-"+width+".png"),fullPage:true});
  // Second actual 1962 selected Mass: All Saints, five *existing* archived
  // Proper scores, same Exsurge view, same 65-card paragraph IDs.
  const allSaints=await page.evaluate(async()=>{
   const {ALL_SAINTS_REFERENCE_GABC}=await import("/src/mass/reader-inline-all-saints-reference.js");
   const {referenceScoresForParagraph,createDatedProperNotationPreview,
    JULY07_REFERENCE_CSS}=await import("/src/mass/reader-inline-proper-reference.js");
   const resolvedMass={date:"2026-11-01",form:"SOLEMN",
    proper:{data:{sourcePath:"Sancti/11-01"}},overlays:[]};
   const latin=[
    "Gaudeámus omnes in Dómino, diem festum celebrántes sub honóre Sanctórum ómnium.",
    "Timéte Dóminum, omnes Sancti ejus: quóniam nihil deest timéntibus eum. V. Inquiréntes autem Dóminum.",
    "Veníte ad me, omnes, qui laborátis et oneráti estis: et ego refíciam vos.",
    "Justórum ánimæ in manu Dei sunt, et non tanget illos torméntum malítiæ: illi autem sunt in pace, allelúja.",
    "Beáti mundo corde, quóniam ipsi Deum vidébunt; beáti pacífici, quóniam fílii Dei vocabúntur."
   ];
   const slotIds=["INTROIT.1","GRADUAL.1","ALLELUIA_TRACT_SEQUENCE.1",
    "OFFERTORY.1","COMMUNION.1"];
   const paragraphs=latin.map((text,i)=>({
    id:slotIds[i],kind:"TEXT",primary:"Vernacular source text "+i,
    alternate:text
   }));
   const selected=paragraphs.map(p=>referenceScoresForParagraph({
    paragraph:p,resolvedMass,form:resolvedMass.form}).map(x=>x.id));
   const wrong={
    date:referenceScoresForParagraph({
     paragraph:paragraphs[0],resolvedMass:{...resolvedMass,date:"2026-11-02"},
     form:resolvedMass.form}).length,
    path:referenceScoresForParagraph({
     paragraph:paragraphs[0],resolvedMass:{...resolvedMass,
      proper:{data:{sourcePath:"Sancti/11-02"}}},
     form:resolvedMass.form}).length,
    low:referenceScoresForParagraph({
     paragraph:paragraphs[0],resolvedMass,form:"LOW"}).length,
    requiem:referenceScoresForParagraph({
     paragraph:paragraphs[0],resolvedMass:{...resolvedMass,overlays:["REQUIEM"]},
     form:resolvedMass.form}).length
   };
   const together={...paragraphs[1],alternate:latin[1]+"\n"+latin[2]};
   const gradualWithAlleluia=referenceScoresForParagraph({
    paragraph:together,resolvedMass,form:resolvedMass.form}).map(x=>x.id);
   const host=document.createElement("section");
   host.className="ao-reader-shell";host.dataset.aoReaderShell="";
   host.dataset.mode="LIVE";
   host.style.cssText="width:100%;box-sizing:border-box;display:block;--ao-text:#eeeae7;--ao-muted:#a5a5a5";
   const style=document.createElement("style");style.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.className="ao-prayer-body";
   body.style.cssText="width:100%;box-sizing:border-box;padding:0 52px;min-width:0";
   host.append(style,body);document.body.replaceChildren(host);
   document.body.style.margin="0";
   for(const p of paragraphs){
    const row=document.createElement("p");row.className="ao-reader-paragraph";
    row.dataset.paragraphId=p.id;row.style.cssText="box-sizing:border-box;min-width:0";
    const primary=document.createElement("span");primary.className="ao-line-primary";
    primary.textContent=p.primary;
    const translated=document.createElement("span");translated.className="ao-line-secondary";
    translated.textContent=p.alternate;row.append(primary,translated);body.append(row);
   }
   const controller=createDatedProperNotationPreview({root:host,enabled:true});
   const mounted=controller.render({mode:"LIVE",form:resolvedMass.form,
    resolvedMass,paragraphs});
   for(let i=0;i<120&&controller.state().rendered<5;i++)
    await new Promise(r=>setTimeout(r,120));
   const rendered=controller.state().rendered;
   const renderedSvg=body.querySelectorAll(".ao-proper-reference-staff svg").length;
   const labels=[...body.querySelectorAll(".ao-proper-reference-label")].map(x=>x.textContent);
   const originalsUntouched=paragraphs.every(p=>{
    const row=body.querySelector('[data-paragraph-id="'+p.id+'"]');
    return row.querySelector(".ao-line-primary").textContent===p.primary &&
     row.querySelector(".ao-line-secondary").textContent===p.alternate;
   });
   const widths=[...body.querySelectorAll("[data-reference-score]")].map(x=>({
    score:x.dataset.referenceScore,
    w:x.getBoundingClientRect().width,
    staff:x.querySelector(".ao-proper-reference-staff").getBoundingClientRect().width
   }));
   const approval=[...body.querySelectorAll("[data-reference-score]")]
    .every(x=>x.dataset.approved==="false");
   const sources=ALL_SAINTS_REFERENCE_GABC.map(x=>({
    id:x.id,part:x.part,sourceUrl:x.sourceUrl,sha:x.sha256,
    endsProperly:x.gabc.includes("(::)"),hasScoreHeader:x.gabc.includes("%%\n")
   }));
   return {mounted,rendered,renderedSvg,selected,wrong,gradualWithAlleluia,
    labels,originalsUntouched,widths,approval,sources};
  });
  assert.deepEqual(allSaints.selected,[
   ["GREGOBASE-752"],["GREGOBASE-371"],["GREGOBASE-1237"],
   ["GREGOBASE-835"],["GREGOBASE-345"]]);
  assert.deepEqual(allSaints.gradualWithAlleluia,["GREGOBASE-371","GREGOBASE-1237"]);
  assert.deepEqual(allSaints.wrong,{date:0,path:0,low:0,requiem:0});
  assert.equal(allSaints.mounted,5);
  assert.equal(allSaints.rendered,5,"All five already-archived Gregorian Propers must engrave");
  assert.equal(allSaints.renderedSvg,5,"All Saints must display five SVG square-notation scores");
  assert.equal(allSaints.originalsUntouched,true);
  assert.equal(allSaints.approval,true);
  assert.ok(allSaints.labels.every(t=>t.includes("review pending")));
  assert.ok(allSaints.widths.every(x=>x.w<=width+1&&x.staff>120),
   "All Saints score overflow at "+width+": "+JSON.stringify(allSaints.widths));
  assert.ok(allSaints.sources.every(x=>x.endsProperly&&x.hasScoreHeader&&
   x.sourceUrl==="https://gregobase.selapa.net/chant.php?id="+x.id.slice(10)));
  await page.screenshot({path:resolve(root,
   ".tmp/mass-inline-proper-july07/all-saints-"+width+".png"),fullPage:true});
  console.log("INLINE_1961_ALL_SAINTS_PHONE_PASS "+JSON.stringify({
   width,rendered:allSaints.rendered,widths:allSaints.widths,
   sourceTextIntact:allSaints.originalsUntouched
  }));
  console.log("INLINE_1961_JULY07_PHONE_PASS "+JSON.stringify({
   width,svg:result.actualSvg,mounted:result.mounted,cardDimensions:result.cardDimensions,
   sourceTextIntact:result.sourceTextIntact,blocked:result.blocked}));
  await page.close();
 }
}finally{
 await browser?.close();await new Promise(resolve=>server.close(resolve))
}
