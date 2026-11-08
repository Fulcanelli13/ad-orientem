// Source-first 1962 Lateran Dedication commemoration CERTIFIER.
// The *canonical 1962 Proper resolver* already includes St Theodore's
// trilingual orations; the standard 1962 form selector admits them in LOW
// and omits them in nonconventual SUNG. Never insert a second copy.
//
// Source witnesses (independent of this application's reader):
// https://thedailymissal.com/2026/11/09
// https://icrspfrance.fr/textes-liturgiques.php?article=a0547_ancien
// The latter contains a transcription error: its Latin Postcommunion
// duplicates the Secret. The actual Postcommunion starts "Præsta nobis...".
// The ICRSP "pro Papa" is separately disputed; it is NOT a universal
// 1962 St Theodore commemoration or automatically authorized addition.
// RG §§111(c–d); RGMR §§434(c), 437.
export const NOV09_THEODORE_SOURCE=Object.freeze({
 date:"2026-11-09",
 principalPath:"Sancti/11-09",
 principalId:"sancti:11-09:2:w",
 commemorationId:"sancti:11-09cc:4:r",
 commemorationPath:"Sancti/11-09cc",
 sourceOrdo:"https://thedailymissal.com/2026/11/09",
 originalFrench:"https://icrspfrance.fr/textes-liturgiques.php?article=a0547_ancien",
 expectedIncipits:Object.freeze({
  collects:"Deus, qui nos beáti Theodóri Mártyris tui confessióne gloriósa",
  secrets:"Súscipe, Dómine, fidélium preces cum oblatiónibus hostiárum",
  postcommunions:"Præsta nobis, quǽsumus, Dómine: intercedénte beáto Theodóro"
 })
});
const FIELDS=["collects","secrets","postcommunions"];
const complete=row=>row&&["lat","en","fr"].every(k=>
 typeof row[k]==="string"&&row[k].trim().length>30);
const normalize=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/[æǽ]/g,"ae")
 .replace(/[œ]/g,"oe").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const refuse=(proper,reason)=>Object.freeze({status:"UNVERIFIED",reason,proper});
export function verify1962Nov09TheodoreSource({
 proper,date,form,calendarResolution,celebrationId="mass_of_day",
 observedSource=false,isConventual=false
}={}){
 if(date!==NOV09_THEODORE_SOURCE.date||
  !["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form)||
  observedSource||celebrationId!=="mass_of_day"||isConventual!==false)
  return Object.freeze({status:"NOT_APPLICABLE",proper});
 const main=calendarResolution?.day?.main;
 const data=proper?.data&&typeof proper.data==="object"?proper.data:proper;
 if(calendarResolution?.status!=="ready"||
   calendarResolution.date!==date||
   main?.rank!==2||main?.id!==NOV09_THEODORE_SOURCE.principalId||
   main?.path!==NOV09_THEODORE_SOURCE.principalPath||
   data?.sourcePath!==NOV09_THEODORE_SOURCE.principalPath)
  return refuse(proper,"LATERAN_1962_SOURCE_IDENTITY_CHANGED");
 const decision=data?.commemorationFormDecision;
 if(decision?.status!=="CERTIFIED"||
    decision.scope!=="NON_SUNDAY_II_III_CLASS_SINGLE_IV_CLASS_SANCTORAL_COMMEMORATION"||
    decision.mainId!==NOV09_THEODORE_SOURCE.principalId||
    decision.commemorationId!==NOV09_THEODORE_SOURCE.commemorationId||
    decision.calendarCount!==1||
    !calendarResolution.day.commemorations?.some(x=>
     x.id===NOV09_THEODORE_SOURCE.commemorationId&&
     x.path===NOV09_THEODORE_SOURCE.commemorationPath))
  return refuse(proper,"SOURCE_1962_THEODORE_FORM_DECISION_UNVERIFIED");
 if(form!=="LOW"){
  if(decision.appliedCount!==0||FIELDS.some(k=>
   !Array.isArray(data[k])||data[k].length!==1||!complete(data[k][0])))
   return refuse(proper,"NONCONVENTUAL_SUNG_THEODORE_OMISSION_CHANGED");
  return Object.freeze({status:"OMITTED_BY_1962_RUBRIC",proper});
 }
 if(decision.appliedCount!==1)
  return refuse(proper,"THEODORE_COMMEMORATION_NOT_ADMITTED_IN_LOW_MASS");
 for(const field of FIELDS){
  const rows=data[field];
  if(!Array.isArray(rows)||rows.length!==2||!rows.every(complete))
   return refuse(proper,"THEODORE_TWO_COMPLETE_ORATIONS_REQUIRED_"+field);
  if(!normalize(rows[1].lat).startsWith(
   normalize(NOV09_THEODORE_SOURCE.expectedIncipits[field])))
   return refuse(proper,"THEODORE_LATIN_SOURCE_CHANGED_"+field);
  if(/f[aá]mulum\s+tuum\s+N\./iu.test(rows[1].lat))
   return refuse(proper,"INSTITUTE_PRO_PAPA_LEAKED_INTO_GENERAL_"+field);
 }
 return Object.freeze({status:"CERTIFIED",proper,
  decision:Object.freeze({status:"INDEPENDENT_1962_SOURCE_MATCHED",
   date,form,source: NOV09_THEODORE_SOURCE.sourceOrdo,
   originalSourceUnchanged:true,
   groups:Object.freeze({collects:2,secrets:2,postcommunions:2}),
   instituteProPapaNotIncluded:true})});
}
