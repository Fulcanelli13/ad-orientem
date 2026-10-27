import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildGradualeIdentityAudit,loadCanonicalGradualeCorpus,
  normalizedGregorianIncipit,GR1961_IDENTITY_AUDIT_SCHEMA}
 from "../tools/mass/audit-gr1961-identity-risk.mjs";

const stored=readFileSync(new URL("../data/mass/chant-corpus/gr1961-identity-audit-v1.json",import.meta.url),"utf8");
const indexReport=JSON.parse(stored),{index,records}=loadCanonicalGradualeCorpus();
const independent=buildGradualeIdentityAudit(index,records);
assert.equal(stored,JSON.stringify(independent,null,2)+"\n","Audit must reproduce from all 6 SHA-256 checked source batches");
assert.equal(independent.schema,GR1961_IDENTITY_AUDIT_SCHEMA);
assert.equal(independent.sourceFileBlobSha,"c43cc2d08488eef0f128933fe10b6bb292fa4f3b");
assert.deepEqual(independent.summary,{
  audited:1195,distinctScopedIncipits:1192,samePartDistinctGabcGroups:3,
  crossOfficePartIncipitGroups:101,crossOfficePartRecords:213,
  exactGabcDuplicateGroups:1,nonNumericPageTokens:440,promotedToReader:0,
});
assert.equal(normalizedGregorianIncipit("Dum venerit Paraclitus (2)"),
  normalizedGregorianIncipit("Dum vénerit Paraclitus"));
assert.deepEqual(independent.samePartDistinctGabc.map(x=>x.items.map(y=>y.id)).sort((a,b)=>a[0].localeCompare(b[0])),
 [["GREGOBASE-200","GREGOBASE-4653"],["GREGOBASE-39","GREGOBASE-17793"],["GREGOBASE-827","GREGOBASE-8201"]].sort((a,b)=>a[0].localeCompare(b[0])));
assert.deepEqual(independent.exactGabcGroups.map(x=>x.items.map(y=>y.id)),
 [["GREGOBASE-861","GREGOBASE-1644"]]);
assert.ok(independent.crossOfficePart.every(x=>x.officeParts.length>=2&&
  x.decision==="NEVER_MATCH_BY_INCIPIT_WITHOUT_CHANT_ROLE"));
assert.ok(independent.samePartDistinctGabc.every(x=>
  x.decision==="KEEP_VARIANTS_SEPARATE_PENDING_PRINT_REVIEW"));
assert.equal(indexReport.status,"SECONDARY_IDENTITY_AUDIT_NOT_EDITORIAL_APPROVAL");
assert.throws(()=>buildGradualeIdentityAudit({...index,sourceEditionId:1974},records),
  /Authoritative 1961/);
assert.throws(()=>buildGradualeIdentityAudit(index,records.slice(1)),
  /Archive count mismatch/);
assert.throws(()=>buildGradualeIdentityAudit(index,[records[0],records[0],...records.slice(2)]),
  /Duplicate source ID/);
assert.throws(()=>buildGradualeIdentityAudit(index,[{...records[0],gabc:"corrupted"},...records.slice(1)]),
  /Unverified research record/);
console.log("PASS GR1961 1,195-GABC identity audit: 101 cross-role incipits, 3 same-role variants, full checksum");
