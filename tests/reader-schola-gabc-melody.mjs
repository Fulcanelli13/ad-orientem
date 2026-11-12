// M46: independent source-position and *illustrative* timing audit.
// Source: original Graduale Romanum 1961, 54*, and verbatim GREGOBASE-545 GABC.
// Not a certified Gregorian performance tempo, score approval or universal parser.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {offlineKyrialeResearchScore} from '../src/mass/reader-kyriale-research-gabc.js';
import {compileKyrieXviAudition} from '../src/mass/reader-schola-kyrie-research-audition.js';
import {compileGabcMelody,scheduleGabcMelody,resolveGabcStaffPitch,
 GABC_MELODY_POLICY,UnsupportedGabcMelodyError} from '../src/mass/reader-schola-gabc-melody.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const m43=read('../data/research/mass-music-m43-kyrie-xvi-original-printed-noteheads.v1.json');
const m44=read('../data/research/mass-music-m44-kyrie-xvi-exsurge-original-print-render-parity.v1.json');
const audit=read('../data/research/mass-music-m46-kyrie-xvi-research-note-timing.v1.json');
const src=offlineKyrialeResearchScore('KYRIE','MASS_16');
assert.equal(src.scoreId,'GREGOBASE-545');assert.equal(src.scoreApproved,false);
const plan=[0,0,0,1,1,1,2,2,3];
const compiled=compileGabcMelody(src.gabc,{phraseSequence:plan});
const oldApi=compileKyrieXviAudition(src.gabc);
assert.equal(compiled.sourceNoteCount,40);
assert.equal(compiled.sourceGroupCount,27);
assert.equal(compiled.phraseCount,4);
assert.deepEqual(compiled.phraseSequence,plan);
assert.equal(compiled.invocations,9);
assert.equal(compiled.performance.length,81);
assert.deepEqual(compiled.sourceNotes.map(n=>n.sourceNoteOrdinal),Array.from({length:40},(_,i)=>i+1));
assert.deepEqual(compiled.phrases.map(p=>p.reduce((n,g)=>n+g.notes.length,0)),[9,7,9,15]);
assert.deepEqual(compiled.groups.map(g=>g.notes.length),m43.originalPrintedGroupCountsReadFromFacsimile.map(x=>x.printedNoteheadCountManuallyCounted));
assert.equal(m43.sourceVersusOriginalPrintCountCheck.exactCountAgreement,true);
assert.equal(m43.original1961PrintedWitness.pdfPage1Based,56);
assert.equal(audit.printWitness.pdfSha256,m43.original1961PrintedWitness.originalPdfSha256);
assert.deepEqual(compiled.sourceNotes.filter(n=>n.horizontalEpisema).map(n=>n.sourceNoteOrdinal),[7,14,23]);
assert.deepEqual(compiled.sourceNotes.filter(n=>n.mora).map(n=>n.sourceNoteOrdinal),[9,16,25,40]);
assert.deepEqual(compiled.sourceNotes.filter(n=>n.virga).map(n=>n.sourceNoteOrdinal),[37]);
assert.deepEqual(compiled.sourceNotes.filter(n=>n.inclined).map(n=>n.sourceNoteOrdinal),[38,39,40]);
assert.deepEqual(compiled.sourceNotes.slice(-6).map(n=>n.sourcePitchLetter),['i','g','h','G','F','E']);
assert.deepEqual(compiled.sourceNotes.slice(-6).map(n=>n.midi),[71,67,69,67,65,64]);
assert.equal(compiled.sourceNotes[0].midi,67);
assert.deepEqual(compiled.performance.filter(n=>n.phraseEnd).map(n=>n.sourceNoteOrdinal),[9,9,9,16,16,16,25,25,40]);
assert.deepEqual(compiled.performance.filter(n=>n.phraseEnd).map(n=>n.invocation),[1,2,3,4,5,6,7,8,9]);
assert.equal(compiled.performance.at(-1).sourceNoteOrdinal,40);
assert.equal(oldApi?.performance.length,81);
assert.deepEqual(oldApi.performance.map(n=>[n.sourceNoteOrdinal,n.midi,n.groupIndex,n.invocation]),
 compiled.performance.map(n=>[n.sourceNoteOrdinal,n.midi,n.groupIndex,n.invocation]));
