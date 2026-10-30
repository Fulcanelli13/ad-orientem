import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const artifact=resolve(root,"artifacts/m1-mass-root");await mkdir(artifact,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const b=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream"});res.end(b);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message??e));}
});await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoMassAccessM1=1&aoMassRootM1=1&aoR17Reader=native",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForSelector('#ao-global-ribbon [data-ao-app-surface="mass"]',{state:"visible",timeout:20000});
  await page.locator('#ao-global-ribbon [data-ao-app-surface="mass"]').click();
  await page.waitForSelector('html[data-ao-m1-mass-root="true"] #ao-mass-flow-v1 [data-ao-m1-root]',{timeout:18000});
  await page.waitForSelector("[data-m1-rows] [data-m1-choice='mass']",{state:"visible",timeout:15000});
  const v=await page.evaluate(()=>{
    const back=document.querySelector("#ao-mass-flow-v1 .aoMassFlowBackdrop");
    const flow=back?.querySelector(".aoMassFlow");
    const nav=document.querySelector("#ao-global-ribbon");
    const main=flow?.getBoundingClientRect(),overlay=back?.getBoundingClientRect(),ribbon=nav?.getBoundingClientRect();
    const header=flow?.querySelector("[data-ao-m1-host-header]");
    return {
      ariaModal:back?.hasAttribute("aria-modal"),role:flow?.getAttribute("role"),
      tabs:[...nav.querySelectorAll("[data-ao-app-surface]")].filter(x=>!x.hidden).length,
      massSelected:nav.querySelector('[data-ao-app-surface="mass"]')?.getAttribute("aria-current"),
      modalHeaderVisible:header?getComputedStyle(header).display!=="none":null,
      overlayTop:overlay?.top,overlayBottom:overlay?.bottom,ribbonTop:ribbon?.top,
      documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,
      massFlowCount:document.querySelectorAll("#ao-mass-flow-v1 .aoMassFlow").length,
      startCount:document.querySelectorAll("[data-ao-start-live]").length,
      readerMounted:!!globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected,
      flowWidth:main?.width,
    };
  });
  assert.equal(v.ariaModal,false,"Root destination must not claim an overlay modal");
  assert.equal(v.role,"main","Mass preflight must act as a named app root");
  assert.equal(v.massSelected,"page","Mass ribbon must be the selected destination");
  assert.ok(v.tabs>=5,"Bottom shell destinations must remain available");
  assert.ok(v.overlayTop>=-2&&v.overlayTop<=2,"Mass root must begin at viewport top");
  assert.ok(v.overlayBottom<=v.ribbonTop+3&&v.overlayBottom>=v.ribbonTop-6,
    "Mass root must end above ribbon, not obscure navigation: "+JSON.stringify(v));
  assert.equal(v.modalHeaderVisible,false,"Legacy Mass Setup / close header must not render");
  assert.equal(v.massFlowCount,1,"Host Mass preflight must retain one owner");
  assert.equal(v.startCount,1,"Exactly one original Begin Mass action");
  assert.equal(v.readerMounted,false,"Mass tab must not skip source preflight");
  assert.ok(v.documentWidth<=v.viewport+1,"Mass root horizontal overflow");
  // The host's crossfade can linger after selector readiness. Capture the
  // settled root, not a translucent outgoing Home frame.
  await page.waitForTimeout(1100);
  assert.equal(await page.locator("[data-folio-overview-button]").isVisible(),false,
    "Overview must not repeat Your Mass as a useless back button");
  await page.screenshot({path:resolve(artifact,width+"-mass-root.png")});

  // H1.2 owns appearance globally; M1 must follow without its own theme state.
  const assertSurfaceTheme=async(expected)=>{
    const observed=await page.evaluate(()=>{
      const html=document.documentElement,cs=getComputedStyle(html);
      const identity=document.querySelector("[data-ao-mass-access-m1] .aoMassFolioIdentity");
      const title=identity?.querySelector("h2");
      const kicker=identity?.querySelector(".aoMassFolioKicker");
      const list=document.querySelector(".aoM1Choices");
      const choice=list?.querySelector(".aoM1ChoiceContent strong");
      const choiceSmall=list?.querySelector(".aoM1ChoiceContent small");
      const rgb=s=>{const parts=String(s).match(/\d+(?:\.\d+)?/g)?.slice(0,3).map(Number);
        return parts?.length===3?parts:null;};
      const lin=n=>{const v=n/255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;};
      const luminance=s=>{const n=rgb(s);return n?.length===3?(0.2126*lin(n[0])+0.7152*lin(n[1])+0.0722*lin(n[2])):null;};
      const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);
        return x===null||y===null?null:(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
      const bg=getComputedStyle(identity).backgroundColor;
      const choiceBg=getComputedStyle(list).backgroundColor;
      return {
        appearance:html.dataset.aoAppearanceV1,
        choice:html.dataset.aoAppearanceChoiceV1,
        tokens:{background:cs.getPropertyValue("--bg").trim(),text:cs.getPropertyValue("--text").trim()},
        identityBg:bg,
        headlineContrast:contrast(getComputedStyle(title).color,bg),
        kickerContrast:contrast(getComputedStyle(kicker).color,bg),
        choiceContrast:contrast(getComputedStyle(choice).color,choiceBg),
        choiceCaptionContrast:contrast(getComputedStyle(choiceSmall).color,choiceBg),
        overflow:document.documentElement.scrollWidth-innerWidth,
        selected:document.querySelector('#ao-global-ribbon [data-ao-app-surface="mass"]')?.getAttribute("aria-current")
      };
    });
    assert.equal(observed.appearance,expected,"M1 must track Settings-owned effective appearance");
    assert.equal(observed.selected,"page","Appearance changes must not lose Mass tab");
    assert.ok(observed.overflow<=1,"M1 appearance causes horizontal overflow: "+JSON.stringify(observed));
    for(const key of ["headlineContrast","kickerContrast","choiceContrast","choiceCaptionContrast"])
      assert.ok(observed[key]>=4.5,"M1 contrast "+key+" below AA: "+JSON.stringify(observed));
    return observed;
  };
  await assertSurfaceTheme("dark");
  await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359.setPath("appearance.mode","light"));
  await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceV1==="light");
  const light=await assertSurfaceTheme("light");
  assert.equal(light.tokens.background,"#F6F2EA","Light theme must use H1.2 shared foundation");
  assert.equal(light.tokens.text,"#1E242B","Light theme must use H1.2 shared foreground");
  await page.screenshot({path:resolve(artifact,width+"-mass-root-light.png")});
  await page.emulateMedia({colorScheme:"light"});
  await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359.setPath("appearance.mode","auto"));
  await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceChoiceV1==="auto"&&
    document.documentElement.dataset.aoAppearanceV1==="light");
  await assertSurfaceTheme("light");
  await page.emulateMedia({colorScheme:"dark"});
  await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceV1==="dark");
  await assertSurfaceTheme("dark");
  await page.screenshot({path:resolve(artifact,width+"-mass-root-auto-dark.png")});

  await page.locator('#ao-global-ribbon [data-ao-app-surface="home"]').click();
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:15000});
  await page.waitForFunction(()=>document.documentElement.dataset.aoM1MassRoot!=="true",
    null,{timeout:15000});
  const after=await page.evaluate(()=>({
    home:document.querySelector(".homeScreen")?.getClientRects().length>0,
    root:document.documentElement.dataset.aoM1MassRoot==="true",
    modal:document.querySelector(".aoMassFlow")?.getAttribute("role")
  }));
  assert.equal(after.home,true,"Back navigation must restore Today");
  assert.equal(after.root,false,"Mass root style must clean up");
  assert.notEqual(after.modal,"main","Mass role must restore after leaving");
  await page.locator('#ao-global-ribbon [data-ao-app-surface="mass"]').click();
  await page.waitForSelector('html[data-ao-m1-mass-root="true"] [data-m1-choice="mass"]',{state:"visible",timeout:15000});
  assert.equal(await page.locator('[data-ao-full-mass-preflight]').count(),1,
    "Re-entering Mass must not create a second preflight");
  assert.equal(errors.length,0,"Unexpected root browser errors: "+JSON.stringify(errors));
  console.log("PASS M1 Mass tab root "+width+"px, source-owned single preflight, 5 tabs, no modal, round-trip Today "+JSON.stringify(v));
  await page.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
