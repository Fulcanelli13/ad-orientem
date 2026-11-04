// Regression witness from actual 6 March 2026/2027 flattened 1962
// Canonical Proper, not fabricated Latin prayers or a generic name expander.
// English source identity: pinned Sancti/03-06 [Name] Perpetua and Felicitas.
// Neither Gregorian notation nor actual liturgical form is changed.
import assert from "node:assert/strict";
import {reconcile1962PerpetuaFelicityNonVirginCommon}
 from "../src/mass/1962-plural-martyr-french-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";

const namedCollect=Object.freeze({
 lat:"Da nobis, quǽsumus, Dómine Deus noster, sanctárum Vírginum et Mártyrum tuárum Perpétuæ et Felicitátis palmas incessábili devotióne venerári: ut quas digna mente non póssumus celebráre, humílibus saltem frequentémus obséquiis.",
 en:"Grant, we beseech thee, O Lord our God, that we may never cease devoutly to venerate the triumphs of thy holy Virgins and Martyrs N. and N.: that, though we cannot worthily shew forth their praises, yet we may continually honour them with lowly service.",
 fr:"Donnez-nous, s’il vous plaît, Seigneur, d’honorer toujours avec une constante dévotion le triomphe de vos saintes Vierges et Martyres perpétue et Félicité, afin que si nous né pouvons célébrer leur fête avec une âme digne d’elles, nous leur offrions du moins nos humbles hommages."
});
const namedSecret=Object.freeze({
 lat:"Inténde, quǽsumus, Dómine, múnera altáribus tuis pro sanctárum Vírginum et Mártyrum tuárum Perpétuæ et Felicitátis festivitáte propósita: ut, sicut per hæc beáta mystéria illis glóriam contulísti; ita nobis indulgéntiam largiáris.",
 en:"O Lord, we beseech thee, look down upon these gifts, laid upon thine altars on the festival of thy holy Virgins and Martyrs N. and N.: that as by these blessed mysteries thou hast bestowed glory upon them; so thou wouldst vouchsafe to us thy pardon.",
 fr:"Nous vous en supplions, Seigneur, considérez les dons déposés sur vos autels en raison de la fête de vos saintes Vierges et Martyres Perpétue et Félicité, afin que, comme par la vertu de ces saints mystères, vous leur avez donné la gloire, vous nous accordiez de même le pardon."
});
const ordinary=Object.freeze({
 sourcePath:"Tempora/Quad2-5",
 calendarCommemorations:Object.freeze([Object.freeze({
  path:"Sancti/03-06",prayerSourcePath:"Sancti/03-06",name:"Sts. Felicitas & Perpetua"
 })]),
 collects:Object.freeze([
  Object.freeze({lat:"Da, quǽsumus, omnípotens Deus: ut, sacro nos purificánte jejúnio, sincéris méntibus ad sancta veneránda pervéniamus.",en:"Grant, we beseech You, almighty God, that with the sacred fast to purify us, we may with sincere minds observe Your holy things.",fr:"Faites, ô Dieu tout-puissant, que purifiés par ce jeûne sacré, nous approchions avec des cœurs sincères des saints mystères."}),
  namedCollect
 ]),
 secrets:Object.freeze([
  Object.freeze({lat:"Hæc in nobis sacrifícia, Deus, et actióne permáneant, et operatióne firméntur.",en:"O God, may this sacrifice which is offered, stay in us and accomplish lasting effects.",fr:"Ô Dieu, que ce sacrifice demeure en nous par son action et que son effet nous affermisse."}),
  namedSecret
 ])
});
const correction=reconcile1962PerpetuaFelicityNonVirginCommon(ordinary);
assert.notEqual(correction,ordinary,"authentic C7b orphaned English named prayer not repaired");
assert.equal(correction.sourcePath,ordinary.sourcePath,"actual Lenten feria replaced");
assert.deepEqual(correction.sourceEditorialCorrections.map(x=>x.slot).sort(),
 ["COLLECT_SET","SECRET_SET"]);
