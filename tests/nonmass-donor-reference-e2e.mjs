import assert from "node:assert/strict";
import http from "node:http";
import os from "node:os";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

const DONOR_COMMIT="7a613721d5caee0500588c759c90864e4041e7a2";
const DONOR_LABEL="v43.59.30 verbatim extraction snapshot";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance/donor-current-v435930");
await mkdir(out,{recursive:true});
const donorRoot=await mkdtemp(resolve(os.tmpdir(),"ao-donor-v435930-"));

function extractDonor(){
  const archive=spawnSync("git",["archive","--format=tar",DONOR_COMMIT],{cwd:root,encoding:null,maxBuffer:512*1024*1024});
  assert.equal(archive.status,0,"Unable to read frozen v43.59.30 donor commit. The visual workflow must checkout full git history.\n"+String(archive.stderr||""));
  const untar=spawnSync("tar",["-x","-C",donorRoot],{input:archive.stdout,encoding:null,maxBuffer:512*1024*1024});
  assert.equal(untar.status,0,"Unable to extract frozen v43.59.30 donor tree.\n"+String(untar.stderr||""));
}
extractDonor();

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
function makeServer(base){
  return http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,"http://127.0.0.1");
      const pathname=url.pathname==="/" ? "/index.html" : decodeURIComponent(url.pathname);
      const file=resolve(base,"."+pathname);
      if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403);res.end("forbidden");return}
      const data=await readFile(file);
      res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});res.end(data);
    }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
  });
}
async function listen(server,port){await new Promise((ok,fail)=>{server.once("error",fail);server.listen(port,"127.0.0.1",ok)});return "http://127.0.0.1:"+port;}

const currentServer=makeServer(root),donorServer=makeServer(donorRoot);
const currentBase=await listen(currentServer,4191),donorBase=await listen(donorServer,4192);

