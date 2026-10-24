import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

const out='artifacts/pius-x-study-expanded/';
const file=out+'SPX_P26_Offline_Source_Dialogue_Demo.html';
const html=readFileSync(file,'utf8');
const parsed=html.match(/<script type="application\/json" id="spxOfflineReplayData">([\s\S]*?)<\/script>/);
const owner=html.match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
assert(parsed&&owner,'Original P6 corpus and review data must remain separately accessible');
const data=JSON.parse(parsed[1]),corpus=JSON.parse(owner[1]);
assert.equal(data.schema,'AO_SPX_P26_OFFLINE_REVIEW_CASES_V1');
assert.equal(data.status,'PRIVATE_STATIC_NO_MODEL_INFERENCE');
assert.equal(data.modelProviderEnabled,false);
assert.equal(data.publishingApproved,false);
assert.equal(data.canonicalChapters,4);
assert.equal(data.canonicalNodes,11);
assert.equal(data.bilingualEditorialPairs,22);
assert.equal(data.originalWitnessFragments,18);
assert.equal(data.originalCorpusNodes,423);
assert.equal(data.claimTraceUnits,23);
assert.equal(data.sourceGateSize,144);
assert(data.sourceDossierCount>75);
assert.equal(data.sourceDossiers.length,data.sourceDossierCount);
assert.equal(data.sourceDossierHeld.length,data.sourceDossierHeldCount);
assert.equal(data.sourceDossierCount+data.sourceDossierHeldCount+data.cases.length,144);
assert.equal(new Set(data.sourceDossiers.map(x=>x.nodeId)).size,data.sourceDossierCount);
assert.equal(new Set(data.sourceDossiers.map(x=>x.chapterId)).size,data.sourceDossierChapterCount);
const sourceWitnesses=new Set();
for(const dossier of data.sourceDossiers){
 const chapter=corpus.chapters.find(c=>c.id===dossier.chapterId);
 const node=chapter?.nodes.find(n=>n.id===dossier.nodeId);
 assert(chapter&&!chapter.partial&&chapter.sourceClass==='PAPAL_DOCUMENT_ADAPTATION');
 assert(node);
 assert.deepEqual(dossier.question,node.q);
 assert.equal(dossier.answerApproved,false);
 assert.equal(dossier.publicationApproved,false);
 assert.equal(dossier.status,'ORIGINAL_EXCERPT_RESEARCH_ONLY_NO_EDITORIAL_ANSWER');
 assert(dossier.originalWitnesses.length>0);
 assert(!('reply' in dossier)&&!('answer' in dossier),
  'Unreviewed full P6 answer was copied into source-only dossier');
 for(const w of dossier.originalWitnesses){
  assert(['la','it'].includes(w.originalLanguage));
  assert(w.sourceUrl.startsWith('https://www.vatican.va/'));
  assert(w.editorialResearchNoteEnglish.length>=4);
  assert(w.originalText.length>=8);
  assert.equal(w.answerCertified,false);
  assert.equal(w.translationCertified,false);
  sourceWitnesses.add(w.id);
 }
}
assert.equal(sourceWitnesses.size,data.sourceDossierDistinctFragments);
assert.equal(data.humanClaimCertifications,0);
assert.equal(data.navigationAliasCount,32);
assert.equal(data.navigationAliases.length,32);
assert.equal(data.navigationAliases.filter(x=>x.language==='en').length,16);
assert.equal(data.navigationAliases.filter(x=>x.language==='fr').length,16);
const aliasIds=new Set();
for(const x of data.navigationAliases){
 assert(!aliasIds.has(x.id));aliasIds.add(x.id);
 assert.equal(x.status,'NAVIGATION_SUGGESTION_ONLY_NOT_SOURCE_ANSWER_CERTIFIED');
 assert(data.cases.some(c=>c.nodeId===x.matchedNodeId&&c.chapterId===x.chapterId));
 assert(['en','fr'].includes(x.language));
 assert(x.question.length>8);
}
assert.equal(data.cases.length,11);
assert.equal(corpus.counts.allNodes,423);
assert.equal(corpus.chapters.length,106);
assert.equal(corpus.approvals.publishing,false);
assert(!/<script[^>]+src=/.test(html));
assert(!/<link[^>]+https?:\/\//.test(html));
assert(!html.includes('AO_SPX_MODEL_KEY'));
const keyed=new Set(data.cases.map(c=>c.nodeId));
assert.equal(keyed.size,11);
const seen=new Set(),seenClaims=new Set();
const splitSentences=text=>text.trim().split(/(?<=[.!?])\s+/u).filter(Boolean);
for(const row of data.cases){
 const chapter=corpus.chapters.find(c=>c.id===row.chapterId);
 const node=chapter?.nodes.find(n=>n.id===row.nodeId);
 assert(chapter&&node&&chapter.sourceClass==='PAPAL_DOCUMENT_ADAPTATION');
 assert.deepEqual(row.question,node.q);
 assert.equal(row.publishingApproved,false);
 assert.equal(row.fullClaimReviewCertified,false);
 assert.equal(row.bilingualTranslationsCertified,false);
 assert(row.reply.en.length>=85&&row.reply.fr.length>=85);
 const en=splitSentences(row.reply.en),fr=splitSentences(row.reply.fr);
 assert.equal(row.claimTrace.length,en.length);
 assert.equal(en.length,fr.length);
 const allowed=new Set(row.witnesses.map(x=>x.id));
 for(const [i,unit] of row.claimTrace.entries()){
  assert(!seenClaims.has(unit.id));seenClaims.add(unit.id);
  assert.equal(unit.ordinal,i+1);
  assert.deepEqual(unit.claim,{en:en[i],fr:fr[i]});
  assert.equal(unit.humanReviewApproved,false);
  assert.equal(unit.translationApproved,false);
  assert.equal(unit.verbatimPapalSpeech,false);
  assert.equal(unit.supportStatus,'EDITORIAL_SOURCE_MAPPING_PROVISIONAL_NOT_HUMAN_APPROVED');
  assert(unit.fragments.length>=1);
  for(const w of unit.fragments){
   assert(allowed.has(w.id),'Unlicensed witness in displayed sentence');
   assert.equal(w.speaker,'PIUS_X_AUTHOR');
   assert(w.sourceUrl.startsWith('https://www.vatican.va/'));
   assert.equal(w.sourceWebTextLines.length,2);
  }
 }
 for(const w of row.witnesses){
  assert(w.sourceUrl.startsWith('https://www.vatican.va/'));
  assert(['la','it'].includes(w.originalLanguage));
  assert.equal(w.speaker,'PIUS_X_AUTHOR');
  assert(w.text.length>=12);
  seen.add(w.id);
 }
}
assert.equal(seen.size,18);
assert.equal(seenClaims.size,23);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const screenshots=out+'review-screenshots/';
mkdirSync(screenshots,{recursive:true});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
  await page.goto(pathToFileURL(resolve(file)).href,{waitUntil:'load'});
  // The private replay panel is intentionally attached only when a documented
  // subject opens; it is not a homepage dashboard.
  assert.equal(await page.locator('#spxc-offline-replay').count(),0);
  await page.locator('#spxc-launch').click();
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('[data-spxc-open="SPX-PILOT-01"]').first().click();
  assert.equal(await page.locator('#spxc-offline-replay').count(),1);
  assert.equal(await page.locator('#spxc-offline-replay').isVisible(),true);
  assert.equal(await page.locator('.spxc-free-ask').isVisible(),false,
   'Four source-replay subjects must not show a competing free-question form');
  assert.equal(await page.locator('.spxm-offline-choice').count(),3);
  assert.match(await page.locator('#spxm-offline-example').innerText(),/Try different wording/);
  await page.locator('.spxm-offline-choice').first().click();
  const first=page.locator('#spxm-offline-replies .spxm-entry').first();
  await first.locator('.spxm-draft').waitFor();
  assert.equal(await first.locator('.spxm-draft').innerText(),
   data.cases.find(c=>c.chapterId==='SPX-PILOT-01').reply.en);
  assert.match(await first.locator('.spxm-warning').innerText(),
   /NOT THE VERBATIM WORDS OF ST PIUS X/);
  assert.equal(await first.locator('details.spxm-offline-source').count(),3);
  const evidenceMap=first.locator('details.spxm-claim-audit');
  assert.equal(await evidenceMap.count(),1);
  assert.match(await evidenceMap.locator('summary').innerText(),/sentence-by-sentence evidence/);
  await evidenceMap.locator('summary').click();
  assert.equal(await evidenceMap.locator('section.spxm-trace-unit').count(),2);
  assert.equal(await evidenceMap.locator('.spxm-trace-claim').first().innerText(),
   data.cases.find(c=>c.chapterId==='SPX-PILOT-01').claimTrace[0].claim.en);
  assert.match(await evidenceMap.locator('.spxm-trace-original').first().innerText(),
   /quibus Nos lacrymis/);
  assert.match(await evidenceMap.locator('.spxm-trace-caution').innerText(),
   /not an independently certified translation/);
  await first.locator('details.spxm-offline-source summary').first().click();
  assert.match(await first.locator('details.spxm-offline-source').first().innerText(),
   /quibus Nos lacrymis/);
  assert.equal(await first.locator('details.spxm-offline-source a').first().getAttribute('href'),
   'https://www.vatican.va/content/pius-x/la/encyclicals/documents/hf_p-x_enc_04101903_e-supremi.html');
  await page.locator('#spxm-offline-question').fill('Tell me something you never recorded about your family.');
  await page.locator('#spxm-offline-send').click();
  const second=page.locator('#spxm-offline-replies .spxm-entry').nth(1);
  assert.match(await second.locator('.spxm-held').innerText(),/no reviewed offline response/i);
  assert.equal(await second.locator('.spxm-draft').count(),0);
  // Navigation-only match must not silently answer a different question.
  await page.locator('#spxm-offline-question').fill('What does restoring everything in Christ mean in the cited passage?');
  await page.locator('#spxm-offline-send').click();
  const related=page.locator('#spxm-offline-replies .spxm-entry').nth(2);
  assert.match(await related.locator('.spxm-related-notice').innerText(),/may not answer every part/);
  assert.equal(await related.locator('.spxm-draft').count(),0);
  assert.match(await related.locator('.spxm-offline-related').innerText(),/What did you intend to do once you accepted/);
  await related.locator('.spxm-offline-related').click();
  const opened=page.locator('#spxm-offline-replies .spxm-entry').nth(3);
  await opened.locator('.spxm-draft').waitFor();
  assert.equal(await opened.locator('.spxm-draft').innerText(),
   data.cases.find(c=>c.nodeId==='AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_2').reply.en);
  assert.match(await opened.locator('details.spxm-offline-source').last().innerText(),/ES-8-CHRIST/);
  await page.locator('#spxc-lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'fr');
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  assert.equal(await page.locator('.spxm-offline-choice').count(),3);
  await page.locator('.spxm-offline-choice').first().click();
  const french=page.locator('#spxm-offline-replies .spxm-entry').first();
  await french.locator('.spxm-draft').waitFor();
  assert.equal(await french.locator('.spxm-draft').innerText(),
   data.cases.find(c=>c.chapterId==='SPX-PILOT-01').reply.fr);
  assert.match(await french.locator('.spxm-warning').innerText(),/NON PAROLES TEXTUELLES/);
  const evidenceFr=french.locator('details.spxm-claim-audit');
  await evidenceFr.locator('summary').click();
  assert.match(await evidenceFr.locator('summary').innerText(),/sources phrase par phrase/);
  assert.equal(await evidenceFr.locator('.spxm-trace-claim').first().innerText(),
   data.cases.find(c=>c.chapterId==='SPX-PILOT-01').claimTrace[0].claim.fr);
  assert.match(await evidenceFr.locator('.spxm-trace-caution').innerText(),/interprétation éditoriale/);
  await page.locator('#spxm-offline-question').fill('Que signifie tout restaurer dans le Christ dans ce texte ?');
  await page.locator('#spxm-offline-send').click();
  const suggestedFr=page.locator('#spxm-offline-replies .spxm-entry').nth(1);
  assert.match(await suggestedFr.locator('.spxm-related-notice').innerText(),/connexe/);
  assert.equal(await suggestedFr.locator('.spxm-draft').count(),0);
  await suggestedFr.locator('.spxm-offline-related').click();
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').count(),2);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-draft').last().innerText(),
   data.cases.find(c=>c.nodeId==='AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_2').reply.fr);
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('#spxc-nav [data-spxc-open="SPX-NEW-012"]').first().click();
  assert.equal(await page.locator('.spxm-offline-choice').count(),2);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-entry').count(),0);
  await page.locator('#spxm-offline-question').fill('Que signifie tout restaurer dans le Christ dans ce texte ?');
  await page.locator('#spxm-offline-send').click();
  assert.match(await page.locator('#spxm-offline-replies .spxm-held').first().innerText(),/aucune réponse hors ligne/i);
  assert.equal(await page.locator('#spxm-offline-replies .spxm-offline-related').count(),0);
  await page.locator('.spxm-offline-choice').first().click();
  assert.match(await page.locator('#spxm-offline-replies .spxm-draft').first().innerText(),
   /association fut supprimée/);
  await page.screenshot({path:screenshots+width+'-p26-offline-bilingual.png'});
  // Other subjects still own their original offline documented-question search.
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('#spxc-nav [data-spxc-open="SPX-EXP-001"]').first().click();
  assert.equal(await page.locator('#spxc-offline-replay').isVisible(),false);
  assert.equal(await page.locator('.spxc-free-ask').isVisible(),true);
  // Explore a genuinely additional, non-pilot original-text dossier. The
  // published P6 text remains in the original host, never used as evidence.
  const dossier=data.sourceDossiers.find(x=>!data.cases.some(c=>c.chapterId===x.chapterId));
  assert(dossier,'Expect source-only coverage outside the four dialogue pilots');
  if(width===390)await page.locator('#spxc-menu').click();
  await page.locator('#spxc-nav [data-spxc-open="'+dossier.chapterId+'"]').first().click();
  assert.equal(await page.locator('#spxc-primary-source-dossier').isVisible(),true);
  assert.equal(await page.locator('#spxc-offline-replay').isVisible(),false);
  assert.equal(await page.locator('.spxc-free-ask').isVisible(),false,
   'Source-only chapter must not default to unverified papal dialogue search');
  assert.equal(await page.locator('.spxc-turn').first().isVisible(),false,
   'Unreviewed legacy P6 reply must not be the default documentary answer');
  assert.equal(await page.locator('#spxp29-draft-toggle').getAttribute('aria-pressed'),'false');
  await page.locator('#spxp29-draft-toggle').click();
  assert.equal(await page.locator('.spxc-turn').first().isVisible(),true,
   'Earlier P6 editorial draft remains explicitly inspectable');
  assert.equal(await page.locator('.spxc-free-ask').isVisible(),true);
  assert.equal(await page.locator('#spxp29-draft-toggle').getAttribute('aria-pressed'),'true');
  await page.locator('#spxp29-draft-toggle').click();
  assert.equal(await page.locator('.spxc-turn').first().isVisible(),false);
  const count=data.sourceDossiers.filter(x=>x.chapterId===dossier.chapterId).length;
  assert.equal(await page.locator('.spxp29-source-question').count(),count);
  assert.equal(await page.locator('#spxp29-content .spxp29-original').count(),0);
  await page.locator('.spxp29-source-question').first().click();
  const expected=data.sourceDossiers.find(x=>x.chapterId===dossier.chapterId);
  assert.equal(await page.locator('#spxp29-content .spxp29-original').first().innerText(),
   expected.originalWitnesses[0].originalText);
  assert.match(await page.locator('#spxp29-content .spxp29-notice').innerText(),/Aucune réponse complète/);
  assert.equal(await page.locator('#spxp29-content .spxm-draft').count(),0);
  assert.equal(await page.locator('#spxp29-content a').first().getAttribute('href'),
   expected.originalWitnesses[0].sourceUrl);
  await page.locator('#spxc-lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.locator('#spxp29-content .spxp29-original').count(),0,
   'Switching language invalidates selected excerpt view');
  assert.equal(await page.locator('.spxp29-source-question').first().innerText(),
   expected.question.en);
  assert.equal(await page.locator('#spxp29-draft-toggle').getAttribute('aria-pressed'),'false',
   'Switching language returns to original-source-first, not legacy papal speech');
  assert.equal(await page.locator('.spxc-turn').first().isVisible(),false);
  assert.deepEqual(errors,[],'No inline script exceptions');
  assert.deepEqual(requests,[],'No external HTTP(S) network requests during offline replay');
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS SPX_P29_BROAD_SOURCE_DOSSIERS: source-only gate expansion,  23 provisional bilingual sentence traces, 32 navigation aliases + 11 reviewed question pairs,  one HTML, original 423 nodes, four papal chapters, 11 source-owned questions, 22 EN/FR responses, exact 18 Latin/Italian snippets, two viewport/language flows, no model or external requests');
