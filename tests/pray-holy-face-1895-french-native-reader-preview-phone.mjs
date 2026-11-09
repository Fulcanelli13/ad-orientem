import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {NOVENA_HOLY_FACE_1887_B25 as holy} from "../src/pray/holy-face-janvier-1887-b25.js";
import {HOLY_FACE_1895_FR_READER_DAYS as frenchDays,HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED} from "../src/pray/holy-face-janvier-1895-fr-reader-candidate.v1.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-b25-holyface-original-fr");
const evidence=JSON.parse(readFileSync(resolve(root,
 "data/pray/pray-b25-holy-face-french-original-volume-1894.v1.json"),"utf8"));
const original=evidence.frenchHistoricalVolume.freeDigitalBook;
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",
 ".jpg":"image/jpeg",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
await mkdir(output,{recursive:true});
let browser;

assert.equal(HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED,false,"Preview-only feature may not activate French publication");
assert.equal(frenchDays.length,9);
await mkdir(output,{recursive:true});
let browser;
const report={schema:"ao.pray.holy-face.1895-fr-native-preview-phone.v1",
 previewOnly:true,publicationApproved:false,states:[],screenshots:[]};
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block",
   locale:language==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  await page.addInitScript(lang=>{
   try{const key="ao2:settings:v1",prior=JSON.parse(localStorage.getItem(key)||"{}");
    localStorage.setItem(key,JSON.stringify({...prior,language:lang}));}catch{}
  },language);
  const target=language==="fr"?"fr":"en",sel="#aoPray435930.open";
  const shown=()=>page.locator(sel+" .aoN1Reader .aoN1SourceText[data-n1-source-language='"+target+"']");
  const assertWitness=async(day,mode)=>{
   await shown().waitFor({state:"attached",timeout:20000});
   const state=await page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open"),w=root?.querySelector(".aoN1Reader .aoN1SourceText");
    const p=w?.querySelectorAll(".aoN1PrayerParagraph")||[];
    return {lang:w?.getAttribute("lang"),text:w?.innerText||"",paragraphs:p.length,
     notice:!!w?.querySelector("[data-n1-holy-face-1895-preview-notice]"),
     toggle:!!w?.querySelector("[data-n1-show-en]"),
     fallback:!!w?.querySelector("[data-n1-proper-source-fallback]"),
     horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
   });
   assert.equal(state.lang,target);
   assert.ok(state.text.length>3200,"Missing full historical prayer "+language+" day "+day);
   assert.ok(state.paragraphs>=9,"Missing full day text paragraphs");
   assert.equal(state.horizontalOverflow<=2,true,"Phone layout horizontal overflow "+width);
   if(language==="fr"){
    assert.ok(state.notice,"French original edition must carry the editorial preview notice");
    assert.ok(state.toggle,"English witness must remain accessible");
    assert.equal(state.fallback,false,"Do not show old English fallback in French preview");
    const first=frenchDays[day-1].text.split("\n\n")[0];
    assert.ok(state.text.includes(first.slice(0,48)),"Wrong 1895 French day "+day);
    if(day===5)assert.match(state.text,/jugement dérisoire/);
    if(day===6)assert.match(state.text,/Le prétoire de Pilate fut pour Notre-Seigneur/);
    if(day===7)assert.match(state.text,/elle l’essuie et le soulage/);
    if(day===8){assert.match(state.text,/Le pardon accordé/);assert.match(state.text,/Vœu à pratiquer/);}
    if(day===9)assert.match(state.text,/dans l’éclat de sa gloire céleste/);
   }else{
    assert.equal(state.notice,false);
    assert.equal(state.toggle,false);
    if(day===5)assert.match(state.text,/derisive judgment/);
   }
   report.states.push({width,language,day,mode,lang:state.lang,paragraphs:state.paragraphs,chars:state.text.length});
  };
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?holy-face-fr-preview=1",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   await page.evaluate(lang=>{
    globalThis.AO_SETTINGS_DONOR_V4359?.setPath("general.uiLanguage",lang);
    localStorage.setItem("ao:novenas:n1:mode","simple");
   },language);
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   await page.waitForFunction(lang=>globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.()?.preferences?.general?.uiLanguage===lang,
    language,{timeout:15000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.novenas",
    {novenaId:"holy_face_1887",returnContext:null})),true);
   await page.locator(sel+" [data-n1-mode='simple']").click();
   await page.locator(sel+" [data-n1-begin]").click();
   await page.waitForSelector(sel+" .aoN1Reader[data-ao-novena-deck='simple']",{timeout:25000});
   for(let day=1;day<=9;day++){
    await assertWitness(day,"simple");
    if(day===1&&language==="fr"){
     const filename="holy-face-1895-fr-preview-"+width+".png";
     await page.screenshot({path:resolve(output,filename),animations:"disabled"});
     report.screenshots.push(filename);
     // Toggle the historical English witness and return without changing the selected day.
     await page.locator(sel+" [data-n1-show-en]").click();
     await page.locator(sel+" .aoN1Reader .aoN1SourceText[data-n1-source-language='en']").waitFor();
     assert.match(await page.locator(sel+" .aoN1SourceText").innerText(),/Lord, I desire to seek thy Face/);
     await page.locator(sel+" [data-n1-show-en]").click();
     await shown().waitFor();
     assert.equal(await page.evaluate(()=>window.AO_NOVENAS_V3.state().day),1);
    }
    if(day<9)await page.locator(sel+" [data-n1-day-next]").click();
   }
   await page.locator(sel+" [data-n1-mode='guided']").click();
   await page.waitForSelector(sel+" .aoN1Reader[data-ao-novena-deck='guided']");
   for(const day of [9,1]){
    if(day!==9){
     await page.locator(sel+" .aoN1DayDisclosure summary").click();
     await page.locator(sel+` [data-n1-day="${day}"]`).click();
    }
    await page.locator(sel+" [data-n1-stage-next]").click();
    await assertWitness(day,"guided");
   }
   assert.deepEqual(errors,[],"Page script errors");
  }finally{await ctx.close();}
 }
 assert.equal(report.states.filter(x=>x.mode==="simple").length,36);
 assert.equal(report.states.filter(x=>x.mode==="guided").length,8);
 assert.equal(holy.days.filter(x=>!!x.text.fr).length,0,"Unapproved candidate does not replace canonical data");
 console.log("PASS Holy Face 1895 French opt-in native preview: 36 Simple + 8 Guided 320/390 EN/FR states, source-specific Day IX conclusion, English toggle, no default French publication");
}finally{
 await writeFile(resolve(output,"holy-face-1895-french-preview-phone.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
