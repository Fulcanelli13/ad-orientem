/**
 * A real, bounded source-first 1960 Vespers collect + dismissal witness,
 * not a universal reader or a printed-edition certification.
 *
 * RG/BR 247-249 and 179(a): dialogue before collect, Oremus, exact proper
 * body, macro-owned collect conclusion, possible concluding dialogue,
 * Benedicamus Domino and Fidelium animae.
 *
 * Caller supplies EXISTING pinned source readSource(path,lang). The
 * source-file label checks only ensure that the intended revision/file
 * was read; translation fidelity and full printed collation remain open.
 *
 * Warning: French Qui vivis omits an explicit Latin "cum Deo Patre"
 * equivalent; English collect is freer than its Latin body. Both are kept
 * EXACTLY as sourced, visibly marked for editorial translation review.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
export const ADVENT_COLLECT_ENDING_SCHEMA=
 "ao.office.advent-i-2026-vespers-collect-ending-variants.v1";
const PROPER="Tempora/Adv1-0",PRAYERS="Psalterium/Common/Prayers";
const LANGS=["la","en","fr"];
const SHA={
 la:{proper:"f38a896d314286c721ae94065a4cfec828550023",prayers:"d6bca79569ecc0f1557ceef26e75a14357174f8a"},
 en:{proper:"c766d04d15e9e62f220ae4e6d63942646ed8e91f",prayers:"5d213f4b7c906da58784ad2fc2cc9f15fd68f520"},
 fr:{proper:"5212a50ab5621d24091eb0855fb2b7c1ac324c67",prayers:"743a01b4a34bfd965e1c260b6bf01e76efb679ff"}
};
const NAMES=["Oratio","Dominus","Oremus","Qui vivis",
 "Benedicamus Domino","Fidelium animae"];
const reject=reason=>Object.freeze({
 schema:ADVENT_COLLECT_ENDING_SCHEMA,status:"WITHHELD",reason,
 languageComponentsLocated:0,completePrintedCollectConclusion:false,
 translationFidelityCertified:false,completeHourCertified:false,
 rightsApproved:false,publishable:false,published:false
});
function source(x,path,lang,sha){
 return x?.sourceRevision===PIN&&x?.sourcePath===path&&
  x?.language===lang&&x.map instanceof Map&&
  (x.sourceBlobSha===undefined||x.sourceBlobSha===sha);
}
function lines(map,name,count){
 const x=map.get(name);
 if(!Array.isArray(x)||x.length!==count)return null;
 const cleaned=x.map(s=>typeof s==="string"?s.trim():"");
 if(cleaned.some(s=>!s||s.length>950||/[<>]|\{:|^@/u.test(s)))return null;
 return cleaned;
}
function sourceOnlyPair(xs){
 return Array.isArray(xs)&&xs.length===2&&
  /^V\. /u.test(xs[0])&&/^R\. /u.test(xs[1])&&
  xs.every(s=>!/[$@&{}]/u.test(s));
}
function validate(proper,prayers,lang){
 const oratio=lines(proper,"Oratio",2),dominus=lines(prayers,"Dominus",5);
 const oremus=lines(prayers,"Oremus",1),ending=lines(prayers,"Qui vivis",2);
 const dismissal=lines(prayers,"Benedicamus Domino",2);
 const souls=lines(prayers,"Fidelium animae",2);
 if(!oratio||oratio[1]!=="$Qui vivis"||
  !dominus||!sourceOnlyPair(dominus.slice(0,2))||
  !sourceOnlyPair(dominus.slice(2,4))||
  !dominus[4].startsWith("/:")||!dominus[4].endsWith(":/")||
  !oremus||!/^[vV]\. \S/u.test(oremus[0])||
  !ending||!/^r\. \S/u.test(ending[0])||
  !/^R\. \S/u.test(ending[1])||
  !sourceOnlyPair(dismissal)||!sourceOnlyPair(souls))
  return null;
 const original=oratio[0],macro=ending[0];
 if(lang==="la"&&(
  !original.startsWith("Excita, quǽsumus, Dómine,")||
  !macro.startsWith("r. Qui vivis et regnas cum Deo Patre,")||
  oremus[0]!=="v. Orémus."||
  dominus[0]!=="V. Dóminus vobíscum."||
  dominus[2]!=="V. Dómine, exáudi oratiónem meam."
 ))return null;
 if(lang==="en"&&(
  !original.startsWith("Stir up, O Lord, we pray thee,")||
  !macro.startsWith("r. Who livest and reignest with God the Father")||
  oremus[0]!=="v. Let us pray."
 ))return null;
 if(lang==="fr"&&(
  !original.startsWith("Réveillez votre puissance, Seigneur")||
  !macro.startsWith("r. Vous qui étant Dieu, vivez et régnez")||
  oremus[0]!=="v. Prions."
 ))return null;
 if(oratio[0].includes("$")||oratio[0].includes("@")||
  [...dominus.slice(0,4),...ending,...dismissal,...souls].some(x=>/[$@&{}]/u.test(x)))
  return null;
 return Object.freeze({body:original,domin:dominus.slice(0,2),
  domineExaudi:dominus.slice(2,4),omitSecondDomineSourceNote:dominus[4],
  oremus:oremus[0],macroConclusion:ending,
  benedicamus:dismissal,fideliumAnimae:souls});
}
/**
 * Role must be explicitly passed. A priest reciting solo uses Domine exaudi;
 * a non-deacon in common also uses Domine exaudi. Do not infer from users.
 */
