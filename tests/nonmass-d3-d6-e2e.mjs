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
    globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.status?.().d6==="integrated-on-modular-settings" &&
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
  await page.waitForFunction(()=>
    typeof globalThis.AO_PRAY_V435930?.open==="function" &&
    globalThis.AO_PRAY_APP_V1?.status?.().readerLoaded===true,
    null,{timeout:10000}
  );
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
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='holy']").count(),1,"Final donor Holy Hour entry is missing from Adoration");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='four']").count(),1,"Final donor Four Ends entry is missing from Adoration");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='treasury']").count(),1);
  // A fresh private Adoration entry cannot silently invite the public
  // Benediction rite. The chooser's *return* link belongs only to an
  // explicit prior Benediction-to-Adoration transition.
  const publicRiteLink=page.locator("#aoPray435930 .aoAdorationChooser [data-p435930-go-ben]");
  assert.equal(await publicRiteLink.count(),0,
    "Fresh private Adoration must not invent an active public-rite return");
  assert.equal(await page.locator("#aoPray435930 .aoP435930BenedictionReader").count(),0,
    "Public Benediction ritual stages must not open inside private Adoration");

  await page.locator("#aoPray435930 [data-p435930-ador-mode='open']").click();
  // This older D3/D6 cross-module smoke test verifies the *presence* of
  // the existing optional entry points and persistence protocol, not the
  // Adoration folio's visual hierarchy. Dedicated Adoration phone tests
  // cover whether secondary methods are exposed through their disclosure.
  await page.locator("#aoPray435930 [data-p435930-ador-four]")
    .waitFor({state:"attached",timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-mode='holy']").count(),1,"Guided Holy Hour is not available from open Adoration");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-ador-four]").count(),1,"Four Ends is not available from open Adoration");
  // Presence choices are now inside an optional disclosure. Exercise the
  // existing state owner, not the stylistic visibility of this legacy entry.
  await page.locator("#aoPray435930 [data-p435930-seg='exposed']")
    .evaluate(el=>el.click());
  assert.equal(await page.locator("#aoPray435930 [data-p435930-go-ben]").count(),1,"Exposed Adoration did not surface the public Benediction handoff");
  const presence=await page.evaluate(()=>{
    const saved=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
    return {session:sessionStorage.getItem("ao.app.adoration.presence.v1"),persistent:saved?.adoration?.presence??null,state:globalThis.AO_PRAY_V435930.state().adorationPresence};
  });
  assert.deepEqual(presence,{session:"exposed",persistent:null,state:"exposed"});

  await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null}));
  await page.waitForSelector("#aoPray435930 [data-p435930-conf-step='0']",{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-step]").count(),4,"D5 does not expose the four approved practical Confession phases");
  assert.doesNotMatch(await page.locator("#aoPray435930").innerText(),/\b\d+\s*\/\s*8\b/);
  // The current Confession owner requires choosing a preparation path before
  // progressing. Cover the ordinary/quick path instead of clicking a disabled
  // Continue control from an obsolete pre-path flow.
  assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-path]").count(),3);
  await page.locator("#aoPray435930 [data-p435930-conf-path='regular']").click();
  assert.equal(await page.locator("#aoPray435930 [data-p435930-conf-next]").isEnabled(),true);
  await page.locator("#aoPray435930 [data-p435930-conf-next]").click();
  await page.waitForSelector("#aoPray435930 [data-ao-confession-card='quick-commandments-1']",{timeout:5000});
  assert.equal(await page.locator("#aoPray435930 [data-ao-confession-card]").count(),1,"Confession should display one guided examination card");
  assert.equal(await page.locator("#aoPray435930 [data-ao-confession-card] input").count(),0,"No sins are entered, scored or retained");
  const examText=await page.locator("#aoPray435930").innerText();
  assert.match(examText,/no answers or sins are recorded|aucune réponse ni aucun péché/i,"Guided Confession must be reflective and private");
  assert.doesNotMatch(examText,/prompt\(s\) marked|question\(s\) marquée/i);

  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.benediction",{returnContext:null})),true,
    "D4 must open the canonical public Benediction reader");
  const benRoot="#aoPray435930.open .aoP435930BenedictionReader";
  await page.waitForSelector(benRoot+"[data-ao-benediction-dual-axis='true'] .aoDevoSequenceTimeline",{timeout:12000});
  assert.equal(await page.locator(benRoot+" [data-ao-devo-chapter]").count(),7,
    "Benediction must retain seven distinct original-source ritual stages");
  assert.equal(await page.locator(benRoot+" .aoDevoStop[aria-current='step']").count(),1,
    "Benediction must identify exactly one current stage");
  assert.equal(await page.locator(benRoot+"[data-ao-benediction-step='0'] [data-ao-devo-card='exposition']").count(),1,
    "Benediction must open at Exposition without silently advancing");

  // Only a person explicitly arriving FROM the public rite has a source-
  // contextual way back. The link itself must never mount ritual stages.
  assert.equal(await page.evaluate(()=>
    globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null})),true);
  // Explicit deep-link routing preserves the selected Adoration submode.
  // Return through its existing "Choose another mode" control before
  // asserting a chooser-only public-rite link.
  const backToChooser=page.locator("#aoPray435930.open [data-p435930-ador-home]");
  if(await backToChooser.count())await backToChooser.click();
  await page.waitForSelector("#aoPray435930.open .aoAdorationChooser",{timeout:5000});
  assert.equal(await publicRiteLink.count(),1,
    "Return to the public rite must be offered after a Benediction-origin transition");
  assert.match(await publicRiteLink.innerText(),
    /Return to public Benediction|Revenir à la bénédiction eucharistique/i);
  assert.equal(await page.locator("#aoPray435930 .aoP435930BenedictionReader").count(),0,
    "Contextual Benediction return link must not mount ritual stages itself");
  await publicRiteLink.click();
  await page.waitForSelector(benRoot+"[data-ao-benediction-step='0']",{timeout:5000});

  await page.evaluate(async()=>{globalThis.AO_PRAY_V435930.close({silent:true});await globalThis.AO_APP_SHELL_V1?.navigate?.("settings")});
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings",null,{timeout:10000});
  const settingsControlsBefore=await page.locator("#ao-settings-modular-root button").count();
  assert.ok(settingsControlsBefore>0,"modular Settings exposed no interactive controls");

  await page.locator("#ao-settings-modular-root [data-settings-sources]").click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="about-sources",null,{timeout:5000});
  const about=await page.evaluate(()=>({
    text:document.getElementById("ao-settings-modular-root")?.innerText??"",
    version:globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.canonicalAppVersion?.()??null,
    shownVersion:document.querySelector("#ao-settings-modular-root [data-settings-app-version]")?.textContent?.trim()??null,
    owner:globalThis.AO_SETTINGS_APP_V1?.status?.().owner??null,
    d6:globalThis.AO_NON_MASS_D3_D6_CONVERGENCE?.status?.().d6??null,
    homeSheet:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.homeSheet??null,
    oldSettingsVisible:globalThis.AO_SETTINGS_APP_V1?.status?.().historicalSettingsVisible??null,
  }));
  assert.match(about.text,/Liturgical books & 1962 basis|Livres liturgiques et base 1962/);
  assert.match(about.text,/Prayer & devotional methods|Prières et méthodes dévotionnelles/);
  assert.ok(about.version);
  assert.equal(about.shownVersion,String(about.version));
  assert.equal(about.owner,"AO_SETTINGS_APP_V1");
  assert.equal(about.d6,"integrated-on-modular-settings");
  assert.notEqual(about.homeSheet,"settings","D6 reopened the retired Home Settings surface");
  assert.equal(about.oldSettingsVisible,false,"D6 reopened a historical Settings donor");


  assert.deepEqual(pageErrors,[],"D3-D6 assembled-app page errors: "+JSON.stringify(pageErrors));
  await context.close();
  console.log("PASS D3-D6 modular PRAY + Settings phone convergence");
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
