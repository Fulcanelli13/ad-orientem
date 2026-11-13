// M64 — Exsurge source-shape and notehead parity for Jan 1/Epiphany audit.
// NO runtime integration: archival research source compatibility only.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const registry=read('data/research/mass-music-m64-nativity-octave-epiphany-proper-candidates.v1.json');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8'),sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge);
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const cache=new Map();
const archived=path=>{if(!cache.has(path))cache.set(path,read(path));return cache.get(path)};
const render=gabc=>{
 const context=new exsurge.ChantContext();
 const score=new exsurge.ChantScore(context,exsurge.Gabc.createMappingsFromSource(context,gabc),true);
 score.performLayout(context);return score;
};
const noteheads=score=>score.notations.flatMap(x=>x.notes??[]);
const signature=n=>({
 staffPosition:n.staffPosition,step:n.pitch?.step,octave:n.pitch?.octave,
 shape:n.shape,mora:n.morae?.length??0,episema:n.episemata?.length??0
});
const results=[];
for(const spec of registry.scores){
 const source=archived(spec.sourceArchivePath).items.find(x=>x.id===spec.scoreId);
 assert.ok(source,'Pinned 1961 GABC missing: '+spec.selectionId);
 assert.equal(source.sha256,spec.gabcSha256);
 assert.equal(sha(source.gabc),spec.gabcSha256);
 const canonical=source.gabc;
 const bivirgae=(canonical.match(/[a-m]vv/g)||[]).length;
 const normalized=canonical.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
 const head='name:'+source.incipit+';\noffice-part:'+source.officePart+';\n%%\n';
 const original=render(head+canonical),compatible=render(head+normalized);
 const a=noteheads(original),b=noteheads(compatible);
 assert.deepEqual(JSON.parse(JSON.stringify(a.map(signature))),
  JSON.parse(JSON.stringify(b.map(signature))),
  'Normalizing bv/virgae must not alter notehead pitches or shapes');
 const unknown=b.filter(x=>!/^[a-mA-M]/.test(x.sourceGabc??''));
 assert.deepEqual(unknown.map(x=>x.sourceGabc),[],'Cannot ship unknown Exsurge noteheads');
 const counts=[];let tail=0;
 for(const n of compatible.notations){
  if(n.constructor?.name==='DoubleBar'){counts.push(tail);tail=0;}
  else tail+=n.notes?.length??0;
 }
 assert.equal(tail,0,'Last bar is mandatory');
 assert.deepEqual(counts,spec.phraseNoteCounts);
 assert.equal(counts.length,spec.sourceGabcSections);
 assert.equal(counts.reduce((n,x)=>n+x,0),spec.sourceNoteheads);
 assert.equal(b.length,spec.sourceNoteheads);
 assert.equal(bivirgae,spec.sourceBivirgaMatches);
 assert.equal(gabcResearchFingerprint(canonical),spec.sourceFingerprint);
 assert.equal(gabcResearchFingerprint(head+normalized),spec.rendererFingerprint);
 const prepared=compileExsurgeGabcResearchMelody(head+normalized,{
  exsurge,scoreId:spec.scoreId,
  expectedFingerprint:spec.rendererFingerprint,
  expectedPhraseNoteCounts:spec.phraseNoteCounts,
  phraseSequence:spec.phraseNoteCounts.map((_,i)=>i)
 });
 assert.equal(prepared.sourceNoteCount,spec.sourceNoteheads);
 assert.equal(prepared.performance.length,spec.sourceNoteheads);
 assert.equal(prepared.phraseCount,spec.sourceGabcSections);
 results.push({
  selectionId:spec.selectionId,scoreId:spec.scoreId,
  sourceNotes:b.length,phraseNoteCounts:counts,
  reusedExisting:!!spec.reuseExistingChristmasDaySelectionId
 });
 console.log('PASS M64 SOURCE',JSON.stringify(results[results.length-1]));
}
assert.equal(results.length,10);
assert.equal(results.reduce((n,x)=>n+x.sourceNotes,0),1663);
assert.equal(results.filter(x=>!x.reusedExisting).reduce((n,x)=>n+x.sourceNotes,0),1012);
assert.equal(results.filter(x=>x.reusedExisting).reduce((n,x)=>n+x.sourceNotes,0),651);
console.log('PASS M64 EXSURGE SOURCE AUDIT: ten exact original 1961 GABCs, 1663 noteheads, 6 new-score candidates and 4 retained Christmas Day aliases; player unchanged');
