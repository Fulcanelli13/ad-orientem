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
   // Nine editorial doors retain the old canonical items without extra engines.
    for(const [door,route] of [["intentions","pray.penitential_psalms"],["ourlord","pray.tenebrae"],["novenas","pray.holy_name_litany"]]){
     await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
     await page.locator(base+' [data-p435930-family="'+door+'"]').click();
     assert.equal(await page.locator(base+' [data-p435930-own="'+route+'"],'+base+' [data-p435930-external="'+route+'"]').count(),1,
      "R1.1 editorial door "+door+" lost canonical route "+route);
    }
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
    await page.locator(base+' [data-p435930-family="marian"]').click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"family","Our Lady is a discovery family, not a new reader engine");
   await page.locator(base+' [data-p435930-own="pray.angelus_regina"]').click();
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.state().view),"angelus");
   assert.equal(await page.locator(base+" [data-p435930-pilot-angelus-begin]").count(),1,
    "Prayer-entry Angelus should have the approved optional opening");
   const group=page.locator(base+' [data-p435930-pilot-angelus-recitation="group"]');
   assert.equal(await group.count(),1,"F04 entry must expose existing Alone/With others recitation");
   await group.click();
   assert.equal(await group.getAttribute("aria-pressed"),"true");
   assert.equal(await page.evaluate(()=>localStorage.getItem("ao-prayer-recitation-mode")),"group",
    "Group recitation must reuse the existing saved preference, not create a second engine");
   const hourCard=await page.locator(base+" .aoPrayPilotAngelusHero").evaluate(node=>({
    height:node.getBoundingClientRect().height,
    viewport:window.innerHeight,
    text:node.innerText
   }));
   assert.ok(hourCard.height>=hourCard.viewport*.72,
    "F04 Angelus must fill available phone viewport, not leave a blank half-screen: "+JSON.stringify(hourCard));
   assert.doesNotMatch(hourCard.text,/A pause for prayer|existing named cards/,
    "F04 hour card must not show developer explanation");
   await page.screenshot({path:resolve(output,"angelus-entry-"+width+".png"),animations:"disabled"});
   await page.locator(base+" [data-p435930-pilot-angelus-begin]").click();
   await page.waitForFunction(()=>document.querySelectorAll("#aoPray435930.open .aoDevoCard").length>=4);
   const count=await page.locator(base+" .aoDevoCard").count();
   assert.ok(count===4||count===5,"canonical Angelus / Regina must retain its original 4/5 cards; got "+count);
   assert.equal(await page.locator(base+" [data-p435930-pilot-angelus-begin]").count(),0);
   await page.screenshot({path:resolve(output,"angelus-cards-"+width+".png"),animations:"disabled"});
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null}));
   await page.waitForFunction(()=>document.querySelectorAll("#aoPray435930.open .aoDevoCard").length>=4);
   assert.equal(await page.locator(base+" [data-p435930-pilot-angelus-begin]").count(),0,
    "direct homepage Angelus entry must skip the cinematic introduction");
   assert.deepEqual(errors,[],"Uncaught pilot JavaScript errors at "+width+": "+errors.join("; "));
   console.log("PASS "+width+"px: DEFAULT nine-door discovery, canonical search, Marian handoff, Angelus entry and direct bypass");
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
