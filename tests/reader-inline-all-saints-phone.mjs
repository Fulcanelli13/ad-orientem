import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const archivedVenite=JSON.parse(await readFile(resolve(root,"data/mass/chant-corpus/gr1961-proper-006.json"),"utf8"))
 .items.find(row=>row.gregobaseId===1237);
assert.equal(archivedVenite?.title,"Venite ad me");
assert.equal(archivedVenite?.mode,"8");
assert.equal(archivedVenite?.gradualeRomanum1961Page,"[114]");
const {ALL_SAINTS_REFERENCE_SCORES: embeddedScores}=await import("../src/mass/reader-inline-all-saints-reference.js");
const embeddedVenite=embeddedScores.find(score=>score.id==="GREGOBASE-1237");
assert.equal(embeddedVenite?.sourceArchivePage,"[114]");
assert.equal(embeddedVenite?.sha256,archivedVenite.sha256);
assert.equal(embeddedVenite?.gabc.split("\n%%\n")[1],archivedVenite.gabc,
 "Use original archived GABC without substituting a different melody");


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
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded"});
  const result=await page.evaluate(async()=>{
   const {createDatedProperNotationPreview,referenceScoresForParagraph,JULY07_REFERENCE_CSS}=
    await import("/src/mass/reader-inline-proper-reference.js");
   const {ALL_SAINTS_REFERENCE_SCORES,ALL_SAINTS_ALLELUIA_SOURCE_RESOLUTION}=
    await import("/src/mass/reader-inline-all-saints-reference.js");
   const mass={date:"2026-11-01",proper:{data:{sourcePath:"Sancti/11-01"}},
    form:"MISSA_CANTATA_SIMPLE",overlays:[]};
   const paragraphs=[
    {id:"INTROIT.1",kind:"TEXT",primary:"Gaudeámus omnes in Dómino, diem festum celebrántes sub honóre Sanctórum ómnium.",alternate:"Let us all rejoice"},
    {id:"GRADUAL.1",kind:"TEXT",primary:"Timéte Dóminum, omnes Sancti ejus: quóniam nihil deest timéntibus eum.",alternate:"Fear the Lord"},
    {id:"ALLELUIA_TRACT_SEQUENCE.1",kind:"TEXT",primary:"Veníte ad me, omnes, qui laborátis et oneráti estis: et ego refíciam vos.",alternate:"Come unto me"},
    {id:"OFFERTORY.1",kind:"TEXT",primary:"Justórum ánimæ in manu Dei sunt, et non tanget illos torméntum malítiæ.",alternate:"The souls of the just"},
    {id:"COMMUNION.1",kind:"TEXT",primary:"Beáti mundo corde, quóniam ipsi Deum vidébunt; beáti pacífici.",alternate:"Blessed are the clean of heart"}
   ];
   const slotIds=paragraphs.map(p=>referenceScoresForParagraph({paragraph:p,resolvedMass:mass,form:mass.form}).map(s=>s.id));
   const wrongConditions=[
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,date:"2026-11-02"},form:mass.form}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,proper:{data:{sourcePath:"Sancti/11-02"}}},form:mass.form}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:mass,form:"LOW"}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,overlays:["REQUIEM"]},form:mass.form}),
    referenceScoresForParagraph({paragraph:{...paragraphs[0],primary:"Unrelated chant"},resolvedMass:mass,form:mass.form}),
    referenceScoresForParagraph({paragraph:{...paragraphs[2],primary:"Veníte ad me"},resolvedMass:mass,form:mass.form})
   ].every(x=>x.length===0);
   const host=document.createElement("section");host.className="ao-reader-shell";host.dataset.aoReaderShell="";
   host.dataset.mode="LIVE";host.style.cssText="display:block;box-sizing:border-box;width:100%;--ao-text:#eeeae7;--ao-muted:#a5a5a5";
   const style=document.createElement("style");style.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.className="ao-prayer-body";
   body.style.cssText="width:100%;padding:0 52px;box-sizing:border-box;min-width:0";
   host.append(style,body);document.body.replaceChildren(host);document.body.style.margin="0";
   for(const p of paragraphs){
    const node=document.createElement("p");node.className="ao-reader-paragraph";node.dataset.paragraphId=p.id;
    node.style.cssText="min-width:0;box-sizing:border-box";
    const latin=document.createElement("span");latin.className="ao-line-primary";latin.textContent=p.primary;
    const trans=document.createElement("span");trans.className="ao-line-secondary";trans.textContent=p.alternate;
    node.append(latin,trans);body.append(node);
   }
   const ctrl=createDatedProperNotationPreview({root:host,enabled:true});
   const mounted=ctrl.render({mode:"LIVE",form:mass.form,resolvedMass:mass,paragraphs});
   for(let i=0;i<100&&ctrl.state().rendered<5;i++)
    await new Promise(r=>setTimeout(r,120));
   const rendered=ctrl.state().rendered;
   const svgCount=host.querySelectorAll(".ao-proper-reference-staff svg").length;
   const originalIntact=paragraphs.every(p=>{
    const node=body.querySelector('[data-paragraph-id="'+p.id+'"]');
    return node.querySelector(".ao-line-primary").textContent===p.primary&&
      node.querySelector(".ao-line-secondary").textContent===p.alternate;
   });
   const labels=[...host.querySelectorAll(".ao-proper-reference-label")].map(x=>x.textContent);
   const ids=[...host.querySelectorAll("[data-reference-score]")].map(x=>x.dataset.referenceScore);
   const widths=[...host.querySelectorAll(".ao-proper-reference-staff")].map(x=>x.getBoundingClientRect().width);
   const notApproved=[...host.querySelectorAll("[data-reference-score]")].every(x=>x.dataset.approved==="false");
   return {slotIds,wrongConditions,mounted,rendered,svgCount,originalIntact,labels,ids,widths,
    notApproved,resolution:ALL_SAINTS_ALLELUIA_SOURCE_RESOLUTION,archival:ALL_SAINTS_REFERENCE_SCORES.map(x=>({
    id:x.id,part:x.part,folio:x.folio,approved:x.publicScoreApproved,sha:x.sha256
   }))};
  });
  assert.deepEqual(result.slotIds,[["GREGOBASE-752"],["GREGOBASE-371"],["GREGOBASE-1237"],["GREGOBASE-835"],["GREGOBASE-345"]]);
  assert.deepEqual(result.ids,["GREGOBASE-752","GREGOBASE-371","GREGOBASE-1237","GREGOBASE-835","GREGOBASE-345"]);
  assert.equal(result.mounted,5);
  assert.equal(result.rendered,5);
  assert.equal(result.svgCount,5,"Genuine local Exsurge SVG for all five archive GABC files");
  assert.equal(result.originalIntact,true);
  assert.equal(result.wrongConditions,true);
  assert.equal(result.notApproved,true);
  assert.equal(result.resolution.scoreId,"GREGOBASE-1237");
  assert.equal(result.resolution.expectedPrintedPages,"648-649");
  assert.deepEqual(result.resolution.sourceIndexPages,["648","[114]"]);
  assert.ok(result.labels.every(x=>x.includes("review pending")));
  assert.deepEqual(result.labels.map(x=>x.split(" · ")[0]),
   ["Introit","Gradual","Alleluia","Offertory","Communion"],
   "Each staff label must match its actual Proper chant role");
  assert.deepEqual(result.archival.map(x=>[x.id,x.part,x.folio]),[
   ["GREGOBASE-752","in","647"],["GREGOBASE-371","gr","648"],
   ["GREGOBASE-835","of","[30]"],["GREGOBASE-345","co","650"],
   ["GREGOBASE-1237","al","648, [114]"]]);
  assert.ok(result.archival.every(x=>x.approved===false && /^[a-f0-9]{64}$/.test(x.sha)));
  assert.ok(result.widths.every(x=>x>120&&x<=width),"No overflow at "+width+": "+JSON.stringify(result.widths));
  await mkdir(resolve(root,".tmp/mass-inline-all-saints"),{recursive:true});
  await page.screenshot({path:resolve(root,".tmp/mass-inline-all-saints/notation-"+width+".png"),fullPage:true});
  await page.locator(".ao-proper-reference-expand").first().click();
  await page.waitForSelector("dialog.ao-proper-reference-zoom[open] .ao-proper-reference-wide svg",{timeout:15000});
  await page.screenshot({path:resolve(root,".tmp/mass-inline-all-saints/enlarged-"+width+".png")});
  await page.locator("dialog.ao-proper-reference-zoom header button").click();
  assert.equal(await page.locator("dialog.ao-proper-reference-zoom").count(),0);
  console.log("ALL_SAINTS_FIVE_PROPER_STAVES_PASS "+JSON.stringify({width,
   ids:result.ids,rendered:result.rendered,alleluia:result.resolution.scoreId}));
  await page.close();
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok))
}
