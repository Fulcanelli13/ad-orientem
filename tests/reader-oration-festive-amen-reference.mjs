import assert from "node:assert/strict";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {composeProperReaderParagraphs} from "../src/mass/proper-reader-composition.js";
import {sourceBoundFestiveOrationAmenScores,FESTIVE_ORATION_AMEN_SOURCE}
 from "../src/mass/reader-oration-festive-amen-reference.js";
const sourcePath="Tempora/Quad01-0";
const prayer=(i,full=true)=>({
 lat:"Da nobis, quaesumus, Domine, misericordiam tuam "+i+
  (full?". Qui tecum vivit et regnat in unitate Spiritus Sancti Deus, per omnia saecula saeculorum. Amen."
       :". Per Dominum nostrum Iesum Christum. Amen."),
 en:"Grant us, O Lord, Thy mercy "+i+". Through our Lord. Amen.",
 fr:"Donnez-nous, Seigneur, votre misericorde "+i+". Ainsi soit-il."
});
const data=(count=1,full=true)=>({
 sourcePath,introit:prayer("in"),epistle:prayer("ep"),
 gradual:prayer("gr"),gospel:prayer("go"),
 offertory:prayer("of"),secrets:[prayer("se")],
 communion:prayer("co"),preface:prayer("pr"),
 collects:Array.from({length:count},(_,i)=>prayer("collect-"+i,full)),
 postcommunions:Array.from({length:count},(_,i)=>prayer("post-"+i,full))
});
const resolved=(d,kind="SUNDAY",form="SOLEMN")=>({
 schema:"ao-resolved-mass-v2",form,
 proper:{status:"READY",sourcePath,data:d},overlays:[],
 provenance:{musicToneContext:{
  schema:"ao-1962-sourced-tone-context-v1",sourceOwner:"1962_PROPER_RESOLVER",
  verified:true,sourcePath,onlyForCommonMassPrayerTones:true,
  celebrationKind:kind,liturgicalClass:kind==="FERIA"?3:1
 }}
});
const rows=(d,slot,language="en",form="SUNG")=>
 composeProperReaderParagraphs(slot==="COLLECT_SET"?"AO.SM.B019":"AO.SM.B088",
  properToReaderSlots(d,{language}).slots[slot].data.paragraphs,{language,form});
const score=(p,all,m,form="SOLEMN")=>sourceBoundFestiveOrationAmenScores({
 paragraph:p,paragraphs:all,form,resolvedMass:m
});
assert.match(FESTIVE_ORATION_AMEN_SOURCE.gabc,/\(c3\).*A\(h\)men\.\(h\.\)/);
assert.equal(FESTIVE_ORATION_AMEN_SOURCE.sourceFolio,"114*");
for(const language of ["en","fr"]){
 for(const slot of ["COLLECT_SET","POSTCOMMUNION_SET"]){
  const d=data(2),all=rows(d,slot,language),m=resolved(d);
  const responses=all.filter(p=>p.kind==="RESPONSE"&&/amen/i.test(p.latin??""));
  assert.equal(responses.length,2);
  responses.forEach((p,index)=>{
   const out=score(p,all,m);
   assert.equal(out.length,1,"Each genuine concluded group has a reference Amen");
   assert.equal(out[0].sourceOrationGroupIndex,index+1);
   assert.equal(out[0].publicScoreApproved,false);
   assert.equal(out[0].toneFamily,"SOLEMN");
   assert.match(out[0].gabc,/A\(h\)men\.\(h\.\)/);
   assert.equal(out[0].eventId,slot==="COLLECT_SET"?"COLLECT":"POSTCOMMUNION");
   assert.equal(out[0].sourceCueIds[0],p.id);
  });
  assert.equal(score(responses.at(-1),all,resolved(d,"FERIA")).length,0);
  assert.equal(score(responses.at(-1),all,m,"LOW").length,0);
  assert.equal(score(responses.at(-1),all,{...m,provenance:{}}).length,0);
  assert.equal(score(responses.at(-1),all,{...m,proper:{status:"MISSING"}}).length,0);
  const wrong={...all.at(-2),latin:"Unrelated Latin text.",primary:"Unrelated Latin text.",secondary:"Unrelated English text.",alternate:"Unrelated Latin text."};
  assert.equal(score(all.at(-1),[...all.slice(0,-2),wrong,all.at(-1)],m).length,0);
  assert.equal(score(responses.at(-1),[...all,responses.at(-1)],m).length,0);
  const short=data(1,false),shortRows=rows(short,slot,language);
  assert.equal(score(shortRows.at(-1),shortRows,resolved(short)).length,0,
   "Abbreviated conclusion must not receive invented Amen");
 }
}
console.log("PASS 1961 festive oration Amen: exact note, proper, conclusion, commemoration, tone, bilingual and no-public-leak guards");
