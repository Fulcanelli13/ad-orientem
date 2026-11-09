// M44: Capture the EXACT vendored Exsurge SVG render with a local headless browser.
// No source facsimile is used as a GABC render; the original and rendered evidence
// remain separate before side-by-side editorial comparison. No network, no audio.
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {chromium} from "@playwright/test";
const output=resolve(process.argv[2]??"artifacts/schola-m44-exsurge");
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const files=[];
try{
 for(const width of [304,374,720]){
  const file=resolve(output,`kyrie-xvi-exsurge-${width}px.svg`);
  const svg=readFileSync(file,"utf8");
  assert.match(svg,/^<svg\b/);
  const page=await browser.newPage({viewport:{width:Math.max(320,width),height:900},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
   *{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff}
   #score{width:${width}px;padding:0;overflow:visible}
   #score svg{display:block;max-width:none;width:auto;height:auto}
   </style></head><body><div id="score">${svg}</div></body></html>`,{waitUntil:"load"});
  const info=await page.evaluate(()=>{
   const s=document.querySelector("#score svg");
   const r=s?.getBoundingClientRect();
   return {svgExists:!!s,width:r?.width,height:r?.height,
     gCount:s?.querySelectorAll("g").length,pathCount:s?.querySelectorAll("path").length,
     useCount:s?.querySelectorAll("use").length,lineCount:s?.querySelectorAll("line").length};
  });
  assert.equal(info.svgExists,true);
  assert.ok(info.width>100&&info.height>100);
  const path=resolve(output,`kyrie-xvi-exsurge-${width}px.png`);
  await page.locator("#score svg").screenshot({path,animations:"disabled",timeout:30000});
  await page.close();
  files.push({width,svg:file,png:path,...info});
 }
}finally{
 await browser.close();
}
writeFileSync(resolve(output,"browser-render-manifest.json"),JSON.stringify({
 schema:"ao-schola-m44-exsurge-browser-svg-render-v1",
 referenceType:"SOURCE_GABC_RENDER_NOT_INDEPENDENT_PRINT",
 renderer:"local vendored Exsurge",
 scoreId:"GREGOBASE-545",editorialApproved:false,files
},null,2)+"\n","utf8");
console.log("PASS M44_BROWSER_RENDER "+JSON.stringify(files.map(x=>({w:x.width,paths:x.pathCount,uses:x.useCount,height:x.height}))));
