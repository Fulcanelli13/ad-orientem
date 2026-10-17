/**
 * Read-only preflight handoff for study. No discovery, no resolution, no
 * independent permissions or rubrical decisions. Source is the host's
 * CURRENT explicitly selected Mass (including observed source-day choices).
 */
export const MASS_EXPLORER_PREFLIGHT_PROPER_SELECTION="ao-mass-explorer-preflight-proper-selection-v1";
const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value??""));
const types=new Set(["VOTIVE","REQUIEM","NUPTIAL","SPECIAL_FORMULARY"]);
const sungForms=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const ready=value=>["READY","CACHED"].includes(String(value??"").toUpperCase());
const properOf=value=>value?.data&&typeof value.data==="object"?value.data:value;
const titleFor=(legacy,p)=>String(legacy?.actualCelebration?.title||
 legacy?.celebrationTitle||p?.name||"").trim();
const hold=(reason,identity)=>Object.freeze({
 schema:MASS_EXPLORER_PREFLIGHT_PROPER_SELECTION,
 selection:"EXPLICIT_ALTERNATE_MASS",
 ready:false,reason,
 identity:identity??null
});
/**
 * null means no alternate choice: the existing selected Calendar day projection
 * remains authoritative. Any NON-NULL result blocks Calendar fallback, even
 * when alternate-source identity or completeness is not ready.
 */
export function selectedPreflightStudyProper({
 base=null,observedSelection=null,observedStatus=null,observedGate=null,
 formSelection=null,selectedCalendarDate=null,assemblyStatus=null
}={}){
 const observed=observedSelection?.schema==="ao-observed-mass-selection-v1"?
   observedSelection:null;
 const pendingObserved=Boolean(observedStatus?.sourceDate&&!observed);
 const type=String(base?.celebrationType??"").toUpperCase().replace(/[- ]+/g,"_");
 const ids=[base?.celebrationId,base?.requestedCelebrationId]
   .map(x=>String(x??"").trim().toLowerCase()).filter(Boolean);
 const explicit=Boolean(observed||pendingObserved||types.has(type)||
   ids.some(id=>id!=="mass_of_day"&&id!=="calendar"));
 if(!explicit)return null;
 const identity=observed?"OBSERVED_SOURCE_DAY":type||"ALTERNATE_MASS";
 if(pendingObserved||observedGate?.ready===false)
   return hold("OBSERVED_SOURCE_SELECTION_UNCONFIRMED",identity);
 if(!base||base.canStart!==true||assemblyStatus?.ok===false)
   return hold("HOST_MASS_NOT_READY",identity);
 if(!date(base.date)||base.date!==selectedCalendarDate)
   return hold("MASS_DATE_NOT_SELECTED_CALENDAR_DATE",identity);
 if(!formSelection||!sungForms.has(formSelection.form))
   return hold("NOT_AN_EXPLICIT_SUNG_MASS",identity);
 const selected=observed?.legacy??base;
 if(selected.date!==base.date)return hold("STALE_SELECTED_MASS",identity);
 if(observed&&(
   observed.massDate!==base.date||
   observed.sourcePath!==selected.properSource||
   observed.proper!==selected.proper||
   observed.sourceOwned!==true
 ))return hold("OBSERVED_SOURCE_NOT_OWNED",identity);
 const properEnvelope=selected.proper;
 const proper=properOf(properEnvelope);
 const sourcePath=String(proper?.sourcePath??"").trim();
 const claimedPath=String(selected.properSource??properEnvelope?.sourcePath??"").trim();
 if(!ready(properEnvelope?.status)||!sourcePath||!claimedPath||
   sourcePath!==claimedPath)
   return hold("SELECTED_PROPER_SOURCE_INCOMPLETE",identity);
 if(!types.has(String(selected.celebrationType??"").toUpperCase().replace(/[- ]+/g,"_")))
   return hold("SELECTED_ALTERNATE_CELEBRATION_MISMATCH",identity);
 if(String(selected.exceptionalProfile??selected.distinctRite??"").match(
   /GOOD.?FRIDAY|EASTER.?VIGIL/i))
   return hold("DISTINCT_RITE_NOT_AN_ORDINARY_MASS",identity);
 if(observed&&selected.sourceDiagnostics?.actualMassSelection!=="OBSERVED_SOURCE_DAY")
   return hold("OBSERVED_SOURCE_DIAGNOSTICS_MISSING",identity);
 const name=titleFor(selected,proper);
 if(!name)return hold("SELECTED_CELEBRATION_TITLE_MISSING",identity);
 return Object.freeze({
  schema:MASS_EXPLORER_PREFLIGHT_PROPER_SELECTION,
  selection:"EXPLICIT_ALTERNATE_MASS",
  ready:true,
  identity,proper,
  date:base.date,
  sourceDate:observed?.sourceDate??null,
  sourcePath,title:name,
  form:formSelection.form,
  rubricalPermission:observed?.permissionStatus??"NOT_ASSERTED_BY_STUDY_VIEW",
  isObservedSource:Boolean(observed)
 });
}
