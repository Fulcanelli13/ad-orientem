// Provenance-gated classification for traditional Latin liturgies.
// A church building, organizing lay association and Mass celebrant are not
// interchangeable subjects. Unknown is a valid and important conclusion.
const ENUMS=Object.freeze({
 liturgical_use:["ROMAN","DOMINICAN","CARMELITE","PREMONSTRATENSIAN","OTHER_LATIN_USAGE","UNKNOWN"],
 missal_edition:["1962","PRE_1955","1955_REFORMED","MIXED_OR_LOCAL","UNKNOWN"],
 rubrical_basis:["1960","PRE_1955","1955","MIXED_OR_LOCAL","UNKNOWN"],
 una_cum:["YES","NO","VARIES_BY_CELEBRANT","VARIES_BY_OCCASION","DISPUTED","UNKNOWN"],
 recognises_current_pontiff:["YES","NO","DISPUTED","UNKNOWN"],
 ecclesial_position:["ROMAN_PONTIFF_RECOGNISED","SEDEVACANTIST","SEDEPRIVATIONIST","OTHER_POSITION","UNKNOWN"],
 organizer_role:["LAY_ASSOCIATION","DIOCESAN_MINISTRY","PRIESTLY_INSTITUTE","PRIESTLY_SOCIETY","RELIGIOUS_COMMUNITY","INDEPENDENT_CLERGY","SHARED","UNKNOWN"],
 venue_owner_type:["DIOCESE_PARISH","RELIGIOUS_INSTITUTE","LAY_ASSOCIATION","PRIVATE_PERSON","OTHER","UNKNOWN"],
 celebrant_relationship:["OPERATED_BY","SERVED_BY","HOSTED_BY","OCCASIONAL_VISIT","SHARED_USE","UNKNOWN"],
 canonical_status:["UNKNOWN","DATED_AUTHORITY_ASSERTION"],
});
const SCOPE=Object.freeze({
 liturgical_use:["MINISTRY","CELEBRATION"],
 missal_edition:["MINISTRY","CELEBRATION"],
 rubrical_basis:["MINISTRY","CELEBRATION"],
 una_cum:["MINISTRY","CELEBRATION"],
 recognises_current_pontiff:["MINISTRY","COMMUNITY","CELEBRATION"],
 ecclesial_position:["MINISTRY","COMMUNITY"],
 organizer_role:["ORGANIZER","MINISTRY"],
 venue_owner_type:["VENUE"],
 celebrant_relationship:["MINISTRY","CELEBRATION"],
 canonical_status:["MINISTRY","COMMUNITY"],
});
const ALLOWED_SOURCE_TYPES=new Set(["HOLY_SEE_OFFICIAL","DIOCESE_OFFICIAL","COMMUNITY_OFFICIAL","PARISH_OFFICIAL","OFFICIAL_BULLETIN","NATIONAL_ASSOCIATION","SECONDARY_DIRECTORY","USER_SUBMISSION"]);
const txt=v=>String(v??"").trim();
const list=v=>Array.isArray(v)?v:[];
const isDay=v=>/^20\d{2}-\d{2}-\d{2}$/.test(txt(v))&&!Number.isNaN(Date.parse(txt(v)+"T00:00:00Z"));
export const DIRECTORY_CLASSIFICATION_FIELDS=ENUMS;
export function unknownResearchClassification({source_label=""}={}){
 return Object.freeze({
   liturgical_use:"UNKNOWN",missal_edition:"UNKNOWN",rubrical_basis:"UNKNOWN",
   una_cum:"UNKNOWN",recognises_current_pontiff:"UNKNOWN",ecclesial_position:"UNKNOWN",
   organizer_role:"UNKNOWN",venue_owner_type:"UNKNOWN",celebrant_relationship:"UNKNOWN",
   canonical_status:"UNKNOWN",
   community_label_as_listed:txt(source_label)||null,
   community_label_state:txt(source_label)?"SOURCE_TEXT_ONLY":"UNKNOWN",
   celebrant_id:null,lay_organizer_id:null,
   evidence_assertions:Object.freeze([]),
   release_status:"NO_CLASSIFICATION_FILTER_UNTIL_EVIDENCED",
 });
}
/**
 * One immutable sourced *assertion*; no claim is a blanket building attribute.
 * Unreviewed source text remains unreviewed even when the organization looks
 * like a recognizable FSSP, SSPX, ICKSP, CMRI, diocesan or Una Voce label.
 */
export function validateClassificationAssertion(claim){
 if(!claim||typeof claim!=="object")throw new Error("Classification claim required");
 const field=txt(claim.field),subjectType=txt(claim.subject_type);
 if(!ENUMS[field]||!ENUMS[field].includes(txt(claim.value)))
   throw new Error("Unsupported classification field or value: "+field);
 if(!SCOPE[field].includes(subjectType))throw new Error("Invalid classification subject for "+field);
 if(!txt(claim.subject_id))throw new Error("Classification subject_id required");
 if(claim.value!=="UNKNOWN"){
   if(!list(claim.source_ids).length||!list(claim.source_ids).every(id=>typeof id==="string"&&id.trim()))
     throw new Error("Non-UNKNOWN classification requires exact evidence source IDs");
   if(!isDay(claim.recorded_at))throw new Error("Non-UNKNOWN classification requires a dated source assertion");
   if(!ALLOWED_SOURCE_TYPES.has(claim.source_type))throw new Error("Non-UNKNOWN classification requires source type");
 }
 return Object.freeze({
  field,value:txt(claim.value),subject_type:subjectType,subject_id:txt(claim.subject_id),
  source_ids:Object.freeze(list(claim.source_ids).map(txt)),
  source_type:ALLOWED_SOURCE_TYPES.has(claim.source_type)?claim.source_type:null,
  recorded_at:isDay(claim.recorded_at)?claim.recorded_at:null,
  evidence_maturity:txt(claim.evidence_maturity)||"SOURCE_REPORTED_UNREVIEWED",
  // An assertion being present does not mean the source claim is accepted.
  reviewed:claim.evidence_maturity==="DIRECT_WITNESS_REVIEWED",
 });
}
