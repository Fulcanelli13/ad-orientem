// Conservative GABC-to-melody research compiler. No singing, paid assets,
// score approval, inferred chant assignment, or authoritative rhythm.
// Fail closed for notation not explicitly supported by this melodic subset.
const NOTE=/^[a-mA-M]$/;
const CLEF=/^([cf])([1-4])$/;
const BAR=/^(?:::|:|;|,|\x60|z0?|)$/;
const PCS=[0,2,4,5,7,9,11];
export const GABC_MELODY_POLICY=Object.freeze({
  approval:'PROVISIONAL_RESEARCH_ONLY',
  rhythm:'ILLUSTRATIVE_EQUAL_NOTE_WITH_SIGN_WEIGHTS',
  timingCertified:false,absolutePitchCertified:false,
  automaticRepetitions:false,canonicalScholaScoreApproved:false
});
export class UnsupportedGabcMelodyError extends Error{
  constructor(code,detail=''){super(code+(detail?': '+detail:''));this.name='UnsupportedGabcMelodyError';this.code=code}
}
const mod=(n,m)=>((n%m)+m)%m;
const midiFromDiatonic=(degree,octave)=>12*(octave+Math.floor(degree/7)+1)+PCS[mod(degree,7)];
// GABC d/f/h/j are bottom-to-top staff lines (not note names).
// Reference octave only: c4 j=C5; f3 h=F4.
export function resolveGabcStaffPitch(letter,clef){
  if(!NOTE.test(letter??'')||!CLEF.test(clef??''))throw new UnsupportedGabcMelodyError('INVALID_CLEF_OR_PITCH');
  const [,kind,line]=CLEF.exec(clef);
  const position=letter.toLowerCase().charCodeAt(0)-97;
  const steps=position-(2*Number(line)+1);
  const midi=kind==='c'?midiFromDiatonic(steps,5):midiFromDiatonic(steps+3,4);
  const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  return Object.freeze({midi,clef,staffPosition:position-2,
    pitchName:names[mod(midi,12)]+(Math.floor(midi/12)-1)});
}
function parseNotes(raw,state,syllable,groupIndex,verseIndex,nextOrdinal){
  const notes=[];
  let i=0;
  while(i<raw.length){
    const ch=raw[i];
    if(/\s/.test(ch)||ch==='!'||ch==='/'){i++;continue;}
    if(!NOTE.test(ch))throw new UnsupportedGabcMelodyError('UNSUPPORTED_NOTATION',raw+' at '+i);
    const letter=ch.toLowerCase();
    // In GABC ix/iy mark a flat/natural on i; they do not sound i.
    if(raw[i+1]==='x'||raw[i+1]==='y'){
      state.alterations.set(letter,raw[i+1]==='x'?-1:0);i+=2;continue;
    }
    i++;
    let moraDots=0,horizontalEpisema=false,verticalEpisema=false;
    let virga=false,quilisma=false,liquescent=false;
    while(i<raw.length){
      const c=raw[i];
      if(c==='.'){moraDots++;i++;continue;}
      if(c==='_'){horizontalEpisema=true;i++;if(/[0-3]/.test(raw[i]??''))i++;continue;}
      if(c==="'"){verticalEpisema=true;i++;if(/[01]/.test(raw[i]??''))i++;continue;}
      if(c==='v'||c==='V'){virga=true;i++;continue;}
      if(c==='w'||c==='W'){quilisma=true;i++;continue;}
      if(c==='~'||c==='<'||c==='>'){liquescent=true;i++;continue;}
      break;
    }
    if(moraDots>2)throw new UnsupportedGabcMelodyError('UNSUPPORTED_MORA_COUNT',raw);
    const pitch=resolveGabcStaffPitch(letter,state.clef);
    const accidental=state.alterations.get(letter)??0;
    notes.push(Object.freeze({
      sourceNoteOrdinal:nextOrdinal+notes.length+1,
      sourceNoteId:'gabc-note-'+(nextOrdinal+notes.length+1),
      groupIndex,verseIndex,syllable,sourcePitchLetter:ch,
      clef:state.clef,staffPosition:pitch.staffPosition,
      midi:pitch.midi+accidental,alterationSemitones:accidental,
      inclined:ch!==letter,virga,quilisma,liquescent,
      moraDots,mora:moraDots>0,horizontalEpisema,verticalEpisema,
      episema:horizontalEpisema
    }));
  }
  if(!notes.length)throw new UnsupportedGabcMelodyError('NO_NOTES_IN_GROUP',raw);
  return Object.freeze(notes);
}
export function compileGabcMelody(gabc,{phraseSequence}={}){
  if(typeof gabc!=='string'||gabc.split('%%').length!==2)
    throw new UnsupportedGabcMelodyError('NO_UNAMBIGUOUS_BODY');
  if(!Array.isArray(phraseSequence)||!phraseSequence.length||
    phraseSequence.length>128||!phraseSequence.every(Number.isInteger))
    throw new UnsupportedGabcMelodyError('EXPLICIT_PERFORMANCE_PLAN_REQUIRED');
  const body=gabc.split('%%')[1];
  const state={clef:null,alterations:new Map()};
  const phrases=[],groups=[],sourceNotes=[];
  let currentPhrase=[],lastEnd=0,closed=false;
  for(const match of body.matchAll(/([^()]*)\(([^()]*)\)/g)){
    const raw=match[2].trim();
    if(/[()]/.test(body.slice(lastEnd,match.index)))
      throw new UnsupportedGabcMelodyError('MALFORMED_BRACKETS');
    lastEnd=match.index+match[0].length;
    if(CLEF.test(raw)){state.clef=raw;state.alterations.clear();continue;}
    if(BAR.test(raw)){
      if(raw==='::'){
        if(!currentPhrase.length)throw new UnsupportedGabcMelodyError('EMPTY_PHRASE');
        phrases.push(Object.freeze(currentPhrase));currentPhrase=[];
        state.alterations.clear();closed=true;
      }else if(raw===':'||raw===';'||raw===',')state.alterations.clear();
      continue;
    }
    if(!state.clef)throw new UnsupportedGabcMelodyError('MISSING_CLEF');
    const text=match[1].replace(/<[^>]*>/g,'').replace(/[*{}]/g,'').trim();
    if(!/[\p{L}]/u.test(text))
      throw new UnsupportedGabcMelodyError('NOTE_WITHOUT_SYLLABLE',raw);
    const notes=parseNotes(raw,state,text,groups.length,phrases.length,sourceNotes.length);
    const group=Object.freeze({
      groupIndex:groups.length,verseIndex:phrases.length,
      syllable:text,gabcNotes:raw,notes
    });
    sourceNotes.push(...notes);groups.push(group);currentPhrase.push(group);
    closed=false;
    if(sourceNotes.length>20000)throw new UnsupportedGabcMelodyError('SCORE_TOO_LARGE');
  }
  if(/[()]/.test(body.slice(lastEnd)))
    throw new UnsupportedGabcMelodyError('MALFORMED_BRACKETS');
  if(currentPhrase.length||!closed||!phrases.length)
    throw new UnsupportedGabcMelodyError('UNCLOSED_PHRASE');
  if(phraseSequence.some(i=>i<0||i>=phrases.length))
    throw new UnsupportedGabcMelodyError('UNKNOWN_PERFORMANCE_PHRASE');
  const performance=[];
  for(let index=0;index<phraseSequence.length;index++){
    const verseIndex=phraseSequence[index],phrase=phrases[verseIndex];
    for(let gi=0;gi<phrase.length;gi++){
      const group=phrase[gi];
      for(let ni=0;ni<group.notes.length;ni++)
        performance.push(Object.freeze({
          ...group.notes[ni],invocation:index+1,performanceIndex:performance.length,
          phraseEnd:gi===phrase.length-1&&ni===group.notes.length-1
        }));
    }
  }
  if(performance.length>40000)throw new UnsupportedGabcMelodyError('PERFORMANCE_TOO_LARGE');
  return Object.freeze({
    sourceNoteCount:sourceNotes.length,sourceGroupCount:groups.length,
    phraseCount:phrases.length,invocations:phraseSequence.length,
    phraseSequence:Object.freeze([...phraseSequence]),
    phrases:Object.freeze(phrases),groups:Object.freeze(groups),
    sourceNotes:Object.freeze(sourceNotes),
    performance:Object.freeze(performance),policy:GABC_MELODY_POLICY
  });
}
export function scheduleGabcMelody(compiled,profile={}){
  if(!compiled?.performance?.length||compiled.policy!==GABC_MELODY_POLICY)
    throw new UnsupportedGabcMelodyError('UNCOMPILED_MELODY');
  const params={unitMs:300,episemaFactor:4/3,moraFactor:53/30,
    doubleMoraFactor:2.2,phraseGapMs:280,...profile};
  if(!Object.values(params).every(v=>Number.isFinite(v)&&v>=0)||
     params.unitMs<50||params.unitMs>2000||params.phraseGapMs>10000||
     params.episemaFactor<1||params.moraFactor<1||
     params.doubleMoraFactor<params.moraFactor)
    throw new UnsupportedGabcMelodyError('INVALID_ILLUSTRATIVE_TIMING');
  let offsetMs=0;
  const events=compiled.performance.map((note,index)=>{
    const factor=Math.max(1,note.horizontalEpisema?params.episemaFactor:1,
      note.moraDots===2?params.doubleMoraFactor:
      note.moraDots===1?params.moraFactor:1);
    const durationMs=Math.round(params.unitMs*factor);
    const gapAfterMs=note.phraseEnd&&index<compiled.performance.length-1
      ?params.phraseGapMs:0;
    const e=Object.freeze({...note,startMs:offsetMs,durationMs,gapAfterMs});
    offsetMs+=durationMs+gapAfterMs;return e;
  });
  return Object.freeze({events:Object.freeze(events),durationMs:offsetMs,
    model:'ILLUSTRATIVE_EQUAL_NOTE_RELATIVE_WEIGHTS',
    certifiedGregorianTiming:false,independentlyCalibratedAgainstPerformance:false,
    profile:Object.freeze({...params})});
}
