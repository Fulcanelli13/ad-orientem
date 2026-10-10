import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const base=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const path=resolve(base,"."+name);
  if(path!==base&&!path.startsWith(base+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:"+server.address().port+"/tests/fixtures/rogation-premass.html");
 await page.evaluate(async()=>{
  const {mountFullMassPreflight}=await import("/src/mass/full-mass-preflight.js");
  await import("/src/mass/full-mass-preflight-styles.js");
  globalThis.__formDate="2026-10-04";globalThis.__lang="en";
  globalThis.__kind="CALENDAR";globalThis.__formDefault="sung";globalThis.__ready=true;
  globalThis.__legacyMass=()=>({canStart:__ready,date:__formDate,
    calendarDay:{id:"TEMP.XIX",title:"Nineteenth Sunday after Pentecost"},
    celebrationId:__kind==="CALENDAR"?"mass_of_day":__kind.toLowerCase(),
    requestedCelebrationId:__kind==="CALENDAR"?"mass_of_day":__kind.toLowerCase(),
    celebrationType:__kind});
  globalThis.__full=mountFullMassPreflight({doc:document,
    getResolvedMass:__legacyMass,getDefaultForm:()=>__formDefault,language:()=>__lang});
 });
 await page.waitForSelector("[data-ao-full-mass-preflight]");
 assert.equal(await page.locator("[data-full-mass-form]").count(),4);
 assert.equal(await page.locator('[data-full-mass-form][value="MISSA_CANTATA_INCENSE"]').isChecked(),true);
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-celebration-kind"),"CALENDAR");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","SOLEMN","MISSA_CANTATA_INCENSE"]){
  await page.locator('[data-full-mass-form][value="'+form+'"]').check();
  const selected=await page.evaluate(()=>__full.selectionFor(__legacyMass()));
  assert.equal(selected.form,form);
  assert.equal(selected.explicitlyChosenForm,true);
  assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-chosen-mass-form"),form);
 }
 assert.equal(await page.locator("[data-full-mass-category]").count(),5);
 await page.evaluate(()=>{
  globalThis.__categoryClicks=[];
  globalThis.AO_CELEBRATION_API={
   openChangeMass(){
    const flow=document.querySelector("#ao-mass-flow-v1");
    const panel=document.createElement("section");panel.dataset.testOldMassChooser="";
    panel.innerHTML='<button data-ao-select-day>Day</button>'+
      '<button data-ao-open="votive">Votive</button>'+
      '<button data-ao-open="nuptial">Nuptial</button>'+
      '<button data-ao-open="requiem">Requiem</button>'+
      '<button data-ao-open="other">Other</button>';
    panel.addEventListener("click",e=>{
     const v=e.target.dataset.aoOpen??(e.target.hasAttribute("data-ao-select-day")?"day":null);
     if(v)globalThis.__categoryClicks.push(v);
    });
    flow.querySelector("[data-test-old-mass-chooser]")?.remove();
    flow.append(panel);
   }
  };
 });
 for(const [kind,expected] of [["VOTIVE","votive"],["NUPTIAL","nuptial"],["REQUIEM","requiem"],["OTHER","other"],["CALENDAR","day"]]){
  await page.locator('[data-full-mass-category="'+kind+'"]').click();
  const clicked=await page.evaluate(()=>__categoryClicks.at(-1));
  assert.equal(clicked,expected,"Existing Mass selector not reached: "+kind);
  assert.equal((await page.evaluate(()=>__full.selectionFor(__legacyMass()))).kind,"CALENDAR",
    "Category click must not silently invent or substitute a Proper");
 }
 await page.evaluate(()=>{__kind="REQUIEM";__lang="fr";__full.refresh()});
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/Requiem/);
 assert.match(await page.locator("[data-full-mass-form-title]").innerText(),/Comment/);
 await page.evaluate(()=>{__kind="VOTIVE";__full.refresh()});
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/votive/i);
 await page.evaluate(()=>{__kind="NUPTIAL";__full.refresh()});
 assert.match(await page.locator("[data-full-mass-celebration]").innerText(),/nuptiale/i);
 await page.evaluate(()=>{__kind="CALENDAR";__formDate="2026-10-11";__full.refresh()});
 assert.equal(await page.locator('[data-full-mass-form][value="MISSA_CANTATA_INCENSE"]').isChecked(),true,
  "Selection leaked across a different Mass date");
 assert.equal((await page.evaluate(()=>__full.status())).explicitlyChosenForm,false);
 await page.evaluate(()=>{__kind="CALENDAR";__formDate="2026-10-12";__ready=false;__full.refresh()});
 assert.equal(await page.locator("[data-ao-full-mass-preflight]").getAttribute("data-ao-proper-ready"),"false");
 await page.evaluate(()=>{
  __ready=true;__kind="CALENDAR";__formDate="2026-10-13";
  __legacyMass=()=>({canStart:true,date:__formDate,
    calendarDay:{id:"Quad6-5"},exceptionalProfile:"good-friday-1962"});
  __full.dispose();
});
 // A new mount can be reinitialized for distinct non-Mass rites.
 await page.evaluate(async()=>{
  const {mountFullMassPreflight}=await import("/src/mass/full-mass-preflight.js");
  __full=mountFullMassPreflight({doc:document,getResolvedMass:__legacyMass,
    getDefaultForm:()=>__formDefault,language:()=>__lang});
 });
 const gf=await page.evaluate(()=>({
   kind:document.querySelector("[data-ao-full-mass-preflight]")?.dataset.aoCelebrationKind,
   fieldsetDisabled:document.querySelector("[data-full-mass-form-fieldset]")?.disabled,
   inputsDisabled:[...document.querySelectorAll("[data-full-mass-form]")].every(x=>x.disabled),
 }));
 assert.equal(gf.kind,"GOOD_FRIDAY","Non-Mass rite not classified: "+JSON.stringify(gf));
 assert.equal(gf.fieldsetDisabled,true,"Non-Mass form selector still active: "+JSON.stringify(gf));
 assert.equal(gf.inputsDisabled,true,"Non-Mass radios still active: "+JSON.stringify(gf));
 assert.match(await page.locator("[data-full-mass-note]").innerText(),/ce n’est pas une messe/i);
 // Source-owned catalogue: mobile projection uses the actual historical
 // source buttons and delegates selection without manufacturing a Proper.
 await page.evaluate(async()=>{
  __full.dispose();
  const {mountSourceOwnedMassCatalogue}=await import("/src/mass/full-mass-catalogue.js");
  __catStage="votive";__catLanguage="en";__selectedSource=null;
  const flow=document.getElementById("ao-mass-flow-v1");
  flow.innerHTML='<section class="aoMassFlowBody"><p>Choose the source Proper</p>'+
   '<button data-ao-celebration="sacred_heart"><b>Sacred Heart</b><span>Votive/Pent02-5</span></button>'+
   '<button data-ao-celebration="holy_cross"><b>Holy Cross</b><span>Votive/Cross</span></button></section>';
  flow.addEventListener("click",e=>{
   const b=e.target.closest?.("[data-ao-celebration],[data-ao-requiem]");
   if(b){__selectedSource=b.dataset.aoCelebration??b.dataset.aoRequiem;__catStage="preflight";}
  });
  __catalogue=mountSourceOwnedMassCatalogue({doc:document,stage:()=>__catStage,
    language:()=>__catLanguage});
 });
 await page.waitForSelector('[data-ao-mass-catalogue-choice="sacred_heart"]');
 assert.equal(await page.locator('[data-ao-mass-catalogue-choice]').count(),2);
 assert.equal(await page.locator("[data-ao-mass-catalogue-search]").count(),0);
 // The native search exists only for larger source-owned lists.
 assert.equal((await page.locator("[data-ao-mass-catalogue]").innerText()).includes("Votive/Pent02-5"),true);
 await page.locator('[data-ao-mass-catalogue-choice="sacred_heart"]').click();
 assert.equal(await page.evaluate(()=>__selectedSource),"sacred_heart");
 await page.evaluate(()=>{
   __catStage="requiem";
   document.querySelector("#ao-mass-flow-v1").innerHTML='<section class="aoMassFlowBody"><p>Occasion</p>'+
    '<button data-ao-requiem="funeral"><b>Funeral Mass</b><span>I class</span></button>'+
    '<button data-ao-requiem="anniversary"><b>Anniversary</b><span>II class</span></button></section>';
   __catalogue.refresh();
 });
 await page.waitForSelector('[data-ao-mass-catalogue-choice="anniversary"]');
 assert.equal(await page.locator('[data-ao-mass-catalogue-choice]').count(),2);
 await page.locator('[data-ao-mass-catalogue-choice="anniversary"]').click();
 assert.equal(await page.evaluate(()=>__selectedSource),"anniversary");
 await page.evaluate(()=>__catalogue.dispose());
 const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(horizontal<=1,"390px phone overflow: "+horizontal);
 assert.deepEqual(errors,[]);
 console.log("Full Mass 390px phone: PASS — low/MC/Solemn choices, source-owned Mass classes, date reset and Good Friday firewall.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
