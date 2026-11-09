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
test("September 20 is Latin-only; 1962 printed p. 671 confirms key lines, not all editions",()=>{
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.stanzaCount,20);
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.stationExtractCount,13);
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.language,"la");
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.printed1962ImageIndependentlyCollated,true);
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.printed1962ImageCollationScope,"SEPTEMBER_15_STANZAS_18_TO_20_AND_20_TERCET_COUNT");
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.originalBenzigerEditionIdentityCertified,false);
 assert.equal(STABAT_MATER_SEPTEMBER_SOURCE.original1961EditionCollationCertified,false);
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
 assert.match(runtime,/stabat-mater-september-styles\.js/);

});

test("1962 photographed printed folio independently reads ne urar, not missing-ne OCR",()=>{
 const evidence=JSON.parse(readFileSync("data/pray/stabat-september-1962-printed-p671-collation-20261109.v1.json","utf8"));
 assert.equal(evidence.printedFolio,"Festa septembris (15), p. 671");
 assert.equal(evidence.scanNumber,748);
 assert.equal(evidence.imageIsDirectPhotograph,true);
 assert.equal(evidence.selectedReading18,"Flammis ne urar succensus");
 assert.equal(evidence.printedReading19,"Christe, cum sit hinc exire");
 assert.equal(evidence.printedReading20,"Quando corpus morietur");
 assert.equal(evidence.sequenceTercets,20);
 assert.equal(evidence.exactBenzigerEditionCertification,false);
 assert.equal(evidence.completeOrthographicCollation,false);
 assert.equal(evidence.liturgicalPostlude,"Amen. Alleluia.");
 assert.ok(evidence.imageURL.endsWith("/Missale-Romanum-1962-Roman-Missal-color-0748.jpg"));
 assert.ok(STABAT_MATER_SEPTEMBER_FINAL_SEVEN[4].startsWith(evidence.selectedReading18));
 assert.ok(STABAT_MATER_SEPTEMBER_FINAL_SEVEN[5].startsWith(evidence.printedReading19));
 assert.ok(STABAT_MATER_SEPTEMBER_FINAL_SEVEN[6].startsWith(evidence.printedReading20));
});
