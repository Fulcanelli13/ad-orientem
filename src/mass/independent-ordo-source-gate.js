// An INDEPENDENT editorial Ordo expectation is a prerequisite for declaring
// a particular Mass complete. Unlike sourceOrdoExpectation in the compiled
// Proper, this contract must be transcribed from an external dated authority,
// with separate rubrical and text review. This module never adds Mass prayers.
import {review1962OrationLimits} from "./1962-oration-limit-review.js";
const FIELDS=Object.freeze(["collects","secrets","postcommunions"]);
const LANGS=Object.freeze(["lat","en","fr"]);
const hold=(reason,details={})=>Object.freeze({
 status:"HOLD",mayPublishAsVerified:false,reason,...details
});
const goodText=x=>typeof x==="string"&&x.trim().length>0;
export function assessIndependentOrdoSourceClaim({
 expectation,communityId,date,form,proper,
}={}){
 if(!expectation)return hold("NO_INDEPENDENT_DATED_ORDO");
 if(communityId!=="ICRSP_FRANCE_PARTICULAR_ORDO")
  return Object.freeze({status:"OUT_OF_SCOPE",mayPublishAsVerified:false});
 if(date!==expectation.date)return hold("SOURCE_DATE_MISMATCH");
 if(!["LOW","MISSA_CANTATA_SIMPLE","SOLEMN"].includes(form))
  return hold("MASS_FORM_UNSELECTED_OR_UNSUPPORTED");
 const required=expectation.sourceClaim?.sourceOrder;
 if(!Array.isArray(required)||required[0]!=="PRINCIPAL"||
  required.at(-1)!=="ORATIO_PRO_PAPA"||
  !goodText(expectation.officialOrdoUrl)||
  !expectation.officialOrdoUrl.includes(date))
  return hold("INDEPENDENT_ORDO_EXPECTATION_INVALID");
 if(!proper)return hold("LOCAL_INSTITUTE_MASS_NOT_ASSEMBLED",{
  expectedOrations:required.length
 });
 const data=proper?.data??proper;
 for(const field of FIELDS){
  const rows=Array.isArray(data?.[field])?data[field]:[];
  const expected=expectation.sourceClaim?.[
   {collects:"expectedCollectCount",secrets:"expectedSecretCount",
    postcommunions:"expectedPostcommunionCount"}[field]
  ];
  if(rows.length!==expected||expected!==required.length)
   return hold("SOURCE_VS_READER_COUNT_"+field,{
    expected:required.length,actual:rows.length
   });
  for(let i=0;i<required.length;i++){
   const row=rows[i];
   const claimed=i===0?"PRINCIPAL":
    row?.ordoOrationId??row?.liturgicalPurpose??null;
   if(required[i]!==claimed)
    return hold("SOURCE_VS_READER_ORDER_"+field+"_"+i,{
     expected:required[i],actual:claimed
    });
   if(LANGS.some(lang=>!goodText(row?.[lang])))
    return hold("MISSING_PRAYER_TEXT_"+field+"_"+i);
   if(i>0&&!goodText(row.sourcePath))
    return hold("ADDITIONAL_PRAYER_SOURCE_MISSING_"+field+"_"+i);
  }
 }
 // A published three-oration claim is not automatically a lawful
 // three-orations Mass. Check the independent 1960/1962 capacity first.
 const rubric=review1962OrationLimits({expectation,form});
 if(rubric.status==="RUBRICAL_HOLD")
  return hold(rubric.reason,{rubric:rubric.rubric??null,
   sourceClaimedGroups:rubric.sourceClaimedGroups,
   rubricalConflict:true});
 const review=expectation.independentRubricalReview??{};
 if(review.status!=="AUTHORIZED"||!goodText(review.permissionOrPrivilegeEvidenceUrl))
  return hold("RUBRICAL_AUTHORITY_NOT_YET_VERIFIED",{
   flags:review.rubricFlags??[]
  });
 const editorial=expectation.editorialState??{};
 if(!editorial.principalSourceTextMatched||!editorial.additionalTextsMatched||
  !editorial.readerVerified||
  (required.length===3&&!editorial.commemorationTextsMatched))
  return hold("INDEPENDENT_SOURCE_TEXTS_OR_READER_NOT_VERIFIED");
 if(!Array.isArray(editorial.certifiedForms)||!editorial.certifiedForms.includes(form))
  return hold("MASS_FORM_NOT_CERTIFIED");
 return Object.freeze({status:"CERTIFIED",mayPublishAsVerified:true,
  date,form,expectedOrations:required.length});
}
