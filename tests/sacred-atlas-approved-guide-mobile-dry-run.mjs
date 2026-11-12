// Browser-only release rehearsal. It injects a synthetic approved-only bank
// for three exact-revision research drafts, never writing approval or public data.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {reviewedSacredGuideForReader,sacredGuideRevision}
 from "../src/find/sacred-guide-review-release.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/sacred-atlas-approved-guide-dry-run");
await mkdir(out,{recursive:true});
const read=async p=>JSON.parse(await readFile(resolve(root,p),"utf8"));
const [w1,w2,shrines,canonical,extra,media,approvedBank,decisions]=await Promise.all([
 read("data/shrines/research/sacred-atlas-wave1-guides44-56-20261105.v1.json"),
 read("data/shrines/research/sacred-atlas-wave2-guides57-66-20261110.v1.json"),
 read("data/shrines/shrines-pilgrimages-seed.v1.json"),
 read("data/shrines/source-registry.v1.json"),
 read("data/shrines/research/sacred-atlas-institutional-source-supplement-20261111.v1.json"),
 read("data/geography/approved-place-media.v1.json"),
 read("data/shrines/illustrated-place-guides-reviewed-bilingual.v1.json"),
 read("data/shrines/research/sacred-atlas-bilingual-guide-editorial-decisions.v1.json")
]);
assert.equal(approvedBank.guides.length,0,"No real approved guide may be present for the dry run");
assert.equal(decisions.reviews.length,0,"The real editorial decision list must remain empty");
assert.equal(decisions.owner_batch_authorization,null,"No owner authorization may be invented");
const sourceRows=[...canonical.sources,...extra.sources];
const byShrine=new Map(shrines.shrines.map(x=>[x.place_id,x]));
const byPhoto=new Map(media.items.map(x=>[x.place_id,x]));
const input=[w2.guides.find(g=>g.draft_order===57),w2.guides.find(g=>g.draft_order===66),
 w1.guides.find(g=>g.draft_order===49)];
