// Dated, institute-scoped entry to the source-owned Mass resolver.
// The ICRSP France Ordo for 6 Nov 2026 indicates the votive Sacred Heart
// Mass (Cogitationes), III class, white, with Gloria and no Credo.
// Never change universal 1962 calendar identity or silently overwrite
// the user's other Mass choices.
export const ICRSP_2026_11_06_SACRED_HEART={
 date:"2026-11-06",
 id:"sacred_heart",
 path:"Votive/Pent02-5",
 basis:"first_friday",
 form:"LOW",
 gloria:true,credo:false,votiveClass:3,
 source:"https://icrspfrance.fr/ordo.php?d=2026-11-06#j2026-11-06"
};
export function selectIcrspFirstFridayLowMass({win=globalThis,dateIso}={}){
 const spec=ICRSP_2026_11_06_SACRED_HEART;
 const state=win?.AO_RUNTIME_V8?.store?.getState?.();
 if(dateIso!==spec.date||state?.selectedDate!==spec.date)
   return Object.freeze({ok:false,reason:"ICRSP_SOURCE_DATE_MISMATCH"});
 const catalogue=win?.AO_CELEBRATION_CATALOGUE;
 const def=catalogue?.[spec.id];
 if(def?.type!=="votive"||def?.path!==spec.path)
   return Object.freeze({ok:false,reason:"SACRED_HEART_PROPER_OWNER_MISMATCH"});
 const api=win?.AO_CELEBRATION_API;
 const bridge=win?.AO_R17_BROWSER_ENTRY;
 if(typeof api?.select!=="function"||typeof api?.setVotiveBasis!=="function"||
    typeof bridge?.selectTodayOption!=="function")
   return Object.freeze({ok:false,reason:"SOURCE_MASS_OWNER_UNAVAILABLE"});
 // The owner decides the exact Proper and performs source resolution.
 api.select(spec.id);
 const arch=win?.AO_CELEBRATION_ARCH_V1;
 if(arch?.actualCelebration?.id!==spec.id)
   return Object.freeze({ok:false,reason:"VOTIVE_SELECTION_NOT_ACCEPTED"});
 const rubric=api.setVotiveBasis(spec.basis);
 if(arch.votiveBasis!==spec.basis||rubric?.votiveClass!==spec.votiveClass||
    rubric?.gloria!==spec.gloria||rubric?.credo!==spec.credo||
    !["permitted","permittedWithChanges"].includes(rubric?.status))
   return Object.freeze({ok:false,reason:"FIRST_FRIDAY_RUBRICS_NOT_CONFIRMED",rubricStatus:rubric?.status??null});
 if(bridge.selectTodayOption("form",spec.form)!==true)
   return Object.freeze({ok:false,reason:"LOW_MASS_FORM_NOT_ACCEPTED"});
 return Object.freeze({ok:true,id:spec.id,path:spec.path,form:spec.form,
  gloria:rubric.gloria,credo:rubric.credo,votiveClass:rubric.votiveClass,
  // Selection is not readiness; start is still blocked until the host
  // has finished resolving and certified the source-backed Proper.
  ready:arch.readiness?.loading===false&&Boolean(arch.resolvedProper)});
}
