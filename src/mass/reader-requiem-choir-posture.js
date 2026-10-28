// 1960 General Rubrics 521(c), 524: Requiem posture of persons *in choir*.
// This is neither a universal pew instruction nor a change to priest rubrics.
// Source card/cue identities, local customs and observed congregation remain intact.
import { isExplicitRequiemMass } from "./reader-requiem-conditions.js";

export const REQUIEM_CHOIR_POSTURE_AUTHORITY="GENERAL_RUBRICS_1960_521_C";
export const REQUIEM_CHOIR_POSTURE_SOURCE=
  "https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html";
const CHOIR_FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const cueNumber=value=>{
  const m=String(value??"").match(/^AO\.SM\.C(\d{4})$/);
  return m?Number(m[1]):null;
};
export function isRequiemChoirPostureApplicable(resolvedMass){
  return CHOIR_FORMS.has(String(resolvedMass?.form??"").toUpperCase()) &&
    isExplicitRequiemMass({session:{resolvedMass}});
}

// These anchors are *display* transitions. Source Latin, ceremonies and
// canonical cue IDs are immutable. An explicitly selected choir participant
// kneels for the Collects; from after Sanctus to *before* the Pater
// introduction; and for the Postcommunion. Ordinary source postures govern
// all other moments, including Communion of the faithful.
export function projectRequiemChoirPosture(cueId,resolvedMass,{reason=null}={}){
  if(!isRequiemChoirPostureApplicable(resolvedMass)||reason)return null;
  const n=cueNumber(cueId);
  if(n===null)return null;
  const spans=[
    {from:72,to:75,value:"KNEEL",start:"AO.SM.C0072",rule:"COLLECTS"},
    {from:150,to:208,value:"KNEEL",start:"AO.SM.C0150",rule:"AFTER_SANCTUS_TO_PATERNOSTER"},
    {from:208,to:2222,value:"STAND",start:"AO.SM.C0208",rule:"PATERNOSTER_INTRODUCTION"},
    {from:253,to:257,value:"KNEEL",start:"AO.SM.C0253",rule:"POSTCOMMUNIONS"},
    {from:257,to:267,value:"STAND",start:"AO.SM.C0257",rule:"AFTER_POSTCOMMUNIONS"},
  ];
  const span=spans.find(x=>n>=x.from&&n<x.to);
  if(!span)return null;
  return Object.freeze({
    label:span.value,value:span.value,
    cueId:span.start,
    activeCueId:String(cueId),
    transition:String(cueId)===span.start,
    owner:"REQUIEM_CHOIR_1962",
    actorScope:"CHOIR_ONLY",
    sourcePostureId:REQUIEM_CHOIR_POSTURE_AUTHORITY,
    authority:REQUIEM_CHOIR_POSTURE_AUTHORITY,
    sources:REQUIEM_CHOIR_POSTURE_SOURCE,
    rule:span.rule,persistent:true,fixed:false,
  });
}
