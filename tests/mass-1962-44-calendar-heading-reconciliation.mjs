import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/geography/research/",import.meta.url);
const read=n=>JSON.parse(readFileSync(new URL(n+".v1.json",root),"utf8"));
const d=read("mass-1962-44-cluster-calendar-heading-reconciliation-20261012");
const c=read("mass-1962-44-cluster-printed-page-context-20261012");
assert.equal(d.schema,"MASS_1962_44_CLUSTER_CALENDAR_HEADING_Triage_V1");
assert.equal(d.rows.length,44);
assert.deepEqual(new Set(d.rows.map(x=>x.sourcePath)),new Set(c.rows.map(x=>x.sourcePath)));
assert.equal(d.stats.total,44);
assert.equal(Object.values(d.stats.byClassification).reduce((a,b)=>a+b,0),44);
assert.equal(d.stats.byClassification.PAGE_HEADER_MONTH_DISCORDANCE_HOLD,7);
assert.equal(d.stats.byClassification.PRINTED_SAME_DATE_HEADING_CANDIDATE,17);
assert.equal(d.stats.byClassification.PRINTED_SAME_MONTH_OR_CONTINUATION,5);
assert.equal(d.stats.publicationApproved,0);
const holds=new Set(d.rows.filter(x=>x.classification==="PAGE_HEADER_MONTH_DISCORDANCE_HOLD").map(x=>x.sourcePath));
for(const path of ["Sancti/01-20","Sancti/01-25","Sancti/01-31","Sancti/02-27","Sancti/03-24","Sancti/06-02","Sancti/08-16"]) assert.ok(holds.has(path),"Missing discordance "+path);
assert.equal(d.rows.find(x=>x.sourcePath==="Sancti/06-28").classification,"KNOWN_CALENDAR_ALIAS_JUL03_IRENAEUS");
assert.equal(d.rows.find(x=>x.sourcePath==="Sancti/09-09n").classification,"LOCAL_OR_SUPPLEMENT_FORMULARY_REVIEW");
assert.equal(d.rows.find(x=>x.sourcePath==="Sancti/07-13pl").classification,"LOCAL_OR_SUPPLEMENT_FORMULARY_REVIEW");
assert.ok(d.rows.every(x=>!x.textualBibleCertification&&!x.wholeMissalEditionCertified&&!x.publicationApproved));
for(const row of d.rows){
 const source=c.rows.find(x=>x.sourcePath===row.sourcePath);
 assert.equal(row.pageEvidence.length,source.clusters.reduce((n,x)=>n+x.pageDetails.length,0));
 assert.ok(row.pageEvidence.every(p=>p.pdfPage>=1 && p.pdfPage<=1088 && !p.pageHeaderVisuallyChecked));
 assert.ok(row.status==="OCR_PAGE_HEADING_TRIAGE_ONLY");
}
console.log("PASS: 44 printed-Missal heading triages, 7 explicit cross-month holds, July Irenaeus alias, no invented 1962 certifications.");
