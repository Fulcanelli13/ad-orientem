import http from "node:http";import {readFile} from "node:fs/promises";import {extname,resolve,sep} from "node:path";import {fileURLToPath} from "node:url";import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url))),types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css",".json":"application/json"};
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname),path=resolve(root,"."+name);if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end()}const d=await readFile(path);res.writeHead(200,{"content-type":types[extname(path)]||"application/octet-stream"});res.end(d)}catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>!!globalThis.AO_CELEBRATION_API?.openChangeMass,null,{timeout:45000});
 const snapshot=async()=>await page.evaluate(()=>{
  const root=document.getElementById("ao-mass-flow-v1"),scope=root?.querySelector(".aoMassFlowBody"),arch=globalThis.AO_CELEBRATION_ARCH_V1;
  const ctl=scope?[...scope.querySelectorAll("button,input,select,summary,option")].map(x=>({tag:x.tagName,text:x.textContent?.trim().slice(0,140),value:x.value,disabled:x.disabled,attrs:[...x.attributes].filter(a=>a.name.startsWith("data-")).map(a=>a.name+"="+a.value)})).slice(0,90):[];
  let res=null;try{const m=globalThis.AO_CELEBRATION_API.getResolvedMass();res={id:m.celebrationId,type:m.celebrationType,canStart:m.canStart,source:m.properSource,date:m.date}}catch(e){res={err:e.message}}
  return {stage:arch?.stage,history:arch?.history,selected:arch?.actualCelebration,head:root?.querySelector(".aoMassFlowTop")?.textContent?.trim().slice(0,130),texts:scope?.innerText?.slice(0,1700),controls:ctl,res};
 });
 const pick=async(selector)=>await page.evaluate(sel=>{const el=document.querySelector("#ao-mass-flow-v1 "+sel);if(!el)return false;el.click();return true},selector);
 for(const type of ["votive","requiem","nuptial","other"]){
  await page.evaluate(()=>globalThis.AO_CELEBRATION_API.openChangeMass());
  const entered=await pick('[data-ao-open="'+type+'"]');
  console.log("MASS_CATALOG_"+type+"_ENTER "+entered+" "+JSON.stringify(await snapshot()));
  const step=await page.evaluate(()=>[...document.querySelectorAll("#ao-mass-flow-v1 .aoFlowBody button,#ao-mass-flow-v1 .aoMassFlowBody button")].filter(x=>x.hasAttribute("data-ao-select")||x.hasAttribute("data-ao-open")||x.hasAttribute("data-ao-requiem")||x.hasAttribute("data-ao-choice")).map(x=>({text:x.textContent?.trim().slice(0,80),data:[...x.attributes].filter(a=>a.name.startsWith("data-")).map(a=>[a.name,a.value])})).slice(0,15));
  for(const candidate of step.slice(0,2)){
   await page.evaluate(()=>globalThis.AO_CELEBRATION_API.openChangeMass());await pick('[data-ao-open="'+type+'"]');
   const sel=candidate.data[0];
   const clicked=await page.evaluate(([name,value])=>{
    const el=[...document.querySelectorAll("#ao-mass-flow-v1 button")].find(x=>x.getAttribute(name)===value);
    if(!el)return false;el.click();return true;
   },sel);
   console.log("MASS_CATALOG_"+type+"_CHOICE "+JSON.stringify({candidate,clicked,snapshot:await snapshot()}));
  }
 }
 console.log("MASS_API_SIG "+JSON.stringify(await page.evaluate(()=>({
  select:String(globalThis.AO_CELEBRATION_API.select).slice(0,3500),
  getRubricState:String(globalThis.AO_CELEBRATION_API.getRubricState).slice(0,2000)
 }))));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
