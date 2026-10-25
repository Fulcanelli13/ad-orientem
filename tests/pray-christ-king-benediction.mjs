import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {christKingStages,CHRIST_KING_OPTION_DEFAULTS,CHRIST_KING_CONSECRATION,CHRIST_KING_ROYAL_PRAISES,CHRIST_KING_EXTRA_STAGES,CHRIST_KING_WITNESSES} from "../src/pray/christ-king-benediction.js";
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
assert.ok(CHRIST_KING_ROYAL_PRAISES.la.includes("Christus vincit!"));
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
console.log("PASS Christ King opt-in composition, source-backed three-language consecration and unchanged ordinary Benediction");
