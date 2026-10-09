import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html",".js":"text/javascript",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(done=>server.listen(4299,"127.0.0.1",done));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[],consoleErrors=[];
 page.on("pageerror",e=>errors.push(String(e.stack||e)));
 page.on("console",msg=>{if(msg.type()==="error")consoleErrors.push(msg.text())});
 await page.goto("http://127.0.0.1:4299/index.html",{waitUntil:"commit",timeout:10000}).catch(e=>console.log("BOOT_HTTP_ERROR",String(e)));
 await page.waitForTimeout(3500);
 const details=await Promise.race([page.evaluate(()=>({
  scriptReady:document.readyState,
  appShell:typeof globalThis.AO_APP_SHELL_V1,
  shellStatus:globalThis.AO_APP_SHELL_V1?.status?.(),
  navOwner:typeof globalThis.AO_NAV_V362,
  donorOwner:typeof globalThis.AO_V37_SHELL,
  ribbon:document.querySelector("#ao-global-ribbon")?.outerHTML?.slice(0,2400),
  state:document.documentElement.dataset.aoAppShellBridge,
  homePresent:!!document.querySelector(".homeScreen"),
  bodyChildren:document.body?.children?.length
 })),new Promise(resolve=>setTimeout(()=>resolve({error:"BROWSER_MAIN_THREAD_STALLED"}),5000))]);
 console.log(JSON.stringify({details,errors:errors.slice(0,8),consoleErrors:consoleErrors.slice(0,8)},null,2));
 if(!details.shellStatus?.visibleOwner)process.exitCode=1;
}finally{await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,1500))]);server.close();process.exit(process.exitCode||0)}
