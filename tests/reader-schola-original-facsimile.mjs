import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SCHOLA_1961_ORIGINAL_FACSIMILE_COUNT,schola1961OriginalFacsimile}
 from "../src/mass/reader-schola-original-facsimile.js";
import {sourceMusicMaterialGate} from "../src/mass/reader-music-material-gate.js";
const ledger=JSON.parse(readFileSync(new URL("../data/research/mass-music-m21-seven-print-image-parity-worklist.v1.json",import.meta.url),"utf8"));
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.equal(SCHOLA_1961_ORIGINAL_FACSIMILE_COUNT,20,
 "Original 7 + Mass XI/seasonal 5 + Mass I/XVII/XVIII 8 printed score spans");
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
// The historical M21 seven-score ledger remains immutable; added sources
// belong to the new batch and must not be mislabeled as M21-reviewed.
const additions=[
 ["KYRIE","MASS_17",["55*"],["932.png"]],
 ["KYRIE","MASS_18",["57*"],["934.png"]],
 ["GLORIA","MASS_11",["39*","40*"],["916.png","917.png"]],
 ["SANCTUS_BENEDICTUS","MASS_11",["40*","41*"],["917.png","918.png"]],
 ["AGNUS_DEI","MASS_11",["41*"],["918.png"]]
];
for(const [movement,selection,folio,images] of additions){
 const record=schola1961OriginalFacsimile(movement,selection);
 assert.ok(record,"Added printed witness missing: "+movement+" / "+selection);
 assert.deepEqual(record.printedPages,folio);
 assert.deepEqual(record.originalPageImages.map(x=>x.split("/").at(-1)),images);
 assert.equal(record.status,"ORIGINAL_PRINT_FACSIMILE_REFERENCE");
 assert.equal(record.gabcMusicallyCertified,false);
 assert.equal(record.inferredFromCalendar,false);
 assert.equal(record.observedParishPerformance,false);
}

// The third batch preserves page spans; first folio alone is insufficient
// for Kyrie/Gloria/Sanctus I. Source image URLs correspond to actual original
// Graduale Romanum 1961 scanned pages, not modern PDF renderings.
const massIAndSeasonal=[
 ["KYRIE","MASS_01",["4*","5*"],["881.png","882.png"]],
 ["GLORIA","MASS_01",["5*","6*"],["882.png","883.png"]],
 ["SANCTUS_BENEDICTUS","MASS_01",["6*","7*"],["883.png","884.png"]],
 ["AGNUS_DEI","MASS_01",["7*"],["884.png"]],
 ["SANCTUS_BENEDICTUS","MASS_17",["56*"],["933.png"]],
 ["AGNUS_DEI","MASS_17",["57*"],["934.png"]],
 ["SANCTUS_BENEDICTUS","MASS_18",["58*"],["935.png"]],
 ["AGNUS_DEI","MASS_18",["58*"],["935.png"]]
];
for(const [movement,selection,pages,files] of massIAndSeasonal){
 const witness=schola1961OriginalFacsimile(movement,selection);
 assert.ok(witness,selection+" missing "+movement);
 assert.deepEqual(witness.printedPages,pages);
 assert.deepEqual(witness.originalPageImages.map(s=>s.split("/").at(-1)),files);
 assert.equal(witness.originalPageImages.length,pages.length);
 assert.equal(witness.gabcMusicallyCertified,false);
 assert.equal(witness.observedParishPerformance,false);
 assert.equal(witness.audioApproved,false);
 assert.equal(witness.inferredFromCalendar,false);
}
assert.equal(schola1961OriginalFacsimile("GLORIA","MASS_18"),null,
 "Missa XVIII has no Gloria and must never have a fake printed score");
assert.equal(schola1961OriginalFacsimile("GLORIA","MASS_17"),null,
 "Missa XVII has no Gloria and must never have a fake printed score");

// No guessed scores from the current date, ordinary family alone, custom
// titles, unsupported choices, Requiem variants, or unselected local profiles.
for(const [id,setting] of [["KYRIE",""],["KYRIE","CUSTOM"],
 ["KYRIE","MASS_02"],["GLORIA","MASS_17"],["GLORIA","MASS_16"],
 ["AGNUS_DEI","MASS_15"],["CREDO","MASS_08"],
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
assert.match(dom,/printContent\.hidden=true/);
assert.match(dom,/printToggle\.onclick=/);
assert.doesNotMatch(dom,/<summary>Original 1961 printed notation<\/summary>/);
assert.match(dom,/img\.src=printed\.originalPageImages\[i\]/);
assert.match(dom,/img\.loading="lazy"/);
assert.match(dom,/Unaltered 1961 Solesmes printed source page/);
assert.match(dom,/original full pages may include other chants/);
assert.match(dom,/not a certified GABC transcription/);
assert.doesNotMatch(dom,/offlineKyrialeResearchScore\(/);
// A source-authenticated, provisional Proper reference may reuse the
// renderer that the inline Ordo already employs. This must never unlock
// unapproved Kyriale archive GABC from the local programme.
assert.match(dom,/createOfflineChantEngraver\(\{viewport:staff,document:doc\}\)/);
assert.match(dom,/score\.publicScoreApproved!==false/);
const properAccess=readFileSync(new URL("../src/mass/reader-schola-score-access.js",import.meta.url),"utf8");
assert.match(properAccess,/referenceScoresForParagraph\(/);
assert.doesNotMatch(properAccess,/offlineKyrialeResearchScore/);
const material=sourceMusicMaterialGate({eventId:"AGNUS_DEI",kind:"CHANT",
 sourceOwner:"AO.SM.M21",sourceRef:"AO.SM.C0222",sourceReferencePresent:true});
assert.equal(material.notation,"NO_APPROVED_RUNTIME_SCORE");
assert.equal(material.referenceAudio,"NO_APPROVED_RUNTIME_RECORDING");
assert.equal(material.publication,"NOT_PROMOTED");
assert.equal(material.usableAsScore,false);
assert.equal(ledger.closedGates.fullyPrintedNoteMatchedCount,0);
assert.equal(ledger.closedGates.approvedForReaderCount,0);
console.log("PASS M29 historical seven plus thirteen explicit 1961 printed score spans; M21 ledger remains seven and no printed-note/audio approval is invented");
