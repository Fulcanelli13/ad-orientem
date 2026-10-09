import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {EASTER_VIGIL_PROPHECY_READINGS,EASTER_VIGIL_PROPHECY_VERSION}
 from "../src/mass/reader-easter-vigil-prophecy-index.js";
import {buildEasterVigilReader,createEasterVigilReaderController}
 from "../src/mass/reader-easter-vigil.js";
import {nativeRiteScriptureContext} from "../src/mass/scripture-native-rite-context.js";
import {scriptureSegmentsReference} from "../src/scripture/segments.js";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const source=read("../data/presentation/reader-easter-vigil-prophecies.v1.json");
const ledger=read("../data/mass/distinct-rite-scripture-order.v1.json");
const native=read("../data/mass/native-rite-scripture-release.v1.json");
const payload=read("../data/presentation/reader-easter-vigil.v1.json");
const graph=read("../data/mass/special-days-core.v1.1.json").graphs.EV;
assert.equal(source.version,EASTER_VIGIL_PROPHECY_VERSION);
assert.deepEqual(source.readings,EASTER_VIGIL_PROPHECY_READINGS,
 "Generated runtime must match the editorially audited original four-reading Latin corpus");
assert.equal(source.schema,"ao-r33-easter-vigil-prophecy-corpus-v1");
assert.equal(source.sourcePath,"Tempora/Quad6-6");
assert.equal(source.readings.length,4);
assert.equal(source.readings.map(x=>x.stateId).join("|"),
 "EV-LESS-01-READ|EV-LESS-02-READ|EV-LESS-03-READ|EV-LESS-04-READ");
