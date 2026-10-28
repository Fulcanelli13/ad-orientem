import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {GOOD_DEATH_DYING_V384 as d,GOOD_DEATH_DYING_SOURCES_V384 as s} from "../src/pray/good-death-data.js";
const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
assert.match(s.latinProficiscere,/RitualRom1937-OCR\.pdf/);
assert.match(s.romanJoseph1922,/AAS-14-1922/);
assert.match(s.frenchEarlierWitness,/carmeldelisieux/);
assert.match(s.latinAlternate1963,/Monastic/);
for(const lang of ["la","en","fr"]){
 assert.ok(d.proficiscere[lang].length>500,"Full bedside prayer "+lang);
 assert.match(d.proficiscere[lang],lang==="la"?/in nomine beati Ioseph/:lang==="en"?/in the name of blessed Joseph/:/au nom du bienheureux Joseph/);
 assert.match(d.proficiscere[lang],lang==="la"?/in nomine Virtutum/:lang==="en"?/in the name of the Virtues/:/au nom des Vertus/);
 assert.match(d.proficiscere[lang],lang==="la"?/Virginis Mariæ/:lang==="en"?/Virgin Mary, Mother of God/:/Vierge Marie, Mère de Dieu/);
}
assert.match(d.proficiscere.edition,/1962_EXACT_EDITION_PENDING/);
assert.match(d.proficiscere.languageStatus,/EN_FR_EDITORIAL_ALIGNED/);
assert.match(runtime,/data-ao-bedside-medical-warning/);
assert.match(runtime,/Call a priest now/);
assert.match(runtime,/never simulates priestly absolution/);
assert.match(runtime,/data-tp381-route="learn\.rites\.sick"/);
assert.match(runtime,/dead_eternal_rest_singular/);
assert.match(runtime,/dead_de_profundis/);
assert.match(runtime,/Rituale Romanum · 1937/);
assert.match(runtime,/collation exacte de l’édition romaine de 1962/);
console.log("B05 bedside: actual post-1922 Joseph/Mary/Virtues Latin; EN/FR editorial; priest/medical and after-death safeguards PASS");
