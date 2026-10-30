import assert from "node:assert/strict";
import {FIVE_WOUNDS_CHAPLET_V1} from "../src/pray/five-wounds-chaplet.v1.js";
import {PRECIOUS_BLOOD_MYSTERIES_V1,PRECIOUS_BLOOD_TOTALS_V1} from "../src/pray/precious-blood-chaplet.v1.js";
import {LITTLE_CROWN_B30_BEADS} from "../src/pray/little-crown-b30.js";
import {F07_VARIANT_SCHEMA,renderF07FiveWounds,renderF07PreciousBlood,renderF07LittleCrown} from "../src/pray/chaplet-f07-variants.js";
assert.equal(F07_VARIANT_SCHEMA,"ao-f07-variants-source-projection-v1");
const count=(s,pattern)=>(s.match(pattern)||[]).length;
assert.equal(FIVE_WOUNDS_CHAPLET_V1.length,30);
assert.equal(PRECIOUS_BLOOD_TOTALS_V1.pater,33);
assert.equal(PRECIOUS_BLOOD_MYSTERIES_V1.length,7);
assert.equal(LITTLE_CROWN_B30_BEADS.length,15);
for(const language of [false,true]){
 for(const i of [0,4,5,6,24,29]){
  const html=renderF07FiveWounds(i,{french:language});
  assert.equal(count(html,/class="aoF07VariantDot /g),30);
  assert.equal(count(html,/data-f07-status="current"/g),1);
  assert.match(html,new RegExp('data-f07-position="'+i+'" data-f07-total="30"'));
  assert.equal(count(html,/data-f07-group=/g),5);
  assert.equal(count(html,/aoF07VariantDot-gloria/g),25);
  assert.equal(count(html,/aoF07VariantDot-ave/g),5);
 }
 for(const [phase,bead] of [[0,0],[1,0],[1,4],[1,5],[1,6],[7,2],[7,3],[7,4],[8,0]]){
  const html=renderF07PreciousBlood(phase,bead,{french:language});
  assert.equal(count(html,/class="aoF07VariantDot /g),47,"33 Our Fathers, 7 Gloria and 7 responses");
  assert.equal(count(html,/aoF07VariantDot-pater/g),33);
  assert.equal(count(html,/aoF07VariantDot-gloria/g),7);
  assert.equal(count(html,/aoF07VariantDot-response/g),7);
  assert.equal(count(html,/data-f07-group=/g),7);
  assert.equal(count(html,/data-f07-status="current"/g),phase>=1&&phase<=7?1:0);
  assert.match(html,new RegExp('data-f07-phase="'+phase+'"'));
 }
 for(const i of [0,2,3,7,14]){
  const html=renderF07LittleCrown(i,{french:language});
  assert.equal(count(html,/class="aoF07CrownMarker /g),15,"fifteen source beads arranged in a circle");
  assert.equal(count(html,/aoF07CrownMarker-pater/g),3);
  assert.equal(count(html,/aoF07CrownMarker-ave/g),12);
  assert.equal(count(html,/data-f07-status="current"/g),1);
  assert.match(html, /class="aoF07LittleCrownCircle"/);
  assert.match(html,/role="progressbar" aria-valuemin="0" aria-valuemax="15"/);
  assert.doesNotMatch(html,/aoF07VariantDots|CHAPLET POSITION|REPÈRE DU CHAPELET/);
  assert.match(html,new RegExp('data-f07-position="'+i+'" data-f07-total="15"'));
 }
}
assert.throws(()=>renderF07FiveWounds(30),RangeError);
assert.throws(()=>renderF07PreciousBlood(7,5),RangeError);
assert.throws(()=>renderF07LittleCrown(15),RangeError);
const sourceOwnedBeads=Array.from({length:15},(_,i)=>'<button class="aoF07LittleCrownBead" data-canonical-bead="'+i+'"></button>').join("");
const interactiveProjection=renderF07LittleCrown(3,{interactiveBeads:sourceOwnedBeads});
assert.equal(count(interactiveProjection,/data-canonical-bead="/g),15);
assert.equal(count(interactiveProjection,/aoF07CrownMarker/g),0,"no duplicate decorative bead ring");
assert.match(interactiveProjection,/data-f07-position="3" data-f07-total="15"/);
for(const fn of [()=>renderF07FiveWounds(0),()=>renderF07PreciousBlood(0,0),()=>renderF07LittleCrown(0)]){
 const html=fn();
 assert.doesNotMatch(html,/data-p435930|localStorage|data-prayed|data-completed|data-navigation-owner/,
  "F07 is a read-only source position projection and cannot become a second engine");
}
console.log("PASS F07 chaplet variants: 30 Five Wounds, 33+7+7 Precious Blood, Little Crown 15 circular 3+12 source positions; no parallel event ownership");
