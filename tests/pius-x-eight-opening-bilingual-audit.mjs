import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';

const home='previews/pius-x-study/evidence/';
const audit=JSON.parse(readFileSync(home+'pius-x-eight-opening-bilingual-audit-20261023.v1.json','utf8'));
const original=JSON.parse(readFileSync(home+'pius-x-next12-eight-opening-context-evidence-20261023.v1.json','utf8'));
const sourceClaims=JSON.parse(readFileSync(home+'pius-x-eight-opening-source-claims-20261023.v1.json','utf8'));
const store=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
function fnv1a32(s){let n=2166136261;for(let i=0;i<s.length;i++){n^=s.charCodeAt(i);n=Math.imul(n,16777619)}return(n>>>0).toString(16).padStart(8,'0')}
assert.equal(audit.schema,'AO_SPX_P2_EIGHT_OPENING_BILINGUAL_AUDIT_V1');
assert.equal(audit.status,'REVIEW_ONLY_PRELIMINARY_SEMANTIC_CROSSCHECK');
assert.equal(audit.summary.subjects,8);
assert.equal(audit.summary.englishOpeningsExamined,8);
assert.equal(audit.summary.frenchOpeningsExamined,8);
assert.equal(audit.summary.alignedBilingualClaimSpans,25);
assert.equal(audit.summary.editorialCautionSpans,21);
assert.equal(audit.summary.translationsApproved,0);
assert.equal(audit.summary.fullAnswersApproved,0);
assert.equal(audit.summary.modelEvidencePromotions,0);
assert.equal(store.data.counts.chapters,106);
assert.equal(store.data.counts.allNodes,423);
let aligned=0,held=0;
const ids=new Set();
for(const row of audit.records){
 assert(!ids.has(row.chapterId),'duplicate case');ids.add(row.chapterId);
 const chapter=store.chapters.get(row.chapterId);
 assert(chapter&&chapter.nodes[0].id===row.nodeId);
 const answer=chapter.nodes[0].a;
 assert.equal(row.renderedEnglishChecksumFNV1A32,fnv1a32(answer.en),
  'English opening changed without updating audited claims: '+row.chapterId);
 assert.equal(row.renderedFrenchChecksumFNV1A32,fnv1a32(answer.fr),
  'French opening changed without updating audited claims: '+row.chapterId);
 const doc=original.items.find(x=>x.chapterId===row.chapterId);
 const claimRecord=sourceClaims.items.find(x=>x.chapterId===row.chapterId);
 assert(doc&&claimRecord&&doc.documentKey===row.documentKey);
 assert.equal(row.originalLanguage,doc.originalLanguage);
 const permitted=new Set(doc.witnesses.map(x=>x.id));
 assert.equal(doc.witnesses.length,claimRecord.sourceBackedClaims.length);
 assert(!row.translationApproval&&!row.originalTextClaimApproval&&!row.fullAnswerApproved);
 assert.equal(row.modelEvidencePromotions,0);
 assert(row.alignedBilingualSpans.length>=3);
 assert(row.exceptionSpans.length>=2);
 for(const a of row.alignedBilingualSpans){
  aligned++;
  assert(answer.en.includes(a.enTextSpan),'English source answer is missing audited span');
  assert(answer.fr.includes(a.frTextSpan),'French source answer is missing audited span');
  assert(a.witnessIds.length>=1&&a.witnessIds.every(id=>permitted.has(id)));
  assert.equal(a.assessment,'ORIGINAL_LANGUAGE_CORE_SUPPORT_EN_FR_EDITORIAL_PARAPHRASE');
  assert.equal(a.translationApproved,false);
 }
 for(const x of row.exceptionSpans){
  held++;
  assert(answer.en.includes(x.enTextSpan));
  assert(answer.fr.includes(x.frTextSpan));
  assert.equal(x.status,'EDITORIAL_CAUTION_NOT_PRIMARY_TEXT_CERTIFIED');
  assert(x.code.length>6);
 }
}
assert.equal(ids.size,8);
assert.equal(aligned,25);
assert.equal(held,21);
assert.deepEqual([...ids].sort(),sourceClaims.items.map(x=>x.chapterId).sort());
assert(audit.records.some(x=>x.exceptionSpans.some(y=>y.code==='MISSING_JOHN_CHRYSOSTOM_FROM_THREE_NAME_SOURCE_LIST')));
assert(audit.records.some(x=>x.exceptionSpans.some(y=>y.code==='STRONGER_CHARACTER_JUDGMENT_THAN_SIMPLE_INDISCIPLINE')));
assert(audit.records.some(x=>x.exceptionSpans.some(y=>y.code==='PIUS_IX_EMBEDDED_QUOTE_ATTRIBUTION')));
assert(audit.records.some(x=>x.exceptionSpans.some(y=>y.code==='REASONABLE_ROLE_BOUNDARY_NOT_VERBATIM')));
const mutated={...audit.records[0],renderedFrenchChecksumFNV1A32:'00000000'};
assert.notEqual(mutated.renderedFrenchChecksumFNV1A32,fnv1a32(store.chapters.get(mutated.chapterId).nodes[0].a.fr));
console.log('PASS SPX_EIGHT_OPENING_BILINGUAL_CLAIMS: 8 authentic P6 EN/FR answer pairs, 25 bounded source alignments, 21 editorial caveats; 0 translation/full-answer/model approvals');
