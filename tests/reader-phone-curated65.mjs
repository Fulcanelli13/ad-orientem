import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
await mkdir(out,{recursive:true});
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
    assert.equal(summary.count,65,"Review query param did not activate curated 65");
    assert.equal(summary.canonical,39);
    assert.equal(summary.owner,"SOURCE_FIRST_LIVE_CURATED_65_REVIEW");
    assert.ok(summary.rootVisible && summary.navNext && summary.navPrev);
    assert.ok(summary.shellWidth<=width+1,"Phone viewport horizontal overflow");
    assert.equal(summary.overflow,false,"Curated Mass caused document horizontal scroll");
    assert.ok(summary.headings.includes("Gloria · The Celebrant's Intonation"));
    assert.ok(summary.headings.includes("Words of Consecration and Elevation · Host"));
    assert.ok(summary.headings.includes("Communion Antiphon"));
    const landmarks=[
      "Gloria · The Celebrant's Intonation",
      "Gloria · Praise and Supplication",
      "Credo · Incarnation, Passion and Resurrection",
      "Sanctus",
      "Benedictus",
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
      assert.ok(state.prayerOpacity>=.80,
        "Inactive liturgical text still unreadably dim: "+title+" opacity "+state.prayerOpacity);
      if(state.scholaTop!=null){
        assert.ok(state.readerBottom<=state.scholaTop+3,
          "Schola overlay still covers the real prayer reading viewport: "+title+
          " "+state.readerBottom+" vs "+state.scholaTop+" "+JSON.stringify(state.layoutDiagnostics));
      }
      if(title==="Gloria · The Celebrant's Intonation")assert.equal(state.track,null);
      if(title==="Gloria · Praise and Supplication")assert.equal(state.track,"GLORIA");
      if(title==="Sanctus")assert.equal(state.track,"SANCTUS_BENEDICTUS");
      if(title==="Benedictus")assert.equal(state.track,"SANCTUS_BENEDICTUS");
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
    const resolvedIcons=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const stage=api.model.cards.find(c=>c.title==="Sanctus");
      api.showSequence(stage.sequence);
      return [...document.querySelectorAll('[data-icon-slot]')].filter(el=>
        !el.hidden && el.getBoundingClientRect().width>0 &&
        (getComputedStyle(el).backgroundImage!=="none" ||
         getComputedStyle(el).webkitMaskImage!=="none" ||
         getComputedStyle(el).maskImage!=="none")
      ).map(el=>el.dataset.iconSlot);
    });
    assert.ok(resolvedIcons.length>=1,
      "Frozen production icon bank not resolved in the actual curated phone fixture");
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
          });
        }
        return observed;
      });
      const gate={
        "AO.SM.C0071":{response:/Et cum spíritu tuo/},
        "AO.SM.C0173":{noGesture:true},
        "AO.SM.C0174":{action:/ELEVATES HOST/,gesture:/Sacred Host/},
        "AO.SM.C0179":{noGesture:true},
        "AO.SM.C0181":{action:/ELEVATES CHALICE/,gesture:/Chalice/},
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
        if(expected.noGesture)assert.equal(state.gesture,null,
          state.cueId+": elevation gesture fired prematurely on formula");
        if(expected.action)assert.match(state.priestAction??"",expected.action);
        if(expected.gesture)assert.match(state.gesture??"",expected.gesture);
      }
    }
    const guide=page.locator('[data-role="guide-button"]');
    assert.equal(await guide.count(),1,"Curated card lacks native Guide control");
    const guides=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(c=>c.title==="Credo · Incarnation, Passion and Resurrection");
      api.showSequence(card.sequence);
      const label=document.querySelector('[data-role="guide-button"]')?.textContent?.trim();
      return {label};
    });
    assert.ok(guides.label!=null,"Guide did not render");
    await page.screenshot({path:resolve(out,lang+"-"+width+(secondConfiteor?"-with-local-confiteor":"")+"-credo.png"),fullPage:false});
    assert.deepEqual(errors,[],"Curated mobile browser JS errors");
    await context.close();
  }
  console.log("Curated 65 phone: PASS — all 64/65 visible stages at 320/390/768px EN + 390px FR; source roles, text contrast, Schola nonoverlap and Guide.");
}finally{
  await browser?.close();
  await new Promise(done=>server.close(()=>done()));
}
