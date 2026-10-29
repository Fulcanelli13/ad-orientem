// Real production Mass UI, fresh anonymous Chromium profiles only.
// Does not inject mocked Proper data, modify server state or certify physical handsets.
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const origin=new URL("https://ad-orientem.vercel.app/");
const output=resolve("artifacts/mass-reader-production-smoke");
await mkdir(output,{recursive:true});
const cases=[
  {width:320,form:"MISSA_CANTATA_INCENSE",language:"en",locale:"en-GB"},
  {width:390,form:"SOLEMN",language:"fr",locale:"fr-FR"},
  {width:390,form:"LOW",language:"en",locale:"en-GB"},
];
const report={schema:"AO_MASS_PRODUCTION_VISUAL_QA_V1",origin:origin.origin,
  expectedCommit:process.env.GITHUB_SHA??null,
  startedAt:new Date().toISOString(),cases:[],physicalDeviceVerified:false};
const positions=()=>{const api=window.AO_R17_NATIVE_READER_PREVIEW;
  const s=api?.getScholaState?.()??{};
  return {card:api?.getCurrentCard?.()?.sectionId??null,cue:api?.getActiveCue?.()??null,
    trackId:s.trackId??null,phrase:s.index??null,complete:s.complete??null};
};
const snapshot=async(page,name,c)=> {
  const metrics=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const style=el=>{if(!el)return null;const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return {display:s.display,visibility:s.visibility,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};};
    const iconSlots=[...root?.querySelectorAll(".ao-icon-mask[data-icon-slot]")??[]].filter(el=>!el.hidden);
    return {
      route:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      mode:root?.querySelector("[data-ao-reader-shell]")?.dataset?.mode??null,
      visibleCards:root?.querySelector('[data-role="progress"]')?.textContent?.trim()??null,
      pageOverflow:document.documentElement.scrollWidth>innerWidth+1,
      horizontalPixels:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      stage:style(root),priest:style(root?.querySelector('[data-side="priest"]')),
      faithful:style(root?.querySelector('[data-side="faithful"]')),
      schola:style(root?.querySelector(".ao-schola-dock")),
      iconSlotsVisible:iconSlots.length,
      iconSlotsZeroArea:iconSlots.filter(x=>{
        const r=x.getBoundingClientRect();return r.width<1||r.height<1;
      }).length,
    };
  });
  c.steps.push({name,...metrics});
  await page.screenshot({path:resolve(output,c.width+"-"+c.form+"-"+c.language+"-"+name+".png"),
    animations:"disabled"});
  assert.equal(metrics.pageOverflow,false,name+" has "+metrics.horizontalPixels+"px horizontal overflow");
  return metrics;
};
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const option of cases){
    const c={...option,pass:false,steps:[],pageErrors:[],failedResponses:[]};
    const ctx=await browser.newContext({viewport:{width:option.width,height:844},
      isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:option.locale,
      reducedMotion:"reduce",serviceWorkers:"block"});
    const page=await ctx.newPage();
    page.on("pageerror",e=>c.pageErrors.push(String(e.message??e).slice(0,350)));
    page.on("response",r=>{if(r.status()>=400&&r.url().startsWith(origin.origin)&&c.failedResponses.length<20)
      c.failedResponses.push({status:r.status(),url:r.url()});});
    try{
      const response=await page.goto(origin.href+"?aoR17Reader=native&qa=mass-reader-phone",
        {waitUntil:"domcontentloaded",timeout:90000});
      assert.equal(response?.status(),200,"Public Vercel entry must return HTTP 200");
      await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
        null,{timeout:60000});
      const massNav=page.locator('[data-ao-app-surface="mass"]');
      await massNav.waitFor({state:"visible",timeout:35000});
      await massNav.click();
      await page.waitForSelector("[data-ao-start-live]",{state:"visible",timeout:45000});
      const ceremony=page.locator('[data-folio-goto="ceremony"]');
      if(await ceremony.isVisible())await ceremony.click();
      const form=page.locator('[data-full-mass-form][value="'+option.form+'"]');
      await form.waitFor({state:"attached",timeout:18000});
      await form.check();
      const reader=page.locator('[data-folio-goto="reader"]');
      if(await reader.isVisible())await reader.click();
      await page.locator('[data-full-mass-reader-mode][value="LIVE"]').check();
      const language=page.locator("[data-folio-language]");
      if(await language.count())await language.selectOption(option.language);
      const none=page.locator('[data-folio-before][value="none"]');
      if(await none.count())await none.check();
      const start=page.locator("[data-ao-start-live]");
      await start.click();
      await page.waitForFunction(()=>Boolean(
        window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId &&
        document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")),
        null,{timeout:65000});
      assert.equal(await page.locator("#ao-r17-native-reader-preview [data-ao-reader-shell]").getAttribute("data-mode"),"LIVE");
      // Do not certify the reader behind its legitimate introductory
      // cinematic. Screenshots must show the settled, tappable prayer view.
      await page.waitForFunction(()=>{
        const curtain=document.querySelector('#ao-r17-native-reader-preview [data-role="cinematic"]');
        if(!curtain)return true;
        const css=getComputedStyle(curtain);
        return curtain.hidden||curtain.getAttribute("aria-hidden")==="true"||
          css.display==="none"||css.visibility==="hidden";
      },null,{timeout:18000});
      c.initial=await page.evaluate(positions);
      await snapshot(page,"reader-open",c);
      const root=page.locator("#ao-r17-native-reader-preview");
      const music=root.locator("[data-schola-events-open]");
      if(option.form==="LOW"){
        assert.equal(await music.isVisible(),false,"Low Mass invented a Schola event list");
        const jump=root.locator('[data-role="section-jump"]');
        await jump.click();
        assert.equal(await root.locator('[data-role="section-menu"]').isVisible(),true);
        await snapshot(page,"priest-catch-up",c);
      }else{
        assert.equal(await music.isVisible(),true,"Sung/Solemn LIVE lacks MUSIC navigation");
        await music.click();
        const menu=root.locator('[data-role="schola-events-menu"]');
        await menu.waitFor({state:"visible",timeout:10000});
        assert.ok(await menu.locator("[data-schola-event-select]").count()>=20,
          "Source music itinerary not populated");
        await snapshot(page,"music-menu",c);
        await menu.locator('[data-schola-event-select="KYRIE"]').click();
        await page.waitForFunction(()=>window.AO_R17_NATIVE_READER_PREVIEW?.getScholaState?.()?.trackId==="KYRIE",
          null,{timeout:8000});
        const prior=await page.evaluate(positions);
        const jump=root.locator('[data-role="section-jump"]');
        await jump.click();
        const destination=root.locator('[data-role="section-menu"] [data-reader-section]').filter({visible:true});
        const next=destination.filter({hasNotText:"INVALID"}).nth(4);
        await next.click();
        await page.waitForFunction(previous=>window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId!==previous,
          prior.card,{timeout:9000});
        const after=await page.evaluate(positions);
        assert.equal(after.trackId,prior.trackId,"Priest catch-up changed active Schola chant");
        assert.equal(after.phrase,prior.phrase,"Priest catch-up advanced choir phrase");
        assert.equal(after.complete,prior.complete,"Priest catch-up marked choir finished");
        await snapshot(page,"catch-up-independent",c);
        // Production-only regression for the last-phrase FINISH control.
        // Page-level no-overflow tests missed the prior 23px word colliding
        // with PAUSE inside this narrow Schola dock.
        const nextPhrase=root.locator("[data-schola-next]");
        // Read the actual Schola controller between clicks. Rapidly sampling
        // animated text alone can press FINISH before its DOM state settles.
        for(let i=0;i<16;i++){
          const state=await page.evaluate(()=>window.AO_R17_NATIVE_READER_PREVIEW?.getScholaState?.());
          assert.equal(state?.trackId,"KYRIE","Music navigation changed the selected chant");
          assert.equal(state.complete,false,"Schola completed without an observed FINISH");
          assert.ok(state.total>1,"Kyrie segments missing");
          if(state.index===state.total-1)break;
          assert.equal(await nextPhrase.isEnabled(),true,
            "Schola next arrow disabled before the last Kyrie phrase");
          await nextPhrase.click();
          await page.waitForFunction(previous=>{
            const s=window.AO_R17_NATIVE_READER_PREVIEW?.getScholaState?.();
            return s?.trackId==="KYRIE"&&s.index===previous+1&&!s.complete;
          },state.index,{timeout:9000});
        }
        await page.waitForFunction(()=>{
          const s=window.AO_R17_NATIVE_READER_PREVIEW?.getScholaState?.();
          const button=document.querySelector('#ao-r17-native-reader-preview [data-schola-next]');
          return s?.trackId==="KYRIE"&&s.total>1&&s.index===s.total-1&&!s.complete &&
            button?.dataset.scholaFinish==="true"&&button.textContent?.trim()==="FINISH";
        },null,{timeout:9000});
        const fit=await nextPhrase.evaluate(button=>{
          const pause=document.querySelector('#ao-r17-native-reader-preview [data-schola-pause]');
          const a=button.getBoundingClientRect(),b=pause?.getBoundingClientRect();
          return {state:button.dataset.scholaFinish,
            width:button.clientWidth,textWidth:button.scrollWidth,
            right:a.right,pauseLeft:b?.left??0,
            fontSize:parseFloat(getComputedStyle(button).fontSize)};
        });
        assert.equal(fit.state,"true","Production FINISH label has no compact state");
        assert.ok(fit.fontSize>=8&&fit.fontSize<=11,
          "Production FINISH inherited arrow-sized text: "+JSON.stringify(fit));
        assert.ok(fit.textWidth<=fit.width+1&&fit.right<=fit.pauseLeft+1,
          "Production FINISH overlaps PAUSE at "+option.width+"px: "+JSON.stringify(fit));
        c.finishFit=fit;
        await snapshot(page,"schola-finish-control",c);
        await music.click();
        const quiet=menu.locator('[data-schola-event-select="HOMILY"]');
        if(await quiet.count() && await quiet.isEnabled()){
          await quiet.click();
          await page.waitForFunction(()=>window.AO_R17_NATIVE_READER_PREVIEW?.getSelectedScholaEvent?.()?.id==="HOMILY");
          assert.equal((await page.evaluate(positions)).trackId,null,
            "Quiet interval must not retain a fictitious sung chant");
          await snapshot(page,"quiet-reference",c);
        }else{
          await page.keyboard.press("Escape");
        }
      }
      const prefs=root.locator("[data-reader-preferences]");
      await prefs.click();
      await root.locator('[data-reader-mode="MISSAL"]').click();
      await page.waitForFunction(()=>document.querySelector('#ao-r17-native-reader-preview [data-ao-reader-shell]')?.dataset?.mode==="MISSAL",
        null,{timeout:10000});
      // Confirm the Missal itself is visible, not a settings sheet covering
      // the two Latin/vernacular columns in the acceptance screenshot.
      const closePreferences=root.locator("[data-reader-preferences-close]");
      if(await closePreferences.isVisible())await closePreferences.click();
      await snapshot(page,"missal",c);
      if(c.pageErrors.length)throw Error("Production page exceptions: "+c.pageErrors.join(" | "));
      c.pass=true;
      console.log("PASS production Mass "+c.width+"px "+c.form+" "+c.language);
    }catch(e){
      c.failure=String(e?.stack??e).slice(0,4500);
      await page.screenshot({path:resolve(output,c.width+"-"+c.form+"-"+c.language+"-failure.png"),
        animations:"disabled"}).catch(()=>{});
      console.error("FAIL production Mass "+c.width+"px "+c.form+" "+c.language+": "+c.failure);
    }finally{
      report.cases.push(c);
      await ctx.close().catch(()=>{});
    }
  }
}finally{
  report.completedAt=new Date().toISOString();
  report.allPassed=report.cases.length===cases.length&&report.cases.every(x=>x.pass);
  await writeFile(resolve(output,"report.json"),JSON.stringify(report,null,2)+"\n");
  await browser?.close().catch(()=>{});
}
assert.equal(report.allPassed,true,"Production Mass browser QA failed; inspect artifact report");
