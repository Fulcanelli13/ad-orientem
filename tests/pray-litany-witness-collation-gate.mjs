import assert from "node:assert/strict";
import {
 LITANY_SOURCE_WITNESSES,LITANY_WITNESS_REVIEW_V1,
 reviewLitanyTranscription,extractLitanyProper,paginateLitanyProper
} from "../src/pray/litany-source.js";

// A release guard for historical source OWNERSHIP, not an invented Litany.
// A print facsimile comparison and rights review remain required separately.
const en=LITANY_WITNESS_REVIEW_V1.en,fr=LITANY_WITNESS_REVIEW_V1.fr;
assert.match(en.transcriptionRevision,/oldid=12282621$/);
assert.match(fr.transcriptionRevision,/oldid=14794744$/);
assert.match(fr.printFacsimile,/tome_9\.djvu\/293$/);
assert.equal(en.collation,"UNCOLLATED_WITH_PRINT");
assert.equal(fr.collation,"PARTIAL_SCAN_CROSSCHECK_PENDING");
assert.notEqual(en.edition,fr.edition,"Do not fuse English and French historical editions");
assert.notEqual(LITANY_SOURCE_WITNESSES.en.url,LITANY_SOURCE_WITNESSES.fr.url);

const opening=[
 "LES LITANIES DES SAINTS.","Seigneur, ayez pitié de nous.",
 "Sainte Marie, priez pour nous.","Saint Pierre, priez pour nous.",
 "Saint Jean, riez pour nous.","Jésus-Christ, avez pitié de nous."
].join("\n");
const filler=Array.from({length:45},(_,i)=>"INVOCATION SYNTHETIC TEST "+(i+1)+" — priez pour nous.").join("\n");
const closing="Agneau de Dieu, faites-nous miséricorde.\nNotre Père, qui, etc.\nPsaume LXIX. SHOULD NEVER ENTER LITANY";
const synthetic=[opening,filler,closing].join("\n");
const proper=extractLitanyProper(synthetic,"fr"),parts=paginateLitanyProper(proper,"fr");
assert.ok(parts.length>=3,"Historical Litany stage count is source-derived");
assert.doesNotMatch(proper,/Psaume LXIX|Notre Père/);
const audit=reviewLitanyTranscription(proper,"fr");
assert.equal(audit.canCertify1962,false);
assert.equal(audit.safeToSilentlyEmend,false);
assert.deepEqual(audit.suspectedReadings.map(x=>x.id),[
 "CORNEILLE-1862-JEAN-INTERCESSION","CORNEILLE-1862-CHRIST-MERCY"
]);
assert.match(proper,/Saint Jean, riez pour nous\./,"Historical text must not be silently altered");
assert.throws(()=>reviewLitanyTranscription(proper,"la"),/Unsupported/);
const sourceOnly=reviewLitanyTranscription("Lord, have mercy on us. Holy Mary, pray for us.","en");
assert.deepEqual(sourceOnly.suspectedReadings,[]);
assert.equal(sourceOnly.canCertify1962,false);
const cleanFrench=reviewLitanyTranscription(proper.replace("Saint Jean, riez pour nous.","Saint Jean, [PRINT COLLATION PENDING]"),"fr");
assert.equal(cleanFrench.suspectedReadings.length,1);
console.log("PASS historical Litany: edition separation, pinned review revisions, exact suspected readings, bounded Litany and no silent textual emendation");
console.log("NOT_CERTIFIED original 1862 print transcription, 1883 print transcription, 1962 liturgical edition, offline distribution rights");
