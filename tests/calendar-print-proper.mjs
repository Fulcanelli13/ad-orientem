import assert from "node:assert/strict";
import {assessPrintableProper,renderPrintableProperHtml} from "../src/calendar/print-proper.js";

const text=(phrase)=>({lat:"Dómine "+phrase+" & sancte.",en:"Lord "+phrase+" & holy.",fr:"Seigneur "+phrase+" & saint."});
const r={
 date:"2026-10-07",status:"ready",
 day:{main:{title:"Our Lady of the Rosary",rank:"II class",color:"White"}},
 proper:{status:"ready",data:{
   name:"Our Lady of the Holy Rosary",nameFr:"Notre-Dame du Très Saint Rosaire",
   rank:"II class",sourcePath:"Sancti/10-07",riteProfile:"ordinary_mass",
   introit:text("<introït>"),collects:[text("collect 1"),text("collect 2")],
   epistle:text("epistle"),preGospelChants:[{kind:"gradual",text:text("gradual")}],
   gospel:text("gospel"),offertory:text("offertory"),secrets:[text("secret 1"),text("secret 2")],
   communion:text("communion"),postcommunions:[text("postcommunion 1"),text("postcommunion 2")],
   specialSections:[],preparatoryLessons:[],
   calendarCommemorations:[{name:"Saint Pius",path:"Sancti/10-07a",prayerSourcePath:"Sancti/10-07a"}],
 }},
 colourPlan:{primary:"White",massColor:"White"},
};
assert.equal(assessPrintableProper(r,{language:"en"}).ok,true);
assert.equal(assessPrintableProper(r,{language:"fr"}).ok,true);
const french=renderPrintableProperHtml(r,{language:"fr"});
assert.match(french,/Notre-Dame du Très Saint Rosaire/);
assert.match(french,/Seigneur collect 2/);
assert.match(french,/Dómine collect 2/);
assert.match(french,/Seigneur secret 2/);
assert.match(french,/Seigneur postcommunion 2/);
assert.match(french,/Sainte? Saint|Saint Pius/);
assert.match(french,/Sancti\/10-07/);
assert.match(french,/Ordinaire/);
assert.match(french,/window\.print\(\)/);
assert.doesNotMatch(french,/<introït>/,"Never execute upstream Proper text as HTML");
assert.match(french,/&lt;introït&gt;/);
assert.equal((french.match(/class="item"/g)||[]).length,12);
const english=renderPrintableProperHtml(r,{language:"en"});
assert.match(english,/Our Lady of the Holy Rosary/);
assert.match(english,/Lord epistle/);
assert.match(english,/Mass Proper only/);
assert.doesNotMatch(english,/Missal complete|Complete Mass/);
const bad=structuredClone(r);bad.proper.data.secrets[0].fr="";
assert.equal(assessPrintableProper(bad,{language:"fr"}).ok,false,"Partial vernacular must not print as bilingual");
assert.throws(()=>renderPrintableProperHtml(bad,{language:"fr"}),/Print withheld/);
for(const mutation of [
 x=>x.proper.status="unavailable",
 x=>x.proper.data.sourcePath="",
 x=>x.proper.data.secrets=[],
 x=>x.proper.data.specialSections=[{id:"Ember-Mass"}],
 x=>x.proper.data.preparatoryLessons=[{id:"Lesson-2"}],
 x=>x.proper.data.riteProfile="easter_vigil_mass",
]){
 const obj=structuredClone(r);mutation(obj);
 assert.equal(assessPrintableProper(obj).ok,false,"Missing text/source or exceptional liturgy was printed");
}
assert.equal(assessPrintableProper(r,{language:"la"}).ok,false);

