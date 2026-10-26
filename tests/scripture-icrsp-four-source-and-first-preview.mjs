import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base=new URL("../data/scripture/correspondences/",import.meta.url);
const read=n=>JSON.parse(readFileSync(new URL(n,base),"utf8"));
const intake=read("icrsp-lent-atomic-editorial-review.v1.json");
const assessment=read("icrsp-four-source-assessment.v1.json");
const first=read("icrsp-naaman-source-first-demo.v1.json");
const html=readFileSync(new URL("../docs/research/prototypes/scripture-naaman-source-first-20261026.html",import.meta.url),"utf8");
const ids=new Set(intake.claims.map(c=>c.id));
const four=new Set(["ICRSP-B12-CLM-001","ICRSP-B12-CLM-002","ICRSP-B12-CLM-005","ICRSP-B12-CLM-006"]);
assert.equal(assessment.status,"source_text_assessed_not_human_approved");
assert.deepEqual(new Set(assessment.assessments.map(a=>a.id)),four);
assert.equal(assessment.sourceReview.assessedCandidateClaims,4);
assert.equal(assessment.sourceReview.humanTheologicalApprovals,0);
assert.equal(assessment.sourceReview.criticalPrintEditionCertifications,0);
assert.equal(assessment.sourceReview.publishedCompendiumEntries,0);
assert.equal(assessment.excludedClaims.length,3);
for(const a of assessment.assessments){
  assert.ok(ids.has(a.id),"assessment must have received canonical intake claim");
  assert.ok(a.basis.length>=1);
  assert.ok(a.basis.every(b=>typeof b.url==="string" && b.url.startsWith("https://")),"every claim's witness requires source URL");
  assert.ok(Array.isArray(a.needs)&&a.needs.length>0,"gate must be explicit");
  assert.ok(Array.isArray(a.notProven)&&a.notProven.length>0,"unsupported leap must be explicit");
}
assert.ok(assessment.assessments.find(a=>a.id==="ICRSP-B12-CLM-001").verifiedStatement.includes("not a New Testament declaration"));
const ambrose=assessment.assessments.find(a=>a.id==="ICRSP-B12-CLM-002");
assert.ok(ambrose.basis.some(b=>b.locus==="IV.21"),"direct Ambrose Trinitarian-Baptism formulation must be locus IV.21");
assert.ok(ambrose.basis.some(b=>b.locus==="III.16–17"),"keep Naaman story and grace in III.16–17");
assert.ok(ambrose.verifiedStatement.includes("not a statement Jesus makes"));
const elisha=assessment.assessments.find(a=>a.id==="ICRSP-B12-CLM-005");
assert.ok(elisha.notProven.some(s=>s.includes("Aphrahat explicitly cites Luke")));
const elijah=assessment.assessments.find(a=>a.id==="ICRSP-B12-CLM-006");
assert.ok(elijah.notProven.some(s=>s.includes("precise fulfilment")||s.includes("dogmatically binding")||s.includes("verse-numbered")));
assert.ok(Object.values(assessment.release).every(v=>v===false));

assert.equal(first.status,"research_only_source_display_example_not_publishable");
assert.deepEqual(new Set(first.sourceClaimIds),new Set(["ICRSP-B12-CLM-001","ICRSP-B12-CLM-002"]));
assert.equal(first.physicalMassDay,"Tempora/Quad3-1");
assert.equal(first.scripture.left.bookId,"2Kings");
assert.equal(first.scripture.right.bookId,"Luke");
assert.equal(first.scripture.right.canonicalAddress,"LUK.4.27");
assert.equal(first.scripture.directBiblicalReferenceType,"new_testament_identifies_old_testament_person");
assert.equal(first.patristic.originalPassages.length,2);
assert.deepEqual(first.patristic.originalPassages.map(x=>x.locus),["III.17","IV.21"]);
assert.ok(first.patristic.originalPassages[1].text.includes("baptizatus es in nomine Trinitatis"));
assert.ok(first.viewerPolicy.ancientWriterWordsPreferredToGeneratedSummaries);
assert.equal(first.otherWitness.original1903PageInspected,false);
assert.equal(first.otherWitness.permissionToCopyIcrspWebsiteText,false);
assert.ok(Object.values(first.editorialGates).filter(v=>v===true).length===2);
assert.equal(first.editorialGates.appPublished,false);
assert.equal(first.viewerPolicy.interactiveSourceNavigation,false);
assert.equal(first.scriptureSideBySide,undefined); // real field is under viewerPolicy
assert.equal(first.viewerPolicy.scriptureSideBySide,true);

for(const e of [first.scripture.left,first.scripture.right]){
  assert.ok(e.textExcerpt.length>15);
  assert.match(e.fullText,/^https:\/\//);
  assert.ok(html.includes(e.textExcerpt),"side-by-side prototype reproduces fixture's text");
}
for(const x of first.patristic.originalPassages){
  assert.ok(html.includes(x.text),"only original Latin from the same fixture may be shown");
}
assert.ok(html.includes("RESEARCH PREVIEW — NOT RELEASED"));
assert.ok(html.includes("No AI-composed speech"));
assert.ok(html.includes("Original Latin")||html.includes("original Latin"));
assert.ok(html.includes("IV.21"));
assert.ok(html.includes("Jesus recalls") && html.includes("not a statement about Baptism"));
assert.ok(!html.includes('©2010 T. C. Schmidt') && !html.includes("Ask St Ambrose"));
assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
assert.ok(!html.includes("<script"),"research-only page must not expose active app or stateful API hooks");
console.log("ICRSP four-candidate review and Naaman source-first research preview: provenance, Scripture pairing and zero-publication gates PASS.");
