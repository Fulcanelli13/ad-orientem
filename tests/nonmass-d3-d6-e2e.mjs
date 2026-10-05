import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const candidate=resolve(repoRoot,"."+pathname);
    if(candidate!==repoRoot&&!candidate.startsWith(repoRoot+sep)){res.writeHead(403);res.end("forbidden");return}
    const data=await readFile(candidate);
    res.writeHead(200,{"content-type":mime[extname(candidate)]??"application/octet-stream","cache-control":"no-store"});res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4176,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const pageErrors=[];page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  await page.goto("http://127.0.0.1:4176/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.status?.().d6==="integrated-on-settings" &&
    typeof globalThis.AO_PRAY_V435930?.open==="function" &&
    typeof globalThis.AO_PRAY_APP_V1?.open==="function",
    null,{timeout:30000}
  );

  const boot=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
    saved.adoration={...(saved.adoration||{}),presence:"exposed"};
    saved.firstFriday={...(saved.firstFriday||{}),records:[{date:"2026-10-02",complete:true}]};
    localStorage.setItem("ao.pray.v435930",JSON.stringify(saved));
    globalThis.AO_NON_MASS_D3_D6_CONVERGENCE.reconcile();
    const normalized=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
    return {
      status:globalThis.AO_NON_MASS_D3_D6_CONVERGENCE.status(),
      persistentPresence:normalized?.adoration?.presence??null,
      firstFriday:normalized?.firstFriday?.records?.[0]?.complete??null,
    };
  });
  assert.equal(boot.status.prayDomainOwner,"modular-pray-v1");
  assert.equal(boot.status.presentationOwner,"AO_PRAY_V435930");
  assert.equal(boot.status.d3,"integrated-on-modular-pray");
  assert.equal(boot.status.d4,"integrated-on-modular-pray");
  assert.equal(boot.status.d5,"integrated-on-modular-pray");
  assert.equal(boot.persistentPresence,null);
  assert.equal(boot.firstFriday,true);

  assert.notEqual((await page.evaluate(async()=>globalThis.AO_APP_SHELL_V1?.navigate?.("pray")))?.ok,false);
  await page.waitForSelector("#aoPray435930.open",{timeout:15000});
  const owner=await page.evaluate(()=>({
    route:document.documentElement.dataset.aoPrayRouteOwner??null,
    visible:document.getElementById("aoPray435930")?.dataset?.aoPrayOwner??null,
  }));
  assert.equal(owner.route,"modular-pray-v1");
  assert.equal(owner.visible,"modular-pray-v1");

  await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null}));
  await page.waitForSelector("#aoPray435930.open [data-p435930-ador-mode='visit']",{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='visit']").count(),1);
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='open']").count(),1);
  assert.equal(await page.locator("#aoPray435930 [data-p435930-go-ben]").count(),1);
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='treasury']").count(),1);
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='holy']").count(),0,"Holy Hour leaked into D3 top level");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='four']").count(),0,"Four Ends leaked into D3 top level");

  await page.locator("#aoPray435930 [data-p435930-ador-mode='open']").click();
  await page.waitForSelector("#aoPray435930 [data-p435930-ador-mode='holy']",{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-four]").count(),1,"Four Ends is not nested under Adoration");
  await page.locator("#aoPray435930 [data-p435930-seg='exposed']").click();
  const presence=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
    return {session:sessionStorage.getItem("ao.app.adoration.presence.v1"),persistent:saved?.adoration?.presence??null,state:globalThis.AO_PRAY_V435930.state().adorationPresence};
  });
  assert.deepEqual(presence,{session:"exposed",persistent:null,state:"exposed"});

  await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null}));
  await page.waitForSelector("#aoPray435930 [data-p435930-conf-step='0']",{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-step]").count(),5,"D5 does not expose exactly five canonical phases");
  assert.doesNotMatch(await page.locator("#aoPray435930").innerText(),/\b\d+\s*\/\s*8\b/);
  await page.locator("#aoPray435930 [data-p435930-conf-next]").click();
  await page.locator("#aoPray435930 [data-p435930-conf-next]").click();
  await page.waitForSelector("#aoPray435930 .aoP435930ExamReadOnly details",{timeout:5000});
  assert.ok(await page.locator("#aoPray435930 .aoP435930ExamReadOnly details").count()>=10);
  assert.equal(await page.locator("#aoPray435930 .aoP435930ExamReadOnly input").count(),0,"D5 examination still contains tickable controls");
  const examText=await page.locator("#aoPray435930").innerText();
  assert.match(examText,/nothing.*selected.*scored.*saved|rien.*sélectionné.*noté.*enregistré/i);
  assert.doesNotMatch(examText,/prompt\(s\) marked|question\(s\) marquée/i);

  await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.benediction",{returnContext:null}));
  await page.waitForSelector("#aoPray435930 .aoP435930BenMacroRail",{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 .aoP435930BenMacroRail span").count(),4,"D4 does not expose four macro service phases");
  assert.equal(await page.locator("#aoPray435930 .aoP435930BenMacroRail span.active").count(),1);

  await page.evaluate(async()=>{globalThis.AO_PRAY_V435930.close({silent:true});await globalThis.AO_APP_SHELL_V1?.navigate?.("settings")});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings",null,{timeout:10000});
  await page.evaluate(()=>globalThis.AO_SETTINGS_V4359?.open?.("/settings/about-sources"));
  await page.waitForSelector("#ao-settings-v4359 .aoD6Sources",{timeout:10000});
  const about=await page.evaluate(()=>({
    text:document.querySelector("#ao-settings-v4359 .aoSetWrap")?.innerText??"",
    version:globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.canonicalAppVersion?.()??null,
    settingsVersion:globalThis.AO_SETTINGS_V4359?.version??null,
  }));
  assert.match(about.text,/Liturgical books & 1962 basis|Livres liturgiques et base 1962/);
  assert.match(about.text,/Prayer & devotional methods|Prières et méthodes dévotionnelles/);
  assert.ok(about.version);
  assert.notEqual(about.version,about.settingsVersion);
  assert.ok(about.text.includes(String(about.version)));

  assert.deepEqual(pageErrors,[],"D3-D6 assembled-app page errors: "+JSON.stringify(pageErrors));
  await context.close();
  console.log("PASS D3-D6 modular PRAY + Settings phone convergence");
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
