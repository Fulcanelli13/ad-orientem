import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const repo=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=resolve(repo,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(!path.startsWith(repo+sep)){res.writeHead(403);res.end();return}
    const data=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e))}
});
await new Promise(resolve=>server.listen(4217,"127.0.0.1",resolve));
let browser;
const shell=()=>globalThis.AO_APP_SHELL_V1;
try{
  browser=await chromium.launch({headless:true});
  for(const width of [320,390])for(const language of ["en","fr"]){
    const context=await browser.newContext({viewport:{width,height:width===320?640:844},isMobile:true,hasTouch:true});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4217/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner&&globalThis.AO_SETTINGS_APP_V1?.status?.().installed,{timeout:30000});
    // Real Settings control, not an injected store state, changes language.
    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"))).ok,true);
    await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
    await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
    await page.locator("#ao-settings-modular-root [data-settings-close]").click();
    await page.waitForFunction(lang=>document.documentElement.lang===lang,language,{timeout:12000});

    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"))).ok,true);
    await page.waitForFunction(()=>globalThis.AO_LEARN_APP_V1?.status?.().open,{timeout:18000});
    assert.equal(await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.openModule("learn.latin",{lessonNumber:12})),true);
    const latin=page.locator("#ao-latin-course-root");
    await latin.waitFor({state:"visible",timeout:30000});
    await page.waitForFunction(()=>globalThis.AO_LATIN_COURSE_V1?.status?.().lesson===12,{timeout:15000});
    await latin.locator('[data-l2-phase="practice"]').click();
    for(let i=0;i<3;i++)await latin.locator("[data-l2-next]").click();
    assert.match(await latin.locator(".aoL2PracticeHead").innerText(),/4\s*\/\s*10/);
    await latin.locator("[data-l2-choice]").first().click();
    const chosen=await latin.locator(".aoL2Choice.selected").getAttribute("data-l2-choice");
    assert.notEqual(chosen,null);
    // The scroll owner is the fixed Latin module root, not the window.
    const expectedScroll=await page.evaluate(()=>{
      const root=document.getElementById("ao-latin-course-root");
      root.scrollTop=260;return root.scrollTop;
    });
    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"))).ok,true);
    await page.locator("#ao-settings-modular-root [data-settings-close]").click();
    await page.waitForFunction(()=>globalThis.AO_LATIN_COURSE_V1?.status?.().open&&
      globalThis.AO_LATIN_COURSE_V1?.status?.().lessonPhase==="practice",{timeout:30000});
    assert.match(await latin.locator(".aoL2PracticeHead").innerText(),/4\s*\/\s*10/);
    assert.equal(await latin.locator(".aoL2Choice.selected").getAttribute("data-l2-choice"),chosen,"Answer lost after Settings");
    const restoredScroll=await page.evaluate(()=>document.getElementById("ao-latin-course-root").scrollTop);
    assert.ok(Math.abs(restoredScroll-expectedScroll)<=3,"Scroll position lost: "+expectedScroll+" / "+restoredScroll);

    // A partly typed answer has the same return guarantee as a selected choice.
    for(let i=0;i<6;i++)await latin.locator("[data-l2-next]").click();
    assert.match(await latin.locator(".aoL2PracticeHead").innerText(),/10\s*\/\s*10/);
    const answer=latin.locator("[data-l2-text]");
    await answer.fill("P3 unfinished Latin answer "+width+language);
    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"))).ok,true);
    await page.locator("#ao-settings-modular-root [data-settings-close]").click();
    await page.waitForFunction(()=>globalThis.AO_LATIN_COURSE_V1?.status?.().open&&
      globalThis.AO_LATIN_COURSE_V1?.status?.().lesson===12,{timeout:30000});
    assert.match(await latin.locator(".aoL2PracticeHead").innerText(),/10\s*\/\s*10/);
    assert.equal(await latin.locator("[data-l2-text]").inputValue(),"P3 unfinished Latin answer "+width+language);

    // Back should not open an empty Stage after restoring a direct lesson.
    await latin.locator("[data-l2-back]").click();
    await page.waitForFunction(()=>globalThis.AO_LATIN_COURSE_V1?.status?.().screen==="stage");
    assert.ok(await latin.locator("[data-l2-lesson]").count()>0,"Restored parent Stage has no lessons");
    assert.deepEqual(errors,[],"Browser errors "+width+"/"+language+": "+errors.join(" | "));
    console.log("PASS P3 "+width+"px "+language+": lesson 12 / practice / exercise 4 / selected answer / scroll / unfinished typed answer / Stage Back");
    await context.close();
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}