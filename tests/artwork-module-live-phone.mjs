// Real mobile evidence: released Met photographs must decode and occupy intended
// Prayer surfaces without changing source-owned readers or causing overflow.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/approved-met-prayer-reuse");
await mkdir(output,{recursive:true});
const types={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".css":"text/css",".json":"application/json",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Denied");}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":types[extname(path)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
const cases=[];let browser;
try{
 browser=await chromium.launch({headless:true});
 const origin="http://127.0.0.1:"+server.address().port;
 for(const width of [320,390]){
  for(const locale of ["en-GB","fr-FR"]){
   const context=await browser.newContext({
    viewport:{width,height:width===320?640:844},isMobile:true,hasTouch:true,
    serviceWorkers:"block",locale,reducedMotion:"reduce",colorScheme:"dark"
   });
   const page=await context.newPage(),errors=[];
   page.on("pageerror",err=>errors.push(String(err.message)));
   try{
    await page.goto(origin+"/index.html?aoPrayerPilot=1",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
    await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
    const base="#aoPray435930.open";
    // Test the actual in-app Prayer language rather than relying on the
    // browser locale alone. Keep the global UI language and Mass untouched.
    if(locale==="fr-FR"){
     await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null}));
     const toggle=page.locator(base+" [data-p435930-session-language]");
     assert.equal(await toggle.count(),1,"French QA needs the real Prayer language switch");
     if((await toggle.textContent()).trim()==="EN")await toggle.click();
     assert.equal((await page.locator(base+" [data-p435930-session-language]").textContent()).trim(),"FR");
    }
    const imageState=async selector=>{
     const locator=page.locator(base+" "+selector);
     assert.equal(await locator.count(),1,"Exactly one released image expected: "+selector);
     return locator.evaluate(async img=>{
      img.loading="eager";
      await img.decode().catch(()=>{});
      const rect=img.getBoundingClientRect();
      return {src:img.getAttribute("src"),naturalWidth:img.naturalWidth,
       naturalHeight:img.naturalHeight,width:rect.width,height:rect.height,left:rect.left,right:rect.right,viewport:innerWidth,
       fit:getComputedStyle(img).objectFit};
     });
    };
    const imageOK=(image,filename)=>{
     assert.ok(image.src.endsWith(filename),JSON.stringify(image));
     assert.ok(image.naturalWidth>500&&image.naturalHeight>500,"Released photo did not decode: "+JSON.stringify(image));
     assert.ok(image.width>50&&image.height>40,"Released photo is not rendered: "+JSON.stringify(image));
     assert.equal(image.fit,"contain","Approved painting must not crop unexpectedly");
     assert.ok(image.left>=-1&&image.right<=image.viewport+1,
      "Painting itself must be fully inside the phone viewport: "+JSON.stringify(image));
    };
    const overflow=async({allowVerticalScrollbar=false}={})=>{
     const x=await page.evaluate(()=>({
      document:document.documentElement.scrollWidth-innerWidth,
      mount:(()=>{const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
        return m?m.scrollWidth-m.clientWidth:999})()
     }));
     // Chromium's narrow Confession reader has a 13px classic vertical
     // scrollbar: clientWidth excludes it, scrollWidth need not. The image
     // bounds above and document scrollWidth detect true horizontal overflow.
     assert.ok(x.document<=1&&x.mount<=(allowVerticalScrollbar?16:1),
      "Phone overflow: "+JSON.stringify(x));
    };
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
    const hub=await imageState('[data-ao-art-slot-id="DOOR-D5"] .aoPrayPilotReleasedTilePhoto');
    imageOK(hub,"adoration-frameless.webp");
    assert.equal(await page.locator(base+' [data-ao-art-binding="released"]').count(),1);
    await overflow();
    await page.screenshot({path:resolve(output,"hub-"+width+"-"+locale+".png"),animations:"disabled"});
    await page.locator(base+' [data-p435930-family="eucharistic"]').click();
    const shelf=await imageState(".aoPrayerEucharisticCover img");
    imageOK(shelf,"adoration-frameless.webp");
    await overflow();
    await page.screenshot({path:resolve(output,"eucharistic-"+width+"-"+locale+".png"),animations:"disabled"});
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null}));
    const chooser=await imageState(".aoPrayerAdorationCover img");
    imageOK(chooser,"adoration-frameless.webp");
    assert.ok(await page.locator(base+" .aoAdorationPrimaryGrid button").count()>=2,
      "Adoration options must remain intact");
    await overflow();
    await page.screenshot({path:resolve(output,"adoration-"+width+"-"+locale+".png"),animations:"disabled"});
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null}));
    const confession=await imageState(".aoPrayerConfessionCover img");
    imageOK(confession,"confession-murillo-nga-original.jpg");
    assert.equal(await page.locator(base+' .aoP435930ConfPathCards').count(),1,
      "Confession's existing preparation and privacy flow must remain intact");
    assert.equal(await page.locator(base+' .aoP435930ConfNavShell').count(),1,
      "The four-stage Confession navigation must remain intact");
    await overflow({allowVerticalScrollbar:true});
    await page.screenshot({path:resolve(output,"confession-"+width+"-"+locale+".png"),animations:"disabled"});
    // Force Angelus only in this browser's QA state; real production continues
    // to choose Angelus/Regina Caeli from the canonical liturgical season.
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.applySettingsPreferences({angelus:{seasonalForm:"angelus"}}));
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null}));
    const directAngelus=await imageState(".aoPrayerAngelusDirectPhoto img");
    imageOK(directAngelus,"angelus-frameless.webp");
    assert.equal(await page.locator(base+' [data-p435930-angelus-begin]').count(),1,
      "Direct canonical Angelus entry must keep Begin at the bell");
    await overflow();
    await page.screenshot({path:resolve(output,"angelus-direct-"+width+"-"+locale+".png"),animations:"disabled"});
    // Discovery route uses the distinct approved full-height pilot entrance.
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
    await page.locator(base+' [data-p435930-family="daily"]').click();
    await page.locator(base+' [data-p435930-own="pray.angelus_regina"]').click();
    const angel=await imageState(".aoPrayerAngelusPhoto img");
    imageOK(angel,"angelus-frameless.webp");
    assert.equal(await page.locator(base+' [data-p435930-pilot-angelus-begin]').count(),1,
      "Discovery Angelus retains its own Begin transition");
    await overflow();
    await page.screenshot({path:resolve(output,"angelus-discovery-"+width+"-"+locale+".png"),animations:"disabled"});
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.st_joseph_seven_sorrows",{returnContext:null}));
    const joseph=await imageState(".aoPrayerJosephCover img");
    imageOK(joseph,"joseph-whole-original.jpg");
    assert.equal(await page.locator(base+' [data-ao-st-joseph-seven-reader]').count(),1,
      "Saint Joseph original prayer journey remains unchanged");
    await overflow({allowVerticalScrollbar:true});
    await page.screenshot({path:resolve(output,"joseph-"+width+"-"+locale+".png"),animations:"disabled"});

    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.de_profundis",{returnContext:null}));
    const souls=await imageState(".aoPrayerSoulsCover img");
    imageOK(souls,"souls-whole-original.jpg");
    assert.equal(await page.locator(base+' [data-ao-devo-card="dead_de_profundis"]').count(),1,
      "The original De profundis prayer remains available");
    await overflow({allowVerticalScrollbar:true});
    await page.screenshot({path:resolve(output,"souls-"+width+"-"+locale+".png"),animations:"disabled"});

    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.visit_blessed_sacrament",{returnContext:null}));
    const visit=await imageState(".aoPrayerVisitCover img");
    imageOK(visit,"visit-whole-original.jpg");
    assert.equal(await page.locator(base+' [data-ao-adoration-mode="visit"]').count(),1);
    await overflow({allowVerticalScrollbar:true});
    await page.screenshot({path:resolve(output,"visit-"+width+"-"+locale+".png"),animations:"disabled"});

    await page.evaluate(()=>globalThis.AO_PRAY_V435930.applySettingsPreferences({angelus:{seasonalForm:"regina_caeli"}}));
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null}));
    const regina=await imageState(".aoPrayerAngelusDirectPhoto img");
    imageOK(regina,"regina-whole-original.jpg");
    assert.equal(await page.locator(base+' [data-p435930-angelus-begin]').count(),1,
      "Regina retains canonical Horarium opening");
    await overflow({allowVerticalScrollbar:true});
    await page.screenshot({path:resolve(output,"regina-"+width+"-"+locale+".png"),animations:"disabled"});
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("programme.first_friday",{returnContext:null}));
    const sacredHeart=await imageState(".aoPrayerHeartJesusCover img");
    imageOK(sacredHeart,"heart-jesus-full-original.jpg");
    assert.equal(await page.locator(base+' .aoP435930Date').count(),1,
     "Existing First Friday calendar and reparatory stages must remain intact");
    await overflow({allowVerticalScrollbar:true});
    await page.screenshot({path:resolve(output,"sacred-heart-"+width+"-"+locale+".png"),animations:"disabled"});

    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("programme.first_saturday",{returnContext:null}));
    const immaculateHeart=await imageState(".aoPrayerHeartMaryCover img");
    imageOK(immaculateHeart,"heart-mary-full-original.jpg");
    assert.equal(await page.locator(base+' .aoP435930Date').count(),1,
     "Existing First Saturday Rosary and meditation structure must remain intact");
    await overflow({allowVerticalScrollbar:true});
    await page.screenshot({path:resolve(output,"immaculate-heart-"+width+"-"+locale+".png"),animations:"disabled"});

    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.benediction",{returnContext:null}));
    assert.equal(await page.locator(base+' .aoPrayerKingCover img').count(),0,
     "Never impose Christ the King artwork on ordinary Benediction");
    await page.locator(base+' [data-p435930-ben-feast]').evaluate(el=>{
     el.checked=true;el.dispatchEvent(new Event("change",{bubbles:true}));
    });
    assert.equal(await page.locator(base+' [data-ao-benediction-celebration="christKing"]').count(),1,
     "The existing optional Christ the King mode must remain in control");
    const christKing=await imageState(".aoPrayerKingCover img");
    imageOK(christKing,"king-full-original.jpg");
    assert.equal(await page.locator(base+' [data-ao-rite-owner="benediction"]').count(),1);
    await overflow({allowVerticalScrollbar:true});
    await page.screenshot({path:resolve(output,"christ-king-"+width+"-"+locale+".png"),animations:"disabled"});
    assert.deepEqual(errors,[],"Uncaught JS errors: "+errors.join("; "));
    cases.push({width,locale,status:"PASS",hub,shelf,chooser,confession,directAngelus,angel,joseph,souls,visit,regina,sacredHeart,immaculateHeart,christKing});
   }finally{await context.close();}
  }
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
await writeFile(resolve(output,"report.json"),JSON.stringify({cases,validated:cases.length},null,2)+"\n");
assert.equal(cases.length,4);
console.log("PASS: ten released exact source photographs and scoped first-month/Christ King images on 320/390 EN/FR");