for(const [kind,single] of [["collects","collect"],["secrets","secret"]]){
 const before=ordinary[kind][1],after=correction[kind][1];
 assert.strictEqual(ordinary[kind][0],correction[kind][0],"principal Lenten prayer touched");
 assert.strictEqual(ordinary[kind][1],before,"original source mutated");
 assert.equal(correction[single],correction[kind][0],"principal prayer displaced");
 assert.match(after.lat,/Mártyrum tuárum Perpétuæ et Felicitátis/u);
 assert.match(after.en,/Martyrs Perpetua and Felicitas/u);
 assert.match(after.fr,/Martyres [Pp]erpétue et Félicité/u);
 for(const lang of ["lat","en","fr"]){
  assert.doesNotMatch(after[lang],
   lang==="lat"?/Vírginum et Mártyrum/u:
   lang==="en"?/Virgins and Martyrs/u:/Vierges et Martyres/u);
 }
 assert.doesNotMatch(after.en,/\bN\.\s+and\s+N\./u);
 const evidence=correction.sourceEditorialCorrections.find(x=>x.slot===
  (kind==="collects"?"COLLECT_SET":"SECRET_SET"));
 assert.deepEqual(evidence.fields,["lat","en","fr"]);
 assert.equal(evidence.englishNameRestoration.original,"N. and N.");
 assert.equal(evidence.englishNameRestoration.corrected,"Perpetua and Felicitas");
 assert.match(evidence.englishNameRestoration.sourceWitness,/English\/Sancti\/03-06\.txt$/u);
}
for(const language of ["en","fr"]){
 const rendered=properToReaderSlots(ordinary,{language});
 for(const slot of ["COLLECT_SET","SECRET_SET"]){
  assert.equal(rendered.slots[slot].status,"READY",language+":"+slot+" original donor hold");
  assert.equal(rendered.slots[slot].data.paragraphs.length,2,
   "commemorative prayer silently omitted");
 }
 assert.equal(rendered.sourceEditorialCorrections.length,2);
}
assert.strictEqual(reconcile1962PerpetuaFelicityNonVirginCommon(correction),correction,
 "repeat correction must be idempotent");

// Every negative fixture must retain the SOURCE_CONFLICT or original prayer:
// never generic placeholder replacement, forged feasts or silently composed
// translations. The old missal's wrong category is not approved by default.
const noFix=(p,reason)=>{
 const actual=reconcile1962PerpetuaFelicityNonVirginCommon(p);
 assert.strictEqual(actual,p,reason);
};
noFix({...ordinary,calendarCommemorations:[]},"unowned martyrs");
noFix({...ordinary,sourcePath:"Sancti/11-11",
 calendarCommemorations:[{path:"Sancti/11-11cc",prayerSourcePath:"Sancti/11-11cc"}]},
 "unrelated St Martin oratory");
noFix({...ordinary,collects:[ordinary.collects[0],
 {...namedCollect,en:namedCollect.en.replace("N. and N.","N. and N. and N.")}],
 secrets:ordinary.secrets.slice(0,1)},"three English placeholders");
noFix({...ordinary,collects:[ordinary.collects[0],
 {...namedCollect,fr:namedCollect.fr.replace("perpétue et Félicité","N. et N.")}],
 secrets:[ordinary.secrets[0],{...namedSecret,
  fr:namedSecret.fr.replace("Perpétue et Félicité","N. et N.")}]},
 "French named source not proven");
noFix({...ordinary,collects:[ordinary.collects[0],
 {...namedCollect,lat:namedCollect.lat.replace("Perpétuæ et Felicitátis","N. et N.")}],
 secrets:[ordinary.secrets[0],{...namedSecret,
  lat:namedSecret.lat.replace("Perpétuæ et Felicitátis","N. et N.")}]},
 "Latin named source not proven");
noFix({...ordinary,collects:[ordinary.collects[0],
 {...namedCollect,oneConclusion:{status:"UNVERIFIED"}}],
 secrets:[ordinary.secrets[0],{...namedSecret,oneConclusion:{status:"UNVERIFIED"}}]},
 "compound oration cannot be guessed");
console.log("PASS exact Sancti/03-06 pinned English names restored in 2 C7b prayers; complete bilingual Reader; principal unaffected; unrelated/ambiguous donors withheld");
