import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Diagnostic inventory, not a claim that each click has been functionally verified.
// Persist stable selectors, accessible labels and semantic problems for successive
// control-acceptance batches, rather than relying on screenshots or button counts.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2",".webp":"image/webp"};
const misses=new Map();
const server=http.createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+path);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(error){
    const path=new URL(req.url,"http://127.0.0.1").pathname;
    misses.set(path,(misses.get(path)||0)+1);
    res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));
  }
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4248,"127.0.0.1",ok)});
const views=[
  ["home",".homeScreen"],
  ["calendar","#ao-calendar-modular-root"],
  ["learn","#ao-learn-modular-root"],
  ["pray","#aoPray435930"],
  ["find","#ao-find-modular-root"],
  ["apostolate","#ao-apostolate-root"],
  ["settings","#ao-settings-modular-root"],
  ["mass","#ao-r17-native-reader"],
];
const report={schema:"ao.visible-controls.v1",date:"2026-10-09",viewport:390,surfaces:{},errors:[],missing:[]};
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"block"});
  page.on("pageerror",error=>report.errors.push(String(error?.message||error).slice(0,250)));
  await page.goto("http://127.0.0.1:4248/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:30000});
  async function capture(name,selector,transition){
    const data=await page.evaluate(({name,selector,transition})=>{
      const node=document.querySelector(selector);
      const active=globalThis.AO_APP_SHELL_V1?.getActive?.()||null;
      if(!node)return {name,selector,mounted:false,active,transition,controls:[]};
      const visible=el=>{
        if(el.closest("[hidden],[aria-hidden='true'],details:not([open])"))return false;
        const style=getComputedStyle(el),rect=el.getBoundingClientRect();
        return style.display!=="none"&&style.visibility!=="hidden"&&rect.width>0&&rect.height>0;
      };
      const controls=[...node.querySelectorAll("button,[role='button'],a[href],summary,input,select,textarea")]
        .filter(visible).map((el,i)=>{
          const label=(el.getAttribute("aria-label")||el.getAttribute("title")||el.labels?.[0]?.innerText||el.innerText||el.getAttribute("placeholder")||"").replace(/\s+/g," ").trim().slice(0,110);
          const actions=[...el.attributes].filter(a=>a.name.startsWith("data-")&&a.name!=="data-ao-asset-id")
            .map(a=>a.name+"="+a.value).slice(0,5);
          return {i,tag:el.tagName.toLowerCase(),label,disabled:el.disabled===true,role:el.getAttribute("role")||"",
            href:el.getAttribute("href")||"",actionKeys:actions,
            id:el.id||"",classes:String(el.className||"").split(/\s+/).slice(0,3).join(" ")};
        });
      return {name,selector,mounted:true,active,transition,controls,
        count:controls.length,
        unlabeled:controls.filter(x=>!x.label&&!["input","select","textarea"].includes(x.tag)).length,
        nonNavigableAnchors:controls.filter(x=>x.tag==="a"&&(!x.href||x.href==="#"||/^javascript:/i.test(x.href))).length};
    },{name,selector,transition});
    report.surfaces[name]=data;
    return data;
  }
  for(const [name,selector] of views){
    if(name!=="home"){
      const back=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
      assert.equal(back?.ok,true,"Cannot reset to Home before "+name);
    }
    let transition={ok:true};
    if(name!=="home"){
      transition=await page.evaluate(name=>globalThis.AO_APP_SHELL_V1?.navigate?.(name),name);
      assert.equal(transition?.ok,true,"Core route failed: "+name+" "+JSON.stringify(transition));
    }
    // Owners install synchronously after awaited shell navigation. The Mass
    // reader may mount a preparatory surface rather than its live focus root.
    const info=await capture(name,selector,{ok:Boolean(transition?.ok),reason:transition?.reason||null});
    if(!info.mounted)report.errors.push(name+": expected root not mounted ("+selector+")");
    if(name!=="mass")assert.ok(info.mounted&&info.count>0,
      "Visible route has no controls: "+name+" "+JSON.stringify(info));
  }
  await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
  const scripture=await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1?.open?.());
  assert.equal(scripture,true,"Actual Sacred Scripture overlay did not open from a cold Home return");
  const s=await capture("scripture","#ao-scripture-overlay",{ok:scripture,route:"home-overlay"});
  assert.ok(s.mounted&&s.count>0,"Scripture overlay has no usable controls");
  await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.close());
  report.missing=[...misses].map(([path,count])=>({path,count}));
  const destination=resolve(root,"artifacts/control-audit/visible-controls.v1.json");
  await mkdir(resolve(root,"artifacts/control-audit"),{recursive:true});
  await writeFile(destination,JSON.stringify(report,null,2)+"\n","utf8");
  console.log("CONTROL_INVENTORY="+JSON.stringify(Object.fromEntries(
    Object.entries(report.surfaces).map(([key,val])=>[key,{mounted:val.mounted,controls:val.count||0,
      unlabeled:val.unlabeled||0,nonNavigableAnchors:val.nonNavigableAnchors||0}]))));
  console.log("CONTROL_AUDIT_MISSES="+JSON.stringify(report.missing.slice(0,40)));
  console.log("PASS mounted cross-section control inventory written to artifacts/control-audit/visible-controls.v1.json (observational; click-by-click verification is separate)");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
