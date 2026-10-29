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
  await page.waitForFunction(()=>!!document.querySelector(
    '.ao-missal-chalice-short'),null,{timeout:4000});
  const chaliceShort=await page.locator(".ao-missal-chalice-short").innerText();
  assert.match(chaliceShort,lang==="fr"?/vin et l’eau/:/wine and water/,
    "Missal chalice has no concise direction");
  assert.equal(await page.locator(".ao-missal-prayer-description:visible").count(),0,
    "Repetitive prayer-description subtitles must disappear");
  const chaliceDetails=page.locator(".ao-missal-chalice-detail");
  assert.equal(await chaliceDetails.getAttribute("open"),null);
  await chaliceDetails.locator("summary").click();
  assert.match(await chaliceDetails.locator("p").innerText(),
    lang==="fr"?/Le prêtre verse le vin/:/The priest pours the wine/,
    "Meaningfully deeper chalice directions lost original 1962 form");
  assert.match(await chaliceDetails.locator("a").getAttribute("href"),/LAT0820/);
  assert.equal(await page.locator(".ao-state-guide:visible").count(),0,
    "MISSAL must not display the GUIDE/Formation panel");
  assert.equal(await page.locator(".ao-state-ribbon").evaluate(el=>
    getComputedStyle(el).gridTemplateColumns.split(" ").length),2,
    "Missal chrome must be balanced between the faithful and priest");
  assert.ok(!(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>1),
    "Long practical Missal description overflows "+width+"px viewport");
  // Avoid duplicating an action already printed as a bracketed source rubric.
  await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.MISSAL.010.2"));
  await page.waitForFunction(()=>document.querySelectorAll(
    '.ao-reader-paragraph').length>0,null,{timeout:5000});
  assert.equal(await page.locator(".ao-missal-inline-rubrics").count(),0,
    "Bracketed paten action is already a Missal rubric; do not reprint it");
  // The short source rubric must be one honest VERNACULAR line.
  // The donor's alleged "Latin" bracket is actually editorial ENGLISH;
  // in French mode use the existing byCue French witness instead.
  const paten=await page.evaluate(()=>{
    const row=[...document.querySelectorAll(".ao-reader-paragraph[data-kind='RUBRIC']")]
      .find(x=>x.dataset.sourceCueIds?.includes("AO.SM.C0111"));
    return {
      text:row?.querySelector(".ao-line-primary")?.textContent,
      secondary:row?.querySelector(".ao-line-secondary")?.textContent,
      witness:row?.dataset.sourceRubricWitness,
      presentation:row?.dataset.rubricPresentationOwner,
      eventIds:row?.dataset.rubricSourceEventIds?.split(" "),
      expanded:row?.getAttribute("role")==="button",
      ink:row?getComputedStyle(row.querySelector(".ao-line-primary")).color:null,
      position:row?{
        marginTop:parseFloat(getComputedStyle(row).marginTop),
        marginBottom:parseFloat(getComputedStyle(row).marginBottom),
        nextParagraphId:row.nextElementSibling?.dataset?.paragraphId??null,
      }:null,
      overflow:document.documentElement.scrollWidth-innerWidth,
    };
  });
  assert.ok(paten.text && (lang==="fr"?/patène/.test(paten.text):/Paten/i.test(paten.text)),
    "Source rubric must be rendered from the selected existing English/French witness");
  assert.ok(paten.text.startsWith(lang==="fr"?"Le prêtre trace":"The priest makes"),
    "Condensed Missal rubric must remain sentence-case EN/FR and accurately describe the paten");
  assert.equal(paten.secondary,undefined,"English square-bracket directions cannot masquerade as Latin");
  assert.equal(paten.witness,"EXISTING_SOURCE_VERNACULAR_RUBRIC",
    "Original source witness identity must be preserved");
  assert.equal(paten.presentation,"PUBLISHED_1962_RUBRIC_SHORT_COPY_V1",
    "Adapted presentation must be distinguished from the original witness");
  assert.deepEqual(paten.eventIds,["AO.RUB.C0111.01","AO.RUB.C0111.02","AO.RUB.C0111.03"],
    "Condensation must not erase any certified paten action");
  assert.equal(paten.expanded,false,"Source rubric must not be a competing tappable paragraph");
  assert.equal(paten.ink,"rgb(223, 126, 128)",
    "The source-ordered book rubric must print in readable Missal red, not grey");
  assert.ok(paten.position?.marginTop>paten.position?.marginBottom,
    "Source rubric should have more space above than below the following prayer");
  assert.equal(await page.locator(".ao-missal-rubric-depth").count(),0,
    "Duplicate action lists are not genuine long rubrics");
  assert.ok(paten.overflow<=1,"Vernacular source rubric caused book overflow");
  await page.screenshot({path:resolve(captureDir,`book-offertory-paten-${width}-${lang}.png`),fullPage:false});
  // Insert unobtrusive sourced directions at actual prayer words.
  await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.MISSAL.010.5"));
  await page.waitForFunction(()=>[...document.querySelectorAll(".ao-missal-rubric-action")]
    .some(x=>/blesses the offerings|bénit les offrandes/i.test(x.textContent)),
    null,{timeout:5000});
  const offertory=await page.evaluate(()=>{
    const block=document.querySelector(".ao-missal-inline-rubrics");
    const style=block?getComputedStyle(block):null;
    const bounds=block?.getBoundingClientRect();
    return {
      notes:[...document.querySelectorAll(".ao-missal-rubric-action")].map(x=>x.textContent),
      link:document.querySelector(".ao-missal-inline-rubrics a")?.getAttribute("href"),
      width:document.documentElement.scrollWidth-innerWidth,
      type:block?{
        fontSize:parseFloat(style.fontSize),lineHeight:parseFloat(style.lineHeight),
        fontStyle:style.fontStyle,textAlign:style.textAlign,
        border:parseFloat(style.borderLeftWidth)+parseFloat(style.borderRightWidth),
        left:bounds.left,right:bounds.right,
        color:style.color,
        illustrations:[...block.querySelectorAll(
          ".ao-approved-finger-rubric-art,.ao-approved-priest-gesture-rubric-art,.ao-approved-priest-head-bow-rubric-art"
        )].map(el=>getComputedStyle(el).display),
      }:null,
    };
  });
  assert.ok(offertory.notes.every(x=>lang==="fr"?x.startsWith("Le prêtre "):x.startsWith("The priest ")),
    "In-page priest rubrics must be localized");
  assert.equal(offertory.link,undefined,
    "No repeated 1962 source links should follow individual short gestures");
  assert.equal(await page.locator(".ao-missal-rubric-depth").count(),0,
    "A word-triggered short action alone must NOT create a fake long rubric");
  assert.equal(await page.locator(".ao-canon-inline-heading:visible").count(),0,
    "No repeated RUBRIC / PRIEST headings inside Missal text");
  assert.equal(await page.locator(".ao-canon-inline-source:visible").count(),0,
    "The source URL must not be repeated after every brief gesture");
  assert.ok(offertory.width<=1,"Missal inline Offertory rubric overflows phone width");
  assert.ok(offertory.type,"Source-owned Missal rubric has vanished");
  assert.ok(offertory.type.fontSize>=13&&offertory.type.fontSize<=15.1,
    "Missal inline rubric no longer follows readable shared font scale");
  assert.ok(offertory.type.lineHeight/offertory.type.fontSize>=1.49,
    "Missal inline rubric uses compressed line spacing");
  assert.equal(offertory.type.fontStyle,"italic");
  assert.equal(offertory.type.color,"rgb(223, 126, 128)",
    "The certified inline direction must use the same Missal red as the source rubrics");
  assert.ok(offertory.type.illustrations.every(display=>display==="none"),
    "Printed rubrics cannot contain LIVE gesture illustrations");
  assert.equal(offertory.type.textAlign,"center",
    "Two-column Missal must retain the traditional centred source rubric");
  assert.equal(offertory.type.border,0,
    "Missal must not inherit LIVE's side rule");
  assert.ok(offertory.type.left>=-1&&offertory.type.right<=width+1,
    "Missal rubric escapes the page frame");
  await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.MISSAL.014.3"));
  await page.waitForFunction(()=>[...document.querySelectorAll(".ao-missal-rubric-action")]
    .some(x=>/inclines his head|incline la tête/i.test(x.textContent)),
    null,{timeout:5000});
  assert.equal(await page.locator(".ao-canon-inline-rubrics").count(),0,
    "Missal should use restrained book rubric, not duplicate LIVE Canon rail note");
  await page.screenshot({path:resolve(captureDir,`book-canon-opening-${width}-${lang}.png`),fullPage:false});

  assert.deepEqual(errors,[],width+"px Missal runtime errors: "+errors.join(" | "));
  await context.close();
 }
 // Solemn only: actual source-cue book note, with the Requiem form
 // projected through the existing R18 controller, not inferred by scrolling.
 for(const {requiem,lang} of [
   {requiem:false,lang:"en"},{requiem:true,lang:"en"},
   {requiem:false,lang:"fr"},{requiem:true,lang:"fr"}
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:4288/tests/fixtures/reader-phone-harness.html?mode=MISSAL&form=SOLEMN&lang=${lang}&requiem=${requiem?1:0}`,{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:60000});
  const source=await page.evaluate(()=>{
    const preview=window.__AO_PHONE_PREVIEW;
    preview.showSection("AO.MISSAL.010.6");
    return preview.getCurrentCard()?.sectionId;
  });
  assert.equal(source,"AO.MISSAL.010.6","Offertory incensation Must retain source page in Solemn Missal");
  await page.waitForFunction(()=>!!document.querySelector(
   '.ao-missal-rubric-action[data-rubric-id="SMIN-009"]'),null,{timeout:9000});
  const note=await page.locator('.ao-missal-rubric-action[data-rubric-id="SMIN-009"]').innerText();
  assert.match(note,requiem
    ?(lang==="fr"?/Seul le célébrant est encensé/:/choir and people are not/)
    :(lang==="fr"?/ministres sacrés assistent/:/sacred ministers assist/i));
  assert.equal(await page.locator(".ao-missal-rubric-depth").count(),0,
    "The Solemn minister single action is not an extended rubric");
  assert.equal(await page.locator(".ao-canon-inline-heading:visible").count(),0,
    "Solemn minister is identified in wording, not a repeated heading");
  const layout=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-innerWidth,
   tags:[...document.querySelectorAll(".ao-missal-rubric-action")].map(e=>e.dataset.rubricId),
   visible:!!document.querySelector('.ao-missal-inline-rubrics[data-observed-now="false"]')
  }));
  assert.ok(layout.overflow<=1,"Solemn minister notes cause horizontal Missal overflow");
  assert.ok(!layout.tags.some(id=>id==="SMIN-013"),"Pax belongs to its own prayer, not Offertory");
  if(!requiem){
    const paxCard=await page.evaluate(()=>{
      window.__AO_PHONE_PREVIEW.showSection("AO.MISSAL.022.1");
      return window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId;
    });
    assert.equal(paxCard,"AO.MISSAL.022.1","Canonical Pax prayer has been moved");
    await page.waitForFunction(()=>!!document.querySelector(
     '.ao-missal-rubric-action[data-rubric-id="SMIN-013"]'),null,{timeout:8000});
  }
  assert.deepEqual(errors,[], "Solemn Missal runtime errors: "+errors.join(" | "));
  await context.close();
 }
 console.log("PASS minimal MISSAL two-column Latin/vernacular alignment, equal serif font, Missal state ribbon, no Schola, EN/FR at 320/390/768");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(r=>server.close(r));
}
