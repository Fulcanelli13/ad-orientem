import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const source=read("data/customs/source-registry.v1.json");
const audit=read("data/customs/research/customs-source-link-access-audit.20261023.v1.json");
const p0=read("data/customs/customs-p0-guidance-en-fr.v1.json");
const p1=read("data/customs/customs-p1-guidance-en-fr.v1.json");
const canonical=read("data/customs/customs-atlas-seed.v1.json");
const reviewed=new Set([...p0.entries,...p1.entries].flatMap(row=>row.source_ids||[]));
const proposedIds=new Set(["LASYPANSTWOWE-PENTECOST-GREENERY","LASYPANSTWOWE-BIRCH-GREENERY"]);
const pilot=source.sources.filter(row=>proposedIds.has(row.id));
assert.equal(pilot.length,2,"PENT-001 has exactly two new institutional sources");
assert.ok(pilot.every(row=>row.url?.startsWith("https://www.lasy.gov.pl/")));
const expected=source.sources.filter(row=>row.url?.startsWith("https://")&&!reviewed.has(row.id)&&!proposedIds.has(row.id));
const allowed=new Set(["PAGE_RETRIEVED","FETCH_INCONCLUSIVE","PDF_TEXT_RETRIEVED_VISUAL_LIMIT","REDIRECTED_404","PAGE_PARSED_EMPTY"]);
assert.equal(canonical.customs.length,39,"original canonical IDs retained; PENT-001 independently added");
assert.equal(source.sources.length,110);
assert.equal(reviewed.size,12);
assert.equal(expected.length,91);
assert.equal(audit.authority,"NON_PUBLISHING_SOURCE_AUDIT_DOES_NOT_OVERRIDE_MAIN");
assert.equal(audit.counts.canonical_approvals_added,0);
assert.equal(audit.records.length,91);
assert.ok(pilot.every(row=>!audit.records.some(a=>a.source_id===row.id)),"Never rewrite the Oct 23 source-access review with proposed additions");
assert.equal(new Set(audit.records.map(row=>row.source_id)).size,91);
const byId=new Map(source.sources.map(row=>[row.id,row]));
for(const record of audit.records){
  assert.ok(allowed.has(record.access_status),record.source_id+" invalid status");
  assert.equal(record.url,byId.get(record.source_id)?.url,"Registry URL changed for "+record.source_id);
  assert.equal(record.claim_review,"NOT_FINAL_CERTIFIED","No implicit historical sign-off");
  assert.equal(record.owner_review_status,"NO_CANONICAL_ID_CHANGE");
}
assert.deepEqual(
  audit.records.map(row=>row.source_id).sort(),
  expected.map(row=>row.id).sort(),
  "Every unreviewed HTTPS source exactly once; exclude priority P0/P1 links");
const counts=Object.fromEntries([...allowed].map(status=>[status,audit.records.filter(r=>r.access_status===status).length]));
for(const [status,num] of Object.entries(audit.counts.access_statuses))assert.equal(counts[status],num,status);
assert.equal(audit.records.filter(row=>row.access_status==="REDIRECTED_404").map(row=>row.source_id).join(","),"MAASTRICHT-STERRE-DER-ZEE-CUSTOM");
assert.equal(audit.records.filter(row=>row.access_status==="FETCH_INCONCLUSIVE").length,8);
assert.equal(audit.records.find(row=>row.source_id==="LAGHET-EXVOTO").recheck.status,"DIRECT_FULL_PAGE_RETRIEVED");
assert.equal(audit.records.find(row=>row.source_id==="STRASBOURG-SAINT-NICOLAS-2022").recheck.status,"OFFICIAL_INDEXED_TEXT_ONLY_ORIGIN_HTTP_502");
console.log("PASS: Customs source link audit, 91/91 exact HTTPS records, 12 priority excluded, no publication promotion");
