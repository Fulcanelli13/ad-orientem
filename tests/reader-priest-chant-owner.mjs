import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {iconKeysForReaderState} from "../src/mass/reader-icons.js";
import {isRequiemAgnusBreastStrikeOmitted,requiemAgnusVariantsForResolvedMass} from "../src/mass/reader-requiem-conditions.js";
import {resolvePriestChantAction,resolvePriestChantVoice,validatePriestChantObservation,
  PRIEST_SANCTUS_OBSERVATION_TYPES} from "../src/mass/reader-priest-chant-owner.js";

const load=p=>JSON.parse(readFileSync(new URL("../data/"+p,import.meta.url),"utf8"));
const matrix=load("mass/gesture-matrix.v1.json");
const sung=load("presentation/reader-text-sung.v1.json");
const corpusById=new Map(sung.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,u])));
const forms=["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
assert.deepEqual(PRIEST_SANCTUS_OBSERVATION_TYPES,
 ["PRIEST_SANCTUS_RECITATION","PRIEST_BENEDICTUS_RECITATION"]);
for(const form of forms){
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
  // Every public Sanctus/Benedictus phrase is clock-independent.
  // A priest action linked to that Latin phrase must not survive merely
  // because the choir happens to sing it now.
  for(const cue of ["AO.SM.C0146","AO.SM.C0147","AO.SM.C0149"]){
    assert.equal(corpusById.get(cue)?.clock,"SCHOLA_PUBLIC");
    const fake={cueId:cue,label:"BOWS FOR SANCTUS",iconKey:"head_bow"};
    const result=resolvePriestChantAction({form,cueId:cue,
      sourceClock:"SCHOLA_PUBLIC",ordinaryAction:fake,gestureMatrix:matrix});
    assert.equal(result.priestAction,null,form+"/"+cue+" inferred priest bow from schola phrase");
    assert.equal(result.owner,"PRIEST_EVENT_UNOBSERVED");
  }
  // ICKSP + 1962 Ritus: the priest strikes his breast three times,
  // independently of the same text sung by the Schola; Requiem suppresses
  // the priest's striking, and its public Agnus has distinct invocations.
  // These three choir-owned cues must NEVER act as observed priest actions.
  for(const cue of ["AO.SM.C0222","AO.SM.C0223","AO.SM.C0224"]){
    assert.equal(corpusById.get(cue)?.clock,"SCHOLA_PUBLIC");
    const source=matrix.items.find(x=>x.cueId===cue&&x.actor==="PRIEST");
    assert.equal(source?.gesture,"BREAST_STRIKE",cue+" source priest gesture lost");
    assert.equal(source?.condition,"NOT_REQUIEM",cue+" Requiem condition lost");
    const bogus={cueId:cue,label:"STRIKES BREAST",
      owner:"GESTURE_MATRIX_SOT",sourceGestureId:source.id};
    const projected=resolvePriestChantAction({form,cueId:cue,sourceClock:"SCHOLA_PUBLIC",
      ordinaryAction:bogus,gestureMatrix:matrix});
    assert.equal(projected.priestAction,null,form+"/"+cue+" choir inferred priest breast strike");
    assert.equal(projected.owner,"PRIEST_EVENT_UNOBSERVED");
    assert.equal(projected.reason,"SCHOLA_PUBLIC_CUE_NOT_PRIEST_ACTION");
    const faithfullySung=iconKeysForReaderState({form,cueId:cue,
      priestAction:projected.priestAction,
      gesture:{cueId:cue,type:"BREAST_STRIKE",owner:"R17_PROFILE_CUE"}});
    assert.equal(faithfullySung.priestActionIconKey,null,
      cue+" unobserved priest action appeared on right rail");
    assert.equal(faithfullySung.gestureIconKey,"canon:faithful.gesture.strike_breast",
      cue+" unrelated faithful customary gesture vanished");
    assert.equal(isRequiemAgnusBreastStrikeOmitted(cue,
      {session:{resolvedMass:{form,overlays:["REQUIEM"]}}}),true);
    const requiem=requiemAgnusVariantsForResolvedMass({form,overlays:["REQUIEM"]});
    assert.match(requiem[cue]?.lat??"",/dona eis réquiem/,
      "Requiem Agnus must never retain ordinary words");
    const voice=resolvePriestChantVoice({form,cueId:cue,sourceClock:"SCHOLA_PUBLIC",
      ordinaryVoice:{cueId:cue,label:"QUIET PRIEST TRACK"}});
    assert.equal(voice.priestVoice,null,form+"/"+cue+" choir inferred priest's private voice");
    assert.equal(voice.owner,"PRIEST_VOICE_UNOBSERVED_FAIL_CLOSED");
    const spoof={actor:"PRIEST",observed:true,source:"EXPLICIT_OBSERVATION",
      eventType:"PRIEST_SANCTUS_RECITATION",atCueId:cue};
    assert.equal(validatePriestChantObservation(spoof,cue,form),false);
    const invalid=resolvePriestChantAction({form,cueId:cue,sourceClock:"SCHOLA_PUBLIC",
      gestureMatrix:matrix,observation:spoof,ordinaryAction:bogus});
    assert.equal(invalid.priestAction,null,form+"/"+cue+" accepted a forged Sanctus observation");
    // Text cue alone cannot infer action even if a user scrolls back/forth.
    const offClock={label:"PRIEST SPEAKS",cueId:cue};
    assert.equal(resolvePriestChantAction({form,cueId:cue,sourceClock:"PRIEST_PRIVATE",
      ordinaryAction:offClock}).priestAction,offClock,
      "Do not suppress independently source-owned priest prayer in other clock");
  }
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
// Low Mass has no Schola overlay, including all three Agnus invocations.
for(const cue of ["AO.SM.C0222","AO.SM.C0223","AO.SM.C0224"]){
 const actual={cueId:cue,label:"STRIKES BREAST"};
 const voice={cueId:cue,label:"PRIEST RECITES AGNUS DEI"};
 assert.equal(resolvePriestChantAction({form:"LOW",cueId:cue,
  sourceClock:"PUBLIC_TEXT",ordinaryAction:actual}).priestAction,actual);
 assert.equal(resolvePriestChantVoice({form:"LOW",cueId:cue,
  sourceClock:"PUBLIC_TEXT",ordinaryVoice:voice}).priestVoice,voice);
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
// The Canonical icon lane must also honour the omitted Requiem faithful prompt;
// a pure icon resolver renders only actions that another source actually supplies.
for(const cueId of ["AO.SM.C0222","AO.SM.C0223","AO.SM.C0224"]){
 assert.equal(isRequiemAgnusBreastStrikeOmitted(cueId,
  {session:{resolvedMass:{form:"SOLEMN",overlays:[]}}}),false);
 assert.equal(iconKeysForReaderState({
  form:"SOLEMN",cueId,priestAction:null,gesture:null,
 }).gestureIconKey,null,"No default Requiem/ordinary faithful gesture without an event");
}
// Explicit input is not a claim of automatic sensing, camera, or audio recognition.
console.log("PASS priest/Schola guard: five Sanctus and three Agnus public cues x three sung forms fail closed, Low/Canon and observed Sanctus ownership retained.");