let browser;
try{
  browser=await chromium.launch({headless:true});
  const options={viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB",serviceWorkers:"block"};
  const donorContext=await browser.newContext(options),currentContext=await browser.newContext(options);
  const donor=await donorContext.newPage(),current=await currentContext.newPage(),currentErrors=[];
  current.on("pageerror",error=>currentErrors.push(String(error?.message??error)));

  await Promise.all([
    donor.goto(donorBase+"/index.html",{waitUntil:"domcontentloaded",timeout:90000}),
    current.goto(currentBase+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000}),
  ]);
  await current.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:30000});
  await current.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await donor.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  await donor.waitForSelector(".homeScreen",{state:"visible",timeout:30000});

  const currentHead=spawnSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).stdout.trim();
  const manifest={schema:"ao-direct-donor-current-capture-v2",donorCommit:DONOR_COMMIT,donorLabel:DONOR_LABEL,currentCommit:currentHead,viewport:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},pairs:[]};

  async function geometry(page,kind){
    return page.evaluate(kind=>{
      const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),width:+r.width.toFixed(1),height:+r.height.toFixed(1)}};
      const visible=el=>Boolean(el&&!el.hidden&&getComputedStyle(el).display!=="none"&&getComputedStyle(el).visibility!=="hidden");
      if(kind==="home"){const x=document.querySelector(".homeScreen");return {root:rect(x),hero:rect(x?.querySelector(".celebrationBlock")),gospel:rect(x?.querySelector(".gospelCard")),background:x?getComputedStyle(x).backgroundColor:null};}
      if(kind==="pray"){const root=document.getElementById("aoPray435930"),mount=root?.querySelector(".aoP435930Mount");return {root:rect(root),mount:rect(mount),head:rect(mount?.querySelector(".aoP435930Head")),body:rect(mount?.querySelector(".aoP435930Body")),firstCard:rect(mount?.querySelector(".aoP435930ModuleCard,.aoP435930PrayerUnit,.aoP435930Prayer,.aoP435930BigGrid button")),view:mount?.dataset?.aoPrayView??null,readerContract:mount?.dataset?.aoReaderContract??null};}
      if(kind==="settings"){const root=[document.getElementById("ao-settings-modular-root"),document.getElementById("ao-settings-v4359"),document.getElementById("ao-settings-v4358"),document.getElementById("ao-settings-v4356"),document.getElementById("ao-v37-root")].find(visible);return {root:rect(root),head:rect(root?.querySelector(".aoSetTop,.aoSettingsTop,.aoV4359Top,.aoV37Top")),body:rect(root?.querySelector(".aoSetWrap,.aoSettingsBody,.aoV4359Wrap,.aoV37Wrap")),route:root?.dataset?.aoSettingsRoute??document.documentElement.dataset.aoSettingsRoute??null};}
      if(kind==="learn"){const root=[document.getElementById("ao-learn-modular-root"),document.getElementById("ao-v37-root"),document.getElementById("ao-learn-root")].find(visible);return {root:rect(root),hero:rect(root?.querySelector(".aoLearnModHero,.aoLearnHero,.aoV37Hero")),firstCard:rect(root?.querySelector("button,.aoLearnModCard,.aoV37Card"))};}
      if(kind==="calendar"){const root=[document.getElementById("ao-calendar-modular-root"),document.getElementById("ao-v25-panel")].find(visible);return {root:rect(root),hero:rect(root?.querySelector(".aoCalSacredTime,.aoCal48Hero,.aoV25Hero")),week:rect(root?.querySelector(".aoCalModRail,.aoCal48Week,.aoV25CalendarWeek"))};}
      if(kind==="cinema"){const t=document.getElementById("ao-cinema-transition"),l=document.getElementById("ao-cinema-loader");return {transition:rect(t),transitionOn:Boolean(t?.classList.contains("aoCinemaTransitionOn")),loader:rect(l),loaderOn:Boolean(l?.classList.contains("aoCinemaLoaderOn")),loaderKind:l?.dataset?.kind??null};}
      return {viewport:{width:innerWidth,height:innerHeight}};
    },kind);
  }
  async function capturePair(id,kind="pray"){
    const donorName=id+"-donor.png",currentName=id+"-current.png";
    await Promise.all([donor.screenshot({path:resolve(out,donorName),fullPage:false}),current.screenshot({path:resolve(out,currentName),fullPage:false})]);
    manifest.pairs.push({id,donor:donorName,current:currentName,donorGeometry:await geometry(donor,kind),currentGeometry:await geometry(current,kind)});
  }
  async function openPray(id){
    await Promise.all([
      donor.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),id),
      current.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),id),
    ]);
    const view={ "pray.hub":"home","pray.angelus_regina":"angelus","pray.stations":"stations","pray.adoration":"adoration","pray.benediction":"benediction","pray.confession":"confession","pray.rosary":"rosary","pray.library":"library"}[id];
    if(view)await Promise.all([
      donor.waitForFunction(v=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView===v,view,{timeout:10000}),
      current.waitForFunction(v=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView===v,view,{timeout:10000}),
    ]);
  }

  await Promise.all([donor.waitForTimeout(1600),current.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:8000}).catch(()=>{})]);
  await capturePair("01-home","home");

  await openPray("pray.hub"); await capturePair("02-pray-hub");
  await openPray("pray.angelus_regina"); await capturePair("03-angelus");
  await openPray("pray.stations"); await capturePair("04-stations");

  for(const page of [donor,current]){
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null}));
    await page.waitForSelector("#aoPray435930.open [data-p435930-lib-open='sacrament_act_of_contrition']",{timeout:10000});
    await page.locator("#aoPray435930 [data-p435930-lib-open='sacrament_act_of_contrition']").click();
    await page.waitForSelector("#aoPray435930 .aoP435930Prayer",{timeout:5000});
  }
  await capturePair("05-prayer-reader");

  await openPray("pray.rosary"); await capturePair("06-rosary-launcher");
  await openPray("pray.adoration"); await capturePair("07-adoration");
  await openPray("pray.benediction"); await capturePair("08-benediction");
  await openPray("pray.confession"); await capturePair("09-confession");

  for(const page of [donor,current])await page.evaluate(()=>globalThis.AO_PRAY_V435930?.close?.({silent:true}));
  await Promise.all([
    donor.evaluate(async()=>{
      const api=[globalThis.AO_SETTINGS_V4359,globalThis.AO_SETTINGS_V4358,globalThis.AO_SETTINGS_V4356].find(x=>typeof x?.open==="function");
      if(api)return await api.open("/settings");
      if(typeof globalThis.AO_V37_SHELL?.openModule==="function")return await globalThis.AO_V37_SHELL.openModule("utility.settings");
      const button=document.querySelector('[data-ao-ribbon="settings"],[data-v37-open="utility.settings"],[data-home-open-settings]');
      button?.click?.();return Boolean(button);
    }),
    current.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.open?.("/settings")),
  ]);
  await Promise.all([
    donor.waitForFunction(()=>[document.getElementById("ao-settings-v4359"),document.getElementById("ao-settings-v4358"),document.getElementById("ao-settings-v4356"),document.getElementById("ao-v37-root")].some(n=>n&&!n.hidden&&getComputedStyle(n).display!=="none"),null,{timeout:10000}),
    current.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000}),
  ]);
  await capturePair("10-settings","settings");

  await Promise.all([
    donor.evaluate(()=>{
      const api=[globalThis.AO_SETTINGS_V4359,globalThis.AO_SETTINGS_V4358,globalThis.AO_SETTINGS_V4356].find(x=>typeof x?.dismiss==="function"||typeof x?.close==="function");
      try{api?.dismiss?.();}catch{}try{api?.close?.();}catch{}try{globalThis.AO_V37_SHELL?.close?.();}catch{}return true;
    }),
    current.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.dismiss?.()),
  ]);
  await Promise.all([
    donor.evaluate(()=>globalThis.AO_V37_SHELL?.openDomain?.("learn")),
    current.evaluate(()=>globalThis.AO_LEARN_APP_V1?.open?.()),
  ]);
  await Promise.all([
    donor.waitForSelector("#ao-v37-root",{state:"visible",timeout:10000}),
    current.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000}),
  ]);
  await capturePair("11-learn","learn");

  await Promise.all([
    donor.evaluate(()=>globalThis.AO_V37_SHELL?.close?.()),
    current.evaluate(()=>globalThis.AO_LEARN_APP_V1?.close?.()),
  ]);
  await Promise.all([
    donor.evaluate(()=>globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.open?.()),
    current.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.open?.()),
  ]);
  await Promise.all([
    donor.waitForSelector("#ao-v25-panel",{state:"visible",timeout:20000}),
    current.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:20000}),
  ]);
  await Promise.all([donor.waitForTimeout(800),current.waitForTimeout(800)]);
  await capturePair("12-calendar","calendar");

  await Promise.all([
    donor.evaluate(()=>globalThis.AO_CINEMATIC_V4312?.showTransition?.({kicker:"STATIONS OF THE CROSS",title:"Station II",hold:5000})),
    current.evaluate(()=>globalThis.AO_CINEMATIC_V4312?.showTransition?.({kicker:"STATIONS OF THE CROSS",title:"Station II",hold:5000})),
  ]);
  await Promise.all([
    donor.waitForSelector("#ao-cinema-transition.aoCinemaTransitionOn",{state:"visible",timeout:3000}),
    current.waitForSelector("#ao-cinema-transition.aoCinemaTransitionOn",{state:"visible",timeout:3000}),
  ]);
  await capturePair("13-semantic-transition","cinema");

  const selected=await current.evaluate(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate);
  await Promise.all([
    donor.evaluate(id=>{globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.invalidate?.(id);void globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.retryWeek?.(id)},selected),
    current.evaluate(id=>{globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.invalidate?.(id);void globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.retryWeek?.(id)},selected),
  ]);
  await Promise.all([
    donor.waitForSelector("#ao-cinema-loader.aoCinemaLoaderOn",{state:"visible",timeout:3000}).catch(()=>{}),
    current.waitForSelector("#ao-cinema-loader.aoCinemaLoaderOn",{state:"visible",timeout:3000}).catch(()=>{}),
  ]);
  const loaderStates=await Promise.all([donor,current].map(page=>page.evaluate(()=>Boolean(document.getElementById("ao-cinema-loader")?.classList.contains("aoCinemaLoaderOn")))));
  if(loaderStates.every(Boolean))await capturePair("14-calendar-week-loader","cinema");

  assert.equal(currentErrors.length,0,"Current app threw errors during donor/current capture: "+currentErrors.join(" | "));

  await writeFile(resolve(out,"comparison-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
  const cards=manifest.pairs.map(p=>`<section><h2>${p.id}</h2><div class="pair"><figure><figcaption>${DONOR_LABEL} · ${DONOR_COMMIT.slice(0,8)}</figcaption><img src="${p.donor}"></figure><figure><figcaption>Current · ${currentHead.slice(0,8)}</figcaption><img src="${p.current}"></figure></div><details><summary>Measured geometry</summary><pre>${JSON.stringify({donor:p.donorGeometry,current:p.currentGeometry},null,2).replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre></details></section>`).join("");
  await writeFile(resolve(out,"comparison.html"),`<!doctype html><meta charset="utf-8"><title>Ad Orientem donor/current visual comparison</title><style>body{margin:0;background:#0a0d12;color:#eee;font:14px system-ui;padding:24px}section{max-width:900px;margin:0 auto 40px;padding-bottom:28px;border-bottom:1px solid #333}h1,h2{font-family:Georgia,serif}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0}figcaption{margin:0 0 8px;color:#c9b47d}img{display:block;width:100%;max-width:390px;border:1px solid #333;background:#000}pre{white-space:pre-wrap;color:#bbb}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Frozen donor vs current · 390×844</h1><p>Donor authority: ${DONOR_LABEL} at <code>${DONOR_COMMIT}</code>. Current: <code>${currentHead}</code>.</p>${cards}`);
  console.log("PASS direct frozen-donor/current capture generated",manifest.pairs.length,"pairs at",out);
} finally {
  await browser?.close().catch(()=>{});
  await new Promise(ok=>currentServer.close(ok));
  await new Promise(ok=>donorServer.close(ok));
  await rm(donorRoot,{recursive:true,force:true}).catch(()=>{});
}
