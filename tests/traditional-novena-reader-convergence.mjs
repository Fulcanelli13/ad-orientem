import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { readingPosition, readingPositionMarkup } from "../src/pray/reading-position.js";

const state=readingPosition({step:3,total:7,label:"Current section",title:"Pater noster"});
assert.deepEqual(state,{index:3,total:7,number:4,label:"Current section",title:"Pater noster"});
assert.equal(readingPosition({step:-10,total:9}).number,1);
assert.equal(readingPosition({step:100,total:9}).number,9);
assert.equal(readingPositionMarkup({total:0}),"");
const line=readingPositionMarkup({step:3,total:7,label:"Prayer",title:"Our Father"});
assert.match(line,/data-ao-reading-position="3"/);
assert.match(line,/aria-valuenow="4"/);
assert.match(line,/aria-valuemax="7"/);
assert.match(line,/width:57%/);
assert.match(line,/Our Father/);
assert.doesNotMatch(line,/completed|finished|prayed|score/i);
assert.ok(!readingPositionMarkup({step:0,total:2,title:"<script>"}).includes("<script>"));
assert.match(readingPositionMarkup({step:0,total:2,title:"<script>"}),/&lt;script&gt;/);

const load=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const files=["src/pray/reading-position.js","src/pray/traditional-pray-runtime.js","src/pray/novena-runtime.js","src/pray/reader-convergence-styles.js"];
const [helper,trad,novena,css]=await Promise.all(files.map(load));
for(const path of files){
 const result=spawnSync(process.execPath,["--check",new URL("../"+path,import.meta.url).pathname],{encoding:"utf8"});
 assert.equal(result.status,0,path+" syntax: "+result.stderr);
}
assert.match(trad,/readingPositionMarkup\(\{step,total,label:L\("Current prayer"/);
assert.match(trad,/readingPositionMarkup\(\{step,total:7,label:L\("Current litany section"/);
assert.match(trad,/End of sequence/);
assert.doesNotMatch(trad,/Prayer completed/);
assert.match(trad,/import "\.\/reader-convergence-styles\.js"/);
assert.match(novena,/readingPositionMarkup\(\{/);
assert.match(novena,/function novenaStageName\(n,index\)/);
assert.match(novena,/HAMMER_MARIAN/);
assert.match(novena,/COMMON_BEFORE_REPEAT/);
assert.match(novena,/OPENING_DAY_COMMON_CLOSE/);
assert.match(novena,/sharedClosingText&&index===3/);
assert.match(novena,/N\.mode==='simple'/);
assert.match(novena,/sourceWitness\(daySource\(n,d\)/);
assert.match(novena,/data-n1-stage-next/);
assert.match(novena,/import "\.\/reader-convergence-styles\.js"/);
assert.match(css,/\.aoTP381GuideCard/);
assert.match(css,/\.aoTP381GuideNav button/);
assert.match(css,/\.aoN1Nav button/);
assert.match(css,/\.aoReadingPosition/);
assert.match(css,/min-height:44px!important/);
assert.doesNotMatch(helper,/localStorage|indexedDB|setTimeout|fetch\(/);
console.log("Traditional/Novena reader convergence: source-aligned stages, positions, gestures and accessible controls OK");
