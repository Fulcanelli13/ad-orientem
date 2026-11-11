// Layout-only acceptance. The staff below is a neutral SVG fixture, NOT
// a musical score or a published chant. Real GABC and eligibility are guarded
// separately by schola-dock-approved-score.mjs.
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {buildReaderShellMarkup} from "../src/mass/reader-dom.js";

const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:780},deviceScaleFactor:1});
  await page.setContent(`<style>html,body{margin:0;height:100%;width:100%;overflow:hidden}</style>`+
    buildReaderShellMarkup({readerPreferences:{mode:"LIVE"}}));
  await page.evaluate(()=>{
    const dock=document.querySelector(".ao-schola-dock");
    dock.dataset.active="true";dock.dataset.collapsed="false";
    dock.dataset.approvedScore="true";
    const panel=dock.querySelector('[data-role="schola-approved-score"]');
    panel.hidden=false;panel.dataset.scoreStatus="approved";
    dock.querySelector('[data-role="schola-approved-staff"]').innerHTML=
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 72" width="1000" height="72" aria-hidden="true"><path d="M0 10H1000 M0 24H1000 M0 38H1000 M0 52H1000" stroke="currentColor"/></svg>';
    dock.querySelector('[data-role="schola"]').textContent="Latin phrase";
  });
  const result=await page.evaluate(()=>{
   const dock=document.querySelector(".ao-schola-dock");
   const staff=dock.querySelector('[data-role="schola-approved-staff"]');
   const svg=staff.querySelector("svg");
   const d=dock.getBoundingClientRect(),s=staff.getBoundingClientRect(),v=svg.getBoundingClientRect();
   return {screen:innerWidth,dock:{x:d.x,right:d.right,width:d.width,height:d.height},
    staff:{x:s.x,right:s.right,width:s.width,clientWidth:staff.clientWidth,scrollWidth:staff.scrollWidth},
    svg:{x:v.x,right:v.right,width:v.width},
    scoreVisible:!dock.querySelector('[data-role="schola-approved-score"]').hidden,
    controlsHidden:getComputedStyle(dock.querySelector(".ao-schola-meta")).display==="none"};
  });
  assert.equal(result.scoreVisible,true);
  assert.equal(result.controlsHidden,true);
  assert.ok(result.dock.x>=-1 && result.dock.right<=width+1,
    width+"px dock extends beyond the mobile screen: "+JSON.stringify(result));
  assert.ok(result.staff.x>=-1&&result.staff.right<=width+1,
    width+"px SCORE VIEWPORT extends beyond mobile screen: "+JSON.stringify(result));
  assert.ok(result.svg.width>result.staff.width+50 &&
    result.staff.scrollWidth>result.staff.clientWidth+50,
    width+"px source SVG must extend HORIZONTALLY INSIDE clipped staff viewport: "+JSON.stringify(result));
  assert.ok(result.dock.height>=120&&result.dock.height<=135,
    width+"px approved-score dock wrong compact height: "+JSON.stringify(result));
  console.log("SCHOLA_APPROVED_DOCK_PHONE="+JSON.stringify(result));
  await page.close();
 }
 const missal=await browser.newPage({viewport:{width:390,height:780}});
 await missal.setContent(buildReaderShellMarkup({readerPreferences:{mode:"MISSAL"}}));
 const hidden=await missal.evaluate(()=>getComputedStyle(document.querySelector(".ao-schola-dock")).display==="none");
 assert.equal(hidden,true,"Missal must not acquire LIVE's floating Schola dock");
 console.log("SCHOLA_APPROVED_DOCK_MISSAL_HIDDEN_PASS");
 await missal.close();
}finally{await browser.close();}
