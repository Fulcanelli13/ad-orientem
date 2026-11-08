import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const witness=read("../data/office/research/compline-saturday-diurnale-2008-full-line-witness.json");
const source=read("./fixtures/office/advent-i-saturday-compline-la.json");

function printedWords(value){
 return value.toLowerCase()
  .replaceAll("œ","oe").replaceAll("æ","ae")
  .normalize("NFD").replace(/\p{M}/gu,"")
  // This historical spelling variation is documented separately.
  .replace(/foenum|faenum/gu,"faenum")
  .replace(/[^\p{L}]+/gu," ").trim();
}

test("41 complete printed Latin Saturday psalm lines match the pinned source lexically",()=>{
 assert.equal(witness.witness.kind.includes("2008"),true);
 assert.equal(witness.scope.publicationApproved,false);
 const differences=[];
 let count=0,tokenCount=0;
 for(const [number,amount] of [[87,19],[102,22]]){
  const lines=witness.lines["Psalm"+number],pinned=source.psalms[number]
   .trim().split(/\r?\n/u).map(x=>x.replace(/^\d+:\d+ /u,""));
  assert.equal(lines.length,amount);
  assert.equal(pinned.length,amount);
  for(let i=0;i<amount;i++){
   const context="Psalm "+number+", recitation stich "+(i+1);
   assert.equal(printedWords(lines[i]),printedWords(pinned[i]),context);
   tokenCount+=printedWords(lines[i]).split(" ").length;
   if(lines[i]!==pinned[i])
    differences.push({psalm:number,row:i+1});
   count++;
  }
 }
 assert.equal(count,41);
 assert.equal(tokenCount,473,"all words across 41 printed recitation stichs must be tested");
 assert.deepEqual(differences,[{psalm:102,row:14},{psalm:102,row:20}]);
 assert.deepEqual(witness.expectedOrthographicDifferences.map(x=>({
  psalm:x.psalm,row:x.row
 })),differences);
});

test("lexical collation catches an omitted or altered middle word, not just an incipit",()=>{
 const original=witness.lines.Psalm87[6];
 const corrupted=original.replace("omnes fluctus","fluctus");
 assert.notEqual(printedWords(original),printedWords(corrupted));
 const original2=witness.lines.Psalm102[13];
 const corrupted2=original2.replace("tamquam flos agri","tamquam flos");
 assert.notEqual(printedWords(original2),printedWords(corrupted2));
});

test("independent modern printed fidelity is not misrepresented as original 1961 certification",()=>{
 assert.match(witness.witness.kind,/independent secondary witness/u);
 assert.match(witness.witness.source,/scribd.com/u);
 assert.match(witness.witness.printedPages,/349–352/u);
 const release=readFileSync(new URL("../src/office/latin-compline-public-release.js",import.meta.url),"utf8");
 assert.match(release,/psalter1961VerbatimCollated:false/u);
 assert.match(release,/completeHourCollated:false/u);
 assert.match(release,/rightsApproved:false/u);
 assert.match(release,/publicReleaseApproved:false/u);
});