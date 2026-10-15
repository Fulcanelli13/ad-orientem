import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4275,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
 const page=await context.newPage(),errors=[];
 const screenshotFolder=resolve(root,"test-output/biblical-atlas-a3");
 async function captureView(name){
   await mkdir(screenshotFolder,{recursive:true});
   for(const size of [320,390,768,1280]){
     await page.setViewportSize({width:size,height:844});
     await page.waitForTimeout(120);
     const geometry=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,rootWidth:document.querySelector("#ao-find-modular-root")?.getBoundingClientRect().width}));
     assert.ok(geometry.documentWidth<=geometry.width+1,name+" page overflow at "+size+"px: "+JSON.stringify(geometry));
     if(name==="cinematic-incarnation"||name==="genesis-branch-tree"){
       const visibility=await page.evaluate(()=>{
         const selectors=[".aoBibleStudyTabs [aria-pressed=true]",".aoBibleReviewTabs [aria-pressed=true]"];
         return selectors.map(selector=>document.querySelector("#ao-find-modular-root "+selector)).filter(Boolean).map(button=>{
           const outer=button.parentElement.getBoundingClientRect(),inner=button.getBoundingClientRect();
           return {label:button.textContent,visible:inner.left>=outer.left-2&&inner.right<=outer.right+2};
         });
       });
       assert.ok(visibility.length>=1&&visibility.every(x=>x.visible),name+" active tab not visible at "+size+": "+JSON.stringify(visibility));
       if(name==="cinematic-incarnation"&&size<=390){
         const chapterPicker=page.locator("#ao-find-modular-root [data-bible-study-chapter-select]");
         assert.equal(await chapterPicker.isVisible(),true,"selected chapter must be visible on a phone");
         assert.equal(await chapterPicker.inputValue(),"INCARNATION");
       }
     }
     await page.screenshot({path:resolve(screenshotFolder,name+"-"+size+".png"),fullPage:false,animations:"disabled"});
   }
   await page.setViewportSize({width:390,height:844});
 }

 page.on("pageerror",error=>errors.push(String(error?.message??error)));
 await page.goto("http://127.0.0.1:4275/index.html?biblicalReview=1",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForSelector('[data-ao-app-surface="find"]',{state:"visible",timeout:30000});
 await page.locator('[data-ao-app-surface="find"]').tap();
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready",null,{timeout:60000});
 await page.locator("#ao-find-modular-root details.aoHeritageMore > summary").tap({timeout:15000});
 await page.locator("#ao-find-modular-root .aoHeritageMore[open] [data-bible-atlas-open]").waitFor({state:"visible",timeout:15000});
 // Wait past the swipe guard's 280ms suppression window after the Browse reveal.
 await page.waitForTimeout(360);
 await page.locator("#ao-find-modular-root [data-bible-atlas-open]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===true&&
  document.querySelector("[data-ao-bible-atlas]"),null,{timeout:15000}).catch(async error=>{
  const detail=await page.evaluate(()=>({status:globalThis.AO_FIND_APP_V1?.status?.(),load:document.querySelector("#ao-find-modular-root")?.dataset?.aoFindLoadState,error:document.querySelector("[data-find-action-error]")?.textContent,scriptErrors:document.querySelector("[data-ao-bible-atlas]")?.outerHTML?.slice(0,200)}));
  console.error("ATLAS_ENTRY_DIAGNOSTIC",JSON.stringify(detail));
  throw error;
});
 const stops=page.locator("#ao-find-modular-root [data-bible-step]");
 assert.equal(await stops.count(),151,"all milestones are one continuous ribbon");
 const track=page.locator("#ao-find-modular-root [data-bible-track]");
 const width=await track.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
 assert.ok(width.scroll>width.client*3,"timeline is not horizontally scrollable");
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-map]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-era-overlay]").count(),1);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-unlocated=true]").count(),1,
  "Creation has no geographic pin and must not display a large map-loading panel");
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-unlocated-note]").isVisible(),true);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-detail] [data-ao-scripture-context]").count(),1,
  "Creation remains Scripture-readable without an invented GPS point");
 await captureView("canonical-chronology");
 // Tapping a remote milestone should move the selected event, geography, and ribbon.
 await page.locator('#ao-find-modular-root [data-bible-step="71"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===71,null,{timeout:15000});
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-unlocated=false]").count(),1,
  "Infancy source anchors must restore the normal geographic map");
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-step="71"]').getAttribute("aria-pressed"),"true");
 const nearby=await track.evaluate(el=>{const middle=el.getBoundingClientRect().left+el.clientWidth/2;const card=el.querySelector('[data-bible-step="71"]').getBoundingClientRect();return Math.abs(card.left+card.width/2-middle)});
 assert.ok(nearby<125,"selected milestone should remain close to timeline centre");
 await page.locator('#ao-find-modular-root [data-bible-step="150"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===150,null,{timeout:15000});
 const last=await page.locator("#ao-find-modular-root [data-bible-detail]").innerText();
 assert.match(last,/new Jerusalem|Jérusalem nouvelle/i);
 assert.ok(await page.locator('#ao-find-modular-root [data-bible-step="150"]').getAttribute("aria-pressed")==="true");
 // Non-geographic apocalyptic visions remain on the timeline, with no fabricated pin.
 assert.match(last,/No earthly location|Aucun lieu terrestre/);
 // Native Scripture opens from an atlas milestone and leaves the atlas ready on return.
 await page.locator('#ao-find-modular-root [data-bible-step="3"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===3,null,{timeout:15000});
 await page.locator("#ao-find-modular-root [data-bible-detail] [data-ao-scripture-context]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===true,null,{timeout:15000});
 await page.locator('#ao-scripture-overlay [data-scripture-close]').first().tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1?.status?.().open===false,null,{timeout:15000});
 assert.equal(await page.locator("#ao-find-modular-root [data-ao-bible-atlas]").count(),1);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflow<=1,"Biblical Atlas causes horizontal page overflow at 390px");
 // Review-only native genealogy is a second Atlas view, not a replacement for 151 events.
 await page.locator('#ao-find-modular-root [data-bible-review-surface="genealogies"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="genealogies"&&
  document.querySelector("#ao-find-modular-root [data-ao-bible-review]"),null,{timeout:20000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-review-lineage]').count(),3);
 assert.ok(await page.locator('#ao-find-modular-root').getByText("Research preview", {exact:false}).count()>=1);
 await page.locator('#ao-find-modular-root [data-bible-review-lineage="matthew"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewLineage==="matthew",null,{timeout:15000});
 assert.match(await page.locator("#ao-find-modular-root [data-ao-bible-review]").innerText(),/St Matthew.s textual genealogy/);
 for(let i=0;i<3;i++)await page.locator('#ao-find-modular-root [data-bible-review-page="1"]').tap({timeout:15000});
 assert.match(await page.locator("#ao-find-modular-root [data-ao-bible-review]").innerText(),/Joseph/);
 assert.match(await page.locator("#ao-find-modular-root [data-ao-bible-review]").innerText(),/legal\/putative/i);
 await page.locator('#ao-find-modular-root [data-bible-review-lineage="luke"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewLineage==="luke",null,{timeout:15000});
 assert.match(await page.locator("#ao-find-modular-root [data-ao-bible-review]").innerText(),/St Luke.s textual genealogy/);
 await page.locator('#ao-find-modular-root [data-bible-review-lineage="genesis"]').tap({timeout:15000});
 await page.locator('#ao-find-modular-root [data-bible-review-root="noah"]').tap({timeout:15000});
 assert.match(await page.locator("#ao-find-modular-root [data-ao-bible-review]").innerText(),/Noah/);
 assert.equal(await page.locator('#ao-find-modular-root [role="tree"]').count(),1,"Genesis has a connected source hierarchy");
 assert.ok(await page.locator('#ao-find-modular-root [data-bible-family-edge]').count()>=2);
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-kin-diagram]').count(),1,
  "reviewed Genesis relations must appear as a source-linked graphical network");
 const geometry=await page.locator('#ao-find-modular-root [data-bible-kin-diagram]').evaluate(el=>({
  box:el.getBoundingClientRect().width,scrollWidth:el.scrollWidth,viewport:innerWidth,
  arcs:el.querySelectorAll("svg .aoBibleKinLines path").length,
  persons:el.querySelectorAll("svg [data-bible-kin-person]").length
 }));
 assert.ok(geometry.arcs>=2&&geometry.persons>=3,
  "genealogy must show cited connectors and distinct family nodes");
 const firstAncestor=await page.locator('#ao-find-modular-root [data-bible-kin-diagram] .aoBibleKinRoot rect').getAttribute("y");
 assert.ok(Number(firstAncestor)<=100,"first visible genealogy canvas must show its ancestor");
 assert.equal(await page.locator('#ao-find-modular-root .aoBibleReviewFamilyChoices').count(),1,
  "family roots should use one internally scrollable control row");
 assert.ok(geometry.box<=geometry.viewport+1&&geometry.scrollWidth>geometry.box,
  "genealogy may pan internally without widening the phone viewport");
 assert.equal(await page.locator('#ao-find-modular-root .aoBibleKinSourceList').count(),1,
  "an accessible fully sourced relationship list remains available");
 const diagram=page.locator('#ao-find-modular-root [data-bible-kin-diagram]');
 const metric=()=>diagram.evaluate(el=>({width:Number(el.querySelector("svg").getAttribute("width")),height:Number(el.querySelector("svg").getAttribute("height")),count:el.querySelectorAll("svg .aoBibleKinLines path").length}));
 const base=await metric();
 await page.locator('#ao-find-modular-root [data-bible-kin-zoom="in"]').tap();
 const larger=await metric();
 assert.ok(larger.width>base.width&&larger.height>base.height,
  "zoom in enlarges the actual scrollable SVG without inventing family edges");
 assert.equal(larger.count,base.count,"zoom does not generate new relationships");
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-kin-zoom-value]').textContent(),"120%");
 await page.locator('#ao-find-modular-root [data-bible-kin-zoom="out"]').tap();
 assert.equal((await metric()).width,base.width,"zoom out restores original intrinsic size");
 await page.locator('#ao-find-modular-root [data-bible-kin-zoom="reset"]').tap();
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-kin-zoom-value]').textContent(),"100%");


 assert.ok(await page.locator('#ao-find-modular-root [data-bible-family-person="shem"]').count()>=1);
 const treeOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(treeOverflow<=1,"Genesis tree does not expand the whole document");
 await captureView("genesis-branch-tree");
 await page.locator('#ao-find-modular-root [data-bible-review-surface="apostles"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="apostles",null,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-review-apostle]').count(),20);
 assert.ok(await page.locator('#ao-find-modular-root [data-evidence-kind="later"]').count()>=2,"Marian rival traditions clearly classified");
 const crosslink=page.locator('#ao-find-modular-root [data-bible-review-jump="66"]');
 assert.equal(await crosslink.count(),1,"Annunciation has one unique exact-citation timeline handoff");
 await crosslink.scrollIntoViewIfNeeded();await page.waitForTimeout(360);await crosslink.tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="timeline"&&
  globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===66&&
  /Annunciation/.test(document.querySelector("#ao-find-modular-root [data-bible-detail] h2")?.textContent||""),null,{timeout:15000});
 assert.match(await page.locator("#ao-find-modular-root [data-bible-detail]").innerText(),/Annunciation/);
 await page.locator('#ao-find-modular-root [data-bible-review-surface="apostles"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="apostles",null,{timeout:15000});
 const philip=page.locator('#ao-find-modular-root [data-bible-review-apostle="philip-evangelist"]');
 await philip.scrollIntoViewIfNeeded();await page.waitForTimeout(360);await philip.tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewApostle==="philip-evangelist",null,{timeout:15000});
 assert.match(await page.locator("#ao-find-modular-root [data-ao-bible-review]").innerText(),/Philip the Evangelist/);
 assert.equal(await page.locator("#ao-find-modular-root [data-bible-map]").count(),0,"unverified research locations must not become pins");
 // Four cinematic journeys are an evidence-classified study, not a replacement
 // of the 151-event canonical chronology. Research pins and artwork stay out.
 await page.locator('#ao-find-modular-root [data-bible-review-surface="cinematic"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="cinematic"&&
  document.querySelector('#ao-find-modular-root [data-bible-cinematic-review]'),null,{timeout:20000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-study-chapter]').count(),14);
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-study-scene="0"]').count(),1);
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-review-jump]').count(),0,"overlap cannot become a jump");
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-map]').count(),0,"no research map pins");
 await page.locator('#ao-find-modular-root [data-bible-study-chapter-select]').selectOption("DELIVERANCE");
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-study-scene="25"]'),null,{timeout:15000});
 await page.locator('#ao-find-modular-root [data-bible-study-direction="1"]').tap({timeout:15000});
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-study-scene="26"]'),null,{timeout:15000});
 await page.locator('#ao-find-modular-root [data-bible-study-chapter-select]').selectOption("INCARNATION");
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-study-scene="57"]'),null,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-review-jump="66"]').count(),1);
 // Reciprocal preview-only navigation: exact scene 57 → canonical 66 → scene 57.
 await page.locator('#ao-find-modular-root [data-bible-review-jump="66"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="timeline"&&
  globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===66,null,{timeout:15000});
 const sceneReturn=page.locator('#ao-find-modular-root [data-bible-review-open-scene="57"]');
 await sceneReturn.waitFor({state:"visible",timeout:15000});
 await sceneReturn.tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="cinematic"&&
  document.querySelector('#ao-find-modular-root [data-bible-study-scene="57"]'),null,{timeout:15000});
 const visualOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(visualOverflow<=1,"study view causes no horizontal page overflow");
 // The two A12 additions must be real reader states, not entries that exist
 // only in a research spreadsheet; each must navigate to its own 151-event ID.
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-study-jump]').count(),13);
 const innocents=page.locator('#ao-find-modular-root [data-bible-study-jump="181"]');
 await innocents.scrollIntoViewIfNeeded();
 await innocents.tap({timeout:15000});
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-study-scene="181"]'),null,{timeout:15000});
 assert.match(await page.locator('#ao-find-modular-root [data-bible-scene-stage]').innerText(),/Matthew 2:16/);
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-review-jump="73"]').count(),1);
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-review-event-key]').getAttribute("data-bible-review-event-key"),
  "biblical:event:bethlehem-additional-003");
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-scene-artwork]').count(),0,"no unapproved imagery");
 await page.locator('#ao-find-modular-root [data-bible-review-jump="73"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="timeline"&&
   globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===73,null,{timeout:15000});
 await page.locator('#ao-find-modular-root [data-bible-review-surface="cinematic"]').tap({timeout:15000});
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-cinematic-review]'),null,{timeout:15000});
 await page.locator('#ao-find-modular-root [data-bible-study-chapter-select]').selectOption("APOSTLES");
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-study-scene="182"]'),null,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-study-jump]').count(),6);
 assert.match(await page.locator('#ao-find-modular-root [data-bible-scene-stage]').innerText(),/Acts 2:1/);
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-review-event-key]').getAttribute("data-bible-review-event-key"),
  "biblical:passage:acts-2-1-41");
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-scene-artwork]').count(),0);
 await page.locator('#ao-find-modular-root [data-bible-review-jump="126"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="timeline"&&
   globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===126,null,{timeout:15000});
 await page.locator('#ao-find-modular-root [data-bible-review-surface="cinematic"]').tap({timeout:15000});
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-cinematic-review]'),null,{timeout:15000});
 await page.locator('#ao-find-modular-root [data-bible-study-chapter-select]').selectOption("INCARNATION");
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-study-scene="57"]'),null,{timeout:15000});
 await captureView("cinematic-incarnation");
 await page.locator('#ao-find-modular-root [data-bible-review-jump="66"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="timeline"&&
  globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===66&&
  /Annunciation/.test(document.querySelector("#ao-find-modular-root [data-bible-detail] h2")?.textContent||""),null,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-step]').count(),151);
 // Regression: the migrated John 2 cleansing stays in public-ministry source
 // order and retains reversible passage-based navigation from the 181 scenes.
 await page.locator('#ao-find-modular-root [data-bible-review-surface="cinematic"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="cinematic"&&
  document.querySelector('#ao-find-modular-root [data-bible-cinematic-review]'),null,{timeout:20000});
 await page.locator('#ao-find-modular-root [data-bible-study-chapter-select]').selectOption("MINISTRY");
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-study-scene="69"]'),null,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-study-jump]').count(),46,
  "all 46 ministry scenes have direct named timeline navigation");
 const selectedScene=page.locator('#ao-find-modular-root [data-bible-study-jump="74"]');
 await selectedScene.scrollIntoViewIfNeeded();
 await selectedScene.tap({timeout:15000});
 await page.waitForFunction(()=>document.querySelector('#ao-find-modular-root [data-bible-study-scene="74"]'),null,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-scene-stage]').count(),1,
  "direct scene selection retains the focused theatre stage");

 assert.equal(await page.locator('#ao-find-modular-root [data-bible-study-jump="74"]').getAttribute("aria-pressed"),"true");
 const sceneTrack=page.locator('#ao-find-modular-root [data-bible-study-timeline]');
 const centred=await sceneTrack.evaluate(el=>{
  const active=el.querySelector('[data-bible-study-jump="74"]');
  const rail=el.getBoundingClientRect(),card=active.getBoundingClientRect();
  return Math.abs((card.left+card.width/2)-(rail.left+rail.width/2));
 });
 assert.ok(centred<130,"scene timeline must keep the selected chapter moment visible");
 assert.match(await page.locator('#ao-find-modular-root [data-bible-cinematic-review]').innerText(),/Johannine narrative order/);
 const john2jump=page.locator('#ao-find-modular-root [data-bible-review-jump="82"]');
 assert.equal(await john2jump.count(),1);
 assert.equal(await john2jump.getAttribute("data-bible-review-event-key"),
  "biblical:event:jerusalem-temple-e3","the cinematic jump must retain its stable event identity");
 await john2jump.tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="timeline"&&
  globalThis.AO_FIND_APP_V1?.status?.().bibleIndex===82&&
  /Temple/.test(document.querySelector("#ao-find-modular-root [data-bible-detail] h2")?.textContent||""),null,{timeout:15000});
 assert.match(await page.locator('#ao-find-modular-root [data-bible-detail]').innerText(),/John narrates this cleansing/);

 await page.locator('#ao-find-modular-root [data-bible-review-surface="timeline"]').tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleReviewSurface==="timeline"&&
  document.querySelectorAll("#ao-find-modular-root [data-bible-step]").length===151,null,{timeout:15000});
 assert.equal(await page.locator('#ao-find-modular-root [data-bible-step="82"]').getAttribute("aria-pressed"),"true","migrated John 2 source reference restored after cinematic study");
 await page.locator("#ao-find-modular-root [data-bible-atlas-close]").tap({timeout:15000});
 await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().bibleAtlas===false&&
  document.querySelector('[data-find-view="map"][data-explore-lens="heritage"]'),null,{timeout:15000});
 assert.equal(errors.length,0,"Uncaught runtime errors: "+errors.join(" | "));
 console.log("PASS Biblical Atlas 390px phone: 151 events, John 2 cinematic-to-PUBLIC migration, native Scripture, research holds and Explore return");
 await context.close();
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
