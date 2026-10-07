import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const candidate=resolve(repoRoot,"."+pathname);
    if(candidate!==repoRoot&&!candidate.startsWith(repoRoot+sep)){res.writeHead(403);res.end("forbidden");return}
    const data=await readFile(candidate);
    res.writeHead(200,{"content-type":mime[extname(candidate)]??"application/octet-stream","cache-control":"no-store"});res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4178,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const pageErrors=[];
  const ariaFocusErrors=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  page.on("console",message=>{
    const text=message.text();
    if(/Blocked aria-hidden|aria-hidden.*focus|retained focus/i.test(text))ariaFocusErrors.push(text);
  });

  await page.goto("http://127.0.0.1:4178/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.installed===true &&
    globalThis.AO_HOME_APP_V1?.status?.().installed===true &&
    globalThis.AO_LEARN_APP_V1?.status?.().installed===true,
    null,{timeout:30000}
  );
  await page.waitForSelector("[data-ao-app-surface='learn']",{state:"visible",timeout:30000});

  const assertNoMass=async label=>{
    const snapshot=await page.evaluate(()=>({
      route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
      nativeReader:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
      nativeRuntime:Boolean(globalThis.AO_R17_MASS_RUNTIME),
    }));
    assert.notEqual(snapshot.route,"live",label+": legacy/core LIVE route started");
    assert.equal(snapshot.nativeReader,false,label+": native Mass reader mounted");
    assert.equal(snapshot.nativeRuntime,false,label+": native Mass runtime started");
  };

  const assertFocusSafe=async label=>{
    const issue=await page.evaluate(()=>{
      const active=document.activeElement;
      if(!active||active===document.body||active===document.documentElement)return null;
      const hidden=active.closest?.('[aria-hidden="true"],[hidden]');
      return hidden?{tag:active.tagName,hidden:hidden.id||hidden.className||hidden.tagName}:null;
    });
    assert.equal(issue,null,label+": focus remained inside a hidden/aria-hidden ancestor");
  };

  async function openLearn(){
    await page.locator("[data-ao-app-surface='learn']").tap();
    await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="learn",null,{timeout:10000});
  }

  await openLearn();
  const learned=await page.evaluate(()=>{
    const root=document.getElementById("ao-learn-modular-root");
    const donor=document.getElementById("ao-v37-root");
    const ribbon=document.getElementById("ao-global-ribbon");
    const rr=root?.getBoundingClientRect(),rb=ribbon?.getBoundingClientRect();
    const tapTargets=[...root.querySelectorAll("button")].map(node=>{const r=node.getBoundingClientRect();return {w:r.width,h:r.height}});
    const oldLearn=document.getElementById("ao-learn-root");
    const oldCate=document.getElementById("ao-cate-root");
    const oldDaily=document.getElementById("ao-daily-cate-root");
    return {
      active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      status:globalThis.AO_LEARN_APP_V1?.status?.()??null,
      owner:root?.dataset?.aoLearnOwner??null,
      presentationOwner:root?.dataset?.aoLearnPresentationOwner??null,
      routeOwner:document.documentElement.dataset.aoLearnRouteOwner??null,
      modules:[...root.querySelectorAll("[data-ao-learn-module]")].map(node=>node.dataset.aoLearnModule),
      donorVisible:Boolean(donor&&!donor.hidden&&document.body.classList.contains("aoV37ShellOpen")),
      donorNavCount:root.querySelectorAll("[data-v37-domain],[data-v37-open],.aoV37DomainDock").length,
      sourcesUtilityCount:root.querySelectorAll('[data-ao-learn-module="utility.sources"]').length,
      legacyFeatureVisible:Boolean(
        (oldLearn&&!oldLearn.hidden) ||
        (oldCate&&!oldCate.hidden) ||
        (oldDaily&&!oldDaily.hidden&&oldDaily.getAttribute("aria-hidden")!=="true")
      ),
      geometry:{
        width:rr?.width??0,
        scrollWidth:root?.scrollWidth??0,
        clientWidth:root?.clientWidth??0,
        rootBottom:rr?.bottom??0,
        ribbonTop:rb?.top??Infinity,
        tapTargets,
      },
    };
  });
  assert.equal(learned.active,"learn");
  assert.equal(learned.status?.installed,true);
  assert.equal(learned.owner,"modular-learn-v1");
  assert.equal(learned.presentationOwner,"modular-learn-presentation-v1");
  assert.equal(learned.routeOwner,"modular-learn-v1");
  assert.deepEqual(learned.modules,["learn.catechism.daily","learn.mass","learn.catechism","learn.rites.sick","learn.rites.baptism","learn.rites.first_communion","learn.rites.confirmation","learn.rites.holy_orders","learn.rites.matrimony","learn.serve_mass.responses","learn.scapular","today.gospel"]);
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-module=\'today.saint\']").count(),0,"Saint of the Day remained visible in Learn");
  assert.equal(learned.donorVisible,false,"historical V37 Learn donor remained visible underneath modular Learn");
  assert.equal(learned.donorNavCount,0,"historical V37 navigation leaked into modular Learn");
  assert.equal(learned.sourcesUtilityCount,0,"top-level Sources leaked back into Learn");
  assert.equal(learned.legacyFeatureVisible,false,"a historical Learn child renderer was already visible underneath the modular hub");
  assert.ok(learned.geometry.width>300,"Learn phone surface collapsed");
  assert.ok(learned.geometry.scrollWidth<=learned.geometry.clientWidth+1,"Learn phone surface has horizontal overflow");
  assert.ok(learned.geometry.rootBottom<=learned.geometry.ribbonTop+2,"Learn surface covers the global app ribbon");
  assert.ok(learned.geometry.tapTargets.length>=6,"Learn surface lost expected controls");
  for(const target of learned.geometry.tapTargets)assert.ok(target.w>=44&&target.h>=44,"Learn touch target fell below 44px");
  await assertNoMass("Home -> Learn");
  await assertFocusSafe("Home -> Learn");

  const recoveredTraditional=[
    "learn.rites.sick",
    "learn.rites.baptism",
    "learn.rites.first_communion",
    "learn.rites.confirmation",
    "learn.rites.holy_orders",
    "learn.rites.matrimony",
    "learn.serve_mass.responses",
    "learn.scapular",
  ];
  for(const id of recoveredTraditional){
    await page.locator(`#ao-learn-modular-root [data-ao-learn-module="${id}"]`).tap();
    await page.waitForFunction(expected=>{
      const s=globalThis.AO_TRADITIONAL_LEARN_V381?.status?.();
      const root=document.getElementById("ao-learn-traditional-root");
      return s?.open===true&&s?.route===expected&&Boolean(root);
    },id,{timeout:10000});
    const child=await page.evaluate(()=>{const r=document.getElementById("ao-learn-traditional-root"),b=r?.getBoundingClientRect();return{
      owner:r?.dataset?.aoTraditionalLearnOwner??null,
      overflow:r?(r.scrollWidth-r.clientWidth):Infinity,
      width:b?.width??0,
      donorVisible:Boolean(document.getElementById("aoV38Traditions")?.classList?.contains("open")),
      priestCeremonialExposed:globalThis.AO_TRADITIONAL_LEARN_V381?.status?.().priestCeremonialExposed,
    }});
    assert.equal(child.owner,"38.4-holy-orders-formation",id+": wrong child owner");
    assert.ok(child.width>300,id+": child collapsed on phone");
    assert.ok(child.overflow<=1,id+": child has horizontal overflow");
    assert.equal(child.donorVisible,false,id+": historical Traditions monolith became visible");
    assert.equal(child.priestCeremonialExposed,false,id+": priest-only ceremonial scope leaked");
    await assertFocusSafe(id+" open");
    await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-back]").tap();
    await page.waitForFunction(()=>
      !document.getElementById("ao-learn-traditional-root") &&
      !document.getElementById("ao-learn-modular-root")?.hidden &&
      globalThis.AO_LEARN_APP_V1?.status?.().child==null,
      null,{timeout:10000}
    );
    await assertFocusSafe(id+" return");
  }

  assert.equal(await page.locator('#ao-learn-modular-root [data-ao-learn-module="learn.seasonal_rites"]').count(),0,
    "final v38.4 donor dedupe requires no duplicate Seasonal Catholic Practice launcher");
  const seasonal=await page.evaluate(()=>globalThis.AO_MODULES?.open?.("learn.seasonal_rites",{returnContext:{surface:"learn"}}));
  assert.equal(seasonal?.ok,true,"seasonal compatibility alias failed");
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="calendar" &&
    globalThis.AO_CALENDAR_APP_V1?.status?.().open===true,
    null,{timeout:10000}
  );
  await assertNoMass("Seasonal alias -> Calendar");
  await assertFocusSafe("Seasonal alias -> Calendar");
  await openLearn();

  await page.locator("#ao-learn-modular-root [data-ao-learn-home]").tap();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="home" &&
    !document.getElementById("ao-learn-modular-root") &&
    document.querySelector(".homeScreen")?.dataset?.aoHomeOwner==="modular-home-v2",
    null,{timeout:10000}
  );
  await assertNoMass("Learn -> Home");
  await assertFocusSafe("Learn -> Home");

  await openLearn();
  await page.locator("[data-ao-app-surface='pray']").tap();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray" &&
    globalThis.AO_PRAY_APP_V1?.status?.().installed===true &&
    !document.getElementById("ao-learn-modular-root"),
    null,{timeout:10000}
  );
  await assertNoMass("Learn -> Pray");
  await assertFocusSafe("Learn -> Pray");

  await openLearn();
  await page.locator("[data-ao-app-surface='calendar']").tap();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="calendar" &&
    globalThis.AO_CALENDAR_APP_V1?.status?.().open===true &&
    !document.getElementById("ao-learn-modular-root"),
    null,{timeout:10000}
  );
  await assertNoMass("Learn -> Calendar");
  await assertFocusSafe("Learn -> Calendar");

  await openLearn();
  await page.locator("[data-ao-app-surface='settings']").tap();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings" &&
    !document.getElementById("ao-learn-modular-root"),
    null,{timeout:10000}
  );
  const settings=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    learnMounted:Boolean(document.getElementById("ao-learn-modular-root")),
    donorLearnVisible:Boolean(document.getElementById("ao-v37-root")&&!document.getElementById("ao-v37-root").hidden&&document.body.classList.contains("aoV37ShellOpen")),
  }));
  assert.equal(settings.active,"settings","Learn -> Settings did not complete through AO_APP_SHELL_V1");
  assert.equal(settings.learnMounted,false,"modular Learn remained mounted underneath Settings");
  assert.equal(settings.donorLearnVisible,false,"historical Learn donor resurfaced under Settings");
  await assertNoMass("Learn -> Settings");
  await assertFocusSafe("Learn -> Settings");

  assert.deepEqual(ariaFocusErrors,[],"aria/focus regression: "+JSON.stringify(ariaFocusErrors));
  assert.deepEqual(pageErrors,[],"uncaught errors in modular Learn phone journey: "+JSON.stringify(pageErrors));

  await context.close();
  console.log("PASS modular Learn phone journey: Home -> Learn -> Home and Learn -> Pray/Calendar/Settings");
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