assert.ok(input.every(Boolean));
assert.equal(byPhoto.has(input[0].place_id),true,"Kevelaer must exercise approved photo");
assert.equal(byPhoto.has(input[1].place_id),false,"Penrose Park must exercise fallback without a borrowed image");
const fakeGuide=(guide)=>{
 const review={
  place_id:guide.place_id,revision:sacredGuideRevision(guide),
  decision:"APPROVED_FOR_PUBLICATION",source_to_claim_checked:true,
  english_reviewed:true,french_reviewed:true,ecclesial_identity_checked:true,
  owner_release_authorized:true,editor:"SYNTHETIC_BROWSER_FIXTURE_NOT_REAL_APPROVAL",
  reviewed_on:"2026-11-12",
  official_url:guide.bibliography_urls.find(s=>/^https:\/\//.test(s)),
  region_en:"Synthetic phone test",region_fr:"Test mobile fictif",
  paragraph_evidence:guide.sections.flatMap(s=>s.paragraphs.map((p,i)=>({
   key:s.id+":"+i,checked:true,source_url:p.source_url,
   editor_note:"SYNTHETIC_BROWSER_TEST_NOT_HISTORICAL_CERTIFICATION"
  })))
 };
 const output=reviewedSacredGuideForReader(guide,byShrine.get(guide.place_id),sourceRows,review);
 assert.ok(output,guide.place_id+" failed synthetic exact-revision conversion");
 assert.equal(output.image_policy,"USE_APPROVED_PLACE_MEDIA_ONLY");
 assert.deepEqual(output.gallery,[],"Never auto-promote research images");
 return output;
};
const mock={schema:"AO_ILLUSTRATED_PLACE_GUIDES_V1",guides:input.map(fakeGuide)};
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",
 ".woff2":"font/woff2",".png":"image/png",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",done)});
const origin="http://127.0.0.1:"+server.address().port;
let browser,served=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  for(const lang of ["en","fr"]){
   const context=await browser.newContext({viewport:{width,height:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:1,
    locale:lang==="fr"?"fr-FR":"en-GB"});
   await context.route("**/data/shrines/illustrated-place-guides-reviewed-bilingual.v1.json",async route=>{
    served++;
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(mock)});
   });
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:65000});
   const entry=page.locator('[data-ao-app-surface="find"]');
   await entry.waitFor({state:"visible",timeout:30000});
   await entry.click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().open===true
    &&globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
    &&Boolean(document.querySelector("#ao-find-modular-root .aoHeritageSurface")),
    null,{timeout:60000});
   const chosen=await page.evaluate(v=>{
    globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:v});
    return globalThis.AO_RUNTIME_V8.store.getState().language;
   },lang);
   assert.equal(chosen,lang);
   for(const guide of input){
    const open=await page.evaluate(async id=>globalThis.AO_FIND_APP_V1.open({lens:"heritage",placeId:id}),guide.place_id);
    assert.equal(open,true,guide.place_id+" cannot enter heritage");
    const preview=page.locator('#ao-find-modular-root .aoHeritagePreview[data-explore-place-owner="'+guide.place_id+'"]');
    await preview.waitFor({state:"visible",timeout:15000});
    await preview.locator("[data-explore-expand-place]").click();
    const sheet=page.locator('#ao-find-modular-root .aoExplorePlaceSheet[data-explore-place-owner="'+guide.place_id+'"]');
    await sheet.waitFor({state:"visible",timeout:15000});
    const full=sheet.locator(".aoExploreIllustratedGuide");
    assert.equal(await full.count(),1,guide.place_id+" mock approved-only guide did not render");
    const content=await full.innerText();
    const expected=guide.sections[0].paragraphs[0][lang].slice(0,35);
    assert.ok(content.includes(expected),guide.place_id+" wrong "+lang+" content in approved guide");
    assert.ok(await full.locator(".aoExploreStoryEvidence a[href^='https://']").count()>=3,
     guide.place_id+" needs three historical citations in the full guide");
    const image=sheet.locator(".aoExplorePlaceMedia img");
    if(byPhoto.has(guide.place_id)){
     await image.waitFor({state:"visible",timeout:15000});
     await page.waitForFunction(id=>{
      const node=document.querySelector('#ao-find-modular-root .aoExplorePlaceSheet[data-explore-place-owner="'+id+'"] .aoExplorePlaceMedia img');
      return !!node?.complete&&node.naturalWidth>0;
     },guide.place_id,{timeout:15000});
     assert.equal(await image.getAttribute("src"),byPhoto.get(guide.place_id).asset_path,
      "Only the Place-approved cover may appear");
    }else assert.equal(await image.count(),0,"A site with no approved photo must not borrow one");
    const overflow=await sheet.evaluate(el=>{
     const box=el.getBoundingClientRect();
     const rail=el.querySelector(".aoExplorePlaceChapters");
     const railCanScroll=!!rail&&rail.scrollWidth>rail.clientWidth+2
      &&["auto","scroll"].includes(getComputedStyle(rail).overflowX);
     const offenders=[...el.querySelectorAll("*")].filter(child=>{
      const rect=child.getBoundingClientRect();
      return (rect.left<box.left-2||rect.right>box.right+2)&&!(railCanScroll&&rail.contains(child));
     }).slice(0,8).map(n=>({tag:n.tagName,className:String(n.className).slice(0,65)}));
     return {offenders,documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    assert.ok(!overflow.offenders.length&&overflow.documentOverflow<=2,
     width+"px overflow on "+guide.place_id+" "+JSON.stringify(overflow));
    const filename=width+"-"+lang+"-"+guide.draft_order+".png";
    await page.screenshot({path:resolve(out,filename),fullPage:false});
   }
   assert.deepEqual(errors,[],width+"px "+lang+" browser errors");
   await context.close();
  }
 }
 assert.equal(served,4,"The synthetic bank should be loaded once per language/viewport");
 console.log("PASS Sacred Atlas APPROVED-ONLY SYNTHETIC PHONE DRY RUN: "+
  "3 exact-revision guides × EN/FR × 320/390px; approved photo and no-photo fallback; no release flags changed.");
}finally{
 if(browser)await browser.close();
 await new Promise(done=>server.close(done));
}
