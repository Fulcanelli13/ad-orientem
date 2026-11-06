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
  const origin="http://127.0.0.1:"+server.address().port;
  await page.goto(origin+"/index.html?chant_preview=1&greeting_transfer=1961",
   {waitUntil:"domcontentloaded"});
  const result=await page.evaluate(async()=>{
   const {createDatedProperNotationPreview,JULY07_REFERENCE_CSS}=
    await import("/src/mass/reader-inline-proper-reference.js");
   const rows=[
    {id:"E",kind:"TEXT",sourceCueIds:["AO.SM.C0107"],sourceBlockId:"AO.SM.B028",
     speakerRole:"RESPONDERS",primary:"℟. Et cum spíritu tuo.",
     secondary:"And with thy spirit.",label:"Offertory"},
    {id:"D",kind:"TEXT",sourceCueIds:["AO.SM.C0258"],sourceBlockId:"AO.SM.B089",
     speakerRole:"RESPONDERS",primary:"℟. Et cum spíritu tuo.",
     secondary:"And with thy spirit.",label:"Dismissal"}
   ];
   const host=document.createElement("section");host.className="ao-reader-shell";
   host.style.cssText="width:100%;box-sizing:border-box;--ao-text:#e8e5df;--ao-muted:#bbb";
   const st=document.createElement("style");st.textContent=JULY07_REFERENCE_CSS;
   const body=document.createElement("div");body.style.cssText="padding:0 40px;box-sizing:border-box;width:100%";
   host.append(st,body);document.body.replaceChildren(host);document.body.style.margin="0";
   for(const p of rows){
    const node=document.createElement("p");node.className="ao-reader-paragraph";
    node.dataset.paragraphId=p.id;node.dataset.cueId=p.sourceCueIds[0];
    node.style.cssText="width:100%;box-sizing:border-box;min-width:0";
    const latin=document.createElement("span");latin.className="ao-line-primary";
    latin.textContent=p.primary;
    const en=document.createElement("span");en.className="ao-line-secondary";
    en.textContent=p.secondary;node.append(latin,en);body.append(node);
   }
   const mass=kind=>({
    schema:"ao-resolved-mass-v2",form:"SOLEMN",proper:{
     status:"READY",sourcePath:"Tempora/Quad01-0",
     data:{sourcePath:"Tempora/Quad01-0"}},
    provenance:{musicToneContext:{schema:"ao-1962-sourced-tone-context-v1",
     sourceOwner:"1962_PROPER_RESOLVER",verified:true,sourcePath:"Tempora/Quad01-0",
     celebrationKind:kind,liturgicalClass:1}}
   });
   const controller=createDatedProperNotationPreview({root:host});
   const source=mass("SUNDAY");
   const displayed=controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:source,paragraphs:rows});
   for(let i=0;i<100&&controller.state().rendered<2;i++)await new Promise(r=>setTimeout(r,100));
   const on=controller.state().rendered,svg=body.querySelectorAll(".ao-proper-reference-staff svg").length;
   const titles=[...body.querySelectorAll(".ao-proper-reference-label")].map(x=>x.textContent);
   const scoreIds=[...body.querySelectorAll("[data-reference-score]")].map(x=>x.dataset.referenceScore);
   const widths=[...body.querySelectorAll(".ao-proper-reference-staff")].map(x=>x.getBoundingClientRect().width);
   const textIntact=rows.every(p=>{
    const n=body.querySelector('[data-paragraph-id="'+p.id+'"]');
    return n?.querySelector(".ao-line-primary")?.textContent===p.primary&&
     n?.querySelector(".ao-line-secondary")?.textContent===p.secondary;
   });
   const unapproved=[...body.querySelectorAll("[data-reference-score]")].every(n=>n.dataset.approved==="false");
   const ferial=controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:mass("FERIA"),paragraphs:rows});
   const ferialRemnants=body.querySelectorAll("[data-reference-score]").length;
   const low=controller.render({mode:"LIVE",form:"LOW",resolvedMass:source,paragraphs:rows});
   const missal=controller.render({mode:"MISSAL",form:"SOLEMN",resolvedMass:source,paragraphs:rows});
   const absent=controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:{...source,provenance:{}},paragraphs:rows});
   controller.render({mode:"LIVE",form:"SOLEMN",resolvedMass:source,paragraphs:rows});
   for(let i=0;i<100&&controller.state().rendered<2;i++)await new Promise(r=>setTimeout(r,100));
   return {displayed,on,svg,titles,scoreIds,widths,textIntact,unapproved,
    ferial,ferialRemnants,low,missal,absent,restored:controller.state().rendered};
  });
  assert.equal(result.displayed,2);
  assert.equal(result.on,2);
  assert.equal(result.svg,2);
  assert.equal(result.textIntact,true);
  assert.equal(result.unapproved,true);
  assert.ok(result.titles.every(x=>x.includes("NOT source-certified")));
  assert.ok(result.scoreIds.some(x=>x.includes("_OFFERTORY.")));
  assert.ok(result.scoreIds.some(x=>x.includes("_DISMISSAL.")));
  assert.ok(result.widths.every(x=>x>90&&x<=width));
  assert.equal(result.ferial,0);
  assert.equal(result.ferialRemnants,0);
  assert.equal(result.low,0);
  assert.equal(result.missal,2);
  assert.equal(result.absent,0);
  assert.equal(result.restored,2);
  await mkdir(resolve(root,".tmp/mass-two-greeting-context-hypotheses"),{recursive:true});
  await page.screenshot({path:resolve(root,
   ".tmp/mass-two-greeting-context-hypotheses/phone-"+width+".png"),fullPage:true});
  await page.goto(origin+"/index.html?chant_preview=1",{waitUntil:"domcontentloaded"});
  const defaultCount=await page.evaluate(async()=>{
   const {createDatedProperNotationPreview}=await import("/src/mass/reader-inline-proper-reference.js");
   const root=document.createElement("div");
   const p={id:"E",kind:"TEXT",sourceCueIds:["AO.SM.C0107"],sourceBlockId:"AO.SM.B028",
    primary:"℟. Et cum spíritu tuo."};
   const node=document.createElement("p");node.className="ao-reader-paragraph";node.dataset.paragraphId="E";
   root.append(node);document.body.append(root);
   const m={schema:"ao-resolved-mass-v2",form:"SOLEMN",
    proper:{status:"READY",sourcePath:"Tempora/Quad01-0",data:{sourcePath:"Tempora/Quad01-0"}},
    provenance:{musicToneContext:{schema:"ao-1962-sourced-tone-context-v1",
     sourceOwner:"1962_PROPER_RESOLVER",verified:true,sourcePath:"Tempora/Quad01-0",
     celebrationKind:"SUNDAY",liturgicalClass:1}}};
   return createDatedProperNotationPreview({root}).render({
    mode:"LIVE",form:"SOLEMN",resolvedMass:m,paragraphs:[p]});
  });
  assert.equal(defaultCount,0,"No second opt-in means no candidate score");
  console.log("PASS two greeting context candidates, 320/390px; hypothesis-only, no low/ferial/normal leak",width);
  await page.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
