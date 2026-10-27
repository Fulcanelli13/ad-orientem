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


test('archived Psalm 23 and Psalm 46 files are only first-verse tone exemplars', () => {
  const directory='data/research/chant-source-archive/1961-liber-usualis-gregobase-20261026/';
  const handoff=readJSON('data/research/processionale-roman-score-facsimile-handoff-20261026.v1.json');
  const byScore=new Map(handoff.gabcAudit.records.map(r=>[r.scoreId,r]));
  for(const id of [288,435]){
    assert.equal(byScore.get(id).fullPsalmTextInArchivedGabc,false);
    assert.equal(byScore.get(id).scoreBodyClass,'FIRST_VERSE_NOTATION_WITH_NEXT_VERSE_STUB');
  }
  const p23=readFileSync(new URL('../'+directory+'gregobase-288-e1.gabc',import.meta.url),'utf8');
  const p46=readFileSync(new URL('../'+directory+'gregobase-435-e1.gabc',import.meta.url),'utf8');
  assert.match(p23,/2\. Qui\(h\)a\.\.\./);
  assert.match(p46,/2\. Quó\(h\)ni\(h\)am\.\.\./);
  assert.ok(handoff.gabcAudit.archiveCoverageCaveat.includes('does not imply full verse/refrain musical completeness'));
  assert.equal(handoff.gabcAudit.fullNoteByNoteVerified,0);
});


test('Palm psalm old/new 1961 source editions remain distinct, unselected and not silently mixed', () => {
  const register=readJSON('data/research/processionale-roman-palm-psalter-editions-20261026.v1.json');
  assert.equal(register.status,'ORIGINAL_1962_VATICAN_FACSIMILE_CONFIRMS_RESTORED_PALM_PSALMS_GABC46_QUARANTINED');
  assert.equal(register.candidates.length,2);
  assert.deepEqual(register.printedEdition.oldPages,['167','168']);
  assert.deepEqual(register.printedEdition.newPages,['143**','144**']);
  assert.equal(register.sourceSafety.approvedRuntimeAssignments,0);
  assert.equal(register.romanRule.doNotAutoSelectEitherVersion,true);
  const byPsalm=new Map(register.candidates.map(x=>[x.psalm,x]));
  assert.equal(byPsalm.get(23).older.id,288);
  assert.equal(byPsalm.get(23).newer.id,19315);
  assert.equal(byPsalm.get(46).older.id,435);
  assert.equal(byPsalm.get(46).newer.id,19316);
  assert.notEqual(byPsalm.get(23).older.incipit,byPsalm.get(23).newer.incipit);
  assert.notEqual(byPsalm.get(46).older.incipit,byPsalm.get(46).newer.incipit);
  for(const ps of register.candidates){
    assert.equal(ps.stage,'PALM-R02');
    assert.equal(ps.older.edition,'TEXTUS_ANTIQUUS');
    assert.equal(ps.newer.edition,'TEXTUS_NOVUS');
    assert.equal(ps.newer.archived,true);
    assert.match(ps.newer.sha256,/^[a-f0-9]{64}$/);
  }
  assert.ok(register.acceptance.noFixedSongPlaylist);
  assert.ok(register.acceptance.noMovementInference);
  assert.equal(register.gates.filter(x=>x.status==='OPEN').length,3);
  assert.equal(register.gates.filter(x=>x.status==='OPEN_BLOCKING_VISUAL_SOURCE_CONFIRMED').length,1);
  assert.equal(byPsalm.get(46).newer.status,'PRINTED_PAGE_CONFIRMS_OMNES_POPULI_GABC_WRONG_UNDERLAY_BLOCKING');
  assert.match(byPsalm.get(46).newer.exactLatin1962,/Omnes pópuli/);
  assert.match(byPsalm.get(46).newer.gabcFirstWords,/Omnes gentes/);
  assert.equal(register.romanRule.primary1962Witness.inspection,'PRIMARY_PRINTED_1962_VATICAN_MISSAL_DIRECT_IMAGE_COLLATED');
});

test('original 1961 new-Psalter score images establish exact Psalm 46 incipit mismatch',()=>{
  const source=readJSON('data/research/processionale-roman-palm-psalter-editions-20261026.v1.json');
  assert.equal(source.printedEdition.originalScoreImagesVisuallyInspected,true);
  assert.equal(source.printedEdition.originalScoreImages.length,2);
  const byPage=new Map(source.printedEdition.originalScoreImages.map(x=>[x.page,x]));
  const p23=byPage.get('143**'),p46=byPage.get('144**');
  assert.equal(p23.url,'https://gregobase.selapa.net/sources/2/1179.png');
  assert.equal(p46.url,'https://gregobase.selapa.net/sources/2/1180.png');
  assert.equal(p23.verification,'DIRECT_IMAGE_INSPECTED');
  assert.equal(p46.verification,'DIRECT_IMAGE_INSPECTED');
  assert.deepEqual(p23.psalmVerseNumbers,[1,2,7,8,9,10]);
  assert.deepEqual(p46.psalmVerseNumbers,[1,2,3,4,5,6,7,8,9,10]);
  assert.equal(p46.firstWords,'Omnes populi, plaudite manibus');
  const gb46=source.candidates.find(x=>x.psalm===46).newer;
  assert.match(gb46.gabcFirstWords,/Omnes gentes/);
  assert.equal(gb46.originalPrintedIncipitVisuallyChecked,true);
  assert.equal(gb46.status,'PRINTED_PAGE_CONFIRMS_OMNES_POPULI_GABC_WRONG_UNDERLAY_BLOCKING');
  assert.equal(source.sourceSafety.approvedRuntimeAssignments,0);
});


test('restored Palm new Latin psalter has exact source-backed verse pairs and no fixed song clock',()=>{
 const registry=readJSON('data/research/processionale-roman-palm-psalter-editions-20261026.v1.json');
 const p=registry.acceptance.editorialProgramme;
 assert.equal(p.status,'APPROVED_STRUCTURE_FOR_RESEARCH_NO_RUNTIME_SCORE_AUTHORIZATION');
 assert.equal(p.form,'PALM_SUNDAY_RESTORED_ROMAN_RITE_DISTRIBUTION');
 assert.equal(p.psalms.length,2);
 const [p23,p46]=p.psalms;
 assert.equal(p23.preferredLatin,'TEXTUS_NOVUS_1961_APPENDIX');
 assert.equal(p46.preferredLatin,'TEXTUS_NOVUS_1961_APPENDIX');
 assert.deepEqual(p23.versePairs,[[1,2],[7,8],[9,10]]);
 assert.deepEqual(p46.versePairs,[[1,2],[3,4],[5,6],[7,8],[9,10]]);
 assert.equal(p23.verseIncipits.length,6);
 assert.equal(p46.verseIncipits.length,10);
 assert.equal(p23.verseIncipits[0].incipit,'Domini est terra et quae replent eam');
 assert.equal(p46.verseIncipits[0].incipit,'Omnes populi, plaudite manibus');
 assert.ok(p23.antiphonAfterEachPair && p46.antiphonAfterEachPair);
 assert.ok(p23.doXologyThenAntiphon && p46.doXologyThenAntiphon);
 assert.match(p.endOfDistribution,/ACTUAL_DISTRIBUTION_COMPLETION/);
 assert.equal(p.localChoirSignal,'MANUAL_OBSERVATION_NO_AUTOTIMER');
 assert.equal(registry.sourceSafety.approvedRuntimeAssignments,0);
});

test('two new-Psalter source files are hashed and Psalm 46 remains quarantined',()=>{
 const prefix='data/research/chant-source-archive/1961-graduale-novus-20261026/';
 const manifest=readJSON(prefix+'sha256-manifest.json');
 const register=readJSON('data/research/processionale-roman-palm-psalter-editions-20261026.v1.json');
 assert.equal(manifest.sourceCount,2);
 assert.equal(manifest.records.length,2);
 assert.equal(manifest.approvedRoman1962RuntimeScores,0);
 assert.equal(manifest.completeMelodyCertifications,0);
 assert.equal(register.sourceSafety.newPsalmTotalBytes,814);
 assert.equal(register.sourceSafety.newPsalmSourceCount,2);
 assert.equal(register.sourceSafety.scoreGabcSyntaxNotCertified,true);
 const expected=new Map([[19315,23],[19316,46]]);
 let total=0;
 for(const entry of manifest.records){
  assert.equal(expected.get(entry.gregobaseId),entry.psalm);
  assert.match(entry.sha256,/^[a-f0-9]{64}$/);
  const raw=readFileSync(new URL('../'+prefix+entry.file,import.meta.url));
  assert.equal(raw.length,entry.bytes);
  assert.equal(createHash('sha256').update(raw).digest('hex'),entry.sha256);
  total+=raw.length;
  const psalm=register.candidates.find(x=>x.psalm===entry.psalm);
  assert.equal(psalm.newer.sha256,entry.sha256);
  assert.equal(psalm.newer.archived,true);
  assert.equal(psalm.newer.archiveStatus,'RAW_BYTES_SHA256_VERIFIED_UNAPPROVED');
  assert.equal(psalm.newer.hasExtraGabcDelimiter,true);
  assert.match(raw.toString('utf8'),/%%\r?\n%%/);
 }
 assert.equal(total,814);
 const p46=manifest.records.find(x=>x.gregobaseId===19316);
 assert.equal(p46.disposition,'QUARANTINED_OMNES_GENTES_VS_ORIGINAL_OMNES_POPULI');
 const raw46=readFileSync(new URL('../'+prefix+p46.file,import.meta.url),'utf8');
 assert.match(raw46,/O\(f\)mnes\(gh\) gen\(h\)tes/);
 assert.equal(register.sourceSafety.approvedRuntimeAssignments,0);
});


