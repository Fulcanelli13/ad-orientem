import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const folder=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const file=resolve(folder,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(!file.startsWith(folder+sep)){res.writeHead(403);res.end();return}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e))}
});
await new Promise(ok=>server.listen(4236,"127.0.0.1",ok));
let browser;
async function nav(page,route,options={}){
  const result=await page.evaluate(({route,options})=>globalThis.AO_APP_SHELL_V1.navigate(route,options),{route,options});
  assert.equal(result?.ok,true,"Cannot open "+route+": "+JSON.stringify(result));
}
async function toBack(page){
  await nav(page,"learn");
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.status().returnAvailable),true,
    "Prayer position was not captured before opening Formation");
  await page.evaluate(()=>history.back());
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray"&&
    globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:20000});
}
try{
  browser=await chromium.launch({headless:true});
  for(const width of [320,390])for(const language of ["en","fr"]){
    const context=await browser.newContext({viewport:{width,height:width===320?640:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4236/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.().visibleOwner&&globalThis.AO_SETTINGS_APP_V1?.status?.().installed,null,{timeout:30000});
    await nav(page,"settings");
    await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
    await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
    await page.locator('#ao-settings-modular-root [data-settings-close]').click();
    await page.waitForFunction(lang=>document.documentElement.lang===lang,language,{timeout:10000});
    await nav(page,"pray");
    const prayer=page.locator("#aoPray435930.open"), mount=prayer.locator(".aoP435930Mount");
    await prayer.waitFor({state:"visible",timeout:20000});

    // Exact Stations card and its paragraph-scrolling region survive real Back.
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.stations")),true);
    await prayer.locator('[data-p435930-station-step="5"]').click();
    const sessionToggle=prayer.locator('[data-p435930-session-language]');
    const initialPrayerLanguage=(await sessionToggle.innerText()).trim();
    await sessionToggle.click();
    const selectedPrayerLanguage=(await sessionToggle.innerText()).trim();
    assert.notEqual(selectedPrayerLanguage,initialPrayerLanguage,
      "Reader language control did not change language");
    await page.waitForFunction(()=>document.querySelector('#aoPray435930 .aoP435930Mount')?.dataset.aoPrayView==="stations");
    assert.equal(await prayer.locator('[data-p435930-station-step="5"]').getAttribute("aria-current"),"step");
    const stationsScroll=await page.evaluate(()=>{
      const card=document.querySelector("#aoPray435930 [data-ao-devo-card='station-6'] .aoDevoCardScroll");
      if(!card)throw Error("Station six card absent");
      card.scrollTop=115;card.dispatchEvent(new Event("scroll",{bubbles:true}));return card.scrollTop;
    });
    await toBack(page);
    assert.equal(await mount.getAttribute("data-ao-pray-view"),"stations");
    assert.equal(await prayer.locator('[data-p435930-station-step="5"]').getAttribute("aria-current"),"step");
    assert.equal((await prayer.locator('[data-p435930-session-language]').innerText()).trim(),
      selectedPrayerLanguage,"Prayer session language lost on browser Back");
    assert.equal(await prayer.locator("[data-ao-devo-card='station-6']").count(),1);
    await page.waitForTimeout(180);
    const afterStations=await page.evaluate(()=>document.querySelector("#aoPray435930 [data-ao-devo-card='station-6'] .aoDevoCardScroll")?.scrollTop);
    assert.ok(Math.abs(afterStations-stationsScroll)<=4,
      "Stations paragraph scroll was lost: "+stationsScroll+" -> "+afterStations);

    // Angelus: horizontal card position is source-owned. Back must not reset
    // card 3 to the first card or disable the existing paragraph focus controller.
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus"));
    await prayer.locator('[data-ao-devo-jump="2"]').click();
    assert.equal(await prayer.locator('[data-ao-devo-jump="2"]').getAttribute("aria-current"),"step");
    await toBack(page);
    assert.equal(await mount.getAttribute("data-ao-pray-view"),"angelus");
    assert.equal(await prayer.locator('[data-ao-devo-jump="2"]').getAttribute("aria-current"),"step");
    assert.ok(await prayer.locator(".aoDevoParagraph").count()>0,"Angelus paragraphs disappeared");
    await page.waitForFunction(()=>Boolean(document.querySelector(
      "#aoPray435930 .aoDevoCard:not([hidden]) .aoDevoParagraph[data-ao-devo-active='true']"
    )),null,{timeout:10000});

    // Library: previous selected prayer reopens with its own local focus scroll.
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library"));
    const first=prayer.locator("[data-p435930-lib-open]").first();
    const prayerId=await first.getAttribute("data-p435930-lib-open");
    assert.ok(prayerId);
    await first.click();
    assert.equal(await prayer.locator('[data-ao-devo-card="'+prayerId+'"]').count(),1);
    await toBack(page);
    assert.equal(await mount.getAttribute("data-ao-pray-view"),"library");
    assert.equal(await prayer.locator('[data-ao-devo-card="'+prayerId+'"]').count(),1,
      "Returning to Prayer shows the library instead of the chosen prayer");

    // A deliberate fresh Prayer tab entry is NOT a browser Back continuation.
    await nav(page,"learn");
    await nav(page,"pray");
    assert.equal(await mount.getAttribute("data-ao-pray-view"),"home","Fresh Prayer tab must open its hub");

    // Confession/examination entries contain private preparation state:
    // never resume them implicitly through browser history.
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession"));
    await nav(page,"learn");
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.status().returnAvailable),false,
      "Confession must not create an implicit restoration receipt");
    await page.evaluate(()=>history.back());
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray"&&
      globalThis.AO_PRAY_APP_V1?.status?.().open===true,null,{timeout:20000});
    assert.equal(await mount.getAttribute("data-ao-pray-view"),"home",
      "Confession was silently resumed after leaving the module");

    assert.deepEqual(errors,[],"Browser errors at "+width+"px "+language+": "+errors.join(" | "));
    console.log("PASS P4 "+width+"px "+language+": Stations step+paragraph, Angelus card+focus, Library prayer, fresh tab and Confession privacy");
    await context.close();
  }
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}