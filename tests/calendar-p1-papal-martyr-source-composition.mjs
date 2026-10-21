import assert from "node:assert/strict";
import {composeP1PapalMartyrSource as compose,P1_PAPAL_MARTYR_MASS_OWNER as OWNER} from "../src/calendar/p1-papal-martyr-source-composition.js";
const langs=["la","en","fr"];
const donor=Object.fromEntries(langs.map(lang=>[lang,{map:new Map(
 [...OWNER.inherited,"Oratio"].map(k=>[k,["DONOR ORIGINAL "+lang+" "+k+" source data authentic for form"]])
)}]));
const blank=(path)=>Object.fromEntries(langs.map(lang=>[lang,{map:new Map([["Oratio",["PAPAL MARTYR "+path+" "+lang+" distinct saint Collect"]]])}]));
const clone=x=>Object.fromEntries(langs.map(lang=>[lang,{map:new Map(x[lang].map)}]));
for(const path of OWNER.targets){
 const target=blank(path);
 for(const section of OWNER.inherited)target.la.map.set(section,donor.la.map.get(section));
 const result=compose({targetPath:path,target,donor});
 assert.equal(result.status,"SOURCE_COMPOSITION_VERIFIED",path+":"+(result.reason??""));
 assert.equal(result.latinSectionParityCount,8);
 assert.equal(result.borrowedSections.length,16);
 assert.equal(result.uniqueCollectSourcePath,path);
 assert.equal(result.approvedForMass,false);
 assert.equal(result.route,null);
 for(const lang of langs){
  assert.strictEqual(result.maps[lang].map.get("Oratio"),target[lang].map.get("Oratio"));
  for(const section of OWNER.inherited)
   assert.strictEqual(result.maps[lang].map.get(section),donor[lang].map.get(section));
 }
 assert.equal(target.fr.map.has("Introitus"),false,"Never mutate original source maps");
 let bad=clone(target);bad.la.map.set("Lectio",["Other saint's Latin reading"]);
 assert.equal(compose({targetPath:path,target:bad,donor}).reason,"ORIGINAL_LATIN_IDENTITY_MISMATCH");
 bad=clone(target);bad.en.map.set("Oratio",[]);
 assert.equal(compose({targetPath:path,target:bad,donor}).reason,"VARIANT_COLLECT_MISSING");
 bad=clone(donor);bad.fr.map.delete("Secreta");
 assert.equal(compose({targetPath:path,target,donor:bad}).reason,"ORIGINAL_DONOR_LANGUAGE_MISSING");
 bad=clone(target);bad.en.map.set("Communio",["Conflicting source owner Communion"]);
 assert.equal(compose({targetPath:path,target:bad,donor}).reason,"CONTRADICTORY_INHERITED_TEXT");
}
assert.equal(compose({targetPath:"Commune/C3",target:blank("fake"),donor}).reason,"UNSUPPORTED_PAPAL_VARIANT");
console.log("P1 papal martyr Common PASS: 2 exact declared C4b source aliases, each 8 Latin-identical sections, 16 borrowed bilingual sections, distinct papal martyr Collects untouched.");
