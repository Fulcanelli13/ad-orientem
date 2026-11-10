import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildKyrieVIIIOpeningPitchInventory,KYRIE_VIII_OPENING_PITCH_SCHEMA}
 from "../scripts/schola/kyrie-viii-opening-pitch-inventory.mjs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
const corpus=JSON.parse(readFileSync(
 new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const review=buildKyrieVIIIOpeningPitchInventory({corpus});
assert.equal(review.schema,KYRIE_VIII_OPENING_PITCH_SCHEMA);
assert.equal(review.status,"25_SOURCE_PITCHES_EXTRACTED_PRINT_COMPARISON_PENDING");
assert.deepEqual(review.canonicalCues,["AO.SM.C0044","AO.SM.C0045","AO.SM.C0046"]);
assert.equal(review.sourcePage,"28*");
assert.equal(review.staffClef,"c3");
assert.equal(review.threeInvocationsSameMelody,true);
assert.equal(review.sungLyricSyllables,7);
assert.equal(review.notatedGroups,8);
assert.equal(review.pitchNoteheads,25);
assert.deepEqual(review.noteheadCounts,[1,3,5,7,6,1,1,1]);
assert.equal(review.encodedAccidentalGlyphs,2);
assert.deepEqual(review.groups.map(g=>g.unitId),[
 "K8-L01-U02","K8-L01-U03","K8-L01-U04","K8-L01-U06",
 "K8-L01-U08","K8-L01-U09","K8-L01-U10","K8-L01-U11"
]);
assert.deepEqual(review.groups.map(g=>g.accidentals.map(a=>a.symbol)),
 [[],["gx"],[],[],["gx"],[],[],[]]);
assert.deepEqual(review.pitchSequence,[
 "d", "f","g","h", "h","i","H","G","h",
 "k","I","H","G","h","i","h",
 "h","F","E","D","g","f", "e","e","d"
]);
assert.equal(review.pitchSequence.length,25);
assert.deepEqual(review.rhythmic,{
 dottedNoteheads:4,
 verticalEpisemaNoteheads:3,
 virgaNoteheads:3,
 inclinataNoteheads:8
});
assert.deepEqual(review.groups[1].notes.map(n=>n.gabcPitch),["f","g","h"],
 "Flat glyph gx is NOT a sung g note");
assert.equal(review.groups[4].notes[0].gabcPitch,"h");
assert.equal(review.groups[4].accidentals[0].staffPosition,"g");
assert.equal(review.groups[1].accidentals[0].type,"FLAT");
assert.ok(review.groups.every(x=>x.status==="SOURCE_PITCHES_PARSED_PRINT_COMPARISON_PENDING"&&
 x.notesComparedWith1961Print===0&&x.staffHeightVerified===false&&
 x.neumeShapeVerified===false&&x.rhythmicSignsVerified===false&&
 x.originalPrintUrl.includes("/905.png")&&x.secondWitnessUrl.includes("/148.png")));
assert.equal(review.printVerifiedNoteheads,0);
assert.equal(review.printVerifiedNeumeGroups,0);
assert.equal(review.printVerifiedAccidentalGlyphs,0);
assert.equal(review.printVerifiedRhythmicSigns,0);
assert.equal(review.musicalApproved,false);
assert.equal(review.publishedScores,0);
const source=offlineKyrialeResearchScore("KYRIE","MASS_08");
const tampered={...source,gabc:source.gabc.replace("(gxfgh)","(gxfhh)")};
assert.equal(buildKyrieVIIIOpeningPitchInventory({corpus,source:tampered}).status,
 "HOLD_SOURCE_DRIFT");
const badCorpus=structuredClone(corpus);
badCorpus.blocks.find(b=>b.Macro_ID==="AO.SM.M02").units[0].cue_id="AO.SM.C8888";
assert.equal(buildKyrieVIIIOpeningPitchInventory({corpus:badCorpus}).status,
 "HOLD_SOURCE_DRIFT");
console.log("SCHOLA_KYRIE_VIII_OPENING_PITCH_INVENTORY_PASS 25 pitched notes + 2 flat glyphs separated; 0 print-certified notes");
