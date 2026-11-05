import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":extname(path)===".js"?"text/javascript":
   extname(path)===".html"?"text/html":"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message??e))}
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
   const {requiemDismissalVariantsForResolvedMass}=
    await import("/src/mass/reader-requiem-conditions.js");
   const base={schema:"ao-resolved-mass-v2",form:"SOLEMN",overlays:[]};
   const dead={...base,overlays:["REQUIEM"],provenance:{isRequiem:true}};
   const variant=requiemDismissalVariantsForResolvedMass(dead);
   const host=document.createElement("section");host.className="ao-reader-shell";
   host.dataset.mode="LIVE";
   host.style.cssText="box-sizing:border-box;width:100%;min-width:0;--ao-text:#eeeae7;--ao-muted:#aaa";
   const style=document.createElement("style");style.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.className="ao-prayer-body";
   body.style.cssText="box-sizing:border-box;width:100%;padding:0 52px;min-width:0";
   host.append(style,body);document.body.replaceChildren(host);document.body.style.margin="0";
   const ctrl=createDatedProperNotationPreview({root:host,enabled:true});
   const create=(first,reply)=>{
    const rows=[
     {id:"DISMISSAL-L",kind:"TEXT",sourceCueIds:["AO.SM.C0259"],primary:first,secondary:"English text unchanged"},
     {id:"DISMISSAL-R",kind:"TEXT",sourceCueIds:["AO.SM.C0260"],primary:reply,secondary:"English response unchanged"}
    ];
    body.replaceChildren();
    for(const p of rows){
     const node=document.createElement("p");node.className="ao-reader-paragraph";
     node.dataset.paragraphId=p.id;node.dataset.cueId=p.sourceCueIds[0];
     node.style.cssText="min-width:0;box-sizing:border-box";
     const latin=document.createElement("span");latin.className="ao-line-primary";
     latin.textContent=p.primary;
     const en=document.createElement("span");en.className="ao-line-secondary";
     en.textContent=p.secondary;
     node.append(latin,en);body.append(node);
    }
    return rows;
   };
   const wait=async expected=>{
    for(let i=0;i<90&&ctrl.state().rendered<expected;i++)
     await new Promise(ok=>setTimeout(ok,120));
    return ctrl.state().rendered;
   };
   const snapshot=rows=>({
    count:body.querySelectorAll("[data-reference-score]").length,
    svg:body.querySelectorAll(".ao-proper-reference-staff svg").length,
    ids:[...body.querySelectorAll("[data-reference-score]")].map(n=>n.dataset.referenceScore),
    widths:[...body.querySelectorAll(".ao-proper-reference-staff")].map(n=>n.getBoundingClientRect().width),
    textUnchanged:rows.every(p=>{
     const n=body.querySelector('[data-paragraph-id="'+p.id+'"]');
     return n.querySelector(".ao-line-primary").textContent===p.primary&&
      n.querySelector(".ao-line-secondary").textContent===p.secondary;
    }),
    researchOnly:[...body.querySelectorAll("[data-reference-score]")].every(n=>n.dataset.approved==="false")
   });
   const ordinaryPlan={kind:"MASS",dismissal:"BENEDICAMUS_DOMINO"};
   const rePlan={kind:"MASS",dismissal:"REQUIESCANT_IN_PACE"};
   const bened=create("℣. Benedicámus Dómino.","℟. Deo grátias.");
   const selection={DISMISSAL:"BENEDICAMUS_VIII"};
   const benedMounted=ctrl.render({mode:"LIVE",form:"SOLEMN",resolvedMass:base,
    massPlan:ordinaryPlan,selectedSettings:selection,paragraphs:bened});
   const benedRendered=await wait(2),benedProof=snapshot(bened);
   const wrongSettingCount=ctrl.render({mode:"LIVE",form:"SOLEMN",resolvedMass:base,
    massPlan:ordinaryPlan,selectedSettings:{},paragraphs:bened});
   const wrongPlanCount=ctrl.render({mode:"LIVE",form:"SOLEMN",resolvedMass:base,
    massPlan:{kind:"MASS",dismissal:"ITE_MISSA_EST"},selectedSettings:selection,paragraphs:bened});
   const requiem=create(variant["AO.SM.C0259"].lat,variant["AO.SM.C0260"].lat);
   const reqMounted=ctrl.render({mode:"LIVE",form:"SOLEMN",resolvedMass:dead,
    massPlan:rePlan,paragraphs:requiem});
   const reqRendered=await wait(2),reqProof=snapshot(requiem);
   const wrongRequiemIdentity=ctrl.render({mode:"LIVE",form:"SOLEMN",resolvedMass:base,
    massPlan:rePlan,paragraphs:requiem});
   const lowCount=ctrl.render({mode:"LIVE",form:"LOW",resolvedMass:dead,
    massPlan:rePlan,paragraphs:requiem});
   ctrl.render({mode:"LIVE",form:"SOLEMN",resolvedMass:dead,
    massPlan:rePlan,paragraphs:requiem});
   const restored=await wait(2);
   return {benedMounted,benedRendered,benedProof,wrongSettingCount,wrongPlanCount,
    reqMounted,reqRendered,reqProof,wrongRequiemIdentity,lowCount,restored};
  });
  assert.equal(result.benedMounted,2);
  assert.equal(result.benedRendered,2,"Original 1961 Benedicamus must engrave as 2 SVGs");
  assert.equal(result.reqMounted,2);
  assert.equal(result.reqRendered,2,"Original 1961 Requiescant must engrave as 2 SVGs");
  assert.equal(result.wrongSettingCount,0);
  assert.equal(result.wrongPlanCount,0);
  assert.equal(result.wrongRequiemIdentity,0);
  assert.equal(result.lowCount,0);
  assert.equal(result.restored,2);
  for(const proof of [result.benedProof,result.reqProof]){
   assert.equal(proof.count,2);assert.equal(proof.svg,2);
   assert.equal(proof.textUnchanged,true);assert.equal(proof.researchOnly,true);
   assert.ok(proof.widths.every(n=>n>120&&n<=width),
    "No clipped Gregorian staff at "+width+"px "+JSON.stringify(proof.widths));
  }
  assert.ok(result.benedProof.ids.every(x=>x.includes("BENEDICAMUS_VIII")));
  assert.ok(result.reqProof.ids.every(x=>x.includes("REQUIESCANT")));
  await mkdir(resolve(root,".tmp/mass-dismissal-variant-preview"),{recursive:true});
  await page.screenshot({path:resolve(root,".tmp/mass-dismissal-variant-preview/requiescant-"+width+".png"),fullPage:true});
  await page.locator(".ao-proper-reference-expand").first().click();
  await page.waitForSelector("dialog.ao-proper-reference-zoom[open] .ao-proper-reference-wide svg",{timeout:12000});
  await page.screenshot({path:resolve(root,".tmp/mass-dismissal-variant-preview/zoom-"+width+".png")});
  await page.locator("dialog.ao-proper-reference-zoom header button").click();
  console.log("DISMISSAL_1961_REFERENCE_PHONE_PASS "+JSON.stringify({width,bened:2,requiescant:2,sourceTextIntact:true}));
  await page.close();
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
