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
    globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.status?.().d6==="integrated-on-settings" &&
    typeof globalThis.AO_V37_SHELL?.openDomain==="function" &&
    typeof globalThis.AOTraditionalPrayerBook?.openModule==="function",
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
  assert.equal(boot.status?.d3,"integrated-on-current-owner");
  assert.equal(boot.status?.d4,"integrated-on-current-owner");
  assert.equal(boot.status?.d5,"integrated-on-current-owner");
  assert.equal(boot.status?.d6,"integrated-on-settings");
  assert.equal(boot.status?.prayDomainOwner,"AO_V37_SHELL");
  assert.equal(boot.persistentPresence,null,"D3 left exposed/reserved state in persistent PRAY storage");
  assert.equal(boot.firstFriday,true,"D3 persistence scrub damaged unrelated programme state");

  const openedPray=await page.evaluate(async()=>
    (await globalThis.AO_APP_SHELL_V1?.navigate?.("pray"))?.ok!==false
  );
  assert.equal(openedPray,true,"could not open canonical PRAY domain through app shell");
  await page.waitForSelector("#ao-v37-root:not([hidden]) [data-v37-open='pray.adoration']",{timeout:15000});

  await page.locator("#ao-v37-root [data-v37-open='pray.adoration']").first().click();
  await page.waitForSelector("#ao-d3-adoration.open",{timeout:10000});
  const adorationHome=await page.evaluate(()=>({
    visit:Boolean(document.querySelector("#ao-d3-adoration [data-ao-d3-mode='visit']")),
    adoration:Boolean(document.querySelector("#ao-d3-adoration [data-ao-d3-mode='adoration']")),
    benediction:Boolean(document.querySelector("#ao-d3-adoration [data-ao-d3-mode='benediction']")),
    treasury:Boolean(document.querySelector("#ao-d3-adoration [data-ao-d3-mode='treasury']")),
    holyTop:Boolean(document.querySelector("#ao-d3-adoration [data-ao-d3-mode='holy']")),
    fourTop:Boolean(document.querySelector("#ao-d3-adoration [data-ao-d3-mode='four']")),
  }));
  assert.deepEqual(adorationHome,{
    visit:true,adoration:true,benediction:true,treasury:true,holyTop:false,fourTop:false,
  },"D3 top-level Adoration contract regressed");

  await page.locator("#ao-d3-adoration [data-ao-d3-mode='adoration']").click();
  await page.waitForSelector("#ao-d3-adoration [data-ao-d3-method='holy']",{timeout:5000});
  assert.equal(await page.locator("#ao-d3-adoration [data-ao-d3-method='four']").count(),1,"Four Ends lost guided nesting");
  assert.equal(await page.locator("#ao-d3-adoration [data-ao-d3-method='holy']").count(),1,"Holy Hour is not nested under Adoration");

  await page.locator("#ao-d3-adoration [data-ao-d3-presence='exposed']").click();
  await page.waitForTimeout(50);
  const presence=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
    return {
      session:sessionStorage.getItem("ao.app.adoration.presence.v1"),
      persistent:saved?.adoration?.presence??null,
    };
  });
  assert.equal(presence.session,"exposed");
  assert.equal(presence.persistent,null,"exposition state leaked back into persistent storage");
  await page.locator("#ao-d3-adoration [data-ao-d3-close]").click();

  await page.waitForSelector("#ao-v37-root:not([hidden]) [data-v37-open='pray.confession']",{timeout:10000});
  await page.locator("#ao-v37-root [data-v37-open='pray.confession']").first().click();
  await page.waitForSelector("#aoPrayerBookRoot.open[data-ao-d5-integrated='1']",{timeout:10000});
  assert.equal(await page.locator("#aoPrayerBookRoot .aoD5PhaseRail span").count(),5,"D5 did not expose five canonical phases");
  assert.equal(await page.locator("#aoPrayerBookRoot .pbProgress:visible").count(),0,"legacy Confession percentage progress remained visible");
  assert.equal(await page.locator("#aoPrayerBookRoot .aoD5PhaseRail [data-phase='doctrine'].active").count(),1,"D5 did not begin at Doctrine");

  await page.locator("#aoPrayerBookRoot [data-pb-conf-next]").click();
  await page.waitForSelector("#aoPrayerBookRoot .aoD5PhaseRail [data-phase='prepare'].active",{timeout:5000});
  await page.locator("#aoPrayerBookRoot [data-pb-conf-next]").click();
  await page.waitForSelector("#aoPrayerBookRoot .aoD5PhaseRail [data-phase='examination'].active",{timeout:5000});
  await page.waitForSelector("#aoPrayerBookRoot [data-ao-d5-exam-surface]",{timeout:5000});
  assert.ok(await page.locator("#aoPrayerBookRoot [data-ao-d5-exam-surface] details").count()>=10,"D5 read-only examination sections are incomplete");
  assert.equal(await page.locator("#aoPrayerBookRoot [data-ao-d5-exam-surface] input").count(),0,"Confession examination exposes stored/tickable sin controls");
  const examText=await page.locator("#aoPrayerBookRoot").innerText();
  assert.match(examText,/nothing is selected, scored or stored|no sin list|rien n[’']est sélectionné|pas enregistr/i,"D5 privacy boundary is not visible");
  assert.doesNotMatch(examText,/prompt\(s\) marked|question\(s\) marquée/i,"marked-prompt score remains visible");
  assert.doesNotMatch(examText,/\b\d+\s*\/\s*8\b/,"legacy eight-step Confession counter remains visible");

  await page.evaluate(()=>{try{globalThis.AOTraditionalPrayerBook?.close?.({silent:true})}catch{}});
  const reopenedPray=await page.evaluate(async()=>
    (await globalThis.AO_APP_SHELL_V1?.navigate?.("pray"))?.ok!==false
  );
  assert.equal(reopenedPray,true,"could not reopen canonical PRAY domain after Confession");
  await page.waitForSelector("#ao-v37-root:not([hidden]) [data-v37-open='pray.benediction']",{timeout:10000});

  await page.locator("#ao-v37-root [data-v37-open='pray.benediction']").first().click();
  await page.waitForSelector("#aoPrayerBookRoot.open[data-ao-d4-integrated='1']",{timeout:10000});
  assert.equal(await page.locator("#aoPrayerBookRoot .aoD4StageRail span").count(),4,"D4 did not expose four macro service stages");
  assert.equal(await page.locator("#aoPrayerBookRoot .pbProgress:visible").count(),0,"Benediction percentage progress remained visible");
  assert.equal(await page.locator("#aoPrayerBookRoot .aoD4StageRail [data-phase='exposition'].active").count(),1,"D4 did not begin at Exposition");
  assert.ok(await page.locator("#aoPrayerBookRoot .aoD4Note").count()>0,"D4 did not provide service-context guidance");

  await page.evaluate(()=>{try{globalThis.AOTraditionalPrayerBook?.close?.({silent:true})}catch{}});

  await page.evaluate(async()=>{await globalThis.AO_APP_SHELL_V1?.navigate?.("settings")});
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
  assert.ok(about.version,"D6 has no canonical application release version");
  assert.notEqual(about.version,about.settingsVersion,"About is still displaying the Settings component version as the app version");
  assert.ok(about.text.includes(String(about.version)),"About does not display canonical application version");

  assert.deepEqual(pageErrors,[],"D3-D6 assembled-app page errors: "+JSON.stringify(pageErrors));
  await context.close();
  console.log("PASS D3-D6 current-owner phone convergence");
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