const schedule=scheduleGabcMelody(compiled);
assert.equal(schedule.events.length,81);
assert.equal(schedule.model,'ILLUSTRATIVE_EQUAL_NOTE_RELATIVE_WEIGHTS');
assert.equal(schedule.certifiedGregorianTiming,false);
assert.equal(schedule.independentlyCalibratedAgainstPerformance,false);
assert.equal(compiled.policy,GABC_MELODY_POLICY);
assert.equal(compiled.policy.canonicalScholaScoreApproved,false);
assert.equal(schedule.events[0].startMs,0);
for(let i=1;i<schedule.events.length;i++){
 const prev=schedule.events[i-1],now=schedule.events[i];
 assert.equal(now.startMs,prev.startMs+prev.durationMs+prev.gapAfterMs);
}
assert.deepEqual(schedule.events.filter(n=>n.gapAfterMs>0).map(n=>n.invocation),[1,2,3,4,5,6,7,8]);
assert.equal(schedule.events.filter(n=>n.gapAfterMs>0).length,8);
assert.equal(schedule.events.filter(n=>n.mora).length,9);
assert.deepEqual(audit.expectedSourceRhythmicSignPositions.horizontalEpisema,[7,14,23]);
assert.deepEqual(audit.expectedSourceRhythmicSignPositions.mora,[9,16,25,40]);
assert.equal(m44.reviewStatus.qualifiedHumanChantEditorCertificate,false);
assert.equal(audit.rhythmPolicy.certified,false);
assert.equal(audit.rhythmPolicy.userControllablePitchAndSpeedIndependently,true);
assert.equal(resolveGabcStaffPitch('j','c4').midi,72);
assert.equal(resolveGabcStaffPitch('g','c4').midi,67);
assert.equal(resolveGabcStaffPitch('h','c3').midi,72);
assert.equal(resolveGabcStaffPitch('h','f3').midi,65);
assert.equal(resolveGabcStaffPitch('g','f3').midi,64);
const simpleC3='name:C3 test;\n%%\n(c3) Ky(h)ri(g_)e(i.) (::)';
const simple=compileGabcMelody(simpleC3,{phraseSequence:[0,0]});
assert.deepEqual(simple.sourceNotes.map(n=>n.midi),[72,69,74]);
assert.deepEqual(simple.performance.map(n=>n.sourceNoteOrdinal),[1,2,3,1,2,3]);
assert.deepEqual(simple.performance.filter(n=>n.horizontalEpisema).map(n=>n.sourceNoteOrdinal),[2,2]);
assert.equal(scheduleGabcMelody(simple,{unitMs:200,phraseGapMs:120}).events[3].startMs,
 scheduleGabcMelody(simple,{unitMs:200,phraseGapMs:120}).events[2].startMs+
 scheduleGabcMelody(simple,{unitMs:200,phraseGapMs:120}).events[2].durationMs+120);
const simpleF3='name:F3;\n%%\n(f3) Ky(h)ri(ixij)e(j.) (::)';
const f=compileGabcMelody(simpleF3,{phraseSequence:[0]});
assert.deepEqual(f.sourceNotes.map(n=>n.midi),[65,66,69,69]);
assert.equal(f.sourceNotes[1].alterationSemitones,-1);
// Unsupported syntax and missing performance plans must refuse sound.
for(const [gabc,options] of [
 [src.gabc,{}],
 ['name: bad;\n%%\n(c4) Ky(g[-2]) (::)',{phraseSequence:[0]}],
 ['name: bad;\n%%\n(c4) Ky(g) (::)',{phraseSequence:[2]}],
 ['name: bad;\n%%\n(c4) Ky(g)',{phraseSequence:[0]}],
 ['random text',{phraseSequence:[0]}]
 ]){
 assert.throws(()=>compileGabcMelody(gabc,options),UnsupportedGabcMelodyError);
}
assert.equal(compileKyrieXviAudition('not a GABC'),null);
assert.throws(()=>scheduleGabcMelody(compiled,{unitMs:-1}),UnsupportedGabcMelodyError);
assert.throws(()=>scheduleGabcMelody(compiled,{moraFactor:0}),UnsupportedGabcMelodyError);
console.log('M46 GABC research timeline',JSON.stringify({
 source:compiled.sourceNoteCount,groups:compiled.sourceGroupCount,
 performance:compiled.performance.length,phrases:compiled.phraseCount,
 durationSeconds:Math.round(schedule.durationMs/1000),
 timingCertified:schedule.certifiedGregorianTiming}));
console.log('PASS M46: 1961 printed source note counts, signs, clef pitch conversion, note timeline, explicit repetitions and unsupported-notation gates');
