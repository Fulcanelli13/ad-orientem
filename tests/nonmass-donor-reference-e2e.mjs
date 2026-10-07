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
const primarySources=JSON.parse(await readFile(resolve(root,"data/presentation/nonmass-primary-donor-sources.v1.json"),"utf8"));
const sourceById=Object.fromEntries(primarySources.sources.map(x=>[x.id,x]));
assert.equal(sourceById.PRAY_UNIFIED_READER_CLOSURE.repositoryCommit,DONOR_COMMIT,"frozen Git donor commit drifted from primary-source manifest");
assert.equal(sourceById.V3_4_10_PRESENTATION_AND_TRADITION.sha256,"952b34432ec73f2b0ec111f6b64b22f648160b99bf1aead246c6b3abf3e5d283");
assert.equal(sourceById.N3_GUIDED_NOVENAS.sha256,"105f765d0227b937c58781416cf461c7b950b50427704b81478b4deaeeaadf10");
assert.equal(sourceById.V3_4_14_ROSARY_FINAL.availability,"APPROVED_PRIMARY_BYTES_MISSING");
assert.equal(sourceById.NON_MASS_HEAD_V3_22.availability,"APPROVED_PRIMARY_BYTES_MISSING");
const out=resolve(root,"artifacts/visual-acceptance/donor-current-v435930");
await mkdir(out,{recursive:true});
const donorRoot=await mkdtemp(resolve(os.tmpdir(),"ao-donor-v435930-"));

function extractDonor(){
  const archive=spawnSync("git",["archive","--format=tar",DONOR_COMMIT],{
    cwd:root,
    encoding:null,
    maxBuffer:512*1024*1024,
  });
  assert.equal(archive.status,0,"Unable to read frozen v43.59.30 donor commit. The visual workflow must checkout full git history.\n"+String(archive.stderr||""));
  const untar=spawnSync("tar",["-x","-C",donorRoot],{
    input:archive.stdout,
    encoding:null,
    maxBuffer:512*1024*1024,
  });
  assert.equal(untar.status,0,"Unable to extract frozen v43.59.30 donor tree.\n"+String(untar.stderr||""));
}
extractDonor();

const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",
};
function makeServer(base){
  return http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,"http://127.0.0.1");
      const pathname=url.pathname==="/" ? "/index.html" : decodeURIComponent(url.pathname);
      const file=resolve(base,"."+pathname);
      if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403);res.end("forbidden");return}
      const data=await readFile(file);
      res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
      res.end(data);
    }catch(error){
      res.writeHead(error?.code==="ENOENT"?404:500);
      res.end(String(error?.message??error));
    }
  });
}
async function listen(server,port){
  await new Promise((ok,fail)=>{server.once("error",fail);server.listen(port,"127.0.0.1",ok)});
  return "http://127.0.0.1:"+port;
}

const currentServer=makeServer(root),donorServer=makeServer(donorRoot);
const currentBase=await listen(currentServer,4191);
const donorBase=await listen(donorServer,4192);

