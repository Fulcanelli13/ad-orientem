import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {resolvePrayerEditorialArtwork,angelusOpeningArtworkSlot,prayerEditorialPublicationSummary} from "../src/pray/art-slot-map.v1.js";
import {PRAYER_ART_EDITORIAL_SLOTS_V1} from "../src/pray/editorial-artwork-assignments.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/prayer-r5c-bulk-artwork");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".jpg":"image/jpeg",".png":"image/png",".woff2":"font/woff2"};
await mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err.message||err))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const summary=prayerEditorialPublicationSummary();
assert.equal(summary.total,267,"The approved 267-slot registry must not be truncated");
assert.equal(summary.states.PUBLISHED_EXACT_PHOTO,51,"Expected exact released-photo baseline has changed; re-audit before publication");
for(const [hour,id] of [[6,"STG-pray.angelus-01"],[12,"STG-pray.angelus-02"],[18,"STG-pray.angelus-03"]]){
 assert.equal(angelusOpeningArtworkSlot("angelus",hour,"2026-11-03"),id);
 assert.equal(resolvePrayerEditorialArtwork(id).state,"PUBLISHED_EXACT_PHOTO");
}
assert.equal(angelusOpeningArtworkSlot("angelus",12,"2026-03-25"),"STG-pray.angelus-04");
assert.equal(angelusOpeningArtworkSlot("regina",12,"2026-03-25"),"COV-pray.angelus_regina");