test('Psalm 46 wrong Latin first word requires underlay review, not automated publication',()=>{
  const review=readJSON('data/research/processionale-palm46-gabc-underlay-review-20261026.v1.json');
  const base='data/research/chant-source-archive/1961-graduale-novus-20261026/';
  const manifest=readJSON(base+'sha256-manifest.json');
  assert.equal(review.status,'FACSIMILE_OPENING_RECITING_TONE_CANDIDATE_STAGED_NOT_FULL_SCORE_APPROVED');
  assert.equal(review.source.scoreId,19316);
  const source=manifest.records.find(x=>x.gregobaseId===19316);
  assert.equal(review.source.sha256,source.sha256);
  assert.match(review.source.archivedFile,/gregobase-19316\.gabc$/);
  const raw=readFileSync(new URL('../'+review.source.archivedFile,import.meta.url),'utf8');
  assert.equal(raw.split(review.issue.existingGabcText).length,2);
  assert.equal(review.issue.badSyllableCount,4);
  assert.equal(review.issue.requiredSyllableCount,5);
  assert.equal(review.issue.existingGabcText,'O(f)mnes(gh) gen(h)tes,(h)');
  assert.equal(review.candidate.openingGabc,'O(f)mnes(gh) pó(h)pu(h)li,(h)');
  assert.equal(review.candidate.openingTokens.length,5);
  assert.equal(review.candidate.pitchAssignmentOfNewExtraSyllable,undefined);
  assert.equal(review.issue.pitchAssignmentOfNewExtraSyllable,'VISUALLY_CORRELATED_TO_PRINTED_RECITING_TONE_BUT_NOT_HUMAN_SIGNED_OFF');
  assert.equal(review.candidate.publicationEligible,false);
  assert.equal(review.sourceChecks.productionApproved,false);
  assert.ok(review.candidate.mustBeReviewedAgainstPrint);
  assert.ok(review.header.rawContainsDoubleDelimiter);
  assert.ok(raw.includes('\n%%\n%%\r\n'));
  assert.ok(review.sourceChecks.rawArchivedFileImmutable);
  assert.ok(!raw.includes(review.candidate.openingGabc),
    'Research suggestion must never overwrite immutable original GABC');
});


test('Psalm 46 research score changes only source name, one reciting syllable and delimiter',()=>{
 const fixture=readJSON('data/research/processionale-palm46-gabc-underlay-review-20261026.v1.json');
 const raw=readFileSync(new URL('../'+fixture.source.archivedFile,import.meta.url),'utf8');
 const reviewed=readFileSync(new URL('../'+fixture.candidate.file,import.meta.url),'utf8');
 const transformations=[
 ['name:Omnes gentes, plaudite manibus (nova lat.);',
  'name:Omnes populi, plaudite manibus (Psalmus 46, provisional);'],
 ['transcriber:Simone Sanavio;\n',
  'transcriber:Simone Sanavio;\ncommentary: Ad Orientem research-only corrected opening underlay - NOT editorially certified or published;\n'],
 ['\n%%\n%%\r\n','\n%%\n'],
 ['O(f)mnes(gh) gen(h)tes,(h)','O(f)mnes(gh) pó(h)pu(h)li,(h)']
 ];
 let expected=raw;
 for(const [before,after] of transformations){
  assert.equal(expected.split(before).length,2,'unexpected source editing context');
  expected=expected.replace(before,after);
 }
 assert.equal(reviewed,expected,
  'No silent pitch, accent, other neume or verse text changes permitted');
 assert.equal(reviewed.split('%%').length,2);
 assert.match(reviewed,/O\(f\)mnes\(gh\) pó\(h\)pu\(h\)li,\(h\)/);
 assert.equal(fixture.candidate.openingPitchContourVisuallyCompared,true);
 assert.equal(fixture.candidate.completeChantPitchAndNeumesCertified,false);
 assert.equal(fixture.candidate.fileRole,'READ_ONLY_RESEARCH_FIXTURE_NO_RUNTIME_REFERENCE');
 assert.equal(fixture.candidate.publicationEligible,false);
 assert.equal(fixture.sourceChecks.productionApproved,false);
 assert.equal(fixture.review.remainingGates.length,5);
 const palmReader=readFileSync(new URL('../src/mass/reader-palm.js',import.meta.url),'utf8');
 assert.ok(!palmReader.includes('palm46-omnes-populi-1961-provisional.gabc'));
});


