import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {prayerSourceFacesV1} from "../src/pray/prayer-source-faces.v1.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {COMMUNION_TREASURY_V383} from "../src/pray/traditional-pray-data.js";

const canonical=Object.values(PRAY_CANONICAL_DATA_V435930.prayers);
assert.equal(canonical.length,48);
for(const record of canonical){
 for(const language of ["en","fr"]){
  const face=prayerSourceFacesV1(record,language);
  assert.ok(face.vernacular||face.latin,record.id+" blank in "+language);
  if(face.vernacular)assert.equal(face.vernacular,record[face.vernacularLanguage],record.id+" source text differs");
  assert.equal(face.latin,record.la||"",record.id+" original Latin differs");
  assert.equal(face.fallback,!!face.vernacularLanguage&&face.vernacularLanguage!==language);
 }
}
// The Latin-only case is a single Latin face, not a false reversible LA/LA pair.
assert.deepEqual(prayerSourceFacesV1({la:"Original Latin"},"fr"),{
 vernacular:"",vernacularLanguage:null,latin:"Original Latin",fallback:false
});
const held=PRAY_CANONICAL_DATA_V435930.prayers.marian_consecration_immaculate_heart;
const french=prayerSourceFacesV1(held,"fr");
assert.equal(french.vernacular,held.en);
assert.equal(french.vernacularLanguage,"en");
assert.equal(french.latin,"");
assert.equal(french.fallback,true);
// Existing complete Communion source-owned prayers remain byte-for-byte reused.
for(const id of ["beforeThomas","beforeAmbrose","afterThomas","afterBonaventure","enEgo"]){
 const p=COMMUNION_TREASURY_V383[id];
 assert.ok(p,id+" not in original treasury");
 const en=prayerSourceFacesV1(p,"en"),fr=prayerSourceFacesV1(p,"fr");
 assert.equal(en.vernacular,p.en,id+" EN changed");
 assert.equal(fr.vernacular,p.fr,id+" FR changed");
 assert.equal(en.latin,p.la,id+" Latin changed");
 assert.equal(fr.latin,p.la,id+" Latin changed");
 assert.equal(fr.fallback,false,id+" should not need fallback");
}
const s=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
assert.equal(s.split("prayerSourceFacesV1(").length-1,2,
 "Both canonical and source-owned prayer cards must reuse the single resolver");
assert.equal(s.split("${existingLatinSwitch(both)}").length-1,2,
 "Both cards retain the approved compact LA switch");
assert.equal(s.split("${traditionalSourceFallbackNotice(face)}").length-1,2,
 "Both cards must label a source language fallback");
assert.ok(s.includes('data-tp381-source-language-fallback'));
assert.ok(s.includes('data-face-v lang="${face.vernacularLanguage}"'));
assert.ok(s.includes('data-face-la lang="la" hidden'));
assert.ok(!s.includes("p.fr||p.en||p.la")&&!s.includes("item?.fr||item?.en||item?.la"),
 "Original Latin must not silently become a vernacular face");
console.log("PASS · 48 canonical prayers and five trilingual Communion originals reused unchanged; no false LA/LA faces, truthful historical fallback labels in both traditional card renderers");
