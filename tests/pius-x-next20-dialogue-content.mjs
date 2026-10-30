import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(p,'utf8'));
const root = 'data/learn/research/';
const a = read(root+'pius-x-dialogue-authoring-next20-part-a-20261021.v1.json');
const b = read(root+'pius-x-dialogue-authoring-next20-part-b-20261021.v1.json');
const index = read(root+'pius-x-37chapter-dialogue-navigation-index-20261021.v1.json');
const earlier = read(root+'pius-x-first17-branching-dialogue-graph-20261021.v1.json');
const witness = read(root+'pius-x-expansion-48-passage-review-20261019.v1.json');
const batch2 = read(root+'pius-x-batch2-production-index-20261019.v1.json');
const witnesses = new Map(witness.records.map(x=>[x.id,x]));
const prior = new Map(batch2.entries.map(x=>[x.id,x]));
const next = [...a.records,...b.records];
assert.equal(a.records.length,10);
assert.equal(b.records.length,10);
assert.equal(next.length,20);
assert.equal(earlier.episodes.length,17);
assert.equal(index.counts.combinedChapters,37);
assert.equal(index.counts.combinedGraphQATurnNodes,111);
assert.equal(index.counts.newEnglishFrenchAnswerDrafts,120);
assert.equal(index.counts.published,0);
assert.equal(index.interfaceContract.production,'DISABLED_UNTIL_APPROVAL');
const roots = new Set([...earlier.episodes.map(x=>x.sourceSeedId),...next.map(x=>x.id)]);
assert.equal(roots.size,37,'no repeated chapter roots');
assert.deepEqual([...index.priorChapterIds].sort(),earlier.episodes.map(x=>x.sourceSeedId).sort());
const found = new Set();
const allTurns = new Set();
const oldOwners=[];
let partial=0, direct=0, count=0;
for (const chapter of next) {
  const witnessRow=witnesses.get(chapter.id);
  assert(witnessRow,chapter.id+' has a pre-mined witness');
  assert.equal(chapter.source.url,witnessRow.verified_source_url);
  assert.equal(chapter.source.locus,witnessRow.section_or_question_locator);
  assert.equal(chapter.source.evidenceTier,witnessRow.passage_support_screen);
  if (chapter.source.evidenceTier==='PRIMARY_PARTIAL')partial++;
  else if (chapter.source.evidenceTier==='PRIMARY_DIRECT')direct++;
  else throw Error('unsupported tier '+chapter.id);
  assert(!found.has(chapter.id),'unique chapter');
  found.add(chapter.id);
  assert.equal(chapter.turns.length,3,'three authored Q&A turns');
  const linked = index.newChapters.find(x=>x.id===chapter.id);
  assert(linked,'navigable index entry');
  assert.equal(linked.sourceUrl,chapter.source.url);
  assert.equal(linked.sourceLocus,chapter.source.locus);
  assert.equal(linked.turns.length,3);
  assert.equal(linked.chanoine.optIn,true);
  assert.equal(linked.chanoine.approvedAnswerRequired,true);
  assert.equal(linked.release.production,false);
  assert.equal(chapter.approval.periodVoice,false);
  assert.equal(chapter.approval.appPublication,false);
  assert.equal(chapter.personalConscienceVerdictPermitted,false);
  assert.equal(chapter.originalPreExistingResponsePreserved,true);
  if (chapter.originalPreExistingDialogueOwner) {
    const owner=prior.get(chapter.id);
    assert(owner,'source-owned original dialogue still present');
    assert.equal(chapter.originalPreExistingDialogueOwner,owner.file);
    oldOwners.push(chapter.id);
  }
  for(const turn of chapter.turns){
    assert(!allTurns.has(turn.id),'unique Q&A ID');
    allTurns.add(turn.id);
    assert(turn.question.en.length>15 && turn.question.fr.length>15,'complete bilingual question');
    assert(turn.answer.en.length>80 && turn.answer.fr.length>80,'substantive bilingual answer');
    assert.equal(turn.sourceQID,chapter.id);
    assert.equal(turn.status,'UNAPPROVED_EDUCATIONAL_DIALOGUE_NOT_VERBATIM');
    assert.equal(turn.visibleSourcePanel,true);
    count++;
  }
  for(const choice of linked.nextChoices){
    if(choice.status==='IN_37_CHAPTER_LIBRARY')assert(roots.has(choice.targetId),'internal target exists');
    else assert.equal(choice.status,'EXTERNAL_EXISTING_SOURCE_OR_CANDIDATE_CHECK_ROUTER_BEFORE_OFFER','external target held');
  }
}
assert.equal(found.size,20);
assert.equal(count,60);
assert.equal(allTurns.size,60);
assert.equal(partial,6);
assert.equal(direct,14);
assert.deepEqual(oldOwners.sort(),['SPX-EXP-014','SPX-EXP-015','SPX-EXP-022','SPX-EXP-039','SPX-EXP-042','SPX-EXP-044'].sort());
const communion = next.find(x => x.id === 'SPX-EXP-042');
assert.equal(communion.supportingSource.ownedBy,'SPX-PILOT-10');
assert.equal(communion.supportingSource.sourceClass,'PAPALLY_APPROVED_DICASTERY_DECREE_REPRINT_NOT_PERSONAL_ENCYCLICAL');
assert.equal(index.newChapters.find(x=>x.id==='SPX-EXP-042').supplementarySourceReferences[0].url,communion.supportingSource.url);
assert.equal(index.pendingCandidateDedup.length,8);
assert(index.pendingCandidateDedup.every(x=>x.redirectApproved===false));
assert.equal(index.counts.newOverwrittenOriginalAnswers,0);
assert.equal(index.counts.certifiedHistoricalAvatarSpeech,0);
console.log('St Pius X next20 dialogue authorship: 20 chapters / 60 QA turns / 120 EN-FR draft replies, source and routing constraints PASS');
