/**
 * Shared, presentation-only progress indicator for finite devotional cards.
 * Index is supplied by the canonical reader; no independent progression state.
 */
export const DEVOTIONAL_PROGRESS_VERSION="card-progress-v1";

export function updateDevotionalProgress(timeline,{index=0,total=0,language="en"}={}){
 if(!timeline||!Number.isInteger(total)||total<1)return null;
 const current=Math.max(0,Math.min(total-1,Number(index)||0));
 let bar=timeline.querySelector(":scope > .aoDevoProgress");
 if(!bar){
  bar=timeline.ownerDocument.createElement("div");
  bar.className="aoDevoProgress";
  bar.setAttribute("role","progressbar");
  const fill=timeline.ownerDocument.createElement("span");
  fill.className="aoDevoProgressFill";
  fill.setAttribute("aria-hidden","true");
  bar.append(fill);
  timeline.append(bar);
 }
 bar.style.setProperty("--ao-devo-progress",((current+1)/total*100)+"%");
 bar.setAttribute("aria-label",language==="fr"?"Progression des cartes":"Card progress");
 bar.setAttribute("aria-valuemin","0");
 bar.setAttribute("aria-valuemax",String(total));
 bar.setAttribute("aria-valuenow",String(current+1));
 bar.setAttribute("aria-valuetext",language==="fr"?
  "Carte "+(current+1)+" sur "+total:"Card "+(current+1)+" of "+total);
 return bar;
}
