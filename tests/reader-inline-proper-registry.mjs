import assert from "node:assert/strict";
import {JULY07_REFERENCE_GABC,referenceScoresForParagraph,PROPER_REFERENCE_REGISTRY_STATUS} from
 "../src/mass/reader-inline-proper-reference.js";
import {ALL_SAINTS_REFERENCE_SCORES} from "../src/mass/reader-inline-all-saints-reference.js";
import {ST_ANDREW_REFERENCE_SCORES} from "../src/mass/reader-inline-st-andrew-reference.js";
import {MAJOR_FEAST_REFERENCE_SCORES} from "../src/mass/reader-inline-major-feasts-reference.js";
import {PROPER_REFERENCE_BINDINGS,PROPER_REFERENCE_LABELS,PROPER_REFERENCE_REGISTRY_SCHEMA,
 createProperReferenceRegistry} from "../src/mass/reader-inline-proper-registry.js";

assert.equal(PROPER_REFERENCE_REGISTRY_STATUS.schema,PROPER_REFERENCE_REGISTRY_SCHEMA);
assert.equal(PROPER_REFERENCE_REGISTRY_STATUS.scoreCount,23);
assert.equal(PROPER_REFERENCE_REGISTRY_STATUS.bindingCount,27);
assert.equal(PROPER_REFERENCE_BINDINGS.length,27);
assert.equal(PROPER_REFERENCE_LABELS.OFFERTORY,"Offertory");
assert.equal(PROPER_REFERENCE_LABELS.COMMUNION,"Communion");
// Advent III is tied to the selected Proper source, not a fixed date.
const gaudete={date:"2026-12-13",proper:{data:{sourcePath:"Tempora/Adv3-0"}},overlays:[]};
const epiphany={date:"2027-01-06",proper:{data:{sourcePath:"Sancti/01-06"}},overlays:[]};
const newFeastTexts=[
 {id:"INTROIT.1",primary:"Gaudéte in Dómino semper: íterum dico, gaudéte. Modéstia vestra nota sit ómnibus homínibus."},
 {id:"GRADUAL.1",primary:"Qui sedes, Dómine, super Chérubim, éxcita poténtiam tuam, et veni."},
 {id:"ALLELUIA_TRACT_SEQUENCE.1",primary:"Excita, Dómine, potentiam tuam, et veni, ut salvos fácias nos."},
 {id:"OFFERTORY.1",primary:"Benedixísti, Dómine, terram tuam: avertísti captivitátem Jacob: remisísti iniquitatem plebis tuæ."},
 {id:"COMMUNION.1",primary:"Dícite: pusillánimes, confortámini et nolíte timére: ecce, Deus noster véniet et salvábit nos."}
];
const epiphanyTexts=[
 {id:"INTROIT.1",primary:"Ecce, advénit dominátor Dóminus: et regnum in manu ejus et potéstas et impérium."},
 {id:"GRADUAL.1",primary:"Omnes de Saba vénient, aurum et thus deferéntes, et laudem Dómino annuntiántes."},
 {id:"ALLELUIA_TRACT_SEQUENCE.1",primary:"Vídimus stellam ejus in Oriénte, et vénimus cum munéribus adoráre Dóminum."},
 {id:"OFFERTORY.1",primary:"Reges Tharsis, et ínsulæ múnera ófferent: reges Arabum et Saba dona addúcent."},
 {id:"COMMUNION.1",primary:"Vídimus stellam ejus in Oriénte, et vénimus cum munéribus adoráre Dóminum."}
];
const lookup=(p,m)=>
 referenceScoresForParagraph({paragraph:p,resolvedMass:m,form:"SOLEMN"}).map(s=>s.id);
assert.deepEqual(newFeastTexts.map(p=>lookup(p,gaudete)),
 [["GREGOBASE-1225"],["GREGOBASE-1007"],["GREGOBASE-855"],
  ["GREGOBASE-113"],["GREGOBASE-218"]]);
assert.deepEqual(epiphanyTexts.map(p=>lookup(p,epiphany)),
 [["GREGOBASE-403"],["GREGOBASE-205"],["GREGOBASE-524"],
  ["GREGOBASE-1147"],["GREGOBASE-918"]]);
assert.deepEqual(newFeastTexts.map(p=>lookup(p,{...gaudete,date:"2027-12-12"})),
 newFeastTexts.map(p=>lookup(p,gaudete)),
 "Recurring Advent Third Sunday uses selected Temporale source, not a civil date");
