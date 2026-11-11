import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectLiveHandoffStatusSigns} from "../src/mass/reader-live-handoff-status-signs.js";
import {claudeHandoffFig} from "../src/mass/reader-live-handoff-claude-figs.js";
import {renderClaudeNativeSanctuary,renderClaudeNativeRouteOverlay}
  from "../src/mass/reader-live-handoff-claude-sanctuary.js";
import {LIVE_HANDOFF_SOURCE_POINTS,projectLiveHandoffPlanPosition}
  from "../src/mass/reader-live-handoff-geometry.js";
import {projectLiveHandoffIncensationPreview,clampLiveHandoffRouteStep}
  from "../src/mass/reader-live-handoff-routes.js";

const scene=(opts={})=>({
 status:"SOURCE_STATION_REFERENCE",
 priest:{station:"CENTER",facing:"LITURGICAL_EAST",pose:"stand",positionReferenceCueId:"AO.SM.C0022"},
 faithful:{posture:"STAND"},
 server:{station:"FOOT",scope:"REFERENCE_PRESENCE_ONLY"},
 form:"MISSA_CANTATA_INCENSE",colour:"GREEN",candles:6,requiem:false,
 ...opts
});
test("Claude's original parametric side-view figures replace generic ellipses",()=>{
 const priest=claudeHandoffFig("priest","stand","#3f8a55",{x:3,y:7,s:.74});
 assert.match(priest,/M-11,-78 Q2,-82 12,-78/);
 assert.match(priest,/M-14,-31 Q3,-26 17,-31/);
 assert.match(priest,/circle cx="3" cy="-88" r="8.6"/);
 assert.match(priest,/stroke="#d4b16a"/);
 assert.match(priest,/translate\(3 7\) scale\(0\.74 0\.74\)/);
 for(const pose of ["stand","bow","kneel","genuflect","elevate","host","seated","orans"]){
  const svg=claudeHandoffFig("priest",pose,"#3f8a55");
  assert.match(svg,/<g transform=/,pose);
  assert.match(svg,/<path d=/,pose);
 }
 const server=claudeHandoffFig("server","kneel","#fff",{x:1,y:2});
 assert.match(server,/fill="#f5f2ea"/);
});
test("exact Claude final sanctuary geometry, orientation, original floor paths",()=>{
 const p=renderClaudeNativeSanctuary(scene());
 assert.match(p,/class="ao-lb-plan ao-lb-sanctuary-plan ao-claude-original-plan"/);
 assert.match(p,/translate\(525 0\) rotate\(90\) translate\(300 0\) scale\(\.86 \.87\) translate\(-300 0\)/);
 assert.match(p,/pattern id="st4"/);
 assert.match(p,/pattern id="nv4"/);
 assert.match(p,/x="40" y="0" width="520" height="296"/);
 assert.match(p,/x1="60" y1="296" x2="284" y2="296"/);
 assert.match(p,/x1="316" y1="296" x2="540" y2="296"/);
 assert.match(p,/x="486" y="140" width="30" height="72"/);
 assert.match(p,/x="110" y="212" width="42" height="34"/);
 assert.match(p,/class="schola"/);
 assert.match(p,/class="ppl"/);
 assert.match(p,/fill="#4a3829"/);
 assert.match(p,/x="108" y="488" width="48" height="20"/);
 assert.doesNotMatch(p,/>EAST<|>GOSPEL<|>EPISTLE<|>PRIEST<|>YOU<|>STAND<|stroke-dasharray/);
 const pos=projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.CENTER);
 assert.ok(p.includes("translate("+pos.x+" "+(pos.y+12)+")"));
});
test("form-dependent candles and Requiem frontal/veil preserve supplied geometry",()=>{
 const low=renderClaudeNativeSanctuary(scene({form:"LOW",candles:2}));
 const sung=renderClaudeNativeSanctuary(scene({candles:6}));
 assert.equal((low.match(/fill="#ffe9a8"/g)||[]).length,2);
 assert.equal((sung.match(/fill="#ffe9a8"/g)||[]).length,6);
 const req=renderClaudeNativeSanctuary(scene({colour:"BLACK",requiem:true,candles:6}));
 assert.match(req,/width="32" height="26" rx="3" fill="#6b4ea3"/);
 assert.match(req,/width="248" height="16" fill="#151515"/);
 assert.doesNotMatch(req,/>Blessing<|>PRIEST</);
});
test("architecture remains with unknown clergy; cannot infer observed movement",()=>{
 const p=renderClaudeNativeSanctuary(scene({priest:null,faithful:null,server:null}));
 assert.match(p,/ao-claude-architecture/);
 assert.equal((p.match(/M-11,-78 Q2,-82 12,-78/g)||[]).length,0);
 assert.equal(renderClaudeNativeSanctuary(null),"");
});
test("manual incense overlay renders Claude's supplied priest, not old silhouette",()=>{
 const cue="AO.SM.C0122";
 const gate={ok:true,reference:{evidence:{sourceCueIds:[cue]}}};
 const prepared={session:{resolvedMass:{form:"SOLEMN",conditions:[],
   proper:{data:{liturgicalColour:"GREEN"}}}}};
 const route=projectLiveHandoffIncensationPreview({
   gate,nativeState:{nativeCueId:cue,cueProjectionSupported:true},prepared
 });
 assert.equal(route.ok,true);
 const svg=renderClaudeNativeRouteOverlay({scene:scene(),route,
   step:clampLiveHandoffRouteStep(route,0)});
 assert.match(svg,/REFERENCE_ONLY_NOT_OBSERVED/);
 assert.match(svg,/M-11,-78 Q2,-82 12,-78/);
 assert.match(svg,/data-lb-route-actor/);
 assert.match(svg,/data-lb-route-next/);
 assert.doesNotMatch(svg,/>PRIEST<|<text\b/);
});
test("mounted band calls the direct original renderer and keeps native source ownership",()=>{
 const source=readFileSync(new URL("../src/mass/reader-live-handoff-band.js",import.meta.url),"utf8");
 assert.match(source,/renderClaudeNativeSanctuary\(scene\)/);
 assert.match(source,/renderClaudeNativeRouteOverlay\(\{/);
 assert.match(source,/projectLiveHandoffSanctuary\(\{gate:result,nativeState,prepared\}\)/);
 assert.match(source,/PREVIEW_NOT_REQUESTED/);
 assert.doesNotMatch(source,/setScholaProgress\(|setInterval\(/);
});

test("expected sanctuary signs require the exact current source cue and actor",()=>{
 const cue="AO.SM.C0054";
 const gate={ok:true,reference:{status:"MATCHED_SOURCE_CARD",
   nativeCardId:"AO.LIVECURATED.AO.CARD.003.1",
   expectedNativeId:"AO.LIVECURATED.AO.CARD.003.1",
   evidence:{sourceCueIds:[cue]}}};
 const nativeState={
   nativeCueId:cue,cueProjectionSupported:true,
   priestVoice:{value:"SUNG / CLEAR",owner:"R17_CUE_SOURCE",cueId:cue},
   response:{label:"Et cum spiritu tuo",text:"Et cum spiritu tuo",cueId:cue},
   bell:{label:"SOURCE BELL CUE",cueId:cue},
   ownership:{priestVoice:"R17_CUE_NATIVE_RUN",response:"R17_CUE_NATIVE",
     bell:"R17_EXACT_SOURCE_CUE"}
 };
 const opts={gate,nativeState,priest:{station:"CENTER"},
   server:{station:"FOOT"},form:"MISSA_CANTATA_INCENSE"};
 const marked=projectLiveHandoffStatusSigns(opts);
 assert.deepEqual([marked.priest,marked.response,marked.bell],
   ["SUNG",true,true]);
 assert.equal(marked.schola,false);
 assert.equal(marked.organ,false);
 assert.equal(marked.observedSound,false);
 const svg=renderClaudeNativeSanctuary(scene({signs:marked}));
 for(const kind of ["priest","response","bell"])
   assert.match(svg,new RegExp('data-live-status="'+kind+'"'));
 assert.match(svg,/Expected source bell cue, not detected ringing/);
 assert.doesNotMatch(svg,/data-live-status="schola"|data-live-status="organ"|>PRIEST<|>YOU</);
 const cueChanged=projectLiveHandoffStatusSigns({
   ...opts,nativeState:{...nativeState,nativeCueId:"AO.SM.C0055"}
 });
 assert.equal(cueChanged.priest,null);
 assert.equal(cueChanged.response,false);
 assert.equal(cueChanged.bell,false);
 assert.doesNotMatch(renderClaudeNativeSanctuary(scene({signs:cueChanged})),
   /data-live-status=/);
 const missingActor=projectLiveHandoffStatusSigns({...opts,priest:null,server:null});
 assert.equal(missingActor.priest,null);
 assert.equal(missingActor.bell,false);
});
test("private, spoken and held priest voice statuses do not invent audible events",()=>{
 const cue="AO.SM.C0110";
 const gate={ok:true,reference:{status:"MATCHED_SOURCE_CARD",
  nativeCardId:"NATIVE-1",expectedNativeId:"NATIVE-1",
  evidence:{sourceCueIds:[cue]}}};
 const common={gate,priest:{station:"CENTER"},server:{station:"FOOT"},
   form:"MISSA_CANTATA_SIMPLE"};
 const nativeState={nativeCueId:cue,cueProjectionSupported:true,
   priestVoice:{value:"SECRET / QUIET",cueId:cue,owner:"R17_CUE_SOURCE"},
   bell:{cueId:cue,label:"Warning bell",suppressed:true},
   ownership:{priestVoice:"R17_CUE_NATIVE_RUN",bell:"R17_EXACT_SOURCE_CUE"}};
 assert.equal(projectLiveHandoffStatusSigns({...common,nativeState}).priest,"QUIET");
 assert.equal(projectLiveHandoffStatusSigns({...common,nativeState}).bell,false);
 assert.equal(projectLiveHandoffStatusSigns({...common,nativeState:{
   ...nativeState,priestVoice:{...nativeState.priestVoice,value:"CLEAR SPOKEN"}
 }}).priest,"ALOUD");
 assert.equal(projectLiveHandoffStatusSigns({...common,nativeState:{
   ...nativeState,priestVoice:{...nativeState.priestVoice,value:"QUIET PRIEST TRACK"}
 }}).priest,null);
 assert.equal(projectLiveHandoffStatusSigns({...common,nativeState:{
   ...nativeState,ownership:{priestVoice:"PRIEST_VOICE_UNOBSERVED_FAIL_CLOSED"}
 }}).priest,null);
 assert.equal(projectLiveHandoffStatusSigns({...common,nativeState:{
   ...nativeState,cueProjectionSupported:false
 }}).source,"NO_VERIFIED_CURRENT_SOURCE_CUE");
 assert.equal(projectLiveHandoffStatusSigns({...common,nativeState:{
   ...nativeState,priestVoice:{...nativeState.priestVoice,value:"SUNG / CLEAR"}
 },form:"LOW"}).priest,null);
});
