// Real Prayer Confession acceptance: 3 source-owned paths × EN/FR × 320/390.
// Read-only QA. No recording of sin answers, no absolution simulation,
// no production mutations, no editor/witness text reinterpretation.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {CONFESSION_PATHS,confessionRiteCards,confessionAfterCards} from "../src/pray/confession-paths.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(process.env.RUNNER_TEMP||"/tmp","confession-enfr-all-paths-phone");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  return res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);return res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const base="http://127.0.0.1:"+server.address().port;
const cases={regular:{examCards:5,questions:20},returning:{examCards:13,questions:70},general:{examCards:14,questions:70}};
assert.deepEqual(Object.keys(CONFESSION_PATHS),Object.keys(cases));
const ids=Object.keys(cases);
const afterIds=confessionAfterCards().map(x=>x.id);
assert.deepEqual(afterIds,["thanksgiving","satisfaction","amendment"]);
const report={schema:"AO_CONFESSION_12_CONTEXT_MOBILE_ACCEPTANCE_V1",
 contexts:[],screenshots:[],errors:[],
 scope:"ACTUAL_SOURCE_OWNED_READER_NOT_HISTORICAL_TEXT_CERTIFICATION",
 publishing:"NONE",userSinInputOrStorage:"NONE"};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const lang of ["en","fr"])for(const path of ids){
  const height=width===320?720:844;
  const context=await browser.newContext({
    viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true,
    reducedMotion:"reduce",serviceWorkers:"block",locale:lang==="fr"?"fr-FR":"en-GB"
  });
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const sel="#aoPray435930.open .aoP435930ConfessionReader",timeline=sel+" .aoDevoSequenceTimeline";
  const data={path,lang,width,height,examCards:0,questions:0,riteCards:[],afterCards:[],sensitiveControls:0,overflowMax:0};
  const check=async(label)=>{
   const result=await page.evaluate(()=>{
    const reader=document.querySelector("#aoPray435930.open .aoP435930ConfessionReader");
    return {overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
     unsafe:reader?.querySelectorAll("input,textarea,[contenteditable=true],audio,video").length??-1,
     stage:Number(reader?.dataset.aoConfessionSection),card:reader?.querySelector("[data-ao-devo-card]")?.getAttribute("data-ao-devo-card")||null};
   });
   assert.ok(result.overflow<=2,lang+"/"+width+"/"+path+" horizontal overflow at "+label+": "+JSON.stringify(result));
   assert.equal(result.unsafe,0,"Private Confession must never collect inputs, audio or video at "+label);
   data.overflowMax=Math.max(data.overflowMax,result.overflow);
   return result;
  };
  const shot=async(kind)=>{
    const name=path+"-"+lang+"-"+width+"-"+kind+".png";
    await page.screenshot({path:join(out,name),animations:"disabled"});
    report.screenshots.push(name);
  };
  try{
   await page.goto(base+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null})),true);
   const locale=page.locator("#aoPray435930.open .aoP435930SessionLanguage");
   if(lang==="fr")await locale.click();
   assert.equal((await locale.innerText()).trim(),lang.toUpperCase());
   assert.equal(await page.locator(sel+" [data-p435930-conf-path]").count(),3);
   assert.equal(await page.locator(sel+" [data-p435930-since]").count(),0);
   await check("preparation");
   await page.locator(sel+' [data-p435930-conf-path="'+path+'"]').click();
   await page.locator(sel+" [data-p435930-conf-next]").click();
   await page.locator(timeline+" [data-ao-devo-chapter='0']").waitFor({timeout:16000});
   assert.equal(await page.locator(timeline+" [data-ao-devo-chapter]").count(),cases[path].examCards);
   data.examCards=cases[path].examCards;
   // Continuous reading: all inherited prompts must be visible without any
   // checkbox, tally, answer field or hidden rewording of the original set.
   await page.locator(sel+" [data-p435930-conf-reading='continuous']").click();
   const reading=page.locator(sel+" [data-ao-confession-continuous='true']");
   await reading.waitFor();
   assert.equal(await reading.locator("[data-ao-confession-source-card]").count(),cases[path].examCards);
   data.questions=await reading.locator(".aoConfessionContinuousQuestions li").count();
   assert.equal(data.questions,cases[path].questions,path+" missing original or extension prompts");
   assert.equal(await page.locator(sel+" .aoDevoCard").count(),0);
   await check("all examination questions");
   await shot("examination-continuous");
   // Switch back to precisely the current source-owned card method. Last
   // examination card is the only permissible transition to the pre-entry guide.
   await page.locator(sel+" [data-p435930-conf-reading='cards']").click();
   const last=cases[path].examCards-1;
   await page.locator(timeline+' [data-ao-devo-chapter="'+last+'"]').click();
   assert.equal(await page.locator(sel+" [data-ao-devo-card='ready']").count(),1);
   await page.locator(sel+" [data-p435930-conf-next]").click();
   const expectedRite=confessionRiteCards(path);
   assert.equal(expectedRite.length,9);
   await page.locator(timeline+" [data-ao-devo-chapter='0']").waitFor();
   assert.equal(await page.locator(timeline+" [data-ao-devo-chapter]").count(),9);
   for(let i=0;i<9;i++){
    await page.locator(timeline+' [data-ao-devo-chapter="'+i+'"]').click();
    const card=page.locator(sel+" [data-ao-devo-card]");
    const id=await card.getAttribute("data-ao-devo-card");
    assert.equal(id,expectedRite[i].id,"Rite card order drift");
    assert.ok((await card.innerText()).length>70,"Short or missing bilingual rite guidance "+id);
    const priestLatin=await page.locator(sel+" [data-ao-confession-latin-excerpt='priest-only']").count();
    assert.equal(priestLatin,id==="priest-absolution"?1:0,
      "Priest's Latin absolution must not be a lay rehearsal");
    const act=await page.locator(sel+" [data-ao-confession-act]").count();
    assert.equal(act,id==="contrition-penance"?1:0,
      "The Act of Contrition must occur on its actual pre-entry step");
    await check("rite "+id);
    data.riteCards.push(id);
    if([0,6,7].includes(i))await shot("rite-"+String(i+1).padStart(2,"0"));
   }
   assert.equal(await page.locator(sel+" [data-p435930-conf-next]").count(),1);
   await page.locator(sel+" [data-p435930-conf-next]").click();
   await page.locator(timeline+" [data-ao-devo-chapter='0']").waitFor();
   assert.equal(await page.locator(timeline+" [data-ao-devo-chapter]").count(),3);
   for(let i=0;i<3;i++){
    await page.locator(timeline+' [data-ao-devo-chapter="'+i+'"]').click();
    const id=await page.locator(sel+" [data-ao-devo-card]").getAttribute("data-ao-devo-card");
    assert.equal(id,afterIds[i]);
    data.afterCards.push(id);
    await check("after "+id);
   }
   await shot("after-last");
   // Explicit clear must discard the chosen path, never imply absolution.
   await page.locator(sel+" [data-p435930-conf-clear]").click();
   assert.equal(await page.locator(sel+" [data-p435930-conf-path][aria-pressed='true']").count(),0);
   assert.equal((await page.evaluate(()=>globalThis.AO_PRAY_V435930.state())).confessionStage,0);
   await check("cleared");
   assert.deepEqual(errors,[],"Browser exceptions "+errors.join(" | "));
   report.contexts.push(data);
   console.log("CONFESSION_CONTEXT_PASS",path,lang,width,data.questions,data.riteCards.length,data.afterCards.length);
  }catch(error){report.errors.push({path,lang,width,message:String(error?.stack||error)});throw error}
  finally{await context.close()}
 }
 assert.equal(report.contexts.length,12);
 assert.equal(report.screenshots.length,60);
 assert.ok(report.contexts.every(x=>x.riteCards.length===9&&x.afterCards.length===3&&x.sensitiveControls===0));
 console.log("CONFESSION_12_CONTEXTS_PASS 3 paths x 2 languages x 2 widths; 20/70 prompts; 9+3 stages; zero input fields");
}catch(error){throw error}
finally{
 try{await browser?.close()}catch{}
 await new Promise(done=>server.close(done));
 await writeFile(join(out,"confession-acceptance.v1.json"),JSON.stringify(report,null,2)+"\n");
}
