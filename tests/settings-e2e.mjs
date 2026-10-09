import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+path);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4183,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage(),pageErrors=[],ariaWarnings=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  page.on("console",m=>{/aria-hidden.*focus|blocked aria-hidden|retained focus/i.test(m.text())&&ariaWarnings.push(m.text());});
  await page.goto("http://127.0.0.1:4183/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true&&globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:30000});
  await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:10000}).catch(()=>{});

  // Settings is a contextual overlay; the sixth permanent ribbon slot is Explore.
  await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  const opened=await page.evaluate(()=>{
    const r=document.getElementById("ao-settings-modular-root"),rect=r?.getBoundingClientRect(),visible=n=>Boolean(n?.isConnected&&!n.hidden&&getComputedStyle(n).display!=="none");
    return {owner:r?.dataset?.aoSettingsOwner,presentation:r?.dataset?.aoSettingsPresentationOwner,status:globalThis.AO_SETTINGS_APP_V1?.status?.(),rect:rect?{width:rect.width,height:rect.height}:null,old:[document.getElementById("ao-settings-v4359"),document.getElementById("ao-settings-v4358"),document.getElementById("ao-settings-v4356")].filter(visible).length};
  });
  assert.equal(opened.owner,"AO_SETTINGS_APP_V1");
  assert.equal(opened.presentation,"modular-settings-presentation-v4359.6");
  assert.equal(opened.status?.donorVersion,"43.59.6");
  assert.equal(opened.status?.route,"/settings");
  assert.equal(opened.old,0);
  assert.ok(opened.rect?.width>=388&&opened.rect?.width<=392);
  assert.ok(opened.rect?.height>700&&opened.rect?.height<=844);

  for(const route of ["/settings/general","/settings/accessibility","/settings/language-reading","/settings/mass","/settings/local-customs","/settings/prayer","/settings/privacy-data","/settings/about-sources"]){
    assert.equal(await page.locator('#ao-settings-modular-root [data-settings-route="'+route+'"]').count(),1,"missing Settings route "+route);
  }

  await page.locator('[data-settings-route="/settings/general"]').click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="/settings/general");
  assert.equal(await page.locator('[data-pref-path="general.uiLanguage"]').count(),0,
    "App language must be owned by Language & Text, not duplicated in General");
  await page.locator("[data-pref-toggle='general.hapticsEnabled']").click();
  await page.locator("[data-settings-back]").click();

  await page.locator('[data-settings-route="/settings/language-reading"]').click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="/settings/language-reading");
  await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
  await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr");
  await page.locator("[data-settings-back]").click();

  await page.locator('[data-settings-route="/settings/accessibility"]').click();
  await page.locator('[data-pref-select="accessibility.textScale"]').selectOption("large");
  await page.locator('[data-pref-select="accessibility.motion"]').selectOption("reduced");
  await page.waitForFunction(()=>document.documentElement.dataset.aoTextScaleV1==="large"&&document.documentElement.dataset.aoMotionV1==="reduced");
  await page.locator("[data-settings-back]").click();

  await page.locator('[data-settings-route="/settings/mass"]').click();
  await page.locator('[data-pref-path="mass.defaultExperience"][data-pref-value="missal"]').click();
  await page.locator('[data-pref-path="mass.defaultForm"][data-pref-value="low"]').click();
  const massDefaults=await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.().preferences.mass);
  assert.equal(massDefaults.defaultExperience,"missal");
  assert.equal(massDefaults.defaultForm,"low");
  assert.match(await page.locator("#ao-settings-modular-root").innerText(),/Future sessions only|sessions futures/i);
  await page.locator("[data-settings-back]").click();

  await page.locator('[data-settings-route="/settings/prayer"]').click();
  await page.locator('[data-pref-path="prayer.recitationMode"][data-pref-value="group"]').click();
  await page.locator('[data-pref-path="prayer.stations.mode"][data-pref-value="simple"]').click();
  await page.locator('[data-pref-toggle="prayer.stations.stabatMater"]').click();
  const earlyPrayer=await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.()?.preferences?.prayer);
  assert.equal(earlyPrayer.recitationMode,"group");
  assert.equal(earlyPrayer.stations.mode,"simple");
  assert.equal(earlyPrayer.stations.stabatMater,true);
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1?.status?.()?.readerLoaded),false,
    "Settings should not force cold-loading the Prayer reader");
  await page.locator("[data-settings-back]").click();

  await page.locator('[data-settings-route="/settings/local-customs"]').click();
  await page.locator("[data-profile-add]").click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route.startsWith("/settings/local-customs/"));
  const profile=await page.evaluate(()=>({route:globalThis.AO_SETTINGS_APP_V1.status().route,count:globalThis.AO_SETTINGS_APP_V1.status().profileCount}));
  assert.equal(profile.count,1);
  await page.locator("[data-profile-name]").fill("St Test Church");
  await page.locator("[data-profile-name]").blur();
  await page.locator("[data-profile-use-default]").click();
  await page.locator("[data-settings-back]").click();
  await page.locator("[data-settings-back]").click();

  await page.locator('[data-settings-route="/settings/about-sources"]').click();
  const about=await page.locator("#ao-settings-modular-root").innerText();
  assert.match(about,/Messe romaine de 1962/);
  assert.match(about,/Éditions de l’Écriture/);
  assert.match(about,/Version/);
  await page.locator("[data-settings-back]").click();

  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao2:preferences:v1")||"null"));
  assert.equal(stored.general.uiLanguage,"fr");
  assert.equal(stored.accessibility.textScale,"large");
  assert.equal(stored.accessibility.motion,"reduced");
  assert.equal(stored.mass.defaultExperience,"missal");
  assert.equal(stored.mass.defaultForm,"low");
  assert.equal(stored.prayer.recitationMode,"group");
  assert.equal(stored.prayer.stations.mode,"simple");
  assert.equal(stored.prayer.stations.stabatMater,true);
  assert.ok(stored.mass.defaultProfileId);

  await page.locator("[data-settings-close]").click();
  await page.waitForFunction(()=>!document.getElementById("ao-settings-modular-root"));
  // Opening Prayer later must hydrate the donor from Settings preferences that
  // were changed while the heavy Prayer runtime had not yet been downloaded.
  const prayerOpen=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("pray"));
  assert.equal(prayerOpen?.ok,true,"Could not open deferred Prayer after Settings edits");
  await page.waitForFunction(()=>{
    const p=globalThis.AO_PRAY_V435930?.state?.();
    return p?.rosary?.recitation==="group"&&p?.stations?.mode==="simple"&&p?.stations?.stabat===true;
  },null,{timeout:15000});
  await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("home"));
  await page.reload({waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:30000});
  const reloaded=await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.());
  assert.equal(reloaded.preferences.general.uiLanguage,"fr");
  assert.equal(reloaded.preferences.accessibility.textScale,"large");
  assert.equal(reloaded.preferences.mass.defaultForm,"low");
  assert.equal(reloaded.preferences.prayer.recitationMode,"group");
  assert.equal(reloaded.profiles.length,1);
  assert.deepEqual(ariaWarnings,[]);
  assert.deepEqual(pageErrors,[]);
  await context.close();
  console.log("PASS v43.59.6 modular Settings phone acceptance");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
