import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createReaderFormCueStateController,isExplicitRequiemMass} from "../src/mass/reader-form-state.js";
import {createReaderCueStateController} from "../src/mass/reader-cue-state.js";
const load=p=>JSON.parse(readFileSync(new URL("../data/"+p,import.meta.url),"utf8"));
const formState=load("presentation/reader-form-state.v1.json");
const lowText=load("presentation/reader-text-low.v1.json");
const sungText=load("presentation/reader-text-sung.v1.json");
const voiceRegistry=load("presentation/reader-priest-voices.v1.json");
const gestures=load("mass/gesture-matrix.v1.json");
const registries=Object.freeze({
  gestures:load("presentation/reader-gestures.v1.json"),
  responses:load("presentation/reader-responses.v1.json"),
  postures:load("presentation/reader-postures.v1.json"),
  positions:load("presentation/reader-priest-positions.v1.json"),
  voices:voiceRegistry,
  actions:load("presentation/reader-priest-actions.v1.json")
});
const prepared=(form,overlays=[],extras={})=>({
  session:{resolvedMass:{form,overlays,actualCelebration:extras.actualCelebration??{type:"CALENDAR"}},
    plan:{kind:"MASS",overlayGraphs:overlays}},
  readerPreferences:{mode:"LIVE",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}
});
const low=(overlays=[],extras={})=>createReaderFormCueStateController({
  formStateData:formState,registries,lowCorpus:lowText,sungCorpus:sungText,
  prepared:prepared("LOW",overlays,extras),gestureMatrix:gestures
});
const usual=low();
const normalWater=usual.project("AO.SM.C0112");
assert.equal(normalWater.supported,true);
assert.equal(normalWater.reason,null);
assert.equal(normalWater.priestPosition.station,"ALTAR_EPISTLE_SIDE");
assert.equal(normalWater.priestVoice.value,"SECRET");
assert.match(normalWater.priestAction?.label??"",/Sign of the Cross over the water cruet/);
assert.equal(normalWater.response,null);
assert.equal(normalWater.ownership.priestAction,"R18_LOW_CUE_NATIVE");
assert.equal(formState.low.cueStates.find(x=>x.cueId==="AO.SM.C0112").branchCondition,null);
assert.equal(voiceRegistry.items.find(x=>x.cueId==="AO.SM.C0112").condition,null);
const requiem=low(["REQUIEM"]);
const requiemWater=requiem.project("AO.SM.C0112");
assert.equal(requiemWater.reason,null,
  "Requiem conditional must not suppress the entire prayer/voice/position state");
assert.equal(requiemWater.priestAction,null,
  "Requiem must omit blessing of water, not the prayer");
assert.equal(requiemWater.priestPosition.station,"ALTAR_EPISTLE_SIDE");
assert.equal(requiemWater.priestVoice.value,"SECRET");
assert.equal(requiemWater.cueId,"AO.SM.C0112");
assert.equal(requiem.project("AO.SM.C0113").priestVoice.value,"SECRET",
  "the water/wine Deus qui humanae prayer must continue in Requiem");
assert.equal(requiem.project("AO.SM.C0113").priestAction?.label?.includes("Pours a little water"),true);
assert.equal(isExplicitRequiemMass(prepared("LOW",["REQUIEM"])),true);
assert.equal(isExplicitRequiemMass(prepared("LOW",[])),false);
assert.equal(isExplicitRequiemMass(prepared("LOW",[],{actualCelebration:{type:"REQUIEM"}})),true);
assert.equal(isExplicitRequiemMass(prepared("LOW",[]),new Set(["REQUIEM"])),true);
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const controller=createReaderFormCueStateController({
   formStateData:formState,registries,lowCorpus:lowText,sungCorpus:sungText,
   prepared:prepared(form,["REQUIEM"]),gestureMatrix:gestures
 });
 const state=controller.project("AO.SM.C0076");
 assert.equal(state.response,null,form+" must not force Deo gratias as a faithful response");
 assert.equal(state.priestAction?.owner==="R17_V180_PRIEST_ACTION_SOURCE",false,
   form+" must not invent a priest saying Deo gratias");
 if(form==="LOW"){
   assert.equal(state.ownership.response,"R18_LOW_SERVER_RESPONSE_SUPPRESSED");
   assert.equal(state.priestVoice.value,"LISTENS");
 } else {
   assert.equal(state.ownership.response==="R17_CUE_NATIVE",false);
 }
 const water=controller.project("AO.SM.C0112");
 assert(water.priestVoice!=null,form+" lost priest voice in Requiem water prayer");
 if(form==="LOW")assert.equal(water.priestAction,null);
}
// Canon/Communion Batch B: the 1962 Ritus servandus X.4 and XIII.1
// omit the priest's three Agnus Dei breast strikes in Masses for the dead.
// This is an ACTION/faithful-cue restriction; the text, voice and posture remain.
const agnus=["AO.SM.C0222","AO.SM.C0223","AO.SM.C0224"];
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const selection of [
    {overlays:["REQUIEM"]},
    {overlays:[],actualCelebration:{type:"REQUIEM"}},
    {overlays:["MASS_FOR_THE_DEAD"]},
  ]){
    const ctl=createReaderFormCueStateController({
      formStateData:formState,registries,lowCorpus:lowText,sungCorpus:sungText,
      prepared:prepared(form,selection.overlays,{actualCelebration:selection.actualCelebration}),gestureMatrix:gestures
    });
    for(const cueId of agnus){
      const state=ctl.project(cueId);
      assert.equal(state.reason,null,form+" Requiem lost Agnus prayer "+cueId);
      assert.equal(state.priestAction,null,form+" Requiem inherited ordinary chest strike at "+cueId);
      assert.equal(state.gesture,null,form+" Requiem suggested ordinary faithful strike at "+cueId);
      assert.ok(state.priestVoice,form+" Requiem lost priest voice at "+cueId);
      assert.ok(state.priestPosition,form+" Requiem lost priest position at "+cueId);
      assert.notEqual(state.ownership.priestAction,"R17_V180_EXACT_CUE_ACTION");
    }
  }
  const normal=createReaderFormCueStateController({
    formStateData:formState,registries,lowCorpus:lowText,sungCorpus:sungText,
    prepared:prepared(form),gestureMatrix:gestures
  });
  for(const cueId of agnus)assert.match(normal.project(cueId).priestAction?.label??"",
    /strik(es|ing).*breast/i,form+" ordinary Agnus strike vanished at "+cueId);
}
// Do not confuse Agnus Dei with the separate Domine non sum dignus breast strikes.
assert.match(usual.project("AO.SM.C0229").priestAction?.label??"",/strik(es|ing).*breast/i);
assert.match(requiem.project("AO.SM.C0229").priestAction?.label??"",/strik(es|ing).*breast/i);