let browser;
const report={schema:"AO_R5C_BULK_APPROVED_ARTWORK_ACTUAL_PHONE_BINDINGS_V1",editorialSlots:267,photoClearedSlots:51,records:[]};
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},locale:language==="fr"?"fr-FR":"en-GB",
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const rootSel="#aoPray435930.open";
  async function go(route){
   const ok=await page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),route);
   assert.equal(ok,true,"Direct Prayer route failed: "+route);
  }
  async function check(slot,owner,opts={}){
   const cleared=resolvePrayerEditorialArtwork(slot);
   assert.equal(cleared.state,"PUBLISHED_EXACT_PHOTO",slot+" must be exact-photo-cleared");
   const image=page.locator(rootSel+" "+owner+' [data-ao-editorial-slot="'+slot+'"] img');
   await image.waitFor({state:"attached",timeout:12000});
   assert.equal(await image.count(),1,slot+" must appear exactly once in its intended reader");
   const state=await image.evaluate(async el=>{
    el.loading="eager";await el.decode();
    const rect=el.getBoundingClientRect(),parent=el.closest(".aoEditorialArtworkSlot");
    return {src:el.getAttribute("src"),naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,
     fit:getComputedStyle(el).objectFit,renderedWidth:rect.width,
     hasAttribution:!!parent?.querySelector("figcaption a[href^='https://']"),
     overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
   });
   assert.ok(state.src.endsWith(cleared.photo.image),slot+" rendered a different original");
   assert.ok(state.naturalWidth>=300&&state.naturalHeight>=300,slot+" did not decode");
   assert.equal(state.fit,"contain",slot+" cropped an original painting");
   assert.equal(state.hasAttribution,true,slot+" lost original artwork/source credit");
   assert.ok(state.overflow<=2,slot+" created phone horizontal overflow");
   if(opts.visible){assert.ok(state.renderedWidth>70&&state.renderedWidth<=width+1,slot+" image is not presented at this stage")}
   report.records.push({width,language,slot,owner,...state});
  }
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});

   // Source-owned Angelus cards must present three distinct exact editorial
   // moments without modifying a single versicle, response or Hail Mary.
   await go("pray.angelus");
   await page.locator(rootSel+" .aoP435930AngelusReader").waitFor({timeout:12000});
   assert.equal(await page.locator(rootSel+" .aoP435930PrayerUnit").count(),8,"Original Angelus units changed");
   // The source-owned Angelus picks dawn, noon or dusk from the local clock.
   // Validate its actual selected image BEFORE observing or moving the
   // prayer-card rail: progression intentionally dismisses the entry cover.
   const hourArt=page.locator(rootSel+' .aoClaudeHorariumPlate [data-ao-editorial-slot]');
   await hourArt.waitFor({state:"attached",timeout:12000});
   const hourSlot=await hourArt.getAttribute("data-ao-editorial-slot");
   assert.ok(["STG-pray.angelus-01","STG-pray.angelus-02","STG-pray.angelus-03"].includes(hourSlot),
    "Angelus hour cover is not one of the three exact approved paintings: "+hourSlot);
   await check(hourSlot,".aoClaudeHorariumPlate",{visible:true});
   for(const slot of ["STG-pray.angelus-05","STG-pray.angelus-06","STG-pray.angelus-07"])
    await check(slot,".aoP435930AngelusSequence");

   // Benediction public rite is not a devotional slide show. Its Exposition
   // photo belongs inside its original source text surface, before the words.
   await go("pray.benediction");
   await page.locator(rootSel+" .aoClaudeAltarScroll").waitFor({timeout:12000});
   assert.equal(await page.locator(rootSel+" [data-ao-altar-moment]").getAttribute("data-ao-altar-moment"),"exposition");
   await check("STG-pray.benediction-01",".aoClaudeAltarScroll",{visible:true});

   // St Joseph source prayers: original cover, historical Seven Sorrows,
   // and exactly approved seventh Temple scene.
   await go("pray.st_joseph_seven_sorrows");
   await check("COV-pray.st_joseph_seven_sorrows",".aoJosephSeven",{visible:true});
   await page.locator(rootSel+' [data-p435930-joseph-step="6"]').evaluate(x=>x.click());
   await check("STG-pray.st_joseph_seven_sorrows-07",".aoJosephSevenCard",{visible:true});
   assert.equal(await page.locator(rootSel+" [data-ao-joseph-canonical]").count(),3,"St Joseph canonical prayers altered");

   // The act of reparation belongs to stage three of Fr Mateo's NIGHT HOME
   // guide, never to a public Eucharistic blessing or another stage.
   await go("pray.adoration");
   await page.locator(rootSel+' [data-p435930-ador-mode="night"]').evaluate(x=>x.click());
   const night=rootSel+' [data-ao-adoration-mode="night"]';
   await page.locator(night).waitFor({timeout:12000});
   await page.locator(night+' .aoDevoSequenceTimeline [data-ao-devo-chapter="2"]').evaluate(x=>x.click());
   await page.waitForFunction(()=>document.querySelector('#aoPray435930.open [data-ao-adoration-mode="night"]')?.dataset.aoAdorationStep==="2",{timeout:10000});
   await check("STG-pray.adoration.night-03",'[data-ao-adoration-mode="night"]',{visible:true});

   for(const [route,owner,slot] of [
    ["programme.first_friday","first-friday","COV-programme.first_friday"],
    ["programme.first_saturday","first-saturday","COV-programme.first_saturday"]
   ]){
    await go(route);
    await check(slot,'[data-ao-programme-owner="'+owner+'"]',{visible:true});
   }

   // Real Novena reader: image belongs to Christmas day one, not an
   // invented decoration on day two or an extra prayer stage.
   await page.evaluate(async()=>globalThis.AO_MODULES?.open?.("pray.novenas",{returnContext:null}));
   await page.waitForFunction(()=>typeof globalThis.AO_NOVENAS_V3?.open==="function",null,{timeout:20000});
   assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.open({novenaId:"christmas",returnContext:null})),true,"Christmas Novena did not open");
   assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state()?.novenaId||globalThis.AO_NOVENAS_V3.state()?.id),"christmas","Christmas Novena changed owner");
   await page.locator(rootSel+" [data-n1-mode='guided']").evaluate(x=>x.click());
   await page.locator(rootSel+" [data-n1-begin]").evaluate(x=>x.click());
   await check("STG-novena.christmas-01",".aoN1Reader",{visible:true});
   assert.equal(await page.locator(rootSel+' [data-ao-novena-deck="guided"] .aoDevoCard').count(),1);
   assert.deepEqual(errors,[],"Uncaught browser errors: "+errors.join("; "));
   if(width===390)await page.screenshot({path:resolve(out,"reader-"+language+"-"+width+".png"),animations:"disabled"});
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
assert.equal(report.records.length,44,"Expected 11 exact-photo observations on each of four phone/locale combinations");
const verified=new Set(report.records.map(x=>x.slot));
assert.equal(verified.size,11,"Expected eleven distinct real reader positions in R5C");
report.inventory=Object.keys(PRAYER_ART_EDITORIAL_SLOTS_V1).map(id=>{
 const match=resolvePrayerEditorialArtwork(id);
 if(match.state!=="PUBLISHED_EXACT_PHOTO")return null;
 return {slot:id,kind:match.editorial.kind,label:match.editorial.label,
  artist:match.editorial.selected?.artist,title:match.editorial.selected?.title,
  originalSource:match.photo.source,localImage:match.photo.image,
  status:verified.has(id)?"R5C_VERIFIED_320_390_EN_FR":"PHOTO_CLEARED_NOT_TESTED_IN_R5C"};
}).filter(Boolean);
assert.equal(report.inventory.length,51,"Cleared-photo inventory count mismatch");
assert.equal(report.inventory.filter(x=>x.status==="R5C_VERIFIED_320_390_EN_FR").length,11);
report.statusCounts={r5cVerified:11,otherClearedNotRetestedInR5C:40,
 editorialPositionsNotPhotoCleared:267-51};
await writeFile(resolve(out,"report.json"),JSON.stringify(report,null,2)+"\n");
console.log("PASS: 51 exact-photo-cleared editorial positions retained; 11 real reader bindings × 320/390 × EN/FR = 44 complete phone/source/photo proofs");