test('Psalm 46 1961 chant-line 9 and 10 are two halves of one biblical verse',()=>{
  const data=readJSON('data/research/processionale-palm46-dual-numbering-20261026.v1.json');
  const edition=readJSON('data/research/processionale-roman-palm-psalter-editions-20261026.v1.json');
  assert.equal(data.stageId,'PALM-R02');
  assert.equal(data.status,'SOURCE_VERIFIED_NUMBERING_ONLY_NOT_FULL_TEXT_RELEASE');
  assert.equal(data.printedPage,'144**');
  assert.equal(data.counts.biblicalPsalmVerses,9);
  assert.equal(data.counts.printedPsalmChantLines,10);
  assert.equal(data.counts.printedDoxologyLines,2);
  assert.equal(data.counts.numberedLinesIncludingDoxology,12);
  assert.deepEqual(data.crosswalk.slice(0,10).map(x=>x.printedLine),
    [1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(data.crosswalk.slice(0,10).map(x=>x.biblicalVerse),
    [1,2,3,4,5,6,7,8,9,9]);
  assert.equal(data.crosswalk[8].biblicalHalf,'A');
  assert.equal(data.crosswalk[9].biblicalHalf,'B');
  assert.equal(data.crosswalk[10].liturgy,'GLORIA_PATRI');
  assert.equal(data.crosswalk[11].liturgy,'SICUT_ERAT');
  assert.deepEqual(data.performance.pairOrder,[[1,2],[3,4],[5,6],[7,8],[9,10]]);
  assert.equal(data.performance.lastPairBothBiblicalVerse,9);
  assert.equal(data.performance.repeatAntiphonAfterEachPair,true);
  const ps=edition.acceptance.editorialProgramme.psalms.find(x=>x.psalm===46);
  assert.equal(ps.numberingProofPath,'data/research/processionale-palm46-dual-numbering-20261026.v1.json');
  assert.equal(ps.printedVerseCount,10);
  assert.equal(ps.biblicalVerseCount,9);
  assert.deepEqual(ps.verseIncipits.slice(-2).map(x=>x.biblicalVerse),[9,9]);
  assert.deepEqual(ps.verseIncipits.slice(-2).map(x=>x.biblicalHalf),['A','B']);
  assert.equal(edition.sourceSafety.approvedRuntimeAssignments,0);
});


test('original Vatican 1962 Palm printed Missal governs Latin Psalm 23/46 and ceremony',()=>{
 const source=readJSON('data/research/processionale-palm-1962-primary-facsimile-20261026.v1.json');
 const edition=readJSON('data/research/processionale-roman-palm-psalter-editions-20261026.v1.json');
 assert.equal(source.schema,'ao-roman1962-palm-distribution-primary-facsimile-collation-v1');
 assert.equal(source.status,'PRIMARY_1962_PRINTED_SOURCE_VISUALLY_COLLATED_ROMAN_OWNER_SIGNOFF_PENDING');
 assert.deepEqual(source.source.facsimiles.map(x=>x.printedPage),[130,131,132]);
 assert.deepEqual(source.source.facsimiles.map(x=>x.url),[
   'https://gregobase.selapa.net/sources/42/212.png',
   'https://gregobase.selapa.net/sources/42/213.png',
   'https://gregobase.selapa.net/sources/42/214.png'
 ]);
 assert.equal(source.ceremony.stageId,'PALM-R02');
 assert.equal(source.ceremony.paragraph,12);
 assert.match(source.ceremony.rule,/distribution finishes/);
 assert.equal(source.ceremony.notAnAutomatedMusicTimer,true);
 assert.equal(source.psalm23.firstLatin,'Domini est terra et quae replent eam');
 assert.deepEqual(source.psalm23.printedVersePairs,[[1,2],[7,8],[9,10]]);
 assert.equal(source.psalm46.firstLatin,'Omnes populi, plaudite manibus');
 assert.equal(source.psalm46.printedPairs.length,5);
 assert.deepEqual(source.psalm46.printedPairs.map(x=>x.lines),
   [[1,2],[3,4],[5,6],[7,8],[9,10]]);
 assert.equal(source.psalm46.printedPairs.at(-1).biblicalVerseBoth,9);
 assert.equal(source.psalm46.gabc19316,false);
 assert.deepEqual(source.psalm46.doxologyLines,
   ['Gloria Patri, et Filio','Sicut erat in principio']);
 assert.equal(edition.romanRule.status,'PRIMARY_1962_PRINT_VISUALLY_VERIFIED_TEXT_RUBRIC_OWNER_SIGNOFF_PENDING');
 assert.equal(edition.romanRule.primary1962Witness.inspection,'PRIMARY_PRINTED_1962_VATICAN_MISSAL_DIRECT_IMAGE_COLLATED');
 assert.equal(edition.romanRule.primary1962Witness.humanOwnerAccepted,false);
 assert.equal(source.promotion.sourceTextDirectImageVerified,true);
 assert.equal(source.promotion.sourceRubricDirectImageVerified,true);
 assert.equal(source.promotion.ownerSignedOff,false);
 assert.equal(source.promotion.completePsalmPointingCertified,false);
 assert.equal(source.promotion.approvedScholaRuntimeScores,0);
 assert.equal(edition.sourceSafety.approvedRuntimeAssignments,0);
});


test('actual native Exsurge success closes only SVG render gate, not editorial approval',()=>{
 const review=readJSON('data/research/processionale-palm46-gabc-underlay-review-20261026.v1.json');
 const report=review.nativeExsurgeProof;
 assert.equal(report.conclusion,'success');
 assert.equal(report.status,'COMPLETE_3_VIEWPORTS_SVG_PARSE_RENDER_PROOF_ONLY');
 assert.equal(report.runId,40378960243);
 assert.equal(report.jobId,121769655876);
 assert.equal(report.rawSourceSha256,review.source.sha256);
 assert.equal(report.pinnedExistingScholaSourceCommit,'8a75c2cbb6ea2bc6ba26da30ec923b3dc8c827e1');
 assert.equal(report.compared.length,2);
 for(const item of report.compared){
   assert.equal(item.parsedMappings,12);
   assert.deepEqual(item.viewports.map(x=>x.widthPx),[260,420,800]);
   assert.deepEqual(item.viewports.map(x=>x.staffSystems),[2,1,1]);
   assert.ok(item.viewports.every(x=>x.svgChildren>=1));
 }
 assert.equal(report.releaseEligible,false);
 assert.equal(review.candidate.renderingProofPassed,true);
 assert.equal(review.candidate.humanMusicalReviewPassed,false);
 assert.equal(review.candidate.publicationEligible,false);
 assert.equal(review.sourceChecks.productionApproved,false);
 assert.ok(report.falseClaims.includes('full printed neume/pitch certification'));
 const registry=readJSON('data/research/processionale-roman-palm-psalter-editions-20261026.v1.json');
 assert.equal(registry.sourceSafety.approvedRuntimeAssignments,0);
});


test('Palm distribution 16 Latin psalm incipits agree across the research registers',()=>{
  const audit=readJSON('data/research/processionale-palm-1962-incipit-reconciliation-20261026.v1.json');
  const printed=readJSON('data/research/processionale-palm-1962-primary-facsimile-20261026.v1.json');
  const edition=readJSON('data/research/processionale-roman-palm-psalter-editions-20261026.v1.json');
  const dual=readJSON('data/research/processionale-palm46-dual-numbering-20261026.v1.json');
  assert.equal(audit.completeness.incipits,16);
  assert.equal(audit.completeness.completePsalmVersesCertified,0);
  assert.equal(audit.completeness.musicalMelodiesCertified,0);
  assert.equal(audit.completeness.approvedRuntimeAssignments,0);
  assert.deepEqual(audit.psalms.map(p=>p.incipits.length),[6,10]);
  assert.deepEqual(audit.psalms[1].biblicalVerseNumbers,[1,2,3,4,5,6,7,8,9,9]);
  assert.equal(audit.psalms[1].incipits[2],'Subicit populos nobis');
  assert.equal(printed.psalm46.printedPairs[1].starts[0],'Subicit populos nobis');
  assert.notEqual(printed.psalm46.printedPairs[1].starts[0],'Subicit nobis nationes');
  const actual=edition.acceptance.editorialProgramme.psalms.find(x=>x.psalm===46).verseIncipits;
  const normalized=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^\p{L} ]/gu,'').replace(/\s+/g,' ').trim().toLowerCase();
  assert.deepEqual(actual.map(x=>normalized(x.incipit)),audit.psalms[1].incipits.map(normalized));
  assert.equal(dual.reconciliationPath,
    'data/research/processionale-palm-1962-incipit-reconciliation-20261026.v1.json');
  assert.equal(edition.sourceSafety.approvedRuntimeAssignments,0);
  assert.equal(audit.psalms[1].incipits[0],'Omnes populi plaudite manibus');
  assert.ok(audit.corrections.resolved.some(x=>x.includes('wrong Psalm 22 heading')));
});


test('sixteen complete Latin candidates remain source-only until 1962 image and chant pointing reviews',()=>{
  const c=readJSON('data/research/processionale-palm-1962-full-verse-candidates-20261026.v1.json');
  const inc=readJSON('data/research/processionale-palm-1962-incipit-reconciliation-20261026.v1.json');
  const clean=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^\p{L} ]/gu,'').replace(/\s+/g,' ').trim().toLowerCase();
  assert.equal(c.stage,'PALM-R02');
  assert.equal(c.batch,17);
  assert.equal(c.source.excludedAncient.explicitLabel,'Textus antiquus');
  assert.deepEqual(c.psalms.map(x=>x.lines.length),[6,10]);
  assert.deepEqual(c.psalms[1].biblicalNumbers,[1,2,3,4,5,6,7,8,9,9]);
  for(let i=0;i<2;i++){
    const p=c.psalms[i], old=inc.psalms[i];
    assert.deepEqual(p.lines.map(x=>x.liturgicalLine),p.liturgicalNumbers);
    for(let j=0;j<p.lines.length;j++){
      const l=p.lines[j];
      assert.ok(clean(l.firstHemistich).startsWith(clean(old.incipits[j])));
      assert.ok(l.secondHemistich.length>=8);
      assert.equal(l.mediantSeparator,'*');
      assert.equal(l.completeVerseCandidate,true);
      assert.equal(l.facsimileConfirmedInThisBatch,false);
      assert.equal(l.pointedPsalmToneCertified,false);
    }
  }
  assert.equal(c.psalms[1].lines.at(-1).biblicalVerse,9);
  assert.equal(c.psalms[1].lines[2].firstHemistich,'Subicit populos nobis');
  assert.equal(c.psalms[1].lines[3].firstHemistich,'Eligit nobis hereditatem nostram');
  assert.ok(c.variantHolds.some(x=>x.psalm===23 && x.candidate==='fores antiquae'));
  assert.equal(c.repeatRules.noFixedAudioClock,true);
  assert.equal(c.promotion.candidateWholeVerses,16);
  assert.equal(c.promotion.verifiedLatinFullVersesBy1962Owner,0);
  assert.equal(c.promotion.primaryAsteriskPositionsIndependentlyCheckedThisBatch,0);
  assert.equal(c.promotion.completeMusicalPointingVerified,0);
  assert.equal(c.promotion.neumeUnderlayCertified,0);
  assert.equal(c.promotion.productionScoresAssigned,0);
  assert.equal(c.promotion.publicationAllowed,false);
  const palm=readFileSync(new URL('../src/mass/reader-palm.js',import.meta.url),'utf8');
  assert.ok(!palm.includes('processionale-palm-1962-full-verse-candidates'));
});

