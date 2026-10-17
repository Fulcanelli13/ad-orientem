import assert from "node:assert/strict";
import {divineMercySteps,mercyStepText} from "../src/pray/devotional-methods-v1.js";
import {mercyChapters} from "../src/pray/devotional-sequence-adapter.js";
import {mercyBeadNavigationModel} from "../src/pray/mercy-bead-navigation.js";
import {mercyBeadNavHTML} from "../src/pray/mercy-bead-presentation.js";
import {readFileSync} from "node:fs";

for(const withClosing of [false,true]){
 const steps=divineMercySteps({includeClosing:withClosing});
 assert.equal(steps.length,withClosing?63:62);
 const chapters=mercyChapters(steps);
 assert.equal(chapters.length,withClosing?8:7);
 const opening=mercyBeadNavigationModel(steps,0);
 assert.equal(opening.phase,"opening");
 assert.equal(opening.beads.length,0);
 assert.deepEqual(opening.decades.map(x=>x.start),[4,15,26,37,48]);
 assert.equal(opening.conclusion,59);
 assert.equal(mercyBeadNavHTML(steps,0).includes('class="aoMercyBeadButton"'),false);
 for(let d=1;d<=5;d++){
  const start=4+(d-1)*11;
  for(let bead=0;bead<=10;bead++){
   const pos=start+bead;
   const state=mercyBeadNavigationModel(steps,pos);
   assert.equal(state.phase,"decade");
   assert.equal(state.activeDecade,d);
   assert.equal(state.currentBead,bead);
   assert.equal(state.beads.length,11);
   assert.equal(state.beads[bead].step,pos);
   assert.equal(state.beads.filter(x=>x.status==="active").length,1);
   assert.equal(state.decades.filter(x=>x.status==="active").length,1);
   assert.equal(steps[pos].key,bead===0?"offering":"invocation");
   const html=mercyBeadNavHTML(steps,pos);
   assert.equal((html.match(/class="aoMercyBeadButton"/g)||[]).length,11);
   assert.equal((html.match(/class="aoMercyDecadeLink"/g)||[]).length,5);
   assert.ok(html.includes('data-p435930-mercy-jump="'+pos+'"'));
   assert.ok(mercyStepText(steps[pos],"en")?.length>25);
  }
 }
 const ending=mercyBeadNavigationModel(steps,59);
 assert.equal(ending.phase,"conclusion");
 assert.equal(ending.beads.length,0);
 if(withClosing)assert.equal(mercyBeadNavigationModel(steps,62).phase,"conclusion");
 const french=mercyBeadNavigationModel(steps,15,{french:true});
 assert.match(french.caption,/Dizaine II/);
 assert.match(mercyBeadNavHTML(steps,15,{french:true}),/Gros grain/);
}
assert.throws(()=>mercyBeadNavigationModel([],0),RangeError);
assert.throws(()=>mercyBeadNavigationModel(divineMercySteps(),80),RangeError);
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
const styles=readFileSync("src/pray/devotional-methods-styles.js","utf8");
assert.ok(runtime.includes("mercyBeadNavHTML(steps,index,{french:fr})"));
assert.ok(runtime.includes("updateMercyBeadNav(m,steps,i,{french:isFr()})"));
assert.ok(runtime.includes("data-p435930-mercy-jump"));
assert.ok(styles.includes(".aoMercyBeadButton[data-status=active]"));
assert.ok(styles.includes(".aoDevoSequenceTimeline{display:none!important}"));
console.log("PASS Divine Mercy: 62/63 canonical steps, five large beads, fifty small beads, seven/eight chapters, Latin-free EN/FR visual navigation, no replacement owner");
