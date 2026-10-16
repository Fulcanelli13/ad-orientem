// Read-only, source-owned explanations for *resolved* 1962 Calendar claims.
// Never calculate precedence, replace the Mass resolver or promote a witness
// into a universal or local liturgical permission. Unmatched days show none.
import {canonical1962Commemorations} from "./traditional-day-adjudication.js";
import {calendarMassColour} from "./colour-projection.js";

export const GENERAL_RUBRICS_NORMATIVE_URL="https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=597";
export const GENERAL_RUBRICS_ENGLISH_REFERENCE_URL="https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html";
const VALID_CLAUSES=new Set(["RG 25(b)","RG 108(a)","RG 108(e)","RG 111(a)","RG 111(c)"]);
const VALID_RANKS=new Set([1,2,3,4]);
const ownerId=raw=>{
  const value=String(raw||"").replace(/:[1-4]:[a-z]{1,3}$/i,"");
  return /^(?:sancti|tempora):[a-z0-9-]+$/i.test(value)?value.toLowerCase():null;
};
const pathId=raw=>{
  const value=String(raw||"");
  return /^(?:Sancti|Tempora)\/[A-Za-z0-9-]+$/.test(value)
    ?value.replace("/" ,":").toLowerCase():null;
};
const trustworthyWitness=url=>{
  try{
    const target=new URL(String(url||""));
    return target.protocol==="https:"&&
      ["ordo.fsspx.org","missale.online"].includes(target.hostname)&&
      !target.username&&!target.password?target.href:null;
  }catch{return null}
};
export function calendarRubricalClaimsForDay(resolution,sourceLedger){
  if(sourceLedger?.schema!=="AO_1962_PRIVILEGED_COMMEMORATIONS_V1"||
     resolution?.status==="failed"||!resolution?.day?.main?.id||
     resolution?.proper?.status!=="ready"||!/^\d{4}-\d{2}-\d{2}$/.test(resolution?.date||""))
    return Object.freeze([]);
  const observed=ownerId(resolution.day.main.id),source=pathId(resolution.proper.data?.sourcePath);
  if(!observed||source!==observed)return Object.freeze([]);
  // The first source-owned collection with observed IDs wins. Do not combine
  // stale candidate commemoration lists or recognize title-only similarities.
  const commemorations=canonical1962Commemorations(resolution);
  if(commemorations.length!==1)return Object.freeze([]);
  const actual=commemorations[0].identity?.replace(":", "/")||"";
  const found=[];
  for(const witness of sourceLedger.witnesses??[]){
    const claim=witness?.rubricalClaim;
    if(!claim||witness.date!==resolution.date||pathId(witness.sourcePath)!==observed||
       !/^[A-Z0-9_]+$/.test(claim.id||"")||
       !Array.isArray(claim.clauses)||claim.clauses.length<2||
       !claim.clauses.every(x=>VALID_CLAUSES.has(x))||
       new Set(claim.clauses).size!==claim.clauses.length||
       !claim.en?.trim()||!claim.fr?.trim()||
       !VALID_RANKS.has(claim.principalClass))continue;
    const observedRank=Number(String(resolution.day.main.id).match(/:([1-4]):[a-z]{1,3}$/i)?.[1]);
    if(observedRank!==claim.principalClass)continue;
    const pattern=witness.commemorationPathPattern||"";
    if(!/^\^Tempora\/[A-Za-z0-9\[\]+-]+\$$/.test(pattern)||
       pattern.length>80||!new RegExp(pattern,"i").test(actual))continue;
    const witnessUrl=trustworthyWitness(witness.source);
    if(!witnessUrl)continue;
    found.push(Object.freeze({
      claimId:claim.id,
      date:resolution.date,
      principalId:observed,
      commemorationId:commemorations[0].identity,
      clauses:Object.freeze([...claim.clauses]),
      explanation:Object.freeze({en:claim.en.trim(),fr:claim.fr.trim()}),
      authorityKind:"NORMATIVE_1960_RUBRICS",
      normativeUrl:GENERAL_RUBRICS_NORMATIVE_URL,
      referenceUrl:GENERAL_RUBRICS_ENGLISH_REFERENCE_URL,
      witnessKind:"DATE_SCOPED_HISTORICAL_ORDO",
      witnessUrl,
      automaticMassChange:false,
    }));
  }
  return Object.freeze(found);
}


