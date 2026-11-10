import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LIVE_HANDOFF_REFERENCE_ANCHORS,
  resolveLiveHandoffSourceCrosswalk}
  from "../src/mass/reader-live-handoff-source-crosswalk.js";
import {LIVE_HANDOFF_TIMELINE_LANES,projectLiveHandoffTimeline,
  projectLiveHandoffWheel,liveHandoffLaneAt}
  from "../src/mass/reader-live-handoff-timeline.js";
import {renderLiveHandoffTimelineHtml,renderLiveHandoffWheelHtml}
  from "../src/mass/reader-live-handoff-stage-d-render.js";
function model65(){
  const cards=LIVE_HANDOFF_REFERENCE_ANCHORS.map((a,i)=>({
    sectionId:a.expectedNativeId,sequence:i+1,title:a.referenceTitle,
    sourceSectionId:a.sourceKey.startsWith("AO.CANON.")?"AO.CARD.014":a.sourceKey,
    provenance:a.sourceKey.startsWith("AO.CANON.")?{canonSegmentId:a.sourceKey}:{},
    paragraphs:[{id:"SOURCE_P_"+i,sourceCueIds:["AO.SM.C"+String(i+1).padStart(4,"0")]}],
    blocks:[{blockId:"AO.SM.B"+String(i+1).padStart(3,"0")}]
  }));
  return {structureOwner:"SOURCE_FIRST_LIVE_CURATED_65_REVIEW",
    corpusFamily:"SUNG",presentationMode:"LIVE",cards};
}
function gate(model,index){
  const crosswalk=resolveLiveHandoffSourceCrosswalk({model,form:"SUNG"});
  return {ok:crosswalk.status==="EXACT_NATIVE_65_CROSSWALK",
    crosswalk,reference:crosswalk.mappings[index]};
}
function native(i,changes={}){
  return {nativeCueId:"AO.SM.C"+String(i+1).padStart(4,"0"),
    cueProjectionSupported:true,
    priestPosition:{station:"ALTAR_CENTER",label:"AT CENTRE",
      owner:"SOURCE_CEREMONIAL_PRIEST",locationConfidence:"RUBRICAL_REFERENCE_NOT_GPS"},
    posture:{value:"KNEEL"},
    ownership:{bell:"SOURCE_BELL_EVENT",posture:"NATIVE_POSTURE_PROFILE"},
    bell:null,
    ...changes};
}
test("timeline six parallel lanes preserve canonical 65-native-card order",()=>{
  const m=model65(),before=JSON.stringify(m);
  const ids=["PRIEST","MINISTERS","SCHOLA","ORGAN","BELLS","FAITHFUL"];
  assert.deepEqual(LIVE_HANDOFF_TIMELINE_LANES.map(x=>x.id),ids);
  for(const i of [0,8,20,34,45,54,64]){
    const t=projectLiveHandoffTimeline({
      gate:gate(m,i),model:m,nativeState:native(i)});
    assert.equal(t.ok,true);
    assert.equal(t.total,65);
    assert.equal(t.position,i+1);
    assert.deepEqual(t.lanes.map(x=>x.id),ids);
    assert.equal(t.current.nativeCardId,m.cards[i].sectionId);
    assert.equal(t.cards.filter(x=>x.current).length,1);
    assert.equal(t.cards[i].title,m.cards[i].title);
    assert.equal(t.observedTiming,false);
    assert.equal(t.scholaProgressIndependent,true);
    assert.equal(t.progressOwner,"NATIVE_CARD_ORDINAL_ONLY");
    assert.equal(t.lanes.length,6);
    assert.equal(liveHandoffLaneAt(t,"PRIEST").location,i);
    assert.equal(liveHandoffLaneAt(t,"FAITHFUL").location,i);
    for(const l of t.lanes){
      assert.equal(l.observedPerformance,false);
      if(l.id!=="PRIEST"&&l.id!=="FAITHFUL"&&l.id!=="BELLS")
        assert.equal(l.location,null,"No phantom performance clock for "+l.id);
    }
  }
  assert.equal(JSON.stringify(m),before,"Projection must never mutate source model");
});
test("Schola is read only from independent projector; never synchronized to card position",()=>{
  const m=model65(),i=17;
  const t=projectLiveHandoffTimeline({gate:gate(m,i),model:m,
    nativeState:native(i),scholaState:{
      trackId:"INDEPENDENT_SCHOLA_TRACK",segmentIndex:99,composedWorkId:null
    }});
  const s=liveHandoffLaneAt(t,"SCHOLA");
  assert.equal(s.status,"INDEPENDENT");
  assert.equal(s.location,null);
  assert.equal(s.cardClockOnly,false);
  assert.equal(s.observedPerformance,false);
  assert.equal(s.source,"NATIVE_SCHOLA_PROJECTOR");
  assert.equal(liveHandoffLaneAt(t,"ORGAN").status,"REVIEW_HOLD");
  assert.equal(liveHandoffLaneAt(t,"MINISTERS").status,"REVIEW_HOLD");
});
test("cue provenance guards priest, posture, and bell — no card-only behavior",()=>{
  const m=model65(),i=26,g=gate(m,i);
  const t=projectLiveHandoffTimeline({gate:g,model:m,nativeState:native(i,{
    bell:{label:"source bell cue",owner:"NATIVE_CANON_EVENT"}
  })});
  assert.equal(liveHandoffLaneAt(t,"BELLS").status,"SOURCE_CUE");
  assert.match(liveHandoffLaneAt(t,"BELLS").text,/not detected ringing/);
  assert.equal(liveHandoffLaneAt(t,"BELLS").location,i);
  const mismatched=projectLiveHandoffTimeline({gate:g,model:m,
    nativeState:native(i,{nativeCueId:"AO.SM.C0275"})});
  for(const id of ["PRIEST","BELLS","FAITHFUL"]){
    assert.equal(liveHandoffLaneAt(mismatched,id).location,null,id);
  }
  const disabled=projectLiveHandoffTimeline({gate:g,model:m,
    nativeState:native(i,{cueProjectionSupported:false})});
  assert.equal(liveHandoffLaneAt(disabled,"PRIEST").status,"PENDING");
});
test("source drift, inserted cards and bad map ordering all fail closed",()=>{
  const m=model65(),g=gate(m,0);
  assert.equal(projectLiveHandoffTimeline({
    gate:{...g,ok:false},model:m,nativeState:native(0)
  }).ok,false);
  assert.equal(projectLiveHandoffTimeline({
    gate:g,model:{cards:m.cards.slice(0,-1)},nativeState:native(0)
  }).ok,false);
  const drift={...g,crosswalk:{...g.crosswalk,
    mappings:[...g.crosswalk.mappings].reverse()}};
  const bad=projectLiveHandoffTimeline({gate:drift,model:m,nativeState:native(0)});
  assert.equal(bad.ok,false);
  assert.equal(bad.reason,"SOURCE_SEQUENCE_DRIFT");
  assert.equal(projectLiveHandoffWheel(bad).ok,false);
});
test("wheel is 65 source-native segments, not a duration clock or synthesized meaning",()=>{
  const m=model65(),i=34,t=projectLiveHandoffTimeline({
    gate:gate(m,i),model:m,nativeState:native(i)});
  const wheel=projectLiveHandoffWheel(t);
  assert.equal(wheel.ok,true);
  assert.equal(wheel.segments.length,65);
  assert.equal(wheel.segments.filter(x=>x.current).length,1);
  assert.equal(wheel.current.sequence,i+1);
  assert.equal(wheel.meaning,null);
  assert.equal(wheel.meaningStatus,"EDITORIAL_REVIEW_PENDING_NO_SYNTHETIC_MEANING");
  assert.equal(wheel.isDurationClock,false);
  assert.equal(wheel.scholaProgressIndependent,true);
  assert.equal(wheel.segments[0].startAngle,0);
  assert.equal(wheel.segments.at(-1).endAngle,360);
  const markup=renderLiveHandoffWheelHtml(wheel);
  assert.equal((markup.match(/class="ao-lb-d-sector"/g)||[]).length,65);
  assert.match(markup,/Source-backed card · not a timer/);
  assert.match(markup,/Words of Consecration/);
  assert.doesNotMatch(markup,/duration|minutes remaining|sync.*chant/i);
});
test("lane readout shows all six named lanes and never gives choir card pointer",()=>{
  const m=model65(),i=7,t=projectLiveHandoffTimeline({
    gate:gate(m,i),model:m,nativeState:native(i),
    scholaState:{trackId:"REAL_INDEPENDENT_TRACK"}});
  const html=renderLiveHandoffTimelineHtml(t);
  assert.equal((html.match(/class="ao-lb-d-lane" /g)||[]).length,6);
  assert.equal((html.match(/data-source-mark="true"/g)||[]).length,2);
  assert.match(html,/Schola, organ and ministers are not synchronized/);
  assert.match(html,/cards, not minutes/);
  assert.match(html,/data-lane="SCHOLA"/);
  const scholaRow=html.split('data-lane="SCHOLA"')[1].split('</div></div>')[0];
  assert.doesNotMatch(scholaRow,/data-source-mark="true"/);
});
test("native title and source lane strings are escaped, not injected as HTML",()=>{
  const m=model65(),i=10,g=gate(m,i);
  g.crosswalk.mappings[i]={...g.crosswalk.mappings[i],
    nativeTitle:'<script>alert("wrong")</script>'};
  g.reference=g.crosswalk.mappings[i];
  const t=projectLiveHandoffTimeline({gate:g,model:m,nativeState:native(i)});
  const html=renderLiveHandoffWheelHtml(projectLiveHandoffWheel(t));
  assert.doesNotMatch(html,/<script>/);
  assert.match(html,/&lt;script&gt;/);
});
test("existing rail, native 65 source and Schola are untouched",()=>{
  const band=readFileSync(new URL("../src/mass/reader-live-handoff-band.js",import.meta.url),"utf8");
  const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
  assert.match(band,/projectLiveHandoffTimeline\(\{gate:result,nativeState,/);
  assert.match(band,/scholaState:preview\.getScholaState\?\.\(\),model/);
  assert.match(band,/projectLiveHandoffWheel\(timeline\)/);
  assert.match(band,/PREVIEW_NOT_REQUESTED/);
  assert.match(dom,/ao-rail-left/);
  assert.match(dom,/ao-rail-right/);
  assert.doesNotMatch(band,/advanceSchola\(|setSchola\(|nextSchola\(/);
});
