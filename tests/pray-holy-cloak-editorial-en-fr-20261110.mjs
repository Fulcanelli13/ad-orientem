import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {HOLY_CLOAK_EDITORIAL_EN_FR_V1 as tr} from "../src/pray/holy-cloak-editorial-en-fr.v1.js";
import {HOLY_CLOAK_ITALIAN_SOURCE_V1 as source,HOLY_CLOAK_ITALIAN_SECTIONS_V1 as it,HOLY_CLOAK_ITALIAN_STEPS_V1 as steps} from "../src/pray/holy-cloak-italian-original.v1.js";
import {JOSEPH_LITANY_1909_V1 as oldLitany} from "../src/pray/st-joseph-litany-1909.v1.js";
assert.equal(tr.sourceId,source.id);
assert.equal(tr.sourceLanguage,"it");
assert.equal(tr.editorialTranslationsNotHistoric,true);
assert.equal(tr.provisionalUntilReview,true);
assert.equal(tr.verifiedSourceTextByWorkEdition,false);
assert.match(tr.languagePolicy,/MODERN_AD_ORIENTEM_EDITORIAL_TRANSLATION/);
assert.equal(tr.sections.length,19);
assert.deepEqual(tr.sections.map(x=>x.id),it.map(x=>x.id));
for(const [i,x] of tr.sections.entries()){
 assert.ok(x.en.length>75,x.id+": English missing or truncated");
 assert.ok(x.fr.length>75,x.id+": French missing or truncated");
 assert.notEqual(x.en,it[i].it,x.id+": English is not Italian copy");
 assert.notEqual(x.fr,it[i].it,x.id+": French is not Italian copy");
 assert.ok(!x.en.includes("UNCHECKED SOURCE")&&!x.fr.includes("UNCHECKED SOURCE"));
}
assert.ok(tr.opening.en.startsWith("℣. Jesus, Joseph and Mary,"));
assert.ok(tr.opening.fr.startsWith("℣. Jésus, Joseph et Marie,"));
assert.equal(tr.opening.en.split("\n").length,7);
assert.equal(tr.opening.fr.split("\n").length,7);
assert.ok(tr.closing.en.length>600&&tr.closing.fr.length>650);
const xviii=tr.sections.find(x=>x.id==="XVIII");
assert.equal(xviii.en.split("\n").length,it.find(x=>x.id==="XVIII").it.split("\n").length);
assert.equal(xviii.fr.split("\n").length,it.find(x=>x.id==="XVIII").it.split("\n").length);
assert.match(xviii.en,/final perseverance/);
assert.match(xviii.fr,/persévérance finale/);
assert.equal(tr.sectionXVIIINotationPolicy,"UNMARKED_ALTERNATING_PETITIONS_NOT_VERSICLE_RESPONSE_SIGNS");
for(const x of [xviii.en,xviii.fr,it.find(p=>p.id==="XVIII").it]){
 assert.doesNotMatch(x,/^[℣℟]\\./m,"Section XVIII witness has no printed versicle-response sigla");
 assert.equal(x.split("\\n").length,38,"All petition/answer lines must remain intact");
}
assert.deepEqual(source.modernEditorialTranslations,["en","fr"]);
assert.equal(source.modernEditorialLanguagesReview,"DRAFT_NOT_HISTORICAL_WITNESSES");
assert.equal(steps.find(x=>x.id==="litany").vernacular.en,oldLitany.en);
assert.equal(steps.find(x=>x.id==="litany").vernacular.fr,oldLitany.fr);
assert.equal(steps.find(x=>x.id==="litany").body,oldLitany.la);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const needle of [
 'import {HOLY_CLOAK_EDITORIAL_EN_FR_V1}',
 "data-ao-holy-cloak-language",
 "data-p435930-hc-lang",
 "HOLY_CLOAK_LANGUAGE=code",
 "if(!['it','en','fr'].includes(code))return",
 "step.vernacular?.[face]",
 "translations.sections.find(x=>x.id===step.id)",
 "getCommon(step.sourceId)",
 "getCommon(r.id)",
 "data-ao-holy-cloak-italian-reader",
 "not historically printed",
 "editorial translations requiring review"
])assert.ok(ui.includes(needle),"Missing translation UI source guard: "+needle);
console.log("Holy Cloak: 19/19 editorial English and French stages, opening and closing, source Italian, historical litany trilingual, labelled unreviewed translations PASS");
