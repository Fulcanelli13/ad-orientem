// M54: source-locked non-Kyrie Ordinary GABC proof of reusable Exsurge melody.
// Compiler parity is NOT independent 1961 folio verification or audio approval.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {offlineKyrialeResearchScore} from '../src/mass/reader-kyriale-research-gabc.js';
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint} from '../src/mass/reader-schola-exsurge-gabc-melody.js';
import {compileOrdinaryM54ResearchMelody,eligibleOrdinaryM54ResearchSource,
  ORDINARY_M54_RESEARCH_SOURCES,ORDINARY_M54_POLICY} from
  '../src/mass/reader-schola-ordinary-research-melody.js';

const bundle=readFileSync(new URL(
  '../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:10000,filename:'pinned-exsurge.min.js'});
const exsurge=sandbox.exsurge;
assert.equal(ORDINARY_M54_RESEARCH_SOURCES.length,14);
assert.equal(ORDINARY_M54_POLICY.availableInLivePlayer,true);
assert.equal(ORDINARY_M54_POLICY.originalPrintedNoteheadsCertified,false);
assert.equal(ORDINARY_M54_POLICY.independentGregorianRhythmCertified,false);
assert.equal(ORDINARY_M54_POLICY.automaticAssignment,false);
const movements=['GLORIA','CREDO','SANCTUS_BENEDICTUS','AGNUS_DEI'];
assert.deepEqual([...new Set(ORDINARY_M54_RESEARCH_SOURCES.map(x=>x.movement))],movements);
const sourceKeys=ORDINARY_M54_RESEARCH_SOURCES.map(x=>x.movement+':'+x.settingId);
assert.equal(new Set(sourceKeys).size,14,'Every source-bound movement+setting must be unique');
const results=[];
for(const spec of ORDINARY_M54_RESEARCH_SOURCES){
 const source=offlineKyrialeResearchScore(spec.movement,spec.settingId);
 assert.ok(source);
 assert.equal(source.scoreApproved,false);
 assert.equal(source.scoreId,spec.scoreId);
 const output=compileOrdinaryM54ResearchMelody({
   movement:spec.movement,settingId:spec.settingId,exsurge
 });
 if(!output){
   const diagnostic={
     movement:spec.movement,settingId:spec.settingId,scoreId:spec.scoreId,
     actualFingerprint:gabcResearchFingerprint(source.gabc),
     expectedFingerprint:spec.sourceFingerprint,
     sourceApproved:source.scoreApproved,
     expectedGabcSegments:spec.gabcSegments
   };
   try{
     const context=new exsurge.ChantContext();
     const score=new exsurge.ChantScore(context,
       exsurge.Gabc.createMappingsFromSource(context,source.gabc),true);
     score.performLayout(context);
     let current=0;const counts=[];
     for(const notation of score.notations){
       if(notation.constructor?.name==='DoubleBar'){
         counts.push(current);current=0;
       }else current+=(notation.notes?.length??0);
     }
     diagnostic.renderedCounts=counts;
     diagnostic.trailingNotes=current;
     diagnostic.totalRendered=score.notes.length;
     try{
       const result=compileExsurgeGabcResearchMelody(source.gabc,{
         exsurge,scoreId:spec.scoreId,
         expectedFingerprint:spec.sourceFingerprint,
         expectedPhraseNoteCounts:counts,
         phraseSequence:counts.map((_,i)=>i)
       });
       diagnostic.directCompiler={
         notes:result.sourceNoteCount,
         phrases:result.phraseCount,
         performance:result.performance.length
       };
     }catch(error){diagnostic.directCompilerError=String(error?.message??error)}
   }catch(error){diagnostic.parseError=String(error?.message??error)}
   console.error('M56_SOURCE_REVIEW_HOLD',JSON.stringify(diagnostic));
 }
 assert.ok(output,'M56 compiler rejected '+spec.movement+':'+spec.settingId+' '+spec.scoreId);
 assert.equal(output.sourceNotes,output.playedNotes,
   'Non-Kyrie movement must not inherit 3+3+2+1 Kyrie repetitions');
 assert.equal(output.melody.phraseCount,spec.gabcSegments);
 assert.equal(output.melody.invocations,spec.gabcSegments);
 assert.equal(output.sourceSections.length,spec.gabcSegments);
 assert.equal(output.sourceSections.reduce((sum,n)=>sum+n,0),output.sourceNotes);
 assert.equal(output.melody.performance.at(-1).sourceNoteOrdinal,output.sourceNotes);
 assert.equal(output.timing.certifiedGregorianTiming,false);
 assert.equal(output.certified,false);
 assert.equal(output.approved,false);
 assert.equal(output.explicitlySelectedResearchOnly,true);
 assert.ok(output.melody.performance.every((note,i)=>note.performanceIndex===i));
 for(const form of ['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN']){
   assert.equal(eligibleOrdinaryM54ResearchSource({
     form,movement:spec.movement,settingId:spec.settingId
   }),true);
 }
 for(const forbidden of [
   {form:'LOW'},{form:'SOLEMN',mode:'MISSAL'},
   {form:'SOLEMN',isRequiem:true}
 ]){
   assert.equal(eligibleOrdinaryM54ResearchSource({
     movement:spec.movement,settingId:spec.settingId,...forbidden
   }),false);
 }
 const replaced={...source,gabc:source.gabc+' '};
 assert.equal(compileOrdinaryM54ResearchMelody({
   movement:spec.movement,settingId:spec.settingId,exsurge,source:replaced
 }),null,'The source fingerprint must reject even one appended byte');
 assert.equal(compileOrdinaryM54ResearchMelody({
   movement:spec.movement,settingId:spec.settingId,exsurge,
   source:{...source,scoreApproved:true}
 }),null);
 assert.equal(compileOrdinaryM54ResearchMelody({
   movement:spec.movement,settingId:spec.settingId,exsurge,
   source:{...source,scoreId:'GREGOBASE-999999'}
 }),null);
 results.push({
   movement:spec.movement,settingId:spec.settingId,scoreId:spec.scoreId,
   sourceSections:spec.gabcSegments,sourceNotes:output.sourceNotes,
   playedNotes:output.playedNotes
 });
}
assert.equal(compileOrdinaryM54ResearchMelody({
 movement:'GLORIA',settingId:'MASS_18',exsurge
}),null,'Cannot guess omitted seasonal Gloria');
assert.equal(compileOrdinaryM54ResearchMelody({
 movement:'KYRIE',settingId:'MASS_08',exsurge
}),null,'Kyrie must retain its existing separate ninefold engine');
assert.equal(compileOrdinaryM54ResearchMelody({
 movement:'GLORIA',settingId:'MASS_08',exsurge:null
}),null);
console.log('M54_ORDINARY_RESEARCH',JSON.stringify(results));
console.log('PASS M56: fourteen source-pinned non-Kyrie GABC melodies; original timing and score approval remain withheld');
