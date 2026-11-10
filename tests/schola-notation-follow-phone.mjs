import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {chromium} from "@playwright/test";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
import {buildReaderShellMarkup} from "../src/mass/reader-dom.js";

// Fixture music comes from approved DISMISSAL test data only. This does not
// add Ite VIII to the published Schola track approvals.
const gabc=APPROVED_MASS_INLINE_GABC[0].gabc;
const moduleSource=readFileSync(new URL("../src/mass/reader-schola-notation-follow.js",import.meta.url));
const html='<meta name="viewport" content="width=device-width, initial-scale=1">'+
 '<style>html,body{margin:0;height:100%;width:100%;overflow:hidden}</style>'+
 buildReaderShellMarkup({readerPreferences:{mode:"LIVE"}});
const server=createServer((req,res)=>{
 if(req.url==="/src/mass/reader-schola-notation-follow.js"){
  res.writeHead(200,{"Content-Type":"text/javascript; charset=utf-8"}).end(moduleSource);
 }else{
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}).end(html);
 }
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const address=server.address();
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:780},deviceScaleFactor:1});
  await page.goto("http://127.0.0.1:"+address.port+"/");
  const initialized=await page.evaluate(async source=>{
   const {createScholaNotationFollower}=await import("/src/mass/reader-schola-notation-follow.js");
   const dock=document.querySelector(".ao-schola-dock");
   dock.dataset.active="true";dock.dataset.collapsed="false";dock.dataset.approvedScore="true";
   const panel=dock.querySelector('[data-role="schola-approved-score"]');
   panel.hidden=false;panel.dataset.scoreStatus="approved";
   const staff=dock.querySelector('[data-role="schola-approved-staff"]');
   staff.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 65" width="300" height="65"><text x="15" y="38">I</text><text x="65" y="38">te,</text><text x="118" y="38">mis</text><text x="174" y="38">sa</text><text x="225" y="38">est.</text></svg>';
   const strip=dock.querySelector('[data-role="schola-follow-strip"]');
   window.__followTest=createScholaNotationFollower({staff,strip,stepMs:500});
   return {started:window.__followTest.start(source),state:window.__followTest.getState()};
  },gabc);
  assert.equal(initialized.started,true);
  assert.equal(initialized.state.mapped,true,"All five notation lyrics aligned in printed SVG");
  const strip=page.locator('[data-role="schola-follow-strip"]');
  assert.equal(await strip.locator("button").count(),5);
  await strip.locator("button").nth(3).click();
  assert.equal(await page.evaluate(()=>window.__followTest.getState().index),3);
  await page.waitForFunction(()=>window.__followTest.getState().index===4,{timeout:2600});
  assert.equal(await page.evaluate(()=>window.__followTest.getState().running),false,
   "Estimated lyric end must not claim the choir stopped");
  await page.evaluate(()=>window.__followTest.seek(1));
  const rect=await page.locator('[data-role="schola-approved-staff"]').boundingBox();
  assert.ok(rect&&rect.width>70,"Real mobile staff geometry required");
  await page.mouse.move(rect.x+Math.min(105,rect.width-7),rect.y+Math.min(22,rect.height-4));
  await page.mouse.down();
  await page.mouse.move(rect.x+10,rect.y+Math.min(22,rect.height-4),{steps:7});
  await page.mouse.up();
  assert.equal(await page.evaluate(()=>window.__followTest.getState().index),4,
   "Swipe left must resynchronise forward by 3 source syllables");
  const layout=await page.evaluate(()=>{
   const dock=document.querySelector(".ao-schola-dock"),
    strip=dock.querySelector('[data-role="schola-follow-strip"]');
   const r=dock.getBoundingClientRect(),s=strip.getBoundingClientRect();
   return {width:innerWidth,rect:{left:r.left,right:r.right,height:r.height},
    strip:{left:s.left,right:s.right,height:s.height},
    oldControlsHidden:getComputedStyle(dock.querySelector(".ao-schola-meta")).display==="none",
    oldLatinHidden:getComputedStyle(dock.querySelector(".ao-schola-main")).display==="none",
    active:Array.from(strip.querySelectorAll('button[data-active="true"]')).map(x=>x.textContent),
    observed:dock.dataset.musicStatus==="OBSERVED"};
  });
  assert.ok(layout.rect.left>=-1&&layout.rect.right<=width+1,JSON.stringify(layout));
  assert.ok(layout.strip.right<=width+1,JSON.stringify(layout));
  assert.ok(layout.rect.height>=120&&layout.rect.height<=135,JSON.stringify(layout));
  assert.equal(layout.oldControlsHidden,true);
  assert.equal(layout.oldLatinHidden,true);
  assert.deepEqual(layout.active,["est."]);
  assert.equal(layout.observed,false);
  await page.evaluate(()=>window.__followTest.destroy());
  assert.equal(await strip.locator("button").count(),0,
   "Destroy must remove source-owned interaction targets");
  console.log("SCHOLA_NOTATION_FOLLOW_PHONE_PASS="+JSON.stringify(layout));
  await page.close();
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
