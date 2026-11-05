import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {ST_ANDREW_REFERENCE_SCORES} from "../src/mass/reader-inline-st-andrew-reference.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
assert.deepEqual(ST_ANDREW_REFERENCE_SCORES.map(s=>[s.id,s.part,s.folio]),[
 ["GREGOBASE-475","in","392"],["GREGOBASE-307","gr","393"],
 ["GREGOBASE-984","al","393"],["GREGOBASE-499","of","394"],
 ["GREGOBASE-552","co","395"]
]);
// Each displayed score must be the original GABC bytes from the existing
// 1,195-record archive. No new scraping and no melody/title substitution.
const archivePaths=[...new Set(ST_ANDREW_REFERENCE_SCORES.map(s=>s.archivePath))];
const archives=await Promise.all(archivePaths.map(async path=>
 JSON.parse(await readFile(resolve(root,path),"utf8"))));
const originals=new Map(archives.flatMap(a=>a.items).map(x=>[x.id,x]));
for(const score of ST_ANDREW_REFERENCE_SCORES){
 const original=originals.get(score.id);
 assert.ok(original,"Archived score is missing "+score.id);
 assert.equal(score.sha256,original.sha256);
 assert.equal(score.part,original.officePart);
 assert.equal(score.folio,original.gradualeRomanum1961Page);
 assert.equal(score.gabc.split("\n%%\n")[1],original.gabc);
 assert.equal(score.publicScoreApproved,false);
}
const communion=ST_ANDREW_REFERENCE_SCORES.find(s=>s.key==="COMMUNION");
assert.equal(communion.liturgicalTextWitness,
 "1961_GRADUALE_SUNG_WORDING_DIFFERS_FROM_1962_MISSALE_ANTIPHON");
