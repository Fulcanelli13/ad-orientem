import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {composeMassTextsSheet,MASS_TEXTS_SHEET_VERSION} from "../src/mass/mass-texts-sheet.js";

const text={lat:"Dominus vobiscum.",en:"The Lord be with you.",fr:"Le Seigneur soit avec vous."};
const proper={
 sourcePath:"Sancti/10-07",introit:text,collects:[text],epistle:text,
 gradual:text,gospel:text,offertory:text,secrets:[text],
 preface:text,communion:text,postcommunions:[text],
};
const en=composeMassTextsSheet({proper,title:"Our Lady of the Rosary",date:"2026-10-07",language:"en"});
assert.equal(MASS_TEXTS_SHEET_VERSION,"mass-texts-sheet-b3-v1");
assert.equal(en.heading,"Mass texts");
assert.equal(en.title,"Our Lady of the Rosary");
assert.equal(en.date,"Wednesday 7 October");
assert.equal(en.available,true);
assert.equal(en.sections[0].id,"INTROIT");
assert.equal(en.sections[0].paragraphs[0].latin,"Dominus vobiscum.");
assert.equal(en.sections[0].paragraphs[0].vernacular,"The Lord be with you.");
assert.deepEqual(en.sections.map(x=>x.id),[
 "INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL",
 "GOSPEL","OFFERTORY","SECRET_SET","PREFACE",
 "COMMUNION","POSTCOMMUNION_SET",
],"Mass texts must follow the source-owned reader Proper slots, not an invented order");
assert.equal(en.sections.some(x=>x.id==="ALLELUIA_TRACT_SEQUENCE"),false,
 "Do not show a made-up Alleluia when the source has no separate chant");
const fr=composeMassTextsSheet({proper,title:"Notre-Dame du Rosaire",date:"2026-10-07",language:"fr"});
assert.equal(fr.heading,"Textes de la messe");
assert.equal(fr.date,"mercredi 7 octobre");
assert.equal(fr.sections[0].label,"Introït");
assert.equal(fr.sections[0].paragraphs[0].vernacular,"Le Seigneur soit avec vous.");
const unresolved=composeMassTextsSheet({proper,title:"Feria",date:"2026-10-07",sourceReady:false});
assert.equal(unresolved.available,false);
assert.deepEqual(unresolved.sections,[],"Source-gated preview must not leak unverified proper");
const missing=composeMassTextsSheet({proper:{sourcePath:"Fake/none"},date:"2026-10-07"});
assert.equal(missing.available,false,"A source without verified text cannot be presented as ready");
const source=readFileSync("src/mass/mass-texts-sheet.js","utf8");
assert.match(source,/\.aoMassTextsHeader h2\{flex:1 1 auto;min-width:0/,
 "Pushed title must be allowed to shrink, rather than stretching its back control");
assert.match(source,/\.aoMassTextsHeader button\{flex:0 0 44px;width:44px;height:44px/,
 "Back button must remain exactly 44 × 44px");
assert.match(source,/aria-modal/);
assert.match(source,/onKey/);
assert.match(source,/opener\.focus/);
console.log("PASS source-owned Mass texts EN/FR, order, fail-closed state and B3 header geometry");
