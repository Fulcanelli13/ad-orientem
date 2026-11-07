import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const a=read("data/geography/research/sacred-atlas-169-consolidated-admission-board-20261107.v1.json"),source=read("data/geography/research/"+ "sacred-atlas-169-owner-review-intake-20261106.v1.json");
const by=new Map(source.candidates.map(x=>[x.candidate_id,x]));
assert.equal(a.status,"RESEARCH_OWNER_REVIEW_PACKET_NOT_APPROVED");
assert.deepEqual(a.counts,{total:169,A_OWNER_REVIEW_ILLUSTRATIVE:98,B_OWNER_REVIEW_WITH_SCOPE_NOTE:53,C_REPAIR_EVIDENCE_OR_TITLE:12,D_PHYSICAL_IDENTITY_HOLD:4,E_EXISTING_DRAFT_SIGNOFF:2,presentable_to_owner:151,pre_decision_holds_or_repairs:16,existing_draft_requiring_signoff:2,approved:0,import_ready:0,published:0});
assert.equal(a.records.length,169);
assert.equal(new Set(a.records.map(x=>x.candidate_id)).size,169);
for(const row of a.records){const v=by.get(row.candidate_id);assert.ok(v);assert.equal(row.name,v.site_name);assert.equal(row.country_code,v.country_code);assert.equal(row.point.lat,v.staged_point.latitude);assert.equal(row.point.lng,v.staged_point.longitude);assert.equal(row.point.scope,v.staged_point.precision_suggestion);assert.equal(row.point.owner_accepted,false);assert.equal(row.point.independently_certified_entrance,false);assert.equal(row.owner_decision,"PENDING");assert.equal(row.identity_final,false);assert.equal(row.import_ready,false);assert.equal(row.publication_authorized,false);assert.equal(row.owner_review_presentable,/^[AB]_/.test(row.lane));assert.equal(row.already_draft_place_id,v.draft_b21_place_id);assert.ok(row.best_evidence_url?.startsWith("https://"));assert.equal(row.lane.startsWith("E_"),v.already_in_draft_unapproved);}
for(const id of ["SG-INV-0343","SG-INV-0465","SG-INV-0517","SG-INV-0616"])assert.equal(a.records.find(x=>x.candidate_id===id).lane,"C_REPAIR_EVIDENCE_OR_TITLE");
for(const id of ["SG-INV-0717","SG-INV-0704","SG-INV-0731","SG-INV-0396"])assert.equal(a.records.find(x=>x.candidate_id===id).lane,"D_PHYSICAL_IDENTITY_HOLD");
for(const id of ["SG-INV-0415","SG-INV-0722"])assert.equal(a.records.find(x=>x.candidate_id===id).lane,"E_EXISTING_DRAFT_SIGNOFF");
for(const id of ["SG-INV-0021","SG-INV-0558","SG-INV-0564","SG-INV-0554","SG-INV-0664"])assert.equal(a.records.find(x=>x.candidate_id===id).lane,"B_OWNER_REVIEW_WITH_SCOPE_NOTE");
assert.equal(a.records.filter(x=>x.owner_review_presentable).length,151);
assert.equal(a.rules.never_auto_import,true);
assert.equal(a.rules.no_new_canonical_place_ids,true);
console.log("PASS 169 owner review lanes 98/53/12/4/2; all remain unapproved and not import-ready");
