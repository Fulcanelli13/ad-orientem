// Optional bedside sequence. All three stages remain directly selectable;
// progression changes only navigation, never prayer text or sacramental roles.
export const DYING_COMPANION_STAGES=Object.freeze(["now","pray","commend"]);

export function nextDyingCompanionStage(stage,direction){
  if(direction!=="previous"&&direction!=="next")return null;
  const index=DYING_COMPANION_STAGES.indexOf(String(stage??""));
  if(index<0)return null;
  const next=index+(direction==="next"?1:-1);
  return next>=0&&next<DYING_COMPANION_STAGES.length ? DYING_COMPANION_STAGES[next] : null;
}
