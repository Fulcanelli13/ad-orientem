/**
 * Native sung-Vespers publication gate. No external score URLs, no incomplete
 * music toggle, no automatic inference from a Sunday Mass calendar winner.
 * This module never renders GABC; it validates a proposed local score bundle.
 */
import {DIVINUM_OFFICIUM_OFFICE_PIN} from "./generator-probe-contract.js";

export const SUNDAY_VESPERS_SLOTS=Object.freeze([
  "opening",
  "antiphon-1","psalm-tone-1",
  "antiphon-2","psalm-tone-2",
  "antiphon-3","psalm-tone-3",
  "antiphon-4","psalm-tone-4",
  "antiphon-5","psalm-tone-5",
  "chapter-tone","hymn","versicle",
  "magnificat-antiphon","magnificat-tone",
  "collect-tone","dismissal",
]);

const isoDay=s=>{
  if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
  const date=new Date(s+"T12:00:00Z");
  return Number.isFinite(date.valueOf())&&date.toISOString().slice(0,10)===s?date:null;
};
function followingDay(date){
  const d=isoDay(date);
  if(!d)return null;
  d.setUTCDate(d.getUTCDate()+1);
  return d.toISOString().slice(0,10);
}
export function identifySundayVespers({date,part,sundayDate}={}){
  const d=isoDay(date),s=isoDay(sundayDate);
  if(!d||!s||s.getUTCDay()!==0)return {valid:false,reason:"NOT_A_SUNDAY"};
  if(part==="FIRST"&&d.getUTCDay()===6&&followingDay(date)===sundayDate)
    return {valid:true,part,sundayDate,officeDate:date};
  if(part==="SECOND"&&date===sundayDate)
    return {valid:true,part,sundayDate,officeDate:date};
  return {valid:false,reason:"OFFICE_DAY_OR_PART_MISMATCH"};
}
const localAsset=p=>typeof p==="string"&&/^data\/office\/chant\/[a-z0-9/_-]+\.gabc$/.test(p)&&!p.includes("..");
const sha256=s=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
const witness=s=>typeof s==="string"&&s.trim().length>=8;

/**
 * A potential release requires separately certified text, correct Office
 * precedence, independently collated music and exact local slot coverage.
 * A source inventory or candidate compilation by itself NEVER meets it.
 */
export function auditNativeSungVespers({office,precedence,chant}={}){
  const issues=[];
  const reject=(cond,code)=>{if(!cond)issues.push(code)};
  reject(office?.schema==="ao.office.source-cells.v1","OFFICE_SCHEMA");
  reject(office?.language==="la"&&office?.hour==="VESPERS","OFFICE_KIND");
  reject(office?.sourceRevision===DIVINUM_OFFICIUM_OFFICE_PIN,"SOURCE_PIN");
  reject(office?.status==="CERTIFIED"&&office?.publishable===true&&
    office?.verification?.structural===true&&office?.verification?.rubrical===true&&
    office?.verification?.independentPrintedBreviary===true,"OFFICE_TEXT_UNCERTIFIED");
  reject(Array.isArray(office?.sections)&&office.sections.length>=9,"OFFICE_SECTIONS");
  const day=identifySundayVespers({date:office?.date,part:precedence?.part,sundayDate:precedence?.sundayDate});
  reject(day.valid,"SUNDAY_IDENTITY");
  reject(precedence?.officeDate===office?.date&&precedence?.verified===true&&
    precedence?.sourceCalendar==="ROMAN_1960"&&
    Array.isArray(precedence?.printedWitnesses)&&precedence.printedWitnesses.length>=1 &&
    precedence.printedWitnesses.every(witness) &&
    precedence?.commemorationsChecked===true,"OFFICE_PRECEDENCE_UNVERIFIED");
  reject(chant?.schema==="ao.office.sung-vespers.scores.v1"&&
    chant?.date===office?.date&&chant?.sundayDate===precedence?.sundayDate&&
    chant?.part===precedence?.part,"CHANT_CONTEXT");
  reject(chant?.isNative===true&&chant?.requiresExternalVisit===false,"NO_NATIVE_SCORE_BUNDLE");
  reject(chant?.sourceWitnessConfirmed===true&&chant?.complete1960RubricCoverage===true&&
    chant?.textMusicAlignmentVerified===true,"MUSIC_NOT_COLLATED");
  reject(Array.isArray(chant?.additionalCommemorationSlots)&&
    Number.isInteger(precedence?.expectedCommemorationChants)&&
    precedence.expectedCommemorationChants>=0&&
    chant?.additionalCommemorationSlots.length===precedence?.expectedCommemorationChants,
    "COMMEMORATION_MUSIC_UNVERIFIED");

  const slots=chant?.slots;
  reject(Array.isArray(slots),"CHANT_SLOTS_MISSING");
  const required=new Set(SUNDAY_VESPERS_SLOTS);
  const ids=new Set();
  if(Array.isArray(slots)){
    for(const s of slots){
      if(!s||typeof s.id!=="string"||ids.has(s.id)){issues.push("DUPLICATE_OR_MISSING_SLOT");continue}
      ids.add(s.id);
      reject(required.has(s.id),"UNEXPECTED_SLOT");
      reject(localAsset(s.path),"NONLOCAL_SCORE");
      reject(sha256(s.sha256),"SCORE_CHECKSUM_MISSING");
      reject(s.copyright==="CC0"&&s.rightsReviewed===true,"SCORE_RIGHTS_UNVERIFIED");
      reject(s.musicTextVerified===true&&s.svgRenderVerified===true,"SCORE_UNVERIFIED");
      reject(witness(s.provenance)&&witness(s.scoreEdition),"SCORE_PROVENANCE");
    }
  }
  for(const id of required)reject(ids.has(id),"MISSING_"+id.toUpperCase().replaceAll("-","_"));
  return Object.freeze({schema:"ao.office.sung-vespers.release-gate.v1",
    eligible:issues.length===0, buttonVisible:issues.length===0,
    sundayDate:precedence?.sundayDate??null,part:precedence?.part??null,
    requiredSlotCount:required.size,providedSlotCount:ids.size,
    issues:Object.freeze([...new Set(issues)])});
}
