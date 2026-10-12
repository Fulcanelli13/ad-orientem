// Source-first 1962 Preface resolution, ahead of Calendar / preflight / R17.
// Do not select a Preface from an incidental commemoration or liturgical colour.
export const PREFACE_1962_SOURCE_URL=new URL(
  "../../data/mass/1962-preface-source-maria-spiritu.v1.json",import.meta.url);

export const VERIFIED_MARIAN_SOURCE_IDS=Object.freeze(new Set([
  "02-11", // Our Lady of Lourdes
  "03-25", // Annunciation
  "05-31", // Queenship of the BVM
  "07-02", // Visitation
  "07-16", // Our Lady of Mount Carmel (where celebrated)
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
  sourceSection:choice.section,scope:"PRINCIPAL_CELEBRATION_ONLY",
  textWitness:"DIVINUM_OFFICIUM_TRILINGUAL_PREFATIONES",
  manuscriptOrdoIndependentCertification:false,
  matchedMassForm:choice.massForm??"ANY",
  applied:false
});

export function choose1962PrefaceForDay(day){
  if(day?.status!=="ready"||day?.proper?.status!=="ready")return null;
  const main=primaryId(day);
  // Pentecost octave in the 1962 Temporale. Other Holy Ghost votives must
  // be governed by their actually selected Mass, not this calendar resolver.
  if(/^tempora:Pasc7-[0-6]:/i.test(main)){
    return mark(main,{id:"HOLY_GHOST",section:"Spiritu",formulary:"TEMPORAL_PENTECOST_OCTAVE",massForm:"ANY"});
  }
  const feast=/^sancti:(\d\d-\d\d):/i.exec(main)?.[1]??null;
  // Purification is the Nativity Preface by express 1962 rubric.
  if(feast==="02-02")return null;
  if(feast&&VERIFIED_MARIAN_SOURCE_IDS.has(feast)){
    return mark(main,{id:"BVM",section:"Maria",formulary:feast==="12-08"?"IMMACULATE_CONCEPTION":feast,massForm:"ANY"});
  }
  return null;
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
export function materialize1962Preface(choice,source){
  const key=choice?.sourceSection;
  if(!["Spiritu","Maria"].includes(key))throw new Error("UNRECOGNISED_1962_PREFACE_SECTION");
  if(source?.schema!=="AO_1962_PREFACE_MARIA_SPIRITU_SOURCE_WITNESS_V1")
    throw new Error("UNTRUSTED_1962_PREFACE_REGISTRY");
  const entry=source.byKey?.[key]?.sections;
  if(!entry?.lat||!entry?.en||!entry?.fr)throw new Error("TRILINGUAL_1962_PREFACE_SOURCE_INCOMPLETE");
  const feast=/^sancti:(\d\d-\d\d):/i.exec(choice.properOwner)?.[1]??"";
  const result=key==="Maria"?
   {lat:mariaBody(entry.lat,"lat",feast),en:mariaBody(entry.en,"en",feast),fr:mariaBody(entry.fr,"fr",feast)}:
   {lat:spiritBody(entry.lat,"lat",true),en:spiritBody(entry.en,"en",true),fr:spiritBody(entry.fr,"fr",true)};
  if(Object.values(result).some(t=>t.includes("*Festivitáte*")||t.includes("*Feast*")||t.includes("* *")))throw new Error("UNRESOLVED_1962_PREFACE_VARIANT");
  return Object.freeze({...result,sourceSection:key,selected1962PrefaceId:choice.id,
    prefaceProvenance:source.byKey[key].urls,editionTextChecked:"SELECTED_PREFACE_SOURCE_ONLY"});
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
