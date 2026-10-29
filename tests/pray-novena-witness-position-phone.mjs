import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".png":"image/png",".svg":"image/svg+xml",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   await page.evaluate(()=>{const key="ao2:settings:v1",saved=JSON.parse(localStorage.getItem(key)||"{}");localStorage.setItem(key,JSON.stringify({...saved,language:"fr"}));localStorage.setItem("ao:novenas:n1:mode","simple");});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:20000});
   // The settings app may complete bootstrap *after* the Prayer module loads.
   // Apply this test's French locale after bootstrap so the Novena runtime
   // reads the intended current setting rather than an earlier default.
   await page.evaluate(()=>{const key="ao2:settings:v1",saved=JSON.parse(localStorage.getItem(key)||"{}");localStorage.setItem(key,JSON.stringify({...saved,language:"fr"}));});
   const rootSel="#aoPray435930.open";
   const open=async(id)=>{
    assert.equal(await page.evaluate(novenaId=>globalThis.AO_PRAY_V435930.open("pray.novenas",{novenaId,returnContext:null}),id),true);
    await page.waitForSelector(rootSel+" [data-n1-begin]",{timeout:15000});
    await page.locator(rootSel+" [data-n1-mode='simple']").click();
    await page.locator(rootSel+" [data-n1-begin]").click();
    await page.waitForSelector(rootSel+" .aoN1Reader[data-ao-novena-deck='simple'] .aoDevoCardScroll",{timeout:15000});
   };
   const state=()=>page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open"),block=root?.querySelector(".aoN1SourceText,.aoN1FailClosed");
    const button=block?.querySelector("[data-n1-show-en]"),scroll=block?.closest(".aoDevoCardScroll")||root?.querySelector(".aoP435930Mount");
    return {scrollTop:scroll?.scrollTop||0,top:block?.getBoundingClientRect().top||0,
      focus:document.activeElement===button,hasToggle:!!button,
      languageLabel:block?.querySelector("small")?.textContent||"",
      text:block?.textContent?.slice(0,180)||"",
      reader:root?.querySelector(".aoN1Reader")?.dataset.aoNovenaDeck||"",
      overflow:document.documentElement.scrollWidth-innerWidth,
      day:root?.querySelector(".aoN1DayFolioActive")?.textContent?.trim()||""};
   });
   // Two full historical witnesses: language replacement must preserve
   // the card-local scroll position, day identity and active toggle focus.
   await open("holy_ghost");
   const bilingual=page.locator(rootSel+" .aoN1SourceText [data-n1-show-en]").first();
   const available=await bilingual.count();
   if(!available){
    const diagnostic=await page.evaluate(()=>({settings:localStorage.getItem("ao2:settings:v1"),
      mode:document.querySelector("#aoPray435930.open .aoN1Reader")?.dataset.aoNovenaDeck,
      witnessCount:document.querySelectorAll("#aoPray435930.open .aoN1SourceText").length,
      failClosed:document.querySelectorAll("#aoPray435930.open .aoN1FailClosed").length,
      snippet:document.querySelector("#aoPray435930.open .aoN1Reader")?.innerText?.slice(0,330)}));
    assert.fail("Bilingual source witness toggle absent: "+JSON.stringify(diagnostic));
   }
   await bilingual.scrollIntoViewIfNeeded();
   const before=await state();
   assert.ok(before.hasToggle,"Verified bilingual novena must offer a source-witness switch");
   assert.match(before.day,/Jour 1 sur 9/);
   await bilingual.click();
   await page.waitForFunction(()=>/TÉMOIN SOURCE ANGLAIS/.test(document.querySelector("#aoPray435930.open .aoN1SourceText small")?.textContent||""),null,{timeout:5000});
   await page.waitForFunction(()=>document.activeElement?.matches?.("[data-n1-show-en]")===true,null,{timeout:5000});
   const switched=await state();
   assert.equal(switched.reader,"simple");
   assert.equal(switched.day,before.day,"Witness changes must not advance or reset the novena day");
   assert.ok(Math.abs(switched.top-before.top)<50,"French to English witness change displaced the reading anchor: "+JSON.stringify({before,switched}));
   assert.ok(switched.focus,"Switch must restore keyboard focus to same source witness control");
   assert.ok(switched.overflow<=1,"No horizontal phone overflow at "+width+"px");
   await page.locator(rootSel+" .aoN1SourceText [data-n1-show-en]").first().click();
   await page.waitForFunction(()=>document.activeElement?.matches?.("[data-n1-show-en]")===true,null,{timeout:5000});
   assert.match((await state()).languageLabel,/FRANÇAIS|TRADUCTION/,"Return must restore French witness and provenance");
   // English-only Janvier/Bennett 1887: don't invent a French translation.
   await open("holy_face_1887");
   const fail=page.locator(rootSel+" .aoN1FailClosed").first();
   await fail.waitFor({timeout:5000});
   assert.match(await fail.innerText(),/texte français.*pas disponible/i);
   await fail.locator("[data-n1-show-en]").click();
   const en=page.locator(rootSel+" .aoN1SourceText").first();
   await en.waitFor({timeout:5000});
   assert.match(await en.locator("small").innerText(),/TÉMOIN SOURCE ANGLAIS/);
   assert.equal(await en.locator("[data-n1-show-en]").count(),1,"English-only witness must retain a reversible control");
   await page.waitForFunction(()=>document.activeElement?.matches?.("[data-n1-show-en]")===true,null,{timeout:5000});
   assert.equal((await state()).focus,true);
   await en.locator("[data-n1-show-en]").click();
   await page.locator(rootSel+" .aoN1FailClosed").first().waitFor({timeout:5000});
   assert.match(await fail.innerText(),/texte français.*pas disponible/i);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"English-only witness mobile overflow");
   // Source-owned guided Novenas have 3, 4, 5 or 6 stages depending on
   // historical pattern; the progress rail must report the actual count.
   assert.equal(await page.locator(rootSel+' [data-ao-novena-stage-progress]').count(),0,
    "Simple Novena reading should not invent a stage counter");
   await page.locator(rootSel+' [data-n1-mode="guided"]').click();
   const progress=page.locator(rootSel+' [data-ao-novena-stage-progress]');
   await progress.waitFor();
   assert.equal(await progress.getAttribute("role"),"progressbar");
   assert.equal(await progress.getAttribute("aria-valuemax"),"3","Holy Face uses three source-owned guided stages");
   assert.equal(await progress.getAttribute("aria-valuenow"),"1");
   assert.match(await page.locator(rootSel+' .aoN1StageCaption').innerText(),/Étape de prière 1 sur 3/);
   assert.equal(await progress.locator("span").count(),3);
   await page.locator(rootSel+' [data-n1-stage-next]').click();
   assert.equal(await progress.getAttribute("aria-valuenow"),"2","Stage advance must update the progress value");
   assert.equal(await progress.locator(".current").count(),1,"Exactly one segment is current");
   assert.equal(await progress.locator(".done").count(),1);
   await page.locator(rootSel+' [data-n1-stage-prev]').click();
   assert.equal(await progress.getAttribute("aria-valuenow"),"1","Stage back must restore progress");
   await page.evaluate(()=>{const k="ao2:settings:v1",v=JSON.parse(localStorage.getItem(k)||"{}");localStorage.setItem(k,JSON.stringify({...v,language:"en"}))});
   await open("holy_ghost");
   await page.locator(rootSel+' [data-n1-mode="guided"]').click();
   assert.equal(await progress.getAttribute("aria-valuemax"),"4","Holy Ghost must use four guided stages");
   assert.equal(await progress.getAttribute("aria-valuenow"),"1");
   assert.match(await page.locator(rootSel+' .aoN1StageCaption').innerText(),/Prayer stage 1 of 4/);
   const layout=await page.locator(rootSel+' .aoN1StageIndicator').evaluate(el=>{
    const cap=el.querySelector(".aoN1StageCaption"),bar=el.querySelector(".aoN1StageRail");
    return {font:parseFloat(getComputedStyle(cap).fontSize),width:bar.getBoundingClientRect().width,
      segments:bar.children.length,columns:getComputedStyle(bar).gridTemplateColumns.split(" ").length};
   });
   assert.ok(layout.font>=13,"Novena progress caption must remain readable at phone width");
   assert.ok(layout.width>=180,"Novena progress bar must not collapse on a narrow phone");
   assert.equal(layout.segments,4);
   assert.equal(layout.columns,4,"Progress bar column count must match this novena's actual stage count");
   await page.locator(rootSel+' [data-n1-stage-next]').click();
   assert.equal(await progress.getAttribute("aria-valuenow"),"2");
   assert.match(await page.locator(rootSel+' .aoN1StageCaption').innerText(),/Prayer stage 2 of 4/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
    "Guided Novena progress must not introduce horizontal overflow");
   // B35: inspect actual computed type, provenance disclosures, touch targets
   // and sticky nav geometry in both EN and FR long-form source readers.
   const checkComfort=async(locale,id)=>{
    await page.evaluate(language=>{
     const k="ao2:settings:v1",v=JSON.parse(localStorage.getItem(k)||"{}");
     localStorage.setItem(k,JSON.stringify({...v,language}));
    },locale);
    await open(id);
    const sample=await page.evaluate(()=>{
     const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
     const nav=mount.querySelector(".aoN1Reader .aoN1Nav");
     const body=mount.querySelector(".aoN1Reader .aoN1SourceText .aoN1PrayerParagraph");
     const witness=mount.querySelector(".aoN1Reader .aoN1SourceText>small");
     const source=mount.querySelector(".aoN1Reader details.aoN1SourceDetails");
     const summary=source?.querySelector("summary");
     const next=nav?.querySelector("[data-n1-day-next]");
     const navR=nav?.getBoundingClientRect(),port=mount.getBoundingClientRect();
     const btn=next?.getBoundingClientRect();
     const hit=btn?document.elementFromPoint(btn.left+btn.width/2,btn.top+btn.height/2):null;
     const paras=[...mount.querySelectorAll(".aoN1Reader .aoN1SourceText .aoN1PrayerParagraph")];
     return {
      navPosition:nav?getComputedStyle(nav).position:"",
      navTop:navR?.top,navBottom:navR?.bottom,portTop:port.top,portBottom:port.bottom,
      btnHeight:btn?.height,btnWidth:btn?.width,hitTarget:!!next&&(hit===next||next.contains(hit)),
      witnessFont:witness?parseFloat(getComputedStyle(witness).fontSize):null,
      bodyFont:body?parseFloat(getComputedStyle(body).fontSize):null,
      bodyLeading:body?parseFloat(getComputedStyle(body).lineHeight):null,
      paragraphCount:paras.length,
      paragraphGap:paras.length>1?paras[1].getBoundingClientRect().top-paras[0].getBoundingClientRect().bottom:null,
      focusOpacity:paras.map(p=>Number(getComputedStyle(p).opacity)),
      summaryFont:summary?parseFloat(getComputedStyle(summary).fontSize):null,
      sourceOpen:source?.open,hasSource:!!source,
      overflow:document.documentElement.scrollWidth-innerWidth
     };
    });
    assert.equal(sample.navPosition,"sticky","Novena day navigation must stay reachable from the reading viewport");
    assert.ok(sample.navTop>=sample.portTop-4&&sample.navBottom<=sample.portBottom+4,
     "Navigation dock is not within the phone reading viewport: "+JSON.stringify({locale,id,sample}));
    assert.ok(sample.btnHeight>=48&&sample.btnWidth>=96&&sample.hitTarget,
     "Next-day control must be a reachable 48px+ thumb target: "+JSON.stringify({locale,id,sample}));
    assert.ok(sample.witnessFont>=12,"Historical source status must be at least 12px");
    assert.ok(sample.bodyFont>=18&&sample.bodyLeading/sample.bodyFont>=1.55,
     "Prayer paragraphs must preserve their 18px+ / 1.55+ reading rhythm");
    assert.ok(sample.paragraphGap===null||sample.paragraphGap>=16,
     "Consecutive source paragraphs must be visually separated: "+JSON.stringify({locale,id,sample}));
    assert.ok(sample.focusOpacity.every(x=>x>=.64),
     "Novena unfocused text must keep readable opacity: "+JSON.stringify({locale,id,opacity:sample.focusOpacity}));
    assert.ok(sample.hasSource&&!sample.sourceOpen,"Edition notes must remain accessible but closed by default");
    assert.ok(sample.summaryFont>=14,"Source edition disclosure is not legible on small phones");
    assert.ok(sample.overflow<=1,"Reader must not horizontally overflow at "+width+"px");
    const shotDir=resolve(root,"artifacts/pray-b35");
    await mkdir(shotDir,{recursive:true});
    await page.screenshot({path:resolve(shotDir,"novena-"+locale+"-"+width+"-opening.png"),animations:"disabled"});
    await page.evaluate(()=>{
     const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
     mount.scrollTop=Math.round((mount.scrollHeight-mount.clientHeight)*.55);
    });
    const after=await page.evaluate(()=>{
     const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
     const nav=mount.querySelector(".aoN1Reader .aoN1Nav");
     const rect=nav.getBoundingClientRect(),port=mount.getBoundingClientRect();
     const next=nav.querySelector("[data-n1-day-next]");
     const b=next.getBoundingClientRect(),hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
     return {top:rect.top,bottom:rect.bottom,portTop:port.top,portBottom:port.bottom,
      hit:hit===next||next.contains(hit)};
    });
    assert.ok(after.top>=after.portTop-4&&after.bottom<=after.portBottom+4&&after.hit,
     "Thumb dock must remain accessible while scrolling long prayer text: "+JSON.stringify({locale,id,after}));
    await page.screenshot({path:resolve(shotDir,"novena-"+locale+"-"+width+"-scroll.png"),animations:"disabled"});
   };
   await checkComfort("en","holy_face_1887");
   await checkComfort("fr","holy_ghost");
   assert.deepEqual(errors,[],"Unexpected JavaScript errors: "+JSON.stringify(errors));
   console.log("PASS "+width+"px Novena witness, progress and reading comfort: FR/EN focus; 3/4-stage guided progress; simple unaffected; no overflow");
  }finally{await page.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
