import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const seed=load("data/customs/customs-atlas-seed.v1.json");
const sources=load("data/customs/source-registry.v1.json");
const candidate=load("data/customs/customs-r18-six-canonical-release-candidate.v1.json");
const {rows}=candidate;
const ids=new Set(seed.customs.map(x=>x.custom_id));
const src=new Set(sources.sources.map(x=>x.id));
assert.equal(seed.customs.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(candidate.main_current,35);
assert.equal(candidate.if_approved_total,41);
assert.equal(candidate.release_record_status,"BLOCKED_PENDING_AUTHORISATIONS");
assert.equal(candidate.policy.exact_region_only,true);
assert.equal(candidate.policy.existing_calendar_only,true);
assert.deepEqual(candidate.reserved_other_open_branch_ids,["EPIP-003","CRIB-001"]);
assert.equal(rows.length,6);
assert.equal(new Set(rows.map(x=>x.proposed_id)).size,6);
assert.equal(new Set(rows.map(x=>x.working_master_id)).size,6);
const expected=[
["PATR-002","CANDIDATE-STPATRICK-RIBBON","IE",["03-17"]],
["XMAS-002","CANDIDATE-IRISH-CHRISTMAS-CANDLE","IE",["12-24","12-25"]],
["XMAS-003","CUST-XMAS-POLISH-HAY","PL",["12-24"]],
["SBAR-001","CUST-BARBARA-BRANCHES","AT",["12-04"]],
["XMAS-004","CUST-XMAS-PROVENCAL-PAIN-CALENDAL","FR-PROVENCE",["12-24"]],
["EPIP-004","CUST-EPIPHANY-SPANISH-MAGI-GIFTS","ES",["01-05","01-06"]]
];
for (let i=0;i<expected.length;i++){
 const r=rows[i], [id,owner,region,days]=expected[i];
 assert.deepEqual([r.proposed_id,r.working_master_id,r.region_interest], [id,owner,region]);
 assert.deepEqual(r.dates,days);
 assert.equal(ids.has(id),false,"Proposed ID collides with main canonical registry");
 assert.equal(src.has(r.sources[0].id),false,"Staged evidence source must be separately registered at promotion");
 assert.equal(r.publication_allowed,false);
 assert.equal(r.role,"HOUSEHOLD_OR_HISTORICAL_CULTURAL_NOT_MASS_RITE");
 assert.ok(r.sources.length>=1);
 assert.ok(r.sources.every(s=>s.id && s.title && /^https:\/\//.test(s.url)));
 assert.ok(r.sources.some(s=>s.url===r.source_review.principal_source));
 assert.ok(Object.values(r.signoffs).every(x=>x===false));
 for(const field of ["title","description","history","meaning","practice","caution","occasion","scope"]){
  for(const lang of ["en","fr"]){
    const v=r.article[field]?.[lang];
    assert.ok(typeof v==="string"&&v.trim().length>=4, id+" "+field+" "+lang);
  }
 }
 assert.match(r.article.caution.en,/not |no |without |neither|neither|voluntary|belie|future|supernatural|folklore|historical|no obligatory/i);
}
assert.equal(rows.some(r=>r.proposed_id==="EPIP-003"||r.proposed_id==="CRIB-001"),false);
console.log("PASS R18 canonical publication candidate: 6 collision-free proposed IDs; complete bilingual source copy; 35 live remain; all 8 gates per identity blocked");
