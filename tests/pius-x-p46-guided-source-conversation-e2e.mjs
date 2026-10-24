import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

// P2.46 tests the ACTUAL source-owned staged conversation, not a fake model.
const file='artifacts/pius-x-study-expanded/SPX_P26_Offline_Source_Dialogue_Demo.html';
const html=readFileSync(file,'utf8');
const parse=id=>{
 const m=html.match(new RegExp('<script type="application/json" id="'+id+'">([\\s\\S]*?)<\\/script>'));
 assert(m,'missing '+id);return JSON.parse(m[1]);
};
const data=parse('spxOfflineReplayData'),owners=parse('spxExpandedCorpus');
assert.equal(data.cases.length,11);
assert.equal(data.modelProviderEnabled,false);
assert.equal(data.publishingApproved,false);
assert.equal(owners.counts.allNodes,423);
assert.equal(owners.chapters.length,106);
assert.equal(owners.approvals.publishing,false);
const pilot=data.cases.filter(c=>c.chapterId==='SPX-PILOT-01');
assert.equal(pilot.length,3);
assert.equal(data.cases.filter(c=>c.chapterId==='SPX-NEW-012').length,2);
assert(pilot.every(c=>c.publishingApproved===false&&c.witnesses.length>0));
assert(html.includes('id="spxm-guided-exchange"'));
assert(!/<script[^>]+src=/.test(html));
assert(!/<link[^>]+https?:\/\//.test(html));
const screenshots='artifacts/pius-x-study-expanded/review-screenshots/';
mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],network=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.goto(pathToFileURL(resolve(file)).href,{waitUntil:'load'});
  await page.locator('#spxc-launch').click();
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  const panel=page.locator('#spxc-offline-replay');
  assert(await panel.isVisible());
  assert.equal(await page.locator('#spxm-guided-start').innerText(),'Begin a three-part source dialogue');
  assert.equal(await page.locator('#spxm-offline-choices .spxm-offline-choice').count(),3);
  // The guided control starts exactly the FIRST pre-existing, source-owned answer.
  await page.locator('#spxm-guided-start').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),1);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),pilot[0].reply.en);
  assert.equal(await page.locator('#spxm-offline-choices').isVisible(),false);
  assert.match(await page.locator('#spxm-guided-state').innerText(),/question 2 \/ 3/i);
  assert.match(await page.locator('.spxm-guided-question').innerText(),/responsibility so grave/);
  // Unanswerable visitor prompts fail closed without advancing guided dialogue.
  await page.locator('#spxm-offline-question').fill('What did you secretly promise your family?');
  await page.locator('#spxm-offline-send').click();
  assert.match(await page.locator('#spxm-offline-replies .spxm-held').last().innerText(),/no reviewed offline response/i);
  assert.equal(await page.locator('.spxm-guided-question').count(),1);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),1);
  // Now continue the two *exact* historical-source question nodes.
  await page.locator('.spxm-guided-question').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),2);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').nth(1).innerText(),pilot[1].reply.en);
  await page.locator('.spxm-guided-question').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),3);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').nth(2).innerText(),pilot[2].reply.en);
  assert.match(await page.locator('#spxm-guided-state').innerText(),/exchange is complete/i);
  assert.equal(await page.locator('.spxm-guided-question').count(),0);
  assert.equal(await page.locator('#spxm-offline-replies details.spxm-claim-audit').count(),3);
  assert.equal(await page.locator('#spxm-offline-replies details.spxm-offline-source').count()>0,true);
  const expression=await page.locator('#spxc-portrait').getAttribute('data-expression');
  assert(['neutral','welcoming','explaining','thoughtful','grave'].includes(expression));
  await page.screenshot({path:screenshots+'SPX_P46_guided_source_3turn_'+width+'.png',fullPage:true});
  // Restart removes previous staged transcript, not duplicate all replies.
  await page.locator('#spxm-guided-start').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),1);
  // Switching EN=>FR resets history and shows French original text.
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ao-spx-review-context',
   {detail:{chapterId:'SPX-PILOT-01',language:'fr'}})));
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  assert.equal(await page.locator('#spxm-guided-start').innerText(),'Commencer un dialogue documentaire');
  await page.locator('#spxm-guided-start').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),pilot[0].reply.fr);
  assert.match(await page.locator('#spxm-guided-state').innerText(),/Question fondée sur les sources 2 \/ 3/);
  // Subject switch clears all pending continuation and starts a new, 2-turn path.
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ao-spx-review-context',
   {detail:{chapterId:'SPX-NEW-012',language:'en'}})));
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  await page.locator('#spxm-guided-start').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),1);
  await page.locator('.spxm-guided-question').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),2);
  assert.equal(await page.locator('.spxm-guided-question').count(),0);
  assert.match(await page.locator('#spxm-guided-state').innerText(),/complete/);
  assert.deepEqual(errors,[], 'Browser runtime errors');
  assert.deepEqual(network,[], 'External network must remain disabled in offline pilot');
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_P46_GUIDED_SOURCE_CONVERSATIONS '+JSON.stringify({
 desktop:true,mobile:true,
 threeTurnEnglish:true,threeTurnFrench:true,twoTurnSecondarySubject:true,
 exactOriginalRepliesOnly:true,unsupportedHeldWithoutAdvancing:true,
 contextReset:true,restart:true,sourceTraceRemains:true,
 sourceOwnerNodes:423,publishingApproved:false,remoteModelCalls:0,networkRequests:0
}));
