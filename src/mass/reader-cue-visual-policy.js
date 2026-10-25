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
export function sourceActionRubricLabel(label,language="en"){
 const raw=String(label??"").trim().replace(/\s+/g," ");
 if(!raw||raw.length>95)return null;
 // Preserve actual source terminology rather than inventing a ceremony.
 const concise=raw.toLocaleLowerCase("en").replace(/^./,c=>c.toUpperCase());
 return String(language).toLowerCase().startsWith("fr")
   ?"Le prêtre : "+concise : "The priest: "+concise;
}
