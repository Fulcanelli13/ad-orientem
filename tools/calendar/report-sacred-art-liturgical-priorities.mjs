/**
 * Research-only acquisition coverage, ordered by the observed 1962 liturgical calendar.
 * Never treats nominal feast dates, generic seasons or current obligations as
 * evidence for an exact first-class day image.
 *
 * Normal: node tools/calendar/audit-sacred-art-modules.mjs
 *         node tools/calendar/report-sacred-art-liturgical-priorities.mjs
 * With observed full-year sweep:
 *         node tools/calendar/report-sacred-art-liturgical-priorities.mjs
 *              --year-audit artifacts/calendar-oracle/1962-2026-full-year-audit.json
 */
import assert from "node:assert/strict";
import {existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const config=read("data/calendar/sacred-art-liturgical-priorities.v1.json");
const subjectReport=read("artifacts/sacred-art-coverage/all-modules-v2.json");
const originals=read("data/calendar/sacred-art-candidates.v1.json");
assert.equal(config.schema,"AO_SACRED_ART_LITURGICAL_PRIORITY_V1");
assert.equal(subjectReport.schema,"AO_SACRED_ART_ALL_MODULE_COVERAGE_AUDIT_V2");
const argv=process.argv;
const i=argv.indexOf("--year-audit");
if(i>=0)assert.ok(argv[i+1],"--year-audit requires the full-year production resolver artifact path");
const yearPath=i>=0?argv[i+1]:null;
const subjectById=new Map(subjectReport.subjects.map(s=>[s.id,s]));
const major=config.majorCalendarSubjectIds.map(id=>{
 const t=subjectById.get(id);
 assert.ok(t,"Unknown canonical calendar target "+id);
 return {id,title:t.title,required:t.required,downloadedOriginals:t.downloadedOriginals,
  missingToMinimum:t.missingToMinimum,approvalStatus:t.approvalStatus};
});
const minor=subjectReport.subjects.filter(s=>!config.majorCalendarSubjectIds.includes(s.id));
const summ=(rows)=>({targets:rows.length,meetingOriginalMinimum:rows.filter(x=>x.missingToMinimum===0).length,
 belowMinimum:rows.filter(x=>x.missingToMinimum>0).length,missingSourceSlots:rows.reduce((n,x)=>n+x.missingToMinimum,0)});
const shaOk=a=>/^[a-f0-9]{64}$/i.test(String(a.acquisition?.originalSha256||""))&&!!a.acquisition?.archiveOriginal;
const validOriginals=originals.artworks.filter(shaOk);
const byObservedId=new Map();
for(const artwork of validOriginals){
 for(const identifier of artwork.tags?.observed1962Identifiers||[]){
  if(!byObservedId.has(identifier))byObservedId.set(identifier,[]);
  byObservedId.get(identifier).push(artwork);
 }
}
function normalizedRank(value){
 const v=String(value??"").trim().toUpperCase();
 if(/^[1-4]$/.test(v))return Number(v);
 // Accept Roman canonical ranks, including I class, II cl. and I.
 const roman=/^(IV|III|II|I)(?:\b|[.\s])/i.exec(v);
 if(roman)return {I:1,II:2,III:3,IV:4}[roman[1]];
 const english=/^([1-4])(?:ST|ND|RD|TH)?\s*(?:CLASS|CLASSE|KL)(?:\b|\.)/i.exec(v);
 return english?Number(english[1]):null;
}
function auditedDays(input){
 assert.ok(Array.isArray(input.rows),"Expected rows from production calendar resolver year audit");
 const rows=input.rows;
 const seen=new Set();
 const all=rows.map(r=>{
  assert.match(r.date||"",/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!seen.has(r.date),"Duplicate observed date "+r.date);seen.add(r.date);
  const rank=r.failed?null:normalizedRank(r.rawRank);
  const id=String(r.mainId||"").trim();
  const proven=id.startsWith("tempora:")||id.startsWith("sancti:")||id.startsWith("commune:");
  const matches=proven?(byObservedId.get(id)||[]):[];
  const acquired=matches.length;
  const globallyCleared=matches.filter(a=>a.source?.rights==="CC0"&&a.tags?.artCuratorApproval===true
   &&a.tags?.phoneHeroCropApproval===true).length;
  const sunday=new Date(r.date+"T12:00:00Z").getUTCDay()===0;
  return {date:r.date,observedPrincipalId:id||null,title:r.title||null,rank,
   status:r.failed||!id||rank===null?"UNRESOLVED_SOURCE_DAY":acquired?
   "SOURCE_ID_MATCH_ONLY_ART_REVIEW_REQUIRED":"EXACT_DAY_ORIGINAL_GAP",
   acquiredExplicitObservedPrincipalOriginals:acquired,
   approvedOriginals:globallyCleared,
   obligation:{sundayUniversal:sunday,otherFeastTerritorialStatus:"NOT_ASSESSED"},
   note:!proven&&id?"Principal identity is not a canonical source ID; no exact image credit":null};
 });
 assert.ok(rows.length===365||rows.length===366,"Require complete one-calendar-year sweep, got "+rows.length);
 return all;
}
const report={
 schema:"AO_SACRED_ART_LITURGICAL_PRIORITY_AUDIT_V1",
 evidenceDate:"2026-10-10",ownerIssue:config.ownerIssue,
 policy:config.editorialSequence,
 warning:"Acquired original != beautiful masterpiece, source-verified subject/Proper association, global commercial reuse permission, or publication approval.",
 calendarMajorSubjectPool:{...summ(major),subjects:major},
 allOtherSubjectPool:{...summ(minor),subjectsBelowMinimum:minor.filter(x=>x.missingToMinimum>0).map(s=>({id:s.id,missing:s.missingToMinimum}))},
 obligationCandidateCount:config.obligationCandidates.length,
 obligationRules:"Sundays universally obligatory. No locally obligatory weekday can be labelled until territorial norms are sourced. Civil-date feast candidate is never sufficient.",
 observedYear:{status:"NOT_AUDITED",note:"Missing dated production DayResolver sweep. Calendar target minimum coverage does not establish all I-class days have artwork.",yearFile:null},
 releaseApprovedOriginals:0
};
if(yearPath){
 assert.ok(existsSync(yearPath),"Observed-year artifact not found: "+yearPath);
 const input=read(resolve(yearPath));
 const days=auditedDays(input);
 const perClass=Object.fromEntries([1,2,3,4].map(rank=>{
  const subset=days.filter(d=>d.rank===rank);
  return [String(rank),{
   observedDays:subset.length,
   explicitOriginalMappedDays:subset.filter(d=>d.acquiredExplicitObservedPrincipalOriginals>=1).length,
   stillMissingOrUnresolved:subset.filter(d=>d.acquiredExplicitObservedPrincipalOriginals<1).length,
   approvedDays:subset.filter(d=>d.approvedOriginals>=1).length
  }];
 }));
 report.observedYear={status:days.some(d=>d.status==="UNRESOLVED_SOURCE_DAY")?"PARTIAL_RESOLVER_EVIDENCE":"COMPLETE_SOURCE_SWEEP_NOT_ART_CERTIFICATION",
  yearFile:yearPath,days:days.length,unresolvedDays:days.filter(d=>d.status==="UNRESOLVED_SOURCE_DAY").length,
  classCounts:perClass,
  classIStillMissing:days.filter(d=>d.rank===1&&d.acquiredExplicitObservedPrincipalOriginals===0),
  sundayObligationDays:days.filter(d=>d.obligation.sundayUniversal).length,
  days};
}
const outdir="artifacts/sacred-art-coverage";
mkdirSync(outdir,{recursive:true});
writeFileSync(outdir+"/liturgical-priority-v1.json",JSON.stringify(report,null,2)+"\n");
const L=[
 "# Liturgical-first sacred-art acquisition audit",
 "",
 "Priority: major feasts and solemn seasons → obligation (territorial-law overlay) → **every other observed I-class day** → app modules → observed II → III → IV class.",
 "",
 "Canonical calendar targets: "+major.length+"; "+report.calendarMajorSubjectPool.meetingOriginalMinimum+" meet their minimum; "+report.calendarMajorSubjectPool.belowMinimum+" under target.",
 "Other module and supplemental targets: "+minor.length+"; "+report.allOtherSubjectPool.belowMinimum+" under target.",
 "",
 "**This is a source-only audit. No original is approved for publication.**",
 "",
 "## Observed 1962 rank-by-rank sweep",
 ...(report.observedYear.status==="NOT_AUDITED"
 ?["No dated source-first production resolver artifact provided. All class-specific day coverage remains **NOT AUDITED**; 168 subject target totals cannot replace it."]
 :[
  "Source dates: "+report.observedYear.days+"; unresolved: "+report.observedYear.unresolvedDays+".",
  ...[1,2,3,4].map(rank=>{
   const x=report.observedYear.classCounts[rank];
   return "Class "+rank+": "+x.explicitOriginalMappedDays+"/"+x.observedDays+" days have acquired originals linked to **the actual observed source ID**; approved "+x.approvedDays+".";
  }),
  "",
  "### I-class days missing direct observed-source artwork associations",
  ...report.observedYear.classIStillMissing.map(d=>"- "+d.date+" | "+d.observedPrincipalId+" | "+d.title)
 ]),
 "",
 "## Open high-priority calendar subject minima",
 ...major.filter(x=>x.missingToMinimum).map(x=>"- "+x.id+": "+x.downloadedOriginals+"/"+x.required+" originals"),
 "",
 "## Obligation gate",
 "Sundays apply universally; non-Sunday obligations require a verified diocese/country and valid norms for the civil year. Canon 1246 is not a blanket local calendar.",
 ];
writeFileSync(outdir+"/liturgical-priority-v1.md",L.join("\n")+"\n");
console.log(JSON.stringify({
 majorCalendarTargets:major.length,majorTargetsBelowMinimum:report.calendarMajorSubjectPool.belowMinimum,
 otherTargets:minor.length,otherBelowMinimum:report.allOtherSubjectPool.belowMinimum,
 observedYearStatus:report.observedYear.status,observedClassCounts:report.observedYear.classCounts||null,
 rightsAndArtStatus:"REVIEW_ONLY_NOT_PRODUCTION"
},null,2));
