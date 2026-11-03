import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAY_SOURCE_SCOPE_NOTICES_20261103,praySourceScopeNotice20261103} from "../src/pray/source-scope-notices-20261103.js";
import {prayEditionWitness} from "../src/pray/prayer-edition-witnesses.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const evidence=resolve(root,"artifacts/pray-30-source-scope");
const ledger=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-source-scope-triage-30-20261103.v1.json"),"utf8"));
const inventory=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-source-certification-inventory.v3.json"),"utf8"));
const canon=PRAY_CANONICAL_DATA_V435930.prayers;
assert.equal(ledger.schema,"ao.pray.source-scope-triage-30.20261103.v1");
assert.equal(ledger.rows.length,30);
assert.equal(ledger.summary.unreviewedOriginalPrayers,30);
assert.equal(ledger.summary.publicSourceScopeAnchorChecks,8);
assert.equal(ledger.summary.stillWithoutNewComparison,22);
assert.equal(ledger.summary.fullOriginalPrintCertificates,0);
assert.equal(ledger.summary.originalPrayerBodiesEdited,0);
const pending=inventory.prayers.filter(x=>x.collation.status==="NOT_REVIEWED");
assert.deepEqual(ledger.rows.map(x=>x.id),pending.map(x=>x.id),"Audited 30 IDs must match original inventory exactly");
const checked=ledger.rows.filter(x=>x.verification==="PUBLIC_SOURCE_SCOPE_ANCHOR_CHECKED");
const held=ledger.rows.filter(x=>x.verification==="NO_NEW_SOURCE_COMPARISON");
assert.equal(checked.length,8);
assert.equal(held.length,22);
assert.deepEqual(Object.keys(PRAY_SOURCE_SCOPE_NOTICES_20261103).sort(),checked.map(x=>x.id).sort());
for(const row of ledger.rows){
 const inventoryRow=pending.find(x=>x.id===row.id);
 assert.ok(inventoryRow, "Not a canonical unreviewed prayer "+row.id);
 assert.equal(row.sourceInventoryStatus,"NOT_REVIEWED","Do not promote source-scope check into full text comparison");
 assert.equal(row.originalSourceUrl,inventoryRow.sourceUrl);
 assert.equal(row.sourceQualityLegacyClaim,inventoryRow.sourceQuality);
 assert.deepEqual(row.canonicalLanguagePresence,inventoryRow.languages);
 assert.equal(row.fullEnglishLineByLineCertified,false);
 assert.equal(row.fullFrenchLineByLineCertified,false);
 assert.equal(row.fullLatinLineByLineCertified,false);
 assert.equal(row.independentOriginalPrintedEditionCertified,false);
 assert.equal(row.originalPrayerTextEdited,false);
 const note=praySourceScopeNotice20261103(row.id);
 if(row.verification==="PUBLIC_SOURCE_SCOPE_ANCHOR_CHECKED"){
  assert.ok(note, row.id+" scope comparison omitted from reader");
  assert.equal(note.category,row.scopeCategory);
  assert.equal(note.sourceUrl,row.originalSourceUrl);
  assert.equal(note.fullEditionCertified,false);
  assert.deepEqual(note.notice,row.readerDisclosure);
  assert.ok(row.sourceScope.length>70);
  assert.ok(row.sourceAnchor?.length>8);
  assert.ok(row.appAnchor?.length>8);
  assert.ok(canon[row.id].en.toLowerCase().includes(row.appAnchor.toLowerCase()),
   row.id+" recorded app witness quote not in unchanged original English corpus");
  for(const lang of ["en","fr"])assert.ok(note.notice[lang].length>80,row.id+" missing "+lang+" source scope explanation");
 }else{
  assert.equal(note,null,row.id+" unverified entry was silently treated as reviewed");
  assert.equal(row.readerDisclosure,null);
  assert.equal(row.sourceAnchor,null);
 }
}
assert.equal(prayEditionWitness("litany_loreto_1962").edition,"LORETO_PRE_1980_FORM");
assert.notEqual(prayEditionWitness("litany_loreto_1962").url,
 ledger.rows.find(x=>x.id==="litany_loreto_1962").originalSourceUrl,
 "Unexpanded Litany must not use expanded online source as 1962 proof");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
