// Audit-only presentation policy. This must never be used to gate liturgical
// source cues, faithful postures, priest actions, rubrics, or music events.
// Data authority: data/presentation/mass-icon-necessity-policy-20261019.v1.json
const TIERS=new Set(["ESSENTIAL","SELECTIVE","RUBRIC_ONLY"]);
const PENDING_ART=new Set(["GENERATE","NEEDS_DISTINCT_ART","ASSESS_OR_GENERATE","SUBJECT_VALID_REVIEW_CONTEXT"]);
const countValues=values=>Object.freeze(Object.fromEntries(["ESSENTIAL","SELECTIVE","RUBRIC_ONLY"].map(x=>[
  x,values.filter(y=>y===x).length,
])));

export function auditMassIconNecessity({policy,actions,positions}={}){
  const failures=[];
  if(policy?.schema!=="ao-mass-icon-necessity-policy-v1")failures.push("SCHEMA");
  const actionRows=actions?.items??[];
  const positionRows=positions?.items??[];
  const actionPolicy=policy?.priestActions??[];
  const stationPolicy=policy?.priestStations??[];
  const duplicates=rows=>{
    const values=rows.map(x=>x.label??x.station);
    return values.filter((x,i)=>values.indexOf(x)!==i);
  };
  if(duplicates(actionPolicy).length)failures.push("DUPLICATE_ACTION_POLICY");
  if(duplicates(stationPolicy).length)failures.push("DUPLICATE_STATION_POLICY");
  const a=new Map(actionPolicy.map(x=>[x.label,x]));
  const s=new Map(stationPolicy.map(x=>[x.station,x]));
  const missingActions=[...new Set(actionRows.map(x=>x.label).filter(x=>!a.has(x)))];
  const missingStations=[...new Set(positionRows.map(x=>x.station).filter(x=>!s.has(x)))];
  const unmatchedActions=[...a.keys()].filter(x=>!actionRows.some(row=>row.label===x));
  const unmatchedStations=[...s.keys()].filter(x=>!positionRows.some(row=>row.station===x));
  if(missingActions.length||unmatchedActions.length)failures.push("ACTION_COVERAGE");
  if(missingStations.length||unmatchedStations.length)failures.push("STATION_COVERAGE");
  for(const row of [...actionPolicy,...stationPolicy,...(policy?.faithfulPostureStates??[]),
    ...(policy?.faithfulGestureGuidance??[]),...(policy?.exceptions??[])]){
    if(!TIERS.has(row.treatment))failures.push("UNKNOWN_TIER:"+String(row.label??row.station??row.value??row.gesture));
  }
  const cueIndex=new Map(actionRows.map(x=>[x.cueId,x]));
  const exceptions=policy?.exceptions??[];
  const exceptionIndex=new Map;
  for(const exception of exceptions){
    if(exceptionIndex.has(exception.cueId))failures.push("DUPLICATE_EXCEPTION:"+exception.cueId);
    exceptionIndex.set(exception.cueId,exception);
    if(cueIndex.get(exception.cueId)?.label!==exception.label)failures.push("UNKNOWN_EXCEPTION:"+exception.cueId);
  }
  const boundActions=actionRows.map(x=>Object.freeze({
    cueId:x.cueId,label:x.label,treatment:exceptionIndex.get(x.cueId)?.treatment??a.get(x.label)?.treatment??null,
  }));
  const boundStations=positionRows.map(x=>Object.freeze({
    cueId:x.cueId,station:x.station,treatment:s.get(x.station)?.treatment??null,
  }));
  const essential=policy?.essentialArtInventory??[];
  const idSet=new Set;
  for(const item of essential){
    if(idSet.has(item.id))failures.push("DUPLICATE_ART_ID:"+item.id);
    idSet.add(item.id);
    if(item.owner==="PRIEST_ACTION" && a.get(item.label)?.treatment!=="ESSENTIAL")
      failures.push("ART_NOT_ESSENTIAL:"+item.id);
    if(item.owner==="PRIEST_STATION" && s.get(item.station)?.treatment!=="ESSENTIAL")
      failures.push("ART_NOT_ESSENTIAL:"+item.id);
    if(item.owner==="FAITHFUL_GESTURE" && !(policy?.faithfulGestureGuidance??[])
      .some(x=>x.gesture===item.gesture&&x.treatment==="ESSENTIAL"))
      failures.push("ART_NOT_ESSENTIAL:"+item.id);
  }
  const generateNow=policy?.generationPolicy?.immediateCandidates??[];
  const verifyFirst=policy?.generationPolicy?.firstVerifyBeforeGeneration??[];
  for(const id of [...generateNow,...verifyFirst]){
    const item=essential.find(x=>x.id===id);
    if(!item||!PENDING_ART.has(item.status))
      failures.push("INVALID_GENERATION_BACKLOG:"+id);
  }
  if([...new Set([...generateNow,...verifyFirst])].length!==generateNow.length+verifyFirst.length)
    failures.push("DUPLICATE_GENERATION_BACKLOG");
  return Object.freeze({
    ok:failures.length===0,
    failures:Object.freeze(failures),
    missingActions:Object.freeze(missingActions),
    missingStations:Object.freeze(missingStations),
    unmatchedActions:Object.freeze(unmatchedActions),
    unmatchedStations:Object.freeze(unmatchedStations),
    actionLabels:actionPolicy.length,
    actionCues:boundActions.length,
    actionLabelTiers:countValues(actionPolicy.map(x=>x.treatment)),
    actionCueTiers:countValues(boundActions.map(x=>x.treatment)),
    positionLabels:stationPolicy.length,
    positionCues:boundStations.length,
    positionLabelTiers:countValues(stationPolicy.map(x=>x.treatment)),
    positionCueTiers:countValues(boundStations.map(x=>x.treatment)),
    faithfulPostureStates:(policy?.faithfulPostureStates??[]).length,
    essentialArtRecords:essential.length,
    essentialArtPending:essential.filter(x=>PENDING_ART.has(x.status)).length,
    generateImmediately:Object.freeze([...generateNow]),
    verifyBeforeGeneration:Object.freeze([...verifyFirst]),
    boundActions:Object.freeze(boundActions),
    boundStations:Object.freeze(boundStations),
  });
}
