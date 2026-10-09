import assert from "node:assert/strict";
import {VERIFIED_ERRATA,candidateErrataReport} from "../tools/scripture/verify-cpdv-edition.mjs";
assert.equal(VERIFIED_ERRATA.length,2);
const data={editionId:"cpdv-2009",books:[
  {id:"Philippians",chapters:[{number:3,verses:[{number:1,text:"but for you, it is not necessary."}]}]},
  {id:"2Maccabees",chapters:[{number:7,verses:[{number:34,text:"do be not be extolled"}]}]}
]};
assert.equal(candidateErrataReport(data).filter(x=>x.status==="stale-original-source").length,2);
data.books[0].chapters[0].verses[0].text="but for you, it is necessary.";
assert.equal(candidateErrataReport(data).filter(x=>x.status==="stale-original-source").length,1);
assert.throws(()=>candidateErrataReport({editionId:"dr-challoner",books:[]}),/Wrong source/);
console.log("CPDV primary-publisher errata detection tests passed");