test('1961 Graduale printed Psalm 23 and 46 full text has three flex daggers',()=>{
  const gr=readJSON('data/research/processionale-palm-1961-graduale-fulltext-collation-20261026.v1.json');
  const c=readJSON('data/research/processionale-palm-1962-full-verse-candidates-20261026.v1.json');
  assert.equal(gr.stage,'PALM-R02');
  assert.deepEqual(gr.source.printedPages,['143**','144**']);
  assert.deepEqual(gr.source.pdfZeroPages,[142,143]);
  assert.equal(gr.lines.length,16);
  assert.deepEqual(gr.lines.filter(x=>x.psalm===23).map(x=>x.liturgicalLine),[1,2,7,8,9,10]);
  assert.deepEqual(gr.lines.filter(x=>x.psalm===46).map(x=>x.liturgicalLine),[1,2,3,4,5,6,7,8,9,10]);
  assert.equal(gr.lines.filter(x=>x.medialStar).length,16);
  assert.deepEqual(gr.lines.filter(x=>x.flexAfter).map(x=>[x.psalm,x.liturgicalLine,x.flexAfter]),[
    [23,7,'capita vestra'],[23,8,'Quis est iste rex gloriae'],[23,9,'capita vestra']
  ]);
  for(const l of gr.lines){
    const candidate=c.psalms.find(x=>x.psalm===l.psalm)?.lines.find(x=>x.liturgicalLine===l.liturgicalLine);
    assert.ok(candidate);
    assert.equal(l.biblicalVerse,candidate.biblicalVerse);
    assert.equal(l.firstHemistich,candidate.firstHemistich);
    assert.equal(l.secondHemistich,candidate.secondHemistich);
  }
  assert.equal(gr.psalm46Line3PrintedSpelling,'Subjicit populos nobis');
  assert.equal(gr.psalm23Line7And9PrintedReading,'fores antiquae');
  assert.equal(gr.counts.full1961PrintTextLinesVerified,16);
  assert.equal(gr.counts.psalm23FlexDaggers,3);
  assert.equal(gr.counts.original1962FullVersesVerifiedThisBatch,0);
  assert.equal(gr.counts.fullPsalmTonePointingApproved,0);
  assert.equal(gr.counts.pitchNeumesCertified,0);
  assert.equal(gr.counts.runtimeScoresApproved,0);
  assert.equal(gr.readOnly,true);
});

test('second independent 1962 Missal printed witness resolves Palm lexical OCR discrepancy',()=>{
  const scan=readJSON('data/research/processionale-palm-1962-independent-print-scan-20261026.v1.json');
  const candidate=readJSON('data/research/processionale-palm-1962-full-verse-candidates-20261026.v1.json');
  const gr=readJSON('data/research/processionale-palm-1961-graduale-fulltext-collation-20261026.v1.json');
  assert.equal(scan.stage,'PALM-R02');
  assert.deepEqual(scan.source.pages.map(p=>p.printedPage),[134,135]);
  assert.deepEqual(scan.source.pages.map(p=>p.scanNo),[211,212]);
  assert.ok(scan.source.pages.every(p=>p.url.includes('/Missale-Romanum-1962-Roman-Missal-color-')));
  assert.equal(scan.source.imprintStatus,'BENZIGER_BROTHERS_1962_EDITIO_IUXTA_TYPICAM_PRINTED_IMPRINT_AUTHENTICATED');
  assert.equal(scan.source.bibliography.publisher,'Benziger Brothers, Inc.');
  assert.equal(scan.source.bibliography.publishingPlace,'Novi Eboraci (New York)');
  assert.equal(scan.source.bibliography.editionDesignation,'Editio iuxta typicam');
  assert.equal(scan.source.bibliography.printedApprovalDate,'1962-03-01');
  assert.ok(scan.source.bibliography.titlePage.endsWith('-0012.jpg'));
  assert.ok(scan.source.bibliography.archdiocesanApprovalPage.endsWith('-0014.jpg'));
  assert.equal(scan.promotion.nonVaticanAuthorizedEditionBibliographicallyIdentified,true);
  assert.deepEqual(scan.coverage.ps23WholeVersesVisible,[1,2,7,8,9,10]);
  assert.deepEqual(scan.coverage.ps46WholeChantLinesVisible,[1,2,3,4,5,6,7,8,9,10]);
  assert.equal(scan.coverage.ps46BiblicalVerses,9);
  assert.equal(scan.coverage.totalWholeVerseTextLinesVisuallyCompared,16);
  assert.equal(scan.coverage.musicalMediantStarsCompared,16);
  assert.deepEqual(scan.sourceConclusions[0].liturgicalLines,[7,9]);
  assert.equal(scan.sourceConclusions[0].reading,'et attollite vos, fores antiquae');
  assert.equal(scan.sourceConclusions[0].rejectedOCR,'et attollite vos, portae antique');
  assert.equal(scan.sourceConclusions[1].modernizedOrthography,'Subicit populos nobis');
  assert.equal(scan.sourceConclusions[2].reading,'Eligit nobis hereditatem nostram');
  assert.equal(candidate.batch19Followup.printedLexicalVariantConfirmed,'fores antiquae');
  assert.equal(candidate.batch19Followup.official1962SourceOwnerSignoff,false);
  assert.ok(candidate.variantHolds[0].disposition.startsWith('RESOLVED_AGAINST_SECOND_INDEPENDENT_PRINTED_1962_SCAN'));
  assert.ok(gr.hold.startsWith('RESOLVED_PRINTED_1962_INDEPENDENT_PHOTOGRAPH'));
  assert.equal(scan.timing.repeatUntilPhysicalDistributionEnds,true);
  assert.equal(scan.timing.whenVersesFinishEarlyConcludeWithGloriaAndAntiphon,true);
  assert.equal(scan.timing.noFixedDuration,true);
  assert.equal(scan.promotion.officialVaticanTypicaEditionIdentitySignedOff,false);
  assert.equal(scan.promotion.canonicalLatinOwnerSignedOff,false);
  assert.equal(scan.promotion.completeGregorianPointingSignedOff,false);
  assert.equal(scan.promotion.individualNoteUnderlaySignedOff,false);
  assert.equal(scan.promotion.approvedRuntimeScores,0);
  assert.equal(scan.promotion.publicationAllowed,false);
});

test('restored Palm psalm opening GABC print evidence stays distinct from verse pointing',()=>{
  const audit=readJSON('data/research/processionale-palm-1961-gabc-opening-audit-20261026.v1.json');
  const raw23=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19315.gabc',import.meta.url),'utf8');
  const raw46=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19316.gabc',import.meta.url),'utf8');
  const corrected=readFileSync(new URL('../data/research/chant-source-review/palm46-omnes-populi-1961-provisional.gabc',import.meta.url),'utf8');
  const sha=s=>createHash('sha256').update(s).digest('hex');
  assert.equal(audit.stage,'PALM-R02');
  assert.deepEqual(audit.basis.zeroBasedPages,[142,143]);
  assert.equal(audit.psalm23.scoreId,19315);
  assert.equal(audit.psalm46.scoreId,19316);
  assert.equal(sha(raw23),audit.psalm23.archiveSha256);
  assert.equal(sha(raw46),audit.psalm46.archiveSha256);
  assert.ok(raw23.includes('DO(f)mi(gh)ni(h) est(h) ter(h)ra,(h)'));
  assert.ok(raw23.includes('rex(h) glo(h)ri(gr)æ?(g.)'));
  assert.ok(raw46.includes('O(f)mnes(gh) gen(h)tes,(h)'));
  assert.ok(corrected.includes('O(f)mnes(gh) pó(h)pu(h)li,(h)'));
  assert.deepEqual(audit.psalm46.archivedBadPitchGroups,['f','gh','h','h']);
  assert.deepEqual(audit.psalm46.candidatePitchGroups,['f','gh','h','h','h']);
  const tail='<b>pláu</b>';
  assert.equal(raw46.split(tail).length,2);
  assert.equal(corrected.split(tail).length,2);
  assert.equal(raw46.split(tail)[1],corrected.split(tail)[1]);
  assert.equal(audit.psalm46.entireFollowingGabcBodyByteIdentical,true);
  assert.deepEqual(audit.psalm23.printedFlexAfterChantLines,[7,8,9]);
  assert.equal(audit.psalm46.humanMusicianAndPrintedNeumeApproval,false);
  assert.equal(audit.musicalExpansionHandoff.lineCount,16);
  assert.equal(audit.musicalExpansionHandoff.remainingManualAdaptationLines,14);
  assert.equal(audit.musicalExpansionHandoff.readOnlyNoRuntimeAssignment,true);
  const pending=audit.musicalExpansionHandoff.lineReview.filter(x=>x.requiresManualPsalmToneAdaptation);
  const completeFirst=audit.musicalExpansionHandoff.lineReview.filter(x=>x.firstVerseFullStaffPrinted);
  assert.deepEqual(completeFirst.map(x=>[x.psalm,x.printedChantLine]),[[23,1],[46,1]]);
  assert.equal(pending.length,14);
  assert.deepEqual(pending.filter(x=>x.printedFlexa).map(x=>x.printedChantLine),[7,8,9]);
  assert.deepEqual(pending.filter(x=>x.psalm===46).slice(-2).map(x=>x.biblicalVerse),[9,9]);
  assert.ok(pending.every(x=>!x.accentCadenceUnderlaySignedOff));
  assert.ok(audit.musicalExpansionHandoff.lineReview.every(x=>x.printedMediantAsterisk));
  assert.equal(audit.sharedConstraints.fullPrintedPsalmTextVerses,16);
  assert.equal(audit.sharedConstraints.completeVersesIndividuallyFullyNotated,2);
  assert.equal(audit.sharedConstraints.otherVersesNeedIndependentPsalmTonePointing,14);
  assert.equal(audit.sharedConstraints.psalm46LiturgicalLines9And10AreOneBiblicalVerse,true);
  assert.equal(audit.sharedConstraints.noAutomaticVerseToNoteMapping,true);
  assert.equal(audit.release.canonical1962FullTextHumanApproved,false);
  assert.equal(audit.release.printedFullMusicalUnderlayVerified,false);
  assert.equal(audit.release.pitchNeumeHumanCertification,false);
  assert.equal(audit.release.complete14RemainingPsalmTonesApproved,false);
  assert.equal(audit.release.approvedRuntimeAssignments,0);
  assert.equal(audit.release.publicationEligible,false);
  const runtime=readFileSync(new URL('../src/mass/reader-palm.js',import.meta.url),'utf8');
  assert.ok(!runtime.includes('processionale-palm-1961-gabc-opening-audit'));
});


