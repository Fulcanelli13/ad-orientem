// Historical source crosswalk guard: do not promote Solesmes monastic witnesses to 1962 runtime authority.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const readJSON = p => JSON.parse(readFileSync(new URL('../'+p, import.meta.url), 'utf8'));
const crosswalk = readJSON('data/research/processionale-solesmes-crosswalk-20261026.v1.json');
const music = readJSON('data/research/mass-special-rite-music-events-20261019.v1.json');

test('Solesmes research remains edition-specific and non-runtime', () => {
  assert.equal(crosswalk.status, 'RESEARCH_ONLY_NOT_RUNTIME');
  assert.equal(crosswalk.guardrails.live1962AuthoritiesUnchanged, true);
  assert.equal(crosswalk.guardrails.neverAutoTriggerByFeastDate, true);
  assert.equal(crosswalk.guardrails.noLocalMonasticStationToUniversalRoman, true);
  assert.equal(crosswalk.guardrails.no1888To1893SilentConflation, true);
  assert.equal(crosswalk.guardrails.noOCRTextIntoPublishedPrayer, true);
  const editions = new Map(crosswalk.sourceEditions.map(s => [s.id, s]));
  assert.equal(editions.get('PM1888')?.inspection, 'BIBLIOGRAPHIC_IDENTITY_CONFIRMED_CONTENT_NOT_EXTRACTED');
  assert.equal(editions.get('PM1893')?.inspection, 'PARTIAL_OCR_TEXT_AND_PRINTED_INDEX_REVIEWED');
  assert.ok(crosswalk.evidence.length >= 10);
  assert.ok(crosswalk.evidence.every(e => e.edition === 'PM1893'));
  assert.equal(new Set(crosswalk.evidence.map(e => e.id)).size, crosswalk.evidence.length);
});

test('crosswalk references existing source-owned music events, not new ones', () => {
  const evidence = new Set(crosswalk.evidence.map(e => e.id));
  const rites = new Map(music.rites.map(r => [r.id, new Set(r.events.map(e => e.id))]));
  for (const mapping of crosswalk.crosswalk) {
    assert.ok(mapping.action.endsWith('ONLY'));
    assert.ok(mapping.evidenceIds.length);
    for (const id of mapping.evidenceIds) assert.ok(evidence.has(id), id);
    assert.ok(mapping.currentStageIds.length);
    const events = rites.get(mapping.rite);
    assert.ok(events, 'Missing native music owner: ' + mapping.rite);
    for (const id of mapping.currentMusicEventIds) assert.ok(events.has(id), 'Unknown native event: ' + id);
  }
});
