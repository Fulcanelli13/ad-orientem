import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const server=http.createServer(async(req,res)=>{
 try{
  const target=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(target);
  res.writeHead(200,{"content-type":extname(target)===".js"?"text/javascript":
   extname(target)===".html"?"text/html":"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},
   serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded"});
  const result=await page.evaluate(async()=>{
   const {createInlineChantController,INLINE_CHANT_SCHEMA,INLINE_CHANT_CSS}=
     await import("/src/mass/reader-inline-chant.js");
   const cue1="AO.SM.C0259",cue2="AO.SM.C0260";
   const latin=["℣. Ite, missa est.","℟. Deo grátias."];
   const record=(id,text)=>({
    schema:INLINE_CHANT_SCHEMA,sourceCueId:id,sourceLatin:text,settingId:"ITE_VIII",
    approval:"USER_AND_MUSICAL_SOURCE_REVIEWED",publication:"PUBLIC_APPROVED",
    sourceTextVerified:true,musicalNotationVerified:true,
    scoreId:"TEST-NOT-PUBLISHED",gabcSha256:"a".repeat(64),
    sourceWitness:"TEST-WITNESS-NOT-PUBLISHED",sourceUrl:"https://example.org/only-test",
    gabc:"name: Test line;\n%%\n(c4)I(f)te(g) mis(h)sa(g) est(f)(::)"
   });
   const host=document.createElement("div");
   host.innerHTML='<style>'+INLINE_CHANT_CSS+'</style><section class="ao-reader-shell" data-ao-reader-shell data-mode="LIVE" style="--ao-mass-accent:#c5b0df;--ao-mass-accent-text:#f1ecf8;--ao-muted:#a7a3aa"><div class="ao-card-viewport" style="box-sizing:border-box;margin:auto;width:100%"><article style="padding:0"><div class="ao-prayer-body" style="max-width:100%"></div></article></div></section>';
   const body=host.querySelector(".ao-prayer-body");
   for(let i=0;i<2;i++){
    const p=document.createElement("p");
    p.className="ao-reader-paragraph";p.dataset.cueId=[cue1,cue2][i];
    p.dataset.active=String(i===0);
    p.innerHTML='<span class="ao-line-primary"></span><span class="ao-line-secondary"></span>';
    p.querySelector(".ao-line-primary").textContent=latin[i];
    p.querySelector(".ao-line-secondary").textContent=["Go, the Mass is ended.","Thanks be to God."][i];
    body.append(p);
   }
   document.body.replaceChildren(host);
   document.body.style.margin="0";
   host.style.width="100vw";
   const fac=({viewport})=>({observe(){},destroy(){},async engrave(){
    const el=document.createElementNS("http://www.w3.org/2000/svg","svg");
    el.setAttribute("viewBox","0 0 600 130");el.setAttribute("width","100%");
    el.innerHTML='<path fill="currentColor" d="M0 35h600v2H0z M0 45h600v2H0z M0 55h600v2H0z M0 65h600v2H0z"/><text x="30" y="100" font-size="40" fill="currentColor">Ite, missa est.</text>';
    viewport.append(el);return true;
   }});
   const controller=createInlineChantController({root:host,
    approvedScores:[record(cue1,latin[0]),record(cue2,latin[1])],
    engraverFactory:fac});
   const paragraphs=[{kind:"TEXT",sourceCueIds:[cue1],primary:latin[0]},
    {kind:"RESPONSE",sourceCueIds:[cue2],primary:latin[1]}];
   const before=controller.render({mode:"LIVE",form:"MISSA_CANTATA_SIMPLE",settingId:"ITE_VIII",paragraphs});
   await new Promise(ok=>setTimeout(ok,100));
   const rows=[...host.querySelectorAll(".ao-reader-paragraph")];
   const state=controller.state();
   const style=getComputedStyle(rows[0]);
   const displayed=(node)=>getComputedStyle(node).display;
   const first=rows[0].querySelector(".ao-line-primary");
   const score=rows[0].querySelector(".ao-inline-chant-score");
   const widths={device:window.innerWidth,body:body.getBoundingClientRect().width,
    row:rows[0].getBoundingClientRect().width,notation:score.getBoundingClientRect().width};
   const textInitiallyHidden=displayed(first)==="none";
   const trigger=rows[0].querySelector("[data-inline-chant-toggle]");
   controller.handleClick({target:trigger});
   const textAfterToggle=displayed(first)!=="none" && rows[0].dataset.inlineChantView==="text";
   const secondUnchanged=rows[1].dataset.inlineChantView==="notation";
   controller.render({mode:"LIVE",form:"LOW",settingId:"ITE_VIII",paragraphs});
   const lowPreservesOriginal=body.querySelectorAll(".ao-inline-chant-main").length===0&&
    rows[0].querySelector(".ao-line-primary").textContent===latin[0];
   controller.destroy();
   return {before,state,widths,gridCols:style.gridTemplateColumns,
    textInitiallyHidden,textAfterToggle,secondUnchanged,lowPreservesOriginal};
  });
  assert.equal(result.before,2);
  assert.equal(result.state.rendered,2);
  assert.equal(result.textInitiallyHidden,true);
  assert.equal(result.textAfterToggle,true);
  assert.equal(result.secondUnchanged,true);
  assert.equal(result.lowPreservesOriginal,true);
  assert.ok(result.widths.notation>150,
   "Notation must have room on "+width+"px phone: "+JSON.stringify(result.widths));
  assert.ok(result.widths.row<=width,
   "Inline card must not overflow device viewport "+JSON.stringify(result.widths));
  console.log("PASS "+width+"px LIVE A/C score, focus, toggles and LOW fallback "+JSON.stringify(result.widths));
  await page.close();
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