test('Psalm 23 verse 8 flex cannot be conflated with mediant, and 14 pending verse patterns remain unpublished',()=>{
 const w=readJSON('data/research/processionale-palm-14verse-pointing-worklist-20261027.v1.json');
 const c=readJSON('data/research/processionale-palm-1962-full-verse-candidates-20261026.v1.json');
 const gr=readJSON('data/research/processionale-palm-1961-graduale-fulltext-collation-20261026.v1.json');
 const aud=readJSON('data/research/processionale-palm-1961-gabc-opening-audit-20261026.v1.json');
 assert.equal(w.stage,'PALM-R02');
 assert.equal(w.work.length,14);
 assert.equal(w.counting.completePsalmTextLines,16);
 assert.equal(w.counting.firstVerseFullMusicTemplates,2);
 assert.equal(w.counting.distinctTextAndMarkerPatterns,13);
 assert.equal(w.counting.samePsalmReusableOccurrencePairs,1);
 assert.equal(w.counting.p23FlexedOccurrences,3);
 const v8=c.psalms[0].lines.find(l=>l.liturgicalLine===8);
 assert.equal(v8.firstHemistich,'Quis est iste rex gloriae? Dominus fortis et potens,');
 assert.equal(v8.secondHemistich,'Dominus potens in proelio.');
 assert.equal(v8.flexAfter,'Quis est iste rex gloriae?');
 assert.equal(v8.printedFlexaSeparator,'†');
 const g8=gr.lines.find(l=>l.psalm===23&&l.liturgicalLine===8);
 assert.equal(g8.firstHemistich,v8.firstHemistich);
 assert.equal(g8.secondHemistich,v8.secondHemistich);
 assert.deepEqual(g8.markersInPrintedOrder,['†','*']);
 const a8=aud.musicalExpansionHandoff.lineReview.find(l=>l.psalm===23&&l.printedChantLine===8);
 assert.equal(a8.sourceLatinFirstHemistich,v8.firstHemistich);
 const p8=w.work.find(l=>l.psalm===23&&l.printedChantLine===8);
 const p10=w.work.find(l=>l.psalm===23&&l.printedChantLine===10);
 assert.deepEqual(p8.markerSequence,['†','*']);
 assert.equal(p8.sourceSections.flex,'Quis est iste rex gloriae?');
 assert.equal(p8.sourceSections.medial,'Dominus fortis et potens,');
 assert.equal(p8.sourceSections.termination,'Dominus potens in proelio.');
 assert.deepEqual(p10.markerSequence,['*']);
 assert.equal(p10.sourceSections.medial,'Quis est iste rex gloriae?');
 assert.notEqual(p8.reuseKey,p10.reuseKey);
 const groups=Object.groupBy(w.work,l=>l.reuseKey);
 const matches=Object.values(groups).filter(g=>g.length>1);
 assert.equal(matches.length,1);
 assert.deepEqual(matches[0].map(l=>l.printedChantLine),[7,9]);
 assert.deepEqual(w.work.filter(l=>l.psalm===23&&l.sourceSections.flex).map(l=>l.printedChantLine),[7,8,9]);
 assert.deepEqual(w.work.filter(l=>l.psalm===46).slice(-2).map(l=>l.biblicalVerse),[9,9]);
 assert.ok(w.work.every(l=>!l.wordStressCandidatesCertified&&!l.completeGabcScoreCertified&&!l.terminationCadenceCertified));
 assert.ok(w.work.every(l=>l.markerSequence.join('')=== (l.sourceSections.flex?'†*':'*')));
 assert.equal(w.counting.fullApprovedMusicalVerseAdaptations,0);
 assert.equal(w.counting.productionScoreAssignments,0);
 assert.equal(w.scopeGuards.neumeLevelHumanSignoff,false);
 assert.equal(w.scopeGuards.releaseEligible,false);
 assert.equal(w.doxology.notIncludedIn14OccurrenceCount,true);
 const palm=readFileSync(new URL('../src/mass/reader-palm.js',import.meta.url),'utf8');
 assert.ok(!palm.includes('processionale-palm-14verse-pointing-worklist'));
});


test('printed Psalm accents and doxologies remain tone-specific research',()=>{
  const a=readJSON('data/research/processionale-palm-1961-accent-doxology-review-20261027.v1.json');
  const w=readJSON('data/research/processionale-palm-14verse-pointing-worklist-20261027.v1.json');
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/subjicit/g,'subicit').replace(/praelio/g,'proelio')
    .replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
  assert.equal(a.stage,'PALM-R02');
  assert.equal(a.batch,22);
  assert.equal(a.patterns.length,13);
  assert.equal(w.accentReviewLink.path,'data/research/processionale-palm-1961-accent-doxology-review-20261027.v1.json');
  assert.equal(w.accentReviewLink.totalPendingToneApplications,18);
  assert.equal(w.accentReviewLink.allToneCadencesApproved,false);
  assert.equal(a.patterns.flatMap(x=>x.occurrenceIds).length,14);
  assert.equal(a.counts.printedAccentedWordsTranscribed,46);
  const p7=a.patterns.find(x=>x.patternId==='PALM-R02-PS23-L07');
  assert.equal(p7.sourceSectionAccents.flex,'Attóllite, portae, cápita vestra,');
  assert.ok(p7.printedAccentedWords.some(x=>x.word==='cápita'));
  assert.equal(a.doxology.filter(x=>x.printedAccentText.medial.startsWith('Glória Patri')).length,2);
  assert.equal(a.batch23Reinspection.confirmedCorrections.length,2);
  assert.equal(a.batch23Reinspection.uncertainAccentChecks.length,1);
  assert.equal(a.batch23Reinspection.musicalAccentCadencePlacementApproved,false);
  const all=new Map(w.work.map(x=>[x.id,x]));
  for(const pattern of a.patterns){
    assert.ok(pattern.occurrenceIds.length>=1);
    assert.equal(pattern.toneCadenceSignoff,false);
    assert.equal(pattern.fullPointingSignedOff,false);
    for(const id of pattern.occurrenceIds){
      const ref=all.get(id);
      assert.ok(ref);
      assert.equal(pattern.psalm,ref.psalm);
      assert.deepEqual(Object.keys(pattern.sourceSectionAccents),Object.keys(ref.sourceSections));
      for(const section of Object.keys(ref.sourceSections))
        assert.equal(norm(pattern.sourceSectionAccents[section]),norm(ref.sourceSections[section]));
    }
  }
  assert.deepEqual(a.patterns.filter(x=>x.occurrenceIds.length===2)[0].occurrenceIds,
    ['PALM-R02-PS23-L07','PALM-R02-PS23-L09']);
  const p8=a.patterns.find(x=>x.patternId==='PALM-R02-PS23-L08');
  assert.deepEqual(Object.keys(p8.sourceSectionAccents),['flex','medial','termination']);
  assert.ok(p8.sourceSectionAccents.termination.endsWith('praélio.'));
  assert.equal(a.orthographicVariants.length,2);
  assert.equal(a.orthographicVariants[0].researchCandidate,'proelio');
  assert.equal(a.orthographicVariants[0].print1961,'praélio');
  assert.equal(a.orthographicVariants[1].researchCandidate,'Subicit');
  assert.equal(a.orthographicVariants[1].print1961,'Súbjicit');
  assert.ok(a.orthographicVariants.every(v=>v.automaticLatinReplacement===false));
  assert.deepEqual(a.doxology.map(x=>x.id),[
    'PALM-R02-PS23-DOXO-L11','PALM-R02-PS23-DOXO-L12',
    'PALM-R02-PS46-DOXO-L11','PALM-R02-PS46-DOXO-L12']);
  assert.equal(a.counts.doxologyToneApplications,4);
  assert.equal(a.counts.totalPendingMusicalApplications,18);
  assert.equal(a.counts.distinctReviewItemsIncludingEachPsalmsDoxology,17);
  assert.ok(a.doxology.every(x=>x.completePointingApproved===false));
  assert.ok(a.doxology.every(x=>x.toneMustBeReviewedWithinOwnPsalm===true));
  assert.equal(a.critical.ps23EightFlexSeparateFromMediant,true);
  assert.equal(a.critical.noAutomaticLiveClock,true);
  assert.equal(a.publication.humanEditorialAccentVerificationComplete,false);
  assert.equal(a.publication.wordSyllableNeumeUnderlayCertified,false);
  assert.equal(a.publication.productionScoreAssignments,0);
  assert.equal(a.publication.eligible,false);
  const runtime=readFileSync(new URL('../src/mass/reader-palm.js',import.meta.url),'utf8');
  assert.ok(!runtime.includes('processionale-palm-1961-accent-doxology-review'));
});


