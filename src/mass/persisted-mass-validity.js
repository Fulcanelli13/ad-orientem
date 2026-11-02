// Source of truth for R17 saved-Mass expiry: Home and reader must agree.
export function persistedMassIsResumable(record,now=new Date()) {
  if(!(record &&
    (record.state === "active" || record.state === "suspended") &&
    record.schema && record.session?.resolvedMass && record.readerPreferences))
    return false;
  // Today's session can be continued after a pause. A previous civil day's
  // Mass must NOT hijack the next day's Home/Propers, which caused a genuine
  // liturgical risk. Allow only a short crossing-midnight grace for Masses
  // actually spanning the civil boundary (e.g. Christmas midnight Mass).
  const date=String(record.session.resolvedMass.date??"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(now?.getTime?.()))
    return false;
  const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),
    String(now.getDate()).padStart(2,"0")].join("-");
  if(date===today)return true;
  if(date>today)return false;
  const last=[record.checkpointedAt,record.suspendedAt,
    record.updatedAt,record.storedAt]
    .map(value=>Date.parse(String(value??"")))
    .filter(Number.isFinite).reduce((max,value)=>Math.max(max,value),-Infinity);
  const age=now.getTime()-last;
  return age>=0&&age<=3*60*60*1000;
}
