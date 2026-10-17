import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captureDir=resolve(root,"artifacts/missal-phone-review");
await mkdir(captureDir,{recursive:true});
const audit=[];
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const bytes=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4288,"127.0.0.1",resolve)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {width,height,lang} of [
  {width:320,height:700,lang:"en"},{width:390,height:844,lang:"en"},
  {width:390,height:844,lang:"fr"},{width:768,height:1000,lang:"fr"}]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<600,deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  await page.goto(`http://127.0.0.1:4288/tests/fixtures/reader-phone-harness.html?mode=MISSAL&lang=${lang}`,{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:60000});
  const measure=await page.evaluate(()=>{
   const shell=document.querySelector("[data-ao-reader-shell]");
   const paired=[...document.querySelectorAll(".ao-reader-paragraph[data-missal-paired='true']")];
   const row=paired.find(r=>r.querySelector(".ao-line-primary")&&r.querySelector(".ao-line-secondary"));
   if(!row)return {mode:shell?.dataset.mode,rows:paired.length};
   const primary=row.querySelector(".ao-line-primary"),translated=row.querySelector(".ao-line-secondary");
   const p=primary.getBoundingClientRect(),t=translated.getBoundingClientRect();
   const style=getComputedStyle(row);
   return {mode:shell.dataset.mode,rows:paired.length,
    textLeft:row.dataset.missalPrimaryLanguage==="LATIN"?p.x:t.x,
    textRight:row.dataset.missalPrimaryLanguage==="LATIN"?t.x:p.x,
    gridColumns:style.gridTemplateColumns,
    fontPrimary:getComputedStyle(primary).fontFamily,
    fontTranslation:getComputedStyle(translated).fontFamily,
    sizePrimary:parseFloat(getComputedStyle(primary).fontSize),
    sizeTranslation:parseFloat(getComputedStyle(translated).fontSize),
    secondaryVisible:getComputedStyle(translated).display!=="none",
    stateRibbon:getComputedStyle(shell.querySelector(".ao-state-ribbon")).display,
    readerProgress:getComputedStyle(shell.querySelector(".ao-reader-progress")).display,
    schola:getComputedStyle(shell.querySelector(".ao-schola-dock")).display,
    viewportOverflow:document.documentElement.scrollWidth-innerWidth,
    primaryText:primary.textContent,secondaryText:translated.textContent};
  });
  // Viewport screenshots complement assertions; they do not constitute real-handset signoff.
  const filename="missal-"+width+"-"+lang+".png";
  await page.screenshot({path:resolve(captureDir,filename),fullPage:false});
  audit.push({viewport:{width,height},language:lang,file:filename,
    mode:measure.mode,pairedRows:measure.rows,gridColumns:measure.gridColumns,
    leftX:measure.textLeft,rightX:measure.textRight,
    viewportOverflowPx:measure.viewportOverflow,readerProgressDisplay:measure.readerProgress,
    serifFontsMatch:measure.fontPrimary===measure.fontTranslation,
    equalFontSize:measure.sizePrimary===measure.sizeTranslation});
  await writeFile(resolve(captureDir,"metrics.json"),JSON.stringify(audit,null,2)+"\n");
  assert.equal(measure.mode,"MISSAL",width+"px reader did not open in Missal");
  assert.ok(measure.rows>0,width+"px Missal has no bilingual paragraph pairs");
  assert.ok(measure.textRight>measure.textLeft+30,width+"px Latin and vernacular are not side by side: "+JSON.stringify(measure));
  assert.ok(measure.gridColumns?.split(" ").length>=2,width+"px missal rows are not a two-column grid");
  assert.equal(measure.fontPrimary,measure.fontTranslation,"Missal typography changes between Latin and translation");
  assert.equal(measure.sizePrimary,measure.sizeTranslation,"Missal vernacular text uses an inconsistent size");
  assert.equal(measure.secondaryVisible,true,"Missal translation is not visible");
  assert.equal(measure.stateRibbon,"grid",
    "Missal must show its own persistent faithful/priest gesture ribbon");
  assert.equal(measure.readerProgress,"none","MISSAL book text is obscured by LIVE section progress overlay");
  assert.equal(measure.schola,"none","Minimal Missal has the Schola overlay");
  assert.ok(measure.viewportOverflow<=1,width+"px Missal overflows phone width");
  assert.ok(measure.primaryText?.trim()&&measure.secondaryText?.trim(),"Both sourced columns must contain text");
  const clickable=page.locator(".ao-reader-paragraph[data-translate-toggle='true']").first();
  if(await clickable.count()){
   const before=await clickable.locator(".ao-line-primary").innerText();
   await clickable.click({force:true});
   assert.equal(await clickable.locator(".ao-line-primary").innerText(),before,"A Missal column was replaced on tap");
  }
  // Real Missal navigation: the source-owned B032 heading is an ordinary
  // practical rubric, not an invented priest action fired on page entry.
  const chalice=await page.evaluate(()=>{
    const preview=window.__AO_PHONE_PREVIEW;
    preview.showSection("AO.MISSAL.010.3");
    return preview.getCurrentCard()?.sectionId??null;
  });
  assert.equal(chalice,"AO.MISSAL.010.3","Missal chalice preparation page is missing");
  await page.waitForFunction(()=>[...document.querySelectorAll(".ao-missal-prayer-description")]
    .some(x=>/verse le vin avant cette prière|pours the wine before this prayer/.test(x.textContent)),null,{timeout:4000});
  const shortRubric=await page.locator(".ao-missal-prayer-description").first().innerText();
  assert.match(shortRubric,lang==="fr"?/Le prêtre verse le vin/:/The priest pours the wine/,
    "Missal chalice context language or form is wrong");
  assert.ok(!(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>1),
    "Long practical Missal description overflows "+width+"px viewport");
  assert.deepEqual(errors,[],width+"px Missal runtime errors: "+errors.join(" | "));
  await context.close();
 }
 console.log("PASS minimal MISSAL two-column Latin/vernacular alignment, equal serif font, Missal state ribbon, no Schola, EN/FR at 320/390/768");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(r=>server.close(r));
}
