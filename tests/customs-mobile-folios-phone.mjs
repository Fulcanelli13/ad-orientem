import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dest=resolve(root,"artifacts/customs-mobile-folios");
await mkdir(dest,{recursive:true});
const corpus=[
  ...JSON.parse(await readFile(resolve(root,"data/customs/customs-p0-guidance-en-fr.v1.json"),"utf8")).entries,
  ...JSON.parse(await readFile(resolve(root,"data/customs/customs-p1-guidance-en-fr.v1.json"),"utf8")).entries,
];
assert.equal(corpus.length,11);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const name=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(name!==root&&!name.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const content=await readFile(name);
    res.writeHead(200,{"content-type":mime[extname(name)]||"application/octet-stream","cache-control":"no-store"});res.end(content);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const origin="http://127.0.0.1:"+server.address().port;
const measurements=[];
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const spec of [{width:320,height:700,language:"fr"},{width:390,height:844,language:"en"},{width:768,height:900,language:"fr"}]){
    const {width,height,language}=spec,locale=language==="fr"?"fr-FR":"en-GB";
    const context=await browser.newContext({viewport:{width,height},hasTouch:width<600,isMobile:width<600,locale,deviceScaleFactor:1});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:65000});
    await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_RUNTIME_V8?.store?.getState),null,{timeout:50000});
    const set=await page.evaluate(lang=>{
      globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:lang});
      return globalThis.AO_RUNTIME_V8.store.getState().language;
    },language);
    assert.equal(set,language,"French/English application language must actually change");
    const navigated=await page.evaluate(async()=>globalThis.AO_APP_SHELL_V1.navigate("find"));
    assert.equal(navigated?.ok,true,"Explore route unavailable");
    for(const guide of corpus){
      const ok=await page.evaluate(async id=>globalThis.AO_FIND_APP_V1.open({
        lens:"traditions",view:"list",query:"",customId:id,expandDetail:true
      }),guide.custom_id);
      assert.equal(ok,true,guide.custom_id+" did not open through the existing Explore owner");
      const sheet=page.locator(".aoExploreTraditionSheet");
      await sheet.waitFor({state:"visible",timeout:15000});
      const ui=await page.evaluate(()=>{
        const sheet=document.querySelector(".aoExploreTraditionSheet"),lead=sheet?.querySelector(".aoExploreLead"),text=sheet?.querySelector(".aoExploreSections article p");
        const rect=sheet?.getBoundingClientRect(),computed=lead?getComputedStyle(lead):null;
        return {selected:sheet.getAttribute("data-explore-custom-id"),
          headings:[...sheet.querySelectorAll("header h2")].map(e=>e.textContent),
          eyebrow:sheet.querySelector("header small")?.textContent,
          subtitle:sheet.querySelector("header p")?.textContent??null,
          factCards:sheet.querySelectorAll(".aoFindFacts>div").length,
          evidencePanels:sheet.querySelectorAll(".aoTraditionEvidence").length,
          firstSectionTop:sheet.querySelector(".aoExploreSections article")?.getBoundingClientRect().top,
          text:sheet.textContent,
          sheetWidth:rect?.width,viewportWidth:innerWidth,
          sheetOverflow:sheet?.scrollWidth>sheet?.clientWidth+2,
          fontSize:Number.parseFloat(computed?.fontSize??"0"),
          lineHeight:Number.parseFloat(computed?.lineHeight??"0"),
          bodyOverflow:document.documentElement.scrollWidth>innerWidth+3,
          sectionFont:Number.parseFloat(text?getComputedStyle(text).fontSize:"0"),
          sourceLinks:sheet.querySelectorAll(".aoFindSources a[href^='https://']").length,
          nonPlacePins:sheet.querySelectorAll("[data-explore-open-place]").length,
          closeHeight:sheet.querySelector("header button")?.getBoundingClientRect().height,
        };
      });
      assert.equal(ui.selected,guide.custom_id,"exact canonical folio identity lost");
      const title=language==="fr"?guide.title_fr:guide.title_en;
      assert.ok(ui.headings.includes(title),guide.custom_id+" wrong localized title: wanted="+JSON.stringify(title)+" received="+JSON.stringify(ui.headings)+" runtimeLang="+language);
      assert.ok(ui.text.includes(language==="fr"?guide.description_fr:guide.description_en),guide.custom_id+" localized description missing");
      assert.ok(ui.text.includes(language==="fr"?guide.meaning_fr:guide.meaning_en),"missing spiritual meaning");
      assert.ok(ui.text.includes(language==="fr"?guide.how_fr:guide.how_en),"missing optional practice");
      assert.ok(ui.text.includes(language==="fr"?guide.caution_fr:"Pastoral context"),"pastoral boundary missing");
      assert.equal(ui.eyebrow,language==="fr"?"COUTUME · VIE CATHOLIQUE":"CUSTOM · CATHOLIC LIFE","untranslated eyebrow");
      if(guide.scope_fr){assert.equal(ui.subtitle,language==="fr"?guide.scope_fr:guide.scope_en,"geographic scope must be localized");}
      else{assert.equal(ui.subtitle,null,"remove untranslated family label");}
      assert.equal(ui.factCards,0,"single national witness must not produce a redundant Period tile");
      assert.equal(ui.evidencePanels,0,"single national witness must not duplicate documented examples");
      assert.ok(ui.firstSectionTop<height,"spiritual meaning should begin in opening viewport");
      assert.ok(ui.sourceLinks>=1,"no direct independent source links");
      assert.equal(ui.nonPlacePins,0,"inferred national pin is forbidden");
      assert.ok(ui.sheetWidth<=ui.viewportWidth+2&&!ui.sheetOverflow&&!ui.bodyOverflow,"mobile horizontal overflow: "+JSON.stringify(ui));
      assert.ok(ui.fontSize>=14.5&&ui.lineHeight>=22&&ui.sectionFont>=14.5,"folio text too small: "+JSON.stringify(ui));
      assert.ok(ui.closeHeight>=43,"close target too small");
      await sheet.screenshot({path:resolve(dest,language+"-"+width+"-"+guide.custom_id+"-top.png")});
      await sheet.evaluate(el=>el.scrollTop=el.scrollHeight);
      if(["ADVT-001","XMAS-001","HTHU-001"].includes(guide.custom_id)){
        await sheet.screenshot({path:resolve(dest,language+"-"+width+"-"+guide.custom_id+"-sources.png")});
      }
      measurements.push({language,width,id:guide.custom_id,font:ui.fontSize,sectionFont:ui.sectionFont,lineHeight:ui.lineHeight,sourceLinks:ui.sourceLinks,sheetWidth:ui.sheetWidth});
    }
    // Verify the released Calendar's own complete seasonal article.
    if(width===390){
      await page.evaluate(()=>globalThis.AO_FIND_APP_V1.close());
      const opened=await page.evaluate(async()=>globalThis.AO_APP_SHELL_V1.navigate("calendar"));
      assert.equal(opened?.ok,true,"Calendar destination not available");
      await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.select),null,{timeout:20000});
      const selected=await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.select("2026-12-16"));
      assert.equal(selected,true,"Calendar could not select the Posadas source date");
      const article=page.locator('.aoCalCustomsBlock [data-cal-custom-id="ADVT-003"]');
      await article.waitFor({state:"visible",timeout:20000});
      assert.match(await article.locator(":scope > summary").innerText(),/Las Posadas/);
      await article.locator(":scope > summary").click();
      assert.ok(await article.locator(".aoCalCustomArticleContent a[href^='https://']").count()>0,
        "Native Calendar article must retain independently attributed sources");
      assert.equal(await page.locator(".aoExploreTraditionSheet").count(),0,
        "Calendar customs expand in-place, not in a duplicate Explore folio");
      await article.screenshot({path:resolve(dest,"en-390-calendar-inline-las-posadas.png")});
    }
    assert.deepEqual(errors,[],"uncaught phone runtime errors: "+errors.join("\n"));
    await context.close();
  }
  await writeFile(resolve(dest,"audit.json"),JSON.stringify({profiles:measurements.length,measurements},null,2));
  console.log("PASS Customs Atlas 33 EN/FR mobile/tablet full folios: legibility, overflow, exact identity, source links and screenshots");
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
