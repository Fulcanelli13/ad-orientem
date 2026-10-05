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
    const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+path);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4183,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const pageErrors=[];
  const ariaWarnings=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  page.on("console",message=>{
    const value=message.text();
    if(/aria-hidden.*focus|blocked aria-hidden|retained focus/i.test(value))ariaWarnings.push(value);
  });

  await page.goto("http://127.0.0.1:4183/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.installed===true &&
    globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true &&
    globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
    null,{timeout:30000});
  await page.waitForSelector("[data-ao-app-surface='settings']",{state:"visible",timeout:30000});

  await page.locator("[data-ao-app-surface='settings']").click();
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings",null,{timeout:10000});

  const opened=await page.evaluate(()=>{
    const r=document.getElementById("ao-settings-modular-root");
    const rect=r?.getBoundingClientRect?.();
    const visible=node=>Boolean(node?.isConnected&&!node.hidden&&getComputedStyle(node).display!=="none"&&getComputedStyle(node).visibility!=="hidden");
    return {
      owner:r?.dataset?.aoSettingsOwner??null,
      presentation:r?.dataset?.aoSettingsPresentationOwner??null,
      status:globalThis.AO_SETTINGS_APP_V1?.status?.()??null,
      homeSheet:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.homeSheet??null,
      oldVisible:[
        document.getElementById("ao-settings-v4359"),
        document.getElementById("ao-settings-v4358"),
        document.getElementById("ao-settings-v4356"),
      ].filter(visible).length,
      utilityVisible:[...document.querySelectorAll("[data-v37-module='utility.settings'],[data-module='utility.settings']")].filter(visible).length,
      rect:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null,
    };
  });
  assert.equal(opened.owner,"AO_SETTINGS_APP_V1");
  assert.equal(opened.presentation,"modular-settings-presentation-v1");
  assert.equal(opened.status?.historicalSettingsVisible,false);
  assert.equal(opened.status?.embeddedHomeSettingsVisible,false);
  assert.notEqual(opened.homeSheet,"settings","modular Settings reopened the Home Settings donor");
  assert.equal(opened.oldVisible,0,"historical Settings donor is visible underneath modular Settings");
  assert.equal(opened.utilityVisible,0,"utility.settings surface is visible underneath modular Settings");
  assert.ok(opened.rect?.width>=388&&opened.rect?.width<=392,"Settings does not fit phone width");
  assert.ok(opened.rect?.height>700&&opened.rect?.height<=844,"Settings phone geometry is invalid");

  await page.locator("#ao-settings-modular-root [data-setting-language='fr']").click();
  await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",null,{timeout:5000});
  await page.locator("#ao-settings-modular-root [data-setting-scale='large']").click();
  await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.settings?.textScale==="large",null,{timeout:5000});
  await page.locator("#ao-settings-modular-root [data-setting-motion='1']").click();
  await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.settings?.reducedMotion===true,null,{timeout:5000});
  await page.locator("#ao-settings-modular-root [data-setting-posture-profile='TRADITIONAL_WALSH']").click();
  await page.locator("#ao-settings-modular-root [data-setting-gesture-profile='TRADITIONAL']").click();
  await page.waitForFunction(()=>{
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.()?.settings;
    return s?.massPostureProfile==="TRADITIONAL_WALSH"&&s?.massGestureProfile==="TRADITIONAL";
  },null,{timeout:5000});

  const hapticsBefore=await page.evaluate(()=>globalThis.AO_HAPTICS_V4319?.isEnabled?.()??null);
  assert.notEqual(hapticsBefore,null,"canonical haptics owner is unavailable");
  await page.locator("#ao-settings-modular-root [data-setting-haptics]").click();
  await page.waitForFunction(expected=>globalThis.AO_HAPTICS_V4319?.isEnabled?.()===expected,!hapticsBefore,{timeout:5000});

  await page.evaluate(()=>{
    const appStore=globalThis.AO_RUNTIME_V8?.store;
    appStore?.dispatch?.({type:"set-local-posture",key:"settings-test",value:"kneel"});
    appStore?.dispatch?.({type:"hydrate-settings",settings:{localMassPostures:{"settings-test":"KNEEL"}}});
  });
  await page.locator("#ao-settings-modular-root [data-reset-postures]").click();

  const persisted=await page.evaluate(()=>{
    const current=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    const saved=JSON.parse(localStorage.getItem("ao2:settings:v1")||"{}");
    return {
      language:current?.language,
      state:current?.settings,
      saved,
      haptics:localStorage.getItem("ao-haptics-enabled"),
    };
  });
  assert.equal(persisted.language,"fr");
  assert.equal(persisted.state?.textScale,"large");
  assert.equal(persisted.state?.reducedMotion,true);
  assert.equal(persisted.state?.massPostureProfile,"TRADITIONAL_WALSH");
  assert.equal(persisted.state?.massGestureProfile,"TRADITIONAL");
  assert.deepEqual(persisted.state?.localPostures,{});
  assert.deepEqual(persisted.state?.localMassPostures,{});
  assert.equal(persisted.saved?.language,"fr");
  assert.equal(persisted.saved?.textScale,"large");
  assert.equal(persisted.saved?.massPostureProfile,"TRADITIONAL_WALSH");
  assert.equal(persisted.saved?.massGestureProfile,"TRADITIONAL");
  assert.equal(persisted.haptics,hapticsBefore?"0":"1","haptics preference did not persist through canonical owner");

  await page.locator("#ao-settings-modular-root [data-settings-sources]").click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="about-sources",null,{timeout:5000});
  const about=await page.evaluate(()=>({
    text:document.getElementById("ao-settings-modular-root")?.innerText??"",
    shown:document.querySelector("#ao-settings-modular-root [data-settings-app-version]")?.textContent?.trim()??null,
    canonical:globalThis.AO_RELEASE_AUTHORITY_V4359?.version||document.documentElement.dataset.aoRelease||null,
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
  }));
  assert.match(about.text,/Livres liturgiques et base 1962/);
  assert.match(about.text,/Prières et méthodes dévotionnelles/);
  assert.equal(about.shown,String(about.canonical));
  assert.equal(about.active,"settings","Sources/About escaped into a seventh top-level destination");

  await page.locator("#ao-settings-modular-root [data-settings-main]").click();
  await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="main",null,{timeout:5000});
  await page.locator("#ao-settings-modular-root [data-settings-close]").first().click();
  await page.waitForFunction(()=>!document.getElementById("ao-settings-modular-root"),null,{timeout:5000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:5000});

  const closed=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    home:Boolean(document.querySelector(".homeScreen")),
    focusHidden:Boolean(document.activeElement?.closest?.("[aria-hidden='true'],[hidden]")),
    embedded:Boolean(document.querySelector("[data-ao-home-settings]")),
  }));
  assert.equal(closed.active,"home");
  assert.equal(closed.home,true);
  assert.equal(closed.focusHidden,false,"focus remained inside a hidden surface after Settings close");
  assert.equal(closed.embedded,false,"Home Settings donor reappeared after modular Settings close");

  await page.reload({waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true&&globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:30000});
  const reloaded=await page.evaluate(()=>{
    const current=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return {language:current?.language,settings:current?.settings,legacyMassStarts:globalThis.__AO_FINAL_LEGACY_STARTS??0};
  });
  assert.equal(reloaded.language,"fr","language preference did not persist");
  assert.equal(reloaded.settings?.textScale,"large","display preference did not persist");
  assert.equal(reloaded.settings?.reducedMotion,true,"accessibility preference did not persist");
  assert.equal(reloaded.settings?.massPostureProfile,"TRADITIONAL_WALSH");
  assert.equal(reloaded.settings?.massGestureProfile,"TRADITIONAL");
  assert.equal(reloaded.legacyMassStarts,0,"Settings regression started legacy Mass");

  assert.deepEqual(ariaWarnings,[],"focus/aria-hidden warnings: "+JSON.stringify(ariaWarnings));
  assert.deepEqual(pageErrors,[],"uncaught Settings errors: "+JSON.stringify(pageErrors));
  await context.close();
  console.log("PASS modular Settings production phone acceptance");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