test('1961 source cadence motifs are immutable GABC evidence, not approved Psalm tone transfers',()=>{
 const c=readJSON('data/research/processionale-palm-1961-cadence-motif-source-20261027.v1.json');
 assert.equal(c.stage,'PALM-R02');
 assert.equal(c.batch,23);
 assert.equal(c.psalms.length,2);
 assert.deepEqual(c.psalms.map(x=>x.psalm),[23,46]);
 const canonical=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19315.gabc',import.meta.url),'utf8');
 const old46=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19316.gabc',import.meta.url),'utf8');
 const candidate46=readFileSync(new URL('../data/research/chant-source-review/palm46-omnes-populi-1961-provisional.gabc',import.meta.url),'utf8');
 for(const [ps,src] of [[c.psalms[0],canonical],[c.psalms[1],old46]]){
    const firstVerse=ps.psalm===23?ps.firstVerseEvidence:ps.rawFirstVerseEvidence;
    assert.ok(src.includes(firstVerse));
    assert.equal(firstVerse.includes('*(:)'),true);
    assert.equal(src.includes(ps.mediantCadenceExcerpt),true);
    assert.equal(src.includes(ps.terminationCadenceExcerpt),true);
    assert.equal(ps.humanCadenceApplicationApproval,false);
 }
 assert.ok(c.psalms[0].secondVerseCue.includes('Flexa :'));
 assert.ok(canonical.includes(c.psalms[0].flexExample));
 const ps46=c.psalms[1];
 assert.ok(old46.includes(ps46.rawBadOpening));
 assert.ok(candidate46.includes(ps46.provisionalOpening));
 assert.ok(candidate46.includes(ps46.provisionalFirstVerseEvidence));
 assert.equal(ps46.rawBadOpening,'O(f)mnes(gh) gen(h)tes,(h)');
 assert.equal(ps46.provisionalOpening,'O(f)mnes(gh) pó(h)pu(h)li,(h)');
 assert.deepEqual(ps46.oldNotes,['f','gh','h','h']);
 assert.deepEqual(ps46.provisionalNotes,['f','gh','h','h','h']);
 assert.equal(old46.split('<b>pláu</b>')[1],candidate46.split('<b>pláu</b>')[1]);
 assert.equal(c.counting.firstVerseCadenceFragments,4);
 const w=readJSON('data/research/processionale-palm-14verse-pointing-worklist-20261027.v1.json');
 assert.equal(w.firstVerseCadenceAnchorLink.path,'data/research/processionale-palm-1961-cadence-motif-source-20261027.v1.json');
 assert.equal(w.firstVerseCadenceAnchorLink.psalm23.flexExampleAvailable,true);
 assert.equal(w.firstVerseCadenceAnchorLink.psalm46.rawTextQuarantined,true);
 assert.equal(w.firstVerseCadenceAnchorLink.firstVersePitchTemplateCertification,false);
 assert.equal(w.firstVerseCadenceAnchorLink.otherVerseToneApprovalCount,0);
 assert.equal(c.counting.otherVerseApplicationsPending,14);
 assert.equal(c.counting.doxologyApplicationsPending,4);
 assert.equal(c.counting.approvedNewMusicalSettings,0);
 assert.equal(c.release.musicianCertified,false);
 assert.equal(c.release.publishingAllowed,false);
 const palm=readFileSync(new URL('../src/mass/reader-palm.js',import.meta.url),'utf8');
 assert.equal(palm.includes('processionale-palm-1961-cadence-motif-source'),false);
});


test('Psalm23 verse2 GABC prototype retains 24 note-bearing syllables and is never an approved score',()=>{
 const h=readJSON('data/research/processionale-palm23-verse2-tone-hypothesis-20261027.v1.json');
 const w=readJSON('data/research/processionale-palm-14verse-pointing-worklist-20261027.v1.json');
 const gabc=readFileSync(new URL('../data/research/chant-source-review/palm23-verse2-tone-application-20261027-PROVISIONAL.gabc',import.meta.url),'utf8');
 const raw=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19315.gabc',import.meta.url),'utf8');
 assert.equal(h.stage,'PALM-R02');
 assert.equal(h.target.psalm,23);
 assert.equal(h.target.liturgicalLine,2);
 assert.equal(h.batch,24);
 assert.equal(gabc.split('%%').length,2);
 assert.ok(gabc.includes('\n%%\n(c4)'));
 assert.equal(gabc.split('*(:)').length,2);
 assert.ok(raw.includes('2. Nam(h) ip(h)se...(h)'));
 assert.ok(gabc.includes('Nam(h) ip(h)se(h)'));
 assert.ok(!gabc.includes('DO(f)mi(gh)'));
 assert.ok(gabc.includes('fun(h)dá(ixi hr)vit(h) e(g hr)um(h.)'));
 assert.ok(raw.includes('quæ(h) <b>re</b>(ixi hr)plent(h) <b>e</b>(g hr)ám :(h.)'));
 const normalized=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
 const body=gabc.slice(gabc.indexOf('(c4)'));
 const halves=body.split('*(:)');
 const syllables=s=>Array.from(s.matchAll(/([\p{L}]+[.,;!?]?)\(([^)]+)\)/gu)).map(x=>({text:x[1],notes:x[2]}));
 const plain=s=>s.replace(/\(c4\)/g,'').replace(/\([^)]*\)/g,'').replace(/[:*]/g,'').trim();
 const extracted=halves.map(syllables);
 const stored=[h.cadenceMappings.medial,h.cadenceMappings.termination];
 assert.deepEqual(extracted.map(x=>x.length),[13,11]);
 assert.equal(h.tests.noteBearingSyllables,24);
 for(let i=0;i<2;i++)for(let j=0;j<extracted[i].length;j++){
  assert.equal(normalized(extracted[i][j].text),normalized(stored[i][j][0]));
  assert.equal(extracted[i][j].notes,stored[i][j][1]);
 }
 const row=w.work.find(x=>x.psalm===23&&x.printedChantLine===2);
 assert.ok(row);
 assert.equal(row.provisionalGabcResearch.candidatePath,'data/research/chant-source-review/palm23-verse2-tone-application-20261027-PROVISIONAL.gabc');
 assert.equal(row.provisionalGabcResearch.evidencePath,'data/research/processionale-palm23-verse2-tone-hypothesis-20261027.v1.json');
 assert.equal(row.provisionalGabcResearch.musicEditorApproved,false);
 assert.equal(row.provisionalGabcResearch.exsurgeRendered,true);
 assert.equal(row.provisionalGabcResearch.alternativeExsurgeRendered,true);
 assert.equal(row.provisionalGabcResearch.musicEditorApproved,false);
 assert.equal(row.provisionalGabcResearch.noteUnderlayCertified,false);
 assert.equal(row.provisionalGabcResearch.comparisonProofRunId,40455234551);
 assert.equal(w.currentCandidatePipeline.candidateCreated,1);
 assert.equal(w.currentCandidatePipeline.approved,0);
 assert.equal(w.currentCandidatePipeline.gabcVariantsPrepared,2);
 assert.equal(w.currentCandidatePipeline.exsurgeCandidateRendered,2);
 assert.equal(w.currentCandidatePipeline.editorApprovedVariants,0);
 assert.equal(normalized(plain(halves[0])),normalized(row.sourceSections.medial));
 assert.equal(normalized(plain(halves[1])),normalized(row.sourceSections.termination));
 assert.equal(h.tests.sourceArchiveCadenceColonNormalizationRequired,true);
 assert.equal(h.tests.provisionalSyllablesAllHaveAttachedNotes,true);
 assert.ok(h.method.mismatchHold.some(s=>s.includes('Accent position')));
 assert.ok(h.method.mismatchHold.some(s=>s.includes('Raw archival GABC')));
 assert.equal(h.release.musicEditorReviewed,false);
 assert.equal(h.release.printedNoteByNoteProven,false);
 assert.equal(h.release.exsurgeParsed,true);
 assert.equal(h.release.exsurgeRendered,true);
 const alternate=readFileSync(new URL('../data/research/chant-source-review/palm23-verse2-accent-alignment-20261027-ALTERNATE.gabc',import.meta.url),'utf8');
 assert.ok(alternate.includes('fir(h)má(h)vit(gf) e(gh gr)um.(gf..)'));
 assert.ok(gabc.includes('fir(h)má(g)vit(f) e(gh gr)um.(gf..)'));
 assert.equal(normalized(plain(alternate.slice(alternate.indexOf('(c4)')).split('*(:)')[1])),normalized(row.sourceSections.termination));
 assert.equal(h.alternativeAccentAlignment.alternativeApproved,false);
 assert.equal(h.alternativeAccentAlignment.realExsurgeRendered,true);
 assert.equal(h.alternativeAccentAlignment.noteGroupCompressionNeedsEditorSignoff,true);
 assert.equal(h.alternativeAccentAlignment.exsurgeProofRunId,40455234551);
 assert.equal(h.nativeRenderProof.comparisonRun.bothRendered260420800,true);
 assert.equal(h.nativeRenderProof.comparisonRun.originalMusicalApproved,false);
 assert.equal(h.nativeRenderProof.comparisonRun.alternativeMusicalApproved,false);
 assert.equal(h.release.nativePhoneDeviceAccepted,false);
  assert.equal(h.release.scorePublicationAllowed,false);
 assert.equal(h.release.productionMassReaderChanges,0);
 const runtime=readFileSync(new URL('../src/mass/reader-palm.js',import.meta.url),'utf8');
 assert.equal(runtime.includes('palm23-verse2-tone-application-20261027-PROVISIONAL'),false);
});


