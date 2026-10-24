import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS,calendarCustomRecommendations} from "../src/calendar/customs-read-model.js";
import {calendarCustomSearchIndex,calendarCustomSearchMatches} from "../src/calendar/customs-search.js";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";

const base="data/customs/master/";
const load=name=>JSON.parse(readFileSync(base+name,"utf8"));
const packet=load("customs-calendar-five-final-copy-release-candidates.v1.json");
const gate=load("customs-consolidation-first-calendar-release-gate-board.v1.json");
const cohort1=load("customs-unified-identity-consolidation-cohort01-150.v1.json");
const cohort2=load("customs-unified-identity-consolidation-cohort02-211.v1.json");
const seed=JSON.parse(readFileSync("data/customs/customs-atlas-seed.v1.json","utf8"));
const canonical=new Set(seed.customs.map(x=>x.custom_id));
const groupIds=new Set([...cohort1.records,...cohort2.records].map(x=>x.provisional_group_id));
const fields=packet.contract.required_article_fields;
assert.equal(packet.schema,"AO_CUSTOMS_EXISTING_CALENDAR_FIVE_ARTICLE_RELEASE_CANDIDATES_V1");
assert.equal(packet.summary.articles,5);
assert.equal(packet.records.length,5);
assert.equal(packet.policy.canonical_publication,"BLOCKED");
assert.equal(packet.policy.calendar_runtime_modified,false);
assert.equal(packet.policy.human_editorial_approval,"PENDING");
assert.equal(packet.summary.approved_publications,0);
assert.equal(packet.summary.proposed_new_canonical_ids,0);
assert.deepEqual(new Set(fields),new Set(["title","description","history","meaning","practice","caution","occasion","scope","sources"]));
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,35);
assert.equal(canonical.size,38);
assert.equal(seed.customs.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(gate.summary.source_bounded_editorial_review_subjects,5);
const priorIds=new Set(CALENDAR_CUSTOM_ARTICLE_IDS);
const reviewed=new Set(),members=new Set(),articleIds=new Set();
const proposedDateContexts=[];
for(const rec of packet.records){
 assert.ok(!reviewed.has(rec.release_unit),"Duplicate release unit");
 reviewed.add(rec.release_unit);
 assert.ok(/^RESEARCH-/.test(rec.research_article_id),"Research ID must not pose as allocated canonical ID");
 assert.ok(!canonical.has(rec.research_article_id)&&!priorIds.has(rec.research_article_id));
 assert.ok(!articleIds.has(rec.research_article_id));articleIds.add(rec.research_article_id);
 assert.equal(calendarCustomArticle(rec.research_article_id),null);
 assert.equal(rec.publication_state,"UNAPPROVED_EDITORIAL_RELEASE_CANDIDATE");
 assert.equal(rec.article.editorialCopyStatus,"PREPUBLICATION_CANDIDATE_NOT_ACCEPTED");
 assert.ok(Object.values(rec.approvals).every(value=>value===false));
 assert.ok(rec.editorial_gates.length>=3);
 const old=gate.records.find(x=>x.release_unit===rec.release_unit);
 assert.ok(old&&old.readiness==="SOURCE_BOUNDED_EDITORIAL_REVIEW");
 assert.deepEqual(new Set(rec.source_group_ids),new Set(old.draft_source_groups));
 for(const id of rec.source_group_ids){assert.ok(groupIds.has(id));assert.ok(!members.has(id),"Source group in more than one article");members.add(id)}
 for(const field of fields){
  if(field==="sources")continue;
  assert.ok(rec.article[field]?.en?.length>25,rec.research_article_id+" "+field+" EN missing");
  assert.ok(rec.article[field]?.fr?.length>25,rec.research_article_id+" "+field+" FR missing");
 }
 assert.ok(rec.article.sources.length>=2);
 const sourceIds=new Set();
 for(const s of rec.article.sources){
  assert.ok(s.id&&s.title&&/^https:\/\//.test(s.url)&&s.claim_scope&&s.role);
  assert.ok(!sourceIds.has(s.id));sourceIds.add(s.id);
 }
 const previewShape={id:rec.research_article_id,...rec.article};
 const searchIndex=calendarCustomSearchIndex(previewShape);
 assert.ok(calendarCustomSearchMatches(searchIndex,rec.article.title.en));
 assert.ok(calendarCustomSearchMatches(searchIndex,rec.article.title.fr));
 assert.ok(rec.calendar_associations.length>=1);
 for(const link of rec.calendar_associations){
  assert.equal(link.resolver,"EXISTING_1962_CALENDAR");
  assert.match(link.region_visibility,/CONTEXT|REGION|AUSTRIA|POLAND|SEVILLE|HOUSEHOLD/);
  assert.ok(["FIXED_FEAST_CONTEXT","MOVABLE_FEAST_CONTEXT"].includes(link.kind));
  if(link.kind==="FIXED_FEAST_CONTEXT") assert.match(link.month_day,/^\d{2}-\d{2}$/);
  if(link.kind==="MOVABLE_FEAST_CONTEXT") assert.ok(["v384Dates(year).holySaturday","v384Dates(year).corpus"].includes(link.calendar_accessor));
 }
 assert.ok(rec.action_components.every(x=>x.id&&x.owner&&x.description));
}
assert.equal(articleIds.size,5);
assert.equal(reviewed.size,5);
assert.equal(members.size,8);
const byUnit=Object.fromEntries(packet.records.map(x=>[x.release_unit,x]));
const epiphany=byUnit["CU-REVIEW-001"];
assert.equal(epiphany.action_components.length,2);
assert.ok(epiphany.action_components.some(x=>x.owner==="ROMAN_RITUAL_AUTHORIZED_MINISTER"));
assert.ok(epiphany.action_components.some(x=>x.owner==="HOUSEHOLD_POPULAR_PIETY"));
assert.ok(epiphany.prayer_links.some(x=>x.requires_authorized_priest===true));
const seville=byUnit["CU-REVIEW-003"];
assert.equal(seville.calendar_associations.length,2);
assert.ok(seville.calendar_associations.every(x=>x.region_visibility==="SEVILLE_CATHEDRAL_ONLY"));
assert.deepEqual(new Set(seville.source_group_ids),new Set(["CAT-WEISER-B-083","CAT-WEISER-B-109"]));
const wreath=byUnit["CU-REVIEW-005"];
assert.equal(wreath.action_components.length,2);
assert.equal(wreath.related_local_following_days.automatic_1962_OCTAVE_EVENT,false);
assert.equal(wreath.related_local_following_days.local_day_offset_policy,"NO_SYNTHETIC_DATE_TRIGGER_WITHOUT_EXPLICIT_COMMUNITY_EVIDENCE");
const easter=byUnit["CU-REVIEW-002"];
assert.ok(easter.article.caution.en.includes("permission"));
const candlemas=byUnit["CU-REVIEW-004"];
assert.ok(candlemas.article.caution.en.includes("1962"));
const triggered=(rec,date)=>rec.calendar_associations.some(x=>x.kind==="FIXED_FEAST_CONTEXT"?date.slice(5)===x.month_day:date===v384Dates(Number(date.slice(0,4)))[x.calendar_accessor.split(".")[1]]);
for(const year of [2026,2027,2030]){
 const d=v384Dates(year);
 const dates=[
  [year+"-01-06",epiphany],[d.holySaturday,easter],
  [d.corpus,seville],[year+"-12-08",seville],
  [year+"-02-02",candlemas],[d.corpus,wreath]];
 for(const [date,rec] of dates){
   assert.ok(triggered(rec,date),"Candidate date association lost: "+rec.release_unit+" "+date);
   assert.ok(!calendarCustomRecommendations(date).some(x=>x.id===rec.research_article_id),"Unapproved release leaked into runtime");
 }
 assert.ok(!triggered(wreath,d.holySaturday));
}
assert.deepEqual(new Set(packet.records.map(x=>x.release_unit)),new Set(gate.records.filter(x=>x.readiness==="SOURCE_BOUNDED_EDITORIAL_REVIEW").map(x=>x.release_unit)));
console.log("PASS Customs Calendar five-candidate release: complete EN/FR articles, 8 group links, 6 feast hooks, 35 published unchanged, no rites/dates leaked.");