const COLOUR_CLAUSE_IDS=new Set(["RG 119(a)","RG 127(a)","RG 128(a)"]);
const COLOUR_EXPLANATION_URL="https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf#page=20";
const PINNED_AUDIT_DATES=new Set(["2024-01-08","2027-01-11","2024-12-24","2027-12-24"]);
const EXPECTED_COLOUR_CODES=Object.freeze({White:"w",Violet:"v"});

/** Explain existing resolved Mass colours; never decide or overwrite one. */
export function calendarColourRubricalClaimsForDay(resolution,sourceLedger){
  if(sourceLedger?.schema!=="AO_1962_CALENDAR_CORRECTIONS_V1"||
     resolution?.status==="failed"||resolution?.proper?.status!=="ready"||
     !PINNED_AUDIT_DATES.has(resolution?.date)||!resolution?.day?.main?.id)return Object.freeze([]);
  const observed=ownerId(resolution.day.main.id);
  const source=pathId(resolution.proper.data?.sourcePath);
  if(!observed||source!==observed)return Object.freeze([]);
  const date=resolution.date;
  const entries=[
    ...(Array.isArray(sourceLedger.disputes)?sourceLedger.disputes.filter(row=>row?.date===date):[]),
    ...(Array.isArray(sourceLedger.secondaryAdjudications)?sourceLedger.secondaryAdjudications.filter(row=>row?.dates?.includes(date)):[])
  ];
  if(entries.length!==1)return Object.freeze([]); // No conflicting certifications.
  const row=entries[0],claim=row.rubricClaim;
  const expected=claim?.expectedColour;
  const code=EXPECTED_COLOUR_CODES[expected];
  if(row.status!=="ADJUDICATED_FROM_1960_RUBRICS"||
     row.decision!==String(expected||"").toUpperCase()+"_CONFIRMED"||
     (row.field&&row.field!=="colour")||
     (row.app&&row.app!==expected)||
     claim?.kind!=="SEASONAL_MASS_COLOUR"||
     !/^[A-Z0-9_]+$/.test(claim?.id||"")||
     !code||
     !Array.isArray(claim.clauses)||!claim.clauses.length||
     !claim.clauses.every(x=>COLOUR_CLAUSE_IDS.has(x))||
     new Set(claim.clauses).size!==claim.clauses.length||
     !claim.en?.trim()||!claim.fr?.trim()||
     claim.referencePage!==COLOUR_EXPLANATION_URL||
     row.authority?.url!==COLOUR_EXPLANATION_URL.split("#")[0])return Object.freeze([]);
  // For a single source-resolved liturgical Mass only. The observed 1962
  // principal and appointed Proper must agree, without ceremonial colour
  // phases or an unrelated selected votive/alternative Mass.
  const suffix=String(resolution.day.main.id).match(/:[1-4]:([a-z]{1,3})$/i)?.[1]?.toLowerCase();
  if(suffix!==code)return Object.freeze([]);
  const actual=String(calendarMassColour(resolution)).trim().toLowerCase();
  if(actual!==expected.toLowerCase()||
     [resolution.proper.data?.color,resolution.proper.data?.colour,
      resolution.day.main.color,resolution.day.main.colour]
       .some(c=>c!=null&&String(c).trim()&&String(c).trim().toLowerCase()!==actual)||
     (resolution.colourPlan?.sequence?.length??0)>1)return Object.freeze([]);
  return Object.freeze([Object.freeze({
    claimId:claim.id,
    claimKind:"SOURCE_ADJUDICATED_MASS_COLOUR",
    date,principalId:observed,properSourcePath:resolution.proper.data.sourcePath,
    expectedColour:expected,
    clauses:Object.freeze([...claim.clauses]),
    explanation:Object.freeze({en:claim.en.trim(),fr:claim.fr.trim()}),
    authorityKind:"NORMATIVE_1960_RUBRICS",
    normativeUrl:GENERAL_RUBRICS_NORMATIVE_URL,
    referenceUrl:GENERAL_RUBRICS_ENGLISH_REFERENCE_URL,
    historicalExplanationKind:"PRINTED_1960_RUBRICS_TRANSLATION",
    historicalExplanationUrl:COLOUR_EXPLANATION_URL,
    automaticMassChange:false
  })]);
}