const result={schema:"ao.pray.30-source-scope-eight-qualifications-phone.v1",
 originalUnreviewed:30,publicAnchorScopeChecks:8,stillAwaitingSourceComparison:22,
 fullOriginalPrintCertificates:0,phoneVariants:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",
   locale:ui==="fr"?"fr-FR":"en-GB",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&
    typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",
    null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",
    null,{timeout:25000});
   for(const row of checked){
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    const trigger=page.locator('#aoPray435930.open [data-p435930-lib-open="'+row.id+'"]');
    assert.equal(await trigger.count(),1,row.id+" source-owned Library entry missing");
    await trigger.evaluate(x=>x.click());
    await page.locator("#aoPray435930.open .aoP435930LibraryReader").waitFor({timeout:12000});
    const observed=await page.evaluate(id=>{
     const root=document.querySelector("#aoPray435930.open"),
       reader=root?.querySelector(".aoP435930LibraryReader"),
       sourceDrawers=[...root?.querySelectorAll(".aoP435930Source")||[]],
       notices=[...root?.querySelectorAll("[data-ao-prayer-source-scope]")||[]],
       audit=[...root?.querySelectorAll("[data-ao-prayer-source-review]")||[]];
     return {id,language:document.documentElement.lang,
      sourceDrawers:sourceDrawers.length,scopeNotices:notices.map(x=>({
       category:x.dataset.aoPrayerSourceScope,text:x.textContent.trim()
      })),
      auditStatus:audit.map(x=>x.dataset.aoPrayerSourceReview),
      sourceLinks:sourceDrawers.flatMap(x=>[...x.querySelectorAll("a[href]")].map(a=>a.href)),
      drawerOverflow:reader?Math.max(0,reader.scrollWidth-reader.clientWidth):null,
      documentOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      visibleContentChars:reader?.innerText.length||0};
    },row.id);
    assert.ok(observed.sourceDrawers>0,row.id+" source drawer missing");
    assert.equal(observed.scopeNotices.length,observed.sourceDrawers,
     row.id+" not every reader source panel shows the confirmed scope discrepancy");
    assert.ok(observed.visibleContentChars>=10,row.id+" body lost original prayer");
    assert.ok(observed.sourceLinks.some(x=>x.startsWith("https://")),row.id+" source links lost");
    assert.equal(observed.language,ui);
    assert.ok(observed.drawerOverflow<=2&&observed.documentOverflow<=2,
     row.id+" source note clips "+width+"px "+ui+": "+JSON.stringify(observed));
    for(const n of observed.scopeNotices){
     assert.equal(n.category,row.scopeCategory);
     assert.equal(n.text,row.readerDisclosure[ui],row.id+" unapproved source-note rewrite");
    }
    assert.ok(observed.auditStatus.every(x=>x==="NOT_REVIEWED"),
     row.id+" source anchor promoted to full review without a complete edition comparison");
    result.phoneVariants.push({width,language:ui,id:row.id,category:row.scopeCategory,
     sourceDrawers:observed.sourceDrawers,
     sourceScopeNotes:observed.scopeNotices.length,printEditionCertificate:false});
   }
   assert.deepEqual(errors,[],width+"px "+ui+" uncaught source drawer errors");
   console.log("PASS source-scoped comparisons "+width+"px "+ui+" · 8/8 canonical cards with bilingual historical edition/source notices");
  }catch(e){result.errors.push({width,ui,error:String(e?.stack||e)});throw e;}
  finally{await ctx.close()}
 }
 assert.equal(result.phoneVariants.length,32);
 assert.deepEqual(new Set(result.phoneVariants.map(x=>x.id)),new Set(checked.map(x=>x.id)));
 console.log("PASS 32/32 source-scope phone variants, 8 direct public source anchors, 22 unreviewed queue entries preserved, 0 full printed-edition certificates");
}finally{
 await mkdir(evidence,{recursive:true});
 await writeFile(resolve(evidence,"30-source-scope-eight-reviewed-32-phone-variants.json"),JSON.stringify(result,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
