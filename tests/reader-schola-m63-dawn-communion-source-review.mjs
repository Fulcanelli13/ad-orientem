// M63: recovered Christmas Dawn Communion, three printed witnesses and exact source integrity.
// Does not certify each printed notehead, rhythm or a Mass assignment.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {PROPER_M63_RESEARCH_SOURCES} from '../src/mass/reader-schola-christmas-dawn-communion-recovery.js';
import {PROPER_M62_RESEARCH_SOURCES} from '../src/mass/reader-schola-christmas-proper-sources.js';
import {PROPER_RESEARCH_SOURCES,eligibleProperM59ResearchSource,
 properM59ResearchScore,compileProperM59ResearchMelody} from
 '../src/mass/reader-schola-proper-research-melody.js';
import {gabcResearchFingerprint} from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const recovery=read('data/research/mass-music-m61-dawn-communion-gregobase-1125-recovery.v1.json');
const index=read('data/mass/chant-corpus/gr1961-proper-index.json');
const review=read('data/research/mass-music-m63-dawn-communion-printed-witness-review.v1.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8'),sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge);
assert.equal(recovery.stage,'SEPARATE_SOURCE_CANDIDATE_NOT_ARCHIVE_REWRITE');
assert.equal(recovery.sourceGabcSha256,'0cd4782be4bc8a2d41e934c5863de2ad2392857f0df9c48d6bff5b23a0112ccc');
assert.equal(sha(recovery.sourceGabc),recovery.sourceGabcSha256);
assert.equal(recovery.sourceGabc.length,300);
assert.equal(index.snapshotDate,'2024-01-05');
const missing=index.exceptions.find(x=>x.gregobaseId===1125);
assert.ok(missing);
assert.equal(missing.officePart,'co');
assert.equal(missing.page,'32');
assert.equal(missing.reason,'No usable structured GABC transcription');
assert.equal(PROPER_M63_RESEARCH_SOURCES.length,1);
const spec=PROPER_M63_RESEARCH_SOURCES[0];
assert.equal(spec.selectionId,'CHRISTMAS_DAWN_COMMUNION');
assert.equal(spec.scoreId,'GREGOBASE-1125');
assert.equal(spec.week,'CHRISTMAS_DAWN');
assert.equal(spec.role,'COMMUNION');
assert.equal(spec.officePart,'co');
assert.equal(spec.scoreApproved,false);
assert.equal(spec.sourceCategory,'POST_ARCHIVE_2024_RESEARCH_RECOVERY');
assert.equal(spec.sourceUrl,recovery.sourcePage);
assert.equal(spec.sourceGabc,recovery.sourceGabc);
assert.equal(spec.sha256,sha(spec.sourceGabc));
assert.equal(spec.sourceFingerprint,gabcResearchFingerprint(spec.sourceGabc));
assert.equal(spec.rendererFingerprint,gabcResearchFingerprint('name:Exsulta filia;\noffice-part:co;\n%%\n'+spec.sourceGabc));
assert.equal(spec.sourceFingerprint,'60f8bf2e');
assert.equal(spec.rendererFingerprint,'e58220d2');
assert.equal(spec.bivirgaCount,0);
assert.equal(spec.sourceNotes,72);
assert.deepEqual([...spec.phraseNoteCounts],[72]);
assert.equal(review.schema,'ao-schola-m63-dawn-communion-printed-witness-review-v1');
assert.equal(review.source.hash,spec.sha256);
assert.equal(review.decision.status,'RESEARCH_LISTENING_ELIGIBLE_NOT_EDITORIALLY_CERTIFIED');
assert.equal(review.decision.approvedPerformanceScore,false);
assert.equal(review.decision.manualOnly,true);
assert.equal(review.decision.canonical1962ProperChanged,false);
assert.equal(review.decision.archiveRewritten,false);
assert.equal(review.comparison.everyPrintedNoteheadIndependentlyCollated,false);
assert.equal(review.comparison.rhythmAndInterpretationCertified,false);
assert.equal(review.printWitnesses.length,3);
assert.deepEqual(review.printWitnesses.map(x=>x.url),[
 'https://gregobase.selapa.net/sources/2/58.png',
 'https://gregobase.selapa.net/sources/3/551.png',
 'https://media.musicasacra.com/pdf/exsultafilia.pdf'
]);
assert.equal(PROPER_M62_RESEARCH_SOURCES.length,19);
assert.equal(PROPER_M62_RESEARCH_SOURCES.reduce((a,x)=>a+x.sourceNotes,0),3185);
assert.equal(PROPER_RESEARCH_SOURCES.length,59);
assert.equal(new Set(PROPER_RESEARCH_SOURCES.map(x=>x.selectionId)).size,59);
assert.equal(PROPER_RESEARCH_SOURCES.reduce((a,x)=>a+x.sourceNotes,0),10036);
assert.equal(PROPER_RESEARCH_SOURCES.filter(x=>x.week==='CHRISTMAS_DAWN').length,5);
const selected=properM59ResearchScore(spec.selectionId);
assert.ok(selected);
assert.equal(selected.gabc,spec.sourceGabc);
assert.equal(selected.scoreApproved,false);
const compiled=compileProperM59ResearchMelody({selectionId:spec.selectionId,exsurge});
assert.ok(compiled,'M63 recovered source must pass original Exsurge compiler without any unknown notes');
assert.equal(compiled.sourceNotes,72);
assert.equal(compiled.melody.performance.length,72);
assert.equal(compiled.melody.phraseCount,1);
assert.equal(compiled.timing.events.length,72);
assert.equal(compiled.timing.certifiedGregorianTiming,false);
assert.equal(compiled.approved,false);
assert.equal(compiled.certified,false);
assert.equal(compiled.renderScore.canonicalGabc,spec.sourceGabc);
assert.equal(compiled.renderScore.scoreApproved,false);
for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN'])
 assert.equal(eligibleProperM59ResearchSource({selectionId:spec.selectionId,form,mode:'LIVE'}),true);
for(const context of [
 {form:'LOW',mode:'LIVE'},{form:'SOLEMN',mode:'MISSAL'},{form:'SOLEMN',mode:'LIVE',isRequiem:true}
])assert.equal(eligibleProperM59ResearchSource({selectionId:spec.selectionId,...context}),false);
for(const tampered of [
 {...selected,gabc:selected.gabc+' '},{...selected,scoreApproved:true},
 {...selected,scoreId:'GREGOBASE-9999'},{...selected,role:'GRADUAL'},
 {...selected,selectionId:'CHRISTMAS_DAY_COMMUNION'}
])assert.equal(compileProperM59ResearchMelody({
 selectionId:spec.selectionId,source:tampered,exsurge
}),null,'Do not play an unpinned, altered, or editorially mislabelled source');
assert.equal(compileProperM59ResearchMelody({selectionId:spec.selectionId,exsurge:null}),null);
console.log('PASS M63: recovered Exsulta filia, 72 digital noteheads, three printed witnesses, zero automatic appointment or editorial certification');
