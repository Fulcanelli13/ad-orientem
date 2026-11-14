#!/usr/bin/env node
/** R5D canonical first-cohort QA: hash 21 source files; join 53 exact editorial slots.
 * No license, visual or publication approval is inferred from this technical pass.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {prayerEditorialSlot} from '../src/pray/editorial-artwork-assignments.v1.js';
import {resolvePrayerEditorialArtwork,prayerEditorialPublicationSummary} from '../src/pray/art-slot-map.v1.js';
import {RELEASED_MODULE_PAINTINGS} from '../src/art/released-module-paintings.v1.js';
import {R5D_RESEARCH_PHOTOS,R5D_RESEARCH_TOTALS,renderR5dResearchPhoto,resolveR5dResearchPhoto}
  from './fixtures/prayer-r5d-reader-preview.v1.js';

const ledger=JSON.parse(readFileSync('data/pray/research/r5d-21-work-canonical-source-ledger.v1.json','utf8'));
assert.equal(ledger.schema,'AO_PRAYER_R5D_21_WORK_CANONICAL_RESEARCH_LEDGER_V1');
assert.equal(ledger.publicationAuthorized,false);
assert.equal(ledger.manualVisualReviewApproved,false);
assert.equal(ledger.readerAcceptancePassed,false);
assert.equal(ledger.works.length,21);
assert.deepEqual(R5D_RESEARCH_TOTALS,{works:21,slots:53,published:0});
assert.equal(R5D_RESEARCH_PHOTOS.length,ledger.works.length);
const normalize=s=>{const u=new URL(s);return u.hostname.replace(/^www\./,'')+decodeURIComponent(u.pathname).replace(/\/$/,'')};
const released=Object.values(RELEASED_MODULE_PAINTINGS);
const seenSources=new Set(),seenSlots=new Set(),category={};
for(let i=0;i<ledger.works.length;i++){
 const w=ledger.works[i],q=R5D_RESEARCH_PHOTOS[i];
 assert.equal(w.publicationAuthorized,false);
 assert.equal(w.visualQA,'PENDING');
 assert.equal(w.readerBrowserQA,'PENDING');
 assert.deepEqual(q.slots,w.slots,'QA preview must be canonical-ledger derived');
 assert.equal(q.sha256,w.sha256);
 assert.equal(q.imagePath,w.imagePath);
 assert.equal(q.sourcePage,w.sourcePage);
 assert.ok(w.rightsEvidence,'Missing museum/Commons rights evidence (not approval)');
 assert.ok(!seenSources.has(normalize(w.sourcePage)),'Duplicate canonical source');
 seenSources.add(normalize(w.sourcePage));
 assert.ok(!released.some(a=>normalize(a.source)===normalize(w.sourcePage)),'Research source already published');
 const raw=readFileSync(w.imagePath);
 assert.equal(raw.length,w.bytes,'Original byte count changed: '+w.imagePath);
 assert.equal(createHash('sha256').update(raw).digest('hex'),w.sha256,
   'Original image checksum mismatch: '+w.imagePath);
 for(const id of w.slots){
  assert.ok(!seenSlots.has(id),'Slot assigned to two paintings: '+id);
  seenSlots.add(id);
  assert.ok(!/rosary-/i.test(id),'Signature Rosary is deferred: '+id);
  category[id.split('-')[0]]=(category[id.split('-')[0]]||0)+1;
  const slot=prayerEditorialSlot(id);
  assert.ok(slot,'Missing canonical editorial selection: '+id);
  assert.equal(slot.approvedOrInherited,true,id);
  assert.equal(slot.hold,false,id);
  assert.equal(slot.protectedCover,false,id);
  assert.equal(slot.sourceIdentityVerified,true,id);
  assert.equal(normalize(slot.selected.sourcePage),normalize(w.sourcePage),id);
  const publicState=resolvePrayerEditorialArtwork(id);
  assert.equal(publicState.state,'APPROVED_EXACT_PHOTO_PENDING',
    'Publication leak or editorial drift: '+id+' '+publicState.state);
  assert.equal(renderR5dResearchPhoto(id),'','Default QA markup must render nothing');
  assert.equal(resolveR5dResearchPhoto(id),null,'Default QA resolver must fail closed');
  assert.equal(renderR5dResearchPhoto(id,{qaOnly:false}),'','False flag must not show art');
  const staging=resolveR5dResearchPhoto(id,{qaOnly:true});
  assert.equal(staging.publicationAuthorized,false);
  assert.equal(staging.photo.sha256,w.sha256);
  const markup=renderR5dResearchPhoto(id,{qaOnly:true,className:'aoPrayerEditorialCardCover'});
  assert.ok(markup.includes('data-ao-editorial-slot="'+id+'"'));
  assert.ok(markup.includes('data-ao-published="false"'));
  assert.ok(markup.includes('data-ao-research-only="true"'));
  assert.ok(markup.includes('src="/'+w.imagePath+'"'));
  assert.ok(markup.includes('Publication')||markup.includes('publication NOT approved'));
 }
}
assert.equal(seenSlots.size,53);
assert.deepEqual(prayerEditorialPublicationSummary().states.PUBLISHED_EXACT_PHOTO,51,
 'Prior live artwork baseline changed; re-review before release');
assert.equal(renderR5dResearchPhoto('COV-pray.rosary',{qaOnly:true}),'',
 'Original signature Rosary must remain entirely untouched');
assert.equal(resolveR5dResearchPhoto('DOES_NOT_EXIST',{qaOnly:true}),null);
const production=readFileSync('src/pray/presentation-runtime.js','utf8');
const resolver=readFileSync('src/pray/art-slot-map.v1.js','utf8');
assert.ok(!production.includes('prayer-r5d-reader-preview'));
assert.ok(!resolver.includes('prayer-r5d-reader-preview'));
const result={schema:'AO_PRAYER_R5D_FIRST_COHORT_READER_PREVIEW_GATE_V2',
 researchedWorks:21,uniqueApprovedSlots:53,slotKinds:category,
 exactImageIntegrity:true,editorialMapping:true,
 baselineReleasedSlots:51,publicationAuthorized:false,
 previewIsolatedFromProduction:true,
 actualRouteReaderBrowserQA:'PENDING',humanVisualApproval:'PENDING',
 records:ledger.works.map(w=>({title:w.title,sourcePage:w.sourcePage,sha256:w.sha256,
  imagePath:w.imagePath,slots:w.slots,publicationAuthorized:false}))};
mkdirSync('r5d-first-release-qa',{recursive:true});
writeFileSync('r5d-first-release-qa/staging-manifest.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({pass:true,works:21,slots:53,slotKinds:category,
  releaseRegistryChanged:false,previousReleasedSlotBaseline:51}));
