// M59 — five source-locked, explicit user-chosen Proper research melodies.
// This is the same vendored Exsurge engine used by the existing 20 Kyriale
// examples; compilation is not source-edition certification or Mass assignment.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {PROPER_M59_RESEARCH_SOURCES,PROPER_M59_POLICY,
  eligibleProperM59ResearchSource,properM59ResearchScore,
  compileProperM59ResearchMelody} from
  '../src/mass/reader-schola-proper-research-melody.js';

const read=url=>JSON.parse(readFileSync(new URL(url,import.meta.url),'utf8'));
const pilot=read('../data/research/mass-music-m58-advent1-five-proper-source-pilot.v1.json');
const bundle=readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',
  import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
assert.equal(PROPER_M59_POLICY.approvedScores,0);
assert.equal(PROPER_M59_POLICY.liturgicalAssignment,false);
assert.equal(PROPER_M59_POLICY.automaticPlayback,false);
assert.equal(PROPER_M59_POLICY.noRemoteAudio,true);
assert.equal(PROPER_M59_RESEARCH_SOURCES.length,5);
assert.deepEqual(PROPER_M59_RESEARCH_SOURCES.map(x=>x.role),
 ['INTROIT','GRADUAL','ALLELUIA','OFFERTORY','COMMUNION']);
const seen=new Set();
for(const spec of PROPER_M59_RESEARCH_SOURCES){
 assert.ok(!seen.has(spec.selectionId));seen.add(spec.selectionId);
 const original=properM59ResearchScore(spec.selectionId);
 assert.ok(original,'Score exists only for explicitly indexed source');
 assert.equal(original.scoreId,spec.scoreId);
 assert.equal(original.scoreApproved,false);
 assert.equal(original.gabc,spec.sourceGabc);
 assert.equal(sha(original.gabc),spec.sha256);
 const witness=pilot.chantRoles.find(x=>x.scoreId===spec.scoreId);
 assert.ok(witness,'Source has an M58 archived 1961 witness');
 assert.equal(witness.expectedDigitalNoteheads,spec.sourceNotes);
 assert.equal(witness.gabcSha256,sha(original.gabc));
 assert.equal(witness.officePart,spec.officePart);
 assert.equal(witness.gradualeRomanum1961Page,spec.printed1961Page);
 assert.deepEqual(spec.bivirgaAdapters,witness.vendoredExsurgeEquivalentBivirgaReplacements);
 const batch=read('../data/mass/chant-corpus/gr1961-proper-'+
   String(witness.archiveBatch).padStart(3,'0')+'.json');
 const archival=batch.items.filter(x=>x.id===spec.scoreId);
 assert.equal(archival.length,1);
 assert.equal(archival[0].gabc,original.gabc,'Original body must remain byte-identical');
 const result=compileProperM59ResearchMelody({selectionId:spec.selectionId,exsurge});
 assert.ok(result,'Pinned source rejected '+spec.selectionId);
 assert.equal(result.approved,false);
 assert.equal(result.certified,false);
 assert.equal(result.sourceNotes,spec.sourceNotes);
 assert.equal(result.melody.sourceNoteCount,spec.sourceNotes);
 assert.equal(result.melody.performance.length,spec.sourceNotes);
 assert.deepEqual(result.melody.phrases.map(p=>
   p.reduce((n,g)=>n+g.notes.length,0)),[...spec.phraseNoteCounts]);
 assert.equal(result.renderScore.canonicalGabc,original.gabc);
 assert.equal(result.renderScore.scoreApproved,false);
 assert.equal(result.timing.certifiedGregorianTiming,false);
 assert.equal(result.timing.events.length,spec.sourceNotes);
 for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN'])
  assert.equal(eligibleProperM59ResearchSource({
   selectionId:spec.selectionId,form,mode:'LIVE'
  }),true);
 for(const unavailable of [
  {form:'LOW',mode:'LIVE'},
  {form:'SOLEMN',mode:'MISSAL'},
  {form:'SOLEMN',mode:'LIVE',isRequiem:true}
 ]){
  assert.equal(eligibleProperM59ResearchSource({
    selectionId:spec.selectionId,...unavailable
  }),false,'No inappropriate Mass form can reveal music');
 }
 for(const forged of [
  {...original,gabc:original.gabc+' '},
  {...original,scoreApproved:true},
  {...original,scoreId:'GREGOBASE-0'},
  {...original,role:'OTHER'},
  {...original,selectionId:'ADVENT1_WRONG'}
 ]){
  assert.equal(compileProperM59ResearchMelody({
    selectionId:spec.selectionId,source:forged,exsurge
  }),null,'Exact archive mutations fail closed');
 }
 assert.equal(compileProperM59ResearchMelody({
   selectionId:spec.selectionId,exsurge:null
 }),null);
 console.log('PASS M59 PROPER',JSON.stringify({
   role:spec.role,sourceId:spec.scoreId,notes:spec.sourceNotes,
   sections:spec.phraseNoteCounts.length,adapterPairs:spec.bivirgaAdapters.length
 }));
}
assert.equal(PROPER_M59_RESEARCH_SOURCES.reduce((n,x)=>n+x.sourceNotes,0),762);
for(const rogue of ['ADVENT1_TRACT','OTHER','',null]){
 assert.equal(properM59ResearchScore(rogue),null);
 assert.equal(eligibleProperM59ResearchSource({
   selectionId:rogue,form:'SOLEMN',mode:'LIVE'
 }),false);
 assert.equal(compileProperM59ResearchMelody({
   selectionId:rogue,exsurge
 }),null);
}
console.log('PASS M59: five exact archived Advent I Proper research sources, 762 original digital noteheads, no automatic Mass assignment');
