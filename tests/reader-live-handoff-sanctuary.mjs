import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  LIVE_SANCTUARY_STATION_MAP,projectLiveHandoffSanctuary,
  renderLiveHandoffSanctuarySvg,approvedFaithfulArt
} from "../src/mass/reader-live-handoff-sanctuary.js";
import {LIVE_HANDOFF_SOURCE_POINTS,LIVE_HANDOFF_ALTAR_PLAN,
  projectLiveHandoffPlanPosition} from "../src/mass/reader-live-handoff-geometry.js";

const source=(form="MISSA_CANTATA_SIMPLE",extra={})=>({
  session:{
    resolvedMass:{
      form,proper:{data:{liturgicalColour:"RED"}},overlays:[],
      ...extra
    },
    plan:{overlayGraphs:[]}
  }
});
function gate(){
  return {ok:true,reference:{
    referenceId:"C01",nativeCardId:"AO.LIVECURATED.AO.CARD.001.1",
    evidence:{sourceCueIds:["AO.SM.C0001","AO.SM.C0002"]}
  }};
}
function current(patch={}){
  return {nativeCueId:"AO.SM.C0001",cueProjectionSupported:true,
    priestPosition:{
      station:"FOOT_CENTER",facing:"LITURGICAL_EAST",
      owner:"R18_LOW_CUE_SOURCE",locationConfidence:"RUBRICAL_REFERENCE_NOT_GPS"
    },
    posture:{value:"KNEEL",owner:"SOURCE_POSTURE_PROFILE"},
    ...patch
  };
}
test("source-authored position and faithful posture populate source-matched current cue only",()=>{
  const model=projectLiveHandoffSanctuary({gate:gate(),nativeState:current(),prepared:source()});
  assert.equal(model.status,"SOURCE_STATION_REFERENCE");
  assert.equal(model.priest.station,"FOOT");
  assert.equal(model.priest.positionReferenceCueId,"AO.SM.C0001");
  assert.equal(model.priest.independentlyObserved,false);
  assert.equal(model.priest.source,"REFERENCE_POSITION_NOT_OBSERVED_REAL_TIME");
  assert.equal(model.faithful.posture,"KNEEL");
  assert.equal(model.server.scope,"REFERENCE_PRESENCE_ONLY");
  assert.equal(model.server.bell,false);
  assert.equal(model.ministers,"SOLEMN_REVIEW_HOLD");
  assert.equal(model.candles,6);
  assert.equal(model.colour,"RED");
});
test("a native source variant or unrelated focused cue cannot place the priest",()=>{
  assert.equal(projectLiveHandoffSanctuary({gate:{ok:false},nativeState:current(),prepared:source()}).status,
    "NATIVE_CROSSWALK_REQUIRED");
  const wrong=projectLiveHandoffSanctuary({gate:gate(),
    nativeState:current({nativeCueId:"AO.SM.C0217"}),prepared:source()});
  assert.equal(wrong.status,"CURRENT_CUE_NOT_SOURCE_MATCHED");
  assert.equal(wrong.priest,null);
  assert.equal(wrong.faithful,null);
  const notCertified=projectLiveHandoffSanctuary({gate:gate(),
    nativeState:current({cueProjectionSupported:false}),prepared:source()});
  assert.equal(notCertified.priest,null);
});
test("asynchronous routes, unobserved and in-transit priest positions fail closed",()=>{
  for(const station of ["PRIEST_TRACK_ASYNC","ROUTE_CONTROLLED","IN_TRANSIT",
    "UNCONFIRMED","NOT_A_STATION"]){
    const scene=projectLiveHandoffSanctuary({gate:gate(),nativeState:current({
      priestPosition:{station,facing:"LITURGICAL_EAST"}
    }),prepared:source()});
    assert.equal(scene.priest,null,station);
    assert.equal(scene.status,"PRIEST_POSITION_NOT_CONFIRMED");
  }
  const pending=projectLiveHandoffSanctuary({gate:gate(),nativeState:current({
    priestPosition:{station:"ALTAR_CENTER",facing:"PEOPLE",locationConfidence:"UNCONFIRMED"}
  }),prepared:source()});
  assert.equal(pending.priest,null);
});
test("all approved station labels use frozen source geometry; Communion stays inside rail",()=>{
  const allowed=Object.values(LIVE_SANCTUARY_STATION_MAP);
  for(const station of allowed)assert.ok(Object.hasOwn(LIVE_HANDOFF_SOURCE_POINTS,station));
  const communion=projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.RAIL);
  const outerRailX=525-.87*LIVE_HANDOFF_ALTAR_PLAN.sanctuaryRailY;
  assert.ok(communion.x>outerRailX);
  assert.deepEqual([...LIVE_HANDOFF_SOURCE_POINTS.RAIL],[300,268]);
  const atRail=projectLiveHandoffSanctuary({gate:gate(),nativeState:current({
    priestPosition:{station:"COMMUNION_RAIL",facing:"COMMUNICANT",owner:"R18_LOW_CUE_SOURCE"}
  }),prepared:source("LOW")});
  assert.equal(atRail.priest.station,"RAIL");
  assert.equal(atRail.candles,2);
  assert.ok(atRail.server);
});
test("Requiem has black frontal and violet tabernacle veil, 6 vs 2 candles",()=>{
  const prepared=source("SOLEMN",{overlays:["REQUIEM"],
    proper:{data:{liturgicalColour:"BLACK"}}});
  const scene=projectLiveHandoffSanctuary({gate:gate(),nativeState:current(),prepared});
  assert.equal(scene.requiem,true);
  assert.equal(scene.colour,"BLACK");
  assert.equal(scene.candles,6);
  assert.equal(scene.server,null);
  assert.equal(scene.ministers,"SOLEMN_REVIEW_HOLD");
  const svg=renderLiveHandoffSanctuarySvg(scene);
  assert.match(svg,/fill:#705184/); // Violet tabernacle, never black veil
  assert.match(svg,/fill:#242429/); // Black frontal
  assert.equal((svg.match(/class="ao-lb-candle"/g)??[]).length,6);
  const low=projectLiveHandoffSanctuary({gate:gate(),nativeState:current(),
    prepared:source("LOW")});
  assert.equal((renderLiveHandoffSanctuarySvg(low).match(/class="ao-lb-candle"/g)??[]).length,2);
});
test("approved kneel, sit, stand are reused without creating new icon family",()=>{
  for(const posture of ["STAND","SIT","KNEEL"]){
    const art=approvedFaithfulArt(posture);
    assert.ok(art && /assets\/active\/mass-final\//.test(art),posture);
  }
  assert.equal(approvedFaithfulArt("GENUFLECT"),null,
    "Mass controller lacks a crowd genuflection event; do not invent it");
  assert.equal(approvedFaithfulArt("UNRESOLVED"),null);
});
test("sanctuary is label-free with no unverified minister, bell or audio glyphs",()=>{
  const scene=projectLiveHandoffSanctuary({gate:gate(),nativeState:current(),prepared:source()});
  const svg=renderLiveHandoffSanctuarySvg(scene);
  assert.match(svg,/viewBox="0 0 600 600"/);
  assert.match(svg,/data-actor="priest"/);
  assert.match(svg,/data-actor="server"/);
  assert.doesNotMatch(svg,/<text\b|<foreignObject\b|>YOU<|>STAND<|>PRIEST</i);
  assert.doesNotMatch(svg,/data-actor="deacon"|data-actor="subdeacon"|data-actor="thurifer"/);
  assert.doesNotMatch(svg,/♪|℣|℟|🔔/u);
});
test("existing LIVE reader still owns both rails, source cue and Schola",()=>{
  const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
  const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
  const band=readFileSync(new URL("../src/mass/reader-live-handoff-band.js",import.meta.url),"utf8");
  assert.match(dom,/class="ao-rail ao-rail-left"/);
  assert.match(dom,/class="ao-rail ao-rail-right"/);
  assert.match(band,/preview\.getNativeEventState\?\.\(\)/);
  assert.match(native,/independent(ly)?\s*(sung|Schola)|independent Schola/i);
  assert.doesNotMatch(band,/activateForCard\(|reachLiturgicalBoundary\(|setSchola\(/);
});
