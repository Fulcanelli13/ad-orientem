import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {PENT21_PROPER_SCORES_1961} from "../src/mass/reader-pent21-proper-scores-1961.js";
import {matchSourceOwnedProperScores,scoreForSourceOwnedProperTrack} from "../src/mass/reader-proper-chant-crosswalk.js";
import {SCHOLA_SCORE_CATALOGUE,resolveNativeScholaScore} from "../src/mass/reader-chant-score-pilot.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const archive=[1,2,3,4,5,6].flatMap(n=>load("data/mass/chant-corpus/gr1961-proper-00"+n+".json").items);
const digest=s=>createHash("sha256").update(s).digest("hex");
const expected={"INTROIT":1047,"GRADUAL":1108,"ALLELUIA_TRACT_SEQUENCE":1380,
 "OFFERTORY":1363,"COMMUNION":1290};
assert.equal(PENT21_PROPER_SCORES_1961.length,5);
assert.equal(SCHOLA_SCORE_CATALOGUE.length,17);
assert.deepEqual(Object.fromEntries(PENT21_PROPER_SCORES_1961.map(x=>[x.trackId,Number(x.id.slice(10))])),expected);
for(const x of PENT21_PROPER_SCORES_1961){
 const original=archive.find(a=>a.id===x.id);
 assert.ok(original,"Score absent from frozen archival source");
 assert.equal(x.status,"SOURCE_MATCH_REQUIRED_NOT_DATE_ASSIGNED");
 assert.deepEqual(x.sourcePathAllowlist,["Tempora/Pent21-0"]);
 assert.equal(x.sourceEditionId,2);
 assert.equal(x.archiveGabcSha256,original.sha256);
 assert.equal(x.gabc.slice(x.gabc.indexOf("%%\n")+3),original.gabc,
  "GABC notation must be byte-identical to frozen source");
 assert.equal(digest(original.gabc),x.archiveGabcSha256);
 assert.match(x.sourcePageScanUrl,/gregobase\.selapa\.net\/sources\/2\/4(22|23|24|25)\.png/);
}
const slots=Object.fromEntries([
 ["INTROIT","In voluntate tua, Domine, universa sunt posita"],
 ["GRADUAL","Domine, refugium factus es nobis, a generatione et progenie"],
 ["ALLELUIA_TRACT_SEQUENCE","Alleluia, alleluia. In exitu Israel de Aegypto"],
 ["OFFERTORY","Vir erat in terra Hus, nomine Job"],
 ["COMMUNION","In salutari tuo anima mea"],
].map(([k,latin])=>[k,{status:"READY",data:{paragraphs:[{latin}]}}]));
const proper={schema:"ao-reader-proper-slots-v1",sourcePath:"Tempora/Pent21-0",slots};
const matched=matchSourceOwnedProperScores(proper);
assert.equal(matched.status,"PARTIALLY_MATCHED");
assert.deepEqual(Object.fromEntries(matched.candidates.map(x=>[x.trackId,Number(x.scoreId.slice(10))])),expected);
assert.equal(scoreForSourceOwnedProperTrack(matched,"GRADUAL").id,"GREGOBASE-1108");
assert.equal(resolveNativeScholaScore({trackId:"GRADUAL",properCrosswalk:matched}).score,null,
 "Source proof must never automatically display reference notation");
assert.equal(resolveNativeScholaScore({trackId:"GRADUAL",properCrosswalk:matched,
 selectedScoreId:"GREGOBASE-1108"}).status,"EXAMPLE_ONLY_NOT_SELECTED_FOR_MASS");
for(const wrong of ["Tempora/Pent20-0","Sancti/12-25m3","Tempora/Pent21-1",""]){
 const m=matchSourceOwnedProperScores({...proper,sourcePath:wrong});
 assert.ok(!m.candidates.some(x=>Object.values(expected).includes(Number(x.scoreId.slice(10)))),
  "Score must not float to another source path "+wrong);
}
const reverse=matchSourceOwnedProperScores({...proper,
 slots:{...slots,GRADUAL:{status:"READY",data:{paragraphs:[{latin:"Domine Deus virtutum exaudi preces"}]}}}});
assert.equal(reverse.candidates.some(x=>x.trackId==="GRADUAL"),false);
const compound=matchSourceOwnedProperScores({...proper,
 slots:{...slots,ALLELUIA_TRACT_SEQUENCE:{status:"READY",data:{paragraphs:[
  {latin:"Alleluia, alleluia. In exitu Israel de Aegypto"},
  {latin:"Alleluia, aliud canticum"}]}}}});
assert.equal(compound.candidates.some(x=>x.trackId==="ALLELUIA_TRACT_SEQUENCE"),false);
console.log("PASS 21st after Pentecost five frozen 1961 reference GABCs, selected source/role/incipit; no auto score release");
