import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LIVE_HANDOFF_SOURCE_CERTIFIED_TURNS,LIVE_HANDOFF_TURN_HOLDS,
  projectLiveHandoffSourceTurnPreview} from "../src/mass/reader-live-handoff-turns.js";
import {renderLiveHandoffPreviewRouteOverlay,liveHandoffSideViewOrientation}
  from "../src/mass/reader-live-handoff-sanctuary.js";
import {LIVE_HANDOFF_REFERENCE_TURNS,LIVE_HANDOFF_SOURCE_POINTS,
  projectLiveHandoffPlanPosition} from "../src/mass/reader-live-handoff-geometry.js";
import {clampLiveHandoffRouteStep} from "../src/mass/reader-live-handoff-routes.js";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const sourcePositions=read("../data/presentation/reader-priest-positions.v1.json");
const prepared=(opts={})=>({session:{resolvedMass:{
  form:"MISSA_CANTATA_SIMPLE",proper:{data:{liturgicalColour:"WHITE"}},
  conditions:[],overlays:[],...opts
},plan:{overlayGraphs:[]}}});
function gate(referenceId,cue){
  const nativeCardId="AO.LIVECURATED.AO.CARD.011.1";
  return {ok:true,crosswalk:{status:"EXACT_NATIVE_65_CROSSWALK"},
    reference:{referenceId,status:"MATCHED_SOURCE_CARD",
      expectedNativeId:nativeCardId,nativeCardId,
      evidence:{sourceCueIds:[cue],sourceOwned:true,stateOnly:false}
    }};
}
const current=(cue,facing="PEOPLE")=>({
  nativeCueId:cue,cueProjectionSupported:true,
  priestPosition:{station:"ALTAR_CENTER",facing,
    owner:"R17_CUE_SOURCE",positionReferenceCueId:cue,
    locationConfidence:"RUBRICAL_REFERENCE_NOT_GPS"}
});
test("seven named turns match distinct exact source position events",()=>{
  assert.equal(LIVE_HANDOFF_SOURCE_CERTIFIED_TURNS.length,7);
  const ids=new Set();
  for(const b of LIVE_HANDOFF_SOURCE_CERTIFIED_TURNS){
    assert.ok(!ids.has(b.referenceId));ids.add(b.referenceId);
    const source=sourcePositions.items.find(p=>p.cueId===b.sourceCueId);
    assert.ok(source,b.sourceCueId);
    assert.equal(source.station,"ALTAR_CENTER");
    assert.equal(source.facing,b.expectedFacing);
    assert.equal(source.condition,null);
    assert.ok(LIVE_HANDOFF_REFERENCE_TURNS[Number(b.referenceId.slice(1))]);
    const p=projectLiveHandoffSourceTurnPreview({
      gate:gate(b.referenceId,b.sourceCueId),
      nativeState:current(b.sourceCueId,b.expectedFacing),prepared:prepared()
    });
    assert.equal(p.ok,true,b.referenceId);
    assert.equal(p.path.length,2,"No unverified third/fourth turn or walk may be inferred");
    assert.deepEqual(p.path.map(x=>x.station),["CENTER","CENTER"]);
    assert.deepEqual(p.path.map(x=>x.rotation),[0,180]);
    assert.deepEqual(p.path[0].point,projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.CENTER));
    assert.equal(p.observed,false);
    assert.equal(p.automatic,false);
    assert.equal(p.isActualTurnObserved,false);
    assert.equal(p.mayUpdateSchola,false);
    assert.equal(p.mayTrackActualProgress,false);
  }
});
test("second Confiteor C55 held: original source position C0238 faces UNRESOLVED",()=>{
  assert.deepEqual(LIVE_HANDOFF_TURN_HOLDS.map(x=>x.referenceId),["C55"]);
  const row=sourcePositions.items.find(x=>x.cueId==="AO.SM.C0238");
  assert.equal(row.facing,"UNRESOLVED");
  const p=projectLiveHandoffSourceTurnPreview({
    gate:gate("C55","AO.SM.C0238"),
    nativeState:current("AO.SM.C0238"),prepared:prepared()
  });
  assert.equal(p.ok,false);
  assert.equal(p.reason,"CONDITIONAL_SECOND_CONFITEOR_TURN_ON_HOLD");
});
test("Requiem 1962 omits blessing C63; no final turn illustration",()=>{
  const p=projectLiveHandoffSourceTurnPreview({
    gate:gate("C63","AO.SM.C0265"),
    nativeState:current("AO.SM.C0265"),prepared:prepared({isRequiem:true})
  });
  assert.equal(p.ok,false);
  assert.equal(p.reason,"REQUIEM_FINAL_BLESSING_OMITTED");
});
test("exact native identity and exact current cue required — card alone never triggers",()=>{
  const args={nativeState:current("AO.SM.C0070"),
    prepared:prepared()};
  assert.equal(projectLiveHandoffSourceTurnPreview({...args,gate:null}).ok,false);
  for(const mutation of [
    {crosswalk:{status:"SOURCE_HOLD"}},
    {reference:{...gate("C10","AO.SM.C0070").reference,
      expectedNativeId:"NOT_THE_ACTUAL_NATIVE_CARD"}},
    {reference:{...gate("C10","AO.SM.C0070").reference,
      status:"UNMATCHED_REFERENCE_HOLD"}}
  ]){
    const g={...gate("C10","AO.SM.C0070"),...mutation};
    assert.equal(projectLiveHandoffSourceTurnPreview({...args,gate:g}).ok,false);
  }
  const wrongCue=projectLiveHandoffSourceTurnPreview({
    gate:gate("C10","AO.SM.C0070"),
    nativeState:current("AO.SM.C0071"),prepared:prepared()
  });
  assert.equal(wrongCue.ok,false);
  assert.equal(wrongCue.reason,"CURRENT_NATIVE_CUE_NOT_CERTIFIED_FOR_TURN");
  const unrelated=projectLiveHandoffSourceTurnPreview({
    gate:gate("C10","AO.SM.C0070"),
    nativeState:{...current("AO.SM.C0070"),cueProjectionSupported:false},
    prepared:prepared()
  });
  assert.equal(unrelated.ok,false);
  assert.equal(unrelated.reason,"CURRENT_NATIVE_CUE_NOT_CERTIFIED_FOR_TURN");
});
test("only actual current source station and facing can enable turn preview",()=>{
  const g=gate("C10","AO.SM.C0070");
  for(const priestPosition of [
    {station:"ALTAR_CENTER",facing:"LITURGICAL_EAST"},
    {station:"ALTAR_EPISTLE_MISSAL",facing:"PEOPLE"},
    {station:"ALTAR_CENTER",facing:"PEOPLE",locationConfidence:"UNCONFIRMED"},
    {station:"ALTAR_CENTER",facing:"PEOPLE",positionReferenceCueId:"AO.SM.C0069"}
  ]){
    const p=projectLiveHandoffSourceTurnPreview({
      gate:g,nativeState:{...current("AO.SM.C0070"),priestPosition},
      prepared:prepared()
    });
    assert.equal(p.ok,false,JSON.stringify(priestPosition));
  }
  const stateOnly=gate("C10","AO.SM.C0070");
  stateOnly.reference.evidence.stateOnly=true;
  assert.equal(projectLiveHandoffSourceTurnPreview({
    gate:stateOnly,nativeState:current("AO.SM.C0070"),
    prepared:prepared()
  }).reason,"SUPPRESSED_OR_STATE_ONLY_CARD");
});
test("side-view priest flips while remaining upright; in-place turn has no false next ring",()=>{
  assert.equal(liveHandoffSideViewOrientation(0),"scale(1 1)");
  assert.equal(liveHandoffSideViewOrientation(180),"scale(-1 1)");
  assert.equal(liveHandoffSideViewOrientation(360),"scale(1 1)");
  assert.equal(liveHandoffSideViewOrientation(-90),"scale(-1 1)");
  const route=projectLiveHandoffSourceTurnPreview({
    gate:gate("C10","AO.SM.C0070"),
    nativeState:current("AO.SM.C0070"),prepared:prepared()
  });
  const markup=renderLiveHandoffPreviewRouteOverlay({
    scene:{colour:"WHITE"},route,step:clampLiveHandoffRouteStep(route,0)
  });
  assert.match(markup,/data-lb-route-overlay/);
  assert.match(markup,/scale\(1 1\)/);
  assert.doesNotMatch(markup,/data-lb-route-next/);
  assert.doesNotMatch(markup,/transform="rotate\(180\)"/);
});
test("native reader remains authoritative, no auto turn on card/scroll/schola",()=>{
  const band=readFileSync(new URL("../src/mass/reader-live-handoff-band.js",import.meta.url),"utf8");
  const src=readFileSync(new URL("../src/mass/reader-live-handoff-turns.js",import.meta.url),"utf8");
  assert.match(band,/routeStart\.addEventListener\("click",startRoutePreview\)/);
  assert.match(band,/projectLiveHandoffSourceTurnPreview\(\{gate:result,nativeState,prepared\}\)/);
  assert.match(band,/availableRoute.kind==="TURN"\?"Illustrate turn"/);
  assert.match(band,/activeRoute\.id!==potentialRoute\.id/);
  assert.doesNotMatch(band,/setInterval\(|autoPlayRoute\(|setScholaProgress\(/);
  assert.doesNotMatch(src,/setMassCard\(|activateForCard\(|setSchola\(/);
});
