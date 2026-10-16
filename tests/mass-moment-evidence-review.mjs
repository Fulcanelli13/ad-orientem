import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MASS_MOMENT_EVIDENCE_SCHEMA,MASS_MOMENT_EVIDENCE_DECISIONS,
 massMomentEvidencePreviewEnabled,validateMassMomentEvidenceCatalog,
 massMomentEvidenceForGuide,massMomentEvidencePanelHtml,massMomentEvidenceSummaryHtml,
 massMomentEvidenceChoiceIsSafe,sanitizeMassMomentEvidenceDecisions,
 massMomentEvidenceDecisionExport
} from "../src/learn/mass-moment-evidence-review.js";
const catalog=JSON.parse(readFileSync(new URL("../data/learn/research/mass-moment-author-evidence-review-20261016.v1.json",import.meta.url),"utf8"));
const guides=JSON.parse(readFileSync(new URL("../data/presentation/guide-registry.v1.json",import.meta.url),"utf8"));
assert.equal(validateMassMomentEvidenceCatalog(catalog),catalog);
assert.equal(catalog.schema,MASS_MOMENT_EVIDENCE_SCHEMA);
assert.equal(catalog.census.claims,139);
assert.equal(catalog.census.passageVerifiedResearchLabel,69);
assert.equal(catalog.census.guideOwnersWithCandidates,16);
assert.equal(catalog.census.publicationApproved,0);
assert.equal(catalog.census.reproductionCleared,0);
assert.equal(catalog.census.reviewedTextForRelease,0);
const summary=massMomentEvidenceSummaryHtml(catalog);
assert.ok(summary.includes("16 / 32"));
assert.ok(summary.includes("0 / 139"));
assert.ok(summary.includes('data-ao-mf-evidence-summary'));
assert.equal(massMomentEvidenceForGuide(catalog,"AO.CARD.014").length,51);
assert.equal(massMomentEvidenceForGuide(catalog,"AO.CARD.017").length,24);
assert.equal(massMomentEvidenceForGuide(catalog,"AO.CARD.006").length,0);
const claimIds=new Set();
for(const row of catalog.records){
 assert.ok(!claimIds.has(row.id),row.id);claimIds.add(row.id);
 assert.equal(row.publicationApproved,false,row.id);
 assert.equal(row.sourceEditionCollated,false,row.id);
 assert.equal(row.quotationReproductionCleared,false,row.id);
 assert.ok(row.guideIds.every(x=>guides.entries[x]),row.id);
}
for(const [query,expected] of [["?massEvidenceReview=1",true],["?massEvidenceReview=0",false],["",false],["?other=massEvidenceReview=1",false]]){
 assert.equal(massMomentEvidencePreviewEnabled({location:{search:query}}),expected);
}
for(const fr of [false,true]){
 const html=massMomentEvidencePanelHtml(catalog,"AO.CARD.014",{french:fr,decisions:{"VER-001":"PRIORITIZE_COLLATION"}});
 assert.ok(html.includes('data-ao-mf-evidence-review="AO.CARD.014"'));
 assert.equal((html.match(/data-ao-mf-evidence-claim="/g)||[]).length,51);
 assert.equal((html.match(/data-ao-mf-evidence-decision="/g)||[]).length,51);
 assert.ok(html.includes(fr?"Contrôler l&#39;original":"Check printed original"));
 assert.ok(html.includes('data-ao-mf-evidence-export'));
 assert.ok(!html.includes("<a href="),"Unqualified source URLs may not be linked");
 assert.ok(!html.includes('data-ao-reference-panel'),"Research panel is not the certified Sources drawer");
 assert.ok(!html.includes("publicationApproved=true"));
}
assert.equal(massMomentEvidencePanelHtml(catalog,"AO.CARD.006").includes("· 0"),true);
assert.equal(massMomentEvidencePanelHtml(catalog,"AO.CARD.999").includes('data-ao-mf-evidence-review'),true);
assert.equal(massMomentEvidenceChoiceIsSafe("APPROVED_FOR_READING"),false);
assert.equal(massMomentEvidenceChoiceIsSafe("PUBLICATION_APPROVED"),false);
assert.deepEqual(MASS_MOMENT_EVIDENCE_DECISIONS,["HOLD","PRIORITIZE_COLLATION","QUESTION_SCOPE","DO_NOT_USE"]);
const selected=sanitizeMassMomentEvidenceDecisions(catalog,{
 "VER-001":"PRIORITIZE_COLLATION","VER-002":"DO_NOT_USE","VER-003":"PUBLICATION_APPROVED",
 "VER-099":"HOLD","VER-999":"PRIORITIZE_COLLATION"
});
assert.deepEqual(selected,{"VER-001":"PRIORITIZE_COLLATION","VER-002":"DO_NOT_USE"});
const out=massMomentEvidenceDecisionExport(catalog,selected);
assert.equal(out.publicationApproved,false);
assert.equal(out.approvedQuotations,0);
assert.deepEqual(out.records,[{claimId:"VER-001",choice:"PRIORITIZE_COLLATION"},
 {claimId:"VER-002",choice:"DO_NOT_USE"}]);
{
 const bad=JSON.parse(JSON.stringify(catalog));bad.records[0].publicationApproved=true;
 assert.throws(()=>validateMassMomentEvidenceCatalog(bad),/PUBLICATION/);
}
{
 const bad=JSON.parse(JSON.stringify(catalog));bad.records[0].guideIds=["LOW.002"];
 assert.throws(()=>validateMassMomentEvidenceCatalog(bad),/GUIDE/);
}
{
 const bad=JSON.parse(JSON.stringify(catalog));bad.census.reproductionCleared=1;
 assert.throws(()=>validateMassMomentEvidenceCatalog(bad),/RELEASE_COUNTS/);
}
const formation=readFileSync(new URL("../src/learn/mass-formation.js",import.meta.url),"utf8");
for(const required of ["massMomentEvidencePreviewEnabled(win)","loadMassMomentEvidenceCatalog({fetchImpl})",
 "massMomentEvidencePanelHtml(","data-ao-mf-evidence-export","data-ao-mf-evidence-decision",
 "massMomentEvidenceDecisionExport(","ao.mass.source-evidence-triage.v1"]){
 assert.ok(formation.includes(required),"Missing guarded reviewer wiring: "+required);
}
assert.equal(formation.includes('sourceReferencePanelHtml({'),true,"The original approved Formation Sources drawer remains the same owner");
console.log("PASS historical Mass evidence: 139 locators in 16 Guide moments; no source-text or publication promotion.");
