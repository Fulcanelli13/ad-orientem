/** M4 genuine original-photo offline file:// browser gate.
 * Unlike the hosted pilot, no local HTTP server and no Wikimedia network
 * requests are allowed. This is review-only, not app publication approval.
 */
import assert from "node:assert/strict";
import {access,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const file=resolve(root,"dist/visible-mass/The_Visible_Mass_M4_Photographic_Review_Offline.html");
await access(file);
const out=resolve(root,"dist/visible-mass/m4-offline-file-qa");
await mkdir(out,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const spec of [{name:"desktop",width:1280,height:820,mobile:false},{name:"phone",width:390,height:844,mobile:true}]){
  const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},
   deviceScaleFactor:spec.mobile?2:1,isMobile:spec.mobile,hasTouch:spec.mobile});
  const page=await context.newPage(),errors=[],outgoing=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.route(/^https?:\/\//,route=>{outgoing.push(route.request().url());return route.abort("internetdisconnected");});
  await page.goto(pathToFileURL(file).href,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT?.status().questionsLoaded===134,null,{timeout:30000});
  const summary=await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status());
  assert.equal(summary.questionsLoaded,134);
  assert.equal(summary.photoMode,"still");
  assert.ok(summary.glossaryLoaded>=100,"canonical G### owner should be included");
  assert.equal(await page.locator("#hotspots .marker").count(),6);
  assert.ok(await page.locator("#altar-photo").evaluate(image=>image.complete&&image.naturalWidth>=1000),
   "Original high altar still must decode with disconnected internet");
  assert.equal(await page.locator("#original-object-choices").isVisible(),true);
  await page.locator('[data-photo-mode="brompton"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama?.loaded===true,null,{timeout:30000});
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).panorama.active,"BROMPTON_PANO");
  assert.equal(await page.locator("#original-object-choices").isVisible(),false);
  await page.screenshot({path:out+"/"+spec.name+"-brompton-actual-offline.png",fullPage:true});
  for(const [id,label] of [
   ["BROMPTON_ALTAR_1","High altar"],["BROMPTON_ALTAR_2","High altar"],
   ["BROMPTON_LADY_ALTAR","Lady altar"],["BROMPTON_SACRED_HEART","Sacred Heart"]]){
   await page.locator('[data-m5-viewpoint="'+id+'"]').click();
   await page.waitForFunction(id=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().m5Viewpoint===id&&
    document.querySelector("#m5-close-photo").naturalWidth>1000,id,{timeout:25000});
   if(id==="BROMPTON_ALTAR_1"){
    const imageState=await page.locator("#m5-close-photo").evaluate(el=>{
     const s=getComputedStyle(el),b=el.getBoundingClientRect(),v=el.parentElement.getBoundingClientRect();
     const canvas=document.createElement("canvas");canvas.width=20;canvas.height=20;
     const ctx=canvas.getContext("2d");ctx.drawImage(el,0,0,20,20);
     return {naturalWidth:el.naturalWidth,complete:el.complete,bounds:[b.width,b.height,b.x,b.y],
      viewport:[v.width,v.height,v.x,v.y],style:{display:s.display,visibility:s.visibility,opacity:s.opacity,position:s.position,objectFit:s.objectFit},
      pixel:[...ctx.getImageData(10,10,1,1).data],scrollY:el.parentElement.scrollTop};
    });
    console.log("M5 OFFLINE CLOSE PHOTO RENDER DIAGNOSTICS",spec.name,JSON.stringify(imageState));
    assert.ok(imageState.bounds[0]>200&&imageState.bounds[1]>180,"original image must occupy visible stage");
    await page.locator("#m5-close-photo").screenshot({path:out+"/"+spec.name+"-m5-close-photo-element.png"});
   }
   assert.match(await page.locator("#photo-credit").innerText(),/AndyScott.*CC BY-SA 4.0/);
   assert.match(await page.locator("#photo-caption").innerText(),/Brompton Oratory/);
   assert.equal(await page.locator("#hotspots").isVisible(),false);
   await page.screenshot({path:out+"/"+spec.name+"-m5-"+id.toLowerCase()+"-actual-offline.png",fullPage:true});
  }
  await page.locator('[data-m5-viewpoint="panorama"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().view==="panorama");

  await page.locator('[data-photo-mode="newman"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama?.active==="NEWMAN_360"&&window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().panorama.loaded,null,{timeout:30000});
  assert.match(await page.locator("#photo-intro").innerText(),/Newman University Church/);
  await page.screenshot({path:out+"/"+spec.name+"-newman-actual-offline.png",fullPage:true});
  // M5: same integrated visitor opens four individually sourced real close
  // photographs, never transplanted marker positions or fabricated walking.
  for(const [id,label] of [
   ["NEWMAN_ALTAR_1","Main altar"],["NEWMAN_ALTAR_2","Main altar"],["NEWMAN_ALTAR_3","Main altar"],
   ["NEWMAN_APSE","Apse"],["NEWMAN_PULPIT","Pulpit"]]){
   await page.locator('[data-m5-viewpoint="'+id+'"]').click();
   await page.waitForFunction(id=>
    window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().view==="m5-close"&&
    window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().m5Viewpoint===id&&
    document.querySelector("#m5-close-photo").naturalWidth>1000,
    id,{timeout:25000});
   assert.match(await page.locator("#photo-credit").innerText(),/Zairon.*CC BY 4.0/);
   assert.match(await page.locator("#photo-caption").innerText(),/Newman University Church/);
   assert.equal(await page.locator("#hotspots").isVisible(),false);
   assert.equal(await page.locator("#original-object-choices").isVisible(),false);
   await page.screenshot({path:out+"/"+spec.name+"-m5-"+id.toLowerCase()+"-actual-offline.png",fullPage:true});
  }
  await page.locator('[data-m5-viewpoint="NEWMAN_ALTAR_1"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().m5Viewpoint==="NEWMAN_ALTAR_1");
  await page.locator('[data-m5-zoom="in"]').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).m5Pose.zoom,1.25);
  await page.locator('[data-m5-viewpoint="NEWMAN_APSE"]').click();
  await page.locator('[data-m5-viewpoint="NEWMAN_ALTAR_1"]').click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).m5Pose.zoom,1.25,"each original photo retains its own zoom");
  await page.locator('[data-m5-viewpoint="panorama"]').click();
  await page.waitForFunction(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status().view==="panorama");
  assert.equal(await page.locator("#m5-close-stage").isVisible(),false);
  await page.locator('[data-photo-mode="still"]').click();
  assert.equal(await page.locator("#original-object-choices").isVisible(),true);
  await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.select("AL01"));
  assert.ok(await page.locator("#close-card").isVisible(),"exact original object accessible offline");
  assert.ok((await page.locator("#object-card").innerText()).includes("High altar"));
  await page.locator("#close-card").click();
  assert.equal((await page.evaluate(()=>window.AO_VISIBLE_MASS_HOTSPOT_PILOT.status())).photoMode,"still");
  assert.deepEqual(errors,[],"Offline single HTML must have no unhandled browser JS exceptions");
  assert.deepEqual(outgoing,[],"Default offline original-photo visitor must not contact remote services");
  console.log("PASS M4 genuine photographic single HTML opened from file://",spec.name,
   JSON.stringify({questions:summary.questionsLoaded,glossary:summary.glossaryLoaded,offlinePhotographs:12}));
  await context.close();
 }
}finally{await browser?.close();}
