import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

const path=resolve('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html');
const html=readFileSync(path,'utf8');
const match=html.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
assert(match,'missing source-owned corpus');
const c=JSON.parse(match[1]);
assert.equal(c.chapters.length,106);
assert.equal(c.counts.allNodes,423);
assert.equal(c.approvals.publishing,false);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
  await page.goto(pathToFileURL(path).href,{waitUntil:'load'});
  await page.locator('#spxc-launch').click();
  assert.equal(await page.locator('#spxc-ask-form').count(),1,'free-question prompt on welcome screen');
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  const ask=async question=>{
   await page.locator('#spxc-ask-input').fill(question);
   await page.locator('#spxc-ask-form button[type=submit]').click();
  };
  await ask('where is that from');
  assert.equal(await page.locator('.spxc-cite').count(),1,'source request uses original citation drawer');
  await page.locator('.spxc-cite-close').click();
  await ask('shorter please');
  assert.equal(await page.locator('.spxc-ask-short').count(),1,'shorter version comes from preserved prior text');
  const exact=await page.locator('.spxc-turn h3').first().innerText();
  await ask(exact);
  assert.match(await page.locator('.spxc-ask-result').innerText(),/Existing editorial answer displayed/);
  await ask(exact+' please explain');
  assert.match(await page.locator('.spxc-ask-result').innerText(),/Choose one of these documented questions/);
  assert((await page.locator('[data-spxc-ask-pick]').count())>0,'requires explicit selection for inferred matches');
  await page.locator('[data-spxc-ask-pick]').first().click();
  assert.equal(await page.locator('.spxc-turn').count()>=1,true);
  await ask('zzzzqqqq vvvvxxxx impossiblemadeup');
  assert.match(await page.locator('.spxc-ask-result').innerText(),/No documented question was confidently located/);
  assert.equal(await page.locator('[data-spxc-ask-pick]').count(),0,'no unsupported inferred answer');
  await page.locator('#spxc-lang').click();
  await ask('quelle est la source');
  assert.equal(await page.locator('.spxc-cite').count(),1,'French follow-up opens the existing source');
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  await page.locator('.spxc-cite-close').click();
  assert.deepEqual(errors,[],'browser errors');
  assert.deepEqual(external,[],'offline operation');
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_106_FREE_ASK: documented exact search, conservative suggestions, contextual source/shorter, EN/FR, offline, no generated answers');
