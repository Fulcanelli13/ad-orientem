import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
// Also run this test from the independent Scripture phone workflow, where no
// earlier CI job prepares the offline artifact.
execFileSync(process.execPath,["tools/scripture/build-catena-mark-blind-offline.mjs"],{cwd:root,stdio:"pipe"});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){if(!res.headersSent)res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4201,"127.0.0.1",resolve)});
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message||e)));
 const url="http://127.0.0.1:4201/previews/living-catena-messenger-editorial-integration-20261021.html";
 await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator(".aoCatenaMResearch").count(),0,
  "Normal Scripture reader must not show experimental editorial routes");
 await page.locator("[data-catena-source-question]").first().waitFor({state:"visible",timeout:15000});
 const sourceQuestion=page.locator("[data-catena-source-question]").first();
 assert.match(await sourceQuestion.getAttribute("data-catena-source-pointer"),/^catena\.matthew\./);
 const questionText=await sourceQuestion.innerText();
 const prior=await page.locator(".aoCatenaMUser").count();
 await sourceQuestion.click();
 assert.equal(await page.locator(".aoCatenaMUser").count(),prior+1);
 assert.ok((await page.locator(".aoCatenaMUser").last().innerText()).includes(questionText));
 assert.ok(await page.locator(".aoCatenaMMeta a[href^='https://www.ecatholic2000.com/']").count()>=1);
 assert.equal(await page.locator(".aoCatenaMResearchBadge").count(),0);
 for(const book of ["Mark","Luke","John"]){
  await page.goto(url+"?book="+book+"&passage=1:1",{waitUntil:"domcontentloaded",timeout:60000});
  await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
  assert.match(await page.locator(".aoCatenaMHead").innerText(),new RegExp(book+" 1:1"));
  assert.equal(await page.locator(".aoCatenaMResearch").count(),0);
  await page.locator("[data-catena-source-question]").first().waitFor({state:"visible",timeout:15000});
  const readerQuestion=page.locator("[data-catena-source-question]").first();
  await readerQuestion.click();
  assert.equal(await page.locator(".aoCatenaMUser").count(),1,
   "A source-attested question must work in the normal "+book+" Scripture Messenger");
  assert.ok(await page.locator(".aoCatenaMMeta a[href^='https://www.ecatholic2000.com/']").count()>0);
 }
 for(const spec of [
  {book:"Matthew",passage:"13:1",fragment:"catena.matthew.13.1:17"},
  {book:"Mark",passage:"1:1",fragment:"catena.mark.1.1:2"},
  {book:"Luke",passage:"15:11",fragment:"catena.luke.15.11:0"},
  {book:"John",passage:"1:1",fragment:"catena.john.1.1:0"}
 ]){
  await page.goto(url+"?book="+spec.book+"&passage="+spec.passage,
   {waitUntil:"domcontentloaded",timeout:60000});
  await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:25000});
  const q=page.locator("[data-catena-curated-question]").first();
  await q.waitFor({state:"visible",timeout:15000});
  assert.equal(await q.getAttribute("data-catena-source-pointer"),spec.fragment);
  assert.ok(!(await q.innerText()).includes("What do the Fathers say about"),
   "The promoted question must be theological and specific");
  const before=await page.locator('.aoCatenaMRow[data-catena-fragment-id="'+spec.fragment+'"]').count();
  await q.click();
  assert.match(await page.locator(".aoCatenaMUser").last().innerText(),/Why|How|What/);
  await page.locator('.aoCatenaMRow[data-catena-fragment-id="'+spec.fragment+'"]')
   .waitFor({state:"visible",timeout:20000});
  const target=page.locator('.aoCatenaMRow[data-catena-fragment-id="'+spec.fragment+'"]');
  if(before){
   assert.ok((await target.getAttribute("class")).includes("aoCatenaMRevisited"));
  }else{
   assert.match(await target.locator(".aoCatenaMEvidence").innerText(),/READER QUESTION/);
  }
  assert.match(await target.locator(".aoCatenaMMeta a").getAttribute("href"),
   /^https:\/\/www\.ecatholic2000\.com\//);
  assert.equal(await page.locator(".aoCatenaMResearchBadge").count(),0);
  const overflowCurated=await page.locator(".aoCatenaMessenger").evaluate(el=>el.scrollWidth-el.clientWidth);
  assert.ok(overflowCurated<=2, "Theological question panel overflows phone on "+spec.book);
 }
 for(const spec of [
  {book:"Matthew",verse:"6:9",id:"mat-our-father",other:"catena.matthew.6.9:4",father:"Chrysostom"},
  {book:"Mark",verse:"14:22",id:"mark-real-body",other:"catena.mark.14.22:4",father:"Chrysostom"},
  {book:"Luke",verse:"10:38",id:"luke-martha-mary",other:"catena.luke.10.38:15",father:"Gregory"},
  {book:"John",verse:"20:19",id:"john-remit-sins",other:"catena.john.20.19:18",father:"Chrysostom"}
 ]){
  await page.goto(url+"?book="+spec.book+"&passage="+spec.verse,
    {waitUntil:"domcontentloaded",timeout:60000});
  await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:30000});
  const openQuestion=page.locator('[data-catena-curated-question="'+spec.id+'"]');
  await openQuestion.waitFor({state:"visible",timeout:15000});
  await openQuestion.click();
  const related=page.locator('[data-catena-companions-for="'+spec.id+'"]');
  await related.waitFor({state:"visible",timeout:15000});
  assert.match(await related.innerText(),/emphases may differ/i);
  const btn=related.locator('[data-catena-companion-pointer="'+spec.other+'"]');
  assert.equal(await btn.getAttribute("data-catena-companion-father"),spec.father);
  await btn.click();
  const other=page.locator('.aoCatenaMRow[data-catena-fragment-id="'+spec.other+'"]');
  await other.waitFor({state:"visible",timeout:15000});
  assert.ok((await other.locator(".aoCatenaMName").first().innerText()).includes(spec.father));
  assert.match(await other.locator(".aoCatenaMRelated").innerText(),
    /ANOTHER FATHER ON THIS PASSAGE.*DISTINCT SOURCE/);
  assert.match(await other.locator(".aoCatenaMMeta a").getAttribute("href"),
    /^https:\/\/www\.ecatholic2000\.com\//);
  assert.equal(await btn.isDisabled(),true);
  assert.ok((await page.locator(".aoCatenaMessenger").evaluate(el=>el.scrollWidth-el.clientWidth))<=2);
 }
 // Multi-turn exploration without resetting the Scripture passage or
 // duplicating previous question bubbles and source texts.
 await page.goto(url+"?book=Matthew&passage=6:9",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:25000});
 await page.locator('[data-catena-curated-question="mat-our-father"]').click();
 let nextPanel=page.locator('[data-catena-next-after="mat-our-father"]');
 await nextPanel.waitFor({state:"visible",timeout:15000});
 assert.equal(await nextPanel.locator("[data-catena-next-question]").count(),2);
 assert.equal(await page.locator('[data-catena-curated-question="mat-our-father"]').getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator(".aoCatenaMUser[data-catena-question-id]").count(),1);
 for(const target of await nextPanel.locator("[data-catena-next-source]").evaluateAll(xs=>xs.map(x=>x.dataset.catenaNextSource)))
  assert.ok(target.startsWith("catena.matthew.6.9:"),
   "Follow-up routes must not jump to an unrelated Gospel pericope");
 await nextPanel.locator('[data-catena-next-question="mat-prayer-adoption"]').click();
 await page.locator('[data-catena-next-after="mat-prayer-adoption"]').waitFor({state:"visible",timeout:15000});
 assert.equal(await page.locator('[data-catena-next-after]').count(),1,
  "Only the active question should suggest the next two replies");
 assert.equal(await page.locator(".aoCatenaMUser[data-catena-question-id]").count(),2);
 assert.equal(await page.locator('[data-catena-curated-question="mat-prayer-adoption"]').getAttribute("aria-pressed"),"true");
 const third=page.locator('[data-catena-next-question="mat-hallowed"]');
 await third.waitFor({state:"visible",timeout:15000});
 await third.click();
 assert.equal(await page.locator(".aoCatenaMUser[data-catena-question-id]").count(),3);
 const navigation=page.locator(".aoCatenaMNav");
 const history=page.locator('[data-catena-navigate="history"]');
 assert.equal(await history.innerText(),"History · 3");
 assert.equal(await history.isDisabled(),false);
 await history.click();
 assert.equal(await history.getAttribute("aria-expanded"),"true");
 assert.equal(await page.locator(".aoCatenaMHistory[hidden]").count(),0);
 assert.equal(await page.locator(".aoCatenaMHistory [data-catena-history-id]").count(),3);
 const firstHistory=page.locator('[data-catena-history-id="mat-our-father"]');
 assert.match(await firstHistory.innerText(),/Cyprian/);
 const beforeJump=await page.locator(".aoCatenaMUser[data-catena-question-id]").count();
 await firstHistory.click();
 assert.equal(await history.getAttribute("aria-expanded"),"false");
 assert.equal(await page.locator(".aoCatenaMUser[data-catena-question-id]").count(),beforeJump);
 assert.ok((await page.locator('.aoCatenaMRow[data-catena-fragment-id="catena.matthew.6.9:5"]')
  .getAttribute("class")).includes("aoCatenaMRevisited"));
 await page.locator('[data-catena-navigate="latest"]').click();
 assert.equal(await navigation.locator(".aoCatenaMHistory[hidden]").count(),1);
 await page.locator('[data-catena-navigate="questions"]').click();
 const questionPanel=page.locator(".aoCatenaMTopics");
 assert.equal(await questionPanel.isVisible(),true);
 assert.ok((await questionPanel.locator('[data-catena-curated-question="mat-our-father"]').count())===1);
 assert.equal(await page.locator(".aoCatenaMResearchBadge").count(),0);
 assert.ok(await page.locator(".aoCatenaMMeta a[href^='https://www.ecatholic2000.com/']").count()>=2);
 const repeated=page.locator('[data-catena-curated-question="mat-our-father"]');
 const beforeRepeated=await page.locator(".aoCatenaMUser[data-catena-question-id]").count();
 const beforePanels=await page.locator("[data-catena-next-after]").count();
 await repeated.click();
 assert.equal(await page.locator(".aoCatenaMUser[data-catena-question-id]").count(),beforeRepeated,
  "Revisited question must not insert a second user bubble");
 assert.equal(await page.locator("[data-catena-next-after]").count(),beforePanels,
  "Revisiting must not create a second follow-up panel");
 assert.equal(await page.locator('.aoCatenaMRow[data-catena-fragment-id="catena.matthew.6.9:5"]').count(),1,
  "Exact original source must remain unique within a Scripture session");
 assert.ok((await page.locator('.aoCatenaMRow[data-catena-fragment-id="catena.matthew.6.9:5"]')
  .getAttribute("class")).includes("aoCatenaMRevisited"));
 assert.ok((await page.locator(".aoCatenaMessenger").evaluate(el=>el.scrollWidth-el.clientWidth))<=2,
  "Continuing through questions must not overflow 390px phone width");

 await page.goto(url+"?research=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
 const panel=page.locator(".aoCatenaMResearch");
 assert.equal(await panel.isHidden(),true,"Research question panel must be opt-in");
 await page.getByRole("button",{name:"Browse research questions"}).click();
 await page.locator('[data-catena-research-question="b3-10"]').waitFor({state:"visible",timeout:20000});
 assert.match(await panel.innerText(),/all unapproved/i);
 await page.locator('[data-catena-research-question="b3-10"]').click();
 await page.locator(".aoCatenaMResearchBadge").first().waitFor({state:"visible",timeout:30000});
 assert.match(await page.locator(".aoCatenaMResearchBadge").first().innerText(),/NOT A VERIFIED ANSWER/);
 const feed=await page.locator(".aoCatenaMFeed").innerText();
 assert.ok(feed.includes("Cyprian")&&feed.includes("Augustine"),
  "A comparison must keep the separate inherited author attributions");
 assert.ok(await page.locator(".aoCatenaMMeta a[href^='https://www.ecatholic2000.com/']").count()>=2);
 const overflow=await page.locator(".aoCatenaMessenger").evaluate(e=>e.scrollWidth-e.clientWidth);
 assert.ok(overflow<=2,"Messenger phone panel overflows horizontally by "+overflow);
 await page.goto(url+"?passage=11:28&research=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".aoCatenaMessenger").waitFor({state:"visible",timeout:20000});
 await page.getByRole("button",{name:"Browse research questions"}).click();
 await page.locator('[data-catena-research-question="catena.matthew.11.28:1"]').waitFor({state:"visible",timeout:20000});
 await page.locator('[data-catena-research-question="catena.matthew.11.28:1"]').click();
 await page.locator(".aoCatenaMFeed .aoCatenaMNotice").last().waitFor({state:"visible",timeout:25000});
 assert.match(await page.locator(".aoCatenaMFeed").innerText(),/not a standalone answer/i);
 assert.match(await page.locator(".aoCatenaMFeed").innerText(),/HUMAN APPROVAL PENDING/);
 await page.goto(url+"?passage=27:45&research=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator('[data-catena-fragment-id="catena.matthew.27.45:1"]').waitFor({state:"visible",timeout:20000});
 const split=page.locator('[data-catena-fragment-id="catena.matthew.27.45:1"]');
 assert.equal(await split.locator(".aoCatenaMResearchOwner").count(),2);
 assert.match(await split.innerText(),/Pseudo-Dionysius/);
 assert.match(await split.innerText(),/Origen/);
 assert.equal(await split.locator(".aoCatenaMName").first().innerText(),"MULTIPLE PRINTED ATTRIBUTIONS");
 // Editor-facing workbench: the 22/8 review queue remains outside the public app.
 const editorUrl="http://127.0.0.1:4201/previews/living-catena-editorial-workbench-20261021.html";
 await page.goto(editorUrl,{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator("#candidateList .candidate").first().waitFor({state:"visible",timeout:16000}).catch(async error=>{
  const workspace=await page.locator("#workspace").innerText().catch(()=>"<missing>");
  const counts=await page.locator("#countText").innerText().catch(()=>"<missing>");
  const responses=await page.locator("body").innerText().catch(()=>"<missing>");
  throw Error("Workbench startup failed: "+String(error)+"; count="+counts+
    "; workspace="+workspace+"; errors="+JSON.stringify(errors)+"; page="+responses.slice(0,1000));
 });
 assert.equal(await page.locator("#candidateList .candidate").count(),9);
 await page.locator('[data-focused-source="english-parallel-checked"]').waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator('[data-focused-source="english-parallel-checked"]').count(),1);
 assert.match(await page.locator('[data-focused-source="english-parallel-checked"]').innerText(),/FOCUSED EDITORIAL CHECK/);
 await page.locator('[data-filter="ready"]').click();
 assert.equal(await page.locator("#candidateList .candidate").count(),22);
 await page.locator(".source .body").first().waitFor({state:"visible",timeout:20000});
 assert.ok((await page.locator(".source .body").first().innerText()).length>50);
 assert.equal(await page.locator('[data-original-work-evidence="translated-parallel-found"]').count(),1);
 assert.match(await page.locator('[data-original-work-evidence="translated-parallel-found"]').innerText(),
  /english translation/i);
 assert.match(await page.locator('[data-original-work-evidence="translated-parallel-found"] a').getAttribute("href"),
  /^https:\/\/www\.newadvent\.org\/fathers\//);
 assert.equal(await page.locator('#reviewForm input[type="checkbox"]:checked').count(),0,
  "External translated work links must not pre-certify any source attestation");
 await page.locator('[data-filter="escalated"]').click();
 assert.equal(await page.locator("#candidateList .candidate").count(),8);
 await page.locator('[data-original-work-evidence="not-located"]').waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator('[data-original-work-evidence="not-located"]').count(),1,
  "At least one escalated source must display missing original-work status");
 assert.equal(await page.locator("#review-disposition option[value='approve']").count(),0,
  "An escalated source cannot receive an approval proposal");
 await page.locator('[data-filter="ready"]').click();
 await page.locator(".source .body").first().waitFor({state:"visible",timeout:25000});
 assert.equal(await page.locator("#candidateList .candidate").count(),22);
 await page.locator("#review-reviewer").fill("Source editor");
 await page.locator("#review-editorialReason").fill("The original source still requires contextual verification by an independent editor.");
 await page.locator("#review-disposition").selectOption("hold");
 await page.locator('#reviewForm button[type="submit"]').click();
 assert.match(await page.locator("#decisionStatus").innerText(),/stored locally/i);
 const sourceDraft=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-catena-matthew-human-review-local-draft-v1")));
 assert.ok(Object.values(sourceDraft.decisions).some(x=>x.disposition==="hold"));
 const downloadPromise=page.waitForEvent("download");
 await page.locator("#download").click();
 const download=await downloadPromise;
 assert.equal(download.suggestedFilename(),"catena-matthew-editorial-review-export.json");
 // The existing editorial workbench now also houses ten Mark research-only
 // sources, with no publication form and no public Messenger route promotion.
 await page.locator('[data-filter="mark"]').click();
 await page.locator('[data-mark-pointer="catena.mark.6.45:11"]').waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator("#candidateList [data-mark-pointer]").count(),10);
 await page.locator('[data-mark-canonical-source="catena.mark.6.45:11"]')
  .waitFor({state:"visible",timeout:20000});
 assert.ok((await page.locator('[data-mark-canonical-source] .body').first().innerText()).length>60);
 assert.equal(await page.locator("#reviewForm").count(),0);
 assert.equal(await page.locator("#download").isDisabled(),true);
 await page.locator('[data-mark-pointer="catena.mark.10.17:19"]').click();
 await page.locator('[data-mark-canonical-source="catena.mark.10.17:19"]')
  .waitFor({state:"visible",timeout:20000});
 assert.match(await page.locator('[data-mark-research-witness]').innerText(),/Zacchaeus/);
 assert.equal(await page.locator('[data-mark-editorial-assessment="3"]').count(),1);
 assert.match(await page.locator('[data-mark-editorial-assessment]').innerText(),/AI contextual grade 3/);
 assert.doesNotMatch(await page.locator('[data-mark-canonical-source] .body').innerText(),/Zacchaeus/);
 await page.locator('[data-mark-pointer="catena.mark.14.17:2"]').click();
 await page.locator('[data-mark-research-witness="only_secondary_work_attribution_excerpt_found"]')
  .waitFor({state:"visible",timeout:20000});
 assert.match(await page.locator('[data-mark-research-witness]').innerText(),/secondary/i);
 assert.equal(await page.locator('[data-mark-editorial-assessment="2"]').count(),1);
 assert.match(await page.locator('[data-mark-editorial-assessment]').innerText(),/human approval pending/i);
 assert.ok(await page.locator('[data-mark-editorial-assessment] details').count()>0);
 assert.equal(await page.locator("#reviewForm").count(),0);
 await page.locator('[data-mark-pointer="catena.mark.16.14:3"]').click();
 await page.locator('[data-mark-editorial-assessment="2"]').waitFor({state:"visible",timeout:20000});
 assert.match(await page.locator('[data-mark-research-witness]').innerText(),/pre-Ascension/);
 await page.locator("#markQuestion").fill("Did Theophylact prove Christ certainly ate the Passover twice?");
 await page.locator('#markLookup button[type="submit"]').click();
 assert.match(await page.locator("#workspace").innerText(),/No Father reply has been supplied or inferred/);
 assert.equal(await page.locator("#workspace .source .body").count(),0);
 await page.locator("#markQuestion").fill("Why does the Last Supper depict reclining if the Passover required standing?");
 await page.locator('#markLookup button[type="submit"]').click();
 await page.locator('[data-mark-canonical-source="catena.mark.14.17:2"]')
  .waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator("#reviewForm").count(),0);
 assert.ok((await page.locator("body").evaluate(el=>el.scrollWidth-el.clientWidth))<=2,
   "Mark editorial source overflows 390px phone width");
 await page.locator('[data-filter="blind"]').click();
 await page.locator('[data-blind-case="MARK_BLIND_01"]').waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator('#candidateList [data-blind-case]').count(),23);
 assert.equal(await page.locator('#blindPanel').isVisible(),true);
 assert.equal(await page.locator('#download').isDisabled(),true);
 assert.equal(await page.locator('[data-mark-editorial-assessment]').count(),0,
  "Blind review must hide the researcher AI grade and source-target information");
 await page.locator('#blindReviewer').fill('Blind Editor Alpha');
 await page.locator('#blindChooseReviewer').click();
 await page.locator('[data-blind-case="MARK_BLIND_07"]').click();
 await page.locator('#blindForm [data-blind-grade]').first().waitFor({state:"visible",timeout:20000});
 assert.ok(await page.locator('#blindForm [data-blind-grade]').count()>=1);
 assert.equal(await page.locator('[data-mark-editorial-assessment]').count(),0);
 assert.ok((await page.locator('#blindForm .source .body').first().innerText()).length>50);
 await page.locator('#blindForm [data-blind-grade]').first().selectOption('1');
 const gradeCount=await page.locator('#blindForm [data-blind-grade]').count();
 for(let i=0;i<gradeCount;i++){
  if(i>0)await page.locator('#blindForm [data-blind-grade]').nth(i).selectOption('1');
  await page.locator('#blindForm .source textarea').nth(i).fill(
   'Synthetic browser regression review only. No independent theological relevance is certified.');
 }
 await page.locator('#blindOverall').fill('Synthetic browser-review grading, used to confirm submission and export restrictions.');
 await page.locator('#blindForm button[type="submit"]').click();
 assert.match(await page.locator('#blindDecisionStatus').innerText(),/saved in this reviewer/);
 assert.match(await page.locator('#countText').innerText(),/1\/23/);
 await page.locator('[data-blind-case="MARK_BLIND_02"]').click();
 await page.locator('#blindAbstention').waitFor({state:"visible",timeout:20000});
 await page.locator('#blindAbstention').selectOption('uncertain');
 await page.locator('#blindOverall').fill('This is a synthetic abstention review; the actual relevance remains unassessed.');
 await page.locator('#blindForm button[type="submit"]').click();
 assert.match(await page.locator('#countText').innerText(),/2\/23/);
 const blindDownload=page.waitForEvent('download');
 await page.locator('#blindExport').click();
 const blindExportFile=await blindDownload;
 assert.match(blindExportFile.suggestedFilename(),/catena-mark-blind-Blind_Editor_Alpha\.json/);
 assert.match(await page.locator('#blindStatus').innerText(),/2\/23 case grades exported/);
 await page.locator('#blindReviewer').fill('Blind Editor Beta');
 await page.locator('#blindChooseReviewer').click();
 assert.match(await page.locator('#countText').innerText(),/0\/23/);
 assert.equal(await page.locator('#reviewForm').count(),0,
  "Blind editorial scoring is not Matthew approval or Mark publication");
 assert.ok((await page.locator('body').evaluate(el=>el.scrollWidth-el.clientWidth))<=2);
 await page.locator('[data-filter="focus"]').click();
 await page.locator('[data-focused-source="english-parallel-checked"]')
  .waitFor({state:"visible",timeout:20000});
 assert.equal(await page.locator("#download").isDisabled(),false);

 // A source-verified, single-file packet should work directly via file://,
 // with no repository web server, build process, or external CSS/JS.
 const offline=pathToFileURL(resolve(root,"dist/catena-mark-blind-review-offline.html")).href;
 await page.goto(offline,{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator("#caseDetail h2").waitFor({state:"visible",timeout:15000});
 assert.equal(await page.locator("#cases option").count(),23);
 const packet=await page.evaluate(()=>JSON.parse(document.getElementById("catenaPacket").textContent));
 assert.equal(packet.cases.length,23);
 assert.ok(packet.cases.every(c=>!Object.hasOwn(c,"targetSourcePointer")&&
  !Object.hasOwn(c,"aiGrade")));
 assert.equal(await page.locator('script[src]').count(),0);
 const picked=packet.cases.findIndex(c=>c.results.length>0);
 const silent=packet.cases.findIndex(c=>c.results.length===0);
 assert.ok(picked>=0&&silent>=0);
 await page.locator("#reviewer").fill("Independent External Reviewer A");
 await page.locator("#cases").selectOption(String(picked));
 await page.locator("#reviewForm > article.case").first().waitFor({state:"visible",timeout:15000});
 const retrieved=await page.locator("#reviewForm > article.case").count();
 assert.equal(retrieved,packet.cases[picked].results.length,
  "Only genuinely retrieved Messenger excerpts may be graded; canonical context is reference-only");
 assert.ok(retrieved>=1&&retrieved<=4);
 for(let i=0;i<retrieved;i++){
  const card=page.locator("#reviewForm > article.case").nth(i);
  await card.locator("select").selectOption("1");
  await card.locator("textarea").fill("Source excerpt preserved, but independent theological relevance remains unverified.");
 }
 await page.locator("#reviewForm > textarea").fill("Source review example, not an attested human editorial judgment or publication approval.");
 await page.locator('#reviewForm button[type="submit"]').click();
 assert.match(await page.locator("#progress").innerText(),/1 of 23/);
 await page.locator("#cases").selectOption(String(silent));
 await page.locator("#reviewForm select[data-abstain]").waitFor({state:"visible",timeout:15000});
 const canonicalContext=page.locator('#reviewForm details[data-full-pericope-context]');
 assert.equal(await canonicalContext.count(),1);
 await canonicalContext.locator('summary').click();
 assert.ok(await canonicalContext.locator('article.case').count()>0,
  "An abstention reviewer must be able to read the whole canonical pericope");
 assert.match(await canonicalContext.locator('summary').innerText(),/NOT a retrieved answer/);
 assert.equal(await page.locator('#reviewForm > article.case').count(),0,
  "Complete context must not be mistaken for retrieved answers");
 await page.locator("#reviewForm select[data-abstain]").selectOption("uncertain");
 await page.locator("#reviewForm > textarea").fill("No-source result assessed only as a synthetic regression of the offline reviewer interface.");
 await page.locator('#reviewForm button[type="submit"]').click();
 assert.match(await page.locator("#progress").innerText(),/2 of 23/);
 const offlineDownload=page.waitForEvent("download");
 await page.locator("#export").click();
 const exported=await offlineDownload;
 assert.match(exported.suggestedFilename(),/catena-mark-blind-Independent_External_Reviewer_A\.json/);
 const raw=await readFile(await exported.path(),"utf8");
 const decision=JSON.parse(raw);
 assert.equal(decision.completedCases,2);
 assert.equal(decision.publicationApproval,false);
 assert.equal(decision.mayAutoPromoteToMessenger,false);
 await page.reload({waitUntil:"domcontentloaded"});
 assert.match(await page.locator("#progress").innerText(),/0 of 23/);
 await page.locator("#import").setInputFiles({name:"review-progress.json",
  mimeType:"application/json",buffer:Buffer.from(raw)});
 assert.match(await page.locator("#progress").innerText(),/2 of 23/);
 assert.equal(await page.locator("#reviewer").inputValue(),"Independent External Reviewer A");
 await page.locator("#reviewer").fill("Independent External Reviewer B");
 await page.locator("#reviewer").dispatchEvent("change");
 assert.equal(await page.locator("#reviewer").inputValue(),"Independent External Reviewer A",
  "A reviewer cannot silently reassign another person's offline draft");
 assert.ok((await page.locator("body").evaluate(el=>el.scrollWidth-el.clientWidth))<=2);
 assert.deepEqual(errors,[],"Messenger and editorial workbench browser runtime errors");
 console.log("PASS: opt-in research question Messenger phone flow, source labels, author boundary and no overflow");
}finally{
 await browser?.close?.();
 await new Promise(resolve=>server.close(resolve));
}
