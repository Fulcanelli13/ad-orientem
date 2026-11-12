// Optional advanced-notation adapter for the pinned, offline Exsurge engine.
// Exsurge resolves unusual neume connections, brackets, flats/naturals and
// ornament marks; do not silently approximate them with raw letter scanning.
//
// RESEARCH ONLY. No automatic setting selection, canonical score approval,
// microphone observation, certified rhythm or publication of added melodies.
import {GABC_MELODY_POLICY,UnsupportedGabcMelodyError} from './reader-schola-gabc-melody.js';

export const EXSURGE_RESEARCH_POLICY=Object.freeze({
  approval:'PROVISIONAL_RESEARCH_ONLY',
  manuscriptTimingCertified:false,
  printedNotationCertified:false,
  exactSourceHashRequired:true,
  explicitPerformancePlanRequired:true,
  automaticAssignment:false,
  defaultAudio:false,
  renderingEngine:'VENDORED_OFFLINE_EXSURGE'
});
export function gabcResearchFingerprint(text){
  if(typeof text!=='string')throw new TypeError('GABC source must be a string');
  let h=0x811c9dc5;
  for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),0x01000193);
  return(h>>>0).toString(16).padStart(8,'0');
}
const reject=(code,detail='')=>{throw new UnsupportedGabcMelodyError(code,detail)};
// GABC pitch references in Exsurge are a conventional relative octave:
// octave 1 C = C4 (MIDI 60), octave 2 C = C5 (MIDI 72).
// This is suitable for a transposable instrumental demonstration, not for
// prescribing a historical absolute frequency or a chant choir's pitch.
function noteMidi(note){
  const step=note?.pitch?.step,octave=note?.pitch?.octave;
  if(!Number.isInteger(step)||step<0||step>11||
    !Number.isInteger(octave)||octave<0||octave>5)
    reject('INVALID_EXSURGE_PITCH');
  return 12*(octave+4)+step;
}
export function compileExsurgeGabcResearchMelody(gabc,{
  exsurge,
  scoreId,
  expectedFingerprint,
  expectedPhraseNoteCounts,
  phraseSequence
}={}){
  if(typeof gabc!=='string'||!gabc.includes('%%')||gabc.length>200000)
    reject('INVALID_GABC_SOURCE');
  if(typeof scoreId!=='string'||!/^GREGOBASE-\d{1,8}$/.test(scoreId))
    reject('EXPLICIT_SOURCE_ID_REQUIRED');
  if(typeof expectedFingerprint!=='string'||
    !/^[0-9a-f]{8}$/.test(expectedFingerprint)||
    gabcResearchFingerprint(gabc)!==expectedFingerprint)
    reject('SOURCE_FINGERPRINT_MISMATCH');
  if(!Array.isArray(expectedPhraseNoteCounts)||
    !expectedPhraseNoteCounts.length||expectedPhraseNoteCounts.length>100||
    expectedPhraseNoteCounts.some(n=>!Number.isInteger(n)||n<1||n>10000))
    reject('EXPLICIT_SOURCE_PHRASE_COUNTS_REQUIRED');
  if(!Array.isArray(phraseSequence)||!phraseSequence.length||
    phraseSequence.length>128||phraseSequence.some(n=>!Number.isInteger(n)||
      n<0||n>=expectedPhraseNoteCounts.length))
    reject('EXPLICIT_PERFORMANCE_PLAN_REQUIRED');
  if(typeof exsurge?.Gabc?.createMappingsFromSource!=='function'||
    typeof exsurge.ChantScore!=='function'||
    typeof exsurge.ChantContext!=='function'||
    typeof exsurge.Note!=='function')
    reject('PINNED_EXSURGE_API_REQUIRED');

  let score;
  try{
    const context=new exsurge.ChantContext();
    const mappings=exsurge.Gabc.createMappingsFromSource(context,gabc);
    score=new exsurge.ChantScore(context,mappings,true);
    score.performLayout(context);
  }catch(error){
    reject('EXSURGE_PARSE_FAILED',String(error?.message??error).slice(0,160));
  }
  if(!Array.isArray(score?.notations)||!Array.isArray(score?.notes))
    reject('MALFORMED_EXSURGE_SCORE');
  const sourceNotes=[],groups=[],phrases=[];
  let phraseGroups=[],lastSourceIndex=-1;
  for(const notation of score.notations){
    if(notation?.constructor?.name==='DoubleBar'){
      if(!phraseGroups.length)reject('EMPTY_EXSURGE_PHRASE');
      phrases.push(Object.freeze(phraseGroups));
      phraseGroups=[];
      continue;
    }
    const rawNotes=notation?.notes;
    if(!Array.isArray(rawNotes)||rawNotes.length===0)continue;
    const verseIndex=phrases.length;
    const groupIndex=groups.length;
    const derived=[];
    for(const rawNote of rawNotes){
      if(!(rawNote instanceof exsurge.Note))
        reject('UNKNOWN_EXSURGE_NOTATION');
      const sourceIndex=rawNote.sourceIndex;
      if(!Number.isInteger(sourceIndex)||sourceIndex<=lastSourceIndex)
        reject('NONMONOTONIC_SOURCE_NOTE_INDEX');
      lastSourceIndex=sourceIndex;
      const sourceGabc=rawNote.sourceGabc;
      const letter=/^[a-mA-M]/.exec(sourceGabc??'')?.[0];
      if(!letter)reject('MISSING_EXSURGE_SOURCE_NOTE');
      const moraDots=rawNote.morae?.length??0;
      const episemata=rawNote.episemata?.length??0;
      if(!Number.isInteger(moraDots)||moraDots<0||moraDots>2||
        !Number.isInteger(episemata)||episemata<0||episemata>4)
        reject('UNSUPPORTED_RENDERED_RHYTHMIC_SIGNS');
      const ordinal=sourceNotes.length+1;
      const item=Object.freeze({
        sourceNoteOrdinal:ordinal,sourceNoteId:'gabc-note-'+ordinal,
        groupIndex,verseIndex,engravedNeumeIndex:groupIndex,
        notationType:notation.constructor?.name??'Unknown',
        sourceGabc,sourcePitchLetter:letter,
        sourceIndex,staffPosition:rawNote.staffPosition,
        midi:noteMidi(rawNote),
        moraDots,mora:moraDots>0,
        horizontalEpisema:episemata>0,episema:episemata>0,
        virga:rawNote.shape===exsurge.NoteShape?.Virga,
        inclined:rawNote.shape===exsurge.NoteShape?.Inclinatum,
        shape:rawNote.shape,
        // This is a precise notehead event. The parent neume need not
        // coincide with a GABC lyric-syllable group in complex scores.
        syllable:null
      });
      sourceNotes.push(item);derived.push(item);
    }
    const group=Object.freeze({
      groupIndex,verseIndex,notationType:notation.constructor?.name??'Unknown',
      notes:Object.freeze(derived)
    });
    groups.push(group);phraseGroups.push(group);
    if(sourceNotes.length>20000)reject('SCORE_TOO_LARGE');
  }
  if(phraseGroups.length)reject('UNCLOSED_EXSURGE_PHRASE');
  if(phrases.length!==expectedPhraseNoteCounts.length)
    reject('EXSURGE_PHRASE_COUNT_MISMATCH');
  const actualCounts=phrases.map(p=>p.reduce((n,g)=>n+g.notes.length,0));
  if(actualCounts.some((n,i)=>n!==expectedPhraseNoteCounts[i]))
    reject('EXSURGE_PHRASE_NOTES_MISMATCH');
  const allRendered=score.notes.filter(note=>note instanceof exsurge.Note);
  if(allRendered.length!==sourceNotes.length||
    allRendered.some((n,i)=>n.sourceIndex!==sourceNotes[i].sourceIndex))
    reject('EXSURGE_RENDERED_NOTE_ORDER_MISMATCH');

  const performance=[];
  for(let invocation=0;invocation<phraseSequence.length;invocation++){
    const phrase=phrases[phraseSequence[invocation]];
    for(let groupIndex=0;groupIndex<phrase.length;groupIndex++){
      const group=phrase[groupIndex];
      for(let ni=0;ni<group.notes.length;ni++){
        const note=group.notes[ni];
        performance.push(Object.freeze({
          ...note,invocation:invocation+1,performanceIndex:performance.length,
          phraseEnd:groupIndex===phrase.length-1&&ni===group.notes.length-1
        }));
      }
    }
  }
  if(performance.length>40000)reject('PERFORMANCE_TOO_LARGE');
  return Object.freeze({
    scoreId,
    sourceFingerprint:expectedFingerprint,
    sourceNoteCount:sourceNotes.length,
    sourceGroupCount:groups.length,
    phraseCount:phrases.length,
    invocations:phraseSequence.length,
    phraseSequence:Object.freeze([...phraseSequence]),
    sourceNotes:Object.freeze(sourceNotes),
    phrases:Object.freeze(phrases),
    groups:Object.freeze(groups),
    performance:Object.freeze(performance),
    policy:GABC_MELODY_POLICY,
    advancedNotation:EXSURGE_RESEARCH_POLICY
  });
}
