// M60: exact-source sixteen? no — fifteen new research Proper melodies
// across Advent II, III and IV. No automatic Mass music, no editorial approval.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {PROPER_M60_RESEARCH_SOURCES} from
 '../src/mass/reader-schola-advent2-4-proper-sources.js';
import {
 PROPER_M59_RESEARCH_SOURCES,PROPER_RESEARCH_SOURCES,
 eligibleProperM59ResearchSource,properM59ResearchScore,
 compileProperM59ResearchMelody
} from '../src/mass/reader-schola-proper-research-melody.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const registry=read('../data/research/mass-music-m60-advent2-4-fifteen-proper-candidates.v1.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const bundle=readFileSync(
 new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.equal(PROPER_M59_RESEARCH_SOURCES.length,5);
assert.equal(PROPER_M60_RESEARCH_SOURCES.length,15);
assert.equal(PROPER_RESEARCH_SOURCES.filter(x=>x.selectionId.startsWith('ADVENT')).length,20);
assert.equal(PROPER_RESEARCH_SOURCES.length,74);
assert.equal(registry.scores.length,15);
assert.equal(registry.digitalSourceNoteheadTotal,2792);
assert.equal(registry.restrictions.noAutomaticLiturgicalAssignment,true);
assert.deepEqual([...new Set(PROPER_M60_RESEARCH_SOURCES.map(x=>x.week))],
 ['ADVENT2','ADVENT3','ADVENT4']);
const seen=new Set();
for(const spec of PROPER_M60_RESEARCH_SOURCES){
 assert.ok(!seen.has(spec.selectionId));
 seen.add(spec.selectionId);
 const pinned=registry.scores.find(x=>x.selectionId===spec.selectionId);
 assert.ok(pinned);
 assert.equal(pinned.scoreId,spec.scoreId);
 assert.equal(pinned.officePart,spec.officePart);
 assert.equal(pinned.gabcSha256,spec.sha256);
 assert.equal(pinned.gradualeRomanum1961Page,spec.printed1961Page);
 assert.equal(pinned.sourceFingerprint,spec.sourceFingerprint);
 assert.equal(pinned.rendererFingerprint,spec.rendererFingerprint);
 assert.equal(pinned.expectedDigitalNoteheads,spec.sourceNotes);
 assert.deepEqual(pinned.sourceNoteCountsBySection,[...spec.phraseNoteCounts]);
 assert.equal(pinned.sourceBivirgaMatches,spec.bivirgaCount);
 assert.equal(pinned.exsurgePitchShapeParity,true);
 const batch=read('../'+pinned.sourceArchivePath);
 assert.equal(batch.sourceEditionId,2);
 const original=batch.items.filter(x=>x.id===spec.scoreId);
 assert.equal(original.length,1);
 assert.equal(original[0].releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(original[0].officePart,spec.officePart);
 assert.equal(original[0].sourceUrl,spec.sourceUrl);
 assert.equal(original[0].gabc,spec.sourceGabc,
  'Original historical transcription must not be rewritten for the renderer');
 assert.equal(sha(spec.sourceGabc),spec.sha256);
 const preview=properM59ResearchScore(spec.selectionId);
 assert.ok(preview);
 assert.equal(preview.scoreApproved,false);
 assert.equal(preview.gabc,spec.sourceGabc);
 const prepared=compileProperM59ResearchMelody({
  selectionId:spec.selectionId,exsurge
 });
 assert.ok(prepared,'Expected source-verified preparation for '+spec.selectionId);
 assert.equal(prepared.approved,false);
 assert.equal(prepared.certified,false);
 assert.equal(prepared.sourceNotes,spec.sourceNotes);
 assert.equal(prepared.melody.performance.length,spec.sourceNotes);
 assert.deepEqual(prepared.melody.phrases.map(p=>
   p.reduce((n,g)=>n+g.notes.length,0)),[...spec.phraseNoteCounts]);
 assert.equal(prepared.renderScore.canonicalGabc,spec.sourceGabc);
 assert.equal(prepared.renderScore.scoreApproved,false);
 assert.equal(prepared.timing.certifiedGregorianTiming,false);
 for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN'])
 assert.equal(eligibleProperM59ResearchSource({
  selectionId:spec.selectionId,form,mode:'LIVE'
 }),true);
 for(const excluded of [
  {form:'LOW',mode:'LIVE'}, {form:'SOLEMN',mode:'MISSAL'},
  {form:'SOLEMN',mode:'LIVE',isRequiem:true}
 ]){
  assert.equal(eligibleProperM59ResearchSource({
   selectionId:spec.selectionId,...excluded
  }),false);
 }
 for(const altered of [
  {...preview,gabc:preview.gabc+' '},
  {...preview,scoreApproved:true},
  {...preview,scoreId:'GREGOBASE-0'},
  {...preview,role:'WRONG'},
  {...preview,selectionId:'ADVENT9_INTROIT'}
 ]){
  assert.equal(compileProperM59ResearchMelody({
   selectionId:spec.selectionId,source:altered,exsurge
  }),null,'Unpinned/approved/changed scores must never play');
 }
 assert.equal(compileProperM59ResearchMelody({
  selectionId:spec.selectionId,exsurge:null
 }),null);
 console.log('PASS M60 PROPER',JSON.stringify({
  id:spec.selectionId,scoreId:spec.scoreId,sourceNotes:spec.sourceNotes,
  sections:spec.phraseNoteCounts.length,bivirgas:spec.bivirgaCount
 }));
}
assert.equal(PROPER_M60_RESEARCH_SOURCES.reduce((n,x)=>n+x.sourceNotes,0),2792);
assert.equal(PROPER_RESEARCH_SOURCES.filter(x=>x.selectionId.startsWith('ADVENT'))
 .reduce((n,x)=>n+x.sourceNotes,0),3554);
assert.equal(PROPER_RESEARCH_SOURCES.reduce((n,x)=>n+x.sourceNotes,0),13440);
for(const invalid of ['ADVENT2_TRACT','ADVENT4_WRONG','','ADVENT5_INTROIT']){
 assert.equal(properM59ResearchScore(invalid),null);
 assert.equal(compileProperM59ResearchMelody({selectionId:invalid,exsurge}),null);
}
console.log('PASS M60: 15 additional archived Proper research scores, 2792 exact source-notehead events, never assigned to Mass');
