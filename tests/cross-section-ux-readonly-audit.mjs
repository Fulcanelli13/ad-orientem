import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const hits=[],failed=[];
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,"http://127.0.0.1");
 let pathname=decodeURIComponent(u.pathname);
 if(pathname==="/")pathname="/index.html";
 try{
  const f=resolve(root,"."+pathname);
  if(f!==root&&!f.startsWith(root+sep))throw Object.assign(Error("forbidden"),{code:"FORBIDDEN"});
  const data=await readFile(f);
  hits.push({path:pathname,size:data.length});
  res.writeHead(200,{"content-type":MIME[extname(f)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){
  failed.push({path:pathname,code:e.code});
  res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message));
 }
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4231,"127.0.0.1",yes)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:4231/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:35000});
 const routes=["home","calendar","learn","pray","find","settings","scripture","apostolate"];
 const out=[];
 for(const route of routes){
  let state;
  try{
   const start=Date.now();
   const nav=route==="home"?{ok:true}:await page.evaluate(x=>globalThis.AO_APP_SHELL_V1.navigate(x),route);
   await page.waitForTimeout(350);
   state={nav,ms:Date.now()-start};
  }catch(e){state={error:String(e)}}
  const data=await page.evaluate(route=>{
   const idMap={home:".homeScreen",calendar:"#ao-calendar-modular-root",learn:"#ao-learn-modular-root",pray:"#aoPray435930",find:"#ao-find-modular-root",settings:"#ao-settings-modular-root",scripture:"#ao-scripture-modular-root",apostolate:"#ao-apostolate-modular-root"};
   const base=document.querySelector(idMap[route]);
   const visible=el=>{const c=getComputedStyle(el),r=el.getBoundingClientRect();return c.display!=="none"&&c.visibility!=="hidden"&&r.width>0&&r.height>0};
   const inspect=node=>{
    const controls=[...node.querySelectorAll("button,[role=button],input[type=button],input[type=submit],select,a[href]")].filter(visible);
    const names=controls.map(e=>{
      const label=(e.getAttribute("aria-label")||e.getAttribute("title")||e.innerText||e.textContent||"").replace(/\s+/g," ").trim().slice(0,65);
      const style=getComputedStyle(e);
      const dataset=Object.entries(e.dataset||{}).filter(([k])=>/^(cal|ao|settings|p435930|learn|find|explore|action)/i.test(k)).slice(0,4);
      return {tag:e.tagName,label,disabled:e.disabled||e.getAttribute("aria-disabled")==="true",font:style.fontFamily,px:style.fontSize,minHeight:Math.round(e.getBoundingClientRect().height),data:Object.fromEntries(dataset),href:e.getAttribute("href")?.slice(0,90)};
    });
    const fontsize=(sel)=>{const x=node.querySelector(sel);return x?{font:getComputedStyle(x).fontFamily,size:getComputedStyle(x).fontSize}:null};
    return {count:names.length,disabled:names.filter(x=>x.disabled),unlabeled:names.filter(x=>!x.label),shortControls:names.filter(x=>x.minHeight<32&&!x.disabled).slice(0,12),sample:names.slice(0,30),fonts:{heading:fontsize("h1,h2,h3"),text:fontsize("p,.aoCalV2Intro,.aoLearnModIntro,.aoP435930Body"),button:fontsize("button")}};
   };
   return {rootPresent:!!base,rootVisible:!!base&&visible(base),content:base?inspect(base):null,bodyFont:getComputedStyle(document.body).fontFamily,headings:[...document.querySelectorAll("h1,h2,h3")].filter(visible).slice(0,12).map(x=>({text:x.textContent?.trim().slice(0,30),font:getComputedStyle(x).fontFamily,size:getComputedStyle(x).fontSize}))};
  },route);
  out.push({route,...state,...data});
 }
 const simpleActions=[
 ["calendar","button[data-cal-view=year]"],
 ["calendar","button[data-cal-view=picker]"],
 ["calendar","button[data-cal-month-view=major]"],
 ["calendar","button[data-cal-view=day]"],
 ["learn","button[data-ao-learn-family]"],
 ["find","button[data-find-lens]"],
 ["settings","button[data-settings-route]"]
 ];
 const actions=[];
 for(const [route,selector] of simpleActions){
  try{
   const nav=await page.evaluate(x=>globalThis.AO_APP_SHELL_V1.navigate(x),route);
   if(!nav?.ok){actions.push({route,selector,nav});continue}
   const n=page.locator(selector).first();
   if(!await n.count()){actions.push({route,selector,status:"missing"});continue}
   const previous=await page.evaluate(()=>({active:document.querySelector("#ao-calendar-modular-root")?.innerText?.slice(0,150),title:document.title}));
   await n.click({timeout:2500});await page.waitForTimeout(300);
   const current=await page.evaluate(()=>({active:document.querySelector("#ao-calendar-modular-root")?.innerText?.slice(0,150),title:document.title}));
   actions.push({route,selector,status:"clicked",sameFirst150:previous.active===current.active});
  }catch(e){actions.push({route,selector,status:"failed",error:String(e).slice(0,260)})}
 }
 console.log("UX_AUDIT="+JSON.stringify({routes:out,actions,browserErrors:errors.slice(0,40),resource404s:failed.filter(x=>x.code==="ENOENT").slice(0,45),resourceCount:hits.length}));
 await page.close();
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
