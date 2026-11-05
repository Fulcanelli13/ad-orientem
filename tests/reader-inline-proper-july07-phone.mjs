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
  res.writeHead(200,{"content-type":extname(file)===".js"?"text/javascript":
   extname(file)===".html"?"text/html":"application/octet-stream",
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
  console.log("INLINE_1961_JULY07_PHONE_PASS "+JSON.stringify({
   width,svg:result.actualSvg,mounted:result.mounted,cardDimensions:result.cardDimensions,
   sourceTextIntact:result.sourceTextIntact,blocked:result.blocked}));
  await page.close();
 }
}finally{
 await browser?.close();await new Promise(resolve=>server.close(resolve))
}
