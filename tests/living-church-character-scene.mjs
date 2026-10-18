import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".webp":"image/webp"};
const spriteRoot=resolve(root,"previews/visible-mass-3d/assets/living-church");
const manifest=JSON.parse(await readFile(resolve(spriteRoot,"manifest.json"),"utf8"));
assert.equal(manifest.schema,"AO_LIVING_CHURCH_SPRITES_LOCKED_V1");
assert.equal(Object.keys(manifest.variants).length,15);
for(const [filename,expected] of Object.entries(manifest.variants)){
 const bytes=await readFile(resolve(spriteRoot,filename));
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(bytes).digest("hex"),expected.sha256,"sprite provenance/hash mismatch: "+filename);
}
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const url="http://127.0.0.1:"+server.address().port+
 "/previews/visible-mass-3d/sanctuary-hotspot-pilot.html?aoLivingChurchReview=1";
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width===390,hasTouch:viewport.width===390,reducedMotion:"reduce"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  await page.route(/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//,route=>
    route.fulfill({status:200,contentType:"image/svg+xml",
      body:'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#302a24"/></svg>'}));
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>
    window.AO_LIVING_CHURCH_P2?.status().version==="AO_LIVING_CHURCH_SCENE_P2" &&
    window.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status().sceneSupported===true,{timeout:30000});
  const original=await page.evaluate(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.scene);
  await page.locator("#lc-stage-open").click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().open),true);
  const expectSprite=async name=>{
   await page.waitForFunction(expected=>{
    const img=document.querySelector("#lc-stage .lc-sprite");
    return img?.complete&&img.naturalWidth===600&&img.currentSrc.includes("/"+expected+".webp");
   },name);
  };
  await expectSprite("sacristan_welcoming");
  const output=resolve(root,"artifacts/living-church-p2");
  await mkdir(output,{recursive:true});
  await page.screenshot({path:resolve(output,"living-church-sacristan-"+viewport.width+".png")});
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Show me the altar"}).click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().node),"altar");
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Ask the Canon"}).click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"canon");
  await expectSprite("canon_explaining");
  await page.screenshot({path:resolve(output,"living-church-canon-"+viewport.width+".png")});
  // Source-owned native link has no standalone provider; do not invent a
  // destination or disturb original viewer context on a failed handoff.
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Mass Explorer"}).click();
  await page.waitForFunction(()=>document.querySelector("#lc-stage .lc-dialogue")?.textContent.includes("canonical Mass Explorer"));
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"canon");
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().open),true);

  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Ask St Pius X"}).click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"pius-x");
  await expectSprite("pius_explaining");
  await page.screenshot({path:resolve(output,"living-church-pius-"+viewport.width+".png")});
  // In the standalone HTML there is deliberately no native Formation owner.
  // An unavailable app must fail closed and keep the question/guide/photo.
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Open Catechism"}).click();
  await page.waitForFunction(()=>window.AO_LIVING_CHURCH_P2?.status().nativeFailure==="DESTINATION_NOT_APPROVED");
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"pius-x");
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().nativeReturnAvailable),false);
  // Same-document injected native-owner contract test. This is NOT a real-shell
  // deployment/browser test and must never be described as such.
  await page.evaluate(()=>{
    const x={installed:true,open:false,child:null};
    window.LC_NATIVE_TEST={calls:[],state:x};
    window.AO_MODULES={open:async()=>({ok:true})};
    window.AO_LEARN_APP_V1={
      status:()=>({...x}),
      open:()=>{x.open=true;return true;},
      openModule:async(id,opts)=>{
        window.LC_NATIVE_TEST.calls.push({id,opts});
        x.child=id;return true;
      },
      close:()=>{x.child=null;x.open=false;return true;}
    };
  });
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Open Catechism"}).click();
  await page.waitForFunction(()=>window.AO_LIVING_CHURCH_P2?.status().nativeReturnAvailable===true);
  const navigation=await page.evaluate(()=>window.LC_NATIVE_TEST.calls);
  assert.equal(navigation.length,1);
  assert.equal(navigation[0].id,"learn.catechism");
  assert.equal(navigation[0].opts.catechismQuestion,322);
  assert.equal(navigation[0].opts.returnContext.sourceRef,"PX1912-Q322");
  assert.equal(await page.locator("#lc-catechism-return").isVisible(),true);
  await page.locator("#lc-catechism-return").click();
  await page.waitForFunction(()=>window.AO_LIVING_CHURCH_P2?.status().open===true);
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().node),"real-presence");
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"pius-x");
  assert.equal(await page.evaluate(()=>window.LC_NATIVE_TEST.state.open),false);
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Return to Sacristan"}).click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().guide),"sacristan");
  await expectSprite("sacristan_explaining");
  const scene=await page.evaluate(()=>window.AO_VISIBLE_MASS_LIVING_CHURCH_P1.status().context.scene);
  assert.deepEqual(scene,original,"guide switches must retain original photograph and camera pose");
  // Integrate the ORIGINAL Ask the Church seven-family objective director.
  await page.locator("#lc-stage [data-objectives]").click();
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Defend the faith"}).click();
  await page.locator("#lc-stage .lc-actions").getByRole("button",
    {name:"A discussion about the Bible or Protestant objections"}).click();
  assert.equal(await page.evaluate(()=>AO_LIVING_CHURCH_P2.status().selectedObjective),"protestant");
  assert.equal(await page.locator("#lc-stage").getByText("learn.apologetics").count(),0);
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Consult St Pius X"}).click();
  assert.equal(await page.evaluate(()=>AO_LIVING_CHURCH_P2.status().guide),"pius-x");
  // Free input also follows PR #1391's canonical objective engine, not only old keywords.
  await page.locator("#lc-stage .lc-ask input").fill("I want to understand the Latin Mass");
  await page.locator("#lc-stage .lc-ask button").click();
  await page.waitForFunction(()=>AO_LIVING_CHURCH_P2.status().selectedObjective==="mass");
  await page.locator("#lc-stage .lc-actions").getByRole("button",{name:"Consult Monsieur le Chanoine"}).click();
  assert.equal(await page.evaluate(()=>AO_LIVING_CHURCH_P2.status().guide),"canon");
  await page.locator("#lc-stage [data-close]").click();
  assert.equal(await page.evaluate(()=>window.AO_LIVING_CHURCH_P2.status().open),false);
  assert.equal(await page.locator("#photo-canvas").count(),1);
  assert.deepEqual(errors,[]);
  console.log("PASS Living Church P2 original photograph and safe character handoff "+viewport.width+"px");
  await context.close();
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
