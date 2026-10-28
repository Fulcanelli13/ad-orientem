import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){res.writeHead(error.code==="ENOENT"?404:500);res.end(String(error.message??error));}
});
await new Promise((resolve,reject)=>{
  server.once("error",reject);
  server.listen(4185,"127.0.0.1",resolve);
});
let browser;
try{
  browser=await chromium.launch({headless:true});
  let sampledActive=0,sampledEmpty=0;
  const configurations=[
    {name:"production64",query:"production=1",cards:65,visible:64},
    {name:"optional65",query:"production=1&secondConfiteor=1",cards:65,visible:65},
    {name:"legacy-rollback-rejected",query:"production=1&aoLiveCards=48",cards:65,visible:64},
  ];
  for(const variant of configurations)for(const width of [320,360,390]){
    const context=await browser.newContext({
      viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2
    });
    const page=await context.newPage();
    await page.goto("http://127.0.0.1:4185/tests/fixtures/reader-phone-harness.html?"+variant.query,{waitUntil:"networkidle"});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
    assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.totalCards),variant.cards);
    const checkpoints=await page.evaluate(()=>{
      const cards=window.__AO_PHONE_PREVIEW.model.cards;
      return [...new Set([0,.18,.4,.62,.84].map(p=>cards[Math.floor(p*(cards.length-1))]?.sequence))].filter(x=>x!=null);
    });
    assert.ok(checkpoints.length>=4,"Not enough canonical LIVE card checkpoints");
    for(const sequence of checkpoints){
      await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq),sequence);
      await page.waitForFunction(seq=>window.__AO_PHONE_PREVIEW.getCurrentCard()?.sequence===seq,sequence,{timeout:4000});
      await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
      const snap=await page.evaluate(()=>{
        const root=document.querySelector('[data-ao-reader-shell]');
        const stage=root?.querySelector(".ao-reader-stage");
        const rails=[...root.querySelectorAll(".ao-rail")].map(rail=>{
          const candidates=[...rail.querySelectorAll('.ao-rail-item[data-active="true"][data-icon-visible="true"]')]
            .filter(x=>root.dataset.objectiveContext==="true"||x.dataset.channel!=="posture");
          const active=candidates.filter(x=>x.dataset.sourceRailAnchor==="exact"&&
            getComputedStyle(x).display!=="none");
          const sourceRows=[...stage.querySelectorAll(".ao-prayer-body .ao-reader-paragraph")];
          const unanchored=candidates.filter(x=>!active.includes(x)).map(x=>({
            cueId:x.dataset.sourceRailCueId,channel:x.dataset.channel,
            anchor:x.dataset.sourceRailAnchor,display:getComputedStyle(x).display,
            ariaHidden:x.getAttribute("aria-hidden"),role:x.getAttribute("role")
          }));
          const hiddenSource=[...rail.querySelectorAll('.ao-rail-item[data-active="true"][data-icon-visible="false"]')];
          const inactive=[...rail.querySelectorAll('.ao-rail-item[data-active="false"]')];
          return {
            side:rail.classList.contains("ao-rail-left")?"left":"right",
            visible:rail.dataset.visible,
            stageVisible:rail.classList.contains("ao-rail-left")?stage.dataset.leftRail:stage.dataset.rightRail,
            display:getComputedStyle(rail).display,
            anchored:rail.dataset.sourceAnchored,unanchored,
            active:active.map(x=>{
              const cueId=x.dataset.sourceRailCueId;
              const source=sourceRows.find(y=>y.dataset.cueId===cueId||
                String(y.dataset.sourceCueIds||"").split(/\s+/).includes(cueId));
              const first=source?.querySelector(".ao-line-primary")||source;
              const firstRect=first?.getBoundingClientRect();
              const stageRect=stage.getBoundingClientRect();
              const line=first?parseFloat(getComputedStyle(first).lineHeight)||28:28;
              const paragraphY=firstRect?.top-stageRect.top+Math.min(23,Math.max(9,line/2));
              const iconY=x.offsetTop+x.offsetHeight/2;
              return {
              channel:x.dataset.channel,cueId,paragraphId:source?.dataset.paragraphId,
              offsetY:x.offsetTop,height:x.offsetHeight,
              delta:Math.abs(iconY-paragraphY),
              label:x.getAttribute("aria-label"),
              title:x.getAttribute("title"),
              role:x.getAttribute("role"),
              ariaHidden:x.getAttribute("aria-hidden")
            };}),
            hiddenSource:hiddenSource.map(x=>({
              channel:x.dataset.channel,
              display:getComputedStyle(x).display,
              ariaHidden:x.getAttribute("aria-hidden"),
              role:x.getAttribute("role")
            })),
            inactive:inactive.map(x=>({
              channel:x.dataset.channel,display:getComputedStyle(x).display,
              ariaHidden:x.getAttribute("aria-hidden"),
              ariaLabel:x.getAttribute("aria-label"),
              title:x.getAttribute("title")
            }))
          };
        });
        return {
          mode:root.dataset.mode,objectiveContext:root.dataset.objectiveContext,rails,
          title:root.querySelector('[data-role="section-title"]')?.textContent?.trim()??"",
          card:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null,
          count:window.__AO_PHONE_PREVIEW.model.totalCards,
          progress:root.querySelector('[data-role="progress"]')?.textContent??"",
          scrollCard:root.querySelector(".ao-prayer-card")?.scrollHeight??0
        };
      });
      assert.equal(snap.mode,"LIVE");
      assert.equal(snap.count,variant.cards,variant.name);
      assert.match(snap.progress,new RegExp("/\\s*"+variant.visible+"$"),
        variant.name+" visible-card progress must retain curated 64/65 denominator");
      assert(snap.title.length>1,"active card title vanished from top jump");
      assert.equal(snap.rails.length,2);
      assert(snap.scrollCard>0);
      for(const rail of snap.rails){
        const expectVisible=rail.active.length>0;
        assert.equal(rail.anchored,"true",width+" source rail tracker did not mount");
        assert.ok(rail.unanchored.every(x=>x.display==="none"&&x.ariaHidden==="true"&&x.role===null),
          width+" "+snap.card+" source-unmatched icon remains visible or accessible");
        assert.equal(rail.visible,String(expectVisible),
          width+" "+snap.card+" "+rail.side+" empty rail visibility");
        assert.equal(rail.stageVisible,String(expectVisible),
          width+" "+snap.card+" "+rail.side+" stage occupancy");
        assert.equal(rail.display==="none",!expectVisible,
          width+" "+snap.card+" "+rail.side+" empty rail still painted");
        if(expectVisible)sampledActive+=rail.active.length;else sampledEmpty++;
        for(const cue of rail.active){
          assert(cue.label&&cue.label!=="—"&&cue.label.length>1,
            cue.channel+" icon missing current screen-reader meaning");
          assert.equal(cue.title,cue.label,cue.channel+" lost long-press meaning");
          assert.equal(cue.role,"img",cue.channel+" is not labelled as a pictogram");
          assert.notEqual(cue.ariaHidden,"true");
          assert.match(cue.cueId,/^AO\.SM\.C\d{4}$/,
            cue.channel+" was anchored to an invented paragraph identity");
          assert.ok(cue.paragraphId&&cue.delta<=65,
            cue.channel+" drifted from its source paragraph: "+JSON.stringify(cue));
        }
        const geometries=[...rail.active].sort((a,b)=>a.offsetY-b.offsetY);
        for(let i=1;i<geometries.length;i++)
          assert.ok(geometries[i-1].offsetY+geometries[i-1].height<=geometries[i].offsetY+1,
            rail.side+" source-anchored icon boxes overlap");
        for(const cue of rail.hiddenSource){
          assert.equal(cue.display,"none",cue.channel+" text-only source appeared inside a rail icon box");
          assert.equal(cue.ariaHidden,"true",cue.channel+" missing art exposed a false pictogram");
          assert.equal(cue.role,null,cue.channel+" missing art kept an image role");
        }
        for(const cue of rail.inactive){
          assert.equal(cue.display,"none",cue.channel+" inactive cue painted a ghost square");
          assert.equal(cue.ariaHidden,"true",cue.channel+" inert cue is exposed to assistive technology");
          assert.equal(cue.ariaLabel,null,cue.channel+" stale cue meaning survived");
          assert.equal(cue.title,null,cue.channel+" stale hover title survived");
        }
      }
      // Contextual presentation may place sourced posture in the left rail;
      // otherwise posture belongs to the top ribbon and must not create an
      // additional transient icon. Follow the canonical current layout owner.
      const postureDisplay=await page.locator('.ao-rail-left .ao-rail-item[data-channel="posture"]')
        .evaluate(el=>getComputedStyle(el).display);
      if(snap.objectiveContext!=="true")
        assert.equal(postureDisplay,"none","posture was duplicated in the transient LIVE left rail");
      else if(postureDisplay!=="none")
        assert.equal(snap.rails[0].visible,"true",
          "objective-context posture is displayed but its left rail is hidden");
    }
    await context.close();
  }
  assert(sampledActive>0,"No active icon cue was sampled; test did not exercise semantic labelling");
  console.log("PASS LIVE rails 320/360/390px: 65-card source reader, exact paragraph anchors, no floating or overlapping cue icons, labels preserved.");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
