// M05 — score acquisition quality checks against the existing 1962 text.
// This has NO production import. The CC0 GABCs are research candidates until
// printed facsimile, textual / musical editorial review and explicit approval.
// Source data: data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json
const freeze=Object.freeze;
const HEADERS="%%";
function norm(value){
 return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replaceAll(/æ/gi,"ae").replaceAll(/œ/gi,"oe")
  .toLowerCase().replaceAll("j","i").replace(/[^a-z0-9]/g,"");
}
export function canonicalChantComparisonText(value){return norm(value)}
/** Only extract words and printed (::) phrase boundaries.
 * Never interpret this as pitch/rhythm, full-score certification or
 * permission to adapt music to a different celebration.
 */
export function researchGabcPhrases(gabc){
 const raw=String(gabc??"");
 const split=raw.indexOf(HEADERS);
 if(split<0)return freeze([]);
 const body=raw.slice(split+HEADERS.length);
 return freeze(body.split(/\(\s*::\s*\)/).map(part=>norm(
  part.replace(/<i>[^<]*<\/i>/gi,"")
   .replace(/<sp>\s*[VR]\/\s*<\/sp>/gi,"")
   .replace(/<[^>]*>/g,"").replace(/\([^)]*\)/g,"")
   .replace(/[{}]/g,"").replaceAll("~~~","").replaceAll("~~","")
 )).filter(Boolean));
}
function candidate(id,kind,groups,coverage){
 return freeze({id,kind,groups:freeze(groups.map(g=>freeze(g))),
  coverage,approved:false,scoreUsable:false});
}
const refs=freeze({
 PREFACE_SOLEMN:candidate("PREFACE_SOLEMN","PREFACE",[
  {leader:[137],response:[138],pieces:[2,3]},
  {leader:[139],response:[140],pieces:[4,5]},
  {leader:[141,142],response:[143],pieces:[6,7]}
 ],"THREE_FULL_DIALOGUE_PAIRS_WITH_ADDITIONAL_PER_OMNIA_AMEN"),
 PREFACE_FERIAL:candidate("PREFACE_FERIAL","PREFACE",[
  {leader:[137],response:[138],pieces:[2,3]},
  {leader:[139],response:[140],pieces:[4,5]},
  {leader:[141,142],response:[143],pieces:[6,7]}
 ],"THREE_FULL_DIALOGUE_PAIRS_WITH_ADDITIONAL_PER_OMNIA_AMEN"),
 ORATIONS_FESTIVE:candidate("ORATIONS_FESTIVE","ORATION_GREETING",[
  {leader:[70],response:[71],pieces:[0,1]},
  {leader:[251],response:[252],pieces:[0,1]},
 ],"GREETING_RESPONSE_ONLY_NO_FULL_ORATION_MELODY"),
 PATERNOSTER_COMMON:candidate("PATERNOSTER_COMMON","PATERNOSTER",[
  {leader:[209],response:[210],pieces:[2,3],leaderSuffix:"Et ne nos indúcas in tentatiónem"}
 ],"CONCLUSION_AND_RESPONSE_ONLY_NO_COMPLETE_PATERNOSTER_SCORE"),
 ASPERGES_NORMAL:candidate("ASPERGES_NORMAL","ASPERGES",[],"ANTIPHON_PSALM_GLORIA_PATRI"),
 ASPERGES_PASCHAL:candidate("ASPERGES_PASCHAL","ASPERGES",[],"ANTIPHON_PSALM_GLORIA_PATRI"),
 DISMISSAL_ITE_I:candidate("DISMISSAL_ITE_I","DISMISSAL",[],"PASCHAL_DOUBLE_ALLELUIA_CANDIDATE_NOT_ORDINARY_ITE")
});
export const M05_SCORE_PARITY_SPECS=refs;
const cue=n=>"AO.SM.C"+String(n).padStart(4,"0");
function expectedFor(group,side,cueById){
 if(side==="leader"&&group.leaderSuffix)return norm(group.leaderSuffix);
 return norm(group[side].map(n=>cueById.get(cue(n))??"").join(" "));
}
function sameOrContained(actual,expected,allowSuffix=false){
 return !!actual&&!!expected&&(actual===expected||(allowSuffix&&actual.includes(expected)));
}
export function auditM05GabcRecord({record,cueById=new Map(),aspergesFormulas=null}={}){
 const descriptor=refs[record?.id];
 if(!descriptor)return freeze({status:"UNSUPPORTED_RESEARCH_ID"});
 if(!record?.gabc||!record?.gabcUrl?.includes("id="+record.sourceId)||
    !record?.sourceFolio?.includes("1961")||
    record?.renderApproved!==false||record?.editorialApproval!=="PENDING_USER_FINAL_COLLECTION_REVIEW")
   return freeze({status:"MALFORMED_SOURCE_OR_APPROVAL_GATE"});
 const parts=researchGabcPhrases(record.gabc);
 let matched=0,expectedCount=0;
 if(descriptor.kind==="PREFACE"&&parts.length!==8)
  return freeze({status:"PREFACE_EIGHT_PRINTED_PHRASES_REQUIRED",phraseCount:parts.length});
 if(descriptor.kind==="ORATION_GREETING"&&parts.length!==2)
  return freeze({status:"ORATION_GREETING_RESPONSE_REQUIRED",phraseCount:parts.length});
 if(descriptor.kind==="PATERNOSTER"&&parts.length!==4)
  return freeze({status:"PATERNOSTER_FOUR_PHRASES_REQUIRED",phraseCount:parts.length});
 if(descriptor.groups.length){
  for(const g of descriptor.groups){
   for(const [side,position] of [["leader",g.pieces[0]],["response",g.pieces[1]]]){
    const expected=expectedFor(g,side,cueById);
    expectedCount++;
    if(sameOrContained(parts[position],expected,side==="leader"&&!!g.leaderSuffix))
      matched++;
   }
  }
 }
 if(descriptor.kind==="ASPERGES"){
  const formula=aspergesFormulas?.[record.id==="ASPERGES_NORMAL"?"ORDINARY":"PASCHAL"];
  if(!formula||parts.length!==3)return freeze({
   status:"ASPERGES_FULL_FORMULA_REQUIRED",phraseCount:parts.length});
  for(const key of ["antiphon","psalm","gloria"]){
   const index=["antiphon","psalm","gloria"].indexOf(key);
   expectedCount++;
   if(sameOrContained(parts[index],norm(formula[key])))matched++;
  }
 }
 if(descriptor.kind==="DISMISSAL"){
  // Source #2988 explicitly has DOUBLE Alleluia on both celebrant and
  // response, and therefore must NEVER be used for an ordinary Ite.
  const incipit=norm("Ite missa est alleluia alleluia");
  const reply=norm("Deo gratias alleluia alleluia");
  expectedCount=2;
  matched=Number(parts.length===2&&parts[0].includes(incipit))+
    Number(parts.length===2&&parts[1].includes(reply));
 }
 const textParity=matched===expectedCount&&expectedCount>0;
 return freeze({
  schema:"ao-mass-music-m05-source-screen-v1",
  id:record.id,sourceId:record.sourceId,kind:descriptor.kind,
  textParity:textParity?"PINNED_TEXT_MATCHES_GABC":"MISMATCH_OR_INCOMPLETE",
  phraseCount:parts.length,expectedComparisons:expectedCount,matchedComparisons:matched,
  coverage:descriptor.coverage,
  transcriptionRights:"GREGOBASE_CC0_SOURCE_ATTESTED",
  facsimileMusicVerification:"PENDING",
  editorialApproval:"PENDING_USER_FINAL_COLLECTION_REVIEW",
  scoreRelease:"BLOCKED",
  audio:"NOT_INCLUDED",
  actuallySung:"UNKNOWN"
 });
}
/** Promotion requires a separate signed/pinned editorial registry. No current
 * M05 research record satisfies that requirement; the lack of such a
 * registry is intentional, not a reason to expose an unapproved score.
 */
export function permittedPublicGregorianScore(_sourceScreen,_approvalRecord){
 // The repo has no trusted, user-approved, pinned publication manifest for
 // this NEW collection. Caller-provided booleans are not approval evidence.
 // A later, separately tested approval adapter must replace this hold.
 return null;
}
