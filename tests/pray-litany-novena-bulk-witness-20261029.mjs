import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NOVENA_CORPUS_V4,NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {BATCH03_LITANY_EDITION_POLICY,BATCH03_LITANY_SOURCE_STATUS} from "../src/pray/litany-1962-use-policy.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const scan=read("../data/pray/prayer-litany-novena-source-sweep-20261029.v1.json");
const preexisting=read("../data/pray/novena-source-review.v3.json");
assert.equal(scan.schema,"ao.pray.litany-novena-witness-sweep.v1");
assert.equal(scan.noNewTextImport,true);
assert.equal(scan.scope,"ONE_BULK_SOURCE_STRUCTURE_PASS_NOT_VERBATIM_PRINT_CERTIFICATION");
const sorted=arr=>[...arr].sort();
assert.equal(scan.summary.novenaPrograms,16);
assert.equal(scan.novenas.length,16);
assert.deepEqual(sorted(scan.novenas.map(x=>x.id)),sorted(NOVENA_CORPUS_V4_IDS));
assert.deepEqual(sorted(scan.novenas.map(x=>x.id)),sorted(preexisting.records.map(x=>x.id)));
assert.equal(scan.summary.originalPrintFullCertifications,0);
assert.equal(scan.summary.originalTextPublishedByThisPass,0);
assert.equal(scan.summary.currentIndulgenceGrantVerifications,0);
for(const r of scan.novenas){
 const earlier=preexisting.records.find(x=>x.id===r.id);
 assert.equal(r.sourceUrl,earlier.url,r.id+" source witness drift");
 assert.equal(r.publishedForm,earlier.form,r.id+" novena form drift");
 assert.ok(r.sourceAnchor.length>8,r.id+" missing source-heading anchor");
 assert.ok(r.sourceRelationship.length>10,r.id+" missing evidence relation");
 assert.ok(r.flags.length>=1,r.id+" missing scrutiny flags");
 assert.equal(r.originalPrintLineByLine,"PENDING",r.id+" print certificate invented");
 assert.equal(r.currentIndulgenceGrant,"NOT_VERIFIED",r.id+" current indulgence invented");
 assert.ok(r.independentFrenchEdition.startsWith("PENDING"),r.id+" original French edition invented");
 assert.ok(NOVENA_CORPUS_V4[r.id],r.id+" must remain existing owner");
}
const callan=scan.novenas.filter(x=>["holy_ghost","christmas"].includes(x.id));
assert.equal(callan.length,2);
assert.equal(callan[0].sourceUrl,callan[1].sourceUrl,"Callan shared URL is intentional");
assert.notEqual(callan[0].sourceAnchor,callan[1].sourceAnchor,"Pentecost and Christmas must have distinct source sections");
const perpetual=scan.novenas.find(x=>x.id==="perpetual_help");
assert.ok(perpetual.flags.includes("WIKISOURCE_PAGE_UNPROOFREAD"));
const king=scan.novenas.find(x=>x.id==="christ_the_king");
assert.equal(king.accessObservation,"PDF_TOO_LARGE_FOR_WEB_RETRIEVAL");
const anthony=scan.novenas.find(x=>x.id==="st_anthony_nine_tuesdays");
assert.ok(anthony.flags.includes("HOSTING_PAGE_UNSUPPORTED_CURRENT_INDULGENCE_INFERENCE"));
const warning=NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.how;
assert.match(warning.en,/do not certify any current grant or its conditions/i);
assert.match(warning.fr,/ne certifient une concession en vigueur ni ses conditions/i);

const lit=scan.publicLitany;
assert.equal(lit.sourceUrl,BATCH03_LITANY_SOURCE_STATUS.source);
assert.equal(lit.lesserRogationsUrl,BATCH03_LITANY_EDITION_POLICY.major.additionalSourceUrl);
assert.equal(lit.publicationStatus,BATCH03_LITANY_EDITION_POLICY.major.reader);
assert.equal(BATCH03_LITANY_EDITION_POLICY.major.liturgical1962Certified,false);
assert.match(lit.nonDoublingRule,/quae tamen non duplicantur/);
assert.equal(scan.summary.publicLitanySegments,8);
assert.equal(lit.segments.length,8);
assert.equal(lit.segments[0].lineStart,94);
assert.equal(lit.segments.at(-1).lineEnd,289);
for(let i=0;i<lit.segments.length;i++){
 const s=lit.segments[i];
 assert.ok(s.id&&s.anchor&&s.purpose);
 assert.ok(s.lineEnd>=s.lineStart);
 if(i>0)assert.equal(s.lineStart,lit.segments[i-1].lineEnd+1,"Litany source segment gap/overlap");
}
assert.equal(lit.original1962PrintFacsimile,"PENDING");
assert.equal(lit.frenchEditionLegalReview,"PENDING");
assert.equal(BATCH03_LITANY_SOURCE_STATUS.offlineComplete1962,"BLOCKED_UNTIL_ENTIRE_EDITION_VERIFIED");
console.log("PASS Bulk Prayer witness sweep: 8 public Litany segments and all 16 novena witnesses anchored; 1962 print, French and current indulgences remain unverified; St Anthony historical-indulgence disclosure bound to live reader.");
