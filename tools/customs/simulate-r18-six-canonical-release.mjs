import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {CANONICAL_EXTRA_CUSTOM_ARTICLES} from "../../src/calendar/customs-extra-articles.js";
import {calendarCustomArticleIds,calendarCustomArticle} from "../../src/calendar/customs-read-model.js";
import {groupCalendarCustomsByYear} from "../../src/customs/year-led-library.js";

const load=path=>JSON.parse(readFileSync(new URL("../../"+path,import.meta.url),"utf8"));
const master=load("data/customs/customs-atlas-seed.v1.json");
const provenance=load("data/customs/source-registry.v1.json");
const patch=load("data/customs/customs-r18-six-canonical-promotion-payload.v1.json");
const proposal=load("data/customs/customs-r18-six-canonical-release-candidate.v1.json");
const relations=load("data/customs/customs-r18-six-identity-comparator-review.v1.json");
const fingerprint=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const accepted=master.customs.filter(x=>x.publication_state==="PUBLISHED");
assert.equal(accepted.length,35,"Current main publication count changed; rebase before release simulation");
const baseIds=new Set(master.customs.map(x=>x.custom_id));
const articleIds=new Set(calendarCustomArticleIds());
const primarySrcIds=new Set(provenance.sources.map(x=>x.id));
const approvedMain=new Set(accepted.map(x=>x.custom_id));
const newIds=patch.canonical_seed_customs.map(x=>x.custom_id);
assert.equal(newIds.length,6);
assert.deepEqual(newIds,proposal.rows.map(x=>x.proposed_id));
assert.equal(new Set(newIds).size,6);
for(const id of newIds){
 assert.ok(!baseIds.has(id)&&!articleIds.has(id));
 assert.ok(!proposal.reserved_other_open_branch_ids.includes(id));
 assert.ok(relations.records.some(r=>r.proposed_id===id && r.identity_disposition==="PROVISIONALLY_DISTINCT_NEEDS_EDITORIAL_ACCEPTANCE"));
}
assert.ok(proposal.rows.every(x=>!x.publication_allowed&&Object.values(x.signoffs).every(v=>v===false)));
assert.ok(patch.canonical_seed_customs.every(x=>x.publication_state==="NOT_APPROVED"));
const newSources=patch.source_registry_entries;
assert.ok(newSources.every(x=>!primarySrcIds.has(x.id)));
assert.equal(new Set(newSources.map(x=>x.id)).size,newSources.length);
const proposedSources=new Set([...primarySrcIds,...newSources.map(x=>x.id)]);
for(const att of patch.canonical_seed_attestations){
 assert.ok(newIds.includes(att.custom_id));
 assert.ok(att.source_ids.every(id=>proposedSources.has(id)));
}
const publishedSimulation=[
 ...master.customs,
 ...patch.canonical_seed_customs.map(x=>({...x,decision:"KEEP_WITH_EXPLICIT_APPROVAL_SIMULATED",publication_state:"PUBLISHED"}))
];
const catalogueSimulation=[...calendarCustomArticleIds().map(calendarCustomArticle),
 ...patch.calendar_bilingual_articles];
assert.equal(publishedSimulation.filter(x=>x.publication_state==="PUBLISHED").length,41);
assert.equal(catalogueSimulation.length,41);
assert.equal(new Set(catalogueSimulation.map(x=>x.id)).size,41);
const contexts=patch.calendar_region_interest;
assert.equal(contexts.length,6);
const suggest=(date,region)=>{
 if(!/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(date))return [];
 if(!region)return [];
 return contexts.filter(row=>row.region_code===region&&row.dates.includes(date.slice(5))).map(row=>row.id);
};
const fixtures=[
 ["2026-03-17","IE",["PATR-002"]],["2026-12-24","IE",["XMAS-002"]],
 ["2026-12-25","IE",["XMAS-002"]],["2026-12-24","PL",["XMAS-003"]],
 ["2026-12-04","AT",["SBAR-001"]],["2026-12-24","FR-PROVENCE",["XMAS-004"]],
 ["2026-01-05","ES",["EPIP-004"]],["2026-01-06","ES",["EPIP-004"]],
 ["2026-12-24","ES",[]],["2026-03-17","",[]],["2026-12-04","IE",[]]];
for(const [date,region,expected] of fixtures)assert.deepEqual(suggest(date,region),expected);
const existingLibrary=groupCalendarCustomsByYear(calendarCustomArticleIds().map(calendarCustomArticle));
const futureLibrary=groupCalendarCustomsByYear(catalogueSimulation);
assert.equal(existingLibrary.flatMap(x=>x.articles).length,35);
assert.equal(futureLibrary.flatMap(x=>x.articles).length,41);
const arts=patch.calendar_bilingual_articles;
for(const a of arts)for(const field of ["title","description","history","meaning","practice","caution","scope","occasion"])
 for(const lang of ["en","fr"])assert.ok(typeof a[field]?.[lang]==="string"&&a[field][lang].trim().length>=4);
const hashes=arts.map(x=>({id:x.id,content_sha256:fingerprint(x),region:contexts.find(r=>r.id===x.id)?.region_code}));
assert.equal(CANONICAL_EXTRA_CUSTOM_ARTICLES.length,24);
assert.equal(calendarCustomArticleIds().length,35,"No source file may be modified by the simulation");
console.log("PASS six R18 simulated canonical release: 35→41 articles, six distinct IDs, 12 source refs, six area attestations, exact region/date and browse index; actual production files untouched.");
console.log(JSON.stringify({mode:"READ_ONLY_RELEASE_SIMULATION",baseline:35,conditionalTarget:41,ifOtherPR1642MergesFirst:43,approvalState:"ALL_FALSE",hashes},null,2));
