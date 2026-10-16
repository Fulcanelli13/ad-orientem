/**
 * Live production Pages phone verification, using a fresh anonymous Chromium
 * profile. THIS DOES NOT verify any particular person's installed app icon.
 * We do not mutate a user's real device or trigger automatic update activation.
 */
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const base="https://fulcanelli13.github.io/ad-orientem/";
const output=resolve("test-output/installed-pages-phone");
const report={
 schema:"AO_P0_LIVE_PAGES_INSTALLED_PATH_V1",
 checkedAt:new Date().toISOString(),origin:base,device:"chromium-phone-390",
 steps:[],pageErrors:[],
 actualUserInstalledIconVerified:false,
 action:"READ_ONLY_NO_AUTOMATIC_UPDATE_OR_DATA_CLEAR"
};
await mkdir(output,{recursive:true});
let browser,context,page,failure=null;

async function capture(name){
 const data=await page.evaluate(label=>{
  const offline=globalThis.AO_OFFLINE_APP_V1?.status||null;
  const host=globalThis.AO_APP_SHELL_V1?.status?.()||null;
  const settings=document.querySelector("#ao-settings-modular-root");
  return {
   label,url:location.href,origin:location.origin,pathname:location.pathname,
   standalone:matchMedia("(display-mode: standalone)").matches,
   appReady:Boolean(host?.visibleOwner),
   swControlled:Boolean(navigator.serviceWorker?.controller),
   offline:{supported:offline?.supported??null,registered:offline?.registered??null,
     ready:offline?.ready??null,version:offline?.version??null,
     pendingVersion:offline?.pendingVersion??null,error:offline?.error??null},
   settings:{
    visible:Boolean(settings&&getComputedStyle(settings).display!=="none"),
    actualSite:settings?.querySelector("[data-settings-active-site]")?.getAttribute("data-settings-active-site")??null,
    siteText:settings?.querySelector("[data-settings-active-site]")?.textContent?.trim()??null,
    snapshotFingerprint:settings?.querySelector("[data-settings-snapshot-id]")?.getAttribute("data-settings-snapshot-id")??null,
    release:settings?.querySelector("[data-settings-app-version]")?.textContent?.trim()??null,
    canCheckUpdates:Boolean(settings?.querySelector("[data-settings-check-update]")&&!settings.querySelector("[data-settings-check-update]").disabled)
   }
  };
 },name);
 report.steps.push(data);
 return data;
}
async function showSettings(){
 await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
 await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:30000});
 await page.locator('[data-settings-route="/settings/about-sources"]').click();
 await page.waitForSelector('[data-settings-active-site="github_pages"]',{state:"visible",timeout:18000});
}
try{
 browser=await chromium.launch({headless:true});
 context=await browser.newContext({
  viewport:{width:390,height:844},isMobile:true,hasTouch:true,
  deviceScaleFactor:1,serviceWorkers:"allow",locale:"en-GB"
 });
 page=await context.newPage();
 page.on("pageerror",e=>report.pageErrors.push(String(e?.message||e).slice(0,500)));
 const response=await page.goto(base+"?ao_p0_installed_phone_probe="+Date.now(),
  {waitUntil:"domcontentloaded",timeout:75000});
 assert.equal(response?.status(),200,"Public GitHub Pages entry did not respond HTTP 200");
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
  null,{timeout:60000});
 // A fresh browser has never had an offline snapshot. Wait for actual
 // service-worker stage/readiness; failing it must not be disguised as PASS.
 await page.waitForFunction(()=>{
  const s=globalThis.AO_OFFLINE_APP_V1?.status;
  return Boolean(s?.ready===true||s?.error);
 },null,{timeout:150000});
 const online=await capture("online-after-first-snapshot");
 assert.equal(online.offline.error,null,"Production Pages snapshot failed staging");
 assert.equal(online.offline.supported,true);
 assert.equal(online.offline.ready,true);
 assert.match(online.offline.version||"",/^[0-9a-f]{20,}$/i,
  "Active offline snapshot is missing its source fingerprint");
 assert.equal(online.offline.pendingVersion,null,"Fresh install must not auto-stage a different active version");
 await showSettings();
 const settingsOnline=await capture("online-settings");
 assert.equal(settingsOnline.settings.actualSite,"github_pages");
 assert.equal(settingsOnline.settings.siteText,"https://fulcanelli13.github.io/ad-orientem/");
 assert.equal(settingsOnline.settings.snapshotFingerprint,online.offline.version.slice(0,12));
 assert.equal(settingsOnline.settings.canCheckUpdates,true);
 assert.ok(settingsOnline.settings.release,"Release label missing from Settings");
 await page.screenshot({path:resolve(output,"settings-online-390.png"),animations:"disabled"});

 // Offline reload validates an INSTALLED-LIKE cached launch without
 // confusing this test profile with the user's genuine Home Screen icon.
 await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.close?.());
 await context.setOffline(true);
 await page.reload({waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
  null,{timeout:55000});
 const cached=await capture("offline-home-reloaded");
 assert.equal(cached.offline.supported,true);
 assert.equal(cached.swControlled,true,"App reload did not use a service worker");
 await showSettings();
 const settingsOffline=await capture("offline-settings");
 assert.equal(settingsOffline.settings.actualSite,"github_pages");
 assert.equal(settingsOffline.settings.snapshotFingerprint,online.offline.version.slice(0,12),
  "Offline reload selected a different active snapshot without consent");
 assert.equal(settingsOffline.settings.siteText,settingsOnline.settings.siteText);
 await page.screenshot({path:resolve(output,"settings-offline-390.png"),animations:"disabled"});
 report.pass=true;
 console.log("P0_LIVE_PAGES_INSTALLED_PATH_PASS="+JSON.stringify({
  origin:base,onlineSnapshot:online.offline.version.slice(0,12),
  offlineReload:true,settingsParity:true,physicalHandsetVerified:false
 }));
}catch(error){
 failure=error;
 report.pass=false;report.failure=String(error?.stack||error);
 try{if(page)await page.screenshot({path:resolve(output,"failure.png"),animations:"disabled"});}catch{}
 console.error("P0_LIVE_PAGES_INSTALLED_PATH_FAIL="+report.failure);
}finally{
 try{await writeFile(resolve(output,"report.json"),JSON.stringify(report,null,2)+"\n");}catch{}
 await context?.close().catch(()=>{});
 await browser?.close().catch(()=>{});
}
if(failure)throw failure;
