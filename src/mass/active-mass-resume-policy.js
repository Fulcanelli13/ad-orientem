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
  // Grace applies only to a Mass from YESTERDAY within three hours
  // after local midnight, never to a refreshed checkpoint from days ago.
  const midnight=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const yesterday=new Date(midnight);
  yesterday.setDate(yesterday.getDate()-1);
  const yesterdayIso=[yesterday.getFullYear(),String(yesterday.getMonth()+1).padStart(2,"0"),String(yesterday.getDate()).padStart(2,"0")].join("-");
  if(date!==yesterdayIso || now.getTime()-midnight.getTime()>3*60*60*1000)return false;
  const last=[record.checkpointedAt,record.suspendedAt,
    record.updatedAt,record.storedAt]
    .map(value=>Date.parse(String(value??"")))
    .filter(Number.isFinite).reduce((max,value)=>Math.max(max,value),-Infinity);
  const age=now.getTime()-last;
  return age>=0&&age<=3*60*60*1000;
}
