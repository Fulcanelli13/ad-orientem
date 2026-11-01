// Real Playwright acceptance: source-backed TLM venue -> preview -> church profile.
// Only the existing Explore surface. No test-only venue, image or fabricated status.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/explore-tlm-church-card");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok);});
const origin="http://127.0.0.1:"+server.address().port;
let browser;const measurements=[];
try{
 browser=await chromium.launch({headless:true});
 for(const {width,height,language} of [
  {width:320,height:700,language:"en"},
  {width:390,height:844,language:"fr"},
  {width:1440,height:960,language:"en"},
 ]){
  const mobile=width<700,context=await browser.newContext({
   viewport:{width,height},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,
   locale:language==="fr"?"fr-FR":"en-GB",reducedMotion:"reduce"
  });
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  const captures=async suffix=>page.screenshot({
   path:resolve(out,width+"-"+language+"-"+suffix+".png"),animations:"disabled",fullPage:false
  });
  try{
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.locator('[data-ao-app-surface="find"]').waitFor({state:"visible",timeout:30000});
   await page.locator('[data-ao-app-surface="find"]').click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"&&
    !!document.querySelector(".aoHeritageMassShortcut"),null,{timeout:60000});
   if(language==="fr"){
    await page.evaluate(async()=>{
     globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"});
     await globalThis.AO_FIND_APP_V1.paint();
    });
   }
   await page.locator(".aoHeritageMassShortcut").click();
   // The state changes to TLM before the async 2,582-record directory render
   // finishes. Wait for the actual new lens DOM before selecting List; counting
   // buttons on the old Heritage DOM silently skips the view transition.
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="tlm",null,{timeout:25000});
   await page.locator('.aoFindBody[data-explore-lens="tlm"]').waitFor({state:"visible",timeout:60000});
   // Real browser acceptance for the source-owned CL2 country facet.
   // Map and list share the same filters. Multiple selections must remain
   // visible after repaint, without hiding the panel or moving map controls.
   const filters=page.locator(".aoAtlasTlmExtra");
   assert.equal(await filters.count(),1,"Map needs an accessible advanced filter disclosure");
   await filters.locator("summary").first().click();
   const country=filters.locator(".aoTlmCountryFacet");
   await country.locator("summary").click();
   const fr=country.locator('[data-find-tlm-country="FR"]');
   const us=country.locator('[data-find-tlm-country="US"]');
   assert.equal(await fr.count(),1,"Source country France missing");
   assert.equal(await us.count(),1,"Source country United States missing");
   await fr.click();
   await page.waitForFunction(()=>document.querySelector('[data-find-tlm-country="FR"]')?.getAttribute("aria-pressed")==="true",null,{timeout:25000});
   assert.equal(await page.locator(".aoAtlasTlmExtra").getAttribute("open"),"",
    "Advanced filter disclosure should remain open after selecting a country");
   assert.equal(await page.locator(".aoTlmCountryFacet").getAttribute("open"),"",
    "Country disclosure should remain open after repaint");
   await page.locator('[data-find-tlm-country="US"]').click();
   await page.waitForFunction(()=>["FR","US"].every(cc=>
    document.querySelector('[data-find-tlm-country="'+cc+'"]')?.getAttribute("aria-pressed")==="true"),null,{timeout:25000});
   const bounds=await page.locator(".aoTlmCountryFacet").evaluate(el=>{
    const r=el.getBoundingClientRect(),b=el.querySelector(".aoTlmCountryOptions").getBoundingClientRect();
    return {left:r.left,right:r.right,optsLeft:b.left,optsRight:b.right,
      overflow:el.scrollWidth-el.clientWidth,documentOverflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert.ok(bounds.left>=-2&&bounds.right<=width+2&&bounds.optsLeft>=-2&&bounds.optsRight<=width+2,
    "Country panel must fit screen: "+JSON.stringify(bounds));
   assert.ok(bounds.overflow<=2&&bounds.documentOverflow<=2,
    "Country panel horizontally overflows: "+JSON.stringify(bounds));
   await captures("00-country-filters");
   await page.locator("[data-find-tlm-country-reset]").click();
   await page.waitForFunction(()=>["FR","US"].every(cc=>
    document.querySelector('[data-find-tlm-country="'+cc+'"]')?.getAttribute("aria-pressed")==="false"),null,{timeout:25000});
   // CL27 public axes: 1962 is a celebration-level programme witness, not
   // venue-wide status. Exercise advanced filters at 320/390/1440 widths.
   const cl27=page.locator(".aoTlmCl27Facet");
   assert.equal(await cl27.count(),1,"One CL27 map disclosure");
   await cl27.locator("summary").first().click();
   assert.equal(await page.locator(".aoTlmCl27Axis").count(),12,"All 12 CL27 axes render");
   assert.equal(await page.locator('[data-find-cl27-axis="una_cum"][data-find-cl27-value="YES"]').count(),0,
    "Una Cum has no unapproved positive filter");
   const missal1962=page.locator('[data-find-cl27-axis="missal_edition"][data-find-cl27-value="1962"]');
   assert.equal(await missal1962.count(),1,"Two approved programme witnesses are filterable");
   assert.ok((await missal1962.innerText()).includes("(2)"),"Witness count remains two");
   await missal1962.click();
   await page.waitForFunction(()=>document.querySelector(
    '[data-find-cl27-axis="missal_edition"][data-find-cl27-value="1962"]'
   )?.getAttribute("aria-pressed")==="true",null,{timeout:25000});
   assert.equal(await page.locator(".aoAtlasTlmExtra").getAttribute("open"),"",
    "Advanced filter disclosure persists through CL27 repaint");
   assert.equal(await page.locator(".aoTlmCl27Facet").getAttribute("open"),"",
    "CL27 disclosure persists through map repaint");
   const cl27Bounds=await page.locator(".aoTlmCl27Facet").evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {left:r.left,right:r.right,documentOverflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert.ok(cl27Bounds.left>=-2&&cl27Bounds.right<=width+2&&cl27Bounds.documentOverflow<=2,
    "CL27 panel must fit screen: "+JSON.stringify(cl27Bounds));
   await captures("00-cl27-facets");
   await page.locator('[data-find-cl27-axis="missal_edition"][data-find-cl27-value="ALL"]').click();
   await page.waitForFunction(()=>document.querySelector(
    '[data-find-cl27-axis="missal_edition"][data-find-cl27-value="ALL"]'
   )?.getAttribute("aria-pressed")==="true",null,{timeout:25000});
   await page.locator(".aoAtlasTlmExtra > summary").click();
   // Desktop concept A: source-filtered results at left, right church folio,
   // and the exact SAME live MapLibre canvas throughout selection.
   const mapRail=page.locator(".aoTlmMapRail");
   assert.equal(await mapRail.count(),1,"Map-first TLM view must contain a contextual results rail");
   if(width===1440){
    await page.waitForFunction(()=>{
      const n=document.querySelector(".aoTlmMapRailCount");
      return !!document.querySelector(".aoFindMap .maplibregl-canvas")&&
       n&&/^[0-9]+$/.test(n.textContent||"")&&Number(n.textContent)>0;
    },null,{timeout:45000});
    await mapRail.waitFor({state:"visible"});
    assert.ok(await mapRail.locator(".aoTlmMapRailItem").count()>0,
      "Viewport rail should show actual source-owned mapped venues");
    // Collapsing the desktop rail must release its map area rather than
    // leave an invisible 75%-height hit target over MapLibre.
    await mapRail.locator(".aoTlmMapRailToggle").click();
    const closed=await mapRail.evaluate(el=>({
      height:el.getBoundingClientRect().height,
      open:el.querySelector("details")?.open,
    }));
    assert.equal(closed.open,false);
    assert.ok(closed.height<100,"Collapsed rail still blocks map: "+JSON.stringify(closed));
    await mapRail.locator(".aoTlmMapRailToggle").click();
    assert.equal(await mapRail.locator("details").getAttribute("open"),"");
    await page.evaluate(()=>{window.__originalTlmCanvas=document.querySelector(".aoFindMap .maplibregl-canvas");});
    const mapControls=await page.evaluate(()=>{
      const r=x=>{const e=document.querySelector(x);if(!e)return null;const b=e.getBoundingClientRect();return {left:b.left,right:b.right,height:b.height};};
      return {rail:r(".aoTlmMapRail"),reset:r(".aoExploreMapReset"),
        legend:r(".aoMapLegend"),viewport:innerWidth};
    });
    assert.ok(mapControls.reset?.height>=44&&mapControls.reset.left>=mapControls.rail.right+5,
      "All-mapped map reset must remain accessible beside desktop results: "+JSON.stringify(mapControls));
    assert.ok(mapControls.legend?.left>=mapControls.rail.right+5,
      "Map legend must not be buried beneath the contextual results rail: "+JSON.stringify(mapControls));
    await captures("00-map-first-desktop");
    await mapRail.locator(".aoTlmMapRailItem").first().click();
    const railPreview=page.locator(".aoExploreQuickPreview");
    await railPreview.waitFor({state:"visible",timeout:12000});
    assert.equal(await page.evaluate(()=>window.__originalTlmCanvas===
      document.querySelector(".aoFindMap .maplibregl-canvas")),true,
      "Selecting an in-view church must not remount MapLibre");
    await railPreview.locator("[data-explore-expand-detail]").click();
    const sideProfile=page.locator(".aoTlmChurchProfile");
    await sideProfile.waitFor({state:"visible",timeout:12000});
    const panels=await sideProfile.evaluate(el=>{
      const rect=x=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width};};
      return {rail:rect(document.querySelector(".aoTlmMapRail")),
       profile:rect(el),viewport:innerWidth,
       sameCanvas:window.__originalTlmCanvas===document.querySelector(".aoFindMap .maplibregl-canvas"),
       overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert.ok(panels.sameCanvas,"Opening the full church profile must retain map camera/canvas");
    assert.ok(panels.rail.right+12<panels.profile.x,
      "Two map-first desktop panels must leave a usable gap for MapLibre: "+JSON.stringify(panels));
    assert.ok(panels.profile.right<=width+1&&panels.overflow<=2,
      "Contextual desktop panel must not overflow viewport: "+JSON.stringify(panels));
    await captures("00-map-first-desktop-profile");
    await sideProfile.locator("[data-explore-collapse-detail]").click();
    await page.locator(".aoExploreQuickPreview").waitFor({state:"visible"});
    await page.locator(".aoExploreQuickPreview [data-find-close-detail]").click();
   }else{
    assert.equal(await mapRail.isVisible(),false,"320/390 phone map must not inherit the desktop results rail");
   }
   const list=page.locator('.aoFindViewTabs [data-find-filter="view"][data-find-filter-value="list"]');
   assert.equal(await list.count(),1,"TLM view must expose a real List control");
   await list.click();
   // The view toggle repaints asynchronously. Never type into a retiring
   // map search input: its input event can be superseded by list rendering.
   await page.locator('.aoFindBody[data-find-view="list"][data-explore-lens="tlm"]').waitFor({state:"visible",timeout:30000});
   await page.locator(".aoTlmVenueCard").first().waitFor({state:"visible",timeout:20000});
   // Test the compact secondary community menu on real touch-width layouts.
   // It must expose exact community filters without clipping or raw registry codes.
   const more=page.locator(".aoTlmMoreInstitutes");
   assert.equal(await more.count(),1,"Additional source communities need a compact disclosure");
   await more.locator("summary").click();
   const cantiusFilter=more.locator('[data-find-affiliation="CANONS_ST_JOHN_CANTIUS"]');
   await cantiusFilter.waitFor({state:"visible",timeout:12000});
   assert.match(await cantiusFilter.innerText(),
     language==="fr"?/Chanoines de Saint-Jean-de-Cantius/:/Canons of St John Cantius/);
   const menuBounds=await more.locator(".aoFindAffiliations").evaluate(el=>{
     const bounds=el.getBoundingClientRect();
     return {left:bounds.left,right:bounds.right,width:innerWidth,
       height:bounds.height,overflow:el.scrollWidth-el.clientWidth};
   });
   assert.ok(menuBounds.left>=-2&&menuBounds.right<=width+2,
     "Community menu must fit the phone viewport: "+JSON.stringify(menuBounds));
   assert.ok(menuBounds.overflow<=2,"Community filters must wrap instead of scrolling horizontally");
   await more.locator("summary").click();
   const search=page.locator("#ao-find-modular-root [data-find-query]");
   await search.fill("Cantius");
   // An institute-affiliation search may return other churches served by
   // the Canons (e.g. Sacred Heart, Springfield). The approved visual reference
   // is the physical St John Cantius Church in Chicago, source V19:SJC-001.
   // Select its stable R49 identity, not the first affiliation match.
   const exact=page.locator('.aoTlmVenueCard[data-explore-item="tlm:r49:V19:SJC-001"]');
   try{
    await page.waitForFunction(()=>{
     const root=document.querySelector("#ao-find-modular-root");
     return root?.querySelector("[data-find-query]")?.value==="Cantius"&&
      !!root?.querySelector('.aoTlmVenueCard[data-explore-item="tlm:r49:V19:SJC-001"]');
    },null,{timeout:15000});
    await exact.waitFor({state:"visible"});
   }
   catch(error){
    console.error("Church search diagnostic:",await page.evaluate(()=>({
     status:globalThis.AO_FIND_APP_V1?.status?.(),
     query:document.querySelector("#ao-find-modular-root [data-find-query]")?.value,
     results:document.querySelector("#ao-find-modular-root .aoFindResultMeta")?.textContent,
     view:document.querySelector("#ao-find-modular-root .aoFindBody")?.dataset?.findView,
     visible:document.querySelector("#ao-find-modular-root .aoFindList")?.textContent?.slice(0,250)
    })));
    throw error;
   }
   const title=await exact.innerText();
   assert.match(title,/St\.? John Cantius Church/i,"Search must find the exact Chicago church, not an affiliated venue");
   const approvedPhoto=exact.locator(".aoTlmVenueVisual > img");
   assert.equal(await approvedPhoto.count(),1,
    "Exact Chicago church must display its approved Place photograph, not an affiliation emblem");
   assert.match(await approvedPhoto.getAttribute("src"),/assets\/approved\/place-media\/US-st-john-cantius-chicago\.webp$/);
   await exact.click();
   const preview=page.locator(".aoExploreQuickPreview");
   await preview.waitFor({state:"visible",timeout:12000});
   assert.equal(await preview.locator('[data-explore-expand-detail]').count(),1);
   assert.match(await preview.innerText(),/St\.? John Cantius Church/i);
   await captures("01-preview");
   await preview.locator('[data-explore-expand-detail]').click();
   const expanded=page.locator(".aoTlmChurchProfile");
   await expanded.waitFor({state:"visible",timeout:12000});
   assert.match(await expanded.locator("h2").innerText(),/St\.? John Cantius Church/i);
   assert.equal(await expanded.locator(".aoTlmProfileSpotlight").count(),1);
   assert.equal(await expanded.locator(".aoTlmProfileAffiliation").count(),1);
   assert.equal(await expanded.locator(".aoTlmProfileSourceDisclosure").count(),1);
   assert.match(await expanded.innerText(),language==="fr"?/Non établi|Sources et vérification/:/Not established|Sources & verification/);
   const metrics=await expanded.evaluate(el=>{
    const r=el.getBoundingClientRect(),spot=el.querySelector(".aoTlmProfileSpotlight")?.getBoundingClientRect();
    const nav=el.querySelector(".aoTlmProfileChrome")?.getBoundingClientRect();
    const actions=[...el.querySelectorAll(".aoTlmProfileChrome button")].map(e=>e.getBoundingClientRect().height);
    return {vw:innerWidth,vh:innerHeight,x:r.x,right:r.right,y:r.y,bottom:r.bottom,
     width:r.width,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
     contentHeight:el.scrollHeight,spotWidth:spot?.width,navHeight:nav?.height,
     actionHeights:actions,documentOverflow:document.documentElement.scrollWidth-innerWidth,
     visualKind:el.querySelector(".aoTlmProfileMedia .aoTlmVenueIdentity")?.dataset?.visualKind??"photo"};
   });
   assert.ok(metrics.x>=-2&&metrics.right<=width+2,"Profile extends outside viewport: "+JSON.stringify(metrics));
   assert.ok(metrics.scrollWidth<=metrics.clientWidth+2,"Profile horizontally scrolls: "+JSON.stringify(metrics));
   assert.ok(metrics.documentOverflow<=2,"Page horizontally overflows: "+JSON.stringify(metrics));
   assert.ok(metrics.actionHeights.every(n=>n>=44),"Back/close tap target below 44 px");
   assert.ok(metrics.spotWidth>0&&metrics.navHeight>=44,"Profile primary hierarchy collapsed");
   assert.deepEqual(errors,[],"JS errors in real browser: "+errors.slice(0,5).join(" | "));
   await captures("02-expanded-top");
   const summary=expanded.locator(".aoTlmProfileSourceDisclosure summary");
   await summary.click();
   assert.equal(await expanded.locator(".aoTlmProfileSourceDisclosure").getAttribute("open"),"");
   assert.ok((await expanded.locator('.aoTlmProfileSourceContent a[href^="https://"]').count())>0,
    "Expanded profile must retain original source links");
   await expanded.evaluate(el=>{el.scrollTop=el.scrollHeight;});
   await captures("03-expanded-sources");
   await expanded.locator("[data-explore-collapse-detail]").click();
   await preview.waitFor({state:"visible"});
   assert.equal(await page.locator(".aoTlmChurchProfile").count(),0,"Back must restore preview");

   // Real exact-venue photograph test: the 2,582-site CL2 directory has
   // source-owned photos without a Sacred Place. Opening screen 5 must not
   // regress to an institute emblem when the compact card displays the photo.
   await preview.locator("[data-find-close-detail]").click();
   await page.locator(".aoExploreQuickPreview").waitFor({state:"detached"});
   await page.locator("#ao-find-modular-root [data-find-query]").fill("Groombridge");
   const groombridge=page.locator('.aoTlmVenueCard[data-explore-item="tlm:r49:SSPXMAP:OPE-002280"]');
   await groombridge.waitFor({state:"visible",timeout:15000});
   const venueCardPhoto=groombridge.locator('.aoTlmVenueVisual > img');
   assert.equal(await venueCardPhoto.count(),1,"Groombridge must retain its approved exact-venue photograph");
   assert.match(await venueCardPhoto.getAttribute("src"),/assets\/approved\/directory-media\/GB-groombridge-st-pius-v.webp$/);
   await groombridge.click();
   const venuePreview=page.locator(".aoExploreQuickPreview");
   await venuePreview.waitFor({state:"visible"});
   await venuePreview.locator("[data-explore-expand-detail]").click();
   const venueExpanded=page.locator(".aoTlmChurchProfile");
   await venueExpanded.waitFor({state:"visible"});
   assert.equal(await venueExpanded.locator('.aoTlmProfileHero img[src$="GB-groombridge-st-pius-v.webp"]').count(),1,
     "Expanded church profile must preserve the exact approved venue image");
   assert.match(await venueExpanded.innerText(),/Station Road, Groombridge TN3 9QX/i,
     "The physical-site address should not disappear from expanded details");
   assert.equal(await venueExpanded.locator(".aoTlmProfileEssentials .aoTlmProfileDatum").count(),3);
   assert.ok((await venueExpanded.locator('.aoTlmProfilePrimaryAction a[href^="https://"]').count())>=1,
     "Original published venue source must be accessible without hunting in a footer");
   const venueMetrics=await venueExpanded.evaluate(el=>({
     left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,
     overflow:el.scrollWidth-el.clientWidth,viewport:innerWidth
   }));
   assert.ok(venueMetrics.left>=-2&&venueMetrics.right<=width+2&&venueMetrics.overflow<=2,
     "Approved venue photo/profile must not overflow: "+JSON.stringify(venueMetrics));
   await captures("04-approved-venue-profile");
   measurements.push({width,language,title,metrics,passed:true});
   console.log("PASS TLM source-backed preview and church profile "+width+"px "+language);
  }catch(error){
   await captures("FAIL-current-state").catch(()=>{});
   measurements.push({width,language,passed:false,error:String(error.stack||error)});
   throw error;
  }finally{await context.close();}
 }
}finally{
 await writeFile(resolve(out,"metrics.json"),JSON.stringify(measurements,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
