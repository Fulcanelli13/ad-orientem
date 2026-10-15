// Research-only bridge: one canonical identity across historic pilot records and
// official post-1960 intake rows. No new calendar engine or Mass selection.
export const SANCTORAL_RECONCILIATION_VERSION="ao-living-sanctoral-source-reconciliation-v1";

export function reconcileSaintPersonRecords(existingPersons,officialCensus) {
  if (!Array.isArray(existingPersons) || !Array.isArray(officialCensus?.persons))
    throw new TypeError("Expected existing person list and official census");
  const map=new Map();
  for(const person of existingPersons){
    if (!/^saint\.[a-z0-9-]+$/.test(person?.id||"")) throw new TypeError("Invalid canonical existing person ID");
    if (map.has(person.id)) throw new Error("Duplicate existing saint ID: "+person.id);
    map.set(person.id,Object.freeze({...person}));
  }
  const events=new Map((officialCensus.events||[]).map(e=>[e.id,e]));
  for(const person of officialCensus.persons){
    if(!/^saint\.[a-z0-9-]+$/.test(person?.id||""))throw new TypeError("Invalid official person ID");
    const event=events.get(person.canonizationEventId);
    if(!event || event.date!==person.canonizedOn || !event.namedIndividualIds?.includes(person.id))
      throw new Error("Canonization date/event source conflict for "+person.id);
    if(!person.sources?.includes(event.sourceUrl))throw new Error("Missing primary event source for "+person.id);
    const prior=map.get(person.id);
    if(prior){
      const date=prior.recognition?.canonizedOn;
      if(date && date!==person.canonizedOn)throw new Error("Canonization identity conflict: "+person.id);
      map.set(person.id,Object.freeze({
        ...prior,sourceReconciliation:Object.freeze({
          existingRecordKept:true,canonizationEventId:event.id,sourceUrl:event.sourceUrl
        })
      }));
      continue;
    }
    map.set(person.id,Object.freeze({
      id:person.id,name:Object.freeze({en:person.name,fr:person.name}),
      recognition:Object.freeze({rank:"SAINT",canonizedOn:person.canonizedOn,sourceUrls:Object.freeze([...person.sources])}),
      observances:Object.freeze([]),
      calendar1962:Object.freeze({principalId:null,identityStatus:"NOT_RECONCILED_WITH_1962_RESOLVER",protectedThirdClass:false}),
      laterTraditionalMass:Object.freeze({status:"UNIVERSAL_MEMORIAL_DATE_UNVERIFIED"}),
      ...(person.publicationHold ? {publicationHold:person.publicationHold,reviewFlags:Object.freeze([...(person.reviewFlags||[])])}:{}),
      sourceReconciliation:Object.freeze({existingRecordKept:false,canonizationEventId:event.id,sourceUrl:event.sourceUrl}),
    }));
  }
  // Group records are not individuals, therefore never loaded into this map.
  return Object.freeze([...map.values()]);
}
