import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const bundle=await readFile(resolve(root,"research-out/pius-x-ten-review-source.json"),"utf8");
const original=JSON.parse(bundle);
assert.equal(original.schema,"AO_PIUS_X_CONTENT_OWNED_TEN_CONVERSATION_PILOT_V1");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".webp":"image/webp",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const requested=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+requested);
  if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":types[extname(path)]||"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const url="http://127.0.0.1:"+server.address().port+
 "/previews/visible-mass-3d/sanctuary-hotspot-pilot.html?aoLivingChurchReview=1&aoPiusDraftReview=1";
const output=resolve(root,"artifacts/living-church-pius-review");
await mkdir(output,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width===390,
   hasTouch:viewport.width===390,reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(String(error)));
  await page.route("https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/**",
   route=>route.fulfill({status:200,contentType:"application/json",body:bundle}));
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,
   route=>route.fulfill({status:200,contentType:"image/svg+xml",
    body:'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#2c2924"/></svg>'}));
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.AO_LIVING_CHURCH_P2?.status().piusEditorialPilot?.episodes===10,
   null,{timeout:45000});
  const status=await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status());
  assert.equal(status.published,false);
  assert.equal(status.piusEditorialPilot.character,23);
  assert.equal(status.piusEditorialPilot.editorialNotes,7);
  await page.locator("#lc-stage-open").click();
  await page.locator('#lc-stage .lc-guides button[data-guide="pius-x"]').click();
  await page.locator("#lc-stage .lc-actions")
   .getByRole("button",{name:/Review 10 source-bounded pilot conversations/}).click();
  assert.match(await page.locator("#lc-stage .lc-name").innerText(),/NOT ST PIUS X/);
  assert.equal(await page.locator("#lc-stage .lc-sprite").isHidden(),true);
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:/03 · SPX-PILOT-03/}).click();
  assert.match(await page.locator("#lc-stage .lc-name").innerText(),/UNAPPROVED PIUS X/);
  assert.equal(await page.locator("#lc-stage .lc-sprite").isVisible(),true);
  assert.match(await page.locator("#lc-stage .lc-dialogue").innerText(),/unwanted bad thought|bad thought/i);
  await page.screenshot({path:resolve(output,"pius-source-pilot-dialogue-"+viewport.width+".png")});
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Continue"}).click();
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Check an objection"}).click();
  assert.equal(await page.locator("#lc-stage .lc-sprite").isHidden(),true);
  assert.match(await page.locator("#lc-stage .lc-name").innerText(),/EDITORIAL NOTE · NOT ST PIUS X/);
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Français"}).click();
  assert.match(await page.locator("#lc-stage .lc-dialogue").innerText(),/catéchétiques|conscience individuelle/);
  assert.equal(await page.locator("#lc-stage .lc-sprite").isHidden(),true);
  await page.screenshot({path:resolve(output,"pius-source-editorial-note-"+viewport.width+".png")});
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Other subjects"}).click();
  assert.equal(await page.locator("#lc-stage .lc-sprite").isHidden(),true);
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:/04 · SPX-PILOT-04/}).click();
  assert.match(await page.locator("#lc-stage .lc-dialogue").innerText(),/communion/i);
  assert.equal(await page.locator("#lc-stage .lc-sprite").isVisible(),true);
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().published),false);
  assert.equal(await page.locator("#photo-canvas").count(),1);
  assert.deepEqual(errors,[]);
  console.log("PASS Pius X real Living Church editorial scenes, 23 candidate sprites / seven non-character notes, "+viewport.width+"px");
  await context.close();
 }
}finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
