import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 validateMassFirst10ContextAudit,massFirst10ContextForLocus,
 massFirst10ContextSummary,massFirst10ContextStatusHtml
} from "../src/learn/mass-source-first10-review.js";
import {massSourceBatchReviewHtml,validateMassSourceLocusBatches} from "../src/learn/mass-source-batch-review.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const audit=load("../data/learn/research/mass-source-first10-transcription-context-audit-20261016.v1.json");
const batch=load("../data/learn/research/mass-source-first69-locus-batches-20261016.v1.json");
const catalog=load("../data/learn/research/mass-moment-author-evidence-review-20261016.v1.json");
validateMassSourceLocusBatches(batch,catalog);
assert.equal(validateMassFirst10ContextAudit(audit,batch),audit);
assert.equal(audit.rows.length,10);
assert.equal(audit.researchClaimCount,18);
assert.equal(audit.latinCriticalTextContextsLocated,2);
assert.equal(audit.originalEnglishEditionOcrContextsLocated,7);
assert.equal(audit.partialOcrContextsLocated,1);
assert.equal(audit.independentPrintedPageImageChecks,0);
assert.equal(audit.certifiedSourcePassages,0);
assert.equal(audit.publicTextExcerpts,0);
assert.ok(audit.sourceTranslationNote.includes("SIXTH GERMAN EDITION"));
assert.deepEqual(new Set(audit.rows.map(r=>r.locusId)).size,10);
for(const row of audit.rows){
 assert.equal(row.printedPageImageInspected,false);
 assert.equal(row.originalEditionCertified,false);
 assert.equal(row.claimScopePublicationApproved,false);
 assert.equal(row.originalTextReproduced,false);
 assert.equal(row.translationApproved,false);
 assert.equal(row.releaseApproved,false);
 assert.equal(row.claimIds.length,new Set(row.claimIds).size);
 assert.ok(massFirst10ContextForLocus(audit,row.locusId));
}
assert.equal(massFirst10ContextForLocus(audit,"AO.MASS.WORK.ALPHONSUS.L01"),null);
assert.equal(massFirst10ContextForLocus(audit,"AQUINAS_L300"),null);
for(const french of [false,true]){
 const html=massSourceBatchReviewHtml(batch,{french,contextAudit:audit});
 assert.ok(html.includes("10 / 37"));
 assert.ok(html.includes("0 / 37"));
 assert.equal((html.match(/data-ao-source-context-locus=/g)||[]).length,10);
 assert.equal((html.match(/data-ao-source-batch-locus=/g)||[]).length,37);
 assert.ok(html.includes(french?"Texte latin localisé":"Latin text located"));
 assert.ok(html.includes(french?"Contexte OCR partiel":"Partial OCR context"));
 assert.ok(html.includes(french?"Pages imprimées non vérifiées":"Printed page images unchecked"));
 assert.ok(!html.includes("SOURCE_PACK_PUBLICATION_APPROVAL"));
 assert.ok(!html.includes("quotedOriginalText"));
 const summary=massFirst10ContextSummary(audit,{french});
 assert.ok(summary.includes('progress value="10" max="37"'));
 const p=massFirst10ContextStatusHtml(audit,"AO.MASS.WORK.AQUINAS.L01",{french});
 assert.ok(p.includes("51178"));
 assert.equal(massFirst10ContextStatusHtml(audit,"AO.MASS.WORK.ALPHONSUS.L01",{french}),"");
}
const clone=()=>JSON.parse(JSON.stringify(audit));
{
 const bad=clone();bad.independentPrintedPageImageChecks=1;
 assert.throws(()=>validateMassFirst10ContextAudit(bad,batch),/PUBLICATION_GATE/);
}
{
 const bad=clone();bad.rows[0].releaseApproved=true;
 assert.throws(()=>validateMassFirst10ContextAudit(bad,batch),/RELEASE_GATES/);
}
{
 const bad=clone();bad.rows[0].claimIds=["VER-001"];
 assert.throws(()=>validateMassFirst10ContextAudit(bad,batch),/SOURCE_OWNER/);
}
{
 const bad=clone();bad.rows[0].witnessLevel="CERTIFIED_FOR_PUBLICATION";
 assert.throws(()=>validateMassFirst10ContextAudit(bad,batch),/WITNESS/);
}
const owner=readFileSync(new URL("../src/learn/mass-formation.js",import.meta.url),"utf8");
for(const requirement of ["massMomentEvidencePreviewEnabled(win)","loadMassFirst10ContextAudit({",
 "massFirst10ContextCss()","contextAudit:state.first10Audit"]){
 assert.ok(owner.includes(requirement),requirement);
}
console.log("PASS 10 source contexts: 2 Aquinas Latin + 7 Gihr OCR + 1 partial; 0 printed images certified, 0 publications.");
