import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
import {APPROVED_MASS_INLINE_GABC} from "./reader-inline-chant-approved.js";
export const INLINE_CHANT_SCHEMA="ao-mass-inline-approved-gabc-v1";
export const INLINE_CHANT_SUNG_FORMS=Object.freeze(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
export const INLINE_CHANT_SELECTION_KEYS=Object.freeze([
 "KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI",
 "DISMISSAL","PREFACE_DIALOGUE","PATER_NOSTER","COLLECT","POSTCOMMUNION",
 "GOSPEL","MASS_RESPONSES","ASPERSION","PROPER_INTROIT","PROPER_GRADUAL",
 "PROPER_ALLELUIA","PROPER_TRACT","PROPER_SEQUENCE","PROPER_OFFERTORY",
 "PROPER_COMMUNION","SPECIAL_RITE"
]);
const keys=new Set(INLINE_CHANT_SELECTION_KEYS);
const cuePattern=/^(?:AO\.SM\.C\d{4}|GF-SOP-\d\d-[KR]|GF-X-52[123])$/;
const normalized=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[æœ]/gi,c=>c.toLowerCase()==="æ"?"ae":"oe").replace(/[℣℟]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const identical=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const scoreCueList=score=>Array.isArray(score?.sourceCueIds)?score.sourceCueIds:
 score?.sourceCueId?[score.sourceCueId]:[];
const selectedId=(key,settings,fallback)=>{
 const selected=settings?.[key];
 return typeof selected==="string"&&selected?selected:
  key==="DISMISSAL"?String(fallback??""):"";
};

// Select only from an exact, reviewed musical setting and corresponding
// source-owned paragraph. A cue group (e.g. two Gloria intonation cues) is
// one musical event, but may be printed in one canonical reader row.
export function selectApprovedInlineScore({
 cueId=null,paragraph=null,form,settingId="",selectedSettings={},
 resolvedMass=null,approvedScores=APPROVED_MASS_INLINE_GABC
}={}){
 if(!INLINE_CHANT_SUNG_FORMS.includes(String(form??"").toUpperCase())||
    !paragraph||paragraph.kind==="RUBRIC"||!Array.isArray(approvedScores))return null;
 const pCues=Array.isArray(paragraph.sourceCueIds)?paragraph.sourceCueIds.map(String):[];
 const owner=String(cueId??"");
 if(owner&&(!cuePattern.test(owner)||!pCues.includes(owner)))return null;
 const requiem=isExplicitRequiemMass({session:{resolvedMass}});
 const matches=approvedScores.filter(score=>{
  const cues=scoreCueList(score);
  const sourceMatches=cues.length>0&&cues.every(c=>cuePattern.test(c))&&
    identical(cues,pCues)&&(!owner||cues[0]===owner);
  const paragraphMatches=typeof score.sourceParagraphId==="string"&&
    score.sourceParagraphId.length>3&&
    String(paragraph.id??"")===score.sourceParagraphId&&
    typeof score.sourceBlockId==="string"&&
    score.sourceBlockId===paragraph.sourceBlockId&&
    (!cues.length||identical(cues,pCues));
  if(!sourceMatches&&!paragraphMatches)return false;
  if(score.selectionKey?.startsWith("PROPER_")&&!paragraphMatches)return false;
  return score.schema===INLINE_CHANT_SCHEMA &&
    keys.has(score.selectionKey) &&
    typeof score.settingId==="string"&&score.settingId.length>1&&
    selectedId(score.selectionKey,selectedSettings,settingId)===score.settingId &&
    score.riteScope===(requiem?"REQUIEM":"ORDINARY") &&
    score.approval==="USER_AND_MUSICAL_SOURCE_REVIEWED" &&
    score.publication==="PUBLIC_APPROVED" &&
    score.sourceTextVerified===true&&score.musicalNotationVerified===true &&
    typeof score.scoreId==="string"&&score.scoreId.length>3 &&
    /^[a-f0-9]{64}$/.test(String(score.gabcSha256??"")) &&
    typeof score.sourceWitness==="string"&&score.sourceWitness.length>5 &&
    String(score.sourceUrl??"").startsWith("https://") &&
    typeof score.gabc==="string"&&score.gabc.length>12 &&
    score.gabc.includes("%%")&&score.gabc.includes("(::)")&&
    /%%\s*\([cf][1-4]\)/.test(score.gabc) &&
    typeof score.sourceLatin==="string"&&score.sourceLatin.length>3 &&
    [paragraph.primary,paragraph.secondary,paragraph.alternate].some(
     t=>typeof t==="string"&&normalized(t)===normalized(score.sourceLatin)) &&
    (!score.sourceBlockId||score.sourceBlockId===paragraph.sourceBlockId);
 });
 return matches.length===1?Object.freeze({...matches[0]}):null;
}

export function selectedMassInlineSettings({localProgramme=null,resolvedMass=null}={}){
 const selections={};
 for(const key of ["KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]){
  const id=localProgramme?.ordinarySelections?.[key];
  if(typeof id==="string"&&id.trim())selections[key]=id;
 }
 if(localProgramme?.dismissalSelection==="ITE_VIII")
  selections.DISMISSAL="ITE_VIII";
 // Future native Proper resolver must explicitly certify the music, never
 // infer it from a date, feast title, season, or common text alone.
 const source=resolvedMass?.sourceCertifiedInlineChantSelections;
 if(source?.status==="SOURCE_CERTIFIED_1962_MUSIC"&&
    source.selections&&typeof source.selections==="object"){
  for(const [key,id] of Object.entries(source.selections)){
   if(keys.has(key)&&key!=="DISMISSAL"&&typeof id==="string"&&
      /^[A-Z0-9][A-Z0-9_:-]{1,100}$/.test(id))selections[key]=id;
  }
 }
 return Object.freeze(selections);
}
