import assert from "node:assert/strict";
import {rosaryNamedChapters} from "../src/pray/rosary-card-chapters.js";
import {ROSARY_R2_PILOT_SCHEMA,rosaryR2PilotEnabled,rosaryR2PositionModel}
 from "../src/pray/rosary-r2-pilot.js";

assert.equal(ROSARY_R2_PILOT_SCHEMA,"ao-rosary-r2-source-projection-v1");
assert.equal(rosaryR2PilotEnabled({location:{search:"?aoRosaryR2Pilot=1"}}),true);
assert.equal(rosaryR2PilotEnabled({location:{search:"?aoRosaryR2Pilot=0"}}),false);
assert.equal(rosaryR2PilotEnabled({location:{search:""}}),false);
const steps=[
 {kind:"opening",key:"sign"},
 {kind:"mystery",mi:0},
 {kind:"prayer",mi:0,key:"pater",bead:0},
 {kind:"prayer",mi:0,key:"ave",bead:1,cue:true},
 {kind:"prayer",mi:0,key:"ave",bead:2,cue:true},
 {kind:"prayer",mi:0,key:"gloria",bead:3},
 {kind:"mystery",mi:1},
 {kind:"prayer",mi:1,key:"ave",bead:1,cue:true},
 {kind:"closing",key:"salve"}
];
const untouched=JSON.stringify(steps);
const chapters=rosaryNamedChapters(steps,{titles:["Annunciation","Visitation"]});
assert.deepEqual(chapters.map(x=>x.id),["opening","mystery-1","mystery-2","conclusion"]);
const atBead=rosaryR2PositionModel(steps,4,chapters);
assert.equal(atBead.chapterTitle,"Annunciation");
assert.equal(atBead.cuePosition,2);
assert.equal(atBead.cueTotal,2);
assert.equal(atBead.cueLabel,"Bead 2 / 2");
assert.equal(rosaryR2PositionModel(steps,4,chapters,{french:true}).cueLabel,"Grain 2 / 2");
const atMystery=rosaryR2PositionModel(steps,1,chapters);
assert.equal(atMystery.cuePosition,null);
assert.equal(atMystery.chapterStart,1);
assert.equal(rosaryR2PositionModel(steps,8,chapters).chapterId,"conclusion");
assert.equal(rosaryR2PositionModel(steps,99,chapters),null);
assert.equal(rosaryR2PositionModel([],0,chapters),null);
assert.equal(JSON.stringify(steps),untouched,"R2 must not rewrite canonical steps");
console.log("PASS Claude Rosary R2 opt-in: canonical chapter and bead cue projection, no state mutation");
