import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {assessGraduale1961Promotion,candidatePromotionQueue,GR1961_PROMOTION_GATES} from "../tools/mass/gr1961-promotion-gate.mjs";
const base=new URL("../data/mass/chant-corpus/",import.meta.url);
const index=JSON.parse(readFileSync(new URL("gr1961-proper-index.json",base)));
const rows=index.batches.flatMap(x=>JSON.parse(readFileSync(new URL(x.path.replace("data/mass/chant-corpus/",""),base))).items);
assert.equal(rows.length,1195);
assert.equal(GR1961_PROMOTION_GATES.length,6);
const current=candidatePromotionQueue({index,records:rows});
assert.deepEqual([current.screened,current.eligible,current.withheld],[1195,0,1195]);
assert.ok(current.entries.every(x=>x.status==="RESEARCH_ONLY"));
const first=rows[0];
const evidence={gregobaseId:first.gregobaseId,sourceGabcSha256:first.sha256,
 reviewStatus:"APPROVED",gates:Object.fromEntries(GR1961_PROMOTION_GATES.map(g=>[g,{
 status:"PASS",reviewer:"TEST_ONLY",evidenceUri:"fixture://not-real"
 }]))};
const approval={gregobaseId:first.gregobaseId,gabcSha256:first.sha256,status:"EDITORIALLY_APPROVED"};
assert.equal(assessGraduale1961Promotion(first,{sourceIndex:index,evidence,approved:approval}).approved,true,
 "Only complete explicit evidence passes, in a synthetic fixture");
for(const key of GR1961_PROMOTION_GATES){
 const reduced={...evidence,gates:{...evidence.gates,[key]:{status:"PENDING"}}};
 assert.equal(assessGraduale1961Promotion(first,{sourceIndex:index,evidence:reduced,approved:approval}).approved,false,key);
}
assert.equal(assessGraduale1961Promotion({...first,gabc:first.gabc+" "},{sourceIndex:index,evidence,approved:approval}).approved,false);
assert.equal(assessGraduale1961Promotion(first,{sourceIndex:index,evidence,approved:null}).approved,false);
assert.equal(assessGraduale1961Promotion(first,{sourceIndex:index,evidence:null,approved:approval}).approved,false);
assert.equal(assessGraduale1961Promotion(first,{sourceIndex:{...index,status:"LIVE"},evidence,approved:approval}).approved,false);
console.log("PASS: 1195 staged Graduale records, 0 eligible, six explicit editorial review gates");
