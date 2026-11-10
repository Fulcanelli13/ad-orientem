import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as C} from "../src/pray/canonical-data.js";
import {JOSEPH_LITANY_1909_V1 as historic} from "../src/pray/st-joseph-litany-1909.v1.js";
import {
 HOLY_CLOAK_ITALIAN_SOURCE_V1 as source,
 HOLY_CLOAK_ITALIAN_SECTIONS_V1 as sections,
 HOLY_CLOAK_ITALIAN_STEPS_V1 as steps,
 holyCloakItalianStep
} from "../src/pray/holy-cloak-italian-original.v1.js";
assert.equal(Object.keys(C.prayers).length,48,"Do not invent another canonical Prayer ID");
assert.equal(source.id,"st_joseph_holy_cloak_italian");
assert.equal(source.days,30);
assert.equal(source.sameFullTextForEachDay,true);
assert.equal(source.originalLanguage,"it");
assert.equal(source.originalPrintTextCollated,false);
assert.equal(source.historicalTextTranslatedToEn,false);
assert.equal(source.historicalTextTranslatedToFr,false);
assert.equal(source.historicalIndulgencesCurrent,false);
assert.equal(sections.length,19,"All historical numbered sections are required");
assert.deepEqual(sections.map(x=>x.id),"I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX".split(" "));
assert.equal(steps.length,23,"Opening + 19 complete sections + historic litany + closing + optional");
assert.equal(steps[0].id,"opening");
assert.equal(steps[1].id,"I");
assert.equal(steps[19].id,"XIX");
assert.equal(steps[20].id,"litany");
assert.equal(steps[21].id,"closing");
assert.equal(steps[22].id,"optional");
assert.equal(steps[0].openingSignOfCross.id,"foundations_sign_of_cross");
assert.equal(steps[0].openingSignOfCross.text,C.prayers.foundations_sign_of_cross.la);
assert.deepEqual(steps[0].repeat.map(x=>[x.id,x.times]),[["foundations_glory_be",3]]);
for(const p of sections){
 assert.ok(p.it.length>85,p.id+" prayer body incomplete");
 assert.ok(!("en" in p)&&!("fr" in p),"Do not misrepresent Italian as historical EN or FR");
 const card=steps.find(x=>x.id===p.id);
 assert.equal(card.it,p.it);
 assert.equal(card.repeat.some(x=>x.id==="foundations_glory_be"),p.gloryAfter);
}
assert.deepEqual(sections.filter(x=>x.gloryAfter).map(x=>x.id),"I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XIX".split(" "));
const xiii=steps.find(x=>x.id==="XIII");
assert.deepEqual(xiii.repeat.map(x=>[x.id,x.times]),[["foundations_eternal_rest",3],["foundations_glory_be",1]]);
assert.match(steps.find(x=>x.id==="XVII").it,/abbi pietà di me/);
const xviii=steps.find(x=>x.id==="XVIII").it;
assert.match(xviii,/prega Gesù che venga nell’anima mia/);
assert.match(xviii,/un santo desiderio del Paradiso/);
assert.match(xviii,/spiri in pace tra Voi l’anima mia/);
assert.equal(xviii.split("\n").length,38,"Printed Italian section XVIII must retain 38 petition lines");
assert.deepEqual(xviii.split("\n").map(line=>line.slice(0,2)),Array.from({length:38},(_,i)=>i%2?"℟.":"℣."));
assert.equal(source.sectionXVIIIOriginalPresentation,"SALPAN_ITALIAN_PDF_HAS_PRINTED_ALTERNATING_VERSICLE_RESPONSE_SIGLA");
assert.equal(source.sectionXVIIISiglaOriginal1882Status,"NOT_COLLATED");
assert.equal(steps[20].sourceId,historic.id);
assert.equal(steps[20].body,historic.la);
assert.equal(steps[20].includesCollect,true);
assert.equal(historic.la.split("\n").filter(x=>x.endsWith(", ora pro nobis.")).length,26,
 "Historical litany excludes the seven 2021 additions");
assert.equal(C.prayers.devotion_litany_st_joseph.la.split("\n").filter(x=>x.endsWith(", ora pro nobis.")).length,33);
assert.equal(steps[22].body,C.prayers.devotion_ad_te_beate_ioseph.la);
assert.match(steps[22].note,/optional addition/);
assert.match(steps[21].body,/dègnati di essermi dal cielo custode/);
assert.match(steps[21].body,/Impetrami quelle grazie/);
assert.equal(holyCloakItalianStep(-1),null);
assert.equal(holyCloakItalianStep(23),null);
assert.equal(holyCloakItalianStep(18).id,"XVIII");
assert.equal(holyCloakItalianStep(20).id,"litany");
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const marker of [
 "function renderHolyCloakItalian(){","data-ao-holy-cloak-italian-reader",
 "data-ao-holy-cloak-day-count=\"30\"","data-ao-holy-cloak-italian-limits",
 "data-ao-holy-cloak-opening-cross","data-ao-holy-cloak-common",
 "data-p435930-hc-prev","data-p435930-hc-next","data-p435930-hc-finish",
 "data-ao-holy-cloak-italian-open","HOLY_CLOAK_ITALIAN_SOURCE_V1.id"
])assert.ok(ui.includes(marker),"Missing native Holy Cloak reader contract "+marker);
assert.match(ui,/original 1882 print wording/);
assert.match(ui,/English and French are new editorial translations requiring review/);
assert.deepEqual(steps[20].vernacular,{en:historic.en,fr:historic.fr});
assert.deepEqual(source.modernEditorialTranslations,["en","fr"]);
assert.equal(source.modernEditorialLanguagesReview,"DRAFT_NOT_HISTORICAL_WITNESSES");
console.log("Holy Cloak IT: 19 complete source sections, offline 23-step reader, proper historic pre-2021 litany, opening and 3-fold Gloria, XIII 3-fold Requiem, closing and optional prayer PASS");
