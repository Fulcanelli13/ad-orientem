// Calendar #719 — read-only editorial coverage audit, never a liturgical resolver.
// Screen source identities without automatically creating omissions, Mass
// permissions, transfers, source hyperlinks or commemorative prayers.
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const root=new URL("../../",import.meta.url);
const load=(file)=>JSON.parse(readFileSync(new URL(file,root),"utf8"));
const yearOf=date=>Number(String(date||"").slice(0,4));
const utcSunday=date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&
  new Date(date+"T12:00:00Z").getUTCDay()===0;
const sourcePathOf=id=>{
  const m=/^tempora:([A-Za-z0-9-]+):[12]:[a-z]+$/.exec(id||"");
  return m?"Tempora/"+m[1]:null;
};
const RECORD_SCOPES=new Set(["1962_GENERAL_ROMAN_CALENDAR"]);
const HOLD_STATUSES=new Set([
  "SOURCE_CONFLICT_HOLD","PARTICULAR_SCOPE_HOLD","MASS_SELECTION_HOLD",
  "WITNESS_NOT_SOURCE_CLAIM","SEPARATE_ACCEPTANCE_NOT_COMPLETED_BY_RUBRICAL_CLAIMS"
]);
export const COVERAGE_REVIEW_YEARS=Object.freeze([2026,2027,2028]);

