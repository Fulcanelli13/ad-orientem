/**
 * Deterministic calendar-year capture queue, not an Office ordo.
 * A single batch is at most seven civil days = 168 language/hour sources.
 * Only an explicitly selected batch is generated. No automatic crawl.
 */
export const OFFICE_CAPTURE_PLAN_SCHEMA="ao.office.annual-capture-plan.v1";
export const OFFICE_CAPTURE_MAX_DAYS=7;
const dateKey=d=>d.toISOString().slice(0,10);
export function planAnnualOfficeCaptures({year,batchDays=7}={}){
  if(!Number.isInteger(year)||year<1900||year>2100||
     !Number.isInteger(batchDays)||batchDays<1||batchDays>OFFICE_CAPTURE_MAX_DAYS)
    throw Error("OFFICE_CAPTURE_PLAN_ARGUMENT_INVALID");
  const days=[];
  for(let d=new Date(Date.UTC(year,0,1));d.getUTCFullYear()===year;
    d.setUTCDate(d.getUTCDate()+1))days.push(dateKey(d));
  const batches=[];
  for(let i=0;i<days.length;i+=batchDays){
    const chunk=days.slice(i,i+batchDays);
    batches.push(Object.freeze({
      id:year+"-capture-"+String(batches.length+1).padStart(2,"0"),
      dates:Object.freeze(chunk),
      startDate:chunk[0],endDate:chunk.at(-1),
      plannedDocuments:chunk.length*8*3,selectedForExecution:false,
      sourceTextsReviewed:false,calendarPrecedenceVerified:false,
      sourceRightsApproved:false,published:0
    }));
  }
  const plan={
    schema:OFFICE_CAPTURE_PLAN_SCHEMA,year,
    source:"original pinned Roman Office composer (draft PR #1860)",
    dayCount:days.length,batchDays,
    batchCount:batches.length,plannedDocuments:days.length*24,
    noAutomaticExecution:true,publicReaderEnabled:false,published:0,
    batches
  };
  if(new Set(batches.flatMap(x=>x.dates)).size!==days.length||
      batches.reduce((s,b)=>s+b.plannedDocuments,0)!==plan.plannedDocuments)
    throw Error("OFFICE_CAPTURE_PLAN_COVERAGE_INVALID");
  return plan;
}
export function selectAnnualOfficeCaptureBatch(plan,startDate){
  if(plan?.schema!==OFFICE_CAPTURE_PLAN_SCHEMA||
     typeof startDate!=="string")throw Error("OFFICE_CAPTURE_BATCH_SELECT_INVALID");
  const batch=plan.batches.find(b=>b.startDate===startDate);
  if(!batch)throw Error("OFFICE_CAPTURE_BATCH_NOT_FOUND:"+startDate);
  return batch;
}
