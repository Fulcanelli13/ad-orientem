import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error));}
});
await new Promise(ok=>server.listen(4189,"127.0.0.1",ok));
let browser;
const owners={
  home:"AO_HOME_APP_V1",pray:"AO_PRAY_APP_V1",learn:"AO_LEARN_APP_V1",
  calendar:"AO_CALENDAR_APP_V1",find:"AO_FIND_APP_V1",apostolate:"AO_APOSTOLATE_APP_V1"
};
const roots={
  home:".homeScreen",pray:"#aoPray435930.open",learn:"#ao-learn-modular-root",
  calendar:"#ao-calendar-modular-root",find:"#ao-find-modular-root[data-open='true']",
  apostolate:"#ao-apostolate-root"
};
try{
  browser=await chromium.launch({headless:true});
  for(const width of [320,390]){
    const context=await browser.newContext({viewport:{width,height:width===320?640:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(String(e)));
    await page.goto("http://127.0.0.1:4189/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner===true&&globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:30000});
    for(const dest of ["home","pray","calendar","learn","find","apostolate"]){
      if(dest!=="home"){
        const result=await page.evaluate(s=>globalThis.AO_APP_SHELL_V1.navigate(s),dest);
        assert.equal(result?.ok,true,"Cannot enter "+dest+": "+JSON.stringify(result));
      }else{
        assert.equal(await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.getActive()),"home");
      }
      await page.waitForFunction(({api})=>globalThis[api]?.status?.()?.open===true||api==="AO_HOME_APP_V1", {api:owners[dest]},{timeout:30000});
      assert.equal(await page.locator(roots[dest]).count(),1,"Entry DOM missing "+dest);
      let selectedFormationFamily=null;
      if(dest==="learn"){
        const family=page.locator('#ao-learn-modular-root button[data-ao-learn-family]').first();
        await family.click();
        selectedFormationFamily=await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.status().family);
        assert.ok(selectedFormationFamily,"Formation family did not open");
      }
      const entry=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"));
      assert.equal(entry?.ok,true,"Settings failed to open over "+dest);
      await page.locator("#ao-settings-modular-root [data-settings-close]").waitFor({state:"visible"});
      assert.equal(await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1.status().returnSurface),dest,"Settings lost origin "+dest);
      if(["learn","find","apostolate"].includes(dest)){
        assert.equal(await page.evaluate(api=>globalThis[api]?.status?.()?.open===true,owners[dest]),false,"Settings did not dismiss prior "+dest);
      }
      // Back inside Settings is a page turn, not an app-level exit.
      await page.locator('#ao-settings-modular-root [data-settings-route="/settings/accessibility"]').click();
      await page.locator("#ao-settings-modular-root [data-settings-back]").click();
      assert.equal(await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1.status().path),"/settings");
      await page.locator("#ao-settings-modular-root [data-settings-close]").click();
      await page.waitForFunction(({api,dest})=>
        !document.getElementById("ao-settings-modular-root") &&
        globalThis.AO_APP_SHELL_V1?.getActive?.()===dest &&
        (dest==="home" || globalThis[api]?.status?.()?.open===true),
        {api:owners[dest],dest},{timeout:30000});
      assert.equal(await page.locator(roots[dest]).count(),1,"Close returned only a tab label, not "+dest);
      const surface=await page.evaluate(sel=>{
        const el=document.querySelector(sel);
        const st=el?getComputedStyle(el):null;
        const focus=document.activeElement;
        return {visible:Boolean(el?.isConnected&&!el.hidden&&st?.display!=="none"&&st?.visibility!=="hidden"),
          focusHidden:Boolean(focus?.closest?.("[hidden],[inert],[aria-hidden='true']"))};
      },roots[dest]);
      assert.equal(surface.visible,true,"Return screen hidden: "+dest);
      assert.equal(surface.focusHidden,false,"Return focus hidden: "+dest);
      if(dest==="learn"){
        await page.waitForFunction(expected=>globalThis.AO_LEARN_APP_V1?.status?.().family===expected,
          selectedFormationFamily,{timeout:15000});
        assert.equal(await page.locator('#ao-learn-modular-root [data-ao-learn-back]').count()>=1,true,
          "Formation family Back not available after Settings");
      }
      if(dest!=="home"){
        const home=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
        assert.equal(home?.ok,true,"Home fails after Settings return to "+dest);
        await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1.getActive()==="home");
        assert.equal(await page.locator(".homeScreen").count()>=1,true);
      }
      console.log("PASS "+width+"px: "+dest+" -> Settings -> chapter Back -> Close -> genuine "+dest+" -> Home");
    }
    // The LIVE guard must capture the current missal button itself, not an
    // obsolete native select. A future Mass default remains unchanged on LIVE.
    const marker=await page.evaluate(async()=>{
      await globalThis.AO_APP_SHELL_V1.navigate("settings");
      globalThis.AO_SETTINGS_APP_V1.setRoute("/settings/mass");
      return !!document.querySelector('[data-pref-path="mass.defaultForm"][data-pref-value="low"][data-setting-structural]');
    });
    assert.equal(marker,true,"Mass ceremony word bypasses structural guard");
    await page.locator("#ao-settings-modular-root [data-settings-close]").click();
    assert.deepEqual(errors,[],"Uncaught browser errors "+errors.slice(0,3).join(" / "));
    await context.close();
  }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
