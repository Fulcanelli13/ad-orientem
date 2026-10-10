import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
};
const server=http.createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+p);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4188,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"fr-FR",
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  await page.goto("http://127.0.0.1:4188/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true&&globalThis.AO_CALENDAR_APP_V1?.status?.().installed===true,null,{timeout:30000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  const fr=page.locator(".homeScreen [data-language='fr']");
  if(await fr.count())await fr.click();

  const dates=["2026-10-04","2026-10-05","2026-10-06","2026-10-07","2026-10-08","2026-10-09"];
  const results=[];
  for(const date of dates){
    const row=await page.evaluate(async date=>{
      const opened=globalThis.AO_CALENDAR_APP_V1?.open?.();
      if(opened===false)return{date,ok:false,reason:"CALENDAR_OPEN_FAILED"};
      const selected=await globalThis.AO_CALENDAR_APP_V1.select(date);
      const state=globalThis.AO_RUNTIME_V8?.store?.getState?.()??{};
      const resolution=state.resolution??null;
      const proper=resolution?.proper?.status==="ready"?resolution.proper.data:null;
      let reader=null,repaired=null;
      if(proper){
        const slots=await import("/src/mass/proper-reader-slots.js?field-current-week=1");
        const recovery=await import("/src/mass/reader-proper-runtime-recovery.js?field-current-week=1");
        repaired=await recovery.recoverReaderProperOmissions(proper,{
          hostResolver:globalThis.AO_RUNTIME_V8?.resolver?.properResolver,
        });
        reader=slots.properToReaderSlots(repaired,{language:"fr"});
      }
      return{
        date,selected,
        language:state.language??null,
        resolutionStatus:resolution?.status??null,
        properStatus:resolution?.proper?.status??null,
        sourcePath:proper?.sourcePath??null,
        hostMissing:{
          epistle:!proper?.epistle?.lat,
          secret:!(proper?.secrets?.length||proper?.secret?.lat),
          postcommunion:!(proper?.postcommunions?.length||proper?.postcommunion?.lat),
        },
        recovered:{
          epistle:Boolean(repaired?.epistle?.lat),
          secret:Boolean(repaired?.secrets?.length||repaired?.secret?.lat),
          postcommunion:Boolean(repaired?.postcommunions?.length||repaired?.postcommunion?.lat),
        },
        readerReady:reader?.ready??false,
        missing:reader?.missing??[],
        commemorationSources:(proper?.calendarCommemorations??[]).map(row=>({
          path:row?.path??null,prayerSourcePath:row?.prayerSourcePath??null,
        })),
        orationLanguages:Object.fromEntries([
          ["collects",repaired?.collects??[]],
          ["secrets",repaired?.secrets??[]],
          ["postcommunions",repaired?.postcommunions??[]],
        ].map(([key,rows])=>[key,rows.map(row=>({
          latin:Boolean(String(row?.lat??row?.la??"").trim()),
          en:Boolean(String(row?.en??"").trim()),fr:Boolean(String(row?.fr??"").trim()),
        }))])),
      };
    },date);
    results.push(row);
    assert.equal(row.selected,true,date+" could not be selected by the production Calendar owner");
    assert.equal(row.properStatus,"ready",date+" did not resolve a READY Proper: "+JSON.stringify(row));
    assert.equal(row.readerReady,true,date+" did not produce a complete R17 Proper: "+JSON.stringify(row));
  }

  assert.deepEqual(errors,[],"uncaught page errors during current-week field resolution: "+JSON.stringify(errors));
  console.log("field current-week source acceptance: PASS",JSON.stringify(results,null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
