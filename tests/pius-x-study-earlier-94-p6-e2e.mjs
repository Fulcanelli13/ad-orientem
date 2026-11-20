import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const out='artifacts/pius-x-study-expanded/';
const parse=(f)=>{
 const h=readFileSync(out+f,'utf8');
 const m=h.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
 assert(m,'missing corpus '+f);
 return {html:h,corpus:JSON.parse(m[1])};
};
const baseline=parse('SPX_Study_Expanded_106.html');
const p6=parse('SPX_Study_Expanded_106_P6.html');
const b=baseline.corpus,r=p6.corpus;
assert.equal(b.chapters.length,106);
assert.equal(r.chapters.length,106);
assert.equal(r.counts.allNodes,423);
assert.equal(r.counts.p6VoiceReview.chapters,12);
assert.equal(r.counts.p6VoiceReview.answerPairs,22);
assert.equal(r.approvals.publishing,false);
const expected=[
 'SPX-PILOT-01','SPX-PILOT-08','SPX-PILOT-09','SPX-EXP-021',
 'SPX-EXP-027','SPX-EXP-028','SPX-EXP-037','SPX-EXP-043',
 'SPX-029','SPX-032','SPX-034','SPX-035'
].sort();
const changed=new Set(),changedSubjects=new Set();
for(let i=0;i<106;i++){
 const old=b.chapters[i],now=r.chapters[i];
 assert.equal(old.id,now.id);
 assert.deepEqual(old.source,now.source);
 assert.equal(old.nodes.length,now.nodes.length);
 for(let j=0;j<old.nodes.length;j++){
  const before=old.nodes[j],after=now.nodes[j];
  if(!after.p6VoiceReview){assert.deepEqual(after,before,'unselected node changed '+old.id+' '+j);continue;}
  assert(i<94,'P6 altered supplementary chapter '+old.id);
  changed.add(after.id);changedSubjects.add(old.id);
  assert.deepEqual(after.previousEditorialDraft,before.a,'older expanded draft must be retained');
  assert(after.a.en&&after.a.fr);
  assert.notEqual(after.a.en,before.a.en);
  assert(after.approvedReply===false&&after.publicationEligible===false);
  assert.equal(after.p6SourceClass,'PAPAL_DOCUMENT_ADAPTATION_NOT_QUOTE');
  if(j===0)assert(after.sourceDrawerNote?.en&&after.sourceDrawerNote?.fr);
  assert(!/\bavatar\b/i.test(after.a.en+' '+after.a.fr));
  assert(!/^In (E supremi|Acerbo nimis|Haerent animo|Il fermo proposito|Tra le sollecitudini)/.test(after.a.en));
  const restored={...after,a:before.a};
  if('approvedReply' in before)restored.approvedReply=before.approvedReply;
  else delete restored.approvedReply;
  if('publicationEligible' in before)restored.publicationEligible=before.publicationEligible;
  else delete restored.publicationEligible;
  delete restored.previousEditorialDraft;delete restored.p6VoiceReview;
  delete restored.p6SourceClass;
  if(before.sourceDrawerNote===undefined)delete restored.sourceDrawerNote;
  else restored.sourceDrawerNote=before.sourceDrawerNote;
  assert.deepEqual(restored,before,'source metadata unexpectedly mutated '+after.id);
 }
}
assert.equal(changed.size,22);
assert.deepEqual([...changedSubjects].sort(),expected);
assert.deepEqual(r.chapters.slice(94),b.chapters.slice(94));
const ledger=JSON.parse(readFileSync(out+'SPX_106_P6_Source_Closure_Ledger.json','utf8'));
assert.equal(ledger.entries.length,106);
assert.equal(ledger.counts.nodes,423);
assert.equal(ledger.counts.verifiedOriginalPassageExcerpts,0);
assert.equal(ledger.entries.filter(x=>x.p6VoiceReview).length,12);
assert.equal(ledger.entries.flatMap(e=>e.allTurnNodes).filter(n=>n.p6PreviousEditorialDraftPreserved).length,22);
assert(ledger.entries.every(x=>x.publicationEligible===false));
assert(!/<script[^>]+src=/.test(p6.html));
assert(!/<link[^>]+https?:\/\//.test(p6.html));
mkdirSync(out+'review-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],requests=[];
  page.on('pageerror',err=>errors.push(String(err)));
  page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url())});
  await page.goto(pathToFileURL(resolve(out+'SPX_Study_Expanded_106_P6.html')).href,{waitUntil:'load'});
  assert.match(await page.locator('#spxc-launch').innerText(),/106/);
  await page.locator('#spxc-launch').click();
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  assert.match(await page.locator('.spxc-answer').first().innerText(),/We did not go to the throne of Peter/);
  assert.equal(await page.locator('details.spxc-original').count()>=1,true);
  assert.match(await page.locator('details.spxc-original summary').first().innerText(),/Compare previous editorial wording/);
  await page.locator('[data-spxc-source]').first().click();
  assert.match(await page.locator('.spxc-cite').innerText(),/private conclave conversations/);
  await page.locator('.spxc-cite-close').click();
  await page.locator('#spxc-lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.match(await page.locator('.spxc-answer').first().innerText(),/Nous ne sommes point monté/);
  // P1a: the existing authored dialogue, not new AI speech, controls stage presence.
  assert.equal(await page.locator('#spxc-portrait').getAttribute('data-expression')!== 'none',true);
  await page.locator('.spxc-choice').first().click();
  assert.equal(await page.locator('.spxc-turn').count(),2);
  assert.equal(await page.locator('#spxc-portrait').getAttribute('data-expression'),'explaining');
  const chosenQuestion=await page.locator('.spxc-turn h3').last().innerText();
  await page.locator('[data-spxc-index]').first().click();
  // Navigate away and return: the exact selected branch and language survive in-session.
  if(width===390)await page.locator("#spxc-menu").click();
  await page.locator('#spxc-nav [data-spxc-open="SPX-009"]').first().click();
  assert.equal(await page.locator('[data-spxc-return]').count(),1);
  await page.locator('[data-spxc-return]').click();
  assert.equal(await page.locator('.spxc-turn').count(),2);
  assert.equal(await page.locator('.spxc-turn h3').last().innerText(),chosenQuestion);
  assert.equal(await page.locator('#spxc-portrait').getAttribute('data-expression'),'explaining');
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  await page.locator('[data-spxc-source]').last().click();
  assert.equal(await page.locator('#spxc-portrait').getAttribute('data-expression'),'thoughtful');
  await page.locator('.spxc-cite-close').click();
  assert.equal(await page.locator('#spxc-portrait').getAttribute('data-expression'),'explaining');
  await page.screenshot({path:out+'review-screenshots/'+width+'-p6-106-study.png'});
  assert.deepEqual(errors,[],'browser JS errors');
  assert.deepEqual(requests,[],'not offline');
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_P6_BROWSER 106 subjects 423 answers 22 P6 bilingual rewrites, original 106 preserved, no network');