// Printable Proper must share the source-verified C7b non-Virgin
// commemoration correction with the existing bilingual Mass Reader.
const mistaken={
 lat:"Da nobis, quǽsumus, Dómine Deus noster, sanctárum Vírginum et Mártyrum tuárum Perpétuæ et Felicitátis palmas incessábili devotióne venerári: ut quas digna mente non póssumus celebráre, humílibus saltem frequentémus obséquiis.",
 en:"Grant unto us, we beseech Thee, O Lord, to honor thy holy Virgins and Martyrs Perpetua and Felicitas with constant devotion: though we cannot honor them as they deserve, we may offer humble homage.",
 fr:"Donnez-nous, s’il vous plaît, Seigneur, d’honorer toujours avec une constante dévotion le triomphe de vos saintes Vierges et Martyres Perpétue et Félicité, afin que nous leur offrions nos humbles hommages."
};
const mistakenSecret={
 lat:"Inténde, quǽsumus, Dómine, múnera altáribus tuis pro sanctárum Vírginum et Mártyrum tuárum Perpétuæ et Felicitátis festivitáte propósita: ut, sicut per hæc beáta mystéria illis glóriam contulísti, ita nobis indulgéntiam largiáris.",
 en:"O Lord, look down upon these gifts, laid upon thine altars on the feast of thy holy Virgins and Martyrs Perpetua and Felicitas, that as thou bestowed glory upon them, thou mayest grant us forgiveness.",
 fr:"Nous vous en supplions, Seigneur, considérez les dons déposés sur vos autels en raison de la fête de vos saintes Vierges et Martyres Perpétue et Félicité, afin que, comme vous leur avez donné la gloire, vous nous accordiez le pardon."
};
const march=structuredClone(r);
march.date="2026-03-06";
march.day.main.title="Friday in the second week of Lent";
march.proper.data.sourcePath="Tempora/Quad2-5";
march.proper.data.calendarCommemorations=[{name:"Saintes Perpétue et Félicité",
 path:"Sancti/03-06",prayerSourcePath:"Sancti/03-06"}];
march.proper.data.collects=[text("ferial Collect"),mistaken];
march.proper.data.secrets=[text("ferial Secret"),mistakenSecret];
march.proper.data.postcommunions=[text("ferial Postcommunion"),text("named martyrs")];
const frozenBefore=JSON.stringify(march.proper.data);
for(const language of ["fr","en"]){
 const audit=assessPrintableProper(march,{language});
 assert.equal(audit.ok,true,language+" printed Correct C7b required");
 assert.equal(audit.sourceEditorialCorrections.length,2,language+" correction proof absent");
 const commCollect=audit.sections.filter(x=>x.kind==="collect").at(-1);
 const commSecret=audit.sections.filter(x=>x.kind==="secret").at(-1);
 for(const section of [commCollect,commSecret]){
   assert.doesNotMatch(section.latin,/V[ií]rginum et M[áa]rtyrum/u);
   assert.doesNotMatch(section.vernacular,
     language==="fr"?/Vierges et Martyres/iu:/Virgins and Martyrs/iu);
   assert.match(section.latin,/Mártyrum/u);
 }
 const html=renderPrintableProperHtml(march,{language});
 assert.doesNotMatch(html,/Vierges et Martyres|Virginum et Martyrum|Virgins and Martyrs/iu);
 assert.match(html,language==="fr"?/saintes Martyres/iu:/holy Martyrs/iu);
 assert.match(html,/Tempora\/Quad2-5/);
 assert.match(html,/Sancti\/03-06/);
}
assert.equal(JSON.stringify(march.proper.data),frozenBefore,
 "Print cannot mutate the resolver's original commemorative prayer source");
const wrongOwner=structuredClone(march);
wrongOwner.proper.data.calendarCommemorations[0].prayerSourcePath="Sancti/11-11cc";
assert.equal(assessPrintableProper(wrongOwner,{language:"fr"}).sourceEditorialCorrections.length,0,
 "An unrelated commemoration must not borrow the C7b repair");
const ambiguous=structuredClone(march);
ambiguous.proper.data.collects=[mistaken];
ambiguous.proper.data.secrets=[mistakenSecret];
assert.equal(assessPrintableProper(ambiguous,{language:"fr"}).sourceEditorialCorrections.length,0,
 "Cannot invent prayer ownership when source cardinality does not match");
const directCommon=structuredClone(r);
directCommon.proper.data.sourcePath="Commune/C6b";
directCommon.proper.data.secrets=[{lat:"Oratio pro N. et N.",fr:"Offrande pour N.",en:"Offering for N. and N."}];
directCommon.proper.data.postcommunions=[{lat:"Oratio pro N. et N.",fr:"Oratio pour N.",en:"Prayer for N. and N."}];
assert.equal(assessPrintableProper(directCommon,{language:"fr"}).ok,false,
 "French singular Common must not print as complete");
assert.equal(assessPrintableProper(directCommon,{language:"en"}).ok,true,
 "French-only defect must not block good Latin/English printable source");

console.log("PASS printable bilingual 1962 Proper: 11 ordered sections, canonical provenance, EN/FR, escaped text, incomplete and special-rite exclusion");
