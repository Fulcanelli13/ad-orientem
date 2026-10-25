import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolvePriestChantAction,resolvePriestChantVoice,validatePriestChantObservation,
  PRIEST_SANCTUS_OBSERVATION_TYPES} from "../src/mass/reader-priest-chant-owner.js";

const load=p=>JSON.parse(readFileSync(new URL("../data/"+p,import.meta.url),"utf8"));
const matrix=load("mass/gesture-matrix.v1.json");
const sung=load("presentation/reader-text-sung.v1.json");
const corpusById=new Map(sung.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,u])));
const forms=["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
// Ritus servandus IV.3 and VI.3: priest's quiet continuation does NOT
// advance with the choir, even if the same words occupy source paragraphs.
// Keep the priest's audible Gloria/Credo intonation endings (0054/0090)
// untouched for the separate source-verified intonation adjudication.
const laterChoirCues=[
 ...Array.from({length:15},(_,i)=>"AO.SM.C"+String(55+i).padStart(4,"0")),
 ...Array.from({length:15},(_,i)=>"AO.SM.C"+String(91+i).padStart(4,"0")),
];
assert.equal(new Set(laterChoirCues).size,30);
// The 1962 source concordance is not itself executable timing or user art.
const witness=load("mass/icksp-1962-gloria-credo-priest-schola-b02.v1.json");
assert.equal(witness.schema,"ao-icksp-1962-gloria-credo-priest-schola-concordance-b02-v1");
assert.equal(witness.rubrics.length,12);
assert.equal(witness.counts.alreadyInGestureMatrix,10);
assert.equal(witness.counts.pendingSourceGestureRecord,2);
assert.deepEqual(witness.rubrics.filter(r=>!r.gestureMatrixId).map(r=>r.cueId),
 ["AO.SM.C0054","AO.SM.C0056"],"B02 contains unreviewed/extraneous gesture gaps");
for(const rec of witness.rubrics){
 assert.equal(corpusById.get(rec.cueId)?.clock,"SCHOLA_PUBLIC",
   rec.cueId+" donor/source clock changed without adjudication");
 const rows=matrix.items.filter(x=>x.cueId===rec.cueId&&x.actor==="PRIEST");
 assert.equal(rec.gestureMatrixId,rows[0]?.id??null);
 assert.equal(rec.runtimePromotion,"NOT_IN_THIS_BATCH",
   "Research witness may not create automatic priest gesture clocks");
}
assert.deepEqual(Object.keys(witness.guardContract.publicScholaContinuations),
 ["gloria","credo"]);
for(const cue of laterChoirCues)
 assert.equal(corpusById.get(cue)?.clock,"SCHOLA_PUBLIC",cue+": unexpected donor clock");
assert.equal(corpusById.get("AO.SM.C0054")?.clock,"SCHOLA_PUBLIC");
assert.equal(corpusById.get("AO.SM.C0090")?.clock,"SCHOLA_PUBLIC");
assert.deepEqual(PRIEST_SANCTUS_OBSERVATION_TYPES,
 ["PRIEST_SANCTUS_RECITATION","PRIEST_BENEDICTUS_RECITATION"]);
for(const form of forms){
  for(const cue of laterChoirCues){
    const original={label:"UNOBSERVED PRIEST GESTURE",cueId:cue};
    const result=resolvePriestChantAction({form,cueId:cue,
      sourceClock:"SCHOLA_PUBLIC",gestureMatrix:matrix,ordinaryAction:original});
    assert.equal(result.priestAction,null,
      form+" "+cue+": Schola phrase forged a contemporaneous priest action");
    assert.equal(result.owner,"PRIEST_EVENT_UNOBSERVED");
    const voice=resolvePriestChantVoice({form,cueId:cue,
      sourceClock:"SCHOLA_PUBLIC",ordinaryVoice:{label:"PRIVATE PRIEST RECITATION"}});
    assert.equal(voice.priestVoice,null,
      form+" "+cue+": choir reading inferred private priest voice");
    assert.equal(voice.owner,"PRIEST_VOICE_UNOBSERVED_FAIL_CLOSED");
    // Forged unrelated event types must not unlock a priest action here.
    assert.equal(resolvePriestChantAction({form,cueId:cue,sourceClock:"SCHOLA_PUBLIC",
      gestureMatrix:matrix,observation:{actor:"PRIEST",observed:true,
        source:"EXPLICIT_OBSERVATION",eventType:"PRIEST_SANCTUS_RECITATION",
        atCueId:cue}}).priestAction,null);
    assert.equal(validatePriestChantObservation({actor:"PRIEST",observed:true,
      source:"EXPLICIT_OBSERVATION",eventType:"PRIEST_SANCTUS_RECITATION"},
      cue,form),false);
  }
  // The priest intones THROUGH Deo and in unum Deum. Those two ending
  // cues cannot be suppressed by the later-choir-only guard.
  for(const cue of ["AO.SM.C0054","AO.SM.C0090"]){
    const priestIntonation={label:"PRIEST INTONATION END",cueId:cue};
    assert.equal(resolvePriestChantAction({form,cueId:cue,
      sourceClock:"SCHOLA_PUBLIC",ordinaryAction:priestIntonation}).priestAction,
      priestIntonation);
    const voice={label:"PRIEST INTONES"};
    assert.equal(resolvePriestChantVoice({form,cueId:cue,sourceClock:"SCHOLA_PUBLIC",
      ordinaryVoice:voice}).priestVoice,voice);
  }
  for(const id of ["AO.SM.C0145","AO.SM.C0148"]){
    assert.equal(corpusById.get(id).clock,"SCHOLA_PUBLIC");
    const rogue={label:"SHOULD NOT BE DISPLAYED"};
    const closed=resolvePriestChantAction({
      form,cueId:id,sourceClock:"SCHOLA_PUBLIC",
      gestureMatrix:matrix,ordinaryAction:rogue});
    assert.equal(closed.priestAction,null);
    assert.equal(closed.owner,"PRIEST_EVENT_UNOBSERVED");
    assert.equal(closed.reason,"SCHOLA_PUBLIC_CUE_NOT_PRIEST_ACTION");
    const ambiguous={label:"QUIET PRIEST TRACK → SECRET CANON"};
    const quiet=resolvePriestChantVoice({form,cueId:id,sourceClock:"SCHOLA_PUBLIC",
      ordinaryVoice:ambiguous});
    assert.equal(quiet.priestVoice,null,"Public Schola words must not assert current priest voice");
    assert.equal(quiet.owner,"PRIEST_VOICE_UNOBSERVED_FAIL_CLOSED");
  }
  for(const [type,source] of [
    ["PRIEST_SANCTUS_RECITATION","GM.P.C0145.01"],
    ["PRIEST_BENEDICTUS_RECITATION","GM.P.C0148.01"]
  ]){
    // An actual observed priest moment may occur while the choir is on a different phrase.
    const currentChoir="AO.SM.C0145";
    const observed={actor:"PRIEST",observed:true,source:"EXPLICIT_OBSERVATION",
      eventType:type,atCueId:currentChoir};
    assert.equal(validatePriestChantObservation(observed,currentChoir,form),true);
    const result=resolvePriestChantAction({
      form,cueId:currentChoir,sourceClock:"SCHOLA_PUBLIC",
      gestureMatrix:matrix,observation:observed});
    assert.equal(result.priestAction.sourceGestureId,source);
    assert.equal(result.priestAction.owner,"INDEPENDENT_PRIEST_OBSERVATION");
    assert.equal(result.priestAction.cueId,currentChoir);
    assert.equal(result.owner,"INDEPENDENT_PRIEST_OBSERVATION");
    assert.equal(result.observed,true);
    const voice=resolvePriestChantVoice({
      form,cueId:currentChoir,sourceClock:"SCHOLA_PUBLIC",
      ordinaryVoice:{label:"STALE"},observedPriestAction:result,observation:observed
    });
    assert.equal(voice.observed,true);
    assert.equal(voice.priestVoice.owner,"INDEPENDENT_PRIEST_OBSERVATION");
    assert.equal(voice.priestVoice.sourceCueId,type==="PRIEST_SANCTUS_RECITATION"?"AO.SM.C0145":"AO.SM.C0148");
    assert.match(voice.priestVoice.label,type==="PRIEST_SANCTUS_RECITATION"?/SANCTUS/:/BENEDICTUS/);
    // Navigation invalidates an old observation; no gesture persists across reader cues.
    const expired=resolvePriestChantAction({
      form,cueId:"AO.SM.C0148",sourceClock:"SCHOLA_PUBLIC",
      gestureMatrix:matrix,observation:observed});
    assert.equal(expired.priestAction,null);
    assert.equal(resolvePriestChantVoice({form,cueId:"AO.SM.C0148",
      sourceClock:"SCHOLA_PUBLIC",observation:observed,
      observedPriestAction:expired}).priestVoice,null);
  }
  const unobserved=resolvePriestChantAction({
    form,cueId:"AO.SM.C0145",sourceClock:"SCHOLA_PUBLIC",
    gestureMatrix:matrix,observation:{
      actor:"SCHOLA",observed:true,source:"EXPLICIT_OBSERVATION",
      eventType:"PRIEST_SANCTUS_RECITATION",atCueId:"AO.SM.C0145"
    }});
  assert.equal(unobserved.priestAction,null);
  assert.equal(validatePriestChantObservation({
    actor:"PRIEST",observed:false,source:"EXPLICIT_OBSERVATION",
    eventType:"PRIEST_SANCTUS_RECITATION"
  },"AO.SM.C0145",form),false);
  assert.equal(validatePriestChantObservation({
    actor:"PRIEST",observed:true,source:"SCHOLA_ADVANCE",
    eventType:"PRIEST_SANCTUS_RECITATION"
  },"AO.SM.C0145",form),false);
  assert.equal(validatePriestChantObservation({
    actor:"PRIEST",observed:true,source:"EXPLICIT_OBSERVATION",
    eventType:"MC-SAN-030"
  },"AO.SM.C0145",form),false);
  assert.equal(validatePriestChantObservation({
    actor:"PRIEST",observed:true,source:"EXPLICIT_OBSERVATION",
    eventType:"PRIEST_SANCTUS_RECITATION"
  },"AO.SM.C0160",form),false);
  assert.equal(resolvePriestChantAction({
    form,cueId:"AO.SM.C0145",sourceClock:"SCHOLA_PUBLIC",
    gestureMatrix:{items:[]},observation:{
      actor:"PRIEST",observed:true,source:"EXPLICIT_OBSERVATION",
      eventType:"PRIEST_SANCTUS_RECITATION",atCueId:"AO.SM.C0145"
    }
  }).priestAction,null);
  for(const cue of ["AO.SM.C0146","AO.SM.C0147","AO.SM.C0149"]){
    const projection=resolvePriestChantVoice({form,cueId:cue,
      sourceClock:"SCHOLA_PUBLIC",ordinaryVoice:{label:"INHERITED QUIET PRIEST TRACK"}});
    assert.equal(projection.priestVoice,null,form+" "+cue+" inherited private voice from Sanctus");
  }
  const spoof=resolvePriestChantVoice({form,cueId:"AO.SM.C0145",
    sourceClock:"SCHOLA_PUBLIC",
    observation:{actor:"SCHOLA",observed:true,source:"EXPLICIT_OBSERVATION",
      eventType:"PRIEST_SANCTUS_RECITATION",atCueId:"AO.SM.C0145"},
    observedPriestAction:{observed:true,owner:"INDEPENDENT_PRIEST_OBSERVATION"}});
  assert.equal(spoof.priestVoice,null,"Schola cannot forge independent priest voice");
  const originalVoice={label:"PRIEST READS CANON QUIETLY"};
  assert.equal(resolvePriestChantVoice({form,cueId:"AO.SM.C0150",
    sourceClock:"PRIEST_PRIVATE",ordinaryVoice:originalVoice}).priestVoice,originalVoice,
    "Canon priest speech outside Schola region must remain source-owned");
  // An unrelated canonical action remains owned by the existing cue/rubric matrix.
  const otherAction={label:"GENUFLECTS",cueId:"AO.SM.C0181"};
  assert.equal(resolvePriestChantAction({
    form,cueId:"AO.SM.C0181",sourceClock:"PRIEST_ACTION",
    ordinaryAction:otherAction
  }).priestAction,otherAction);
  assert.equal(resolvePriestChantAction({
    form,cueId:"AO.SM.C0151",sourceClock:"PRIEST_PRIVATE",
    ordinaryAction:otherAction
  }).priestAction,otherAction);
}
// No Low Mass/voice or off-clock rule is changed.
for(const cue of laterChoirCues){
 const original={label:"LOW MASS PRIEST PRAYER",cueId:cue};
 assert.equal(resolvePriestChantAction({form:"LOW",cueId:cue,
   sourceClock:"PUBLIC_TEXT",ordinaryAction:original}).priestAction,original);
 assert.equal(resolvePriestChantVoice({form:"LOW",cueId:cue,
   sourceClock:"PUBLIC_TEXT",ordinaryVoice:original}).priestVoice,original);
}
const low={label:"PRIEST RECITES SANCTUS"};
assert.equal(resolvePriestChantAction({
  form:"LOW",cueId:"AO.SM.C0145",sourceClock:"PUBLIC_TEXT",ordinaryAction:low
}).priestAction,low,"Low Mass priest gesture was wrongly suppressed");
assert.equal(resolvePriestChantAction({
  form:"LOW",cueId:"AO.SM.C0145",sourceClock:"PUBLIC_TEXT"
}).owner,"UNCHANGED_FORM");
const lowVoice={label:"PRIEST RECITES SANCTUS"};
assert.equal(resolvePriestChantVoice({
  form:"LOW",cueId:"AO.SM.C0145",sourceClock:"PUBLIC_TEXT",ordinaryVoice:lowVoice
}).priestVoice,lowVoice,"Low Mass priest voice must never be suppressed");
// Explicit input is not a claim of automatic sensing, camera, or audio recognition.
console.log("PASS priest/Schola owner guard: 30 later Gloria/Credo Schola cues x 3 sung forms fail closed; priest intonation ends preserved; Sanctus observations, Low and Canon unchanged.");
