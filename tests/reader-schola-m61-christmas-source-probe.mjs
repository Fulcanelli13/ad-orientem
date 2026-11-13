// M61 diagnostic: reproduce Exsurge's pitch, neume shape and notehead sequence
// from each archive-locked Christmas candidate. Logs exact counts for later pinning.
// Research only: this file does not authorize public playback or chant assignment.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const load=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const registry=load('data/research/mass-music-m61-christmas-four-masses-proper-candidates.v1.json');
assert.equal(registry.scores.length,19);
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8'),sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge,'Offline Exsurge engine must be present');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const cached=new Map();
const batch=path=>{if(!cached.has(path))cached.set(path,load(path));return cached.get(path)};
const make=gabc=>{
 const context=new exsurge.ChantContext();
 const score=new exsurge.ChantScore(context,exsurge.Gabc.createMappingsFromSource(context,gabc),true);
 score.performLayout(context);
 return score;
};
const signature=n=>({
 staffPosition:n.staffPosition,step:n.pitch?.step,octave:n.pitch?.octave,
 shape:n.shape,mora:n.morae?.length??0,episema:n.episemata?.length??0
});
const noteheads=score=>score.notations.flatMap(n=>n.notes??[]);
const results=[];
for(const spec of registry.scores){
 const source=batch(spec.sourceArchivePath).items.find(x=>x.id===spec.scoreId);
 const result={slot:spec.selectionId,scoreId:spec.scoreId,incipit:spec.incipit,
  sha256:spec.gabcSha256,sourceNotes:0,sections:[],bivirgae:0,
  pitchShapeParity:false,unmapped:[],compiled:null,hold:null};
 try{
  assert.ok(source,'Archive source cannot be missing');
  assert.equal(source.officePart,spec.officePart);
  assert.equal(source.sha256,spec.gabcSha256);
  assert.equal(sha(source.gabc),spec.gabcSha256);
  const converted=source.gabc.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
  const prelude='name:'+source.incipit+';\noffice-part:'+spec.officePart+';\n%%\n';
  const original=make(prelude+source.gabc);
  const normalized=make(prelude+converted);
  const a=noteheads(original),b=noteheads(normalized);
  result.sourceNotes=b.length;
  result.bivirgae=(source.gabc.match(/[a-m]vv/g)||[]).length;
  result.pitchShapeParity=JSON.stringify(a.map(signature))===JSON.stringify(b.map(signature));
  result.unmapped=b.filter(n=>!/^[a-mA-M]/.test(n.sourceGabc??''))
   .map(n=>({source:n.sourceGabc,index:n.sourceIndex})).slice(0,10);
  let count=0;
  for(const item of normalized.notations){
   if(item.constructor?.name==='DoubleBar'){result.sections.push(count);count=0;}
   else count+=item.notes?.length??0;
  }
  assert.equal(count,0,'Orphan note events after final double bar');
  assert.equal(result.bivirgae,spec.sourceBivirgaMatches);
  assert.equal(result.pitchShapeParity,true,'Exsurge changed source note shape or pitch');
  assert.equal(result.unmapped.length,0,'Unmappable source noteheads');
  const rendererGabc=prelude+converted;
  const melody=compileExsurgeGabcResearchMelody(rendererGabc,{
   exsurge,scoreId:spec.scoreId,
   expectedFingerprint:gabcResearchFingerprint(rendererGabc),
   expectedPhraseNoteCounts:result.sections,
   phraseSequence:result.sections.map((_,i)=>i)
  });
  assert.equal(melody.sourceNoteCount,b.length);
  result.compiled={sourceNotes:melody.sourceNoteCount,
   performanceNotes:melody.performance.length,phrases:melody.phraseCount,
   sourceFingerprint:gabcResearchFingerprint(source.gabc),
   rendererFingerprint:gabcResearchFingerprint(converted)};
 }catch(err){result.hold=String(err?.code||err?.message||err)}
 results.push(result);
 console.log('M61_CHRISTMAS_SOURCE_PROBE',JSON.stringify(result));
}
const holds=results.filter(x=>x.hold);
console.log('M61_CHRISTMAS_PROBE_SUMMARY',JSON.stringify({
 candidates:results.length,compiled:results.length-holds.length,
 noteheads:results.reduce((n,x)=>n+x.sourceNotes,0),
 byMass:Object.fromEntries(registry.masses.map(x=>[x.id,{
  candidates:results.filter(z=>z.slot.startsWith('CHRISTMAS_'+x.id+'_')).length,
  notes:results.filter(z=>z.slot.startsWith('CHRISTMAS_'+x.id+'_')).reduce((n,z)=>n+z.sourceNotes,0)
 }])),
 holds:holds.map(x=>({slot:x.slot,reason:x.hold,unmapped:x.unmapped})),
 absentArchiveSlot:registry.holds[0].selectionId
}));
assert.equal(results.length,19);
assert.deepEqual(holds,[],'Do not release candidate audio with source-note holds');
console.log('PASS M61 Christmas GABC source compiler parity, 19 provisional research candidates');
