// M70: measure source-digital noteheads and phrase boundaries for the two 1961 Masses.
// Does NOT publish melodies, ash ritual sound, Mass assignments or rhythmic claims.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint}
 from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const source=read('data/research/mass-music-m70-ash-wednesday-lent1-proper-candidates.v1.json');
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8'),sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
assert.ok(exsurge);
const render=gabc=>{
 const context=new exsurge.ChantContext();
 const score=new exsurge.ChantScore(context,exsurge.Gabc.createMappingsFromSource(context,gabc),true);
 score.performLayout(context);
 return score;
};
const heads=score=>score.notations.flatMap(n=>n.notes??[]);
const signature=n=>({
 staffPosition:n.staffPosition,step:n.pitch?.step,octave:n.pitch?.octave,
 shape:n.shape,mora:n.morae?.length??0,episema:n.episemata?.length??0
});
const cache=new Map();
const archive=p=>{if(!cache.has(p))cache.set(p,read(p));return cache.get(p)};
const rows=[];let total=0;
let verifiedFusionNoteheads=0;
assert.equal(source.scores.length,10);
assert.equal(source.stage,'SOURCE_IDENTITY_SCREEN_PRE_EXSURGE_NOTEHEAD_LOCK_NO_PLAYER_CHANGE');
for(const spec of source.scores){
 assert.equal(spec.sourceNoteheads,null);
 assert.equal(spec.phraseNoteCounts,null);
 assert.equal(spec.exsurgeParityVerified,false);
 const matches=archive(spec.sourceArchivePath).items.filter(x=>x.id===spec.scoreId);
 assert.equal(matches.length,1);
 const raw=matches[0].gabc;
 assert.equal(sha(raw),spec.gabcSha256);
 assert.equal(gabcResearchFingerprint(raw),spec.sourceFingerprint);
 const normalized=raw.replace(/([a-m])vv/g,(_,n)=>n+'v/'+n+'v');
 const header='name:'+spec.incipit+';\noffice-part:'+spec.officePart+';\n%%\n';
 const original=render(header+raw);
 const expanded=render(header+normalized);
 const x=heads(original),y=heads(expanded);
 assert.deepEqual(JSON.parse(JSON.stringify(x.map(signature))),
  JSON.parse(JSON.stringify(y.map(signature))),
  'Bivirga expansion must preserve original pitches, shapes, articulations');
 const suspect=y.map((n,i)=>({n,i})).filter(({n})=>!/^[a-mA-M]/.test(n.sourceGabc??''))
  .map(({n,i})=>({noteIndex:i,sourceGabc:n.sourceGabc??null,
   staffPosition:n.staffPosition,pitchStep:n.pitch?.step,pitchOctave:n.pitch?.octave,
   shape:n.shape}));
 // GABC @ is the documented neume-fusion marker, not an alien pitch.
 // The original Ash Wednesday Introit contains exactly the authentic
 // (f@h!gh~) neume. Vendored Exsurge reports its fused h as '@h!':
 // verify this exact SHA-pinned source/token/pitch rather than silently
 // discarding a source note or broadly allowing unsupported source tokens.
 if(spec.selectionId==='ASH_WEDNESDAY_INTROIT'){
  assert.equal(suspect.length,1,'Exactly one known original GABC fusion token');
  assert.equal(suspect[0].noteIndex,96);
  assert.equal(suspect[0].sourceGabc,'@h!');
  assert.equal(suspect[0].staffPosition,5);
  assert.equal(suspect[0].shape,0);
  assert.ok(raw.includes('et(f@h!gh~)'), 'Exact archived GABC fusion is required');
  verifiedFusionNoteheads++;
  console.log('M70 ORIGINAL GABC FUSION',JSON.stringify({
   selectionId:spec.selectionId,token:suspect[0].sourceGabc,
   noteIndex:suspect[0].noteIndex,sourcePhrase:'et(f@h!gh~)',
   originalAndRendererPitchShapeParity:true
  }));
 }else{
  assert.equal(suspect.length,0,
   'Unexpected source note spelling in '+spec.selectionId+': '+JSON.stringify(suspect));
 }
 let count=0;const phrases=[];
 for(const notation of expanded.notations){
  if(notation.constructor?.name==='DoubleBar'){
   assert.ok(count>0,'Empty source phrase rejected');
   phrases.push(count);count=0;
  }else count+=notation.notes?.length??0;
 }
 assert.equal(count,0,'Every original GABC ends at an explicit double bar');
 assert.equal(phrases.length,spec.sourceDoubleBarTokens,
  'GABC source phrase count including clef changes must be exact');
 assert.equal(phrases.reduce((a,b)=>a+b,0),y.length);
 assert.equal(gabcResearchFingerprint(header+normalized),spec.rendererFingerprint);
 const compile=()=>compileExsurgeGabcResearchMelody(header+normalized,{
  exsurge,scoreId:spec.scoreId,expectedFingerprint:spec.rendererFingerprint,
  expectedPhraseNoteCounts:phrases,phraseSequence:phrases.map((_,i)=>i)
 });
 if(spec.selectionId==='ASH_WEDNESDAY_INTROIT'){
  // The original fusion @h! is valid GABC and retained byte-for-byte.
  // The existing audio event-mapper only accepts sourceGabc beginning
  // with a pitch letter: MISSING_EXSURGE_SOURCE_NOTE is a REAL hold.
  // Deliberately do not strip '@' or silently claim a playable score.
  assert.throws(compile,e=>e?.code==='MISSING_EXSURGE_SOURCE_NOTE',
   'The known, legitimate GABC fusion must fail closed in the current player');
  console.log('M70 SOURCE AUDIO HOLD',JSON.stringify({
   selectionId:spec.selectionId,sourceGabc:'@h!',
   reason:'MISSING_EXSURGE_SOURCE_NOTE',noAutomaticRewrite:true,
   originalPitchAndShapeRetained:true
  }));
 }else{
  const compiled=compile();
  assert.ok(compiled,'Other nine sources must be compilable without adaptation');
  assert.equal(compiled.sourceNoteCount,y.length);
  assert.equal(compiled.performance.length,y.length);
  assert.equal(compiled.phraseCount,phrases.length);
 }
 assert.ok(y.length>=30,'Unexpectedly short Mass Proper source');
 const record={selectionId:spec.selectionId,scoreId:spec.scoreId,role:spec.role,
  noteheads:y.length,phraseNoteCounts:phrases,bivirgaCount:spec.bivirgaMatches};
 rows.push(record);total+=y.length;
 console.log('M70 EXSURGE SOURCE',JSON.stringify(record));
}
assert.equal(rows.length,10);
assert.equal(verifiedFusionNoteheads,1,'One and only one archival fusion source note is present');
assert.deepEqual(rows.filter(x=>x.role==='TRACT').map(x=>x.selectionId),
 ['ASH_WEDNESDAY_TRACT','LENT1_TRACT']);
assert.equal(rows.find(x=>x.selectionId==='LENT1_TRACT').phraseNoteCounts.length,13);
assert.notEqual(rows.find(x=>x.selectionId==='LENT1_OFFERTORY').scoreId,
 rows.find(x=>x.selectionId==='LENT1_COMMUNION').scoreId);
assert.ok(total>1500,'Ten complete archived Mass scores cannot collapse to a stub');
console.log('PASS M70 EXSURGE:',JSON.stringify({
 researchOnly:true,playerUnchanged:true,ashRiteAudioWithheld:true,
 ashIntroitFusionAudioHeld:true,
 sourceCount:rows.length,tractCount:2,totalDigitalNoteheads:total,rows
}));
