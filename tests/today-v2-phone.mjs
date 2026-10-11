import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dir=resolve(root,"artifacts/today-v2-phone");
await mkdir(dir,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
    const body=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(body);
  }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err))}
});
await new Promise(ok=>server.listen(4194,"127.0.0.1",ok));
let browser;
const report=[];
try{
  browser=await chromium.launch({headless:true});
  for(const [width,height] of [[320,660],[360,740],[390,844],[430,932],[1100,840]]){
    const context=await browser.newContext({viewport:{width,height},locale:"en-GB",isMobile:width<700,hasTouch:width<700});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(String(e?.message||e)));
    await page.goto("http://127.0.0.1:4194/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:45000});
    await page.waitForSelector(".homeScreen .aoTodayV2PrayNow",{state:"visible",timeout:12000});
    // The homepage is NOT visually accepted while the launch artwork covers it.
    // A visible DOM underneath a splash is not a usable first-screen experience.
    await page.waitForFunction(()=>{
      const boot=document.getElementById("ao-cinema-boot");
      return !boot||!boot.isConnected||getComputedStyle(boot).display==="none"||
        getComputedStyle(boot).visibility==="hidden"||boot.getAttribute("aria-hidden")==="true";
    },null,{timeout:30000});
    await page.waitForFunction(()=>{
      const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
      return s?.route==="home"&&!s.resolving&&Boolean(s.resolution?.day?.main);
    },null,{timeout:30000});
    // Wait through the existing 540ms hero entrance; a screenshot taken during
    // the blur/fade can falsely depict a missing feast and blank CTA.
    await page.waitForTimeout(950);
    const info=await page.evaluate(()=>{
      const root=document.querySelector(".homeScreen"),hero=root?.querySelector(".aoTodayV2Frontispiece"),
        art=hero?.querySelector(".aoTodayV2Art"),title=art?.querySelector("h1"),
        cta=root?.querySelector(".aoTodayV2PrimaryMass"),rect=cta?.getBoundingClientRect(),
        bottom=cta?.getBoundingClientRect().bottom,sections=[...root.querySelectorAll(".aoTodayV2Zone")].map(x=>x.className);
      return {vw:innerWidth,heroContainsCTA:Boolean(hero?.contains(cta)),heroActionsContainsCTA:Boolean(root.querySelector(".aoTodayV2HeroActions")?.contains(cta)),heroActionsCount:root.querySelectorAll(".aoTodayV2HeroActions").length,heroActionsParent:root.querySelector(".aoTodayV2HeroActions")?.parentElement?.className||null,heroCount:root.querySelectorAll(".aoTodayV2Frontispiece").length,heroInnerEnd:hero?.innerHTML?.slice(-160)||"",ctaParents:cta?[cta.parentElement?.className,cta.parentElement?.parentElement?.className,cta.parentElement?.parentElement?.parentElement?.className]:[],
        splashBlocks: Boolean(document.querySelector("#ao-cinema-boot,#ao-cinema-loader")&&
          [...document.querySelectorAll("#ao-cinema-boot,#ao-cinema-loader")].some(el=>{
            const cs=getComputedStyle(el),r=el.getBoundingClientRect();
            return cs.display!=="none"&&cs.visibility!=="hidden"&&Number(cs.opacity)>.03&&r.width>100&&r.height>100;
          })),
        ctaHit:cta?(()=>{
          const r=cta.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
          return hit===cta||cta.contains(hit);
        })():false,massButtonClasses:[...root.querySelectorAll("[data-home-mass-entry],[data-resume-mass]")].map(x=>x.className),scrollWidth:document.documentElement.scrollWidth,artWidth:art?.getBoundingClientRect().width,
        heroWidth:hero?.getBoundingClientRect().width,cta:!!cta,ctaHeight:rect?.height,ctaBottom:bottom,
        ctaText:cta?.textContent?.trim()||"",ctaBackground:cta?getComputedStyle(cta).backgroundColor:null,
        ctaLabel:(()=>{const label=cta?.querySelector("b");if(!label)return null;
          const cs=getComputedStyle(label),r=label.getBoundingClientRect();
          return {color:cs.color,fill:cs.webkitTextFillColor,opacity:cs.opacity,display:cs.display,
            visibility:cs.visibility,width:r.width,height:r.height,filter:cs.filter};
        })(),
        artworkTitle:title?.textContent?.trim(),sections,
        prayCount:root.querySelectorAll(".aoTodayV2PrayerFeature").length,
        massCount:root.querySelectorAll(".aoTodayV2PrimaryMass").length,
        scriptureCount:root.querySelectorAll("[data-home-scripture]").length,
        periodCount:root.querySelectorAll(".aoTodayV2Context").length,
        dayTabs:root.querySelectorAll(".aoTodayV2Tabs button").length,
        dateLinks:root.querySelectorAll(".aoTodayV2Event[data-home-calendar-date]").length};
    });
    await page.screenshot({path:resolve(dir,"today-v2-"+width+".png"),fullPage:true});
    console.log("TODAY_V2_PHONE_DIAGNOSTIC",JSON.stringify(info));
    assert.equal(info.splashBlocks,false,"An opaque splash or loader still obscures Today at "+width);
    assert.ok(!/Resolving|Loading|Chargement|Résolution/i.test(info.artworkTitle||""),"Liturgical identity unresolved at "+width);
    assert.equal(info.cta,true,"Mass CTA missing at "+width);
    assert.equal(info.heroContainsCTA,true,"Donor artwork escaped and closed the Mass frontispiece at "+width);
    assert.equal(info.ctaHit,true,"Mass CTA is not actually hit-testable above overlays at "+width);
    assert.ok(info.ctaText.length>3&&info.ctaLabel?.width>0&&info.ctaLabel?.height>0&&info.ctaLabel?.opacity==="1"&&info.ctaLabel?.visibility==="visible",
      "Primary Mass action label is hidden at "+width+": "+JSON.stringify(info.ctaLabel));
    assert.notEqual(info.ctaLabel.color,info.ctaBackground,"Mass CTA foreground and background are identical at "+width);
    assert.equal(info.massCount,1,"Duplicate primary Mass entry at "+width);
    assert.ok(info.ctaHeight>=44,"Mass CTA touch target too small at "+width);
    assert.ok(info.scrollWidth<=width+3,"Home horizontal overflow at "+width+": "+JSON.stringify(info));
    assert.ok(info.artWidth>0&&info.heroWidth>0,"Artwork/frontispiece collapsed at "+width);
    assert.ok(info.artworkTitle?.length>0,"Liturgical identity missing at "+width);
    assert.equal(info.prayCount,1,"Duplicate Prayer now at "+width);
    assert.equal(info.scriptureCount,1,"Scripture direct access not preserved at "+width);
    assert.equal(info.periodCount,1,"Calendar context duplicate at "+width);
    assert.equal(info.dayTabs,2,"Month/Year Calendar tabs missing at "+width);
    assert.equal(info.dateLinks,2,"Approaching list missing linked dates at "+width);
    assert.equal(info.sections.length,3,"Expected Pray now, Read & reflect and Approaching at "+width);
    if(width<700)assert.ok(info.ctaBottom<=height-30,"Primary Mass action below the first mobile viewport at "+width+": "+info.ctaBottom);
    assert.deepEqual(errors,[],"Page errors at "+width+": "+JSON.stringify(errors));
    if(width===390){
      await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
      await page.waitForFunction(()=>{
        const c=globalThis.AO_CALENDAR_APP_V1?.status?.();
        return c?.open===true&&c.view==="year";
      },null,{timeout:22000});
      assert.equal(await page.locator("#ao-calendar-modular-root").count(),1,
        "Today Liturgical Year tab did not open canonical Calendar");
      await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.close?.({surface:"home"}));
      await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:10000});
      await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
      await page.waitForFunction(()=>{
        const c=globalThis.AO_CALENDAR_APP_V1?.status?.();
        return c?.open===true&&c.view==="picker";
      },null,{timeout:22000});
      await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1?.close?.({surface:"home"}));
      console.log("TODAY_V2_CALENDAR_HANDOFF_PASS=year+month");
    }
    report.push({width,height,...info,errors});
    await context.close();
  }
  await writeFile(resolve(dir,"report.json"),JSON.stringify(report,null,2));
  console.log("PASS Today v2 phone acceptance: 320/360/390/430 + desktop",JSON.stringify(report.map(r=>({width:r.width,ctaBottom:r.ctaBottom,sections:r.sections.length}))));
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
