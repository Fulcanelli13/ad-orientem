import assert from "node:assert/strict";
import {calendarNativeRiteScriptureContexts} from "../src/calendar/native-rite-scripture-handoff.js";
import {calendarScriptureContexts} from "../src/calendar/scripture-handoff.js";
import {selectedCalendarScriptureObjects,matchingSelectedCalendarScriptureObject}
 from "../src/calendar/selected-scripture-objects.js";

function ready(date,id,sourcePath){
 return {date,status:"ready",day:{main:{id}},proper:{
  status:"ready",sourcePath,data:{sourcePath}
 }};
}
const good=ready("2026-04-03","tempora:Quad6-5r:1:v","Tempora/Quad6-5r");
const vigil=ready("2026-04-04","tempora:Quad6-6r:1:vw","Tempora/Quad6-6r");
const gf=calendarScriptureContexts(good),ev=calendarScriptureContexts(vigil);
assert.deepEqual(gf.map(x=>x.role),[
 "FIRST_LESSON","SECOND_LESSON","PASSION_BEFORE_DEATH","PASSION_AFTER_DEATH"
]);
assert.deepEqual(ev.map(x=>x.role),[
 "FIRST_PROPHECY","SECOND_PROPHECY","THIRD_PROPHECY","FOURTH_PROPHECY"
]);
assert.deepEqual(gf.map(x=>x.reference),[
 "Hosea 6:1–6","Exodus 12:1–11","John 18:1–40; 19:1–30","John 19:31–42"
]);
assert.deepEqual(ev.map(x=>x.reference),[
 "Genesis 1:1–31; 2:1–2","Exodus 14:24–31; 15:1",
 "Isaiah 4:2–6","Deuteronomy 31:22–30"
]);
assert.ok([...gf,...ev].every(x=>x.segments?.length&&
 x.slot==="NATIVE_RITE:"+x.stateId&&x.provenance&&
 x.label?.en&&x.label?.fr&&x.witnessUrl.startsWith("https://")));
for(const row of [good,vigil]){
 const chosen={selectedDate:row.date,resolving:false,resolution:row};
 const links=selectedCalendarScriptureObjects(chosen);
 assert.equal(links.length,4);
 for(const link of links){
   assert.equal(link.relation,"SELECTED_1962_NATIVE_RITE_BIBLICAL_RECORD");
   assert.equal(matchingSelectedCalendarScriptureObject(chosen,link.target)?.id,link.id);
   assert.equal(matchingSelectedCalendarScriptureObject(chosen,{...link.target,date:"2026-05-03"}),null);
 }
}
// The liturgical date alone, an unrelated Proper, a stale rank or source ID
// never authorizes native rite readings or reverse links.
for(const corrupt of [
 {...good,date:"2026-04-10"},
 {...good,day:{main:{id:"tempora:Quad6-5r:2:v"}}},
 {...good,proper:{...good.proper,sourcePath:"Tempora/Quad6-5"}},
 {...good,proper:{...good.proper,status:"failed"}},
 {...good,status:"failed"},
 {...vigil,day:{main:{id:"tempora:Quad6-6r:2:vw"}}},
 {...vigil,date:"2027-04-04"},
 {...vigil,proper:{...vigil.proper,sourcePath:"Sancti/04-04"}}
 ])assert.deepEqual(calendarNativeRiteScriptureContexts(corrupt),[],
 "A source-inconsistent day must not expose native rite readings");
assert.deepEqual(calendarNativeRiteScriptureContexts(ready("2026-02-28",
 "tempora:Quad1-6:2:v","Tempora/Quad1-6")),[],
 "Ember preparatory lessons are source-state-owned and must not be guessed from a date");
console.log("PASS Calendar Good Friday (4) and Easter Vigil (4) Scripture links, exact rite identities and selected reciprocal objects");
