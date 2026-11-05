import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {ESSENTIAL_HOLY_CARD_IDS_V1,essentialHolyCardParts} from "../src/pray/essential-holy-card-parts.js";
import {CHOIR_SOURCE_IDS,choirKind,choirSourceBeats} from "../src/pray/choir-source-beats.js";
import {claudeChoirSourceUnits,claudeChoirFootFor} from "../src/pray/claude-choir-fixed-foot.js";

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
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoEssentialFlow=1",
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
    // These are THREE distinct approved reader families: Holy Cards (F01),
    // Choir F02 texts, and Choir F03 litanies. No generic switch is imposed.
    const holy=ESSENTIAL_HOLY_CARD_IDS_V1.includes(id);
    const choir=CHOIR_SOURCE_IDS.includes(id);
    const litany=choir&&choirKind(id)==="litany";
    assert.equal(holy||choir,true,id+" has an unreconciled canonical reader owner");
    const owner=holy?"holy-card":litany?"choir-litany":"choir-text";
    const geometry=await reader.evaluate(el=>({
     document:Math.max(0,document.documentElement.scrollWidth-innerWidth),
     reader:Math.max(0,el.scrollWidth-el.clientWidth),
     view:el.closest(".aoP435930Mount")?.dataset.aoPrayView
    }));
    assert.equal(geometry.view,"library",id+" left the canonical source owner");
    assert.ok(geometry.document<=2&&geometry.reader<=2,
     id+"/"+width+"/"+ui+" mobile clipping "+JSON.stringify(geometry));

    const checkHoly=async language=>{
     // R2 uses the source-owned continuous Latin/vernacular reader; its
     // legacy reversible Holy Card remains separately covered by F01 tests.
     const sheet=reader.locator('.aoEssentialFlow[data-ao-essential-card="'+id+'"]');
     await sheet.waitFor({state:"attached",timeout:9000});
     await page.locator("#aoPray435930.open [data-p435930-essential-aa]").click();
     await page.locator('#aoPray435930.open [data-p435930-essential-language="'+language+'"]').click();
     await sheet.waitFor({state:"attached",timeout:9000});
     const target=language==="la"?"la":"vern";
     const face=sheet.locator('[data-ao-essential-flow-face="'+target+'"]');
     assert.equal(await face.evaluate(el=>el.hidden),false,id+" selected text is hidden: "+language);
     assert.equal(await face.getAttribute("lang"),language,
      id+" did not identify its attested source language");
     const actual=await face.locator(".aoEssentialFlowBeat").evaluateAll(nodes=>nodes.map(n=>n.textContent.trim()));
     const expected=essentialHolyCardParts(id,language,original[language])?.map(x=>x.text.trim())||[];
     assert.ok(expected.length>0,id+" source segments unavailable "+language);
     assert.deepEqual(actual.map(plain),expected.map(plain),
      id+" changed the canonical prayer text in "+language);
     return actual.length;
    };
    const checkChoirText=async language=>{
     const face=language==="la"?"[data-face-la]":"[data-face-v]";
     const holder=reader.locator('.aoChoirPrayer[data-ao-choir-prayer="'+id+'"] '+face);
     await holder.waitFor({state:"attached",timeout:9000});
     assert.equal(await holder.evaluate(el=>el.hidden),false,id+" selected choir face hidden");
     assert.equal(await holder.locator(".aoChoirFace").getAttribute("lang"),language,
      id+" choir text mislabels original language");
     const actual=await holder.locator(".aoChoirBeat").evaluateAll(nodes=>nodes.map(n=>n.textContent.trim()));
     const expected=(choirSourceBeats(id,language,original[language])||[])
      .filter(b=>b.kind!=="space").map(b=>b.raw.trim());
     assert.ok(expected.length>0,id+" original Choir beat model is empty");
     assert.deepEqual(actual.map(plain),expected.map(plain),
      id+" original Choir beat text changed in "+language);
     return actual.length;
    };
    const checkLitany=async language=>{
     const aa=page.locator("#aoPray435930.open [data-p435930-choir-aa]");
     await aa.click();
     await page.locator('#aoPray435930.open [data-p435930-choir-language="'+language+'"]').click();
     const face=reader.locator('.aoClaudeChoirPrayer .aoChoirFace[lang="'+language+'"]');
     await face.waitFor({state:"attached",timeout:9000});
     const observed=await face.locator(".aoClaudeChoirBeat").evaluateAll(nodes=>nodes.map(n=>({
      invocation:n.childNodes[0]?.textContent||n.textContent,
      response:n.dataset.aoChoirAnswer||"",
      sourceIndex:n.dataset.aoChoirSourceIndex
     })));
     const expected=(claudeChoirSourceUnits(original[language])||[])
      .map((u,i)=>({...u,i})).filter(u=>u.kind!=="gap");
     assert.ok(expected.length>0,id+" source litany units absent");
     assert.equal(observed.length,expected.length,id+" dropped an original litany invocation");
     for(let i=0;i<expected.length;i++){
      assert.equal(plain(observed[i].invocation),plain(expected[i].invocation),
       id+" invocation "+i+" altered in "+language);
      assert.equal(plain(observed[i].response),plain(claudeChoirFootFor(expected[i])),
       id+" response "+i+" altered in "+language);
      assert.equal(observed[i].sourceIndex,String(expected[i].i),
       id+" original source row order changed");
     }
     return observed.length;
    };

    let vernUnits=0,latinUnits=0;
    if(holy){
     vernUnits=await checkHoly(vernacularLanguage);
     if(languages.la){
      latinUnits=await checkHoly("la");
      assert.equal(await page.locator("#aoPray435930.open [data-p435930-essential-language='fr']").count()>0,
       languages.fr,id+" wrongly exposes or hides the original French source");
      await checkHoly(vernacularLanguage);
      const sheet=reader.locator('.aoEssentialFlow[data-ao-essential-card="'+id+'"]');
      const switcher=sheet.locator('[data-p435930-essential-flow-toggle]');
      assert.equal(await switcher.count(),1,"Latin-backed prayer must offer tap-to-vernacular");
      await switcher.click();
      assert.equal(await sheet.getAttribute("data-ao-essential-current"),"la",
       "Tapping vernacular prayer must return to Latin");
      await switcher.click();
      assert.equal(await sheet.getAttribute("data-ao-essential-current"),"vern",
       "Tapping Latin prayer must return to the verified vernacular");
     }else{
      await page.locator("#aoPray435930.open [data-p435930-essential-aa]").click();
      for(const unavailable of ["fr","la","both"])
       assert.equal(await page.locator('#aoPray435930.open [data-p435930-essential-language="'+unavailable+'"]').count(),0,
        id+" manufactured "+unavailable+" for an English-only prayer");
      assert.equal(await reader.locator("[data-p435930-essential-flow-toggle]").count(),0,
       "Never offer a Latin toggle for an English-only original");
     }
    }else if(litany){
     vernUnits=await checkLitany(vernacularLanguage);
     latinUnits=await checkLitany("la");
     await checkLitany(vernacularLanguage);
    }else{
     vernUnits=await checkChoirText(vernacularLanguage);
     const flip=reader.locator('[data-ao-choir-prayer="'+id+'"] [data-p435930-choir-flip]');
     assert.equal(await flip.count(),1,id+" lost its source-owned Choir Latin flip");
     const visibility=await flip.evaluate(el=>{
      const chain=[];for(let node=el;node&&chain.length<10;node=node.parentElement){
       const r=node.getBoundingClientRect(),cs=getComputedStyle(node);
       chain.push({name:node.tagName+"."+String(node.className||"").slice(0,80),
        display:cs.display,visibility:cs.visibility,opacity:cs.opacity,
        width:r.width,height:r.height,hidden:node.hidden,
        ariaHidden:node.getAttribute("aria-hidden")});
      }return chain;
     });
     assert.ok(await flip.isVisible(),id+" Choir Latin control is not user-visible: "+JSON.stringify(visibility));
     await flip.click();
     latinUnits=await checkChoirText("la");
     await flip.click();
     await checkChoirText(vernacularLanguage);
    }
    assert.ok(vernUnits>0,id+" has no original vernacular text");
    if(languages.la)assert.ok(latinUnits>0,id+" has no original Latin text");
    if(!languages.fr)assert.equal(vernacularLanguage,"en",
     id+" rendered an unattested French translation");

    assert.equal(await reader.locator("[data-p435930-lib-back]").count(),0,
     id+" duplicates the header Back");
    await page.locator("#aoPray435930.open [data-p435930-back]").click();
    assert.equal(await reader.count(),0,id+" did not leave the original canonical card");
    report.variants.push({id,width,ui,reader:owner,sourceLanguage:vernacularLanguage,
     originalLatin:languages.la,vernacularSegments:vernUnits,latinSegments:latinUnits,
     sourceMatched:true,flipRoundTrip:languages.la,englishOnlyHold:!languages.fr,
     documentOverflow:geometry.document});
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
