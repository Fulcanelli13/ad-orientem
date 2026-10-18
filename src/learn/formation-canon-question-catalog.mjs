/**
 * Canon / Ask the Church: source-owned historical apologetics question catalogue.
 *
 * Pure read-only adapter over EXISTING Formation answer crosswalk and Oct 14 delta.
 * Deliberately contains no question texts, generated answers, translations or new
 * ownership records; consumes the authoritatively researched sources at runtime.
 *
 * IMPORTANT: this is a research-stage contract; it is not wired to public routes.
 */
export const CANON_SOURCE_CATALOG_VERSION = 'AO_FORMATION_CANON_POINTERS_V1';
const EXPECTED = Object.freeze({base:519,additional:15});
const VALID_REVIEW_STATUS = new Set([
  'DIRECT_ANSWER_PRESENT',
  'PARTIAL_ANSWER_ONLY',
  'NO_SPECIFIC_ANSWER_IN_REVIEWED_OWNER'
]);

function checkPath(v) {
  if (typeof v !== 'string' || !/^data\/learn\/[a-z0-9_./-]+\.json$/i.test(v) ||
      v.includes('..') || v.includes('//')) return null;
  return v;
}
function clean(v) { return String(v ?? '').trim(); }
function normal(v) {
  return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function copyOwners(v) {
  return Object.freeze([...(Array.isArray(v) ? v : v ? [v] : [])].map(clean).filter(Boolean));
}
const blocked = Object.freeze({
  status:'HELD_ORIGINAL_OWNER_APPROVAL_REQUIRED',
  canDisplaySourceAnswer:false,
  canPublish:false,
  mayGenerateAnswer:false,
  routeTarget:null
});

export function createCanonResearchQuestionCatalog(crosswalk, newlyIndexed) {
  if (crosswalk?.schema !== 'AO_FORMATION_HISTORICAL_QUESTION_ANSWER_CROSSWALK_V1' ||
      !Array.isArray(crosswalk.records) ||
      !crosswalk.source_pack_by_owner ||
      !Array.isArray(newlyIndexed?.rows) ||
      newlyIndexed.publication_allowed !== false) {
    throw new Error('Canon catalogue requires the existing unpublished Folio owners');
  }
  if (crosswalk.records.length !== EXPECTED.base ||
      newlyIndexed.rows.length !== EXPECTED.additional) {
    throw new Error('Historical source coverage changed: reconcile the original ledgers first');
  }
  const ownerMap = crosswalk.source_pack_by_owner;
  const records = new Map();
  function insert(src,sourceKind) {
    const questionId = clean(src.historical_id);
    const title = clean(src.question_title_candidate || src.title_candidate);
    const bank = clean(src.bank || questionId.split('-').slice(0, -1).join('-'));
    if (!/^[A-Z][A-Z0-9-]*-\d{3}$/.test(questionId) ||
        !title || !VALID_REVIEW_STATUS.has(src.review_status) ||
        records.has(questionId)) throw new Error('Duplicate/invalid historical source ID: '+questionId);
    const ownerIds = copyOwners(src.answer_owner_ids);
    const ownerPointers = Object.freeze(ownerIds.map(ownerId => Object.freeze({
      id:ownerId, path:checkPath(ownerMap[ownerId])
    })));
    const supplementPath = sourceKind === 'CROSSWALK_519'
      ? checkPath(src.answer_supplement_file)
      : src.answer_supplement_id
        ? 'data/learn/research/formation-new-15-indexed-answer-adequacy-20261014.v1.json'
        : null;
    if (sourceKind === 'CROSSWALK_519' && src.answer_supplement_file && !supplementPath)
      throw new Error('Unsafe supplement path: '+questionId);
    const stored = Object.freeze({
      questionId, bank, historicalQuestionCandidate:title,
      languageOfOriginalCandidate:'en', // no invented original French questions
      textProvenance:'PRIOR_ASSISTANT_CHAT_INDEX_NOT_RAW_CHAT_VERIFIED',
      answerStatusBeforeSupplement:src.review_status,
      canonicalOwnerIds:ownerIds,
      canonicalOwnerPointers:ownerPointers,
      supplementPointer:supplementPath ? Object.freeze({
        path:supplementPath,recordId:questionId,originalResearchRecord:true,publicationCertified:false
      }):null,
      researchQuestionPointer:Object.freeze({
        path: sourceKind==='CROSSWALK_519'
          ? 'data/learn/formation-historical-answer-crosswalk-20261013.v1.json'
          : 'data/learn/research/formation-new-15-indexed-answer-adequacy-20261014.v1.json',
        recordId:questionId
      }),
      sourceKind,
      ...blocked
    });
    records.set(questionId,stored);
  }
  for (const row of crosswalk.records) insert(row,'CROSSWALK_519');
  for (const row of newlyIndexed.rows) insert(row,'OCT14_15');
  if (records.size!==534) throw new Error('Wrong unique historical source inventory');
  const all=Object.freeze([...records.values()]);
  function find(query,{limit=30,bank=null}={}){
    const term=normal(query);
    const max=Math.max(0,Math.min(100,Number.isFinite(limit)?Math.trunc(limit):30));
    if (!term || max===0) return Object.freeze([]);
    return Object.freeze(all.filter(q=>(!bank || q.bank===bank) &&
      normal([q.questionId,q.bank,q.historicalQuestionCandidate,
        ...q.canonicalOwnerIds].join(' ')).includes(term)).slice(0,max));
  }
  const byBank=Object.freeze(Object.fromEntries(
    [...new Set(all.map(q=>q.bank))].sort().map(bank=>
      [bank,all.filter(q=>q.bank===bank).length])
  ));
  const counts=Object.freeze({
    total:all.length,
    crosswalkQuestions:crosswalk.records.length,
    extraOctober14Questions:newlyIndexed.rows.length,
    withPreexistingSupplement:all.filter(q=>q.supplementPointer).length,
    canonicalDirect:all.filter(q=>q.answerStatusBeforeSupplement==='DIRECT_ANSWER_PRESENT').length,
    canonicalPartial:all.filter(q=>q.answerStatusBeforeSupplement==='PARTIAL_ANSWER_ONLY').length,
    canonicalGap:all.filter(q=>q.answerStatusBeforeSupplement==='NO_SPECIFIC_ANSWER_IN_REVIEWED_OWNER').length,
    publishableAnswers:0
  });
  return Object.freeze({
    schema:CANON_SOURCE_CATALOG_VERSION,
    counts,byBank,
    get(id){return records.get(clean(id))||null;},
    find,
    listBank(bank){return Object.freeze(all.filter(q=>q.bank===bank));},
    // Neither a search hit nor a source-path pointer grants release or a native
    // handoff. P3 must remain held until content owner and release gates accept.
    answerAvailability(){return blocked;},
    publicHandoff(){return blocked;}
  });
}
