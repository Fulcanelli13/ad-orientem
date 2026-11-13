// M58 — source-authenticated five-Proper Gregorian research melody feasibility.
// The entire 1195-record historic archive is consumed in Node ONLY.
// Nothing from this test can publish a score, assign music or play audio.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {gabcResearchFingerprint,compileExsurgeGabcResearchMelody}
  from '../src/mass/reader-schola-exsurge-gabc-melody.js';

const read=url=>JSON.parse(readFileSync(new URL(url,import.meta.url),'utf8'));
const registry=read('../data/research/mass-music-m58-advent1-five-proper-source-pilot.v1.json');
const index=read('../data/mass/chant-corpus/gr1961-proper-index.json');
assert.equal(registry.schema,'ao-schola-m58-advent1-five-proper-research-source-pilot-v1');
assert.equal(registry.calendarContext.date,'2026-11-29');
assert.equal(registry.calendarContext.automaticMassSelection,false);
assert.equal(registry.developmentStage,'RESEARCH_ENGINE_PROBE_NOT_LIVE_PLAYER');
assert.equal(index.sourceEditionId,2);
assert.equal(index.status,'RESEARCH_ONLY_NOT_MASS_READER');
assert.equal(index.screening.validStaged,1195);
assert.equal(registry.chantRoles.length,5);
assert.deepEqual(registry.chantRoles.map(x=>x.role),
 ['INTROIT','GRADUAL','ALLELUIA','OFFERTORY','COMMUNION']);
const sourceCache=new Map();
const exsurgeAsset=readFileSync(
 new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(exsurgeAsset,sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.equal(typeof exsurge.Note,'function');
const results=[];
for(const spec of registry.chantRoles){
 let batch=sourceCache.get(spec.archiveBatch);
 if(!batch){
  const path='../data/mass/chant-corpus/gr1961-proper-'+String(spec.archiveBatch).padStart(3,'0')+'.json';
  batch=read(path);sourceCache.set(spec.archiveBatch,batch);
 }
 assert.equal(batch.sourceEditionId,2);
 assert.equal(batch.status,'STAGED_UNRELEASED');
 const archived=batch.items.filter(x=>x.id===spec.scoreId);
 assert.equal(archived.length,1,'Source ID must be unique in its canonical archive');
 const source=archived[0];
 assert.equal(source.sourceEditionId,2);
 assert.equal(source.id,spec.scoreId);
 assert.equal(source.gregobaseId,spec.gregobaseId);
 assert.equal(source.officePart,spec.officePart);
 assert.equal(source.gradualeRomanum1961Page,spec.gradualeRomanum1961Page);
 assert.equal(source.releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(source.sourceUrl,spec.sourceUrl);
 const sha=createHash('sha256').update(source.gabc,'utf8').digest('hex');
 assert.equal(sha,spec.gabcSha256,'Original GABC bytes must remain source-authenticated');
 assert.equal(sha,source.sha256,'Research record cannot override the 1195-score archive SHA');
 assert.ok(/^\([cf][1-4]\)/.test(source.gabc.trim()));
 const wrapped='name:'+spec.incipit+';\noffice-part:'+spec.officePart+';\n%%\n'+source.gabc;
 assert.ok(wrapped.includes('%%\n('));
 const context=new exsurge.ChantContext();
 const parsed=new exsurge.ChantScore(context,
   exsurge.Gabc.createMappingsFromSource(context,wrapped),true);
 parsed.performLayout(context);
 const sourceNotes=parsed.notations.flatMap(n=>n.notes??[]);
 const counts=[];let phraseNotes=0;
 for(const notation of parsed.notations){
  if(notation.constructor?.name==='DoubleBar'){counts.push(phraseNotes);phraseNotes=0;}
  else phraseNotes+=notation.notes?.length??0;
 }
 assert.equal(phraseNotes,0,'Only completed source phrases are eligible');
 assert.ok(sourceNotes.length>5,'Proper must contain real GABC noteheads');
 const unmapped=sourceNotes.filter(n=>!/^[a-mA-M]/.test(n.sourceGabc??''));
 let prepared=null,hold=null;
 try{
  const melody=compileExsurgeGabcResearchMelody(wrapped,{
   exsurge,scoreId:spec.scoreId,
   expectedFingerprint:gabcResearchFingerprint(wrapped),
   expectedPhraseNoteCounts:counts,
   phraseSequence:counts.map((_,i)=>i)
  });
  prepared={notes:melody.sourceNoteCount,performed:melody.performance.length,
    phrases:melody.phraseCount};
 }catch(error){hold=error.code??String(error?.message??error)}
 const record={
  role:spec.role,scoreId:spec.scoreId,page:spec.gradualeRomanum1961Page,
  sourceSha256:sha,sourceCount:sourceNotes.length,renderedNoteHeads:
    parsed.notes.filter(n=>n instanceof exsurge.Note).length,
  phraseCounts:counts,unmapped:unmapped.slice(0,8).map(x=>({
   sourceGabc:x.sourceGabc,index:x.sourceIndex,staffPosition:x.staffPosition
  })),researchPrepared:prepared,hold
 };
 results.push(record);
 console.log('M58_ADVENT1_PROPER_SOURCE_PROBE',JSON.stringify(record));
}
assert.equal(results.length,5);
assert.equal(new Set(results.map(x=>x.scoreId)).size,5);
assert.ok(results.every(x=>x.sourceSha256.length===64));
console.log('PASS M58: five 1961 Proper GABC source identities and no unapproved liturgical assignments');
