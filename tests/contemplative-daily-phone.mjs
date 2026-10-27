import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Real existing Prayer renderer, not a recreated demonstration.
const root = resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures = resolve(root,"artifacts/pray-contemplative-daily");
await mkdir(captures,{recursive:true});
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
  ".css":"text/css; charset=utf-8",".png":"image/png",".svg":"image/svg+xml",
  ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
  try {
    const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+name);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end();}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  } catch(e) {res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok);});
const base="http://127.0.0.1:"+server.address().port+"/index.html";
let browser;
const results=[];
try{
  browser=await chromium.launch({headless:true});
  for(const width of [320,390,768,1440]){
    const phone=width<600;
    const page=await browser.newPage({viewport:{width,height:phone?(width===320?720:844):900},
      isMobile:phone,hasTouch:phone,deviceScaleFactor:1,
      serviceWorkers:"block",reducedMotion:"reduce"});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    try{
      await page.goto(base+"?aoPrayReader=contemplative",{waitUntil:"domcontentloaded",timeout:90000});
      await page.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
      assert.equal(await page.evaluate(()=>window.AO_PRAY_APP_V1.open()),true);
      assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.morning_evening",{returnContext:null})),true);
      const target="#aoPray435930[data-ao-contemplative-daily='guided']";
      await page.waitForSelector(target+" .aoDevoSequenceTimeline",{timeout:30000});
      const initial=await page.evaluate(()=>{
        const r=document.querySelector("#aoPray435930"),m=r.querySelector(".aoP435930Mount"),
          b=m.querySelector(".aoDevoCardScroll"),h=b.querySelector(".aoTP381GuideCard>h2"),
          t=m.querySelector(".aoDevoSequenceTimeline");
        const rect=b.getBoundingClientRect(),style=getComputedStyle(b);
        return {route:m.dataset.aoTraditionalPrayRoute,mode:r.dataset.aoContemplativeDaily,
          kind:m.dataset.aoTraditionalDualAxis,count:t.querySelectorAll(".aoDevoStop").length,
          dots:t.querySelectorAll(".aoDevoStop[aria-label]").length,
          touchTarget:t.querySelector(".aoDevoStop")?.getBoundingClientRect().width,
          active:t.querySelectorAll("[aria-current='step']").length,
          current:Number(m.querySelector(".aoDevoCard").dataset.aoDevoIndex),
          text:b.innerText.slice(0,200),heading:h?.textContent,fontSize:parseFloat(style.fontSize),
          lineHeight:style.lineHeight,overflow:style.overflowY,rect:{left:rect.left,right:rect.right,width:rect.width},
          rootScroll:document.documentElement.scrollWidth,viewport:innerWidth,
          background:getComputedStyle(r.querySelector(".aoP435930Sheet")).backgroundImage};
      });
      assert.deepEqual([initial.route,initial.mode,initial.kind,initial.count,initial.dots,initial.active,initial.current],
        ["pray.morning_evening","guided","daily",12,12,1,0],"Canonical Morning sequence/progress or accessibility lost");
      assert.ok(initial.rect.left>=-1&&initial.rect.right<=width+1,"Daily prayer overflows viewport "+JSON.stringify(initial.rect));
      assert.ok(initial.rootScroll<=width+1,"Page overflow at "+width+"px");
      assert.ok(initial.touchTarget>=43,"Stage navigation target below 44px: "+initial.touchTarget);
      assert.ok(initial.heading&&initial.text.length>25,"Opening prayer missing");
      assert.ok(initial.background.includes("gradient"),"Contemplative background missing");
      await page.screenshot({path:resolve(captures,"morning-"+width+".png"),animations:"disabled"});
      await page.locator(target+" .aoDevoStop[data-ao-devo-chapter='2']").click();
      await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoDevoCard")?.dataset.aoDevoIndex==="2");
      const flip=page.locator(target+" [data-tp381-flip]").first();
      assert.equal(await flip.count(),1,"Latin face missing");
      const before=await flip.innerText();
      await flip.click();
      const after=await flip.innerText();
      assert.notEqual(after,before,"Latin flip did not change prayer text");
      assert.match(after,/Pater noster/i,"Latin prayer text has changed or disappeared");
      // Reading remains fully legible after the Latin face switch; the
      // default paragraph-focus algorithm must not dim this prayer to 30%.
      await page.waitForFunction(()=>{
        const mount=document.querySelector("#aoPray435930[data-ao-contemplative-daily='guided']");
        if(!mount)return false;
        const verses=[...mount.querySelectorAll(".aoDevoCardScroll .aoDevoParagraph")]
          .filter(el=>el.getClientRects().length && el.textContent?.trim());
        return verses.length>0&&verses.every(el=>Number.parseFloat(getComputedStyle(el).opacity)>=0.98);
      },null,{timeout:6000});

      await page.screenshot({path:resolve(captures,"our-father-"+width+".png"),animations:"disabled"});
      await page.locator(target+" [data-tp381-daypart='evening']").click();
      await page.waitForFunction(()=>document.querySelector("#aoPray435930 .aoDevoSequenceTimeline")?.querySelectorAll(".aoDevoStop").length===14);
      const count=await page.locator(target+" .aoDevoSequenceTimeline .aoDevoStop").count();
      assert.equal(count,14,"Canonical Evening sequence altered");
      await page.locator(target+" .aoDevoStop[data-ao-devo-chapter='9']").click();
      assert.equal(await page.locator(target+" .aoDevoCard").getAttribute("data-ao-devo-index"),"9");
      await page.screenshot({path:resolve(captures,"evening-"+width+".png"),animations:"disabled"});
      assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.stations",{returnContext:null})),true);
      await page.waitForFunction(()=>!document.querySelector("#aoPray435930")?.hasAttribute("data-ao-contemplative-daily"),null,{timeout:12000});
      assert.deepEqual(errors,[],"Browser errors at "+width+"px: "+errors.join(" | "));
      results.push({width,morningCount:initial.count,eveningCount:count,routeLeak:false,errors:0});
      console.log("PASS "+width+"px: canonical 11/13 morning/evening, Latin flip, context isolation");
    }finally{await page.close();}
  }
  // French and Latin are exercised through the production settings UI, not mock text.
  const frenchPage=await browser.newPage({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,serviceWorkers:"block",locale:"fr-FR",reducedMotion:"reduce"});
  try{
    await frenchPage.goto(base+"?aoPrayReader=contemplative",{waitUntil:"domcontentloaded",timeout:90000});
    await frenchPage.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
    await frenchPage.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"));
    await frenchPage.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
    await frenchPage.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
    await frenchPage.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr");
    await frenchPage.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("home"));
    assert.equal(await frenchPage.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
    assert.equal(await frenchPage.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.morning_evening",{returnContext:null})),true);
    await frenchPage.waitForSelector("#aoPray435930[data-ao-contemplative-daily='guided'] .aoDevoSequenceTimeline");
    assert.match(await frenchPage.locator("#aoPray435930 .aoTP381DaypartStrip").innerText(),/Matin\s+Soir/);
    await frenchPage.locator("#aoPray435930 .aoDevoStop[data-ao-devo-chapter='2']").click();
    const frenchFlip=frenchPage.locator("#aoPray435930 [data-tp381-flip]").first();
    const vernacular=await frenchFlip.innerText();
    assert.match(vernacular,/Notre Père/i,"Approved French canonical Our Father missing");
    await frenchFlip.click();
    assert.match(await frenchFlip.innerText(),/Pater noster/i,"French-to-Latin face missing");
    assert.ok(await frenchPage.locator("#aoPray435930 .aoDevoCardScroll .aoDevoParagraph")
      .evaluateAll(nodes=>nodes.filter(el=>el.getClientRects().length).every(el=>Number.parseFloat(getComputedStyle(el).opacity)>=0.98)),
      "French-to-Latin prayer text cannot be muted in contemplative mode");
    await frenchPage.screenshot({path:resolve(captures,"french-latin-390.png"),animations:"disabled"});
    console.log("PASS 390px French UI and French-to-Latin Prayer text");
  } finally { await frenchPage.close(); }
  // Without the explicit flag, the live app must remain in its current design.
  const defaultPage=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:"block"});
  try{
    await defaultPage.goto(base,{waitUntil:"domcontentloaded",timeout:90000});
    await defaultPage.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
    assert.equal(await defaultPage.evaluate(()=>window.AO_PRAY_APP_V1.open()),true);
    assert.equal(await defaultPage.evaluate(()=>window.AO_PRAY_V435930.open("pray.morning_evening",{returnContext:null})),true);
    assert.equal(await defaultPage.locator("#aoPray435930[data-ao-contemplative-daily]").count(),0);
    assert.equal(await defaultPage.evaluate(()=>Boolean(window.AO_CONTEMPLATIVE_DAILY_PREVIEW_V1)),false);
    console.log("PASS unflagged production Prayer reader unchanged");
  }finally{await defaultPage.close();}
  await writeFile(resolve(captures,"acceptance.json"),JSON.stringify(results,null,2));
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
