import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {publishedMissalRubricsForParagraph} from "../src/mass/reader-missal-rubrics.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
await mkdir(out,{recursive:true});
const rubrics=JSON.parse(await readFile(resolve(root,"data/presentation/reader-rubric-events.v1.json"),"utf8"));
const priestRubricIds=rubrics.items.filter(x=>x.actor==="PRIEST"&&x.kind!=="BELL")
  .map(x=>x.id).sort();
const publishedByCue=Object.fromEntries(
  [...new Set(rubrics.items.map(x=>x.cueId))].map(cueId=>[
    cueId,publishedMissalRubricsForParagraph({
      id:cueId,kind:"TEXT",primary:"",sourceCueIds:[cueId]
    },rubrics,{form:"MISSA_CANTATA_SIMPLE",language:"en"})
      .map(row=>({id:row.id,kind:row.kind}))
  ])
);
const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",
};
const server=http.createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const full=resolve(root,"."+path);
    if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
    const body=await readFile(full);
    res.writeHead(200,{"content-type":mime[extname(full)]??"application/octet-stream","cache-control":"no-store"});
    res.end(body);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4282,"127.0.0.1",resolve)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const {width,height,lang,secondConfiteor=false} of [
    {width:320,height:740,lang:"en"},
    {width:390,height:844,lang:"en"},
    {width:768,height:1024,lang:"en"},
    {width:390,height:844,lang:"fr"},
    {width:390,height:844,lang:"en",secondConfiteor:true},
  ]){
    const context=await browser.newContext({viewport:{width,height},isMobile:width<600,
      hasTouch:width<600,deviceScaleFactor:1,locale:lang==="fr"?"fr-FR":"en-GB"});
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",e=>errors.push(String(e?.message??e)));
    await page.goto("http://127.0.0.1:4282/tests/fixtures/reader-phone-harness.html?aoLiveCards=65&lang="+lang+
      (secondConfiteor?"&secondConfiteor=1":""),
      {waitUntil:"networkidle",timeout:45000});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
    const summary=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const root=document.querySelector("#ao-r17-native-reader-preview");
      const shell=root?.querySelector("[data-ao-reader-shell]");
      return {
        count:api.model.totalCards,owner:api.model.structureOwner,
        headings:api.model.cards.map(c=>c.title),
        canonical:api.sourceModel.totalCards,
        rootVisible:!!root && root.getBoundingClientRect().width>0,
        shellWidth:shell?.getBoundingClientRect().width??0,
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        navNext:!!root?.querySelector('[data-reader-nav="next"]'),
        navPrev:!!root?.querySelector('[data-reader-nav="previous"]'),
      };
    });
    assert.equal(summary.count,65,"Legacy review flag should activate the one-card Sanctus projection");
    assert.equal(summary.canonical,39);
    assert.equal(summary.owner,"SOURCE_FIRST_LIVE_CURATED_65_REVIEW");
    assert.ok(summary.rootVisible && summary.navNext && summary.navPrev);
    assert.ok(summary.shellWidth<=width+1,"Phone viewport horizontal overflow");
    assert.equal(summary.overflow,false,"Curated Mass caused document horizontal scroll");
    assert.ok(summary.headings.includes("Gloria · The Celebrant's Intonation"));
    assert.ok(summary.headings.includes("Words of Consecration and Elevation · Host"));
    assert.ok(summary.headings.includes("Communion Antiphon"));
    // Production touch contract: finger vertical scrolling must remain within
    // a prayer card; horizontal gestures must move EXACTLY one card each way.
    // Historical 48-card touch coverage cannot certify the new curated model.
    if(width===390 && lang==="en" && !secondConfiteor){
      // Allow each card's DOM to settle before measuring it. Sampling
      // several showSequence calls within one evaluate sees stale card geometry.
      const candidates=await page.evaluate(()=>{
        const rows=window.__AO_PHONE_PREVIEW.model.cards;
        return rows.slice(8,-4).map((card,index)=>({index:index+8,sequence:card.sequence}));
      });
      let target=null;
      for(const candidate of candidates){
        await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq),candidate.sequence);
        await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
        const measure=await page.locator("#ao-r17-native-reader-preview .ao-prayer-card")
          .evaluate(el=>({max:el.scrollHeight-el.clientHeight,client:el.clientHeight}));
        if(measure.max>100){target=candidate;break;}
      }
      assert.ok(target,"Curated production model has no vertically scrollable prayer card");
      await page.waitForTimeout(250);
      const scroller=page.locator("#ao-r17-native-reader-preview .ao-prayer-card");
      const bounds=await scroller.boundingBox();
      assert.ok(bounds&&bounds.width>180&&bounds.height>180,"No phone prayer swipe territory");
      const start=await scroller.evaluate(el=>{
        el.scrollTop=0;
        return {top:el.scrollTop,max:el.scrollHeight-el.clientHeight};
      });
      assert.ok(start.max>100,"Curated card has no real scroll travel");
      const cdp=await context.newCDPSession(page);
      const x=Math.round(bounds.x+bounds.width*.52);
      const startY=Math.round(bounds.y+bounds.height*.52);
      const endY=Math.round(bounds.y+bounds.height*.15);
      const hit=await page.evaluate(({x,y})=>{
        const node=document.elementFromPoint(x,y);
        return {inside:!!node?.closest(".ao-prayer-card"),
          target:node?.className??node?.tagName??null};
      },{x,y:startY});
      assert.ok(hit.inside,"Vertical gesture target is obscured: "+JSON.stringify(hit));
      await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y:startY}]});
      for(let i=1;i<=8;i++){
        const y=Math.round(startY+(endY-startY)*i/8);
        await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y}]});
      }
      await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
      await page.waitForTimeout(260);
      const after=await scroller.evaluate(el=>el.scrollTop);
      assert.ok(after>start.top,
        "Vertical finger gesture did not scroll curated prayer paragraphs: "+JSON.stringify({start,after,hit}));
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sequence),target.sequence,
        "Vertical finger gesture incorrectly changed curated prayer cards");
      async function horizontal(direction){
        const y=Math.round(bounds.y+bounds.height*.4);
        const startX=Math.round(bounds.x+bounds.width*(direction>0?.78:.22));
        const endX=Math.round(bounds.x+bounds.width*(direction>0?.22:.78));
        await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:startX,y}]});
        for(let i=1;i<=6;i++){
          const x=Math.round(startX+(endX-startX)*i/6);
          await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y}]});
        }
        await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
      }
      const position=()=>page.evaluate(()=>{
        const api=window.__AO_PHONE_PREVIEW;
        return api.model.cards.findIndex(c=>c.sequence===api.getCurrentCard().sequence);
      });
      assert.equal(await position(),target.index);
      await horizontal(1);
      await page.waitForFunction(index=>{
        const api=window.__AO_PHONE_PREVIEW;
        return api.model.cards.findIndex(c=>c.sequence===api.getCurrentCard().sequence)===index+1;
      },target.index,{timeout:5000});
      assert.equal(await position(),target.index+1,"Horizontal left swipe skipped a curated card");
      await page.waitForTimeout(450);
      await horizontal(-1);
      await page.waitForFunction(index=>{
        const api=window.__AO_PHONE_PREVIEW;
        return api.model.cards.findIndex(c=>c.sequence===api.getCurrentCard().sequence)===index;
      },target.index,{timeout:5000});
      assert.equal(await position(),target.index,"Horizontal right swipe did not restore preceding card");
    }
    const landmarks=[
      "Gloria · The Celebrant's Intonation",
      "Gloria · Praise and Supplication",
      "Credo · Incarnation, Passion and Resurrection",
      "Sanctus",
      "Words of Consecration and Elevation · Host",
      "Words of Consecration and Elevation · Chalice",
      "Communion Antiphon",
      "Last Gospel · The Word Made Flesh",
    ];
    for(const title of landmarks){
      const state=await page.evaluate(t=>{
        const api=window.__AO_PHONE_PREVIEW;
        const card=api.model.cards.find(c=>c.title===t);
        if(!card)return {found:false};
        api.showSequence(card.sequence);
        const shell=document.querySelector("[data-ao-reader-shell]");
        return {
          found:true,current:api.getCurrentCard()?.sectionId,
          expected:card.sectionId,
          paragraphs:card.paragraphs.length,
          scrollWidth:shell?.scrollWidth,
          clientWidth:shell?.clientWidth,
          track:api.getScholaState()?.trackId??null,
          prayerOpacity:Number(getComputedStyle(shell.querySelector('.ao-reader-paragraph')).opacity),
          readerBottom:shell.querySelector('.ao-prayer-card')?.getBoundingClientRect()?.bottom??null,
          scholaTop:shell.querySelector('.ao-schola-dock[data-active="true"]')?.getBoundingClientRect()?.top??null,
          miniIcons:shell.querySelectorAll(".ao-faithful-paragraph-icons,.ao-faithful-icon-edit").length,
          cueRows:shell.querySelectorAll(".ao-reader-paragraph[data-faithful-row-id]").length,
          cuePadding:(()=>{
            const row=shell.querySelector(".ao-reader-paragraph[data-faithful-row-id]");
            return row?parseFloat(getComputedStyle(row).paddingLeft):null;
          })(),
          scholaAsset:(()=>{
            const dock=shell.querySelector(".ao-schola-dock[data-active='true']");
            if(!dock)return null;
            const node=dock.querySelector("[data-icon-slot='schola']");
            const style=getComputedStyle(node);
            return {hidden:node.hidden,width:node.getBoundingClientRect().width,
              rendered:style.maskImage!=="none"||style.webkitMaskImage!=="none"||
                style.backgroundImage!=="none"};
          })(),
          layoutDiagnostics:(()=>{
            const sc=shell.querySelector(".ao-prayer-card");
            const vp=shell.querySelector(".ao-card-viewport");
            const cs=getComputedStyle(sc),cv=getComputedStyle(vp);
            return {curated:document.querySelector("#ao-r17-native-reader-preview")?.dataset.r17CuratedReview,
              reserve:shell.style.getPropertyValue("--ao-schola-reserve"),
              dockFlag:shell.dataset.scholaVisible,
              cardHeight:cs.height,cardBox:cs.boxSizing,cardPadding:cs.paddingBottom,
              viewportHeight:cv.height,viewportBox:cv.boxSizing,
              viewportPadding:cv.paddingBottom,
              viewportBottom:vp.getBoundingClientRect().bottom,
              cssLoaded:!!document.querySelector("[data-ao-reader-shell-style]")?.textContent?.includes("100dvh"),
              selectorMatch:!!document.querySelector('#ao-r17-native-reader-preview[data-r17-curated-review="true"] .ao-reader-shell[data-schola-visible="true"] .ao-prayer-card'),
              inlineHeight:sc.style.height,
              inlinePriority:sc.style.getPropertyPriority("height")};
          })(),
        };
      },title);
      assert.equal(state.found,true,"Missing curated landmark "+title);
      assert.equal(state.current,state.expected,"Reader navigated to wrong curated card "+title);
      assert.ok(state.paragraphs>0,"Blank curated prayer card "+title);
      assert.ok(state.scrollWidth<=state.clientWidth+3,"Horizontal overflow at "+title);
      // Snapshot immediately after a card jump may precede its opening
      // focus frame. Inactive text is intentionally 18% opacity; the actual
      // 100/38/18 computed contrast and scroll handoff are enforced in
      // reader-live-visual-focus-production-phone.mjs after animation settles.
      assert.ok(state.prayerOpacity>=.16&&state.prayerOpacity<=1,
        "Curated reader text became invisible: "+title+" opacity "+state.prayerOpacity);
      if(state.scholaTop!=null){
        assert.ok(state.readerBottom<=state.scholaTop+3,
          "Schola overlay still covers the real prayer reading viewport: "+title+
          " "+state.readerBottom+" vs "+state.scholaTop+" "+JSON.stringify(state.layoutDiagnostics));
      }
      if(title==="Gloria · The Celebrant's Intonation")assert.equal(state.track,null);
      if(title==="Gloria · Praise and Supplication")assert.equal(state.track,"GLORIA");
      if(title==="Sanctus")assert.equal(state.track,"SANCTUS_BENEDICTUS");
      if(/^Gloria|^Credo/.test(title)){
        assert.ok(state.cueRows>0,title+" lost source gesture identities");
        assert.equal(state.miniIcons,0,title+" repeats icons beside every verse");
        assert.ok(state.cuePadding<=12,title+" retains a 67px icon gutter");
      }
      if(state.scholaAsset){
        assert.equal(state.scholaAsset.hidden,false,title+" Schola symbol hidden");
        assert.equal(state.scholaAsset.rendered,true,title+" Schola symbol lacks art");
        assert.ok(state.scholaAsset.width>=30,title+" Schola icon too small: "+JSON.stringify(state.scholaAsset));
      }
    }
    // Walk every liturgical card in source order, not merely selected screenshots.
    // A local second Confiteor is present in source audit, but absent from
    // the default navigation path unless explicitly requested.
    const walked=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const optionalTitle="Second Confiteor · Optional Local Custom";
      const skipped=[],visited=[],defects=[];
      const optional=api.model.cards.find(c=>c.title===optionalTitle);
      for(const card of api.model.cards){
        const shown=api.showSequence(card.sequence);
        if(!shown){
          skipped.push(card.title);
          continue;
        }
        const actual=api.getCurrentCard();
        const shell=document.querySelector('[data-ao-reader-shell]');
        const progress=document.querySelector('[data-role="progress"]')?.textContent?.trim();
        const domRows=[...document.querySelectorAll('.ao-reader-paragraph')];
        const rows=domRows.length;
        if(actual?.sectionId!==card.sectionId)defects.push("wrong card "+card.title);
        if(!rows && card.paragraphs.length)defects.push("blank rendered card "+card.title);
        // Every canonical spoken/prayed paragraph must be independently
        // focusable even when one intonation owns two source workbook cues.
        // An untagged row silently disables gestures, responses and voice.
        for(const paragraph of card.paragraphs){
          const cueIds=(paragraph.sourceCueIds??[]).filter(id=>/^AO\.SM\.C\d{4}$/.test(id));
          if(!cueIds.length)continue;
          const dom=domRows.find(el=>el.dataset.sourceCueIds?.split(" ").includes(cueIds[0]));
          if(!dom){defects.push("missing cue DOM row "+cueIds[0]+" in "+card.title);continue}
          if(paragraph.speakerRole && dom.dataset.speakerRole!==paragraph.speakerRole)
            defects.push("wrong actor "+cueIds[0]+" expected "+paragraph.speakerRole+
              " displayed "+dom.dataset.speakerRole);
          const allowedComposite=(cueIds.join("|")==="AO.SM.C0053|AO.SM.C0054" ||
            cueIds.join("|")==="AO.SM.C0089|AO.SM.C0090");
          if(cueIds.length===1 || allowedComposite){
            if(dom.dataset.cueId!==cueIds[0])
              defects.push("missing exact focus owner "+cueIds[0]+" in "+card.title);
          }else if(!dom.dataset.cueId){
            defects.push("unowned multi-cue paragraph "+cueIds.join(",")+" in "+card.title);
          }
        }
        if(shell && shell.scrollWidth>shell.clientWidth+3)defects.push("overflow "+card.title);
        if(!/^[0-9]+ \/ [0-9]+$/.test(progress??""))defects.push("invalid progress "+card.title+": "+progress);
        visited.push({title:card.title,progress,sequence:card.sequence});
      }
      const finalProgress=document.querySelector('[data-role="progress"]')?.textContent?.trim();
      if(optional){
        const pre=api.model.cards[optional.sequence-2];
        const post=api.model.cards[optional.sequence];
        api.showSequence(pre.sequence);
        document.querySelector('[data-reader-nav="next"]')?.click();
        const after=api.getCurrentCard()?.sectionId;
        if(after!==post.sectionId && after!==optional.sectionId){
          defects.push("next from Communion Confiteor boundary navigates incorrectly");
        }
      }
      return {visited,skipped,defects,finalProgress,optionalSeq:optional?.sequence??null};
    });
    const expectedVisible=secondConfiteor?65:64;
    assert.equal(walked.visited.length,expectedVisible,
      "The optional local Confiteor must not be shown by default");
    assert.deepEqual(walked.skipped,secondConfiteor?[]:["Second Confiteor · Optional Local Custom"]);
    assert.deepEqual(walked.defects,[],"full 65-card field rehearsal revealed runtime defects");
    assert.equal(walked.finalProgress,expectedVisible+" / "+expectedVisible,
      "visible LIVE progress may not display a skipped optional card");
    if(!secondConfiteor){
      const before=walked.visited.find(x=>x.sequence===walked.optionalSeq-1);
      const after=walked.visited.find(x=>x.sequence===walked.optionalSeq+1);
      assert.ok(before&&after,"Optional Confiteor interrupted the navigation stream");
    }
    // The historical phone fixture omitted the frozen icon resolver,
    // producing misleading empty icon frames. Verify production icon assets
    // are resolved when source-owned cues become visible in the review.
    const resolvedIcons=await page.evaluate(async()=>{
      const api=window.__AO_PHONE_PREVIEW;
      // Sanctus is not guaranteed to own a visible source-cued icon.
      // Verify the actual bank on a source-owned card with icon coverage,
      // rather than treating a legitimate unpictured moment as a failure.
      const preferred=api.model.cards.filter(c=>/Collect|Preface|Elevation|Consecration/i.test(c.title??""));
      const candidates=[...preferred,...api.model.cards.filter(c=>!preferred.includes(c))];
      for(const card of candidates){
        api.showSequence(card.sequence);
        await new Promise(done=>requestAnimationFrame(done));
        const slots=[...document.querySelectorAll('[data-icon-slot]')].filter(el=>{
          if(el.hidden||el.getBoundingClientRect().width<=0)return false;
          const css=getComputedStyle(el);
          return css.backgroundImage!=="none"||css.webkitMaskImage!=="none"||css.maskImage!=="none";
        }).map(el=>el.dataset.iconSlot);
        if(slots.length)return {card:card.title,slots};
      }
      return {card:null,slots:[]};
    });
    assert.ok(resolvedIcons.slots.length>=1,
      "Production icon bank did not render a visible icon on any curated source-cued card");
    // A visible priest intonation is one paragraph with two source cue
    // records; it still needs a unique active cue for voice, rubric and
    // scroll-focus ownership. Do not drop either canonical source ID.
    const intonationFocus=await page.evaluate(async()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const results=[];
      for(const [first,second] of [
        ["AO.SM.C0053","AO.SM.C0054"],
        ["AO.SM.C0089","AO.SM.C0090"],
      ]){
        const card=api.model.cards.find(c=>c.paragraphs.some(p=>
          (p.sourceCueIds??[]).includes(first)));
        api.showSequence(card.sequence);
        await new Promise(done=>requestAnimationFrame(()=>
          requestAnimationFrame(done)));
        const paragraph=[...document.querySelectorAll('.ao-reader-paragraph')]
          .find(node=>(node.dataset.sourceCueIds??"").split(" ").includes(first));
        results.push({
          first,second,
          id:paragraph?.dataset.cueId??null,
          ownsBoth:(paragraph?.dataset.sourceCueIds??"").split(" ").includes(second),
          focused:api.getActiveCue(),
          active:paragraph?.dataset.active??null,
        });
      }
      return results;
    });
    for(const state of intonationFocus){
      assert.equal(state.ownsBoth,true,"Intonation dropped canonical second cue "+state.second);
      assert.equal(state.id,state.first,"Combined priest intonation lost source-cue DOM identity");
      assert.equal(state.focused,state.first,
        "Native LIVE cue tracker failed to focus the priest intonation "+state.first);
      assert.equal(state.active,"true","Combined intonation was not visually focused");
    }
    // Actual phone focus/rail rehearsal at critical source words, not
    // only registry projections. Source-only cases should project no
    // elevation gesture before the consecrated species is raised.
    if(width===390&&lang==="en"&&!secondConfiteor){
      const ritualFocus=await page.evaluate(async()=>{
        const api=window.__AO_PHONE_PREVIEW;
        const cues=[
          "AO.SM.C0071", // Collect: Et cum spiritu tuo
          "AO.SM.C0108", // Offertory Oremus is PUBLIC
          "AO.SM.C0110", // First Offertory prayer is PRIEST_PRIVATE
          "AO.SM.C0130", // Orate fratres starts audibly again
          "AO.SM.C0145", // Sanctus bell
          "AO.SM.C0161", // Warning bell before Consecration
          "AO.SM.C0173", // Host: words of consecration
          "AO.SM.C0174", // Host: elevation
          "AO.SM.C0179", // Chalice: words of consecration
          "AO.SM.C0181", // Chalice: elevation
          "AO.SM.C0265", // final blessing cross
          "AO.SM.C0273", // Last Gospel: Et Verbum caro
        ];
        const observed=[];
        const nextFrame=()=>new Promise(done=>requestAnimationFrame(()=>
          requestAnimationFrame(done)));
        for(const cueId of cues){
          const card=api.model.cards.find(c=>c.paragraphs.some(p=>
            p.sourceCueIds?.includes(cueId)));
          api.showSequence(card.sequence);
          await nextFrame();
          const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
          const node=[...scroller.querySelectorAll(".ao-reader-paragraph[data-cue-id]")]
            .find(n=>n.dataset.cueId===cueId);
          if(!node){observed.push({cueId,missing:true});continue;}
          const rect=node.getBoundingClientRect(),root=scroller.getBoundingClientRect();
          const center=rect.top-root.top+scroller.scrollTop+rect.height/2;
          const maxScroll=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
          // The 39% focus rule deliberately ramps upward at the top of
          // short cards. A single center-minus-39% scroll offset will be
          // clamped to zero for the first replies. Search actual reachable
          // finger-scroll offsets instead of asserting an impossible ideal.
          const ideal=center-scroller.clientHeight*.39;
          const start=Math.max(0,Math.floor(Math.min(ideal-100,center-150)/16)*16);
          const stop=Math.min(maxScroll,Math.max(center+145,ideal+150));
          const candidates=[0,maxScroll];
          for(let y=start;y<=stop;y+=16)candidates.push(y);
          let located=false;
          const trace=[];
          for(const amount of [...new Set(candidates)]){
            scroller.scrollTop=Math.max(0,Math.min(maxScroll,amount));
            scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
            await nextFrame();
            trace.push([Math.round(scroller.scrollTop),api.getActiveCue()]);
            if(api.getActiveCue()===cueId){located=true;break;}
          }
          const state=api.getCueState();
          observed.push({
            cueId,focused:api.getActiveCue(),reachable:located,
            diagnostics:{maxScroll:Math.round(maxScroll),center:Math.round(center),
              height:Math.round(scroller.clientHeight),domCueCount:scroller.querySelectorAll(".ao-reader-paragraph[data-cue-id]").length,
              trace:trace.slice(0,30)},
            response:state?.response?.text??null,
            gesture:state?.gesture?.action??null,
            priestAction:state?.priestAction?.label??null,
            nativeCue:api.getNativeEventState()?.nativeCueId??null,
            quietOffertory:document.querySelector('[data-role="priest-quiet-offertory"]')?.hidden===false,
            bellCue:api.getNativeEventState()?.bell?.cueId??null,
            bellIconVisible:document.querySelector('[data-icon-slot="bell"]')?.hidden===false,
            bellSoundState:document.querySelector('.ao-rail-right [data-channel="bell"]')?.dataset.soundState??null,
            bellAccessible:document.querySelector('.ao-rail-right [data-channel="bell"]')?.getAttribute("aria-label")??null,
            bellTiming:api.getNativeEventState()?.bell?.sourceTiming?.timingPrecision??null,
          });
        }
        return observed;
      });
      const gate={
        "AO.SM.C0071":{response:/Et cum spíritu tuo/},
        "AO.SM.C0108":{quiet:false,bell:false},
        "AO.SM.C0110":{quiet:true,bell:false},
        "AO.SM.C0130":{quiet:false,bell:false},
        "AO.SM.C0145":{quiet:false,bell:true},
        "AO.SM.C0161":{quiet:false,bell:true},
        "AO.SM.C0173":{noGesture:true,bell:false},
        "AO.SM.C0174":{action:/ELEVATES HOST/,gesture:/Sacred Host/,bell:true},
        "AO.SM.C0179":{noGesture:true,bell:false},
        "AO.SM.C0181":{action:/ELEVATES CHALICE/,gesture:/Chalice/,bell:true},
        "AO.SM.C0265":{action:/BLESSES PEOPLE/,gesture:/Sign of the Cross/},
        "AO.SM.C0273":{action:/GENUFLECTS/,gesture:/Genuflect/},
      };
      for(const state of ritualFocus){
        assert.equal(state.missing,undefined,
          "No actual DOM cue paragraph for "+state.cueId);
        assert.equal(state.reachable,true,
          "User scroll cannot reach "+state.cueId+" in the LIVE 39% focus window: "+JSON.stringify(state.diagnostics));
        assert.equal(state.focused,state.cueId,
          "User scroll could not place "+state.cueId+" into exact LIVE cue focus");
        const expected=gate[state.cueId];
        if(expected.response)assert.match(state.response??"",expected.response);
        if(expected.quiet!==undefined)assert.equal(state.quietOffertory,expected.quiet,
          state.cueId+": priest's quiet Offertory indicator must follow exact private source cue");
        if(expected.bell!==undefined){
          assert.equal(state.bellCue,expected.bell ? state.cueId : null,
            state.cueId+": bell leaked or was absent on the precise source cue");
          assert.equal(state.bellIconVisible,expected.bell,
            state.cueId+": approved bell icon did not match the actual sound cue");
          if(expected.bell){
            assert.equal(state.bellSoundState,"EXPECTED_NOT_OBSERVED",
              state.cueId+": source focus falsely claimed an actually heard bell");
            assert.match(state.bellAccessible??"",/Expected altar-bell moment, not detected/,
              state.cueId+": bell icon failed to describe its observation limitations");
            assert.ok(state.bellTiming?.length,
              state.cueId+": no 1962 timing window attached to the icon");
          }else assert.equal(state.bellSoundState,"NONE",
            state.cueId+": bell sound-state leaked to a different cue");
        }
        if(expected.noGesture)assert.equal(state.gesture,null,
          state.cueId+": elevation gesture fired prematurely on formula");
        if(expected.action)assert.match(state.priestAction??"",expected.action);
        if(expected.gesture)assert.match(state.gesture??"",expected.gesture);
      }
    }

    // Priest mode may only update these source-only states after a genuine
    // independent MC event observation. A page swipe, Schola advancement,
    // and a different source Mass section must not move the priest.
    const independentPriest=await page.evaluate(async()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const first=api.model.cards.find(c=>c.title==="Gloria · Praise and Supplication");
      const second=api.model.cards.find(c=>c.title==="Gloria · Doxology");
      const other=api.model.cards.find(c=>c.title==="Credo · The Celebrant's Intonation");
      api.showSequence(first.sequence);
      const before=api.getScholaState()?.trackId??null;
      const notObserved=api.getObservedPriestEvent();
      const accepted=api.observePriestCeremonialEvent("MC-GLR-040",{
        conditions:["SEDILIA_USED","SEDILIA_USED_AND_CHANT_CONTINUES"]
      });
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const seated=api.getObservedPriestEvent();
      const scholaUnchanged=(api.getScholaState()?.trackId??null)===before;
      const visual=window.AO_R17_NATIVE_READER_STATE?.priestPosition?.station;
      api.showSequence(second.sequence);
      const stays=api.getObservedPriestEvent()?.cueId??null;
      api.showSequence(other.sequence);
      const cleared=api.getObservedPriestEvent();
      const refused=api.observePriestCeremonialEvent("MC-GLR-040",{
        conditions:["SEDILIA_USED","SEDILIA_USED_AND_CHANT_CONTINUES"]
      });
      api.showSequence(first.sequence);
      api.observePriestCeremonialEvent("MC-GLR-040",{
        conditions:["SEDILIA_USED","SEDILIA_USED_AND_CHANT_CONTINUES"]
      });
      await Promise.resolve(api.setPresentationMode("MISSAL"));
      const hiddenInMissal=api.getObservedPriestEvent();
      const refusedInMissal=api.observePriestCeremonialEvent("MC-GLR-040",{
        conditions:["SEDILIA_USED","SEDILIA_USED_AND_CHANT_CONTINUES"]
      });
      await Promise.resolve(api.setPresentationMode("LIVE"));
      const staleOnReturn=api.getObservedPriestEvent();
      return {notObserved,accepted,seated:seated?.cueId??null,
        visual,scholaUnchanged,stays,cleared,refused,
        hiddenInMissal,refusedInMissal,staleOnReturn};
    });
    assert.equal(independentPriest.notObserved,null);
    assert.equal(independentPriest.accepted,true);
    assert.equal(independentPriest.seated,"AO.SM.C0276");
    assert.equal(independentPriest.visual,"SEDILIA");
    assert.equal(independentPriest.scholaUnchanged,true,
      "Observing a priest event must never rewind the independent Schola");
    assert.equal(independentPriest.stays,"AO.SM.C0276",
      "Priest seat must not change merely because the Schola changes Gloria card");
    assert.equal(independentPriest.cleared,null,
      "Priest state leaked across Gloria to Credo");
    assert.equal(independentPriest.refused,false,
      "Wrong-section priest observation must fail closed");
    assert.equal(independentPriest.hiddenInMissal,null,
      "Priest event leaked into Missal reading mode");
    assert.equal(independentPriest.refusedInMissal,false,
      "Missal reading may not accept a priest-mode ceremonial event");
    assert.equal(independentPriest.staleOnReturn,null,
      "A Mass mode switch cannot replay a previous priest movement");
    // The true celebrant track is distinct from concurrent choir/lector
    // clocks. No inferred celebrant for an unspecified Epistle reader.
    const priestProper=await page.evaluate(async()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const findBlock=id=>api.model.cards.find(c=>c.blocks?.some(b=>b.blockId===id));
      api.showSequence(findBlock("AO.SM.B014").sequence);
      const introit=api.observePriestCeremonialEvent("MC-INT-020");
      const introitCue=api.getObservedPriestEvent()?.cueId??null;
      api.showSequence(findBlock("AO.SM.B020").sequence);
      const anonymous=api.observePriestCeremonialEvent("MC-EPI-020");
      const lector=api.observePriestCeremonialEvent("MC-EPI-020",
        {observedActor:"LECTOR",observedDelivery:"SUNG"});
      const priest=api.observePriestCeremonialEvent("MC-EPI-020",
        {observedActor:"PRIEST",observedDelivery:"READ"});
      await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
      const epistle=api.getObservedPriestEvent();
      const epistleVoice=window.AO_R17_NATIVE_READER_STATE?.priestVoice?.value??null;
      api.showSequence(findBlock("AO.SM.B085").sequence);
      const scholaBefore=api.getScholaState()?.trackId??null;
      const early=api.observePriestCeremonialEvent("MC-COM-305");
      const communion=api.observePriestCeremonialEvent("MC-END-010");
      await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
      const communionCue=api.getObservedPriestEvent()?.cueId??null;
      const communionStation=api.getObservedPriestEvent()?.priestPosition??null;
      const scholaAfter=api.getScholaState()?.trackId??null;
      return {introit,introitCue,anonymous,lector,priest,
        epistleCue:epistle?.cueId??null,epistleVoice,early,
        communion,communionCue,communionStation,
        scholaUnchanged:scholaBefore===scholaAfter};
    });
    assert.equal(priestProper.introit,true);
    assert.equal(priestProper.introitCue,"AO.SM.C0043");
    assert.equal(priestProper.anonymous,false,
      "Epistle's unresolved proclaimer cannot be presumed to be priest");
    assert.equal(priestProper.lector,false,
      "A lector's Epistle must not appear as the celebrant's action");
    assert.equal(priestProper.priest,true);
    assert.equal(priestProper.epistleCue,"AO.SM.C0075");
    assert.equal(priestProper.epistleVoice,"READ / NOT SUNG");
    assert.equal(priestProper.early,false,
      "Schola's Communion proper is not the priest's post-ablution reading");
    assert.equal(priestProper.communion,true);
    assert.equal(priestProper.communionCue,"AO.SM.C0249");
    assert.equal(priestProper.communionStation,null,
      "Asynchronous track placeholder must never show as a priest station");
    assert.equal(priestProper.scholaUnchanged,true);
    // Five exact observer-only priest events must never be driven by the
    // Schola or card transitions. Verify the four supported by this
    // Missa Cantata fixture, and the Solemn-only Gradual is refused here.
    const priestObservedFive=await page.evaluate(async()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const findBlock=id=>api.model.cards.find(c=>c.blocks?.some(b=>b.blockId===id));
      const goto=id=>api.showSequence(findBlock(id).sequence);
      const priest={observedActor:"PRIEST"};
      goto("AO.SM.B014");
      const noIntroit=api.observePriestCeremonialEvent("MC-OBS-INT-POS");
      const trueIntroit=api.observePriestCeremonialEvent("MC-OBS-INT-POS",{
        ...priest,observedPosition:"ALTAR_EPISTLE_MISSAL"});
      const introitCue=api.getObservedPriestEvent()?.cueId??null;
      goto("AO.SM.B021");
      const noGradualInCantata=api.observePriestCeremonialEvent("MC-OBS-GRADUAL",{
        ...priest,observedDelivery:"READ"});
      goto("AO.SM.B030");
      const choirBefore=api.getScholaState()?.trackId??null;
      const noOffertory=api.observePriestCeremonialEvent("MC-OBS-OFFERTORY",priest);
      const trueOffertory=api.observePriestCeremonialEvent("MC-OBS-OFFERTORY",{
        ...priest,observedDelivery:"READ"});
      const offState=api.getObservedPriestEvent();
      const choirAfter=api.getScholaState()?.trackId??null;
      goto("AO.SM.B085");
      const noTurn=api.observePriestCeremonialEvent("MC-OBS-PC-TURN",priest);
      const trueTurn=api.observePriestCeremonialEvent("MC-OBS-PC-TURN",{
        ...priest,observedAction:"TURN_TO_PEOPLE"});
      const turnCue=api.getObservedPriestEvent()?.cueId??null;
      goto("AO.SM.B088");
      const noFinalTurn=api.observePriestCeremonialEvent("MC-OBS-DISMISS-TURN",{
        ...priest,conditions:["ORATIO_SUPER_POPULUM_PRESENT"],
        observedAction:"TURN_TO_PEOPLE"});
      const finalTurn=api.observePriestCeremonialEvent("MC-OBS-DISMISS-TURN",{
        ...priest,conditions:["ORATIO_SUPER_POPULUM_PRESENT","ORATIO_SUPER_POPULUM_COMPLETED"],
        observedAction:"TURN_TO_PEOPLE"});
      const finalCue=api.getObservedPriestEvent()?.cueId??null;
      return {noIntroit,trueIntroit,introitCue,noGradualInCantata,
        noOffertory,trueOffertory,offCue:offState?.cueId??null,
        offFaithfulPosture:offState?.faithfulPosture??null,
        choirUnchanged:choirBefore===choirAfter,
        noTurn,trueTurn,turnCue,noFinalTurn,finalTurn,finalCue};
    });
    assert.equal(priestObservedFive.noIntroit,false);
    assert.equal(priestObservedFive.trueIntroit,true);
    assert.equal(priestObservedFive.introitCue,"AO.SM.C0042");
    assert.equal(priestObservedFive.noGradualInCantata,false);
    assert.equal(priestObservedFive.noOffertory,false);
    assert.equal(priestObservedFive.trueOffertory,true);
    assert.equal(priestObservedFive.offCue,"AO.SM.C0109");
    assert.equal(priestObservedFive.offFaithfulPosture,null,
      "Priest's private Offertory may not trigger faithful SIT");
    assert.equal(priestObservedFive.choirUnchanged,true);
    assert.equal(priestObservedFive.noTurn,false);
    assert.equal(priestObservedFive.trueTurn,true);
    assert.equal(priestObservedFive.turnCue,"AO.SM.C0250");
    assert.equal(priestObservedFive.noFinalTurn,false);
    assert.equal(priestObservedFive.finalTurn,true);
    assert.equal(priestObservedFive.finalCue,"AO.SM.C0256");
    await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setPresentationMode("LIVE"));
    await page.waitForFunction(()=>document.querySelector("[data-ao-reader-shell]")?.dataset.mode==="LIVE");
    const guide=page.locator('[data-role="guide-button"]');
    assert.equal(await guide.count(),1,"Compatibility-only Guide control marker disappeared");
    const surface=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(c=>c.title==="Credo · Incarnation, Passion and Resurrection");
      api.showSequence(card.sequence);
      const tile=document.querySelector('[data-role="guide-button"]');
      return {hidden:tile?.hidden,disabled:tile?.disabled,
        visible:getComputedStyle(tile).display!=="none",
        ribbonCells:document.querySelectorAll('.ao-state-cell').length,
        explanatoryGuide:!!api.getNativeEventState()?.guide};
    });
    assert.equal(surface.hidden,true,"The explanatory Guide remains in LIVE");
    assert.equal(surface.disabled,true,"LIVE Guide still accepts user interaction");
    assert.equal(surface.visible,false,"LIVE Guide still occupies a ribbon column");
    assert.equal(surface.ribbonCells,2,"LIVE YOU / PRIEST ribbon was not preserved");
    // Check the source-owned in-text 1962 actions on actual rendered LIVE
    // paragraphs. A source-printed rubric must not be duplicated beneath it.
    const rubricEvidence=await page.evaluate(async()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const eligible=new Set(["AO.SM.C0111","AO.SM.C0155","AO.SM.C0174",
        "AO.SM.C0181","AO.SM.C0232","AO.SM.C0263"]);
      const entries=[];
      const frame=()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
      for(const card of api.model.cards.filter(c=>c.paragraphs.some(p=>
        (p.sourceCueIds??[]).some(id=>eligible.has(id))))){
        api.showSequence(card.sequence);
        await frame();
        for(const node of document.querySelectorAll(".ao-live-inline-rubrics")){
          entries.push({
            card:card.title,
            text:node.textContent.trim(),
            authority:node.dataset.sourceAuthority,
            observed:node.dataset.observedNow,
            ids:[...node.querySelectorAll("[data-rubric-id]")].map(el=>el.dataset.rubricId),
          });
        }
      }
      return entries;
    });
    assert.ok(rubricEvidence.length>0,"LIVE printed no certified 1962 inline rubrics");
    assert.ok(rubricEvidence.every(x=>x.authority==="MR62_RITUS" &&
      x.observed==="false" && x.ids.every(id=>/^AO\.RUB\.C\d{4}\.\d{2}$/.test(id))),
      "LIVE rubric text lost source provenance or misrepresented an observation");
    assert.ok(rubricEvidence.some(x=>lang==="fr"?/Le prêtre/.test(x.text):/The priest/.test(x.text)),
      "LIVE rubric language does not follow the reader preference");
    // Preserve direct visual evidence for human acceptance of the actual
    // 65-card Host/Chalice rubrics, not only the earlier generic Credo shot.
    if(width<=390){
      for(const [name,cueId] of [
        ["host","AO.SM.C0174"],["chalice","AO.SM.C0181"],
      ]){
        const selected=await page.evaluate(id=>{
          const api=window.__AO_PHONE_PREVIEW;
          const card=api.model.cards.find(c=>c.paragraphs.some(p=>
            (p.sourceCueIds??[]).includes(id)));
          if(!card)return null;
          api.showSequence(card.sequence);
          return card.title;
        },cueId);
        assert.ok(selected,"Source-owned curated elevation card absent: "+cueId);
        await page.evaluate(()=>new Promise(resolve=>
          requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        await page.screenshot({path:resolve(out,
          "live-65-inline-"+name+"-"+lang+"-"+width+".png"),
          fullPage:false,animations:"disabled"});
      }
    }
    await page.screenshot({path:resolve(out,lang+"-"+width+(secondConfiteor?"-with-local-confiteor":"")+"-credo.png"),fullPage:false});
    assert.deepEqual(errors,[],"Curated mobile browser JS errors");
    await context.close();
  }
  // Separate offline human evidence sheet: test on real phone-sized Chromium.
  // This sheet records independently witnessed facts and never operates the Mass UI.
  const fieldContext=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,acceptDownloads:true,deviceScaleFactor:1});
  try{
    const sheet=await fieldContext.newPage();
    const fieldErrors=[];
    sheet.on("pageerror",e=>fieldErrors.push(String(e.message)));
    await sheet.goto("http://127.0.0.1:4282/tools/priest-event-field-review.html",
      {waitUntil:"load",timeout:15000});
    assert.equal(await sheet.locator("details.event").count(),15,
      "Field sheet must cover all fifteen source-only cues");
    await sheet.selectOption("#form","MISSA_CANTATA_INCENSE");
    await sheet.selectOption("#filter","observer");
    assert.equal(await sheet.locator("details.event").count(),5,
      "Five observer-only events should be filterable");
    const introitField=sheet.locator("details.event").filter({hasText:"C0042"});
    await introitField.locator("summary").click();
    await sheet.fill("#choir","Schola singing independently");
    await sheet.fill("#notes","Directly saw celebrant at Epistle Missal.");
    await introitField.getByRole("button",{name:"Observed directly"}).click();
    assert.match(await sheet.locator("#stats").innerText(),/1\/15/);
    assert.match(await sheet.locator("#feedback").innerText(),/Recorded C0042/);
    assert.equal(await sheet.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,
      "Field sheet must not overflow 390px viewport");
    const downloadable=sheet.waitForEvent("download");
    await sheet.getByRole("button",{name:"Export evidence JSON"}).click();
    const download=await downloadable;
    const target=resolve(out,"priest-field-evidence-fixture.json");
    await download.saveAs(target);
    const data=JSON.parse(await readFile(target,"utf8"));
    assert.equal(data.schema,"ao-priest-field-evidence-v1");
    assert.equal(data.fieldCertified,false);
    assert.equal(data.session.form,"MISSA_CANTATA_INCENSE");
    assert.equal(data.expectedCueCount,15);
    assert.equal(data.records.length,1);
    assert.deepEqual([data.records[0].cueId,data.records[0].eventId,
      data.records[0].result,data.records[0].scholaObservation],
      ["C0042","MC-OBS-INT-POS","OBSERVED","Schola singing independently"]);
    assert.match(data.records[0].notes,/Directly saw celebrant/);
    await sheet.screenshot({path:resolve(out,"priest-field-review-390.png")});
    assert.deepEqual(fieldErrors,[],"Human field sheet produced browser errors");
  }finally{await fieldContext.close()}
  // Multi-form real browser simulation. Neither a choir advancing early nor
  // a late celebrant cue may cause cross-lane ownership or minister confusion.
  // This is deterministic synthetic input, never claimed as field evidence.
  for(const form of ["SOLEMN","MISSA_CANTATA_SIMPLE","LOW"]){
    const context=await browser.newContext({viewport:{width:390,height:844},
      isMobile:true,hasTouch:true,deviceScaleFactor:1});
    try{
      const page=await context.newPage();
      const errors=[];
      page.on("pageerror",e=>errors.push(String(e?.message??e)));
      await page.goto("http://127.0.0.1:4282/tests/fixtures/reader-phone-harness.html?aoLiveCards=65&lang=en&form="+form,
        {waitUntil:"networkidle",timeout:45000});
      await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
        null,{timeout:20000});
      const mount=await page.evaluate(()=>({
        status:document.documentElement.dataset.harnessReady,
        error:window.__AO_PHONE_HARNESS_ERROR??null,
      }));
      assert.equal(mount.status,"true",form+" fixture failed to mount: "+mount.error);
      const result=await page.evaluate(form=>{
        const api=window.__AO_PHONE_PREVIEW;
        const base={cards:api.model.totalCards,sourceCards:api.sourceModel.totalCards};
        if(form==="LOW"){
          return {...base,scholaAbsent:api.getScholaState()?.structuralAbsence===true,
            observes:api.observePriestCeremonialEvent("MC-OBS-INT-POS",{
              observedActor:"PRIEST",observedPosition:"ALTAR_EPISTLE_MISSAL"})};
        }
        const block=id=>api.model.cards.find(c=>c.blocks?.some(x=>x.blockId===id));
        const go=id=>{const b=block(id);if(!b)throw Error("Missing "+id);api.showSequence(b.sequence)};
        if(form==="SOLEMN"){
          go("AO.SM.B021");
          const scholaBefore=api.getScholaState();
          const noEvidence=api.observePriestCeremonialEvent("MC-OBS-GRADUAL");
          const priestRead=api.observePriestCeremonialEvent("MC-OBS-GRADUAL",{
            observedActor:"PRIEST",observedDelivery:"READ"});
          const observedCue=api.getObservedPriestEvent()?.cueId??null;
          const scholaAtPriest=api.getScholaState();
          api.nextSchola();
          const scholaAfter=api.getScholaState();
          const priestAfterChoirAdvance=api.getObservedPriestEvent()?.cueId??null;
          go("AO.SM.B020");
          const oldCueOnEpistle=api.getObservedPriestEvent();
          const falseCelebrant=api.observePriestCeremonialEvent("MC-EPI-020",{
            observedActor:"PRIEST",observedDelivery:"SUNG"});
          go("AO.SM.B026");
          const falseGospel=api.observePriestCeremonialEvent("MC-GSP-060");
          return {...base,scholaBefore:scholaBefore?.trackId??null,
            noEvidence,priestRead,observedCue,
            scholaUnchanged:scholaAtPriest?.trackId===scholaBefore?.trackId &&
              scholaAtPriest?.index===scholaBefore?.index &&
              scholaAtPriest?.complete===scholaBefore?.complete,
            scholaAfter:scholaAfter?.trackId??null,
            choirAdvanced:scholaAfter?.index!==scholaAtPriest?.index ||
              scholaAfter?.complete!==scholaAtPriest?.complete,
            priestAfterChoirAdvance,oldCueOnEpistle,
            falseCelebrant,falseGospel};
        }
        go("AO.SM.B020");
        const choirBefore=api.getScholaState();
        const lector=api.observePriestCeremonialEvent("MC-EPI-020",{
          observedActor:"LECTOR",observedDelivery:"SUNG"});
        const celebrant=api.observePriestCeremonialEvent("MC-EPI-020",{
          observedActor:"PRIEST",observedDelivery:"READ"});
        const priestState=api.getObservedPriestEvent();
        const choirAfter=api.getScholaState();
        go("AO.SM.B030");
        const reset=api.getObservedPriestEvent();
        return {...base,lector,celebrant,priestCue:priestState?.cueId??null,
          scholaUnchanged:choirBefore?.trackId===choirAfter?.trackId &&
            choirBefore?.index===choirAfter?.index,
          reset};
      },form);
      if(form==="SOLEMN"){
        assert.equal(result.cards,65,"Solemn combined-Sanctus model regressed");
        assert.equal(result.scholaBefore,"GRADUAL");
        assert.equal(result.noEvidence,false);
        assert.equal(result.priestRead,true);
        assert.equal(result.observedCue,"AO.SM.C0077");
        assert.equal(result.scholaUnchanged,true,"Priest read must not advance choir");
        assert.equal(result.scholaAfter,"GRADUAL");
        assert.equal(result.choirAdvanced,true,"Simulated choir advancement did not happen");
        assert.equal(result.priestAfterChoirAdvance,"AO.SM.C0077",
          "Schola advancing must not clear/update the priest's independent Gradual");
        assert.equal(result.oldCueOnEpistle,null,"Priest event leaked across source sections");
        assert.equal(result.falseCelebrant,false,"Solemn Epistle lector became priest");
        assert.equal(result.falseGospel,false,"Solemn deacon Gospel became priest");
      }else if(form==="MISSA_CANTATA_SIMPLE"){
        assert.equal(result.cards,65);
        assert.equal(result.lector,false);
        assert.equal(result.celebrant,true);
        assert.equal(result.priestCue,"AO.SM.C0075");
        assert.equal(result.scholaUnchanged,true);
        assert.equal(result.reset,null);
      }else{
        assert.notEqual(result.cards,65,"Low Mass unexpectedly selected the Sung review");
        assert.equal(result.scholaAbsent,true);
        assert.equal(result.observes,false,
          "Low Mass accepted source-only Sung celebrant event");
      }
      assert.deepEqual(errors,[],form+" browser simulation JavaScript errors");
      await page.screenshot({path:resolve(out,"priest-dual-clock-"+form.toLowerCase()+".png")});
    }finally{await context.close()}
  }
  console.log("Curated 65 phone: PASS — all 64/65 visible stages at 320/390/768px EN + 390px FR; source roles, text contrast, Schola nonoverlap and inline rubrics without Guide.");
}finally{
  await browser?.close();
  await new Promise(done=>server.close(()=>done()));
}
