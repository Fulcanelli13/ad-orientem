/**
 * Stage 8: exact rendered-source bodies across all four existing chaplet readers.
 * No source edits, new renderer, historical-edition certificate or deployment.
 * node tests/pray-work-stage8-four-chaplets-source-body-phone-20261107.mjs
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {FIVE_WOUNDS_CHAPLET_V1,fiveWoundsStep} from "../src/pray/five-wounds-chaplet.v1.js";
import {LITTLE_CROWN_B30_BEADS,littleCrownStep} from "../src/pray/little-crown-b30.js";
import {JOSEPH_SEVEN_PRAYERS_B24,JOSEPH_SEVEN_CLOSURE_B24,josephSevenStepAt} from "../src/pray/st-joseph-seven-sorrows-joys-b24.js";
import {PRECIOUS_BLOOD_MYSTERIES_V1,PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1 as BLOOD,preciousBloodPrayerAt} from "../src/pray/precious-blood-chaplet.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-work-stage8-four-chaplets");
await mkdir(output,{recursive:true});
const registry=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-work-identity-registry-20261106.v1.json"),"utf8"));
const ids=["pray.five_wounds","pray.little_crown","pray.st_joseph_seven_sorrows","pray.precious_blood"];
assert.ok(ids.every(id=>registry.works.some(w=>w.id===id)),"Four original reader routes require distinct work IDs");
assert.equal(FIVE_WOUNDS_CHAPLET_V1.length,30);
assert.equal(LITTLE_CROWN_B30_BEADS.length,15);
assert.equal(JOSEPH_SEVEN_PRAYERS_B24.length,7);
assert.deepEqual(PRECIOUS_BLOOD_MYSTERIES_V1.map(x=>x.pater),[5,5,5,5,5,5,3]);
assert.equal(DATA.stabat.length,13,"Stabat missing-end hold may not be silently lifted");
const normalize=s=>String(s??"").normalize("NFC").replace(/\s+/g,"");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const report={schema:"ao.pray.stage8-four-chaplets-rendered-source.v1",
 scope:"Four specialised reader engines; all 30 Five Wounds, 15 Little Crown, 8 Joseph positions and 49 Precious Blood positions in EN/FR at two phone widths, plus selected Latin checks. Compares actual DOM to source modules, not historical printed facsimiles.",
 widths:[320,390],uiLanguages:["en","fr"],contexts:[],counts:{},errors:[],
 holds:["Five Wounds historic indulgences and print image not recertified",
 "Little Crown French aspiration is separate ICKSP witness; Latin aspiration is John 1:14, not purported 1940 text",
 "Joseph's seven long original supplications remain English only, and the 1910 page image remains uncollated",
 "Precious Blood final prayer is historical English; all shared prayers reuse canonical data; short-form 35-vs-33 conflict remains held",
 "Stabat Mater canonical source is 13 tercets only; missing historical variant undecided"],
 publicationChanges:false,textMutations:false};
const mark=(route,kind)=>{report.counts[route]??={};report.counts[route][kind]=(report.counts[route][kind]||0)+1;};
const textAt=async(page,selector)=>{
 const el=page.locator(selector).first();
 assert.equal(await el.count(),1,"Source body node missing: "+selector);
 return await el.evaluate(n=>({lang:n.getAttribute("lang"),text:n.textContent||""}));
};
function checkSource(actual,expected,language,tag){
 assert.equal(actual.lang,language,tag+" language label mismatch");
 assert.equal(normalize(actual.text),normalize(expected),tag+" visible text differs from owner");
}
async function clickIf(page,selector){
 const el=page.locator(selector).first();
 assert.equal(await el.count(),1,"Missing original reader control "+selector);
 await el.evaluate(n=>n.click());
}
async function pickLang(page,base,kind,code){
 const option=base+'[data-p435930-'+kind+'-language="'+code+'"]';
 return clickIf(page,(await page.locator(option).count())?option:base+'[data-p435930-'+kind+'-latin]');
}
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",
   serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),pageErrors=[];
  page.on("pageerror",e=>pageErrors.push(String(e.message||e)));
  const surface="#aoPray435930.open ";
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true && typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const open=async route=>assert.equal(await page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),route),true,route+" open");

   // Five Wounds: all five repetitions and concluding Ave per wound.
   await open("pray.five_wounds");
   const five=surface+"[data-ao-five-wounds-reader] ";
   for(let i=0;i<30;i++){
    const actual=await textAt(page,five+".aoFiveWoundsPrayerText");
    checkSource(actual,fiveWoundsStep(i,ui).text,ui,"Five Wounds "+i);
    mark("pray.five_wounds","canonicalBeads");
    if(i===0){
     await pickLang(page,five,"five","la");
     const latin=await textAt(page,five+".aoFiveWoundsPrayerText");
     checkSource(latin,fiveWoundsStep(i,"la").text,"la","Five Wounds Latin");
     mark("pray.five_wounds","latinWitness");
     await pickLang(page,five,"five",ui);
    }
    if(i<29)await clickIf(page,five+"[data-p435930-five-next]");
   }
   assert.equal(await page.locator(five+"[data-p435930-five-finish]").count(),1);

   // Little Crown: every aspiration and every canonical prayer, no added meditations.
   await open("pray.little_crown");
   const crown=surface+"[data-ao-little-crown-reader] ";
   for(let i=0;i<15;i++){
    const source=littleCrownStep(i,ui);
    checkSource(await textAt(page,crown+".aoLittleCrownAspiration"),source.aspiration,ui,"Little Crown aspiration "+i);
    checkSource(await textAt(page,crown+".aoLittleCrownPrayerText"),source.prayerText,ui,"Little Crown prayer "+i);
    mark("pray.little_crown","aspiration");mark("pray.little_crown","canonicalBeads");
    if(i===0){
     await pickLang(page,crown,"crown","la");
     const la=littleCrownStep(0,"la");
     checkSource(await textAt(page,crown+".aoLittleCrownAspiration"),la.aspiration,"la","Little Crown Latin aspiration");
     checkSource(await textAt(page,crown+".aoLittleCrownPrayerText"),la.prayerText,"la","Little Crown Latin canonical");
     mark("pray.little_crown","latinAspiration");mark("pray.little_crown","latinCanonical");
     await pickLang(page,crown,"crown",ui);
    }
    if(i<14)await clickIf(page,crown+"[data-p435930-crown-next]");
   }
   assert.equal(await page.locator(crown+"[data-p435930-crown-finish]").count(),1);

   // Joseph: all seven historical English paragraphs and their *actual*
   // three canonical EN/FR repeated prayers, followed by closure.
   await open("pray.st_joseph_seven_sorrows");
   const joseph=surface+"[data-ao-st-joseph-seven-reader] ";
   for(let i=0;i<7;i++){
    const src=josephSevenStepAt(i,DATA.prayers);
    checkSource(await textAt(page,joseph+".aoJosephSevenOriginal"),src.prayer.sourceTextEn,"en","Joseph original "+i);
    mark("pray.st_joseph_seven_sorrows","historicalSupplications");
    for(const prayer of src.repetitions){
     const a=await textAt(page,joseph+'[data-ao-joseph-canonical="'+prayer.id+'"] p');
     checkSource(a,prayer[ui],ui,"Joseph canonical "+i+"/"+prayer.id);
     mark("pray.st_joseph_seven_sorrows","canonicalRepetitions");
    }
    if(i===0){
     await clickIf(page,joseph+"[data-p435930-joseph-latin]");
     for(const prayer of src.repetitions){
      const a=await textAt(page,joseph+'[data-ao-joseph-canonical="'+prayer.id+'"] p');
      checkSource(a,prayer.la,"la","Joseph Latin "+prayer.id);
      mark("pray.st_joseph_seven_sorrows","latinCanonical");
     }
     await clickIf(page,joseph+"[data-p435930-joseph-latin]");
    }
    await clickIf(page,joseph+"[data-p435930-joseph-next]");
   }
   const closure=await page.locator(joseph+".aoJosephSevenOriginal").allTextContents();
   assert.equal(closure.length,3,"Joseph final requires complete antiphon/versicle/collect blocks");
   assert.ok(normalize(closure[0]).includes(normalize(JOSEPH_SEVEN_CLOSURE_B24.antiphon)));
   mark("pray.st_joseph_seven_sorrows","closingAntiphon");
   assert.ok(normalize(closure[1]).includes(normalize(JOSEPH_SEVEN_CLOSURE_B24.versicle)));
   mark("pray.st_joseph_seven_sorrows","closingVersicle");
   assert.ok(normalize(closure[1]).includes(normalize(JOSEPH_SEVEN_CLOSURE_B24.response)));
   mark("pray.st_joseph_seven_sorrows","closingResponse");
   assert.ok(normalize(closure[2]).includes(normalize(JOSEPH_SEVEN_CLOSURE_B24.collect)));
   mark("pray.st_joseph_seven_sorrows","closingCollect");

   // Precious Blood: source-exact opening, 33 Our Fathers, 7 Glorias and
   // seven historical responses; English final prayer remains English.
   await open("pray.precious_blood");
   const blood=surface+"[data-ao-precious-blood-reader] ";
   const opener=await page.locator(blood+".aoPreciousBloodCard p").all();
   assert.equal(opener.length,3,"Precious Blood opening must show V/R and Gloria");
   const ov=ui==="fr"?BLOOD.opening.la:BLOOD.opening.en;
   const oLang=ui==="fr"?"la":"en";
   for(let j=0;j<2;j++){
    const o=await opener[j].evaluate(n=>({lang:n.lang,text:n.textContent||""}));
    assert.equal(o.lang,oLang);
    assert.ok(normalize(o.text).includes(normalize(ov[j])));
    mark("pray.precious_blood","openingVersicles");
   }
   checkSource(await opener[2].evaluate(n=>({lang:n.lang,text:n.textContent||""})),DATA.prayers.foundations_glory_be[ui],ui,"Blood opening Gloria");
   mark("pray.precious_blood","openingGloria");

   for(let k=0;k<7;k++){
    const mystery=PRECIOUS_BLOOD_MYSTERIES_V1[k];
    await clickIf(page,blood+'[data-p435930-blood-mystery="'+k+'"]');
    for(let pos=0;pos<=mystery.pater+1;pos++){
     const p=preciousBloodPrayerAt(k,pos,ui);
     checkSource(await textAt(page,blood+".aoPreciousBloodCard > p"),p.text,p.language,"Precious Blood "+k+"/"+pos);
     mark("pray.precious_blood","mysteryPrayers");
     if(k===0&&pos===0){
      await pickLang(page,blood,"blood","la");
      const latin=preciousBloodPrayerAt(k,pos,"la");
      checkSource(await textAt(page,blood+".aoPreciousBloodCard > p"),latin.text,latin.language,"Precious Blood Latin canonical");
      mark("pray.precious_blood","latinCanonical");
      await pickLang(page,blood,"blood",ui);
     }
     if(pos<mystery.pater+1)await clickIf(page,blood+"[data-p435930-blood-next]");
    }
   }
   await clickIf(page,blood+"[data-p435930-blood-next]");
   const closing=await page.locator(blood+".aoPreciousBloodClosing > p").all();
   assert.equal(closing.length,4,"Blood finale: English closing, versicle, response, collect");
   const finalTexts=[BLOOD.closingBloodPrayerEn,...(ui==="fr"?BLOOD.finalVersicle.la:BLOOD.finalVersicle.en),ui==="fr"?BLOOD.collect.la:BLOOD.collect.en];
   const langs=["en",ui==="fr"?"la":"en",ui==="fr"?"la":"en",ui==="fr"?"la":"en"];
   for(let j=0;j<4;j++){
    const actual=await closing[j].evaluate(n=>({lang:n.lang,text:n.textContent||""}));
    assert.equal(actual.lang,langs[j]);
    assert.ok(normalize(actual.text).includes(normalize(finalTexts[j])),"Blood final text missing "+j);
    mark("pray.precious_blood","closingComponents");
   }
   assert.equal(await page.locator(blood+"[data-p435930-blood-finish]").count(),1);
   assert.deepEqual(pageErrors,[], "Browser errors "+width+"/"+ui);
   report.contexts.push({width,ui,passed:true});
   console.log("PASS Stage8 four chaplets "+width+" "+ui+"; source-matched all bead / closure positions");
  }catch(e){report.errors.push({width,ui,message:String(e.stack||e)});throw e}
  finally{await ctx.close()}
 }
 assert.equal(report.errors.length,0);
 const totals=Object.fromEntries(Object.entries(report.counts).map(([k,v])=>[k,Object.values(v).reduce((a,b)=>a+b,0)]));
 assert.deepEqual(totals,{"pray.five_wounds":124,"pray.little_crown":128,
  "pray.st_joseph_seven_sorrows":140,"pray.precious_blood":220});
 report.totalExactDomSourceChecks=Object.values(totals).reduce((a,b)=>a+b,0);
 assert.equal(report.totalExactDomSourceChecks,612);
 console.log("PASS Stage8 "+report.totalExactDomSourceChecks+" source/translation DOM comparisons across four chaplet readers; four 320/390 EN/FR contexts; edition and Stabat holds retained.");
}finally{
 await writeFile(resolve(output,"four-chaplets-source-body.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
