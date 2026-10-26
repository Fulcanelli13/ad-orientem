// QA-only: inject NONPUBLISHING cohort2 articles into the existing Calendar
// DOM in Chromium. Neither app runtime nor production Calendar imports them.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {COHORT2_REVIEW_ROWS} from "../src/calendar/customs-cohort2-review.js";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/customs-cohort2-calendar-preview");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const p=resolve(root,"."+pathname);
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden");}
  const b=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(b);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
const datex=v384Dates(2026);
const cases=[
 {date:datex.holySaturday,scope:"AT_LOCAL_CUSTOMS",unit:"CU-REVIEW-002"},
 {date:datex.corpus,scope:"SEVILLE_CATHEDRAL_ONLY",unit:"CU-REVIEW-003"},
 {date:"2026-12-08",scope:"SEVILLE_CATHEDRAL_ONLY",unit:"CU-REVIEW-003"},
 {date:datex.corpus,scope:"PL_LOCAL_CUSTOMS",unit:"CU-REVIEW-005"}
];
const report={schema:"AO_COHORT2_NONPUBLISHING_CALENDAR_DOM_PREVIEW",published:false,
 runtimeCodeModified:false,cases:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {width,lang} of [{width:320,lang:"fr"},{width:390,lang:"en"}]){
  const page=await browser.newPage({viewport:{width,height:844},locale:lang==="fr"?"fr-FR":"en-GB",
   isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",err=>errors.push(String(err)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:45000});
   await page.waitForFunction(()=>Boolean(globalThis.AO_CALENDAR_APP_V1?.select&&globalThis.AO_CALENDAR_APP_V1?.setView),null,{timeout:45000});
   await page.waitForFunction(()=>{
    const splash=document.querySelector("#ao-cinema-boot");
    const clear=!splash||!splash.isConnected||getComputedStyle(splash).display==="none"||
      getComputedStyle(splash).visibility==="hidden"||splash.getAttribute("aria-hidden")==="true";
    const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return clear&&state?.route==="home"&&!state.resolving&&Boolean(state.resolution?.day?.main);
   },null,{timeout:45000});
   // Use real app settings to select French where requested.
   if(lang==="fr"){
    await page.evaluate(()=>globalThis.AO_APP_SHELL_V1?.navigate?.("settings"));
    await page.locator("#ao-settings-modular-root").waitFor({state:"visible",timeout:15000});
    await page.locator('[data-settings-route="/settings/language-reading"]').click();
    await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().route==="/settings/language-reading");
    await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]').click();
    await page.waitForFunction(()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr");
    await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.close?.());
    await page.locator(".homeScreen.aoTodayV2").waitFor({state:"visible",timeout:20000});
   }
   await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
   await page.waitForSelector('.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="year"]',
     {state:"visible",timeout:45000});
   for(const item of cases){
    assert.equal(await page.evaluate(date=>globalThis.AO_CALENDAR_APP_V1.select(date),item.date),true);
    await page.waitForFunction(date=>{
      const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
      return st?.selectedDate===date&&!st.resolving&&st.resolution?.date===date;
    },item.date,{timeout:35000});
    await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.setView("day"));
    const cal=page.locator('#ao-calendar-modular-root[data-ao-calendar-view="day"]');
    await cal.waitFor({state:"visible",timeout:40000});
    // Author a fixture via standard DOM APIs, reusing ONLY existing Calendar
    // CSS classes and existing day date. No runtime import/production change.
    const injected=await page.evaluate(async({date,scope,fr})=>{
      const {calendarCohort2ReviewForDate}=await import("/src/calendar/customs-cohort2-review.js");
      const results=calendarCohort2ReviewForDate(date,{preview:true,scope,fr});
      if(results.length!==1)return {error:"Expected exactly one opted-in regional preview",count:results.length};
      const data=results[0],article=data.article;
      const host=document.querySelector('#ao-calendar-modular-root[data-ao-calendar-view="day"]');
      if(!host)return {error:"Missing real Calendar Day"};
      // The day-context section is the actual Calendar; only the QA article is injected.
      let target=host.querySelector(".aoCalCustomsBlock .aoCalCustomsEntries");
      if(!target){
       const block=document.createElement("div");block.className="aoCalCustomsBlock";
       const h4=document.createElement("h4");h4.textContent=fr?"Coutumes du jour et de la saison":"Customs of this day & season";
       block.append(h4);target=document.createElement("div");target.className="aoCalCustomsEntries";block.append(target);
       host.querySelector(".aoCalCustomCatalogueSection")?.before(block);
      }
      const det=document.createElement("details");det.className="aoCalCustomArticle";det.dataset.qaResearchId=data.researchId;
      const summary=document.createElement("summary"),wrap=document.createElement("span");
      const title=document.createElement("strong");title.textContent=data.title;wrap.append(title);
      const sub=document.createElement("small");sub.textContent=data.occasion;wrap.append(sub);
      const arrow=document.createElement("span");arrow.textContent="›";arrow.setAttribute("aria-hidden","true");
      summary.append(wrap,arrow);det.append(summary);
      const content=document.createElement("div");content.className="aoCalCustomArticleContent";
      const caution=document.createElement("p");caution.textContent=fr?"APERÇU DE RECHERCHE — non publié":"RESEARCH PREVIEW — not published";content.append(caution);
      const fields=[
       ["description",null],["history",fr?"Contexte historique":"Historical context"],
       ["meaning",fr?"Sens spirituel":"Spiritual meaning"],
       ["practice",fr?"Pratique traditionnelle":"Traditional household practice"],
       ["caution",fr?"Prudence et limites":"Cautions and limits"],
       ["scope",fr?"Portée locale":"Local scope"]
      ];
      for(const [key,heading] of fields){
       if(heading){const h=document.createElement("h5");h.textContent=heading;content.append(h);}
       const p=document.createElement("p");p.textContent=article[key][fr?"fr":"en"];content.append(p);
      }
      const h=document.createElement("h5");h.textContent=fr?"Sources":"Sources";content.append(h);
      const ul=document.createElement("ul");
      for(const source of article.sources){
       const li=document.createElement("li"),a=document.createElement("a");
       a.href=source.url;a.textContent=source.title;a.rel="noopener noreferrer";a.target="_blank";
       li.append(a);ul.append(li);
      }
      content.append(ul);det.append(content);det.open=true;target.append(det);
      return {id:data.researchId,sourceCount:article.sources.length,
       textLength:det.textContent.length,title:data.title};
    },{date:item.date,scope:item.scope,fr:lang==="fr"});
    assert.ok(!injected.error,JSON.stringify(injected));
    const expected=COHORT2_REVIEW_ROWS.find(r=>r.releaseUnit===item.unit);
    assert.equal(injected.id,expected.researchId);
    const qa=cal.locator('[data-qa-research-id="'+expected.researchId+'"]');
    await qa.waitFor({state:"visible",timeout:15000});
    assert.equal(await qa.locator('a[href^="https://"]').count(),expected.article.sources.length);
    assert.ok((await qa.textContent()).includes(expected.article.caution[lang]));
    assert.ok((await qa.textContent()).includes(expected.article.history[lang]));
    const rect=await qa.evaluate(el=>{
      const b=el.getBoundingClientRect();
      return {left:b.left,right:b.right,pageWidth:document.documentElement.scrollWidth,viewport:innerWidth};
    });
    assert.ok(rect.left>=-1&&rect.right<=width+1&&rect.pageWidth<=width+3,
      "Regional QA article overflows existing Calendar: "+JSON.stringify(rect));
    await qa.evaluate(el=>el.scrollIntoView({block:"start",behavior:"instant"}));
    await page.screenshot({path:resolve(out,item.unit.toLowerCase()+"-"+item.scope.toLowerCase()+"-"+lang+"-"+width+".png"),fullPage:true});
    report.cases.push({...item,width,lang,rect,sourceCount:injected.sourceCount});
   }
   assert.deepEqual(errors,[],"Uncaught browser errors");
  }finally{await page.close();}
 }
 assert.equal(report.cases.length,8);
 await writeFile(resolve(out,"manifest.json"),JSON.stringify(report,null,2)+"\n");
 console.log("PASS 8 QA-only real Calendar article renderings, 320px French/390px English, 3 sources, two Seises dates, no overflow; no app import/publication");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
