import assert from "node:assert/strict";
import {READER_OBJECTIVE_CONTEXT_ROWS,READER_OBJECTIVE_CONTEXT_OWNER,
 projectReaderObjectiveContext} from "../src/mass/reader-objective-context.js";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const sung=read("../data/presentation/reader-text-sung.v1.json");
const formation=read("../data/learn/mass-formation-campion.v1.json");
const sourceBlocks=new Map(sung.blocks.map(b=>[b.Block_ID,b]));
const claims=new Set(formation.stages.flatMap(s=>s.claims.map(c=>c.id)));
assert.equal(READER_OBJECTIVE_CONTEXT_ROWS.length,10);
assert.equal(new Set(READER_OBJECTIVE_CONTEXT_ROWS.map(r=>r.blockId)).size,10);
for(const row of READER_OBJECTIVE_CONTEXT_ROWS){
  const source=sourceBlocks.get(row.blockId);
  assert.ok(source,row.blockId+" missing");
  for(const ref of row.evidence)assert.ok(claims.has(ref)||
    sourceBlocks.get("AO.SM.B060")===source&&source.units.some(u=>u.cue_id===ref),
    row.blockId+" evidence missing: "+ref);
  for(const language of ["en","fr"]){
    const cueId=source.units[0].cue_id;
    const result=projectReaderObjectiveContext({
      blocks:[{blockId:row.blockId,firstParagraphIndex:0,paragraphCount:1}],
      paragraphs:[{sourceCueIds:[cueId]}]},
      {cueId,form:"LOW",language});
    assert.equal(result.blockId,row.blockId);
    assert.equal(result.owner,READER_OBJECTIVE_CONTEXT_OWNER);
    assert.equal(result.observedNow,false);
    assert.equal(result.text,row[language]);
    assert.doesNotMatch(result.text,/(you may wish|pray for|ask God|offer your|you should)/i);
  }
}
const block={blocks:[{blockId:"AO.SM.B047",firstParagraphIndex:0,paragraphCount:1}],
 paragraphs:[{sourceCueIds:["AO.SM.C0150"]}]};
assert.equal(projectReaderObjectiveContext(block,{cueId:"AO.SM.C0151",form:"LOW"}),null);
assert.equal(projectReaderObjectiveContext(block,{cueId:"AO.SM.C0150",form:"GOOD_FRIDAY"}),null);
assert.equal(projectReaderObjectiveContext({blocks:[],paragraphs:[]},{cueId:"AO.SM.C0150",form:"LOW"}),null);
// Integration guards: no competing Guide, no prayer suggestions and no
// premature retirement of SIMPLE; retain all existing Missal ownership.
const domSource=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const nativeSource=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.ok(nativeSource.includes('import { projectReaderObjectiveContext } from "./reader-objective-context.js"'));
assert.ok(nativeSource.includes("projectReaderObjectiveContext(visibleCard"));
assert.ok(nativeSource.includes("cueId:state.nativeCueId"));
assert.ok(domSource.includes('data-role="objective-context" hidden aria-live="off"'));
assert.ok(domSource.includes('const showContext=mode==="LIVE"&&'));
assert.ok(domSource.includes('copy?.owner==="MASS_READER_OBJECTIVE_CONTEXT_V1"'));
assert.ok(domSource.includes('setChannel(root,"priest-position",showContext?current.priestPosition:null)'));
assert.ok(domSource.includes('["MISSAL","SIMPLE","LIVE"]'));
assert.ok(!nativeSource.includes("pray.communion_treasury"));
console.log("PASS: Objective LIVE ribbon copy, source block/cue ownership, EN/FR, guarded rails, no devotional suggestions and SIMPLE/Missal compatibility.");