export function buildRubricalCoverageAudit({corrections,protectedAnnex,particular,transfers,manifest,adjudications}){
  if(corrections?.schema!=="AO_1962_CALENDAR_CORRECTIONS_V1"||
     protectedAnnex?.schema!=="AO_CUM_SANCTISSIMA_PROTECTED_FEASTS_RESEARCH_V1"||
     particular?.schema!=="AO_PARTICULAR_TRADITIONAL_CALENDAR_WITNESSES_REVIEW_V1"||
     transfers?.schema!=="ao-1962-observance-transfer-oracle-v1"||
     manifest?.schema!=="AO_CALENDAR_1962_RUBRICAL_COVERAGE_EXCEPTIONS_V1"||
     adjudications?.schema!=="AO_CALENDAR_SUNDAY_OVERLAP_DISPOSITION_SCREENING_V1")
    throw new Error("Coverage source schema mismatch; do not silently substitute a different calendar.");
  if(JSON.stringify(manifest.scope?.years)!==JSON.stringify(COVERAGE_REVIEW_YEARS)||
     manifest.publicationStatus!=="EDITORIAL_AND_CI_AUDIT_ONLY_NOT_RUNTIME_RULES")
    throw new Error("Coverage scope is not a certified 2026–2028 editorial audit.");
  const omissions=corrections.nonCommemorationWitnesses;
  const feasts=protectedAnnex.feasts;
  if(!Array.isArray(omissions)||!Array.isArray(feasts)||
     protectedAnnex.protectedCount!==feasts.length)throw new Error("Missing or inconsistent source arrays.");
  const unique=(list,key)=>new Set(list.map(key)).size===list.length;
  if(!unique(omissions,x=>x.date)||!unique(omissions,x=>x.id)||
     !unique(feasts,x=>x.monthDay)||
     !omissions.every(x=>
       RECORD_SCOPES.has(x.scope)&&
       COVERAGE_REVIEW_YEARS.includes(yearOf(x.date))&&utcSunday(x.date)&&
       x.principal?.sourcePath===sourcePathOf(x.principal?.sourceId)&&
       Number(String(x.principal.sourceId).match(/:([12]):[a-z]+$/)?.[1])===x.principal.class&&
       x.impeded?.sourcePath==="Sancti/"+x.date.slice(5)&&
       x.impeded?.fixedMonthDay===x.date.slice(5)&&x.impeded.class===3&&
       x.disposition==="OMITTED_NOT_TRANSFERRED_NOT_COMMEMORATED"&&
       x.explanationOnly===true&&x.changes1962Mass===false&&
       x.doesNotDetermineParticularCalendar===true&&
       x.en?.trim()&&x.fr?.trim()&&
       x.observedWitness?.startsWith("https://")&&
       x.feastClassWitness?.startsWith("https://")
     ))
    throw new Error("One dated 1962 omission has contradictory source, precedence or publication metadata.");
  const cited=new Map(omissions.map(x=>[x.date,x]));
  const byFixedDay=new Map(feasts.map(x=>[x.monthDay,x]));
  const omissionRows=omissions.map(x=>Object.freeze({
    date:x.date,
    saintIdentity:x.impeded.saint,
    principalId:x.principal.sourceId,
    saintSourcePath:x.impeded.sourcePath,
    rank:x.principal.class,
    disposition:"SOURCE_REVIEWED_GENERAL_1962_OMISSION",
    protected2020OptionalMassAnnex:byFixedDay.has(x.date.slice(5)),
    publicationOwner:"CALENDAR_EXISTING_SOURCE_DISCLOSURE",
    needsParticularCalendarAdjudication:true
  })).sort((a,b)=>a.date.localeCompare(b.date));
  const overlaps=COVERAGE_REVIEW_YEARS.flatMap(year=>feasts.map(f=>{
    const date=year+"-"+f.monthDay;
    if(!utcSunday(date))return null;
    const matching=cited.get(date);
    return Object.freeze({
      date,
      saint:f.titleForReview,
      annexIdentity:f.resolverIdentity,
      status:matching?
        "ALREADY_HAS_DATE_SPECIFIC_1962_OMISSION_CLAIM":
        "SCREENING_ONLY_NOT_A_CERTIFIED_OMISSION",
      omissionClaimId:matching?.id??null,
      interpretation:"2020_OPTIONAL_MASS_PROTECTION_DOES_NOT_OVERRIDE_1962_SUNDAY_RANK"
    });
  }).filter(Boolean)).sort((a,b)=>a.date.localeCompare(b.date));
  const reviewedOverlaps=overlaps.filter(x=>x.omissionClaimId!==null);
  const screenOnly=overlaps.filter(x=>x.omissionClaimId===null);
  const held=(manifest.exceptions||[]).map(x=>{
    if(!HOLD_STATUSES.has(x.status)||!x.id||x.automaticallyAffectsMass!==false||
       !x.gate||!x.reason||!Array.isArray(x.dates)||
       !x.dates.every(d=>/^\d{4}-\d{2}-\d{2}$/.test(d))||
       (x.sourceUrl&&!/^https:\/\//.test(x.sourceUrl)))
      throw new Error("Unbounded or malformed exception hold "+String(x.id));
    return Object.freeze({...x});
  });
  if(!unique(held,x=>x.id)||!held.some(x=>x.id==="LUCY_ADVENT_III_2026")||
     !held.some(x=>x.id==="PIUS_X_SSPX_2028")||
     !held.some(x=>x.id==="SCRIPTURE_EDITIONS_CONTEXT"))
    throw new Error("Required disputed-source, particular-rank or Scripture acceptance hold missing.");
  const particularIds=new Set(particular.witnesses.map(x=>x.id));
  const heldParticular=new Set(held.filter(x=>x.status==="PARTICULAR_SCOPE_HOLD"&&x.sourceId).map(x=>x.sourceId));
  if(![...particularIds].every(id=>heldParticular.has(id))||
     heldParticular.size!==particularIds.size)
    throw new Error("An unapproved particular-calendar source escaped the hold registry.");
  if(!unique(transfers.witnesses,x=>x.id))throw new Error("Duplicate original transfer witness.");
  // The 24 formerly unclassified candidates now have a bounded rubrical
  // assessment, NOT a published 1962 omission or alternative Mass.
  const assessed=adjudications.cases;
  const indexedScreening=new Map(screenOnly.map(x=>[x.date,x]));
  if(adjudications.publicationStatus!=="INTERNAL_RUBRICAL_ASSESSMENTS_NO_AUTOMATIC_CALENDAR_OR_MASS_CHANGES"||
     !Array.isArray(assessed)||assessed.length!==screenOnly.length||
     !unique(assessed,x=>x.date)||!unique(assessed,x=>x.protectedFeastResolverIdentity+"|"+x.date))
    throw new Error("Incomplete, duplicated or publishable Sunday overlap dispositions.");
  const requiredScopeExceptions=new Map([
    ["2026-12-13","LUCY_ADVENT_III_2026"],
    ["2027-03-21","BENEDICT_BENEDICTINE_2027"],
    ["2027-10-03","THERESE_FRANCE_2027"],
    ["2028-09-03","PIUS_X_SSPX_2028"]
  ]);
  const sourceHoldIds=new Set((manifest.exceptions||[]).map(x=>x.id));
  const allowedRubric=id=>/^RG (?:15|16|93|95|109|111\\([ab]\\))$/.test(id);
  for(const row of assessed){
    const screening=indexedScreening.get(row.date);
    const expectedFeast=byFixedDay.get(row.date.slice(5));
    const rank=row.generalSundayClass,exceptionId=requiredScopeExceptions.get(row.date);
    const expectedClauses=[
      "RG "+(rank===1?"15":"16"),"RG 93","RG 95","RG 109",
      "RG 111("+(rank===1?"a":"b")+")"
    ];
    const year=yearOf(row.date),month=Number(row.date.slice(5,7));
    if(!screening||!expectedFeast||row.feastTitle!==screening.saint||
       row.protectedFeastResolverIdentity!==screening.annexIdentity||
       row.protectedFeastResolverIdentity!==expectedFeast.resolverIdentity||
       !COVERAGE_REVIEW_YEARS.includes(year)||!utcSunday(row.date)||
       ![1,2].includes(rank)||row.fixedFeastClass!==3||
       typeof row.generalSundayPrincipal!=="string"||!row.generalSundayPrincipal.trim()||
       row.scope!=="1962_GENERAL_ROMAN_ONLY"||
       row.assessedGeneralDisposition!=="SUNDAY_PRECEDES_THIRD_CLASS_FEAST_NO_GENERAL_TRANSFER_OR_COMMEMORATION"||
       JSON.stringify(row.assessedUnder)!==JSON.stringify(expectedClauses)||
       !row.assessedUnder.every(allowedRubric)||
       row.historicalWitness?.kind!=="DATED_MONTHLY_ORDO_SECONDARY_SOURCE"||
       row.historicalWitness?.url!=="https://ordo.fsspx.org/calendar/"+year+"/"+month||
       row.secondWitness?.kind!=="INDEPENDENT_1962_YEAR_CALENDAR"||
       row.secondWitness?.url!=="https://gcatholic.org/calendar/"+year+"/Extraordinary-en"||
       row.sourceAndProperGate!=="CANONICAL_1962_RESOLVER_PROPER_AND_COMMENCEMENT_ORATION_PARITY_REQUIRED"||
       row.changesMass!==false||row.changesCalendarPrincipal!==false||
       row.autoCreatesCommemoration!==false||row.publishAsOmission!==false||
       row.editorialStatus!==(exceptionId?"SCOPE_OR_SOURCE_EXCEPTION_HELD":"RUBRICAL_PRELIMINARY_NOT_PUBLISHED")||
       (exceptionId?row.exception?.id!==exceptionId:row.exception!==null))
      throw new Error("An overlap lost its source, rank, provenance or non-runtime publication gate: "+String(row.date));
    if(exceptionId&&(!row.exception?.kind||!row.exception.note?.trim()))
      throw new Error("Unexplained particular-calendar/source conflict: "+row.date);
    if(["LUCY_ADVENT_III_2026","PIUS_X_SSPX_2028"].includes(exceptionId)&&!sourceHoldIds.has(exceptionId))
      throw new Error("An existing source/scope hold was removed: "+exceptionId);
  }
  // Require one-to-one review coverage of *all* screened date identities.
  for(const date of indexedScreening.keys()){
    if(!assessed.some(row=>row.date===date))throw new Error("Unassessed protected Sunday overlap: "+date);
  }
  if(assessed.filter(x=>x.generalSundayClass===1).length!==3||
     assessed.filter(x=>x.exception!==null).length!==4)
    throw new Error("Class-I/II or exception-review baseline changed; revisit original evidence.");
  const annotatedTransfers=transfers.witnesses.filter(x=>!!x.rubricalClaim);
  const counts=Object.freeze({
    omissionClaimDates:omissionRows.length,
    omissionDatesByYear:Object.freeze(Object.fromEntries(COVERAGE_REVIEW_YEARS.map(y=>
      [String(y),omissionRows.filter(x=>yearOf(x.date)===y).length]))),
    protectedThirdClassFeasts:feasts.length,
    protectedAnnexSundayScreenings:overlaps.length,
    protectedScreeningsAlreadyCited:reviewedOverlaps.length,
    protectedScreeningsAwaitingIndividualReview:screenOnly.length,
    reviewedOmissionsNotInProtectedAnnex:omissionRows.filter(x=>!x.protected2020OptionalMassAnnex).length,
    particularWitnessesHeld:particular.witnesses.length,
    sourceTransferWitnesses:transfers.witnesses.length,
    sourceAnnotatedTransfers:annotatedTransfers.length,
    transferWitnessesWithoutClauseCitation:transfers.witnesses.length-annotatedTransfers.length,
    explicitExceptionHolds:held.length,
    preliminaryRuleAssessedOverlaps:assessed.length,
    scopeOrSourceOverlapExceptions:assessed.filter(x=>x.exception!==null).length,
    publishedClaimsFromThisReview:assessed.filter(x=>x.publishAsOmission).length
  });
  const snap=manifest.snapshotExpectations;
  const checks=[
    ["reviewedOmissionCases",counts.omissionClaimDates],
    ["calendarYears",COVERAGE_REVIEW_YEARS.length],
    ["protectedFeastsInAnnex",counts.protectedThirdClassFeasts],
    ["protectedFeastSundayOverlaps",counts.protectedAnnexSundayScreenings],
    ["protectedOverlapAlreadyReviewed",counts.protectedScreeningsAlreadyCited],
    ["protectedOverlapPendingClassification",counts.protectedScreeningsAwaitingIndividualReview],
    ["particularWitnessesOnHold",counts.particularWitnessesHeld],
    ["transferWitnesses",counts.sourceTransferWitnesses],
    ["transferClaimsSourceCertified",counts.sourceAnnotatedTransfers],
    ["preliminaryRuleAssessedOverlaps",counts.preliminaryRuleAssessedOverlaps],
    ["scopeOrSourceOverlapExceptions",counts.scopeOrSourceOverlapExceptions]
  ];
  for(const [name,current] of checks)
    if(snap?.[name]!==current)throw new Error("Audit snapshot "+name+" drifted; reconcile original evidence before changing the published coverage report.");
  return Object.freeze({
    schema:"AO_CALENDAR_1962_RUBRICAL_COVERAGE_REPORT_V1",
    asOf:manifest.asOf,scope:"2026–2028 General Roman 1962; optional 2020 decree separately classified",
    counts,
    omittedFeastClaims:Object.freeze(omissionRows),
    protectedAnnexSundayOverlaps:Object.freeze(overlaps),
    screeningOnly:Object.freeze(screenOnly),
    preliminaryDispositions:Object.freeze(assessed.map(x=>Object.freeze({...x}))),
    exceptionHolds:Object.freeze(held),
    transferUnannotated:Object.freeze(transfers.witnesses.filter(x=>!x.rubricalClaim).map(x=>Object.freeze({
      witnessId:x.id,original:x.original,observed:x.observed,
      status:"SOURCE_WITNESS_NOT_AN_EXACT_RUBRIC_CLAIM"
    }))),
    caveats:Object.freeze([
      "The denominator of ALL historical 1962 concurrence cases is not established; never report percentage-complete from these counters.",
      "24 screening overlaps are NOT 24 certified omitted feasts; existing source-verified omissions are a separate cohort.",
      "Cum sanctissima's 2020 decree protects 70 III-class days against newly optional Mass choices, not against normal 1962 I/II Sunday precedence.",
      "A local or religious calendar, a new saint, a transferred Mass, or an unverified oration is not made universal by this inventory.",
      "Calendar–Scripture navigation does not certify edition, offline content, commentary and exact return parity on every special reading."
    ])
  });
}
export function loadCanonicalRubricalCoverageInputs(){
  return {
    corrections:load("data/calendar/1962-ordo-corrections.v1.json"),
    protectedAnnex:load("data/calendar/cum-sanctissima-protected-third-class.review.v1.json"),
    particular:load("data/calendar/particular-traditional-calendar-witnesses.review.v1.json"),
    transfers:load("data/calendar/1962-transfer-oracle.v1.json"),
    manifest:load("data/calendar/1962-rubrical-coverage-exceptions.v1.json"),
    adjudications:load("data/calendar/1962-sunday-overlap-dispositions-2026-2028.review.v1.json")
  };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  try{
    const report=buildRubricalCoverageAudit(loadCanonicalRubricalCoverageInputs());
    if(process.argv.includes("--json"))process.stdout.write(JSON.stringify(report,null,2)+"\n");
    else{
      process.stdout.write("Calendar 1962 claim-coverage and exceptions (non-runtime audit)\n"+
        JSON.stringify(report.counts,null,2)+"\n"+
        "Uncertified protected-annex Sunday screening dates: "+
        report.screeningOnly.map(x=>x.date).join(", ")+"\n"+
        "Exception holds: "+report.exceptionHolds.map(x=>x.id).join(", ")+"\n");
    }
  }catch(e){process.stderr.write(String(e?.stack||e)+"\n");process.exitCode=1;}
}
