import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";
import {addDaysIso} from "../src/calendar/liturgical-year.js";
import {CALENDAR_CUSTOM_ARTICLE_IDS,calendarCustomRecommendations} from "../src/calendar/customs-read-model.js";
import {COHORT2_RESEARCH_SHA,COHORT2_REVIEW_ROWS,COHORT2_REQUIRED_SCOPE,
 calendarCohort2ReviewForDate} from "../src/calendar/customs-cohort2-review.js";

const expectedUnits=["CU-REVIEW-002","CU-REVIEW-003","CU-REVIEW-005"];
const expectedScopes=["AT_LOCAL_CUSTOMS","SEVILLE_CATHEDRAL_ONLY","PL_LOCAL_CUSTOMS"];
const copyFields=["title","description","history","meaning","practice","caution","occasion","scope"];
const srcCode=readFileSync(new URL("../src/calendar/customs-read-model.js",import.meta.url),"utf8");
const runtimeCode=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
const seed=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const canonicalIds=new Set(seed.customs.map(x=>x.custom_id));
assert.match(COHORT2_RESEARCH_SHA,/^[a-f0-9]{40}$/);
assert.equal(COHORT2_REVIEW_ROWS.length,3);
assert.deepEqual(COHORT2_REVIEW_ROWS.map(x=>x.releaseUnit),expectedUnits);
assert.deepEqual(COHORT2_REVIEW_ROWS.map(x=>x.reviewScope),expectedScopes);
assert.deepEqual(COHORT2_REQUIRED_SCOPE,expectedScopes);
assert.ok(!srcCode.includes("customs-cohort2-review"),"Preview accidentally wired into production Calendar read model");
assert.ok(!runtimeCode.includes("customs-cohort2-review"),"Preview accidentally wired into Calendar runtime");
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,37,"Existing draft baseline must retain frozen 35 plus only its 2 independent candidates");
const independentDraftIds=new Set(["EPIP-003","CRIB-001"]);
for(const row of COHORT2_REVIEW_ROWS){
 assert.match(row.researchId,/^RESEARCH-/);
 assert.equal(row.releaseStatus,"RESEARCH_ONLY_NOT_PUBLISHED");
 assert.equal(canonicalIds.has(row.researchId),false);
 assert.equal(independentDraftIds.has(row.researchId),false);
 assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.includes(row.researchId),false);
 assert.equal(row.article.editorialCopyStatus,"PREPUBLICATION_CANDIDATE_NOT_ACCEPTED");
 assert.ok(Object.values(row.approvals).every(x=>x===false),"Cannot synthesize human approvals");
 assert.ok(row.requiredGates.length>=4);
 assert.ok(row.sourceGroupIds.length>=1);
 for(const key of copyFields){
  for(const lang of ["en","fr"])assert.ok(row.article[key]?.[lang]?.length>25,row.researchId+" "+key+" "+lang);
 }
 assert.ok(row.article.sources.length>=2);
 assert.equal(new Set(row.article.sources.map(x=>x.id)).size,row.article.sources.length);
 for(const link of row.article.sources){
  assert.match(link.url,/^https:\/\//);
  assert.ok(link.role&&link.claim_scope.length>24);
 }
 assert.ok(row.calendarAssociations.every(x=>x.resolver==="EXISTING_1962_CALENDAR"));
}
const unit=id=>COHORT2_REVIEW_ROWS.find(x=>x.releaseUnit===id);
const light=unit("CU-REVIEW-002"),seises=unit("CU-REVIEW-003"),wreath=unit("CU-REVIEW-005");
assert.equal(seises.calendarAssociations.length,2,"One Seises identity must have both feast associations");
assert.deepEqual(new Set(seises.sourceGroupIds),new Set(["CAT-WEISER-B-083","CAT-WEISER-B-109"]));
assert.ok(seises.calendarAssociations.every(x=>x.region_visibility==="SEVILLE_CATHEDRAL_ONLY"));
assert.equal(wreath.relatedFollowingDays.automatic_1962_OCTAVE_EVENT,false);
assert.equal(wreath.relatedFollowingDays.local_day_offset_policy,"NO_SYNTHETIC_DATE_TRIGGER_WITHOUT_EXPLICIT_COMMUNITY_EVIDENCE");
assert.match(wreath.article.caution.en,/1962/);
assert.match(wreath.article.caution.fr,/1962/);
assert.match(light.article.caution.en,/permission/);
assert.match(light.article.caution.fr,/permission/);
assert.match(seises.article.caution.en,/other parishes|Seville Cathedral/i);
assert.match(seises.article.caution.fr,/cathédrale|paroisses/i);
assert.match(wreath.article.history.en,/245 wreaths and 133 questionnaires/);
assert.match(wreath.article.history.fr,/245 photographies de couronnes et 133 questionnaires/);
const previews=[];
for(const year of [2026,2027,2030]){
 const x=v384Dates(year),easter=x.holySaturday,corpus=x.corpus,immaculate=year+"-12-08";
 const cases=[
  [easter,"AT_LOCAL_CUSTOMS",light.researchId],
  [corpus,"SEVILLE_CATHEDRAL_ONLY",seises.researchId],
  [immaculate,"SEVILLE_CATHEDRAL_ONLY",seises.researchId],
  [corpus,"PL_LOCAL_CUSTOMS",wreath.researchId]
 ];
 for(const [date,scope,id] of cases){
  assert.deepEqual(calendarCohort2ReviewForDate(date).map(x=>x.researchId),[],"No automatic public date suggestion");
  assert.deepEqual(calendarCohort2ReviewForDate(date,{preview:true}).map(x=>x.researchId),[],"Explicit local scope required");
  assert.deepEqual(calendarCohort2ReviewForDate(date,{scope}).map(x=>x.researchId),[],"Explicit nonpublishing preview flag required");
  for(const fr of [false,true]){
   const result=calendarCohort2ReviewForDate(date,{preview:true,scope,fr});
   assert.deepEqual(result.map(x=>x.researchId),[id],"Correct scope, existing date and single institutional identity");
   assert.equal(result[0].title,unit(result[0].releaseUnit).article.title[fr?"fr":"en"]);
   assert.equal(result[0].nonPublishingPreview,true);
  }
  assert.ok(!calendarCustomRecommendations(date).some(a=>a.id===id),"Unapproved research is not a public Calendar article");
  previews.push({date,scope,id});
 }
 // No synthetic Corpus Christi octave or daily local wreath services.
 for(let offset=1;offset<=8;offset++){
  const later=addDaysIso(corpus,offset);
  assert.deepEqual(calendarCohort2ReviewForDate(later,{preview:true,scope:"PL_LOCAL_CUSTOMS"}),[]);
 }
 assert.deepEqual(calendarCohort2ReviewForDate(corpus,{preview:true,scope:"AT_LOCAL_CUSTOMS"}),[]);
 assert.deepEqual(calendarCohort2ReviewForDate(immaculate,{preview:true,scope:"PL_LOCAL_CUSTOMS"}),[]);
 assert.deepEqual(calendarCohort2ReviewForDate(easter,{preview:true,scope:"SEVILLE_CATHEDRAL_ONLY"}),[]);
}
for(const invalid of ["2026-02-30","2026-13-01","2026-00-04","nonsense",null]){
 assert.deepEqual(calendarCohort2ReviewForDate(invalid,{preview:true,scope:"PL_LOCAL_CUSTOMS"}),[]);
}
console.log("PASS Customs cohort2: 3 source-bound EN/FR preview subjects, 2 Seises feast links, 12 year/date cases, 0 public Calendar leaks, 0 synthetic Corpus octave or editorial approvals");
