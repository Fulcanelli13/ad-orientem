// Research-board acceptance: 1961 Most Solemn Preface, four new scores.
// This fixture is deliberately NOT a public Mass reader import.
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
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",
   ".css":"text/css",".json":"application/json"}[extname(path)]??"application/octet-stream";
  res.writeHead(200,{"content-type":mime,"cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((done,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",done)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1180]){
  const page=await browser.newPage({viewport:{width,height:width===1180?850:844},serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  await page.goto("http://127.0.0.1:"+server.address().port+
    "/tests/fixtures/reader-preface-solemnior-source-review.html",
    {waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>document.documentElement.dataset.solemniorReady!==undefined,
   null,{timeout:25000});
  const report=await page.evaluate(()=>{
   const states=window.__AO_SOLEMNIOR_REVIEW.state();
   const cards=[...document.querySelectorAll("article.score")];
   const links=[...document.querySelectorAll('[data-original1961-plate="true"]')];
   const noOverlap=cards.every(c=>c.scrollWidth<=c.clientWidth+2);
   return {state:states,cardCount:cards.length,svgCount:cards.filter(c=>c.querySelector("svg")).length,
    sourcePages:links.length,uniquePages:new Set(links.map(l=>l.href)).size,
    researchOnly:cards.every(c=>c.dataset.publicApproved==="false"),
    statuses:cards.every(c=>c.querySelector(".status")?.textContent.includes("PENDING")),
    badSvgCards:cards.filter(c=>c.querySelector(".stave")?.scrollWidth>
       c.querySelector(".stave")?.clientWidth+2).map(c=>c.dataset.sourceCue),
    documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,noOverlap,
    ready:document.documentElement.dataset.solemniorReady};
  });
  assert.deepEqual(errors,[]);
  assert.equal(report.ready,"true");
  assert.deepEqual(report.state,{scores:4,engraved:4,failed:0,
    publicApprovals:0,sourcePrintedPages:2,allResearchOnly:true});
  assert.equal(report.cardCount,4);
  assert.equal(report.svgCount,4);
  assert.equal(report.sourcePages,8);
  assert.equal(report.uniquePages,2);
  assert.equal(report.researchOnly,true);
  assert.equal(report.statuses,true);
  assert.deepEqual(report.badSvgCards,[]);
  assert.ok(report.documentWidth<=report.viewportWidth+1,"No phone overflow "+JSON.stringify(report));
  await mkdir(resolve(root,".tmp/mass-preface-solemnior-1961"),{recursive:true});
  await page.screenshot({path:resolve(root,
    ".tmp/mass-preface-solemnior-1961/research-"+width+".png"),fullPage:true});
  console.log("PASS 1961 Most Solemn Preface research phone/desktop",width,report.svgCount,"source staves");
  await page.close();
 }
}finally{await browser?.close();await new Promise(done=>server.close(done));}
