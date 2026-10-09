import assert from "node:assert/strict";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {PRAY_EDITION_WITNESSES_V1,prayEditionWitness} from "../src/pray/prayer-edition-witnesses.v1.js";
import {ROSARY_GUIDED_BEAD_MEDITATIONS_V1} from "../src/pray/rosary-guided-bead-meditations.v1.js";
import {ROSARY_MYSTERY_CONTEXT_V1} from "../src/pray/rosary-mystery-context.v1.js";
import {readFileSync} from "node:fs";
const prayers=DATA.prayers;
assert.equal(Object.keys(prayers).length,48,"canonical library must preserve all 48 prayer bodies");
const additions={
 en:["Mother of the Church","Mother of mercy","Mother of hope","Solace of migrants","Queen of families"],
 fr:["Mère de l’Église","Mère de miséricorde","Mère de l’espérance","Réconfort des migrants","Reine des familles"],
 la:["Mater Ecclesiæ","Mater misericordiæ","Mater spei","Solacium migrantium","Regina familiæ"]
};
for(const language of ["en","fr","la"]){
 const earlier=prayers.litany_loreto_1962[language].split("\n").filter(Boolean);
 const later=prayers.litany_loreto_current[language].split("\n").filter(Boolean);
 assert.equal(later.length-earlier.length,5,"Loreto "+language+" historical/current additions unexpected");
 for(const name of additions[language]){
  assert.ok(later.some(x=>x.includes(name)),language+" missing later invocation "+name);
  assert.ok(!earlier.some(x=>x.includes(name)),language+" anachronism in historical litany: "+name);
 }
 const added=later.filter(x=>!earlier.includes(x));
 assert.equal(added.length,5,language+" unexplained Litany of Loreto differences");
}
const josephAdditions={
 en:["Guardian of the Redeemer","Servant of Christ","Minister of salvation","Support in difficulties","Patron of exiles","Patron of the afflicted","Patron of the poor"],
 fr:["Gardien du Rédempteur","Serviteur du Christ","Ministre du Salut","Soutien dans les difficultés","Patron des exilés","Patron des affligés","Patron des pauvres"],
 la:["Custos Redemptoris","Serve Christi","Minister salutis","Fulcimen in difficultatibus","Patrone exsulum","Patrone afflictorum","Patrone pauperum"]
};
for(const [lang,invocations] of Object.entries(josephAdditions)){
 const body=prayers.devotion_litany_st_joseph[lang];
 for(const phrase of invocations)assert.ok(body.includes(phrase),"2021 Saint Joseph "+lang+" title absent: "+phrase);
}
assert.deepEqual(Object.keys(PRAY_EDITION_WITNESSES_V1).sort(),[
 "adoration_lord_i_am_not_worthy","devotion_litany_st_joseph","litany_loreto_1962","litany_loreto_current","mass_confiteor"
].sort());
for(const [id,ed] of Object.entries(PRAY_EDITION_WITNESSES_V1)){
 assert.ok(prayers[id],"edition override without owned canonical prayer: "+id);
 for(const url of [ed.url,ed.secondaryUrl])assert.match(url,/^https:\/\//,"edition witness must be a direct HTTPS link: "+id);
 for(const lang of ["en","fr"]){
  assert.ok(ed.label[lang]?.length>12,id+" missing "+lang+" label");
  assert.ok(ed.note[lang]?.length>50,id+" missing qualified "+lang+" editor's note");
 }
 assert.ok(ed.witnessType!=="CERTIFIED_VERBATIM","unverified text cannot claim source certification");
 assert.equal(prayEditionWitness(id),ed);
}
assert.equal(prayEditionWitness("foundations_hail_mary"),null);
assert.equal(PRAY_EDITION_WITNESSES_V1.litany_loreto_1962.edition,"LORETO_PRE_1980_FORM");
assert.equal(PRAY_EDITION_WITNESSES_V1.litany_loreto_current.edition,"LORETO_CURRENT_2020");
assert.equal(PRAY_EDITION_WITNESSES_V1.devotion_litany_st_joseph.edition,"ST_JOSEPH_2021");
for(const [id,cues] of Object.entries(ROSARY_GUIDED_BEAD_MEDITATIONS_V1)){
 assert.ok(ROSARY_MYSTERY_CONTEXT_V1[id],"guided decade has no distinct source-owned mystery: "+id);
 assert.equal(cues.length,10);
 assert.equal(new Set(cues.map(c=>c.en)).size,10,id+" English decade repeats itself");
 assert.equal(new Set(cues.map(c=>c.fr)).size,10,id+" French decade repeats itself");
 for(const c of cues){
  assert.ok(c.en.length<=175&&c.fr.length<=190,id+" bead too verbose");
  assert.ok(!/\b(this module|not a scripture quotation|editorial review|the app)\b/i.test(c.en),"meta prose in prayer: "+id);
 }
}
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy2[9].en,/three months/);
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy2[9].fr,/trois mois/);
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(runtime,/prayEditionWitness\(p\.id\)/,"edition source must appear in the user-facing prayer reader");
assert.match(runtime,/editionNote/,"period and text status notices must be visible");
assert.match(runtime,/additionalWitness/,"additional decree/facsimile links must not be silently dropped");
console.log("PASS PRAY editorial: 48 preserved, 200 bilingual guided meditations, 5 edition distinctions, Loreto 5 later invocations and Saint Joseph 7 additions");