assert.match(communion.variantNote,/1962 Missal/);
assert.match(communion.variantNote,/fieri/);
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":extname(file)===".js"?"text/javascript":
   extname(file)===".html"?"text/html":"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded"});
  const result=await page.evaluate(async()=>{
   const {referenceScoresForParagraph,createDatedProperNotationPreview,JULY07_REFERENCE_CSS}=
    await import("/src/mass/reader-inline-proper-reference.js");
   const mass={date:"2026-11-30",proper:{data:{sourcePath:"Sancti/11-30"}},overlays:[],
    form:"MISSA_CANTATA_SIMPLE"};
   const paragraphs=[
    {id:"INTROIT.1",kind:"TEXT",primary:"Mihi autem nimis honoráti sunt amíci tui, Deus: nimis confortátus est principátus eórum.",alternate:"Your friends are greatly honoured"},
    {id:"GRADUAL.1",kind:"TEXT",primary:"Constítues eos príncipes super omnem terram: mémores erunt nóminis tui, Dómine.",alternate:"Thou shalt make them princes"},
    {id:"ALLELUIA_TRACT_SEQUENCE.1",kind:"TEXT",primary:"Diléxit Andréam Dóminus in odórem suavitátis.",alternate:"The Lord loved Andrew"},
    {id:"OFFERTORY.1",kind:"TEXT",primary:"Mihi autem nimis honoráti sunt amíci tui, Deus: nimis confortátus est principátus eórum.",alternate:"Your friends are greatly honoured"},
    {id:"COMMUNION.1",kind:"TEXT",primary:"Veníte post me: fáciam vos fíeri piscatóres hóminum; at illi contínuo, relíctis rétibus, secúti sunt Dóminum.",alternate:"Come after me"}
   ];
   const ids=paragraphs.map(p=>referenceScoresForParagraph({paragraph:p,resolvedMass:mass,form:mass.form}).map(s=>s.id));
   const rejected=[
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,date:"2026-11-29"},form:mass.form}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,proper:{sourcePath:"Tempora/Adv1-0"}},form:mass.form}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:mass,form:"LOW"}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,overlays:["REQUIEM"]},form:mass.form}),
    referenceScoresForParagraph({paragraph:{...paragraphs[0],primary:"Unrelated text"},resolvedMass:mass,form:mass.form}),
    referenceScoresForParagraph({paragraph:{...paragraphs[0],id:"COMMUNION.1"},resolvedMass:mass,form:mass.form})
   ].every(x=>x.length===0);
   const host=document.createElement("section");host.className="ao-reader-shell";host.dataset.mode="LIVE";
   host.style.cssText="width:100%;box-sizing:border-box;display:block;--ao-text:#eeeae7;--ao-muted:#a5a5a5";
   const style=document.createElement("style");style.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.style.cssText="width:100%;box-sizing:border-box;padding:0 52px;min-width:0";
   body.className="ao-prayer-body";host.append(style,body);document.body.replaceChildren(host);document.body.style.margin="0";
   for(const p of paragraphs){
    const node=document.createElement("p");node.className="ao-reader-paragraph";
    node.dataset.paragraphId=p.id;node.style.cssText="box-sizing:border-box;min-width:0";
    const primary=document.createElement("span");primary.className="ao-line-primary";primary.textContent=p.primary;
    const alternate=document.createElement("span");alternate.className="ao-line-secondary";alternate.textContent=p.alternate;
    node.append(primary,alternate);body.append(node);
   }
   const ctrl=createDatedProperNotationPreview({root:host,enabled:true});
   ctrl.render({mode:"LIVE",form:mass.form,resolvedMass:mass,paragraphs});
   for(let i=0;i<100&&ctrl.state().rendered<5;i++)await new Promise(r=>setTimeout(r,120));
   const rendered=ctrl.state().rendered;
   const svg=body.querySelectorAll(".ao-proper-reference-staff svg").length;
   const sourceIntact=paragraphs.every(p=>{
    const node=body.querySelector('[data-paragraph-id="'+p.id+'"]');
    return node.querySelector(".ao-line-primary").textContent===p.primary &&
      node.querySelector(".ao-line-secondary").textContent===p.alternate;
   });
   const scoreIds=[...body.querySelectorAll("[data-reference-score]")].map(x=>x.dataset.referenceScore);
   const labels=[...body.querySelectorAll(".ao-proper-reference-label")].map(x=>x.textContent);
   const widths=[...body.querySelectorAll(".ao-proper-reference-staff")].map(x=>x.getBoundingClientRect().width);
   return {ids,rejected,rendered,svg,sourceIntact,scoreIds,labels,widths};
  });
  const expected=["GREGOBASE-475","GREGOBASE-307","GREGOBASE-984","GREGOBASE-499","GREGOBASE-552"];
  assert.deepEqual(result.ids,expected.map(x=>[x]));
  assert.deepEqual(result.scoreIds,expected);
  assert.equal(result.rejected,true);
  assert.equal(result.rendered,5);
  assert.equal(result.svg,5,"Real Exsurge must engrave all five 1961 St Andrew scores");
  assert.equal(result.sourceIntact,true,"No Missal word variant may overwrite original source text");
  assert.deepEqual(result.labels.map(x=>x.split(" · ")[0]),
   ["Introit","Gradual","Alleluia","Offertory","Communion"]);
  assert.ok(result.labels.every(x=>x.includes("review pending")));
  assert.ok(result.widths.every(x=>x>120&&x<=width));
  await mkdir(resolve(root,".tmp/mass-inline-st-andrew"),{recursive:true});
  await page.screenshot({path:resolve(root,".tmp/mass-inline-st-andrew/notation-"+width+".png"),fullPage:true});
  await page.locator(".ao-proper-reference-expand").first().click();
  await page.waitForSelector("dialog.ao-proper-reference-zoom[open] .ao-proper-reference-wide svg",{timeout:15000});
  await page.screenshot({path:resolve(root,".tmp/mass-inline-st-andrew/enlarged-"+width+".png")});
  await page.locator("dialog.ao-proper-reference-zoom header button").click();
  assert.equal(await page.locator("dialog.ao-proper-reference-zoom").count(),0);
  console.log("ST_ANDREW_FIVE_PROPER_STAVES_PASS "+JSON.stringify({width,scoreIds:result.scoreIds,rendered:result.rendered}));
  await page.close();
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
