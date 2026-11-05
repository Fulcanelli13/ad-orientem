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
   const {PARTICIPATION_REFERENCE_SCORES}=await import("/src/mass/reader-participation-reference-scores.js");
   const previewTexts=new Map();
   for(const score of PARTICIPATION_REFERENCE_SCORES){
    if(score.sourceCueIds.length===1)previewTexts.set(score.sourceCueIds[0],score.sourceLatin);
   }
   previewTexts.set("AO.SM.C0053","Glória in excélsis");
   previewTexts.set("AO.SM.C0054","Deo.");
   previewTexts.set("AO.SM.C0089","Credo");
   previewTexts.set("AO.SM.C0090","in unum Deum.");
   const cueNums=[71,136,138,140,143,210,252,53,54,89,90];
   const key=n=>"AO.SM.C"+String(n).padStart(4,"0");
   const paragraphs=cueNums.map(n=>({id:"P"+n,kind:"TEXT",primary:previewTexts.get(key(n)),
    secondary:"Original vernacular translation must survive",sourceCueIds:[key(n)]}));
   const host=document.createElement("section");host.className="ao-reader-shell";
   host.dataset.mode="LIVE";host.style.cssText="box-sizing:border-box;width:100%;--ao-text:#eeeae7;--ao-muted:#a5a5a5";
   const style=document.createElement("style");style.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.className="ao-prayer-body";
   body.style.cssText="box-sizing:border-box;width:100%;padding:0 52px;min-width:0";
   host.append(style,body);document.body.replaceChildren(host);document.body.style.margin="0";
   for(const p of paragraphs){
    const node=document.createElement("p");node.className="ao-reader-paragraph";
    node.dataset.paragraphId=p.id;node.dataset.cueId=p.sourceCueIds[0];
    node.style.cssText="min-width:0;box-sizing:border-box";
    const latin=document.createElement("span");latin.className="ao-line-primary";
    latin.textContent=p.primary;
    const en=document.createElement("span");en.className="ao-line-secondary";en.textContent=p.secondary;
    node.append(latin,en);body.append(node);
   }
   const context=kind=>({provenance:{musicToneContext:{
    schema:"ao-1962-sourced-tone-context-v1",sourceOwner:"1962_PROPER_RESOLVER",
    verified:true,celebrationKind:kind,liturgicalClass:1}}});
   const controller=createDatedProperNotationPreview({root:host,enabled:true});
   const settings={GLORIA:"MASS_08",CREDO:"CREDO_03"};
   const solemn=context("SUNDAY"),ferial=context("FERIA");
   const mounted=controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:solemn,selectedSettings:settings,paragraphs});
   for(let i=0;i<100&&controller.state().rendered<9;i++)await new Promise(r=>setTimeout(r,120));
   const rendered=controller.state().rendered,svg=body.querySelectorAll(".ao-proper-reference-staff svg").length;
   const originalTextIntact=paragraphs.every(p=>{
    const n=body.querySelector('[data-paragraph-id="'+p.id+'"]');
    return n.querySelector(".ao-line-primary").textContent===p.primary&&
     n.querySelector(".ao-line-secondary").textContent===p.secondary;
   });
   const ids=[...body.querySelectorAll("[data-reference-score]")].map(n=>n.dataset.referenceScore);
   const widths=[...body.querySelectorAll(".ao-proper-reference-staff")].map(n=>n.getBoundingClientRect().width);
   const paterVisible=body.querySelector('[data-cue-id="AO.SM.C0210"] [data-reference-score]')?.dataset.referenceScore.includes('PATERNOSTER_COMMON')===true;
   const allUnapproved=[...body.querySelectorAll("[data-reference-score]")].every(n=>n.dataset.approved==="false");
   const ferialCount=controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:ferial,selectedSettings:{},paragraphs});
   const ferialIds=[...body.querySelectorAll("[data-reference-score]")].map(n=>n.dataset.referenceScore);
   const lowCount=controller.render({mode:"LIVE",form:"LOW",resolvedMass:solemn,selectedSettings:settings,paragraphs});
   controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:solemn,selectedSettings:settings,paragraphs});
   for(let i=0;i<100&&controller.state().rendered<9;i++)await new Promise(r=>setTimeout(r,120));
   return {mounted,rendered,svg,originalTextIntact,ids,widths,paterVisible,allUnapproved,ferialCount,ferialIds,
    lowCount,restored:controller.state().rendered};
  });
  assert.equal(result.mounted,9);
  assert.equal(result.rendered,9,"Actual Exsurge must render nine source phrases");
  assert.equal(result.svg,9);
  assert.equal(result.originalTextIntact,true);
  assert.equal(result.paterVisible,true,"Identical Pater response melody from authenticated 1962 music guide");
  assert.equal(result.allUnapproved,true);
  assert.equal(result.ferialCount,5);
  assert.equal(result.lowCount,0);
  assert.equal(result.restored,9);
  assert.ok(result.ids.some(x=>x.includes("GLORIA_VIII"))&&result.ids.some(x=>x.includes("CREDO_III")));
  assert.ok(result.ids.filter(x=>x.includes("PREFACE_SOLEMN")).length===4);
  assert.equal(result.ferialIds.filter(x=>x.includes("PREFACE_FERIAL")).length,4);
  assert.equal(result.ferialIds.filter(x=>x.includes("PATERNOSTER_COMMON")).length,1);
  assert.ok(result.widths.every(x=>x>120&&x<=width),
   "Scores must fit reader safe column at "+width+" px: "+JSON.stringify(result.widths));
  await mkdir(resolve(root,".tmp/mass-participation-preview"),{recursive:true});
  await page.screenshot({path:resolve(root,".tmp/mass-participation-preview/phone-"+width+".png"),fullPage:true});
  await page.locator(".ao-proper-reference-expand").first().click();
  await page.waitForSelector("dialog.ao-proper-reference-zoom[open] .ao-proper-reference-wide svg",{timeout:12000});
  await page.screenshot({path:resolve(root,".tmp/mass-participation-preview/zoom-"+width+".png")});
  await page.locator("dialog.ao-proper-reference-zoom header button").click();
  console.log("PARTICIPATION_1961_REFERENCE_PHONE_PASS "+JSON.stringify({width,rendered:result.rendered,ferial:result.ferialCount}));
  await page.close();
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
