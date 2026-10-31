import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {angelusCardPlan} from "../src/pray/devotional-card-deck.js";
import {angelusCommunalParts,stripGloriaRepetition} from "../src/pray/angelus-folio-recitation.js";

const titles=angelusCardPlan({form:"angelus"}).map(c=>c.id);
assert.deepEqual(titles,["announcement","fiat","incarnation","intercession","collect"]);
assert.deepEqual(angelusCardPlan({form:"angelus",historicalConclusion:true}).map(c=>c.id),titles);
assert.deepEqual(angelusCardPlan({form:"regina"}).map(c=>c.id),
 ["rejoice","resurrection","intercession","collect"]);
assert.deepEqual(angelusCardPlan({form:"angelus"}).map(c=>c.unitIndices),
 [[0,1],[2,3],[4,5],[6],[7]]);
const source=[
 ["Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.","Holy Mary"],
 ["Ave Maria, gratia plena, Dominus tecum; benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostræ. Amen.","Sancta Maria"],
 ["Je vous salue, Marie, pleine de grâce; le Seigneur est avec vous; vous êtes bénie entre toutes les femmes, et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pauvres pécheurs, maintenant et à l’heure de notre mort. Ainsi soit-il.","Sainte Marie"]
];
for(const [text,expected] of source){
 const parts=angelusCommunalParts(text,"hail");
 assert.ok(parts,"Hail Mary must divide in group mode");
 assert.equal(parts.length,2);
 assert.ok(parts[1].text.startsWith(expected));
 assert.equal(parts.map(x=>x.text).join(" "),text,"Prayer words must be preserved");
}
const doxologies=[
 "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen. (three times)",
 "Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc, et semper, et in sæcula sæculorum. Amen. (ter)",
 "Gloire au Père, au Fils et au Saint-Esprit, comme il était au commencement, maintenant et toujours, et dans les siècles des siècles. Ainsi soit-il. (trois fois)"
];
for(const prayer of doxologies){
 const clean=stripGloriaRepetition(prayer);
 const parts=angelusCommunalParts(clean,"doxology");
 assert.ok(parts,"Gloria Patri must divide in group mode");
 assert.equal(parts.length,2);
 assert.equal(parts.map(x=>x.text).join(" "),clean);
}
assert.equal(angelusCommunalParts("Oremus. Gratiam tuam, quæsumus. Amen.","collect")[1].text,"Amen.");
assert.equal(angelusCommunalParts("Unmatched text","hail"),null);

const deck=readFileSync(new URL("../src/pray/devotional-card-deck.js",import.meta.url),"utf8");
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/pray/devotional-card-deck-styles.js",import.meta.url),"utf8");
assert.ok(deck.includes('entry.id==="collect"&&parts'),"Appendix must live inside Collect");
assert.ok(deck.includes('for(let i=0;i<3;i++)'),"Gloria must be repeated 3x, not merely annotated");
assert.ok(deck.includes('recitationMode==="group"'),"Appendix group mode missing");
assert.ok(deck.includes('if(guided)'),"Guided context missing");
assert.ok(deck.includes('unit.dataset.aoDevoCue="profound-bow"'),"Individual Mode lost Incarnation focus cue");
assert.ok(deck.includes('i===active?"1":Math.abs(i-active)===1?".45":".40"'),
 "Angelus current/near/far text illumination must preserve readable 40–45% inactive text");
assert.ok(deck.includes("ensureDevotionalReadingRunway"),"Short Angelus cards must allow second paragraph illumination");

assert.ok(runtime.includes('data-p435930-angelus-settings'),"Discrete settings icon missing");
assert.ok(runtime.includes('angelusCommunalParts(text,type)'),"Group-mode Angelus missing");
assert.ok(runtime.includes('aoFolioIncarnationCue'),"Inline Incarnation gesture missing");
assert.ok(!runtime.includes('showDevotionalParagraphCue({mount:m,cue,action,language:lang(),win:window});'),"Blocking cue must be disabled");
assert.ok(runtime.includes("angelusMode:'auto',angelusHistoricalConclusion:true"),"Closing prayers must be default");
assert.ok(styles.includes("aoFolioReader"),"Folio styles missing");
console.log("PASS: five Angelus Folio cards, Regina parity, grouped Hail/Gloria, Collect conclusion, guided and inline gesture");
