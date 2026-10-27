import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  SELECTED_1962_GREGORIAN_REVIEW_SCHEMA,
  reconcile342WithSelectedMass,summarize342SelectedMassSweep,
} from "../tools/mass/reconcile-gr1961-342-selected-proper.mjs";
const ledger=JSON.parse(readFileSync(new URL("../data/mass/chant-corpus/gr1961-342-source-slot-triage.v1.json",import.meta.url),"utf8"));
assert.equal(ledger.records.length,342);
const strong=ledger.records.find(x=>x.trackId==="INTROIT"&&x.tier==="STRONG_INITIAL_TEXT"&&
  x.evidence.some(e=>e.initialWords>=8&&e.section==="Introitus"&&
    !/^(?:v\.|℣\.)\s*/i.test(e.text)));
assert.ok(strong,"Need a normal initial Introit text fixture");
const evidence=strong.evidence.find(e=>e.initialWords>=8&&e.section==="Introitus");
const path=evidence.path,date="2026-10-27";
const incipit=evidence.text;
const named={lat:incipit,en:"Reference English",fr:"Référence française"};
const source={sourcePath:path,introit:named};
const ready={date,status:"ready",day:{main:{id:"test:selected:1962"}},
  proper:{status:"ready",sourcePath:path,data:source}};
const actual=reconcile342WithSelectedMass(ledger,ready);
assert.equal(actual.schema,SELECTED_1962_GREGORIAN_REVIEW_SCHEMA);
assert.equal(actual.properSource,path);
assert.equal(actual.date,date);
assert.ok(actual.matched.some(x=>x.id===strong.id),
  "Actual selected source + Introit opening must be distinguished from sampled occurrence");
assert.ok(actual.matched.every(x=>x.status!=="APPROVED"));
assert.equal(actual.musicalApprovals,0);
assert.equal(actual.readerPromotions,0);
assert.equal(actual.actualChoirProgramme,"UNKNOWN");
assert.equal(actual.autoAssignedScore,null);
assert.equal(reconcile342WithSelectedMass(ledger,{...ready,date:"2026-10-28"},{date:"2026-10-27"}).status,"DAY_RESOLVER_NOT_READY",
  "Selected UI date must not silently follow a changed resolver date");
assert.equal(reconcile342WithSelectedMass(ledger,{...ready,proper:{...ready.proper,status:"failed"}}).status,"DAY_RESOLVER_NOT_READY");
assert.equal(reconcile342WithSelectedMass(ledger,{...ready,proper:{...ready.proper,sourcePath:"Tempora/WRONG"}}).status,"DAY_RESOLVER_NOT_READY");
const changed={...ready,proper:{...ready.proper,data:{...source,introit:{...named,lat:"A different Introit was actually selected."}}}};
assert.equal(reconcile342WithSelectedMass(ledger,changed).matched.some(x=>x.id===strong.id),false,
  "Same source path alone never assigns a chant whose selected Latin differs");
const pre=ledger.records.find(x=>x.tier==="STRONG_INITIAL_TEXT"&&
  ["gr","al","tr"].includes(x.officePart)&&x.evidence.some(e=>e.initialWords>=8));
assert.ok(pre);
const preEvidence=pre.evidence.find(e=>e.initialWords>=8);
const preDay={date,status:"ready",proper:{status:"ready",sourcePath:preEvidence.path,
  data:{sourcePath:preEvidence.path,gradual:{lat:preEvidence.text,en:"Gradual",fr:"Graduel"}}}};
const noProof=reconcile342WithSelectedMass(ledger,preDay);
assert.ok(noProof.unresolved.some(r=>r.id===pre.id&&r.status==="SEGMENT_UNVERIFIED"),
 "Never identify Gradual/Alleluia/Tract from a composite without trilingual proof");
assert.throws(()=>reconcile342WithSelectedMass({records:[]},ready),/LEDGER_REQUIRED/);
const summary=summarize342SelectedMassSweep(ledger,[actual,noProof],{year:2026});
assert.equal(summary.daysChecked,2);
assert.equal(summary.daysSourceReady,2);
assert.equal(summary.musicalFacsimileApprovals,0);
assert.equal(summary.editorialPromotions,0);
assert.ok(summary.observations.some(x=>x.id===strong.id));
const ciSnapshot=JSON.parse(readFileSync(new URL(
 "../data/mass/chant-corpus/gr1961-342-selected-proper-2026-ci-observations.v1.json",import.meta.url),"utf8"));
assert.equal(ciSnapshot.schema,"ao-gr1961-342-2026-verified-run-observation-v1");
assert.equal(ciSnapshot.source.jobConclusion,"success");
assert.match(ciSnapshot.source.commitSha,/^[0-9a-f]{40}$/);
assert.equal(ciSnapshot.scope.datesChecked,365);
assert.equal(ciSnapshot.scope.dayResolverFailures,0);
assert.equal(ciSnapshot.scope.distinctTextMatchedCandidateIds,3);
assert.equal(ciSnapshot.scope.sourceMatchOccurrences,4);
assert.equal(ciSnapshot.scope.musicalFacsimileApprovals,0);
assert.equal(ciSnapshot.scope.editorialPromotions,0);
assert.equal(ciSnapshot.observations.length,4);
for(const observation of ciSnapshot.observations){
 const score=ledger.records.find(x=>x.id===observation.id);
 assert.ok(score,observation.id+" no longer exists in frozen research archive");
 assert.equal(observation.status,"SELECTED_1962_TEXT_EVIDENCE");
 assert.ok(score.evidence.some(e=>e.path===observation.properSource&&
   e.sourceBlobSha===observation.sourceBlobSha),"CI source identity drift for "+observation.id);
}
const ciDiagnostics=JSON.parse(readFileSync(new URL(
 "../data/mass/chant-corpus/gr1961-342-selected-proper-2026-ci-diagnostics.v1.json",import.meta.url),"utf8"));
assert.equal(ciDiagnostics.schema,"ao-gr1961-342-2026-ci-disposition-audit-v1");
assert.equal(ciDiagnostics.provenance.conclusion,"success");
assert.equal(ciDiagnostics.summary.daysChecked,365);
assert.equal(ciDiagnostics.summary.daysSourceReady,365);
assert.equal(ciDiagnostics.summary.candidateDatePairsInspected,677);
assert.equal(ciDiagnostics.summary.unresolvedCandidateDatePairs,673);
assert.deepEqual(ciDiagnostics.summary.unverifiedByStatus,{
 SEGMENT_UNVERIFIED:294,TEXT_NOT_SELECTED:236,TEXT_QUALITY_REVIEW:143});
assert.equal(Object.values(ciDiagnostics.summary.unverifiedByStatus).reduce((a,b)=>a+b,0),
 ciDiagnostics.summary.unresolvedCandidateDatePairs);
assert.equal(ciDiagnostics.summary.candidateDatePairsInspected,
 ciDiagnostics.summary.unresolvedCandidateDatePairs+ciDiagnostics.summary.sourceMatchOccurrences);
assert.equal(ciDiagnostics.summary.distinctTextMatchedCandidateIds,ciSnapshot.scope.distinctTextMatchedCandidateIds);
assert.equal(ciDiagnostics.summary.sourceMatchOccurrences,ciSnapshot.scope.sourceMatchOccurrences);
assert.equal(ciDiagnostics.summary.musicalFacsimileApprovals,0);
assert.equal(ciDiagnostics.summary.editorialPromotions,0);
console.log("PASS actual selected 1962 Proper contract, wrong-text hold, pre-Gospel proof gate, no musical releases");
