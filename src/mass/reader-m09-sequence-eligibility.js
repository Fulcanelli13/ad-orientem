// M09 secondary research: sequences under Missale Romanum 1962 §§399,470.
// This does NOT assign a live Sequence from a calendar date or season label.
// The Mass's ACTUAL selected 1962 Proper must supply authenticated evidence.
const freeze=Object.freeze;
const SCORES=freeze({
 VICTIMAE_PASCHALI:1086,VENI_SANCTE_SPIRITUS:68,
 LAUDA_SION:308,DIES_IRAE:1198,STABAT_MATER:681
});
const owner="1962_PROPER_RESOLVER";
const SOURCE_PATH=/^(?:Tempora|Sancti)\/[A-Za-z0-9-]+$/;
export const M09_SEQUENCE_RUBRIC_SOURCE=freeze({
 edition:"MISSAL_ROMANUM_1962",rubrics:freeze([399,469,470]),
 url:"https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html"
});
function answer(status,reason,scoreId=null,placement=null,obligation=null){
 return freeze({
  schema:"ao-mass-m09-sequence-rubric-v1",status,reason,scoreId,
  placement,obligation,source:M09_SEQUENCE_RUBRIC_SOURCE,
  sourceCandidateOnly:true,musicalFacsimileApproved:false,
  renderedScoreAllowed:false,editorialApproved:false,
  predictedChoirActivity:false
 });
}
export function resolveM09SequenceSourceRule({
 actualMass=null,sequenceWitness=null,preGospel=null
}={}){
 const kind=String(actualMass?.kind??"").toUpperCase();
 if(actualMass?.verified!==true||actualMass?.sourceOwner!==owner||
    !SOURCE_PATH.test(String(actualMass?.sourcePath??""))||
    !["CALENDAR","VOTIVE","REQUIEM"].includes(kind))
  return answer("HOLD","ACTUAL_SELECTED_1962_MASS_PROOF_REQUIRED");
 // 1962 §470 explicitly excludes a Sequence from votive Masses, even when
 // an occurring feast would otherwise have one.
 if(kind==="VOTIVE")return answer("EXCLUDED","1962_470_VOTIVE_MASS");
 const key=sequenceWitness?.sequenceKey;
 const publishedId=SCORES[key];
 if(!publishedId||!sequenceWitness||
   sequenceWitness.verified!==true||
   sequenceWitness.sourceOwner!==owner||
   sequenceWitness.sourcePath!==actualMass.sourcePath||
   sequenceWitness.sourceId!==publishedId||
   sequenceWitness.sourceRole!=="SEQUENTIA")
   return answer("HOLD","EXACT_SELECTED_PROPER_SEQUENCE_SOURCE_REQUIRED");
 if(kind==="REQUIEM"&&key!=="DIES_IRAE")
  return answer("EXCLUDED","MASS_OF_DEAD_DIFFERENT_SEQUENCE");
 if(kind==="CALENDAR"&&key==="DIES_IRAE")
  return answer("HOLD","DIES_IRAE_REQUIEM_IDENTITY_REQUIRED");
 let obligation="SOURCE_SELECTED_PROPER_REQUIRED";
 if(key==="DIES_IRAE"){
  const cls=actualMass.requiemClass;
  if(![1,2,3,4].includes(cls))
   return answer("HOLD","CLASS_OF_ACTUAL_REQUIEM_UNVERIFIED");
  // 1962 §399 special rule for three All Souls Masses said without
  // interruption, especially additional Low Masses; source details and
  // actual sung/low ceremony must be obtained before declaring mandatory.
  if(actualMass.allSoulsThreeConsecutive===true)
   return answer("HOLD","399_ALL_SOULS_THREE_MASSES_EXCEPTION_REQUIRES_CEREMONY");
  obligation=cls===1?"MANDATORY_1962_399_A":"OPTIONAL_1962_399_B";
 }
 if(preGospel?.sourceVerified!==true||
    preGospel?.sourcePath!==actualMass.sourcePath||
    preGospel?.sourceOwner!==owner)
   return answer("HOLD","SELECTED_1962_PRE_GOSPEL_SOURCE_REQUIRED");
 const hasTract=preGospel.hasTract===true;
 const hasLastAlleluia=preGospel.hasLastAlleluia===true;
 if(hasTract===hasLastAlleluia)
  return answer("HOLD","PRE_GOSPEL_ALLELUIA_TRACT_BOUNDARY_AMBIGUOUS");
 const placement=hasTract?"AFTER_TRACT":"BEFORE_LAST_ALLELUIA";
 return answer("SOURCE_ELIGIBLE_NOT_MUSIC_APPROVED",
    "1962_470_SOURCE_SELECTED_SEQUENCE",publishedId,placement,obligation);
}
export function M09SequenceForLive(){return null}
