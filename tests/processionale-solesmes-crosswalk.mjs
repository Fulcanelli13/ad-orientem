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


test('1888 original remains unavailable for actual page comparison', () => {
  const first = crosswalk.sourceAccessAudit.firstEdition1888;
  assert.equal(first.verifiedFullPageCount, 0);
  assert.equal(first.collationState, 'NOT_STARTED_BLOCKED_ORIGINAL_SCAN');
  assert.equal(crosswalk.sourceAccessAudit.secondEdition1893.state, 'SELECTED_OCR_PAGES_READ_NOT_IMAGE_COLLATED');
  assert.equal(crosswalk.roman1962Contrasts.length, 4);
});

test('1893 printed index is research only and not mistaken for 1888 contents', () => {
  const index = readJSON('data/research/processionale-solesmes-index-1893-20261026.v1.json');
  assert.equal(index.edition, '1893_SECOND_EDITION_ONLY');
  assert.equal(index.original1888Compared, false);
  assert.equal(index.publicationEligibleCount, 0);
  assert.equal(index.runtimePromotionAllowed, false);
  assert.ok(index.items.length >= 40);
  assert.equal(new Set(index.items.map(item => item.id)).size, index.items.length);
  assert.ok(index.items.every(item => item.review === 'INDEX_SCREEN_ONLY'));
  assert.ok(index.items.every(item => item.readablePageImageVerified === false));
  assert.ok(index.items.every(item => item.sourceTextExtracted === false));
});

test('1962 Candlemas exclusion and Palm psalm text gap are properly recorded', () => {
  const candlemas = readJSON('data/presentation/reader-candlemas.v1.json');
  const palm = readJSON('data/presentation/reader-palm.v1.json');
  const contrasts = new Map(crosswalk.roman1962Contrasts.map(x => [x.id, x]));
  assert.equal(contrasts.get('PM-R1962-CND-EXSURGE')?.outcome, 'CONFIRMED_EXCLUSION_PRESERVE_CURRENT');
  assert.equal(contrasts.get('PM-R1962-PALM-PSALMS')?.outcome, 'CONFIRMED_READER_TEXT_COVERAGE_GAP_REVIEW');
  // The 1962 Candlemas payload does NOT have the older Exsurge.
  assert.ok(!JSON.stringify(candlemas.distribution).toLowerCase().includes('exsurge'));
  assert.ok(!JSON.stringify(candlemas.procession).toLowerCase().includes('exsurge'));
  // The two antiphons are present, but the 1962 distribution Psalm verses are absent.
  assert.equal(typeof palm.texts.puerI, 'string');
  assert.equal(typeof palm.texts.puerII, 'string');
  assert.equal(Object.keys(palm.texts).filter(k => /psalm|ps23|ps46|verses/i.test(k)).length, 0);
  const palmReader = readFileSync(new URL('../src/mass/reader-palm.js', import.meta.url),'utf8');
  const distribution = palmReader.split('id:"PALM-R02"')[1]?.split('id:"PALM-R03"')[0] || '';
  assert.ok(distribution.includes('t.puerI'));
  assert.ok(distribution.includes('t.puerII'));
  assert.ok(!distribution.includes('psalm'));
});


test('Palm Sunday liturgical music handoff stays in existing 1962 owners', () => {
  const handoff = readJSON('data/research/processionale-roman1962-palm-music-handoff-20261026.v1.json');
  const palmPayload = readJSON('data/presentation/reader-palm.v1.json');
  const palmReader = readFileSync(new URL('../src/mass/reader-palm.js', import.meta.url), 'utf8');
  assert.equal(handoff.scope, 'RESEARCH_HANDOFF_ONLY_TO_EXISTING_1962_MISSAL_OWNER');
  assert.equal(handoff.relatedHistoricalPR, '#1752');
  assert.equal(handoff.findings.length, 5);
  assert.ok(handoff.prohibitions.includes('DO_NOT_TOUCH_RUNTIME_IN_THIS_RESEARCH_PR'));
  assert.ok(handoff.prohibitions.includes('DO_NOT_CREATE_PARALLEL_CHANT_EVENT_REGISTRY'));
  assert.ok(handoff.prohibitions.includes('DO_NOT_ASSUME_ALL_OPTIONAL_PROCESSION_ANTIPHONS_ARE_ALWAYS_SUNG'));
  for (const finding of handoff.findings) {
    assert.match(finding.stageId,/^PALM-R0[2-7]$/);
    assert.ok(palmReader.includes('id:"' + finding.stageId + '"'));
    for (const sourcePath of (finding.existingSourcePaths || [])) {
      const key=sourcePath.split('.').at(-1);
      assert.ok(key in palmPayload.texts,'Existing PALM text key missing: ' + sourcePath);
    }
  }
  assert.equal(handoff.findings[0].stageId,'PALM-R02');
  assert.equal(handoff.findings[1].stageId,'PALM-R04');
  assert.equal(handoff.findings[2].stageId,'PALM-R05');
});


test('1893 chant/action findings reference existing stage and event owners only', () => {
  const witness = readJSON('data/research/processionale-1893-chant-action-matrix-20261026.v1.json');
  assert.equal(witness.edition, 'PM1893_ONLY');
  assert.equal(witness.witness.status, 'TEXTUAL_OCR_VERIFIED_NOT_FACSIMILE_CERTIFIED');
  assert.equal(witness.editionSafety.original1888Read, false);
  assert.equal(witness.editionSafety.doNotPromoteMelodyFrom1893, true);
  assert.equal(witness.rows.length, 17);
  assert.equal(new Set(witness.rows.map(x => x.id)).size, witness.rows.length);
  const musicEvents = new Map(music.rites.flatMap(rite => rite.events.map(evt => [evt.id, {rite:rite.id, stage:evt.stageId}])));
  for (const item of witness.rows) {
    assert.equal(item.facsimileVerified,false);
    assert.match(item.ocrLineSpan,/^\\d+-\\d+$/);
    if (item.existingMusicEventId) {
      const owner=musicEvents.get(item.existingMusicEventId);
      assert.ok(owner,'No existing event owner for '+item.id);
      assert.equal(owner.rite,item.rite);
      assert.equal(owner.stage,item.existingStageId);
    } else {
      assert.equal(item.eventMapping,'NO_CURRENT_MUSIC_EVENT_CONTAINS_THIS_HISTORICAL_CHANT_OR_RUBRIC');
    }
  }
  const cndExsurge = witness.rows.find(x => x.id === 'PM93.CN02');
  assert.equal(cndExsurge.status,'PROHIBITED_IN_1962');
  assert.equal(cndExsurge.existingMusicEventId,null);
  const corpusLauda = witness.rows.find(x => x.id === 'PM93.CC03');
  assert.equal(corpusLauda.status,'LOCAL_CUSTOM_CONDITIONAL');
  assert.equal(corpusLauda.existingMusicEventId,null);
});

test('indirect 1888 scholarly citations do not masquerade as facsimile inspection', () => {
  assert.equal(crosswalk.sourceAccessAudit.firstEdition1888.verifiedFullPageCount,0);
  const attestations=crosswalk.sourceAccessAudit.firstEdition1888.indirectScholarlyAttestations;
  assert.equal(attestations.length,3);
  assert.ok(attestations.every(x => x.evidenceType && x.cannotEstablish));
  assert.ok(attestations.every(x => x.inspection !== 'PRIMARY_PAGE_CHECKED'));
});
