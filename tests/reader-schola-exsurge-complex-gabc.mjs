// M48: pinned offline Exsurge semantic notation interpreter, research-only.
// Tests real advanced GABC, source fingerprints, explicit repetitions, pitch
// parity, actual SVG notehead identity and fail-closed source boundaries.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {offlineKyrialeResearchScore} from '../src/mass/reader-kyriale-research-gabc.js';
import {compileGabcMelody,scheduleGabcMelody,
 UnsupportedGabcMelodyError,GABC_MELODY_POLICY} from
 '../src/mass/reader-schola-gabc-melody.js';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint,
 EXSURGE_RESEARCH_POLICY} from '../src/mass/reader-schola-exsurge-gabc-melody.js';
import {mapExsurgeSvgNoteheads} from '../src/mass/reader-schola-exsurge-notehead-follow.js';

const evidence=JSON.parse(readFileSync(new URL(
 '../data/research/mass-music-m48-complex-gabc-exsurge-source-pitches.v1.json',
 import.meta.url),'utf8'));
const bundle=readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:10000,filename:'pinned-exsurge.min.js'});
const exsurge=sandbox.exsurge;
assert.equal(typeof exsurge.Gabc.createMappingsFromSource,'function');
assert.equal(evidence.researchSources.length,6);
assert.equal(evidence.publication.approvedScoresAdded,0);
assert.equal(evidence.publication.newUiControls,false);
assert.equal(EXSURGE_RESEARCH_POLICY.defaultAudio,false);
assert.equal(EXSURGE_RESEARCH_POLICY.manuscriptTimingCertified,false);
const plan=[0,0,0,1,1,1,2,2,3];
assert.deepEqual(evidence.phraseSequence,plan);
function mapFixture(record){
 const src=offlineKyrialeResearchScore('KYRIE',record.setting);
 assert.equal(src?.scoreId,record.scoreId,'Catalogue ID must not be guessed');
 assert.equal(src.scoreApproved,false);
 assert.equal(gabcResearchFingerprint(src.gabc),record.sourceFingerprint);
 return {src,option:{
   exsurge,scoreId:record.scoreId,expectedFingerprint:record.sourceFingerprint,
   expectedPhraseNoteCounts:record.phraseNoteCounts,phraseSequence:plan
 }};
}
function rejectScore(gabc,option,code){
 assert.throws(()=>compileExsurgeGabcResearchMelody(gabc,option),error=>{
   assert.equal(error instanceof UnsupportedGabcMelodyError,true);
   assert.equal(error.code,code);return true;
 });
}
function svgRecords(svg){
 const uses=[...svg.matchAll(/<use\b[^>]*>/gu)].map(x=>x[0])
   .filter(x=>/\bclass="[^"]*\bnote\b[^"]*"/u.test(x)&&
     /\bid="note-\d+"/u.test(x));
 const attr=(tag,name)=>tag.match(new RegExp('(?:^|\\s)'+name+'="([^"]*)"'))?.[1]??null;
 return uses.map(tag=>({
   id:attr(tag,'id'),sourceIndex:attr(tag,'source-index'),
   elementIndex:attr(tag,'element-index'),
   href:attr(tag,'xlink:href')??attr(tag,'href')
 }));
}
function mockSvg(records){
 const nodes=records.map(r=>({
   id:r.id,dataset:{},
   getAttribute:name=>name==='source-index'?r.sourceIndex:
     name==='element-index'?r.elementIndex:
     name==='xlink:href'?r.href:name==='href'?null:null,
   getAttributeNS:()=>r.href,
   closest:selector=>selector==='g.ChantNotationElement'?{}:null
 }));
 return {classList:{contains:token=>token==='Exsurge'},
   querySelectorAll:selector=>selector==='use.note[id^="note-"]'?nodes:[]};
}
const parity={},verified=[];
for(const record of evidence.researchSources){
 const {src,option}=mapFixture(record);
 const compiled=compileExsurgeGabcResearchMelody(src.gabc,option);
 assert.equal(compiled.policy,GABC_MELODY_POLICY);
 assert.equal(compiled.advancedNotation,EXSURGE_RESEARCH_POLICY);
 assert.equal(compiled.sourceFingerprint,record.sourceFingerprint);
 assert.equal(compiled.sourceNoteCount,record.sourceNoteCount);
 assert.equal(compiled.phraseCount,4);
 assert.deepEqual(compiled.phrases.map(phrase=>
   phrase.reduce((n,g)=>n+g.notes.length,0)),record.phraseNoteCounts);
 assert.equal(compiled.performance.length,record.performanceNotes);
 assert.equal(compiled.invocations,9);
 assert.equal(compiled.performance[0].sourceNoteOrdinal,1);
 assert.equal(compiled.performance[record.phraseNoteCounts[0]].sourceNoteOrdinal,1);
 assert.equal(compiled.performance.at(-1).sourceNoteOrdinal,record.sourceNoteCount);
 assert.ok(compiled.sourceNotes.every((note,i)=>note.sourceNoteOrdinal===i+1));
 assert.ok(compiled.sourceNotes.every((note,i)=>i===0||
   note.sourceIndex>compiled.sourceNotes[i-1].sourceIndex));
 const timing=scheduleGabcMelody(compiled);
 assert.equal(timing.events.length,record.performanceNotes);
 assert.equal(timing.certifiedGregorianTiming,false);
 assert.equal(timing.events.filter(e=>e.gapAfterMs>0).length,8);
 assert.ok(timing.events.every(e=>Number.isInteger(e.midi)&&e.midi>=48&&e.midi<=120));

 const ctx=new exsurge.ChantContext();
 const score=new exsurge.ChantScore(ctx,
   exsurge.Gabc.createMappingsFromSource(ctx,src.gabc),true);
 score.performLayout(ctx);
 const exNotes=score.notes.filter(n=>n instanceof exsurge.Note);
 assert.equal(exNotes.length,compiled.sourceNoteCount);
 assert.deepEqual(compiled.sourceNotes.map(n=>n.midi),
   Array.from(exNotes,n=>12*(n.pitch.octave+4)+n.pitch.step));
 for(const width of (record.setting==='MASS_08'||record.setting==='MASS_17'?
   [304,374,720]:[374])){
   await new Promise((ok,fail)=>{
     try{score.layoutChantLines(ctx,width,ok)}catch(e){fail(e)}
   });
   const svg=score.createSvg(ctx);
   const records=svgRecords(svg);
   assert.equal(records.length,compiled.sourceNoteCount,
     'Real SVG must contain every sounded source note at '+width);
   assert.ok(records.every((r,i)=>r.id==='note-'+(i+1)));
   assert.deepEqual(records.map(r=>Number(r.sourceIndex)),
     compiled.sourceNotes.map(n=>n.sourceIndex));
   assert.equal(mapExsurgeSvgNoteheads(mockSvg(records),compiled).length,
     compiled.sourceNoteCount,'Mapped SVG glyphs must cover source notes');
   if(record.setting==='MASS_08'||record.setting==='MASS_17')
     verified.push({setting:record.setting,width,notes:records.length});
 }
 // The older, strictly limited text parser should still agree wherever
 // it already supports the notation. Do not loosen that fail-closed parser.
 if(['MASS_11','MASS_16','MASS_18'].includes(record.setting)){
   const original=compileGabcMelody(src.gabc,{phraseSequence:plan});
   assert.deepEqual(compiled.sourceNotes.map(n=>n.midi),
     original.sourceNotes.map(n=>n.midi));
   parity[record.setting]=compiled.sourceNoteCount;
 }
 // Prevent publishing source-mismatched, malformed or unreviewed music.
 rejectScore(src.gabc+' ',option,'SOURCE_FINGERPRINT_MISMATCH');
 rejectScore(src.gabc,{...option,expectedFingerprint:'00000000'},
   'SOURCE_FINGERPRINT_MISMATCH');
 rejectScore(src.gabc,{...option,scoreId:'Kyrie-'+record.setting},
   'EXPLICIT_SOURCE_ID_REQUIRED');
 rejectScore(src.gabc,{...option,expectedPhraseNoteCounts:[1,1,1,1]},
   'EXSURGE_PHRASE_NOTES_MISMATCH');
 rejectScore(src.gabc,{...option,phraseSequence:[]},
   'EXPLICIT_PERFORMANCE_PLAN_REQUIRED');
 rejectScore(src.gabc,{...option,phraseSequence:[4]},
   'EXPLICIT_PERFORMANCE_PLAN_REQUIRED');
 rejectScore(src.gabc,{...option,exsurge:null},
   'PINNED_EXSURGE_API_REQUIRED');
}
// The source reader remains Kyrie XVI only; adding a semantic parser is
// never approval to offer Kyrie I, VIII, XI, XVII or XVIII as live audio.
assert.ok(!evidence.publication.automaticChantSelection);
console.log('M48_COMPLEX_GABC',JSON.stringify({
 sources:evidence.researchSources.map(x=>({
   setting:x.setting,sourceNotes:x.sourceNoteCount,
   performedNotes:x.performanceNotes})),parity,advancedSvgChecks:verified
}));
console.log('PASS M48: six source-pinned advanced GABC Kyries, exact Exsurge pitch/neume identities, explicit repeats, 1961 research boundaries and fail-closed unsupported source conditions');
