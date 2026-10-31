import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(await readFile(file));
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(4197,"127.0.0.1",ok));
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const width of [320,390]){
    const ctx=await browser.newContext({viewport:{width,height:width===320?640:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const page=await ctx.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4197/index.html",{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().nativeBack?.installed&&globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner,{timeout:30000});
    assert.equal(await page.evaluate(()=>history.state?.__aoNavigationV1??null),null,"Initial Home must not trap browser Back");

    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"))).ok,true);
    const family=page.locator('#ao-learn-modular-root button[data-ao-learn-family]').first();
    await family.click();
    const chosen=await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.status().family);
    assert.ok(chosen);
    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"))).ok,true);
    await page.locator('#ao-settings-modular-root [data-settings-route="/settings/accessibility"]').click();
    assert.equal(await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1.status().path),"/settings/accessibility");

    // Native Android gesture maps to the same popstate as browser Back.
    await page.evaluate(()=>history.back());
    await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().path==="/settings",{timeout:12000});
    assert.equal(await page.locator("#ao-settings-modular-root").count(),1,
      "First device Back should show Settings Contents, not leave the app");
    await page.evaluate(()=>history.back());
    await page.waitForFunction(f=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="learn"&&
      globalThis.AO_LEARN_APP_V1?.status?.().family===f&&!globalThis.AO_SETTINGS_APP_V1?.status?.().open,chosen,{timeout:20000});
    assert.equal(await page.locator("#ao-learn-modular-root").count(),1);
    // A real canonical re-entry briefly resets Home internally. It must not
    // create a synthetic History entry or steal the next browser Back press.
    const currentHistory=await page.evaluate(()=>history.state?.__aoNavigationV1??null);
    assert.equal(currentHistory?.surface,"learn","Transient hard-Home must never become a Back destination");
    await page.evaluate(()=>history.back());
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:12000});
    assert.equal(await page.locator(".homeScreen").count()>0,true);

    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"))).ok,true);
    await page.evaluate(()=>history.back());
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="home",{timeout:16000});
    assert.equal(await page.locator("#aoPray435930.open").count(),0);

    // Real module-to-module navigation performs a temporary internal Home
    // reset. Browser Back must return to the actual previously visited module.
    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"))).ok,true);
    assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"))).ok,true);
    assert.equal(await page.evaluate(()=>history.state?.__aoNavigationV1?.surface),"learn");
    await page.evaluate(()=>history.back());
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray"&&
      globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:16000});
    assert.equal(await page.locator("#aoPray435930.open").count(),1,
      "Browser Back returned to phantom Home rather than previous Prayer module");
    await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));

    assert.deepEqual(errors,[],"Unexpected browser errors: "+errors.join(" | "));
    console.log("PASS native Back "+width+"px: Formation family -> Settings chapter -> Contents -> exact Formation -> Home; Prayer -> Home");
    await ctx.close();
  }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
