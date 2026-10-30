import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// Genuine modular app, not the H1.1 HTML review harness or a mocked Home.
// Output is a review artifact, never a published liturgical source.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/home-h11-acceptance");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",".json":"application/json",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
  try{
    const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+name);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4381,"127.0.0.1",ok);});
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const size of [{width:390,height:844},{width:320,height:568}]){
    const context=await browser.newContext({viewport:size,deviceScaleFactor:1,isMobile:true,hasTouch:true,
      locale:"en-GB",colorScheme:"dark",serviceWorkers:"block"});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(String(error?.message??error)));
    const prefix=size.width===390?"390":"320";
    await page.goto("http://127.0.0.1:4381/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:30000});
    await page.waitForFunction(()=>{
      const boot=document.getElementById("ao-cinema-boot");
      const ready=!boot||boot.hidden||getComputedStyle(boot).display==="none"||
        getComputedStyle(boot).pointerEvents==="none";
      return ready && Boolean(globalThis.AO_SETTINGS_DONOR_V4359?.setPath) &&
        Boolean(globalThis.AO_APP_LITURGICAL_THEME_V1?.status?.());
    },null,{timeout:35000});

    const mode=async value=>{
      await page.evaluate(value=>globalThis.AO_SETTINGS_DONOR_V4359.setPath("appearance.mode",value),value);
      await page.waitForFunction(value=>document.documentElement.dataset.aoAppearanceV1===value,
        value,{timeout:10000});
      return page.evaluate(()=>({
        effective:document.documentElement.dataset.aoAppearanceV1,
        chosen:document.documentElement.dataset.aoAppearanceChoiceV1,
        bg:getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
      }));
    };
    const inspect=async label=>{
      const state=await page.evaluate(()=>({
        width:innerWidth,documentWidth:document.documentElement.scrollWidth,
        sections:[...document.querySelectorAll(".homeScreen.aoTodayV2 .aoTodayV2PrayNow, .homeScreen.aoTodayV2 .aoTodayV2CalendarGlance")].map(x=>x.className),
        selected:document.querySelectorAll(".homeScreen.aoTodayV2 .dateRail .dayCell.selected").length,
        week:document.querySelectorAll(".homeScreen.aoTodayV2 .dateRail .dayCell").length,
        primary:document.querySelectorAll(".homeScreen.aoTodayV2 [data-home-mass-entry],.homeScreen.aoTodayV2 [data-resume-mass]").length,
        appearance:document.documentElement.dataset.aoAppearanceV1
      }));
      assert.ok(state.documentWidth<=state.width+2,label+" horizontal overflow: "+JSON.stringify(state));
      assert.equal(state.week,7,label+" must retain the actual selected-date week rail");
      assert.equal(state.selected,1,label+" must have one selected day");
      assert.ok(state.sections[0]?.includes("aoTodayV2PrayNow") &&
        state.sections[1]?.includes("aoTodayV2CalendarGlance"),label+" should put Prayer above Calendar");
      assert.equal(state.primary,1,label+" must have exactly one Mass entry or Resume action");
      return state;
    };
    assert.equal((await mode("dark")).effective,"dark");
    await inspect(prefix+" dark Today");
    await page.screenshot({path:resolve(output,prefix+"-today-dark.png")});
    const light=await mode("light");
    assert.equal(light.bg,"#F6F2EA","Light appearance must use the shared foundation");
    await inspect(prefix+" light Today");
    await page.screenshot({path:resolve(output,prefix+"-today-light.png")});

    // A real Settings control must exist; an appearance mode is not merely CSS.
    await page.locator(".homeScreen [data-home-settings]").click();
    await page.waitForSelector('#ao-settings-modular-root [data-settings-route="/settings/accessibility"]',{timeout:15000});
    await page.locator('#ao-settings-modular-root [data-settings-route="/settings/accessibility"]').click();
    await page.waitForSelector('#ao-settings-modular-root [data-pref-path="appearance.mode"][data-pref-value="auto"]');
    await page.locator('#ao-settings-modular-root [data-pref-path="appearance.mode"][data-pref-value="auto"]').click();
    await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceChoiceV1==="auto");
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.aoAppearanceV1),"dark",
      "Auto must follow the current dark device");
    await page.emulateMedia({colorScheme:"light"});
    await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceV1==="light");
    await page.screenshot({path:resolve(output,prefix+"-settings-auto-light.png")});
    await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.close?.());
    await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible"});

    await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359.setPath("general.uiLanguage","fr"));
    await page.waitForFunction(()=>document.querySelector(".homeScreen.aoTodayV2")?.dataset?.homeLanguage==="fr");
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
    await page.waitForSelector('.aoTodayV2[data-ao-home-calendar-view="picker"] #ao-calendar-modular-root',{state:"attached",timeout:30000});
    await page.screenshot({path:resolve(output,prefix+"-month-light-fr.png")});
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
    await page.waitForSelector('.aoTodayV2[data-ao-home-calendar-view="year"] #ao-calendar-modular-root',{state:"attached",timeout:30000});
    await page.screenshot({path:resolve(output,prefix+"-year-light-fr.png")});

    assert.equal(errors.length,0,"Unexpected H1.1 browser errors: "+JSON.stringify(errors));
    console.log("PASS H1.1 "+prefix+"px dark/light/auto Settings and embedded Calendar: "+JSON.stringify(light));
    await context.close();
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
