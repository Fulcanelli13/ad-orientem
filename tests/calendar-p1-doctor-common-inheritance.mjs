import assert from "node:assert/strict";
import {reconcileP1NonPontiffDoctorSources,P1_DOCTOR_SOURCE_OWNER as OWNER} from "../src/calendar/p1-doctor-common-inheritance.js";

const make=(language,kind)=>{
 const map=new Map();
 for(const section of OWNER.sharedSections){
   const v=language==="la"?"Latín source verified phrase, Deus qui populo tuo vitam dedit "+section:
    language==="en"?"In English this is the verified common Doctor text "+section:
    "En français, le texte commun du docteur est authentifié "+section;
   if(kind==="bishop"||language==="la")map.set(section,[v]);
 }
 for(const section of OWNER.distinctiveSections){
   const v="DISTINCTIVE "+kind+" "+language+" "+section+" de nostro Confessore Doctore";
   map.set(section,[v]);
 }
 return {map};
};
const target=Object.fromEntries(["la","en","fr"].map(lang=>[lang,make(lang,"nonPontiff")]));
const shared=Object.fromEntries(["la","en","fr"].map(lang=>[lang,make(lang,"bishop")]));
const result=reconcileP1NonPontiffDoctorSources({target,shared});
assert.equal(result.status,"SOURCE_COMPOSITION_VERIFIED",result.reason);
assert.equal(result.borrowedSections.length,OWNER.sharedSections.length*2);
assert.deepEqual(result.borrowedSections.map(x=>x.section).sort(),OWNER.sharedSections.flatMap(s=>[s,s]).sort());
assert.ok(result.borrowedSections.every(x=>x.latinParityVerified===true&&x.originalSourcePath==="Commune/C4a"));
for(const lang of ["la","en","fr"]){
 for(const section of OWNER.distinctiveSections)assert.strictEqual(
  result.mappedSources[lang].map.get(section),target[lang].map.get(section),"Non-Pontiff prayers must never be substituted");
 for(const section of OWNER.sharedSections)assert.deepEqual(
  result.mappedSources[lang].map.get(section),
  lang==="la"?target[lang].map.get(section):shared[lang].map.get(section));
}
assert.equal(target.en.map.has("Oratio"),false,"Never mutate source-owned target");
assert.equal(result.route,null);
assert.equal(result.approvedForMass,false);
const clone=t=>Object.fromEntries(Object.entries(t).map(([lang,v])=>[lang,{map:new Map(v.map)}]));
let bad=clone(target);bad.la.map.set("Oratio",["A totally different Collect for another saint"]);
assert.equal(reconcileP1NonPontiffDoctorSources({target:bad,shared}).reason,"SHARED_LATIN_PARITY_MISMATCH");
bad=clone(target);bad.en.map.delete("Secreta");
assert.equal(reconcileP1NonPontiffDoctorSources({target:bad,shared}).reason,"MISSING_DISTINCTIVE_NON_PONTIFF_ORATION");
bad=clone(shared);bad.fr.map.delete("Introitus");
assert.equal(reconcileP1NonPontiffDoctorSources({target,shared:bad}).reason,"MISSING_SHARED_VERNACULAR");
assert.equal(reconcileP1NonPontiffDoctorSources({target,shared,expected:{target:"Commune/C4a",shared:"Commune/C5a"}}).reason,"UNAPPROVED_COMMON_INHERITANCE_OWNER");
bad=clone(target);bad.en.map.set("Oratio",["Existing non-Pontiff translation must prevail"]);
const own=reconcileP1NonPontiffDoctorSources({target:bad,shared});
assert.equal(own.status,"SOURCE_COMPOSITION_VERIFIED");
assert.strictEqual(own.mappedSources.en.map.get("Oratio"),bad.en.map.get("Oratio"));
assert.equal(own.borrowedSections.length,OWNER.sharedSections.length*2-1);
// Exercise the exact documented live Latin C5a layout: repeated shared
// Collect after a historical note, including the source's cœlis/cælis form.
const sharedCollect="Deus, qui pópulo tuo ætérnæ salútis beátum N. minístrum tribuísti: præsta, quǽsumus; ut, quem Doctórem vitæ habúimus in terris, intercessórem habére mereámur in cœlis.";
const inherited=clone(target), donor=clone(shared);
donor.la.map.set("Oratio",[sharedCollect,"","","$Per Dominum."]);
inherited.la.map.set("Oratio",[sharedCollect,"(sed communi Summorum Pontificum)",sharedCollect.replace("cœlis","cælis"),"$Per Dominum."]);
const actualShape=reconcileP1NonPontiffDoctorSources({target:inherited,shared:donor});
assert.equal(actualShape.status,"SOURCE_COMPOSITION_VERIFIED",actualShape.reason+":"+actualShape.section);
assert.equal(actualShape.borrowedSections.length,OWNER.sharedSections.length*2);
const otherCollect=clone(inherited);otherCollect.la.map.set("Oratio",[
 sharedCollect,"(sed communi Summorum Pontificum)",
 "Deus, beate magister, another unrelated Mass Collect beyond the first common prayer.",
 "$Per Dominum."
]);
assert.equal(reconcileP1NonPontiffDoctorSources({target:otherCollect,shared:donor}).reason,"SHARED_LATIN_PARITY_MISMATCH");
const unapprovedRubric=clone(inherited);unapprovedRubric.la.map.set("Oratio",[
 sharedCollect,"(other unknown rubric)",sharedCollect,"$Per Dominum."
]);
assert.equal(reconcileP1NonPontiffDoctorSources({target:unapprovedRubric,shared:donor}).reason,"SHARED_LATIN_PARITY_MISMATCH");
console.log("P1 Doctor Common source inheritance: 18 missing translated sections recovered by shared owner only after exact Latin parity; distinctive prayers preserved; negative gates pass.");
