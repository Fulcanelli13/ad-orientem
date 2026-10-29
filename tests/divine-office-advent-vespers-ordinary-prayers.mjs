import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {ADVENT_VESPERS_REMAINDER_SCHEMA} from "../src/office/advent-vespers-remainder-research.js";
import {reviewAdventVespersOrdinaryPrayerSources} from "../src/office/advent-vespers-ordinary-prayers.js";
const pin=DIVINUM_OFFICIUM_PIN,prayers="Psalterium/Common/Prayers";
function ordinary(){return {
 schema:ADVENT_VESPERS_REMAINDER_SCHEMA,
 status:"ORDINARY_ORDER_SOURCE_OBSERVED_CONDITIONAL_UNRESOLVED",
 sourceRevision:pin,sourcePath:"Ordinarium/Vespera",
 conditionalRubricsResolved:false,firstVespersOrdinaryAuthorized:false,
 completeHourVerified:false,publishable:false,published:false};}
function fixture({mutate=()=>{}}={}){
 const reads=[];
 const readSource=async(path,language)=>{
  reads.push([path,language]);
  const map=new Map([
   ["Pater noster",["v. "+language+" Pater noster"]],
   ["Ave Maria",["v. "+language+" Ave Maria"]],
   ["Deus in adjutorium",["V. "+language+" Deus",
    "R. "+language+" Domine","v. Gloria Patri","Sicut erat"]],
   ["Alleluia",["v. "+language+" Alleluia",
    "v. "+language+" Laus tibi"]],
   ["Dominus",["V. "+language+" Dominus vobiscum",
    "R. "+language+" Et cum spiritu",
    "V. "+language+" Domine exaudi",
    "R. "+language+" Et clamor","/:secondary prayer omitted:/"]],
   ["Benedicamus Domino",["V. "+language+" Benedicamus","R. "+language+" Deo gratias"]],
   ["Fidelium animae",["V. "+language+" Fidelium animae","R. "+language+" Amen"]]
  ]);
  const result={sourcePath:path,sourceRevision:pin,language,map};
  mutate(result);
  return result;
 };
 return {reads,readSource};
}
test("seven original Opening / Conclusion source keys are present per language without selecting prayer variants",async()=>{
 const f=fixture();
 const r=await reviewAdventVespersOrdinaryPrayerSources({
  ordinaryWitness:ordinary(),readSource:f.readSource
 });
 assert.equal(r.status,"OPENING_AND_CONCLUSION_SOURCE_CANDIDATES_UNVERIFIED");
 assert.equal(r.sourcePrayerSectionCountPerLocale,7);
 assert.equal(f.reads.length,3);
 for(const lang of ["la","en","fr"]){
  assert.deepEqual(r.languages[lang].opening.map(x=>x.sourceId),[
   prayers+"#Pater noster",prayers+"#Ave Maria",
   prayers+"#Deus in adjutorium",prayers+"#Alleluia"
  ]);
  assert.deepEqual(r.languages[lang].ending.map(x=>x.sourceId),[
   prayers+"#Dominus",prayers+"#Benedicamus Domino",
   prayers+"#Fidelium animae"
  ]);
  assert.equal(r.languages[lang].priestAndNonPriestDialogueBothRetained,true);
  assert.equal(r.languages[lang].alleluiaAndPassiontideAlternativesRetained,true);
 }
 assert.equal(r.priestOrLayVariantVerified,false);
 assert.equal(r.selected1960Ordinary,false);
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.publishable,false);
});
test("missing French dismissal, Ave or Alleluia blocks entire component",async()=>{
 for(const key of ["Fidelium animae","Ave Maria","Alleluia"]){
  const f=fixture({mutate:doc=>{
   if(doc.language==="fr")doc.map.delete(key);
  }});
  const r=await reviewAdventVespersOrdinaryPrayerSources({
   ordinaryWitness:ordinary(),readSource:f.readSource
  });
  assert.equal(r.reason,"OFFICE_VESPERS_PRAYER_SECTION_MISSING:fr:"+key);
  assert.equal(r.publishable,false);
 }
});
test("source formula corruption and wrong pinned revision are refused",async()=>{
 for(const mutate of [
  doc=>{if(doc.language==="en")doc.map.get("Dominus")[0]="$Alternate"},
  doc=>{if(doc.language==="la")doc.map.get("Deus in adjutorium").pop()},
  doc=>{if(doc.language==="fr")doc.sourceRevision="0".repeat(40)}
 ]){
  const r=await reviewAdventVespersOrdinaryPrayerSources({
   ordinaryWitness:ordinary(),readSource:fixture({mutate}).readSource
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.published,false);
 }
});
test("invalid Ordinary witness never fetches new prayers",async()=>{
 const f=fixture();
 const r=await reviewAdventVespersOrdinaryPrayerSources({
  ordinaryWitness:{...ordinary(),firstVespersOrdinaryAuthorized:true},
  readSource:f.readSource
 });
 assert.equal(r.status,"WITHHELD");
 assert.equal(f.reads.length,0);
});
