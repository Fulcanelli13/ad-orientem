import assert from "node:assert/strict";
import {test} from "node:test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {ESSENTIAL_HOLY_CARD_IDS_V1,essentialHolyCardParts}
 from "../src/pray/essential-holy-card-parts.js";

const expected=Object.freeze({
 foundations_sign_of_cross:1,
 foundations_our_father:6,
 foundations_hail_mary:3,
 foundations_glory_be:2,
 foundations_apostles_creed:9
});

test("F01: five certified cards remain byte-exact in EN FR Latin",()=>{
 assert.equal(ESSENTIAL_HOLY_CARD_IDS_V1.length,5);
 for(const id of ESSENTIAL_HOLY_CARD_IDS_V1){
  const record=PRAY_CANONICAL_DATA_V435930.prayers[id];
  assert.ok(record,id+" source missing");
  for(const language of ["en","fr","la"]){
   const original=record[language];
   assert.ok(original,id+" "+language+" face missing");
   const parts=essentialHolyCardParts(id,language,original);
   assert.ok(parts,id+" "+language+" segmentation missing");
   assert.equal(parts.length,expected[id],id+" "+language+" beat count");
   assert.equal(parts.map(part=>part.text).join(""),original,
    id+" "+language+" must reconstruct the exact source");
   assert.ok(parts.every(part=>part.text.trim().length>0&&!part.uncertified),
    id+" "+language+" may not silently invent a break");
   assert.ok(parts.every(part=>!/[℣℟]/.test(part.text)||/[℣℟]/.test(original)),
    "No V/R invented");
   parts.forEach((part,index)=>{
    assert.equal(part.collective,id==="foundations_hail_mary"&&index===2,
      id+" "+language+" group highlight should not be a permanent mute");
   });
  }
 }
});

test("F01: changed historical witness fails closed to one unaltered paragraph",()=>{
 const id="foundations_hail_mary",source="Unrecognised alternative complete witness.";
 const parts=essentialHolyCardParts(id,"en",source);
 assert.equal(parts.length,1);
 assert.equal(parts[0].text,source);
 assert.equal(parts[0].uncertified,true);
 assert.equal(essentialHolyCardParts("not-a-card","en",source),null);
});