let browser;
try{
  browser=await chromium.launch({headless:true});
  const options={viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB",serviceWorkers:"block"};
  const donorContext=await browser.newContext(options);
  const currentContext=await browser.newContext(options);
  const donor=await donorContext.newPage();
  const current=await currentContext.newPage();
  const currentErrors=[];
  current.on("pageerror",error=>currentErrors.push(String(error?.message??error)));

  await Promise.all([
    donor.goto(donorBase+"/index.html",{waitUntil:"domcontentloaded",timeout:90000}),
    current.goto(currentBase+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000}),
  ]);
  await current.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:30000});
  await current.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await donor.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  await donor.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await Promise.all([
    donor.waitForTimeout(1600),
    current.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:8000}).catch(()=>{}),
  ]);

  const currentHead=spawnSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).stdout.trim();
  const manifest={
    schema:"ao-direct-donor-current-capture-v1",
    donorCommit:DONOR_COMMIT,
    donorLabel:DONOR_LABEL,
    currentCommit:currentHead,
    viewport:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},
    pairs:[],
    primarySources:primarySources.sources,
    currentCaptureCoverage:primarySources.currentCaptureCoverage,
    certification:primarySources.certification,
  };

  async function geometry(page,kind){
    return page.evaluate(kind=>{
      const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),width:+r.width.toFixed(1),height:+r.height.toFixed(1)}};
      if(kind==="home"){
        const home=document.querySelector(".homeScreen");
        return {
          home:rect(home),
          hero:rect(home?.querySelector(".celebrationBlock")),
          gospel:rect(home?.querySelector(".gospelCard")),
          background:home?getComputedStyle(home).backgroundColor:null,
        };
      }
      const root=document.getElementById("aoPray435930"),mount=root?.querySelector(".aoP435930Mount");
      return {
        root:rect(root),
        mount:rect(mount),
        head:rect(mount?.querySelector(".aoP435930Head")),
        body:rect(mount?.querySelector(".aoP435930Body")),
        firstCard:rect(mount?.querySelector(".aoP435930ModuleCard,.aoP435930PrayerUnit,.aoP435930Prayer")),
        view:mount?.dataset?.aoPrayView??null,
        readerContract:mount?.dataset?.aoReaderContract??null,
      };
    },kind);
  }

  async function capturePair(id,kind="pray"){
    const donorName=id+"-donor.png",currentName=id+"-current.png";
    await donor.screenshot({path:resolve(out,donorName),fullPage:false});
    await current.screenshot({path:resolve(out,currentName),fullPage:false});
    manifest.pairs.push({
      id,
      donor:donorName,
      current:currentName,
      donorGeometry:await geometry(donor,kind),
      currentGeometry:await geometry(current,kind),
    });
  }

  await capturePair("01-home","home");

  await donor.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
  await current.locator("[data-ao-app-surface='pray']").click();
  await Promise.all([
    donor.waitForSelector("#aoPray435930.open .aoP435930Home",{timeout:10000}),
    current.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000}),
  ]);
  await capturePair("02-pray-hub");

  await Promise.all([
    donor.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null})),
    current.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null})),
  ]);
  await Promise.all([
    donor.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="angelus",null,{timeout:5000}),
    current.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="angelus",null,{timeout:5000}),
  ]);
  await capturePair("03-angelus");

  await Promise.all([
    donor.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations",{returnContext:null})),
    current.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations",{returnContext:null})),
  ]);
  await Promise.all([
    donor.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="stations",null,{timeout:5000}),
    current.waitForFunction(()=>document.querySelector("#aoPray435930 .aoP435930Mount")?.dataset?.aoPrayView==="stations",null,{timeout:5000}),
  ]);
  await capturePair("04-stations");

  for(const page of [donor,current]){
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null}));
    await page.waitForSelector("#aoPray435930.open [data-p435930-lib-open='sacrament_act_of_contrition']",{timeout:10000});
    await page.locator("#aoPray435930 [data-p435930-lib-open='sacrament_act_of_contrition']").click();
    await page.waitForSelector("#aoPray435930 .aoP435930Prayer",{timeout:5000});
  }
  await capturePair("05-prayer-reader");

  assert.equal(currentErrors.length,0,"Current app threw errors during donor/current capture: "+currentErrors.join(" | "));

  await writeFile(resolve(out,"comparison-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
  const cards=manifest.pairs.map(p=>`<section><h2>${p.id}</h2><div class="pair"><figure><figcaption>${DONOR_LABEL} · ${DONOR_COMMIT.slice(0,8)}</figcaption><img src="${p.donor}"></figure><figure><figcaption>Current · ${currentHead.slice(0,8)}</figcaption><img src="${p.current}"></figure></div><details><summary>Measured geometry</summary><pre>${JSON.stringify({donor:p.donorGeometry,current:p.currentGeometry},null,2).replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre></details></section>`).join("");
  const later=[
    ["06-rosary-final","V3_4_14_ROSARY_FINAL","../03d-pray-rosary-live-rail.png","../03c-pray-rosary-mystery-cinematic.png"],
    ["07-adoration","V3_4_10_PRESENTATION_AND_TRADITION","../03e-pray-adoration-arrival.png","../03f-pray-adoration-silence.png"],
    ["08-benediction","V3_4_10_PRESENTATION_AND_TRADITION","../03g-pray-benediction-blessing.png",null],
    ["09-confession","V3_4_10_PRESENTATION_AND_TRADITION","../03h-pray-confession-in-confessional.png",null],
    ["10-novenas","N3_GUIDED_NOVENAS","../03f-pray-novenas.png",null],
    ["11-morning-evening","V3_4_10_PRESENTATION_AND_TRADITION","../03g-pray-morning-evening.png",null],
    ["12-sacred-hymns","V3_4_10_PRESENTATION_AND_TRADITION","../03h-pray-sacred-hymns.png",null],
    ["13-holy-name","V3_4_10_PRESENTATION_AND_TRADITION","../03i-pray-holy-name.png",null],
    ["14-learn","NON_MASS_HEAD_V3_22","../04-learn.png","../04a-learn-serious-illness.png"],
    ["15-calendar-v384","NON_MASS_HEAD_V3_22","../04f2-calendar-v384-christ-king-october.png","../04h-calendar-v384-discipline-1962.png"],
    ["16-settings","NON_MASS_HEAD_V3_22","../05-settings.png","../05b-settings-sources.png"],
  ];
  for(const [id,,currentImage,secondary] of later){
    const primaryBytes=await readFile(resolve(out,currentImage));
    assert.ok(primaryBytes.byteLength>0,id+" current regression capture is missing from the visual artifact");
    if(secondary){
      const secondaryBytes=await readFile(resolve(out,secondary));
      assert.ok(secondaryBytes.byteLength>0,id+" secondary current regression capture is missing from the visual artifact");
    }
  }
  const evidenceCards=later.map(([id,sourceId,currentImage,secondary])=>{
    const s=sourceById[sourceId]||{};
    const hash=s.sha256?`<code>${s.sha256}</code>`:"<em>primary bytes unavailable</em>";
    const second=secondary?`<img src="${secondary}">`:"";
    return `<section><h2>${id}</h2><div class="pair"><figure class="evidence"><figcaption>Primary authority · ${sourceId}</figcaption><div class="missing"><strong>${s.filename||sourceId}</strong><p>Status: <code>${s.availability||"UNKNOWN"}</code></p><p>${hash}</p><p>${s.note||""}</p></div></figure><figure><figcaption>Current regression capture · ${currentHead.slice(0,8)}</figcaption><img src="${currentImage}">${second}</figure></div></section>`;
  }).join("");
  await writeFile(resolve(out,"comparison.html"),`<!doctype html><meta charset="utf-8"><title>Ad Orientem donor/current visual comparison</title><style>body{margin:0;background:#0a0d12;color:#eee;font:14px system-ui;padding:24px}section{max-width:900px;margin:0 auto 40px;padding-bottom:28px;border-bottom:1px solid #333}h1,h2{font-family:Georgia,serif}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0}figcaption{margin:0 0 8px;color:#c9b47d}img{display:block;width:100%;max-width:390px;border:1px solid #333;background:#000}pre{white-space:pre-wrap;color:#bbb}.missing{min-height:420px;border:1px dashed #665f4d;padding:18px;background:#11161e;color:#c8c2b4}.missing strong{display:block;color:#e8dcc0;font-family:Georgia,serif;font-size:18px}.missing code{overflow-wrap:anywhere}.evidence{max-width:390px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Frozen donor vs current · 390×844</h1><p>Donor authority: ${DONOR_LABEL} at <code>${DONOR_COMMIT}</code>. Current: <code>${currentHead}</code>.</p>${cards}${evidenceCards}`);
  console.log("PASS direct frozen-donor/current capture generated at",out);
} finally {
  await browser?.close().catch(()=>{});
  await new Promise(ok=>currentServer.close(ok));
  await new Promise(ok=>donorServer.close(ok));
  await rm(donorRoot,{recursive:true,force:true}).catch(()=>{});
}
