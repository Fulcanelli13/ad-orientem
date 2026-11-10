import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  projectLiveHandoffIncensationPreview,projectLiveHandoffAspergesPreview,
  clampLiveHandoffRouteStep
} from "../src/mass/reader-live-handoff-routes.js";
import {
  LIVE_HANDOFF_ASPERGES_ROUTE,LIVE_HANDOFF_INCENSATION_ROUTE,
  LIVE_HANDOFF_SOURCE_POINTS,projectLiveHandoffPlanPosition
} from "../src/mass/reader-live-handoff-geometry.js";
import {renderLiveHandoffPreviewRouteOverlay} from "../src/mass/reader-live-handoff-sanctuary.js";

const prepared=(form="MISSA_CANTATA_INCENSE",overrides={})=>({
  session:{
    resolvedMass:{form,proper:{data:{liturgicalColour:"GREEN"}},
      conditions:[],overlays:[],...overrides},
    plan:{overlayGraphs:[]}
  }
});
const gate=(cue="AO.SM.C0041",extras={})=>({
  ok:true,reference:{nativeCardId:"AO.LIVECURATED.AO.CARD.009.1",
    evidence:{sourceCueIds:[cue],sourceOwned:true,...extras}}
});
const state=(cue="AO.SM.C0041")=>({nativeCueId:cue,
  cueProjectionSupported:true,priestPosition:{station:"IN_TRANSIT"}});
