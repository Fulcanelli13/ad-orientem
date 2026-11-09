import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {NOVENA_HOLY_FACE_1887_B25 as holy} from "../src/pray/holy-face-janvier-1887-b25.js";
import {HOLY_FACE_1895_FR_READER_DAYS,HOLY_FACE_1895_FR_ORIGINAL_SOURCE_URL,HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED} from "../src/pray/holy-face-janvier-1895-fr-reader-candidate.v1.js";

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
const report={schema:"ao.pray.b25-holyface-fr-default-real-phone.v2",base:"FRENCH_1895_NORMALIZED_ORIGINAL_AVAILABLE",
 frenchPrayerBodiesPublished:9,independentFrenchProof:0,printed1887PhotoCollated:false,states:[],screenshots:[]};
assert.equal(HOLY_FACE_1895_FR_PUBLIC_RELEASE_APPROVED,true);
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,reducedMotion:"reduce",deviceScaleFactor:1,
   serviceWorkers:"block",locale:language==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  await page.addInitScript(lang=>{
   try{const key="ao2:settings:v1",prior=JSON.parse(localStorage.getItem(key)||"{}");
    localStorage.setItem(key,JSON.stringify({...prior,language:lang}));}catch{}
  },language);
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",
    null,{timeout:45000});
   await page.evaluate(lang=>{
    globalThis.AO_SETTINGS_DONOR_V4359?.setPath("general.uiLanguage",lang);
    localStorage.setItem("ao:novenas:n1:mode","simple");
   },language);
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   await page.waitForFunction(lang=>globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.()?.preferences?.general?.uiLanguage===lang,
    language,{timeout:15000});
   const sel="#aoPray435930.open";
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.novenas",
    {novenaId:"holy_face_1887",returnContext:null})),true);
   await page.locator(sel+" [data-n1-mode='simple']").click();
   await page.locator(sel+" [data-n1-begin]").click();
   await page.waitForSelector(sel+" .aoN1Reader[data-ao-novena-deck='simple']",{
    timeout:20000});
   for(let day=1;day<=9;day++){
    const reading=page.locator(sel+" .aoN1Reader .aoN1SourceText[data-n1-source-language='"+language+"']");
    await reading.waitFor({state:"attached",timeout:15000});
    const state=await page.evaluate(lang=>{
     const root=document.querySelector("#aoPray435930.open");
     const witness=root?.querySelector(".aoN1Reader .aoN1SourceText[data-n1-source-language='"+lang+"']");
     const link=witness?.querySelector("[data-n1-holy-face-french-1894-original] a");
     const callout=witness?.querySelector("[data-n1-holy-face-1895-source-notice]");
     return {text:witness?.innerText?.slice(-180),textLength:witness?.innerText?.length,
      language:witness?.getAttribute("lang"),link:link?.getAttribute("href")||"",
      linkText:link?.innerText||"",linkTarget:link?.getAttribute("target")||"",
      linkRel:link?.getAttribute("rel")||"",notice:callout?.innerText||"",source:root?.querySelector(".aoN1SourceDetails .aoN1SourcePrimary")?.getAttribute("href")||"",
      alternateCount:root?.querySelectorAll(".aoN1Reader .aoN1SourceText[data-n1-source-language='fr']").length,
      horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
    },language);
    assert.equal(state.language,language);
    assert.equal(state.alternateCount,language==="fr"?1:0,"French original must appear only for French UI");
    assert.ok(state.textLength>3000,"Full source text missing");
    assert.ok(state.horizontalOverflow<=2,"French source access overflows phone");
    if(language==="fr"){
     assert.equal(state.link,"","No old 1894 English fallback link in French 1895 original text");
     assert.match(state.notice,/transcription normalisée/);
     assert.match(state.notice,/relecture indépendante intégrale/);
     assert.equal(state.source,HOLY_FACE_1895_FR_ORIGINAL_SOURCE_URL);
     if(day===8)assert.match(await reading.innerText(),/I\. Le pardon accordé/);
     if(day===9)assert.match(await reading.innerText(),/dans l’éclat de sa gloire céleste/);
    }else{
     assert.equal(state.link,"","English reader must not claim French-original fallback");
    }
    report.states.push({width,language,day,englishOriginalStillVisible:language==="en",
     frenchHistorical1895Available:language==="fr",frenchIndependentlyProofed:false});
    if(day===1&&language==="fr"){
     const name="holy-face-fr-default-"+width+".png";
     await page.screenshot({path:resolve(output,name),animations:"disabled"});
     report.screenshots.push(name);
    }
    if(day<9)await page.locator(sel+" [data-n1-day-next]").click();
   }
   assert.deepEqual(errors,[]);
  }finally{await ctx.close()}
 }
 assert.equal(report.states.length,36,"9 days x 2 languages x 2 phone widths");
 assert.equal(holy.days.filter(day=>!!day.text.fr).length,0,"1887 English source donor remains untouched");
  assert.equal(HOLY_FACE_1895_FR_READER_DAYS.length,9);
 console.log("PASS Holy Face 1895 normalized French displayed by default: 36 320/390 EN/FR states, editorial proof pending, English donor unchanged");
}finally{
 await writeFile(resolve(output,"holy-face-french-default-access.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
