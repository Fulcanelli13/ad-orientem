import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const loc=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(loc!==root&&!loc.startsWith(root+sep)){res.writeHead(403).end();return}
  const data=await readFile(loc);res.writeHead(200,{"content-type":mime[extname(loc)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500).end(String(e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4276,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const prepare=async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"fr-FR",reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.goto("http://127.0.0.1:4276/index.html",{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
  assert.equal(await page.evaluate(async()=>window.AO_PRAY_APP_V1.open()),true);
  await page.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  return {page,context,errors};
 };
 const output=resolve(root,"reviews/captures/devotional-methods");
 await mkdir(output,{recursive:true});
 {
  const {page,context,errors}=await prepare();
  assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null})),true);
  await page.waitForSelector("#aoPray435930.open .aoMercyReader",{timeout:12000});
  assert.equal(await page.locator(".aoMercyReader [data-p435930-mercy-mode]").count(),2);
  assert.equal(await page.locator(".aoMercyReader [data-p435930-mercy-move='prev']").isDisabled(),true);
  assert.equal(await page.locator(".aoMercyReader [data-ao-mercy-kind='large']").count(),0);
  for(let i=0;i<4;i++){
    await page.locator(".aoMercyReader [data-p435930-mercy-move='next']").evaluate(n=>n.click());
  }
  assert.equal(await page.locator(".aoMercyReader [data-ao-mercy-kind='large']").count(),1);
  await page.locator(".aoMercyReader").screenshot({path:resolve(output,"mercy-large-390.png"),animations:"disabled"});
  await page.locator(".aoMercyReader [data-p435930-mercy-mode='simple']").evaluate(n=>n.click());
  assert.equal(await page.locator(".aoMercyReader .aoMercyGuide").count(),0);
  await page.locator(".aoMercyReader [data-p435930-mercy-mode='guided']").evaluate(n=>n.click());
  assert.equal(await page.locator(".aoMercyReader .aoMercyGuide").count(),1);
  for(let i=4;i<61;i++){
   await page.locator(".aoMercyReader [data-p435930-mercy-move='next']").evaluate(n=>n.click());
  }
  assert.equal(await page.locator(".aoMercyReader").getAttribute("data-ao-mercy-step"),"61");
  assert.equal(await page.locator(".aoMercyReader [data-p435930-mercy-restart]").count(),1);
  await page.locator(".aoMercyReader").screenshot({path:resolve(output,"mercy-end-390.png"),animations:"disabled"});
  await page.locator(".aoMercyReader [data-p435930-mercy-restart]").evaluate(n=>n.click());
  assert.equal(await page.locator(".aoMercyReader").getAttribute("data-ao-mercy-step"),"0");
  assert.ok(!errors.length,"Divine Mercy runtime errors "+errors.join(" | "));
  await context.close();
 }
 {
  const {page,context,errors}=await prepare();
  assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.rosary",{returnContext:null})),true);
  await page.waitForSelector("#aoPrayerBookRoot.open .aoRosaryMethods",{timeout:13000});
  await page.locator("#aoPrayerBookRoot.open [data-ao-rosary-method-option='dominican']").evaluate(n=>n.click());
  assert.equal(await page.locator("#aoPrayerBookRoot.open .aoRosaryDominicanOpening p").count()>5,true);
  await page.locator("#aoPrayerBookRoot.open [data-pb-rosary-set='joyful']").first().evaluate(n=>n.click());
  await page.waitForFunction(()=>window.AO_ROSARY_V381?.state?.()?.set==="joyful");
  const state=await page.evaluate(()=>{
    const api=window.AO_ROSARY_V381,steps=api.steps();
    return {step:api.state().step,first:steps.findIndex(x=>x.kind==="mystery"&&x.mi===0)};
  });
  assert.equal(state.step,state.first,"Dominican opening must not accidentally replay the common Creed and opening beads");
  assert.ok(!errors.length,"Dominican UI errors "+errors.join(" | "));
  await context.close();
 }
 {
  const {page,context,errors}=await prepare();
  assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.rosary",{returnContext:null})),true);
  await page.waitForSelector("#aoPrayerBookRoot.open .aoRosaryMethods",{timeout:13000});
  await page.locator("#aoPrayerBookRoot.open [data-ao-rosary-method-option='montfort']").evaluate(n=>n.click());
  await page.locator("#aoPrayerBookRoot.open [data-ao-rosary-length-option='15']").evaluate(n=>n.click());
  await page.locator("#aoPrayerBookRoot.open [data-pb-rosary-set='sorrowful']").first().evaluate(n=>n.click());
  await page.waitForFunction(()=>window.AO_ROSARY_V381?.state?.()?.set==="joyful");
  let before=await page.evaluate(()=>{const a=window.AO_ROSARY_V381,steps=a.steps();return {set:a.state().set,boundary:steps.map((x,i)=>[x,i]).filter(([x])=>x.phase==="decade"&&x.mi===4).pop()[1]}});
  assert.equal(before.set,"joyful","Full Rosary must always start with Joyful");
  await page.evaluate(i=>window.AO_ROSARY_V381.setStep(i),before.boundary);
  await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").first().evaluate(n=>n.click());
  await page.waitForFunction(()=>window.AO_ROSARY_V381?.state?.()?.set==="sorrowful",{timeout:9000});
  await page.waitForSelector("#aoPrayerBookRoot.open .aoRosaryMethodStage",{timeout:9000});
  before=await page.evaluate(()=>{const a=window.AO_ROSARY_V381,steps=a.steps();return {set:a.state().set,boundary:steps.map((x,i)=>[x,i]).filter(([x])=>x.phase==="decade"&&x.mi===4).pop()[1]}});
  assert.equal(before.set,"sorrowful");
  await page.evaluate(i=>window.AO_ROSARY_V381.setStep(i),before.boundary);
  await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").first().evaluate(n=>n.click());
  await page.waitForFunction(()=>window.AO_ROSARY_V381?.state?.()?.set==="glorious",{timeout:9000});
  assert.equal(await page.locator("#aoPrayerBookRoot.open .aoRosaryMethodStage").count(),1);
  await page.locator("#aoPrayerBookRoot.open .aoRosaryMethodStage").screenshot({path:resolve(output,"montfort-full-glorious-390.png"),animations:"disabled"});
  assert.ok(!errors.length,"Full Rosary UI errors "+errors.join(" | "));
  await context.close();
 }
 console.log("PASS Divine Mercy full 62-step navigation and native Rosary Dominican + Montfortian 15-decade mobile");
}finally{
 await browser?.close();await new Promise(done=>server.close(done));
}
