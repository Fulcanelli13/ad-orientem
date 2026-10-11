import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 ROSARY_CINEMATIC_VERSION,ROSARY_MYSTERY_SETS,ROSARY_CINEMATIC_SHOTS,
 rosaryCinematicMilestones,rosaryCinematicCurrent,rosaryCinematicArtSource,syncRosaryCinematic
} from "../src/pray/rosary-cinematic.js";
import {ROSARY_MYSTERY_CONTEXT_V1} from "../src/pray/rosary-mystery-context.v1.js";
import {ROSARY_SCRIPTURE_REFERENCE_V1} from "../src/pray/rosary-scripture-policy.js";

assert.equal(ROSARY_CINEMATIC_VERSION,"rosary-cinematic-v1");
assert.deepEqual(Object.keys(ROSARY_MYSTERY_SETS),["joyful","sorrowful","glorious","luminous"]);
assert.equal(Object.values(ROSARY_MYSTERY_SETS).flat().length,20);
assert.equal(Object.values(ROSARY_MYSTERY_SETS).flat().filter(x=>!x[0].startsWith("lum")).length,15);
for(const [set,defs] of Object.entries(ROSARY_MYSTERY_SETS)){
 assert.equal(defs.length,5,set+" must have five named milestones");
 assert.equal(new Set(defs.map(x=>x[0])).size,5,set+" duplicate ids");
 assert.equal(ROSARY_CINEMATIC_SHOTS[set].length,5);
 for(const [id,en,fr] of defs){
  assert.ok(ROSARY_MYSTERY_CONTEXT_V1[id],"No contextual meditation: "+id);
  assert.ok(ROSARY_SCRIPTURE_REFERENCE_V1[id],"No Catholic reading witness: "+id);
  assert.ok(en.length>5&&fr.length>5,"Bilingual title missing");
 }
 const steps=[
  {kind:"opening",mi:null},
  ...defs.flatMap((d,mi)=>[
   {kind:"mystery",mi,key:"mystery"},
   {kind:"prayer",mi,bead:0,key:"pater"},
   ...Array.from({length:10},(_,i)=>({kind:"bead",mi,bead:i+1,key:"ave"})),
   {kind:"prayer",mi,key:"gloria"}]),
  {kind:"closing",mi:null}
 ];
 const milestones=rosaryCinematicMilestones(steps,set);
 assert.equal(milestones.length,5);
 assert.ok(milestones.every((m,i)=>m.id===defs[i][0]&&steps[m.index].kind==="mystery"));
 assert.ok(milestones.every((m,i)=>m.index===1+i*13),"Rosary jump target must be mystery opening, never a mid-decade bead");
 assert.deepEqual(rosaryCinematicCurrent({set,mi:2}),{set,mi:2,id:defs[2][0]});
 assert.equal(rosaryCinematicCurrent({set,mi:null}),null);
 assert.equal(rosaryCinematicCurrent({set,mi:5}),null);
 assert.equal(rosaryCinematicCurrent({set,mi:-1}),null);
}
assert.deepEqual(rosaryCinematicMilestones([],"joyful").map(x=>x.index),[-1,-1,-1,-1,-1]);
assert.deepEqual(rosaryCinematicMilestones([],"other"),[]);
assert.equal(rosaryCinematicCurrent({set:"other",mi:0}),null);
assert.equal(rosaryCinematicArtSource(null,{set:"joyful",mi:0}),"");
assert.equal(syncRosaryCinematic({root:null,info:null,win:{document:null}}),false);
const module=readFileSync("src/pray/rosary-cinematic.js","utf8");
const styles=readFileSync("src/pray/rosary-cinematic-styles.js","utf8");
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(runtime,/import \{ syncRosaryCinematic \} from "\.\/rosary-cinematic\.js"/);
assert.match(runtime,/const cinema=syncRosaryCinematic\(\{root:r,info,win:window,language:lang\(\),onJump:target=>/);
assert.match(runtime,/if\(!cinema\)rosaryDonorMysteryFx\(r,info\)/);
assert.match(module,/host\.__aoRosaryCinemaOnJump\(target\)/,"Canonical Rosary player must own every jump");
assert.match(module,/win\.addEventListener\("click",event=>/,"Milestone delegation must run at capture layer");
assert.match(module,/event\.stopPropagation\(\)/,"Milestone clicks must not fall into competing donor handlers");
assert.doesNotMatch(module,/localStorage|sessionStorage|setInterval|class RosaryState/,"Cinema must never own Rosary persistence or invent a bead state");
assert.match(module,/step\?\.kind==="mystery"/,"Milestone targets must open mysteries");
assert.match(module,/image\?\.currentSrc/,"Scene must reuse existing owner-selected artwork");
assert.match(module,/reduceMotion\(win\)/);
assert.match(styles,/prefers-reduced-motion:reduce/);
assert.match(styles,/aoRosaryCinemaTimeline/);
assert.doesNotMatch(styles,/\.lab-prayer-flip\s*\{display:none/,"Canonical prayer cards must remain visible");
console.log("PASS Rosary cinematic: 15 original + five optional, five canonical mystery milestones, no second prayer owner");
