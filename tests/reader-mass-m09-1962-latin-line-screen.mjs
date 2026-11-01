import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditM09SourceLines,normalize1962LatinWitness,
 gabcScoreLatinStream,normalizedProperDonorLine,screen1962ProperSourceLine,
 permitM09LiveScore,M09_COMPARISON_CLASSES}
 from "../src/mass/reader-m09-1962-latin-discrimination.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const qs=Array.from({length:6},(_,i)=>load(
 "data/research/mass-music-m09-1962-line-qa-00"+(i+1)+".v1.json"));
const m08=Array.from({length:6},(_,i)=>load(
 "data/research/mass-music-m08-source-qa-00"+(i+1)+".v1.json"));
const triage=load("data/research/mass-music-m07-342-source-triage.v1.json");
const selected2026=load("data/research/mass-music-m07-selected-2026-text-evidence.v1.json");
const args={batches:qs,m08Batches:m08,triage,selected2026};
const got=auditM09SourceLines(args);
assert.equal(got.status,"TEXT_ONLY_SECONDARY_SCREEN_COMPLETE",JSON.stringify(got));
assert.equal(got.sourceCandidateIds,342);
assert.equal(got.sourceOccurrences,506);
assert.deepEqual({...got.comparisons},{
 NORMALIZED_DONOR_LINE_CONTIGUOUS:239,
 SOURCE_PREFIX_EIGHT_OR_MORE_WORDS:124,
 SOURCE_PREFIX_FOUR_TO_SEVEN_WORDS:44,
 NO_SECURE_FOUR_WORD_PREFIX:99
});
assert.equal(got.unresolvedOrInsecureOccurrences,99);
assert.equal(got.selected2026TextMatchedScoreIds,3);
assert.equal(got.selected2026Occurrences,4);
assert.equal(got.sourceApprovedFor1962Day,0);
assert.equal(got.facsimileNeumesVerified,0);
assert.equal(got.fullScoreLatinVerified,0);
assert.equal(got.editorialApprovals,0);
assert.equal(got.publicScores,0);
assert.equal(got.noAutomatedPromotion,true);
assert.equal(normalize1962LatinWitness("Dómine! Cǽli, Jerúsalem"),"domine caeli ierusalem");
assert.equal(normalizedProperDonorLine("V. Laudem Dómini loquétur os meum"),
 "laudem domini loquetur os meum");
const gabc="(c4) Al(g)le(h)lú(g){ia}.(g.) (::) <sp>V/</sp>. "+
 "Lau(h)dem(g) Dó(g)mi(g)ni(g) lo(g)qué(g)tur(g) os(g) me(g)um(g) (::)";
assert.equal(gabcScoreLatinStream(gabc),"alleluia laudem domini loquetur os meum");
assert.equal(screen1962ProperSourceLine(gabc,
 "V. Laudem Dómini loquétur os meum").comparisonClass,
 M09_COMPARISON_CLASSES.LINE);
assert.equal(screen1962ProperSourceLine(gabc,
 "V. Laudem Dómini loquétur os meum et benedícat omnis caro").comparisonClass,
 M09_COMPARISON_CLASSES.FOUR);
assert.equal(screen1962ProperSourceLine(gabc,
 "V. Quis ut Deus, et non invenitur alius similis tibi").comparisonClass,
 M09_COMPARISON_CLASSES.NONE);
assert.equal(screen1962ProperSourceLine("", "Deus meus in te speravi").comparisonClass,
 M09_COMPARISON_CLASSES.NONE);
assert.ok(qs.every(x=>x.occurrenceCount===x.records.reduce((a,r)=>a+r.occurrences.length,0)));
const sample=JSON.parse(JSON.stringify(qs));
sample[2].records[1].editorialApproval=true;
assert.equal(auditM09SourceLines({...args,batches:sample}).status,"SOURCE_EVIDENCE_HOLD");
const wrong=JSON.parse(JSON.stringify(qs));
wrong[2].records[1].occurrences[0].sourceBlobSha="0".repeat(40);
assert.equal(auditM09SourceLines({...args,batches:wrong}).reason,
 "OCCURRENCE_TEXT_PROVENANCE_OR_STATUS_CHANGED");
const altered=JSON.parse(JSON.stringify(qs));
altered[0].records[0].occurrences[0].initialMatchingWords=0;
assert.equal(auditM09SourceLines({...args,batches:altered}).status,
 "SOURCE_EVIDENCE_HOLD");
assert.equal(permitM09LiveScore({id:"GREGOBASE-389"},
 {witness:true,noteForNote:true},{approved:true}),null);
const schola=readFileSync(new URL("../src/mass/reader-schola-event-timeline.js",import.meta.url),"utf8");
assert.doesNotMatch(schola,/reader-m09-1962-latin-discrimination|mass-music-m09-1962-line-qa/);
console.log("PASS M09 342 score candidates, 506 independently screened donor lines, 239 full donor-line text matches; 0 musical approvals");
