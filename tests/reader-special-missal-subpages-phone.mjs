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
  for(const rite of ["candlemas","ash","easter-vigil"]){
    const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const page=await context.newPage();
    const errors=[];page.on("pageerror",error=>errors.push(error.message));
    const url="http://127.0.0.1:4397/tests/fixtures/reader-phone-harness.html?mode=MISSAL&lang=fr&rite="+rite;
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

    if(rite==="candlemas"){
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
    }else{
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
    }
    assert.equal(errors.length,0,rite+" generated a browser exception: "+errors.join(";"));
    await context.close();
  }
  console.log("PASS 390px Missal special-rite browser pages: full Candlemas/Ash blessings and Easter Vigil 92-line Litany");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
