import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const file = "data/directory/research/approved-mass-round17-source-identity-20261010.v1.json";
const audit = JSON.parse(readFileSync(file, "utf8"));
const discovery = JSON.parse(readFileSync("data/directory/research/approved-mass-worldwide-candidates-20261009.v1.json","utf8"));
const sspxPoland = JSON.parse(readFileSync("data/directory/generated/v19/sspx-oct26-poland.v1.json","utf8"));
const ids = new Set(discovery.records.map(x => x.source_id));

assert.equal(audit.schema,"AO_DIRECTORY_ROUND17_SOURCE_IDENTITY_AUDIT_V1");
assert.equal(audit.scope,"RESEARCH_ONLY_NOT_PUBLICATION");
assert.deepEqual([audit.baseline.discovery_records,audit.baseline.carry_forward_leads],[1474,233]);
assert.equal(audit.baseline.with_accepted_source_urls + audit.baseline.without_accepted_source_urls,233);
assert.equal(audit.baseline.inherited_legacy_match_hints,200);
assert.equal(audit.baseline.auto_merged,0);
assert.equal(audit.records.length,6);
assert.equal(new Set(audit.records.map(x=>x.lead_number)).size,6);
assert.equal(new Set(audit.records.map(x=>x.source_id)).size,6);
assert.ok(audit.records.every(x=>ids.has(x.source_id)),"A certified lead is absent from the approved discovery corpus");
assert.ok(audit.records.every(x=>x.source_url.startsWith("https://") && !x.source_url.includes("latinmassdir.org")));
assert.ok(audit.records.every(x=>x.production_venue_id===null && x.publication_state==="RESEARCH_ONLY_IDENTITY_PENDING"),
  "A source check was silently converted into a published venue");
assert.ok(audit.records.every(x=>x.legacy_match_hint && x.legacy_hint_disposition.startsWith("REJECT_")),
  "Unreviewed or rejected legacy hints cannot be canonical IDs");
assert.equal(audit.records.filter(x=>x.rite_evidence==="MISSAL_1962_EXPLICIT").length,3);
assert.equal(audit.records.filter(x=>x.rite_evidence==="TRIDENTINE_EXPLICIT").length,2);
assert.equal(audit.records.filter(x=>x.rite_evidence==="OLD_LATIN_FORM_BOOK_NOT_EXPLICIT").length,1);

const get = n => audit.records.find(x=>x.lead_number===n);
const nowy = get(39);
const old = sspxPoland.records.find(x=>x.u===nowy.legacy_match_hint);
assert.ok(old,"Same-city SSPX record must be present for explicit identity adjudication");
assert.match(old.n,/Kingi/u);
assert.match(old.a,/Zygmuntowska/u);
assert.match(nowy.address,/Kolegiacki/u);
assert.notEqual(old.a,nowy.address,"Different physical locations were collapsed");
assert.equal(nowy.schedule.seasonal_override,"LENT_SUNDAY_20:00");
assert.equal(get(43).schedule.standing,"NOT_CERTIFIED_BEYOND_DATED_CALENDAR");
assert.equal(get(86).schedule.standing.length,2);
assert.equal(get(178).schedule.effective_from,"2026-10-18");
assert.deepEqual(get(180).schedule.dated_overrides.map(x=>x.date),["2026-10-11","2026-10-18","2026-10-25"]);
assert.equal(get(180).schedule.dated_overrides[1].time,null,"A TBD occurrence gained an invented time");
assert.deepEqual(get(183).schedule.excluded_months,[7,8]);
assert.match(get(183).place,/lower church/);

console.log("Round 17 venue source certification: PASS — 6 adjudicated leads, rejected legacy merges, no runtime publication");
