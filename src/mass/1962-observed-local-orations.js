// Explicitly observed, source-confirmed additional orations in a local Mass.
// This is NOT a new interpretation of the universal 1962 rubrics. The
// ordinary form selection remains authoritative and unchanged by default.
// Publication must identify these groups as observed local differences.
export const OBSERVABLE_ORATION_GROUPS=Object.freeze([
  "collects","secrets","postcommunions",
]);
const GROUPS=new Set(OBSERVABLE_ORATION_GROUPS);
const norm=x=>String(x??"").trim().toLowerCase();
const unwrap=proper=>proper?.data&&typeof proper.data==="object"
  ?{data:proper.data,envelope:proper}:{data:proper,envelope:null};
const complete=row=>row&&["lat","en","fr"].every(lang=>typeof row[lang]==="string"&&row[lang].trim().length>0);
function blocked(selected,reason){
  return Object.freeze({status:"UNVERIFIED",reason,proper:selected,decision:null});
}

/**
 * Produce a *presentation-only* Proper after the user records exactly which
 * further oration(s) were heard. The source must have full trilingual text
 * for both principal and named commemoration, with the 1962 selector itself
 * independently certifying the commemoration's normative omission.
 *
 * This is an opt-in preview, never a call to change or bypass the 1962 rule.
 * A missionary Collect joined under ONE conclusion remains untouched.
 */
export function projectObservedLocalOrations({
  originalProper,selectedProper,calendarResolution,
  form,commemorationId,observedGroups=[],confirmedAtMass=false,
}={}){
  if(confirmedAtMass!==true)return blocked(selectedProper,"NOT_ACTUALLY_CONFIRMED");
  if(!Array.isArray(observedGroups)||!observedGroups.length||
     new Set(observedGroups).size!==observedGroups.length||
     observedGroups.some(group=>!GROUPS.has(group)))
    return blocked(selectedProper,"UNKNOWN_ORATION_GROUPS");
  const {data:raw}=unwrap(originalProper),{data:selected,envelope}=unwrap(selectedProper);
  const day=calendarResolution?.day;
  const decision=selected?.commemorationFormDecision;
  const selectedForm=norm(form).toUpperCase();
  if(!["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(selectedForm)||
     decision?.status!=="CERTIFIED"||decision?.source!=="1962_PROPER_RESOLVER"||
     decision?.form!==selectedForm||decision?.appliedCount!==0||
     decision?.calendarCount!==1)
    return blocked(selectedProper,"NORMATIVE_SELECTION_NOT_VERIFIED");
  const omit=selected?.omittedCommemorations??[];
  const calendarComms=day?.commemorations??[];
  if(calendarResolution?.status!=="ready"||!calendarResolution?.date||
     calendarComms.length!==1||omit.length!==1||
     !norm(commemorationId)||norm(omit[0]?.id)!==norm(commemorationId)||
     norm(calendarComms[0]?.id)!==norm(commemorationId)||
     norm(decision.commemorationId)!==norm(commemorationId)||
     norm(raw?.sourcePath)!==norm(selected?.sourcePath)||
     norm(day?.main?.path)!==norm(raw?.sourcePath)||
     !(raw?.calendarCommemorations??[]).some(x=>norm(x.id)===norm(commemorationId)||
       norm(x.path)===norm(calendarComms[0]?.path)))
    return blocked(selectedProper,"SAME_DATE_SOURCE_IDENTITY_UNVERIFIED");
  if(!OBSERVABLE_ORATION_GROUPS.every(group=>
      Array.isArray(raw[group])&&raw[group].length===2&&raw[group].every(complete)&&
      Array.isArray(selected[group])&&selected[group].length===1&&selected[group].every(complete)))
    return blocked(selectedProper,"FULL_TRILINGUAL_ORATIONS_REQUIRED");
  // The primary Collect can differ from the raw Sunday text only if the
  // missionary prayer is source-certified as joined under ONE conclusion.
  const missionary=selected.missionSundayCollectDecision?.status==="CERTIFIED";
  if(!OBSERVABLE_ORATION_GROUPS.every(group=>
    group==="collects"&&missionary?true:
      ["lat","en","fr"].every(lang=>raw[group][0][lang]===selected[group][0][lang])))
    return blocked(selectedProper,"PRIMARY_ORATION_SOURCE_CHANGED");
  const updated={...selected};
  for(const group of observedGroups)
    updated[group]=Object.freeze([selected[group][0],raw[group][1]]);
  const localDecision=Object.freeze({
    status:"OBSERVED_LOCAL_NOT_1962_NORMATIVE",
    source:"EXPLICIT_ATTENDEE_OBSERVATION_AND_SAME_DATE_1962_PROPER",
    date:calendarResolution.date,form:selectedForm,
    commemorationId:String(commemorationId),
    groupNames:Object.freeze([...observedGroups]),
    normativeDecision:decision.status,
    rubricalAuthorityUnchanged:true,
    sourcePath:raw.sourcePath,
  });
  updated.observedLocalOrationDecision=localDecision;
  // Do NOT alter appliedCommemorations, omittedCommemorations or the source
  // certification. Those describe normative form rules, not local hearing.
  const proper=Object.freeze(updated);
  return Object.freeze({
    status:"OBSERVED_LOCAL_NOT_1962_NORMATIVE",
    reason:null,decision:localDecision,
    proper:envelope?Object.freeze({...envelope,data:proper}):proper,
  });
}
