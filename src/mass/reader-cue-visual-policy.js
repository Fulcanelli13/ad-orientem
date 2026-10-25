// Mass cue presentation contract. No image is manufactured when the
// source-owned action has no exact approved pictogram.
export const CUE_SURFACE=Object.freeze({
 ICON:"ICON", INLINE_RUBRIC:"INLINE_RUBRIC", GUIDE_ONLY:"GUIDE_ONLY"
});
export function resolveCueSurface({mode="LIVE",cueId=null,sourceCueId=null,
 actionMeaning=null,iconKey=null,iconUrl=null,hasSourceRubric=false,
 printedRubric=false}={}){
 if(iconKey&&iconUrl)return CUE_SURFACE.ICON;
 if(mode!=="LIVE" || !/^AO\.SM\.C\d{4}$/.test(String(cueId??"")) ||
    sourceCueId!==cueId ||
    !/^priest\.action\.[a-z_]+$/.test(String(actionMeaning??"")) ||
    hasSourceRubric || printedRubric)return CUE_SURFACE.GUIDE_ONLY;
 return CUE_SURFACE.INLINE_RUBRIC;
}
const EXACT_SOURCE_ACTION_CAPTIONS=Object.freeze({
  "MINOR ELEVATION":Object.freeze(["The priest raises the Host and chalice slightly.","Le prêtre élève légèrement l’Hostie et le calice."]),
  "ELEVATES HOST AND CHALICE SLIGHTLY":Object.freeze(["The priest raises the Host and chalice slightly.","Le prêtre élève légèrement l’Hostie et le calice."]),
  "SHOWS SACRED HOST":Object.freeze(["The priest shows the sacred Host to the faithful.","Le prêtre présente la sainte Hostie aux fidèles."]),
  "BLESSES PEOPLE":Object.freeze(["The priest blesses the faithful.","Le prêtre bénit les fidèles."]),
  "MAKES ONE SIGN OF THE CROSS OVER THE PEOPLE":Object.freeze(["The priest blesses the faithful with the sign of the Cross.","Le prêtre bénit les fidèles d’un signe de croix."]),
  "SIGNS BOOK":Object.freeze(["The priest signs the Gospel book, forehead, lips and breast.","Le prêtre trace de petites croix sur l’Évangéliaire, le front, les lèvres et la poitrine."]),
  "SIGNS GOSPEL BOOK · FOREHEAD · LIPS · BREAST":Object.freeze(["The priest signs the Gospel book, forehead, lips and breast.","Le prêtre trace de petites croix sur l’Évangéliaire, le front, les lèvres et la poitrine."]),
  "KISSES GOSPEL":Object.freeze(["The priest kisses the Gospel book.","Le prêtre baise l’Évangéliaire."]),
  "BOWS HEAD":Object.freeze(["The priest bows his head.","Le prêtre incline la tête."]),
  "BOWS HEAD TO CROSS":Object.freeze(["The priest bows his head towards the Cross.","Le prêtre incline la tête vers la croix."]),
  "BOWS SLIGHTLY":Object.freeze(["The priest inclines slightly.","Le prêtre s’incline légèrement."]),
  "BOWS FOR SANCTUS":Object.freeze(["The priest inclines at the Sanctus.","Le prêtre s’incline au Sanctus."]),
  "BOWS OVER THE ALTAR":Object.freeze(["The priest inclines over the altar.","Le prêtre s’incline au-dessus de l’autel."]),
  "JOINS HANDS":Object.freeze(["The priest joins his hands.","Le prêtre joint les mains."]),
  "HANDS OVER OBLATIONS":Object.freeze(["The priest extends his hands over the offerings.","Le prêtre étend les mains sur les offrandes."]),
  "BOWS PROFOUNDLY":Object.freeze(["The priest bows profoundly.","Le prêtre s’incline profondément."]),
});
export function sourceActionRubricLabel(label,language="en"){
 const raw=String(label??"").trim().replace(/\s+/g," ");
 if(!raw||raw.length>95)return null;
 const approved=EXACT_SOURCE_ACTION_CAPTIONS[raw.toUpperCase()];
 if(approved)return approved[String(language).toLowerCase().startsWith("fr")?1:0];
 // Untranslated unfamiliar source actions stay verbatim rather than
 // acquiring a fabricated vernacular description.
 return raw;
}
