// Public production DOM audit of exact user-approved Nov 1–2 Calendar paintings.
// This does not approve image bytes, reproduce artwork, or alter app state server-side.
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {chromium} from "@playwright/test";
import {APPROVED_CLASS_I_2026} from "../src/calendar/approved-class-i-heroes-2026.js";

const origin=new URL(process.env.AO_ART_PUBLIC_ORIGIN||"https://ad-orientem.vercel.app/");
assert.equal(origin.protocol,"https:");
assert.equal(origin.hostname,"ad-orientem.vercel.app");
const out=resolve("artifacts/artwork-publication-truth");
await mkdir(out,{recursive:true});
const cases=[
 {date:"2026-11-01",width:390,language:"en",local:"2026-11-01T08:30:00+04:00"},
 {date:"2026-11-02",width:320,language:"fr",local:"2026-11-02T08:30:00+04:00"},
];
const report={schema:"AO_PUBLIC_CALENDAR_APPROVED_HERO_DOM_V1",target:origin.origin,
 performedAt:new Date().toISOString(),cases:[],actualImageBytesVisuallyApproved:false};
const browser=await chromium.launch({headless:true});
try{
 for(const test of cases){
  const expected=APPROVED_CLASS_I_2026.find(x=>x.date===test.date);
  assert.ok(expected&&expected.image,"No approved candidate preview for "+test.date);
  const ctx=await browser.newContext({viewport:{width:test.width,height:844},
    isMobile:true,hasTouch:true,locale:test.language==="fr"?"fr-FR":"en-GB",
    timezoneId:"Indian/Mauritius",serviceWorkers:"block",reducedMotion:"reduce"});
  const row={date:test.date,language:test.language,width:test.width,
    expectedArtId:expected.artworkId,expectedTitle:expected.title,
    expectedArtist:expected.artist,publicationStatus:expected.imagePublicationStatus,
    failures:[]};
  try{
   const page=await ctx.newPage(),pageErrors=[];
   page.on("pageerror",e=>pageErrors.push(String(e.message).slice(0,350)));
   await page.clock.setFixedTime(new Date(test.local));
   const response=await page.goto(origin.href+"?aoR17Reader=native&qa=approved-artwork",
     {waitUntil:"domcontentloaded",timeout:90000});
   assert.equal(response?.status(),200);
   await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']")
     .waitFor({state:"visible",timeout:45000});
   if(test.language==="fr"){
     await page.evaluate(()=>window.AO_SETTINGS_APP_V1.open("/settings/language-reading"));
     await page.locator('[data-pref-path="general.uiLanguage"][data-pref-value="fr"]')
       .click({timeout:12000});
     await page.waitForFunction(()=>window.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr",
       null,{timeout:12000});
     await page.locator("#ao-settings-modular-root [data-settings-close]").click();
     await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']")
       .waitFor({state:"visible",timeout:12000});
   }
   await page.locator(".aoH7HomeView .date[data-home-calendar-view='picker']").click();
   const day=page.locator(".aoH4CalendarViews [data-home-calendar-view='day']");
   await day.waitFor({state:"visible",timeout:18000});
   await day.click();
   await page.waitForFunction(()=>window.AO_CALENDAR_APP_V1?.status?.().view==="day",
     null,{timeout:18000});
   const didSelect=await page.evaluate(date=>window.AO_CALENDAR_APP_V1.select(date),test.date);
   assert.equal(didSelect,true,"Calendar refused exact date selection");
   const figure=page.locator(".aoTodayV2CalendarInline #ao-calendar-modular-root "+
     ".aoClassIApprovedHero[data-ao-class-i-date='"+test.date+"']");
   await figure.waitFor({state:"visible",timeout:45000});
   const facts=await figure.evaluate(node=>{
     const im=node.querySelector("img");
     const rect=node.getBoundingClientRect();
     return {id:node.dataset.aoArtworkId,status:node.dataset.aoImageStatus,
       title:node.querySelector("figcaption strong")?.textContent?.trim(),
       artist:node.querySelector("figcaption span")?.textContent?.trim(),
       alt:im?.alt,src:im?.src,source:node.querySelector("figcaption a")?.href,
       visible:rect.width>0&&rect.height>0};
   });
   assert.equal(facts.id,expected.artworkId,"Production Calendar showed wrong painting ID");
   assert.equal(facts.title,expected.title,"Production Calendar displayed wrong artwork title");
   assert.equal(facts.artist,expected.artist,"Production Calendar displayed wrong artist");
   assert.equal(facts.alt,expected.title+" — "+expected.artist,"Painting alt identity mismatched");
   assert.equal(facts.src,expected.image,"Production uses unexpected artwork reproduction");
   assert.equal(facts.source,expected.source,"Artwork source credit changed");
   assert.equal(facts.status,expected.imagePublicationStatus);
   assert.equal(facts.visible,true);
   await figure.locator("img").scrollIntoViewIfNeeded();
   await page.waitForFunction(sel=>{
     const im=document.querySelector(sel);
     return !!im?.complete;
   },".aoTodayV2CalendarInline .aoClassIApprovedHero[data-ao-class-i-date='"+
       test.date+"'] img",{timeout:14000}).catch(()=>{});
   row.image=await figure.locator("img").evaluate(im=>({
     complete:im.complete,decoded:im.complete&&im.naturalWidth>0,
     width:im.naturalWidth,height:im.naturalHeight}));
   row.pageOverflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));
   assert.ok(row.pageOverflow<=1,"Calendar page overflows "+test.width+"px by "+row.pageOverflow);
   assert.deepEqual(pageErrors,[],"Public calendar page JS exceptions");
   const screenshot="calendar-approved-hero-"+test.date+"-"+test.language+
     "-"+test.width+".png";
   await page.screenshot({path:resolve(out,screenshot),animations:"disabled"});
   row.screenshot=screenshot;row.pass=true;
   // The preview may load but still not be a verified full-resolution,
   // colour-faithful, frameless or legally cleared reproduction.
   row.originalMasterCertified=false;
   console.log("PASS public Calendar hero "+test.date+" "+expected.artist+
     " identity; remote image decoded="+row.image.decoded);
  }catch(e){row.pass=false;row.failures.push(String(e?.stack??e).slice(0,1500));
   console.error("FAIL Calendar approved painting "+test.date+": "+row.failures[0]);}
  finally{report.cases.push(row);await ctx.close();}
 }
}finally{await browser.close();}
report.allIdentityPassed=report.cases.length===cases.length&&
 report.cases.every(x=>x.pass);
await writeFile(resolve(out,"public-calendar-hero-report.json"),JSON.stringify(report,null,2)+"\n");
assert.equal(report.allIdentityPassed,true,
 "Public Class I Calendar hero identity mismatch; inspect CI artifact");
