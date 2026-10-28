/**
 * Shared, source-neutral prayer-purpose classifier.
 * A purpose is not a historical edition; related complete prayers are
 * choices within a devotional purpose, never interchangeable paragraphs.
 * Callers retain sole ownership of full text, provenance and stage order.
 */
export function createPrayerPurposeIndex(definitions,sourceIdsByPhase){
 const result={};
 for(const phase of Object.keys(sourceIdsByPhase||{})){
  const sourceIds=sourceIdsByPhase[phase];
  const groups=definitions?.[phase];
  if(!Array.isArray(sourceIds)||!Array.isArray(groups)||!groups.length)throw new Error("Missing prayer-purpose source phase: "+phase);
  const sourceSet=new Set(sourceIds),used=new Set(),named=new Set();
  if(sourceSet.size!==sourceIds.length)throw new Error("Duplicate source prayer ID: "+phase);
  result[phase]=Object.freeze(groups.map(group=>{
   if(!group?.id||named.has(group.id)||!Array.isArray(group.ids)||!group.ids.length)
    throw new Error("Invalid or duplicate purpose ID: "+phase);
   named.add(group.id);
   const ids=group.ids.map(id=>{
    if(!sourceSet.has(id)||used.has(id))throw new Error("Unknown or repeated purpose prayer: "+id);
    used.add(id);return id;
   });
   if(!["distinct","alternatives"].includes(group.relationship))
    throw new Error("Purpose relationship must distinguish different acts from alternative prayers");
   return Object.freeze({...group,ids:Object.freeze(ids)});
  }));
  if(used.size!==sourceSet.size)throw new Error("A source prayer is not classified: "+phase);
 }
 return Object.freeze(result);
}
export function prayerPurposeFor(index,phase,sourceId){
 return (index?.[phase]||[]).find(group=>group.ids.includes(sourceId))||null;
}
export function prayerPurposeDefault(index,phase,purposeId){
 return index?.[phase]?.find(group=>group.id===purposeId)?.ids[0]||null;
}
export function normalizePrayerPurposeSelection(index,raw){
 const result={};
 for(const phase of Object.keys(index||{})){
  result[phase]={};
  for(const group of index[phase]){
   const id=raw?.[phase]?.[group.id];
   if(typeof id==="string"&&group.ids.includes(id))result[phase][group.id]=id;
  }
 }
 return result;
}