assert.deepEqual(epiphanyTexts.map(p=>lookup(p,{...epiphany,date:"2028-01-06"})),
 epiphanyTexts.map(p=>lookup(p,epiphany)));
assert.deepEqual(lookup({...newFeastTexts[1],primary:newFeastTexts[1].primary+" "+newFeastTexts[2].primary},gaudete),
 ["GREGOBASE-1007","GREGOBASE-855"]);
assert.deepEqual(lookup({...epiphanyTexts[1],primary:epiphanyTexts[1].primary+" "+epiphanyTexts[2].primary},epiphany),
 ["GREGOBASE-205","GREGOBASE-524"]);
assert.notEqual(lookup(epiphanyTexts[2],epiphany)[0],lookup(epiphanyTexts[4],epiphany)[0],
 "Same words in Epiphany Alleluia and Communion must not conflate distinct melodies");
assert.deepEqual(lookup(epiphanyTexts[0],{...epiphany,date:"2027-01-07"}),[]);
assert.deepEqual(lookup(newFeastTexts[0],{...gaudete,proper:{sourcePath:"Tempora/Adv2-0"}}),[]);
assert.deepEqual(referenceScoresForParagraph({paragraph:epiphanyTexts[2],resolvedMass:epiphany,form:"LOW"}),[]);
assert.deepEqual(referenceScoresForParagraph({paragraph:epiphanyTexts[2],resolvedMass:{...epiphany,overlays:["REQUIEM"]},form:"SOLEMN"}),[]);
const andrew={date:"2026-11-30",proper:{data:{sourcePath:"Sancti/11-30"}},overlays:[]};
const andrewTexts=[
 {id:"INTROIT.1",primary:"Mihi autem nimis honoráti sunt amíci tui, Deus: nimis confortátus est principátus eórum."},
 {id:"GRADUAL.1",primary:"Constítues eos príncipes super omnem terram: mémores erunt nóminis tui, Dómine."},
 {id:"ALLELUIA_TRACT_SEQUENCE.1",primary:"Diléxit Andréam Dóminus in odórem suavitátis."},
 {id:"OFFERTORY.1",primary:"Mihi autem nimis honoráti sunt amíci tui, Deus: nimis confortátus est principátus eórum."},
 {id:"COMMUNION.1",primary:"Veníte post me: fáciam vos fíeri piscatóres hóminum; at illi contínuo, relíctis rétibus, secúti sunt Dóminum."}
];
const andrewSelected=(row,m=andrew,form="MISSA_CANTATA_SIMPLE")=>
 referenceScoresForParagraph({paragraph:row,resolvedMass:m,form}).map(s=>s.id);
assert.deepEqual(andrewTexts.map(row=>andrewSelected(row)),[
 ["GREGOBASE-475"],["GREGOBASE-307"],["GREGOBASE-984"],
 ["GREGOBASE-499"],["GREGOBASE-552"]
]);
assert.deepEqual(andrewTexts.map(row=>andrewSelected(row,{...andrew,date:"2027-11-30"})),
 andrewTexts.map(row=>andrewSelected(row)));
assert.deepEqual(andrewSelected({...andrewTexts[1],primary:andrewTexts[1].primary+" "+andrewTexts[2].primary}),
 ["GREGOBASE-307","GREGOBASE-984"]);
assert.notEqual(andrewSelected(andrewTexts[0])[0],andrewSelected(andrewTexts[3])[0],
 "Shared Introit/Offertory incipit must not erase different original scores");
assert.equal(andrewSelected(andrewTexts[0],{...andrew,date:"2026-11-29"}).length,0);
assert.equal(andrewSelected(andrewTexts[0],{...andrew,proper:{data:{sourcePath:"Tempora/Adv1-0"}}}).length,0);
assert.equal(andrewSelected(andrewTexts[0],andrew,"LOW").length,0);
assert.equal(andrewSelected(andrewTexts[0],{...andrew,overlays:["REQUIEM"]}).length,0);


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
const reusable=[...JULY07_REFERENCE_GABC,...ALL_SAINTS_REFERENCE_SCORES,...ST_ANDREW_REFERENCE_SCORES,...MAJOR_FEAST_REFERENCE_SCORES];
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
 JSON.stringify({catalog:23,bindings:27,allSaints:5,july:3,commonReuse:true}));
