import assert from "node:assert/strict";
import {recoverReaderProperOmissions} from "../src/mass/reader-proper-runtime-recovery.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";

const owner="Sancti/05-04",principal="sancti:05-04:3:w";
const section="Oratio (nisi rubrica cisterciensis)";
const originals=Object.freeze({
 la:"Deus, mæréntium consolátor et in te sperántium salus, qui beátæ Mónicæ pias lácrimas in conversióne fílii sui Augustíni misericórditer suscepísti:",
 en:"O God, the consoler of those Who mourn and the safety of those who put their trust in You; Who mercifully accepted the holy tears of blessed Monica:",
 fr:"Ô Dieu, consolateur des affligés et salut de ceux qui mettent en vous leur espérance, vous qui avez miséricordieusement agréé les pieuses larmes de Monique :"
});
const complete=Object.freeze({lat:"Fully present Latin prayer text",en:"Fully present English prayer text",fr:"Texte français de prière authentifié"});
const make=(override={})=>({
 sourcePath:owner,collects:[Object.freeze({lat:"",en:"",fr:""})],
 secrets:[complete],postcommunions:[complete],epistle:complete,
 ...override
});
const source=(change={})=>({
 resolveSource:async(path,language)=>{
  assert.equal(path,owner,"another Mass's source was fetched");
  const roman=Object.prototype.hasOwnProperty.call(change,"roman")?
   change.roman:originals[language];
  const plain=change.plain??[];
  const lines=roman? [roman,"$Per Dominum"]:[];
  return {map:new Map([[section,lines],["Oratio",plain]])};
 }
});
const recover=(proper,resolver=source(),id=principal,diagnostic={warnings:[]})=>
 recoverReaderProperOmissions(proper,{
  hostResolver:resolver,principalCelebrationId:id,
  calendarDate:"2026-05-04",diagnostic
 });
const initial=make();
const fixed=await recover(initial);
assert.notEqual(fixed,initial);
assert.equal(fixed.sourcePath,owner);
assert.strictEqual(initial.collects[0].lat,"","originally flattened Collect was mutated");
for(const lang of ["lat","en","fr"])assert.ok(fixed.collects[0][lang].length>75);
assert.equal(fixed.collects.length,1);
assert.strictEqual(fixed.collects[0],fixed.collect);
assert.equal(fixed.collects[0].sourcePath,owner+":"+section);
assert.deepEqual(fixed.sourceEditorialCorrections.map(x=>x.id),
 ["1962_ST_MONICA_ROMAN_CONDITIONAL_COLLECT"]);
assert.equal(fixed.sourceEditorialCorrections[0].originalSourcePreserved,true);
assert.deepEqual(fixed.sourceEditorialCorrections[0].languageWitnesses,["la","en","fr"]);
for(const language of ["en","fr"]){
 assert.equal(properToReaderSlots(fixed,{language}).slots.COLLECT_SET.status,"READY",
  "Monica Roman Collect not readable in "+language);
}
// Selected principal, rite and owner must all match the authentic Roman
// source. No broad conditional aliases, translated reconstructions or
// reassignments of previously complete source prayers.
for(const [name,proper,id,resolver] of [
 ["wrong saint",make({sourcePath:"Sancti/10-08"}),principal,source()],
 ["unverified principal",make(),"sancti:05-04:4:w",source()],
 ["other commemoration",make({calendarCommemorations:[{path:"Sancti/05-04c"}]}),principal,source()],
 ["extra row",make({collects:[{lat:"",en:"",fr:""},{lat:"",en:"",fr:""}]}),principal,source()],
 ["already named Collect",make({collects:[{...complete}]}),principal,source()],
 ["Cistercian alternate text",make(),principal,source({plain:["Another Collect"]})],
 ["unrecognized Latin source",make(),principal,source({roman:"Another Collect"})],
 ["missing conditional section",make(),principal,source({roman:""})]
 ]){
 // Wrong owner deliberately throws in this strict mock, which is a
 // negative test of no cross-owner source invocation rather than approval.
 if(name==="wrong saint"){
  const r=await recover(proper,{
   resolveSource:async()=>({map:new Map()})
  },id);
  assert.equal(r.collects[0].lat,"",name);continue;
 }
 const result=await recover(proper,resolver,id);
 assert.deepEqual(result.collects,proper.collects,name);
 assert.equal((result.sourceEditorialCorrections??[])
  .some(x=>x.id==="1962_ST_MONICA_ROMAN_CONDITIONAL_COLLECT"),false,name);
}
const warnings=[];
const unavailable=await recover(make(),{
 resolveSource:async()=>{throw Error("Pinned source temporarily unavailable")}
},principal,{warnings});
assert.equal(unavailable.collects[0].lat,"");
assert.ok(warnings.some(x=>x.startsWith("MONICA_ROMAN_COLLECT_SOURCE_UNAVAILABLE:")));
console.log("PASS St Monica: Roman 1962 conditional source trilingual Collect recovered; wrong rite, owner, existing text and missing witness all fail closed");
