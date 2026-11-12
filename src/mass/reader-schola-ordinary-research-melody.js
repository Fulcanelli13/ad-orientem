// M54 — one source-locked, zero-cost procedural-melody preparation path
// for the four non-Kyrie Ordinary movement families. This module does not
// create audio, UI, an approved score, a Schola event or a liturgical cue.
import {offlineKyrialeResearchScore} from './reader-kyriale-research-gabc.js';
import {
  compileExsurgeGabcResearchMelody,gabcResearchFingerprint
} from './reader-schola-exsurge-gabc-melody.js';
import {scheduleGabcMelody} from './reader-schola-gabc-melody.js';

const freeze=Object.freeze;
const SUNG=new Set(['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN']);
export const ORDINARY_M54_RESEARCH_SOURCES=freeze([
  freeze({movement:'GLORIA',settingId:'MASS_08',scoreId:'GREGOBASE-961',
    title:'Gloria VIII',sourceFingerprint:'a5986d2a',gabcSegments:18,
    sourceFolio:'Graduale Romanum (1961) p. 29*'}),
  freeze({movement:'CREDO',settingId:'CREDO_03',scoreId:'GREGOBASE-749',
    title:'Credo III',sourceFingerprint:'78ccb2e5',gabcSegments:19,
    sourceFolio:'Graduale Romanum (1961) p. 64*'}),
  freeze({movement:'SANCTUS_BENEDICTUS',settingId:'MASS_08',scoreId:'GREGOBASE-1384',
    title:'Sanctus VIII · Benedictus',sourceFingerprint:'653ac9f9',gabcSegments:1,
    sourceFolio:'Graduale Romanum (1961) p. 30*'}),
  freeze({movement:'AGNUS_DEI',settingId:'MASS_08',scoreId:'GREGOBASE-2760',
    title:'Agnus Dei VIII',sourceFingerprint:'9aef08a5',gabcSegments:3,
    sourceFolio:'Graduale Romanum (1961) p. 31*'})
]);
const bySelection=new Map(ORDINARY_M54_RESEARCH_SOURCES.map(
  spec=>[spec.movement+':'+spec.settingId,spec]));
export const ORDINARY_M54_POLICY=freeze({
  status:'PROVISIONAL_RESEARCH_ONLY',
  availableInLivePlayer:false,
  originalPrintedNoteheadsCertified:false,
  independentGregorianRhythmCertified:false,
  automaticAssignment:false,
  sourcePreserving:true,
  requiredUserChoice:true,
  scoreApprovalGranted:false,
  noRemoteAudio:true,
  sameEngraverAsKyrie:true,
  allSectionRepetitions:'SOURCE_WRITTEN_ORDER_ONLY',
  distinctSanctusAndBenedictusCards:false
});
export function eligibleOrdinaryM54ResearchSource({
  form,mode='LIVE',isRequiem=false,movement,settingId
}={}){
  return String(mode).toUpperCase()==='LIVE'&&
    SUNG.has(String(form).toUpperCase())&&!isRequiem&&
    bySelection.has(String(movement)+':'+String(settingId));
}
function printedSectionNoteCounts(gabc,exsurge){
  if(typeof exsurge?.Gabc?.createMappingsFromSource!=='function'||
     typeof exsurge?.ChantScore!=='function'||
     typeof exsurge?.ChantContext!=='function'||
     typeof exsurge?.Note!=='function')return null;
  const context=new exsurge.ChantContext();
  const score=new exsurge.ChantScore(context,
    exsurge.Gabc.createMappingsFromSource(context,gabc),true);
  score.performLayout(context);
  const counts=[];let current=0;
  for(const notation of score.notations??[]){
    if(notation?.constructor?.name==='DoubleBar'){
      if(!current)return null;
      counts.push(current);current=0;continue;
    }
    if(Array.isArray(notation?.notes)){
      for(const note of notation.notes){
        if(!(note instanceof exsurge.Note))return null;
        current++;
      }
    }
  }
  // Never imply a trailing unterminated phrase has a valid musical cadence.
  if(current!==0)return null;
  return counts;
}
export function compileOrdinaryM54ResearchMelody({
  movement,settingId,exsurge,source=null
}={}){
  const spec=bySelection.get(String(movement)+':'+String(settingId));
  if(!spec)return null;
  const selected=source??offlineKyrialeResearchScore(movement,settingId);
  if(selected?.scoreApproved!==false||
     selected?.scoreId!==spec.scoreId||
     typeof selected?.gabc!=='string'||
     gabcResearchFingerprint(selected.gabc)!==spec.sourceFingerprint)
    return null;
  try{
    const counts=printedSectionNoteCounts(selected.gabc,exsurge);
    if(!Array.isArray(counts)||counts.length!==spec.gabcSegments||
       counts.some(n=>!Number.isInteger(n)||n<=0))return null;
    // A Gloria/Credo section delimiter is NOT a Kyrie repeat instruction.
    // We explicitly perform each source-written section exactly once.
    const phraseSequence=counts.map((_,i)=>i);
    const melody=compileExsurgeGabcResearchMelody(selected.gabc,{
      exsurge,scoreId:spec.scoreId,expectedFingerprint:spec.sourceFingerprint,
      expectedPhraseNoteCounts:counts,phraseSequence
    });
    if(melody.phraseCount!==spec.gabcSegments||
       melody.sourceNoteCount!==counts.reduce((a,b)=>a+b,0)||
       melody.performance.length!==melody.sourceNoteCount)
      return null;
    const timing=scheduleGabcMelody(melody);
    if(timing.events.length!==melody.sourceNoteCount||
       timing.certifiedGregorianTiming!==false)return null;
    return freeze({
      source:spec,movement:spec.movement,settingId:spec.settingId,
      melody,timing,sourceNotes:melody.sourceNoteCount,
      sourceSections:freeze([...counts]),playedNotes:melody.performance.length,
      certified:false,approved:false,
      explicitlySelectedResearchOnly:true
    });
  }catch{return null;} // Unparseable notation or source mutation fails closed.
}
