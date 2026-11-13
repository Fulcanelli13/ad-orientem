// M57 research: diagnose the two GABC bivirgae in Sanctus XVII against
// pinned vendored Exsurge. This is not a public preview / source edit.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {offlineKyrialeResearchScore} from '../src/mass/reader-kyriale-research-gabc.js';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint} from '../src/mass/reader-schola-exsurge-gabc-melody.js';
const s=offlineKyrialeResearchScore('SANCTUS_BENEDICTUS','MASS_17');
assert.equal(s?.scoreId,'GREGOBASE-871');
assert.equal(gabcResearchFingerprint(s.gabc),'e73e09be');
const bundle=readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:10000});
const exsurge=sandbox.exsurge;
function inspect(gabc,label){
 const context=new exsurge.ChantContext();
 const score=new exsurge.ChantScore(context,exsurge.Gabc.createMappingsFromSource(context,gabc),true);
 score.performLayout(context);
 const source=score.notations.flatMap(n=>n.notes??[]);
 const counts=[];let subtotal=0;
 for(const notation of score.notations){
  if(notation.constructor?.name==='DoubleBar'){counts.push(subtotal);subtotal=0;}
  else subtotal+=notation.notes?.length??0;
 }
 const missing=source.filter(n=>!/^[a-mA-M]/.test(n.sourceGabc??''));
 const multi=source.filter(n=>typeof n.sourceGabc!=='string');
 const rendered=score.notes.filter(n=>n instanceof exsurge.Note);
 const vPositions=source.filter(n=>n.sourceIndex>=310&&n.sourceIndex<=360||
      n.sourceIndex>=510&&n.sourceIndex<=550).map(n=>({
        text:n.sourceGabc,index:n.sourceIndex,position:n.staffPosition,
        pitch:n.pitch?.step,octave:n.pitch?.octave,shape:n.shape
      }));
 let compiled=null,error=null;
 try{
  const ret=compileExsurgeGabcResearchMelody(gabc,{exsurge,scoreId:s.scoreId,
   expectedFingerprint:gabcResearchFingerprint(gabc),
   expectedPhraseNoteCounts:counts,phraseSequence:counts.map((_,i)=>i)});
  compiled={notes:ret.sourceNoteCount,renderedNotes:ret.sourceNotes.length,phrases:ret.phraseCount}
 }catch(e){error=e.code??e.message}
 console.log('M57_BIVIRGA_PROBE',JSON.stringify({label,gabcFingerprint:gabcResearchFingerprint(gabc),
 counts,sourceCount:source.length,renderedCount:rendered.length,
 nonSourcePitch:missing.map(n=>({sourceGabc:n.sourceGabc,index:n.sourceIndex})),nonString:multi.length,
 vPositions:vPositions.slice(0,50),compiled,error,tail:subtotal}));
}
assert.equal((s.gabc.match(/gxfg!hvvGE/g)||[]).length,2);
inspect(s.gabc,'ARCHIVED');
inspect(s.gabc.replaceAll('gxfg!hvvGE','gxfg!hv/hvGE'),'BIVIRGA_EXPLICIT_VIRGA_SLASH');
inspect(s.gabc.replaceAll('gxfg!hvvGE','gxfg!hv!hvGE'),'BIVIRGA_EXPLICIT_VIRGA_ZERO');
inspect(s.gabc.replaceAll('gxfg!hvvGE','gxfg!hhGE'),'BIVIRGA_TWO_PITCHES_SIMPLE');
