// Narrow, read-only 1962 Missal Marian Preface source identities.
// Primary rule: Missale Romanum 1962, Praefatio de B. Maria Virgine:
// https://www.liturgiapapal.org/index.php/recursos-lit%C3%BArgicos/misal/missale-1962/1716-prefacios.html
// Latin Sancti Rule witnesses: pinned DivinumOfficium commit ad8783641455.
// The Lourdes donor says apparitióne, contrary to the 1962 printed-book
// commentary's Conceptione immaculata. It is BLOCKED until reconciled.
// This module makes no edits to the donor, Calendar, or votive options.
const feast=Object.freeze({
  "02-11":Object.freeze({form:null,blocked:"LOURDES_PREFACE_BOOK_SOURCE_CONFLICT"}),
  "03-25":Object.freeze({form:"ANNUNCIATION",rule:"Annuntiatione"}),
  "07-02":Object.freeze({form:"VISITATION",rule:"Visitatione"}),
  "08-05":Object.freeze({form:"FESTIVITY",rule:"Festivitate"}),
  "08-15":Object.freeze({form:"ASSUMPTION",rule:"Assumptione"}),
  "08-22":Object.freeze({form:"FESTIVITY",rule:"Festivitate"}),
  "09-08":Object.freeze({form:"NATIVITY",rule:"Nativitate"}),
  "09-12":Object.freeze({form:"FESTIVITY",rule:"Festivitate"}),
  "09-15":Object.freeze({form:"TRANSFIXION",rule:"Transfixione"}),
  "11-21":Object.freeze({form:"PRESENTATION",rule:"Presentatione"})
});
export const MARIAN_FORM_WORDS=Object.freeze({
  ANNUNCIATION:Object.freeze({la:"Annuntiatióne",en:"Annunciation",fr:"l’Annonciation"}),
  VISITATION:Object.freeze({la:"Visitatióne",en:"Visitation",fr:"la Visitation"}),
  ASSUMPTION:Object.freeze({la:"Assumptióne",en:"Assumption",fr:"l’Assomption"}),
  NATIVITY:Object.freeze({la:"Nativitáte",en:"Nativity",fr:"la Nativité"}),
  PRESENTATION:Object.freeze({la:"Præsentatióne",en:"Presentation",fr:"la Présentation"}),
  TRANSFIXION:Object.freeze({la:"Transfixióne",en:"Transfixion",fr:"la Transfixion"}),
  FESTIVITY:Object.freeze({la:"festivitáte",en:"Feast",fr:"la fête"}),
  VENERATION:Object.freeze({la:"veneratióne",en:"Veneration",fr:"la vénération"})
});
const norm=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/g,"ae").replace(/Æ/g,"Ae").toLowerCase();
export const LATIN_SANCTORAL_SOURCE_REVISION="ad8783641455bae38a8eb5782b34241a7b3ff2ef";
export function required1962MarianPrefaceOwner(id,sourcePath){
  const source=String(sourcePath??"");
  const match=/^sancti:(\d{2}-\d{2}):([1-4]):[a-z]{1,2}$/i.exec(String(id??""));
  if(match){
    const original=feast[match[1]];
    if(!original||source.toLowerCase()!=="sancti/"+match[1])return null;
    return Object.freeze({category:"MARIA",form:original.form,
      blocked:original.blocked??null,path:source,
      rule:original.rule??null,scope:"MARIA_1962_SOURCE_SPECIFIC"});
  }
  const bvm=/^commune:(C10(?:b|c|Pasc|t)):4:w$/i.exec(String(id??""));
  if(!bvm||source.toLowerCase()!=="commune/"+bvm[1].toLowerCase())return null;
  return Object.freeze({category:"MARIA",form:"VENERATION",
    path:source,blocked:null,rule:null,scope:"BVM_SATURDAY_1962"});
}
export function verifyMarianLatinSourceRule(parsed,owner){
  if(!owner?.rule)return owner?.form==="VENERATION";
  const lines=parsed?.map?.get?.("Rule");
  if(!Array.isArray(lines))return false;
  const expected=norm("Prefatio=Maria="+owner.rule).replace(/\s+/g,"");
  const directives=lines.map(x=>norm(x).replace(/\s+/g,""))
    .filter(x=>x.startsWith("prefatio="));
  return directives.length===1&&directives[0].replace(/[;.]$/g,"")===expected;
}
export function render1962MarianPrefaceForm(text,language,form){
  const token=MARIAN_FORM_WORDS[form];
  if(!token||typeof text!=="string")return null;
  if(language==="la"){
    const marker="*Festivitáte*";
    if(text.split(marker).length!==2)return null;
    return text.replace(marker,token.la);
  }
  if(language==="en"){
    const marker="*Feast*";
    if(text.split(marker).length!==2)return null;
    return text.replace(marker,token.en);
  }
  if(language==="fr"){
    const marker="en la fête de la bienheureuse Marie";
    if(text.split(marker).length!==2)return null;
    return text.replace(marker,"en "+token.fr+" de la bienheureuse Marie");
  }
  return null;
}
export function isSelected1962MarianPrefaceForm(preface,owner){
  if(!owner||owner.blocked||!owner.form)return false;
  const latin=norm(preface?.lat??preface?.la);
  const word=norm(MARIAN_FORM_WORDS[owner.form]?.la);
  return Boolean(word&&latin.startsWith("de beata maria virgine")&&
    latin.includes("et te in "+word+" beatae mariae semper virginis")&&
    !latin.includes("*festivitate*")&&
    preface?.marianForm===owner.form);
}
