// M68 pre-Lent: exact offline Exsurge GABC parse and source-note parity probe.
// Reports digital noteheads and phrase boundaries, does NOT make music playable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const registry=read('data/research/mass-music-m68-prelent-three-sundays-proper-candidates.v1.json');
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
const archiveCache=new Map();
const archive=path=>{if(!archiveCache.has(path))archiveCache.set(path,read(path));return archiveCache.get(path)};
const results=[];
let sum=0;
for(const spec of registry.scores){
 assert.ok(Number.isInteger(spec.sourceNoteheads)&&spec.sourceNoteheads>0,
  'M68 source has a digitally-verified locked notehead count');
 assert.ok(Array.isArray(spec.phraseNoteCounts));
 assert.equal(spec.exsurgeParityVerified,true);
 const entries=archive(spec.sourceArchivePath).items.filter(x=>x.id===spec.scoreId);
 assert.equal(entries.length,1,'No missing/duplicate archive transcriptions');
 const original=entries[0].gabc;
 assert.equal(sha(original),spec.gabcSha256);
 assert.equal(gabcResearchFingerprint(original),spec.sourceFingerprint);
 const normalized=original.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
 const header='name:'+spec.incipit+';\noffice-part:'+spec.officePart+';\n%%\n';
 const raw=render(header+original);
 const expanded=render(header+normalized);
 const rawNotes=noteheads(raw),rNotes=noteheads(expanded);
 assert.deepEqual(JSON.parse(JSON.stringify(rawNotes.map(signature))),
  JSON.parse(JSON.stringify(rNotes.map(signature))),
  'Normalization must preserve the original pitch/shape signature');
 assert.equal(rNotes.filter(n=>!/^[a-mA-M]/.test(n.sourceGabc??'')).length,0,
  'Unknown annotation may not masquerade as a source notehead');
 let tail=0;
 const phraseNoteCounts=[];
 for(const notation of expanded.notations){
  if(notation.constructor?.name==='DoubleBar'){
   assert.ok(tail>0,'No empty double-bar phrase');
   phraseNoteCounts.push(tail);tail=0;
  }else tail+=notation.notes?.length??0;
 }
 assert.equal(tail,0,'Original archival source must terminate in double bar');
 assert.equal(phraseNoteCounts.length,spec.sourceDoubleBarTokens,
  'Original GABC double bars must match Exsurge section count (including clef changes)');
 assert.equal(phraseNoteCounts.reduce((a,b)=>a+b,0),rNotes.length);
 assert.equal(spec.sourceNoteheads,rNotes.length,
  'M68 exact GABC digital notehead counts must fail on drift');
 assert.deepEqual([...spec.phraseNoteCounts],phraseNoteCounts,
  'M68 original Exsurge phrase maps must fail on drift');
 assert.ok(rNotes.length>=15,'Unexpectedly short full Proper source');
 assert.equal(gabcResearchFingerprint(header+normalized),spec.rendererFingerprint);
 const compiled=compileExsurgeGabcResearchMelody(header+normalized,{
  exsurge,scoreId:spec.scoreId,
  expectedFingerprint:spec.rendererFingerprint,
  expectedPhraseNoteCounts:phraseNoteCounts,
  phraseSequence:phraseNoteCounts.map((_,i)=>i)
 });
 assert.equal(compiled.sourceNoteCount,rNotes.length);
 assert.equal(compiled.performance.length,rNotes.length);
 assert.equal(compiled.phraseCount,phraseNoteCounts.length);
 sum+=rNotes.length;
 const result={selectionId:spec.selectionId,scoreId:spec.scoreId,role:spec.role,
  noteheads:rNotes.length,phraseNoteCounts,bivirgaCount:spec.bivirgaMatches};
 results.push(result);
 console.log('M68 EXSURGE SOURCE',JSON.stringify(result));
}
assert.equal(results.length,15);
assert.deepEqual(results.filter(x=>x.role==='TRACT').map(x=>x.selectionId),
 ['SEPTUAGESIMA_TRACT','SEXAGESIMA_TRACT','QUINQUAGESIMA_TRACT']);
assert.equal(sum,3404,'M68 15 exact archived sources must retain 3,404 digital noteheads');
assert.equal(registry.counts.sourceDigitalNoteheads,sum);
assert.equal(registry.counts.sourceDigitalNoteheadsCertifiedForResearch,true);
console.log('PASS M68 EXSURGE:',JSON.stringify({
 researchOnly:true,noPlayerChange:true,totalDigitalNoteheads:sum,
 sources:results.length,tracts:3,results
}));
