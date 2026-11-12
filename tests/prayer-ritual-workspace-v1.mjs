import assert from "node:assert/strict";
import {test} from "node:test";
import {RITUAL_VIEW_MODES,RITUAL_DEFAULT_RATIOS,ritualRatio,ritualModeIndex,nextRitualMode,PRAYER_RITUAL_WORKSPACE_VERSION}
  from "../src/pray/prayer-ritual-workspace.js";
import {prayerCeremonialSceneState,renderPrayerCeremonialScene}
  from "../src/pray/prayer-ceremonial-stage.v1.js";

test("three view presets never change source step or liturgical state",()=>{
 assert.equal(PRAYER_RITUAL_WORKSPACE_VERSION,"prayer-ritual-workspace-v1");
 assert.deepEqual(RITUAL_VIEW_MODES,["scene","both","text"]);
 assert.equal(nextRitualMode("both",1),"text");
 assert.equal(nextRitualMode("both",-1),"scene");
 assert.equal(nextRitualMode("scene",-1),"scene");
 assert.equal(nextRitualMode("text",1),"text");
 assert.equal(ritualModeIndex("unrecognised"),0);
 assert.equal(ritualRatio(RITUAL_DEFAULT_RATIOS.both),.39);
 assert.equal(ritualRatio(.457),.457,"manual panel split must not snap to a preset");
 assert.equal(ritualRatio(-1),.12);
 assert.equal(ritualRatio(2),.72);
});
test("Tenebrae Office can display visual atmosphere without a candle rite",()=>{
 const scene=prayerCeremonialSceneState({kind:"tenebrae-office",stage:"LAUDS"});
 assert.equal(scene.phase,"lauds");
 assert.equal(scene.candleCount,0);
 assert.equal(scene.autoAdvancement,false);
 assert.equal(scene.observedNow,false);
 const html=renderPrayerCeremonialScene(scene,{french:true});
 assert.match(html,/data-ao-scene-kind="tenebrae-office"/);
 assert.doesNotMatch(html,/data-ao-candle-index/);
});
test("Ceremonial candle scene remains gated by local observed actions",()=>{
 assert.equal(prayerCeremonialSceneState({kind:"tenebrae",ceremony:{enabled:false}}),null);
 const scene=prayerCeremonialSceneState({kind:"tenebrae",ceremony:{enabled:true,extinguished:5}});
 assert.equal(scene.extinguished,5);
 assert.equal(scene.customaryOnly,true);
 assert.equal(scene.autoAdvancement,false);
 assert.equal((renderPrayerCeremonialScene(scene).match(/data-ao-candle-index=/g)||[]).length,15);
});
