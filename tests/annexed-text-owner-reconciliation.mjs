import assert from "node:assert/strict";
import {buildReconciliation,normalizeLatin,RITES,OWNER_SOURCES}
  from "../tools/mass/reconcile-annexed-text-owners.mjs";

const x=buildReconciliation();
assert.equal(x.status,"AUDIT_ONLY_NO_TEXT_CHANGES_NO_EDITORIAL_APPROVAL");
assert.equal(x.summary.annexedRites,8);
assert.equal(x.corpus.canonicalOrdinaryCueIds,256);
assert.ok(x.corpus.canonicalOrdinaryUniqueLatin>150);
assert.ok(x.summary.sourceLeavesScanned>250);
assert.ok(x.summary.ordinaryMatchLeaves>40);
assert.ok(x.summary.crossRiteSharedLatinGroups>10);
assert.equal(x.summary.noExactOrdinaryMatchLeaves+x.summary.ordinaryMatchLeaves,
  x.summary.sourceLeavesScanned);
assert.equal(x.hold.missingTranslationCount,null,
  "The script cannot call a non-matching passage a missing translation");
assert.ok(x.editorialPrecedence.some(p=>p.includes("NOT a confirmed translation gap")));
assert.equal(RITES.length,8);
assert.equal(OWNER_SOURCES.french,"data/presentation/reader-french-ordinary.v1.json");
const owned=(rite,path,cue)=>x.ordinaryReuseCandidates.some(row=>
  row.rite===rite&&row.path===path&&row.cues.some(c=>c.id===cue));
assert.ok(owned("ASPERGES","versicles.0.latin","AO.SM.C0030"),
  "Existing Ordinary covers Asperges Ostende nobis EN/FR; do not retranslate");
assert.ok(owned("PALM","texts.versicle","AO.SM.C0034"),
  "Existing Ordinary covers Palm Dominus vobiscum");
assert.ok(owned("ASH","conclusion.oremus","AO.SM.C0036"),
  "Existing Ordinary covers Ash Oremus");
assert.ok(owned("CANDLEMAS","dialogue.response","AO.SM.C0035"),
  "Existing Ordinary covers Candlemas Et cum spiritu tuo");
assert.ok(owned("ROGATIONS_PROCESSION","litanyBeforeProcession.0.1","AO.SM.C0044"),
  "Existing Ordinary covers repeated Rogations Kyrie");
assert.ok(owned("REQUIEM_ABSOLUTION","kyriePaterVersicles.versicles.8.latin",
  "AO.SM.C0034"),"Existing Ordinary covers Requiem Dominus vobiscum");
assert.ok(owned("CORPUS_CHRISTI","benediction.oremus","AO.SM.C0036"),
  "Existing Ordinary covers Benediction Oremus");
assert.ok(x.crossRiteGroups.some(g=>
  g.occurrences.some(t=>t.rite==="CORPUS_CHRISTI"&&t.path==="pangeLingua.0") &&
  g.occurrences.some(t=>t.rite==="HOLY_THURSDAY_POST"&&t.path==="pangeLingua.0")),
  "Corpus and Holy Thursday hymn should reference one content owner, not two original translations");
assert.ok(x.crossRiteGroups.some(g=>
  g.occurrences.some(t=>t.rite==="PALM"&&t.path==="texts.procedamus") &&
  g.occurrences.some(t=>t.rite==="CANDLEMAS"&&t.path==="procession.procedamus")),
  "Palm and Candlemas have the same Procedamus Latin, but distinct ceremonial actions");
assert.ok(x.corpus.rogationProperSectionCount>4);
assert.ok(x.corpus.rogationProperSections.includes("collect"));
assert.equal(normalizeLatin("Dóminus vobíscum."),normalizeLatin("Dominus vobiscum"));
assert.equal(normalizeLatin("℣. Orémus."),normalizeLatin("Oremus."));
assert.ok(!x.ordinaryReuseCandidates.some(r=>r.rite==="HOLY_THURSDAY_POST"&&
  r.path==="stripping.psalm21Pian.0"),
  "Pian Psalm source should not be equated with an unrelated Ordinary cue");
console.log("PASS annexed text owner reconciliation: existing 256-cue bilingual Ordinary, 8 rite sources, cross-rite hymn, and separate Rogation Mass Proper; no invented translation gaps");
console.log(JSON.stringify(x.summary));
