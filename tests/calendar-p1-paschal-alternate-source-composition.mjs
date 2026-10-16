import assert from "node:assert/strict";
import {composeP1OneMartyrPaschalAltera as compose,
 P1_ONE_MARTYR_PASCHAL_ALTERA as rule} from "../src/calendar/p1-paschal-alternate-source-composition.js";
const LANG=["la","en","fr"];
const source=(kind)=>Object.fromEntries(LANG.map(lang=>[lang,{map:new Map(
  [...rule.inheritedSections,...rule.overrideSections].map(section=>[
    section,[kind+"/"+section+"/"+lang+" source section text"],
  ])
)}]));
const base=source("PASCAL_BASE"),alt=source("ALTERNATE_ORATIONS");
const target=Object.fromEntries(LANG.map(lang=>[lang,{map:new Map()}]));
for(const section of rule.overrideSections)target.la.map.set(section,alt.la.map.get(section));
target.fr.map.set("Oratio",alt.fr.map.get("Oratio"));
const result=compose({target,base,orations:alt});
assert.equal(result.status,"SOURCE_COMPOSITION_VERIFIED",result.reason);
assert.equal(result.baseSourcePath,"Commune/C2p");
assert.equal(result.alternativeOrationsSourcePath,"Commune/C2a");
assert.ok(result.borrowedSections.length>=16);
assert.equal(result.route,null);
assert.equal(result.approvedForMass,false);
assert.equal(result.authorizedForOptionalSaint,false);
for(const lang of LANG){
  for(const section of rule.inheritedSections)
    assert.strictEqual(result.composition[lang].map.get(section),base[lang].map.get(section));
  for(const section of rule.overrideSections)
    assert.strictEqual(result.composition[lang].map.get(section),alt[lang].map.get(section));
}
assert.equal(target.en.map.has("Oratio"),false,"No mutation of target source");
const mutate=src=>Object.fromEntries(LANG.map(lang=>[lang,{map:new Map(src[lang].map)}]));
let bad=mutate(target);
bad.la.map.set("Oratio",["Different saint Collect text"]);
assert.equal(compose({target:bad,base,orations:alt}).reason,"ALTERNATIVE_ORATION_LATIN_IDENTITY_MISMATCH");
bad=mutate(target);bad.en.map.set("Introitus",["Wrong inherited Common"]);
assert.equal(compose({target:bad,base,orations:alt}).reason,"INHERITED_SECTION_CONFLICT");
bad=mutate(base);bad.fr.map.delete("Graduale");
assert.equal(compose({target,base:bad,orations:alt}).reason,"BASE_MASS_SECTION_ABSENT");
bad=mutate(alt);bad.en.map.delete("Secreta");
assert.equal(compose({target,base,orations:bad}).reason,"ALTERNATIVE_ORATION_TRANSLATION_ABSENT");
assert.equal(compose({target,base,orations:alt,rule:{...rule}}).reason,"UNKNOWN_SOURCE_DECLARATION");
console.log("P1 Paschal alternate: strict source declaration, 3 alternate Latin orations, 3 bilingual maps, no selection or text copy; all negative gates pass.");
