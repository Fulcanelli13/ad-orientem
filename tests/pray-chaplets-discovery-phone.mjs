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
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoPrayerPilot=0",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:40000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:20000});
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   const rootSel="#aoPray435930.open";
   // Additional B19-B28 devotions were formerly unstyled plain links below
   // the original family cards. They must now be full, source-owned cards
   // with a verified canonical asset, and must still enter their real readers.
   const relatedFamilies=[
    {family:"passion",items:[["pray.five_wounds","fiveWounds"]]},
    {family:"devotions",items:[
     ["pray.occasional_intercessions","occasionals"],
     ["pray.st_joseph_seven_sorrows","josephSeven"],
     ["pray.montfort_consecration","montfort"]
    ]},
    {family:"eucharistic",items:[["pray.for_priests","priests"]]}
   ];
   for(const group of relatedFamilies){
    await page.locator(rootSel+' [data-p435930-family="'+group.family+'"]').tap();
    const original=page.locator(rootSel+" .aoP435930ModuleGrid > .aoP435930ModuleCard");
    assert.ok(await original.count()>=group.items.length,"Family cards should not be replaced by bare links");
    for(const [route,reader] of group.items){
     const card=page.locator(rootSel+' .aoP435930ModuleGrid > .aoP435930ModuleCard[data-p435930-own="'+route+'"]');
     assert.equal(await card.count(),1,"Related Prayer route must be one first-class card: "+route);
     assert.equal(await card.locator(".aoP435930ModuleIcon[data-ao-pray-module-asset]").count(),1,
      "Canonical Prayer icon absent for "+route);
     assert.equal(await card.locator(".aoP435930ModuleDescription").count(),1,
      "Related Prayer card needs useful EN/FR description "+route);
     assert.ok((await card.locator(".aoP435930ModuleDescription").innerText()).trim().length>25,
      "Related Prayer card description is empty: "+route);
     await card.tap();
     assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930?.state?.().view),reader,
      "Related Prayer card did not open its source-owned reader: "+route);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
      "Related Prayer reader exceeds phone width: "+route);
     await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
     await page.locator(rootSel+' [data-p435930-family="'+group.family+'"]').tap();
    }
    await page.screenshot({path:resolve(out,"prayer-related-cards-"+group.family+"-"+width+".png"),animations:"disabled"});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
     "Family card grid must not overflow at "+width+"px: "+group.family);
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   }
   const door=page.locator(rootSel+' [data-p435930-family="chaplets"]');
   assert.equal(await door.count(),1);
   assert.equal(await page.locator(rootSel+' [data-p435930-own="pray.divine_mercy"]').count(),1,"Divine Mercy direct shortcut remains");
   await door.click();
   const family=page.locator(rootSel+" .aoP435930FamilyDoor"); // not required in family detail
   const all=await page.locator(rootSel+" .aoP435930ModuleGrid [data-p435930-own]").evaluateAll(xs=>xs.map(x=>x.dataset.p435930Own));
   assert.deepEqual(all,["pray.rosary","pray.rosary_methods","pray.divine_mercy","pray.five_wounds","pray.precious_blood","pray.little_crown"]);
   assert.equal(await page.locator(rootSel+" #aoP435930Title").innerText(),"Rosary & Chaplets");
   assert.equal(await page.locator(rootSel+" .aoP435930HomeIntro h2").count(),0,"Do not duplicate family title below app header");
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"No horizontal clipping");
   await page.screenshot({path:resolve(out,"rosary-chaplets-family-"+width+".png"),animations:"disabled"});
   // The new Five Wounds uses one reader, existing prayers, and no duplicate top-level module.
   await page.locator(rootSel+' [data-p435930-own="pray.five_wounds"]').click();
   assert.equal(await page.locator(rootSel+' [data-ao-five-wounds-reader]').count(),1);
   const openingLayout=await page.evaluate(()=>{
    const reader=document.querySelector("#aoPray435930.open .aoFiveWounds");
    const prayer=reader.querySelector(".aoFiveWoundsPrayerText");
    const actions=reader.querySelector(".aoFiveWoundsActions");
    const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
    const p=prayer.getBoundingClientRect(),a=actions.getBoundingClientRect(),v=mount.getBoundingClientRect();
    return {visibleAboveDock:Math.max(0,Math.min(p.bottom,a.top,v.bottom)-Math.max(p.top,v.top)),
      prayerTop:p.top,dockTop:a.top,viewportBottom:v.bottom,scrollTop:mount.scrollTop};
   });
   assert.ok(openingLayout.visibleAboveDock>=40,
    "The actual source prayer must appear on the initial phone screen, not only the wound rail: "+JSON.stringify(openingLayout));
   await page.screenshot({path:resolve(out,"five-wounds-opening-"+width+".png"),animations:"disabled"});
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
   // B36: check the actual chapter rail and thumb controls on a narrow phone.
   // The five wound labels must not fall back to 10px. Keep the original
   // 30-prayer and EN/FR/LA content ownership unchanged.
   const fiveMetrics=()=>page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open");
    const reader=root.querySelector(".aoFiveWounds"),mount=root.querySelector(".aoP435930Mount");
    const nav=reader.querySelector(".aoFiveWoundsActions");
    const next=nav.querySelector("[data-p435930-five-next],[data-p435930-five-finish]");
    const labels=[...reader.querySelectorAll(".aoFiveWoundsRail button small")];
    const btn=next.getBoundingClientRect(),rect=nav.getBoundingClientRect(),viewport=mount.getBoundingClientRect();
    const hit=document.elementFromPoint(btn.left+btn.width/2,btn.top+btn.height/2);
    return {position:getComputedStyle(nav).position,navTop:rect.top,navBottom:rect.bottom,
      viewportTop:viewport.top,viewportBottom:viewport.bottom,
      labelFonts:labels.map(x=>parseFloat(getComputedStyle(x).fontSize)),
      labelOpacities:labels.map(x=>parseFloat(getComputedStyle(x).opacity)),
      buttonHeight:btn.height,buttonWidth:btn.width,
      hit:hit===next||next.contains(hit),scrollRange:mount.scrollHeight-mount.clientHeight,
      overflow:document.documentElement.scrollWidth-innerWidth};
   });
   const fiveBefore=await fiveMetrics();
   assert.equal(fiveBefore.position,"sticky","Five Wounds navigation must use the original sticky footer");
   assert.equal(fiveBefore.labelFonts.length,5);
   assert.ok(fiveBefore.labelFonts.every(x=>x>=12),"Five Wounds labels must stay legible on narrow screens");
   assert.ok(fiveBefore.labelOpacities.every(x=>x>=.99),"Inactive wound names must not be dimmed");
   assert.ok(fiveBefore.buttonHeight>=48&&fiveBefore.buttonWidth>=100,
    "Next prayer must be a substantial touch target: "+JSON.stringify(fiveBefore));
   await page.evaluate(()=>{
    const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
    m.scrollTop=Math.min(200,Math.max(0,m.scrollHeight-m.clientHeight));
   });
   const fiveScrolled=await fiveMetrics();
   assert.ok(fiveScrolled.hit&&fiveScrolled.navTop>=fiveScrolled.viewportTop-3&&fiveScrolled.navBottom<=fiveScrolled.viewportBottom+3,
    "Five Wounds thumb dock must remain reachable while reading: "+JSON.stringify(fiveScrolled));
   await page.screenshot({path:resolve(out,"five-wounds-thumb-scroll-"+width+".png"),animations:"disabled"});
   await page.locator(rootSel+' [data-p435930-five-latin]').click(); // return to vernacular from Latin
   const sessionLanguage=page.locator(rootSel+' [data-p435930-session-language]');
   assert.equal(await sessionLanguage.count(),1,"Five Wounds needs the same in-session EN/FR switch as other Prayer readers");
   await sessionLanguage.click(); // English -> French without resetting the reader
   await page.locator(rootSel+' [data-p435930-five-wound="4"]').click();
   assert.equal(await page.locator(rootSel+' .aoFiveWoundsPrayerText').getAttribute("lang"),"fr",
    "French Five Wounds must use canonical French text, not an English label");
   assert.equal(await page.locator(rootSel+' .aoFiveWoundsProgress').getAttribute("aria-valuenow"),"25");
   assert.ok((await page.locator(rootSel+' .aoFiveWoundsRail button small').allTextContents()).some(x=>x.length>3));
   await page.screenshot({path:resolve(out,"five-wounds-french-"+width+".png"),animations:"disabled"});
   const fiveFr=await fiveMetrics();
   assert.ok(fiveFr.labelFonts.every(x=>x>=12)&&fiveFr.overflow<=1,
    "French wound labels must also be >=12px and not overflow the phone");
   await sessionLanguage.click(); // French -> English, still the same chaplet step
   assert.equal(await page.locator(rootSel+' .aoFiveWoundsPrayerText').getAttribute("lang"),"en");
   assert.equal(await page.locator(rootSel+' .aoFiveWoundsProgress').getAttribute("aria-valuenow"),"25",
    "In-session language switching must never restart the 30-prayer chaplet");
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="chaplets"]').click();
   // Full Raccolta 33-Pater chaplet is one extra guided choice, not the held short form.
   await page.locator(rootSel+' [data-p435930-own="pray.precious_blood"]').click();
   const blood=rootSel+' [data-ao-precious-blood-reader]';
   assert.equal(await page.locator(blood).count(),1);
   assert.match(await page.locator(blood+' .aoPreciousBloodCard').innerText(),/O God, come to my assistance/);
   // B37 mobile audit: the *prayer* must be visible above the original
   // Previous/Continue dock, not just a mystery selector and progress line.
   const bloodMetrics=()=>page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open");
    const reader=root.querySelector(".aoPreciousBlood");
    const mount=root.querySelector(".aoP435930Mount");
    const prayer=reader.querySelector(".aoPreciousBloodCard p");
    const nav=reader.querySelector(".aoPreciousBloodActions");
    const next=nav.querySelector("[data-p435930-blood-next],[data-p435930-blood-finish]");
    const p=prayer?.getBoundingClientRect(),a=nav.getBoundingClientRect(),
      port=mount.getBoundingClientRect(),b=next.getBoundingClientRect();
    const hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
    return {textAboveDock:p?Math.max(0,Math.min(p.bottom,a.top,port.bottom)-Math.max(p.top,port.top)):0,
      sourceLineHeight:p?.height||0,
      navTop:a.top,navBottom:a.bottom,portTop:port.top,portBottom:port.bottom,
      dockPosition:getComputedStyle(nav).position,
      touchHeight:b.height,touchWidth:b.width,touchHit:hit===next||next.contains(hit),
      textFont:prayer?parseFloat(getComputedStyle(prayer).fontSize):0,
      scrollRange:mount.scrollHeight-mount.clientHeight,
      overflow:document.documentElement.scrollWidth-innerWidth};
   });
   const bloodOpening=await bloodMetrics();
   assert.ok(bloodOpening.textAboveDock>=26&&
    bloodOpening.textAboveDock>=bloodOpening.sourceLineHeight*.9,
    "Precious Blood must show the full first historical source verse above the thumb dock: "+JSON.stringify(bloodOpening));
   assert.equal(bloodOpening.dockPosition,"sticky");
   assert.ok(bloodOpening.touchHeight>=48&&bloodOpening.touchWidth>=96,
    "Precious Blood next needs a 48px thumb target");
   assert.ok(bloodOpening.textFont>=19,"Preserve source prayer's 19px+ serif reading face");
   assert.ok(bloodOpening.overflow<=1,"Precious Blood opening must fit a narrow phone");
   await page.screenshot({path:resolve(out,"precious-blood-opening-"+width+".png"),animations:"disabled"});
   await page.evaluate(()=>{
    const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
    m.scrollTop=Math.min(200,Math.max(0,m.scrollHeight-m.clientHeight));
   });
   const bloodScrolled=await bloodMetrics();
   assert.ok(bloodScrolled.navTop>=bloodScrolled.portTop-4&&bloodScrolled.navBottom<=bloodScrolled.portBottom+4&&bloodScrolled.touchHit,
    "Original Precious Blood controls must remain reachable during reading: "+JSON.stringify(bloodScrolled));
   await page.screenshot({path:resolve(out,"precious-blood-scroll-"+width+".png"),animations:"disabled"});
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
   // B30: exact 3+12 Little Crown, repeated aspiration, correct source and accessible finish.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="chaplets"]').click();
   await page.locator(rootSel+' [data-p435930-own="pray.little_crown"]').click();
   const crown=rootSel+' [data-ao-little-crown-reader]';
   assert.equal(await page.locator(crown).count(),1);
   assert.equal(await page.locator(crown+' [data-p435930-crown-bead]').count(),15);
   assert.equal(await page.locator(crown+' [role="progressbar"]').getAttribute("aria-valuenow"),"1");
   assert.match(await page.locator(crown+' .aoLittleCrownAspiration').innerText(),/And the Word was made Flesh/);
   assert.match(await page.locator(crown+' .aoLittleCrownPrayerText').innerText(),/Our Father/);
   await page.locator(crown+' [data-p435930-crown-bead="3"]').click();
   assert.equal(await page.locator(crown+' [role="progressbar"]').getAttribute("aria-valuenow"),"4");
   assert.match(await page.locator(crown+' .aoLittleCrownPrayerText').innerText(),/Hail Mary/);
   await page.locator(crown+' [data-p435930-crown-latin]').click();
   assert.match(await page.locator(crown+' .aoLittleCrownPrayerText').innerText(),/Ave Maria/);
   assert.match(await page.locator(crown+' .aoLittleCrownAspiration').innerText(),/Et Verbum caro factum est/);
   await page.locator(crown+' [data-p435930-crown-prev]').click();
   assert.equal(await page.locator(crown+' [role="progressbar"]').getAttribute("aria-valuenow"),"3");
   await page.locator(crown+' [data-p435930-crown-latin]').click();
   await page.locator(crown+' [data-p435930-crown-bead="14"]').click();
   assert.equal(await page.locator(crown+' [role="progressbar"]').getAttribute("aria-valuenow"),"15");
   assert.equal(await page.locator(crown+' [data-p435930-crown-finish]').count(),1);
   await page.locator(crown+' .aoLittleCrownSource summary').click();
   assert.match(await page.locator(crown+' .aoLittleCrownSource').innerText(),/1940/);
   await page.screenshot({path:resolve(out,"little-crown-b30-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Little Crown must not clip 320/390px");
   await page.locator(crown+' [data-p435930-crown-finish]').click();
   assert.equal(await page.locator(crown).count(),0);
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
   // B26: Montfort source-directed 33 days, original 4 phases and personal act.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="devotions"]').click();
   await page.locator(rootSel+' [data-p435930-own="pray.montfort_consecration"]').click();
   const mont=rootSel+' [data-ao-montfort-b26-reader]';
   assert.equal(await page.locator(mont).count(),1,"Montfort programme must use existing Pray reader");
   assert.equal(await page.locator(mont+' [data-p435930-montfort-phase]').count(),4,"Montfort's four source phases");
   const dateInput=page.locator(mont+' [data-p435930-montfort-target]');
   await dateInput.fill("2026-12-08");
   assert.match(await page.locator(mont).innerText(),/2026-11-05/,"33 days before 8 Dec");
   await page.locator(mont+' [data-p435930-montfort-phase="1"]').click();
   assert.match(await page.locator(mont+' [data-ao-montfort-day="1"]').innerText(),/Renounce the spirit of the world/i);
   await page.locator(mont+' [data-p435930-montfort-mark]').check();
   assert.match(await page.locator(mont).innerText(),/1 \/ 33/,"Local completion should update");
   await page.locator(mont+' [data-p435930-montfort-phase="13"]').click();
   assert.match(await page.locator(mont+' [data-ao-montfort-day="13"]').innerText(),/Knowledge of self/i);
   assert.match(await page.locator(mont+' [data-ao-montfort-prayer="litany_loreto_1962"]').innerText(),/Litany of Loreto/i);
   const spirit=page.locator(mont+' [data-ao-montfort-b27-original="holySpirit"]');
   assert.equal(await spirit.count(),1,"Full Holy Ghost litany must be present on day 13");
   await spirit.locator("summary").click();
   assert.equal(await spirit.locator("[data-ao-montfort-original-row]").count(),48,"Full Holy Ghost petitions, Lamb of God and versicle");
   assert.equal(await spirit.locator(".aoMontfortB27Chapter").count(),4,"B28 source-neutral chapter bands: opening, invocations, petitions, conclusion");
   assert.match(await spirit.locator("[data-ao-montfort-witness-caution]").innerText(),/1897.*NOT been compared/i);
   assert.equal(await spirit.locator("[data-ao-montfort-witness-caution]").evaluate(el=>!!(el.compareDocumentPosition(el.closest("details").querySelector("[data-ao-montfort-original-row]"))&Node.DOCUMENT_POSITION_FOLLOWING)),true,"Witness caution before first Holy Ghost invocation");
   assert.match(await spirit.locator('a').first().getAttribute('href'),/ecatholic2000\.com/,"Digital appendix rather than unverified 1897 facsimile is primary citation");
   assert.match(await spirit.innerText(),/Grant, O merciful Father/i);
   assert.match(await spirit.innerText(),/Holy Ghost, make us persevere in justice/i);
   await page.screenshot({path:resolve(out,"montfort-holy-ghost-litany-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Full Holy Spirit litany must not overflow");

   await page.locator(mont+' [data-p435930-montfort-phase="20"]').click();
   assert.equal(await page.locator(mont+' [data-p435930-montfort-rosary]').count(),1,"Existing Rosary available in Marian phase");
   await page.locator(mont+' [data-p435930-montfort-phase="27"]').click();
   assert.match(await page.locator(mont+' [data-ao-montfort-day="27"]').innerText(),/Holy Name of Jesus/i);
   const holyName=page.locator(mont+' [data-ao-montfort-b27-original="holyName"]');
   const augustine=page.locator(mont+' [data-ao-montfort-b27-original="augustine"]');
   assert.equal(await holyName.count(),1,"Holy Name litany must be source-owned in Week 3");
   assert.equal(await augustine.count(),1,"Montfort's optional Augustine prayer in Week 3");
   await holyName.locator("summary").click();
   assert.equal(await holyName.locator("[data-ao-montfort-original-row]").count(),74,"Holy Name full mercy/deliverance/Lamb invocations");
   assert.equal(await holyName.locator(".aoMontfortB27Chapter").count(),6,"B28 source-neutral chapters including both closing collects");
   assert.match(await holyName.locator(".aoMontfortB27Chapter").last().innerText(),/Concluding prayers/i);
   assert.match(await holyName.innerText(),/perpetual fear and love of Thy holy name/i);
   await page.screenshot({path:resolve(out,"montfort-holy-name-litany-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Full Holy Name litany must not overflow");
   await holyName.locator("summary").click();
   await augustine.locator(":scope > summary").click();
   assert.match(await augustine.innerText(),/Thou art Christ, my holy Father/i);
   await augustine.locator(":scope > summary").click();

   for(let n=0;n<7;n++)await page.locator(mont+' [data-p435930-montfort-next]').click();
   const act=page.locator(mont+' [data-ao-montfort-day="34"]');
   assert.equal(await act.count(),1,"34th day is the actual consecration, distinct from 33 days preparation");
   assert.equal(await act.locator('.aoMontfortB26Original').count(),10,"Full Faber act must not be abbreviated");
   assert.match(await act.innerText(),/O Eternal and Incarnate Wisdom/i);
   assert.match(await act.innerText(),/vows of my Baptism/i);
   assert.match(await act.innerText(),/Amen\./i);
   await page.screenshot({path:resolve(out,"montfort-1863-consecration-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Montfort reader cannot overflow at phone width");
   await page.locator(mont+' [data-p435930-montfort-prev]').click();
   assert.equal(await page.locator(mont+' [data-ao-montfort-day="33"]').count(),1);
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.montfort_consecration",{returnContext:null}));
   assert.match(await page.locator(mont).innerText(),/1 \/ 33/,"Montfort progress must survive route reopening on device");

   // B29: same Adoration reader; at-home prayer is not sacramental exposition.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null}));
   const aRoot=rootSel+' [data-ao-adoration-chooser]';
   assert.equal(await page.locator(aRoot).count(),1,"Adoration owner must show existing chooser");
   await page.locator(aRoot+' details.aoAdorationMethodsDisclosure > summary').tap();
   const nightChoice=page.locator(aRoot+' [data-p435930-ador-mode="night"]');
   assert.equal(await nightChoice.count(),1,"Fr Mateo night mode must be nested in existing Adoration choices");
   await nightChoice.tap();
   const night=rootSel+' [data-ao-adoration-mode="night"]';
   assert.equal(await page.locator(night).count(),1,"At-home watch must use existing Adoration reader");
   assert.equal(await page.locator(night+' [data-ao-home-night]').count(),1);
   assert.match(await page.locator(night+' [data-ao-home-night]').innerText(),/NOT THE RESERVED SACRAMENT/);
   assert.equal(await page.locator(night+' .aoDevoTimeline [data-ao-devo-chapter]').count(),6,"Six horizontal private home cards");
   assert.equal(await page.locator(night+' [data-ao-devo-card="prepare"]').count(),1);
   assert.match(await page.locator(night+' .aoP435930GuideNow').innerText(),/image of the Sacred Heart/i);
   await page.locator(night+' [data-ao-night-home-source] > summary').tap();
   assert.match(await page.locator(night+' [data-ao-night-home-source]').innerText(),/not a reproduction of the 1944 Holy Hour/i);
   assert.match(await page.locator(night+' [data-ao-night-home-source] a').getAttribute('href'),/sensusfidelium.com/);
   await page.locator(night+' .aoDevoTimeline [data-ao-devo-chapter="2"]').tap();
   assert.equal(await page.locator(night+' [data-ao-devo-card="reparation"]').count(),1);
   assert.match(await page.locator(night+' .aoP435930GuidePrayers').innerText(),/Most Sweet Jesus/i,"Reuse full Pius XI canonical reparation");
   await page.locator(night+' .aoDevoTimeline [data-ao-devo-chapter="3"]').tap();
   assert.equal(await page.locator(night+' [data-ao-devo-card="family"]').count(),1);
   assert.match(await page.locator(night+' .aoP435930GuideNow').innerText(),/five Our Fathers, five Hail Marys/i);
   await page.locator(night+' .aoDevoTimeline [data-ao-devo-chapter="4"]').tap();
   assert.equal(await page.locator(night+' [data-ao-devo-card="communion"]').count(),1);
   assert.match(await page.locator(night+' .aoP435930GuidePrayers').innerText(),/Spiritual Communion/i);
   await page.locator(night+' [data-ao-adoration-timer] > summary').tap();
   assert.equal(await page.locator(night+' [data-p435930-timer="60"]').count(),1,"One-hour aid only when optionally opened");
   await page.screenshot({path:resolve(out,"fr-mateo-home-night-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"At-home night mode horizontal overflow");
   await page.locator(night+' .aoDevoTimeline [data-ao-devo-chapter="5"]').tap();
   assert.equal(await page.locator(night+' [data-ao-devo-card="close"]').count(),1);
   await page.locator(night+' [data-p435930-night-finish]').tap();
   assert.equal(await page.locator(aRoot).count(),1,"Finish returns to established Adoration chooser");
   assert.deepEqual(errors,[],errors.join("; "));
   console.log("PASS "+width+"px Rosary & Chaplets discovery: original Rosary and methods routes unchanged, Five Wounds and Precious Blood source-owned guided readers; canonical Mercy preserved");
  }finally{await page.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
