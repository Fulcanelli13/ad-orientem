// Strict promotion policy for the offline GregoBase 1961 research archive.
// Discovery is not editorial approval and no caller imports the research rows
// into the native reader automatically.
import {createHash} from "node:crypto";
export const GR1961_PROMOTION_SCHEMA="ao-gr1961-score-promotion-v1";
export const GR1961_PROMOTION_GATES=Object.freeze([
  "CANONICAL_1962_PROPER_SLOT",
  "EXACT_LATIN_SOURCE_TEXT",
  "1961_PRINTED_EDITION_PAGE",
  "GABC_MUSICAL_FACSIMILE_REVIEW",
  "DETERMINISTIC_SOURCE_IDENTITY",
  "CHOIR_PROGRAMME_DISTINGUISHED",
]);
const sha256=text=>createHash("sha256").update(text).digest("hex");
const ALL=new Set(GR1961_PROMOTION_GATES);
export function assessGraduale1961Promotion(item,{
  evidence=null,approved=null,sourceIndex=null,
}={}){
  const failures=[];
  if(sourceIndex?.schema!=="ao-gregobase-graduale1961-research-index-v1" ||
    sourceIndex?.status!=="RESEARCH_ONLY_NOT_MASS_READER")
    failures.push("PINNED_RESEARCH_INDEX_REQUIRED");
  if(!item||!Number.isInteger(item.gregobaseId)||
    item.id!=="GREGOBASE-"+item.gregobaseId||
    item.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED")
    failures.push("SOURCE_RECORD_NOT_STAGED");
  if(!item?.gabc?.includes("%%")||sha256(item.gabc)!==item?.sha256)
    failures.push("GABC_INTEGRITY");
  if(!item?.gradualeRomanum1961Page||item?.sourceEditionId!==2)
    failures.push("1961_EDITION_WITNESS");
  if(!evidence||evidence.gregobaseId!==item?.gregobaseId ||
    evidence.sourceGabcSha256!==item?.sha256 ||
    evidence.reviewStatus!=="APPROVED")
    failures.push("HUMAN_REVIEW_REQUIRED");
  const gates=evidence?.gates??{};
  for(const gate of ALL){
    const value=gates[gate];
    if(value?.status!=="PASS" || !value?.reviewer || !value?.evidenceUri)
      failures.push("MISSING_REVIEW_"+gate);
  }
  if(!approved || approved.gregobaseId!==item?.gregobaseId ||
    approved.gabcSha256!==item?.sha256 || approved.status!=="EDITORIALLY_APPROVED")
    failures.push("EXPLICIT_PROMOTION_MANIFEST_REQUIRED");
  if(sourceIndex?.exceptions?.some(x=>x.gregobaseId===item?.gregobaseId))
    failures.push("QUARANTINED_RECORD");
  return Object.freeze({
    schema:GR1961_PROMOTION_SCHEMA,id:item?.id??null,
    approved:failures.length===0,
    status:failures.length===0?"ELIGIBLE_FOR_EXPLICIT_RELEASE":"RESEARCH_ONLY",
    failures:Object.freeze(failures),
  });
}
export function candidatePromotionQueue({index,records,reviewed=[],manifest=[]}={}){
  const evidence=new Map(reviewed.map(x=>[x.gregobaseId,x]));
  const approvals=new Map(manifest.map(x=>[x.gregobaseId,x]));
  const results=(records??[]).map(item=>assessGraduale1961Promotion(item,{
    sourceIndex:index,evidence:evidence.get(item.gregobaseId),
    approved:approvals.get(item.gregobaseId),
  }));
  return Object.freeze({
    screened:results.length,
    eligible:results.filter(x=>x.approved).length,
    withheld:results.filter(x=>!x.approved).length,
    entries:Object.freeze(results),
  });
}
