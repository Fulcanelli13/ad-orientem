// Isolated visual acceptance for the full Stage B/C/D LIVE band.
// Uses the real reader-dom.js shell markup and all production band modules,
// but a clearly marked synthetic source-event fixture. It does NOT certify
// the complete H7 entry path or physical handset behavior.
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const base="http://127.0.0.1:4173/tests/fixtures/live-handoff-visual.html";
const output=resolve("artifacts/live-handoff-visual");
await mkdir(output,{recursive:true});
const cases=[
  {name:"small-portrait",width:320,height:568,mobile:true},
  {name:"regular-portrait",width:390,height:844,mobile:true},
  {name:"tablet-portrait",width:768,height:1024,mobile:true},
  {name:"phone-landscape",width:844,height:390,mobile:true}
];
const result={schema:"AO_LIVE_HANDOFF_ISOLATED_VISUAL_ACCEPTANCE_V1",
  source:"SYNTHETIC_CUE_FIXTURE_REAL_READER_DOM_AND_STAGE_BCD",
  productionMassEntryVerified:false,physicalHandsetVerified:false,
  runCommit:process.env.GITHUB_SHA??null,cases:[]};
function reportErrors(page,c){
  page.on("pageerror",e=>c.errors.push(String(e.stack||e.message||e).slice(0,700)));
}
async function metrics(page){
  return page.evaluate(()=>{
    const q=x=>document.querySelector(x);
    const box=el=>{
      if(!el)return null;
      const b=el.getBoundingClientRect(),s=getComputedStyle(el);
      return {x:b.x,y:b.y,w:b.width,h:b.height,
        visibility:s.visibility,display:s.display};
    };
    const b=box(q("[data-ao-live-band]")),stage=box(q(".ao-reader-stage"));
    const shell=box(q("[data-ao-reader-shell]"));
    const left=box(q(".ao-reader-stage .ao-rail-left"));
    const right=box(q(".ao-reader-stage .ao-rail-right"));
    const active=[...document.querySelectorAll(".ao-lb-page")].find(x=>x.dataset.active==="true");
    const content=active?.querySelector(".ao-lb-d-timeline,.ao-lb-d-wheel,.ao-lb-sanctuary-shell");
    const c=box(content);
    return {width:innerWidth,height:innerHeight,
      documentW:document.documentElement.scrollWidth,documentH:document.documentElement.scrollHeight,
      shell,band:b,stage,left,right,activePage:[...document.querySelectorAll(".ao-lb-page")].indexOf(active),
      content:c,visibleBand:!q("[data-ao-live-band]")?.hidden,
      sourceStatus:q("[data-ao-live-band]")?.dataset?.stageDSourceStatus,
      reference:q("[data-ao-live-band]")?.dataset?.referenceId,
      railCount:document.querySelectorAll(".ao-reader-stage .ao-rail").length,
      wheelSegments:document.querySelectorAll(".ao-lb-d-sector").length,
      sixLanes:document.querySelectorAll(".ao-lb-d-lane").length,
      scholaMarkers:q('.ao-lb-d-lane[data-lane="SCHOLA"]')?.querySelectorAll('[data-current="true"],[data-source-mark="true"]').length??null,
      organMarkers:q('.ao-lb-d-lane[data-lane="ORGAN"]')?.querySelectorAll('[data-current="true"],[data-source-mark="true"]').length??null,
      minsterMarkers:q('.ao-lb-d-lane[data-lane="MINISTERS"]')?.querySelectorAll('[data-current="true"],[data-source-mark="true"]').length??null
    };
  });
}
function bounds(c,m,scenario){
  assert.equal(m.visibleBand,true,scenario+" band hidden");
  assert.equal(m.sourceStatus,"SOURCE_ONLY_65",scenario+" source hold");
  assert.equal(m.railCount,2,scenario+" rails missing");
  assert.equal(m.sixLanes,6,scenario+" lanes not rendered");
  assert.equal(m.wheelSegments,65,scenario+" actual wheel card count drift");
  assert.equal(m.scholaMarkers,0,scenario+" fabricated Schola card-synced marker");
  assert.equal(m.organMarkers,0,scenario+" fabricated organ card-synced marker");
  assert.equal(m.minsterMarkers,0,scenario+" fabricated minister card-synced marker");
  assert.ok(m.documentW<=c.width+2,scenario+" horizontal page overflow "+m.documentW);
  assert.ok(m.documentH<=c.height+2,scenario+" vertical page overflow "+m.documentH);
  for(const [key,rect] of Object.entries({
    shell:m.shell,band:m.band,stage:m.stage,left:m.left,right:m.right,content:m.content
  })){
    assert.ok(rect&&rect.w>0&&rect.h>0,scenario+" "+key+" has zero area");
    assert.ok(rect.x>=-2&&rect.x+rect.w<=c.width+2,
      scenario+" "+key+" outside x viewport "+JSON.stringify(rect));
    assert.ok(rect.y>=-2&&rect.y+rect.h<=c.height+2,
      scenario+" "+key+" outside y viewport "+JSON.stringify(rect));
  }
  assert.ok(m.stage.h>=95,scenario+" no room for native Mass text");
}
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const option of cases){
    const c={...option,pass:false,steps:[],errors:[]};
    result.cases.push(c);
    const ctx=await browser.newContext({
      viewport:{width:option.width,height:option.height},
      isMobile:option.mobile,hasTouch:option.mobile,
      deviceScaleFactor:1,reducedMotion:"reduce",locale:"en-GB",
      serviceWorkers:"block"
    });
    const page=await ctx.newPage();
    reportErrors(page,c);
    try{
      const response=await page.goto(base+"?aoLiveBandPreview=1",
        {waitUntil:"domcontentloaded",timeout:25000});
      assert.equal(response?.status(),200);
      await page.waitForFunction(()=>window.__aoHandoffFixture?.ready===true,
        null,{timeout:25000});
      await page.waitForFunction(()=>document.querySelector("[data-ao-live-band]")
        ?.dataset?.stageDSourceStatus==="SOURCE_ONLY_65",null,{timeout:15000});
      const start=await page.evaluate(()=>window.__aoHandoffFixture.selected());
      assert.equal(start.scholaIndex,2);
      for(const [index,name] of [[0,"sanctuary"],[1,"six-lane"],[2,"wheel"]]){
        await page.locator('.ao-lb-dot').nth(index).click();
        await page.waitForFunction(i=>
          document.querySelectorAll(".ao-lb-page")[i]?.dataset.active==="true",
          index);
        const m=await metrics(page);
        bounds(option,m,option.name+" "+name);
        assert.equal(m.activePage,index);
        c.steps.push({name,metrics:m});
        await page.screenshot({path:resolve(output,option.name+"-"+name+".png"),
          animations:"disabled",fullPage:false});
      }
      assert.equal(await page.locator(".ao-lb-d-sector").count(),65);
      await page.evaluate(()=>window.__aoHandoffFixture.goPage(0));
      const before=await page.evaluate(()=>window.__aoHandoffFixture.selected());
      // Source turn: native C10 source cue C0070, not the card number itself.
      const turn=await page.evaluate(()=>window.__aoHandoffFixture.showCard(9));
      assert.equal(turn.nativeCue,"AO.SM.C0070");
      assert.equal(turn.scholaIndex,before.scholaIndex,
        "reader catch-up falsely advanced observed choir");
      const turnButton=page.locator("[data-lb-route-start]");
      await turnButton.waitFor({state:"visible",timeout:8000});
      assert.match(await turnButton.textContent(),/Illustrate turn/);
      await turnButton.click();
      await page.locator("[data-lb-route-nav]").waitFor({state:"visible"});
      await page.locator("[data-lb-route-nav] [data-lb-route-next]").click();
      assert.equal(await page.evaluate(()=>window.__aoHandoffFixture.getState().routeStep),1);
      await page.screenshot({path:resolve(output,option.name+"-turn.png"),
        animations:"disabled",fullPage:false});
      const incense=await page.evaluate(()=>window.__aoHandoffFixture.showCard(23));
      assert.equal(incense.nativeCue,"AO.SM.C0122");
      assert.equal(incense.scholaIndex,before.scholaIndex);
      await turnButton.waitFor({state:"visible",timeout:8000});
      assert.match(await turnButton.textContent(),/Illustrate path/);
      await turnButton.click();
      assert.equal(await page.locator("[data-lb-route-overlay]").count(),1);
      await page.screenshot({path:resolve(output,option.name+"-incensation.png"),
        animations:"disabled",fullPage:false});
      // No card route may remain when the exact source identity changes.
      await page.evaluate(()=>window.__aoHandoffFixture.showCard(39));
      assert.equal(await page.locator("[data-lb-route-overlay]").count(),0);
      assert.equal(await page.locator("[data-lb-route-start]").isVisible(),false);
      const other=await metrics(page);
      bounds(option,other,option.name+" after-route");
      assert.equal(c.errors.length,0,"Browser page errors: "+c.errors.join("; "));
      c.pass=true;
    }catch(e){
      c.error=String(e.stack??e);
      await page.screenshot({path:resolve(output,option.name+"-FAILED.png"),
        fullPage:true}).catch(()=>{});
    }finally{await ctx.close();}
  }
}finally{await browser?.close();}
result.passed=result.cases.filter(x=>x.pass).length;
result.failed=result.cases.filter(x=>!x.pass).length;
await writeFile(resolve(output,"report.json"),JSON.stringify(result,null,2)+"\n");
for(const c of result.cases){
  console.log((c.pass?"PASS":"FAIL")+" "+c.name+
    (c.pass?"":": "+(c.error||c.errors.join("; "))).slice(0,1200));
}
assert.equal(result.failed,0,
  "Stage B/C/D isolated visual fixture failed; see artifact screenshots/report");
