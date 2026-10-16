import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {observedCommemorationLabels} from "../src/calendar/observed-commemoration-labels.js";
import {buildTodayV2Sections,renderTodayV2Sections} from "../src/home/today-v2-sections.js";
const read=JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-read-model.v1.json",import.meta.url),"utf8"));
const value=(commemorations,other={})=>({date:"2026-01-14",day:{main:{id:"sancti:01-14:3:w"},commemorations,...other}});
const mixed=value([
 {id:"sancti:01-14b:4:r",title:{en:"St Felix of Nola",fr:"Saint Félix de Nole"}},
 {id:"sancti:01-14b:4:w",title:{en:"St Felix of Nola",fr:"Saint Félix de Nole"}},
 "sancti:01-14b:4:r",
 "01-14",
 "St Felix of Nola"
]);
const labels=observedCommemorationLabels(mixed);
assert.deepEqual(labels.map(x=>x.name),["St Felix of Nola"],
 "Same source identity (different colour suffix) must appear only once");
assert.equal(labels[0].sourceId,"sancti:01-14b");
assert.deepEqual(observedCommemorationLabels(mixed,{language:"fr"}).map(x=>x.name),
 ["Saint Félix de Nole","St Felix of Nola"],
 "Unidentified bare names cannot be automatically cross-reconciled with a named source ID");
const references=value(["tempora:Quad1-2:4:v","10-11","commune:C4:3:w"]);
assert.deepEqual(observedCommemorationLabels(references),[],"Raw source IDs are not public titles");
assert.deepEqual(observedCommemorationLabels({
 day:{main:{id:"sancti:01-14:3:w",commemorations:["St Felix of Nola"]},
   commemorations:["sancti:01-14b:4:r","10-11"]}
}).map(x=>x.name),["St Felix of Nola"],
 "A source-code-only preferred layer cannot mask a verified display-label fallback");
assert.deepEqual(observedCommemorationLabels({
 day:{main:{id:"sancti:01-14:3:w",commemorations:["St Later Candidate"]},
    commemorations:[{id:"sancti:01-14b:4:w",name:"St Felix of Nola"}]},
 commemorations:["St Historical Old Fallback"]
}).map(x=>x.name),["St Felix of Nola"],
 "Never union unrelated fallback source candidates");
assert.deepEqual(observedCommemorationLabels({
 day:{main:{id:"sancti:01-14:3:w"},commemorations:[{name:"10-11"},{title:"commune:C4:3:w"}]}
}),[],"Plain metadata codes cannot become a false saint");
function home(date,comm,language="en"){
 const state={selectedDate:date,language,resolving:false,
  resolution:{date,status:"ready",day:{main:{id:"sancti:01-14:3:w",rank:"III"},commemorations:comm}}};
 const vm={dateIso:date,language,celebration:"Saint of the Day",properStatus:"ready",gospelExcerpt:""};
 return {model:buildTodayV2Sections(state,vm,{visible:false},read),
  vm};
}
const viewed=home("2026-01-14",mixed.day.commemorations);
assert.deepEqual(viewed.model.historicalCommemorations.map(x=>x.name),["St Felix of Nola"]);
assert.match(renderTodayV2Sections(viewed.model,viewed.vm),/1962 Mass commemoration/);
assert.match(renderTodayV2Sections(viewed.model,viewed.vm),/St Felix of Nola/);
assert.ok(!renderTodayV2Sections(viewed.model,viewed.vm).includes("sancti:01-14b"));
const french=home("2026-01-14",[
 {id:"sancti:01-14b:4:w",title:{en:"St Felix of Nola",fr:"Saint Félix de Nole"}}
],"fr");
assert.match(renderTodayV2Sections(french.model,french.vm),/Saint Félix de Nole/);
assert.deepEqual(home("2026-01-14",["sancti:01-14b:4:w"]).model.historicalCommemorations,[]);
assert.deepEqual(home("2026-01-14",["St Felix of Nola"]).model.modernHonours,[],
 "Historical 1962 labels never invent secondary modern saints");
console.log("P0 1962 observed commemoration parity: PASS (one source label owner, no raw IDs, EN/FR, no fallback union)");
