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

/**
 * Server-rendered/static equivalent for source-owned stage rails.
 * This represents navigation position, NOT completion of a spiritual act.
 */
export function devotionalProgressMarkup({index=0,total=0,language="en",unit="card"}={}){
 if(!Number.isInteger(total)||total<1)return "";
 const current=Math.max(0,Math.min(total-1,Number(index)||0));
 const fr=language==="fr",stage=unit==="stage";
 const label=fr?(stage?"Progression des étapes":"Progression des cartes"):
  (stage?"Stage progress":"Card progress");
 const valueText=fr?(stage?"Étape ":"Carte ")+(current+1)+" sur "+total:
  (stage?"Stage ":"Card ")+(current+1)+" of "+total;
 const percent=(current+1)/total*100;
 return '<div class="aoDevoProgress" role="progressbar" aria-label="'+label+
  '" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+(current+1)+
  '" aria-valuetext="'+valueText+'" style="--ao-devo-progress:'+percent+
  '%"><span class="aoDevoProgressFill" aria-hidden="true"></span></div>';
}
