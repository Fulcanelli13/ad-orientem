import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
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
   assert.equal((await state()).focus,true);
   await en.locator("[data-n1-show-en]").click();
   await page.locator(rootSel+" .aoN1FailClosed").first().waitFor({timeout:5000});
   assert.match(await fail.innerText(),/texte français.*pas disponible/i);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"English-only witness mobile overflow");
   assert.deepEqual(errors,[],"Unexpected JavaScript errors: "+JSON.stringify(errors));
   console.log("PASS "+width+"px Novena witness: FR/EN paragraph anchor, focus, reversible English-only source, no text invention or overflow");
  }finally{await page.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
