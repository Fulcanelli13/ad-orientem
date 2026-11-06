// Source-owned Mass completeness assessment, independent of the host Proper.
// A resolved Proper is not a certificate: a separately attested Ordo must
// enumerate prescribed oration GROUPS (not arbitrary paragraph counts).
// A single group may contain multiple components under one conclusion.
// Unknown appointments stay UNASSESSED; they never become "verified".
import {properToReaderSlots} from "./proper-reader-slots.js";
import {composeProperReaderParagraphs} from "./proper-reader-composition.js";

export const MASS_ORDO_GROUPS=Object.freeze([
 Object.freeze({field:"collects",singular:"collect",slot:"COLLECT_SET",block:"AO.SM.B019"}),
 Object.freeze({field:"secrets",singular:"secret",slot:"SECRET_SET",block:"AO.SM.B040"}),
 Object.freeze({field:"postcommunions",singular:"postcommunion",slot:"POSTCOMMUNION_SET",block:"AO.SM.B088"}),
]);
const LANGS=Object.freeze(["lat","en","fr"]);
const nonempty=x=>typeof x==="string"&&x.trim().length>0;
const normalize=x=>String(x??"").replace(/\s+/gu," ").trim();
function unwrap(p){return p?.data&&typeof p.data==="object"?p.data:p;}
function rows(data,field,single){
 return Array.isArray(data?.[field]) ? data[field] :
  data?.[single] ? [data[single]] : [];
}
function fail(reason,details={}){
 return Object.freeze({status:"UNVERIFIED",reason,...details});
}
function groupCheck(data,contract,group){
 const required=contract.orations?.[group.field];
 if(!Array.isArray(required)||required.length<1)
  return fail("CONTRACT_MISSING_GROUP_"+group.field);
 const actual=rows(data,group.field,group.singular);
 if(actual.length!==required.length)
  return fail("ORATION_COUNT_"+group.field,{expected:required.length,actual:actual.length});
 for(let i=0;i<required.length;i++){
  const rule=required[i],row=actual[i];
  if(!rule||typeof rule!=="object")
   return fail("INVALID_CONTRACT_ROW_"+group.field+"_"+i);
  if(!row||LANGS.some(k=>!nonempty(row[k])))
   return fail("INCOMPLETE_TRILINGUAL_"+group.field+"_"+i);
  if(nonempty(rule.sourcePath)&&row.sourcePath!==rule.sourcePath)
   return fail("ORATION_SOURCE_ID_"+group.field+"_"+i);
  if(nonempty(rule.purpose)&&rule.purpose!=="PRINCIPAL"&&
     row.liturgicalPurpose!==rule.purpose)
   return fail("ORATION_PURPOSE_"+group.field+"_"+i);
  if(rule.text){
   if(LANGS.some(k=>!nonempty(rule.text[k])||
      normalize(row[k])!==normalize(rule.text[k])))
    return fail("ORATION_TEXT_CHANGED_"+group.field+"_"+i);
  }
 }
 return null;
}
export function assessMassOrdoCompleteness({proper,contract,
 date,form,celebrationId,votiveBasis}={}){
 if(!contract)return Object.freeze({status:"UNASSESSED",reason:"NO_VERIFIED_ORDO_CONTRACT"});
 if(!contract.sourceOrdo||!contract.sourcePath||!contract.date||
    !contract.orations||!contract.id)
  return fail("INVALID_SOURCE_ORDO_CONTRACT");
 if(date!==contract.date||form!==contract.form||
    celebrationId!==contract.celebrationId||
    votiveBasis!==contract.votiveBasis)
  return fail("MASS_SELECTION_CONTRACT_MISMATCH");
 const data=unwrap(proper);
 if(!data||data.sourcePath!==contract.sourcePath)
  return fail("MASS_PROPER_SOURCE_MISMATCH");
 for(const group of MASS_ORDO_GROUPS){
  const error=groupCheck(data,contract,group);
  if(error)return error;
 }
 const checks={};
 for(const language of ["en","fr"]){
  const slots=properToReaderSlots(data,{language});
  if(!slots.ready)return fail("READER_PROPER_NOT_READY_"+language,{missing:slots.missing});
  for(const group of MASS_ORDO_GROUPS){
   const item=slots.slots?.[group.slot];
   if(item?.status!=="READY")return fail("READER_SLOT_MISSING_"+language+"_"+group.slot);
   const paragraphs=item.data?.paragraphs??[];
   const unique=[...new Set(paragraphs.map(p=>p.orationGroupIndex).filter(Number.isInteger))];
   const expected=contract.orations[group.field].length;
   if(unique.length!==expected || unique.some((n,i)=>n!==i+1))
    return fail("READER_ORATION_GROUP_COUNT_"+language+"_"+group.slot,
      {expected,actual:unique.length});
   // Collect and Postcommunion require a separate Amen + Orémus before each
   // following independent oration group; Secrets do not acquire a public
   // invitation. Source-owned joined prayers remain within one group.
   if(group.block!=="AO.SM.B040"){
    const composed=composeProperReaderParagraphs(group.block,paragraphs,{
     language,form:contract.form});
    for(const role of ["ORATION_RESPONSE","ORATION_INVITATION"]){
     const count=composed.filter(p=>p.prayerRole===role).length;
     if(count!==expected-1)
      return fail("READER_ORATION_BOUNDARY_"+language+"_"+group.slot+"_"+role,
       {expected:expected-1,actual:count});
    }
   }
   checks[language+"."+group.field]=expected;
  }
 }
 return Object.freeze({status:"CERTIFIED",contractId:contract.id,
  date:contract.date,sourcePath:contract.sourcePath,
  sourceOrdo:contract.sourceOrdo,checks:Object.freeze(checks)});
}
export function requireMassOrdoCompleteness(input){
 const result=assessMassOrdoCompleteness(input);
 if(result.status==="UNVERIFIED")
  throw Error("MASS_ORDO_INCOMPLETE_"+result.reason);
 return result;
}
