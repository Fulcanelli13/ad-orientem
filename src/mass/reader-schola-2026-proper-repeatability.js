// Schola P0: source-identity reproducibility across two independent 2026
// DayResolver sessions. Research/CI only; never a new liturgical authority.
export const SCHOLA_2026_PROPER_REPEATABILITY_SCHEMA=
 "ao-schola-2026-proper-source-repeatability-v1";
export const SCHOLA_2026_REPRODUCIBILITY_DATES=Object.freeze([
 "2026-02-22","2026-03-01","2026-03-04","2026-03-05",
 "2026-03-08","2026-03-15","2026-03-16","2026-03-17",
 "2026-03-21","2026-04-19","2026-05-14","2026-05-26",
 "2026-06-24","2026-10-25","2026-11-30","2026-12-08",
 "2026-12-18"
]);
const datePattern=/^2026-\d\d-\d\d$/;
const hashPattern=/^[a-f0-9]{64}$/;
const safeSource=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
function sourceReady(row){
 return row?.resolverStatus==="ready"&&
   ["ready","cached"].includes(String(row.properStatus??"").toLowerCase())&&
   safeSource.test(String(row.sourcePath??""))&&
   typeof row.principalId==="string"&&row.principalId.length>0&&
   hashPattern.test(String(row.selectedProperSha256??""));
}
function inputMap(list,label){
 if(!Array.isArray(list)||list.length!==17)
  throw Error("SCHOLA_REPEATABILITY_"+label+"_CENSUS_INVALID");
 const map=new Map();
 for(const row of list){
  if(!datePattern.test(String(row?.date))||
     !SCHOLA_2026_REPRODUCIBILITY_DATES.includes(row.date)||
     map.has(row.date))
   throw Error("SCHOLA_REPEATABILITY_"+label+"_DATE_OR_IDENTITY_INVALID");
  map.set(row.date,row);
 }
 return map;
}
export function auditSchola2026ProperRepeatability({first,second}={}){
 const a=inputMap(first,"FIRST"),b=inputMap(second,"SECOND");
 const results=SCHOLA_2026_REPRODUCIBILITY_DATES.map(date=>{
  const left=a.get(date),right=b.get(date);
  const readyLeft=sourceReady(left),readyRight=sourceReady(right);
  const sameOwner=readyLeft&&readyRight&&
    left.sourcePath===right.sourcePath&&left.principalId===right.principalId;
  const sameText=sameOwner&&left.selectedProperSha256===right.selectedProperSha256;
  const status=!readyLeft||!readyRight?"SOURCE_FAILED_OR_UNRESOLVED_HOLD":
    !sameOwner?"CALENDAR_SOURCE_IDENTITY_DRIFT_HOLD":
    !sameText?"1962_SELECTED_TEXT_CHANGED_HOLD":
    "REPRODUCED_PINNED_PROPER";
  return Object.freeze({date,status,
   first:{resolverStatus:left.resolverStatus,properStatus:left.properStatus,
     principalId:left.principalId??null,sourcePath:left.sourcePath??null,
     selectedProperSha256:left.selectedProperSha256??null,
     errors:(left.errors??[]).slice(0,5)},
   second:{resolverStatus:right.resolverStatus,properStatus:right.properStatus,
     principalId:right.principalId??null,sourcePath:right.sourcePath??null,
     selectedProperSha256:right.selectedProperSha256??null,
     errors:(right.errors??[]).slice(0,5)},
   musicalNotationCertified:false,publicScore:false});
 });
 const reproduced=results.filter(x=>x.status==="REPRODUCED_PINNED_PROPER").length;
 return Object.freeze({
  schema:SCHOLA_2026_PROPER_REPEATABILITY_SCHEMA,
  authority:"TWO_INDEPENDENT_AO_RUNTIME_V8_SESSIONS",
  scope:"2026_KNOWN_INTERMITTENT_17_SELECTED_MASSES",
  summary:{dates:17,reproduced,held:17-reproduced,
    stable:reproduced===17,publicScores:0,musicalApprovals:0},
  results,
  publication:{sourceEvidenceOnly:true,automaticallyApproved:false,
    changedScores:0,publicScores:0}
 });
}