// Canon-to-Communion boundary: these are already named action cues in BOTH
// certified reader corpora. A text focus alone must never claim an observed
// genuflection, altar movement, bell or minister action.
const canonBoundary=[
  ["AO.SM.C0174",/elevat/i],
  ["AO.SM.C0181",/elevat/i],
  ["AO.SM.C0204",/(?:minor elevation|raises the host and chalice slightly)/i],
  ["AO.SM.C0205",/genuflect/i],
];
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const overlays of [[],["REQUIEM"]]){
    const ctl=createReaderFormCueStateController({
      formStateData:formState,registries,lowCorpus:lowText,sungCorpus:sungText,
      prepared:prepared(form,overlays),gestureMatrix:gestures
    });
    for(const [cueId,expected] of canonBoundary){
      const state=ctl.project(cueId);
      assert.match(state.priestAction?.label??"",expected,
        form+" lost existing Canon stage "+cueId);
      assert.ok(state.priestVoice,form+" lost priest voice "+cueId);
      assert.equal(state.reason,null,form+" source cue was suppressed "+cueId);
      assert.ok(!String(state.ownership.priestAction).includes("LEGACY"));
    }
    for(const cueId of ["AO.SM.C0174","AO.SM.C0181"]){
      const minister=ctl.project(cueId).sacredMinister;
      if(form==="SOLEMN"){
        assert.match(minister?.actor??"",/DEACON/);
        assert.match(minister?.actor??"",/SUBDEACON/);
      }else assert.equal(minister,null,form+" invented sacred ministers at "+cueId);
    }
  }
}
const rubricEvents=load("presentation/reader-rubric-events.v1.json").items;
const byCue=(cueId)=>rubricEvents.filter(x=>x.cueId===cueId);
for(const [id,expectedBell] of [
  ["AO.SM.C0174","ELEVATION BELL · HOST"],
  ["AO.SM.C0181","ELEVATION BELL · CHALICE"]
]){
  const rows=byCue(id);
  assert.equal(rows.filter(x=>x.actor==="SERVER"&&x.label===expectedBell).length,1,
    id+" must keep one existing server-bell source, never duplicate a bell");
  assert.equal(rows.filter(x=>x.actor==="PRIEST"&&/ELEVATES/.test(x.label)).length,1,
    id+" must keep one existing elevation action");
}
const canonSources=load("research/mass-canon-62-source-trigger-audit-20261013.json");
const ministerSources=load("research/mass-canon-20-minister-stage-acceptance-20261014.json");
assert.equal(canonSources.rows.length,62,"62-action Canon SOT was replaced or split");
assert.equal(ministerSources.rows.length,20,"20 existing minister/server events were duplicated");
assert.equal(ministerSources.counts.independentlyTimed,0,
  "Reading a cue must not certify physical minister event timing");
assert.equal(ministerSources.counts.published,0,"Research stages were promoted without gate");

const lowResponse=formState.low.responseEvents.find(x=>x.cueId==="AO.SM.C0076");
assert.equal(lowResponse.owner,"MINISTER_OR_SERVER");
assert.equal(lowResponse.defaultUserResponse,false);
assert.equal(lowResponse.dialogueEligible,false);
assert.equal(registries.responses.items.some(x=>x.cueId==="AO.SM.C0076"),false);
const requiredSung=sungText.blocks.flatMap(b=>b.units).find(x=>x.cue_id==="AO.SM.C0076");
assert.equal(requiredSung.clock,"USER_RESPONSE",
  "keep immutable donor clock, but do not treat that clock as a requirement for faithful to respond");
assert.equal(formState.solemn.ministerEvents.find(x=>x.id==="SMIN-012").cue,"AO.SM.C0212");
assert.equal(formState.solemn.ministerEvents.find(x=>x.id==="SMIN-012").actor,"SUBDEACON → DEACON");
const paten=usual.project("AO.SM.C0212");
assert.match(paten.priestAction.label,/Holds the paten upright/i);
const pr=gestures.items.filter(x=>x.cueId==="AO.SM.C0181"&&x.actor==="PRIEST");
assert.equal(pr.filter(x=>x.gesture==="GENUFLECT").length,2);
assert.equal(pr.filter(x=>x.gesture==="ELEVATE_CHALICE").length,1);
assert.equal(gestures.items.filter(x=>x.id==="GM.P.C0151.01").length,1,
  "do not duplicate the altar kiss after petimus");
console.log("PASS Batch 2 form corrections: Requiem water cue preserved, blessing omitted; Epistle response actor and paten/chalice gestures not duplicated.");