test('Psalm23 printed first-verse terminal rule holds both speculative 3-syllable cadence versions',()=>{
 const h=readJSON('data/research/processionale-palm23-verse2-tone-hypothesis-20261027.v1.json');
 const w=readJSON('data/research/processionale-palm-14verse-pointing-worklist-20261027.v1.json');
 const original=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19315.gabc',import.meta.url),'utf8');
 const a=readFileSync(new URL('../data/research/chant-source-review/palm23-verse2-tone-application-20261027-PROVISIONAL.gabc',import.meta.url),'utf8');
 const b=readFileSync(new URL('../data/research/chant-source-review/palm23-verse2-accent-alignment-20261027-ALTERNATE.gabc',import.meta.url),'utf8');
 const review=h.batch26CadenceAudit;
 assert.equal(review.batch,26);
 assert.equal(review.verdict,'NEITHER_A_NOR_B_CAN_BE_EDITORIALLY_SELECTED_FROM_PRINTED_FIRST_VERSE_ALONE');
 assert.equal(review.decision,'HOLD_BOTH_NO_DEFAULT_NO_APPROVED_VERSION');
 assert.equal(review.evidence.psalm23Printed1961.notatedFirstVerseFull,true);
 assert.equal(review.evidence.psalm23Printed1961.secondVerseOnlyCue,'Nam(h) ip(h)se...(h)');
 assert.ok(original.includes(review.evidence.psalm23Printed1961.secondVerseOnlyCue.replace('Nam(h)','2. Nam(h)')));
 assert.equal(review.originalTerminalPhrase.postAccentCount,5);
 assert.equal(review.targetTerminalPhrase.postAccentCount,3);
 assert.deepEqual(review.originalTerminalPhrase.postAccentSyllables,['bi','tant','in','e','o']);
 assert.deepEqual(review.targetTerminalPhrase.postAccentSyllables,['vit','e','um']);
 assert.equal(review.criticalDifference.shortage,2);
 assert.ok(original.includes(review.originalTerminalPhrase.gabc));
 assert.equal(review.variantA.accentPitch,'g');
 assert.equal(review.variantB.accentPitch,'h');
 assert.ok(a.includes('fir(h)má(g)vit(f) e(gh gr)um.(gf..)'));
 assert.ok(b.includes('fir(h)má(h)vit(gf) e(gh gr)um.(gf..)'));
 assert.equal(review.variantA.status,'RETENTION_FOR_COMPARISON_NOT_CHOSEN');
 assert.equal(review.variantB.status,'RETENTION_FOR_COMPARISON_NOT_CHOSEN');
 assert.ok(review.musicianAcceptanceChecklist.every(x=>x.passed===false));
 assert.equal(review.renderProofOnly.exsurgePass,true);
 assert.equal(review.renderProofOnly.actualMusicalApproval,false);
 assert.equal(review.other12PatternsMustNotInheritEitherUnapprovedModel,true);
 const row=w.work.find(x=>x.id==='PALM-R02-PS23-L02');
 assert.equal(row.provisionalGabcResearch.earlierPostAccentFiveVsThreeReasoningSuperseded,true);
 assert.equal(row.provisionalGabcResearch.cadenceDecision,'A_SOURCE_SHAPE_PLAUSIBLE_B_UNATTESTED_BOTH_UNAPPROVED');
 assert.equal(h.batch26CadenceAudit.supersededBy,'batch27CadentialAccentCorrection');
 assert.equal(h.batch26CadenceAudit.previousReasoningInvalid,true);
 assert.equal(h.batch27CadentialAccentCorrection.Aapproved,false);
 assert.equal(h.batch27CadentialAccentCorrection.Bapproved,false);
 assert.equal(h.batch27CadentialAccentCorrection.originalP23Terminal.identifiedTerminalGroups===undefined,true);
 assert.deepEqual(h.batch27CadentialAccentCorrection.originalP23Terminal.preparatory,['tant(g)','in(f)']);
 assert.deepEqual(h.batch27CadentialAccentCorrection.verse2VariantA.preparatory,['má(g)','vit(f)']);
 assert.equal(h.batch27CadentialAccentCorrection.verse2VariantB.sourceMelodicGroupsPreserved,false);
 assert.equal(row.provisionalGabcResearch.postAccentReference,5);
 assert.equal(row.provisionalGabcResearch.postAccentTarget,3);
 assert.equal(row.provisionalGabcResearch.noInheritanceToOtherPatterns,true);
 assert.equal(w.currentCandidatePipeline.noAutomatedExpansionFromV2Hypotheses,true);
 assert.equal(w.currentCandidatePipeline.approved,0);
 assert.equal(h.release.scorePublicationAllowed,false);
});


