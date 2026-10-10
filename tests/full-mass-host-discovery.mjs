import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css",".woff2":"font/woff2",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
 try{const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),path=resolve(root,"."+name);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const b=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(b);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>!!globalThis.AO_CELEBRATION_API?.openPreflight,null,{timeout:45000});
 const snapshot=await page.evaluate(()=>{
  const api=globalThis.AO_CELEBRATION_API,arch=globalThis.AO_CELEBRATION_ARCH_V1;
  try{api.openPreflight()}catch{}
  const container=document.getElementById("ao-mass-flow-v1");
  const all=(el)=>el?[...el.querySelectorAll("button,input,select,[role='button'],label,fieldset,summary")].map(node=>({
   tag:node.tagName,txt:node.textContent?.trim().slice(0,95),id:node.id,
   cls:String(node.className).slice(0,80),name:node.name,type:node.type,
   value:node.value,disabled:node.disabled||false,selected:node.checked||false,
   attrs:[...node.attributes].filter(a=>a.name.startsWith("data-")).map(a=>[a.name,a.value])
  })).slice(0,80):[];
  let mass=null;try{const m=api.getResolvedMass();mass={keys:Object.keys(m??{}),type:m?.celebrationType,id:m?.celebrationId,canStart:m?.canStart}}catch(e){mass={error:String(e)}}
  return {apiKeys:Object.keys(api),archKeys:Object.keys(arch||{}),mass,flowPresent:!!container,controls:all(container),
   flowMarkup:container?.outerHTML?.slice(0,17000)};
 });
 console.log("MASS_HOST_DISCOVERY "+JSON.stringify(snapshot));
 const change=await page.evaluate(()=>{
  const api=globalThis.AO_CELEBRATION_API;
  const fn={};for(const name of ["openChangeMass","select","reset","setVotiveBasis","setCondition"]){
   fn[name]=String(api[name]??"").slice(0,2000);
  }
  try{api.openChangeMass()}catch(e){return {error:String(e),functions:fn}}
  const root=document.querySelector("#ao-mass-flow-v1");
  const controls=[...(document.querySelectorAll("button,input,select,summary"))].filter(n=>
    n.closest("#ao-mass-flow-v1")||n.closest("[role=dialog]")).map(n=>({
      text:n.textContent?.trim().slice(0,120),tag:n.tagName,value:n.value,
      attrs:[...n.attributes].filter(x=>x.name.startsWith("data-")).map(x=>[x.name,x.value])
    })).slice(0,110);
  return {functions:fn,controls,flowMarkup:root?.outerHTML?.slice(0,30000),
   dialogs:[...document.querySelectorAll("[role=dialog]")].map(n=>({cls:n.className,id:n.id,html:n.outerHTML.slice(0,12000)})).slice(0,4)};
 });
 console.log("CHANGE_MASS_DISCOVERY "+JSON.stringify(change));
 console.log("CONSOLE_ERRORS "+JSON.stringify(errors.slice(0,4)));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
