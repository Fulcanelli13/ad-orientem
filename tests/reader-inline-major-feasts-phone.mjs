import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {MAJOR_FEAST_REFERENCE_SCORES} from "../src/mass/reader-inline-major-feasts-reference.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const roster=[
 {sourcePath:"Tempora/Adv3-0",date:"2026-12-13",name:"gaudete",
  ids:["GREGOBASE-1225","GREGOBASE-1007","GREGOBASE-855","GREGOBASE-113","GREGOBASE-218"]},
 {sourcePath:"Sancti/01-06",date:"2027-01-06",name:"epiphany",
  ids:["GREGOBASE-403","GREGOBASE-205","GREGOBASE-524","GREGOBASE-1147","GREGOBASE-918"]}
];
const idToSlot={INTROIT:"INTROIT.1",GRADUAL:"GRADUAL.1",
 ALLELUIA:"ALLELUIA_TRACT_SEQUENCE.1",OFFERTORY:"OFFERTORY.1",
 COMMUNION:"COMMUNION.1"};
const files=[...new Set(MAJOR_FEAST_REFERENCE_SCORES.map(x=>x.archivePath))];
const archives=await Promise.all(files.map(p=>readFile(resolve(root,p),"utf8").then(JSON.parse)));
const originals=new Map(archives.flatMap(b=>b.items).map(r=>[r.id,r]));
const coverage=JSON.parse(await readFile(resolve(root,"data/research/mass-music-1962-91-source-first-coverage.v1.json"),"utf8"));
for(const fixture of roster){
 const rows=MAJOR_FEAST_REFERENCE_SCORES.filter(s=>s.sourcePath===fixture.sourcePath);
 assert.deepEqual(rows.map(x=>x.id),fixture.ids);
 const witness=coverage.sourceFiles.find(x=>x.sourcePath===fixture.sourcePath);
 assert.equal(witness?.sourceAuthenticated,true);
 assert.equal(witness?.tracks?.length,5);
 for(const [i,score] of rows.entries()){
  const archival=originals.get(score.id);
  const track=witness.tracks[i],source=track.candidates[0];
  assert.equal(track.status,"UNIQUE_TEXT_CANDIDATE");
  assert.equal(track.candidates.length,1);
  assert.equal(source.id,score.id);
  assert.equal(score.sourceWitnessLatin,track.latinIncipit);
  assert.equal(score.sourceBlobSha,witness.sourceBlobSha);
  assert.equal(score.sha256,source.sha256);
  assert.equal(score.sha256,archival?.sha256);
  assert.equal(score.part,archival?.officePart);
  assert.equal(score.part,track.part);
  assert.equal(score.folio,archival?.gradualeRomanum1961Page);
  assert.equal(score.gabc.split("\n%%\n")[1],archival.gabc,
   "Must preserve original 1961 archive score bytes: "+score.id);
  assert.equal(score.publicScoreApproved,false);
 }
}
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);const ext=extname(file);
  res.writeHead(200,{"content-type":ext===".js"?"text/javascript":ext===".html"?"text/html":"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const fixture of roster)for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded"});
  const result=await page.evaluate(async config=>{
   const {createDatedProperNotationPreview,referenceScoresForParagraph,JULY07_REFERENCE_CSS}=
    await import("/src/mass/reader-inline-proper-reference.js");
   const {MAJOR_FEAST_REFERENCE_SCORES}=await import("/src/mass/reader-inline-major-feasts-reference.js");
   const rows=MAJOR_FEAST_REFERENCE_SCORES.filter(s=>s.sourcePath===config.sourcePath);
   const mass={date:config.date,proper:{data:{sourcePath:config.sourcePath}},overlays:[],form:"MISSA_CANTATA_SIMPLE"};
   const paragraphs=rows.map(s=>({id:config.slotMap[s.key],kind:"TEXT",
    primary:s.sourceWitnessLatin,alternate:"English translation retained separately"}));
   const ids=paragraphs.map(p=>referenceScoresForParagraph({paragraph:p,resolvedMass:mass,form:mass.form}).map(s=>s.id));
   const otherProper=config.sourcePath==="Sancti/01-06"?"Sancti/01-07":"Tempora/Adv2-0";
   const wrong=[
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,proper:{data:{sourcePath:otherProper}}},form:mass.form}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:mass,form:"LOW"}),
    referenceScoresForParagraph({paragraph:paragraphs[0],resolvedMass:{...mass,overlays:["REQUIEM"]},form:mass.form}),
    referenceScoresForParagraph({paragraph:{...paragraphs[0],primary:"Different Introit"},resolvedMass:mass,form:mass.form})
   ].every(x=>x.length===0);
   const host=document.createElement("section");host.className="ao-reader-shell";host.dataset.mode="LIVE";
   host.style.cssText="box-sizing:border-box;width:100%;--ao-text:#eeeae7;--ao-muted:#a5a5a5";
   const style=document.createElement("style");style.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.style.cssText="box-sizing:border-box;min-width:0;width:100%;padding:0 52px";
   host.append(style,body);document.body.replaceChildren(host);document.body.style.margin="0";
   for(const p of paragraphs){
    const node=document.createElement("p");node.className="ao-reader-paragraph";
    node.dataset.paragraphId=p.id;node.style.cssText="box-sizing:border-box;min-width:0";
    const latin=document.createElement("span");latin.className="ao-line-primary";latin.textContent=p.primary;
    const en=document.createElement("span");en.className="ao-line-secondary";en.textContent=p.alternate;
    node.append(latin,en);body.append(node);
   }
   const controller=createDatedProperNotationPreview({root:host,enabled:true});
   const count=controller.render({mode:"LIVE",form:mass.form,resolvedMass:mass,paragraphs});
   for(let i=0;i<100&&controller.state().rendered<5;i++)await new Promise(r=>setTimeout(r,120));
   const rendered=controller.state().rendered;
   const svg=body.querySelectorAll(".ao-proper-reference-staff svg").length;
   const actual=[...body.querySelectorAll("[data-reference-score]")].map(x=>x.dataset.referenceScore);
   const originalTextIntact=paragraphs.every(p=>{
    const node=body.querySelector('[data-paragraph-id="'+p.id+'"]');
    return node.querySelector(".ao-line-primary").textContent===p.primary &&
      node.querySelector(".ao-line-secondary").textContent===p.alternate;
   });
   const widths=[...body.querySelectorAll(".ao-proper-reference-staff")].map(x=>x.getBoundingClientRect().width);
   const labels=[...body.querySelectorAll(".ao-proper-reference-label")].map(x=>x.textContent);
   const noApproval=[...body.querySelectorAll("[data-reference-score]")].every(x=>x.dataset.approved==="false");
   return {ids,wrong,count,rendered,svg,actual,originalTextIntact,widths,labels,noApproval};
  },{sourcePath:fixture.sourcePath,date:fixture.date,slotMap:idToSlot});
  assert.deepEqual(result.ids,fixture.ids.map(x=>[x]));
  assert.deepEqual(result.actual,fixture.ids);
  assert.equal(result.wrong,true);
  assert.equal(result.count,5);
  assert.equal(result.rendered,5,"All five authentic GABC scores must render via Exsurge");
  assert.equal(result.svg,5);
  assert.equal(result.originalTextIntact,true);
  assert.equal(result.noApproval,true);
  assert.deepEqual(result.labels.map(x=>x.split(" · ")[0]),
   ["Introit","Gradual","Alleluia","Offertory","Communion"]);
  assert.ok(result.labels.every(x=>x.includes("review pending")));
  assert.ok(result.widths.every(x=>x>120&&x<=width));
  await mkdir(resolve(root,".tmp/mass-inline-major-feasts"),{recursive:true});
  await page.screenshot({path:resolve(root,".tmp/mass-inline-major-feasts/"+fixture.name+"-"+width+".png"),fullPage:true});
  await page.locator(".ao-proper-reference-expand").first().click();
  await page.waitForSelector("dialog.ao-proper-reference-zoom[open] .ao-proper-reference-wide svg",{timeout:15000});
  await page.screenshot({path:resolve(root,".tmp/mass-inline-major-feasts/"+fixture.name+"-enlarged-"+width+".png")});
  await page.locator("dialog.ao-proper-reference-zoom header button").click();
  assert.equal(await page.locator("dialog.ao-proper-reference-zoom").count(),0);
  console.log("MAJOR_FEAST_FIVE_SCORES_PHONE_PASS "+JSON.stringify({feast:fixture.name,width,ids:fixture.ids}));
  await page.close();
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
