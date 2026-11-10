// Schola presentation only — short, source-owned TEXT exceptions.
// Do not alter the canonical 65-card Mass, its priest/response exchanges,
// the sung Mass corpus, the 36-event reference itinerary or choir timing.
// All substantive Ordinary/Proper chants remain SCORE TARGETS, with their
// already-existing Latin text fallback until a score is approved.
// Asperges/Vidi aquam are separate native rites and remain handled there.
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";

const freeze=Object.freeze;
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const item=(cue,block,label,group,clock)=>freeze({cue,block,label,group,clock});
const sourceCues=freeze([
  item("AO.SM.C0135","AO.SM.B041","Per omnia sæcula sæculorum","PER_OMNIA_SECRET","PUBLIC_TEXT"),
  item("AO.SM.C0136","AO.SM.B041","Amen · Secret conclusion","PER_OMNIA_SECRET","USER_RESPONSE"),
  item("AO.SM.C0138","AO.SM.B042","Preface · first response","PREFACE_RESPONSES","USER_RESPONSE"),
  item("AO.SM.C0140","AO.SM.B043","Preface · Sursum corda response","PREFACE_RESPONSES","USER_RESPONSE"),
  item("AO.SM.C0143","AO.SM.B044","Preface · Dignum et iustum response","PREFACE_RESPONSES","USER_RESPONSE"),
  item("AO.SM.C0206","AO.SM.B061","Per omnia sæcula sæculorum · Canon conclusion","PER_OMNIA_CANON","PUBLIC_TEXT"),
  item("AO.SM.C0207","AO.SM.B061","Amen · Canon conclusion","PER_OMNIA_CANON","USER_RESPONSE"),
  item("AO.SM.C0217","AO.SM.B065","Per omnia sæcula sæculorum · before Pax","PER_OMNIA_PAX","PUBLIC_TEXT"),
  item("AO.SM.C0218","AO.SM.B065","Amen · before Pax","PER_OMNIA_PAX","USER_RESPONSE"),
  item("AO.SM.C0259","AO.SM.B090","Ite, missa est","DISMISSAL","PUBLIC_TEXT"),
  item("AO.SM.C0260","AO.SM.B090","Deo gratias · dismissal response","DISMISSAL","USER_RESPONSE")
]);
export const SCHOLA_SOURCE_TEXT_EXCEPTIONS=sourceCues;
const index=new Map(sourceCues.map(x=>[x.cue,x]));
const sourceText=corpus=>{
  if(!Array.isArray(corpus?.blocks))return null;
  const out=new Map();
  for(const block of corpus.blocks)for(const u of block.units??[]){
    if(index.has(u.cue_id)&&!out.has(u.cue_id))
      out.set(u.cue_id,{block:block.Block_ID,clock:u.clock,latin:u.latin,english:u.english});
    else if(index.has(u.cue_id))return null; // duplicate cue is never trusted
  }
  return out;
};
// Deliberately never classify generic Dominus vobiscum, Et cum spiritu tuo,
// Gospel/Collect greetings, ordinary Oremus or routine Amen as Schola text.
export function scholaTextExceptionForCue({
 cueId,form,sungCorpus,resolvedMass=null,massPlan=null
}={}){
 if(!SUNG.has(String(form??"").toUpperCase()))return null;
 const spec=index.get(String(cueId??""));
 if(!spec)return null;
 if(spec.group==="DISMISSAL"){
   if(isExplicitRequiemMass({session:{resolvedMass}}))return null;
   const planned=String(massPlan?.dismissal??"").toUpperCase();
   if(planned && planned!=="ITE_MISSA_EST")return null;
 }
 const unit=sourceText(sungCorpus)?.get(spec.cue);
 if(!unit||unit.block!==spec.block||unit.clock!==spec.clock||
   typeof unit.latin!=="string"||!unit.latin.trim())return null;
 const text=unit.latin.trim();
 if(spec.group==="PER_OMNIA_SECRET"||spec.group==="PER_OMNIA_CANON"||
    spec.group==="PER_OMNIA_PAX"){
   if(spec.clock==="PUBLIC_TEXT"&&!/per\s+ómnia\s+s[æǽ]cula\s+sæculórum/iu.test(text))
     return null;
   if(spec.clock==="USER_RESPONSE"&&!/amen/iu.test(text))return null;
 }
 if(spec.group==="PREFACE_RESPONSES"&&
    !text.startsWith("℟."))return null;
 if(spec.group==="DISMISSAL"&&
    !(spec.clock==="PUBLIC_TEXT"?/ite,\s*missa est/iu:/deo\s+grátias/iu).test(text))
    return null;
 return freeze({
   schema:"ao-schola-text-exception-1962-v1",
   cueId:spec.cue,sourceBlockId:spec.block,group:spec.group,
   label:spec.label,latin:text,
   translation:typeof unit.english==="string"?unit.english.trim():null,
   role:spec.clock==="USER_RESPONSE"?"RESPONSE":"LITURGICAL_MINISTER",
   display:"TEXT_ONLY_EXCEPTION",musicalScore:false,
   sourceOwner:"PINNED_1962_SUNG_CORPUS",actuallySung:"UNKNOWN",
   sourceIsNotPerformance:true,
 });
}
const menus=freeze({
 ORATE_SECRET:"Per omnia · Secret conclusion",
 PREFACE_DIALOGUE:"Preface responses",
 PAX_COMMICTIO:"Per omnia · before Pax",
 DISMISSAL:"Ite missa est · dismissal"
});
export const SCHOLA_TEXT_EXCEPTION_MENU_LABELS=menus;
export function scholaEventVisibleInMusicMenu(item){
 if(!item||typeof item.id!=="string")return false;
 // Source events remain in the underlying 36-event itinerary for priest
 // position, response ownership, organ restrictions and chant windows.
 if(item.kind==="PRIEST_VOICE")return Object.hasOwn(menus,item.id);
 return true;
}
export function scholaMusicMenuLabel(item){
 return menus[item?.id]??item?.localPlan?.title??item?.label??"";
}
export const SCHOLA_ASPERGES_TEXT_OWNER=freeze({
 riteId:"ASPERGES",acceptedEvents:freeze(["AO.MUS.ASP.ME","AO.MUS.ASP.VIDI"]),
 owner:"EXISTING_NATIVE_ASPERGES_STAGE",notAnOrdinaryMassCard:true,
 scorePublicationUnchanged:true
});
