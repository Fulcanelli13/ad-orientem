import assert from "node:assert/strict";
import { CSE_QUESTIONS, CSE_SOURCE_MAP } from "../src/learn/sexual-ethics-data/index.js";
import { cseSourceTargets } from "../src/learn/sexual-ethics-data/source-targets.js";

const scriptureRows=CSE_QUESTIONS.flatMap(item=>item.refs
  .filter(([id])=>id==="SCR").map(([,locator])=>({question:item.id,locator})));
assert.equal(scriptureRows.length,15,"Unexpected change to the 150-question Scripture-citation inventory");

let chapterCount=0;
for(const row of scriptureRows){
  for(const french of [false,true]){
    const targets=cseSourceTargets("SCR",row.locator,CSE_SOURCE_MAP.SCR,{french});
    const parts=row.locator.split(";").map(s=>s.trim());
    assert.equal(targets.length,parts.length,row.question+" lost a Scripture passage");
    assert.deepEqual(targets.map(target=>target.locator),parts,row.question+" reordered a citation");
    for(const target of targets){
      assert.equal(target.scope,"chapter",row.question+" must link to real chapter text");
      assert.match(target.url,/^https:\/\/www\.newadvent\.org\/bible\/(?:mat|mar|luk|rom|1co|1th|exo|gen)\d{3}\.htm$/);
      assert.equal(target.url.includes("nova-vulgata_index_lt"),false,"Index-only link leaked");
      assert.match(target.witness,/Latin and English/);
      chapterCount++;
    }
  }
}
assert.deepEqual(cseSourceTargets("SCR","Mt 5:27–28; 1 Cor 6:18–20",CSE_SOURCE_MAP.SCR)
  .map(target=>target.url),[
    "https://www.newadvent.org/bible/mat005.htm",
    "https://www.newadvent.org/bible/1co006.htm"
  ]);
const source=CSE_SOURCE_MAP.TRENT6;
assert.equal(cseSourceTargets("TRENT6","Part III",source)[0].url,source.canonical_url,
  "Other document URLs must not be fabricated or rewritten");
const unsupported=cseSourceTargets("SCR","Unverified 12:34",CSE_SOURCE_MAP.SCR);
assert.equal(unsupported[0].scope,"index","Unknown biblical abbreviations must fail closed");
assert.equal(unsupported[0].url,CSE_SOURCE_MAP.SCR.canonical_url);
assert.equal(Object.isFrozen(unsupported),true);
console.log("PASS Sexual Ethics source destinations: "+scriptureRows.length+
  " Scripture citation rows, "+chapterCount/2+" chapter links per language; honest unresolved fallback");
