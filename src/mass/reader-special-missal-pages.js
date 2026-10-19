// Missal-only anticipation for already-source-owned special-rite stages.
// Never split, skip or synthesize ceremonial events; navigation remains in
// each rite's native controller. Omitted vernacular texts stay unclaimed.
const GLOBAL_SCOPES=new Set(["ALL","ALL_FAITHFUL","FAITHFUL","CONGREGATION"]);
const INDIVIDUAL=/RECIPIENT|SELECTED|PARTICIPANT_ONLY|MINISTER|PRIEST|DEACON|SUBDEACON/i;
const POSTURES=new Set(["STAND","SIT","KNEEL"]);

export function specialRiteNextPosture({current=null,next=null,mode="MISSAL",
  language="en",participating=false}={}){
  if(String(mode).toUpperCase()!=="MISSAL"||!next||next.personalOnly===true)return null;
  const scope=String(next.actorScope??"");
  if(INDIVIDUAL.test(scope))return null;
  const norm=value=>String(value?.posture??"").toUpperCase();
  const posture=norm(next),prior=norm(current);
  const processional=/^(PROCESSIONAL|PROCESSIONAL_STAND|STAND_WALK)$/.test(posture);
  const participate=processional && participating===true &&
    /FAITHFUL_PARTICIPATING|FAITHFUL_WITH_CANDLE_PARTICIPATING|ALL_FAITHFUL/.test(scope);
  if(!POSTURES.has(posture)&&!participate)return null;
  if(!GLOBAL_SCOPES.has(scope)&&!participate)return null;
  if(posture===prior)return null;
  const fr=String(language).toLowerCase().startsWith("fr");
  const labels=fr
    ?{STAND:"Debout",SIT:"Assis",KNEEL:"À genoux",PROCESSIONAL:"Suivre la procession"}
    :{STAND:"Stand",SIT:"Sit",KNEEL:"Kneel",PROCESSIONAL:"Join procession"};
  return Object.freeze({
    label:participate?labels.PROCESSIONAL:labels[posture],
    posture,sourceCardId:next.id??next.recordId??next.surfaceKey??null,
    actorScope:scope,owner:"SOURCE_OWNED_RITE_STAGE_PAGE_BOUNDARY",
    personal:false,observed:false,
  });
}

/** Update only the existing page-turn control; never move a reader clock. */
export function showSpecialRiteMissalPostureHint(host,hint,{language="en"}={}){
  const button=host?.querySelector?.('.ao-reader-nav button[data-reader-nav="next"]');
  if(!button)return false;
  const fr=String(language).toLowerCase().startsWith("fr");
  if(!hint){
    delete button.dataset.nextPosture;
    button.title="";
    button.setAttribute("aria-label",fr?"Page suivante":"Next page");
    return false;
  }
  button.dataset.nextPosture=hint.label;
  button.title=(fr?"Page suivante · ":"Next page · ")+hint.label;
  button.setAttribute("aria-label",button.title);
  return true;
}

/** A French Missal must never display an English line as its French column.
 * Several older rite payloads have only Latin; null is the honest fallback.
 */
export function specialRiteVernacular(row,{language="en"}={}){
  const french=String(language).toLowerCase().startsWith("fr");
  const source=french?(row?.french??row?.fr):(row?.vernacular??row?.english??row?.en);
  return typeof source==="string"&&source.trim()?source:null;
}
