// Read-only, source-owned explanations for *resolved* 1962 Calendar claims.
// Never calculate precedence, replace the Mass resolver or promote a witness
// into a universal or local liturgical permission. Unmatched days show none.
import {canonical1962Commemorations} from "./traditional-day-adjudication.js";

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
