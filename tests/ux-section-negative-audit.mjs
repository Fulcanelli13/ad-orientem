import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const misses=new Map(),requests=[];
const server=http.createServer(async(req,res)=>{
 try{
  let path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const name=resolve(root,"."+path);
  if(name!==root&&!name.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(name);
  requests.push({path,bytes:data.length});
  res.writeHead(200,{"content-type":mime[extname(name)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){const path=new URL(req.url,"http://127.0.0.1").pathname;misses.set(path,(misses.get(path)||0)+1);res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4222,"127.0.0.1",yes)});
const report={date:"2026-10-09",sections:{},findings:[],consoleErrors:[],missing:[]};
let browser;
const brief=str=>String(str||"").replace(/\s+/g," ").trim().slice(0,130);
const rootFor={home:".homeScreen",calendar:"#ao-calendar-modular-root",learn:"#ao-learn-modular-root",pray:"#aoPray435930",find:"#ao-find-modular-root",apostolate:"#ao-apostolate-root",scripture:"#ao-scripture-modular-root",settings:"#ao-settings-modular-root",mass:"#ao-r17-native-reader"};
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const page=await context.newPage();
 page.on("pageerror",err=>report.consoleErrors.push(brief(err.message)));
 page.on("console",m=>{if(m.type()==="error")report.consoleErrors.push(brief(m.text()))});
 await page.goto("http://127.0.0.1:4222/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:25000});
 const snapshot=async(rootSel)=>{
  return page.evaluate(sel=>{
   const r=document.querySelector(sel);
   if(!r)return {mounted:false,active:globalThis.AO_APP_SHELL_V1?.getActive?.()};
   const visible=el=>!!(el.getClientRects().length)&&getComputedStyle(el).visibility!=="hidden";
   const buttons=[...r.querySelectorAll("button,[role=button]")].filter(visible);
   const links=[...r.querySelectorAll("a[href]")].filter(visible);
   const headings=[...r.querySelectorAll("h1,h2,h3")].filter(visible).slice(0,14);
   const styles=[r,...headings,...[...r.querySelectorAll("p,blockquote,.aoCalV2RingCore strong")].filter(visible).slice(0,10)]
      .map(el=>({name:el.tagName.toLowerCase(),selector:el.className?.toString?.().slice(0,48),family:getComputedStyle(el).fontFamily,size:getComputedStyle(el).fontSize,weight:getComputedStyle(el).fontWeight}));
   const invalid=buttons.filter(el=>!String(el.innerText||"").trim()&&!el.getAttribute("aria-label")&&!el.getAttribute("title"));
   return {
    mounted:true,active:globalThis.AO_APP_SHELL_V1?.getActive?.(),
    buttons:buttons.length,disabled:buttons.filter(x=>x.disabled).length,
    buttonSamples:buttons.slice(0,55).map(el=>({label:(el.getAttribute("aria-label")||el.innerText||"").replace(/\s+/g," ").trim().slice(0,60),
      disabled:el.disabled,data:[...el.attributes].filter(a=>a.name.startsWith("data-")).map(a=>a.name+"="+a.value).slice(0,3)})),
    unlabeledButtons:invalid.slice(0,8).map(x=>x.outerHTML.slice(0,160)),
    anchors:links.length,placeholderAnchors:links.filter(a=>a.href.endsWith("#")||a.href.startsWith("javascript:")).length,
    sourceAnchors:links.filter(a=>/source|citation|ref|provenance|authority|lien|texte/i.test(a.className?.toString?.()||"")||/vatican|missale|newadvent|archive\.org|divinum|fsspx\.org/i.test(a.href)).length,
    headings:headings.map(x=>x.innerText?.slice(0,100)),
    styles
   };
  },rootSel);
 };
 for(const route of ["home","calendar","learn","pray","settings","find","apostolate","scripture","mass"]){
  const start=Date.now();
  try{
   await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
   await page.waitForTimeout(80);
   const result=route==="home"?{ok:true}:await page.evaluate(route=>globalThis.AO_APP_SHELL_V1.navigate(route),route);
   const selector=rootFor[route];
   if(selector)await page.waitForSelector(selector,{state:"visible",timeout:11000}).catch(()=>null);
   await page.waitForTimeout(240);
   report.sections[route]={navigate:result,elapsedMs:Date.now()-start,...await snapshot(selector)};
   if(route==="calendar" && report.sections[route].mounted){
    let old=await page.evaluate(()=>({g:typeof globalThis.AO_GLOSSARY_V1,root:!!document.querySelector("#ao-glossary-root"),cal:globalThis.AO_CALENDAR_APP_V1?.status?.()}));
    await page.locator("#ao-calendar-modular-root [data-cal-glossary]").click({timeout:6000}).catch(e=>report.findings.push({category:"button",route,control:"glossary",error:brief(e.message)}));
    await page.waitForTimeout(750);
    let current=await page.evaluate(()=>({g:typeof globalThis.AO_GLOSSARY_V1,root:!!document.querySelector("#ao-glossary-root"),cal:globalThis.AO_CALENDAR_APP_V1?.status?.()}));
    report.sections.calendar.glossaryProbe={old,current};
    if(!current.root&&!current.cal?.donorPanelActive){
     report.findings.push({severity:"high",category:"button",route:"calendar",control:"Terms and definitions",finding:"Click produces no Glossary window on fresh boot",before:old,after:current});
    }
    await page.locator("#ao-calendar-modular-root [data-cal-view='year']").click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(100);
    report.sections.calendar.yearView=await snapshot(selector);
    await page.locator("#ao-calendar-modular-root [data-cal-view='picker']").click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(180);
    report.sections.calendar.monthView=await snapshot(selector);
   }
   if(route==="learn"&&report.sections[route].mounted){
    for(const id of ["learn.sexual_ethics","learn.spiritual_life"]){
      try{
       let ok=await page.evaluate(id=>globalThis.AO_LEARN_APP_V1.openModule(id),id);
       await page.waitForTimeout(180);
       const selector=id==="learn.sexual_ethics"?"#ao-sexual-ethics-root":"#ao-spiritual-life-root";
       report.sections[id]={opened:ok,...await snapshot(selector),otherRoots:await page.evaluate(()=>[...document.querySelectorAll("[id*=sexual],[id*=spiritual]")].slice(0,12).map(x=>x.id))};
      }catch(error){report.findings.push({category:"module",route:id,error:brief(error?.message)})}
      await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn")).catch(()=>{});
    }
   }
  }catch(error){report.sections[route]={error:brief(error.message),elapsedMs:Date.now()-start};report.findings.push({severity:"medium",category:"routing",route,error:brief(error.message)})}
 }
 report.missing=[...misses].sort((a,b)=>b[1]-a[1]).slice(0,30);
 console.log("UX_AUDIT_REPORT="+JSON.stringify(report));
}finally{await browser?.close();await new Promise(r=>server.close(r))}
