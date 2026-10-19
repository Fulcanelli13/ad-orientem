import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
  try{
    const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
    if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
    const content=await readFile(p);
    res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream"});
    res.end(content);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error))}
});
await new Promise((ok,reject)=>{server.once("error",reject);server.listen(4397,"127.0.0.1",ok)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const rite of ["asperges","candlemas","ash","easter-vigil","corpus","requiem","holy-thursday"]){
    const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const page=await context.newPage();
    const errors=[];page.on("pageerror",error=>errors.push(error.message));
    const condition=rite==="corpus"?"following=corpus&date=2027-05-27&form=SOLEMN":
      rite==="requiem"?"following=requiem&body=1&burial=1&date=2026-11-02&form=SOLEMN":
      rite==="holy-thursday"?"following=holy-thursday&date=2027-03-25&form=SOLEMN":
      "rite="+rite;
    const url="http://127.0.0.1:4397/tests/fixtures/reader-phone-harness.html?mode=MISSAL&lang=fr&"+condition;
    await page.goto(url,{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),null,{timeout:60000});
    const state=await page.evaluate(()=>({
      status:document.documentElement.dataset.harnessReady,
      error:window.__AO_PHONE_HARNESS_ERROR??null,
      record:window.__AO_PHONE_PREVIEW?.getNativeEventState?.()?.cardId??null,
      paragraphs:document.querySelectorAll(".ao-reader-paragraph").length,
    }));
    assert.equal(state.status,"true",rite+" fixture unable to mount: "+state.error);
    assert.equal(errors.length,0,rite+" initial runtime error: "+errors.join(";"));
    const click=async(direction="next")=>
      page.locator('.ao-reader-nav button[data-reader-nav="'+direction+'"]').click({force:true});
    const rows=async()=>page.locator(".ao-reader-paragraph").count();

    if(rite==="asperges"){
      assert.equal(state.record,"ASP-R01");
      await click(); // Antiphon/psalm/Gloria/repetition
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState().card.id),
        "ASP-R02");
      assert.equal(await rows(),4);
      const columns=await page.evaluate(()=>{
        const rows=[...document.querySelectorAll(".ao-reader-paragraph")];
        return rows.map(el=>({latin:el.querySelector(".ao-line-primary")?.textContent??"",
          french:el.querySelector(".ao-line-secondary")?.textContent??""}));
      });
      assert.ok(columns.every(r=>r.latin.trim()&&r.french.trim()),
        "Asperges bilingual French translation is missing from side-by-side reader");
      assert.match(columns[0].latin,/Asperges me/);
      await click(); // Personal sprinkling stage
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState().card.id),
        "ASP-R03");
      await click(); // Six dialogue verses on first Missal page
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState().card.id),
        "ASP-R04");
      assert.equal(await rows(),6);
      await click(); // Subpage only: ceremony remains ASP-R04
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState().card.id),
        "ASP-R04","A Missal page turn advanced the original Asperges event");
      assert.equal(await rows(),3,"The Orémus/collect/Amen subpage is incomplete");
      assert.match(await page.locator(".ao-reader-paragraph").first().innerText(),/Orémus/);
      assert.match(await page.locator(".ao-line-secondary").first().innerText(),/Prions/);
      await click();
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState().card.id),
        "ASP-R05","The reader failed to hand off after final Asperges prayer");
      assert.equal((await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState())).handoff,
        "FOOT_CLUSTER");
      await click("previous");
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState().card.id),
        "ASP-R04");
      assert.equal(await rows(),3,"Back-navigation did not reopen Asperges final collect");
    }else if(rite==="candlemas"){
      assert.equal(state.record,"CND-R01");
      assert.equal(await rows(),2,"Candlemas introductory versicle/response lost");
      for(let n=0;n<5;n++){
        await click();
        const snapshot=await page.evaluate(()=>({
          id:window.__AO_PHONE_PREVIEW.getCandlemasState().card.id,
          sourceRows:window.__AO_PHONE_PREVIEW.getCandlemasState().card.paragraphs.length,
          shownRows:document.querySelectorAll(".ao-reader-paragraph").length,
        }));
        assert.equal(snapshot.id,"CND-R01","A Missal subpage advanced the blessing rite index");
        assert.equal(snapshot.shownRows,3,"Candlemas oration is not the three source rows");
        assert.equal(snapshot.sourceRows,17,"Candlemas canonical source prayers mutated");
      }
      await click();
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCandlemasState().card.id),
        "CND-R02","Rite did not advance after all five complete blessing prayers");
      await click("previous");
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCandlemasState().card.id),
        "CND-R01","Back navigation did not return to the original five-orations stage");
      assert.equal(await rows(),3,"Back navigation failed to reopen final prayer page");
    }else if(rite==="ash"){
      assert.equal(state.record,"ASH-R01");
      await click();
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getAshState().card.id),
        "ASH-R01","Ashes advanced before complete blessing orations");
      assert.equal(await rows(),3,"Ash blessing Orémus/prayer/Amen broken");
    }else if(rite==="corpus"||rite==="requiem"){
      const expected=rite==="corpus"?"CORPUS_CHRISTI_PROCESSION":"REQUIEM_ABSOLUTION";
      const stateName=rite==="corpus"?"getCorpusChristiState":"getRequiemAbsolutionState";
      const start=await page.evaluate(owner=>{
        const api=window.__AO_PHONE_PREVIEW;
        let end=null;
        for(const c of [...api.model.cards].reverse()){
          if(api.showSequence(c.sequence)){end=c.sectionId;break}
        }
        return {end,source:!!(owner==="CORPUS_CHRISTI_PROCESSION"?
          api.getCorpusChristiState():api.getRequiemAbsolutionState())};
      },expected);
      assert.ok(start.end&&start.source,rite+" did not mount Mass and conditional annex");
      await click();
      assert.equal(await page.evaluate(()=>
        window.__AO_PHONE_PREVIEW.getNativeEventState()?.specialRite),
        expected,rite+" annex did not begin from Mass lifecycle");
      const stage=async()=>page.evaluate(key=>{
        const p=window.__AO_PHONE_PREVIEW;
        return (key==="corpus"?p.getCorpusChristiState():p.getRequiemAbsolutionState()).card.id;
      },rite);
      if(rite==="corpus"){
        assert.equal(await stage(),"CORPUS-R01");
        await click();
        assert.equal(await stage(),"CORPUS-R02");
        assert.equal(await rows(),2,"Pange lingua first two stanzas not printed");
        assert.equal(await page.locator(".ao-line-secondary").count(),2,
          "Corpus Christi French Missal did not render its first two approved editorial stanzas");
        assert.match(await page.locator(".ao-line-secondary").first().innerText(),
          /Chante, ô ma langue/,"Incorrect French Eucharistic stanza parallel");
        await click();
        assert.equal(await stage(),"CORPUS-R02",
          "Turning a Corpus Christi chant page advanced the procession event");
        assert.equal(await rows(),2,"Pange lingua last two stanzas not printed");
        assert.equal(await page.locator(".ao-line-secondary").count(),2,
          "Second Corpus Christi hymn page silently fell back to Latin only");
        await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setPresentationMode("LIVE"));
        assert.equal(await stage(),"CORPUS-R02",
          "Switching to LIVE unexpectedly advanced the Eucharistic procession");
        assert.equal(await rows(),4,
          "LIVE must display the intact four-stanza hymn source");
        await page.evaluate(()=>window.__AO_PHONE_PREVIEW.setPresentationMode("MISSAL"));
        assert.equal(await stage(),"CORPUS-R02");
        assert.equal(await rows(),2,
          "Returning to MISSAL did not reconstruct the initial hymn subpage");
        await click();
        assert.equal(await stage(),"CORPUS-R02");
        await click();
        assert.equal(await stage(),"CORPUS-R03");
        assert.notEqual(await page.evaluate(()=>
          window.__AO_PHONE_PREVIEW.getCorpusChristiState().posture),
          "PROCESSIONAL","Nonparticipant was forced into Corpus Christi procession");
        await click();
        assert.equal(await stage(),"CORPUS-R04");
        assert.equal(await page.locator(".ao-line-secondary").count(),2,
          "Tantum ergo two approved editorial French stanzas missing");
        await click();
        assert.equal(await stage(),"CORPUS-R05");
        assert.equal(await rows(),2,"Benediction versicle and response must stay together");
        await click();
        assert.equal(await stage(),"CORPUS-R05",
          "Benediction oration page advanced its source action prematurely");
        assert.equal(await rows(),3,"Orémus/collect/Amen must stay on one page");
        assert.equal(await page.locator(".ao-line-secondary").count(),3,
          "Corpus Benediction French Orémus/collect/Amen were not rendered");
        assert.match(await page.locator(".ao-line-secondary").first().innerText(),/Prions/);
        await click();
        assert.equal(await stage(),"CORPUS-R06");
        await click("previous");
        assert.equal(await stage(),"CORPUS-R05");
        assert.equal(await rows(),3,
          "Back navigation must reopen Benediction final oration");
      }else{
        assert.equal(await stage(),"ABS-R01");
        await click();
        assert.equal(await stage(),"ABS-R02");
        await click();
        assert.equal(await stage(),"ABS-R03");
        assert.equal(await rows(),3);
        await click();
        assert.equal(await stage(),"ABS-R03",
          "A Libera me Missal reading page advanced the Requiem source event");
        assert.equal(await rows(),4);
        await click();
        assert.equal(await stage(),"ABS-R04");
        assert.equal(await rows(),4,"Kyrie and Pater noster source text missing");
        for(const expectedRows of [6,4,2]){
          await click();
          assert.equal(await stage(),"ABS-R04");
          assert.equal(await rows(),expectedRows,
            "Requiem absolution dialogue section was cut or repeated");
        }
        await click();
        assert.equal(await stage(),"ABS-R05");
        assert.notEqual(await page.evaluate(()=>
          window.__AO_PHONE_PREVIEW.getRequiemAbsolutionState().posture),
          "PROCESSIONAL","Burial flag must not silently enroll the lay participant");
        await click("previous");
        assert.equal(await stage(),"ABS-R04");
        assert.equal(await rows(),2,
          "Back navigation must reopen final Requiem absolution prayer");
      }
    }else if(rite==="holy-thursday"){
      const started=await page.evaluate(()=>{
        const p=window.__AO_PHONE_PREVIEW;
        let end=null;
        for(const card of [...p.model.cards].reverse()){
          if(p.showSequence(card.sequence)){end=card.sectionId;break}
        }
        return {end,source:!!p.getHolyThursdayPostState()};
      });
      assert.ok(started.end&&started.source,"Holy Thursday conditional annex not mounted");
      await click();
      const stage=async()=>page.evaluate(()=>window.__AO_PHONE_PREVIEW.getHolyThursdayPostState().card.id);
      assert.equal(await stage(),"HT-R01");
      assert.equal(await rows(),2,"Holy Thursday Pange lingua opening stanzas not paginated");
      assert.equal(await page.locator(".ao-line-secondary").count(),2,
        "Holy Thursday first two hymn stanzas lack French");
      await click();
      assert.equal(await stage(),"HT-R01","Pange lingua page turn advanced ceremony");
      await click();
      assert.equal(await stage(),"HT-R02");
      await click();
      assert.equal(await stage(),"HT-R03");
      assert.equal(await page.locator(".ao-line-secondary").count(),2,
        "Holy Thursday Tantum ergo/Genitori not bilingual");
      await click();
      assert.equal(await stage(),"HT-R04");
      await click();
      assert.equal(await stage(),"HT-R05");
      assert.equal(await rows(),4);
      assert.equal(await page.locator(".ao-line-secondary").count(),4,
        "Whole Psalm reference opening paragraph lacked French");
      const unknown=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getHolyThursdayPostState());
      assert.equal(unknown.clericsPresent,null);
      assert.equal(unknown.psalmPerformance,"CLERICS_UNRESOLVED_FULL_PSALM_REFERENCE_ONLY");
      const choices=page.locator('[data-role="rite-psalm-choice"]');
      assert.equal(await choices.isVisible(),true,
        "Cannot choose the 1962 rubric's conditional clerics-present branch");
      await choices.locator('button[data-psalm-clerics="no"]').click();
      assert.equal(await stage(),"HT-R05","Changing clerics option moved source event");
      const short=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getHolyThursdayPostState());
      assert.equal(short.clericsPresent,false);
      assert.equal(short.psalmPerformance,"CELEBRANT_FIRST_VERSE_ONLY_NO_CLERICS");
      assert.equal(short.card.psalmReferenceRows.length,15);
      assert.equal(await rows(),3,"No-clerics recitation exceeds first verse");
      assert.equal(await page.locator(".ao-line-secondary").count(),3);
      const firstVerse=await page.locator('.ao-reader-paragraph[data-paragraph-id="HT-R05-P1-FIRSTVERSE"]').innerText();
      assert.match(firstVerse,/quare me dereliquísti/);
      assert.doesNotMatch(firstVerse,/clamo per diem/,
        "Rubric first verse improperly contains the next biblical verse");
      await choices.locator('button[data-psalm-clerics="yes"]').click();
      assert.equal(await stage(),"HT-R05");
      assert.equal((await page.evaluate(()=>
        window.__AO_PHONE_PREVIEW.getHolyThursdayPostState())).psalmPerformance,
        "CLERICS_RECITE_UNTIL_STRIPPING_COMPLETE");
      assert.equal(await rows(),4);
      for(let i=0;i<3;i++){
        await click();
        assert.equal(await stage(),"HT-R05",
          "Full Psalm Missal page turn advanced Holy Thursday stage");
      }
      assert.equal(await rows(),3);
      assert.equal(await page.locator(".ao-line-secondary").count(),3,
        "Final Psalm and repeated antiphon French missing");
      await choices.locator('button[data-psalm-clerics="no"]').click();
      assert.equal(await rows(),3);
      await click();
      assert.equal(await stage(),"HT-R06");
      assert.equal((await page.evaluate(()=>
        window.__AO_PHONE_PREVIEW.getHolyThursdayPostState())).handoff,
        "POST_MASS_LIFECYCLE");
    }else{
      const prophecy=await page.evaluate(()=>{
        window.__AO_PHONE_PREVIEW.goToEasterVigilRecord("EV-LESS-01-READ");
        const state=window.__AO_PHONE_PREVIEW.getEasterVigilState();
        return {recordId:state.step.recordId,sourceRows:state.step.paragraphs.length};
      });
      assert.equal(prophecy.recordId,"EV-LESS-01-READ");
      assert.equal(prophecy.sourceRows,14,
        "Full Genesis prophecy source must retain fourteen text paragraphs");
      assert.equal(await rows(),3,"Long Genesis prophecy was not divided into reading pages");
      for(let i=1;i<5;i++){
        await click();
        assert.equal(await page.evaluate(()=>
          window.__AO_PHONE_PREVIEW.getEasterVigilState().step.recordId),
          "EV-LESS-01-READ","Genesis Missal page changed ceremony state");
      }
      assert.equal(await rows(),2,"Genesis final two source paragraphs were lost");
      await click();
      assert.notEqual(await page.evaluate(()=>
        window.__AO_PHONE_PREVIEW.getEasterVigilState().step.recordId),
        "EV-LESS-01-READ","Genesis prophecy never handed off to Oremus");
      const initial=await page.evaluate(()=>{
        window.__AO_PHONE_PREVIEW.goToEasterVigilRecord("EV-LIT1-400");
        return {
          id:window.__AO_PHONE_PREVIEW.getEasterVigilState().step.recordId,
          length:window.__AO_PHONE_PREVIEW.getEasterVigilState().step.paragraphs.length,
        };
      });
      assert.equal(initial.id,"EV-LIT1-400");
      assert.equal(initial.length,92);
      assert.equal(await rows(),24,"Litany response pairs must occupy 12 pairs per page");
      await click();
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getEasterVigilState().step.recordId),
        "EV-LIT1-400","Litany page flip advanced the Vigil graph");
      assert.equal(await rows(),24);
      const secondary=await page.locator(".ao-line-secondary").first().innerText().catch(()=>null);
      assert.ok(secondary?.trim(),"Certified Easter Vigil French translation missing from subpage");
      for(let i=0;i<3;i++)await click();
      assert.notEqual(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getEasterVigilState().step.recordId),
        "EV-LIT1-400","Easter Vigil failed to leave source Litany after final page");
      // Full Exsultet is one canonical source row, projected onto twelve
      // Missal-only reading pages. No passage, Amen or English/French
      // translation may be manufactured, skipped, or duplicated.
      await page.evaluate(()=>window.__AO_PHONE_PREVIEW.goToEasterVigilRecord("EV-EXS-200"));
      assert.equal(await rows(),1,"First Exsultet paragraph page is not singular");
      const firstExs=await page.locator(".ao-reader-paragraph").first().innerText();
      assert.match(firstExs,/Exsúltet iam/);
      const exsParagraphs=[firstExs];
      for(let i=1;i<12;i++){
        await click();
        assert.equal(await page.evaluate(()=>
          window.__AO_PHONE_PREVIEW.getEasterVigilState().step.recordId),"EV-EXS-200",
          "Missal Exsultet page turn moved the canonical EV graph");
        assert.equal(await rows(),1,"Exsultet page unexpectedly holds multiple source passages");
        exsParagraphs.push(await page.locator(".ao-reader-paragraph").first().innerText());
      }
      assert.ok(exsParagraphs.some(t=>/Quaprópter astántes/.test(t)));
      assert.ok(exsParagraphs.some(t=>/O felix culpa/.test(t)));
      assert.ok(exsParagraphs.some(t=>/Per eúndem Dóminum/.test(t)));
      assert.equal(new Set(exsParagraphs).size,12,"Duplicate Exsultet pages obscured source prayers");
      // In French mode, source has no complete Exsultet translation. The
      // editorial opening phrase may not masquerade as a bilingual text.
      assert.equal(await page.locator(".ao-line-secondary").count(),0,
        "Editorial French Exsultet summary displayed as complete prayer");
      await click();
      assert.equal(await page.evaluate(()=>
        window.__AO_PHONE_PREVIEW.getEasterVigilState().step.recordId),"EV-EXS-210",
        "Exsultet failed to advance to final canonical singing stage");
      await click("previous");
      assert.equal(await page.evaluate(()=>
        window.__AO_PHONE_PREVIEW.getEasterVigilState().step.recordId),"EV-EXS-200");
      assert.match(await page.locator(".ao-reader-paragraph").first().innerText(),
        /Per eúndem Dóminum/,"Back arrow did not reopen the last Exsultet paragraph");

    }
    assert.equal(errors.length,0,rite+" generated a browser exception: "+errors.join(";"));
    await context.close();
  }
  console.log("PASS 390px seven-rite Missal browser incl Holy Thursday conditional Psalm 21 and French source parity");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
