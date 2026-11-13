// M60 exploratory source audit for 15 Advent II/III/IV Proper witnesses.
// Never promotes repertoire: archived source hashes and pitch-shape parity
// are required for any experimental player. Run in pinned GitHub Actions.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {gabcResearchFingerprint,compileExsurgeGabcResearchMelody}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const read=u=>JSON.parse(readFileSync(new URL(u,import.meta.url),'utf8'));
const registry=read('../data/research/mass-music-m60-advent2-4-fifteen-proper-candidates.v1.json');
assert.equal(registry.scores.length,15);
assert.equal(registry.restrictions.noAutomaticLiturgicalAssignment,true);
assert.equal(registry.status,'SOURCE_PINNED_EXSURGE_PARITY_PASS_15');
const sourceCache=new Map();
const bundle=readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const data=[];
for(const spec of registry.scores){
 let batch=sourceCache.get(spec.archiveBatch);
 if(!batch){batch=read('../'+spec.sourceArchivePath);
   sourceCache.set(spec.archiveBatch,batch);}
 assert.equal(batch.sourceEditionId,2);
 const matches=batch.items.filter(x=>x.id===spec.scoreId);
 assert.equal(matches.length,1,'Every Gregorian source must have unique archive ID');
 const source=matches[0];
 for(const [key,field] of [
  ['officePart','officePart'],['sourceUrl','sourceUrl'],
  ['gradualeRomanum1961Page','gradualeRomanum1961Page'],
  ['gregobaseId','gregobaseId']])
 assert.equal(source[field],spec[key],'Source witness changed '+key);
 assert.equal(source.releaseStatus,'RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED');
 assert.equal(sha(source.gabc),spec.gabcSha256);
 assert.equal(source.sha256,spec.gabcSha256);
 assert.equal(source.gabc.length,spec.rawGabcLength);
 assert.equal((source.gabc.match(/\(::\)/g)||[]).length,spec.sourceGabcSections);
 const canonicalSource=source.gabc;
 const bivirgas=[...canonicalSource.matchAll(/([a-m])vv/g)].map(m=>({
  original:m[0],replacement:m[1]+'v/'+m[1]+'v',offset:m.index
 }));
 assert.equal(bivirgas.length,spec.sourceBivirgaMatches);
 const adapted=canonicalSource.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
 const prefix='name:'+source.incipit+';\noffice-part:'+spec.officePart+';\n%%\n';
 const canonicalGabc=prefix+canonicalSource,rendererGabc=prefix+adapted;
 const make=gabc=>{
  const context=new exsurge.ChantContext();
  const score=new exsurge.ChantScore(context,
   exsurge.Gabc.createMappingsFromSource(context,gabc),true);
  score.performLayout(context);
  return score;
 };
 const original=make(canonicalGabc),normalized=make(rendererGabc);
 const notationNotes=score=>score.notations.flatMap(n=>n.notes??[]);
 const noteSignature=n=>({
  staffPosition:n.staffPosition,step:n.pitch?.step,octave:n.pitch?.octave,
  shape:n.shape,mora:n.morae?.length??0,episema:n.episemata?.length??0
 });
 const rawNotes=notationNotes(original),mappedNotes=notationNotes(normalized);
 const sameNotes=JSON.stringify(rawNotes.map(noteSignature))===
  JSON.stringify(mappedNotes.map(noteSignature));
 const unknown=mappedNotes.filter(n=>!/^[a-mA-M]/.test(n.sourceGabc??''))
 .map(n=>({sourceGabc:n.sourceGabc,sourceIndex:n.sourceIndex})).slice(0,12);
 const counts=[];let subtotal=0;
 for(const n of normalized.notations){
  if(n.constructor?.name==='DoubleBar'){counts.push(subtotal);subtotal=0;}
  else subtotal+=n.notes?.length??0;
 }
 let compiled=null,hold=null;
 try{
  const mel=compileExsurgeGabcResearchMelody(rendererGabc,{
   exsurge,scoreId:spec.scoreId,
   expectedFingerprint:gabcResearchFingerprint(rendererGabc),
   expectedPhraseNoteCounts:counts,
   phraseSequence:counts.map((_,i)=>i)
  });
  compiled={sourceNotes:mel.sourceNoteCount,performanceNotes:mel.performance.length,
   sections:mel.phraseCount};
 }catch(e){hold=e.code??String(e?.message??e)}
 const result={selectionId:spec.selectionId,scoreId:spec.scoreId,week:spec.week,
  role:spec.role,page:spec.gradualeRomanum1961Page,
  sourceFingerprint:gabcResearchFingerprint(canonicalSource),
  rendererFingerprint:gabcResearchFingerprint(rendererGabc),
  originalSha256:sha(source.gabc),sourceNoteCount:mappedNotes.length,
  originalNotes:rawNotes.length,exsurgeRenderedNotes:
    normalized.notes.filter(n=>n instanceof exsurge.Note).length,
  phraseNoteCounts:counts,sourceTrailingNotes:subtotal,
  pitchShapeParity:sameNotes,bivirgas,sourceNoteHold:unknown,compiled,hold};
 assert.equal(result.sourceNoteCount,spec.expectedDigitalNoteheads,
  'The source-notehead count must be pinned to independent Exsurge evidence');
 assert.deepEqual(result.phraseNoteCounts,spec.sourceNoteCountsBySection,
  'Exact source-written section counts must not drift');
 assert.equal(result.sourceFingerprint,spec.sourceFingerprint);
 assert.equal(result.rendererFingerprint,spec.rendererFingerprint);
 assert.equal(result.pitchShapeParity,true,
  'Never expand a bivirga in a way that alters pitch, shape or rhythm marks');
 assert.deepEqual(result.sourceNoteHold,[],
  'Missing original source-pitch notehead prevents the preview');
 assert.ok(result.compiled&&!result.hold);
 assert.equal(result.compiled.sourceNotes,spec.expectedDigitalNoteheads);
 data.push(result);
 console.log('M60_PROPER_SOURCE_PROBE',JSON.stringify(result));
}
assert.equal(data.length,15);
assert.equal(new Set(data.map(x=>x.selectionId)).size,15);
assert.equal(new Set(data.map(x=>x.scoreId)).size,15);
assert.ok(data.every(x=>x.originalSha256.length===64&&x.sourceTrailingNotes===0));
assert.equal(data.reduce((n,x)=>n+x.sourceNoteCount,0),2792);
assert.equal(registry.digitalSourceNoteheadTotal,2792);
console.log('M60_PROPER_PROBE_SUMMARY',JSON.stringify({
 totalSources:data.length,sourceNoteTotals:data.reduce((n,x)=>n+x.sourceNoteCount,0),
 compiled:data.filter(x=>x.compiled&&x.pitchShapeParity&&!x.sourceNoteHold.length)
  .map(x=>x.selectionId),
 holds:data.filter(x=>!x.compiled||!x.pitchShapeParity||x.sourceNoteHold.length)
  .map(x=>({id:x.selectionId,hold:x.hold,pitchShapeParity:x.pitchShapeParity,
    unmappable:x.sourceNoteHold,notes:x.sourceNoteCount})),
}));
console.log('PASS M60 research audit: all fifteen source IDs and exact archival hashes checked, no public playback enabled');
