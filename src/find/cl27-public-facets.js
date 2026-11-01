// Public CL27 browsing over the existing physical-site Directory. Research
// taxonomy options are not source assertions. Never classify a whole venue
// from an institute badge, or from one programme's selected Masses.
export const PUBLIC_CL27_AXES=Object.freeze([
 ["institute_or_community","Institute / community","Institut / communauté","COMMUNITY / MINISTRY"],
 ["ecclesial_position","Ecclesial position","Position ecclésiale","COMMUNITY / MINISTRY"],
 ["una_cum","Una Cum","Una Cum","MINISTRY / CELEBRATION"],
 ["canonical_status","Canonical status","Statut canonique","COMMUNITY / MINISTRY"],
 ["liturgical_use","Liturgical use","Usage liturgique","MINISTRY / CELEBRATION"],
 ["missal_edition","Missal edition","Édition du missel","MINISTRY / CELEBRATION"],
 ["rubrical_basis","Rubrical basis","Base rubricale","MINISTRY / CELEBRATION"],
 ["organizer_role","Organizer role","Rôle de l’organisateur","ORGANIZER / MINISTRY"],
 ["venue_owner_type","Venue ownership","Propriété du lieu","VENUE"],
 ["celebrant_relationship","Celebrant relationship","Lien du célébrant","MINISTRY / CELEBRATION"],
 ["mass_type","Mass type","Type de messe","CELEBRATION"],
 ["schedule_and_location","Schedule verification","Vérification des horaires","VENUE / CELEBRATION"],
].map(([key,en,fr,scope])=>Object.freeze({key,en,fr,scope})));
const BY_KEY=new Map(PUBLIC_CL27_AXES.map(axis=>[axis.key,axis]));
const T=v=>String(v??"").toUpperCase();
function exactBooks(item){
 const c=item?.celebration_evidence;
 return c?.subject_scope==="NAMED_CELEBRATION_PATTERN_NOT_WHOLE_VENUE"&&
   c?.source_kind==="PARISH_FIRST_PARTY"&&
   c?.liturgical_use==="ROMAN"&&c?.missal_edition==="1962";
}
// Positive claims currently released: 2 explicit first-party celebrations.
// Raw ministry/community policy and loose directory hints are NOT approved.
export function publicCL27Value(item,key){
 if(key==="institute_or_community")return "SOURCE_LABEL_ONLY";
 if(!BY_KEY.has(key))return null;
 if(key==="liturgical_use"&&exactBooks(item))return "ROMAN";
 if(key==="missal_edition"&&exactBooks(item))return "1962";
 return "UNKNOWN";
}
export function validPublicCL27Selection(key,value){
 if(!BY_KEY.has(key)||key==="institute_or_community")return false;
 const allowed=(key==="liturgical_use"?["ALL","UNKNOWN","ROMAN"]:
   key==="missal_edition"?["ALL","UNKNOWN","1962"]:["ALL","UNKNOWN"]);
 return allowed.includes(T(value));
}
export function matchesPublicCL27Facets(item,facets={}){
 if(!facets||typeof facets!=="object"||Array.isArray(facets))return false;
 for(const [key,value] of Object.entries(facets)){
  if(!validPublicCL27Selection(key,value))return false;
  if(T(value)!=="ALL"&&publicCL27Value(item,key)!==T(value))return false;
 }
 return true;
}
export function publicCL27FacetCounts(items=[]){
 const list=Array.isArray(items)?items:[];
 const result={};
 for(const axis of PUBLIC_CL27_AXES){
  if(axis.key==="institute_or_community")continue;
  const counts={ALL:list.length,UNKNOWN:0};
  for(const item of list){
   const value=publicCL27Value(item,axis.key);
   counts[value]=(counts[value]??0)+1;
  }
  result[axis.key]=Object.freeze(counts);
 }
 return Object.freeze(result);
}