test('Palm two source tone models classify seventeen editorial applications and correct cadence accents',()=>{
 const bulk=readJSON('data/research/processionale-palm-two-tone-models-17-case-review-20261027.v1.json');
 const w=readJSON('data/research/processionale-palm-14verse-pointing-worklist-20261027.v1.json');
 const accent=readJSON('data/research/processionale-palm-1961-accent-doxology-review-20261027.v1.json');
 const motif=readJSON('data/research/processionale-palm-1961-cadence-motif-source-20261027.v1.json');
 const h=readJSON('data/research/processionale-palm23-verse2-tone-hypothesis-20261027.v1.json');
 const raw23=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19315.gabc',import.meta.url),'utf8');
 const raw46=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19316.gabc',import.meta.url),'utf8');
 const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/æ/g,'ae').replace(/[^a-z]/g,'');
 assert.equal(bulk.stage,'PALM-R02');
 assert.equal(bulk.batch,27);
 assert.equal(bulk.models.length,2);
 assert.equal(bulk.cases.length,17);
 assert.deepEqual(bulk.models.map(x=>x.psalm),[23,46]);
 assert.deepEqual(bulk.models.map(x=>x.subsequentVerseRecitation),['h','h']);
 assert.equal(bulk.models.every(x=>x.clef==='c4'&&x.fullNotatedVerseScope==='FIRST_VERSE_ONLY'),true);
 assert.equal(bulk.models.every(x=>x.completeFormulaMusicianSignedOff===false),true);
 assert.equal(bulk.cases.filter(x=>x.type==='VERSE').length,13);
 assert.equal(bulk.cases.filter(x=>x.type==='DOXOLOGY').length,4);
 assert.equal(bulk.cases.flatMap(x=>x.occurrenceIds).length,18);
 assert.equal(bulk.cases.filter(x=>x.type==='VERSE').flatMap(x=>x.occurrenceIds).length,14);
 assert.equal(bulk.cases.filter(x=>x.type==='VERSE'&&x.occurrenceIds.length===2).length,1);
 assert.equal(bulk.counts.terminalWordsPreclassified,17);
 assert.equal(bulk.counts.terminalStressClassesWithUnresolvedLexicalAccent,1);
 assert.equal(bulk.cases.find(x=>x.id==='PALM-R02-PS46-L09').terminalLexicalStressHypothesis.class,
  'FOREIGN_PROPER_NAME_ACCENT_NOT_ATTESTED_IN_PRINT');
 assert.equal(bulk.cases.every(x=>x.hasHumanApprovedMelody===false&&x.readOnlyNoReaderIntegration===true),true);
 assert.equal(bulk.cases.every(x=>x.hasHumanVerifiedSyllableDivision===false),true);
 for(const m of bulk.models){
   const old=m.psalm===23?raw23:raw46;
   const src=motif.psalms.find(x=>x.psalm===m.psalm);
   assert.equal(old.includes(m.medialSourceExcerpt),true);
   assert.equal(old.includes(m.terminalSourceExcerpt),true);
   assert.equal(m.medialSourceExcerpt,src.mediantCadenceExcerpt);
   assert.equal(m.terminalSourceExcerpt,src.terminationCadenceExcerpt);
   assert.equal(m.identifiedTerminalGroups.preparatory.length,2);
   for(const segment of m.identifiedTerminalGroups.preparatory)
     assert.equal(old.replace(/<[^>]+>/g,'').includes(segment),true);
   assert.equal(m.completeFormulaMusicianSignedOff,false);
 }
 assert.deepEqual(bulk.models[0].identifiedTerminalGroups.preparatory,['tant(g)','in(f)']);
 assert.deepEqual(bulk.models[1].identifiedTerminalGroups.preparatory,['ce(g)','læ(f)']);
 assert.equal(bulk.models[0].identifiedTerminalGroups.cadentialAccent,'e(gh gr)');
 assert.equal(bulk.models[1].identifiedTerminalGroups.cadentialAccent,'ti(gh)');
 const lines=new Map([...accent.patterns.map(p=>[p.patternId,p]),...accent.doxology.map(p=>[p.id,p])]);
 assert.equal(lines.size,17);
 for(const row of bulk.cases){
  const original=lines.get(row.id);
  assert.ok(original,row.id);
  assert.deepEqual(row.sourceSegments,original.sourceSectionAccents??original.printedAccentText);
  const finalWord=row.sourceSegments.termination.trim().split(/\s+/).at(-1);
  assert.equal(norm(finalWord),norm(row.terminalLexicalStressHypothesis.word),row.id);
  assert.equal(row.modelId,'GR1961_PALM_NOVUS_PS'+row.psalm);
 }
 assert.equal(bulk.batch26Correction.supersededAsMusicalReasoning,true);
 assert.equal(bulk.batch26Correction.psalm23Verse2VariantA,
  'SOURCE_SHAPE_PLAUSIBLE_TWO_PREPARATORY_GROUPS_NOT_EDITOR_APPROVED');
 assert.equal(h.batch26CadenceAudit.previousReasoningInvalid,true);
 assert.equal(h.batch27CadentialAccentCorrection.verse2VariantA.sourceMelodicGroupsPreserved,true);
 assert.equal(h.batch27CadentialAccentCorrection.verse2VariantB.sourceMelodicGroupsPreserved,false);
 assert.equal(w.batch27ConsolidatedToneModel.distinctReviewCases,17);
 assert.equal(w.batch27ConsolidatedToneModel.classifiedPendingCases,17);
 assert.equal(w.batch27ConsolidatedToneModel.editoriallyAcceptedToneModels,0);
 assert.equal(bulk.counts.additionalMusicallyApproved,0);
 assert.equal(bulk.counts.scoreAssignedToProduction,0);
 assert.equal(bulk.controls.publicationAllowed,false);
});


test('Palm cadence bulk matrix identifies four source-owned ending families and three exceptions',()=>{
 const d=readJSON('data/research/processionale-palm-four-cadence-families-17-case-20261027.v1.json');
 const master=readJSON('data/research/processionale-palm-two-tone-models-17-case-review-20261027.v1.json');
 const raw23=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19315.gabc',import.meta.url),'utf8');
 const raw46=readFileSync(new URL('../data/research/chant-source-archive/1961-graduale-novus-20261026/gregobase-19316.gabc',import.meta.url),'utf8');
 assert.equal(d.stage,'PALM-R02');
 assert.equal(d.batch,28);
 assert.equal(d.counts.uniqueEditorCases,17);
 assert.equal(d.familyModels.length,4);
 assert.equal(d.caseMatrix.length,17);
 assert.equal(d.counts.directlyComparableAccentClassCases,4);
 assert.equal(d.counts.adaptationAccentClassCases,10);
 assert.equal(d.counts.separateExceptions,3);
 assert.equal(d.counts.ps23TargetOccurrences,7);
 assert.equal(d.counts.ps46TargetOccurrences,11);
 assert.equal(d.counts.scoreApplicationsOutstanding,18);
 assert.deepEqual(d.familyModels.map(x=>[x.id,x.caseCount,x.printedFirstVerseProvidesSameAccentClass]),[
  ['PALM_PS23_PAROXYTONON_2',2,true],
  ['PALM_PS23_PROPAROXYTONON_3',3,false],
  ['PALM_PS46_PAROXYTONON_2',7,false],
  ['PALM_PS46_PROPAROXYTONON_3',2,true]
 ]);
 assert.deepEqual(d.specialExceptions.map(x=>x.caseId),[
  'PALM-R02-PS46-L09','PALM-R02-PS23-DOXO-L12','PALM-R02-PS46-DOXO-L12'
 ]);
 assert.ok(d.specialExceptions.every(x=>x.automaticGabcAllowed===false));
 assert.ok(d.familyModels.every(x=>!x.perCaseCadenceApproved&&!x.musicianEditorReviewed));
 assert.ok(d.caseMatrix.every(x=>x.humanTextAccentVerified===false&&x.hasHumanApprovedMelody===false));
 assert.ok(d.caseMatrix.every(x=>!x.pitchGroupsAssignedToWholeVerse&&!x.fullGabcCandidateApproved));
 assert.ok(d.caseMatrix.every(x=>x.releaseStatus==='EDITORIAL_HOLD_NO_PRODUCTION_ASSIGNMENT'));
 const src=new Map(master.cases.map(x=>[x.id,x]));
 for(const c of d.caseMatrix){
   const base=src.get(c.id); assert.ok(base,c.id);
   assert.equal(c.sourceToneModel,base.modelId);
   assert.deepEqual(c.sourceOccurrenceIds,base.occurrenceIds);
   assert.deepEqual(c.printedLatinSegments,base.sourceSegments);
   assert.equal(c.terminalLexicalItem,base.terminalLexicalStressHypothesis.word);
   assert.equal(c.flexRequired,Boolean(base.sourceSegments.flex));
   assert.ok(c.reviewFamily.startsWith('PALM_PS'+c.psalm+'_TERMINATION_'));
 }
 assert.equal(d.caseMatrix.filter(x=>x.flexRequired).length,2);
 const duo=d.caseMatrix.find(x=>x.id==='PALM-R02-PS23-L07');
 assert.deepEqual(duo.sourceOccurrenceIds,['PALM-R02-PS23-L07','PALM-R02-PS23-L09']);
 for(const m of d.familyModels.filter(x=>x.printedFirstVerseProvidesSameAccentClass)){
  const archive=(m.psalm===23?raw23:raw46);
  const a=m.sourceExemplar;
  assert.ok(archive.includes(a.gabcTerminal));
  for(const preparatory of a.preparatoryGroups)
   assert.ok(archive.replace(/<[^>]+>/g,'').includes(preparatory));
 }
 assert.ok(!d.verificationMethod.fullGabcGenerationUntilEditorFormulaValidated);
 assert.ok(d.verificationMethod.allowBatchCandidateGenerationAfterFourFamiliesAccepted);
 assert.equal(d.release.allFourMelodicEndingFamiliesCertified,false);
 assert.equal(d.release.editorialHumanApprovals,0);
 assert.equal(d.release.scoreRuntimeAssignments,0);
 assert.equal(d.release.publicationAllowed,false);
});
