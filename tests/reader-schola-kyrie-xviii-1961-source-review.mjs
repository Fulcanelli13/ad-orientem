// M49: Kyrie XVIII printed folio provenance + independent source-model contract.
// The 1961 scan's title/repetition structure is sight-checked. Original-note
// ink-to-pitch and all rhythmic glyph placements are NOT editorially certified.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {offlineKyrialeResearchScore} from '../src/mass/reader-kyriale-research-gabc.js';
import {compileGabcMelody,scheduleGabcMelody,UnsupportedGabcMelodyError} from '../src/mass/reader-schola-gabc-melody.js';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint} from '../src/mass/reader-schola-exsurge-gabc-melody.js';
import {kyrieXviAuditionEligible} from '../src/mass/reader-schola-kyrie-research-audition.js';
const evidence=JSON.parse(readFileSync(new URL(
  '../data/research/mass-music-m49-kyrie-xviii-1961-source-review.v1.json',
  import.meta.url),'utf8'));
const bundle=readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
const source=offlineKyrialeResearchScore('KYRIE','MASS_18');
assert.equal(source.scoreId,evidence.scoreId);
assert.equal(source.scoreApproved,false);
assert.equal(evidence.printedWitness.folio,'57*');
assert.equal(evidence.printedWitness.pdfPage1Based,59);
assert.equal(evidence.printedWitness.pdfUrl,
 'https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf');
assert.deepEqual(evidence.observedPrint.phraseRepeatLabels,['iij.','iij.','ij.',null]);
assert.deepEqual(evidence.observedPrint.phrasePlanIndicesZeroBased,[0,0,0,1,1,1,2,2,3]);
assert.equal(evidence.observedPrint.twoPrintedSystems,true);
assert.equal(evidence.observedPrint.fullPhysicalNoteheadByNoteheadManualCountCertified,false);
assert.equal(evidence.observedPrint.exactOriginalPixelLevelRhythmicSignAttachmentCertified,false);
assert.equal(evidence.observedPrint.exactPitchContourFrom1961ScanIndependentlyAudited,false);
assert.equal(evidence.performance.livePlayerEnabled,false);
assert.equal(evidence.performance.audioApproved,false);
assert.equal(evidence.performance.automaticAssignment,false);
assert.ok(evidence.status.includes('NOT_EDITORIALLY_APPROVED'));

assert.equal(gabcResearchFingerprint(source.gabc),evidence.sourceGabcFingerprintUtf16Fnv1a32);
assert.match(source.gabc,/\(c3\)/);
assert.match(source.gabc,/<i>iij\.<\/i>/);
assert.match(source.gabc,/<i>ij\.<\/i>/);
const strict=compileGabcMelody(source.gabc,{phraseSequence:evidence.performance.plan});
const advanced=compileExsurgeGabcResearchMelody(source.gabc,{
 exsurge,scoreId:source.scoreId,
 expectedFingerprint:evidence.sourceGabcFingerprintUtf16Fnv1a32,
 expectedPhraseNoteCounts:evidence.transcriptionAndExsurge.exsurgeNoteheadsByPhrase,
 phraseSequence:evidence.performance.plan
});
assert.equal(strict.sourceNoteCount,44);
assert.equal(strict.sourceGroupCount,27);
assert.equal(advanced.sourceNoteCount,44);
assert.equal(advanced.sourceGroupCount,31);
assert.deepEqual(strict.phrases.map(p=>p.length),[7,6,7,7]);
assert.deepEqual(advanced.phrases.map(p=>p.length),[8,6,8,9]);
assert.deepEqual(strict.phrases.map(p=>p.map(g=>g.notes.length)),
 evidence.transcriptionAndExsurge.gabcSyllableNoteCountsByPhrase);
assert.deepEqual(advanced.phrases.map(p=>p.reduce((n,g)=>n+g.notes.length,0)),
 evidence.transcriptionAndExsurge.exsurgeNoteheadsByPhrase);
assert.deepEqual(strict.sourceNotes.map(n=>n.midi),advanced.sourceNotes.map(n=>n.midi));
assert.deepEqual(advanced.sourceNotes.filter(n=>n.moraDots>0).map(n=>n.sourceNoteOrdinal),
 evidence.transcriptionAndExsurge.sourceNoteOrdinalsOfPunctumMora);
assert.deepEqual(advanced.sourceNotes.filter(n=>n.horizontalEpisema).map(n=>n.sourceNoteOrdinal),
 evidence.transcriptionAndExsurge.sourceNoteOrdinalsOfHorizontalEpisema);
assert.deepEqual(strict.performance.filter(n=>n.phraseEnd).map(n=>n.sourceNoteOrdinal),
 [10,10,10,18,18,18,28,28,44]);
assert.equal(strict.performance.length,90);
assert.equal(advanced.performance.length,90);
assert.equal(strict.performance[10].sourceNoteOrdinal,1);
assert.equal(strict.performance[30].sourceNoteOrdinal,11);
const scheduled=scheduleGabcMelody(advanced);
assert.equal(scheduled.events.length,90);
assert.equal(scheduled.certifiedGregorianTiming,false);
assert.equal(scheduled.independentlyCalibratedAgainstPerformance,false);
assert.equal(scheduled.events.filter(e=>e.gapAfterMs>0).length,8);
assert.equal(kyrieXviAuditionEligible({form:'SOLEMN',mode:'LIVE',settingId:'MASS_18'}),false);
assert.equal(kyrieXviAuditionEligible({form:'SOLEMN',mode:'LIVE',settingId:'MASS_18',isRequiem:true}),false);
assert.equal(kyrieXviAuditionEligible({form:'SOLEMN',mode:'LIVE',settingId:'MASS_16',isRequiem:true}),false);
const mutated=source.gabc.replace('(hhg)','(hig)');
assert.notEqual(mutated,source.gabc);
assert.throws(()=>compileExsurgeGabcResearchMelody(mutated,{
 exsurge,scoreId:source.scoreId,expectedFingerprint:evidence.sourceGabcFingerprintUtf16Fnv1a32,
 expectedPhraseNoteCounts:[10,8,10,16],phraseSequence:evidence.performance.plan
}),e=>e instanceof UnsupportedGabcMelodyError&&e.code==='SOURCE_FINGERPRINT_MISMATCH');
const renderedNotes=advanced.sourceNotes;
assert.deepEqual(renderedNotes.map(n=>n.sourceNoteOrdinal),Array.from({length:44},(_,i)=>i+1));
assert.ok(renderedNotes.every((n,i)=>i===0||n.sourceIndex>renderedNotes[i-1].sourceIndex));
console.log('M49_KYRIE_XVIII',JSON.stringify({
 folio:evidence.printedWitness.folio,pdfPage:evidence.printedWitness.pdfPage1Based,
 sourceNoteheads:advanced.sourceNoteCount,gabcSyllables:strict.sourceGroupCount,
 rendererNeumes:advanced.sourceGroupCount,performedNotes:advanced.performance.length,
 mora:evidence.transcriptionAndExsurge.sourceNoteOrdinalsOfPunctumMora,
 episemata:evidence.transcriptionAndExsurge.sourceNoteOrdinalsOfHorizontalEpisema,
 printedInkCertified:false,enabledInLIVE:false
}));
console.log('PASS M49: 1961 original-folio provenance, 44 transcription notes, 27 lyric groups versus 31 neumes, 90-event plan and no unsanctioned score approval');