assert.equal(source.readings.filter(x=>x.canticle).length,3,"First prophecy has no canticle");
const rite=ledger.rites.find(x=>x.riteId==="EASTER_VIGIL_1962");
const built=buildEasterVigilReader({graph,payload});
assert.equal(built.sourceRecordCount,38);
assert.equal(built.steps.at(-1).recordId,"EV-MASS-700");
assert.equal(built.steps.filter(x=>/-READ$/.test(x.recordId)).length,4);
for(let index=0;index<4;index++){
 const row=source.readings[index],code=index+1;
 assert.equal(row.stateId,rite.entries[index].nativeStateIds[0]);
 assert.equal(scriptureSegmentsReference(row.segments),rite.entries[index].displayReference);
 assert.equal(rite.entries[index].status,
  "NATIVE_CONTEXT_LINKED_FULL_LATIN_TEXT_WITH_SEPARATE_CANTICLE_AND_COLLECT");
 assert.equal(row.latinParagraphs.join(" ").length>600,true,"A source summary cannot be a full lesson");
 const state=built.steps.find(x=>x.recordId===row.stateId);
 assert.equal(state.posture,"SIT");
 const text=state.paragraphs.filter(x=>x.kind==="TEXT");
 assert.equal(text.length,row.latinParagraphs.length);
 assert.deepEqual(text.map(x=>x.latin),row.latinParagraphs);
 assert.ok(text.every((x,i)=>x.id==="EV-PROP-"+code+"-T"+(i+1)));
 assert.ok(!text.some(x=>x.latin.includes("Quattuor lectiones")),
   "Repeated generic donor summary must never replace Scripture");
 assert.ok(!state.paragraphs.some(x=>/Deo gr[aá]tias/.test(x.latin)),
   "The 1962 Vigil lessons have no Deo gratias response");
 const cant=state.paragraphs.filter(x=>x.kind==="CANTICLE");
 assert.equal(cant.length,row.canticle?.latin.length??0);
 assert.deepEqual(cant.map(x=>x.latin),row.canticle?.latin??[]);
 const after=built.steps.find(x=>x.recordId==="EV-LESS-0"+code+"-RISE");
 assert.deepEqual(after.paragraphs.map(p=>p.kind),["RESPONSE","COLLECT"]);
 assert.equal(after.paragraphs[1].latin,row.collectLatin);
 const orem=built.steps.find(x=>x.recordId==="EV-LESS-0"+code+"-OREM");
 const kneel=built.steps.find(x=>x.recordId==="EV-LESS-0"+code+"-KNEEL");
 assert.equal(orem.paragraphs[0].latin,"Oremus.");
 assert.equal(kneel.paragraphs[0].latin,"Flectamus genua.");
 assert.equal(kneel.posture,"KNEEL");
}
assert.equal(source.readings[0].latinParagraphs.at(-1).includes("requievit die septimo"),true);
assert.equal(source.readings[1].latinParagraphs.at(-1).endsWith("et dixerunt:"),true);
assert.equal(source.readings[2].latinParagraphs[0].startsWith("In die illa erit germen Domini"),true);
assert.equal(source.readings[2].segments[0].verseStart,2,"Isaiah third prophecy must begin at 4:2");
assert.equal(source.readings[3].latinParagraphs.at(-1).endsWith("ad finem usque complevit:"),true);
const controller=createEasterVigilReaderController({graph,payload,fontMode:"IN_CHURCH"});
const preview={
 root:{dataset:{r17NativeRiteRecord:"none"}},
 getEasterVigilState:()=>controller.project(),
 getCurrentCard:()=>controller.project().card,
 getCompositeStage:()=>stage,
};
let stage="VIGIL_ACTIVE";
const prepared={session:{plan:{kind:"COMPOSITE_DISTINCT_RITE",rite:"EASTER_VIGIL"}}};
for(const row of source.readings){
 controller.goToRecord(row.stateId);
 preview.root.dataset.r17NativeRiteRecord=row.stateId;
 const citation=nativeRiteScriptureContext(preview,prepared);
 assert.equal(citation?.state,"READY",row.stateId+" source text-bound link must open");
 assert.equal(citation?.reference,row.reference);
 assert.equal(citation?.nativeStateId,row.stateId);
 assert.deepEqual(citation?.segments,row.segments);
 assert.equal(citation?.provenance,"NATIVE_1962_RITE_STATE_LATIN_SOURCE_BOUND");
 const step=controller.project(),tampered={...step,card:{...step.card,
   paragraphs:step.card.paragraphs.map(x=>x.kind==="TEXT"&&x.id.endsWith("-T1")?{...x,latin:"Textus alienus"}:x)}};
 assert.equal(nativeRiteScriptureContext({...preview,getEasterVigilState:()=>tampered},prepared),null,
  "A changed Latin incipit must hide the capsule");
 const cutEnd={...step,card:{...step.card,paragraphs:step.card.paragraphs.map((x,i,arr)=>{
   const last=arr.filter(v=>v.kind==="TEXT").at(-1);
   return x===last?{...x,latin:x.latin+" ALTERED"}:x;
 })}};
 assert.equal(nativeRiteScriptureContext({...preview,getEasterVigilState:()=>cutEnd},prepared),null,
  "A truncated or modified ending must hide the capsule");
 preview.root.dataset.r17NativeRiteRecord="EV-LESS-01-READ"===row.stateId?"EV-LESS-02-READ":"EV-LESS-01-READ";
 assert.equal(nativeRiteScriptureContext(preview,prepared),null,"Native state marker must match actual controller");
 preview.root.dataset.r17NativeRiteRecord=row.stateId;
 controller.goToRecord(row.stateId.replace("-READ","-OREM"));
 preview.root.dataset.r17NativeRiteRecord=controller.project().step.recordId;
 assert.equal(nativeRiteScriptureContext(preview,prepared),null,"Prayer state must not be a Bible reading");
}
controller.goToRecord("EV-MASS-700");
preview.root.dataset.r17NativeRiteRecord="EV-MASS-700";
assert.equal(nativeRiteScriptureContext(preview,prepared),null);
controller.goToRecord("EV-LESS-01-READ");
preview.root.dataset.r17NativeRiteRecord="EV-LESS-01-READ";
stage="MASS_ACTIVE";
assert.equal(nativeRiteScriptureContext(preview,prepared),null,"Vigil citation must not persist after Kyrie handoff");
stage="VIGIL_ACTIVE";
assert.equal(nativeRiteScriptureContext(preview,{session:{plan:{kind:"MASS"}}}),null);
console.log("PASS four complete 1962 Easter Vigil Latin prophecies with separate canticles/collects, source parity, no false Deo gratias, exact native state/text/stage Context gates.");
