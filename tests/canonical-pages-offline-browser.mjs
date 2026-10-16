/** Fresh isolated mobile/desktop browser investigation of deployed offline update. */
import {chromium} from "@playwright/test";
import {mkdirSync,writeFileSync} from "node:fs";
const origin="https://fulcanelli13.github.io/ad-orientem/";
const rows=[],time=new Date().toISOString();
mkdirSync("test-output/canonical-pages-parity",{recursive:true});
const browser=await chromium.launch({headless:true});
for(const device of [{name:"phone",width:390,height:844,mobile:true},{name:"desktop",width:1280,height:900,mobile:false}]){
 const context=await browser.newContext({viewport:{width:device.width,height:device.height},
  isMobile:device.mobile,hasTouch:device.mobile,deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",error=>errors.push(String(error?.message||error).slice(0,400)));
 const row={device:device.name,steps:[],errors};
 try{
  const response=await page.goto(origin+"?ao_offline_runtime_probe="+device.name,
   {waitUntil:"domcontentloaded",timeout:45000});
  row.http=response?.status()??null;
  const snapshot=async label=>page.evaluate(label=>({
   label,time:new Date().toISOString(),title:document.title,
   offline:globalThis.AO_OFFLINE_APP_V1?.status??null,
   controlled:Boolean(navigator.serviceWorker?.controller),
   activeRegistration:null,
   updatePrompt:Boolean(document.getElementById("ao-offline-update-ready")),
   shellVisible:globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner??null
  }),label);
  try{await page.waitForFunction(()=>Boolean(globalThis.AO_OFFLINE_APP_V1?.status?.registered),
   null,{timeout:35000});}catch{}
  row.steps.push(await snapshot("after-register"));
  // Let transactional staging complete; the UI is deliberately not forced
  // to promote new versions during active Mass sessions.
  try{await page.waitForFunction(()=>{
   const s=globalThis.AO_OFFLINE_APP_V1?.status;
   return Boolean(s?.ready||s?.error);
  },null,{timeout:100000});}catch{}
  row.steps.push(await snapshot("after-first-stage"));
  await page.reload({waitUntil:"domcontentloaded",timeout:45000});
  await page.waitForTimeout(3500);
  row.steps.push(await snapshot("after-reload"));
  row.serviceWorkerState=await page.evaluate(async()=>{
   if(!("serviceWorker" in navigator))return null;
   const reg=await navigator.serviceWorker.getRegistration();
   return {active:reg?.active?.state||null,waiting:reg?.waiting?.state||null,
    scope:reg?.scope||null,controller:!!navigator.serviceWorker.controller};
  });
 }catch(error){row.error=String(error?.message||error);}
 rows.push(row);
 console.log("CANONICAL_OFFLINE_BROWSER",JSON.stringify(row));
 await context.close();
}
await browser.close();
const report={schema:"AO_CANONICAL_OFFLINE_FRESH_BROWSER_V1",origin,checkedAt:time,rows,
 warning:"Fresh anonymous browser state does not prove or alter an existing user's pinned offline snapshot."};
writeFileSync("test-output/canonical-pages-parity/offline-browser.json",
 JSON.stringify(report,null,2)+"\n");
