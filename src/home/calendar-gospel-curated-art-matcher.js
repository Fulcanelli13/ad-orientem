/* Evidence-only reconciliation of pre-existing curated artwork relations.
 * Human image approval and relevant scriptural/date association are different
 * checks. This module NEVER selects, publishes or replaces a Home painting.
 */
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const normalize=value=>String(value??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replaceAll("–","-").replaceAll("—","-")
  .replace(/\s+/g," ").trim().toLowerCase();

function verseRange(text){
 const source=normalize(text);
 const m=/^((?:[1-3]\s*)?[a-z][a-z\s]*?)\s+(\d+):(\d+)(?:\s*-\s*(\d+))?$/.exec(source);
 if(!m)return null;
 return {book:m[1].replace(/\s+/g,""),chapter:Number(m[2]),
  start:Number(m[3]),end:Number(m[4]??m[3])};
}
/* Same-book same-chapter verse overlap is useful for *screening* the claim,
 * but not proof that a painting portrays the specific episode. */
export function gospelCitationOverlap(a,b){
 if(!a||!b)return "NO_CITATION";
 if(normalize(a)===normalize(b))return "EXACT_CITATION";
 const x=verseRange(a),y=verseRange(b);
 if(!x||!y)return "CITATION_NOT_COMPARABLE";
 if(x.book!==y.book||x.chapter!==y.chapter||x.end<y.start||y.end<x.start)
  return "DIFFERENT_PASSAGE";
 return "OVERLAPPING_VERSES_NOT_SCENE_PROOF";
}

export function curatedDateArtworkAssessment(evidence,relation){
 const date=evidence?.date,principalId=evidence?.principalId;
 if(!DATE.test(String(date??""))||!principalId||relation?.date!==date)
   return Object.freeze({status:"UNRESOLVED_OR_WRONG_DATE",citationFit:null,
     artworkId:relation?.artworkId??null,publishable:false});
 if(relation.sourceObservedPrincipalId!==principalId)
   return Object.freeze({status:"WRONG_OBSERVED_PRINCIPAL",citationFit:null,
     artworkId:relation.artworkId,publishable:false});
 const wantsGospel=relation.role==="GOSPEL_SCENE"||relation.role==="GOSPEL_ONLY";
 const actual=evidence?.gospel?.status==="VERIFIED_FROM_SELECTED_PROPER"
   ?evidence.gospel.reference:null;
 const cited=relation.claimedGospelForDate;
 const fit=actual&&cited?gospelCitationOverlap(actual,cited):"NO_VERIFIED_COMPARABLE_CITATION";
 const gospelMatch=fit==="EXACT_CITATION"||fit==="OVERLAPPING_VERSES_NOT_SCENE_PROOF";
 let status;
 if(wantsGospel){
   status=!actual?"GOSPEL_SOURCE_UNRESOLVED":
     gospelMatch?"GOSPEL_PASSAGE_MATCH_MEDIA_AND_SCENE_REVIEW_REQUIRED":
     "CLAIMED_GOSPEL_NOT_MATCHED";
 }else if(relation.relationClass==="FEAST_SAINT_IDENTITY"){
   status="FEAST_PRINCIPAL_ID_MATCH_MEDIA_REVIEW_REQUIRED";
 }else if(relation.relationClass==="FEAST_ICONOGRAPHY_NOT_GOSPEL"||
          relation.relationClass==="LITURGICAL_MYSTERY_NOT_NECESSARILY_GOSPEL"){
   status="FEAST_ICONOGRAPHY_MEDIA_REVIEW_REQUIRED";
 }else {
   status="SECONDARY_CONTEXT_ONLY_MEDIA_REVIEW_REQUIRED";
 }
 return Object.freeze({
   artworkId:relation.artworkId,date,role:relation.role,
   relationClass:relation.relationClass,
   sourceEditorialStatus:relation.sourceEditorialStatus,
   status,citationFit:fit,claimedGospel:cited??null,actualGospel:actual,
   sourceImageKeyPresent:Boolean(relation.selectedImageKey),
   artworkOriginalRightsCropVerified:false,
   productionRenderedVerified:false,publishable:false
 });
}

export function assessDailyCuratedArt(evidence,relations=[]){
 const rows=relations.filter(x=>x.date===evidence?.date)
   .map(x=>curatedDateArtworkAssessment(evidence,x));
 const count=status=>rows.filter(x=>x.status===status).length;
 return Object.freeze({
   date:evidence?.date??null,
   candidates:rows,
   totals:{
     proposals:rows.length,
     observedPrincipalMatches:rows.filter(x=>x.status!=="WRONG_OBSERVED_PRINCIPAL"&&
       x.status!=="UNRESOLVED_OR_WRONG_DATE").length,
     gospelPassageScreened:count("GOSPEL_PASSAGE_MATCH_MEDIA_AND_SCENE_REVIEW_REQUIRED"),
     gospelPassageDisagreements:count("CLAIMED_GOSPEL_NOT_MATCHED"),
     gospelSourceUnresolved:count("GOSPEL_SOURCE_UNRESOLVED"),
     sourceImageRightsCropCertified:0,
     actuallyPublishedHere:0
   }
 });
}
