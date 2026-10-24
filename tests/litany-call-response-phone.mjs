// Litany call-and-response layout — contract and phone acceptance.
//
// Proves that the layout is presentation only and that it is usable on
// 320/390/430px touch screens:
//   • every line split satisfies call + response === source line (EN/FR/LA,
//     Holy Name and Sacred Heart), and the three languages split identically;
//   • the Kyrie, "hear us" pairs, Agnus Dei and ℣./℟. stay whole;
//   • on screen, the full ordered line sequence equals the source text, in
//     the vernacular, in Latin and in French;
//   • the shared response stays pinned in view while its run is scrolled;
//   • Together/Leader/People and the view choice are remembered, the existing
//     Guided default is unchanged until chosen, and Text/Guided still work.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {parseLitany} from "../src/pray/litany-responsive.js";
import {HOLY_NAME_LITANY_V381,SACRED_HEART_DEVOTIONS_V382} from "../src/pray/traditional-pray-data.js";

const LITANIES={holyName:HOLY_NAME_LITANY_V381,sacredHeart:SACRED_HEART_DEVOTIONS_V382.litany};
const sourceLines=text=>String(text).split("\n").map(l=>l.trim()).filter(Boolean);
const norm=s=>String(s||"").replace(/\s+/g," ").trim();

// ---------------------------------------------------------------- contract
for(const [name,litany] of Object.entries(LITANIES)){
 const shapes=[];
 for(const lang of ["en","fr","la"]){
  const parsed=parseLitany(litany[lang]);
  const lines=parsed.sections.flatMap(s=>s.lines);
  assert.deepEqual(lines.map(l=>l.text),sourceLines(litany[lang]),`${name}/${lang}: line sequence altered`);
  for(const l of lines){
   if(l.call!==null)assert.equal(l.call+l.response,l.text,`${name}/${lang}: split is not lossless: ${l.text}`);
  }
  const kyrie=lines.slice(0,3);
  assert.ok(kyrie.every(l=>l.call===null),`${name}/${lang}: Kyrie must stay whole`);
  assert.ok(lines.filter(l=>/^(℣|℟)/.test(l.text)).every(l=>l.call===null),`${name}/${lang}: ℣./℟. must stay whole`);
  shapes.push(lines.map(l=>l.call===null?0:1).join(""));
 }
 assert.equal(new Set(shapes).size,1,`${name}: EN/FR/LA split differently`);
 assert.ok(shapes[0].split("1").length-1>=30,`${name}: too few call/response lines detected`);
}
assert.deepEqual(parseLitany(HOLY_NAME_LITANY_V381.en).responses.sort(),["deliver us, O Jesus.","have mercy on us."]);
console.log("PASS litany call/response contract: lossless EN/FR/LA splits, identical structure, Kyrie and ℣./℟. kept whole");

// ------------------------------------------------------------------ phone
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/litany-call-response-phone");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const data=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4232,"127.0.0.1",ok)});

const R="#aoPray435930.open";
async function openModule(page,id){
 const r=await page.evaluate(async id=>await globalThis.AO_MODULES.open(id,{returnContext:null}),id);
 assert.notEqual(r?.ok,false,id+" not reachable");
 await page.waitForSelector(R+" .aoP435930Mount",{timeout:15000});
}
// Ordered, complete lines as displayed for one face of the open litany.
async function displayed(page,face){
 return page.evaluate(({R,face})=>[...document.querySelectorAll(`${R} .aoLitCR [data-ao-litany-face-body="${face}"] .aoLitCRPlain, ${R} .aoLitCR [data-ao-litany-face-body="${face}"] .aoLitCRCall`)]
  .map(n=>n.classList.contains("aoLitCRCall")?n.dataset.aoLitanyLine:n.textContent),{R,face});
}
async function callsMatchRuns(page){
 return page.evaluate(R=>[...document.querySelectorAll(R+" .aoLitCR .aoLitCRRun")].every(run=>{
  const resp=run.dataset.aoLitanyResponse;
  return [...run.querySelectorAll(".aoLitCRCall")].every(li=>li.dataset.aoLitanyLine.endsWith(resp)
   &&li.dataset.aoLitanyLine.startsWith(li.querySelector(".aoLitCRCallText").textContent));
 }),R);
}

