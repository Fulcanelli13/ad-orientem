import assert from "node:assert/strict";
import http from "node:http";
import { readFile, readFileSync } from "node:fs";
import { readFile as load } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const manifest=JSON.parse(readFileSync(resolve(root,"data/presentation/startup-per-icon-report.v1.json"),"utf8"));
const oldBundles=new Set(manifest.icons.map(x=>"/ad-orientem/"+x.sourceBundle));
const newIcons=new Set(manifest.icons.map(x=>"/ad-orientem/"+x.path));
const requests=[];
const mime={".html":"text/html; charset=utf-8",".svg":"image/svg+xml",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".webp":"image/webp",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
  try{
    let urlPath=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    if(!urlPath.startsWith("/ad-orientem/")){res.writeHead(404);res.end("wrong prefix");return;}
    const path=urlPath.slice("/ad-orientem".length);
    const local=resolve(root,"."+path);
    if(local!==root&&!local.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await load(local);
    requests.push({path:urlPath,bytes:data.length});
    res.writeHead(200,{"content-type":mime[extname(local)]??"application/octet-stream","cache-control":"public, max-age=86400"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4194,"127.0.0.1",yes)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:430,height:844},deviceScaleFactor:1});
  await page.goto("http://127.0.0.1:4194/ad-orientem/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:20000});
  await page.waitForTimeout(400);
  const cold=requests.slice();
  assert.equal(cold.filter(x=>oldBundles.has(x.path)).length,0,"Home still requests a monolithic original SVG sprite");
  const symbols=manifest.icons.map(x=>({
    id:x.id,old:"./"+x.sourceBundle+"#"+x.id,
    path:x.path
  }));
  for(const sym of symbols){
    assert.equal(await page.locator('[id="'+sym.id+'"]').count(),1,"Original local ID missing: "+sym.id);
    await page.evaluate(({id,old})=>{
      document.getElementById("ao-pericon-qa")?.remove();
      const parent=document.getElementById(id);
      const baseline=document.createElementNS("http://www.w3.org/2000/svg","symbol");
      baseline.id="qa-original-"+id;
      baseline.setAttribute("viewBox",parent.getAttribute("viewBox")??"0 0 128 128");
      const use=document.createElementNS("http://www.w3.org/2000/svg","use");
      use.setAttribute("href",old);use.setAttribute("width","100%");use.setAttribute("height","100%");
      baseline.append(use);parent.parentElement.append(baseline);
      const host=document.createElement("div");host.id="ao-pericon-qa";
      host.style.cssText="position:fixed;z-index:2147483647;left:0;top:0;padding:8px;background:white;display:flex;gap:8px";
      for(const kind of ["new","old","blank"]){
        const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
        svg.setAttribute("width","128");svg.setAttribute("height","128");
        svg.setAttribute("viewBox",parent.getAttribute("viewBox")??"0 0 128 128");
        svg.setAttribute("data-probe",kind);svg.style.color="#123449";
        if(kind!=="blank"){
          const nested=document.createElementNS("http://www.w3.org/2000/svg","use");
          nested.setAttribute("href","#"+(kind==="new"?id:"qa-original-"+id));
          svg.append(nested);
        }
        host.append(svg);
      }
      document.body.append(host);
    },sym);
    await page.waitForTimeout(1000);
    const newer=await page.locator('[data-probe="new"]').screenshot();
    const older=await page.locator('[data-probe="old"]').screenshot();
    const blank=await page.locator('[data-probe="blank"]').screenshot();
    assert.notDeepEqual(newer,blank,"Individual icon renders blank: "+sym.id);
    assert.notDeepEqual(older,blank,"Original bundled icon rendered blank (likely not yet loaded): "+sym.id);
    if(!newer.equals(older)){
      const sameLengths=newer.length===older.length;
      const index=Math.min(newer.length,older.length,50);
      console.error("SVG_PARITY_DIAGNOSTIC="+JSON.stringify({
        icon:sym.id,newBytes:newer.length,oldBytes:older.length,sameLengths,
        probe:await page.evaluate(()=>[...document.querySelectorAll('[data-probe]')].map(n=>({kind:n.dataset.probe,box:JSON.stringify(n.getBoundingClientRect().toJSON())}))),
        newFirstBytes:[...newer.slice(0,index)],oldFirstBytes:[...older.slice(0,index)],
      }));
      throw Error("Refined icon pixel mismatch: "+sym.id);
    }
  }
  const data={
    coldRequests:cold.length,
    coldBytesServed:cold.reduce((n,x)=>n+x.bytes,0),
    coldOriginalBundleRequests:cold.filter(x=>oldBundles.has(x.path)).length,
    coldIndividualIconRequests:cold.filter(x=>newIcons.has(x.path)).length,
    totalIconsParityChecked:symbols.length,
  };
  console.log("PASS all 20 refined icon visuals identical to original sprite assets, including GitHub Pages project-prefix URLs.");
  console.log("ICON_LOAD_OBSERVATION="+JSON.stringify(data));
}finally{
  await browser?.close();
  await new Promise(yes=>server.close(yes));
}
