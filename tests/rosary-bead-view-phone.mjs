// Rosary bead view — phone acceptance.
//
// The bead view is presentation only. This test proves, on 320/390/430px
// touch screens, that it:
//   • is opt-in (classic stays the default) and remembers the choice;
//   • advances exclusively through the canonical engine, one step per tap,
//     across the full 78-step ordinary Rosary, with the ring tracking each Ave;
//   • shows exactly the text the canonical donor rendered — vernacular,
//     Latin, and the donor's own group ℣./℟. division — never a substitute;
//   • keeps bead jump, Previous, swipe and Finish delegated to the donor;
//   • meets touch-target and no-horizontal-overflow rules.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/rosary-bead-view-phone");
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
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4231,"127.0.0.1",ok)});

const VIEW="#aoRosaryBeadView";
const norm=s=>String(s||"").replace(/\s+/g," ").trim();

async function openRosary(page,{layout=null,recitation=null}={}){
 await page.goto("http://127.0.0.1:4231/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_MODULES?.open==="function",null,{timeout:30000});
 await page.evaluate(({layout,recitation})=>{
  if(layout)localStorage.setItem("ao-rosary-layout",layout);else localStorage.removeItem("ao-rosary-layout");
  if(recitation)localStorage.setItem("ao-prayer-recitation-mode",recitation);
 },{layout,recitation});
 await page.waitForFunction(()=>!!globalThis.AO_ROSARY_BEAD_VIEW_V1,null,{timeout:15000});
 const opened=await page.evaluate(async()=>await globalThis.AO_MODULES.open("pray.rosary",{returnContext:null}));
 assert.notEqual(opened?.ok,false,"Rosary is not reachable");
 await page.getByText(/Pray today.s mysteries/).first().tap({timeout:15000});
 await page.waitForSelector("#aoPrayerBookRoot.open [data-lab-rosary-next]",{timeout:15000});
}

// Text the donor rendered for the current step, by face, without sr-only labels.
async function donorText(page,face){
 return page.evaluate(face=>{
  const sheet=document.querySelector("#aoPrayerBookRoot.open .pbShell .lab-prayer-sheet");
  return [...(sheet?.querySelectorAll(`.lab-prayer-flip ${face==="latin"?"[data-pb-latin]":"[data-pb-vern]"}`)||[])].map(n=>{
   const c=n.cloneNode(true);c.querySelectorAll(".aoSrOnly").forEach(x=>x.remove());
   return c.textContent;
  }).join(" ");
 },face);
}
async function viewText(page){
 return page.evaluate(sel=>{
  const p=document.querySelector(sel+" [data-rbv-prayer='open']");if(!p)return null;
  const c=p.cloneNode(true);c.querySelectorAll(".rbvRole,.rbvFold").forEach(x=>x.remove());
  return c.textContent;
 },VIEW);
}
const engineStep=page=>page.evaluate(()=>window.AO_ROSARY_V381.state().step);

let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:"en-GB"});
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  const page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(String(e?.message||e)));

  // 1. Opt-in: classic remains the default and offers a 44px Beads switch.
  await openRosary(page);
  assert.equal(await page.locator(VIEW).count(),0,"Bead view must not replace the classic reader by default");
  const toggle=page.locator("#aoPrayerBookRoot.open [data-rbv-open]");
  assert.equal(await toggle.count(),1,"Classic reader is missing the Beads switch");
  assert.ok((await toggle.boundingBox()).height>=44,"Beads switch is below 44px");
  await toggle.tap();
  await page.waitForSelector(VIEW,{state:"visible",timeout:5000});
  assert.equal(await page.evaluate(()=>localStorage.getItem("ao-rosary-layout")),"beads","Bead view choice is not remembered");

  // 2. Layout rules.
  const layout=await page.evaluate(sel=>{
   const v=document.querySelector(sel);
   const small=[...v.querySelectorAll("button")].filter(b=>b.offsetParent!==null)
    .map(b=>({t:(b.textContent||b.getAttribute("aria-label")||"").trim().slice(0,24),h:b.getBoundingClientRect().height,w:b.getBoundingClientRect().width}))
    .filter(b=>b.h<44||b.w<44);
   return {overflow:document.documentElement.scrollWidth>innerWidth+1||v.scrollWidth>v.clientWidth+1,
    advance:v.querySelector("[data-rbv-next]").getBoundingClientRect().height,small};
  },VIEW);
  assert.equal(layout.overflow,false,`Horizontal overflow at ${width}px`);
  assert.ok(layout.advance>=96,`Advance zone too small at ${width}px: ${layout.advance}`);
  assert.deepEqual(layout.small,[],`Touch targets below 44px at ${width}px`);

  // 3. Full traversal by tapping: exactly one canonical step per tap.
  const total=await page.evaluate(()=>window.AO_ROSARY_V381.steps().length);
  assert.equal(await engineStep(page),0);
  const shots=new Set([0,7,11,19,total-1]);
  for(let i=0;i<total;i++){
   const step=await page.evaluate(i=>window.AO_ROSARY_V381.steps()[i],i);
   await page.waitForFunction(({sel,i})=>document.querySelector(sel)?.dataset.step===String(i),{sel:VIEW,i},{timeout:5000});
   const state=await page.evaluate(sel=>{
    const v=document.querySelector(sel);
    return {kind:v.dataset.kind,current:[...v.querySelectorAll(".rbvAve.is-current")].length,
     past:[...v.querySelectorAll(".rbvRing .rbvAve.is-past")].length,
     body:(v.querySelector(".rbvScroll")?.innerText||"").trim().length,title:v.querySelector(".rbvTitles h1")?.textContent||""};
   },VIEW);
   assert.ok(state.body>=12,`Empty bead view at step ${i}`);
   assert.ok(!/^Mystery \d$/.test(state.title),`Untitled mystery at step ${i}`);
   if(step.key==="ave"&&step.phase==="decade"){
    assert.equal(state.current,1,`Ave ${step.bead} not lit at step ${i}`);
    assert.equal(state.past,step.bead-1,`Past beads wrong at step ${i}`);
   }
   if(width===390&&shots.has(i))await page.screenshot({path:`${out}/step-${String(i).padStart(2,"0")}-${width}.png`});
   if(i<total-1){
    await page.locator(VIEW+" [data-rbv-next]").tap();
    await page.waitForFunction(n=>window.AO_ROSARY_V381.state().step===n,i+1,{timeout:5000});
   }
  }

  // 4. Text fidelity (individual, vernacular and Latin).
  await page.evaluate(()=>window.AO_ROSARY_V381.setStep(12));
  await page.waitForFunction(sel=>document.querySelector(sel)?.dataset.step==="12",VIEW);
  await page.locator(VIEW+" [data-rbv-expand]").tap();
  await page.waitForSelector(VIEW+" [data-rbv-prayer='open']");
  assert.equal(norm(await viewText(page)),norm(await donorText(page,"vernacular")),"Vernacular Ave differs from the donor text");
  await page.locator(VIEW+" [data-rbv-face]").tap();
  await page.waitForFunction(sel=>document.querySelector(sel+" [data-rbv-face]")?.getAttribute("aria-pressed")==="true",VIEW);
  assert.equal(norm(await viewText(page)),norm(await donorText(page,"latin")),"Latin Ave differs from the donor text");
  await page.locator(VIEW+" [data-rbv-face]").tap();

  // 5. Bead jump, Previous and swipe delegate to the donor.
  await page.locator(VIEW+" [data-rbv-jump]").nth(6).tap();
  await page.waitForFunction(()=>window.AO_ROSARY_V381.steps()[window.AO_ROSARY_V381.state().step]?.bead===7,null,{timeout:5000});
  const atJump=await engineStep(page);
  await page.locator(VIEW+" [data-rbv-prev]").tap();
  await page.waitForFunction(n=>window.AO_ROSARY_V381.state().step===n-1,atJump,{timeout:5000});
  const cdp=await context.newCDPSession(page);
  const swipe=async(x1,x2)=>{const y=420;
   await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:x1,y}]});
   for(let k=1;k<=5;k++)await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x1+(x2-x1)*k/5,y}]});
   await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  };
  const beforeSwipe=await engineStep(page);
  await swipe(width-40,40);
  await page.waitForFunction(n=>window.AO_ROSARY_V381.state().step===n+1,beforeSwipe,{timeout:5000});
  await swipe(40,width-40);
  await page.waitForFunction(n=>window.AO_ROSARY_V381.state().step===n,beforeSwipe,{timeout:5000});

  // 6. Finish is the donor's: the view steps aside with the player.
  await page.evaluate(()=>window.AO_ROSARY_V381.setStep(window.AO_ROSARY_V381.steps().length-1));
  await page.waitForFunction(sel=>document.querySelector(sel)?.dataset.kind==="conclusion",VIEW);
  await page.locator(VIEW+" [data-rbv-next]").tap();
  await page.waitForFunction(sel=>!document.querySelector(sel)&&!document.documentElement.classList.contains("rbvActive"),VIEW,{timeout:5000});

  // 7. Group recitation shows the donor's own leader / response division.
  await openRosary(page,{layout:"beads",recitation:"group"});
  await page.waitForSelector(VIEW,{state:"visible"});
  await page.evaluate(()=>window.AO_ROSARY_V381.setStep(12));
  await page.waitForFunction(sel=>document.querySelector(sel)?.dataset.step==="12",VIEW);
  await page.locator(VIEW+" [data-rbv-expand]").tap();
  await page.waitForSelector(VIEW+" .rbvDialogue.is-r",{timeout:5000});
  const group=await page.evaluate(sel=>({
   v:[...document.querySelectorAll(sel+" .rbvDialogue.is-v")].map(n=>n.textContent.replace(/^℣\.\s*/,"")).join(" "),
   r:[...document.querySelectorAll(sel+" .rbvDialogue.is-r")].map(n=>n.textContent.replace(/^℟\.\s*/,"")).join(" "),
  }),VIEW);
  const donorSplit=await page.evaluate(()=>{
   const pick=s=>{const n=document.querySelector("#aoPrayerBookRoot.open .lab-prayer-sheet [data-pb-vern] "+s)?.cloneNode(true);n?.querySelectorAll(".aoSrOnly").forEach(x=>x.remove());return n?.textContent||""};
   return {v:pick(".aoCustomaryLeader"),r:pick(".aoCustomaryResponse")};
  });
  assert.ok(donorSplit.v&&donorSplit.r,"Donor group markup missing");
  assert.equal(norm(group.v),norm(donorSplit.v),"Group ℣. differs from the donor leader part");
  assert.equal(norm(group.r),norm(donorSplit.r),"Group ℟. differs from the donor response part");
  if(width===390)await page.screenshot({path:`${out}/group-ave-${width}.png`});

  // 8. Classic is one tap away and is remembered.
  await page.locator(VIEW+" [data-rbv-classic]").tap();
  await page.waitForFunction(sel=>!document.querySelector(sel),VIEW,{timeout:5000});
  assert.equal(await page.evaluate(()=>localStorage.getItem("ao-rosary-layout")),"classic");
  assert.equal(await page.locator("#aoPrayerBookRoot.open [data-lab-rosary-next]").isVisible(),true,"Classic reader not restored");

  assert.deepEqual(errors,[],`Page errors at ${width}px`);
  console.log(`PASS ${width}px Rosary bead view: opt-in, ${total}/${total} taps, donor text fidelity (EN/LA/group), jump, back, swipe, finish, classic return`);
  await context.close();
 }
}finally{
 await browser?.close();
 server.close();
}
