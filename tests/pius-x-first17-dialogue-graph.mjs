import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const graph = JSON.parse(readFileSync('data/learn/research/pius-x-first17-branching-dialogue-graph-20261021.v1.json', 'utf8'));
const upstream = JSON.parse(readFileSync('data/learn/research/pius-x-first20-personal-and-papal-source-corrected-dialogue-20261020.v1.json', 'utf8'));
const upstreamById = new Map(upstream.records.map(record => [record.id, record]));
const canonical = upstream.records.filter(record => record.intentTreatment?.status !== 'ALIAS_NO_DUPLICATE_ENTRY');
assert.equal(canonical.length, 17, '17 canonical original entry points');
assert.equal(graph.episodes.length, 17, '17 dialogue scenes');
assert.equal(graph.counts.newFollowupQuestionAnswerPairs, 34);
assert.equal(graph.counts.newLocalizedFollowupAnswerDrafts, 68);
assert.equal(graph.counts.completeDraftTurnNodes, 51);
assert.equal(graph.counts.published, 0);

const episodeIds = new Set();
const turnIds = new Set();
let biographyCount = 0;
let characterCount = 0;
let addedPairs = 0;

for (const episode of graph.episodes) {
  assert(!episodeIds.has(episode.sourceSeedId), 'duplicate episode');
  episodeIds.add(episode.sourceSeedId);
  const original = upstreamById.get(episode.sourceSeedId);
  assert(original && original.intentTreatment?.status !== 'ALIAS_NO_DUPLICATE_ENTRY', 'opening resolves to canonical owner');
  assert.equal(episode.source.url, original.witness.url, 'unchanged evidence source URL');
  assert.equal(episode.source.locus, original.witness.passage, 'unchanged source locus');
  assert.equal(episode.turns.length, 3, 'opening plus two followups');
  assert.equal(episode.openingReusedFrom, episode.sourceSeedId);
  assert.equal(episode.authenticDirectQuotation, false, 'not certified verbatim');
  assert.equal(episode.approvals.production, false);
  assert.equal(episode.approvals.historicalVoice, false);
  assert.equal(episode.links.chanoine.onlyOnVisitorConsent, true);
  assert.equal(episode.links.chanoine.topicSourceMustBeVerified, true);
  assert.equal(episode.links.sourcePanel.url, original.witness.url);
  const biography = /^SPX-EXP-00[1-9]$/.test(episode.sourceSeedId);
  if (biography) {
    biographyCount++;
    assert.equal(episode.portraitPose, null);
  } else {
    characterCount++;
    assert(['neutral', 'welcoming', 'explaining', 'thoughtful', 'grave'].includes(episode.portraitPose));
  }
  const localIds = new Set(episode.turns.map(t => t.id));
  for (const turn of episode.turns) {
    assert(!turnIds.has(turn.id), 'turn ID unique');
    turnIds.add(turn.id);
    assert(turn.question.en.length > 10 && turn.question.fr.length > 10, 'bilingual prompt');
    assert(turn.sourceIds.includes(episode.sourceSeedId));
    for (const next of turn.nextChoices) assert(localIds.has(next), 'choice target in same chapter');
    assert.equal(turn.speakerMode, biography ? 'EDITORIAL_HISTORICAL_NARRATION_NO_SPRITE' : 'PIUS_X_SOURCE_BOUNDED_EDUCATIONAL_RECONSTRUCTION');
  }
  const opening = episode.turns[0];
  assert.equal(opening.answer.researchOwnerPath, graph.sourceOwner);
  assert.equal(opening.answer.researchOwnerRecordId, episode.sourceSeedId);
  assert.equal(opening.answer.type, 'REFERENCE_EXISTING_APPROVED_OWNER_DRAFT_NOT_DUPLICATED');
  assert.deepEqual(opening.answer.localeFields, ['proposedDraft.en', 'proposedDraft.fr']);
  assert.equal(opening.nextChoices.length, 2, 'two free visitor choices');
  for (const followup of episode.turns.slice(1)) {
    addedPairs++;
    assert(followup.answer.en.length > 35 && followup.answer.fr.length > 35, 'substantive bilingual response');
    assert.equal(followup.answer.status, 'UNAPPROVED_SOURCE_BOUND_EDITORIAL_DIALOGUE');
    assert.equal(followup.returnToOpening, true);
  }
}
assert.equal(biographyCount, 9);
assert.equal(characterCount, 8);
assert.equal(addedPairs, 34);
assert.equal(turnIds.size, 51);
assert(canonical.every(record => episodeIds.has(record.id)), 'all original canonical owners covered');
const aliases = graph.aliasRouting;
assert.equal(aliases.length, 3);
for (const alias of aliases) {
  assert(episodeIds.has(alias.canonical), 'alias resolves');
  assert(upstreamById.has(alias.alias), 'alias belongs to source owner');
  assert(!episodeIds.has(alias.alias), 'alias not duplicated as own chapter');
}
console.log('Pius X first17 dialogue graph: 17 scenes, 51 turns, 34 new EN/FR followup pairs, 3 aliases, no approval escalation — PASS');
