// Source-first 1962 Preface resolution, ahead of Calendar / preflight / R17.
// Do not select a Preface from an incidental commemoration or liturgical colour.
import {temporal1962PrefaceChoice} from "./1962-preface-temporal.js";
export const PREFACE_1962_SOURCE_URL=new URL(
  "../../data/mass/1962-preface-source-full-seasonal.v2.json",import.meta.url);

export const VERIFIED_MARIAN_SOURCE_IDS=Object.freeze(new Set([
  "02-11", // Our Lady of Lourdes
  "03-25", // Annunciation
  "05-31", // Queenship of the BVM
  "07-02", // Visitation
  "07-16", // Our Lady of Mount Carmel (where celebrated)
  "08-05", // Dedication of St Mary Major
  "08-15", // Assumption
  "08-22", // Immaculate Heart
  "09-08", // Nativity of the BVM
  "09-12", // Holy Name of Mary
  "09-15", // Seven Sorrows
  "10-07", // Holy Rosary
  "10-11", // Divine Maternity
  "11-21", // Presentation of the BVM
  "12-08", // Immaculate Conception
]));
const MARIAN_FORMULA=Object.freeze({
 "03-25":"Annuntiatióne","07-02":"Visitatióne",
 "08-15":"Assumptióne","09-08":"Nativitáte",
 "11-21":"Præsentatióne","12-08":"Conceptióne immaculáta",
 "09-15":"Transfixióne","07-16":"Commemoratióne"
});
const MARIAN_ENGLISH=Object.freeze({
 "03-25":"Annunciation","07-02":"Visitation","08-15":"Assumption",
 "09-08":"Nativity","11-21":"Presentation","12-08":"Immaculate Conception",
 "09-15":"Transfixion","07-16":"Commemoration"
});
const MARIAN_FRENCH=Object.freeze({
 "03-25":"Annonciation","07-02":"Visitation","08-15":"Assomption",
 "09-08":"Nativité","11-21":"Présentation","12-08":"Conception immaculée",
 "09-15":"Transfixion","07-16":"Commémoraison"
});
const string=value=>String(value??"").trim();
const primaryId=day=>string(day?.day?.main?.id);
const currentPreface=day=>day?.proper?.data?.preface??null;
const prefaceOpening=pre=>string(pre?.lat??pre?.la).split("\n")[0].toLowerCase();
const isCommon=pre=>!pre||/^communis$|^common$/i.test(prefaceOpening(pre));
const mark=(source,choice)=>Object.freeze({
  id:choice.id,formulary:choice.formulary,properOwner:source,
  reason:choice.reason??null,easterVariant:choice.easterVariant??null,
  sourceSection:choice.section,scope:"PRINCIPAL_CELEBRATION_ONLY",
  textWitness:"DIVINUM_OFFICIUM_TRILINGUAL_PREFATIONES",
  manuscriptOrdoIndependentCertification:false,
  matchedMassForm:choice.massForm??"ANY",
  applied:false
});

