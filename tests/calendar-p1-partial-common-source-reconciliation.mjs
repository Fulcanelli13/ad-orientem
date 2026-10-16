import assert from "node:assert/strict";
import {reconcileP1PartialCommon as reconcile,P1_PARTIAL_SOURCE_RULES as rules} from "../src/calendar/p1-partial-common-source-reconciliation.js";
const sections=["Introitus","Oratio","Lectio","Graduale","Evangelium","Offertorium","Secreta","Communio","Postcommunio"];
const langs=["la","en","fr"];
const material=(kind)=>Object.fromEntries(langs.map(lang=>[lang,{map:new Map(
 sections.map(section=>[section,[kind+" "+lang+" "+section+" original Latin bilingual source text"]])
)}]));
const empty=()=>Object.fromEntries(langs.map(lang=>[lang,{map:new Map()}]));
const clone=a=>Object.fromEntries(langs.map(lang=>[lang,{map:new Map(a[lang].map)}]));
// Explicit original Common parent + three alternate orations for C3ap.
const base=material("C3p");const orations=material("C3a");const target=empty();
for(const section of rules["Commune/C3ap"].alternateOrations){
 target.la.map.set(section,orations.la.map.get(section));
}
for(const section of ["Oratio","Secreta","Postcommunio"])base.fr.map.delete(section);
for(const section of rules["Commune/C3ap"].inheritedMass)base.fr.map.delete(section);
const result=reconcile({targetPath:"Commune/C3ap",target,base,orations});
assert.equal(result.status,"PARTIAL_SOURCE_RECOVERY_VERIFIED");
assert.deepEqual(result.missingByLanguage,{la:[],en:[],fr:rules["Commune/C3ap"].inheritedMass});
assert.equal(result.borrowedSections.length,18);
assert.equal(result.authorizedForSaintMass,false);assert.equal(result.route,null);
for(const section of rules["Commune/C3ap"].alternateOrations){
 assert.strictEqual(result.maps.fr.map.get(section),orations.fr.map.get(section));
}
let wrong=clone(target);wrong.la.map.set("Secreta",["Entirely different Latin alternative Secret"]);
assert.equal(reconcile({targetPath:"Commune/C3ap",target:wrong,base,orations}).reason,"ALTERNATE_ORATION_LATIN_MISMATCH");
wrong=clone(target);wrong.en.map.set("Evangelium",["Unrelated Gospel passage from another formulary"]);
assert.equal(reconcile({targetPath:"Commune/C3ap",target:wrong,base,orations}).reason,"INHERITED_MASS_CONFLICT");
// C7: borrowing allowed only when existing target *Latin* equals the
// original C6-1 Latin for that section. Latin Lectio remains missing.
const c7=empty(),femaleDonor=material("C6-1");
for(const section of ["Introitus","Evangelium","Offertorium","Communio"])c7.la.map.set(section,femaleDonor.la.map.get(section));
for(const section of ["Oratio","Secreta","Postcommunio","Graduale"])for(const lang of langs)
 c7[lang].map.set(section,["C7 DISTINCT "+lang+" "+section+" original Mass source"]);
c7.en.map.set("Communio",femaleDonor.en.map.get("Communio"));
const woman=reconcile({targetPath:"Commune/C7",target:c7,base:femaleDonor});
assert.equal(woman.status,"PARTIAL_SOURCE_RECOVERY_VERIFIED");
assert.deepEqual(woman.missingByLanguage.la,["Lectio"]);
assert.ok(woman.borrowedSections.some(x=>x.language==="en"&&x.section==="Introitus"));
assert.ok(woman.borrowedSections.some(x=>x.language==="fr"&&x.section==="Communio"));
assert.ok(!woman.borrowedSections.some(x=>x.section==="Lectio"));
let altered=clone(c7);altered.la.map.set("Introitus",["False Latin identity for unknown saint"]);
const held=reconcile({targetPath:"Commune/C7",target:altered,base:femaleDonor});
assert.equal(held.status,"PARTIAL_SOURCE_RECOVERY_VERIFIED");
assert.ok(!held.borrowedSections.some(x=>x.section==="Introitus"),"No nonidentical Latin may authorize an English/French donor");
assert.equal(reconcile({targetPath:"Commune/NOT_REAL",target,base}).reason,"UNKNOWN_COMMON_VARIANT");
assert.equal(reconcile({targetPath:"Commune/C3ap",target,base,orations:null}).reason,"MISSING_SOURCE_OWNER");
console.log("P1 partial Commons PASS: C3ap shared Easter Mass plus 3 exact Latin orations; C7 7 parity-gated borrowed translations, source gaps remain HELD.");
