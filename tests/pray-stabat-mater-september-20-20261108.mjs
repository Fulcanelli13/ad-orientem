import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {STABAT_MATER_SEPTEMBER_SOURCE,STABAT_MATER_SEPTEMBER_FINAL_SEVEN,completeSeptemberStabatMater} from "../src/pray/stabat-mater-september-1962-source.js";
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
test("Full September sequence is 20 Latin tercets, preserving original 13 Station excerpts",()=>{
 const original=PRAY_CANONICAL_DATA_V435930.stabat;
 assert.equal(original.length,13);
 const full=completeSeptemberStabatMater(original);
 assert.equal(full.length,20);
 assert.deepEqual(full.slice(0,13),original);
 assert.deepEqual(full.slice(13),STABAT_MATER_SEPTEMBER_FINAL_SEVEN);
 assert.equal(new Set(full).size,20);
 assert.equal(full[17].startsWith("Flammis ne urar"),true);
 assert.equal(full[18].startsWith("Christe, cum sit hinc exire"),true);
 assert.equal(full[19].startsWith("Quando corpus morietur"),true);
 assert.ok(!full.some(x=>x.startsWith("Fac me cruce custodiri")));
 assert.equal(completeSeptemberStabatMater(full),null);
});
test("September 20 is a Latin-only separately sourced work, not a 1962 facsimile certificate",()=>{
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.stanzaCount,20);
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.stationExtractCount,13);
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.language,"la");
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.printed1962ImageIndependentlyCollated,false);
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.variant19,"CHRISTE_CUM_SIT_HINC_EXIRE");
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.translationStatus,"LATIN_ONLY");
});
test("Original Stations between-station reading stays 13 and full Latin is separately accessible at finish",()=>{
 assert.match(runtime,/S\.stations\.stabat&&i<13/);
 assert.match(runtime,/data-ao-stabat-full-september/);
 assert.match(runtime,/completeSeptemberStabatMater\(STATION_DATA\.stabat\)/);
 assert.match(runtime,/STABAT_MATER_SEPTEMBER_SOURCE\.sourceWitnesses\[0\]/);
 assert.match(runtime,/data-ao-stabat-library-full/);
 assert.match(runtime,/data-ao-prayer-stabat-september/);
 assert.match(runtime,/LIB\.subject==="V"/);
 assert.match(runtime,/stabatLibrarySection/);
 assert.match(runtime,/stabat-mater-september-styles\\.js/);

});
