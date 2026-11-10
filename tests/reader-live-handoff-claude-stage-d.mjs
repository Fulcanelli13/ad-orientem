import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {claudeWheelRender,claudeTimelineRender} from "../src/mass/reader-live-handoff-claude-stage-d.js";
import {CLAUDE_HANDOFF_DRAFT_MEANINGS,CLAUDE_HANDOFF_MEANINGS_STATUS}
 from "../src/mass/reader-live-handoff-claude-meanings.js";

const timeline={
 ok:true,position:10,total:65,
 current:{referenceId:"C10",sequence:10,title:"Collect"},
 cards:Array.from({length:65},(_,i)=>({
  referenceId:"C"+String(i+1).padStart(2,"0"),
  title:"Sample source "+(i+1),current:i===9,sequence:i+1
 })),
 lanes:[
  {id:"PRIEST",location:9,status:"SOURCE_REFERENCE",text:"AT CENTRE"},
  {id:"MINISTERS",location:null,status:"REVIEW_HOLD"},
  {id:"SCHOLA",location:null,status:"INDEPENDENT",text:"Independent Schola control"},
  {id:"ORGAN",location:null,status:"REVIEW_HOLD"},
  {id:"BELLS",location:null,status:"PENDING"},
  {id:"FAITHFUL",location:9,status:"PROFILE_REFERENCE",text:"KNEEL"}
 ]
};
const wheel={
 ok:true,total:65,current:timeline.current,
 segments:timeline.cards.map((c,i)=>({...c,position:i+1,visited:i<9,
  startAngle:360*i/65,endAngle:360*(i+1)/65}))
};
test("wheel uses Claude's original 600x600 three-ring arc math and white hand",()=>{
 const out=claudeWheelRender(wheel,timeline,{
   priestPosition:{station:"ALTAR_CENTER"}});
 assert.equal((out.match(/data-wheel-segment="/g)||[]).length,65);
 assert.match(out,/viewBox="-300 -300 600 600"/);
 assert.match(out,/A262,262/); // exact original outer-section radius
 assert.match(out,/A222,222/);
 assert.match(out,/x2="0" y2="-262"/);
 assert.match(out,/stroke="#fff" stroke-width="6"/);
 assert.match(out,/class="ao-claude-wheel-left"/);
 assert.match(out,/class="ao-claude-wheel-right"/);
 assert.match(out,/CLAUDE_ORIGINAL_MULTI_RING/);
 assert.doesNotMatch(out,/minutes remaining|elapsed|estimated duration|time left/i);
});
test("original icon row uses existing approved user assets, never a new icon family",()=>{
 const out=claudeWheelRender(wheel,timeline,{priestPosition:{station:"ALTAR_CENTER"}});
 assert.match(out,/review_posture_kneel\.svg/);
 assert.match(out,/study_priest_centre\.png/);
 assert.match(out,/class="ao-claude-icons"/);
 assert.match(out,/data-review="CLAUDE_MEANINGS_DRAFT_NOT_CERTIFIED"/);
});
test("Claude's exact 65-card draft meanings are retained as reference, not rubric",()=>{
 assert.equal(CLAUDE_HANDOFF_MEANINGS_STATUS,"OWNER_REFERENCE_DRAFT_NOT_THEOLOGICALLY_VERIFIED");
 assert.equal(Object.keys(CLAUDE_HANDOFF_DRAFT_MEANINGS).length,68);
 assert.match(CLAUDE_HANDOFF_DRAFT_MEANINGS["10"],/Collect gathers the prayers/);
 const out=claudeWheelRender(wheel,timeline);
 assert.match(out,/The Collect gathers the prayers of the people into one prayer of the Church/);
});
test("parallel timeline uses Claude's compact SVG blocks, source-cue holds and now line",()=>{
 const out=claudeTimelineRender(timeline,{span:8,width:320,height:230});
 assert.match(out,/viewBox="0 0 320 230"/);
 assert.match(out,/id="secR"/);
 assert.match(out,/data-native-lane="PRIEST"/);
 assert.match(out,/data-native-lane="MINISTERS"/);
 assert.match(out,/data-native-lane="SCHOLA"/);
 assert.match(out,/data-native-lane="ORGAN"/);
 assert.match(out,/data-native-lane="BELLS"/);
 assert.match(out,/data-native-lane="FAITHFUL"/);
 assert.equal((out.match(/data-native-lane=/g)||[]).length,6);
 assert.match(out,/fill="#fff" opacity=".9"/);
 assert.match(out,/data-claude-zoom="-1"/);
 assert.match(out,/data-claude-zoom="1"/);
 assert.match(out,/CLAUDE_ORIGINAL_SIX_LANES/);
 assert.doesNotMatch(out,/Schola.*data-current|setSchola|minutes remaining/i);
});
test("original-layout timeline refuses to synthesize a clock without exact source",()=>{
 assert.match(claudeTimelineRender({ok:false}),/Native 65-card source required/);
 assert.match(claudeWheelRender({ok:false},timeline),/Native 65-card source required/);
});
test("opt-in reader uses source-derived Plan, zoomable timeline, meaningful wheel",()=>{
 const band=readFileSync(new URL("../src/mass/reader-live-handoff-band.js",import.meta.url),"utf8");
 assert.match(band,/renderClaudeNativeSanctuary\(scene\)/);
 assert.match(band,/claudeTimelineRender\(timeline,\{span:claudeZoomSpan/);
 assert.match(band,/claudeWheelRender\(wheel,timeline,nativeState\)/);
 assert.match(band,/timelineHost\.addEventListener\("click"/);
 assert.match(band,/PREVIEW_NOT_REQUESTED/);
});