// These are *dated source-witness explanations* of an observed transfer, not
// a replacement for the Calendar's year algorithm or its actual 1962 resolver.
import {annunciationObservanceDate,allSoulsObservanceDate,saintJosephObservanceDate} from "./liturgical-year.js";

const TRANSFER_IDS=Object.freeze({
  "annunciation-2024":Object.freeze({sourcePath:"Sancti/03-25",monthDay:"03-25",colour:"White",suffix:"w",project:annunciationObservanceDate}),
  "all-souls-2025":Object.freeze({sourcePath:"Sancti/11-02",monthDay:"11-02",colour:"Black",suffix:"b",project:allSoulsObservanceDate}),
  "annunciation-2027":Object.freeze({sourcePath:"Sancti/03-25",monthDay:"03-25",colour:"White",suffix:"w",project:annunciationObservanceDate}),
  "joseph-2028":Object.freeze({sourcePath:"Sancti/03-19",monthDay:"03-19",colour:"White",suffix:"w",project:saintJosephObservanceDate})
});
const TRANSFER_CLAUSES=new Set(["RG 15","RG 16(b)","RG 95","RG 96","RG 96(a)","RG 96(b)","RG 99"]);
const transferWitnessUrl=value=>{
  try{
    const u=new URL(String(value||""));
    if(u.protocol!=="https:"||u.username||u.password)return null;
    if(u.hostname==="gcatholic.org"&&/^\/calendar\/20\d{2}\/Extraordinary-en$/.test(u.pathname))return u.href;
    if(u.hostname==="missale.online"&&/^\/festkalender\/en\/20\d{2}$/.test(u.pathname))return u.href;
    return null;
  }catch{return null}
};
export function calendarTransferRubricalClaimsForDay(resolution,ledger){
  if(ledger?.schema!=="ao-1962-observance-transfer-oracle-v1"||
     resolution?.status==="failed"||resolution?.proper?.status!=="ready"||
     !/^\d{4}-\d{2}-\d{2}$/.test(resolution?.date||"")||
     !resolution?.day?.main?.id)return Object.freeze([]);
  const source=resolution.proper.data?.sourcePath;
  const actual=ownerId(resolution.day.main.id);
  if(!actual||actual!==pathId(source)||
     !/:1:[a-z]{1,3}$/i.test(String(resolution.day.main.id)))return Object.freeze([]);
  const matches=(Array.isArray(ledger.witnesses)?ledger.witnesses:[])
    .filter(w=>w?.observed===resolution.date&&w?.rubricalClaim);
  // Never prefer an arbitrary witness when same-day identities conflict.
  if(matches.length!==1)return Object.freeze([]);
  const w=matches[0],c=w.rubricalClaim,known=TRANSFER_IDS[w.id];
  if(!known||
     w.original!==c.original||w.observed!==c.observed||
     w.original.slice(0,4)!==w.observed.slice(0,4)||
     w.original.slice(5)!==known.monthDay||
     w.original>=w.observed||known.project(Number(w.original.slice(0,4)))!==w.observed||
     c.sourcePath!==known.sourcePath||source!==known.sourcePath||
     c.kind!=="SOURCE_ATTESTED_1962_TRANSFER"||c.principalClass!==1||
     c.authorityId!=="RUBRICS_1960"||c.generalCalendarOnly!==true||
     c.doesNotAuthorizeLocalMass!==true||
     c.id!==w.id.toUpperCase().replace(/-/g,"_")||
     !Array.isArray(c.clauses)||!c.clauses.length||
     !c.clauses.every(x=>TRANSFER_CLAUSES.has(x))||
     new Set(c.clauses).size!==c.clauses.length||
     !c.title?.en?.trim()||!c.title?.fr?.trim()||
     !c.explanation?.en?.trim()||!c.explanation?.fr?.trim())return Object.freeze([]);
  // Require the case-specific *operative* transfer paragraph, not merely a
  // generic occurrence or calendar-precedence citation.
  if(w.id.startsWith("annunciation-")&&!c.clauses.includes("RG 96(a)"))return Object.freeze([]);
  if(w.id==="all-souls-2025"&&!c.clauses.includes("RG 96(b)"))return Object.freeze([]);
  if(w.id==="joseph-2028"&&(!c.clauses.includes("RG 95")||!c.clauses.includes("RG 96")))return Object.freeze([]);
  const resolvedSuffix=String(resolution.day.main.id).match(/:1:([a-z]{1,3})$/i)?.[1]?.toLowerCase();
  if(resolvedSuffix!==known.suffix||
     String(calendarMassColour(resolution)).trim().toLowerCase()!==known.colour.toLowerCase()||
     (resolution.colourPlan?.sequence?.length??0)>1)return Object.freeze([]);
  const witnessUrl=transferWitnessUrl(w.source);
  if(!witnessUrl)return Object.freeze([]);
  return Object.freeze([Object.freeze({
    claimId:c.id,claimKind:"SOURCE_ATTESTED_1962_TRANSFER",
    originalDate:w.original,observedDate:w.observed,
    principalId:actual,properSourcePath:source,
    clauses:Object.freeze([...c.clauses]),
    title:Object.freeze({en:c.title.en.trim(),fr:c.title.fr.trim()}),
    explanation:Object.freeze({en:c.explanation.en.trim(),fr:c.explanation.fr.trim()}),
    authorityKind:"NORMATIVE_1960_RUBRICS",
    normativeUrl:GENERAL_RUBRICS_NORMATIVE_URL,
    referenceUrl:GENERAL_RUBRICS_ENGLISH_REFERENCE_URL,
    witnessKind:"INDEPENDENT_DATED_1962_CALENDAR",
    witnessUrl,changesMassResolver:false,
  })]);
}


