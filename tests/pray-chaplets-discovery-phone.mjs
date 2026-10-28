import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/rosary-chaplets-discovery");
await mkdir(out,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:40000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:20000});
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   const rootSel="#aoPray435930.open";
   const door=page.locator(rootSel+' [data-p435930-family="chaplets"]');
   assert.equal(await door.count(),1);
   assert.equal(await page.locator(rootSel+' [data-p435930-own="pray.divine_mercy"]').count(),1,"Divine Mercy direct shortcut remains");
   await door.click();
   const family=page.locator(rootSel+" .aoP435930FamilyDoor"); // not required in family detail
   const all=await page.locator(rootSel+" .aoP435930ModuleGrid [data-p435930-own]").evaluateAll(xs=>xs.map(x=>x.dataset.p435930Own));
   assert.deepEqual(all,["pray.rosary","pray.rosary_methods","pray.divine_mercy","pray.five_wounds","pray.precious_blood"]);
   assert.equal(await page.locator(rootSel+" #aoP435930Title").innerText(),"Rosary & Chaplets");
   assert.equal(await page.locator(rootSel+" .aoP435930HomeIntro h2").count(),0,"Do not duplicate family title below app header");
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"No horizontal clipping");
   await page.screenshot({path:resolve(out,"rosary-chaplets-family-"+width+".png"),animations:"disabled"});
   // The new Five Wounds uses one reader, existing prayers, and no duplicate top-level module.
   await page.locator(rootSel+' [data-p435930-own="pray.five_wounds"]').click();
   assert.equal(await page.locator(rootSel+' [data-ao-five-wounds-reader]').count(),1);
   assert.equal(await page.locator(rootSel+' [data-ao-five-wounds-reader] [role="progressbar"]').getAttribute("aria-valuenow"),"1");
   assert.match(await page.locator(rootSel+' .aoFiveWoundsPrayerText').innerText(),/Glory be to the Father/);
   await page.locator(rootSel+' [data-p435930-five-next]').click();
   assert.equal(await page.locator(rootSel+' .aoFiveWoundsProgress').getAttribute("aria-valuenow"),"2");
   await page.locator(rootSel+' [data-p435930-five-wound="4"]').click();
   assert.equal(await page.locator(rootSel+' .aoFiveWoundsProgress').getAttribute("aria-valuenow"),"25");
   await page.locator(rootSel+' [data-p435930-five-latin]').click();
   assert.match(await page.locator(rootSel+' .aoFiveWoundsPrayerText').innerText(),/Gloria Patri/);
   await page.screenshot({path:resolve(out,"five-wounds-guided-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Five Wounds reader must not clip horizontally");
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="chaplets"]').click();
   // Full Raccolta 33-Pater chaplet is one extra guided choice, not the held short form.
   await page.locator(rootSel+' [data-p435930-own="pray.precious_blood"]').click();
   const blood=rootSel+' [data-ao-precious-blood-reader]';
   assert.equal(await page.locator(blood).count(),1);
   assert.match(await page.locator(blood+' .aoPreciousBloodCard').innerText(),/O God, come to my assistance/);
   await page.locator(rootSel+' [data-p435930-blood-next]').click();
   assert.match(await page.locator(blood+' .aoPreciousBloodCard').innerText(),/Our Father/);
   await page.locator(rootSel+' [data-p435930-blood-next]').click();
   assert.match(await page.locator(blood+' .aoPreciousBloodPrayerHead').innerText(),/Our Father 2/);
   await page.locator(rootSel+' [data-p435930-blood-mystery="6"]').click();
   assert.match(await page.locator(blood+' header h2').innerText(),/Piercing of His Side/);
   await page.locator(rootSel+' [data-p435930-blood-latin]').click();
   assert.match(await page.locator(blood+' .aoPreciousBloodCard').innerText(),/Pater noster/);
   await page.screenshot({path:resolve(out,"precious-blood-full-guided-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Precious Blood reader must not clip horizontally");
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="chaplets"]').click();
   // Enter the existing Divine Mercy owner from its new discovery family.
   await page.locator(rootSel+' [data-p435930-own="pray.divine_mercy"]').click();
   assert.equal(await page.locator(rootSel+" .aoMercyReader [data-ao-mercy-bead-navigation]").count(),1);
   await page.screenshot({path:resolve(out,"chaplet-from-family-"+width+".png"),animations:"disabled"});
   // B19: practical priestly intercession in the original Eucharistic family.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="eucharistic"]').click();
   await page.locator(rootSel+' [data-p435930-own="pray.for_priests"]').click();
   const priest=rootSel+' [data-ao-priests-intercession]';
   assert.equal(await page.locator(priest).count(),1);
   assert.match(await page.locator(priest+' .aoPriestsText').innerText(),/O Jesus, Eternal Priest/);
   assert.equal(await page.locator(priest+' [data-p435930-priests-purpose]').count(),3);
   await page.locator(priest+' [data-p435930-priests-purpose="vocations"]').click();
   assert.match(await page.locator(priest+' .aoPriestsText').innerText(),/labourers for Thy Church/i);
   await page.locator(priest+' [data-p435930-priests-latin]').click();
   assert.match(await page.locator(priest+' .aoPriestsText').innerText(),/Deus, qui non vis/i);
   await page.locator(priest+' [data-p435930-priests-purpose="perseverance"]').click();
   assert.match(await page.locator(priest+' .aoPriestsText').innerText(),/sole protection of human weakness/);
   await page.screenshot({path:resolve(out,"priestly-intercessions-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Priest intercession must not clip horizontally");
   // B20: one occasional reader, 2 sourced historical English prayers + a canonical bilingual/trilingual reuse.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="devotions"]').click();
   await page.locator(rootSel+' [data-p435930-own="pray.occasional_intercessions"]').click();
   const occasional=rootSel+' [data-ao-occasional-intercession]';
   assert.equal(await page.locator(occasional).count(),1);
   assert.equal(await page.locator(occasional+' [data-p435930-occasional-purpose]').count(),6);
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/Most merciful Jesus/);
   await page.locator(occasional+' [data-p435930-occasional-purpose="family"]').click();
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/O most loving Jesus/);
   await page.locator(occasional+' [data-p435930-occasional-purpose="difficulties"]').click();
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/To thee, O blessed Joseph/i);
   await page.locator(occasional+' [data-p435930-occasional-latin]').click();
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/Ad te, beate Ioseph/);
   // B21: three new distinct daily intentions; preserve B20 and their route.
   await page.locator(occasional+' [data-p435930-occasional-purpose="peace"]').click();
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/Give peace, O Lord, in our days/);
   await page.locator(occasional+' [data-p435930-occasional-latin]').click();
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/Da pacem, Domine/);
   await page.locator(occasional+' [data-p435930-occasional-purpose="travel"]').click();
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/May the Archangel Raphael accompany us/);
   assert.equal(await page.locator(occasional+' [data-p435930-occasional-latin]').count(),0,"Do not invent travel Latin");
   await page.locator(occasional+' [data-p435930-occasional-purpose="discernment"]').click();
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/Almighty God!/);
   assert.match(await page.locator(occasional+' .aoOccasionalText').innerText(),/choice of a state of life/);
   assert.equal(await page.locator(occasional+' [data-p435930-occasional-purpose][aria-pressed="true"]').count(),1);
   await page.screenshot({path:resolve(out,"occasional-six-purposes-"+width+".png"),animations:"disabled"});
   await page.screenshot({path:resolve(out,"occasional-intercessions-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Occasional intercession must not clip horizontally");
   // B24: full original seven paired prayers within the existing Devotions Prayer family.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="devotions"]').click();
   await page.locator(rootSel+' [data-p435930-own="pray.st_joseph_seven_sorrows"]').click();
   const joseph=rootSel+' [data-ao-st-joseph-seven-reader]';
   assert.equal(await page.locator(joseph).count(),1,"St Joseph seven-pair owner must open");
   assert.equal(await page.locator(joseph+' [data-p435930-joseph-step]').count(),8,"Seven prayers plus final antiphon/collect");
   assert.match(await page.locator(joseph+' .aoJosephSevenOriginal').innerText(),/Pure spouse of most holy Mary/i);
   assert.equal(await page.locator(joseph+' [data-ao-joseph-canonical]').count(),3,"Exactly Pater Ave Gloria after each historic prayer");
   await page.locator(joseph+' [data-p435930-joseph-latin]').click();
   assert.match(await page.locator(joseph+' [data-ao-joseph-canonical]').first().innerText(),/Pater noster/i);
   assert.match(await page.locator(joseph+' .aoJosephSevenOriginal').innerText(),/Pure spouse of most holy Mary/i,"Switching canonical repetitions must not alter English historic supplication");
   for(let part=1;part<=7;part++){
     await page.locator(joseph+' [data-p435930-joseph-next]').click();
     if(part<7){
       assert.equal(await page.locator(joseph+' [data-ao-joseph-canonical]').count(),3);
     }else{
       assert.equal(await page.locator(joseph+' [data-ao-joseph-canonical]').count(),0,"No extra Pater Ave Gloria after closing collect");
       assert.match(await page.locator(joseph+' .aoJosephSevenCard').innerText(),/O God, who in thine ineffable providence/i);
       assert.match(await page.locator(joseph+' .aoJosephSevenCard').innerText(),/Pray for us, holy Joseph/i);
     }
   }
   await page.screenshot({path:resolve(out,"joseph-seven-closure-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"St Joseph reader must not overflow on phone");
   await page.locator(joseph+' [data-p435930-joseph-finish]').click();
   assert.equal(await page.locator(joseph).count(),0,"Finish must return to existing Prayer family");
   assert.deepEqual(errors,[],errors.join("; "));
   assert.deepEqual(errors,[],errors.join("; "));
   console.log("PASS "+width+"px Rosary & Chaplets discovery: original Rosary and methods routes unchanged, Five Wounds and Precious Blood source-owned guided readers; canonical Mercy preserved");
  }finally{await page.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
