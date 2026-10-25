import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SACRED_HEART_DEVOTIONS_V382} from "../src/pray/traditional-pray-data.js";
import {christKingStages,CHRIST_KING_OPTION_DEFAULTS,CHRIST_KING_CONSECRATION,CHRIST_KING_ROYAL_PRAISES,CHRIST_KING_LAUDES_SECTIONS,renderRoyalPraisesWitnessText,CHRIST_KING_EXTRA_STAGES,CHRIST_KING_WITNESSES} from "../src/pray/christ-king-benediction.js";
const canonical=[["exposition"],["adoration"],["hymn"],["prayer"],["blessing"],["praises"],["reposition"]];
const ids=stages=>stages.map(s=>s[0]);
assert.strictEqual(christKingStages(canonical,"ordinary"),canonical,"Ordinary source sequence identity must not change");
assert.deepEqual(ids(christKingStages(canonical,"christKing")),
 ["exposition","adoration","king-procession","king-royal-praises","king-consecration","hymn","prayer","blessing","praises","reposition"],
 "The witnessed procession and feast prayers must precede Tantum Ergo");
assert.deepEqual(ids(christKingStages(canonical,"christKing",{procession:false,royalPraises:false,sacredHeartLitany:true,consecration:false})),
 ["exposition","adoration","king-sacred-heart-litany","hymn","prayer","blessing","praises","reposition"]);
assert.equal(CHRIST_KING_OPTION_DEFAULTS.sacredHeartLitany,false,"Unconfirmed local litany must not be selected by default");
assert.equal(CHRIST_KING_EXTRA_STAGES.length,4);
assert.ok(CHRIST_KING_CONSECRATION.la.startsWith("Iesu dulcissime, Redemptor humani generis"));
assert.ok(CHRIST_KING_CONSECRATION.fr.startsWith("Très doux Jésus, Rédempteur du genre humain"));
assert.ok(CHRIST_KING_CONSECRATION.en.startsWith("Most sweet Jesus, Redeemer of the human race"));
for(const lang of ["en","fr","la"]){assert.ok(CHRIST_KING_CONSECRATION[lang].length>500);assert.ok(CHRIST_KING_CONSECRATION[lang].endsWith(lang==="fr"?"Ainsi soit-il.":"Amen."));}
assert.match(CHRIST_KING_ROYAL_PRAISES.la,/Christus vincit[,!]/);
assert.ok(CHRIST_KING_WITNESSES.decree.startsWith("https://"));
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(runtime,/function benStages\(\)\{return christKingStages\(BEN_STAGES,BEN.celebration,BEN.feastOptions\)\}/);
assert.match(runtime,/data-p435930-ben-feast-option/);
assert.match(runtime,/id==='king-consecration'/);
assert.match(runtime,/id==='king-royal-praises'/);
assert.match(runtime,/id==='king-procession'/);
assert.match(runtime,/id==='king-sacred-heart-litany'/);
assert.match(runtime,/BEN.step===benStages\(\).length-1/);
assert.match(runtime,/CHRIST_KING_WITNESSES.consecrationFrench/);
assert.match(runtime,/CHRIST_KING_WITNESSES.consecrationEnglish/);
assert.match(runtime,/BEN=\{step:0,divinePraises:false,celebration:'ordinary'/);


const royalCalls=CHRIST_KING_LAUDES_SECTIONS.map(section=>section.calls.length);
assert.deepEqual(royalCalls,[5,3,26,14],
 "The complete four-section Vatican witness must preserve 48 invocations");
assert.deepEqual(CHRIST_KING_LAUDES_SECTIONS.map(x=>x.id),["church","pope","bishops","people"]);
assert.equal(CHRIST_KING_ROYAL_PRAISES.sourceStatus,"ATTESTED_2012_WITNESS_NOT_VERIFIED_LOCAL_2026");
assert.match(CHRIST_KING_ROYAL_PRAISES.note,/not the exact 2026 Mauritius booklet/);
for(const locale of ["la","en","fr"]){
 const full=CHRIST_KING_ROYAL_PRAISES[locale];
 assert.ok(full.length>2800,"Full four-part Laudes must not collapse to a refrain: "+locale);
 assert.equal(full,renderRoyalPraisesWitnessText(locale));
 assert.equal(full.split(CHRIST_KING_LAUDES_SECTIONS[0].heading[locale]).length-1,1);
 assert.equal(full.split(CHRIST_KING_LAUDES_SECTIONS[3].heading[locale]).length-1,1);
 assert.equal(full.split("℟.").length-1>=58,true,"Missing invocation responses: "+locale);
 assert.ok(full.includes(CHRIST_KING_LAUDES_SECTIONS[0].petition[locale]));
 assert.ok(full.includes(CHRIST_KING_LAUDES_SECTIONS[2].petition[locale]));
}
assert.match(CHRIST_KING_ROYAL_PRAISES.la,/Rex regum\. ℟\. Rex noster/);
assert.match(CHRIST_KING_ROYAL_PRAISES.la,/Tempora bona habeant/);
assert.match(CHRIST_KING_ROYAL_PRAISES.la,/Pax Christi veniat.*Regnum Christi veniat/);
assert.match(CHRIST_KING_ROYAL_PRAISES.la,/N\. Summo Pontifici/);
assert.doesNotMatch(CHRIST_KING_ROYAL_PRAISES.la,/Benedicto Summo Pontifici/);
assert.match(CHRIST_KING_WITNESSES.royalPraisesICKSPIndex,/icrsp\.org\/Livres/);
assert.match(CHRIST_KING_WITNESSES.royalPraises,/vatican\.va\/news_services/);
assert.match(runtime,/benFeastPrayer\(CHRIST_KING_ROYAL_PRAISES/);

const existingSacredHeartLitany=SACRED_HEART_DEVOTIONS_V382.litany;
for(const [lang,term] of [["en","Heart of Jesus,"],["fr","Cœur de Jésus,"],["la","Cor Iesu,"]]){
 const full=existingSacredHeartLitany[lang];
 assert.ok(full&&full.split(term).length-1===33,"Existing canonical Sacred Heart litany must contain exactly 33 invocations in "+lang);
 assert.equal(full.split(String.fromCharCode(10)).filter(Boolean).length,49,"Full litany includes opening, 33 invocations and closing oration");
}
assert.match(runtime,/benFeastPrayer\(SACRED_HEART_DEVOTIONS_V382\.litany/);
assert.match(runtime,/CHRIST_KING_WITNESSES\.christKingOrdo/);
assert.equal(CHRIST_KING_WITNESSES.sacredHeartLitany,"https://www.icrsp.org/Litanies-Sacre-Coeur");
assert.equal(CHRIST_KING_WITNESSES.christKingOrdo,"https://icrspfrance.fr/ordo.php?d=2026-10-01");

console.log("PASS Christ King opt-in composition, source-backed three-language consecration and unchanged ordinary Benediction");
