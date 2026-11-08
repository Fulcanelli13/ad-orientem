import assert from "node:assert/strict";
import {JULY07_REFERENCE_GABC,referenceScoresForParagraph,PROPER_REFERENCE_REGISTRY_STATUS} from
 "../src/mass/reader-inline-proper-reference.js";
import {ALL_SAINTS_REFERENCE_SCORES} from "../src/mass/reader-inline-all-saints-reference.js";
import {EPIPHANY_REFERENCE_SCORES} from "../src/mass/reader-inline-epiphany-reference.js";
import {IMMACULATE_CONCEPTION_REFERENCE_SCORES} from "../src/mass/reader-inline-immaculate-reference.js";
import {PROPER_REFERENCE_BINDINGS,PROPER_REFERENCE_LABELS,PROPER_REFERENCE_REGISTRY_SCHEMA,
 createProperReferenceRegistry} from "../src/mass/reader-inline-proper-registry.js";

assert.equal(PROPER_REFERENCE_REGISTRY_STATUS.schema,PROPER_REFERENCE_REGISTRY_SCHEMA);
assert.equal(PROPER_REFERENCE_REGISTRY_STATUS.scoreCount,18);
assert.equal(PROPER_REFERENCE_REGISTRY_STATUS.bindingCount,21);
assert.equal(PROPER_REFERENCE_BINDINGS.length,21);
assert.equal(PROPER_REFERENCE_LABELS.OFFERTORY,"Offertory");
assert.equal(PROPER_REFERENCE_LABELS.COMMUNION,"Communion");

const july={date:"2026-07-07",proper:{data:{sourcePath:"Sancti/07-07"}},overlays:[]};
const saints={date:"2026-11-01",proper:{data:{sourcePath:"Sancti/11-01"}},overlays:[]};
const texts=[
 {id:"INTROIT.1",primary:"Gaudeámus omnes in Dómino, diem festum celebrántes sub honóre Sanctórum ómnium."},
 {id:"GRADUAL.1",primary:"Timéte Dóminum, omnes Sancti ejus: quóniam nihil deest timéntibus eum."},
 {id:"ALLELUIA_TRACT_SEQUENCE.1",primary:"Veníte ad me, omnes, qui laborátis et oneráti estis: et ego refíciam vos."},
 {id:"OFFERTORY.1",primary:"Justórum ánimæ in manu Dei sunt, et non tanget illos torméntum malítiæ."},
 {id:"COMMUNION.1",primary:"Beáti mundo corde, quóniam ipsi Deum vidébunt; beáti pacífici."}
];
const selected=(p,m=saints,form="MISSA_CANTATA_SIMPLE")=>
 referenceScoresForParagraph({paragraph:p,resolvedMass:m,form}).map(s=>s.id);
assert.deepEqual(texts.map(p=>selected(p)),[
 ["GREGOBASE-752"],["GREGOBASE-371"],["GREGOBASE-1237"],
 ["GREGOBASE-835"],["GREGOBASE-345"]
]);
const julyText=[
 {id:"INTROIT.1",primary:"Sacerdótes tui, Dómine, índuant justítiam, et sancti tui exsúltent."},
 {id:"GRADUAL.1",primary:"Sacerdótes ejus índuam salutári: et sancti ejus exsultatióne exsultábunt."},
 {id:"ALLELUIA_TRACT_SEQUENCE.1",primary:"Jurávit Dóminus, et non pœnitébit eum."}
];
assert.deepEqual(julyText.map(p=>selected(p,july)),[
 ["GREGOBASE-48"],["GREGOBASE-415"],["GREGOBASE-1187"]
]);
// The same source registry works across liturgical years, not one hardcoded
// 2026 date. No copying of the GABC bodies into calendar records.
assert.deepEqual(texts.map(p=>selected(p,{...saints,date:"2027-11-01"})),
 texts.map(p=>selected(p)));
assert.deepEqual(julyText.map(p=>selected(p,{...july,date:"2027-07-07"})),
 julyText.map(p=>selected(p,july)));
// A Common or other independently verified Proper can reference the SAME
// archived GABC from any appointed date, with no additional engraving code.
const reusable=[...JULY07_REFERENCE_GABC,...ALL_SAINTS_REFERENCE_SCORES,...EPIPHANY_REFERENCE_SCORES,...IMMACULATE_CONCEPTION_REFERENCE_SCORES];
const commonBinding={...PROPER_REFERENCE_BINDINGS.find(x=>x.scoreId==="GREGOBASE-345"),
 sourcePath:"Commune/VerifiedCommon",monthDay:null};
const common=createProperReferenceRegistry({scores:reusable,
 bindings:[...PROPER_REFERENCE_BINDINGS,commonBinding]});
assert.deepEqual(common.select({paragraph:texts[4],
 resolvedMass:{date:"2026-09-03",proper:{sourcePath:"Commune/VerifiedCommon"}},
 form:"SOLEMN"}).map(s=>s.id),["GREGOBASE-345"]);
assert.deepEqual(common.select({paragraph:texts[4],
 resolvedMass:{date:"2026-10-18",proper:{sourcePath:"Commune/VerifiedCommon"}},
 form:"SOLEMN"}).map(s=>s.id),["GREGOBASE-345"]);
// Source provenance, calendar appointment, role, text and sung form fail
// closed. A matching title or another feast can never select these scores.
const blocked=[
 selected(texts[0],{...saints,date:"2026-11-02"}),
 selected(texts[0],{...saints,proper:{sourcePath:"Sancti/11-02"}}),
 selected(texts[0],saints,"LOW"),
 selected(texts[0],saints,"MISSA_PRIVATA"),
 selected(texts[0],{...saints,overlays:["REQUIEM"]}),
 selected({...texts[0],primary:"A different Introit"}),
 selected({...texts[0],id:"COMMUNION.1"}),
 selected({...texts[0],kind:"RUBRIC"}),
 selected(julyText[0],{...july,date:"2026-07-08"}),
 selected(julyText[0],saints)
];
assert.ok(blocked.every(a=>a.length===0),JSON.stringify(blocked));
const combined={...julyText[1],primary:julyText[1].primary+" "+julyText[2].primary};
assert.deepEqual(selected(combined,july),["GREGOBASE-415","GREGOBASE-1187"]);
assert.deepEqual(selected({...julyText[1],primary:julyText[2].primary},july),[]);
assert.throws(()=>createProperReferenceRegistry({scores:[reusable[0],reusable[0]]}),
 /INVALID_REFERENCE_SCORE_CATALOG/);
assert.throws(()=>createProperReferenceRegistry({scores:reusable,
 bindings:[{...commonBinding,scoreId:"GREGOBASE-XYZ"}]}),
 /INVALID_REFERENCE_SOURCE_BINDING/);
console.log("PROPER_SOURCE_REFERENCE_REGISTRY_PASS "+
 JSON.stringify({catalog:18,bindings:21,allSaints:5,july:3,epiphany:5,immaculate:5,commonReuse:true}));
