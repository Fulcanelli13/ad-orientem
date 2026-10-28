// Pinned production deployments immediately before/after PR #1854.
// Alternating paired cold-context Chromium runs; no application mutation.
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {chromium} from "@playwright/test";

const versions={
 before:{sha:"d9f1ec6b4d5211afdffb0e36c16b16eb3ee227ad",url:"https://ad-orientem-eki6ol8c0-andyfinette-2091.vercel.app/"},
 after:{sha:"331f02b74fde74a83b84f979fe731e24acb4e8c6",url:"https://ad-orientem-os2qht539-andyfinette-2091.vercel.app/"}
};
const devices=[{width:320,locale:"en-GB",height:844},{width:390,locale:"fr-FR",height:844},{width:1440,locale:"en-GB",height:960}];
for(const value of Object.values(versions)){
 const url=new URL(value.url);
 assert.equal(url.protocol,"https:");
 assert.ok(url.hostname.endsWith("-andyfinette-2091.vercel.app"));
}
const output=resolve("artifacts/explore-ab-performance");
await mkdir(output,{recursive:true});
const measurements=[],failed=[];
const median=values=>{
 const a=values.filter(Number.isFinite).sort((x,y)=>x-y);
 if(!a.length)return null;
 return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;
};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const d of devices)for(let trial=0;trial<3;trial++){
  for(const variant of (trial%2===0?["before","after"]:["after","before"])){
   const v=versions[variant],mobile=d.width<800,start=performance.now();
   const context=await browser.newContext({viewport:{width:d.width,height:d.height},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,locale:d.locale,
    reducedMotion:"reduce",serviceWorkers:"allow",permissions:[]});
   const page=await context.newPage();
   const m={width:d.width,locale:d.locale,trial:trial+1,variant,sha:v.sha,passed:false,
    ms:{},bytes:{total:0,scripture:0,rawGithub:0,firstParty:0,tiles:0,js:0},
    requests:{raw:0,scripture:0,fail:[],scriptureExamples:[]},errors:[]};
   const requests=new Set();
   page.on("pageerror",e=>m.errors.push(String(e.message||e).slice(0,200)));
   page.on("request",r=>requests.add(r));
   page.on("requestfailed",r=>requests.delete(r));
   page.on("requestfinished",r=>{
    if(!requests.has(r))return;
    requests.delete(r);
    void (async()=>{
     try{
      const u=new URL(r.url()),bytes=Math.max(0,(await r.sizes()).responseBodySize||0);
      const scripture=/\/data\/scripture\/|\/catena\/|\/formats\/json\/|VulgClementine|FreCrampon|Bible/i.test(u.pathname);
      const raw=u.hostname==="raw.githubusercontent.com";
      m.bytes.total+=bytes;
      if(u.hostname===new URL(v.url).hostname)m.bytes.firstParty+=bytes;
      if(u.hostname==="tiles.openfreemap.org")m.bytes.tiles+=bytes;
      if(r.resourceType()==="script")m.bytes.js+=bytes;
      if(scripture){m.bytes.scripture+=bytes;m.requests.scripture++}
      if(raw){m.bytes.rawGithub+=bytes;m.requests.raw++}
      if((scripture||raw)&&m.requests.scriptureExamples.length<12)
       m.requests.scriptureExamples.push({host:u.hostname,path:u.pathname.slice(0,150),bytes});
     }catch{}
    })();
   });
   page.on("response",r=>{
    if(r.status()>=400&&m.requests.fail.length<25){
     const u=new URL(r.url());
     m.requests.fail.push({status:r.status(),host:u.hostname,path:u.pathname.slice(0,145)});
    }
   });
   const mark=name=>m.ms[name]=Math.round(performance.now()-start);
   try{
    const response=await page.goto(v.url,{waitUntil:"domcontentloaded",timeout:90000});
    assert.equal(response?.status(),200,"Production HTML not 200");
    mark("document");
    const entry=page.locator('[data-ao-app-surface="find"]');
    await entry.waitFor({state:"visible",timeout:35000});
    await entry.click({timeout:15000});
    await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"
      &&Boolean(document.querySelector(".aoHeritageSurface")),null,{timeout:85000});
    mark("exploreData");
    await page.waitForFunction(()=>{
     const root=document.querySelector("#ao-find-modular-root");
     return globalThis.AO_FIND_APP_V1?.status?.().lens==="heritage"
      &&root?.querySelector("[data-find-map]")?.dataset?.aoMapState==="ready"
      &&Boolean(root.querySelector("canvas.maplibregl-canvas"));
    },null,{timeout:85000});
    mark("mapReady");
    // Allow ordinary background startup loads, without opening Scripture.
    await page.waitForTimeout(4500);
    mark("sampleEnd");
    await page.waitForTimeout(150);
    const geometry=await page.evaluate(()=>({
     overflow:document.documentElement.scrollWidth-innerWidth,
     swControlled:Boolean(navigator.serviceWorker?.controller)
    }));
    assert.ok(geometry.overflow<=1,"Horizontal page overflow");
    assert.equal(m.errors.length,0,"JS runtime error: "+m.errors.join("; "));
    m.geometry=geometry;m.passed=true;
    console.log("PASS A/B "+d.width+" "+d.locale+" trial "+(trial+1)+" "+variant+
     " map="+m.ms.mapReady+"ms scripture="+Math.round(m.bytes.scripture/1000)+
     "kB raw="+Math.round(m.bytes.rawGithub/1000)+"kB");
   }catch(e){
    m.error=String(e.stack||e).slice(0,2500);
    failed.push({width:d.width,trial:trial+1,variant,message:m.error});
    await page.screenshot({path:resolve(output,"failed-"+d.width+"-"+trial+"-"+variant+".png")}).catch(()=>{});
    console.error("FAIL "+d.width+" "+variant+" "+m.error);
   }finally{measurements.push(m);await context.close().catch(()=>{})}
  }
 }
}finally{await browser?.close().catch(()=>{})}
const summaries=devices.map(d=>{
 const stats={};
 for(const variant of ["before","after"]){
  const a=measurements.filter(x=>x.width===d.width&&x.variant===variant&&x.passed);
  const kb=field=>median(a.map(x=>Math.round(x.bytes[field]/1000)));
  stats[variant]={trials:a.length,mapMedianMs:median(a.map(x=>x.ms.mapReady)),
   exploreDataMedianMs:median(a.map(x=>x.ms.exploreData)),totalMedianKB:kb("total"),
   scriptureMedianKB:kb("scripture"),rawGithubMedianKB:kb("rawGithub"),
   firstPartyMedianKB:kb("firstParty"),jsMedianKB:kb("js"),
   failedResponseMedian:median(a.map(x=>x.requests.fail.length))};
 }
 const before=stats.before,after=stats.after;
 const delta=(a,b)=>a>0?Math.round((b-a)/a*1000)/10:null;
 return {width:d.width,locale:d.locale,before,after,deltaPct:{
  mapReady:delta(before.mapMedianMs,after.mapMedianMs),
  totalBytes:delta(before.totalMedianKB,after.totalMedianKB),
  scriptureBytes:delta(before.scriptureMedianKB,after.scriptureMedianKB),
  rawGithubBytes:delta(before.rawGithubMedianKB,after.rawGithubMedianKB)
 }};
});
const report={method:"3 paired alternating cold Chromium contexts per device; 4.5s sample after map ready",
 versions,devices,summary:summaries,measurements,failures:failed,completedAt:new Date().toISOString(),
 qualifications:["Same runner and immutable adjacent READY releases","No user demographics or latency SLA inference",
 "Network bytes are page request responseBodySize, not all service worker background traffic",
 "Service workers allowed; separate browser context per trial","No Scripture reader opened and no data mutated"]};
await writeFile(resolve(output,"comparison-results.json"),JSON.stringify(report,null,2)+"\n");
let markdown="# Explore Scripture deferral: paired production A/B\n\n";
markdown+="| Screen | Before map ms | After map ms | Map change | Before Scripture kB | After Scripture kB | Scripture change | Before raw GitHub kB | After raw GitHub kB |\n";
markdown+="|---|---:|---:|---:|---:|---:|---:|---:|---:|\n";
for(const r of summaries)markdown+="| "+r.width+"px "+r.locale+" | "+r.before.mapMedianMs+" | "+r.after.mapMedianMs+
 " | "+r.deltaPct.mapReady+"% | "+r.before.scriptureMedianKB+" | "+r.after.scriptureMedianKB+
 " | "+r.deltaPct.scriptureBytes+"% | "+r.before.rawGithubMedianKB+" | "+r.after.rawGithubMedianKB+" |\n";
markdown+="\nThree cold trials per deployment per screen, alternated A/B then B/A then A/B. Medians describe these runs only.\n";
await writeFile(resolve(output,"comparison-summary.md"),markdown);
console.log("AB_SUMMARY "+JSON.stringify(summaries));
assert.equal(failed.length,0,"At least one production trial failed; inspect artifact");
