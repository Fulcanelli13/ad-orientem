import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+p);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4183,"127.0.0.1",ok)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto("http://127.0.0.1:4183/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForTimeout(1800);
  const report=await page.evaluate(()=>{
    const obj=globalThis.AO_EMERGENCY_STABLE_V4333??null;
    const describe=(value,depth=0)=>{
      if(value==null)return value;
      if(typeof value==="function")return {type:"function",name:value.name||null,length:value.length};
      if(typeof value!=="object")return value;
      if(depth>=2)return {type:Array.isArray(value)?"array":"object",keys:Object.keys(value).slice(0,80)};
      const out={};
      for(const key of Object.keys(value).slice(0,120)){
        try{out[key]=describe(value[key],depth+1)}catch{out[key]="<throws>"}
      }
      return out;
    };
    return {
      emergencyPresent:Boolean(obj),
      emergency:describe(obj),
      scripts:[...document.scripts].map(s=>s.src).filter(Boolean).filter(src=>/browser-entry\.js/.test(src)),
      shell:{
        app:globalThis.AO_APP_SHELL_V1?.status?.()??null,
        mass:globalThis.AO_R17_BROWSER_ENTRY?.status?.()??null,
      },
      globals:Object.keys(globalThis).filter(k=>/EMERGENCY|LOCK|LIVE|SESSION|RESUME/i.test(k)).sort().slice(0,200),
    };
  });
  console.log("EMERGENCY_RUNTIME_DISCOVERY "+JSON.stringify(report,null,2));
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
