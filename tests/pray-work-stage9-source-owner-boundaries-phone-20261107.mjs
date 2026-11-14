/**
 * Stage 9 — actual Seven Words source-body + penitential & litany boundary
 * checks, and Lasance source-store (not public-reader) acceptance.
 * Does not copy Scripture text, remotely fetch historic litany editions,
 * or promote stage-only witnesses to an accessible Prayer catalogue.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {SEVEN_WORDS_LOCAL_EN_1889_V1 as WORDS,sevenWordsLocalWitnessText} from "../src/pray/seven-words-offline-1889.v1.js";
import {parseSevenWordsHistoricalWitness} from "../src/pray/seven-words-witness.v1.js";
import {PENITENTIAL_PSALMS_VULGATE as PSALMS,penitentialPsalmReference,PENITENTIAL_PSALMS_TEXT_STATUS} from "../src/pray/penitential-psalms-source.js";
import {LITANY_SOURCE_WITNESSES as LITANY,LITANY_WITNESS_REVIEW_V1,extractLitanyProper,reviewLitanyTranscription} from "../src/pray/litany-source.js";
import {PRAYER_ACQUISITION_WITNESSES_V1 as LASANCE,prayerAcquisitionCandidates} from "../src/pray/prayer-acquisition-historical-witnesses.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-work-stage9-source-boundaries");
await mkdir(output,{recursive:true});
const reg=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-work-identity-registry-20261106.v1.json"),"utf8"));
const works=new Map(reg.works.map(w=>[w.id,w]));
for(const id of ["pray.seven_words","pray.penitential_psalms","pray.litany_saints",
 "ignatius_suscipe_lasance_1908_en","lasance_prayer_before_meditation_1908_en",
 "thomas_aquinas_concede_mihi_lasance_1908_en","lasance_prayer_after_meditation_1908_en"]){
 assert.ok(works.has(id),"Stage 9 missing source owner "+id);
}
const parsed=parseSevenWordsHistoricalWitness(sevenWordsLocalWitnessText());
assert.equal(parsed.sections.length,7);
assert.equal(parsed.opening,WORDS.opening);
assert.equal(parsed.appendix,WORDS.appendixTitle+"\n\n"+WORDS.appendix);
for(let i=0;i<7;i++){
 assert.equal(parsed.sections[i].text,
  [WORDS.words[i].utterance,WORDS.commonVersicles,WORDS.words[i].meditation,WORDS.words[i].after].join("\n\n"));
}
assert.deepEqual(PSALMS.map(x=>x.trad),[6,31,37,50,101,129,142]);
assert.deepEqual(PSALMS.map(p=>penitentialPsalmReference(p)),
 ["Psalms 6:1","Psalms 31:1","Psalms 37:1","Psalms 50:1","Psalms 101:1","Psalms 129:1","Psalms 142:1"]);
assert.match(PENITENTIAL_PSALMS_TEXT_STATUS.offline,/verified warm-cache/);
assert.match(PENITENTIAL_PSALMS_TEXT_STATUS.verification,/No full seven-psalm/);
assert.notEqual(LITANY.en.title,LITANY.fr.title);
assert.notEqual(LITANY_WITNESS_REVIEW_V1.en.edition,LITANY_WITNESS_REVIEW_V1.fr.edition);
for(const l of ["en","fr"])assert.equal(reviewLitanyTranscription("",l).canCertify1962,false);
assert.ok(reviewLitanyTranscription("Saint Jean, riez pour nous.", "fr").suspectedReadings.length>0);
assert.throws(()=>extractLitanyProper("Lord, have mercy on us\nHoly Mary, pray for us.","en"),/Litany ending not found/);
assert.equal(LASANCE.length,6,"Six per-language historical acquisition witnesses required");
assert.deepEqual(LASANCE.map(x=>x.language).sort(),["en","en","en","en","la","la"]);
for(const w of LASANCE){
 assert.ok(w.text.length>120,w.id+" incomplete source text");
 assert.equal(w.release.translation_status.fr,"NOT_AVAILABLE",w.id+" invented historical French");
 assert.equal(w.release.exact_print_verified,true,w.id+" source print unverified");
 assert.equal(w.release.allowed_in_prayer_hub,true);
 assert.ok(w.source.scanPageUrl.includes("/Page:") || w.source.scanPageUrl.includes("/wiki/Page:"));
 assert.ok(prayerAcquisitionCandidates(w.purpose,{language:w.language}).some(x=>x.id===w.id));
 assert.ok(!prayerAcquisitionCandidates(w.purpose,{language:"fr"}).some(x=>x.id===w.id));
}
const norm=s=>String(s??"").normalize("NFC").replace(/\s+/g,"");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const report={schema:"ao.pray.stage9.source-owner-boundaries.v1",
 scope:"Complete locally packaged 1889 Seven Words historical body, 7+opening+appendix in actual browsers; penitential seven traditional references only, and actual offline Litany refusal. Lasance tests operate on source-store, NOT a displayed reader. No full Psalm or litany verse edition certification.",
 historicalSevenWords:{renderedBodyMatches:0,openingMatches:0,appendixMatches:0},
 penitential:{sevenTraditionalRefPositions:0,canonicalTextBodiesCertified:0},
 litany:{sourceSeparationRules:2,offlineErrorSurfaces:0,printedEditionCertified:false},
 lasance:{historicalWitnesses:LASANCE.length,liveReaderBodyCertificates:0},
 contexts:[],errors:[],pageErrors:[],publicationChanges:false,prayerTextChanges:false,
 expectedWorksCertified:["pray.seven_words"],
 excludedFromReaderCertification:["pray.penitential_psalms","pray.litany_saints",
 "ignatius_suscipe_lasance_1908_en","lasance_prayer_before_meditation_1908_en",
 "thomas_aquinas_concede_mihi_lasance_1908_en","lasance_prayer_after_meditation_1908_en"]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  try{
   // External sources are intentionally unavailable; the Seven Words proper
   // is packaged locally and must NOT depend on Wikisource or a network Bible.
   await page.route(/^https?:\/\/(en|fr)\.wikisource\.org\//,route=>route.abort());
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const open=async id=>assert.equal(await page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),id),true,id+" direct owner route failed");
   const scope="#aoPray435930.open ";
   await open("pray.seven_words");
   const words=scope+'[data-ao-devotional-owner="sevenWords"] ';
   await page.waitForSelector(words+".aoP435930HistoricalFocus .aoP435930WitnessParagraph",{timeout:15000});
   for(let i=0;i<7;i++){
    if(i>0){
     const btn=page.locator(words+'[data-ao-devo-chapter="'+i+'"]');
     assert.equal(await btn.count(),1,"Seven Words lost native chapter navigation "+i);
     await btn.evaluate(el=>el.click());
     await page.waitForSelector(scope+'[data-ao-devo-card="word-'+(i+1)+'"]',{timeout:10000});
    }
    const text=await page.locator(words+".aoP435930HistoricalFocus > .aoP435930Text").evaluate(node=>({
     lang:node.getAttribute("lang"),text:[...node.querySelectorAll(".aoP435930WitnessParagraph")].map(x=>x.textContent).join("\n\n")
    }));
    assert.equal(text.lang,"en","French reader falsely claims translated 1889 source "+i);
    assert.equal(norm(text.text),norm(parsed.sections[i].text),"1889 historical Word "+(i+1)+" mismatch");
    report.historicalSevenWords.renderedBodyMatches++;
    if(i===0){
     const op=await page.locator(words+"[data-ao-seven-words-original-opening]").evaluate(node=>({
      lang:node.getAttribute("lang"),text:[...node.querySelectorAll(".aoP435930WitnessParagraph")].map(x=>x.textContent).join("\n\n")
     }));
     assert.equal(op.lang,"en");
     assert.equal(norm(op.text),norm(WORDS.opening),"1889 opening truncated");
     report.historicalSevenWords.openingMatches++;
    }
    if(i===6){
     const end=page.locator(words+".aoP435930SevenClosing .aoP435930Text");
     assert.equal(await end.count(),1,"Marian appendix missing or incorrectly folded into Seventh Word");
     const got=await end.evaluate(el=>el.textContent);
     assert.equal(norm(got),norm(parsed.appendix),"Historical Marian appendix incomplete");
     report.historicalSevenWords.appendixMatches++;
    }
   }
   // Seven Penitential Psalms: prove only the seven Vulgate-numbered source
   // references and fallback, never claim the resolved Scripture full verses.
   await open("pray.penitential_psalms");
   const penit=scope+'[data-ao-devotional-owner="penitential"] ';
   for(let i=0;i<7;i++){
    const link=page.locator(penit+'[data-ao-devo-chapter="'+i+'"]');
    assert.equal(await link.count(),1,"Penitential chapter navigation "+i);
    await link.evaluate(el=>el.click());
    await page.waitForSelector(scope+'[data-ao-devo-card="penitential-'+i+'"]',{timeout:10000});
    const title=await page.locator(penit+".aoP435930GuidedScripture").count();
    assert.equal(title,1,"Penitential Scripture content owner lost "+i);
    const expected=PSALMS[i],visible=await page.locator(penit+".aoDevoCardTitle").innerText();
    assert.ok(visible.includes("Psalm "+expected.trad),"Vulgate-numbered Psalm "+expected.trad+" lost");
    report.penitential.sevenTraditionalRefPositions++;
   }
   // The source-bounded Litany cannot silently fabricate an unavailable
   // historical witness. Both original historical source URLs remain distinct.
   await open("pray.litany_saints");
   await page.waitForSelector(scope+"[data-p435930-lit-retry]",{timeout:20000});
   assert.equal(await page.locator(scope+"[data-ao-private-litany-invocations]").count(),0);
   const cite=await page.locator(scope+" .aoP435930Source").last().evaluate(el=>el.textContent||"");
   assert.ok(cite.includes(ui==="fr"?"1862":"1883"),"Historically distinct Litany edition notice missing");
   report.litany.offlineErrorSurfaces++;
   report.pageErrors.push(...errors.map(message=>({width,ui,message})));
   assert.deepEqual(errors,[],"Browser page errors "+width+"/"+ui);
   report.contexts.push({width,ui,passed:true});
   console.log("PASS Stage9 source boundaries at "+width+"px "+ui+": Seven Words original 7 + opening/appendix, 7 traditional Psalm positions, historical Litany refusal");
  }catch(e){report.errors.push({width,ui,message:String(e.stack||e)});throw e}
  finally{await ctx.close()}
 }
 assert.equal(report.historicalSevenWords.renderedBodyMatches,28);
 assert.equal(report.historicalSevenWords.openingMatches,4);
 assert.equal(report.historicalSevenWords.appendixMatches,4);
 assert.equal(report.penitential.sevenTraditionalRefPositions,28);
 assert.equal(report.litany.offlineErrorSurfaces,4);
 assert.deepEqual(report.errors,[]);
 console.log("PASS Stage 9: 36/36 Seven Words original rendered source bodies, 28/28 penitential reference positions, 4/4 fail-closed Litany offline presentations, 6 Lasance source-store witnesses only.");
}finally{
 await writeFile(resolve(output,"stage9-source-owner-boundaries.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
