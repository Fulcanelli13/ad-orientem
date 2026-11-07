/**
 * Stage 7 — source-exact bodies within existing multi-text Prayer readers.
 * No text mutation, no generic reader, no claims of original-print collation.
 * node tests/pray-work-stage7-rendered-witnesses-20261107.mjs
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {GOLDEN_ARROW_REPARATION_V1 as GOLDEN} from "../src/pray/icksp-golden-arrow-reparation.v1.js";
import {NOVENA_HOLY_FACE_1887_B25 as FACE} from "../src/pray/holy-face-janvier-1887-b25.js";
import {MONTFORT_B26_CONSECRATION_ACT_EN as ACT,MONTFORT_B26_PHASES} from "../src/pray/montfort-consecration-b26.js";
import {MONTFORT_B27_PRAYERS,montfortHistoricalPrayerRows} from "../src/pray/montfort-original-prayers-b27.js";
import {JESUS_MARY_JOSEPH_V384 as ASP,PROFICISCERE_V384 as COMMEND} from "../src/pray/good-death-data.js";
import {PRAY_CANONICAL_DATA_V435930 as CANON} from "../src/pray/canonical-data.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-work-stage7-rendered");
await mkdir(output,{recursive:true});
const registry=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-work-identity-registry-20261106.v1.json"),"utf8"));
const registered=new Set(registry.works.map(w=>w.id));
const required=["holy_face_golden_arrow","holy_face_1887","holy_spirit_litany","montfort_augustine_prayer","montfort_consecration_act_1863","good_death_jesus_mary_joseph","good_death_proficiscere"];
assert.ok(required.every(id=>registered.has(id)),"Stage 7 work identities drifted");
assert.equal(FACE.days.length,9);
assert.ok(FACE.days.every(day=>day.text.en?.length>100 && !day.text.fr?.trim()),"Holy Face historic French propers must not be invented");
assert.equal(GOLDEN.la,null,"Golden Arrow has no authenticated Latin source");
assert.equal(CANON.stabat.length,13,"The existing partial 13-tercet Stabat source changed; review completeness before release");
assert.equal(MONTFORT_B26_PHASES.length,4);
assert.ok(ACT.length>=6 && ACT.every(x=>x.length>50));
assert.equal(COMMEND.languageStatus,"LATIN_POST_1922_EVIDENCE_EN_FR_EDITORIAL_ALIGNED_HISTORIC_TRANSLATION_NOT_PROVEN");

const plain=s=>String(s??"").normalize("NFC").replace(/\s+/g,"");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const report={schema:"ao.pray.stage7-rendered-witnesses.v1",branch:"research/prayer-work-identity-registry-20261106",
 scope:"Actual Chromium text-vs-source comparisons in existing Golden Arrow, Holy Face, Montfort and Good Death readers; NOT new original-edition, rights, translation or complete-corpus certificates.",
 contexts:[],checks:[],errors:[],sourceQualifications:{
  goldenArrow:"1884 English and 1887 French independent recensions; no admitted Latin",
  holyFace:"Nine historical English proper prayers, no attested French proper translations",
  montfort:"English historical litany and consecration act; original photographed print remains uncollated",
  proficiscere:"1937 Latin post-1922 order; EN/FR editorial aligned; exact 1962 print pending",
  stabat:"Canonical source contains only first 13 of 20 traditional tercets"
 },publicationChanges:false,readerMutations:false};
const mark=(width,ui,owner,item)=>report.checks.push({width,ui,owner,item,sourceExact:true});
let browser;
async function cardBody(page,selector,latin=false){
 return await page.locator(selector).evaluate((article,latin)=>{
  const node=latin?article.querySelector("[data-face-la]"):article.querySelector("[data-face-v]")||article.querySelector(".aoTP381Reader");
  return node?{lang:node.getAttribute("lang"),text:node.textContent||"",hidden:node.hidden}:null;
 },latin);
}
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,
   deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce",locale:ui==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage(),pageErrors=[];
  page.on("pageerror",e=>pageErrors.push(String(e.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(k=>document.documentElement.lang===k,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function" && typeof globalThis.AO_NOVENAS_V3?.open==="function",null,{timeout:30000});
   const open=async(id,opts={})=>assert.equal(await page.evaluate(([id,opts])=>globalThis.AO_PRAY_V435930.open(id,opts),[id,opts]),true,id+" could not open");

   // 1: Golden Arrow. This is neither Pius XI's reparation nor a Latin translation.
   await open("pray.sacred_heart",{prayer:"golden_arrow",returnContext:null});
   const heart="#aoPray435930.open [data-ao-devo-card='heart-golden_arrow'] .aoTP381PrayerCard";
   await page.locator(heart).waitFor();
   const arrow=await cardBody(page,heart);
   assert.deepEqual([arrow?.lang,plain(arrow?.text)],[ui,plain(GOLDEN[ui])],"Golden Arrow changed witness "+width+"/"+ui);
   assert.equal(await page.locator(heart+" [data-tp381-latin-switch]").count(),0,"Do not invent Golden Arrow Latin");
   await page.locator("#aoPray435930.open [data-ao-good-death-options],#aoPray435930.open [data-ao-heart-options]").first().count();
   mark(width,ui,"Golden Arrow","independent "+ui+" source witness");

   // 2: Holy Face: nine full English day propers, with French-source warning.
   assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.open({novenaId:"holy_face_1887",returnContext:null})),true);
   const detail=page.locator("#aoPray435930.open .aoN1DetailFolio");
   await detail.locator("[data-n1-mode='simple']").evaluate(b=>b.click());
   await detail.locator("[data-n1-begin]").evaluate(b=>b.click());
   const reader="#aoPray435930.open .aoN1Reader";
   await page.locator(reader+"[data-ao-novena-deck='simple']").waitFor();
   for(let day=1;day<=9;day++){
    const actual=await page.evaluate(day=>{
     const root=document.querySelector("#aoPray435930.open .aoN1Reader");
     const disclosure=root?.querySelector(".aoN1DayDisclosure");if(disclosure)disclosure.open=true;
     const b=disclosure?.querySelector("[data-n1-day='"+day+"']");
     if(!b)return{error:"Missing Holy Face day selector "+day};
     b.click();
     const stage=document.querySelector("#aoPray435930.open .aoN1Reader");
     const a=[...(stage?.querySelectorAll(".aoN1SourceText")||[])].find(x=>x.dataset.n1SourceLanguage==="en");
     return a?{day:window.AO_NOVENAS_V3.state().day,lang:a.lang,
      text:[...a.querySelectorAll(".aoN1PrayerParagraph")].map(p=>p.textContent).join("\n\n"),
      fallback:!!a.querySelector("[data-n1-proper-source-fallback]"),
      toggle:!!a.querySelector("[data-n1-show-en]")}: {error:"Holy Face original witness not found"};
    },day);
    assert.ok(!actual.error,actual.error);
    assert.equal(actual.day,day);
    assert.equal(actual.lang,"en");
    assert.equal(plain(actual.text),plain(FACE.days[day-1].text.en),"Holy Face day "+day+" truncated or overwritten");
    assert.equal(actual.fallback,ui==="fr","Holy Face French interface must disclose the missing translation");
    assert.equal(actual.toggle,false,"Holy Face must not offer a non-existent French-English proper toggle");
    mark(width,ui,"Holy Face", "full day "+day+" English proper"+(ui==="fr"?" with French notice":""));
   }

   // 3: Montfort's existing 33-day source-owned reader; exact litany row order.
   await open("pray.montfort_consecration",{returnContext:null});
   const mont="#aoPray435930.open [data-ao-montfort-b26-reader]";
   await page.locator(mont+" [data-p435930-montfort-phase='27']").evaluate(b=>b.click());
   assert.equal(await page.locator(mont+" [data-ao-montfort-day]").getAttribute("data-ao-montfort-day"),"27");
   for(const kind of ["holySpirit","holyName","augustine"]){
    const sel=mont+" [data-ao-montfort-b27-original='"+kind+"']";
    const actual=await page.locator(sel).evaluate((el,kind)=>{
     const selector=kind==="augustine"?"div[lang='en'] p.aoMontfortB26Original,div[lang='la'] p.aoMontfortB26Original":"p.aoMontfortB27Response,p.aoMontfortB27Collect";
     return {rows:[...el.querySelectorAll(selector)].map(p=>p.textContent||""),
      english:!!el.querySelector(kind==="augustine"?"div[lang='en']":"div.aoMontfortB27Litany[lang='en']"),
      status:el.querySelector(".aoMontfortB26Note")?.textContent||""};
    },kind);
    const src=montfortHistoricalPrayerRows(kind);
    assert.equal(actual.rows.length,src.length,"Montfort "+kind+" rows missing or duplicated");
    for(let i=0;i<src.length;i++){
     const expected=src[i];
     assert.ok(plain(actual.rows[i]).includes(plain(expected.leader)),kind+" row "+i+" leader differs");
     if(expected.response)assert.ok(plain(actual.rows[i]).includes(plain(expected.response)),kind+" row "+i+" response differs");
    }
    assert.ok(actual.english,"Montfort "+kind+" historic English witness no longer labelled");
    assert.match(actual.status,ui==="fr"?/historique anglais|traduction française/i:/historical English|French translation/i);
    mark(width,ui,"Montfort",kind+" complete historical rows");
   }
   for(let i=0;i<7;i++)await page.locator(mont+" [data-p435930-montfort-next]").evaluate(b=>b.click());
   assert.equal(await page.locator(mont+" [data-ao-montfort-day]").getAttribute("data-ao-montfort-day"),"34");
   const act=await page.locator(mont+" [data-ao-montfort-day='34']").evaluate(el=>[...el.querySelectorAll("p.aoMontfortB26Original[lang='en']")].map(x=>x.textContent||""));
   assert.deepEqual(act.map(plain),ACT.map(plain),"Montfort consecration act must remain full historical English text");
   mark(width,ui,"Montfort","complete English consecration act");

   // 4: Bedside companion explicitly separates pastoral action, aspiration and commendation.
   await open("pray.dying_companion",{returnContext:null});
   const dying="#aoPray435930.open";
   assert.equal(await page.locator(dying+" [data-ao-bedside-medical-warning]").count(),1);
   await page.locator(dying+" [data-tp381-dying='pray']").evaluate(b=>b.click());
   const asel=dying+" [data-ao-devo-card='dying-pray'] .aoTP381PrayerCard";
   const a=await cardBody(page,asel);
   assert.equal(a?.lang,ui,"Bedside aspiration vernacular language drift");
   assert.equal(plain(a?.text),plain(ASP[ui]),"Bedside three aspirations truncated");
   mark(width,ui,"Dying Companion","three Jesus-Mary-Joseph invocations");

   await page.locator(dying+" [data-tp381-dying='commend']").evaluate(b=>b.click());
   const csel=dying+" [data-ao-devo-card='dying-commend'] .aoTP381PrayerCard";
   const c=await cardBody(page,csel);
   assert.equal(c?.lang,ui);
   assert.equal(plain(c?.text),plain(COMMEND[ui]),"Commendation lost own complete "+ui+" text");
   const note=await page.locator(dying+" [data-ao-proficiscere-witness-status]").innerText();
   assert.match(note,ui==="fr"?/éditorial|1937|1962/i:/editorial|1937|1962/i);
   mark(width,ui,"Dying Companion","Proficiscere "+ui+" editorial reading");
   await page.locator(csel+" [data-tp381-latin-switch]").evaluate(b=>b.click());
   const latin=await cardBody(page,csel,true);
   assert.equal(latin?.lang,"la");
   assert.equal(latin?.hidden,false,"Latin prayer switch not visible");
   assert.equal(plain(latin?.text),plain(COMMEND.la),"Ritual Latin commendation mutated");
   mark(width,ui,"Dying Companion","Proficiscere 1937 Latin source toggle");

   assert.deepEqual(pageErrors,[],"Unexpected browser errors "+width+"/"+ui);
   report.contexts.push({width,ui,passed:true});
   console.log("PASS Stage 7 rendered source witnesses at "+width+"px / "+ui);
  }catch(e){report.errors.push({width,ui,message:String(e.stack||e)});throw e}
  finally{await ctx.close()}
 }
 assert.equal(report.checks.length,68,"Stage 7 expected 17 source-body checks x 4 contexts");
 assert.equal(report.errors.length,0);
 console.log("PASS Stage 7 "+report.checks.length+" exact rendered source checks (Golden Arrow, nine Holy Face propers, three Montfort B27 sources and act, two bedside prayers and Latin toggle); Stabat remains 13/20 partial.");
}finally{
 await writeFile(resolve(output,"rendered-source-witnesses.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
