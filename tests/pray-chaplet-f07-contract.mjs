import assert from "node:assert/strict";
import {divineMercySteps} from "../src/pray/devotional-methods-v1.js";
import {chapletF07PilotEnabled,renderMercyF07Crown,CHAPLET_F07_PILOT_SCHEMA,mercyF07RoleLines,mercyF07RoleMarkup} from "../src/pray/chaplet-f07-pilot.js";
assert.equal(CHAPLET_F07_PILOT_SCHEMA,"ao-chaplet-f07-crown-v1");
for(const [search,expected] of [["",false],["?aoChapletF07Pilot=1",true],["?aoChapletF07Pilot=0",false],["?aoPrayerPilot=1",false]])
 assert.equal(chapletF07PilotEnabled({location:{search}}),expected);
for(const closing of [false,true]){
 const steps=divineMercySteps({includeClosing:closing});
 for(const index of [0,4,12,steps.length-1]){
  const english=renderMercyF07Crown(steps,index,{french:false});
  const french=renderMercyF07Crown(steps,index,{french:true});
  for(const markup of [english,french]){
   assert.equal((markup.match(/class="aoF07Bead /g)||[]).length,55,"All five full canonical decades are visualized");
   assert.equal((markup.match(/aoF07Bead-active/g)||[]).length,index>=4&&index<59?1:0,
    "Only the current canonical bead is highlighted; opening/closing do not fabricate bead status");
   assert.match(markup,new RegExp('data-position="'+index+'" data-total="'+steps.length+'"'));
   assert.doesNotMatch(markup,/data-p435930-mercy-jump|data-completed|localStorage|data-prayed=/,
    "Crown is a read-only visual; canonical navigation and persistence remain external");
  }
 }
}
// The Claude ℣ / ℟ split is a typographic grouping of the original
// prayer, never a source translation or an added text/event.
for(const closing of [false,true]){
 const steps=divineMercySteps({includeClosing:closing});
 assert.equal(steps.length,closing?63:62);
 for(const i of [4,5,59,60,61]){
  for(const lang of ["en","fr"]){
   const role=mercyF07RoleLines(steps[i],lang);
   assert.ok(role?.parts,"historically sourced bead still admits two reading clauses "+i+" "+lang);
   assert.equal(role.parts.join(""),role.text,"no prayer text may be dropped by ℣/℟");
   const html=mercyF07RoleMarkup(steps[i],lang,{group:true});
   assert.match(html,/aoF07MercyRole-Response/);
   assert.match(html,/data-f07-group="with-others"/);
   assert.match(html,lang==="en"?/ALL/:/TOUS/);
  }
 }
 for(const i of [0,1,2,3]){
  const role=mercyF07RoleLines(steps[i],"en");
  assert.equal(role.parts,null,"opening prayers have no invented response role");
 }
}
assert.throws(()=>renderMercyF07Crown([],0),RangeError);
console.log("PASS F07: 55 source-backed beads, 62/63 optional conclusion, opt-in crown and no parallel state owner");
