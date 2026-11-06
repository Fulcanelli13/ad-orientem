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
   extname(file)===".html"?"text/html":"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
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
   const {createDatedProperNotationPreview,JULY07_REFERENCE_CSS}=
    await import("/src/mass/reader-inline-proper-reference.js");
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const {composeProperReaderParagraphs}=await import("/src/mass/proper-reader-composition.js");
   const q={lat:"Da nobis Domine misericordiam tuam. Qui tecum vivit et regnat in unitate Spiritus Sancti Deus, per omnia saecula saeculorum. Amen.",
    en:"Grant us, O Lord, Thy mercy. Through our Lord. Amen.",
    fr:"Donnez-nous, Seigneur, votre misericorde. Ainsi soit-il."};
   const sourcePath="Tempora/Quad01-0";
   const proper={sourcePath,introit:q,epistle:q,gradual:q,gospel:q,
    offertory:q,secrets:[q],communion:q,preface:q,collects:[q],postcommunions:[q]};
   const rows=composeProperReaderParagraphs("AO.SM.B019",
    properToReaderSlots(proper,{language:"en"}).slots.COLLECT_SET.data.paragraphs,
    {language:"en",form:"SUNG"});
   const host=document.createElement("section");host.className="ao-reader-shell";
   host.style.cssText="box-sizing:border-box;width:100%;--ao-text:#eeeae7;--ao-muted:#a5a5a5";
   const style=document.createElement("style");style.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.className="ao-prayer-body";
   body.style.cssText="box-sizing:border-box;width:100%;padding:0 38px;min-width:0";
   host.append(style,body);document.body.replaceChildren(host);document.body.style.margin="0";
   for(const p of rows){
    const node=document.createElement("p");node.className="ao-reader-paragraph";
    node.dataset.paragraphId=p.id;
    node.style.cssText="min-width:0;box-sizing:border-box";
    const lat=document.createElement("span");lat.className="ao-line-primary";
    lat.textContent=p.latin??p.primary??"";
    const en=document.createElement("span");en.className="ao-line-secondary";
    en.textContent=typeof p.vernacular==="string"?p.vernacular:(p.vernacular?.en??p.secondary??"");
    node.append(lat,en);body.append(node);
   }
   const originals=[...body.querySelectorAll(".ao-reader-paragraph")].map(node=>({
    id:node.dataset.paragraphId,
    primary:node.querySelector(".ao-line-primary").textContent,
    secondary:node.querySelector(".ao-line-secondary").textContent
   }));
   const resolved=(kind)=>({schema:"ao-resolved-mass-v2",form:"SOLEMN",
    proper:{status:"READY",sourcePath,data:proper},
    provenance:{musicToneContext:{schema:"ao-1962-sourced-tone-context-v1",
     sourceOwner:"1962_PROPER_RESOLVER",verified:true,sourcePath,
     onlyForCommonMassPrayerTones:true,celebrationKind:kind,liturgicalClass:1}}});
   const controller=createDatedProperNotationPreview({root:host,enabled:true});
   const festive=controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:resolved("SUNDAY"),paragraphs:rows});
   for(let i=0;i<80&&controller.state().rendered<1;i++)await new Promise(r=>setTimeout(r,100));
   const ready=controller.state().rendered;
   const svg=body.querySelectorAll(".ao-proper-reference-staff svg").length;
   const width=body.querySelector(".ao-proper-reference-staff")?.getBoundingClientRect().width;
   const ids=[...body.querySelectorAll("[data-reference-score]")].map(x=>x.dataset.referenceScore);
   const allUnapproved=[...body.querySelectorAll("[data-reference-score]")].every(x=>x.dataset.approved==="false");
   const sourceTextVisible=[...body.querySelectorAll(".ao-line-primary")].some(n=>
    n.textContent.includes("per omnia saecula saeculorum")) &&
    [...body.querySelectorAll(".ao-line-secondary")].some(n=>
    n.textContent.includes("Grant us"));
   const intact=originals.every(p=>{
    const node=[...body.querySelectorAll(".ao-reader-paragraph")].find(n=>n.dataset.paragraphId===p.id);
    return node?.querySelector(".ao-line-primary")?.textContent===p.primary&&
      node?.querySelector(".ao-line-secondary")?.textContent===p.secondary;
   });
   const ferial=controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:resolved("FERIA"),paragraphs:rows});
   const ferialNoteCount=body.querySelectorAll("[data-oration-tone-status='FERIAL_RECTO_TONO_NO_FIXED_AMEN_SCORE']").length;
   const ferialNoteText=body.querySelector("[data-oration-tone-status='FERIAL_RECTO_TONO_NO_FIXED_AMEN_SCORE']")?.textContent;
   const ferialSvg=body.querySelectorAll(".ao-proper-reference-staff svg").length;
   const oldSolemn=controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:resolved("SUNDAY"),paragraphs:rows,
    selectedSettings:{ORATION_TONE:"OLD_SOLEMN_1961"}});
   const oldNoteCount=body.querySelectorAll("[data-oration-tone-status='OPTIONAL_OLD_SOLEMN_NOTES_PENDING']").length;
   const oldSvg=body.querySelectorAll(".ao-proper-reference-staff svg").length;
   controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:resolved("FERIA"),paragraphs:rows,
    selectedSettings:{LANGUAGE:"fr"}});
   const frenchText=body.querySelector("[data-oration-tone-status='FERIAL_RECTO_TONO_NO_FIXED_AMEN_SCORE']")?.textContent;
   const low=controller.render({mode:"LIVE",form:"LOW",resolvedMass:resolved("SUNDAY"),paragraphs:rows});
   const lowNotes=body.querySelectorAll("[data-oration-tone-status]").length;
   controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:resolved("SUNDAY"),paragraphs:rows});
   for(let i=0;i<80&&controller.state().rendered<1;i++)await new Promise(r=>setTimeout(r,100));
   return {festive,ready,svg,width,ids,allUnapproved,sourceTextVisible,intact,
    ferial,ferialNoteCount,ferialNoteText,ferialSvg,oldSolemn,oldNoteCount,oldSvg,
    frenchText,low,lowNotes,restored:controller.state().rendered};
  });
  assert.equal(result.festive,1);
  assert.equal(result.ready,1);
  assert.equal(result.svg,1);
  assert.equal(result.allUnapproved,true);
  assert.equal(result.sourceTextVisible,true,"Latin oration and vernacular must actually display");
  assert.equal(result.intact,true);
  assert.equal(result.ferial,0);
  assert.equal(result.ferialNoteCount,1);
  assert.match(result.ferialNoteText,/recto tono/);
  assert.equal(result.ferialSvg,0,"No invented ferial staff");
  assert.equal(result.oldSolemn,0,"Explicit old solemn selection must suppress default festive score");
  assert.equal(result.oldNoteCount,1);
  assert.equal(result.oldSvg,0);
  assert.match(result.frenchText,/pas de partition fixe/);
  assert.equal(result.low,0);
  assert.equal(result.lowNotes,0);
  assert.equal(result.restored,1);
  assert.ok(result.ids[0].includes("ORATION_FESTIVE_AMEN"));
  assert.ok(result.width>90&&result.width<=width);
  await mkdir(resolve(root,".tmp/mass-oration-amen-preview"),{recursive:true});
  await page.screenshot({path:resolve(root,".tmp/mass-oration-amen-preview/phone-"+width+".png"),fullPage:true});
  console.log("FESTIVE_ORATION_AMEN_PHONE_PASS "+JSON.stringify({width,rendered:result.ready,ferial:result.ferial}));
  await page.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
