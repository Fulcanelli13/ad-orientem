import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from "../src/pray/icksp-divine-infant-king-novena.v1.js";
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from "../src/pray/icksp-immaculate-conception-novena.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../src/pray/holy-face-janvier-1887-b25.js";
import {auditPrayerLanguageCoverageV1,novenaTextSlotsV1} from "../src/pray/prayer-language-coverage.v1.js";

const audit=auditPrayerLanguageCoverageV1({
  prayers:PRAY_CANONICAL_DATA_V435930.prayers,
  novenas:NOVENA_CORPUS_V4,
  supplementalNovenas:{
    [ICKSP_DIVINE_INFANT_KING_NOVENA_V1.id]:ICKSP_DIVINE_INFANT_KING_NOVENA_V1,
    [ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.id]:ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,
    [NOVENA_HOLY_FACE_1887_B25.id]:NOVENA_HOLY_FACE_1887_B25
  }
});
assert.equal(audit.summary.corePrayerCount,48);
assert.equal(audit.summary.coreLatinTextPresent,47);
assert.equal(audit.summary.coreFrenchTextPresent,47);
assert.deepEqual(audit.summary.missingLatinCoreIds,["marian_consecration_immaculate_heart"]);
assert.equal(audit.summary.novenaProgrammeCount,19);
assert.equal(audit.programmes.filter(p=>p.id in NOVENA_CORPUS_V4).length,16);
assert.ok(audit.summary.novenaSourceTextSlotCount>0);
assert.ok(audit.summary.novenaLatinSourceSlotCount<audit.summary.novenaSourceTextSlotCount,
  "Do not falsely claim every historical novena text has a Latin witness");
assert.ok(audit.summary.missingLatinNovenaIds.length>0);
assert.ok(audit.programmes.some(p=>p.availableLatinCommonPrayers.length>0),
  "Canonical Latin is available for shared prayers even though historical proper texts remain source-bound");
assert.ok(audit.programmes.every(p=>p.sourceCertification==="NOT_ESTABLISHED_BY_LANGUAGE_PRESENCE"));
assert.deepEqual(novenaTextSlotsV1({days:[{text:{en:"Original",fr:"Traduction"}}]})
  .map(x=>x.languages),[{en:true,fr:true,la:false}]);
assert.deepEqual(novenaTextSlotsV1({days:[{text:{en:"Original",la:"Latine"}}]})
  .map(x=>x.languages),[{en:true,fr:false,la:true}]);
const runtime=readFileSync(new URL("../src/pray/novena-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/data-n1-common-latin aria-pressed/);
assert.ok(runtime.includes("compact?commonLanguageControl(n)"),"Latin switch belongs to the collapsed day chooser, not above the prayer card");
assert.ok(!runtime.includes("${modeNav()}${commonLanguageControl(n)}"),"A new banner must not displace the prayer card on a 320px phone");
assert.match(runtime,/N\.commonLatin\?\x27 hidden\x27/);
assert.match(runtime,/only traditional shared prayers|Only traditional shared prayers/);
assert.match(runtime,/no Latin translation is claimed/);
assert.match(runtime,/if\(b\.matches\(\x27\[data-n1-common-latin\]\x27\)\)/);
console.log("Prayer language coverage baseline (text present, NOT certified):");
console.log(JSON.stringify(audit.summary,null,2));
console.log("PASS · novena shared canonical Latin control and no false proper-text translations");
