// M66: original 1961 GABC Exsurge parsing, notehead and renderer adapter parity.
// This only probes the archive for future manual playback; no user-facing player change.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const registry=read('data/research/mass-music-m66-holy-family-epiphany2-proper-candidates.v1.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8'),sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge);
const render=gabc=>{
 const ctx=new exsurge.ChantContext();
 const score=new exsurge.ChantScore(ctx,exsurge.Gabc.createMappingsFromSource(ctx,gabc),true);
 score.performLayout(ctx);
 return score;
};
const noteheads=score=>score.notations.flatMap(n=>n.notes??[]);
const signature=n=>({
 staffPosition:n.staffPosition,step:n.pitch?.step,octave:n.pitch?.octave,
 shape:n.shape,mora:n.morae?.length??0,episema:n.episemata?.length??0
});
const cache=new Map();
const archive=path=>{if(!cache.has(path))cache.set(path,read(path));return cache.get(path)};
let total=0;
const results=[];
for(const spec of registry.scores){
 const records=archive(spec.sourceArchivePath).items.filter(x=>x.id===spec.scoreId);
 assert.equal(records.length,1);
 const source=records[0];
 assert.equal(source.sha256,spec.gabcSha256);
 assert.equal(sha(source.gabc),spec.gabcSha256);
 assert.equal(gabcResearchFingerprint(source.gabc),spec.sourceFingerprint);
 const original=source.gabc;
 const normalized=original.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
 const header='name:'+spec.incipit+';\noffice-part:'+spec.officePart+';\n%%\n';
 const originalScore=render(header+original);
 const rendererScore=render(header+normalized);
 const a=noteheads(originalScore),b=noteheads(rendererScore);
 assert.deepEqual(JSON.parse(JSON.stringify(a.map(signature))),
  JSON.parse(JSON.stringify(b.map(signature))),
  'Bivirga spelling must preserve every notehead pitch and shape');
 const unknown=b.filter(n=>!/^[a-mA-M]/.test(n.sourceGabc??''));
 assert.equal(unknown.length,0,'Unknown source noteheads must not enter audio');
 const counts=[];let tail=0;
 for(const notation of rendererScore.notations){
  if(notation.constructor?.name==='DoubleBar'){counts.push(tail);tail=0;}
  else tail+=notation.notes?.length??0;
 }
 assert.equal(tail,0,'All sources must terminate with a printed-style double bar');
 assert.equal(counts.length,spec.sourceGabcSections);
 assert.ok(counts.every(n=>n>0),'Every phrase must have at least one notehead');
 assert.equal(counts.reduce((sum,n)=>sum+n,0),b.length);
 assert.equal(spec.sourceNoteheads,b.length,
  'Original source noteheads changed from M66 locked, 1961 pinned archival source');
 assert.deepEqual([...spec.phraseNoteCounts],counts,
  'Phrase counts drift from M66 exact original notehead lock');
 assert.equal(spec.exsurgeGabcParityTested,true);
 assert.equal(gabcResearchFingerprint(header+normalized),spec.rendererFingerprint);
 const compiled=compileExsurgeGabcResearchMelody(header+normalized,{
  exsurge,scoreId:spec.scoreId,
  expectedFingerprint:spec.rendererFingerprint,
  expectedPhraseNoteCounts:counts,
  phraseSequence:counts.map((_,i)=>i)
 });
 assert.equal(compiled.sourceNoteCount,b.length);
 assert.equal(compiled.performance.length,b.length);
 assert.equal(compiled.phraseCount,counts.length);
 total+=b.length;
 results.push({selectionId:spec.selectionId,scoreId:spec.scoreId,
  noteheads:b.length,phraseNoteCounts:counts,bivirgae:spec.sourceBivirgaMatches,
  reusedExisting:false});
 console.log('M66 EXSURGE SOURCE',JSON.stringify(results[results.length-1]));
}
assert.equal(results.length,10);
assert.equal(results.filter(x=>x.reusedExisting).length,0);
assert.equal(total,1711,'M66 recorded source noteheads are locked');
assert.equal(registry.counts.sourceDigitalNoteheadsAllSlots,total);
assert.equal(registry.counts.sourceDigitalNoteheadsCertifiedForResearch,true);
console.log('PASS M66 EXSURGE:',JSON.stringify({
 researchOnly:true,noPlayerChange:true,totalSourceDigitalNoteheads:total,
 sources:results.length,results
}));
