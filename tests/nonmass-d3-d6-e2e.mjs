import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
};

const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const candidate=resolve(repoRoot,"."+pathname);
    if(candidate!==repoRoot && !candidate.startsWith(repoRoot+sep)){
      res.writeHead(403);res.end("forbidden");return;
    }
    const data=await readFile(candidate);
    res.writeHead(200,{"content-type":mime[extname(candidate)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4176,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
  });
  const page=await context.newPage();
  const pageErrors=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));

  await page.goto("http://127.0.0.1:4176/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.status?.().d6==="compatibility-integrated" &&
    typeof globalThis.AO_V37_SHELL?.openDomain==="function",
    null,{timeout:30000}
  );

  const boot=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
    saved.adoration={...(saved.adoration||{}),presence:"exposed"};
    saved.firstFriday={...(saved.firstFriday||{}),records:[{date:"2026-10-02",complete:true}]};
    localStorage.setItem("ao.pray.v435930",JSON.stringify(saved));
    globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.reconcile?.();
    const normalized=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
    return {
      status:globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.status?.()??null,
      persistentPresence:normalized?.adoration?.presence??null,
      firstFriday:normalized?.firstFriday?.records?.[0]?.complete??null,
    };
  });
  assert.equal(boot.status?.d3,"compatibility-integrated");
  assert.equal(boot.status?.d4,"compatibility-integrated");
  assert.equal(boot.status?.d5,"compatibility-integrated");
  assert.equal(boot.status?.d6,"compatibility-integrated");
  assert.equal(boot.persistentPresence,null,"D3 left exposed/reserved state in persistent PRAY storage");
  assert.equal(boot.firstFriday,true,"D3 persistence scrub damaged unrelated programme state");

  const openedPray=await page.evaluate(()=>
    globalThis.AO_V37_SHELL?.openDomain?.("pray")!==false
  );
  await page.waitForFunction(()=>
    typeof globalThis.AO_PRAY_V435930?.open==="function",
    null,{timeout:30000}
  );
  assert.equal(
    await page.evaluate(()=>globalThis.AO_PRAY_V435930?.version??null),
    "43.59.30-pray-acceptance",
    "unexpected PRAY donor version"
  );
  assert.equal(openedPray,true,"could not open canonical PRAY domain");
  await page.waitForSelector("#aoPray435930.open .aoP435930Home",{timeout:15000});
  await page.locator("#aoPray435930 [data-p435930-own='pray.adoration']").click();
  await page.waitForSelector("#aoPray435930.open .aoP435930BigGrid",{timeout:15000});
  await page.waitForTimeout(100);

  const adorationHome=await page.evaluate(()=>({
    visit:Boolean(document.querySelector("#aoPray435930 [data-p435930-ador-mode='visit']")),
    adoration:Boolean(document.querySelector("#aoPray435930 [data-p435930-ador-mode='open']")),
    benediction:Boolean(document.querySelector("#aoPray435930 [data-p435930-go-ben]")),
    treasury:Boolean(document.querySelector("#aoPray435930 [data-p435930-ador-mode='treasury']")),
    holyTop:Boolean(document.querySelector("#aoPray435930 [data-p435930-ador-mode='holy']")),
    fourTop:Boolean(document.querySelector("#aoPray435930 [data-p435930-ador-mode='four']")),
  }));
  assert.deepEqual(adorationHome,{
    visit:true,adoration:true,benediction:true,treasury:true,holyTop:false,fourTop:false,
  },"D3 top-level Adoration contract regressed");

  await page.locator("#aoPray435930 [data-p435930-ador-mode='open']").click();
  await page.waitForSelector("#aoPray435930 [data-p435930-ador-mode='holy']",{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-four]").count(),1,"Four Ends lost guided nesting");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='holy']").count(),1,"Holy Hour is not nested under Adoration");

  await page.locator("#aoPray435930 [data-p435930-seg='exposed']").click();
  await page.waitForTimeout(100);
  const presence=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
    return {
      session:sessionStorage.getItem("ao.app.adoration.presence.v1"),
      persistent:saved?.adoration?.presence??null,
    };
  });
  assert.equal(presence.session,"exposed");
  assert.equal(presence.persistent,null,"exposition state leaked back into persistent storage");

  await page.evaluate(()=>globalThis.AO_PRAY_V435930?.close?.({silent:true}));
  const reopenedPray=await page.evaluate(()=>
    globalThis.AO_V37_SHELL?.openDomain?.("pray")!==false
  );
  assert.equal(reopenedPray,true,"could not reopen canonical PRAY domain");
  await page.waitForSelector("#aoPray435930.open .aoP435930Home",{timeout:10000});
  await page.locator("#aoPray435930 [data-p435930-own='pray.confession']").click();
  await page.waitForSelector("#aoPray435930.open .aoD5PhaseRail",{timeout:10000});
  assert.equal(await page.locator("#aoPray435930 .aoD5PhaseRail span").count(),5,"D5 did not expose five canonical phases");
  assert.equal(await page.locator("#aoPray435930 .aoP435930StageRail:visible").count(),0,"old seven-step rail remained visible");

  await page.locator("#aoPray435930 [data-p435930-conf-next]").click();
  await page.locator("#aoPray435930 [data-p435930-conf-next]").click();
  await page.waitForSelector("#aoPray435930 .aoP435930Exam",{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 .aoP435930Exam input").count(),0,"Confession still exposes temporary sin checkboxes");
  assert.ok(await page.locator("#aoPray435930 .aoD5ExamPrompt").count()>0,"read-only examination prompts were not rendered");
  const examText=await page.locator("#aoPray435930 .aoP435930Body").innerText();
  assert.doesNotMatch(examText,/prompt\(s\) marked|question\(s\) marquée/i,"marked-prompt score remains visible");

  await page.evaluate(()=>globalThis.AO_PRAY_V435930?.close?.({silent:true}));
  await page.evaluate(()=>globalThis.AO_SETTINGS_V4359?.open?.("/settings/about-sources"));
  await page.waitForSelector("#ao-settings-v4359 .aoD6Sources",{timeout:10000});
  const about=await page.evaluate(()=>({
    text:document.querySelector("#ao-settings-v4359 .aoSetWrap")?.innerText??"",
    version:globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.canonicalAppVersion?.()??null,
    settingsVersion:globalThis.AO_SETTINGS_V4359?.version??null,
  }));
  assert.match(about.text,/Liturgical books & 1962 basis|Livres liturgiques et base 1962/);
  assert.match(about.text,/Prayer & devotional methods|Prières et méthodes dévotionnelles/);
  assert.equal(about.version,"43.59.30","D6 did not use canonical application release authority");
  assert.notEqual(about.version,about.settingsVersion,"About is still displaying the Settings component version as the app version");
  assert.match(about.text,/43\.59\.30/);

  assert.deepEqual(pageErrors,[],"D3-D6 assembled-app page errors: "+JSON.stringify(pageErrors));
  await context.close();
  console.log("PASS D3-D6 assembled-app phone convergence");
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