let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  const page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(String(e?.message||e)));
  await page.goto("http://127.0.0.1:4232/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_MODULES?.open==="function",null,{timeout:30000});

  // 1. Existing default preserved; the new view is one visible tap away.
  await openModule(page,"pray.holy_name_litany");
  await page.waitForSelector(R+" .aoDevoSequenceTimeline",{state:"visible",timeout:12000});
  assert.equal(await page.locator(R+" [data-tp381-litany-mode='guided']").getAttribute("aria-pressed"),"true","Guided must remain the default");
  const crButton=page.locator(R+" [data-tp381-litany-mode='responsive']");
  assert.equal(await crButton.isVisible(),true,"Call & response switch must be visible without opening options");
  await crButton.tap();
  await page.waitForSelector(R+" .aoLitCR",{state:"visible"});
  assert.equal(await page.evaluate(()=>localStorage.getItem("ao-litany-layout")),"responsive");

  // 2. Layout rules.
  const layout=await page.evaluate(R=>{
   const m=document.querySelector(R+" .aoP435930Mount"),c=document.querySelector(R+" .aoLitCR");
   const small=[...c.querySelectorAll("button")].map(b=>b.getBoundingClientRect()).filter(r=>r.height<44||r.width<44).length;
   return {overflow:document.documentElement.scrollWidth>innerWidth+1||m.scrollWidth>m.clientWidth+1,small};
  },R);
  assert.equal(layout.overflow,false,`Horizontal overflow at ${width}px`);
  assert.equal(layout.small,0,`Litany controls below 44px at ${width}px`);

  // 3. Fidelity on screen: vernacular and Latin sequences equal the source.
  assert.deepEqual((await displayed(page,"v")).map(norm),sourceLines(HOLY_NAME_LITANY_V381.en).map(norm),"Holy Name EN differs from source");
  assert.equal(await callsMatchRuns(page),true,"An invocation does not belong to its run's response");
  assert.equal(await page.locator(R+' [data-ao-litany-face-body="v"] .aoLitCRHead').count(),7,"Holy Name lost its seven named sections");
  await page.locator(R+" [data-ao-litany-face]").tap();
  assert.equal(await page.locator(R+' [data-ao-litany-face-body="la"]').isVisible(),true,"Latin not shown");
  assert.equal(await page.locator(R+' [data-ao-litany-face-body="v"]').isVisible(),false,"Latin and vernacular shown together");
  assert.deepEqual((await displayed(page,"la")).map(norm),sourceLines(HOLY_NAME_LITANY_V381.la).map(norm),"Holy Name LA differs from source");
  await page.locator(R+" [data-ao-litany-face]").tap();

  // 4. The response stays pinned while its run scrolls.
  const pinned=await page.evaluate(async R=>{
   const m=document.querySelector(R+" .aoP435930Mount");
   const run=[...document.querySelectorAll(R+' [data-ao-litany-face-body="v"] .aoLitCRRun')].sort((a,b)=>b.children[0].children.length-a.children[0].children.length)[0];
   const calls=run.querySelectorAll(".aoLitCRCall");
   calls[Math.floor(calls.length/3)].scrollIntoView({block:"start"});
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const chip=run.querySelector(".aoLitCRResponse").getBoundingClientRect(),view=m.getBoundingClientRect();
   return {chipBottom:chip.bottom,chipTop:chip.top,viewBottom:view.bottom,viewTop:view.top,count:calls.length};
  },R);
  assert.ok(pinned.count>=20,"Expected the long 'have mercy on us' run");
  assert.ok(pinned.chipBottom<=pinned.viewBottom+1&&pinned.chipTop>pinned.viewTop+200,`Response not pinned in view at ${width}px: ${JSON.stringify(pinned)}`);
  if(width===390)await page.screenshot({path:`${out}/holy-name-pinned-${width}.png`});

  // 5. Voices are applied and remembered.
  await page.locator(R+" [data-ao-litany-voice='people']").tap();
  assert.equal(await page.locator(R+" .aoLitCR").getAttribute("data-voice"),"people");
  assert.equal(await page.evaluate(()=>localStorage.getItem("ao-litany-voice")),"people");

  // 6. The choice carries to the Sacred Heart litany, outside the fixed card.
  await openModule(page,"pray.sacred_heart");
  await page.waitForSelector(R+" .aoLitCR",{state:"visible"});
  assert.equal(await page.locator(R+" .aoLitCR").getAttribute("data-voice"),"people","Voice not remembered");
  assert.equal(await page.locator(R+" .aoDevoCard .aoLitCR").count(),0,"Call & response must not be clipped inside the card");
  assert.deepEqual((await displayed(page,"v")).map(norm),sourceLines(SACRED_HEART_DEVOTIONS_V382.litany.en).map(norm),"Sacred Heart EN differs from source");
  assert.equal(await callsMatchRuns(page),true);
  if(width===390)await page.screenshot({path:`${out}/sacred-heart-${width}.png`});
  await page.locator(R+" [data-tp381-heart-view='text']").tap();
  await page.waitForSelector(R+" .aoDevoCard .aoTP381PrayerCard",{state:"visible"});
  assert.equal(await page.evaluate(()=>localStorage.getItem("ao-litany-layout")),"text");

  // 7. Back to text: Holy Name opens Guided again and Full text still works.
  await openModule(page,"pray.holy_name_litany");
  await page.waitForSelector(R+" .aoDevoSequenceTimeline",{state:"visible",timeout:12000});
  await page.locator(R+" [data-tp381-litany-mode='full']").tap();
  assert.match(await page.locator(R+" .aoTP381PrayerCard").innerText(),/Jesus/,"Full text view broken");

  // 8. French: the French witness, split the same way.
  await page.evaluate(()=>window.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"}));
  await page.evaluate(()=>localStorage.setItem("ao-litany-layout","responsive"));
  await openModule(page,"pray.holy_name_litany");
  await page.waitForSelector(R+" .aoLitCR",{state:"visible"});
  assert.deepEqual((await displayed(page,"v")).map(norm),sourceLines(HOLY_NAME_LITANY_V381.fr).map(norm),"Holy Name FR differs from source");
  assert.match(await page.locator(R+" [data-ao-litany-voice='together']").innerText(),/Ensemble/);
  if(width===390)await page.screenshot({path:`${out}/holy-name-fr-${width}.png`});

  assert.deepEqual(errors,[],`Page errors at ${width}px`);
  console.log(`PASS ${width}px litany call & response: Holy Name EN/LA/FR and Sacred Heart source-identical, pinned response, voices and view remembered, Guided/Full text intact`);
  await context.close();
 }
}finally{
 await browser?.close();
 server.close();
}
