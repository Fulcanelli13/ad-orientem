// Historical source crosswalk guard: do not promote Solesmes monastic witnesses to 1962 runtime authority.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

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
    assert.match(item.ocrLineSpan,/^[0-9]+-[0-9]+$/);
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


test('Cantus IDs identify candidate text families, never authorize editions or melodies', () => {
  const identity = readJSON('data/research/processionale-chant-identity-candidates-20261026.v1.json');
  const matrix = readJSON('data/research/processionale-1893-chant-action-matrix-20261026.v1.json');
  const ids = new Set(matrix.rows.map(x => x.id));
  assert.equal(identity.status,'RESEARCH_ONLY_UNPUBLISHED');
  assert.equal(identity.editionPolicy.solesmes1888ImageInspected,false);
  assert.equal(identity.editionPolicy.solesmes1893FacsimileInspected,false);
  assert.equal(identity.editionPolicy.approvedRoman1962Scores,0);
  assert.equal(identity.editionPolicy.accepted1888Melodies,0);
  assert.equal(identity.editionPolicy.accepted1893Melodies,0);
  assert.equal(identity.editionPolicy.cantusIDsAreTextFamilyNotMelodyCertificate,true);
  assert.equal(identity.candidates.length,11);
  assert.equal(identity.falseFriendCases.length,5);
  for (const candidate of identity.candidates) {
    assert.ok(ids.has(candidate.historicalRowId),'Unknown chant-action row '+candidate.historicalRowId);
    assert.equal(candidate.melodyVerifiedAgainstSolesmes1888,false);
    assert.equal(candidate.melodyVerifiedAgainstSolesmes1893,false);
    assert.equal(candidate.roman1962MelodyApproved,false);
    if (candidate.catalogueURL) assert.ok(/^https:\/\//.test(candidate.catalogueURL));
  }
  const adorna=identity.candidates.find(x=>x.historicalRowId==='PM93.CN04');
  assert.equal(adorna.cantusID,'g00068');
  assert.ok(adorna.doNotConflate.includes('006051'));
  const excluded=identity.candidates.find(x=>x.historicalRowId==='PM93.CN02');
  assert.equal(excluded.cantusID,null);
  assert.equal(excluded.mappingStatus,'DO_NOT_IMPORT_TO_ROMAN1962');
  assert.equal(identity.externalEditionSpecificNotatedRecord.printedPage,272);
  assert.equal(identity.externalEditionSpecificNotatedRecord.runtimeUse,'NONE');
});


test('visually checked Roman score-page handoff cannot supersede 1962 text', () => {
  const handoff=readJSON('data/research/processionale-roman-score-facsimile-handoff-20261026.v1.json');
  const candlemas=readJSON('data/presentation/reader-candlemas.v1.json');
  const palm=readJSON('data/presentation/reader-palm.v1.json');
  assert.equal(handoff.status,'RESEARCH_ONLY_NOT_RUNTIME');
  assert.equal(handoff.mappedScorePages.length,9);
  assert.equal(handoff.sourceContradictions.length,2);
  assert.ok(handoff.mappedScorePages.every(x=>x.imageRead===true));
  assert.ok(handoff.mappedScorePages.every(x=>x.imageURLs.every(url=>url.startsWith('https://gregobase.selapa.net/sources/3/'))));
  const byId=new Map(handoff.mappedScorePages.map(x=>[x.id,x]));
  assert.equal(byId.get('LU61-CND-02').roman1962Status,'OMITTED_EXPLICITLY');
  assert.equal(byId.get('LU61-CND-04').roman1962Status,'PRESCRIBED_WITH_CUM_INDUCERENT_VERSE');
  assert.ok(!JSON.stringify(candlemas.distribution).toLowerCase().includes('exsurge'));
  assert.ok(!JSON.stringify(candlemas.procession).toLowerCase().includes('exsurge'));
  assert.ok(candlemas.procession.responsumVerse.toLowerCase().includes('cum indúcerent'));
  assert.ok(candlemas.procession.responsumVerse.toLowerCase().includes('púerum jesum'));
  assert.ok(palm.texts.gloriaLaus.toLowerCase().startsWith('glória, laus'));
  assert.equal(handoff.integration.status,'HANDOFF_NOT_IMPLEMENTED');
  assert.equal(handoff.integration.noNewScholaDock,true);
  assert.equal(handoff.integration.noNewMusicEventIDs,true);
  assert.equal(handoff.integration.noNewAudioRuntime,true);
});


test('1961 source-matched GABC coverage requires complete hymn and psalm components', () => {
  const handoff=readJSON('data/research/processionale-roman-score-facsimile-handoff-20261026.v1.json');
  const audit=handoff.gabcAudit;
  assert.equal(audit.status,'CATALOGUE_SOURCE_AND_VISUAL_INCIPIT_CROSSCHECK_ONLY_NOT_FULL_PITCH_CERTIFIED');
  assert.equal(audit.scoresInCurrentRuntimeFromThisResearch,0);
  assert.equal(audit.fullNoteByNoteVerified,0);
  assert.equal(audit.downloadedGabcPayloads,true);
  assert.equal(audit.sha256ArchiveCommitted,true);
  assert.equal(audit.archivedGabcElements,15);
  assert.equal(audit.archivedBytes,9841);
  assert.equal(audit.archiveStatus,'15_RAW_UTF8_GABC_FILES_VERIFIED_SHA256_COMMITTED_GIT_NOTATION_QA_OPEN');
  assert.equal(audit.records.length,10);
  assert.equal(audit.rejectedSources.length,3);
  assert.equal(new Set(audit.records.map(r=>r.scoreId)).size,audit.records.length);
  const existing=new Map(handoff.mappedScorePages.map(r=>[r.id,r]));
  const exceptions=new Set(['LU61-PALM-01-PS','LU61-PALM-02-PS']);
  const byId=new Map(audit.records.map(r=>[r.id,r]));
  for(const r of audit.records){
    assert.equal(r.sourceURL,'https://gregobase.selapa.net/chant.php?id='+r.scoreId);
    if(!exceptions.has(r.id)){
      assert.ok(existing.has(r.id),r.id+' does not map an existing 1961 page audit');
      assert.equal(existing.get(r.id).stage,r.stage);
    }else{
      assert.equal(r.stage,'PALM-R02');
      assert.match(r.component,/Psalm (23|46)/);
    }
    assert.match(r.verification, /_NO_FULL_PITCH_QA|_UNCERTIFIED|_HOLD/);
  }
  const first=byId.get('LU61-PALM-01');
  const firstPsalm=byId.get('LU61-PALM-01-PS');
  const second=byId.get('LU61-PALM-02');
  const secondPsalm=byId.get('LU61-PALM-02-PS');
  assert.equal(first.scoreId,1215);
  assert.equal(firstPsalm.scoreId,288);
  assert.equal(second.scoreId,1155);
  assert.equal(secondPsalm.scoreId,435);
  assert.notEqual(first.scoreId,firstPsalm.scoreId);
  assert.notEqual(second.scoreId,secondPsalm.scoreId);
  const gloria=byId.get('LU61-PALM-03');
  assert.equal(gloria.scoreId,259);
  assert.equal(gloria.gabcElements,6);
  assert.equal(gloria.gabcURL,null,'One element is not an entire Gloria laus');
  assert.deepEqual(gloria.gabcElementURLs,Array.from({length:6},(_,i)=>
    'https://gregobase.selapa.net/download.php?elem='+(i+1)+'&format=gabc&id=259'));
  assert.equal(byId.get('LU61-CND-04').scoreId,46);
  assert.match(byId.get('LU61-CND-04').critical,/separate V\./);
  assert.ok(audit.rejectedSources.some(x=>x.scoreId===30&&x.policy==='DO_NOT_ASSIGN'));
  assert.ok(audit.rejectedSources.some(x=>x.scoreId===12531&&x.policy==='DO_NOT_SILENTLY_SUBSTITUTE'));
});


test('permanent 1961 GABC archive matches all 15 original SHA256 captures', () => {
  const directory='data/research/chant-source-archive/1961-liber-usualis-gregobase-20261026/';
  const archive=readJSON(directory+'sha256-manifest.json');
  assert.equal(archive.schema,'ao-gabc-source-archive-v1');
  assert.equal(archive.sourceCount,15);
  assert.equal(archive.sourceRows.length,15);
  assert.equal(archive.releaseEligible,0);
  assert.equal(archive.state,'RAW_SOURCE_BYTES_VERIFIED_NOT_MUSICAL_NOTATION_CERTIFIED_NOT_APPROVED_FOR_1962_RUNTIME');
  assert.equal(archive.originJobId,121725448255);
  assert.ok(archive.licence.includes('CC0'));
  const scoreElements=new Map();
  let totalBytes=0;
  for(const row of archive.sourceRows){
    assert.match(row.path,/^gregobase-[0-9]+-e[1-6]\.gabc$/);
    assert.match(row.sha256,/^[a-f0-9]{64}$/);
    assert.equal(row.sourceUrl,
      'https://gregobase.selapa.net/download.php?id='+row.scoreId+'&elem='+row.element+'&format=gabc');
    const bytes=readFileSync(new URL('../'+directory+row.path,import.meta.url));
    totalBytes+=bytes.length;
    assert.equal(bytes.length,row.bytes,'GABC byte length mismatch: '+row.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256,
      'GABC content has changed: '+row.path);
    const gabc=bytes.toString('utf8');
    assert.ok(gabc.includes('%%') && gabc.includes('Liber Usualis') && gabc.includes('1961'));
    scoreElements.set(row.scoreId,[...(scoreElements.get(row.scoreId)||[]),row.element]);
  }
  assert.equal(totalBytes,9841);
  assert.equal(scoreElements.size,10);
  assert.deepEqual(scoreElements.get(259).sort((a,b)=>a-b),[1,2,3,4,5,6],
    'Gloria laus must keep all six source files');
  for(const [scoreId,elements] of scoreElements){
    if(scoreId!==259)assert.deepEqual(elements,[1],'unexpected multi-part score '+scoreId);
  }
});
