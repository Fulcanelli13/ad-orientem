import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance");
await mkdir(out,{recursive:true});

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
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4186,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB",
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));

  await page.goto("http://127.0.0.1:4186/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:30000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForSelector("[data-ao-home-enricher-owner='modular-home-enrichers-v1']",{state:"visible",timeout:10000});
  await page.waitForFunction(()=>!document.getElementById("ao-cinema-boot"),null,{timeout:8000});

  const homeAudit=await page.evaluate(()=>({
    release:document.documentElement.dataset.aoRelease??null,
    releaseAuthority:document.documentElement.dataset.aoReleaseAuthority??null,
    suppressed:document.documentElement.dataset.aoHomeSuppressed??null,
    canonicalIcons:document.querySelectorAll(".aoHomeCuIcon use").length,
    fallbackIcons:document.querySelectorAll(".aoHomeCuIconFallback").length,
  }));
  assert.equal(homeAudit.release,"43.59.30");
  assert.equal(homeAudit.releaseAuthority,"AO_APP_SHELL_V1");
  assert.equal(homeAudit.suppressed,"false");
  assert.equal(homeAudit.canonicalIcons,3,"Home Coming Up did not render all canonical embedded symbols");
  assert.equal(homeAudit.fallbackIcons,0,"Home Coming Up fell back to placeholder artwork");

  const shot=async(name)=>page.screenshot({path:resolve(out,name+".png"),fullPage:true});
  const assertHomeHidden=async(surface)=>{
    const s=await page.evaluate(()=>({
      suppressed:document.documentElement.dataset.aoHomeSuppressed??null,
      display:getComputedStyle(document.querySelector(".homeScreen")).display,
    }));
    assert.equal(s.suppressed,"true",surface+" did not mark Home suppressed");
    assert.equal(s.display,"none",surface+" exposed Home beneath the active surface");
  };

  assert.equal(await page.locator(".aoSaintArtCard .aoSaintArtPlaceholder").filter({hasText:/No reusable artwork|No artwork is assigned|not approved for production/i}).count(),0,"Home exposed a terminal saint-art placeholder instead of suppressing the unresolved card");
  await shot("01-home");

  await page.locator("[data-ao-app-surface='calendar']").click();
  await page.waitForSelector("#ao-calendar-modular-root",{state:"visible",timeout:10000});
  await assertHomeHidden("Calendar");
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-input]").count(),1);
  assert.equal(await page.locator("#ao-calendar-modular-root [data-cal-native]").count(),0);
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalYearWheel").count(),1,"Calendar lost its sacred-time annual overview");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalIdentity").count(),1,"Calendar lost its single selected-feast identity");
  assert.ok(await page.locator("#ao-calendar-modular-root .aoCalObservance").count()>=7,"Calendar lost the touch observance rail");
  assert.equal(await page.locator("#ao-calendar-modular-root .aoCalObservance[aria-current='date']").count(),1,"Calendar selected date is not uniquely identified");
  const calendarDashboard=await page.evaluate(()=>({
    wheel:document.querySelector("#ao-calendar-modular-root .aoCalYearWheel")?.getBoundingClientRect()?.width??0,
    identity:document.querySelector("#ao-calendar-modular-root .aoCalIdentity h2")?.textContent?.trim()??"",
    railScrollable:(()=>{const x=document.querySelector("#ao-calendar-modular-root .aoCalModRail");return x?x.scrollWidth>=x.clientWidth:false})(),
  }));
  assert.ok(calendarDashboard.wheel>=120,"Calendar annual overview collapsed below phone-readable size");
  assert.ok(calendarDashboard.identity.length>0,"Calendar selected feast identity is blank");
  assert.equal(calendarDashboard.railScrollable,true,"Calendar observance rail is not touch-scrollable/snapping");
  await shot("02-calendar");

  await page.locator("[data-ao-app-surface='pray']").click();
  await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:10000});
  await assertHomeHidden("PRAY");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-back]").count(),1,"PRAY root lost its Home return control");
  assert.equal(await page.locator("#aoPray435930 [data-p435930-close]").count(),0,"PRAY root exposes duplicate Back + Close exits");
  await shot("03-pray");

  await page.locator("[data-ao-app-surface='learn']").click();
  await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
  await assertHomeHidden("Learn");
  await shot("04-learn");

  await page.locator("[data-ao-app-surface='settings']").click();
  await page.waitForSelector("#ao-settings-modular-root",{state:"visible",timeout:10000});
  await assertHomeHidden("Settings");
  assert.equal(await page.locator("#ao-settings-modular-root [data-settings-close]").count(),1,"Settings main has duplicate exit controls");
  await shot("05-settings");

  const report=await page.evaluate(()=>({
    shell:globalThis.AO_APP_SHELL_V1?.status?.()??null,
    viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
    release:document.documentElement.dataset.aoRelease??null,
    releaseAuthority:document.documentElement.dataset.aoReleaseAuthority??null,
    appOwner:document.documentElement.dataset.aoAppShellOwner??null,
  }));
  await writeFile(resolve(out,"report.json"),JSON.stringify({report,errors},null,2));
  assert.deepEqual(errors,[],"page errors during visual acceptance: "+JSON.stringify(errors));
  console.log("visual acceptance capture: PASS",JSON.stringify({errors,report},null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
