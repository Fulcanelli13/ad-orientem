import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';

const batch=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-next12-primary-document-discovery-20261023.v1.json','utf8'));
const built=readCorpus(readFileSync(
 'artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
assert.equal(batch.schema,'AO_SPX_P2_NEXT12_ORIGINAL_DOCUMENT_DISCOVERY_BATCH_V1');
assert.equal(batch.status,'UNAPPROVED_PRIVATE_SOURCE_DISCOVERY_NOT_GENERATION_EVIDENCE');
assert.equal(batch.documents.length,12);
assert.equal(batch.summary.documentGroups,12);
assert.equal(batch.summary.chaptersInGroups,53);
assert.equal(batch.summary.sourceNodesInGroups,195);
assert.equal(batch.summary.shortExcerptsLocated,8);
assert.equal(batch.summary.shortExcerptsWithClaimLevelLimitationsRecorded,8);
assert.equal(batch.summary.newlyPromotedModelWitnesses,0);
assert(batch.documents.every(d=>d.excerptCandidate.claimTriage?.eligibleForAutomatedModelPromotion===false));
assert(batch.documents.every(d=>d.excerptCandidate.claimTriage?.publicationApproved===false));
assert(batch.documents.every(d=>d.excerptCandidate.claimTriage?.editorialOpeningVerdict.startsWith('HOLD_FULL_ANSWER')));
assert(batch.documents.filter(d=>d.excerptCandidate.originalLanguageText).every(d=>
 d.excerptCandidate.claimTriage.notEstablished.length>0&&
 d.excerptCandidate.claimTriage.additionalSourceLoci.length>0));

assert.equal(batch.summary.alreadyMappedPilotChapters,4);
assert.equal(batch.summary.chaptersFullyCertified,0);
assert.equal(batch.summary.translatedSourceClaimsApproved,0);
assert.equal(built.chapters.size,106);
assert.equal(built.data.counts.allNodes,423);
const allIDs=new Set(),documentKeys=new Set();
for(const d of batch.documents){
 assert(d.officialOriginalPage.startsWith('https://www.vatican.va/content/pius-x/'));
 assert.equal(d.researchStatus,'DOCUMENT_DISCOVERY_COMPLETE_NODE_CLAIMS_UNVERIFIED');
 assert.equal(d.sourcePageStatus,'OFFICIAL_VATICAN_PAGE_RETRIEVED_2026-10-23');
 assert(['it','la'].includes(d.originalLanguage));
 assert.equal(d.excerptCandidate.originalLanguageText===null,
  d.excerptCandidate.status==='EXISTING_DOCUMENT_ANCHORS_NOT_YET_REUSED_FOR_THIS_CHAPTER');
 assert(d.excerptCandidate.supportScope.length>15);
 assert(d.excerptCandidate.interpretationCaveat.length>15);
 assert(!documentKeys.has(d.documentKey));documentKeys.add(d.documentKey);
 assert(d.chapters.length>0);
 for(const chapter of d.chapters){
  assert(!allIDs.has(chapter.chapterId),'research source document groups must not duplicate chapters');
  allIDs.add(chapter.chapterId);
  const owner=built.chapters.get(chapter.chapterId);
  assert(owner,'unknown original author chapter '+chapter.chapterId);
  assert.deepEqual(chapter.nodeIds,owner.nodes.map(n=>n.id),
   'source discovery must list every source-owner node in original order');
  assert.equal(chapter.chapterTitle,owner.title.en);
  assert.equal(chapter.sourceLocus,owner.source.locus);
 }
 assert(d.chapters.some(c=>c.chapterId===d.excerptCandidate.chapterId&&
  c.nodeIds.includes(d.excerptCandidate.nodeId)));
 if(d.excerptCandidate.originalLanguageText)assert(Number.isInteger(d.excerptCandidate.sourceWebPageLine));
}
assert.equal(allIDs.size,53);
const checked=batch.documents.filter(d=>d.excerptCandidate.originalLanguageText);
assert.equal(checked.length,8);
const originalWindows=new Map([
 ['pascendi-dominici-gregis','ut traditae sanctis fidei depositum vigilantissime custodiat, repudiatis profanis vocum novitatibus'],
 ['acerbo-nimis','ea parochi, praesertim ubi sacerdotum numerus sit exiguus, adiutores in catechesi tradenda laicos habebunt'],
 ['pieni-l-animo','potranno scegliere solamente coloro che sono veramente idonei, rimandando quelli che mostrassero inclinazioni contrarie'],
 ['sollecitudini','le qualità che sono proprie della liturgia, e precisamente la santità e la bontà delle forme, onde sorge spontaneo'],
 ['divino-afflatu','ut, quoad posset, revocaretur consuetudo vetus recitandi per hebdomadam totum Psalterium, ita tamen ut clero'],
 ['singulari-quadam','Causam socialem controversiasque ei causae subiectas de ratione spatioque operae, de modo salarii, de voluntaria cessatione opificum, non mere oeconomicae esse naturae'],
 ['editae-saepe','Horum autem praeclara facinora, non modo sunt ad commemorandum iucunda, sed etiam ad imitandum illustria, et magnus virtutis excitator'],
 ['ad-diem-illum-laetissimum','Quae quidem non ea modo conservabat conferens in corde suo quae Bethlehem acta, quaeve Hierosolymis in templo Domini; sed Christi consiliorum particeps occultarumque voluntatum, vitam ipsam Filii vixisse dicenda est. Nemo itaque penitus ut illa Christum novit; nemo illa aptior dux et magister ad Christum noscendum']
]);
for(const d of checked){
 const entry=[...originalWindows].find(([slug])=>d.documentKey.includes(slug));
 assert(entry,'missing independent original-language context window '+d.title);
 assert(entry[1].toLocaleLowerCase().includes(d.excerptCandidate.originalLanguageText.toLocaleLowerCase()),
  'source excerpt not found in independent witness context: '+d.title);
}
assert.equal(originalWindows.size,8);
const clone=structuredClone(checked[0]);
clone.excerptCandidate.originalLanguageText='deliberately corrupted quotation';
const corresponding=[...originalWindows].find(([slug])=>clone.documentKey.includes(slug));
assert(!corresponding[1].includes(clone.excerptCandidate.originalLanguageText));
for(const document of batch.documents){
 assert.equal(document.mappedNodeCountInGroup,
  document.chapters.filter(x=>['SPX-PILOT-01','SPX-PILOT-09','SPX-029','SPX-NEW-012'].includes(x.chapterId)).
   reduce((n,x)=>n+x.nodeIds.length,0));
}
assert.equal(batch.documents.reduce((n,d)=>n+d.chapters.length,0),53);
assert.equal(batch.documents.reduce((n,d)=>n+d.chapters.reduce((x,c)=>x+c.nodeIds.length,0),0),195);
console.log('PASS SPX_NEXT12_DOCUMENT_DISCOVERY: 12 original Vatican documents, 53 existing chapters, 195 source-owner nodes, 8 excerpt candidates crosschecked to independent context; zero new approvals');
