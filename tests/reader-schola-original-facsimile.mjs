import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SCHOLA_1961_ORIGINAL_FACSIMILE_COUNT,schola1961OriginalFacsimile}
 from "../src/mass/reader-schola-original-facsimile.js";
import {sourceMusicMaterialGate} from "../src/mass/reader-music-material-gate.js";
const ledger=JSON.parse(readFileSync(new URL("../data/research/mass-music-m21-seven-print-image-parity-worklist.v1.json",import.meta.url),"utf8"));
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.equal(SCHOLA_1961_ORIGINAL_FACSIMILE_COUNT,7);
assert.equal(ledger.scores.length,7);
for(const row of ledger.scores){
 const printed=schola1961OriginalFacsimile(row.movement,row.catalogueSelection);
 assert.ok(printed,"Missing exact historical print for "+row.gregobaseId);
 assert.deepEqual(printed.printedPages,row.printedPages);
 assert.deepEqual(printed.originalPageImages,row.printedPageImageUrls);
 assert.equal(printed.status,"ORIGINAL_PRINT_FACSIMILE_REFERENCE");
 assert.match(printed.originalEditionPdf,/^https:\/\/media\.churchmusicassociation\.org\/pdf\/kyriale-solesmes\.pdf#page=\d+$/);
 assert.equal(printed.gabcMusicallyCertified,false);
 assert.equal(printed.observedParishPerformance,false);
 assert.equal(printed.audioApproved,false);
 assert.equal(printed.inferredFromCalendar,false);
 assert.equal(row.editorialApproval,false);
 assert.equal(row.publicScore,false);
}
assert.equal(new Set(ledger.scores.flatMap(s=>s.printedPageImageUrls)).size,10);
// No guessed scores from the current date, ordinary family alone, custom
// titles, unsupported choices, Requiem variants, or unselected local profiles.
for(const [id,setting] of [["KYRIE",""],["KYRIE","CUSTOM"],
 ["KYRIE","MASS_01"],["GLORIA","MASS_11"],["GLORIA","MASS_16"],
 ["AGNUS_DEI","MASS_11"],["CREDO","MASS_08"],
 ["CREDO","CUSTOM"],["SANCTUS_BENEDICTUS","MASS_16"],
 ["INTROIT","MASS_08"],["KYRIE","Mass VIII · De Angelis"],
 ["","MASS_08"],[null,"MASS_08"]])
 assert.equal(schola1961OriginalFacsimile(id,setting),null,
  "Unexpected historical facsimile for unselected/mismatched setting "+id+"/"+setting);
assert.equal(schola1961OriginalFacsimile("KYRIE","MASS_08").title,"Kyrie VIII · De Angelis");
for(const movement of ["KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]){
 assert.ok(dom.includes('data-schola-original-score="'+movement+'"'),"Missing in-app score viewer: "+movement);
}
assert.match(dom,/schola1961OriginalFacsimile\(id,selected\)/);
assert.match(dom,/printPanel\.hidden=!printed/);
assert.match(dom,/printPanel\.open=false/);
assert.match(dom,/img\.src=printed\.originalPageImages\[i\]/);
assert.match(dom,/img\.loading="lazy"/);
assert.match(dom,/Unaltered 1961 Solesmes printed source page/);
assert.match(dom,/original full pages may include other chants/);
assert.match(dom,/not a certified GABC transcription/);
assert.doesNotMatch(dom,/offlineKyrialeResearchScore\(/);
assert.doesNotMatch(dom,/createOfflineChantEngraver/);
const material=sourceMusicMaterialGate({eventId:"AGNUS_DEI",kind:"CHANT",
 sourceOwner:"AO.SM.M21",sourceRef:"AO.SM.C0222",sourceReferencePresent:true});
assert.equal(material.notation,"NO_APPROVED_RUNTIME_SCORE");
assert.equal(material.referenceAudio,"NO_APPROVED_RUNTIME_RECORDING");
assert.equal(material.publication,"NOT_PROMOTED");
assert.equal(material.usableAsScore,false);
assert.equal(ledger.closedGates.fullyPrintedNoteMatchedCount,0);
assert.equal(ledger.closedGates.approvedForReaderCount,0);
console.log("PASS M29 seven authentic 1961 printed facsimiles visible only by explicit local settings; no GABC/audio/public musical certification promoted");
