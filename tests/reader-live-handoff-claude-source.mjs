import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
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