// Legacy 1962 calendar source-adjudications from the existing correction
// ledger. This is a provenance projection, NEVER a precedence/oration engine.
const EXACT_2027_OBSERVED=new Set(["2027-08-15","2027-11-30","2027-12-08"]);
const EXACT_COMM_CLAUSES=new Set(["RG 25(b)","RG 108(a)","RG 108(e)","RG 111(a)","RG 111(c)"]);
const EXACT_COMM_CATEGORIES=new Set(["PRIVILEGED_SUNDAY","PRIVILEGED_ADVENT_FERIA"]);
export function calendarObservedCommemorationClaimsForDay(resolution,corrections){
  if(corrections?.schema!=="AO_1962_CALENDAR_CORRECTIONS_V1"||
     resolution?.status==="failed"||resolution?.proper?.status!=="ready"||
     !EXACT_2027_OBSERVED.has(resolution?.date)||
     !resolution?.day?.main?.id)return Object.freeze([]);
  const mainId=ownerId(resolution.day.main.id),source=pathId(resolution.proper.data?.sourcePath);
  if(!mainId||mainId!==source)return Object.freeze([]);
  const observed=canonical1962Commemorations(resolution);
  if(observed.length!==1)return Object.freeze([]);
  const entries=(Array.isArray(corrections.outstandingSecondaryCases)?corrections.outstandingSecondaryCases:[])
    .filter(x=>x?.dates?.length===1&&x.dates[0]===resolution.date);
  if(entries.length!==1)return Object.freeze([]);
  const row=entries[0],c=row.rubricalClaim;
  if(row.status!=="FIXED_IN_PINNED_DAY_RESOLVER"||
     !c||!/^[A-Z0-9_]+$/.test(c.id||"")||
     c.authorityKind!=="NORMATIVE_1960_RUBRICS"||
     c.explanationOnly!==true||
     c.formSpecificOrationCertification!=="DELEGATED_TO_CANONICAL_MASS_OWNER"||
     !EXACT_COMM_CATEGORIES.has(c.kind)||
     ![1,2].includes(c.principalClass)||
     c.commemorationClass!==(c.kind==="PRIVILEGED_SUNDAY"?2:3)||
     pathId(c.sourcePath)!==mainId||
     pathId(c.commemorationPath)!==ownerId(observed[0].identity)||
     !Array.isArray(c.clauses)||!c.clauses.length||
     !c.clauses.every(x=>EXACT_COMM_CLAUSES.has(x))||
     new Set(c.clauses).size!==c.clauses.length||
     !c.en?.trim()||!c.fr?.trim())return Object.freeze([]);
  const mainRank=Number(String(resolution.day.main.id).match(/:([1-4]):[a-z]{1,3}$/i)?.[1]);
  const commRank=Number(String(observed[0].sourceId).match(/:([1-4]):[a-z]{1,3}$/i)?.[1]);
  if(mainRank!==c.principalClass||commRank!==c.commemorationClass)return Object.freeze([]);
  const isSunday=new Date(resolution.date+"T12:00:00Z").getUTCDay()===0;
  if(c.kind==="PRIVILEGED_SUNDAY"&&(!isSunday||
    !/^tempora:pent[0-9]+-0$/i.test(observed[0].identity)||
    !c.clauses.includes("RG 108(a)")||!c.clauses.includes("RG 111(a)")))return Object.freeze([]);
  if(c.kind==="PRIVILEGED_ADVENT_FERIA"&&(isSunday||
    !/^tempora:adv[1-4]-[1-6]$/i.test(observed[0].identity)||
    !c.clauses.includes("RG 25(b)")||!c.clauses.includes("RG 108(e)")||
    !c.clauses.includes(c.principalClass===1?"RG 111(a)":"RG 111(c)")))return Object.freeze([]);
  let witness=null;
  try{
    const u=new URL(String(row.source||""));
    if(u.protocol==="https:"&&u.hostname==="gcatholic.org"&&
       u.pathname==="/calendar/2027/Extraordinary-en"&&!u.username&&!u.password)witness=u.href;
  }catch{/* Unverifiable external witness. */}
  if(!witness)return Object.freeze([]);
  return Object.freeze([Object.freeze({
    claimId:c.id,claimKind:"RESOLVED_1962_PRIVILEGED_COMMEMORATION",
    date:resolution.date,principalId:mainId,commemorationId:ownerId(observed[0].identity),
    properSourcePath:resolution.proper.data.sourcePath,
    classes:Object.freeze({principal:mainRank,commemoration:commRank}),
    clauses:Object.freeze([...c.clauses]),
    explanation:Object.freeze({en:c.en.trim(),fr:c.fr.trim()}),
    authorityKind:c.authorityKind,
    normativeUrl:GENERAL_RUBRICS_NORMATIVE_URL,
    referenceUrl:GENERAL_RUBRICS_ENGLISH_REFERENCE_URL,
    witnessKind:"DATED_2027_GENERAL_ROMAN_CALENDAR",witnessUrl:witness,
    automaticMassChange:false,formSpecificOrationDecision:"EXISTING_MASS_OWNER_ONLY"
  })]);
}