export function choose1962PrefaceForDay(day,{allowLocalAdventPreface=false}={}){
  if(day?.status!=="ready"||day?.proper?.status!=="ready")return null;
  const main=primaryId(day);
  const feast=/^sancti:(\d\d-\d\d)[a-z]*:/i.exec(main)?.[1]??null;
  // A source-owned Marian Saturday Mass is itself the principal
  // Common Proper; unlike a mere Marian commemoration it takes BVM.
  if(/^commune:C10b:/i.test(main))
    return mark(main,{id:"BVM",section:"Maria",formulary:"SATURDAY_BVM_COMMON",
      reason:"SOURCE_PRINCIPAL_MARIAN_COMMON"});
  // The Purification's Nativity Preface overrides the usual Marian rule.
  if(feast&&feast!=="02-02"&&VERIFIED_MARIAN_SOURCE_IDS.has(feast))
    return mark(main,{id:"BVM",section:"Maria",formulary:feast,reason:"BVM_PRINCIPAL_PROPER"});
  const selected=temporal1962PrefaceChoice(day,{allowLocalAdventPreface});
  if(!selected)return null;
  const ids={Spiritu:"HOLY_GHOST",Nat:"NATIVITY",Epi:"EPIPHANY",
    Quad:"LENT",Pasch:"EASTER",Asc:"ASCENSION",Joseph:"ST_JOSEPH",
    Apostolis:"APOSTLES",Adv:"ADVENT"};
  if(!ids[selected.section])throw new Error("UNRECOGNISED_1962_PREFACE_DECISION");
  return mark(main,{...selected,id:ids[selected.section]});
}
function cleaned(section,locale,key){
  const raw=string(section);
  if(!raw)throw new Error("MISSING_1962_PREFACE_SOURCE_"+locale+"_"+key);
  const heading=raw.match(/^!([^\n]+)/m)?.[1]?.trim()??(locale==="lat"?key:locale==="en"?key:key);
  const body=raw.replace(/^![^\n]*\n/,"").replace(/^v\.\s*/,"").replace(/\s*~\s*/g," ");
  if(!/\b(?:Vere dignum|It is truly|Il est vraiment)\b/i.test(body))
    throw new Error("INVALID_1962_PREFACE_WITNESS_"+locale+"_"+key);
  return {heading,body};
}
function mariaBody(section,lang,formulary){
  const parsed=cleaned(section,lang,"Maria");
  const id=String(formulary);
  if(lang==="lat"){
    const word=MARIAN_FORMULA[id]??"Festivitáte";
    return parsed.heading+"\n℣. "+parsed.body.replace("*Festivitáte*",word);
  }
  if(lang==="en"){
    const word=MARIAN_ENGLISH[id]??"Feast";
    return parsed.heading+"\n℣. "+parsed.body.replace("*Feast*",word);
  }
  const formula=MARIAN_FRENCH[id];
  const body=formula?parsed.body.replace("en la fête","en la "+formula):parsed.body;
  return parsed.heading+"\n℣. "+body;
}
function spiritBody(section,lang,inOctave){
  const parsed=cleaned(section,lang,"Spiritu");
  if(lang==="lat")return parsed.heading+"\n℣. "+parsed.body.replace("* *",inOctave?"hodiérna die":"").replace(/\s+/g," ").trim();
  if(lang==="en"){
    const body=inOctave?parsed.body.replace("poured out the Holy Spirit","this day poured out the Holy Spirit"):parsed.body;
    return parsed.heading+"\n℣. "+body;
  }
  const body=inOctave?parsed.body.replace("(en ce jour)","en ce jour"):parsed.body.replace("(en ce jour)","");
  return parsed.heading+"\n℣. "+body;
}
function standardBody(section,lang,key){
  const {heading,body}=cleaned(section,lang,key);
  return heading+"\n℣. "+body;
}
function josephBody(section,lang,feast){
  const {heading,body}=cleaned(section,lang,"Joseph");
  const isWorkman=feast==="05-01",isMarch19=feast==="03-19";
  if(lang==="lat"){
    const word=isWorkman?"Solemnitáte":isMarch19?"Festivitáte":"Veneratióne";
    return heading+"\n℣. "+body.replace("*Veneratióne*",word);
  }
  if(lang==="en"){
    const text=isWorkman?body.replace("on the solemnity of blessed Joseph","on the solemnity of blessed Joseph"):
      body.replace("on the solemnity of blessed Joseph","on the feast of blessed Joseph");
    return heading+"\n℣. "+text;
  }
  const text=isWorkman?body.replace("en la fête du bienheureux Joseph",
    "en la solennité du bienheureux Joseph"):body;
  return heading+"\n℣. "+text;
}
function paschalBody(section,lang,variant){
  const {heading,body}=cleaned(section,lang,"Pasch");
  const use=variant==="OCTAVE"?"OCTAVE":variant==="VIGIL"?"VIGIL":"ORDINARY";
  if(lang==="lat"){
    const word=use==="OCTAVE"?"hac potíssimum die":
      use==="VIGIL"?"hac potíssimum nocte":"hoc potíssimum";
    const text=body.replace(/sed in[\s\S]*?gloriósius prædicáre/i,
      "sed in "+word+" gloriósius prædicáre");
    if(text===body)throw new Error("UNPARSED_1962_PASCHAL_VARIANT_LATIN");
    return heading+"\n℣. "+text;
  }
  if(lang==="en"){
    const word=use==="OCTAVE"?"on this day":use==="VIGIL"?"on this night":"in this season";
    const text=body.replace(/but more gloriously especially[\s\S]*?when Christ/i,
      "but more gloriously especially "+word+" when Christ");
    if(text===body)throw new Error("UNPARSED_1962_PASCHAL_VARIANT_ENGLISH");
    return heading+"\n℣. "+text;
  }
  const word=use==="OCTAVE"?"en ce jour":use==="VIGIL"?"en cette nuit":"en ce temps";
  const text=body.replace(/en ce temps\s*\(à la Messe de la Vigile pascale\)[\s\S]*?où le Christ/i,
    word+" où le Christ");
  if(text===body)throw new Error("UNPARSED_1962_PASCHAL_VARIANT_FRENCH");
  return heading+"\n℣. "+text;
}
export function materialize1962Preface(choice,source){
  const key=choice?.sourceSection;
  const allowed=["Spiritu","Maria","Adv","Nat","Epi","Quad","Pasch","Asc","Joseph","Apostolis"];
  if(!allowed.includes(key))throw new Error("UNRECOGNISED_1962_PREFACE_SECTION");
  if(source?.schema!=="AO_1962_PREFACE_TRILINGUAL_SOURCE_REGISTRY_V2")
    throw new Error("UNTRUSTED_1962_PREFACE_REGISTRY");
  const original=source.sources?.[key];
  const entry=original?.sections;
  if(!entry?.lat||!entry?.en||!entry?.fr)throw new Error("TRILINGUAL_1962_PREFACE_SOURCE_INCOMPLETE");
  const feast=/^sancti:(\d\d-\d\d)[a-z]*:/i.exec(choice.properOwner)?.[1]??"";
  const out={};
  for(const lang of ["lat","en","fr"]){
    const section=entry[lang];
    out[lang]=key==="Maria"?mariaBody(section,lang,feast):
      key==="Spiritu"?spiritBody(section,lang,true):
      key==="Joseph"?josephBody(section,lang,feast):
      key==="Pasch"?paschalBody(section,lang,choice.easterVariant):
      standardBody(section,lang,key);
  }
  if(Object.values(out).some(t=>/\*(?:Festivitáte|Feast|Veneratióne| )\*|\(sed |\(à la Messe de la Vigile pascale\)/i.test(t)))
    throw new Error("UNRESOLVED_1962_PREFACE_VARIANT");
  return Object.freeze({...out,sourceSection:key,selected1962PrefaceId:choice.id,
    prefaceProvenance:original.urls,editionTextChecked:"SELECTED_PREFACE_SOURCE_ONLY"});
}
export function apply1962PrefaceSelection(day,registry){
  const choice=choose1962PrefaceForDay(day);
  if(!choice)return day;
  const original=currentPreface(day);
  // Existing proper/seasonal Prefaces must outrank source recovery.
  if(!isCommon(original))return day;
  const selected=materialize1962Preface(choice,registry);
  return Object.freeze({...day,
   proper:Object.freeze({...day.proper,data:Object.freeze({...day.proper.data,preface:selected})}),
   prefaceDecision:Object.freeze({...choice,applied:true,previousTextLabel:prefaceOpening(original)})});
}
let registryPromise=null;
export function load1962PrefaceSource(fetcher=globalThis.fetch){
  if(!registryPromise){
    registryPromise=fetcher(PREFACE_1962_SOURCE_URL.href,{headers:{accept:"application/json"}})
      .then(x=>{if(!x.ok)throw new Error("1962_PREFACE_SOURCE_HTTP_"+x.status);return x.json()})
      .catch(error=>{registryPromise=null;throw error});
  }
  return registryPromise;
}
export function clear1962PrefaceSourceCacheForTests(){registryPromise=null;}
