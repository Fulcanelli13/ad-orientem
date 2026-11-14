/**
 * Actual private-reader browser acceptance; no public Office route/deploy.
 * All external source requests are served from preserved pinned witnesses.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync} from "node:fs";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";

const ROOT=resolve(fileURLToPath(new URL("..",import.meta.url)));
const OUT=resolve(ROOT,"artifacts/divine-office-private-phone");
await mkdir(OUT,{recursive:true});
const languages={Latin:"la",English:"en",Francais:"fr"};
const fixture={};
for(const lang of ["la","en","fr"]){
 const load=name=>JSON.parse(readFileSync(
  new URL("../tests/fixtures/office/"+name+"-"+lang+".json",import.meta.url),"utf8"));
 fixture[lang]={
  saturday:load("advent-i-saturday-compline"),
  tuesday:load("advent-i-feria-iii-compline"),
  week:load("advent-i-week-compline"),
  vespers:load("advent-i-preview")
 };
}
const mondayLatin=JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/advent-iii-feria-ii-compline-la.json",
 import.meta.url),"utf8"));
const ordinary=readFileSync(new URL(
 "../tests/fixtures/office/advent-i-preview-ordinary.txt",import.meta.url),"utf8");
const christmasMarian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const sourceBase="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/";
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".txt":"text/plain; charset=utf-8"};
function sourceFixture(url,{dropFrenchPsalm=false}={}){
 assert.ok(url.startsWith(sourceBase),"source pin cannot drift");
 const original=decodeURIComponent(url.slice(sourceBase.length));
 if(original==="Ordinarium/Vespera.txt")return ordinary;
 const m=/^(Latin|English|Francais)\/(.+)\.txt$/u.exec(original);
 if(!m)throw Error("UNKNOWN_SOURCE_LOCALE_OR_PATH:"+original);
 const lang=languages[m[1]],path=m[2],f=fixture[lang];
 if(path==="Psalterium/Mariaant"&&lang==="la")
  return christmasMarian; // exact pinned Advent + Christmas seasonal source
 if(path.startsWith("Psalterium/Psalmorum/Psalm")){
  const id=Number(path.slice("Psalterium/Psalmorum/Psalm".length));
  let body;
  if(id===143||id===144||id===232)
   body=f.vespers.leaves[path]||
    (f.vespers.sections[path]&&Object.entries(f.vespers.sections[path])
     .map(([key,lines])=>"["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n");
  else if((id===6||id===7)&&lang==="la")body=mondayLatin.psalms[id]?.text;
  else if([87,102,233].includes(id))body=f.saturday.psalms[id];
  else if([11,12,15].includes(id))body=f.tuesday.psalms[id]?.text;
  else body=f.week.psalms[id]?.text;
  if(typeof body!=="string")throw Error("UNSUPPORTED_PSALM:"+id);
  if(dropFrenchPsalm&&lang==="fr"&&id===70)return body.slice(0,12);
  return body;
 }
 const v=f.vespers;
 if(Object.hasOwn(v.leaves,path))return v.leaves[path];
 // Both fixture cohorts extract distinct headings from the SAME original
 // pinned file. Combine headings rather than preferring a partial fixture.
 const sections={...(f.saturday.sections[path]||{}),...(v.sections[path]||{})};
 if(!Object.keys(sections).length)throw Error("UNSUPPORTED_SOURCE:"+path);
 return Object.entries(sections)
  .map(([key,lines])=>"["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n";
}
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(ROOT,"."+pathname);
  if(file!==ROOT&&!file.startsWith(ROOT+sep)){
   res.writeHead(403);res.end("forbidden");return;
  }
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,err)=>{server.once("error",err);server.listen(0,"127.0.0.1",ok)});
const url="http://127.0.0.1:"+server.address().port+"/previews/private-divine-office.html";
const receipt={schema:"ao.office.private-reader-browser-acceptance.v1",
 revision:PIN,published:false,scenarios:[],screenshots:[],success:false};
async function stubSources(page,opts={}){
 const seen=new Set();
 await page.route("https://raw.githubusercontent.com/**",async route=>{
  const requestUrl=route.request().url();seen.add(requestUrl);
  try{
   const body=sourceFixture(requestUrl,opts);
   await route.fulfill({status:200,contentType:"text/plain",
    headers:{"access-control-allow-origin":"*"},body});
  }catch(e){
   await route.fulfill({status:404,contentType:"text/plain",
    headers:{"access-control-allow-origin":"*"},body:String(e?.message??e)});
  }
 });
 return seen;
}
async function waitReady(page){
 await page.waitForFunction(()=>{
  const text=document.querySelector(".aoOfReadiness")?.textContent||"";
  return text.includes("NOT certified")||text.startsWith("Source preview withheld:")||
   text.startsWith("Source unavailable:");
 },null,{timeout:30000});
 const status=await page.locator(".aoOfReadiness").innerText();
 assert.match(status,/NOT certified/, "Expected source preview; reader reports: "+status);
}
async function waitWithheld(page){
 await page.waitForFunction(()=>document.querySelector(".aoOfReadiness")?.textContent
  .startsWith("Source preview withheld:"),null,{timeout:30000});
}
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  const seen=await stubSources(page);
  const r=await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(r?.status(),200);
  await page.locator("#reader .aoOfOptions select").first().selectOption("COMPLINE");
  await page.getByRole("button",{name:"Read source preview"}).click();
  await waitReady(page);
  assert.match(await page.locator(".aoOfReadiness").innerText(),/42 source events/);
  assert.match(await page.locator(".aoOfReadiness").innerText(),/2026-11-28/);
  assert.match(await page.locator(".aoOfFrameControls").innerText(),/Reading step 1 of/);
  await page.getByRole("button",{name:"Next"}).click();
  assert.match(await page.locator(".aoOfFrameControls").innerText(),/Reading step 2 of/);
  await page.getByRole("button",{name:"Previous"}).click();
  assert.equal(await page.getByRole("button",{name:"Previous"}).isDisabled(),true);
  await page.locator("#reader .aoOfOptions select").nth(1).selectOption("lafr");
  assert.equal(await page.locator(".aoOfLanguage").count(),2);
  assert.match(await page.locator(".aoOfLanguage h3").last().innerText(),/français/i);
  await page.locator("#reader .aoOfOptions select").nth(1).selectOption("la");
  assert.equal(await page.locator(".aoOfLanguage").count(),1);
  // The 1961 §65–66 presider choice is independent of the final-prayer
  // examen and survives the same responsive native reader.
  const presider=page.getByRole("combobox",{name:"Compline presiding minister"});
  await presider.selectOption("PRIEST");
  await waitReady(page);
  assert.match(await page.locator(".aoOfReadiness").innerText(),/priest · NOT certified/);
  await presider.selectOption("NON_PRIEST");
  await waitReady(page);
  assert.match(await page.locator(".aoOfReadiness").innerText(),/non priest · NOT certified/);
  await page.screenshot({path:resolve(OUT,width+"-compline-la.png"),
   animations:"disabled",fullPage:false});
  receipt.screenshots.push(width+"-compline-la.png");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-
   document.documentElement.clientWidth);
  assert.ok(overflow<=2,"horizontal overflow "+overflow+" at "+width);
  // Christmas private-only LATIN: 7 dates × 2 physical phone widths.
  // These test source-fed complete readings, never public availability.
  for(const [civil,officeDate,psalmDay,season] of [
   ["2026-12-21","2026-12-21","Dominica","Advent"],
   ["2026-12-22","2026-12-22","Feria III","Advent"],
   ["2026-12-23","2026-12-23","Feria IV","Advent"],
   ["2026-12-24","2026-12-25","Dominica","Nativiti"],
   ["2026-12-25","2026-12-25","Dominica","Nativiti"],
   ["2026-12-26","2026-12-26","Dominica","Nativiti"],
   ["2026-12-27","2026-12-27","Dominica","Nativiti"]
  ]){
   await page.locator('#reader input[type="date"]').fill(civil);
   await page.locator('#reader input[type="date"]').dispatchEvent("change");
   const sourceMode=page.locator("#reader .aoOfOptions select").nth(1);
   assert.equal(await sourceMode.inputValue(),"la",
    "Christmas research preview must default to Latin only");
   await page.getByRole("button",{name:"Read source preview"}).click();
   await waitReady(page);
   const actual=await page.locator(".aoOfReadiness").innerText();
   assert.ok(actual.includes("civil "+civil+" · Office "+officeDate),
    "Incorrect civil/Office date "+civil+": "+actual);
   assert.match(actual,/40 printed-ordinary moments/u);
   assert.match(actual,/42 source events/u);
   assert.equal(await page.locator("#reader").getAttribute("data-office-marian-source"),
    "Psalterium/Mariaant#"+season);
   assert.equal(await page.locator(".aoOfLanguage").count(),1);
   assert.match(await page.locator(".aoOfFrameControls").innerText(),/Reading step 1 of/u);
   await page.getByRole("button",{name:"Next"}).click();
   assert.match(await page.locator(".aoOfFrameControls").innerText(),/Reading step 2 of/u);
   const mobileOverflow=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(mobileOverflow<=2,
    "Private Christmas "+civil+" overflows "+width+"px by "+mobileOverflow);
   const capture=width+"-christmas-"+civil+"-latin-private.png";
   await page.screenshot({path:resolve(OUT,capture),
    animations:"disabled",fullPage:false});
   receipt.screenshots.push(capture);
   receipt.scenarios.push({case:"christmas-private-Compline",width,civilDate:civil,
    officeDate,psalmDay,marianSection:season,sourceEvents:42,
    readingEvents:40,publicReleased:false,passed:true});
  }
  // Year-boundary private LATIN source acceptance: seven further exact
  // dates × 320/390px. Dates remain withheld on the public Prayer route.
  for(const [civil,officeDate,psalmDay] of [
   ["2026-12-28","2026-12-28","Dominica"],
   ["2026-12-29","2026-12-29","Dominica"],
   ["2026-12-30","2026-12-30","Dominica"],
   ["2026-12-31","2027-01-01","Dominica"],
   ["2027-01-01","2027-01-01","Dominica"],
   ["2027-01-02","2027-01-03","Dominica"],
   ["2027-01-03","2027-01-03","Dominica"]
  ]){
   await page.locator('#reader input[type="date"]').fill(civil);
   await page.locator('#reader input[type="date"]').dispatchEvent("change");
   const sourceMode=page.locator("#reader .aoOfOptions select").nth(1);
   assert.equal(await sourceMode.inputValue(),"la",
    "New source-only Christmas octave must remain Latin only");
   await page.getByRole("button",{name:"Read source preview"}).click();
   await waitReady(page);
   const actual=await page.locator(".aoOfReadiness").innerText();
   assert.ok(actual.includes("civil "+civil+" · Office "+officeDate),
    "Incorrect private civil/Office date "+civil+": "+actual);
   assert.match(actual,/40 printed-ordinary moments/u);
   assert.match(actual,/42 source events/u);
   assert.equal(await page.locator("#reader").getAttribute("data-office-marian-source"),
    "Psalterium/Mariaant#Nativiti",
    "Do not reset to Advent ending on civil 1 January");
   assert.equal(await page.locator(".aoOfLanguage").count(),1);
   assert.match(await page.locator(".aoOfFrameControls").innerText(),
    /Reading step 1 of/u);
   await page.getByRole("button",{name:"Next"}).click();
   assert.match(await page.locator(".aoOfFrameControls").innerText(),
    /Reading step 2 of/u);
   const overflow=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflow<=2,
    "Private year-boundary "+civil+" overflows "+width+"px by "+overflow);
   const capture=width+"-dec28-jan03-"+civil+"-latin-private.png";
   await page.screenshot({path:resolve(OUT,capture),
    animations:"disabled",fullPage:false});
   receipt.screenshots.push(capture);
   receipt.scenarios.push({case:"dec28-jan03-private-Compline",width,
    civilDate:civil,officeDate,psalmDay,marianSection:"Nativiti",
    sourceEvents:42,readingEvents:40,publicReleased:false,passed:true});
  }
  // Epiphany/First Vespers dates: 14 additional source-driven
  // 320/390px PRIVATE Latin journeys, not public source authorization.
  for(const [civil,officeDate,psalmDay] of [
   ["2027-01-04","2027-01-04","Feria II"],
   ["2027-01-05","2027-01-06","Dominica"],
   ["2027-01-06","2027-01-06","Dominica"],
   ["2027-01-07","2027-01-07","Feria V"],
   ["2027-01-08","2027-01-08","Feria VI"],
   ["2027-01-09","2027-01-10","Dominica"],
   ["2027-01-10","2027-01-10","Dominica"]
  ]){
   await page.locator('#reader input[type="date"]').fill(civil);
   await page.locator('#reader input[type="date"]').dispatchEvent("change");
   assert.equal(await page.locator("#reader .aoOfOptions select").nth(1).inputValue(),
    "la","Epiphany source preview must be Latin only");
   await page.getByRole("button",{name:"Read source preview"}).click();
   await waitReady(page);
   const state=await page.locator(".aoOfReadiness").innerText();
   assert.ok(state.includes("civil "+civil+" · Office "+officeDate),
    "Wrong first-Vespers Office date "+civil+": "+state);
   assert.match(state,/40 printed-ordinary moments/u);
   assert.match(state,/42 source events/u);
   assert.equal(await page.locator("#reader").getAttribute("data-office-marian-source"),
    "Psalterium/Mariaant#Nativiti");
   assert.equal(await page.locator(".aoOfLanguage").count(),1);
   assert.match(await page.locator(".aoOfFrameControls").innerText(),/Reading step 1 of/u);
   await page.getByRole("button",{name:"Next"}).click();
   assert.match(await page.locator(".aoOfFrameControls").innerText(),/Reading step 2 of/u);
   const over=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(over<=2,"Epiphany private "+civil+" overflows "+width+"px: "+over);
   const png=width+"-epiphany-"+civil+"-latin-private.png";
   await page.screenshot({path:resolve(OUT,png),
    animations:"disabled",fullPage:false});
   receipt.screenshots.push(png);
   receipt.scenarios.push({case:"epiphany-private-Compline",width,
    civilDate:civil,officeDate,psalmDay,marianSection:"Nativiti",
    sourceEvents:42,readingEvents:40,publicReleased:false,passed:true});
  }
  // Source-only Latin Compline, 11–17 January 2027. This is NOT
  // public reader availability: 7 dates × 320/390px browser journeys.
  for(const [civil,officeDate,psalmDay] of [
   ["2027-01-11","2027-01-11","Feria II"],
   ["2027-01-12","2027-01-12","Feria III"],
   ["2027-01-13","2027-01-13","Dominica"],
   ["2027-01-14","2027-01-14","Feria V"],
   ["2027-01-15","2027-01-15","Feria VI"],
   ["2027-01-16","2027-01-17","Sabbato"],
   ["2027-01-17","2027-01-17","Dominica"]
  ]){
   await page.locator('#reader input[type="date"]').fill(civil);
   await page.locator('#reader input[type="date"]').dispatchEvent("change");
   assert.equal(await page.locator("#reader .aoOfOptions select").nth(1).inputValue(),
    "la","Post-Epiphany source preview must remain Latin only");
   await page.getByRole("button",{name:"Read source preview"}).click();
   await waitReady(page);
   const state=await page.locator(".aoOfReadiness").innerText();
   assert.ok(state.includes("civil "+civil+" · Office "+officeDate),
    "Wrong Baptism/Sunday Office date "+civil+": "+state);
   assert.match(state,/40 printed-ordinary moments/u);
   assert.match(state,/42 source events/u);
   assert.equal(await page.locator("#reader").getAttribute("data-office-marian-source"),
    "Psalterium/Mariaant#Nativiti");
   assert.equal(await page.locator(".aoOfLanguage").count(),1);
   assert.match(await page.locator(".aoOfFrameControls").innerText(),
    /Reading step 1 of/u);
   await page.getByRole("button",{name:"Next"}).click();
   assert.match(await page.locator(".aoOfFrameControls").innerText(),
    /Reading step 2 of/u);
   const over=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(over<=2,"Jan11–17 "+civil+" overflows "+width+"px: "+over);
   const png=width+"-jan11-17-"+civil+"-latin-private.png";
   await page.screenshot({path:resolve(OUT,png),
    animations:"disabled",fullPage:false});
   receipt.screenshots.push(png);
   receipt.scenarios.push({case:"jan11-17-private-Compline",width,
    civilDate:civil,officeDate,psalmDay,marianSection:"Nativiti",
    sourceEvents:42,readingEvents:40,publicReleased:false,passed:true});
  }
  // Exact 28 November civil date is not 29 November Office on First Vespers.
  await page.locator("#reader .aoOfOptions select").first().selectOption("VESPERS");
  assert.equal(await presider.isDisabled(),true);
  await page.getByRole("button",{name:"Read source preview"}).click();
  await waitReady(page);
  assert.match(await page.locator(".aoOfReadiness").innerText(),
   /civil 2026-11-28 · Office 2026-11-29 · 38 source events/);
  await page.locator("#reader .aoOfOptions select").nth(1).selectOption("laen");
  assert.equal(await page.locator(".aoOfLanguage").count(),2);
  await page.screenshot({path:resolve(OUT,width+"-vespers-laen.png"),
   animations:"disabled",fullPage:false});
  receipt.screenshots.push(width+"-vespers-laen.png");
  const otherOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-
   document.documentElement.clientWidth);
  assert.ok(otherOverflow<=2,"Vespers overflow "+otherOverflow+" at "+width);
  assert.equal(errors.length,0,"uncaught page errors: "+errors.join(" | "));
  assert.ok(seen.size>=22,"real bounded source fixture requests did not occur");
  receipt.scenarios.push({width,complineEvents:42,vespersEvents:38,
   civilOfficeDateSeparation:true,modes:["la","laen","lafr"],
   sourceReads:seen.size,passed:true});
  await context.close();
 }
 // Full-app path: the same private trilingual reader mounts INSIDE the
 // native Prayer Office only with explicit loopback opt-in (never on Pages).
 {
  const ctx=await browser.newContext({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  const app=await ctx.newPage(),appErrors=[];
  app.on("pageerror",error=>appErrors.push(String(error?.message??error)));
  const sourceRequests=await stubSources(app);
  const appURL=new URL("/index.html?aoOfficeReview=1",url).href;
  await app.goto(appURL,{waitUntil:"domcontentloaded",timeout:90000});
  await app.waitForFunction(()=>typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",
   null,{timeout:45000});
  const nav=await app.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"));
  assert.equal(nav?.ok,true);
  await app.locator("#aoPray435930.open [data-ao-office-door]").click();
  const office=app.locator("#aoPray435930.open .aoOfficeReader");
  await office.waitFor({state:"visible",timeout:20000});
  const review=office.locator(".aoOfPrivateReviewLaunch");
  await review.waitFor({state:"visible",timeout:10000});
  await review.click();
  await office.locator(".aoOfPrivateReview .aoOfOptions").waitFor({state:"visible",timeout:12000});
  await office.locator(".aoOfPrivateReview .aoOfOptions select").first().selectOption("COMPLINE");
  await office.locator(".aoOfPrivateReview .aoOfOptions button").click();
  await waitReady(app);
  assert.match(await office.locator(".aoOfReadiness").innerText(),/42 source events/);
  assert.equal(await office.locator(".aoOfLanguage").count(),2);
  assert.ok(sourceRequests.size>0,"Native Office did not fetch original pinned source");
  // Second private run must assemble LATIN independently, with no access to
  // English/French source leaves; switching back to bilingual reassembles.
  const requests=[];
  app.on("request",req=>{
   if(req.url().startsWith(sourceBase))requests.push(req.url());
  });
  const mode=office.locator(".aoOfPrivateReview .aoOfOptions select").nth(1);
  await mode.selectOption("la");
  const start=requests.length;
  await office.locator(".aoOfPrivateReview .aoOfOptions button").click();
  await waitReady(app);
  assert.equal(await office.locator(".aoOfLanguage").count(),1);
  assert.match(await office.locator(".aoOfReadiness").innerText(),/42 source events/);
  const latinRequests=requests.slice(start);
  assert.ok(latinRequests.length>0,"Latin-only private reader did not fetch pinned Latin text");
  assert.ok(latinRequests.every(u=>u.includes("/Latin/")),
   "Latin-only Compline touched an English/French source");
  await app.screenshot({path:resolve(OUT,"390-native-prayer-compline-latin-only.png"),
   animations:"disabled",fullPage:false});
  receipt.screenshots.push("390-native-prayer-compline-latin-only.png");
  await mode.selectOption("laen");
  await waitReady(app);
  assert.equal(await office.locator(".aoOfLanguage").count(),2,
   "Bilingual switch did not reassemble independently sourced translations");
  assert.equal(appErrors.length,0,"Native private source browser errors: "+appErrors.join(" | "));
  await app.screenshot({path:resolve(OUT,"390-native-prayer-compline-private.png"),
   animations:"disabled",fullPage:false});
  receipt.screenshots.push("390-native-prayer-compline-private.png");
  await office.getByRole("button",{name:"Return to Prayer"}).click();
  assert.equal(await office.count(),0,"Native source preview was not disposed on Back");
  receipt.scenarios.push({case:"native-prayer-private-Compline",passed:true,
   originalPinnedSourceRequests:sourceRequests.size,
   reviewHost:"loopback-only",published:false});
  await ctx.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(),hits=await stubSources(page,{dropFrenchPsalm:true});
 await page.goto(url,{waitUntil:"domcontentloaded"});
 await page.locator('input[type="date"]').fill("2026-12-03");
 await page.getByRole("button",{name:"Read source preview"}).click();
 await waitWithheld(page);
 assert.equal(await page.locator(".aoOfLanguage").count(),0);
 receipt.scenarios.push({case:"truncated-French-source",noTextRendered:true,
  requests:hits.size,passed:true});
 await context.close();
 receipt.success=true;
}finally{
 await writeFile(resolve(OUT,"acceptance-receipt.json"),
  JSON.stringify(receipt,null,2)+"\n");
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
assert.equal(receipt.success,true);
process.stdout.write(JSON.stringify(receipt,null,2)+"\n");
