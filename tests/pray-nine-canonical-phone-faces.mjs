import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-canonical-phone-faces");
const routes=JSON.parse(readFileSync(resolve(root,"data/pray/prayer-release-coverage-evidence.v1.json"),"utf8"));
const canonical=routes.routes.filter(x=>x.kind==="SINGLE_CANONICAL");
assert.equal(canonical.length,9,"The nine exact canonical destinations must be reconciled before certification");
assert.equal(routes.counts.fullRouteVariantCertificates,0,
 "This is source-face browser evidence, NOT a blanket all-stage route certificate");
assert.equal(routes.counts.independentOriginalPrintCertificates,0);
const source=PRAY_CANONICAL_DATA_V435930.prayers;
const plain=x=>String(x??"").normalize("NFC").replace(/\s/g,"");
const supported=canonical.map(r=>{
 const p=source[r.id];assert.ok(p,r.id+" missing from original source owner");
 const languages=Object.fromEntries(["en","fr","la"].map(k=>[k,!!p[k]?.trim()]));
 assert.deepEqual(languages,r.attestedCanonicalLanguages,r.id+" source witness inventory drift");
 return {id:r.id,languages};
});
assert.deepEqual(supported.filter(x=>!x.languages.fr||!x.languages.la).map(x=>x.id),
 ["marian_consecration_immaculate_heart"],"Never invent a missing vernacular or Latin edition");

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const buf=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(buf);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",yes)});
const report={schema:"ao.pray.canonical-phone-faces.v1",scope:"EXACT_CANONICAL_UI_FACES_NOT_FULL_ROUTE_OR_PRINT",
 widths:[320,390],interfaceLanguages:["en","fr"],canonicalIds:supported.map(x=>x.id),
 variants:[],errors:[],fullRouteCertificatesClaimed:0,printEditionCertificatesClaimed:0};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of report.widths)for(const ui of report.interfaceLanguages){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",
   locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&
    typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(ui=>document.documentElement.lang===ui,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:25000});

   for(const {id,languages} of supported){
    const original=source[id],vernacularLanguage=languages[ui]?ui:"en";
    const expectedV=plain(original[vernacularLanguage]);
    assert.ok(expectedV.length>0,id+" source cannot be empty");
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null})),true);
    await page.locator('#aoPray435930.open [data-p435930-lib-open="'+id+'"]').click({timeout:15000});
    const reader=page.locator("#aoPray435930.open .aoP435930LibraryReader");
    await reader.locator(".aoP435930Prayer").waitFor({timeout:15000});
    const flip=reader.locator(".aoP435930Prayer [data-p435930-flip]");
    const before=await reader.evaluate(el=>{
     const card=el.querySelector(".aoP435930Prayer");
     const b=card?.querySelector("[data-p435930-flip]");
     const vern=b?.querySelector("[data-face-v]"),lat=b?.querySelector("[data-face-la]");
     const single=card?.querySelector(".aoP435930Text");
     return {view:el.closest(".aoP435930Mount")?.dataset.aoPrayView,
      id:el.querySelector("[data-ao-devo-card]")?.dataset.aoDevoCard,
      hasFlip:!!b,vern:vern?.textContent||null,vernLang:vern?.lang||null,
      vernHidden:vern?.hidden??null,latin:lat?.textContent||null,
      latinLang:lat?.lang||null,latinHidden:lat?.hidden??null,
      singleText:single?.textContent||null,singleLang:single?.lang||null,
      docOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      readerOverflow:Math.max(0,el.scrollWidth-el.clientWidth)};
    });
    assert.equal(before.view,"library",id+" left source-owned Library");
    assert.equal(before.id,id,"Wrong original canonical card");
    assert.ok(before.docOverflow<=2&&before.readerOverflow<=2,
     id+"/"+width+"/"+ui+" mobile overflow: "+JSON.stringify(before));
    const bilingual=languages.la;
    assert.equal(before.hasFlip,bilingual,id+" Latin switch availability contradicts source");
    if(bilingual){
     assert.equal(before.vernLang,vernacularLanguage,id+" fake vernacular language attribute");
     assert.equal(before.latinLang,"la",id+" fake Latin language attribute");
     assert.equal(before.vernHidden,false,id+" first view should be vernacular");
     assert.equal(before.latinHidden,true,id+" Latin should start behind switch");
     assert.equal(plain(before.vern),expectedV,id+" original "+vernacularLanguage+" prayer text altered");
     assert.equal(plain(before.latin),plain(original.la),id+" original Latin prayer text altered");
     await flip.click();
     const turned=await reader.locator(".aoP435930Prayer").evaluate(el=>{
      const b=el.querySelector("[data-p435930-flip]");
      return {vernHidden:b.querySelector("[data-face-v]").hidden,
       latinHidden:b.querySelector("[data-face-la]").hidden,
       text:b.querySelector("[data-face-la]").textContent};
     });
     assert.equal(turned.vernHidden,true,id+" did not replace vernacular with Latin");
     assert.equal(turned.latinHidden,false,id+" did not display Latin");
     assert.equal(plain(turned.text),plain(original.la),id+" Latin flip changed original words");
     await flip.click();
     assert.equal(await flip.locator("[data-face-v]").evaluate(el=>el.hidden),false,
      id+" did not return to original vernacular prayer");
    }else{
     assert.equal(before.vern,null,id+" invented a second language face");
     assert.equal(before.latin,null,id+" invented Latin source text");
     assert.equal(before.singleLang,vernacularLanguage,id+" English-only hold incorrectly labelled "+ui);
     assert.equal(plain(before.singleText),expectedV,id+" lost the held original English text");
     assert.equal(languages.fr,false,id+" unexpected missing French in canonical route");
    }
    await reader.locator("[data-p435930-lib-back]").click();
    assert.equal(await reader.count(),0,id+" did not leave the original canonical card");
    report.variants.push({id,width,ui,sourceLanguage:vernacularLanguage,
     originalLatin:languages.la,sourceMatched:true,flipRoundTrip:languages.la,
     englishOnlyHold:!languages.fr,documentOverflow:before.docOverflow});
    console.log("CANONICAL_FACE "+width+"px "+ui+" "+id+" "+vernacularLanguage+
     (languages.la?" + Latin flip":" source-held English only"));
   }
   assert.deepEqual(errors,[],width+"/"+ui+" unhandled browser errors");
   console.log("PASS "+width+"px "+ui+" nine canonical source-owned prayer faces");
  }catch(e){
   report.errors.push({width,ui,error:String(e?.stack||e)});
   throw e;
  }finally{await ctx.close()}
 }
 assert.equal(report.variants.length,36,"Nine routes × two widths × two languages required");
 assert.equal(report.variants.filter(x=>x.originalLatin).length,32,"Eight trilingual routes × four variants");
 assert.equal(report.variants.filter(x=>x.englishOnlyHold).length,4,"One source-held English-only route × four variants");
 console.log("PASS 36/36 canonical Prayer phone source-face variants; 32 Latin flip round trips; 4 exact English-only source holds; 0 all-stage or print certificates");
}finally{
 await mkdir(output,{recursive:true});
 await writeFile(resolve(output,"source-face-variants.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
