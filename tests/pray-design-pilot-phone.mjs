import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/prayer-design-pilot");
await mkdir(output,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff":"font/woff",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(body);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((resolveReady,reject)=>{
 server.once("error",reject);server.listen(0,"127.0.0.1",resolveReady);
});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  try{
   const origin="http://127.0.0.1:"+server.address().port;
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:25000});
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   const base="#aoPray435930.open";
   const mosaic=page.locator(base+" [data-ao-pray-pilot-mosaic]");
   assert.equal(await mosaic.locator(".aoPrayPilotTile").count(),9,"nine real discovery doors");
   const artSlots=await mosaic.locator(".aoPrayPilotTile").evaluateAll(nodes=>
     nodes.map(n=>({slot:n.dataset.aoArtSlotId,binding:n.dataset.aoArtBinding,
       rotation:n.dataset.aoArtRotation})));
   assert.deepEqual(artSlots.map(x=>x.slot).sort(),
    ["DOOR-D1","DOOR-D2","DOOR-D3","DOOR-D4","DOOR-D5","DOOR-D6","DOOR-D7","DOOR-D8","DOOR-D9"]);
   assert.ok(artSlots.every(x=>x.binding==="unassigned"&&x.rotation?.startsWith("R-")),
    "Artwork selection cannot silently bypass source/rights/quality approvals");
   assert.equal(await page.locator(base+" [data-p435930-my-customs]").count(),1,"personal Prayer destination remains on default homepage");
   const mosaicGeometry=await mosaic.evaluate(node=>{
    const box=node.getBoundingClientRect();
    const tiles=[...node.querySelectorAll(".aoPrayPilotTile")].map(x=>({
      width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height
    }));
    return {width:box.width,display:getComputedStyle(node).display,
      home:node.closest(".aoPrayPilotHome")?.getBoundingClientRect().width,tiles};
   });
   assert.ok(mosaicGeometry.width>=width*.78&&mosaicGeometry.tiles.every(x=>x.width>=width*.19&&x.height>=74),
    "R1.1 mosaic must fill six-column phone grid, not collapse to a thin strip: "+JSON.stringify(mosaicGeometry));
   await page.screenshot({path:resolve(output,"discovery-"+width+".png"),animations:"disabled"});
   const overflow=await page.evaluate(()=>{
    const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
    return {document:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      content:mount?Math.max(0,mount.scrollWidth-mount.clientWidth):999};
   });
   assert.ok(overflow.document<=1&&overflow.content<=1,"Discovery must not overflow: "+JSON.stringify(overflow));
   const search=page.locator(base+" [data-p435930-pilot-search]");
   await search.fill("Memorare");
   assert.equal(await mosaic.isVisible(),false,"search should replace mosaic temporarily");
   const memo=page.locator(base+" [data-p435930-pilot-prayer]").filter({hasText:"Memorare"}).first();
   assert.ok(await memo.isVisible(),"search should find canonical prayer records");
   const facets=page.locator(base+" [data-p435930-pilot-facet]");
   assert.equal(await facets.count(),5,"R1.1 search must expose form and Latin filters");
   const litanyFacet=page.locator(base+' [data-p435930-pilot-facet="litany"]');
   await litanyFacet.click();
   assert.equal(await litanyFacet.getAttribute("aria-pressed"),"true");
   assert.equal(await memo.isVisible(),false,"Litany facet must exclude a non-litany");
   await litanyFacet.click();
   assert.equal(await memo.isVisible(),true,"Clearing the facet restores the canonical prayer");
   await memo.click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"library","search must open the real canonical Library");
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   // The nine shelves have ONE primary location per route or source prayer.
   const seen=new Map();
   const nine=["daily","chaplets","eucharistic","marian","novenas","ourlord","saints","intentions"];
   for(const door of nine){
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
    await page.locator(base+' [data-p435930-family="'+door+'"]').click();
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"family");
    assert.equal(await page.locator(base+" [data-ao-prayer-shelf] .aoPrayDoorHeading h2").count(),1,
      "Each Claude door has one content title below its unassigned artwork band: "+door);
    assert.equal(await page.locator(base+" [data-ao-prayer-shelf] .aoPrayDoorArtwork[data-ao-art-binding=unassigned]").count(),1,
      "Door art must remain a labelled, unassigned slot until exact painting clearance: "+door);
    assert.ok(await page.locator(base+" [data-ao-prayer-shelf] [data-p435930-door-filter]").count()>=2,
      "Source-scoped category filters must remain visible: "+door);
    if(door==="marian"){
      const featured=await page.locator(base+" .aoPrayDoorFeaturedCopy b").textContent();
      assert.equal(featured.trim(),"Litany of Loreto","Keep the readable editorial title; canonical source edition stays in the reader");
    }
    if(["eucharistic","ourlord","intentions"].includes(door))
      assert.equal(await page.locator(base+" [data-ao-prayer-shelf] .aoPrayDoorContext").count(),1,
       "Restore the discreet source glossary context below the shelf, not before its featured prayer");

    const rows=await page.locator(base+" [data-ao-prayer-shelf] [data-p435930-own],"+
      base+" [data-ao-prayer-shelf] [data-p435930-external],"+
      base+" [data-ao-prayer-shelf] [data-p435930-door-prayer]").evaluateAll(nodes=>nodes.map(el=>
      el.dataset.p435930Own||el.dataset.p435930External||el.dataset.p435930DoorPrayer));
    assert.ok(rows.length>=2,"Every real door needs at least two distinct source-owned entries: "+door);
    assert.equal(new Set(rows).size,rows.length,"Within-door duplicates: "+door);
    const activeFacet=page.locator(base+' [data-ao-prayer-shelf] [data-p435930-door-filter]:not([data-p435930-door-filter=all])').first();
    await activeFacet.click();
    const chosen=await activeFacet.getAttribute('data-p435930-door-filter');
    assert.equal(await activeFacet.getAttribute('aria-pressed'),'true',"Category filter must be interactive");
    const shown=await page.locator(base+' [data-ao-prayer-shelf] [data-ao-pray-door-entry]:visible').evaluateAll(nodes=>nodes.map(n=>n.dataset.aoPrayDoorFacet));
    assert.ok(shown.length>0&&shown.every(v=>v===chosen),"Filter cannot claim selection while leaving unrelated prayers visible: "+door);
    await page.locator(base+' [data-ao-prayer-shelf] [data-p435930-door-filter=all]').click();
    assert.equal(await page.locator(base+' [data-ao-prayer-shelf] [data-ao-pray-door-entry]:visible').count(),rows.length,"All must restore every unique shelf row");
    for(const id of rows){
      assert.equal(seen.has(id),false,"Prayer "+id+" appears in both "+seen.get(id)+" and "+door);
      seen.set(id,door);
    }
    const geometry=await page.locator(base+" [data-ao-prayer-shelf]").evaluate(el=>({
      width:el.scrollWidth,client:el.clientWidth,doc:document.documentElement.scrollWidth-innerWidth
    }));
    assert.ok(geometry.width-geometry.client<=1&&geometry.doc<=1,"Door interior must not overflow at "+width+": "+door);
    await page.screenshot({path:resolve(output,"shelf-"+door+"-"+width+".png"),animations:"disabled"});
   }
   for(const [id,door] of [["pray.rosary","chaplets"],["pray.angelus_regina","daily"],
    ["pray.litany_saints","saints"],["pray.holy_name_litany","ourlord"],
    ["pray.good_death","intentions"]])assert.equal(seen.get(id),door,"Incorrect single home for "+id);
   assert.ok(!seen.has("pray.rosary_methods"),"Rosary method settings are inside the Rosary, not a duplicate card");
   assert.ok(!seen.has("pray.sacred_hymns"),"Hymns remain discoverable without a duplicate door row");
   // A single source prayer is opened in the original canonical Library
   // reader, with return to its original shelf rather than a second library list.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(base+' [data-p435930-family="marian"]').click();
   await page.locator(base+' [data-p435930-door-prayer="marian_memorare"]').click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"library");
   await page.locator(base+' [data-p435930-lib-back]').click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"family","Source-prayer Back must return to Our Lady shelf");
   assert.equal(await page.locator(base+' [data-ao-prayer-shelf="marian"]').count(),1);
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(base+' [data-p435930-family="daily"]').click();
   await page.locator(base+' [data-p435930-own="pray.angelus_regina"]').click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"angelus");
   assert.equal(await page.locator(base+" [data-p435930-pilot-angelus-begin]").count(),1,
    "Prayer-entry Angelus should have the approved optional opening");
   const cover=page.locator(base+" .aoPrayPilotAngelusEntry");
   assert.equal(await cover.locator(".aoPrayPilotAngelusArtSlot").count(),1,
     "Approved full-height hour entry keeps an unassigned artwork slot rather than invented art");
   assert.equal(await cover.locator(".aoPrayPilotBellGroup").count(),4,"Traditional bell sequence groups 3+3+3+9");
   assert.equal(await cover.locator(".aoPrayPilotBellDot").count(),18);
   const firstFold=await cover.evaluate(el=>{
      const actions=el.querySelector(".aoPrayPilotAngelusActions"),begin=el.querySelector("[data-p435930-pilot-angelus-begin]");
      const alone=el.querySelector("[data-p435930-pilot-angelus-recitation]");
      const hero=el.querySelector(".aoPrayPilotAngelusHero").getBoundingClientRect();
      const cover=el.getBoundingClientRect(),h2=el.querySelector(".aoPrayPilotAngelusCoverCopy h2").getBoundingClientRect(),artSlot=el.querySelector(".aoPrayPilotAngelusArtSlot").getBoundingClientRect();
      const heroTop=hero.top,artSlotTop=artSlot.top;
      const appHeader=document.querySelector("#aoPray435930 .aoP435930Head")?.getBoundingClientRect();
      const b=begin.getBoundingClientRect(),a=alone.getBoundingClientRect();
      return {heroHeight:hero.height,heroTop,artSlotTop,coverBottom:cover.bottom,titleTop:h2.top,headerBottom:appHeader?.bottom||0,
        beginTop:b.top,beginBottom:b.bottom,recitationTop:a.top,recitationBottom:a.bottom,
        navTop:document.querySelector("#ao-global-ribbon, .aoAppBottomNav, .aoShellTabBar, nav[aria-label='Main navigation']")?.getBoundingClientRect()?.top||(innerHeight-64)};
   });
   assert.ok(firstFold.heroHeight>=Math.max(260,width===320?260:400)&&firstFold.beginBottom<firstFold.recitationTop,
     "The art band must actually expand and Begin remain ABOVE recitation: "+JSON.stringify(firstFold));
   assert.ok(firstFold.heroTop>=firstFold.headerBottom-2&&firstFold.artSlotTop>=firstFold.headerBottom,
     "Angelus hero and ART SLOT may never scroll underneath the sticky native header: "+JSON.stringify(firstFold));
   assert.ok(firstFold.titleTop>=firstFold.headerBottom+2,
     "Full Angelus title must not sit under the sticky native header at "+width+": "+JSON.stringify(firstFold));
   assert.ok(firstFold.coverBottom>=firstFold.navTop-22&&firstFold.coverBottom<=firstFold.navTop+35,
     "Angelus cover must fill the available first screen; no large empty lower half at "+width+": "+JSON.stringify(firstFold));
   assert.ok(firstFold.recitationBottom<=firstFold.navTop-3,
     "Begin and Alone/With others must BOTH remain visible above navigation at "+width+": "+JSON.stringify(firstFold));
   const group=page.locator(base+' [data-p435930-pilot-angelus-recitation="group"]');
   assert.equal(await group.count(),1,"F04 entry must expose existing Alone/With others recitation");
   await group.click();
   assert.equal(await group.getAttribute("aria-pressed"),"true");
   const recitationScroll=await page.locator(base+" .aoP435930Mount").evaluate(el=>el.scrollTop);
   assert.ok(recitationScroll<=2,"Selecting Alone/With others must not scroll the Angelus artwork offscreen: "+recitationScroll);
   assert.equal(await page.evaluate(()=>localStorage.getItem("ao-prayer-recitation-mode")),"group",
    "Group recitation must reuse the existing saved preference, not create a second engine");
   await page.screenshot({path:resolve(output,"angelus-entry-"+width+".png"),animations:"disabled"});
   await page.locator(base+" [data-p435930-pilot-angelus-begin]").click();
   const horariumGeometry=await page.locator(base+" .aoClaudeHorariumClock").first().evaluate(el=>{
    const r=el.getBoundingClientRect(),mount=document.querySelector("#aoPray435930 .aoP435930Mount");
    return {top:r.top,bottom:r.bottom,mountScroll:mount?.scrollTop};
   });
   assert.ok(horariumGeometry.top>=48&&horariumGeometry.top<=160&&horariumGeometry.mountScroll<=2,
    "Claude Horarium opening should not inherit the previous screen's scroll at "+width+"px: "+JSON.stringify(horariumGeometry));
   await page.waitForFunction(()=>document.querySelectorAll("#aoPray435930.open .aoDevoCard").length>=4);
   const count=await page.locator(base+" .aoDevoCard").count();
   assert.ok(count===4||count===5,"canonical Angelus / Regina must retain its original 4/5 cards; got "+count);
   assert.equal(await page.locator(base+" [data-p435930-pilot-angelus-begin]").count(),0);
   await page.screenshot({path:resolve(output,"angelus-cards-"+width+".png"),animations:"disabled"});
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null}));
   await page.waitForFunction(()=>document.querySelectorAll("#aoPray435930.open .aoDevoCard").length>=4);
   assert.equal(await page.locator(base+" [data-p435930-pilot-angelus-begin]").count(),0,
    "direct homepage Angelus entry must skip the cinematic introduction");

   // Claude c1 Adoration: two stacked, illustrated-but-unpublished entry
   // surfaces, visible guided forms, and preservation of both real readers.
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null}));
   const chooser=page.locator(base+' [data-ao-adoration-chooser="quiet-v2"]');
   assert.equal(await chooser.count(),1);
   const cards=chooser.locator('.aoAdorationPrimaryGrid button');
   assert.equal(await cards.count(),2,"Approved Adoration c1 has two principal entry cards");
   const geom=await cards.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}}));
   assert.ok(geom[0].height>=160&&geom[1].top>=geom[0].bottom,
     "Adoration entry cards must stack vertically at "+width+"px: "+JSON.stringify(geom));
   assert.ok(await chooser.locator('.aoAdorationMethodsDisclosure[open] .aoP435930BigGrid button').count()>=4,
     "Approved Claude c1 guided forms must be visible, not hidden behind a collapsed disclosure");
   assert.equal(await chooser.locator('.aoAdorationPrimaryGrid [data-ao-art-binding=unassigned]').count(),2,
     "Do not publish uncertified Adoration paintings or illustrations");
   await page.screenshot({path:resolve(output,"adoration-claude-c1-"+width+".png"),animations:"disabled"});
   await chooser.locator('[data-p435930-ador-mode="visit"]').click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().adorationMode),"visit",
     "The approved Visit artwork card must open the canonical guided Visit");
   const reverenceCue=page.locator(base+' .aoDevotionalActionCinematic .aoDevotionalActionContinue');
   if(await reverenceCue.count())await reverenceCue.click(); // Preserve and acknowledge the canonical genuflection cue.
   await page.locator(base+' [data-p435930-ador-home]').click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().adorationMode),"home");
   await page.locator(base+' [data-p435930-ador-mode="open"]').click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().adorationMode),"open",
     "The Silent Adoration card must retain its canonical untimed reader");
   assert.deepEqual(errors,[],"Uncaught pilot JavaScript errors at "+width+": "+errors.join("; "));
   console.log("PASS "+width+"px: nine non-overlapping shelves, Marian source reader, Daily Angelus, search and direct bypass");
  }finally{await page.close()}
 }
 // Explicit rollback restores the existing six-family hub, not a new owner.
 const rollback=await browser.newPage({viewport:{width:320,height:568},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 try{
  const origin="http://127.0.0.1:"+server.address().port;
  await rollback.goto(origin+"/index.html?aoPrayerPilot=0",{waitUntil:"domcontentloaded",timeout:90000});
  await rollback.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
  assert.equal(await rollback.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
  const base="#aoPray435930.open";
  assert.equal(await rollback.locator(base+" [data-ao-pray-pilot-mosaic]").count(),0,"legacy rollback must not show mosaic");
  assert.ok(await rollback.locator(base+" .aoP435930RootGroup").count()>=3,"legacy rollback must show original grouped Prayer destinations");
  await rollback.screenshot({path:resolve(output,"legacy-rollback-320.png"),animations:"disabled"});
  console.log("PASS 320px: explicit legacy Prayer landing rollback");
 }finally{await rollback.close()}
}finally{
 await browser?.close();
 await new Promise(resolveClose=>server.close(resolveClose));
}
