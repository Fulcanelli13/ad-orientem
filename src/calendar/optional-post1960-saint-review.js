// This module is a conservative research/presentation gate for Cum sanctissima,
// NOT an Ordo, local authorisation, formulary selector, or liturgical certification.
// It must never edit the production 1962 DayResolver or its Proper.
export const OPTIONAL_SAINT_GATE_VERSION = "ao-cum-sanctissima-eligibility-review-v1";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const validISO = value => typeof value === "string" && ISO.test(value) &&
  !Number.isNaN(Date.parse(value + "T12:00:00Z")) &&
  new Date(value + "T12:00:00Z").toISOString().slice(0,10) === value;
const RANK = Object.freeze({ I:1, II:2, III:3, IV:4 });
function rankNumber(value) {
  if (Number.isInteger(value) && value>=1 && value<=4) return value;
  const s = String(value || "").trim().toUpperCase();
  if (/^[1-4]$/.test(s)) return Number(s);
  const m = /^(?:CLASS(?:IS)?[ .]*)?(IV|III|II|I)(?:[ .]*(?:CLASS(?:IS)?))?$/.exec(s);
  if (m) return RANK[m[1]];
  const n = /^(?:CLASS(?:IS)?[ .]*)?([1-4])(?:ST|ND|RD|TH)?[ .]*(?:CLASS|CLASSE|CLASSIS)$/.exec(s);
  return n ? Number(n[1]) : null;
}
const plainResult = (status, rationale, details={})=>Object.freeze({
  status,
  reason:rationale,
  ...details,
  actualCelebrantSelection:"UNKNOWN_NOT_INFERRED",
  formulariesSelected:false,
  changes1962Principal:false,
  modifiesCommemorations:false,
});
function verifiedProtectedAnnex(list) {
  return Array.isArray(list) && list.length===70 &&
    new Set(list.map(f=>f?.resolverIdentity)).size===70 &&
    list.every(f=>/^sancti:\d{2}-\d{2}(?:[a-z]+)?:3:[wr]$/.test(f?.resolverIdentity||"") &&
      f?.identityMatchStatus==="ATTESTED_IN_ARCHIVED_2024_2027_PRODUCTION_RESOLVER");
}
function protectedIdentityMatches(id, list) {
  if (!id || !Array.isArray(list)) return false;
  // Exact rank-bearing source identity, not calendar date or vernacular title.
  return list.some(f=>f?.resolverIdentity === id && f?.identityMatchStatus === "ATTESTED_IN_ARCHIVED_2024_2027_PRODUCTION_RESOLVER");
}
function universalObservanceForDate(person,date) {
  return (person?.observances || []).find(o=>
    o?.calendar==="CURRENT_ROMAN_GENERAL" &&
    o.monthDay===date.slice(5) &&
    Array.isArray(o.sourceIds) && o.sourceIds.length>0 &&
    (!o.publishedOn || (validISO(o.publishedOn) && o.publishedOn<=date))
  ) || null;
}
export function assessOptionalPost1960SaintCelebration({date,saint,observedDay,protectedFeasts}={}) {
  if (!validISO(date)) throw new TypeError("A real ISO date is required");
  if (!saint?.id || !saint.id.startsWith("saint.")) return plainResult("NOT_PERSON_RECORD","CANONIZATION_GROUP_NOT_PERSON");
  const recognized = saint?.recognition?.rank==="SAINT" || saint?.recognitionStatus==="CANONIZATION_ATTESTED_OFFICIAL_YEAR_INDEX";
  const recognitionSourced=Boolean(saint?.recognition?.sourceIds?.length || saint?.recognition?.sourceUrls?.length || saint?.sources?.length);
  if (!recognized || !recognitionSourced) return plainResult("INDETERMINATE","SAINTHOOD_RECOGNITION_OR_SOURCE_UNVERIFIED");
  const canonizedOn=saint?.recognition?.canonizedOn || saint?.canonizedOn || null;
  if (!validISO(canonizedOn)) return plainResult("INDETERMINATE","CANONIZATION_DATE_NOT_ATTESTED");
  if (canonizedOn <= "1960-07-26") return plainResult("OUT_OF_SCOPE","1962_BOOKS_OR_OTHER_NORMAL_RULES_APPLY");
  if (date < canonizedOn) return plainResult("INELIGIBLE","PERSON_NOT_YET_CANONIZED");
  if (date < "2020-03-19") return plainResult("OUT_OF_SCOPE","CUM_SANCTISSIMA_NOT_YET_IN_FORCE");
  const memorial=universalObservanceForDate(saint,date);
  if (!memorial) return plainResult("INDETERMINATE","UNIVERSAL_CHURCH_MEMORIAL_DATE_NOT_ESTABLISHED");
  const main=observedDay?.main || observedDay;
  const classRank=rankNumber(main?.rank);
  if (!classRank || !main?.id) return plainResult("INDETERMINATE","OBSERVED_1962_RANK_OR_SOURCE_ID_NOT_VERIFIED",{memorialDateAttested:true});
  if (classRank===1 || classRank===2) return plainResult("BLOCKED","CLASS_I_OR_II_DAY",{classRank,memorialDateAttested:true});
  if (!verifiedProtectedAnnex(protectedFeasts)) return plainResult("INDETERMINATE","PROTECTED_FEAST_REGISTER_NOT_COMPLETE",{classRank,memorialDateAttested:true});
  if (classRank===3 && protectedIdentityMatches(main.id,protectedFeasts))
    return plainResult("BLOCKED","PROTECTED_THIRD_CLASS_OBSERVANCE",{classRank,memorialDateAttested:true});
  if (classRank===3 || classRank===4)
    return plainResult("CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW","NO_CLASS_OR_PROTECTED_FEAST_BLOCKER_ESTABLISHED",{
      classRank,memorialDateAttested:true,possibleBasis:"CUM_SANCTISSIMA_2020",
      additionalReview:["JUST_CAUSE","DAY_TYPE_AND_VIGIL","LOCAL_OR_INSTITUTE_AUTHORISATION","OTHER_PRECEDENCE_AND_COMMEMORATION_RULES","APPROVED_TRADITIONAL_MASS_FORMULARY"]
    });
  return plainResult("INDETERMINATE","UNHANDLED_RANK");
}
