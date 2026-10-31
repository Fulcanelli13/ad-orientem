import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {claudeChoirSourceUnits,claudeChoirFootFor} from "../src/pray/claude-choir-fixed-foot.js";
import {syncClaudeChoirBar} from "../src/pray/claude-choir-reader.js";
const f=readFileSync("tests/fixtures/claude-prayer/choir.app-ui.js","utf8");
const css=readFileSync("tests/fixtures/claude-prayer/choir.app-ui.css","utf8");
test("Claude's fixed choir bar and its toggle are pinned from literal HTML source",()=>{
 assert.match(f,/class="resp"/);
 assert.match(f,/Response bar","bar"/);
 assert.match(f,/data-r=/);
 assert.match(css,/\.resp\{flex:0 0 auto/);
 assert.match(css,/\.resp\.ring::after/);
});
test("All source-owned F03 litany texts preserve EN/FR/LA words, spacing and answers",()=>{
 const ids=["litany_loreto_1962","litany_loreto_current","adoration_litany_blessed_sacrament","devotion_litany_st_joseph"];
 let total=0;
 for(const id of ids){
  for(const language of ["en","fr","la"]){
   const original=PRAY_CANONICAL_DATA_V435930.prayers[id][language];
   const units=claudeChoirSourceUnits(original);
   assert.ok(units?.length,id+" "+language);
   assert.equal(units.map(u=>u.raw).join(""),original);
   assert.ok(units.some(u=>u.kind==="pair"),id+" "+language+" has no fixed answer");
   for(const u of units){
    if(u.kind==="pair"){
     assert.equal(u.invocation+u.divider+u.response+u.ending,u.raw);
     assert.equal(claudeChoirFootFor(u),u.response);
    }else assert.equal(claudeChoirFootFor(u),"");
   }
   total++;
  }
 }
 assert.equal(total,12);
});
test("Kyrie/Christe and genuine source versicles do not acquire invented responses",()=>{
 const all=["Kyrie, eleison.","Christ, hear us.","℣. He made him master of his house.","℟. And ruler of all his possessions."].join("\n");
 const units=claudeChoirSourceUnits(all);
 assert.ok(units.every(u=>u.kind!=="pair"));
 assert.equal(units.map(u=>u.raw).join(""),all);
 assert.equal(claudeChoirSourceUnits(""),null);
});

test("Stable fixed response never replays animation on repeated focus/scroll updates",()=>{
 const response={textContent:"pray for us"};
 let reflows=0,ringStarts=0;
 const bar={
  hidden:false,
  classList:{remove(){},add(name){if(name==="ring")ringStarts++;}},
  querySelector(selector){return selector===".aoClaudeChoirResponseText"?response:null;},
  get offsetWidth(){reflows++;return 100;}
 };
 const card={querySelector(selector){return selector===".aoClaudeChoirResponse"?bar:null;}};
 const element={matches(selector){return selector===".aoClaudeChoirBeat";},dataset:{aoChoirAnswer:"pray for us"}};
 assert.equal(syncClaudeChoirBar(card,element),true);
 assert.equal(syncClaudeChoirBar(card,element),true);
 assert.equal(reflows,0);
 assert.equal(ringStarts,0);
 element.dataset.aoChoirAnswer="have mercy on us";
 assert.equal(syncClaudeChoirBar(card,element),true);
 assert.equal(response.textContent,"have mercy on us");
 assert.equal(reflows,1);
 assert.equal(ringStarts,1);
 assert.equal(syncClaudeChoirBar(card,element),true);
 assert.equal(ringStarts,1);
 element.dataset.aoChoirAnswer="";
 assert.equal(syncClaudeChoirBar(card,element),false);
 assert.equal(bar.hidden,true);
 assert.equal(ringStarts,1);
});