export async function reviewAdventI2026CollectConclusion({
 readSource,recitation,minister,calendarScope="UNIVERSAL"
}={}){
 if(!["SOLO","CHOIR_OR_COMMON"].includes(recitation)||
    !["BELOW_DEACON","DEACON_OR_HIGHER"].includes(minister))
  return reject("1960_RECITATION_AND_MINISTRY_MUST_BE_EXPLICIT");
 if(calendarScope!=="UNIVERSAL")
  return reject("LOCAL_CALENDAR_REQUIRES_SEPARATE_REVIEW");
 if(typeof readSource!=="function")return reject("PINNED_READ_SOURCE_REQUIRED");
 const useDominus=recitation==="CHOIR_OR_COMMON"&&minister==="DEACON_OR_HIGHER";
 const byLang={};
 for(const lang of LANGS){
  let p,q;
  try{[p,q]=await Promise.all([readSource(PROPER,lang),
    readSource(PRAYERS,lang)])}
  catch{return reject("SOURCE_UNAVAILABLE:"+lang)}
  if(!source(p,PROPER,lang,SHA[lang].proper)||
     !source(q,PRAYERS,lang,SHA[lang].prayers))
   return reject("SOURCE_REVISION_OR_OWNER_DIFFERENT:"+lang);
  const parts=validate(p.map,q.map,lang);
  if(!parts)return reject("COLLECT_OR_DISMISSAL_SOURCE_SHAPE_CHANGED:"+lang);
  byLang[lang]=Object.freeze({
   beforeCollect:Object.freeze(useDominus?parts.domin:parts.domineExaudi),
   oremus:parts.oremus,
   collectBody:parts.body,
   collectConclusion:Object.freeze(parts.macroConclusion),
   // The original Ordinary says omit the SECOND Domine exaudi,
   // rather than repeating it mechanically before Benedicamus.
   beforeBenedicamus:Object.freeze(useDominus?parts.domin:[]),
   benedicamus:Object.freeze(parts.benedicamus),
   fideliumAnimae:Object.freeze(parts.fideliumAnimae),
   sourceIds:Object.freeze([
    PROPER+"#Oratio",PRAYERS+"#Dominus",
    PRAYERS+"#Oremus",PRAYERS+"#Qui vivis",
    PRAYERS+"#Benedicamus Domino",PRAYERS+"#Fidelium animae"
   ]),
   printedTextIndependentlyCollated:false,
   translationFidelityApproved:false
  });
 }
 return Object.freeze({
  schema:ADVENT_COLLECT_ENDING_SCHEMA,
  status:"THREE_LANGUAGE_SOURCE_COLLECT_AND_DISMISSAL_VARIANTS_NOT_PRINT_CERTIFIED",
  sourceRevision:PIN,civilDate:"2026-11-28",
  officeDate:"2026-11-29",officePart:"FIRST",hour:"VESPERS",
  calendarScope,recitation,minister,
  dialogueVariant:useDominus?"DOMINUS_VOBISCUM":"DOMINE_EXAUDI",
  languages:Object.freeze(byLang),languageComponentsLocated:3,
  collectEndingSourceMacroResolved:true,
  omittedSecondDomineExaudi:!useDominus,
  openingPaterAndAve:false,
  sourceBackedOremus:true,
  translationReviewRequired:Object.freeze([
   "FR_QUI_VIVIS_OMITS_EXPLICIT_CUM_DEO_PATRE_PHRASE",
   "EN_ADVENT_I_COLLECT_FREE_PARAPHRASE_NEEDS_LATIN_FIDELITY_REVIEW"
  ]),
  exactPrintedCollectEndingCollated:false,officeOrdinaryMusicalRubricsCertified:false,
  translationFidelityCertified:false,localCalendarCertified:false,
  completeHourCertified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
