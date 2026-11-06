import assert from "node:assert/strict";
import {PARTICIPATION_REFERENCE_SCORES} from "../src/mass/reader-participation-reference-scores.js";
import {GOSPEL_1961_REFERENCE_WITNESSES} from "../src/mass/reader-gospel-response-reference-scores.js";
import {build24PhraseSourceAudit,compareExactArchivedPhrase,stripSourceLayout,
 SOURCE_PHRASE_AUDIT_SCHEMA} from "../scripts/mass/audit-24-participation-source-phrases.mjs";
const audit=await build24PhraseSourceAudit();
assert.equal(audit.schema,SOURCE_PHRASE_AUDIT_SCHEMA);
assert.deepEqual(audit.counts,{
 originalSourceRecords:11,archivedExcerpts:24,identicalSourcePhrases:24,
 sourceDrift:0,printedNeumeCollationsApproved:0,newPublicApprovals:0
});
assert.equal(new Set(audit.rows.map(r=>r.scoreId)).size,24);
assert.equal(new Set(audit.rows.map(r=>r.sourceId)).size,11);
assert.equal(new Set(audit.rows.flatMap(r=>r.cueIds)).size,15,
 "One cue may have multiple source tone variants; never double-count these as new Mass cues");
for(const row of audit.rows){
 assert.equal(row.gabcPhraseEquality,"SOURCE_GABC_PHRASE_EXACT",row.scoreId);
 assert.equal(row.sourcePhraseSha256,row.excerptPhraseSha256,row.scoreId);
 assert.match(row.sourceDownload,/^https:\/\/gregobase\.selapa\.net\/download\.php\?elem=1&format=gabc&id=\d+$/);
 assert.ok(row.sourceClef==="c3"||row.sourceClef==="c4");
 assert.equal(row.sourceClef,row.excerptClef);
 assert.ok(row.originalPrinted1961Plates.length>=1);
 assert.ok(row.originalPrinted1961Plates.every(x=>/^https:\/\/gregobase\.selapa\.net\/sources\/[23]\/\d+\.png$/.test(x)));
 assert.equal(row.facsimileMusicalNoteParity,"PENDING_NOTE_BY_NOTE_REVIEW");
 assert.equal(row.publicScoreApproved,false);
}
const preface=PARTICIPATION_REFERENCE_SCORES.find(x=>x.id==="AO.REF.PREFACE_SOLEMN.0136");
const source="%%\n(c3) PER(c) ó(e)mni(f)a(f) saecula.(e.) (::) <sp>R/</sp>. A(e)men.(ef..) (::)";
assert.equal(compareExactArchivedPhrase(preface,source).match,true);
const changedNote={...preface,gabc:preface.gabc.replace("A(e)men.","A(f)men.")};
const change=compareExactArchivedPhrase(changedNote,source);
assert.equal(change.match,false);
assert.equal(change.reason,"SOURCE_GABC_NOTE_OR_TEXT_MISMATCH");
const changedClef={...preface,gabc:preface.gabc.replace("(c3)","(c4)")};
assert.equal(compareExactArchivedPhrase(changedClef,source).reason,"SOURCE_CLEF_MISMATCH");
const shiftedIndex={...preface,sourcePhraseIndex:12};
assert.equal(compareExactArchivedPhrase(shiftedIndex,source).reason,"MISSING_CLEF_OR_SOURCE_PHRASE");
const g=GOSPEL_1961_REFERENCE_WITNESSES.find(x=>x.sourceId===4491);
assert.ok(g);
const gospel=PARTICIPATION_REFERENCE_SCORES.find(x=>x.sourceId===4491&&x.sourceCueIds.includes("AO.SM.C0085"));
assert.equal(compareExactArchivedPhrase(gospel,g.gabc).match,true);
assert.equal(stripSourceLayout("(Z-) ~~~~~<sp>R/</sp>. Deo(g)","2901",1),
 "(Z-) ~~~~~<sp>R/</sp>. Deo(g)"); // the source ID must be numeric
assert.equal(stripSourceLayout("(Z-) ~~~~~<sp>R/</sp>. Deo(g)",2901,1),
 "<sp>R/</sp>. Deo(g)");
assert.throws(()=>stripSourceLayout("~~~~<sp>R/</sp>. Deo(g)",823,1),
 /UNEXPECTED_SOURCE_LAYOUT_TILDE/);
const benedicamus=audit.rows.filter(x=>x.sourceId===2901);
assert.equal(benedicamus.length,2);
assert.deepEqual(benedicamus.map(x=>x.sourcePhraseIndex),[0,1]);
assert.ok(benedicamus.every(x=>x.gabcPhraseEquality==="SOURCE_GABC_PHRASE_EXACT"));
for(const id of [961,749]){
 const row=audit.rows.find(x=>x.sourceId===id);
 assert.ok(row);
 assert.match(row.sourceScope,/FIRST_PHRASE_ONLY/);
}
console.log("PASS all 24 GABC phrase checks from 11 source records; detects pitch, clef and phrase-index tampering; no facsimile or public certification");
