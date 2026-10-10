// Explicit, source-guarded *physical* ceremonies around a resolved 1962 Mass.
// A feast day does not, by itself, mean that a procession or aspersion occurred.
// The established canonical session engine still owns all text/event graphs.
const RITES=Object.freeze([
 Object.freeze({id:"ASPERGES",position:"precedingRites",en:"Sunday aspersion · Asperges / Vidi aquam",fr:"Aspersion dominicale · Asperges / Vidi aquam"}),
 Object.freeze({id:"REQUIEM_ABSOLUTION",position:"followingActions",en:"Absolution after Requiem",fr:"Absoute après le Requiem"}),
 Object.freeze({id:"CORPUS_CHRISTI_PROCESSION",position:"followingActions",en:"Corpus Christi Eucharistic procession",fr:"Procession eucharistique de la Fête-Dieu"}),
 Object.freeze({id:"GENERIC_PROCESSION",position:"followingActions",en:"Other source-identified procession",fr:"Autre procession identifiée par la source"})
]);
const normalize=x=>String(x??"").toUpperCase().replace(/[\s-]+/g,"_");
function sourceRites(legacy){
 const p=new Set(),f=new Set();
 for(const item of legacy?.insertedRites??[]){
  const raw=normalize(item);
  if(raw.includes("ASPERGES"))p.add("ASPERGES");
  if(raw.includes("REQUIEM")&&raw.includes("ABSOLUTION"))f.add("REQUIEM_ABSOLUTION");
  if(raw.includes("CORPUS")&&raw.includes("PROCESSION"))f.add("CORPUS_CHRISTI_PROCESSION");
  else if(raw.includes("PROCESSION"))f.add("GENERIC_PROCESSION");
 }
 return {precedingRites:p,followingActions:f};
}
function corpusResolved(legacy){
 const fields=[legacy?.calendarDay?.id,legacy?.calendarDay?.title,
  legacy?.calendarDay?.name,legacy?.celebrationId,
  legacy?.actualCelebration?.id,legacy?.actualCelebration?.title].join(" ");
 return /corpus[\s_-]*christi|f[êe]te[\s_-]*dieu/i.test(fields);
}
function sunday(iso){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso??"")))return false;
 const d=new Date(iso+"T12:00:00.000Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===iso&&d.getUTCDay()===0;
}
export function availableOptionalMassRites(legacy,{form="MISSA_CANTATA_INCENSE",kind="CALENDAR"}={}){
 const source=sourceRites(legacy),permitted=legacy?.canStart===true&&
  kind!=="GOOD_FRIDAY"&&kind!=="EASTER_VIGIL";
 const sung=form!=="LOW";
 const requiem=kind==="REQUIEM";
 const corpus=corpusResolved(legacy);
 return Object.freeze(RITES.map(rite=>{
   const fromSource=source[rite.position].has(rite.id);
   const allowed=permitted&&(
    rite.id==="ASPERGES"?(sunday(legacy?.date)&&sung):
    rite.id==="REQUIEM_ABSOLUTION"?requiem:
    rite.id==="CORPUS_CHRISTI_PROCESSION"?corpus:
    fromSource
   );
   return Object.freeze({...rite,allowed,fromSource});
 }));
}
export function composeOptionalMassRites(legacy,{form,kind,overrides={}}={},hostOptions={}){
 const before=hostOptions.precedingRites??[],after=hostOptions.followingActions??[];
 const precedingRites=new Set(before),followingActions=new Set(after);
 const available=availableOptionalMassRites(legacy,{form,kind});
 for(const rite of available){
  const choice=overrides[rite.id];
  if(choice===undefined||choice===null)continue;
  if(typeof choice!=="boolean")throw new Error("MASS_RITE_DECISION_INVALID_"+rite.id);
  if(!rite.allowed){
   if(choice)throw new Error("MASS_RITE_NOT_APPLICABLE_"+rite.id);
   continue;
  }
  const group=rite.position==="precedingRites"?precedingRites:followingActions;
  if(choice)group.add(rite.id);else group.delete(rite.id);
 }
 // No unrecognized keys may alter a plan.
 for(const key of Object.keys(overrides)){
  if(!RITES.some(r=>r.id===key))throw new Error("MASS_RITE_NOT_RECOGNIZED_"+key);
 }
 return Object.freeze({precedingRites:Object.freeze([...precedingRites]),
   followingActions:Object.freeze([...followingActions])});
}
