// Exact 1962 selected-Proper authority for sung Collect/Postcommunion Amens.
// This certifies only source identity and rubrical tone FAMILY, never notes.
// No new Mass cards, text or generic Amen score are created.
import {resolve1962DialogueToneFamily} from "./reader-mass-1962-tone-family.js";
export const ORATION_AMEN_SOURCE_SCHEMA="ao-mass-oration-amen-source-handoff-v1";
const SUNG=new Set(["SOLEMN","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]);
const SPECS=Object.freeze([
 Object.freeze({cue:"AO.SM.C0074",block:"AO.SM.B019",slot:"COLLECT_SET",
  event:"COLLECT",anchor:"AO.SM.C0073",label:"COLLECT"}),
 Object.freeze({cue:"AO.SM.C0255",block:"AO.SM.B088",slot:"POSTCOMMUNION_SET",
  event:"POSTCOMMUNION",anchor:"AO.SM.C0254",label:"POSTCOMMUNION"})
]);
const PATH=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9][A-Za-z0-9/_-]*$/i;
const normalize=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .replace(/j/gi,"i").toLowerCase().replace(/[^a-z0-9]/g,"");
const latinColumns=p=>[p?.latin,p?.primary,p?.secondary,p?.alternate]
 .filter(x=>typeof x==="string"&&x.trim());
const status=(state,detail={})=>Object.freeze({
 schema:ORATION_AMEN_SOURCE_SCHEMA,status:state,score:null,
 publicScoreApproved:false,sourceNotationApproved:false,...detail
});
const groupFromId=(id,slot)=>{
 const raw=String(id??""),start=slot+".";
 if(!raw.startsWith(start))return null;
 const match=/^([1-9]\d*)(?:\.|$)/.exec(raw.slice(start.length));
 return match?Number(match[1]):null;
};
export function resolveOrationAmenSourceHandoff({
 paragraph=null,paragraphs=[],form=null,resolvedMass=null
}={}){
 if(!SUNG.has(String(form??"").toUpperCase())||
    (resolvedMass?.form&&String(resolvedMass.form).toUpperCase()!==String(form).toUpperCase()))
  return status("NOT_SUNG_MASS");
 if(!paragraph||!Array.isArray(paragraphs))return status("NO_READER_PARAGRAPHS");
 const fixed=SPECS.find(spec=>paragraph.id===spec.cue);
 const intermediate=/^R17\.ORATION\.(COLLECT|POSTCOMMUNION)\.G([1-9]\d*)\.AMEN$/
  .exec(String(paragraph.id??""));
 const spec=fixed??(intermediate?
  SPECS.find(x=>x.label===intermediate[1]):null);
 if(!spec||paragraph.kind!=="RESPONSE"||
    !latinColumns(paragraph).some(t=>normalize(t)==="amen")||
    paragraph.speakerRole!=="RESPONDERS")
  return status("NOT_PUBLIC_ORATION_AMEN");
 if(fixed&&Array.isArray(paragraph.sourceCueIds)&&
    (paragraph.sourceCueIds.length!==1||paragraph.sourceCueIds[0]!==spec.cue))
  return status("WRONG_FIXED_AMEN_SOURCE_CUE");
 if(intermediate&&paragraph.sourceAnchorCueId!==spec.anchor)
  return status("WRONG_INTERMEDIATE_AMEN_SOURCE_ANCHOR");
 if(paragraphs.filter(p=>p?.id===paragraph.id).length!==1||
    !paragraphs.includes(paragraph))
  return status("RESPONSE_SOURCE_ROW_NOT_UNIQUE");
 const index=paragraphs.indexOf(paragraph);
 const prior=index>0?paragraphs[index-1]:null;
 if(prior?.kind!=="TEXT"||prior.speakerRole!=="PRIEST")
  return status("IMMEDIATE_PRECEDING_ORATION_REQUIRED");
 if(resolvedMass?.distinctRite&&resolvedMass.distinctRite!=="NONE")
  return status("NO_MASS_ORATION_DURING_DISTINCT_RITE");
 const proper=resolvedMass?.proper;
 const selected=proper?.data;
 const selectedPath=String(selected?.sourcePath??proper?.sourcePath??"");
 if(!["READY","CACHED"].includes(proper?.status)||!PATH.test(selectedPath))
  return status("SELECTED_PROPER_SOURCE_NOT_READY");
 const context=resolvedMass?.provenance?.musicToneContext;
 if(context?.verified!==true||context?.sourcePath!==selectedPath||
    context?.onlyForCommonMassPrayerTones!==true)
  return status("ACTUAL_MASS_TONE_CONTEXT_NOT_CERTIFIED");
 const family=resolve1962DialogueToneFamily(spec.event,{resolvedMass});
 if(family?.status!=="RUBRICAL_FAMILY_RESOLVED"||
    !["SOLEMN","FERIAL"].includes(family.family))
  return status("ORATION_TONE_FAMILY_NOT_SOURCE_RESOLVED");
 const list=selected[spec.slot==="COLLECT_SET"?"collects":"postcommunions"];
 const one=selected[spec.slot==="COLLECT_SET"?"collect":"postcommunion"];
 const grouped=Array.isArray(list)&&list.length?list:one?[one]:[];
 if(!grouped.length)return status("NO_SELECTED_ORATION_GROUPS");
 const group=groupFromId(prior.id,spec.slot);
 if(group===null||group>grouped.length)
  return status("PRECEDING_ORATION_GROUP_NOT_IDENTIFIED");
 if(fixed&&group!==grouped.length)
  return status("FINAL_RESPONSE_NOT_AFTER_FINAL_GROUP");
 if(intermediate&&(group!==Number(intermediate[2])||group>=grouped.length))
  return status("INTERMEDIATE_RESPONSE_GROUP_MISMATCH");
 const chosen=grouped[group-1],actualLatin=String(chosen?.lat??chosen?.la??"");
 const matching=latinColumns(prior).some(text=>{
  const latin=normalize(text);
  return latin.length>=18&&normalize(actualLatin).includes(latin);
 });
 if(!matching)return status("ORATION_TEXT_NOT_IN_SELECTED_PROPER");
 const donor=String(chosen?.sourcePath??prior.sourcePath??selectedPath);
 if(!PATH.test(donor)||
    (chosen?.sourcePath&&prior.sourcePath&&chosen.sourcePath!==prior.sourcePath))
  return status("ORATION_SOURCE_DONOR_CONFLICT");
 return status("SOURCE_ORATION_AND_TONE_CERTIFIED_SCORE_PENDING",{
  eventId:spec.event,sourceCueId:fixed?spec.cue:null,
  sourceAnchorCueId:spec.anchor,sourceBlockId:spec.block,
  sourceProperPath:selectedPath,sourceOrationDonor:donor,
  sourceOrationGroupIndex:group,intermediate:Boolean(intermediate),
  toneFamily:family.family,liturgicalToneSource:family.source,
  scoreRequirement:"1961_ORATION_ENDING_AND_MATCHED_AMEN_PHRASE_NOTES"
 });
}