test("exact native C0041 allows manually requested entrance demonstration only",()=>{
  const route=projectLiveHandoffIncensationPreview({
    gate:gate(),nativeState:state(),prepared:prepared()
  });
  assert.equal(route.ok,true);
  assert.equal(route.id,"ENTRANCE_ALTAR_INCENSATION");
  assert.equal(route.sourceCueId,"AO.SM.C0041");
  assert.equal(route.automatic,false);
  assert.equal(route.observed,false);
  assert.equal(route.mayTrackActualProgress,false);
  assert.equal(route.mayUpdateSchola,false);
  assert.equal(route.path.length,7);
  assert.deepEqual(route.path.map(x=>x.station),
    LIVE_HANDOFF_INCENSATION_ROUTE.map(x=>x.station));
  for(const p of route.path){
    assert.deepEqual(p.sourcePoint,LIVE_HANDOFF_SOURCE_POINTS[p.station]);
    assert.deepEqual(p.point,projectLiveHandoffPlanPosition(p.sourcePoint));
  }
});
test("C0122 at offertory is permitted in sourced Requiem, but C0041 is omitted",()=>{
  const requiem=prepared("SOLEMN",{
    isRequiem:true,proper:{data:{liturgicalColour:"BLACK"}}
  });
  const entrance=projectLiveHandoffIncensationPreview({
    gate:gate(),nativeState:state(),prepared:requiem
  });
  assert.equal(entrance.ok,false);
  assert.equal(entrance.reason,"REQUIEM_ENTRANCE_INCENSATION_OMITTED");
  const offertory=projectLiveHandoffIncensationPreview({
    gate:gate("AO.SM.C0122"),nativeState:state("AO.SM.C0122"),prepared:requiem
  });
  assert.equal(offertory.ok,true);
  assert.equal(offertory.id,"OFFERTORY_ALTAR_INCENSATION");
});
test("no incensation preview is possible from Low/Simple, disabled or unrelated cues",()=>{
  for(const form of ["LOW","MISSA_CANTATA_SIMPLE"]){
    const r=projectLiveHandoffIncensationPreview({
      gate:gate(),nativeState:state(),prepared:prepared(form)
    });
    assert.equal(r.ok,false,form);
    assert.equal(r.reason,"INCENSE_NOT_ENABLED_FOR_FORM");
  }
  const disabled=projectLiveHandoffIncensationPreview({
    gate:gate(),nativeState:state(),prepared:prepared("SOLEMN",{conditions:["INCENSE_DISABLED"]})
  });
  assert.equal(disabled.ok,false);
  const wrong=projectLiveHandoffIncensationPreview({
    gate:gate(),nativeState:state("AO.SM.C0122"),prepared:prepared()
  });
  assert.equal(wrong.ok,false);
  assert.equal(wrong.reason,"CUE_NOT_OWNED_BY_CURRENT_NATIVE_CARD");
  const unrelated=projectLiveHandoffIncensationPreview({
    gate:gate("AO.SM.C0144"),nativeState:state("AO.SM.C0144"),prepared:prepared()
  });
  assert.equal(unrelated.ok,false);
  assert.equal(unrelated.reason,"NOT_AN_APPROVED_INCENSATION_CUE");
  const suppressed=projectLiveHandoffIncensationPreview({
    gate:gate("AO.SM.C0041",{stateOnly:true}),
    nativeState:state(),prepared:prepared()
  });
  assert.equal(suppressed.reason,"OMITTED_OR_STATE_ONLY_SOURCE_CARD");
});
test("no route is available when crosswalk/current controller rejects projection",()=>{
  const args={nativeState:state(),prepared:prepared()};
  for(const g of [null,{ok:false},{ok:true,reference:null}]){
    assert.equal(projectLiveHandoffIncensationPreview({...args,gate:g}).ok,false);
  }
  assert.equal(projectLiveHandoffIncensationPreview({
    ...args,gate:gate(),nativeState:{...state(),cueProjectionSupported:false}
  }).reason,"CUE_NOT_OWNED_BY_CURRENT_NATIVE_CARD");
});
test("Asperges reference path remains separate and requires independent rite controller",()=>{
  for(const opts of [
    {},
    {sourceRiteId:"ASPERGES",sourceStageId:"ASP-A",controllerVerified:true},
    {sourceRiteId:"ASPERGES",sourceStageId:"ASP-A",explicitlyRequested:true},
    {sourceRiteId:"ORDINARY_MASS",sourceStageId:"ASP-A",
      controllerVerified:true,explicitlyRequested:true}
  ]){
    assert.equal(projectLiveHandoffAspergesPreview(opts).ok,false);
  }
  const valid=projectLiveHandoffAspergesPreview({
    sourceRiteId:"ASPERGES",sourceStageId:"ASP-A",
    controllerVerified:true,explicitlyRequested:true
  });
  assert.equal(valid.ok,true);
  assert.equal(valid.observed,false);
  assert.equal(valid.automatic,false);
  assert.equal(valid.path.length,10);
  assert.deepEqual(valid.path.map(x=>x.station),
    LIVE_HANDOFF_ASPERGES_ROUTE.map(x=>x.station));
  assert.equal(valid.path.at(0).station,"FOOT");
  assert.equal(valid.path.at(-1).station,"FOOT");
});
test("finite bounded stepper exposes only current/next faint ring, never timed progress",()=>{
  const route=projectLiveHandoffIncensationPreview({
    gate:gate(),nativeState:state(),prepared:prepared()
  });
  assert.equal(clampLiveHandoffRouteStep(route,-3).index,0);
  assert.equal(clampLiveHandoffRouteStep(route,120).index,6);
  assert.equal(clampLiveHandoffRouteStep(route,NaN).index,0);
  assert.equal(clampLiveHandoffRouteStep(route,2.9).index,2);
  assert.equal(clampLiveHandoffRouteStep(route,6).next,null);
  assert.equal(clampLiveHandoffRouteStep({ok:false},0),null);
  const scene={colour:"GREEN"};
  const markup=renderLiveHandoffPreviewRouteOverlay({
    scene,route,step:clampLiveHandoffRouteStep(route,0)
  });
  assert.match(markup,/data-source="REFERENCE_ONLY_NOT_OBSERVED"/);
  assert.match(markup,/data-lb-route-next/);
  assert.match(markup,/data-lb-route-actor/);
  assert.doesNotMatch(markup,/<text\b|<path\b[^>]*stroke-dasharray|>PRIEST</);
  assert.equal(renderLiveHandoffPreviewRouteOverlay({
    scene,route:{ok:false},step:clampLiveHandoffRouteStep(route,0)
  }),"");
});
test("manual route is never triggered from swipe, model, Schola or elapsed time",()=>{
  const band=readFileSync(new URL("../src/mass/reader-live-handoff-band.js",import.meta.url),"utf8");
  const route=readFileSync(new URL("../src/mass/reader-live-handoff-routes.js",import.meta.url),"utf8");
  const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
  assert.match(band,/routeStart\.addEventListener\("click",startRoutePreview\)/);
  assert.match(band,/routeNext\.addEventListener\("click"/);
  assert.match(band,/activeRoute\.sourceCueId!==potentialRoute\.sourceCueId/);
  assert.match(band,/if\(!result\.ok\)\{availableRoute=null;stopRoutePreview\(\)/);
  assert.match(band,/prefers-reduced-motion: reduce/);
  assert.match(band,/svg\.insertAdjacentHTML\("beforeend",renderClaudeNativeRouteOverlay/);
  assert.match(route,/sourceCueIds\?\.includes\(cue\)/);
  assert.match(route,/sourceRiteId!=="ASPERGES"/);
  assert.match(native,/getNativeEventState:\(\)=>globalThis\.AO_R17_NATIVE_READER_STATE\?\?null/);
  assert.doesNotMatch(band,/autoPlayRoute\(|setInterval\(|requestAnimationFrame\(|setScholaProgress\(/);
});
